# Israel Open Data API (data.gov.il) - clean, English-keyed JSON

**Query Israeli government open data as clean, English-keyed, typed JSON.** This Actor wraps the
official [data.gov.il](https://data.gov.il) CKAN API so developers and AI agents can pull records
from the Companies Registrar, the NGO (amutot) registry, government tenders, localities, vehicles
and hundreds of other public datasets - without fighting Hebrew column names, string-typed
numbers, inconsistent date formats or CKAN pagination quirks.

- **Search datasets** by keyword (Hebrew or English) and get resource ids ready to query.
- **Fetch records** from any datastore-enabled resource with full-text search, exact filters,
  sorting and pagination.
- **English keys**: `מספר חברה` -> `company_number`, `שם עמותה` -> `ngo_name`,
  `תאריך התאגדות` -> `incorporation_date` (200+ mappings; unknown columns are kept verbatim so
  nothing is lost). The exact mapping used is saved as `FIELD_MAP`.
- **Real types**: numbers as numbers, dates as ISO strings, blanks as `null`.
- **Free right now.** This Actor is published unpriced while we find out whether anyone is looking for it. Planned pricing is below, and it is not enabled.
- **Honest by design**: uses only the documented JSON API, no HTML scraping, no personal-data
  enrichment, respects portal rate limits (retries with backoff, 5 req/s cap).

## Who is it for

- Fintech / KYB / compliance teams verifying Israeli companies and NGOs.
- Lead-gen and market-research tools that need structured lists of businesses by city / status.
- Procurement intelligence: monitor tenders and government contracts.
- AI agents and LLM tools (via the Apify MCP server or API) that need Israeli public data
  without Hebrew-parsing logic.
- Data journalists, researchers and civic-tech projects.

## Input

| Field | Type | Description |
|---|---|---|
| `mode` | `search_datasets` \| `fetch_records` | Catalogue search, or row fetch from one resource. |
| `query` | string | Keyword search (catalogue) or CKAN full-text filter (records). Required in `search_datasets`. |
| `resourceId` | UUID | Datastore resource to read. Required in `fetch_records`. |
| `filters` | object | Exact-match filters using the ORIGINAL (Hebrew) column names, e.g. `{"סטטוס חברה": "פעילה"}`. Values may be arrays. |
| `maxRecords` | integer (default 100) | Cap on records/datasets returned. You are charged only for returned items. |
| `offset` | integer (default 0) | Skip N records - resume a previous run. |
| `translateFields` | boolean (default true) | Translate Hebrew column names to English snake_case. |
| `coerceTypes` | boolean (default true) | Convert numeric / date / boolean columns and blanks -> `null`. |
| `outputFormat` | `json` \| `csv` | `csv` additionally stores `OUTPUT.csv` in the key-value store. |
| `sort` | string | CKAN sort expression with original column names, e.g. `"תאריך התאגדות desc"`. |
| `pageSize` | integer (1-1000) | Advanced: rows per API call. |
| `baseUrl` | string | Advanced: another CKAN 2.x portal. |

### Example 1 - find the companies registrar resource

```json
{ "mode": "search_datasets", "query": "רשם החברות", "maxRecords": 5 }
```

Output item:

```json
{
  "dataset_id": "246d949c-a253-4a36-a4d5-d0c2e4b5b2c1",
  "name": "ica_companies",
  "title": "רשם החברות - חברות",
  "organization": "רשות התאגידים",
  "organization_slug": "ica",
  "tags": ["חברות", "רשם החברות"],
  "modified_at": "2026-08-31T02:10:07.552813",
  "portal_url": "https://data.gov.il/dataset/ica_companies",
  "resources": [
    { "resource_id": "f004176c-b85f-4542-8901-7b3176f9a054", "name": "חברות", "format": "CSV", "datastore_active": true }
  ]
}
```

### Example 2 - active companies in Tel Aviv

```json
{
  "mode": "fetch_records",
  "resourceId": "f004176c-b85f-4542-8901-7b3176f9a054",
  "filters": { "סטטוס חברה": "פעילה", "שם ישוב": "תל אביב - יפו" },
  "maxRecords": 1000
}
```

Output item (one per record):

```json
{
  "_id": 1,
  "company_number": "510000001",
  "company_name": "חברת הדוגמה בע\"מ",
  "name_en": "EXAMPLE COMPANY LTD",
  "entity_type": "חברה פרטית",
  "company_status": "פעילה",
  "incorporation_date": "1990-03-04",
  "share_capital": 1000000,
  "last_annual_report_year": 2025,
  "locality_name": "תל אביב - יפו",
  "address": "רחוב הרצל 1",
  "_resource_id": "f004176c-b85f-4542-8901-7b3176f9a054"
}
```

Key-value store after a run: `FIELD_MAP` (original -> English -> type), `SUMMARY`
(returned count, charges, request count, stop reason), and `OUTPUT.csv` when requested.

See [`docs/ISRAELI_DATASETS.md`](docs/ISRAELI_DATASETS.md) for a list of popular datasets and
their resource ids.

## Pricing - planned, and NOT enabled

**This Actor currently costs nothing to run.** The table below is the pricing that will be turned
on later, published here so nobody is surprised by it. Two reasons it is off:

1. Apify requires the developer to complete identity verification (KYC) before any Actor can carry
   a price, so a free listing is the only thing possible until that is done.
2. Nobody knows yet whether a stranger finds this Actor at all. Thirty days of run counts on a free
   listing answers that for nothing, and it is worth more than a price on a listing nobody opens.

| Event name | Charged when | Suggested price |
|---|---|---|
| `dataset-search` | Once per `search_datasets` run | $0.005 |
| `record` | Per record delivered in `fetch_records` | $0.002 (= **$2 per 1,000 records**) |

Failed runs charge nothing beyond records already delivered. The Actor stops cleanly when a
user's per-run charge limit is reached and reports it in `SUMMARY.stoppedReason`. Tip: 1,000
companies for $2 versus hours of Hebrew CSV wrangling.

## Limits and good citizenship

- Max 1,000 rows per API request (CKAN limit); the Actor paginates automatically.
- Client-side rate limit of ~5 requests/second and exponential backoff on 429/5xx; `Retry-After`
  is honoured.
- `filters` / `sort` must use the original column names (the portal validates them).
- Only resources with `datastore_active: true` can be queried row-by-row; others (PDF, XLSX,
  GTFS zips) appear in search results with a download `url` instead.
- Data licence: data.gov.il publishes under the Israeli government open-data licence; check the
  `license` field per dataset. This Actor performs no personal-data enrichment.

---

## For the owner: deploying and selling

### One-time steps (only you can do these)

1. **Apify account + KYC**: sign up at apify.com, verify email, and complete payout details under
   *Settings -> Payouts* (Apify pays creators via **PayPal** or bank transfer/**Payoneer**; Stripe is
   not required from your side). An Israeli individual can receive PayPal payouts; keep the
   *עוסק פטור* invoices for the Israeli tax authority.
2. **Publish the Actor** in Apify Store and turn on **Monetization -> Pay per event**. Add the two
   events with the exact names `dataset-search` and `record` (see table above) and set prices.
3. Optional: register a short domain / landing page and add the Store link there.

### Deploy steps

```bash
cd products/apify-il-open-data
npm install
npm test                       # 41 tests, offline fixtures
npx apify login                # once; paste your Apify API token
npx apify push                 # builds the Docker image on Apify and creates/updates the Actor
```

`.actor/actor.json` names the Actor `israel-open-data-api`; change `name`/`title` before the
first push if you prefer a different Store slug. After pushing, open the Actor in the Console,
run it once with Example 1 above, then publish it.

### Run locally

```bash
npm run build
mkdir -p storage/key_value_stores/default
echo '{"mode":"search_datasets","query":"עמותות","maxRecords":3}' > storage/key_value_stores/default/INPUT.json
npm start        # results land in storage/datasets/default
```

### Environment variables (all optional)

| Variable | Default | Purpose |
|---|---|---|
| `CKAN_BASE_URL` | `https://data.gov.il` | Override the portal (any CKAN 2.x). |
| `CKAN_TIMEOUT_MS` | `30000` | Per-request timeout. |
| `CKAN_MAX_RETRIES` | `4` | Retries on 429/5xx/network errors. |
| `CKAN_MIN_INTERVAL_MS` | `200` | Minimum gap between requests (rate limit). |
| `CKAN_USER_AGENT` | `apify-il-open-data/1.0 ...` | Custom User-Agent (some portals block generic clients). |
| `APIFY_TOKEN` | - | Only for `apify push` / local runs against the platform. Never commit it. |

No secrets are needed at runtime: data.gov.il is a public, keyless API.

### Project layout

```
.actor/actor.json        Actor metadata, dataset view, PPE events (documentation)
.actor/INPUT_SCHEMA.json Input form
Dockerfile               apify/actor-node:22, multi-stage TypeScript build
src/main.ts              Apify entrypoint: input -> run() -> Actor.charge / pushData
src/run.ts               Platform-agnostic orchestration (testable)
src/ckan.ts              CKAN client: timeout, retries, backoff, rate limit, typed errors
src/normalize.ts         Field translation + type coercion + package normalization
src/dictionary.ts        Hebrew -> English column dictionary
src/csv.ts               CSV export
test/                    vitest suites + realistic CKAN fixtures
docs/ISRAELI_DATASETS.md Popular datasets and resource ids
```

## Keywords

Israel open data, data.gov.il API, Israeli companies registrar API, רשם החברות API, NGO registry
Israel, עמותות, government tenders Israel, CKAN datastore, Hebrew to English data, KYB Israel.
