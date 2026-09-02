import { describe, it, expect } from "vitest";
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

  it("escalates an overdue build with no revenue, holds within grace", () => {
    expect(decideLine(line({ status: "building" }), metrics({ daysSinceCreated: 10 })).decision).toBe("hold");
    const d = decideLine(line({ status: "building" }), metrics({ daysSinceCreated: 31 }));
    expect(d.decision).toBe("escalate");
    expect(d.triggered).toContain("build_overdue");
  });

  it("kills a live line under the floor after the grace period", () => {
    const d = decideLine(line(), metrics({ revenue30dAgorot: 10_000, daysSinceLaunch: 50 }));
    expect(d.decision).toBe("kill");
    expect(d.triggered).toContain("below_kill_floor");
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
