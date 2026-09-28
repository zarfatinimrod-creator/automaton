// The invoice page itself, loaded for real (assets/page-invoice.js) against a
// minimal fake DOM, a fake localStorage and a counted fetch.
//
// These are the acceptance tests the decision states in terms of the page:
// AT-6 (cached Pro survives everything non-definitive), AT-7 (re-check
// throttle and the stored product id), AT-8 (activation), AT-10 (the retired
// format). Nothing here touches the network.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LICENSE_STORAGE_KEY, LICENSE_NOTES } from '../src/lib/license.js';
import { proButtonState } from '../src/lib/gumroad.js';
import { formatILS } from '../src/lib/money.js';
import { documentedSuccess, NOT_FOUND_BODIES, NON_DEFINITIVE, response, fetchMock, deferredFetch, memoryStorage } from './fixtures/gumroad-verify.js';

const KEY = 'A1B2C3D4-E5F60718-9ABCDEF0-1234ABCD';
const LEGACY = ['ILBIZ', '1', '.abc.def'].join('');
const DAY = 86_400_000;
const NOW = Date.UTC(2026, 8, 27, 12, 0, 0);

// The Pro product the page can sell: url, id and the price Gumroad read back.
const READY_GUMROAD = { productUrl: 'https://mehudak.gumroad.com/l/pro', productId: 'NEW', priceCents: 7900, currency: 'ils' };
const PNG = 'data:image/png;base64,iVBORw0KGgo=';

function makeEl(name) {
  const listeners = {};
  const attrs = new Map();
  const el = {
    name, hidden: false, disabled: false, textContent: '', value: '', innerHTML: '', open: false,
    dataset: {}, files: null, children: [], attrs,
    style: { props: new Map(), setProperty(k, v) { this.props.set(k, v); }, removeProperty(k) { this.props.delete(k); } },
    addEventListener(type, fn) { (listeners[type] ??= []).push(fn); },
    fire(type, ev = {}) { for (const fn of listeners[type] ?? []) fn({ target: el, ...ev }); },
    append(...xs) { el.children.push(...xs); },
    appendChild(x) { el.children.push(x); return x; },
    querySelector: () => makeEl('child'),
    setAttribute(k, v) { attrs.set(k, String(v)); },
    removeAttribute(k) { attrs.delete(k); },
    hasAttribute(k) { return attrs.has(k); },
  };
  return el;
}

/** A window that records its event listeners, so a test can fire afterprint. */
function makeWindow() {
  const listeners = {};
  return {
    print() {}, scrollTo() {}, open() {},
    addEventListener(type, fn) { (listeners[type] ??= []).push(fn); },
    fire(type) { for (const fn of listeners[type] ?? []) fn({ type }); },
  };
}

const flush = () => new Promise((r) => setImmediate(r));

/** Load assets/page-invoice.js fresh, with the given world. */
async function loadPage({ storage = memoryStorage(), session = memoryStorage(), fetchImpl = fetchMock(response(200, documentedSuccess())), productId = 'NEW', gumroad = null, online = true, search = '' } = {}) {
  vi.resetModules();
  const els = new Map();
  const $el = (sel) => { if (!els.has(sel)) els.set(sel, makeEl(sel)); return els.get(sel); };
  const site = { siteUrl: 'https://il-biz-tools.netlify.app', gumroad: gumroad ?? { productUrl: '', productId } };
  const win = makeWindow();
  vi.doMock('../assets/common.js', () => ({
    initPage() {},
    $: (sel, root) => (root ? root.querySelector(sel) : $el(sel)),
    $$: () => [],
    site,
  }));
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('sessionStorage', session);
  vi.stubGlobal('location', { search, pathname: '/invoice.html' });
  vi.stubGlobal('navigator', { onLine: online });
  vi.stubGlobal('fetch', fetchImpl);
  vi.stubGlobal('document', { createElement: () => makeEl('created'), querySelector: $el });
  vi.stubGlobal('Option', class { constructor(label, value) { this.label = label; this.value = value; } });
  vi.stubGlobal('window', win);
  vi.useFakeTimers({ toFake: ['Date'], now: NOW });
  await import('../assets/page-invoice.js');
  return {
    $: $el,
    storage,
    session,
    site,
    window: win,
    fetchImpl,
    record: () => JSON.parse(storage.getItem(LICENSE_STORAGE_KEY)),
    // proActive, as the page shows it: the branding accent applied to the document for print (a try-out sets
    // only its screen-only variable, never this one).
    proActive: () => $el('#preview').style.props.has('--brand-accent'),
    note: () => $el('#license-note').textContent,
  };
}

const withRecord = (record) => memoryStorage({ [LICENSE_STORAGE_KEY]: JSON.stringify(record) });
const activeRecord = (overrides = {}) => ({ v: 1, key: KEY, productId: 'NEW', status: 'active', activatedAt: NOW - 30 * DAY, lastCheckAt: NOW - 8 * DAY, ...overrides });

beforeEach(() => { vi.unstubAllGlobals(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.doUnmock('../assets/common.js'); });

describe('AT-6 a cached licence survives everything that is not a definitive no', () => {
  for (const row of NON_DEFINITIVE) {
    it(`Pro on before the answer, and still on after: ${row.name}`, async () => {
      const fetchImpl = deferredFetch();
      const page = await loadPage({ storage: withRecord(activeRecord()), fetchImpl });

      // Synchronously after load, before the request has any answer.
      expect(page.proActive()).toBe(true);
      expect(fetchImpl.calls).toHaveLength(1);

      const answer = row.answer();
      if (answer instanceof Error) fetchImpl.reject(answer); else fetchImpl.resolve(answer);
      await flush();

      expect(page.proActive()).toBe(true);
      expect(page.record().status).toBe('active');
      expect(page.record().lastCheckAt).toBe(NOW - 8 * DAY);
      expect(page.note()).toBe('');
    });
  }

  const revocations = [
    ['refunded', response(200, documentedSuccess({ refunded: true })), 'הוחזר'],
    ['disabled', response(404, NOT_FOUND_BODIES.disabled), 'בוטל'],
    ['disputed', response(200, documentedSuccess({ disputed: true, dispute_won: false })), 'מחלוקת'],
  ];
  for (const [name, answer, word] of revocations) {
    it(`switches off, removes the record and names the reason on a definitive no: ${name}`, async () => {
      const fetchImpl = deferredFetch();
      const page = await loadPage({ storage: withRecord(activeRecord()), fetchImpl });
      expect(page.proActive()).toBe(true);
      fetchImpl.resolve(answer);
      await flush();
      expect(page.proActive()).toBe(false);
      expect(page.storage.getItem(LICENSE_STORAGE_KEY)).toBeNull();
      expect(page.note()).toContain(word);
    });
  }
});

describe('AT-7 re-check throttle and the stored product id', () => {
  it('checked a day ago: no request at all', async () => {
    const page = await loadPage({ storage: withRecord(activeRecord({ lastCheckAt: NOW - DAY })) });
    expect(page.proActive()).toBe(true);
    expect(page.fetchImpl.calls).toHaveLength(0);
  });

  it('checked eight days ago: exactly one request, not counted as a use; a yes moves lastCheckAt to now', async () => {
    const page = await loadPage({ storage: withRecord(activeRecord()) });
    await flush();
    expect(page.fetchImpl.calls).toHaveLength(1);
    expect(page.fetchImpl.calls[0].body).toContain('increment_uses_count=false');
    expect(page.record().lastCheckAt).toBe(NOW);
  });

  it('an unknown answer leaves lastCheckAt and records only the attempt', async () => {
    const page = await loadPage({ storage: withRecord(activeRecord()), fetchImpl: fetchMock(response(503, '')) });
    await flush();
    expect(page.fetchImpl.calls).toHaveLength(1);
    expect(page.record().lastCheckAt).toBe(NOW - 8 * DAY);
    expect(page.record().lastAttemptAt).toBe(NOW);
  });

  it('offline: no request', async () => {
    const page = await loadPage({ storage: withRecord(activeRecord()), online: false });
    await flush();
    expect(page.proActive()).toBe(true);
    expect(page.fetchImpl.calls).toHaveLength(0);
  });

  it('re-checks against the product id the key was activated with, not the current config', async () => {
    const page = await loadPage({ storage: withRecord(activeRecord({ productId: 'OLD' })), productId: 'NEW' });
    await flush();
    expect(page.fetchImpl.calls).toHaveLength(1);
    expect(page.fetchImpl.calls[0].body).toContain('product_id=OLD');
    expect(page.fetchImpl.calls[0].body).not.toContain('product_id=NEW');
  });
});

describe('AT-8 activation from the page', () => {
  it('site without a product id: nothing is sent', async () => {
    const page = await loadPage({ productId: '' });
    page.$('#license-key').value = KEY;
    page.$('#license-apply').fire('click');
    await flush();
    expect(page.fetchImpl.calls).toHaveLength(0);
    expect(page.note()).toBe('המיתוג עדיין לא הופעל באתר הזה.');
    expect(page.storage.getItem(LICENSE_STORAGE_KEY)).toBeNull();
  });

  it('a key that is not shaped: nothing is sent', async () => {
    const page = await loadPage();
    page.$('#license-key').value = LEGACY;
    page.$('#license-apply').fire('click');
    await flush();
    expect(page.fetchImpl.calls).toHaveLength(0);
    expect(page.note()).toBe(LICENSE_NOTES.not_a_license_key);
  });

  it('a yes: one counted request, the record stored, Pro on', async () => {
    const page = await loadPage();
    expect(page.proActive()).toBe(false);
    page.$('#license-key').value = ` ${KEY.toLowerCase()} `;
    page.$('#license-apply').fire('click');
    await flush();

    expect(page.fetchImpl.calls).toHaveLength(1);
    expect(page.fetchImpl.calls[0].body).not.toContain('increment_uses_count=false');
    expect(page.fetchImpl.calls[0].body).toContain('product_id=NEW');
    expect(page.record()).toEqual({ v: 1, key: KEY, productId: 'NEW', status: 'active', activatedAt: NOW, lastCheckAt: NOW });
    expect(page.proActive()).toBe(true);
    expect(page.note()).toBe('הרישיון אומת. המיתוג פעיל.');
    expect(page.$('#license-clear').hidden).toBe(false);
  });

  it('a definitive no: nothing stored, Pro off, the reason shown', async () => {
    const page = await loadPage({ fetchImpl: fetchMock(response(404, NOT_FOUND_BODIES.not_found)) });
    page.$('#license-key').value = KEY;
    page.$('#license-apply').fire('click');
    await flush();
    expect(page.storage.getItem(LICENSE_STORAGE_KEY)).toBeNull();
    expect(page.proActive()).toBe(false);
    expect(page.note()).toBe(LICENSE_NOTES.revoked.not_found);
  });

  it('no answer: the key is kept as pending, Pro off, and the note says nothing is lost', async () => {
    const page = await loadPage({ fetchImpl: fetchMock(new TypeError('Failed to fetch')) });
    page.$('#license-key').value = KEY;
    page.$('#license-apply').fire('click');
    await flush();
    expect(page.record()).toMatchObject({ v: 1, key: KEY, productId: 'NEW', status: 'pending' });
    expect(page.proActive()).toBe(false);
    expect(page.note()).toContain('המפתח נשמר בדפדפן הזה');
    expect(page.note()).toContain('שום דבר לא אבד');
    expect(page.note()).toContain('ינסה שוב בעצמו');
    expect(page.note()).not.toMatch(/אינו תקף|שגוי|invalid/);
  });

  it('the next load retries a pending key once, with no button press', async () => {
    const first = await loadPage({ fetchImpl: fetchMock(new TypeError('Failed to fetch')) });
    first.$('#license-key').value = KEY;
    first.$('#license-apply').fire('click');
    await flush();
    const pending = first.storage;

    const second = await loadPage({ storage: pending });
    await flush();
    expect(second.fetchImpl.calls).toHaveLength(1);
    expect(second.fetchImpl.calls[0].body).not.toContain('increment_uses_count=false');
    expect(second.record().status).toBe('active');
    expect(second.proActive()).toBe(true);
  });

  it('"הסרת הרישיון" clears the record with no request', async () => {
    const page = await loadPage({ storage: withRecord(activeRecord({ lastCheckAt: NOW - DAY })) });
    expect(page.proActive()).toBe(true);
    page.$('#license-clear').fire('click');
    expect(page.fetchImpl.calls).toHaveLength(0);
    expect(page.storage.getItem(LICENSE_STORAGE_KEY)).toBeNull();
    expect(page.proActive()).toBe(false);
    expect(page.$('#license-clear').hidden).toBe(true);
  });
});

describe('AT-10 the retired signed format', () => {
  it('is cleared on load: Pro off, no request, entry removed', async () => {
    const page = await loadPage({ storage: memoryStorage({ [LICENSE_STORAGE_KEY]: LEGACY }) });
    await flush();
    expect(page.proActive()).toBe(false);
    expect(page.fetchImpl.calls).toHaveLength(0);
    expect(page.storage.getItem(LICENSE_STORAGE_KEY)).toBeNull();
  });
});

describe('N1 the price is shown in the ready state only, and it is the configured one', () => {
  it('ready: the price Gumroad read back, beside the button that buys it', async () => {
    const page = await loadPage({ gumroad: READY_GUMROAD });
    const expected = proButtonState(page.site).price;
    expect(expected).toBe(formatILS(79, { decimals: 0 }));
    expect(page.$('#pro-price').hidden).toBe(false);
    expect(page.$('#pro-price').textContent).toBe(expected);
    expect(page.$('#pro-cta').textContent).toBe('לרכישה ב-Gumroad');
    expect(page.$('#pro-cta').disabled).toBe(false);
    expect(page.$('#pro-note').textContent).toContain('בחנות Mehudak (מהודק)');
  });

  const shut = [
    ['unconfigured', { productUrl: '', productId: 'NEW' }],
    ['invalid url', { productUrl: 'mehudak.gumroad.com/l/pro', productId: 'NEW', priceCents: 7900, currency: 'ils' }],
    ['no product id', { productUrl: 'https://mehudak.gumroad.com/l/pro', productId: '', priceCents: 7900, currency: 'ils' }],
    ['no price read back yet', { productUrl: 'https://mehudak.gumroad.com/l/pro', productId: 'NEW' }],
  ];
  for (const [name, gumroad] of shut) {
    it(`${name}: no price anywhere in the Pro box, and the button stays shut`, async () => {
      const page = await loadPage({ gumroad });
      expect(page.$('#pro-price').hidden).toBe(true);
      expect(page.$('#pro-price').textContent).toBe('');
      expect(page.$('#pro-cta').disabled).toBe(true);
      expect(page.$('#pro-cta').textContent).toBe('בקרוב');
    });
  }
});

describe('Hebrew copy on the page addresses users in the plural', () => {
  it('the thank-you after a purchase says "אליכם" and "הזינו"', async () => {
    const page = await loadPage({ gumroad: READY_GUMROAD, search: '?purchased=1' });
    expect(page.note()).toBe('תודה! מפתח הרישיון נמצא בקבלה שנשלחה אליכם במייל מ-Gumroad. הזינו אותו כאן.');
  });
});
