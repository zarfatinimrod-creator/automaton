// The pcn874 validator, as the browser page loads it.
//
// pcn874.html does not carry a copy of the validator that could drift: it loads
// src/vendor/pcn874/*.js, which scripts/bundle-pcn874.js generates from
// products/pcn874/src/*.ts by stripping the types and changing nothing else.
// These tests prove the committed bundle IS that generation, and that it
// validates exactly as the TypeScript source does.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import {
  PCN874_MODULES,
  PCN874_SOURCE_DIR,
  PCN874_VENDOR_DIR,
  bundlePcn874,
  bundleProblems,
  fsBundleAccess,
} from '../src/lib/pcn874-bundle.js';
import { productRoot } from './helpers/product-copy.js';

const sourceDir = join(productRoot, PCN874_SOURCE_DIR);
const readSource = (name) => readFileSync(join(sourceDir, `${name}.ts`), 'utf8');
const sha256 = async (text) => {
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(text).digest('hex');
};

describe('bundlePcn874', () => {
  const { files, problems } = bundlePcn874(readSource);

  it('bundles exactly the four modules the validator needs, into src/vendor/pcn874/', () => {
    expect(problems).toEqual([]);
    expect(PCN874_MODULES).toEqual(['sources', 'layout', 'parse', 'validate']);
    expect(files.map((f) => f.path)).toEqual(PCN874_MODULES.map((m) => `${PCN874_VENDOR_DIR}/${m}.js`));
  });

  it('changes nothing but the types: each body is Node\'s own type-stripping of the source', () => {
    for (const [i, name] of PCN874_MODULES.entries()) {
      const body = files[i].text.split('\n').slice(4).join('\n');
      expect(body, name).toBe(stripTypeScriptTypes(readSource(name), { mode: 'strip' }));
    }
  });

  it('heads every file with where it came from and the sha256 of that source', async () => {
    for (const [i, name] of PCN874_MODULES.entries()) {
      const head = files[i].text.split('\n').slice(0, 4).join('\n');
      expect(head).toContain(`products/pcn874/src/${name}.ts`);
      expect(head).toContain('do not edit');
      expect(head).toContain(`source sha256: ${await sha256(readSource(name))}`);
    }
  });

  it('reports a missing source instead of bundling nothing', () => {
    const r = bundlePcn874((name) => (name === 'parse' ? null : readSource(name)));
    expect(r.problems).toEqual([expect.stringMatching(/parse\.ts.*cannot be read/)]);
  });

  it('reports an import of a module outside the bundle (it would 404 in the browser)', () => {
    const r = bundlePcn874((name) => (name === 'validate' ? `import { x } from './generate.js';\n${readSource(name)}` : readSource(name)));
    expect(r.problems).toEqual([expect.stringMatching(/validate\.ts imports \.\/generate\.js, which is not bundled/)]);
  });

  it('reports TypeScript that cannot be stripped (an enum, say) rather than shipping it', () => {
    const r = bundlePcn874((name) => (name === 'sources' ? `enum E { A }\n${readSource(name)}` : readSource(name)));
    expect(r.problems).toEqual([expect.stringMatching(/sources\.ts cannot be type-stripped/)]);
  });
});

describe('the committed bundle', () => {
  const access = fsBundleAccess(productRoot);

  it('is byte-for-byte what bundling products/pcn874/src produces today', () => {
    expect(bundleProblems(access)).toEqual([]);
  });

  it('holds no file the bundler did not write', () => {
    const onDisk = readdirSync(join(productRoot, PCN874_VENDOR_DIR)).sort();
    expect(onDisk).toEqual(PCN874_MODULES.map((m) => `${m}.js`).sort());
  });

  it('is reported stale when a vendored file is edited by hand', () => {
    const edited = { ...access, readVendored: (path) => `${access.readVendored(path)}\n// hand edit` };
    expect(bundleProblems(edited)).toEqual(
      PCN874_MODULES.map((m) => expect.stringMatching(new RegExp(`${PCN874_VENDOR_DIR}/${m}\\.js differs`))),
    );
  });

  it('is reported stale when the pcn874 source moves on', () => {
    const moved = { ...access, readSource: (name) => (name === 'layout' ? `${access.readSource(name)}\n// new rule` : access.readSource(name)) };
    expect(bundleProblems(moved)).toEqual([expect.stringMatching(/layout\.js differs/)]);
  });

  it('is reported when a file is missing or an extra one is sitting in the folder', () => {
    const gone = { ...access, readVendored: (path) => (path.endsWith('/parse.js') ? null : access.readVendored(path)) };
    expect(bundleProblems(gone)).toEqual([expect.stringMatching(/parse\.js is missing/)]);
    const extra = { ...access, listVendored: () => [...access.listVendored(), 'old.js'] };
    expect(bundleProblems(extra)).toEqual([expect.stringMatching(/old\.js is not generated/)]);
  });
});

describe('the bundle validates exactly as the TypeScript source does', () => {
  const fixtures = join(productRoot, '..', 'pcn874', 'tests', 'fixtures');
  const texts = readdirSync(fixtures).filter((f) => f.endsWith('.txt'));

  it('on every fixed-width fixture pcn874 keeps', async () => {
    const vendored = await import('../src/vendor/pcn874/validate.js');
    const source = await import('../../pcn874/src/validate.ts');
    expect(texts.length).toBeGreaterThan(20);
    for (const name of texts) {
      const text = readFileSync(join(fixtures, name), 'utf8');
      expect(vendored.validatePcn874(text), name).toEqual(source.validatePcn874(text));
    }
  });
});
