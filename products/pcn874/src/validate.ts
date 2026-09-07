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
/**
 * A(n) in Appendix A. The document types the field and never states its
 * alphabet, so this is the set nothing disputes: the Latin letters in either
 * case, and the digits. Anything outside it is a WARNING, not an error — see
 * {@link A_N_ALPHABET_OPEN}.
 */
const ALPHANUMERIC = /^[A-Za-z0-9]+$/;

/**
 * Why a character outside `[A-Za-z0-9]` in an A(n) field is a warning rather
 * than an error, and why the same reasoning demotes `file.encoding.ascii`.
 */
const A_N_ALPHABET_OPEN =
  'Appendix A types the reference group A(4) — "Series etc.   zeros are possible at this stage" ' +
  '(line 139) — and Appendix C\'s notes call its content "internal characters of the submitter ' +
  '(series/branch etc.)" (lines 580-581). Neither line, and nothing else in the circular or in ' +
  'either vendor manual, defines the character set of an A(n) field: not case, not punctuation, ' +
  'not script, and not the byte encoding of the file. So a value outside the Latin letters and the ' +
  'digits is reported, but not as the breach of a stated rule. Whether the Authority\'s reader ' +
  'accepts it is unknown, and rejecting a legal file is as much a defect as accepting an illegal one.';

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
          severity: 'warning',
          message: `${field.english}: ${JSON.stringify(value)} at offset ${field.offset} contains a character that is neither a Latin letter nor a digit. Appendix A declares this field A(${field.length}) and never says which characters an A(n) field admits, so this is reported rather than rejected. Letters in either case and digits pass with no finding at all.`,
          openQuestion: A_N_ALPHABET_OPEN,
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
 * will be '+'." — official line 174, and line 174 alone. Appendix C §2's table
 * of signs used to be quoted here as a restatement; it is not one. Four of its
 * five columns are kinds of TRANSACTION (sale to the customer, credit to the
 * customer, purchase from supplier, credit from supplier) and the fifth is
 * headed "Zero value / field" — and the document uses "zero value" to mean
 * zero-RATED throughout (lines 57, 169-170, 271, 551). Read that way the column
 * says "a zero-rated transaction takes +", which is a different rule. The quote
 * now rests on 174.
 *
 * The header carries one amount per sign, so 174 is unambiguous there. A
 * TRANSACTION record has one sign and two amount fields — the VAT sum (lines
 * 142-144) and the invoice total excluding VAT (lines 148-149) — and line 524
 * says the sign "represents the positive/negative sign of the value of the
 * input", i.e. of the document rather than of one named amount. Which amount 174
 * means there is not stated, so a record whose invoice total is zero while its
 * VAT is not — a VAT-only correction or credit — gets a warning, and only a
 * record with BOTH amounts zero gets the error.
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

  const common = {
    rule: `${rulePrefix}.${field.id}.signOfZero`,
    record: label,
    line: record.line,
    field: field.id,
  };
  const officialText =
    'In a "+/-" field: When the amount field is zero, the value of the "+/-" field will be "+" (line 174).';

  if (spec.kind === 'detail') {
    const vat = record.fields['totalVat'] ?? '';
    const vatIsZero = DIGITS.test(vat) && vat.length === 9 && isZeros(vat);
    if (!vatIsZero) {
      c.add({
        ...common,
        severity: 'warning',
        message: `${field.english}: ${magnitude.id} is zero, but totalVat is ${JSON.stringify(vat)}. Line 174 says a "+/-" field whose amount is zero takes "+"; a transaction record has ONE sign and TWO amounts, and the document never says which of them line 174 means. A VAT-only correction or credit is a real document, so this is reported rather than rejected.`,
        sources: [ita('174'), ita('523-524'), ita('142-144'), ita('148-149')],
        officialText:
          `${officialText} Appendix C §2: "Table of possible values for a field marked/designated "+/-". ` +
          'This field represents the positive/negative sign of the value of the input" (lines 523-524).',
        openQuestion:
          'A transaction record carries one "+/-" field (lines 145-146) and two amount fields — the VAT ' +
          'sum (lines 142-144) and the invoice total excluding VAT (lines 148-149). Line 174 says "the ' +
          'amount field", singular, and line 524 says the sign is that "of the value of the input" — of ' +
          'the document, not of a named amount. Nothing rendered says which amount governs when the two ' +
          'disagree, so this validator reports an error only when BOTH are zero, and warns when the ' +
          'invoice total alone is.',
      });
      return;
    }
  }

  c.add({
    ...common,
    severity: 'error',
    message:
      `${field.english}: the amount in ${magnitude.id} is zero, so this sign must be "+", not "-".` +
      (spec.kind === 'detail'
        ? ' Both amount fields of this record are zero, so the two readings of line 174 agree here.'
        : ''),
    sources: [ita('174'), `accounter:packages/pcn874-generator/src/utils/data-handlers.ts:28`],
    officialText,
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
      // A WARNING, not an error, and the reason is this file's own severity
      // rule: line 105 types the field N(8) and describes it as "Yyyymm form",
      // which cannot both be right. Reading it as YYYYMMDD is what all three
      // implementations do, not what the Authority states, and "two parts of the
      // document pull in different directions" is the definition of a warning
      // here. The practical risk is small — every implementation writes
      // YYYYMMDD — but the rule may not claim the document says so.
      rule: 'header.generationDate.calendar',
      severity: 'warning',
      record: 'header',
      line: header.line,
      field: 'generationDate',
      message: `file generation date is not a real YYYYMMDD date: ${JSON.stringify(generationDate)}. Line 105 types this field N(8) and then describes it as "Yyyymm form", which is the six-character comment the report-month field carries on line 102; the two cannot both be right. YYYYMMDD is the reading all three implementations write, so this is reported rather than rejected.`,
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
      // A WARNING, not an error. No line of the circular says the two numbers
      // are equal: line 101 names the header's field "Customer's Licensed Dealer
      // identification Number" and lines 159-161 name the closing entry's
      // "Licensed Dealer Identification Number OF SUBMITTER". Appendix A is
      // headed "Individual Merchant" (line 91), which implies identity without
      // stating it, and the vendor manuals describe production types the
      // circular does not (H-ERP lines 990-1002). Reporting it as an error
      // claimed `basis: official` for an inference.
      rule: 'footer.licensedDealerId.matchesHeader',
      severity: 'warning',
      record: 'footer',
      line: footer.line,
      field: 'licensedDealerId',
      message: `closing entry dealer id ${JSON.stringify(footerDealer)} does not match the header's ${JSON.stringify(headerDealer)}. Appendix A is headed "Individual Merchant", where the two are the same number — but the document names the header field the CUSTOMER's and the closing field the SUBMITTER's and never says they are equal, so this is reported rather than rejected. A representative reporting for several merchants uses the Appendix B alignment file, which this validator does not check.`,
      sources: [
        ita('101'),
        ita('159-161'),
        ita('91'),
        ita('194-215'),
        'herp:research/rendered/pcn874-h-erp-mirror.txt:990-1002',
      ],
      officialText:
        "Header: Customer's Licensed Dealer identification Number   N(9) (line 101). Closing Entry: Licensed " +
        'Dealer Identification Number of submitter   N(9) (lines 159-161). The appendix is headed ' +
        '"Appendix \'A\' – PCN874 File Structure – New – Individual Merchant" (line 91).',
      openQuestion:
        'No rendered line states that the closing entry\'s dealer number equals the header\'s. The document ' +
        'calls one "Customer\'s Licensed Dealer identification Number" (line 101) and the other "Licensed ' +
        'Dealer Identification Number of submitter" (lines 159-161); Appendix A\'s "Individual Merchant" ' +
        'heading (line 91) implies they coincide for that file without saying so. The H-ERP manual ' +
        'describes three production types the circular never mentions — a single-dealer file, a file ' +
        'shared by several dealers "relevant for representatives", and a union of dealers (lines 990-1002) ' +
        '— and says nothing about what the closing record of those carries. So: reported, not rejected.',
    });
  }
}

/**
 * The Appendix C rows whose counter-party cell names a party rather than
 * "Zeros", with the row quoted as the document prints it.
 *
 * `L` and `K` are absent because their cell IS "Zeros" — those two are the
 * opposite rule, `detail.L.vatIdZeros` and `detail.K.vatIdZeros`. `S` is absent
 * because note A qualifies it with a figure and is handled on its own. `Y` and
 * `R` are absent because their cells are an export entry number (or
 * "999999999") and an import entry number, which are not VAT identification
 * numbers and which note D lets be zeros "for service without an export entry"
 * (lines 564-565).
 *
 * `H` is a warning and the rest are errors: note F ends "Counter file number:
 * in accordance with 'Sha'am' guidelines" (line 574), and those guidelines are
 * not in any rendered document, so the circular itself defers on that row.
 */
const COUNTERPARTY_ROWS: Readonly<
  Record<
    string,
    {
      readonly severity: Severity;
      readonly what: string;
      /** The counter-party cell, as Appendix C prints it. */
      readonly cell: string;
      /** The whole row, cell by cell, as Appendix C prints it. */
      readonly rowQuote: string;
      /** The `ita` line range of the row. */
      readonly rowLines: string;
      readonly extraMessage?: string;
      readonly extraSources?: readonly string[];
      readonly extraText?: string;
      readonly openQuestion?: string;
    }
  >
> = Object.freeze({
  M: {
    severity: 'error',
    what: 'a self-invoice sale',
    cell: 'Supplier',
    rowQuote: '"SL" – Self Invoice   M   Supplier   V   Zeros/V   V   V   V   V   Zeros   C',
    rowLines: '335-355',
    extraMessage:
      'A self-invoice sale carries the SUPPLIER\'s number, which note C states outright — so "there is no customer" is not a reason for zeros here.',
    extraSources: [ita('556-557')],
    extraText:
      'Note C: "Self Invoice Sales – the supplier number will be entered in the place of the counter party ' +
      'file number" (lines 556-557).',
  },
  I: {
    severity: 'error',
    what: 'a sale to a Palestinian Authority customer',
    cell: 'Customer',
    rowQuote:
      '"SL"- Palestinian Authority Customer   I   Customer   V   Zeros/V   V   V   V   V   Zeros',
    rowLines: '377-395',
  },
  T: {
    severity: 'error',
    what: 'a regular input from an Israeli supplier',
    cell: 'Supplier',
    rowQuote:
      '"IN"-"regular" from Israeli Supplier   T   Supplier   V   Zeros/V   V   V   V   V   Zeros',
    rowLines: '396-414',
    extraMessage:
      'An input with no identified supplier has no entry type that fits: the aggregating input row is petty cash, "IN"-Petty Cash   K, and it is capped by note E.',
  },
  C: {
    severity: 'error',
    what: 'a self-invoice input',
    cell: 'Supplier',
    rowQuote: '"IN"-Self Invoice   C   Supplier   V   Zeros/V   V   V   V   V   Zeros   C',
    rowLines: '415-435',
    extraSources: [ita('556-557')],
    extraText:
      'The row carries note C, which says of the sale side: "Self Invoice Sales – the supplier number will ' +
      'be entered in the place of the counter party file number" (lines 556-557).',
  },
  P: {
    severity: 'error',
    what: 'an input from a Palestinian Authority supplier',
    cell: 'Supplier',
    rowQuote:
      '"IN"-Supplier from Palestinian Authority   P   Supplier   V   Zeros/V   V   V   V   V   Zeros',
    rowLines: '478-496',
  },
  H: {
    severity: 'warning',
    what: 'an input on another document permitted by law',
    cell: 'Supplier',
    rowQuote:
      '"IN"-Other Document (by law)   H   Supplier   V   Zeros/V   V   V   V   V   Zeros   F',
    rowLines: '497-517',
    extraMessage:
      'Reported rather than rejected: this is the one row whose comment marker sends the counter-party field to a document nobody here has — note F.',
    extraSources: [ita('573-574')],
    extraText:
      'The row carries note F: "Other Document Input: Reference Number – if unknown: will be entered as ' +
      'zeros. Counter file number: in accordance with "Sha\'am" guidelines" (lines 573-574).',
    openQuestion:
      'Appendix C gives the H row\'s counter party as "Supplier" under "All fields are compulsory", but the ' +
      'row\'s own comment marker is F, and note F says the counter file number is "in accordance with ' +
      '\'Sha\'am\' guidelines" (line 574). Those guidelines are not in the circular and not in either vendor ' +
      'manual, so nothing rendered says whether zeros is among the values they allow. A warning is the ' +
      'ceiling this row supports.',
  },
});

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
    // Note A puts a figure on it: above ₪5,000 before VAT the customer's
    // merchant number is "obligatory", and below it identification is
    // "optional" and the sale may be aggregated instead. So the same missing
    // number is an error above the figure and a warning at or below it. The
    // figure itself is one the document says may move (lines 586-588), which is
    // quoted into both findings rather than hidden.
    const invoiceSum = record.fields['invoiceSum'] ?? '';
    const readable = invoiceSum.length === 10 && DIGITS.test(invoiceSum);
    const amount = readable ? Number(invoiceSum) : null;
    const aboveNoteA = amount !== null && amount > 5000;
    const officialTextS =
      'Appendix C, "Regular \'SL\' – identified commercial customer   S   Customer   V …" (lines 250-268), ' +
      'where "V" symbolizes a compulsory field. Note A: "Regular local sale to commercial customer – In a ' +
      "sale where the pre-VAT amount is higher than 5,000 NIS, it is obligatory to state the customer's " +
      'merchant number (it is a prerequisite to customer input offset). In sales with lower amounts the ' +
      'identification of a commercial customer is optional and they may be reported either as a separate ' +
      'entries or as one or more aggregated entries" (lines 537-542). The document adds: "Parameter values ' +
      'may change from time to time. These changes will be published in memos and will be valid for a ' +
      'specified period e.g 5000 shekels/2% etc." (lines 586-588).';

    at(
      'detail.S.counterpartyExpected',
      aboveNoteA ? 'error' : 'warning',
      'counterpartyVatId',
      aboveNoteA
        ? `entry type S is a sale to an identified commercial customer and this record's pre-VAT total is ${amount} shekels, above the 5,000 note A names, where stating the customer's merchant number is "obligatory". The counter-party field is zeros. The aggregation note A allows for smaller sales does not reach this amount; an unidentified sale of this size has no entry type that fits.`
        : `entry type S is a sale to an identified commercial customer, and Appendix C marks the counter-party number compulsory for it; the field is zeros. Reported rather than rejected because this record's pre-VAT total${amount === null ? ' could not be read' : ` is ${amount} shekels`}, at or below the 5,000 above which note A makes the customer's number obligatory, and below that figure note A calls identification optional and allows the sale to be aggregated instead (an aggregated or unidentified sale is entry type L, whose counter-party field is zeros).`,
      [ita('250-268'), ita('537-542'), ita('586-588')],
      officialTextS,
      aboveNoteA
        ? 'The 5,000-shekel figure is the document\'s own, but the document also says parameter values ' +
          '"may change from time to time … e.g 5000 shekels/2% etc." (lines 586-588), and no memo issued ' +
          'since 2009 has been rendered in this repository. The H-ERP manual, current to 2025, still shows ' +
          '5,000 (lines 300-301, 911-913). If the Authority has since moved the figure, this rule is ' +
          'reporting against the old one.'
        : undefined,
    );
  }

  // Appendix C names a counter party for every one of these rows, under "All
  // fields are compulsory" (line 224), and — unlike S — no note offers
  // aggregation as a way out. Before this the validator said nothing at all
  // about them: a `T` input or an `M` self-invoice sale with a zeros counter
  // party came back with zero findings, while the same omission on `S` got a
  // warning. The circular treats the rows alike.
  const counterparty = COUNTERPARTY_ROWS[type];
  if (counterparty && vatId.length === 9 && isZeros(vatId)) {
    at(
      `detail.${type}.counterpartyExpected`,
      counterparty.severity,
      'counterpartyVatId',
      `entry type ${type} is ${counterparty.what}, and Appendix C gives its counter-party cell as "${counterparty.cell}" under "All fields are compulsory"; the field is zeros.${counterparty.extraMessage ? ` ${counterparty.extraMessage}` : ''}`,
      [ita(counterparty.rowLines), ita('224-225'), ...(counterparty.extraSources ?? [])],
      `Appendix C: "${counterparty.rowQuote}" (lines ${counterparty.rowLines}). General Explanation: ` +
        '"All fields are compulsory. Below are the possible values for each field in each situation. ' +
        '"V" symbolizes a compulsory field in accordance with the column heading or the value stated in the ' +
        `table" (lines 224-225).${counterparty.extraText ? ` ${counterparty.extraText}` : ''}`,
      counterparty.openQuestion,
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

/**
 * Note E's cap on petty cash — Appendix C, official lines 566-570.
 *
 * > "Petty Cash Input – The entry may appear a number of times, even on the same
 * > date, provided that the total VAT for these entries is less than 2% of the
 * > total VAT of the file's entries or 2,000 NIS (the greater of them). The
 * > restrictions regarding the Petty Cash may change from time to time…"
 *
 * A WARNING, and for two reasons the document gives itself: it says the
 * restriction may change (lines 569-570), and it never defines what "the total
 * VAT of the file's entries" is — sales VAT, input VAT, or both. This rule takes
 * the widest reading, the VAT of every transaction record, which is the reading
 * most favourable to the file.
 */
function checkPettyCashCap(c: Collector, details: readonly Pcn874Record[]): void {
  const vatOf = (r: Pcn874Record): number | null => {
    const v = r.fields['totalVat'] ?? '';
    return v.length === 9 && DIGITS.test(v) ? Number(v) : null;
  };

  const pettyCash = details.filter(d => d.fields['recordType'] === 'K');
  if (pettyCash.length === 0) return;

  let petty = 0;
  let total = 0;
  for (const r of details) {
    const v = vatOf(r);
    // A record whose VAT cannot be read is already reported by its own rule;
    // guessing a total from the rest would be worse than saying nothing.
    if (v === null) return;
    total += v;
    if (r.fields['recordType'] === 'K') petty += v;
  }

  const twoPercent = total * 0.02;
  const cap = Math.max(2000, twoPercent);
  if (petty <= cap) return;

  c.add({
    rule: 'totals.pettyCashCap',
    severity: 'warning',
    record: 'file',
    line: null,
    field: null,
    message: `the ${pettyCash.length} petty-cash (K) record(s) carry ${petty} shekels of VAT between them. Note E allows petty-cash entries to repeat "provided that the total VAT for these entries is less than 2% of the total VAT of the file's entries or 2,000 NIS (the greater of them)" — here 2% of ${total} is ${twoPercent.toFixed(2)}, so the greater is ${cap.toFixed(2)}. Reported rather than rejected: the document says the restriction may change, and never says which entries "the file's entries" means.`,
    sources: [ita('566-570'), ita('436-456'), ita('586-588')],
    officialText:
      'Note E: "Petty Cash Input – The entry may appear a number of times, even on the same date, provided ' +
      "that the total VAT for these entries is less than 2% of the total VAT of the file's entries or 2,000 " +
      'NIS (the greater of them). The restrictions regarding the Petty Cash may change from time to time as ' +
      'to be determined in the internal regulations that will be made public" (lines 566-570).',
    openQuestion:
      'Two things note E leaves open. First, its base: "the total VAT of the file\'s entries" could be the ' +
      'sales VAT, the input VAT or both, and nothing rendered says which — this rule sums the VAT of every ' +
      'transaction record, the widest base and so the most permissive. Second, the figures themselves: ' +
      'lines 569-570 say the petty-cash restrictions "may change from time to time as to be determined in ' +
      'the internal regulations that will be made public", and lines 586-588 name "2%" among the parameters ' +
      'that move; no such regulation or memo is rendered in this repository. Note E also words the cap as ' +
      '"less than", so a total exactly at the cap is outside it too, while this rule reports only above it. ' +
      'Separately, the Rivhit manual states a per-invoice cap the circular does not: an invoice whose VAT ' +
      'is above ₪300 may not be reported as petty cash (rivhit lines 318-319, edition 1.51, 2011). That is ' +
      'a vendor statement, so no rule is built on it.',
  });
}

function checkFileShape(c: Collector, parsed: ParsedPcn874): void {
  const { records } = parsed;

  if (parsed.nonAsciiOffsets.length > 0) {
    c.add({
      // A WARNING, not an error. The cited range declares field TYPES; it does
      // not declare an encoding, and §2 of the spec says so itself. Nothing is
      // lost by demoting it: every N(n), "+/-" and literal field already rejects
      // a non-ASCII byte on its own authority, as an error. The only field this
      // rule ever added anything to is the A(4) reference group, whose alphabet
      // the document leaves open — the same open question, so the same severity.
      rule: 'file.encoding.ascii',
      severity: 'warning',
      record: 'file',
      line: null,
      field: null,
      message: `file contains ${parsed.nonAsciiOffsets.length} character(s) outside printable ASCII, first at offset ${parsed.nonAsciiOffsets[0]}. Every field in Appendix A is typed N(n), A(n) or "+/-", and a non-ASCII character in an N(n), "+/-" or fixed-value field is already an error under that field's own rule. This whole-file finding is a warning because the document declares no encoding at all, so an A(n) field is the one place it might legitimately appear.`,
      sources: [
        ita('96-161'),
        ita('139'),
        ita('580-581'),
        'accounter:packages/pcn874-generator/src/utils/builders.ts:22,37,41',
        'rcbuilder:CODE/PCN-874/PCN874_Sample.txt (ASCII text)',
      ],
      officialText:
        'Appendix A types every field as A(n), N(n) or "+/-"; the file has no declared encoding beyond that.',
      openQuestion: A_N_ALPHABET_OPEN,
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
        : 'Header Entry: "Entry Type   A(1)   "O" – fixed value" (line 100). Closing Entry: "Entry Type   ' +
          'A(1)   "X" – fixed value" (line 158). "Table of Values for the Entry Type Field . The values will ' +
          'be derived from transaction type" (lines 176-177), listing eleven letters (lines 181-191).',
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
  checkPettyCashCap(c, details);

  const findings = c.findings;
  const counts = {
    error: findings.filter(f => f.severity === 'error').length,
    warning: findings.filter(f => f.severity === 'warning').length,
    info: findings.filter(f => f.severity === 'info').length,
  };

  return { valid: counts.error === 0, findings, parsed, counts };
}
