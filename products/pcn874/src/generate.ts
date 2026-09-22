/**
 * generatePcn874 — turn a documented CSV of documents into a PCN874 file.
 *
 * Built on the validator, and it refuses to hand back a file the validator
 * rejects: `text` is `null` whenever this module's own `validatePcn874` run
 * reports a single `error` finding, and the refused result carries no records
 * either, so the refused file is not reachable through `validation` (see
 * `withoutRecords`). A wrong PCN874 is the filer's exposure to the Tax
 * Authority, not ours, so the generator would rather produce nothing than
 * produce something malformed.
 *
 * **What that refusal does and does not cover.** The validator checks layout,
 * field types, the two record counts and Appendix C's permitted values; it
 * cross-checks NO amount at all, and deliberately so (docs/SPEC.md §5.2). So
 * "the generator does not write a file its validator rejects" is a statement
 * about the file's SHAPE and its counts — not about its totals being the ones
 * the filer's books hold. The input rules in this file are what stand between a
 * mistyped CSV and a wrong amount, which is why a ragged row and an amount this
 * module cannot read without guessing are both refusals.
 *
 * Three rules govern what it will and will not compute:
 *
 * 1. **Widths and offsets come from `layout.ts`**, never from a literal here.
 *    Every record is assembled by walking the field table, and a value whose
 *    length does not equal the declared width is a programming error, not a
 *    padded guess.
 * 2. **The header totals the circular defines as sums or counts of the details
 *    are computed from the details** — the two record counts (lines 114-115,
 *    124), the taxable sales amount and its VAT (107, 109), the zero-value /
 *    exempt sales (117), and the two input VAT totals (119, 123).
 * 3. **`reportedVat` is never computed.** Appendix A defines the field (line
 *    126) and its sign (line 125) and no rendered source states how the value is
 *    reached — see docs/SPEC.md §5.2 and §6.7. It is read from the input, and if
 *    it is absent the generator refuses rather than inventing arithmetic.
 *
 * What this module never says, about anything it produces: that the file is
 * "compliant", "accepted" or "approved". It matches the layout in the circular;
 * the Authority's own free simulator (`ITA_SIMULATOR_URL`) is the thing that
 * answers the other question.
 */

import {
  DETAIL,
  FOOTER,
  FOOTER_RECORD_TYPE,
  HEADER,
  HEADER_RECORD_TYPE,
  RECORD_TYPES,
  RECORD_TYPE_LETTERS,
  magnitudeOf,
  type RecordSpec,
} from './layout.js';
import { ita } from './sources.js';
import { validatePcn874, type ValidationResult } from './validate.js';

/* ------------------------------------------------------------------ types */

export type ProblemSeverity = 'error' | 'warning';

/**
 * Something wrong with, or worth saying about, the INPUT. Findings about the
 * OUTPUT are the validator's `Finding`s, carried in `GenerateResult.validation`.
 *
 * An `error` problem refuses the file. A `warning` is printed and the file is
 * still written — the same ladder the validator uses, for the same reason.
 */
export interface GeneratorProblem {
  /** Stable id, safe to depend on. */
  readonly code: string;
  readonly severity: ProblemSeverity;
  /** 1-based line of the input CSV, or null for a whole-file problem. */
  readonly line: number | null;
  readonly column: string | null;
  readonly message: string;
  /** Citations, `sourceKey:path:line`, resolvable through SOURCES. */
  readonly sources: readonly string[];
  /** The cited document's own words, where a document is cited. */
  readonly officialText?: string;
  /**
   * Set where this generator had to choose something no rendered source states.
   * A product choice, never a statement about what the law or the Authority
   * requires.
   */
  readonly productChoice?: string;
}

export interface GenerateResult {
  /** True only when nothing refused the file: no error problem, no error finding. */
  readonly ok: boolean;
  /** The file text — `null` whenever `ok` is false. Nothing else returns text. */
  readonly text: string | null;
  readonly problems: readonly GeneratorProblem[];
  /** The validator's own verdict on the generated text, or null if none was built. */
  readonly validation: ValidationResult | null;
  readonly counts: { readonly error: number; readonly warning: number };
}

export interface GenerateOptions {
  /**
   * `reportedVat` in shekels (signed; "+" is to pay, line 125). Overrides a
   * `# reportedVat:` line in the CSV. There is no default and none can be
   * computed — see the module docstring.
   */
  readonly reportedVat?: string;
  /** Where the input came from, for messages. Defaults to "input". */
  readonly sourceName?: string;
}

/* ---------------------------------------------------------------- columns */

/**
 * The CSV's columns, as data, so `docs/GENERATOR.md` and this code cannot drift
 * apart — `tests/generate.test.ts` checks that the document documents each one.
 *
 * `field` is the id in the layout table (docs/SPEC.md §3.2) the column fills;
 * `null` where the column fills no field of the record and exists for a header
 * total instead.
 */
export const GENERATOR_COLUMNS: readonly {
  readonly name: string;
  readonly field: string | null;
  readonly required: boolean;
  readonly sources: readonly string[];
  readonly what: string;
}[] = Object.freeze([
  {
    name: 'entryType',
    field: 'recordType',
    required: true,
    sources: [ita('133'), ita('176-192')],
    what: 'one of the eleven letters in the Table of Values: S L M Y I (sales), T K R P H C (inputs).',
  },
  {
    name: 'counterpartyVatId',
    field: 'counterpartyVatId',
    required: false,
    sources: [ita('134-137')],
    what: "the other side's VAT id — the customer for a sale, the supplier for an input. Empty means zeros, which Appendix C requires for L and K and rejects for T M C P I.",
  },
  {
    name: 'invoiceDate',
    field: 'invoiceDate',
    required: true,
    sources: [ita('138')],
    what: 'YYYYMMDD or YYYY-MM-DD; written as YYYYMMDD.',
  },
  {
    name: 'refGroup',
    field: 'refGroup',
    required: false,
    sources: [ita('139'), ita('580-581')],
    what: 'the reference group — A(4), so letters are legal. Left-padded with zeros to four characters; empty means "0000".',
  },
  {
    name: 'refNumber',
    field: 'refNumber',
    required: false,
    sources: [ita('141')],
    what: 'the reference number. More than nine digits is cut to the nine rightmost, which is what the field is: "First 9 positions from the right".',
  },
  {
    name: 'vatSum',
    field: 'totalVat',
    required: false,
    sources: [ita('142-144')],
    what: 'the document\'s VAT in shekels, signed. Rounded to the nearest shekel; the digits carry the absolute value and the record\'s single "+/-" field carries the sign.',
  },
  {
    name: 'invoiceSum',
    field: 'invoiceSum',
    required: false,
    sources: [ita('145-146'), ita('148-149')],
    what: 'the document total excluding VAT, in shekels, signed. A negative value is a cancellation or credit and puts "-" in the record\'s "+/-" field.',
  },
  {
    name: 'allocationNumber',
    field: 'allocationNumber',
    required: false,
    sources: [ita('150-152'), ita('583-584')],
    what: 'the allocation number, N(9). Empty means zeros, which is what the 2009 circular requires; more than nine digits is cut to the nine rightmost.',
  },
  {
    name: 'inputKind',
    field: null,
    required: false,
    sources: [ita('118-119'), ita('123')],
    what: '"equipment" or "other" (the default). It fills no field of the transaction record — the record has none — and decides only which of the two header input-VAT totals this input joins.',
  },
]);

/** The `# key: value` lines the CSV may carry before its column header. */
export const GENERATOR_DIRECTIVES: readonly {
  readonly name: string;
  readonly field: string;
  readonly required: boolean;
  readonly sources: readonly string[];
  readonly what: string;
}[] = Object.freeze([
  {
    name: 'licensedDealerId',
    field: 'licensedDealerId',
    required: true,
    sources: [ita('101'), ita('159-161')],
    what: "the filer's 9-digit licensed dealer id. It fills the header's field and the closing entry's.",
  },
  {
    name: 'reportMonth',
    field: 'reportMonth',
    required: true,
    sources: [ita('102')],
    what: 'the reported period, YYYYMM or YYYY-MM.',
  },
  {
    name: 'generationDate',
    field: 'generationDate',
    required: false,
    sources: [ita('105')],
    what: 'the file generation date, YYYYMMDD or YYYY-MM-DD. Defaults to today.',
  },
  {
    name: 'reportedVat',
    field: 'reportedVat',
    required: true,
    sources: [ita('125'), ita('126')],
    what: 'the total VAT to pay ("+") or receive ("-") for the period, in shekels. NEVER computed here — no rendered source states its arithmetic (docs/SPEC.md §5.2, §6.7).',
  },
]);

/* ------------------------------------------------------- small utilities */

const norm = (name: string): string => name.toLowerCase().replace(/[\s_-]+/g, '');

const COLUMN_BY_NORM = new Map(GENERATOR_COLUMNS.map(c => [norm(c.name), c.name]));
const DIRECTIVE_BY_NORM = new Map(GENERATOR_DIRECTIVES.map(d => [norm(d.name), d.name]));

/**
 * The rounding rule, stated once.
 *
 * "Rounded to the nearest shekel" is the circular's own instruction, for the VAT
 * sum (lines 142-144) and for the invoice total (lines 148-149). What the
 * circular does NOT state is the direction at exactly half a shekel, and nothing
 * in either vendor manual states it either. This generator rounds a half away
 * from zero, and says so as a warning on the one row where the choice actually
 * decides the digit — never as a claim about what is required.
 */
const HALF_AWAY_FROM_ZERO =
  'The circular says an amount is "rounded to the nearest shekel" (lines 142-144 for the VAT sum, ' +
  '148-149 for the invoice total). It does not say which way a half shekel goes, and neither vendor ' +
  'manual does. This generator rounds a half away from zero. That is a product choice, not a rule of ' +
  'the circular, and it is reported wherever it actually decides a digit.';

interface Amount {
  /** Whole shekels, signed. */
  readonly shekels: number;
  /** True when the input was exactly half a shekel and the tie-break decided it. */
  readonly tie: boolean;
}

/**
 * A comma is a THOUSANDS separator here and nothing else.
 *
 * Stripping every comma — which this generator used to do — cannot tell a
 * thousands separator from a decimal one, so a foreign-locale export of
 * `"1800,00"` was read as ₪180,000 and written to the file with no finding of
 * any kind. Israel writes the decimal point as a period, so the safe rule is:
 * a comma is accepted only where a thousands separator can stand (groups of
 * exactly three digits, the first group one to three), and any other comma is
 * refused rather than guessed at.
 */
const AMOUNT = /^([+-]?)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?$/;

/** `1800,00`, `10,00` — a decimal comma, which is not a thousands separator. */
const DECIMAL_COMMA = /^[+-]?\d+,\d{1,2}$/;

/**
 * `1.000`, `12.500` — a period before exactly three digits, with at most three
 * digits in front of it. It is ₪1 read as a decimal point and ₪1,000 read as a
 * European thousands separator, and nothing in the cell says which. Refused,
 * not guessed: the two readings are a thousandfold apart.
 */
const AMBIGUOUS_GROUP = /^[+-]?\d{1,3}\.\d{3}$/;

/**
 * Parse a shekel amount and round it to a whole shekel, on the decimal string
 * rather than on a float, so 0.5 is a tie because it is one and not because of
 * binary rounding.
 */
function parseAmount(raw: string): Amount | null {
  const cleaned = raw.replace(/[\s₪]/g, '');
  if (cleaned === '') return { shekels: 0, tie: false };
  if (AMBIGUOUS_GROUP.test(cleaned)) return null;
  const m = AMOUNT.exec(cleaned);
  if (!m) return null;
  const negative = m[1] === '-';
  const whole = Number(m[2]!.replace(/,/g, ''));
  const frac = m[3] ?? '';
  let up = false;
  let tie = false;
  if (frac.length > 0) {
    const half = `5${'0'.repeat(frac.length - 1)}`;
    if (frac > half) up = true;
    else if (frac === half) {
      up = true;
      tie = true;
    }
  }
  const magnitude = whole + (up ? 1 : 0);
  return { shekels: negative ? -magnitude : magnitude, tie };
}

/**
 * Why an amount was refused, in words that name the shape that was written.
 *
 * The two locale shapes get their own sentence because they are the ones that
 * used to be read as an amount a hundred or a thousand times off, silently.
 */
function amountHint(raw: string): string {
  const cleaned = raw.replace(/[\s₪]/g, '');
  if (DECIMAL_COMMA.test(cleaned)) {
    return (
      ' The comma here is not a thousands separator, and this generator will not guess what it is: dropping it ' +
      'would turn "1800,00" into ₪180,000. Write the agorot after a period ("1800.00"), or leave them out. A ' +
      'comma is read only between groups of three digits ("1,800.00").'
    );
  }
  if (AMBIGUOUS_GROUP.test(cleaned)) {
    return (
      ' A period before exactly three digits is ambiguous: "1.000" is ₪1 with three decimal digits and ₪1,000 ' +
      'with a European thousands separator, and nothing in the cell says which. Write it without a separator ' +
      '("1000"), or with fewer decimal digits ("1.0").'
    );
  }
  return (
    ' Write it as digits with an optional sign and an optional decimal part; a comma is read only as a ' +
    'thousands separator ("1,800.00").'
  );
}

/** "+" for zero and above, "-" below. Official line 174 for the zero case. */
const signOf = (value: number): '+' | '-' => (value < 0 ? '-' : '+');

const isRealYyyymmdd = (v: string): boolean => {
  if (!/^\d{8}$/.test(v)) return false;
  const y = Number(v.slice(0, 4));
  const mo = Number(v.slice(4, 6));
  const d = Number(v.slice(6, 8));
  const date = new Date(Date.UTC(y, mo - 1, d));
  return (
    y >= 1900 &&
    y <= 2999 &&
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === mo - 1 &&
    date.getUTCDate() === d
  );
};

const isRealYyyymm = (v: string): boolean => {
  if (!/^\d{6}$/.test(v)) return false;
  const mo = Number(v.slice(4, 6));
  const y = Number(v.slice(0, 4));
  return y >= 1900 && y <= 2999 && mo >= 1 && mo <= 12;
};

/* ------------------------------------------------------------ CSV parsing */

interface CsvRow {
  /** 1-based line in the input file where this row starts. */
  readonly line: number;
  readonly cells: readonly string[];
}

/**
 * An RFC 4180 subset: comma separated, `"` quoted, `""` for a literal quote,
 * LF / CRLF / CR line endings, blank lines dropped. Stdlib only, on purpose —
 * a CSV of nine columns does not need a dependency.
 */
function parseCsv(text: string, firstLine: number): CsvRow[] {
  const rows: CsvRow[] = [];
  let cells: string[] = [];
  let cell = '';
  let quoted = false;
  let line = firstLine;
  let rowLine = firstLine;
  let started = false;

  const endCell = (): void => {
    cells.push(cell);
    cell = '';
  };
  const endRow = (): void => {
    endCell();
    // A row of nothing but empty cells is dropped, however many cells it has.
    // Excel writes a trailing ",,,,,,,," row routinely, and it carries no
    // document: reading it as one produced `entry type ""` and refused the file.
    if (!cells.every(c => c.trim() === '')) {
      rows.push({ line: rowLine, cells });
    }
    cells = [];
    started = false;
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (!started && !quoted) {
      rowLine = line;
      started = true;
    }
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else {
        if (ch === '\n') line++;
        cell += ch;
      }
      continue;
    }
    if (ch === '"' && cell === '') {
      quoted = true;
      continue;
    }
    if (ch === ',') {
      endCell();
      continue;
    }
    if (ch === '\r') {
      if (text[i + 1] === '\n') i++;
      line++;
      endRow();
      continue;
    }
    if (ch === '\n') {
      line++;
      endRow();
      continue;
    }
    cell += ch;
  }
  if (started || cell !== '' || cells.length > 0) endRow();
  return rows;
}

/* ------------------------------------------------------- record assembly */

/**
 * Lay values out along the field table. Every width and offset comes from
 * `layout.ts`; nothing here knows a number. A value of the wrong length is a bug
 * in this file, so it throws rather than padding over the mistake.
 */
function assemble(spec: RecordSpec, values: Readonly<Record<string, string>>): string {
  let out = '';
  for (const field of spec.fields) {
    const value = values[field.id];
    if (value === undefined) {
      throw new Error(`internal: no value for ${spec.kind}.${field.id}`);
    }
    if (value.length !== field.length) {
      throw new Error(
        `internal: ${spec.kind}.${field.id} is ${value.length} characters, the layout declares ${field.length}`,
      );
    }
    out += value;
  }
  if (out.length !== spec.length) {
    throw new Error(`internal: ${spec.kind} record is ${out.length} characters, expected ${spec.length}`);
  }
  return out;
}

/* ------------------------------------------------------------ the builder */

interface ParsedRow {
  readonly line: number;
  readonly entryType: string;
  readonly side: 'sale' | 'input';
  readonly equipment: boolean;
  /** Signed whole shekels. */
  readonly vat: number;
  readonly sum: number;
  readonly values: Record<string, string>;
}

class Problems {
  readonly list: GeneratorProblem[] = [];
  add(p: GeneratorProblem): void {
    this.list.push(p);
  }
  get errors(): number {
    return this.list.filter(p => p.severity === 'error').length;
  }
}

/** Left-pad digits to the declared width, or refuse: never truncate an amount. */
function digitsFor(
  problems: Problems,
  spec: RecordSpec,
  fieldId: string,
  magnitude: number,
  line: number | null,
  column: string,
): string {
  const field = spec.fields.find(f => f.id === fieldId);
  if (!field) throw new Error(`internal: no field ${fieldId} in the ${spec.kind} layout`);
  const text = String(Math.abs(magnitude));
  if (text.length > field.length) {
    problems.add({
      code: 'amount.tooWide',
      severity: 'error',
      line,
      column,
      message: `${magnitude} does not fit the ${field.length} digits Appendix A declares for ${spec.kind}.${fieldId} (N(${field.length})). Refusing rather than writing a truncated amount.`,
      sources: field.sources.filter(s => s.startsWith('ita:')),
      ...(field.officialText ? { officialText: field.officialText } : {}),
    });
    return '0'.repeat(field.length);
  }
  return text.padStart(field.length, '0');
}

function parseRows(
  rows: readonly CsvRow[],
  columns: readonly string[],
  problems: Problems,
): ParsedRow[] {
  const out: ParsedRow[] = [];

  for (const row of rows) {
    const cell = (name: string): string => {
      const i = columns.indexOf(name);
      return i === -1 ? '' : (row.cells[i] ?? '').trim();
    };
    const fail = (code: string, column: string, message: string, sources: string[], officialText?: string): void =>
      problems.add({
        code,
        severity: 'error',
        line: row.line,
        column,
        message,
        sources,
        ...(officialText ? { officialText } : {}),
      });

    // --- the row's width, before a single cell is read
    //
    // Cells are read by POSITION. A row that is not exactly as wide as the
    // column header therefore shifts every cell after the gap into the wrong
    // field, and the amounts land in fields Appendix A types as shekels rounded
    // to the nearest shekel: an unquoted "1,800" split a ₪1,800/₪10,000 sale
    // into VAT ₪1 and a total of ₪800, exit code 0, no warning. A truncated row
    // read its missing cells as empty, and empty means zero, so it wrote a ₪0
    // zero-rated sale. Neither is recoverable from the file, so neither is
    // written.
    if (row.cells.length !== columns.length) {
      problems.add({
        code: 'csv.row.cellCount',
        severity: 'error',
        line: row.line,
        column: null,
        message:
          `this row has ${row.cells.length} cell(s) and the column header has ${columns.length}. Cells are read ` +
          'by position, so a row of a different width puts the amounts in the wrong fields — silently, because ' +
          'nothing in the file says which cell was meant to be where. The usual cause is a comma inside an ' +
          'unquoted amount ("1,800" is two cells); quote the cell ("1,800") or write the amount without ' +
          'separators. A short row is the other cause: every missing cell would be read as empty, and empty ' +
          'means zero.',
        sources: [ita('142-144'), ita('148-149')],
        officialText:
          'Total VAT in invoice / total VAT that is allowed (1/4…. 2/3…)   N(9)   Rounded to the nearest shekel – always a positive value; Invoice total not incl. VAT   N(10)   Always the 100%, always a positive value, rounded to the nearest shekel',
      });
      continue;
    }

    const entryType = cell('entryType');
    if (!RECORD_TYPE_LETTERS.includes(entryType)) {
      fail(
        'row.entryType.unknown',
        'entryType',
        `entry type ${JSON.stringify(entryType)} is not one of the eleven letters in the Table of Values (${RECORD_TYPE_LETTERS.join(', ')}).`,
        [ita('133'), ita('176-192')],
        'Entry Type (document type)   A(1)   See attached table of values',
      );
      continue;
    }
    const type = RECORD_TYPES[entryType]!;

    // --- dates
    const rawDate = cell('invoiceDate').replace(/-/g, '');
    if (!isRealYyyymmdd(rawDate)) {
      fail(
        'row.invoiceDate.calendar',
        'invoiceDate',
        `invoice date ${JSON.stringify(cell('invoiceDate'))} is not a real YYYYMMDD date. Appendix A types the field N(8) and gives its form as YYYYMMDD (line 138).`,
        [ita('138')],
        'Invoice Date/Reference   N(8)   YYYYMMDD',
      );
      continue;
    }

    // --- the two amounts, and the one sign they share
    const vatAmount = parseAmount(cell('vatSum'));
    const sumAmount = parseAmount(cell('invoiceSum'));
    if (vatAmount === null || sumAmount === null) {
      fail(
        'row.amount.unreadable',
        vatAmount === null ? 'vatSum' : 'invoiceSum',
        `${vatAmount === null ? 'vatSum' : 'invoiceSum'} ${JSON.stringify(vatAmount === null ? cell('vatSum') : cell('invoiceSum'))} is not a shekel amount.${amountHint(vatAmount === null ? cell('vatSum') : cell('invoiceSum'))}`,
        [ita('142-144'), ita('148-149')],
        'Total VAT in invoice / total VAT that is allowed (1/4…. 2/3…)   N(9)   Rounded to the nearest shekel – always a positive value',
      );
      continue;
    }
    if (vatAmount.tie || sumAmount.tie) {
      problems.add({
        code: 'row.amount.roundingTie',
        severity: 'warning',
        line: row.line,
        column: vatAmount.tie ? 'vatSum' : 'invoiceSum',
        message:
          'an amount on this row is exactly half a shekel, so the rounding direction decided the digit written. This generator rounded away from zero.',
        sources: [ita('142-144'), ita('148-149')],
        officialText:
          'Total VAT in invoice / total VAT that is allowed (1/4…. 2/3…)   N(9)   Rounded to the nearest shekel – always a positive value; Invoice total not incl. VAT   N(10)   Always the 100%, always a positive value, rounded to the nearest shekel',
        productChoice: HALF_AWAY_FROM_ZERO,
      });
    }
    // --- the two ways a sale changes header total without anyone saying so
    //
    // Appendix C tells a taxable sale from a zero-rated one by the VAT cell
    // being zeros (lines 271-283 against 250-270), and this generator applies
    // that test to the value it is about to WRITE — a whole shekel. So a sale
    // whose VAT cell was left empty, and a sale whose VAT rounds to zero, both
    // move their whole amount out of "Total amount of taxable sales" and into
    // "Total of zero value/exempt sales for period". Documented in both cases,
    // and until now silent in both; a forgotten cell is not a decision.
    const rawVat = cell('vatSum');
    if (type.side === 'sale' && rawVat === '') {
      problems.add({
        code: 'row.vatSum.empty',
        severity: 'warning',
        line: row.line,
        column: 'vatSum',
        message:
          'this sale row has no VAT, so its whole amount was counted in "Total of zero value/exempt sales for ' +
          'period" rather than in the taxable sales total. An empty cell means zeros here, which is what tells ' +
          'a zero-rated sale from a taxable one in Appendix C — write an explicit 0 if that is what you mean, ' +
          'and the row stops being reported.',
        sources: [ita('116-117'), ita('107')],
        officialText:
          '+/- symbol for total of zero value and exempt sales   +/-; Total of zero value/exempt sales for period   N(11)',
      });
    }
    if (type.side === 'sale' && vatAmount.shekels === 0 && /[1-9]/.test(rawVat)) {
      problems.add({
        code: 'row.vat.roundedToZero',
        severity: 'warning',
        line: row.line,
        column: 'vatSum',
        message:
          `this sale row's VAT is ${JSON.stringify(rawVat)}, which rounds to zero shekels, so the row was ` +
          'counted in "Total of zero value/exempt sales for period" rather than in the taxable sales total. ' +
          'The rounding decided which header total the amount joined.',
        sources: [ita('142-144'), ita('116-117'), ita('107')],
        officialText:
          'Total VAT in invoice / total VAT that is allowed (1/4…. 2/3…)   N(9)   Rounded to the nearest shekel – always a positive value',
        productChoice:
          'Appendix C separates a zero-rated sale from a taxable one by the VAT cell being zeros (the "Zero ' +
          'Value/Exempt \'SL\' – not export" row, lines 271-283, against the regular sale row, lines 250-270), ' +
          'and the circular requires every amount "rounded to the nearest shekel" (lines 142-144). It never ' +
          'says whether the classification is made before or after that rounding. This generator classifies on ' +
          'the rounded VAT, because that is the value the file actually carries. That is a product choice, not ' +
          'a rule of the circular, and it is reported wherever it decided a total.',
      });
    }

    if (vatAmount.shekels < 0 && sumAmount.shekels > 0) {
      fail(
        'row.sign.conflict',
        'vatSum',
        `the VAT sum is negative and the invoice total is positive. A transaction record carries ONE "+/-" field for the whole document, so the two cannot disagree; split the row or correct a sign.`,
        [ita('145-146')],
        '+/- symbol: credit/summary invoice   A(1)   Cancellation/credit from supplier or customer –   always in minus',
      );
      continue;
    }
    if (vatAmount.shekels > 0 && sumAmount.shekels < 0) {
      fail(
        'row.sign.conflict',
        'invoiceSum',
        `the invoice total is negative and the VAT sum is positive. A transaction record carries ONE "+/-" field for the whole document, so the two cannot disagree; split the row or correct a sign.`,
        [ita('145-146')],
        '+/- symbol: credit/summary invoice   A(1)   Cancellation/credit from supplier or customer –   always in minus',
      );
      continue;
    }
    // Both amounts zero take "+" — official line 174, which the validator
    // enforces as an error on exactly that case.
    const negative = vatAmount.shekels < 0 || sumAmount.shekels < 0;

    // --- the identifiers
    const vatIdRaw = cell('counterpartyVatId').replace(/\s/g, '');
    if (vatIdRaw !== '' && !/^\d{1,9}$/.test(vatIdRaw)) {
      fail(
        'row.counterpartyVatId.digits',
        'counterpartyVatId',
        `counter-party VAT id ${JSON.stringify(vatIdRaw)} is not up to nine digits. Appendix A types the field N(9); a shorter number takes "preliminary zeros".`,
        [ita('134-137'), ita('39-42')],
        'VAT identification number – of the other side of the transaction   N(9)',
      );
      continue;
    }

    const refGroupRaw = cell('refGroup');
    if (refGroupRaw.length > 4) {
      fail(
        'row.refGroup.tooLong',
        'refGroup',
        `reference group ${JSON.stringify(refGroupRaw)} is longer than the four characters Appendix A declares (A(4)).`,
        [ita('139')],
        'Reference group   A(4)   Series etc.   zeros are possible at this stage',
      );
      continue;
    }

    const refNumberRaw = cell('refNumber').replace(/\s/g, '');
    if (refNumberRaw !== '' && !/^\d+$/.test(refNumberRaw)) {
      fail(
        'row.refNumber.digits',
        'refNumber',
        `reference number ${JSON.stringify(refNumberRaw)} is not digits. Appendix A types the field N(9).`,
        [ita('141')],
        'Reference number   N(9)   First 9 positions from the right',
      );
      continue;
    }
    if (refNumberRaw.length > 9) {
      problems.add({
        code: 'row.refNumber.rightmostNine',
        severity: 'warning',
        line: row.line,
        column: 'refNumber',
        message: `reference number ${JSON.stringify(refNumberRaw)} is longer than nine digits, so the nine rightmost were written (${refNumberRaw.slice(-9)}). That is what the field is, not a truncation this generator chose.`,
        sources: [ita('141')],
        officialText: 'Reference number   N(9)   First 9 positions from the right',
      });
    }

    const allocationRaw = cell('allocationNumber').replace(/\s/g, '');
    if (allocationRaw !== '' && !/^\d+$/.test(allocationRaw)) {
      fail(
        'row.allocationNumber.digits',
        'allocationNumber',
        `allocation number ${JSON.stringify(allocationRaw)} is not digits. Appendix A types the field N(9), and this generator enforces the circular's type.`,
        [ita('150-152')],
        'Space for   future   data   N(9)   Reference number to be allocated by "Sha\'am" to the',
      );
      continue;
    }
    if (allocationRaw.length > 9) {
      problems.add({
        code: 'row.allocationNumber.rightmostNine',
        severity: 'warning',
        line: row.line,
        column: 'allocationNumber',
        message: `allocation number ${JSON.stringify(allocationRaw)} is longer than nine characters, so the nine rightmost were written (${allocationRaw.slice(-9)}). The circular types the field N(9) and says nothing about a longer number; the only source that does is a vendor manual, which says "the 9 rightmost characters" are recorded.`,
        sources: [ita('150-152'), 'herp:research/rendered/pcn874-h-erp-mirror.txt:507-508'],
        officialText: 'Space for   future   data   N(9)',
        productChoice:
          'Taking the nine rightmost characters follows the H-ERP manual (herp lines 126-127, 303, 507-508), ' +
          'a software vendor\'s guide and not a Tax Authority document. The circular itself types the field ' +
          'N(9) and, in 2009, required zeros. See docs/SPEC.md §6.2.',
      });
    }

    // --- which input total this row feeds
    const inputKindRaw = cell('inputKind').toLowerCase();
    if (inputKindRaw !== '' && inputKindRaw !== 'other' && inputKindRaw !== 'equipment') {
      fail(
        'row.inputKind.unknown',
        'inputKind',
        `inputKind ${JSON.stringify(cell('inputKind'))} is neither "equipment" nor "other". The header separates VAT on "equipment" inputs from VAT on "other" (non-capital) inputs, and the transaction record has no field that says which a document is, so this column is the only place the distinction can come from.`,
        [ita('118-119'), ita('123')],
        'Total VAT on "other" inputs required during period   N(9); Total VAT on "equipment" inputs required during period   N(9)',
      );
      continue;
    }
    if (inputKindRaw === 'equipment' && type.side === 'sale') {
      fail(
        'row.inputKind.onSale',
        'inputKind',
        `entry type ${entryType} is a sale (Table of Values, lines 181-185) and a sale has no input kind. Leave the column empty on sales rows.`,
        [ita('181-185'), ita('118-119')],
        'Total VAT on "equipment" inputs required during period   N(9)',
      );
      continue;
    }

    const vat = vatAmount.shekels;
    const sum = sumAmount.shekels;

    const values: Record<string, string> = {
      recordType: entryType,
      counterpartyVatId: vatIdRaw === '' ? '0'.repeat(9) : vatIdRaw.padStart(9, '0'),
      invoiceDate: rawDate,
      refGroup: refGroupRaw === '' ? '0000' : refGroupRaw.padStart(4, '0'),
      refNumber: refNumberRaw === '' ? '0'.repeat(9) : refNumberRaw.slice(-9).padStart(9, '0'),
      totalVat: digitsFor(problems, DETAIL, 'totalVat', vat, row.line, 'vatSum'),
      invoiceSumSign: negative ? '-' : '+',
      invoiceSum: digitsFor(problems, DETAIL, 'invoiceSum', sum, row.line, 'invoiceSum'),
      allocationNumber:
        allocationRaw === '' ? '0'.repeat(9) : allocationRaw.slice(-9).padStart(9, '0'),
    };

    out.push({
      line: row.line,
      entryType,
      side: type.side,
      equipment: inputKindRaw === 'equipment',
      vat,
      sum,
      values,
    });
  }

  return out;
}

/**
 * The header totals the circular defines as sums or counts of the details.
 *
 * Every one of them is a field Appendix A describes as a total or a number of
 * records; none of them is `reportedVat`, which Appendix A describes and never
 * defines. Two readings had to be taken where the circular stops short, and both
 * are recorded rather than buried:
 *
 * - **Taxable versus zero-rated.** A taxable sale and a zero-rated one share the
 *   same letter; Appendix C tells them apart by the VAT sum being zeros
 *   (the "Zero Value/Exempt 'SL' – not export" row, lines 271-283). So a sale
 *   record whose VAT is zero feeds `zeroOrExemptSalesAmount` and one whose VAT
 *   is not feeds `taxableSalesAmount` and `taxableSalesVat`.
 * - **Signs.** A cancellation is "reported as an opposite sign" (lines 592-593)
 *   — which is a rule about the RECORD's sign, and the only thing lines 592-593
 *   state. No rendered line says how a header total is formed from signed
 *   records. What this generator reads instead is the header's own shape: each
 *   total has a "+/-" field of its own (lines 106, 108, 116, 118, 120-122), and
 *   a sign field carries no information unless the total can go negative, which
 *   it can only do if a credit subtracts. So a credit's amounts subtract from
 *   the totals rather than adding to them. That is a reading of the header's
 *   sign fields, not a sentence anyone wrote.
 */
function computeTotals(rows: readonly ParsedRow[]): {
  taxableSalesAmount: number;
  taxableSalesVat: number;
  zeroOrExemptSalesAmount: number;
  otherInputsVat: number;
  equipmentInputsVat: number;
  salesRecordCount: number;
  inputsCount: number;
} {
  const t = {
    taxableSalesAmount: 0,
    taxableSalesVat: 0,
    zeroOrExemptSalesAmount: 0,
    otherInputsVat: 0,
    equipmentInputsVat: 0,
    salesRecordCount: 0,
    inputsCount: 0,
  };
  for (const row of rows) {
    if (row.side === 'sale') {
      t.salesRecordCount++;
      if (row.vat === 0) t.zeroOrExemptSalesAmount += row.sum;
      else {
        t.taxableSalesAmount += row.sum;
        t.taxableSalesVat += row.vat;
      }
    } else {
      t.inputsCount++;
      if (row.equipment) t.equipmentInputsVat += row.vat;
      else t.otherInputsVat += row.vat;
    }
  }
  return t;
}

/* --------------------------------------------------------------- the API */

/**
 * Generate a PCN874 file from a documented CSV.
 *
 * Returns `text` only when the generator found no error in the input AND the
 * validator found no error in the output. Every other path returns `text: null`,
 * which is what makes "this cannot write an invalid file" a property of the API
 * rather than of the caller's discipline.
 */
export function generatePcn874(csvText: string, options: GenerateOptions = {}): GenerateResult {
  const problems = new Problems();

  // --- the "# key: value" preamble, then the CSV proper
  const physical = csvText.split(/\r\n|\n|\r/);
  const meta = new Map<string, { value: string; line: number }>();
  let bodyStart = 0;
  for (let i = 0; i < physical.length; i++) {
    const raw = physical[i] ?? '';
    if (raw.trim() === '') {
      bodyStart = i + 1;
      continue;
    }
    if (!raw.trimStart().startsWith('#')) break;
    bodyStart = i + 1;
    const body = raw.trimStart().slice(1).trim();
    // A directive is `# name: value` with a ONE-WORD name. A comment that happens
    // to contain a colon ("# no reportedVat: refuse") has a space in front of it
    // and stays a comment; a mistyped one-word key is caught below.
    const m = /^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(body);
    if (!m) {
      // A `#` line whose first word IS one of the directive names but which
      // carries no colon is a mistyped directive, not a comment. Dropping it in
      // silence and then refusing the file for the directive being "not
      // supplied" tells the user nothing about the line they actually wrote.
      const word = /^([A-Za-z][A-Za-z0-9_-]*)/.exec(body)?.[1];
      const key = word === undefined ? undefined : DIRECTIVE_BY_NORM.get(norm(word));
      if (key !== undefined) {
        problems.add({
          code: 'meta.malformed',
          severity: 'error',
          line: i + 1,
          column: key,
          message: `header line ${JSON.stringify(raw.trim())} begins with the directive ${JSON.stringify(key)} and has no colon after it, so it would have been read as a free comment and ${key} reported missing. Write it as "# ${key}: <value>".`,
          sources: [ita('94-126')],
        });
      }
      continue; // a free comment line
    }
    const key = DIRECTIVE_BY_NORM.get(norm(m[1]!));
    if (key === undefined) {
      problems.add({
        code: 'meta.unknown',
        severity: 'error',
        line: i + 1,
        column: m[1]!.trim(),
        message: `unknown header directive ${JSON.stringify(m[1]!.trim())}. The recognised ones are ${GENERATOR_DIRECTIVES.map(d => d.name).join(', ')}.`,
        sources: [ita('94-126')],
      });
      continue;
    }
    meta.set(key, { value: m[2]!.trim(), line: i + 1 });
  }

  const rows = parseCsv(physical.slice(bodyStart).join('\n'), bodyStart + 1);
  const headerRow = rows[0];
  if (!headerRow) {
    problems.add({
      code: 'csv.noHeaderRow',
      severity: 'error',
      line: null,
      column: null,
      message: `${options.sourceName ?? 'input'} has no column-header row. The first non-comment line must name the columns: ${GENERATOR_COLUMNS.map(c => c.name).join(', ')}.`,
      sources: [],
    });
    return refuse(problems);
  }

  const columns: string[] = [];
  for (const [i, cellRaw] of headerRow.cells.entries()) {
    const cell = cellRaw.trim();
    if (cell === '') {
      columns.push('');
      continue;
    }
    const known = COLUMN_BY_NORM.get(norm(cell));
    if (known === undefined) {
      problems.add({
        code: 'csv.column.unknown',
        severity: 'error',
        line: headerRow.line,
        column: cell,
        message: `unknown column ${JSON.stringify(cell)} (position ${i + 1}). The columns are ${GENERATOR_COLUMNS.map(c => c.name).join(', ')}; see docs/GENERATOR.md.`,
        sources: [],
      });
      columns.push('');
      continue;
    }
    if (columns.includes(known)) {
      problems.add({
        code: 'csv.column.duplicate',
        severity: 'error',
        line: headerRow.line,
        column: known,
        message: `column ${known} appears more than once.`,
        sources: [],
      });
    }
    columns.push(known);
  }
  for (const column of GENERATOR_COLUMNS) {
    if (column.required && !columns.includes(column.name)) {
      problems.add({
        code: 'csv.column.missing',
        severity: 'error',
        line: headerRow.line,
        column: column.name,
        message: `required column ${column.name} is missing: ${column.what}`,
        sources: column.sources,
      });
    }
  }

  // --- the header block
  const dealerRaw = (meta.get('licensedDealerId')?.value ?? '').replace(/\s/g, '');
  if (!/^\d{1,9}$/.test(dealerRaw)) {
    problems.add({
      code: 'meta.licensedDealerId',
      severity: 'error',
      line: meta.get('licensedDealerId')?.line ?? null,
      column: 'licensedDealerId',
      message: `licensedDealerId ${JSON.stringify(dealerRaw)} is not up to nine digits. Appendix A types the header's field N(9) and the closing entry's N(9); write it as "# licensedDealerId: 514457282" above the column header.`,
      sources: [ita('101'), ita('159-161')],
      officialText: "Customer's Licensed Dealer identification Number   N(9)",
    });
  }
  const monthRaw = (meta.get('reportMonth')?.value ?? '').replace(/[\s-]/g, '');
  if (!isRealYyyymm(monthRaw)) {
    problems.add({
      code: 'meta.reportMonth',
      severity: 'error',
      line: meta.get('reportMonth')?.line ?? null,
      column: 'reportMonth',
      message: `reportMonth ${JSON.stringify(monthRaw)} is not a real YYYYMM period.`,
      sources: [ita('102')],
      officialText: 'Month for which detailed report is being submitted   N(6)   Yyyymm form',
    });
  }
  const generationRaw = (meta.get('generationDate')?.value ?? '').replace(/[\s-]/g, '');
  const generationDate = generationRaw === '' ? today() : generationRaw;
  if (!isRealYyyymmdd(generationDate)) {
    problems.add({
      code: 'meta.generationDate',
      severity: 'error',
      line: meta.get('generationDate')?.line ?? null,
      column: 'generationDate',
      message: `generationDate ${JSON.stringify(generationRaw)} is not a real YYYYMMDD date. Line 105 types the field N(8) and then calls it "Yyyymm form", which cannot be right for eight digits; this generator writes YYYYMMDD, the reading every implementation writes (docs/SPEC.md §5.1).`,
      sources: [ita('105')],
      officialText: 'File Generation Date   N(8)   Yyyymm form',
    });
  }

  // --- reportedVat: taken, never computed
  const reportedRaw = (options.reportedVat ?? meta.get('reportedVat')?.value ?? '').trim();
  let reportedVat = 0;
  if (reportedRaw === '') {
    problems.add({
      code: 'meta.reportedVat.missing',
      severity: 'error',
      line: null,
      column: 'reportedVat',
      message:
        'reportedVat was not supplied, and this generator will not compute it. Appendix A defines the field — "Total VAT to pay / receive for period   N(11)" (line 126), with "+ symbol to pay" (line 125) — and states no arithmetic for it anywhere: not in Appendix A, B or C, and not in either vendor manual (docs/SPEC.md §5.2 and §6.7 say which lines, and that the three open-source implementations give three different answers). Supply it with --reported-vat <shekels> or a "# reportedVat:" line in the CSV.',
      sources: [ita('125'), ita('126')],
      officialText:
        '+/- symbol for total VAT to pay / receive   +/-   + symbol to pay; Total VAT to pay / receive for period   N(11)',
    });
  } else {
    const parsed = parseAmount(reportedRaw);
    if (parsed === null) {
      problems.add({
        code: 'meta.reportedVat.unreadable',
        severity: 'error',
        line: meta.get('reportedVat')?.line ?? null,
        column: 'reportedVat',
        message: `reportedVat ${JSON.stringify(reportedRaw)} is not a shekel amount. Write it as digits with an optional leading sign; "+" is VAT to pay, "-" VAT to receive.`,
        sources: [ita('125'), ita('126')],
        officialText: '+/- symbol for total VAT to pay / receive   +/-   + symbol to pay',
      });
    } else {
      reportedVat = parsed.shekels;
      if (parsed.tie) {
        problems.add({
          code: 'meta.reportedVat.roundingTie',
          severity: 'warning',
          line: meta.get('reportedVat')?.line ?? null,
          column: 'reportedVat',
          message:
            'reportedVat was exactly half a shekel, so the rounding direction decided the digit written. This generator rounded away from zero.',
          sources: [ita('126')],
          officialText: 'Total VAT to pay / receive for period   N(11)',
          productChoice: HALF_AWAY_FROM_ZERO,
        });
      }
    }
  }

  const details = parseRows(rows.slice(1), columns, problems);

  if (problems.errors > 0) return refuse(problems);

  // --- totals, then the three records, then the validator
  const totals = computeTotals(details);
  if (details.some(d => d.entryType === 'Y')) {
    problems.add({
      code: 'totals.exportInZeroOrExempt',
      severity: 'warning',
      line: null,
      column: 'invoiceSum',
      message:
        'this file has export records (Y), and their totals were added to "Total of zero value/exempt sales for period". The circular gives that header field no list of which entry types feed it, and Appendix C\'s zero-rated sale row is headed "Zero Value/Exempt \'SL\' – not export" — so the reading is stated here rather than assumed.',
      sources: [ita('116-117'), ita('271-272'), ita('356-376')],
      officialText:
        '+/- symbol for total of zero value and exempt sales   +/-; Total of zero value/exempt sales for period   N(11)',
      productChoice:
        'An export sale carries zeros VAT by Appendix C (note D, "The sum of the VAT will include zeros", ' +
        'lines 563-564), and the header field names zero-value and ' +
        'exempt sales without excluding exports. This generator therefore counts a Y record as a zero-value ' +
        'sale for that total. No rendered line states it either way; if the Authority reads it differently, ' +
        'this total is the field that moves.',
    });
  }

  const signedTotals: Record<string, number> = {
    taxableSalesAmount: totals.taxableSalesAmount,
    taxableSalesVat: totals.taxableSalesVat,
    // "Currently zeros – for future use", with both signs "Currently '+'" (lines 110-113).
    differentRateSalesAmount: 0,
    differentRateSalesVat: 0,
    zeroOrExemptSalesAmount: totals.zeroOrExemptSalesAmount,
    otherInputsVat: totals.otherInputsVat,
    equipmentInputsVat: totals.equipmentInputsVat,
    reportedVat,
  };
  const plain: Record<string, string> = {
    recordType: HEADER_RECORD_TYPE,
    licensedDealerId: dealerRaw.padStart(9, '0'),
    reportMonth: monthRaw,
    reportType: '1',
    generationDate,
    salesRecordCount: digitsFor(problems, HEADER, 'salesRecordCount', totals.salesRecordCount, null, 'entryType'),
    inputsCount: digitsFor(problems, HEADER, 'inputsCount', totals.inputsCount, null, 'entryType'),
  };

  const headerValues: Record<string, string> = {};
  for (const field of HEADER.fields) {
    if (field.class === 'sign') {
      const magnitude = magnitudeOf(HEADER, field);
      if (!magnitude) throw new Error(`internal: header sign ${field.id} names no amount`);
      headerValues[field.id] = signOf(signedTotals[magnitude.id] ?? 0);
      continue;
    }
    if (field.id in signedTotals) {
      headerValues[field.id] = digitsFor(
        problems,
        HEADER,
        field.id,
        signedTotals[field.id]!,
        null,
        field.id === 'reportedVat' ? 'reportedVat' : field.id,
      );
      continue;
    }
    headerValues[field.id] = plain[field.id]!;
  }

  if (problems.errors > 0) return refuse(problems);

  const lines = [
    assemble(HEADER, headerValues),
    ...details.map(d => assemble(DETAIL, d.values)),
    assemble(FOOTER, { recordType: FOOTER_RECORD_TYPE, licensedDealerId: plain['licensedDealerId']! }),
  ];
  // LF, no trailing newline. The circular states no record separator at all
  // (docs/SPEC.md §5.3), and the validator accepts LF, CRLF and CR; this is the
  // shape it writes, not a shape it claims is required.
  const text = lines.join('\n');

  const validation = validatePcn874(text);
  const ok = validation.counts.error === 0;

  return {
    ok,
    text: ok ? text : null,
    problems: problems.list,
    // On a refusal the findings are kept and the RECORDS are dropped. The
    // validator's `parsed.records[*].raw` is the refused file byte for byte, so
    // returning it whole handed a library caller the very file this package
    // refused to write — which made "there is no other way to get a file out of
    // this package" false everywhere it was written down. Now it is true.
    validation: ok ? validation : withoutRecords(validation),
    counts: {
      error: problems.errors + validation.counts.error,
      warning: problems.list.filter(p => p.severity === 'warning').length + validation.counts.warning,
    },
  };
}

/**
 * The validator's verdict without the file it was passed.
 *
 * `findings` and `counts` are what a caller needs to know why the file was
 * refused; `parsed.records` is the refused file itself, and a refused file is
 * exactly what this package undertakes not to hand out.
 */
function withoutRecords(validation: ValidationResult): ValidationResult {
  return {
    ...validation,
    parsed: { ...validation.parsed, records: [] },
  };
}

function refuse(problems: Problems): GenerateResult {
  return {
    ok: false,
    text: null,
    problems: problems.list,
    validation: null,
    counts: {
      error: problems.errors,
      warning: problems.list.filter(p => p.severity === 'warning').length,
    },
  };
}

function today(): string {
  const now = new Date();
  const y = String(now.getUTCFullYear()).padStart(4, '0');
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}
