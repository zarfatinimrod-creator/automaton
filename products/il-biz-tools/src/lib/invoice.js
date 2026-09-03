import { round2 } from './money.js';
import { DEFAULT_VAT_RATE } from './vat.js';

export const DOC_TYPES = {
  receipt: 'קבלה',
  invoice: 'חשבונית עסקה',
  'invoice-receipt': 'חשבונית עסקה / קבלה',
};

export const PAYMENT_METHODS = {
  transfer: 'העברה בנקאית',
  bit: 'ביט / פייבוקס',
  cash: 'מזומן',
  check: "צ'ק",
  card: 'כרטיס אשראי',
  paypal: 'PayPal',
  other: 'אחר',
};

export const OSEK_PATUR_NOTE = 'עוסק פטור - לא חייב במע״מ';

export const STORAGE_KEYS = {
  business: 'ilbiz.business',
  documents: 'ilbiz.documents',
  clients: 'ilbiz.clients',
};

export function emptyDocument(today = new Date()) {
  return {
    id: '',
    type: 'receipt',
    number: '',
    date: toISODate(today),
    business: { name: '', id: '', address: '', phone: '', email: '', kind: 'patur' },
    client: { name: '', id: '', address: '', email: '' },
    lines: [{ description: '', quantity: 1, unitPrice: 0 }],
    paymentMethod: 'transfer',
    paymentDetails: '',
    notes: '',
    vatRate: DEFAULT_VAT_RATE,
  };
}

export function toISODate(d) {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

/** Format ISO date as Israeli dd.mm.yyyy */
export function formatDateHe(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ''));
  if (!m) return String(iso ?? '');
  return `${m[3]}.${m[2]}.${m[1]}`;
}

/**
 * Totals. Osek patur: no VAT line. Osek murshe: VAT added on top of line totals.
 */
export function computeTotals(doc) {
  const lines = (doc.lines ?? []).map((l) => {
    const quantity = Number(l.quantity) || 0;
    const unitPrice = Number(l.unitPrice) || 0;
    return { ...l, quantity, unitPrice, total: round2(quantity * unitPrice) };
  });
  const subtotal = round2(lines.reduce((a, l) => a + l.total, 0));
  const isPatur = doc.business?.kind === 'patur';
  const rate = isPatur ? 0 : Number(doc.vatRate ?? DEFAULT_VAT_RATE);
  const vat = round2(subtotal * rate);
  const total = round2(subtotal + vat);
  return { lines, subtotal, vatRate: rate, vat, total, isPatur, vatNote: isPatur ? OSEK_PATUR_NOTE : '' };
}

/** Next sequential document number, e.g. numbers ["1001","1002"] -> "1003". Blank list -> start. */
export function nextDocumentNumber(existingNumbers, { start = 1001, type } = {}) {
  const nums = (existingNumbers ?? [])
    .filter((x) => !type || x.type === type)
    .map((x) => (typeof x === 'object' ? x.number : x))
    .map((s) => parseInt(String(s).replace(/\D/g, ''), 10))
    .filter((n) => Number.isFinite(n));
  const max = nums.length ? Math.max(...nums) : start - 1;
  return String(max + 1);
}

/** Returns an array of Hebrew error messages; empty = valid. */
export function validateDocument(doc) {
  const errors = [];
  if (!doc.business?.name?.trim()) errors.push('חסר שם העסק');
  if (!doc.business?.id?.trim()) errors.push('חסר מספר עוסק / ת.ז.');
  if (!doc.number?.toString().trim()) errors.push('חסר מספר מסמך');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.date ?? '')) errors.push('תאריך לא תקין');
  if (!doc.client?.name?.trim()) errors.push('חסר שם הלקוח');
  if (!DOC_TYPES[doc.type]) errors.push('סוג מסמך לא תקין');
  const { lines, total } = computeTotals(doc);
  if (!lines.length || lines.every((l) => !l.description?.trim())) errors.push('יש להוסיף לפחות שורת פירוט אחת');
  if (lines.some((l) => l.quantity < 0 || l.unitPrice < 0)) errors.push('כמות ומחיר חייבים להיות חיוביים');
  if (!(total > 0)) errors.push('הסכום הכולל חייב להיות גדול מאפס');
  return errors;
}

/**
 * Minimal storage adapter around localStorage-like object (getItem/setItem).
 * Pure enough to test with a Map-backed fake.
 */
export function createStore(storage) {
  const read = (key, fallback) => {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => storage.setItem(key, JSON.stringify(value));

  return {
    getBusiness: () => read(STORAGE_KEYS.business, null),
    saveBusiness: (b) => write(STORAGE_KEYS.business, b),
    listDocuments: () => read(STORAGE_KEYS.documents, []),
    saveDocument(doc) {
      const docs = read(STORAGE_KEYS.documents, []);
      const id = doc.id || `${doc.type}-${doc.number}-${Date.now()}`;
      const saved = { ...doc, id, savedAt: new Date().toISOString() };
      const idx = docs.findIndex((d) => d.id === id);
      if (idx >= 0) docs[idx] = saved; else docs.push(saved);
      write(STORAGE_KEYS.documents, docs);
      return saved;
    },
    deleteDocument(id) {
      write(STORAGE_KEYS.documents, read(STORAGE_KEYS.documents, []).filter((d) => d.id !== id));
    },
    listClients: () => read(STORAGE_KEYS.clients, []),
    saveClient(client) {
      const clients = read(STORAGE_KEYS.clients, []);
      const key = (client.name ?? '').trim();
      if (!key) return clients;
      const idx = clients.findIndex((c) => c.name.trim() === key);
      if (idx >= 0) clients[idx] = client; else clients.push(client);
      write(STORAGE_KEYS.clients, clients);
      return clients;
    },
  };
}
