import { describe, expect, it, vi } from 'vitest';
import { CkanClient, CkanError, isValidResourceId } from '../src/ckan.js';
import { fixture, mockFetch, noSleep, silentLog } from './helpers.js';

const RESOURCE = 'f004176c-b85f-4542-8901-7b3176f9a054';

describe('CkanClient.packageSearch', () => {
  it('builds the documented package_search URL and returns the result', async () => {
    const { impl, calls } = mockFetch([{ body: fixture('package_search.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const result = await client.packageSearch({ q: 'חברות', rows: 50, start: 10 });
    expect(result.count).toBe(2);
    expect(result.results).toHaveLength(2);
    const url = new URL(calls[0].url);
    expect(url.origin + url.pathname).toBe('https://data.gov.il/api/3/action/package_search');
    expect(url.searchParams.get('q')).toBe('חברות');
    expect(url.searchParams.get('rows')).toBe('50');
    expect(url.searchParams.get('start')).toBe('10');
    expect((calls[0].init?.headers as Record<string, string>)['User-Agent']).toContain('apify-il-open-data');
  });

  it('caps rows at 1000 (CKAN limit)', async () => {
    const { impl, calls } = mockFetch([{ body: fixture('package_search.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    await client.packageSearch({ q: 'x', rows: 5000 });
    expect(new URL(calls[0].url).searchParams.get('rows')).toBe('1000');
  });
});

describe('CkanClient.datastoreSearch', () => {
  it('serializes filters as JSON and passes q/limit/offset/sort', async () => {
    const { impl, calls } = mockFetch([{ body: fixture('datastore_page1.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const page = await client.datastoreSearch({
      resourceId: RESOURCE,
      q: 'תל אביב',
      filters: { 'סטטוס חברה': 'פעילה' },
      limit: 3,
      offset: 0,
      sort: 'תאריך התאגדות desc',
    });
    expect(page.records).toHaveLength(3);
    expect(page.fields[1]).toEqual({ id: 'מספר חברה', type: 'text' });
    const sp = new URL(calls[0].url).searchParams;
    expect(sp.get('resource_id')).toBe(RESOURCE);
    expect(sp.get('q')).toBe('תל אביב');
    expect(JSON.parse(sp.get('filters')!)).toEqual({ 'סטטוס חברה': 'פעילה' });
    expect(sp.get('limit')).toBe('3');
    expect(sp.get('sort')).toBe('תאריך התאגדות desc');
  });

  it('rejects invalid resource ids without hitting the network', async () => {
    const { impl, calls } = mockFetch([]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    await expect(client.datastoreSearch({ resourceId: 'not-a-uuid' })).rejects.toMatchObject({
      name: 'CkanError',
      kind: 'validation',
    });
    expect(calls).toHaveLength(0);
    expect(isValidResourceId(RESOURCE)).toBe(true);
    expect(isValidResourceId('abc')).toBe(false);
  });

  it('maps a 404 / Not Found Error to a helpful not_found error (no retry)', async () => {
    const { impl, calls } = mockFetch([{ status: 404, body: fixture('datastore_not_found.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const err = await client.datastoreSearch({ resourceId: '00000000-0000-0000-0000-000000000000' }).catch((e) => e);
    expect(err).toBeInstanceOf(CkanError);
    expect(err.kind).toBe('not_found');
    expect(err.status).toBe(404);
    expect(err.message).toContain('00000000-0000-0000-0000-000000000000');
    expect(err.message).toContain('datastore_active');
    expect(calls).toHaveLength(1);
  });

  it('maps a 409 validation error and mentions column names', async () => {
    const { impl } = mockFetch([{ status: 409, body: fixture('datastore_validation_error.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const err = await client.datastoreSearch({ resourceId: RESOURCE, filters: { 'סטטוס': 'x' } }).catch((e) => e);
    expect(err.kind).toBe('validation');
    expect(err.message).toContain('ORIGINAL column names');
    expect(err.message).toContain('not in table');
  });

  it('retries on 5xx with backoff and then succeeds', async () => {
    const sleeps: number[] = [];
    const { impl, calls } = mockFetch([
      { status: 503, text: '<html>Service Unavailable</html>' },
      { status: 502, text: '' },
      { body: fixture('datastore_page1.json') },
    ]);
    const client = new CkanClient({
      fetch: impl,
      sleep: async (ms) => { sleeps.push(ms); },
      minIntervalMs: 0,
      backoffMs: 100,
      maxRetries: 4,
      logger: silentLog,
    });
    const page = await client.datastoreSearch({ resourceId: RESOURCE, limit: 3 });
    expect(page.records).toHaveLength(3);
    expect(calls).toHaveLength(3);
    expect(sleeps).toHaveLength(2);
    expect(sleeps[0]).toBeGreaterThanOrEqual(100);
    expect(sleeps[0]).toBeLessThan(200);
    expect(sleeps[1]).toBeGreaterThanOrEqual(200);
    expect(client.requestCount).toBe(3);
  });

  it('gives up after maxRetries and surfaces a server error', async () => {
    const { impl, calls } = mockFetch([{ status: 500, text: 'boom' }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0, maxRetries: 2, logger: silentLog });
    const err = await client.datastoreSearch({ resourceId: RESOURCE }).catch((e) => e);
    expect(err.kind).toBe('server');
    expect(err.status).toBe(500);
    expect(calls).toHaveLength(3); // 1 + 2 retries
  });

  it('honours Retry-After on 429', async () => {
    const sleeps: number[] = [];
    const { impl } = mockFetch([
      { status: 429, text: '', headers: { 'retry-after': '2' } },
      { body: fixture('datastore_page1.json') },
    ]);
    const client = new CkanClient({ fetch: impl, sleep: async (ms) => { sleeps.push(ms); }, minIntervalMs: 0, logger: silentLog });
    await client.datastoreSearch({ resourceId: RESOURCE });
    expect(sleeps).toEqual([2000]);
  });

  it('retries on network errors but not on 403', async () => {
    const net = mockFetch([{ throwError: new Error('ECONNRESET') }, { body: fixture('datastore_page1.json') }]);
    const client = new CkanClient({ fetch: net.impl, sleep: noSleep, minIntervalMs: 0, logger: silentLog });
    await expect(client.datastoreSearch({ resourceId: RESOURCE })).resolves.toBeTruthy();
    expect(net.calls).toHaveLength(2);

    const forbidden = mockFetch([{ status: 403, text: 'Forbidden' }]);
    const client2 = new CkanClient({ fetch: forbidden.impl, sleep: noSleep, minIntervalMs: 0, logger: silentLog });
    const err = await client2.datastoreSearch({ resourceId: RESOURCE }).catch((e) => e);
    expect(err.kind).toBe('forbidden');
    expect(forbidden.calls).toHaveLength(1);
  });

  it('times out slow responses and retries', async () => {
    vi.useFakeTimers();
    try {
      const { impl, calls } = mockFetch([{ delayMs: 10_000, body: {} }, { body: fixture('datastore_page1.json') }]);
      const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0, timeoutMs: 50, logger: silentLog });
      const promise = client.datastoreSearch({ resourceId: RESOURCE });
      await vi.advanceTimersByTimeAsync(60);
      const page = await promise;
      expect(page.records).toHaveLength(3);
      expect(calls).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('errors clearly on non-JSON success bodies', async () => {
    const { impl } = mockFetch([{ status: 200, text: '<html>captcha</html>' }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const err = await client.datastoreSearch({ resourceId: RESOURCE }).catch((e) => e);
    expect(err.kind).toBe('bad_response');
    expect(err.message).toContain('non-JSON');
  });

  it('rate-limits consecutive requests by minIntervalMs', async () => {
    const sleeps: number[] = [];
    const { impl } = mockFetch([{ body: fixture('datastore_page1.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: async (ms) => { sleeps.push(ms); }, minIntervalMs: 200 });
    await client.datastoreSearch({ resourceId: RESOURCE });
    await client.datastoreSearch({ resourceId: RESOURCE });
    expect(sleeps.length).toBe(1);
    expect(sleeps[0]).toBeGreaterThan(0);
    expect(sleeps[0]).toBeLessThanOrEqual(200);
  });
});

describe('CkanClient.iterateRecords', () => {
  it('pages through the resource and stops at maxRecords', async () => {
    const { impl, calls } = mockFetch((_url, i) => ({ body: fixture(i === 0 ? 'datastore_page1.json' : 'datastore_page2.json') }));
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    const pages: number[] = [];
    for await (const { page } of client.iterateRecords({ resourceId: RESOURCE, maxRecords: 5, pageSize: 3 })) {
      pages.push(page.records.length);
    }
    expect(pages).toEqual([3, 2]);
    expect(calls).toHaveLength(2);
    expect(new URL(calls[1].url).searchParams.get('offset')).toBe('3');
    expect(new URL(calls[1].url).searchParams.get('limit')).toBe('2');
  });

  it('stops when the portal returns fewer records than requested', async () => {
    const { impl, calls } = mockFetch([{ body: fixture('datastore_page2.json') }]);
    const client = new CkanClient({ fetch: impl, sleep: noSleep, minIntervalMs: 0 });
    let n = 0;
    for await (const { page } of client.iterateRecords({ resourceId: RESOURCE, maxRecords: 100, pageSize: 50 })) n += page.records.length;
    expect(n).toBe(2);
    expect(calls).toHaveLength(1);
  });
});
