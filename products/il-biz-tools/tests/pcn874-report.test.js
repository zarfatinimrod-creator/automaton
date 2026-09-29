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
import { validatePcn874, COUNTERPARTY_ROWS, RULES } from '../src/vendor/pcn874/validate.js';
import { HEADER, DETAIL, FOOTER, RECORD_TYPES } from '../src/vendor/pcn874/layout.js';
import { decodePcn874Bytes } from '../src/vendor/pcn874/parse.js';
import {
  SEVERITY_HE,
  ruleHebrew,
  fieldHebrew,
  buildReport,
  readPcn874File,
  READING_NOTES_HE,
  WARNING_MEANING_HE,
} from '../src/lib/pcn874-report.js';
import { productRoot } from './helpers/product-copy.js';

const fixtureDir = join(productRoot, '..', 'pcn874', 'tests', 'fixtures');
const fixtures = readdirSync(fixtureDir).filter((f) => f.endsWith('.txt'));
const fixture = (name) => readFileSync(join(fixtureDir, name), 'utf8');
const validatorSource = readFileSync(join(productRoot, 'src/vendor/pcn874/validate.js'), 'utf8');
const HEBREW = /[א-ת]/;

/** validate.js without its comments (a comment may name an old or example id). */
const validatorCode = validatorSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** Every rule id the validator can report: its own rule table (products/pcn874 RULES). */
const tableRules = () => [...new Set(RULES.map((r) => r.id))];

describe('every rule the validator can emit has a Hebrew line', () => {
  const rules = tableRules();

  it('takes every rule from the validator\'s rule table: each finding is built by ruleOf(...), nothing else names a rule', () => {
    // pcn874's tests/rules.test.ts proves every row of RULES is reported and every
    // finding equals its row. Here: validate.js has no other way to name a rule, so
    // a rule this page describes cannot be missing from the table.
    const ruleKeys = [...validatorCode.matchAll(/\brule:\s*([^,\n}]+)/g)].map((m) => m[1].trim());
    expect(ruleKeys).toEqual(['row.id']);
    expect([...validatorCode.matchAll(/\bruleOf\(/g)].length).toBeGreaterThan(20);
    const helperArgs = [...validatorCode.matchAll(/\bat\(\s*([^\n]+)/g)].map((m) => m[1].trim());
    expect(helperArgs.length).toBeGreaterThan(5);
    for (const v of helperArgs) expect(v, v).toMatch(/^ruleOf\(/);
  });

  it('draws its counter-party rows from the validator itself, not from a copy', () => {
    for (const letter of Object.keys(COUNTERPARTY_ROWS)) expect(rules).toContain(`detail.${letter}.counterpartyExpected`);
    expect(ruleHebrew('detail.H.counterpartyExpected')).toContain('אזהרה בלבד');
    expect(ruleHebrew('detail.T.counterpartyExpected')).not.toContain('אזהרה');
  });

  it('counts the entry types from the layout rather than writing the number out', () => {
    expect(ruleHebrew('detail.recordType.known')).toContain(`${Object.keys(RECORD_TYPES).length} הערכים`);
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

  it('never tells the user to flip the sign of a VAT-only credit: the warning and the error read differently', () => {
    // The warning: invoice total zero, VAT not (a VAT-only credit, written in minus).
    const credit = buildReport(validatePcn874(fixture('warnings-vat-only-credit.txt'))).rows.find((r) => r.rule === 'detail.invoiceSumSign.signOfZero');
    expect(credit.severity).toBe('warning');
    expect(credit.ruleHe).toContain('כמו בזיכוי של מע״מ בלבד');
    expect(credit.ruleHe).toContain('אין לשנות את הסימן בלי לבדוק');
    expect(credit.ruleHe).not.toContain('כשהסכום אפס הסימן הוא +.');
    // The error: both amounts zero.
    const lines = fixture('warnings-vat-only-credit.txt').split('\n');
    const detail = lines[1];
    const at = DETAIL.fields.find((f) => f.id === 'totalVat');
    const bothZero = detail.slice(0, at.offset) + '0'.repeat(at.length) + detail.slice(at.offset + at.length);
    const result = validatePcn874([lines[0], bothZero, ...lines.slice(2)].join('\n'));
    const error = buildReport(result).rows.find((r) => r.rule === 'detail.invoiceSumSign.signOfZero');
    expect(error.severity).toBe('error');
    expect(error.ruleHe).toContain('כשהסכום אפס הסימן הוא +');
    expect(error.ruleHe).not.toBe(credit.ruleHe);
  });

  it('says the petty-cash cap is exceeded even on the most lenient reading, and why it is only a warning', () => {
    const row = buildReport(validatePcn874(fixture('warnings-petty-cash-cap.txt'))).rows.find((r) => r.rule === 'totals.pettyCashCap');
    expect(row.ruleHe).toContain('גם לפי הקריאה המקלה ביותר');
    expect(row.ruleHe).toContain('2009');
    expect(row.ruleHe).not.toContain('אינו מגדיר על איזה סך');
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

  it('summarises a file with warnings only without calling a warning harmless', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    expect(result.valid).toBe(true);
    const report = buildReport(result);
    expect(report.verdict).toBe('warnings');
    expect(report.summary).toContain('לא נמצאו שגיאות');
    expect(report.summary).toContain(WARNING_MEANING_HE);
    expect(report.summary).toContain('ייתכן שרשות המסים תדחה את הקובץ בגללה');
    expect(report.summary).not.toMatch(/אינה פוסלת/);
    expect(report.summary).toContain('בדיקת מבנה בלבד');
  });

  it('summarises an invalid file with its counts, and the file\'s size as the file\'s, not as records with errors', () => {
    const result = validatePcn874(fixture('invalid-counts.txt'));
    const report = buildReport(result);
    expect(report.verdict).toBe('invalid');
    expect(report.summary).toContain(`${result.counts.error} שגיאות בקובץ של ${result.parsed.records.length} רשומות`);
    expect(report.summary).toContain('אינו תואם למבנה');
    expect(buildReport(validatePcn874('')).summary).toMatch(/^נמצאה שגיאה אחת בקובץ שאין בו אף רשומה\./);
  });

  it('does not call a representatives\' file (Appendix B) non-conforming: it says the checker does not check one', () => {
    for (const name of ['invalid-representative-file.txt', 'invalid-footer-z.txt']) {
      const report = buildReport(validatePcn874(fixture(name)));
      expect(report.verdict, name).toBe('unsupported');
      expect(report.summary, name).toContain(READING_NOTES_HE.representative);
      expect(report.summary, name).not.toContain('אינו תואם למבנה');
    }
    const { rows } = buildReport(validatePcn874(fixture('invalid-representative-file.txt')));
    // The closing record is named by its real first character.
    expect(rows.filter((r) => r.rule.startsWith('footer.')).map((r) => r.record)).toEqual(['רשומת סגירה (Z)', 'רשומת סגירה (Z)']);
    // The "A" record is named as Appendix B's initial entry.
    const a = rows.find((r) => r.rule === 'file.record.unknown');
    expect(a.ruleHe).toContain("נספח ב'");
    expect(a.ruleHe).toContain('קובץ מייצגים');
    // An ordinary unknown letter still gets the ordinary line.
    const q = buildReport(validatePcn874(fixture('invalid-record-type.txt'))).rows.find((r) => r.rule === 'file.record.unknown');
    expect(q.ruleHe).toBe(ruleHebrew('file.record.unknown'));
    expect(buildReport(validatePcn874(fixture('valid-minimal.txt'))).rows).toEqual([]);
  });

  it('says what the reading found about the bytes: not UTF-8, or a byte-order mark', () => {
    const utf8 = new TextEncoder().encode(fixture('valid-minimal.txt'));
    const bom = decodePcn874Bytes(Uint8Array.from([0xef, 0xbb, 0xbf, ...utf8]));
    const withBom = buildReport(validatePcn874(bom.text), { reading: bom });
    expect(withBom.notes).toEqual([READING_NOTES_HE.bom]);
    // Even without the reading, a leading U+FEFF in the first record is named.
    expect(buildReport(validatePcn874(bom.text)).notes).toEqual([READING_NOTES_HE.bom]);
    expect(buildReport(validatePcn874(fixture('valid-minimal.txt')), { reading: decodePcn874Bytes(utf8) }).notes).toEqual([]);

    const cp1255 = Uint8Array.from([...fixture('warnings-refgroup-hebrew.txt')].map((ch) => {
      const code = ch.charCodeAt(0);
      return code < 0x80 ? code : 0xe0 + (code - 0x5d0);
    }));
    const windows = decodePcn874Bytes(cp1255);
    const report = buildReport(validatePcn874(windows.text), { reading: windows });
    expect(report.notes).toEqual([READING_NOTES_HE.notUtf8]);
    const width = report.rows.find((r) => r.rule === 'file.byteWidth');
    expect(width.ruleHe).toContain('אינו מתאר את רוחב הרשומות בקובץ עצמו');
    // A real UTF-8 Hebrew file keeps the ordinary byte-width line.
    const real = buildReport(validatePcn874(fixture('warnings-refgroup-hebrew.txt')), { reading: { utf8: true, bom: false } });
    expect(real.rows.find((r) => r.rule === 'file.byteWidth').ruleHe).toBe(ruleHebrew('file.byteWidth'));
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

  it('decodes exactly as the pcn874 CLI reads a file (its own decodePcn874Bytes), a leading BOM included', async () => {
    const cases = [
      utf8(fixture('valid-minimal.txt')),
      utf8(fixture('warnings-refgroup-hebrew.txt')),
      Uint8Array.from([0xef, 0xbb, 0xbf, ...utf8(fixture('valid-crlf.txt'))]),
      Uint8Array.from([0x4f, 0xff, 0xfe, 0x31, 0xc3]),
    ];
    for (const bytes of cases) {
      const read = await readPcn874File({ arrayBuffer: async () => bytes.buffer });
      expect(read).toEqual(decodePcn874Bytes(bytes));
      expect(read.text).toBe(Buffer.from(bytes).toString('utf8'));
    }
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
    expect((await readPcn874File(file)).text).toBe(fixture('valid-minimal.txt'));
    expect(calls).toEqual(['arrayBuffer']);
  });
});
