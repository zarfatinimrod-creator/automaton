/**
 * pcn874 — a validator for the Israeli VAT detailed report file (דוח מע"מ מפורט).
 *
 * Rules come from the Israel Tax Authority's own circular to software houses —
 * Appendix A (record layout), Appendix B (the representatives' alignment file),
 * Appendix C (permitted values per document type) — rendered to text at
 * `research/rendered/pcn874-gov-il-874-eng.txt` and cited line by line in
 * docs/SPEC.md. Three open-source implementations corroborate it and are still
 * cited; the document decides.
 *
 * It does NOT decide whether a filing is correct or will be accepted: the
 * Authority publishes a simulator for that (`ITA_SIMULATOR_URL`). The board's
 * order was validator first, and the generator added on 2026-09-07 is built on
 * top of it: `generatePcn874` validates its own output and returns no text at
 * all when that validation reports an error, because a wrong generated file is
 * the filer's exposure. It does not compute `reportedVat` — no rendered source
 * states that arithmetic (docs/SPEC.md §5.2, §6.7).
 */

export { parsePcn874, isParsed } from './parse.js';
export type { ParsedPcn874, Pcn874Record, RecordKind, LineEnding } from './parse.js';

export { generatePcn874, GENERATOR_COLUMNS, GENERATOR_DIRECTIVES } from './generate.js';
export type {
  GenerateOptions,
  GenerateResult,
  GeneratorProblem,
  ProblemSeverity,
} from './generate.js';

export { validatePcn874, basisOf } from './validate.js';
export type { Finding, Severity, Basis, ValidationResult } from './validate.js';

export {
  HEADER,
  DETAIL,
  FOOTER,
  RECORD_SPECS,
  RECORD_TYPES,
  RECORD_TYPE_LETTERS,
  HEADER_RECORD_TYPE,
  FOOTER_RECORD_TYPE,
  REPRESENTATIVE_INITIAL_RECORD_TYPE,
  REPRESENTATIVE_SUMMARY_RECORD_TYPE,
  REPRESENTATIVE_SOURCE,
  fieldsOf,
  findField,
  magnitudeOf,
} from './layout.js';
export type { FieldSpec, RecordSpec, FieldClass } from './layout.js';

export {
  SOURCES,
  OFFICIAL_SPEC_URLS,
  OFFICIAL_SOURCE_KEY,
  OFFICIAL_TEXT_PATH,
  ITA_SIMULATOR_URL,
  describeCitation,
  kindOf,
  ita,
} from './sources.js';
export type { SourceRepo, SourceKind } from './sources.js';
