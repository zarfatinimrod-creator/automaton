// Gumroad replaces Paddle as the Pro checkout.
//
// Why the swap: the Paddle account was never opened and its onboarding needs a
// liveness video the mandate forbids, while Gumroad is the one payment rail
// this repo holds rendered evidence for (Israel / ILS). This file and the
// licence check in license.js are the whole integration - there is no SDK, no
// overlay and no third-party script. The button is a link to the product page. That is deliberate: a link cannot
// leak the visitor to a tracker, and it let the site's CSP get smaller rather
// than larger.
//
// Gumroad mints a key per sale and prints it in the receipt; license.js
// verifies it against api.gumroad.com once and caches the result
// (research/measurements/gumroad-license-decision.md, Option C). That check
// needs the product's public id, which is why the button needs it too: a key
// the page cannot check against the product it was sold for is nothing.

/** A product URL we are willing to send a buyer to: absolute, https, nothing else. */
export function isValidProductUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') return false;
  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return false;
  }
  return parsed.protocol === 'https:';
}

export function gumroadProductUrl(cfg) {
  const url = cfg?.gumroad?.productUrl;
  return isValidProductUrl(url) ? String(url).trim() : null;
}

/**
 * Gumroad's public product id (the `product_id` the verify endpoint takes), or
 * null. Written into site.json by the product-creation job, never by hand.
 */
export function gumroadProductId(cfg) {
  const id = cfg?.gumroad?.productId;
  if (typeof id !== 'string') return null;
  const trimmed = id.trim();
  return trimmed !== '' && trimmed.length <= 128 && !/\s/.test(trimmed) ? trimmed : null;
}

/** True once there is both a product page to send the buyer to and a product id to check keys against. */
export function isProConfigured(cfg) {
  return gumroadProductUrl(cfg) !== null && gumroadProductId(cfg) !== null;
}

/**
 * The Pro button, as data. Every state the button can be in is decided here
 * rather than in the DOM glue, so the honest states are unit-testable and a
 * page cannot accidentally enable checkout.
 *
 * Two conditions must BOTH hold before we take money:
 *   1. a product URL to send the buyer to, and
 *   2. the product id, because the licence key Gumroad issues is checked
 *      against exactly that product - without it nothing can verify the key.
 *
 * @returns {{state:string, enabled:boolean, label:string, href:string|null, note:string}}
 */
export function proButtonState(cfg) {
  const raw = cfg?.gumroad?.productUrl ?? '';
  const url = gumroadProductUrl(cfg);
  const hasProductId = gumroadProductId(cfg) !== null;

  if (!url) {
    const empty = String(raw).trim() === '';
    return {
      state: empty ? 'unconfigured' : 'invalid_url',
      enabled: false,
      label: 'בקרוב',
      href: null,
      note: empty
        ? 'המיתוג עדיין לא נמכר – החנות טרם נפתחה, ואין כאן מה לקנות.'
        : 'כתובת המוצר בהגדרות אינה כתובת https תקינה, ולכן הכפתור סגור.',
    };
  }
  if (!hasProductId) {
    return {
      state: 'no_product_id',
      enabled: false,
      label: 'בקרוב',
      href: null,
      note: 'החנות מוגדרת אך עדיין אין מזהה מוצר לאימות הרישיון, ולכן אי אפשר למכור.',
    };
  }
  return {
    state: 'ready',
    enabled: true,
    label: 'שדרוג ל-Pro',
    href: url,
    note: 'התשלום מתבצע ב-Gumroad. מפתח הרישיון מגיע בקבלה במייל מ-Gumroad; הזנתו כאן נבדקת מול Gumroad פעם אחת ומפעילה את המיתוג.',
  };
}

/**
 * Open the product page. A plain navigation - no SDK, no overlay, no Gumroad
 * code in this page. (The one request to Gumroad is the licence check in
 * license.js.)
 */
export function openProCheckout(cfg, win = globalThis) {
  const state = proButtonState(cfg);
  if (!state.enabled || !state.href) throw new Error('Gumroad checkout is not configured');
  win.open(state.href, '_blank', 'noopener,noreferrer');
  return state.href;
}
