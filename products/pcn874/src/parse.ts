/**
 * parsePcn874 — turn PCN874 text into records without judging it.
 *
 * The parser is deliberately forgiving: it classifies each line by its first
 * character, slices the fields it can, and hands everything to the validator.
 * A malformed file must still parse, or the validator has nothing to report on.
 */

import {
  DETAIL,
  FOOTER,
  FOOTER_RECORD_TYPE,
  HEADER,
  HEADER_RECORD_TYPE,
  RECORD_TYPE_LETTERS,
  REPRESENTATIVE_SUMMARY_RECORD_TYPE,
  type RecordSpec,
} from './layout.js';

export type RecordKind = 'header' | 'detail' | 'footer' | 'unknown';

export type LineEnding = 'LF' | 'CRLF' | 'CR' | 'mixed' | 'none';

export interface Pcn874Record {
  /** 0-based position among the records. */
  readonly index: number;
  /** 1-based line number in the file, for error messages. */
  readonly line: number;
  readonly kind: RecordKind;
  readonly raw: string;
  /** Field id -> raw slice. Fields beyond the end of a short line are omitted. */
  readonly fields: Readonly<Record<string, string>>;
}

export interface ParsedPcn874 {
  readonly records: readonly Pcn874Record[];
  readonly lineEnding: LineEnding;
  readonly trailingNewline: boolean;
  /** Offsets (0-based, in the whole text) of bytes outside printable ASCII. */
  readonly nonAsciiOffsets: readonly number[];
}

function detectLineEnding(text: string): LineEnding {
  const crlf = (text.match(/\r\n/g) ?? []).length;
  const withoutCrlf = text.replace(/\r\n/g, '');
  const lf = (withoutCrlf.match(/\n/g) ?? []).length;
  const cr = (withoutCrlf.match(/\r/g) ?? []).length;
  const kinds = [crlf > 0, lf > 0, cr > 0].filter(Boolean).length;
  if (kinds === 0) return 'none';
  if (kinds > 1) return 'mixed';
  if (crlf > 0) return 'CRLF';
  if (lf > 0) return 'LF';
  return 'CR';
}

function specFor(kind: RecordKind): RecordSpec | undefined {
  if (kind === 'header') return HEADER;
  if (kind === 'detail') return DETAIL;
  if (kind === 'footer') return FOOTER;
  return undefined;
}

/**
 * Classify a record by its first character.
 *
 * "Z" is classified as a closing record even though Appendix A's closing entry
 * is "X": Z is Appendix B's summary entry for a representative's multi-user file
 * (official line 209), and linet3 writes it in an individual merchant's file.
 * Treating it as a malformed closing record gets the reader a finding that
 * explains the difference, rather than "unknown record type".
 */
function classify(raw: string): RecordKind {
  const first = raw.charAt(0);
  if (first === HEADER_RECORD_TYPE) return 'header';
  if (first === FOOTER_RECORD_TYPE || first === REPRESENTATIVE_SUMMARY_RECORD_TYPE) return 'footer';
  if (RECORD_TYPE_LETTERS.includes(first)) return 'detail';
  return 'unknown';
}

function sliceFields(raw: string, spec: RecordSpec): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of spec.fields) {
    if (field.offset >= raw.length) continue;
    out[field.id] = raw.slice(field.offset, field.offset + field.length);
  }
  return out;
}

/**
 * Parse a PCN874 file.
 *
 * Accepts LF, CRLF and CR line endings, with or without a trailing newline.
 * Blank lines are dropped (a trailing blank line is what a trailing newline
 * looks like after splitting) but are counted so line numbers stay true.
 */
export function parsePcn874(text: string): ParsedPcn874 {
  const lineEnding = detectLineEnding(text);
  const trailingNewline = /(\r\n|\n|\r)$/.test(text);

  const nonAsciiOffsets: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const isNewline = code === 0x0a || code === 0x0d;
    if (isNewline) continue;
    if (code < 0x20 || code > 0x7e) nonAsciiOffsets.push(i);
  }

  const rawLines = text.split(/\r\n|\n|\r/);
  const records: Pcn874Record[] = [];
  let index = 0;
  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i] ?? '';
    if (raw.length === 0) continue;
    const kind = classify(raw);
    const spec = specFor(kind);
    records.push({
      index: index++,
      line: i + 1,
      kind,
      raw,
      fields: spec ? sliceFields(raw, spec) : {},
    });
  }

  return { records, lineEnding, trailingNewline, nonAsciiOffsets };
}

export function isParsed(value: unknown): value is ParsedPcn874 {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as ParsedPcn874).records) &&
    typeof (value as ParsedPcn874).lineEnding === 'string'
  );
}
