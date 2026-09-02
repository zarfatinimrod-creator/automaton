import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { getActiveGoals, getTasksByGoal } from "../../state/database.js";
import { runAudit, runBoardReview, runLedgerSync, runSupervisorReview, setMonthlyComputeBudgetCents } from "../../revenue/heartbeat.js";
import { enqueueGoal, feedNextGoal, listQueuedGoals } from "../../revenue/goal-queue.js";
import { getLine, insertLineFromSeed, listLines, listReviews, recordLedgerEntry, setHumanSetupDone, setRevenueColonyEnabled, updateLineStatus } from "../../revenue/ledger.js";
import { DEFAULT_PORTFOLIO, seedDefaultPortfolio } from "../../revenue/portfolio.js";
import { getRevenueStatus } from "../../revenue/status.js";
import { createRevenueTools } from "../../revenue/tools.js";
import { REVENUE_KV } from "../../revenue/types.js";
import type { ToolContext } from "../../types.js";

function kv(db: BetterSqlite3.Database, key: string): string | undefined {
  return (db.prepare("SELECT value FROM kv WHERE key = ?").get(key) as { value: string } | undefined)?.value;
}

describe("revenue/loop (board → queue → orchestrator)", () => {
  let db: BetterSqlite3.Database;

  beforeEach(() => {
    db = createInMemoryDb();
  });

  afterEach(() => {
    db.close();
  });

  it("seeds the default portfolio on the first board review and files exactly one goal", () => {
    const result = runBoardReview(db);
    expect(result.ran).toBe(true);
    const lines = listLines(db);
    expect(lines.length).toBe(DEFAULT_PORTFOLIO.length);
    // Lines that need creator setup are parked; lines with no setup get a build goal.
    const noSetup = DEFAULT_PORTFOLIO.filter((s) => s.humanSetup.length === 0).map((s) => s.id);
    expect(noSetup.length).toBeGreaterThan(0);
    const active = getActiveGoals(db);
    expect(active).toHaveLength(1);
    expect(result.goalFiled?.lineId).toBe(noSetup[0]);
    expect(getLine(db, noSetup[0])?.status).toBe("building");
    // The goal description carries the operating loop and the human-setup rule.
    expect(active[0].description).toContain("OPERATING LOOP");
    expect(active[0].description).toContain("revenue_setup_done");
    // Parked lines are still awaiting setup and not queued.
    const parked = lines.filter((l) => l.status === "awaiting_setup");
    expect(parked.length).toBe(DEFAULT_PORTFOLIO.length - noSetup.length);
    expect(listQueuedGoals(db).some((q) => parked.some((p) => p.id === q.lineId))).toBe(false);
    expect(kv(db, REVENUE_KV.lastBoardDirective)).toContain("Board review");
    expect(listReviews(db, { level: "board", lineId: null })).toHaveLength(1);
  });

  it("does nothing when the colony is disabled", () => {
    setRevenueColonyEnabled(db, false);
    expect(runBoardReview(db).ran).toBe(false);
    expect(listLines(db)).toHaveLength(0);
    expect(getRevenueStatus(db)).toContain("disabled");
  });

  it("queues a build goal once the creator marks setup done, and feeds it when the orchestrator frees up", () => {
    seedDefaultPortfolio(db);
    runBoardReview(db); // files the first no-setup goal
    const parked = listLines(db).find((l) => l.status === "awaiting_setup")!;
    setHumanSetupDone(db, parked.id, true);
    runBoardReview(db);
    expect(listQueuedGoals(db).map((q) => q.lineId)).toContain(parked.id);
    // Orchestrator still busy with the first goal → nothing else filed.
    expect(getActiveGoals(db)).toHaveLength(1);
    // Simulate goal completions until the queue reaches the newly unblocked line
    // (lines that never needed setup were queued ahead of it).
    let fed: ReturnType<typeof feedNextGoal> = null;
    for (let i = 0; i < 5 && fed?.lineId !== parked.id; i += 1) {
      db.prepare("UPDATE goals SET status = 'completed', completed_at = ? WHERE status = 'active'").run(new Date().toISOString());
      fed = feedNextGoal(db);
    }
    expect(fed?.lineId).toBe(parked.id);
    expect(getLine(db, parked.id)?.status).toBe("building");
  });

  it("kills a line below the floor after grace, removes its queued goals, and records the decision", () => {
    insertLineFromSeed(db, {
      id: "weak", name: "Weak", category: "content", tier: "experimental", directorRole: "director-weak",
      operatingLoop: "x", kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: 100_000,
      budgetMonthlyCents: 1000, humanSetup: [], skillName: null,
    });
    updateLineStatus(db, "weak", "building");
    updateLineStatus(db, "weak", "live");
    db.prepare("UPDATE revenue_lines SET launched_at = ? WHERE id = ?").run(new Date(Date.now() - 60 * 86_400_000).toISOString(), "weak");
    enqueueGoal(db, { lineId: "weak", phase: "grow" });
    const result = runBoardReview(db, { seed: false });
    expect(getLine(db, "weak")?.status).toBe("killed");
    expect(listQueuedGoals(db).some((q) => q.lineId === "weak")).toBe(false);
    expect(result.decisions.find((d) => d.lineId === "weak")?.decision).toBe("kill");
    expect(listReviews(db, { lineId: "weak", level: "board" })[0].decision).toBe("kill");
  });

  it("supervisor reviews request a board review on escalation; auditor approves consistent reviews", () => {
    insertLineFromSeed(db, {
      id: "stuck", name: "Stuck", category: "micro_saas", tier: "growth", directorRole: "director-stuck",
      operatingLoop: "x", kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: 100_000,
      budgetMonthlyCents: 1000, humanSetup: [], skillName: null,
    });
    updateLineStatus(db, "stuck", "building");
    db.prepare("UPDATE revenue_lines SET created_at = ? WHERE id = ?").run(new Date(Date.now() - 40 * 86_400_000).toISOString(), "stuck");
    const sup = runSupervisorReview(db);
    expect(sup.reviewed).toBe(1);
    expect(sup.escalations[0].decision).toBe("escalate");
    expect(kv(db, "revenue.board_review_requested")).toContain("stuck=escalate");

    const audit = runAudit(db);
    expect(audit.sampled).toBe(1);
    expect(audit.flagged).toBe(0);
    expect(listReviews(db, { level: "auditor" })[0].decision).toBe("approve");
    expect(audit.chiefAuditRan).toBe(true);
    expect(listReviews(db, { level: "chief_auditor" })[0].decision).toBe("approve");
  });

  it("auditor flags a supervisor review that disagrees with the rules", () => {
    insertLineFromSeed(db, {
      id: "line-l", name: "L", category: "micro_saas", tier: "growth", directorRole: "director-l",
      operatingLoop: "x", kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: 100_000,
      budgetMonthlyCents: 1000, humanSetup: [], skillName: null,
    });
    updateLineStatus(db, "line-l", "building");
    updateLineStatus(db, "line-l", "live");
    // A filed "hold" whose metrics say kill (60 days live, no revenue)
    db.prepare(
      `INSERT INTO revenue_reviews (id, line_id, level, reviewer, period_start, period_end, metrics, decision, rationale, created_at)
       VALUES ('r1', 'line-l', 'supervisor', 'supervisor-l', ?, ?, ?, 'hold', 'looks fine', ?)`,
    ).run(
      new Date().toISOString(), new Date().toISOString(),
      JSON.stringify({ lineId: "line-l", status: "live", revenue30dAgorot: 0, revenue7dAgorot: 0, refunds30dAgorot: 0, cost30dAgorot: 0, net30dAgorot: 0, transactions30d: 0, trend: 1, daysSinceCreated: 90, daysSinceLaunch: 60, daysSinceLastRevenue: null, targetMonthlyAgorot: 100_000, targetAttainment: 0 }),
      new Date().toISOString(),
    );
    const audit = runAudit(db);
    expect(audit.flagged).toBe(1);
    expect(audit.flagRate).toBe(1);
    expect(kv(db, "revenue.board_review_requested")).toContain("audit");
  });

  it("allocates the monthly compute budget across active lines", () => {
    seedDefaultPortfolio(db);
    setMonthlyComputeBudgetCents(db, 9_000);
    runBoardReview(db);
    const active = listLines(db).filter((l) => l.status === "building" || l.status === "live" || l.status === "scaling");
    const total = active.reduce((s, l) => s + l.budgetMonthlyCents, 0);
    expect(total).toBe(9_000);
    for (const l of listLines(db).filter((l) => l.status === "awaiting_setup")) expect(l.budgetMonthlyCents).toBe(0);
  });

  it("syncs tagged x402 transfers from the transactions table into the ledger", async () => {
    insertLineFromSeed(db, {
      id: "agent-services", name: "A", category: "agent_service", tier: "experimental", directorRole: "d",
      operatingLoop: "x", kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: 1, budgetMonthlyCents: 0, humanSetup: [], skillName: null,
    });
    updateLineStatus(db, "agent-services", "building");
    const now = new Date().toISOString();
    db.prepare("INSERT INTO transactions (id, type, amount_cents, description, created_at) VALUES (?, ?, ?, ?, ?)")
      .run("tx1", "transfer_in", 250, "x402 payment [line:agent-services]", now);
    db.prepare("INSERT INTO transactions (id, type, amount_cents, description, created_at) VALUES (?, ?, ?, ?, ?)")
      .run("tx2", "transfer_in", 5000, "creator funding", now);
    const first = await runLedgerSync(db, {}, undefined);
    expect(first.recorded).toBe(1);
    const again = await runLedgerSync(db, {}, undefined);
    expect(again.recorded).toBe(0);
    expect(getLine(db, "agent-services")?.status).toBe("live");
  });

  it("uses a remote connector when configured and maps products to lines", async () => {
    insertLineFromSeed(db, {
      id: "templates", name: "T", category: "digital_product", tier: "growth", directorRole: "d",
      operatingLoop: "x", kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: 1, budgetMonthlyCents: 0, humanSetup: [], skillName: null,
    });
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ sales: [{ id: "g1", product_id: "p1", price: 1200, currency: "usd", created_at: new Date().toISOString(), gumroad_fee: 120, refunded: false, product_name: "Planner" }] }),
    })) as unknown as typeof fetch;
    const unmappedRun = await runLedgerSync(db, { GUMROAD_ACCESS_TOKEN: "t" }, fetchImpl);
    expect(unmappedRun.recorded).toBe(2);
    expect(unmappedRun.unmapped).toEqual(["gumroad:p1"]);
    expect(kv(db, "revenue.unmapped_products")).toContain("gumroad:p1");
  });

  it("exposes tools that read and write the colony state", async () => {
    const tools = createRevenueTools();
    const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
    const ctx = { db: { raw: db }, identity: { name: "tester" } } as unknown as ToolContext;
    expect(await byName.revenue_board_review.execute({}, ctx)).toContain("Board review");
    const lines = listLines(db);
    const parked = lines.find((l) => l.status === "awaiting_setup")!;
    expect(await byName.revenue_launch_line.execute({ line_id: parked.id }, ctx)).toContain("Blocked");
    expect(await byName.revenue_setup_done.execute({ line_id: parked.id, done: true }, ctx)).toContain("Error");
    expect(await byName.revenue_setup_done.execute({ line_id: parked.id, done: true, evidence: "creator message 2026-09-02" }, ctx)).toContain("Setup marked done");
    const rec = await byName.revenue_record.execute({ line_id: parked.id, kind: "sale", amount_minor: 1990, currency: "USD", source: "lemonsqueezy", external_id: "o1" }, ctx);
    expect(rec).toContain("Recorded sale");
    expect(await byName.revenue_record.execute({ line_id: parked.id, kind: "sale", amount_minor: 1990, currency: "USD", source: "lemonsqueezy", external_id: "o1" }, ctx)).toContain("Duplicate");
    expect(await byName.revenue_decide.execute({ line_id: parked.id, level: "board", decision: "pause", rationale: "creator asked to pause this line for now" }, ctx)).toContain("pause");
    expect(getLine(db, parked.id)?.status).toBe("paused");
    const status = await byName.revenue_status.execute({}, ctx);
    expect(status).toContain("Target");
    expect(await byName.revenue_line_detail.execute({ line_id: parked.id }, ctx)).toContain("Rules now");
    const proposed = await byName.revenue_propose_line.execute({
      id: "new-idea", name: "New idea", category: "paid_api", tier: "experimental",
      operating_loop: "Ship one endpoint per week, list it, measure paid calls, improve the most-used endpoint, and repeat until target.",
      kpis: ["calls"], kill_criteria: ["none"], scale_criteria: ["target"], target_monthly_ils: 500, human_setup: [],
    }, ctx);
    expect(proposed).toContain("Proposed line new-idea");
    expect(getTasksByGoal(db, getActiveGoals(db)[0]?.id ?? "")).toEqual([]);
  });
});
