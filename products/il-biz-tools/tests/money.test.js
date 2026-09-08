import { describe, it, expect } from 'vitest';
import { round2, round0, formatILS, parseAmount } from '../src/lib/money.js';

describe('money', () => {
  it('round2 avoids float drift', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });
  it('round0 rounds to whole shekels', () => {
    expect(round0(1234.5)).toBe(1235);
  });
  it('formatILS formats shekels', () => {
    const s = formatILS(1234.5);
    expect(s).toContain('1,234.50');
    expect(s).toMatch(/₪|ILS/);
  });
  it('parseAmount tolerates formatting and rejects garbage', () => {
    expect(parseAmount('₪ 1,234.5')).toBe(1234.5);
    expect(parseAmount('abc')).toBe(0);
    expect(parseAmount(-5)).toBe(0);
    expect(parseAmount('')).toBe(0);
  });
});
