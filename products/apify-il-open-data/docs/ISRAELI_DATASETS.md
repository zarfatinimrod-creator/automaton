# Well-known data.gov.il datasets (quick reference)

data.gov.il is a CKAN 2.x portal. Every dataset ("package") has one or more resources; only
resources with `datastore_active: true` can be queried row-by-row through `datastore_search`
(the `fetch_records` mode of this Actor). Use `mode=search_datasets` to confirm the current
resource id before relying on it - the portal occasionally re-uploads resources under new ids.

Resource ids below are collected from public documentation and community usage. Ids marked
**verify** could not be confirmed from inside the build sandbox (no network access to
data.gov.il); run a `search_datasets` query with the suggested keyword to confirm.

| # | Dataset (Hebrew title) | English | Publisher | Suggested `query` | Resource id | Status |
|---|---|---|---|---|---|---|
| 1 | רשם החברות - חברות | Companies Registrar - companies | רשות התאגידים (ICA) | `רשם החברות` | `f004176c-b85f-4542-8901-7b3176f9a054` | verify |
| 2 | רשם העמותות - עמותות | NGO / non-profit registry (amutot) | רשות התאגידים | `עמותות` | `be5b7935-3922-45d4-9638-08871b17ec95` | verify |
| 3 | מכרזים ממשלתיים (מנהל הרכש) | Government procurement tenders | משרד האוצר - מינהל הרכש | `מכרזים` | - | verify (search) |
| 4 | התקשרויות ממשלתיות / פטור ממכרז | Government contracts & tender exemptions | משרד האוצר | `התקשרויות` | - | verify (search) |
| 5 | רשימת ישובים | List of localities (with CBS locality codes) | הלשכה המרכזית לסטטיסטיקה | `ישובים` | `5c78e9fa-c2e2-4771-93ff-7f400a12f7ba` | verify |
| 6 | רחובות בישראל | Streets index | משרד הפנים / למ"ס | `רחובות` | `9ad3862c-8391-4b2f-84a4-2d4c68625f4b` | verify |
| 7 | כלי רכב פרטיים ומסחריים | Registered private & commercial vehicles | משרד התחבורה | `רכב` | `053cea08-09bc-40ec-8f7a-156f0677aff3` | verify |
| 8 | מוסדות חינוך | Educational institutions | משרד החינוך | `מוסדות חינוך` | - | verify (search) |
| 9 | רישוי עסקים (רשויות מקומיות) | Business licensing by municipality | רשויות מקומיות שונות | `רישוי עסקים` | - | verify (search; per-municipality resources) |
| 10 | תקציב המדינה | State budget (by item/regulation) | משרד האוצר | `תקציב המדינה` | - | verify (search; one resource per year) |
| 11 | מרפאות קופות החולים | HMO clinics | משרד הבריאות | `מרפאות` | - | verify (search) |
| 12 | תחנות תחבורה ציבורית (GTFS stops) | Public-transport stops | משרד התחבורה | `תחנות` | - | verify (search; large GTFS files may not be datastore-active) |

## Tips

- The Hebrew column names in these tables are what the `filters` and `sort` inputs expect.
  Run once with `maxRecords: 1` and read `FIELD_MAP` from the key-value store to see
  original -> English mappings for a given resource.
- Companies registrar status values (column `סטטוס חברה`) include `פעילה` (active),
  `מחוקה` (struck off), `בפירוק` (in liquidation). NGO status values (`סטטוס עמותה`) include
  `רשומה`, `מחוקה`, `בפירוק מרצון`.
- Typical filter: `{"סטטוס חברה": "פעילה", "שם ישוב": "תל אביב - יפו"}`.
- CKAN full-text search (`query` in fetch_records mode) matches whole words; use `filters`
  for exact values and `query` for free-text discovery.
- Resource sizes: the companies table has ~700 k rows, NGOs ~50 k, vehicles ~4 M. Set
  `maxRecords` deliberately - you pay per returned record.
