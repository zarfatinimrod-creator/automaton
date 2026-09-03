import { describe, it, expect } from 'vitest';
import { trackOsekPatur, OSEK_PATUR_CEILING, statusLabelHe } from '../src/lib/osek-patur.js';

describe('osek patur tracker', () => {
  it('uses the 2026 ceiling of 122,833', () => {
    expect(OSEK_PATUR_CEILING).toBe(122833);
  });
  it('computes total, remaining and projection', () => {
    const r = trackOsekPatur([10000, 10000, 10000]);
    expect(r.total).toBe(30000);
    expect(r.remaining).toBe(92833);
    expect(r.filledMonths).toBe(3);
    expect(r.monthlyAverage).toBe(10000);
    expect(r.projectedAnnual).toBe(120000);
    expect(r.status).toBe('ok');
    expect(r.projectionStatus).toBe('warn');
    expect(r.monthsLeft).toBe(9);
    expect(r.safeMonthlyAverage).toBe(10314.78);
  });
  it('flags the warning band at 85%', () => {
    const r = trackOsekPatur([105000]);
    expect(r.status).toBe('warn');
    expect(r.usedPercent).toBe(85);
  });
  it('flags exceeding the ceiling', () => {
    const r = trackOsekPatur(Array(12).fill(11000));
    expect(r.total).toBe(132000);
    expect(r.status).toBe('over');
    expect(r.remaining).toBeLessThan(0);
    expect(r.safeMonthlyAverage).toBe(0);
  });
  it('ignores blanks, negatives and NaN', () => {
    const r = trackOsekPatur(['', -5, 'x', 500]);
    expect(r.total).toBe(500);
    expect(r.filledMonths).toBe(1);
  });
  it('accepts custom ceiling and band', () => {
    const r = trackOsekPatur([50], { ceiling: 100, warnBand: 0.5 });
    expect(r.status).toBe('warn');
    expect(() => trackOsekPatur([], { ceiling: 0 })).toThrow(RangeError);
  });
  it('has Hebrew labels', () => {
    expect(statusLabelHe('over')).toBe('חריגה מהתקרה');
    expect(statusLabelHe('zzz')).toBe('');
  });
});
