import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  DETAIL,
  FOOTER,
  HEADER,
  RECORD_SPECS,
  RECORD_TYPES,
  RECORD_TYPE_LETTERS,
  REPRESENTATIVE_INITIAL_RECORD_TYPE,
  REPRESENTATIVE_SUMMARY_RECORD_TYPE,
  magnitudeOf,
} from '../src/layout.js';
import {
  OFFICIAL_SOURCE_KEY,
  OFFICIAL_SPEC_URLS,
  OFFICIAL_TEXT_PATH,
  SOURCES,
  describeCitation,
  kindOf,
} from '../src/sources.js';

const here = dirname(fileURLToPath(import.meta.url));
const spec = readFileSync(join(here, '..', 'docs', 'SPEC.md'), 'utf8');
/** The extracted official text itself, so citations can be checked against it. */
const officialText = readFileSync(join(here, '..', '..', '..', OFFICIAL_TEXT_PATH), 'utf8');
const officialLines = officialText.split('\n');

describe('layout table', () => {
  it.each(RECORD_SPECS)('$kind fields tile the record with no gap or overlap', recordSpec => {
    let cursor = 0;
    for (const field of recordSpec.fields) {
      expect(field.offset, `${recordSpec.kind}.${field.id} offset`).toBe(cursor);
      expect(field.length).toBeGreaterThan(0);
      cursor += field.length;
    }
    expect(cursor, `${recordSpec.kind} total width`).toBe(recordSpec.length);
  });

  it('has the record lengths Appendix A declares', () => {
    expect(HEADER.length).toBe(131);
    expect(DETAIL.length).toBe(60);
    expect(FOOTER.length).toBe(10);
  });

  it('gives every field at least one citation, and every citation a known source', () => {
    for (const recordSpec of RECORD_SPECS) {
      for (const field of recordSpec.fields) {
        expect(field.sources.length, `${recordSpec.kind}.${field.id}`).toBeGreaterThan(0);
        for (const citation of field.sources) {
          const key = citation.slice(0, citation.indexOf(':'));
          expect(SOURCES[key], `unknown source key in ${citation}`).toBeDefined();
          expect(describeCitation(citation)).not.toBe(citation);
        }
      }
    }
  });

  it('cites the Tax Authority document FIRST on every field of every record', () => {
    for (const recordSpec of RECORD_SPECS) {
      expect(kindOf(recordSpec.sources[0]!), `${recordSpec.kind} record`).toBe('official');
      for (const field of recordSpec.fields) {
        expect(kindOf(field.sources[0]!), `${recordSpec.kind}.${field.id}`).toBe('official');
      }
    }
  });

  it('quotes the document on every field, and the quoted line really is in the extracted text', () => {
    for (const recordSpec of RECORD_SPECS) {
      for (const field of recordSpec.fields) {
        expect(field.officialText, `${recordSpec.kind}.${field.id} has no quote`).toBeTruthy();

        // The first official citation must point at a line that exists.
        const citation = field.sources[0]!;
        const lineRef = citation.slice(citation.lastIndexOf(':') + 1);
        const first = Number(lineRef.split(/[,-]/)[0]);
        expect(Number.isInteger(first), `${field.id}: bad line ref ${lineRef}`).toBe(true);
        expect(first).toBeGreaterThan(0);
        expect(first).toBeLessThanOrEqual(officialLines.length);
      }
    }
  });

  it('every field\'s FIRST official citation lands on a line declaring its type', () => {
    // Guards against citation drift: if a line number moves, the declared width
    // stops appearing where the table says it does and this fails.
    const at = (ref: string): string => {
      const out: string[] = [];
      for (const chunk of ref.split(',')) {
        const [a, b] = chunk.split('-').map(Number);
        for (let n = a!; n <= (b ?? a!); n++) out.push(officialLines[n - 1] ?? '');
      }
      return out.join(' ');
    };

    for (const recordSpec of RECORD_SPECS) {
      for (const field of recordSpec.fields) {
        const citation = field.sources[0]!;
        const text = at(citation.slice(citation.lastIndexOf(':') + 1));
        const expected =
          field.class === 'sign'
            ? '+/-'
            : field.class === 'alphanumeric' || field.class === 'alpha'
              ? `A(${field.length})`
              : field.class === 'literal'
                ? 'A(1)'
                : `N(${field.length})`;
        // The header's literal "1" is typed N(1), not A(1).
        const alternatives = field.class === 'literal' ? [expected, 'N(1)'] : [expected];
        expect(
          alternatives.some(a => text.includes(a)),
          `${recordSpec.kind}.${field.id}: ${citation} does not declare ${expected}\n${text}`,
        ).toBe(true);
      }
    }
  });

  it('the official field-type declarations really appear at the lines cited', () => {
    // A spot check of the widths that decide the record lengths, read straight
    // out of the extracted document rather than trusted from the table.
    const at = (n: number): string => officialLines[n - 1] ?? '';
    expect(at(100)).toContain('"O" – fixed value');
    expect(at(107)).toContain('N(11)'); // total taxable sales
    expect(at(126)).toContain('N(11)'); // reported VAT — the 11-vs-9 disagreement
    expect(at(139)).toContain('A(4)'); // reference group — alphanumeric, not digits
    expect(at(158)).toContain('"X" – fixed value');
    expect(at(209)).toContain('"Z" – fixed value'); // Appendix B, not the closing entry
    expect(at(174)).toContain('will be "+"'); // sign of zero
  });

  it('links every sign field to the amount it signs', () => {
    for (const recordSpec of RECORD_SPECS) {
      for (const field of recordSpec.fields) {
        if (field.class !== 'sign') continue;
        const magnitude = magnitudeOf(recordSpec, field);
        expect(magnitude, `${recordSpec.kind}.${field.id} signs nothing`).toBeDefined();
        expect(magnitude!.class).toBe('digits');
        // The document always puts the sign immediately before its amount.
        expect(magnitude!.offset).toBe(field.offset + 1);
      }
    }
  });

  it('knows the eleven entry letters from the Table of Values, with a side and a citation each', () => {
    expect(RECORD_TYPE_LETTERS).toEqual(['C', 'H', 'I', 'K', 'L', 'M', 'P', 'R', 'S', 'T', 'Y']);
    for (const letter of RECORD_TYPE_LETTERS) {
      const type = RECORD_TYPES[letter]!;
      expect(['sale', 'input']).toContain(type.side);
      expect(kindOf(type.source)).toBe('official');
    }
    // Appendix A's own split: S L M Y I are sales, T K R P H C are inputs.
    const sales = RECORD_TYPE_LETTERS.filter(l => RECORD_TYPES[l]!.side === 'sale');
    expect(sales.sort()).toEqual(['I', 'L', 'M', 'S', 'Y']);
  });

  it('keeps Appendix B\'s letters apart from Appendix A\'s', () => {
    expect(REPRESENTATIVE_INITIAL_RECORD_TYPE).toBe('A');
    expect(REPRESENTATIVE_SUMMARY_RECORD_TYPE).toBe('Z');
    expect(RECORD_TYPE_LETTERS).not.toContain('Z');
    expect(RECORD_TYPE_LETTERS).not.toContain('O');
    expect(RECORD_TYPE_LETTERS).not.toContain('X');
  });

  it('marks the reference group alphanumeric — the one field the document takes from all three implementations', () => {
    const refGroup = DETAIL.fields.find(f => f.id === 'refGroup')!;
    expect(refGroup.class).toBe('alphanumeric');
    expect(refGroup.length).toBe(4);
    expect(refGroup.officialText).toContain('A(4)');
  });

  it('keeps an open question on exactly the fields no source settles', () => {
    const open = RECORD_SPECS.flatMap(r => r.fields.filter(f => f.openQuestion).map(f => f.id));
    // generationDate: the document's own comment contradicts its N(8) width.
    // reportedVat: the document defines the field but never its arithmetic.
    // allocationNumber: 2009 says zeros, only a vendor manual describes today.
    expect(open.sort()).toEqual(['allocationNumber', 'generationDate', 'reportedVat']);
  });
});

describe('docs/SPEC.md stays in step with the code', () => {
  it('names every source it says it used', () => {
    for (const source of Object.values(SOURCES)) {
      expect(spec, `${source.repo} missing from the spec file`).toContain(
        source.kind === 'implementation' ? source.repo : source.url,
      );
    }
  });

  it('states the record lengths the layout table encodes', () => {
    expect(spec).toContain(`Header entry — \`O\`, ${HEADER.length} characters`);
    expect(spec).toContain(`Transaction entry — ${DETAIL.length} characters`);
    expect(spec).toContain(`Closing entry — \`X\`, ${FOOTER.length} characters`);
  });

  it('lists every field id from the layout table', () => {
    for (const recordSpec of RECORD_SPECS) {
      for (const field of recordSpec.fields) {
        expect(spec, `field ${recordSpec.kind}.${field.id} undocumented`).toContain(field.id);
      }
    }
  });

  it('cites every spec URL it hands to CI, with the rendered text and hash for each', () => {
    expect(OFFICIAL_SPEC_URLS.length).toBe(3);
    for (const entry of OFFICIAL_SPEC_URLS) {
      expect(spec).toContain(entry.url);
      expect(entry.provenance.length).toBeGreaterThan(10);
      expect(entry.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(entry.renderedPath).toMatch(/^research\/rendered\//);
    }
  });

  it('says the official document HAS been read, and what its date is', () => {
    expect(spec).toContain('**We have now read that document.**');
    expect(spec).not.toContain('We could not open that PDF');
    // The circular is undated; the spec must say so and say how we dated it.
    expect(spec).toContain('carries **no version number and no date of its own**');
    expect(spec).toContain('01/01/2010');
    expect(SOURCES[OFFICIAL_SOURCE_KEY]!.documentDate).toContain('2009');
  });

  it('records a verdict for each of the disagreements the old spec logged', () => {
    for (const heading of [
      '### 6.1',
      '### 6.2',
      '### 6.3',
      '### 6.4',
      '### 6.5',
      '### 6.6',
      '### 6.7',
      '### 6.8',
    ]) {
      expect(spec, `${heading} missing`).toContain(heading);
    }
    expect(spec).toContain('**RESOLVED (official): 11 digits**');
    expect(spec).toContain('**RESOLVED (official): `X`, and `Z` explained**');
    expect(spec).toContain('**RESOLVED (official): an amount**');
    expect(spec).toContain('**RESOLVED (official): `+`**');
    expect(spec).toContain('**STILL OPEN**');
    expect(spec).toContain('**STILL OPEN (official is silent)**');
  });

  it('still says plainly what the tool does not tell you', () => {
    expect(spec).toContain('**it does not say your file will be accepted**');
  });
});
