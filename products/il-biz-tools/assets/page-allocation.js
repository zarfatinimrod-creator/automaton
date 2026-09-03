import { checkAllocationNumber, proximityWarning } from '../src/lib/allocation.js';
import { initPage } from './common.js';

initPage();

const $ = (s) => document.querySelector(s);
const config = await fetch('src/config/allocation-number.json').then((r) => r.json());

// Default to today, so the common case (an invoice being written right now) is
// answered before the user touches anything.
$('#date').value = new Date().toISOString().slice(0, 10);

function fmt(n) {
  return Number(n).toLocaleString('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });
}

function render() {
  const result = checkAllocationNumber(
    {
      // Pass the raw field value: the library distinguishes empty from invalid,
      // which Number() would flatten to 0 ("not required").
      amountBeforeVat: $('#amount').value,
      dateIso: $('#date').value,
      isDomesticB2B: $('#b2b').value === 'yes',
    },
    config,
  );

  const box = $('#verdict');
  box.className = 'verdict ' + (result.required === null ? 'unknown' : result.required ? 'required' : 'not-required');
  box.textContent = (result.required === null ? 'ⓘ ' : result.required ? '⚠ נדרש מספר הקצאה' : '✓ לא נדרש מספר הקצאה') +
    (result.required === null ? result.reason : '');
  const detail = document.createElement('p');
  detail.className = 'note';
  detail.textContent = result.required === null ? '' : result.reason;
  box.appendChild(detail);

  $('#proximity').textContent = proximityWarning(result) ?? '';
  $('#next-change').textContent = result.next
    ? `שינוי הסף הבא: ${fmt(result.next.amountIls)} מ-${result.next.from}.`
    : '';
}

const tbody = $('#timeline tbody');
for (const t of [...config.thresholds].sort((a, b) => b.from.localeCompare(a.from))) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td class="num">${t.from}</td><td class="num">${fmt(t.amountIls)}</td><td>${t.note ?? ''}</td>`;
  tbody.appendChild(tr);
}

for (const sel of ['#amount', '#date', '#b2b']) $(sel).addEventListener('input', render);
render();
