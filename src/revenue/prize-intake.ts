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
 * closed, not yet launched, a stated dollar prize, a note present — and writes the AI-rule counts as `null` with
 * `aiRuleFieldInSource: false`: unmeasured, never 0, and never inferred from tags or prose. A key outside
 * KNOWN_FIELDS is counted (`unknownFields`) but its values are not read; the report asks for it to be read by hand.
 *
 * NEVER A FAKE ZERO. An HTTP error, a redirect, a body that is not the list, an empty list, or a list where more than
 * half the deadlines do not parse (the schema moved) writes NOTHING and exits 1, so the weekly job goes red and last
 * week's file stays. "Open" is judged by calendar date: a deadline on or after the reading's UTC day is open (the list
 * gives dates without a time or zone, so the deadline day itself counts as open).
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

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
  /** Open, carrying a free-text note (read by hand; never parsed). */
  openWithNote: number;
  /** Distinct keys outside KNOWN_FIELDS: counted, their values never read. */
  unknownFields: number;
  /** false: no field of the list states whether AI or automated solutions are allowed. */
  aiRuleFieldInSource: false;
  /** null while aiRuleFieldInSource is false — unmeasured, not zero. */
  openAiAllowedStated: null;
  openAiNotForbiddenStated: null;
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
  const open: Record<string, unknown>[] = [];
  data.forEach((raw, i) => {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new PrizeIntakeError(`entry ${i} is not an object`);
    const e = raw as Record<string, unknown>;
    for (const key of Object.keys(e)) if (!KNOWN.has(key)) unknown.add(key);
    const deadline = parseListDate(e.deadline);
    if (deadline === null) undatable += 1;
    else if (deadline >= today) open.push(e);
  });
  if (undatable * 2 > data.length) {
    throw new PrizeIntakeError(`${undatable} of ${data.length} deadlines do not parse; the list's format has moved`);
  }

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
    openWithNote: open.filter((e) => typeof e.note === "string" && e.note.trim() !== "").length,
    unknownFields: unknown.size,
    aiRuleFieldInSource: false,
    openAiAllowedStated: null,
    openAiNotForbiddenStated: null,
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
/** 861225 → "861,225", without depending on the runtime's locale data. */
const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const headline = (m: PrizeIntakeMeasurement) => `${m.open} open of ${m.listed} listed`;

export interface RunPrizeIntakeOptions {
  outFile?: string;
  nowIso?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

/** One GET of the source, then the file or nothing. Never throws. */
export async function runPrizeIntake(options: RunPrizeIntakeOptions = {}): Promise<{ code: 0 | 1; message: string }> {
  const outFile = options.outFile ?? PRIZE_INTAKE_FILE;
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
    mkdirSync(dirname(outFile), { recursive: true });
    const tmp = `${outFile}.tmp`;
    writeFileSync(tmp, `${JSON.stringify(m, null, 2)}\n`);
    renameSync(tmp, outFile);
    return {
      code: 0,
      message:
        `Prize intake: ${headline(m)} (${m.openRegistrationClosed} registration closed, ${m.openWithStatedUsdPrize} with a stated USD prize); ` +
        `AI rule: not stated by the list. Wrote ${outFile}.`,
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
  "openWithNote",
  "unknownFields",
] as const;

/** The reason a file is not a reading this module wrote, or null. Never quotes the offending value. */
function problemWith(d: Record<string, unknown>): string | null {
  if (typeof d.measuredAt !== "string" || Number.isNaN(Date.parse(d.measuredAt))) return "no usable measuredAt";
  for (const key of COUNTS) if (!isCount(d[key])) return `${key} is not a count`;
  const n = d as unknown as PrizeIntakeMeasurement;
  if (n.open + n.undatable > n.listed) return "more open and undatable than listed";
  for (const key of ["openRegistrationClosed", "openNotYetLaunched", "openWithStatedUsdPrize", "openWithNote"] as const) {
    if (n[key] > n.open) return `${key} exceeds open`;
  }
  // No field of the list states an AI rule, so this reader never writes an AI count; a file that has one was not
  // written by it.
  if (d.aiRuleFieldInSource !== false) return "aiRuleFieldInSource is not false";
  if (d.openAiAllowedStated !== null || d.openAiNotForbiddenStated !== null) return "it carries an AI-rule count this reader never produces";
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
  let line =
    `Prize-event intake (instrument only; files nothing): ${headline(m)} on the mlcontests list, read ${utcMinute(m.measuredAt)} ` +
    `(${ageDays.toFixed(1)} days ago) — ${m.openRegistrationClosed} with registration already closed, ${m.openNotYetLaunched} not yet launched, ` +
    `${m.openWithStatedUsdPrize} with a stated USD prize ($${thousands(m.openStatedUsdPrizeTotal)} stated in total)` +
    (m.openWithNote ? `, ${m.openWithNote} with a free-text note to read by hand` : "") +
    (m.undatable ? `, ${m.undatable} listed with a deadline that does not parse (neither open nor closed)` : "") +
    ". AI or automated solutions allowed: not counted — the list has no field that states it.";
  if (m.unknownFields) {
    line += ` The list carries ${plural(m.unknownFields, "field", "fields")} this reader does not know — read them by hand; one may state an AI rule.`;
  }
  if (ageDays > PRIZE_INTAKE_STALE_DAYS) {
    line += ` STALE: read ${ageDays.toFixed(1)} days ago, so the weekly job has missed a run; these are not this week's numbers.`;
  }
  return { file, status: "read", line };
}
