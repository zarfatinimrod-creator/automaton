import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import {
  computeLineMetrics,
  computePortfolioSummary,
  getLine,
  insertLineFromSeed,
  insertReview,
  latestKpis,
  listLedger,
  listLines,
  listReviews,
  recordKpi,
  recordLedgerEntry,
  setHumanSetupDone,
  setLineBudget,
  setLineTier,
  setRevenueColonyEnabled,
  setTargets,
  updateLineFromSeed,
  updateLineStatus,
} from "../../revenue/ledger.js";
import { setFxRate, toAgorot, formatIls, agorotFromIls } from "../../revenue/money.js";
import { DEFAULT_PORTFOLIO, KILLED_LINES, seedDefaultPortfolio, syncPortfolio } from "../../revenue/portfolio.js";
import type { RevenueLineSeed } from "../../revenue/types.js";

function seed(overrides: Partial<RevenueLineSeed> = {}): RevenueLineSeed {
  return {
    id: "test-line",
    name: "Test line",
    category: "micro_saas",
    tier: "core",
    directorRole: "director-test-line",
    operatingLoop: "build, ship, measure, iterate",
    kpis: ["sales"],
    killCriteria: ["no sales"],
    scaleCriteria: ["target reached"],
    targetMonthlyAgorot: agorotFromIls(1000),
    budgetMonthlyCents: 1000,
    humanSetup: [],
    skillName: null,
    ...overrides,
  };
}

describe("revenue/ledger", () => {
  let db: BetterSqlite3.Database;

  beforeEach(() => {
    db = createInMemoryDb();
  });

  afterEach(() => {
    db.close();
  });

  it("inserts a seed once and never overwrites it", () => {
    expect(insertLineFromSeed(db, seed())).toBe(true);
    expect(insertLineFromSeed(db, seed({ name: "changed" }))).toBe(false);
    expect(getLine(db, "test-line")?.name).toBe("Test line");
    expect(getLine(db, "test-line")?.status).toBe("proposed");
  });

  it("parks lines with human setup in awaiting_setup", () => {
    insertLineFromSeed(db, seed({ humanSetup: ["open account"] }));
    expect(getLine(db, "test-line")?.status).toBe("awaiting_setup");
    setHumanSetupDone(db, "test-line", true);
    expect(getLine(db, "test-line")?.humanSetupDone).toBe(true);
  });

  it("rejects invalid ids and illegal transitions", () => {
    expect(() => insertLineFromSeed(db, seed({ id: "Bad Id!" }))).toThrow(/Invalid revenue line id/);
    insertLineFromSeed(db, seed());
    expect(() => updateLineStatus(db, "test-line", "scaling")).toThrow(/Illegal revenue line transition/);
    updateLineStatus(db, "test-line", "building");
    expect(getLine(db, "test-line")?.status).toBe("building");
  });

  it("lets a line awaiting setup become a ₪0 measurement, but never live (RULING-2026-09-28-floors.md §9)", () => {
    // A public page with an instrument needs no identity step; money still needs a platform payment id first.
    insertLineFromSeed(db, seed({ humanSetup: ["open account"] }));
    expect(getLine(db, "test-line")?.status).toBe("awaiting_setup");
    expect(() => updateLineStatus(db, "test-line", "live")).toThrow(/Illegal revenue line transition/);
    updateLineStatus(db, "test-line", "measuring");
    expect(getLine(db, "test-line")?.status).toBe("measuring");
  });

  it("records ledger entries idempotently and normalises to agorot", () => {
    insertLineFromSeed(db, seed());
    setFxRate(db, "USD", 3.5);
    const first = recordLedgerEntry(db, {
      lineId: "test-line", kind: "sale", amountMinor: 1000, currency: "usd", source: "Stripe", externalId: "ch_1",
    });
    expect(first).not.toBeNull();
    expect(first!.amountAgorot).toBe(3500);
    expect(first!.source).toBe("stripe");
    const dup = recordLedgerEntry(db, {
      lineId: "test-line", kind: "sale", amountMinor: 1000, currency: "USD", source: "stripe", externalId: "ch_1",
    });
    expect(dup).toBeNull();
    expect(listLedger(db, { lineId: "test-line" })).toHaveLength(1);
  });

  it("stores costs and refunds as negative amounts", () => {
    insertLineFromSeed(db, seed());
    const cost = recordLedgerEntry(db, { lineId: "test-line", kind: "cost", amountMinor: 250, currency: "ILS", source: "manual" });
    const refund = recordLedgerEntry(db, { lineId: "test-line", kind: "refund", amountMinor: 500, currency: "ILS", source: "manual", externalId: "r1" });
    expect(cost!.amountAgorot).toBe(-250);
    expect(refund!.amountAgorot).toBe(-500);
  });

  it("promotes a building line to live on its first real sale", () => {
    insertLineFromSeed(db, seed());
    updateLineStatus(db, "test-line", "building");
    recordLedgerEntry(db, { lineId: "test-line", kind: "sale", amountMinor: 9900, currency: "ILS", source: "manual", externalId: "s1" });
    const line = getLine(db, "test-line")!;
    expect(line.status).toBe("live");
    expect(line.launchedAt).not.toBeNull();
  });

  it("computes 30-day and 7-day metrics with trend and attainment", () => {
    insertLineFromSeed(db, seed({ targetMonthlyAgorot: 100_000 }));
    const now = new Date("2026-09-02T12:00:00.000Z");
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
    updateLineStatus(db, "test-line", "building");
    recordLedgerEntry(db, { lineId: "test-line", kind: "sale", amountMinor: 30_000, currency: "ILS", source: "manual", externalId: "a", occurredAt: daysAgo(20) });
    recordLedgerEntry(db, { lineId: "test-line", kind: "sale", amountMinor: 20_000, currency: "ILS", source: "manual", externalId: "b", occurredAt: daysAgo(3) });
    recordLedgerEntry(db, { lineId: "test-line", kind: "refund", amountMinor: 5_000, currency: "ILS", source: "manual", externalId: "c", occurredAt: daysAgo(2) });
    recordLedgerEntry(db, { lineId: "test-line", kind: "cost", amountMinor: 10_000, currency: "ILS", source: "manual", externalId: "d", occurredAt: daysAgo(1) });
    recordLedgerEntry(db, { lineId: "test-line", kind: "sale", amountMinor: 99_000, currency: "ILS", source: "manual", externalId: "old", occurredAt: daysAgo(40) });

    const m = computeLineMetrics(db, getLine(db, "test-line")!, now.toISOString());
    expect(m.revenue30dAgorot).toBe(50_000);
    expect(m.revenue7dAgorot).toBe(20_000);
    expect(m.refunds30dAgorot).toBe(5_000);
    expect(m.cost30dAgorot).toBe(10_000);
    expect(m.net30dAgorot).toBe(35_000);
    expect(m.transactions30d).toBe(2);
    expect(m.targetAttainment).toBeCloseTo(0.45, 5);
    // 7d net 15,000 × 30/7 ≈ 64,286 vs 30d net 45,000 → trend ≈ 1.43
    expect(m.trend).toBeGreaterThan(1.4);
    expect(m.trend).toBeLessThan(1.5);
    expect(m.daysSinceLastRevenue).toBeCloseTo(3, 1);
  });

  it("summarises the portfolio against the target", () => {
    insertLineFromSeed(db, seed({ id: "line-a", targetMonthlyAgorot: 100_000 }));
    insertLineFromSeed(db, seed({ id: "line-b", targetMonthlyAgorot: 100_000 }));
    setTargets(db, 200_000, 500_000);
    recordLedgerEntry(db, { lineId: "line-a", kind: "sale", amountMinor: 50_000, currency: "ILS", source: "manual", externalId: "pa" });
    recordLedgerEntry(db, { lineId: "line-b", kind: "sale", amountMinor: 30_000, currency: "ILS", source: "manual", externalId: "pb" });
    const s = computePortfolioSummary(db);
    expect(s.total30dAgorot).toBe(80_000);
    expect(s.attainment).toBeCloseTo(0.4, 5);
    expect(s.stretchMonthlyAgorot).toBe(500_000);
    expect(s.counts.live).toBe(0); // proposed lines with sales stay proposed (only building → live is automatic)
    expect(listLines(db)).toHaveLength(2);
  });

  it("keeps a review trail and KPI snapshots", () => {
    insertLineFromSeed(db, seed());
    const r = insertReview(db, {
      lineId: "test-line", level: "supervisor", reviewer: "supervisor-test-line",
      periodStart: "2026-09-01T00:00:00.000Z", periodEnd: "2026-09-02T00:00:00.000Z",
      metrics: { revenue30dAgorot: 0 }, decision: "hold", rationale: "nothing yet",
    });
    expect(listReviews(db, { lineId: "test-line" })[0].id).toBe(r.id);
    recordKpi(db, "test-line", "visitors", 12, "count");
    recordKpi(db, "test-line", "visitors", 30, "count");
    expect(latestKpis(db, "test-line").visitors.value).toBe(30);
  });

  it("money helpers format and convert", () => {
    expect(formatIls(123_456)).toBe("₪1,234.56");
    expect(formatIls(-50)).toBe("-₪0.50");
    expect(toAgorot(db, 100, "ILS")).toBe(100);
    expect(toAgorot(db, 100, "USD")).toBe(360);
    expect(() => setFxRate(db, "USD", 0)).toThrow();
  });
});


describe("the ledger will not book money nobody paid", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => {
    db = createInMemoryDb();
    insertLineFromSeed(db, seed());
  });
  afterEach(() => { db.close(); });

  const entry = (over: Partial<Parameters<typeof recordLedgerEntry>[1]> = {}) => ({
    lineId: "test-line", kind: "sale" as const, amountMinor: 10_000,
    currency: "ILS", source: "manual", ...over,
  });

  it("refuses money in without the platform's transaction id", () => {
    // MISSION rule 2. Without an id the entry is unverifiable AND undeduplicated:
    // the idempotency check has nothing to key on, so the same imagined sale can
    // be booked again and again.
    for (const kind of ["sale", "subscription", "payout"] as const) {
      expect(() => recordLedgerEntry(db, entry({ kind }))).toThrow(/externalId is required/);
      expect(() => recordLedgerEntry(db, entry({ kind, externalId: "   " }))).toThrow(/externalId is required/);
    }
  });

  it("refuses a refund without one either, so refunds cannot be double-counted", () => {
    expect(() => recordLedgerEntry(db, entry({ kind: "refund" }))).toThrow(/externalId is required/);
  });

  it("still lets us record our own costs, which have no platform receipt", () => {
    const cost = recordLedgerEntry(db, entry({ kind: "cost", amountMinor: 500 }));
    expect(cost?.amountMinor).toBe(-500);
    expect(cost?.externalId).toBeNull();
  });

  it("points the caller at the rule rather than just failing", () => {
    expect(() => recordLedgerEntry(db, entry())).toThrow(/MISSION rule 2/);
  });

  it("records nothing at all when it refuses", () => {
    expect(() => recordLedgerEntry(db, entry())).toThrow();
    const count = db.prepare("SELECT COUNT(*) AS c FROM revenue_ledger").get() as { c: number };
    expect(count.c).toBe(0);
  });
});

// Tick 63 (7.10.2026). A seed sync wrote every column of an existing line from portfolio.ts, the board's budget
// allocation among them: on the committed colony.db, where the board review had allocated 0 to the four lines (none is
// working yet), `colony.ts sync-portfolio` set them to 4000, 4000, 3000 and 4000 cents until the next daily review.
// The sync now runs before every scheduled tick, so it must keep what a decision recorded in the database owns.
describe("a seed sync keeps what the board decided in the database", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  it("keeps the board's budget allocation when the seed carries another figure", () => {
    insertLineFromSeed(db, seed({ budgetMonthlyCents: 1000 }));
    setLineBudget(db, "test-line", 0);
    const out = syncPortfolio(db, [seed({ budgetMonthlyCents: 4000, operatingLoop: "a changed loop, which does sync" })], []);
    expect(out.updated).toEqual(["test-line"]);
    expect(getLine(db, "test-line")!.budgetMonthlyCents).toBe(0);
    expect(getLine(db, "test-line")!.operatingLoop).toBe("a changed loop, which does sync");
    setLineBudget(db, "test-line", 700);
    expect(updateLineFromSeed(db, seed({ budgetMonthlyCents: 4000 }))).toBe(true);
    expect(getLine(db, "test-line")!.budgetMonthlyCents).toBe(700);
  });

  // Tick 63 review: this test first pinned the seed's 2500 here. With the sync running before every scheduled tick, a
  // line added to portfolio.ts then held its seed's 4000 cents through every hourly tick until the daily board review,
  // and for good while the colony was switched off (measured on a copy of the committed colony.db). A seed's figure is
  // not an allocation (rules.ts allocateBudget), so a line the sync inserts starts at 0 and the board review allocates.
  it("starts a line it inserts at budget 0, for the board review to allocate", () => {
    const out = syncPortfolio(db, [seed({ id: "new-line", budgetMonthlyCents: 2500 })], []);
    expect(out.inserted).toEqual(["new-line"]);
    expect(getLine(db, "new-line")!.budgetMonthlyCents).toBe(0);
    // The first scheduled run on an empty database: the whole real portfolio, every seed carrying a budget, enters at 0.
    db.prepare("DELETE FROM revenue_lines").run();
    expect(DEFAULT_PORTFOLIO.every((s) => s.budgetMonthlyCents > 0)).toBe(true);
    expect(syncPortfolio(db).inserted.sort()).toEqual(DEFAULT_PORTFOLIO.map((s) => s.id).sort());
    expect(listLines(db).map((l) => [l.id, l.budgetMonthlyCents]).filter(([, cents]) => cents !== 0)).toEqual([]);
  });

  it("keeps the tier revenue_decide set, which the allocation weighs, and lists the difference", () => {
    insertLineFromSeed(db, seed({ tier: "core" }));
    setLineTier(db, "test-line", "experimental");
    const out = syncPortfolio(db, [seed({ tier: "core" })], []);
    expect(getLine(db, "test-line")!.tier).toBe("experimental");
    expect(out.tierDiffers).toEqual([{ id: "test-line", stored: "experimental", seed: "core" }]);
    expect(syncPortfolio(db, [seed({ tier: "experimental" })], []).tierDiffers).toEqual([]);
  });

  // Tick 63 review: the test below uses a live line, whose kill fields are null, so a sync that cleared them, or that
  // brought a killed line back, survived it (the review's probe mutants R63-X1 and R63-X4). The board review kills a
  // line by its criteria (heartbeat.ts) while portfolio.ts still lists it, and the hourly sync refreshes that line.
  it("keeps a line the board killed killed, with its kill time and reason, while portfolio.ts still lists it", () => {
    const listed = DEFAULT_PORTFOLIO[0];
    insertLineFromSeed(db, listed);
    updateLineStatus(db, listed.id, "killed", { reason: "kill criteria met: no stranger used it in 30 days", force: true });
    const before = getLine(db, listed.id)!;
    expect(before.killedAt).toBeTruthy();
    const out = syncPortfolio(db, [{ ...listed, operatingLoop: "a refreshed loop" }], []);
    expect(out.updated).toEqual([listed.id]);
    expect(out.killed).toEqual([]);
    const after = getLine(db, listed.id)!;
    expect(after.operatingLoop).toBe("a refreshed loop");
    expect({ status: after.status, killedAt: after.killedAt, killReason: after.killReason })
      .toEqual({ status: "killed", killedAt: before.killedAt, killReason: "kill criteria met: no stranger used it in 30 days" });
  });

  // Tick 63 review: with kv revenue.enabled = 0 the tick returns before it writes anything (runner.ts tick), and before
  // the sync was added to the scheduled run a switched-off colony's run changed no line. The sync keeps that.
  it("changes nothing while the colony is switched off, and applies everything once it is on again", () => {
    const dead = KILLED_LINES[0];
    insertLineFromSeed(db, seed());
    insertLineFromSeed(db, seed({ id: dead.id }));
    setRevenueColonyEnabled(db, false);
    const lines = () => db.prepare("SELECT * FROM revenue_lines ORDER BY id").all();
    const kv = () => db.prepare("SELECT key, value FROM kv ORDER BY key").all();
    const [linesBefore, kvBefore] = [lines(), kv()];
    const seeds = [seed({ operatingLoop: "a changed loop" }), seed({ id: "new-line" })];
    const off = syncPortfolio(db, seeds);
    expect(off).toEqual({ disabled: true, inserted: [], updated: [], killed: [], unknown: [], tierDiffers: [] });
    expect(lines()).toEqual(linesBefore);
    expect(kv()).toEqual(kvBefore);
    setRevenueColonyEnabled(db, true);
    const on = syncPortfolio(db, seeds);
    expect(on.disabled).toBe(false);
    expect(on.inserted).toEqual(["new-line"]);
    expect(on.updated).toEqual(["test-line"]);
    expect(on.killed.map((k) => k.id)).toEqual([dead.id]);
    expect(getLine(db, "test-line")!.operatingLoop).toBe("a changed loop");
  });

  it("keeps the line's status, setup-done flag, launch, creation and kill fields, and replaces portfolio.ts's columns", () => {
    insertLineFromSeed(db, seed({ humanSetup: ["open account"] }));
    setHumanSetupDone(db, "test-line", true);
    updateLineStatus(db, "test-line", "building");
    updateLineStatus(db, "test-line", "live");
    const before = getLine(db, "test-line")!;
    expect(before.launchedAt).toBeTruthy();
    const next = seed({
      name: "Renamed",
      category: "paid_api",
      directorRole: "director-renamed",
      operatingLoop: "a new loop",
      kpis: ["k1", "k2"],
      killCriteria: ["new kill"],
      scaleCriteria: ["new scale"],
      targetMonthlyAgorot: agorotFromIls(1234),
      humanSetup: ["a new step"],
      skillName: "revenue-renamed",
      status: "proposed",
    });
    expect(updateLineFromSeed(db, next)).toBe(true);
    const after = getLine(db, "test-line")!;
    expect({ status: after.status, humanSetupDone: after.humanSetupDone, launchedAt: after.launchedAt, createdAt: after.createdAt,
      killedAt: after.killedAt, killReason: after.killReason, tier: after.tier, budgetMonthlyCents: after.budgetMonthlyCents })
      .toEqual({ status: "live", humanSetupDone: true, launchedAt: before.launchedAt, createdAt: before.createdAt,
        killedAt: before.killedAt, killReason: before.killReason, tier: before.tier, budgetMonthlyCents: before.budgetMonthlyCents });
    expect({ name: after.name, category: after.category, directorRole: after.directorRole, operatingLoop: after.operatingLoop,
      kpis: after.kpis, killCriteria: after.killCriteria, scaleCriteria: after.scaleCriteria,
      targetMonthlyAgorot: after.targetMonthlyAgorot, humanSetup: after.humanSetup, skillName: after.skillName })
      .toEqual({ name: "Renamed", category: "paid_api", directorRole: "director-renamed", operatingLoop: "a new loop",
        kpis: ["k1", "k2"], killCriteria: ["new kill"], scaleCriteria: ["new scale"],
        targetMonthlyAgorot: agorotFromIls(1234), humanSetup: ["a new step"], skillName: "revenue-renamed" });
  });

  it("on the real portfolio: every budget the board set survives, and an already-killed line is not killed again", () => {
    seedDefaultPortfolio(db);
    for (const dead of KILLED_LINES) {
      insertLineFromSeed(db, seed({ id: dead.id, targetMonthlyAgorot: 0 }));
      updateLineStatus(db, dead.id, "killed", { reason: dead.reason, force: true });
    }
    for (const line of listLines(db)) setLineBudget(db, line.id, 0);
    expect(DEFAULT_PORTFOLIO.every((s) => s.budgetMonthlyCents > 0)).toBe(true);
    const out = syncPortfolio(db);
    expect(out.disabled).toBe(false);
    expect(out.updated.sort()).toEqual(DEFAULT_PORTFOLIO.map((s) => s.id).sort());
    expect(out.inserted).toEqual([]);
    expect(out.killed).toEqual([]);
    expect(out.tierDiffers).toEqual([]);
    expect(listLines(db)).toHaveLength(DEFAULT_PORTFOLIO.length + KILLED_LINES.length);
    expect(listLines(db).filter((l) => l.budgetMonthlyCents !== 0).map((l) => l.id)).toEqual([]);
  });
});
