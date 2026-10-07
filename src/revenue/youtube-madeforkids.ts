/**
 * Revenue Colony — the made-for-kids read-back: what YouTube says each uploaded video's audience is.
 *
 * research/channel-loop/RULING-2026-10-04-kids-youtube.md §6 rule 2: "After each upload a reader fetches
 * `status.madeForKids` (`videos.list`, `part=status`)". `true` is the only passing reading on the kids line; `false`
 * there kills it (K-mfk-designation); on T1's line `false` is expected and `true` is YouTube's override (P-2). §10 rule 1:
 * the read is a precondition of uploading, so this reader is built and fixture-tested before Stage A is asked, and is
 * never run live before then (no workflow runs it; youtube-madeforkids.test.ts asserts so).
 *
 * This module is the arithmetic and the bookkeeping; it fetches nothing. scripts/youtube-madeforkids-readback.ts does,
 * with a Data API key from the environment, and writes the state below to state/colony/measurements/.
 *
 * Every upload is re-read on every run, not once (corrected 4.10 after review): P-2 counts a YouTube override on T1's line
 * "when YouTube sets them, whatever the one appeal later decides" (experiments.ts), and YouTube can set one after the
 * read that followed the upload; K-T1k and T1's P2 ask whether an upload is "still public 72 hours later". So the state
 * keeps, per upload, the first read that carried a designation (§6 rule 2's read-back), the latest read with its time,
 * the first read that carried the designation the line does NOT declare (never cleared), and the first read that found a
 * public upload no longer public (never cleared). `readbackOf()` turns that into ExperimentReadings.madeForKidsReadback,
 * from which experiments.ts derives P-2's count: there is no typed-in override count beside it.
 *
 * Grades. Rendered, read for our own compliance only (D1(1)(i); `[against-bar]`): "The madeForKids property enables any
 * user to retrieve the "made for kids" status of a channel or video" (research/rendered/youtube-api-revision-history.txt
 * :987-990); the developer guide's steps: call "videos.list endpoint.", include "at minimum, the id and status parts",
 * and read "status.madeForKids" (research/rendered/yk2-dev-made-for-kids-status.txt:187-198); `status.privacyStatus`
 * (youtube-api-videos-insert.txt:360). Inference until the first live read ("Not ruled here" 4): the endpoint URL, the
 * response envelope (`items[].id`, `items[].status`), that an API key without OAuth returns the field for a public video
 * (ASSESSMENT.md:427-430 grades it so), and the 50-id ceiling per call. None of these pages is fetched from here: they
 * are developers.google.com captures taken before the bar, and the read itself goes to the API host only.
 */

/** The only host this reader talks to: Google's API host, never youtube.com (barred, scripts/render-watch.mjs). */
export const READ_HOST = "www.googleapis.com";
export const VIDEOS_LIST_URL = `https://${READ_HOST}/youtube/v3/videos`;
/** Ids per call. Inference (grade none): the commonly documented ceiling; a larger list is split. */
export const MAX_IDS_PER_CALL = 50;

/** A video's audience as the reader recorded it: "true", "false", or null when it has no reading yet. */
export type Designation = "true" | "false" | null;

export type ReadbackLine = "faceless-youtube" | "kids-explainers";
/** The audience each line declares (experiments.ts `declaresMadeForKids`; G11). */
const DECLARES: Readonly<Record<ReadbackLine, boolean>> = { "faceless-youtube": false, "kids-explainers": true };

/** One read of one video, as `videos.list` answered it. */
export interface MadeForKidsReading {
  id: string;
  /** `status.madeForKids` at this read, or null when the video was not returned or its status carried no boolean. */
  madeForKids: Designation;
  /** `status.privacyStatus` at this read ("public", "private", "unlisted"), or null when the video was not returned. */
  privacyStatus: string | null;
  /** When this read was taken, whatever it carried. */
  readAt: string;
}

/** What the state keeps for one upload across runs. */
export interface UploadReadback {
  id: string;
  /** The first read that carried a designation: §6 rule 2's read-back after the upload. null while no read has. */
  first: MadeForKidsReading | null;
  /** The latest read, whatever it carried. null while the upload has never been asked about. */
  latest: MadeForKidsReading | null;
  /**
   * When a read first carried the designation the line does NOT declare: "true" on T1's line (YouTube's override, P-2),
   * "false" on the kids line (K-mfk-designation). Never cleared by a later read or by the one appeal.
   */
  contradictedAt: string | null;
  /** When a read first found the upload not public (private, unlisted, or not returned) right after a read found it public. */
  leftPublicAt: string | null;
}

/** The experiment's read-back state: one entry per upload, in upload order. */
export interface MadeForKidsState {
  experiment: ReadbackLine;
  declaresMadeForKids: boolean;
  updatedAt: string | null;
  videos: UploadReadback[];
}

const VIDEO_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function isReadbackLine(x: unknown): x is ReadbackLine {
  return typeof x === "string" && Object.hasOwn(DECLARES, x);
}

export function emptyState(experiment: ReadbackLine): MadeForKidsState {
  return { experiment, declaresMadeForKids: DECLARES[experiment], updatedAt: null, videos: [] };
}

/** The `videos.list` request for up to MAX_IDS_PER_CALL ids: parts id and status, the key as a query parameter. */
export function videosListUrl(ids: readonly string[], apiKey: string): string {
  if (ids.length === 0) throw new RangeError("videos.list needs at least one video id");
  if (ids.length > MAX_IDS_PER_CALL) throw new RangeError(`videos.list takes at most ${MAX_IDS_PER_CALL} ids a call, got ${ids.length}`);
  for (const id of ids) if (!VIDEO_ID.test(id)) throw new TypeError(`${JSON.stringify(id)} is not a video id`);
  if (!apiKey) throw new TypeError("videos.list needs an API key");
  const q = new URLSearchParams({ part: "id,status", id: ids.join(","), key: apiKey });
  return `${VIDEOS_LIST_URL}?${q}`;
}

/**
 * One reading per id asked, in the order asked. A video the response does not carry, or whose status has no boolean
 * `madeForKids`, reads as null — never as false: an unread designation is an instrument fault (§10 rule 2), not a pass.
 */
export function parseVideosList(body: unknown, ids: readonly string[], readAt: string): MadeForKidsReading[] {
  const b = body as { error?: { code?: number; message?: string }; items?: unknown } | null;
  if (b && typeof b === "object" && b.error) {
    throw new Error(`videos.list error ${b.error.code ?? ""} ${b.error.message ?? ""}`.trim());
  }
  if (!b || typeof b !== "object" || !Array.isArray(b.items)) throw new TypeError("not a videos.list response (no items list)");
  const items = b.items as { id?: unknown; status?: { madeForKids?: unknown; privacyStatus?: unknown } }[];
  return ids.map((id) => {
    const status = items.find((it) => it && it.id === id)?.status;
    const mfk = typeof status?.madeForKids === "boolean" ? (String(status.madeForKids) as "true" | "false") : null;
    const privacyStatus = typeof status?.privacyStatus === "string" ? status.privacyStatus : null;
    return { id, madeForKids: mfk, privacyStatus, readAt };
  });
}

const unreadEntry = (id: string): UploadReadback => ({ id, first: null, latest: null, contradictedAt: null, leftPublicAt: null });

/**
 * The new state: every listed upload in upload order, then any earlier entry whose upload left the list (kept as it was).
 * A listed upload this run read: its first designation read is kept (or this read becomes it), this read becomes the
 * latest, and a contradiction or a departure from public is recorded the first time it is seen and never cleared.
 */
export function mergeReadings(
  state: MadeForKidsState,
  uploads: readonly { id: string }[],
  fresh: readonly MadeForKidsReading[],
  now: string,
): MadeForKidsState {
  const declared = String(state.declaresMadeForKids);
  const prior = new Map(state.videos.map((v) => [v.id, v]));
  const read = new Map(fresh.map((r) => [r.id, r]));
  const next = (id: string): UploadReadback => {
    const p = prior.get(id) ?? unreadEntry(id);
    const r = read.get(id);
    if (!r) return p;
    const designated = r.madeForKids !== null;
    return {
      id,
      first: p.first ?? (designated ? r : null),
      latest: r,
      contradictedAt: p.contradictedAt ?? (designated && r.madeForKids !== declared ? r.readAt : null),
      leftPublicAt: p.leftPublicAt ?? (p.latest?.privacyStatus === "public" && r.privacyStatus !== "public" ? r.readAt : null),
    };
  };
  const listed = new Set(uploads.map((u) => u.id));
  const videos = [...uploads.map((u) => next(u.id)), ...state.videos.filter((v) => !listed.has(v.id))];
  return { ...state, updatedAt: now, videos };
}

/**
 * ExperimentReadings.madeForKidsReadback: one entry per upload — every listed upload in its order, then any entry the state
 * holds for an upload no longer listed. An entry is the designation the line does not declare once any read carried it,
 * else the first designation read, else null (an upload the reader has not read, or has not run on since it went up).
 */
export function readbackOf(state: MadeForKidsState, uploads: readonly { id: string }[]): Designation[] {
  const contrary: Designation = state.declaresMadeForKids ? "false" : "true";
  const byId = new Map(state.videos.map((v) => [v.id, v]));
  const listed = new Set(uploads.map((u) => u.id));
  const entries = [...uploads.map((u) => byId.get(u.id) ?? unreadEntry(u.id)), ...state.videos.filter((v) => !listed.has(v.id))];
  return entries.map((v) => (v.contradictedAt !== null ? contrary : v.first?.madeForKids ?? null));
}

/**
 * Whether an upload stayed public for `hours` (K-T1k, and T1's P2 "still public 72 hours later", read through the API,
 * never the watch page): true once its first designation read and its latest read, at least `hours` apart, both found it
 * public and no read since a public one found it otherwise; false once one did (or the latest read found it not public
 * after a public one); null while that is not yet known. Reads are periodic, so the answer is as good as their spacing.
 * The clock starts at the first designation read, which the read-back takes in the same colony run as the publisher's
 * response, so the window is never judged early and at worst one run late; a read with no designation does not start it
 * (research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md §4 decisions 1-2).
 */
export function stayedPublic(v: UploadReadback, hours: number): boolean | null {
  if (v.leftPublicAt !== null) return false;
  if (v.first?.privacyStatus !== "public" || v.latest?.privacyStatus !== "public") return null;
  return Date.parse(v.latest.readAt) - Date.parse(v.first.readAt) >= hours * 3_600_000 ? true : null;
}

/**
 * The first-upload window's four readings and its verdict (T1-PROTOCOL.md P1-P4; K-T1k on the kids line). Each is true,
 * false, or null while unread.
 */
export interface FirstUploadWindow {
  /** The upload returns public: the publisher's response (success and the id) and the first designation read `public`. */
  p1: boolean | null;
  /** Still public `hours` later: `stayedPublic(entry, hours)`. */
  p2: boolean | null;
  /** The brand mailbox's reading, as the caller supplies it. */
  p3: boolean | null;
  /** The publisher's channel-state reading, as the caller supplies it. */
  p4: boolean | null;
  /** false if any of the four is false; true if all four are true; else null. ExperimentReadings.t1Passed. */
  passed: boolean | null;
}

/**
 * ExperimentReadings.t1Passed as one pure function of the readings, never a typed-in boolean
 * (research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md §4 decision 3). `entry` is the read-back's
 * entry for the line's first upload, or null; `publisherAccepted` is P1's publisher half (true: the response said success
 * for YouTube and returned the id; false: it did not; null: no response recorded); `p3` and `p4` are the protocol's own
 * readings. P1 is false when the publisher did not accept the upload or the first designation read found it anything but
 * public, true when the publisher accepted it and that read found it public, else null; P2 is `stayedPublic(entry, hours)`.
 * It fetches nothing: an auditor re-derives the verdict from the same state.
 */
export function firstUploadWindow(
  entry: UploadReadback | null,
  publisherAccepted: boolean | null,
  p3: boolean | null,
  p4: boolean | null,
  hours = 72,
): FirstUploadWindow {
  const first = entry?.first ?? null;
  let p1: boolean | null = null;
  if (publisherAccepted === false) p1 = false;
  else if (first !== null && first.privacyStatus !== "public") p1 = false;
  else if (publisherAccepted === true && first?.privacyStatus === "public") p1 = true;
  const p2 = entry === null ? null : stayedPublic(entry, hours);
  const readings = [p1, p2, p3, p4];
  let passed: boolean | null = null;
  if (readings.includes(false)) passed = false;
  else if (readings.every((r) => r === true)) passed = true;
  return { p1, p2, p3, p4, passed };
}
