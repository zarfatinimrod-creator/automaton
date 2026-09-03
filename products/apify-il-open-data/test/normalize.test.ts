import { describe, expect, it } from 'vitest';
import {
  buildFieldMap,
  coerceValue,
  normalizePackage,
  normalizeRecords,
  parseDate,
  toSnakeCase,
  translateKey,
} from '../src/normalize.js';
import { HEBREW_FIELD_DICTIONARY } from '../src/dictionary.js';
import type { CkanDatastoreResult, CkanPackage, CkanPackageSearchResult } from '../src/types.js';
import { fixture } from './helpers.js';

describe('translateKey', () => {
  it('translates known Hebrew column names', () => {
    expect(translateKey('מספר חברה')).toEqual({ key: 'company_number', translated: true });
    expect(translateKey('שם עמותה')).toEqual({ key: 'ngo_name', translated: true });
    expect(translateKey('מספר מכרז')).toEqual({ key: 'tender_number', translated: true });
  });

  it('is tolerant to whitespace, quotes and underscores', () => {
    expect(translateKey('  מספר   חברה ').key).toBe('company_number');
    expect(translateKey('דוא"ל').key).toBe('email');
    expect(translateKey('דוא״ל').key).toBe('email');
    expect(translateKey('שם_חברה').key).toBe('company_name');
    expect(translateKey('שם חברה (חובה)').key).toBe('company_name');
  });

  it('keeps unknown Hebrew names verbatim and snake_cases English names', () => {
    expect(translateKey('עמודה לא מוכרת')).toEqual({ key: 'עמודה לא מוכרת', translated: false });
    expect(translateKey('Some English Field')).toEqual({ key: 'some_english_field', translated: false });
    expect(translateKey('_id')).toEqual({ key: '_id', translated: false });
    expect(toSnakeCase('CompanyNumberID')).toBe('company_number_id');
  });

  it('lets user-supplied mappings override the dictionary', () => {
    expect(translateKey('עמודה לא מוכרת', { 'עמודה לא מוכרת': 'custom' })).toEqual({ key: 'custom', translated: true });
    expect(translateKey('מספר חברה', { 'מספר חברה': 'registration_number' }).key).toBe('registration_number');
  });

  it('dictionary has no duplicate normalized keys mapping to different values', () => {
    const seen = new Map<string, string>();
    for (const [he, en] of Object.entries(HEBREW_FIELD_DICTIONARY)) {
      const norm = he.replace(/["'׳״]/g, '').replace(/[_\-./\\]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      const prev = seen.get(norm);
      expect(prev === undefined || prev === en, `conflict for ${he}: ${prev} vs ${en}`).toBe(true);
      seen.set(norm, en);
      expect(en).toMatch(/^[a-z0-9_]+$/);
    }
    expect(Object.keys(HEBREW_FIELD_DICTIONARY).length).toBeGreaterThan(150);
  });
});

describe('coerceValue / parseDate', () => {
  it('coerces by declared datastore type', () => {
    expect(coerceValue('1,000,000', 'numeric')).toBe(1000000);
    expect(coerceValue('250.5', 'numeric')).toBe(250.5);
    expect(coerceValue('2025', 'int')).toBe(2025);
    expect(coerceValue('abc', 'int')).toBe('abc');
    expect(coerceValue('', 'int')).toBeNull();
    expect(coerceValue(null, 'text')).toBeNull();
    expect(coerceValue('  ', 'text')).toBeNull();
    expect(coerceValue(' hello ', 'text')).toBe('hello');
    expect(coerceValue('כן', 'bool')).toBe(true);
    expect(coerceValue('לא', 'bool')).toBe(false);
    expect(coerceValue(12.7, 'int')).toBe(12);
    expect(coerceValue('510000001', 'text')).toBe('510000001'); // ids stay strings
  });

  it('normalizes dates from ISO and Israeli formats', () => {
    expect(parseDate('1990-03-04T00:00:00')).toBe('1990-03-04');
    expect(parseDate('2010-11-30T13:45:10')).toBe('2010-11-30T13:45:10');
    expect(parseDate('15/07/2003')).toBe('2003-07-15');
    expect(parseDate('5.1.2021')).toBe('2021-01-05');
    expect(parseDate('05-01-2021 09:30')).toBe('2021-01-05T09:30:00');
    expect(parseDate('not a date')).toBeNull();
    expect(parseDate('31/13/2020')).toBeNull();
    expect(coerceValue('15/07/2003', 'timestamp')).toBe('2003-07-15');
    expect(coerceValue('garbage', 'timestamp')).toBe('garbage');
  });
});

describe('buildFieldMap / normalizeRecords', () => {
  const page = (fixture('datastore_page1.json') as { result: CkanDatastoreResult }).result;

  it('translates, coerces and preserves unknown columns', () => {
    const map = buildFieldMap(page.fields, { translateFields: true, coerceTypes: true });
    expect(map.find((f) => f.original === 'מספר חברה')).toMatchObject({ key: 'company_number', translated: true, type: 'text' });
    const rows = normalizeRecords(page.records, map, { translateFields: true, coerceTypes: true });
    expect(rows[0]).toEqual({
      _id: 1,
      company_number: '510000001',
      company_name: 'חברת הדוגמה בע"מ',
      name_en: 'EXAMPLE COMPANY LTD',
      entity_type: 'חברה פרטית',
      company_status: 'פעילה',
      incorporation_date: '1990-03-04',
      share_capital: 1000000,
      is_violating: 'לא',
      last_annual_report_year: 2025,
      locality_name: 'תל אביב - יפו',
      address: 'רחוב הרצל 1',
      'עמודה לא מוכרת': 'ערך',
      some_english_field: 'abc',
    });
    expect(rows[1]).toMatchObject({
      name_en: null,
      incorporation_date: '2003-07-15',
      share_capital: null,
      last_annual_report_year: null,
      address: null,
    });
    expect(rows[2].incorporation_date).toBe('2010-11-30T13:45:10');
    expect(rows[2].share_capital).toBe(250.5);
    expect(rows[2].last_annual_report_year).toBe(2024);
  });

  it('keeps original keys and raw values when both options are off', () => {
    const map = buildFieldMap(page.fields, { translateFields: false, coerceTypes: false });
    const rows = normalizeRecords(page.records, map, { translateFields: false, coerceTypes: false });
    expect(rows[0]['מספר חברה']).toBe('510000001');
    expect(rows[0]['הון מניות']).toBe('1,000,000');
    expect(rows[1]['שם באנגלית']).toBe('');
  });

  it('de-duplicates colliding English keys', () => {
    const map = buildFieldMap(
      [{ id: 'תאור', type: 'text' }, { id: 'תיאור', type: 'text' }, { id: 'description', type: 'text' }],
      { translateFields: true, coerceTypes: true },
    );
    expect(map.map((m) => m.key)).toEqual(['description', 'description_2', 'description_3']);
  });
});

describe('normalizePackage', () => {
  const search = (fixture('package_search.json') as { result: CkanPackageSearchResult }).result;

  it('flattens a CKAN package into an English-keyed dataset item', () => {
    const item = normalizePackage(search.results[0]);
    expect(item).toMatchObject({
      dataset_id: '246d949c-a253-4a36-a4d5-d0c2e4b5b2c1',
      name: 'ica_companies',
      title: 'רשם החברות - חברות',
      organization: 'רשות התאגידים',
      organization_slug: 'ica',
      license: 'רישיון ממשלתי חופשי',
      tags: ['חברות', 'רשם החברות'],
      portal_url: 'https://data.gov.il/dataset/ica_companies',
    });
    expect(item.resources[0]).toEqual({
      resource_id: 'f004176c-b85f-4542-8901-7b3176f9a054',
      name: 'חברות',
      format: 'CSV',
      datastore_active: true,
      url: expect.stringContaining('companies.csv'),
      last_modified: '2026-08-31T02:10:05.011201',
    });
  });

  it('handles nulls gracefully', () => {
    const item = normalizePackage(search.results[1] as CkanPackage);
    expect(item.description).toBeNull();
    expect(item.organization).toBeNull();
    expect(item.license).toBeNull();
    expect(item.tags).toEqual([]);
    expect(item.resources[1].datastore_active).toBe(false);
    expect(item.resources[0].last_modified).toBeNull();
  });
});
