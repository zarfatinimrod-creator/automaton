/**
 * Revenue Colony — the rules-page half of the AI-allowed prize-event intake (research/channel-loop/BOARD-LOOP.md §13;
 * logs/CHANNEL_LOOP.md §4 row 13). AN INSTRUMENT ONLY: it files nothing, enters nothing, opens no account, spends
 * nothing and publishes nothing.
 *
 * WHAT §13 COUNTS. Per calendar quarter, the events that EXPLICITLY permit AI-built entries with no human-authorship
 * attestation, read from each event's own rules page. The mlcontests list (src/revenue/prize-intake.ts) has no field
 * that states it, and a machine must not guess it from prose. So the work is split, and this module is the machine's
 * side of the split only:
 *
 *   - THE JOB (the weekly prize-intake run) lists every event whose deadline, as the list states it, falls in the
 *     current or the next calendar quarter, in research/measurements/ai-allowed-events.md: name, deadline, prize as
 *     stated and the URLs the list gives — plus three columns it NEVER fills: "AI clause (verbatim, with capture
 *     pointer)", "Grade", "Qualifies (yes/no)". It carries a session's cells forward to the same event (THE MERGE: the
 *     row's URL with its name and deadline) and never writes a verdict: no row is graded by a machine, and no "yes"
 *     is ever the job's.
 *   - A READING SESSION renders the pages (the URLs still awaiting a reading are written, in render-watch's urls
 *     syntax, to research/measurements/ai-allowed-events.urls.txt, never appended to research/rendered/urls.txt;
 *     tiktok.com URLs are refused, CHANNEL_LOOP.md §9). The file is never pasted whole: `node scripts/prize-dispatch.mjs`
 *     prints the lines whose site passes the terms gate (a site's terms are read before its first line is fetched,
 *     CHANNEL_LOOP.md §9, the rule of tick 20), and its output is what goes in render-watch.yml's `urls` input;
 *     render-watch's parser refuses a line on a barred host, such as sites.google.com. The session then reads the
 *     captures and fills the three cells.
 *
 * WHAT COUNTS AS GRADED. A row counts only when its qualifies cell is yes or no, its grade is RENDERED, and its clause
 * cell names a render-watch capture: research/rendered/<slug>.txt, .html, .pdf, .json or .xml that exists with its
 * <slug>.meta.json beside it (never urls.txt, README.md or a .meta.json). Anything else a session wrote is
 * "unsettled": counted neither graded nor awaiting, and named in the table with the reason. A quarter's qualifying
 * count is null until at least one of its rows is graded — never inferred, never 0 by default — and while some rows
 * are ungraded it is a floor, not the count.
 *
 * THE MERGE. The list sometimes gives one event twice (same URL, name and deadline); it is tabled once. A listed event
 * takes the cells of the row with its URL, name and deadline; else, where exactly one row and one listed event share
 * it on each side, of the row with its URL and name (a moved deadline) or with its URL and deadline (a renamed event).
 * A URL alone never carries a verdict: the list reuses URLs across tracks and years. Only rows whose deadline is still
 * in the current quarter or later can match; a closed quarter's rows are its record and are never re-matched. A filled
 * row no listed event claimed is kept in its own section, counted in no quarter; an untouched one goes. The table's
 * order depends on the rows alone, never on the list's order.
 *
 * LISTED AGAIN. A row in the window with the URL and name of a row in a closed quarter's record may be that event with
 * a later deadline (counted there already) or a new edition. The job cannot tell, so it names the row and a session
 * decides: grade SAME EVENT (qualifies empty) and it is counted only in the closed quarter; grade it as usual and it is
 * a new edition, counted in its own. Until then it is awaiting, so its quarter is not fully graded.
 *
 * THE KILL (§13: two consecutive quarters under 3 qualifying) is computed only from CLOSED quarters whose every row
 * is graded. Until two such quarters sit side by side it is null — not computable — and never "not met".
 *
 * A TABLE IT CANNOT READ BACK IS NEVER OVERWRITTEN. The table holds a session's work; if a row lost a cell, the
 * header moved or a key is not a URL, buildAiAllowedTable throws and the run writes nothing (prize-intake.ts).
 */

import { createHash } from "node:crypto";

export const AI_ALLOWED_TABLE_FILE = "research/measurements/ai-allowed-events.md";
export const AI_ALLOWED_URLS_FILE = "research/measurements/ai-allowed-events.urls.txt";
/** Where render-watch stores captures; the capture pointer in a clause cell must name a file here. */
export const RENDERED_DIR = "research/rendered";
/** §13's floor: fewer qualifying events than this in two consecutive graded quarters stops the instrument. */
export const QUALIFYING_FLOOR = 3;

/** The table's columns. The first five are the job's; the last three belong to the reading session. */
export const TABLE_COLUMNS = [
  "Event",
  "Deadline",
  "Prize as stated",
  "Event URL (the row's key)",
  "Other URLs the list gives",
  "AI clause (verbatim, with capture pointer)",
  "Grade",
  "Qualifies (yes/no)",
] as const;

export class AiAllowedTableError extends Error {}

// ---------------------------------------------------------------------------------------------------------------------
// Quarters
// ---------------------------------------------------------------------------------------------------------------------

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const QUARTER_RE = /^(\d{4})-Q([1-4])$/;

const isIsoDate = (value: string): boolean => {
  const m = ISO_RE.exec(value);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toISOString().slice(0, 10) === value;
};

/** "2026-09-29" → "2026-Q3". */
export function quarterOf(isoDate: string): string {
  if (!isIsoDate(isoDate)) throw new AiAllowedTableError("a date is not YYYY-MM-DD");
  return `${isoDate.slice(0, 4)}-Q${Math.floor((Number(isoDate.slice(5, 7)) - 1) / 3) + 1}`;
}

/** "2026-Q4" → "2027-Q1". */
export function quarterAfter(quarter: string): string {
  const m = QUARTER_RE.exec(quarter);
  if (!m) throw new AiAllowedTableError("not a quarter");
  const year = Number(m[1]);
  const n = Number(m[2]);
  return n === 4 ? `${year + 1}-Q1` : `${year}-Q${n + 1}`;
}

/** The two quarters a reading lists: the one its UTC day falls in, and the next. */
export function windowQuarters(measuredOn: string): [string, string] {
  const current = quarterOf(measuredOn);
  return [current, quarterAfter(current)];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LAST_DAY = [31, 30, 30, 31];
/** "2026-Q3" → "1 Jul – 30 Sep 2026". */
function quarterSpan(quarter: string): string {
  const [, year, n] = QUARTER_RE.exec(quarter)!;
  const first = (Number(n) - 1) * 3;
  return `1 ${MONTHS[first]} – ${LAST_DAY[Number(n) - 1]} ${MONTHS[first + 2]} ${year}`;
}

// ---------------------------------------------------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------------------------------------------------

/** A URL the table can key on and render-watch can fetch: http(s), and nothing that would break a cell or a line. */
const CLEAN_URL = /^https?:\/\/[^\s<>|`"\\]+$/i;
export const isUsableUrl = (value: unknown): value is string => typeof value === "string" && CLEAN_URL.test(value);

/**
 * tiktok.com and its subdomains: never in a render list or override (logs/CHANNEL_LOOP.md §9 — TikTok's terms ban
 * automated fetching "for any purpose" without written approval). A URL that does not parse is refused too.
 */
export function isRefusedForRender(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/\.$/, "");
    return host === "tiktok.com" || host.endsWith(".tiktok.com");
  } catch {
    return true;
  }
}

/**
 * The render-watch slug for a URL: `prize-` + a readable part + 8 hex of the URL's sha256. Stable across runs, unique
 * per URL, inside render-watch's slug rule (/^[a-z0-9][a-z0-9._-]*$/) and in its own namespace, so a capture here can
 * never overwrite one research/rendered/urls.txt asked for.
 */
export function renderSlug(url: string): string {
  const readable = url
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .replace(/#.*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 8);
  return `prize-${readable ? `${readable}-` : ""}${hash}`;
}

// ---------------------------------------------------------------------------------------------------------------------
// The table
// ---------------------------------------------------------------------------------------------------------------------

/** One list entry with a readable deadline, as the list gives it (src/revenue/prize-intake.ts listedEventsFrom). */
export interface ListedEvent {
  name: string;
  /** The list's deadline, read to YYYY-MM-DD. */
  deadline: string;
  /** The prize as the list states it, or null when it states none. */
  prize: string | null;
  /** The event URL as the list gives it; null when the list gives none. */
  url: string | null;
  /** The list's additional_urls, as given. */
  otherUrls: string[];
}

/** One row as it sits in the table: the job's cells as markdown text, the session's three cells verbatim. */
export interface TableRow {
  name: string;
  deadline: string;
  prize: string;
  url: string;
  otherUrls: string[];
  clause: string;
  grade: string;
  qualifies: string;
  /** Read from the "Kept outside the window" section: stays there until its event is listed in the window again. */
  kept?: true;
}

/** List text → one table cell: whitespace collapsed, pipes escaped, so a third-party string cannot break the row. */
export function cellText(value: string): string {
  return value.replace(/\s+/g, " ").trim().replace(/\|/g, "\\|");
}

/** A table line → its cells, splitting on pipes that are not escaped. */
function splitRow(line: string): string[] {
  const t = line.trim();
  const cells: string[] = [];
  let cell = "";
  for (let i = 1; i < t.length; i += 1) {
    if (t[i] === "\\" && t[i + 1] === "|") {
      cell += "\\|";
      i += 1;
    } else if (t[i] === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += t[i];
    }
  }
  if (cell.trim() !== "") cells.push(cell.trim());
  return cells;
}

/** Sections whose tables hold rows: one per quarter, and the rows kept outside the window. */
const ROW_SECTION = /^## (?:\d{4}-Q[1-4]\b|Kept outside the window\b)/;
const KEPT_SECTION = /^## Kept outside the window\b/;
const NONE = "—";

/**
 * The table the job wrote, with whatever a session added, → its rows. Throws AiAllowedTableError, naming a line number
 * and never quoting a cell, on anything the job did not write: a row with the wrong number of cells, a header that
 * moved, a key that is not <url>, a deadline that is not YYYY-MM-DD.
 */
export function parseAiAllowedTable(markdown: string): TableRow[] {
  const rows: TableRow[] = [];
  let inRows = false;
  let inKept = false;
  let tableLine = 0;
  markdown.split(/\r?\n/).forEach((line, index) => {
    const where = `line ${index + 1}`;
    if (line.startsWith("## ")) {
      inRows = ROW_SECTION.test(line);
      inKept = KEPT_SECTION.test(line);
      tableLine = 0;
      return;
    }
    if (!inRows || !line.trim().startsWith("|")) return;
    tableLine += 1;
    const cells = splitRow(line);
    if (cells.length !== TABLE_COLUMNS.length) {
      throw new AiAllowedTableError(`${where} has ${cells.length} cells, not ${TABLE_COLUMNS.length}`);
    }
    if (tableLine === 1) {
      if (cells.some((c, k) => c !== TABLE_COLUMNS[k])) throw new AiAllowedTableError(`${where}: the table header is not the job's`);
      return;
    }
    if (tableLine === 2) {
      if (!cells.every((c) => /^:?-{3,}:?$/.test(c))) throw new AiAllowedTableError(`${where}: the header's separator row is missing`);
      return;
    }
    const url = /^<([^<>\s]+)>$/.exec(cells[3])?.[1];
    if (!url || !isUsableUrl(url)) throw new AiAllowedTableError(`${where}: the event URL cell is not <url>`);
    if (!isIsoDate(cells[1])) throw new AiAllowedTableError(`${where}: the deadline cell is not a YYYY-MM-DD date`);
    const otherUrls = [...cells[4].matchAll(/<(https?:\/\/[^<>\s]+)>/gi)].map((m) => m[1]);
    rows.push({
      name: cells[0],
      deadline: cells[1],
      prize: cells[2],
      url,
      otherUrls,
      clause: cells[5],
      grade: cells[6],
      qualifies: cells[7],
      ...(inKept ? { kept: true as const } : {}),
    });
  });
  return rows;
}

// ---------------------------------------------------------------------------------------------------------------------
// A row's state: read from the session's three cells, and from nothing else
// ---------------------------------------------------------------------------------------------------------------------

export type RowState =
  | { state: "awaiting" }
  | { state: "graded"; qualifies: boolean }
  | { state: "same-event" }
  | { state: "unsettled"; reasons: string[] };

/** A capture pointer: a file directly under research/rendered/ (no path segments, so no way out of it). */
const POINTER_RE = /research\/rendered\/([A-Za-z0-9][A-Za-z0-9._-]*)/g;
/**
 * A file render-watch writes as a capture: <slug>.<extension> for the extensions its extensionFor gives a readable
 * body (bin is not readable), or the <slug>.txt it extracts from HTML and PDF. Always with <slug>.meta.json beside it.
 */
const CAPTURE_FILE_RE = /^([A-Za-z0-9][A-Za-z0-9._-]*)\.(txt|html|pdf|json|xml)$/;
/** The grade a session writes on a row listed again after a closed quarter, when it is that quarter's event. */
const SAME_EVENT_RE = /^\[?same event\]?$/i;

const many = (n: number, one: string, more: string) => (n === 1 ? one : `${n} ${more}`);

/**
 * Awaiting: the session wrote nothing. Graded: yes or no, grade RENDERED, and a clause whose every capture pointer
 * names a render-watch capture that exists with its meta. Same-event: grade SAME EVENT, qualifies empty, on a row
 * `relisted` (it has the URL and name of a row in an earlier, closed quarter's record). Unsettled: anything else a
 * session wrote, with the reasons.
 */
export function rowState(row: TableRow, captureExists: (relPath: string) => boolean, relisted = false): RowState {
  const clause = row.clause.trim();
  const grade = row.grade.trim();
  const verdict = row.qualifies.trim().toLowerCase();
  if (clause === "" && grade === "" && verdict === "") return { state: "awaiting" };
  const reasons: string[] = [];
  if (SAME_EVENT_RE.test(grade)) {
    if (!relisted) reasons.push("the grade says SAME EVENT, but no row of an earlier, closed quarter has this URL and name");
    if (verdict !== "") reasons.push("a SAME EVENT row leaves the qualifies cell empty: its verdict is the closed quarter's row");
    return reasons.length ? { state: "unsettled", reasons } : { state: "same-event" };
  }
  if (verdict !== "yes" && verdict !== "no") {
    reasons.push(verdict === "" ? "no yes/no in the qualifies cell" : "the qualifies cell is neither yes nor no");
  }
  if (!/^\[?rendered\]?$/i.test(grade)) {
    reasons.push(grade === "" ? "no grade" : "the grade is not RENDERED, so the rules page was not read from a capture");
  }
  const pointers = [...clause.matchAll(POINTER_RE)].map((m) => m[1].replace(/\.+$/, ""));
  if (pointers.length === 0) {
    reasons.push(`the clause cell names no capture under ${RENDERED_DIR}/`);
  } else {
    // urls.txt, README.md, a .meta.json or any other file there is not a capture: it shows no rules page was rendered.
    const slugs = pointers.map((p) => (p === "urls.txt" || p.endsWith(".meta.json") ? null : (CAPTURE_FILE_RE.exec(p)?.[1] ?? null)));
    const notCapture = slugs.filter((slug) => slug === null).length;
    const missing = pointers.filter((p, k) => slugs[k] !== null && !captureExists(`${RENDERED_DIR}/${p}`)).length;
    const noMeta = pointers.filter(
      (p, k) => slugs[k] !== null && captureExists(`${RENDERED_DIR}/${p}`) && !captureExists(`${RENDERED_DIR}/${slugs[k]}.meta.json`),
    ).length;
    if (notCapture) {
      reasons.push(
        `${many(notCapture, "a capture pointer names", "capture pointers name")} a file that is not a render-watch capture ` +
          "(<slug>.txt, .html, .pdf, .json or .xml; never urls.txt, README.md or a .meta.json)",
      );
    }
    if (missing) reasons.push(`${many(missing, "a capture pointer names", "capture pointers name")} no file in ${RENDERED_DIR}/`);
    if (noMeta) {
      reasons.push(`${many(noMeta, "a capture pointer names", "capture pointers name")} a file with no <slug>.meta.json beside it, so render-watch did not capture it`);
    }
  }
  return reasons.length ? { state: "unsettled", reasons } : { state: "graded", qualifies: verdict === "yes" };
}

// ---------------------------------------------------------------------------------------------------------------------
// Tallies and the kill
// ---------------------------------------------------------------------------------------------------------------------

export interface AiAllowedQuarter {
  /** "2026-Q4". */
  quarter: string;
  /** current / next: the reading's window, refreshed from the list; closed: kept as the record of its last reading. */
  position: "current" | "next" | "closed";
  /**
   * Rows in the table for the quarter: events the list placed there (for a closed quarter, at its last reading), less
   * any a session graded SAME EVENT (counted in the closed quarter that holds it already).
   */
  eventsInWindow: number;
  /** Rows a session graded (yes or no, RENDERED, an existing capture pointer). */
  rowsGraded: number;
  /** Graded rows marked yes. Null until at least one row is graded: never inferred, never a default 0. */
  qualifying: number | null;
  /** Rows no session has touched. */
  awaiting: number;
  /** Rows a session started but did not settle (named in the table with the reason). */
  unsettled: number;
}

export interface AiAllowedKill {
  /** null: not computable (no two consecutive closed, fully graded quarters). true: met. false: computable, not met. */
  fired: boolean | null;
  /** The pair that met it, or []. */
  quarters: string[];
}

export interface AiAllowedSummary {
  table: string;
  urlsFile: string;
  /** [current, next] quarter of the reading. */
  window: [string, string];
  /** Every quarter the table holds rows for, plus both window quarters, oldest first. */
  quarters: AiAllowedQuarter[];
  /** Rows a session filled whose event is no longer in the window: kept, counted in no quarter. */
  keptOutsideWindow: number;
  /** Events in the window with no usable URL in the list: not tabled, since a row needs a key. */
  untabled: number;
  /** Rows in the window with the URL and name of a row in a closed quarter's record (see LISTED AGAIN). */
  relisted: number;
  /** Of those, the rows a session graded SAME EVENT: counted in the closed quarter only. */
  sameEvent: number;
  /** URL lines in the urls file. */
  urlsAwaiting: number;
  /** URLs of ungraded rows refused for render (tiktok.com). */
  urlsRefused: number;
  kill: AiAllowedKill;
}

const fullyGraded = (q: AiAllowedQuarter) => q.position === "closed" && q.eventsInWindow > 0 && q.rowsGraded === q.eventsInWindow;

/** §13's kill, from closed, fully graded quarters only; see AiAllowedKill. */
export function computeKill(quarters: readonly AiAllowedQuarter[]): AiAllowedKill {
  const graded = quarters.filter(fullyGraded).sort((a, b) => (a.quarter < b.quarter ? -1 : 1));
  const byName = new Map(graded.map((q) => [q.quarter, q]));
  let computable = false;
  for (const q of graded) {
    const after = byName.get(quarterAfter(q.quarter));
    if (!after) continue;
    computable = true;
    if ((q.qualifying ?? 0) < QUALIFYING_FLOOR && (after.qualifying ?? 0) < QUALIFYING_FLOOR) {
      return { fired: true, quarters: [q.quarter, after.quarter] };
    }
  }
  return { fired: computable ? false : null, quarters: [] };
}

// ---------------------------------------------------------------------------------------------------------------------
// Build: merge the list's window with the table a session may have filled
// ---------------------------------------------------------------------------------------------------------------------

export interface BuildAiAllowedInput {
  /** Every list entry with a readable deadline; the window is chosen here. */
  events: readonly ListedEvent[];
  measuredAt: string;
  measuredOn: string;
  source: string;
  sourceSha256: string;
  /** The table as it stands (null before the first run). */
  existingMarkdown: string | null;
  /** Does this repo-relative path name a file? For capture pointers. */
  captureExists: (relPath: string) => boolean;
}

export interface BuiltAiAllowed {
  markdown: string;
  urls: string;
  summary: AiAllowedSummary;
}

const hasSessionCells = (r: TableRow) => r.clause !== "" || r.grade !== "" || r.qualifies !== "";
const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
/** Deadline, then name, then URL: a total order on the rows, so the table never depends on the list's order. */
const byDeadline = (a: TableRow, b: TableRow) => compare(a.deadline, b.deadline) || compare(a.name, b.name) || compare(a.url, b.url);

/** A row's twins in a closed quarter's record: same URL and name, deadline in an earlier quarter (LISTED AGAIN). */
function earlierTwins(row: TableRow, record: readonly TableRow[]): TableRow[] {
  const quarter = quarterOf(row.deadline);
  return record.filter((c) => c !== row && c.url === row.url && c.name === row.name && quarterOf(c.deadline) < quarter);
}

export function buildAiAllowedTable(input: BuildAiAllowedInput): BuiltAiAllowed {
  const [current, next] = windowQuarters(input.measuredOn);
  const existing = input.existingMarkdown === null ? [] : parseAiAllowedTable(input.existingMarkdown);

  const inWindow = input.events.filter((e) => {
    const q = quarterOf(e.deadline);
    return q === current || q === next;
  });
  const untabled = inWindow.filter((e) => !isUsableUrl(e.url)).length;
  // One row per event: the list sometimes gives an event twice (same URL, name and deadline), and one event is one
  // row, so a session's verdict on it is one verdict and it is counted once. The first entry's prize is kept.
  const byKey = new Map<string, TableRow>();
  for (const e of inWindow) {
    if (!isUsableUrl(e.url)) continue;
    const row: TableRow = {
      name: cellText(e.name) || "(no name in the list)",
      deadline: e.deadline,
      prize: e.prize === null ? NONE : cellText(e.prize) || NONE,
      url: e.url,
      otherUrls: [...new Set(e.otherUrls.filter(isUsableUrl))],
      clause: "",
      grade: "",
      qualifies: "",
    };
    const key = JSON.stringify([row.url, row.name, row.deadline]);
    const twin = byKey.get(key);
    if (twin) twin.otherUrls = [...new Set([...twin.otherUrls, ...row.otherUrls])];
    else byKey.set(key, row);
  }
  const fresh = [...byKey.values()];

  // Match each listed event to the row a session may have filled. First the same event: URL, name and deadline all
  // unchanged. Then one field changed, only where exactly one row and one listed event share the rest: the same URL and
  // name (a moved deadline), then the same URL and deadline (a renamed event). A URL alone never carries a verdict:
  // the list reuses URLs across tracks and across years. Only rows whose deadline is still in the current quarter or
  // later can match: a closed quarter's row is its record, never last year's grade for this year's event.
  const open = existing.map((x) => quarterOf(x.deadline) >= current);
  const used = new Set<number>();
  const match = fresh.map(() => -1);
  const claim = (i: number, j: number) => {
    used.add(j);
    match[i] = j;
  };
  fresh.forEach((row, i) => {
    const j = existing.findIndex((x, k) => open[k] && !used.has(k) && x.url === row.url && x.name === row.name && x.deadline === row.deadline);
    if (j >= 0) claim(i, j);
  });
  const sameName = (a: TableRow, b: TableRow) => a.name === b.name;
  const sameDeadline = (a: TableRow, b: TableRow) => a.deadline === b.deadline;
  for (const same of [sameName, sameDeadline]) {
    fresh.forEach((row, i) => {
      if (match[i] >= 0) return;
      const candidates = existing.flatMap((x, j) => (open[j] && !used.has(j) && x.url === row.url && same(x, row) ? [j] : []));
      const rivals = fresh.filter((y, k) => match[k] < 0 && y.url === row.url && same(y, row)).length;
      if (candidates.length === 1 && rivals === 1) claim(i, candidates[0]);
    });
  }
  const windowRows = fresh.map((row, i) => {
    const old = existing[match[i]];
    return old ? { ...row, clause: old.clause, grade: old.grade, qualifies: old.qualifies } : row;
  });
  // Rows no listed event claimed: a closed quarter's rows stay as its record; a session's work whose event left the
  // window stays kept, outside every count, even after its quarter passes; an untouched row whose event left goes.
  const closedRows: TableRow[] = [];
  const kept: TableRow[] = [];
  existing.forEach((row, j) => {
    if (used.has(j)) return;
    if (row.kept) {
      if (hasSessionCells(row)) kept.push(row);
    } else if (!open[j]) closedRows.push(row);
    else if (hasSessionCells(row)) kept.push({ ...row, kept: true });
  });

  const twins = new Map<TableRow, TableRow[]>();
  for (const row of [...windowRows, ...closedRows]) {
    const t = earlierTwins(row, closedRows);
    if (t.length) twins.set(row, t);
  }
  const states = new Map<TableRow, RowState>();
  for (const row of [...windowRows, ...closedRows, ...kept]) states.set(row, rowState(row, input.captureExists, twins.has(row)));

  const rowsByQuarter = new Map<string, TableRow[]>([
    [current, []],
    [next, []],
  ]);
  for (const row of [...windowRows, ...closedRows]) {
    const q = quarterOf(row.deadline);
    if (!rowsByQuarter.has(q)) rowsByQuarter.set(q, []);
    rowsByQuarter.get(q)!.push(row);
  }
  for (const rows of rowsByQuarter.values()) rows.sort(byDeadline);
  kept.sort(byDeadline);

  const quarters: AiAllowedQuarter[] = [...rowsByQuarter.keys()].sort().map((quarter) => {
    // A SAME EVENT row stays in its quarter's table and is counted only in the closed quarter that holds it.
    const s = rowsByQuarter
      .get(quarter)!
      .map((r) => states.get(r)!)
      .filter((x) => x.state !== "same-event");
    const graded = s.filter((x): x is { state: "graded"; qualifies: boolean } => x.state === "graded");
    return {
      quarter,
      position: quarter === current ? "current" : quarter === next ? "next" : "closed",
      eventsInWindow: s.length,
      rowsGraded: graded.length,
      qualifying: graded.length ? graded.filter((x) => x.qualifies).length : null,
      awaiting: s.filter((x) => x.state === "awaiting").length,
      unsettled: s.filter((x) => x.state === "unsettled").length,
    };
  });
  const kill = computeKill(quarters);

  // The URLs still awaiting a reading: every tabled row no session has graded or settled as SAME EVENT, window
  // quarters first.
  const order = [current, next, ...[...rowsByQuarter.keys()].filter((q) => q !== current && q !== next).sort().reverse()];
  const renderGroups: { quarter: string; row: TableRow; urls: string[] }[] = [];
  const seen = new Set<string>();
  const refused = new Set<string>();
  for (const quarter of order) {
    for (const row of rowsByQuarter.get(quarter)!) {
      const state = states.get(row)!.state;
      if (state === "graded" || state === "same-event") continue;
      const urls: string[] = [];
      for (const url of [row.url, ...row.otherUrls]) {
        if (isRefusedForRender(url)) refused.add(url);
        else if (!seen.has(url)) {
          seen.add(url);
          urls.push(url);
        }
      }
      if (urls.length) renderGroups.push({ quarter, row, urls });
    }
  }

  const relisted = windowRows.filter((r) => twins.has(r)).sort(byDeadline);
  const summary: AiAllowedSummary = {
    table: AI_ALLOWED_TABLE_FILE,
    urlsFile: AI_ALLOWED_URLS_FILE,
    window: [current, next],
    quarters,
    keptOutsideWindow: kept.length,
    untabled,
    relisted: relisted.length,
    sameEvent: relisted.filter((r) => states.get(r)!.state === "same-event").length,
    urlsAwaiting: seen.size,
    urlsRefused: refused.size,
    kill,
  };
  return {
    markdown: renderMarkdown(input, summary, order, rowsByQuarter, kept, states, relisted.map((row) => ({ row, twins: twins.get(row)! }))),
    urls: renderUrls(input, summary, renderGroups),
    summary,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------------------------------------------------

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function tableLines(rows: readonly TableRow[]): string[] {
  const line = (cells: readonly string[]) => `| ${cells.join(" | ")} |`;
  return [
    line(TABLE_COLUMNS),
    line(TABLE_COLUMNS.map(() => "---")),
    ...rows.map((r) =>
      line([
        r.name,
        r.deadline,
        r.prize,
        `<${r.url}>`,
        r.otherUrls.length ? r.otherUrls.map((u) => `<${u}>`).join("<br>") : NONE,
        r.clause,
        r.grade,
        r.qualifies,
      ]),
    ),
  ];
}

const qualifyingCell = (q: AiAllowedQuarter) =>
  q.qualifying === null ? "not counted (no row graded)" : q.rowsGraded === q.eventsInWindow ? String(q.qualifying) : `at least ${q.qualifying} (a floor)`;

function killSentence(kill: AiAllowedKill, quarters: readonly AiAllowedQuarter[]): string {
  if (kill.fired === true) {
    return `MET — ${kill.quarters[0]} and ${kill.quarters[1]}, both closed and fully graded, each counted fewer than ${QUALIFYING_FLOOR} qualifying events`;
  }
  if (kill.fired === false) return `not met (closed, fully graded quarters: ${quarters.filter(fullyGraded).map((q) => q.quarter).join(", ")})`;
  return "not computable yet — no two consecutive closed quarters are fully graded";
}

function renderMarkdown(
  input: BuildAiAllowedInput,
  summary: AiAllowedSummary,
  order: readonly string[],
  rowsByQuarter: ReadonlyMap<string, readonly TableRow[]>,
  kept: readonly TableRow[],
  states: ReadonlyMap<TableRow, RowState>,
  relisted: readonly { row: TableRow; twins: readonly TableRow[] }[],
): string {
  const out: string[] = [];
  out.push("# AI-allowed prize events — the rules-page half of BOARD-LOOP §13");
  out.push("");
  out.push(
    "<!-- Written by the weekly prize-intake job (scripts/prize-intake.ts, src/revenue/ai-allowed-events.ts). " +
      "Everything but the last three columns of each table is rewritten on every run. -->",
  );
  out.push("");
  out.push(
    "**What this counts.** `research/channel-loop/BOARD-LOOP.md` §13 asks, per calendar quarter, how many prize events " +
      "**explicitly permit AI-built entries with no human-authorship attestation**, read from each event's own rules page. " +
      "The mlcontests list has no field that says so, and a machine must not guess it from prose, so the work is split. " +
      "The weekly job lists every event whose deadline, as the list states it, falls in the current or the next quarter, " +
      "with the URLs the list gives; a reading session grades each row from a rendered rules page. The job copies a " +
      "session's cells forward to the same event — the row's URL with the same name and deadline, or with one of the two " +
      "changed where no other row or event shares the rest (a URL alone never carries a verdict) — and never writes a " +
      "verdict itself.",
  );
  out.push("");
  out.push("**How a reading session fills a row.**");
  out.push("");
  out.push(
    `1. Render the URLs in \`${AI_ALLOWED_URLS_FILE}\` whose site's terms allow it: ` +
      "`node scripts/prize-dispatch.mjs` prints the lines whose site passes the terms gate (a site's terms are read " +
      "before its first line is fetched, `logs/CHANNEL_LOOP.md` §9, the rule of tick 20), and its output is what goes " +
      "in render-watch.yml's `urls` input (workflow_dispatch), never the whole file (render-watch's parser refuses a " +
      "line on a barred host, such as sites.google.com). Never append them to `research/rendered/urls.txt`. Each " +
      "capture lands at `research/rendered/<slug>.txt`, the slug beside its URL in that file. tiktok.com URLs are " +
      "never rendered.",
  );
  out.push(
    "2. Read the capture. The list names no rules page as such; if the rules sit on a page the list does not give, its " +
      "URL now appears in a capture, or in the site's own source repository at a pinned commit (ruling R4, 5.10.2026, " +
      "research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md), and can be rendered in a later dispatch, cited to " +
      "that capture or that commit. No URL is guessed.",
  );
  out.push(
    "3. Fill the last three cells. **AI clause**: the clause verbatim, with its capture pointer " +
      "(`research/rendered/<file>`, a line number if you like); for rules that say nothing about AI, say so and still " +
      "give the pointer. **Grade**: `RENDERED` when the clause was read from a capture; otherwise `SNIPPET` or " +
      "`BLOCKED`, with Qualifies left empty. **Qualifies**: `yes` only when the rules explicitly permit AI-built or " +
      "automated entries and require no human-authorship attestation; `no` otherwise, silent rules included. A row " +
      "under *Listed again after a closed quarter* is decided first: `SAME EVENT` in Grade, Qualifies empty, if it is " +
      "that quarter's event with a later deadline; graded as above if it is a new edition. A reading workflow's output " +
      "is applied in two runs: `node scripts/prize-apply-reading.mjs <output.json>` first, a dry run that prints the " +
      "diff and writes nothing, then, once the diff is read, `node scripts/prize-apply-reading.mjs <output.json> " +
      "--apply`, which writes each verifier's three cells to the row whose Event URL is the event's. It refuses a cell " +
      "with an unescaped `|`, a newline, an address or a pointer to no capture, a RENDERED row without yes or no or " +
      "without a capture pointer, and, unless given `--overwrite`, cells that would replace the ones a row already " +
      "holds.",
  );
  out.push(
    "4. Commit to main. `state/colony/prize-intake.json` and the colony report pick the grades up at the next weekly " +
      "run (Wednesdays 06:47 UTC) or a manual dispatch of prize-intake.yml.",
  );
  out.push("");
  out.push(
    "**What counts as graded.** A row counts only with `yes` or `no`, grade `RENDERED`, and a clause cell whose every " +
      "pointer names a render-watch capture: `research/rendered/<slug>.txt`, `.html`, `.pdf`, `.json` or `.xml` that " +
      "exists with its `<slug>.meta.json` beside it (never `urls.txt`, `README.md` or a `.meta.json`). Anything else a session wrote is *unsettled*: counted neither graded " +
      "nor awaiting, and listed at the end with the reason. A quarter's qualifying count stays empty (null) until at " +
      "least one of its rows is graded, and while some rows are ungraded it is a floor, not the count.",
  );
  out.push("");
  out.push(
    `**The kill.** §13 stops this instrument after two consecutive quarters under ${QUALIFYING_FLOOR} qualifying events. ` +
      "It is computed only from closed quarters whose every row is graded; a quarter with an ungraded row never counts " +
      "toward it. A closed quarter's rows are kept below as the record of its last reading.",
  );
  out.push("");
  out.push(`Reading: ${input.measuredAt} (UTC day ${input.measuredOn}) of <${input.source}>, sha256 \`${input.sourceSha256}\`.`);
  out.push("");
  out.push("## Summary");
  out.push("");
  out.push("| Quarter | Deadlines | Position | Events | Graded | Qualifying | Awaiting | Unsettled |");
  out.push("|---|---|---|---|---|---|---|---|");
  for (const q of summary.quarters) {
    out.push(
      `| ${q.quarter} | ${quarterSpan(q.quarter)} | ${q.position} | ${q.eventsInWindow} | ${q.rowsGraded} | ${qualifyingCell(q)} | ${q.awaiting} | ${q.unsettled} |`,
    );
  }
  out.push("");
  out.push(`Kill: ${killSentence(summary.kill, summary.quarters)}.`);
  out.push("");
  out.push(
    `URLs awaiting a render: ${summary.urlsAwaiting} in \`${AI_ALLOWED_URLS_FILE}\`` +
      (summary.urlsRefused ? ` (${plural(summary.urlsRefused, "tiktok.com URL", "tiktok.com URLs")} refused, never rendered)` : "") +
      ".",
  );
  if (summary.untabled) {
    out.push("");
    out.push(`${plural(summary.untabled, "event in the window has", "events in the window have")} no usable URL in the list and ${summary.untabled === 1 ? "is" : "are"} not tabled.`);
  }
  if (summary.keptOutsideWindow) {
    out.push("");
    out.push(`${plural(summary.keptOutsideWindow, "row a session filled is", "rows a session filled are")} kept outside the window, in no quarter's count.`);
  }
  if (summary.relisted) {
    out.push("");
    out.push(
      `${plural(summary.relisted, "row in the window has", "rows in the window have")} the URL and name of a row in a closed ` +
        `quarter's record (${summary.sameEvent} graded SAME EVENT); see *Listed again after a closed quarter*.`,
    );
  }

  for (const quarter of order) {
    const rows = rowsByQuarter.get(quarter)!;
    const label = quarter === summary.window[0] ? "current quarter" : quarter === summary.window[1] ? "next quarter" : "closed; kept as the record";
    out.push("");
    out.push(`## ${quarter} — deadlines ${quarterSpan(quarter)} (${label})`);
    out.push("");
    if (rows.length === 0) out.push("No event on the list has a deadline in this quarter.");
    else out.push(...tableLines(rows));
  }

  if (kept.length) {
    out.push("");
    out.push("## Kept outside the window — rows a session filled whose event is no longer in it");
    out.push("");
    out.push(
      "No listed event in the current or the next quarter is these rows' event any more (a URL changed, the event was " +
        "removed, its deadline moved out, or its name and deadline both changed, which makes it a different event). They " +
        "are kept so no reading is lost, and counted in no quarter. If the event comes back under the same URL with the " +
        "same name or the same deadline, while its deadline has not passed into a closed quarter, its cells go with it.",
    );
    out.push("");
    out.push(...tableLines(kept));
  }

  if (relisted.length) {
    out.push("");
    out.push("## Listed again after a closed quarter");
    out.push("");
    out.push(
      "Each row below has the URL and the name of a row in a closed quarter's record. The list cannot say whether it is " +
        "that event with a later deadline (an extension, counted in the closed quarter already) or a new edition with " +
        "its own rules, so the job does not decide. A reading session does: `SAME EVENT` in its Grade cell, Qualifies " +
        "empty, if it is the closed quarter's event — the row stays in its quarter's table and is counted only in the " +
        "closed quarter; graded as usual if it is a new edition — then it is counted in its own quarter. Until then it " +
        "is awaiting, so its quarter is not fully graded.",
    );
    out.push("");
    for (const { row, twins } of relisted) {
      const state = states.get(row)!.state;
      const decided =
        state === "same-event"
          ? "graded SAME EVENT: counted in the closed quarter only"
          : state === "graded"
            ? "graded as a new edition: counted in its own quarter"
            : "not decided yet";
      const record = twins.map((t) => `${quarterOf(t.deadline)} (deadline ${t.deadline})`).join(", ");
      out.push(`- ${row.deadline} · ${row.name} (<${row.url}>): in the record of ${record}. ${decided[0].toUpperCase()}${decided.slice(1)}.`);
    }
  }

  const unsettled = [...order.flatMap((q) => rowsByQuarter.get(q)!), ...kept]
    .map((row) => ({ row, state: states.get(row)! }))
    .filter((x): x is { row: TableRow; state: { state: "unsettled"; reasons: string[] } } => x.state.state === "unsettled");
  if (unsettled.length) {
    out.push("");
    out.push("## Rows a session started but did not settle");
    out.push("");
    for (const { row, state } of unsettled) out.push(`- ${row.deadline} · ${row.name} (<${row.url}>): ${state.reasons.join("; ")}.`);
  }
  out.push("");
  return out.join("\n");
}

function renderUrls(input: BuildAiAllowedInput, summary: AiAllowedSummary, groups: readonly { quarter: string; row: TableRow; urls: string[] }[]): string {
  const out = [
    `# ${AI_ALLOWED_URLS_FILE} — written by the weekly prize-intake job; do not edit by hand.`,
    "#",
    "# render-watch's urls syntax (research/rendered/urls.txt): one URL per line, a slug after a TAB, a line starting",
    `# with # is a comment. It holds the URLs of every row of ${AI_ALLOWED_TABLE_FILE}`,
    "# that no session has graded yet. Never paste the whole file: `node scripts/prize-dispatch.mjs` prints the lines",
    "# whose site passes the terms gate (a site's terms are read before its first line is fetched, logs/CHANNEL_LOOP.md",
    "# §9, the rule of tick 20), and its output is what goes in render-watch.yml's `urls` input (workflow_dispatch);",
    "# render-watch's parser refuses a line on a barred host, such as sites.google.com. Each capture lands at",
    "# research/rendered/<slug>.txt, the pointer a session cites in the table.",
    "# This is NOT research/rendered/urls.txt, and nothing here is ever appended to it.",
    "#",
    `# Every URL is verbatim from the mlcontests list (read ${input.measuredAt}, sha256 ${input.sourceSha256.slice(0, 16)}…)`,
    "# and appears verbatim in its event's row of the table. No rules-page URL is guessed.",
    "# tiktok.com URLs are refused (logs/CHANNEL_LOOP.md §9: no tiktok.com URL in any render list or override)" +
      (summary.urlsRefused ? `: ${summary.urlsRefused} refused.` : "."),
  ];
  if (groups.length === 0) out.push("", "# Nothing awaits a render: every tabled row is graded.");
  for (const g of groups) {
    out.push("", `# ${g.quarter} · ${g.row.deadline} · ${g.row.name.replace(/\\\|/g, "|")}`);
    for (const url of g.urls) out.push(`${url}\t${renderSlug(url)}`);
  }
  out.push("");
  return out.join("\n");
}

// ---------------------------------------------------------------------------------------------------------------------
// Reading it back: state/colony/prize-intake.json → a check, and a sentence for the colony report
// ---------------------------------------------------------------------------------------------------------------------

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;

/** The reason a stored summary is not one buildAiAllowedTable could have produced for this reading day, or null. */
export function problemWithAiAllowed(value: unknown, measuredOn: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return "aiAllowed is not an object";
  const s = value as Record<string, unknown>;
  if (s.table !== AI_ALLOWED_TABLE_FILE || s.urlsFile !== AI_ALLOWED_URLS_FILE) return "aiAllowed names other files";
  for (const key of ["keptOutsideWindow", "untabled", "relisted", "sameEvent", "urlsAwaiting", "urlsRefused"]) {
    if (!isCount(s[key])) return `aiAllowed.${key} is not a count`;
  }
  if ((s.sameEvent as number) > (s.relisted as number)) return "aiAllowed.sameEvent is more than the rows listed again";
  if (typeof measuredOn !== "string" || !isIsoDate(measuredOn)) return "no usable measuredOn for the quarters";
  const window = windowQuarters(measuredOn);
  if (!Array.isArray(s.window) || s.window.length !== 2 || s.window[0] !== window[0] || s.window[1] !== window[1]) {
    return "aiAllowed.window is not this reading's quarters";
  }
  if (!Array.isArray(s.quarters)) return "aiAllowed.quarters is not a list";
  const seen = new Set<string>();
  for (const raw of s.quarters as unknown[]) {
    if (typeof raw !== "object" || raw === null) return "a quarter is not an object";
    const q = raw as Record<string, unknown>;
    if (typeof q.quarter !== "string" || !QUARTER_RE.test(q.quarter) || seen.has(q.quarter)) return "a quarter is unnamed or repeated";
    seen.add(q.quarter);
    const position = q.quarter === window[0] ? "current" : q.quarter === window[1] ? "next" : q.quarter < window[0] ? "closed" : null;
    if (position === null || q.position !== position) return `${q.quarter} has the wrong position`;
    for (const key of ["eventsInWindow", "rowsGraded", "awaiting", "unsettled"]) if (!isCount(q[key])) return `${q.quarter}.${key} is not a count`;
    const n = q as unknown as AiAllowedQuarter;
    if (n.rowsGraded + n.awaiting + n.unsettled !== n.eventsInWindow) return `${q.quarter}: graded, awaiting and unsettled rows do not add up to its events`;
    if (n.rowsGraded === 0 ? q.qualifying !== null : !isCount(q.qualifying) || n.qualifying! > n.rowsGraded) {
      return `${q.quarter}: the qualifying count is not what its graded rows allow`;
    }
  }
  if (!seen.has(window[0]) || !seen.has(window[1])) return "aiAllowed.quarters lacks a window quarter";
  const kill = s.kill as Record<string, unknown> | null;
  const expected = computeKill(s.quarters as AiAllowedQuarter[]);
  if (
    typeof kill !== "object" ||
    kill === null ||
    kill.fired !== expected.fired ||
    !Array.isArray(kill.quarters) ||
    kill.quarters.join(",") !== expected.quarters.join(",")
  ) {
    return "aiAllowed.kill is not what the quarters support";
  }
  return null;
}

function describeQuarter(q: AiAllowedQuarter): string {
  const qualifying =
    q.qualifying === null
      ? "qualifying not counted (no row graded)"
      : q.rowsGraded === q.eventsInWindow
        ? `${q.qualifying} qualifying`
        : `at least ${q.qualifying} qualifying (${q.eventsInWindow - q.rowsGraded} not yet graded)`;
  return (
    `${q.quarter} (${q.position}): ${plural(q.eventsInWindow, "event", "events")}, ${q.rowsGraded} graded, ${qualifying}, ` +
    `${q.awaiting} awaiting a reading` +
    (q.unsettled ? `, ${q.unsettled} started but not settled` : "")
  );
}

/** One sentence for the colony report. Assumes problemWithAiAllowed passed. */
export function describeAiAllowed(s: AiAllowedSummary): string {
  const kill =
    s.kill.fired === true
      ? `MET — ${s.kill.quarters[0]} and ${s.kill.quarters[1]}; BOARD-LOOP §13 stops this instrument and records the Devpost deferral as closed on evidence.`
      : s.kill.fired === false
        ? "not met."
        : "not computable yet.";
  return (
    ` Rules pages (${AI_ALLOWED_TABLE_FILE}, graded by a reading session, never by the job): ` +
    `${s.quarters.map(describeQuarter).join("; ")}. ` +
    `${plural(s.urlsAwaiting, "URL awaits", "URLs await")} a render (${AI_ALLOWED_URLS_FILE}; node scripts/prize-dispatch.mjs prints the lines whose site passes the terms gate, for render-watch's urls input)` +
    (s.urlsRefused ? `; ${plural(s.urlsRefused, "tiktok.com URL", "tiktok.com URLs")} refused` : "") +
    ". " +
    (s.keptOutsideWindow ? `${plural(s.keptOutsideWindow, "filled row is", "filled rows are")} kept outside the window. ` : "") +
    (s.untabled ? `${plural(s.untabled, "event in the window has", "events in the window have")} no usable URL and ${s.untabled === 1 ? "is" : "are"} not tabled. ` : "") +
    (s.relisted
      ? `${plural(s.relisted, "row in the window is", "rows in the window are")} listed again after a closed quarter (same URL and name), ` +
        `${s.sameEvent} graded SAME EVENT and counted there only. `
      : "") +
    `Kill (two consecutive closed, fully graded quarters under ${QUALIFYING_FLOOR} qualifying): ${kill}`
  );
}
