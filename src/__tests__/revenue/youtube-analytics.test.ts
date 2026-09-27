import { describe, expect, it } from "vitest";
import {
  PINNED_VIEW_METRIC,
  STRANGER_TRAFFIC_SOURCES,
  computeYoutubeReadings,
  isoDateMinus,
  median,
  strangerTrafficQuery,
  strangerWatchQuery,
  tableRows,
  type ResultTable,
} from "../../revenue/youtube-analytics.js";

/**
 * The instrument K0 and K3 read (VERDICT §14.5, RED-TEAM §2.1). Query shapes are Google's own tables
 * (research/rendered/yt-analytics-*.txt, 27.9.2026); these tests pin them and the arithmetic, because a quietly wrong
 * reading would either kill the experiment or keep a dead one alive.
 */

const HEADERS = ["video", "insightTrafficSourceType", "views", "engagedViews", "estimatedMinutesWatched"].map((name) => ({ name }));
const traffic = (rows: (string | number)[][]): ResultTable => ({ kind: "youtubeAnalytics#resultTable", columnHeaders: HEADERS, rows });
const VIDEOS = [
  { id: "vidAAAAAAAA", durationSeconds: 600 },
  { id: "vidBBBBBBBB", durationSeconds: 300 },
  { id: "vidCCCCCCCC", durationSeconds: 480 },
];

describe("query shapes, from Google's tables", () => {
  it("asks for unsubscribed traffic per video and source, all videos in one filter", () => {
    const q = strangerTrafficQuery(["vidAAAAAAAA", "vidBBBBBBBB"], "2026-11-01", "2026-12-26");
    expect(Object.fromEntries(q)).toEqual({
      ids: "channel==MINE",
      startDate: "2026-11-01",
      endDate: "2026-12-26",
      dimensions: "video,insightTrafficSourceType",
      metrics: "views,engagedViews,estimatedMinutesWatched",
      filters: "video==vidAAAAAAAA,vidBBBBBBBB;subscribedStatus==UNSUBSCRIBED",
    });
  });

  it("refuses what the API would refuse: >500 ids, >50,000 video-days, a bad id, reversed dates", () => {
    const ids = (n: number) => Array.from({ length: n }, (_, i) => `v${String(i).padStart(10, "0")}`);
    expect(() => strangerTrafficQuery(ids(501), "2026-11-01", "2026-11-01")).toThrow(/500/);
    expect(() => strangerTrafficQuery(ids(500), "2026-01-01", "2026-04-11")).toThrow(/50000|50,000/); // 500 × 101
    expect(() => strangerTrafficQuery(["bad id!"], "2026-11-01", "2026-11-02")).toThrow(/characters/);
    expect(() => strangerTrafficQuery(["vidAAAAAAAA"], "2026-11-02", "2026-11-01")).toThrow(/before/);
  });

  it("reads K3 over exactly 28 days, split by subscribed status", () => {
    expect(Object.fromEntries(strangerWatchQuery("2026-12-01", "2026-12-28"))).toMatchObject({
      dimensions: "subscribedStatus",
      metrics: "estimatedMinutesWatched",
    });
    expect(() => strangerWatchQuery("2026-12-01", "2026-12-27")).toThrow(/28/);
    expect(isoDateMinus("2026-12-28T10:00:00Z", 27)).toBe("2026-12-01");
  });

  it("counts Search, Suggested and Browse as the stranger sources", () => {
    expect([...STRANGER_TRAFFIC_SOURCES]).toEqual(["YT_SEARCH", "RELATED_VIDEO", "SUBSCRIBER"]);
  });
});

describe("computeYoutubeReadings", () => {
  const table = traffic([
    ["vidAAAAAAAA", "YT_SEARCH", 40, 30, 120],
    ["vidAAAAAAAA", "RELATED_VIDEO", 10, 8, 20],
    ["vidAAAAAAAA", "EXT_URL", 500, 400, 900], // our own link-sharing is not a stranger source
    ["vidBBBBBBBB", "SUBSCRIBER", 6, 5, 9],
    // vidCCCCCCCC has no rows: the API omits zero rows, so it is a real 0 for a query that succeeded
  ]);

  it("takes the median of stranger views per video, under the pinned metric, and records both", () => {
    const r = computeYoutubeReadings({ videos: VIDEOS, trafficTable: table, viewMetric: "views" });
    expect(r.perVideo.map((v) => v.views)).toEqual([50, 6, 0]);
    expect(r.medianStrangerViews).toBe(6);
    expect(r.medianByMetric).toEqual({ views: 6, engagedViews: 5 });
    expect(computeYoutubeReadings({ videos: VIDEOS, trafficTable: table, viewMetric: "engagedViews" }).medianStrangerViews).toBe(5);
  });

  it("K0 reads engagedViews by default (PREREG-DECISIONS.md §1); an explicit null still leaves it unreadable", () => {
    expect(PINNED_VIEW_METRIC).toBe("engagedViews");
    const r = computeYoutubeReadings({ videos: VIDEOS, trafficTable: table });
    expect(r.viewMetric).toBe("engagedViews");
    expect(r.medianStrangerViews).toBe(5);
    expect(r.medianByMetric).toEqual({ views: 6, engagedViews: 5 });
    // The diagnostic's denominator follows the pin: 120 min × 60 over 30 engaged Search plays × 600 s = 40%.
    expect(r.averageViewPercentage).toBeCloseTo(40, 10);
    const unpinned = computeYoutubeReadings({ videos: VIDEOS, trafficTable: table, viewMetric: null });
    expect(unpinned.medianStrangerViews).toBeNull();
    expect(unpinned.medianByMetric.views).toBe(6);
    expect(unpinned.notes.join(" ")).toMatch(/not pinned/);
  });

  it("reads engaged views all zero beside real plays as an instrument fault — unmeasured, never a K0 FAIL", () => {
    const broken = traffic([
      ["vidAAAAAAAA", "YT_SEARCH", 40, 0, 120],
      ["vidBBBBBBBB", "SUBSCRIBER", 6, 0, 9],
    ]);
    const r = computeYoutubeReadings({ videos: VIDEOS, trafficTable: broken });
    expect(r.medianStrangerViews).toBeNull();
    expect(r.medianByMetric.engagedViews).toBe(0);
    expect(r.notes.join(" ")).toMatch(/instrument fault/);
    // A genuinely empty channel — no plays at all — is a real zero, not a fault.
    const empty = computeYoutubeReadings({ videos: VIDEOS, trafficTable: traffic([]) });
    expect(empty.medianStrangerViews).toBe(0);
  });

  it("derives the Search view percentage from minutes, views and our own video lengths", () => {
    const r = computeYoutubeReadings({ videos: VIDEOS, trafficTable: table, viewMetric: "views" });
    // Only vidA had Search: 120 min × 60 over 40 views × 600 s = 30%.
    expect(r.averageViewPercentage).toBeCloseTo(30, 10);
    const noSearch = computeYoutubeReadings({ videos: VIDEOS, trafficTable: traffic([["vidBBBBBBBB", "SUBSCRIBER", 6, 5, 9]]), viewMetric: "views" });
    expect(noSearch.averageViewPercentage).toBeNull();
  });

  it("reads K3 as unsubscribed minutes over 60, and null when the channel table was not read", () => {
    const watch: ResultTable = {
      columnHeaders: [{ name: "subscribedStatus" }, { name: "estimatedMinutesWatched" }],
      rows: [
        ["SUBSCRIBED", 600],
        ["UNSUBSCRIBED", 18_420],
      ],
    };
    expect(computeYoutubeReadings({ videos: VIDEOS, trafficTable: table, watchTable: watch, viewMetric: "views" }).strangerWatchHours28d).toBe(307);
    expect(computeYoutubeReadings({ videos: VIDEOS, trafficTable: table, viewMetric: "views" }).strangerWatchHours28d).toBeNull();
  });

  it("ignores rows for videos that are not ours, and says so", () => {
    const r = computeYoutubeReadings({ videos: VIDEOS, trafficTable: traffic([["someoneElse", "YT_SEARCH", 999, 999, 999]]), viewMetric: "views" });
    expect(r.perVideo.every((v) => v.views === 0)).toBe(true);
    expect(r.notes.join(" ")).toMatch(/not in our video list/);
  });
});

describe("tableRows", () => {
  it("throws on an error response and on a missing column, and treats no rows as no data", () => {
    expect(() => tableRows({ errors: { code: 403 } }, [])).toThrow(/errors/);
    expect(() => tableRows({ columnHeaders: [{ name: "views" }] }, ["video", "views"])).toThrow(/video/);
    expect(tableRows({ columnHeaders: [{ name: "views" }] }, ["views"])).toEqual([]);
  });

  it("median handles even and odd counts", () => {
    expect(median([])).toBeNull();
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});
