/**
 * Revenue Colony — the page-view reader: PostHog's query API → one `weeklyPageViews` KPI row per line per week.
 *
 * The loop board ordered this read path on 29.9.2026 (research/channel-loop/RULING-2026-09-29-loop.md (b), "Tick 16-17,
 * instruments"), so the il-biz-tools and pcn874 page-view gates can run from the deploy day. The arithmetic is in
 * `page-views.ts`; this module reads the configuration, calls PostHog, writes KPI rows and reads them back.
 *
 * NEEDS (none of it exists today, so every call is a no-op that says which part is missing):
 *   POSTHOG_READ_KEY    a PostHog personal API key with the "Performing analytics queries" (query read) scope only —
 *                       PostHog's docs: "a personal API key with the project query read permission"
 *                       (contents/docs/sql/index.mdx). A GitHub Actions secret, passed to the colony tick.
 *   project id          POSTHOG_PROJECT_ID (a GitHub Actions variable), else `posthog.projectId` in site.json.
 *   the counter on      `posthog.projectKey` in site.json: with it empty the site sends nothing, and a read would be
 *                       zeros nobody measured, so nothing is read.
 *   D0                  `state/colony/page-view-clock.json`: the loop writes the public deploy day there, with its
 *                       evidence, on the day it happens (RULING-2026-09-28-floors.md row 9 item 3). No D0, no read.
 *
 * The key is sent to PostHog's own cloud query host and nowhere else: `https://eu.posthog.com` for a site that sends
 * to `https://eu.i.posthog.com`, `https://us.posthog.com` for `https://us.i.posthog.com` ("change `us.posthog.com` to
 * `eu.posthog.com` if you're on EU cloud", contents/docs/sql/index.mdx). The query endpoint is rate-limited to
 * 2,400 an hour (contents/docs/api/index.mdx); this reader makes one query per completed week per clock, which is at
 * most a few a week.
 *
 * A week that cannot be read is not written: the next tick tries again, and the gates read a missing week as
 * unmeasured, never as zero — and as `reader_down` once it is a day overdue (page-views.ts READ_GRACE_MS): a blocker until
 * a later tick reads it, never a clock restart, and never an instrument fault from the gates: a week that can never be
 * read at all is one only by the loop's call, with a new d0 and its evidence (RULING-2026-09-30-documents (c)) — save
 * under a priced query API, where the gates name the weeks still unread 60 days after the firing (below).
 *
 * A row is dated by when it was WRITTEN (the tick's time), and says which week it covers in its unit. M-instrument
 * ("two consecutive weekly writes by D0+21") is judged on the write time, so a late backfill cannot pass for an
 * instrument that worked on time (netlify period only; the domain clock has no instrument deadline).
 *
 * A PRICED QUERY API (research/channel-loop/RULING-2026-10-07-posthog-organisation.md §4(1) R1). Every `/query` answer
 * is classified (page-views.ts `queryApiPriced`): HTTP 402; a 403 or 429 whose body names billing, a plan, credits,
 * quota or an upgrade; a 2xx carrying a charge or billed-usage field. On the first such answer the reader sends
 * nothing more, writes `reader_down` with reason `query_api_priced` (the status, what matched, the body's first 200
 * characters masked, never the key) and records the firing in the clock file's `queryApi.priced`: the persistent
 * flag. While any firing there has no hand clearance, this tick and every later one sends no query; only a hand
 * clears one, with `clearedOn` (a UTC day) and `clearedReason` (naming the REOPEN record). A rate-limit 429 is not a
 * trigger: it is an ordinary failed read, and the next tick tries again. The host pinning above is unchanged.
 */

import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Database } from "better-sqlite3";
import { getLine, recordKpi } from "./ledger.js";
import {
  PAGE_VIEW_GATES,
  PAGE_VIEW_KPI,
  PAGE_VIEW_LINES,
  QUERY_API_PRICED,
  completedWeeks,
  countWeek,
  evaluatePageViewGates,
  isUtcDay,
  maskPricedBody,
  pageViewQuery,
  queryApiPriced,
  weekWindow,
  type HogQLQueryResponse,
  type PageViewClock,
  type QueryApiFiring,
  type ExclusionReason,
  type PageViewGateReading,
  type PageViewLine,
  type SitePage,
  type WeeklyReading,
} from "./page-views.js";

export const POSTHOG_READ_KEY_ENV = "POSTHOG_READ_KEY";
export const POSTHOG_PROJECT_ID_ENV = "POSTHOG_PROJECT_ID";
export const DEFAULT_PAGE_VIEW_SITE_DIR = join("products", "il-biz-tools");
export const DEFAULT_PAGE_VIEW_CLOCK_FILE = join("state", "colony", "page-view-clock.json");
/** At most this many weeks are read in one tick (a rebuilt database catches up over a few ticks). */
export const MAX_WEEKS_PER_READ = 20;
const QUERY_TIMEOUT_MS = 30_000;

/** The site's ingestion host → PostHog's private API host for the same cloud. Anything else is refused. */
export const QUERY_HOSTS: Readonly<Record<string, string>> = {
  "https://eu.i.posthog.com": "https://eu.posthog.com",
  "https://us.i.posthog.com": "https://us.posthog.com",
};

// ── Configuration ────────────────────────────────────────────────────────────

export interface PageViewSite {
  /** The canonical host from `siteUrl`, or null when it is not a URL. */
  host: string | null;
  /** `posthog.projectKey`: the public project token; "" while the counter is off. */
  projectKey: string;
  /** `posthog.projectId`, "" when unset. */
  projectId: string;
  /** `posthog.apiHost`: where the site's counter sends. */
  apiHost: string;
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Reads `src/config/site.json`. Throws when it cannot be read. */
export function readSite(siteDir: string = DEFAULT_PAGE_VIEW_SITE_DIR): PageViewSite {
  const raw = JSON.parse(readFileSync(join(siteDir, "src", "config", "site.json"), "utf8")) as {
    siteUrl?: unknown;
    posthog?: { projectKey?: unknown; projectId?: unknown; apiHost?: unknown };
  };
  let host: string | null = null;
  try {
    host = new URL(str(raw.siteUrl)).host || null;
  } catch {
    host = null;
  }
  return {
    host,
    projectKey: str(raw.posthog?.projectKey),
    projectId: str(raw.posthog?.projectId),
    apiHost: str(raw.posthog?.apiHost) || "https://eu.i.posthog.com",
  };
}

/** True when an HTML source carries `<meta name="robots" content="…noindex…">`, whatever the attribute order. */
export function hasRobotsNoindex(html: string): boolean {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (/\bname\s*=\s*["']?robots["']?/i.test(tag) && /\bcontent\s*=\s*["'][^"']*\bnoindex\b/i.test(tag)) return true;
  }
  return false;
}

/**
 * The pages the site serves and which of them are noindex: a robots meta in the page's source, or a page the build
 * withholds and replaces with a noindex notice. The withheld list is the product's own verdict — its publish gate is
 * imported and asked, exactly as `scripts/build-site.js` asks it, so the reader and the build cannot disagree.
 */
export async function sitePages(siteDir: string = DEFAULT_PAGE_VIEW_SITE_DIR): Promise<SitePage[]> {
  const root = resolve(siteDir);
  const pages = readdirSync(root).filter((name) => name.endsWith(".html")).sort();
  const gate = (await import(pathToFileURL(join(root, "src", "lib", "publish-gate.js")).href)) as {
    publishPlan?: unknown;
    PAGE_RATE_SOURCES?: unknown;
  };
  if (typeof gate.publishPlan !== "function" || !gate.PAGE_RATE_SOURCES || typeof gate.PAGE_RATE_SOURCES !== "object") {
    throw new Error("the site's publish gate exports no publishPlan/PAGE_RATE_SOURCES; cannot tell which pages ship");
  }
  const sources = gate.PAGE_RATE_SOURCES as Record<string, string[]>;
  const configs: Record<string, unknown> = {};
  for (const path of new Set(Object.values(sources).flat())) {
    try {
      configs[path] = JSON.parse(readFileSync(join(root, path), "utf8"));
    } catch {
      configs[path] = undefined; // the build withholds every page using it; so does this
    }
  }
  const plan = (gate.publishPlan as (p: string[], c: Record<string, unknown>) => { withhold?: { page: string }[] })(pages, configs);
  const withheld = new Set((plan.withhold ?? []).map((w) => w.page));
  return pages.map((page) => ({ page, noindex: withheld.has(page) || hasRobotsNoindex(readFileSync(join(root, page), "utf8")) }));
}

const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
/** A clearance names its REOPEN record: a ruling file, `RULING-YYYY-MM-DD-<slug>`. */
const RULING_NAME = /\bRULING-\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*/;

/**
 * `queryApi.priced` of the clock file (ruling 7.10 §4(1) R1): the firings, each kept as written, its clearance only
 * when a hand wrote both halves of it — `clearedOn`, a UTC day not before the day it fired, and `clearedReason`,
 * naming the REOPEN record. Anything else in a clearance is a problem, and the firing stays set. No block is no
 * firing; a block or a firing that cannot be read is null, and the reader then sends nothing (it fails closed).
 */
function readQueryApi(block: unknown, problems: string[]): QueryApiFiring[] | null {
  if (block === undefined) return [];
  const priced = block && typeof block === "object" && !Array.isArray(block) ? (block as { priced?: unknown }).priced : undefined;
  if (!Array.isArray(priced)) {
    problems.push('queryApi is not { "priced": [ … ] }: the reader sends nothing until a hand fixes it');
    return null;
  }
  const firings: QueryApiFiring[] = [];
  for (const [i, entry] of priced.entries()) {
    const where = `queryApi.priced[${i}]`;
    const e = (entry && typeof entry === "object" ? entry : {}) as Record<string, unknown>;
    const at = e.at;
    if (typeof at !== "string" || !ISO_INSTANT.test(at) || Number.isNaN(Date.parse(at)) || e.reason !== QUERY_API_PRICED) {
      problems.push(`${where} is not a firing the reader wrote (an ISO "at" and reason ${QUERY_API_PRICED}): the reader sends nothing until a hand fixes it`);
      return null;
    }
    const firedOn = at.slice(0, 10);
    const on = e.clearedOn;
    const why = str(e.clearedReason);
    const onSet = on !== null && on !== undefined && on !== "";
    let clearedOn: string | null = null;
    if (onSet || why) {
      const fault = !onSet
        ? "has a clearedReason but no clearedOn"
        : !isUtcDay(on)
          ? `clearedOn is not a UTC day (YYYY-MM-DD): ${String(on)}`
          : on < firedOn
            ? `clearedOn ${on} is before the day it fired, ${firedOn}`
            : !RULING_NAME.test(why)
              ? `clearedOn ${on} has no clearedReason naming the REOPEN record (a RULING-YYYY-MM-DD-… file)`
              : null;
      if (fault) problems.push(`${where} ${fault}: the flag stays set until a hand clears it with a dated reason`);
      else clearedOn = on as string;
    }
    firings.push({
      at,
      reason: QUERY_API_PRICED,
      status: typeof e.status === "number" ? e.status : 0,
      matched: str(e.matched),
      body: typeof e.body === "string" ? e.body : "",
      clearedOn,
      clearedReason: why || null,
    });
  }
  return firings;
}

/** Where D0 and the domain deploy day are recorded, one entry per line, each with its evidence. */
export function readPageViewClock(file: string = DEFAULT_PAGE_VIEW_CLOCK_FILE): {
  clocks: Record<PageViewLine, PageViewClock>;
  problems: string[];
  /**
   * `queryApi.priced`: every priced answer the reader met, with any hand clearance (ruling 7.10 §4(1) R1); null when the
   * file or the block cannot be read, and then the reader sends nothing until a hand fixes it.
   */
  queryApi: QueryApiFiring[] | null;
} {
  const clocks = Object.fromEntries(PAGE_VIEW_LINES.map((l) => [l, { d0: null, domainDeployDay: null }])) as Record<PageViewLine, PageViewClock>;
  const problems: string[] = [];
  if (!existsSync(file)) return { clocks, problems, queryApi: [] };
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    return { clocks, problems: [`${file} is not JSON (${error instanceof Error ? error.message : String(error)})`], queryApi: null };
  }
  for (const line of PAGE_VIEW_LINES) {
    const e = (data?.[line] ?? {}) as Record<string, unknown>;
    const day = (field: "d0" | "domainDeployDay", evidence: string): string | null => {
      const v = e[field];
      if (v === null || v === undefined || v === "") return null;
      if (!isUtcDay(v)) {
        problems.push(`${line}.${field} is not a UTC day (YYYY-MM-DD): ${String(v)}`);
        return null;
      }
      if (!str(e[evidence])) {
        problems.push(`${line}.${field} ${v} has no ${evidence}: a clock starts on a recorded fact, not a date`);
        return null;
      }
      return v;
    };
    const d0 = day("d0", "d0Evidence");
    let domainDeployDay = day("domainDeployDay", "domainEvidence");
    if (domainDeployDay && d0 && domainDeployDay < d0) {
      problems.push(`${line}.domainDeployDay ${domainDeployDay} is before D0 ${d0}`);
      domainDeployDay = null;
    }
    clocks[line] = { d0, domainDeployDay };
  }
  const queryApi = readQueryApi(data?.queryApi, problems);
  return { clocks, problems, queryApi };
}

/** A JSON value on one line, as the clock file writes it: `{ "k": v, … }`, `[a, b]`; `{}` and `[]` when empty. */
function inlineJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(inlineJson).join(", ")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    return entries.length ? `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${inlineJson(v)}`).join(", ")} }` : "{}";
  }
  return JSON.stringify(value);
}

/** The clock file's layout: one top-level key a line, its value on that line, and a final newline. */
export function serializePageViewClock(data: Record<string, unknown>): string {
  return `{\n${Object.entries(data).map(([k, v]) => `  ${JSON.stringify(k)}: ${inlineJson(v)}`).join(",\n")}\n}\n`;
}

/** The clock file's text with one more firing in `queryApi.priced`; every other key kept, in its place. */
export function withQueryApiFiring(text: string, firing: QueryApiFiring): string {
  const data = JSON.parse(text) as unknown;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("the clock file is not a JSON object");
  const record = data as Record<string, unknown>;
  const block = record.queryApi ?? { priced: [] };
  const priced = block && typeof block === "object" && !Array.isArray(block) ? (block as { priced?: unknown }).priced : undefined;
  if (!Array.isArray(priced)) throw new Error('queryApi is not { "priced": [ … ] }');
  record.queryApi = { ...(block as Record<string, unknown>), priced: [...priced, firing] };
  return serializePageViewClock(record);
}

/** Records a firing in the clock file: the persistent flag (ruling 7.10 §4(1) R1). Written through a temp file. */
export function recordQueryApiFiring(file: string, firing: QueryApiFiring): void {
  const next = withQueryApiFiring(readFileSync(file, "utf8"), firing);
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, next);
  renameSync(tmp, file);
}

// ── KPI rows ─────────────────────────────────────────────────────────────────

/** A row's unit names what it counts: the host, the clock's anchor day and the week. Parsed back by the gates. */
export function pageViewUnit(host: string, anchorDay: string, week: number): string {
  return `page views · ${host} · week ${week} from ${anchorDay}`;
}

const UNIT_RE = /^page views · (\S+) · week (\d+) from (\d{4}-\d{2}-\d{2})$/;

export function parsePageViewUnit(unit: unknown): { host: string; anchorDay: string; week: number } | null {
  const m = typeof unit === "string" ? UNIT_RE.exec(unit) : null;
  return m ? { host: m[1]!, anchorDay: m[3]!, week: Number(m[2]) } : null;
}

/**
 * The weekly readings of one line on one host under one anchor, ascending. A later row for a week wins its value;
 * `writtenAt` is the week's FIRST write, when it was first measured.
 */
export function pageViewSeries(db: Database, lineId: string, host: string, anchorDay: string): WeeklyReading[] {
  const rows = db
    .prepare(
      `SELECT value, unit, captured_at AS capturedAt FROM revenue_kpi_snapshots
        WHERE line_id = ? AND kpi = ? ORDER BY captured_at, rowid`,
    )
    .all(lineId, PAGE_VIEW_KPI) as { value: number; unit: string | null; capturedAt: string }[];
  const byWeek = new Map<number, WeeklyReading>();
  for (const row of rows) {
    const u = parsePageViewUnit(row.unit);
    if (!u || u.host !== host || u.anchorDay !== anchorDay) continue;
    const first = byWeek.get(u.week);
    byWeek.set(u.week, { week: u.week, views: row.value, writtenAt: first?.writtenAt ?? row.capturedAt });
  }
  return [...byWeek.values()].sort((a, b) => a.week - b.week);
}

// ── The read ─────────────────────────────────────────────────────────────────

export type PageViewReadStatus = "not_configured" | "counter_off" | "no_clock" | "up_to_date" | "recorded" | "error";

/** One week's answer as read: what was counted for each line recorded, per page, and what was not counted and why. */
export interface PageViewWeekRead {
  anchorDay: string;
  week: number;
  lines: PageViewLine[];
  views: Partial<Record<PageViewLine, number>>;
  byPage: Record<string, number>;
  excluded: Record<ExclusionReason, number>;
}

export interface PageViewReadResult {
  status: PageViewReadStatus;
  detail: string;
  recorded: { lineId: PageViewLine; week: number; views: number; anchorDay: string }[];
  /** Every week read in this call, with its exclusions, so the /preview/, noindex and other volumes are visible. */
  weeks: PageViewWeekRead[];
  /**
   * Set when the reader is down because the query API answered as priced, in this tick or an earlier one not yet
   * cleared by hand: the status is then `error` and the detail starts `reader_down — query_api_priced` (ruling 7.10 §4).
   */
  reason?: typeof QUERY_API_PRICED;
}

const EXCLUSION_WORDS: Record<ExclusionReason, string> = { preview: "preview", noindex: "noindex", "not-a-site-page": "other paths" };

/** `w1 from 2026-10-05: il-biz-tools 10, pcn874 5 (not counted: preview 12, noindex 3, other paths 1)` */
export function describeWeekRead(w: PageViewWeekRead): string {
  const counted = w.lines.map((l) => `${l} ${w.views[l] ?? 0}`).join(", ");
  const excluded = (Object.keys(EXCLUSION_WORDS) as ExclusionReason[]).map((r) => `${EXCLUSION_WORDS[r]} ${w.excluded[r]}`).join(", ");
  return `w${w.week} from ${w.anchorDay}: ${counted} (not counted: ${excluded})`;
}

export interface PageViewReaderOptions {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
  nowIso?: string;
  siteDir?: string;
  clockFile?: string;
}

/** A `/query` answer R1 reads as priced (ruling 7.10 §4(1)): its status, what matched, and its masked first characters. */
export class QueryApiPricedError extends Error {
  readonly status: number;
  readonly matched: string;
  readonly body: string;
  constructor(status: number, matched: string, body: string) {
    super(`PostHog's query API answered as priced: ${matched}`);
    this.name = "QueryApiPricedError";
    this.status = status;
    this.matched = matched;
    this.body = body;
  }
}

async function postQuery(
  fetchImpl: typeof fetch,
  queryHost: string,
  projectId: string,
  key: string,
  query: ReturnType<typeof pageViewQuery>,
): Promise<HogQLQueryResponse> {
  const res = await fetchImpl(`${queryHost}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, name: "colony weekly page views" }),
    signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
  });
  const text = await res.text();
  // R1, on every answer, before anything else reads it: a priced answer stops the reader (ruling 7.10 §4(1)).
  const priced = queryApiPriced(res.status, text);
  if (priced) throw new QueryApiPricedError(res.status, priced, maskPricedBody(text, key));
  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  if (!res.ok) {
    const detail = typeof (body as { detail?: unknown })?.detail === "string" ? `: ${(body as { detail: string }).detail.slice(0, 200)}` : "";
    throw new Error(`PostHog query failed: HTTP ${res.status}${detail}`);
  }
  if (!body || typeof body !== "object") throw new Error("PostHog answered 200 with a body that is not JSON");
  return body as HogQLQueryResponse;
}

/**
 * One read: every completed week under each line's clock that has no row yet, oldest first, one query per week per
 * clock. Never throws; the status says what happened, and an error never writes a week.
 */
export async function readPageViews(db: Database, options: PageViewReaderOptions = {}): Promise<PageViewReadResult> {
  const env = options.env ?? process.env;
  const siteDir = options.siteDir ?? DEFAULT_PAGE_VIEW_SITE_DIR;
  const nowIso = options.nowIso ?? new Date().toISOString();
  const clockFile = options.clockFile ?? DEFAULT_PAGE_VIEW_CLOCK_FILE;
  const recorded: PageViewReadResult["recorded"] = [];
  const weeksRead: PageViewWeekRead[] = [];
  const done = (status: PageViewReadStatus, detail: string, reason?: typeof QUERY_API_PRICED): PageViewReadResult => ({
    status,
    detail,
    recorded,
    weeks: weeksRead,
    ...(reason ? { reason } : {}),
  });

  const key = str(env[POSTHOG_READ_KEY_ENV]);
  let site: PageViewSite | null = null;
  let siteError = "";
  try {
    site = readSite(siteDir);
  } catch (error) {
    siteError = error instanceof Error ? error.message : String(error);
  }
  const projectId = str(env[POSTHOG_PROJECT_ID_ENV]) || site?.projectId || "";
  const missing = [
    key ? null : `${POSTHOG_READ_KEY_ENV} is not set`,
    projectId ? null : `no project id (${POSTHOG_PROJECT_ID_ENV}, or posthog.projectId in site.json)`,
  ].filter(Boolean);
  if (missing.length) return done("not_configured", `${missing.join("; ")} — nothing is read`);
  if (!site) return done("error", `cannot read ${join(siteDir, "src", "config", "site.json")}: ${siteError}`);
  if (!/^\d{1,12}$/.test(projectId)) return done("error", "the project id is not a PostHog project id (digits only); nothing is sent");
  if (!site.projectKey) {
    return done("counter_off", "posthog.projectKey in site.json is empty: the site sends no page views, so a read would be zeros nobody measured");
  }
  if (!site.host) return done("error", "site.json siteUrl is not a URL: no canonical host to count");
  const queryHost = QUERY_HOSTS[site.apiHost.replace(/\/+$/, "")];
  if (!queryHost) return done("error", `posthog.apiHost ${site.apiHost} is not a PostHog cloud ingestion host; the read key is sent nowhere else`);

  const { clocks, queryApi } = readPageViewClock(clockFile);
  // The flag of a priced query API (ruling 7.10 §4(1) R1): fail closed on a block that cannot be read, and send nothing
  // while a firing has no hand clearance.
  if (queryApi === null) {
    return done("error", `${clockFile}'s queryApi block cannot be read (see the page-view clock problems): it holds the flag that stops a priced query API, so nothing is sent until a hand fixes it`);
  }
  const open = queryApi.find((f) => f.clearedOn === null);
  if (open) {
    return done(
      "error",
      `reader_down — ${QUERY_API_PRICED} since ${open.at} (${open.matched}): no query is sent while ${clockFile} queryApi.priced holds a firing ` +
        "no hand has cleared (clearedOn, a UTC day, and clearedReason, naming the REOPEN record; RULING-2026-10-07-posthog-organisation §4(1) R1)",
      QUERY_API_PRICED,
    );
  }
  const byAnchor = new Map<string, PageViewLine[]>();
  for (const line of PAGE_VIEW_LINES) {
    const anchor = clocks[line].domainDeployDay ?? clocks[line].d0;
    if (!anchor || !getLine(db, line)) continue;
    byAnchor.set(anchor, [...(byAnchor.get(anchor) ?? []), line]);
  }
  if (byAnchor.size === 0) return done("no_clock", "no D0 is recorded for a seeded line: nothing is read");

  const host = site.host;
  const pending: { anchor: string; week: number; lines: PageViewLine[] }[] = [];
  for (const [anchor, lines] of byAnchor) {
    const have = new Map(lines.map((l) => [l, new Set(pageViewSeries(db, l, host, anchor).map((w) => w.week))]));
    for (const w of completedWeeks(anchor, nowIso)) {
      const lacking = lines.filter((l) => !have.get(l)!.has(w.week));
      if (lacking.length) pending.push({ anchor, week: w.week, lines: lacking });
    }
  }
  if (pending.length === 0) return done("up_to_date", "every completed week is recorded");

  let pages: SitePage[];
  try {
    pages = await sitePages(siteDir);
  } catch (error) {
    return done("error", `cannot list the site's pages: ${error instanceof Error ? error.message : String(error)}`);
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  for (const p of pending.slice(0, MAX_WEEKS_PER_READ)) {
    const w = weekWindow(p.anchor, p.week);
    try {
      const counts = countWeek(await postQuery(fetchImpl, queryHost, projectId, key, pageViewQuery(host, w, pages)), w, pages);
      db.transaction(() => {
        for (const line of p.lines) {
          // Dated by the write (the tick's time), never by the week's end: M-instrument is judged on when it was written.
          recordKpi(db, line, PAGE_VIEW_KPI, counts.views[line], pageViewUnit(host, p.anchor, p.week), nowIso);
          recorded.push({ lineId: line, week: p.week, views: counts.views[line], anchorDay: p.anchor });
        }
      })();
      weeksRead.push({
        anchorDay: p.anchor,
        week: p.week,
        lines: p.lines,
        views: Object.fromEntries(p.lines.map((l) => [l, counts.views[l]])),
        byPage: counts.byPage,
        excluded: counts.excluded,
      });
    } catch (error) {
      const before = weeksRead.length ? `; read before it, and kept: ${weeksRead.map(describeWeekRead).join("; ")}` : "";
      if (error instanceof QueryApiPricedError) {
        // R1 fired: nothing more is sent in this tick (the loop ends here) or any later one (the flag, recorded now).
        let flag = `the flag is set in ${clockFile} (queryApi.priced)`;
        try {
          recordQueryApiFiring(clockFile, {
            at: nowIso,
            reason: QUERY_API_PRICED,
            status: error.status,
            matched: error.matched,
            body: error.body,
            clearedOn: null,
            clearedReason: null,
          });
        } catch (writeError) {
          const why = writeError instanceof Error ? writeError.message : String(writeError);
          flag = `the flag could NOT be written to ${clockFile} (${why}): write the firing there by hand, or the next tick queries again`;
        }
        const detail =
          `reader_down — ${QUERY_API_PRICED}: week ${p.week} from ${p.anchor} not read: PostHog's query API answered as priced ` +
          `(${error.matched}; the answer began "${error.body}"); nothing more is sent, this tick or any later one, until a hand ` +
          `clears the firing with a dated reason — ${flag} (RULING-2026-10-07-posthog-organisation §4(1) R1)${before}`;
        return done("error", detail.split(key).join("[key]"), QUERY_API_PRICED);
      }
      const why = (error instanceof Error ? error.message : String(error)).split(key).join("[key]");
      return done("error", `week ${p.week} from ${p.anchor} not read: ${why}${before}`);
    }
  }
  const more = pending.length > MAX_WEEKS_PER_READ ? `; ${pending.length - MAX_WEEKS_PER_READ} week(s) left for the next tick` : "";
  return done("recorded", `${recorded.length} row(s) — ${weeksRead.map(describeWeekRead).join("; ")}${more}`);
}

// ── The gates, on the rows ───────────────────────────────────────────────────

/** Every page-view line's gate reading, from its clock and the rows under its current anchor. */
export function evaluatePageViewLines(
  db: Database,
  options: { nowIso: string; siteDir?: string; clockFile?: string },
): { readings: PageViewGateReading[]; problems: string[] } {
  const { clocks, problems, queryApi } = readPageViewClock(options.clockFile ?? DEFAULT_PAGE_VIEW_CLOCK_FILE);
  let host: string | null = null;
  try {
    host = readSite(options.siteDir ?? DEFAULT_PAGE_VIEW_SITE_DIR).host;
  } catch (error) {
    problems.push(`cannot read the site's config: ${error instanceof Error ? error.message : String(error)}`);
  }
  const readings = PAGE_VIEW_LINES.map((line) => {
    const clock = clocks[line];
    const anchor = clock.domainDeployDay ?? clock.d0;
    const weeks = anchor && host ? pageViewSeries(db, line, host, anchor) : [];
    // A priced query API's firings suspend the M-instrument deadline (ruling 7.10 §4(2)(iv)); an unreadable block
    // suspends nothing, and its problem is a blocker of its own.
    return evaluatePageViewGates(line, clock, weeks, options.nowIso, PAGE_VIEW_GATES, queryApi ?? []);
  });
  return { readings, problems };
}
