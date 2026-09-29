import { describe, it, expect } from 'vitest';
import {
  isValidProductUrl,
  gumroadProductUrl,
  gumroadProductId,
  isProConfigured,
  proButtonState,
  openProCheckout,
  gumroadPrice,
  formatProPrice,
  PRO_PRODUCT_NAME,
  GUMROAD_STORE_NAME,
} from '../src/lib/gumroad.js';
import { formatILS } from '../src/lib/money.js';
import {
  buildAnalyticsSnippet,
  buildAnalyticsSnippets,
  buildPlausibleSnippet,
  buildPostHogSnippet,
  installAnalytics,
} from '../src/lib/analytics.js';
import site from '../src/config/site.json' with { type: 'json' };

// Gumroad's read-back carries the price as `price` (minor units) and `currency`
// (antiwork/gumroad app/models/concerns/product/as_json.rb, as_json_for_api);
// the product job copies both into site.json as priceCents and currency.
const READY = { gumroad: { productUrl: 'https://kelim.gumroad.com/l/pro', productId: '32-nPAicqbLj8B_WswVlMw==', priceCents: 7900, currency: 'ils' } };

describe('gumroad product url', () => {
  it('accepts an https product page and nothing else', () => {
    expect(isValidProductUrl('https://kelim.gumroad.com/l/pro')).toBe(true);
    expect(isValidProductUrl('http://kelim.gumroad.com/l/pro')).toBe(false);
    expect(isValidProductUrl('javascript:alert(1)')).toBe(false);
    expect(isValidProductUrl('/l/pro')).toBe(false);
    expect(isValidProductUrl('')).toBe(false);
    expect(isValidProductUrl(null)).toBe(false);
  });
  it('trims whitespace but keeps the url intact', () => {
    expect(gumroadProductUrl({ gumroad: { productUrl: '  https://x.gumroad.com/l/p  ' } })).toBe('https://x.gumroad.com/l/p');
  });
});

describe('gumroad product id', () => {
  it("accepts Gumroad's public external id and nothing empty or odd", () => {
    expect(gumroadProductId({ gumroad: { productId: ' 32-nPAicqbLj8B_WswVlMw== ' } })).toBe('32-nPAicqbLj8B_WswVlMw==');
    expect(gumroadProductId({ gumroad: { productId: '' } })).toBeNull();
    expect(gumroadProductId({ gumroad: { productId: '   ' } })).toBeNull();
    expect(gumroadProductId({ gumroad: { productId: 'has space' } })).toBeNull();
    expect(gumroadProductId({ gumroad: { productId: 42 } })).toBeNull();
    expect(gumroadProductId({})).toBeNull();
  });
});

describe('pro button states', () => {
  it('ships not-for-sale: no product url means an honest "בקרוב"', () => {
    expect(isProConfigured(site)).toBe(false);
    const s = proButtonState(site);
    expect(s.state).toBe('unconfigured');
    expect(s.enabled).toBe(false);
    expect(s.href).toBeNull();
    expect(s.label).toBe('בקרוב');
    expect(s.note).toContain('לא נמכר');
  });

  it('stays shut on a malformed product url instead of linking somewhere random', () => {
    const s = proButtonState({ gumroad: { productUrl: 'gumroad.com/l/pro', productId: 'P' } });
    expect(s.state).toBe('invalid_url');
    expect(s.enabled).toBe(false);
    expect(s.href).toBeNull();
  });

  it('refuses to sell a licence key nothing can verify: a shop without a product id stays shut', () => {
    const s = proButtonState({ gumroad: { productUrl: 'https://kelim.gumroad.com/l/pro', productId: '' } });
    expect(s).toMatchObject({ state: 'no_product_id', enabled: false, href: null });
    expect(s.note).toBe('החנות מוגדרת אך עדיין אין מזהה מוצר לאימות הרישיון, ולכן אי אפשר למכור.');
    expect(isProConfigured({ gumroad: { productUrl: 'https://kelim.gumroad.com/l/pro', productId: '' } })).toBe(false);
  });

  it('opens only when there is a shop, a way to verify what it sells, and the price Gumroad read back', () => {
    const s = proButtonState(READY);
    expect(s.state).toBe('ready');
    expect(s.enabled).toBe(true);
    expect(s.href).toBe('https://kelim.gumroad.com/l/pro');
    expect(s.label).toBe('לרכישה ב-Gumroad');
    expect(s.price).toBe(formatILS(79, { decimals: 0 }));
    expect(s.note).toBe(`המכירה ב-Gumroad, בחנות ${GUMROAD_STORE_NAME}. מפתח הרישיון מגיע בקבלה במייל מ-Gumroad; הזנתו כאן נבדקת מול Gumroad פעם אחת ומפעילה את המיתוג.`);
    expect(isProConfigured(READY)).toBe(true);
  });

  it('shows a price in the ready state only, and never one typed by hand', () => {
    const states = [
      proButtonState(site),
      proButtonState({ gumroad: { productUrl: 'gumroad.com/l/pro', productId: 'P', priceCents: 7900, currency: 'ils' } }),
      proButtonState({ gumroad: { productUrl: 'https://kelim.gumroad.com/l/pro', productId: '', priceCents: 7900, currency: 'ils' } }),
      proButtonState({ gumroad: { productUrl: 'https://kelim.gumroad.com/l/pro', productId: 'P' } }),
    ];
    for (const s of states) {
      expect(s.state).not.toBe('ready');
      expect(s.price).toBeNull();
      expect(s.enabled).toBe(false);
    }
  });

  it('keeps checkout shut while Gumroad has not reported a price: no sale without a visible price', () => {
    const s = proButtonState({ gumroad: { productUrl: 'https://kelim.gumroad.com/l/pro', productId: 'P' } });
    expect(s).toMatchObject({ state: 'no_price', enabled: false, href: null, label: 'בקרוב', price: null });
    expect(s.note).toBe('החנות מוגדרת, אבל המחיר עוד לא נקרא מ-Gumroad, ולכן הכפתור סגור.');
    expect(isProConfigured({ gumroad: { productUrl: 'https://kelim.gumroad.com/l/pro', productId: 'P' } })).toBe(false);
  });

  it('keeps the unconfigured and invalid-url states whatever the product id says', () => {
    expect(proButtonState({ gumroad: { productUrl: '', productId: 'P' } }).state).toBe('unconfigured');
    expect(proButtonState({ gumroad: { productUrl: 'http://x.gumroad.com/l/p', productId: 'P' } }).state).toBe('invalid_url');
  });

  it('ships with every field empty: no url, no id, no price', () => {
    expect(site.gumroad.productUrl).toBe('');
    expect(site.gumroad.productId).toBe('');
    expect(site.gumroad.priceCents).toBeNull();
    expect(site.gumroad.currency).toBe('');
  });
});

describe('the price, as Gumroad reported it', () => {
  it('reads whole minor units and a three-letter currency, nothing else', () => {
    expect(gumroadPrice(READY)).toEqual({ priceCents: 7900, currency: 'ils' });
    expect(gumroadPrice({ gumroad: { priceCents: 7900, currency: 'ILS' } })).toEqual({ priceCents: 7900, currency: 'ils' });
    for (const bad of [
      { priceCents: null, currency: 'ils' },
      { priceCents: 0, currency: 'ils' },
      { priceCents: 79.5, currency: 'ils' },
      { priceCents: '7900', currency: 'ils' },
      { priceCents: 7900, currency: '' },
      { priceCents: 7900, currency: 'shekel' },
      {},
    ]) {
      expect(gumroadPrice({ gumroad: bad }), JSON.stringify(bad)).toBeNull();
    }
  });

  it('formats shekels the way the rest of the site does, with agorot only when there are some', () => {
    expect(formatProPrice({ priceCents: 7900, currency: 'ils' })).toBe(formatILS(79, { decimals: 0 }));
    expect(formatProPrice({ priceCents: 7950, currency: 'ils' })).toBe(formatILS(79.5, { decimals: 2 }));
    expect(formatProPrice({ priceCents: 900, currency: 'usd' })).toContain('9');
    expect(formatProPrice({ priceCents: 900, currency: 'usd' })).toContain('$');
    expect(formatProPrice({ priceCents: 900, currency: 'zzz' })).toBeNull();
    expect(formatProPrice(null)).toBeNull();
  });
});

describe('one name for the offer, by what it delivers', () => {
  it('names Pro by its deliverable and the store by the brand', () => {
    expect(PRO_PRODUCT_NAME).toBe('Pro – הלוגו וצבע המותג על המסמך');
    expect(GUMROAD_STORE_NAME).toBe('Mehudak (מהודק)');
  });
});

describe('opening the checkout', () => {
  it('navigates to the product page in a new tab, with no opener', () => {
    const calls = [];
    const win = { open: (...args) => calls.push(args) };
    expect(openProCheckout(READY, win)).toBe('https://kelim.gumroad.com/l/pro');
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('https://kelim.gumroad.com/l/pro');
    expect(calls[0][2]).toContain('noopener');
  });
  it('throws rather than opening anything when unconfigured', () => {
    const win = { open: () => { throw new Error('should not be called'); } };
    expect(() => openProCheckout(site, win)).toThrow(/not configured/);
    expect(() => openProCheckout({ gumroad: { productUrl: 'https://x.gumroad.com/l/p' } }, win)).toThrow(/not configured/);
  });
});

describe('analytics', () => {
  it('is off by default - no key, no snippet, no third-party request', () => {
    expect(buildAnalyticsSnippets(site)).toEqual([]);
    expect(buildAnalyticsSnippet(site)).toBeNull();
    expect(installAnalytics(site, null)).toBe(false);
  });
  it('builds a plausible tag', () => {
    const s = buildPlausibleSnippet({ analytics: { provider: 'plausible', plausibleDomain: 'example.co.il' } });
    expect(s.src).toContain('plausible.io');
    expect(s.attrs['data-domain']).toBe('example.co.il');
  });
  it('ignores a provider without credentials', () => {
    expect(buildPlausibleSnippet({ analytics: { provider: 'plausible' } })).toBeNull();
  });
  it('emits no posthog snippet until a project key exists', () => {
    expect(buildPostHogSnippet({})).toBeNull();
    expect(buildPostHogSnippet({ posthog: { projectKey: '' } })).toBeNull();
  });
  it('builds a cookieless posthog snippet: no cookies, no storage, page views only', () => {
    const s = buildPostHogSnippet({ posthog: { projectKey: 'phc_1' } });
    expect(s.inline).toContain('phc_1');
    expect(s.inline).toContain('eu.i.posthog.com');
    expect(s.inline).toContain('"cookieless_mode":"always"');
    expect(s.inline).toContain('"persistence":"memory"');
    expect(s.inline).toContain('"autocapture":false');
    expect(s.inline).toContain('"capture_pageview":true');
    expect(s.inline).toContain('"disable_session_recording":true');
  });
  it('pins off every capture a PostHog project setting could otherwise switch on, so no element text is ever sent', () => {
    // posthog-js falls back to the project's remote config for dead clicks,
    // heatmaps and exceptions when the page leaves them unset. On pcn874.html a
    // clicked table cell can hold bytes of the user's file.
    const s = buildPostHogSnippet({ posthog: { projectKey: 'phc_1' } });
    for (const pinned of [
      '"capture_dead_clicks":false',
      '"capture_heatmaps":false',
      '"capture_exceptions":false',
      '"capture_performance":false',
      '"disable_surveys":true',
      '"mask_all_text":true',
      '"mask_all_element_attributes":true',
    ]) {
      expect(s.inline).toContain(pinned);
    }
  });
  it('honours a self-hosted api host', () => {
    const s = buildPostHogSnippet({ posthog: { projectKey: 'phc_1', apiHost: 'https://ph.example.com' } });
    expect(s.inline).toContain('ph.example.com');
  });
  it('installs both providers when both are configured', () => {
    const added = [];
    const doc = { createElement: () => ({ setAttribute() {} }), head: { appendChild: (el) => added.push(el) } };
    const cfg = { analytics: { provider: 'plausible', plausibleDomain: 'x.co.il' }, posthog: { projectKey: 'phc_1' } };
    expect(installAnalytics(cfg, doc)).toBe(true);
    expect(added).toHaveLength(2);
  });
});
