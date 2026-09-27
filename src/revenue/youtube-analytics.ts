/**
 * Revenue Colony — the faceless-YouTube experiment's instrument: YouTube Analytics reports → the K0/K3 readings.
 *
 * VERDICT §14.5 ordered "the Analytics reader (UNSUBSCRIBED split, day-56/112 computations)", and RED-TEAM §2.1 made
 * the point that an experiment nobody can read is not an experiment: `K0-unmeasured` and `K3-unmeasured` kill
 * (`experiments.ts`). This module is the arithmetic. It fetches nothing; `scripts/youtube-analytics.ts` does, under the
 * analytics-only consent Stage A asks for (`yt-analytics.readonly`, T1-PROTOCOL.md).
 *
 * Every query shape below is taken from Google's own tables, rendered from a runner on 27.9.2026:
 *   - Traffic-source report: `insightTrafficSourceType` required; `subscribedStatus` optional; metrics `engagedViews`,
 *     `views`, `estimatedMinutesWatched`; `video` is a filter, and `subscribedStatus` a filter too
 *     (research/rendered/yt-analytics-channel-reports.txt:1004-1050). It has **no** `averageViewPercentage`.
 *   - Up to 500 ids in one `video==a,b` filter, and a multi-value filter may be added to the dimensions to group by it
 *     (yt-analytics-reports-query.txt:620-624); filters join with `;` (:618); `ids=channel==MINE` (:215).
 *   - videos × days must not exceed 50,000 in the traffic-source report (channel-reports.txt:1012-1016).
 *   - Channel totals by `subscribedStatus` with `estimatedMinutesWatched`: the playback-details report, where
 *     `subscribedStatus` is an optional dimension and `day`/`month` may be left out (channel-reports.txt:218-252).
 *   - Search, Suggested and Browse are `YT_SEARCH`, `RELATED_VIDEO` and `SUBSCRIBER` (yt-analytics-dimensions.txt:805,
 *     :793, :799 — SUBSCRIBER is "feeds on the YouTube homepage or ... subscription features", which is Browse).
 *   - Endpoint `GET https://youtubeanalytics.googleapis.com/v2/reports` (the API's discovery document, revision 20260923).
 */

export const ANALYTICS_REPORTS_URL = "https://youtubeanalytics.googleapis.com/v2/reports";

/** Search, Suggested, Browse — the stranger sources K0 counts (experiments.ts `medianStrangerViews`). */
export const STRANGER_TRAFFIC_SOURCES = ["YT_SEARCH", "RELATED_VIDEO", "SUBSCRIBER"] as const;

export type ViewMetric = "views" | "engagedViews";

/**
 * Which view count K0 reads. RED-TEAM §2.4: "before the first upload, record which view metric the Analytics API
 * returns for long-form (first-frame vs engaged) and pin the threshold to that definition". The API offers both:
 * `engagedViews` is "viewed past the first frame, or the user clicks/taps to play" (yt-analytics-metrics.txt:200-202),
 * and since August 2026 a `view` is counted "the moment a video begins to play" (youtube-policy-changelog.txt:62).
 * The 35-view floor was measured under the older counting. Choosing is a pre-registration decision, so it waits for the
 * board: until it is pinned, K0 is unreadable (null), never zero. Both numbers are always recorded.
 */
export const PINNED_VIEW_METRIC: ViewMetric | null = null;

export const MAX_VIDEOS_PER_QUERY = 500;
export const MAX_VIDEO_DAYS = 50_000;
export const WATCH_WINDOW_DAYS = 28;

const DAY_MS = 86_400_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function daysInclusive(startDate: string, endDate: string): number {
  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) throw new TypeError(`dates must be YYYY-MM-DD: ${startDate}..${endDate}`);
  const days = (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / DAY_MS + 1;
  if (!(days >= 1)) throw new RangeError(`endDate ${endDate} is before startDate ${startDate}`);
  return days;
}

/** The date `days` before `iso` (UTC), as YYYY-MM-DD. */
export function isoDateMinus(iso: string, days: number): string {
  return new Date(Date.parse(iso) - days * DAY_MS).toISOString().slice(0, 10);
}

/** Per-video stranger traffic: one row per (video, source), unsubscribed viewers only. */
export function strangerTrafficQuery(videoIds: string[], startDate: string, endDate: string): URLSearchParams {
  if (videoIds.length === 0) throw new RangeError("no video ids");
  if (videoIds.length > MAX_VIDEOS_PER_QUERY) throw new RangeError(`${videoIds.length} ids; the API takes at most ${MAX_VIDEOS_PER_QUERY}`);
  if (videoIds.some((id) => !/^[A-Za-z0-9_-]{6,20}$/.test(id))) throw new TypeError("a video id has characters YouTube ids do not");
  const days = daysInclusive(startDate, endDate);
  if (videoIds.length * days > MAX_VIDEO_DAYS) {
    throw new RangeError(`${videoIds.length} videos × ${days} days exceeds the traffic-source report's ${MAX_VIDEO_DAYS}; split the range`);
  }
  return new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate,
    dimensions: "video,insightTrafficSourceType",
    metrics: "views,engagedViews,estimatedMinutesWatched",
    filters: `video==${videoIds.join(",")};subscribedStatus==UNSUBSCRIBED`,
  });
}

/** Channel watch time split by subscribed status, over exactly the trailing 28 days K3 reads. */
export function strangerWatchQuery(startDate: string, endDate: string): URLSearchParams {
  const days = daysInclusive(startDate, endDate);
  if (days !== WATCH_WINDOW_DAYS) throw new RangeError(`K3 reads ${WATCH_WINDOW_DAYS} days; got ${days}`);
  return new URLSearchParams({ ids: "channel==MINE", startDate, endDate, dimensions: "subscribedStatus", metrics: "estimatedMinutesWatched" });
}

// ── Reading a result table ───────────────────────────────────────────────────

export interface ResultTable {
  kind?: string;
  columnHeaders?: { name: string; columnType?: string; dataType?: string }[];
  rows?: (string | number)[][];
  errors?: unknown;
}

/** Rows as objects keyed by column name. Throws on an error response or a table missing a column the caller needs. */
export function tableRows(table: ResultTable, required: string[]): Record<string, string | number>[] {
  if (table.errors) throw new Error(`the Analytics API returned errors: ${JSON.stringify(table.errors).slice(0, 300)}`);
  const names = (table.columnHeaders ?? []).map((h) => h.name);
  const missing = required.filter((r) => !names.includes(r));
  if (missing.length) throw new Error(`result table lacks column(s) ${missing.join(", ")}; has ${names.join(", ") || "none"}`);
  // No `rows` is how the API reports no data in the range: a real zero for a query that succeeded.
  return (table.rows ?? []).map((row) => Object.fromEntries(names.map((n, i) => [n, row[i]!])));
}

const num = (v: string | number | undefined): number => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) throw new TypeError(`not a number in the result table: ${String(v)}`);
  return n;
};

// ── The readings ─────────────────────────────────────────────────────────────

export interface VideoRecord {
  id: string;
  /** Length of the uploaded video, from our own render (the manifest), in seconds. */
  durationSeconds: number;
}

export interface VideoStrangerReading {
  id: string;
  /** Unsubscribed views from Search + Suggested + Browse, under each definition. */
  views: number;
  engagedViews: number;
  minutes: number;
  search: { views: number; minutes: number };
}

export interface YoutubeReadings {
  viewMetric: ViewMetric | null;
  /** K0's input — null until the view metric is pinned, or when there are no videos. */
  medianStrangerViews: number | null;
  /** Both definitions, always, so the pin can be audited against the same data. */
  medianByMetric: Record<ViewMetric, number | null>;
  /** K3's input: unsubscribed watch hours over the trailing 28 days; null when the channel table was not read. */
  strangerWatchHours28d: number | null;
  /**
   * The Search-traffic diagnostic, DERIVED — not the API's `averageViewPercentage`, which the traffic-source report
   * does not offer: unsubscribed Search minutes × 60 over (Search views × video length), across the videos.
   * null when no Search view exists.
   */
  averageViewPercentage: number | null;
  perVideo: VideoStrangerReading[];
  notes: string[];
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export function computeYoutubeReadings(input: {
  videos: VideoRecord[];
  trafficTable: ResultTable;
  watchTable?: ResultTable | null;
  viewMetric?: ViewMetric | null;
}): YoutubeReadings {
  const viewMetric = input.viewMetric === undefined ? PINNED_VIEW_METRIC : input.viewMetric;
  const known = new Map(input.videos.map((v) => [v.id, v]));
  const per = new Map<string, VideoStrangerReading>(
    input.videos.map((v) => [v.id, { id: v.id, views: 0, engagedViews: 0, minutes: 0, search: { views: 0, minutes: 0 } }]),
  );
  const notes: string[] = [];
  const stranger = new Set<string>(STRANGER_TRAFFIC_SOURCES);

  for (const row of tableRows(input.trafficTable, ["video", "insightTrafficSourceType", "views", "engagedViews", "estimatedMinutesWatched"])) {
    const id = String(row.video);
    const reading = per.get(id);
    if (!reading) {
      notes.push(`row for ${id}, which is not in our video list — ignored`);
      continue;
    }
    const source = String(row.insightTrafficSourceType);
    if (!stranger.has(source)) continue;
    reading.views += num(row.views);
    reading.engagedViews += num(row.engagedViews);
    reading.minutes += num(row.estimatedMinutesWatched);
    if (source === "YT_SEARCH") {
      reading.search.views += num(row.views);
      reading.search.minutes += num(row.estimatedMinutesWatched);
    }
  }

  const perVideo = [...per.values()];
  const medianByMetric = {
    views: median(perVideo.map((v) => v.views)),
    engagedViews: median(perVideo.map((v) => v.engagedViews)),
  };
  if (viewMetric === null) notes.push("view metric not pinned (RED-TEAM §2.4): K0 is unreadable until it is; both medians are recorded");

  let searchSeconds = 0;
  let searchPlayableSeconds = 0;
  for (const v of perVideo) {
    searchSeconds += v.search.minutes * 60;
    searchPlayableSeconds += v.search.views * known.get(v.id)!.durationSeconds;
  }
  const averageViewPercentage = searchPlayableSeconds > 0 ? (searchSeconds / searchPlayableSeconds) * 100 : null;

  let strangerWatchHours28d: number | null = null;
  if (input.watchTable) {
    const rows = tableRows(input.watchTable, ["subscribedStatus", "estimatedMinutesWatched"]);
    const minutes = rows.filter((r) => String(r.subscribedStatus) === "UNSUBSCRIBED").reduce((n, r) => n + num(r.estimatedMinutesWatched), 0);
    strangerWatchHours28d = minutes / 60;
  }

  return {
    viewMetric,
    medianStrangerViews: viewMetric === null ? null : medianByMetric[viewMetric],
    medianByMetric,
    strangerWatchHours28d,
    averageViewPercentage,
    perVideo,
    notes,
  };
}
