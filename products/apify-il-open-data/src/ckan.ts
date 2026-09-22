/**
 * Minimal, robust client for the CKAN 2.x Action API as exposed by data.gov.il.
 * Only the documented JSON endpoints are used - never HTML scraping.
 *
 * Features: request timeout, retries with exponential backoff + jitter (429/5xx/network),
 * client-side rate limiting, and human-readable errors.
 */
import type {
  CkanDatastoreResult,
  CkanEnvelope,
  CkanPackageSearchResult,
} from './types.js';

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface CkanClientOptions {
  baseUrl?: string;
  /** Per-request timeout in ms (default 30 000). */
  timeoutMs?: number;
  /** Retries after the first attempt (default 4). */
  maxRetries?: number;
  /** Base backoff in ms; doubles each retry (default 500). */
  backoffMs?: number;
  /** Minimum gap between two requests in ms (default 200 ≈ 5 req/s). */
  minIntervalMs?: number;
  /** Injectable fetch (tests) - defaults to global fetch. */
  fetch?: FetchLike;
  /** Injectable sleep (tests). */
  sleep?: (ms: number) => Promise<void>;
  userAgent?: string;
  logger?: { info: (msg: string) => void; warning: (msg: string) => void; debug?: (msg: string) => void };
}

export interface DatastoreSearchParams {
  resourceId: string;
  q?: string;
  filters?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  sort?: string;
  fields?: string[];
  includeTotal?: boolean;
}

export interface PackageSearchParams {
  q?: string;
  rows?: number;
  start?: number;
  /** Solr filter query, e.g. 'organization:ica' */
  fq?: string;
  sort?: string;
}

export type CkanErrorKind =
  | 'not_found'
  | 'validation'
  | 'rate_limited'
  | 'forbidden'
  | 'server'
  | 'timeout'
  | 'network'
  | 'bad_response';

export class CkanError extends Error {
  readonly kind: CkanErrorKind;
  readonly status?: number;
  readonly action: string;
  readonly retryable: boolean;

  constructor(kind: CkanErrorKind, action: string, message: string, status?: number) {
    super(message);
    this.name = 'CkanError';
    this.kind = kind;
    this.action = action;
    this.status = status;
    this.retryable = kind === 'rate_limited' || kind === 'server' || kind === 'timeout' || kind === 'network';
  }
}

const DEFAULT_BASE_URL = 'https://data.gov.il';
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
/** CKAN's default hard cap for datastore_search 'limit' is 32 000; data.gov.il is reliably fine with 1 000. */
export const DATASTORE_PAGE_SIZE = 1000;
/** CKAN caps package_search 'rows' at 1 000. */
export const PACKAGE_PAGE_SIZE = 1000;

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function isValidResourceId(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id.trim());
}

export class CkanClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly backoffMs: number;
  private readonly minIntervalMs: number;
  private readonly fetchImpl: FetchLike;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly userAgent: string;
  private readonly logger: NonNullable<CkanClientOptions['logger']>;
  private lastRequestAt = 0;
  private queue: Promise<void> = Promise.resolve();
  /** Number of HTTP requests actually sent (for run summaries / tests). */
  requestCount = 0;

  constructor(options: CkanClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    if (!/^https?:\/\//.test(this.baseUrl)) {
      throw new CkanError('validation', 'init', `baseUrl must start with http(s)://, got "${this.baseUrl}"`);
    }
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.maxRetries = options.maxRetries ?? 4;
    this.backoffMs = options.backoffMs ?? 500;
    this.minIntervalMs = options.minIntervalMs ?? 200;
    const f = options.fetch ?? (globalThis.fetch as FetchLike | undefined);
    if (!f) throw new CkanError('network', 'init', 'No fetch implementation available (Node 18+ required).');
    this.fetchImpl = f;
    this.sleep = options.sleep ?? defaultSleep;
    this.userAgent = options.userAgent ?? 'apify-il-open-data/1.0 (+https://apify.com; CKAN JSON API client)';
    this.logger = options.logger ?? { info: () => {}, warning: () => {}, debug: () => {} };
  }

  /** Search the catalogue (datasets/packages). */
  async packageSearch(params: PackageSearchParams = {}): Promise<CkanPackageSearchResult> {
    const rows = clampInt(params.rows ?? 20, 0, PACKAGE_PAGE_SIZE);
    const start = clampInt(params.start ?? 0, 0, Number.MAX_SAFE_INTEGER);
    const search = new URLSearchParams();
    if (params.q && params.q.trim()) search.set('q', params.q.trim());
    if (params.fq) search.set('fq', params.fq);
    if (params.sort) search.set('sort', params.sort);
    search.set('rows', String(rows));
    search.set('start', String(start));
    const result = await this.call<CkanPackageSearchResult>('package_search', search);
    if (!result || !Array.isArray(result.results)) {
      throw new CkanError('bad_response', 'package_search', 'CKAN returned a success envelope without a results array.');
    }
    return result;
  }

  /** Fetch one page of rows from a datastore resource. */
  async datastoreSearch(params: DatastoreSearchParams): Promise<CkanDatastoreResult> {
    const resourceId = (params.resourceId ?? '').trim();
    if (!isValidResourceId(resourceId)) {
      throw new CkanError(
        'validation',
        'datastore_search',
        `resourceId must be a UUID like "f004176c-b85f-4542-8901-7b3176f9a054", got "${params.resourceId}". ` +
          'Find it with mode=search_datasets or in the resource page URL on data.gov.il.',
      );
    }
    const limit = clampInt(params.limit ?? 100, 0, DATASTORE_PAGE_SIZE);
    const offset = clampInt(params.offset ?? 0, 0, Number.MAX_SAFE_INTEGER);
    const search = new URLSearchParams();
    search.set('resource_id', resourceId);
    search.set('limit', String(limit));
    search.set('offset', String(offset));
    if (params.q && params.q.trim()) search.set('q', params.q.trim());
    if (params.filters && Object.keys(params.filters).length > 0) {
      search.set('filters', JSON.stringify(params.filters));
    }
    if (params.sort) search.set('sort', params.sort);
    if (params.fields && params.fields.length > 0) search.set('fields', params.fields.join(','));
    if (params.includeTotal === false) search.set('include_total', 'false');
    const result = await this.call<CkanDatastoreResult>('datastore_search', search, { resourceId });
    if (!result || !Array.isArray(result.records) || !Array.isArray(result.fields)) {
      throw new CkanError('bad_response', 'datastore_search', 'CKAN returned a success envelope without records/fields arrays.');
    }
    return result;
  }

  /**
   * Iterate datastore records page by page until `maxRecords` are yielded or the resource is exhausted.
   * Yields whole pages so the caller can charge/push in batches.
   */
  async *iterateRecords(
    params: Omit<DatastoreSearchParams, 'limit'> & { maxRecords: number; pageSize?: number },
  ): AsyncGenerator<{ page: CkanDatastoreResult; pageIndex: number }> {
    const pageSize = clampInt(params.pageSize ?? DATASTORE_PAGE_SIZE, 1, DATASTORE_PAGE_SIZE);
    let offset = params.offset ?? 0;
    let remaining = Math.max(0, Math.floor(params.maxRecords));
    let pageIndex = 0;
    while (remaining > 0) {
      const limit = Math.min(pageSize, remaining);
      const page = await this.datastoreSearch({ ...params, limit, offset });
      if (page.records.length === 0) return;
      yield { page, pageIndex };
      pageIndex += 1;
      remaining -= page.records.length;
      offset += page.records.length;
      if (page.records.length < limit) return; // last page
      if (typeof page.total === 'number' && offset >= page.total) return;
    }
  }

  // ---------------------------------------------------------------------------

  private async call<T>(action: string, search: URLSearchParams, ctx: { resourceId?: string } = {}): Promise<T> {
    const url = `${this.baseUrl}/api/3/action/${action}?${search.toString()}`;
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await this.once<T>(action, url, ctx);
      } catch (err) {
        const e = err instanceof CkanError ? err : new CkanError('network', action, String((err as Error)?.message ?? err));
        if (!e.retryable || attempt >= this.maxRetries) throw e;
        const delay = this.backoffDelay(attempt, e);
        this.logger.warning(`${action}: ${e.kind} (${e.message}). Retry ${attempt + 1}/${this.maxRetries} in ${delay} ms.`);
        await this.sleep(delay);
        attempt += 1;
      }
    }
  }

  private retryAfterMs: number | undefined;

  private backoffDelay(attempt: number, err: CkanError): number {
    if (err.kind === 'rate_limited' && this.retryAfterMs) return this.retryAfterMs;
    const base = this.backoffMs * 2 ** attempt;
    const jitter = Math.floor(Math.random() * this.backoffMs);
    return Math.min(base + jitter, 60_000);
  }

  private async throttle(): Promise<void> {
    // Serialize through a promise chain so concurrent callers still respect the interval.
    const previous = this.queue;
    let release!: () => void;
    this.queue = new Promise<void>((resolve) => (release = resolve));
    await previous;
    try {
      const wait = this.lastRequestAt + this.minIntervalMs - Date.now();
      if (wait > 0) await this.sleep(wait);
      this.lastRequestAt = Date.now();
    } finally {
      release();
    }
  }

  private async once<T>(action: string, url: string, ctx: { resourceId?: string }): Promise<T> {
    await this.throttle();
    this.requestCount += 1;
    this.logger.debug?.(`GET ${url}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        headers: { Accept: 'application/json', 'User-Agent': this.userAgent },
        signal: controller.signal,
      });
    } catch (err) {
      const e = err as Error & { name?: string; code?: string };
      if (e?.name === 'AbortError') {
        throw new CkanError('timeout', action, `Request to data portal timed out after ${this.timeoutMs} ms.`);
      }
      throw new CkanError('network', action, `Network error talking to ${this.baseUrl}: ${e?.message ?? String(err)}`);
    } finally {
      clearTimeout(timer);
    }

    const status = response.status;
    const text = await response.text();
    let body: CkanEnvelope<T> | undefined;
    try {
      body = text ? (JSON.parse(text) as CkanEnvelope<T>) : undefined;
    } catch {
      body = undefined;
    }

    if (status === 429) {
      const ra = Number(response.headers.get('retry-after'));
      this.retryAfterMs = Number.isFinite(ra) && ra > 0 ? ra * 1000 : undefined;
      throw new CkanError('rate_limited', action, 'The data portal is rate-limiting requests (HTTP 429).', status);
    }
    if (status >= 500) {
      throw new CkanError('server', action, `The data portal returned HTTP ${status}. It may be temporarily unavailable.`, status);
    }
    if (status === 403 || status === 401) {
      throw new CkanError(
        'forbidden',
        action,
        `The data portal refused the request (HTTP ${status}). data.gov.il blocks some clients; try again later or contact the portal.`,
        status,
      );
    }
    if (status === 404 || body?.error?.__type === 'Not Found Error') {
      const what = ctx.resourceId ? `Resource "${ctx.resourceId}"` : 'The requested object';
      throw new CkanError(
        'not_found',
        action,
        `${what} was not found on ${this.baseUrl}. Check the resourceId, and make sure the resource has "datastore_active": true (use mode=search_datasets).`,
        status,
      );
    }
    if (status === 409 || body?.error?.__type === 'Validation Error') {
      const detail = body?.error ? JSON.stringify(body.error) : text.slice(0, 300);
      throw new CkanError(
        'validation',
        action,
        `The data portal rejected the query parameters (validation error). Check filter/sort column names - they must be the ORIGINAL column names. Details: ${detail}`,
        status,
      );
    }
    if (!body) {
      throw new CkanError(
        'bad_response',
        action,
        `Expected JSON from ${action} but got HTTP ${status} with non-JSON body: ${text.slice(0, 200)}`,
        status,
      );
    }
    if (status >= 400 || body.success === false) {
      const detail = body.error?.message ?? JSON.stringify(body.error ?? {});
      throw new CkanError('bad_response', action, `CKAN ${action} failed (HTTP ${status}): ${detail}`, status);
    }
    return body.result as T;
  }
}

function clampInt(value: number, min: number, max: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}
