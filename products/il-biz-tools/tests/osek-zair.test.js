// The בעל עסק זעיר self-check: taxable income under the 30% track against regular reporting.
//
// What the module may say is bounded by what the primary texts say (src/config/osek-zair.json):
//   - the track: turnover minus a deduction of 30% of turnover (Income Tax Ordinance 87ד(א), gazette p.172);
//   - regular reporting, as the page defines it: turnover minus the expenses the user enters;
//   - the cap: turnover "אינו עולה על" the עוסק פטור amount (87ב(1)), so turnover equal to the cap is under it;
//   - taxable income only, never tax: no text read gives the brackets or credit points, and the Tax Authority's own
//     report says almost 80% of the businesses it segmented by marginal rate do not reach the tax threshold;
//   - tax year 2026 is refused: its cap is CPI-linked and no primary text read states it (the one capture that did is
//     [robots-bar] since 6.10.2026, research/channel-loop/RULING-2026-10-06-robots-and-terms.md decision 1, and its
//     amount waits in src/config/osek-zair-unverified.json); a year no text read states (2027 on) is refused too;
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
const unverified = JSON.parse(readFileSync(join(productRoot, 'src/config/osek-zair-unverified.json'), 'utf8'));
const CAP = config.years['2025'].cap;

describe('the config the module computes with', () => {
  it('is the same object as the file, with the 30% rate and the 2024 and 2025 caps; 2026 is pending, not computed', () => {
    expect(OSEK_ZAIR_CONFIG).toEqual(config);
    expect(config.rate).toBe(0.3);
    expect(config.yearOfExitRate).toBe(0.3);
    expect(config.years['2024'].cap).toBe(120000);
    expect(config.years['2025'].cap).toBe(120000);
    expect(Object.keys(config.years).sort()).toEqual(['2024', '2025']);
    expect(Object.keys(config.pendingYears)).toEqual(['2026']);
    expect(config.years['2026']).toBeUndefined();
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

describe('ruling 6.10 row 21 (a): the [robots-bar] capture is no input, and 2026 waits for a primary text', () => {
  // research/channel-loop/RULING-2026-10-06-robots-and-terms.md, decision 1 and folds 3-4. check.vatLaw is the one
  // place the config may still name nevo or the amount: the ruling keeps it as the history of the 29.9 read.
  const RULING = 'research/channel-loop/RULING-2026-10-06-robots-and-terms.md';
  const withoutHistory = () => {
    const { vatLaw, ...check } = config.check;
    return JSON.stringify({ ...config, check });
  };
  const allCites = () => [
    ...Object.values(config.facts).flatMap((f) => f.cite),
    ...config.conditions.flatMap((c) => c.cite),
    ...Object.values(config.pendingYears).flatMap((p) => p.cite),
  ];

  it('the config has no vatLaw document, and nothing cites one or lists it in the source line', () => {
    expect(config.documents.vatLaw).toBeUndefined();
    expect(Object.keys(config.documents).sort()).toEqual(['draft', 'gazette', 'letter', 'regulations', 'report']);
    expect(config.sourceLine).toEqual(['gazette', 'report']);
    expect(allCites().filter((c) => c.doc === 'vatLaw')).toEqual([]);
    expect(config.facts.cap2026).toBeUndefined();
    expect(config.facts.vatSense).toBeUndefined();
  });

  it('the config says "nevo" (or נבו) nowhere and states no 122,833, outside the history check.vatLaw keeps', () => {
    const text = withoutHistory();
    expect(text).not.toMatch(/nevo|נבו/i);
    expect(text).not.toMatch(/122[,_]?833/);
    expect(text).not.toContain('nevo-vat-law');
  });

  it('check.vatLaw stays as history with the one added sentence of decision 1(5)', () => {
    expect(config.check.vatLaw.on).toBe('2026-09-29');
    expect(config.check.vatLaw.note.endsWith(`Read 29.9.2026; marked [robots-bar] 6.10.2026 (${RULING}, decision 1); no longer cited.`)).toBe(true);
    expect(config.about).toContain('[robots-bar]');
    expect(config.about).toContain(RULING);
  });

  it('2026 is in pendingYears and not in years, its sentences sourced to the gazette alone, and says when the tool will compute it', () => {
    expect(config.years['2026']).toBeUndefined();
    const p = config.pendingYears['2026'];
    expect(Object.keys(p)).toEqual(['he', 'unverifiedValueIn', 'cite']);
    expect(p.unverifiedValueIn).toBe('src/config/osek-zair-unverified.json');
    // The gazette carries both sentences; the report line beside them only names the law the gazette's image pages do
    // not (the page test's "a cite that names the Economic Efficiency Law" chain), and states no amount or date.
    expect(p.cite.map((c) => c.doc)).toEqual(['gazette', 'gazette', 'report']);
    expect(p.cite.map((c) => c.label ?? null)).toEqual(['חוק ההתייעלות הכלכלית, סעיף 37(ב)', 'פקודת מס הכנסה, סעיף 87ז(ב)', null]);
    expect(p.cite[2]).toEqual({ doc: 'report', lines: [11, 11], quote: 'התיקון לחוק אושר במסגרת חוק ההתייעלות הכלכלית' });
    expect(p.he.startsWith('לשנת המס 2026 הכלי לא מחשב.')).toBe(true);
    expect(p.he).toContain('מותאם למדד לראשונה ב-1 בינואר 2026');
    expect(p.he).toContain('אחרי שנקרא מקור ראשוני שמציין את הסכום המעודכן');
    expect(config.defaultYear).toBe('2025');
  });

  it('the unverified file holds the 2026 cap, 122,833, with the ruling\'s grade and the primary check still owed', () => {
    expect(unverified.verified).toBe(false);
    expect(Object.keys(unverified.years)).toEqual(['2026']);
    expect(unverified.years['2026']).toEqual({
      cap: 122833,
      grade: 'nevo capture [robots-bar] (ruling 6.10 row 21 (a)); not a product input',
      toVerify: unverified.years['2026'].toVerify,
    });
    for (const owed of ['Reshumot', 'a gov.il page of the Tax Authority', 'a Tax Authority circular']) {
      expect(unverified.years['2026'].toVerify).toContain(owed);
    }
    expect(unverified.about).toContain('only when a rendered primary text states it');
    expect(unverified.about).toContain('[robots-bar]');
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
  it('tax year 2026: refused, whatever the numbers, because no primary text read states its cap', () => {
    for (const turnover of [0, 50000, 200000]) {
      expect(compareTracks({ year: '2026', turnover, expenses: 0 })).toEqual({ status: 'refused', year: '2026', reason: 'pending' });
    }
    expect(compareTracks({ year: 2026, turnover: 1, expenses: 1 }).reason).toBe('pending');
  });

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
    const both = { ...config, years: { ...config.years, 2026: { cap: 1 } } };
    expect(compareTracks({ year: '2026', turnover: 0, expenses: 0 }, both)).toEqual({ status: 'refused', year: '2026', reason: 'pending' });
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

  it('2026: the refusal is the config\'s own text, word for word, and no verdict', () => {
    const r = resultHe(compareTracks({ year: '2026', turnover: 1000, expenses: 0 }));
    expect(r.cap).toBe(config.pendingYears['2026'].he);
    expect(r.capTone).toBe('warn');
    expect(r.verdict).toBeNull();
  });

  it('2027: refused in words, no verdict', () => {
    const r = resultHe(compareTracks({ year: '2027', turnover: 1000, expenses: 0 }));
    expect(r.cap).toBe('לשנת המס 2027 אין בכלי נתונים, ולכן הוא לא מחשב.');
    expect(r.capTone).toBe('warn');
    expect(r.verdict).toBeNull();
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
      resultHe(compareTracks({ year: '2026', turnover: 1, expenses: 1 })),
    ]
      .flatMap((r) => [r.cap, r.verdict, r.note].filter(Boolean));
    expect(texts.length).toBeGreaterThan(10);
    for (const t of texts) {
      expect(t).not.toMatch(MASCULINE_SINGULAR);
      expect(t).not.toMatch(TAX_CLAIM);
    }
  });
});
