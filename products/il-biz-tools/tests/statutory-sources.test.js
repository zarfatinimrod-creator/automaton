// A source and a check date beside every statutory number (TikTok note N8).
//
// A faceless brand borrows authority by citation, never by posing as an
// accountant: osek-patur.html states the ₪122,833 ceiling and vat.html the 18%
// rate, so each shows "מקור: … · נבדק: <date>" from its config, says when the
// source is secondary, and a year-bound figure says so once the calendar year
// has moved past it. Only where the config is `verified: true`: net-salary.html
// renders tax-2026.json, which is not verified, so it claims no check at all.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sourceLineHe, staleYearHe, sourceNameHe, dateHe } from '../src/lib/source-line.js';
import { PAGE_RATE_SOURCES } from '../src/lib/publish-gate.js';
import { textOf, elementById } from './helpers/html.js';
import { productRoot } from './helpers/product-copy.js';

const read = (p) => readFileSync(join(productRoot, p), 'utf8');
const config = (p) => JSON.parse(read(p));
const osek = config('src/config/osek-patur.json');
const vat = config('src/config/vat.json');

describe('the line itself', () => {
  it('formats a check date the Israeli way', () => {
    expect(dateHe('2026-09-07')).toBe('7.9.2026');
    expect(dateHe('2026-12-31')).toBe('31.12.2026');
  });

  it('names Kol Zchut and ynet, and marks both as secondary sources', () => {
    expect(sourceNameHe('https://www.kolzchut.org.il/he/עוסק_פטור')).toEqual({ name: 'כל זכות', primary: false });
    expect(sourceNameHe('https://www.ynet.co.il/economy/article/yokra14629288')).toEqual({ name: 'ynet', primary: false });
    expect(sourceNameHe('https://www.gov.il/he/departments/israel_tax_authority')).toEqual({ name: 'gov.il', primary: true });
  });

  it('refuses a source it cannot name rather than print a bare address', () => {
    expect(() => sourceNameHe('https://example.com/x')).toThrow();
  });

  it('reads "מקור: <name> (מקור משני) · נבדק: <date>"', () => {
    expect(sourceLineHe(osek)).toBe('מקור: כל זכות (מקור משני) · נבדק: 7.9.2026');
    expect(sourceLineHe(vat)).toBe('מקור: ynet (מקור משני) · נבדק: 7.9.2026');
  });

  it('refuses a config with no check date, or one that is not verified', () => {
    expect(() => sourceLineHe({ ...osek, checkedOn: undefined })).toThrow();
    expect(() => sourceLineHe({ ...osek, verified: false })).toThrow();
  });

  it('labels a year-bound figure once the calendar has moved past its year, and not before', () => {
    expect(staleYearHe(osek, new Date(2026, 11, 31))).toBeNull();
    expect(staleYearHe(osek, new Date(2027, 0, 1))).toBe('הנתון לא עודכן עדיין לשנת 2027');
    expect(staleYearHe(vat, new Date(2030, 0, 1))).toBeNull();
  });
});

describe('the configs', () => {
  it('each verified figure config carries its source and the date it was checked, never in the future', () => {
    for (const c of [osek, vat]) {
      expect(c.verified).toBe(true);
      expect(c.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(c.checkedOn).getTime()).toBeLessThanOrEqual(Date.now());
      expect(c.checkedNote).toMatch(/\S/);
    }
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

  it('net-salary.html renders an unverified config, so it claims no check date anywhere', () => {
    expect(PAGE_RATE_SOURCES['net-salary.html']).toContain('src/config/tax-2026.json');
    expect(config('src/config/tax-2026.json').verified).toBe(false);
    expect(read('net-salary.html')).not.toMatch(/נבדק:/);
  });
});
