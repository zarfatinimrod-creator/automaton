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
 * read that followed the upload; K-T1k and T1's P2 ask whether an upload is "still public 72 hours later".
 *
 * THE STATE HOLDS NO VALUE THE API RETURNED (research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md §2). A
 * read's `madeForKids` and `privacyStatus` live in the run's memory (MadeForKidsReading) from the fetch to the merge and
 * die with the process; the state keeps only the colony's own facts: ISO times from the run's clock, and booleans that
 * answer its own pre-registered checks. Why: a keyed read is Non-Authorized Data, which the YouTube API Services Terms
 * let a client keep for 30 days at most (III.E.4.d), and the state is committed to a public repository, whose history
 * keeps a value for good; a verdict on the colony's own check about its own upload is the colony's record, not YouTube's
 * data in another form (the ruling's §1 and §2, an inference it marks and tells the owner at Stage A). So the kills keep
 * their inputs for the experiment's life, nothing is left for a purge to find, and nothing the API returned is stored,
 * committed, logged or printed. Per upload the state keeps: when the first read was taken and whether it returned the
 * video, with P1's API half judged at it (returned and public) — P1's read, written once (ruling 7.10 row 24 amendment
 * 1); when the first read that carried a designation was taken (§6 rule 2's read-back) and, when that read found the
 * upload public, the start of P2's clock; when a read last found the upload public; when a read first carried the
 * designation the line does NOT declare (never cleared); and when a read first found the upload not public after a
 * public one (never cleared). `readbackOf()` turns that into ExperimentReadings.madeForKidsReadback, from which
 * experiments.ts derives P-2's count: there is no typed-in override count beside it, and the count itself is never
 * stored. `assertColonyFactsOnly()` is the invariant; the read-back script runs it before every write.
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

/**
 * One read of one video, as `videos.list` answered it: held in memory from the fetch to the merge, never stored (ruling
 * 12.10 row 28 §2 decision 1).
 */
export interface MadeForKidsReading {
  id: string;
  /**
   * Whether the response carried the video at this read: false when it did not, and then madeForKids and privacyStatus
   * are null. The entry's firstReadReturned keeps it for the first read (ruling 7.10 row 24 amendment 1).
   */
  returned: boolean;
  /** `status.madeForKids` at this read, or null when the video was not returned or its status carried no boolean. */
  madeForKids: Designation;
  /** `status.privacyStatus` at this read ("public", "private", "unlisted"), or null when the video was not returned or its status carried no string. */
  privacyStatus: string | null;
  /** When this read was taken, whatever it carried. */
  readAt: string;
}

/**
 * What the state keeps for one upload across runs: the colony's own facts only — times from the run's clock and the
 * answers to its own checks, never a value the API returned (ruling 12.10 row 28 §2 decision 2). Every field is null
 * until a read gives it a value.
 */
export interface UploadReadback {
  /** The upload's id as the uploads file gave it; the read-back never writes that file. */
  id: string;
  /**
   * When the first read the read-back took for this upload was taken, designated or not: P1's read (T1-PROTOCOL.md P1;
   * ruling 7.10 row 24 §1 decision 1 and amendment 1), taken in the same colony run as the publisher's response. Written
   * once.
   */
  firstReadAt: string | null;
  /** Whether that first read's response carried the video. Written once, beside firstReadAt. */
  firstReadReturned: boolean | null;
  /**
   * P1's API half as judged at that first read: true when the response carried the video and its status said public,
   * else false — the answer, kept in place of the API's privacyStatus. Written once, beside firstReadAt.
   */
  p1Api: boolean | null;
  /** When the first read that carried a designation was taken: §6 rule 2's read-back after the upload. Written once. */
  firstDesignationAt: string | null;
  /**
   * Where stayedPublic()'s clock starts: firstDesignationAt when that same read found the upload public, else null for
   * the entry's life. Written only in the merge that writes firstDesignationAt.
   */
  p2ClockAt: string | null;
  /** When the latest read that found the upload public was taken; every run that finds it public refreshes it. */
  lastPublicAt: string | null;
  /**
   * When a read first found the upload not public (private, unlisted, or not returned) after a read found it public —
   * tested as lastPublicAt !== null before this run's update. Never cleared.
   */
  leftPublicAt: string | null;
  /**
   * When a read first carried the designation the line does NOT declare: "true" on T1's line (YouTube's override, P-2),
   * "false" on the kids line (K-mfk-designation). Never cleared by a later read or by the one appeal.
   */
  contradictedAt: string | null;
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
 * One reading per id asked, in the order asked. A video the response does not carry reads `returned` false. It, or one
 * whose status has no boolean `madeForKids`, reads as null — never as false: an unread designation is an instrument fault
 * (§10 rule 2), not a pass.
 */
export function parseVideosList(body: unknown, ids: readonly string[], readAt: string): MadeForKidsReading[] {
  const b = body as { error?: { code?: number; message?: string }; items?: unknown } | null;
  if (b && typeof b === "object" && b.error) {
    throw new Error(`videos.list error ${b.error.code ?? ""} ${b.error.message ?? ""}`.trim());
  }
  if (!b || typeof b !== "object" || !Array.isArray(b.items)) throw new TypeError("not a videos.list response (no items list)");
  const items = b.items as { id?: unknown; status?: { madeForKids?: unknown; privacyStatus?: unknown } }[];
  return ids.map((id) => {
    const item = items.find((it) => it && it.id === id);
    const status = item?.status;
    const mfk = typeof status?.madeForKids === "boolean" ? (String(status.madeForKids) as "true" | "false") : null;
    const privacyStatus = typeof status?.privacyStatus === "string" ? status.privacyStatus : null;
    return { id, returned: item !== undefined, madeForKids: mfk, privacyStatus, readAt };
  });
}

const unreadEntry = (id: string): UploadReadback => ({
  id, firstReadAt: null, firstReadReturned: null, p1Api: null, firstDesignationAt: null, p2ClockAt: null, lastPublicAt: null,
  leftPublicAt: null, contradictedAt: null,
});

/**
 * The new state: every listed upload in upload order, then any earlier entry whose upload left the list (kept as it was,
 * which holds colony facts only). A listed upload this run read: the first read's time, whether it returned the video
 * and P1's API half judged at it are kept, or this read gives them whatever it carried, the video not returned included
 * (amendment 1: written once, never changed); the first designation read's time is kept, or this read gives it, and the
 * merge that writes it also writes P2's clock start, this read's time if it found the upload public, else null for good;
 * a public read refreshes lastPublicAt; and a contradiction, or a departure from public tested against the prior
 * lastPublicAt, is recorded the first time it is seen and never cleared. A listed upload this run has no reading for keeps
 * its entry as it was. The reading's own values stay in `fresh` and are written nowhere (ruling 12.10 row 28 §2).
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
    const isPublic = r.privacyStatus === "public";
    const firstDesignationAt = p.firstDesignationAt ?? (designated ? r.readAt : null);
    const startsClock = p.firstDesignationAt === null && firstDesignationAt !== null;
    return {
      id,
      firstReadAt: p.firstReadAt ?? r.readAt,
      firstReadReturned: p.firstReadReturned ?? r.returned,
      p1Api: p.p1Api ?? (r.returned && r.privacyStatus === "public"),
      firstDesignationAt,
      p2ClockAt: startsClock ? (isPublic ? r.readAt : null) : p.p2ClockAt,
      lastPublicAt: isPublic ? r.readAt : p.lastPublicAt,
      leftPublicAt: p.leftPublicAt ?? (p.lastPublicAt !== null && !isPublic ? r.readAt : null),
      contradictedAt: p.contradictedAt ?? (designated && r.madeForKids !== declared ? r.readAt : null),
    };
  };
  const listed = new Set(uploads.map((u) => u.id));
  const videos = [...uploads.map((u) => next(u.id)), ...state.videos.filter((v) => !listed.has(v.id))];
  return { ...state, updatedAt: now, videos };
}

/** The values the API returns for `status.privacyStatus` and, as text, `status.madeForKids`: never a leaf of the state. */
const API_VALUES: ReadonlySet<string> = new Set(["public", "private", "unlisted", "true", "false"]);

const isIsoTime = (s: string): boolean => {
  const t = Date.parse(s);
  return !Number.isNaN(t) && new Date(t).toISOString() === s;
};

/**
 * The state's invariant (research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md §2 decision 2), as a refusal:
 * every leaf is null, a boolean, or a string that is the line id (under `experiment`), a video id matching VIDEO_ID
 * (under `id`), or an ISO time that Date.parse accepts and that round-trips through toISOString() (anywhere else); and no
 * leaf is "public", "private", "unlisted", "true" or "false". It throws on any other state, naming every failing leaf by
 * its path and never its value — what it says may be printed, and a value the API returned may not
 * (§2 decision 4). scripts/youtube-madeforkids-readback.ts runs it before it writes.
 */
export function assertColonyFactsOnly(state: unknown): void {
  const bad: string[] = [];
  const leaf = (x: unknown, key: string | null, path: string): void => {
    if (x === null || typeof x === "boolean") return;
    if (typeof x === "object") {
      if (Array.isArray(x)) x.forEach((y, i) => leaf(y, null, `${path}[${i}]`));
      else for (const [k, y] of Object.entries(x)) leaf(y, k, `${path}.${k}`);
      return;
    }
    const ok =
      typeof x === "string" &&
      !API_VALUES.has(x) &&
      (key === "experiment" ? isReadbackLine(x) : key === "id" ? VIDEO_ID.test(x) : isIsoTime(x));
    if (!ok) bad.push(path);
  };
  if (state === null || typeof state !== "object" || Array.isArray(state)) bad.push("state");
  else leaf(state, null, "state");
  if (bad.length) {
    throw new TypeError(
      `the read-back state holds what is not a colony fact at ${bad.join(", ")} — only the colony's own times and the ` +
        `answers to its checks are kept, never a value the API returned ` +
        `(research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md §2)`,
    );
  }
}

/**
 * ExperimentReadings.madeForKidsReadback: one entry per upload — every listed upload in its order, then any entry the state
 * holds for an upload no longer listed. An entry is the designation the line does not declare once any read carried it
 * (`contradictedAt`), else the line's own declaration once a read carried a designation (`firstDesignationAt`: that
 * read agreed with it, or `contradictedAt` would be set), else null (an upload the reader has not read, or has not run
 * on since it went up). Each entry is the line's declaration or the colony's override record, never YouTube's current
 * value, which is read fresh each run and stored nowhere (ruling 12.10 row 28 §2 decisions 3 and 7).
 */
export function readbackOf(state: MadeForKidsState, uploads: readonly { id: string }[]): Designation[] {
  const contrary: Designation = state.declaresMadeForKids ? "false" : "true";
  const declared: Designation = state.declaresMadeForKids ? "true" : "false";
  const byId = new Map(state.videos.map((v) => [v.id, v]));
  const listed = new Set(uploads.map((u) => u.id));
  const entries = [...uploads.map((u) => byId.get(u.id) ?? unreadEntry(u.id)), ...state.videos.filter((v) => !listed.has(v.id))];
  return entries.map((v) => (v.contradictedAt !== null ? contrary : v.firstDesignationAt !== null ? declared : null));
}

/**
 * Whether an upload stayed public for `hours` (K-T1k, and T1's P2 "still public 72 hours later", read through the API,
 * never the watch page): true once P2's clock start (`p2ClockAt`, the first designation read, when it found the upload
 * public) and the latest read that found it public (`lastPublicAt`) are at least `hours` apart, with no read since a
 * public one finding it otherwise; false once one did (`leftPublicAt`); null while that is not yet known, and for the
 * entry's life when the first designation read did not find it public. Reads are periodic, so the answer is as good as
 * their spacing. The clock starts at the first designation read (never the first read), which the read-back takes in the
 * same colony run as the publisher's response, so the window is never judged early and at worst one run late; a read with
 * no designation does not start it (research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md §4
 * decisions 1-2). It reads the colony's own times only: the state keeps no privacyStatus, and these three times answer
 * the same question the readings did (ruling 12.10 row 28 §2 decision 3).
 */
export function stayedPublic(v: UploadReadback, hours: number): boolean | null {
  if (v.leftPublicAt !== null) return false;
  if (v.p2ClockAt === null || v.lastPublicAt === null) return null;
  return Date.parse(v.lastPublicAt) - Date.parse(v.p2ClockAt) >= hours * 3_600_000 ? true : null;
}

/**
 * The first-upload window's four readings and its verdict (T1-PROTOCOL.md P1-P4; K-T1k on the kids line). Each is true,
 * false, or null while unread.
 */
export interface FirstUploadWindow {
  /**
   * The upload returns public: the publisher's response (success and the id) and the first read, designated or not,
   * returned the video and found it public (`p1Api`). A first read that did not return the video, or found it anything
   * but public, fails it. The state keeps that read's answer, judged when it was taken and written once, never the API's
   * privacyStatus (ruling 12.10 row 28 §2 decisions 1-2): the answer is all P1 needs past the run.
   */
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
 * readings. P1 reads the entry's first read, designated or not, never the first designation read (amendment 1 of the
 * same ruling), through `p1Api`, the answer judged at that read: false when the publisher did not accept the upload, or
 * when that read did not return the video or found it anything but public (`p1Api` false); true when the publisher
 * accepted it and that read found it public (`p1Api` true); else null. P2 is `stayedPublic(entry, hours)`, whose clock
 * still starts at the first designation read (§4 decisions 1-2 stand). It fetches nothing: an auditor re-derives the
 * verdict from the same state.
 */
export function firstUploadWindow(
  entry: UploadReadback | null,
  publisherAccepted: boolean | null,
  p3: boolean | null,
  p4: boolean | null,
  hours = 72,
): FirstUploadWindow {
  const p1Api = entry?.p1Api ?? null;
  let p1: boolean | null = null;
  if (publisherAccepted === false) p1 = false;
  else if (p1Api === false) p1 = false;
  else if (publisherAccepted === true && p1Api === true) p1 = true;
  const p2 = entry === null ? null : stayedPublic(entry, hours);
  const readings = [p1, p2, p3, p4];
  let passed: boolean | null = null;
  if (readings.includes(false)) passed = false;
  else if (readings.every((r) => r === true)) passed = true;
  return { p1, p2, p3, p4, passed };
}
