// Build tests run against a throwaway copy of the product, never the real tree:
// a refused publish deletes _site/, and vitest runs test files in parallel, so
// two files building in place would race each other.
import { mkdtempSync, cpSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const productRoot = fileURLToPath(new URL('../..', import.meta.url));

const SKIP = new Set(['node_modules', '_site', '_preview', '.netlify', 'tests']);

/** A copy of everything the build reads (pages, assets, src, scripts, package.json, ...). */
export function copyProduct() {
  const dir = mkdtempSync(join(tmpdir(), 'il-biz-tools-'));
  cpSync(productRoot, dir, {
    recursive: true,
    filter: (src) => !SKIP.has(relative(productRoot, src).split(sep)[0]),
  });
  return dir;
}

export const removeCopy = (dir) => rmSync(dir, { recursive: true, force: true });

/** Run scripts/build-site.js inside a copy. */
export function runBuild(dir, ...args) {
  const r = spawnSync(process.execPath, [join(dir, 'scripts/build-site.js'), ...args], { encoding: 'utf8' });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

/** Every file under dir, as paths relative to it with forward slashes. */
export function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(relative(dir, p).split(sep).join('/'));
    }
  };
  walk(dir);
  return out.sort();
}

export const readIn = (dir, path) => readFileSync(join(dir, path), 'utf8');
export const editIn = (dir, path, fn) => writeFileSync(join(dir, path), fn(readIn(dir, path)), 'utf8');

/** The marked contact placeholder in the accessibility statement. */
export const CONTACT_PLACEHOLDER = /<p\b[^>]*data-publish-blocker="accessibility-contact"[^>]*>[\s\S]*?<\/p>/;

/**
 * A contact of the shape the publish gate accepts, for test copies only.
 *
 * *.netlify.app has no mail service, so this address can never reach a person:
 * it is well-formed, it is on the product's own planned host, and it names
 * nobody. It is written only into throwaway copies and never ships.
 */
export const TEST_CONTACT_ADDRESS = 'test-only@il-biz-tools.netlify.app';
export const TEST_CONTACT_LINK = `<a data-a11y-contact href="mailto:${TEST_CONTACT_ADDRESS}">${TEST_CONTACT_ADDRESS}</a>`;

/** The statement's placeholder paragraph swapped for `replacement` (default: a well-formed test contact). */
export function statementWithContact(html, replacement = `<p>פניות בנושא נגישות: ${TEST_CONTACT_LINK}</p>`) {
  const next = html.replace(CONTACT_PLACEHOLDER, replacement);
  if (next === html) throw new Error('contact placeholder not found in accessibility.html');
  return next;
}

/** Stand in for the real contact the owner has not provided, so a copy can take the publish path. */
export function fillContact(dir, replacement) {
  editIn(dir, 'accessibility.html', (html) => statementWithContact(html, replacement));
}
