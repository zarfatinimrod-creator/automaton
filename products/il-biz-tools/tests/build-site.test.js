// The real build script, run in a throwaway copy of the product.
//
// What it must prove: an unverified config never lands in _site/, the registrar
// amounts never leave the repo, and the site is not built at all while the
// accessibility contact is a placeholder.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG_PUBLISH_RULES, isVerified } from '../src/lib/publish-gate.js';
import {
  copyProduct,
  removeCopy,
  runBuild,
  listFiles,
  readIn,
  editIn,
  fillContact,
  statementWithContact,
  TEST_CONTACT_ADDRESS,
  productRoot,
} from './helpers/product-copy.js';

const copies = [];
const fresh = () => {
  const dir = copyProduct();
  copies.push(dir);
  return dir;
};
afterAll(() => copies.forEach(removeCopy));

const registrar = JSON.parse(readFileSync(join(productRoot, 'src/config/registrar-fee.json'), 'utf8'));
const AMOUNTS = [registrar.amountsAwaitingVerification?.reducedIls, registrar.amountsAwaitingVerification?.fullIls]
  .filter((n) => typeof n === 'number')
  .flatMap((n) => [String(n), n.toLocaleString('en-US')]);

/** Every config under <out>/src/config must be verified, figure-free by rule, or cut to its allowed keys. */
function assertNoUnverifiedConfig(out) {
  const shipped = listFiles(out).filter((f) => f.endsWith('.json'));
  expect(shipped.length).toBeGreaterThan(0);
  for (const path of shipped) {
    const rule = CONFIG_PUBLISH_RULES[path];
    expect(rule, `${path} has a publish rule`).toBeDefined();
    const content = JSON.parse(readIn(out, path));
    if (rule === 'no-figures' || isVerified(content)) continue;
    expect(rule.unverifiedFields, `${path} is unverified, so it may only ship cut down`).toBeDefined();
    for (const key of Object.keys(content)) expect(rule.unverifiedFields, `${path} ships key ${key}`).toContain(key);
  }
}

describe('publishing today: the accessibility contact is still a placeholder', () => {
  let dir;
  let result;
  beforeAll(() => {
    dir = fresh();
    // A stale build from before must not survive a refusal.
    mkdirSync(join(dir, '_site'), { recursive: true });
    writeFileSync(join(dir, '_site', 'stale.html'), 'old build');
    result = runBuild(dir);
  });

  it('refuses, exits non-zero and names the placeholder', () => {
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('refusing to build');
    expect(result.stderr).toContain('accessibility-contact');
  });

  it('leaves no _site/ behind, not even an older one', () => {
    expect(existsSync(join(dir, '_site'))).toBe(false);
  });
});

describe('the preview build of today\'s tree', () => {
  let dir;
  let result;
  let files;
  beforeAll(() => {
    dir = fresh();
    result = runBuild(dir, '--preview');
    files = listFiles(join(dir, '_preview'));
  });

  it('succeeds, writes _preview/ only, and reports what would block a publish', () => {
    expect(result.status).toBe(0);
    expect(existsSync(join(dir, '_site'))).toBe(false);
    expect(result.stdout).toContain('a publish build would refuse');
    expect(result.stdout).toContain('accessibility-contact');
  });

  it('ships no unverified config: tax-2026.json is not there at all', () => {
    expect(files).not.toContain('src/config/tax-2026.json');
    assertNoUnverifiedConfig(join(dir, '_preview'));
  });

  it('ships the registrar dates and not one registrar amount, anywhere', () => {
    const shipped = JSON.parse(readIn(join(dir, '_preview'), 'src/config/registrar-fee.json'));
    expect(shipped.deadline).toEqual(registrar.deadline);
    expect(shipped).not.toHaveProperty('amountsAwaitingVerification');
    for (const f of files) {
      const text = readIn(join(dir, '_preview'), f);
      for (const n of AMOUNTS) expect(text.includes(n), `${f} contains ${n}`).toBe(false);
    }
  });

  it('ships only what the shipped pages load: no withheld-page code, no build-time modules', () => {
    for (const f of [
      'src/lib/net-salary.js',
      'assets/page-net-salary.js',
      'src/lib/publish-gate.js',
      'src/lib/site-deps.js',
      'src/lib/a11y-check.js',
    ]) {
      expect(files, f).not.toContain(f);
    }
    for (const f of ['src/config/vat.json', 'src/config/site.json', 'src/lib/license.js', 'assets/style.css']) {
      expect(files, f).toContain(f);
    }
  });

  it('ships the accessibility statement and lists it in the sitemap', () => {
    expect(files).toContain('accessibility.html');
    expect(readIn(join(dir, '_preview'), 'sitemap.xml')).toContain('accessibility.html');
  });
});

describe('publishing once the contact is real', () => {
  let dir;
  let result;
  beforeAll(() => {
    dir = fresh();
    fillContact(dir);
    result = runBuild(dir);
  });

  it('builds _site/', () => {
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(existsSync(join(dir, '_site', 'accessibility.html'))).toBe(true);
  });

  it('and still no unverified config lands in it', () => {
    expect(listFiles(join(dir, '_site'))).not.toContain('src/config/tax-2026.json');
    assertNoUnverifiedConfig(join(dir, '_site'));
  });
});

// The ways the adversarial review got the placeholder past the old gate, each run
// through the real build. Every one must exit 1 and leave no _site/ behind.
describe('the contact gate, end to end: the placeholder cannot ship', () => {
  const MARKER = ' data-publish-blocker="accessibility-contact"';
  const cases = {
    'marker deleted, placeholder paragraph kept': {
      edit: (h) => h.replace(MARKER, ''),
      says: /placeholder text "ממלא מקום"[\s\S]*no accessibility contact|no accessibility contact[\s\S]*placeholder text "ממלא מקום"/,
    },
    'marker written unquoted': {
      edit: (h) => h.replace(MARKER, ' data-publish-blocker=accessibility-contact'),
      says: /placeholder "accessibility-contact"/,
    },
    'marker with no value': {
      edit: (h) => h.replace(MARKER, ' data-publish-blocker'),
      says: /placeholder/,
    },
    'contact section deleted': {
      edit: (h) => h.replace(/<section class="card">\s*<h2>פנייה בנושא נגישות<\/h2>[\s\S]*?<\/section>/, ''),
      says: /no accessibility contact/,
    },
    'a stub contact with no address': {
      edit: (h) => statementWithContact(h, '<p>פניות בנושא נגישות: <a data-a11y-contact href="mailto:">כתבו לנו</a></p>'),
      says: /accessibility contact .*mailto:/,
    },
    'a contact at an example domain': {
      edit: (h) => statementWithContact(h, '<p>פניות: <a data-a11y-contact href="mailto:someone@example.com">someone@example.com</a></p>'),
      says: /reserved/,
    },
  };
  for (const [name, { edit, says }] of Object.entries(cases)) {
    it(`refuses: ${name}`, () => {
      const dir = fresh();
      editIn(dir, 'accessibility.html', (h) => {
        const next = edit(h);
        if (next === h) throw new Error(`edit for "${name}" changed nothing`);
        return next;
      });
      const r = runBuild(dir);
      expect(r.status, r.stdout).toBe(1);
      expect(r.stderr).toContain('refusing to build');
      expect(r.stderr).toMatch(says);
      expect(existsSync(join(dir, '_site'))).toBe(false);
    });
  }

  it('publishes with a well-formed contact, and that contact is what ships', () => {
    const dir = fresh();
    fillContact(dir);
    const r = runBuild(dir);
    expect(r.status, r.stderr).toBe(0);
    const shipped = readIn(join(dir, '_site'), 'accessibility.html');
    expect(shipped).toContain(`href="mailto:${TEST_CONTACT_ADDRESS}"`);
    expect(shipped).not.toContain('ממלא מקום');
    expect(shipped).not.toMatch(/data-publish-blocker/i);
  });
});

describe('fail closed', () => {
  it('a config that stops being verified leaves _site/ with the page withheld and the file absent', () => {
    const dir = fresh();
    fillContact(dir);
    editIn(dir, 'src/config/vat.json', (s) => s.replace('"verified": true', '"verified": false'));
    const r = runBuild(dir);
    expect(r.status).toBe(0);
    const files = listFiles(join(dir, '_site'));
    expect(files).not.toContain('src/config/vat.json');
    expect(readIn(join(dir, '_site'), 'vat.html')).toContain('לא מאומת');
    expect(readIn(join(dir, '_site'), 'invoice.html')).toContain('לא מאומת');
    assertNoUnverifiedConfig(join(dir, '_site'));
  });

  it('a published page that loads an unverified config it never declared stops the build', () => {
    const dir = fresh();
    fillContact(dir);
    editIn(dir, 'assets/common.js', (s) => `${s}\nexport const leak = () => fetch('src/config/tax-2026.json');\n`);
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('src/config/tax-2026.json');
    expect(existsSync(join(dir, '_site'))).toBe(false);
  });

  it('a config nobody wrote a rule for stops the build', () => {
    const dir = fresh();
    fillContact(dir);
    writeFileSync(join(dir, 'src/config/new-rates.json'), '{"verified": true, "rate": 1}\n');
    editIn(dir, 'assets/common.js', (s) => `${s}\nexport const more = () => fetch('src/config/new-rates.json');\n`);
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/new-rates\.json: no entry in CONFIG_PUBLISH_RULES/);
    expect(existsSync(join(dir, '_site'))).toBe(false);
  });

  it('a failing accessibility check stops the publish', () => {
    const dir = fresh();
    fillContact(dir);
    editIn(dir, 'assets/style.css', (s) => s.replace(/--brand: #[0-9a-f]{6}/, '--brand: #0f6fff'));
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/accessibility check "contrast" failed/);
    expect(existsSync(join(dir, '_site'))).toBe(false);
  });

  it('a missing accessibility statement stops the publish', () => {
    const dir = fresh();
    removeCopy(join(dir, 'accessibility.html'));
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/accessibility\.html: required page is missing/);
  });

  it('rejects an unknown flag instead of guessing what it meant', () => {
    const dir = fresh();
    expect(runBuild(dir, '--force').status).toBe(2);
  });
});

// The validator page runs products/pcn874's own code, bundled (src/lib/pcn874-bundle.js).
// The build regenerates that bundle from products/pcn874/src and will not publish
// - or preview - a copy that differs, so the page cannot drift from the validator
// pcn874's tests ran.
describe('the pcn874 validator bundle', () => {
  const pcn874Src = (dir) => join(dir, '..', 'pcn874', 'src');

  it('a bundle edited by hand stops the build, preview included', () => {
    const dir = fresh();
    fillContact(dir);
    editIn(dir, 'src/vendor/pcn874/validate.js', (s) => `${s}\n// edited by hand\n`);
    for (const args of [[], ['--preview']]) {
      const r = runBuild(dir, ...args);
      expect(r.status, args.join(' ')).toBe(1);
      expect(r.stderr).toMatch(/pcn874 validator bundle/);
      expect(r.stderr).toMatch(/src\/vendor\/pcn874\/validate\.js differs/);
    }
    expect(existsSync(join(dir, '_site'))).toBe(false);
  });

  it('a change in products/pcn874/src that was not re-bundled stops the build', () => {
    const dir = fresh();
    fillContact(dir);
    const layout = join(pcn874Src(dir), 'layout.ts');
    writeFileSync(layout, `${readFileSync(layout, 'utf8')}\n// a new rule\n`);
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/src\/vendor\/pcn874\/layout\.js differs/);
    expect(r.stderr).toContain('node scripts/bundle-pcn874.js');
  });

  it('a build with no products/pcn874/src next to it refuses rather than ship an unchecked copy', () => {
    const dir = fresh();
    fillContact(dir);
    rmSync(pcn874Src(dir), { recursive: true, force: true });
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/pcn874\/src\/sources\.ts cannot be read/);
    expect(existsSync(join(dir, '_site'))).toBe(false);
  });
});

describe('the deploy configuration', () => {
  const settings = readFileSync(join(productRoot, 'netlify.toml'), 'utf8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n');

  it('publishes _site/ from the plain build, never the preview', () => {
    expect(settings).toMatch(/^\s*publish = "_site"$/m);
    expect(settings).toMatch(/^\s*command = "node scripts\/build-site\.js"$/m);
    expect(settings).not.toContain('--preview');
    expect(settings).not.toContain('_preview');
  });

  it('builds on Node 22, which the pcn874 bundle needs (module.stripTypeScriptTypes, 22.13+)', () => {
    expect(settings).toMatch(/^\[build\.environment\]\s*\n\s*NODE_VERSION = "22"$/m);
  });
});
