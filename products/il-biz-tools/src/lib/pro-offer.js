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

export const PRO_PRICE_SLOT = '<span data-pro-price></span>';
export const PRO_SALE_ATTR = 'data-pro-sale';

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const textOf = (html) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const isSale = (attrs) => new RegExp(`\\s${PRO_SALE_ATTR}(\\s|=|$)`).test(attrs);

const LD = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g;

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
  for (const m of html.matchAll(/(\n[ \t]*)?<details\b([^>]*)>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)) {
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
    return changed ? `${open}\n${JSON.stringify(block, null, 2).replace(/<\//g, '<\\/')}\n${close}` : all;
  });
  for (const e of entries) {
    if (!found.has(e.question)) throw new Error(`no JSON-LD answer for "${e.question}"`);
  }
  for (const e of entries.filter(drop)) out = out.replace(e.whole, '');
  return price ? out.split(PRO_PRICE_SLOT).join(filled) : out;
}
