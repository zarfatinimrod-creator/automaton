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
 * WRITES state/colony/measurements/<line>-madeforkids.json: one entry per upload. EVERY listed upload is asked about on
 * every run (an override YouTube sets after the first read must be seen; corrected 4.10). The file holds
 * no value the API returned — no madeForKids, no privacyStatus, in any field, for any time
 * (research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md §2): the API's answer lives in this process from
 * the fetch to the merge and dies with it. Per upload the entry keeps only the colony's own facts: when the first read
 * was taken, designated or not, whether it returned the video and P1's API half judged at it (firstReadAt,
 * firstReadReturned, p1Api; written once, ruling 7.10 row 24 amendment 1); when the first read that carried a designation
 * was taken (firstDesignationAt) and P2's clock start (p2ClockAt: that time when that read found the upload public); when
 * a read last found it public (lastPublicAt); and when a read first found a public upload no longer public (leftPublicAt)
 * or first contradicted the line's declaration (contradictedAt). assertColonyFactsOnly runs on the new state before the
 * write: a state that fails it is refused (exit 1) and nothing is written. The file is committed like the other colony
 * state, because it holds nothing of YouTube's (§2 decision 5). It prints, per upload, one word —
 * as-declared, contrary or unread — never a designation or a privacy status (§2 decision 4).
 * readbackOf(<that file>, <the uploads>) is ExperimentReadings.madeForKidsReadback.
 *
 * NO LIVE CALL BEFORE STAGE A, AND NONE BEFORE THE API'S TERMS ARE READ. Two gates, each a refusal (exit 2) with
 * nothing asked and nothing written, checked in this order: (1) research/channel-loop/terms-verdicts.json must hold a
 * googleapis.com entry whose verdict is in ACTIVE_VERDICTS as scripts/queue-zero-test.mjs defines it — the YouTube API
 * Services Terms read at github grade first, never by a fetch of developers.google.com
 * (research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md §2 decision 2); a missing or unreadable
 * file refuses too (fail closed); (2) YOUTUBE_DATA_API_KEY must be set. No workflow runs this script and no package
 * script names it (src/__tests__/revenue/youtube-madeforkids.test.ts asserts both); its tests use a fake fetch and
 * fixtures. It talks to www.googleapis.com only — never youtube.com, which is terms-barred (scripts/render-watch.mjs
 * TERMS_BARRED) — and follows no redirect (`redirect: "error"`, §2 decision 3(iii)): one to any host is refused and
 * logged, nothing written.
 *
 * USAGE
 *   pnpm exec tsx scripts/youtube-madeforkids-readback.ts --line kids-explainers [--videos <path>] [--state <path>] [--now <iso>]
 * --now is an ISO 8601 date-time with a zone (Z or ±hh:mm) on a real day; it is written in toISOString() form, the only
 * form the state's invariant takes, and anything else is refused (exit 2) before a call is made (runClock).
 * Exit 0 read (or nothing to read), 1 the API refused or answered badly (nothing written), 2 refused to run.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import {
  MAX_IDS_PER_CALL,
  READ_HOST,
  assertColonyFactsOnly,
  emptyState,
  isReadbackLine,
  mergeReadings,
  parseVideosList,
  readbackOf,
  videosListUrl,
  type MadeForKidsReading,
  type MadeForKidsState,
  type ReadbackLine,
} from "../src/revenue/youtube-madeforkids.js";
// @ts-expect-error — plain ESM script, no type declarations by design
import { ACTIVE_VERDICTS, isRobotsOkVerdict } from "./queue-zero-test.mjs";

export const API_KEY_ENV = "YOUTUBE_DATA_API_KEY";
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MEASUREMENTS = "state/colony/measurements";
/** The committed per-site terms verdicts; the read-back runs only under an active googleapis.com entry in it. */
export const TERMS_VERDICTS = resolve(REPO_ROOT, "research/channel-loop/terms-verdicts.json");
/** The site whose API terms gate every call (READ_HOST is www.googleapis.com). */
export const API_TERMS_SITE = "googleapis.com";
/**
 * The pinned excerpt of the YouTube API Services Terms, read at github grade on 7.10 (tick 61): its verdict section lists
 * the conditions that keep googleapis.com CONDITIONAL_UNMET, so the refusal points there.
 */
export const API_TERMS_EXCERPT = "research/channel-loop/terms/youtube-api-services-terms-2026-10-07.md";

/** research/channel-loop/terms-verdicts.json, or null when it is missing or cannot be read (as scripts/brand-check.mjs). */
export function readTermsVerdicts(path = TERMS_VERDICTS): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

/**
 * The terms gate (ruling 7.10 row 24 (b), decision 2): ok only when the verdicts hold a googleapis.com entry whose verdict
 * is one a line may be active under — ACTIVE_VERDICTS, with NO_TERMS_ROBOTS_OK counting only as isRobotsOkVerdict says,
 * as termsGate reads them (scripts/queue-zero-test.mjs). Anything else, unreadable verdicts included, refuses.
 */
export function apiTermsGate(verdicts: unknown): { ok: boolean; verdict: string | null; why: string } {
  if (!verdicts || typeof verdicts !== "object") return { ok: false, verdict: null, why: "the terms verdicts are missing or unreadable" };
  const sites = (verdicts as { sites?: unknown }).sites;
  const entry = sites && typeof sites === "object" && Object.hasOwn(sites, API_TERMS_SITE)
    ? (sites as Record<string, { verdict?: unknown } | null>)[API_TERMS_SITE]
    : undefined;
  const verdict = typeof entry?.verdict === "string" ? entry.verdict : null;
  const active: boolean = verdict === "NO_TERMS_ROBOTS_OK" ? isRobotsOkVerdict(entry) : ACTIVE_VERDICTS.has(verdict);
  if (active) return { ok: true, verdict, why: `${API_TERMS_SITE} is ${verdict}` };
  if (!entry) return { ok: false, verdict: null, why: `there is no ${API_TERMS_SITE} entry` };
  return { ok: false, verdict, why: `${API_TERMS_SITE} is ${verdict ?? "an entry with no verdict"}, not one a call may run under` };
}

/** Where each line's uploads and readings live, repo-relative. */
export function defaultPaths(line: ReadbackLine): { videosPath: string; statePath: string } {
  return {
    videosPath: line === "faceless-youtube" ? `${MEASUREMENTS}/youtube-videos.json` : `${MEASUREMENTS}/${line}-videos.json`,
    statePath: `${MEASUREMENTS}/${line}-madeforkids.json`,
  };
}

/** An ISO 8601 date-time in extended form with an explicit zone, Z or ±hh:mm; its seconds and their fraction optional. */
const ISO_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})$/;

/**
 * The run's clock as the state writes it: `now` in toISOString() form, the only form assertColonyFactsOnly takes for a
 * time (ruling 12.10 row 28 §2 decision 2), or null when `now` is not an ISO 8601 date-time with a zone on a real calendar
 * day. A value with no milliseconds, no seconds or an offset is normalised. Refused: a time with no zone (Date.parse would
 * read it in the machine's own zone), a bare date, any other text Date.parse would still read ("1" is 2001), and a day
 * the month does not have (Date.parse rolls 2027-02-30 into March). runReadback refuses a null before any call, so a
 * --now the state cannot hold never spends a read (the tick-73 review).
 */
export function runClock(now: string): string | null {
  const m = ISO_DATE_TIME.exec(now);
  if (!m) return null;
  const t = Date.parse(now);
  if (Number.isNaN(t) || new Date(Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!)).getUTCDate() !== +m[3]!) return null;
  return new Date(t).toISOString();
}

type FetchLike = (
  url: string,
  init?: { signal?: AbortSignal; redirect?: "error" },
) => Promise<{ status: number; text: () => Promise<string> }>;

export interface ReadbackRun {
  env: Record<string, string | undefined>;
  fetchImpl: FetchLike;
  experiment: ReadbackLine;
  videosPath: string;
  statePath: string;
  /** research/channel-loop/terms-verdicts.json in a real run (main() passes TERMS_VERDICTS and takes no other). */
  verdictsPath: string;
  /** The run's clock, an ISO 8601 date-time with a zone; runReadback normalises it with runClock or refuses it (exit 2). */
  now: string;
  log: (line: string) => void;
}

export async function runReadback(run: ReadbackRun): Promise<number> {
  const terms = apiTermsGate(readTermsVerdicts(run.verdictsPath));
  if (!terms.ok) {
    run.log(
      `youtube-madeforkids: ${terms.why} in ${run.verdictsPath} — refusing to run. No call is made until ${API_TERMS_SITE}'s ` +
        `verdict there is active-eligible (ruling 7.10 row 24 (b)); the conditions the 7.10 read found unmet are listed in ` +
        `${API_TERMS_EXCERPT}; nothing asked, nothing written.`,
    );
    return 2;
  }
  const key = (run.env[API_KEY_ENV] ?? "").trim();
  if (!key) {
    run.log(`youtube-madeforkids: ${API_KEY_ENV} is not set — refusing to run. The key is made at Stage A (T1-PROTOCOL.md); nothing asked, nothing written.`);
    return 2;
  }
  if (!isReadbackLine(run.experiment)) {
    run.log(`youtube-madeforkids: "${String(run.experiment)}" is not a YouTube line (faceless-youtube, kids-explainers) — refusing to run.`);
    return 2;
  }
  const now = runClock(run.now);
  if (now === null) {
    run.log(
      `youtube-madeforkids: --now ${JSON.stringify(run.now)} is not an ISO 8601 date-time with a zone (Z or ±hh:mm) on a ` +
        `real day — refusing to run; nothing asked, nothing written.`,
    );
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
  const ids = uploads.map((u) => u.id);
  if (ids.length === 0) {
    run.log(`youtube-madeforkids: ${run.videosPath} lists no upload on ${run.experiment}; nothing asked.`);
    return 0;
  }

  const fresh: MadeForKidsReading[] = [];
  for (let i = 0; i < ids.length; i += MAX_IDS_PER_CALL) {
    const batch = ids.slice(i, i + MAX_IDS_PER_CALL);
    const url = videosListUrl(batch, key);
    if (new URL(url).hostname !== READ_HOST) throw new Error(`refusing a request to ${new URL(url).hostname}`);
    try {
      const res = await run.fetchImpl(url, { signal: AbortSignal.timeout(30_000), redirect: "error" });
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
      fresh.push(...parseVideosList(body, batch, now));
    } catch (error) {
      run.log(redact(`youtube-madeforkids: ${error instanceof Error ? error.message : String(error)} — nothing written.`));
      return 1;
    }
  }

  const next = mergeReadings(state, uploads, fresh, now);
  try {
    // Ruling 12.10 row 28 §2 decision 4: the state is colony facts only, or it is not written (its message names paths only).
    assertColonyFactsOnly(next);
  } catch (error) {
    run.log(redact(`youtube-madeforkids: ${error instanceof Error ? error.message : String(error)} — nothing written.`));
    return 1;
  }
  mkdirSync(dirname(run.statePath), { recursive: true });
  writeFileSync(run.statePath, JSON.stringify(next, null, 2) + "\n");
  // One word per upload, never a designation or a privacy status (§2 decision 4): the line's own declaration, the
  // contrary one recorded, or no designation read yet.
  const declared = String(next.declaresMadeForKids);
  const words = readbackOf(next, uploads).map((v) => (v === null ? "unread" : v === declared ? "as-declared" : "contrary"));
  run.log(
    `youtube-madeforkids: ${run.experiment} (declares made for kids: ${next.declaresMadeForKids}): asked ${ids.length}, ` +
      `read-back ${words.join(", ")}; wrote ${run.statePath}`,
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
    verdictsPath: TERMS_VERDICTS,
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
