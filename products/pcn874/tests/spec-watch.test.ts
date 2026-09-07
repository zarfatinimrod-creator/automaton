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

  it('starts with an empty lock file that claims nothing', () => {
    expect(lock.sources).toEqual({});
    expect(lock.note).toContain('does NOT mean anybody has read the document');
  });

  it('says in the workflow that it does not turn agreement into authority', () => {
    expect(workflow).toContain('egress-blocked');
    expect(workflow).toMatch(/does NOT do/);
  });
});
