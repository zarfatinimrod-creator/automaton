#!/usr/bin/env node
// Create the Pro product on Gumroad - with Gumroad's own licence-key block in
// its content - and, in a second and separate run, enable it.
//
// Decision: research/measurements/gumroad-license-decision.md §4 and AT-15.
// This is agent work, run only from .github/workflows/gumroad-pro-product.yml
// with the token the owner already mints at step 3 and pastes at step 6
// (GUMROAD_ACCESS_TOKEN). A dashboard-minted token carries edit_products
// (Gumroad's doorkeeper.rb:10, oauth_application.rb:121-122), so no owner
// action is needed here - and none is ever needed per sale: Gumroad mints and
// emails a key for every sale by itself.
//
//   node scripts/gumroad-pro-product.js create [--write-site-json]
//       GET /v2/products and reuse the product by exact name if it exists;
//       otherwise POST /v2/products AS A DRAFT (draft=true: create_as_draft?
//       in links_controller.rb at af1ae267) with the price, a description of
//       exactly what Pro is, and rich_content holding Hebrew activation
//       instructions plus a `licenseKey` node (RichContent::LICENSE_KEY_NODE_TYPE).
//       Then GET /v2/products/:id and require that node in what Gumroad stored,
//       and a fixed one-time price (no membership, no pay-what-you-want).
//       Prints the public id and short_url; --write-site-json puts both, and the
//       price and currency Gumroad read back, into src/config/site.json so the
//       workflow can open a PR with them. The page shows that price and no other.
//
//   node scripts/gumroad-pro-product.js enable
//       Only when the brand mailbox (owner step 8) is probed green - the
//       repository's state/colony/brand-mail.json, or BRAND_MAIL_PROBE_FILE -
//       and the DEPLOYED site (<siteUrl>/src/config/site.json) carries the same
//       product id as the repo: PUT /v2/products/:id/enable. `create` is not
//       gated: a draft reaches no buyer.
//
// What is CODE-grade and what this run renders: Gumroad's own help FAQ says
// products cannot be created through the API; its code (links_controller.rb
// #create) says they can. This run's log is the evidence that settles it. If
// Gumroad refuses, the script stops, says so, and names the fallback - one
// dashboard click ("Insert -> License key") that must be raised with the owner
// BEFORE anything is sold, never added to his checklist silently.
//
// The token is sent as a Bearer header, never in a URL, and never printed.
// Gumroad's responses are summarised (status, id, published, whether the
// licenseKey node is there) rather than dumped.
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PRO_PRODUCT_NAME } from '../src/lib/gumroad.js';

export const API = 'https://api.gumroad.com/v2';
export const LICENSE_KEY_NODE_TYPE = 'licenseKey';
export const DEFAULT_PRICE_CENTS = 7900; // ₪79 one-time, the board's price (README "Pricing suggestion")
export const DEFAULT_CURRENCY = 'ils';
const MAX_PAGES = 50;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SITE_JSON = join(root, 'src/config/site.json');
/** Where .github/workflows/brand-mail.yml commits the brand-mailbox probe (scripts/brand_mail.py probe). */
export const BRAND_MAIL_PROBE = join(root, '..', '..', 'state', 'colony', 'brand-mail.json');

export const FALLBACK = 'Fallback, per the decision: add a follow-up entry to research/measurements/gumroad-license-decision.md with this log, '
  + 'and raise the one-time dashboard click (product -> Content -> Insert -> License key) with the owner BEFORE anything is sold. '
  + 'Do not add it to docs/OWNER_STEPS.he.md silently.';

export class StopError extends Error {}

/**
 * The product's fixed name - reuse is by exact name, so it must not drift between runs. It is the Pro box's
 * heading on invoice.html, named by what the buyer gets (src/lib/gumroad.js PRO_PRODUCT_NAME), and it does not
 * depend on the site's name: the store around it is the brand's.
 */
export function proProductName() {
  return PRO_PRODUCT_NAME;
}

const invoiceUrl = (site) => `${String(site?.siteUrl || '').replace(/\/$/, '')}/invoice.html`;

/** What Pro is, exactly: logo and accent colour on the printed document, on this site, one check at activation, one-time. */
export function productDescription(site) {
  return [
    `<p>Pro מוסיף את הלוגו של העסק שלכם וצבע מותג למסמך המודפס (קבלה או חשבונית עסקה) במחולל הקבלות באתר ${invoiceUrl(site)} – ורק שם. זה כל מה ש-Pro מוכר.</p>`,
    '<p>כל שאר הכלים באתר – שמירת לקוחות, מספור אוטומטי, יצוא ל-PDF והמסמכים השמורים – חינמיים ונשארים חינמיים.</p>',
    '<p>תשלום חד-פעמי, בלי מנוי. מפתח הרישיון מגיע בקבלה במייל מ-Gumroad. מזינים אותו בדף מחולל הקבלות, והדפדפן בודק אותו מול Gumroad פעם אחת בהפעלה, ואחר כך לכל היותר פעם בשבוע ברקע. אחרי ההפעלה המיתוג לא צריך חיבור לאינטרנט.</p>',
    '<p>זה לא שירות AI, לא תוכנת הנהלת חשבונות ולא ייעוץ מס.</p>',
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
          paragraph('4. כשמופיע "הרישיון אומת. המיתוג פעיל." נפתחים שדות הלוגו וצבע המותג. הם נשמרים בדפדפן שלכם בלבד, והמסמך המודפס נושא אותם.'),
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

/**
 * The price as Gumroad stored it: `price` in minor units and `currency`, the keys Gumroad's API puts on a
 * product (antiwork/gumroad app/models/concerns/product/as_json.rb, as_json_for_api; read 28.9.2026). The page
 * shows this and only this, so a membership or a pay-what-you-want product - whose real charge is not one fixed
 * number, once - stops here instead of reaching the page as "תשלום חד-פעמי".
 */
export function readBackPrice(product) {
  if (product?.subscription_duration) {
    throw new StopError(`Gumroad reports this product as a subscription (${product.subscription_duration}); the page sells a one-time price. Not writing a price.`);
  }
  if (product?.customizable_price === true) {
    throw new StopError('Gumroad reports this product as pay-what-you-want; the page states one fixed price. Not writing a price.');
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
  return { id: product.id, shortUrl: product.short_url, published: product.published === true, reused, ...readPrice };
}

// The brand mailbox, green. A buyer's reply to the Gumroad receipt, a refund
// request or a question goes to the email the Gumroad account was opened with.
// MISSION rule 1: the owner answers no one. So nothing is sold until that
// address is the brand mailbox of owner step 8 and the colony is reading it.
// The rules are src/revenue/brand-mail.ts's, restated here because the product
// is standalone: configured, read within PROBE_STALE_DAYS, well-formed, and no
// accessibility mail unanswered for A11Y_ANSWER_DAYS. If the probe's format ever
// changes, this check fails closed - enable refuses - rather than open.
export const PROBE_STALE_DAYS = 2;
export const A11Y_ANSWER_DAYS = 7;
const DAY_MS = 86_400_000;
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
  const a = reading.accessibility;
  if (typeof a !== 'object' || a === null) return no('accessibility is missing');
  for (const key of ['received', 'unanswered', 'unansweredOver7Days']) if (!isCount(a[key])) return no(`accessibility.${key} is not a count`);
  const oldest = a.oldestUnansweredAgeDays;
  if (!(oldest === null || (Number.isFinite(oldest) && oldest >= 0))) return no('accessibility.oldestUnansweredAgeDays is not an age');
  if (typeof reading.sentFolderFound !== 'boolean' || typeof reading.allMailFound !== 'boolean') return no('the folder flags are not booleans');
  const since = Math.max(0, (nowMs - at) / DAY_MS);
  if (since > PROBE_STALE_DAYS) return no(`the probe reading is ${since.toFixed(1)} days old (probe of ${reading.measuredAt}); mail since then is unseen`);
  if (a.unansweredOver7Days > 0 || (oldest !== null && oldest + since >= A11Y_ANSWER_DAYS)) {
    return no(`accessibility mail to the brand mailbox is unanswered for ${A11Y_ANSWER_DAYS}+ days`);
  }
  return { green: true, reason: `probed ${reading.measuredAt}, ${since.toFixed(1)} days ago` };
}

/**
 * Enable the product - only when the brand mailbox is probed green, and the
 * deployed site already verifies keys against this very id.
 */
export async function enableProduct({ fetchImpl, token, site, brandMail, nowMs = Date.now(), log = console.log }) {
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
    throw new StopError('The deployed site does not carry this product id yet, so a buyer could not activate a key. Not enabling. Merge the site.json PR, wait for the deploy, and dispatch `enable` again.');
  }

  await readBack({ fetchImpl, token, id, log });
  const r = await gumroad({ fetchImpl, token, method: 'PUT', path: `/products/${encodeURIComponent(id)}/enable`, log });
  if (r.status !== 200 || r.body?.success !== true) throw new StopError(refusal(`PUT /v2/products/${id}/enable`, r));
  log(`enabled: ${summarise(r.body.product)}`);
  return { id, published: r.body.product?.published === true, shortUrl: r.body.product?.short_url };
}

/** Put the id, the public URL and Gumroad's read-back price into site.json, touching nothing else. */
export async function writeSiteJson({ productId, productUrl, priceCents, currency }, path = SITE_JSON) {
  if (!/^https:\/\//.test(String(productUrl))) throw new StopError(`Gumroad returned a short_url that is not https ("${productUrl}"); not writing it.`);
  const price = readBackPrice({ price: priceCents, currency });
  const site = JSON.parse(await readFile(path, 'utf8'));
  site.gumroad = { ...site.gumroad, productUrl, productId, ...price };
  await writeFile(path, `${JSON.stringify(site, null, 2)}\n`, 'utf8');
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

export async function main(argv = process.argv.slice(2), env = process.env, { fetchImpl = globalThis.fetch, log = console.log, sitePath = SITE_JSON } = {}) {
  const [command, ...flags] = argv;
  if (command !== 'create' && command !== 'enable') {
    log('Usage: node scripts/gumroad-pro-product.js <create [--write-site-json] | enable>');
    return 2;
  }
  const token = String(env.GUMROAD_ACCESS_TOKEN ?? '').trim();
  if (!token) {
    log(NO_TOKEN_NOTICE);
    if (env.GITHUB_STEP_SUMMARY) await appendFile(env.GITHUB_STEP_SUMMARY, `${NO_TOKEN_NOTICE}\n`);
    return 0;
  }

  const site = JSON.parse(await readFile(sitePath, 'utf8'));
  try {
    if (command === 'create') {
      const out = await createOrReuse({ fetchImpl, token, site, priceCents: env.PRICE_CENTS || DEFAULT_PRICE_CENTS, currency: env.CURRENCY || DEFAULT_CURRENCY, log });
      log(`product_id=${out.id}`);
      log(`short_url=${out.shortUrl}`);
      log(`published=${out.published} (a new product stays a draft until \`enable\`)`);
      if (flags.includes('--write-site-json')) {
        await writeSiteJson({ productId: out.id, productUrl: out.shortUrl, priceCents: out.priceCents, currency: out.currency }, sitePath);
        log('wrote gumroad.productId, gumroad.productUrl, gumroad.priceCents and gumroad.currency into src/config/site.json');
      }
      if (env.GITHUB_OUTPUT) await appendFile(env.GITHUB_OUTPUT, `product_id=${out.id}\nshort_url=${out.shortUrl}\n`);
    } else {
      const brandMail = await readProbe(env.BRAND_MAIL_PROBE_FILE || BRAND_MAIL_PROBE);
      const out = await enableProduct({ fetchImpl, token, site, brandMail, log });
      log(`published=${out.published}`);
    }
    return 0;
  } catch (e) {
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
