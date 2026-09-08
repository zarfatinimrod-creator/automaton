/**
 * Field-name translation (Hebrew -> English) and type coercion for CKAN datastore records,
 * plus normalization of catalogue packages into a compact DatasetItem.
 */
import { HEBREW_FIELD_DICTIONARY } from './dictionary.js';
import type { CkanField, CkanPackage, DatasetItem } from './types.js';

export interface NormalizeOptions {
  translateFields: boolean;
  coerceTypes: boolean;
  /** Extra user-supplied mappings (original -> english), override the dictionary. */
  extraDictionary?: Record<string, string>;
}

export interface FieldMapping {
  original: string;
  key: string;
  type: string;
  translated: boolean;
}

const HEBREW_RE = /[֐-׿]/;
const QUOTE_RE = /["'׳״‘’“”`]/g;

/** Canonical form used for dictionary lookup. */
export function normalizeKeyForLookup(key: string): string {
  return key
    .replace(QUOTE_RE, '')
    .replace(/[_\-./\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const LOOKUP: Map<string, string> = new Map(
  Object.entries(HEBREW_FIELD_DICTIONARY).map(([he, en]) => [normalizeKeyForLookup(he), en]),
);

/** Make a safe snake_case key out of a non-Hebrew (English/mixed) column name. */
export function toSnakeCase(key: string): string {
  const cleaned = key
    .replace(QUOTE_RE, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9֐-׿]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  return cleaned || 'field';
}

/**
 * Translate a single column name. Returns the English key and whether a dictionary hit occurred.
 * Unknown Hebrew columns are kept verbatim (trimmed) so no information is lost.
 */
export function translateKey(original: string, extra?: Record<string, string>): { key: string; translated: boolean } {
  const trimmed = original.trim();
  if (trimmed === '_id') return { key: '_id', translated: false };
  const lookupKey = normalizeKeyForLookup(trimmed);
  if (extra) {
    for (const [from, to] of Object.entries(extra)) {
      if (normalizeKeyForLookup(from) === lookupKey) return { key: to, translated: true };
    }
  }
  const hit = LOOKUP.get(lookupKey);
  if (hit) return { key: hit, translated: true };
  // Try suffix-stripping of common noise like "(חובה)" or trailing colon.
  const stripped = lookupKey.replace(/\(.*?\)/g, '').replace(/[:]+$/g, '').trim();
  if (stripped && stripped !== lookupKey) {
    const hit2 = LOOKUP.get(stripped);
    if (hit2) return { key: hit2, translated: true };
  }
  if (!HEBREW_RE.test(trimmed)) return { key: toSnakeCase(trimmed), translated: false };
  return { key: trimmed, translated: false };
}

/** Build the column mapping for a page of records (fields metadata from CKAN). */
export function buildFieldMap(fields: CkanField[], options: NormalizeOptions): FieldMapping[] {
  const used = new Set<string>();
  return fields.map((f) => {
    const original = f.id;
    let key = original;
    let translated = false;
    if (options.translateFields) {
      const t = translateKey(original, options.extraDictionary);
      key = t.key;
      translated = t.translated;
    }
    // Avoid collisions (two Hebrew columns mapping to the same English key).
    let candidate = key;
    let n = 2;
    while (used.has(candidate)) candidate = `${key}_${n++}`;
    used.add(candidate);
    return { original, key: candidate, type: f.type, translated };
  });
}

const INT_TYPES = new Set(['int', 'int2', 'int4', 'int8', 'integer', 'bigint', 'smallint']);
const FLOAT_TYPES = new Set(['numeric', 'float', 'float4', 'float8', 'double precision', 'decimal', 'real', 'money']);
const DATE_TYPES = new Set(['timestamp', 'timestamptz', 'date', 'timestamp without time zone', 'timestamp with time zone']);
const BOOL_TYPES = new Set(['bool', 'boolean']);

const TRUE_WORDS = new Set(['true', 't', 'yes', 'y', '1', 'כן', 'פעיל', 'פעילה']);
const FALSE_WORDS = new Set(['false', 'f', 'no', 'n', '0', 'לא']);

/** Coerce one cell according to the declared datastore type. Never throws; falls back to the raw value. */
export function coerceValue(value: unknown, type: string): unknown {
  if (value === null || value === undefined) return null;
  const t = (type || 'text').toLowerCase();
  if (typeof value === 'string') {
    const s = value.trim();
    if (s === '' || s === 'null' || s === 'NULL' || s === 'None') return null;
    if (INT_TYPES.has(t) || FLOAT_TYPES.has(t)) {
      const num = parseNumber(s);
      return num === null ? s : num;
    }
    if (DATE_TYPES.has(t)) return parseDate(s) ?? s;
    if (BOOL_TYPES.has(t)) {
      const lower = s.toLowerCase();
      if (TRUE_WORDS.has(lower)) return true;
      if (FALSE_WORDS.has(lower)) return false;
      return s;
    }
    return s;
  }
  if (typeof value === 'number') {
    if (INT_TYPES.has(t)) return Number.isInteger(value) ? value : Math.trunc(value);
    return value;
  }
  return value;
}

function parseNumber(s: string): number | null {
  const cleaned = s.replace(/[, \s]/g, '').replace(/^₪|₪$/g, '');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Accepts ISO (2021-03-04T00:00:00), Israeli dd/mm/yyyy, dd.mm.yyyy, dd-mm-yyyy. Returns ISO date/time string. */
export function parseDate(s: string): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/.exec(s);
  if (iso) {
    const [, y, m, d, hh, mm, ss] = iso;
    if (!validYmd(+y, +m, +d)) return null;
    if (hh === undefined || (hh === '00' && mm === '00' && (ss === undefined || ss === '00'))) return `${y}-${m}-${d}`;
    return `${y}-${m}-${d}T${hh}:${mm}:${ss ?? '00'}`;
  }
  const dmy = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (dmy) {
    const [, d, m, y, hh, mm, ss] = dmy;
    if (!validYmd(+y, +m, +d)) return null;
    const date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    if (hh === undefined) return date;
    return `${date}T${hh.padStart(2, '0')}:${mm}:${ss ?? '00'}`;
  }
  return null;
}

function validYmd(y: number, m: number, d: number): boolean {
  return y >= 1800 && y <= 2200 && m >= 1 && m <= 12 && d >= 1 && d <= 31;
}

/** Normalize a page of records with a precomputed field map. */
export function normalizeRecords(
  records: Array<Record<string, unknown>>,
  fieldMap: FieldMapping[],
  options: NormalizeOptions,
): Array<Record<string, unknown>> {
  const byOriginal = new Map(fieldMap.map((f) => [f.original, f]));
  return records.map((record) => {
    const out: Record<string, unknown> = {};
    for (const [original, raw] of Object.entries(record)) {
      const mapping = byOriginal.get(original);
      const key = mapping?.key ?? (options.translateFields ? translateKey(original, options.extraDictionary).key : original);
      const value = options.coerceTypes ? coerceValue(raw, mapping?.type ?? 'text') : raw;
      out[key] = value;
    }
    return out;
  });
}

const PORTAL = 'https://data.gov.il';

/** Compact, English-keyed representation of a CKAN package for search results. */
export function normalizePackage(pkg: CkanPackage, baseUrl: string = PORTAL): DatasetItem {
  const base = baseUrl.replace(/\/+$/, '');
  return {
    dataset_id: pkg.id,
    name: pkg.name,
    title: (pkg.title ?? pkg.name ?? '').trim(),
    description: pkg.notes?.trim() || null,
    organization: pkg.organization?.title?.trim() || null,
    organization_slug: pkg.organization?.name || null,
    license: pkg.license_title || null,
    tags: (pkg.tags ?? []).map((t) => t.display_name ?? t.name).filter(Boolean),
    modified_at: pkg.metadata_modified ?? null,
    created_at: pkg.metadata_created ?? null,
    portal_url: `${base}/dataset/${pkg.name}`,
    resources: (pkg.resources ?? []).map((r) => ({
      resource_id: r.id,
      name: r.name?.trim() || null,
      format: r.format ? r.format.toUpperCase() : null,
      datastore_active: Boolean(r.datastore_active),
      url: r.url || null,
      last_modified: r.last_modified ?? null,
    })),
  };
}
