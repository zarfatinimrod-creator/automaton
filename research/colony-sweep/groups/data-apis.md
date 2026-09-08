# Group report — data-apis

**Supervisor:** SUPERVISOR (Opus 5). **Date:** 2026-09-04.
**Scouts reporting:** 8 — israeli-open-data, company-registries, financial-data, geo-address,
transport-weather, tax-rate-apis, sports-media-data, ai-training-data.
(All eight criteria in this group were swept in this wave; `research/colony-sweep/scouts/data-apis--*.md`
contains no earlier-wave file, so nothing is missing from this merge.)

---

## Headline

**This group earns nothing. I am ranking zero survivors.**

Not "small", not "needs more research" — zero. Eight scouts, ~60 searches, and the group's own
best-evidenced candidates all die on the same structural fact: **in data and API products, the
substrate is free and the buyer's alternative is one unauthenticated HTTP call.** Every line that
had a real buyer had an owner (an exchange, a rights-holder, a registrar, an incumbent brand); every
line that had a clean licence had a free issuer publishing the same bytes and usually a free wrapper
on npm as well.

Three walls, each independently sufficient, and every candidate in the group hits at least one:

1. **The issuer is the free competitor.** CBS, Bank of Israel, data.gov.il, SEC EDGAR, GLEIF, UK
   Companies House, the EU's TEDB, Open-Meteo, OpenWeather, Israel's MOT GTFS — every one of them
   publishes its own free API or bulk file. A perfect licence on a free substrate is not a business.
2. **The applied layer is free too, and usually MIT.** This is the finding the scouts kept missing
   and I kept confirming: `@il-address/core` (MIT, v1.0.0, published 2026-07-27, 1,300 cities +
   ~63k streets) eats the address product; `@skills-il/boi-exchange-mcp` eats the BOI FX product;
   `vatnode/eu-vat-rates-data-js` (MIT, daily-refreshed) eats the VAT-rates product; `edgartools`
   eats the EDGAR product; Hasadna's Open Bus eats the Israeli transit product; and — see below —
   **CBS itself publishes an indexation-calculator API endpoint**, which eats the group's
   highest-ranked scout recommendation.
3. **Where money exists, access is human-gated.** TASE Data Hub, IGDB, TMDB, MetaBrainz, MOT SIRI,
   IMS weather, Snowflake Marketplace, Datarade, OpenCorporates — each requires a signed contract, a
   discretionary approval, or a sales conversation. Those are not the identity/KYC/payout exception
   MISSION.md permits. They are disqualifiers.

The one genuinely useful thing this group produced is **negative knowledge with sources**, which is
why the rejected list below is the real deliverable, and why `docs/REJECTED.md` should absorb it.

---

## Verification I ran myself (not taken on the scouts' word)

| Claim | Scout | My verdict |
|---|---|---|
| CBS series-ID map + Hebrew indexation (הצמדה) API is "the scarce good" and worth ~₪600/mo | israeli-open-data | **REFUTED — this was the group's top candidate and it is dead.** CBS publishes (a) a free public indexation calculator at `cbs.gov.il/he/CBSNewBrand/Pages/Calculator.aspx`, (b) an *indexation-calculator API endpoint* of the form `https://api.cbs.gov.il/index/data/calculator/120010?value=…&date=…&toDate=…` returning `change_percent`, listed among the CBS API's own published functions, and (c) free commercial calculators already exist (Hilan, Heshev Avoda, Dekel, Protocol). The "applied layer nobody ships" is shipped by the issuer. Snippet-grade (cbs.gov.il and api.cbs.gov.il are both egress-blocked to me), but the endpoint form and parameters were quoted directly and corroborate the CBS API-functions page |
| data.gov.il permits commercial reuse — graded GREEN "by inference from third-party users", unread by anyone in this repo | israeli-open-data, company-registries, geo-address | **UPGRADED from inference to snippet, and it holds.** A search of `data.gov.il/he/terms-of-use` returns the portal's own licence language: use is permitted **commercially and non-commercially**, including copying, distribution, making available to the public, technical modification and **derivative works**, in any medium or format. Still not rendered (host egress-blocked to me as well). This is now the best-supported legal claim in the group — and it changes nothing, because the licence was never the binding constraint |
| Israeli registry **change feed** (status transitions, מפרה flag over time): "None found for the change feed specifically — every competitor sells snapshot lookups" | company-registries | **REFUTED.** The scout named credit-risk, factoring and trade-credit insurers as the hypothetical buyer and did not check the two brands that own that buyer. **CofaceBDI sells company monitoring with detailed change alerts organised by Companies-Registrar chapters**; **Dun & Bradstreet Israel sells real-time risk alerts** on customers, suppliers and competitors plus registrar extracts. The one candidate in the group with "no competitor found" has two branded incumbents with credit scores attached, and still zero observed buyers for our version |
| A free MIT npm package already covers Israeli address autocomplete | geo-address | **CONFIRMED first-hand.** `@il-address/core` exists on the npm registry: v1.0.0, MIT, "Headless Israeli city & street autocomplete", ~1,300 cities, ~63k streets lazy-loaded, published 2026-07-27. The scout's characterisation is exact, including that it ships no postal codes and no geocoding |
| CBS catalogue endpoints are unusable, so a maintained series-ID map is defensible | israeli-open-data | **DOUBTFUL.** `https://api.cbs.gov.il/Index/Catalog/Catalog?lang=en` is indexed and live as a URL; I could not fetch it (egress). Even if the catalogue is broken, the calculator finding above makes the map moot |
| Israeli company-registry resale is already occupied (parseforge $7.50/1k, bovi, lentic_clockss, appaio, one deleted entrant) | company-registries, israeli-open-data | **NOT INDEPENDENTLY VERIFIED** — apify.com and rapidapi.com are egress-blocked to me too. Two scouts reached it independently and one cites an earlier in-sweep audit; I accept it as the reason to reject, not as a measured price |

**Egress reality check.** I attempted five WebFetches of my own. Four were blocked
(`data.gov.il`, `www.cbs.gov.il`, `api.cbs.gov.il`, `www.bdicode.co.il`); one returned 403
(`npmjs.com` package page — the registry API worked instead). **Not one Israeli government or
Israeli vendor page was rendered by any of the nine agents in this group.** Every Israeli licence,
price and competitor claim in this report is snippet-grade or repo-grade. That is enough to decide
*not to build*; it would not be enough to publish to users.

---

## Merges and deduplication

The eight scouts produced heavy overlap. What I collapsed:

- **Bank of Israel FX (שער יציג)** appeared in three criteria (israeli-open-data, financial-data,
  tax-rate-apis) with three different ceilings (₪300 / ₪400 / ₪0). Kept the **tax-rate-apis**
  version — it is the only one built on rendered primary code (the endpoints appear in ~15
  independent repos, a free npm MCP server wraps them, and the OSS FX service Frankfurter has
  shipped a BOI adapter) — and adopted its ₪0.
- **Israeli companies registrar as a lookup API/actor** appeared in two criteria with two ceilings
  (₪300 / ₪300-then-killed). Kept the **company-registries** version, which refutes it with named
  competitors and their prices; the israeli-open-data version reached the same place with less.
- **Israeli address normalisation** appeared in two criteria (israeli-open-data ₪800,
  geo-address ₪600). Kept **geo-address**: it is the only one that found the free MIT package and
  the only one that traced the mikud gate to an actual HTTP 401 with a discriminating 404 sibling.
- **Israeli CPI / indexation** appeared in israeli-open-data and (as the CPI half) tax-rate-apis.
  Merged, then killed by my own verification above.
- **RapidAPI as a rail** appeared in three criteria, all landing on the same unknown: payouts are
  PayPal-only and **no provider-country list was ever retrieved**. Consolidated into one
  cross-group open question rather than three.
- **"Israeli government feed requires a signed form emailed to a department"** appeared as three
  separate findings (MOT SIRI, IMS weather, Israel Post mikud file). Merged into one structural
  rule, below — it is the most reusable thing this group learned.

---

## Ranked survivors

**NONE.**

Every candidate that reached my desk failed at least one hard gate: not payable to Israel, AMBER or
RED on terms, requires the owner to talk to a human, cannot be built by software alone, or has an
honest ceiling under ₪300/month. The last gate did most of the killing, and it killed the
best-evidenced candidates rather than the worst — which is the signal worth reporting.

I considered padding this list with the two least-refuted lines (the CBS indexation API and the
registry change feed) and did not, because I refuted both myself in the table above and a ranked
entry I have already argued against is worse than no entry. The board can act on "this group is
empty"; it cannot act on a ranked line whose supervisor does not believe in it.

**What I would say if the board insists on spending hours here anyway:** spend them *outside* this
group. The only residual value in data-apis is **free funnel content for a product we already own** —
folding the BOI/CBS date-semantics gotchas (the JSON endpoint ignores `?date=`, units are quoted per
1/10/100, customs rate ≠ representative rate for import VAT) into `products/il-biz-tools` as a free,
dated, sourced page. That is credibility and SEO, not revenue, and it must not be counted as a line.

---

## Rejected, and why

Grouped by what killed them. Every entry names the reopening condition, per `docs/REJECTED.md` rule 2.

### Killed by the issuer publishing it free (the dominant cause)

| Line | Killed by | Reopens if |
|---|---|---|
| **CBS indexation (הצמדה למדד) API / Pro tier** | CBS's own free web calculator **and** its own calculator API endpoint (`api.cbs.gov.il/index/data/calculator/{id}`), plus 4+ free commercial calculators | CBS withdraws the calculator endpoint AND a named buyer asks for a machine feed |
| **Bank of Israel FX (שער יציג) API** | Free unauthenticated `boi.org.il/PublicApi/GetExchangeRates` + SDMX, a free npm MCP server, and Frankfurter's shipped BOI adapter | Never as a standalone line |
| **Clean SEC EDGAR / XBRL API** | edgar.tools gives 100 calls/**day** away permanently; `edgartools` OSS parses it free; sec.gov is free | Nothing plausible |
| **Global VAT/GST rate API** | EU TEDB free for all users; `vatnode/eu-vat-rates-data-js` MIT, refreshed daily; all four incumbents ship rates in a permanent free tier | EC paywalls TEDB and incumbents drop free tiers |
| **Israeli tax reference feed (VAT %, thresholds, filing dates)** | The state publishes the answers free (REJECTED.md wall 2) and `skills-il/tax-and-finance` is a maintained MIT corpus with per-claim sources | Never as paid; ship free inside il-biz-tools |
| **GLEIF LEI Golden Copy resale** | GLEIF publishes free bulk + a free API under CC0 | A buyer names a resolution problem GLEIF's API cannot answer |
| **UK Companies House bulk resale** | Free OGL v3.0 bulk + the registrar's own free API; saturated UK market we have no distribution into | A named UK buyer first |
| **Generic weather API resale (Open-Meteo/CC BY)** | Open-Meteo 300k calls/mo free, $29/mo paid; OpenWeather 1M calls/mo free, $40/mo paid | Nothing under that floor |
| **Israeli static GTFS as a paid API** | Hasadna Open Bus Stride is a free, funded, incumbent REST API over the same feed; plus Transitland, MobilityData and two MIT agent skills | Rendered gov.il licence + a named buyer, both |
| **Israeli address normalisation API** | `@il-address/core` MIT (verified) covers the open half free; global incumbents (PostGrid, Melissa, Loqate, Smarty, APITier) sell the branded version; the half people pay for is mikud, which is closed | Google confirms IL is unsupported for Address Validation **and** a lawful mikud source appears |
| **Israeli companies registrar lookup API / Apify actor** | 4+ live competitors on our own marketplaces (one at $7.50/1k, one already deleted), all reading the same free CKAN endpoint | data.gov.il paywalls the registry, restoring a price floor |

### Killed by a human gate (MISSION.md §1 — not the permitted KYC exception)

| Line | The gate |
|---|---|
| **Israeli real-time transit (MOT SIRI)** | Sign a data-use form, email it to the Public Transportation Administration, await discretionary approval |
| **Israeli weather (IMS Envista)** | Sign `ims.gov.il/…/terms_0.pdf`, email to ims@ims.gov.il, await approval |
| **Licensed mikud file (Israel Post)** | Email Israel Post as a business customer, or file an FOI request and pay ~₪20 |
| **TASE / Maya Israeli securities data** | TASE Data Hub licence — a negotiated contract; TASE also asserts IP in its published prices and WAFs the undocumented endpoints |
| **IGDB game metadata** | "Arrange a commercial partnership" with IGDB/Twitch |
| **TMDB movie/TV metadata** | Commercial licence (~$149/mo, snippet) **and** an explicit clause barring use in or to train an ML/AI application |
| **MusicBrainz Live Data Feed** | CC-BY-NC-SA; commercial use needs a MetaBrainz agreement (CC0 core dumps are clean but worthless) |
| **Snowflake Marketplace paid listing** | Mandatory business-development contact before approval |
| **Datarade / Monda** | Paid annual provider subscription + a sales-conversation motion, before any revenue |

### Killed by terms (RED / AMBER, per gate 3)

| Line | Grade | Why |
|---|---|---|
| **CBS Public Use File microdata** | RED | Licence is explicitly "self-use, **without distribution rights**" |
| **Israel Post mikud via the scraped subscription key** | RED | HTTP 401 auth gate; terms silent on programmatic access. "Not forbidden" ≠ "permitted" |
| **OpenCorporates on a free/open-data key** | RED | Grant is conditional on share-alike open release; lawful route is £2,250–£12,000/yr |
| **Global registry coverage** | RED | Only ~5% of 1,174 registries publish bulk; coverage is assembled by scraping search forms |
| **Reselling FMP / Twelve Data / Alpha Vantage** | RED | Both vendors' terms expressly prohibit resale/redistribution |
| **OpenSky aviation data** | RED | Research and non-commercial only; any operational integration needs a written agreement; they block cloud IPs |
| **Liquipedia esports** | RED | Free API reserved for non-monetising projects and requires open-sourcing your code |
| **Live/official sports data** | RED | Exclusive rights, litigated; Sportradar itself had to buy a sublicence from Genius |
| **GovMap gush/helka geocoding** | AMBER | Docs require a valid key from an **approved domain** per call; keyless endpoints are undocumented with unread terms |
| **Transit-accessibility scoring over Israeli GTFS** | AMBER | Licence unresolved (three conflicting third-party labels); free isochrone stacks; no buyer |
| **Steam store data resale** | AMBER | Terms permit presenting data to *your own* end users, not bulk resale |
| **Maritime AIS** | AMBER/closed | AISHub requires operating a physical receiver; aisstream's commercial-use question (issue #181) is unanswered |
| **US sales-tax rate API** | AMBER | Needs US jurisdiction-boundary data we cannot maintain; the money is in filing/nexus, a regulated human service |
| **Real-time exchange-licensed market data** | closed by arithmetic | One Nasdaq non-display licence ≈ $10.5–11.2k/month against a ₪20,000 (~$5,400) target |

### Killed by no buyer at all

- **Municipal open data cleaning** — one municipality in data.gov.il's top 15; Tel Aviv's portal is a
  dead SPA; Hasadna runs the municipal CKAN layer free. No nameable buyer.
- **ITM↔WGS84 reprojection** — universal friction, solved free by proj4js/pyproj.
- **AI-training datasets** — AWS Data Exchange's rendered eligibility list **excludes Israel**;
  Datarade/Snowflake/Troveo are human-gated or need an original corpus we do not have; Hugging Face
  is distribution, not a rail. Selling an original self-produced dataset through our own rails is the
  one GREEN shape and has no observed buyer.
- **Tax filing-deadline / compliance-calendar API** — only seller found is Thomson Reuters ONESOURCE
  at enterprise, unpriced; the SMB version is given away as marketing by CPA firms.
- **Lichess CC0 / MusicBrainz CC0 core** — the cleanest licences in the whole group and free to every
  competitor; small audiences accustomed to free.
- **Israeli registry change feed** — the last unrefuted candidate, refuted above by CofaceBDI and D&B
  Israel, and carrying zero demand evidence of its own.

---

## Owner blockers found (catalogued precisely, not invented)

**Permitted type (one-time identity / KYC / payout — still open, do not assume done):**
1. **Paddle** seller identity and tax verification for the il-biz-tools Pro tier — already an open
   repo item, named by three scouts in this group.
2. **Apify** account identity verification (KYC) — required before any Actor can carry a price;
   already documented in `products/apify-il-open-data/README.md`, still open.
3. **RapidAPI** provider identity verification **and** a PayPal account in the owner's name able to
   receive USD payouts — and note the unresolved part: RapidAPI pays providers **by PayPal only**,
   and **no scout could retrieve the supported provider-country list**, so Israel payability on that
   rail is UNKNOWN, not yes.
4. **AWS Data Exchange** paid products additionally need a W-8, a VAT/GST number and US bank details
   — moot, since the rendered eligibility list excludes Israel entirely.

**Disqualifying type (contracts, correspondence and hardware — NOT the permitted exception, and no
line depending on them may be ranked):** MOT SIRI signed form; IMS signed terms PDF; Israel Post
mikud file by email or FOI; TASE Data Hub licence; IGDB commercial partnership; MetaBrainz commercial
agreement; TMDB commercial licence; Snowflake business-development contact; Datarade paid provider
subscription plus sales motion; AISHub physical AIS receiver.

---

## Scouts whose work was thin, unsourced, or wrong where it mattered

Honest assessment, since the auditor will check it:

- **ai-training-data — thinnest of the eight.** Nearly every load-bearing claim is snippet-grade, and
  the three questions that would actually decide the criterion (Opendatabay seller-country
  eligibility, Snowflake's provider-country list, Troveo onboarding) were all left open. It also
  surfaced a direct contradiction on AWS Data Exchange eligibility (rendered doc excludes Israel; a
  snippet says it includes Israel) and left it unresolved. Its conclusion — no build — is almost
  certainly right, but it is right by exhaustion rather than by evidence.
- **sports-media-data — honest but almost entirely snippet-grade on the licences that decide it.**
  The TMDB $149/month figure and its AI clause, the IGDB partnership requirement and the Liquipedia
  terms were never rendered; the one document the scout tried to render (StatsBomb's LICENSE.pdf) was
  an image-only PDF it could not read. It said all of this plainly, which is the right behaviour, but
  the criterion is not closed to the standard the others reached.
- **israeli-open-data — well-sourced, and wrong on its own headline.** It did the hardest technical
  work in the group (CBS endpoint archaeology across three independent repos) and then proposed
  selling a calculation the issuer publishes as a free API endpoint. It searched CBS's *access*
  terms and never searched whether CBS already ships the *product*. One Hebrew search closed it.
- **company-registries — the best-sourced report in the group, with one hole.** Excellent on
  licences and on refuting the registry-lookup resale, and it correctly graded its change-feed
  demand as "low, entirely unevidenced" — but it named credit insurers and factoring firms as the
  buyer and did not spend one search on CofaceBDI or D&B Israel, who sell precisely that.
- **financial-data, geo-address, transport-weather, tax-rate-apis — solid.** Each rendered primary
  sources where it could, marked snippet-grade claims as such, refused a build rather than dressing
  one up (geo-address's mikud refusal is the cleanest constitution call in the sweep), and
  transport-weather explicitly recommended closing its own criterion. No complaints.

---

## What this group is worth to the colony

Zero revenue, and two pieces of reusable knowledge:

1. **The Israeli-government-feed pre-check.** Before any market work on an Israeli public feed, ask
   one question first: *does access require signing a form and emailing a department?* MOT SIRI, IMS
   weather and the Israel Post mikud file all die there, and dying there costs a scout's entire
   budget if the question is asked last. Add it to the sweep checklist.
2. **The free-applied-layer check.** This group's scouts repeatedly found a free substrate, correctly
   moved "up the stack" to an applied layer, and failed to check whether *that* was free too. It was,
   four times out of four (npm, MCP servers, MIT skill corpora, and the issuer's own calculator
   endpoint). The check costs one npm-registry fetch and one search, and it would have changed this
   group's top recommendation.

**Recommendation to the board: mark `data-apis` CLOSED.** Do not re-sweep it without one specific
kind of new information — a rendered primary licence page that changes an AMBER to GREEN, plus a
named buyer who has paid someone for that data shape. Neither alone is enough; this group's whole
lesson is that clean licences and free data arrive together.
