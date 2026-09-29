// Build the public site into _site/: only what the shipped pages load, no page
// whose figures nobody verified, and nothing at all while a publish blocker stands.
//
// Netlify publishing "." served package.json, README.md, tests/ and scripts/ to
// anyone who guessed the URL, so the build became an allowlist. The allowlist
// then copied src/lib/ and src/config/ whole, which put tax-2026.json
// ("verified": false) and the unverified registrar-fee amounts at /src/config/
// although no published page rendered them. Now nothing is copied by folder:
//
//   1. Pages. Every *.html must be classified in PAGE_RATE_SOURCES
//      (src/lib/publish-gate.js). A page that renders figures from a config not
//      flagged `"verified": true` is withheld: a short notice with no figures
//      ships at its URL and the sitemap drops it.
//   2. Files. The build follows every local reference from the HTML that will
//      ship (src/lib/site-deps.js) and copies exactly those files. A withheld
//      page's notice loads only the stylesheet, so nothing its real page would
//      have loaded is reached.
//   3. Configs. Each JSON file reached goes through CONFIG_PUBLISH_RULES: whole
//      if verified (or not a figure file), cut down to named keys where a rule
//      allows it (registrar-fee.json ships its dates, never its amounts), and a
//      stopped build otherwise. A JSON file with no rule never ships.
//   0. The pcn874 bundle and rule reference. pcn874.html runs products/pcn874's validator,
//      type-stripped into src/vendor/pcn874/ (src/lib/pcn874-bundle.js). The
//      build regenerates it from products/pcn874/src and stops, preview too,
//      if the committed copy differs or that source is missing. The page's rule
//      reference is generated from the validator's rule table and stops the
//      build the same way when it is stale (src/lib/pcn874-rule-reference.js).
//   4. Blockers. A placeholder in any shipped page (its data-publish-blocker
//      marker however written, or its words), a missing accessibility
//      statement, a statement with no real contact link (data-a11y-contact),
//      or a failing check in src/lib/a11y-check.js refuses the publish.
//
// Fail closed: a refused build exits 1 and deletes _site/, so no stale copy is
// left for anyone to upload by hand. `--preview` builds the same tree into
// _preview/ (never _site/) and reports the blockers instead of stopping, so the
// output can be inspected before the blockers are cleared.
//
// The source tree does not move: `npm run serve` and the tests still see every
// real page, and flipping one JSON flag republishes a withheld one.
import { cp, mkdir, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PAGE_RATE_SOURCES,
  publishPlan,
  unregisteredPages,
  withheldPageHtml,
  filterSitemap,
  configShipPlan,
  publishBlockers,
} from '../src/lib/publish-gate.js';
import { collectDependencies } from '../src/lib/site-deps.js';
import { bundleProblems, fsBundleAccess } from '../src/lib/pcn874-bundle.js';
import { ruleReferenceProblems } from '../src/lib/pcn874-rule-reference.js';
import { checkPageA11y, checkStylesheetA11y } from '../src/lib/a11y-check.js';
import { proButtonState } from '../src/lib/gumroad.js';
import { withProPrice } from '../src/lib/pro-offer.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const unknown = args.filter((a) => a !== '--preview');
if (unknown.length) {
  console.error(`unknown argument(s): ${unknown.join(' ')} (the only option is --preview)`);
  process.exit(2);
}
const preview = args.includes('--preview');
const siteDir = join(root, '_site');
const out = preview ? join(root, '_preview') : siteDir;

// Always shipped, never referenced by a page.
const FILES = ['robots.txt', 'netlify.toml'];

function refuse(reason, details) {
  // A refused publish must not leave an older _site/ behind to be deployed by hand.
  if (!preview) rmSync(siteDir, { recursive: true, force: true });
  console.error(`refusing to build: ${reason}`);
  for (const line of details) console.error(`  - ${line}`);
  process.exit(1);
}

const readText = (path) => {
  const file = join(root, path);
  return existsSync(file) && statSync(file).isFile() ? readFileSync(file, 'utf8') : null;
};

// 1. Pages.
const pages = (await readdir(root)).filter((name) => name.endsWith('.html')).sort();

// A page nobody classified is a page nobody decided about. Rather than guess in
// either direction, stop and make someone add the line.
const unregistered = unregisteredPages(pages, PAGE_RATE_SOURCES);
if (unregistered.length) {
  refuse('page(s) not listed in PAGE_RATE_SOURCES (src/lib/publish-gate.js)', [
    ...unregistered,
    'add each page with the config files whose figures it renders, or an empty list if it renders none',
  ]);
}

// The validator page runs products/pcn874's own code. Regenerate that bundle
// from products/pcn874/src and stop - preview included - if the committed copy
// differs or the source is not there to regenerate it from: a page running a
// validator nobody tested is worse than no page.
const bundle = bundleProblems(fsBundleAccess(root));
if (bundle.length) {
  refuse('the pcn874 validator bundle does not match products/pcn874/src (run: node scripts/bundle-pcn874.js)', bundle);
}

// The page's rule reference is generated from that validator's rule table
// (src/lib/pcn874-rule-reference.js). A page listing rules the tool does not
// run, or missing one it does, stops the build, preview included.
const ruleReference = ruleReferenceProblems(readText('pcn874.html') ?? '');
if (ruleReference.length) {
  refuse('the PCN874 rule reference on pcn874.html does not match the validator (run: node scripts/pcn874-rule-reference.js)', ruleReference);
}

const rateConfigs = {};
for (const path of [...new Set(Object.values(PAGE_RATE_SOURCES).flat())]) {
  try {
    rateConfigs[path] = JSON.parse(await readFile(join(root, path), 'utf8'));
  } catch (e) {
    console.error(`  ! cannot read ${path} (${e.message}) - every page using it will be withheld`);
    rateConfigs[path] = undefined;
  }
}

const { publish, withhold } = publishPlan(pages, rateConfigs);

const shipped = [];
for (const page of publish) shipped.push({ path: page, html: await readFile(join(root, page), 'utf8') });
for (const { page, unverified } of withhold) {
  const source = await readFile(join(root, page), 'utf8');
  const title = (/<title>([^<]*)<\/title>/.exec(source)?.[1] ?? page).split('–')[0].trim();
  shipped.push({ path: page, html: withheldPageHtml({ page, title, unverified }) });
}

// 1b. The price in the pricing FAQ. Only Gumroad's read-back price, and only once
// the Pro button is `ready` (src/lib/gumroad.js); until then the answers carry no
// amount. A FAQ answer whose JSON-LD twin drifted from it stops the build, preview
// too (src/lib/pro-offer.js).
let proPrice = null;
try {
  proPrice = proButtonState(JSON.parse(readFileSync(join(root, 'src/config/site.json'), 'utf8'))).price;
} catch (e) {
  console.error(`  ! cannot read src/config/site.json (${e.message}) - no price goes into the FAQ`);
}
for (const page of shipped) {
  try {
    page.html = withProPrice(page.html, proPrice);
  } catch (e) {
    refuse('the pricing FAQ and its JSON-LD disagree', [`${page.path}: ${e.message}`]);
  }
}

// 2. Files the shipped pages load.
const deps = collectDependencies(shipped, readText);
if (deps.errors.length) refuse('a shipped page references something the build cannot ship', deps.errors);

// 3. Configs among them.
const neededConfigs = deps.files.filter((f) => f.endsWith('.json'));
const parsed = {};
for (const path of neededConfigs) {
  try {
    parsed[path] = JSON.parse(readText(path));
  } catch {
    parsed[path] = undefined;
  }
}
const configs = configShipPlan(neededConfigs, parsed);
if (configs.refuse.length) {
  refuse(
    'a shipped page loads a config the gate does not allow',
    configs.refuse.map(({ path, reason }) => `${path}: ${reason}`),
  );
}

// 4. Blockers: marked placeholders, the required statement, the accessibility checks.
const blockers = publishBlockers(shipped).map(({ path, blocker }) => `${path}: ${blocker}`);
for (const { path, html } of shipped) {
  for (const p of checkPageA11y(html)) blockers.push(`${path}: accessibility check "${p.check}" failed - ${p.message}`);
}
for (const css of deps.files.filter((f) => f.endsWith('.css'))) {
  for (const p of checkStylesheetA11y(readText(css)).problems) {
    blockers.push(`${css}: accessibility check "${p.check}" failed - ${p.message}`);
  }
}
if (blockers.length && !preview) {
  refuse('the site is not ready to publish (run with --preview to build _preview/ and inspect it anyway)', blockers);
}

// Write.
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const { path, html } of shipped) await writeFile(join(out, path), html, 'utf8');

for (const path of deps.files.filter((f) => !f.endsWith('.json'))) {
  await mkdir(dirname(join(out, path)), { recursive: true });
  await cp(join(root, path), join(out, path));
}
for (const { path, content, projected } of configs.ship) {
  await mkdir(dirname(join(out, path)), { recursive: true });
  if (projected) await writeFile(join(out, path), `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  else await cp(join(root, path), join(out, path));
}
for (const file of FILES) {
  if (existsSync(join(root, file))) await cp(join(root, file), join(out, file));
}

// The sitemap that ships lists only what shipped.
if (existsSync(join(root, 'sitemap.xml'))) {
  const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
  await writeFile(join(out, 'sitemap.xml'), filterSitemap(sitemap, withhold.map((w) => w.page)), 'utf8');
}

const label = preview ? '_preview/ (NOT the deploy directory)' : '_site/';
console.log(`built ${label} with ${shipped.length} page(s) and ${deps.files.length} loaded file(s):`);
for (const path of deps.files) {
  const config = configs.ship.find((c) => c.path === path);
  console.log(`  ${path}${config?.projected ? `  (unverified: only ${Object.keys(config.content).join(', ')} shipped)` : ''}`);
}
if (withhold.length) {
  for (const { page, unverified } of withhold) {
    console.log(`  withheld ${page}: unverified source(s) ${unverified.join(', ')} - a notice with no figures shipped instead`);
  }
} else {
  console.log('  no page withheld: every rate a page renders is flagged verified');
}
if (preview && blockers.length) {
  console.log(`preview only: a publish build would refuse on ${blockers.length} blocker(s):`);
  for (const line of blockers) console.log(`  - ${line}`);
}
