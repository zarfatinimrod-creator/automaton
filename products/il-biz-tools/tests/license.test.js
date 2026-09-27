// The Pro licence under Option C (research/measurements/gumroad-license-decision.md):
// Gumroad's own per-sale key, verified once from the buyer's browser, cached,
// re-checked at most every 7 days, switched off only on a definitive answer.
//
// Every test here injects fetch and fakes localStorage. None touches the network.
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  VERIFY_URL,
  LICENSE_STORAGE_KEY,
  RECHECK_INTERVAL_MS,
  VERIFY_TIMEOUT_MS,
  normalizeKey,
  isGumroadKeyShaped,
  classifyVerifyResponse,
  verifyWithGumroad,
  readLicenseRecord,
  writeLicenseRecord,
  clearLicenseRecord,
  shouldRecheck,
  createLicenseController,
  LICENSE_NOTES,
} from '../src/lib/license.js';
import {
  DOCUMENTED_SUCCESS_TEXT,
  documentedSuccess,
  fullDocumentedSuccess,
  NOT_FOUND_BODIES,
  LIVE_2509_BODY,
  NON_DEFINITIVE,
  response,
  fetchMock,
  deferredFetch,
  memoryStorage,
} from './fixtures/gumroad-verify.js';

const KEY = 'A1B2C3D4-E5F60718-9ABCDEF0-1234ABCD';
// The retired signed format, built from parts so that `grep -rn` for its prefix
// finds nothing anywhere in this product (AT-10).
const LEGACY_PREFIX = ['ILBIZ', '1'].join('');
const DAY = 86_400_000;
const NOW = Date.UTC(2026, 8, 27, 12, 0, 0);

afterEach(() => { vi.restoreAllMocks(); });

function controller({ storage = memoryStorage(), fetchImpl = fetchMock(response(200, documentedSuccess())), productId = 'NEW', online = true, now = NOW } = {}) {
  const renders = [];
  const ctl = createLicenseController({
    storage,
    fetchImpl,
    productId: () => productId,
    now: () => now,
    isOnline: () => online,
    render: (s) => renders.push(s),
  });
  return { ctl, renders, storage, fetchImpl, lastNote: () => [...renders].reverse().find((r) => r.note !== undefined)?.note };
}

const stored = (storage) => JSON.parse(storage.getItem(LICENSE_STORAGE_KEY));
const activeRecord = (overrides = {}) => ({ v: 1, key: KEY, productId: 'OLD', status: 'active', activatedAt: NOW - 30 * DAY, lastCheckAt: NOW - 8 * DAY, ...overrides });

describe('AT-1 key shape gate', () => {
  it('normalizes by trimming and upper-casing', () => {
    expect(normalizeKey(' a1b2c3d4-e5f60718-9abcdef0-1234abcd ')).toBe(KEY);
  });

  it("accepts only Gumroad's four groups of eight hex characters", () => {
    expect(isGumroadKeyShaped(KEY)).toBe(true);
    for (const bad of [`${LEGACY_PREFIX}.x.y`, '', null, undefined, 'A1B2C3D4-E5F60718-9ABCDEF0', 'A1B2C3D4-E5F60718-9ABCDEF0-1234ABCG', 'a1b2c3d4-e5f60718-9abcdef0-1234abcd', 42]) {
      expect(isGumroadKeyShaped(bad), String(bad)).toBe(false);
    }
  });

  it('activating a key that is not shaped makes zero fetch calls', async () => {
    for (const bad of [`${LEGACY_PREFIX}.x.y`, '', '   ', 'hello', 'A1B2C3D4-E5F60718-9ABCDEF0', 'A1B2C3D4-E5F60718-9ABCDEF0-1234ABCG']) {
      const { ctl, fetchImpl, storage, lastNote } = controller();
      const result = await ctl.activate(bad);
      expect(result.reason).toBe('not_a_license_key');
      expect(fetchImpl.calls).toHaveLength(0);
      expect(storage.getItem(LICENSE_STORAGE_KEY)).toBeNull();
      expect(lastNote()).toBe(LICENSE_NOTES.not_a_license_key);
      expect(ctl.state.proActive).toBe(false);
    }
  });
});

describe('AT-2 request shape', () => {
  it('sends exactly one simple POST to api.gumroad.com with product_id and license_key', async () => {
    const fetchImpl = fetchMock(response(200, documentedSuccess()));
    await verifyWithGumroad({ productId: 'P', key: KEY, increment: true, fetchImpl });

    expect(fetchImpl.calls).toHaveLength(1);
    const { url, init, body } = fetchImpl.calls[0];
    expect(url).toBe('https://api.gumroad.com/v2/licenses/verify');
    expect(VERIFY_URL).toBe(url);
    expect(new URL(url).host).toBe('api.gumroad.com');
    expect(new URL(url).host).not.toBe('gumroad.com');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(URLSearchParams);
    expect(body).toContain('product_id=P');
    expect(body).toContain(`license_key=${KEY}`);
    expect(body).not.toContain('increment_uses_count');
  });

  it('asks Gumroad not to count the use when increment is false', async () => {
    const fetchImpl = fetchMock(response(200, documentedSuccess()));
    await verifyWithGumroad({ productId: 'P', key: KEY, increment: false, fetchImpl });
    expect(fetchImpl.calls).toHaveLength(1);
    expect(fetchImpl.calls[0].body).toContain('increment_uses_count=false');
  });

  it('omits credentials, carries an AbortSignal, and sets no header that would trigger a preflight', async () => {
    const fetchImpl = fetchMock(response(200, documentedSuccess()));
    await verifyWithGumroad({ productId: 'P', key: KEY, increment: true, fetchImpl });
    const { init } = fetchImpl.calls[0];
    expect(init.credentials).toBe('omit');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const headerNames = init.headers ? Object.keys(init.headers).map((h) => h.toLowerCase()) : [];
    expect(headerNames.filter((h) => h !== 'content-type')).toEqual([]);
    if (init.headers) expect(String(Object.values(init.headers)[0])).toMatch(/^application\/x-www-form-urlencoded/);
  });

  it('times out after 8 seconds by default', async () => {
    expect(VERIFY_TIMEOUT_MS).toBe(8000);
    const spy = vi.spyOn(AbortSignal, 'timeout');
    await verifyWithGumroad({ productId: 'P', key: KEY, increment: true, fetchImpl: fetchMock(response(200, documentedSuccess())) });
    expect(spy).toHaveBeenCalledWith(8000);
  });
});

describe('AT-3 classifier: success payloads', () => {
  it("reads Gumroad's documented example as active", () => {
    // The fixture is the help page's text verbatim; prove it parses to what the page shows.
    expect(DOCUMENTED_SUCCESS_TEXT).toContain('"uses": 3');
    const body = documentedSuccess();
    expect(body.uses).toBe(3);
    expect(body.purchase).toMatchObject({ refunded: false, disputed: false, dispute_won: false, chargebacked: false });
    expect(classifyVerifyResponse({ status: 200, body })).toEqual({ verdict: 'active', reason: null });
  });

  it('revokes on refund, chargeback and an open or lost dispute', () => {
    expect(classifyVerifyResponse({ status: 200, body: documentedSuccess({ refunded: true }) })).toEqual({ verdict: 'revoked', reason: 'refunded' });
    expect(classifyVerifyResponse({ status: 200, body: documentedSuccess({ chargebacked: true }) })).toEqual({ verdict: 'revoked', reason: 'chargebacked' });
    expect(classifyVerifyResponse({ status: 200, body: documentedSuccess({ disputed: true, dispute_won: false }) })).toEqual({ verdict: 'revoked', reason: 'disputed' });
  });

  it('keeps Pro on when the seller won the dispute', () => {
    expect(classifyVerifyResponse({ status: 200, body: documentedSuccess({ disputed: true, dispute_won: true }) })).toEqual({ verdict: 'active', reason: null });
  });

  it('revokes when any subscription end timestamp is set', () => {
    for (const field of ['subscription_ended_at', 'subscription_cancelled_at', 'subscription_failed_at']) {
      expect(classifyVerifyResponse({ status: 200, body: documentedSuccess({ [field]: '2026-01-01T00:00:00Z' }) }), field)
        .toEqual({ verdict: 'revoked', reason: 'subscription_ended' });
    }
  });

  it('enforces no seat limit: 500 uses is still active', () => {
    const body = { ...documentedSuccess(), uses: 500 };
    expect(classifyVerifyResponse({ status: 200, body })).toEqual({ verdict: 'active', reason: null });
  });

  it('treats a 200 that does not say success:true as unknown', () => {
    for (const body of [{ success: false }, {}, null, 'OK', '<html>ok</html>', { success: 'true' }]) {
      expect(classifyVerifyResponse({ status: 200, body }).verdict, JSON.stringify(body)).toBe('unknown');
    }
  });
});

describe('AT-4 classifier: definitive 404s', () => {
  it("revokes on each of Gumroad's three 404 bodies, naming the reason", () => {
    for (const [reason, body] of Object.entries(NOT_FOUND_BODIES)) {
      expect(classifyVerifyResponse({ status: 404, body })).toEqual({ verdict: 'revoked', reason });
    }
  });

  it('reads the exact body the runner received on 25.9 as not_found', () => {
    expect(classifyVerifyResponse({ status: 404, body: LIVE_2509_BODY })).toEqual({ verdict: 'revoked', reason: 'not_found' });
    expect(classifyVerifyResponse({ status: 404, body: JSON.parse(LIVE_2509_BODY) })).toEqual({ verdict: 'revoked', reason: 'not_found' });
  });

  it("does not revoke on Gumroad's generic JSON 404, which says nothing about the key", () => {
    // application_controller.rb e404_json: a routing or lookup miss, not a verdict on this licence.
    expect(classifyVerifyResponse({ status: 404, body: { success: false, error: 'Not found' } }).verdict).toBe('unknown');
    expect(classifyVerifyResponse({ status: 404, body: { success: false, message: 'Some other text' } }).verdict).toBe('unknown');
  });
});

describe('AT-5 classifier and verifier: nothing non-definitive ever revokes', () => {
  for (const row of NON_DEFINITIVE) {
    it(`${row.name} -> unknown`, async () => {
      const result = await verifyWithGumroad({ productId: 'P', key: KEY, increment: false, fetchImpl: fetchMock(row.answer) });
      expect(result.verdict).toBe('unknown');
      expect(result.verdict).not.toBe('revoked');
    });
  }

  it('a missing fetch is unknown, not a crash', async () => {
    const result = await verifyWithGumroad({ productId: 'P', key: KEY, increment: true, fetchImpl: undefined });
    expect(result.verdict).toBe('unknown');
  });

  it('a body that cannot be read is unknown', async () => {
    const fetchImpl = fetchMock({ status: 200, text: async () => { throw new Error('stream broke'); } });
    expect((await verifyWithGumroad({ productId: 'P', key: KEY, increment: true, fetchImpl })).verdict).toBe('unknown');
  });
});

describe('re-check throttle', () => {
  it('is exactly seven days', () => {
    expect(RECHECK_INTERVAL_MS).toBe(7 * 86_400_000);
  });

  it('re-checks an active record only once seven days have passed', () => {
    expect(shouldRecheck(activeRecord({ lastCheckAt: NOW - DAY }), NOW)).toBe(false);
    expect(shouldRecheck(activeRecord({ lastCheckAt: NOW - 7 * DAY + 1 }), NOW)).toBe(false);
    expect(shouldRecheck(activeRecord({ lastCheckAt: NOW - 7 * DAY }), NOW)).toBe(true);
    expect(shouldRecheck(activeRecord({ lastCheckAt: NOW - 8 * DAY }), NOW)).toBe(true);
  });

  it('never re-checks a pending record or nothing', () => {
    expect(shouldRecheck({ ...activeRecord(), status: 'pending' }, NOW)).toBe(false);
    expect(shouldRecheck(null, NOW)).toBe(false);
  });

  it('re-checks when the stored time cannot be trusted (missing, or in the future)', () => {
    expect(shouldRecheck(activeRecord({ lastCheckAt: null }), NOW)).toBe(true);
    expect(shouldRecheck(activeRecord({ lastCheckAt: NOW + 30 * DAY }), NOW)).toBe(true);
  });
});

describe('the stored record', () => {
  it('round-trips and writes only the allowed keys', () => {
    const storage = memoryStorage();
    expect(writeLicenseRecord(storage, { ...activeRecord(), email: 'customer@example.com', purchase: { full_name: 'x' } })).toBe(true);
    expect(Object.keys(stored(storage)).sort()).toEqual(['activatedAt', 'key', 'lastCheckAt', 'productId', 'status', 'v']);
    expect(readLicenseRecord(storage)).toEqual(activeRecord());
  });

  it('clears the retired signed format and anything malformed, and reports nothing', () => {
    for (const junk of [`${LEGACY_PREFIX}.abc.def`, 'not json', '{"v":2}', JSON.stringify({ ...activeRecord(), key: 'short' }), JSON.stringify({ ...activeRecord(), status: 'revoked' }), JSON.stringify({ ...activeRecord(), productId: '' })]) {
      const storage = memoryStorage({ [LICENSE_STORAGE_KEY]: junk });
      expect(readLicenseRecord(storage), junk).toBeNull();
      expect(storage.getItem(LICENSE_STORAGE_KEY), junk).toBeNull();
    }
  });

  it('survives a storage that throws', () => {
    const hostile = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
    expect(readLicenseRecord(hostile)).toBeNull();
    expect(writeLicenseRecord(hostile, activeRecord())).toBe(false);
    expect(() => clearLicenseRecord(hostile)).not.toThrow();
  });
});

describe('AT-9 privacy', () => {
  it('returns only verdict, reason and uses from the verifier - never the body', async () => {
    const result = await verifyWithGumroad({ productId: 'P', key: KEY, increment: true, fetchImpl: fetchMock(response(200, fullDocumentedSuccess())) });
    expect(Object.keys(result).sort()).toEqual(['reason', 'uses', 'verdict']);
    expect(result).toEqual({ verdict: 'active', reason: null, uses: 3 });
  });

  it('stores the key, the product id and the check times - and none of what Gumroad sent back', async () => {
    const logs = ['log', 'info', 'warn', 'error', 'debug'].map((m) => vi.spyOn(console, m));
    const { ctl, storage } = controller({ fetchImpl: fetchMock(response(200, fullDocumentedSuccess())) });
    const result = await ctl.activate(KEY);
    expect(result.verdict).toBe('active');

    const record = stored(storage);
    expect(Object.keys(record).sort()).toEqual(['activatedAt', 'key', 'lastCheckAt', 'productId', 'status', 'v']);
    const everything = [...storage.map.values()].join('\n');
    for (const leak of ['customer@example.com', '"email"', 'full_name', 'ip_country', '"card"', 'sale_id', 'order_number', 'purchaser_id']) {
      expect(everything, leak).not.toContain(leak);
    }
    for (const spy of logs) {
      for (const call of spy.mock.calls) {
        expect(call.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')).not.toContain('email');
      }
    }
  });
});

describe('the controller, rules the page relies on', () => {
  it('refuses to send anything while the site has no product id', async () => {
    const { ctl, fetchImpl, storage, lastNote } = controller({ productId: '' });
    const result = await ctl.activate(KEY);
    expect(result.reason).toBe('no_product_id_configured');
    expect(fetchImpl.calls).toHaveLength(0);
    expect(storage.getItem(LICENSE_STORAGE_KEY)).toBeNull();
    expect(lastNote()).toBe('המיתוג עדיין לא הופעל באתר הזה.');
  });

  it('does not spend a use re-activating the key that is already active', async () => {
    const storage = memoryStorage({ [LICENSE_STORAGE_KEY]: JSON.stringify(activeRecord({ lastCheckAt: NOW - DAY })) });
    const { ctl, fetchImpl } = controller({ storage });
    ctl.load();
    const result = await ctl.activate(KEY.toLowerCase());
    expect(result.reason).toBe('already_active');
    expect(fetchImpl.calls).toHaveLength(0);
    expect(ctl.state.proActive).toBe(true);
  });

  it('a definitive no for a different key never removes the key that already works', async () => {
    const storage = memoryStorage({ [LICENSE_STORAGE_KEY]: JSON.stringify(activeRecord({ lastCheckAt: NOW - DAY })) });
    const { ctl } = controller({ storage, fetchImpl: fetchMock(response(404, NOT_FOUND_BODIES.not_found)) });
    ctl.load();
    const other = 'FFFFFFFF-FFFFFFFF-FFFFFFFF-FFFFFFFF';
    expect((await ctl.activate(other)).verdict).toBe('revoked');
    expect(ctl.state.proActive).toBe(true);
    expect(stored(storage).key).toBe(KEY);
  });

  it('an unknown answer for a different key never replaces the key that already works', async () => {
    const storage = memoryStorage({ [LICENSE_STORAGE_KEY]: JSON.stringify(activeRecord({ lastCheckAt: NOW - DAY })) });
    const { ctl } = controller({ storage, fetchImpl: fetchMock(response(503, '')) });
    ctl.load();
    expect((await ctl.activate('FFFFFFFF-FFFFFFFF-FFFFFFFF-FFFFFFFF')).verdict).toBe('unknown');
    expect(ctl.state.proActive).toBe(true);
    expect(stored(storage)).toMatchObject({ key: KEY, status: 'active' });
  });

  it('removing the licence clears it without any request', () => {
    const storage = memoryStorage({ [LICENSE_STORAGE_KEY]: JSON.stringify(activeRecord({ lastCheckAt: NOW - DAY })) });
    const { ctl, fetchImpl, lastNote } = controller({ storage });
    ctl.load();
    ctl.clear();
    expect(fetchImpl.calls).toHaveLength(0);
    expect(storage.getItem(LICENSE_STORAGE_KEY)).toBeNull();
    expect(ctl.state).toMatchObject({ proActive: false, hasRecord: false });
    expect(lastNote()).toBe('הרישיון הוסר מהדפדפן הזה.');
  });

  it('keeps a pending key and does not retry it while the browser says it is offline', () => {
    const storage = memoryStorage({ [LICENSE_STORAGE_KEY]: JSON.stringify({ v: 1, key: KEY, productId: 'NEW', status: 'pending', activatedAt: null, lastCheckAt: null, lastAttemptAt: NOW - DAY }) });
    const fetchImpl = deferredFetch();
    const { ctl } = controller({ storage, fetchImpl, online: false });
    expect(ctl.load()).toBeNull();
    expect(fetchImpl.calls).toHaveLength(0);
    expect(stored(storage).status).toBe('pending');
    expect(ctl.state).toMatchObject({ proActive: false, hasRecord: true });
  });
});
