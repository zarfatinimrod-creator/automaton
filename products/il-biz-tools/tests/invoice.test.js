import { describe, it, expect } from 'vitest';
import {
  emptyDocument, computeTotals, nextDocumentNumber, validateDocument, createStore,
  formatDateHe, OSEK_PATUR_NOTE, DOC_TYPES, STORAGE_KEYS,
} from '../src/lib/invoice.js';

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

function sampleDoc(kind = 'patur') {
  const d = emptyDocument(new Date(2026, 8, 3));
  d.number = '1001';
  d.business = { name: 'סטודיו דנה', id: '123456789', kind };
  d.client = { name: 'לקוח בע"מ' };
  d.lines = [
    { description: 'עיצוב לוגו', quantity: 1, unitPrice: 1500 },
    { description: 'שעות ייעוץ', quantity: 2.5, unitPrice: 300 },
  ];
  return d;
}

describe('invoice / receipt', () => {
  it('creates an empty document with today\'s date', () => {
    const d = emptyDocument(new Date(2026, 0, 5));
    expect(d.date).toBe('2026-01-05');
    expect(d.type).toBe('receipt');
    expect(DOC_TYPES[d.type]).toBe('קבלה');
  });
  it('formats dates the Israeli way', () => {
    expect(formatDateHe('2026-09-03')).toBe('03.09.2026');
    expect(formatDateHe('junk')).toBe('junk');
  });
  it('computes totals without VAT for osek patur', () => {
    const t = computeTotals(sampleDoc('patur'));
    expect(t.lines[1].total).toBe(750);
    expect(t.subtotal).toBe(2250);
    expect(t.vat).toBe(0);
    expect(t.total).toBe(2250);
    expect(t.vatNote).toBe(OSEK_PATUR_NOTE);
  });
  it('adds 18% VAT for osek murshe', () => {
    const t = computeTotals(sampleDoc('murshe'));
    expect(t.vat).toBe(405);
    expect(t.total).toBe(2655);
    expect(t.vatNote).toBe('');
  });
  it('generates the next document number', () => {
    expect(nextDocumentNumber([])).toBe('1001');
    expect(nextDocumentNumber(['1001', '1005'])).toBe('1006');
    expect(nextDocumentNumber([{ number: '7', type: 'receipt' }, { number: '9', type: 'invoice' }], { type: 'receipt' })).toBe('8');
    expect(nextDocumentNumber([], { start: 1 })).toBe('1');
  });
  it('validates required fields in Hebrew', () => {
    expect(validateDocument(sampleDoc())).toEqual([]);
    const bad = emptyDocument();
    bad.date = 'x';
    const errors = validateDocument(bad);
    expect(errors).toContain('חסר שם העסק');
    expect(errors).toContain('חסר שם הלקוח');
    expect(errors).toContain('תאריך לא תקין');
    expect(errors).toContain('הסכום הכולל חייב להיות גדול מאפס');
  });
  it('stores documents, business and clients', () => {
    const storage = fakeStorage();
    const store = createStore(storage);
    expect(store.listDocuments()).toEqual([]);
    const saved = store.saveDocument(sampleDoc());
    expect(saved.id).toMatch(/^receipt-1001-/);
    expect(store.listDocuments()).toHaveLength(1);
    store.saveDocument(saved); // update, not duplicate
    expect(store.listDocuments()).toHaveLength(1);
    store.deleteDocument(saved.id);
    expect(store.listDocuments()).toHaveLength(0);

    store.saveBusiness({ name: 'x' });
    expect(store.getBusiness()).toEqual({ name: 'x' });
    store.saveClient({ name: 'א' });
    store.saveClient({ name: 'א', email: 'a@b.c' });
    store.saveClient({ name: '' });
    expect(store.listClients()).toEqual([{ name: 'א', email: 'a@b.c' }]);
    expect(storage.getItem(STORAGE_KEYS.clients)).toContain('a@b.c');
  });
  it('survives corrupted storage', () => {
    const storage = fakeStorage();
    storage.setItem(STORAGE_KEYS.documents, '{not json');
    expect(createStore(storage).listDocuments()).toEqual([]);
  });
});
