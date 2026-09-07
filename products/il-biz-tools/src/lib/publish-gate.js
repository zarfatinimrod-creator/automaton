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
 *   - index.html and 404.html carry copy, not calculators.
 */
export const PAGE_RATE_SOURCES = {
  'index.html': [],
  'vat.html': ['src/config/vat.json'],
  'osek-patur.html': ['src/config/osek-patur.json'],
  'net-salary.html': ['src/config/tax-2026.json'],
  'invoice.html': ['src/config/vat.json'],
  'allocation.html': ['src/config/allocation-number.json'],
  'registrar-fee.html': [],
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
  © <span data-year>2026</span> כלים לעסק · המידע באתר אינו מהווה ייעוץ מס או ייעוץ משפטי.
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
