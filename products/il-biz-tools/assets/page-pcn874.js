// DOM glue for pcn874.html. No logic of its own: the validator is
// products/pcn874's (src/vendor/pcn874/, bundled from its source) and the
// Hebrew rows come from src/lib/pcn874-report.js.
//
// The file is read with the File API (File.arrayBuffer) and validated in this
// tab. Nothing here makes a request or touches storage - tests/pcn874-page.test.js
// scans every module this page loads for it and runs this script with every
// network and storage API trapped. Everything is written with textContent, never
// as HTML: a finding can quote bytes from the file.
import { initPage } from './common.js';
import { validatePcn874 } from '../src/vendor/pcn874/validate.js';
import { buildReport, readPcn874File } from '../src/lib/pcn874-report.js';

initPage();

const $ = (sel) => document.querySelector(sel);
const input = $('#pcn-file');
const status = $('#pcn-status');
const results = $('#pcn-results');
const tbody = $('#pcn-findings');
const more = $('#pcn-more');

const STATUS_CLASS = { invalid: 'status-box over', warnings: 'status-box warn', clean: 'status-box ok' };
const NO_HEBREW = 'לכלל הזה אין עדיין תיאור בעברית; הניסוח של הבודק מופיע למטה.';

function el(tag, text, attrs = {}) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** The validator's own words, in English, kept beside the Hebrew. */
function englishDetails(row) {
  const details = el('details');
  details.append(el('summary', 'הניסוח המקורי של הבודק (באנגלית)'));
  details.append(el('p', row.message, { lang: 'en', dir: 'ltr' }));
  if (row.officialText) details.append(el('p', `Tax Authority circular: ${row.officialText}`, { lang: 'en', dir: 'ltr' }));
  if (row.openQuestion) details.append(el('p', `Still open: ${row.openQuestion}`, { lang: 'en', dir: 'ltr' }));
  return details;
}

function rowElement(row) {
  const tr = el('tr');
  tr.append(el('td', row.where), el('td', row.record), el('td', row.field || '—'));

  const severity = el('td');
  const badge = el('span', row.severityHe);
  badge.className = row.severity === 'error' ? 'badge over' : 'badge warn';
  severity.append(badge);

  const rule = el('td');
  rule.append(el('p', row.ruleHe ?? NO_HEBREW), el('code', row.rule, { dir: 'ltr' }), englishDetails(row));
  tr.append(severity, rule);
  return tr;
}

function clearFindings() {
  tbody.textContent = '';
  more.textContent = '';
  results.hidden = true;
}

function show(report, fileName) {
  status.className = STATUS_CLASS[report.verdict];
  status.textContent = `«${fileName}»: ${report.summary}`;
  clearFindings();
  for (const row of report.rows) tbody.append(rowElement(row));
  if (report.total > report.rows.length) {
    more.textContent = `מוצגים ${report.rows.length} הממצאים הראשונים מתוך ${report.total}.`;
  }
  results.hidden = report.rows.length === 0;
}

input.addEventListener('change', async () => {
  const file = input.files?.[0];
  clearFindings();
  if (!file) {
    status.className = 'status-box';
    status.textContent = 'עדיין לא נבחר קובץ.';
    return;
  }
  status.className = 'status-box';
  status.textContent = `הקובץ «${file.name}» נבדק…`;
  try {
    const text = await readPcn874File(file);
    show(buildReport(validatePcn874(text)), file.name);
  } catch {
    status.className = 'status-box over';
    status.textContent = `לא ניתן היה לקרוא את הקובץ «${file.name}». כדאי לוודא שזה קובץ טקסט ולבחור אותו שוב.`;
  }
});
