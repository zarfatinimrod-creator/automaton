import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parsePcn874 } from '../src/parse.js';
import { OFFICIAL_TEXT_PATH, SOURCES, kindOf } from '../src/sources.js';
import { validatePcn874, type Finding, type ValidationResult } from '../src/validate.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string): string => readFileSync(join(here, 'fixtures', name), 'utf8');
/** The extracted circular itself, so a citation can be read rather than trusted. */
const officialLines = readFileSync(join(here, '..', '..', '..', OFFICIAL_TEXT_PATH), 'utf8').split(
  '\n',
);

const rules = (result: ValidationResult): string[] => result.findings.map(f => f.rule);
const errors = (result: ValidationResult): Finding[] =>
  result.findings.filter(f => f.severity === 'error');
const find = (result: ValidationResult, rule: string): Finding =>
  result.findings.find(f => f.rule === rule)!;

describe('valid fixtures', () => {
  it.each([
    'valid-minimal.txt',
    'valid-mixed.txt',
    'valid-crlf.txt',
    'valid-refgroup-alpha.txt',
    'valid-refgroup-lowercase.txt',
    'valid-refgroup-zeropad.txt',
  ])('%s validates with no errors', name => {
    const result = validatePcn874(fixture(name));
    expect(errors(result), JSON.stringify(errors(result), null, 2)).toEqual([]);
    expect(result.valid).toBe(true);
  });

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
    const finding = find(result, 'file.detail.none');
    expect(finding.severity).toBe('warning');
    // §5.5: the circular lists transaction entries but never states a minimum.
    expect(finding.openQuestion).toMatch(/never says a minimum of one/);
  });
});

describe('record grammar', () => {
  it('rejects a header that is not 131 characters', () => {
    const result = validatePcn874(fixture('invalid-header-length.txt'));
    expect(result.valid).toBe(false);
    expect(rules(result)).toContain('header.length');
    const finding = find(result, 'header.length');
    expect(finding.message).toContain('131');
    expect(finding.basis).toBe('official');
    // The 131 is now Appendix A's own arithmetic, not two repos and a sample file.
    expect(finding.officialText).toContain('sum to 131');
  });

  it('rejects a transaction record that is not 60 characters', () => {
    const result = validatePcn874(fixture('invalid-detail-length.txt'));
    expect(result.valid).toBe(false);
    expect(rules(result)).toContain('detail.length');
  });

  it('rejects an entry type the Table of Values does not have', () => {
    const result = validatePcn874(fixture('invalid-record-type.txt'));
    expect(result.valid).toBe(false);
    expect(rules(result)).toContain('file.record.unknown');
    expect(find(result, 'file.record.unknown').message).toContain('C, H, I, K, L, M, P, R, S, T, Y');
  });

  it('rejects a "Z" closing entry and says which file "Z" belongs to', () => {
    const result = validatePcn874(fixture('invalid-footer-z.txt'));
    expect(result.valid).toBe(false);
    const finding = find(result, 'footer.recordType.literal');
    expect(finding.severity).toBe('error');
    expect(finding.basis).toBe('official');
    // Resolved §6.5: X closes Appendix A's file; Z is Appendix B's summary entry.
    expect(finding.officialText).toContain('"X" – fixed value');
    expect(finding.officialText).toContain('Appendix B');
    expect(finding.message).toContain('representative');
    // It is no longer "the sources disagree" — the document settled it.
    expect(finding.openQuestion).toBeUndefined();
  });

  it('reports, but does not reject, a closing-entry dealer id that differs from the header', () => {
    const result = validatePcn874(fixture('warnings-footer-dealer.txt'));
    const finding = find(result, 'footer.licensedDealerId.matchesHeader');
    // Demoted from `error`. No line of the circular says the two numbers are
    // equal: line 101 names one the CUSTOMER's, lines 159-161 the SUBMITTER's,
    // and Appendix A's "Individual Merchant" heading implies identity without
    // stating it. Rejecting a file on an inference is what `basis: official`
    // must never be allowed to mean.
    expect(finding.severity).toBe('warning');
    expect(finding.openQuestion).toMatch(/Individual Merchant/);
    expect(finding.openQuestion).toMatch(/990-1002/);
    expect(result.valid).toBe(true);
  });

  it('rejects a non-digit in a digits field', () => {
    const result = validatePcn874(fixture('invalid-header-digits.txt'));
    expect(result.valid).toBe(false);
    expect(rules(result)).toContain('header.licensedDealerId.digits');
    expect(find(result, 'header.licensedDealerId.digits').message).toContain('preliminary zeros');
  });

  it('rejects a file with no records', () => {
    const result = validatePcn874('');
    expect(result.valid).toBe(false);
    expect(rules(result)).toEqual(['file.empty']);
    expect(find(result, 'file.empty').basis).toBe('official');
  });

  it('rejects a missing header and a missing closing entry', () => {
    const detailOnly = fixture('valid-minimal.txt').split('\n')[1]!;
    const result = validatePcn874(detailOnly);
    expect(rules(result)).toContain('file.header.missing');
    expect(rules(result)).toContain('file.footer.missing');
    expect(result.valid).toBe(false);
  });

  it('rejects a closing entry that is not last', () => {
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

  it('rejects two closing entries', () => {
    const [header, detail, footer] = fixture('valid-minimal.txt').split('\n');
    const result = validatePcn874([header, detail, footer, footer].join('\n'));
    expect(rules(result)).toContain('file.footer.duplicate');
  });

  it('reports non-ASCII content as a warning; the field rules do the rejecting', () => {
    const result = validatePcn874(`${fixture('valid-minimal.txt')}שלום`);
    const finding = find(result, 'file.encoding.ascii');
    // Demoted from `error`: lines 96-161 declare field TYPES, not an encoding.
    // Nothing is lost — the four Hebrew characters land inside the closing
    // entry, which is still rejected on its own length rule.
    expect(finding.severity).toBe('warning');
    expect(finding.openQuestion).toMatch(/never states its alphabet|does not define|defines the character set/);
    expect(rules(result)).toContain('footer.length');
    expect(result.valid).toBe(false);
  });

  /**
   * The refutation audit of the generator (§4 case d) found that a two-letter
   * Hebrew reference group makes a 60-character transaction record 62 bytes
   * wide under UTF-8, and that neither existing warning said so: every length
   * here is counted in characters, so a reader that counts bytes sees different
   * fields. A warning and not an error, because the circular states no encoding
   * at all — the same reason `file.encoding.ascii` is one.
   */
  it('warns when a record is wider in bytes than in characters, and names both', () => {
    const result = validatePcn874(fixture('warnings-refgroup-hebrew.txt'));
    const finding = find(result, 'file.byteWidth');
    expect(finding.severity).toBe('warning');
    expect(finding.message).toMatch(/60 characters and 62 bytes/);
    expect(finding.openQuestion).toBeTruthy();
    expect(result.valid).toBe(true);
  });

  it('says nothing about byte width on an all-ASCII file', () => {
    expect(rules(validatePcn874(fixture('valid-minimal.txt')))).not.toContain('file.byteWidth');
    expect(rules(validatePcn874(fixture('valid-mixed.txt')))).not.toContain('file.byteWidth');
  });

  it('warns on mixed line endings without invalidating the file, and says nothing settles it', () => {
    const lines = fixture('valid-minimal.txt').split('\n');
    const result = validatePcn874(`${lines[0]}\r\n${lines[1]}\n${lines[2]}`);
    expect(rules(result)).toContain('file.lineEnding.mixed');
    expect(result.valid).toBe(true);
    const finding = find(result, 'file.lineEnding.mixed');
    // §5.3 / §6.6: STILL OPEN. This is the only rule with no official citation.
    expect(finding.basis).toBe('oss-only');
    expect(finding.openQuestion).toMatch(/never states a record separator/);
  });

  it('names Appendix B when handed a representative alignment file', () => {
    const result = validatePcn874(fixture('invalid-representative-file.txt'));
    expect(result.valid).toBe(false);
    const finding = find(result, 'file.record.unknown');
    expect(finding.message).toContain('Appendix B');
    expect(finding.message).toContain('several users');
    expect(finding.officialText).toContain('"A" – fixed value');
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
    // an 'A' first character is Appendix B's initial entry, not a header
    expect(rules(result)).toContain('file.record.unknown');
    expect(result.valid).toBe(false);
  });

  it('rejects an impossible report month', () => {
    const result = validatePcn874(swap(base, 10, '202613'));
    expect(rules(result)).toContain('header.reportMonth.calendar');
    expect(result.valid).toBe(false);
  });

  it('reports an impossible generation date as a WARNING, naming the document\'s own inconsistency', () => {
    const result = validatePcn874(swap(base, 17, '20260230'));
    const finding = find(result, 'header.generationDate.calendar');
    // §5.1: line 105 types the field N(8) and calls it "Yyyymm form". Reading it
    // as YYYYMMDD comes from the three implementations, not from the Authority,
    // and this file's own severity rule puts "two parts of the document pull in
    // different directions" under `warning`. Demoted for that consistency.
    expect(finding.severity).toBe('warning');
    expect(finding.openQuestion).toMatch(/Yyyymm form/);
    expect(result.valid).toBe(true);
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

  it('accepts "-" on a signed field whose amount is not zero', () => {
    const result = validatePcn874(swap(base, 119, '-'));
    expect(errors(result)).toEqual([]);
  });

  it('warns, but does not fail, when a reserved field is non-zero', () => {
    const result = validatePcn874(swap(base, 48, '00000000001'));
    const finding = find(result, 'header.differentRateSalesAmount.reserved');
    expect(finding.severity).toBe('warning');
    expect(finding.officialText).toContain('Currently zeros – for future use');
    expect(result.valid).toBe(true);
  });
});

/**
 * One test per disagreement the old SPEC-FROM-SOURCES.md recorded, asserting the
 * behaviour the official document settled it to. The section numbers are the old
 * file's, kept so the history stays checkable — see docs/SPEC.md §6.
 */
describe('the recorded disagreements, as the Tax Authority document settles them', () => {
  it('§6.1 reportedVat is 11 digits, so the header is 131 — not linet3\'s 129', () => {
    const header = fixture('valid-minimal.txt').split('\n')[0]!;
    expect(header).toHaveLength(131);
    const parsed = parsePcn874(fixture('valid-minimal.txt'));
    expect(parsed.records[0]!.fields['reportedVat']).toHaveLength(11);
    // A 129-character header (linet3's reading) must be rejected.
    const short = header.slice(0, 119) + header.slice(121);
    const result = validatePcn874([short, ...fixture('valid-minimal.txt').split('\n').slice(1)].join('\n'));
    expect(rules(result)).toContain('header.length');
    expect(find(result, 'header.length').message).toContain('found 129');
  });

  it('§6.2 the last 9 characters accept both zeros and a real allocation number', () => {
    const lines = fixture('valid-minimal.txt').split('\n');
    const withAllocation = lines[1]!; // already carries 123456789
    expect(withAllocation.slice(51)).toBe('123456789');
    expect(validatePcn874(fixture('valid-minimal.txt')).valid).toBe(true);

    const zeroed = withAllocation.slice(0, 51) + '000000000';
    const result = validatePcn874([lines[0], zeroed, lines[2]].join('\n'));
    expect(result.valid).toBe(true);
    expect(result.findings.filter(f => f.field === 'allocationNumber')).toEqual([]);
  });

  it('§6.3 zeroOrExemptSalesAmount is an amount: it has its own sign field', () => {
    const parsed = parsePcn874(fixture('valid-mixed.txt'));
    const header = parsed.records[0]!;
    expect(header.fields['zeroOrExemptSalesAmountSign']).toBe('+');
    expect(header.fields['zeroOrExemptSalesAmount']).toBe('00000005000');
    // 5000 shekels of zero-rated sales with one Y record: an amount, not a count.
    expect(validatePcn874(fixture('valid-mixed.txt')).valid).toBe(true);
  });

  it('§6.4 all six input letters count toward inputsCount, and a mismatch is now an error', () => {
    const result = validatePcn874(fixture('invalid-counts.txt'));
    expect(result.valid).toBe(false);
    const inputs = find(result, 'totals.inputsCount');
    expect(inputs.severity).toBe('error');
    expect(inputs.basis).toBe('official');
    expect(inputs.message).toContain('C, H, K, P, R, T');
    expect(inputs.officialText).toContain('rcbuilder counts only T records');

    const sales = find(result, 'totals.salesRecordCount');
    expect(sales.severity).toBe('error');
    expect(sales.message).toContain('I, L, M, S, Y');
  });

  it('§6.4 a K, R, P, H or C record counts as an input', () => {
    const [header, , footer] = fixture('valid-minimal.txt').split('\n');
    const zeroCountHeader = header.slice(0, 69) + '000000000' + header.slice(78, 110) + '000000005' + header.slice(119);
    expect(zeroCountHeader).toHaveLength(131);
    const inputs = ['K', 'R', 'P', 'H', 'C'].map(
      t => t + '000000000' + '20260115' + '0000' + '000000001' + '000000100' + '+' + '0000000500' + '000000000',
    );
    const result = validatePcn874([zeroCountHeader, ...inputs, footer].join('\n'));
    expect(rules(result)).not.toContain('totals.inputsCount');
  });

  it('§6.5 the closing entry is "X"; "Z" is rejected with Appendix B named', () => {
    expect(validatePcn874(fixture('invalid-footer-z.txt')).valid).toBe(false);
    expect(validatePcn874(fixture('valid-minimal.txt')).valid).toBe(true);
  });

  it('§6.6 line endings and a detail-free file stay open, so both stay warnings', () => {
    expect(validatePcn874(fixture('valid-crlf.txt')).valid).toBe(true);
    const cr = validatePcn874(fixture('valid-minimal.txt').replace(/\n/g, '\r'));
    expect(cr.valid).toBe(true);
    const trailing = validatePcn874(`${fixture('valid-minimal.txt')}\n`);
    expect(trailing.valid).toBe(true);
    expect(validatePcn874(fixture('valid-no-details.txt')).valid).toBe(true);
  });

  it('§6.7 implements no reportedVat arithmetic check — the document never gives a formula', () => {
    // valid-minimal declares +1800 to pay against one sale of 1800 VAT and no
    // inputs; change it to a number that fits no formula and nothing is reported.
    const base = fixture('valid-minimal.txt');
    const tampered = base.slice(0, 120) + '00000009999' + base.slice(131);
    const result = validatePcn874(tampered);
    expect(rules(result).some(r => r.startsWith('totals.reportedVat'))).toBe(false);
    expect(result.valid).toBe(true);
  });

  it('§6.8 a zero amount must carry "+", and "-" on it is an error in the header', () => {
    const result = validatePcn874(fixture('invalid-sign-of-zero.txt'));
    expect(result.valid).toBe(false);
    const finding = find(result, 'header.equipmentInputsVatSign.signOfZero');
    expect(finding.severity).toBe('error');
    expect(finding.basis).toBe('official');
    expect(finding.officialText).toContain('will be "+"');
    expect(finding.message).toContain('equipmentInputsVat');
    // The header carries exactly one amount per sign, so line 174 is unambiguous
    // there. It no longer claims Appendix C §2 restates it — see §6.8.
    expect(finding.officialText).not.toContain('523-535');
    expect(finding.sources).not.toContain(
      'ita:research/rendered/pcn874-gov-il-874-eng.txt:523-535',
    );
  });

  it('§6.8 in a transaction record the error needs BOTH amounts zero', () => {
    const [header, detail, footer] = fixture('valid-minimal.txt').split('\n');
    // invoice total of zero, signed "-", VAT also zeroed: the one case where the
    // two readings of line 174 agree, so it is still an error.
    const bothZero = detail!.slice(0, 31) + '000000000' + '-' + '0000000000' + detail!.slice(51);
    expect(bothZero).toHaveLength(60);
    const result = validatePcn874([header, bothZero, footer].join('\n'));
    const finding = find(result, 'detail.invoiceSumSign.signOfZero');
    expect(finding.severity).toBe('error');
    expect(finding.message).toContain('Both amount fields');
  });

  it('§6.8 a VAT-only credit is a WARNING: one sign, two amounts, no rule for which', () => {
    const result = validatePcn874(fixture('warnings-vat-only-credit.txt'));
    const finding = find(result, 'detail.invoiceSumSign.signOfZero');
    expect(finding.severity).toBe('warning');
    expect(finding.openQuestion).toMatch(/one "\+\/-" field/);
    expect(finding.openQuestion).toMatch(/BOTH are zero/);
    expect(result.valid).toBe(true);
  });

  it('§6.9 the reference group takes letters: A(4), which all three implementations get wrong', () => {
    const result = validatePcn874(fixture('valid-refgroup-alpha.txt'));
    expect(result.valid).toBe(true);
    expect(result.findings).toEqual([]);
    expect(parsePcn874(fixture('valid-refgroup-alpha.txt')).records[1]!.fields['refGroup']).toBe(
      'BR2A',
    );
  });

  it('§6.9 lowercase and zero-padded letters pass with no finding at all', () => {
    for (const name of ['valid-refgroup-lowercase.txt', 'valid-refgroup-zeropad.txt']) {
      expect(validatePcn874(fixture(name)).findings, name).toEqual([]);
    }
    expect(parsePcn874(fixture('valid-refgroup-lowercase.txt')).records[1]!.fields['refGroup']).toBe(
      'br2a',
    );
    expect(parsePcn874(fixture('valid-refgroup-zeropad.txt')).records[1]!.fields['refGroup']).toBe(
      '00AB',
    );
  });

  it('§6.9 a reference group with punctuation is a WARNING, not an error', () => {
    const [header, detail, footer] = fixture('valid-minimal.txt').split('\n');
    const bad = detail!.slice(0, 18) + 'a-1!' + detail!.slice(22);
    const result = validatePcn874([header, bad, footer].join('\n'));
    const finding = find(result, 'detail.refGroup.alphanumeric');
    // The document types the field A(4) and never says which characters an A(n)
    // field admits. Rejecting "A/01" as an error claimed the circular forbids
    // punctuation; it does not mention punctuation at all.
    expect(finding.severity).toBe('warning');
    expect(finding.message).toContain('A(4)');
    expect(finding.openQuestion).toMatch(/internal characters of the submitter/);
    expect(result.valid).toBe(true);
  });

  it('§6.10 the entry type is one character; S covers taxable and zero-rated alike', () => {
    const [header, detail, footer] = fixture('valid-minimal.txt').split('\n');
    // the same S record with zeros VAT is the zero-rated variant, equally legal
    const zeroRated = detail!.slice(0, 31) + '000000000' + detail!.slice(40);
    expect(zeroRated).toHaveLength(60);
    const result = validatePcn874([header, zeroRated, footer].join('\n'));
    expect(errors(result)).toEqual([]);
  });
});

describe('per-entry-type constraints from Appendix C', () => {
  it('an L record carrying a customer VAT id is an ERROR now, not a warning', () => {
    const result = validatePcn874(fixture('invalid-detail-semantics.txt'));
    const finding = find(result, 'detail.L.vatIdZeros');
    expect(finding.severity).toBe('error');
    expect(finding.basis).toBe('official');
    expect(finding.officialText).toContain('Private Customer');
    expect(result.valid).toBe(false);
  });

  it('a Y (export) record carrying VAT is an ERROR now, not a warning', () => {
    const result = validatePcn874(fixture('invalid-detail-semantics.txt'));
    const finding = find(result, 'detail.Y.vatZeros');
    expect(finding.severity).toBe('error');
    expect(finding.officialText).toContain('The sum of the VAT will include zeros');
  });

  it('a K record with a customer VAT id is an error', () => {
    const [header, , footer] = fixture('valid-minimal.txt').split('\n');
    const noSales = header!.slice(0, 69) + '000000000' + header!.slice(78, 110) + '000000001' + header!.slice(119);
    const k =
      'K' + '512345678' + '20260131' + '0000' + '000000007' + '000000126' + '+' + '0000000700' + '000000000';
    const result = validatePcn874([noSales, k, footer].join('\n'));
    expect(find(result, 'detail.K.vatIdZeros').severity).toBe('error');
  });

  it('a K record with a zero invoice count stays a WARNING: the document never forbids it', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    const finding = find(result, 'detail.K.refNumberInvoiceCount');
    expect(finding.severity).toBe('warning');
    expect(finding.basis).toBe('official');
    expect(finding.officialText).toContain('No. of Invoices');
  });

  it('an R record carrying a reference number stays a WARNING: the document contradicts itself', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    const finding = find(result, 'detail.R.refNumberZeros');
    expect(finding.severity).toBe('warning');
    // §5.4: Appendix C's R row says Zeros; note D on the same row says otherwise.
    expect(finding.openQuestion).toMatch(/comment marker "D"/);
  });

  it('an S record of ₪4,000 with no customer number is a warning: note A allows aggregation there', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    const finding = find(result, 'detail.S.counterpartyExpected');
    expect(finding.severity).toBe('warning');
    expect(finding.officialText).toContain('5,000 NIS');
    expect(finding.message).toContain('4000 shekels');
  });

  it('an S record of ₪100,000 with no customer number is an ERROR: note A calls it obligatory', () => {
    const result = validatePcn874(fixture('invalid-s-large-unidentified.txt'));
    const finding = find(result, 'detail.S.counterpartyExpected');
    expect(finding.severity).toBe('error');
    expect(finding.basis).toBe('official');
    expect(finding.message).toContain('100000 shekels');
    expect(finding.officialText).toContain('it is obligatory to state the customer');
    // The document's own caveat on its own figure travels with the finding.
    expect(finding.officialText).toContain('Parameter values may change from time to time');
    expect(finding.openQuestion).toMatch(/586-588/);
    expect(result.valid).toBe(false);
  });

  it('does not flag a compliant S, L, Y, T, K or R record', () => {
    expect(validatePcn874(fixture('valid-mixed.txt')).findings).toEqual([]);
  });

  it('warnings-only.txt is exactly four warnings and no errors', () => {
    const result = validatePcn874(fixture('warnings-only.txt'));
    expect(result.valid).toBe(true);
    expect(result.counts).toEqual({ error: 0, warning: 4, info: 0 });
  });
});

/**
 * The counter-party rows of Appendix C that had no rule at all.
 *
 * Before this the validator said nothing about a `T`, `M`, `C`, `P`, `I` or `H`
 * record whose counter-party field was zeros, while the same omission on `S` got
 * a warning — so a file breaking a stated Appendix C cell came back
 * "VALID — 0 error(s), 0 warning(s)". The circular treats the rows alike.
 */
describe('the counter-party rows Appendix C names', () => {
  it('a T input with a zeros supplier is an error, on the same authority as L and K', () => {
    const result = validatePcn874(fixture('invalid-input-counterparty.txt'));
    const finding = find(result, 'detail.T.counterpartyExpected');
    expect(finding.severity).toBe('error');
    expect(finding.basis).toBe('official');
    expect(finding.officialText).toContain('All fields are compulsory');
    expect(finding.officialText).toContain('"IN"-"regular" from Israeli Supplier');
    expect(result.valid).toBe(false);
  });

  it('M, I, C and P are errors too, and M quotes note C for why a sale carries a supplier', () => {
    const result = validatePcn874(fixture('invalid-self-invoice-counterparty.txt'));
    expect(result.counts).toEqual({ error: 4, warning: 0, info: 0 });
    for (const letter of ['M', 'I', 'C', 'P']) {
      const finding = find(result, `detail.${letter}.counterpartyExpected`);
      expect(finding.severity, letter).toBe('error');
      expect(finding.basis, letter).toBe('official');
    }
    const m = find(result, 'detail.M.counterpartyExpected');
    expect(m.officialText).toContain(
      'the supplier number will be entered in the place of the counter party file number',
    );
  });

  it('H is a WARNING and not an error, because its own note defers to Sha\'am guidelines', () => {
    const result = validatePcn874(fixture('warnings-h-counterparty.txt'));
    const finding = find(result, 'detail.H.counterpartyExpected');
    expect(finding.severity).toBe('warning');
    expect(finding.officialText).toContain('in accordance with "Sha\'am" guidelines');
    expect(finding.openQuestion).toMatch(/not in the circular and not in either vendor manual/);
    expect(result.valid).toBe(true);
  });

  it('says nothing about L, K, Y or R, whose cells are not a counter-party number', () => {
    // L and K are "Zeros" by their own rules; Y's cell is an export entry number
    // (or 999999999) and R's an import entry number, neither of which is a VAT
    // identification number, and note D lets Y's be zeros for a service.
    const result = validatePcn874(fixture('valid-mixed.txt'));
    for (const letter of ['L', 'K', 'Y', 'R']) {
      expect(rules(result), letter).not.toContain(`detail.${letter}.counterpartyExpected`);
    }
  });

  it('a compliant counter-party number produces no finding on any of the six', () => {
    const [header, , footer] = fixture('valid-minimal.txt').split('\n');
    const zeroCounts =
      header!.slice(0, 69) + '000000003' + header!.slice(78, 110) + '000000003' + header!.slice(119);
    const records = ['M', 'I', 'T', 'C', 'P', 'H'].map(
      t =>
        t +
        '513333333' +
        '20260115' +
        '0000' +
        '000000001' +
        '000000100' +
        '+' +
        '0000000500' +
        '000000000',
    );
    const result = validatePcn874([zeroCounts, ...records, footer].join('\n'));
    expect(rules(result).filter(r => r.endsWith('.counterpartyExpected'))).toEqual([]);
  });
});

/**
 * Note E's cap on petty cash — the fourth file the refuter built that the
 * validator accepted with no finding at all.
 */
describe("note E's petty-cash cap", () => {
  it('warns when the K records carry more VAT than 2% of the file or ₪2,000, whichever is greater', () => {
    const result = validatePcn874(fixture('warnings-petty-cash-cap.txt'));
    const finding = find(result, 'totals.pettyCashCap');
    expect(finding.severity).toBe('warning');
    expect(finding.basis).toBe('official');
    expect(finding.officialText).toContain('less than 2% of the total VAT');
    // ₪5,000 of petty-cash VAT in a file whose transaction VAT totals ₪6,800.
    expect(finding.message).toContain('5000 shekels');
    expect(finding.message).toContain('2000.00');
    expect(result.valid).toBe(true);
  });

  it('is a warning, not an error, and says why: the base and the figures both move', () => {
    const finding = find(validatePcn874(fixture('warnings-petty-cash-cap.txt')), 'totals.pettyCashCap');
    expect(finding.openQuestion).toMatch(/the file's entries/);
    expect(finding.openQuestion).toMatch(/may change from time to time/);
    // The Rivhit manual's ₪300 per-invoice cap is recorded as vendor-only and no
    // rule is built on it.
    expect(finding.openQuestion).toMatch(/rivhit lines 318-319/);
  });

  it('says nothing when the petty cash is inside the cap, and nothing when there is none', () => {
    expect(rules(validatePcn874(fixture('valid-mixed.txt')))).not.toContain('totals.pettyCashCap');
    expect(rules(validatePcn874(fixture('warnings-only.txt')))).not.toContain('totals.pettyCashCap');
    expect(rules(validatePcn874(fixture('valid-minimal.txt')))).not.toContain('totals.pettyCashCap');
  });
});

describe('every finding is traceable', () => {
  const allFixtures = [
    'valid-minimal.txt',
    'valid-mixed.txt',
    'valid-no-details.txt',
    'valid-crlf.txt',
    'valid-refgroup-alpha.txt',
    'valid-refgroup-lowercase.txt',
    'valid-refgroup-zeropad.txt',
    'warnings-only.txt',
    'warnings-footer-dealer.txt',
    'warnings-refgroup-punctuation.txt',
    'warnings-refgroup-hebrew.txt',
    'warnings-vat-only-credit.txt',
    'warnings-petty-cash-cap.txt',
    'warnings-h-counterparty.txt',
    'invalid-header-length.txt',
    'invalid-header-digits.txt',
    'invalid-detail-length.txt',
    'invalid-record-type.txt',
    'invalid-footer-z.txt',
    'invalid-sign-of-zero.txt',
    'invalid-counts.txt',
    'invalid-detail-semantics.txt',
    'invalid-representative-file.txt',
    'invalid-input-counterparty.txt',
    'invalid-self-invoice-counterparty.txt',
    'invalid-s-large-unidentified.txt',
  ];

  it('covers every file in tests/fixtures/, so a new fixture cannot escape these checks', () => {
    const onDisk = readdirSync(join(here, 'fixtures'))
      .filter(n => n.endsWith('.txt'))
      .sort();
    expect(onDisk).toEqual([...allFixtures].sort());
  });

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
      expect(['official', 'vendor-manual', 'oss-only']).toContain(finding.basis);
    }
  });

  it.each(allFixtures)('%s: every ERROR is backed by the Tax Authority document', name => {
    for (const finding of validatePcn874(fixture(name)).findings) {
      if (finding.severity !== 'error') continue;
      expect(finding.basis, `${finding.rule} is an error on non-official authority`).toBe('official');
      expect(finding.officialText, `${finding.rule} quotes nothing`).toBeTruthy();
      expect(finding.sources.some(s => kindOf(s) === 'official')).toBe(true);
    }
  });

  /**
   * The test above used to be the whole of this claim, and it was not enough.
   * `research/colony-sweep/audits/pcn874-reconciliation.md` §3 found three rules
   * that were errors on lines which do not state them — `file.encoding.ascii`,
   * `header.generationDate.calendar` and `footer.licensedDealerId.matchesHeader`
   * — and all three passed, because "an `ita:` citation exists" is not "the
   * cited line says this". So: read the cited lines out of the extracted
   * circular and require the finding's quote and those lines to share four
   * consecutive words. It cannot prove the rule follows from the document, but
   * it does catch a quote that has drifted from the line it names, which is the
   * defect that actually occurred, three times.
   */
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

  /** The text of the lines a citation like `ita:…:94-126` or `…:114,124` names. */
  const citedText = (citation: string): string => {
    const ref = citation.slice(citation.lastIndexOf(':') + 1);
    const out: string[] = [];
    for (const chunk of ref.split(',')) {
      const [from, to] = chunk.split('-').map(Number);
      expect(Number.isInteger(from), `bad line reference ${citation}`).toBe(true);
      expect(from, `${citation} points before line 1`).toBeGreaterThan(0);
      expect(to ?? from, `${citation} points past the end of the document`).toBeLessThanOrEqual(
        officialLines.length,
      );
      for (let n = from!; n <= (to ?? from!); n++) out.push(officialLines[n - 1] ?? '');
    }
    return out.join(' ');
  };

  it.each(allFixtures)('%s: every ERROR quotes a line that really says it', name => {
    for (const finding of validatePcn874(fixture(name)).findings) {
      if (finding.severity !== 'error') continue;
      const official = finding.sources.filter(s => kindOf(s) === 'official');
      const cited = official.map(citedText).join(' ');
      const inCited = wordRuns(cited);
      const shared = [...wordRuns(finding.officialText!)].filter(run => inCited.has(run));
      expect(
        shared.length,
        `${finding.rule}: its officialText and the lines it cites (${official.join(', ')}) share no ` +
          `run of ${RUN} words, so the quote does not come from the cited lines.\n` +
          `quote: ${finding.officialText}\ncited: ${cited.slice(0, 900)}`,
      ).toBeGreaterThan(0);
    }
  });

  it('the strengthened check would have caught the three rules the refuter found', () => {
    // A rule whose quote does not appear at the lines it cites must fail, or the
    // test above is decoration. Build one and prove the machinery rejects it.
    const inCited = wordRuns(citedText('ita:x:174'));
    const honest = [...wordRuns('In a "+/-" field: When the amount field is zero')].filter(r =>
      inCited.has(r),
    );
    expect(honest.length).toBeGreaterThan(0);
    const invented = [...wordRuns('the closing entry repeats the header dealer identification')].filter(
      r => inCited.has(r),
    );
    expect(invented).toEqual([]);
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
