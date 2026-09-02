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
  setTargets,
  updateLineStatus,
} from "../../revenue/ledger.js";
import { setFxRate, toAgorot, formatIls, agorotFromIls } from "../../revenue/money.js";
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
    const refund = recordLedgerEntry(db, { lineId: "test-line", kind: "refund", amountMinor: 500, currency: "ILS", source: "manual" });
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
    recordLedgerEntry(db, { lineId: "line-a", kind: "sale", amountMinor: 50_000, currency: "ILS", source: "manual" });
    recordLedgerEntry(db, { lineId: "line-b", kind: "sale", amountMinor: 30_000, currency: "ILS", source: "manual" });
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
