/** Round to 2 decimals without floating-point drift (e.g. 1.005 -> 1.01). */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/** Round to whole shekels (Israeli payslips and tax tables use whole ₪). */
export function round0(n) {
  return Math.round(Number(n) + Number.EPSILON);
}

/** Format a number as Israeli shekels, Hebrew locale. */
export function formatILS(n, { decimals = 2 } = {}) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(n) || 0);
}

/** Parse user input ("1,234.5", "₪ 1234") into a non-negative number; NaN -> 0. */
export function parseAmount(input) {
  if (typeof input === 'number') return Number.isFinite(input) && input > 0 ? input : 0;
  const cleaned = String(input ?? '').replace(/[^\d.\-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
