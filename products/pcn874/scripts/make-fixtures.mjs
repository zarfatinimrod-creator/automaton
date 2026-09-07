#!/usr/bin/env node
/**
 * Regenerate tests/fixtures/*.txt.
 *
 * THIS IS NOT A PCN874 GENERATOR AND MUST NOT BE USED TO PRODUCE A FILING.
 * It exists so the test fixtures are demonstrably built from the layout table in
 * docs/SPEC-FROM-SOURCES.md rather than copied from a source repository — two of
 * the three sources (linet3, AGPL-3.0; rcbuilder, no licence at all) do not
 * permit copying their code or their sample files. Every digit below is invented.
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

/** Build a 131-character header record from the field table. */
function header({
  dealerId = '514457282',
  reportMonth = '202601',
  generationDate = '20260210',
  taxableSalesAmount = 0,
  taxableSalesVat = 0,
  salesRecordCount = 0,
  zeroOrExemptSalesAmount = 0,
  otherInputsVat = 0,
  equipmentInputsVat = 0,
  inputsCount = 0,
  reportedVat = 0,
} = {}) {
  return (
    'O' +
    dealerId +
    reportMonth +
    '1' +
    generationDate +
    signed(taxableSalesAmount, 11) +
    signed(taxableSalesVat, 9) +
    '+00000000000' +
    '+000000000' +
    d(salesRecordCount, 9) +
    signed(zeroOrExemptSalesAmount, 11) +
    signed(otherInputsVat, 9) +
    signed(equipmentInputsVat, 9) +
    d(inputsCount, 9) +
    signed(reportedVat, 11)
  );
}

/** Build a 60-character detail record from the field table. */
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

// invalid: header one character short
const shortHeader = header({ dealerId: DEALER, salesRecordCount: 1 }).slice(0, 130);
const invalidHeaderLength = file([shortHeader, ...validMinimalDetails, footer(DEALER)]);

// invalid: linet3's "Z" trailer
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

// invalid: a detail record with a letter nobody defines
const invalidRecordType = file([
  header({ dealerId: DEALER, salesRecordCount: 1 }),
  'Q' + validMinimalDetails[0].slice(1),
  footer(DEALER),
]);

// invalid: detail record two characters short
const invalidDetailLength = file([
  header({ dealerId: DEALER, salesRecordCount: 1, taxableSalesAmount: 10_000, taxableSalesVat: 1800 }),
  validMinimalDetails[0].slice(0, 58),
  footer(DEALER),
]);

// invalid: trailer dealer id differs from the header's
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

// invalid: a letter where digits belong (dealer id)
const invalidHeaderDigits = file([
  'O' + '51445728A' + '202601' + '1' + '20260210' + header().slice(25),
  ...validMinimalDetails,
  footer(DEALER),
]);

// warnings only: declared counts do not match the records, L carries a VAT id,
// R carries a reference number. Structurally valid, so `valid` stays true.
const warningsOnly = file([
  header({
    dealerId: DEALER,
    taxableSalesAmount: 10_000,
    taxableSalesVat: 1800,
    salesRecordCount: 9,
    inputsCount: 9,
    reportedVat: 1800,
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
  'warnings-only.txt': warningsOnly,
  'invalid-header-length.txt': invalidHeaderLength,
  'invalid-header-digits.txt': invalidHeaderDigits,
  'invalid-detail-length.txt': invalidDetailLength,
  'invalid-record-type.txt': invalidRecordType,
  'invalid-footer-z.txt': invalidFooterZ,
  'invalid-footer-dealer.txt': invalidFooterDealer,
};

mkdirSync(fixturesDir, { recursive: true });
for (const [name, content] of Object.entries(fixtures)) {
  writeFileSync(join(fixturesDir, name), content, 'utf8');
  process.stdout.write(`wrote ${name} (${content.length} bytes)\n`);
}
