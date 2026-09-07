import { round2 } from './money.js';
import defaultConfig from '../config/vat.json' with { type: 'json' };

export const DEFAULT_VAT_RATE = defaultConfig.rate;

function checkRate(rate) {
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate < 0 || rate >= 1) {
    throw new RangeError(`VAT rate must be a fraction in [0, 1), got ${rate}`);
  }
}

/** Given a net (before VAT) amount, return {net, vat, gross}. */
export function addVat(net, rate = DEFAULT_VAT_RATE) {
  checkRate(rate);
  const n = Number(net) || 0;
  const vat = round2(n * rate);
  return { net: round2(n), vat, gross: round2(n + vat), rate };
}

/** Given a gross (including VAT) amount, return {net, vat, gross}. */
export function removeVat(gross, rate = DEFAULT_VAT_RATE) {
  checkRate(rate);
  const g = Number(gross) || 0;
  const net = round2(g / (1 + rate));
  return { net, vat: round2(g - net), gross: round2(g), rate };
}

/** Given a VAT amount only, back out the net and gross. */
export function fromVatAmount(vat, rate = DEFAULT_VAT_RATE) {
  checkRate(rate);
  if (rate === 0) return { net: 0, vat: 0, gross: 0, rate };
  const v = Number(vat) || 0;
  const net = round2(v / rate);
  return { net, vat: round2(v), gross: round2(net + v), rate };
}

/** Unified entry point: mode is 'net' | 'gross' | 'vat'. */
export function calcVat(amount, mode = 'net', rate = DEFAULT_VAT_RATE) {
  switch (mode) {
    case 'net': return addVat(amount, rate);
    case 'gross': return removeVat(amount, rate);
    case 'vat': return fromVatAmount(amount, rate);
    default: throw new RangeError(`Unknown VAT mode: ${mode}`);
  }
}
