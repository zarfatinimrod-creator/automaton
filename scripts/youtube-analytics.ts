/**
 * Read the faceless-YouTube experiment's K0/K3 inputs from the YouTube Analytics API and write them to
 * `state/colony/measurements/youtube-analytics.json`. The arithmetic lives in `src/revenue/youtube-analytics.ts`.
 *
 * NEEDS, and none of it exists yet (T1-PROTOCOL.md, Stage A — not asked):
 *   YT_ANALYTICS_CLIENT_ID, YT_ANALYTICS_CLIENT_SECRET  — an analytics-only Google Cloud project on the brand account
 *   YT_ANALYTICS_REFRESH_TOKEN                           — one consent for `yt-analytics.readonly`, nothing else
 *   state/colony/measurements/youtube-videos.json        — our uploads: [{ id, durationSeconds, publishedAt }]
 * Without them it prints one notice and exits 0: a missing consent is not a broken build.
 *
 * ONE STAGE-A REQUIREMENT THIS SCRIPT CANNOT FIX: the OAuth consent screen must be published ("In production"), not
 * left in "Testing". A Testing project "is issued a refresh token expiring in 7 days" (research/rendered/google-oauth2.txt
 * :542-544), which would stop this reader in its second week and fire `K0-unmeasured` by default.
 *
 * The token endpoint is read from Google's own OpenID discovery document rather than typed here.
 *
 * USAGE
 *   pnpm exec tsx scripts/youtube-analytics.ts [--now 2026-12-28T06:00:00Z] [--lag-days 3]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
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

const OPENID_DISCOVERY = "https://accounts.google.com/.well-known/openid-configuration";
const MEASUREMENTS = join("state", "colony", "measurements");

async function getJson(url: string, init?: RequestInit): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(30_000) });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep the text */
  }
  return { status: res.status, body };
}

async function accessToken(env: NodeJS.ProcessEnv): Promise<string> {
  const discovery = await getJson(OPENID_DISCOVERY);
  const endpoint = (discovery.body as { token_endpoint?: string })?.token_endpoint;
  if (discovery.status !== 200 || !endpoint) throw new Error(`OpenID discovery failed: HTTP ${discovery.status}`);
  const r = await getJson(endpoint, {
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
  const hint =
    error === "invalid_grant"
      ? " The refresh token was revoked or expired. If this is about a week after the consent, the OAuth app was left in Testing (google-oauth2.txt:542-544): publish it and consent once more."
      : "";
  throw new Error(`token refresh failed: ${error}.${hint}`);
}

async function report(token: string, query: URLSearchParams): Promise<ResultTable> {
  const r = await getJson(`${ANALYTICS_REPORTS_URL}?${query}`, { headers: { authorization: `Bearer ${token}` } });
  if (r.status !== 200) throw new Error(`Analytics report failed: HTTP ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);
  return r.body as ResultTable;
}

async function main(): Promise<number> {
  const { values } = parseArgs({ options: { now: { type: "string" }, "lag-days": { type: "string", default: "3" } } });
  const env = process.env;
  const missing = ["YT_ANALYTICS_CLIENT_ID", "YT_ANALYTICS_CLIENT_SECRET", "YT_ANALYTICS_REFRESH_TOKEN"].filter((k) => !env[k]);
  if (missing.length) {
    console.log(`youtube-analytics: ${missing.join(", ")} not set — Stage A has not happened (T1-PROTOCOL.md). Nothing written.`);
    return 0;
  }
  const videosFile = join(MEASUREMENTS, "youtube-videos.json");
  if (!existsSync(videosFile)) {
    console.log(`youtube-analytics: ${videosFile} does not exist — nothing has been uploaded. Nothing written.`);
    return 0;
  }
  const videos = JSON.parse(readFileSync(videosFile, "utf8")) as (VideoRecord & { publishedAt: string })[];
  if (videos.length === 0) {
    console.log("youtube-analytics: the video list is empty. Nothing written.");
    return 0;
  }

  const nowIso = values.now ?? new Date().toISOString();
  // Our choice, not a documented figure: read up to a few days back so the latest days are not partial.
  const endDate = isoDateMinus(nowIso, Number(values["lag-days"]));
  const startDate = videos.map((v) => v.publishedAt.slice(0, 10)).sort()[0]!;

  const token = await accessToken(env);
  const trafficTable = await report(token, strangerTrafficQuery(videos.map((v) => v.id), startDate, endDate));
  const watchStart = isoDateMinus(`${endDate}T00:00:00Z`, WATCH_WINDOW_DAYS - 1);
  const watchTable = await report(token, strangerWatchQuery(watchStart, endDate));
  const readings = computeYoutubeReadings({ videos, trafficTable, watchTable });

  const out = join(MEASUREMENTS, "youtube-analytics.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    JSON.stringify({ measuredAt: nowIso, window: { startDate, endDate, watchStart }, readings, raw: { trafficTable, watchTable } }, null, 2) + "\n",
  );
  console.log(
    `youtube-analytics: ${videos.length} video(s); median stranger views ${readings.medianStrangerViews ?? "unpinned"} ` +
      `(views ${readings.medianByMetric.views}, engaged ${readings.medianByMetric.engagedViews}); ` +
      `stranger watch hours/28d ${readings.strangerWatchHours28d?.toFixed(1)}; wrote ${out}`,
  );
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(`youtube-analytics: ${error instanceof Error ? error.message : String(error)} — nothing written.`);
    process.exit(1);
  },
);
