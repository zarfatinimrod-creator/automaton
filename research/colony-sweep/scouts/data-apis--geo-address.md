# WORKER-SCOUT — group `data-apis`, criterion `geo-address`

**Criterion:** Geo, address and postal data — Israeli address normalization and geocoding gaps,
licence terms of the available sources, and buyers.

**Date of sweep:** 2026-09-04. **Search budget spent:** 7 of 8 allowed (one deliberately unspent).
**Free (non-search) sources used:** GitHub MCP `search_code` / `search_repositories` (5 calls),
`WebFetch` against `raw.githubusercontent.com` (3 successful, 1 404).

---

## 1. Evidence log — what I actually rendered, and what is only a snippet

### Rendered in full (STRONG evidence)

| # | URL | Fetched | What it established |
|---|---|---|---|
| R1 | `https://raw.githubusercontent.com/osmlab/awesome-openstreetmap/master/README.md` | 2026-09-04 | Directory of OSM geocoding tooling (OSMNames, Nominatim QA, Overpass). **No licence detail** — the list does not state ODbL terms. Directory only, not demand evidence. |
| R2 | `https://raw.githubusercontent.com/NirTatcher/il-address-autocomplete/main/README.md` | 2026-09-04 | A free **MIT-licensed** npm package set (`@il-address/core`, `@il-address/react`, `@il-address/data`) doing Israeli city+street autocomplete from the data.gov.il CKAN API: ~1,300 cities inline, **~63,000 unique streets** lazy-loaded. Explicitly states it does **NOT** provide postal codes or lat/lon geocoding. |
| R3 | `https://raw.githubusercontent.com/skills-il/government-services/master/israeli-address-autocomplete/SKILL.md` | 2026-09-04 | The most rigorous public map of Israeli address data I found. See §2. |

### Rendered as GitHub code-search match text (STRONG — verbatim repo content, but partial)

| # | Repo / path | Verbatim content that matters |
|---|---|---|
| C1 | `skills-il/government-services` — `israeli-address-autocomplete/evidence.json` | `"source_url": "https://apimftprd.israelpost.co.il/mypost-zip/getcities-lang?Lang=he"`, `"raw_snippet": "{ \"statusCode\": 401, \"message\": \"Access denied due to missing subscription key...\" }"`, `"fetched_at": "2026-08-26T17:10:02Z"`. Also: an undefined sibling path returns 404, so the 401 is a **real auth gate**, not a dead endpoint. |
| C2 | same repo — `evidence.json` | GovMap: `"source_url": "https://api.govmap.gov.il/docs/intro/standalone"`, raw Hebrew snippet: `השימוש בפונקציות אינו מחייב יצירת מפה, אך מחייב שליחת מפתח API תקף, מהדומיין המאושר, בכל קריאה` — a valid API key **from an approved domain** on every call. |
| C3 | same repo — `evidence.json` | data.gov.il CKAN is a **keyless public API**. Settlements `resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba` (1,310 records, fields `סמל_ישוב`,`שם_ישוב`,`שם_נפה`); streets `resource_id=9ad3862c-8391-4b2f-84a4-2d4c68625f4b` (`סמל_ישוב`,`שם_ישוב`,`סמל_רחוב`,`שם_רחוב`). Both published by רשות האוכלוסין וההגירה. |
| C4 | same repo — `optimization-log.json` | *"Terms of use for an undocumented endpoint could NOT be established: Israel Post's published terms govern the customer portal and are silent on programmatic access... Do not let 'the terms do not forbid it' become 'the terms permit it'."* And: *"the key must not be scraped; the web form remains the supported route."* |
| C5 | `MarkHanoi/Product_Rediness_08` — `audit/intl-parcels/2026-09-02/lane-me-open.md` | `| Israel | govmap IdentifyByXY PARCEL_ALL, keyless (ITM) | gush 6952 / helka 139 (Tel Aviv) | IL | UNREAD → YELLOW |` — an independent audit dated **2026-09-02** confirming a **keyless, server-callable** GovMap parcel endpoint working from a foreign IP, with licence explicitly **UNREAD**. |
| C6 | `yoavlv/NextRoof` — `nadlan/nadlan_utils.py` | `https://es.govmap.gov.il/TldSearch/api/DetailsByQuery?query={addr}&lyrs=276267023&gid=govmap` — a second keyless GovMap address-search endpoint in production use. |
| C7 | `udivak/israel-housing-dashboard` — `README.md` | *"Cache keyed on `street+city` — ~63K unique addresses cover ~295K records (~4.6× hit ratio)"*, geocoding via Govmap. Real production-scale Israeli geocoding, showing the cost of doing it yourself. |
| C8 | `oresh123456/igudim-dashboard` — `api-research/out/digest.md` | GovMap geocode returns **ITM (EPSG:2039), NOT WGS84 — needs reprojection**, with `ResultCode` 1=exact / 2=partial / 3=multiple. `searchAndLocate()` does bidirectional address ↔ gush/helka. Auth described as token via email registration, domain-bound. |
| C9 | `danielrosehill/Israel-Open-Data-Resources` — `060526/README.md` | Inventory of data.gov.il publishers; **Survey of Israel (המרכז למיפוי ישראל) publishes 116 datasets** there. |
| C10 | `skills-il/government-services` — `SKILL.md` table | Israel Post publishes the authoritative list of localities with **no street division / single locality-wide mikud** at `https://doar.israelpost.co.il/content/no-address`. Also: the `mapi.gov.il/Pages/LotAddressLocator.aspx` path is retired; the live parcel-by-address tool is `https://www.gov.il/apps/mapi/parcel_address/parcel_address.html`. |
| C11 | same `SKILL.md` | Data-quality gap: **every `שם_ישוב` value in the CKAN datasets carries trailing whitespace — all 1,310 of 1,310 rows.** Street names exist in Hebrew and Arabic with different official spellings; no reliable Latin-name join (two localities can share one Latin name). |

### Search snippets only (WEAKER — must be marked as such)

| # | Claim | Snippet source | URL a human must open to close it |
|---|---|---|---|
| S1 | An **Israel Postal Codes API already exists on RapidAPI** (`avivkasuto1`). | WebSearch 2026-09-04 | `https://rapidapi.com/avivkasuto1/api/israel-postal-codes/` |
| S2 | **APITier sells an "Israel Address Validation API — Standardise & Geocode Israel Addresses"** returning matched address, geocoordinates and mikud. | WebSearch 2026-09-04 | `https://www.apitier.com/address-validation/israel` (EGRESS_BLOCKED here) |
| S3 | Incumbent price anchors: **Smarty from $50/mo, Melissa from $40 PAYG, Loqate credit packs from $100**; Melissa's Global Address Object covers **240+ countries**. | WebSearch 2026-09-04 (geopostcodes / smarty / woosmap comparison posts) | `https://www.geopostcodes.com/blog/best-international-address-verification-solutions/` |
| S4 | Google Address Validation API has a per-country coverage table; **Israel's status not confirmed**. | WebSearch 2026-09-04 | `https://developers.google.com/maps/documentation/address-validation/coverage` — **this is the single highest-value unopened URL for this criterion.** |
| S5 | Israel Post runs an official bulk **"השתלת מיקוד/קוד חלוקה"** file service: customers email files to **`mikudsupport@postil.com`**; bulk-mail customers get postal-code and distribution-code files via their account manager. Only mail carrying a 7-digit mikud + 9-digit distribution code gets bulk discounts. | WebSearch 2026-09-04 | `https://israelpost.co.il/לעסקים/שיטת-המיקוד-החדשה-מידע-ללקוחות-עיסקיים/` |
| S6 | **"קובץ המיקוד של ישראל"** (the Israel postal-code file) is listed on the FOI portal `odata.org.il`, reportedly obtainable from Israel Post **for a nominal ~20 ILS fee** (or exempt) via a freedom-of-information request. | WebSearch 2026-09-04 | `https://www.odata.org.il/dataset/00a9749e-c112-4190-9c37-97918b5792cf` (EGRESS_BLOCKED here) — **decisive URL for whether a GREEN mikud product is possible at all.** |
| S7 | data.gov.il data is published "under an open usage license" intended for reuse by for-profit and not-for-profit entities. | WebSearch 2026-09-04, opengovpartnership.org IL0018 / IL0032 | `https://www.opengovpartnership.org/members/israel/commitments/IL0018/` and the data.gov.il terms page itself (blocked here). **The exact licence text was NOT rendered — treat "open licence" as unconfirmed.** |
| S8 | Free consumer mikud-lookup tools are everywhere (b144, cashback.co.il, israelpost.org.il, cashdo.co.il), i.e. the consumer-side price floor is zero. | WebSearch 2026-09-04 | `https://www.b144.co.il/zipcode/` |
| S9 | Israeli developers publicly ask whether a mikud-by-address API exists at all. | WebSearch 2026-09-04 | `https://tchumim.com/topic/4752/...` (EGRESS_BLOCKED here) |

### Negative results (useful)

- `mcp__github__search_repositories` for `israel address geocoding postal code` returned **exactly 1 repo** (`peleg-jpg/israeli-address-autocomplete`, created 2026-05-11, 0 stars) — the field of published Israeli address products on GitHub is thin.
- Two `search_code` queries for a published Israeli mikud file (`israel postal code dataset mikud 7 digit csv zipcodes`; `"קובץ מיקוד" OR "מיקודים" csv israel`) returned **0 results**. No public mikud dataset is sitting on GitHub.
- `raw.githubusercontent.com/skills-il/government-services/**main**/...` 404s; the default branch is `master`. (Mechanic worth reusing.)

---

## 2. The shape of the field, from the evidence

**Two halves of an Israeli address, with completely different legal status.**

1. **Settlement + street (the "which street exists where" half): OPEN.** data.gov.il CKAN, keyless,
   documented, 1,310 settlements and ~63k unique streets (C3, R2). It is *already commoditised* —
   an MIT npm package ships it for free (R2), and dozens of ordinary Israeli web projects call the
   CKAN endpoint directly from client-side JavaScript (search hits across `takeCare`, `PageFlix`,
   `escape`, `smash-lab`, `Coffee_Platform`, `project_mechon`). There is no moat here.
2. **Mikud (the 7-digit postal code half): CLOSED.** There is *no keyless public mikud-by-address
   API*. The one that exists — `apimftprd.israelpost.co.il/mypost-zip/*` — returns HTTP 401
   "Access denied due to missing subscription key" (C1), and the key lives in the website's client
   bundle. The scouts who found it wrote down, in their own repo, that the key **must not be
   scraped** and that Israel Post's terms are **silent** on programmatic use (C4). The supported
   routes are (a) the one-address-at-a-time web form, and (b) Israel Post's own bulk file service by
   email (S5), or a FOI copy of the mikud file (S6).

**Geocoding (address → coordinates) sits in an awkward middle.** GovMap is the authoritative Israeli
geocoder. Its own documentation says a valid API key from an **approved domain** is required on every
call (C2) — browser-only. But independent production code and an independent audit dated 2026-09-02
show **keyless server-callable endpoints** (`es.govmap.gov.il/TldSearch/api/DetailsByQuery`, C6;
`IdentifyByXY` on `PARCEL_ALL`, C5) that work from a foreign IP. The audit itself grades the licence
**UNREAD → YELLOW**. That contradiction is not resolvable from here, and the honest reading is:
*undocumented endpoints that many people use and nobody has terms for.* That is AMBER by rule 4.

**Who is visibly doing this work by hand.** Israeli proptech is the concentration of pain: at least
six independent 2025-2026 repos each hand-roll a GovMap parcel/geocode client — `nitzpo/nadlan-mcp`,
`GonLAV/propintel`, `chananeltz/nadlan-360`, `shillo96-pixel/landwatch-israel`, `yoavlv/NextRoof`,
`MrAnde7son/nadlaner`, plus `udivak/israel-housing-dashboard` which had to build a 63k-address
geocode cache (C7). Demand for *the join* (address ↔ coords ↔ gush/helka) is real and repeatedly
re-implemented. Supply is legally unestablished. That is the central tension of this criterion.

---

## 3. Findings (detail behind the structured output)

### F1 — Israeli address normalization/validation API on open data. GREEN, but commoditised.
The only fully GREEN buildable thing here. Data is keyless public CKAN (C3), licence described as
open (S7, unconfirmed). Genuine value-add over the free MIT package (R2): normalization rather than
autocomplete — the trailing-whitespace defect in all 1,310 settlement rows (C11), Hebrew/Arabic
street-name variants, transliteration, `סמל_ישוב`/`סמל_רחוב` code resolution, fuzzy match, and the
locality-with-no-streets list (C10). Buyer: Israeli e-commerce and SaaS developers building checkout
and CRM forms — but their default is the free MIT package, and the paid international incumbents
(Melissa 240+ countries, Loqate, Smarty, APITier — S2, S3) already claim Israel. **No mikud** means
the product is missing the one field Israeli shippers actually need (S5). Honest ceiling for a
no-brand new entrant: low hundreds of ILS/month.

### F2 — Mikud-by-address as a service, built on the key-gated Israel Post API. **RED. Do not build.**
This is the highest-demand item in the criterion (S1, S2, S9 all point at it) and the one the
constitution forbids. Building it requires lifting a subscription key out of Israel Post's client
bundle, against a host whose terms are silent on programmatic use (C1, C4). "Silent" is not
"permitted". The key is also documented as rotating without notice, so even setting the constitution
aside the product breaks silently on a schedule. Recording this as a NO is the finding.

### F3 — Licensed mikud: Israel Post's official bulk file, or the FOI copy. AMBER, and it needs a human.
There **is** a legitimate route to mikud data (S5, S6): Israel Post's `mikudsupport@postil.com` file
service for bulk customers, and a freedom-of-information copy of "קובץ המיקוד של ישראל" for a
nominal ~20 ILS. Both are snippet-only evidence and neither has been opened here. Two blockers:
(a) redistribution rights over an Israel-Post-authored file are **unestablished** — a FOI release
grants access, not a licence to resell; (b) obtaining it requires a human to email a company or file
an FOI request, which is **not** one of MISSION's permitted exceptions (identity / KYC / payout).
Worth escalating to the owner as a decision, not worth building on speculatively.

### F4 — Address ↔ gush/helka ↔ coordinates join for Israeli proptech. AMBER supply, real demand.
Strongest buyer signal in the criterion: six-plus independent repos re-implementing the same GovMap
client (see §2), and property appraisers / proptech / mortgage tooling as the nameable buyer.
Supply is the problem: official docs say domain-bound browser-only key (C2); reality is keyless
undocumented endpoints with licence graded UNREAD (C5, C6). Not recommendable as a build until
GovMap's terms are actually read. The URL to open: `https://api.govmap.gov.il/docs/intro/standalone`
and whatever terms page it links.

### F5 — ITM (EPSG:2039) ↔ WGS84 reprojection. Real friction, zero moat.
GovMap returns ITM, not WGS84 (C8), and every consumer must reproject. But `proj4js`/`pyproj` do
this for free with a one-line definition. There is no product here; it is a README paragraph.

### F6 — OSM/Nominatim-derived Israeli geo dataset. Dead end on licence.
ODbL share-alike encumbers a sellable derived database, and I could not render the ODbL terms from
here — the awesome-openstreetmap list carries no licence detail (R1). Marked low confidence and
parked; the licence question would have to be answered before any work.

---

## 4. Payability to Israel

Not the binding constraint for this criterion. Every candidate here is sold through rails the colony
already operates and has already validated — Paddle (`products/il-biz-tools`), x402
(`products/x402-il-api`), Apify pay-per-event (`products/apify-il-open-data`). The gates that bite
are **ToS** (F2 RED, F3/F4 AMBER) and **competition** (F1), not payout country. Where a finding
would need a *new* marketplace (RapidAPI, S1), payability to Israel is UNKNOWN and unverified —
I did not spend a search on it, because F1's ceiling does not justify a new rail.

## 5. Owner blockers catalogued
- **F3 only:** a human must either (a) send an email to `mikudsupport@postil.com` as a business
  customer, or (b) file a freedom-of-information request and pay ~20 ILS. Neither is an
  identity/KYC/payout step, so under MISSION this is a *real* blocker, not a permitted exception.
- F1, F5: none beyond payment rails that already exist.
- F2: none — it is refused on constitution grounds, not blocked.

## 6. What a better-resourced agent should open next (in priority order)
1. `https://developers.google.com/maps/documentation/address-validation/coverage` — does Google
   already validate Israeli addresses? If yes, F1's ceiling drops further.
2. `https://www.odata.org.il/dataset/00a9749e-c112-4190-9c37-97918b5792cf` — is the mikud file
   actually published, and under what terms?
3. `https://api.govmap.gov.il/docs/intro/standalone` + GovMap terms of use — resolves the F4
   contradiction between "domain-bound key" and "keyless in production".
4. data.gov.il's own terms-of-use page — confirm the licence permits commercial redistribution.
5. `https://rapidapi.com/avivkasuto1/api/israel-postal-codes/` — what does an existing competitor
   charge, and where does its mikud data come from?
