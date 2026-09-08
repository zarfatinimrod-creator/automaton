import { initPage, $, setMoney } from './common.js';
import { estimateNetSalary, TAX_CONFIG_2026 } from '../src/lib/net-salary.js';
import { parseAmount, formatILS } from '../src/lib/money.js';

initPage();
const cfg = TAX_CONFIG_2026;
$('#year').textContent = String(cfg.year);
const gross = $('#gross'), points = $('#points'), pension = $('#pension');
points.value = String(cfg.incomeTax.defaultCreditPoints.male);
$('#pts-male').addEventListener('click', (e) => { e.preventDefault(); points.value = cfg.incomeTax.defaultCreditPoints.male; update(); });
$('#pts-female').addEventListener('click', (e) => { e.preventDefault(); points.value = cfg.incomeTax.defaultCreditPoints.female; update(); });

const pct = (r) => `${Math.round(r * 10000) / 100}%`;
const tbody = $('#brackets-table tbody');
cfg.incomeTax.monthlyBrackets.forEach((b) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td class="num">${b.upTo == null ? 'ומעלה' : formatILS(b.upTo, { decimals: 0 })}</td><td class="num">${pct(b.rate)}</td>`;
  tbody.appendChild(tr);
});
const ni = cfg.nationalInsurance;
$('#ni-note').textContent = `נקודת זיכוי: ${formatILS(cfg.incomeTax.creditPointMonthlyValue, { decimals: 0 })} לחודש. ביטוח לאומי + בריאות (חלק העובד): עד ${formatILS(ni.reducedTierUpTo, { decimals: 0 })} – ${pct(ni.employee.reduced.nationalInsurance)} + ${pct(ni.employee.reduced.health)}; מעל, עד תקרה ${formatILS(ni.maxInsurableIncome, { decimals: 0 })} – ${pct(ni.employee.full.nationalInsurance)} + ${pct(ni.employee.full.health)}. ${cfg.verified ? '' : 'הנתונים לא אומתו מול המקור הרשמי (אומדן).'}`;

function update() {
  const r = estimateNetSalary({
    gross: parseAmount(gross.value),
    creditPoints: parseAmount(points.value),
    pensionRate: parseAmount(pension.value) / 100,
  });
  setMoney($('#o-gross'), r.gross, 0);
  setMoney($('#o-tax-raw'), r.incomeTaxBeforeCredits, 0);
  setMoney($('#o-credit'), -r.creditUsed, 0);
  setMoney($('#o-tax'), r.incomeTax, 0);
  setMoney($('#o-bl'), r.bituachLeumi, 0);
  setMoney($('#o-health'), r.health, 0);
  setMoney($('#o-pension'), r.pension, 0);
  setMoney($('#o-deductions'), r.totalDeductions, 0);
  setMoney($('#o-net'), r.net, 0);
  $('#o-eff').textContent = `${r.effectiveRate}%`;
  $('#o-marginal').textContent = pct(r.marginalRate);
}
[gross, points, pension].forEach((el) => el.addEventListener('input', update));
update();
