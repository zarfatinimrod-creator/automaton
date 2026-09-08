import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  GENERATOR_COLUMNS,
  GENERATOR_DIRECTIVES,
  generatePcn874,
  type GenerateResult,
} from '../src/generate.js';
import { DETAIL, FOOTER, HEADER } from '../src/layout.js';
import { parsePcn874 } from '../src/parse.js';
import { OFFICIAL_TEXT_PATH, SOURCES, kindOf } from '../src/sources.js';
import { validatePcn874 } from '../src/validate.js';

const here = dirname(fileURLToPath(import.meta.url));
const csvPath = (name: string): string => join(here, 'fixtures', 'csv', name);
const csv = (name: string): string => readFileSync(csvPath(name), 'utf8');
const fixture = (name: string): string => readFileSync(join(here, 'fixtures', name), 'utf8');
const officialLines = readFileSync(join(here, '..', '..', '..', OFFICIAL_TEXT_PATH), 'utf8').split(
  '\n',
);
const generatorDoc = readFileSync(join(here, '..', 'docs', 'GENERATOR.md'), 'utf8');

/**
 * The refutation audit's constructed inputs
 * (`research/colony-sweep/audits/pcn874-generator.md` §4), one file per case.
 *
 * `problems` and `findings` are what must be REPORTED, `absent` what must not
 * be. Three of these cases used to write a silently wrong file with exit code 0
 * — c2 and l shifted the amounts by reading cells positionally in a row of the
 * wrong width, n read a decimal comma as a thousands separator — so what they
 * assert is a refusal, by name, and not merely "not ok".
 */
const AUDIT_CASES: readonly {
  readonly file: string;
  readonly what: string;
  readonly ok: boolean;
  readonly problems?: readonly string[];
  /** Reported, and reported as a warning, whether or not the file was written. */
  readonly warnings?: readonly string[];
  readonly findings?: readonly string[];
  readonly absent?: readonly string[];
}[] = [
  { file: 'audit-a-bom-crlf.csv', what: 'a BOM and CRLF are read, and change nothing', ok: true },
  { file: 'audit-b-quoted-thousands.csv', what: 'quoted thousands separators are read', ok: true },
  {
    file: 'audit-c1-unquoted-thousands.csv',
    what: 'an unquoted "1,800.00" is refused, not read shifted',
    ok: false,
    problems: ['csv.row.cellCount'],
  },
  {
    file: 'audit-c2-extra-cells.csv',
    what: 'a sales-only sheet with an unquoted comma is refused',
    ok: false,
    problems: ['csv.row.cellCount'],
  },
  {
    file: 'audit-c3-unquoted-total.csv',
    what: 'an unquoted comma in the invoice total is refused',
    ok: false,
    problems: ['csv.row.cellCount'],
  },
  {
    file: 'audit-d-refgroup-hebrew.csv',
    what: 'a Hebrew reference group is written, and its byte width is reported',
    ok: true,
    findings: ['file.byteWidth', 'file.encoding.ascii', 'detail.refGroup.alphanumeric'],
  },
  { file: 'audit-e1-credit.csv', what: 'a credit note is written and subtracts', ok: true },
  {
    file: 'audit-e2-sign-conflict.csv',
    what: 'two amounts that disagree about the one sign field are refused',
    ok: false,
    problems: ['row.sign.conflict'],
  },
  {
    file: 'audit-e3-parentheses.csv',
    what: "accountants' parentheses are refused, not read as positive",
    ok: false,
    problems: ['row.amount.unreadable'],
  },
  {
    file: 'audit-f-bare-sale.csv',
    what: 'a bare sale above note A\'s cap is refused by the validator',
    ok: false,
    warnings: ['row.vatSum.empty'],
    findings: ['detail.S.counterpartyExpected'],
  },
  {
    file: 'audit-g-missing-column.csv',
    what: 'a required column missing from the header row is refused',
    ok: false,
    problems: ['csv.column.missing'],
  },
  { file: 'audit-h1-directive-case.csv', what: 'a directive name in another case is read', ok: true },
  {
    file: 'audit-h2-directive-typo.csv',
    what: 'a misspelled directive cannot become a default',
    ok: false,
    problems: ['meta.unknown', 'meta.reportedVat.missing'],
  },
  {
    file: 'audit-h3-directive-no-colon.csv',
    what: 'a directive without its colon is named, not dropped as a comment',
    ok: false,
    problems: ['meta.malformed'],
  },
  { file: 'audit-i-duplicate-row.csv', what: 'the same document twice is the user\'s data', ok: true },
  {
    file: 'audit-j1-note-directive.csv',
    what: '"# Note:" is a one-word key before a colon, so it is refused as a directive',
    ok: false,
    problems: ['meta.unknown'],
  },
  { file: 'audit-j2-comment-with-colon.csv', what: 'a space before the colon keeps it a comment', ok: true },
  { file: 'audit-j3-comment-url.csv', what: 'a URL after a word stays a comment', ok: true },
  {
    file: 'audit-k-empty-row.csv',
    what: "Excel's trailing row of empty cells is dropped, not refused",
    ok: true,
    absent: ['row.entryType.unknown', 'csv.row.cellCount'],
  },
  {
    file: 'audit-l-short-row.csv',
    what: 'a truncated row is refused, not read as a ₪0 zero-rated sale',
    ok: false,
    problems: ['csv.row.cellCount'],
  },
  {
    file: 'audit-m-semicolons.csv',
    what: 'a semicolon-separated export is refused on its header line',
    ok: false,
    problems: ['csv.column.unknown'],
  },
  {
    file: 'audit-n-decimal-comma.csv',
    what: 'a decimal comma is refused, not read a hundredfold high',
    ok: false,
    problems: ['row.amount.unreadable'],
  },
  {
    file: 'audit-n2-european-thousands.csv',
    what: 'a European thousands separator is refused, not read as ₪1',
    ok: false,
    problems: ['row.amount.unreadable'],
  },
  {
    file: 'audit-o-empty-vat.csv',
    what: 'an empty VAT cell on a sale is written and reported',
    ok: true,
    problems: ['row.vatSum.empty'],
  },
  {
    file: 'audit-p-extra-column.csv',
    what: 'an extra spreadsheet column is refused',
    ok: false,
    problems: ['csv.column.unknown'],
  },
  {
    file: 'audit-q-vat-rounds-to-zero.csv',
    what: 'a VAT that rounds to zero is written and the moved total is reported',
    ok: true,
    problems: ['row.vat.roundedToZero'],
  },
  {
    file: 'audit-s-negative-ties.csv',
    what: 'negative half-shekel ties round away from zero and are reported',
    ok: true,
    problems: ['row.amount.roundingTie'],
  },
];

const CSV_FIXTURES = [
  'equipment.csv',
  'input-no-supplier.csv',
  'minimal.csv',
  'mixed.csv',
  'no-reported-vat.csv',
  'rounding.csv',
  'sign-of-zero.csv',
  'warnings.csv',
  ...AUDIT_CASES.map(c => c.file),
];

/** The generated file's header record, sliced at the layout's offsets. */
function headerOf(result: GenerateResult): Record<string, string> {
  expect(result.text, 'the generator refused; there is no header to read').not.toBeNull();
  const parsed = parsePcn874(result.text!);
  const header = parsed.records.find(r => r.kind === 'header');
  expect(header, 'no header record').toBeDefined();
  return { ...header!.fields };
}

/** Read the fixture CSV back independently of src/, for the round trip. */
function readCsvRows(name: string): Record<string, string>[] {
  const lines = csv(name)
    .split('\n')
    .filter(l => l.trim() !== '' && !l.trimStart().startsWith('#'));
  const columns = lines[0]!.split(',').map(c => c.trim());
  return lines.slice(1).map(line => {
    const cells = line.split(',');
    const row: Record<string, string> = {};
    columns.forEach((c, i) => (row[c] = (cells[i] ?? '').trim()));
    return row;
  });
}

describe('the CSV fixtures', () => {
  it('covers every file in tests/fixtures/csv/, so a new one cannot escape these checks', () => {
    const onDisk = readdirSync(join(here, 'fixtures', 'csv'))
      .filter(n => n.endsWith('.csv'))
      .sort();
    expect(onDisk).toEqual([...CSV_FIXTURES].sort());
  });

  it('docs/GENERATOR.md documents every column and every header directive', () => {
    for (const column of GENERATOR_COLUMNS) {
      expect(generatorDoc, `column ${column.name} is undocumented`).toContain(`\`${column.name}\``);
      // Every column names the SPEC.md field it fills and the ita line behind it.
      for (const source of column.sources) {
        const line = source.slice(source.lastIndexOf(':') + 1);
        expect(generatorDoc, `column ${column.name} cites ita:${line} nowhere in the doc`).toContain(
          line,
        );
      }
      if (column.field !== null) {
        const inLayout = [...HEADER.fields, ...DETAIL.fields, ...FOOTER.fields].some(
          f => f.id === column.field,
        );
        expect(inLayout, `${column.name} claims to fill unknown field ${column.field}`).toBe(true);
      }
    }
    for (const directive of GENERATOR_DIRECTIVES) {
      expect(generatorDoc, `directive ${directive.name} is undocumented`).toContain(
        `\`${directive.name}\``,
      );
    }
  });

  it('the fixture script and GENERATOR_COLUMNS name the same columns in the same order', () => {
    const script = readFileSync(join(here, '..', 'scripts', 'make-csv-fixtures.mjs'), 'utf8');
    const block = /const COLUMNS = \[([\s\S]*?)\];/.exec(script)?.[1] ?? '';
    const names = [...block.matchAll(/'([^']+)'/g)].map(m => m[1]);
    expect(names).toEqual(GENERATOR_COLUMNS.map(c => c.name));
  });
});

describe('round trip: CSV -> file -> validate -> parse', () => {
  it.each(['minimal.csv', 'mixed.csv', 'equipment.csv'])(
    '%s: every field of every record comes back equal to the input',
    name => {
      const result = generatePcn874(csv(name));
      expect(result.ok, JSON.stringify(result.problems, null, 2)).toBe(true);

      // 1. the generator's own output validates
      const validation = validatePcn874(result.text!);
      expect(validation.valid).toBe(true);
      expect(validation.counts.error).toBe(0);

      // 2. and parses back into the rows it was given
      const details = parsePcn874(result.text!).records.filter(r => r.kind === 'detail');
      const rows = readCsvRows(name);
      expect(details.length).toBe(rows.length);

      details.forEach((record, i) => {
        const row = rows[i]!;
        const vat = Number(row['vatSum'] || '0');
        const sum = Number(row['invoiceSum'] || '0');
        expect(record.fields['recordType']).toBe(row['entryType']);
        expect(record.fields['counterpartyVatId']).toBe(
          (row['counterpartyVatId'] || '').padStart(9, '0'),
        );
        expect(record.fields['invoiceDate']).toBe(row['invoiceDate']);
        expect(record.fields['refGroup']).toBe((row['refGroup'] || '').padStart(4, '0'));
        expect(record.fields['refNumber']).toBe((row['refNumber'] || '').padStart(9, '0'));
        expect(Number(record.fields['totalVat'])).toBe(Math.abs(vat));
        expect(Number(record.fields['invoiceSum'])).toBe(Math.abs(sum));
        expect(record.fields['invoiceSumSign']).toBe(vat < 0 || sum < 0 ? '-' : '+');
        expect(record.fields['allocationNumber']).toBe(
          (row['allocationNumber'] || '').padStart(9, '0'),
        );
      });
    },
  );

  it('the header block comes back as it was given', () => {
    const header = headerOf(generatePcn874(csv('minimal.csv')));
    expect(header['recordType']).toBe('O');
    expect(header['licensedDealerId']).toBe('514457282');
    expect(header['reportMonth']).toBe('202601');
    expect(header['reportType']).toBe('1');
    expect(header['generationDate']).toBe('20260210');
  });

  it('the closing entry repeats the header dealer id', () => {
    const parsed = parsePcn874(generatePcn874(csv('minimal.csv')).text!);
    const footer = parsed.records.find(r => r.kind === 'footer');
    expect(footer!.raw).toBe('X514457282');
  });
});

describe('the golden file', () => {
  it('minimal.csv reproduces tests/fixtures/valid-minimal.txt byte for byte', () => {
    const result = generatePcn874(csv('minimal.csv'));
    expect(result.ok).toBe(true);
    expect(result.text).toBe(fixture('valid-minimal.txt'));
  });

  /**
   * mixed.csv reproduces every transaction record and the closing entry of
   * `valid-mixed.txt`, and its header everywhere the fixture's numbers are
   * arithmetic. One header field differs on purpose: the fixture's
   * `taxableSalesAmount` is 9,000 and the computed total is 11,000, because the
   * fixture leaves out the L record's ₪2,000 — a taxable sale (its VAT is 360).
   * The fixture's amounts were invented for the validator, which cross-checks no
   * amount at all (docs/SPEC.md §5.2), so it is not authority for the arithmetic.
   */
  it('mixed.csv reproduces valid-mixed.txt except the one header total the fixture invented', () => {
    const generated = generatePcn874(csv('mixed.csv')).text!.split('\n');
    const expected = fixture('valid-mixed.txt').split('\n');
    expect(generated.length).toBe(expected.length);
    expect(generated.slice(1)).toEqual(expected.slice(1));

    const taxable = HEADER.fields.find(f => f.id === 'taxableSalesAmount')!;
    const cut = (line: string): string =>
      line.slice(0, taxable.offset) + line.slice(taxable.offset + taxable.length);
    expect(cut(generated[0]!)).toBe(cut(expected[0]!));
    expect(Number(generated[0]!.slice(taxable.offset, taxable.offset + taxable.length))).toBe(11000);
  });
});

describe('the computed header totals', () => {
  const mixed = (): Record<string, string> => headerOf(generatePcn874(csv('mixed.csv')));

  it('salesRecordCount counts every sales letter', () => {
    // S, S, L, Y in mixed.csv — the Table of Values marks S L M Y I as sales.
    expect(Number(mixed()['salesRecordCount'])).toBe(4);
  });

  it('inputsCount counts every input letter, not just T', () => {
    // T, K, R in mixed.csv — all six input letters count (docs/SPEC.md §6.4).
    expect(Number(mixed()['inputsCount'])).toBe(3);
  });

  it('taxableSalesAmount sums the sales whose VAT is not zeros, signed', () => {
    const header = mixed();
    // 10,000 + (-1,000) + 2,000; the export (VAT zeros) is not a taxable sale.
    expect(Number(header['taxableSalesAmount'])).toBe(11000);
    expect(header['taxableSalesAmountSign']).toBe('+');
  });

  it('taxableSalesVat sums the VAT of those same records, a credit subtracting', () => {
    expect(Number(mixed()['taxableSalesVat'])).toBe(1980); // 1800 - 180 + 360
  });

  it('zeroOrExemptSalesAmount takes the sales whose VAT is zeros', () => {
    expect(Number(mixed()['zeroOrExemptSalesAmount'])).toBe(5000); // the export
  });

  it('otherInputsVat sums the inputs not marked as equipment', () => {
    expect(Number(mixed()['otherInputsVat'])).toBe(3726); // 900 + 126 + 2700
    expect(Number(mixed()['equipmentInputsVat'])).toBe(0);
  });

  it('equipmentInputsVat is a real total, filled by the inputKind column', () => {
    const header = headerOf(generatePcn874(csv('equipment.csv')));
    expect(Number(header['equipmentInputsVat'])).toBe(1800);
    expect(Number(header['otherInputsVat'])).toBe(1800); // 900 + 900
    expect(Number(header['inputsCount'])).toBe(3);
  });

  it('the different-rate fields stay zeros with a "+" sign, as the circular says', () => {
    const header = mixed();
    expect(Number(header['differentRateSalesAmount'])).toBe(0);
    expect(Number(header['differentRateSalesVat'])).toBe(0);
    expect(header['differentRateSalesAmountSign']).toBe('+');
    expect(header['differentRateSalesVatSign']).toBe('+');
  });

  it('a negative total takes "-" and the digits stay positive', () => {
    const header = mixed();
    expect(header['reportedVatSign']).toBe('-');
    expect(Number(header['reportedVat'])).toBe(1746);
  });
});

describe('reportedVat is taken, never computed', () => {
  it('refuses a file when no reportedVat is supplied, and says why', () => {
    const result = generatePcn874(csv('no-reported-vat.csv'));
    expect(result.ok).toBe(false);
    expect(result.text).toBeNull();
    const problem = result.problems.find(p => p.code === 'meta.reportedVat.missing');
    expect(problem, JSON.stringify(result.problems)).toBeDefined();
    expect(problem!.severity).toBe('error');
    expect(problem!.message).toMatch(/will not compute it/);
    expect(problem!.message).toMatch(/states no arithmetic/);
    expect(problem!.message).toMatch(/§5\.2 and §6\.7/);
    expect(problem!.sources).toContain(`ita:${OFFICIAL_TEXT_PATH}:126`);
  });

  it('takes the CLI value over the CSV line, and never derives one from the details', () => {
    // The details are unchanged; only the supplied figure moves, which is the
    // proof that nothing about the details produced it.
    const a = headerOf(generatePcn874(csv('minimal.csv'), { reportedVat: '4242' }));
    const b = headerOf(generatePcn874(csv('minimal.csv'), { reportedVat: '-7' }));
    expect(Number(a['reportedVat'])).toBe(4242);
    expect(a['reportedVatSign']).toBe('+');
    expect(Number(b['reportedVat'])).toBe(7);
    expect(b['reportedVatSign']).toBe('-');
    // ...and the header's other fields did not move with it.
    expect(a['taxableSalesAmount']).toBe(b['taxableSalesAmount']);
  });

  it('a reportedVat of zero takes "+", the sign official line 174 requires', () => {
    const header = headerOf(generatePcn874(csv('minimal.csv'), { reportedVat: '0' }));
    expect(Number(header['reportedVat'])).toBe(0);
    expect(header['reportedVatSign']).toBe('+');
  });

  it('refuses a reportedVat that is not an amount', () => {
    const result = generatePcn874(csv('minimal.csv'), { reportedVat: 'about 1800' });
    expect(result.ok).toBe(false);
    expect(result.problems.map(p => p.code)).toContain('meta.reportedVat.unreadable');
  });
});

describe('it refuses to write a file its own validator rejects', () => {
  it('a T input with a zeros counter party is built, checked, and thrown away', () => {
    const result = generatePcn874(csv('input-no-supplier.csv'));
    expect(result.ok).toBe(false);
    expect(result.text).toBeNull();
    // The refusal came from the VALIDATOR, not from an input rule: a file was
    // built and then rejected by detail.T.counterpartyExpected.
    expect(result.validation).not.toBeNull();
    expect(result.validation!.findings.map(f => f.rule)).toContain(
      'detail.T.counterpartyExpected',
    );
    expect(result.validation!.counts.error).toBeGreaterThan(0);
  });

  /**
   * What this test proves, exactly: over every CSV fixture and a battery of
   * mutations of them, `generatePcn874` never returned text that fails
   * validation. It cannot prove a universal, but `text` is assigned in exactly
   * one place — `ok ? text : null`, where `ok` is "the validator found no
   * error" — and it is now the only thing that carries a file at all: the
   * refutation audit's §5 showed that `validation.parsed.records` used to hand
   * a refused file back byte for byte, and the test above proves those records
   * are gone. The CLI writes nothing else.
   *
   * What it does NOT prove is that the amounts are right. The validator
   * cross-checks no amount (docs/SPEC.md §5.2), so "the validator accepts it"
   * is about layout and counts; the input rules in `parseRows` are what stand
   * between a mistyped CSV and a wrong total, and the audit cases above are the
   * tests for those.
   */
  it('never returns text that the validator rejects, over every fixture and mutation', () => {
    const inputs: string[] = CSV_FIXTURES.map(csv);
    const base = csv('minimal.csv');
    inputs.push(
      base.replace('S,512345678', 'T,000000000'), // an input with no supplier
      base.replace('S,512345678', 'M,000000000'), // a self-invoice sale with none
      base.replace('S,512345678', 'L,512345678'), // an L record that names a customer
      base.replace('S,512345678', 'Y,999999999'), // an export carrying VAT
      base.replace(',1800,10000,', ',18000,100000,'), // an unidentified ₪100,000 sale
      base.replace('S,512345678', 'S,000000000'),
      base.replace('# reportedVat: 1800', '# reportedVat: 0'),
      base.replace(',1800,10000,', ',0,0,'), // both amounts zero
      base.replace('20260112', '20261301'), // not a date
      base.replace('0001', 'A/01'), // punctuation in an A(4) field
      base.replace('# licensedDealerId: 514457282', '# licensedDealerId: 12'),
      base.replace('# reportMonth: 202601', '# reportMonth: 209913'),
      base.replace(',1800,10000,', ',999999999999,10000,'), // wider than N(9)
      base.replace('entryType,', 'entryTypo,'),
      base.replace('S,512345678', 'Q,512345678'),
      '',
      '# reportedVat: 1800\n',
    );

    for (const input of inputs) {
      const result = generatePcn874(input);
      if (result.text === null) {
        expect(result.ok).toBe(false);
        continue;
      }
      expect(result.ok).toBe(true);
      const check = validatePcn874(result.text);
      expect(check.valid, `${input.slice(0, 120)} produced an invalid file`).toBe(true);
      expect(check.counts.error).toBe(0);
    }
  });

  it('refuses an amount too wide for the field rather than truncating it', () => {
    const wide = csv('minimal.csv').replace(',1800,10000,', ',9999999999,10000,');
    const result = generatePcn874(wide);
    expect(result.ok).toBe(false);
    expect(result.problems.map(p => p.code)).toContain('amount.tooWide');
    expect(result.problems.find(p => p.code === 'amount.tooWide')!.message).toMatch(
      /Refusing rather than writing a truncated amount/,
    );
  });

  it('refuses a row whose two amounts disagree about the record\'s one sign', () => {
    const conflict = csv('minimal.csv').replace(',1800,10000,', ',-1800,10000,');
    const result = generatePcn874(conflict);
    expect(result.ok).toBe(false);
    expect(result.problems.map(p => p.code)).toContain('row.sign.conflict');
  });
});

describe('signs and zero', () => {
  it('a document with both amounts zero takes "+", never "-"', () => {
    const result = generatePcn874(csv('sign-of-zero.csv'));
    expect(result.ok).toBe(true);
    const details = parsePcn874(result.text!).records.filter(r => r.kind === 'detail');
    const bothZero = details[1]!;
    expect(Number(bothZero.fields['totalVat'])).toBe(0);
    expect(Number(bothZero.fields['invoiceSum'])).toBe(0);
    expect(bothZero.fields['invoiceSumSign']).toBe('+');
    // ...which is exactly the error the validator would raise on "-". The other
    // record in this file is a VAT-only credit and warns on its own account, so
    // the assertion is about THIS record.
    const onThisRecord = validatePcn874(result.text!).findings.filter(
      f => f.record === `detail[${bothZero.index}]`,
    );
    expect(onThisRecord.map(f => f.rule)).not.toContain('detail.invoiceSumSign.signOfZero');
  });

  it('a VAT-only credit keeps its "-" and is a warning, not a refusal', () => {
    const result = generatePcn874(csv('sign-of-zero.csv'));
    const credit = parsePcn874(result.text!).records.filter(r => r.kind === 'detail')[0]!;
    expect(credit.fields['invoiceSumSign']).toBe('-');
    expect(Number(credit.fields['totalVat'])).toBe(180);
    expect(Number(credit.fields['invoiceSum'])).toBe(0);
    const finding = validatePcn874(result.text!).findings.find(
      f => f.rule === 'detail.invoiceSumSign.signOfZero',
    );
    expect(finding!.severity).toBe('warning');
    expect(result.ok).toBe(true);
  });

  it('a header total of zero takes "+" on every sign field', () => {
    const header = headerOf(generatePcn874(csv('minimal.csv')));
    for (const field of HEADER.fields.filter(f => f.class === 'sign')) {
      const magnitude = HEADER.fields.find(f => f.id === field.signs)!;
      if (Number(header[magnitude.id]) === 0) {
        expect(header[field.id], `${field.id} on a zero amount`).toBe('+');
      }
    }
  });

  it('a credit note carries "-" and positive digits', () => {
    const details = parsePcn874(generatePcn874(csv('mixed.csv')).text!).records.filter(
      r => r.kind === 'detail',
    );
    const credit = details[1]!;
    expect(credit.fields['invoiceSumSign']).toBe('-');
    expect(Number(credit.fields['invoiceSum'])).toBe(1000);
    expect(Number(credit.fields['totalVat'])).toBe(180);
  });
});

describe('rounding', () => {
  it('rounds to the nearest shekel and warns where a half decided the digit', () => {
    const result = generatePcn874(csv('rounding.csv'));
    expect(result.ok).toBe(true);
    const details = parsePcn874(result.text!).records.filter(r => r.kind === 'detail');
    expect(Number(details[0]!.fields['totalVat'])).toBe(1800); // 1799.50 -> away from zero
    expect(Number(details[0]!.fields['invoiceSum'])).toBe(9997); // 9997.49 -> down
    expect(Number(details[1]!.fields['totalVat'])).toBe(566); // 565.51 -> up
    expect(Number(details[1]!.fields['invoiceSum'])).toBe(3142); // 3141.59 -> up

    const tie = result.problems.find(p => p.code === 'row.amount.roundingTie');
    expect(tie, 'the half-shekel tie was not reported').toBeDefined();
    expect(tie!.severity).toBe('warning');
    // The tie-break is ours; the message must say so and must not claim the
    // circular requires it.
    expect(tie!.productChoice).toMatch(/product choice, not a rule of the circular/);
    expect(tie!.officialText).toMatch(/[Rr]ounded to the nearest shekel/);
  });

  it('rounds a negative amount away from zero too, and keeps the digits positive', () => {
    const input = csv('minimal.csv').replace(',1800,10000,', ',-1800.5,-10000.5,');
    const result = generatePcn874(input);
    expect(result.ok).toBe(true);
    const detail = parsePcn874(result.text!).records.filter(r => r.kind === 'detail')[0]!;
    expect(detail.fields['invoiceSumSign']).toBe('-');
    expect(Number(detail.fields['totalVat'])).toBe(1801);
    expect(Number(detail.fields['invoiceSum'])).toBe(10001);
  });
});

describe('the reference number and the allocation number', () => {
  it('takes the nine rightmost digits of a longer reference number, and says so', () => {
    const result = generatePcn874(csv('warnings.csv'));
    expect(result.ok).toBe(true);
    const detail = parsePcn874(result.text!).records.filter(r => r.kind === 'detail')[0]!;
    expect(detail.fields['refNumber']).toBe('000000101');
    const warning = result.problems.find(p => p.code === 'row.refNumber.rightmostNine');
    expect(warning!.severity).toBe('warning');
    expect(warning!.officialText).toContain('First 9 positions from the right');
  });

  it('labels the allocation-number rule as the vendor manual\'s, not the circular\'s', () => {
    const input = csv('minimal.csv').replace(',123456789,', ',9912345678900,');
    const result = generatePcn874(input);
    expect(result.ok).toBe(true);
    const warning = result.problems.find(p => p.code === 'row.allocationNumber.rightmostNine')!;
    expect(warning.severity).toBe('warning');
    expect(warning.sources.some(s => kindOf(s) === 'vendor-manual')).toBe(true);
    expect(warning.productChoice).toMatch(/not a Tax Authority document/);
    const detail = parsePcn874(result.text!).records.filter(r => r.kind === 'detail')[0]!;
    expect(detail.fields['allocationNumber']).toBe('345678900');
  });

  it('refuses a non-digit allocation number on the circular\'s own type', () => {
    const input = csv('minimal.csv').replace(',123456789,', ',12345678A,');
    const result = generatePcn874(input);
    expect(result.ok).toBe(false);
    expect(result.problems.map(p => p.code)).toContain('row.allocationNumber.digits');
  });
});

describe('the CSV itself', () => {
  it('refuses an unknown column rather than ignoring it', () => {
    const result = generatePcn874(csv('minimal.csv').replace('vatSum', 'vatAmount'));
    expect(result.ok).toBe(false);
    expect(result.problems.map(p => p.code)).toContain('csv.column.unknown');
  });

  it('accepts spelling variants of a column name', () => {
    const renamed = csv('minimal.csv').replace(
      'entryType,counterpartyVatId,invoiceDate',
      'Entry Type,counterparty_vat_id,invoice-date',
    );
    expect(generatePcn874(renamed).ok).toBe(true);
  });

  it('refuses a required column that is missing', () => {
    const rows = csv('minimal.csv').replace(/^entryType,/m, 'refGroup,');
    const result = generatePcn874(rows);
    expect(result.ok).toBe(false);
    expect(result.problems.map(p => p.code)).toContain('csv.column.missing');
  });

  it('refuses an unknown header directive rather than dropping it silently', () => {
    const result = generatePcn874(csv('minimal.csv').replace('# reportMonth:', '# reportPeriod:'));
    expect(result.ok).toBe(false);
    expect(result.problems.map(p => p.code)).toContain('meta.unknown');
  });

  it('keeps a comment that contains a colon as a comment', () => {
    const result = generatePcn874(
      csv('minimal.csv').replace('# reportMonth: 202601', '# note about this file: no directive\n# reportMonth: 202601'),
    );
    expect(result.ok, JSON.stringify(result.problems)).toBe(true);
  });

  it('reads dates and periods with or without hyphens', () => {
    const hyphenated = csv('minimal.csv')
      .replace('# reportMonth: 202601', '# reportMonth: 2026-01')
      .replace('# generationDate: 20260210', '# generationDate: 2026-02-10')
      .replace(',20260112,', ',2026-01-12,');
    expect(generatePcn874(hyphenated).text).toBe(generatePcn874(csv('minimal.csv')).text);
  });

  it('refuses an invoice date that is not a date', () => {
    const result = generatePcn874(csv('minimal.csv').replace(',20260112,', ',20260231,'));
    expect(result.ok).toBe(false);
    expect(result.problems.map(p => p.code)).toContain('row.invoiceDate.calendar');
  });

  it('handles quoted cells and CRLF line endings', () => {
    const crlf = csv('minimal.csv')
      .replace(',1800,10000,', ',"1,800","10,000",')
      .replace(/\n/g, '\r\n');
    const result = generatePcn874(crlf);
    expect(result.ok, JSON.stringify(result.problems)).toBe(true);
    expect(result.text).toBe(fixture('valid-minimal.txt'));
  });
});

describe("the refutation audit's constructed inputs", () => {
  const outcome = (
    file: string,
  ): { ok: boolean; codes: string[]; rules: string[]; text: string | null } => {
    const result = generatePcn874(csv(file));
    return {
      ok: result.ok,
      codes: result.problems.map(p => p.code),
      rules: (result.validation?.findings ?? []).map(f => f.rule),
      text: result.text,
    };
  };

  it.each(AUDIT_CASES)(
    '$file — $what',
    ({ file, ok, problems = [], warnings = [], findings = [], absent = [] }) => {
      const seen = outcome(file);
      const where = `${file}: problems=${seen.codes.join(',')} findings=${seen.rules.join(',')}`;
      expect(seen.ok, where).toBe(ok);
      expect(seen.text === null, `${file}: text must be null exactly when the file is refused`).toBe(
        !ok,
      );
      for (const code of [...problems, ...warnings]) expect(seen.codes, where).toContain(code);
      for (const rule of findings) expect(seen.rules, where).toContain(rule);
      for (const name of absent) {
        expect(seen.codes, where).not.toContain(name);
        expect(seen.rules, where).not.toContain(name);
      }
    },
  );

  it('a refused case reports its rule as an error, a written one as a warning', () => {
    for (const c of AUDIT_CASES) {
      const result = generatePcn874(csv(c.file));
      for (const code of c.problems ?? []) {
        const problem = result.problems.find(p => p.code === code)!;
        expect(problem.severity, `${c.file} / ${code}`).toBe(c.ok ? 'warning' : 'error');
      }
      for (const code of c.warnings ?? []) {
        expect(result.problems.find(p => p.code === code)!.severity, `${c.file} / ${code}`).toBe(
          'warning',
        );
      }
    }
  });

  // --- the three that used to be written, silently wrong (audit §4 c2, l, n)

  it('c2: the shifted row wrote VAT ₪1 and a total of ₪800 for a ₪1,800/₪10,000 sale', () => {
    const result = generatePcn874(csv('audit-c2-extra-cells.csv'));
    const problem = result.problems.find(p => p.code === 'csv.row.cellCount')!;
    expect(problem.message).toMatch(/9 cell\(s\) and the column header has 8/);
    expect(problem.message).toMatch(/comma inside an unquoted amount/);
    expect(result.text).toBeNull();
  });

  it('l: a truncated row is not a ₪0 zero-rated sale', () => {
    const problem = generatePcn874(csv('audit-l-short-row.csv')).problems.find(
      p => p.code === 'csv.row.cellCount',
    )!;
    expect(problem.message).toMatch(/3 cell\(s\) and the column header has 9/);
    expect(problem.message).toMatch(/every missing cell would be read as empty/);
  });

  it('n: a decimal comma is named as such, not silently multiplied by a hundred', () => {
    const problem = generatePcn874(csv('audit-n-decimal-comma.csv')).problems.find(
      p => p.code === 'row.amount.unreadable',
    )!;
    expect(problem.message).toMatch(/"1800,00" into ₪180,000/);
    expect(problem.message).toMatch(/thousands separator/);
  });

  it('n2: "1.000" is refused as ambiguous rather than read either way', () => {
    const problem = generatePcn874(csv('audit-n2-european-thousands.csv')).problems.find(
      p => p.code === 'row.amount.unreadable',
    )!;
    expect(problem.message).toMatch(/₪1 with three decimal digits and ₪1,000/);
  });

  it('a comma is read as a thousands separator and nothing else', () => {
    const amount = (raw: string): string | null => {
      const result = generatePcn874(csv('minimal.csv').replace(',1800,10000,', `,"${raw}",10000,`));
      if (!result.ok) return null;
      return parsePcn874(result.text!).records.filter(r => r.kind === 'detail')[0]!.fields[
        'totalVat'
      ]!;
    };
    expect(amount('1,800')).toBe('000001800');
    expect(amount('1,800.00')).toBe('000001800');
    expect(amount('1,234,567')).toBe('001234567');
    expect(amount('1800,00')).toBeNull();
    expect(amount('1,80')).toBeNull();
    expect(amount('1.000')).toBeNull();
    expect(amount('18,00,00')).toBeNull();
  });

  // --- the two that silently moved a document between header totals

  it('o: an empty VAT cell is written into the zero-value total, and said so', () => {
    const result = generatePcn874(csv('audit-o-empty-vat.csv'));
    const header = headerOf(result);
    expect(Number(header['taxableSalesAmount'])).toBe(0);
    expect(Number(header['zeroOrExemptSalesAmount'])).toBe(10000);
    const warning = result.problems.find(p => p.code === 'row.vatSum.empty')!;
    expect(warning.severity).toBe('warning');
    expect(warning.message).toMatch(/Total of zero value\/exempt sales for period/);
  });

  it('o: an EXPLICIT zero is silent, so a ledger that writes 0 is not spammed', () => {
    const explicit = generatePcn874(csv('audit-o-empty-vat.csv').replace(/,,10000,/, ',0,10000,'));
    expect(explicit.problems.map(p => p.code)).not.toContain('row.vatSum.empty');
    expect(explicit.ok).toBe(true);
  });

  it('q: a VAT that rounds to zero moves the sale, and the choice is named as ours', () => {
    const result = generatePcn874(csv('audit-q-vat-rounds-to-zero.csv'));
    const header = headerOf(result);
    expect(Number(header['taxableSalesAmount'])).toBe(0);
    expect(Number(header['zeroOrExemptSalesAmount'])).toBe(2);
    const warning = result.problems.find(p => p.code === 'row.vat.roundedToZero')!;
    expect(warning.severity).toBe('warning');
    expect(warning.productChoice).toMatch(/product choice, not a rule of the circular/);
    expect(warning.productChoice).toMatch(/never says whether the classification is made before or after/);
  });

  // --- the ones that must still come out exactly right

  it('a: a BOM and CRLF produce the golden file byte for byte', () => {
    expect(generatePcn874(csv('audit-a-bom-crlf.csv')).text).toBe(fixture('valid-minimal.txt'));
  });

  it('b: quoted thousands separators produce the golden file too', () => {
    expect(generatePcn874(csv('audit-b-quoted-thousands.csv')).text).toBe(
      fixture('valid-minimal.txt'),
    );
  });

  it('k: the empty row is dropped, and the rest is the golden file', () => {
    expect(generatePcn874(csv('audit-k-empty-row.csv')).text).toBe(fixture('valid-minimal.txt'));
  });

  it('e1: the credit subtracts from both totals and the record keeps "-"', () => {
    const result = generatePcn874(csv('audit-e1-credit.csv'));
    const header = headerOf(result);
    expect(Number(header['taxableSalesAmount'])).toBe(9900);
    expect(header['taxableSalesAmountSign']).toBe('+');
    expect(Number(header['taxableSalesVat'])).toBe(1782);
    const credit = parsePcn874(result.text!).records.filter(r => r.kind === 'detail')[1]!;
    expect(credit.fields['invoiceSumSign']).toBe('-');
    // ...and reportedVat did not move with them: it is the supplied 1800.
    expect(Number(header['reportedVat'])).toBe(1800);
  });

  it('i: the same document twice is counted twice', () => {
    const header = headerOf(generatePcn874(csv('audit-i-duplicate-row.csv')));
    expect(Number(header['salesRecordCount'])).toBe(2);
    expect(Number(header['taxableSalesAmount'])).toBe(20000);
    expect(Number(header['reportedVat'])).toBe(1800); // still the supplied figure
  });

  it('s: negative half-shekel ties round away from zero, digits positive', () => {
    const detail = parsePcn874(generatePcn874(csv('audit-s-negative-ties.csv')).text!).records.filter(
      r => r.kind === 'detail',
    )[0]!;
    expect(Number(detail.fields['totalVat'])).toBe(1);
    expect(Number(detail.fields['invoiceSum'])).toBe(3);
    expect(detail.fields['invoiceSumSign']).toBe('-');
  });

  it('d: the Hebrew reference group makes the record wider in bytes than in characters', () => {
    const result = generatePcn874(csv('audit-d-refgroup-hebrew.csv'));
    const detail = parsePcn874(result.text!).records.filter(r => r.kind === 'detail')[0]!;
    expect(detail.raw.length).toBe(60);
    expect(Buffer.byteLength(detail.raw, 'utf8')).toBe(62);
    const finding = result.validation!.findings.find(f => f.rule === 'file.byteWidth')!;
    expect(finding.severity).toBe('warning');
    expect(finding.message).toMatch(/60 characters and 62 bytes/);
    expect(finding.openQuestion).toBeTruthy();
  });

  it('h3: the malformed directive names the line and the form it wanted', () => {
    const problem = generatePcn874(csv('audit-h3-directive-no-colon.csv')).problems.find(
      p => p.code === 'meta.malformed',
    )!;
    expect(problem.severity).toBe('error');
    expect(problem.message).toMatch(/# reportedVat: <value>/);
    expect(problem.line).toBe(6);
  });
});

describe('a refused file is not reachable through the result', () => {
  /**
   * The audit's §5: `text` is null on a refusal, but `validation.parsed.records`
   * used to carry the refused file byte for byte, so a library caller could
   * reassemble and write exactly the file this package refused to produce. The
   * records are dropped now, and the findings — which are the point — stay.
   */
  it('a post-build refusal carries findings and no records', () => {
    const result = generatePcn874(csv('input-no-supplier.csv'));
    expect(result.ok).toBe(false);
    expect(result.text).toBeNull();
    expect(result.validation).not.toBeNull();
    expect(result.validation!.parsed.records).toEqual([]);
    expect(result.validation!.findings.map(f => f.rule)).toContain('detail.T.counterpartyExpected');
    expect(result.validation!.counts.error).toBeGreaterThan(0);
  });

  it('no record of the refused file survives anywhere in the result', () => {
    for (const name of CSV_FIXTURES) {
      const result = generatePcn874(csv(name));
      if (result.ok) continue;
      const serialised = JSON.stringify(result);
      // The closing entry is "X" + the dealer id, and it appears in no message.
      expect(serialised, `${name} still carries the closing entry`).not.toContain('X514457282');
      // The header record begins with "O" + the dealer id.
      expect(serialised, `${name} still carries the header record`).not.toContain('O514457282');
    }
  });
});

describe('what the generator may not say, and what it must cite', () => {
  it('never calls its own output compliant, accepted or approved', () => {
    const forbidden = /\b(compliant|accepted|approved)\b|תקין|מאושר|קביל/i;
    for (const name of CSV_FIXTURES) {
      const result = generatePcn874(csv(name));
      for (const problem of result.problems) {
        expect(problem.message, `${name} / ${problem.code}`).not.toMatch(forbidden);
        expect(problem.productChoice ?? '', `${name} / ${problem.code}`).not.toMatch(forbidden);
      }
    }
  });

  it('every problem citing the circular quotes a line that really says it', () => {
    const normalise = (text: string): string =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    const RUN = 4;
    const wordRuns = (text: string): Set<string> => {
      const words = normalise(text).split(' ').filter(Boolean);
      const out = new Set<string>();
      for (let i = 0; i + RUN <= words.length; i++) out.add(words.slice(i, i + RUN).join(' '));
      return out;
    };
    const citedText = (citation: string): string => {
      const ref = citation.slice(citation.lastIndexOf(':') + 1);
      const out: string[] = [];
      for (const chunk of ref.split(',')) {
        const [from, to] = chunk.split('-').map(Number);
        expect(Number.isInteger(from), `bad line reference ${citation}`).toBe(true);
        for (let n = from!; n <= (to ?? from!); n++) out.push(officialLines[n - 1] ?? '');
      }
      return out.join(' ');
    };

    // Every input that produces a problem, not only the ones that succeed.
    const inputs = [
      ...CSV_FIXTURES.map(csv),
      csv('minimal.csv').replace(',123456789,', ',12345678A,'),
      csv('minimal.csv').replace(',1800,10000,', ',-1800,10000,'),
      csv('minimal.csv').replace(',1800,10000,', ',9999999999,10000,'),
      csv('minimal.csv').replace(',20260112,', ',20260231,'),
      csv('minimal.csv').replace('# licensedDealerId: 514457282', '# licensedDealerId: x'),
      csv('minimal.csv').replace('# reportMonth: 202601', '# reportMonth: 209913'),
      csv('minimal.csv').replace('# generationDate: 20260210', '# generationDate: 20260231'),
      csv('minimal.csv').replace('S,512345678', 'Q,512345678'),
      csv('minimal.csv').replace(',1800,10000,', ',x,10000,'),
      csv('minimal.csv').replace('0001,000000101', '00001,00000010A'),
      csv('minimal.csv').replace('S,512345678', 'S,51234567A'),
      csv('minimal.csv').replace(/,$/m, ',lorry'),
    ];

    let checked = 0;
    for (const input of inputs) {
      for (const problem of generatePcn874(input).problems) {
        for (const citation of problem.sources) {
          const key = citation.slice(0, citation.indexOf(':'));
          expect(SOURCES[key], `${problem.code} cites unknown source ${citation}`).toBeDefined();
        }
        if (!problem.officialText) continue;
        const official = problem.sources.filter(s => kindOf(s) === 'official');
        if (official.length === 0) continue;
        const runs = wordRuns(official.map(citedText).join(' '));
        const quoted = wordRuns(problem.officialText);
        const shared = [...quoted].some(run => runs.has(run));
        expect(shared, `${problem.code} quotes text its cited lines do not contain`).toBe(true);
        checked++;
      }
    }
    expect(checked, 'no problem was actually checked').toBeGreaterThan(10);
  });

  it('every problem carries a code, a message and a severity', () => {
    for (const name of CSV_FIXTURES) {
      for (const problem of generatePcn874(csv(name)).problems) {
        expect(problem.code.length).toBeGreaterThan(3);
        expect(problem.message.length).toBeGreaterThan(10);
        expect(['error', 'warning']).toContain(problem.severity);
      }
    }
  });
});
