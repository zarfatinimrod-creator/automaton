# Scout notes — group `data-apis`, criterion `israeli-open-data`

**Date of research:** 2026-09-04. **Scout model:** Opus 5. **Search budget used:** 8/8 (the cap).
**Criterion as assigned:** Israeli open data — data.gov.il, Central Bureau of Statistics, Bank of
Israel, municipal portals. Licence terms for commercial reuse, freshness, and which datasets a
business would pay to have cleaned and served.

## Evidence-strength key

- **[R]** rendered page I actually fetched (strong)
- **[S]** search snippet quoting a page I could not render (weaker — the exact URL to open is given)
- **[G]** rendered GitHub/raw.githubusercontent file (strong, but it is a third party's report of
  the primary source unless it is a captured API payload)
- Nothing in this file rests on memory. Where I had no evidence I wrote "unknown".

Every `*.gov.il` host is egress-blocked in this container (`data.gov.il`, `cbs.gov.il`,
`boi.org.il`). So is `apify.com` and `rapidapi.com` (both confirmed blocked/unfetchable this
session). GitHub and `raw.githubusercontent.com` render.

---

## 1. Licence terms for commercial reuse — the gate

### 1.1 data.gov.il — commercial reuse is EXPLICITLY PERMITTED

**[S]** WebSearch on `data.gov.il תנאי שימוש רישיון שימוש מסחרי` (2026-09-04) returned
<https://data.gov.il/he/terms-of-use> and the snippet quoted the licence text directly:

> "אתה רשאי לעשות שימוש במידע באופן מסחרי ובאופן שאינו מסחרי."
> ("You may use the information commercially and non-commercially.")
> "אתה רשאי להעתיק את המידע, להפיץ אותו, להעמיד אותו לרשות לציבור, לשדר אותו, לבצע שינויים
> טכניים במידע וליצור ממנו יצירות נגזרות בכל מדיום או פורמט."
> Restrictions: "אינך רשאי ... להציג את המידע באופן מטעה ו/או באופן הגורם למצג שווא ו/או לשנות את
> המידע בדרך שתגרום לסילופו."

So: copy, redistribute, transform, derivative works, **commercial** — allowed. The only bar is
misrepresentation/distortion, which our constitution already forbids.

**URL a human or unblocked agent must open to close this:** <https://data.gov.il/he/terms-of-use>

**[G] Corroborating primary payload.** A captured `data.gov.il` `package_search` response is
checked into a public repo — this is the portal's own JSON, not someone's summary:
<https://github.com/Visweswarr/omnilegal/blob/main/data/remote_sources/raw/national-israel-0-5-israel-data-gov-il/12270cd20ef27bc0d0dd.json>
(found via GitHub `search_code`, fragment rendered 2026-09-04). For dataset `ica_companies`
(Companies Registrar):

```
"id": "246d949c-a253-4811-8a11-41a137d3d613",
"name": "ica_companies",
"isopen": true,
"license_id": "other-open",
"license_title": "אחר (פתוח)",
"Frequency": "Day",
"Update": "Automat",
"author_email": "datagov_support@justice.gov.il",
"metadata_created": "2019-01-02T12:02:50",
"metadata_modified": "2026-04-18T02:13:56"
```

Two things fall out of this: (a) the per-dataset licence really is an open one (`isopen: true`),
and (b) **the Companies Registrar is updated daily and automatically** — freshness is a real
selling point, not a guess.

**[G]** Third-party operator note, from a 2026-05-06 catalogue snapshot repo:
> "**Licensing:** Most datasets are published under the Israeli government open-data terms —
> verify per-dataset (`license_id`, `license_title` in `package_show`) before redistribution."
> — <https://github.com/danielrosehill/Israel-Open-Data-Resources> `060526/README.md`

That is the correct operational rule and we should follow it: check `license_id` per dataset at
fetch time rather than assuming the portal-wide licence covers every row.

### 1.2 CBS (הלשכה המרכזית לסטטיסטיקה) — commercial permitted, attribution required

**[S]** WebSearch (2026-09-04) surfaced <https://www.cbs.gov.il/he/Pages/רישיון-שימוש.aspx> and
quoted: users may use the material **commercially and non-commercially**; a non-exclusive licence
granted by the State of Israel through the Prime Minister's Office via the CBS, subject to Israeli
copyright law; **quotation requires naming the CBS as the source**; prohibited to alter data to
mislead or to imply CBS/State endorsement of your use.

**URLs to open to close this:**
- <https://www.cbs.gov.il/he/Pages/רישיון-שימוש.aspx> (licence)
- <https://www.cbs.gov.il/he/Pages/ממשק-API.aspx> and
  <https://www.cbs.gov.il/he/Pages/סדרות-עיתיות-באמצעות-API.aspx> (API terms)

### 1.3 CBS Public Use Files (PUF) microdata — RED, NO redistribution right

**[S]** The same search returned <https://survey.gov.il/he/License_to_use_PUF_CBS>, titled
"**רשיון לשימוש עצמי (ללא זכות הפצה) מסוג Public Use File - PUF**" — *licence for self-use,
without distribution rights*. Also <https://www.cbs.gov.il/he/Documents/puf_usage.pdf>.

This is the single most important negative in the criterion. CBS survey microdata (labour force,
household expenditure, social survey) is the richest Israeli statistical asset and it is the one
thing we may **not** clean and resell. Any product plan touching CBS PUF is RED.

### 1.4 Bank of Israel — UNKNOWN, and therefore AMBER

The API exists and is real. **[G]** `https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/<FLOW>/1.0`
appears in three independent public repos, rendered via GitHub `search_code` 2026-09-04:
- <https://github.com/talmiller2/tax_forms_generator> `boi_currency_rates.py` (dataflow `EXR`)
- <https://github.com/taldata/labos> `services/exchange_rate.py` (`?startperiod=&endperiod=&c[CURRENCY]=&format=sdmx-json`)
- <https://github.com/subsetsio/connectors> `src/bank-of-israel/src/nodes/bank_of_israel.py`
  ("every BOI.STATISTICS dataflow is version 1.0")

Terms of use: **I could not read them.** Search returned only the page's existence:
<https://www.boi.org.il/en/terms-of-use/>. Also unread: the BOI's own extraction guides
<https://www.boi.org.il/media/mtqp3c0p/extracting-representative-exchange-rates-from-the-new-series-database.pdf>
and <https://boi.org.il/media/zqohlkdy/implementation_of_the_sdmx_international_standard.pdf>.
**Do not build a BOI-derived paid product until <https://www.boi.org.il/en/terms-of-use/> is read.**

---

## 2. Freshness and catalogue size

**[R/G]** <https://raw.githubusercontent.com/danielrosehill/Israel-Open-Data-Resources/master/060526/README.md>
(fetched 2026-09-04), snapshot dated **2026-05-06**:

- **1,194 datasets**, **61 publishing organizations**, **3,677 resource files**,
  **2,019 DataStore-queryable resources**.
- Top publishers by dataset count: Ministry of Transport 180, Survey of Israel (מפ"י) 116,
  Environmental Protection 85, Justice 82, Finance 60, Health 56, **Be'er Sheva Municipality 44**,
  Welfare 40, Culture & Sport 32, **Bank of Israel 30**, Innovation/Science 29, Education 24,
  Labor 18, Agriculture 18, Aliyah 17.
- Catalogue grows roughly weekly; resource UUIDs are stable, new resources appear.
- "Many `*.gov.il` *web* properties geo-fence outside Israel, but the `data.gov.il` CKAN API and
  the `download/datafile.csv` resource URLs were directly reachable during this snapshot from .il."
  → **Geo-fencing is a live operational risk for a server hosted outside Israel.** Our
  `apify-il-open-data` Actor runs on Apify's US/EU infrastructure; nobody has verified it can reach
  `data.gov.il` from there. That is an untested assumption in a shipped product.
- Per-dataset freshness: `ica_companies` is `Frequency: Day`, `Update: Automat` (payload above).
  This is the freshest and most commercially interesting table on the portal.

There is also a month-by-month changelog project reconstructing what appeared on the portal:
<https://github.com/danielrosehill/Israel-Open-Data-Changelog> (created 2026-07-27, 0 stars).

---

## 3. Municipal portals — fragmented, mostly NOT CKAN

The assigned criterion assumes "municipal portals" as a category. The evidence says the category
barely exists as a queryable thing:

- **Be'er Sheva** is the only municipality in the data.gov.il top-15 publishers (44 datasets) —
  i.e. most municipalities publish nothing nationally. [G, snapshot README above]
- **Tel Aviv**: **[G]** a research digest checked into
  <https://github.com/oresh123456/igudim-dashboard> (`הצגה למורן/api-research/agents/natl-commercial-cbs-micro.part`,
  rendered via `search_code` 2026-09-04) records:
  > `opendata.tel-aviv.gov.il` — "React SPA shell only, no direct data; config.js pointed to
  > `opendatasource.tel-aviv.gov.il` (dead/SharePoint 404) - real data lives at
  > `gisn.tel-aviv.gov.il` ArcGIS instead"
  > `opendatasource.tel-aviv.gov.il/api/3/action/package_search` — "404 SharePoint redirect, not a
  > CKAN API despite config.js reference"
- **Haifa**: ArcGIS, not CKAN. **[G]**
  <https://github.com/hasadna/datacity-ckan-dgp> `datacity_ckan_dgp/operators/gis_fetcher.py`
  targets `https://gisserver.haifa.muni.il/arcgiswebadaptor/rest/services/PublicSite/Haifa_Eng_Public/MapServer/13`.
- **Hasadna (הסדנא לידע ציבורי)** runs "datacity" CKAN instances for municipalities and seeds them
  *from data.gov.il*, not from the cities. **[R]**
  <https://raw.githubusercontent.com/hasadna/datacity-ckan-dgp/main/datacity_ckan_dgp/instance_initializer_packages.yaml>
  (fetched 2026-09-04) — every default municipal package points back at national sources:

  | package id | title | source | resource_id |
  |---|---|---|---|
  | cellular_antennas_active | אנטנות סלולריות פעילות | המשרד להגנת הסביבה | `19696db6-98c4-4171-9366-1487de3f5dc9` |
  | cellular_antennas_hakama | אנטנות סלולריות בהקמה | המשרד להגנת הסביבה | `4b8180ad-6258-4e9b-8d84-7e796c6df3af` |
  | fire_rescue_stations | תחנות כיבוי אש | כבאות והצלה | `e6b2df0b-2908-4cda-9adc-eb3c4d3fbf55` |
  | talmudiccollege | ישיבות | מפ"י | `d6865026-2535-4310-99ec-413b2b7fdda0` |
  | kindergarten | גני ילדים | מפ"י | `75d2d6a7-edc9-4615-8e06-fc0940e384ce` |
  | schools | בתי ספר | מפ"י | `99b92311-9675-4351-85cd-9ed5ee69a787` |
  | parkinglots | מגרשי חניה | מפ"י | `34729a10-299b-448d-a223-5d7533e8f147` |
  | corona_data | נתוני קורונה ליישוב | מידע לעם | via `https://www.odata.org.il` package `adc425d2-...` |

  These resource ids are *verified from a working production config* and are worth more than the
  "verify" placeholders currently in `products/apify-il-open-data/docs/ISRAELI_DATASETS.md`.
- **A second Israeli CKAN portal exists that the repo does not know about:**
  `https://www.odata.org.il` ("מידע לעם"). Same CKAN 2.x API shape, so our existing `baseUrl`
  input already supports it at zero build cost. Licence terms for odata.org.il: **unknown, not
  checked.**

Conclusion: "municipal open data" in Israel is a handful of ArcGIS REST servers per city plus a
Hasadna CKAN layer, not a market. Cleaning it is real work with no buyer I could name.

---

## 4. Which datasets a business would pay for — and who the buyer is

### 4.1 Company / NGO registry (KYB) — a real market that is ALREADY OCCUPIED

**[S]** WebSearch 2026-09-04 for Israeli company-registry APIs returned live commercial products:

| Product | URL | What the listing claims |
|---|---|---|
| Israel Company Data (RapidAPI, by `appaio`) | <https://rapidapi.com/appaio/api/israel-company-data> | "access to the official Israeli Government Company Register ... for KYB and AML compliance" |
| Israel Companies Registrar (Apify, by `bovi`) | <https://apify.com/bovi/israel-companies-registrar> | counterparty verification, lead-gen, KYB checks |
| Israeli Business Lookup — Company Search, KYB, Risk Score API (Apify, `behar.system`) | <https://apify.com/behar.system/...> | "832K+ Israeli entities across 4 government registries with ID validation, risk scoring, and daily-updated official data" |
| InfobelPRO Israel B2B Data | <https://www.infobelpro.com/b2b-data/israel> | "1.1M+ verified companies", API or bulk, for KYB/compliance/onboarding |

**This is the most important competitive fact in the whole criterion, and it lands directly on a
shipped product.** `products/apify-il-open-data` is a generic data.gov.il wrapper published free on
the same marketplace where at least two purpose-built Israeli-registry KYB actors already sit, one
of which claims 832K entities across four registries with risk scoring. Our Actor's README targets
"fintech / KYB / compliance teams" as buyer #1. That buyer already has two better-positioned
options on the same store.

I could not verify the competitors' traction: `apify.com` is **EGRESS_BLOCKED** (confirmed by a
failed WebFetch, 2026-09-04), and `rapidapi.com` did not yield pricing in search. **Nobody has
seen these listings' run counts, review counts or prices.** URLs an unblocked agent must open:
the four above.

Free open-source competitors also exist for the MCP/agent framing:
- <https://github.com/DavidOsherdiagnostica/data-gov-il-mcp> — **[R]** MIT-licensed production MCP
  server, nine tools over the CKAN API (README fetched 2026-09-04)
- <https://github.com/pipeworx-io/mcp-datagov-il> — data.gov.il MCP, TypeScript, updated 2026-08-26
- <https://github.com/LiorVainer/data-israel> — data.gov.il + all three CBS APIs
- `amirrosi/israeli-cbs-mcp` — CBS series + price indices (named in a third-party survey)

So the *plumbing* is a commodity given away free by at least four projects. Anything we charge for
has to be above the plumbing.

### 4.2 Address / street / locality validation — the clearest "clean and serve" case

**[S]** WebSearch 2026-09-04. Commercial vendors already sell Israeli address validation:
<https://www.postgrid.com/address-validation/israel-address-verification/>,
<https://www.geopostcodes.com/country/israel/address-validation/>,
<https://www.apitier.com/address-validation/israel>. The snippet also described the exact recipe
in use: "the data.gov.il street database is used for verifying streets ... along with the CBS
settlement list (~1,300 entries) for validating city names ... Israel Post for postal-code lookup",
producing "Hebrew official format, English transliteration, and structured JSON with separated
components, CBS city codes, and area codes."

A free competitor already implements exactly that as an agent skill:
<https://agentskills.co.il/en/skills/government-services/israeli-address-autocomplete> and
<https://lobehub.com/skills/skills-il-government-services-israeli-address-autocomplete>.

Buyer: Israeli e-commerce checkouts, delivery/last-mile software, CRM and invoicing vendors — the
same buyer segment `il-biz-tools` already addresses. Pricing anchor from the snippet: "paid plans
starting from $9.99/mo for some providers" (unattributed in the snippet — **treat as weak**).

### 4.3 CPI / מדד and indexation (CBS series) — a buyer with a legal reason to pay

CBS exposes machine-readable price indices. **[G]** Confirmed working endpoints, from three
independent repos rendered 2026-09-04:
- `https://apis.cbs.gov.il/series/data/list?id=<N>&startperiod=MM-YYYY&endperiod=MM-YYYY&format=json&lang=en`
- `https://api.cbs.gov.il/index/data/price?id=120010` (120010 = Consumer Price Index — General)
- `https://apis.cbs.gov.il/index/catalog/tree?lang=en`, `.../Index/Catalog/Catalog?lang=en`
- SDMX: `https://apis.cbs.gov.il/sdmx/data/...`, and `apis.cbs.gov.il/SDMX/DATA/IMF/ECOFIN_POP/1`

Sources: <https://github.com/Aripel2026/STATISTICS-> (`CLAUDE.md`, `server-lib/cbsClient.ts`,
`data/cbs-indicator-map.json` with `"verifiedAt": "2026-07-19"`),
<https://github.com/LiorVainer/data-israel>,
<https://github.com/gmhoward9289-ops/counting-chicken-wings> (`docs/ISRAEL-PLAN.md`).

**The defect that is the product.** Two unrelated projects independently report that the CBS
*catalogue* is broken while the *data* endpoints work:
> "CBS catalog endpoints | Not navigable. `/series/catalog/{tree,maintopic,level}` return HTML
> error pages, so series IDs cannot be discovered from the API itself. **This is the one blocker
> left**" — counting-chicken-wings `docs/ISRAEL-PLAN.md` [G]
> "the general `series/*` API, whose catalog is unreliable — see CLAUDE.md" — STATISTICS- [G]

So the scarce good is not access, it is **a maintained series-ID map**: "CPI general = 120010"
and a few hundred more. That is exactly a "cleaned and served" asset, it is small, and it is
defensible only by maintenance.

Also **[G]**: "no auth documented, but a **User-Agent header is mandatory** on all CBS API queries
per the CBS API interface page" — <https://github.com/oresh123456/igudim-dashboard>
`הצגה למורן/api-research/out/digest.md`. Cheap gotcha, worth knowing before building.

Buyer: Israeli landlords, property managers and contract administrators who must apply הצמדה למדד
(index-linkage) to rent and construction contracts; Israeli accounting/ERP vendors. This is the
same audience `products/il-biz-tools` already serves with Hebrew calculators, so the acquisition
channel is not new — it is the one that already exists.

### 4.4 Exchange rates (BOI) — same shape, blocked on licence

Israeli tax and accounting workflows require the BOI **representative rate** (שער יציג). The API
is confirmed working (§1.4) and one of the three repos using it is literally a tax-forms generator
(<https://github.com/talmiller2/tax_forms_generator>) — that is a real user of exactly this data
for exactly this purpose. But the terms are unread, so this stays AMBER and is not a build.

---

## 5. Dead ends and things I could not close

1. **Government tender / מכרזים alert market.** One search
   (`שירות התראות מכרזים ממשלתיים מנוי חודשי מחיר ישראל`, 2026-09-04) returned only the official
   portals (<https://www.mr.gov.il/>, <https://apps.land.gov.il/MichrazimSite/>,
   <https://www.online.mod.gov.il/>) and unrelated Wikipedia pages — **no commercial tender-alert
   subscription product surfaced at all**. That is one search, so it is weak evidence of absence,
   not proof. Either the market is served by sales-led incumbents with no public pricing, or it is
   genuinely thin. Worth exactly one more search by a later scout, not more.
2. **Competitor traction on Apify and RapidAPI is unknown.** `apify.com` is EGRESS_BLOCKED
   (verified); `rapidapi.com` pricing not in snippets. No run counts, no review counts, no prices.
   Any claim about how well the incumbents are doing would be invention.
3. **BOI terms of use unread** — <https://www.boi.org.il/en/terms-of-use/>.
4. **odata.org.il licence unread.**
5. **All Israeli licence text is snippet-only.** `data.gov.il`, `cbs.gov.il`, `gov.il` are all
   egress-blocked. The quotes in §1.1 and §1.2 are search snippets quoting those pages, not pages
   I rendered. They are consistent and specific, which is why I rate them medium-to-high, but a
   human should open the three URLs before money depends on them.
6. **Geo-fencing from non-Israeli infrastructure is untested** for our own shipped Actor (§2).
7. **A WebFetch summariser hallucinated once this session**: asked for the Israel section of
   `bas1l/population-synthetic` `investigate-international-statistical-apis-findings.md`, it
   returned "Israel is absent from this batch" — while GitHub `search_code` had already shown me
   the file's Israel section verbatim. The `main` branch fetch 404'd/mismatched and the summariser
   answered anyway. Same failure mode the sweep instructions warn about for truncated trees.
   Trust `search_code` fragments over WebFetch summaries when they disagree.

## 6. What this criterion is actually worth

The licence gate is **open** — that is the good news and it is the one thing this criterion was
mainly asked to establish: data.gov.il permits commercial reuse outright, CBS permits it with
attribution, CBS PUF microdata does not permit redistribution at all, BOI is unknown.

The bad news is that open licence plus a documented API means the barrier to entry is nil, and
four free MCP servers plus at least three paid marketplace listings have already walked through it.
Nothing here is a 20,000 ILS/month line on its own. The honest shape of the opportunity is a small
recurring API attached to an audience we already have (il-biz-tools), where the value is a
maintained mapping — series IDs, resource IDs, Hebrew→English field names, street/locality
normalisation — rather than access to the data.
