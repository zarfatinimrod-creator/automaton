/**
 * Revenue Colony — the AI-allowed prize-event intake (logs/CHANNEL_LOOP.md §4 row 13). AN INSTRUMENT ONLY.
 *
 * Once a week `.github/workflows/prize-intake.yml` runs `scripts/prize-intake.ts`, which makes ONE unauthenticated GET
 * of the mlcontests list (PRIZE_INTAKE_SOURCE, a public JSON file on GitHub) and commits NUMBERS ONLY to
 * `state/colony/prize-intake.json`. The tick reads that file into one line of the colony report. It files nothing,
 * enters nothing, opens no account and spends nothing; no line and no KPI hangs on it.
 *
 * WHAT THE LIST SUPPORTS, AND WHAT IT DOES NOT. Each entry carries a name, URL, tags, a deadline, a launch date, a
 * prize string, a platform, a sponsor and, on some entries, a registration deadline and a free-text note
 * (KNOWN_FIELDS — every key seen in the 397 entries read on 29.9.2026). NONE of them states whether AI-generated or
 * automated solutions are allowed or forbidden. Tags such as `llm` or `agents` name the task's subject, not a
 * permission, and a note is free text. So the reader counts what the fields state — open by deadline, registration
 * closed, not yet launched, a stated dollar prize, a note present — and writes the AI-rule counts as `null`:
 * unmeasured, never 0, and never inferred from tags or prose. `aiRuleFieldInSource` is `false` only while every key
 * the list carries is in KNOWN_FIELDS. A key outside KNOWN_FIELDS is counted (`unknownFields`) but its values are not
 * read, so the moment one appears `aiRuleFieldInSource` becomes `null` — unknown, since the new key may state an AI
 * rule — and the report asks for it to be read by hand. It is never `true`: this reader reads no AI rule.
 *
 * NEVER A FAKE ZERO. An HTTP status other than 200, a redirect, a body that is not the list, an empty list, or a list
 * where more than half the stated deadlines, prizes, launch dates or registration deadlines do not parse (the format
 * moved) writes NOTHING and exits 1, so the weekly job goes red and last week's file stays. Below that threshold, an
 * open entry whose prize or date is stated but unreadable is counted as such (`openPrizeUnparsed`,
 * `openLaunchedUnparsed`, `openRegistrationDeadlineUnparsed`) and named in the report, so a 0 beside it is not read as
 * a real zero. "Open" is judged by calendar date: a deadline on or after the reading's UTC day is open (the list gives
 * dates without a time or zone, so the deadline day itself counts as open).
 *
 * BOTH HALVES OF research/channel-loop/BOARD-LOOP.md §13. The number §13 exists for is the count of events with
 * deadlines IN THE QUARTER whose rendered RULES PAGES explicitly permit AI-built entries (no human-authorship
 * attestation), killed after two consecutive quarters under 3. This module is the list-count half (the counts above,
 * open entries from the reading day on). The same weekly run also writes the rules-page half through
 * src/revenue/ai-allowed-events.ts: research/measurements/ai-allowed-events.md, a table of the events whose deadline
 * falls in the current or next calendar quarter for a reading session to grade from rendered rules pages; the URLs
 * still awaiting a reading, in render-watch's urls syntax; and per-quarter counts (`aiAllowed`) in the state file. The
 * job grades nothing: a quarter's qualifying count stays null until a session grades a row, and the kill is computed
 * only from closed, fully graded quarters. The number therefore exists only as far as sessions read rules pages. The
 * quarterly read in CHANNEL_LOOP.md's measurement calendar is the main thread's to add; nothing here writes that file.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  AI_ALLOWED_TABLE_FILE,
  AI_ALLOWED_URLS_FILE,
  AiAllowedTableError,
  buildAiAllowedTable,
  describeAiAllowed,
  problemWithAiAllowed,
  type AiAllowedSummary,
  type ListedEvent,
} from "./ai-allowed-events.js";

export const PRIZE_INTAKE_SOURCE = "https://raw.githubusercontent.com/mlcontests/mlcontests.github.io/master/competitions.json";
export const PRIZE_INTAKE_FILE = join("state", "colony", "prize-intake.json");
/** Weekly job: a reading older than a week and a day means it missed a run. */
export const PRIZE_INTAKE_STALE_DAYS = 8;
const WORKFLOW = ".github/workflows/prize-intake.yml";

/** Every key the 397 entries carried on 29.9.2026 (src/__tests__/fixtures/mlcontests-competitions-trimmed.meta.json). */
export const KNOWN_FIELDS: readonly string[] = [
  "name",
  "url",
  "tags",
  "deadline",
  "launched",
  "prize",
  "platform",
  "sponsor",
  "additional_urls",
  "added",
  "registration-deadline",
  "conference",
  "conference_year",
  "conference-year",
  "data-size",
  "note",
  "additional_prizes",
  "end-date",
];
const KNOWN = new Set(KNOWN_FIELDS);

export class PrizeIntakeError extends Error {}

export interface PrizeIntakeMeasurement {
  measuredAt: string;
  /** The UTC calendar day "open" is judged against. */
  measuredOn: string;
  source: string;
  sourceSha256: string;
  sourceBytes: number;
  /** Entries in the list. */
  listed: number;
  /** Entries whose deadline does not parse: counted neither open nor closed. */
  undatable: number;
  /** Deadline on or after measuredOn. */
  open: number;
  /** Open, with a stated registration deadline already past. */
  openRegistrationClosed: number;
  /** Open, with a stated launch date still in the future. */
  openNotYetLaunched: number;
  /** Open, with a prize stated as a plain dollar amount ("$14,925"). */
  openWithStatedUsdPrize: number;
  /** The sum of those stated amounts — the list's figures, all places combined, not an expected payout. */
  openStatedUsdPrizeTotal: number;
  /** Open, with a prize stated but not as a plain dollar amount: not read, so in neither of the two counts above. */
  openPrizeUnparsed: number;
  /** Open, with a launch date stated but unreadable: counted neither launched nor not yet launched. */
  openLaunchedUnparsed: number;
  /** Open, with a registration deadline stated but unreadable: counted neither closed nor open for registration. */
  openRegistrationDeadlineUnparsed: number;
  /** Open, carrying a free-text note (read by hand; never parsed). */
  openWithNote: number;
  /** Distinct keys outside KNOWN_FIELDS: counted, their values never read. */
  unknownFields: number;
  /**
   * false: every key the list carries is in KNOWN_FIELDS, and none of those states whether AI or automated solutions
   * are allowed. null: the list carries keys this reader does not know (unknownFields > 0), so whether one of them
   * states an AI rule is unknown until read by hand. Never true: this reader reads no AI rule.
   */
  aiRuleFieldInSource: false | null;
  /** Always null — unmeasured, not zero. The list states no AI rule; the rules-page count is in aiAllowed. */
  openAiAllowedStated: null;
  openAiNotForbiddenStated: null;
  /**
   * The rules-page half (src/revenue/ai-allowed-events.ts): per-quarter counts of the table a reading session grades.
   * Written by runPrizeIntake; absent from summarisePrizeIntake and from readings made before the table existed.
   */
  aiAllowed?: AiAllowedSummary;
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, april: 4, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/** "2 Nov 2026" / "07 Dec 2026" / "1 September 2026" → "2026-11-02"; anything else → null. */
export function parseListDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const m = /^(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(value.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = MONTHS[m[2].toLowerCase()];
  const year = Number(m[3]);
  if (!month || day < 1) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

/** "$14,925" → 14925. Another currency, a range, "$10k", prose or a missing prize → null. */
export function parseStatedUsd(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const m = /^\$(\d{1,3}(?:,\d{3})*|\d+)$/.exec(value.trim());
  if (!m) return null;
  const amount = Number(m[1].replace(/,/g, ""));
  return amount > 0 ? amount : null;
}

/** A value the list states: present, not null, and not an empty or whitespace-only string. */
const stated = (value: unknown): boolean =>
  value !== undefined && value !== null && !(typeof value === "string" && value.trim() === "");

/** The fields besides the deadline whose parsed values feed a count, guarded against format drift like the deadline. */
const PARSED_FIELDS: readonly (readonly [string, (value: unknown) => unknown])[] = [
  ["prize", parseStatedUsd],
  ["launched", parseListDate],
  ["registration-deadline", parseListDate],
];

/** The list's text → the numbers. Throws PrizeIntakeError on anything that is not the list. */
export function summarisePrizeIntake(bodyText: string, measuredAtIso: string): PrizeIntakeMeasurement {
  const at = Date.parse(measuredAtIso);
  if (Number.isNaN(at)) throw new PrizeIntakeError("measuredAt is not a date");
  const today = new Date(at).toISOString().slice(0, 10);

  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    throw new PrizeIntakeError("the body is not JSON");
  }
  const data = (body as { data?: unknown } | null)?.data;
  if (typeof body !== "object" || body === null || !Array.isArray(data)) throw new PrizeIntakeError("the body has no data array");
  if (data.length === 0) throw new PrizeIntakeError("the data array is empty");

  const unknown = new Set<string>();
  let undatable = 0;
  const entries: Record<string, unknown>[] = [];
  const open: Record<string, unknown>[] = [];
  data.forEach((raw, i) => {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new PrizeIntakeError(`entry ${i} is not an object`);
    const e = raw as Record<string, unknown>;
    entries.push(e);
    for (const key of Object.keys(e)) if (!KNOWN.has(key)) unknown.add(key);
    const deadline = parseListDate(e.deadline);
    if (deadline === null) undatable += 1;
    else if (deadline >= today) open.push(e);
  });
  if (undatable * 2 > data.length) {
    throw new PrizeIntakeError(`${undatable} of ${data.length} deadlines do not parse; the list's format has moved`);
  }
  // The same guard for every other parsed field, over the values the list states: a format change must fail the
  // reading, not be committed as "0 with a stated USD prize" or "0 with registration closed".
  for (const [field, parse] of PARSED_FIELDS) {
    const values = entries.map((e) => e[field]).filter(stated);
    const unparsed = values.filter((v) => parse(v) === null).length;
    if (unparsed * 2 > values.length) {
      throw new PrizeIntakeError(`${unparsed} of ${values.length} stated ${field} values do not parse; the list's format has moved`);
    }
  }
  const unparsedAmongOpen = (field: string, parse: (value: unknown) => unknown) =>
    open.filter((e) => stated(e[field]) && parse(e[field]) === null).length;

  const prizes = open.map((e) => parseStatedUsd(e.prize)).filter((p): p is number => p !== null);
  const before = (value: unknown, cmp: (d: string) => boolean) => {
    const d = parseListDate(value);
    return d !== null && cmp(d);
  };
  return {
    measuredAt: measuredAtIso,
    measuredOn: today,
    source: PRIZE_INTAKE_SOURCE,
    sourceSha256: createHash("sha256").update(bodyText).digest("hex"),
    sourceBytes: Buffer.byteLength(bodyText),
    listed: data.length,
    undatable,
    open: open.length,
    openRegistrationClosed: open.filter((e) => before(e["registration-deadline"], (d) => d < today)).length,
    openNotYetLaunched: open.filter((e) => before(e.launched, (d) => d > today)).length,
    openWithStatedUsdPrize: prizes.length,
    openStatedUsdPrizeTotal: prizes.reduce((a, b) => a + b, 0),
    openPrizeUnparsed: unparsedAmongOpen("prize", parseStatedUsd),
    openLaunchedUnparsed: unparsedAmongOpen("launched", parseListDate),
    openRegistrationDeadlineUnparsed: unparsedAmongOpen("registration-deadline", parseListDate),
    openWithNote: open.filter((e) => typeof e.note === "string" && e.note.trim() !== "").length,
    unknownFields: unknown.size,
    // False only when every key is known; a key this reader does not read may state an AI rule, so that is unknown.
    aiRuleFieldInSource: unknown.size === 0 ? false : null,
    openAiAllowedStated: null,
    openAiNotForbiddenStated: null,
  };
}

/**
 * The list's text → every entry whose deadline reads, with its name, prize and URLs exactly as the list gives them:
 * the input of the rules-page table. Call it on a body summarisePrizeIntake accepted.
 */
export function listedEventsFrom(bodyText: string): ListedEvent[] {
  const data = (JSON.parse(bodyText) as { data: Record<string, unknown>[] }).data;
  const events: ListedEvent[] = [];
  for (const e of data) {
    const deadline = parseListDate(e.deadline);
    if (deadline === null) continue;
    events.push({
      name: typeof e.name === "string" ? e.name : stated(e.name) ? String(e.name) : "",
      deadline,
      prize: stated(e.prize) ? String(e.prize) : null,
      url: typeof e.url === "string" ? e.url : null,
      otherUrls: Array.isArray(e.additional_urls) ? e.additional_urls.filter((u): u is string => typeof u === "string") : [],
    });
  }
  return events;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
/** 861225 → "861,225", without depending on the runtime's locale data. */
const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const headline = (m: PrizeIntakeMeasurement) => `${m.open} open of ${m.listed} listed`;
const aiRuleShort = (m: PrizeIntakeMeasurement) =>
  m.aiRuleFieldInSource === false
    ? "not stated by the list"
    : `unknown (${plural(m.unknownFields, "new field", "new fields")} to read by hand)`;

export interface RunPrizeIntakeOptions {
  /**
   * The directory the three files are read from and written under (default: the cwd): PRIZE_INTAKE_FILE,
   * AI_ALLOWED_TABLE_FILE and AI_ALLOWED_URLS_FILE, plus research/rendered/ for the capture pointers a session cites.
   */
  root?: string;
  nowIso?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

/** Is this root-relative path a file? */
const isFileUnder = (root: string, rel: string): boolean => {
  try {
    return statSync(join(root, rel)).isFile();
  } catch {
    return false;
  }
};

/** One GET of the source, then all three files or nothing. Never throws. */
export async function runPrizeIntake(options: RunPrizeIntakeOptions = {}): Promise<{ code: 0 | 1; message: string }> {
  const root = options.root ?? ".";
  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(PRIZE_INTAKE_SOURCE, {
      method: "GET",
      // The one host named in the loop row; a redirect elsewhere is a failure, not a reading.
      redirect: "error",
      headers: { Accept: "application/json", "User-Agent": "colony-prize-intake" },
      signal: AbortSignal.timeout(options.timeoutMs ?? 60_000),
    });
    if (response.status !== 200) throw new PrizeIntakeError(`HTTP ${response.status}`);
    const text = await response.text();
    const m = summarisePrizeIntake(text, options.nowIso ?? new Date().toISOString());

    // The rules-page half. The table holds a reading session's cells, so one the job cannot read back is never
    // overwritten: the run fails, writes nothing, and the red job names the line to fix.
    const tablePath = join(root, AI_ALLOWED_TABLE_FILE);
    let built: ReturnType<typeof buildAiAllowedTable>;
    try {
      built = buildAiAllowedTable({
        events: listedEventsFrom(text),
        measuredAt: m.measuredAt,
        measuredOn: m.measuredOn,
        source: m.source,
        sourceSha256: m.sourceSha256,
        existingMarkdown: existsSync(tablePath) ? readFileSync(tablePath, "utf8") : null,
        captureExists: (rel) => isFileUnder(root, rel),
      });
    } catch (error) {
      if (!(error instanceof AiAllowedTableError)) throw error;
      throw new PrizeIntakeError(
        `the rules-page table ${AI_ALLOWED_TABLE_FILE} cannot be read back (${error.message}); it holds a reading session's cells, so it is not overwritten`,
      );
    }
    const reading: PrizeIntakeMeasurement = { ...m, aiAllowed: built.summary };
    const outputs: [string, string][] = [
      [join(root, PRIZE_INTAKE_FILE), `${JSON.stringify(reading, null, 2)}\n`],
      [tablePath, built.markdown],
      [join(root, AI_ALLOWED_URLS_FILE), built.urls],
    ];
    // Every file is written beside its target first and only then renamed into place, so a write that fails part-way
    // leaves last week's three files as they were.
    for (const [file, body] of outputs) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(`${file}.tmp`, body);
    }
    for (const [file] of outputs) renameSync(`${file}.tmp`, file);

    const window = built.summary.quarters.filter((q) => q.position !== "closed");
    const rows = window.reduce((a, q) => a + q.eventsInWindow, 0);
    const graded = window.reduce((a, q) => a + q.rowsGraded, 0);
    return {
      code: 0,
      message:
        `Prize intake: ${headline(m)} (${m.openRegistrationClosed} registration closed, ${m.openWithStatedUsdPrize} with a stated USD prize); ` +
        `AI rule: ${aiRuleShort(m)}. Rules pages: ${graded} of ${rows} rows in the window graded; ${built.summary.urlsAwaiting} URLs await a render. ` +
        `Wrote ${PRIZE_INTAKE_FILE}, ${AI_ALLOWED_TABLE_FILE} and ${AI_ALLOWED_URLS_FILE} under ${root}.`,
    };
  } catch (error) {
    const why = error instanceof Error ? error.message : String(error);
    return { code: 1, message: `Prize intake NOT measured: ${why}. Nothing was written.` };
  }
}

export interface PrizeIntakeReading {
  file: string;
  status: "absent" | "read" | "invalid";
  line: string;
}

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;
const COUNTS = [
  "sourceBytes",
  "listed",
  "undatable",
  "open",
  "openRegistrationClosed",
  "openNotYetLaunched",
  "openWithStatedUsdPrize",
  "openStatedUsdPrizeTotal",
  "openPrizeUnparsed",
  "openLaunchedUnparsed",
  "openRegistrationDeadlineUnparsed",
  "openWithNote",
  "unknownFields",
] as const;

/** The reason a file is not a reading this module wrote, or null. Never quotes the offending value. */
function problemWith(d: Record<string, unknown>): string | null {
  if (typeof d.measuredAt !== "string" || Number.isNaN(Date.parse(d.measuredAt))) return "no usable measuredAt";
  for (const key of COUNTS) if (!isCount(d[key])) return `${key} is not a count`;
  const n = d as unknown as PrizeIntakeMeasurement;
  if (n.open + n.undatable > n.listed) return "more open and undatable than listed";
  for (const key of [
    "openRegistrationClosed",
    "openNotYetLaunched",
    "openWithStatedUsdPrize",
    "openPrizeUnparsed",
    "openLaunchedUnparsed",
    "openRegistrationDeadlineUnparsed",
    "openWithNote",
  ] as const) {
    if (n[key] > n.open) return `${key} exceeds open`;
  }
  if (n.openWithStatedUsdPrize + n.openPrizeUnparsed > n.open) return "more open prizes, read and unread, than open";
  // false exactly when every key was known, null exactly when one was not; never true — this reader reads no AI rule.
  if (d.aiRuleFieldInSource !== (n.unknownFields === 0 ? false : null)) return "aiRuleFieldInSource does not match unknownFields";
  if (d.openAiAllowedStated !== null || d.openAiNotForbiddenStated !== null) return "it carries an AI-rule count this reader never produces";
  // The rules-page counts: absent from a reading made before the table existed; when present, they must be what the
  // table could have produced — a qualifying count only beside a graded row, a kill only where the quarters support it.
  if (d.aiAllowed !== undefined) return problemWithAiAllowed(d.aiAllowed, d.measuredOn);
  return null;
}

const utcMinute = (iso: string): string => `${new Date(iso).toISOString().slice(0, 16).replace("T", " ")} UTC`;

/** state/colony/prize-intake.json → one line of the report. Never a blocker: nothing depends on this instrument. */
export function readPrizeIntake(file: string = PRIZE_INTAKE_FILE, nowMs: number = Date.now()): PrizeIntakeReading {
  if (!existsSync(file)) {
    return {
      file,
      status: "absent",
      line: `Prize-event intake (instrument only): no reading yet — the weekly job ${WORKFLOW} has not committed one.`,
    };
  }
  const invalid = (detail: string): PrizeIntakeReading => ({
    file,
    status: "invalid",
    line: `Prize-event intake: the file ${file} is unusable (${detail}); its numbers are not shown.`,
  });
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return invalid("not JSON");
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return invalid("not a JSON object");
  const problem = problemWith(data as Record<string, unknown>);
  if (problem) return invalid(problem);
  const m = data as PrizeIntakeMeasurement;

  const ageDays = Math.max(0, (nowMs - Date.parse(m.measuredAt)) / 86_400_000);
  const unread = [
    m.openPrizeUnparsed ? `${plural(m.openPrizeUnparsed, "prize", "prizes")} not stated as a plain $ amount` : "",
    m.openLaunchedUnparsed ? plural(m.openLaunchedUnparsed, "launch date", "launch dates") : "",
    m.openRegistrationDeadlineUnparsed ? plural(m.openRegistrationDeadlineUnparsed, "registration deadline", "registration deadlines") : "",
  ].filter(Boolean);
  let line =
    `Prize-event intake (instrument only; files nothing): ${headline(m)} on the mlcontests list, read ${utcMinute(m.measuredAt)} ` +
    `(${ageDays.toFixed(1)} days ago) — ${m.openRegistrationClosed} with registration already closed, ${m.openNotYetLaunched} not yet launched, ` +
    `${m.openWithStatedUsdPrize} with a stated USD prize ($${thousands(m.openStatedUsdPrizeTotal)} stated in total, all places combined, not an expected payout)` +
    (m.openWithNote ? `, ${m.openWithNote} with a free-text note to read by hand` : "") +
    (m.undatable ? `, ${m.undatable} listed with a deadline that does not parse (neither open nor closed)` : "") +
    "." +
    (unread.length ? ` Stated among the open but not read, so in none of those counts: ${unread.join(", ")}.` : "") +
    (m.aiRuleFieldInSource === false
      ? " AI or automated solutions allowed: not counted — none of the list's fields states it."
      : ` AI or automated solutions allowed: unknown — the list carries ${plural(m.unknownFields, "field", "fields")} this reader does not know, ` +
        `${m.unknownFields === 1 ? "which may state it; read it" : "any of which may state it; read them"} by hand.`) +
    (m.aiAllowed === undefined
      ? ` Rules pages (BOARD-LOOP §13): not in this reading — the weekly job writes ${AI_ALLOWED_TABLE_FILE} from its next run.`
      : describeAiAllowed(m.aiAllowed));
  if (ageDays > PRIZE_INTAKE_STALE_DAYS) {
    line += ` STALE: read ${ageDays.toFixed(1)} days ago, so the weekly job has missed a run; these are not this week's numbers.`;
  }
  return { file, status: "read", line };
}
