/**
 * Revenue Colony — the publisher guard: the check every YouTube publisher runs before an upload call, and obeys.
 *
 * No publisher exists. experiments.ts sets `uploadsFrozen` (an unread made-for-kids designation, a spend overrun, any
 * kill), and until 4.10 it said a publisher that does not refuse an upload while it is set may not be built; this module
 * is that refusal, built first (logs/CHANNEL_LOOP.md §9, queued 4.10 item 2). A publisher calls
 * `assertMayUpload(state, attempt)` before it sends anything to YouTube (the Data API's videos.insert, or Upload-Post),
 * and sends nothing if it throws.
 * src/__tests__/revenue/publisher-guard.test.ts fails on any code in the colony that can upload without calling it.
 *
 * It refuses, with an `UploadRefused` naming every reason, when:
 *   - the state is not one it can read: a field missing or of the wrong type in the stored JSON refuses, it never reads
 *     as "no signal" (`state-unreadable`);
 *   - the state is another line's (`line-mismatch`);
 *   - (b) the experiment is killed: any kill fired (`experiment-killed`);
 *   - (a) `uploadsFrozen` is set, or is anything but `false` (`uploads-frozen`);
 *   - (c) the read-back of an earlier upload contradicts the line's declaration — on the kids line, `false`
 *     (K-mfk-designation, ruling 4.10 §6 rule 2, §8 rule 3) (`designation-contradicted`) — or an earlier upload has no
 *     reading: "it also blocks the next upload on that channel until the reading exists" (§10 rule 2, which §10 rule 3
 *     applies to T1 and the kids line alike) (`designation-unread`). The guard reads the read-back itself, so the freeze
 *     does not rest on experiments.ts alone;
 *   - the stored verdict is not the one its readings give today: a publisher re-judges and saves before it uploads, and
 *     never acts on an old "continue" (`verdict-stale`);
 *   - (d) the manifest fails the publication gate G1-G11, which the guard runs itself against the channel as it is now
 *     (`checkPublication`, publication-gate.ts), so a pass cannot be carried in from another day or another channel
 *     (`publication-gate-failed`).
 * Otherwise it returns `{ ok: true, line, videoId, checks }`.
 *
 * Pure, as experiments.ts and publication-gate.ts are: the caller supplies the state, the channel and `exists`; nothing
 * here reads a file or the network. Not covered here: the order ruling 4.10 §8 rule 2 puts between the lines (the kids
 * line's first upload waits on T1's first upload passing and reading back `false`) — that needs T1's state beside the
 * kids line's, and is a protocol step until a publisher exists.
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
  channel: ChannelState;
  exists: (repoPath: string) => boolean;
}

export type RefusalCode =
  | "state-unreadable"
  | "line-mismatch"
  | "experiment-killed"
  | "uploads-frozen"
  | "designation-contradicted"
  | "designation-unread"
  | "verdict-stale"
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
  "verdict-current",
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
  madeForKidsReadback: (x) => Array.isArray(x) && x.every((v) => v === "true" || v === "false" || v === null),
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
  if (!Array.isArray(v.triggered) || !v.triggered.every((t) => typeof t === "string")) return "verdict.triggered is not a list of gate ids";
  if (typeof v.uploadsFrozen !== "boolean") return `verdict.uploadsFrozen is ${JSON.stringify(v.uploadsFrozen) ?? "missing"}, not a boolean`;
  const r = state.readings;
  if (!isObject(r)) return "no readings";
  for (const [field, ok] of Object.entries(READING_FIELDS)) {
    if (!ok(r[field])) return `readings.${field} is ${JSON.stringify(r[field]) ?? "missing"}`;
  }
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
  const readback = readings.madeForKidsReadback.length === 0 && readings.t1Passed !== null ? [null] : readings.madeForKidsReadback;
  const of = (i: number) => `upload ${i} of ${readback.length}`;
  const contrary = spec.declaresMadeForKids ? "false" : null; // T1's "true" is P-2's override: judged in the verdict
  const contradicted = readback.flatMap((d, i) => (contrary !== null && d === contrary ? [i + 1] : []));
  if (contradicted.length) {
    refuse("designation-contradicted", `${contradicted.map(of).join(", ")} read back madeForKids = ${contrary} on a line that declares ${spec.declaresMadeForKids}`);
  }
  const unread = readback.flatMap((d, i) => (d === null ? [i + 1] : []));
  if (unread.length) {
    refuse("designation-unread", `${unread.map(of).join(", ")} has no madeForKids reading: no upload on this channel until it exists (ruling 4.10 §10 rule 2)`);
  }

  // A verdict its own readings no longer give is stale. Refused whichever way it errs: a stored freeze is lifted by
  // re-judging and saving, never by the publisher deciding the reason has gone.
  const now = evaluateExperiment(spec, readings);
  if (!sameVerdict(verdict, now)) {
    refuse("verdict-stale", `the stored verdict is ${verdict.decision}${verdict.uploadsFrozen ? ", frozen" : ""} and its readings give ${now.decision}${now.uploadsFrozen ? ", frozen" : ""} (${now.triggered.join(", ") || "nothing triggered"}): re-judge and save first`);
  }

  // (d) The publication gate, run here against this channel now.
  const gate = checkPublication(manifest, attempt.channel, "publish", attempt.exists);
  if (!gate.pass) refuse("publication-gate-failed", gate.failures.map((f) => `${f.gate}: ${f.reason}`).join("; ") || "the gate did not pass");

  if (reasons.length) throw new UploadRefused(videoId, line, reasons);
  return { ok: true, line, videoId, checks: [...GUARD_CHECKS] };
}
