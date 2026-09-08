import { describe, it, expect } from 'vitest';
import { incomeTaxBeforeCredits, nationalInsurance, estimateNetSalary, TAX_CONFIG_2026 } from '../src/lib/net-salary.js';

describe('income tax brackets 2026', () => {
  it('taxes the first bracket at 10%', () => {
    expect(incomeTaxBeforeCredits(5000).tax).toBeCloseTo(500, 5);
  });
  it('is progressive across brackets', () => {
    // 7010*0.10 + (10060-7010)*0.14 + (12000-10060)*0.20 = 701 + 427 + 388
    expect(incomeTaxBeforeCredits(12000).tax).toBeCloseTo(1516, 5);
  });
  it('reaches the top bracket', () => {
    const { slices } = incomeTaxBeforeCredits(70000);
    expect(slices.at(-1).rate).toBe(0.50);
    expect(slices.at(-1).taxable).toBe(70000 - 60130);
  });
  it('is zero for zero income', () => {
    expect(incomeTaxBeforeCredits(0).tax).toBe(0);
  });
});

describe('national insurance 2026', () => {
  it('applies the reduced tier below 7,703', () => {
    const r = nationalInsurance(5000);
    expect(r.bituachLeumi).toBeCloseTo(52, 5);
    expect(r.health).toBeCloseTo(161.5, 5);
  });
  it('applies the full tier above 7,703', () => {
    const r = nationalInsurance(10000);
    expect(r.reducedPart).toBe(7703);
    expect(r.fullPart).toBe(2297);
    expect(r.bituachLeumi).toBeCloseTo(7703 * 0.0104 + 2297 * 0.07, 5);
  });
  it('caps at 51,910', () => {
    expect(nationalInsurance(100000).insurable).toBe(51910);
    expect(nationalInsurance(100000).total).toBe(nationalInsurance(51910).total);
  });
});

describe('estimateNetSalary', () => {
  it('uses default credit points (2.25 x 242) and never goes negative', () => {
    const r = estimateNetSalary({ gross: 5000 });
    expect(r.creditValue).toBe(545); // 544.5 -> 545
    expect(r.incomeTax).toBe(0); // 500 tax fully covered by credits
    expect(r.creditUsed).toBe(500);
    expect(r.net).toBe(5000 - 52 - 162);
  });
  it('estimates a 15,000 gross salary', () => {
    const r = estimateNetSalary({ gross: 15000, creditPoints: 2.25 });
    // tax: 701 + 427 + (15000-10060)*0.2 = 2116 ; credits 544.5 -> 1571.5
    expect(r.incomeTaxBeforeCredits).toBe(2116);
    expect(r.incomeTax).toBe(1572);
    // NI: 7703*0.0104 + 7297*0.07 = 80.11 + 510.79 = 590.9 ; health: 248.8 + 377.25 = 626.06
    expect(r.bituachLeumi).toBe(591);
    expect(r.health).toBe(626);
    expect(r.net).toBe(15000 - 1572 - 591 - 626);
    expect(r.marginalRate).toBe(0.2);
    expect(r.effectiveRate).toBeGreaterThan(18);
  });
  it('subtracts pension contribution', () => {
    const a = estimateNetSalary({ gross: 10000 });
    const b = estimateNetSalary({ gross: 10000, pensionRate: 0.06 });
    expect(b.pension).toBe(600);
    expect(a.net - b.net).toBe(600);
  });
  it('marks the config as unverified (אומדן)', () => {
    expect(TAX_CONFIG_2026.verified).toBe(false);
    expect(estimateNetSalary({ gross: 1 }).verified).toBe(false);
  });
  it('handles garbage input', () => {
    expect(estimateNetSalary({ gross: 'abc' }).net).toBe(0);
    expect(estimateNetSalary({ gross: -100 }).net).toBe(0);
  });
});
