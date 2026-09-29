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
 * unmeasured, never as zero — and as an instrument fault once it is a day overdue (page-views.ts READ_GRACE_MS).
 *
 * A row is dated by when it was WRITTEN (the tick's time), and says which week it covers in its unit. M-instrument
 * ("two consecutive weekly writes by D0+21") is judged on the write time, so a late backfill cannot pass for an
 * instrument that worked on time.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Database } from "better-sqlite3";
import { getLine, recordKpi } from "./ledger.js";
import {
  PAGE_VIEW_KPI,
  PAGE_VIEW_LINES,
  completedWeeks,
  countWeek,
  evaluatePageViewGates,
  isUtcDay,
  pageViewQuery,
  weekWindow,
  type HogQLQueryResponse,
  type PageViewClock,
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

/** Where D0 and the domain deploy day are recorded, one entry per line, each with its evidence. */
export function readPageViewClock(file: string = DEFAULT_PAGE_VIEW_CLOCK_FILE): {
  clocks: Record<PageViewLine, PageViewClock>;
  problems: string[];
} {
  const clocks = Object.fromEntries(PAGE_VIEW_LINES.map((l) => [l, { d0: null, domainDeployDay: null }])) as Record<PageViewLine, PageViewClock>;
  const problems: string[] = [];
  if (!existsSync(file)) return { clocks, problems };
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    return { clocks, problems: [`${file} is not JSON (${error instanceof Error ? error.message : String(error)})`] };
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
  return { clocks, problems };
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
  const recorded: PageViewReadResult["recorded"] = [];
  const weeksRead: PageViewWeekRead[] = [];
  const done = (status: PageViewReadStatus, detail: string): PageViewReadResult => ({ status, detail, recorded, weeks: weeksRead });

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

  const { clocks } = readPageViewClock(options.clockFile ?? DEFAULT_PAGE_VIEW_CLOCK_FILE);
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
      const why = (error instanceof Error ? error.message : String(error)).split(key).join("[key]");
      const before = weeksRead.length ? `; read before it, and kept: ${weeksRead.map(describeWeekRead).join("; ")}` : "";
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
  const { clocks, problems } = readPageViewClock(options.clockFile ?? DEFAULT_PAGE_VIEW_CLOCK_FILE);
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
    return evaluatePageViewGates(line, clock, weeks, options.nowIso);
  });
  return { readings, problems };
}
