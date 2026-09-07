/**
 * pcn874 — a validator for the Israeli VAT detailed report file (דוח מע"מ מפורט).
 *
 * This package checks structure against a layout rendered from three independent
 * open-source implementations, cited field by field in docs/SPEC-FROM-SOURCES.md.
 * It is NOT the Israel Tax Authority specification and it does not decide whether
 * a filing is correct. There is no generator here on purpose: the board's order
 * was validator first, and a wrong generated file is the filer's exposure.
 */

export { parsePcn874, isParsed } from './parse.js';
export type { ParsedPcn874, Pcn874Record, RecordKind, LineEnding } from './parse.js';

export { validatePcn874 } from './validate.js';
export type { Finding, Severity, ValidationResult } from './validate.js';

export {
  HEADER,
  DETAIL,
  FOOTER,
  RECORD_SPECS,
  RECORD_TYPES,
  RECORD_TYPE_LETTERS,
  HEADER_RECORD_TYPE,
  FOOTER_RECORD_TYPE,
  FOOTER_RECORD_TYPE_LINET3,
  fieldsOf,
  findField,
} from './layout.js';
export type { FieldSpec, RecordSpec, FieldClass } from './layout.js';

export { SOURCES, OFFICIAL_SPEC_URLS, describeCitation } from './sources.js';
export type { SourceRepo } from './sources.js';
