/**
 * Revenue Colony — the publisher guard: the check every YouTube publisher runs before an upload call, and obeys.
 *
 * No publisher exists. experiments.ts sets `uploadsFrozen` (an unread made-for-kids designation, a spend overrun, any
 * kill), and until 4.10 it said a publisher that does not refuse an upload while it is set may not be built; this module
 * is that refusal, built first (logs/CHANNEL_LOOP.md §9, queued 4.10 item 2). A publisher calls
 * `assertMayUpload(state, attempt)` before it sends anything to YouTube (the Data API's videos.insert, or Upload-Post),
 * and sends nothing if it throws.
 * src/__tests__/revenue/publisher-guard.test.ts fails on any code file in the repository (research/ and test files aside)
 * that can upload and does not import this module and call assertMayUpload.
 *
 * It refuses, with an `UploadRefused` naming every reason, when:
 *   - the state is not one it can read: a field missing or of the wrong type in the stored JSON refuses, it never reads
 *     as "no signal"; so do NaN, an infinity and a sparse list, which only an in-memory state can hold
 *     (`state-unreadable`);
 *   - the state is another line's (`line-mismatch`);
 *   - (b) the experiment is killed: any kill fired (`experiment-killed`);
 *   - (a) `uploadsFrozen` is set, or is anything but `false` (`uploads-frozen`);
 *   - (c) the read-back of an earlier upload contradicts the line's declaration — on the kids line, `false`
 *     (K-mfk-designation, ruling 4.10 §6 rule 2, §8 rule 3) (`designation-contradicted`) — or an earlier upload has no
 *     reading: "it also blocks the next upload on that channel until the reading exists" (§10 rule 2, which §10 rule 3
 *     applies to T1 and the kids line alike) (`designation-unread`). The guard reads the read-back itself, so the freeze
 *     does not rest on experiments.ts alone, and holds it against the channel it is given: an upload the channel lists
 *     beyond the read-back's entries is unread whatever the stored readings say;
 *   - the kids line's first upload, before T1's first upload has passed its window and read back `false` (§8 rule 2:
 *     "T1's first upload passes P1-P4 and its madeForKids read-back returns false ... → the kids line's first upload"),
 *     read from the T1 state the attempt carries (`waits-on-t1`);
 *   - the stored verdict is not the one its own readings give: a verdict is re-judged and saved, never edited
 *     (`verdict-stale`);
 *   - the state was judged on another experiment day than the upload's: the gates move with the day (K-supply at 42, K0
 *     at 56, K3 at 112), so a state that agrees with its readings can still be an old "continue" (`judged-another-day`);
 *   - (d) the manifest fails the publication gate G1-G11, which the guard runs itself against the channel as it is now
 *     (`checkPublication`, publication-gate.ts), so a pass cannot be carried in from another day or another channel
 *     (`publication-gate-failed`).
 * Otherwise it returns `{ ok: true, line, videoId, checks }`.
 *
 * Pure, as experiments.ts and publication-gate.ts are: the caller supplies the state, the channel, `exists`, the day and
 * T1's state; nothing here reads a file or the network. Not covered here, and the publisher's job: how fresh a same-day
 * reading is (views, a policy signal read in the morning, an upload at night) — the ruling sets no age, and the guard
 * knows only the day; and the parts of §8 rule 2 that are not readings (T1's web read at day 56 and Stage A).
 */

import { evaluateExperiment, type ExperimentReadings, type ExperimentVerdict } from "./experiments.js";
import { EXPERIMENT_BY_LINE, checkPublication, type ChannelState, type VideoManifest, type YoutubeLine } from "./publication-gate.js";

/** What a publisher stores for a line and reads back before each upload: the readings and the verdict they gave. */
export interface ExperimentState {
  line: YoutubeLine;
  readings: ExperimentReadings;
  verdict: ExperimentVerdict;
}

/** One upload about to happen: the manifest, the channel it goes to, and how the gate checks a repo path is on disk. */
export interface UploadAttempt {
  manifest: VideoManifest;
  /** The channel as it is now: `published` lists every upload on it, so the read-back must have an entry for each. */
  channel: ChannelState;
  exists: (repoPath: string) => boolean;
  /** The experiment day of the upload, on the same clock as the state's `readings.day`: the state must be judged on it. */
  day: number;
  /** T1's (faceless-youtube) state: read only for the kids line's first upload, which waits on T1's (§8 rule 2). */
  t1State?: ExperimentState;
}

export type RefusalCode =
  | "state-unreadable"
  | "line-mismatch"
  | "experiment-killed"
  | "uploads-frozen"
  | "designation-contradicted"
  | "designation-unread"
  | "waits-on-t1"
  | "verdict-stale"
  | "judged-another-day"
  | "publication-gate-failed";

export interface RefusalReason {
  code: RefusalCode;
  detail: string;
}

/** The checks a cleared upload passed, in the order they run. */
export const GUARD_CHECKS = [
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
] as const;

export type GuardCheck = (typeof GUARD_CHECKS)[number];

export interface UploadClearance {
  ok: true;
  line: YoutubeLine;
  videoId: string;
  checks: GuardCheck[];
}

/** Thrown by assertMayUpload: the upload must not happen. `code` is the first reason; `reasons` holds them all. */
export class UploadRefused extends Error {
  readonly code: RefusalCode;
  readonly reasons: readonly RefusalReason[];
  readonly videoId: string;
  readonly line: string;

  constructor(videoId: string, line: string, reasons: RefusalReason[]) {
    super(`upload of ${videoId} on ${line} refused: ${reasons.map((r) => `${r.code} (${r.detail})`).join("; ")}`);
    this.name = "UploadRefused";
    this.code = reasons[0]!.code;
    this.reasons = reasons;
    this.videoId = videoId;
    this.line = line;
  }
}

/** The state for a line, judged now: what a publisher writes after every read and before every upload. */
export function experimentStateOf(line: YoutubeLine, readings: ExperimentReadings): ExperimentState {
  return { line, readings, verdict: evaluateExperiment(EXPERIMENT_BY_LINE[line], readings) };
}

const DECISIONS: ReadonlySet<string> = new Set(["continue", "extend", "escalate", "kill"]);

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const isNum = (x: unknown) => typeof x === "number" && Number.isFinite(x);
const isNumOrNull = (x: unknown) => x === null || isNum(x);
/** A list whose every slot holds a value `ok` accepts. Array.from turns a hole into undefined; every() would skip it. */
const isListOf = (x: unknown, ok: (v: unknown) => boolean) => Array.isArray(x) && Array.from(x).every(ok);

/** Every field evaluateExperiment reads, with its type: a field the stored JSON lacks must refuse, not read as absent. */
const READING_FIELDS: Readonly<Record<keyof ExperimentReadings, (x: unknown) => boolean>> = {
  day: isNum,
  t1Passed: (x) => x === null || typeof x === "boolean",
  videosPassedGate: isNum,
  medianStrangerViews: isNumOrNull,
  strangerWatchHours28d: isNumOrNull,
  averageViewPercentage: isNumOrNull,
  policySignal: (x) => typeof x === "boolean",
  ungrantedRecurringCost: (x) => typeof x === "boolean",
  madeForKidsReadback: (x) => isListOf(x, (v) => v === "true" || v === "false" || v === null),
  maxRunnerMinutesPerVideo: isNumOrNull,
  maxTokenCostIlsPerVideo: isNumOrNull,
};

/** Why a stored state cannot be read, or null when it can. */
function unreadable(state: unknown): string | null {
  if (!isObject(state)) return "no state object";
  if (typeof state.line !== "string" || !Object.hasOwn(EXPERIMENT_BY_LINE, state.line)) {
    return `line ${JSON.stringify(state.line)} is not a YouTube line (${Object.keys(EXPERIMENT_BY_LINE).join(", ")})`;
  }
  const v = state.verdict;
  if (!isObject(v)) return "no verdict";
  if (typeof v.decision !== "string" || !DECISIONS.has(v.decision)) return `verdict.decision ${JSON.stringify(v.decision)} is not a decision`;
  if (!isListOf(v.triggered, (t) => typeof t === "string")) return "verdict.triggered is not a list of gate ids";
  if (typeof v.uploadsFrozen !== "boolean") return `verdict.uploadsFrozen is ${JSON.stringify(v.uploadsFrozen) ?? "missing"}, not a boolean`;
  const r = state.readings;
  if (!isObject(r)) return "no readings";
  for (const [field, ok] of Object.entries(READING_FIELDS)) {
    if (!ok(r[field])) return `readings.${field} is ${JSON.stringify(r[field]) ?? "missing"}`;
  }
  return null;
}

const KIDS_LINE: YoutubeLine = "kids-explainers";
const T1_LINE: YoutubeLine = "faceless-youtube";

/** Why T1 has not gone first (ruling 4.10 §8 rule 2), or null when its first upload passed and read back `false`. */
function t1NotFirst(t1: unknown): string | null {
  const head = "the kids line's first upload waits on T1's first upload passing P1-P4 and reading back madeForKids = false (ruling 4.10 §8 rule 2)";
  if (t1 === undefined) return `${head}; no T1 state was given`;
  const why = unreadable(t1);
  if (why !== null) return `${head}; T1's state is unreadable: ${why}`;
  const { line, readings } = t1 as ExperimentState;
  if (line !== T1_LINE) return `${head}; the state given for T1 is ${line}'s`;
  if (readings.t1Passed !== true) return `${head}; T1's first-upload window ${readings.t1Passed === null ? "is not judged yet" : "failed"}`;
  const first = readings.madeForKidsReadback[0];
  if (first !== "false") return `${head}; T1's first upload read back ${first === undefined ? "nothing" : first === null ? "no reading" : first}`;
  return null;
}

const sameVerdict = (a: ExperimentVerdict, b: ExperimentVerdict) =>
  a.decision === b.decision && a.uploadsFrozen === b.uploadsFrozen && [...a.triggered].sort().join() === [...b.triggered].sort().join();

/**
 * Throws UploadRefused unless this upload may happen now; returns the checks it passed otherwise. A publisher calls it
 * first, immediately before its upload call, with the state it has just re-judged and the channel as it is now.
 */
export function assertMayUpload(state: ExperimentState, attempt: UploadAttempt): UploadClearance {
  const { manifest } = attempt;
  const videoId = String(manifest?.id);
  const why = unreadable(state);
  if (why !== null) throw new UploadRefused(videoId, String(manifest?.line), [{ code: "state-unreadable", detail: why }]);
  const line = state.line;
  if (manifest.line !== line) {
    throw new UploadRefused(videoId, String(manifest.line), [
      { code: "line-mismatch", detail: `the state is ${line}'s and the manifest is for ${String(manifest.line)}` },
    ]);
  }

  const spec = EXPERIMENT_BY_LINE[line];
  const reasons: RefusalReason[] = [];
  const refuse = (code: RefusalCode, detail: string) => reasons.push({ code, detail });
  const { verdict, readings } = state;

  // (b) A killed line publishes nothing again; there is no "unkill".
  if (verdict.decision === "kill") refuse("experiment-killed", `${spec.id} is killed (${verdict.triggered.join(", ")})`);
  // (a) Frozen until re-judged unfrozen. `!== false`: only an explicit false lets an upload through.
  if (verdict.uploadsFrozen !== false) refuse("uploads-frozen", `${spec.id} has uploads frozen (${verdict.triggered.join(", ") || "no gate named"})`);

  // (c) The read-back, read here and not only through the verdict. Mirrors experiments.ts: once the first-upload window
  // has been judged an upload exists, so an empty read-back is one unread upload, not a clean channel.
  const recorded = readings.madeForKidsReadback.length === 0 && readings.t1Passed !== null ? [null] : readings.madeForKidsReadback;
  // The channel lists the uploads that exist, and readbackOf (youtube-madeforkids.ts) gives at least one entry per listed
  // upload: a read-back shorter than the list is uploads nobody has read.
  const listed = attempt.channel.published.length;
  const readback = recorded.length >= listed ? recorded : [...recorded, ...new Array<null>(listed - recorded.length).fill(null)];
  const short = readback.length > recorded.length ? ` (the channel lists ${listed} upload(s) and the read-back has ${readings.madeForKidsReadback.length} entries)` : "";
  const of = (i: number) => `upload ${i} of ${readback.length}`;
  const contrary = spec.declaresMadeForKids ? "false" : null; // T1's "true" is P-2's override: judged in the verdict
  const contradicted = readback.flatMap((d, i) => (contrary !== null && d === contrary ? [i + 1] : []));
  if (contradicted.length) {
    refuse("designation-contradicted", `${contradicted.map(of).join(", ")} read back madeForKids = ${contrary} on a line that declares ${spec.declaresMadeForKids}`);
  }
  const unread = readback.flatMap((d, i) => (d === null ? [i + 1] : []));
  if (unread.length) {
    refuse("designation-unread", `${unread.map(of).join(", ")} has no madeForKids reading${short}: no upload on this channel until it exists (ruling 4.10 §10 rule 2)`);
  }

  // §8 rule 2: nothing is uploaded on the kids channel yet, so this is its first upload, and it waits on T1's.
  if (line === KIDS_LINE && readback.length === 0) {
    const notFirst = t1NotFirst(attempt.t1State);
    if (notFirst !== null) refuse("waits-on-t1", notFirst);
  }

  // A verdict its own readings no longer give is stale. Refused whichever way it errs: a stored freeze is lifted by
  // re-judging and saving, never by the publisher deciding the reason has gone.
  const now = evaluateExperiment(spec, readings);
  if (!sameVerdict(verdict, now)) {
    refuse("verdict-stale", `the stored verdict is ${verdict.decision}${verdict.uploadsFrozen ? ", frozen" : ""} and its readings give ${now.decision}${now.uploadsFrozen ? ", frozen" : ""} (${now.triggered.join(", ") || "nothing triggered"}): re-judge and save first`);
  }
  // A verdict its readings do give can still be old: judged at day 20 it says continue on day 60, when K0 is due.
  if (!isNum(attempt.day)) {
    refuse("judged-another-day", `the attempt names no experiment day (${JSON.stringify(attempt.day) ?? "missing"}), so the state's day ${readings.day} cannot be checked against it`);
  } else if (readings.day !== attempt.day) {
    refuse("judged-another-day", `the state was judged at day ${readings.day} and the upload is at day ${attempt.day}: read, re-judge and save on the upload's day first`);
  }

  // (d) The publication gate, run here against this channel now.
  const gate = checkPublication(manifest, attempt.channel, "publish", attempt.exists);
  if (!gate.pass) refuse("publication-gate-failed", gate.failures.map((f) => `${f.gate}: ${f.reason}`).join("; ") || "the gate did not pass");

  if (reasons.length) throw new UploadRefused(videoId, line, reasons);
  return { ok: true, line, videoId, checks: [...GUARD_CHECKS] };
}
