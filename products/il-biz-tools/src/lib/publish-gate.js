// The unverified-rate gate.
//
// MISSION rule 4: never publish an unverified legal figure. Until now that rule
// was kept by hand - `tax-2026.json` carries `"verified": false`, the net-salary
// page wears an "אומדן" badge, and everybody hoped the badge was enough. The
// board's ruling on this product is stricter and it is the honest one: a page
// whose numbers nobody has checked against a primary source does not go on the
// public site at all.
//
// So the build asks this module, per page, "does anything you render come from
// a source flagged unverified?" - and when the answer is yes the page is
// withheld from _site/ and replaced by a short notice that carries no figures.
// The source tree does not move: `npm run serve` and every test still see the
// real page, so the day a rate is confirmed the only change is one JSON flag.
//
// Fail closed: a page listing a config that cannot be read is withheld too.
//
// Two more jobs live here since the config leak (build-site.js used to copy
// src/config/ into _site/ whole, unverified files included):
//   - CONFIG_PUBLISH_RULES decides, per config file, whether and in what shape
//     it may reach _site/ once a shipped page's code loads it. A config with no
//     rule never ships.
//   - publishBlockers() finds what must stop a publish outright: a marked
//     placeholder (data-publish-blocker) left in any shipped page, or a
//     required page - the accessibility statement - missing from the build.

/**
 * Which config files each page renders FIGURES from.
 *
 * An empty list means "renders no figure from any rate file" and is a claim
 * this repo tests, not a shortcut:
 *   - registrar-fee.html reads src/config/registrar-fee.json for DATES only.
 *     Its shekel amounts are unverified against any primary source, so the page
 *     prints none of them - feeAmountDisclosure() in src/lib/registrar-fee.js
 *     refuses to hand them out while `verified` is false, and a test asserts
 *     the built page contains no shekel amount from that file.
 *   - index.html, accessibility.html and 404.html carry copy, not calculators.
 */
export const PAGE_RATE_SOURCES = {
  'index.html': [],
  'vat.html': ['src/config/vat.json'],
  'osek-patur.html': ['src/config/osek-patur.json'],
  'net-salary.html': ['src/config/tax-2026.json'],
  'invoice.html': ['src/config/vat.json'],
  'allocation.html': ['src/config/allocation-number.json'],
  'registrar-fee.html': [],
  'accessibility.html': [],
  '404.html': [],
};

/** A config is publishable only if it says so explicitly. Anything else fails closed. */
export function isVerified(config) {
  return config?.verified === true;
}

/**
 * The sources a page depends on that are not verified.
 * `configs` maps a config path to its parsed contents (or undefined if unreadable).
 */
export function unverifiedSourcesFor(page, configs, map = PAGE_RATE_SOURCES) {
  const sources = map[page] ?? [];
  return sources.filter((path) => !isVerified(configs?.[path]));
}

/** Pages the map says nothing about. The build stops rather than guess for them. */
export function unregisteredPages(pages, map = PAGE_RATE_SOURCES) {
  return pages.filter((page) => !Object.prototype.hasOwnProperty.call(map, page));
}

/**
 * Split the page list into what ships and what is withheld.
 * @returns {{publish: string[], withhold: {page: string, unverified: string[]}[]}}
 */
export function publishPlan(pages, configs, map = PAGE_RATE_SOURCES) {
  const publish = [];
  const withhold = [];
  for (const page of pages) {
    const unverified = unverifiedSourcesFor(page, configs, map);
    if (unverified.length) withhold.push({ page, unverified });
    else publish.push(page);
  }
  return { publish, withhold };
}

/**
 * The page that ships in place of a withheld one.
 *
 * It states plainly why there are no numbers on it, links back to the tools
 * that do have checked numbers, and asks search engines not to index it -
 * a placeholder competing for the same query would be worse than nothing.
 * It deliberately contains no figure of any kind.
 */
export function withheldPageHtml({ page, title = 'הדף אינו זמין', unverified = [] } = {}) {
  const sources = unverified.map((s) => s.split('/').pop()).join(', ');
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} – לא מאומת</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="הדף הזה אינו מתפרסם כרגע: הנתונים שבו לא אומתו מול המקור הרשמי.">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<header class="site-header"><div class="container">
  <a class="logo" href="./">כלים <span>לעסק</span></a>
</div></header>
<main class="container">
  <h1>${title} <span class="badge warn">לא מאומת</span></h1>
  <div class="status-box warn">
    <strong>הדף הזה אינו מתפרסם כרגע.</strong>
    הנתונים שהוא מציג לא אומתו מול המקור הרשמי, ולכן בחרנו לא להציג אותם בכלל –
    עדיף בלי מספר מאשר מספר שאיש לא בדק.
  </div>
  <p>הדף יחזור מיד כשהנתונים יאומתו מול המקור הרשמי. עד אז אין כאן שום סכום, שיעור או תוצאה.</p>
  <p class="note">קובץ הנתונים הממתין לאימות: ${sources || 'לא צוין'} (${page}).</p>
  <p><a href="./">חזרה לכלים שכן מאומתים</a></p>
</main>
<footer class="site-footer"><div class="container">
  © <span data-year>2026</span> כלים לעסק · המידע באתר אינו מהווה ייעוץ מס או ייעוץ משפטי. · <a href="accessibility.html">הצהרת נגישות</a>
</div></footer>
</body>
</html>
`;
}

/** Drop the withheld pages from the sitemap that ships. */
export function filterSitemap(xml, withheldPages = []) {
  let out = String(xml ?? '');
  for (const page of withheldPages) {
    out = out
      .split('\n')
      .filter((line) => !(line.includes('<loc>') && line.includes(`/${page}`)))
      .join('\n');
  }
  return out;
}

/**
 * How each config file may reach _site/ once a shipped page's code loads it
 * (the build finds that out by following imports and fetches: src/lib/site-deps.js).
 *
 *   'verified'    ships only while `"verified": true`. If a shipped page loads
 *                 it while it is not, PAGE_RATE_SOURCES is wrong about that page
 *                 and the build stops rather than ship the file.
 *   'no-figures'  carries no legal or tax figure (site metadata); ships as is.
 *   { unverifiedFields: [...] }
 *                 ships whole once verified; until then only the listed
 *                 top-level keys ship, written into a fresh file, and every
 *                 other key - the amounts, the notes, the internal sources - is
 *                 dropped. registrar-fee.html needs the dates and the two flags
 *                 that make feeAmountDisclosure() print no amount; it never
 *                 needs the amounts, so they never leave the repo.
 *
 * A config with no entry here does not ship, and a shipped page that needs one
 * stops the build: nobody decided about it.
 */
export const CONFIG_PUBLISH_RULES = {
  'src/config/vat.json': 'verified',
  'src/config/osek-patur.json': 'verified',
  'src/config/tax-2026.json': 'verified',
  'src/config/allocation-number.json': 'verified',
  'src/config/registrar-fee.json': { unverifiedFields: ['verified', 'renderAmounts', 'updated', 'deadline'] },
  'src/config/site.json': 'no-figures',
};

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => has(obj, k)).map((k) => [k, obj[k]]));

/**
 * Decide what each config the shipped pages load goes out as.
 *
 * @param {string[]} neededPaths  config paths the shipped pages load
 * @param {Record<string, object|undefined>} configs  parsed contents (undefined if unreadable)
 * @returns {{ship: {path: string, content: object, projected: boolean}[], refuse: {path: string, reason: string}[]}}
 *   Any refusal means the build must stop.
 */
export function configShipPlan(neededPaths, configs, rules = CONFIG_PUBLISH_RULES) {
  const ship = [];
  const refuse = [];
  for (const path of [...new Set(neededPaths)].sort()) {
    const rule = has(rules, path) ? rules[path] : undefined;
    const config = configs?.[path];
    if (rule === undefined) {
      refuse.push({ path, reason: 'no entry in CONFIG_PUBLISH_RULES (src/lib/publish-gate.js)' });
    } else if (!config || typeof config !== 'object' || Array.isArray(config)) {
      refuse.push({ path, reason: 'cannot be read as a JSON object' });
    } else if (rule === 'no-figures' || isVerified(config)) {
      ship.push({ path, content: config, projected: false });
    } else if (Array.isArray(rule?.unverifiedFields)) {
      ship.push({ path, content: pick(config, rule.unverifiedFields), projected: true });
    } else if (rule === 'verified') {
      refuse.push({
        path,
        reason: '"verified" is not true, yet a shipped page loads it - list it in PAGE_RATE_SOURCES for that page',
      });
    } else {
      refuse.push({ path, reason: `unknown rule ${JSON.stringify(rule)}` });
    }
  }
  return { ship, refuse };
}

/** Pages the public site may not go out without. */
export const REQUIRED_PAGES = ['accessibility.html'];

/**
 * What must stop a publish outright.
 *
 * A placeholder is marked in the page source with `data-publish-blocker="<id>"`
 * on the element that holds it. Marking is the point: an unmarked placeholder
 * is a guess that ships; a marked one is a promise that the site does not go
 * out until someone replaces it with the real thing.
 *
 * @param {{path: string, html: string}[]} shipped  every HTML page that would ship
 * @returns {{path: string, blocker: string}[]}
 */
export function publishBlockers(shipped, required = REQUIRED_PAGES) {
  const found = [];
  const paths = new Set(shipped.map((p) => p.path));
  for (const page of required) {
    if (!paths.has(page)) found.push({ path: page, blocker: 'required page is missing from the build' });
  }
  for (const { path, html } of shipped) {
    for (const m of String(html ?? '').matchAll(/\sdata-publish-blocker\s*=\s*["']([^"']*)["']/g)) {
      found.push({ path, blocker: `placeholder "${m[1]}" is still in the page` });
    }
  }
  return found;
}
