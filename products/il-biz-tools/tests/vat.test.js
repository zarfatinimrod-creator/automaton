import { describe, it, expect } from 'vitest';
import { addVat, removeVat, fromVatAmount, calcVat, DEFAULT_VAT_RATE } from '../src/lib/vat.js';

describe('vat', () => {
  it('default rate is 18%', () => {
    expect(DEFAULT_VAT_RATE).toBe(0.18);
  });
  it('adds VAT to net', () => {
    expect(addVat(100)).toEqual({ net: 100, vat: 18, gross: 118, rate: 0.18 });
  });
  it('removes VAT from gross', () => {
    expect(removeVat(118)).toEqual({ net: 100, vat: 18, gross: 118, rate: 0.18 });
    expect(removeVat(1000).net).toBe(847.46);
  });
  it('backs out from VAT amount', () => {
    expect(fromVatAmount(18)).toEqual({ net: 100, vat: 18, gross: 118, rate: 0.18 });
  });
  it('supports a custom rate (17%)', () => {
    expect(addVat(100, 0.17).gross).toBe(117);
  });
  it('calcVat dispatches by mode', () => {
    expect(calcVat(100, 'net').gross).toBe(118);
    expect(calcVat(118, 'gross').net).toBe(100);
    expect(calcVat(18, 'vat').gross).toBe(118);
    expect(() => calcVat(1, 'nope')).toThrow(RangeError);
  });
  it('rejects invalid rates', () => {
    expect(() => addVat(100, 18)).toThrow(RangeError);
    expect(() => addVat(100, -0.1)).toThrow(RangeError);
  });
  it('handles empty / NaN input as zero', () => {
    expect(addVat('').gross).toBe(0);
    expect(removeVat(NaN).net).toBe(0);
  });
});
