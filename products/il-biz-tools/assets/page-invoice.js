import { initPage, $, $$, site } from './common.js';
import {
  DOC_TYPES, PAYMENT_METHODS, emptyDocument, computeTotals, nextDocumentNumber,
  validateDocument, createStore, formatDateHe,
} from '../src/lib/invoice.js';
import { formatILS, parseAmount } from '../src/lib/money.js';
import { isProConfigured, openProCheckout } from '../src/lib/paddle.js';
import { loadStoredLicense, storeLicense, verifyLicense } from '../src/lib/license.js';
import { applyBranding, DEFAULT_ACCENT, emptyBranding, isValidLogo, MAX_LOGO_BYTES, normalizeBranding } from '../src/lib/branding.js';

initPage();
const store = createStore(localStorage);
let doc = emptyDocument();

// --- populate selects
for (const [v, label] of Object.entries(DOC_TYPES)) $('#doc-type').append(new Option(label, v));
for (const [v, label] of Object.entries(PAYMENT_METHODS)) $('#pay-method').append(new Option(label, v));

// --- lines editor
const linesBody = $('#lines tbody');
function renderLines() {
  linesBody.innerHTML = '';
  doc.lines.forEach((l, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" data-line="${i}" data-k="description" value="" placeholder="למשל: שעת ייעוץ"></td>
      <td class="qty"><input type="number" data-line="${i}" data-k="quantity" min="0" step="0.25" value="${l.quantity}"></td>
      <td class="price"><input type="number" data-line="${i}" data-k="unitPrice" min="0" step="0.01" value="${l.unitPrice || ''}"></td>
      <td class="remove"><button type="button" class="btn secondary small" data-remove="${i}" aria-label="הסרת שורה">✕</button></td>`;
    tr.querySelector('[data-k=description]').value = l.description;
    linesBody.appendChild(tr);
  });
}
linesBody.addEventListener('input', (e) => {
  const { line, k } = e.target.dataset;
  if (line == null) return;
  doc.lines[+line][k] = k === 'description' ? e.target.value : parseAmount(e.target.value);
  renderPreview();
});
linesBody.addEventListener('click', (e) => {
  const i = e.target.dataset.remove;
  if (i == null) return;
  doc.lines.splice(+i, 1);
  if (!doc.lines.length) doc.lines.push({ description: '', quantity: 1, unitPrice: 0 });
  renderLines(); renderPreview();
});
$('#add-line').addEventListener('click', () => { doc.lines.push({ description: '', quantity: 1, unitPrice: 0 }); renderLines(); renderPreview(); });

// --- form <-> doc binding
const bind = {
  '#biz-name': ['business', 'name'], '#biz-id': ['business', 'id'], '#biz-kind': ['business', 'kind'],
  '#biz-address': ['business', 'address'], '#biz-phone': ['business', 'phone'], '#biz-email': ['business', 'email'],
  '#doc-type': ['type'], '#doc-number': ['number'], '#doc-date': ['date'],
  '#client-name': ['client', 'name'], '#client-id': ['client', 'id'], '#client-address': ['client', 'address'],
  '#pay-method': ['paymentMethod'], '#pay-details': ['paymentDetails'], '#notes': ['notes'],
};
const get = (path) => path.reduce((o, k) => o?.[k], doc) ?? '';
const set = (path, v) => { const o = path.slice(0, -1).reduce((o, k) => o[k], doc); o[path.at(-1)] = v; };
for (const [sel, path] of Object.entries(bind)) {
  $(sel).addEventListener('input', () => { set(path, $(sel).value); renderPreview(); });
}
function fillForm() {
  for (const [sel, path] of Object.entries(bind)) $(sel).value = get(path);
  renderLines();
}

// --- preview
function renderPreview() {
  const t = computeTotals(doc);
  const text = (id, v) => { $(id).textContent = v ?? ''; };
  text('#p-biz-name', doc.business.name || 'שם העסק');
  text('#p-biz-kind', doc.business.kind === 'patur' ? 'עוסק פטור' : 'עוסק מורשה');
  text('#p-biz-id', doc.business.id);
  text('#p-biz-address', doc.business.address);
  text('#p-biz-phone', doc.business.phone);
  text('#p-biz-email', doc.business.email);
  text('#p-type', DOC_TYPES[doc.type]);
  text('#p-number', doc.number);
  text('#p-date', formatDateHe(doc.date));
  text('#p-client-name', doc.client.name);
  text('#p-client-id', doc.client.id ? `(${doc.client.id})` : '');
  text('#p-client-address', doc.client.address);
  $('#p-lines').innerHTML = t.lines.map((l, i) =>
    `<tr><td class="num">${i + 1}</td><td></td><td class="num">${l.quantity}</td><td class="num">${formatILS(l.unitPrice)}</td><td class="num">${formatILS(l.total)}</td></tr>`).join('');
  $$('#p-lines tr').forEach((tr, i) => { tr.children[1].textContent = t.lines[i].description; });
  $('#p-subtotal-row').hidden = t.isPatur;
  $('#p-vat-row').hidden = t.isPatur;
  text('#p-subtotal', formatILS(t.subtotal));
  text('#p-vat-rate', `${Math.round(t.vatRate * 100)}%`);
  text('#p-vat', formatILS(t.vat));
  text('#p-total', formatILS(t.total));
  text('#p-total-label', doc.type === 'invoice' ? 'סה״כ לתשלום' : 'סה״כ התקבל');
  text('#p-vat-note', t.vatNote);
  text('#p-pay-method', PAYMENT_METHODS[doc.paymentMethod]);
  text('#p-pay-details', doc.paymentDetails);
  text('#p-notes', doc.notes);
}

// --- validation / actions
function showErrors() {
  const errors = validateDocument(doc);
  const ul = $('#errors');
  ul.innerHTML = errors.map((e) => `<li></li>`).join('');
  $$('li', ul).forEach((li, i) => { li.textContent = errors[i]; });
  ul.hidden = errors.length === 0;
  return errors.length === 0;
}
$('#print').addEventListener('click', () => { if (showErrors()) window.print(); });
$('#save').addEventListener('click', () => {
  if (!showErrors()) return;
  store.saveBusiness(doc.business);
  store.saveClient(doc.client);
  doc = store.saveDocument(doc);
  renderSaved(); renderClients();
});
$('#new').addEventListener('click', () => {
  const business = doc.business;
  doc = emptyDocument();
  doc.business = { ...business };
  doc.number = nextDocumentNumber(store.listDocuments(), { type: doc.type });
  fillForm(); renderPreview(); $('#errors').hidden = true;
});
$('#doc-type').addEventListener('change', () => {
  if (!doc.id) { doc.number = nextDocumentNumber(store.listDocuments(), { type: doc.type }); $('#doc-number').value = doc.number; renderPreview(); }
});

function renderSaved() {
  const docs = store.listDocuments().slice().reverse();
  const ul = $('#saved-docs');
  if (!docs.length) { ul.innerHTML = '<li class="note">אין עדיין מסמכים שמורים.</li>'; return; }
  ul.innerHTML = '';
  for (const d of docs) {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = `${DOC_TYPES[d.type]} ${d.number} · ${formatDateHe(d.date)} · ${d.client.name} · ${formatILS(computeTotals(d).total)}`;
    const open = document.createElement('button'); open.type = 'button'; open.className = 'btn secondary small'; open.textContent = 'פתיחה';
    open.addEventListener('click', () => { doc = structuredClone(d); fillForm(); renderPreview(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    const del = document.createElement('button'); del.type = 'button'; del.className = 'btn secondary small'; del.textContent = 'מחיקה';
    del.addEventListener('click', () => { if (confirm('למחוק את המסמך?')) { store.deleteDocument(d.id); renderSaved(); } });
    const btns = document.createElement('span'); btns.append(open, ' ', del);
    li.append(label, btns);
    ul.appendChild(li);
  }
}
function renderClients() {
  const dl = $('#clients-list');
  dl.innerHTML = '';
  for (const c of store.listClients()) dl.append(new Option(c.name));
}
$('#client-name').addEventListener('change', () => {
  const c = store.listClients().find((x) => x.name === $('#client-name').value);
  if (c) { doc.client = { ...c }; $('#client-id').value = c.id ?? ''; $('#client-address').value = c.address ?? ''; renderPreview(); }
});

// --- Pro: branding, gated on a signed licence key
//
// Branding is the only thing Pro sells. The saved client list and the automatic
// numbering above are free and stay free - selling something the buyer already
// has would be dishonest, and the constitution puts that above revenue.
const BRANDING_KEY = 'ilbiz.branding';
let branding = emptyBranding();
let proActive = false;

try {
  branding = normalizeBranding(JSON.parse(localStorage.getItem(BRANDING_KEY) ?? 'null'));
} catch { branding = emptyBranding(); }

function saveBranding() {
  try { localStorage.setItem(BRANDING_KEY, JSON.stringify(branding)); } catch { /* private mode */ }
}

function refreshBranding() {
  applyBranding($('#preview'), branding, proActive);
  $('#branding-fields').hidden = !proActive;
  if (proActive) {
    $('#brand-accent').value = branding.accent || DEFAULT_ACCENT;
    $('#license-clear').hidden = false;
  }
}

async function activate(key, { announce = true } = {}) {
  const publicKey = site?.pro?.publicKey ?? null;
  const result = await verifyLicense(key, publicKey);
  proActive = result.valid;
  if (result.valid) {
    storeLicense(key);
    if (announce) $('#license-note').textContent = 'הרישיון אומת. המיתוג פעיל.';
  } else if (announce) {
    const reasons = {
      not_a_license_key: 'המפתח אינו בפורמט הנכון.',
      bad_signature: 'המפתח אינו תקף.',
      no_public_key_configured: 'המיתוג עדיין לא הופעל באתר הזה.',
      web_crypto_unavailable: 'הדפדפן אינו תומך באימות המפתח.',
    };
    $('#license-note').textContent = reasons[result.reason] ?? 'לא ניתן לאמת את המפתח.';
  }
  refreshBranding();
  return result.valid;
}

$('#license-apply').addEventListener('click', () => { activate($('#license-key').value.trim()); });
$('#license-clear').addEventListener('click', () => {
  storeLicense(null);
  proActive = false;
  $('#license-key').value = '';
  $('#license-note').textContent = 'הרישיון הוסר מהדפדפן הזה.';
  refreshBranding();
});

$('#brand-accent').addEventListener('input', () => {
  branding.accent = $('#brand-accent').value;
  saveBranding(); refreshBranding();
});

$('#brand-logo').addEventListener('change', () => {
  const file = $('#brand-logo').files?.[0];
  if (!file) return;
  if (file.size > MAX_LOGO_BYTES) {
    $('#brand-note').textContent = 'הקובץ גדול מדי (עד 512KB).';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    if (!isValidLogo(reader.result)) { $('#brand-note').textContent = 'סוג הקובץ אינו נתמך.'; return; }
    branding.logo = reader.result;
    saveBranding(); refreshBranding();
    $('#brand-note').textContent = 'הלוגו נשמר בדפדפן שלך בלבד.';
  };
  reader.readAsDataURL(file);
});

$('#brand-clear').addEventListener('click', () => {
  branding.logo = null;
  $('#brand-logo').value = '';
  saveBranding(); refreshBranding();
});

// Checkout is offered only when Paddle is configured AND a public key exists to
// verify the licence it will produce. Selling a key nobody can verify would be
// taking money for nothing.
if (isProConfigured(site) && site?.pro?.publicKey) {
  const cta = $('#pro-cta');
  cta.disabled = false;
  cta.textContent = 'שדרוג ל-Pro';
  $('#pro-note').textContent = 'תשלום מאובטח דרך Paddle. לאחר התשלום יישלח אליך מפתח רישיון.';
  cta.addEventListener('click', () => {
    openProCheckout(site, { successUrl: `${location.origin}${location.pathname}?purchased=1` })
      .catch((e) => { $('#pro-note').textContent = `שגיאה בפתיחת התשלום: ${e.message}`; });
  });
}

if (new URLSearchParams(location.search).get('purchased') === '1') {
  $('#pro-activate').open = true;
  $('#license-note').textContent = 'תודה! הזן כאן את מפתח הרישיון שקיבלת במייל.';
}

const stored = loadStoredLicense();
if (stored) activate(stored, { announce: false });
refreshBranding();

// --- init
const savedBiz = store.getBusiness();
if (savedBiz) doc.business = { ...doc.business, ...savedBiz };
doc.number = nextDocumentNumber(store.listDocuments(), { type: doc.type });
fillForm(); renderPreview(); renderSaved(); renderClients();
