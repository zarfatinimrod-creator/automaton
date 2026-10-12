import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ANALYTICS_REPORTS_URL,
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
import { OUTPUT_PATH, cliRun, outputPathRefusal, runAnalytics, type AnalyticsRun } from "../../../scripts/youtube-analytics.js";
import { TERMS_VERDICTS, apiTermsGate, readTermsVerdicts } from "../../../scripts/youtube-madeforkids-readback.js";

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

/**
 * The reader script, scripts/youtube-analytics.ts (ruling 12.10 row 28, research/channel-loop/
 * RULING-2026-10-12-youtube-derived-metrics.md §3 decisions 4-6, folds 5 and 6). What it reads is Authorized Data: its
 * output never reaches the public repository (never under state/colony/, which colony.yml force-adds), it never writes the
 * Analytics API's own tables (`raw`) while no private store is named, it asks nothing until googleapis.com's terms verdict
 * is active-eligible (the read-back's own gate), and on `invalid_grant` it deletes what it wrote before it throws. Every
 * test here is offline: the fetch is a fake, and the one run of the real script is made with the consent unset.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = readFileSync(resolve(ROOT, "scripts/youtube-analytics.ts"), "utf8");
const OPENID = "https://accounts.google.com/.well-known/openid-configuration";
const TOKEN_ENDPOINT = "https://token.endpoint.invalid/token";
const CONSENT = { YT_ANALYTICS_CLIENT_ID: "fake-client", YT_ANALYTICS_CLIENT_SECRET: "fake-secret", YT_ANALYTICS_REFRESH_TOKEN: "fake-refresh" };
const UPLOADS = [
  { id: "vidAAAAAAAA", durationSeconds: 600, publishedAt: "2026-11-01T10:00:00Z" },
  { id: "vidBBBBBBBB", durationSeconds: 300, publishedAt: "2026-11-08T10:00:00Z" },
  { id: "vidCCCCCCCC", durationSeconds: 480, publishedAt: "2026-11-15T10:00:00Z" },
];
const TRAFFIC = traffic([
  ["vidAAAAAAAA", "YT_SEARCH", 40, 30, 120],
  ["vidAAAAAAAA", "RELATED_VIDEO", 10, 8, 20],
  ["vidBBBBBBBB", "SUBSCRIBER", 6, 5, 9],
]);
const WATCH: ResultTable = {
  columnHeaders: [{ name: "subscribedStatus" }, { name: "estimatedMinutesWatched" }],
  rows: [
    ["SUBSCRIBED", 600],
    ["UNSUBSCRIBED", 18_420],
  ],
};

function analyticsVerdicts(verdict: string | null) {
  const sites: Record<string, unknown> = { "github.com": { verdict: "NOT_BARRED", source: "fixture", checked: "2026-10-07", copying: "unread" } };
  if (verdict !== null) sites["googleapis.com"] = { verdict, source: "fixture", checked: "2026-10-07", copying: "barred" };
  return { _about: "test fixture", sites };
}

type Answer = { status: number; body: unknown };

/** Every scratch directory setup() makes, removed after each test (some hold a written output with fake readings). */
const scratchDirs: string[] = [];
afterEach(() => {
  for (const dir of scratchDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A scratch run of runAnalytics: its own uploads, verdicts and output path, and a fake fetch that records every URL. */
function setup(opts: { verdicts?: string | null; verdictsPath?: string; uploads?: unknown[] | null; token?: Answer; outputPath?: string } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "yt-analytics-"));
  scratchDirs.push(dir);
  const videosPath = join(dir, "youtube-videos.json");
  const outputPath = opts.outputPath ?? join(dir, "private", "youtube-analytics.json");
  const verdictsPath = opts.verdictsPath ?? join(dir, "terms-verdicts.json");
  const uploads = opts.uploads === undefined ? UPLOADS : opts.uploads;
  if (uploads !== null) writeFileSync(videosPath, JSON.stringify(uploads));
  const verdicts = opts.verdicts === undefined ? JSON.stringify(analyticsVerdicts("NOT_BARRED")) : opts.verdicts;
  if (!opts.verdictsPath && verdicts !== null) writeFileSync(verdictsPath, verdicts);
  const token = opts.token ?? { status: 200, body: { access_token: "fake-access-token", expires_in: 3599 } };
  const lines: string[] = [];
  const calls: string[] = [];
  const fetchImpl: AnalyticsRun["fetchImpl"] = async (url) => {
    calls.push(url);
    let answer: Answer = { status: 500, body: "unexpected request" };
    if (url === OPENID) answer = { status: 200, body: { token_endpoint: TOKEN_ENDPOINT } };
    else if (url === TOKEN_ENDPOINT) answer = token;
    else if (url.startsWith(`${ANALYTICS_REPORTS_URL}?`)) {
      const dims = new URL(url).searchParams.get("dimensions");
      answer = { status: 200, body: dims === "subscribedStatus" ? WATCH : TRAFFIC };
    }
    return { status: answer.status, text: async () => JSON.stringify(answer.body) };
  };
  const run = (env: Record<string, string | undefined> = CONSENT) =>
    runAnalytics({ env, fetchImpl, videosPath, outputPath, verdictsPath, now: "2026-12-28T06:00:00Z", lagDays: 3, log: (s) => lines.push(s) });
  const failure = async (env?: Record<string, string | undefined>): Promise<Error> => {
    const got = await run(env).then(
      (code) => new Error(`resolved with exit ${code}`),
      (error: unknown) => (error instanceof Error ? error : new Error(String(error))),
    );
    return got;
  };
  return { dir, videosPath, outputPath, verdictsPath, lines, calls, run, failure };
}

describe("scripts/youtube-analytics.ts: no live call before Stage A (ruling 12.10 row 28 §3 decision 6)", () => {
  it("no workflow runs the reader or sets its consent, and no package script runs it", () => {
    const dir = resolve(ROOT, ".github/workflows");
    const workflows = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
    expect(workflows.length).toBeGreaterThan(5);
    for (const f of workflows) {
      const text = readFileSync(join(dir, f), "utf8");
      expect(text, f).not.toMatch(/youtube-analytics/);
      expect(text, f).not.toMatch(/YT_ANALYTICS_/);
    }
    expect(readFileSync(resolve(ROOT, "package.json"), "utf8")).not.toMatch(/youtube-analytics/);
  });

  it("refuses under the committed verdicts: googleapis.com is not active-eligible, so nothing is fetched and nothing written", async () => {
    const committed = apiTermsGate(readTermsVerdicts(TERMS_VERDICTS));
    expect(readTermsVerdicts(TERMS_VERDICTS)).not.toBeNull();
    expect(committed.ok).toBe(false);
    const s = setup({ verdictsPath: TERMS_VERDICTS });
    expect(await s.run()).toBe(2);
    expect(s.calls).toEqual([]);
    expect(existsSync(s.outputPath)).toBe(false);
    const said = s.lines.join("\n");
    expect(said).toContain(`youtube-analytics: ${committed.why} in ${TERMS_VERDICTS} — refusing to run.`);
    expect(said).toContain("the OpenID discovery document included");
    expect(said).toContain("ruling 12.10 row 28 §3 decision 6");
    expect(said).toContain("nothing fetched, nothing written.");
  });

  it("the script as committed refuses (exit 2) with the consent unset: the gate is checked before the consent", () => {
    // The consent is stripped from the environment, so even a script whose gate were broken would stop at the consent
    // check (exit 0) before any fetch: this run can never make a live call.
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("YT_ANALYTICS_")));
    const r = spawnSync(process.execPath, ["--import", "tsx", "scripts/youtube-analytics.ts"], { cwd: ROOT, encoding: "utf8", env });
    expect(r.status, `${r.stdout}${r.stderr}`).toBe(2);
    expect(r.stdout).toMatch(/googleapis\.com/);
    expect(r.stdout).toMatch(/refusing to run/);
    expect(r.stdout).not.toMatch(/not set/);
  });

  it("refuses under every verdict that is not active, and on a missing or unreadable verdicts file, before the consent", async () => {
    const cases: [string, string | null][] = [
      ...["CONDITIONAL_UNMET", "BARRED", "TERMS_PENDING", "NO_TERMS", "NO_TERMS_ROBOTS_OK"].map((v): [string, string] => [v, JSON.stringify(analyticsVerdicts(v))]),
      ["no googleapis.com entry", JSON.stringify(analyticsVerdicts(null))],
      ["no file", null],
      ["not JSON", "{ not json"],
      ["null", "null"],
    ];
    for (const [name, verdicts] of cases) {
      for (const env of [CONSENT, {}]) {
        const s = setup({ verdicts });
        expect(await s.run(env), name).toBe(2);
        expect(s.calls, name).toEqual([]);
        expect(existsSync(s.outputPath), name).toBe(false);
        expect(s.lines.join("\n"), name).toMatch(/refusing to run/);
        expect(s.lines.join("\n"), name).not.toMatch(/not set/);
      }
    }
  });

  it("with googleapis.com active-eligible the consent check applies next, and with the consent it reads", async () => {
    for (const verdict of ["NOT_BARRED", "CONDITIONAL_MET"]) {
      const s = setup({ verdicts: JSON.stringify(analyticsVerdicts(verdict)) });
      expect(await s.run({}), verdict).toBe(0);
      expect(s.calls, verdict).toEqual([]);
      expect(s.lines.join("\n"), verdict).toMatch(/YT_ANALYTICS_CLIENT_ID, YT_ANALYTICS_CLIENT_SECRET, YT_ANALYTICS_REFRESH_TOKEN not set/);
      expect(existsSync(s.outputPath), verdict).toBe(false);
      expect(await s.run(), verdict).toBe(0);
      expect(s.calls[0], verdict).toBe(OPENID);
      expect(s.calls[1], verdict).toBe(TOKEN_ENDPOINT);
      expect(s.calls.slice(2).every((u) => u.startsWith(`${ANALYTICS_REPORTS_URL}?`)), verdict).toBe(true);
      expect(s.calls, verdict).toHaveLength(4);
      expect(existsSync(s.outputPath), verdict).toBe(true);
    }
  });

  it("uses the read-back's own gate and verdicts reader, not a copy", () => {
    expect(SCRIPT).toMatch(/import \{[^}]*\bapiTermsGate\b[^}]*\} from "\.\/youtube-madeforkids-readback\.js"/);
    expect(SCRIPT).toMatch(/import \{[^}]*\breadTermsVerdicts\b[^}]*\} from "\.\/youtube-madeforkids-readback\.js"/);
    expect(SCRIPT).not.toMatch(/function apiTermsGate|function readTermsVerdicts/);
  });

  it("main() runs against the committed verdicts, the uploads file and OUTPUT_PATH, and no other", () => {
    const run = cliRun([], {});
    expect(run.verdictsPath).toBe(TERMS_VERDICTS);
    expect(run.outputPath).toBe(OUTPUT_PATH);
    expect(run.videosPath.split(sep).join("/")).toBe("state/colony/measurements/youtube-videos.json");
    expect(run.lagDays).toBe(3);
    const at = cliRun(["--now", "2026-12-28T06:00:00Z", "--lag-days", "5"], {});
    expect(at.now).toBe("2026-12-28T06:00:00Z");
    expect(at.lagDays).toBe(5);
  });
});

describe("scripts/youtube-analytics.ts: its output never reaches the public repository (ruling 12.10 row 28 §3 decision 4)", () => {
  it("OUTPUT_PATH is outside the checkout, so never under state/colony/, which colony.yml force-adds", () => {
    expect(readFileSync(resolve(ROOT, ".github/workflows/colony.yml"), "utf8")).toContain("git add -f state/colony");
    expect(isAbsolute(OUTPUT_PATH)).toBe(true);
    const fromRoot = relative(ROOT, OUTPUT_PATH);
    expect(fromRoot.startsWith(".."), fromRoot).toBe(true);
    expect(OUTPUT_PATH.split(sep).join("/")).not.toMatch(/state\/colony/);
    expect(OUTPUT_PATH.endsWith(join("mehudak", "youtube-analytics.json"))).toBe(true);
    // The old in-tree path is gone from the code.
    expect(SCRIPT).not.toMatch(/"state", "colony", "measurements", "youtube-analytics\.json"/);
    expect(SCRIPT).not.toMatch(/state\/colony\/measurements\/youtube-analytics\.json/);
  });

  it("writes the readings only: the written JSON has no `raw` key and none of the API's tables (no private store is named yet)", async () => {
    const s = setup();
    expect(await s.run()).toBe(0);
    const text = readFileSync(s.outputPath, "utf8");
    const written = JSON.parse(text) as Record<string, unknown>;
    expect(Object.keys(written)).toEqual(["measuredAt", "window", "readings"]);
    expect(written).not.toHaveProperty("raw");
    expect(text).not.toContain('"raw"');
    expect(text).not.toContain("columnHeaders");
    expect(written.measuredAt).toBe("2026-12-28T06:00:00Z");
    expect(written.window).toEqual({ startDate: "2026-11-01", endDate: "2026-12-25", watchStart: "2026-11-28" });
    const readings = written.readings as { medianStrangerViews: number; strangerWatchHours28d: number };
    expect(readings.medianStrangerViews).toBe(5);
    expect(readings.strangerWatchHours28d).toBe(307);
    expect(s.lines.join("\n")).toContain(`wrote ${s.outputPath}`);
  });

  it("its header names the gate and the output rule", () => {
    const header = SCRIPT.slice(0, SCRIPT.indexOf("*/"));
    expect(header).toMatch(/apiTermsGate/);
    expect(header).toMatch(/readTermsVerdicts/);
    expect(header).toMatch(/terms-verdicts\.json/);
    expect(header).toMatch(/googleapis\.com/);
    expect(header).toMatch(/exit 2, nothing fetched/);
    expect(header).toMatch(/RULING-2026-10-12-youtube-derived-metrics\.md/);
    expect(header).toMatch(/never written under state\/colony\//);
    expect(header).toMatch(/OUTPUT_PATH/);
    expect(header).toMatch(/`raw`/);
    expect(header).toMatch(/invalid_grant/);
    // The review of tick 75: OUTPUT_PATH follows HOME, so the header says so and names the guard that covers it.
    expect(header).toMatch(/HOME is the one thing that moves it/);
    expect(header).toMatch(/outputPathRefusal/);
    expect(header).toMatch(/inside this checkout or under any state\/colony\/ directory/);
  });

  it("refuses an output path inside the checkout — the one HOME pointed at state/colony/ gives — before any fetch or write", async () => {
    // The reviewer's construction: HOME=<checkout>/state/colony makes OUTPUT_PATH this path, which `git add -f state/colony`
    // (colony.yml) stages. Under an active verdict and with the consent, the run must still refuse.
    const leakRoot = join(ROOT, "state", "colony", ".local");
    const leakRootExisted = existsSync(leakRoot);
    const outputPath = join(leakRoot, "state", "mehudak", "youtube-analytics.json");
    try {
      const s = setup({ outputPath });
      expect(await s.run()).toBe(2);
      expect(s.calls).toEqual([]);
      expect(existsSync(outputPath)).toBe(false);
      const said = s.lines.join("\n");
      expect(said).toContain(`youtube-analytics: the output path ${outputPath} is inside this checkout (${ROOT})`);
      expect(said).toContain("refusing to run");
      expect(said).toContain("ruling 12.10 row 28 §3 decision 4");
      expect(said).toContain("HOME");
      expect(said).toContain("nothing fetched, nothing written.");
      // Without the consent it refuses too: a wrong output path is a refusal, not a run with nothing to read.
      expect(await s.run({})).toBe(2);
      expect(s.calls).toEqual([]);
    } finally {
      // Only on a broken guard would the run have written here; never remove what was there before the test.
      if (!leakRootExisted) rmSync(leakRoot, { recursive: true, force: true });
    }
  });

  it("refuses an output path under any state/colony/ directory, in this checkout or not", async () => {
    const elsewhere = mkdtempSync(join(tmpdir(), "yt-analytics-"));
    scratchDirs.push(elsewhere);
    const outputPath = join(elsewhere, "clone", "state", "colony", "measurements", "youtube-analytics.json");
    const s = setup({ outputPath });
    expect(await s.run()).toBe(2);
    expect(s.calls).toEqual([]);
    expect(existsSync(outputPath)).toBe(false);
    expect(s.lines.join("\n")).toContain(`youtube-analytics: the output path ${outputPath} is under a state/colony/ directory`);
  });

  it("outputPathRefusal: inside the checkout or under state/colony/ refused; outside both, and OUTPUT_PATH itself, allowed", () => {
    // HOME pointed at the checkout's root: OUTPUT_PATH lands in it, with no state/colony segment.
    expect(outputPathRefusal(join(ROOT, ".local", "state", "mehudak", "youtube-analytics.json"))).toMatch(/inside this checkout/);
    expect(outputPathRefusal(ROOT)).toMatch(/inside this checkout/);
    expect(outputPathRefusal(join(ROOT, "..dotted", "youtube-analytics.json"))).toMatch(/inside this checkout/);
    expect(outputPathRefusal(join("state", "colony", "measurements", "youtube-analytics.json"))).not.toBeNull(); // the old path
    expect(outputPathRefusal(join(tmpdir(), "x", "state", "colony", "out.json"))).toMatch(/under a state\/colony\/ directory/);
    // A sibling whose name only starts with the checkout's is outside it; "state" or "colony" alone is not the pair.
    expect(outputPathRefusal(`${ROOT}-sibling${sep}out.json`)).toBeNull();
    expect(outputPathRefusal(join(tmpdir(), "x", "colony", "state", "out.json"))).toBeNull();
    expect(outputPathRefusal(join(tmpdir(), "x", "state", "colonyish", "out.json"))).toBeNull();
    expect(outputPathRefusal(join(tmpdir(), "x", "private", "youtube-analytics.json"))).toBeNull();
    // Under the HOME the tests run with (never inside a checkout), the real path is allowed.
    expect(relative(ROOT, OUTPUT_PATH).startsWith(`..${sep}`)).toBe(true);
    expect(outputPathRefusal(OUTPUT_PATH)).toBeNull();
  });
});

describe("scripts/youtube-analytics.ts: a revoked authorization deletes what it wrote (ruling 12.10 row 28 §3 decision 5)", () => {
  const INVALID_GRANT: Answer = { status: 400, body: { error: "invalid_grant", error_description: "Token has been expired or revoked." } };

  it("on invalid_grant it deletes the analytics output before it throws, and the thrown message says so", async () => {
    const s = setup({ token: INVALID_GRANT });
    mkdirSync(dirname(s.outputPath), { recursive: true });
    writeFileSync(s.outputPath, JSON.stringify({ measuredAt: "2026-12-21T06:00:00Z", window: {}, readings: {} }));
    const error = await s.failure();
    expect(existsSync(s.outputPath)).toBe(false);
    expect(error.message).toMatch(/^token refresh failed: invalid_grant\./);
    expect(error.message).toContain(`the analytics output ${s.outputPath} was deleted`);
    expect(error.message).toContain("ruling 12.10 row 28 §3 decision 5");
    expect(error.message).toMatch(/The refresh token was revoked or expired/);
    expect(s.calls).toEqual([OPENID, TOKEN_ENDPOINT]); // no report is asked
  });

  it("on invalid_grant with no output yet, the message says there was none to delete", async () => {
    const s = setup({ token: INVALID_GRANT });
    const error = await s.failure();
    expect(existsSync(s.outputPath)).toBe(false);
    expect(error.message).toContain(`there was no analytics output at ${s.outputPath} to delete`);
    expect(error.message).not.toContain("was deleted");
  });

  it("on invalid_grant, an output it cannot delete is named, never reported deleted", async () => {
    const s = setup({ token: INVALID_GRANT });
    mkdirSync(s.outputPath, { recursive: true }); // a directory: rmSync without recursive refuses it
    const error = await s.failure();
    expect(existsSync(s.outputPath)).toBe(true);
    expect(error.message).toContain(`the analytics output ${s.outputPath} could NOT be deleted`);
    expect(error.message).toContain("delete it by hand");
    expect(error.message).not.toContain("was deleted");
  });

  it("any other refresh failure leaves the output in place: only invalid_grant says the authorization is gone", async () => {
    for (const token of [
      { status: 401, body: { error: "invalid_client" } },
      { status: 503, body: "upstream unavailable" },
    ]) {
      const s = setup({ token });
      mkdirSync(dirname(s.outputPath), { recursive: true });
      writeFileSync(s.outputPath, "{}\n");
      const error = await s.failure();
      expect(existsSync(s.outputPath), JSON.stringify(token)).toBe(true);
      expect(error.message, JSON.stringify(token)).toMatch(/^token refresh failed: (invalid_client|HTTP 503)\.$/);
    }
  });
});
