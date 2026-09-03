import { round0 } from './money.js';
import defaultConfig from '../config/tax-2026.json' with { type: 'json' };

export const TAX_CONFIG_2026 = defaultConfig;

/**
 * Progressive monthly income tax before credits.
 * @param {number} monthlyGross
 * @param {{upTo: number|null, rate: number}[]} brackets  ascending; last upTo may be null (open)
 */
export function incomeTaxBeforeCredits(monthlyGross, brackets = defaultConfig.incomeTax.monthlyBrackets) {
  const gross = Math.max(0, Number(monthlyGross) || 0);
  let tax = 0;
  let lower = 0;
  const slices = [];
  for (const b of brackets) {
    const upper = b.upTo == null ? Infinity : b.upTo;
    if (gross <= lower) break;
    const taxable = Math.min(gross, upper) - lower;
    const t = taxable * b.rate;
    slices.push({ from: lower, to: upper, rate: b.rate, taxable, tax: t });
    tax += t;
    lower = upper;
  }
  return { tax, slices };
}

/**
 * National insurance + health tax, employee share, two tiers with a cap.
 */
export function nationalInsurance(monthlyGross, ni = defaultConfig.nationalInsurance) {
  const gross = Math.max(0, Number(monthlyGross) || 0);
  const insurable = Math.min(gross, ni.maxInsurableIncome);
  const reducedPart = Math.min(insurable, ni.reducedTierUpTo);
  const fullPart = Math.max(0, insurable - ni.reducedTierUpTo);
  const bituachLeumi =
    reducedPart * ni.employee.reduced.nationalInsurance + fullPart * ni.employee.full.nationalInsurance;
  const health = reducedPart * ni.employee.reduced.health + fullPart * ni.employee.full.health;
  return { insurable, reducedPart, fullPart, bituachLeumi, health, total: bituachLeumi + health };
}

/**
 * Estimate monthly net salary for an employee.
 * @param {object} p
 * @param {number} p.gross            monthly gross (₪)
 * @param {number} [p.creditPoints]   נקודות זיכוי (default 2.25)
 * @param {number} [p.pensionRate]    employee pension contribution as fraction of gross (default 0)
 * @param {object} [p.config]         tax config (defaults to 2026)
 */
export function estimateNetSalary({ gross, creditPoints, pensionRate = 0, config = defaultConfig }) {
  const g = Math.max(0, Number(gross) || 0);
  const points = creditPoints == null ? config.incomeTax.defaultCreditPoints.male : Math.max(0, Number(creditPoints) || 0);
  const pension = Math.max(0, Math.min(1, Number(pensionRate) || 0));

  const { tax: rawTax, slices } = incomeTaxBeforeCredits(g, config.incomeTax.monthlyBrackets);
  const creditValue = points * config.incomeTax.creditPointMonthlyValue;
  const creditUsed = Math.min(rawTax, creditValue);
  const incomeTax = rawTax - creditUsed;

  const ni = nationalInsurance(g, config.nationalInsurance);
  const pensionDeduction = g * pension;

  const totalDeductions = incomeTax + ni.total + pensionDeduction;
  const net = g - totalDeductions;

  const marginalRate = slices.length ? slices[slices.length - 1].rate : 0;

  return {
    gross: round0(g),
    creditPoints: points,
    incomeTaxBeforeCredits: round0(rawTax),
    creditValue: round0(creditValue),
    creditUsed: round0(creditUsed),
    incomeTax: round0(incomeTax),
    bituachLeumi: round0(ni.bituachLeumi),
    health: round0(ni.health),
    pension: round0(pensionDeduction),
    totalDeductions: round0(totalDeductions),
    net: round0(net),
    effectiveRate: g ? Math.round((totalDeductions / g) * 1000) / 10 : 0,
    marginalRate,
    slices,
    verified: Boolean(config.verified),
  };
}
