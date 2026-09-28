// The price inside the pricing FAQ, put there by the build and never by hand
// (research/tiktok/08-sales-marketing-lessons.md §8.1 N4).
//
// A FAQ answer that mentions the price carries an empty slot where the amount
// goes: "תשלום חד-פעמי<span data-pro-price></span>, בלי מנוי". The source page
// reads correctly without it, and so does the published page while the shop
// is not open. Once Gumroad has reported a price (proButtonState is `ready`),
// scripts/build-site.js calls withProPrice, which fills the slot - " של ‏79 ‏₪" -
// and rewrites the same answer in the page's FAQPage JSON-LD, so the text a
// search engine reads is the text on the screen.
//
// The JSON-LD twin must say exactly what the visible answer says (without the
// price) or the build stops: a structured-data answer that drifted from the
// page is a claim nobody checked.

export const PRO_PRICE_SLOT = '<span data-pro-price></span>';

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const textOf = (html) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

const LD = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g;

/** Every FAQ Question node of a parsed JSON-LD block, wherever it sits. */
function questions(block) {
  const nodes = Array.isArray(block?.['@graph']) ? block['@graph'] : [block];
  return nodes.filter((n) => n?.['@type'] === 'FAQPage').flatMap((n) => n.mainEntity ?? []);
}

/**
 * @param {string} html the page source
 * @param {string|null} price the formatted price, or null while the shop is not ready
 * @returns {string} the page with the price in every slot and its JSON-LD twin; unchanged when price is null
 * @throws {Error} when a slot sits outside a FAQ entry, or an entry's JSON-LD twin is missing or differs
 */
export function withProPrice(html, price) {
  const total = html.split(PRO_PRICE_SLOT).length - 1;
  if (total === 0) return html;

  const filled = price ? `<span data-pro-price> של ${escapeHtml(price)}</span>` : PRO_PRICE_SLOT;
  const entries = [];
  for (const m of html.matchAll(/<details\b[^>]*>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)) {
    if (!m[2].includes(PRO_PRICE_SLOT)) continue;
    entries.push({
      question: textOf(m[1]),
      before: textOf(m[2]),
      after: textOf(m[2].split(PRO_PRICE_SLOT).join(filled)),
      slots: m[2].split(PRO_PRICE_SLOT).length - 1,
    });
  }
  if (entries.reduce((n, e) => n + e.slots, 0) !== total) {
    throw new Error('a price slot sits outside a FAQ entry (<details><summary>…</summary>…</details>)');
  }

  const found = new Set();
  const out = html.replace(LD, (all, open, body, close) => {
    let block;
    try {
      block = JSON.parse(body);
    } catch {
      return all;
    }
    let changed = false;
    for (const q of questions(block)) {
      const entry = entries.find((e) => e.question === q?.name);
      if (!entry) continue;
      if (q.acceptedAnswer?.text !== entry.before) {
        throw new Error(`the JSON-LD answer to "${entry.question}" differs from the visible one`);
      }
      found.add(entry.question);
      if (price) {
        q.acceptedAnswer.text = entry.after;
        changed = true;
      }
    }
    return changed ? `${open}\n${JSON.stringify(block, null, 2).replace(/<\//g, '<\\/')}\n${close}` : all;
  });
  for (const e of entries) {
    if (!found.has(e.question)) throw new Error(`no JSON-LD answer for "${e.question}"`);
  }
  return price ? out.split(PRO_PRICE_SLOT).join(filled) : html;
}
