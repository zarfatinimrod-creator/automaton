// The osek patur tracker computes only for a tax year whose ceiling a primary text states: 2024 and 2025, ₪120,000
// (Economic Efficiency Law section 35, ספר החוקים 3045 p.173). 2026 is pending - CPI-linked from 1.1.2026, and no
// primary text read states the amount - and is refused, not computed; a year in neither map is refused as unknown
// (research/channel-loop/RULING-2026-10-11-osek-patur-ceiling.md, decisions 1 and 2).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  trackOsekPatur,
  ceilingFor,
  offeredYears,
  refusalHe,
  statusLabelHe,
  OSEK_PATUR_CONFIG as config,
  DEFAULT_WARN_BAND,
} from '../src/lib/osek-patur.js';
import * as osekPatur from '../src/lib/osek-patur.js';
import { productRoot } from './helpers/product-copy.js';

const Y = { year: '2025' };

describe('the years the tracker computes', () => {
  it('2024 and 2025 give 120000; 2026 is refused as pending; 2027 is refused as unknown', () => {
    expect(ceilingFor('2024')).toEqual({ status: 'ok', year: '2024', ceiling: 120000 });
    expect(ceilingFor(2025)).toEqual({ status: 'ok', year: '2025', ceiling: 120000 });
    expect(ceilingFor('2026')).toEqual({ status: 'refused', year: '2026', reason: 'pending' });
    expect(ceilingFor(2027)).toEqual({ status: 'refused', year: '2027', reason: 'unknown' });
    expect(trackOsekPatur([10000], { year: '2026' })).toEqual({ status: 'refused', year: '2026', reason: 'pending' });
    expect(trackOsekPatur([10000], { year: 2027 })).toEqual({ status: 'refused', year: '2027', reason: 'unknown' });
    expect(trackOsekPatur([10000])).toEqual({ status: 'refused', year: 'undefined', reason: 'unknown' });
  });

  it('offers 2025 and 2024 newest first, then 2026 marked as not computed', () => {
    expect(offeredYears()).toEqual([
      { year: '2025', available: true, ceiling: 120000 },
      { year: '2024', available: true, ceiling: 120000 },
      { year: '2026', available: false },
    ]);
    expect(config.defaultYear).toBe('2025');
  });

  it('a config that is not verified computes nothing', () => {
    const unverified = { ...config, verified: false };
    expect(ceilingFor('2025', unverified)).toEqual({ status: 'refused', year: '2025', reason: 'unverified' });
    expect(trackOsekPatur([1], Y, unverified)).toMatchObject({ status: 'refused', reason: 'unverified' });
  });

  it('a pending year listed in `years` too is still refused', () => {
    const both = { ...config, years: { ...config.years, 2026: { ceiling: 1 } } };
    expect(ceilingFor('2026', both)).toMatchObject({ status: 'refused', reason: 'pending' });
    expect(offeredYears(both).map((y) => y.year)).toEqual(['2025', '2024', '2026']);
    expect(offeredYears(both).find((y) => y.year === '2026').available).toBe(false);
  });

  it('the refusal says the pending year\'s own sentence, or that the tool has no data for the year', () => {
    expect(refusalHe({ status: 'refused', year: '2026', reason: 'pending' })).toBe(config.pendingYears['2026'].he);
    expect(refusalHe({ status: 'refused', year: '2027', reason: 'unknown' })).toBe('לשנת 2027 אין בכלי נתונים, ולכן הוא לא מחשב.');
    expect(refusalHe({ status: 'refused', year: '2025', reason: 'unverified' })).toBe('נתוני הכלי אינם מסומנים כנבדקים, ולכן הוא לא מחשב.');
  });

  it('exports no single ceiling or year: there is none', () => {
    expect(osekPatur.OSEK_PATUR_CEILING).toBeUndefined();
    expect(osekPatur.OSEK_PATUR_YEAR).toBeUndefined();
  });

  it('hard-codes no figure or year, and never loads the unverified file', () => {
    const src = readFileSync(join(productRoot, 'src/lib/osek-patur.js'), 'utf8');
    expect(src).not.toMatch(/120[,_]?000|122[,_]?833|2024|2025|2026|0\.85/);
    expect(src).not.toContain('osek-patur-unverified');
    const custom = { ...config, warnBand: 0.5, years: { 2030: { ceiling: 100 } }, pendingYears: {} };
    expect(trackOsekPatur([50], { year: 2030 }, custom)).toMatchObject({ status: 'warn', ceiling: 100, year: '2030' });
    expect(trackOsekPatur([49], { year: 2030 }, custom).status).toBe('ok');
  });
});

describe('osek patur tracker, for a computed year', () => {
  it('computes total, remaining and projection against 2025\'s 120,000', () => {
    const r = trackOsekPatur([10000, 10000, 10000], Y);
    expect(r.year).toBe('2025');
    expect(r.ceiling).toBe(120000);
    expect(r.total).toBe(30000);
    expect(r.remaining).toBe(90000);
    expect(r.filledMonths).toBe(3);
    expect(r.monthlyAverage).toBe(10000);
    expect(r.projectedAnnual).toBe(120000);
    expect(r.status).toBe('ok');
    expect(r.projectionStatus).toBe('warn');
    expect(r.monthsLeft).toBe(9);
    expect(r.safeMonthlyAverage).toBe(10000);
  });
  it('flags the warning band at 85%', () => {
    expect(DEFAULT_WARN_BAND).toBe(0.85);
    const r = trackOsekPatur([102000], Y);
    expect(r.status).toBe('warn');
    expect(r.usedPercent).toBe(85);
    expect(trackOsekPatur([101999], Y).status).toBe('ok');
  });
  it('the ceiling itself is within it; one shekel over is over', () => {
    expect(trackOsekPatur([120000], Y)).toMatchObject({ status: 'warn', remaining: 0 });
    expect(trackOsekPatur([120001], Y)).toMatchObject({ status: 'over', remaining: -1 });
  });
  it('flags exceeding the ceiling', () => {
    const r = trackOsekPatur(Array(12).fill(11000), Y);
    expect(r.total).toBe(132000);
    expect(r.status).toBe('over');
    expect(r.projectionStatus).toBe('over');
    expect(r.remaining).toBeLessThan(0);
    expect(r.safeMonthlyAverage).toBe(0);
  });
  it('ignores blanks, negatives and NaN', () => {
    const r = trackOsekPatur(['', -5, 'x', 500], { year: '2024' });
    expect(r.total).toBe(500);
    expect(r.filledMonths).toBe(1);
  });
  it('accepts a custom band, and refuses a ceiling that is not positive', () => {
    expect(trackOsekPatur([60000], { ...Y, warnBand: 0.5 }).status).toBe('warn');
    const zero = { ...config, years: { 2030: { ceiling: 0 } }, pendingYears: {} };
    expect(() => trackOsekPatur([], { year: 2030 }, zero)).toThrow(RangeError);
  });
  it('has Hebrew labels', () => {
    expect(statusLabelHe('over')).toBe('חריגה מהתקרה');
    expect(statusLabelHe('zzz')).toBe('');
  });
});
