// The בעל עסק זעיר self-check (osek-zair.html): taxable income from the business under the deemed-deduction
// track against regular reporting, and whether turnover is within the cap - for the tax years a primary text
// gives the cap for, and no other.
//
// Every figure comes from src/config/osek-zair.json, where each one carries the capture it was read in (a text
// capture by line, or the gazette by printed page with the quote transcribed in a dated read). This module holds
// no rate, cap or year of its own, so a figure cannot drift from its source line; tests/osek-zair.test.js greps
// it for literals.
//
// What it will not do:
//   - compute tax. No text read gives the brackets or credit points, and the Tax Authority's own report says
//     almost all of the businesses it segmented by marginal rate are under the tax threshold anyway; so the
//     result is taxable income, and says so;
//   - compute a year in `pendingYears` (the CPI-linked year: no text read states its cap). The unverified
//     amount lives in a separate config (named in the pending entry itself), which nothing here imports and the
//     build never ships;
//   - check the statutory conditions (books, the 25% related-party test, ...). The page lists them with their
//     sources for the reader to check.
// Pure: no DOM, no storage, no network. The page script (assets/page-osek-zair.js) only wires it to the form.
import config from '../config/osek-zair.json' with { type: 'json' };
import { round2, formatILS } from './money.js';
import { dateHe } from './source-line.js';

export const OSEK_ZAIR_CONFIG = config;

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj ?? {}, key);

/** An input value as a number: null when empty, NaN when not a non-negative finite number. */
function amountOf(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

/** The years the page offers: the verified ones newest first, then the pending ones, marked as not computed. */
export function offeredYears(cfg = config) {
  const available = Object.keys(cfg.years ?? {})
    .filter((y) => !has(cfg.pendingYears, y))
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({ year, available: true, cap: cfg.years[year].cap }));
  const pending = Object.keys(cfg.pendingYears ?? {})
    .sort((a, b) => Number(a) - Number(b))
    .map((year) => ({ year, available: false }));
  return [...available, ...pending];
}

/**
 * Compare the two ways of reporting for one tax year.
 *
 * @param {{year: string|number, turnover: number|string|null, expenses: number|string|null}} input
 *   turnover: the year's total turnover from all businesses and the occupation; expenses: what regular
 *   reporting would deduct. Strings as an input field gives them are accepted; '' means "not entered".
 * @returns one of
 *   {status: 'refused', year, reason: 'pending'|'unknown'|'unverified'}
 *   {status: 'incomplete', year, cap}                                  - no turnover yet
 *   {status: 'invalid', year, field: 'turnover'|'expenses'}
 *   {status: 'over-cap', year, cap, rate, turnover, overBy}             - the track is closed; no comparison
 *   {status: 'needs-expenses', year, cap, rate, turnover, headroom}     - under the cap, expenses not entered
 *   {status: 'compared', year, cap, rate, turnover, expenses, deduction, trackTaxable, regularTaxable,
 *    lower: 'track'|'regular'|'equal', by, expensesAboveTurnover}
 */
export function compareTracks({ year, turnover, expenses } = {}, cfg = config) {
  const y = String(year);
  if (has(cfg.pendingYears, y)) return { status: 'refused', year: y, reason: 'pending' };
  if (!has(cfg.years, y)) return { status: 'refused', year: y, reason: 'unknown' };
  if (cfg.verified !== true) return { status: 'refused', year: y, reason: 'unverified' };

  const cap = cfg.years[y].cap;
  const rate = cfg.rate;
  const t = amountOf(turnover);
  if (t === null) return { status: 'incomplete', year: y, cap };
  if (Number.isNaN(t)) return { status: 'invalid', year: y, field: 'turnover' };
  // The cap is "אינו עולה על": equal to it is within it.
  if (t > cap) return { status: 'over-cap', year: y, cap, rate, turnover: t, overBy: round2(t - cap) };

  const e = amountOf(expenses);
  if (e === null) return { status: 'needs-expenses', year: y, cap, rate, turnover: t, headroom: round2(cap - t) };
  if (Number.isNaN(e)) return { status: 'invalid', year: y, field: 'expenses' };

  const deduction = round2(t * rate);
  const trackTaxable = round2(t - deduction);
  const regularTaxable = round2(t - e);
  const diff = round2(trackTaxable - regularTaxable);
  return {
    status: 'compared',
    year: y,
    cap,
    rate,
    turnover: t,
    expenses: e,
    deduction,
    trackTaxable,
    regularTaxable,
    lower: diff > 0 ? 'regular' : diff < 0 ? 'track' : 'equal',
    by: Math.abs(diff),
    expensesAboveTurnover: e > t,
  };
}

/** A shekel amount: whole shekels when it is whole, agorot when it is not. */
const ils = (n) => formatILS(n, { decimals: Number.isInteger(n) ? 0 : 2 });
const pct = (rate) => `${round2(rate * 100)}%`;

const NOT_TAX = 'זו השוואה של הכנסה חייבת, לא של מס.';

/**
 * The Hebrew the result area shows, addressed in the plural: the cap line with its own tone, and the verdict with
 * its own (an under-cap line is "ok" even when the verdict is that the track loses).
 * @returns {{capTone: Tone, cap: string, tone: Tone, verdict: string|null, note: string|null}}
 *   where Tone is 'ok'|'warn'|'over'|'neutral'
 */
export function resultHe(r, cfg = config) {
  const out = (capTone, cap, tone = 'neutral', verdict = null, note = null) => ({ capTone, cap, tone, verdict, note });
  switch (r?.status) {
    case 'refused':
      if (r.reason === 'pending') return out('warn', cfg.pendingYears[r.year].he);
      if (r.reason === 'unverified') return out('warn', 'נתוני הכלי אינם מסומנים כנבדקים, ולכן הוא לא מחשב.');
      return out('warn', `לשנת המס ${r.year} אין בכלי נתונים, ולכן הוא לא מחשב.`);
    case 'incomplete':
      return out('neutral', 'הזינו את מחזור העסקאות בשנה כדי לבדוק אותו מול התקרה.');
    case 'invalid':
      return out('warn', r.field === 'expenses' ? 'ההוצאות צריכות להיות מספר, אפס או יותר.' : 'המחזור צריך להיות מספר, אפס או יותר.');
    case 'over-cap':
      return out(
        'over',
        `המחזור (${ils(r.turnover)}) גבוה מהתקרה לשנת המס ${r.year} (${ils(r.cap)}) ב-${ils(r.overBy)}. ` +
          `מחזור שעולה על התקרה אינו מאפשר את המסלול (${cfg.facts.cap.cite[0].label}).`,
        'neutral',
        'לכן אין כאן השוואה בין המסלולים.',
      );
    default:
      break;
  }
  const underCap =
    `המחזור (${ils(r.turnover)}) אינו עולה על התקרה לשנת המס ${r.year} (${ils(r.cap)}). ` +
    'המסלול פתוח רק אם מתקיימים גם התנאים שבהמשך.';
  if (r?.status === 'needs-expenses') return out('ok', underCap, 'neutral', 'הזינו גם את ההוצאות בפועל כדי להשוות בין המסלולים.');
  if (r?.status !== 'compared') return out('neutral', 'הזינו את מחזור העסקאות בשנה כדי לבדוק אותו מול התקרה.');

  const share = `${pct(r.rate)} מהמחזור (${ils(r.deduction)})`;
  let verdict;
  let tone = 'ok';
  if (r.lower === 'track') {
    verdict = `במסלול בעל עסק זעיר ההכנסה החייבת מהעסק נמוכה יותר ב-${ils(r.by)}: ההוצאות שהזנתם (${ils(r.expenses)}) נמוכות מ-${share}.`;
  } else if (r.lower === 'regular') {
    tone = 'warn';
    verdict =
      `בדיווח רגיל ההכנסה החייבת מהעסק נמוכה יותר ב-${ils(r.by)}: ההוצאות שהזנתם (${ils(r.expenses)}) גבוהות מ-${share}. ` +
      'במקרה כזה מסלול בעל עסק זעיר מפסיד.';
  } else {
    verdict = `ההכנסה החייבת מהעסק זהה בשני המסלולים: ההוצאות שהזנתם שוות ל-${share}.`;
  }
  const note = r.expensesAboveTurnover
    ? 'ההוצאות שהזנתם גבוהות מהמחזור, ולכן בדיווח רגיל יוצא מספר שלילי. הכלי לא בודק מה קורה במקרה כזה.'
    : null;
  return out('ok', underCap, tone, `${verdict} ${NOT_TAX}`, note);
}

/** Pages of a gazette cite, as the page prints them: "עמ' 172" or "עמ' 172–173". */
const pagesOf = (cite) => {
  const pages = cite.pages ?? (cite.page !== undefined ? [cite.page] : []);
  if (!pages.length) return '';
  return `עמ' ${pages.length === 1 ? pages[0] : `${pages[0]}–${pages[pages.length - 1]}`}`;
};

/** One cite as the page prints it: the section and the document for the gazette, the document for the rest. */
export function citeHe(cite, cfg = config) {
  const doc = cfg.documents[cite.doc];
  if (!doc) throw new Error(`unknown document ${cite.doc}`);
  if (cite.doc === 'gazette') return `${cite.label} – ${doc.he}, ${pagesOf(cite)}`;
  return doc.he;
}

/** Every cite of a fact, deduplicated, joined as the page prints them after "מקור:". */
export function citesHe(cites, cfg = config) {
  return [...new Set(cites.map((c) => citeHe(c, cfg)))].join('; ');
}

/**
 * The line right after the lead: the documents the figures are read in, and when they were read. Only for a
 * verified config with a dated read; the copies are third-party, and the line says so.
 */
export function trackSourceLineHe(cfg = config) {
  if (cfg?.verified !== true) throw new Error('only a verified config gets a source line');
  const check = cfg.check;
  if (check?.how !== 'read' || typeof check.record !== 'string' || !check.record.trim()) {
    throw new Error('the osek-zair source line needs a dated read with a record');
  }
  const names = cfg.sourceLine.map((id) => cfg.documents[id].he);
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} ו${names[names.length - 1]}`;
  return `מקור: ${list} (עותקים באתר capitax.co.il) · נבדק: ${dateHe(check.on)}`;
}
