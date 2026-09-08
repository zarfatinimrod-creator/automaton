/**
 * Where every rule in this package comes from.
 *
 * Since 2026-09-07 the primary source is the **Israel Tax Authority's own
 * circular to software houses** — Appendix A (record layout), Appendix B (the
 * representatives' alignment file) and Appendix C (permitted field values). It
 * was fetched from gov.il by `.github/workflows/render-watch.yml` running in
 * GitHub Actions, which has egress, and extracted to text in this repository at
 * `research/rendered/pcn874-gov-il-874-eng.txt`. Citations of the form
 * `ita:research/rendered/pcn874-gov-il-874-eng.txt:107` name that file and the
 * line in it, so any reader can check the claim rather than trust it.
 *
 * The three open-source implementations are still cited, but they are now
 * **corroboration**, not authority. Two vendor manuals (Rivhit, H-ERP) are cited
 * only where the official document is silent and they are newer than it.
 *
 * See docs/SPEC.md for the field-by-field table and for what remains open.
 */

/**
 * What kind of authority a source carries.
 *
 * - `official`       — the Tax Authority's own document. Settles a question.
 * - `vendor-manual`  — a software house's guide to the format. Evidence about a
 *                      later amendment the 2009 circular cannot know about,
 *                      never a substitute for it.
 * - `implementation` — open-source code that writes or reads the file.
 *                      Corroboration; three agreeing is still not the Authority.
 */
export type SourceKind = 'official' | 'vendor-manual' | 'implementation';

export interface SourceRepo {
  /** Stable citation key, used as the prefix of every citation string. */
  readonly key: string;
  readonly kind: SourceKind;
  /** Display name, printed by the CLI. */
  readonly repo: string;
  readonly url: string;
  readonly language: string;
  /** SPDX id, or `null` when the source publishes no licence at all. */
  readonly licence: string | null;
  readonly licenceNote: string;
  /** Full document title, when `repo` is a short display name for it. */
  readonly title?: string;
  /**
   * For rendered documents: the path, relative to the repository root, of the
   * extracted text that citations point into.
   */
  readonly renderedPath?: string;
  /** What the document itself says about its own date or edition. */
  readonly documentDate?: string;
}

export const SOURCES: Readonly<Record<string, SourceRepo>> = Object.freeze({
  ita: {
    key: 'ita',
    kind: 'official',
    /** Short, because it is printed on every finding. Full title in `title`. */
    repo: 'Israel Tax Authority PCN874 circular, Appendices A/B/C',
    title:
      'Update: Deployment for PCN874 File Generation based on PC874 file structure — to Computerized ' +
      'Accounts Systems Managements Program Producers',
    url: 'https://www.gov.il/BlobFolder/generalpage/tax-vat-online-invoice-reporting/he/IncomeTax_IncomeTaxSoftwareHousesInfo_874-eng.pdf',
    language: 'English',
    licence: null,
    licenceNote:
      'Israeli government publication. Cited by line, with short quotations only; nothing is redistributed here beyond the extracted text kept for citation.',
    renderedPath: 'research/rendered/pcn874-gov-il-874-eng.txt',
    documentDate:
      'undated in the text; it is a 2009 circular — "The PCN874 file production must be completed by 01/01/2010" (line 12), ' +
      'and Appendix C §3 is headed "Additional Comments relating to the Variables Entry Field (in 2010 fiscal year)" (line 536). ' +
      'It announces, but does not specify, two later changes: allocation numbers from 1/2011 (lines 59-61) and the file ' +
      'replacing the periodical VAT report from 1/2012 (line 63). Fetched 2026-09-07, sha256 072e03fb…3fc61b.',
  },
  rivhit: {
    key: 'rivhit',
    kind: 'vendor-manual',
    repo: 'Rivhit — מדריך להכנת דיווח מקוון למע"מ, קובץ PCN874 (edition 1.51)',
    url: 'https://www.rivhit.co.il/uploaded_files/documents/pcn874_manual_U1231.pdf',
    language: 'Hebrew',
    licence: null,
    licenceNote:
      'Vendor manual, all rights reserved. Cited for facts only; nothing copied. A user guide to Rivhit’s software; it does not restate the byte layout.',
    renderedPath: 'research/rendered/pcn874-rivhit-mirror.txt',
    documentDate:
      'edition 1.51, updated 7/7/2011 (line 10: "מהדורה 1.51 , לתאריך   מעודכן 7/7/2011"). 33 pages.',
  },
  herp: {
    key: 'herp',
    kind: 'vendor-manual',
    repo: 'Hashavshevet — חשבשבת ERP, מע"מ מקוון PCN874',
    url: 'https://downloads.h-erp.co.il/files/vatr/Guidance874W.pdf',
    language: 'Hebrew',
    licence: null,
    licenceNote:
      'Vendor manual, all rights reserved. Cited for facts only; nothing copied. A user guide, not a layout specification.',
    renderedPath: 'research/rendered/pcn874-h-erp-mirror.txt',
    documentDate:
      'undated on its cover; current to release 2025 SP2 (line 1397) and describes the allocation-number duty starting 1/1/26 ' +
      '(lines 126-127, 303, 507-508). 50 pages in the PDF, though its own footers number them "of 48". Newer than ' +
      'the official circular, and the only rendered source that describes the allocation-number regime at all.',
  },
  accounter: {
    key: 'accounter',
    kind: 'implementation',
    repo: 'Urigo/accounter-fullstack',
    url: 'https://github.com/Urigo/accounter-fullstack',
    language: 'TypeScript',
    licence: 'MIT',
    licenceNote: 'MIT License, Copyright (c) 2022 Gil Gardosh. Package @accounter/pcn874-generator.',
  },
  linet3: {
    key: 'linet3',
    kind: 'implementation',
    repo: 'adam2314/linet3',
    url: 'https://github.com/adam2314/linet3',
    language: 'PHP',
    licence: 'AGPL-3.0',
    licenceNote:
      'AGPL-3.0 per file header, "Linet 3.0 Open Source", Adam Ben Hur. Cited for facts only; no code copied.',
  },
  rcbuilder: {
    key: 'rcbuilder',
    kind: 'implementation',
    repo: 'RcBuilder/Scripts',
    url: 'https://github.com/RcBuilder/Scripts',
    language: 'C#',
    licence: null,
    licenceNote:
      'No LICENSE file in the repository (all rights reserved). Cited for facts only; no code and no sample file copied.',
  },
});

/** The citation key of the official document, so no rule has to spell it out. */
export const OFFICIAL_SOURCE_KEY = 'ita';

/** Path of the extracted official text, relative to the repository root. */
export const OFFICIAL_TEXT_PATH = 'research/rendered/pcn874-gov-il-874-eng.txt';

/** Build an official citation for a line (or line range) of the extracted text. */
export function ita(lines: string): string {
  return `${OFFICIAL_SOURCE_KEY}:${OFFICIAL_TEXT_PATH}:${lines}`;
}

/**
 * The specification URLs. All three were unreachable from the build container
 * until 2026-09-07, when `.github/workflows/render-watch.yml` fetched them from
 * GitHub Actions and stored the bytes plus the extracted text under
 * `research/rendered/`. `renderedAt` is when that capture happened; the CI
 * spec-watch job keeps watching the hashes so a new edition is noticed.
 */
export const OFFICIAL_SPEC_URLS: readonly {
  url: string;
  provenance: string;
  renderedPath: string;
  renderedAt: string;
  sha256: string;
}[] = Object.freeze([
  {
    url: 'https://www.gov.il/BlobFolder/generalpage/tax-vat-online-invoice-reporting/he/IncomeTax_IncomeTaxSoftwareHousesInfo_874-eng.pdf',
    provenance:
      'accounter:packages/pcn874-generator/README.md:5 — the repo names it as its own basis. THIS IS THE AUTHORITATIVE DOCUMENT.',
    renderedPath: 'research/rendered/pcn874-gov-il-874-eng.txt',
    renderedAt: '2026-09-07',
    sha256: '072e03fbb4c5a1f9742dd14f2c225903b0ea27c7f22ad8fd154d28a2763fc61b',
  },
  {
    url: 'https://www.rivhit.co.il/uploaded_files/documents/pcn874_manual_U1231.pdf',
    provenance:
      'research/colony-sweep/audits/israel-bureaucracy.md:188 — vendor mirror, edition 1.51',
    renderedPath: 'research/rendered/pcn874-rivhit-mirror.txt',
    renderedAt: '2026-09-07',
    sha256: 'bf2a1a974d3524f1901f76d7b30419ea0969d44bfb072bb8bfb097dc4c81a010',
  },
  {
    url: 'https://downloads.h-erp.co.il/files/vatr/Guidance874W.pdf',
    provenance: 'research/colony-sweep/audits/israel-bureaucracy.md:550 — second vendor mirror',
    renderedPath: 'research/rendered/pcn874-h-erp-mirror.txt',
    renderedAt: '2026-09-07',
    sha256: 'e9c7104644ec1f97de955af3d1d913eba71d4724ce20f3d3b9aa3a6b8fe0ef63',
  },
]);

/**
 * The Tax Authority's own free simulator. Named by the official circular
 * ("In the nearest time Sha'am will place on-line simulator", line 84) and given
 * as a URL by the H-ERP manual (line 1263). It is the only thing that tells a
 * filer their file is acceptable; this validator never claims to.
 */
export const ITA_SIMULATOR_URL = 'http://www.misim.gov.il/EmDvhmfrt/wUploadFileHeshboniotSim.aspx';

/** Expand a citation like `ita:research/rendered/…txt:107` into a readable line. */
export function describeCitation(citation: string): string {
  const firstColon = citation.indexOf(':');
  if (firstColon === -1) return citation;
  const key = citation.slice(0, firstColon);
  const rest = citation.slice(firstColon + 1);
  const source = SOURCES[key];
  if (!source) return citation;
  return `${source.repo} ${rest}`;
}

/** The kind of authority behind a citation, or undefined for an unknown key. */
export function kindOf(citation: string): SourceKind | undefined {
  const firstColon = citation.indexOf(':');
  const key = firstColon === -1 ? citation : citation.slice(0, firstColon);
  return SOURCES[key]?.kind;
}
