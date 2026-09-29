// A source, and what was checked when, beside every statutory number (TikTok note N8).
//
// A faceless brand borrows authority by citation, never by posing as an
// accountant: osek-patur.html states the ₪122,833 ceiling, vat.html the 18%
// rate and allocation.html the ₪5,000 threshold, so each shows "מקור: …" from
// its config, says when the source is secondary, and says only what a record in
// the repository backs: "נבדק: <date>" for a dated read of the cited page,
// "הושווה לתוצאות חיפוש: <date>" for the one search read of 7.9.2026, and
// "תאריך הבדיקה לא תועד" when there is no dated record at all (review of
// 29.9.2026: the 7.9 record read no cited page, so "נבדק: 7.9.2026" was a claim
// nobody made). A year-bound figure says so once the calendar year has moved
// past it. Only where the config is `verified: true`: net-salary.html renders
// tax-2026.json, which is not verified, so it claims no check at all.
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

  it('the pages\' lines today: two compared with a search on 7.9.2026, one with no dated record - none says "נבדק"', () => {
    expect(sourceLineHe(osek)).toBe('מקור: כל זכות (מקור משני) · הושווה לתוצאות חיפוש: 7.9.2026');
    expect(sourceLineHe(vat)).toBe('מקור: ynet (מקור משני) · הושווה לתוצאות חיפוש: 7.9.2026');
    expect(sourceLineHe(allocation)).toBe('מקור: Grant Thornton ישראל (מקור משני) · תאריך הבדיקה לא תועד');
    for (const c of [osek, vat, allocation]) expect(sourceLineHe(c)).not.toContain('נבדק');
  });

  it('refuses a config that is not verified, a check of an unknown kind, or a check with no record behind it', () => {
    expect(() => sourceLineHe({ ...osek, verified: false })).toThrow();
    expect(() => sourceLineHe({ ...osek, check: { ...osek.check, how: 'asked a friend' } })).toThrow();
    expect(() => sourceLineHe({ ...osek, check: { ...osek.check, record: undefined } })).toThrow();
    expect(() => sourceLineHe({ ...osek, check: { ...osek.check, on: '7.9.2026' } })).toThrow();
  });

  it('labels a year-bound figure once the calendar has moved past its year, and not before', () => {
    expect(staleYearHe(osek, new Date(2026, 11, 31))).toBeNull();
    expect(staleYearHe(osek, new Date(2027, 0, 1))).toBe('הנתון לא עודכן עדיין לשנת 2027');
    expect(staleYearHe(vat, new Date(2030, 0, 1))).toBeNull();
  });
});

describe('the configs: every check points at a record that shows it', () => {
  // The figure as a record in this repository would write it.
  const FIGURES = [
    ['osek-patur.json', osek, osek.ceiling.toLocaleString('en-US')],
    ['vat.json', vat, `${Math.round(vat.rate * 100)}%`],
  ];

  for (const [name, c, figure] of FIGURES) {
    it(`${name}: a dated check, never in the future, backed by a record that carries the date and ${figure}`, () => {
      expect(c.verified).toBe(true);
      expect(c.check.on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(c.check.on).getTime()).toBeLessThanOrEqual(Date.now());
      expect(c.check.note).toMatch(/\S/);
      const record = join(repoRoot, c.check.record);
      expect(existsSync(record), c.check.record).toBe(true);
      const text = readFileSync(record, 'utf8');
      expect(text).toContain(c.check.on);
      expect(text).toContain(figure);
      // "read" claims the cited page itself was read, so its record must carry that page's address.
      if (c.check.how === 'read') expect(text).toContain(c.source);
      else expect(c.check.how).toBe('search');
    });
  }

  it('the 7.9.2026 record opened no page, so neither config may call it a read', () => {
    const serp = readFileSync(join(repoRoot, 'research/measurements/serp/2026-09-07-hebrew-calculators.md'), 'utf8');
    expect(serp).toContain('No result page was opened');
    for (const c of [osek, vat]) if (c.check.record.endsWith('2026-09-07-hebrew-calculators.md')) expect(c.check.how).toBe('search');
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

  it('osek-patur.html: the source line sits right after the lead that states the ceiling, linking the source', () => {
    const lead = /<p class="lead">[\s\S]*?<\/p>/.exec(osekHtml)[0];
    expect(lead).toContain('122,833');
    const line = elementById(osekHtml, 'ceiling-source');
    expect(osekHtml.indexOf(line)).toBe(osekHtml.indexOf(lead) + lead.length + 3);
    expect(textOf(line)).toBe(sourceLineHe(osek));
    expect(line).toContain(`href="${osek.source}"`);
  });

  it('osek-patur.html: the stale-year label is there, empty and hidden, for the page script to fill', () => {
    expect(elementById(osekHtml, 'ceiling-stale')).toMatch(/^<p\b[^>]*\shidden[^>]*><\/p>$/);
    const script = read('assets/page-osek-patur.js');
    expect(script).toMatch(/staleYearHe\(/);
    expect(script).toMatch(/#ceiling-stale/);
  });

  it('osek-patur.html: the FAQ answer that states the ceiling cites the same source and date, and so does its JSON-LD answer', () => {
    const answer = /<summary>מהי תקרת עוסק פטור לשנת 2026\?<\/summary><p>([^<]*)<\/p>/.exec(osekHtml)[1];
    expect(answer).toContain('122,833');
    expect(answer).toContain(sourceLineHe(osek));
    const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(osekHtml)[1]);
    expect(ld.mainEntity.find((q) => q.name === 'מהי תקרת עוסק פטור לשנת 2026?').acceptedAnswer.text).toContain(sourceLineHe(osek));
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

  it('index.html states figures from three tools, and says where each one\'s source is', () => {
    const html = read('index.html');
    for (const figure of ['18%', '122,833', '5,000']) expect(html).toContain(figure);
    const note = elementById(html, 'figures-source');
    expect(html.indexOf(note)).toBeGreaterThan(html.indexOf('<div class="grid">'));
    expect(textOf(note)).toBe('המקור של כל נתון, ומה נבדק בו ומתי, מופיע בדף הכלי שלו.');
  });

  it('no page says "נבדק" beside a figure: no config holds a read of its cited page yet', () => {
    for (const p of ['osek-patur.html', 'vat.html', 'allocation.html', 'index.html']) expect(read(p), p).not.toMatch(/נבדק: \d/);
  });

  it('net-salary.html renders an unverified config, so it claims no check date anywhere', () => {
    expect(PAGE_RATE_SOURCES['net-salary.html']).toContain('src/config/tax-2026.json');
    expect(config('src/config/tax-2026.json').verified).toBe(false);
    expect(read('net-salary.html')).not.toMatch(/נבדק:/);
  });
});
