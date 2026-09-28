// The Pro offer on invoice.html, as the TikTok sales note (research/tiktok/08-sales-marketing-lessons.md §8.1)
// asks for it: the price and the deliverable in plain sight (N1), one name by deliverable (N5), and nothing the
// note rejects (§8.4). Runtime behaviour - the price shown only in the ready state - is in tests/page-invoice.test.js.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRO_PRODUCT_NAME } from '../src/lib/gumroad.js';
import { textOf, elementById, visibleAt, ancestorsAt } from './helpers/html.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');
const invoice = read('invoice.html');
const proStart = invoice.indexOf('id="pro"');
const pro = elementById(invoice, 'pro');

/** Offset of a phrase inside the Pro box, failing if it is not there. */
function inPro(phrase) {
  const at = invoice.indexOf(phrase, proStart);
  expect(at, `"${phrase}" in the Pro box`).toBeGreaterThan(0);
  expect(at, `"${phrase}" inside #pro, not after it`).toBeLessThan(proStart + pro.length);
  return at;
}

describe('N5 one name for the offer, by what it delivers', () => {
  it('heads the Pro box with the product name', () => {
    expect(textOf(/<h3>([\s\S]*?)<\/h3>/.exec(pro)[1])).toBe(PRO_PRODUCT_NAME);
  });

  it('leaves the old name nowhere in the page, the page code or the product job', () => {
    for (const p of ['invoice.html', 'index.html', 'assets/page-invoice.js', 'src/lib/gumroad.js', 'scripts/gumroad-pro-product.js']) {
      expect(read(p), p).not.toContain('מיתוג המסמך');
    }
  });
});

describe('N1 the price terms and one trust line are visible, not folded away', () => {
  it('says "תשלום חד-פעמי, בלי מנוי" outside every <details> and hidden element', () => {
    const at = inPro('תשלום חד-פעמי, בלי מנוי');
    expect(visibleAt(invoice, at)).toBe(true);
    expect(ancestorsAt(invoice, at).some((el) => el.tag === 'details')).toBe(false);
  });

  it('puts the trust line beside the ask, visible', () => {
    const at = inPro('הלוגו והמסמכים נשמרים בדפדפן שלכם בלבד; רק מפתח הרישיון נבדק מול Gumroad');
    expect(visibleAt(invoice, at)).toBe(true);
    const actions = /<div class="actions">[\s\S]*?id="pro-cta"[\s\S]*?<\/div>/.exec(pro)[0];
    expect(actions).toContain('הלוגו והמסמכים נשמרים בדפדפן שלכם בלבד');
  });

  it('has a price slot that starts hidden and empty: the page fills it only in the ready state', () => {
    const slot = /<([a-z]+)[^>]*id="pro-price"[^>]*>([\s\S]*?)<\/\1>/.exec(pro);
    expect(slot, '#pro-price').not.toBeNull();
    expect(slot[0]).toMatch(/\shidden(\s|>|=)/);
    expect(slot[2]).toBe('');
  });

  it('types no price into the page by hand', () => {
    expect(textOf(invoice)).not.toMatch(/₪\s*\d|\d\s*₪/);
    expect(textOf(read('index.html'))).not.toMatch(/₪\s*79|79\s*₪/);
  });
});
