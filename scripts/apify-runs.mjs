#!/usr/bin/env node
/**
 * Count how many times strangers ran our Apify Actor, and write the count to
 * `state/colony/measurements/apify-runs.json`.
 *
 * WHY THIS EXISTS. MISSION.md constraint 7 says nobody knows how a stranger
 * finds anything this colony builds, and that until somebody measures it every
 * ceiling in the plan is ₪0. This is the cheapest measurement available: the
 * Actor is published to the Apify Store unpriced (a free listing needs no KYC),
 * and Apify's own API will then tell us, for free, exactly how many people who
 * are not us pressed Start. Thirty days of that number is worth more than
 * another ceiling estimate.
 *
 * WHAT IT IS NOT. It is not revenue and it must never be read as revenue. A run
 * count is a demand signal; money still only counts in `revenue_ledger` with a
 * platform transaction id (MISSION.md rule 2). Nothing here writes to the ledger.
 *
 * USAGE
 *   APIFY_TOKEN=... node scripts/apify-runs.mjs
 *   node scripts/apify-runs.mjs --out /tmp/runs.json
 *   node scripts/apify-runs.mjs --window-days 7
 *
 * Without `APIFY_TOKEN` it prints one notice naming the owner's step and exits 0.
 * A missing secret is not a broken build — the owner has not pasted it yet.
 *
 * TWO DELIBERATE REFUSALS TO WRITE A ZERO, because a measurement file saying
 * "0 runs" is indistinguishable from "the thing was never published", and this
 * repo's recurring defect is exactly that kind of confident-looking nothing:
 *
 *   1. No token  -> notice, exit 0, write nothing.
 *   2. Actor 404 -> notice, exit 0, write nothing. The Actor has not been pushed
 *      yet; "nobody ran it" would be a lie about a thing that does not exist.
 *
 * A real zero — Actor published, nobody ran it — IS written, prominently, because
 * that is the answer to the question and the mission requires showing it.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..");

/** The measurement window the chief audit asked for. */
export const WINDOW_DAYS = 30;
export const DAY_MS = 86_400_000;
/** Apify caps a list page at 1000 items; asking for more is silently clamped. */
export const PAGE_SIZE = 1000;
/** Belt and braces against a server that never shrinks `count` below the limit. */
export const MAX_PAGES = 200;

export const API_BASE = "https://api.apify.com/v2";
export const ACTOR_DIR = join(REPO_ROOT, "products", "apify-il-open-data");
export const DEFAULT_OUT = join(REPO_ROOT, "state", "colony", "measurements", "apify-runs.json");

/**
 * Milliseconds from whatever the caller had: a Date, an epoch number, or an ISO
 * string. Returns null rather than NaN so a malformed timestamp is a countable
 * fact ("undatedRuns") instead of poisoning every comparison it touches.
 */
export function toMs(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

/** The UTC calendar date a moment falls on, as `YYYY-MM-DD`. */
export function dayKey(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Every UTC date between two moments, inclusive of both ends. */
export function daysBetween(startMs, endMs) {
  const out = [];
  let cursor = Date.parse(`${dayKey(startMs)}T00:00:00.000Z`);
  const last = Date.parse(`${dayKey(endMs)}T00:00:00.000Z`);
  while (cursor <= last && out.length <= 400) {
    out.push(dayKey(cursor));
    cursor += DAY_MS;
  }
  return out;
}

/**
 * Who pressed Start.
 *
 * This is the whole point of the exercise: our own runs — the smoke test after a
 * push, a build check from the Console — are not a buyer signal, and counting
 * them as one would manufacture exactly the fake success MISSION.md exists to
 * prevent. `userId` on a run is the account that started it, so subtracting our
 * own id is the honest split.
 *
 * With no `ownUserId` supplied nothing can be told apart, so everything is
 * "unknown" and `strangerRuns*` stays 0. Guessing would be worse than admitting it.
 */
export function classifyStarter(run, ownUserId) {
  const userId = typeof run?.userId === "string" ? run.userId.trim() : "";
  if (!ownUserId || userId === "") return "unknown";
  return userId === ownUserId ? "own" : "stranger";
}

const bump = (into, key) => { into[key] = (into[key] ?? 0) + 1; };
const sortedByCount = (counts) =>
  Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));

/**
 * Turn a raw list of Apify run objects into the measurement the colony stores.
 *
 * Pure: same inputs, same output, no clock and no network. `now` is passed in so
 * the 30-day boundary is testable rather than a thing that only misbehaves at
 * midnight in production.
 *
 * Window semantics, stated because a reader will otherwise have to guess:
 *   - A run counts as "in the last 30 days" when `startedAt >= now - 30 days`.
 *     The lower edge is INCLUSIVE; a run one millisecond older is out.
 *   - There is no upper edge. A run timestamped slightly after `now` is clock
 *     skew between Apify and this runner, and dropping a real run to punish a
 *     few seconds of skew would be the wrong trade.
 *   - `byDay` is zero-filled across every UTC date the window touches (31 keys
 *     for a 30-day window, because the oldest day is partial), plus any later
 *     date that actually has runs. Zero-filling is deliberate: a portfolio
 *     earning nothing must show nothing, not an empty object that reads as
 *     "no data yet".
 */
export function summariseRuns(runs, now, options = {}) {
  const { ownUserId = null, windowDays = WINDOW_DAYS } = options;
  const list = Array.isArray(runs) ? runs : [];
  const nowMs = toMs(now);
  if (nowMs === null) throw new TypeError("summariseRuns: `now` is not a usable timestamp");
  const windowStartMs = nowMs - windowDays * DAY_MS;

  const byStatus = {};
  const byStatusLast30Days = {};
  const byOrigin = {};
  const byStarter = { own: 0, stranger: 0, unknown: 0 };
  const dayCounts = {};

  let runsInWindow = 0;
  let strangerRunsInWindow = 0;
  let undatedRuns = 0;
  let firstMs = null;
  let lastMs = null;

  for (const run of list) {
    const status = typeof run?.status === "string" && run.status.trim() !== "" ? run.status.trim() : "UNKNOWN";
    bump(byStatus, status);

    const origin = typeof run?.meta?.origin === "string" && run.meta.origin.trim() !== ""
      ? run.meta.origin.trim()
      : "UNKNOWN";
    bump(byOrigin, origin);

    const who = classifyStarter(run, ownUserId);
    byStarter[who] += 1;

    const startedMs = toMs(run?.startedAt);
    if (startedMs === null) {
      undatedRuns += 1;
      continue;
    }
    if (firstMs === null || startedMs < firstMs) firstMs = startedMs;
    if (lastMs === null || startedMs > lastMs) lastMs = startedMs;

    if (startedMs >= windowStartMs) {
      runsInWindow += 1;
      bump(byStatusLast30Days, status);
      bump(dayCounts, dayKey(startedMs));
      if (who === "stranger") strangerRunsInWindow += 1;
    }
  }

  const byDay = {};
  for (const day of daysBetween(windowStartMs, Math.max(nowMs, lastMs ?? nowMs))) byDay[day] = 0;
  for (const [day, count] of Object.entries(dayCounts)) byDay[day] = count;
  const orderedByDay = Object.fromEntries(Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])));

  return {
    measuredAt: new Date(nowMs).toISOString(),
    window: {
      days: windowDays,
      start: new Date(windowStartMs).toISOString(),
      end: new Date(nowMs).toISOString(),
    },
    totalRuns: list.length,
    byStatus: sortedByCount(byStatus),
    runsLast30Days: runsInWindow,
    byStatusLast30Days: sortedByCount(byStatusLast30Days),
    byDay: orderedByDay,
    byStarter,
    strangerRunsLast30Days: strangerRunsInWindow,
    byOrigin: sortedByCount(byOrigin),
    firstRunAt: firstMs === null ? null : new Date(firstMs).toISOString(),
    lastRunAt: lastMs === null ? null : new Date(lastMs).toISOString(),
    undatedRuns,
  };
}

/** The Store slug comes from the Actor manifest, so the two can never drift apart. */
export function actorNameFrom(actorDir = ACTOR_DIR) {
  const manifest = JSON.parse(readFileSync(join(actorDir, ".actor", "actor.json"), "utf8"));
  const name = typeof manifest.name === "string" ? manifest.name.trim() : "";
  if (name === "") throw new Error(`No "name" in ${join(actorDir, ".actor", "actor.json")}`);
  return name;
}

class ApifyHttpError extends Error {
  constructor(status, url, body) {
    super(`Apify API ${status} for ${url}${body ? `: ${body.slice(0, 300)}` : ""}`);
    this.status = status;
    this.url = url;
  }
}

async function apiGet(path, token, fetchImpl = fetch) {
  const url = `${API_BASE}${path}`;
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!response.ok) throw new ApifyHttpError(response.status, url, await response.text().catch(() => ""));
  const payload = await response.json();
  return payload?.data ?? payload;
}

/** The account behind the token. Never hard-code the username: the token owns it. */
export async function fetchMe(token, fetchImpl = fetch) {
  const me = await apiGet("/users/me", token, fetchImpl);
  if (!me?.username) throw new Error("Apify /users/me returned no username; is the token valid?");
  return { id: me.id ?? null, username: me.username };
}

/**
 * Every run of one Actor, paged. Returns `{ items, endpoint }` — the endpoint is
 * reported so the stored measurement names the URL it actually came from.
 *
 * `/v2/actors/...` is what the current official client uses; `/v2/acts/...` is the
 * long-standing legacy alias. This container cannot reach api.apify.com at all
 * (the egress proxy 403s the CONNECT), so neither path could be exercised against
 * the real service here — hence the fallback rather than a bet on one of them.
 */
export async function fetchAllRuns(actorId, token, fetchImpl = fetch) {
  const paths = [`/actors/${encodeURIComponent(actorId)}/runs`, `/acts/${encodeURIComponent(actorId)}/runs`];
  let base = paths[0];
  const items = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    let data;
    try {
      data = await apiGet(`${base}?offset=${offset}&limit=${PAGE_SIZE}&desc=false`, token, fetchImpl);
    } catch (error) {
      if (error instanceof ApifyHttpError && error.status === 404 && base === paths[0] && page === 0) {
        base = paths[1];
        data = await apiGet(`${base}?offset=${offset}&limit=${PAGE_SIZE}&desc=false`, token, fetchImpl);
      } else {
        throw error;
      }
    }
    const batch = Array.isArray(data?.items) ? data.items : [];
    items.push(...batch);
    if (batch.length < PAGE_SIZE) return { items, endpoint: `${API_BASE}${base}` };
    offset += batch.length;
  }
  throw new Error(`Stopped after ${MAX_PAGES} pages of runs; refusing to loop forever.`);
}

function notice(message) {
  console.log(message);
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    try {
      writeFileSync(summaryPath, `${message}\n`, { flag: "a" });
    } catch {
      /* a summary we cannot write is not worth failing a job over */
    }
  }
}

export async function main(argv = process.argv.slice(2)) {
  const { values } = parseArgs({
    args: argv,
    options: {
      out: { type: "string" },
      "actor-dir": { type: "string" },
      "window-days": { type: "string" },
    },
    allowPositionals: false,
  });

  const token = (process.env.APIFY_TOKEN ?? "").trim();
  if (token === "") {
    notice(
      "APIFY_TOKEN is not set, so there is nothing to count yet. This is not a failure: " +
        "the owner adds it once, as repository secret APIFY_TOKEN, in docs/OWNER_STEPS.he.md step 6.",
    );
    return 0;
  }

  const actorDir = values["actor-dir"] ? resolve(values["actor-dir"]) : ACTOR_DIR;
  const outPath = values.out ? resolve(values.out) : DEFAULT_OUT;
  const windowDays = values["window-days"] ? Number(values["window-days"]) : WINDOW_DAYS;
  if (!Number.isFinite(windowDays) || windowDays <= 0) throw new Error("--window-days must be a positive number");

  const actorName = actorNameFrom(actorDir);
  const me = await fetchMe(token);
  const actorId = `${me.username}~${actorName}`;

  let fetched;
  try {
    fetched = await fetchAllRuns(actorId, token);
  } catch (error) {
    if (error instanceof ApifyHttpError && error.status === 404) {
      notice(
        `Apify has no Actor "${actorId}" yet, so there is nothing to count. ` +
          "Writing no measurement on purpose: a file saying \"0 runs\" would read as " +
          "\"nobody wanted it\" rather than \"it was never published\".",
      );
      return 0;
    }
    throw error;
  }

  const summary = {
    ...summariseRuns(fetched.items, Date.now(), { ownUserId: me.id, windowDays }),
    actor: {
      name: actorName,
      id: actorId,
      storeUrl: `https://apify.com/${me.username}/${actorName}`,
    },
    source: fetched.endpoint,
    note:
      "Run counts are a demand signal, not revenue. Money counts only in revenue_ledger " +
      "with a platform transaction id (MISSION.md rule 2).",
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);

  notice(
    `Apify runs for ${actorId}: ${summary.totalRuns} all time, ${summary.runsLast30Days} in the last ` +
      `${windowDays} days, of which ${summary.strangerRunsLast30Days} started by someone other than us. ` +
      `Written to ${outPath}.`,
  );
  return 0;
}

// Only run when executed directly, so the tests can import the pure parts.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (code) => process.exit(code ?? 0),
    (error) => {
      console.error(error?.stack ?? String(error));
      process.exit(1);
    },
  );
}
