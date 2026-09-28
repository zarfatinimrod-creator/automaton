// The four modules the il-biz-tools validator page runs in the browser.
//
// products/il-biz-tools/pcn874.html loads validate, parse, layout and sources
// with their types stripped and nothing else changed (il-biz-tools'
// scripts/bundle-pcn874.js). So these four must run where Node does not: no
// `Buffer`, no `process`, no `require`, no `node:` import, and no import of a
// module outside the four (generate.ts and cli.ts are Node-side and do not ship).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { validatePcn874 } from '../src/validate.js';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, '..', 'src');
const FIXTURES = join(here, 'fixtures');
const BROWSER_MODULES = ['sources', 'layout', 'parse', 'validate'] as const;

/** Code with comments and string literals removed, so prose cannot trip a check. */
function codeOf(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g, "''");
}

describe('the modules the browser page bundles', () => {
  for (const name of BROWSER_MODULES) {
    const source = readFileSync(join(SRC, `${name}.ts`), 'utf8');

    it(`${name}.ts uses no Node-only global`, () => {
      expect(codeOf(source)).not.toMatch(/\b(?:Buffer|process|require|__dirname|__filename|global)\b/);
    });

    it(`${name}.ts imports only the other bundled modules`, () => {
      const imports = [...source.matchAll(/\bfrom\s+'([^']+)'/g)].map(m => m[1]);
      for (const spec of imports) {
        expect(spec, `${name}.ts imports ${spec}`).toMatch(/^\.\/(?:sources|layout|parse|validate)\.js$/);
      }
    });
  }
});

describe('validatePcn874 without Node', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('still measures the UTF-8 width of a record when Buffer does not exist', () => {
    const text = readFileSync(join(FIXTURES, 'warnings-refgroup-hebrew.txt'), 'utf8');
    const withNode = validatePcn874(text);
    vi.stubGlobal('Buffer', undefined);
    const withoutNode = validatePcn874(text);
    expect(withoutNode.findings).toEqual(withNode.findings);
    expect(withoutNode.findings.map(f => f.rule)).toContain('file.byteWidth');
  });
});
