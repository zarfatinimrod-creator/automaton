/**
 * validatePcn874 — check a PCN874 file against the layout rendered in
 * docs/SPEC-FROM-SOURCES.md, and say which source backs each finding.
 *
 * Severity, and why it matters here: a wrong PCN874 is the filer's exposure to
 * the Tax Authority, not ours. So a rule all three sources agree on is an
 * `error`, a rule only one source states is a `warning`, and where the sources
 * give three different answers (the reported-VAT arithmetic) no rule is written
 * at all. `valid` is true when there is no `error`.
 */

import {
  DETAIL,
  FOOTER,
  FOOTER_RECORD_TYPE,
  FOOTER_RECORD_TYPE_LINET3,
  HEADER,
  RECORD_TYPES,
  RECORD_TYPE_LETTERS,
  type FieldSpec,
  type RecordSpec,
} from './layout.js';
import { isParsed, parsePcn874, type ParsedPcn874, type Pcn874Record } from './parse.js';

export type Severity = 'error' | 'warning' | 'info';

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
  /** Present when the sources disagree about the rule being applied. */
  readonly disagreement?: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly findings: readonly Finding[];
  readonly parsed: ParsedPcn874;
  readonly counts: { readonly error: number; readonly warning: number; readonly info: number };
}

const DIGITS = /^\d+$/;

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

class Collector {
  readonly findings: Finding[] = [];

  add(finding: Finding): void {
    this.findings.push(finding);
  }
}

function recordLabel(record: Pcn874Record): string {
  if (record.kind === 'detail') return `detail[${record.index}]`;
  if (record.kind === 'unknown') return `unknown[${record.index}]`;
  return record.kind;
}

/** Field-level checks shared by every record kind. */
function checkFields(
  c: Collector,
  record: Pcn874Record,
  spec: RecordSpec,
  rulePrefix: string,
): void {
  const label = recordLabel(record);
  for (const field of spec.fields) {
    const value = record.fields[field.id];
    if (value === undefined || value.length !== field.length) {
      // The record-length rule already reported the truncation; do not pile on.
      continue;
    }
    checkOneField(c, record, field, value, label, rulePrefix);
  }
}

function checkOneField(
  c: Collector,
  record: Pcn874Record,
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
    ...(field.disagreement ? { disagreement: field.disagreement } : {}),
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
      }
      break;
    }
    case 'digits': {
      if (!DIGITS.test(value)) {
        c.add({
          ...base,
          rule: `${rulePrefix}.${field.id}.digits`,
          severity: 'error',
          message: `${field.english}: expected ${field.length} digits at offset ${field.offset}, found ${JSON.stringify(value)}.`,
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
          message: `${field.english}: ${JSON.stringify(value)} is not one of ${RECORD_TYPE_LETTERS.join(', ')}.`,
        });
      }
      break;
    }
  }
}

function checkRecordLength(c: Collector, record: Pcn874Record, spec: RecordSpec, rule: string): boolean {
  if (record.raw.length === spec.length) return true;
  c.add({
    rule,
    severity: 'error',
    record: recordLabel(record),
    line: record.line,
    field: null,
    message: `${spec.kind} record must be exactly ${spec.length} characters, found ${record.raw.length}.`,
    sources: spec.sources,
    ...(spec.disagreement ? { disagreement: spec.disagreement } : {}),
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
      sources: ['accounter:packages/pcn874-generator/src/schemas.ts:11,21'],
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
      sources: ['accounter:packages/pcn874-generator/src/schemas.ts:12,22-25'],
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
        message: `reserved field is non-zero (${JSON.stringify(value)}). Both sources that write it write zeros and call it "for future use"; a non-zero value may be correct under a newer spec edition than either source knows.`,
        sources: [
          'accounter:packages/pcn874-generator/src/utils/builders.ts:4-5',
          'rcbuilder:...PCN874Manager.cs:389,391,432,434',
        ],
      });
    }
  }
}

function checkFooter(c: Collector, footer: Pcn874Record, header: Pcn874Record | undefined): void {
  const first = footer.raw.charAt(0);
  if (first === FOOTER_RECORD_TYPE_LINET3) {
    c.add({
      rule: 'footer.recordType.literal',
      severity: 'error',
      record: 'footer',
      line: footer.line,
      field: 'recordType',
      message: `trailer record starts with "${FOOTER_RECORD_TYPE_LINET3}"; expected "${FOOTER_RECORD_TYPE}".`,
      sources: FOOTER.sources,
      disagreement: FOOTER.disagreement,
    });
  }

  const lengthOk = checkRecordLength(c, footer, FOOTER, 'footer.length');
  if (first !== FOOTER_RECORD_TYPE_LINET3) checkFields(c, footer, FOOTER, 'footer');
  else {
    const dealer = footer.fields['licensedDealerId'];
    if (dealer !== undefined && dealer.length === 9 && !DIGITS.test(dealer)) {
      c.add({
        rule: 'footer.licensedDealerId.digits',
        severity: 'error',
        record: 'footer',
        line: footer.line,
        field: 'licensedDealerId',
        message: `trailer dealer id must be 9 digits, found ${JSON.stringify(dealer)}.`,
        sources: FOOTER.fields[1]!.sources,
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
      message: `trailer dealer id ${JSON.stringify(footerDealer)} does not match the header's ${JSON.stringify(headerDealer)}.`,
      sources: [
        'accounter:packages/pcn874-generator/src/utils/builders.ts:40-42',
        'linet3:protected/models/FormReportPcn874.php:96-98',
        'rcbuilder:...PCN874Manager.cs:531,569',
      ],
    });
  }
}

/**
 * Per-record-type constraints. Only accounter states these, so every one of them
 * is a warning: see docs/SPEC-FROM-SOURCES.md §4.2.
 */
function checkDetailSemantics(c: Collector, record: Pcn874Record): void {
  const type = record.fields['recordType'];
  if (!type || !(type in RECORD_TYPES)) return;
  const label = recordLabel(record);
  const vatId = record.fields['counterpartyVatId'] ?? '';
  const refNumber = record.fields['refNumber'] ?? '';
  const totalVat = record.fields['totalVat'] ?? '';

  const warn = (rule: string, field: string, message: string, sources: string[]): void => {
    c.add({
      rule,
      severity: 'warning',
      record: label,
      line: record.line,
      field,
      message,
      sources,
      disagreement:
        'Only accounter implements this constraint; linet3 and rcbuilder do not check it. Reported as a ' +
        'warning rather than an error for that reason. See docs/SPEC-FROM-SOURCES.md §4.2.',
    });
  };

  if (type === 'L' && vatId.length === 9 && !isZeros(vatId)) {
    warn(
      'detail.L.vatIdZeros',
      'counterpartyVatId',
      `record type L is an unidentified (private) customer, so the counterparty VAT id is expected to be 000000000; found ${JSON.stringify(vatId)}.`,
      ['accounter:packages/pcn874-generator/src/schemas.ts:184-205'],
    );
  }

  if (type === 'K') {
    if (vatId.length === 9 && !isZeros(vatId)) {
      warn(
        'detail.K.vatIdZeros',
        'counterpartyVatId',
        `record type K aggregates petty cash across suppliers, so the counterparty VAT id is expected to be 000000000; found ${JSON.stringify(vatId)}.`,
        ['accounter:packages/pcn874-generator/src/schemas.ts:214-220'],
      );
    }
    if (refNumber.length === 9 && isZeros(refNumber)) {
      warn(
        'detail.K.refNumberNonZero',
        'refNumber',
        'record type K carries the number of invoices in the entry in the reference number, so it is expected to be greater than zero.',
        ['accounter:packages/pcn874-generator/src/schemas.ts:221-226'],
      );
    }
  }

  if (type === 'R' && refNumber.length === 9 && !isZeros(refNumber)) {
    warn(
      'detail.R.refNumberZeros',
      'refNumber',
      `record type R is an import entry and is expected to carry no reference number; found ${JSON.stringify(refNumber)}.`,
      ['accounter:packages/pcn874-generator/src/schemas.ts:228-235'],
    );
  }

  if (type === 'Y' && totalVat.length === 9 && !isZeros(totalVat)) {
    warn(
      'detail.Y.vatZeros',
      'totalVat',
      `record type Y is an export and is expected to carry no VAT; found ${JSON.stringify(totalVat)}.`,
      ['accounter:packages/pcn874-generator/src/schemas.ts:206-213'],
    );
  }
}

function checkTotals(c: Collector, header: Pcn874Record, details: readonly Pcn874Record[]): void {
  const salesLetters = Object.entries(RECORD_TYPES)
    .filter(([, v]) => v.side === 'sale')
    .map(([k]) => k);
  const inputLetters = Object.entries(RECORD_TYPES)
    .filter(([, v]) => v.side === 'input')
    .map(([k]) => k);

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
      severity: 'warning',
      record: 'header',
      line: header.line,
      field: 'salesRecordCount',
      message: `header declares ${salesDeclared} sales records; the file contains ${salesActual} (record types ${salesLetters.join(', ')}).`,
      sources: [
        'accounter:packages/pcn874-generator/src/schemas.ts:116-121',
        'rcbuilder:...PCN874Manager.cs:496-500',
      ],
      disagreement:
        'accounter counts all sales records including zero-rated and exempt; rcbuilder counts S and L only ' +
        'because it never emits M, Y or I. Whether M/Y/I count is untested by any source. ' +
        'See docs/SPEC-FROM-SOURCES.md §5.4.',
    });
  }

  const inputsDeclared = declared('inputsCount');
  const inputsActual = countOf(inputLetters);
  if (inputsDeclared !== null && inputsDeclared !== inputsActual) {
    c.add({
      rule: 'totals.inputsCount',
      severity: 'warning',
      record: 'header',
      line: header.line,
      field: 'inputsCount',
      message: `header declares ${inputsDeclared} input records; the file contains ${inputsActual} (record types ${inputLetters.join(', ')}).`,
      sources: [
        'accounter:packages/pcn874-generator/src/schemas.ts:137-141',
        'rcbuilder:...PCN874Manager.cs:477-480',
      ],
      disagreement:
        'rcbuilder counts only T records, accounter says "other and equipment", linet3 counts its own ' +
        'internal document types. Whether K/R/P/H/C count is unsettled, so this is a warning and never an ' +
        'error. See docs/SPEC-FROM-SOURCES.md §5.4.',
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
      message: `file contains ${parsed.nonAsciiOffsets.length} character(s) outside printable ASCII, first at offset ${parsed.nonAsciiOffsets[0]}. Every source writes digits, "+", "-" and A-Z only.`,
      sources: [
        'accounter:packages/pcn874-generator/src/utils/builders.ts:22,37,41',
        'rcbuilder:CODE/PCN-874/PCN874_Sample.txt (ASCII text)',
      ],
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
        'file mixes line endings. accounter writes LF and rcbuilder writes the platform newline, so either is accepted, but a file should not mix them.',
      sources: [
        'accounter:packages/pcn874-generator/src/utils/builders.ts:37,41',
        'rcbuilder:...PCN874Manager.cs:571-575',
      ],
      disagreement: 'See docs/SPEC-FROM-SOURCES.md §5.6.',
    });
  }

  if (records.length === 0) {
    c.add({
      rule: 'file.empty',
      severity: 'error',
      record: 'file',
      line: null,
      field: null,
      message: 'file contains no records.',
      sources: ['accounter:packages/pcn874-generator/src/index.ts:31-34'],
    });
    return;
  }

  const headers = records.filter(r => r.kind === 'header');
  const footers = records.filter(r => r.kind === 'footer');
  const details = records.filter(r => r.kind === 'detail');
  const unknown = records.filter(r => r.kind === 'unknown');

  for (const r of unknown) {
    c.add({
      rule: 'file.record.unknown',
      severity: 'error',
      record: recordLabel(r),
      line: r.line,
      field: null,
      message: `record starts with ${JSON.stringify(r.raw.charAt(0))}, which is neither the header "O", the trailer "X", nor one of the record types ${RECORD_TYPE_LETTERS.join(', ')}.`,
      sources: [
        'accounter:packages/pcn874-generator/src/index.ts:43,55,65',
        'rcbuilder:...PCN874Manager.cs:281-293,379,531',
      ],
    });
  }

  if (headers.length === 0) {
    c.add({
      rule: 'file.header.missing',
      severity: 'error',
      record: 'file',
      line: null,
      field: null,
      message: 'file has no header record (a record starting with "O").',
      sources: ['accounter:packages/pcn874-generator/src/index.ts:39-48'],
    });
  } else if (headers.length > 1) {
    c.add({
      rule: 'file.header.duplicate',
      severity: 'error',
      record: 'file',
      line: headers[1]!.line,
      field: null,
      message: `file has ${headers.length} header records; exactly one is expected, first.`,
      sources: ['accounter:packages/pcn874-generator/src/index.ts:39'],
    });
  } else if (records[0]!.kind !== 'header') {
    c.add({
      rule: 'file.header.position',
      severity: 'error',
      record: 'header',
      line: headers[0]!.line,
      field: null,
      message: 'the header record must be the first record in the file.',
      sources: ['accounter:packages/pcn874-generator/src/index.ts:39'],
    });
  }

  if (footers.length === 0) {
    c.add({
      rule: 'file.footer.missing',
      severity: 'error',
      record: 'file',
      line: null,
      field: null,
      message: 'file has no trailer record (a record starting with "X").',
      sources: ['accounter:packages/pcn874-generator/src/index.ts:51-57'],
      disagreement: FOOTER.disagreement,
    });
  } else if (footers.length > 1) {
    c.add({
      rule: 'file.footer.duplicate',
      severity: 'error',
      record: 'file',
      line: footers[1]!.line,
      field: null,
      message: `file has ${footers.length} trailer records; exactly one is expected, last.`,
      sources: ['accounter:packages/pcn874-generator/src/index.ts:51'],
    });
  } else if (records[records.length - 1]!.kind !== 'footer') {
    c.add({
      rule: 'file.footer.position',
      severity: 'error',
      record: 'footer',
      line: footers[0]!.line,
      field: null,
      message: 'the trailer record must be the last record in the file.',
      sources: ['accounter:packages/pcn874-generator/src/index.ts:51'],
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
        'file has a header and a trailer but no detail records. A period with no transactions is plausible, so this is not treated as an error.',
      sources: [
        'accounter:packages/pcn874-generator/src/index.ts:31-34',
        'rcbuilder:CODE/PCN-874/PCN874_Sample_No_L_AND_NO_S_transactions.txt',
      ],
      disagreement:
        "accounter's own validator rejects a file with fewer than three lines; rcbuilder has no such rule " +
        'and ships a sample without S or L records. See docs/SPEC-FROM-SOURCES.md §5.6.',
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
