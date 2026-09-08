import { initPage, $, setMoney } from './common.js';
import { trackOsekPatur, MONTH_NAMES_HE, OSEK_PATUR_CEILING, OSEK_PATUR_YEAR, DEFAULT_WARN_BAND, statusLabelHe } from '../src/lib/osek-patur.js';
import { parseAmount, formatILS } from '../src/lib/money.js';

initPage();
const KEY = `ilbiz.osek-patur.${OSEK_PATUR_YEAR}`;
$('#year').textContent = String(OSEK_PATUR_YEAR);
setMoney($('#ceiling'), OSEK_PATUR_CEILING, 0);
$('#meter .band').style.right = `${DEFAULT_WARN_BAND * 100}%`;

const monthsEl = $('#months');
let saved = [];
try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { saved = []; }

MONTH_NAMES_HE.forEach((name, i) => {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  wrap.innerHTML = `<label for="m${i}">${name}</label><input type="number" id="m${i}" inputmode="decimal" min="0" step="1" placeholder="0">`;
  const input = wrap.querySelector('input');
  if (saved[i] > 0) input.value = saved[i];
  input.addEventListener('input', update);
  monthsEl.appendChild(wrap);
});

function readMonths() {
  return MONTH_NAMES_HE.map((_, i) => parseAmount($(`#m${i}`).value));
}

function update() {
  const months = readMonths();
  try { localStorage.setItem(KEY, JSON.stringify(months)); } catch { /* private mode */ }
  const r = trackOsekPatur(months);

  const meter = $('#meter');
  meter.className = `meter ${r.status}`;
  meter.querySelector('i').style.width = `${Math.min(100, r.usedPercent)}%`;

  const box = $('#status');
  box.className = `status-box ${r.status}`;
  $('#status-label').textContent = statusLabelHe(r.status);
  const texts = {
    ok: `ניצלתם ${r.usedPercent}% מהתקרה. ${r.projectionStatus === 'over' ? 'שימו לב: לפי הקצב הנוכחי תחרגו מהתקרה עד סוף השנה.' : 'לפי הקצב הנוכחי תישארו במסגרת התקרה.'}`,
    warn: `ניצלתם ${r.usedPercent}% מהתקרה. נותרו ${formatILS(r.remaining, { decimals: 0 })} – מומלץ להיערך למעבר לעוסק מורשה ולהתייעץ עם רואה חשבון.`,
    over: `חרגתם מהתקרה ב-${formatILS(-r.remaining, { decimals: 0 })}. יש לדווח למע״מ ולעבור לרישום כעוסק מורשה.`,
  };
  $('#status-text').textContent = texts[r.status];

  setMoney($('#total'), r.total, 0);
  $('#percent').textContent = `${r.usedPercent}%`;
  setMoney($('#remaining'), r.remaining, 0);
  setMoney($('#avg'), r.monthlyAverage, 0);
  setMoney($('#projection'), r.projectedAnnual, 0);
  setMoney($('#safe'), r.safeMonthlyAverage, 0);
}

$('#clear').addEventListener('click', () => {
  MONTH_NAMES_HE.forEach((_, i) => { $(`#m${i}`).value = ''; });
  update();
});
update();
