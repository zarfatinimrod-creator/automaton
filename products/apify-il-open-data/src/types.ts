/** Shapes of the documented CKAN 2.x JSON API (data.gov.il) and of this Actor's input/output. */

export type Mode = 'search_datasets' | 'fetch_records';
export type OutputFormat = 'json' | 'csv';

export interface ActorInput {
  mode: Mode;
  query?: string;
  resourceId?: string;
  filters?: Record<string, string | number | boolean | Array<string | number>>;
  maxRecords?: number;
  offset?: number;
  translateFields?: boolean;
  coerceTypes?: boolean;
  outputFormat?: OutputFormat;
  sort?: string;
  baseUrl?: string;
}

/** CKAN datastore field metadata: { id: "מספר חברה", type: "text" | "int" | "numeric" | "timestamp" | ... } */
export interface CkanField {
  id: string;
  type: string;
  info?: { label?: string; notes?: string; type_override?: string };
}

export interface CkanDatastoreResult {
  resource_id: string;
  fields: CkanField[];
  records: Array<Record<string, unknown>>;
  total?: number;
  limit?: number;
  offset?: number;
  include_total?: boolean;
  _links?: { start?: string; next?: string };
}

export interface CkanResource {
  id: string;
  name?: string;
  description?: string;
  format?: string;
  url?: string;
  datastore_active?: boolean;
  last_modified?: string | null;
  created?: string;
  size?: number | null;
  mimetype?: string | null;
}

export interface CkanPackage {
  id: string;
  name: string;
  title?: string;
  notes?: string;
  metadata_modified?: string;
  metadata_created?: string;
  license_title?: string;
  organization?: { name?: string; title?: string } | null;
  tags?: Array<{ name: string; display_name?: string }>;
  resources?: CkanResource[];
  num_resources?: number;
}

export interface CkanPackageSearchResult {
  count: number;
  results: CkanPackage[];
}

export interface CkanEnvelope<T> {
  help?: string;
  success: boolean;
  result?: T;
  error?: { __type?: string; message?: string; [key: string]: unknown };
}

/** Normalized dataset item returned in search_datasets mode. */
export interface DatasetItem {
  dataset_id: string;
  name: string;
  title: string;
  description: string | null;
  organization: string | null;
  organization_slug: string | null;
  license: string | null;
  tags: string[];
  modified_at: string | null;
  created_at: string | null;
  portal_url: string;
  resources: Array<{
    resource_id: string;
    name: string | null;
    format: string | null;
    datastore_active: boolean;
    url: string | null;
    last_modified: string | null;
  }>;
}
