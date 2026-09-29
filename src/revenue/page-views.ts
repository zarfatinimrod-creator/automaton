/**
 * Revenue Colony — il-biz-tools / pcn874 page views: PostHog query results → weekly counts per line → the gates.
 *
 * Pure: no network, no database, no file. `page-views-reader.ts` fetches and records; this module is the arithmetic an
 * auditor re-runs on the same numbers.
 *
 * WHAT IS COUNTED. `$pageview` events on the site's canonical host whose path is a page the site publishes as itself
 * and lets search engines index. `pcn874.html` counts for the `pcn874` line; every other counted page for
 * `il-biz-tools`. Excluded, and counted under their reason so the exclusions are visible:
 *   - `/preview/…` — every colony- and owner-facing link uses that path, so our own views never carry a counted path
 *     (RULING-2026-09-28-floors.md row 9 item 3, applying PREREG-DECISIONS.md §3.4(a));
 *   - a page marked noindex — the 404 page, and a page the build withholds and replaces with a noindex notice
 *     (`products/il-biz-tools/src/lib/publish-gate.js`, `withheldPageHtml`);
 *   - any other path — a mistyped URL served by the 404 page still reports the path it was asked for.
 * Other hosts (Netlify deploy previews, branch deploys, localhost) are excluded in the query itself.
 *
 * THE QUERY. PostHog's query API (`POST /api/projects/:project_id/query/`, body `{ "query": { "kind": "HogQLQuery",
 * "query": … } }`), read on 29.9.2026 through Context7, library /posthog/posthog.com: contents/docs/sql/index.mdx (the
 * endpoint, and the response: `results` "an array of result arrays", `columns`, `types`, `hogql`, `clickhouse`),
 * contents/docs/api/queries.mdx (the personal API key with query read), contents/docs/data-warehouse/sql/index.mdx
 * ("By default, PostHog sets LIMIT at 100" — so the query states its own), contents/docs/sql/expressions.mdx ("Date
 * literals parse in your project's timezone, not UTC … pass the timezone explicitly: `toDateTime('…', 'UTC')`").
 * `$host` and `$pathname` are what posthog-js sets on every event from `location.host` and `location.pathname`
 * (posthog-js packages/browser-common/src/utils/event-utils.ts:356-357, read from raw.githubusercontent.com on
 * 29.9.2026).
 *
 * THE WEEK. Seven days from the clock's anchor day at 00:00 UTC: week 1 is [anchor, anchor+7d). Aligning weeks to the
 * anchor makes "the 56 days from D0" exactly weeks 1-8 and "weeks 5-8" exactly what the ruling says, instead of an
 * ISO-week approximation. The anchor is D0 (the public netlify.app deploy) until the domain deploy, then the domain
 * deploy day (BOARD-LOOP PUBLISH-10: the 8-week clock starts there).
 *
 * THE GATES (evaluatePageViewGates), each the ruling's own words turned into a comparison:
 *   - Instrumented (logs/CHANNEL_LOOP.md §2): nothing is read as a verdict until two consecutive weekly writes exist.
 *   - M-instrument (floors row 9, item 3): no two consecutive weekly writes by D0+21 → an instrument fault — fixed, the
 *     clock restarted, recorded. Never a fail.
 *   - M-reach at D0+56 (same item): total page views over the 56 days below 5 → `pause`; at or above 100 a week
 *     averaged over weeks 5-8 → `pass`; between → `extend` to D0+112, the same read, no second extension. pcn874 rides
 *     the same deploy and takes the same read (RULING-2026-09-29-lines (f)).
 *   - The domain-period kill (portfolio.ts killCriteria, PUBLISH-10): weekly page views under 100 for 8 consecutive
 *     weeks after the domain deploy → `kill`.
 * A verdict is a reading for the board, which applies it; nothing here moves a line.
 */

export const PAGE_VIEW_KPI = "weeklyPageViews";

export const PAGE_VIEW_LINES = ["il-biz-tools", "pcn874"] as const;
export type PageViewLine = (typeof PAGE_VIEW_LINES)[number];

/** The one page counted for the pcn874 line. */
export const PCN874_PAGE = "pcn874.html";

export function lineForPage(page: string): PageViewLine {
  return page === PCN874_PAGE ? "pcn874" : "il-biz-tools";
}

/** A page the site serves as itself, and whether it asks search engines not to index it. */
export interface SitePage {
  page: string;
  noindex: boolean;
}

export type ExclusionReason = "preview" | "noindex" | "not-a-site-page";

export type PathVerdict =
  | { counted: true; page: string; lineId: PageViewLine }
  | { counted: false; reason: ExclusionReason };

const PAGE_NAME = /^[a-z0-9][a-z0-9-]*$/;

/** `$pathname` → the page it serves, or why it is not counted. `/x` and `/x.html` are one page (Netlify pretty URLs). */
export function classifyPath(pathname: unknown, pages: SitePage[]): PathVerdict {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) return { counted: false, reason: "not-a-site-page" };
  if (pathname === "/preview" || pathname.startsWith("/preview/")) return { counted: false, reason: "preview" };
  let name = pathname.slice(1);
  if (name === "" || name === "index" || name === "index.html") name = "index";
  else if (name.endsWith(".html")) name = name.slice(0, -".html".length);
  if (!PAGE_NAME.test(name)) return { counted: false, reason: "not-a-site-page" };
  const page = `${name}.html`;
  const known = pages.find((p) => p.page === page);
  if (!known) return { counted: false, reason: "not-a-site-page" };
  if (known.noindex) return { counted: false, reason: "noindex" };
  return { counted: true, page, lineId: lineForPage(page) };
}

// ── Weeks ────────────────────────────────────────────────────────────────────

export const DAY_MS = 86_400_000;
export const WEEK_MS = 7 * DAY_MS;
/** A week is read this long after it ends, so events still in PostHog's ingestion pipeline are not missed. Our choice. */
export const READ_LAG_MS = 6 * 60 * 60 * 1000;

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isUtcDay(day: unknown): day is string {
  return typeof day === "string" && DAY_RE.test(day) && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
}

export function anchorMs(day: string): number {
  if (!isUtcDay(day)) throw new TypeError(`not a UTC calendar day (YYYY-MM-DD): ${String(day)}`);
  return Date.parse(`${day}T00:00:00Z`);
}

export interface WeekWindow {
  /** 1-based: week 1 starts on the anchor day. */
  week: number;
  start: string;
  end: string;
}

export function weekWindow(anchorDay: string, week: number): WeekWindow {
  if (!Number.isInteger(week) || week < 1) throw new RangeError(`week must be a positive integer: ${week}`);
  const start = anchorMs(anchorDay) + (week - 1) * WEEK_MS;
  return { week, start: new Date(start).toISOString(), end: new Date(start + WEEK_MS).toISOString() };
}

/** Every week from the anchor that has ended at least `lagMs` before `nowIso`, oldest first. */
export function completedWeeks(anchorDay: string, nowIso: string, lagMs: number = READ_LAG_MS): WeekWindow[] {
  const elapsed = Date.parse(nowIso) - lagMs - anchorMs(anchorDay);
  const n = elapsed > 0 ? Math.floor(elapsed / WEEK_MS) : 0;
  return Array.from({ length: n }, (_, i) => weekWindow(anchorDay, i + 1));
}

/** Whole days since the anchor day (day 0 is the anchor day itself). */
export function daysSince(anchorDay: string, nowIso: string): number {
  return Math.floor((Date.parse(nowIso) - anchorMs(anchorDay)) / DAY_MS);
}

// ── The query ────────────────────────────────────────────────────────────────

/** More distinct paths than this in one week means the answer may be cut short; the reading is then refused. */
export const QUERY_ROW_LIMIT = 1000;

const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

/** HogQL's `toDateTime` literal for an ISO instant, pinned to UTC. */
function utcLiteral(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new TypeError(`not an ISO instant: ${iso}`);
  return `toDateTime('${d.toISOString().slice(0, 19).replace("T", " ")}', 'UTC')`;
}

export interface HogQLQuery {
  kind: "HogQLQuery";
  query: string;
}

/** One week's `$pageview` count per path on one host. The host is checked, never interpolated unchecked. */
export function pageViewQuery(host: string, w: WeekWindow, limit: number = QUERY_ROW_LIMIT): HogQLQuery {
  if (!HOST_RE.test(host)) throw new TypeError(`not a hostname: ${host}`);
  return {
    kind: "HogQLQuery",
    query: [
      "SELECT properties.$pathname AS pathname, count() AS views",
      "FROM events",
      "WHERE event = '$pageview'",
      `  AND properties.$host = '${host}'`,
      `  AND timestamp >= ${utcLiteral(w.start)}`,
      `  AND timestamp < ${utcLiteral(w.end)}`,
      "GROUP BY pathname",
      "ORDER BY pathname",
      `LIMIT ${limit}`,
    ].join("\n"),
  };
}

// ── The response ─────────────────────────────────────────────────────────────

/** The fields of PostHog's HogQLQueryResponse this module reads (contents/docs/sql/index.mdx). */
export interface HogQLQueryResponse {
  results?: unknown[][];
  columns?: string[];
  types?: string[];
  hasMore?: boolean;
  error?: unknown;
}

export interface WeeklyCounts extends WeekWindow {
  views: Record<PageViewLine, number>;
  /** Counted views per page. */
  byPage: Record<string, number>;
  /** Views on the host that were not counted, by reason. */
  excluded: Record<ExclusionReason, number>;
}

const count = (v: unknown): number => {
  const n = typeof v === "number" ? v : typeof v === "string" && /^\d+$/.test(v) ? Number(v) : NaN;
  if (!Number.isInteger(n) || n < 0) throw new TypeError(`not a count in the query result: ${String(v)}`);
  return n;
};

/**
 * One week's query response → counts per line. Throws on an error body, a missing column, a value that is not a count,
 * or an answer that may have been cut short: a week that cannot be read is a missing reading, never a zero. A response
 * with no rows is a real zero — the query ran and nothing matched.
 */
export function countWeek(response: HogQLQueryResponse, w: WeekWindow, pages: SitePage[], limit: number = QUERY_ROW_LIMIT): WeeklyCounts {
  if (!response || typeof response !== "object") throw new TypeError("the query response is not an object");
  if (response.error) throw new Error(`the query returned an error: ${JSON.stringify(response.error).slice(0, 200)}`);
  const columns = response.columns ?? [];
  const pi = columns.indexOf("pathname");
  const vi = columns.indexOf("views");
  if (pi === -1 || vi === -1) throw new Error(`the query result lacks pathname/views columns; has ${columns.join(", ") || "none"}`);
  const rows = response.results ?? [];
  if (!Array.isArray(rows)) throw new TypeError("the query result's results is not an array");
  if (response.hasMore === true || rows.length >= limit) {
    throw new Error(`the query returned ${rows.length} rows at a limit of ${limit}; the week may be cut short and is not recorded`);
  }

  const out: WeeklyCounts = {
    ...w,
    views: { "il-biz-tools": 0, pcn874: 0 },
    byPage: {},
    excluded: { preview: 0, noindex: 0, "not-a-site-page": 0 },
  };
  for (const row of rows) {
    if (!Array.isArray(row)) throw new TypeError("a result row is not an array");
    const n = count(row[vi]);
    const verdict = classifyPath(row[pi], pages);
    if (!verdict.counted) {
      out.excluded[verdict.reason] += n;
      continue;
    }
    out.views[verdict.lineId] += n;
    out.byPage[verdict.page] = (out.byPage[verdict.page] ?? 0) + n;
  }
  return out;
}

// ── The gates ────────────────────────────────────────────────────────────────

export const PAGE_VIEW_GATES = {
  /** logs/CHANNEL_LOOP.md §2 "Instrumented": at least 2 consecutive scheduled KPI writes. */
  instrumentedWrites: 2,
  /** M-instrument: the two writes must exist by D0+21. */
  instrumentByDay: 21,
  /** M-reach is read at D0+56 over weeks 1-8 … */
  reachDay: 56,
  /** … below 5 in total → pause. */
  reachMinTotal: 5,
  /** At or above 100 a week, averaged over the last four weeks of the read (weeks 5-8) → pass. */
  passMinWeeklyAverage: 100,
  /** Between the two → one extension to D0+112, the same read over weeks 9-16; there is no second. */
  extensionDay: 112,
  /** The domain-period kill: under 100 a week … */
  killWeeklyBelow: 100,
  /** … for 8 consecutive weeks after the domain deploy. */
  killConsecutiveWeeks: 8,
} as const;

export interface PageViewClock {
  /** The public netlify.app deploy day (UTC), or null before it. */
  d0: string | null;
  /** The domain deploy day (UTC), or null — frozen by the owner's ₪0 rule today. */
  domainDeployDay: string | null;
}

export type PageViewVerdict =
  | "no_clock" // no D0 recorded: nothing is read and no gate runs
  | "not_started" // the anchor day is in the future
  | "uninstrumented" // fewer than two consecutive weekly writes, before the instrument deadline: no gate is read
  | "instrument_fault" // an instrument fault: fixed, clock restarted, recorded — never a fail
  | "measuring" // instrumented; the next read is not due
  | "pause" // M-reach: under 5 page views over the read's 56 days
  | "pass" // M-reach: 100 a week or more over the read's last four weeks
  | "extend" // M-reach between the two at D0+56: re-read at D0+112
  | "extension_exhausted" // between the two again at D0+112: no second extension, the board rules
  | "continue" // domain period, no kill
  | "kill"; // domain period: under 100 a week for 8 consecutive weeks

export interface WeeklyReading {
  week: number;
  views: number;
}

export interface PageViewGateReading {
  lineId: string;
  period: "netlify" | "domain" | null;
  anchorDay: string | null;
  /** Days since the anchor day, or null without one. */
  day: number | null;
  /** The weekly readings under this anchor, by week, ascending. */
  weeks: WeeklyReading[];
  instrumented: boolean;
  verdict: PageViewVerdict;
  notes: string[];
}

/** True when `n` consecutive weeks each carry a reading. */
export function hasConsecutiveWrites(weeks: number[], n: number = PAGE_VIEW_GATES.instrumentedWrites): boolean {
  const have = new Set(weeks);
  return weeks.some((w) => Array.from({ length: n }, (_, i) => w + i).every((k) => have.has(k)));
}

const range = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** The M-reach read over weeks `from..from+7`: pause, pass, or neither (null); throws the missing weeks. */
function reachRead(byWeek: Map<number, number>, from: number, g: typeof PAGE_VIEW_GATES): { verdict: "pause" | "pass" | null; note: string } | { missing: number[] } {
  const span = range(from, from + 7);
  const missing = span.filter((w) => !byWeek.has(w));
  if (missing.length) return { missing };
  const total = span.reduce((s, w) => s + byWeek.get(w)!, 0);
  const lastFour = span.slice(4).reduce((s, w) => s + byWeek.get(w)!, 0) / 4;
  const label = `weeks ${from}-${from + 7}: ${total} page views in total, ${lastFour} a week over weeks ${from + 4}-${from + 7}`;
  if (total < g.reachMinTotal) return { verdict: "pause", note: `${label} — under ${g.reachMinTotal} in 56 days` };
  if (lastFour >= g.passMinWeeklyAverage) return { verdict: "pass", note: `${label} — at or above ${g.passMinWeeklyAverage} a week` };
  return { verdict: null, note: `${label} — between ${g.reachMinTotal} in total and ${g.passMinWeeklyAverage} a week` };
}

/**
 * The page-view gates for one line on its weekly readings. `weeks` are the readings under the clock's current anchor
 * (the domain deploy day once set, else D0); a week with no reading is unmeasured, never zero.
 */
export function evaluatePageViewGates(
  lineId: string,
  clock: PageViewClock,
  weeks: WeeklyReading[],
  nowIso: string,
  g: typeof PAGE_VIEW_GATES = PAGE_VIEW_GATES,
): PageViewGateReading {
  const period: PageViewGateReading["period"] = clock.domainDeployDay ? "domain" : clock.d0 ? "netlify" : null;
  const anchorDay = clock.domainDeployDay ?? clock.d0;
  const sorted = [...weeks].sort((a, b) => a.week - b.week);
  const base = { lineId, period, anchorDay, weeks: sorted, notes: [] as string[] };
  if (!anchorDay) {
    return { ...base, day: null, instrumented: false, verdict: "no_clock", notes: ["no D0 recorded: nothing is read and no gate runs"] };
  }
  const day = daysSince(anchorDay, nowIso);
  if (day < 0) return { ...base, day, instrumented: false, verdict: "not_started", notes: [`the clock starts on ${anchorDay}`] };

  const byWeek = new Map(sorted.map((w) => [w.week, w.views]));
  const instrumented = hasConsecutiveWrites([...byWeek.keys()], g.instrumentedWrites);
  const reading = (verdict: PageViewVerdict, ...notes: string[]): PageViewGateReading => ({ ...base, day, instrumented, verdict, notes });

  if (!instrumented) {
    return day >= g.instrumentByDay
      ? reading("instrument_fault", `fewer than ${g.instrumentedWrites} consecutive weekly writes by day ${g.instrumentByDay} (M-instrument): fix the instrument, restart the clock and record it — never a fail`)
      : reading("uninstrumented", `fewer than ${g.instrumentedWrites} consecutive weekly writes yet: no gate is read`);
  }

  if (period === "domain") {
    const weeksWritten = [...byWeek.keys()];
    for (const end of weeksWritten) {
      const span = range(end - g.killConsecutiveWeeks + 1, end);
      if (span[0]! < 1 || !span.every((w) => byWeek.has(w))) continue;
      if (span.every((w) => byWeek.get(w)! < g.killWeeklyBelow)) {
        return reading("kill", `weeks ${span[0]}-${end} after the domain deploy each under ${g.killWeeklyBelow} page views (${span.map((w) => byWeek.get(w)).join(", ")})`);
      }
    }
    return reading("continue", `no ${g.killConsecutiveWeeks} consecutive measured weeks under ${g.killWeeklyBelow} since the domain deploy`);
  }

  if (day < g.reachDay) return reading("measuring", `the reach read is due on day ${g.reachDay}`);
  const first = reachRead(byWeek, 1, g);
  if ("missing" in first) {
    return reading("instrument_fault", `the day-${g.reachDay} read cannot be made: week(s) ${first.missing.join(", ")} of 1-8 have no reading — unmeasured, never zero; fix, restart the clock, record`);
  }
  if (first.verdict) return reading(first.verdict, first.note);
  if (day < g.extensionDay) return reading("extend", first.note, `one extension: the same read over weeks 9-16 on day ${g.extensionDay}`);
  const second = reachRead(byWeek, 9, g);
  if ("missing" in second) {
    return reading("instrument_fault", `the day-${g.extensionDay} read cannot be made: week(s) ${second.missing.join(", ")} of 9-16 have no reading — unmeasured, never zero`);
  }
  if (second.verdict) return reading(second.verdict, first.note, second.note);
  return reading("extension_exhausted", first.note, second.note, "there is no second extension: the board rules");
}
