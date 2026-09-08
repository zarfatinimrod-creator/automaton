#!/usr/bin/env node
/**
 * Regenerate tests/fixtures/*.txt.
 *
 * THIS IS NOT A PCN874 GENERATOR AND MUST NOT BE USED TO PRODUCE A FILING.
 * It exists so the test fixtures are demonstrably built from the layout table in
 * docs/SPEC.md — which is now the Tax Authority's Appendix A — rather than
 * copied from a source repository. Two of the three corroborating repositories
 * (linet3, AGPL-3.0; rcbuilder, no licence at all) do not permit copying their
 * code or their sample files, and the Authority's document is a government
 * publication we cite rather than redistribute. Every digit below is invented.
 *
 * Run:  node scripts/make-fixtures.mjs
 * The generated files are committed; this script only has to be re-run when a
 * fixture changes.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, '..', 'tests', 'fixtures');

const d = (value, width) => String(Math.abs(Math.round(value))).padStart(width, '0').slice(-width);
const s = value => (value >= 0 ? '+' : '-');
const signed = (value, width) => s(value) + d(value, width);

/** Build a 131-character header record from the field table (Appendix A). */
function header({
  dealerId = '514457282',
  reportMonth = '202601',
  generationDate = '20260210',
  taxableSalesAmount = 0,
  taxableSalesVat = 0,
  differentRateSalesAmount = 0,
  differentRateSalesVat = 0,
  salesRecordCount = 0,
  zeroOrExemptSalesAmount = 0,
  otherInputsVat = 0,
  equipmentInputsVat = 0,
  equipmentInputsVatSign = null,
  inputsCount = 0,
  reportedVat = 0,
} = {}) {
  const equipment =
    (equipmentInputsVatSign ?? s(equipmentInputsVat)) + d(equipmentInputsVat, 9);
  return (
    'O' +
    dealerId +
    reportMonth +
    '1' +
    generationDate +
    signed(taxableSalesAmount, 11) +
    signed(taxableSalesVat, 9) +
    signed(differentRateSalesAmount, 11) +
    signed(differentRateSalesVat, 9) +
    d(salesRecordCount, 9) +
    signed(zeroOrExemptSalesAmount, 11) +
    signed(otherInputsVat, 9) +
    equipment +
    d(inputsCount, 9) +
    signed(reportedVat, 11)
  );
}

/** Build a 60-character transaction record from the field table (Appendix A). */
function detail({
  type,
  vatId = '000000000',
  invoiceDate = '20260115',
  refGroup = '0000',
  refNumber = '000000000',
  totalVat = 0,
  invoiceSum = 0,
  // Forces the "+/-" character independently of the amount, so a fixture can
  // carry "-" on an invoice total of zero — the case official line 174 is about.
  invoiceSumSign = null,
  allocationNumber = '000000000',
}) {
  return (
    type +
    vatId +
    invoiceDate +
    refGroup +
    refNumber +
    d(totalVat, 9) +
    (invoiceSumSign ?? s(invoiceSum)) +
    d(invoiceSum, 10) +
    allocationNumber
  );
}

const footer = (dealerId = '514457282', letter = 'X') => letter + dealerId;

const file = (lines, { eol = '\n', trailing = false } = {}) =>
  lines.join(eol) + (trailing ? eol : '');

const DEALER = '514457282';

// --- the fixtures ---------------------------------------------------------

const validMinimalDetails = [
  detail({
    type: 'S',
    vatId: '512345678',
    invoiceDate: '20260112',
    refGroup: '0001',
    refNumber: '000000101',
    totalVat: 1800,
    invoiceSum: 10_000,
    allocationNumber: '123456789',
  }),
];
const validMinimal = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    salesRecordCount: 1,
    inputsCount: 0,
    reportedVat: 1800,
  }),
  ...validMinimalDetails,
  footer(DEALER),
]);

const mixedDetails = [
  detail({
    type: 'S',
    vatId: '512345678',
    invoiceDate: '20260112',
    refGroup: '0001',
    refNumber: '000000101',
    totalVat: 1800,
    invoiceSum: 10_000,
    allocationNumber: '123456789',
  }),
  // credit note: negative document total, sign carried in its own field
  detail({
    type: 'S',
    vatId: '512345678',
    invoiceDate: '20260118',
    refGroup: '0001',
    refNumber: '000000102',
    totalVat: 180,
    invoiceSum: -1000,
    allocationNumber: '123456790',
  }),
  detail({
    type: 'L',
    invoiceDate: '20260120',
    refGroup: '0000',
    refNumber: '000000103',
    totalVat: 360,
    invoiceSum: 2000,
  }),
  detail({
    type: 'Y',
    vatId: '999999999',
    invoiceDate: '20260121',
    refGroup: '0000',
    refNumber: '000000104',
    totalVat: 0,
    invoiceSum: 5000,
  }),
  detail({
    type: 'T',
    vatId: '513333333',
    invoiceDate: '20251230',
    refGroup: '0000',
    refNumber: '000000301',
    totalVat: 900,
    invoiceSum: 5000,
  }),
  detail({
    type: 'K',
    invoiceDate: '20260131',
    refGroup: '0000',
    refNumber: '000000007',
    totalVat: 126,
    invoiceSum: 700,
  }),
  detail({
    type: 'R',
    vatId: '514444444',
    invoiceDate: '20260105',
    refGroup: '0000',
    refNumber: '000000000',
    totalVat: 2700,
    invoiceSum: 15_000,
  }),
];
const validMixed = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 9000,
    taxableSalesVat: 1980,
    salesRecordCount: 4,
    zeroOrExemptSalesAmount: 5000,
    otherInputsVat: 3726,
    equipmentInputsVat: 0,
    inputsCount: 3,
    reportedVat: -1746,
  }),
  ...mixedDetails,
  footer(DEALER),
]);

const validNoDetails = file([header({ dealerId: DEALER }), footer(DEALER)]);

const validCrlf = file([...validMinimal.split('\n')], { eol: '\r\n', trailing: true });

// valid: the reference group carries letters. Appendix A types it A(4) — "zero
// values or internal characters of the submitter (series/branch etc.)" — while
// all three open-source implementations write digits only. A validator that
// rejected this would reject a legal file.
const validRefGroupAlpha = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    salesRecordCount: 1,
    reportedVat: 1800,
  }),
  detail({
    type: 'S',
    vatId: '512345678',
    invoiceDate: '20260112',
    refGroup: 'BR2A',
    refNumber: '000000101',
    totalVat: 1800,
    invoiceSum: 10_000,
    allocationNumber: '123456789',
  }),
  footer(DEALER),
]);

// invalid: header one character short
const shortHeader = header({ dealerId: DEALER, salesRecordCount: 1 }).slice(0, 130);
const invalidHeaderLength = file([shortHeader, ...validMinimalDetails, footer(DEALER)]);

// invalid: the closing entry carries "Z", which belongs to Appendix B's
// representative alignment file, not to an individual merchant's report
const invalidFooterZ = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    salesRecordCount: 1,
    reportedVat: 1800,
  }),
  ...validMinimalDetails,
  footer(DEALER, 'Z'),
]);

// invalid: a transaction record with a letter the Table of Values does not have
const invalidRecordType = file([
  header({ dealerId: DEALER, salesRecordCount: 0 }),
  'Q' + validMinimalDetails[0].slice(1),
  footer(DEALER),
]);

// invalid: transaction record two characters short
const invalidDetailLength = file([
  header({
    dealerId: DEALER,
    salesRecordCount: 1,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
  }),
  validMinimalDetails[0].slice(0, 58),
  footer(DEALER),
]);

// warning only: closing-entry dealer id differs from the header's. Appendix A
// is headed "Individual Merchant", where the two are the same number, but the
// document calls one the CUSTOMER's (line 101) and the other the SUBMITTER's
// (lines 159-161) and never states they are equal. Reported, not rejected.
const warningsFooterDealer = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    salesRecordCount: 1,
    reportedVat: 1800,
  }),
  ...validMinimalDetails,
  footer('999888777'),
]);

// invalid: a letter where digits belong (dealer id). The corrupted id also makes
// the closing entry disagree with the header, which is a second, honest error.
const invalidHeaderDigits = file([
  'O' +
    '51445728A' +
    header({
      dealerId: DEALER,
      taxableSalesAmount: 10_000,
      taxableSalesVat: 1800,
      salesRecordCount: 1,
      reportedVat: 1800,
    }).slice(10),
  ...validMinimalDetails,
  footer(DEALER),
]);

// invalid: a "+/-" field carrying "-" on an amount of zero. Official line 174:
// "When the amount field is zero, the value of the '+/-' field will be '+'."
const invalidSignOfZero = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    salesRecordCount: 1,
    equipmentInputsVat: 0,
    equipmentInputsVatSign: '-',
    reportedVat: 1800,
  }),
  ...validMinimalDetails,
  footer(DEALER),
]);

// invalid: the header's declared record counts disagree with the records
const invalidCounts = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    salesRecordCount: 9,
    otherInputsVat: 900,
    inputsCount: 9,
    reportedVat: 900,
  }),
  ...validMinimalDetails,
  detail({
    type: 'T',
    vatId: '513333333',
    invoiceDate: '20251230',
    refGroup: '0000',
    refNumber: '000000301',
    totalVat: 900,
    invoiceSum: 5000,
  }),
  footer(DEALER),
]);

// invalid: two things Appendix C states flatly — L must carry a zeros
// counter-party id, and Y (export) must carry zeros VAT
const invalidDetailSemantics = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 2000,
    taxableSalesVat: 360,
    salesRecordCount: 2,
    zeroOrExemptSalesAmount: 5000,
    reportedVat: 360,
  }),
  detail({
    type: 'L',
    vatId: '512345678',
    invoiceDate: '20260120',
    refGroup: '0000',
    refNumber: '000000103',
    totalVat: 360,
    invoiceSum: 2000,
  }),
  detail({
    type: 'Y',
    vatId: '999999999',
    invoiceDate: '20260121',
    refGroup: '0000',
    refNumber: '000000104',
    totalVat: 900,
    invoiceSum: 5000,
  }),
  footer(DEALER),
]);

// invalid here, but a real file elsewhere: Appendix B's alignment file for a
// representative reporting for several users. "A" initial entry, then the
// per-user reports, then a "Z" summary entry of users and entries. This
// validator checks the individual merchant file of Appendix A only, and should
// say which file this is rather than "unknown record type".
const invalidRepresentativeFile = file([
  'A' + DEALER + '202601',
  header({
    dealerId: '512345678',
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    salesRecordCount: 1,
    reportedVat: 1800,
  }),
  ...validMinimalDetails,
  footer('512345678'),
  'Z' + '000000001' + '000000003',
]);

// warnings only: a reserved header field carries a value, an S record of ₪4,000
// has no customer number, a K record's invoice count is zero, and an R record
// carries a reference number. All four are places the document describes a field
// without forbidding the value, so `valid` stays true. The S sale is deliberately
// UNDER note A's ₪5,000 (official lines 537-542), which is where identification
// is "optional" and the sale may be aggregated instead; above that figure the
// same omission is an error — see invalid-s-large-unidentified.txt.
const warningsOnly = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 4000,
    taxableSalesVat: 720,
    differentRateSalesAmount: 1,
    salesRecordCount: 1,
    otherInputsVat: 2826,
    inputsCount: 2,
    reportedVat: -2106,
  }),
  detail({
    type: 'S',
    vatId: '000000000',
    invoiceDate: '20260112',
    refGroup: '0001',
    refNumber: '000000101',
    totalVat: 720,
    invoiceSum: 4000,
  }),
  detail({
    type: 'K',
    invoiceDate: '20260131',
    refGroup: '0000',
    refNumber: '000000000',
    totalVat: 126,
    invoiceSum: 700,
  }),
  detail({
    type: 'R',
    vatId: '514444444',
    invoiceDate: '20260105',
    refGroup: '0000',
    refNumber: '000000555',
    totalVat: 2700,
    invoiceSum: 15_000,
  }),
  footer(DEALER),
]);

// --- the refuter's constructed files --------------------------------------
//
// research/colony-sweep/audits/pcn874-reconciliation.md §4 built nine files by
// hand and ran the validator on them. Four legal files were rejected and four
// illegal ones accepted. Each is reproduced here so the classification is a
// test rather than a claim; the ids in the comments are that report's.

const standardSale = ({ refGroup = '0001' } = {}) =>
  detail({
    type: 'S',
    vatId: '512345678',
    invoiceDate: '20260112',
    refGroup,
    refNumber: '000000101',
    totalVat: 1800,
    invoiceSum: 10_000,
    allocationNumber: '123456789',
  });

const oneSaleHeader = () =>
  header({
    dealerId: DEALER,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    salesRecordCount: 1,
    reportedVat: 1800,
  });

// a2 — valid: a lowercase reference group. Appendix A types the field A(4)
// (line 139) and calls its content "internal characters of the submitter"
// (lines 580-581); nothing anywhere restricts the case of an A(n) field.
const validRefGroupLowercase = file([oneSaleHeader(), standardSale({ refGroup: 'br2a' }), footer(DEALER)]);

// c2 — valid: letters padded with leading zeros, the shape the "preliminary
// zeros" instruction (lines 41-42) produces on a two-character series.
const validRefGroupZeroPadded = file([oneSaleHeader(), standardSale({ refGroup: '00AB' }), footer(DEALER)]);

// a4 — warning: a series written "A/01". Punctuation inside A(4) is neither
// permitted nor forbidden by any rendered line, so it is reported, not rejected.
const warningsRefGroupPunctuation = file([
  oneSaleHeader(),
  standardSale({ refGroup: 'A/01' }),
  footer(DEALER),
]);

// d — warnings: Hebrew letters in a Hebrew filer's series code. Two findings,
// both open questions: the file's encoding and the alphabet of A(n). The
// document declares neither. (In UTF-8 this line is 62 bytes and 60 characters;
// the validator measures characters, as Appendix A counts them.)
const warningsRefGroupHebrew = file([
  oneSaleHeader(),
  standardSale({ refGroup: 'אב01' }),
  footer(DEALER),
]);

// a3 — warning: a VAT-only credit. The invoice total is zero and carries "-",
// but the VAT is 180. Line 174 says "the amount field" is zero, singular; a
// transaction record has two amounts and one sign, and nothing says which one
// line 174 means. Only a record with BOTH amounts zero is an error.
const warningsVatOnlyCredit = file([
  header({
    dealerId: DEALER,
    taxableSalesVat: 180,
    salesRecordCount: 1,
    reportedVat: 180,
  }),
  detail({
    type: 'S',
    vatId: '512345678',
    invoiceDate: '20260118',
    refGroup: '0001',
    refNumber: '000000102',
    totalVat: 180,
    invoiceSum: 0,
    invoiceSumSign: '-',
    allocationNumber: '123456790',
  }),
  footer(DEALER),
]);

// b3 — warning: petty cash over note E's cap. ₪5,000 of K VAT in a file whose
// transaction VAT totals ₪6,800; note E allows "less than 2% … or 2,000 NIS
// (the greater of them)" (lines 566-568), and 2% of 6,800 is 136.
const warningsPettyCashCap = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    salesRecordCount: 1,
    otherInputsVat: 5000,
    inputsCount: 1,
    reportedVat: -3200,
  }),
  standardSale(),
  detail({
    type: 'K',
    invoiceDate: '20260131',
    refGroup: '0000',
    refNumber: '000000003',
    totalVat: 5000,
    invoiceSum: 27_778,
  }),
  footer(DEALER),
]);

// warning: an H record with a zeros counter party. Appendix C gives the H row's
// counter party as "Supplier" (line 501) under "All fields are compulsory"
// (line 224), but the row's comment marker is F, and note F sends the counter
// file number to "Sha'am" guidelines nobody here has rendered (line 574). A
// warning is the ceiling this row supports — the other five input/sale rows are
// errors.
const warningsHCounterparty = file([
  header({
    dealerId: DEALER,
    otherInputsVat: 1800,
    inputsCount: 1,
    reportedVat: -1800,
  }),
  detail({
    type: 'H',
    invoiceDate: '20260114',
    refGroup: '0000',
    refNumber: '000000201',
    totalVat: 1800,
    invoiceSum: 10_000,
  }),
  footer(DEALER),
]);

// b1 — invalid: a "T" input with a zeros counter party. Appendix C's T row gives
// it as "Supplier" (line 400) under "All fields are compulsory" (line 224), and
// no note offers aggregation as a way out.
const invalidInputCounterparty = file([
  header({
    dealerId: DEALER,
    otherInputsVat: 900,
    inputsCount: 1,
    reportedVat: -900,
  }),
  detail({
    type: 'T',
    invoiceDate: '20251230',
    refGroup: '0000',
    refNumber: '000000301',
    totalVat: 900,
    invoiceSum: 5000,
  }),
  footer(DEALER),
]);

// b4 — invalid: the four remaining rows whose counter-party cell names a party,
// all with zeros. M (line 339) and I (line 381) are sales, C (line 419) and P
// (line 482) inputs. Note C states outright that a self-invoice sale carries the
// SUPPLIER's number "in the place of the counter party file number" (lines
// 556-557), so "there is no customer" is not a reason for zeros on M.
const invalidSelfInvoiceCounterparty = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 20_000,
    taxableSalesVat: 3600,
    salesRecordCount: 2,
    otherInputsVat: 3600,
    inputsCount: 2,
    reportedVat: 0,
  }),
  detail({
    type: 'M',
    invoiceDate: '20260112',
    refGroup: '0001',
    refNumber: '000000101',
    totalVat: 1800,
    invoiceSum: 10_000,
  }),
  detail({
    type: 'I',
    invoiceDate: '20260113',
    refGroup: '0001',
    refNumber: '000000102',
    totalVat: 1800,
    invoiceSum: 10_000,
  }),
  detail({
    type: 'C',
    invoiceDate: '20260114',
    refGroup: '0000',
    refNumber: '000000201',
    totalVat: 1800,
    invoiceSum: 10_000,
  }),
  detail({
    type: 'P',
    invoiceDate: '20260115',
    refGroup: '0000',
    refNumber: '000000202',
    totalVat: 1800,
    invoiceSum: 10_000,
  }),
  footer(DEALER),
]);

// b2 — invalid: an identified-customer sale of ₪100,000 before VAT with a zeros
// counter party. Note A: "In a sale where the pre-VAT amount is higher than
// 5,000 NIS, it is obligatory to state the customer's merchant number" (lines
// 537-539). The aggregation note A allows below that figure does not reach here.
const invalidSLargeUnidentified = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 100_000,
    taxableSalesVat: 18_000,
    salesRecordCount: 1,
    reportedVat: 18_000,
  }),
  detail({
    type: 'S',
    vatId: '000000000',
    invoiceDate: '20260112',
    refGroup: '0001',
    refNumber: '000000101',
    totalVat: 18_000,
    invoiceSum: 100_000,
  }),
  footer(DEALER),
]);

const fixtures = {
  'valid-minimal.txt': validMinimal,
  'valid-mixed.txt': validMixed,
  'valid-no-details.txt': validNoDetails,
  'valid-crlf.txt': validCrlf,
  'valid-refgroup-alpha.txt': validRefGroupAlpha,
  'valid-refgroup-lowercase.txt': validRefGroupLowercase,
  'valid-refgroup-zeropad.txt': validRefGroupZeroPadded,
  'warnings-only.txt': warningsOnly,
  'warnings-footer-dealer.txt': warningsFooterDealer,
  'warnings-refgroup-punctuation.txt': warningsRefGroupPunctuation,
  'warnings-refgroup-hebrew.txt': warningsRefGroupHebrew,
  'warnings-vat-only-credit.txt': warningsVatOnlyCredit,
  'warnings-petty-cash-cap.txt': warningsPettyCashCap,
  'warnings-h-counterparty.txt': warningsHCounterparty,
  'invalid-header-length.txt': invalidHeaderLength,
  'invalid-header-digits.txt': invalidHeaderDigits,
  'invalid-detail-length.txt': invalidDetailLength,
  'invalid-record-type.txt': invalidRecordType,
  'invalid-footer-z.txt': invalidFooterZ,
  'invalid-sign-of-zero.txt': invalidSignOfZero,
  'invalid-counts.txt': invalidCounts,
  'invalid-detail-semantics.txt': invalidDetailSemantics,
  'invalid-representative-file.txt': invalidRepresentativeFile,
  'invalid-input-counterparty.txt': invalidInputCounterparty,
  'invalid-self-invoice-counterparty.txt': invalidSelfInvoiceCounterparty,
  'invalid-s-large-unidentified.txt': invalidSLargeUnidentified,
};

mkdirSync(fixturesDir, { recursive: true });
for (const [name, content] of Object.entries(fixtures)) {
  writeFileSync(join(fixturesDir, name), content, 'utf8');
  process.stdout.write(`wrote ${name} (${content.length} bytes)\n`);
}
