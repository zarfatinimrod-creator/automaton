/**
 * Platform-agnostic orchestration: validates input, drives the CKAN client, normalizes,
 * charges per event, and pushes output through injected callbacks. `main.ts` wires it to Apify.
 */
import { CkanClient, CkanError, DATASTORE_PAGE_SIZE, PACKAGE_PAGE_SIZE, isValidResourceId } from './ckan.js';
import { toCsv } from './csv.js';
import { buildFieldMap, normalizePackage, normalizeRecords, type FieldMapping } from './normalize.js';
import type { ActorInput, DatasetItem } from './types.js';

export const EVENT_RECORD = 'record';
export const EVENT_DATASET_SEARCH = 'dataset-search';

export interface ChargeResult {
  /** How many of the requested `count` were actually charged (0 when budget exhausted). */
  chargedCount: number;
  eventChargeLimitReached: boolean;
}

export interface RunDeps {
  client: CkanClient;
  charge: (eventName: string, count: number) => Promise<ChargeResult>;
  pushData: (items: Array<Record<string, unknown>>) => Promise<void>;
  setValue: (key: string, value: unknown, options?: { contentType?: string }) => Promise<void>;
  log: { info: (msg: string) => void; warning: (msg: string) => void; error: (msg: string) => void };
}

export interface RunSummary {
  mode: ActorInput['mode'];
  returned: number;
  charged: Record<string, number>;
  requests: number;
  stoppedReason: 'done' | 'max_records' | 'charge_limit' | 'exhausted';
  fieldMap?: FieldMapping[];
  total?: number;
}

export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InputError';
  }
}

export interface ResolvedInput {
  mode: ActorInput['mode'];
  query: string | undefined;
  resourceId: string | undefined;
  filters: Record<string, unknown> | undefined;
  maxRecords: number;
  offset: number;
  translateFields: boolean;
  coerceTypes: boolean;
  outputFormat: 'json' | 'csv';
  sort: string | undefined;
  baseUrl: string;
}

export function resolveInput(raw: Partial<ActorInput> | null | undefined): ResolvedInput {
  const input = raw ?? {};
  const mode = input.mode;
  if (mode !== 'search_datasets' && mode !== 'fetch_records') {
    throw new InputError(`"mode" must be "search_datasets" or "fetch_records" (got ${JSON.stringify(mode)}).`);
  }
  const maxRecords = Math.floor(Number(input.maxRecords ?? 100));
  if (!Number.isFinite(maxRecords) || maxRecords < 1) {
    throw new InputError(`"maxRecords" must be a positive integer (got ${JSON.stringify(input.maxRecords)}).`);
  }
  const offset = Math.floor(Number(input.offset ?? 0));
  if (!Number.isFinite(offset) || offset < 0) {
    throw new InputError(`"offset" must be a non-negative integer (got ${JSON.stringify(input.offset)}).`);
  }
  const query = typeof input.query === 'string' && input.query.trim() ? input.query.trim() : undefined;
  const resourceId = typeof input.resourceId === 'string' ? input.resourceId.trim() : undefined;
  if (mode === 'fetch_records') {
    if (!resourceId) {
      throw new InputError('"resourceId" is required in fetch_records mode. Run mode=search_datasets first to find one.');
    }
    if (!isValidResourceId(resourceId)) {
      throw new InputError(`"resourceId" must be a UUID (36 characters with dashes), got "${resourceId}".`);
    }
  } else if (!query) {
    throw new InputError('"query" is required in search_datasets mode (e.g. "חברות", "מכרזים", "עמותות").');
  }
  let filters: Record<string, unknown> | undefined;
  if (input.filters !== undefined && input.filters !== null) {
    if (typeof input.filters !== 'object' || Array.isArray(input.filters)) {
      throw new InputError('"filters" must be a JSON object mapping column name -> value (or array of values).');
    }
    filters = Object.keys(input.filters).length ? { ...input.filters } : undefined;
  }
  const outputFormat = input.outputFormat ?? 'json';
  if (outputFormat !== 'json' && outputFormat !== 'csv') {
    throw new InputError(`"outputFormat" must be "json" or "csv" (got ${JSON.stringify(outputFormat)}).`);
  }
  return {
    mode,
    query,
    resourceId,
    filters,
    maxRecords,
    offset,
    translateFields: input.translateFields ?? true,
    coerceTypes: input.coerceTypes ?? true,
    outputFormat,
    sort: typeof input.sort === 'string' && input.sort.trim() ? input.sort.trim() : undefined,
    baseUrl: typeof input.baseUrl === 'string' && input.baseUrl.trim() ? input.baseUrl.trim() : 'https://data.gov.il',
  };
}

export async function run(rawInput: Partial<ActorInput> | null | undefined, deps: RunDeps): Promise<RunSummary> {
  const input = resolveInput(rawInput);
  return input.mode === 'search_datasets' ? runSearchDatasets(input, deps) : runFetchRecords(input, deps);
}

async function runSearchDatasets(input: ResolvedInput, deps: RunDeps): Promise<RunSummary> {
  const { client, charge, pushData, log } = deps;
  const charged: Record<string, number> = {};
  const chargeResult = await charge(EVENT_DATASET_SEARCH, 1);
  charged[EVENT_DATASET_SEARCH] = chargeResult.chargedCount;
  if (chargeResult.chargedCount < 1 && chargeResult.eventChargeLimitReached) {
    log.warning('Charge limit for "dataset-search" reached before the search started; nothing was fetched.');
    return { mode: input.mode, returned: 0, charged, requests: client.requestCount, stoppedReason: 'charge_limit' };
  }

  const items: DatasetItem[] = [];
  let start = input.offset;
  let total: number | undefined;
  let stoppedReason: RunSummary['stoppedReason'] = 'done';
  while (items.length < input.maxRecords) {
    const rows = Math.min(PACKAGE_PAGE_SIZE, input.maxRecords - items.length);
    const page = await client.packageSearch({ q: input.query, rows, start, sort: input.sort });
    total = page.count;
    for (const pkg of page.results) items.push(normalizePackage(pkg, input.baseUrl));
    start += page.results.length;
    if (page.results.length < rows || start >= page.count) {
      stoppedReason = items.length >= input.maxRecords ? 'max_records' : 'exhausted';
      break;
    }
    if (items.length >= input.maxRecords) {
      stoppedReason = 'max_records';
      break;
    }
  }
  log.info(`search_datasets "${input.query}": ${items.length} datasets returned (portal reports ${total ?? '?'} matches).`);
  if (items.length) await pushData(items as unknown as Array<Record<string, unknown>>);
  if (input.outputFormat === 'csv') {
    const flat = items.map((d) => ({
      ...d,
      tags: d.tags.join('; '),
      resources: d.resources.map((r) => `${r.resource_id} (${r.format ?? '?'}${r.datastore_active ? ', datastore' : ''})`).join('; '),
    }));
    await deps.setValue('OUTPUT.csv', toCsv(flat), { contentType: 'text/csv; charset=utf-8' });
  }
  return { mode: input.mode, returned: items.length, charged, requests: client.requestCount, stoppedReason, total };
}

async function runFetchRecords(input: ResolvedInput, deps: RunDeps): Promise<RunSummary> {
  const { client, charge, pushData, log } = deps;
  const charged: Record<string, number> = { [EVENT_RECORD]: 0 };
  const options = { translateFields: input.translateFields, coerceTypes: input.coerceTypes };
  let fieldMap: FieldMapping[] | undefined;
  let returned = 0;
  let total: number | undefined;
  let stoppedReason: RunSummary['stoppedReason'] = 'exhausted';
  const csvRows: Array<Record<string, unknown>> = [];

  try {
    for await (const { page, pageIndex } of client.iterateRecords({
      resourceId: input.resourceId!,
      q: input.query,
      filters: input.filters,
      sort: input.sort,
      offset: input.offset,
      maxRecords: input.maxRecords,
      pageSize: DATASTORE_PAGE_SIZE,
    })) {
      if (!fieldMap) {
        fieldMap = buildFieldMap(page.fields, options);
        await deps.setValue('FIELD_MAP', fieldMap);
        const untranslated = fieldMap.filter((f) => !f.translated && f.original !== '_id').map((f) => f.original);
        if (input.translateFields && untranslated.length) {
          log.info(`Columns kept with original names (not in dictionary): ${untranslated.join(', ')}`);
        }
      }
      total = page.total ?? total;
      const normalized = normalizeRecords(page.records, fieldMap, options).map((r) => ({
        ...r,
        _resource_id: input.resourceId,
      }));

      const chargeResult = await charge(EVENT_RECORD, normalized.length);
      charged[EVENT_RECORD] += chargeResult.chargedCount;
      const deliverable = normalized.slice(0, chargeResult.chargedCount);
      if (deliverable.length) {
        await pushData(deliverable);
        if (input.outputFormat === 'csv') csvRows.push(...deliverable);
        returned += deliverable.length;
      }
      log.info(`Page ${pageIndex + 1}: fetched ${page.records.length}, delivered ${deliverable.length} (total so far ${returned}${total ? ` of ${total}` : ''}).`);
      if (chargeResult.eventChargeLimitReached || deliverable.length < normalized.length) {
        log.warning('Pay-per-event budget for "record" reached; stopping early. Raise the max charge to get more records.');
        stoppedReason = 'charge_limit';
        break;
      }
      if (returned >= input.maxRecords) {
        stoppedReason = 'max_records';
        break;
      }
    }
  } catch (err) {
    if (err instanceof CkanError) {
      log.error(`[${err.kind}] ${err.message}`);
      if (returned > 0) {
        log.warning(`Run failed after delivering ${returned} records; you were charged only for those.`);
      }
    }
    throw err;
  }

  if (input.outputFormat === 'csv') {
    const columns = fieldMap ? [...fieldMap.map((f) => f.key), '_resource_id'] : undefined;
    await deps.setValue('OUTPUT.csv', toCsv(csvRows, columns), { contentType: 'text/csv; charset=utf-8' });
  }
  return { mode: input.mode, returned, charged, requests: client.requestCount, stoppedReason, fieldMap, total };
}
