import { describe, it, expect, beforeEach, afterEach } from "vitest";
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
import { OWNER_STEPS, isOwnerStepOpen, ownerStepById, ownerStepsForLine } from "../../revenue/owner-steps.js";
import { getLine, listLines, recordKpi, recordLedgerEntry, setHumanSetupDone, setRevenueColonyEnabled, updateLineStatus } from "../../revenue/ledger.js";
import { REVENUE_TASK_INTERVALS_MS } from "../../revenue/heartbeat.js";
import { getActiveGoals } from "../../state/database.js";
import { DEFAULT_PORTFOLIO, portfolioTargetAgorot, summarizeTargetBasis } from "../../revenue/portfolio.js";
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
    expect(heldSecretRowsNote("il-biz-tools", { projectId: "" })).toContain(held);
    expect(heldSecretRowsNote("il-biz-tools", { projectId: "" })).toMatch(/^Not asked yet: /);
    expect(heldSecretRowsNote("il-biz-tools", { projectId: "12345" })).toBe("");
    // A line with no asked-now step that has gated rows carries no note.
    expect(OWNER_STEPS.filter((s) => s.secrets?.some((r) => r.askedOnlyWhen)).map((s) => s.id)).toEqual(["ci-tokens"]);

    const result = await tick(db, { nowIso: "2026-09-03T00:00:00.000Z" });
    const report = renderReport(db, result);
    const lines = report.split("\n");
    const row = lines.findIndex((l) => l.startsWith("Owner steps still open for `il-biz-tools`"));
    expect(row).toBeGreaterThan(-1);
    // The report reads the real site.json, as the page-view reader does.
    if (readSite().projectId === "") expect(lines[row + 1]).toContain(held);
    else expect(report).not.toContain("POSTHOG_READ_KEY");
    // The row line itself is unchanged: the asked-now list and its not-asked note.
    expect(lines[row]).not.toContain("POSTHOG_READ_KEY");
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

      // The project exists: the one row is asked, alone and once.
      const after = renderReport(db, result, { projectId: "12345" });
      expect(after).toContain("## Asked now: one row of a done step");
      expect(count(after, "`POSTHOG_READ_KEY`")).toBe(1);
      expect(after).toContain(`- Step 6's \`POSTHOG_READ_KEY\` row, alone: ${key.source}.`);
      expect(after).not.toContain("`GUMROAD_ACCESS_TOKEN`");
      expect(after).not.toContain("Not asked yet: step 6");
      // Step 6 itself is not asked again on any line.
      for (const asked of askedNow(after)) expect(asked).not.toContain("6");

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
