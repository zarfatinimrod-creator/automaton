import { describe, it, expect } from "vitest";
import {
  FINAL_GOAL_MONTHLY_ILS,
  MEASURED_ASSUMPTIONS,
  maintenanceCeilingIls,
  modelPortfolio,
  scenarioTable,
  storesNeededFor,
  promotionLoadHours,
  perStoreEffortCeilingHours,
  promotionFits,
} from "../../revenue/growth.js";

describe("the final goal's arithmetic", () => {
  it("states the goal in monthly shekels", () => {
    expect(FINAL_GOAL_MONTHLY_ILS).toBe(83_333);
  });

  it("says 1000 stores is roughly the right order of magnitude", () => {
    // The owner's instinct, checked: 5% of stores reaching ₪2,000 is the
    // measured-plausible case, and it lands near a thousand.
    const { stores } = storesNeededFor(FINAL_GOAL_MONTHLY_ILS, MEASURED_ASSUMPTIONS);
    expect(stores).not.toBeNull();
    expect(stores!).toBeGreaterThan(500);
    expect(stores!).toBeLessThan(1500);
  });

  it("needs fewer stores as hits get better or more frequent", () => {
    const base = storesNeededFor(FINAL_GOAL_MONTHLY_ILS, MEASURED_ASSUMPTIONS).stores!;
    const betterRate = storesNeededFor(FINAL_GOAL_MONTHLY_ILS, { ...MEASURED_ASSUMPTIONS, hitRate: 0.2 }).stores!;
    const betterCeiling = storesNeededFor(FINAL_GOAL_MONTHLY_ILS, { ...MEASURED_ASSUMPTIONS, hitCeilingIls: 5000 }).stores!;
    expect(betterRate).toBeLessThan(base);
    expect(betterCeiling).toBeLessThan(base);
  });

  it("refuses to answer with a number when upkeep exceeds average earnings", () => {
    // This is the whole point of the file. At ₪5 upkeep and a 5% hit rate, a
    // store must average more than ₪5 — so a ₪80 hit ceiling is a treadmill.
    const treadmill = storesNeededFor(FINAL_GOAL_MONTHLY_ILS, {
      ...MEASURED_ASSUMPTIONS, hitCeilingIls: 80,
    });
    expect(treadmill.stores).toBeNull();
    expect(treadmill.reason).toContain("more stores lose more money");
  });

  it("makes the treadmill visible in the model, not just in the answer", () => {
    const m = modelPortfolio(1000, { ...MEASURED_ASSUMPTIONS, hitCeilingIls: 80 });
    expect(m.netPerStoreIls).toBeLessThan(0);
    expect(m.netIls).toBeLessThan(0);
    expect(m.maintenanceDrag).toBeGreaterThan(1);
  });

  it("scales linearly and keeps gross, upkeep and net consistent", () => {
    const m = modelPortfolio(1000);
    expect(m.expectedHits).toBeCloseTo(50);
    expect(m.grossIls).toBeCloseTo(100_000);
    expect(m.maintenanceIls).toBeCloseTo(5_000);
    expect(m.netIls).toBeCloseTo(95_000);
    expect(m.netIls).toBeCloseTo(m.grossIls - m.maintenanceIls);
    expect(modelPortfolio(2000).netIls).toBeCloseTo(m.netIls * 2);
  });

  it("returns an empty portfolio for zero stores rather than dividing by it", () => {
    const m = modelPortfolio(0);
    expect(m.netIls).toBe(0);
    expect(m.maintenanceDrag).toBe(0);
  });

  it("gives a build decision an upkeep ceiling to be checked against", () => {
    // At 1,000 stores the target needs ₪83.33 net per store, and gross per
    // store is ₪100, so upkeep must stay under ₪16.67.
    const ceiling = maintenanceCeilingIls(1000);
    expect(ceiling).toBeCloseTo(100 - 83_333 / 1000, 1);
    // Too few stores and no upkeep at all is affordable.
    expect(maintenanceCeilingIls(100)).toBe(0);
    expect(maintenanceCeilingIls(0)).toBe(0);
  });

  it("rejects impossible assumptions instead of returning nonsense", () => {
    expect(() => modelPortfolio(10, { ...MEASURED_ASSUMPTIONS, hitRate: 1.5 })).toThrow(/between 0 and 1/);
    expect(() => modelPortfolio(10, { ...MEASURED_ASSUMPTIONS, hitCeilingIls: -1 })).toThrow(/negative/);
    expect(() => modelPortfolio(-5)).toThrow(/non-negative/);
  });

  it("builds a scenario table whose best case needs fewest stores", () => {
    const table = scenarioTable();
    expect(table).toHaveLength(5);
    const worst = table[0].byCeiling[0].stores!;
    const best = table[table.length - 1].byCeiling[3].stores!;
    expect(best).toBeLessThan(worst);
    for (const row of table) {
      const counts = row.byCeiling.map((c) => c.stores!);
      expect([...counts].sort((a, b) => b - a)).toEqual(counts);
    }
  });
});

describe("promotion effort hits the same wall as maintenance cost", () => {
  it("shows that per-store promotion is arithmetically impossible at scale", () => {
    // One hour per store per month, at the store count the final goal needs.
    expect(promotionLoadHours(878, 1)).toBe(878);
    // Even six minutes a store a month is most of a working week.
    expect(promotionLoadHours(878, 0.1)).toBeCloseTo(87.8);
  });

  it("gives a per-store effort ceiling that shrinks as the portfolio grows", () => {
    // 160 hours a month of agent time is a generous allowance.
    expect(perStoreEffortCeilingHours(10, 160)).toBe(16);
    expect(perStoreEffortCeilingHours(878, 160)).toBeCloseTo(0.182, 3);
    // ~11 minutes per store per month at 878 stores. Anything touching a store
    // individually is out; only portfolio-wide promotion survives.
    expect(perStoreEffortCeilingHours(878, 160) * 60).toBeLessThan(12);
  });

  it("answers whether a specific tactic fits", () => {
    expect(promotionFits(878, 0.1, 160)).toBe(true);
    expect(promotionFits(878, 1, 160)).toBe(false);
    // A structural tactic costs the same whatever the store count.
    expect(promotionFits(878, 0, 160)).toBe(true);
  });

  it("treats an empty portfolio as having the whole budget", () => {
    expect(perStoreEffortCeilingHours(0, 160)).toBe(160);
    expect(promotionLoadHours(0, 5)).toBe(0);
  });

  it("rejects nonsense rather than returning it", () => {
    expect(() => promotionLoadHours(-1, 1)).toThrow(/non-negative/);
    expect(() => promotionLoadHours(10, -1)).toThrow(/non-negative/);
    expect(() => perStoreEffortCeilingHours(10, -1)).toThrow(/non-negative/);
  });
});
