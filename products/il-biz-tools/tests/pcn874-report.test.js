// What the validator page says about a file, in Hebrew: src/lib/pcn874-report.js.
//
// The validator (products/pcn874, bundled into src/vendor/pcn874/) reports in
// English with stable rule ids. The page lists each finding per record/line
// with the rule that failed in Hebrew, and keeps the validator's own English
// text beside it. These tests hold the Hebrew to the validator: every rule the
// validator can emit has a Hebrew line, so a new rule in pcn874 turns this red.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validatePcn874 } from '../src/vendor/pcn874/validate.js';
import { HEADER, DETAIL, FOOTER, RECORD_TYPES } from '../src/vendor/pcn874/layout.js';
import {
  SEVERITY_HE,
  ruleHebrew,
  fieldHebrew,
  buildReport,
  decodePcn874,
  readPcn874File,
} from '../src/lib/pcn874-report.js';
import { productRoot } from './helpers/product-copy.js';

const fixtureDir = join(productRoot, '..', 'pcn874', 'tests', 'fixtures');
const fixtures = readdirSync(fixtureDir).filter((f) => f.endsWith('.txt'));
const fixture = (name) => readFileSync(join(fixtureDir, name), 'utf8');
const validatorSource = readFileSync(join(productRoot, 'src/vendor/pcn874/validate.js'), 'utf8');
const HEBREW = /[א-ת]/;

/** Every rule id validate.js can emit, read from its own source. */
function everyRule() {
  const literal = [...validatorSource.matchAll(/'((?:file|header|footer|detail|totals)\.[A-Za-z.]+)'/g)].map((m) => m[1]);
  const templates = new Set(
    [...validatorSource.matchAll(/`([^`]*\$\{[^`]*)`/g)].map((m) => m[1]).filter((t) => /^(?:\$\{rulePrefix\}|file|header|footer|detail|totals)\./.test(t)),
  );
  const KINDS = { literal: ['literal'], sign: ['sign', 'signOfZero'], digits: ['digits'], alphanumeric: ['alphanumeric'], alpha: ['known'] };
  const known = {
    '${rulePrefix}.${field.id}.literal': [],
    '${rulePrefix}.${field.id}.sign': [],
    '${rulePrefix}.${field.id}.signOfZero': [],
    '${rulePrefix}.${field.id}.digits': [],
    '${rulePrefix}.${field.id}.alphanumeric': [],
    '${rulePrefix}.${field.id}.known': [],
    'header.${id}.reserved': ['header.differentRateSalesAmount.reserved', 'header.differentRateSalesVat.reserved'],
    'detail.${type}.counterpartyExpected': ['M', 'I', 'T', 'C', 'P', 'H'].map((t) => `detail.${t}.counterpartyExpected`),
  };
  const fieldRules = [];
  for (const [prefix, spec] of [['header', HEADER], ['detail', DETAIL], ['footer', FOOTER]]) {
    for (const field of spec.fields) for (const kind of KINDS[field.class]) fieldRules.push(`${prefix}.${field.id}.${kind}`);
  }
  return { literal, templates, known, rules: [...new Set([...literal, ...fieldRules, ...Object.values(known).flat()])] };
}

describe('every rule the validator can emit has a Hebrew line', () => {
  const { templates, known, rules } = everyRule();

  it('knows every rule-id template in validate.js - a new one must be added here and given Hebrew', () => {
    expect([...templates].sort()).toEqual(Object.keys(known).sort());
  });

  it('gives each of them Hebrew text', () => {
    expect(rules.length).toBeGreaterThan(60);
    for (const rule of rules) {
      const he = ruleHebrew(rule);
      expect(he, rule).toBeTypeOf('string');
      expect(he, rule).toMatch(HEBREW);
    }
  });

  it('returns null for a rule it does not know, so the page can say so rather than guess', () => {
    expect(ruleHebrew('detail.Q.somethingNew')).toBeNull();
  });

  it('describes every rule any pcn874 fixture actually triggers', () => {
    expect(fixtures.length).toBeGreaterThan(20);
    for (const name of fixtures) {
      for (const f of validatePcn874(fixture(name)).findings) expect(ruleHebrew(f.rule), `${name}: ${f.rule}`).not.toBeNull();
    }
  });
});

describe('field names', () => {
  it('uses the Hebrew name the layout gives, and names the fields it leaves blank', () => {
    expect(fieldHebrew('header', 'licensedDealerId')).toBe('מספר עוסק');
    expect(fieldHebrew('detail', 'refGroup')).toBe('קבוצת אסמכתא');
    expect(fieldHebrew('header', 'reportType')).toMatch(HEBREW);
    expect(fieldHebrew('footer', 'recordType')).toMatch(HEBREW);
  });

  it('names a sign field after the amount it signs', () => {
    expect(fieldHebrew('header', 'reportedVatSign')).toContain('סכום מדווח');
    expect(fieldHebrew('detail', 'invoiceSumSign')).toContain('סכום');
  });

  it('words a sign rule by the amount, not by the sign field\'s own name', () => {
    expect(ruleHebrew('header.equipmentInputsVatSign.signOfZero')).toBe('סימן מינוס לסכום אפס ב«תשומות ציוד». לפי החוזר, כשהסכום אפס הסימן הוא +.');
    expect(ruleHebrew('detail.invoiceSumSign.sign')).toBe('בשדה הסימן של «סכום» מותר רק + או -.');
  });

  it('has a Hebrew name for every field of every record', () => {
    for (const [kind, spec] of [['header', HEADER], ['detail', DETAIL], ['footer', FOOTER]]) {
      for (const field of spec.fields) expect(fieldHebrew(kind, field.id), `${kind}.${field.id}`).toMatch(HEBREW);
    }
  });
});

describe('buildReport', () => {
  it('lists findings per line, whole-file findings first, then in line order', () => {
    for (const name of fixtures) {
      const { rows } = buildReport(validatePcn874(fixture(name)));
      const lines = rows.map((r) => (r.line === null ? -1 : r.line));
      expect(lines, name).toEqual([...lines].sort((a, b) => a - b));
    }
  });

  it('gives each row where it is, the record, the field, the severity and the failed rule in Hebrew, and keeps the validator\'s English', () => {
    const result = validatePcn874(fixture('invalid-header-digits.txt'));
    const { rows } = buildReport(result);
    expect(rows.length).toBe(result.findings.length);
    const row = rows.find((r) => r.rule === 'header.licensedDealerId.digits');
    expect(row).toMatchObject({
      line: 1,
      where: 'שורה 1',
      severity: 'error',
      severityHe: SEVERITY_HE.error,
      field: 'מספר עוסק (licensedDealerId)',
    });
    expect(row.record).toContain('כותרת');
    expect(row.ruleHe).toBe(ruleHebrew('header.licensedDealerId.digits'));
    expect(row.message).toBe(result.findings.find((f) => f.rule === row.rule).message);
  });

  it('names a transaction record by its entry type, in Hebrew', () => {
    const { rows } = buildReport(validatePcn874(fixture('invalid-detail-semantics.txt')));
    const detail = rows.find((r) => r.rule.startsWith('detail.'));
    const letter = detail.rule.split('.')[1];
    expect(detail.record).toContain('רשומת פירוט');
    expect(detail.record).toBe(`רשומת פירוט ${letter} (${RECORD_TYPES[letter].hebrew})`);
    expect(detail.where).toMatch(/^שורה \d+$/);
  });

  it('marks a whole-file finding as such', () => {
    const { rows } = buildReport(validatePcn874(''));
    expect(rows).toEqual([expect.objectContaining({ rule: 'file.empty', line: null, where: 'כל הקובץ' })]);
  });

  it('summarises a clean file without claiming the Tax Authority will accept it', () => {
    const report = buildReport(validatePcn874(fixture('valid-minimal.txt')));
    expect(report.verdict).toBe('clean');
    expect(report.rows).toEqual([]);
    expect(report.summary).toContain('לא נמצאו שגיאות');
    expect(report.summary).toContain('בדיקת מבנה בלבד');
    expect(report.summary).toContain('לא אישור שהקובץ יתקבל');
  });

  it('summarises a file with warnings only as structurally valid, and says what a warning is', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    expect(result.valid).toBe(true);
    const report = buildReport(result);
    expect(report.verdict).toBe('warnings');
    expect(report.summary).toContain('לא נמצאו שגיאות');
    expect(report.summary).toMatch(/אזהר/);
    expect(report.summary).toContain('בדיקת מבנה בלבד');
  });

  it('summarises an invalid file with its counts, singular and plural in proper Hebrew', () => {
    const result = validatePcn874(fixture('invalid-counts.txt'));
    const report = buildReport(result);
    expect(report.verdict).toBe('invalid');
    expect(report.summary).toContain(`${result.counts.error} שגיאות`);
    expect(report.summary).toContain('אינו תואם למבנה');
    expect(buildReport(validatePcn874('')).summary).toMatch(/^נמצאה שגיאה אחת ב-0 רשומות\./);
  });

  it('caps the rows it lists and says how many there were', () => {
    const lines = ['X'.repeat(5), 'Q'.repeat(60), 'Q'.repeat(60), 'Q'.repeat(60)].join('\n');
    const result = validatePcn874(lines);
    const report = buildReport(result, { maxRows: 2 });
    expect(report.rows.length).toBe(2);
    expect(report.total).toBe(result.findings.length);
    expect(report.total).toBeGreaterThan(2);
  });
});

describe('reading the file', () => {
  const utf8 = (s) => new TextEncoder().encode(s);

  it('decodes exactly as the pcn874 CLI reads a file (readFileSync(path, "utf8")), a leading BOM included', () => {
    const cases = [
      utf8(fixture('valid-minimal.txt')),
      utf8(fixture('warnings-refgroup-hebrew.txt')),
      Uint8Array.from([0xef, 0xbb, 0xbf, ...utf8(fixture('valid-crlf.txt'))]),
      Uint8Array.from([0x4f, 0xff, 0xfe, 0x31, 0xc3]),
    ];
    for (const bytes of cases) expect(decodePcn874(bytes)).toBe(Buffer.from(bytes).toString('utf8'));
  });

  it('reads through the File API\'s arrayBuffer() and nothing else', async () => {
    const bytes = utf8(fixture('valid-minimal.txt'));
    const calls = [];
    const file = {
      name: 'report.txt',
      arrayBuffer: async () => { calls.push('arrayBuffer'); return bytes.buffer; },
      text: async () => { calls.push('text'); return ''; },
      stream: () => { calls.push('stream'); },
    };
    expect(await readPcn874File(file)).toBe(fixture('valid-minimal.txt'));
    expect(calls).toEqual(['arrayBuffer']);
  });
});
