/**
 * The open-source implementations this package's rules were rendered from.
 *
 * Nothing here is the official Israel Tax Authority specification: that PDF is
 * egress-blocked from the container this package was written in. Every rule the
 * validator emits carries citations that resolve through this table, so a reader
 * can go and check the claim rather than trust it.
 *
 * See docs/SPEC-FROM-SOURCES.md for the field-by-field table and for the places
 * where these sources disagree with each other.
 */

export interface SourceRepo {
  /** Stable citation key, used as the prefix of every citation string. */
  readonly key: string;
  readonly repo: string;
  readonly url: string;
  readonly language: string;
  /** SPDX id, or `null` when the repository publishes no licence at all. */
  readonly licence: string | null;
  readonly licenceNote: string;
}

export const SOURCES: Readonly<Record<string, SourceRepo>> = Object.freeze({
  accounter: {
    key: 'accounter',
    repo: 'Urigo/accounter-fullstack',
    url: 'https://github.com/Urigo/accounter-fullstack',
    language: 'TypeScript',
    licence: 'MIT',
    licenceNote: 'MIT License, Copyright (c) 2022 Gil Gardosh. Package @accounter/pcn874-generator.',
  },
  linet3: {
    key: 'linet3',
    repo: 'adam2314/linet3',
    url: 'https://github.com/adam2314/linet3',
    language: 'PHP',
    licence: 'AGPL-3.0',
    licenceNote:
      'AGPL-3.0 per file header, "Linet 3.0 Open Source", Adam Ben Hur. Cited for facts only; no code copied.',
  },
  rcbuilder: {
    key: 'rcbuilder',
    repo: 'RcBuilder/Scripts',
    url: 'https://github.com/RcBuilder/Scripts',
    language: 'C#',
    licence: null,
    licenceNote:
      'No LICENSE file in the repository (all rights reserved). Cited for facts only; no code and no sample file copied.',
  },
});

/**
 * The official spec URLs known to us. Every one of them is egress-blocked from
 * the build container; they are here so the CI spec-watch job and any future
 * session use a URL that came from a source rather than one that was invented.
 */
export const OFFICIAL_SPEC_URLS: readonly { url: string; provenance: string }[] = Object.freeze([
  {
    url: 'https://www.gov.il/BlobFolder/generalpage/tax-vat-online-invoice-reporting/he/IncomeTax_IncomeTaxSoftwareHousesInfo_874-eng.pdf',
    provenance: 'accounter:packages/pcn874-generator/README.md:5 — the repo names it as its own basis',
  },
  {
    url: 'https://www.rivhit.co.il/uploaded_files/documents/pcn874_manual_U1231.pdf',
    provenance: 'research/colony-sweep/audits/israel-bureaucracy.md:188 — vendor mirror, edition 1.51',
  },
  {
    url: 'https://downloads.h-erp.co.il/files/vatr/Guidance874W.pdf',
    provenance: 'research/colony-sweep/audits/israel-bureaucracy.md:550 — second vendor mirror',
  },
]);

/** Expand a citation like `accounter:src/index.ts:40` into a readable line. */
export function describeCitation(citation: string): string {
  const firstColon = citation.indexOf(':');
  if (firstColon === -1) return citation;
  const key = citation.slice(0, firstColon);
  const rest = citation.slice(firstColon + 1);
  const source = SOURCES[key];
  if (!source) return citation;
  return `${source.repo} ${rest}`;
}
