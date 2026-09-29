// DOM glue for osek-zair.html. The comparison, the refusal of pending years and every Hebrew sentence the result
// shows are in src/lib/osek-zair.js; this file only reads the three fields and writes the result. Nothing is
// stored and nothing is sent: the numbers stay in the form.
import { initPage, $ } from './common.js';
import { compareTracks, resultHe } from '../src/lib/osek-zair.js';
import { formatILS } from '../src/lib/money.js';

initPage();

const DASH = '—';
const ils = (n) => formatILS(n, { decimals: Number.isInteger(n) ? 0 : 2 });
const TONES = { ok: 'status-box ok', warn: 'status-box warn', over: 'status-box over', neutral: 'status-box' };

function show(el, text) {
  el.textContent = text ?? '';
  el.hidden = !text;
}

function render() {
  const r = compareTracks({ year: $('#year').value, turnover: $('#turnover').value, expenses: $('#expenses').value });
  const say = resultHe(r);

  const cap = $('#cap-status');
  cap.className = TONES[say.capTone] ?? TONES.neutral;
  cap.textContent = say.cap;

  const compared = r.status === 'compared';
  $('#out-deduction').textContent = compared ? ils(r.deduction) : DASH;
  $('#out-track').textContent = compared ? ils(r.trackTaxable) : DASH;
  $('#out-regular').textContent = compared ? ils(r.regularTaxable) : DASH;
  $('#out-by').textContent = compared ? ils(r.by) : DASH;

  const verdict = $('#verdict');
  verdict.className = TONES[say.tone] ?? TONES.neutral;
  show(verdict, say.verdict);
  show($('#result-note'), say.note);
}

$('#zair-form').addEventListener('submit', (e) => e.preventDefault());
for (const sel of ['#year', '#turnover', '#expenses']) {
  $(sel).addEventListener('input', render);
  $(sel).addEventListener('change', render);
}
render();
