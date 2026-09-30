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
 *   - any other path — a page the site no longer serves (renamed or removed after the view), or an event posted with
 *     an invented path: the counter's project token is public, so anyone can send one. (A mistyped URL sends nothing:
 *     the 404 page loads no script.) The query folds all of them into one `(other)` row, so no number of invented
 *     paths can make a week's answer too long to read.
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
 *     clock restarted, recorded. Never a fail. Judged on when each row was WRITTEN (`writtenAt`), not on which weeks
 *     it covers: a week read late (a key added at day 30 backfills weeks 1-4 in one tick) was not written by D0+21,
 *     so the fault stands until the clock is restarted.
 *   - M-reach at D0+56 (same item): total page views over the 56 days below 5 → `pause`; at or above 100 a week
 *     averaged over weeks 5-8 → `pass`; between → `extend` to D0+112, the same read over weeks 9-16, no second
 *     extension: between again → `pause`, as under 5, re-entering measuring at the domain deploy
 *     (RULING-2026-09-30-documents (c) call 3). pcn874 rides the same deploy and takes the same read
 *     (RULING-2026-09-29-lines (f)). The read is made once its last week (week 8, then week 16) has been read — its
 *     end plus READ_LAG_MS — not at the stroke of day 56.
 *   - The domain-period kill (portfolio.ts killCriteria, PUBLISH-10): weekly page views under 100 for 8 consecutive
 *     weeks after the domain deploy → `kill`.
 *   - A reader that stops (in either period, once instrumented): a completed week still without a reading
 *     READ_GRACE_MS after it became readable is `reader_down`, a blocker — so a deleted or expired key cannot hide
 *     the kill or the reach read by leaving weeks unmeasured. It is not an instrument fault and never restarts the
 *     clock (RULING-2026-09-30-documents (c) call 1): it clears when the reader reads the week (PostHog keeps the
 *     events, so a late read is the same measurement). Only a week that cannot be read at all is an instrument
 *     fault, and that is the loop's call (a new d0 with its evidence): no gate detects it, since such a week is
 *     never written and stays `reader_down`. After a final netlify-period verdict no gate waits on later weeks, and
 *     a gap there is a diagnostic note — not a blocker, and nothing to restart.
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
/**
 * A readable week with no reading this long after it became readable is overdue: the reader is down. One day of the
 * hourly tick is about 24 attempts, so one PostHog outage or one failed run is not the reader down. Our choice.
 */
export const READ_GRACE_MS = DAY_MS;

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

/** The bucket every `/preview/…` view is folded into, and the bucket for every path that is not a site page. */
export const PREVIEW_BUCKET = "/preview/";
export const OTHER_BUCKET = "(other)";

/**
 * Every path that serves one of `pages`, as `$pathname` reports it: `/x` and `/x.html`, and `/`, `/index`,
 * `/index.html` for the home page. A page whose name is not a plain lowercase name is left out — it could never be
 * counted (classifyPath) and is never interpolated into a query.
 */
export function sitePaths(pages: SitePage[]): string[] {
  const out: string[] = [];
  for (const { page } of pages) {
    if (typeof page !== "string" || !page.endsWith(".html")) continue;
    const name = page.slice(0, -".html".length);
    if (!PAGE_NAME.test(name)) continue;
    if (name === "index") out.push("/", "/index", "/index.html");
    else out.push(`/${name}`, `/${name}.html`);
  }
  return [...new Set(out)];
}

/**
 * One week's `$pageview` count on one host, bucketed inside the query: every `/preview/…` path into one row, each site
 * page's paths as themselves, and everything else into one `(other)` row. The answer therefore has at most
 * `sitePaths(pages).length + 2` rows however many distinct paths were sent, so invented paths (the project token is
 * public) cannot push a week past the LIMIT and stall the read. The host and the paths are checked, never
 * interpolated unchecked; `multiIf`, `IN` and `LIKE` are HogQL comparisons (contents/docs/sql/expressions.mdx).
 */
export function pageViewQuery(host: string, w: WeekWindow, pages: SitePage[], limit: number = QUERY_ROW_LIMIT): HogQLQuery {
  if (!HOST_RE.test(host)) throw new TypeError(`not a hostname: ${host}`);
  const paths = sitePaths(pages);
  if (paths.length + 2 >= limit) throw new RangeError(`${paths.length} site paths do not fit a LIMIT of ${limit}`);
  const p = "properties.$pathname";
  const branches = [`${p} = '/preview' OR ${p} LIKE '/preview/%', '${PREVIEW_BUCKET}'`];
  if (paths.length) branches.push(`${p} IN (${paths.map((x) => `'${x}'`).join(", ")}), ${p}`);
  return {
    kind: "HogQLQuery",
    query: [
      `SELECT multiIf(${branches.join(", ")}, '${OTHER_BUCKET}') AS pathname, count() AS views`,
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
  /** M-instrument: the two writes must have been WRITTEN by D0+21 (00:00 UTC of day 21), whichever weeks they cover. */
  instrumentByDay: 21,
  /** M-reach is read over the weeks ending on D0+56 (weeks 1-8), once week 8 is read … */
  reachDay: 56,
  /** … below 5 in total → pause. */
  reachMinTotal: 5,
  /** At or above 100 a week, averaged over the last four weeks of the read (weeks 5-8) → pass. */
  passMinWeeklyAverage: 100,
  /** Between the two → one extension to D0+112, the same read over weeks 9-16; there is no second (between again → pause). */
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

/**
 * Every verdict the gates return, in the words of RULING-2026-09-30-documents (c): the gap verdict is `reader_down`, so
 * KILL-1's "instrument fault … the clock restarted" is never applied to a reader outage, and a second "between" is a
 * pause — there is no outcome for the board to invent.
 */
export const PAGE_VIEW_VERDICTS = [
  "no_clock", // no D0 recorded: nothing is read and no gate runs
  "not_started", // the anchor day is in the future
  "uninstrumented", // fewer than two consecutive weekly writes, before the instrument deadline: no gate is read
  // M-instrument missed: fixed, clock restarted, recorded — never a fail. A week that cannot be read at all is the loop's
  // call on a `reader_down` (a new d0 with its evidence); the gates never return it for that.
  "instrument_fault",
  "reader_down", // a readable week still unread a day on: a blocker until the reader reads it — never a clock restart
  "measuring", // instrumented; the next read is not due
  "pause", // M-reach: under 5 page views over the read's 56 days, or between again after the one extension
  "pass", // M-reach: 100 a week or more over the read's last four weeks
  "extend", // M-reach between the two at D0+56: re-read at D0+112
  "continue", // domain period, no kill
  "kill", // domain period: under 100 a week for 8 consecutive weeks
] as const;
export type PageViewVerdict = (typeof PAGE_VIEW_VERDICTS)[number];

export interface WeeklyReading {
  week: number;
  views: number;
  /** When the week's reading was first written (ISO). M-instrument is judged on this, not on the week it covers. */
  writtenAt: string;
}

export interface PageViewGateReading {
  lineId: string;
  period: "netlify" | "domain" | null;
  anchorDay: string | null;
  /** Days since the anchor day, or null without one. */
  day: number | null;
  /** The weekly readings under this anchor, by week, ascending. */
  weeks: WeeklyReading[];
  /** Two consecutive weekly writes made by the M-instrument deadline (or, before it, so far). */
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

/** The last week of a read that ends on day `day` from the anchor (56 → 8). Throws unless `day` is a whole number of weeks. */
export function endWeekOfDay(day: number): number {
  const w = day / 7;
  if (!Number.isInteger(w) || w < 1) throw new RangeError(`a read must end on a whole week from the anchor: day ${day}`);
  return w;
}

const hours = (ms: number): number => Math.round(ms / 3_600_000);

/** The note a second "between" carries with its pause (RULING-2026-09-30-documents (c) call 3, fold 8). */
export const SECOND_BETWEEN_NOTE = "one extension, not passed: paused as under 5; re-enters at the domain deploy";

/** The M-reach read over weeks `from..to`, all present: pause, pass, or neither (null). */
function reachRead(byWeek: Map<number, number>, from: number, to: number, g: typeof PAGE_VIEW_GATES): { verdict: "pause" | "pass" | null; note: string } {
  const span = range(from, to);
  const lastFourWeeks = span.slice(-4);
  const total = span.reduce((s, w) => s + byWeek.get(w)!, 0);
  const lastFour = lastFourWeeks.reduce((s, w) => s + byWeek.get(w)!, 0) / lastFourWeeks.length;
  const label = `weeks ${from}-${to}: ${total} page views in total, ${lastFour} a week over weeks ${lastFourWeeks[0]}-${to}`;
  if (total < g.reachMinTotal) return { verdict: "pause", note: `${label} — under ${g.reachMinTotal} in ${span.length * 7} days` };
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

  const nowMs = Date.parse(nowIso);
  const byWeek = new Map(sorted.map((w) => [w.week, w.views]));
  // Weeks that are readable now (ended, plus the lag), and those still unread a grace period after that.
  const readable = new Set(completedWeeks(anchorDay, nowIso).map((w) => w.week));
  const overdue = completedWeeks(anchorDay, nowIso, READ_LAG_MS + READ_GRACE_MS)
    .map((w) => w.week)
    .filter((w) => !byWeek.has(w));
  const deadlineMs = anchorMs(anchorDay) + g.instrumentByDay * DAY_MS;
  const writtenByDeadline = sorted.filter((w) => Date.parse(w.writtenAt) <= deadlineMs).map((w) => w.week);
  const instrumented = hasConsecutiveWrites(writtenByDeadline, g.instrumentedWrites);
  const reading = (verdict: PageViewVerdict, ...notes: string[]): PageViewGateReading => ({ ...base, day, instrumented, verdict, notes });
  // The gap as a blocker (a gate waits on the weeks) or as a note after the period's final read (no gate does). Only
  // the blocker names the instrument-fault restart: after a final verdict the measurement is finished, and restarting
  // the clock over weeks no gate reads would throw it away.
  const gapNote = (late: number[], blocker = true): string =>
    `week(s) ${late.join(", ")} still have no reading ${hours(READ_GRACE_MS)}h after they became readable: the reader is down — ` +
    "never a clock restart; unmeasured, never zero. Fix the reader: it reads every missing week it can" +
    (blocker
      ? " and this clears when they are in (PostHog keeps the events, so a late read is the same count); only a week " +
        "that cannot be read at all is an instrument fault — the loop's call, which no gate makes: restart the clock " +
        "(a new d0 with its evidence) and record it"
      : " (PostHog keeps the events, so a late read is the same count); diagnostics only, nothing to restart");

  if (!instrumented) {
    if (nowMs < deadlineMs) {
      return reading("uninstrumented", `fewer than ${g.instrumentedWrites} consecutive weekly writes yet (M-instrument deadline: day ${g.instrumentByDay}): no gate is read`);
    }
    return reading(
      "instrument_fault",
      `fewer than ${g.instrumentedWrites} consecutive weekly writes were made by day ${g.instrumentByDay} (M-instrument; weeks written by then: ${writtenByDeadline.join(", ") || "none"}): ` +
        "fix the instrument, restart the clock (a new d0 with its evidence) and record it — a week written later does not undo it; never a fail",
    );
  }

  if (period === "domain") {
    for (const end of byWeek.keys()) {
      const span = range(end - g.killConsecutiveWeeks + 1, end);
      if (span[0]! < 1 || !span.every((w) => byWeek.has(w))) continue;
      if (span.every((w) => byWeek.get(w)! < g.killWeeklyBelow)) {
        return reading("kill", `weeks ${span[0]}-${end} after the domain deploy each under ${g.killWeeklyBelow} page views (${span.map((w) => byWeek.get(w)).join(", ")})`);
      }
    }
    if (overdue.length) return reading("reader_down", gapNote(overdue));
    return reading("continue", `no ${g.killConsecutiveWeeks} consecutive measured weeks under ${g.killWeeklyBelow} since the domain deploy`);
  }

  // The netlify.app period: the reach read over weeks from..to is made once week `to` has a reading. Until then a
  // missing week is the reader down only once it is overdue.
  const pendingRead = (from: number, to: number, dueDay: number): { verdict: "pause" | "pass" | null; note: string } | { waiting: string } | { readerDown: string } => {
    const missing = range(from, to).filter((w) => !byWeek.has(w));
    if (!missing.length) return reachRead(byWeek, from, to, g);
    const late = missing.filter((w) => overdue.includes(w));
    if (late.length) return { readerDown: `the day-${dueDay} read over weeks ${from}-${to} cannot be made: ${gapNote(late)}` };
    return readable.has(to)
      ? { waiting: `the day-${dueDay} read waits for week(s) ${missing.join(", ")}: readable, not yet read (overdue ${hours(READ_GRACE_MS)}h after the lag)` }
      : { waiting: `the reach read over weeks ${from}-${to} is due on day ${dueDay}, once week ${to} is read (${hours(READ_LAG_MS)}h after it ends)` };
  };
  const afterFinal = (lastWeek: number): string[] => {
    const late = overdue.filter((w) => w > lastWeek);
    return late.length ? [`after the final read no gate of this period waits on later weeks, but ${gapNote(late, false)}`] : [];
  };

  const firstEnd = endWeekOfDay(g.reachDay);
  const first = pendingRead(1, firstEnd, g.reachDay);
  if ("readerDown" in first) return reading("reader_down", first.readerDown);
  if ("waiting" in first) return reading("measuring", first.waiting);
  if (first.verdict) return reading(first.verdict, first.note, ...afterFinal(firstEnd));

  const secondEnd = endWeekOfDay(g.extensionDay);
  const second = pendingRead(firstEnd + 1, secondEnd, g.extensionDay);
  if ("readerDown" in second) return reading("reader_down", first.note, second.readerDown);
  if ("waiting" in second) {
    return reading("extend", first.note, `one extension: the same read over weeks ${firstEnd + 1}-${secondEnd} on day ${g.extensionDay}`, second.waiting);
  }
  if (second.verdict) return reading(second.verdict, first.note, second.note, ...afterFinal(secondEnd));
  // Between again: the one extension is spent and not passed. "Same two outcomes" (floors row 9): not passing is the
  // pause, as under 5, and the line re-enters measuring at the domain deploy (RULING-2026-09-30-documents (c) call 3).
  return reading("pause", first.note, second.note, SECOND_BETWEEN_NOTE, ...afterFinal(secondEnd));
}
