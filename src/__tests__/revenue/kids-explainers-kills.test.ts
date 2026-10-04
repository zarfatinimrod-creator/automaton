import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import {
  FACELESS_YOUTUBE_EXPERIMENT,
  KIDS_EXPLAINERS_EXPERIMENT,
  evaluateExperiment,
  type ExperimentReadings,
  type ExperimentSpec,
} from "../../revenue/experiments.js";

/**
 * The kids-explainers experiment (research/channel-loop/RULING-2026-10-04-kids-youtube.md §8 rule 3, §10; fold action 5):
 * English, made for kids, for children who can read, judged by T1's numbers on its own D0 and under its own pin. The
 * designation is read back after every upload (§6 rule 2): `false` kills the line (K-mfk-designation), an unread
 * designation that is due freezes the next upload and escalates (K-mfk-unmeasured, §10 rule 2), and one still unread at
 * the K0 day kills it as unmeasured (K0-unmeasured, §10 rule 3). §10 rule 3 applies to T1 alike.
 */

const KIDS = KIDS_EXPLAINERS_EXPERIMENT;
const T1 = FACELESS_YOUTUBE_EXPERIMENT;

/** A healthy kids channel at day 20: first upload window passed, every upload read back `true`, nothing else firing. */
function readings(overrides: Partial<ExperimentReadings> = {}): ExperimentReadings {
  return {
    day: 20,
    t1Passed: true,
    videosPassedGate: 3,
    medianStrangerViews: null,
    strangerWatchHours28d: null,
    averageViewPercentage: null,
    policySignal: false,
    ungrantedRecurringCost: false,
    madeForKidsReadback: ["true", "true", "true"],
    maxRunnerMinutesPerVideo: 20,
    maxTokenCostIlsPerVideo: 8,
    ...overrides,
  };
}

describe("the kids-explainers spec (ruling 4.10 §8 rule 3, fold action 5)", () => {
  it("is the kids line, declares made for kids, and names the kids channel's own first-upload kill", () => {
    expect(KIDS.id).toBe("kids-explainers");
    expect(KIDS.declaresMadeForKids).toBe(true);
    expect(KIDS.firstUploadKill).toBe("K-T1k");
    expect(T1.declaresMadeForKids).toBe(false);
    expect(T1.firstUploadKill).toBe("K-T1");
  });

  it("runs on T1's numbers (experiments.ts FACELESS_YOUTUBE_EXPERIMENT.gates), as its own copy", () => {
    expect(KIDS.gates).toEqual(T1.gates);
    expect(KIDS.gates).not.toBe(T1.gates); // a copy: a later board change to T1's gates does not move the kids line's
  });

  it("cites the ruling as its source", () => {
    expect(KIDS.sources.join(" ")).toContain("research/channel-loop/RULING-2026-10-04-kids-youtube.md");
    expect(KIDS.sources.join(" ")).toMatch(/§8 rule 3/);
    expect(KIDS.sources.join(" ")).toMatch(/§10/);
  });

  // Pre-registration under its own pin, never T1's PINNED_GATES_SHA256 (ruling §8 rule 3). The pin covers what the line
  // is judged by: its id, its designation, its first-upload kill and its gates. Changing any of them changes this hash.
  it("is pinned as pre-registered on 4.10.2026", () => {
    const { id, declaresMadeForKids, firstUploadKill, gates } = KIDS;
    const hash = createHash("sha256").update(JSON.stringify({ id, declaresMadeForKids, firstUploadKill, gates })).digest("hex");
    expect(hash).toBe(KIDS_PINNED_SHA256);
    const t1GatesHash = createHash("sha256").update(JSON.stringify(T1.gates)).digest("hex");
    expect(hash).not.toBe(t1GatesHash);
  });
});

// Computed 4.10.2026 from the ruling's numbers typed by hand (not read from the module), over
// { id, declaresMadeForKids, firstUploadKill, gates }; the same hand-typed gates hash to T1's 1e1f49d2…a48b.
const KIDS_PINNED_SHA256 = "db5bf9a44e7f1238423f45b4de5b26b1b9b68b9006c604fafc28f5f352c0bbc0";

describe("K-mfk-designation: the read-back must say made for kids (ruling 4.10 §6 rule 2, §8 rule 3)", () => {
  it("continues while every upload reads back true", () => {
    const v = evaluateExperiment(KIDS, readings());
    expect(v.decision).toBe("continue");
    expect(v.triggered).toEqual([]);
    expect(v.uploadsFrozen).toBe(false);
  });

  it.each([[["false"]], [["true", "false"]], [["true", "true", "false"]]] as const)(
    "kills the line when any upload reads back false: %j",
    (readback) => {
      const v = evaluateExperiment(KIDS, readings({ madeForKidsReadback: [...readback] }));
      expect(v.decision).toBe("kill");
      expect(v.triggered).toContain("K-mfk-designation");
      expect(v.uploadsFrozen).toBe(true);
      const notes = v.notes.join(" ");
      expect(notes).toMatch(/never a Studio click/);
      expect(notes).toMatch(/never relabelled/);
      expect(notes).toMatch(/never re-uploaded/);
    },
  );

  it("names which upload read back false", () => {
    const v = evaluateExperiment(KIDS, readings({ madeForKidsReadback: ["true", "false"] }));
    expect(v.notes.join(" ")).toMatch(/upload 2 of 2/);
  });

  it("does not apply P-2 to a channel that declares made for kids: a true read-back is the declaration, not an override", () => {
    // P-2 cannot occur on a channel that declares made for kids (ruling 4.10 §8, BRIEF:567-568); its mirror is
    // K-mfk-designation. Five uploads reading true are five passing readings, never five overrides.
    const v = evaluateExperiment(KIDS, readings({ madeForKidsReadback: ["true", "true", "true", "true", "true"] }));
    expect(v.decision).toBe("continue");
    expect(v.triggered).toEqual([]);
    expect(v.notes.join(" ")).toMatch(/P-2 does not apply/);
  });
});

describe("K-mfk-unmeasured on an unread designation: freeze and escalate, never pass (ruling 4.10 §10 rule 2)", () => {
  it.each([[[null]], [["true", null]], [[null, "true", "true"]]] as const)("an unread upload escalates and freezes the next upload: %j", (readback) => {
    const v = evaluateExperiment(KIDS, readings({ madeForKidsReadback: [...readback] }));
    expect(v.decision).toBe("escalate");
    expect(v.triggered).toEqual(["K-mfk-unmeasured"]);
    expect(v.uploadsFrozen).toBe(true);
    const notes = v.notes.join(" ");
    expect(notes).toMatch(/status\.madeForKids/);
    expect(notes).toMatch(/no upload on this channel until the reading exists/);
    expect(notes).toMatch(/instrument fault/);
  });

  it("an upload with no read-back recorded at all is unread, not clean", () => {
    // The first-upload window has been judged (t1Passed is not null), so at least one upload exists.
    const v = evaluateExperiment(KIDS, readings({ madeForKidsReadback: [] }));
    expect(v.decision).toBe("escalate");
    expect(v.triggered).toEqual(["K-mfk-unmeasured"]);
    expect(v.uploadsFrozen).toBe(true);
  });

  it("before the first upload there is nothing to read", () => {
    const v = evaluateExperiment(KIDS, readings({ day: 0, t1Passed: null, videosPassedGate: 0, madeForKidsReadback: [] }));
    expect(v.decision).toBe("continue");
    expect(v.uploadsFrozen).toBe(false);
  });

  it("a false read-back kills even when another upload is unread", () => {
    const v = evaluateExperiment(KIDS, readings({ madeForKidsReadback: ["false", null] }));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toEqual(["K-mfk-designation", "K-mfk-unmeasured"]);
  });
});

describe("K0-unmeasured on an unread designation at the K0 day (ruling 4.10 §10 rule 3)", () => {
  it.each([
    ["kids-explainers", KIDS, "true"],
    ["faceless-youtube", T1, "false"],
  ] as const)("%s: an upload still unread at day 56 kills, whatever the views say", (_, spec, read) => {
    const healthy = { day: 56, videosPassedGate: 6, medianStrangerViews: 120 };
    expect(evaluateExperiment(spec as ExperimentSpec, readings({ ...healthy, madeForKidsReadback: [read, read] })).decision).toBe("continue");
    const v = evaluateExperiment(spec as ExperimentSpec, readings({ ...healthy, madeForKidsReadback: [read, null] }));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toContain("K0-unmeasured");
    expect(v.notes.join(" ")).toMatch(/designation/);
  });

  it("the day before K0 an unread designation still only freezes", () => {
    const v = evaluateExperiment(KIDS, readings({ day: 55, videosPassedGate: 6, madeForKidsReadback: [null] }));
    expect(v.decision).toBe("escalate");
    expect(v.triggered).toEqual(["K-mfk-unmeasured"]);
  });

  it("after K0 (the K3 window) an unread designation still counts K0 as unmeasured", () => {
    const v = evaluateExperiment(KIDS, readings({ day: 112, videosPassedGate: 6, medianStrangerViews: 120, strangerWatchHours28d: 400, madeForKidsReadback: [null] }));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toContain("K0-unmeasured");
  });
});

describe("the other kills with T1's numbers, on the kids channel's own D0 (ruling 4.10 §8 rule 3)", () => {
  it("K-T1k: the kids channel's first-upload window failing kills it, under its own id", () => {
    const v = evaluateExperiment(KIDS, readings({ day: 3, t1Passed: false }));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toContain("K-T1k");
    expect(v.triggered).not.toContain("K-T1");
    expect(v.notes.join(" ")).toMatch(/videos\.list/);
    expect(v.notes.join(" ")).toMatch(/never a fetch of the watch page/);
    // T1 keeps its own id.
    expect(evaluateExperiment(T1, readings({ day: 3, t1Passed: false, madeForKidsReadback: ["false"] })).triggered).toContain("K-T1");
  });

  it("K-policy kills the same day, never a workaround channel", () => {
    const v = evaluateExperiment(KIDS, readings({ policySignal: true }));
    expect(v.decision).toBe("kill");
    expect(v.triggered).toContain("K-policy");
  });

  it("K-supply: six gate-passing videos by day 42", () => {
    expect(evaluateExperiment(KIDS, readings({ day: 41, videosPassedGate: 3 })).decision).toBe("continue");
    expect(evaluateExperiment(KIDS, readings({ day: 42, videosPassedGate: 5 })).triggered).toContain("K-supply");
  });

  it("K0: a median under 35 engaged stranger views at day 56 kills; unmeasured kills", () => {
    expect(evaluateExperiment(KIDS, readings({ day: 56, videosPassedGate: 6, medianStrangerViews: 34 })).triggered).toContain("K0");
    expect(evaluateExperiment(KIDS, readings({ day: 56, videosPassedGate: 6, medianStrangerViews: 35 })).decision).toBe("continue");
    expect(evaluateExperiment(KIDS, readings({ day: 56, videosPassedGate: 6 })).triggered).toContain("K0-unmeasured");
  });

  it("K3: under 307 h/28 d at day 112 kills, 1,200 or more goes to the board", () => {
    const base = { day: 112, videosPassedGate: 6, medianStrangerViews: 200 };
    expect(evaluateExperiment(KIDS, readings({ ...base, strangerWatchHours28d: 306 })).decision).toBe("kill");
    expect(evaluateExperiment(KIDS, readings({ ...base, strangerWatchHours28d: 307 })).decision).toBe("extend");
    expect(evaluateExperiment(KIDS, readings({ ...base, strangerWatchHours28d: 1200 })).decision).toBe("escalate");
  });

  it("K-cash kills; K-compute freezes the next upload", () => {
    expect(evaluateExperiment(KIDS, readings({ ungrantedRecurringCost: true })).triggered).toContain("K-cash");
    const compute = evaluateExperiment(KIDS, readings({ maxRunnerMinutesPerVideo: 61 }));
    expect(compute.decision).toBe("escalate");
    expect(compute.triggered).toEqual(["K-compute"]);
    expect(compute.uploadsFrozen).toBe(true);
  });
});

describe("T1 reads its designation the same way (ruling 4.10 §8 rule 2, §10 rule 3)", () => {
  /** T1 at day 20: uploaded, and its upload read back not made for kids, as declared. */
  const t1 = (o: Partial<ExperimentReadings> = {}) => readings({ madeForKidsReadback: ["false"], ...o });

  it("a false read-back on T1 is the expected reading", () => {
    const v = evaluateExperiment(T1, t1());
    expect(v.decision).toBe("continue");
    expect(v.triggered).toEqual([]);
  });

  it("a true read-back on T1 is YouTube's override, counted by P-2: the first flags, the second kills", () => {
    const one = evaluateExperiment(T1, t1({ madeForKidsReadback: ["false", "true"] }));
    expect(one.decision).toBe("escalate");
    expect(one.triggered).toEqual(["K-mfk-override"]);
    const two = evaluateExperiment(T1, t1({ madeForKidsReadback: ["true", "true"] }));
    expect(two.decision).toBe("kill");
    expect(two.triggered).toContain("K-mfk");
    // The count is the read-back's `true` entries, wherever they sit; nothing is typed in beside it.
    expect(evaluateExperiment(T1, t1({ madeForKidsReadback: ["true", "false"] })).triggered).toEqual(["K-mfk-override"]);
    expect(evaluateExperiment(T1, t1({ madeForKidsReadback: ["true", "false", "true"] })).triggered).toContain("K-mfk");
  });

  it("an override beside an unread upload counts and freezes: both are flagged", () => {
    const v = evaluateExperiment(T1, t1({ madeForKidsReadback: ["true", null] }));
    expect(v.decision).toBe("escalate");
    expect(v.triggered).toEqual(["K-mfk-override", "K-mfk-unmeasured"]);
    expect(v.uploadsFrozen).toBe(true);
  });

  it("K-mfk-designation is the kids line's kill only: T1 reading false is not it", () => {
    expect(evaluateExperiment(T1, t1({ madeForKidsReadback: ["false", "false"] })).triggered).not.toContain("K-mfk-designation");
  });

  it("an unread T1 upload freezes and escalates", () => {
    const v = evaluateExperiment(T1, t1({ madeForKidsReadback: [null] }));
    expect(v.decision).toBe("escalate");
    expect(v.triggered).toEqual(["K-mfk-unmeasured"]);
    expect(v.uploadsFrozen).toBe(true);
  });

  // The reviewer's case (4.10): T1 has had a gate-passed video since 27.9 and nothing is uploaded. §10 rule 2 freezes "the
  // next upload ... until the reading exists" for an upload that exists; before the first upload nothing can be read, and
  // the precondition is the reader itself (§10 rule 1). A freeze here could only be cleared by typing a reading in.
  it("T1 is not frozen before its first upload, though a video has passed the gate", () => {
    const v = evaluateExperiment(T1, t1({ day: 0, t1Passed: null, videosPassedGate: 1, madeForKidsReadback: [] }));
    expect(v.decision).toBe("continue");
    expect(v.triggered).toEqual([]);
    expect(v.uploadsFrozen).toBe(false);
    expect(v.notes.join(" ")).toMatch(/not due before the first upload/);
  });

  it("the reader's real output clears T1: one upload read back false, the window not judged yet", () => {
    // Nothing else is fed: the override count is derived from the read-back, so no hand-typed zero is needed.
    const v = evaluateExperiment(T1, t1({ day: 1, t1Passed: null, videosPassedGate: 1, madeForKidsReadback: ["false"] }));
    expect(v.decision).toBe("continue");
    expect(v.triggered).toEqual([]);
    expect(v.uploadsFrozen).toBe(false);
  });

  it("an upload listed but not read back yet freezes T1 even before its window is judged", () => {
    const v = evaluateExperiment(T1, t1({ day: 1, t1Passed: null, videosPassedGate: 1, madeForKidsReadback: [null] }));
    expect(v.triggered).toEqual(["K-mfk-unmeasured"]);
    expect(v.uploadsFrozen).toBe(true);
  });
});
