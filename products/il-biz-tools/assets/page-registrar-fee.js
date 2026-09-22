import { annualDeadlines, deadlineMessage, feeAmountDisclosure } from '../src/lib/registrar-fee.js';
import { initPage } from './common.js';

initPage();

const $ = (s) => document.querySelector(s);
const config = await fetch('src/config/registrar-fee.json').then((r) => r.json());

// Nothing on this page may print a shekel amount while the amounts are
// unverified. The check lives here as well as in the library so that a future
// edit to this file cannot quietly start rendering them.
const amounts = feeAmountDisclosure(config);

const dmy = (iso) => iso.split('-').reverse().join('.');

$('#today').value = new Date().toISOString().slice(0, 10);

function render() {
  const result = annualDeadlines($('#today').value, config);
  const box = $('#verdict');
  const tbody = $('#deadline-table tbody');
  tbody.replaceChildren();

  if (!result) {
    box.className = 'verdict unknown';
    box.textContent = 'הזינו תאריך תקין.';
    return;
  }

  box.className = `verdict ${result.windowOpen ? 'reduced' : 'full'}`;
  box.textContent = (result.windowOpen ? '✓ ' : '⚠ ') + deadlineMessage(result);

  const rows = [
    [`סוף חלון התעריף המוזל לשנת ${result.year}`, dmy(result.reducedRateDeadline)],
    [`תחילת התעריף המלא לשנת ${result.year}`, dmy(result.fullRateFrom)],
    ['סוף חלון התעריף המוזל הבא', dmy(result.nextReducedRateDeadline)],
    ['ימים עד לחלון המוזל הבא', String(result.daysToNextReducedRateDeadline)],
  ];
  for (const [label, value] of rows) {
    const tr = document.createElement('tr');
    const th = document.createElement('td');
    th.textContent = label;
    const td = document.createElement('td');
    td.className = 'num';
    td.textContent = value;
    tr.append(th, td);
    tbody.appendChild(tr);
  }

  if (!amounts.publishable) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 2;
    td.className = 'note';
    td.textContent = amounts.message;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

$('#today').addEventListener('input', render);
render();

// There is no backend. The form ships disabled, and this is the second lock:
// even if the fieldset were enabled by hand, nothing is sent anywhere.
$('#reminder-form').addEventListener('submit', (e) => {
  e.preventDefault();
});
