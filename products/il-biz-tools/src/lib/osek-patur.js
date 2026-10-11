// The osek patur ceiling tracker (osek-patur.html): monthly turnover against the ceiling of one tax year - for the
// tax years a primary text gives the ceiling for, and no other.
//
// Every figure comes from src/config/osek-patur.json, where each year's ceiling carries the gazette page it was read
// on. This module holds no ceiling or year of its own (tests/osek-patur.test.js greps it for literals). It computes
// only for a year in `years`; a year in `pendingYears` (a CPI-linked year whose amount no primary text read states)
// and a year in neither map are refused, not computed (the osek-patur ceiling ruling of 11.10, research/channel-loop/,
// decision 2(3)). The unverified amount lives in a separate config, named in the pending entry itself, which nothing
// here imports and the build never ships. Pure: no DOM, no storage, no network. The page script
// (assets/page-osek-patur.js) wires it to the form.
import { round2 } from './money.js';
import config from '../config/osek-patur.json' with { type: 'json' };

export const OSEK_PATUR_CONFIG = config;
export const DEFAULT_WARN_BAND = config.warnBand;

export const MONTH_NAMES_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj ?? {}, key);

/** The years the page offers: the verified ones newest first, then the pending ones, marked as not computed. */
export function offeredYears(cfg = config) {
  const available = Object.keys(cfg.years ?? {})
    .filter((y) => !has(cfg.pendingYears, y))
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({ year, available: true, ceiling: cfg.years[year].ceiling }));
  const pending = Object.keys(cfg.pendingYears ?? {})
    .sort((a, b) => Number(a) - Number(b))
    .map((year) => ({ year, available: false }));
  return [...available, ...pending];
}

/**
 * The ceiling of one tax year: {status: 'ok', year, ceiling}, or {status: 'refused', year, reason} with reason
 * 'pending', 'unknown' or 'unverified'.
 */
export function ceilingFor(year, cfg = config) {
  const y = String(year);
  if (has(cfg.pendingYears, y)) return { status: 'refused', year: y, reason: 'pending' };
  if (!has(cfg.years, y)) return { status: 'refused', year: y, reason: 'unknown' };
  if (cfg.verified !== true) return { status: 'refused', year: y, reason: 'unverified' };
  return { status: 'ok', year: y, ceiling: cfg.years[y].ceiling };
}

/**
 * @param {number[]} months  12 entries of monthly turnover (₪). Missing/blank = 0.
 * opts: {year, warnBand?} - the tax year, and the warning band (default: the config's); cfg: the config (default:
 * src/config/osek-patur.json). Returns {status: 'refused', year, reason} for a year the tool does not compute, else
 * the headroom analysis.
 */
export function trackOsekPatur(months, opts = {}, cfg = config) {
  const c = ceilingFor(opts.year, cfg);
  if (c.status === 'refused') return c;
  const { ceiling, year } = c;
  const warnBand = opts.warnBand ?? cfg.warnBand;
  if (!(ceiling > 0)) throw new RangeError('ceiling must be positive');

  const values = Array.from({ length: 12 }, (_, i) => {
    const v = Number(months?.[i]);
    return Number.isFinite(v) && v > 0 ? v : 0;
  });

  const total = round2(values.reduce((a, b) => a + b, 0));
  const remaining = round2(ceiling - total);
  const usedRatio = total / ceiling;

  const filledMonths = values.filter((v) => v > 0).length;
  const monthlyAverage = filledMonths ? round2(total / filledMonths) : 0;
  const projectedAnnual = round2(monthlyAverage * 12);
  const monthsLeft = 12 - filledMonths;
  const safeMonthlyAverage = monthsLeft > 0 && remaining > 0 ? round2(remaining / monthsLeft) : 0;

  let status = 'ok';
  if (total > ceiling) status = 'over';
  else if (usedRatio >= warnBand) status = 'warn';

  let projectionStatus = 'ok';
  if (projectedAnnual > ceiling) projectionStatus = 'over';
  else if (projectedAnnual >= ceiling * warnBand) projectionStatus = 'warn';

  return {
    year,
    ceiling,
    total,
    remaining,
    usedRatio: round2(usedRatio),
    usedPercent: Math.round(usedRatio * 100),
    status,
    filledMonths,
    monthlyAverage,
    projectedAnnual,
    projectionStatus,
    monthsLeft,
    safeMonthlyAverage,
  };
}

/** What the result box says for a year the tool does not compute: the pending year's own sentence, or why not. */
export function refusalHe(r, cfg = config) {
  if (r?.reason === 'pending') return cfg.pendingYears[r.year].he;
  if (r?.reason === 'unverified') return 'נתוני הכלי אינם מסומנים כנבדקים, ולכן הוא לא מחשב.';
  return `לשנת ${r?.year} אין בכלי נתונים, ולכן הוא לא מחשב.`;
}

export function statusLabelHe(status) {
  return {
    ok: 'במסגרת התקרה',
    warn: 'מתקרבים לתקרה',
    over: 'חריגה מהתקרה',
  }[status] ?? '';
}
