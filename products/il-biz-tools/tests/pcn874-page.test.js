// pcn874.html - the free, no-upload PCN874 validator page.
//
// What the page must be, each requirement pinned here:
//   - the file is read with the File API only; nothing is uploaded, fetched or
//     stored, and the page's own JS contains no network call at all (the one
//     exception on the whole site is the documented, off-by-default cookieless
//     page-view counter in src/lib/analytics.js, which never sees the file);
//   - it says in Hebrew that it checks structure only, cross-checks no amount,
//     computes no reportedVat, and points to the Tax Authority's simulator at
//     the address pcn874 itself cites (ITA_SIMULATOR_URL);
//   - findings are listed per line with the failed rule in Hebrew, in a status
//     region a screen reader announces, with labelled controls and RTL;
//   - it is registered everywhere the site lists pages, and runs the site's
//     page-view counter (the colony's weekly reader counts this page for the
//     pcn874 line once PostHog, the read key and D0 exist);
//   - it carries no price, no "buy" and no Gumroad link.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ITA_SIMULATOR_URL } from '../src/vendor/pcn874/sources.js';
import { validatePcn874 } from '../src/vendor/pcn874/validate.js';
import { PAGE_RATE_SOURCES } from '../src/lib/publish-gate.js';
import { collectDependencies } from '../src/lib/site-deps.js';
import { checkPageA11y } from '../src/lib/a11y-check.js';
import { MAX_FILE_BYTES, buildReport, ruleHebrew } from '../src/lib/pcn874-report.js';
import { productRoot, copyProduct, removeCopy, runBuild, listFiles, readIn } from './helpers/product-copy.js';
import { elementById, ancestorsAt } from './helpers/html.js';
import { shareSummary, shareText, whatsappHref } from '../src/lib/pcn874-share.js';

const PAGE = 'pcn874.html';
const read = (p) => readFileSync(join(productRoot, p), 'utf8');
const readOrNull = (p) => (existsSync(join(productRoot, p)) ? read(p) : null);
const html = readOrNull(PAGE) ?? '';
const fixtureDir = join(productRoot, '..', 'pcn874', 'tests', 'fixtures');
const fixture = (name) => readFileSync(join(fixtureDir, name), 'utf8');

/** The text a reader sees in an element found by id (tags stripped, whitespace collapsed). */
function textById(source, id) {
  const open = new RegExp(`<([a-z0-9]+)\\b[^>]*\\sid="${id}"[^>]*>`, 'i').exec(source);
  if (!open) return '';
  const tag = open[1];
  let depth = 1;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = open.index + open[0].length;
  let m;
  while ((m = re.exec(source))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return source.slice(open.index + open[0].length, m.index).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return '';
}

describe('the page, as written', () => {
  it('exists and passes every accessibility check the build runs', () => {
    expect(html).not.toBe('');
    expect(checkPageA11y(html)).toEqual([]);
  });

  it('is Hebrew, right to left', () => {
    expect(html).toMatch(/<html lang="he" dir="rtl">/);
  });

  it('labels the file input, and reads only text files', () => {
    const input = /<input\b[^>]*type="file"[^>]*>/.exec(html)?.[0] ?? '';
    expect(input).toContain('id="pcn-file"');
    expect(input).toMatch(/accept="[^"]*\.txt/);
    expect(html).toMatch(/<label for="pcn-file">[^<]+/);
  });

  it('announces results in a polite status region', () => {
    expect(html).toMatch(/<div id="pcn-status"[^>]*role="status"[^>]*aria-live="polite"/);
  });

  it('lists findings in a table with a caption and column headers: line, record, field, severity, rule', () => {
    const results = elementById(html, 'pcn-results');
    expect(results).toMatch(/<table\b[\s\S]*<caption>[^<]+<\/caption>/);
    const headers = [...results.matchAll(/<th scope="col">([^<]+)<\/th>/g)].map((m) => m[1]);
    expect(headers).toEqual(['שורה', 'רשומה', 'שדה', 'חומרה', 'הכלל שנכשל']);
    expect(html).toMatch(/<tbody id="pcn-findings">/);
  });

  it('says plainly that it checks structure only, cross-checks no amount and computes no reportedVat', () => {
    const scope = textById(html, 'pcn-scope');
    expect(scope).toContain('בודק את מבנה הקובץ בלבד');
    expect(scope).toContain('אינו מצליב סכומים');
    expect(scope).toContain('reportedVat');
    expect(scope).toContain('אינו מחשב את הסכום המדווח');
    expect(scope).toContain('עלול להידחות');
  });

  it('points to the Tax Authority simulator at the address pcn874 cites, and does not overstate it', () => {
    const scope = textById(html, 'pcn-scope');
    expect(ITA_SIMULATOR_URL).toBe('http://www.misim.gov.il/EmDvhmfrt/wUploadFileHeshboniotSim.aspx');
    expect(html).toContain(`href="${ITA_SIMULATOR_URL}"`);
    expect(scope).toContain('הסימולטור של רשות המסים');
    // pcn874's own sources say no rendered source states a price or confirms the address today.
    expect(scope).toContain('ממדריך של ספק תוכנה');
    expect(html).not.toMatch(/סימולטור (ה)?חינמי/);
    // The cited manual says the simulator checks only partly and transmission can
    // still fail (research/rendered/pcn874-h-erp-mirror.txt:1269-1270): it is not
    // "the check that decides", anywhere on the page, the FAQ data included.
    expect(scope).toContain('שגם הוא בודק באופן חלקי');
    expect(scope).toContain('ההכרעה היא בשידור עצמו');
    expect(html).not.toMatch(/הבדיקה (ה)?קובעת|הבדיקה שקובעת/);
  });

  it('says it checks only an individual merchant\'s file, not a representatives\' file (Appendix B)', () => {
    const scope = textById(html, 'pcn-scope');
    expect(scope).toContain("רק קובץ של עוסק יחיד (נספח א')");
    expect(scope).toMatch(/קובץ מייצגים \(נספח ב'\)[^.]*אינו נתמך/);
    // The FAQ must not list Appendix B among what the check rests on.
    const basis = /<summary>על איזה מסמך מבוססת הבדיקה\?<\/summary><p>([^<]+)<\/p>/.exec(html)?.[1] ?? '';
    expect(basis).toContain("נספח ב' של אותו חוזר, קובץ המייצגים, אינו נבדק");
    expect(basis).not.toMatch(/נספח ב' \(קובץ המייצגים\)/);
  });

  it('names what is not checked beyond amounts: invoice dates, check digits, allocation numbers', () => {
    const notChecked = textById(html, 'pcn-not-checked');
    expect(notChecked).toContain('תאריך החשבונית הוא תאריך קיים');
    expect(notChecked).toContain('תקופת הדיווח');
    expect(notChecked).toContain('ספרת הביקורת');
    expect(notChecked).toContain('מספר ההקצאה מתקבל גם כשהוא אפסים');
    expect(html).toMatch(/<p id="pcn-not-checked">[^]*?<a href="allocation\.html">/);
  });

  it('says in the visible scope box that the circular is from 2009 and its figures may have moved', () => {
    const scope = textById(html, 'pcn-scope');
    expect(scope).toContain('החוזר משנת 2009');
    expect(scope).toContain('משטר מספרי ההקצאה');
    expect(scope).toContain('עשויים להשתנות');
    // ...and the home page's "updated for 2026" no longer covers this tool.
    const lead = /<p class="lead">([^<]+)<\/p>/.exec(read('index.html'))?.[1] ?? '';
    expect(lead).toContain('משנת 2009');
    expect(lead).not.toMatch(/^[^;]*מעודכנים לשנת 2026\.$/);
  });

  it('never says a warning does not disqualify the file - it may be why the Authority rejects it', () => {
    const script = readOrNull('src/lib/pcn874-report.js') ?? '';
    for (const text of [html, script]) expect(text).not.toMatch(/אינה פוסלת/);
    expect(html).toContain('ייתכן שרשות המסים תדחה את הקובץ בגללה');
  });

  it('promises only that nothing FROM THE FILE leaves, and says the same in the FAQ data as on the page', () => {
    expect(html).not.toMatch(/<p class="lead">[^<]*שום דבר לא מועלה/);
    expect(/<p class="lead">([^<]+)<\/p>/.exec(html)?.[1]).toContain('שום דבר מתוך הקובץ לא מועלה');
    const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1]);
    const answer = ld.mainEntity.find((q) => q.name === 'האם הקובץ נשלח לשרת?').acceptedAnswer.text;
    const visible = /<summary>האם הקובץ נשלח לשרת\?<\/summary><p>([^<]+)<\/p>/.exec(html)?.[1];
    expect(answer).toBe(visible);
    expect(answer).toContain('מדידת הצפיות');
  });

  it('says the file is not uploaded, sent or stored', () => {
    const note = textById(html, 'pcn-file-note');
    expect(note).toContain('File API');
    expect(note).toMatch(/לא מועלה/);
    expect(note).toMatch(/לא נשמר/);
  });

  it('carries no price, no "buy" and no Gumroad link', () => {
    const script = readOrNull('assets/page-pcn874.js') ?? '';
    for (const text of [html, script]) {
      expect(text).not.toMatch(/gumroad/i);
      expect(text).not.toContain('₪');
      expect(text).not.toMatch(/\b(?:buy|price|checkout|purchase)\b/i);
      expect(text).not.toMatch(/לקנות|קנייה|רכישה|לרכוש|מחיר|בתשלום|\bPro\b/);
    }
  });

  it('after a result: a slot to print or save the findings as PDF, and a share button hidden until the browser can share', () => {
    const after = elementById(html, 'pcn-after');
    expect(html.indexOf('id="pcn-after"')).toBeGreaterThan(html.indexOf('id="pcn-results"'));
    expect(after).toMatch(/^<section\b[^>]*\shidden/);
    expect(after).toMatch(/<button type="button"[^>]*id="pcn-print"[^>]*>הדפסה \/ PDF של הממצאים<\/button>/);
    expect(after).toMatch(/<button type="button"[^>]*id="pcn-share"[^>]*\shidden[^>]*>/);
    // Only counts and rule names leave, and only when the user presses the button.
    expect(textById(html, 'pcn-share-note')).toContain('רק את מספר השגיאות והאזהרות ואת שמות הכללים');
    expect(textById(html, 'pcn-share-note')).toContain('בלי שום ערך מתוך הקובץ');
    expect(after).not.toMatch(/whatsapp|wa\.me/i);
  });

  it('prints the file name, the date checked, the scope box as it stands and "not tax advice", and none of the controls', () => {
    const header = elementById(html, 'pcn-print-header');
    expect(header).toMatch(/class="[^"]*\bprint-only\b/);
    expect(header).toContain('id="pcn-print-file"');
    expect(header).toContain('id="pcn-print-date"');
    expect(textById(html, 'pcn-print-header')).toContain('אינו ייעוץ מס');
    expect(html.indexOf('id="pcn-print-header"')).toBeLessThan(html.indexOf('id="pcn-scope"'));
    // The scope box prints verbatim: nothing around it is hidden in print.
    const around = ancestorsAt(html, html.indexOf('id="pcn-scope"'));
    for (const el of around) expect(el.attrs).not.toMatch(/no-print|\bfaq\b/);
    for (const id of ['pcn-file-field', 'pcn-file-note', 'pcn-after', 'pcn-rules']) {
      expect(elementById(html, id).slice(0, 200), id).toMatch(/class="[^"]*\bno-print\b/);
    }
    const css = read('assets/style.css');
    expect(css).toMatch(/\.print-only\s*\{\s*display:\s*none;?\s*\}/);
    expect(css).toMatch(/@media print\s*\{[^}]*\.print-only\s*\{\s*display:\s*block/);
  });

  // Review 29.9 (honesty 10, code 5): the header names a file and a date, so it prints only beside that file's
  // result. It starts hidden, and print CSS must not override `hidden` (a class rule's display:block beats the
  // browser's [hidden] rule).
  it('the print header starts hidden, and the print stylesheet keeps a hidden one hidden', () => {
    expect(elementById(html, 'pcn-print-header')).toMatch(/^<div\b[^>]*\shidden[\s>]/);
    const css = read('assets/style.css');
    expect(css).toMatch(/\.print-only\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
  });

  // RULING-2026-09-29-lines (f): the validator may be promised to stay free in the words invoice.html already uses
  // ("חינמי ונשאר חינמי") - "stays free", not "stays up" - never "לתמיד" or "לכל החיים", and with no price anywhere.
  it('answers "why is the checker free?" honestly: it stays free in invoice.html\'s words, links nothing paid, names no price', () => {
    const answer = /<summary>למה הבודק חינמי\?<\/summary><p>([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '';
    expect(answer).not.toBe('');
    expect(answer).not.toMatch(/<a\b/);
    expect(answer).toContain('רץ כולו בדפדפן');
    expect(answer).toContain('הבודק חינמי ונשאר חינמי');
    expect(read('invoice.html')).toContain('חינמיים ונשארים חינמיים');
    expect(html).not.toMatch(/לתמיד|לכל החיים|יישאר חינמי|חינם לתמיד/);
    expect(answer).not.toMatch(/₪|\d|מחיר|רישיון/);
    const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1]);
    const twin = ld.mainEntity.find((q) => q.name === 'למה הבודק חינמי?')?.acceptedAnswer.text;
    expect(twin).toBe(answer);
  });

  it('keeps accountants in scope: one dealer\'s file, yours or a client\'s - never a multi-client pitch', () => {
    expect(textById(html, 'pcn-scope')).toContain('לבדוק קובץ של עוסק אחד – שלכם או של לקוח');
    const pages = readdirSync(productRoot).filter((f) => f.endsWith('.html'));
    for (const p of pages) {
      expect(read(p), p).not.toMatch(/רואי חשבון ומייצגים|למשרדי רואי חשבון|קבצים של כמה לקוחות|כל הלקוחות שלכם בבת אחת/);
    }
  });

  it('names no person: the only face is the site', () => {
    expect(html).not.toMatch(/נבנה על ידי|built by|מאת /i);
  });
});

describe('nothing leaves the browser', () => {
  const deps = collectDependencies([{ path: PAGE, html }], (p) => readOrNull(p));
  const js = deps.files.filter((f) => f.endsWith('.js'));
  const NETWORK = /\bfetch\b|XMLHttpRequest|sendBeacon|WebSocket|EventSource|\bimportScripts\b/;
  const STORAGE = /localStorage|sessionStorage|indexedDB|document\.cookie|caches\./;
  // The site-wide counter: off until src/config/site.json carries a PostHog key,
  // cookieless, page views only (README "PostHog page views"). It injects a
  // script tag; it never reads the page's content, let alone the file.
  const COUNTER = 'src/lib/analytics.js';

  it('the page loads the bundled validator and nothing it cannot ship', () => {
    expect(deps.errors).toEqual([]);
    for (const m of ['sources', 'layout', 'parse', 'validate']) expect(js).toContain(`src/vendor/pcn874/${m}.js`);
    expect(js).toContain('assets/page-pcn874.js');
    expect(js).toContain('src/lib/pcn874-report.js');
  });

  it('no module the page loads makes a network call or touches storage', () => {
    for (const f of js) {
      expect(read(f), f).not.toMatch(NETWORK);
      expect(read(f), f).not.toMatch(STORAGE);
    }
  });

  it('only the documented counter adds a script to the page, and no page code writes HTML', () => {
    for (const f of js.filter((x) => x !== COUNTER)) {
      expect(read(f), f).not.toMatch(/createElement\(\s*['"]script['"]\s*\)/);
    }
    for (const f of ['assets/page-pcn874.js', 'src/lib/pcn874-report.js']) {
      expect(read(f), f).not.toMatch(/innerHTML|outerHTML|insertAdjacentHTML|document\.write/);
    }
  });

  it('the page has no form that posts anywhere and no third-party script', () => {
    expect(html).not.toMatch(/<form\b[^>]*\saction=/i);
    expect(html).not.toMatch(/<script\b[^>]*\ssrc="(?:https?:)?\/\//i);
  });
});

describe('where the site lists its pages', () => {
  it('the publish gate knows the page, and it renders no figure from any rate config', () => {
    expect(PAGE_RATE_SOURCES[PAGE]).toEqual([]);
  });

  it('the sitemap lists it', () => {
    expect(read('sitemap.xml')).toContain('<loc>https://il-biz-tools.netlify.app/pcn874.html</loc>');
  });

  it('the home page links to it from a tool card', () => {
    expect(read('index.html')).toMatch(/<a class="card tool-card" href="pcn874\.html">/);
  });

  it('every page with the main navigation links to it, and this page marks itself current', () => {
    const pages = readdirSync(productRoot).filter((f) => f.endsWith('.html'));
    for (const p of pages) {
      const src = read(p);
      if (!src.includes('aria-label="ניווט ראשי"')) continue;
      expect(src, p).toMatch(/<li><a href="pcn874\.html"(?: aria-current="page")?>בודק קובץ PCN874<\/a><\/li>/);
    }
    expect(html).toContain('<li><a href="pcn874.html" aria-current="page">בודק קובץ PCN874</a></li>');
  });

  it('npm run check:html checks it as a tool page and passes', () => {
    const r = spawnSync(process.execPath, [join(productRoot, 'scripts/check-html.js')], { encoding: 'utf8' });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain(`ok ${PAGE}`);
  });
});

// The pcn874 line lists "weekly page views (cookieless)" as a KPI. The page runs
// the site's counter, so once posthog.projectKey is set PostHog has its views by
// URL. Since 29.9.2026 the colony's tick reads them (src/revenue/page-views.ts and
// page-views-reader.ts, tested in src/__tests__/revenue/page-views*.test.ts) and
// counts this page, and only this page, for the pcn874 line. Until the project,
// the read key and D0 exist it reads nothing, and an unmeasured week is a missing
// reading, never a zero.
describe('page views: the counter runs, the colony reader counts this page for pcn874', () => {
  const portfolio = readFileSync(join(productRoot, '..', '..', 'src', 'revenue', 'portfolio.ts'), 'utf8');
  const lineBlock = (id) => {
    const at = portfolio.indexOf(`id: "${id}"`);
    return at === -1 ? '' : portfolio.slice(at, portfolio.indexOf('skillName', at));
  };

  it('both lines exist in the portfolio and name the cookieless page-view KPI', () => {
    for (const id of ['pcn874', 'il-biz-tools']) expect(lineBlock(id), id).toContain('weekly page views (cookieless)');
  });

  it('the colony reader maps this page, and no other, to the pcn874 line', () => {
    const reader = readFileSync(join(productRoot, '..', '..', 'src', 'revenue', 'page-views.ts'), 'utf8');
    expect(reader).toContain(`export const PCN874_PAGE = "${PAGE}";`);
    expect(reader).toMatch(/return page === PCN874_PAGE \? "pcn874" : "il-biz-tools";/);
  });

  it('the page runs the site\'s own counter (initPage installs it) and no other', () => {
    const script = read('assets/page-pcn874.js');
    expect(script).toMatch(/import \{[^}]*\binitPage\b[^}]*\} from '\.\/common\.js'/);
    expect(script).toMatch(/^initPage\(\);$/m);
  });
});

// ---------------------------------------------------------------------------
// The page script, loaded for real against a minimal fake DOM, with every
// network and storage API replaced by a trap that records any use.

const statusText = (page) => page.byId('#pcn-status').textContent;

function makeEl(tag) {
  const listeners = {};
  const el = {
    tag, children: [], attrs: {}, hidden: false, className: '', value: '', files: null, _text: '',
    get textContent() { return el._text + el.children.map((c) => c.textContent).join(' '); },
    set textContent(v) { el._text = String(v); el.children = []; },
    append(...xs) { for (const x of xs) el.children.push(typeof x === 'string' ? { textContent: x } : x); },
    appendChild(x) { el.children.push(x); return x; },
    setAttribute(k, v) { el.attrs[k] = String(v); },
    getAttribute(k) { return el.attrs[k] ?? null; },
    addEventListener(type, fn) { (listeners[type] ??= []).push(fn); },
    async fire(type) { for (const fn of listeners[type] ?? []) await fn({ target: el }); },
  };
  return el;
}

const collect = (el, tag, out = []) => {
  for (const c of el.children ?? []) {
    if (c.tag === tag) out.push(c);
    collect(c, tag, out);
  }
  return out;
};

async function loadPage({ validatorThrows = false, share = undefined, fallbackOn = false } = {}) {
  vi.resetModules();
  const els = new Map();
  const byId = (sel) => {
    if (!els.has(sel)) els.set(sel, makeEl(sel));
    return els.get(sel);
  };
  const initPage = vi.fn();
  vi.doMock('../assets/common.js', () => ({ initPage, $: (sel) => byId(sel), $$: () => [] }));
  if (fallbackOn) {
    vi.doMock('../src/lib/pcn874-share.js', async (importOriginal) => ({ ...(await importOriginal()), WHATSAPP_FALLBACK_ENABLED: true }));
  }
  if (validatorThrows) {
    vi.doMock('../src/vendor/pcn874/validate.js', async (importOriginal) => ({
      ...(await importOriginal()),
      validatePcn874: () => { throw new Error('validator bug'); },
    }));
  }
  const used = [];
  const trap = (name) => new Proxy(function () {}, {
    get: (_, key) => { used.push(`${name}.${String(key)}`); return undefined; },
    apply: () => { used.push(name); throw new Error(`${name} called`); },
    construct: () => { used.push(`new ${name}`); throw new Error(`${name} constructed`); },
  });
  for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'localStorage', 'sessionStorage', 'indexedDB']) {
    vi.stubGlobal(name, trap(name));
  }
  const shared = [];
  const nav = { sendBeacon: trap('sendBeacon') };
  if (share) nav.share = async (data) => { shared.push(data); if (share === 'cancel') { const e = new Error('cancelled'); e.name = 'AbortError'; throw e; } };
  vi.stubGlobal('navigator', nav);
  const printed = [];
  vi.stubGlobal('window', { print: () => printed.push(true) });
  const created = [];
  vi.stubGlobal('document', { createElement: (tag) => { const el = makeEl(tag); created.push(el); return el; }, querySelector: byId, cookie: '' });
  await import('../assets/page-pcn874.js');
  const input = byId('#pcn-file');
  const fileOf = (name, content, { failRead = false } = {}) => {
    const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content;
    return { name, size: bytes.length, arrayBuffer: async () => { if (failRead) throw new Error('unreadable'); return bytes.buffer; } };
  };
  const pick = async (file) => {
    input.files = [file];
    input.value = `C:\\fakepath\\${file.name}`;
    await input.fire('change');
  };
  const choose = (name, content, opts) => pick(fileOf(name, content, opts));
  return { byId, initPage, used, choose, pick, fileOf, input, shared, printed, created };
}

/** Hebrew letters as Windows-1255 bytes (alef..tav are 0xE0..0xFA); ASCII as itself. */
const cp1255 = (text) =>
  Uint8Array.from([...text].map((ch) => {
    const code = ch.charCodeAt(0);
    if (code < 0x80) return code;
    if (code >= 0x5d0 && code <= 0x5ea) return 0xe0 + (code - 0x5d0);
    throw new Error(`no cp1255 byte for ${ch}`);
  }));

describe('the page script, with a file chosen', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock('../assets/common.js');
    vi.doUnmock('../src/vendor/pcn874/validate.js');
  });

  it('installs the site\'s page setup (and so its counter) once on load', async () => {
    const page = await loadPage();
    expect(page.initPage).toHaveBeenCalledTimes(1);
  });

  it('shows the summary in the status region and one table row per finding, per line, rule in Hebrew', async () => {
    const page = await loadPage();
    const text = fixture('invalid-detail-semantics.txt');
    await page.choose('march.txt', text);
    const report = buildReport(validatePcn874(text));
    const status = page.byId('#pcn-status');
    expect(status.textContent).toContain(report.summary);
    expect(status.textContent).toContain('march.txt');
    expect(status.className).toBe('status-box over');
    const rows = collect(page.byId('#pcn-findings'), 'tr');
    expect(rows.length).toBe(report.rows.length);
    report.rows.forEach((row, i) => {
      const t = rows[i].textContent;
      expect(t).toContain(row.where);
      expect(t).toContain(row.record);
      expect(t).toContain(row.severityHe);
      expect(t).toContain(ruleHebrew(row.rule));
      expect(t).toContain(row.rule);
    });
    expect(page.byId('#pcn-results').hidden).toBe(false);
  });

  it('keeps the validator\'s English beside the Hebrew, marked as English and left to right', async () => {
    const page = await loadPage();
    await page.choose('march.txt', fixture('invalid-detail-semantics.txt'));
    const english = collect(page.byId('#pcn-findings'), 'p').filter((p) => p.attrs.lang === 'en');
    expect(english.length).toBeGreaterThan(0);
    for (const p of english) expect(p.attrs.dir).toBe('ltr');
  });

  it('a clean file: says so in a neutral box, not a green one, lists nothing, and still says this is not acceptance', async () => {
    const page = await loadPage();
    await page.choose('clean.txt', fixture('valid-minimal.txt'));
    const status = page.byId('#pcn-status');
    expect(status.className).toBe('status-box');
    expect(status.textContent).toContain('לא נמצאו שגיאות');
    expect(status.textContent).toContain('לא אישור שהקובץ יתקבל');
    expect(page.byId('#pcn-results').hidden).toBe(true);
  });

  it('warnings only: a warning box, and the rows are listed', async () => {
    const page = await loadPage();
    await page.choose('w.txt', fixture('warnings-only.txt'));
    expect(page.byId('#pcn-status').className).toBe('status-box warn');
    expect(collect(page.byId('#pcn-findings'), 'tr').length).toBeGreaterThan(0);
  });

  it('a file that cannot be read: says so in Hebrew and shows no stale findings', async () => {
    const page = await loadPage();
    await page.choose('march.txt', fixture('invalid-detail-semantics.txt'));
    await page.choose('broken.txt', '', { failRead: true });
    expect(page.byId('#pcn-status').textContent).toContain('לא ניתן היה לקרוא את הקובץ');
    expect(page.byId('#pcn-results').hidden).toBe(true);
    expect(collect(page.byId('#pcn-findings'), 'tr')).toEqual([]);
  });

  it('empties the file input after each pick, so picking the same (fixed) file again runs the check again', async () => {
    const page = await loadPage();
    await page.choose('PCN874.TXT', fixture('invalid-counts.txt'));
    expect(page.input.value).toBe('');
    expect(statusText(page)).toContain('אינו תואם למבנה');
    await page.choose('PCN874.TXT', fixture('valid-minimal.txt'));
    expect(page.input.value).toBe('');
    expect(statusText(page)).toContain('לא נמצאו שגיאות ולא אזהרות');
  });

  it('a file too large to check: refused before a byte is read, in Hebrew', async () => {
    const page = await loadPage();
    let read = false;
    await page.pick({ name: 'huge.txt', size: MAX_FILE_BYTES + 1, arrayBuffer: async () => { read = true; throw new Error('must not be read'); } });
    expect(read).toBe(false);
    expect(page.byId('#pcn-status').className).toBe('status-box over');
    expect(statusText(page)).toContain('huge.txt');
    expect(statusText(page)).toContain('לא נבדק');
    expect(page.byId('#pcn-results').hidden).toBe(true);
  });

  it('a validator failure is reported as the checker failing, not as an unreadable file or a finding', async () => {
    const page = await loadPage({ validatorThrows: true });
    await page.choose('march.txt', fixture('valid-minimal.txt'));
    const text = statusText(page);
    expect(text).toContain('הבודק נכשל');
    expect(text).toContain('לא נקבע דבר לגבי הקובץ');
    expect(text).not.toContain('לא ניתן היה לקרוא');
    expect(page.byId('#pcn-status').className).toBe('status-box over');
    expect(page.byId('#pcn-results').hidden).toBe(true);
  });

  it('a slower earlier file never overwrites a later file\'s result', async () => {
    const page = await loadPage();
    let release;
    const slowBytes = new TextEncoder().encode(fixture('invalid-counts.txt'));
    const slow = { name: 'slow.txt', size: slowBytes.length, arrayBuffer: () => new Promise((resolve) => { release = () => resolve(slowBytes.buffer); }) };
    page.input.files = [slow];
    const first = page.input.fire('change');
    await page.choose('fast.txt', fixture('valid-minimal.txt'));
    release();
    await first;
    expect(statusText(page)).toContain('fast.txt');
    expect(statusText(page)).not.toContain('slow.txt');
    expect(collect(page.byId('#pcn-findings'), 'tr')).toEqual([]);
  });

  it('lists at most 2000 findings and says how many there were', async () => {
    const page = await loadPage();
    const lines = [fixture('valid-minimal.txt').split('\n')[0], ...Array.from({ length: 2100 }, () => 'Q'.repeat(60))];
    await page.choose('many.txt', lines.join('\n'));
    const report = buildReport(validatePcn874(lines.join('\n')));
    expect(report.total).toBeGreaterThan(2000);
    expect(collect(page.byId('#pcn-findings'), 'tr').length).toBe(2000);
    expect(page.byId('#pcn-more').textContent).toBe(`מוצגים 2000 הממצאים הראשונים מתוך ${report.total}.`);
  });

  it('a Windows-1255 file: says it is not UTF-8, and does not claim its byte widths', async () => {
    const page = await loadPage();
    await page.choose('cp1255.txt', cp1255(fixture('warnings-refgroup-hebrew.txt')));
    expect(statusText(page)).toContain('אינו בקידוד UTF-8');
    expect(statusText(page)).toContain('Windows-1255');
    const rows = collect(page.byId('#pcn-findings'), 'tr');
    const widthRow = rows.find((r) => r.textContent.includes('file.byteWidth'));
    expect(widthRow.textContent).toContain('אינו מתאר את רוחב הרשומות בקובץ עצמו');
    expect(widthRow.textContent).not.toContain('ימצא את השדות שאחרי התו החריג מוזזים');
  });

  it('a file that starts with a byte-order mark: names the invisible character', async () => {
    const page = await loadPage();
    const bytes = Uint8Array.from([0xef, 0xbb, 0xbf, ...new TextEncoder().encode(fixture('valid-minimal.txt'))]);
    await page.choose('bom.txt', bytes);
    expect(statusText(page)).toContain('U+FEFF');
    expect(statusText(page)).toContain('BOM');
  });

  it('never touches the network or storage, whatever the file', async () => {
    const page = await loadPage();
    for (const name of ['invalid-detail-semantics.txt', 'valid-minimal.txt', 'warnings-refgroup-hebrew.txt']) {
      await page.choose(name, fixture(name));
    }
    await page.choose('x.txt', '<img src=x onerror=alert(1)>');
    expect(page.used).toEqual([]);
  });
});

describe('the post-result slot, with a file checked', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.doUnmock('../assets/common.js');
    vi.doUnmock('../src/vendor/pcn874/validate.js');
    vi.doUnmock('../src/lib/pcn874-share.js');
  });

  it('stays hidden until a check finishes, then shows with the file name and the date for the printout', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 28, 12, 0, 0));
    const page = await loadPage();
    expect(page.byId('#pcn-after').hidden).toBe(true);
    await page.choose('march.txt', fixture('invalid-counts.txt'));
    expect(page.byId('#pcn-after').hidden).toBe(false);
    expect(page.byId('#pcn-print-file').textContent).toBe('march.txt');
    expect(page.byId('#pcn-print-date').textContent).toBe('28.9.2026');
  });

  it('a clean file gets the slot too; a read failure or a checker failure hides it again', async () => {
    const page = await loadPage();
    await page.choose('clean.txt', fixture('valid-minimal.txt'));
    expect(page.byId('#pcn-after').hidden).toBe(false);
    await page.choose('broken.txt', '', { failRead: true });
    expect(page.byId('#pcn-after').hidden).toBe(true);
    const failing = await loadPage({ validatorThrows: true });
    await failing.choose('march.txt', fixture('valid-minimal.txt'));
    expect(failing.byId('#pcn-after').hidden).toBe(true);
  });

  it('the print header is shown only with a result: check A, then a file B that fails, and A\'s name is gone', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 28, 12, 0, 0));
    const page = await loadPage();
    const header = () => page.byId('#pcn-print-header');
    expect(header().hidden).toBe(true);
    await page.choose('A-march.txt', fixture('invalid-counts.txt'));
    expect(header().hidden).toBe(false);
    expect(page.byId('#pcn-print-file').textContent).toBe('A-march.txt');

    for (const [name, content, opts] of [
      ['B-unreadable.txt', '', { failRead: true }],
      ['B-huge.txt', new Uint8Array(1)],
    ]) {
      await page.choose('A-march.txt', fixture('invalid-counts.txt'));
      if (name === 'B-huge.txt') {
        const huge = page.fileOf(name, content);
        huge.size = 1024 * 1024 * 1024;
        await page.pick(huge);
      } else {
        await page.choose(name, content, opts);
      }
      expect(header().hidden, name).toBe(true);
      expect(page.byId('#pcn-print-file').textContent, name).toBe('');
      expect(page.byId('#pcn-print-date').textContent, name).toBe('');
    }
  });

  it('a checker failure after a good check hides the header too', async () => {
    const page = await loadPage({ validatorThrows: true });
    await page.choose('A-march.txt', fixture('valid-minimal.txt'));
    expect(page.byId('#pcn-print-header').hidden).toBe(true);
    expect(page.byId('#pcn-print-file').textContent).toBe('');
  });

  it('the print button prints the page, and only when pressed', async () => {
    const page = await loadPage();
    await page.choose('march.txt', fixture('invalid-counts.txt'));
    expect(page.printed).toEqual([]);
    await page.byId('#pcn-print').fire('click');
    expect(page.printed).toEqual([true]);
  });

  it('no navigator.share: the share button stays hidden, and no WhatsApp link is made (the fallback is off)', async () => {
    const page = await loadPage();
    await page.choose('march.txt', fixture('invalid-counts.txt'));
    expect(page.byId('#pcn-share').hidden).toBe(true);
    const links = page.created.filter((el) => el.tag === 'a');
    expect(links).toEqual([]);
    for (const el of page.created) expect(JSON.stringify(el.attrs)).not.toMatch(/whatsapp|wa\.me/i);
  });

  it('with navigator.share: the button shows, shares nothing until pressed, then shares only counts, rule names and the address', async () => {
    const page = await loadPage({ share: 'ok' });
    expect(page.byId('#pcn-share').hidden).toBe(false);
    const text = fixture('invalid-detail-semantics.txt');
    await page.choose('client-ACME-march.txt', text);
    expect(page.shared).toEqual([]);
    await page.byId('#pcn-share').fire('click');
    expect(page.shared.length).toBe(1);
    const sent = page.shared[0];
    expect(sent.text).toBe(shareText(shareSummary(validatePcn874(text))));
    expect(sent.text).not.toContain('client-ACME-march');
    expect(sent.url).toBeUndefined();
    expect(page.used).toEqual([]);
  });

  it('a share the user cancels says nothing; the page stays as it was', async () => {
    const page = await loadPage({ share: 'cancel' });
    await page.choose('march.txt', fixture('invalid-counts.txt'));
    const before = statusText(page);
    await page.byId('#pcn-share').fire('click');
    expect(statusText(page)).toBe(before);
    expect(page.byId('#pcn-share-status').textContent).toBe('');
  });

  it('once the fallback is turned on (after a recorded device test), a browser without navigator.share gets a WhatsApp link to exactly the share text', async () => {
    const page = await loadPage({ fallbackOn: true });
    const text = fixture('invalid-counts.txt');
    await page.choose('march.txt', text);
    const links = page.created.filter((el) => el.tag === 'a');
    expect(links.length).toBe(1);
    expect(links[0].attrs.href).toBe(whatsappHref(shareText(shareSummary(validatePcn874(text)))));
    expect(links[0].hidden).toBe(false);
    expect(page.byId('#pcn-share').hidden).toBe(true);
    await page.choose('broken.txt', '', { failRead: true });
    expect(links[0].hidden).toBe(true);
  });

  it('the share button before any check shares nothing', async () => {
    const page = await loadPage({ share: 'ok' });
    await page.byId('#pcn-share').fire('click');
    expect(page.shared).toEqual([]);
  });
});

describe('the build ships it', () => {
  it('the preview build carries the page, its script and the bundle, and lists it in the sitemap', () => {
    const dir = copyProduct();
    try {
      const r = runBuild(dir, '--preview');
      expect(r.status, r.stderr).toBe(0);
      const out = join(dir, '_preview');
      const files = listFiles(out);
      for (const f of [PAGE, 'assets/page-pcn874.js', 'src/lib/pcn874-report.js', 'src/vendor/pcn874/validate.js']) expect(files, f).toContain(f);
      expect(files).not.toContain('src/lib/pcn874-bundle.js');
      expect(readIn(out, 'sitemap.xml')).toContain('pcn874.html');
      expect(readIn(out, PAGE)).toBe(html);
    } finally {
      removeCopy(dir);
    }
  });
});
