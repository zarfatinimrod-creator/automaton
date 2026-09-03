/**
 * Revenue Colony — the growth model
 *
 * The final goal is ₪1,000,000/year, or ₪83,333/month, from many stores rather
 * than one. That plan lives or dies on arithmetic, and the arithmetic has one
 * counter-intuitive property worth encoding in code rather than arguing about:
 *
 *   **Past a certain maintenance cost, launching more stores makes things
 *   worse, not better, and no number of them ever reaches the target.**
 *
 * Net revenue per launched store is `hitRate × hitCeiling − maintenance`. When
 * that is zero or negative, the portfolio is a treadmill: every new store adds
 * upkeep and, on average, less than it costs. Naive versions of "just open a
 * thousand stores" miss exactly this, so `storesNeededFor` returns null with a
 * reason instead of a large number.
 *
 * Nothing here is a forecast. It is a model with named inputs, and the inputs
 * must come from measurement — `TARGET_BASIS` in portfolio.ts is where the
 * measured ones live.
 */

/** ₪1,000,000/year, the owner's final goal, in monthly shekels. */
export const FINAL_GOAL_MONTHLY_ILS = Math.round(1_000_000 / 12);

export interface GrowthAssumptions {
  /** Share of launched stores that reach hitCeilingIls. 0-1. */
  hitRate: number;
  /** What a store that works earns per month. */
  hitCeilingIls: number;
  /** What a store that does not work earns per month. Usually 0. */
  missIls: number;
  /** Upkeep per store per month, whether it earns or not. The killer input. */
  maintenanceIlsPerStore: number;
}

/**
 * Grounded in what the colony has actually measured, not in optimism:
 * Apify's own documentation says the large majority of Actors get no users in
 * their first month, and our own measured line ceilings sit at ₪1,500-3,000.
 * Maintenance is deliberately not zero — a store nobody maintains still costs
 * compute to check, and pretending otherwise is how the treadmill hides.
 */
export const MEASURED_ASSUMPTIONS: GrowthAssumptions = {
  hitRate: 0.05,
  hitCeilingIls: 2000,
  missIls: 0,
  maintenanceIlsPerStore: 5,
};

export interface GrowthModel {
  storesLaunched: number;
  expectedHits: number;
  grossIls: number;
  maintenanceIls: number;
  netIls: number;
  /** Net contribution of one launched store. Negative means a treadmill. */
  netPerStoreIls: number;
  /** Share of gross eaten by upkeep. */
  maintenanceDrag: number;
}

function assertAssumptions(a: GrowthAssumptions): void {
  if (!(a.hitRate >= 0 && a.hitRate <= 1)) throw new Error("hitRate must be between 0 and 1");
  if (a.hitCeilingIls < 0 || a.missIls < 0 || a.maintenanceIlsPerStore < 0) {
    throw new Error("revenue and maintenance figures must not be negative");
  }
}

/** What a portfolio of `storesLaunched` stores earns, on these assumptions. */
export function modelPortfolio(storesLaunched: number, a: GrowthAssumptions = MEASURED_ASSUMPTIONS): GrowthModel {
  assertAssumptions(a);
  if (!Number.isFinite(storesLaunched) || storesLaunched < 0) {
    throw new Error("storesLaunched must be a non-negative number");
  }
  const expectedHits = storesLaunched * a.hitRate;
  const gross = expectedHits * a.hitCeilingIls + (storesLaunched - expectedHits) * a.missIls;
  const maintenance = storesLaunched * a.maintenanceIlsPerStore;
  const netPerStore = a.hitRate * a.hitCeilingIls + (1 - a.hitRate) * a.missIls - a.maintenanceIlsPerStore;
  return {
    storesLaunched,
    expectedHits,
    grossIls: gross,
    maintenanceIls: maintenance,
    netIls: gross - maintenance,
    netPerStoreIls: netPerStore,
    maintenanceDrag: gross > 0 ? maintenance / gross : 0,
  };
}

export interface StoresNeeded {
  /** null when no number of stores reaches the target on these assumptions. */
  stores: number | null;
  reason: string;
}

/**
 * How many stores must be LAUNCHED to net `targetIls` per month — not how many
 * succeed. Returns null when the model says never, which is the answer that
 * matters most.
 */
export function storesNeededFor(
  targetIls: number = FINAL_GOAL_MONTHLY_ILS,
  a: GrowthAssumptions = MEASURED_ASSUMPTIONS,
): StoresNeeded {
  assertAssumptions(a);
  if (targetIls <= 0) return { stores: 0, reason: "target is zero or negative" };

  const netPerStore = a.hitRate * a.hitCeilingIls + (1 - a.hitRate) * a.missIls - a.maintenanceIlsPerStore;
  if (netPerStore <= 0) {
    return {
      stores: null,
      reason:
        `each launched store nets ₪${netPerStore.toFixed(2)}/month, so more stores lose more money. ` +
        `A store must earn more than its ₪${a.maintenanceIlsPerStore} upkeep on average before any ` +
        "number of them reaches a target: raise the hit rate, raise what a hit earns, or cut upkeep.",
    };
  }
  const stores = Math.ceil(targetIls / netPerStore);
  return {
    stores,
    reason:
      `each launched store nets ₪${netPerStore.toFixed(2)}/month on average ` +
      `(${(a.hitRate * 100).toFixed(0)}% reach ₪${a.hitCeilingIls.toLocaleString("en")}, ` +
      `minus ₪${a.maintenanceIlsPerStore} upkeep each), so ₪${targetIls.toLocaleString("en")} needs ` +
      `${stores.toLocaleString("en")} launched — of which about ${Math.round(stores * a.hitRate).toLocaleString("en")} would work.`,
  };
}

/**
 * The most upkeep a store can carry and still let the target be reachable at a
 * given store count. This is the number a build decision should be checked
 * against: "can we run this store for less than X a month?"
 */
export function maintenanceCeilingIls(
  storesLaunched: number,
  targetIls: number = FINAL_GOAL_MONTHLY_ILS,
  a: GrowthAssumptions = MEASURED_ASSUMPTIONS,
): number {
  assertAssumptions(a);
  if (storesLaunched <= 0) return 0;
  const perStoreGross = a.hitRate * a.hitCeilingIls + (1 - a.hitRate) * a.missIls;
  return Math.max(0, perStoreGross - targetIls / storesLaunched);
}

/** A readable table of scenarios, for the plan docs and the board report. */
export function scenarioTable(
  targetIls: number = FINAL_GOAL_MONTHLY_ILS,
  hitRates: number[] = [0.01, 0.02, 0.05, 0.1, 0.2],
  ceilings: number[] = [1000, 2000, 3000, 5000],
  a: GrowthAssumptions = MEASURED_ASSUMPTIONS,
): { hitRate: number; byCeiling: { ceilingIls: number; stores: number | null }[] }[] {
  return hitRates.map((hitRate) => ({
    hitRate,
    byCeiling: ceilings.map((ceilingIls) => ({
      ceilingIls,
      stores: storesNeededFor(targetIls, { ...a, hitRate, hitCeilingIls: ceilingIls }).stores,
    })),
  }));
}

// ── Promotion effort, which is the same wall as maintenance cost ──
//
// 878 stores that nobody can find earn ₪0, so promotion is the critical path
// to the final goal. But per-store promotion runs into arithmetic before it
// runs into creativity: at even one hour per store per month, a 878-store
// portfolio consumes 878 hours a month. That is not a scheduling problem, it
// is an impossibility, and it rules out a whole class of otherwise sensible
// ideas — "post about each store", "answer comments per listing", "build
// backlinks per shop".
//
// What survives is STRUCTURAL promotion: one system that promotes every store
// at once, whose cost does not scale with the store count. A hub site, a
// sitemap, a machine-readable catalogue, one newsletter, one directory
// submission covering the portfolio. These helpers exist so the board can
// check a promotion proposal against the wall instead of arguing about it.

/** Hours per month a portfolio consumes at a given per-store effort. */
export function promotionLoadHours(stores: number, hoursPerStorePerMonth: number): number {
  if (!Number.isFinite(stores) || stores < 0) throw new Error("stores must be a non-negative number");
  if (!Number.isFinite(hoursPerStorePerMonth) || hoursPerStorePerMonth < 0) {
    throw new Error("hoursPerStorePerMonth must be a non-negative number");
  }
  return stores * hoursPerStorePerMonth;
}

/**
 * The most per-store effort a portfolio can carry inside a monthly hour
 * budget. Approaches zero as the store count rises, which is the point: past a
 * few hundred stores, any promotion that touches a store individually is out,
 * however cheap it looks per store.
 */
export function perStoreEffortCeilingHours(stores: number, monthlyHoursAvailable: number): number {
  if (stores <= 0) return monthlyHoursAvailable;
  if (!Number.isFinite(monthlyHoursAvailable) || monthlyHoursAvailable < 0) {
    throw new Error("monthlyHoursAvailable must be a non-negative number");
  }
  return monthlyHoursAvailable / stores;
}

/** True when a promotion tactic scales to this many stores inside the budget. */
export function promotionFits(
  stores: number,
  hoursPerStorePerMonth: number,
  monthlyHoursAvailable: number,
): boolean {
  return promotionLoadHours(stores, hoursPerStorePerMonth) <= monthlyHoursAvailable;
}

// ── The cap nobody costed: distinct data, not build hours ──
//
// Every version of the many-stores plan so far has been bounded by effort —
// build hours, maintenance shekels, promotion hours. All three are real and all
// three are the wrong binding constraint.
//
// The store-promotion sweep produced a rule that changes the arithmetic:
// storefront N+1 may not be storefront N with a city, a niche or a keyword
// substituted (`constraints.ts`, `unique-data-per-store`). Google names that in
// four spam policies at once, and treats the whole set as one property. So the
// honest store count is not "how many can we build" — it is **how many
// genuinely distinct datasets, tools or audiences we can actually source**.
//
// That number is far smaller than the build-hours number, and it is the one
// that decides whether the final goal is reachable. 878 stores needs 878
// distinct things to sell. Nobody has counted them, and until somebody does,
// the store target is a wish rather than a plan.

/** A store must rest on its own data. One dataset supports one honest store. */
export const STORES_PER_DISTINCT_DATASET = 1;

export interface HonestStorePlan {
  /** Stores the plan calls for. */
  storesPlanned: number;
  /** Distinct datasets, tools or audiences actually sourced for them. */
  distinctSources: number;
  /** The most stores those sources honestly support. */
  honestCeiling: number;
  /** How many stores the plan cannot justify. */
  shortfall: number;
  ok: boolean;
  /** Why, in the words the board should hear. */
  reason: string;
}

/**
 * Check a store-count plan against the data it actually has.
 *
 * This is deliberately blunt: a plan for 900 stores backed by 12 datasets is
 * not 93% honest, it is a substitution portfolio with 12 real stores in it.
 */
export function checkHonestStorePlan(storesPlanned: number, distinctSources: number): HonestStorePlan {
  if (!Number.isFinite(storesPlanned) || storesPlanned < 0) throw new Error("storesPlanned must be a non-negative number");
  if (!Number.isFinite(distinctSources) || distinctSources < 0) throw new Error("distinctSources must be a non-negative number");

  const honestCeiling = distinctSources * STORES_PER_DISTINCT_DATASET;
  const shortfall = Math.max(0, storesPlanned - honestCeiling);
  const ok = shortfall === 0;

  return {
    storesPlanned,
    distinctSources,
    honestCeiling,
    shortfall,
    ok,
    reason: ok
      ? `${storesPlanned} stores rest on ${distinctSources} distinct sources. Each store has something of its own to sell.`
      : `${storesPlanned} stores rest on only ${distinctSources} distinct sources, so ${shortfall} of them would have to be variations of another store. That is doorway abuse under Google's own definition, and it risks the whole set, not just the ${shortfall}. Either source ${shortfall} more datasets or plan ${honestCeiling} stores.`,
  };
}

/**
 * The distinct sources the final goal needs, given the same hit-rate model the
 * rest of this file uses. This is the number to go and count.
 */
export function distinctSourcesNeededFor(
  targetIls: number,
  a: GrowthAssumptions = MEASURED_ASSUMPTIONS,
): StoresNeeded {
  const needed = storesNeededFor(targetIls, a);
  if (needed.stores === null) return needed;
  return {
    ...needed,
    reason: `${needed.stores} stores at these assumptions, and under the unique-data constraint that is ${needed.stores} distinct datasets, tools or audiences — not ${needed.stores} copies of one. Counting them is the open question the store target rests on.`,
  };
}
