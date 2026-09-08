import { initPage, $, setMoney } from './common.js';
import { calcVat, DEFAULT_VAT_RATE } from '../src/lib/vat.js';
import { parseAmount, formatILS } from '../src/lib/money.js';

initPage();
const amount = $('#amount'), mode = $('#mode'), rate = $('#rate');
rate.value = String(DEFAULT_VAT_RATE * 100);
$('#rate-label').textContent = `${DEFAULT_VAT_RATE * 100}%`;

let last = { net: 0, vat: 0, gross: 0 };
function update() {
  const r = Math.min(99, Math.max(0, parseAmount(rate.value))) / 100;
  last = calcVat(parseAmount(amount.value), mode.value, r);
  setMoney($('#out-net'), last.net);
  setMoney($('#out-vat'), last.vat);
  setMoney($('#out-gross'), last.gross);
}
[amount, mode, rate].forEach((el) => el.addEventListener('input', update));
update();

$('#copy').addEventListener('click', async () => {
  const text = `נטו: ${formatILS(last.net)} | מע״מ: ${formatILS(last.vat)} | ברוטו: ${formatILS(last.gross)}`;
  try { await navigator.clipboard.writeText(text); $('#copied').hidden = false; setTimeout(() => { $('#copied').hidden = true; }, 1500); } catch { /* clipboard unavailable */ }
});
