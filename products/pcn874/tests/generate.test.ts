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

const CSV_FIXTURES = [
  'equipment.csv',
  'input-no-supplier.csv',
  'minimal.csv',
  'mixed.csv',
  'no-reported-vat.csv',
  'rounding.csv',
  'sign-of-zero.csv',
  'warnings.csv',
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
   * validation. It cannot prove a universal, but `text` is the only way any
   * caller obtains a file, and it is assigned in exactly one place — `ok ? text
   * : null`, where `ok` is "the validator found no error". The CLI writes
   * nothing else.
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
