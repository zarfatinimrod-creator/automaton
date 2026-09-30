// N4 of the TikTok sales note (research/tiktok/08-sales-marketing-lessons.md §8.1): the questions TJ Robertson's
// sales calls answer, answered in writing on the page instead - and each answer checked against the code that makes
// it true. The price in them is never typed: the build injects the one Gumroad read back (src/lib/pro-offer.js).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withProPrice, withRefundDays, PRO_PRICE_SLOT, PRO_SALE_ATTR, REFUND_DAYS_SLOT } from '../src/lib/pro-offer.js';
import { GUMROAD_STORE_NAME, proButtonState } from '../src/lib/gumroad.js';
import { DOC_TYPES } from '../src/lib/invoice.js';
import { verifyWithGumroad } from '../src/lib/license.js';
import { activationContent, readBackPrice, StopError, MIN_REFUND_DAYS } from '../scripts/gumroad-pro-product.js';
import { textOf, elementById, faqDetails, faqJsonLd, jsonLdBlocks } from './helpers/html.js';
import { copyProduct, removeCopy, runBuild, editIn, readIn, fillContact, TEST_CONTACT_ADDRESS } from './helpers/product-copy.js';
import { CANCEL_LINK_ATTR, cancelHref } from '../src/lib/publish-gate.js';

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
  g: 'אפשר לקבל החזר?',
};
// RULING-2026-09-29-lines (h) APPLY 2, with RULING-2026-09-30-documents fold action 7: "in the currency charged" and
// the home page's cancellation link ("ביטול עסקה (Pro)"). {n} is the slot the build fills from site.json.
const REFUND_ANSWER = 'החזר כספי בתוך {n} ימים מהרכישה, במטבע שבו חויבתם, לפי מדיניות ההחזרים של Gumroad: משיבים למייל הקבלה מ-Gumroad, או כותבים לנו בקישור ביטול עסקה (Pro). מדיניות מלאה בדף המוצר ב-Gumroad.';
const INDEX_Q = 'כמה עולה Pro, ומה הוא נותן?';

const proFaq = () => faqDetails(elementById(invoice, 'pro-faq'));
const answer = (q, html = invoice, fragment = elementById(invoice, 'pro-faq')) => {
  const entry = faqDetails(fragment).find((d) => d.question === q);
  expect(entry, `visible question "${q}"`).toBeDefined();
  return textOf(entry.answerHtml);
};

describe('the pricing FAQ on invoice.html has the seven questions, each with its JSON-LD twin', () => {
  it('asks (a)-(g) in its own section, in order', () => {
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
    // Under N2 the logo and colour fields are open before paying (the try-out); what activation adds is print.
    expect(c).not.toContain('נפתחים');
    expect(c).toContain('בהדפסה ובשמירה כ-PDF');
    expect(pageJs).toMatch(/proActive \? 'pro' : proState\.state === 'ready' \? 'trial' : 'off'/);
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

  it('(g) is the ruling\'s sentence with the period as a slot: Gumroad\'s policy, the receipt reply, no law and no promise beyond it', () => {
    expect(answer(Q.g)).toBe(REFUND_ANSWER);
    const g = elementById(invoice, 'pro-faq').slice(elementById(invoice, 'pro-faq').indexOf(`<summary>${Q.g}</summary>`));
    expect(g.slice(0, g.indexOf('</details>'))).toContain(REFUND_DAYS_SLOT);
    // RULING-2026-09-30-documents fold action 7: the currency charged, and the cancellation link the build fills from
    // the accessibility statement's address - never an address typed here.
    expect(answer(Q.g)).toContain('במטבע שבו חויבתם');
    const link = /<a\b([^>]*)>([^<]*)<\/a>/.exec(g.slice(0, g.indexOf('</details>')));
    expect(link[1]).toContain(CANCEL_LINK_ATTR);
    expect(link[1]).toContain('data-publish-blocker="cancel-link"');
    expect(link[1]).not.toContain('@');
    expect(link[2]).toBe('ביטול עסקה (Pro)');
    expect(REFUND_ANSWER).not.toMatch(/חוק|בלי שאלות|מובטח/);
    // The product job never sells under a window shorter than the one the page may state.
    expect(MIN_REFUND_DAYS).toBe(14);
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

describe('every FAQ answer a search engine reads is whole sentences', () => {
  it('no JSON-LD answer on any page ends in a loose link label', () => {
    const pages = readdirSync(root).filter((n) => n.endsWith('.html'));
    for (const p of pages) {
      for (const [q, text] of faqJsonLd(read(p))) expect(text, `${p}: ${q}`).toMatch(/[.?!]$/);
    }
  });
});

// Review of 29.9 (honesty 5, code 6): an answer that describes a live sale - what it costs, who sells it, what
// happens after paying - is true only once the shop is open. Such an entry carries data-pro-sale, and the build
// keeps it (and its JSON-LD twin) only while the Pro button is `ready`.
describe('answers about a live sale appear only once the shop is ready', () => {
  const marked = (html, fragment) => [...fragment.matchAll(/<details\b([^>]*)>\s*<summary>([\s\S]*?)<\/summary>/g)]
    .filter((m) => new RegExp(`\\s${PRO_SALE_ATTR}(\\s|=|$)`).test(m[1])).map((m) => textOf(m[2]));

  it('marks exactly "after paying", "who sells it" and "a refund?" on invoice.html, and "how much" on index.html', () => {
    expect(marked(invoice, elementById(invoice, 'pro-faq'))).toEqual([Q.c, Q.f, Q.g]);
    expect(marked(invoice, invoice)).toEqual([Q.c, Q.f, Q.g]);
    expect(marked(index, index)).toEqual([INDEX_Q]);
  });

  const SALE = `<html><head><script type="application/ld+json">${JSON.stringify({ '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'מי מוכר?', acceptedAnswer: { '@type': 'Answer', text: 'Gumroad.' } },
    { '@type': 'Question', name: 'זה מנוי?', acceptedAnswer: { '@type': 'Answer', text: 'לא.' } },
  ] })}</script></head><body>
  <details ${PRO_SALE_ATTR}><summary>מי מוכר?</summary><p>Gumroad.</p></details>
  <details><summary>זה מנוי?</summary><p>לא${PRO_PRICE_SLOT}.</p></details>
</body></html>`;

  it('with no price, drops the entry and its JSON-LD twin, and keeps the rest', () => {
    const out = withProPrice(SALE, null);
    expect(faqDetails(out).map((d) => d.question)).toEqual(['זה מנוי?']);
    expect([...faqJsonLd(out).keys()]).toEqual(['זה מנוי?']);
    expect(out).not.toContain('Gumroad.');
  });

  it('with a price, keeps both', () => {
    const out = withProPrice(SALE, '‏79 ‏₪');
    expect(faqDetails(out).map((d) => d.question)).toEqual(['מי מוכר?', 'זה מנוי?']);
    expect([...faqJsonLd(out).keys()]).toEqual(['מי מוכר?', 'זה מנוי?']);
  });

  it('refuses a sale entry whose JSON-LD twin is missing or differs, with or without a price', () => {
    const drifted = SALE.replace('"text":"Gumroad."', '"text":"אנחנו."');
    const orphan = SALE.replace('"name":"מי מוכר?"', '"name":"מי מוכר את זה?"');
    for (const price of [null, '‏79 ‏₪']) {
      expect(() => withProPrice(drifted, price)).toThrow(/מי מוכר\?/);
      expect(() => withProPrice(orphan, price)).toThrow(/מי מוכר\?/);
    }
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

describe('withRefundDays: the build states Gumroad\'s refund period in the FAQ and its JSON-LD, or drops the answer', () => {
  const page = (visible, ld, attrs = ' data-pro-sale') => `<html><head><script type="application/ld+json">${JSON.stringify({ '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'אפשר לקבל החזר?', acceptedAnswer: { '@type': 'Answer', text: ld } },
    { '@type': 'Question', name: 'זה מנוי?', acceptedAnswer: { '@type': 'Answer', text: 'לא.' } },
  ] })}</script></head><body>
  <details${attrs}><summary>אפשר לקבל החזר?</summary><p>${visible}</p></details>
  <details><summary>זה מנוי?</summary><p>לא.</p></details>
</body></html>`;
  const SOURCE = page(`החזר בתוך ${REFUND_DAYS_SLOT} ימים.`, 'החזר בתוך {n} ימים.');

  it('with a number of days, fills the slot and the JSON-LD answer alike', () => {
    const out = withRefundDays(SOURCE, 30);
    expect(out).not.toContain('{n}');
    expect(textOf(faqDetails(out)[0].answerHtml)).toBe('החזר בתוך 30 ימים.');
    expect(faqJsonLd(out).get('אפשר לקבל החזר?')).toBe('החזר בתוך 30 ימים.');
  });

  it('with no number, drops the entry and its JSON-LD twin, and keeps the rest', () => {
    for (const days of [null, undefined, 0, 30.5, '30']) {
      const out = withRefundDays(SOURCE, days);
      expect(faqDetails(out).map((d) => d.question), String(days)).toEqual(['זה מנוי?']);
      expect([...faqJsonLd(out).keys()]).toEqual(['זה מנוי?']);
      expect(out).not.toContain('{n}');
    }
  });

  it('refuses a twin that drifted or is missing, and a slot outside a FAQ entry', () => {
    const drifted = page(`החזר בתוך ${REFUND_DAYS_SLOT} ימים.`, 'החזר בתוך {n} ימים, בלי שאלות.');
    const noTwin = SOURCE.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
    for (const days of [null, 30]) {
      expect(() => withRefundDays(drifted, days)).toThrow(/אפשר לקבל החזר\?/);
      expect(() => withRefundDays(noTwin, days)).toThrow(/no JSON-LD answer/);
      expect(() => withRefundDays(`<p>${REFUND_DAYS_SLOT}</p>`, days)).toThrow(/outside/);
    }
  });

  it('leaves a page with no slot untouched', () => {
    const plain = page('לא.', 'לא.');
    expect(withRefundDays(plain, 30)).toBe(plain);
    expect(withRefundDays(plain, null)).toBe(plain);
  });

  it('accepts the real page as it is in the repository', () => {
    expect(() => withRefundDays(invoice, null)).not.toThrow();
    expect(() => withRefundDays(invoice, 30)).not.toThrow();
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

  it('refuses an answer with a slot that has no JSON-LD twin at all, or whose visible question was renamed', () => {
    const noTwin = SOURCE.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
    const renamed = SOURCE.replace('<summary>זה מנוי?</summary>', '<summary>האם זה מנוי?</summary>');
    for (const price of [null, '‏79 ‏₪']) {
      expect(() => withProPrice(noTwin, price)).toThrow(/no JSON-LD answer for "זה מנוי\?"/);
      expect(() => withProPrice(renamed, price)).toThrow(/no JSON-LD answer for "האם זה מנוי\?"/);
    }
  });

  it('escapes the price as text', () => {
    expect(withProPrice(SOURCE, '<b>1</b>')).toContain('&lt;b&gt;1&lt;/b&gt;');
  });

  it('accepts the real pages as they are in the repository', () => {
    expect(() => withProPrice(invoice, null)).not.toThrow();
    expect(() => withProPrice(index, null)).not.toThrow();
    expect(() => withProPrice(invoice, '‏79 ‏₪')).not.toThrow();
    expect(() => withProPrice(index, '‏79 ‏₪')).not.toThrow();
  });
});

describe('the built pages (preview build in a throwaway copy)', () => {
  let today;
  let ready;
  let readyNoDays;
  const configured = (gumroad) => {
    const dir = copyProduct();
    editIn(dir, 'src/config/site.json', (json) => {
      const site = JSON.parse(json);
      site.gumroad = { ...site.gumroad, ...gumroad };
      return JSON.stringify(site, null, 2);
    });
    const r = runBuild(dir, '--preview');
    if (r.status !== 0) throw new Error(`preview build failed: ${r.stderr}`);
    return dir;
  };
  beforeAll(() => {
    today = copyProduct();
    const r1 = runBuild(today, '--preview');
    if (r1.status !== 0) throw new Error(`preview build failed: ${r1.stderr}`);
    const shop = { productUrl: 'https://mehudak.gumroad.com/l/pro', productId: 'P', priceCents: 7900, currency: 'ils' };
    ready = configured({ ...shop, refundPeriodDays: 30 });
    readyNoDays = configured({ ...shop, refundPeriodDays: null });
  });
  afterAll(() => { removeCopy(today); removeCopy(ready); removeCopy(readyNoDays); });

  it("today's shop is not open: no price in either page, on screen or in JSON-LD", () => {
    for (const p of ['invoice.html', 'index.html']) {
      const html = readIn(join(today, '_preview'), p);
      expect(html).not.toContain(' של ‏79');
      expect([...faqJsonLd(html).values()].join(' ')).not.toMatch(/₪/);
    }
  });

  it("today's shop is not open: no answer says what it costs, who sells it or what happens after paying", () => {
    const inv = readIn(join(today, '_preview'), 'invoice.html');
    const idx = readIn(join(today, '_preview'), 'index.html');
    expect(faqDetails(elementById(inv, 'pro-faq')).map((d) => d.question)).toEqual([Q.a, Q.b, Q.d, Q.e]);
    for (const q of [Q.c, Q.f, Q.g]) expect(faqJsonLd(inv).has(q), q).toBe(false);
    expect(faqDetails(elementById(idx, 'faq')).map((d) => d.question)).not.toContain(INDEX_Q);
    expect(faqJsonLd(idx).has(INDEX_Q)).toBe(false);
    for (const html of [inv, idx]) expect(html).not.toContain('המכירה נעשית');
  });

  it('once ready with Gumroad\'s refund period read back, all seven questions are back, each with its JSON-LD twin', () => {
    const inv = readIn(join(ready, '_preview'), 'invoice.html');
    expect(faqDetails(elementById(inv, 'pro-faq')).map((d) => d.question)).toEqual(Object.values(Q));
    for (const { question, answerHtml } of faqDetails(elementById(inv, 'pro-faq'))) expect(faqJsonLd(inv).get(question), question).toBe(textOf(answerHtml));
    const idx = readIn(join(ready, '_preview'), 'index.html');
    expect(faqJsonLd(idx).has(INDEX_Q)).toBe(true);
  });

  it('the refund answer states the period Gumroad applies, on screen and in JSON-LD, and never the slot', () => {
    const inv = readIn(join(ready, '_preview'), 'invoice.html');
    const g = faqDetails(elementById(inv, 'pro-faq')).find((x) => x.question === Q.g);
    expect(textOf(g.answerHtml)).toBe(REFUND_ANSWER.replace('{n}', '30'));
    expect(faqJsonLd(inv).get(Q.g)).toBe(REFUND_ANSWER.replace('{n}', '30'));
    expect(inv).not.toContain('{n}');
  });

  it('ready but with no refund period read back: six questions, the refund answer dropped with its twin', () => {
    const inv = readIn(join(readyNoDays, '_preview'), 'invoice.html');
    expect(faqDetails(elementById(inv, 'pro-faq')).map((d) => d.question)).toEqual([Q.a, Q.b, Q.c, Q.d, Q.e, Q.f]);
    expect(faqJsonLd(inv).has(Q.g)).toBe(false);
    expect(inv).not.toContain('{n}');
    expect(inv).not.toContain('החזר כספי בתוך');
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

// RULING-2026-09-30-documents fold action 7: once the shop is open and the statement has its contact, the refund
// answer's link is the brand address the statement publishes, with the subject; the page names no one else.
describe('the published refund answer carries the cancellation link, filled from the statement', () => {
  let dir;
  afterAll(() => removeCopy(dir));

  it('links the brand address with the subject, on screen, and its JSON-LD twin says the same words', () => {
    dir = copyProduct();
    editIn(dir, 'src/config/site.json', (json) => {
      const site = JSON.parse(json);
      site.gumroad = { ...site.gumroad, productUrl: 'https://mehudak.gumroad.com/l/pro', productId: 'P', priceCents: 7900, currency: 'ils', refundPeriodDays: 30 };
      return JSON.stringify(site, null, 2);
    });
    fillContact(dir);
    const r = runBuild(dir);
    expect(r.status, r.stderr).toBe(0);
    const inv = readIn(join(dir, '_site'), 'invoice.html');
    const g = faqDetails(elementById(inv, 'pro-faq')).find((x) => x.question === Q.g);
    expect(g.answerHtml).toContain(`<a ${CANCEL_LINK_ATTR} href="${cancelHref(TEST_CONTACT_ADDRESS)}">ביטול עסקה (Pro)</a>`);
    expect(textOf(g.answerHtml)).toBe(REFUND_ANSWER.replace('{n}', '30'));
    expect(faqJsonLd(inv).get(Q.g)).toBe(REFUND_ANSWER.replace('{n}', '30'));
    const addresses = inv.match(/[^\s"'<>:?=@]+@[^\s"'<>?&]+/g) ?? [];
    expect(addresses.length).toBeGreaterThan(0);
    expect(addresses.every((a) => a === TEST_CONTACT_ADDRESS)).toBe(true);
    expect(inv).not.toMatch(/data-publish-blocker/i);
  });
});

describe('the build, half configured or drifted (review 29.9, code 3)', () => {
  const halfReady = (gumroad) => {
    const dir = copyProduct();
    editIn(dir, 'src/config/site.json', (json) => {
      const site = JSON.parse(json);
      site.gumroad = { ...site.gumroad, ...gumroad };
      return JSON.stringify(site, null, 2);
    });
    return dir;
  };
  const dirs = [];
  afterAll(() => { for (const d of dirs) removeCopy(d); });

  for (const [name, gumroad] of [
    ['a price but no product id', { productUrl: 'https://mehudak.gumroad.com/l/pro', productId: '', priceCents: 7900, currency: 'ils', refundPeriodDays: 30 }],
    ['a price but a product URL that is not https', { productUrl: 'http://mehudak.gumroad.com/l/pro', productId: 'P', priceCents: 7900, currency: 'ils', refundPeriodDays: 30 }],
    ['a refund period but no price', { productUrl: 'https://mehudak.gumroad.com/l/pro', productId: 'P', priceCents: null, currency: '', refundPeriodDays: 30 }],
  ]) {
    it(`${name}: no price and no sale answer, on screen or in JSON-LD`, () => {
      const dir = halfReady(gumroad);
      dirs.push(dir);
      const r = runBuild(dir, '--preview');
      expect(r.status, r.stderr).toBe(0);
      for (const p of ['invoice.html', 'index.html']) {
        const html = readIn(join(dir, '_preview'), p);
        expect(html).not.toMatch(/<span data-pro-price> של/);
        const ld = [...faqJsonLd(html).values()].join(' ');
        expect(ld).not.toMatch(/79|₪/);
        expect(html).not.toContain('המכירה נעשית');
        expect(html).not.toContain('החזר כספי בתוך');
        expect(html).not.toContain('{n}');
      }
    });
  }

  it('a JSON-LD answer edited away from its visible twin stops the build, preview included', () => {
    const dir = copyProduct();
    dirs.push(dir);
    editIn(dir, 'invoice.html', (html) => html.replace('"text": "לא. Pro הוא תשלום חד-פעמי, בלי מנוי', '"text": "לא. Pro הוא מנוי חודשי, בלי מנוי'));
    expect(readIn(dir, 'invoice.html')).toContain('Pro הוא מנוי חודשי');
    const r = runBuild(dir, '--preview');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('the pricing FAQ and its JSON-LD disagree');
    expect(r.stderr).toContain('זה מנוי?');
  });
});
