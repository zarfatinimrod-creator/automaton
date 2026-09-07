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

  it('has a lock file whose note says what a hash does and does not mean', () => {
    // Still empty: the hashes in research/rendered/*.meta.json came from the
    // render-watch workflow, not from this job, which has never run in CI.
    expect(lock.sources).toEqual({});
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

  it('is still wired to a workflow that says it does not turn agreement into authority', () => {
    // The workflow's own wording still describes the pre-2026-09-07 situation
    // ("egress-blocked"). It lives outside products/pcn874/ and was deliberately
    // left alone by the reconciliation; docs/SPEC.md §1 records the true state.
    expect(workflow).toContain('egress-blocked');
    expect(workflow).toMatch(/does NOT do/);
  });
});
