// The price inside the pricing FAQ, put there by the build and never by hand
// (research/tiktok/08-sales-marketing-lessons.md §8.1 N4) - and the answers
// that are true only while the shop is open, kept off the page until it is.
//
// A FAQ answer that mentions the price carries an empty slot where the amount
// goes: "תשלום חד-פעמי<span data-pro-price></span>, בלי מנוי". The source page
// reads correctly without it, and so does the published page while the shop
// is not open. Once Gumroad has reported a price (proButtonState is `ready`),
// scripts/build-site.js calls withProPrice, which fills the slot - " של ‏79 ‏₪" -
// and rewrites the same answer in the page's FAQPage JSON-LD, so the text a
// search engine reads is the text on the screen.
//
// An answer that describes a live sale - what it costs, who sells it, what
// happens after paying - sits in <details data-pro-sale>. While the shop is not
// ready (price null) the build drops that entry and its JSON-LD twin: the Pro
// box on the same page says nothing is sold yet, and the FAQ must not say
// otherwise (review of 29.9.2026).
//
// Every such entry's JSON-LD twin must say exactly what the visible answer says
// (without the price) or the build stops: a structured-data answer that drifted
// from the page is a claim nobody checked.
//
// The refund answer (RULING-2026-09-29-lines (h)) states the period Gumroad
// applies, read back into site.json as gumroad.refundPeriodDays. Its visible
// answer carries REFUND_DAYS_SLOT where the number goes and its JSON-LD twin the
// same "{n}"; withRefundDays fills both, or - while the shop is not ready or no
// period was read back - drops the entry and its twin, so the page never states
// a period Gumroad does not apply. The entry is a sale entry too, so withProPrice
// already drops it while there is no price.

export const PRO_PRICE_SLOT = '<span data-pro-price></span>';
export const PRO_SALE_ATTR = 'data-pro-sale';
export const REFUND_DAYS_SLOT = '<span data-refund-days>{n}</span>';

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const textOf = (html) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const isSale = (attrs) => new RegExp(`\\s${PRO_SALE_ATTR}(\\s|=|$)`).test(attrs);

const LD = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g;
/** One FAQ entry: (1) its leading newline and indent, (2) <details> attributes, (3) the question, (4) the answer. */
const FAQ_ENTRY = /(\n[ \t]*)?<details\b([^>]*)>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g;
const serialise = (open, block, close) => `${open}\n${JSON.stringify(block, null, 2).replace(/<\//g, '<\\/')}\n${close}`;

/** Every FAQPage node of a parsed JSON-LD block, wherever it sits. */
function faqNodes(block) {
  const nodes = Array.isArray(block?.['@graph']) ? block['@graph'] : [block];
  return nodes.filter((n) => n?.['@type'] === 'FAQPage' && Array.isArray(n.mainEntity));
}

/**
 * @param {string} html the page source
 * @param {string|null} price the formatted price, or null while the shop is not ready
 * @returns {string} with a price: every slot and its JSON-LD twin filled; without one: the sale-only entries and
 *   their twins removed. Unchanged when the page has neither slots nor sale entries.
 * @throws {Error} when a slot sits outside a FAQ entry, or an entry's JSON-LD twin is missing or differs
 */
export function withProPrice(html, price) {
  const total = html.split(PRO_PRICE_SLOT).length - 1;
  const filled = price ? `<span data-pro-price> של ${escapeHtml(price)}</span>` : PRO_PRICE_SLOT;
  const entries = [];
  for (const m of html.matchAll(FAQ_ENTRY)) {
    const sale = isSale(m[2]);
    const slots = m[4].split(PRO_PRICE_SLOT).length - 1;
    if (!sale && slots === 0) continue;
    entries.push({
      whole: m[0],
      sale,
      question: textOf(m[3]),
      before: textOf(m[4]),
      after: textOf(m[4].split(PRO_PRICE_SLOT).join(filled)),
      slots,
    });
  }
  if (entries.reduce((n, e) => n + e.slots, 0) !== total) {
    throw new Error('a price slot sits outside a FAQ entry (<details><summary>…</summary>…</details>)');
  }
  if (entries.length === 0) return html;
  const drop = (e) => e.sale && !price;

  const found = new Set();
  let out = html.replace(LD, (all, open, body, close) => {
    let block;
    try {
      block = JSON.parse(body);
    } catch {
      return all;
    }
    let changed = false;
    for (const node of faqNodes(block)) {
      node.mainEntity = node.mainEntity.filter((q) => {
        const entry = entries.find((e) => e.question === q?.name);
        if (!entry) return true;
        if (q.acceptedAnswer?.text !== entry.before) {
          throw new Error(`the JSON-LD answer to "${entry.question}" differs from the visible one`);
        }
        found.add(entry.question);
        if (drop(entry)) {
          changed = true;
          return false;
        }
        if (price && entry.slots > 0) {
          q.acceptedAnswer.text = entry.after;
          changed = true;
        }
        return true;
      });
    }
    return changed ? serialise(open, block, close) : all;
  });
  for (const e of entries) {
    if (!found.has(e.question)) throw new Error(`no JSON-LD answer for "${e.question}"`);
  }
  for (const e of entries.filter(drop)) out = out.replace(e.whole, '');
  return price ? out.split(PRO_PRICE_SLOT).join(filled) : out;
}

/**
 * @param {string} html the page source (after withProPrice)
 * @param {number|null} days Gumroad's refund period in whole days, or null while the shop is not ready or no period
 *   was read back
 * @returns {string} with days: every refund-period slot and its JSON-LD twin's "{n}" filled; without: every entry
 *   holding a slot removed with its twin. Unchanged when the page has no slot.
 * @throws {Error} when a slot sits outside a FAQ entry, or an entry's JSON-LD twin is missing or differs
 */
export function withRefundDays(html, days) {
  const n = Number.isInteger(days) && days > 0 ? days : null;
  const total = html.split(REFUND_DAYS_SLOT).length - 1;
  if (total === 0) return html;
  const entries = [];
  for (const m of html.matchAll(FAQ_ENTRY)) {
    const slots = m[4].split(REFUND_DAYS_SLOT).length - 1;
    if (slots) entries.push({ whole: m[0], question: textOf(m[3]), before: textOf(m[4]), slots });
  }
  if (entries.reduce((sum, e) => sum + e.slots, 0) !== total) {
    throw new Error('a refund-period slot sits outside a FAQ entry (<details><summary>…</summary>…</details>)');
  }

  const found = new Set();
  let out = html.replace(LD, (all, open, body, close) => {
    let block;
    try {
      block = JSON.parse(body);
    } catch {
      return all;
    }
    let changed = false;
    for (const node of faqNodes(block)) {
      node.mainEntity = node.mainEntity.filter((q) => {
        const entry = entries.find((e) => e.question === q?.name);
        if (!entry) return true;
        if (q.acceptedAnswer?.text !== entry.before) {
          throw new Error(`the JSON-LD answer to "${entry.question}" differs from the visible one`);
        }
        found.add(entry.question);
        changed = true;
        if (n === null) return false;
        q.acceptedAnswer.text = entry.before.split('{n}').join(String(n));
        return true;
      });
    }
    return changed ? serialise(open, block, close) : all;
  });
  for (const e of entries) {
    if (!found.has(e.question)) throw new Error(`no JSON-LD answer for "${e.question}"`);
  }
  if (n === null) {
    for (const e of entries) out = out.replace(e.whole, '');
    return out;
  }
  return out.split(REFUND_DAYS_SLOT).join(`<span data-refund-days>${n}</span>`);
}
