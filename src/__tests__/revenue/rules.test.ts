import { describe, it, expect } from "vitest";
import { policyForLine } from "../../revenue/portfolio.js";
import { allocateBudget, auditDecision, decideLine, experimentsToPause } from "../../revenue/rules.js";
import { DEFAULT_DECISION_POLICY, type LineDecision, type LineMetrics, type RevenueLine } from "../../revenue/types.js";

function line(overrides: Partial<RevenueLine> = {}): RevenueLine {
  return {
    id: "l1",
    name: "Line",
    category: "micro_saas",
    tier: "growth",
    status: "live",
    directorRole: "director-l1",
    operatingLoop: "loop",
    kpis: [],
    killCriteria: [],
    scaleCriteria: [],
    targetMonthlyAgorot: 200_000,
    budgetMonthlyCents: 1000,
    humanSetup: [],
    humanSetupDone: false,
    skillName: null,
    launchedAt: "2026-07-01T00:00:00.000Z",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    killedAt: null,
    killReason: null,
    ...overrides,
  };
}

function metrics(overrides: Partial<LineMetrics> = {}): LineMetrics {
  return {
    lineId: "l1",
    status: "live",
    revenue30dAgorot: 0,
    revenue7dAgorot: 0,
    refunds30dAgorot: 0,
    cost30dAgorot: 0,
    net30dAgorot: 0,
    transactions30d: 0,
    trend: 1,
    daysSinceCreated: 60,
    daysSinceLaunch: 60,
    daysSinceLastRevenue: null,
    targetMonthlyAgorot: 200_000,
    targetAttainment: 0,
    ...overrides,
  };
}

describe("revenue/rules decideLine", () => {
  it("holds killed and paused lines", () => {
    expect(decideLine(line({ status: "killed" }), metrics()).decision).toBe("hold");
    expect(decideLine(line({ status: "paused" }), metrics()).decision).toBe("hold");
  });

  it("escalates lines blocked on human setup", () => {
    const d = decideLine(line({ status: "awaiting_setup", humanSetup: ["open account"] }), metrics());
    expect(d.decision).toBe("escalate");
    expect(d.triggered).toContain("awaiting_human_setup");
  });

  it("words a setup block from what is still asked when the caller passes it, else from the stored list", () => {
    // Tick 32 review: the board's rationale listed setup items whose owner steps were done. The caller that knows the
    // checklist (heartbeat.ts, owner-steps.ts describeOpenSetup) passes what is still asked; the decision is unchanged.
    const blocked = line({ status: "awaiting_setup", humanSetup: ["open account", "paste token"] });
    expect(decideLine(blocked, metrics()).rationale).toBe("blocked on one-time human setup: open account; paste token");
    const d = decideLine(blocked, metrics(), undefined, { setupStillAsked: "paste token" });
    expect(d.rationale).toBe("blocked on one-time human setup: paste token");
    expect(d.decision).toBe("escalate");
    expect(decideLine(line({ status: "awaiting_setup" }), metrics()).rationale).toBe("blocked on one-time human setup: unspecified");
  });

  it("escalates an overdue build with no revenue, holds within grace", () => {
    expect(decideLine(line({ status: "building" }), metrics({ daysSinceCreated: 10 })).decision).toBe("hold");
    const d = decideLine(line({ status: "building" }), metrics({ daysSinceCreated: 31 }));
    expect(d.decision).toBe("escalate");
    expect(d.triggered).toContain("build_overdue");
  });

  it("kills a live line under the floor after the grace period", () => {
    // Fixture target 200_000 → default floor 25% = 50_000. Grace is 90 days from the first shekel
    // (RULING-2026-09-28-floors.md §8), so the same revenue at day 60 is still inside it.
    const d = decideLine(line(), metrics({ revenue30dAgorot: 10_000, daysSinceLaunch: 100 }));
    expect(d.decision).toBe("kill");
    expect(d.triggered).toContain("below_kill_floor");
    expect(decideLine(line(), metrics({ revenue30dAgorot: 10_000, daysSinceLaunch: 60 })).decision).toBe("hold");
  });

  it("the floor is a fraction of the line's own target and never sits above it", () => {
    // The 7.9 retarget left a fixed ₪500 floor above three of four targets: a line at its own target was killed.
    const small = line({ targetMonthlyAgorot: 40_000 });
    const m = metrics({ revenue30dAgorot: 18_000, daysSinceLaunch: 100, daysSinceLastRevenue: 1 });
    const half = decideLine(small, m, { ...DEFAULT_DECISION_POLICY, killFloorFraction: 0.5 });
    expect(half.decision).toBe("kill"); // floor 20_000
    expect(half.triggered).toContain("below_kill_floor");
    const quarter = decideLine(small, m, { ...DEFAULT_DECISION_POLICY, killFloorFraction: 0.25 });
    expect(quarter.decision).not.toBe("kill"); // floor 10_000
    for (const f of [0.25, 0.5, 1]) {
      for (const target of [20_000, 30_000, 40_000, 60_000, 200_000]) {
        const atTarget = metrics({
          revenue30dAgorot: target, net30dAgorot: target, daysSinceLaunch: 100, daysSinceLastRevenue: 1,
          targetMonthlyAgorot: target, targetAttainment: 1,
        });
        const d = decideLine(line({ targetMonthlyAgorot: target }), atTarget, { ...DEFAULT_DECISION_POLICY, killFloorFraction: f });
        expect(d.decision, `f=${f} target=${target}`).not.toBe("kill");
      }
    }
  });

  it("a live line with no target escalates until the board sets one", () => {
    const d = decideLine(line({ targetMonthlyAgorot: 0 }), metrics({ daysSinceLaunch: 100 }));
    expect(d.decision).toBe("escalate");
    expect(d.triggered).toContain("target_unset");
  });

  it("pins the grace and the default floor fraction, and the fixed shekel floor is gone", () => {
    expect(DEFAULT_DECISION_POLICY.graceDays).toBe(90);
    expect(DEFAULT_DECISION_POLICY.killFloorFraction).toBe(0.25);
    expect(DEFAULT_DECISION_POLICY).not.toHaveProperty("killFloorAgorot");
  });

  it("does not kill before the grace period", () => {
    const d = decideLine(line(), metrics({ revenue30dAgorot: 0, daysSinceLaunch: 10, daysSinceLastRevenue: null }));
    expect(d.decision).toBe("hold");
  });

  it("pivots once on cost blow-out then kills", () => {
    const m = metrics({ revenue30dAgorot: 60_000, net30dAgorot: -100_000, cost30dAgorot: 160_000, daysSinceLaunch: 30, daysSinceLastRevenue: 1 });
    expect(decideLine(line(), m).decision).toBe("pivot");
    expect(decideLine(line(), m, DEFAULT_DECISION_POLICY, { previousDecision: "pivot" }).decision).toBe("kill");
  });

  it("scales when target is reached with margin", () => {
    const m = metrics({ revenue30dAgorot: 220_000, net30dAgorot: 180_000, cost30dAgorot: 40_000, targetAttainment: 1.1, daysSinceLastRevenue: 1 });
    const d = decideLine(line(), m);
    expect(d.decision).toBe("scale");
    expect(d.triggered).toContain("target_reached");
    // already scaling → hold
    expect(decideLine(line({ status: "scaling" }), m).decision).toBe("hold");
  });

  it("escalates on revenue collapse and stale revenue", () => {
    const collapse = metrics({ revenue30dAgorot: 100_000, net30dAgorot: 100_000, trend: 0.2, daysSinceLastRevenue: 2 });
    expect(decideLine(line(), collapse).triggered).toContain("revenue_collapse");
    const stale = metrics({ revenue30dAgorot: 100_000, net30dAgorot: 100_000, trend: 1, daysSinceLastRevenue: 25 });
    expect(decideLine(line(), stale).triggered).toContain("stale_revenue");
  });

  it("gives a monthly-payout rail one statement cycle before stale_revenue (RULING-2026-09-29-lines.md (c))", () => {
    // Apify invoices on the 11th and approves on the 14th, so a live Apify line is silent for most of every month. Its
    // policy (TARGET_BASIS staleDays 45 = one cycle ≤ 31 days + 14) holds at 40 days and escalates at 46.
    const apifyPolicy = policyForLine("apify-actors");
    const apify = line({ id: "apify-actors" });
    const quiet = (days: number) =>
      metrics({ lineId: "apify-actors", revenue30dAgorot: 100_000, net30dAgorot: 100_000, trend: 1, daysSinceLastRevenue: days });
    const at40 = decideLine(apify, quiet(40), apifyPolicy);
    expect(at40.decision).toBe("hold");
    expect(at40.triggered).not.toContain("stale_revenue");
    const at46 = decideLine(apify, quiet(46), apifyPolicy);
    expect(at46.decision).toBe("escalate");
    expect(at46.triggered).toContain("stale_revenue");
    // The same 40 days on a per-sale line under the default policy is stale: the override is the monthly rail's alone.
    expect(decideLine(line(), quiet(40)).triggered).toContain("stale_revenue");
    expect(decideLine(line({ id: "il-biz-tools" }), quiet(25), policyForLine("il-biz-tools")).triggered).toContain("stale_revenue");
  });
});

describe("revenue/rules portfolio helpers", () => {
  it("pauses experiments beyond the cap, newest first", () => {
    const lines = [
      line({ id: "a", tier: "experimental", status: "live", createdAt: "2026-01-01" }),
      line({ id: "b", tier: "experimental", status: "building", createdAt: "2026-02-01" }),
      line({ id: "c", tier: "experimental", status: "live", createdAt: "2026-03-01" }),
      line({ id: "d", tier: "experimental", status: "live", createdAt: "2026-04-01" }),
      line({ id: "core", tier: "core", status: "live", createdAt: "2026-05-01" }),
    ];
    expect(experimentsToPause(lines, { ...DEFAULT_DECISION_POLICY, maxExperiments: 3 })).toEqual(["d"]);
    expect(experimentsToPause(lines, { ...DEFAULT_DECISION_POLICY, maxExperiments: 5 })).toEqual([]);
  });

  it("allocates the full budget by tier and performance, zero to kills", () => {
    const lines = [
      line({ id: "core", tier: "core", status: "live" }),
      line({ id: "exp", tier: "experimental", status: "building" }),
      line({ id: "dead", tier: "growth", status: "live" }),
      line({ id: "prop", tier: "growth", status: "proposed" }),
    ];
    const metricsById = new Map<string, LineMetrics>([
      ["core", metrics({ lineId: "core", targetAttainment: 1 })],
      ["exp", metrics({ lineId: "exp" })],
      ["dead", metrics({ lineId: "dead" })],
    ]);
    const decisions = new Map<string, LineDecision>([
      ["dead", { lineId: "dead", decision: "kill", rationale: "x", triggered: [] }],
    ]);
    const alloc = allocateBudget(10_000, lines, metricsById, decisions, 500);
    expect(alloc.get("dead")).toBe(0);
    expect(alloc.get("prop")).toBe(0);
    expect((alloc.get("core") ?? 0) + (alloc.get("exp") ?? 0)).toBe(10_000);
    expect(alloc.get("core")!).toBeGreaterThan(alloc.get("exp")!);
    expect(alloc.get("exp")!).toBeGreaterThanOrEqual(500);
  });

  it("audits decisions: exact match approves, lenient deviation flags, stricter is accepted", () => {
    expect(auditDecision("hold", "hold").verdict).toBe("approve");
    expect(auditDecision("hold", "kill").verdict).toBe("flag");
    expect(auditDecision("kill", "hold").verdict).toBe("approve");
    expect(auditDecision("hold", "scale").verdict).toBe("flag");
  });
});
