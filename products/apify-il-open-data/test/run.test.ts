import { describe, expect, it } from 'vitest';
import { CkanClient, CkanError } from '../src/ckan.js';
import { EVENT_DATASET_SEARCH, EVENT_RECORD, InputError, resolveInput, run, type ChargeResult, type RunDeps } from '../src/run.js';
import { fixture, mockFetch, noSleep, silentLog } from './helpers.js';

const RESOURCE = 'f004176c-b85f-4542-8901-7b3176f9a054';

function makeDeps(client: CkanClient, opts: { budget?: Record<string, number> } = {}) {
  const pushed: Array<Record<string, unknown>> = [];
  const stored = new Map<string, unknown>();
  const charges: Array<{ event: string; count: number }> = [];
  const budget = { ...(opts.budget ?? {}) };
  const deps: RunDeps = {
    client,
    charge: async (event, count): Promise<ChargeResult> => {
      charges.push({ event, count });
      if (!(event in budget)) return { chargedCount: count, eventChargeLimitReached: false };
      const allowed = Math.max(0, Math.min(count, budget[event]));
      budget[event] -= allowed;
      return { chargedCount: allowed, eventChargeLimitReached: budget[event] <= 0 };
    },
    pushData: async (items) => { pushed.push(...items); },
    setValue: async (key, value) => { stored.set(key, value); },
    log: silentLog,
  };
  return { deps, pushed, stored, charges };
}

describe('resolveInput', () => {
  it('applies defaults', () => {
    const r = resolveInput({ mode: 'fetch_records', resourceId: RESOURCE });
    expect(r).toMatchObject({ maxRecords: 100, offset: 0, translateFields: true, coerceTypes: true, outputFormat: 'json', baseUrl: 'https://data.gov.il' });
  });

  it('rejects bad input with actionable messages', () => {
    expect(() => resolveInput(null)).toThrow(InputError);
    expect(() => resolveInput({ mode: 'nope' as never })).toThrow(/"mode" must be/);
    expect(() => resolveInput({ mode: 'fetch_records' })).toThrow(/"resourceId" is required/);
    expect(() => resolveInput({ mode: 'fetch_records', resourceId: '123' })).toThrow(/UUID/);
    expect(() => resolveInput({ mode: 'search_datasets' })).toThrow(/"query" is required/);
    expect(() => resolveInput({ mode: 'fetch_records', resourceId: RESOURCE, maxRecords: 0 })).toThrow(/maxRecords/);
    expect(() => resolveInput({ mode: 'fetch_records', resourceId: RESOURCE, filters: [] as never })).toThrow(/filters/);
    expect(() => resolveInput({ mode: 'fetch_records', resourceId: RESOURCE, outputFormat: 'xml' as never })).toThrow(/outputFormat/);
    expect(() => resolveInput({ mode: 'fetch_records', resourceId: RESOURCE, pageSize: 5000 })).toThrow(/pageSize/);
  });

  it('drops empty filters and trims strings', () => {
    const r = resolveInput({ mode: 'fetch_records', resourceId: ` ${RESOURCE} `, filters: {}, query: '  ' });
    expect(r.filters).toBeUndefined();
    expect(r.query).toBeUndefined();
    expect(r.resourceId).toBe(RESOURCE);
  });
});

describe('run: search_datasets', () => {
  it('charges one dataset-search and pushes normalized datasets', async () => {
    const { impl, calls } = mockFetch([{ body: fixture('package_search.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps, pushed, charges } = makeDeps(client);
    const summary = await run({ mode: 'search_datasets', query: 'חברות', maxRecords: 10 }, deps);
    expect(charges).toEqual([{ event: EVENT_DATASET_SEARCH, count: 1 }]);
    expect(summary).toMatchObject({ returned: 2, total: 2, stoppedReason: 'exhausted', charged: { 'dataset-search': 1 } });
    expect(pushed[0]).toMatchObject({ name: 'ica_companies', organization_slug: 'ica' });
    expect(calls).toHaveLength(1);
  });

  it('respects maxRecords when the portal has more', async () => {
    const big = fixture('package_search.json') as { result: { count: number } };
    big.result.count = 500;
    const { impl } = mockFetch([{ body: big }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps, pushed } = makeDeps(client);
    const summary = await run({ mode: 'search_datasets', query: 'x', maxRecords: 2 }, deps);
    expect(pushed).toHaveLength(2);
    expect(summary.stoppedReason).toBe('max_records');
  });

  it('writes OUTPUT.csv when outputFormat=csv', async () => {
    const { impl } = mockFetch([{ body: fixture('package_search.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps, stored } = makeDeps(client);
    await run({ mode: 'search_datasets', query: 'x', outputFormat: 'csv' }, deps);
    const csv = stored.get('OUTPUT.csv') as string;
    expect(csv.startsWith('﻿dataset_id,')).toBe(true);
    expect(csv).toContain('ica_companies');
    expect(csv).toContain('f004176c-b85f-4542-8901-7b3176f9a054 (CSV, datastore)');
  });

  it('does nothing when the dataset-search budget is exhausted', async () => {
    const { impl, calls } = mockFetch([{ body: fixture('package_search.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps, pushed } = makeDeps(client, { budget: { [EVENT_DATASET_SEARCH]: 0 } });
    const summary = await run({ mode: 'search_datasets', query: 'x' }, deps);
    expect(summary.stoppedReason).toBe('charge_limit');
    expect(pushed).toHaveLength(0);
    expect(calls).toHaveLength(0);
  });
});

describe('run: fetch_records', () => {
  const pagedFetch = () => mockFetch((_url, i) => ({ body: fixture(i === 0 ? 'datastore_page1.json' : 'datastore_page2.json') }));

  it('paginates, normalizes, charges per record and stores FIELD_MAP', async () => {
    const { impl, calls } = pagedFetch();
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps, pushed, stored, charges } = makeDeps(client);
    // fixtures return 3 (full page) then 2 (<limit) -> exhaustion after two pages.
    const summary = await run({ mode: 'fetch_records', resourceId: RESOURCE, maxRecords: 100, pageSize: 3 }, deps);
    expect(calls).toHaveLength(2);
    expect(charges).toEqual([{ event: EVENT_RECORD, count: 3 }, { event: EVENT_RECORD, count: 2 }]);
    expect(summary).toMatchObject({ returned: 5, total: 5, stoppedReason: 'exhausted', charged: { record: 5 } });
    expect(pushed).toHaveLength(5);
    expect(pushed[0]).toMatchObject({ company_number: '510000001', company_name: 'חברת הדוגמה בע"מ', share_capital: 1000000, _resource_id: RESOURCE });
    expect(pushed[4]).toMatchObject({ company_number: '510000005', locality_name: 'אילת' });
    const fieldMap = stored.get('FIELD_MAP') as Array<{ original: string; key: string }>;
    expect(fieldMap.find((f) => f.original === 'תאריך התאגדות')?.key).toBe('incorporation_date');
    expect(fieldMap.find((f) => f.original === 'עמודה לא מוכרת')?.key).toBe('עמודה לא מוכרת');
  });

  it('stops at maxRecords and charges only for delivered records', async () => {
    const { impl, calls } = pagedFetch();
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps, pushed, charges } = makeDeps(client);
    const summary = await run({ mode: 'fetch_records', resourceId: RESOURCE, maxRecords: 3 }, deps);
    expect(calls).toHaveLength(1);
    expect(new URL(calls[0].url).searchParams.get('limit')).toBe('3');
    expect(pushed).toHaveLength(3);
    expect(charges).toEqual([{ event: EVENT_RECORD, count: 3 }]);
    expect(summary.stoppedReason).toBe('max_records');
  });

  it('truncates output to what the PPE budget allowed and stops', async () => {
    const { impl, calls } = pagedFetch();
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps, pushed } = makeDeps(client, { budget: { [EVENT_RECORD]: 2 } });
    const summary = await run({ mode: 'fetch_records', resourceId: RESOURCE, maxRecords: 100 }, deps);
    expect(pushed).toHaveLength(2);
    expect(summary).toMatchObject({ returned: 2, stoppedReason: 'charge_limit', charged: { record: 2 } });
    expect(calls).toHaveLength(1);
  });

  it('passes query, filters, sort and offset to the datastore API', async () => {
    const { impl, calls } = mockFetch([{ body: fixture('datastore_page2.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps } = makeDeps(client);
    await run({
      mode: 'fetch_records', resourceId: RESOURCE, query: 'בע"מ',
      filters: { 'סטטוס חברה': ['פעילה', 'מחוקה'] }, sort: 'תאריך התאגדות desc', offset: 3, maxRecords: 10,
    }, deps);
    const sp = new URL(calls[0].url).searchParams;
    expect(sp.get('q')).toBe('בע"מ');
    expect(JSON.parse(sp.get('filters')!)).toEqual({ 'סטטוס חברה': ['פעילה', 'מחוקה'] });
    expect(sp.get('sort')).toBe('תאריך התאגדות desc');
    expect(sp.get('offset')).toBe('3');
  });

  it('keeps Hebrew keys when translateFields=false', async () => {
    const { impl } = mockFetch([{ body: fixture('datastore_page2.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps, pushed } = makeDeps(client);
    await run({ mode: 'fetch_records', resourceId: RESOURCE, translateFields: false, coerceTypes: false }, deps);
    expect(pushed[0]['מספר חברה']).toBe('510000004');
    expect(pushed[0]['הון מניות']).toBe('10');
  });

  it('writes OUTPUT.csv with English headers', async () => {
    const { impl } = mockFetch([{ body: fixture('datastore_page2.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps, stored } = makeDeps(client);
    await run({ mode: 'fetch_records', resourceId: RESOURCE, outputFormat: 'csv' }, deps);
    const csv = stored.get('OUTPUT.csv') as string;
    const [header, first] = csv.replace(/^﻿/, '').split('\r\n');
    expect(header).toBe('_id,company_number,company_name,name_en,entity_type,company_status,incorporation_date,share_capital,is_violating,last_annual_report_year,locality_name,address,עמודה לא מוכרת,some_english_field,_resource_id');
    expect(first).toContain('510000004');
    expect(first).toContain("שד' רגר 5"); // plain cell, no quoting needed
  });

  it('propagates portal errors with no charge and no output', async () => {
    const { impl } = mockFetch([{ status: 404, body: fixture('datastore_not_found.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const { deps, pushed, charges } = makeDeps(client);
    const err = await run({ mode: 'fetch_records', resourceId: '00000000-0000-0000-0000-000000000000' }, deps).catch((e) => e);
    expect(err).toBeInstanceOf(CkanError);
    expect(err.kind).toBe('not_found');
    expect(pushed).toHaveLength(0);
    expect(charges).toHaveLength(0);
  });
});
