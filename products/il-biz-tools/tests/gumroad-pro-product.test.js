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
} from '../scripts/gumroad-pro-product.js';

const TOKEN = 'secret-token-never-printed-0123456789';
const SITE = { siteUrl: 'https://il-biz-tools.netlify.app', siteName: 'כלים לעסק', gumroad: { productUrl: '', productId: '' } };
const NAME = proProductName(SITE);
const ID = '32-nPAicqbLj8B_WswVlMw==';
const SHORT = 'https://kelim.gumroad.com/l/pro';

const stored = (overrides = {}) => ({ id: ID, name: NAME, published: false, short_url: SHORT, rich_content: activationContent(SITE).map((p) => ({ id: 'page1', ...p })), ...overrides });

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

    expect(out).toEqual({ id: ID, shortUrl: SHORT, published: false, reused: false });
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

describe('enable (AT-15, offline)', () => {
  const siteWithId = { ...SITE, gumroad: { productUrl: SHORT, productId: ID } };

  it('refuses while the deployed site.json does not carry the same id', async () => {
    const fetchImpl = fakeGumroad({
      'GET https://il-biz-tools.netlify.app/src/config/site.json': [200, { gumroad: { productId: '' } }],
    });
    await expect(enableProduct({ fetchImpl, token: TOKEN, site: siteWithId, log: sink() })).rejects.toBeInstanceOf(StopError);
    expect(fetchImpl.calls.some((c) => c.method === 'PUT')).toBe(false);
  });

  it('refuses when the repo has no product id', async () => {
    const fetchImpl = fakeGumroad({});
    await expect(enableProduct({ fetchImpl, token: TOKEN, site: SITE, log: sink() })).rejects.toBeInstanceOf(StopError);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('enables once the deployed site verifies keys against this id', async () => {
    const fetchImpl = fakeGumroad({
      'GET https://il-biz-tools.netlify.app/src/config/site.json': [200, { gumroad: { productId: ID } }],
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored() }],
      [`PUT /products/${encodeURIComponent(ID)}/enable`]: [200, { success: true, product: stored({ published: true }) }],
    });
    const out = await enableProduct({ fetchImpl, token: TOKEN, site: siteWithId, log: sink() });
    expect(out.published).toBe(true);
    expect(fetchImpl.calls.filter((c) => c.method === 'PUT')).toHaveLength(1);
  });
});

describe('the CLI', () => {
  it('without the token: a clear notice and exit 0, no request', async () => {
    const log = sink();
    const fetchImpl = fakeGumroad({});
    for (const cmd of ['create', 'enable']) {
      expect(await main([cmd], {}, { fetchImpl, log })).toBe(0);
    }
    expect(fetchImpl.calls).toHaveLength(0);
    expect(log.lines.join('\n')).toContain(NO_TOKEN_NOTICE);
    expect(NO_TOKEN_NOTICE).toContain('GUMROAD_ACCESS_TOKEN');
    expect(NO_TOKEN_NOTICE).toContain('not a failure');
  });

  it('create --write-site-json writes the id and URL and nothing else', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ilbiz-'));
    const path = join(dir, 'site.json');
    const before = { ...SITE, analytics: { provider: 'none' } };
    writeFileSync(path, JSON.stringify(before, null, 2));
    const fetchImpl = fakeGumroad({
      'GET /products': [200, { success: true, products: [] }],
      'POST /products': [200, { success: true, product: stored() }],
      [`GET /products/${encodeURIComponent(ID)}`]: [200, { success: true, product: stored() }],
    });
    const log = sink();
    const out = join(dir, 'out');
    expect(await main(['create', '--write-site-json'], { GUMROAD_ACCESS_TOKEN: TOKEN, GITHUB_OUTPUT: out }, { fetchImpl, log, sitePath: path })).toBe(0);
    const after = JSON.parse(readFileSync(path, 'utf8'));
    expect(after).toEqual({ ...before, gumroad: { productUrl: SHORT, productId: ID } });
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
