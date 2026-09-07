/**
 * validatePcn874 — check a PCN874 file against the Israel Tax Authority's own
 * record layout, and say which line of which document backs each finding.
 *
 * Severity, and why it matters here: a wrong PCN874 is the filer's exposure to
 * the Tax Authority, not ours. So:
 *
 * - `error`   — the official circular states the rule outright, in words that do
 *               not admit a second reading. A file breaking it is malformed.
 * - `warning` — the official document gives a field its meaning but stops short
 *               of forbidding the value; or two parts of the document pull in
 *               different directions; or the only source is a vendor manual or
 *               an implementation. Warnings never change `valid`.
 * - `info`    — reserved; nothing emits it today.
 *
 * Where the document is silent and nothing else settles it — above all the
 * arithmetic behind `reportedVat` — **no rule is written at all**. Guessing a
 * formula would mean asserting a VAT position on no evidence.
 *
 * `valid` is true when there is no `error`. It has never meant "the Tax
 * Authority will accept this file", and still does not: the Authority publishes
 * a simulator (see ITA_SIMULATOR_URL) and that is the thing that answers that
 * question.
 */

import {
  DETAIL,
  FOOTER,
  FOOTER_RECORD_TYPE,
  HEADER,
  RECORD_TYPES,
  RECORD_TYPE_LETTERS,
  REPRESENTATIVE_INITIAL_RECORD_TYPE,
  REPRESENTATIVE_SOURCE,
  REPRESENTATIVE_SUMMARY_RECORD_TYPE,
  magnitudeOf,
  type FieldSpec,
  type RecordSpec,
} from './layout.js';
import { isParsed, parsePcn874, type ParsedPcn874, type Pcn874Record } from './parse.js';
import { ita, kindOf } from './sources.js';

export type Severity = 'error' | 'warning' | 'info';

/**
 * Where a finding's authority comes from. Derived from its citations, so it
 * cannot drift away from them.
 */
export type Basis = 'official' | 'vendor-manual' | 'oss-only';

export interface Finding {
  /** Stable rule id, safe to depend on. */
  readonly rule: string;
  readonly severity: Severity;
  /** `file`, `header`, `footer`, or `detail[<index>]`. */
  readonly record: string;
  /** 1-based line number, or null for whole-file findings. */
  readonly line: number | null;
  readonly field: string | null;
  readonly message: string;
  /** Citations, `sourceKey:path:line`, resolvable through SOURCES. */
  readonly sources: readonly string[];
  /** `official` when the Tax Authority's own document backs this rule. */
  readonly basis: Basis;
  /** The document's own words, when it has words for this rule. */
  readonly officialText?: string;
  /** Present only where no rendered source settles the question. */
  readonly openQuestion?: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly findings: readonly Finding[];
  readonly parsed: ParsedPcn874;
  readonly counts: { readonly error: number; readonly warning: number; readonly info: number };
}

const DIGITS = /^\d+$/;
/** A(n) in Appendix A: the Latin letters and the digits, as the file is ASCII. */
const ALPHANUMERIC = /^[A-Z0-9]+$/;

function isValidYyyymmdd(value: string): boolean {
  if (!/^\d{8}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  if (year < 1900 || year > 2999) return false;
  if (month < 1 || month > 12) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

function isValidYyyymm(value: string): boolean {
  if (!/^\d{6}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  return year >= 1900 && year <= 2999 && month >= 1 && month <= 12;
}

function isZeros(value: string): boolean {
  return /^0+$/.test(value);
}

/** A finding's basis is the strongest kind of source it cites. */
export function basisOf(sources: readonly string[]): Basis {
  const kinds = sources.map(kindOf);
  if (kinds.includes('official')) return 'official';
  if (kinds.includes('vendor-manual')) return 'vendor-manual';
  return 'oss-only';
}

class Collector {
  readonly findings: Finding[] = [];

  add(finding: Omit<Finding, 'basis'>): void {
    this.findings.push({ ...finding, basis: basisOf(finding.sources) });
  }
}

function recordLabel(record: Pcn874Record): string {
  if (record.kind === 'detail') return `detail[${record.index}]`;
  if (record.kind === 'unknown') return `unknown[${record.index}]`;
  return record.kind;
}

/** Field-level checks shared by every record kind. */
function checkFields(c: Collector, record: Pcn874Record, spec: RecordSpec, rulePrefix: string): void {
  const label = recordLabel(record);
  for (const field of spec.fields) {
    const value = record.fields[field.id];
    if (value === undefined || value.length !== field.length) {
      // The record-length rule already reported the truncation; do not pile on.
      continue;
    }
    checkOneField(c, record, spec, field, value, label, rulePrefix);
  }
}

function checkOneField(
  c: Collector,
  record: Pcn874Record,
  spec: RecordSpec,
  field: FieldSpec,
  value: string,
  label: string,
  rulePrefix: string,
): void {
  const base = {
    record: label,
    line: record.line,
    field: field.id,
    sources: field.sources,
    ...(field.officialText ? { officialText: field.officialText } : {}),
    ...(field.openQuestion ? { openQuestion: field.openQuestion } : {}),
  };

  switch (field.class) {
    case 'literal': {
      if (value !== field.literal) {
        c.add({
          ...base,
          rule: `${rulePrefix}.${field.id}.literal`,
          severity: 'error',
          message: `${field.english}: expected ${JSON.stringify(field.literal)} at offset ${field.offset}, found ${JSON.stringify(value)}.`,
        });
      }
      break;
    }
    case 'sign': {
      if (value !== '+' && value !== '-') {
        c.add({
          ...base,
          rule: `${rulePrefix}.${field.id}.sign`,
          severity: 'error',
          message: `${field.english}: expected "+" or "-" at offset ${field.offset}, found ${JSON.stringify(value)}.`,
        });
        break;
      }
      checkSignOfZero(c, record, spec, field, value, label, rulePrefix);
      break;
    }
    case 'digits': {
      if (!DIGITS.test(value)) {
        c.add({
          ...base,
          rule: `${rulePrefix}.${field.id}.digits`,
          severity: 'error',
          message: `${field.english}: expected ${field.length} digits at offset ${field.offset}, found ${JSON.stringify(value)}. Appendix A declares this field N(${field.length}), and a field shorter than its declared width is filled with "preliminary zeros".`,
        });
      }
      break;
    }
    case 'alphanumeric': {
      if (!ALPHANUMERIC.test(value)) {
        c.add({
          ...base,
          rule: `${rulePrefix}.${field.id}.alphanumeric`,
          severity: 'error',
          message: `${field.english}: expected ${field.length} letters or digits at offset ${field.offset}, found ${JSON.stringify(value)}. Appendix A declares this field A(${field.length}) — letters ARE permitted here, which no open-source implementation knows.`,
        });
      }
      break;
    }
    case 'alpha': {
      if (!RECORD_TYPE_LETTERS.includes(value)) {
        c.add({
          ...base,
          rule: `${rulePrefix}.${field.id}.known`,
          severity: 'error',
          message: `${field.english}: ${JSON.stringify(value)} is not one of the eleven values in the Table of Values (${RECORD_TYPE_LETTERS.join(', ')}).`,
        });
      }
      break;
    }
  }
}

/**
 * "In a '+/-' field: When the amount field is zero, the value of the '+/-' field
 * will be '+'." — official line 174, restated by the sign table at line 535
 * ("Zero value field: +"). rcbuilder writes "-" on a zero reportedVat; the
 * document says otherwise, twice.
 */
function checkSignOfZero(
  c: Collector,
  record: Pcn874Record,
  spec: RecordSpec,
  field: FieldSpec,
  value: string,
  label: string,
  rulePrefix: string,
): void {
  if (value !== '-') return;
  const magnitude = magnitudeOf(spec, field);
  if (!magnitude) return;
  const digits = record.fields[magnitude.id];
  if (digits === undefined || digits.length !== magnitude.length || !isZeros(digits)) return;

  c.add({
    rule: `${rulePrefix}.${field.id}.signOfZero`,
    severity: 'error',
    record: label,
    line: record.line,
    field: field.id,
    message: `${field.english}: the amount in ${magnitude.id} is zero, so this sign must be "+", not "-".`,
    sources: [ita('174'), ita('523-535'), `accounter:packages/pcn874-generator/src/utils/data-handlers.ts:28`],
    officialText:
      'In a "+/-" field: When the amount field is zero, the value of the "+/-" field will be "+" (line 174). ' +
      'Appendix C §2 repeats it in its table of signs: the "Zero value field" takes "+" (lines 523-535).',
  });
}

function checkRecordLength(
  c: Collector,
  record: Pcn874Record,
  spec: RecordSpec,
  rule: string,
): boolean {
  if (record.raw.length === spec.length) return true;
  c.add({
    rule,
    severity: 'error',
    record: recordLabel(record),
    line: record.line,
    field: null,
    message: `${spec.kind} record must be exactly ${spec.length} characters, found ${record.raw.length}.`,
    sources: spec.sources,
    ...(spec.officialText ? { officialText: spec.officialText } : {}),
    ...(spec.openQuestion ? { openQuestion: spec.openQuestion } : {}),
  });
  return false;
}

function checkHeader(c: Collector, header: Pcn874Record): void {
  const lengthOk = checkRecordLength(c, header, HEADER, 'header.length');
  checkFields(c, header, HEADER, 'header');
  if (!lengthOk) return;

  const reportMonth = header.fields['reportMonth'] ?? '';
  if (DIGITS.test(reportMonth) && !isValidYyyymm(reportMonth)) {
    c.add({
      rule: 'header.reportMonth.calendar',
      severity: 'error',
      record: 'header',
      line: header.line,
      field: 'reportMonth',
      message: `reported period must be a real YYYYMM, found ${JSON.stringify(reportMonth)}.`,
      sources: [ita('102'), 'accounter:packages/pcn874-generator/src/schemas.ts:11,21'],
      officialText: 'Month for which detailed report is being submitted   N(6)   Yyyymm form',
    });
  }

  const generationDate = header.fields['generationDate'] ?? '';
  if (DIGITS.test(generationDate) && !isValidYyyymmdd(generationDate)) {
    c.add({
      rule: 'header.generationDate.calendar',
      severity: 'error',
      record: 'header',
      line: header.line,
      field: 'generationDate',
      message: `file generation date must be a real YYYYMMDD, found ${JSON.stringify(generationDate)}.`,
      sources: [ita('105'), 'accounter:packages/pcn874-generator/src/schemas.ts:12,22-25'],
      officialText: 'File Generation Date   N(8)   Yyyymm form',
      openQuestion: HEADER.fields.find(f => f.id === 'generationDate')?.openQuestion,
    });
  }

  for (const id of ['differentRateSalesAmount', 'differentRateSalesVat'] as const) {
    const value = header.fields[id] ?? '';
    if (DIGITS.test(value) && !isZeros(value)) {
      c.add({
        rule: `header.${id}.reserved`,
        severity: 'warning',
        record: 'header',
        line: header.line,
        field: id,
        message: `reserved field is non-zero (${JSON.stringify(value)}). The circular says this field carries zeros; it also says "for future use", so a later edition may have given it a meaning. A warning, not an error, for exactly that reason.`,
        sources: [ita('110-113')],
        officialText:
          'Total of sales taxable at different rate (excluding VAT)   N(11)   Currently zeros – for future use; ' +
          'Total VAT on sales taxable at different rate   N(9)   Currently zeros – for future use. Both sign ' +
          'fields are marked Currently "+".',
      });
    }
  }
}

function checkFooter(c: Collector, footer: Pcn874Record, header: Pcn874Record | undefined): void {
  const first = footer.raw.charAt(0);
  const isRepresentativeZ = first === REPRESENTATIVE_SUMMARY_RECORD_TYPE;

  if (isRepresentativeZ) {
    c.add({
      rule: 'footer.recordType.literal',
      severity: 'error',
      record: 'footer',
      line: footer.line,
      field: 'recordType',
      message:
        `closing entry starts with "${REPRESENTATIVE_SUMMARY_RECORD_TYPE}"; an individual merchant's PCN874 closes with ` +
        `"${FOOTER_RECORD_TYPE}". "Z" is not a mistake in the abstract — it is the summary entry of Appendix B, the file ` +
        'a representative submits for several users at once, and that file has a different shape entirely ' +
        '(an "A" initial entry, then per-user reports, then "Z" + number of users + number of entries). ' +
        'This validator validates the individual merchant file of Appendix A only.',
      sources: [ita('158'), ita('194-215'), 'linet3:protected/models/FormReportPcn874.php:94-99'],
      officialText:
        'Closing Entry: Entry Type   A(1)   "X" – fixed value (line 158). Appendix B: Entry Type   A(1)   ' +
        '"Z" – fixed value (line 209).',
    });
  }

  const lengthOk = checkRecordLength(c, footer, FOOTER, 'footer.length');
  if (!isRepresentativeZ) checkFields(c, footer, FOOTER, 'footer');
  else {
    const dealer = footer.fields['licensedDealerId'];
    if (dealer !== undefined && dealer.length === 9 && !DIGITS.test(dealer)) {
      c.add({
        rule: 'footer.licensedDealerId.digits',
        severity: 'error',
        record: 'footer',
        line: footer.line,
        field: 'licensedDealerId',
        message: `closing entry dealer id must be 9 digits, found ${JSON.stringify(dealer)}.`,
        sources: FOOTER.fields[1]!.sources,
        officialText: FOOTER.fields[1]!.officialText,
      });
    }
  }
  if (!lengthOk || !header) return;

  const headerDealer = header.fields['licensedDealerId'];
  const footerDealer = footer.fields['licensedDealerId'];
  if (headerDealer && footerDealer && headerDealer !== footerDealer) {
    c.add({
      rule: 'footer.licensedDealerId.matchesHeader',
      severity: 'error',
      record: 'footer',
      line: footer.line,
      field: 'licensedDealerId',
      message: `closing entry dealer id ${JSON.stringify(footerDealer)} does not match the header's ${JSON.stringify(headerDealer)}. One file is one merchant's report for one period; a representative reporting for several merchants uses the Appendix B alignment file, which this validator does not check.`,
      sources: [ita('101'), ita('159-161'), ita('194-215')],
      officialText:
        "Header: Customer's Licensed Dealer identification Number   N(9) (line 101). Closing Entry: Licensed " +
        'Dealer Identification Number of submitter   N(9) (lines 159-161).',
    });
  }
}

/**
 * Per-entry-type constraints, from Appendix 'C' — the table of permitted values
 * per document type (lines 220-517) and the notes that follow it (lines 536-574).
 *
 * Before the official document was rendered these were single-sourced warnings
 * from one implementation. Most are now the Authority's own words, and the ones
 * the document states flatly are errors. Two stay warnings on purpose, and the
 * finding says which and why.
 */
function checkDetailSemantics(c: Collector, record: Pcn874Record): void {
  const type = record.fields['recordType'];
  if (!type || !(type in RECORD_TYPES)) return;
  const label = recordLabel(record);
  const vatId = record.fields['counterpartyVatId'] ?? '';
  const refNumber = record.fields['refNumber'] ?? '';
  const totalVat = record.fields['totalVat'] ?? '';

  const at = (
    rule: string,
    severity: Severity,
    field: string,
    message: string,
    sources: string[],
    officialText: string,
    openQuestion?: string,
  ): void => {
    c.add({
      rule,
      severity,
      record: label,
      line: record.line,
      field,
      message,
      sources,
      officialText,
      ...(openQuestion ? { openQuestion } : {}),
    });
  };

  if (type === 'S' && vatId.length === 9 && isZeros(vatId)) {
    at(
      'detail.S.counterpartyExpected',
      'warning',
      'counterpartyVatId',
      'entry type S is a sale to an identified commercial customer, and Appendix C marks the counter-party number compulsory for it. An unidentified or aggregated sale is reported as L, whose counter-party field is zeros. A warning rather than an error because the document also allows a small identified sale to be aggregated instead.',
      [ita('250-268'), ita('537-542')],
      'Appendix C, "Regular \'SL\' – identified commercial customer   S   Customer   V …" (lines 250-268), ' +
        'where "V" symbolizes a compulsory field. Note A: "In a sale where the pre-VAT amount is higher than ' +
        '5,000 NIS, it is obligatory to state the customer\'s merchant number … In sales with lower amounts ' +
        'the identification of a commercial customer is optional and they may be reported either as a separate ' +
        'entries or as one or more aggregated entries" (lines 537-542).',
    );
  }

  if (type === 'L' && vatId.length === 9 && !isZeros(vatId)) {
    at(
      'detail.L.vatIdZeros',
      'error',
      'counterpartyVatId',
      `entry type L is a sale to an unidentified (private) customer, so the counter-party VAT id must be 000000000; found ${JSON.stringify(vatId)}. A sale to a customer you can identify is entry type S.`,
      [ita('292-334'), ita('543-549')],
      'Appendix C, both L rows: "Private Customer \'SL\'/unidentified-cash register aggregation etc.   L   ' +
        'Zeros   Date of Aggregation …" and "Zero Value/Exempt \'SL\' – private customer – aggregated   L   ' +
        'Zeros …" (lines 292-334).',
    );
  }

  if (type === 'K') {
    if (vatId.length === 9 && !isZeros(vatId)) {
      at(
        'detail.K.vatIdZeros',
        'error',
        'counterpartyVatId',
        `entry type K aggregates petty cash across suppliers, so the counter-party VAT id must be 000000000; found ${JSON.stringify(vatId)}.`,
        [ita('436-456')],
        'Appendix C: "\'IN\'-Petty Cash   K   Zeros   Entry Date   Zeros/V   No. of Invoices   V   V   V   Zeros" ' +
          '(lines 436-456).',
      );
    }
    if (refNumber.length === 9 && isZeros(refNumber)) {
      at(
        'detail.K.refNumberInvoiceCount',
        'warning',
        'refNumber',
        'entry type K carries the number of invoices in the aggregated entry in the reference-number field, and an entry that exists aggregates at least one invoice, so zeros is unlikely to be what was meant. A warning, not an error: the document gives the field its meaning but never forbids the value.',
        [ita('446'), ita('566-572')],
        'Appendix C gives K\'s reference-number cell as "No. of Invoices" (line 446), and note E ends: ' +
          '"The reference number will reflect the number of invoices in the entry" (line 572).',
      );
    }
  }

  if (type === 'R' && refNumber.length === 9 && !isZeros(refNumber)) {
    at(
      'detail.R.refNumberZeros',
      'warning',
      'refNumber',
      `entry type R is an import entry, whose reference-number cell in Appendix C is "Zeros"; found ${JSON.stringify(refNumber)}. Kept a warning rather than an error because the document is not of one mind here: the R row also carries the comment marker "D", and note D says "The reference number will include the invoice number".`,
      [ita('457-477'), ita('560-565')],
      'Appendix C: "\'IN\'-Import Entry   R   Import Entry   Import Entry Date   Zeros/V   Zeros   V   V   V   ' +
        'Zeros   D" (lines 457-477). Note D, headed "Export Entry Sale", says "The reference number will ' +
        'include the invoice number" (lines 560-565) — written about Y, but marked on the R row too.',
      'Appendix C\'s R row says the reference number is zeros; the comment marker "D" on the same row points at ' +
        'a note written about export entries that says the opposite. Nothing in the rendered sources resolves ' +
        'which governs an import entry, so this stays a warning.',
    );
  }

  if (type === 'Y' && totalVat.length === 9 && !isZeros(totalVat)) {
    at(
      'detail.Y.vatZeros',
      'error',
      'totalVat',
      `entry type Y is an export and carries no VAT, so the VAT field must be 000000000; found ${JSON.stringify(totalVat)}.`,
      [ita('356-376'), ita('560-565')],
      'Appendix C: "\'SL\' – Export Entry   Y   Export Entry or \'999999999\'   Export Entry Date   Zeros/V   V   ' +
        'Zeros   V   V   Zeros   D" (lines 356-376), and note D: "The sum of the VAT will include zeros" ' +
        '(line 564).',
    );
  }
}

/**
 * Header-vs-details cross-checks.
 *
 * The two record COUNTS are checked as errors: Appendix A defines each of them
 * as the number of records of a kind, the Table of Values says which letters are
 * which kind, and a count that disagrees with the records it counts cannot be
 * right. No AMOUNT is cross-checked, and that is deliberate — see reportedVat's
 * openQuestion in the layout table, and the H-ERP manual's note that per-entry
 * rounding makes the header totals differ from the books by a few tens of
 * shekels without invalidating the filing.
 */
function checkTotals(c: Collector, header: Pcn874Record, details: readonly Pcn874Record[]): void {
  // Sorted so the message is stable and readable; the Table of Values order is
  // S L M Y I / T K R P H C (official lines 181-191).
  const salesLetters = Object.entries(RECORD_TYPES)
    .filter(([, v]) => v.side === 'sale')
    .map(([k]) => k)
    .sort();
  const inputLetters = Object.entries(RECORD_TYPES)
    .filter(([, v]) => v.side === 'input')
    .map(([k]) => k)
    .sort();

  const countOf = (letters: string[]): number =>
    details.filter(d => letters.includes(d.fields['recordType'] ?? '')).length;

  const declared = (id: string): number | null => {
    const raw = header.fields[id];
    if (raw === undefined || !DIGITS.test(raw)) return null;
    return Number(raw);
  };

  const salesDeclared = declared('salesRecordCount');
  const salesActual = countOf(salesLetters);
  if (salesDeclared !== null && salesDeclared !== salesActual) {
    c.add({
      rule: 'totals.salesRecordCount',
      severity: 'error',
      record: 'header',
      line: header.line,
      field: 'salesRecordCount',
      message: `header declares ${salesDeclared} sales records; the file contains ${salesActual} (entry types ${salesLetters.join(', ')}).`,
      sources: [ita('114-115'), ita('181-185')],
      officialText:
        'Total number of records for "sales"*   N(9)   Number of sales records - both taxable and zero-rated/ ' +
        'exempt (lines 114-115). The Table of Values marks S, L, M, Y and I as "Sales" (lines 181-185), which ' +
        'settles the scope rcbuilder left open by never emitting M, Y or I.',
    });
  }

  const inputsDeclared = declared('inputsCount');
  const inputsActual = countOf(inputLetters);
  if (inputsDeclared !== null && inputsDeclared !== inputsActual) {
    c.add({
      rule: 'totals.inputsCount',
      severity: 'error',
      record: 'header',
      line: header.line,
      field: 'inputsCount',
      message: `header declares ${inputsDeclared} input records; the file contains ${inputsActual} (entry types ${inputLetters.join(', ')}).`,
      sources: [ita('124'), ita('186-191')],
      officialText:
        'Total number of records for inputs (other and equipment)   N(9) (line 124). The Table of Values marks ' +
        'T, K, R, P, H and C as "Input" (lines 186-191), so all six count — rcbuilder counts only T records, ' +
        'and the document says otherwise.',
    });
  }
}

function checkFileShape(c: Collector, parsed: ParsedPcn874): void {
  const { records } = parsed;

  if (parsed.nonAsciiOffsets.length > 0) {
    c.add({
      rule: 'file.encoding.ascii',
      severity: 'error',
      record: 'file',
      line: null,
      field: null,
      message: `file contains ${parsed.nonAsciiOffsets.length} character(s) outside printable ASCII, first at offset ${parsed.nonAsciiOffsets[0]}. Every field in Appendix A is N(n) digits, A(n) letters or a "+/-" sign; no other character has a defined meaning.`,
      sources: [
        ita('96-161'),
        'accounter:packages/pcn874-generator/src/utils/builders.ts:22,37,41',
        'rcbuilder:CODE/PCN-874/PCN874_Sample.txt (ASCII text)',
      ],
      officialText:
        'Appendix A types every field as A(n), N(n) or "+/-"; the file has no declared encoding beyond that.',
    });
  }

  if (parsed.lineEnding === 'mixed') {
    c.add({
      rule: 'file.lineEnding.mixed',
      severity: 'warning',
      record: 'file',
      line: null,
      field: null,
      message:
        'file mixes line endings. Any of LF, CRLF and CR is accepted, because no rendered source states which is required; a file should still not mix them.',
      sources: [
        'accounter:packages/pcn874-generator/src/utils/builders.ts:37,41',
        'rcbuilder:...PCN874Manager.cs:571-575',
      ],
      openQuestion:
        'The official circular describes the file as "of a fixed structure" and lists the entries in order ' +
        '(lines 39-42) but never states a record separator, a trailing newline, or an encoding. Neither Hebrew ' +
        'manual states one either. So this rule rests on implementations alone, and only flags inconsistency ' +
        'within one file rather than picking a winner.',
    });
  }

  if (records.length === 0) {
    c.add({
      rule: 'file.empty',
      severity: 'error',
      record: 'file',
      line: null,
      field: null,
      message: 'file contains no records. Appendix A requires a header entry and a closing entry at the least.',
      sources: [ita('39-40'), 'accounter:packages/pcn874-generator/src/index.ts:31-34'],
      officialText:
        'The file will include a header (summary) entry, transaction entries and a closing entry as detailed ' +
        "in Appendix 'A'.",
    });
    return;
  }

  const headers = records.filter(r => r.kind === 'header');
  const footers = records.filter(r => r.kind === 'footer');
  const details = records.filter(r => r.kind === 'detail');
  const unknown = records.filter(r => r.kind === 'unknown');

  for (const r of unknown) {
    const letter = r.raw.charAt(0);
    const representative = letter === REPRESENTATIVE_INITIAL_RECORD_TYPE;
    c.add({
      rule: 'file.record.unknown',
      severity: 'error',
      record: recordLabel(r),
      line: r.line,
      field: null,
      message:
        `record starts with ${JSON.stringify(letter)}, which is neither the header "O", the closing entry "X", nor one of the eleven entry types ${RECORD_TYPE_LETTERS.join(', ')}.` +
        (representative
          ? ' "A" is the initial entry of Appendix B — the alignment file a representative submits for several users at once. This validator checks the individual merchant file of Appendix A only.'
          : ''),
      sources: representative
        ? [ita('100'), ita('158'), ita('176-192'), REPRESENTATIVE_SOURCE]
        : [ita('100'), ita('158'), ita('176-192')],
      officialText: representative
        ? 'Appendix B, Initial Entry: Entry Type   A(1)   "A" – fixed value (line 198).'
        : 'Header Entry: "O" – fixed value (line 100); Closing Entry: "X" – fixed value (line 158); Table of Values (lines 176-192).',
    });
  }

  if (headers.length === 0) {
    c.add({
      rule: 'file.header.missing',
      severity: 'error',
      record: 'file',
      line: null,
      field: null,
      message: 'file has no header entry (a record starting with "O").',
      sources: [ita('39-40'), ita('100')],
      officialText:
        'The file will include a header (summary) entry, transaction entries and a closing entry as detailed ' +
        "in Appendix 'A'.",
    });
  } else if (headers.length > 1) {
    c.add({
      rule: 'file.header.duplicate',
      severity: 'error',
      record: 'file',
      line: headers[1]!.line,
      field: null,
      message: `file has ${headers.length} header entries; Appendix A gives one, and it summarises the whole period.`,
      sources: [ita('39-40'), ita('94-126')],
      officialText:
        'The file will include a header (summary) entry, transaction entries and a closing entry as detailed ' +
        "in Appendix 'A'.",
    });
  } else if (records[0]!.kind !== 'header') {
    c.add({
      rule: 'file.header.position',
      severity: 'error',
      record: 'header',
      line: headers[0]!.line,
      field: null,
      message: 'the header entry must be the first record in the file.',
      sources: [ita('39-40')],
      officialText:
        'The file will include a header (summary) entry, transaction entries and a closing entry as detailed ' +
        "in Appendix 'A'. Due to the fact that the file is of a fixed structure…",
    });
  }

  if (footers.length === 0) {
    c.add({
      rule: 'file.footer.missing',
      severity: 'error',
      record: 'file',
      line: null,
      field: null,
      message: 'file has no closing entry (a record starting with "X").',
      sources: [ita('39-40'), ita('158')],
      officialText: 'Closing Entry: Entry Type   A(1)   "X" – fixed value.',
    });
  } else if (footers.length > 1) {
    c.add({
      rule: 'file.footer.duplicate',
      severity: 'error',
      record: 'file',
      line: footers[1]!.line,
      field: null,
      message: `file has ${footers.length} closing entries; Appendix A gives one, last.`,
      sources: [ita('39-40'), ita('154-161')],
      officialText: 'Closing Entry: Entry Type   A(1)   "X" – fixed value.',
    });
  } else if (records[records.length - 1]!.kind !== 'footer') {
    c.add({
      rule: 'file.footer.position',
      severity: 'error',
      record: 'footer',
      line: footers[0]!.line,
      field: null,
      message: 'the closing entry must be the last record in the file.',
      sources: [ita('39-40'), ita('154-161')],
      officialText:
        'The file will include a header (summary) entry, transaction entries and a closing entry as detailed ' +
        "in Appendix 'A'.",
    });
  }

  if (details.length === 0 && headers.length === 1 && footers.length === 1) {
    c.add({
      rule: 'file.detail.none',
      severity: 'warning',
      record: 'file',
      line: null,
      field: null,
      message:
        'file has a header and a closing entry but no transaction entries. A period with no transactions is plausible, so this is not treated as an error.',
      sources: [
        ita('39-40'),
        'accounter:packages/pcn874-generator/src/index.ts:31-34',
        'rcbuilder:CODE/PCN-874/PCN874_Sample_No_L_AND_NO_S_transactions.txt',
      ],
      officialText:
        'The file will include a header (summary) entry, transaction entries and a closing entry as detailed ' +
        "in Appendix 'A'.",
      openQuestion:
        'The circular lists transaction entries in the file but never says a minimum of one, and neither Hebrew ' +
        'manual addresses a period with nothing to report. accounter\'s own validator rejects a file of fewer ' +
        'than three lines; rcbuilder ships a sample with no S or L records. Unsettled, so a warning.',
    });
  }
}

/**
 * Validate PCN874 content.
 *
 * @param input the file text, or the result of {@link parsePcn874}.
 */
export function validatePcn874(input: string | ParsedPcn874): ValidationResult {
  const parsed = isParsed(input) ? input : parsePcn874(input);
  const c = new Collector();

  checkFileShape(c, parsed);

  const header = parsed.records.find(r => r.kind === 'header');
  const footer = [...parsed.records].reverse().find(r => r.kind === 'footer');
  const details = parsed.records.filter(r => r.kind === 'detail');

  if (header) checkHeader(c, header);
  for (const detail of details) {
    checkRecordLength(c, detail, DETAIL, 'detail.length');
    checkFields(c, detail, DETAIL, 'detail');
    checkDetailSemantics(c, detail);
  }
  if (footer) checkFooter(c, footer, header);
  if (header && header.raw.length === HEADER.length) checkTotals(c, header, details);

  const findings = c.findings;
  const counts = {
    error: findings.filter(f => f.severity === 'error').length,
    warning: findings.filter(f => f.severity === 'warning').length,
    info: findings.filter(f => f.severity === 'info').length,
  };

  return { valid: counts.error === 0, findings, parsed, counts };
}
