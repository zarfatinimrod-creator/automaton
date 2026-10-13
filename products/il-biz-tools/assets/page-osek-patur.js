// DOM glue for osek-patur.html. The ceiling of each tax year, the refusal of a pending or unknown year and the
// sentence the result box shows for it are in src/lib/osek-patur.js; this file reads the year and the twelve months
// and writes the result. The months are kept in this browser only, one list per tax year.
import { initPage, $, setMoney } from './common.js';
import { trackOsekPatur, refusalHe, MONTH_NAMES_HE, OSEK_PATUR_CONFIG, DEFAULT_WARN_BAND, statusLabelHe } from '../src/lib/osek-patur.js';
import { parseAmount, formatILS } from '../src/lib/money.js';

initPage();
const keyFor = (year) => `ilbiz.osek-patur.${year}`;
const yearSelect = $('#tax-year');
yearSelect.value = OSEK_PATUR_CONFIG.defaultYear;
let year = yearSelect.value;
$('#meter .band').style.right = `${DEFAULT_WARN_BAND * 100}%`;

function load(y) {
  try {
    const saved = JSON.parse(localStorage.getItem(keyFor(y)) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

const monthsEl = $('#months');
const initial = load(year);
MONTH_NAMES_HE.forEach((name, i) => {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  wrap.innerHTML = `<label for="m${i}">${name}</label><input type="number" id="m${i}" inputmode="decimal" min="0" step="1" placeholder="0">`;
  const input = wrap.querySelector('input');
  if (initial[i] > 0) input.value = initial[i];
  input.addEventListener('input', update);
  monthsEl.appendChild(wrap);
});

function readMonths() {
  return MONTH_NAMES_HE.map((_, i) => parseAmount($(`#m${i}`).value));
}

const AMOUNTS = ['#total', '#percent', '#remaining', '#avg', '#projection', '#safe'];

function update() {
  const months = readMonths();
  try { localStorage.setItem(keyFor(year), JSON.stringify(months)); } catch { /* private mode */ }
  $('#year').textContent = year;
  const r = trackOsekPatur(months, { year });

  const meter = $('#meter');
  const box = $('#status');
  if (r.status === 'refused') {
    // Not computed: an empty meter, blank amounts, and the year's own sentence in the result box.
    meter.className = 'meter';
    meter.querySelector('i').style.width = '0%';
    box.className = 'status-box warn';
    $('#status-label').textContent = '';
    $('#status-label').hidden = true;
    $('#status-sep').hidden = true;
    $('#status-text').textContent = refusalHe(r);
    for (const id of AMOUNTS) $(id).textContent = '';
    return;
  }

  meter.className = `meter ${r.status}`;
  meter.querySelector('i').style.width = `${Math.min(100, r.usedPercent)}%`;

  box.className = `status-box ${r.status}`;
  $('#status-label').hidden = false;
  $('#status-sep').hidden = false;
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

function changeYear() {
  if (yearSelect.value === year) return;
  year = yearSelect.value;
  const saved = load(year);
  MONTH_NAMES_HE.forEach((_, i) => { $(`#m${i}`).value = saved[i] > 0 ? saved[i] : ''; });
  update();
}
yearSelect.addEventListener('change', changeYear);
yearSelect.addEventListener('input', changeYear);

$('#clear').addEventListener('click', () => {
  MONTH_NAMES_HE.forEach((_, i) => { $(`#m${i}`).value = ''; });
  update();
});
update();
