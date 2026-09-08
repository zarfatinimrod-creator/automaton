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
  renderReport,
  SILENT_LINE_ALERT_DAYS,
  tick,
  TASK_ORDER,
} from "../../revenue/runner.js";
import { getLine, listLines, recordLedgerEntry, setHumanSetupDone, setRevenueColonyEnabled, updateLineStatus } from "../../revenue/ledger.js";
import { REVENUE_TASK_INTERVALS_MS } from "../../revenue/heartbeat.js";
import { getActiveGoals } from "../../state/database.js";
import { DEFAULT_PORTFOLIO, portfolioTargetAgorot, summarizeTargetBasis } from "../../revenue/portfolio.js";

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
