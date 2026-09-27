// The basic accessibility checks the build runs before it will publish.
//
// Israeli commercial sites owe an accessibility statement and IS 5568
// conformance (research/colony-sweep/audits/israel-bureaucracy.md, the two
// places that name it). This module is NOT an IS 5568 audit and nothing here
// claims one: it is a short list of checks that can be run on the page source
// without a browser, each one a real requirement a page can fail. The
// accessibility statement (accessibility.html) lists exactly these checks and
// no others - a test holds the two together - and the build refuses to publish
// while any of them fails, so the statement cannot say "checked" about
// something that is failing.
//
// What this cannot see, and the statement says so: content the page scripts
// create at runtime, behaviour in a real screen reader, keyboard use in a real
// browser, 200% zoom, the printed / PDF receipt.
//
// Build-time only. No shipped page imports this module, so it does not ship.

/** Every check, with the Hebrew line the statement prints for it. */
export const A11Y_CHECKS = [
  { id: 'lang-dir', he: 'לכל דף מוגדרת שפה עברית וכיוון מימין לשמאל (lang="he" dir="rtl").' },
  { id: 'title', he: 'לכל דף יש כותרת (title) שאינה ריקה.' },
  { id: 'zoom', he: 'אף דף אינו חוסם הגדלה בטלפון (אין user-scalable=no ואין maximum-scale נמוך מ-2).' },
  { id: 'img-alt', he: 'לכל תמונה יש טקסט חלופי (alt), גם אם ריק לתמונה דקורטיבית.' },
  { id: 'control-names', he: 'לכל שדה בטופס (input, select, textarea) יש תווית מקושרת או שם נגיש.' },
  { id: 'button-names', he: 'לכל כפתור יש טקסט או שם נגיש.' },
  { id: 'link-names', he: 'לכל קישור יש טקסט או שם נגיש.' },
  { id: 'headings', he: 'בכל דף יש כותרת ראשית אחת (h1), ורמות הכותרות לא מדלגות (למשל מ-h1 ישר ל-h3).' },
  { id: 'unique-ids', he: 'אין שני רכיבים עם אותו מזהה (id) באותו דף, כך שכל תווית מצביעה על שדה אחד.' },
  { id: 'landmarks', he: 'בכל דף יש אזור תוכן ראשי (main), ולכל אזור ניווט (nav) יש שם.' },
  { id: 'tabindex', he: 'אין סדר מעבר מאולץ במקלדת (tabindex חיובי).' },
  { id: 'focus-visible', he: 'גיליון הסגנונות לא מסתיר את סימון הפוקוס (אין outline: none), ולשדות הטופס יש מסגרת פוקוס מודגשת.' },
  { id: 'contrast', he: 'יחס הניגודיות של צירופי הטקסט והרקע שבגיליון הסגנונות הוא 4.5:1 לפחות, לפי נוסחת WCAG 2.0.' },
];

// ---------------------------------------------------------------------------
// HTML

const attrValue = (tag, name) => {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
};
const hasAttr = (tag, name) => new RegExp(`\\s${name}(?=[\\s=>/])`, 'i').test(tag);
const textOf = (html) => String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
const nonEmpty = (v) => typeof v === 'string' && v.trim() !== '';

/** Page source without comments, scripts and styles - what the checks read. */
function markupOf(html) {
  return String(html ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
}

function labelRanges(markup) {
  return [...markup.matchAll(/<label\b[^>]*>[\s\S]*?<\/label>/gi)].map((m) => [m.index, m.index + m[0].length]);
}

const NO_LABEL_INPUTS = new Set(['hidden', 'submit', 'button', 'reset', 'image']);

/**
 * @param {string} html
 * @returns {{check: string, message: string}[]} problems; empty means the page passes every page-level check
 */
export function checkPageA11y(html) {
  const problems = [];
  const fail = (check, message) => problems.push({ check, message });
  const markup = markupOf(html);

  const htmlTag = /<html\b[^>]*>/i.exec(markup)?.[0] ?? '';
  if (attrValue(htmlTag, 'lang') !== 'he' || attrValue(htmlTag, 'dir') !== 'rtl') fail('lang-dir', '<html> lacks lang="he" dir="rtl"');

  const title = /<title>([\s\S]*?)<\/title>/i.exec(String(html ?? ''));
  if (!title || !nonEmpty(textOf(title[1]))) fail('title', 'missing or empty <title>');

  for (const m of markup.matchAll(/<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*>/gi)) {
    const content = (attrValue(m[0], 'content') ?? '').toLowerCase().replace(/\s+/g, '');
    if (/user-scalable=(no|0)\b/.test(content)) fail('zoom', 'viewport disables zoom (user-scalable)');
    const max = /maximum-scale=([\d.]+)/.exec(content);
    if (max && Number(max[1]) < 2) fail('zoom', `viewport caps zoom at maximum-scale=${max[1]}`);
  }

  for (const m of markup.matchAll(/<img\b[^>]*>/gi)) {
    if (!hasAttr(m[0], 'alt')) fail('img-alt', `image without alt: ${m[0].slice(0, 80)}`);
  }

  const ids = [...markup.matchAll(/\sid\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
  const counts = ids.reduce((acc, id) => acc.set(id, (acc.get(id) ?? 0) + 1), new Map());
  for (const [id, n] of counts) if (n > 1) fail('unique-ids', `id="${id}" appears ${n} times`);

  const labelledIds = new Set(
    [...markup.matchAll(/<label\b[^>]*>/gi)].map((m) => attrValue(m[0], 'for')).filter(nonEmpty),
  );
  const wrapped = labelRanges(markup);
  for (const m of markup.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
    const tag = m[0];
    const type = (attrValue(tag, 'type') ?? '').toLowerCase();
    if (m[1].toLowerCase() === 'input' && NO_LABEL_INPUTS.has(type)) {
      if (['submit', 'button', 'reset'].includes(type) && !nonEmpty(attrValue(tag, 'value')) && !nonEmpty(attrValue(tag, 'aria-label'))) {
        fail('button-names', `input type=${type} without a value: ${tag.slice(0, 80)}`);
      }
      continue;
    }
    const id = attrValue(tag, 'id');
    const named =
      (nonEmpty(id) && labelledIds.has(id)) ||
      nonEmpty(attrValue(tag, 'aria-label')) ||
      nonEmpty(attrValue(tag, 'aria-labelledby')) ||
      wrapped.some(([a, b]) => m.index > a && m.index < b);
    if (!named) fail('control-names', `form control without a label: ${tag.slice(0, 100)}`);
  }

  for (const m of markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    if (!nonEmpty(textOf(m[2])) && !nonEmpty(attrValue(m[1], 'aria-label')) && !nonEmpty(attrValue(m[1], 'aria-labelledby'))) {
      fail('button-names', `button without text or aria-label: ${m[0].slice(0, 80)}`);
    }
  }

  for (const m of markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    if (!hasAttr(m[1], 'href')) continue;
    const imgAlts = [...m[2].matchAll(/<img\b[^>]*>/gi)].map((i) => attrValue(i[0], 'alt'));
    if (!nonEmpty(textOf(m[2])) && !nonEmpty(attrValue(m[1], 'aria-label')) && !imgAlts.some(nonEmpty)) {
      fail('link-names', `link without text or aria-label: ${m[0].slice(0, 80)}`);
    }
  }

  const levels = [...markup.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const h1s = levels.filter((l) => l === 1).length;
  if (h1s !== 1) fail('headings', `expected exactly one <h1>, found ${h1s}`);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) fail('headings', `heading level jumps from h${levels[i - 1]} to h${levels[i]}`);
  }

  if (!/<main\b/i.test(markup)) fail('landmarks', 'no <main> landmark');
  for (const m of markup.matchAll(/<nav\b[^>]*>/gi)) {
    if (!nonEmpty(attrValue(m[0], 'aria-label')) && !nonEmpty(attrValue(m[0], 'aria-labelledby'))) {
      fail('landmarks', '<nav> without aria-label');
    }
  }

  for (const m of markup.matchAll(/\stabindex\s*=\s*["']?(-?\d+)/gi)) {
    if (Number(m[1]) > 0) fail('tabindex', `positive tabindex="${m[1]}"`);
  }

  return problems;
}

// ---------------------------------------------------------------------------
// CSS

/** The stylesheet without its `@media print { ... }` blocks: paper is not what a screen reader of the site sees. */
function dropPrintBlocks(css) {
  const re = /@media\s+print\b[^{]*\{/gi;
  let out = '';
  let from = 0;
  let m;
  while ((m = re.exec(css))) {
    out += css.slice(from, m.index);
    let depth = 1;
    let j = re.lastIndex;
    for (; j < css.length && depth > 0; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
    }
    from = j;
    re.lastIndex = j;
  }
  return out + css.slice(from);
}

/** Flat list of screen {selector, decls} in source order; other nested @media rules are read as plain rules. */
export function cssRules(css) {
  const source = dropPrintBlocks(String(css ?? '').replace(/\/\*[\s\S]*?\*\//g, ''));
  const rules = [];
  for (const m of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = {};
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':');
      if (i > 0) decls[d.slice(0, i).trim().toLowerCase()] = d.slice(i + 1).trim();
    }
    for (const selector of m[1].split(',')) rules.push({ selector: selector.trim(), decls });
  }
  return rules;
}

/** The last value a stylesheet gives `property` on exactly `selector`. */
function declOf(rules, selector, property) {
  let value;
  for (const r of rules) {
    if (r.selector !== selector) continue;
    if (property === 'background') {
      const v = r.decls['background-color'] ?? r.decls.background;
      if (v !== undefined) value = v;
    } else if (r.decls[property] !== undefined) {
      value = r.decls[property];
    }
  }
  return value;
}

/** '#abc' | '#aabbcc' | 'var(--x)' (resolved through :root) -> '#aabbcc', or null. */
export function resolveColor(value, vars, depth = 0) {
  const v = String(value ?? '').trim().split(/\s+/)[0].toLowerCase();
  const ref = /^var\((--[\w-]+)\)$/.exec(v);
  if (ref) return depth > 5 ? null : resolveColor(vars[ref[1]], vars, depth + 1);
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  if (v === 'white') return '#ffffff';
  if (v === 'black') return '#000000';
  return null;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.0 contrast ratio of two '#rrggbb' colours. */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The text-on-background pairs the site actually shows, as [selector, property]
 * for each side, read from the stylesheet itself. A pair that cannot be resolved
 * fails: a renamed selector must not turn into a silent pass.
 */
export const CONTRAST_PAIRS = [
  { label: 'body text on the page', fg: ['body', 'color'], bg: ['body', 'background'] },
  { label: 'body text on a card', fg: ['body', 'color'], bg: ['.card', 'background'] },
  { label: 'body text on the Pro box', fg: ['body', 'color'], bg: ['.pro-box', 'background'] },
  { label: 'body text in a status box', fg: ['body', 'color'], bg: ['.status-box', 'background'] },
  { label: 'body text in a warning box', fg: ['body', 'color'], bg: ['.status-box.warn', 'background'] },
  { label: 'body text in an allocation verdict', fg: ['body', 'color'], bg: ['.verdict.required', 'background'] },
  { label: 'body text in a positive verdict', fg: ['body', 'color'], bg: ['.verdict.not-required', 'background'] },
  { label: 'secondary text on the page', fg: ['.note', 'color'], bg: ['body', 'background'] },
  { label: 'secondary text on a card', fg: ['.note', 'color'], bg: ['.card', 'background'] },
  { label: 'secondary text in a status box', fg: ['.note', 'color'], bg: ['.status-box', 'background'] },
  { label: 'secondary text in a warning box', fg: ['.note', 'color'], bg: ['.status-box.warn', 'background'] },
  { label: 'lead paragraph', fg: ['.lead', 'color'], bg: ['body', 'background'] },
  { label: 'navigation links', fg: ['nav a', 'color'], bg: ['.site-header', 'background'] },
  { label: 'footer text', fg: ['.site-footer', 'color'], bg: ['body', 'background'] },
  { label: 'links on the page', fg: ['a', 'color'], bg: ['body', 'background'] },
  { label: 'links on a card', fg: ['a', 'color'], bg: ['.card', 'background'] },
  { label: 'links in the Pro box', fg: ['a', 'color'], bg: ['.pro-box', 'background'] },
  { label: 'primary button', fg: ['.btn', 'color'], bg: ['.btn', 'background'] },
  { label: 'primary button, hovered', fg: ['.btn', 'color'], bg: ['.btn:hover', 'background'] },
  { label: 'secondary button', fg: ['.btn.secondary', 'color'], bg: ['.btn.secondary', 'background'] },
  { label: 'green badge', fg: ['.badge.ok', 'color'], bg: ['.badge.ok', 'background'] },
  { label: 'orange badge', fg: ['.badge.warn', 'color'], bg: ['.badge.warn', 'background'] },
  { label: 'red badge', fg: ['.badge.over', 'color'], bg: ['.badge.over', 'background'] },
  { label: 'estimate badge', fg: ['.badge.estimate', 'color'], bg: ['.badge.estimate', 'background'] },
  { label: 'error list on a card', fg: ['.error-list', 'color'], bg: ['.card', 'background'] },
  { label: 'fieldset legend on a card', fg: ['legend', 'color'], bg: ['.card', 'background'] },
];

export const MIN_CONTRAST = 4.5;

/**
 * @param {string} css
 * @returns {{problems: {check: string, message: string}[], pairs: {label: string, fg: string, bg: string, ratio: number}[]}}
 */
export function checkStylesheetA11y(css) {
  const problems = [];
  const rules = cssRules(css);
  const vars = {};
  for (const r of rules) if (r.selector === ':root') for (const [k, v] of Object.entries(r.decls)) if (k.startsWith('--')) vars[k] = v;

  for (const r of rules) {
    const outline = r.decls.outline ?? r.decls['outline-style'];
    if (outline !== undefined && /^(none|0)(\s|$)/i.test(outline.trim())) {
      problems.push({ check: 'focus-visible', message: `${r.selector} removes the focus outline` });
    }
  }
  for (const field of ['input:focus', 'select:focus', 'textarea:focus']) {
    const outline = declOf(rules, field, 'outline');
    if (!outline || /^(none|0)/i.test(outline)) problems.push({ check: 'focus-visible', message: `${field} has no visible outline` });
  }

  const pairs = [];
  for (const { label, fg, bg } of CONTRAST_PAIRS) {
    const f = resolveColor(declOf(rules, ...fg), vars);
    const b = resolveColor(declOf(rules, ...bg), vars);
    if (!f || !b) {
      problems.push({ check: 'contrast', message: `${label}: cannot resolve ${fg.join(' ')} / ${bg.join(' ')} in the stylesheet` });
      continue;
    }
    const ratio = Math.round(contrastRatio(f, b) * 100) / 100;
    pairs.push({ label, fg: f, bg: b, ratio });
    if (ratio < MIN_CONTRAST) problems.push({ check: 'contrast', message: `${label}: ${f} on ${b} is ${ratio}:1, under ${MIN_CONTRAST}:1` });
  }
  return { problems, pairs };
}
