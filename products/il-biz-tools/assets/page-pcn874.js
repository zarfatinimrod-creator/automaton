// DOM glue for pcn874.html. No logic of its own: the validator is
// products/pcn874's (src/vendor/pcn874/, bundled from its source) and the
// Hebrew rows come from src/lib/pcn874-report.js.
//
// The file is read with the File API (File.arrayBuffer) and validated in this
// tab. Nothing here makes a request or touches storage - tests/pcn874-page.test.js
// scans every module this page loads for it and runs this script with every
// network and storage API trapped. Everything is written with textContent, never
// as HTML: a finding can quote bytes from the file.
//
// After a check (TikTok note N7): a print / PDF button, and a share button that
// only the user can press and that exists only where the browser has
// navigator.share. The shared text is src/lib/pcn874-share.js's - counts and
// rule names, never a value from the file or its name. The api.whatsapp.com
// fallback is built there but stays off (WHATSAPP_FALLBACK_ENABLED) until a
// device test is recorded.
import { initPage } from './common.js';
import { validatePcn874 } from '../src/vendor/pcn874/validate.js';
import { MAX_FILE_BYTES, buildReport, readPcn874File } from '../src/lib/pcn874-report.js';
import { WHATSAPP_FALLBACK_ENABLED, shareSummary, shareText, whatsappHref } from '../src/lib/pcn874-share.js';

initPage();

const $ = (sel) => document.querySelector(sel);
const input = $('#pcn-file');
const status = $('#pcn-status');
const results = $('#pcn-results');
const tbody = $('#pcn-findings');
const more = $('#pcn-more');
const after = $('#pcn-after');
const printFile = $('#pcn-print-file');
const printDate = $('#pcn-print-date');
const shareButton = $('#pcn-share');
const shareNote = $('#pcn-share-note');
const shareStatus = $('#pcn-share-status');

// A clean result is neutral, not green: the checker checks structure only, and
// a file it passes can still be rejected.
const STATUS_CLASS = {
  invalid: 'status-box over',
  warnings: 'status-box warn',
  unsupported: 'status-box warn',
  clean: 'status-box',
};
const NO_HEBREW = 'לכלל הזה אין עדיין תיאור בעברית; הניסוח של הבודק מופיע למטה.';

function el(tag, text, attrs = {}) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/**
 * The validator's own words, in English, kept beside the Hebrew. `officialText`
 * is labelled "sources and notes", not "the circular": besides the circular's
 * words it carries vendor-manual text and the validator's own notes.
 */
function englishDetails(row) {
  const details = el('details');
  details.append(el('summary', 'הניסוח המקורי של הבודק, מקורות והערות (באנגלית)'));
  details.append(el('p', row.message, { lang: 'en', dir: 'ltr' }));
  if (row.officialText) details.append(el('p', `Sources and notes: ${row.officialText}`, { lang: 'en', dir: 'ltr' }));
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
  hideAfter();
}

// --- After a result: print / PDF, and share -------------------------------

const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
/** The share text of the latest finished check; null while there is none. */
let shareable = null;
/** The WhatsApp link, made only when the fallback is on and navigator.share is missing. */
let whatsappLink = null;

after.hidden = true;
shareButton.hidden = !canShare;
shareNote.hidden = !canShare && !WHATSAPP_FALLBACK_ENABLED;

const dateHe = (d) => `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;

function hideAfter() {
  after.hidden = true;
  shareable = null;
  shareStatus.textContent = '';
  if (whatsappLink) whatsappLink.hidden = true;
}

function showAfter(result, fileName) {
  printFile.textContent = fileName;
  printDate.textContent = dateHe(new Date());
  shareable = shareText(shareSummary(result));
  if (!canShare && WHATSAPP_FALLBACK_ENABLED) {
    if (!whatsappLink) {
      whatsappLink = el('a', 'שיתוף בוואטסאפ', { class: 'btn secondary', rel: 'noopener', target: '_blank' });
      shareButton.parentNode?.append(whatsappLink);
    }
    whatsappLink.setAttribute('href', whatsappHref(shareable));
    whatsappLink.hidden = false;
  }
  after.hidden = false;
}

$('#pcn-print').addEventListener('click', () => window.print());

shareButton.addEventListener('click', async () => {
  if (!canShare || !shareable) return;
  shareStatus.textContent = '';
  try {
    await navigator.share({ text: shareable });
  } catch (e) {
    // Closing the share sheet is the user's choice, not a failure.
    if (e?.name !== 'AbortError') shareStatus.textContent = 'השיתוף לא הושלם. אפשר להדפיס את הממצאים או לשמור אותם כ-PDF במקום.';
  }
});

function setStatus(className, ...paragraphs) {
  status.className = className;
  status.textContent = '';
  if (paragraphs.length === 1) status.textContent = paragraphs[0];
  else for (const text of paragraphs) status.append(el('p', text));
}

function show(report, fileName) {
  setStatus(STATUS_CLASS[report.verdict] ?? 'status-box', `«${fileName}»: ${report.summary}`, ...(report.notes ?? []));
  clearFindings();
  for (const row of report.rows) tbody.append(rowElement(row));
  if (report.total > report.rows.length) {
    more.textContent = `מוצגים ${report.rows.length} הממצאים הראשונים מתוך ${report.total}.`;
  }
  results.hidden = report.rows.length === 0;
}

const megabytes = (bytes) => Math.round(bytes / (1024 * 1024));

// Each choice of file is one run. A slower earlier file must not overwrite a
// later one's result, so a run that is no longer the latest drops its result.
let latestRun = 0;

input.addEventListener('change', async () => {
  const file = input.files?.[0];
  const run = ++latestRun;
  clearFindings();
  if (!file) {
    setStatus('status-box', 'עדיין לא נבחר קובץ.');
    return;
  }
  const name = file.name;
  // Browsers fire no `change` when the same file is picked again, so a user who
  // fixes the file and picks it again would see the old result. The file is
  // held in `file`; the input is emptied so the next pick is always a change.
  input.value = '';

  if (typeof file.size === 'number' && file.size > MAX_FILE_BYTES) {
    setStatus(
      'status-box over',
      `הקובץ «${name}» גדול מ-${megabytes(MAX_FILE_BYTES)} מגה-בייט, ולכן הוא לא נבדק. כל רשומה בקובץ PCN874 היא 60 תווים, כך שקובץ בגודל כזה מכיל יותר מ-400,000 רשומות; ייתכן שנבחר קובץ אחר.`,
    );
    return;
  }

  setStatus('status-box', `הקובץ «${name}» נבדק…`);
  let reading;
  try {
    reading = await readPcn874File(file);
  } catch {
    if (run !== latestRun) return;
    setStatus('status-box over', `לא ניתן היה לקרוא את הקובץ «${name}». כדאי לוודא שזה קובץ טקסט ולבחור אותו שוב.`);
    return;
  }
  if (run !== latestRun) return;

  try {
    const result = validatePcn874(reading.text);
    show(buildReport(result, { reading }), name);
    showAfter(result, name);
  } catch {
    // The file was read; the checker failed on it. That is a fault in the
    // checker, not a finding about the file, and it must not read as one.
    clearFindings();
    setStatus(
      'status-box over',
      `הבודק נכשל בזמן בדיקת הקובץ «${name}», ולכן לא נקבע דבר לגבי הקובץ – לא שהוא תקין ולא שהוא שגוי. זו תקלה בבודק, לא ממצא על הקובץ.`,
    );
  }
});
