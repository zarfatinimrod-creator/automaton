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
//
// The price is Gumroad's, never ours: the product job reads the product back
// from Gumroad and copies its `price` (minor units) and `currency` into
// site.json (scripts/gumroad-pro-product.js, writeSiteJson), refusing a product
// whose charge is not that one number, once (membership, pay-what-you-want,
// purchasing-power-parity prices, priced options). Nothing on the page types a
// number, and `enable` and the AT-16 probe (`check`) compare Gumroad's live
// price with the deployed page's. What it cannot cover: tax Gumroad adds at
// checkout for buyers in countries where it collects VAT/GST. Israel is in
// none of its lists (antiwork/gumroad lib/utilities/compliance/countries.rb,
// read 29.9.2026), so an Israeli buyer pays the price shown; a buyer abroad may
// see tax added at checkout, before paying.
import { formatILS } from './money.js';

/**
 * The one name the offer carries everywhere - the Pro box heading, the Gumroad
 * product and its activation steps - named by what the buyer gets. The product
 * job reuses a Gumroad product by exact name, so this may change only before
 * the first `create` run.
 */
export const PRO_PRODUCT_NAME = 'Pro – הלוגו וצבע המותג על המסמך';

/** The seller the buyer sees at checkout: the brand's Gumroad store (docs/OWNER_STEPS.he.md step 3). */
export const GUMROAD_STORE_NAME = 'Mehudak (מהודק)';

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

/**
 * The price Gumroad reported for the product, as { priceCents, currency }, or
 * null. Whole minor units only (7900 = ₪79) and a three-letter currency code.
 */
export function gumroadPrice(cfg) {
  const cents = cfg?.gumroad?.priceCents;
  const currency = cfg?.gumroad?.currency;
  if (!Number.isInteger(cents) || cents <= 0) return null;
  if (typeof currency !== 'string' || !/^[a-z]{3}$/i.test(currency.trim())) return null;
  return { priceCents: cents, currency: currency.trim().toLowerCase() };
}

/** "‏79 ‏₪", as the site formats every shekel amount; agorot only when there are some. Null if unformattable. */
export function formatProPrice(price) {
  if (!price || !Number.isInteger(price.priceCents) || typeof price.currency !== 'string') return null;
  const amount = price.priceCents / 100;
  const decimals = price.priceCents % 100 === 0 ? 0 : 2;
  if (price.currency === 'ils') return formatILS(amount, { decimals });
  // Intl formats any well-formed code, real or not; only a currency it knows is a price.
  const known = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('currency') : null;
  if (known && !known.includes(price.currency.toUpperCase())) return null;
  try {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: price.currency.toUpperCase(),
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return null;
  }
}

/** True once there is a product page, a product id to check keys against, and the price Gumroad reported. */
export function isProConfigured(cfg) {
  return proButtonState(cfg).state === 'ready';
}

/**
 * The Pro button, as data. Every state the button can be in is decided here
 * rather than in the DOM glue, so the honest states are unit-testable and a
 * page cannot accidentally enable checkout.
 *
 * Three conditions must ALL hold before we take money:
 *   1. a product URL to send the buyer to,
 *   2. the product id, because the licence key Gumroad issues is checked
 *      against exactly that product - without it nothing can verify the key,
 *   3. the price Gumroad read back, because the buyer sees the price before
 *      the button, and a price typed by hand could differ from the charge.
 *
 * `price` is the formatted price in the `ready` state and null in every other.
 *
 * @returns {{state:string, enabled:boolean, label:string, href:string|null, note:string, price:string|null}}
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
      price: null,
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
      price: null,
      note: 'החנות מוגדרת אך עדיין אין מזהה מוצר לאימות הרישיון, ולכן אי אפשר למכור.',
    };
  }
  const price = formatProPrice(gumroadPrice(cfg));
  if (!price) {
    return {
      state: 'no_price',
      enabled: false,
      label: 'בקרוב',
      href: null,
      price: null,
      note: 'החנות מוגדרת, אבל המחיר עוד לא נקרא מ-Gumroad, ולכן הכפתור סגור.',
    };
  }
  return {
    state: 'ready',
    enabled: true,
    label: 'לרכישה ב-Gumroad',
    href: url,
    price,
    note: `המכירה ב-Gumroad, בחנות ${GUMROAD_STORE_NAME}. מפתח הרישיון מגיע בקבלה במייל מ-Gumroad; הזנתו כאן נבדקת מול Gumroad פעם אחת ומפעילה את המיתוג.`,
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
