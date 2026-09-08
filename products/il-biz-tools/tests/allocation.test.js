import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  thresholdOn, nextChangeAfter, checkAllocationNumber, proximityWarning, SCOPE_NOTE,
} from '../src/lib/allocation.js';

const config = JSON.parse(readFileSync(new URL('../src/config/allocation-number.json', import.meta.url), 'utf8'));
const check = (amountBeforeVat, dateIso, isDomesticB2B = true) =>
  checkAllocationNumber({ amountBeforeVat, dateIso, isDomesticB2B }, config);

describe('allocation-number config', () => {
  it('is sorted, dated and sourced', () => {
    const froms = config.thresholds.map((t) => t.from);
    expect([...froms].sort()).toEqual(froms);
    expect(config.sources.length).toBeGreaterThan(2);
    for (const t of config.thresholds) {
      expect(t.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(t.amountIls).toBeGreaterThan(0);
    }
  });
  it('carries the four published thresholds', () => {
    expect(config.thresholds.map((t) => [t.from, t.amountIls])).toEqual([
      ['2024-05-05', 25000], ['2025-01-01', 20000], ['2026-01-01', 10000], ['2026-06-01', 5000],
    ]);
  });
});

describe('thresholdOn', () => {
  it('returns nothing before the model started', () => {
    expect(thresholdOn('2024-05-04', config)).toBeNull();
    expect(thresholdOn('2020-01-01', config)).toBeNull();
  });
  it('returns the era in force on the boundary day itself', () => {
    expect(thresholdOn('2024-05-05', config).amountIls).toBe(25000);
    expect(thresholdOn('2025-01-01', config).amountIls).toBe(20000);
    expect(thresholdOn('2026-01-01', config).amountIls).toBe(10000);
    expect(thresholdOn('2026-06-01', config).amountIls).toBe(5000);
  });
  it('holds an era until the day before the next one', () => {
    expect(thresholdOn('2024-12-31', config).amountIls).toBe(25000);
    expect(thresholdOn('2025-12-31', config).amountIls).toBe(20000);
    expect(thresholdOn('2026-05-31', config).amountIls).toBe(10000);
    expect(thresholdOn('2030-01-01', config).amountIls).toBe(5000);
  });
  it('accepts a full ISO timestamp and rejects junk', () => {
    expect(thresholdOn('2026-06-01T09:30:00Z', config).amountIls).toBe(5000);
    expect(thresholdOn('01/06/2026', config)).toBeNull();
    expect(thresholdOn('', config)).toBeNull();
    expect(thresholdOn(undefined, config)).toBeNull();
    expect(thresholdOn('2026-06-01', {})).toBeNull();
  });
});

describe('nextChangeAfter', () => {
  it('names the next drop', () => {
    expect(nextChangeAfter('2025-06-01', config).amountIls).toBe(10000);
    expect(nextChangeAfter('2026-01-01', config).amountIls).toBe(5000);
  });
  it('is null once the last published change has passed', () => {
    expect(nextChangeAfter('2026-06-01', config)).toBeNull();
    expect(nextChangeAfter('2030-01-01', config)).toBeNull();
  });
});

describe('checkAllocationNumber', () => {
  it('requires a number strictly above the threshold', () => {
    expect(check(5000.01, '2026-06-01').required).toBe(true);
    expect(check(6000, '2026-06-01').required).toBe(true);
  });
  it('does not require one at or below the threshold', () => {
    expect(check(5000, '2026-06-01').required).toBe(false);
    expect(check(4999.99, '2026-06-01').required).toBe(false);
    expect(check(0, '2026-06-01').required).toBe(false);
  });
  it('answers the same invoice differently across eras', () => {
    const amount = 12000;
    expect(check(amount, '2025-06-01').required).toBe(false); // 20,000 era
    expect(check(amount, '2026-02-01').required).toBe(true);  // 10,000 era
    expect(check(amount, '2026-06-01').required).toBe(true);  // 5,000 era
  });
  it('treats the amount as being before VAT', () => {
    // 4,500 before VAT is 5,310 with 18% VAT: over the line only if you use the wrong base.
    expect(check(4500, '2026-06-01').required).toBe(false);
    expect(check(5310, '2026-06-01').required).toBe(true);
  });
  it('excludes non-domestic-B2B invoices whatever the amount', () => {
    const r = check(500000, '2026-06-01', false);
    expect(r.required).toBe(false);
    expect(r.reason).toContain(SCOPE_NOTE);
    expect(r.marginIls).toBeNull();
  });
  it('refuses to answer on an invalid amount', () => {
    for (const bad of [NaN, -1, 'abc', Infinity, true, {}, []]) {
      const r = check(bad, '2026-06-01');
      expect(r.required).toBeNull();
      expect(r.reason).toContain('לא תקין');
    }
  });
  it('never turns an empty field into a confident "not required"', () => {
    // Number('') and Number(null) are both 0. A naive coercion would answer
    // "no allocation number needed" before the user typed anything.
    for (const empty of ['', '   ', null, undefined]) {
      const r = check(empty, '2026-06-01');
      expect(r.required).toBeNull();
      expect(r.reason).toBe('הזינו סכום לפני מע״מ.');
    }
  });
  it('accepts a numeric string, the way a form field supplies it', () => {
    expect(check('6000', '2026-06-01').required).toBe(true);
    expect(check(' 4000 ', '2026-06-01').required).toBe(false);
  });
  it('refuses to answer before the model started or on a bad date', () => {
    expect(check(9000, '2023-01-01').required).toBeNull();
    expect(check(9000, 'not-a-date').required).toBeNull();
  });
  it('reports the margin to the line and the coming change', () => {
    const r = check(11000, '2026-02-01');
    expect(r.threshold.amountIls).toBe(10000);
    expect(r.marginIls).toBe(1000);
    expect(r.next.amountIls).toBe(5000);
    expect(r.next.from).toBe('2026-06-01');
  });
  it('gives a negative margin below the line', () => {
    expect(check(8000, '2026-02-01').marginIls).toBe(-2000);
  });
  it('explains itself in Hebrew and cites the threshold in force', () => {
    expect(check(6000, '2026-06-01').reason).toContain('נדרש מספר הקצאה');
    expect(check(6000, '2026-06-01').reason).toContain('2026-06-01');
    expect(check(100, '2026-06-01').reason).toContain('לא נדרש');
  });
});

describe('proximityWarning', () => {
  it('warns just above the line', () => {
    expect(proximityWarning(check(5200, '2026-06-01'))).toMatch(/מלמעלה/);
  });
  it('warns just below the line', () => {
    expect(proximityWarning(check(4800, '2026-06-01'))).toMatch(/מלמטה/);
  });
  it('stays quiet far from the line', () => {
    expect(proximityWarning(check(50000, '2026-06-01'))).toBeNull();
    expect(proximityWarning(check(100, '2026-06-01'))).toBeNull();
  });
  it('stays quiet when there is no answer to be close to', () => {
    expect(proximityWarning(check(5200, '2026-06-01', false))).toBeNull();
    expect(proximityWarning(check(-5, '2026-06-01'))).toBeNull();
    expect(proximityWarning(null)).toBeNull();
  });
});
