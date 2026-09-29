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
//   - aiDeclarationProblems() keeps the AI declaration (src/lib/ai-declaration.js)
//     in every shipped page's footer, written exactly and visible: no attribute,
//     wrapper or stylesheet rule that can hide it. declarationScriptProblems()
//     keeps shipped scripts from reaching it after the build.
//   - withShippedFiguresSentence() and figureSourceProblems() keep the FAQ
//     answer's figures sentence naming only the figure pages that ship as
//     themselves, each carrying exactly the source line its config gives.

import {
  AI_DECLARATION,
  AI_DECLARATION_ATTR,
  AI_DECLARATION_HTML,
  FIGURE_SOURCE_PAGES,
  FIGURES_CLAIM,
  FIGURES_SOURCE_SENTENCE,
  figuresSourceSentence,
  WHO_BUILDS_ID,
  WHO_BUILDS_QUESTION,
  whoBuildsAnswer,
} from './ai-declaration.js';
import { cssRules } from './a11y-check.js';
import { sourceLineHe } from './source-line.js';

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
  // The בעל עסק זעיר check renders the rate, the 2024-2025 caps and the conditions from osek-zair.json, each cited
  // to a capture line. The 2026 cap is not in any text read: it waits, unverified, in osek-zair-unverified.json,
  // which this page does not render or load, so it is not listed here (listing it would withhold the whole page
  // for a year the page already refuses).
  'osek-zair.html': ['src/config/osek-zair.json'],
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
 * It states plainly why there are no numbers on it, links back to the home
 * page, and asks search engines not to index it - a placeholder competing for
 * the same query would be worse than nothing. It deliberately contains no
 * figure of any kind.
 *
 * It says only what the gate knows: the page's data file is not marked
 * `"verified": true`. It must not say the figures were not verified "against
 * the official source", or point to the tools "that are verified": that tells a
 * reader the published figures were checked against the official source, and
 * their own source lines say otherwise (a comparison with search results, or no
 * recorded check date - src/lib/source-line.js). Review of 29.9.2026.
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
<meta name="description" content="הדף הזה אינו מתפרסם כרגע: קובץ הנתונים שלו אינו מסומן כנבדק.">
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
    קובץ הנתונים של הדף אינו מסומן כנבדק, ולכן הנתונים לא מוצגים כאן בכלל.
  </div>
  <p>הדף יחזור כשקובץ הנתונים יסומן כנבדק. עד אז אין כאן שום סכום, שיעור או תוצאה.</p>
  <p class="note">קובץ הנתונים שאינו מסומן כנבדק: ${sources || 'לא צוין'} (${page}).</p>
  <p><a href="./">חזרה לדף הבית</a></p>
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
  'src/config/osek-zair.json': 'verified',
  // Never ships while unverified: it holds the 2026 cap no primary text read states. No page loads it.
  'src/config/osek-zair-unverified.json': 'verified',
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
const isSiteFooter = (t) => t.name === 'footer' && SITE_FOOTER.test(t.attrs.get('class') ?? '');
const classesOf = (el) => (el.attrs.get('class') ?? '').split(/\s+/).filter(Boolean);

/** The only elements that may hold the line: none of them can fold away or hide what is inside it. */
const DECLARATION_HOLDERS = new Set(['html', 'body', 'footer', 'div']);

/** What in an element's own attributes can hide it and everything inside it, or null. Any inline style counts. */
function concealedBy(el) {
  if (el.attrs.has('hidden')) return 'the hidden attribute';
  if (el.attrs.has('inert')) return 'inert';
  if ((el.attrs.get('aria-hidden') ?? '').trim().toLowerCase() === 'true') return 'aria-hidden="true"';
  if (el.attrs.has('style')) return 'a style attribute (no inline style may touch the line or what holds it)';
  if (el.attrs.has('popover')) return 'the popover attribute';
  return null;
}

// --- Stylesheet rules that can hide text. A catalogue of the known ways, not a proof: every doubt says "hidden".

const numberOf = (token) => {
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/.exec(String(token).trim());
  return m ? { n: Number(m[1]), unit: m[2] } : null;
};
/** Zero or less, or under the floor for its unit. A unit with no floor (or no unit) is not judged. */
const tooSmall = (token, floors) => {
  const x = numberOf(token);
  if (!x) return false;
  if (x.n <= 0) return true;
  return floors[x.unit] !== undefined && x.n < floors[x.unit];
};
const FONT_FLOOR = { px: 8, pt: 6, em: 0.5, rem: 0.5, '%': 50, vw: 0.5, vh: 0.5 };
const BOX_FLOOR = { px: 16, pt: 12, em: 1, rem: 1, '%': 1, vw: 1, vh: 1, ch: 2, ex: 2 };
const negative = (value) => value.split(/[\s,()]+/).some((t) => (numberOf(t)?.n ?? 0) < 0);
function transparentColor(v) {
  if (v === 'transparent') return true;
  if (/^#(?:[0-9a-f]{3}0|[0-9a-f]{6}00)$/.test(v)) return true;
  const fn = /^(?:rgba?|hsla?)\((.*)\)$/.exec(v);
  const args = fn ? fn[1].split(/[\s,/]+/).filter(Boolean) : [];
  return args.length === 4 && parseFloat(args[3]) === 0;
}
const OFFSETS = new Set([
  'text-indent', 'z-index', 'top', 'right', 'bottom', 'left', 'inset', 'inset-inline', 'inset-block', 'inset-inline-start',
  'inset-inline-end', 'inset-block-start', 'inset-block-end', 'margin', 'margin-top', 'margin-right', 'margin-bottom',
  'margin-left', 'margin-inline', 'margin-inline-start', 'margin-inline-end', 'margin-block', 'margin-block-start',
  'margin-block-end',
]);
const MUST_BE_NONE = new Set(['clip-path', 'mask', 'mask-image', '-webkit-mask', '-webkit-mask-image', 'filter', 'transform']);

/** Why one declaration can hide the text of the element it applies to, or null. */
function hidingDeclaration(prop, raw) {
  const v = String(raw ?? '').replace(/!\s*important\s*$/i, '').trim().toLowerCase();
  if (!v) return null;
  if (prop === 'display') return v === 'none' ? 'display: none' : null;
  if (prop === 'visibility') return /^(?:hidden|collapse)$/.test(v) ? `visibility: ${v}` : null;
  if (prop === 'content-visibility') return v === 'hidden' ? 'content-visibility: hidden' : null;
  if (prop === 'opacity') {
    const x = numberOf(v);
    return x && (x.unit === '%' ? x.n < 100 : x.n < 1) ? 'see-through (opacity below 1)' : null;
  }
  if (prop === 'font-size') return tooSmall(v, FONT_FLOOR) ? 'text too small to read' : null;
  if (prop === 'font') return v.split(/\s+/).some((t) => tooSmall(t.split('/')[0], FONT_FLOOR)) ? 'text too small to read' : null;
  if (prop === 'color' || prop === '-webkit-text-fill-color') return transparentColor(v) ? 'transparent text' : null;
  if (prop === 'clip') return v !== 'auto' ? `clip: ${v}` : null;
  if (MUST_BE_NONE.has(prop)) return v !== 'none' ? `${prop} can shrink, clip or fade it` : null;
  if (prop === 'position') return /^(?:absolute|fixed)$/.test(v) ? `position: ${v} takes it out of the flow, the off-screen trick` : null;
  if (/^(?:max-)?(?:height|width)$/.test(prop)) return tooSmall(v, BOX_FLOOR) ? `${prop}: ${v} is too small a box for a line of text` : null;
  if (OFFSETS.has(prop)) return negative(v) ? `a negative ${prop} can move it out of view` : null;
  if (prop === 'zoom') {
    const x = numberOf(v);
    return x && (x.unit === '%' ? x.n < 50 : x.n < 0.5) ? `zoom: ${v}` : null;
  }
  return null;
}

/** A selector as compounds and the combinators between them: "footer > p" -> {compounds: ['footer', 'p'], combinators: ['>']}. */
function splitSelector(selector) {
  const compounds = [];
  const combinators = [];
  let current = '';
  let pending = ' ';
  let depth = 0;
  for (const c of String(selector).trim()) {
    if (depth === 0 && /[\s>+~]/.test(c)) {
      if (current) {
        compounds.push(current);
        current = '';
        pending = ' ';
      }
      if (c === '>' || c === '+' || c === '~') pending = c;
      continue;
    }
    if (c === '(' || c === '[') depth++;
    else if ((c === ')' || c === ']') && depth > 0) depth--;
    if (!current && compounds.length) combinators.push(pending);
    current += c;
  }
  if (current) compounds.push(current);
  return depth === 0 && compounds.length && combinators.length === compounds.length - 1 ? { compounds, combinators } : null;
}

/**
 * Whether one compound selector ("p.ai-declaration[data-x]:hover") can match the element. Tag, classes, id and
 * attribute names are checked; pseudo-classes and pseudo-elements, and anything this reader cannot parse, are
 * assumed to match.
 */
function compoundMayMatch(compound, el) {
  let rest = compound;
  const tag = /^(?:\*|[a-zA-Z][\w-]*)/.exec(rest)?.[0];
  if (tag) {
    if (tag !== '*' && tag.toLowerCase() !== el.name) return false;
    rest = rest.slice(tag.length);
  }
  const classes = classesOf(el);
  while (rest) {
    let m;
    if ((m = /^\.(-?[_a-zA-Z][\w-]*)/.exec(rest))) {
      if (!classes.includes(m[1])) return false;
    } else if ((m = /^#(-?[_a-zA-Z][\w-]*)/.exec(rest))) {
      if (el.attrs.get('id') !== m[1]) return false;
    } else if ((m = /^\[\s*([^\s\]=~|^$*]+)[^\]]*\]/.exec(rest))) {
      if (!el.attrs.has(m[1].toLowerCase())) return false;
    } else if (!(m = /^::?[\w-]+(?:\((?:[^()]|\([^()]*\))*\))?/.exec(rest))) {
      return true;
    }
    rest = rest.slice(m[0].length);
  }
  return true;
}

/**
 * Whether a selector can match chain[0], given its ancestors chain[1..] (nearest first). Descendant and child
 * combinators are followed; sibling combinators (+ ~) are not tracked and assumed to match. A selector this reader
 * cannot split is assumed to match.
 */
function selectorMayMatch(selector, chain) {
  const parsed = splitSelector(selector);
  if (!parsed) return true;
  const { compounds, combinators } = parsed;
  const from = (ci, ei) => {
    if (!compoundMayMatch(compounds[ci], chain[ei])) return false;
    if (ci === 0) return true;
    const combinator = combinators[ci - 1];
    if (combinator === '>') return ei + 1 < chain.length && from(ci - 1, ei + 1);
    if (combinator === ' ') {
      for (let k = ei + 1; k < chain.length; k++) if (from(ci - 1, k)) return true;
      return false;
    }
    return true;
  };
  return from(compounds.length - 1, 0);
}

/**
 * The screen rules that reach the page: each stylesheet it links (looked up in `stylesheets`, by published path)
 * and each inline <style>. A linked stylesheet the check was not given, or an @import it cannot follow, is a
 * problem: it could hold the rule that hides the line.
 */
function screenRules(source, stylesheets, problems) {
  const sheets = [];
  for (const t of startTags(source.replace(/<!--[\s\S]*?(?:-->|$)/g, ''))) {
    if (t.name !== 'link' || !/(?:^|\s)stylesheet(?:\s|$)/i.test(t.attrs.get('rel') ?? '')) continue;
    const href = decodeEntities(t.attrs.get('href') ?? '').trim().replace(/[?#].*$/, '').replace(/^(?:\.\/)+/, '');
    if (has(stylesheets, href)) sheets.push({ from: href, css: String(stylesheets[href] ?? '') });
    else problems.push(`links the stylesheet "${href}", which the check was not given, so it cannot tell whether that stylesheet hides the AI declaration`);
  }
  for (const m of source.matchAll(/<style\b[^>]*>([\s\S]*?)(?:<\/style\s*>|$)/gi)) sheets.push({ from: 'an inline <style>', css: m[1] });
  const rules = [];
  for (const { from, css } of sheets) {
    if (/@import\b/i.test(css)) problems.push(`${from} uses @import, which the check does not follow, so it cannot tell whether the imported stylesheet hides the AI declaration`);
    for (const r of cssRules(css)) rules.push({ ...r, from });
  }
  return rules;
}

/**
 * What is wrong with a page's AI declaration; empty means the page carries it.
 *
 * The page needs at least one element marked `data-ai-declaration` inside its `<footer class="site-footer">`, and
 * every marked element must be there, written exactly as AI_DECLARATION_HTML (the <p>, its one class, the marker,
 * and the text with nothing else inside: a second class or a child element can hide it), held only by html, body,
 * the footer and a div (a <details>, a <dialog> or the like can fold it away), with no hidden, inert, aria-hidden,
 * popover or style attribute on it or around it, and no screen rule in the stylesheets the page links, or in its
 * inline <style>, that can hide it or anything around it (display, visibility, opacity, a tiny font or box,
 * transparent text, a clip, a transform, an off-screen position). Rules inside `@media print` alone do not count:
 * paper is the document the user prints, and print hides the whole footer.
 *
 * Comments and script, style, template and noscript content do not count as the line: a visitor cannot see them.
 *
 * @param {string} html
 * @param {{stylesheets?: Record<string, string>}} options  the CSS of every stylesheet the page links, by path
 */
export function aiDeclarationProblems(html, { stylesheets = {} } = {}) {
  const source = String(html ?? '');
  const markup = renderedMarkup(source);
  const tags = startTags(markup);
  if (!tags.some(isSiteFooter)) return ['no site footer: the AI declaration goes in <footer class="site-footer">'];
  const marked = tags.filter((t) => t.attrs.has(AI_DECLARATION_ATTR));
  const problems = [];
  if (!marked.some((t) => t.ancestors.some(isSiteFooter))) problems.push(`the AI declaration is missing from the site footer (${AI_DECLARATION_HTML})`);
  const rules = screenRules(source, stylesheets, problems);
  const opening = AI_DECLARATION_HTML.slice(0, AI_DECLARATION_HTML.indexOf('>') + 1);
  for (const tag of marked) {
    const say = (why) => problems.push(`the AI declaration ${why}`);
    if (!tag.ancestors.some(isSiteFooter)) say('is outside the site footer');
    const close = markup.slice(tag.end).search(new RegExp(`</${tag.name}\\s*>`, 'i'));
    const inner = close === -1 ? '' : markup.slice(tag.end, tag.end + close);
    const text = normalizeText(stripTags(inner));
    if (text !== AI_DECLARATION) {
      say(`is altered: it reads "${text.slice(0, 120)}", not the text in src/lib/ai-declaration.js`);
    } else if (markup.slice(tag.start, tag.end) !== opening || inner !== AI_DECLARATION) {
      say(`is not written exactly as ${opening}…</p>: another class, another attribute or an element inside it can hide it`);
    }
    for (const el of [tag, ...tag.ancestors]) {
      const how = concealedBy(el);
      if (how) say(`is hidden or can be: ${how} on <${el.name}>`);
    }
    for (const a of tag.ancestors) {
      if (!DECLARATION_HOLDERS.has(a.name)) say(`sits inside <${a.name}>, which can fold it away or hide it; only html, body, the site footer and a div may hold it`);
    }
    const lineage = [...tag.ancestors, tag];
    for (let j = lineage.length - 1; j >= 0; j--) {
      const chain = lineage.slice(0, j + 1).reverse();
      for (const r of rules) {
        if (!selectorMayMatch(r.selector, chain)) continue;
        for (const [prop, value] of Object.entries(r.decls)) {
          const why = hidingDeclaration(prop, value);
          if (why) say(`can be hidden by ${r.from}: "${r.selector} { ${prop}: ${value} }" applies to <${chain[0].name}> (${why})`);
        }
      }
    }
  }
  return [...new Set(problems)];
}

/** What a script would use to find the line or the footer that holds it. */
const DECLARATION_HOOKS = ['ai-declaration', 'site-footer'];

/**
 * Scripts that name the declaration or the site footer. The gate reads the HTML as it ships; a script that finds
 * the line after the page loads could hide or rewrite it, so no shipped script may name either.
 *
 * @param {{path: string, js: string}[]} scripts  every script that would ship, files and inline alike
 * @returns {string[]} problems, each prefixed with the script
 */
export function declarationScriptProblems(scripts) {
  const problems = [];
  for (const { path, js } of scripts) {
    for (const hook of DECLARATION_HOOKS) {
      if (String(js ?? '').includes(hook)) {
        problems.push(`${path}: a shipped script names "${hook}", and a script could hide or rewrite the AI declaration after the build checked it`);
      }
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// The figures sentence in the FAQ answer (src/lib/ai-declaration.js).

const occurrences = (text, part) => (part ? text.split(part).length - 1 : 0);

/**
 * `html` with the figures sentence naming only `pages` - the figure pages that ship as themselves in this build -
 * on the page and in its JSON-LD alike; with none of them shipping, the sentence and the space before it go.
 * A page without the source tree's sentence comes back unchanged.
 */
export function withShippedFiguresSentence(html, pages) {
  const next = figuresSourceSentence(pages);
  const source = String(html ?? '');
  if (next === FIGURES_SOURCE_SENTENCE) return source;
  return next ? source.split(FIGURES_SOURCE_SENTENCE).join(next) : source.split(` ${FIGURES_SOURCE_SENTENCE}`).join('');
}

/** The answer texts of every JSON-LD Question named `question`; null when a JSON-LD block does not parse. */
function jsonLdAnswers(html, question) {
  const answers = [];
  for (const m of String(html).matchAll(/<script\b[^>]*\btype\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    let data;
    try {
      data = JSON.parse(m[1]);
    } catch {
      return null;
    }
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== 'object') return undefined;
      if (node['@type'] === 'Question' && node.name === question) answers.push(String(node.acceptedAnswer?.text ?? ''));
      for (const v of Object.values(node)) walk(v);
      return undefined;
    };
    walk(data);
  }
  return answers;
}

/** What is wrong with a page's `<details id="who-builds">` entry, given the answer this build must give. */
function whoBuildsProblems(path, source, entry, answer) {
  const problems = [];
  const say = (why) => problems.push(`${path}: #${WHO_BUILDS_ID} ${why}`);
  const markup = renderedMarkup(source);
  if (entry.name !== 'details') say(`is a <${entry.name}>, not the <details> FAQ entry "${WHO_BUILDS_QUESTION}"`);
  const close = markup.slice(entry.end).search(new RegExp(`</${entry.name}\\s*>`, 'i'));
  const inner = close === -1 ? '' : markup.slice(entry.end, entry.end + close);
  const summary = /<summary\b[^>]*>([\s\S]*?)<\/summary\s*>/i.exec(inner);
  const question = normalizeText(stripTags(summary?.[1] ?? ''));
  const text = normalizeText(stripTags(summary ? inner.slice(summary.index + summary[0].length) : inner));
  if (question !== WHO_BUILDS_QUESTION) say(`asks "${question}", not "${WHO_BUILDS_QUESTION}"`);
  if (text !== answer) {
    say(`answers "${text.slice(0, 200)}"; with the figure pages this build ships it must answer "${answer}" (whoBuildsAnswer in src/lib/ai-declaration.js)`);
  }
  if (hides(entry.attrs) || entry.ancestors.some((a) => hides(a.attrs))) say('is hidden');
  const twins = jsonLdAnswers(source, WHO_BUILDS_QUESTION);
  if (twins === null) say('is on a page whose JSON-LD does not parse');
  else if (!twins.length) say("has no twin in the page's FAQPage JSON-LD");
  else for (const twin of twins) if (normalizeText(twin) !== answer) say(`has a JSON-LD twin that answers "${twin.slice(0, 200)}", not "${answer}"`);
  return problems;
}

/**
 * The FAQ answer says that on the figure pages it names, a source line and what was checked when sit beside the
 * figure. That is true only of pages that ship as themselves (a withheld page's notice shows no figure and no line),
 * and only while each such page's line is exactly what its config gives (sourceLineHe in src/lib/source-line.js).
 *
 * The check is on when any shipped page has the `#who-builds` entry or says the figures claim at all
 * (FIGURES_CLAIM), so rewording the answer does not switch it off. Then:
 *   - every figures sentence on every shipped page, visible or in JSON-LD, must be figuresSourceSentence() of the
 *     figure pages shipping as themselves (the build writes it so: withShippedFiguresSentence);
 *   - each `#who-builds` entry must ask WHO_BUILDS_QUESTION and answer whoBuildsAnswer() of those pages, on the
 *     page and in its FAQPage JSON-LD alike;
 *   - each of those pages must carry its line (FIGURE_SOURCE_PAGES), visible, reading exactly sourceLineHe() of its
 *     one config in PAGE_RATE_SOURCES.
 *
 * @param {{path: string, html: string}[]} shipped  every HTML page that would ship
 * @param {{asThemselves?: string[], configs?: Record<string, object|undefined>}} options
 *   asThemselves: the pages that ship as themselves, not as a withheld notice (default: every shipped page);
 *   configs: the rate configs by path, as the build parsed them
 * @returns {string[]} problems, each prefixed with the page
 */
export function figureSourceProblems(shipped, { asThemselves = shipped.map((p) => p.path), configs = {} } = {}) {
  const named = Object.keys(FIGURE_SOURCE_PAGES).filter((page) => asThemselves.includes(page));
  const sentence = figuresSourceSentence(named);
  const answer = whoBuildsAnswer(named);
  const problems = [];
  let claims = false;
  for (const { path, html } of shipped) {
    const source = String(html ?? '');
    const said = occurrences(normalizeText(stripTags(source)), FIGURES_CLAIM);
    const entry = startTags(renderedMarkup(source)).find((t) => t.attrs.get('id') === WHO_BUILDS_ID);
    if (!said && !entry) continue;
    claims = true;
    if (said !== occurrences(normalizeText(stripTags(source)), sentence)) {
      problems.push(
        `${path}: a figures sentence names pages that do not ship with a source line; with the pages this build ships it must read ` +
          `"${sentence ?? '(nothing: no figure page ships as itself, so the sentence goes)'}" (figuresSourceSentence in src/lib/ai-declaration.js)`,
      );
    }
    if (entry) problems.push(...whoBuildsProblems(path, source, entry, answer));
  }
  if (!claims) return problems;
  for (const page of named) {
    const { id } = FIGURE_SOURCE_PAGES[page];
    const say = (why) => problems.push(`${page}: #${id} ${why}`);
    const found = shipped.find((p) => p.path === page);
    if (!found) {
      say('cannot be checked: the FAQ answer names this page, and the page is not in the build');
      continue;
    }
    const sources = PAGE_RATE_SOURCES[page] ?? [];
    if (sources.length !== 1) {
      say(`cannot be checked: PAGE_RATE_SOURCES must give this page exactly one config, and it gives ${sources.length}`);
      continue;
    }
    let expected;
    try {
      expected = sourceLineHe(configs[sources[0]]);
    } catch (e) {
      say(`cannot be checked: no source line can be written from ${sources[0]} (${e.message})`);
      continue;
    }
    const markup = renderedMarkup(found.html);
    const tag = startTags(markup).find((t) => t.attrs.get('id') === id);
    const close = tag ? markup.slice(tag.end).search(new RegExp(`</${tag.name}\\s*>`, 'i')) : -1;
    const text = close === -1 ? '' : normalizeText(stripTags(markup.slice(tag.end, tag.end + close)));
    if (!tag) say(`is missing, and the FAQ answer says a source line sits beside the figure here; it must read "${expected}"`);
    else if (text !== expected) say(`reads "${text}", and the FAQ answer needs exactly the line ${sources[0]} gives: "${expected}"`);
    else if (hides(tag.attrs) || tag.ancestors.some((a) => hides(a.attrs))) say('is hidden, and the FAQ answer says it sits beside the figure');
  }
  return problems;
}
