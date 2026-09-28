// N4 of the TikTok sales note (research/tiktok/08-sales-marketing-lessons.md §8.1): the questions TJ Robertson's
// sales calls answer, answered in writing on the page instead - and each answer checked against the code that makes
// it true. The price in them is never typed: the build injects the one Gumroad read back (src/lib/pro-offer.js).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withProPrice, PRO_PRICE_SLOT } from '../src/lib/pro-offer.js';
import { GUMROAD_STORE_NAME, proButtonState } from '../src/lib/gumroad.js';
import { DOC_TYPES } from '../src/lib/invoice.js';
import { verifyWithGumroad } from '../src/lib/license.js';
import { activationContent, readBackPrice, StopError } from '../scripts/gumroad-pro-product.js';
import { textOf, elementById, faqDetails, faqJsonLd } from './helpers/html.js';
import { copyProduct, removeCopy, runBuild, editIn, readIn } from './helpers/product-copy.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');
const invoice = read('invoice.html');
const index = read('index.html');
const pageJs = read('assets/page-invoice.js');

const Q = {
  a: 'למה לשלם, אם מחולל הקבלות חינמי?',
  b: 'מה Pro מוסיף, ומה הוא לא עושה?',
  c: 'מה קורה אחרי התשלום?',
  d: 'זה מנוי?',
  e: 'הלוגו שלי עולה לשרת כלשהו?',
  f: 'מי מוכר את Pro, ואיזו קבלה מקבלים?',
};
const INDEX_Q = 'כמה עולה Pro, ומה הוא נותן?';

const proFaq = () => faqDetails(elementById(invoice, 'pro-faq'));
const answer = (q, html = invoice, fragment = elementById(invoice, 'pro-faq')) => {
  const entry = faqDetails(fragment).find((d) => d.question === q);
  expect(entry, `visible question "${q}"`).toBeDefined();
  return textOf(entry.answerHtml);
};

describe('the pricing FAQ on invoice.html has the six questions, each with its JSON-LD twin', () => {
  it('asks (a)-(f) in its own section, in order', () => {
    expect(proFaq().map((d) => d.question)).toEqual(Object.values(Q));
    expect(elementById(invoice, 'pro-faq')).toMatch(/<h2>[^<]+<\/h2>/);
  });

  it('says the same words in the JSON-LD as on the page, for every question', () => {
    const ld = faqJsonLd(invoice);
    for (const { question, answerHtml } of proFaq()) {
      expect(ld.get(question), question).toBe(textOf(answerHtml));
    }
  });
});

describe('each answer is true of the code', () => {
  it('(a) the generator, printing and saving are free: none of them sits behind the licence', () => {
    const a = answer(Q.a);
    for (const phrase of ['לא חייבים', 'ההדפסה', 'PDF', 'שמירת הלקוחות', 'המספור האוטומטי', 'הלוגו של העסק וצבע המותג']) expect(a).toContain(phrase);
    const proSection = pageJs.indexOf('// --- Pro');
    expect(proSection).toBeGreaterThan(0);
    for (const button of ["$('#print').addEventListener", "$('#save').addEventListener"]) {
      const at = pageJs.indexOf(button);
      expect(at, button).toBeGreaterThan(0);
      expect(at, `${button} is registered before the Pro section`).toBeLessThan(proSection);
    }
    const printHandler = pageJs.slice(pageJs.indexOf("$('#print')"), pageJs.indexOf('\n', pageJs.indexOf("$('#print')")));
    expect(printHandler).not.toMatch(/proActive|licence|license/);
  });

  it('(b) names every document type the generator makes, and it makes no tax invoice', () => {
    const b = answer(Q.b);
    for (const label of Object.values(DOC_TYPES)) expect(b).toContain(label);
    for (const label of Object.values(DOC_TYPES)) expect(label).not.toContain('חשבונית מס');
    expect(b).toContain('הוא לא מפיק חשבונית מס');
    expect(b).toContain('לא תוכנת הנהלת חשבונות');
    expect(b).toContain('לא ייעוץ מס');
  });

  it('(c) walks through the page as it is: the key in the Gumroad receipt, "יש לי מפתח רישיון", "הפעלה"', () => {
    const c = answer(Q.c);
    expect(c).toContain('"יש לי מפתח רישיון"');
    expect(c).toContain('"הפעלה"');
    expect(/<details id="pro-activate">\s*<summary>([^<]*)<\/summary>/.exec(invoice)[1]).toBe('יש לי מפתח רישיון');
    expect(/<button[^>]*id="license-apply"[^>]*>([^<]*)<\/button>/.exec(invoice)[1]).toBe('הפעלה');
    expect(JSON.stringify(activationContent({ siteUrl: 'https://x' }))).toContain('בקבלה שנשלחה אליכם במייל');
  });

  it('(d) is one-time: the price slot sits in the answer, and the product job refuses a membership', () => {
    const d = elementById(invoice, 'pro-faq').slice(elementById(invoice, 'pro-faq').indexOf(`<summary>${Q.d}</summary>`));
    expect(d.slice(0, d.indexOf('</details>'))).toContain(PRO_PRICE_SLOT);
    const text = answer(Q.d);
    expect(text).toContain('תשלום חד-פעמי, בלי מנוי ובלי חיוב חוזר');
    expect(() => readBackPrice({ price: 7900, currency: 'ils', subscription_duration: 'monthly' })).toThrow(StopError);
    // "any browser": nothing in the licence check limits the number of activations.
    expect(read('src/lib/license.js')).not.toMatch(/max_uses|maxUses|uses\s*>/);
  });

  it('(e) the logo stays in the browser: the licence check sends the key and the product id, nothing else', async () => {
    const e = answer(Q.e);
    expect(e.startsWith('לא.')).toBe(true);
    expect(e).toContain('רק את המפתח ואת מזהה המוצר');
    const calls = [];
    const fetchImpl = async (url, init) => { calls.push(init.body); return { status: 200, text: async () => '{"success":false}' }; };
    await verifyWithGumroad({ productId: 'P', key: 'K', increment: false, fetchImpl });
    await verifyWithGumroad({ productId: 'P', key: 'K', increment: true, fetchImpl });
    for (const body of calls) {
      for (const name of new URLSearchParams(body).keys()) expect(['product_id', 'license_key', 'increment_uses_count']).toContain(name);
    }
    // The branding is written to localStorage and handed to nothing that sends.
    expect(pageJs).toContain("localStorage.setItem(BRANDING_KEY, JSON.stringify(branding))");
    expect(pageJs).not.toMatch(/fetch\([^)]*branding/);
  });

  it('(f) names the seller and the receipt as the ready button does', () => {
    const f = answer(Q.f);
    expect(f).toContain(`בחנות ${GUMROAD_STORE_NAME}`);
    expect(f).toContain('merchant of record');
    expect(f).toContain('הקבלה שלה');
    const ready = proButtonState({ gumroad: { productUrl: 'https://x.gumroad.com/l/p', productId: 'P', priceCents: 7900, currency: 'ils' } });
    expect(ready.note).toContain(`בחנות ${GUMROAD_STORE_NAME}`);
  });
});

describe('index.html carries the short version', () => {
  it('asks once, answers with the slot, links to the full FAQ, and its JSON-LD says the same', () => {
    const faq = elementById(index, 'faq');
    const entry = faqDetails(faq).find((d) => d.question === INDEX_Q);
    expect(entry).toBeDefined();
    expect(entry.answerHtml).toContain(PRO_PRICE_SLOT);
    expect(entry.answerHtml).toContain('href="invoice.html#pro-faq"');
    expect(faqJsonLd(index).get(INDEX_Q)).toBe(textOf(entry.answerHtml));
  });
});

describe('nothing the note rejects (§4.4, §8.4)', () => {
  const REJECTED = ['לכל החיים', 'לתמיד', 'מיידי', 'מובטח', 'בלי שאלות', 'כולל חשבונית מס', 'מאושר ע', 'הנחה', 'מחיר השקה', 'לזמן מוגבל', 'אחרונים', 'היה ₪', 'במקום ₪'];
  it('in the pages, the button notes and the product copy', () => {
    const texts = {
      'invoice.html': invoice,
      'index.html': index,
      'src/lib/gumroad.js': read('src/lib/gumroad.js'),
      'src/lib/pro-nudge.js': read('src/lib/pro-nudge.js'),
      'scripts/gumroad-pro-product.js': read('scripts/gumroad-pro-product.js'),
    };
    for (const [path, text] of Object.entries(texts)) {
      for (const word of REJECTED) expect(text.includes(word), `${path} says "${word}"`).toBe(false);
    }
  });
});

describe('withProPrice: the build puts the price into the FAQ and its JSON-LD, or nothing', () => {
  const page = (visible, ld) => `<html><head><script type="application/ld+json">${JSON.stringify({ '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'זה מנוי?', acceptedAnswer: { '@type': 'Answer', text: ld } }] })}</script></head><body><details><summary>זה מנוי?</summary><p>${visible}</p></details></body></html>`;
  const SOURCE = page(`לא. תשלום חד-פעמי${PRO_PRICE_SLOT}, בלי מנוי.`, 'לא. תשלום חד-פעמי, בלי מנוי.');

  it('with no price, returns the page unchanged', () => {
    expect(withProPrice(SOURCE, null)).toBe(SOURCE);
  });

  it('with a price, fills the slot and the JSON-LD answer alike', () => {
    const out = withProPrice(SOURCE, '‏79 ‏₪');
    expect(out).toContain('<span data-pro-price> של ‏79 ‏₪</span>');
    const entry = faqDetails(out)[0];
    expect(textOf(entry.answerHtml)).toBe('לא. תשלום חד-פעמי של ‏79 ‏₪, בלי מנוי.');
    expect(faqJsonLd(out).get('זה מנוי?')).toBe('לא. תשלום חד-פעמי של ‏79 ‏₪, בלי מנוי.');
  });

  it('refuses when the JSON-LD twin is missing or says something else, with or without a price', () => {
    const drifted = page(`לא. תשלום חד-פעמי${PRO_PRICE_SLOT}, בלי מנוי.`, 'כן, מנוי חודשי.');
    expect(() => withProPrice(drifted, null)).toThrow(/זה מנוי\?/);
    expect(() => withProPrice(drifted, '‏79 ‏₪')).toThrow(/זה מנוי\?/);
    const orphan = `<p>${PRO_PRICE_SLOT}</p>`;
    expect(() => withProPrice(orphan, null)).toThrow(/outside/);
  });

  it('escapes the price as text', () => {
    expect(withProPrice(SOURCE, '<b>1</b>')).toContain('&lt;b&gt;1&lt;/b&gt;');
  });

  it('accepts the real pages as they are in the repository', () => {
    expect(withProPrice(invoice, null)).toBe(invoice);
    expect(withProPrice(index, null)).toBe(index);
    expect(() => withProPrice(invoice, '‏79 ‏₪')).not.toThrow();
    expect(() => withProPrice(index, '‏79 ‏₪')).not.toThrow();
  });
});

describe('the built pages (preview build in a throwaway copy)', () => {
  let today;
  let ready;
  beforeAll(() => {
    today = copyProduct();
    const r1 = runBuild(today, '--preview');
    if (r1.status !== 0) throw new Error(`preview build failed: ${r1.stderr}`);
    ready = copyProduct();
    editIn(ready, 'src/config/site.json', (json) => {
      const site = JSON.parse(json);
      site.gumroad = { ...site.gumroad, productUrl: 'https://mehudak.gumroad.com/l/pro', productId: 'P', priceCents: 7900, currency: 'ils' };
      return JSON.stringify(site, null, 2);
    });
    const r2 = runBuild(ready, '--preview');
    if (r2.status !== 0) throw new Error(`preview build failed: ${r2.stderr}`);
  });
  afterAll(() => { removeCopy(today); removeCopy(ready); });

  it("today's shop is not open: no price in either page, on screen or in JSON-LD", () => {
    for (const p of ['invoice.html', 'index.html']) {
      const html = readIn(join(today, '_preview'), p);
      expect(html).not.toContain(' של ‏79');
      expect([...faqJsonLd(html).values()].join(' ')).not.toMatch(/₪/);
    }
  });

  it('once Gumroad reported ₪79, both pages say it in the answer and in its JSON-LD twin', () => {
    // formatILS separates number and sign with a no-break space; textOf collapses it like any other space.
    const price = textOf(proButtonState({ gumroad: { productUrl: 'https://mehudak.gumroad.com/l/pro', productId: 'P', priceCents: 7900, currency: 'ils' } }).price);
    const inv = readIn(join(ready, '_preview'), 'invoice.html');
    const d = faqDetails(elementById(inv, 'pro-faq')).find((x) => x.question === Q.d);
    expect(textOf(d.answerHtml)).toContain(`תשלום חד-פעמי של ${price}, בלי מנוי`);
    expect(faqJsonLd(inv).get(Q.d)).toBe(textOf(d.answerHtml));
    const idx = readIn(join(ready, '_preview'), 'index.html');
    const i = faqDetails(elementById(idx, 'faq')).find((x) => x.question === INDEX_Q);
    expect(textOf(i.answerHtml)).toContain(price);
    expect(faqJsonLd(idx).get(INDEX_Q)).toBe(textOf(i.answerHtml));
  });
});
