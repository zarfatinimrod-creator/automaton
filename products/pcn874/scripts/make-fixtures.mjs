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
  allocationNumber = '000000000',
}) {
  return (
    type +
    vatId +
    invoiceDate +
    refGroup +
    refNumber +
    d(totalVat, 9) +
    signed(invoiceSum, 10) +
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

// invalid: closing-entry dealer id differs from the header's
const invalidFooterDealer = file([
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

// warnings only: a reserved header field carries a value, an S record has no
// customer number, a K record's invoice count is zero, and an R record carries a
// reference number. All four are places the document describes a field without
// forbidding the value, so `valid` stays true.
const warningsOnly = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    differentRateSalesAmount: 1,
    salesRecordCount: 1,
    otherInputsVat: 2826,
    inputsCount: 2,
    reportedVat: -1026,
  }),
  detail({
    type: 'S',
    vatId: '000000000',
    invoiceDate: '20260112',
    refGroup: '0001',
    refNumber: '000000101',
    totalVat: 1800,
    invoiceSum: 10_000,
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

const fixtures = {
  'valid-minimal.txt': validMinimal,
  'valid-mixed.txt': validMixed,
  'valid-no-details.txt': validNoDetails,
  'valid-crlf.txt': validCrlf,
  'valid-refgroup-alpha.txt': validRefGroupAlpha,
  'warnings-only.txt': warningsOnly,
  'invalid-header-length.txt': invalidHeaderLength,
  'invalid-header-digits.txt': invalidHeaderDigits,
  'invalid-detail-length.txt': invalidDetailLength,
  'invalid-record-type.txt': invalidRecordType,
  'invalid-footer-z.txt': invalidFooterZ,
  'invalid-footer-dealer.txt': invalidFooterDealer,
  'invalid-sign-of-zero.txt': invalidSignOfZero,
  'invalid-counts.txt': invalidCounts,
  'invalid-detail-semantics.txt': invalidDetailSemantics,
  'invalid-representative-file.txt': invalidRepresentativeFile,
};

mkdirSync(fixturesDir, { recursive: true });
for (const [name, content] of Object.entries(fixtures)) {
  writeFileSync(join(fixturesDir, name), content, 'utf8');
  process.stdout.write(`wrote ${name} (${content.length} bytes)\n`);
}
