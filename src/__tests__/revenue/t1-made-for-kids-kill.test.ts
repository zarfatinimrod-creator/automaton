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
 * YouTube line. Since 4.10 the count is not typed in: it is the uploads whose made-for-kids read-back is `true`
 * (src/revenue/youtube-madeforkids.ts readbackOf; ruling 4.10 §8 rule 2). Before the first upload there is nothing to read
 * and the verdict says so; from the first upload on, an unread upload is a due gate with no reading and escalates
 * (K-mfk-unmeasured) instead of pretending a zero.
 */

const SPEC = FACELESS_YOUTUBE_EXPERIMENT;

/**
 * A healthy day-20 channel: nothing else due, nothing else firing. `overrides` uploads read back made for kids (YouTube's
 * override) beside one read back as declared; null = one upload not read back yet.
 */
function readings(overrides: number | null): ExperimentReadings {
  return {
    day: 20,
    t1Passed: true,
    videosPassedGate: 3,
    medianStrangerViews: null,
    strangerWatchHours28d: null,
    averageViewPercentage: null,
    policySignal: false,
    ungrantedRecurringCost: false,
    madeForKidsReadback: overrides === null ? [null] : ["false", ...Array<"true">(overrides).fill("true")],
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

  it("unread after an upload: a due gate with no reading counts as failed — the board is flagged, not reassured", () => {
    // ASSESSMENT §9.2 item 2: a read-back after each upload, so the count is due from the first one.
    const v = evaluateExperiment(SPEC, readings(null));
    expect(v.decision).toBe("escalate");
    expect(v.triggered).toEqual(["K-mfk-unmeasured"]);
    const notes = v.notes.join(" ");
    expect(notes).toMatch(/K-mfk is due from the first upload and has no reading/);
    expect(notes).toMatch(/status\.madeForKids/);
    expect(notes).toMatch(/counts as failed/);
  });

  it("unread once an upload exists, even before T1 has reported", () => {
    const v = evaluateExperiment(SPEC, { ...readings(null), t1Passed: null, videosPassedGate: 1 });
    expect(v.decision).toBe("escalate");
    expect(v.triggered).toEqual(["K-mfk-unmeasured"]);
    expect(v.uploadsFrozen).toBe(true);
  });

  it("a video that passed the gate but is not uploaded has nothing to read: not due, not frozen (ruling 4.10 §10 rule 1)", () => {
    // T1 has had a gate-passed video since 27.9 (releases/t1). Freezing its first upload "until the reading exists" would
    // freeze it for good: nothing can be read before an upload. The precondition before the first upload is the reader
    // itself, built and tested (§10 rule 1); the freeze is for an upload that exists and is unread (§10 rule 2).
    const v = evaluateExperiment(SPEC, { ...readings(null), day: 0, t1Passed: null, videosPassedGate: 1, madeForKidsReadback: [] });
    expect(v.decision).toBe("continue");
    expect(v.triggered).toEqual([]);
    expect(v.uploadsFrozen).toBe(false);
    expect(v.notes.join(" ")).toMatch(/not due before the first upload/);
  });

  it("unread before any upload: not due, a note and nothing else", () => {
    const v = evaluateExperiment(SPEC, { ...readings(null), day: 0, t1Passed: null, videosPassedGate: 0, madeForKidsReadback: [] });
    expect(v.decision).toBe("continue");
    expect(v.triggered).toEqual([]);
    const notes = v.notes.join(" ");
    // "no reader" until 4.10: the reader exists since (src/revenue/youtube-madeforkids.ts), so the note says "no reading".
    expect(notes).toMatch(/K-mfk has no reading/);
    expect(notes).toMatch(/not due before the first upload/);
  });

  it("a read zero clears the unmeasured flag", () => {
    expect(evaluateExperiment(SPEC, readings(0)).triggered).not.toContain("K-mfk-unmeasured");
  });

  it("a kill elsewhere still kills when the override count is unread", () => {
    const v = evaluateExperiment(SPEC, { ...readings(null), policySignal: true });
    expect(v.decision).toBe("kill");
    expect(v.triggered).toEqual(["K-policy", "K-mfk-unmeasured"]);
  });

  it("is pinned as pre-registered on 30.9.2026, apart from the 27.9 gates", () => {
    expect(MADE_FOR_KIDS_OVERRIDES).toEqual({ killAt: 2 });
    const hash = createHash("sha256").update(JSON.stringify(MADE_FOR_KIDS_OVERRIDES)).digest("hex");
    expect(hash).toBe("da0218efbbac0eaa443c89f4e9eb5e4fc12c378af2540c7b7a70dbe6c980aa0c");
    expect(Object.keys(SPEC.gates)).not.toContain("killAt");
  });
});
