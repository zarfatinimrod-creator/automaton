import { portfolioTargetAgorot } from "../../revenue/portfolio.js";
import { describe, it, expect } from "vitest";
import {
  FINAL_GOAL_MONTHLY_ILS,
  PLANNING_ASSUMPTIONS,
  maintenanceCeilingIls,
  modelPortfolio,
  scenarioTable,
  storesNeededFor,
  goalCoverage,
  FIRST_TARGET_MONTHLY_ILS,
  auditedCeilingScenarios,
  BEST_AUDITED_LINE_CEILING_ILS,
  MODAL_AUDITED_LINE_CEILING_ILS,
  checkHonestStorePlan,
  distinctSourcesNeededFor,
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
    const { stores } = storesNeededFor(FINAL_GOAL_MONTHLY_ILS, PLANNING_ASSUMPTIONS);
    expect(stores).not.toBeNull();
    expect(stores!).toBeGreaterThan(500);
    expect(stores!).toBeLessThan(1500);
  });

  it("needs fewer stores as hits get better or more frequent", () => {
    const base = storesNeededFor(FINAL_GOAL_MONTHLY_ILS, PLANNING_ASSUMPTIONS).stores!;
    const betterRate = storesNeededFor(FINAL_GOAL_MONTHLY_ILS, { ...PLANNING_ASSUMPTIONS, hitRate: 0.2 }).stores!;
    const betterCeiling = storesNeededFor(FINAL_GOAL_MONTHLY_ILS, { ...PLANNING_ASSUMPTIONS, hitCeilingIls: 5000 }).stores!;
    expect(betterRate).toBeLessThan(base);
    expect(betterCeiling).toBeLessThan(base);
  });

  it("refuses to answer with a number when upkeep exceeds average earnings", () => {
    // This is the whole point of the file. At ₪5 upkeep and a 5% hit rate, a
    // store must average more than ₪5 — so a ₪80 hit ceiling is a treadmill.
    const treadmill = storesNeededFor(FINAL_GOAL_MONTHLY_ILS, {
      ...PLANNING_ASSUMPTIONS, hitCeilingIls: 80,
    });
    expect(treadmill.stores).toBeNull();
    expect(treadmill.reason).toContain("more stores lose more money");
  });

  it("makes the treadmill visible in the model, not just in the answer", () => {
    const m = modelPortfolio(1000, { ...PLANNING_ASSUMPTIONS, hitCeilingIls: 80 });
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
    expect(() => modelPortfolio(10, { ...PLANNING_ASSUMPTIONS, hitRate: 1.5 })).toThrow(/between 0 and 1/);
    expect(() => modelPortfolio(10, { ...PLANNING_ASSUMPTIONS, hitCeilingIls: -1 })).toThrow(/negative/);
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

describe("the cap that decides the final goal: distinct data, not build hours", () => {
  it("rejects a plan whose stores outnumber the things it has to sell", () => {
    const plan = checkHonestStorePlan(900, 12);
    expect(plan.ok).toBe(false);
    expect(plan.honestCeiling).toBe(12);
    expect(plan.shortfall).toBe(888);
    // The wording matters: the board must hear that the risk lands on the whole
    // set, not only on the stores that could not be justified.
    expect(plan.reason).toMatch(/whole set/);
  });

  it("does not grade a substitution portfolio on a curve", () => {
    // 93% of stores backed by real data is not 93% honest. It is a doorway
    // network with a real part inside it, and the verdict is binary.
    expect(checkHonestStorePlan(100, 93).ok).toBe(false);
    expect(checkHonestStorePlan(100, 100).ok).toBe(true);
  });

  it("passes a plan that has one source per store", () => {
    const plan = checkHonestStorePlan(40, 40);
    expect(plan.ok).toBe(true);
    expect(plan.shortfall).toBe(0);
  });

  it("treats zero stores as trivially honest rather than an error", () => {
    expect(checkHonestStorePlan(0, 0).ok).toBe(true);
  });

  it("restates the final goal as a number of datasets somebody has to count", () => {
    const needed = distinctSourcesNeededFor(FINAL_GOAL_MONTHLY_ILS, PLANNING_ASSUMPTIONS);
    expect(needed.stores).toBe(storesNeededFor(FINAL_GOAL_MONTHLY_ILS, PLANNING_ASSUMPTIONS).stores);
    expect(needed.reason).toMatch(/distinct datasets/);
    expect(needed.reason).not.toMatch(/copies of one\b(?!.)/);
  });

  it("carries the impossibility through instead of inventing a dataset count", () => {
    // When upkeep swallows average earnings, storesNeededFor returns null. The
    // dataset question is meaningless there and must not be answered anyway.
    const treadmill = distinctSourcesNeededFor(FINAL_GOAL_MONTHLY_ILS, {
      ...PLANNING_ASSUMPTIONS,
      maintenanceIlsPerStore: 1000,
    });
    expect(treadmill.stores).toBeNull();
  });
});

describe("the plan's own arithmetic against the owner's target", () => {
  const plannedIls = portfolioTargetAgorot() / 100;

  it("surfaces the shortfall the shipped portfolio actually has", () => {
    // Found by the completeness critic across seven audited groups, and nobody
    // had checked it: DEFAULT_PORTFOLIO's nine targets sum to ₪16,500 against a
    // ₪20,000 first target. Every line could hit its number in full and the goal
    // would still be missed.
    const c = goalCoverage(plannedIls);
    expect(c.coversGoal).toBe(false);
    expect(c.gapIls).toBe(FIRST_TARGET_MONTHLY_ILS - plannedIls);
    expect(c.gapIls).toBeGreaterThan(0);
  });

  it("tells whoever hits this failure what the honest fix is, and what it is not", () => {
    // The tempting fix is to raise existing targets until they add up. That is
    // the exact dishonesty the auditors keep finding in the research, applied to
    // our own numbers.
    const c = goalCoverage(plannedIls);
    expect(c.reason).toMatch(/Do not raise existing targets/);
    expect(c.reason).toMatch(/add(ing)? a line with evidence behind it/);
  });

  it("passes only when the plan genuinely aims at the number", () => {
    expect(goalCoverage(20_000).coversGoal).toBe(true);
    expect(goalCoverage(25_000).coversGoal).toBe(true);
    expect(goalCoverage(19_999).coversGoal).toBe(false);
  });

  it("says nothing about whether the targets are earnable — a separate question", () => {
    // goalCoverage answers the cheaper prior question. TARGET_BASIS grades
    // achievability, and the auditors have been cutting those grades all week.
    expect(goalCoverage(20_000).reason).toMatch(/separate question/);
  });

  it("rejects nonsense inputs rather than returning a misleading coverage", () => {
    expect(() => goalCoverage(-1)).toThrow();
    expect(() => goalCoverage(1000, 0)).toThrow();
  });
});

describe("the store count at the ceilings the audits actually support", () => {
  it("shows what the plan's assumed ceiling costs against the audited ones", () => {
    const rows = auditedCeilingScenarios();
    const assumed = rows.find((r) => r.ceilingIls === PLANNING_ASSUMPTIONS.hitCeilingIls)!;
    const best = rows.find((r) => r.ceilingIls === BEST_AUDITED_LINE_CEILING_ILS)!;
    const modal = rows.find((r) => r.ceilingIls === MODAL_AUDITED_LINE_CEILING_ILS)!;

    // The plan assumes a per-winner ceiling above every line that survived audit,
    // so the honest store count is strictly larger than the one MISSION.md names.
    expect(assumed.stores!).toBeLessThan(best.stores!);
    expect(best.stores!).toBeLessThan(modal.stores!);
    expect(modal.stores! / assumed.stores!).toBeGreaterThan(4);
  });

  it("keeps the assumed ceiling above the best audited line, which is the point of the table", () => {
    // If someone lowers hitCeilingIls to match the evidence, this test should be
    // deleted along with the correction note in MISSION.md — not silently kept.
    expect(PLANNING_ASSUMPTIONS.hitCeilingIls).toBeGreaterThan(BEST_AUDITED_LINE_CEILING_ILS);
  });

  it("carries the impossibility through rather than inventing a store count", () => {
    const rows = auditedCeilingScenarios(FINAL_GOAL_MONTHLY_ILS, {
      ...PLANNING_ASSUMPTIONS,
      maintenanceIlsPerStore: 1000,
    });
    expect(rows.every((r) => r.stores === null)).toBe(true);
  });
});
