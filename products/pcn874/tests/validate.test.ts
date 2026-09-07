import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parsePcn874 } from '../src/parse.js';
import { SOURCES } from '../src/sources.js';
import { validatePcn874, type Finding, type ValidationResult } from '../src/validate.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string): string => readFileSync(join(here, 'fixtures', name), 'utf8');

const rules = (result: ValidationResult): string[] => result.findings.map(f => f.rule);
const errors = (result: ValidationResult): Finding[] =>
  result.findings.filter(f => f.severity === 'error');

describe('valid fixtures', () => {
  it.each(['valid-minimal.txt', 'valid-mixed.txt', 'valid-crlf.txt'])(
    '%s validates with no errors',
    name => {
      const result = validatePcn874(fixture(name));
      expect(errors(result), JSON.stringify(errors(result), null, 2)).toEqual([]);
      expect(result.valid).toBe(true);
    },
  );

  it('valid-mixed.txt has no warnings either: its declared counts match its records', () => {
    const result = validatePcn874(fixture('valid-mixed.txt'));
    expect(result.findings).toEqual([]);
    expect(result.counts).toEqual({ error: 0, warning: 0, info: 0 });
  });

  it('accepts a parsed file as well as text', () => {
    const parsed = parsePcn874(fixture('valid-minimal.txt'));
    expect(validatePcn874(parsed).valid).toBe(true);
    expect(validatePcn874(parsed).parsed).toBe(parsed);
  });

  it('a period with no transactions is a warning, not an error', () => {
    const result = validatePcn874(fixture('valid-no-details.txt'));
    expect(result.valid).toBe(true);
    expect(rules(result)).toContain('file.detail.none');
    const finding = result.findings.find(f => f.rule === 'file.detail.none')!;
    expect(finding.severity).toBe('warning');
    expect(finding.disagreement).toMatch(/rcbuilder|fewer than three/);
  });
});

describe('record grammar', () => {
  it('rejects a header that is not 131 characters', () => {
    const result = validatePcn874(fixture('invalid-header-length.txt'));
    expect(result.valid).toBe(false);
    expect(rules(result)).toContain('header.length');
    const finding = result.findings.find(f => f.rule === 'header.length')!;
    expect(finding.message).toContain('131');
    expect(finding.disagreement).toContain('129');
  });

  it('rejects a detail record that is not 60 characters', () => {
    const result = validatePcn874(fixture('invalid-detail-length.txt'));
    expect(result.valid).toBe(false);
    expect(rules(result)).toContain('detail.length');
  });

  it('rejects a record type nobody defines', () => {
    const result = validatePcn874(fixture('invalid-record-type.txt'));
    expect(result.valid).toBe(false);
    expect(rules(result)).toContain('file.record.unknown');
    expect(result.findings[0]!.message).toContain('C, H, I, K, L, M, P, R, S, T, Y');
  });

  it('rejects the linet3 "Z" trailer and names the disagreement', () => {
    const result = validatePcn874(fixture('invalid-footer-z.txt'));
    expect(result.valid).toBe(false);
    const finding = result.findings.find(f => f.rule === 'footer.recordType.literal')!;
    expect(finding.severity).toBe('error');
    expect(finding.disagreement).toContain('linet3');
    expect(finding.disagreement).toContain('§5.5');
  });

  it('rejects a trailer dealer id that differs from the header', () => {
    const result = validatePcn874(fixture('invalid-footer-dealer.txt'));
    expect(result.valid).toBe(false);
    expect(rules(result)).toContain('footer.licensedDealerId.matchesHeader');
  });

  it('rejects a non-digit in a digits field', () => {
    const result = validatePcn874(fixture('invalid-header-digits.txt'));
    expect(result.valid).toBe(false);
    expect(rules(result)).toContain('header.licensedDealerId.digits');
  });

  it('rejects a file with no records', () => {
    const result = validatePcn874('');
    expect(result.valid).toBe(false);
    expect(rules(result)).toEqual(['file.empty']);
  });

  it('rejects a missing header and a missing trailer', () => {
    const detailOnly = fixture('valid-minimal.txt').split('\n')[1]!;
    const result = validatePcn874(detailOnly);
    expect(rules(result)).toContain('file.header.missing');
    expect(rules(result)).toContain('file.footer.missing');
    expect(result.valid).toBe(false);
  });

  it('rejects a trailer that is not last', () => {
    const [header, detail, footer] = fixture('valid-minimal.txt').split('\n');
    const result = validatePcn874([header, footer, detail].join('\n'));
    expect(rules(result)).toContain('file.footer.position');
    expect(result.valid).toBe(false);
  });

  it('rejects a header that is not first', () => {
    const [header, detail, footer] = fixture('valid-minimal.txt').split('\n');
    const result = validatePcn874([detail, header, footer].join('\n'));
    expect(rules(result)).toContain('file.header.position');
  });

  it('rejects two headers', () => {
    const [header, detail, footer] = fixture('valid-minimal.txt').split('\n');
    const result = validatePcn874([header, header, detail, footer].join('\n'));
    expect(rules(result)).toContain('file.header.duplicate');
  });

  it('rejects two trailers', () => {
    const [header, detail, footer] = fixture('valid-minimal.txt').split('\n');
    const result = validatePcn874([header, detail, footer, footer].join('\n'));
    expect(rules(result)).toContain('file.footer.duplicate');
  });

  it('rejects non-ASCII content', () => {
    const result = validatePcn874(`${fixture('valid-minimal.txt')}שלום`);
    expect(rules(result)).toContain('file.encoding.ascii');
    expect(result.valid).toBe(false);
  });

  it('warns on mixed line endings without invalidating the file', () => {
    const lines = fixture('valid-minimal.txt').split('\n');
    const result = validatePcn874(`${lines[0]}\r\n${lines[1]}\n${lines[2]}`);
    expect(rules(result)).toContain('file.lineEnding.mixed');
    expect(result.valid).toBe(true);
  });
});

describe('header field rules', () => {
  const swap = (text: string, offset: number, replacement: string): string =>
    text.slice(0, offset) + replacement + text.slice(offset + replacement.length);

  const base = fixture('valid-minimal.txt');

  it('rejects a report type other than "1"', () => {
    const result = validatePcn874(swap(base, 16, '2'));
    expect(rules(result)).toContain('header.reportType.literal');
    expect(result.valid).toBe(false);
  });

  it('rejects a header that does not start with "O"', () => {
    const result = validatePcn874(swap(base, 0, 'A'));
    // an 'A' first character makes the record unclassifiable, not a bad header
    expect(rules(result)).toContain('file.record.unknown');
    expect(result.valid).toBe(false);
  });

  it('rejects an impossible report month', () => {
    const result = validatePcn874(swap(base, 10, '202613'));
    expect(rules(result)).toContain('header.reportMonth.calendar');
    expect(result.valid).toBe(false);
  });

  it('rejects an impossible generation date', () => {
    const result = validatePcn874(swap(base, 17, '20260230'));
    expect(rules(result)).toContain('header.generationDate.calendar');
    expect(result.valid).toBe(false);
  });

  it('accepts a real leap day', () => {
    const result = validatePcn874(swap(base, 17, '20240229'));
    expect(rules(result)).not.toContain('header.generationDate.calendar');
  });

  it('rejects a sign field that is neither "+" nor "-"', () => {
    const result = validatePcn874(swap(base, 25, '0'));
    expect(rules(result)).toContain('header.taxableSalesAmountSign.sign');
    expect(result.valid).toBe(false);
  });

  it('accepts "-" on any signed field', () => {
    const result = validatePcn874(swap(base, 119, '-'));
    expect(errors(result)).toEqual([]);
  });

  it('warns, but does not fail, when a reserved field is non-zero', () => {
    const result = validatePcn874(swap(base, 48, '00000000001'));
    const finding = result.findings.find(f => f.rule === 'header.differentRateSalesAmount.reserved')!;
    expect(finding.severity).toBe('warning');
    expect(result.valid).toBe(true);
  });
});

describe('per-record-type constraints (warnings: only one source states them)', () => {
  it('flags an L record carrying a customer VAT id', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    const finding = result.findings.find(f => f.rule === 'detail.L.vatIdZeros')!;
    expect(finding.severity).toBe('warning');
    expect(finding.sources[0]).toContain('schemas.ts');
    expect(result.valid).toBe(true);
  });

  it('flags an R record carrying a reference number', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    expect(rules(result)).toContain('detail.R.refNumberZeros');
  });

  it('flags a K record with a VAT id or a zero reference number', () => {
    const lines = fixture('valid-mixed.txt').split('\n');
    const header = lines[0]!;
    const footer = lines[lines.length - 1]!;
    const k =
      'K' + '512345678' + '20260131' + '0000' + '000000000' + '000000126' + '+' + '0000000700' + '000000000';
    expect(k).toHaveLength(60);
    const result = validatePcn874([header, k, footer].join('\n'));
    expect(rules(result)).toContain('detail.K.vatIdZeros');
    expect(rules(result)).toContain('detail.K.refNumberNonZero');
    expect(errors(result)).toEqual([]);
  });

  it('flags a Y (export) record carrying VAT', () => {
    const lines = fixture('valid-mixed.txt').split('\n');
    const header = lines[0]!;
    const footer = lines[lines.length - 1]!;
    const y =
      'Y' + '999999999' + '20260121' + '0000' + '000000104' + '000000900' + '+' + '0000005000' + '000000000';
    const result = validatePcn874([header, y, footer].join('\n'));
    expect(rules(result)).toContain('detail.Y.vatZeros');
    expect(errors(result)).toEqual([]);
  });

  it('does not flag a compliant L, K, R or Y record', () => {
    const result = validatePcn874(fixture('valid-mixed.txt'));
    expect(result.findings).toEqual([]);
  });
});

describe('header/detail cross-checks (warnings: the sources disagree on scope)', () => {
  it('warns when the declared sales count does not match the records', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    const finding = result.findings.find(f => f.rule === 'totals.salesRecordCount')!;
    expect(finding.severity).toBe('warning');
    expect(finding.message).toContain('declares 9 sales records');
    expect(finding.message).toContain('contains 1');
  });

  it('warns when the declared inputs count does not match the records', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    const finding = result.findings.find(f => f.rule === 'totals.inputsCount')!;
    expect(finding.severity).toBe('warning');
    expect(finding.disagreement).toContain('K/R/P/H/C');
  });

  it('leaves the file valid: an unsettled rule never fails a filing', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    expect(result.valid).toBe(true);
    expect(result.counts.error).toBe(0);
    expect(result.counts.warning).toBe(4);
  });

  it('implements no reportedVat arithmetic check — three sources, three formulas', () => {
    // valid-minimal declares +1800 to pay with one sale of 1800 VAT and no inputs;
    // change it to a number that fits no formula and nothing should be reported.
    const base = fixture('valid-minimal.txt');
    const tampered = base.slice(0, 120) + '00000009999' + base.slice(131);
    const result = validatePcn874(tampered);
    expect(rules(result).some(r => r.startsWith('totals.reportedVat'))).toBe(false);
    expect(result.valid).toBe(true);
  });
});

describe('every finding is traceable', () => {
  const allFixtures = [
    'valid-minimal.txt',
    'valid-mixed.txt',
    'valid-no-details.txt',
    'valid-crlf.txt',
    'warnings-only.txt',
    'invalid-header-length.txt',
    'invalid-header-digits.txt',
    'invalid-detail-length.txt',
    'invalid-record-type.txt',
    'invalid-footer-z.txt',
    'invalid-footer-dealer.txt',
  ];

  it.each(allFixtures)('%s: every finding cites a known source', name => {
    const result = validatePcn874(fixture(name));
    for (const finding of result.findings) {
      expect(finding.sources.length, finding.rule).toBeGreaterThan(0);
      for (const citation of finding.sources) {
        const key = citation.slice(0, citation.indexOf(':'));
        expect(SOURCES[key], `${finding.rule} cites unknown source ${citation}`).toBeDefined();
      }
      expect(finding.message.length).toBeGreaterThan(10);
      expect(['error', 'warning', 'info']).toContain(finding.severity);
    }
  });

  it('valid is exactly "no error findings"', () => {
    for (const name of allFixtures) {
      const result = validatePcn874(fixture(name));
      expect(result.valid, name).toBe(result.counts.error === 0);
    }
  });

  it('names each fixture as valid or invalid the way its filename says', () => {
    for (const name of allFixtures) {
      const expected = name.startsWith('valid-') || name.startsWith('warnings-');
      expect(validatePcn874(fixture(name)).valid, name).toBe(expected);
    }
  });
});
