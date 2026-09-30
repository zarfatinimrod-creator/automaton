import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import {
  FACELESS_YOUTUBE_EXPERIMENT,
  MADE_FOR_KIDS_OVERRIDES,
  evaluateExperiment,
  type ExperimentReadings,
} from "../../revenue/experiments.js";

/**
 * P-2 (research/channel-loop/RULING-2026-09-30-video.md 16(c) item 7, fold step 10; research/youtube-kids/ASSESSMENT.md
 * §9.2 item 2): YouTube setting a video on T1's channel to "made for kids" over our declaration. The first override: the
 * video goes private, one appeal, never a relabel or a re-upload, and the board is flagged. A second override kills the
 * YouTube line. Nothing reads the override yet, and the verdict says so instead of pretending a zero.
 */

const SPEC = FACELESS_YOUTUBE_EXPERIMENT;

/** A healthy day-20 channel: nothing else due, nothing else firing. */
function readings(madeForKidsOverrides: number | null): ExperimentReadings {
  return {
    day: 20,
    t1Passed: true,
    videosPassedGate: 3,
    medianStrangerViews: null,
    strangerWatchHours28d: null,
    averageViewPercentage: null,
    policySignal: false,
    ungrantedRecurringCost: false,
    madeForKidsOverrides,
    maxRunnerMinutesPerVideo: 20,
    maxTokenCostIlsPerVideo: 8,
  };
}

describe("P-2: made-for-kids overrides on T1's channel", () => {
  it("continues with no override", () => {
    const v = evaluateExperiment(SPEC, readings(0));
    expect(v.decision).toBe("continue");
    expect(v.triggered).toEqual([]);
    expect(v.notes.join(" ")).not.toMatch(/made for kids/i);
  });

  it("the first override flags the board: one appeal, never a relabel or a re-upload — not a kill", () => {
    const v = evaluateExperiment(SPEC, readings(1));
    expect(v.decision).toBe("escalate");
    expect(v.triggered).toEqual(["K-mfk-override"]);
    const notes = v.notes.join(" ");
    expect(notes).toMatch(/one appeal/);
    expect(notes).toMatch(/never (a )?relabel/);
    expect(notes).toMatch(/re-upload/);
    expect(notes).toMatch(/second override kills/);
  });

  it.each([2, 3])("%i overrides kill the YouTube line", (n) => {
    const v = evaluateExperiment(SPEC, readings(n));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toContain("K-mfk");
    expect(v.triggered).not.toContain("K-mfk-override");
    expect(v.notes.join(" ")).toMatch(/never a replacement channel/);
  });

  it("with no reader, says so and decides nothing from it", () => {
    const v = evaluateExperiment(SPEC, readings(null));
    expect(v.decision).toBe("continue");
    expect(v.triggered).toEqual([]);
    const notes = v.notes.join(" ");
    expect(notes).toMatch(/K-mfk has no reader/);
    expect(notes).toMatch(/status\.madeForKids/);
  });

  it("a kill elsewhere still kills when the override count is unread", () => {
    const v = evaluateExperiment(SPEC, { ...readings(null), policySignal: true });
    expect(v.decision).toBe("kill");
    expect(v.triggered).toEqual(["K-policy"]);
  });

  it("is pinned as pre-registered on 30.9.2026, apart from the 27.9 gates", () => {
    expect(MADE_FOR_KIDS_OVERRIDES).toEqual({ killAt: 2 });
    const hash = createHash("sha256").update(JSON.stringify(MADE_FOR_KIDS_OVERRIDES)).digest("hex");
    expect(hash).toBe("da0218efbbac0eaa443c89f4e9eb5e4fc12c378af2540c7b7a70dbe6c980aa0c");
    expect(Object.keys(SPEC.gates)).not.toContain("killAt");
  });
});
