// The Pro licence: Gumroad's own per-sale key, checked against Gumroad.
//
// Decision: research/measurements/gumroad-license-decision.md (Option C).
//
// Gumroad mints a licence key for every sale and prints it in the buyer's
// receipt. The buyer pastes it here once; the browser sends it, with the public
// product id, straight to Gumroad's verify endpoint. On a yes the page keeps
// the key, the product id and the check time in localStorage - nothing else
// Gumroad returns - and Pro is then honoured offline. At most once every seven
// days, in the background, the page asks again with increment_uses_count=false.
//
// The one rule that matters most is asymmetric on purpose: ONLY a definitive
// answer changes state. Definitive means Gumroad itself said so - one of its
// three "no" bodies with HTTP 404, or HTTP 200 with success:true and a refund,
// chargeback, lost dispute or ended subscription. Everything else - no network,
// a timeout, a 429, a 5xx, a 400, a challenge page, a body that is not JSON, a
// 200 that does not say success:true - is "unknown" and leaves the cached
// record exactly as it was. A paying buyer cannot lose Pro to anything
// transient.
//
// This is still client-side gating, which a determined user can bypass by
// editing JavaScript. That is true of every static site and is not a reason to
// pretend otherwise.

export const VERIFY_URL = 'https://api.gumroad.com/v2/licenses/verify';
export const LICENSE_STORAGE_KEY = 'ilbiz.license';
export const RECHECK_INTERVAL_MS = 7 * 86_400_000;
export const VERIFY_TIMEOUT_MS = 8000;

// Gumroad's key: SecureRandom.uuid.upcase.delete("-").scan(/.{8}/).join("-")
// (app/models/license.rb:38). Anything else is never sent anywhere.
const KEY_SHAPE = /^[0-9A-F]{8}-[0-9A-F]{8}-[0-9A-F]{8}-[0-9A-F]{8}$/;

// The three bodies app/controllers/api/v2/licenses_controller.rb sends with a
// 404 from the verify action (lines 38, 86, 89). A 404 that carries none of
// them - Gumroad's generic e404_json, a proxy page - says nothing about this
// key, so it is "unknown", not "revoked".
const DEFINITIVE_NOT_FOUND = new Map([
  ['This license key has been disabled.', 'disabled'],
  ['That license does not exist for the provided product.', 'not_found'],
  ['Access to the purchase associated with this license has expired.', 'access_revoked'],
]);

const SUBSCRIPTION_END_FIELDS = ['subscription_ended_at', 'subscription_cancelled_at', 'subscription_failed_at'];

/** Hebrew notes the page shows. Kept here so the tests pin the exact words. */
export const LICENSE_NOTES = {
  not_a_license_key: 'המפתח אינו בפורמט הנכון. מפתח של Gumroad נראה כך: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX.',
  no_product_id_configured: 'המיתוג עדיין לא הופעל באתר הזה.',
  already_active: 'הרישיון כבר פעיל בדפדפן הזה.',
  active: 'הרישיון אומת. המיתוג פעיל.',
  checking: 'המפתח שמור בדפדפן הזה; בודקים אותו מול Gumroad…',
  pending: 'האימות מול Gumroad לא הושלם כרגע. המפתח נשמר בדפדפן הזה ושום דבר לא אבד: הדף ינסה שוב בעצמו בכניסה הבאה, ואפשר גם ללחוץ שוב על "הפעלה" בעוד דקה.',
  kept_other: 'לא התקבלה כרגע תשובה מ-Gumroad על המפתח החדש. הרישיון הקיים נשאר פעיל, ושום דבר לא השתנה.',
  cleared: 'הרישיון הוסר מהדפדפן הזה.',
  revoked: {
    refunded: 'התשלום על הרישיון הוחזר, ולכן המיתוג כבוי.',
    chargebacked: 'על התשלום בוצעה החזרת חיוב (chargeback), ולכן המיתוג כבוי.',
    disputed: 'נפתחה מחלוקת על החיוב, ולכן המיתוג כבוי.',
    subscription_ended: 'המנוי שקשור למפתח הסתיים, ולכן המיתוג כבוי.',
    disabled: 'המפתח בוטל ב-Gumroad, ולכן המיתוג כבוי.',
    not_found: 'Gumroad לא מכירה את המפתח הזה עבור המוצר הזה. בדקו שהעתקתם אותו במלואו מהקבלה.',
    access_revoked: 'הגישה לרכישה שקשורה למפתח הזה הסתיימה ב-Gumroad, ולכן המיתוג כבוי.',
  },
};

/** Trim and upper-case. Non-strings become ''. */
export function normalizeKey(input) {
  return typeof input === 'string' ? input.trim().toUpperCase() : '';
}

/** True only for a key in Gumroad's exact format (already normalized). */
export function isGumroadKeyShaped(key) {
  return typeof key === 'string' && KEY_SHAPE.test(key);
}

function parseBody(body) {
  if (typeof body !== 'string') return body;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

const isObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

/**
 * Decide what one answer from Gumroad means. Pure; the heart of the tests.
 * `body` may be the parsed JSON or the raw text.
 * @returns {{verdict: 'active'|'revoked'|'unknown', reason: string|null}}
 */
export function classifyVerifyResponse({ status, body } = {}) {
  const json = parseBody(body);

  if (status === 200) {
    if (!isObject(json) || json.success !== true) return { verdict: 'unknown', reason: 'unexpected_response' };
    const purchase = isObject(json.purchase) ? json.purchase : {};
    if (purchase.refunded === true) return { verdict: 'revoked', reason: 'refunded' };
    if (purchase.chargebacked === true) return { verdict: 'revoked', reason: 'chargebacked' };
    if (purchase.disputed === true && purchase.dispute_won !== true) return { verdict: 'revoked', reason: 'disputed' };
    if (SUBSCRIPTION_END_FIELDS.some((f) => purchase[f] != null)) return { verdict: 'revoked', reason: 'subscription_ended' };
    return { verdict: 'active', reason: null };
  }

  if (status === 404 && isObject(json) && json.success === false) {
    const reason = DEFINITIVE_NOT_FOUND.get(typeof json.message === 'string' ? json.message.trim() : '');
    if (reason) return { verdict: 'revoked', reason };
    return { verdict: 'unknown', reason: 'unrecognised_not_found' };
  }

  if (status === 429) return { verdict: 'unknown', reason: 'rate_limited' };
  if (typeof status === 'number' && status >= 500) return { verdict: 'unknown', reason: 'server_error' };
  return { verdict: 'unknown', reason: 'unexpected_response' };
}

function timeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms);
  if (typeof AbortController === 'undefined') return undefined;
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

/**
 * One POST to Gumroad's verify endpoint, from the buyer's browser.
 *
 * The body is URLSearchParams, so the browser sends it as
 * application/x-www-form-urlencoded - a CORS "simple" request, no preflight.
 * credentials:'omit' makes the browser ignore the anonymous session cookies
 * Gumroad sets. Only the verdict, the reason and the use count come back out;
 * the response body - which carries the buyer's own email, name and card
 * display - is dropped here and never stored or logged.
 *
 * @returns {Promise<{verdict: string, reason: string|null, uses: number|null}>}
 */
export async function verifyWithGumroad({ productId, key, increment, fetchImpl, timeoutMs = VERIFY_TIMEOUT_MS } = {}) {
  if (typeof fetchImpl !== 'function') return { verdict: 'unknown', reason: 'no_fetch', uses: null };

  const params = new URLSearchParams();
  params.set('product_id', String(productId ?? ''));
  params.set('license_key', String(key ?? ''));
  if (increment === false) params.set('increment_uses_count', 'false');

  let res;
  try {
    res = await fetchImpl(VERIFY_URL, {
      method: 'POST',
      body: params,
      credentials: 'omit',
      signal: timeoutSignal(timeoutMs),
    });
  } catch (e) {
    const timedOut = e?.name === 'AbortError' || e?.name === 'TimeoutError';
    return { verdict: 'unknown', reason: timedOut ? 'timeout' : 'network_error', uses: null };
  }

  let text;
  try {
    text = await res.text();
  } catch {
    return { verdict: 'unknown', reason: 'unreadable_body', uses: null };
  }
  const body = parseBody(text);
  const { verdict, reason } = classifyVerifyResponse({ status: res?.status, body });
  const uses = verdict === 'active' && isObject(body) && Number.isFinite(body.uses) ? body.uses : null;
  return { verdict, reason, uses };
}

// --- storage ---------------------------------------------------------------
//
// One JSON record under `ilbiz.license`:
//   { v: 1, key, productId, status: 'active'|'pending', activatedAt, lastCheckAt[, lastAttemptAt] }
// and nothing else, ever: writeLicenseRecord copies these fields by name, so
// no caller can put anything Gumroad said into the browser's storage. Any
// other value found there - the retired signed format, a half-written
// record, anything - is removed and treated as no licence.

const isTime = (x) => x === null || Number.isFinite(x);

function validRecord(r) {
  return isObject(r)
    && r.v === 1
    && isGumroadKeyShaped(r.key)
    && typeof r.productId === 'string' && r.productId.trim() !== ''
    && (r.status === 'active' || r.status === 'pending')
    && isTime(r.activatedAt ?? null)
    && isTime(r.lastCheckAt ?? null)
    && isTime(r.lastAttemptAt ?? null);
}

function pick(r) {
  const out = {
    v: 1,
    key: r.key,
    productId: r.productId,
    status: r.status,
    activatedAt: r.activatedAt ?? null,
    lastCheckAt: r.lastCheckAt ?? null,
  };
  if (Number.isFinite(r.lastAttemptAt)) out.lastAttemptAt = r.lastAttemptAt;
  return out;
}

export function clearLicenseRecord(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(LICENSE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** The stored record, or null. Anything that is not a valid record is removed. */
export function readLicenseRecord(storage = globalThis.localStorage) {
  let raw;
  try {
    raw = storage?.getItem(LICENSE_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
  if (raw === null) return null;
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (!validRecord(parsed)) {
    clearLicenseRecord(storage);
    return null;
  }
  return pick(parsed);
}

export function writeLicenseRecord(storage, record) {
  if (!validRecord(record)) return false;
  try {
    storage?.setItem(LICENSE_STORAGE_KEY, JSON.stringify(pick(record)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Is a background re-check due? Only for an active record, and only once
 * seven days have passed since the last check that got a definitive answer.
 * A stored time that is missing or lies in the future cannot be trusted, so
 * that one case re-checks rather than waiting on a clock that was wrong.
 */
export function shouldRecheck(record, now) {
  if (!record || record.status !== 'active') return false;
  const last = record.lastCheckAt;
  if (!Number.isFinite(last) || last > now) return true;
  return now - last >= RECHECK_INTERVAL_MS;
}

// --- the controller the page drives ---------------------------------------

/**
 * Everything the invoice page does with the licence, minus the DOM, so every
 * rule is unit-tested rather than trusted. The page supplies `render`, which
 * receives `{ proActive, hasRecord, note }`; `note` is undefined when the
 * note must be left as it is (a background check that learned nothing new
 * never writes anything on the page).
 *
 * The stored record changes only when:
 *   - Gumroad says yes for the key entered (it becomes the active record);
 *   - a check could not complete and no active record exists (kept as pending);
 *   - Gumroad says a definitive no about the STORED key (removed);
 *   - the buyer presses "הסרת הרישיון", or the stored value is not a record.
 */
export function createLicenseController({
  storage = globalThis.localStorage,
  fetchImpl,
  productId = () => '',
  now = () => Date.now(),
  isOnline = () => globalThis.navigator?.onLine !== false,
  render = () => {},
} = {}) {
  const state = { proActive: false, hasRecord: false };

  const emit = (note) => render({ ...state, note });
  const sync = (record) => {
    state.proActive = record?.status === 'active';
    state.hasRecord = Boolean(record);
  };
  const configuredProductId = () => {
    const id = productId();
    return typeof id === 'string' ? id.trim() : '';
  };

  async function recheck(record) {
    const result = await verifyWithGumroad({ productId: record.productId, key: record.key, increment: false, fetchImpl });
    const current = readLicenseRecord(storage);
    // The buyer may have removed or replaced the licence while the request was out.
    if (!current || current.key !== record.key || current.status !== 'active') return result;

    if (result.verdict === 'active') {
      const { lastAttemptAt, ...rest } = current;
      writeLicenseRecord(storage, { ...rest, lastCheckAt: now() });
    } else if (result.verdict === 'revoked') {
      clearLicenseRecord(storage);
      sync(null);
      emit(LICENSE_NOTES.revoked[result.reason]);
    } else {
      writeLicenseRecord(storage, { ...current, lastAttemptAt: now() });
    }
    return result;
  }

  async function attemptActivation(key, id) {
    const result = await verifyWithGumroad({ productId: id, key, increment: true, fetchImpl });
    const current = readLicenseRecord(storage);
    const t = now();

    if (result.verdict === 'active') {
      const record = { v: 1, key, productId: id, status: 'active', activatedAt: t, lastCheckAt: t };
      writeLicenseRecord(storage, record);
      sync(record);
      emit(LICENSE_NOTES.active);
    } else if (result.verdict === 'revoked') {
      // A no about THIS key removes only this key; a working licence for another key stays.
      if (current && current.key === key) {
        clearLicenseRecord(storage);
        sync(null);
      }
      emit(LICENSE_NOTES.revoked[result.reason]);
    } else if (current && current.status === 'active' && current.key !== key) {
      emit(LICENSE_NOTES.kept_other);
    } else {
      const record = { v: 1, key, productId: id, status: 'pending', activatedAt: null, lastCheckAt: null, lastAttemptAt: t };
      writeLicenseRecord(storage, record);
      sync(record);
      emit(LICENSE_NOTES.pending);
    }
    return result;
  }

  return {
    state,

    /**
     * Page load. Synchronous up to the first request: an active record turns
     * Pro on before anything goes over the network. Returns the background
     * work as a promise, or null when there is none.
     */
    load() {
      const record = readLicenseRecord(storage);
      sync(record);
      if (!record) {
        emit(undefined);
        return null;
      }
      if (record.status === 'active') {
        emit(undefined);
        if (shouldRecheck(record, now()) && isOnline()) return recheck(record);
        return null;
      }
      // pending: one attempt, exactly as if the buyer had pressed the button again.
      if (!isOnline()) {
        emit(LICENSE_NOTES.pending);
        return null;
      }
      emit(LICENSE_NOTES.checking);
      return attemptActivation(record.key, record.productId);
    },

    /** The "הפעלה" button. */
    async activate(input) {
      const key = normalizeKey(input);
      if (!isGumroadKeyShaped(key)) {
        emit(LICENSE_NOTES.not_a_license_key);
        return { verdict: 'rejected', reason: 'not_a_license_key' };
      }
      const id = configuredProductId();
      if (!id) {
        emit(LICENSE_NOTES.no_product_id_configured);
        return { verdict: 'rejected', reason: 'no_product_id_configured' };
      }
      const current = readLicenseRecord(storage);
      if (current && current.status === 'active' && current.key === key) {
        emit(LICENSE_NOTES.already_active);
        return { verdict: 'rejected', reason: 'already_active' };
      }
      emit(LICENSE_NOTES.checking);
      return attemptActivation(key, id);
    },

    /** The "הסרת הרישיון" button. No request. */
    clear() {
      clearLicenseRecord(storage);
      sync(null);
      emit(LICENSE_NOTES.cleared);
    },
  };
}
