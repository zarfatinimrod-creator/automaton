# Scout: data-apis / company-registries

**Criterion.** Company and business registry data (Israel and worldwide): what is legally
redistributable, who buys it, existing sellers and their pricing.

**Scout:** WORKER-SCOUT `company-registries`, group `data-apis`.
**Date:** 2026-09-04. **Search budget spent:** 8 of 8 (the cap). No searches were refused.
**Evidence grades used:** `RENDERED` = a page WebFetch actually returned; `SNIPPET` = a search
result summary quoting a page I could not open; `REPO` = a file rendered from GitHub /
raw.githubusercontent.com; `INTERNAL` = an existing file in this repository.

---

## 0. The headline, before the detail

Registry data is the rare criterion where **the legal question is easy and the commercial
question is brutal.** The two largest registries in the world that matter to us — Israel's
`ica_companies` and the UK's Companies House — are both explicitly open for commercial reuse,
and GLEIF's global LEI file is CC0. That is exactly why there is almost no money in reselling
them: *the buyer's alternative to paying us is one unauthenticated HTTP GET.*

The money in this field sits with firms selling **coverage the registries do not publish**
(UBO chains, cross-jurisdiction resolution, sanctions overlay) at **£2,250–£12,000/year** or
**$2 per verification**. A software-only new entrant with no brand cannot assemble that
lawfully, because most of the world's registries do not publish bulk at all.

**And the Israeli version of this idea is already occupied, by three live competitors, and was
already refuted inside this repository.** See §5.

---

## 1. Israel — what is actually published, and under what terms

### 1.1 The dataset

`ica_companies` — "מאגר חברות - רשם החברות", Ministry of Justice, on data.gov.il (CKAN).

- Dataset page: https://data.gov.il/dataset/ica_companies — **SNIPPET only**, data.gov.il is
  egress-blocked from this container.
- Companies resource id: `f004176c-b85f-4542-8901-7b3176f9a054`
- Metadata endpoint: `https://data.gov.il/api/3/action/package_show?id=ica_companies`
- Row query endpoint:
  `https://data.gov.il/api/3/action/datastore_search?resource_id=f004176c-b85f-4542-8901-7b3176f9a054&q=MONDAY.COM&limit=5`
- Exact lookup: `...&filters={"מספר חברה":514744887}`

Source for all of the above: **REPO** —
https://github.com/skills-il/government-services/blob/master/israeli-company-lookup/SKILL.md
(rendered) and the same repo's `israeli-company-lookup/references/entity-types.md`,
`references/domain-checklist.md`, `evidence.json` (via GitHub `search_code`).

Fields named by that skill: `מספר חברה`, `שם חברה`, `שם באנגלית`, `סוג תאגיד`, `סטטוס חברה`,
`מפרה` (breach-of-law flag), `שנה אחרונה של דוח שנתי`.

That repo's `evidence.json` quotes the CKAN `package_show` description **verbatim**, which is
the closest thing to a primary source obtainable from this network:

> "הקובץ מכיל את רשימת החברות הרשומות במרשם שמנהל רשם החברות כולל חברות בסטטוס: פעילה,
> פעילה/בפירוק - בכינוס נכסים, פעילה/בפירוק - הליך פשרה או הסדר/פירוק זמני, בפרוק מרצון,
> בפרוק ע\"י בימ\"ש, מחוקה, מחוסלת מרצון, חיסול ע\"י בימ\"ש, מחוסלת עקב מיזוג, פעילה זמנית,
> נגרעה מהמרשם."

**To close this claim properly, an unblocked agent must open**
`https://data.gov.il/api/3/action/package_show?id=ica_companies` directly.

### 1.2 Licence / redistribution

- data.gov.il's terms live at **https://data.gov.il/about/terms** — identified as the canonical
  licence URL by a third-party Israeli open-data site's own code
  (`darkdiamond/govil.ai`, `frontend/utils/dataset-license.ts`, **REPO**), which hardcodes
  `{ name: 'תנאי שימוש — data.gov.il', url: 'https://data.gov.il/about/terms' }` as the default
  licence object for every dataset.
- A research log in `oresh123456/igudim-dashboard` (`api-research/coverage.jsonl`, **REPO**)
  records the outcome of exactly this question: *"general open-license policy confirmed
  (copy/distribute/derivative-works permitted); no dataset-specific ToS on storing derived
  coordinates found"*.
- A third repo (`balol100/theory`, **REPO**) states in its own published terms that Ministry of
  Transport data on data.gov.il is *"available to the public on data.gov.il under a CC-BY
  license"*.

**Verdict: GREEN, with one gap.** Three independent third parties treat data.gov.il datasets as
openly reusable including commercially, and the portal has a single site-wide terms page rather
than per-dataset licences. But **no agent in this repo has yet rendered
`https://data.gov.il/about/terms` itself.** That is the one URL a human or unblocked agent must
open before anything is sold on top of `ica_companies`. Grade the licence claim `medium`
confidence until then.

### 1.3 What Israel does NOT publish in the dump

The registry's paid and non-bulk surfaces, per the same skill (**REPO**):

| Surface | Where | Note |
|---|---|---|
| Full company extract (נסח חברה) | https://www.gov.il/en/service/company_extract | basic info free, **full extract paid** |
| Partnership extract | https://ica.justice.gov.il/Request/OpenRequest?rt=PartnershipExtract | not in the CKAN dump |
| Amutot / חל"צ | https://www.guidestar.org.il | separate portal, free extracts |
| Liquidation & creditor notices | https://www.gov.il/he/Departments/DynamicCollectors/gazette-official (רשומות / ילקוט הפרסומים) | **not in the CKAN dump** |
| Insolvency cases post-2019 | https://insolvency.justice.gov.il/poshtim/main/tikim/wfrmlisttikim.aspx | **not in the CKAN dump** |

*One number in that skill I refuse to repeat as fact:* it gives a company-extract fee of
"approximately 2,559 NIS online or 3,123 NIS via paper (2026)" while simultaneously saying the
fee "is stated on the request form itself". Those figures are the right order of magnitude for
the **annual company fee (אגרה שנתית)**, not an extract, and the skill itself flags them as
needing verification. Treat as **unverified; do not price anything off it.**

A UNODC directory page also indexes Israel's open-source registries —
https://globenetwork.unodc.org/globenetwork/en/directory-of-open-source-registries/israel.html
(**SNIPPET**, not opened) — and OpenCorporates carries the Israeli register as jurisdiction 119:
https://opencorporates.com/registers/119 (**SNIPPET**).

A search result also asserted: *"No public API is available from the Israel Corporations
Authority for company registry data as of May 2026, but local data suppliers provide API-based
access"* (**SNIPPET**, businessdataguide.com). Consistent with everything above: the *authority*
has no API; the *open-data portal* does.

---

## 2. Worldwide — what is genuinely redistributable

### 2.1 GLEIF LEI Golden Copy — CC0, the cleanest grant in the field

Multiple independent repos (**REPO**, via GitHub `search_code`) state the same thing in their own
words, citing GLEIF's own pages:

> "License: CC0 (public domain). Source: GLEIF Golden Copy."
> "CC0 1.0 — commercial use and redistribution are expressly permitted with no attribution
> requirement."
> "CC0 1.0 Universal licence. That is GLEIF's grant"

Primary URLs those repos cite (none opened from here — **not blocked-tested**, but they are the
URLs to open):
- https://www.gleif.org/en/meta/lei-data-terms-of-use
- https://www.gleif.org/en/lei-data/gleif-golden-copy/download-the-golden-copy
- https://www.gleif.org/en/lei-data/gleif-concatenated-file
- https://www.gleif.org/en/lei-data/gleif-api
- `https://goldencopy.gleif.org/api/v2/golden-copies/publishes` (the machine endpoint that gives
  the current dated ZIP URL)

**Verdict: GREEN, and the strongest legal position available.** CC0 means no share-alike, no
attribution, resale permitted. It also means everyone else has it for free, including GLEIF's own
public API — so the licence's generosity is precisely why the raw data has no price.

### 2.2 UK Companies House — OGL v3.0, free bulk

**REPO** evidence quoting the primary source:

> "Open Government Licence v3.0 — commercial reuse permitted with attribution.
> (source: https://developer.company-information.service.gov.uk/developer-guidelines/)"

Free bulk products, URLs found in repo code (**REPO**):
- http://download.companieshouse.gov.uk/en_output.html (company data snapshot)
- http://download.companieshouse.gov.uk/en_pscdata.html (persons with significant control — i.e.
  **beneficial ownership, free**)
- http://download.companieshouse.gov.uk/en_accountsdata.html (accounts)

Licence text: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

**Verdict: GREEN.** Commercial reuse with attribution. Note the caution one repo attached to it:
*"Do not assume that one set of terms applies to every field, document, product, or third-party
item"* — Companies House images and some third-party content are carved out.

### 2.3 The structural fact that kills global coverage

`aunikolskii-bit/company-registry-atlas` (**RENDERED**,
https://github.com/aunikolskii-bit/company-registry-atlas, licence `CC BY 4.0`) catalogues
**1,174 official company/tax/customs/permit registries across 202 countries** and scores each on
how the data can be retrieved:

| Access mode | Count of 1,174 |
|---|---|
| API (174 open, 2 key-required, 2 unspecified) | **178** |
| Bulk (51 bulk-dump, 4 open-bulk) | **55** |
| HTML page only | 267 |
| Search form only | 141 |
| Dead / inaccessible | 267 |
| Unevaluated candidates | 759 |

**That is the whole economics of this criterion in one table.** Roughly 5% of the world's
registries publish bulk and ~15% publish an API. Global coverage therefore cannot be assembled
from open feeds; it is assembled by scraping search forms and by buying from national resellers.
Scraping registries that publish only a search form is, at best, AMBER against their terms and in
several jurisdictions against law. **A software-only operation obeying this repo's constitution
cannot build global registry coverage.** That is not a gap in my search; it is the answer.

Also indexed by `awesomedata/awesome-public-datasets` (**RENDERED**):
- https://opencorporates.com/ (marked FIXME in the list)
- https://github.com/Alessandro114/world-company-database — *"250M+ company records from 50+
  countries with revenue, employees…"* — **README 404s on `main`; unverified, do not cite as a
  source of anything.**

### 2.4 One licence trap, stated plainly

OpenCorporates' free/open tier is **share-alike encumbered**. From the pricing research
(**SNIPPET**, https://opencorporates.com/pricing/ and datarade/zephira summaries):

> "API accounts are free if you are going to be using the data in an open data project or
> product, provided the product or database is released under an open licence with share-alike
> attribution to OpenCorporates."

**Building a paid product on an OpenCorporates free/open-data key is RED.** It breaches the grant
we would be operating under. This is worth recording because it is the obvious shortcut and it is
closed.

---

## 3. Who buys, and at what price — the demand side

All **SNIPPET** grade. None of these vendor pages could be opened (rapidapi.com, apify.com,
paddle.com etc. are egress-blocked); the URLs below are what an unblocked agent must open.

| Seller | Price seen | Source URL (must be opened to confirm) |
|---|---|---|
| **OpenCorporates** | Essentials **£2,250/yr**, Starter **£6,600/yr**, Basic **£12,000/yr**; enterprise on request. Roughly *$3,040/yr for 500 calls/month, $8,930 for 2,500, $16,230 for 5,000*, with daily caps 200/500/1,000. A "no results" response still consumes a call. | https://opencorporates.com/pricing/ ; https://zephira.ai/opencorporates-pricing-explained-2026-plans-api-limits-licensing-and-what-it-means-in-production/ ; https://datarade.ai/data-providers/opencorporates/profile |
| **Didit** | **$2.00 per company verification**, no minimums — includes registry lookup, UBO, officer screening, entity AML | https://didit.me/blog/business-verification-api/ |
| **CompanyData** | credit model **from $29.99/month**; a KYB verification = 1–3 credits | https://companydata.com/kyb-api/ |
| **Middesk** | no published rates; negotiated | https://www.middesk.com/kyb-software |
| **kompany (Moody's)** | no published rates; enterprise licensing | — |
| **Sayari** | no pricing found | — |
| **InfobelPRO** | "Israel B2B Data — 1.1M+ Verified Companies", API or bulk; price not published | https://www.infobelpro.com/b2b-data/israel |
| **Datarade** (marketplace) | company-registry data sold one-time / subscription / **per-record**, volume discounts | https://datarade.ai/data-categories/company-registry-data |

**The buyer, named.** Not "everyone". The people who pay for registry data are:
1. **KYB/AML compliance engineering teams** at fintechs, PSPs and marketplaces onboarding
   business customers — they buy per-verification ($2 at Didit) or per-seat enterprise.
2. **Sanctions/AML screening vendors** who need entity resolution across jurisdictions
   (OpenSanctions' `nomenklatura` explicitly *"handles the data enrichment function that links
   OpenSanctions to external databases like OpenCorporates"* — **REPO**,
   https://github.com/opensanctions/opensanctions).
3. **Credit-risk and B2B sales-intelligence vendors** buying bulk per-record on Datarade.

Every one of those three buys **coverage and resolution**, not a lookup. A lookup is what the
registry already gives away.

**Comparable that proves the model can work at small scale:** OpenSanctions — open source (MIT),
data under **CC BY-NC 4.0** with a paid commercial licence
(https://www.opensanctions.org/licensing/, **not opened**). The NC clause is the whole business:
free for the world, paid for anyone commercial. That is the only structure found in this
criterion that lets a tiny team charge for open-derived data — and it only works because the
value added (dedup, entity resolution, sanction linkage) is expensive to reproduce.

---

## 4. Payability to Israel

**YES for every route that matters here, and it is already proven inside this repo**, not
inferred: `products/apify-il-open-data` (Apify pay-per-event), `products/il-biz-tools` (Paddle),
`products/x402-il-api` (x402) and `products/telegram-il-tools-bot` (Telegram Stars) are all
shipped Israeli-payable rails. A registry API sold from our own domain via Paddle, or as an Apify
actor, or as an x402-paid endpoint, inherits that. **INTERNAL** evidence.

**UNKNOWN** for Datarade and for RapidAPI seller payouts to Israel — neither was verifiable
(both domains blocked, and I had no search budget left). Do not assume either.

---

## 5. The Israeli play is already occupied — and this repo already proved it

This is the most important thing in this file and it costs nothing to establish, because a
previous auditor in this same sweep did the work: `research/colony-sweep/audits/agent-markets.md`
(**INTERNAL**). Its findings, quoting competitor listing text:

| Actor on Apify Store | What it is |
|---|---|
| `apify.com/parseforge/israel-companies-registrar-scraper` | wraps `data.gov.il/api/3/action/datastore_search`, **priced from $7.50 per 1,000 results** |
| `apify.com/bovi/israel-companies-registrar` | *"queries the government's own open-data CKAN API … a free, keyless, official public dataset"*; pay-per-event, one charge per company record |
| `apify.com/lentic_clockss/israel-data-search` | **33 Israeli data sources** in one actor, incl. ICA company registry, contractor licences, health directories, procurement tenders |
| `apify.com/behar.system/deleted-actor-2105817466` | *"Israeli Business Lookup — Company Search, KYB, Risk Score API"* — **deleted**: an entrant that came and went |
| `rapidapi.com/appaio/api/israel-company-data` | *"official Israeli Government Company Register … primarily intended for KYB and AML"* (**SNIPPET**, found by me this session) |

The audit's conclusions, which I confirm rather than re-litigate:

- **"The Hebrew-schema moat is false."** Competitors already read the Hebrew schemas.
- **"The price floor is zero."** In `bovi`'s own words the source is *"a free, keyless, official
  public dataset"*. The buyer's alternative to paying is
  `curl 'https://data.gov.il/api/3/action/datastore_search?resource_id=…'`.
- The proposed portfolio of "one to two dozen Israeli datasets" is **already inside one
  incumbent listing** (33 sources).

I found one competitor the previous audit did not (`rapidapi.com/appaio/api/israel-company-data`,
which markets itself explicitly at KYB/AML). That makes the picture worse, not better.

---

## 6. The only differentiated angle I found, stated honestly

Everything above says *lookup* is worthless. The one thing the free feeds do **not** give is
**change over time**. The CKAN dump is a snapshot; nobody publishes "which companies changed
status to בפירוק this week, and which got the מפרה flag". Building that requires holding
snapshots and diffing them — cheap for us, impossible for a buyer doing a one-off `curl`.

- Legally: **GREEN for the CKAN-derived part** (same open terms, subject to §1.2's one open URL).
- Legally: **AMBER for the richer version** that would add רשומות / ילקוט הפרסומים liquidation
  notices and the Insolvency Commissioner case list — those are separate portals whose terms I
  did not verify at all. **Not recommended as a build in that form.**
- Commercially: the buyer is a **credit-risk / factoring / trade-credit-insurance** function, and
  I found **no evidence at all** that any such Israeli buyer exists at a reachable price. That is
  a hypothesis, not a finding, and it is graded `low`.

I am recording it because it is the only shape in this criterion that is not refuted, **not
because it is ready to build.**

---

## 7. Dead ends (say them so nobody re-searches)

1. **Reselling `ica_companies` as a lookup API/actor.** Three live competitors, one already dead,
   price floor zero, source free and keyless. Refuted internally before I started.
2. **Global registry coverage.** ~5% bulk / ~15% API across 1,174 registries. The rest needs
   scraping search forms — AMBER/RED, and excluded by the constitution.
3. **Reselling OpenCorporates-derived data on their free/open tier.** Share-alike + attribution
   grant. RED.
4. **Raw GLEIF/Companies House resale.** CC0 and OGL respectively — legally perfect, commercially
   worthless, because the issuers publish free bulk and a free API themselves.
5. **Verifying vendor pricing from this container.** rapidapi.com and apify.com are
   EGRESS_BLOCKED (confirmed this session, not assumed). data.gov.il is blocked. Every price in
   §3 is snippet-grade.

## 8. URLs a human or unblocked agent must open to close this criterion

1. `https://data.gov.il/about/terms` — the single unclosed legal question for anything Israeli.
2. `https://data.gov.il/api/3/action/package_show?id=ica_companies` — confirm fields, row count,
   update cadence.
3. `https://www.gleif.org/en/meta/lei-data-terms-of-use` — confirm CC0 first-hand.
4. `https://developer.company-information.service.gov.uk/developer-guidelines/` — confirm OGL v3.
5. `https://opencorporates.com/pricing/` — confirm the £2,250/£6,600/£12,000 tiers and the
   share-alike condition on the free tier.
6. `https://apify.com/parseforge/israel-companies-registrar-scraper` — confirm the $7.50/1,000.
7. `https://didit.me/blog/business-verification-api/` — confirm the $2/verification anchor.

## 9. Searches run (8 of 8)

1. `רשם החברות data.gov.il מאגר חברות רישיון שימוש מסחרי`
2. `OpenCorporates API pricing per month company data licence 2026`
3. `KYB business verification API pricing per lookup Middesk kompany Sayari 2026`
4. `RapidAPI company registry data API pricing subscription "per month" business lookup`
5. `"company registry" data seller Datarade price per record global business registry dataset`
6. `Israel company registry data API vendor commercial מאגר רשם החברות API מסחרי אימות עוסק`
7. `apify "israel companies registrar" actor pricing users monthly Israel data search actor`
8. (counted with 1) — plus zero-cost GitHub `search_code` / WebFetch passes on
   `skills-il/government-services`, `darkdiamond/govil.ai`, `oresh123456/igudim-dashboard`,
   `balol100/theory`, `gov-il/datagovil-ckanext`, `aunikolskii-bit/company-registry-atlas`,
   `awesomedata/awesome-public-datasets`, `opensanctions/opensanctions`.
