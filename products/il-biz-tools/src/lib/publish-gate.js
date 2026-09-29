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
//   - publishBlockers() finds what must stop a publish outright: a placeholder
//     left in any shipped page (its data-publish-blocker marker written any
//     way, or its words), a required page - the accessibility statement -
//     missing from the build, or a statement without a real contact link
//     (data-a11y-contact). The contact is checked for being there, not only
//     the marker for being gone: deleting the marker must not clear the gate.
//   - aiDeclarationProblems() and figureSourceProblems() keep the AI declaration
//     (src/lib/ai-declaration.js) on every shipped page's footer, and keep the
//     three figure pages its FAQ answer names carrying their source lines.

import { AI_DECLARATION, AI_DECLARATION_ATTR, AI_DECLARATION_HTML, FIGURE_SOURCE_PAGES, FIGURES_SOURCE_SENTENCE } from './ai-declaration.js';

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
 *   - pcn874.html validates a file's STRUCTURE with products/pcn874's own
 *     rules and prints no rate or amount from src/config (see its entry).
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
  // pcn874.html renders no figure from any file in src/config. Its rules - and
  // the two thresholds its findings quote, 5,000 shekels for an identified sale
  // and the petty-cash cap - are products/pcn874's own, each cited to the Tax
  // Authority circular by line and tested there; the page runs that code
  // bundled (src/lib/pcn874-bundle.js), and the build refuses a stale bundle.
  'pcn874.html': [],
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
  ${AI_DECLARATION_HTML}
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
 * The page that must carry the contact for accessibility requests, and the
 * attribute that marks it. The contact is the `<a>` element itself:
 *
 *   <a data-a11y-contact href="mailto:name@brand-domain.tld">name@brand-domain.tld</a>
 *
 * (an https: form page or a tel: number work the same way).
 */
export const CONTACT_PAGE = 'accessibility.html';
export const CONTACT_ATTR = 'data-a11y-contact';

/** The marker a placeholder wears in the page source. */
export const BLOCKER_ATTR = 'data-publish-blocker';

/**
 * Words that mean "this is a placeholder" in this site's Hebrew copy. The
 * statement's placeholder says both; a page that ships either one ships a
 * placeholder, marker or not.
 */
export const PLACEHOLDER_PHRASES = ['ממלא מקום', 'לא לפרסום'];

// ---------------------------------------------------------------------------
// Reading the HTML. Regex-level, like the rest of the build (no parser is a
// dependency here); every doubt below resolves to "blocked".

const NAMED_ENTITIES = { amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>', commat: '@', colon: ':', period: '.', sol: '/' };
const codePoint = (n) => (Number.isInteger(n) && n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '');
const decodeEntities = (s) =>
  String(s)
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => codePoint(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_, d) => codePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);

// Soft hyphen, zero-width characters, bidi marks and embeddings, word joiner, BOM.
const INVISIBLE = /[­​-‏‪-‮⁠-⁤﻿]/g;
/** Text as a reader sees it: entities decoded, invisible characters gone, any run of whitespace one space. */
const normalizeText = (s) => decodeEntities(s).replace(INVISIBLE, '').replace(/\s+/g, ' ').trim();
const stripTags = (s) => String(s).replace(/<[^>]*>/g, ' ');

/** A phrase matched across any whitespace, maqaf or dash between its words. */
const phrasePattern = (phrase) =>
  new RegExp(phrase.split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s\\u05be\\u2010-\\u2015_-]+'));

/** A tag, with `>` allowed inside quoted attribute values. */
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/** Attributes of one tag, names lower-cased; a valueless attribute maps to ''. The first of a repeated name wins, as in a browser. */
function parseAttrs(text) {
  const attrs = new Map();
  for (const m of String(text).matchAll(ATTR)) {
    const name = m[1].toLowerCase();
    if (!attrs.has(name)) attrs.set(name, m[2] ?? m[3] ?? m[4] ?? '');
  }
  return attrs;
}

/** Markup a visitor can actually see: comments and script, style, template and noscript content removed. */
const renderedMarkup = (html) =>
  String(html ?? '')
    .replace(/<!--[\s\S]*?(?:-->|$)/g, '')
    .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, '');

const hides = (attrs) =>
  attrs.has('hidden') ||
  attrs.has('inert') ||
  (attrs.get('aria-hidden') ?? '').trim().toLowerCase() === 'true' ||
  /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|content-visibility\s*:\s*hidden)/i.test(attrs.get('style') ?? '');

/** Every start tag with the open elements around it. Unclosed elements stay open, which can only add ancestors. */
function startTags(markup) {
  const out = [];
  const stack = [];
  for (const m of markup.matchAll(TAG)) {
    const [raw, closing, rawName, attrText] = m;
    const name = rawName.toLowerCase();
    if (closing) {
      const at = stack.map((e) => e.name).lastIndexOf(name);
      if (at !== -1) stack.length = at;
      continue;
    }
    const el = { name, attrs: parseAttrs(attrText), start: m.index, end: m.index + raw.length };
    out.push({ ...el, ancestors: [...stack] });
    if (!VOID.has(name) && !/\/\s*$/.test(attrText)) stack.push(el);
  }
  return out;
}

// ---------------------------------------------------------------------------
// The contact.

// RFC 2606 / RFC 6761 names that can never be anybody's real contact.
const RESERVED_DOMAIN = /(?:^|\.)(?:example|test|invalid|localhost|local)$|(?:^|\.)example\.(?:com|net|org)$/;

function domainProblem(host) {
  const h = String(host).toLowerCase().replace(/\.$/, '');
  if (!/^[a-z0-9.-]+$/.test(h) || !/\.(?:[a-z]{2,}|xn--[a-z0-9-]+)$/.test(h)) return `"${host}" is not a public domain name`;
  if (RESERVED_DOMAIN.test(h)) return `"${host}" is a reserved example/test domain, not a real contact`;
  return null;
}

/**
 * Why an href cannot be the accessibility contact, or null if it can.
 * Accepted: mailto: with exactly one address at a public domain, https: at a
 * public domain, tel: with a full number (7 to 15 digits).
 */
export function contactHrefProblem(rawHref) {
  if (rawHref === undefined || rawHref === null) return 'has no href';
  const href = decodeEntities(rawHref).trim();
  if (!href) return 'has an empty href';
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(href)?.[1].toLowerCase();
  let rest;
  try {
    rest = decodeURIComponent(href.slice((scheme?.length ?? 0) + 1));
  } catch {
    return `href cannot be decoded: "${href.slice(0, 60)}"`;
  }
  if (scheme === 'mailto') {
    const address = rest.split('?')[0].trim();
    const m = /^[^\s@<>()[\]\\,;:"]+@([^\s@<>()[\]\\,;:"]+)$/.exec(address);
    if (!m) return `mailto: needs exactly one address like name@domain.tld, got "${address}"`;
    return domainProblem(m[1]);
  }
  if (scheme === 'https') {
    let url;
    try {
      url = new URL(href);
    } catch {
      return `https: link is not a valid URL: "${href.slice(0, 60)}"`;
    }
    if (url.username || url.password) return 'https: link carries credentials';
    return domainProblem(url.hostname);
  }
  if (scheme === 'tel') {
    if (!/^\+?\d{7,15}$/.test(rest.replace(/[\s\-().]/g, ''))) return `tel: needs a full phone number (7-15 digits), got "${rest}"`;
    return null;
  }
  return `must be a mailto:, https: or tel: link, got "${href.slice(0, 60)}"`;
}

/**
 * What is wrong with the contact on the statement page; empty means it has one.
 * Every element marked data-a11y-contact must be a good contact, and there must
 * be at least one.
 */
function contactProblems(html) {
  const markup = renderedMarkup(html);
  const marked = startTags(markup).filter((t) => t.attrs.has(CONTACT_ATTR));
  if (!marked.length) {
    return [
      `no accessibility contact: the page needs <a ${CONTACT_ATTR} href="mailto:|https:|tel:..."> with a real, brand-owned address inside <main>`,
    ];
  }
  const problems = [];
  for (const tag of marked) {
    const say = (why) => problems.push(`accessibility contact ${why}`);
    if (tag.name !== 'a') {
      say(`is marked on a <${tag.name}>; ${CONTACT_ATTR} goes on the <a> element itself`);
      continue;
    }
    const hrefProblem = contactHrefProblem(tag.attrs.get('href'));
    if (hrefProblem) say(hrefProblem);
    const close = markup.slice(tag.end).search(/<\/a\s*>/i);
    const text = normalizeText(stripTags(close === -1 ? '' : markup.slice(tag.end, tag.end + close)));
    if (close === -1) say('has no closing </a>');
    else if (!text) say('has no visible link text');
    if (hides(tag.attrs) || tag.ancestors.some((a) => hides(a.attrs))) say('is hidden (hidden, inert, aria-hidden or display:none on it or around it)');
    if (!tag.ancestors.some((a) => a.name === 'main')) say('is outside <main>');
  }
  return problems;
}

// ---------------------------------------------------------------------------

/**
 * What must stop a publish outright.
 *
 * A placeholder is marked in the page source with `data-publish-blocker="<id>"`
 * on the element that holds it. Marking is the point: an unmarked placeholder
 * is a guess that ships; a marked one is a promise that the site does not go
 * out until someone replaces it with the real thing.
 *
 * Removing the marker must not be enough to clear it, so there are three
 * independent checks and a publish needs all of them to pass:
 *   1. no page carries the marker, written any way HTML allows (quoted,
 *      unquoted, without a value, any letter case - and inside a comment too:
 *      the source ships, so the comment does);
 *   2. no page carries the placeholder's words (PLACEHOLDER_PHRASES), however
 *      they are spaced, split by tags or entity-encoded;
 *   3. the statement page (CONTACT_PAGE) has at least one visible
 *      `<a data-a11y-contact>` inside <main> with a real mailto:, https: or
 *      tel: address, and every element so marked is one.
 * And every page in `required` must be in the build.
 *
 * @param {{path: string, html: string}[]} shipped  every HTML page that would ship
 * @returns {{path: string, blocker: string}[]}
 */
export function publishBlockers(shipped, required = REQUIRED_PAGES, contactPage = CONTACT_PAGE) {
  const found = [];
  const paths = new Set(shipped.map((p) => p.path));
  for (const page of required) {
    if (!paths.has(page)) found.push({ path: page, blocker: 'required page is missing from the build' });
  }
  for (const { path, html } of shipped) {
    const source = String(html ?? '');

    // 1. The marker. Found by name anywhere in the source; the value, when
    //    there is one, only makes the message clearer.
    for (const m of source.matchAll(new RegExp(`${BLOCKER_ATTR}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?`, 'gi'))) {
      const id = m[1] ?? m[2] ?? m[3];
      found.push({ path, blocker: id ? `placeholder "${id}" is still in the page` : `a placeholder (${BLOCKER_ATTR}) is still in the page` });
    }

    // 2. The words, in the source as written and in the text a reader sees.
    const texts = [normalizeText(source), normalizeText(stripTags(source))];
    for (const phrase of PLACEHOLDER_PHRASES) {
      const pattern = phrasePattern(phrase);
      if (texts.some((t) => pattern.test(t))) found.push({ path, blocker: `placeholder text "${phrase}" is still in the page` });
    }

    // 3. The contact.
    if (path === contactPage) for (const blocker of contactProblems(source)) found.push({ path, blocker });
  }
  return found;
}

// ---------------------------------------------------------------------------
// The AI declaration (src/lib/ai-declaration.js).

const SITE_FOOTER = /(?:^|\s)site-footer(?:\s|$)/;

/**
 * What is wrong with a page's AI declaration; empty means the page carries it.
 *
 * The page needs at least one element marked `data-ai-declaration` inside its
 * `<footer class="site-footer">`, and every marked element must be there, read
 * as AI_DECLARATION word for word, and be visible (no hidden, inert,
 * aria-hidden or display:none on it or around it). Comments and script, style,
 * template and noscript content do not count: a visitor cannot see them.
 */
export function aiDeclarationProblems(html) {
  const markup = renderedMarkup(html);
  const tags = startTags(markup);
  const inFooter = (t) => t.ancestors.some((a) => a.name === 'footer' && SITE_FOOTER.test(a.attrs.get('class') ?? ''));
  if (!tags.some((t) => t.name === 'footer' && SITE_FOOTER.test(t.attrs.get('class') ?? ''))) {
    return ['no site footer: the AI declaration goes in <footer class="site-footer">'];
  }
  const marked = tags.filter((t) => t.attrs.has(AI_DECLARATION_ATTR));
  const problems = [];
  if (!marked.some(inFooter)) problems.push(`the AI declaration is missing from the site footer (<p ${AI_DECLARATION_ATTR}>${AI_DECLARATION}</p>)`);
  for (const tag of marked) {
    const say = (why) => problems.push(`the AI declaration ${why}`);
    if (!inFooter(tag)) say('is outside the site footer');
    const close = markup.slice(tag.end).search(new RegExp(`</${tag.name}\\s*>`, 'i'));
    const text = close === -1 ? '' : normalizeText(stripTags(markup.slice(tag.end, tag.end + close)));
    if (text !== AI_DECLARATION) say(`is altered: it reads "${text.slice(0, 120)}", not the text in src/lib/ai-declaration.js`);
    if (hides(tag.attrs) || tag.ancestors.some((a) => hides(a.attrs))) say('is hidden (hidden, inert, aria-hidden or display:none on it or around it)');
  }
  return problems;
}

/**
 * The FAQ answer says the three pages in FIGURE_SOURCE_PAGES show a source and
 * what was checked when beside their figure. While any shipped page says so,
 * each of those pages that ships as itself must carry its source line (the
 * element with that id, reading "מקור: ..."). A page withheld for an unverified
 * figure ships a notice with no figure, so the sentence has nothing there to be
 * about; it is skipped, and the build still publishes.
 *
 * @param {{path: string, html: string}[]} shipped  every HTML page that would ship
 * @param {string[]} withheldPages  pages shipping as a withheld notice
 * @returns {string[]} problems, each prefixed with the page
 */
export function figureSourceProblems(shipped, withheldPages = []) {
  const claims = shipped.some(({ html }) => normalizeText(stripTags(renderedMarkup(html))).includes(FIGURES_SOURCE_SENTENCE));
  if (!claims) return [];
  const problems = [];
  for (const [page, id] of Object.entries(FIGURE_SOURCE_PAGES)) {
    if (withheldPages.includes(page)) continue;
    const found = shipped.find((p) => p.path === page);
    if (!found) {
      problems.push(`${page}: the FAQ answer names this page's source line, and the page is not in the build`);
      continue;
    }
    const markup = renderedMarkup(found.html);
    const tag = startTags(markup).find((t) => t.attrs.get('id') === id);
    const close = tag ? markup.slice(tag.end).search(new RegExp(`</${tag.name}\\s*>`, 'i')) : -1;
    const text = close === -1 ? '' : normalizeText(stripTags(markup.slice(tag.end, tag.end + close)));
    if (!text.startsWith('מקור: ')) {
      problems.push(`${page}: the FAQ answer says a source line sits beside the figure here, and #${id} is missing or does not read "מקור: ..."`);
    } else if (hides(tag.attrs) || tag.ancestors.some((a) => hides(a.attrs))) {
      problems.push(`${page}: #${id} is hidden, and the FAQ answer says it is beside the figure`);
    }
  }
  return problems;
}
