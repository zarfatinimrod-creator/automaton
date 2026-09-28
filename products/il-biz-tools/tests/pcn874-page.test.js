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
//   - it is registered everywhere the site lists pages, and counts its page
//     views toward the pcn874 line;
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
import { buildReport, ruleHebrew } from '../src/lib/pcn874-report.js';
import { PAGE_KPI_LINES, kpiLineOf } from '../src/lib/page-kpis.js';
import { productRoot, copyProduct, removeCopy, runBuild, listFiles, readIn } from './helpers/product-copy.js';

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
    expect(html).toMatch(/<table\b[\s\S]*<caption>[^<]+<\/caption>/);
    const headers = [...html.matchAll(/<th scope="col">([^<]+)<\/th>/g)].map((m) => m[1]);
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

describe('page views count toward the pcn874 line', () => {
  const portfolio = readFileSync(join(productRoot, '..', '..', 'src', 'revenue', 'portfolio.ts'), 'utf8');
  const lineBlock = (id) => {
    const at = portfolio.indexOf(`id: "${id}"`);
    return at === -1 ? '' : portfolio.slice(at, portfolio.indexOf('skillName', at));
  };

  it('maps this page to the pcn874 line, and every other page to il-biz-tools', () => {
    expect(kpiLineOf(PAGE)).toBe('pcn874');
    expect(kpiLineOf('vat.html')).toBe('il-biz-tools');
    expect(Object.keys(PAGE_KPI_LINES)).toEqual([PAGE]);
  });

  it('both lines exist in the portfolio and carry the cookieless page-view KPI', () => {
    for (const id of ['pcn874', 'il-biz-tools']) expect(lineBlock(id), id).toContain('weekly page views (cookieless)');
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

async function loadPage() {
  vi.resetModules();
  const els = new Map();
  const byId = (sel) => {
    if (!els.has(sel)) els.set(sel, makeEl(sel));
    return els.get(sel);
  };
  const initPage = vi.fn();
  vi.doMock('../assets/common.js', () => ({ initPage, $: (sel) => byId(sel), $$: () => [] }));
  const used = [];
  const trap = (name) => new Proxy(function () {}, {
    get: (_, key) => { used.push(`${name}.${String(key)}`); return undefined; },
    apply: () => { used.push(name); throw new Error(`${name} called`); },
    construct: () => { used.push(`new ${name}`); throw new Error(`${name} constructed`); },
  });
  for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'localStorage', 'sessionStorage', 'indexedDB']) {
    vi.stubGlobal(name, trap(name));
  }
  vi.stubGlobal('navigator', { sendBeacon: trap('sendBeacon') });
  vi.stubGlobal('document', { createElement: (tag) => makeEl(tag), querySelector: byId, cookie: '' });
  await import('../assets/page-pcn874.js');
  const input = byId('#pcn-file');
  const choose = async (name, text, { failRead = false } = {}) => {
    const bytes = new TextEncoder().encode(text);
    input.files = [{ name, size: bytes.length, arrayBuffer: async () => { if (failRead) throw new Error('unreadable'); return bytes.buffer; } }];
    await input.fire('change');
  };
  return { byId, initPage, used, choose, input };
}

describe('the page script, with a file chosen', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => { vi.unstubAllGlobals(); vi.doUnmock('../assets/common.js'); });

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

  it('a clean file: says so, lists nothing, and still says this is not acceptance', async () => {
    const page = await loadPage();
    await page.choose('clean.txt', fixture('valid-minimal.txt'));
    const status = page.byId('#pcn-status');
    expect(status.className).toBe('status-box ok');
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

  it('never touches the network or storage, whatever the file', async () => {
    const page = await loadPage();
    for (const name of ['invalid-detail-semantics.txt', 'valid-minimal.txt', 'warnings-refgroup-hebrew.txt']) {
      await page.choose(name, fixture(name));
    }
    await page.choose('x.txt', '<img src=x onerror=alert(1)>');
    expect(page.used).toEqual([]);
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
      expect(files).not.toContain('src/lib/page-kpis.js');
      expect(readIn(out, 'sitemap.xml')).toContain('pcn874.html');
      expect(readIn(out, PAGE)).toBe(html);
    } finally {
      removeCopy(dir);
    }
  });
});
