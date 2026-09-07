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
} from '../src/layout.js';
import { OFFICIAL_SPEC_URLS, SOURCES, describeCitation } from '../src/sources.js';

const here = dirname(fileURLToPath(import.meta.url));
const spec = readFileSync(join(here, '..', 'docs', 'SPEC-FROM-SOURCES.md'), 'utf8');

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

  it('has the record lengths every source agrees on', () => {
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

  it('knows the eleven record-type letters, sorted, with a side for each', () => {
    expect(RECORD_TYPE_LETTERS).toEqual(['C', 'H', 'I', 'K', 'L', 'M', 'P', 'R', 'S', 'T', 'Y']);
    for (const letter of RECORD_TYPE_LETTERS) {
      expect(['sale', 'input']).toContain(RECORD_TYPES[letter]!.side);
    }
  });

  it('records the three disagreements the research file names in the code too', () => {
    expect(HEADER.disagreement).toMatch(/129/);
    expect(FOOTER.disagreement).toMatch(/"Z"/);
    const allocation = DETAIL.fields.find(f => f.id === 'allocationNumber');
    expect(allocation?.disagreement).toMatch(/FutureData/);
  });
});

describe('docs/SPEC-FROM-SOURCES.md stays in step with the code', () => {
  it('names all three sources it says it used', () => {
    for (const source of Object.values(SOURCES)) {
      expect(spec, `${source.repo} missing from the research file`).toContain(source.repo);
    }
  });

  it('states the record lengths the layout table encodes', () => {
    expect(spec).toContain(`Header record — \`O\`, ${HEADER.length} characters`);
    expect(spec).toContain(`Detail record — ${DETAIL.length} characters`);
  });

  it('lists every field id from the layout table', () => {
    for (const recordSpec of RECORD_SPECS) {
      for (const field of recordSpec.fields) {
        expect(spec, `field ${recordSpec.kind}.${field.id} undocumented`).toContain(field.id);
      }
    }
  });

  it('cites every official spec URL it hands to CI, and none that it invented', () => {
    for (const { url } of OFFICIAL_SPEC_URLS) {
      expect(spec).toContain(url);
    }
    expect(OFFICIAL_SPEC_URLS.length).toBe(3);
    for (const entry of OFFICIAL_SPEC_URLS) {
      expect(entry.provenance.length).toBeGreaterThan(10);
    }
  });

  it('says plainly that the official specification was not read', () => {
    expect(spec).toContain('**We could not open that PDF**');
  });
});
