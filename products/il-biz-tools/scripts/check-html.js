// Sanity checks for the static pages: title, description, canonical, FAQ JSON-LD, RTL, referenced files exist.
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { PAGE_RATE_SOURCES, publishPlan, unregisteredPages } from '../src/lib/publish-gate.js';

const root = new URL('..', import.meta.url).pathname;
const pages = ['index.html', 'vat.html', 'osek-patur.html', 'net-salary.html', 'invoice.html', 'allocation.html', 'registrar-fee.html'];
let failures = 0;
const fail = (p, msg) => { failures++; console.error(`  x ${p}: ${msg}`); };

for (const p of pages) {
  const html = await readFile(join(root, p), 'utf8');
  if (!/<html[^>]*lang="he"[^>]*dir="rtl"/.test(html)) fail(p, 'missing lang="he" dir="rtl"');
  if (!/<title>[^<]{5,}<\/title>/.test(html)) fail(p, 'missing <title>');
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) fail(p, 'missing meta description');
  if (!/<link rel="canonical"/.test(html)) fail(p, 'missing canonical');
  if (!/application\/ld\+json/.test(html) || !/"FAQPage"/.test(html)) fail(p, 'missing FAQPage JSON-LD');
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { fail(p, `invalid JSON-LD: ${e.message}`); }
  }
  for (const m of html.matchAll(/(?:src|href)="((?:assets|src)\/[^"]+)"/g)) {
    try { await access(join(root, m[1])); } catch { fail(p, `missing file ${m[1]}`); }
  }
  console.log(`  ok ${p}`);
}
// Every class a page uses must be defined in the stylesheet.
//
// allocation.html shipped with a header, footer and table markup the site CSS
// does not define. Every check above passed and the page still rendered as
// unstyled text, because nothing here compared the markup to the stylesheet.
const css = await readFile(join(root, 'assets/style.css'), 'utf8');
const defined = new Set([...css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]));
// Classes applied at runtime by page scripts, not present in any HTML source.
for (const file of ['common.js', 'page-vat.js', 'page-osek-patur.js', 'page-net-salary.js', 'page-invoice.js', 'page-allocation.js', 'page-registrar-fee.js']) {
  try {
    const js = await readFile(join(root, 'assets', file), 'utf8');
    for (const m of js.matchAll(/class(?:Name|List)[^\n]*?['"`]([^'"`]+)['"`]/g)) {
      for (const c of m[1].split(/\s+/)) if (c) defined.add(c);
    }
  } catch { /* a page without its own script is fine */ }
}

for (const p of pages) {
  const html = await readFile(join(root, p), 'utf8');
  const used = new Set();
  for (const m of html.matchAll(/\sclass="([^"]+)"/g)) for (const c of m[1].split(/\s+/)) if (c) used.add(c);
  const orphans = [...used].filter((c) => !defined.has(c));
  if (orphans.length) fail(p, `class(es) with no rule in style.css: ${orphans.join(', ')}`);
}

const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
for (const p of pages.filter((x) => x !== 'index.html')) if (!sitemap.includes(p)) fail('sitemap.xml', `missing ${p}`);

// The unverified-rate gate, reported here so `npm run check:html` says what the
// public site will actually contain. A page missing from the map is a failure -
// nobody decided about it. A withheld page is not: it is the gate working.
const allPages = [...pages, '404.html'];
const unregistered = unregisteredPages(allPages, PAGE_RATE_SOURCES);
for (const p of unregistered) fail(p, 'not listed in PAGE_RATE_SOURCES (src/lib/publish-gate.js)');

const configs = {};
for (const path of [...new Set(Object.values(PAGE_RATE_SOURCES).flat())]) {
  try { configs[path] = JSON.parse(await readFile(join(root, path), 'utf8')); } catch { configs[path] = undefined; }
}
const { withhold } = publishPlan(allPages.filter((p) => !unregistered.includes(p)), configs);
for (const { page, unverified } of withhold) {
  console.log(`  withheld from _site/: ${page} (unverified: ${unverified.join(', ')})`);
}

if (failures) { console.error(`${failures} problem(s)`); process.exit(1); }
console.log('all pages ok');
