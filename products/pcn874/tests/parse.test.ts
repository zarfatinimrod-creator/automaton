import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isParsed, parsePcn874 } from '../src/parse.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string): string => readFileSync(join(here, 'fixtures', name), 'utf8');

describe('parsePcn874', () => {
  it('splits a minimal file into header, detail and footer', () => {
    const parsed = parsePcn874(fixture('valid-minimal.txt'));
    expect(parsed.records.map(r => r.kind)).toEqual(['header', 'detail', 'footer']);
    expect(parsed.records.map(r => r.line)).toEqual([1, 2, 3]);
    expect(parsed.lineEnding).toBe('LF');
    expect(parsed.trailingNewline).toBe(false);
  });

  it('slices header fields at the offsets from the layout table', () => {
    const [header] = parsePcn874(fixture('valid-minimal.txt')).records;
    expect(header!.fields['recordType']).toBe('O');
    expect(header!.fields['licensedDealerId']).toBe('514457282');
    expect(header!.fields['reportMonth']).toBe('202601');
    expect(header!.fields['reportType']).toBe('1');
    expect(header!.fields['generationDate']).toBe('20260210');
    expect(header!.fields['taxableSalesAmountSign']).toBe('+');
    expect(header!.fields['taxableSalesAmount']).toBe('00000010000');
    expect(header!.fields['taxableSalesVat']).toBe('000001800');
    expect(header!.fields['differentRateSalesAmount']).toBe('00000000000');
    expect(header!.fields['differentRateSalesVat']).toBe('000000000');
    expect(header!.fields['salesRecordCount']).toBe('000000001');
    expect(header!.fields['inputsCount']).toBe('000000000');
    expect(header!.fields['reportedVatSign']).toBe('+');
    expect(header!.fields['reportedVat']).toBe('00000001800');
  });

  it('slices detail fields at the offsets from the layout table', () => {
    const detail = parsePcn874(fixture('valid-minimal.txt')).records[1]!;
    expect(detail.fields['recordType']).toBe('S');
    expect(detail.fields['counterpartyVatId']).toBe('512345678');
    expect(detail.fields['invoiceDate']).toBe('20260112');
    expect(detail.fields['refGroup']).toBe('0001');
    expect(detail.fields['refNumber']).toBe('000000101');
    expect(detail.fields['totalVat']).toBe('000001800');
    expect(detail.fields['invoiceSumSign']).toBe('+');
    expect(detail.fields['invoiceSum']).toBe('0000010000');
    expect(detail.fields['allocationNumber']).toBe('123456789');
  });

  it('keeps the sign of a credit note in its own field, not in the digits', () => {
    const credit = parsePcn874(fixture('valid-mixed.txt')).records[2]!;
    expect(credit.fields['invoiceSumSign']).toBe('-');
    expect(credit.fields['invoiceSum']).toBe('0000001000');
  });

  it('accepts CRLF and a trailing newline', () => {
    const parsed = parsePcn874(fixture('valid-crlf.txt'));
    expect(parsed.lineEnding).toBe('CRLF');
    expect(parsed.trailingNewline).toBe(true);
    expect(parsed.records.map(r => r.kind)).toEqual(['header', 'detail', 'footer']);
    expect(parsed.records[0]!.raw).toHaveLength(131);
  });

  it('accepts a bare CR file', () => {
    const parsed = parsePcn874(fixture('valid-minimal.txt').replace(/\n/g, '\r'));
    expect(parsed.lineEnding).toBe('CR');
    expect(parsed.records).toHaveLength(3);
  });

  it('reports mixed line endings', () => {
    const lines = fixture('valid-minimal.txt').split('\n');
    expect(parsePcn874(`${lines[0]}\r\n${lines[1]}\n${lines[2]}`).lineEnding).toBe('mixed');
  });

  it('classifies an unknown leading letter rather than throwing', () => {
    const parsed = parsePcn874(fixture('invalid-record-type.txt'));
    expect(parsed.records.map(r => r.kind)).toEqual(['header', 'unknown', 'footer']);
    expect(parsed.records[1]!.fields).toEqual({});
  });

  it('still slices what it can from a truncated record', () => {
    const parsed = parsePcn874(fixture('invalid-detail-length.txt'));
    const detail = parsed.records[1]!;
    expect(detail.raw).toHaveLength(58);
    expect(detail.fields['recordType']).toBe('S');
    // the last field starts at offset 51 and is only 7 characters long here
    expect(detail.fields['allocationNumber']).toHaveLength(7);
  });

  it('records non-ASCII offsets', () => {
    const parsed = parsePcn874('Oש\n');
    expect(parsed.nonAsciiOffsets).toEqual([1]);
  });

  it('treats an empty string as a file with no records', () => {
    const parsed = parsePcn874('');
    expect(parsed.records).toEqual([]);
    expect(parsed.lineEnding).toBe('none');
  });

  it('recognises its own output through isParsed', () => {
    expect(isParsed(parsePcn874(fixture('valid-minimal.txt')))).toBe(true);
    expect(isParsed('O123')).toBe(false);
    expect(isParsed(null)).toBe(false);
  });
});
