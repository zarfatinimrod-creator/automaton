#!/usr/bin/env node
// Create the Pro product on Gumroad - with Gumroad's own licence-key block in
// its content - and, in a second and separate run, enable it; and refund one
// buyer's sale when the brand-mail responder asks.
//
// Decision: research/measurements/gumroad-license-decision.md §4 and AT-15;
// refunds: research/channel-loop/RULING-2026-09-29-lines.md (h); the account
// name, the balance refusal and the fine print: RULING-2026-09-30-documents.md
// (b) and (d), fold action 4.
// This is agent work, run only from .github/workflows/gumroad-pro-product.yml
// (create, enable), gumroad-pro-probe.yml (check) and brand-mail.yml (refund,
// through scripts/brand_mail.py respond-refunds), with the token the owner
// already mints at step 3 and pastes at step 6 (GUMROAD_ACCESS_TOKEN). A
// dashboard-minted token carries edit_products (Gumroad's doorkeeper.rb:10,
// oauth_application.rb:121-122), so no owner action is needed here - and none
// is ever needed per sale: Gumroad mints and emails a key for every sale by itself.
//
//   node scripts/gumroad-pro-product.js create [--write-site-json] [--fine-print <file> [--apply]]
//       GET /v2/products and reuse the product by exact name if it exists;
//       otherwise POST /v2/products AS A DRAFT (draft=true: create_as_draft?
//       in links_controller.rb at af1ae267) with the price, a description of
//       exactly what Pro is (ending with the site's AI declaration), and
//       rich_content holding Hebrew activation instructions plus a `licenseKey`
//       node (RichContent::LICENSE_KEY_NODE_TYPE). Then GET /v2/products/:id and
//       require that node in what Gumroad stored, and a fixed one-time price (no
//       membership, no pay-what-you-want); and read the refund period in force
//       (GET /v2/refund_policy and the product's own block).
//       Prints the public id and short_url; --write-site-json puts both, the
//       price and currency Gumroad read back, and that refund period
//       (gumroad.refundPeriodDays, null when unreadable or not a bounded period)
//       into src/config/site.json so the workflow can open a PR with them. The
//       page shows that price and that period and no others.
//       --fine-print <file> writes the file's Hebrew text ({siteUrl} filled from
//       site.json) as the account refund policy's fine print, which Gumroad shows
//       under the policy's title on the receipt and the product page: PUT
//       /v2/refund_policy with the refund_period already in force, read back and
//       compared. A DRY RUN unless --apply. The text is checked before Gumroad is
//       asked anything (at most 3000 characters, no HTML and no "&": Gumroad
//       strips tags and re-encodes); nothing is written where a product policy of
//       its own hides the account's, or where the window in force is not 14 days
//       or more - with --apply that stops the run (exit 1, after site.json and the
//       step outputs are written, so the site.json PR still opens); a dry run only
//       says why it cannot be written yet and exits 0. The committed text is
//       docs/refund-fine-print.he.txt.
//
//   node scripts/gumroad-pro-product.js enable
//       Only when the brand mailbox (owner step 8) is probed green - the
//       repository's state/colony/brand-mail.json, or BRAND_MAIL_PROBE_FILE -
//       that probe reports the refund responder scheduled (responders includes
//       "gumroad-refund"; fails closed when the key is absent), and the offer
//       checks out (`check`, below): PUT /v2/products/:id/enable.
//       `create` is not gated: a draft reaches no buyer.
//
//   node scripts/gumroad-pro-product.js check
//       Reads only. The DEPLOYED site (<siteUrl>/src/config/site.json) carries
//       the repo's product id and price; Gumroad stores the licenseKey node and
//       charges exactly that price, once; the account's own address (GET
//       /v2/user) is BRAND_MAIL_ADDRESS, the step-8 secret, compared and never
//       printed, and its name is the brand's ("Mehudak", GUMROAD_ACCOUNT_NAME:
//       it prints on receipts), compared and never printed; the refund policy
//       buyers will see is a bounded window of at least MIN_REFUND_DAYS (14)
//       days - Gumroad opens every account with 30, and that default is kept
//       (RULING-2026-09-29-lines (h)); the deployed page's refundPeriodDays is
//       exactly that window; and that policy's fine print is the committed text
//       (docs/refund-fine-print.he.txt). Run by enable first and by
//       gumroad-pro-probe.yml after, so a price, a refund period or a fine print
//       edited in the dashboard later is caught.
//
//   node scripts/gumroad-pro-product.js refund --email <addr> [--requested-at <iso>] [--apply]
//       What the brand-mail responder calls for a refund request whose sender
//       it verified. GET /v2/sales?email=&product_id= for this product; only a
//       sale of THIS product whose buyer address is <addr>, not already refunded
//       or disputed, and inside the window in force measured at --requested-at
//       (default now, never later than now), is eligible; the most recent one is
//       refunded in full (PUT /v2/sales/:id/refund, no amount: no cancellation
//       fee). A dry run unless --apply. Idempotent: a refunded sale is never
//       touched again. Logs sale ids, never the address. Exit 0 whether or not
//       anything was eligible (the responder's one reply does not depend on it);
//       exit 1 when it cannot decide (no window in force, Gumroad unreadable, a
//       refund refused), so nothing is answered as if it were done. Exit 3
//       (BALANCE_EXIT) when Gumroad refuses the refund for balance alone ("Your
//       balance is insufficient to process this refund.", refundable.rb:100),
//       with the line "refund: balance-insufficient (sale <id>)": the responder
//       then sends its holding reply and retries that sale by id.
//
//   node scripts/gumroad-pro-product.js refund --sale <id> --requested-at <iso> [--email <addr>] [--apply]
//       The retry of one sale, by its id (GET /v2/sales/:id): the same window,
//       measured at the ORIGINAL request (so --requested-at is required), the
//       same product, the same exit codes - and the result named on its last line,
//       because the responder answers only a refund that happened:
//       "refund: refunded (sale <id>)", or "refund: already-refunded (sale <id>)"
//       for a sale Gumroad reports wholly refunded (by anyone), exit 0. Everything
//       else about the sale is a stop (exit 1: the retry is kept and the run fails,
//       so a session looks): partly refunded, charged back or disputed, another
//       product, no purchase time, or outside the window measured at the request -
//       the request was found eligible once, so a refund promised by the holding
//       reply is never dropped as "nothing to refund". --email is optional and
//       changes nothing about the refund: it adds the line "buyer: the sender" or
//       "buyer: not the sender" (whether the sale's buyer address is that one; the
//       address is never printed), so the responder answers only the sale's buyer.
//
// What is CODE-grade and what this run renders: Gumroad's own help FAQ says
// products cannot be created through the API; its code (links_controller.rb
// #create) says they can. This run's log is the evidence that settles it. If
// Gumroad refuses, the script stops, says so, and names the fallback - one
// dashboard click ("Insert -> License key") that must be raised with the owner
// BEFORE anything is sold, never added to their checklist silently. The refund
// endpoint (api/v2/sales_controller.rb#refund, read 29.9.2026) answers with the
// sale, not a refund record, and refuses a sale already refunded; it has not
// been run.
//
// The token is sent as a Bearer header, never in a URL, and never printed.
// Gumroad's responses are summarised (status, id, published, whether the
// licenseKey node is there) rather than dumped.
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PRO_PRODUCT_NAME, GUMROAD_ACCOUNT_NAME, gumroadPrice, gumroadRefundPeriodDays } from '../src/lib/gumroad.js';
import { AI_DECLARATION } from '../src/lib/ai-declaration.js';

export const API = 'https://api.gumroad.com/v2';
export const LICENSE_KEY_NODE_TYPE = 'licenseKey';
export const DEFAULT_PRICE_CENTS = 7900; // ₪79 one-time, the board's price (README "Pricing suggestion")
export const DEFAULT_CURRENCY = 'ils';
const MAX_PAGES = 50;

/**
 * The shortest refund window this job sells under: RULING-2026-09-29-lines (h). Gumroad's new-account default is
 * 30 days and is kept as it stands; 14 is the floor because it is the one option lawful under both readings of
 * the consumer-protection law the repository holds (research/colony-sweep/scouts/risk-governance--consumer-protection.md),
 * and a later dashboard change to 7 days or to none is caught by `check` as a changed price is.
 */
export const MIN_REFUND_DAYS = 14;

/** The responder id brand_mail.py probe writes once respond-refunds exists and brand-mail.yml schedules it. */
export const REFUND_RESPONDER = 'gumroad-refund';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SITE_JSON = join(root, 'src/config/site.json');
/** Where .github/workflows/brand-mail.yml commits the brand-mailbox probe (scripts/brand_mail.py probe). */
export const BRAND_MAIL_PROBE = join(root, '..', '..', 'state', 'colony', 'brand-mail.json');

export const FALLBACK = 'Fallback, per the decision: add a follow-up entry to research/measurements/gumroad-license-decision.md with this log, '
  + 'and raise the one-time dashboard click (product -> Content -> Insert -> License key) with the owner BEFORE anything is sold. '
  + 'Do not add it to docs/OWNER_STEPS.he.md silently.';

export class StopError extends Error {}

/**
 * Gumroad's refusal of a seller's refund that the unpaid balance cannot cover, word for word:
 * `errors.add :base, "Your balance is insufficient to process this refund."` (antiwork/gumroad
 * app/modules/purchase/refundable.rb:99-100 at 0656875c), answered as {"success": false, "message": ...}
 * (api/v2/sales_controller.rb:197-201 and :276-277, base_controller.rb:63-73). A new account's first refund meets it,
 * and later ones while fewer than two sales are unpaid (RULING-2026-09-30-documents (d)).
 */
export const GUMROAD_BALANCE_REFUSAL = 'Your balance is insufficient to process this refund.';

/** `refund`'s exit code for that refusal alone: the brand-mail responder sends its holding reply and retries by sale id. */
export const BALANCE_EXIT = 3;

/** A refund Gumroad refused for balance, and nothing else: the sale is known, only the money to refund it is not there yet. */
export class BalanceError extends StopError {
  constructor(message, saleId) {
    super(message);
    this.saleId = saleId;
  }
}

const isBalanceRefusal = (body) => /balance is insufficient/i.test(String(body?.message ?? ''));

/**
 * The product's fixed name - reuse is by exact name, so it must not drift between runs. It is the Pro box's
 * heading on invoice.html, named by what the buyer gets (src/lib/gumroad.js PRO_PRODUCT_NAME), and it does not
 * depend on the site's name: the store around it is the brand's.
 */
export function proProductName() {
  return PRO_PRODUCT_NAME;
}

const invoiceUrl = (site) => `${String(site?.siteUrl || '').replace(/\/$/, '')}/invoice.html`;

/** What Pro is, exactly: logo and accent colour on the printed document, on this site, one check at activation, one-time; then who builds the site. */
export function productDescription(site) {
  return [
    `<p>Pro מוסיף את הלוגו של העסק שלכם וצבע מותג למסמך המודפס (קבלה או חשבונית עסקה) במחולל הקבלות באתר ${invoiceUrl(site)} – ורק שם. זה כל מה ש-Pro מוכר.</p>`,
    '<p>כל שאר הכלים באתר – שמירת לקוחות, מספור אוטומטי, יצוא ל-PDF והמסמכים השמורים – חינמיים ונשארים חינמיים.</p>',
    '<p>תשלום חד-פעמי, בלי מנוי. מפתח הרישיון מגיע בקבלה במייל מ-Gumroad. מזינים אותו בדף מחולל הקבלות, והדפדפן בודק אותו מול Gumroad פעם אחת בהפעלה, ואחר כך לכל היותר פעם בשבוע ברקע. אחרי ההפעלה המיתוג לא צריך חיבור לאינטרנט.</p>',
    '<p>זה לא שירות AI, לא תוכנת הנהלת חשבונות ולא ייעוץ מס.</p>',
    // The sentence every site page carries (RULING-2026-09-29-lines (a)): the product page is a public brand
    // surface too. The constant itself, so it cannot drift from the footer.
    `<p>${AI_DECLARATION}</p>`,
  ].join('');
}

const text = (t) => ({ type: 'text', text: t });
const paragraph = (t) => ({ type: 'paragraph', content: [text(t)] });
const heading = (t) => ({ type: 'heading', attrs: { level: 2 }, content: [text(t)] });

/** The product's content: written Hebrew activation instructions around Gumroad's licence-key block. */
export function activationContent(site) {
  return [
    {
      title: 'הפעלת Pro',
      description: {
        type: 'doc',
        content: [
          heading('איך מפעילים את Pro'),
          paragraph('1. העתיקו את מפתח הרישיון שמופיע כאן למטה. הוא מופיע גם בקבלה שנשלחה אליכם במייל.'),
          { type: LICENSE_KEY_NODE_TYPE },
          paragraph(`2. פתחו את מחולל הקבלות: ${invoiceUrl(site)}`),
          paragraph(`3. בתיבה "${PRO_PRODUCT_NAME}" לחצו על "יש לי מפתח רישיון", הדביקו את המפתח ולחצו על "הפעלה".`),
          paragraph('4. כשמופיע "הרישיון אומת. המיתוג פעיל.", הלוגו וצבע המותג שתבחרו בתיבת ה-Pro יופיעו גם בהדפסה ובשמירה כ-PDF. הם נשמרים בדפדפן שלכם בלבד.'),
          heading('מה נשלח לאן'),
          paragraph('בהפעלה הדפדפן שלכם שולח את המפתח ואת מזהה המוצר ישירות ל-Gumroad כדי לוודא שהמפתח שולם, ואחר כך בודק שוב לכל היותר פעם בשבוע. הקבלות, רשימת הלקוחות והלוגו לא נשלחים לשום מקום. הפירוט המלא נמצא בדף עצמו, תחת "מה נשלח לאן".'),
          paragraph('ניקוי נתוני האתר בדפדפן מוחק את ההפעלה; המפתח נשאר כאן ובקבלה, ומזינים אותו שוב. אפשר להזין אותו בכל דפדפן.'),
        ],
      },
    },
  ];
}

/** Does anything Gumroad stored for this product contain a licenseKey node? */
export function hasLicenseKeyNode(product) {
  const walk = (node) => {
    if (Array.isArray(node)) return node.some(walk);
    if (!node || typeof node !== 'object') return false;
    if (node.type === LICENSE_KEY_NODE_TYPE) return true;
    return Object.values(node).some(walk);
  };
  const pages = [
    ...(Array.isArray(product?.rich_content) ? product.rich_content : []),
    ...(Array.isArray(product?.variants) ? product.variants.flatMap((c) => (c?.options ?? []).flatMap((o) => o?.rich_content ?? [])) : []),
  ];
  return pages.some((p) => walk(p?.description));
}

function summarise(product) {
  return `id=${product?.id} published=${product?.published} short_url=${product?.short_url}`;
}

async function gumroad({ fetchImpl, token, method, path, json, log }) {
  const init = { method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } };
  if (json !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(json);
  }
  let res;
  try {
    res = await fetchImpl(`${API}${path}`, init);
  } catch (e) {
    throw new StopError(`${method} ${path.split('?')[0]}: no answer from Gumroad (${e?.name ?? 'error'}).`);
  }
  let body = null;
  try { body = JSON.parse(await res.text()); } catch { body = null; }
  log(`${method} /v2${path.split('?')[0]} -> HTTP ${res.status}${body && typeof body.success === 'boolean' ? ` success=${body.success}` : ''}`);
  if (res.status === 401 || res.status === 403) {
    throw new StopError(`Gumroad refused the token (HTTP ${res.status}). The owner re-mints it at step 3 and updates the GUMROAD_ACCESS_TOKEN secret.`);
  }
  return { status: res.status, body };
}

const refusal = (what, r) => `${what} was refused live (HTTP ${r.status}${r.body?.message ? `: ${r.body.message}` : ''}).`;

export async function findProductsByName({ fetchImpl, token, name, log }) {
  const matches = [];
  let pageKey = null;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const r = await gumroad({ fetchImpl, token, method: 'GET', path: `/products${pageKey ? `?page_key=${encodeURIComponent(pageKey)}` : ''}`, log });
    if (r.status !== 200 || r.body?.success !== true || !Array.isArray(r.body.products)) {
      throw new StopError(refusal('GET /v2/products', r));
    }
    matches.push(...r.body.products.filter((p) => p?.name === name));
    pageKey = r.body.next_page_key || null;
    if (!pageKey) break;
  }
  log(`products named "${name}": ${matches.length}`);
  return matches;
}

async function readBack({ fetchImpl, token, id, log }) {
  const r = await gumroad({ fetchImpl, token, method: 'GET', path: `/products/${encodeURIComponent(id)}`, log });
  if (r.status !== 200 || r.body?.success !== true || !r.body.product) throw new StopError(refusal(`GET /v2/products/${id}`, r));
  const product = r.body.product;
  const licensed = hasLicenseKeyNode(product);
  log(`read back: ${summarise(product)} licenseKey node: ${licensed ? 'yes' : 'NO'}`);
  if (!licensed) {
    throw new StopError(`Gumroad stored product ${id} without a licenseKey node in its content, so no sale would mint a key. ${FALLBACK}`);
  }
  return product;
}

const nonEmpty = (v) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
  && !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

/**
 * The price as Gumroad stored it: `price` in minor units and `currency`, the keys Gumroad's API puts on a
 * product (antiwork/gumroad app/models/concerns/product/as_json.rb, as_json_for_api; read 28.9.2026). The page
 * shows this and only this, so a product whose real charge is not that one number, once, stops here instead of
 * reaching the page as "תשלום חד-פעמי": a membership (subscription_duration, is_tiered_membership, recurrences),
 * pay-what-you-want (customizable_price), purchasing-power-parity prices, or options that cost more or let the
 * buyer name the price (variants[].options[].price_difference / is_pay_what_you_want / their PPP prices) - every
 * field of that serializer that changes the charge (re-read 29.9.2026).
 */
export function readBackPrice(product) {
  if (product?.subscription_duration) {
    throw new StopError(`Gumroad reports this product as a subscription (${product.subscription_duration}); the page sells a one-time price. Not writing a price.`);
  }
  if (product?.is_tiered_membership === true || nonEmpty(product?.recurrences)) {
    throw new StopError('Gumroad reports this product as a tiered membership; the page sells a one-time price. Not writing a price.');
  }
  if (product?.customizable_price === true) {
    throw new StopError('Gumroad reports this product as pay-what-you-want; the page states one fixed price. Not writing a price.');
  }
  if (nonEmpty(product?.purchasing_power_parity_prices)) {
    throw new StopError('Gumroad reports purchasing-power-parity prices on this product, so buyers in some countries pay a different price than the page states. Turn PPP off for it. Not writing a price.');
  }
  const options = (Array.isArray(product?.variants) ? product.variants : []).flatMap((c) => (Array.isArray(c?.options) ? c.options : []));
  if (options.some((o) => nonEmpty(o?.purchasing_power_parity_prices))) {
    throw new StopError('Gumroad reports purchasing-power-parity prices on an option of this product; the page states one price. Not writing a price.');
  }
  if (options.some((o) => o?.is_pay_what_you_want === true || nonEmpty(o?.recurrence_prices) || ![0, null, undefined].includes(o?.price_difference))) {
    throw new StopError('An option of this product changes the charge (a price difference, pay-what-you-want or recurrence prices); the page states one price. Not writing a price.');
  }
  const priceCents = product?.price;
  const currency = typeof product?.currency === 'string' ? product.currency.trim().toLowerCase() : '';
  if (!Number.isInteger(priceCents) || priceCents <= 0) throw new StopError('Gumroad\'s read-back carries no whole price in minor units; not guessing one.');
  if (!/^[a-z]{3}$/.test(currency)) throw new StopError('Gumroad\'s read-back carries no three-letter currency; not guessing one.');
  return { priceCents, currency };
}

export function parsePrice(raw = DEFAULT_PRICE_CENTS) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 100 || n > 10_000_000) throw new StopError(`price must be a whole number of minor units (e.g. 7900 for ₪79), got "${raw}".`);
  return n;
}

export function parseCurrency(raw = DEFAULT_CURRENCY) {
  const c = String(raw).trim().toLowerCase();
  if (!/^[a-z]{3}$/.test(c)) throw new StopError(`currency must be a three-letter code such as "ils", got "${raw}".`);
  return c;
}

/**
 * Create the product as a draft, or reuse the one already there, and prove
 * Gumroad stored the licence-key block. Never publishes.
 */
export async function createOrReuse({ fetchImpl, token, site, priceCents = DEFAULT_PRICE_CENTS, currency = DEFAULT_CURRENCY, log = console.log }) {
  const name = proProductName(site);
  const price = parsePrice(priceCents);
  const priceCurrency = parseCurrency(currency);
  const existing = await findProductsByName({ fetchImpl, token, name, log });
  if (existing.length > 1) {
    throw new StopError(`${existing.length} products are named "${name}" (${existing.map((p) => p.id).join(', ')}). Reuse is by name, so this is ambiguous; delete or rename the extras first.`);
  }

  let id;
  let reused = false;
  if (existing.length === 1) {
    id = existing[0].id;
    reused = true;
    log(`reusing the existing product: ${summarise(existing[0])}`);
  } else {
    const r = await gumroad({
      fetchImpl,
      token,
      method: 'POST',
      path: '/products',
      json: {
        name,
        description: productDescription(site),
        price,
        price_currency_type: priceCurrency,
        draft: true,
        rich_content: activationContent(site),
      },
      log,
    });
    if (r.status !== 200 || r.body?.success !== true || !r.body.product?.id) {
      throw new StopError(`${refusal('POST /v2/products with rich_content', r)} ${FALLBACK}`);
    }
    id = r.body.product.id;
    log(`created as a draft: ${summarise(r.body.product)}`);
  }

  const product = await readBack({ fetchImpl, token, id, log });
  const readPrice = readBackPrice(product);
  log(`read-back price: ${readPrice.priceCents} ${readPrice.currency} (minor units)`);
  const refundPeriodDays = await readRefundPeriodDays({ fetchImpl, token, product, log });
  return { id: product.id, shortUrl: product.short_url, published: product.published === true, reused, ...readPrice, refundPeriodDays };
}

/** GET /v2/refund_policy, or undefined when Gumroad does not answer it with a policy. */
async function readAccountRefundPolicy({ fetchImpl, token, log }) {
  const r = await gumroad({ fetchImpl, token, method: 'GET', path: '/refund_policy', log });
  return r.status === 200 && r.body?.success === true ? r.body.refund_policy : undefined;
}

/**
 * The refund period in force for site.json: the days Gumroad applies (the product's own policy, or the account's
 * when the product inherits it and Gumroad reports it in effect), or null when that cannot be read or is no
 * bounded period. Written as Gumroad reports it, even under the floor: the page states Gumroad's term, and `enable`
 * refuses to sell under it.
 */
async function readRefundPeriodDays({ fetchImpl, token, product, log }) {
  const gate = refundPolicyGate(product, await readAccountRefundPolicy({ fetchImpl, token, log }));
  log(`refund period in force: ${gate.days === null ? `none written (${gate.reason})` : `${gate.days} days`}`);
  return gate.days;
}

// The brand mailbox, green. A buyer's reply to the Gumroad receipt, a refund
// request or a question goes to the email the Gumroad account was opened with.
// MISSION rule 1: the owner answers no one. So nothing is sold until that
// address is the brand mailbox of owner step 8 and the colony is reading it.
// The rules are src/revenue/brand-mail.ts's, restated here because the product
// is standalone: configured, read within PROBE_STALE_DAYS, well-formed, and no
// accessibility mail unanswered for A11Y_ANSWER_DAYS. If the probe's format ever
// changes, this check fails closed - enable refuses - rather than open. The root
// suite's src/__tests__/revenue/brand-mail-parity.test.ts feeds the same fixtures
// to both readers and fails if "green" here ever differs from "read, no blocker" there.
export const PROBE_STALE_DAYS = 2;
export const A11Y_ANSWER_DAYS = 7;
const DAY_MS = 86_400_000;
const VENUE_ID = /^[a-z0-9][a-z0-9-]{0,40}$/; // src/revenue/brand-mail.ts VENUE_ID
const isCount = (v) => Number.isInteger(v) && v >= 0;

/** @returns {{green: boolean, reason: string}} */
export function brandMailboxGreen(reading, nowMs = Date.now()) {
  const no = (reason) => ({ green: false, reason });
  if (reading === undefined || reading === null) return no('there is no probe reading (state/colony/brand-mail.json is absent)');
  if (typeof reading !== 'object' || Array.isArray(reading)) return no('the probe file is not a JSON object');
  const at = typeof reading.measuredAt === 'string' ? Date.parse(reading.measuredAt) : Number.NaN;
  if (Number.isNaN(at)) return no('the probe reading has no usable measuredAt');
  if (reading.configured !== true) return no('the probe reports the mailbox not configured (step 8 is not done)');
  for (const key of ['inbox', 'unread']) if (!isCount(reading[key])) return no(`${key} is not a count`);
  const replies = reading.repliesByVenue;
  if (typeof replies !== 'object' || replies === null || Array.isArray(replies) || !Object.values(replies).every(isCount)) return no('repliesByVenue is not a map of counts');
  if (!Object.keys(replies).every((venue) => VENUE_ID.test(venue))) return no('repliesByVenue has a key that is not a venue id');
  const a = reading.accessibility;
  if (typeof a !== 'object' || a === null) return no('accessibility is missing');
  for (const key of ['received', 'unanswered', 'unansweredOver7Days']) if (!isCount(a[key])) return no(`accessibility.${key} is not a count`);
  const oldest = a.oldestUnansweredAgeDays;
  if (!(oldest === null || (Number.isFinite(oldest) && oldest >= 0))) return no('accessibility.oldestUnansweredAgeDays is not an age');
  if (typeof reading.sentFolderFound !== 'boolean' || typeof reading.allMailFound !== 'boolean') return no('the folder flags are not booleans');
  // Optional (a probe from before RULING-2026-09-29-lines (h) has none); when present, a list of responder ids.
  const { responders } = reading;
  if (responders !== undefined && !(Array.isArray(responders) && responders.every((r) => typeof r === 'string' && VENUE_ID.test(r)))) {
    return no('responders is not a list of responder ids');
  }
  const since = Math.max(0, (nowMs - at) / DAY_MS);
  if (since > PROBE_STALE_DAYS) return no(`the probe reading is ${since.toFixed(1)} days old (probe of ${reading.measuredAt}); mail since then is unseen`);
  if (a.unansweredOver7Days > 0 || (oldest !== null && oldest + since >= A11Y_ANSWER_DAYS)) {
    return no(`accessibility mail to the brand mailbox is unanswered for ${A11Y_ANSWER_DAYS}+ days`);
  }
  return { green: true, reason: `probed ${reading.measuredAt}, ${since.toFixed(1)} days ago` };
}

/**
 * The refund period Gumroad applies to this product, as Gumroad reports it: its raw refund_period, its title and
 * where it comes from - or why it cannot be read.
 *
 * Gumroad opens every new seller account with a policy: RefundPolicy::DEFAULT_REFUND_PERIOD_IN_DAYS = 30, shown as
 * "30-day money back guarantee" (antiwork/gumroad app/models/refund_policy.rb; user.rb after_create
 * :create_refund_policy!; read 29.9.2026). A product with no policy of its own reports refund_period "inherit" and
 * shows the account's (product/as_json.rb product_refund_policy_api_json); GET /v2/refund_policy returns the
 * account's, with `in_effect` false when the account-level policy does not apply
 * (api/v2/refund_policies_controller.rb). Anything else is unread, and an unread policy is never assumed.
 */
function refundPeriodInForce(product, accountPolicy) {
  const own = product?.refund_policy;
  if (own && own.inherited === false) {
    return { period: own.refund_period, title: own.title, finePrint: own.fine_print, where: "the product's own refund policy" };
  }
  if (own && own.inherited === true && own.refund_period === 'inherit') {
    if (accountPolicy?.in_effect !== true) {
      return { unread: 'the product inherits the account refund policy, and Gumroad does not report that policy in effect, so the policy buyers see cannot be read' };
    }
    return { period: accountPolicy.refund_period, title: accountPolicy.title, finePrint: accountPolicy.fine_print, where: 'the account refund policy' };
  }
  return { unread: "Gumroad's read-back carries no readable refund_policy block for the product, so the policy buyers see cannot be read" };
}

/** "30" -> 30. Gumroad's periods are strings of whole days ("7", "14", "30", "183") or "none"; anything else is unread. */
const periodDays = (period) => (typeof period === 'string' && /^[1-9]\d{0,3}$/.test(period) ? Number(period) : null);

/**
 * The refund policy Gumroad will print on the product page, and whether we may sell under it
 * (RULING-2026-09-29-lines (h)): only a bounded window of at least MIN_REFUND_DAYS days, read, never assumed.
 * "none" (no refunds) is refused - the one term the colony cannot show is lawful toward an Israeli consumer - and
 * so is 7 days, which fails the stricter reading. `days` is the window Gumroad applies whenever it is a whole number
 * of days, accepted or not, and null otherwise; it is what site.json's refundPeriodDays must equal. `finePrint` is the
 * fine print of that same policy - what buyers read under its title on the receipt and the product page - or null.
 *
 * @returns {{ok: boolean, reason: string, days: number|null, finePrint: string|null}}
 */
export function refundPolicyGate(product, accountPolicy) {
  const inForce = refundPeriodInForce(product, accountPolicy);
  if (inForce.unread) return { ok: false, reason: inForce.unread, days: null, finePrint: null };
  const days = periodDays(inForce.period);
  const finePrint = typeof inForce.finePrint === 'string' ? inForce.finePrint : null;
  const stated = `${inForce.where} is "${inForce.title ?? inForce.period}" (refund_period ${inForce.period})`;
  if (days === null) return { ok: false, reason: `${stated}, which is no bounded window of days`, days: null, finePrint };
  if (days < MIN_REFUND_DAYS) return { ok: false, reason: `${stated}, under the ${MIN_REFUND_DAYS}-day floor`, days, finePrint };
  return { ok: true, reason: `${inForce.where}: "${inForce.title ?? `${days} days`}" (refund_period ${inForce.period})`, days, finePrint };
}

const addressOf = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');
const nameOf = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

/**
 * The Gumroad account's own address must be the brand mailbox: a buyer's receipt reply, refund request or
 * question goes there. GET /v2/user returns `email` (User#form_email) to a token with edit_products
 * (antiwork/gumroad app/models/concerns/user/as_json.rb, valid_api_scope?; base_controller.rb render_response
 * passes the token's scopes; read 29.9.2026). Compared with BRAND_MAIL_ADDRESS, the step-8 secret; neither
 * address is ever logged.
 *
 * And its `name` must be the brand's, GUMROAD_ACCOUNT_NAME: it prints on receipts, invoices and the refund email
 * (RULING-2026-09-30-documents (d), fold action 4(a)). GET /v2/user returns it (as_json.rb:9 and :13 at 0656875c).
 * Compared after trimming and folding runs of space, exactly otherwise; the name found is never logged.
 */
async function requireBrandAccount({ fetchImpl, token, brandAddress, log }) {
  const want = addressOf(brandAddress);
  if (!want) {
    throw new StopError('BRAND_MAIL_ADDRESS (the brand mailbox of owner step 8) is not set here, so the Gumroad account\'s address cannot be compared with it. Buyer mail goes to that account address; the workflow passes the step-8 secret by env.');
  }
  const r = await gumroad({ fetchImpl, token, method: 'GET', path: '/user', log });
  if (r.status !== 200 || r.body?.success !== true || !r.body.user) throw new StopError(refusal('GET /v2/user', r));
  const got = addressOf(r.body.user.email);
  if (!got) throw new StopError("Gumroad's GET /v2/user carries no email, so the account cannot be shown to be the brand mailbox (owner step 8).");
  if (got !== want) {
    throw new StopError('The Gumroad account was opened with an address that is not the brand mailbox (owner step 8), so buyer mail would reach someone the colony does not read. Neither address is printed. Step 3 item 1 opens the account with the step-8 mailbox.');
  }
  log('Gumroad account address: the brand mailbox (compared, not printed)');
  const name = nameOf(r.body.user.name);
  if (name !== GUMROAD_ACCOUNT_NAME) {
    throw new StopError(
      `The Gumroad account name is not the brand's: it must be "${GUMROAD_ACCOUNT_NAME}", and Gumroad reports `
      + `${name ? 'another name (not printed)' : 'none'}. It prints on every receipt, invoice and refund email. `
      + `Step 3 sets it once: the account's name "${GUMROAD_ACCOUNT_NAME}".`,
    );
  }
  log('Gumroad account name: the brand name (compared, not printed)');
}

const priceText = (p) => `${p.priceCents} ${p.currency}`;
const samePrice = (a, b) => a !== null && b !== null && a.priceCents === b.priceCents && a.currency === b.currency;

/**
 * Everything that must hold for the offer on the page to be the offer Gumroad sells, read without changing
 * anything: the repo's price, the DEPLOYED site's product id and price, Gumroad's stored product (licenseKey node,
 * one fixed price equal to the page's), the account's address, the refund policy buyers will see (a bounded
 * window of at least MIN_REFUND_DAYS days), and the refund period the deployed page states (exactly that window).
 * `enable` runs it before opening the sale; `check` runs it alone, afterwards (gumroad-pro-probe.yml).
 */
export async function checkOffer({ fetchImpl, token, site, brandAddress, finePrintFile = FINE_PRINT_FILE, log = console.log }) {
  const id = String(site?.gumroad?.productId ?? '').trim();
  if (!id) throw new StopError('src/config/site.json has no gumroad.productId yet. Run `create`, merge its PR, let the site deploy, then run `enable`.');
  const price = gumroadPrice(site);
  if (!price) {
    throw new StopError('src/config/site.json carries no price yet (gumroad.priceCents and gumroad.currency, written by `create --write-site-json`), so the page would show none. Run `create`, merge its PR and let the site deploy.');
  }
  const deployedUrl = `${String(site.siteUrl).replace(/\/$/, '')}/src/config/site.json`;

  let deployed;
  try {
    const res = await fetchImpl(`${deployedUrl}?check=${Date.now()}`, { headers: { Accept: 'application/json' } });
    deployed = res.status === 200 ? JSON.parse(await res.text()) : null;
    log(`GET ${deployedUrl} -> HTTP ${res.status}`);
  } catch {
    deployed = null;
  }
  const deployedId = String(deployed?.gumroad?.productId ?? '').trim();
  log(`deployed gumroad.productId: ${deployedId || '(empty)'}; repo: ${id}`);
  if (deployedId !== id) {
    throw new StopError('The deployed site does not carry this product id yet, so a buyer could not activate a key. Merge the site.json PR, wait for the deploy, and dispatch again.');
  }
  const deployedPrice = gumroadPrice(deployed);
  log(`price on the deployed page: ${deployedPrice ? priceText(deployedPrice) : '(none)'}; repo: ${priceText(price)}`);
  if (!samePrice(deployedPrice, price)) {
    throw new StopError(`The deployed site shows ${deployedPrice ? priceText(deployedPrice) : 'no price'}, not the repo's ${priceText(price)}. Wait for the deploy of the site.json PR, then dispatch again.`);
  }

  const product = await readBack({ fetchImpl, token, id, log });
  const charged = readBackPrice(product);
  log(`Gumroad charges: ${priceText(charged)} (minor units)`);
  if (!samePrice(charged, price)) {
    throw new StopError(`Gumroad now charges ${priceText(charged)} for this product, but the page shows ${priceText(price)}. Run \`create --write-site-json\` to write Gumroad's price into site.json (a PR), or set the price back in Gumroad; then dispatch again.`);
  }

  await requireBrandAccount({ fetchImpl, token, brandAddress, log });

  const r = await gumroad({ fetchImpl, token, method: 'GET', path: '/refund_policy', log });
  if (r.status !== 200 || r.body?.success !== true) throw new StopError(refusal('GET /v2/refund_policy', r));
  const refunds = refundPolicyGate(product, r.body.refund_policy);
  log(`refund policy buyers see: ${refunds.ok ? `a ${refunds.days}-day window` : 'NOT acceptable'} - ${refunds.reason}`);
  if (!refunds.ok) {
    throw new StopError(
      `The refund policy buyers would see is not a bounded refund window of at least ${MIN_REFUND_DAYS} days: ${refunds.reason}. `
      + 'RULING-2026-09-29-lines (h): keep Gumroad\'s 30-day default (or any bounded period of 14 days or more) and never "no refunds"; '
      + 'the agent restores it with PUT /v2/refund_policy and the same token - no owner step - then runs `create --write-site-json` '
      + 'so the page states the period, and dispatches again.',
    );
  }

  // The page states the window (the pricing FAQ's refund answer, filled from site.json): it must be Gumroad's.
  const deployedDays = gumroadRefundPeriodDays(deployed);
  log(`refund period on the deployed page: ${deployedDays === null ? '(none)' : `${deployedDays} days`}; Gumroad applies: ${refunds.days} days`);
  if (deployedDays !== refunds.days) {
    throw new StopError(
      `The deployed page states ${deployedDays === null ? 'no refund period' : `a ${deployedDays}-day refund period`}, but Gumroad applies `
      + `${refunds.days} days. Run \`create --write-site-json\` to write Gumroad's period into site.json (a PR), let the site deploy, then dispatch again.`,
    );
  }

  // RULING-2026-09-30-documents (b), fold action 4(c): the fine print under that policy's title - on the receipt and the
  // product page - is the committed Hebrew text, read back and compared as Gumroad stores it.
  const expected = await readFinePrint(finePrintFile, site);
  const shown = canonicalFinePrint(refunds.finePrint);
  log(`fine print buyers see: ${shown === expected ? 'the committed text' : shown ? 'NOT the committed text' : 'none'}`);
  if (shown !== expected) {
    throw new StopError(
      `The refund policy's fine print buyers see (${refunds.reason}) is ${shown ? 'not' : 'not set to'} the committed Hebrew text `
      + '(docs/refund-fine-print.he.txt: how to cancel, what the notice carries, how the refund is paid - RULING-2026-09-30-documents (b)). '
      + 'The agent writes it with `create --fine-print docs/refund-fine-print.he.txt --apply` (gumroad-pro-product.yml, write_fine_print) '
      + '- no owner step - then dispatches again. A product with a refund policy of its own does not show the account\'s fine print.',
    );
  }
  return { id, ...price, refundPeriodDays: refunds.days };
}

/**
 * Enable the product - only when the brand mailbox is probed green, the same probe reports the refund responder
 * scheduled, and the offer checks out (checkOffer): the deployed site verifies keys against this very id at the
 * price Gumroad charges, the account is the brand mailbox, and the refund window buyers see - at least
 * MIN_REFUND_DAYS days - is the one the page states.
 */
export async function enableProduct({ fetchImpl, token, site, brandMail, brandAddress, nowMs = Date.now(), log = console.log }) {
  const id = String(site?.gumroad?.productId ?? '').trim();
  if (!id) throw new StopError('src/config/site.json has no gumroad.productId yet. Run `create`, merge its PR, let the site deploy, then run `enable`.');
  const mailbox = brandMailboxGreen(brandMail, nowMs);
  log(`brand mailbox (owner step 8): ${mailbox.green ? 'green' : 'NOT green'} - ${mailbox.reason}`);
  if (!mailbox.green) {
    throw new StopError(
      `Not enabling: the brand mailbox (owner step 8) is not green - ${mailbox.reason}. A buyer's receipt reply, refund request `
      + 'or question goes to the email the Gumroad account was opened with, and until the colony reads the brand mailbox it could '
      + 'only reach the owner. Once step 8 is done, run brand-mail.yml (command probe), then dispatch `enable` again.',
    );
  }
  // RULING-2026-09-29-lines (h): a refund window on the page is honest only while something answers the requests.
  // Fails closed: a probe written before the responder existed carries no `responders`, and that is a no.
  const responders = Array.isArray(brandMail?.responders) ? brandMail.responders : [];
  const responder = responders.includes(REFUND_RESPONDER);
  log(`refund responder (${REFUND_RESPONDER}): ${responder ? 'scheduled' : 'NOT scheduled'}`);
  if (!responder) {
    throw new StopError(
      `Not enabling: the brand-mail probe reports no scheduled refund responder ("${REFUND_RESPONDER}" in responders). `
      + 'The page states a refund window, and a refund request nobody answers would reach no one. brand_mail.py probe writes it '
      + 'once its respond-refunds command exists and brand-mail.yml schedules it; re-run the probe, then dispatch `enable` again.',
    );
  }
  await checkOffer({ fetchImpl, token, site, brandAddress, log });
  const r = await gumroad({ fetchImpl, token, method: 'PUT', path: `/products/${encodeURIComponent(id)}/enable`, log });
  if (r.status !== 200 || r.body?.success !== true) throw new StopError(refusal(`PUT /v2/products/${id}/enable`, r));
  log(`enabled: ${summarise(r.body.product)}`);
  return { id, published: r.body.product?.published === true, shortUrl: r.body.product?.short_url };
}

/**
 * Put the id, the public URL, Gumroad's read-back price and the refund period in force into site.json, touching
 * nothing else. A refund period that is not a whole positive number of days is written as null (unread).
 */
export async function writeSiteJson({ productId, productUrl, priceCents, currency, refundPeriodDays = null }, path = SITE_JSON) {
  if (!/^https:\/\//.test(String(productUrl))) throw new StopError(`Gumroad returned a short_url that is not https ("${productUrl}"); not writing it.`);
  const price = readBackPrice({ price: priceCents, currency });
  const days = gumroadRefundPeriodDays({ gumroad: { refundPeriodDays } });
  const site = JSON.parse(await readFile(path, 'utf8'));
  site.gumroad = { ...site.gumroad, productUrl, productId, ...price, refundPeriodDays: days };
  await writeFile(path, `${JSON.stringify(site, null, 2)}\n`, 'utf8');
}

// ---------------------------------------------------------------- the fine print (RULING-2026-09-30-documents (b))

/**
 * The Hebrew text the refund policy's fine print carries: the ways to cancel (a reply to the Gumroad receipt, or the
 * home page's "ביטול עסקה (Pro)" link), what a cancellation notice carries (name and ID number, 14ט(ג)), and that the
 * refund is paid through Gumroad in the currency charged (14ט(ד), 14ג(ב)(3)). It names no one and no address: the
 * receipt's reply goes to the brand mailbox (step 3's Support-email setting), and the link fills its address from the
 * accessibility statement at build. `{siteUrl}` is filled from site.json. `check` refuses an offer whose fine print
 * differs from it.
 */
export const FINE_PRINT_FILE = join(root, 'docs', 'refund-fine-print.he.txt');

/** `validates :fine_print, length: { maximum: 3_000 }` (antiwork/gumroad app/models/refund_policy.rb:24 at 0656875c). */
export const FINE_PRINT_MAX = 3000;

// Gumroad's StrippedFields, which RefundPolicy applies to fine_print before saving it (refund_policy.rb:21;
// app/models/concerns/stripped_fields.rb:54-95 at 0656875c): these invisible characters are deleted, these Unicode
// spaces become a space, the ends are stripped and runs of spaces squeezed. HTML tags are stripped too, so a text with
// "<", ">" or "&" is refused here rather than altered there.
const INVISIBLE_FORMAT_CHARS = /[\u00AD\u200B\u200E\u200F\u2060\uFEFF]/g;
const UNICODE_SPACES = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;

/** A fine print as Gumroad stores it, so what was sent and what is read back compare by their words. '' for none. */
export function canonicalFinePrint(value) {
  if (typeof value !== 'string') return '';
  return value.replace(INVISIBLE_FORMAT_CHARS, '').replace(UNICODE_SPACES, ' ').trim().replace(/ {2,}/g, ' ');
}

/** The fine print to write and to compare: the file's text with {siteUrl} filled, as Gumroad would store it - or a stop. */
export function finePrintText(raw, site) {
  const siteUrl = String(site?.siteUrl ?? '').trim().replace(/\/+$/, '');
  const source = String(raw ?? '');
  if (source.includes('{siteUrl}') && !/^https:\/\//.test(siteUrl)) {
    throw new StopError('The fine print names the site, and site.json carries no https siteUrl to fill it with.');
  }
  const text = canonicalFinePrint(source.split('{siteUrl}').join(siteUrl));
  if (!text) throw new StopError('The fine print file is empty: Gumroad would clear the fine print, not write it.');
  if (/[<>]/.test(text)) {
    throw new StopError('The fine print holds "<" or ">": Gumroad strips HTML from it (refund_policy.rb:21), so buyers would not see this text.');
  }
  // strip_tags re-emits what it keeps as HTML (rails-html-sanitizer 1.6.2 in Gumroad's Gemfile.lock), so a stored "&"
  // reads back as "&amp;" and the write's read-back and `check` would never match it.
  if (text.includes('&')) {
    throw new StopError('The fine print holds "&": Gumroad\'s tag stripping stores it as "&amp;" (refund_policy.rb:21), so the text read back would never match it. Write "ו" or "and".');
  }
  if (/\{[A-Za-z]+\}/.test(text)) throw new StopError('The fine print holds a {slot} nothing fills; only {siteUrl} is filled.');
  if (text.length > FINE_PRINT_MAX) {
    throw new StopError(`The fine print is ${text.length} characters; Gumroad takes at most ${FINE_PRINT_MAX} (refund_policy.rb:24).`);
  }
  return text;
}

async function readFinePrint(path, site) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    throw new StopError(`The fine print file cannot be read (${path}).`);
  }
  return finePrintText(raw, site);
}

/**
 * Write `text` as the account refund policy's fine print: PUT /v2/refund_policy with the refund_period already in force
 * (Gumroad requires it, refund_policies_controller.rb:23, and this job never changes it) and fine_print (:36). Routes:
 * config/routes.rb:112 (`resource :refund_policy, only: [:show, :update]`, under scope "v2", :70); documented in
 * Gumroad's /api page source (ApiDocumentation/Endpoints/RefundPolicy.tsx:52-64). Read back from the answer and
 * compared. A dry run unless `apply`. Nothing is written where the account's fine print is not what this product's
 * buyers see (a product policy of its own, or the account policy not in effect, which Gumroad refuses to update
 * anyway, :22), or where the window in force is not a bounded one of MIN_REFUND_DAYS days or more: with `apply` the
 * job stops; a dry run only says why it cannot be written yet and returns 'blocked', so a `create` that asked for
 * nothing to be written never fails on it (the site.json PR must still open: a draft reaches no buyer, and `check`
 * refuses the offer until the fine print is there).
 *
 * @returns {Promise<{action: 'written'|'dry-run'|'unchanged'|'blocked'}>}
 */
export async function writeFinePrint({ fetchImpl, token, productId, text, apply = false, log = console.log }) {
  const blocked = (reason) => {
    if (apply) throw new StopError(`${reason} Nothing was written.`);
    log(`fine print: cannot be written yet: ${reason} (a dry run: nothing was asked to be written)`);
    return { action: 'blocked' };
  };
  const p = await gumroad({ fetchImpl, token, method: 'GET', path: `/products/${encodeURIComponent(productId)}`, log });
  if (p.status !== 200 || p.body?.success !== true || !p.body.product) throw new StopError(refusal(`GET /v2/products/${productId}`, p));
  if (p.body.product.refund_policy?.inherited === false) {
    return blocked('This product has a refund policy of its own, so the account fine print PUT /v2/refund_policy writes would not reach its buyers.');
  }
  const a = await gumroad({ fetchImpl, token, method: 'GET', path: '/refund_policy', log });
  if (a.status !== 200 || a.body?.success !== true || !a.body.refund_policy) throw new StopError(refusal('GET /v2/refund_policy', a));
  const account = a.body.refund_policy;
  // An account policy not in effect fails the gate as unread; Gumroad refuses to update it then anyway (:22).
  const gate = refundPolicyGate(p.body.product, account);
  if (!gate.ok) {
    return blocked(`${gate.reason}. The fine print is written beside the period in force, and a period under ${MIN_REFUND_DAYS} days or "none" is never written back.`);
  }
  if (canonicalFinePrint(account.fine_print) === text) {
    log('fine print: already the committed text; nothing to write');
    return { action: 'unchanged' };
  }
  if (!apply) {
    log(`dry run: would PUT /v2/refund_policy with refund_period "${account.refund_period}" (the period in force, unchanged) and the fine print (${text.length} characters); --apply writes it`);
    return { action: 'dry-run' };
  }
  const r = await gumroad({ fetchImpl, token, method: 'PUT', path: '/refund_policy', json: { refund_period: account.refund_period, fine_print: text }, log });
  if (r.status !== 200 || r.body?.success !== true || !r.body.refund_policy) throw new StopError(refusal('PUT /v2/refund_policy', r));
  const back = r.body.refund_policy;
  if (canonicalFinePrint(back.fine_print) !== text || back.refund_period !== account.refund_period) {
    throw new StopError('Gumroad answered the fine print write with another fine print or another refund period than was sent; check the policy before anything is sold.');
  }
  log(`fine print written and read back: the committed text, beside refund_period "${back.refund_period}"`);
  return { action: 'written' };
}

// ---------------------------------------------------------------- refund (RULING-2026-09-29-lines (h))

/** One plain address and nothing else: what the responder hands over after verifying the sender. */
const PLAIN_ADDRESS = /^[^@\s<>"(),;:]+@[^@\s<>"(),;:]+\.[^@\s<>"(),;:]+$/;

/** A sale Gumroad already settled one way or another: refunded (wholly or partly), charged back, or disputed. */
const settled = (sale) => sale.refunded === true || sale.partially_refunded === true || sale.chargedback === true || sale.disputed === true;
const createdAt = (sale) => (typeof sale.created_at === 'string' ? Date.parse(sale.created_at) : Number.NaN);

/** Every sale of this product Gumroad lists for this address (GET /v2/sales filters on the purchase email). */
async function salesTo({ fetchImpl, token, productId, address, log }) {
  const sales = [];
  let pageKey = null;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const q = new URLSearchParams({ email: address, product_id: productId });
    if (pageKey) q.set('page_key', pageKey);
    // The address goes to Gumroad in the query; gumroad() logs the path without it.
    const r = await gumroad({ fetchImpl, token, method: 'GET', path: `/sales?${q}`, log });
    if (r.status !== 200 || r.body?.success !== true || !Array.isArray(r.body.sales)) {
      throw new StopError(`GET /v2/sales was refused live (HTTP ${r.status}); nothing was refunded.`);
    }
    sales.push(...r.body.sales.filter((x) => x && typeof x === 'object'));
    pageKey = r.body.next_page_key || null;
    if (!pageKey) break;
  }
  return sales;
}

/** Inside the window: bought no later than the request, and asked within `days` of the purchase. */
const insideWindow = (sale, asked, days) => {
  const t = createdAt(sale);
  return Number.isFinite(t) && t <= asked && asked - t <= days * DAY_MS;
};

/** The refund window in force now (refundPolicyGate, MIN_REFUND_DAYS at least), or a stop. */
async function windowInForce({ fetchImpl, token, productId, say, stop, left }) {
  const p = await gumroad({ fetchImpl, token, method: 'GET', path: `/products/${encodeURIComponent(productId)}`, log: say });
  if (p.status !== 200 || p.body?.success !== true || !p.body.product) throw stop(refusal(`GET /v2/products/${productId}`, p));
  const window = refundPolicyGate(p.body.product, await readAccountRefundPolicy({ fetchImpl, token, log: say }));
  if (!window.ok) {
    throw stop(`No refund window of at least ${MIN_REFUND_DAYS} days is in force (${window.reason}); nothing was refunded, and ${left}.`);
  }
  return window;
}

/**
 * PUT /v2/sales/:id/refund, no amount (a full refund, no cancellation fee). Gumroad's balance refusal
 * (GUMROAD_BALANCE_REFUSAL) is a BalanceError carrying the sale id; any other refusal is a plain stop.
 */
async function putRefund({ fetchImpl, token, sale, say, stop, left }) {
  const id = String(sale.id);
  const r = await gumroad({ fetchImpl, token, method: 'PUT', path: `/sales/${encodeURIComponent(id)}/refund`, log: say });
  if (r.status !== 200 || r.body?.success !== true) {
    if (isBalanceRefusal(r.body)) {
      throw new BalanceError(
        `Gumroad refused the refund of sale ${id} for balance ("${GUMROAD_BALANCE_REFUSAL}", refundable.rb:99-100): the unpaid `
        + `balance does not cover it yet. Sale ${id} is not refunded; it is retried by sale id (refund --sale) until Gumroad permits it.`,
        id,
      );
    }
    throw stop(`${refusal(`PUT /v2/sales/${id}/refund`, r)} Sale ${id} is not refunded; ${left}.`);
  }
  say(`refunded sale ${id} in full; refund id: none returned - Gumroad's refund endpoint answers with the sale `
    + `(refunded=${r.body.sale?.refunded === true}), not a refund record (api/v2/sales_controller.rb#refund, read 29.9.2026)`);
  return { action: 'refunded', saleId: id };
}

/** Re-throw a stop with its message redacted, keeping a balance refusal a BalanceError. */
function redactedStop(e, redact) {
  if (e instanceof BalanceError) return new BalanceError(redact(e.message), e.saleId);
  if (e instanceof StopError) return new StopError(redact(e.message));
  return e;
}

/**
 * Refund the buyer's sale of THIS product, once, inside the window Gumroad applies - or say there is none.
 *
 * `email` is the sender the brand-mail responder verified (DKIM or SPF pass for the From domain); only a sale whose
 * purchase address (or buyer-account address) is exactly that one counts, and only a sale of site.json's product id,
 * whatever else Gumroad's filter returns. The window is the one in force now (refundPolicyGate, 14 days at least)
 * measured at `requestedAtMs` - when the buyer asked, never later than now - so a request made on day 29 and read on
 * day 31 is still inside. One request refunds at most one sale, the most recent eligible one, in full (no amount:
 * no cancellation fee). A sale already refunded, charged back or disputed is never touched, so a second request does
 * nothing. A dry run unless `apply`. Gumroad's balance refusal throws a BalanceError with the sale's id
 * (RULING-2026-09-30-documents (d)): the responder then retries that sale by id (refundSaleById).
 *
 * The address is never logged or thrown: lines carry sale ids and counts only, and every line and message passes
 * through a redaction of the address first, in case Gumroad ever echoes it.
 *
 * @returns {Promise<{action: 'refunded'|'dry-run'|'none', saleId?: string}>}
 */
export async function refundSale({ fetchImpl, token, site, email, requestedAtMs, nowMs = Date.now(), apply = false, log = console.log }) {
  const productId = String(site?.gumroad?.productId ?? '').trim();
  if (!productId) throw new StopError('src/config/site.json has no gumroad.productId: there is no product to refund.');
  const address = addressOf(email);
  if (!PLAIN_ADDRESS.test(address)) throw new StopError('refund needs --email with one plain address (not printed here).');
  const asWritten = new RegExp(address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const redact = (text) => String(text).replace(asWritten, '[address]');
  const say = (line) => log(redact(line));
  const stop = (message) => new StopError(redact(message));
  const asked = Math.min(Number.isFinite(requestedAtMs) ? requestedAtMs : nowMs, nowMs);
  const left = 'the request is left for the next run';

  try {
    const window = await windowInForce({ fetchImpl, token, productId, say, stop, left });
    say(`refund window in force: ${window.days} days, measured at the request (${new Date(asked).toISOString()})`);

    const mine = (await salesTo({ fetchImpl, token, productId, address, log: say }))
      .filter((x) => String(x.product_id ?? '') === productId && [x.purchase_email, x.email].some((a) => addressOf(a) === address));
    const open = mine.filter((x) => !settled(x));
    const eligible = open.filter((x) => insideWindow(x, asked, window.days)).sort((a, b) => createdAt(b) - createdAt(a));
    say(`sales of this product to the requesting address: ${mine.length} (already refunded or disputed: ${mine.length - open.length}; `
      + `outside the ${window.days}-day window: ${open.length - eligible.length}; eligible: ${eligible.length})`);
    if (!eligible.length) {
      say('nothing to refund');
      return { action: 'none' };
    }
    const sale = eligible[0];
    if (!apply) {
      say(`dry run: would refund sale ${sale.id} in full (nothing was sent; --apply refunds)`);
      return { action: 'dry-run', saleId: String(sale.id) };
    }
    return await putRefund({ fetchImpl, token, sale, say, stop, left });
  } catch (e) {
    throw redactedStop(e, redact);
  }
}

/** A Gumroad sale id as the API prints it (e.g. "A-m3CDDC5dlrSdKZp0RFhA=="): nothing that could walk another path. */
const SALE_ID = /^[A-Za-z0-9_=+-]{1,128}$/;
/** Anything shaped like an address, whoever's it is: the sale read by id carries the buyer's. */
const ANY_ADDRESS = /[^\s@<>"'(),;:]+@[^\s@<>"'(),;:]+/g;

/**
 * Retry one sale by its id (RULING-2026-09-30-documents (d), fold action 4(b)): what the brand-mail responder runs,
 * every run, for a refund Gumroad refused for balance. The same rules as refundSale - a sale of THIS product only,
 * inside the window in force measured at `requestedAtMs` (the ORIGINAL request, required: the retry must not shrink the
 * window), in full, a dry run unless `apply`, a BalanceError while the balance still does not cover it. The sale id
 * came from refundSale's own balance refusal for a verified sender, so no address is needed to find it; GET
 * /v2/sales/:id reads it (api/v2/sales_controller.rb:125-128). Nothing shaped like an address is logged or thrown.
 *
 * Unlike refundSale, whose one reply never depends on what it found, a retry answers a buyer who was told the refund
 * "will be issued", so its result is never a quiet "none": a sale Gumroad reports wholly refunded (by anyone) is
 * 'already-refunded' - the promise was kept - and anything else that stops the refund is a StopError (the responder
 * keeps the retry and fails the run, so a session looks): partly refunded, charged back or disputed, another product,
 * no purchase time, or outside the window as it now stands. `email`, when given, is only compared: the line
 * "buyer: the sender" / "buyer: not the sender" says whether it is the sale's buyer address, so the responder answers
 * no one but the buyer; it changes nothing about the refund.
 *
 * @returns {Promise<{action: 'refunded'|'already-refunded'|'dry-run', saleId: string}>}
 */
export async function refundSaleById({ fetchImpl, token, site, saleId, requestedAtMs, email, nowMs = Date.now(), apply = false, log = console.log }) {
  const productId = String(site?.gumroad?.productId ?? '').trim();
  if (!productId) throw new StopError('src/config/site.json has no gumroad.productId: there is no product to refund.');
  const id = String(saleId ?? '').trim();
  if (!SALE_ID.test(id)) throw new StopError('refund --sale needs a Gumroad sale id (letters, numerals, "-", "_", "=", "+").');
  if (!Number.isFinite(requestedAtMs)) throw new StopError('refund --sale needs --requested-at, the original request: the window is measured there.');
  const sender = email === undefined ? null : addressOf(email);
  if (sender !== null && !PLAIN_ADDRESS.test(sender)) throw new StopError('refund --sale --email needs one plain address (not printed here).');
  const redact = (text) => String(text).replace(ANY_ADDRESS, '[address]');
  const say = (line) => log(redact(line));
  const stop = (message) => new StopError(redact(message));
  const asked = Math.min(requestedAtMs, nowMs);
  const left = 'the retry is kept for the next run';

  try {
    const window = await windowInForce({ fetchImpl, token, productId, say, stop, left });
    say(`refund window in force: ${window.days} days, measured at the original request (${new Date(asked).toISOString()})`);
    const s = await gumroad({ fetchImpl, token, method: 'GET', path: `/sales/${encodeURIComponent(id)}`, log: say });
    const sale = s.body?.sale;
    if (s.status !== 200 || s.body?.success !== true || !sale || typeof sale !== 'object') {
      throw stop(`GET /v2/sales/${id} was refused live (HTTP ${s.status}); nothing was refunded, and ${left}.`);
    }
    if (String(sale.product_id ?? '') !== productId) {
      throw stop(`Sale ${id} is not a sale of this product (site.json's gumroad.productId); nothing was refunded, and ${left}.`);
    }
    if (sender !== null) {
      say(`buyer: ${[sale.purchase_email, sale.email].some((a) => addressOf(a) === sender) ? 'the sender' : 'not the sender'}`);
    }
    if (sale.refunded === true) {
      say(`sale ${id} is already refunded in full: nothing more to refund`);
      return { action: 'already-refunded', saleId: id };
    }
    if (settled(sale)) {
      throw stop(`Sale ${id} is partly refunded, charged back or disputed, so it is not refunded here; ${left}, and a session decides.`);
    }
    if (!Number.isFinite(createdAt(sale))) {
      throw stop(`Sale ${id} carries no purchase time, so the window cannot be measured; nothing was refunded, and ${left}.`);
    }
    if (!insideWindow(sale, asked, window.days)) {
      throw stop(
        `Sale ${id} is outside the ${window.days}-day window in force now, measured at the original request, though the request `
        + `was found inside the window when it was made (the window shrank?); nothing was refunded, and ${left}, and a session decides.`,
      );
    }
    if (!apply) {
      say(`dry run: would refund sale ${id} in full (nothing was sent; --apply refunds)`);
      return { action: 'dry-run', saleId: id };
    }
    return await putRefund({ fetchImpl, token, sale: { ...sale, id }, say, stop, left });
  } catch (e) {
    throw redactedStop(e, redact);
  }
}

/**
 * `refund`'s flags: --email <addr> or --sale <id> (with --sale, --requested-at <iso> is required and --email is only the
 * buyer check); --requested-at <iso>; --apply. Null on anything else.
 */
function refundFlags(flags) {
  const out = { email: undefined, sale: undefined, requestedAt: undefined, apply: false };
  const named = { '--email': 'email', '--sale': 'sale', '--requested-at': 'requestedAt' };
  for (let i = 0; i < flags.length; i += 1) {
    const flag = flags[i];
    if (flag === '--apply') out.apply = true;
    else if (Object.prototype.hasOwnProperty.call(named, flag)) {
      const value = flags[i + 1];
      if (value === undefined || value.startsWith('--') || out[named[flag]] !== undefined) return null;
      out[named[flag]] = value;
      i += 1;
    } else return null;
  }
  if (out.email === undefined && out.sale === undefined) return null;
  if (out.sale !== undefined && out.requestedAt === undefined) return null;
  return out;
}

/** `create`'s flags: --write-site-json, --fine-print <file>, and --apply (which writes the fine print; only with it). */
function createFlags(flags) {
  const out = { writeSiteJson: false, finePrint: undefined, apply: false };
  for (let i = 0; i < flags.length; i += 1) {
    const flag = flags[i];
    if (flag === '--write-site-json') out.writeSiteJson = true;
    else if (flag === '--apply') out.apply = true;
    else if (flag === '--fine-print') {
      const value = flags[i + 1];
      if (value === undefined || value.startsWith('--') || out.finePrint !== undefined) return null;
      out.finePrint = value;
      i += 1;
    } else return null;
  }
  if (out.apply && out.finePrint === undefined) return null;
  return out;
}

/** The probe file, parsed; undefined when it does not exist; the raw text when it is not JSON. */
async function readProbe(path) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    return undefined;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export const NO_TOKEN_NOTICE = 'Not calling Gumroad: repository secret GUMROAD_ACCESS_TOKEN is not set yet. This is not a failure. '
  + 'The owner mints it once at docs/OWNER_STEPS.he.md step 3 and pastes it at step 6; that same token is what creates the Pro product here. '
  + 'Until then Pro stays on "בקרוב" and nothing can be bought.';

const USAGE = 'Usage: node scripts/gumroad-pro-product.js <create [--write-site-json] [--fine-print <file> [--apply]] | enable | check '
  + '| refund --email <addr> [--requested-at <iso>] [--apply] | refund --sale <id> --requested-at <iso> [--email <addr>] [--apply]>';

export async function main(argv = process.argv.slice(2), env = process.env, { fetchImpl = globalThis.fetch, log = console.log, sitePath = SITE_JSON } = {}) {
  const [command, ...flags] = argv;
  if (!['create', 'enable', 'check', 'refund'].includes(command)) {
    log(USAGE);
    return 2;
  }
  const refundArgs = command === 'refund' ? refundFlags(flags) : null;
  const createArgs = command === 'create' ? createFlags(flags) : null;
  if ((command === 'refund' && !refundArgs) || (command === 'create' && !createArgs)) {
    log(USAGE);
    return 2;
  }
  const token = String(env.GUMROAD_ACCESS_TOKEN ?? '').trim();
  if (!token && command === 'refund') {
    // Not a success: the responder answers only after a refund decision, and none was made.
    log('STOPPED: GUMROAD_ACCESS_TOKEN is not set, so no sale can be read or refunded. Nothing was refunded.');
    return 1;
  }
  if (!token) {
    log(NO_TOKEN_NOTICE);
    if (env.GITHUB_STEP_SUMMARY) await appendFile(env.GITHUB_STEP_SUMMARY, `${NO_TOKEN_NOTICE}\n`);
    return 0;
  }

  const site = JSON.parse(await readFile(sitePath, 'utf8'));
  try {
    if (command === 'create') {
      // The fine print is read and checked before Gumroad is asked anything: a text Gumroad would change stops here.
      const finePrint = createArgs.finePrint === undefined ? null : await readFinePrint(resolve(createArgs.finePrint), site);
      const out = await createOrReuse({ fetchImpl, token, site, priceCents: env.PRICE_CENTS || DEFAULT_PRICE_CENTS, currency: env.CURRENCY || DEFAULT_CURRENCY, log });
      log(`product_id=${out.id}`);
      log(`short_url=${out.shortUrl}`);
      log(`published=${out.published} (a new product stays a draft until \`enable\`)`);
      if (createArgs.writeSiteJson) {
        await writeSiteJson({ productId: out.id, productUrl: out.shortUrl, priceCents: out.priceCents, currency: out.currency, refundPeriodDays: out.refundPeriodDays }, sitePath);
        log('wrote gumroad.productId, gumroad.productUrl, gumroad.priceCents, gumroad.currency and gumroad.refundPeriodDays into src/config/site.json');
      }
      if (env.GITHUB_OUTPUT) await appendFile(env.GITHUB_OUTPUT, `product_id=${out.id}\nshort_url=${out.shortUrl}\n`);
      if (finePrint !== null) {
        const written = await writeFinePrint({ fetchImpl, token, productId: out.id, text: finePrint, apply: createArgs.apply, log });
        log(`fine print: ${written.action}`);
      }
    } else if (command === 'refund') {
      const requestedAtMs = refundArgs.requestedAt === undefined ? undefined : Date.parse(refundArgs.requestedAt);
      if (Number.isNaN(requestedAtMs)) throw new StopError('--requested-at is not a date (ISO 8601, e.g. 2026-10-20T12:00:00Z).');
      const out = refundArgs.sale !== undefined
        ? await refundSaleById({ fetchImpl, token, site, saleId: refundArgs.sale, requestedAtMs, email: refundArgs.email, apply: refundArgs.apply, log })
        : await refundSale({ fetchImpl, token, site, email: refundArgs.email, requestedAtMs, apply: refundArgs.apply, log });
      log(`refund: ${out.action}${out.saleId ? ` (sale ${out.saleId})` : ''}${refundArgs.apply ? '' : ' - dry run'}`);
    } else if (command === 'enable') {
      const brandMail = await readProbe(env.BRAND_MAIL_PROBE_FILE || BRAND_MAIL_PROBE);
      const out = await enableProduct({ fetchImpl, token, site, brandMail, brandAddress: env.BRAND_MAIL_ADDRESS, log });
      log(`published=${out.published}`);
    } else if (!String(site?.gumroad?.productId ?? '').trim()) {
      log('Nothing to check yet: src/config/site.json has no gumroad.productId (written by `create --write-site-json`). This is not a failure.');
    } else {
      const out = await checkOffer({ fetchImpl, token, site, brandAddress: env.BRAND_MAIL_ADDRESS, log });
      log(`the offer checks out: product ${out.id} at ${out.priceCents} ${out.currency} with a ${out.refundPeriodDays}-day refund window, as the page shows`);
    }
    return 0;
  } catch (e) {
    if (e instanceof BalanceError) {
      // Its own exit code and its own line, which scripts/brand_mail.py reads for the sale id (never an address).
      log(`STOPPED: ${e.message}`);
      log(`refund: balance-insufficient (sale ${e.saleId})`);
      return BALANCE_EXIT;
    }
    if (e instanceof StopError) {
      log(`STOPPED: ${e.message}`);
      return 1;
    }
    throw e;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main();
}
