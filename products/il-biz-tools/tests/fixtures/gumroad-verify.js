// Gumroad's own words and bytes, pinned so the classifier is tested against
// what Gumroad actually sends rather than against what we imagine it sends.
//
// Sources (antiwork/gumroad at af1ae267, read for
// research/measurements/gumroad-license-decision.md):
//   - DOCUMENTED_SUCCESS_TEXT: the "API response example" in
//     app/views/help_center/articles/contents/_76-license-keys.html.erb,
//     pasted verbatim - including the Ruby-style `# ...` comments Gumroad put
//     inside it, which is why documentedSuccess() strips them before parsing.
//   - NOT_FOUND_BODIES: the three 404 bodies of
//     app/controllers/api/v2/licenses_controller.rb lines 38, 86, 89.
//   - LIVE_2509_BODY: the body the GitHub runner actually received on 25.9
//     (research/measurements/gumroad-native-licenses.md, the CORS probe row).

export const DOCUMENTED_SUCCESS_TEXT = `{ "success": true, "uses": 3, "purchase": { "seller_id": "kL0psVL2admJSYRNs-OCMg==", "product_id": "32-nPAicqbLj8B_WswVlMw==", "product_name": "licenses demo product", "permalink": "QMGY", "product_permalink": "https://sahil.gumroad.com/l/pencil", "email": "customer@example.com", "price": 0, "gumroad_fee": 0, "currency": "usd", "quantity": 1, "discover_fee_charged": false, "can_contact": true, "referrer": "direct", "card": { "expiry_month": null, "expiry_year": null, "type": null, "visual": null }, "order_number": 524459935, "sale_id": "FO8TXN-dbxYaBdahG97Y-Q==", "sale_timestamp": "2021-01-05T19:38:56Z", "purchaser_id": "5550321502811", "subscription_id": "GDzW4_aBdQc-o7Gbjng7lw==", "variants": "", "license_key": "85DB562A-C11D4B06-A2335A6B-8C079166", "is_multiseat_license": false, "ip_country": "United States", "recurrence": "monthly", "is_gift_receiver_purchase": false, "refunded": false, "disputed": false, "dispute_won": false, "id": "FO8TXN-dvaYbBbahG97a-Q==", "created_at": "2021-01-05T19:38:56Z", "custom_fields": [], "chargebacked": false, # purchase was refunded, non-subscription product only "subscription_ended_at": null, # subscription was ended, subscription product only "subscription_cancelled_at": null, # subscription was cancelled, subscription product only "subscription_failed_at": null # we were unable to charge the subscriber's card }} `;

/** The documented payload as JSON: Gumroad's inline `# ...` comments removed, nothing else touched. */
export function documentedSuccess(overrides = {}) {
  const json = JSON.parse(DOCUMENTED_SUCCESS_TEXT.replace(/#[^"}]*/g, ''));
  return { ...json, purchase: { ...json.purchase, ...overrides } };
}

/** The same payload with the fields the ping payload adds that the help page omits (licenses_controller.rb:98). */
export function fullDocumentedSuccess(overrides = {}) {
  const base = documentedSuccess(overrides);
  return { ...base, purchase: { full_name: 'Customer Example', ...base.purchase } };
}

export const NOT_FOUND_BODIES = {
  disabled: { success: false, message: 'This license key has been disabled.' },
  not_found: { success: false, message: 'That license does not exist for the provided product.' },
  access_revoked: { success: false, message: 'Access to the purchase associated with this license has expired.' },
};

export const LIVE_2509_BODY = '{"success":false,"message":"That license does not exist for the provided product."}';

/** A minimal Response stand-in: the verifier only reads `status` and `text()`. */
export function response(status, body) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return { status, ok: status >= 200 && status < 300, text: async () => text };
}

/** A fetch mock that records every call and answers with `answer` (a response, or an Error to reject with). */
export function fetchMock(answer) {
  const calls = [];
  const impl = (url, init) => {
    calls.push({ url, init, body: String(init?.body ?? '') });
    const a = typeof answer === 'function' ? answer(url, init) : answer;
    return a instanceof Error ? Promise.reject(a) : Promise.resolve(a);
  };
  impl.calls = calls;
  return impl;
}

/** A fetch whose promise stays open until the test settles it - to observe state before the answer. */
export function deferredFetch() {
  const calls = [];
  let settle;
  const impl = (url, init) => {
    calls.push({ url, init, body: String(init?.body ?? '') });
    return new Promise((resolve, reject) => {
      settle = { resolve, reject };
    });
  };
  impl.calls = calls;
  impl.resolve = (r) => settle.resolve(r);
  impl.reject = (e) => settle.reject(e);
  return impl;
}

/** In-memory localStorage with the same surface the page uses. */
export function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    key: (i) => [...map.keys()][i] ?? null,
    get length() { return map.size; },
  };
}

function abortError() {
  const e = new Error('The operation was aborted.');
  e.name = 'AbortError';
  return e;
}

const HTML_429 = '<html><head><title>429 Too Many Requests</title></head><body>Too many requests</body></html>';
const HTML_404 = '<!DOCTYPE html><html><body><h1>The page you were looking for doesn\'t exist.</h1></body></html>';
const HTML_CHALLENGE = '<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title></head><body><div id="challenge-running">Checking your browser before accessing api.gumroad.com.</div></body></html>';

/**
 * AT-5: every answer that is not definitive. Each row is either an HTTP
 * response or a fetch rejection. None of them may ever switch Pro off.
 */
export const NON_DEFINITIVE = [
  { name: '429 with JSON', answer: () => response(429, { success: false, message: 'Rate limited' }) },
  { name: '429 with HTML', answer: () => response(429, HTML_429) },
  { name: '500', answer: () => response(500, '{"success":false,"message":"Something broke."}') },
  { name: '502', answer: () => response(502, '<html><body>Bad gateway</body></html>') },
  { name: '503', answer: () => response(503, '') },
  { name: "400 (license_key must be a string)", answer: () => response(400, { success: false, message: "The 'license_key' parameter must be a string." }) },
  { name: '404 with an HTML body', answer: () => response(404, HTML_404) },
  { name: '403 with an HTML challenge page', answer: () => response(403, HTML_CHALLENGE) },
  { name: "fetch rejects with TypeError('Failed to fetch')", answer: () => new TypeError('Failed to fetch') },
  { name: 'fetch rejects with AbortError', answer: abortError },
];
