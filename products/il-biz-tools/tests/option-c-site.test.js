// What the shipped site says and allows under Option C
// (research/measurements/gumroad-license-decision.md §5, §6, §8).
//
// AT-10 retirement, AT-12 CSP, AT-13 copy, AT-17 language gate, AT-18 build.
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');

// §6, the full buyer-facing disclosure, verbatim from the decision.
export const DISCLOSURE_LINE = 'מפתח הרישיון נבדק מול Gumroad פעם אחת בהפעלה, ואחר כך לכל היותר פעם בשבוע.';
export const DISCLOSURE = [
  'מה נשלח לאן. האתר הזה סטטי: אין לנו שרת, והקבלות, רשימת הלקוחות והלוגו שלכם נשמרים בדפדפן שלכם בלבד ולא נשלחים לשום מקום.',
  'חריג אחד, ורק ב-Pro: כשמזינים מפתח רישיון, הדפדפן שלכם שולח את המפתח ואת מזהה המוצר ישירות ל-Gumroad (api.gumroad.com), כדי לוודא שהמפתח שולם. Gumroad, כמו כל שרת שפונים אליו, רואה גם את כתובת ה-IP שלכם, סוג הדפדפן וכתובת האתר הזה. אחרי ההפעלה הבדיקה חוזרת ברקע לכל היותר פעם בשבוע.',
  'Gumroad מחזירה בתשובה גם את פרטי הרכישה שלכם (אימייל, שם, מחיר). האתר משליך אותם ושומר בדפדפן רק את המפתח, מזהה המוצר ותאריך הבדיקה. האתר עצמו לא רואה כלום מהבדיקות; ב-Gumroad המוכר רואה רק כמה פעמים המפתח הופעל. חלה עליהן מדיניות הפרטיות של Gumroad.',
  'אחרי ההפעלה הראשונה המיתוג עובד גם בלי אינטרנט. אם Gumroad לא זמינה — המיתוג לא נכבה. הוא נכבה רק אם Gumroad מאשרת שהמפתח בוטל, שהתשלום הוחזר או שנפתחה מחלוקת על החיוב.',
  'הרישיון הוא תשלום חד-פעמי, בלי מנוי, ואפשר להזין את המפתח בכל דפדפן שתרצו. ניקוי נתוני האתר בדפדפן מוחק את ההפעלה — המפתח נשאר בקבלה מ-Gumroad, ומזינים אותו שוב.',
].join(' ');
const INDEX_FAQ = 'החישובים והקבלות — לשום מקום: הכול נעשה ונשמר בדפדפן שלכם, ואין לנו שרת. חריג אחד: מפתח רישיון Pro (אם קניתם) נבדק ישירות מול Gumroad — פירוט בדף מחולל הקבלות.';

const textOf = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
/** The open elements (tag + attributes) enclosing a character offset - a tiny HTML walker, enough for our own pages. */
function ancestorsAt(html, offset) {
  const stack = [];
  for (const m of html.slice(0, offset).matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g)) {
    const [, close, tag, attrs] = m;
    const t = tag.toLowerCase();
    if (close) {
      const i = stack.map((s) => s.tag).lastIndexOf(t);
      if (i >= 0) stack.length = i;
    } else if (!VOID.has(t) && !attrs.trim().endsWith('/')) {
      stack.push({ tag: t, attrs });
    }
  }
  return stack;
}

/** The markup of the element with this id, start tag to its matching end tag. */
function elementById(html, id) {
  const start = html.search(new RegExp(`<([a-z]+)[^>]*\\sid="${id}"`));
  expect(start, `#${id} exists`).toBeGreaterThanOrEqual(0);
  const tag = /^<([a-z]+)/.exec(html.slice(start))[1];
  let depth = 0;
  for (const m of html.slice(start).matchAll(new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g'))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, start + m.index + m[0].length);
  }
  throw new Error(`#${id} is not closed`);
}

function walk(dir, skip = new Set(['node_modules', '_site', '.git'])) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, skip));
    else out.push(p);
  }
  return out;
}

describe('AT-12 content security policy', () => {
  const csp = /Content-Security-Policy = "([^"]+)"/.exec(read('netlify.toml'))[1];
  const directives = Object.fromEntries(csp.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
    const [name, ...sources] = d.split(/\s+/);
    return [name, sources];
  }));

  it('lets the page reach api.gumroad.com and nothing new besides', () => {
    expect(new Set(directives['connect-src'])).toEqual(new Set(["'self'", 'https://plausible.io', 'https://*.posthog.com', 'https://api.gumroad.com']));
  });

  it('runs no Gumroad code and frames nothing', () => {
    expect(directives['script-src'].join(' ')).not.toMatch(/gumroad/i);
    expect(directives['frame-src']).toEqual(["'none'"]);
  });
});

describe('AT-13 the copy tells the buyer what is sent where', () => {
  const invoice = read('invoice.html');
  const index = read('index.html');

  it('shows the one-line disclosure beside the key input, inside no hidden element', () => {
    const at = invoice.indexOf(DISCLOSURE_LINE);
    expect(at).toBeGreaterThan(0);
    const stack = ancestorsAt(invoice, at);
    for (const el of stack) expect(el.attrs, `<${el.tag}${el.attrs}>`).not.toMatch(/\shidden(\s|=|$)/);
    expect(stack.some((el) => /id="pro"/.test(el.attrs))).toBe(true);
    // Beside the input: the same field wrapper holds both.
    const field = stack.at(-2);
    expect(field.attrs).toContain('class="field"');
    const fieldStart = invoice.lastIndexOf('<div class="field">', at);
    expect(invoice.slice(fieldStart, at)).toContain('id="license-key"');
  });

  it('carries the full disclosure inside a <details> titled "מה נשלח לאן" in the Pro box', () => {
    const pro = elementById(invoice, 'pro');
    const privacy = elementById(pro, 'pro-privacy');
    expect(privacy.startsWith('<details')).toBe(true);
    expect(/<summary>([^<]*)<\/summary>/.exec(privacy)[1]).toBe('מה נשלח לאן');
    expect(textOf(privacy.replace(/<summary>[^<]*<\/summary>/, ''))).toBe(DISCLOSURE);
  });

  it("uses Gumroad's key format as the placeholder", () => {
    expect(/<input[^>]*id="license-key"[^>]*>/.exec(invoice)[0]).toContain('placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"');
  });

  it('no longer says nothing is sent, in the invoice page or the home page', () => {
    expect(invoice).not.toContain('שום מידע לא נשלח לשרת');
    expect(index).not.toContain('אין שרת שמקבל את המידע');
  });

  it('answers "where does my data go" on the home page with the exception, in both copies', () => {
    const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(index)[1]);
    const faq = ld['@graph'].find((n) => n['@type'] === 'FAQPage').mainEntity.find((q) => q.name === 'לאן נשלחים הנתונים שאני מזין?');
    expect(faq.acceptedAnswer.text).toBe(INDEX_FAQ);
    const visible = /<details><summary>לאן נשלחים הנתונים שאני מזין\?<\/summary>([\s\S]*?)<\/details>/.exec(index)[1];
    expect(textOf(visible)).toBe(INDEX_FAQ);
  });

  it('the invoice FAQ says the receipts stay put and only the licence key is checked', () => {
    const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(invoice)[1]);
    const answer = ld.mainEntity.find((q) => q.name === 'איפה נשמרות הקבלות שלי?').acceptedAnswer.text;
    expect(answer).toContain('הקבלות והלקוחות אינם נשלחים לשום שרת; רק מפתח רישיון Pro נבדק מול Gumroad');
  });

  it('check-html passes', () => {
    expect(() => execFileSync(process.execPath, [join(root, 'scripts/check-html.js')], { stdio: 'pipe' })).not.toThrow();
  });
});

describe('AT-10 the signed-key format is retired', () => {
  it('leaves no trace of its prefix anywhere in this product', () => {
    const prefix = ['ILBIZ', '1'].join('');
    const hits = walk(root).filter((p) => readFileSync(p, 'utf8').includes(prefix));
    expect(hits).toEqual([]);
  });

  it('has no issuing script and no public-key config', () => {
    expect(existsSync(join(root, 'scripts/make-license.js'))).toBe(false);
    const site = JSON.parse(read('src/config/site.json'));
    expect('pro' in site).toBe(false);
  });
});

describe('AT-17 language gate', () => {
  const readme = read('README.md');

  it('says the first real key has not been verified yet', () => {
    expect(readme).toContain('First real key verified: not yet — the first sale is the test');
  });

  it('claims nowhere that Pro is working or verified end to end', () => {
    const pages = readdirSync(root).filter((f) => f.endsWith('.html')).map(read);
    for (const doc of [readme, ...pages]) {
      expect(doc).not.toMatch(/verified end[- ]to[- ]end|end[- ]to[- ]end verified/i);
      expect(doc).not.toMatch(/\bPro (is )?(fully )?work(s|ing)\b/i);
    }
  });
});

describe('AT-18 the build ships the disclosure and nothing private', () => {
  let built;
  beforeAll(() => {
    execFileSync(process.execPath, [join(root, 'scripts/build-site.js')], { stdio: 'pipe' });
    built = walk(join(root, '_site'), new Set());
  });

  it('writes _site/invoice.html with the disclosure', () => {
    const html = readFileSync(join(root, '_site/invoice.html'), 'utf8');
    expect(html).toContain(DISCLOSURE_LINE);
    expect(textOf(elementById(html, 'pro-privacy').replace(/<summary>[^<]*<\/summary>/, ''))).toBe(DISCLOSURE);
  });

  it('copies no key file and no scripts', () => {
    const names = built.map((p) => p.slice(join(root, '_site').length + 1));
    expect(names.filter((n) => /license-key|\.pem$|private/i.test(n))).toEqual([]);
    expect(names.filter((n) => n.startsWith('scripts/'))).toEqual([]);
  });
});
