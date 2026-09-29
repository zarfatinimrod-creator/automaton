// The בעל עסק זעיר self-check: taxable income under the 30% track against regular reporting.
//
// What the module may say is bounded by what the primary texts say (src/config/osek-zair.json):
//   - the track: turnover minus a deduction of 30% of turnover (Income Tax Ordinance 87ד(א), gazette p.172);
//   - regular reporting, as the page defines it: turnover minus the expenses the user enters;
//   - the cap: turnover "אינו עולה על" the עוסק פטור amount (87ב(1)), so turnover equal to the cap is under it;
//   - taxable income only, never tax: no text read gives the brackets or credit points, and the Tax Authority's own
//     report says almost 80% of the businesses it segmented by marginal rate do not reach the tax threshold;
//   - tax year 2026 is refused: its cap is CPI-linked and no text read states it.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  OSEK_ZAIR_CONFIG,
  compareTracks,
  offeredYears,
  resultHe,
} from '../src/lib/osek-zair.js';
import { formatILS } from '../src/lib/money.js';
import { productRoot } from './helpers/product-copy.js';
import { MASCULINE_SINGULAR } from './helpers/hebrew.js';

const config = JSON.parse(readFileSync(join(productRoot, 'src/config/osek-zair.json'), 'utf8'));
const CAP = config.years['2025'].cap;

describe('the config the module computes with', () => {
  it('is the same object as the file, with the 30% rate and the 2024 and 2025 caps', () => {
    expect(OSEK_ZAIR_CONFIG).toEqual(config);
    expect(config.rate).toBe(0.3);
    expect(config.years['2024'].cap).toBe(120000);
    expect(config.years['2025'].cap).toBe(120000);
    expect(Object.keys(config.pendingYears)).toEqual(['2026']);
    expect(config.years['2026']).toBeUndefined();
  });

  it('hard-codes no figure: the module reads the rate and the caps only from the config', () => {
    const src = readFileSync(join(productRoot, 'src/lib/osek-zair.js'), 'utf8');
    expect(src).not.toMatch(/120[,_]?000|0\.3\b|\b30\b|2024|2025|2026|122[,_]?833/);
    const custom = { ...config, rate: 0.25, years: { 2030: { cap: 50000 } }, pendingYears: {} };
    const r = compareTracks({ year: 2030, turnover: 40000, expenses: 0 }, custom);
    expect(r).toMatchObject({ status: 'compared', cap: 50000, rate: 0.25, deduction: 10000, trackTaxable: 30000 });
    expect(compareTracks({ year: 2030, turnover: 50001, expenses: 0 }, custom).status).toBe('over-cap');
  });
});

describe('the cap: "אינו עולה על" (87ב(1))', () => {
  it('turnover exactly at the cap is under it, and the comparison runs', () => {
    const r = compareTracks({ year: '2025', turnover: CAP, expenses: 10000 });
    expect(r.status).toBe('compared');
    expect(r.cap).toBe(CAP);
  });

  it('one agora above the cap is over it: no comparison, and by how much', () => {
    const r = compareTracks({ year: '2025', turnover: CAP + 0.01, expenses: 10000 });
    expect(r).toEqual({ status: 'over-cap', year: '2025', cap: CAP, rate: 0.3, turnover: CAP + 0.01, overBy: 0.01 });
    expect(r.trackTaxable).toBeUndefined();
  });

  it('one shekel under the cap is under it; a shekel over is over', () => {
    expect(compareTracks({ year: 2024, turnover: CAP - 1, expenses: 0 }).status).toBe('compared');
    expect(compareTracks({ year: 2024, turnover: CAP + 1, expenses: 0 })).toMatchObject({ status: 'over-cap', overBy: 1 });
  });
});

describe('the comparison: taxable income from the business, never tax', () => {
  it('expenses equal to 30% of turnover: the same taxable income both ways', () => {
    const r = compareTracks({ year: '2025', turnover: 100000, expenses: 30000 });
    expect(r).toMatchObject({ status: 'compared', deduction: 30000, trackTaxable: 70000, regularTaxable: 70000, lower: 'equal', by: 0 });
  });

  it('expenses above 30%: regular reporting is lower, by the excess over 30% - the track loses', () => {
    const r = compareTracks({ year: '2025', turnover: 100000, expenses: 45000 });
    expect(r).toMatchObject({ trackTaxable: 70000, regularTaxable: 55000, lower: 'regular', by: 15000, expensesAboveTurnover: false });
  });

  it('expenses under 30%: the track is lower, by the shortfall', () => {
    const r = compareTracks({ year: '2024', turnover: 100000, expenses: 10000 });
    expect(r).toMatchObject({ trackTaxable: 70000, regularTaxable: 90000, lower: 'track', by: 20000 });
  });

  it('no expenses at all: the track is lower by the whole 30%', () => {
    expect(compareTracks({ year: '2025', turnover: 80000, expenses: 0 })).toMatchObject({ deduction: 24000, trackTaxable: 56000, regularTaxable: 80000, lower: 'track', by: 24000 });
  });

  it('zero turnover and zero expenses: zero both ways, equal', () => {
    expect(compareTracks({ year: '2025', turnover: 0, expenses: 0 })).toMatchObject({ status: 'compared', deduction: 0, trackTaxable: 0, regularTaxable: 0, lower: 'equal', by: 0 });
  });

  it('expenses above turnover: regular reporting goes negative, and the result says so rather than hide it', () => {
    const r = compareTracks({ year: '2025', turnover: 0, expenses: 500 });
    expect(r).toMatchObject({ trackTaxable: 0, regularTaxable: -500, lower: 'regular', by: 500, expensesAboveTurnover: true });
  });

  it('works in agorot without floating-point drift', () => {
    const r = compareTracks({ year: '2025', turnover: 33333.33, expenses: 1234.56 });
    expect(r.deduction).toBe(10000);
    expect(r.trackTaxable).toBe(23333.33);
    expect(r.regularTaxable).toBe(32098.77);
    expect(r.by).toBe(8765.44);
    const tenth = compareTracks({ year: '2025', turnover: 0.1, expenses: 0.03 });
    expect(tenth).toMatchObject({ deduction: 0.03, lower: 'equal', by: 0 });
  });

  it('accepts the raw strings an input field gives', () => {
    expect(compareTracks({ year: '2025', turnover: '100000', expenses: '45000' })).toMatchObject({ lower: 'regular', by: 15000 });
  });
});

describe('what the module refuses', () => {
  it('tax year 2026: refused, whatever the numbers, because its cap is not in any text read', () => {
    for (const turnover of [0, 50000, 200000]) {
      expect(compareTracks({ year: '2026', turnover, expenses: 0 })).toEqual({ status: 'refused', year: '2026', reason: 'pending' });
    }
    expect(compareTracks({ year: 2026, turnover: 1, expenses: 1 }).reason).toBe('pending');
  });

  it('a year the config does not know, and a config that is not verified', () => {
    expect(compareTracks({ year: '2023', turnover: 1, expenses: 1 })).toEqual({ status: 'refused', year: '2023', reason: 'unknown' });
    expect(compareTracks({ year: '2025', turnover: 1, expenses: 1 }, { ...config, verified: false })).toEqual({ status: 'refused', year: '2025', reason: 'unverified' });
  });

  it('a pending year stays refused even if someone adds it to `years` without removing it from `pendingYears`', () => {
    const both = { ...config, years: { ...config.years, 2026: { cap: 1 } } };
    expect(compareTracks({ year: '2026', turnover: 0, expenses: 0 }, both).status).toBe('refused');
  });

  it('negative or non-numeric input is invalid, and names the field', () => {
    expect(compareTracks({ year: '2025', turnover: -1, expenses: 0 })).toMatchObject({ status: 'invalid', field: 'turnover' });
    expect(compareTracks({ year: '2025', turnover: 'abc', expenses: 0 })).toMatchObject({ status: 'invalid', field: 'turnover' });
    expect(compareTracks({ year: '2025', turnover: 1000, expenses: -5 })).toMatchObject({ status: 'invalid', field: 'expenses' });
    expect(compareTracks({ year: '2025', turnover: Infinity, expenses: 0 })).toMatchObject({ status: 'invalid', field: 'turnover' });
  });

  it('an empty turnover asks for it; an empty expenses field still answers the cap question', () => {
    expect(compareTracks({ year: '2025', turnover: '', expenses: '' })).toEqual({ status: 'incomplete', year: '2025', cap: CAP });
    expect(compareTracks({ year: '2025', turnover: 100000, expenses: '' })).toEqual({ status: 'needs-expenses', year: '2025', cap: CAP, rate: 0.3, turnover: 100000, headroom: 20000 });
    expect(compareTracks({ year: '2025', turnover: 130000, expenses: null }).status).toBe('over-cap');
  });
});

describe('the years the page offers', () => {
  it('the verified years newest first, then 2026 marked as not computed', () => {
    expect(offeredYears()).toEqual([
      { year: '2025', available: true, cap: 120000 },
      { year: '2024', available: true, cap: 120000 },
      { year: '2026', available: false },
    ]);
  });
});

describe('what the result says (resultHe)', () => {
  const say = (input) => resultHe(compareTracks({ year: '2025', ...input }));
  const ils = (n) => formatILS(n, { decimals: Number.isInteger(n) ? 0 : 2 });

  it('track lower: names the gap as taxable income, and says it is not tax', () => {
    const r = say({ turnover: 100000, expenses: 10000 });
    expect(r.tone).toBe('ok');
    expect(r.verdict).toContain('במסלול בעל עסק זעיר ההכנסה החייבת מהעסק נמוכה יותר');
    expect(r.verdict).toContain(ils(20000));
    expect(r.verdict).toContain('זו השוואה של הכנסה חייבת, לא של מס.');
  });

  it('regular lower: says in so many words that the 30% track loses here; the cap line stays "within" (its own tone)', () => {
    const r = say({ turnover: 100000, expenses: 45000 });
    expect(r.tone).toBe('warn');
    expect(r.capTone).toBe('ok');
    expect(r.verdict).toContain('בדיווח רגיל ההכנסה החייבת מהעסק נמוכה יותר');
    expect(r.verdict).toContain('מסלול בעל עסק זעיר מפסיד');
    expect(r.verdict).toContain(ils(15000));
  });

  it('equal: says they are the same', () => {
    expect(say({ turnover: 100000, expenses: 30000 }).verdict).toContain('זהה בשני המסלולים');
  });

  it('expenses above turnover: a note says the tool does not follow what happens then', () => {
    expect(say({ turnover: 1000, expenses: 5000 }).note).toContain('הכלי לא בודק מה קורה במקרה כזה');
    expect(say({ turnover: 5000, expenses: 1000 }).note).toBeNull();
  });

  it('the cap line: under, at and over the cap', () => {
    expect(say({ turnover: CAP, expenses: 0 }).cap).toContain('אינו עולה על התקרה');
    const over = say({ turnover: CAP + 500, expenses: 0 });
    expect(over.capTone).toBe('over');
    expect(over.tone).toBe('neutral');
    expect(over.cap).toContain(ils(500));
    expect(over.cap).toContain(config.facts.cap.cite[0].label);
    expect(over.verdict).toContain('אין כאן השוואה');
  });

  it('2026: the refusal is the config\'s own text, word for word', () => {
    const r = resultHe(compareTracks({ year: '2026', turnover: 1000, expenses: 0 }));
    expect(r.cap).toBe(config.pendingYears['2026'].he);
    expect(r.capTone).toBe('warn');
    expect(r.verdict).toBeNull();
  });

  it('never states a tax amount, and never addresses the reader in the masculine singular', () => {
    const inputs = [
      { turnover: 100000, expenses: 10000 }, { turnover: 100000, expenses: 45000 }, { turnover: 100000, expenses: 30000 },
      { turnover: 0, expenses: 500 }, { turnover: CAP + 1, expenses: 0 }, { turnover: 100000, expenses: '' }, { turnover: '', expenses: '' },
      { turnover: -1, expenses: 0 },
    ];
    const texts = [...inputs.map((i) => say(i)), resultHe(compareTracks({ year: '2026', turnover: 1, expenses: 1 }))]
      .flatMap((r) => [r.cap, r.verdict, r.note].filter(Boolean));
    expect(texts.length).toBeGreaterThan(10);
    for (const t of texts) {
      expect(t).not.toMatch(MASCULINE_SINGULAR);
      expect(t).not.toMatch(/מס לתשלום|תשלמו|החיסכון במס|חיסכון של|תחסכו/);
    }
  });
});
