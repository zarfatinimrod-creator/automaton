// The product-creation job (AT-15), exercised offline against a fake Gumroad.
// The live run from a GitHub runner is the evidence; these tests make sure the
// job is idempotent, creates a DRAFT carrying the licenseKey node, never
// enables before the deployed site carries the id, and never prints the token.
import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  API,
  proProductName,
  activationContent,
  productDescription,
  hasLicenseKeyNode,
  createOrReuse,
  enableProduct,
  main,
  NO_TOKEN_NOTICE,
  StopError,
  readBackPrice,
  writeSiteJson,
  brandMailboxGreen,
  BRAND_MAIL_PROBE,
  refundPolicyGate,
  checkOffer,
  MIN_REFUND_DAYS,
  REFUND_RESPONDER,
  refundSale,
} from '../scripts/gumroad-pro-product.js';
import { fileURLToPath } from 'node:url';
import { PRO_PRODUCT_NAME } from '../src/lib/gumroad.js';
import { AI_DECLARATION } from '../src/lib/ai-declaration.js';

const TOKEN = 'secret-token-never-printed-0123456789';
const SITE = { siteUrl: 'https://il-biz-tools.netlify.app', siteName: 'כלים לעסק', gumroad: { productUrl: '', productId: '' } };
const NAME = proProductName(SITE);
const ID = '32-nPAicqbLj8B_WswVlMw==';
const SHORT = 'https://kelim.gumroad.com/l/pro';

// The keys Gumroad's API puts on a product (antiwork/gumroad
// app/models/concerns/product/as_json.rb, as_json_for_api): price in minor
// units, currency, subscription_duration (null unless it is a membership) and
// customizable_price (pay-what-you-want).
const stored = (overrides = {}) => ({
  id: ID,
  name: NAME,
  published: false,
  short_url: SHORT,
  price: 7900,
  currency: 'ils',
  subscription_duration: null,
  customizable_price: false,
  rich_content: activationContent(SITE).map((p) => ({ id: 'page1', ...p })),
  ...overrides,
});

/** A fake Gumroad: routes by method + path, records every call. */
function fakeGumroad(routes) {
  const calls = [];
  const impl = async (url, init = {}) => {
    const method = init.method ?? 'GET';
    calls.push({ url, method, init, body: init.body ? JSON.parse(init.body) : undefined });
    const key = `${method} ${url.replace(API, '').split('?')[0]}`;
    const route = routes[key] ?? routes[`${method} ${url}`.split('?')[0]];
    if (!route) return { status: 404, text: async () => '{"success":false,"message":"no route in fake"}' };
    const [status, body] = typeof route === 'function' ? route(url, init) : route;
    return { status, text: async () => JSON.stringify(body) };
  };
  impl.calls = calls;
  return impl;
}

const sink = () => { const lines = []; const log = (l) => lines.push(String(l)); log.lines = lines; return log; };

describe('one name, by what Pro delivers (N5)', () => {
  it('names the Gumroad product exactly as the Pro box does, whatever the site is called', () => {
    expect(proProductName(SITE)).toBe(PRO_PRODUCT_NAME);
    expect(proProductName({ ...SITE, siteName: 'something else' })).toBe(PRO_PRODUCT_NAME);
  });

  it('activation step 4 says what activation adds under N2 - branding in print - not that the fields open', () => {
    const step4 = activationContent(SITE)[0].description.content
      .filter((n) => n.type === 'paragraph')
      .map((n) => n.content[0].text)
      .find((t) => t.startsWith('4.'));
    expect(step4).not.toContain('נפתחים');
    expect(step4).toContain('בהדפסה ובשמירה כ-PDF');
    expect(step4).toContain('"הרישיון אומת. המיתוג פעיל."');
  });

  it('points the buyer at the box by that same name in activation step 3', () => {
    const step3 = activationContent(SITE)[0].description.content
      .filter((n) => n.type === 'paragraph')
      .map((n) => n.content[0].text)
      .find((t) => t.startsWith('3.'));
    expect(step3).toContain(`"${PRO_PRODUCT_NAME}"`);
    expect(JSON.stringify(activationContent(SITE))).not.toContain('מיתוג המסמך');
  });
});

describe('the price comes from Gumroad\'s read-back (N1)', () => {
  it('reads price and currency from the stored product', () => {
    expect(readBackPrice(stored())).toEqual({ priceCents: 7900, currency: 'ils' });
    expect(readBackPrice(stored({ price: 9900, currency: 'ILS' }))).toEqual({ priceCents: 9900, currency: 'ils' });
  });

  it('stops on a product with no usable price rather than guess one', () => {
    for (const bad of [{ price: undefined }, { price: '7900' }, { price: 0 }, { currency: undefined }, { currency: 'shekel' }]) {
      expect(() => readBackPrice(stored(bad)), JSON.stringify(bad)).toThrow(StopError);
    }
  });

  it('stops on a membership or a pay-what-you-want product: the page says one fixed price, once', () => {
    expect(() => readBackPrice(stored({ subscription_duration: 'monthly' }))).toThrow(/subscription/);
    expect(() => readBackPrice(stored({ customizable_price: true }))).toThrow(/pay-what-you-want/);
  });

  // Every other field of Gumroad's API product that changes what a buyer is charged
  // (as_json_for_api, antiwork/gumroad app/models/concerns/product/as_json.rb, read 29.9.2026).
  it('stops on anything else that makes the charge differ from the one price: tiers, PPP, priced or pay-what-you-want options', () => {
    const cases = [
      [{ is_tiered_membership: true }, /membership/],
      [{ recurrences: ['monthly'] }, /membership/],
      [{ purchasing_power_parity_prices: { IL: 6100 } }, /purchasing-power/],
      [{ variants: [{ title: 'גרסה', options: [{ name: 'א', price_difference: 0 }, { name: 'ב', price_difference: 1000 }] }] }, /option/],
      [{ variants: [{ title: 'גרסה', options: [{ name: 'א', price_difference: 0, is_pay_what_you_want: true }] }] }, /option/],
      [{ variants: [{ title: 'גרסה', options: [{ name: 'א', price_difference: 0, purchasing_power_parity_prices: { IL: 6100 } }] }] }, /purchasing-power/],
    ];
    for (const [overrides, reason] of cases) {
      expect(() => readBackPrice(stored(overrides)), JSON.stringify(overrides)).toThrow(reason);
    }
  });

  it('accepts the plain product: no tiers, no PPP, options that all cost the same', () => {
    expect(readBackPrice(stored({ is_tiered_membership: false, recurrences: null, purchasing_power_parity_prices: undefined }))).toEqual({ priceCents: 7900, currency: 'ils' });
    expect(readBackPrice(stored({ variants: [{ title: 'גרסה', options: [{ name: 'א', price_difference: 0, is_pay_what_you_want: false }] }] }))).toEqual({ priceCents: 7900, currency: 'ils' });
    expect(readBackPrice(stored({ variants: [] }))).toEqual({ priceCents: 7900, currency: 'ils' });
  });

  it('creates the product with no recurrence of any kind', async () => {
    const fetchImpl = fakeGumroad({
      'GET /products': [200, { success: true, products: [] }],
      'POST /products': [200, { success: true, product: stored() }],
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored() }],
    });
    await createOrReuse({ fetchImpl, token: TOKEN, site: SITE, log: sink() });
    const body = fetchImpl.calls.find((c) => c.method === 'POST').body;
    for (const key of Object.keys(body)) expect(key).not.toMatch(/subscription|recurr|membership/);
  });

  it('returns the read-back price, not the price it asked for', async () => {
    const fetchImpl = fakeGumroad({
      'GET /products': [200, { success: true, products: [stored({ price: 8900 })] }],
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored({ price: 8900 }) }],
    });
    const out = await createOrReuse({ fetchImpl, token: TOKEN, site: SITE, priceCents: 7900, log: sink() });
    expect(out).toMatchObject({ priceCents: 8900, currency: 'ils', reused: true });
  });

  it('writeSiteJson stores the price beside the id and URL, and refuses one that is not whole minor units', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ilbiz-'));
    const path = join(dir, 'site.json');
    writeFileSync(path, JSON.stringify(SITE, null, 2));
    await writeSiteJson({ productId: ID, productUrl: SHORT, priceCents: 7900, currency: 'ils', refundPeriodDays: 30 }, path);
    expect(JSON.parse(readFileSync(path, 'utf8')).gumroad).toEqual({ productUrl: SHORT, productId: ID, priceCents: 7900, currency: 'ils', refundPeriodDays: 30 });
    for (const unread of [null, undefined, 0, -30, 30.5, '30']) {
      await writeSiteJson({ productId: ID, productUrl: SHORT, priceCents: 7900, currency: 'ils', refundPeriodDays: unread }, path);
      expect(JSON.parse(readFileSync(path, 'utf8')).gumroad.refundPeriodDays, String(unread)).toBeNull();
    }
    await expect(writeSiteJson({ productId: ID, productUrl: SHORT, priceCents: 79.5, currency: 'ils' }, path)).rejects.toBeInstanceOf(StopError);
    await expect(writeSiteJson({ productId: ID, productUrl: SHORT, priceCents: 7900, currency: '' }, path)).rejects.toBeInstanceOf(StopError);
  });
});

describe('the product content Gumroad receives', () => {
  it('carries Gumroad\'s licence-key block inside written Hebrew instructions', () => {
    const content = activationContent(SITE);
    expect(hasLicenseKeyNode({ rich_content: content })).toBe(true);
    const nodes = content[0].description.content;
    expect(nodes.filter((n) => n.type === 'paragraph').length).toBeGreaterThanOrEqual(4);
    expect(JSON.stringify(content)).toContain('https://il-biz-tools.netlify.app/invoice.html');
  });

  it('says exactly what Pro is: branding on the printed document, on this site, one-time', () => {
    const d = productDescription(SITE);
    expect(d).toContain('הלוגו');
    expect(d).toContain('צבע מותג');
    expect(d).toContain('https://il-biz-tools.netlify.app/invoice.html');
    expect(d).toContain('תשלום חד-פעמי, בלי מנוי');
    expect(d).toContain('פעם אחת בהפעלה');
  });

  // RULING-2026-09-29-lines (a) APPLY 2: the product page is a public brand surface, so it carries the sentence
  // every site page carries - the same constant, not a copy of it.
  it('ends with the site\'s AI declaration, word for word, as its own last paragraph', () => {
    const d = productDescription(SITE);
    expect(d.endsWith(`<p>${AI_DECLARATION}</p>`)).toBe(true);
    expect(d.split(AI_DECLARATION)).toHaveLength(2);
    expect(AI_DECLARATION).toBe('האתר והכלים שבו נבנו ומתוחזקים על ידי סוכני בינה מלאכותית (AI) הפועלים מטעם המותג מהודק.');
  });

  it('finds the node wherever Gumroad nests it, and nothing when it is absent', () => {
    expect(hasLicenseKeyNode({ rich_content: [{ description: { type: 'doc', content: [{ type: 'paragraph' }] } }] })).toBe(false);
    expect(hasLicenseKeyNode({ rich_content: [] })).toBe(false);
    expect(hasLicenseKeyNode({})).toBe(false);
    expect(hasLicenseKeyNode({ variants: [{ options: [{ rich_content: [{ description: { content: [{ type: 'licenseKey' }] } }] }] }] })).toBe(true);
  });
});

describe('create (AT-15, offline)', () => {
  it('creates a draft with the price, the description and the licenseKey node, then reads it back', async () => {
    const fetchImpl = fakeGumroad({
      'GET /products': [200, { success: true, products: [{ id: 'other', name: 'Something else' }] }],
      'POST /products': [200, { success: true, product: stored() }],
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored() }],
    });
    const log = sink();
    const out = await createOrReuse({ fetchImpl, token: TOKEN, site: SITE, log });

    // This fake has no GET /refund_policy route: an unreadable policy is written as null, never guessed.
    expect(out).toEqual({ id: ID, shortUrl: SHORT, published: false, reused: false, priceCents: 7900, currency: 'ils', refundPeriodDays: null });
    const post = fetchImpl.calls.filter((c) => c.method === 'POST');
    expect(post).toHaveLength(1);
    expect(post[0].body).toMatchObject({ name: NAME, price: 7900, price_currency_type: 'ils', draft: true });
    expect(hasLicenseKeyNode({ rich_content: post[0].body.rich_content })).toBe(true);
    expect(fetchImpl.calls.some((c) => c.method === 'PUT')).toBe(false);
    expect(log.lines.join('\n')).toContain('licenseKey node: yes');
  });

  it('is idempotent: an existing product with the same name is reused, never duplicated', async () => {
    const fetchImpl = fakeGumroad({
      'GET /products': [200, { success: true, products: [stored({ rich_content: undefined })] }],
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored() }],
    });
    const out = await createOrReuse({ fetchImpl, token: TOKEN, site: SITE, log: sink() });
    expect(out.reused).toBe(true);
    expect(fetchImpl.calls.some((c) => c.method === 'POST')).toBe(false);
  });

  it('follows pagination when looking for the product', async () => {
    const fetchImpl = fakeGumroad({
      'GET /products': (url) => (url.includes('page_key=p2')
        ? [200, { success: true, products: [stored()] }]
        : [200, { success: true, products: [{ id: 'x', name: 'x' }], next_page_key: 'p2' }]),
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored() }],
    });
    const out = await createOrReuse({ fetchImpl, token: TOKEN, site: SITE, log: sink() });
    expect(out.reused).toBe(true);
    expect(fetchImpl.calls.filter((c) => c.url.includes('/products?page_key=p2'))).toHaveLength(1);
  });

  it('stops on two products with the same name instead of guessing', async () => {
    const fetchImpl = fakeGumroad({ 'GET /products': [200, { success: true, products: [stored(), stored({ id: 'dup' })] }] });
    await expect(createOrReuse({ fetchImpl, token: TOKEN, site: SITE, log: sink() })).rejects.toBeInstanceOf(StopError);
  });

  it('stops, and names the one-click fallback, when Gumroad refuses the create live', async () => {
    const fetchImpl = fakeGumroad({
      'GET /products': [200, { success: true, products: [] }],
      'POST /products': [200, { success: false, message: 'rich_content must be an array of content page objects.' }],
    });
    const err = await createOrReuse({ fetchImpl, token: TOKEN, site: SITE, log: sink() }).catch((e) => e);
    expect(err).toBeInstanceOf(StopError);
    expect(err.message).toContain('refused live');
    expect(err.message).toContain('Insert -> License key');
    expect(err.message).toContain('BEFORE anything is sold');
    expect(err.message).toContain('gumroad-license-decision.md');
  });

  it('stops when what Gumroad stored has no licenseKey node', async () => {
    const fetchImpl = fakeGumroad({
      'GET /products': [200, { success: true, products: [] }],
      'POST /products': [200, { success: true, product: stored() }],
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored({ rich_content: [] }) }],
    });
    const err = await createOrReuse({ fetchImpl, token: TOKEN, site: SITE, log: sink() }).catch((e) => e);
    expect(err).toBeInstanceOf(StopError);
    expect(err.message).toContain('without a licenseKey node');
  });

  it('sends the token only as a Bearer header - never in a URL - and never logs it', async () => {
    const fetchImpl = fakeGumroad({
      'GET /products': [200, { success: true, products: [] }],
      'POST /products': [200, { success: true, product: stored() }],
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored() }],
    });
    const log = sink();
    await createOrReuse({ fetchImpl, token: TOKEN, site: SITE, log });
    for (const c of fetchImpl.calls) {
      expect(c.url).not.toContain(TOKEN);
      expect(c.init.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    }
    expect(log.lines.join('\n')).not.toContain(TOKEN);
  });
});

// What enable and check compare: the price the repo and the deployed site show, Gumroad's own price, the refund
// period Gumroad will print on the product page and the page shows, and the address the account's buyer mail goes to.
const BRAND = 'mehudak.il@gmail.com';
const SITE_READY = { ...SITE, gumroad: { productUrl: SHORT, productId: ID, priceCents: 7900, currency: 'ils', refundPeriodDays: 30 } };
const DEPLOYED = 'GET https://il-biz-tools.netlify.app/src/config/site.json';
// GET /v2/refund_policy (api/v2/refund_policies_controller.rb#show) and the product's own refund_policy block
// (product/as_json.rb, product_refund_policy_api_json), read 29.9.2026. The periods Gumroad offers are 7, 14, 30, 183
// and none; a new account opens on 30 (RefundPolicy::DEFAULT_REFUND_PERIOD_IN_DAYS).
const accountPolicy = (period, extra = {}) => ({
  refund_period: period,
  title: period === 'none' ? null : `${period}-day money back guarantee`,
  fine_print: null,
  in_effect: true,
  ...extra,
});
const thirty = accountPolicy('30');
const inherits = { refund_period: 'inherit', title: null, fine_print: null, inherited: true };
const ownPolicy = (period) => ({ refund_policy: { refund_period: period, title: period === 'none' ? null : `${period}-day money back guarantee`, inherited: false } });
// email: null is an account whose read-back carries no address.
const offerRoutes = ({ product = {}, deployed = SITE_READY.gumroad, account = thirty, email = BRAND } = {}) => ({
  [DEPLOYED]: [200, { gumroad: deployed }],
  [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored({ refund_policy: inherits, ...product }) }],
  'GET /refund_policy': [200, { success: true, refund_policy: account }],
  'GET /user': [200, { success: true, user: { name: 'Mehudak', ...(email === null ? {} : { email }) } }],
  [`PUT /products/${encodeURIComponent(ID)}/enable`]: [200, { success: true, product: stored({ published: true }) }],
});

// RULING-2026-09-29-lines (h): no "no refunds"; a bounded window of at least 14 days - Gumroad's 30-day default as
// it stands - read from Gumroad, never assumed.
describe('refunds: a bounded window of at least 14 days, read back, or nothing is sold (RULING-2026-09-29-lines (h))', () => {
  it('the floor is 14 days', () => {
    expect(MIN_REFUND_DAYS).toBe(14);
  });

  it('a product that inherits the account policy is as good as that policy, when it is in effect', () => {
    expect(refundPolicyGate({ refund_policy: inherits }, thirty)).toMatchObject({ ok: true, days: 30 });
    const none = refundPolicyGate({ refund_policy: inherits }, accountPolicy('none'));
    expect(none).toMatchObject({ ok: false, days: null });
    expect(none.reason).toMatch(/none/);
    const week = refundPolicyGate({ refund_policy: inherits }, accountPolicy('7'));
    expect(week).toMatchObject({ ok: false, days: 7 });
    expect(week.reason).toMatch(/7-day money back guarantee/);
  });

  it('"none" and "7" refuse; "14", "30" and "183" accept, each with its days - on the product or the account', () => {
    for (const period of ['none', '7']) {
      expect(refundPolicyGate(ownPolicy(period), thirty).ok, `own ${period}`).toBe(false);
      expect(refundPolicyGate({ refund_policy: inherits }, accountPolicy(period)).ok, `account ${period}`).toBe(false);
    }
    for (const days of [14, 30, 183]) {
      expect(refundPolicyGate(ownPolicy(String(days)), accountPolicy('none')), `own ${days}`).toMatchObject({ ok: true, days });
      expect(refundPolicyGate({ refund_policy: inherits }, accountPolicy(String(days))), `account ${days}`).toMatchObject({ ok: true, days });
    }
  });

  it('a product-level override decides on its own, whatever the account says', () => {
    expect(refundPolicyGate(ownPolicy('none'), thirty)).toMatchObject({ ok: false, days: null });
    expect(refundPolicyGate(ownPolicy('30'), accountPolicy('none'))).toMatchObject({ ok: true, days: 30 });
  });

  it('when the policy in force cannot be read, no period is assumed', () => {
    for (const [product, account] of [
      [{ refund_policy: inherits }, { ...thirty, in_effect: false }],
      [{}, thirty],
      [{ refund_policy: inherits }, undefined],
      [{ refund_policy: { refund_period: '30' } }, thirty],
      [ownPolicy('thirty'), thirty],
      [ownPolicy('30.5'), thirty],
      [ownPolicy(''), thirty],
      [ownPolicy(30), thirty],
    ]) {
      const out = refundPolicyGate(product, account);
      expect(out.ok, JSON.stringify(product)).toBe(false);
      expect(out.days, JSON.stringify(product)).toBeNull();
    }
  });

  it('create reads the period in force and returns it for site.json: 30 inherited, the product\'s own, or null', async () => {
    const run = async (product, account) => {
      const fetchImpl = fakeGumroad({
        'GET /products': [200, { success: true, products: [stored()] }],
        [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored(product) }],
        ...(account === undefined ? {} : { 'GET /refund_policy': [200, { success: true, refund_policy: account }] }),
      });
      const out = await createOrReuse({ fetchImpl, token: TOKEN, site: SITE, log: sink() });
      expect(fetchImpl.calls.every((c) => c.method === 'GET')).toBe(true);
      return out.refundPeriodDays;
    };
    expect(await run({ refund_policy: inherits }, thirty)).toBe(30);
    expect(await run(ownPolicy('183'), accountPolicy('none'))).toBe(183);
    expect(await run({ refund_policy: inherits }, accountPolicy('none'))).toBeNull();
    expect(await run({ refund_policy: inherits }, { ...thirty, in_effect: false })).toBeNull();
    expect(await run({ refund_policy: inherits }, undefined)).toBeNull();
    // Gumroad's own period is written as it is, even under the floor: the page states Gumroad's term, and enable
    // refuses it (the gate), so a 7-day page never goes on sale.
    expect(await run({ refund_policy: inherits }, accountPolicy('7'))).toBe(7);
  });
});

// N6 of the TikTok sales note: no buyer may reach the owner. A receipt reply, a refund request or a question goes
// to the address the Gumroad account was opened with, so the product is enabled only once that address is the
// brand mailbox (owner step 8) and the colony is reading it: state/colony/brand-mail.json, written by
// scripts/brand_mail.py probe, configured and green by the same rules as src/revenue/brand-mail.ts - and, since
// RULING-2026-09-29-lines (h), only once that probe reports the refund responder scheduled.
const NOW = Date.UTC(2026, 9, 20, 12, 0, 0);
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
const greenProbe = (overrides = {}) => ({
  configured: true,
  measuredAt: iso(NOW - 3 * HOUR),
  inbox: 4,
  unread: 1,
  repliesByVenue: {},
  accessibility: { received: 0, unanswered: 0, unansweredOver7Days: 0, oldestUnansweredAgeDays: null },
  sentFolderFound: true,
  allMailFound: true,
  responders: ['gumroad-refund'],
  ...overrides,
});

describe('the brand mailbox must be probed green before anything is enabled (N6)', () => {
  it('reads the probe the brand-mail workflow commits, at the repository root', () => {
    const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
    expect(BRAND_MAIL_PROBE).toBe(join(repoRoot, 'state', 'colony', 'brand-mail.json'));
  });

  it('green: configured, read within two days, well-formed, no accessibility mail unanswered for 7+ days', () => {
    expect(brandMailboxGreen(greenProbe(), NOW)).toMatchObject({ green: true });
  });

  it('green with no responders key, or an empty list: the mailbox is read either way (enable asks separately)', () => {
    expect(brandMailboxGreen(greenProbe({ responders: undefined }), NOW)).toMatchObject({ green: true });
    expect(brandMailboxGreen(greenProbe({ responders: [] }), NOW)).toMatchObject({ green: true });
  });

  it('enable refuses before any request while the probe reports no scheduled refund responder - and fails closed without the key', async () => {
    expect(REFUND_RESPONDER).toBe('gumroad-refund');
    for (const responders of [undefined, [], ['something-else']]) {
      const fetchImpl = fakeGumroad(offerRoutes());
      const log = sink();
      const err = await enableProduct({ fetchImpl, token: TOKEN, site: SITE_READY, brandMail: greenProbe({ responders }), brandAddress: BRAND, nowMs: NOW, log }).catch((e) => e);
      expect(err, JSON.stringify(responders)).toBeInstanceOf(StopError);
      expect(err.message).toMatch(/refund responder/);
      expect(err.message).toContain('gumroad-refund');
      expect(fetchImpl.calls).toHaveLength(0);
    }
  });

  const notGreen = [
    ['no probe file', undefined, /no probe reading/],
    ['not a JSON object', 'garbage', /not a JSON object/],
    ['step 8 not done', { configured: false, measuredAt: iso(NOW - HOUR) }, /not configured/],
    ['no usable time', greenProbe({ measuredAt: 'yesterday' }), /measuredAt/],
    ['a stale reading', greenProbe({ measuredAt: iso(NOW - 3 * 24 * HOUR) }), /days old/],
    ['a count that is not a count', greenProbe({ unread: -1 }), /unread/],
    ['no accessibility block', greenProbe({ accessibility: undefined }), /accessibility/],
    ['accessibility mail overdue', greenProbe({ accessibility: { received: 2, unanswered: 1, unansweredOver7Days: 1, oldestUnansweredAgeDays: 9 } }), /unanswered for 7\+ days/],
    ['accessibility mail overdue by now', greenProbe({ measuredAt: iso(NOW - 30 * HOUR), accessibility: { received: 1, unanswered: 1, unansweredOver7Days: 0, oldestUnansweredAgeDays: 6.5 } }), /unanswered for 7\+ days/],
    // The probe's own overdue count, with no age to fall back on (brand_mail.py may omit the age).
    ['the probe counts overdue mail, whatever the age says', greenProbe({ accessibility: { received: 3, unanswered: 1, unansweredOver7Days: 1, oldestUnansweredAgeDays: null } }), /unanswered for 7\+ days/],
    ['repliesByVenue is not an object', greenProbe({ repliesByVenue: [1, 2] }), /repliesByVenue/],
    ['repliesByVenue holds a value that is not a count', greenProbe({ repliesByVenue: { 'nevo-il': 'two' } }), /repliesByVenue/],
    ['repliesByVenue has a key that is not a venue id', greenProbe({ repliesByVenue: { 'Someone <a@b.c>': 1 } }), /venue id/],
    ['a folder flag that is not a boolean', greenProbe({ sentFolderFound: 'yes' }), /folder flags/],
    ['the other folder flag missing', greenProbe({ allMailFound: undefined }), /folder flags/],
    ['an age that is not an age', greenProbe({ accessibility: { received: 1, unanswered: 1, unansweredOver7Days: 0, oldestUnansweredAgeDays: -2 } }), /oldestUnansweredAgeDays/],
    ['an age that is text', greenProbe({ accessibility: { received: 1, unanswered: 1, unansweredOver7Days: 0, oldestUnansweredAgeDays: '3' } }), /oldestUnansweredAgeDays/],
    // responders is optional (a probe written before RULING-2026-09-29-lines (h) has none), but when present it is
    // a list of responder ids and nothing else - the same rule as src/revenue/brand-mail.ts.
    ['responders is not a list', greenProbe({ responders: 'gumroad-refund' }), /responders/],
    ['responders holds something that is not an id', greenProbe({ responders: ['gumroad-refund', 'Someone <a@b.c>'] }), /responders/],
    ['responders holds a number', greenProbe({ responders: [1] }), /responders/],
  ];
  for (const [name, reading, reason] of notGreen) {
    it(`not green: ${name}`, () => {
      const out = brandMailboxGreen(reading, NOW);
      expect(out.green).toBe(false);
      expect(out.reason).toMatch(reason);
    });
  }

  it('enable refuses before any request - not the deployed site, not Gumroad - while the mailbox is not green', async () => {
    const siteWithId = { ...SITE, gumroad: { productUrl: SHORT, productId: ID } };
    for (const brandMail of [undefined, { configured: false, measuredAt: iso(NOW - HOUR) }, greenProbe({ measuredAt: iso(NOW - 5 * 24 * HOUR) })]) {
      const fetchImpl = fakeGumroad({});
      const err = await enableProduct({ fetchImpl, token: TOKEN, site: siteWithId, brandMail, nowMs: NOW, log: sink() }).catch((e) => e);
      expect(err).toBeInstanceOf(StopError);
      expect(err.message).toContain('brand mailbox (owner step 8)');
      expect(fetchImpl.calls).toHaveLength(0);
    }
  });

  it('create stays ungated: it runs with no probe at all', async () => {
    const fetchImpl = fakeGumroad({
      'GET /products': [200, { success: true, products: [] }],
      'POST /products': [200, { success: true, product: stored() }],
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored() }],
    });
    await expect(createOrReuse({ fetchImpl, token: TOKEN, site: SITE, log: sink() })).resolves.toMatchObject({ id: ID });
  });

  it('the CLI reads the probe file named by BRAND_MAIL_PROBE_FILE, and stops with exit 1 when it is missing', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ilbiz-'));
    const sitePath = join(dir, 'site.json');
    writeFileSync(sitePath, JSON.stringify({ ...SITE, gumroad: { productUrl: SHORT, productId: ID } }));
    const fetchImpl = fakeGumroad({});
    const log = sink();
    const code = await main(['enable'], { GUMROAD_ACCESS_TOKEN: TOKEN, BRAND_MAIL_PROBE_FILE: join(dir, 'absent.json') }, { fetchImpl, log, sitePath });
    expect(code).toBe(1);
    expect(log.lines.join('\n')).toContain('STOPPED');
    expect(log.lines.join('\n')).toContain('brand mailbox (owner step 8)');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('the CLI enables once the probe file is green', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ilbiz-'));
    const sitePath = join(dir, 'site.json');
    const probe = join(dir, 'brand-mail.json');
    writeFileSync(sitePath, JSON.stringify(SITE_READY));
    writeFileSync(probe, JSON.stringify(greenProbe({ measuredAt: iso(Date.now() - HOUR) })));
    const fetchImpl = fakeGumroad(offerRoutes());
    expect(await main(['enable'], { GUMROAD_ACCESS_TOKEN: TOKEN, BRAND_MAIL_PROBE_FILE: probe, BRAND_MAIL_ADDRESS: BRAND }, { fetchImpl, log: sink(), sitePath })).toBe(0);
    expect(fetchImpl.calls.filter((c) => c.method === 'PUT')).toHaveLength(1);
  });
});

describe('enable (AT-15, offline)', () => {
  const siteWithId = SITE_READY;
  const green = { brandMail: greenProbe(), nowMs: NOW, brandAddress: BRAND };
  const enable = (fetchImpl, over = {}) => enableProduct({ fetchImpl, token: TOKEN, site: siteWithId, ...green, log: sink(), ...over });
  const refused = async (fetchImpl, over, reason) => {
    const err = await enable(fetchImpl, over).catch((e) => e);
    expect(err).toBeInstanceOf(StopError);
    expect(err.message).toMatch(reason);
    expect(fetchImpl.calls.some((c) => c.method === 'PUT')).toBe(false);
    return err;
  };

  it('refuses while the deployed site.json does not carry the same id', async () => {
    await refused(fakeGumroad(offerRoutes({ deployed: { productId: '', priceCents: 7900, currency: 'ils' } })), {}, /product id/);
  });

  it('refuses when the repo has no product id', async () => {
    const fetchImpl = fakeGumroad({});
    await expect(enable(fetchImpl, { site: SITE })).rejects.toBeInstanceOf(StopError);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('enables once the deployed site verifies keys against this id, at the price and refund period Gumroad applies, from the brand account, with the responder scheduled', async () => {
    const fetchImpl = fakeGumroad(offerRoutes());
    const out = await enable(fetchImpl);
    expect(out.published).toBe(true);
    expect(fetchImpl.calls.filter((c) => c.method === 'PUT')).toHaveLength(1);
  });

  it('refuses when the repo site.json carries no price: the page would show none', async () => {
    const fetchImpl = fakeGumroad(offerRoutes());
    await refused(fetchImpl, { site: { ...SITE, gumroad: { productUrl: SHORT, productId: ID } } }, /price/);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('refuses when the deployed site shows no price, or another one', async () => {
    await refused(fakeGumroad(offerRoutes({ deployed: { productId: ID } })), {}, /deployed/);
    await refused(fakeGumroad(offerRoutes({ deployed: { productId: ID, priceCents: 6900, currency: 'ils' } })), {}, /deployed/);
    await refused(fakeGumroad(offerRoutes({ deployed: { productId: ID, priceCents: 7900, currency: 'usd' } })), {}, /deployed/);
  });

  it('refuses when Gumroad now charges another price than the page shows (edited in the dashboard since create)', async () => {
    const err = await refused(fakeGumroad(offerRoutes({ product: { price: 8900 } })), {}, /8900/);
    expect(err.message).toMatch(/7900/);
  });

  it('refuses when Gumroad now reports a membership or pay-what-you-want', async () => {
    await refused(fakeGumroad(offerRoutes({ product: { subscription_duration: 'monthly' } })), {}, /subscription/);
    await refused(fakeGumroad(offerRoutes({ product: { customizable_price: true } })), {}, /pay-what-you-want/);
  });

  it('refuses while the policy in force is not a bounded window of at least 14 days: "none", 7 days, or unreadable', async () => {
    await refused(fakeGumroad(offerRoutes({ account: accountPolicy('none') })), {}, /at least 14 days/);
    await refused(fakeGumroad(offerRoutes({ account: accountPolicy('7'), deployed: { ...SITE_READY.gumroad, refundPeriodDays: 7 } })), {}, /7-day money back guarantee/);
    await refused(fakeGumroad(offerRoutes({ account: { ...thirty, in_effect: false } })), {}, /refund/);
    await refused(fakeGumroad(offerRoutes({ product: ownPolicy('none') })), {}, /at least 14 days/);
  });

  it('refuses when the deployed page shows another refund period than Gumroad applies, or none', async () => {
    for (const refundPeriodDays of [14, null, undefined, '30']) {
      const err = await refused(fakeGumroad(offerRoutes({ deployed: { ...SITE_READY.gumroad, refundPeriodDays } })), {}, /refund period/);
      expect(err.message, String(refundPeriodDays)).toMatch(/30/);
    }
    // A 183-day product override passes only with 183 on the page.
    await refused(fakeGumroad(offerRoutes({ product: ownPolicy('183') })), {}, /refund period/);
    await expect(enable(fakeGumroad(offerRoutes({ product: ownPolicy('183'), deployed: { ...SITE_READY.gumroad, refundPeriodDays: 183 } })))).resolves.toMatchObject({ published: true });
  });

  it('refuses unless the Gumroad account\'s own address is the brand mailbox - and never prints either address', async () => {
    const personal = 'someone.private@gmail.com';
    for (const [over, routes] of [[{}, { email: personal }], [{}, { email: null }], [{ brandAddress: '' }, {}], [{ brandAddress: undefined }, {}]]) {
      const log = sink();
      const fetchImpl = fakeGumroad(offerRoutes(routes));
      const err = await enableProduct({ fetchImpl, token: TOKEN, site: siteWithId, ...green, log, ...over }).catch((e) => e);
      expect(err, JSON.stringify(routes)).toBeInstanceOf(StopError);
      expect(err.message).toMatch(/brand mailbox/);
      expect(fetchImpl.calls.some((c) => c.method === 'PUT')).toBe(false);
      for (const text of [err.message, ...log.lines]) {
        expect(text).not.toContain(personal);
        expect(text).not.toContain(BRAND);
      }
    }
  });

  it('an unset BRAND_MAIL_ADDRESS stops before Gumroad is asked; an account with no address never matches, even an unset one', async () => {
    const unset = fakeGumroad(offerRoutes());
    await refused(unset, { brandAddress: '' }, /BRAND_MAIL_ADDRESS/);
    expect(unset.calls.some((c) => c.url.endsWith('/user'))).toBe(false);
    await refused(fakeGumroad(offerRoutes({ email: null })), { brandAddress: '' }, /BRAND_MAIL_ADDRESS/);
    await refused(fakeGumroad(offerRoutes({ email: '  ' })), {}, /no email/);
  });

  it('matches the account address without regard to case or surrounding space', async () => {
    const fetchImpl = fakeGumroad(offerRoutes({ email: ' Mehudak.IL@gmail.com ' }));
    await expect(enable(fetchImpl)).resolves.toMatchObject({ published: true });
  });
});

describe('check: the same comparisons, after enable, without changing anything', () => {
  it('passes on a matching offer and sends nothing but reads', async () => {
    const fetchImpl = fakeGumroad(offerRoutes());
    await expect(checkOffer({ fetchImpl, token: TOKEN, site: SITE_READY, brandAddress: BRAND, log: sink() })).resolves.toMatchObject({ id: ID, refundPeriodDays: 30 });
    expect(fetchImpl.calls.every((c) => c.method === 'GET')).toBe(true);
  });

  // RULING-2026-09-29-lines (h) APPLY 5: the 30-day account passes when the deployed page shows 30, and fails on 14 or none.
  it('the 30-day account passes when the deployed refundPeriodDays is 30, and fails when it is 14 or null', async () => {
    const check = (deployed) => checkOffer({ fetchImpl: fakeGumroad(offerRoutes({ account: thirty, deployed })), token: TOKEN, site: SITE_READY, brandAddress: BRAND, log: sink() });
    await expect(check({ ...SITE_READY.gumroad, refundPeriodDays: 30 })).resolves.toMatchObject({ refundPeriodDays: 30 });
    for (const refundPeriodDays of [14, null]) {
      const err = await check({ ...SITE_READY.gumroad, refundPeriodDays }).catch((e) => e);
      expect(err, String(refundPeriodDays)).toBeInstanceOf(StopError);
      expect(err.message).toMatch(/refund period/);
    }
  });

  it('the CLI exits 1 on a price that drifted after enable, and 0 on a matching one', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ilbiz-'));
    const sitePath = join(dir, 'site.json');
    writeFileSync(sitePath, JSON.stringify(SITE_READY));
    const env = { GUMROAD_ACCESS_TOKEN: TOKEN, BRAND_MAIL_ADDRESS: BRAND };
    const drifted = fakeGumroad(offerRoutes({ product: { price: 9900 } }));
    const log = sink();
    expect(await main(['check'], env, { fetchImpl: drifted, log, sitePath })).toBe(1);
    expect(log.lines.join('\n')).toContain('STOPPED');
    expect(drifted.calls.some((c) => c.method !== 'GET')).toBe(false);
    expect(await main(['check'], env, { fetchImpl: fakeGumroad(offerRoutes()), log: sink(), sitePath })).toBe(0);
  });

  it('with no product id yet, there is nothing to check: a notice and exit 0', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ilbiz-'));
    const sitePath = join(dir, 'site.json');
    writeFileSync(sitePath, JSON.stringify(SITE));
    const fetchImpl = fakeGumroad({});
    const log = sink();
    expect(await main(['check'], { GUMROAD_ACCESS_TOKEN: TOKEN, BRAND_MAIL_ADDRESS: BRAND }, { fetchImpl, log, sitePath })).toBe(0);
    expect(fetchImpl.calls).toHaveLength(0);
    expect(log.lines.join('\n')).toMatch(/nothing to check/i);
  });
});

describe('the CLI', () => {
  it('without the token: a clear notice and exit 0, no request', async () => {
    const log = sink();
    const fetchImpl = fakeGumroad({});
    for (const cmd of ['create', 'enable', 'check']) {
      expect(await main([cmd], {}, { fetchImpl, log })).toBe(0);
    }
    // A refund that could not be made is not a success: the responder must not answer as if it were.
    expect(await main(['refund', '--email', 'buyer@example.org'], {}, { fetchImpl, log })).toBe(1);
    expect(fetchImpl.calls).toHaveLength(0);
    expect(log.lines.join('\n')).toContain(NO_TOKEN_NOTICE);
    expect(NO_TOKEN_NOTICE).toContain('GUMROAD_ACCESS_TOKEN');
    expect(NO_TOKEN_NOTICE).toContain('not a failure');
  });

  it('create --write-site-json writes the id, the URL, Gumroad\'s price and its refund period, and nothing else', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ilbiz-'));
    const path = join(dir, 'site.json');
    const before = { ...SITE, analytics: { provider: 'none' } };
    writeFileSync(path, JSON.stringify(before, null, 2));
    const fetchImpl = fakeGumroad({
      'GET /products': [200, { success: true, products: [] }],
      'POST /products': [200, { success: true, product: stored() }],
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored({ refund_policy: inherits }) }],
      'GET /refund_policy': [200, { success: true, refund_policy: thirty }],
    });
    const log = sink();
    const out = join(dir, 'out');
    expect(await main(['create', '--write-site-json'], { GUMROAD_ACCESS_TOKEN: TOKEN, GITHUB_OUTPUT: out }, { fetchImpl, log, sitePath: path })).toBe(0);
    const after = JSON.parse(readFileSync(path, 'utf8'));
    expect(after).toEqual({ ...before, gumroad: { productUrl: SHORT, productId: ID, priceCents: 7900, currency: 'ils', refundPeriodDays: 30 } });
    expect(readFileSync(out, 'utf8')).toBe(`product_id=${ID}\nshort_url=${SHORT}\n`);
    expect(log.lines.join('\n')).not.toContain(TOKEN);
  });

  it('a live refusal exits 1 with the reason, and writes nothing', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ilbiz-'));
    const path = join(dir, 'site.json');
    writeFileSync(path, JSON.stringify(SITE, null, 2));
    const fetchImpl = fakeGumroad({ 'GET /products': [401, { success: false, message: 'The access token is invalid' }] });
    const log = sink();
    expect(await main(['create', '--write-site-json'], { GUMROAD_ACCESS_TOKEN: TOKEN }, { fetchImpl, log, sitePath: path })).toBe(1);
    expect(log.lines.join('\n')).toContain('STOPPED');
    expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual(SITE);
    expect(existsSync(join(dir, 'out'))).toBe(false);
  });

  it('refuses an invalid price or currency before calling Gumroad to create', async () => {
    const fetchImpl = fakeGumroad({ 'GET /products': [200, { success: true, products: [] }] });
    const dir = mkdtempSync(join(tmpdir(), 'ilbiz-'));
    const path = join(dir, 'site.json');
    writeFileSync(path, JSON.stringify(SITE));
    for (const env of [{ PRICE_CENTS: '79.5' }, { PRICE_CENTS: '-1' }, { CURRENCY: 'shekel' }]) {
      expect(await main(['create'], { GUMROAD_ACCESS_TOKEN: TOKEN, ...env }, { fetchImpl, log: sink(), sitePath: path })).toBe(1);
    }
    expect(fetchImpl.calls).toHaveLength(0);
  });
});

// RULING-2026-09-29-lines (h) APPLY 1: `refund --email <addr>`, the command the brand-mail responder calls. It refunds
// only a sale of THIS product whose buyer address is the one asking, inside the window in force, once; it is a dry
// run unless --apply; and it logs sale ids, never an address. The responder's reply does not depend on what it found.
describe('refund --email: one sale of this product, by this buyer, inside the live window, once', () => {
  const BUYER = 'buyer.one@example.org';
  const OTHER_PRODUCT = 'zz-other-product==';
  const SALES_PATH = 'GET /sales';
  const REFUND_OF = (id) => `PUT /sales/${encodeURIComponent(id)}/refund`;
  const sale = (over = {}) => ({
    id: 'sale-A',
    email: BUYER,
    purchase_email: BUYER,
    product_id: ID,
    created_at: iso(NOW - 3 * DAY),
    refunded: false,
    partially_refunded: false,
    chargedback: false,
    disputed: false,
    dispute_won: false,
    ...over,
  });
  /** A fake Gumroad holding these sales; a refund marks the sale refunded, as Gumroad does. */
  const gumroadWith = (sales, { account = thirty, product = {}, refundAnswer } = {}) => {
    const state = sales.map((x) => ({ ...x }));
    const routes = {
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored({ refund_policy: inherits, ...product }) }],
      'GET /refund_policy': [200, { success: true, refund_policy: account }],
      [SALES_PATH]: () => [200, { success: true, sales: state.map((x) => ({ ...x })) }],
    };
    for (const x of state) {
      routes[REFUND_OF(x.id)] = () => {
        if (refundAnswer) return refundAnswer;
        if (x.refunded) return [200, { success: false, message: 'Purchase is already refunded.' }];
        x.refunded = true;
        return [200, { success: true, sale: { ...x } }];
      };
    }
    const impl = fakeGumroad(routes);
    impl.state = state;
    return impl;
  };
  const refund = (fetchImpl, over = {}) => refundSale({ fetchImpl, token: TOKEN, site: SITE_READY, email: BUYER, nowMs: NOW, log: sink(), ...over });
  const puts = (fetchImpl) => fetchImpl.calls.filter((c) => c.method === 'PUT');

  it('refunds the buyer\'s sale of this product in full with --apply, and logs its id', async () => {
    const fetchImpl = gumroadWith([sale()]);
    const log = sink();
    const out = await refund(fetchImpl, { apply: true, log });
    expect(out).toMatchObject({ action: 'refunded', saleId: 'sale-A' });
    expect(puts(fetchImpl)).toHaveLength(1);
    expect(puts(fetchImpl)[0].url).toBe(`${API}/sales/sale-A/refund`);
    expect(puts(fetchImpl)[0].body).toBeUndefined(); // no amount_cents: the whole price, no cancellation fee
    expect(log.lines.join('\n')).toContain('sale-A');
    expect(log.lines.join('\n')).toMatch(/refund id/);
  });

  it('asks Gumroad for this product\'s sales to this address, and sends the address only to Gumroad', async () => {
    const fetchImpl = gumroadWith([sale()]);
    await refund(fetchImpl, { apply: true });
    const q = new URL(fetchImpl.calls.find((c) => c.url.includes('/sales?')).url).searchParams;
    expect(q.get('email')).toBe(BUYER);
    expect(q.get('product_id')).toBe(ID);
    for (const c of fetchImpl.calls) expect(c.init.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('is a dry run by default: it says which sale it would refund and sends nothing that changes anything', async () => {
    const fetchImpl = gumroadWith([sale()]);
    const log = sink();
    const out = await refund(fetchImpl, { log });
    expect(out).toMatchObject({ action: 'dry-run', saleId: 'sale-A' });
    expect(fetchImpl.calls.every((c) => c.method === 'GET')).toBe(true);
    expect(log.lines.join('\n')).toMatch(/dry run: would refund sale sale-A/);
  });

  it('ignores a sale of another product, even one Gumroad returns for this address', async () => {
    const fetchImpl = gumroadWith([sale({ id: 'sale-X', product_id: OTHER_PRODUCT })]);
    expect(await refund(fetchImpl, { apply: true })).toMatchObject({ action: 'none' });
    expect(puts(fetchImpl)).toHaveLength(0);
  });

  it('ignores a sale whose buyer address is not the one asking, whatever the API filter returned', async () => {
    const fetchImpl = gumroadWith([sale({ id: 'sale-S', email: 'someone.else@example.org', purchase_email: 'someone.else@example.org' })]);
    expect(await refund(fetchImpl, { apply: true })).toMatchObject({ action: 'none' });
    expect(puts(fetchImpl)).toHaveLength(0);
    // The purchase address or the buyer's account address may match; case and surrounding space do not matter.
    const alias = gumroadWith([sale({ email: 'account@example.org', purchase_email: ' Buyer.One@Example.org ' })]);
    expect(await refund(alias, { apply: true })).toMatchObject({ action: 'refunded' });
  });

  it('refuses a sale outside the window in force, measured at the request', async () => {
    const late = gumroadWith([sale({ created_at: iso(NOW - 31 * DAY) })]);
    const log = sink();
    expect(await refund(late, { apply: true, log })).toMatchObject({ action: 'none' });
    expect(puts(late)).toHaveLength(0);
    expect(log.lines.join('\n')).toMatch(/outside the 30-day window: 1/);
    // Asked on day 29, handled on day 31: inside, since the window is measured when the buyer asked.
    const asked = gumroadWith([sale({ created_at: iso(NOW - 31 * DAY) })]);
    expect(await refund(asked, { apply: true, requestedAtMs: NOW - 2 * DAY })).toMatchObject({ action: 'refunded' });
    // A request time in the future is clamped to now; a request before the purchase is not about that purchase.
    const future = gumroadWith([sale({ created_at: iso(NOW - HOUR) })]);
    expect(await refund(future, { apply: true, requestedAtMs: NOW + 40 * DAY })).toMatchObject({ action: 'refunded' });
    const before = gumroadWith([sale({ created_at: iso(NOW - 1 * DAY) })]);
    expect(await refund(before, { apply: true, requestedAtMs: NOW - 2 * DAY })).toMatchObject({ action: 'none' });
    // The window is the one Gumroad applies now: a 183-day product override reaches further.
    const long = gumroadWith([sale({ created_at: iso(NOW - 100 * DAY) })], { product: ownPolicy('183') });
    expect(await refund(long, { apply: true })).toMatchObject({ action: 'refunded' });
  });

  it('is idempotent: a refunded sale is never refunded again, and a second request does nothing', async () => {
    const fetchImpl = gumroadWith([sale()]);
    expect(await refund(fetchImpl, { apply: true })).toMatchObject({ action: 'refunded' });
    expect(await refund(fetchImpl, { apply: true })).toMatchObject({ action: 'none' });
    expect(puts(fetchImpl)).toHaveLength(1);
    for (const over of [{ refunded: true }, { partially_refunded: true }, { chargedback: true }, { disputed: true }]) {
      const done = gumroadWith([sale(over)]);
      expect(await refund(done, { apply: true }), JSON.stringify(over)).toMatchObject({ action: 'none' });
      expect(puts(done)).toHaveLength(0);
    }
  });

  it('refunds one sale per request, the most recent eligible one', async () => {
    const fetchImpl = gumroadWith([sale({ id: 'sale-old', created_at: iso(NOW - 10 * DAY) }), sale({ id: 'sale-new', created_at: iso(NOW - 2 * DAY) })]);
    expect(await refund(fetchImpl, { apply: true })).toMatchObject({ action: 'refunded', saleId: 'sale-new' });
    expect(puts(fetchImpl)).toHaveLength(1);
  });

  it('follows the sales pagination', async () => {
    const fetchImpl = fakeGumroad({
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored({ refund_policy: inherits }) }],
      'GET /refund_policy': [200, { success: true, refund_policy: thirty }],
      [SALES_PATH]: (url) => (new URL(url).searchParams.get('page_key') === 'p2'
        ? [200, { success: true, sales: [sale()] }]
        : [200, { success: true, sales: [sale({ id: 'sale-X', product_id: OTHER_PRODUCT })], next_page_key: 'p2' }]),
      [REFUND_OF('sale-A')]: [200, { success: true, sale: sale({ refunded: true }) }],
    });
    expect(await refund(fetchImpl, { apply: true })).toMatchObject({ action: 'refunded', saleId: 'sale-A' });
  });

  it('stops, refunding nothing, when no bounded window of 14+ days is in force or Gumroad cannot be read', async () => {
    for (const [name, fetchImpl] of [
      ['none', gumroadWith([sale()], { account: accountPolicy('none') })],
      ['7 days', gumroadWith([sale()], { account: accountPolicy('7') })],
      ['unreadable', gumroadWith([sale()], { account: { ...thirty, in_effect: false } })],
      ['sales unreadable', fakeGumroad({
        [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored({ refund_policy: inherits }) }],
        'GET /refund_policy': [200, { success: true, refund_policy: thirty }],
        [SALES_PATH]: [500, { success: false }],
      })],
    ]) {
      const err = await refund(fetchImpl, { apply: true }).catch((e) => e);
      expect(err, name).toBeInstanceOf(StopError);
      expect(puts(fetchImpl), name).toHaveLength(0);
    }
  });

  it('stops when Gumroad refuses the refund, so the responder does not answer as if it were done', async () => {
    const fetchImpl = gumroadWith([sale()], { refundAnswer: [200, { success: false, message: 'balance too low' }] });
    const err = await refund(fetchImpl, { apply: true }).catch((e) => e);
    expect(err).toBeInstanceOf(StopError);
    expect(err.message).toContain('sale-A');
  });

  it('refuses without a product id or a usable address, before asking Gumroad', async () => {
    for (const over of [{ site: SITE }, { email: '' }, { email: 'not an address' }, { email: undefined }]) {
      const fetchImpl = gumroadWith([sale()]);
      const err = await refund(fetchImpl, { apply: true, ...over }).catch((e) => e);
      expect(err, JSON.stringify(over)).toBeInstanceOf(StopError);
      expect(fetchImpl.calls).toHaveLength(0);
      expect(err.message).not.toContain('not an address');
    }
  });

  it('never logs or throws the address - not in a refund, a dry run, a refusal or an error', async () => {
    const texts = [];
    const runs = [
      [gumroadWith([sale()]), { apply: true }],
      [gumroadWith([sale()]), {}],
      [gumroadWith([sale({ created_at: iso(NOW - 40 * DAY) })]), { apply: true }],
      [gumroadWith([sale()], { refundAnswer: [200, { success: false, message: 'nope' }] }), { apply: true }],
      [gumroadWith([sale()], { account: accountPolicy('none') }), { apply: true }],
      [fakeGumroad({ [`GET /products/${encodeURIComponent(ID)}`]: [401, { success: false }] }), { apply: true }],
      // Gumroad echoing the address back in a refusal: redacted before it reaches a log line or an error.
      [gumroadWith([sale()], { refundAnswer: [200, { success: false, message: `No refund for ${BUYER.toUpperCase()}.` }] }), { apply: true }],
      [fakeGumroad({ [`GET /products/${encodeURIComponent(ID)}`]: [404, { success: false, message: `not found for ${BUYER}` }] }), { apply: true }],
    ];
    for (const [fetchImpl, over] of runs) {
      const log = sink();
      const out = await refund(fetchImpl, { log, ...over }).catch((e) => e);
      texts.push(...log.lines, out instanceof Error ? out.message : JSON.stringify(out));
    }
    for (const text of texts) {
      expect(text).not.toContain(BUYER);
      expect(text.toLowerCase()).not.toContain('buyer.one');
      expect(text).not.toContain(TOKEN);
    }
  });

  it('the CLI: a dry run unless --apply, exit 0 either way, and exit 1 when it stops', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ilbiz-'));
    const sitePath = join(dir, 'site.json');
    writeFileSync(sitePath, JSON.stringify(SITE_READY));
    const env = { GUMROAD_ACCESS_TOKEN: TOKEN };
    const recent = () => gumroadWith([sale({ created_at: new Date(Date.now() - 3 * DAY).toISOString() })]);

    const dry = recent();
    const log = sink();
    expect(await main(['refund', '--email', BUYER], env, { fetchImpl: dry, log, sitePath })).toBe(0);
    expect(puts(dry)).toHaveLength(0);
    expect(log.lines.join('\n')).toMatch(/dry run/);

    const real = recent();
    const realLog = sink();
    expect(await main(['refund', '--email', BUYER, '--apply'], env, { fetchImpl: real, log: realLog, sitePath })).toBe(0);
    expect(puts(real)).toHaveLength(1);
    expect(realLog.lines.join('\n')).not.toContain(BUYER);

    const asked = recent();
    expect(await main(['refund', '--email', BUYER, '--requested-at', new Date(Date.now() - DAY).toISOString(), '--apply'], env, { fetchImpl: asked, log: sink(), sitePath })).toBe(0);
    expect(puts(asked)).toHaveLength(1);

    for (const argv of [['refund'], ['refund', '--email'], ['refund', '--email', BUYER, '--requested-at', 'yesterday'], ['refund', '--email', BUYER, '--bogus']]) {
      const f = recent();
      const l = sink();
      expect(await main(argv, env, { fetchImpl: f, log: l, sitePath }), argv.join(' ')).not.toBe(0);
      expect(puts(f)).toHaveLength(0);
      expect(l.lines.join('\n')).not.toContain(BUYER);
    }
  });
});

describe('the workflows hand the script what it compares', () => {
  const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
  const workflow = (name) => readFileSync(join(repoRoot, '.github', 'workflows', name), 'utf8');
  /** The text of the one step whose `run:` invokes the script with this command. */
  const stepRunning = (yml, command) => {
    const steps = yml.split(/\n(?=      - )/);
    const hits = steps.filter((st) => new RegExp(`run: node scripts/gumroad-pro-product\\.js ${command}\\b`).test(st));
    expect(hits, command).toHaveLength(1);
    return hits[0];
  };

  it('enable gets the step-8 address by env, beside the token', () => {
    const step = stepRunning(workflow('gumroad-pro-product.yml'), 'enable');
    expect(step).toContain('GUMROAD_ACCESS_TOKEN: ${{ secrets.GUMROAD_ACCESS_TOKEN }}');
    expect(step).toContain('BRAND_MAIL_ADDRESS: ${{ secrets.BRAND_MAIL_ADDRESS }}');
  });

  it('the AT-16 probe re-checks the offer (price, refunds, account) with the same comparisons, reads only', () => {
    const yml = workflow('gumroad-pro-probe.yml');
    const step = stepRunning(`\n${yml.slice(yml.indexOf('    steps:'))}`, 'check');
    expect(step).toContain('working-directory: products/il-biz-tools');
    expect(step).toContain('GUMROAD_ACCESS_TOKEN: ${{ secrets.GUMROAD_ACCESS_TOKEN }}');
    expect(step).toContain('BRAND_MAIL_ADDRESS: ${{ secrets.BRAND_MAIL_ADDRESS }}');
    expect(yml).toMatch(/permissions:\s*\n\s*contents: read/);
  });
});
