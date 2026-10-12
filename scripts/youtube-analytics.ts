/**
 * Read the faceless-YouTube experiment's K0/K3 inputs from the YouTube Analytics API and write the readings to
 * OUTPUT_PATH, outside the repository (OUTPUT below). The arithmetic lives in `src/revenue/youtube-analytics.ts`.
 *
 * NEEDS, and none of it exists yet (T1-PROTOCOL.md, Stage A — not asked):
 *   YT_ANALYTICS_CLIENT_ID, YT_ANALYTICS_CLIENT_SECRET  — an analytics-only Google Cloud project on the brand account
 *   YT_ANALYTICS_REFRESH_TOKEN                           — one consent for `yt-analytics.readonly`, nothing else
 *   state/colony/measurements/youtube-videos.json        — our uploads: [{ id, durationSeconds, publishedAt }]
 * Without them it prints one notice and exits 0: a missing consent is not a broken build.
 *
 * NO CALL BEFORE THE API'S TERMS ALLOW ONE (research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md §3
 * decision 6). Checked first, before the consent and before the OpenID discovery fetch:
 * research/channel-loop/terms-verdicts.json must hold a googleapis.com entry whose verdict is active-eligible, judged by
 * the made-for-kids read-back's own apiTermsGate over its own readTermsVerdicts (scripts/youtube-madeforkids-readback.ts),
 * because the same entry covers this reader's API host. Anything else, a missing or unreadable file included, is a
 * refusal: exit 2, nothing fetched, nothing written. The discovery document's host, accounts.google.com, is not ruled;
 * the gate keeps it from being fetched meanwhile. No workflow runs this script, sets its consent or names it in a package
 * script (src/__tests__/revenue/youtube-analytics.test.ts asserts all three); its tests use a fake fetch.
 *
 * OUTPUT (§3 decision 4). What the consent returns is Authorized Data, and the readings are figures computed from it: they
 * may reach the authorizing user and their agent, never the public. So the output is never written under state/colony/
 * (colony.yml force-adds that whole directory to a public repository) nor anywhere in a checkout: OUTPUT_PATH is
 * ~/.local/state/mehudak/youtube-analytics.json, outside every clone, where no workflow's `git add` reaches it. It holds
 * { measuredAt, window, readings } only. The Analytics API's own response tables, once written beside them as `raw`, are
 * never written, until the privacy-and-terms build names a store only the owner and the colony can read.
 *
 * REVOCATION (§3 decision 5). The token is refreshed on every run, and that refresh is the authorization check. When it is
 * answered `invalid_grant` the authorization is gone and the user's API Data goes with it: the script deletes OUTPUT_PATH
 * before it throws, and the thrown message says so (or that there was none, or that it could not be deleted).
 *
 * ONE STAGE-A REQUIREMENT THIS SCRIPT CANNOT FIX: the OAuth consent screen must be published ("In production"), not
 * left in "Testing". A Testing project "is issued a refresh token expiring in 7 days" (research/rendered/google-oauth2.txt
 * :542-544), which would stop this reader in its second week and fire `K0-unmeasured` by default.
 *
 * The token endpoint is read from Google's own OpenID discovery document rather than typed here.
 *
 * USAGE
 *   pnpm exec tsx scripts/youtube-analytics.ts [--now 2026-12-28T06:00:00Z] [--lag-days 3]
 * Exit 0 read (or nothing to read), 1 a call failed (nothing written; on invalid_grant the output deleted), 2 refused.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import {
  ANALYTICS_REPORTS_URL,
  WATCH_WINDOW_DAYS,
  computeYoutubeReadings,
  isoDateMinus,
  strangerTrafficQuery,
  strangerWatchQuery,
  type ResultTable,
  type VideoRecord,
} from "../src/revenue/youtube-analytics.js";
import { API_TERMS_SITE, TERMS_VERDICTS, apiTermsGate, readTermsVerdicts } from "./youtube-madeforkids-readback.js";

const OPENID_DISCOVERY = "https://accounts.google.com/.well-known/openid-configuration";
const MEASUREMENTS = join("state", "colony", "measurements");
/** Where the readings are written: outside every checkout, never under state/colony/ (ruling 12.10 row 28 §3 decision 4). */
export const OUTPUT_PATH = join(homedir(), ".local", "state", "mehudak", "youtube-analytics.json");
const CONSENT_ENV = ["YT_ANALYTICS_CLIENT_ID", "YT_ANALYTICS_CLIENT_SECRET", "YT_ANALYTICS_REFRESH_TOKEN"] as const;

type FetchInit = { method?: string; headers?: Record<string, string>; body?: URLSearchParams; signal?: AbortSignal };
type FetchLike = (url: string, init?: FetchInit) => Promise<{ status: number; text: () => Promise<string> }>;
type Env = Record<string, string | undefined>;

export interface AnalyticsRun {
  env: Env;
  fetchImpl: FetchLike;
  /** Our uploads, [{ id, durationSeconds, publishedAt }]. */
  videosPath: string;
  /** OUTPUT_PATH in a real run (cliRun gives it and no other). */
  outputPath: string;
  /** research/channel-loop/terms-verdicts.json in a real run (cliRun gives it and no other). */
  verdictsPath: string;
  now: string;
  lagDays: number;
  log: (line: string) => void;
}

async function getJson(fetchImpl: FetchLike, url: string, init?: FetchInit): Promise<{ status: number; body: unknown }> {
  const res = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(30_000) });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep the text */
  }
  return { status: res.status, body };
}

/** Deletes the analytics output once the authorization is gone (§3 decision 5), and says what became of it. */
function deleteOutput(path: string): string {
  if (!existsSync(path)) return `there was no analytics output at ${path} to delete`;
  try {
    rmSync(path);
    return `the analytics output ${path} was deleted`;
  } catch (error) {
    return `the analytics output ${path} could NOT be deleted (${error instanceof Error ? error.message : String(error)}): delete it by hand`;
  }
}

async function accessToken(fetchImpl: FetchLike, env: Env, outputPath: string): Promise<string> {
  const discovery = await getJson(fetchImpl, OPENID_DISCOVERY);
  const endpoint = (discovery.body as { token_endpoint?: string })?.token_endpoint;
  if (discovery.status !== 200 || !endpoint) throw new Error(`OpenID discovery failed: HTTP ${discovery.status}`);
  const r = await getJson(fetchImpl, endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: env.YT_ANALYTICS_CLIENT_ID!,
      client_secret: env.YT_ANALYTICS_CLIENT_SECRET!,
      refresh_token: env.YT_ANALYTICS_REFRESH_TOKEN!,
    }),
  });
  const token = (r.body as { access_token?: string })?.access_token;
  if (r.status === 200 && token) return token;
  const error = (r.body as { error?: string })?.error ?? `HTTP ${r.status}`;
  if (error === "invalid_grant") {
    const deleted = deleteOutput(outputPath);
    throw new Error(
      `token refresh failed: invalid_grant. The authorization behind the analytics output is gone, so ${deleted} ` +
        `(ruling 12.10 row 28 §3 decision 5). The refresh token was revoked or expired. If this is about a week after the ` +
        `consent, the OAuth app was left in Testing (google-oauth2.txt:542-544): publish it and consent once more.`,
    );
  }
  throw new Error(`token refresh failed: ${error}.`);
}

async function report(fetchImpl: FetchLike, token: string, query: URLSearchParams): Promise<ResultTable> {
  const r = await getJson(fetchImpl, `${ANALYTICS_REPORTS_URL}?${query}`, { headers: { authorization: `Bearer ${token}` } });
  if (r.status !== 200) throw new Error(`Analytics report failed: HTTP ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);
  return r.body as ResultTable;
}

export async function runAnalytics(run: AnalyticsRun): Promise<number> {
  const terms = apiTermsGate(readTermsVerdicts(run.verdictsPath));
  if (!terms.ok) {
    run.log(
      `youtube-analytics: ${terms.why} in ${run.verdictsPath} — refusing to run. No call is made, the OpenID discovery ` +
        `document included, until ${API_TERMS_SITE}'s verdict there is active-eligible (ruling 12.10 row 28 §3 decision 6); ` +
        `nothing fetched, nothing written.`,
    );
    return 2;
  }
  const missing = CONSENT_ENV.filter((k) => !run.env[k]);
  if (missing.length) {
    run.log(`youtube-analytics: ${missing.join(", ")} not set — Stage A has not happened (T1-PROTOCOL.md). Nothing written.`);
    return 0;
  }
  if (!existsSync(run.videosPath)) {
    run.log(`youtube-analytics: ${run.videosPath} does not exist — nothing has been uploaded. Nothing written.`);
    return 0;
  }
  const videos = JSON.parse(readFileSync(run.videosPath, "utf8")) as (VideoRecord & { publishedAt: string })[];
  if (videos.length === 0) {
    run.log("youtube-analytics: the video list is empty. Nothing written.");
    return 0;
  }

  // Our choice, not a documented figure: read up to a few days back so the latest days are not partial.
  const endDate = isoDateMinus(run.now, run.lagDays);
  const startDate = videos.map((v) => v.publishedAt.slice(0, 10)).sort()[0]!;

  const token = await accessToken(run.fetchImpl, run.env, run.outputPath);
  const trafficTable = await report(run.fetchImpl, token, strangerTrafficQuery(videos.map((v) => v.id), startDate, endDate));
  const watchStart = isoDateMinus(`${endDate}T00:00:00Z`, WATCH_WINDOW_DAYS - 1);
  const watchTable = await report(run.fetchImpl, token, strangerWatchQuery(watchStart, endDate));
  const readings = computeYoutubeReadings({ videos, trafficTable, watchTable });

  mkdirSync(dirname(run.outputPath), { recursive: true });
  // §3 decision 4: the readings only — the API's own tables are not written while no private store is named.
  writeFileSync(run.outputPath, JSON.stringify({ measuredAt: run.now, window: { startDate, endDate, watchStart }, readings }, null, 2) + "\n");
  run.log(
    `youtube-analytics: ${videos.length} video(s); median stranger views ${readings.medianStrangerViews ?? "unpinned"} ` +
      `(views ${readings.medianByMetric.views}, engaged ${readings.medianByMetric.engagedViews}); ` +
      `stranger watch hours/28d ${readings.strangerWatchHours28d?.toFixed(1)}; wrote ${run.outputPath}`,
  );
  return 0;
}

/** The run main() makes: the committed verdicts, the uploads file and OUTPUT_PATH, and no other. */
export function cliRun(args: string[], env: Env): AnalyticsRun {
  const { values } = parseArgs({ args, options: { now: { type: "string" }, "lag-days": { type: "string", default: "3" } } });
  return {
    env,
    fetchImpl: (url, init) => fetch(url, init),
    videosPath: join(MEASUREMENTS, "youtube-videos.json"),
    outputPath: OUTPUT_PATH,
    verdictsPath: TERMS_VERDICTS,
    now: values.now ?? new Date().toISOString(),
    lagDays: Number(values["lag-days"]),
    log: (s) => console.log(s),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runAnalytics(cliRun(process.argv.slice(2), process.env)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(`youtube-analytics: ${error instanceof Error ? error.message : String(error)} — nothing written.`);
      process.exit(1);
    },
  );
}
