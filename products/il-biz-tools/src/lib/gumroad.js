// Gumroad replaces Paddle as the Pro checkout.
//
// Why the swap: the Paddle account was never opened and its onboarding needs a
// liveness video the mandate forbids, while Gumroad is the one payment rail
// this repo holds rendered evidence for (Israel / ILS). So this file is the
// whole integration - there is no SDK, no overlay and no third-party script.
// The button is a link to the product page. That is deliberate: a link cannot
// leak the visitor to a tracker, and it let the site's CSP get smaller rather
// than larger.
//
// What the buyer gets is the licence key that src/lib/license.js already
// verifies offline. Gumroad delivers that key as the product's content /
// licence field - see README, where the exact mechanism is flagged as
// unverified, because no Gumroad account exists yet to render it.

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

/** True once a real product page exists to send the buyer to. */
export function isProConfigured(cfg) {
  return gumroadProductUrl(cfg) !== null;
}

/**
 * The Pro button, as data. Every state the button can be in is decided here
 * rather than in the DOM glue, so the honest states are unit-testable and a
 * page cannot accidentally enable checkout.
 *
 * Two conditions must BOTH hold before we take money:
 *   1. a product URL to send the buyer to, and
 *   2. a public key, because a licence key nothing can verify is nothing.
 *
 * @returns {{state:string, enabled:boolean, label:string, href:string|null, note:string}}
 */
export function proButtonState(cfg) {
  const raw = cfg?.gumroad?.productUrl ?? '';
  const url = gumroadProductUrl(cfg);
  const hasKey = Boolean(cfg?.pro?.publicKey);

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
  if (!hasKey) {
    return {
      state: 'no_public_key',
      enabled: false,
      label: 'בקרוב',
      href: null,
      note: 'החנות מוגדרת אך עדיין אין מפתח ציבורי לאימות הרישיון, ולכן אי אפשר למכור.',
    };
  }
  return {
    state: 'ready',
    enabled: true,
    label: 'שדרוג ל-Pro',
    href: url,
    note: 'התשלום מתבצע ב-Gumroad. מפתח הרישיון נמסר יחד עם המוצר, והזנתו כאן מפעילה את המיתוג.',
  };
}

/**
 * Open the product page. A plain navigation - no SDK, no overlay, nothing
 * loaded from Gumroad into this page.
 */
export function openProCheckout(cfg, win = globalThis) {
  const state = proButtonState(cfg);
  if (!state.enabled || !state.href) throw new Error('Gumroad checkout is not configured');
  win.open(state.href, '_blank', 'noopener,noreferrer');
  return state.href;
}
