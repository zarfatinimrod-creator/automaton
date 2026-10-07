import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import {
  checkLiveness,
  findStuckGoals,
  isDue,
  LOOP_GAP_ALERT_MS,
  markRan,
  renderCommitSummary,
  heldSecretRowsNote,
  renderReport,
  SILENT_LINE_ALERT_DAYS,
  tick,
  TASK_ORDER,
} from "../../revenue/runner.js";
import {
  NO_SETUP_ITEM_ASKED,
  OWNER_STEPS,
  isOwnerStepOpen,
  ownerStepById,
  ownerStepsForLine,
  secretRowsPastedBeforeMade,
  type OwnerStepId,
} from "../../revenue/owner-steps.js";
import { renderDashboard } from "../../revenue/dashboard.js";
import { getLine, listLines, recordKpi, recordLedgerEntry, setHumanSetupDone, setRevenueColonyEnabled, updateLineStatus } from "../../revenue/ledger.js";
import { LAST_AUDIT_KEY, LAST_LEDGER_SYNC_KEY, REVENUE_TASK_INTERVALS_MS, lastAudit } from "../../revenue/heartbeat.js";
import { getActiveGoals } from "../../state/database.js";
import { DEFAULT_PORTFOLIO, portfolioTargetAgorot, seedDefaultPortfolio, summarizeTargetBasis, syncPortfolio } from "../../revenue/portfolio.js";
import { readSite } from "../../revenue/page-views-reader.js";

const HOUR = 3_600_000;

describe("revenue/runner interval gating", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  it("treats a task never run as due", () => {
    for (const task of TASK_ORDER) expect(isDue(db, task, Date.now())).toBe(true);
  });

  it("blocks a task until its own interval has elapsed", () => {
    const t0 = Date.parse("2026-09-03T00:00:00.000Z");
    markRan(db, "revenue_board_review", t0);
    expect(isDue(db, "revenue_board_review", t0 + HOUR)).toBe(false);
    expect(isDue(db, "revenue_board_review", t0 + REVENUE_TASK_INTERVALS_MS.revenue_board_review - 1)).toBe(false);
    expect(isDue(db, "revenue_board_review", t0 + REVENUE_TASK_INTERVALS_MS.revenue_board_review)).toBe(true);
  });

  it("gates each task independently, so an hourly schedule does not run the daily review 24 times", () => {
    const t0 = Date.parse("2026-09-03T00:00:00.000Z");
    for (const task of TASK_ORDER) markRan(db, task, t0);
    const anHourLater = t0 + HOUR;
    expect(isDue(db, "revenue_ledger_sync", anHourLater)).toBe(true);
    expect(isDue(db, "revenue_supervisor_review", anHourLater)).toBe(false);
    expect(isDue(db, "revenue_board_review", anHourLater)).toBe(false);
    expect(isDue(db, "revenue_audit", anHourLater)).toBe(false);
  });
});

describe("revenue/runner tick", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  it("seeds the portfolio on the first tick and runs every task", async () => {
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    expect(result.enabled).toBe(true);
    expect(result.ran).toEqual(TASK_ORDER);
    expect(result.skipped).toEqual([]);
    expect(listLines(db)).toHaveLength(DEFAULT_PORTFOLIO.length);
    expect(result.summary?.targetMonthlyAgorot).toBe(2_000_000);
  });

  it("runs nothing on an immediate second tick", async () => {
    await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const second = await tick(db, { nowIso: "2026-09-03T00:10:00.000Z" });
    expect(second.ran).toEqual([]);
    expect(second.skipped).toEqual(TASK_ORDER);
  });

  it("runs everything again when forced", async () => {
    await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const forced = await tick(db, { nowIso: "2026-09-03T00:10:00.000Z", force: true });
    expect(forced.ran).toEqual(TASK_ORDER);
  });

  it("reports every line still waiting on the owner as a blocker", async () => {
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const waiting = DEFAULT_PORTFOLIO.filter((l) => l.humanSetup.length > 0);
    expect(waiting.length).toBeGreaterThan(0);
    for (const line of waiting) {
      expect(result.blockers.some((b) => b.startsWith(`${line.id} is waiting on the owner`))).toBe(true);
    }
  });

  it("does not file a goal when feedGoals is false", async () => {
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z", feedGoals: false });
    expect(getActiveGoals(db)).toHaveLength(0);
    expect(result.board?.actions.some((a) => a.includes("goal filing disabled"))).toBe(true);
  });

  it("files no goal while every line is blocked on the owner", async () => {
    // Changed by the board decision of 7.9.2026. `agent-services` used to be the
    // one line needing no owner setup, so the first tick always filed its build
    // goal; it is killed, and all four survivors are blocked on the checklist —
    // apify-actors on the token, the rest on Gumroad, the domain and the org.
    // So the honest state of a fresh colony is: nothing to build until the owner
    // does step 1. That must be visible as a blocker, not as silence.
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z", feedGoals: true });
    expect(getActiveGoals(db)).toHaveLength(0);
    expect(result.blockers.length).toBe(DEFAULT_PORTFOLIO.length);

    // And it starts the moment he confirms one.
    setHumanSetupDone(db, "oss-bounties", true);
    const after = await tick(db, { nowIso: "2026-09-04T02:00:00.000Z", force: true, feedGoals: true });
    expect(getActiveGoals(db)).toHaveLength(1);
    expect(after.board?.goalFiled?.lineId).toBe("oss-bounties");
  });

  it("counts real money and moves the line to live", async () => {
    await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    updateLineStatus(db, "oss-bounties", "building", { force: true });
    recordLedgerEntry(db, {
      lineId: "oss-bounties", kind: "sale", amountMinor: 45_000,
      currency: "ILS", source: "stripe", externalId: "0xabc",
      occurredAt: "2026-09-03T01:00:00.000Z",
    });
    expect(getLine(db, "oss-bounties")?.status).toBe("live");

    const later = await tick(db, { nowIso: "2026-09-04T02:00:00.000Z" });
    expect(later.summary?.total30dAgorot).toBe(45_000);
    expect(later.summary?.attainment).toBeCloseTo(45_000 / 2_000_000, 6);
  });

  it("does nothing at all when the colony is disabled", async () => {
    setRevenueColonyEnabled(db, false);
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    expect(result.enabled).toBe(false);
    expect(result.ran).toEqual([]);
    expect(listLines(db)).toHaveLength(0);
    expect(result.blockers[0]).toContain("disabled");
  });
});

describe("revenue/runner stuck-goal detection", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  it("stays quiet while a fresh goal is waiting", async () => {
    await tick(db, { nowIso: "2026-09-03T00:00:00.000Z", feedGoals: true });
    expect(findStuckGoals(db, Date.parse("2026-09-03T06:00:00.000Z"))).toEqual([]);
  });

  it("flags a goal that no orchestrator ever decomposed", async () => {
    await tick(db, { nowIso: "2026-09-03T00:00:00.000Z", feedGoals: false });
    setHumanSetupDone(db, "oss-bounties", true);
    await tick(db, { nowIso: "2026-09-03T00:00:00.000Z", force: true, feedGoals: true });
    const goal = getActiveGoals(db)[0];
    db.prepare("UPDATE goals SET created_at = ? WHERE id = ?")
      .run("2026-08-20T00:00:00.000Z", goal.id);

    const stuck = findStuckGoals(db, Date.parse("2026-09-03T00:00:00.000Z"));
    expect(stuck).toHaveLength(1);
    expect(stuck[0].goalId).toBe(goal.id);
    expect(stuck[0].lineId).not.toBeNull();
    expect(stuck[0].ageDays).toBeGreaterThan(13);

    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z", force: true, feedGoals: false });
    expect(result.blockers.some((b) => b.includes("with no executor"))).toBe(true);
  });

  it("says nothing once a planner has decomposed the goal", async () => {
    await tick(db, { nowIso: "2026-09-03T00:00:00.000Z", feedGoals: false });
    setHumanSetupDone(db, "oss-bounties", true);
    await tick(db, { nowIso: "2026-09-03T00:00:00.000Z", force: true, feedGoals: true });
    const goal = getActiveGoals(db)[0];
    db.prepare("UPDATE goals SET created_at = ? WHERE id = ?").run("2026-08-20T00:00:00.000Z", goal.id);
    db.prepare(
      `INSERT INTO task_graph (id, goal_id, title, description, status, priority, dependencies, created_at)
       VALUES ('t1', ?, 'Ship it', 'A planner picked this up', 'pending', 50, '[]', '2026-08-21T00:00:00.000Z')`,
    ).run(goal.id);
    expect(findStuckGoals(db, Date.parse("2026-09-03T00:00:00.000Z"))).toEqual([]);
  });
});

describe("revenue/runner report rendering", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  it("renders the money, the lines and the owner's outstanding steps", async () => {
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const report = renderReport(db, result);

    expect(report).toContain("# Revenue colony — board report");
    expect(report).toContain("₪20,000.00");
    expect(report).toContain("| `apify-actors` |");
    expect(report).toContain("What the owner has to do");
    expect(report).toContain("colony.ts setup-done");
    expect(report).toContain("Projections are never counted");
  });

  it("prints each contested upper bound beside the committed target, never inside the sum (RULING-2026-09-28-floors.md §9)", async () => {
    // "The ₪400 does not vanish: it is recorded where the board already records a larger figure it refused to commit
    // to, and the report prints it beside the ₪0."
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const report = renderReport(db, result);
    // Since RULING-2026-09-29-lines.md (b) Apify is planned at ₪0 too, with ₪200 contested; the refused ₪1,500 is kept in
    // the basis text and must not be printed as the line's upper bound.
    expect(report).toContain("| Line targets, summed | ₪900 against");
    expect(report).toMatch(/Contested upper bounds, not targets and not in the sum: `apify-actors` ₪200 \(target ₪0\), `il-biz-tools` ₪400 \(target ₪0\)\./);
    expect(report).not.toMatch(/`apify-actors` ₪1,500/);
  });

  it("prints the Apify stranger count with its biased-low label, read or not (research/breadth/BOARD.md Q5)", async () => {
    const label = "stranger runs — biased low while the developer is unverified: hidden from default Store-API search";
    let report = renderReport(db, await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" }));
    expect(report).toContain(`- \`apify-actors\` strangerUsers30d: no reading yet — ${label}.`);
    expect(report).toMatch(/under 10 is TEST_MORE \(hidden or unwanted, indistinguishable\)/);
    // With a reading, the value is printed and the label stays beside it.
    recordKpi(db, "apify-actors", "strangerUsers30d", 3, "users");
    report = renderReport(db, await tick(db, { nowIso: "2026-09-03T01:00:00.000Z" }));
    expect(report).toContain(`- \`apify-actors\` strangerUsers30d: 3 users — ${label}.`);
  });

  it("lists each waiting line's open owner steps from the checklist itself, step 2 included", async () => {
    // The bug: every line's list came from portfolio.ts humanSetup alone, which leaves
    // out the steps shared by all lines — so owner step 2 (the tax file) appeared
    // nowhere in the report, and pcn874/oss-bounties lost steps 5 and 6.
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const report = renderReport(db, result);
    for (const line of listLines(db).filter((l) => l.status === "awaiting_setup")) {
      const open = ownerStepsForLine(line.id).filter(isOwnerStepOpen).map((s) => s.number);
      expect(open.length, `${line.id} has no open owner step`).toBeGreaterThan(0);
      expect(report).toContain(`Owner steps still open for \`${line.id}\` (docs/OWNER_STEPS.he.md): ${open.join(", ")}`);
      // Step 2 gates every line and is still named on every line — held, not dropped.
      const row = report.split("\n").find((l) => l.startsWith(`Owner steps still open for \`${line.id}\``))!;
      expect(row, `${line.id} lost step 2 from its row`).toMatch(/\bstep 2 /);
    }
    expect(report).toMatch(/Owner steps still open for `pcn874`[^\n]*: 3, 7, 6 \(not asked now: /);
    // a step recorded as done is not asked for again
    const done = OWNER_STEPS.filter((s) => s.doneOn).map((s) => s.number);
    expect(done).toContain(1);
    expect(report).not.toMatch(/Owner steps still open for `[^`]+` \(docs\/OWNER_STEPS\.he\.md\): 1,/);
  });

  it("names the frozen domain step as frozen, never as something for the owner to do", async () => {
    // The owner's ₪0 rule of 27.9.2026 froze step 5 (the only step that costs
    // money). It still gates il-biz-tools and pcn874, so the report says so —
    // but outside the list of steps being asked for, and no checklist line
    // tells the owner to buy a domain.
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const report = renderReport(db, result);
    for (const id of ["il-biz-tools", "pcn874"]) {
      const line = report.split("\n").find((l) => l.startsWith(`Owner steps still open for \`${id}\``))!;
      expect(line, `${id} has no open-steps line`).toBeTruthy();
      const [asked, notAsked] = line.split(" (not asked now: ");
      expect(asked).not.toMatch(/\b5\b/);
      expect(notAsked).toMatch(/(^|; )step 5 frozen by the owner's ₪0 rule of 27\.9\.2026\)$/);
    }
    expect(report).not.toMatch(/- \[ \] Buy the company domain/);
    expect(result.blockers.find((b) => b.startsWith("pcn874 is waiting on the owner")))
      .toMatch(/not asked now: [^)]*step 5 frozen/);
    // Lines the domain never gated carry no frozen note.
    expect(report).not.toMatch(/Owner steps still open for `apify-actors`[^\n]*frozen/);
  });

  it("does not ask for step 2 before a paid product is ready and the official cost check is done", async () => {
    // The fail-open: step 2's precondition was prose the report never read, so
    // the hourly report asked for step 2 FIRST on every line ("steps 2, 6",
    // "steps 2, 3, 6", …). A ₪0-rule owner following it could open the file and
    // start recurring payments before the colony checked whether registering
    // costs anything. Step 2 still gates every line, so it is named — outside
    // the asked-now list, with its precondition, in both places it appears.
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const report = renderReport(db, result);
    const held = "step 2 only when a paid product is ready, after the official cost check";
    const waiting = listLines(db).filter((l) => l.status === "awaiting_setup" && !l.humanSetupDone);
    expect(waiting.length).toBeGreaterThan(0);
    for (const line of waiting) {
      const row = report.split("\n").find((l) => l.startsWith(`Owner steps still open for \`${line.id}\``))!;
      const blocker = result.blockers.find((b) => b.startsWith(`${line.id} is waiting on the owner`))!;
      expect(row, `${line.id} has no open-steps line`).toBeTruthy();
      expect(blocker, `${line.id} has no blocker line`).toBeTruthy();

      const askedRow = row.split(" (not asked now: ")[0].split("): ")[1];
      expect(askedRow.split(", "), `${line.id} report row asks for step 2`).not.toContain("2");
      expect(row, `${line.id} report row does not name the held step`).toContain(`(not asked now: ${held}`);

      const askedBlocker = blocker.split(" of docs/OWNER_STEPS.he.md")[0].split("steps ")[1];
      expect(askedBlocker.split(", "), `${line.id} blocker asks for step 2`).not.toContain("2");
      expect(blocker, `${line.id} blocker does not name the held step`).toContain(`(not asked now: ${held}`);
    }
    // The four lines as the reviewer read them on the real database.
    expect(result.blockers.find((b) => b.startsWith("apify-actors is waiting")))
      .toMatch(/^apify-actors is waiting on the owner: steps 6 of docs\/OWNER_STEPS\.he\.md \(not asked now: step 2 only/);
    // Step 8, the brand mailbox, is asked now and comes first for il-biz-tools (research/breadth/BOARD.md Q2, 28.9.2026).
    expect(report).toMatch(/Owner steps still open for `il-biz-tools`[^\n]*: 8, 3, 6 \(not asked now: step 2 only when a paid product is ready, after the official cost check; step 5 frozen by the owner's ₪0 rule of 27\.9\.2026\)/);
    expect(report).toMatch(/Owner steps still open for `pcn874`[^\n]*: 3, 7, 6 \(not asked now: step 2 [^;]+; step 5 frozen/);
    // Step 4 is held since 28.9.2026 and is 4b alone: the Stripe form, which begins with the Algora sign-in, waits for
    // the corrected week-4 count and a held reward; 4a was dropped (research/breadth/BOARD.md Part B(b)).
    expect(report).toMatch(/Owner steps still open for `oss-bounties`[^\n]*: 7, 6 \(not asked now: step 2 [^;)]+; step 4 Stripe form 4b, asked only after [^;)]+ — the form begins with the Algora sign-in\)$/m);
    expect(report).not.toMatch(/\b4a\b/);
    expect(report).not.toMatch(/step 4 4b/); // the step number printed twice read as a typo (review of 28.9.2026, finding 9)
  });

  it("asks for step 2 once the colony records its precondition met", async () => {
    // metOn is the switch: set it (with evidence) and the report asks again.
    const tax = ownerStepById("tax-file")!;
    const saved = tax.precondition!;
    tax.precondition = { ...saved, metOn: { date: "2026-10-01", evidence: "test only" } };
    try {
      const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
      const report = renderReport(db, result);
      expect(report).toMatch(/Owner steps still open for `apify-actors` \(docs\/OWNER_STEPS\.he\.md\): 2, 6$/m);
      expect(report).not.toContain("after the official cost check");
    } finally {
      tax.precondition = saved;
    }
    expect(ownerStepById("tax-file")!.precondition!.metOn).toBeUndefined();
  });

  it("holds step 6's POSTHOG_READ_KEY row until the brand's PostHog project exists (ruling 30.9 documents (c))", async () => {
    // The gate in owner-steps.ts is read by the report: while posthog.projectId in site.json is empty the row is named
    // on its own line with its reason, never as something to do; once the colony writes the id, the line goes and
    // step 6 is asked with the row.
    const held = "step 6's `POSTHOG_READ_KEY` row waits until the colony has created the brand's PostHog project";
    expect(heldSecretRowsNote(["il-biz-tools"], { projectId: "" })).toContain(held);
    expect(heldSecretRowsNote(["il-biz-tools"], { projectId: "" })).toMatch(/^Not asked yet: /);
    expect(heldSecretRowsNote(["il-biz-tools"], { projectId: "12345" })).toBe("");
    // Step 6 gates all four lines and is named once for them (tick 32).
    expect(heldSecretRowsNote(DEFAULT_PORTFOLIO.map((l) => l.id), { projectId: "" })).toBe(
      heldSecretRowsNote(["il-biz-tools"], { projectId: "" }),
    );
    // A line with no asked-now step that has gated rows carries no note.
    expect(OWNER_STEPS.filter((s) => s.secrets?.some((r) => r.askedOnlyWhen)).map((s) => s.id)).toEqual(["ci-tokens"]);

    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const report = renderReport(db, result);
    const lines = report.split("\n");
    const row = lines.findIndex((l) => l.startsWith("Owner steps still open for `il-biz-tools`"));
    expect(row).toBeGreaterThan(-1);
    // The report reads the real site.json, as the page-view reader does. Since tick 32 the note is printed once, at the
    // head of the owner's section, not under each line's row.
    const heading = lines.indexOf("## What the owner has to do (one time, per line)");
    if (readSite().projectId === "") expect(lines[heading + 2]).toContain(held);
    else expect(report).not.toContain("POSTHOG_READ_KEY");
    // The row line itself is unchanged: the asked-now list and its not-asked note.
    expect(lines[row]).not.toContain("POSTHOG_READ_KEY");
    expect(lines[row + 1]).not.toContain("POSTHOG_READ_KEY");
  });

  it("asks step 6's POSTHOG_READ_KEY row alone, once, when step 6 was done before the project existed", async () => {
    // Open from the tick-26 builds (logs/CHANNEL_LOOP.md §9): heldSecretRowsNote reads open steps only, so a step 6
    // marked done while the row was held took the row with it, and the key surfaced only as a blocker once a page-view
    // clock ran. The row is now asked on its own, once per report — not the rest of step 6, and not once per line.
    const step6 = ownerStepById("ci-tokens")!;
    const key = step6.secrets!.find((r) => r.name === "POSTHOG_READ_KEY")!;
    const saved = step6.doneOn;
    const count = (text: string, needle: string) => text.split(needle).length - 1;
    const askedNow = (report: string) =>
      report.split("\n").filter((l) => l.startsWith("Owner steps still open for "))
        .map((l) => l.split(" (not asked now: ")[0].split("): ")[1].split(", "));
    // The body under one "## " heading, up to the next heading or the footer rule; "" when the heading is absent.
    const section = (report: string, heading: string) => {
      const lines = report.split("\n");
      const start = lines.indexOf(heading);
      if (start < 0) return "";
      const end = lines.findIndex((l, i) => i > start && (l.startsWith("## ") || l === "---"));
      return lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
    };
    // The "## " heading a line sits under.
    const headingOf = (report: string, pattern: RegExp) => {
      const lines = report.split("\n");
      const at = lines.findIndex((l) => pattern.test(l));
      return at < 0 ? undefined : lines.slice(0, at).reverse().find((l) => l.startsWith("## "));
    };
    step6.doneOn = { date: "2026-10-02", evidence: "test only", heldRows: ["POSTHOG_READ_KEY"] };
    try {
      const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });

      // Before the project exists: named once, with its reason, never as something to do.
      const before = renderReport(db, result, { projectId: "" });
      expect(count(before, "`POSTHOG_READ_KEY`")).toBe(1);
      expect(before).toMatch(
        /^Not asked yet: step 6's `POSTHOG_READ_KEY` row waits until the colony has created the brand's PostHog project[^\n]* — step 6 itself is done, and the row will be asked alone\.$/m,
      );
      expect(before).not.toContain("## Asked now: one row of a done step");
      // Under a heading of its own, never read as one of the "## Blocked on" items above it.
      expect(headingOf(before, /^Not asked yet: step 6's `POSTHOG_READ_KEY` row/)).toBe("## Owed by done steps");
      expect(section(before, "## Blocked on")).not.toContain("POSTHOG_READ_KEY");

      // The project exists: the one row is asked, alone and once.
      const after = renderReport(db, result, { projectId: "12345" });
      expect(after).toContain("## Asked now: one row of a done step");
      expect(count(after, "`POSTHOG_READ_KEY`")).toBe(1);
      expect(after).toContain(`- Step 6's \`POSTHOG_READ_KEY\` row, alone: ${key.source}.`);
      expect(after).not.toContain("Not asked yet: step 6");
      expect(after).not.toContain("## Owed by done steps");
      // The section asks that one row and no other part of step 6: one item, and no other secret of the step in it.
      const asked = section(after, "## Asked now: one row of a done step");
      expect(asked.split("\n").filter((l) => l.startsWith("- "))).toHaveLength(1);
      for (const other of step6.secrets!.filter((r) => r.name !== "POSTHOG_READ_KEY")) {
        expect(asked).not.toContain(other.name);
      }
      // It claims only what holds: step 6 is not listed as open again on any line. A line's own setup list may still
      // name step 6 (portfolio.ts humanSetup, "(owner step 6)"), so the report must not say nothing else of it is asked.
      expect(asked).toContain("This section asks for this row only; step 6 is not listed as open again on any line.");
      expect(after).not.toContain("Nothing else in step 6 is asked again");
      for (const list of askedNow(after)) expect(list).not.toContain("6");

      // It is asked even when no line is still waiting on its setup, because a done step owes it, not a line.
      for (const line of listLines(db)) setHumanSetupDone(db, line.id, true);
      const allSetUp = renderReport(db, await tick(db, { nowIso: "2026-09-03T01:00:00.000Z" }), { projectId: "12345" });
      expect(allSetUp).not.toContain("## What the owner has to do");
      expect(allSetUp).toContain(`- Step 6's \`POSTHOG_READ_KEY\` row, alone: ${key.source}.`);

      // Once the row records its own doneOn, nothing is asked or named.
      key.doneOn = { date: "2026-10-09", evidence: "test only" };
      try {
        expect(renderReport(db, result, { projectId: "12345" })).not.toContain("`POSTHOG_READ_KEY`");
      } finally {
        delete key.doneOn;
      }
      // A step 6 done with the row pasted in the same sitting owes nothing.
      step6.doneOn = { date: "2026-10-02", evidence: "test only", heldRows: [] };
      expect(renderReport(db, result, { projectId: "12345" })).not.toContain("`POSTHOG_READ_KEY`");
    } finally {
      step6.doneOn = saved;
    }
    expect(ownerStepById("ci-tokens")!.doneOn).toBeUndefined();
    expect(key.doneOn).toBeUndefined();
  });

  it("asks the owner to tell Claude, not to run the ledger command on his own machine", async () => {
    // setup-done writes to a local state/colony/colony.db; the scheduled loop reads the
    // committed copy and runs `tick --no-feed`, which never builds. The owner's part is
    // saying which step is done; recording it is ours.
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const report = renderReport(db, result);
    expect(report).toContain("tell Claude which step is done and when");
    expect(report).not.toContain("```bash");
    expect(report).toContain("Revenue here is only what reached the ledger with a platform transaction id; costs may be entered by hand without one.");
  });

  it("can never print a measured figure larger than the summed basis", async () => {
    // The bug this makes impossible: state/colony/REPORT.md told the owner "the
    // honest reachable figure is the measured ₪6,500" for four days after
    // TARGET_BASIS had been regraded to zero measured. The sentence was rendered
    // once and never recomputed, and nothing in the build could tell.
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const report = renderReport(db, result);
    const basis = summarizeTargetBasis();

    const measured = report.match(/\| Of that, \*\*measured\*\* \| ₪([\d,]+) \|/);
    expect(measured, "the report no longer prints what the plan rests on").toBeTruthy();
    const printed = Number(measured![1].replace(/,/g, ""));
    expect(printed).toBe(basis.measuredIls);
    expect(printed).toBeLessThanOrEqual(basis.totalIls);
    expect(printed).toBeLessThanOrEqual(portfolioTargetAgorot() / 100);

    // The summed figure must be the portfolio's own, not a remembered one.
    expect(report).toContain(`| Line targets, summed | ₪${basis.totalIls.toLocaleString("en")} `);
    expect(report).not.toContain("₪6,500");
  });

  it("drops the owner checklist once every setup is confirmed", async () => {
    await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    for (const line of listLines(db)) {
      if (line.humanSetup.length) setHumanSetupDone(db, line.id, true);
    }
    const result = await tick(db, { nowIso: "2026-09-04T01:00:00.000Z", force: true });
    expect(renderReport(db, result)).not.toContain("What the owner has to do");
  });

  it("says plainly when the colony is switched off", async () => {
    setRevenueColonyEnabled(db, false);
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    expect(renderReport(db, result)).toContain("**The colony is not running.**");
  });

  it("summarises a tick in one line for the commit message", async () => {
    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const summary = renderCommitSummary(result);
    expect(summary).toMatch(/^colony tick: /);
    expect(summary).toContain("₪0.00");
    expect(summary).toContain("blocker");
    expect(summary.split("\n")).toHaveLength(1);
  });
});


// Tick 32. Two defects in state/colony/REPORT.md: a line's setup items were free text, so an item for step N stayed
// "- [ ]" (and in "## Blocked on") after step N was done; and step 6's held POSTHOG_READ_KEY note printed once per line
// waiting on step 6 — four times in the report of 30.9.2026.
describe("revenue/runner owner checklist follows the steps each item belongs to", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  const NOW = "2026-09-03T00:00:00.000Z";
  // Records steps as done for the length of fn, as a real doneOn would, and restores them after. A gated row the site
  // below still holds back (projectId "") cannot have gone in with its step, so it is recorded held, as the real record
  // must be. A set of done steps the checklist cannot reach — step 6 done before step 3 or 7 made the tokens it pastes
  // (owner-steps.ts secretRowsPastedBeforeMade) — is refused rather than rendered: the report's output for it means
  // nothing, and pinning it once taught these tests an owner could skip the Gumroad paste.
  const withDone = async (ids: OwnerStepId[], fn: () => Promise<void>) => {
    const saved = ids.map((id) => ({ step: ownerStepById(id)!, doneOn: ownerStepById(id)!.doneOn }));
    for (const { step } of saved) {
      const heldRows = step.secrets?.filter((r) => r.askedOnlyWhen).map((r) => r.name);
      step.doneOn = { date: "2026-10-01", evidence: "test only", ...(heldRows ? { heldRows } : {}) };
    }
    try {
      const impossible = secretRowsPastedBeforeMade();
      if (impossible.length) throw new Error(`not a reachable set of done steps: ${impossible.join("; ")}`);
      await fn();
    } finally {
      for (const { step, doneOn } of saved) step.doneOn = doneOn;
    }
  };
  // Step 6 done means its pastes are in, so steps 3 and 7, which make two of its tokens, are done too.
  const STEP_6_REACHED: OwnerStepId[] = ["gumroad", "github-org", "ci-tokens"];
  const STEP_6_REACHED_NUMBERS = new Set([3, 7, 6]);
  const itemsOf = (lineId: string) => DEFAULT_PORTFOLIO.find((l) => l.id === lineId)!.humanSetupItems!;
  const checklist = (report: string) => report.split("\n").filter((l) => l.startsWith("- [ ] "));
  const blockerOf = (blockers: string[], lineId: string) =>
    blockers.find((b) => b.startsWith(`${lineId} is waiting on the owner`))!;
  const escapeHtml = (v: string) =>
    v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

  it("stops asking an item once every step it belongs to is done, in the checklist and in the blockers", async () => {
    await withDone(STEP_6_REACHED, async () => {
      const result = await tick(db, { nowIso: NOW });
      const asked = checklist(renderReport(db, result, { projectId: "" }));
      let gone = 0;
      for (const line of DEFAULT_PORTFOLIO) {
        const blocker = blockerOf(result.blockers, line.id);
        expect(blocker, `${line.id} has no blocker`).toBeTruthy();
        expect(blocker, `${line.id}: a blocker ending in an empty item list`).not.toMatch(/; $/);
        for (const item of line.humanSetupItems ?? []) {
          const open = !item.steps.every((n) => STEP_6_REACHED_NUMBERS.has(n));
          if (!open) gone++;
          const where = `${line.id}: "${item.text.slice(0, 60)}…"`;
          expect(asked.some((l) => l.startsWith(`- [ ] ${item.text}`)), `${where} in the checklist`).toBe(open);
          expect(blocker.includes(item.text), `${where} in the blocker`).toBe(open);
        }
      }
      // Of the ten items only il-biz-tools' mailbox (step 8) and oss-bounties' step 4 are still asked. pcn874's token
      // item names the frozen step 5 only as context, so step 5 never keeps it asked. (Nine until tick 62, 7.10.2026:
      // il-biz-tools' PostHog item, step 6 part ד of ruling 7.10 row 25, is the tenth, and goes with step 6.)
      expect(gone).toBe(8);
      expect(asked.some((l) => l.includes(itemsOf("il-biz-tools")[1].text))).toBe(false);
      expect(asked.some((l) => l.includes(itemsOf("pcn874")[2].text))).toBe(false);
    });
  });

  it("keeps asking step 6's Gumroad pastes when only step 3, which makes the token, is done", async () => {
    await withDone(["gumroad"], async () => {
      const asked = checklist(renderReport(db, await tick(db, { nowIso: NOW }), { projectId: "" }));
      // Step 3's own items go: the account is open and the token minted…
      expect(asked.some((l) => l.startsWith(`- [ ] ${itemsOf("il-biz-tools")[2].text}`))).toBe(false);
      expect(asked.some((l) => l.startsWith(`- [ ] ${itemsOf("pcn874")[0].text}`))).toBe(false);
      // …and pasting it, which is step 6, is still asked on both lines, as is il-biz-tools' PostHog item (step 6 part ד).
      expect(asked).toContain(`- [ ] ${itemsOf("il-biz-tools")[3].text}`);
      expect(asked).toContain(`- [ ] ${itemsOf("il-biz-tools")[1].text}`);
      expect(asked).toContain(`- [ ] ${itemsOf("pcn874")[2].text}`);
    });
  });

  it("prints an item with part of its steps done whole, then which of its steps are done and which are open", async () => {
    const machine = itemsOf("oss-bounties")[0]; // the machine account (step 7) and its token, pasted in step 6
    await withDone(["github-org"], async () => {
      const result = await tick(db, { nowIso: NOW });
      const report = renderReport(db, result, { projectId: "" });
      expect(checklist(report)).toContain(`- [ ] ${machine.text} — step 7 done; still open: step 6`);
      expect(blockerOf(result.blockers, "oss-bounties")).toContain(`${machine.text} — step 7 done; still open: step 6`);
      // pcn874's organisation item is step 7 alone, so it goes.
      expect(report).not.toContain(`- [ ] ${itemsOf("pcn874")[1].text}`);
    });
    // The other half — step 6 done, step 7 open — cannot be recorded: step 6 pastes the token step 7 makes. So
    // "step 6 done; still open: step 7" is never printed.
    await expect(withDone(["ci-tokens"], async () => {})).rejects.toThrow(/GUMROAD_ACCESS_TOKEN.*BRAND_GITHUB_TOKEN/);
    await withDone(STEP_6_REACHED, async () => {
      const result = await tick(db, { nowIso: NOW });
      expect(renderReport(db, result, { projectId: "" })).not.toContain(`- [ ] ${machine.text}`);
      expect(blockerOf(result.blockers, "oss-bounties")).not.toContain(machine.text);
    });
    // With none of its steps done it prints exactly as written.
    expect(checklist(renderReport(db, await tick(db, { nowIso: NOW }), { projectId: "" }))).toContain(`- [ ] ${machine.text}`);
  });

  // Tick 32 review: the report dropped a done item from its two owner sections while "### Board decisions" and
  // "### Actions taken" above them, and the dashboard written by the same tick, still listed it.
  it("drops a done item from every surface the owner reads: the whole report and the dashboard", async () => {
    await withDone(STEP_6_REACHED, async () => {
      const result = await tick(db, { nowIso: NOW });
      const report = renderReport(db, result, { projectId: "" });
      const html = renderDashboard(db, { nowIso: NOW, blockers: result.blockers });
      // Both sections print this tick, so the check below reads them.
      expect(report).toContain("### Board decisions");
      expect(report).toContain("### Actions taken");
      for (const line of DEFAULT_PORTFOLIO) {
        for (const item of line.humanSetupItems ?? []) {
          const open = !item.steps.every((n) => STEP_6_REACHED_NUMBERS.has(n));
          const where = `${line.id}: "${item.text.slice(0, 60)}…"`;
          expect(report.includes(item.text), `${where} in the report`).toBe(open);
          expect(html.includes(escapeHtml(item.text)), `${where} on the dashboard`).toBe(open);
        }
      }
      // apify-actors and pcn874 have no item left to ask, so the screen does not list them as waiting on the owner,
      // and the decision and action lines say so rather than "unspecified" or an empty list.
      expect(html).toContain("מה מחכה לך (2)");
      for (const id of ["apify-actors", "pcn874"]) {
        expect(result.board!.decisions.find((d) => d.lineId === id)!.rationale).toBe(
          `blocked on one-time human setup: ${NO_SETUP_ITEM_ASKED}`,
        );
        expect(result.board!.actions).toContain(`waiting on creator for ${id}: ${NO_SETUP_ITEM_ASKED}`);
      }
    });
    // Before any of those steps, the screen lists all four lines and every item.
    const result = await tick(db, { nowIso: NOW });
    const html = renderDashboard(db, { nowIso: NOW, blockers: result.blockers });
    expect(html).toContain("מה מחכה לך (4)");
    for (const line of DEFAULT_PORTFOLIO) for (const t of line.humanSetup) expect(html).toContain(escapeHtml(t));
  });

  it("names step 6's held POSTHOG_READ_KEY row once per report, at the head of the owner's section", async () => {
    const result = await tick(db, { nowIso: NOW });
    const lines = renderReport(db, result, { projectId: "" }).split("\n");
    const notes = lines.filter((l) => l.includes("`POSTHOG_READ_KEY`"));
    expect(notes, "once per report, not once per line waiting on step 6").toHaveLength(1);
    expect(notes[0]).toMatch(
      /^Not asked yet: step 6's `POSTHOG_READ_KEY` row waits until the colony has created the brand's PostHog project/,
    );
    const heading = lines.indexOf("## What the owner has to do (one time, per line)");
    const at = lines.indexOf(notes[0]);
    const firstLine = lines.findIndex((l, i) => i > heading && l.startsWith("**"));
    expect(heading).toBeGreaterThan(-1);
    expect(at).toBeGreaterThan(heading);
    expect(at).toBeLessThan(firstLine);
    // Once the project exists, step 6 is asked with the row and the note goes.
    expect(renderReport(db, result, { projectId: "12345" })).not.toContain("`POSTHOG_READ_KEY`");
  });

  // Tick 63 (7.10.2026): the report reads the setup texts from the database, and the scheduled tick never re-reads a
  // seed, so tick 62's two texts were in portfolio.ts only. The committed colony.db still held oss-bounties' text from
  // before tick 62, which matches no linked item (humanSetupItemFor matches the exact text), so it would have been
  // asked after steps 7 and 6 were done; and il-biz-tools had no PostHog item. syncPortfolio, which the scheduled run
  // now applies before its tick, is what brings the texts in.
  it("prints a setup text changed in portfolio.ts once the sync has run, and drops it when its steps are done", async () => {
    const OLD_MACHINE =
      'Create the brand machine account on GitHub alongside your personal one and add it to the organisation (owner step 7) — a normal user account whose login does not end in "bot" (BOARD-2 §2.1.3(c)). In the same sitting, create its token for BRAND_GITHUB_TOKEN — made with step 7, pasted in step 6, and the only other thing step 7\'s sitting does; the intake stays disabled in code until the corrected week-4 read, so the token changes nothing before then (RULING-2026-09-28-bounty-rail.md §4.4)';
    const posthog = itemsOf("il-biz-tools")[1];
    const machine = itemsOf("oss-bounties")[0];
    expect(posthog.text).toMatch(/^Create two PostHog organisations/);
    // The two lines as the committed database stored them: the old step-7 text, and no PostHog item.
    const stale = DEFAULT_PORTFOLIO.map((l) => {
      if (l.id === "oss-bounties") return { ...l, humanSetup: [OLD_MACHINE, ...l.humanSetup.slice(1)] };
      if (l.id === "il-biz-tools") return { ...l, humanSetup: l.humanSetup.filter((t) => t !== posthog.text) };
      return l;
    });
    expect(seedDefaultPortfolio(db, stale)).toBe(DEFAULT_PORTFOLIO.length);

    await withDone(STEP_6_REACHED, async () => {
      const before = renderReport(db, await tick(db, { nowIso: NOW }), { projectId: "" });
      expect(checklist(before), "the old text links to no item, so done steps do not drop it").toContain(`- [ ] ${OLD_MACHINE}`);
    });
    const unsynced = renderReport(db, await tick(db, { nowIso: NOW }), { projectId: "" });
    expect(unsynced).not.toContain(posthog.text);
    expect(unsynced).not.toContain(machine.text);

    expect(syncPortfolio(db).updated).toHaveLength(DEFAULT_PORTFOLIO.length);
    const synced = renderReport(db, await tick(db, { nowIso: NOW }), { projectId: "" });
    expect(checklist(synced)).toContain(`- [ ] ${machine.text}`);
    expect(checklist(synced)).toContain(`- [ ] ${posthog.text}`);
    expect(synced).not.toContain("the only other thing step 7's sitting does");
    await withDone(STEP_6_REACHED, async () => {
      const done = renderReport(db, await tick(db, { nowIso: NOW }), { projectId: "" });
      expect(done).not.toContain(machine.text);
      expect(done).not.toContain(posthog.text);
      expect(done).not.toContain(OLD_MACHINE);
    });
  });
});

describe("revenue/runner liveness watchdog", () => {
  let db: BetterSqlite3.Database;
  const t0 = Date.parse("2026-09-03T00:00:00.000Z");
  const DAY = 24 * HOUR;

  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  // Seed through the real writer, not hand-rolled SQL: a test that invents its
  // own schema stops testing the one the colony actually uses.
  const seedLiveLine = (id: string) => {
    const at = new Date(t0).toISOString();
    db.prepare(
      `INSERT INTO revenue_lines (id, name, category, tier, status, director_role, operating_loop,
        target_monthly_agorot, budget_monthly_cents, human_setup_done, launched_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'live', ?, '', 100000, 1000, 1, ?, ?, ?)`,
    ).run(id, id, DEFAULT_PORTFOLIO[0].category, DEFAULT_PORTFOLIO[0].tier, `director-${id}`, at, at, at);
  };

  it("says nothing on a colony that has never ticked", () => {
    // No last_run means a first run, not a dead loop. Alerting here would cry
    // wolf on every fresh database.
    expect(checkLiveness(db, t0)).toEqual([]);
  });

  it("stays quiet while the schedule is keeping up", () => {
    markRan(db, "revenue_ledger_sync", t0);
    expect(checkLiveness(db, t0 + LOOP_GAP_ALERT_MS - 1)).toEqual([]);
  });

  it("reports the gap once the loop has actually stopped", () => {
    markRan(db, "revenue_ledger_sync", t0);
    const findings = checkLiveness(db, t0 + LOOP_GAP_ALERT_MS + HOUR);
    expect(findings).toHaveLength(1);
    expect(findings[0].kind).toBe("loop_gap");
    expect(findings[0].detail).toContain("7 hours");
    expect(findings[0].detail).toContain("Actions");
  });

  it("reports a live line that has never taken money", () => {
    seedLiveLine("never-paid");
    const findings = checkLiveness(db, t0);
    expect(findings.map((f) => f.kind)).toContain("silent_line");
    expect(findings.find((f) => f.kind === "silent_line")!.detail).toContain("never taken money");
  });

  it("goes quiet once that line takes money, and speaks again when it stops", () => {
    seedLiveLine("paid-once");
    recordLedgerEntry(db, {
      lineId: "paid-once", kind: "sale", amountMinor: 45000, currency: "ILS",
      source: "manual", externalId: "tx-1", occurredAt: new Date(t0).toISOString(),
    });
    expect(checkLiveness(db, t0)).toEqual([]);
    expect(checkLiveness(db, t0 + (SILENT_LINE_ALERT_DAYS - 1) * DAY)).toEqual([]);

    const late = checkLiveness(db, t0 + (SILENT_LINE_ALERT_DAYS + 1) * DAY);
    expect(late).toHaveLength(1);
    expect(late[0].detail).toContain("no money since 2026-09-03");
  });

  it("ignores costs: spending is not earning", () => {
    seedLiveLine("spender");
    recordLedgerEntry(db, {
      lineId: "spender", kind: "cost", amountMinor: 5000, currency: "ILS",
      source: "manual", externalId: "cost-1", occurredAt: new Date(t0).toISOString(),
    });
    expect(checkLiveness(db, t0).map((f) => f.kind)).toContain("silent_line");
  });

  it("does not chase lines that are not live yet", () => {
    // proposed/building/awaiting_setup lines have no revenue by definition.
    expect(checkLiveness(db, t0)).toEqual([]);
  });

  it("surfaces liveness findings through a tick as blockers", async () => {
    seedLiveLine("silent");
    const result = await tick(db, { nowIso: new Date(t0).toISOString(), feedGoals: false, seed: false });
    expect(result.liveness.some((f) => f.kind === "silent_line")).toBe(true);
    expect(result.blockers.some((b) => b.includes("never taken money"))).toBe(true);
  });
});

// Tick 64 (7.10.2026): `colony.ts report` ran the tick with every due step, so a report run by hand ran the overdue
// ledger sync, stamped its time, and the next report and dashboard said there was no open blocker while the hourly
// schedule had not run for hours. A render (readOnly) runs no step and writes nothing; the blockers are still a tick's.
describe("revenue/runner a report-only render records nothing a tick records", () => {
  let db: BetterSqlite3.Database;
  const t0 = Date.parse("2026-09-03T00:00:00.000Z");
  const at = (ms: number) => new Date(ms).toISOString();
  const LOOP_GAP = "the loop did not run for 7 hours (last ledger sync 2026-09-03T00:00:00.000Z)";

  /** Every row of every table, and the schema: what a write of any kind would change. */
  const snapshot = (): string => {
    const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all() as { name: string }[]).map((t) => t.name);
    const rows = tables.map((t) => `${t}\t${JSON.stringify(db.prepare(`SELECT * FROM "${t}" ORDER BY rowid`).all())}`);
    return [...rows, JSON.stringify(db.prepare("SELECT type, name, sql FROM sqlite_master ORDER BY name").all())].join("\n");
  };

  beforeEach(async () => {
    db = createInMemoryDb();
    await tick(db, { nowIso: at(t0), feedGoals: false, env: {} }); // every step runs once: the last ledger sync is t0
  });
  afterEach(() => { db.close(); });

  it("on a database whose last ledger sync is 7 hours old: no row and no kv value changes, and the blocker stays", async () => {
    const before = snapshot();
    const render = await tick(db, { nowIso: at(t0 + 7 * HOUR), readOnly: true, feedGoals: false, seed: false, env: {} });
    expect(snapshot()).toBe(before);
    expect(render.ran).toEqual([]);
    expect(render.ledgerSync).toBeNull();
    expect(render.supervisor).toBeNull();
    expect(render.dueNotRun).toEqual(["revenue_ledger_sync", "revenue_supervisor_review"]);
    expect(render.skipped).toEqual(["revenue_board_review", "revenue_audit"]);
    expect(render.blockers.some((b) => b.startsWith(LOOP_GAP))).toBe(true);
    expect(isDue(db, "revenue_ledger_sync", t0 + 7 * HOUR)).toBe(true);

    const report = renderReport(db, render).split("\n");
    expect(report).toContain("Ran: nothing — a report-only render runs no step and records nothing; the scheduled tick runs the steps");
    expect(report).toContain("Due now, left for the scheduled tick: revenue_ledger_sync, revenue_supervisor_review");
    expect(report).toContain("Skipped as not yet due: revenue_board_review, revenue_audit");
    expect(report.some((l) => l.startsWith(`- ${LOOP_GAP}`))).toBe(true);
    expect(renderDashboard(db, { nowIso: at(t0 + 7 * HOUR), blockers: render.blockers })).toContain(LOOP_GAP);

    // A second render reads the same stored sync: the blocker is still there, an hour older.
    const again = await tick(db, { nowIso: at(t0 + 8 * HOUR), readOnly: true, feedGoals: false, seed: false, env: {} });
    expect(snapshot()).toBe(before);
    expect(again.blockers.some((b) => b.startsWith("the loop did not run for 8 hours (last ledger sync 2026-09-03T00:00:00.000Z)"))).toBe(true);
  });

  it("issues no write at all, even with every step due (board review and budgets included): a query_only handle does not throw", async () => {
    const before = snapshot();
    db.pragma("query_only = ON");
    const render = await tick(db, { nowIso: at(t0 + 8 * 24 * HOUR), readOnly: true, feedGoals: false, seed: false, env: {} });
    db.pragma("query_only = OFF");
    expect(snapshot()).toBe(before);
    expect(render.ran).toEqual([]);
    expect(render.dueNotRun).toEqual(TASK_ORDER);
    expect(render.skipped).toEqual([]);
    expect(render.board).toBeNull();
    expect(render.audit).toBeNull();
    // The guard is real: the same handle refuses a write while query_only is on.
    db.pragma("query_only = ON");
    expect(() => markRan(db, "revenue_ledger_sync", t0)).toThrow(/readonly/);
    db.pragma("query_only = OFF");
  });

  it("a scheduled tick on the same database still records the sync, and the next render's blocker is gone", async () => {
    const before = snapshot();
    const scheduled = await tick(db, { nowIso: at(t0 + 7 * HOUR), feedGoals: false, env: {} });
    expect(snapshot()).not.toBe(before);
    expect(scheduled.ran).toEqual(["revenue_ledger_sync", "revenue_supervisor_review"]);
    expect(scheduled.ledgerSync).not.toBeNull();
    expect("dueNotRun" in scheduled).toBe(false);
    // The tick's own report keeps the gap it found (checkLiveness runs before markRan), and says what ran.
    expect(scheduled.blockers.some((b) => b.startsWith(LOOP_GAP))).toBe(true);
    const report = renderReport(db, scheduled).split("\n");
    expect(report).toContain("Ran: revenue_ledger_sync, revenue_supervisor_review");
    expect(report.some((l) => l.startsWith("Due now"))).toBe(false);
    expect(isDue(db, "revenue_ledger_sync", t0 + 7 * HOUR)).toBe(false);

    const render = await tick(db, { nowIso: at(t0 + 7 * HOUR + 5 * 60_000), readOnly: true, feedGoals: false, seed: false, env: {} });
    expect(render.blockers.some((b) => b.includes("the loop did not run"))).toBe(false);
    expect(render.dueNotRun).toEqual([]);
    expect(renderReport(db, render).split("\n")).toContain(
      "Ran: nothing — a report-only render runs no step and records nothing; the scheduled tick runs the steps",
    );
  });
});

// The tick-64 review: a render that ran no step dropped every blocker only a step computed — a measurement file that is
// not JSON, "page views: not configured while a clock runs", the sync's errors and unmapped products, the audit's
// findings — while a tick at the same moment, and the old report, showed them. The render's blockers are now a tick's,
// but for a due step's own findings, which are the last run's and say so.
describe("revenue/runner a render's blockers are a tick's at the same moment", () => {
  let db: BetterSqlite3.Database;
  let dir: string;
  let files: { measurementsDir: string; brandMailFile: string; prizeIntakeFile: string; pageViewClockFile: string };
  const T0 = Date.parse("2026-10-05T00:00:00.000Z");
  const T1 = T0 + 8 * 24 * HOUR;
  const at = (ms: number) => new Date(ms).toISOString();
  const snapshot = (): string => {
    const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all() as { name: string }[]).map((t) => t.name);
    return tables.map((t) => `${t}\t${JSON.stringify(db.prepare(`SELECT * FROM "${t}" ORDER BY rowid`).all())}`).join("\n");
  };
  const render = (ms: number) => tick(db, { nowIso: at(ms), readOnly: true, feedGoals: false, seed: false, env: {}, ...files });
  const scheduled = (ms: number) => tick(db, { nowIso: at(ms), feedGoals: false, env: {}, ...files });
  const setKv = (key: string, value: unknown) =>
    db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))").run(key, JSON.stringify(value));

  beforeEach(async () => {
    db = createInMemoryDb();
    dir = mkdtempSync(join(tmpdir(), "runner-render-"));
    files = {
      measurementsDir: join(dir, "measurements"),
      brandMailFile: join(dir, "brand-mail.json"),
      prizeIntakeFile: join(dir, "prize-intake.json"),
      pageViewClockFile: join(dir, "page-view-clock.json"),
    };
    mkdirSync(files.measurementsDir);
    await scheduled(T0); // seeds the portfolio and runs every step: the last ledger sync and every review are at T0
    // Every class of blocker a tick computes outside its steps, and the two its ledger sync computes without the network:
    writeFileSync(join(files.measurementsDir, "apify-runs.json"), "{not json"); // measurement: not JSON
    writeFileSync(join(files.measurementsDir, "algora-supply.json"), JSON.stringify({ claimableBounties: 3 })); // no measuredAt
    writeFileSync(files.brandMailFile, "{not json"); // the brand-mail probe
    writeFileSync(
      files.pageViewClockFile,
      JSON.stringify({ "il-biz-tools": { d0: "2026-10-05", d0Evidence: "test" }, pcn874: { d0: "5.10.2026" }, queryApi: { priced: [] } }),
    ); // a clock runs with no read key, and one clock is a problem
    updateLineStatus(db, "apify-actors", "building", { force: true }); // stalled: no signal since T0's reviews
    // At T1 only the ledger sync is due.
    for (const task of ["revenue_supervisor_review", "revenue_board_review", "revenue_audit"] as const) markRan(db, task, T1 - HOUR);
  });
  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("with the ledger sync due: the same blockers in the same words and order, and the same page-view line", async () => {
    const before = snapshot();
    const r = await render(T1);
    expect(snapshot()).toBe(before);
    expect(r.dueNotRun).toEqual(["revenue_ledger_sync"]);
    const renderReportLines = renderReport(db, r).split("\n");

    const t = await scheduled(T1);
    expect(t.ran).toEqual(["revenue_ledger_sync"]);
    // The fixture is what it says: each class is a blocker of the tick.
    for (const needle of [
      "the loop did not run for 192 hours (last ledger sync 2026-10-05T00:00:00.000Z)",
      `measurement ${join(files.measurementsDir, "apify-runs.json")}: not JSON`,
      `measurement ${join(files.measurementsDir, "algora-supply.json")}: no usable measuredAt`,
      "page-view clock: pcn874.d0 is not a UTC day (YYYY-MM-DD): 5.10.2026",
      "page views: not configured while a clock runs (il-biz-tools from 2026-10-05)",
      "apify-actors has been building for 8 days",
      `brand-mail probe ${files.brandMailFile}: not JSON`,
      "il-biz-tools is waiting on the owner",
    ]) {
      expect(t.blockers.some((b) => b.startsWith(needle)), needle).toBe(true);
    }
    expect(r.blockers).toEqual(t.blockers);
    expect(r.pageViews).toEqual(t.pageViews);
    const pageViewLines = (lines: string[]) => lines.filter((l) => l.startsWith("- Page views"));
    expect(pageViewLines(renderReportLines)).toEqual(pageViewLines(renderReport(db, t).split("\n")));
    expect(pageViewLines(renderReportLines)[0]).toMatch(/^- Page views: not configured — POSTHOG_READ_KEY is not set/);
    expect(renderReportLines).toContain(
      "What a render cannot show: what the due steps would find now. A due ledger sync's and audit's own blockers are " +
        "their last runs', each led by its time; no page-view query is sent; and a supervisor or board review not run " +
        "changes nothing the later checks read (a line's last signal, its status).",
    );

    // Nothing due five minutes later: a render and a tick have the same blockers, and the report has no such line.
    const later = await render(T1 + 5 * 60_000);
    expect(later.dueNotRun).toEqual([]);
    expect(renderReport(db, later)).not.toContain("What a render cannot show");
    expect(later.blockers).toEqual((await scheduled(T1 + 5 * 60_000)).blockers);
  });

  it("with the sync and the audit due: their own blockers are the last runs', each led by its time; the rest are the tick's", async () => {
    // The stored last sync's time is its run's (the loop gap reads the same one), not the record's wall-clock `at`.
    setKv(LAST_LEDGER_SYNC_KEY, { recorded: 0, duplicates: 0, unmapped: ["gumroad:abc"], sources: [], errors: ["gumroad: HTTP 401"], gumroadRefundRate: null, at: "2026-10-05T00:00:07.000Z" });
    // A record from before tick 64: no findings stored. The rate is flagged / sampled.
    setKv(LAST_AUDIT_KEY, { at: at(T0), sampled: 4, flagged: 2, chiefAuditRan: false });
    markRan(db, "revenue_audit", T1 - 8 * 24 * HOUR);
    const before = snapshot();
    const r = await render(T1);
    expect(snapshot()).toBe(before);
    expect(r.dueNotRun).toEqual(["revenue_ledger_sync", "revenue_audit"]);
    const led = [
      `last ledger sync, ${at(T0)}: 1 platform product(s) have no revenue line: gumroad:abc. Map them so their sales are counted.`,
      `last ledger sync, ${at(T0)}: gumroad: HTTP 401`,
      `last audit, ${at(T0)}: auditor flagged 2/4 supervisor reviews`,
    ];
    for (const b of led) expect(r.blockers).toContain(b);
    // Where the tick would put the sync's and the audit's: after the loop gap, and after the page-view gates.
    expect(r.blockers.indexOf(led[0])).toBe(1);
    expect(r.blockers.indexOf(led[2])).toBeGreaterThan(r.blockers.findIndex((b) => b.startsWith("page views: not configured")));

    const t = await scheduled(T1);
    expect(t.ran).toEqual(["revenue_ledger_sync", "revenue_audit"]);
    expect(r.blockers.filter((b) => !led.includes(b))).toEqual(t.blockers);
  });

  it("a scheduled audit stores its rate and findings, and a render with the audit due prints them with the audit's time", async () => {
    // A cost booked on a killed line after its kill date: a structural finding the auditor always checks.
    updateLineStatus(db, "pcn874", "killed", { force: true });
    db.prepare("UPDATE revenue_lines SET killed_at = ? WHERE id = 'pcn874'").run(at(T0));
    recordLedgerEntry(db, { lineId: "pcn874", kind: "cost", amountMinor: 100, currency: "ILS", source: "manual", occurredAt: at(T0 + 24 * HOUR) });
    markRan(db, "revenue_audit", T1 - 8 * 24 * HOUR);
    const t = await scheduled(T1);
    expect(t.audit?.chiefFindings).toEqual(["1 cost entries on killed lines after their kill date"]);
    expect(lastAudit(db)).toEqual({ at: at(T1), sampled: t.audit!.sampled, flagged: t.audit!.flagged, flagRate: t.audit!.flagRate, chiefFindings: t.audit!.chiefFindings });

    const r = await render(T1 + 7 * 24 * HOUR);
    expect(r.dueNotRun).toContain("revenue_audit");
    expect(r.blockers).toContain(`last audit, ${at(T1)}: chief audit: 1 cost entries on killed lines after their kill date`);
  });
});
