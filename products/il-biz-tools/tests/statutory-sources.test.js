// A source, and what was checked when, beside every statutory number (TikTok note N8).
//
// A faceless brand borrows authority by citation, never by posing as an
// accountant: osek-patur.html states the ₪120,000 ceiling of the tax years 2024
// and 2025, vat.html the 18% rate and allocation.html the ₪5,000 threshold, so
// each shows "מקור: …" from its config, says when the source is secondary, and
// says only what a record in the repository backs: "נבדק: <date>" for a dated
// read of the cited text, "הושווה לתוצאות חיפוש: <date>" for the one search read
// of 7.9.2026, and "תאריך הבדיקה לא תועד" when there is no dated record at all
// (review of 29.9.2026: the 7.9 record read no cited page, so "נבדק: 7.9.2026"
// was a claim nobody made). Since 11.10.2026 osek-patur.html's figure rests on a
// primary text read on 29.9.2026 (the gazette's section 35, a third-party copy),
// so its line is the documents line and says "נבדק"; its 2026 ceiling, which
// rested on a search summary, is pending (research/channel-loop/RULING-2026-10-11-
// osek-patur-ceiling.md). Only where the config is `verified: true`:
// net-salary.html renders tax-2026.json, which is not verified, so it claims no
// check at all.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { sourceLineHe, staleYearHe, sourceNameHe, dateHe } from '../src/lib/source-line.js';
import { PAGE_RATE_SOURCES } from '../src/lib/publish-gate.js';
import { textOf, elementById } from './helpers/html.js';
import { productRoot } from './helpers/product-copy.js';

const read = (p) => readFileSync(join(productRoot, p), 'utf8');
const config = (p) => JSON.parse(read(p));
const osek = config('src/config/osek-patur.json');
const vat = config('src/config/vat.json');
const allocation = config('src/config/allocation-number.json');
const repoRoot = join(productRoot, '..', '..');

describe('the line itself', () => {
  it('formats a check date the Israeli way', () => {
    expect(dateHe('2026-09-07')).toBe('7.9.2026');
    expect(dateHe('2026-12-31')).toBe('31.12.2026');
  });

  it('names Kol Zchut, ynet and Grant Thornton, and marks them as secondary sources', () => {
    expect(sourceNameHe('https://www.kolzchut.org.il/he/עוסק_פטור')).toEqual({ name: 'כל זכות', primary: false });
    expect(sourceNameHe('https://www.ynet.co.il/economy/article/yokra14629288')).toEqual({ name: 'ynet', primary: false });
    expect(sourceNameHe('https://www.grantthornton.co.il/insights1/x/')).toEqual({ name: 'Grant Thornton ישראל', primary: false });
    expect(sourceNameHe('https://www.gov.il/he/departments/israel_tax_authority')).toEqual({ name: 'gov.il', primary: true });
  });

  it('refuses a source it cannot name rather than print a bare address', () => {
    expect(() => sourceNameHe('https://example.com/x')).toThrow();
  });

  it('says what was done and when, and nothing more', () => {
    const base = { verified: true, source: 'https://www.kolzchut.org.il/he/עוסק_פטור' };
    expect(sourceLineHe({ ...base, check: { on: '2026-10-01', how: 'read', record: 'r.md' } })).toBe('מקור: כל זכות (מקור משני) · נבדק: 1.10.2026');
    expect(sourceLineHe({ ...base, check: { on: '2026-09-07', how: 'search', record: 'r.md' } })).toBe('מקור: כל זכות (מקור משני) · הושווה לתוצאות חיפוש: 7.9.2026');
    expect(sourceLineHe(base)).toBe('מקור: כל זכות (מקור משני) · תאריך הבדיקה לא תועד');
  });

  it('the pages\' lines today: osek-patur\'s names the gazette and its copy and was read on 29.9.2026; vat\'s compared with a search on 7.9.2026; allocation\'s has no dated record', () => {
    expect(sourceLineHe(osek)).toBe('מקור: ספר החוקים 3045 (עותק באתר capitax.co.il) · נבדק: 29.9.2026');
    expect(sourceLineHe(vat)).toBe('מקור: ynet (מקור משני) · הושווה לתוצאות חיפוש: 7.9.2026');
    expect(sourceLineHe(allocation)).toBe('מקור: Grant Thornton ישראל (מקור משני) · תאריך הבדיקה לא תועד');
    for (const c of [vat, allocation]) expect(sourceLineHe(c)).not.toContain('נבדק');
  });

  it('a documents line: copies on one site grouped and named with it, a document with no copy named alone', () => {
    const doc = (he, copyOn) => ({ he, ...(copyOn ? { copyOn } : {}) });
    const base = { verified: true, check: { on: '2026-09-29', how: 'read', record: 'r.md' } };
    expect(sourceLineHe({ ...base, documents: { a: doc('א', 'x.co.il') }, sourceLine: ['a'] })).toBe('מקור: א (עותק באתר x.co.il) · נבדק: 29.9.2026');
    expect(sourceLineHe({ ...base, documents: { a: doc('א', 'x.co.il'), b: doc('ב', 'x.co.il') }, sourceLine: ['a', 'b'] })).toBe('מקור: א וב (עותקים באתר x.co.il) · נבדק: 29.9.2026');
    expect(sourceLineHe({ ...base, documents: { a: doc('א'), b: doc('ב', 'x.co.il') }, sourceLine: ['a', 'b'] })).toBe('מקור: א; ב (עותק באתר x.co.il) · נבדק: 29.9.2026');
  });

  it('a documents line needs a dated read with a record: a search, no record, no document or an unknown one is refused', () => {
    expect(() => sourceLineHe({ ...osek, check: { ...osek.check, how: 'search' } })).toThrow(/dated read/);
    expect(() => sourceLineHe({ ...osek, sourceLine: [] })).toThrow();
    expect(() => sourceLineHe({ ...osek, sourceLine: ['nope'] })).toThrow(/unknown document/);
    expect(() => sourceLineHe({ ...osek, documents: undefined })).toThrow();
  });

  it('capitax.co.il is the copy\'s host, never a source: the line builder knows no such source', () => {
    expect(() => sourceNameHe('https://www.capitax.co.il/Attachments/265-2023.pdf')).toThrow();
    expect(osek.source).toBeUndefined();
  });

  it('refuses a config that is not verified, a check of an unknown kind, or a check with no record behind it', () => {
    expect(() => sourceLineHe({ ...osek, verified: false })).toThrow();
    expect(() => sourceLineHe({ ...osek, check: { ...osek.check, how: 'asked a friend' } })).toThrow();
    expect(() => sourceLineHe({ ...osek, check: { ...osek.check, record: undefined } })).toThrow();
    expect(() => sourceLineHe({ ...osek, check: { ...osek.check, on: '29.9.2026' } })).toThrow();
    expect(() => sourceLineHe({ ...vat, check: { ...vat.check, how: 'asked a friend' } })).toThrow();
    expect(() => sourceLineHe({ ...vat, check: { ...vat.check, record: undefined } })).toThrow();
  });

  it('labels a year-bound figure once the calendar has moved past its year, and not before', () => {
    const yearBound = { year: 2026 };
    expect(staleYearHe(yearBound, new Date(2026, 11, 31))).toBeNull();
    expect(staleYearHe(yearBound, new Date(2027, 0, 1))).toBe('הנתון לא עודכן עדיין לשנת 2027');
    expect(staleYearHe(vat, new Date(2030, 0, 1))).toBeNull();
    expect(staleYearHe(osek, new Date(2030, 0, 1))).toBeNull();
  });
});

describe('the configs: every check points at a record that shows it', () => {
  it('vat.json: a dated check, never in the future, backed by a record that carries the date and its rate', () => {
    const figure = `${Math.round(vat.rate * 100)}%`;
    expect(vat.verified).toBe(true);
    expect(vat.check.on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(vat.check.on).getTime()).toBeLessThanOrEqual(Date.now());
    expect(vat.check.note).toMatch(/\S/);
    const record = join(repoRoot, vat.check.record);
    expect(existsSync(record), vat.check.record).toBe(true);
    const text = readFileSync(record, 'utf8');
    expect(text).toContain(vat.check.on);
    expect(text).toContain(figure);
    // "read" claims the cited page itself was read, so its record must carry that page's address.
    if (vat.check.how === 'read') expect(text).toContain(vat.source);
    else expect(vat.check.how).toBe('search');
  });

  it('osek-patur.json: a dated read, never in the future, whose record carries the date, 120,000, the section-35 sentence and the copy\'s address', () => {
    expect(osek.verified).toBe(true);
    expect(osek.check.how).toBe('read');
    expect(osek.check.on).toBe('2026-09-29');
    expect(new Date(osek.check.on).getTime()).toBeLessThanOrEqual(Date.now());
    expect(osek.check.note).toMatch(/\S/);
    const text = readFileSync(join(repoRoot, osek.check.record), 'utf8');
    expect(text).toContain(osek.check.on);
    expect(text).toContain('120,000');
    expect(text).toContain(osek.documents.gazette.url);
    const lines = text.split('\n');
    for (const [y, { ceiling, cite }] of Object.entries(osek.years)) {
      expect(ceiling, y).toBe(120000);
      expect(cite, y).toEqual([{ doc: 'gazette', page: 173, label: 'חוק ההתייעלות הכלכלית, סעיף 35', quote: lines[43] }]);
    }
    expect(lines[43]).toBe('35. בחוק מס ערך מוסף, התשל"ו–1975, בסעיף 1, בהגדרה "עוסק פטור", במקום הסכום הנקוב בה יבוא "120,000 שקלים חדשים".');
    expect(Object.keys(osek.years)).toEqual(['2024', '2025']);
  });

  it('osek-patur.json keeps the 7.9 search as history that says it was never a read, and has no year, no single ceiling, no Kol Zchut address', () => {
    expect(osek.check.earlier.how).toBe('search');
    expect(osek.check.earlier.on).toBe('2026-09-07');
    expect(osek.check.earlier.record).toBe('research/measurements/serp/2026-09-07-hebrew-calculators.md');
    expect(osek.check.earlier.note).toContain('never a read');
    expect(osek.check.earlier.note).toContain('src/config/osek-patur-unverified.json');
    expect(osek.year).toBeUndefined();
    expect(osek.ceiling).toBeUndefined();
    expect(JSON.stringify(osek)).not.toContain('kolzchut.org.il');
  });

  it('the 7.9.2026 record opened no page, so no config may call it a read', () => {
    const serp = readFileSync(join(repoRoot, 'research/measurements/serp/2026-09-07-hebrew-calculators.md'), 'utf8');
    expect(serp).toContain('No result page was opened');
    for (const c of [osek.check, osek.check.earlier, vat.check]) if (c.record.endsWith('2026-09-07-hebrew-calculators.md')) expect(c.how).toBe('search');
  });

  it('allocation-number.json: a source the line can name, and no check it cannot back', () => {
    expect(allocation.verified).toBe(true);
    expect(allocation.sources).toContain(allocation.source);
    expect(allocation.check).toBeUndefined();
  });
});

describe('the pages', () => {
  const osekHtml = read('osek-patur.html');
  const vatHtml = read('vat.html');

  it('osek-patur.html: the source line sits right after the lead that states the 2024-2025 ceiling, linking the gazette\'s copy', () => {
    const lead = /<p class="lead">[\s\S]*?<\/p>/.exec(osekHtml)[0];
    expect(lead).toContain('120,000');
    expect(lead).not.toMatch(/122[,_]?833/);
    expect(textOf(lead)).toBe('כמה נשאר לכם עד התקרה בשנת המס שבחרתם, ומתי כדאי להיערך. תקרת המחזור השנתי לשנות המס 2024 ו-2025: ₪120,000. הזינו את ההכנסה (מחזור) של כל חודש; הנתונים נשמרים בדפדפן שלכם בלבד.');
    const line = elementById(osekHtml, 'ceiling-source');
    expect(osekHtml.indexOf(line)).toBe(osekHtml.indexOf(lead) + lead.length + 3);
    expect(textOf(line)).toBe(sourceLineHe(osek));
    expect(line).toContain(`<a href="${osek.documents.gazette.url}">${osek.documents.gazette.he}</a>`);
    expect(line).not.toContain('kolzchut');
  });

  it('osek-patur.html: the FAQ answer that states the ceiling, and its JSON-LD answer, hold the pending sentence and end with the source line', () => {
    const answer = /<summary>מהי תקרת עוסק פטור\?<\/summary><p>([^<]*)<\/p>/.exec(osekHtml)[1];
    const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(osekHtml)[1]);
    const twin = ld.mainEntity.find((q) => q.name === 'מהי תקרת עוסק פטור?').acceptedAnswer.text;
    for (const text of [answer, twin]) {
      expect(text).toContain('120,000');
      expect(text).not.toMatch(/122[,_]?833/);
      expect(text).toContain(osek.pendingYears['2026'].he);
      expect(text.endsWith(`${sourceLineHe(osek)}.`)).toBe(true);
    }
  });

  it('osek-patur.html: every "נבדק:" on the page is the source line\'s own words (the line, the FAQ answer and its JSON-LD twin), and none stands beside a 2026 amount', () => {
    // The visible line links the document's name, so its raw markup is not the line's text; the tail is the same.
    const tail = sourceLineHe(osek).slice(sourceLineHe(osek).indexOf(` (עותק באתר ${osek.documents.gazette.copyOn}) · נבדק: `));
    expect(tail).toBe(' (עותק באתר capitax.co.il) · נבדק: 29.9.2026');
    const checked = osekHtml.split(/נבדק: \d/).length - 1;
    expect(checked).toBe(osekHtml.split(tail).length - 1);
    expect(checked).toBe(3);
    expect(osekHtml).not.toMatch(/(מאומת|verified)/);
  });

  it('vat.html: the source line sits right after the lead that states the rate, and the FAQ answer cites it too', () => {
    const lead = /<p class="lead">[\s\S]*?<\/p>/.exec(vatHtml)[0];
    expect(lead).toContain('18%');
    const line = elementById(vatHtml, 'rate-source');
    expect(vatHtml.indexOf(line)).toBe(vatHtml.indexOf(lead) + lead.length + 3);
    expect(textOf(line)).toBe(sourceLineHe(vat));
    expect(line).toContain(`href="${vat.source}"`);
    const answer = /<summary>מה שיעור המע״מ בישראל ב-2026\?<\/summary><p>([^<]*)<\/p>/.exec(vatHtml)[1];
    expect(answer).toContain(sourceLineHe(vat));
    const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(vatHtml)[1]);
    expect(ld.mainEntity.find((q) => q.name === 'מה שיעור המע"מ בישראל ב-2026?').acceptedAnswer.text).toContain(sourceLineHe(vat));
  });

  it('allocation.html: the source line sits right after the lead that states the threshold, and the JSON-LD answer that states it cites it too', () => {
    const html = read('allocation.html');
    const lead = /<p class="lead">[\s\S]*?<\/p>/.exec(html)[0];
    expect(lead).toContain('5,000');
    const line = elementById(html, 'threshold-source');
    expect(html.indexOf(line)).toBe(html.indexOf(lead) + lead.length + 3);
    expect(textOf(line)).toBe(sourceLineHe(allocation));
    expect(line).toContain(`href="${allocation.source}"`);
    const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1]);
    expect(ld.mainEntity.find((q) => q.name === 'מאיזה סכום חייבים מספר הקצאה ב-2026?').acceptedAnswer.text).toContain(sourceLineHe(allocation));
  });

  it('index.html states the VAT rate and the allocation threshold, no 2026 osek patur amount, names the years the tracker computes, and says where each source is', () => {
    const html = read('index.html');
    for (const figure of ['18%', '5,000']) expect(html).toContain(figure);
    expect(html).not.toMatch(/122[,_]?833/);
    const card = textOf(/<a class="card tool-card" href="osek-patur\.html"><h2>[^<]*<\/h2>([\s\S]*?)<\/a>/.exec(html)[1]);
    expect(card).toBe('הזינו הכנסות חודשיות וראו כמה נשאר עד תקרת עוסק פטור, עם התרעה מוקדמת. מחשב לשנות המס 2024 ו-2025; לשנת 2026 הדף אומר למה עוד לא.');
    for (const y of ['2024', '2025']) expect(card).toContain(y);
    const lead = textOf(/<p class="lead">([\s\S]*?)<\/p>/.exec(html)[1]);
    expect(lead).toContain('חוץ ממעקב תקרת עוסק פטור ומהבדיקה של בעל עסק זעיר, שאומרים בדף שלהם לאילו שנות מס הם מחשבים;');
    const note = elementById(html, 'figures-source');
    expect(html.indexOf(note)).toBeGreaterThan(html.indexOf('<div class="grid">'));
    expect(textOf(note)).toBe('המקור של כל נתון, ומה נבדק בו ומתי, מופיע בדף הכלי שלו.');
  });

  it('no other figure page, and not the home page, says "נבדק" beside a figure: no other config holds a read of its cited page', () => {
    for (const p of ['vat.html', 'allocation.html', 'index.html']) expect(read(p), p).not.toMatch(/נבדק: \d/);
  });

  it('net-salary.html renders an unverified config, so it claims no check date anywhere', () => {
    expect(PAGE_RATE_SOURCES['net-salary.html']).toContain('src/config/tax-2026.json');
    expect(config('src/config/tax-2026.json').verified).toBe(false);
    expect(read('net-salary.html')).not.toMatch(/נבדק:/);
  });
});
