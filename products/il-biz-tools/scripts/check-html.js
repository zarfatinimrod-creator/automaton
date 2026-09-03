// Sanity checks for the static pages: title, description, canonical, FAQ JSON-LD, RTL, referenced files exist.
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const pages = ['index.html', 'vat.html', 'osek-patur.html', 'net-salary.html', 'invoice.html'];
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
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
for (const p of pages.filter((x) => x !== 'index.html')) if (!sitemap.includes(p)) fail('sitemap.xml', `missing ${p}`);
if (failures) { console.error(`${failures} problem(s)`); process.exit(1); }
console.log('all pages ok');
