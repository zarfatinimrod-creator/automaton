/**
 * Read back what YouTube says each uploaded video's audience is, and write it into the experiment's state
 * (research/channel-loop/RULING-2026-10-04-kids-youtube.md §6 rule 2, §10; fold action 7). The arithmetic and the
 * bookkeeping are src/revenue/youtube-madeforkids.ts; this file only reads the environment, calls the API and writes.
 *
 * NEEDS (none of it exists yet; it is made at Stage A, T1-PROTOCOL.md):
 *   YOUTUBE_DATA_API_KEY — a YouTube Data API key created in the analytics-only Google Cloud project on the brand
 *                          account (research/youtube-kids/ASSESSMENT.md:427-430). Kept as a secret by whoever runs this,
 *                          never hard-coded, never committed, never printed. Without it this script refuses to run
 *                          (exit 2) and asks nothing.
 *   <videos file>         — the line's uploads, [{ id, ... }], in upload order. faceless-youtube reads
 *                          state/colony/measurements/youtube-videos.json (the file scripts/youtube-analytics.ts reads);
 *                          kids-explainers reads state/colony/measurements/kids-explainers-videos.json. No file = nothing
 *                          uploaded = nothing to read (exit 0).
 * WRITES state/colony/measurements/<line>-madeforkids.json: one reading per upload (madeForKids "true"/"false"/null,
 * privacyStatus, readAt). A reading once taken is kept; only uploads without one are asked about. readbackOf() of that
 * file is ExperimentReadings.madeForKidsReadback.
 *
 * NO LIVE CALL BEFORE STAGE A. No workflow runs this script and no package script names it
 * (src/__tests__/revenue/youtube-madeforkids.test.ts asserts both); its tests use a fake fetch and fixtures. It talks to
 * www.googleapis.com only — never youtube.com, which is terms-barred (scripts/render-watch.mjs TERMS_BARRED).
 *
 * USAGE
 *   pnpm exec tsx scripts/youtube-madeforkids-readback.ts --line kids-explainers [--videos <path>] [--state <path>] [--now <iso>]
 * Exit 0 read (or nothing to read), 1 the API refused or answered badly (nothing written), 2 refused to run.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import {
  MAX_IDS_PER_CALL,
  READ_HOST,
  emptyState,
  idsToRead,
  isReadbackLine,
  mergeReadings,
  parseVideosList,
  readbackOf,
  videosListUrl,
  type MadeForKidsReading,
  type MadeForKidsState,
  type ReadbackLine,
} from "../src/revenue/youtube-madeforkids.js";

export const API_KEY_ENV = "YOUTUBE_DATA_API_KEY";
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MEASUREMENTS = "state/colony/measurements";

/** Where each line's uploads and readings live, repo-relative. */
export function defaultPaths(line: ReadbackLine): { videosPath: string; statePath: string } {
  return {
    videosPath: line === "faceless-youtube" ? `${MEASUREMENTS}/youtube-videos.json` : `${MEASUREMENTS}/${line}-videos.json`,
    statePath: `${MEASUREMENTS}/${line}-madeforkids.json`,
  };
}

type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<{ status: number; text: () => Promise<string> }>;

export interface ReadbackRun {
  env: Record<string, string | undefined>;
  fetchImpl: FetchLike;
  experiment: ReadbackLine;
  videosPath: string;
  statePath: string;
  now: string;
  log: (line: string) => void;
}

export async function runReadback(run: ReadbackRun): Promise<number> {
  const key = (run.env[API_KEY_ENV] ?? "").trim();
  if (!key) {
    run.log(`youtube-madeforkids: ${API_KEY_ENV} is not set — refusing to run. The key is made at Stage A (T1-PROTOCOL.md); nothing asked, nothing written.`);
    return 2;
  }
  if (!isReadbackLine(run.experiment)) {
    run.log(`youtube-madeforkids: "${String(run.experiment)}" is not a YouTube line (faceless-youtube, kids-explainers) — refusing to run.`);
    return 2;
  }
  const redact = (s: string) => s.split(key).join("[key]");
  if (!existsSync(run.videosPath)) {
    run.log(`youtube-madeforkids: ${run.videosPath} does not exist — nothing uploaded on ${run.experiment}, nothing to read.`);
    return 0;
  }
  const uploads = JSON.parse(readFileSync(run.videosPath, "utf8")) as { id: string }[];
  const state: MadeForKidsState = existsSync(run.statePath)
    ? (JSON.parse(readFileSync(run.statePath, "utf8")) as MadeForKidsState)
    : emptyState(run.experiment);
  const ids = idsToRead(state, uploads);
  if (ids.length === 0) {
    run.log(`youtube-madeforkids: every upload on ${run.experiment} has a reading; nothing asked.`);
    return 0;
  }

  const fresh: MadeForKidsReading[] = [];
  for (let i = 0; i < ids.length; i += MAX_IDS_PER_CALL) {
    const batch = ids.slice(i, i + MAX_IDS_PER_CALL);
    const url = videosListUrl(batch, key);
    if (new URL(url).hostname !== READ_HOST) throw new Error(`refusing a request to ${new URL(url).hostname}`);
    try {
      const res = await run.fetchImpl(url, { signal: AbortSignal.timeout(30_000) });
      const text = await res.text();
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* keep the text: parseVideosList refuses it */
      }
      if (res.status !== 200) {
        const msg = (body as { error?: { message?: string } })?.error?.message ?? String(text).slice(0, 200);
        run.log(redact(`youtube-madeforkids: videos.list answered HTTP ${res.status}: ${msg} — nothing written.`));
        return 1;
      }
      fresh.push(...parseVideosList(body, batch, run.now));
    } catch (error) {
      run.log(redact(`youtube-madeforkids: ${error instanceof Error ? error.message : String(error)} — nothing written.`));
      return 1;
    }
  }

  const next = mergeReadings(state, uploads, fresh, run.now);
  mkdirSync(dirname(run.statePath), { recursive: true });
  writeFileSync(run.statePath, JSON.stringify(next, null, 2) + "\n");
  const rb = readbackOf(next);
  run.log(
    `youtube-madeforkids: ${run.experiment} (declares made for kids: ${next.declaresMadeForKids}): asked ${ids.length}, ` +
      `read-back ${rb.map((v) => v ?? "unread").join(", ")}; wrote ${run.statePath}`,
  );
  return 0;
}

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: { line: { type: "string" }, videos: { type: "string" }, state: { type: "string" }, now: { type: "string" } },
  });
  const line = values.line;
  if (!isReadbackLine(line)) {
    console.error("usage: tsx scripts/youtube-madeforkids-readback.ts --line faceless-youtube|kids-explainers [--videos p] [--state p] [--now iso]");
    return 2;
  }
  const paths = defaultPaths(line);
  return runReadback({
    env: process.env,
    fetchImpl: (url, init) => fetch(url, init),
    experiment: line,
    videosPath: resolve(REPO_ROOT, values.videos ?? paths.videosPath),
    statePath: resolve(REPO_ROOT, values.state ?? paths.statePath),
    now: values.now ?? new Date().toISOString(),
    log: (s) => console.log(s),
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then(
    (code) => process.exit(code),
    (error) => {
      console.error(`youtube-madeforkids: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    },
  );
}
