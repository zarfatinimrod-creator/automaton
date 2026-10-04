import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateExperiment, KIDS_EXPLAINERS_EXPERIMENT, type ExperimentReadings } from "../../revenue/experiments.js";
import {
  KIDS_AUDIENCE_SENTENCE,
  KIDS_ON_SCREEN_TAG,
  KIDS_SPOKEN_DECLARATION,
  SYNTHETIC_VOICE_DISCLOSURE,
  type ChannelState,
  type VideoManifest,
  type YoutubeLine,
} from "../../revenue/publication-gate.js";
import {
  GUARD_CHECKS,
  UploadRefused,
  assertMayUpload,
  experimentStateOf,
  type ExperimentState,
  type RefusalCode,
  type UploadAttempt,
} from "../../revenue/publisher-guard.js";

/**
 * The publisher guard (logs/CHANNEL_LOOP.md §9, queued 4.10 item 2; research/channel-loop/RULING-2026-10-04-kids-youtube.md
 * §10, §8 rule 3). No publisher exists. experiments.ts sets `uploadsFrozen` and says no publisher may be built that does not
 * call this guard first; this is the refusal, built first, so the publisher has something to call.
 * Each refusal reason is tested alone, with the exact list of reasons it produces (a reason dropped from the guard
 * changes the list), and the last block makes the guard binding: any code in the colony that can put a video on YouTube
 * fails this file until it imports the guard and calls it.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SNAPSHOT = "research/rendered/owid-co2-licence.txt";
const exists = (p: string) => p === SNAPSHOT;
const DATASET = "Our World in Data, CO2 and Greenhouse Gas Emissions";

/** A kids-line manifest that passes G1-G11 (the kids-publication-gate.test.ts fixture). */
function kids(overrides: Partial<VideoManifest> = {}): VideoManifest {
  return {
    id: "k4",
    author: "opus-writer",
    line: "kids-explainers",
    title: "Which countries get the most sunshine?",
    description: [
      KIDS_AUDIENCE_SENTENCE,
      SYNTHETIC_VOICE_DISCLOSURE,
      `Data: ${DATASET}, licensed CC BY 4.0. Every chart is computed from that file.`,
    ].join("\n\n"),
    tags: ["sunshine", "solar power", "charts"],
    thumbnailBrief: "The bar chart from the video, drawn by code, with its title.",
    topic: "solar power by country",
    script: `${KIDS_SPOKEN_DECLARATION} Some countries make much more power from the sun than others. The chart shows which.`,
    datasets: [
      {
        name: DATASET,
        licence: "CC-BY-4.0",
        licenceSnapshot: SNAPSHOT,
        upstream: [{ source: "Global Carbon Project", licence: "CC-BY-4.0" }],
      },
    ],
    originality: { auditor: "opus-auditor", verdict: "PASS" },
    factCheck: { auditor: "opus-auditor", verdict: "PASS", figuresChecked: 5 },
    promiseMatch: { auditor: "opus-auditor", verdict: "PASS" },
    containsSyntheticMedia: true,
    madeForKids: true,
    onScreenTagEveryFrame: KIDS_ON_SCREEN_TAG,
    narration: { engine: "kokoro-82m", voiceId: "af_heart", voicesFile: "voices-v1.0.bin", modelFile: "kokoro-v1.0.onnx" },
    scheduledAt: "2027-03-10T09:00:00.000Z",
    runnerMinutes: 20,
    tokenCostIls: 0,
    ...overrides,
  };
}

/** T1's line: not made for kids, no tag, no spoken declaration. */
function t1(overrides: Partial<VideoManifest> = {}): VideoManifest {
  return kids({
    id: "t1",
    line: "faceless-youtube",
    title: "How fast did solar capacity grow after 2010?",
    description: `Every chart is computed from ${DATASET} dataset, licensed CC BY 4.0. ${SYNTHETIC_VOICE_DISCLOSURE}`,
    tags: [],
    thumbnailBrief: null,
    script: "Solar capacity grew roughly tenfold between 2010 and 2020. Capacity is not generation.",
    madeForKids: false,
    onScreenTagEveryFrame: null,
    ...overrides,
  });
}

const channel = (overrides: Partial<ChannelState> = {}): ChannelState => ({
  published: [],
  yppReviewPending: false,
  dmcaCounterNoticeFiled: false,
  ...overrides,
});

/** A healthy kids channel at day 20: window passed, three earlier uploads read back made for kids. */
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

/** T1 before its first upload: nothing uploaded, nothing to read, nothing due (§10 rule 1). */
const t1BeforeFirstUpload = (): ExperimentReadings =>
  readings({ day: 0, t1Passed: null, videosPassedGate: 1, madeForKidsReadback: [] });

/** An upload at experiment day `day` (the readings' default day, 20, unless a test moves it). */
const attempt = (manifest: VideoManifest, c: ChannelState = channel(), day = 20, extra: Partial<UploadAttempt> = {}): UploadAttempt => ({
  manifest,
  channel: c,
  exists,
  day,
  ...extra,
});

/** Earlier uploads that pass G3 (scripts unlike k4's) and G6 (none in the 7 days before k4's 2027-03-10). */
const EARLIER = [
  { id: "k1", publishedAt: "2027-03-01T09:00:00.000Z", script: "An entirely different script about rainfall in deserts and how rivers form over long periods." },
  { id: "k2", publishedAt: "2027-02-01T09:00:00.000Z", script: "Another wholly unrelated narration on volcano heights and mountain ranges of the world." },
  { id: "k3", publishedAt: "2027-01-01T09:00:00.000Z", script: "Yet another script on how many trees grow in each continent counted by satellites." },
];

/** T1 after its first upload passed P1-P4 and read back `false`: what the kids line's first upload waits on (§8 rule 2). */
const t1WentFirst = (overrides: Partial<ExperimentReadings> = {}): ExperimentState =>
  experimentStateOf("faceless-youtube", readings({ day: 9, t1Passed: true, videosPassedGate: 2, madeForKidsReadback: ["false"], ...overrides }));

/** The kids line before its own first upload: nothing uploaded, nothing to read. */
const kidsBeforeFirstUpload = (): ExperimentReadings =>
  readings({ day: 0, t1Passed: null, videosPassedGate: 1, madeForKidsReadback: [] });

/** The refusal codes, in the guard's order, or "cleared" when it lets the upload through. */
function codes(state: unknown, a: UploadAttempt = attempt(kids())): RefusalCode[] | "cleared" {
  try {
    assertMayUpload(state as ExperimentState, a);
    return "cleared";
  } catch (error) {
    if (!(error instanceof UploadRefused)) throw error;
    return error.reasons.map((r) => r.code);
  }
}

function refusal(state: unknown, a: UploadAttempt = attempt(kids())): UploadRefused {
  try {
    assertMayUpload(state as ExperimentState, a);
  } catch (error) {
    if (error instanceof UploadRefused) return error;
    throw error;
  }
  throw new Error("expected UploadRefused, the upload was cleared");
}

const KIDS_LINE: YoutubeLine = "kids-explainers";
const T1_LINE: YoutubeLine = "faceless-youtube";

describe("the pass path", () => {
  it("clears a gate-passing kids video when nothing is killed or frozen and every earlier upload read back made for kids", () => {
    const state = experimentStateOf(KIDS_LINE, readings());
    expect(state.verdict.decision).toBe("continue");
    const clearance = assertMayUpload(state, attempt(kids()));
    expect(clearance).toEqual({ ok: true, line: KIDS_LINE, videoId: "k4", checks: [...GUARD_CHECKS] });
  });

  it("names every check it ran, in order", () => {
    expect(GUARD_CHECKS).toEqual([
      "state-readable",
      "line-matches",
      "not-killed",
      "not-frozen",
      "designation-not-contradicted",
      "designation-read",
      "t1-went-first",
      "verdict-current",
      "judged-today",
      "publication-gate",
    ]);
  });

  it("clears T1's first upload: before it nothing is uploaded, so nothing is unread (§10 rule 1)", () => {
    expect(codes(experimentStateOf(T1_LINE, t1BeforeFirstUpload()), attempt(t1(), channel(), 0))).toBe("cleared");
  });

  it("clears the kids line's first upload once T1's first upload passed and read back false (§8 rule 2)", () => {
    const state = experimentStateOf(KIDS_LINE, kidsBeforeFirstUpload());
    expect(codes(state, attempt(kids(), channel(), 0, { t1State: t1WentFirst() }))).toBe("cleared");
  });

  it("clears when the read-back has one entry per upload the channel lists (and more is fine: the reader keeps every read)", () => {
    const state = experimentStateOf(KIDS_LINE, readings());
    expect(codes(state, attempt(kids(), channel({ published: EARLIER })))).toBe("cleared");
    expect(codes(state, attempt(kids(), channel({ published: EARLIER.slice(0, 1) })))).toBe("cleared");
  });

  it("clears T1 when its earlier upload read back false, the designation T1 declares", () => {
    expect(codes(experimentStateOf(T1_LINE, readings({ madeForKidsReadback: ["false"] })), attempt(t1()))).toBe("cleared");
  });

  it("clears an extension (K3 between the lines): the experiment goes on and nothing holds the next upload", () => {
    const r = readings({ day: 112, videosPassedGate: 6, medianStrangerViews: 120, strangerWatchHours28d: 400 });
    const state = experimentStateOf(KIDS_LINE, r);
    expect(state.verdict.decision).toBe("extend");
    expect(codes(state, attempt(kids(), channel(), 112))).toBe("cleared");
  });
});

describe("(b) a killed experiment publishes nothing", () => {
  it("refuses after any kill (K-policy here); a kill also freezes, so both are named", () => {
    const state = experimentStateOf(KIDS_LINE, readings({ policySignal: true }));
    expect(state.verdict.decision).toBe("kill");
    expect(codes(state)).toEqual(["experiment-killed", "uploads-frozen"]);
    expect(refusal(state).reasons[0]!.detail).toMatch(/K-policy/);
  });

  it("refuses on a stored kill even if a hand-edited state cleared uploadsFrozen beside it", () => {
    const state = experimentStateOf(KIDS_LINE, readings({ policySignal: true }));
    const edited = { ...state, verdict: { ...state.verdict, uploadsFrozen: false } };
    expect(codes(edited)).toEqual(["experiment-killed", "verdict-stale"]);
  });
});

describe("(a) uploadsFrozen holds the next upload", () => {
  it("refuses while K-compute has frozen uploads (an escalation, not a kill)", () => {
    const state = experimentStateOf(KIDS_LINE, readings({ maxRunnerMinutesPerVideo: 61 }));
    expect(state.verdict.decision).toBe("escalate");
    expect(state.verdict.uploadsFrozen).toBe(true);
    expect(codes(state)).toEqual(["uploads-frozen"]);
  });

  it("refuses on a stored freeze even when its readings no longer give one: it is lifted by re-judging, not by the publisher", () => {
    const state = experimentStateOf(KIDS_LINE, readings({ maxRunnerMinutesPerVideo: 61 }));
    const healed = { ...state, readings: readings() };
    expect(codes(healed)).toEqual(["uploads-frozen", "verdict-stale"]);
  });
});

describe("(c) the designation read-back (ruling 4.10 §10, §6 rule 2)", () => {
  it.each([
    [KIDS_LINE, ["true", null]],
    [KIDS_LINE, [null, "true", "true"]],
    [T1_LINE, ["false", null]],
  ] as const)("%s: an earlier upload with no reading freezes the next one: %j", (line, rb) => {
    const state = experimentStateOf(line, readings({ madeForKidsReadback: [...rb] }));
    const manifest = line === KIDS_LINE ? kids() : t1();
    expect(codes(state, attempt(manifest))).toEqual(["uploads-frozen", "designation-unread"]);
    expect(refusal(state, attempt(manifest)).message).toMatch(/upload \d of \d/);
  });

  it("an upload exists once its first-upload window is judged: an empty read-back then is unread, not clean", () => {
    const state = experimentStateOf(KIDS_LINE, readings({ madeForKidsReadback: [] }));
    expect(codes(state)).toEqual(["uploads-frozen", "designation-unread"]);
  });

  // The channel the gate runs against lists the uploads that exist; readbackOf gives at least one entry per listed upload,
  // so a read-back shorter than that list is uploads nobody has read, whatever the stored readings say.
  describe("an upload the channel lists and the read-back does not is unread", () => {
    it("kids line, first-upload window not judged yet: the read-back is empty and the channel has an upload", () => {
      const state = experimentStateOf(KIDS_LINE, readings({ day: 1, t1Passed: null, videosPassedGate: 2, madeForKidsReadback: [] }));
      expect(state.verdict).toMatchObject({ decision: "continue", uploadsFrozen: false });
      const a = attempt(kids(), channel({ published: EARLIER.slice(0, 1) }), 1, { t1State: t1WentFirst() });
      expect(codes(state, a)).toEqual(["designation-unread"]);
      expect(refusal(state, a).message).toMatch(/upload 1 of 1 .*the channel lists 1 upload\(s\) and the read-back has 0 entries/);
    });

    it("T1, the same case", () => {
      const state = experimentStateOf(T1_LINE, readings({ day: 1, t1Passed: null, videosPassedGate: 2, madeForKidsReadback: [] }));
      expect(codes(state, attempt(t1(), channel({ published: EARLIER.slice(0, 1) }), 1))).toEqual(["designation-unread"]);
    });

    it("kids line, window judged: one entry for three listed uploads", () => {
      const state = experimentStateOf(KIDS_LINE, readings({ madeForKidsReadback: ["true"] }));
      expect(state.verdict).toMatchObject({ decision: "continue", uploadsFrozen: false });
      const a = attempt(kids(), channel({ published: EARLIER }));
      expect(codes(state, a)).toEqual(["designation-unread"]);
      expect(refusal(state, a).message).toMatch(/upload 2 of 3, upload 3 of 3 has no madeForKids reading/);
    });
  });

  it("kids line: an earlier upload read back false refuses (K-mfk-designation killed the line)", () => {
    const state = experimentStateOf(KIDS_LINE, readings({ madeForKidsReadback: ["true", "false"] }));
    expect(codes(state)).toEqual(["experiment-killed", "uploads-frozen", "designation-contradicted"]);
  });

  it("T1's line: false is its own declaration, and is not a contradiction", () => {
    expect(codes(experimentStateOf(T1_LINE, readings({ madeForKidsReadback: ["false", "false"] })), attempt(t1()))).toBe("cleared");
  });

  // The guard reads the read-back itself, so it does not rest on experiments.ts alone: a verdict that says go beside an
  // unread or contrary designation (a stale state, or a later edit that stopped K-mfk-unmeasured freezing) still refuses.
  it("refuses an unread designation even when the stored verdict says continue", () => {
    const state = experimentStateOf(KIDS_LINE, readings());
    const stale = { ...state, readings: readings({ madeForKidsReadback: ["true", null] }) };
    expect(codes(stale)).toEqual(["designation-unread", "verdict-stale"]);
  });

  it("refuses a contrary kids designation even when the stored verdict says continue", () => {
    const state = experimentStateOf(KIDS_LINE, readings());
    const stale = { ...state, readings: readings({ madeForKidsReadback: ["false"] }) };
    expect(codes(stale)).toEqual(["designation-contradicted", "verdict-stale"]);
  });
});

describe("a stored verdict that its own readings do not give", () => {
  it("refuses: the publisher re-judges and saves before it uploads, it never trusts an old go", () => {
    const state = experimentStateOf(KIDS_LINE, readings());
    const stale = { ...state, readings: readings({ maxRunnerMinutesPerVideo: 61 }) };
    expect(codes(stale)).toEqual(["verdict-stale"]);
    expect(refusal(stale).message).toMatch(/K-compute/);
  });

  it("refuses a stored verdict that names other gates than its readings give, even when both let uploads through", () => {
    // Stored: the board's stage-B escalation at day 112. Readings now: T1's first override (P-2). Both escalate, neither
    // freezes; the stored one is still not the verdict of these readings.
    const stageB = experimentStateOf(T1_LINE, readings({ day: 112, videosPassedGate: 6, medianStrangerViews: 120, strangerWatchHours28d: 1300, madeForKidsReadback: ["false"] }));
    const override = readings({ madeForKidsReadback: ["false", "true"] });
    expect(stageB.verdict).toMatchObject({ decision: "escalate", uploadsFrozen: false, triggered: ["K3-stage-B"] });
    expect(experimentStateOf(T1_LINE, override).verdict).toMatchObject({ decision: "escalate", uploadsFrozen: false, triggered: ["K-mfk-override"] });
    expect(codes({ ...stageB, readings: override }, attempt(t1()))).toEqual(["verdict-stale"]);
    expect(codes(experimentStateOf(T1_LINE, override), attempt(t1()))).toBe("cleared");
  });
});

describe("a state judged on another day than the upload's", () => {
  // A state can agree with its own readings and still be old: saved at day 20 it says continue, and at day 60 K0 and
  // K-supply are due. The gates move with the day, so the state must be judged on the upload's day.
  it("refuses a day-20 continue for an upload at day 60, and the same readings re-judged at day 60 refuse on the kill", () => {
    const old = experimentStateOf(KIDS_LINE, readings());
    expect(old.verdict.decision).toBe("continue");
    expect(codes(old, attempt(kids(), channel(), 60))).toEqual(["judged-another-day"]);
    expect(refusal(old, attempt(kids(), channel(), 60)).message).toMatch(/judged at day 20 and the upload is at day 60/);
    const rejudged = experimentStateOf(KIDS_LINE, readings({ day: 60 }));
    expect(codes(rejudged, attempt(kids(), channel(), 60))).toEqual(["experiment-killed", "uploads-frozen"]);
  });

  it("refuses a state judged on a later day than the upload's", () => {
    expect(codes(experimentStateOf(KIDS_LINE, readings({ day: 21 })), attempt(kids(), channel(), 20))).toEqual(["judged-another-day"]);
  });

  it.each([
    ["missing", undefined],
    ["NaN", Number.NaN],
    ["a string", "20"],
  ])("refuses an attempt whose day is %s", (_, day) => {
    const a = { ...attempt(kids()), day } as unknown as UploadAttempt;
    expect(codes(experimentStateOf(KIDS_LINE, readings()), a)).toEqual(["judged-another-day"]);
    expect(refusal(experimentStateOf(KIDS_LINE, readings()), a).message).toMatch(/the attempt names no experiment day/);
  });
});

describe("the kids line's first upload waits on T1's (ruling 4.10 §8 rule 2)", () => {
  // "T1's first upload passes P1-P4 and its madeForKids read-back returns false ... → the kids line's first upload".
  const first = () => experimentStateOf(KIDS_LINE, kidsBeforeFirstUpload());
  const at0 = (t1State?: unknown) => attempt(kids(), channel(), 0, t1State === undefined ? {} : { t1State: t1State as ExperimentState });

  it.each([
    ["no T1 state given", undefined],
    ["T1 has not uploaded (its window is not judged)", experimentStateOf(T1_LINE, t1BeforeFirstUpload())],
    ["T1's window failed", t1WentFirst({ t1Passed: false })],
    ["T1's first upload read back false and its 72-hour window is not judged yet", t1WentFirst({ t1Passed: null })],
    ["T1's first upload is unread", t1WentFirst({ madeForKidsReadback: [null] })],
    ["T1's first upload read back true (YouTube's override)", t1WentFirst({ madeForKidsReadback: ["true"] })],
    ["T1 passed and its read-back list is empty", t1WentFirst({ madeForKidsReadback: [] })],
    // Readings that would pass if they were T1's: refused for the line alone.
    ["the state given for T1 is the kids line's", experimentStateOf(KIDS_LINE, readings({ madeForKidsReadback: ["false"] }))],
    ["T1's state is unreadable", { line: T1_LINE }],
  ])("refuses when %s", (_, t1State) => {
    expect(codes(first(), at0(t1State))).toEqual(["waits-on-t1"]);
    expect(refusal(first(), at0(t1State)).message).toMatch(/§8 rule 2/);
  });

  it("only the kids line's first upload waits: a later kids upload and T1's own first upload need no T1 state", () => {
    expect(codes(experimentStateOf(KIDS_LINE, readings()), attempt(kids()))).toBe("cleared");
    expect(codes(experimentStateOf(T1_LINE, t1BeforeFirstUpload()), attempt(t1(), channel(), 0))).toBe("cleared");
  });
});

describe("(d) the manifest's publication gate (G1-G11), run by the guard against the channel as it is now", () => {
  it("refuses a manifest that fails a gate, naming the gate", () => {
    const state = experimentStateOf(KIDS_LINE, readings());
    expect(codes(state, attempt(kids({ originality: null })))).toEqual(["publication-gate-failed"]);
    expect(refusal(state, attempt(kids({ originality: null }))).message).toMatch(/G3/);
  });

  it("runs the gate on the channel it is given: a filed DMCA counter-notice refuses (G8)", () => {
    const state = experimentStateOf(KIDS_LINE, readings());
    expect(codes(state, attempt(kids(), channel({ dmcaCounterNoticeFiled: true })))).toEqual(["publication-gate-failed"]);
  });

  it("runs the gate with the exists it is given: a licence snapshot not on disk refuses (G1)", () => {
    const state = experimentStateOf(KIDS_LINE, readings());
    const noDisk: UploadAttempt = { ...attempt(kids()), exists: () => false };
    expect(codes(state, noDisk)).toEqual(["publication-gate-failed"]);
    expect(refusal(state, noDisk).message).toMatch(/G1/);
  });
});

describe("a state for another line", () => {
  it("refuses a T1 state used for a kids upload, and checks nothing else", () => {
    const state = experimentStateOf(T1_LINE, readings({ madeForKidsReadback: ["false"] }));
    expect(codes(state, attempt(kids()))).toEqual(["line-mismatch"]);
  });
});

describe("an unreadable state refuses (fail closed)", () => {
  const good = () => JSON.parse(JSON.stringify(experimentStateOf(KIDS_LINE, readings()))) as Record<string, any>;
  const cases: [string, (s: Record<string, any>) => unknown][] = [
    ["no state", () => null],
    ["an array", () => []],
    ["an unknown line", (s) => ({ ...s, line: "tiktok" })],
    ["no verdict", (s) => ({ ...s, verdict: undefined })],
    ["uploadsFrozen missing (a state saved before the field)", (s) => ({ ...s, verdict: { ...s.verdict, uploadsFrozen: undefined } })],
    ["uploadsFrozen as the string \"false\"", (s) => ({ ...s, verdict: { ...s.verdict, uploadsFrozen: "false" } })],
    ["an unknown decision", (s) => ({ ...s, verdict: { ...s.verdict, decision: "paused" } })],
    ["triggered not a list", (s) => ({ ...s, verdict: { ...s.verdict, triggered: "K-policy" } })],
    ["no readings", (s) => ({ ...s, readings: undefined })],
    ["policySignal missing (it would read as no signal)", (s) => ({ ...s, readings: { ...s.readings, policySignal: undefined } })],
    ["day as a string", (s) => ({ ...s, readings: { ...s.readings, day: "20" } })],
    ["t1Passed as a string", (s) => ({ ...s, readings: { ...s.readings, t1Passed: "true" } })],
    ["a read-back entry that is not true, false or null", (s) => ({ ...s, readings: { ...s.readings, madeForKidsReadback: ["true", "yes"] } })],
    ["a read-back that is not a list", (s) => ({ ...s, readings: { ...s.readings, madeForKidsReadback: "true" } })],
    ["a spend reading as a string", (s) => ({ ...s, readings: { ...s.readings, maxRunnerMinutesPerVideo: "20" } })],
  ];
  it.each(cases)("%s", (_, edit) => {
    expect(codes(edit(good()))).toEqual(["state-unreadable"]);
  });

  it("the unedited JSON copy clears, so the cases above fail on their one edit", () => {
    expect(codes(good())).toBe("cleared");
  });

  // Values JSON cannot carry but an in-memory state can. NaN fails every day comparison, so `day: NaN` reads as no gate
  // due; every() and flatMap() skip the holes of a sparse array, so `new Array(2)` reads as two clean uploads.
  const holes = (n: number, at: Record<number, "true" | "false"> = {}) => {
    const rb = new Array(n) as ("true" | "false" | null)[];
    for (const [i, v] of Object.entries(at)) rb[Number(i)] = v;
    return rb;
  };
  const inMemory: [string, () => unknown][] = [
    ["day NaN (every gate reads as not due)", () => experimentStateOf(KIDS_LINE, readings({ day: Number.NaN, videosPassedGate: 0 }))],
    ["maxRunnerMinutesPerVideo NaN (K-compute reads as under its cap)", () => experimentStateOf(KIDS_LINE, readings({ maxRunnerMinutesPerVideo: Number.NaN }))],
    ["maxTokenCostIlsPerVideo -Infinity", () => experimentStateOf(KIDS_LINE, readings({ maxTokenCostIlsPerVideo: Number.NEGATIVE_INFINITY }))],
    ["a read-back of two holes", () => experimentStateOf(KIDS_LINE, readings({ madeForKidsReadback: holes(2) }))],
    ["a read-back with a hole before a true", () => experimentStateOf(KIDS_LINE, readings({ madeForKidsReadback: holes(2, { 1: "true" }) }))],
    ["a triggered list with a hole", () => {
      const s = experimentStateOf(KIDS_LINE, readings());
      return { ...s, verdict: { ...s.verdict, triggered: new Array(1) } };
    }],
  ];
  it.each(inMemory)("in memory: %s", (_, make) => {
    expect(codes(make())).toEqual(["state-unreadable"]);
  });

  it("the T1 state the kids line's first upload waits on is read the same way: a hole after T1's false is unreadable", () => {
    const t1 = t1WentFirst({ madeForKidsReadback: holes(2, { 0: "false" }) });
    expect(codes(experimentStateOf(KIDS_LINE, kidsBeforeFirstUpload()), attempt(kids(), channel(), 0, { t1State: t1 }))).toEqual(["waits-on-t1"]);
  });
});

describe("the frozen state's JSON round trip (the shape a publisher stores and reads back)", () => {
  it("a frozen state written and read back is the same state and still refuses, for the same reasons", () => {
    const frozen = experimentStateOf(KIDS_LINE, readings({ madeForKidsReadback: ["true", null] }));
    expect(frozen.verdict.uploadsFrozen).toBe(true);
    const back = JSON.parse(JSON.stringify(frozen)) as unknown;
    expect(back).toEqual(frozen);
    expect(codes(back)).toEqual(codes(frozen));
    expect(codes(back)).toEqual(["uploads-frozen", "designation-unread"]);
  });

  it("a state holds exactly line, readings and verdict, and the verdict is evaluateExperiment's", () => {
    const r = readings({ madeForKidsReadback: ["true", null] });
    const state = experimentStateOf(KIDS_LINE, r);
    expect(Object.keys(state).sort()).toEqual(["line", "readings", "verdict"]);
    expect(state.verdict).toEqual(evaluateExperiment(KIDS_EXPLAINERS_EXPERIMENT, r));
    expect(state.readings).toEqual(r);
  });

  it("the freeze lifts only when the reading exists and the state is re-judged", () => {
    const frozen = experimentStateOf(KIDS_LINE, readings({ madeForKidsReadback: ["true", null] }));
    const read = JSON.parse(JSON.stringify(frozen)) as ExperimentState;
    read.readings.madeForKidsReadback = ["true", "true"];
    expect(codes(read)).toEqual(["uploads-frozen", "verdict-stale"]); // the reading alone does not lift it
    expect(codes(experimentStateOf(KIDS_LINE, read.readings))).toBe("cleared"); // re-judged, it does
  });
});

describe("UploadRefused", () => {
  it("is an Error with the first reason's code, every reason, and the video it refused", () => {
    const e = refusal(experimentStateOf(KIDS_LINE, readings({ policySignal: true })));
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe("UploadRefused");
    expect(e.code).toBe("experiment-killed");
    expect(e.videoId).toBe("k4");
    expect(e.line).toBe(KIDS_LINE);
    expect(e.reasons.map((r) => r.code)).toEqual(["experiment-killed", "uploads-frozen"]);
    for (const r of e.reasons) expect(e.message).toContain(r.code);
    expect(e.message).toMatch(/k4/);
  });
});

/*
 * EVERY PUBLISHER CALLS THE GUARD FIRST.
 *
 * Nothing in this repository uploads a video. The day something does, this block fails until that code imports
 * src/revenue/publisher-guard.ts and calls assertMayUpload. That is the point: experiments.ts says no publisher may be
 * built that does not refuse an upload while `uploadsFrozen` is set, and a guard nobody calls refuses nothing.
 *
 * The scan covers every code file git tracks or would track (`git ls-files --cached --others --exclude-standard`: a new
 * file counts before it is committed, and what .gitignore leaves out, node_modules, the tsc output in dist/ and the agent
 * worktrees, is not in the repository). Two things are left out on purpose: test files, which hold the patterns as data
 * as this file does, and research/, which is evidence (captured pages, and third-party sources quoted for a ruling).
 * No directory is skipped by its name: a publisher under packages/, workflows/, scripts/build/ or a tests/ helper is
 * scanned like any other, and so are the vendored skills and runtime an agent can run (.claude/skills/, vendor/).
 * "Can put a video on YouTube" means it names the Data API's insert call (JS or Python form) or upload endpoint, Google's
 * client libraries, or Upload-Post (the publisher T1-PRECHECK.md priced) by API host, package or client; or its file name
 * says publish or upload and its text says YouTube.
 *
 * "Calls the guard" means, with comments removed: a static import that names assertMayUpload (not renamed) from a
 * relative path that resolves to src/revenue/publisher-guard.ts, and a call of assertMayUpload that is not a definition.
 * Only TypeScript or JavaScript can do that, so an uploader in Python, shell or YAML always fails the scan.
 *
 * When the first publisher is built: it must import the guard and call assertMayUpload before its upload call (the first
 * test below), and it must be added to KNOWN_YOUTUBE_API_CODE with a reason (the second). A reviewer reads both changes.
 */

const CODE_FILE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|py|sh|ya?ml)$/;
const JS_FILE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;
const TEST_FILE = /\.test\.[a-z]+$|(^|\/)test_[^/]*\.py$|_test\.py$/;
/** Evidence, not code: captured pages and the third-party sources a ruling quotes (research/measurements/). */
const NOT_CODE = ["research/"];

/**
 * Code that uploads to YouTube, by what it calls or loads. Package names count only in an import or require: a sentence
 * that says "Upload-Post's terms" (render-watch.mjs's terms-barred list) is not a client.
 */
const PACKAGE = (name: string) => String.raw`(?:from\s+|require\(\s*|import\(\s*)["']${name}["']`;
const UPLOAD_PATTERNS = [
  String.raw`videos\s*\.\s*insert`,
  String.raw`videos\s*\(\s*\)\s*\.\s*insert`,
  String.raw`youtube\.upload`,
  String.raw`\/upload\/youtube\/`,
  String.raw`uploadType=`,
  String.raw`googleapiclient`,
  String.raw`@googleapis\/youtube`,
  PACKAGE("googleapis"),
  String.raw`api\.upload-post\.com`,
  PACKAGE("upload-post"),
  String.raw`\bupload_post\b`,
  String.raw`\bUploadPost\b`,
];
const UPLOAD_CALL = new RegExp(UPLOAD_PATTERNS.join("|"), "i");
const NAMED_UPLOADER = (path: string, text: string) => /publish|upload/i.test(basename(path)) && /youtube/i.test(text);
/** Code that talks to a Google API at all, by host or by Python client: the readers do. */
const GOOGLE_API = /googleapis|googleapiclient/i;

/** git, run on `root` alone: a GIT_DIR or GIT_INDEX_FILE inherited from a hook would point it at another repository. */
const GIT_ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
const git = (root: string, ...args: string[]) =>
  execFileSync("git", ["-C", root, ...args], { encoding: "utf8", env: GIT_ENV, maxBuffer: 64 * 1024 * 1024 });

function codeFiles(root: string): string[] {
  const listed = git(root, "ls-files", "-z", "--cached", "--others", "--exclude-standard").split("\0");
  return [...new Set(listed)]
    .filter((p) => CODE_FILE.test(p) && !TEST_FILE.test(p) && !NOT_CODE.some((d) => p.startsWith(d)))
    .filter((p) => {
      try {
        return statSync(join(root, p)).isFile();
      } catch {
        return false; // tracked and deleted in the working tree
      }
    })
    .sort();
}

function isUploader(path: string, text: string): boolean {
  return UPLOAD_CALL.test(text) || NAMED_UPLOADER(path, text);
}

/** JS/TS source with its comments removed (a block comment keeps its line breaks); strings are kept as written. */
function stripComments(src: string): string {
  let out = "";
  let quote: string | null = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    if (quote !== null) {
      out += c;
      if (c === "\\") out += src[++i] ?? "";
      else if (c === quote) quote = null;
    } else if (c === "/" && src[i + 1] === "/") {
      while (i + 1 < src.length && src[i + 1] !== "\n") i++;
    } else if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += src.slice(i, stop).replace(/[^\n]/g, "");
      i = stop - 1;
    } else {
      if (c === '"' || c === "'" || c === "`") quote = c;
      out += c;
    }
  }
  return out;
}

const GUARD_MODULE = "src/revenue/publisher-guard.ts";
/** `import { ..., assertMayUpload, ... } from "<specifier>"` at the start of a line; the names and the specifier. */
const NAMED_IMPORT = /^[ \t]*import\s*\{([^}]*)\}\s*from\s*["']([^"'\n]+)["']/gm;
/** A call of assertMayUpload: not `function assertMayUpload(` and not some other object's `.assertMayUpload(`. */
const GUARD_CALL = /(?<!function\s+|[.\w$])assertMayUpload\s*\(/;

function importsGuard(path: string, code: string): boolean {
  for (const m of code.matchAll(NAMED_IMPORT)) {
    if (!m[1]!.split(",").some((name) => name.trim() === "assertMayUpload")) continue;
    const spec = m[2]!;
    if (!spec.startsWith("./") && !spec.startsWith("../")) continue;
    const target = posix.normalize(posix.join(posix.dirname(path), spec)).replace(/\.js$/, ".ts");
    if (target === GUARD_MODULE || `${target}.ts` === GUARD_MODULE) return true;
  }
  return false;
}

function callsGuard(path: string, text: string): boolean {
  if (!JS_FILE.test(path)) return false;
  const code = stripComments(text);
  return importsGuard(path, code) && GUARD_CALL.test(code);
}

/** Uploaders that do not import and call the guard. The guard itself names what it guards and uploads nothing. */
function uploadersWithoutGuard(root: string): string[] {
  return codeFiles(root).filter((p) => {
    if (p === GUARD_MODULE) return false;
    const text = readFileSync(join(root, p), "utf8");
    return isUploader(p, text) && !callsGuard(p, text);
  });
}

function youtubeApiCode(root: string): string[] {
  return codeFiles(root).filter((p) => {
    const text = readFileSync(join(root, p), "utf8");
    return isUploader(p, text) || GOOGLE_API.test(text);
  });
}

/** Every file in the repository's code that touches a Google API or could upload, today, and why it may. */
const KNOWN_YOUTUBE_API_CODE: Record<string, string> = {
  "src/revenue/publisher-guard.ts": "the guard: names the upload calls it guards; uploads nothing",
  "src/revenue/youtube-madeforkids.ts": "reader: videos.list part=status (the designation read-back); no upload",
  "scripts/youtube-madeforkids-readback.ts": "reader: runs the read-back with a Data API key; no upload",
  "src/revenue/youtube-analytics.ts": "reader: YouTube Analytics reports (yt-analytics.readonly); no upload",
};

/** Runs `fn` on a scratch git repository holding `files`, and removes it afterwards whatever happens. */
function inScratchTree<T>(files: Record<string, string>, fn: (root: string) => T): { root: string; result: T } {
  const root = mkdtempSync(join(tmpdir(), "publisher-guard-scan-"));
  try {
    execFileSync("git", ["init", "-q", root], { env: GIT_ENV });
    for (const [p, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, p)), { recursive: true });
      writeFileSync(join(root, p), text);
    }
    return { root, result: fn(root) };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const GUARDED = 'import { assertMayUpload } from "./publisher-guard.js";\n\nassertMayUpload(state, attempt);\nawait yt.videos.insert({});\n';

/** The scan's own fixtures. Each uploader matches one UPLOAD_CALL pattern alone, under a name that says neither publish nor upload. */
const SCRATCH: Record<string, string> = {
  ".gitignore": "node_modules\ndist\n",
  [GUARD_MODULE]: "// names videos.insert; it is the guard\nexport function assertMayUpload() {}\n",
  // One unguarded uploader per pattern, in the places the first scan did not reach.
  "packages/cli/src/yt-send.ts": 'await yt.videos.insert({ part: ["snippet", "status"] });\n',
  "products/chart-explainer/yt_send.py": 'request = svc.videos().insert(part="snippet,status", body=body)\n',
  "workflows/scopes.js": 'export const SCOPE = "https://www.googleapis.com/auth/youtube.upload";\n',
  "scripts/build/send.mjs": 'await fetch("https://www.googleapis.com/upload/youtube/v3/videos", { method: "POST" });\n',
  "out/resumable.sh": 'curl -X POST "$HOST/v3/videos?uploadType=resumable&part=snippet"\n',
  "products/x/discovery.py": "from googleapiclient.discovery import build\n",
  "src/revenue/yt-client.ts": 'import { youtube } from "@googleapis/youtube";\n',
  "scripts/gapi.mjs": 'import { google } from "googleapis";\n',
  ".github/workflows/post.yml": "run: curl https://api.upload-post.com/api/upload\n",
  "scripts/post-client.mjs": 'import UploadClient from "upload-post";\n',
  "products/x/post.py": "from upload_post import Client\n",
  "src/revenue/up.ts": "const client = new UploadPost(key);\n",
  "scripts/upload-short.ts": "// sends the short to YouTube\n",
  "src/__tests__/helpers/fixture-sender.ts": "await yt.videos.insert({});\n",
  // Guard calls that do not count.
  "src/revenue/comment-only.ts": '// import { assertMayUpload } from "./publisher-guard.js"; assertMayUpload(state, attempt)\nawait yt.videos.insert({});\n',
  "src/revenue/block-comment.ts": '/*\nimport { assertMayUpload } from "./publisher-guard.js";\n*/\nassertMayUpload(state, attempt);\nawait yt.videos.insert({});\n',
  "src/revenue/call-in-comment.ts": 'import { assertMayUpload } from "./publisher-guard.js";\n// assertMayUpload(state, attempt);\nawait yt.videos.insert({});\n',
  "src/revenue/own-guard.ts": "function assertMayUpload(..._: unknown[]) {}\nassertMayUpload(state, attempt);\nawait yt.videos.insert({});\n",
  "src/revenue/member-call.ts": 'import { assertMayUpload } from "./publisher-guard.js";\nvoid assertMayUpload;\nother.assertMayUpload(state, attempt);\nawait yt.videos.insert({});\n',
  "src/other/publisher-guard.ts": "export function assertMayUpload() {}\n",
  "src/other/sender.ts": GUARDED,
  "products/x/guarded.py": '"""\nimport { assertMayUpload } from "../../src/revenue/publisher-guard.js";\nassertMayUpload(state, attempt)\n"""\nsvc.videos().insert(part="snippet")\n',
  // Guard calls that count.
  "src/revenue/guarded-sender.ts": GUARDED,
  "scripts/guarded-multiline.ts":
    'import {\n  UploadRefused,\n  assertMayUpload,\n} from "../src/revenue/publisher-guard.js";\nconst url = "https://example.org/a"; assertMayUpload(state, attempt);\nawait yt.videos.insert({});\n',
  // Not scanned, or not uploaders.
  "src/__tests__/revenue/x.test.ts": "youtube.videos.insert\n",
  "products/x/tests/test_up.py": "videos.insert\n",
  "node_modules/googleapis/index.js": "videos.insert\n",
  "dist/revenue/publisher-guard.js": "// names videos.insert\nexport function assertMayUpload() {}\n",
  "research/measurements/sample.py": 'svc.videos().insert(part="snippet")\n',
  "src/revenue/reader.ts": 'const HOST = "www.googleapis.com";\n',
  "scripts/workflows/mcp-publish-prep.js": "// npm publish, nothing to do with video\n",
  "scripts/terms.mjs": '{ domain: "upload-post.com", why: "Upload-Post\'s terms bar automated access" }\n',
};

const SCRATCH_UNGUARDED = [
  ".github/workflows/post.yml",
  "out/resumable.sh",
  "packages/cli/src/yt-send.ts",
  "products/chart-explainer/yt_send.py",
  "products/x/discovery.py",
  "products/x/guarded.py",
  "products/x/post.py",
  "scripts/build/send.mjs",
  "scripts/gapi.mjs",
  "scripts/post-client.mjs",
  "scripts/upload-short.ts",
  "src/__tests__/helpers/fixture-sender.ts",
  "src/other/sender.ts",
  "src/revenue/block-comment.ts",
  "src/revenue/call-in-comment.ts",
  "src/revenue/comment-only.ts",
  "src/revenue/member-call.ts",
  "src/revenue/own-guard.ts",
  "src/revenue/up.ts",
  "src/revenue/yt-client.ts",
  "workflows/scopes.js",
];

describe("every publisher calls the guard first (the scan)", () => {
  it("finds every uploader that skips the guard, and passes the ones that call it (the scan itself, on a scratch tree)", () => {
    const { root, result } = inScratchTree(SCRATCH, (r) => ({ unguarded: uploadersWithoutGuard(r), api: youtubeApiCode(r) }));
    expect(result.unguarded).toEqual([...SCRATCH_UNGUARDED].sort());
    expect(result.api).toEqual(
      [...SCRATCH_UNGUARDED, GUARD_MODULE, "scripts/guarded-multiline.ts", "src/revenue/guarded-sender.ts", "src/revenue/reader.ts"].sort(),
    );
    expect(existsSync(root)).toBe(false); // the scratch tree is removed
  });

  it("every upload pattern has a scratch uploader that it alone catches, so dropping any pattern fails the test above", () => {
    const matching = (text: string) => UPLOAD_PATTERNS.filter((p) => new RegExp(p, "i").test(text));
    for (const pattern of UPLOAD_PATTERNS) {
      const caughtByItAlone = SCRATCH_UNGUARDED.filter((f) => {
        const m = matching(SCRATCH[f]!);
        return m.length === 1 && m[0] === pattern && !NAMED_UPLOADER(f, SCRATCH[f]!);
      });
      expect(caughtByItAlone, pattern).not.toEqual([]);
    }
  });

  it("no code in the repository can upload to YouTube without calling assertMayUpload", () => {
    expect(uploadersWithoutGuard(ROOT)).toEqual([]);
  });

  it("the code that touches a Google API is the guard and the readers, nothing else: no publisher exists yet", () => {
    expect(youtubeApiCode(ROOT)).toEqual(Object.keys(KNOWN_YOUTUBE_API_CODE).sort());
  });

  it("the scan reads the tree it claims to (so an empty walk cannot pass the two tests above)", () => {
    const files = codeFiles(ROOT);
    expect(files.length).toBeGreaterThan(200);
    for (const p of [
      GUARD_MODULE,
      "src/revenue/experiments.ts",
      "scripts/youtube-madeforkids-readback.ts",
      "products/chart-explainer/render.py",
      "packages/cli/src/index.ts",
      "workflows/colony-criteria-sweep.js",
      "src/__tests__/mocks.ts",
    ]) {
      expect(files).toContain(p);
    }
    for (const dir of [".github/workflows/", ".claude/skills/", "vendor/"]) expect(files.some((p) => p.startsWith(dir))).toBe(true);
    expect(files.filter((p) => TEST_FILE.test(p) || p.startsWith("research/") || p.split("/").includes("node_modules"))).toEqual([]);
  });
});
