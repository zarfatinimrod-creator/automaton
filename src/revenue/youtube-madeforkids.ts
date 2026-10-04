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

export interface MadeForKidsReading {
  id: string;
  madeForKids: Designation;
  /** `status.privacyStatus` at the read ("public", "private", "unlisted"), or null when the video was not returned. */
  privacyStatus: string | null;
  /** When `madeForKids` was read; null while it has no reading. */
  readAt: string | null;
}

/** The experiment's read-back state: one reading per upload, in upload order. */
export interface MadeForKidsState {
  experiment: ReadbackLine;
  declaresMadeForKids: boolean;
  updatedAt: string | null;
  videos: MadeForKidsReading[];
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
    return { id, madeForKids: mfk, privacyStatus, readAt: mfk === null ? null : readAt };
  });
}

/** The uploads that still need a read: those with no entry, or an entry whose designation is null. */
export function idsToRead(state: MadeForKidsState, uploads: readonly { id: string }[]): string[] {
  const read = new Set(state.videos.filter((v) => v.madeForKids !== null).map((v) => v.id));
  return uploads.map((u) => u.id).filter((id) => !read.has(id));
}

/**
 * The new state: every upload in upload order, then any earlier reading whose upload left the list. A reading once taken
 * is kept as it was — the read is once per upload (§6 rule 2) — and a fresh reading only fills an entry that had none.
 */
export function mergeReadings(
  state: MadeForKidsState,
  uploads: readonly { id: string }[],
  fresh: readonly MadeForKidsReading[],
  now: string,
): MadeForKidsState {
  const prior = new Map(state.videos.map((v) => [v.id, v]));
  const latest = new Map(fresh.map((v) => [v.id, v]));
  const pick = (id: string): MadeForKidsReading => {
    const p = prior.get(id);
    if (p && p.madeForKids !== null) return p;
    return latest.get(id) ?? p ?? { id, madeForKids: null, privacyStatus: null, readAt: null };
  };
  const listed = new Set(uploads.map((u) => u.id));
  const videos = [...uploads.map((u) => pick(u.id)), ...state.videos.filter((v) => !listed.has(v.id))];
  return { ...state, updatedAt: now, videos };
}

/** ExperimentReadings.madeForKidsReadback: the designations in upload order. */
export function readbackOf(state: MadeForKidsState): Designation[] {
  return state.videos.map((v) => v.madeForKids);
}
