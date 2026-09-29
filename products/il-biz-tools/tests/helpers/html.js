// A few string-level HTML readers for our own pages. Not a parser: enough for
// markup this repository writes, and each one fails loudly rather than guess.

/** Visible text of a fragment: tags dropped, whitespace collapsed. */
export const textOf = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/** The open elements (tag + attributes) enclosing a character offset. */
export function ancestorsAt(html, offset) {
  const stack = [];
  for (const m of html.slice(0, offset).matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g)) {
    const [, close, tag, attrs] = m;
    const t = tag.toLowerCase();
    if (close) {
      const i = stack.map((s) => s.tag).lastIndexOf(t);
      if (i >= 0) stack.length = i;
    } else if (!VOID.has(t) && !attrs.trim().endsWith('/')) {
      stack.push({ tag: t, attrs });
    }
  }
  return stack;
}

/** True when no element enclosing `offset` carries the `hidden` attribute. */
export function visibleAt(html, offset) {
  return ancestorsAt(html, offset).every((el) => !/\shidden(\s|=|$)/.test(el.attrs));
}

/** The markup of the element with this id, start tag to its matching end tag. */
export function elementById(html, id) {
  const start = html.search(new RegExp(`<([a-z0-9]+)[^>]*\\sid="${id}"`));
  if (start < 0) throw new Error(`#${id} not found`);
  const tag = /^<([a-z0-9]+)/.exec(html.slice(start))[1];
  let depth = 0;
  for (const m of html.slice(start).matchAll(new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g'))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, start + m.index + m[0].length);
  }
  throw new Error(`#${id} is not closed`);
}

/** Every JSON-LD block on the page, parsed. */
export const jsonLdBlocks = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

/** The FAQPage questions of a page's JSON-LD, as a Map name -> answer text. */
export function faqJsonLd(html) {
  const out = new Map();
  for (const block of jsonLdBlocks(html)) {
    const nodes = Array.isArray(block['@graph']) ? block['@graph'] : [block];
    for (const node of nodes.filter((n) => n['@type'] === 'FAQPage')) {
      for (const q of node.mainEntity) out.set(q.name, q.acceptedAnswer.text);
    }
  }
  return out;
}

/** The visible FAQ inside a fragment, as [{question, answerHtml}] from <details><summary>..</summary>..</details>. */
export function faqDetails(fragment) {
  return [...fragment.matchAll(/<details\b[^>]*>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map((m) => ({
    question: textOf(m[1]),
    answerHtml: m[2],
  }));
}
