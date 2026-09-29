// The בעל עסק זעיר self-check: taxable income under the 30% track against regular reporting.
//
// What the module may say is bounded by what the primary texts say (src/config/osek-zair.json):
//   - the track: turnover minus a deduction of 30% of turnover (Income Tax Ordinance 87ד(א), gazette p.172);
//   - regular reporting, as the page defines it: turnover minus the expenses the user enters;
//   - the cap: turnover "אינו עולה על" the עוסק פטור amount (87ב(1)), so turnover equal to the cap is under it;
//   - taxable income only, never tax: no text read gives the brackets or credit points, and the Tax Authority's own
//     report says almost 80% of the businesses it segmented by marginal rate do not reach the tax threshold;
//   - tax year 2026 computes with 122,833, the amount nevo's consolidated text of the VAT law (current to 13-07-2026)
//     states; a year no text read states (2027 on) is refused;
//   - over the cap there is no comparison, but the result names section 87ד(ג): someone registered at the start of
//     the year who stops qualifying during it may still deduct, up to 30% of the cap (gazette p.172);
//   - when regular reporting wins, the verdict carries the two-year cooling-off of 87ה(ב) (gazette p.173).
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
import { MASCULINE_SINGULAR, TAX_CLAIM } from './helpers/hebrew.js';

const config = JSON.parse(readFileSync(join(productRoot, 'src/config/osek-zair.json'), 'utf8'));
const CAP = config.years['2025'].cap;

describe('the config the module computes with', () => {
  it('is the same object as the file, with the 30% rate, the 2024 and 2025 caps and the 2026 cap', () => {
    expect(OSEK_ZAIR_CONFIG).toEqual(config);
    expect(config.rate).toBe(0.3);
    expect(config.yearOfExitRate).toBe(0.3);
    expect(config.years['2024'].cap).toBe(120000);
    expect(config.years['2025'].cap).toBe(120000);
    expect(config.years['2026'].cap).toBe(122833);
    expect(Object.keys(config.years).sort()).toEqual(['2024', '2025', '2026']);
    expect(config.pendingYears).toEqual({});
  });

  it('hard-codes no figure: the module reads the rate and the caps only from the config', () => {
    const src = readFileSync(join(productRoot, 'src/lib/osek-zair.js'), 'utf8');
    expect(src).not.toMatch(/120[,_]?000|0\.3\b|\b30\b|2024|2025|2026|122[,_]?833/);
    const custom = { ...config, rate: 0.25, yearOfExitRate: 0.2, years: { 2030: { cap: 50000 } }, pendingYears: {} };
    const r = compareTracks({ year: 2030, turnover: 40000, expenses: 0 }, custom);
    expect(r).toMatchObject({ status: 'compared', cap: 50000, rate: 0.25, deduction: 10000, trackTaxable: 30000 });
    expect(compareTracks({ year: 2030, turnover: 50001, expenses: 0 }, custom)).toMatchObject({ status: 'over-cap', exitCeiling: 10000 });
  });
});

describe('the cap: "אינו עולה על" (87ב(1))', () => {
  it('turnover exactly at the cap is under it, and the comparison runs', () => {
    const r = compareTracks({ year: '2025', turnover: CAP, expenses: 10000 });
    expect(r.status).toBe('compared');
    expect(r.cap).toBe(CAP);
  });

  it('one agora above the cap is over it: no comparison, by how much, and the 87ד(ג) ceiling (30% of the cap)', () => {
    const r = compareTracks({ year: '2025', turnover: CAP + 0.01, expenses: 10000 });
    expect(r).toEqual({ status: 'over-cap', year: '2025', cap: CAP, rate: 0.3, turnover: CAP + 0.01, overBy: 0.01, exitCeiling: 36000 });
    expect(r.trackTaxable).toBeUndefined();
  });

  it('one shekel under the cap is under it; a shekel over is over', () => {
    expect(compareTracks({ year: 2024, turnover: CAP - 1, expenses: 0 }).status).toBe('compared');
    expect(compareTracks({ year: 2024, turnover: CAP + 1, expenses: 0 })).toMatchObject({ status: 'over-cap', overBy: 1 });
  });
});

describe('tax year 2026: its own cap, 122,833, under the same "אינו עולה על"', () => {
  const CAP_2026 = config.years['2026'].cap;

  it('turnover exactly at the 2026 cap is under it, and the comparison runs with the 30% rate', () => {
    expect(compareTracks({ year: '2026', turnover: CAP_2026, expenses: 0 })).toMatchObject({
      status: 'compared', year: '2026', cap: 122833, rate: 0.3, deduction: 36849.9, trackTaxable: 85983.1, regularTaxable: 122833,
    });
  });

  it('one shekel over is over, with the 87ד(ג) ceiling of 30% of the 2026 cap', () => {
    expect(compareTracks({ year: 2026, turnover: CAP_2026 + 1, expenses: 0 })).toEqual({
      status: 'over-cap', year: '2026', cap: 122833, rate: 0.3, turnover: 122834, overBy: 1, exitCeiling: 36849.9,
    });
  });

  it('a turnover over the 2025 cap and within the 2026 cap: over in 2025, compared in 2026', () => {
    expect(compareTracks({ year: '2025', turnover: 121000, expenses: 10000 }).status).toBe('over-cap');
    expect(compareTracks({ year: '2026', turnover: 121000, expenses: 10000 })).toMatchObject({ status: 'compared', lower: 'track' });
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
  it('tax year 2027 and later: refused, whatever the numbers, because no text read states their cap', () => {
    for (const year of ['2027', 2028, '2030']) {
      for (const turnover of [0, 50000, 200000]) {
        expect(compareTracks({ year, turnover, expenses: 0 })).toEqual({ status: 'refused', year: String(year), reason: 'unknown' });
      }
    }
  });

  it('a year the config does not know, and a config that is not verified', () => {
    expect(compareTracks({ year: '2023', turnover: 1, expenses: 1 })).toEqual({ status: 'refused', year: '2023', reason: 'unknown' });
    expect(compareTracks({ year: '2025', turnover: 1, expenses: 1 }, { ...config, verified: false })).toEqual({ status: 'refused', year: '2025', reason: 'unverified' });
  });

  it('a pending year stays refused even if someone adds it to `years` without removing it from `pendingYears`', () => {
    const both = { ...config, years: { ...config.years, 2027: { cap: 1 } }, pendingYears: { 2027: { he: 'x', cite: [] } } };
    expect(compareTracks({ year: '2027', turnover: 0, expenses: 0 }, both)).toEqual({ status: 'refused', year: '2027', reason: 'pending' });
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
  it('the three years with a cap, newest first, and no year marked as not computed', () => {
    expect(offeredYears()).toEqual([
      { year: '2026', available: true, cap: 122833 },
      { year: '2025', available: true, cap: 120000 },
      { year: '2024', available: true, cap: 120000 },
    ]);
  });

  it('a pending year, when a config has one, comes after them, marked as not computed', () => {
    const withPending = { ...config, pendingYears: { 2027: { he: 'x', cite: [] } } };
    expect(offeredYears(withPending).map((y) => [y.year, y.available])).toEqual([['2026', true], ['2025', true], ['2024', true], ['2027', false]]);
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

  it('regular lower: the verdict also carries the two-year cooling-off (87ה(ב)), with its section, before anyone leaves', () => {
    const { coolingOff } = config.facts;
    const r = say({ turnover: 100000, expenses: 45000 });
    expect(r.verdict).toContain(coolingOff.he);
    expect(r.verdict).toContain(coolingOff.cite[0].label);
    expect(r.verdict).toContain('יציאה מהמסלול');
    // Only when leaving is on the table.
    expect(say({ turnover: 100000, expenses: 10000 }).verdict).not.toContain(coolingOff.he);
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
    expect(over.cap).toContain('אינו בעל עסק זעיר באותה שנה');
    expect(over.verdict).toContain('לא משווה כאן בין המסלולים');
  });

  it('over the cap: never says the deduction is gone; names the 87ד(ג) exception and its ceiling, 30% of the cap', () => {
    const { yearOfExit } = config.facts;
    const over = say({ turnover: 130000, expenses: 20000 });
    const text = `${over.cap} ${over.verdict}`;
    expect(text).not.toMatch(/אינו מאפשר את המסלול|אין ניכוי|לא ניתן לנכות/);
    expect(over.verdict).toContain('אם הייתם רשומים כבעלי עסק זעיר בתחילת שנת המס');
    expect(over.verdict).toContain(yearOfExit.cite[0].label);
    expect(over.verdict).toContain(`${config.yearOfExitRate * 100}% מהתקרה (${ils(CAP * config.yearOfExitRate)})`);
    expect(over.verdict).toContain('המסלול לפי החוק');
  });

  it('2026: the cap line names the 2026 cap', () => {
    const r = resultHe(compareTracks({ year: '2026', turnover: 121000, expenses: 0 }));
    expect(r.capTone).toBe('ok');
    expect(r.cap).toContain(`לשנת המס 2026 (${ils(122833)})`);
  });

  it('2027: refused in words, no verdict; a pending year (when a config has one) is refused in the config\'s own text', () => {
    const r = resultHe(compareTracks({ year: '2027', turnover: 1000, expenses: 0 }));
    expect(r.cap).toBe('לשנת המס 2027 אין בכלי נתונים, ולכן הוא לא מחשב.');
    expect(r.capTone).toBe('warn');
    expect(r.verdict).toBeNull();
    const withPending = { ...config, pendingYears: { 2027: { he: 'טקסט הסירוב של הקונפיג.', cite: [] } } };
    expect(resultHe(compareTracks({ year: '2027', turnover: 1, expenses: 0 }, withPending), withPending).cap).toBe('טקסט הסירוב של הקונפיג.');
  });

  it('never states a tax amount, and never addresses the reader in the masculine singular', () => {
    const inputs = [
      { turnover: 100000, expenses: 10000 }, { turnover: 100000, expenses: 45000 }, { turnover: 100000, expenses: 30000 },
      { turnover: 0, expenses: 500 }, { turnover: CAP + 1, expenses: 0 }, { turnover: 100000, expenses: '' }, { turnover: '', expenses: '' },
      { turnover: -1, expenses: 0 },
    ];
    const texts = [
      ...inputs.map((i) => say(i)),
      resultHe(compareTracks({ year: '2027', turnover: 1, expenses: 1 })),
      resultHe(compareTracks({ year: '2026', turnover: 100000, expenses: 45000 })),
    ]
      .flatMap((r) => [r.cap, r.verdict, r.note].filter(Boolean));
    expect(texts.length).toBeGreaterThan(10);
    for (const t of texts) {
      expect(t).not.toMatch(MASCULINE_SINGULAR);
      expect(t).not.toMatch(TAX_CLAIM);
    }
  });
});
