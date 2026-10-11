// osek-patur.html since 11.10.2026 (research/channel-loop/RULING-2026-10-11-osek-patur-ceiling.md): the tracker
// computes for the tax years a primary text gives the ceiling for (2024 and 2025, ₪120,000, the gazette's section 35)
// and offers 2026 as not computed, with the one sentence the config's pendingYears.2026 holds; the 2026 amount stays in
// osek-patur-unverified.json, which nothing the page loads names and the build never ships.
//
// The page script runs for real against a minimal fake DOM, with the clock in 2026: the year select, the result box,
// the meter and the amounts, and the months kept per tax year. Then the page and the files it loads are read for every
// form of the held-back amount, and a build of a copy of the product shows the page shipping as itself.
import { describe, it, expect, vi, afterEach, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { offeredYears } from '../src/lib/osek-patur.js';
import { formatILS } from '../src/lib/money.js';
import { elementById, textOf, faqJsonLd } from './helpers/html.js';
import { copyProduct, removeCopy, runBuild, listFiles, readIn, editIn, fillContact, productRoot } from './helpers/product-copy.js';
import { CONFIG_PUBLISH_RULES } from '../src/lib/publish-gate.js';

const read = (p) => readFileSync(join(productRoot, p), 'utf8');
const html = read('osek-patur.html');
const config = JSON.parse(read('src/config/osek-patur.json'));
const unverified = JSON.parse(read('src/config/osek-patur-unverified.json'));
const PENDING = config.pendingYears['2026'].he;
const AMOUNTS = ['#total', '#percent', '#remaining', '#avg', '#projection', '#safe'];

/** Every way a page or a file could write the held-back amount. */
const held = unverified.years['2026'].ceiling;
const FORMS = [String(held), held.toLocaleString('en-US'), formatILS(held, { decimals: 0 }), `₪${held.toLocaleString('en-US')}`, `${String(held).slice(0, 3)}_${String(held).slice(3)}`];
const holdsHeld = (text) => FORMS.some((f) => text.includes(f)) || /122[,_\s]?833/.test(text);

function makeEl(id, byId) {
  const listeners = {};
  const el = {
    id, hidden: false, textContent: '', value: '', className: '', style: {}, innerHTML: '',
    addEventListener(type, fn) { (listeners[type] ??= []).push(fn); },
    fire(type) { for (const fn of listeners[type] ?? []) fn({ target: el }); },
    appendChild(x) { return x; },
    // A created wrapper hands out the input its markup names, so the test reaches it by id.
    querySelector(sel) {
      const named = /id="([^"]+)"/.exec(el.innerHTML);
      if (sel === 'input' && named) return byId(`#${named[1]}`);
      return byId(`${id} ${sel}`);
    },
  };
  return el;
}

async function loadAt(date, stored = {}) {
  vi.resetModules();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(date);
  const els = new Map();
  const byId = (sel) => {
    if (!els.has(sel)) els.set(sel, makeEl(sel, byId));
    return els.get(sel);
  };
  const setMoney = (el, value) => { el.money = value; el.textContent = formatILS(value, { decimals: 0 }); };
  vi.doMock('../assets/common.js', () => ({ initPage: () => {}, $: byId, setMoney }));
  const memory = new Map(Object.entries(stored));
  vi.stubGlobal('localStorage', { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v) });
  vi.stubGlobal('document', { createElement: () => makeEl('created', byId) });
  await import('../assets/page-osek-patur.js');
  const select = (y) => { byId('#tax-year').value = y; byId('#tax-year').fire('change'); };
  const type = (i, v) => { byId(`#m${i}`).value = v; byId(`#m${i}`).fire('input'); };
  return { $: byId, select, type, memory };
}

describe('osek-patur.html, the page script', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.doUnmock('../assets/common.js');
  });

  it('opens on 2025 with the clock in 2026: the ceiling it computes against is 120,000', async () => {
    const page = await loadAt(new Date(2026, 9, 11, 12));
    expect(page.$('#tax-year').value).toBe('2025');
    expect(page.$('#year').textContent).toBe('2025');
    expect(page.$('#remaining').money).toBe(120000);
    expect(page.$('#remaining').textContent).toBe(formatILS(120000, { decimals: 0 }));
    expect(page.$('#status-label').textContent).toBe('במסגרת התקרה');
    expect(page.$('#status-label').hidden).toBe(false);
    page.type(0, '102000');
    expect(page.$('#status').className).toBe('status-box warn');
    expect(page.$('#percent').textContent).toBe('85%');
    expect(page.$('#remaining').money).toBe(18000);
  });

  it('with 2026 selected, the result box holds the pending sentence and no amount: empty meter, blank cells', async () => {
    const page = await loadAt(new Date(2026, 9, 11, 12));
    page.type(0, '10000');
    page.select('2026');
    expect(page.$('#year').textContent).toBe('2026');
    expect(page.$('#status-text').textContent).toBe(PENDING);
    expect(page.$('#status-label').hidden).toBe(true);
    expect(page.$('#status-sep').hidden).toBe(true);
    expect(page.$('#status').className).toBe('status-box warn');
    expect(page.$('#meter').className).toBe('meter');
    expect(page.$('#meter i').style.width).toBe('0%');
    for (const s of AMOUNTS) expect(page.$(s).textContent, s).toBe('');
    for (const s of ['#status-text', ...AMOUNTS]) expect(holdsHeld(page.$(s).textContent), s).toBe(false);
    // Back to 2025: it computes again, the label returns.
    page.select('2025');
    expect(page.$('#status-label').hidden).toBe(false);
    expect(page.$('#remaining').money).toBe(120000 - 10000);
  });

  it('keeps the months per tax year, under one key per year', async () => {
    const page = await loadAt(new Date(2026, 9, 11, 12), { 'ilbiz.osek-patur.2024': JSON.stringify([5000, 0, 0]) });
    page.type(1, '7000');
    expect(JSON.parse(page.memory.get('ilbiz.osek-patur.2025'))[1]).toBe(7000);
    page.select('2024');
    expect(page.$('#m0').value).toBe(5000);
    expect(page.$('#m1').value).toBe('');
    expect(page.$('#remaining').money).toBe(115000);
    page.select('2025');
    expect(page.$('#m1').value).toBe(7000);
  });

  it('the stale-year label is retired: no #ceiling-stale on the page, no staleYearHe in the script', () => {
    const script = read('assets/page-osek-patur.js');
    expect(script).not.toMatch(/staleYearHe|ceiling-stale/);
    expect(html).not.toContain('ceiling-stale');
  });

  it('every element the script reaches for is an id on the page', () => {
    const script = read('assets/page-osek-patur.js');
    const ids = [...new Set([...script.matchAll(/\$\('(#[\w-]+)/g)].map((m) => m[1]))];
    expect(ids.length).toBeGreaterThan(8);
    for (const s of ids) expect(html, s).toContain(`id="${s.slice(1)}"`);
  });
});

describe('osek-patur.html, the year select and the texts the ruling gives', () => {
  it('offers 2025 (selected), 2024 and "2026 – הכלי לא מחשב", as offeredYears() lists them', () => {
    const select = elementById(html, 'tax-year');
    const options = [...select.matchAll(/<option value="([^"]+)"( selected)?>([^<]*)<\/option>/g)].map((m) => ({ value: m[1], selected: !!m[2], label: m[3] }));
    expect(options.map((o) => o.value)).toEqual(offeredYears().map((y) => y.year));
    expect(options).toEqual([
      { value: '2025', selected: true, label: '2025' },
      { value: '2024', selected: false, label: '2024' },
      { value: '2026', selected: false, label: '2026 – הכלי לא מחשב' },
    ]);
    expect(html).toContain('<label for="tax-year">שנת המס</label>');
  });

  it('the head states no 2026 amount and names the years it computes', () => {
    expect(/<title>([^<]*)<\/title>/.exec(html)[1]).toBe('מעקב תקרת עוסק פטור – כמה נשאר עד התקרה?');
    expect(html).toContain('<meta name="description" content="הזינו את ההכנסות החודשיות שלכם וראו כמה נותר עד תקרת עוסק פטור בשנת המס שבחרתם (2024 או 2025), מה התחזית השנתית ומתי כדאי להיערך למעבר לעוסק מורשה. לשנת 2026 הכלי לא מחשב עד שייקרא מקור ראשוני.">');
    expect(html).toContain('<meta property="og:description" content="כמה נשאר לכם עד תקרת עוסק פטור? מעקב חודשי עם התרעה, לשנות המס 2024 ו-2025.">');
  });

  it('the FAQ answer on the ceiling, and its JSON-LD twin, carry the 2024-2025 figure, the pending sentence and the source line', () => {
    const answer = /<summary>מהי תקרת עוסק פטור\?<\/summary><p>([^<]*)<\/p>/.exec(html)[1];
    expect(faqJsonLd(html).get('מהי תקרת עוסק פטור?')).toBe(answer.replaceAll('&quot;', '"'));
    expect(answer.startsWith('לשנות המס 2024 ו-2025: 120,000 ₪ מחזור שנתי (חוק ההתייעלות הכלכלית, סעיף 35, ספר החוקים 3045 עמ\' 173). מדובר בסך התקבולים מלקוחות, לא ברווח שנשאר אחרי הוצאות. ')).toBe(true);
    expect(answer).toContain(PENDING);
  });
});

describe('122,833 is held back: no page, script, module or shipped config states it', () => {
  it('no form of it in osek-patur.html, index.html, the page script, the module, or osek-patur.json', () => {
    for (const f of ['osek-patur.html', 'index.html', 'assets/page-osek-patur.js', 'src/lib/osek-patur.js', 'src/config/osek-patur.json']) {
      expect(holdsHeld(read(f)), f).toBe(false);
    }
    for (const t of [textOf(html), ...faqJsonLd(html).values()]) expect(holdsHeld(t)).toBe(false);
  });

  it('the unverified file holds it, with the ruling\'s grade, and says it is not verified', () => {
    expect(unverified.verified).toBe(false);
    expect(Object.keys(unverified.years)).toEqual(Object.keys(config.pendingYears));
    expect(held).toBe(122833);
    expect(unverified.years['2026'].grade).toContain('not a product input (ruling 11.10 row 27)');
    expect(unverified.years['2026'].grade).toContain('search-summary read of 7.9.2026');
    expect(config.pendingYears['2026'].unverifiedValueIn).toBe('src/config/osek-patur-unverified.json');
    for (const y of Object.keys(config.pendingYears)) expect(config.years[y], y).toBeUndefined();
  });

  it('nothing the page loads names the unverified file', () => {
    for (const f of ['osek-patur.html', 'assets/page-osek-patur.js', 'src/lib/osek-patur.js']) expect(read(f), f).not.toContain('osek-patur-unverified');
  });

  describe('a build of a copy of the product', () => {
    const copies = [];
    afterAll(() => copies.forEach(removeCopy));

    it('ships osek-patur.html as itself, never the unverified file, and no shipped file states the held-back amount', () => {
      const dir = copyProduct();
      copies.push(dir);
      fillContact(dir);
      const r = runBuild(dir);
      expect(r.status, r.stderr).toBe(0);
      const site = join(dir, '_site');
      const built = readIn(site, 'osek-patur.html');
      expect(built).not.toContain('לא מאומת');
      expect(built).toContain('id="ceiling-source"');
      expect(built).toContain('id="tax-year"');
      const files = listFiles(site);
      expect(files).toContain('src/config/osek-patur.json');
      expect(files).not.toContain('src/config/osek-patur-unverified.json');
      for (const f of ['osek-patur.html', 'index.html', 'assets/page-osek-patur.js', 'src/lib/osek-patur.js', 'src/config/osek-patur.json']) {
        expect(holdsHeld(readIn(site, f)), f).toBe(false);
      }
    });

    it('the gate gives the unverified file the "verified" rule, so a shipped script that loads it stops the build', () => {
      expect(CONFIG_PUBLISH_RULES['src/config/osek-patur-unverified.json']).toBe('verified');
      const dir = copyProduct();
      copies.push(dir);
      fillContact(dir);
      editIn(dir, 'assets/page-osek-patur.js', (s) => `${s}\nexport const leak = () => fetch('src/config/osek-patur-unverified.json');\n`);
      const r = runBuild(dir);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain('src/config/osek-patur-unverified.json');
    });
  });
});
