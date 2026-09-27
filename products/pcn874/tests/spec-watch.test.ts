import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { OFFICIAL_SPEC_URLS } from '../src/sources.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const watcher = readFileSync(join(root, 'scripts', 'spec-watch.mjs'), 'utf8');
const workflow = readFileSync(
  join(root, '..', '..', '.github', 'workflows', 'pcn874-spec-watch.yml'),
  'utf8',
);
const lock = JSON.parse(readFileSync(join(root, 'docs', 'SPEC-SOURCES.lock.json'), 'utf8')) as {
  note: string;
  sources: Record<string, unknown>;
};

describe('spec-watch stays honest about what it is for', () => {
  it('watches exactly the URLs sources.ts records, and no others', () => {
    const inScript = [...watcher.matchAll(/url: '(https?:[^']+)'/g)].map(m => m[1]);
    expect(inScript.sort()).toEqual(OFFICIAL_SPEC_URLS.map(u => u.url).sort());
  });

  it('keeps a provenance line for every URL, so none can be invented later', () => {
    for (const { url, provenance } of OFFICIAL_SPEC_URLS) {
      expect(watcher).toContain(url);
      expect(provenance).toMatch(/README\.md:|israel-bureaucracy\.md:/);
    }
  });

  it('is wired into a workflow that runs where there is egress', () => {
    expect(workflow).toContain('node scripts/spec-watch.mjs');
    expect(workflow).toContain('workflow_dispatch');
    expect(workflow).toContain('schedule');
  });

  it('pins every watched document to the hash of the exact bytes docs/SPEC.md was derived from', () => {
    // It used to assert an EMPTY lock. An empty lock plus a job that never commits back (permissions: contents:
    // read) meant every run printed "new" and the watch could never print CHANGED — the defect the sweep-2 board
    // found (research/colony-sweep/BOARD-2.md §2.4). The bytes that were read are the render-watch captures of the
    // same three URLs (research/rendered/pcn874-<id>.pdf, fetched 2026-09-07); their hashes are the baseline.
    const rendered = join(root, '..', '..', 'research', 'rendered');
    const sources = lock.sources as Record<string, { url: string; sha256: string; readByAHuman: boolean }>;
    const idOf = (renderedPath: string) => renderedPath.replace(/^research\/rendered\/pcn874-/, '').replace(/\.txt$/, '');
    expect(Object.keys(sources).sort()).toEqual(OFFICIAL_SPEC_URLS.map(u => idOf(u.renderedPath)).sort());
    for (const { url, renderedPath, sha256: recorded } of OFFICIAL_SPEC_URLS) {
      const id = idOf(renderedPath);
      expect(sources[id].sha256).toBe(recorded);
      const meta = JSON.parse(readFileSync(join(rendered, `pcn874-${id}.meta.json`), 'utf8')) as { url: string; sha256: string };
      const bytes = readFileSync(join(rendered, `pcn874-${id}.pdf`));
      expect(meta.url).toBe(url);
      expect(sources[id].url).toBe(url);
      expect(sources[id].sha256).toBe(createHash('sha256').update(bytes).digest('hex'));
      expect(sources[id].sha256).toBe(meta.sha256);
      expect(sources[id].readByAHuman).toBe(true);
    }
  });

  it('has a lock file whose note says what a hash does and does not mean', () => {
    // The note changed on 2026-09-07 with the evidence. The documents HAVE now
    // been read (docs/SPEC.md cites them line by line), so the job's purpose is
    // no longer "get us a copy" but "tell us when a new edition appears".
    expect(lock.note).toContain('fetched and read on 2026-09-07');
    expect(lock.note).toContain('a NEW EDITION is noticed');
    expect(lock.note).toContain('does NOT mean the new bytes have been read');
  });

  it('tells a reader what to do when a hash changes: re-derive, do not assume', () => {
    expect(watcher).toContain('docs/SPEC.md');
    expect(watcher).toContain('a new edition may move a width or an offset');
    expect(watcher).not.toContain('SPEC-FROM-SOURCES.md');
  });

  it('is wired to a workflow that calls itself the watch for a new edition, never a compliance check', () => {
    // Rewritten on 2026-09-07 after the reconciliation: the header now says the
    // circular is rendered and reconciled in docs/SPEC.md, that a changed hash is
    // the only signal of a new edition, and that green means "unchanged".
    expect(workflow).toContain('docs/SPEC.md');
    expect(workflow).toContain('never "compliant"');
    expect(workflow).toContain('a new edition must be diffed against docs/SPEC.md');
    expect(workflow).not.toContain('SPEC-FROM-SOURCES.md');
  });
});
