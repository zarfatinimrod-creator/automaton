import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadVerdicts } from '../../../scripts/queue-zero-test.mjs';
import { URLS as WATCHED, runSpecWatch } from '../scripts/spec-watch.mjs';
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

describe('spec-watch fetches nothing from a site whose terms are unread (ruling 30.9 16(d) D2(iv))', () => {
  type Result = { id: string; status: string; reason?: string };
  type Run = { exitCode: number; results: Result[] };
  const SKIP = (verdict: string) => `terms (${verdict}, ruling 30.9 16(d) D2(iv))`;
  const urlOf = (id: string) => WATCHED.find((e: { id: string }) => e.id === id)!.url as string;

  /** A private copy of the real lock and a download directory that does not exist yet. */
  function sandbox() {
    const dir = mkdtempSync(join(tmpdir(), 'spec-watch-'));
    const lockPath = join(dir, 'SPEC-SOURCES.lock.json');
    copyFileSync(join(root, 'docs', 'SPEC-SOURCES.lock.json'), lockPath);
    return { lockPath, downloadDir: join(dir, 'downloads'), lockText: readFileSync(lockPath, 'utf8') };
  }

  /** A fetch that never touches the network and records every URL it was asked for. */
  function recordingFetch(body: Uint8Array) {
    const calls: string[] = [];
    const fetchImpl = async (url: string | URL) => {
      calls.push(String(url));
      return new Response(body, { status: 200, headers: { 'content-type': 'application/pdf' } });
    };
    return { calls, fetchImpl };
  }

  it("refuses all three sources under today's verdicts: no fetch, no download, lock untouched, exit 0", async () => {
    // Today's terms-verdicts.json: www.gov.il, rivhit.co.il and h-erp.co.il are all NO_TERMS. When one of them is
    // read and its verdict changes, this test is meant to change with it.
    const box = sandbox();
    const { calls, fetchImpl } = recordingFetch(new Uint8Array([1, 2, 3]));
    const out: string[] = [];
    const run = (await runSpecWatch({
      fetchImpl,
      lockPath: box.lockPath,
      downloadDir: box.downloadDir,
      write: (s: string) => out.push(s),
    })) as Run;

    expect(calls).toEqual([]);
    expect(run.exitCode).toBe(0);
    expect(run.results.map(r => [r.id, r.status, r.reason])).toEqual(
      WATCHED.map((e: { id: string }) => [e.id, 'skipped', SKIP('NO_TERMS')]),
    );
    expect(readFileSync(box.lockPath, 'utf8')).toBe(box.lockText);
    expect(existsSync(box.downloadDir)).toBe(false);
    const text = out.join('');
    expect(text).toContain(`skipped      gov-il-874-eng  ${SKIP('NO_TERMS')}`);
    expect(text).toMatch(/every specification source was refused by the terms gate/i);
  });

  it('still fetches a source whose site is NOT_BARRED, and a refused source is neither fetched nor a change', async () => {
    const box = sandbox();
    const verdicts = { ...loadVerdicts(), 'rivhit.co.il': { verdict: 'NOT_BARRED' } } as Record<string, unknown>;
    delete verdicts['h-erp.co.il'];
    // The exact bytes the lock's rivhit hash was taken from, so the fetched copy reads as unchanged.
    const baseline = readFileSync(join(root, '..', '..', 'research', 'rendered', 'pcn874-rivhit-mirror.pdf'));
    const { calls, fetchImpl } = recordingFetch(baseline);
    const run = (await runSpecWatch({
      verdicts,
      fetchImpl,
      lockPath: box.lockPath,
      downloadDir: box.downloadDir,
      write: () => {},
    })) as Run;

    expect(calls).toEqual([urlOf('rivhit-mirror')]);
    expect(run.exitCode).toBe(0);
    const byId = Object.fromEntries(run.results.map(r => [r.id, r]));
    expect(byId['rivhit-mirror']!.status).toBe('unchanged');
    expect(byId['gov-il-874-eng']).toMatchObject({ status: 'skipped', reason: SKIP('NO_TERMS') });
    expect(byId['h-erp-mirror']).toMatchObject({ status: 'skipped', reason: SKIP('no verdict') });
    expect(readdirSync(box.downloadDir)).toEqual(['rivhit-mirror.pdf']);

    const before = JSON.parse(box.lockText) as { sources: Record<string, unknown> };
    const after = JSON.parse(readFileSync(box.lockPath, 'utf8')) as { sources: Record<string, unknown> };
    expect(after.sources['gov-il-874-eng']).toEqual(before.sources['gov-il-874-eng']);
    expect(after.sources['h-erp-mirror']).toEqual(before.sources['h-erp-mirror']);
  });

  it('still fails the job when a fetched source changed, while the refused ones stay out of it', async () => {
    const box = sandbox();
    const verdicts = { ...loadVerdicts(), 'h-erp.co.il': { verdict: 'NOT_BARRED' } };
    const { calls, fetchImpl } = recordingFetch(new TextEncoder().encode('%PDF-1.7 a new edition'));
    const err: string[] = [];
    const run = (await runSpecWatch({
      verdicts,
      fetchImpl,
      lockPath: box.lockPath,
      downloadDir: box.downloadDir,
      write: () => {},
      writeErr: (s: string) => err.push(s),
    })) as Run;

    expect(calls).toEqual([urlOf('h-erp-mirror')]);
    expect(run.exitCode).toBe(1);
    expect(err.join('')).toContain('A specification hash changed');
    expect(run.results.filter(r => r.status === 'changed').map(r => r.id)).toEqual(['h-erp-mirror']);
    expect(run.results.filter(r => r.status === 'skipped').map(r => r.id).sort()).toEqual(
      ['gov-il-874-eng', 'rivhit-mirror'],
    );
  });
});
