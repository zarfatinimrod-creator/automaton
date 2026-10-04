import { describe, it, expect } from "vitest";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
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

const attempt = (manifest: VideoManifest, c: ChannelState = channel()): UploadAttempt => ({ manifest, channel: c, exists });

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
      "verdict-current",
      "publication-gate",
    ]);
  });

  it("clears T1's first upload: before it nothing is uploaded, so nothing is unread (§10 rule 1)", () => {
    expect(codes(experimentStateOf(T1_LINE, t1BeforeFirstUpload()), attempt(t1()))).toBe("cleared");
  });

  it("clears T1 when its earlier upload read back false, the designation T1 declares", () => {
    expect(codes(experimentStateOf(T1_LINE, readings({ madeForKidsReadback: ["false"] })), attempt(t1()))).toBe("cleared");
  });

  it("clears an extension (K3 between the lines): the experiment goes on and nothing holds the next upload", () => {
    const r = readings({ day: 112, videosPassedGate: 6, medianStrangerViews: 120, strangerWatchHours28d: 400 });
    const state = experimentStateOf(KIDS_LINE, r);
    expect(state.verdict.decision).toBe("extend");
    expect(codes(state)).toBe("cleared");
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
    const noDisk: UploadAttempt = { manifest: kids(), channel: channel(), exists: () => false };
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
 * The scan covers the colony's own code: src/, scripts/, products/ and .github/workflows/, tests excluded (they hold the
 * patterns as data, as this file does). "Can put a video on YouTube" means it names the Data API's insert call or upload
 * endpoint, Google's client libraries, or Upload-Post (the publisher T1-PRECHECK.md priced) by API host, package or
 * client; or its file name says publish or upload and its text says YouTube.
 *
 * When the first publisher is built: it must import the guard and call assertMayUpload before its upload call (the first
 * test below), and it must be added to KNOWN_YOUTUBE_API_CODE with a reason (the second). A reviewer reads both changes.
 */

const SCAN_ROOTS = ["src", "scripts", "products", ".github/workflows"];
const SKIP_DIRS = new Set(["node_modules", ".git", ".venv", "venv", ".cache", "__pycache__", "dist", "build", "out", "tests", "test", "__tests__"]);
const CODE_FILE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|py|sh|ya?ml)$/;
const TEST_FILE = /\.test\.[a-z]+$|(^|\/)test_[^/]*\.py$|_test\.py$/;

/**
 * Code that uploads to YouTube, by what it calls or loads. Package names count only in an import or require: a sentence
 * that says "Upload-Post's terms" (render-watch.mjs's terms-barred list) is not a client.
 */
const PACKAGE = (name: string) => String.raw`(?:from\s+|require\(\s*|import\(\s*)["']${name}["']`;
const UPLOAD_CALL = new RegExp(
  [
    String.raw`videos\.insert`,
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
  ].join("|"),
  "i",
);
/** Code that talks to a Google API host at all: the readers do. */
const GOOGLE_API = /googleapis/i;

function codeFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) walk(p);
      } else if (e.isFile()) {
        const rel = relative(root, p).split("\\").join("/");
        if (CODE_FILE.test(rel) && !TEST_FILE.test(rel)) out.push(rel);
      }
    }
  };
  for (const r of SCAN_ROOTS) walk(join(root, r));
  return out.sort();
}

function isUploader(path: string, text: string): boolean {
  return UPLOAD_CALL.test(text) || (/publish|upload/i.test(basename(path)) && /youtube/i.test(text));
}

const GUARD_MODULE = "src/revenue/publisher-guard.ts";
const callsGuard = (text: string) => /publisher-guard(\.js|\.ts)?["']/.test(text) && /\bassertMayUpload\s*\(/.test(text);

/** Uploaders that do not import and call the guard. The guard itself names what it guards and uploads nothing. */
function uploadersWithoutGuard(root: string): string[] {
  return codeFiles(root).filter((p) => {
    if (p === GUARD_MODULE) return false;
    const text = readFileSync(join(root, p), "utf8");
    return isUploader(p, text) && !callsGuard(text);
  });
}

function youtubeApiCode(root: string): string[] {
  return codeFiles(root).filter((p) => {
    const text = readFileSync(join(root, p), "utf8");
    return isUploader(p, text) || GOOGLE_API.test(text);
  });
}

/** Every file in the colony's code that touches a Google API or could upload, today, and why it may. */
const KNOWN_YOUTUBE_API_CODE: Record<string, string> = {
  "src/revenue/publisher-guard.ts": "the guard: names the upload calls it guards; uploads nothing",
  "src/revenue/youtube-madeforkids.ts": "reader: videos.list part=status (the designation read-back); no upload",
  "scripts/youtube-madeforkids-readback.ts": "reader: runs the read-back with a Data API key; no upload",
  "src/revenue/youtube-analytics.ts": "reader: YouTube Analytics reports (yt-analytics.readonly); no upload",
};

describe("every publisher calls the guard first (the scan)", () => {
  it("finds an uploader that skips the guard, and passes one that calls it (the scan itself, on a scratch tree)", () => {
    const root = mkdtempSync(join(tmpdir(), "publisher-guard-scan-"));
    const put = (p: string, text: string) => {
      mkdirSync(dirname(join(root, p)), { recursive: true });
      writeFileSync(join(root, p), text);
    };
    put(GUARD_MODULE, "// names videos.insert; it is the guard\nexport function assertMayUpload() {}\n");
    put("src/revenue/yt-publisher.ts", "await youtube.videos.insert({ part: ['snippet', 'status'] });\n");
    put("scripts/upload-short.ts", "// sends the short to YouTube\n");
    put("products/x/publish.py", "from upload_post import UploadPostClient\n");
    put(".github/workflows/post.yml", "run: curl https://api.upload-post.com/api/upload\n");
    put(
      "src/revenue/guarded-publisher.ts",
      'import { assertMayUpload } from "./publisher-guard.js";\nassertMayUpload(state, attempt);\nawait youtube.videos.insert({});\n',
    );
    put("src/__tests__/revenue/x.test.ts", "youtube.videos.insert\n");
    put("products/x/tests/test_up.py", "videos.insert\n");
    put("node_modules/googleapis/index.js", "videos.insert\n");
    put("src/revenue/reader.ts", 'const HOST = "www.googleapis.com";\n');
    put("scripts/workflows/mcp-publish-prep.js", "// npm publish, nothing to do with video\n");
    put("scripts/terms.mjs", '{ domain: "upload-post.com", why: "Upload-Post\'s terms bar automated access" }\n');
    put("scripts/post-client.mjs", 'import UploadClient from "upload-post";\n');
    expect(uploadersWithoutGuard(root)).toEqual([
      ".github/workflows/post.yml",
      "products/x/publish.py",
      "scripts/post-client.mjs",
      "scripts/upload-short.ts",
      "src/revenue/yt-publisher.ts",
    ]);
    expect(youtubeApiCode(root)).toEqual([
      ".github/workflows/post.yml",
      "products/x/publish.py",
      "scripts/post-client.mjs",
      "scripts/upload-short.ts",
      "src/revenue/guarded-publisher.ts",
      "src/revenue/publisher-guard.ts",
      "src/revenue/reader.ts",
      "src/revenue/yt-publisher.ts",
    ]);
  });

  it("no code in the colony can upload to YouTube without calling assertMayUpload", () => {
    expect(uploadersWithoutGuard(ROOT)).toEqual([]);
  });

  it("the code that touches a Google API is the guard and the readers, nothing else: no publisher exists yet", () => {
    expect(youtubeApiCode(ROOT)).toEqual(Object.keys(KNOWN_YOUTUBE_API_CODE).sort());
  });

  it("the scan reads the tree it claims to (so an empty walk cannot pass the two tests above)", () => {
    const files = codeFiles(ROOT);
    expect(files.length).toBeGreaterThan(200);
    for (const p of [GUARD_MODULE, "src/revenue/experiments.ts", "scripts/youtube-madeforkids-readback.ts", "products/chart-explainer/render.py"]) {
      expect(files).toContain(p);
    }
    expect(files.some((p) => p.startsWith(".github/workflows/"))).toBe(true);
    expect(files.some((p) => p.includes("__tests__") || TEST_FILE.test(p))).toBe(false);
  });
});
