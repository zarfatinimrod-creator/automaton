import { createHash } from "node:crypto";
import { describe, it, expect } from "vitest";
import {
  FACELESS_YOUTUBE_EXPERIMENT,
  WEB_ARM_REACH,
  evaluateExperiment,
  evaluateWebArm,
  type ExperimentReadings,
} from "../../revenue/experiments.js";
import { decideLine, experimentsToPause } from "../../revenue/rules.js";
import { LINE_STATUSES, LINE_TRANSITIONS } from "../../revenue/ledger.js";
import type { LineMetrics, RevenueLine } from "../../revenue/types.js";

const SPEC = FACELESS_YOUTUBE_EXPERIMENT;

function readings(overrides: Partial<ExperimentReadings> = {}): ExperimentReadings {
  return {
    day: 0,
    t1Passed: true,
    videosPassedGate: 6,
    medianStrangerViews: null,
    strangerWatchHours28d: null,
    averageViewPercentage: null,
    policySignal: false,
    ungrantedRecurringCost: false,
    // T1's upload read back not made for kids, as declared: no override (P-2's count is the read-back's `true` entries).
    // The unread and true cases are t1-made-for-kids-kill.test.ts and kids-explainers-kills.test.ts (ruling 4.10 §10,
    // which applies to T1 alike).
    madeForKidsReadback: ["false"],
    maxRunnerMinutesPerVideo: 20,
    maxTokenCostIlsPerVideo: 8,
    ...overrides,
  };
}

describe("faceless-YouTube experiment gates (VERDICT §10 as amended by RED-TEAM §2.3-2.5)", () => {
  it("continues while nothing is due", () => {
    const v = evaluateExperiment(SPEC, readings({ day: 10 }));
    expect(v.decision).toBe("continue");
    expect(v.triggered).toEqual([]);
  });

  it("stays rejected when T1 fails — there is no owner-free public route", () => {
    const v = evaluateExperiment(SPEC, readings({ day: 1, t1Passed: false }));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toContain("K-T1");
  });

  it("does not judge T1 before it has run", () => {
    expect(evaluateExperiment(SPEC, readings({ day: 1, t1Passed: null })).decision).toBe("continue");
  });

  it("kills on supply when six gate-passing videos are not ready by day 42", () => {
    expect(evaluateExperiment(SPEC, readings({ day: 41, videosPassedGate: 3 })).decision).toBe("continue");
    const v = evaluateExperiment(SPEC, readings({ day: 42, videosPassedGate: 5 }));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toContain("K-supply");
  });

  it("K0 at day 56: a median under 35 stranger views kills; 35 is a no-information pass", () => {
    const kill = evaluateExperiment(SPEC, readings({ day: 56, medianStrangerViews: 34 }));
    expect(kill.decision).toBe("kill");
    expect(kill.triggered).toContain("K0");
    const pass = evaluateExperiment(SPEC, readings({ day: 56, medianStrangerViews: 35 }));
    expect(pass.decision).toBe("continue");
    expect(pass.notes.join(" ")).toMatch(/no-information pass/);
  });

  it("K0 cannot pass on a missing reading — an unmeasured gate is a failed gate", () => {
    const v = evaluateExperiment(SPEC, readings({ day: 56, medianStrangerViews: null }));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toContain("K0-unmeasured");
  });

  it("records average view percentage as a diagnostic, never as a kill", () => {
    const v = evaluateExperiment(SPEC, readings({ day: 56, medianStrangerViews: 120, averageViewPercentage: 12 }));
    expect(v.decision).toBe("continue");
    expect(v.notes.join(" ")).toMatch(/average view percentage 12% is under the pre-registered 30%/);
  });

  it("K3 at day 112 uses the red team's thresholds: <307 kill, 307-1199 extend once, ≥1200 escalate to the board", () => {
    const base = { day: 112, medianStrangerViews: 200 };
    expect(evaluateExperiment(SPEC, readings({ ...base, strangerWatchHours28d: 306 })).decision).toBe("kill");
    expect(evaluateExperiment(SPEC, readings({ ...base, strangerWatchHours28d: 307 })).decision).toBe("extend");
    expect(evaluateExperiment(SPEC, readings({ ...base, strangerWatchHours28d: 1199 })).decision).toBe("extend");
    const up = evaluateExperiment(SPEC, readings({ ...base, strangerWatchHours28d: 1200 }));
    expect(up.decision).toBe("escalate");
    expect(up.notes.join(" ")).toMatch(/board decides stage B/);
  });

  it("the verdict's original 61/614 band is not what runs: 614 h/28 d extends, it does not proceed", () => {
    const v = evaluateExperiment(SPEC, readings({ day: 112, medianStrangerViews: 200, strangerWatchHours28d: 614 }));
    expect(v.decision).toBe("extend");
  });

  it("the day-196 re-read after an extension is kill or escalate, never a second extension", () => {
    const base = { day: 196, medianStrangerViews: 200 };
    expect(evaluateExperiment(SPEC, readings({ ...base, strangerWatchHours28d: 1199 })).decision).toBe("kill");
    expect(evaluateExperiment(SPEC, readings({ ...base, strangerWatchHours28d: 1200 })).decision).toBe("escalate");
  });

  it("any policy signal kills at once, whatever the numbers", () => {
    const v = evaluateExperiment(SPEC, readings({ day: 20, policySignal: true }));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toContain("K-policy");
  });

  it("an ungranted recurring cost kills", () => {
    expect(evaluateExperiment(SPEC, readings({ day: 5, ungrantedRecurringCost: true })).decision).toBe("kill");
  });

  it("compute or token overrun pauses the next upload (escalate), it does not kill", () => {
    const runner = evaluateExperiment(SPEC, readings({ day: 5, maxRunnerMinutesPerVideo: 61 }));
    expect(runner.decision).toBe("escalate");
    expect(runner.triggered).toContain("K-compute");
    const tokens = evaluateExperiment(SPEC, readings({ day: 5, maxTokenCostIlsPerVideo: 21 }));
    expect(tokens.decision).toBe("escalate");
  });

  it("a kill outranks an escalation when both fire", () => {
    const v = evaluateExperiment(SPEC, readings({ day: 5, policySignal: true, maxRunnerMinutesPerVideo: 90 }));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toEqual(expect.arrayContaining(["K-policy", "K-compute"]));
  });

  // Pre-registration. VERDICT §10: the gates are "stored as kill_criteria data before the first upload and never
  // edited afterwards". Changing a number below also changes this hash, so the edit cannot pass review unnoticed.
  // After the first upload, a change needs a written board decision cited in the commit.
  it("the pre-registered gates have not been edited", () => {
    const hash = createHash("sha256").update(JSON.stringify(SPEC.gates)).digest("hex");
    expect(hash).toBe(PINNED_GATES_SHA256);
  });
});

const PINNED_GATES_SHA256 = "1e1f49d29fdbc54f2518907fdefddec925d7ffdd0e3cca69817d7ca075a4a48b";

describe("web arm reach floor (PREREG-DECISIONS.md §3, pre-registered 28.9.2026)", () => {
  it("has not been edited", () => {
    expect(WEB_ARM_REACH).toEqual({ day: 56, minEngagedStrangerViews: 5 });
    const hash = createHash("sha256").update(JSON.stringify(WEB_ARM_REACH)).digest("hex");
    expect(hash).toBe("aed85a892d9ba49b513f6b1e6b94c6ffe81c225d98eab015a82695e3894bb4d2");
  });
  it("decides only at day 56, only from a reading, and five is the floor", () => {
    expect(evaluateWebArm({ day: 55, engagedStrangerViews: 0 })).toBe("not_due");
    expect(evaluateWebArm({ day: 56, engagedStrangerViews: null })).toBe("unmeasured");
    expect(evaluateWebArm({ day: 56, engagedStrangerViews: 4 })).toBe("stage_a_never_asked");
    expect(evaluateWebArm({ day: 56, engagedStrangerViews: 5 })).toBe("stage_a_may_be_asked");
    expect(evaluateWebArm({ day: 90, engagedStrangerViews: 0 })).toBe("stage_a_never_asked");
  });
});

describe("the measuring status", () => {
  const line = (status: RevenueLine["status"]): RevenueLine => ({
    id: "yt",
    name: "YouTube experiment",
    category: "content",
    tier: "experimental",
    status,
    directorRole: "director-yt",
    operatingLoop: "loop",
    kpis: [],
    killCriteria: [],
    scaleCriteria: [],
    targetMonthlyAgorot: 0,
    budgetMonthlyCents: 0,
    humanSetup: [],
    humanSetupDone: true,
    skillName: null,
    launchedAt: "2026-06-01T00:00:00.000Z",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    killedAt: null,
    killReason: null,
  });
  const quiet: LineMetrics = {
    lineId: "yt",
    status: "measuring",
    revenue30dAgorot: 0,
    revenue7dAgorot: 0,
    refunds30dAgorot: 0,
    cost30dAgorot: 0,
    net30dAgorot: 0,
    transactions30d: 0,
    daysSinceLaunch: 200,
    daysSinceCreated: 200,
    daysSinceLastRevenue: null,
    targetMonthlyAgorot: 0,
    targetAttainment: 0,
    trend: 0,
  };

  it("is a known status with legal transitions in and out", () => {
    expect(LINE_STATUSES).toContain("measuring");
    expect(LINE_TRANSITIONS.building).toContain("measuring");
    expect(LINE_TRANSITIONS.measuring).toEqual(expect.arrayContaining(["killed", "paused"]));
  });

  it("is never killed by the revenue floor — its own gates judge it", () => {
    const d = decideLine(line("measuring"), quiet);
    expect(d.decision).toBe("hold");
    expect(d.rationale).toMatch(/pre-registered gates/);
    // The same numbers on a live line with a target are a kill: the status is what protects the experiment, nothing
    // else. On a live line whose target is still ₪0 they are an escalation instead — the board sets a target from the
    // reading that made the line live before any floor applies (RULING-2026-09-28-floors.md §8).
    const targeted = { ...line("live"), targetMonthlyAgorot: 20_000 };
    expect(decideLine(targeted, { ...quiet, status: "live", targetMonthlyAgorot: 20_000 }).decision).toBe("kill");
    const unset = decideLine(line("live"), { ...quiet, status: "live" });
    expect(unset.decision).toBe("escalate");
    expect(unset.triggered).toContain("target_unset");
  });

  it("counts against the experiment cap", () => {
    const lines = [1, 2, 3, 4].map((i) => ({ ...line("measuring"), id: `e${i}`, createdAt: `2026-06-0${i}T00:00:00.000Z` }));
    expect(experimentsToPause(lines)).toEqual(["e4"]);
  });
});
