import { round2 } from './money.js';
import defaultConfig from '../config/osek-patur.json' with { type: 'json' };

export const OSEK_PATUR_CEILING = defaultConfig.ceiling;
export const OSEK_PATUR_YEAR = defaultConfig.year;
export const DEFAULT_WARN_BAND = defaultConfig.warnBand;

export const MONTH_NAMES_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

/**
 * @param {number[]} months  12 entries of monthly turnover (₪). Missing/blank = 0.
 * @param {{ceiling?: number, warnBand?: number}} opts
 * @returns headroom analysis
 */
export function trackOsekPatur(months, opts = {}) {
  const ceiling = opts.ceiling ?? OSEK_PATUR_CEILING;
  const warnBand = opts.warnBand ?? DEFAULT_WARN_BAND;
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

export function statusLabelHe(status) {
  return {
    ok: 'במסגרת התקרה',
    warn: 'מתקרבים לתקרה',
    over: 'חריגה מהתקרה',
  }[status] ?? '';
}
