// Copy only the files the public site needs into _site/, and refuse to publish
// a page whose figures nobody has verified.
//
// Netlify publishing "." served package.json, README.md, tests/ and scripts/ to
// anyone who guessed the URL. The redirect rules only masked those paths; the
// files were still uploaded. An explicit allowlist is the honest fix, and it
// keeps local development working by opening index.html directly - nothing in
// the source tree moves.
//
// The second job is the unverified-rate gate (src/lib/publish-gate.js). A page
// listed against a config carrying `"verified": false` does not reach _site/:
// a short notice with no figures ships in its place, and the URL is dropped
// from the sitemap that ships. The source tree is untouched, so `npm run serve`
// and the tests still see the real page and flipping one JSON flag republishes
// it. Today that gate withholds net-salary.html, because tax-2026.json has said
// `verified: false` since the day it was written.
import { cp, mkdir, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PAGE_RATE_SOURCES,
  publishPlan,
  unregisteredPages,
  withheldPageHtml,
  filterSitemap,
} from '../src/lib/publish-gate.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '_site');

const DIRS = ['assets', 'src/lib', 'src/config'];
const FILES = ['robots.txt', 'netlify.toml'];

const pages = (await readdir(root)).filter((name) => name.endsWith('.html')).sort();

// A page nobody classified is a page nobody decided about. Rather than guess in
// either direction, stop and make someone add the line.
const unregistered = unregisteredPages(pages, PAGE_RATE_SOURCES);
if (unregistered.length) {
  console.error(
    `refusing to build: ${unregistered.join(', ')} not listed in PAGE_RATE_SOURCES ` +
      '(src/lib/publish-gate.js). Add each page with the config files whose figures it renders, ' +
      'or an empty list if it renders none.',
  );
  process.exit(1);
}

const configPaths = [...new Set(Object.values(PAGE_RATE_SOURCES).flat())];
const configs = {};
for (const path of configPaths) {
  try {
    configs[path] = JSON.parse(await readFile(join(root, path), 'utf8'));
  } catch (e) {
    console.error(`  ! cannot read ${path} (${e.message}) - every page using it will be withheld`);
    configs[path] = undefined;
  }
}

const { publish, withhold } = publishPlan(pages, configs);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const page of publish) await cp(join(root, page), join(out, page));

for (const { page, unverified } of withhold) {
  const source = await readFile(join(root, page), 'utf8');
  const title = (/<title>([^<]*)<\/title>/.exec(source)?.[1] ?? page).split('–')[0].trim();
  await writeFile(join(out, page), withheldPageHtml({ page, title, unverified }), 'utf8');
}

for (const dir of DIRS) {
  if (existsSync(join(root, dir))) await cp(join(root, dir), join(out, dir), { recursive: true });
}
for (const file of FILES) {
  if (existsSync(join(root, file))) await cp(join(root, file), join(out, file));
}

// The sitemap that ships lists only what shipped.
if (existsSync(join(root, 'sitemap.xml'))) {
  const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
  await writeFile(join(out, 'sitemap.xml'), filterSitemap(sitemap, withhold.map((w) => w.page)), 'utf8');
}

const published = await readdir(out);
console.log(`built _site/ with: ${published.join(', ')}`);
if (withhold.length) {
  for (const { page, unverified } of withhold) {
    console.log(`  withheld ${page}: unverified source(s) ${unverified.join(', ')} - a notice with no figures shipped instead`);
  }
} else {
  console.log('  no page withheld: every rate a page renders is flagged verified');
}
