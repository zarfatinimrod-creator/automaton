# Scout report — data-apis / transport-weather

**Criterion:** Public transport (GTFS), weather, aviation and maritime feeds: commercial reuse
terms, existing free competition, and whether any buyer pays.

**Scout:** WORKER-SCOUT `transport-weather`, group `data-apis`. Date: 2026-09-04.
**Search budget used: 8 of 8 (the cap).** Everything else came from GitHub (`WebFetch` on
`raw.githubusercontent.com` / `github.com`) and the GitHub MCP `search_code`, which cost nothing.

**Evidence grades used below:** RENDERED = I fetched the page and read it. SNIPPET = a search
result summary quoting a page I could not open. INFERRED = my reasoning over the above.

---

## Blocked hosts confirmed this session (do not retry)

| Host | Result |
|---|---|
| `opensky-network.org` | `EGRESS_BLOCKED` (tried `/about/terms-of-use`) |
| `ims.gov.il` | `EGRESS_BLOCKED` (tried `/sites/default/files/docs/terms_0.pdf`) |
| `gov.il` | blocked per repo standing note; the MOT GTFS licence page lives there |

**URLs a human or unblocked agent must open to close the open questions:**
1. https://www.gov.il/he/pages/gtfs_general_transit_feed_specifications — the licence URL that
   Transitland, MobilityData and `jqueguiner/gtfs` all point at for the Israeli GTFS feed.
2. https://www.gov.il/BlobFolder/generalpage/gtfs_general_transit_feed_specifications/he/GTFS_Developer_Information_2022.07.27.pdf
3. https://ims.gov.il/sites/default/files/docs/terms_0.pdf — the IMS weather API terms form.
4. https://opensky-network.org/about/terms-of-use — full OpenSky data licence agreement.

---

## 1. Israeli public transport data

### 1.1 Static GTFS — free, keyless, and the licence is genuinely unresolved

RENDERED, GitHub MCP `search_code` for `gtfs.mot.gov.il license` (2026-09-04). Four independent
third-party catalogues point at the same feed and **disagree about its licence**:

- `MobilityData/mobility-database-catalogs` →
  `catalogs/sources/gtfs/schedule/il-ministry-of-transport-and-road-safety-gtfs-2519.json`:
  `"direct_download": "https://gtfs.mot.gov.il/gtfsfiles/israel-public-transportation.zip"`,
  `"license": "https://www.gov.il/he/pages/gtfs_general_transit_feed_specifications"` — a link,
  not a licence name.
- `transitland/transitland-atlas` → `feeds/gtfs.mot.gov.il.dmfr.json`: licence given as a URL to
  the gov.il developer-information PDF.
- `ziv-daniel/hass-israel-transportation-integration` → `scripts/update_gtfs_data.py`:
  `Data Source: https://gtfs.mot.gov.il` / `License: CDLA-Permissive-1.0` — one developer's
  assertion, not a government statement.
- `clemensv/real-time-sources` → `tools/candidates/transit/israel-mot-transit.md` (RENDERED in
  full): `**License**: Creative Commons Attribution (CC BY)` — for the CKAN portal datasets.
- `ChelseaKR/gtfs-scorecard` → `registry/il/all.yaml`: `license_note: Israeli government open data
  terms; credit the Ministry of Transport and Road Safety. Published free with no registration.`
- `oresh123456/igudim-dashboard` → `.../api-research/out/digest.md`: **"no explicit written
  license/ToS found (checked bus.gov.il, none surfaced) — verify reuse/storage terms with legal
  before publishing derived coordinates in a public-facing dashboard, though de-facto reuse is
  common (Hasadna's open-bus project redistributes it)."**

Three labels (CC BY / CDLA-Permissive-1.0 / unknown) for one feed is the finding. Nobody has
rendered the actual clause. **ToS = AMBER** for a paid derived product, and AMBER is not buildable
under the rules.

Access facts (RENDERED, `clemensv/real-time-sources`, recheck dated 2026-07-16):
static GTFS is **keyless**, `gtfs.mot.gov.il` → 200, a **148 MB zip**, republished nightly.

### 1.2 Real-time: SIRI, not GTFS-RT, and it needs a signed form

RENDERED (`clemensv/real-time-sources`): *"Real-time is SIRI-SM/VM behind a free `ISRAEL_MOT`
registration key … SIRI, not GTFS-RT … **No keyless GTFS-RT feed exists.**"* Endpoint
`https://siri.motrealtime.co.il:8081/Siri/SiriServices` (SOAP/XML), SIRI-SM stop predictions and
SIRI-VM vehicle positions at ~30 s.

Corroborating, SNIPPET (WebSearch, 2026-09-04, Hebrew query): *"Developers or companies interested
in receiving real-time SIRI SM information are asked to **sign a form** … and send it to the Public
Transportation Administration."* Also SNIPPET: `TomerBenda/ilsochrone` docs (RENDERED via
search_code fragment): *"**GTFS-Realtime: not publicly available.** No vehicle positions or trip
updates feed."*

**This is an owner blocker of the wrong kind.** Signing a data-use form and mailing it to a
government department is not an identity/KYC/payout step; it is a contract signature plus
correspondence, i.e. exactly the manual, person-to-person work MISSION.md forbids. It also leaves
the commercial-reuse question unanswered.

### 1.3 Free competition is already dense

- **Hasadna Open Bus / Stride** — RENDERED
  (https://raw.githubusercontent.com/hasadna/open-bus-stride-api/main/README.md): a free public
  REST API over both SIRI history and GTFS, live at
  `https://open-bus-stride-api.hasadna.org.il/docs`, run by an Israeli civic-tech nonprofit.
  A paid "Israeli transit API" would be competing with a free, funded, incumbent one.
- Mirrors: Transitland, MobilityData Mobility Database (`mdb-2519`, plus a Google-Storage mirror
  of the zip), `busmaps.com/en/israel/feedlist` (SNIPPET), `jqueguiner/gtfs`, `osm-ToniE/gtfs-feeds`.
- Consumer side is owned by Moovit (Israeli, Intel-owned) and Google Maps.
- Free open-source Claude/agent skills already wrap it: `skills-il/government-services` →
  `israeli-public-transit/SKILL.md` and `iliagerman/agents` → same skill, both MIT, both naming
  `gtfs.mot.gov.il`, curlbus and SIRI. **Even the agent-skill niche is taken, and taken for free.**

### 1.4 Buyer

Not found. GitHub shows *builders* (`The-new-ben/nad-lan-co-il` uses the GTFS feed for office-tower
dossiers; `TomerBenda/ilsochrone` for isochrones; `geosimlab/accessibility` for academic
accessibility work; several hobby apps). Builders using a free feed are not evidence that anyone
pays. No paid Israeli transit API listing was found on RapidAPI (SNIPPET search returned only
generic transportation collections).

---

## 2. Weather

### 2.1 The global price floor is at or near zero — RENDERED

`open-meteo/open-meteo` README (RENDERED): *"API data is offered under the Attribution 4.0
International license (CC BY 4.0)"*, *"free for open-source developers and non-commercial use"*,
*"If your application exceeds 10'000 requests per day, please contact us"*, code AGPLv3.
SNIPPET (open-meteo.com/en/pricing): free 300k calls/month non-commercial; **Standard $29/month**
for 1M calls; Professional $99/month for 5M.
SNIPPET (openweathermap.org/price): free tier **1,000,000 calls/month**, paid from **$40/month**.

A CC BY source means redistribution is legally GREEN. It also means the thing we would sell is
already given away by a funded incumbent with a brand. Reselling generic weather is a zero-ceiling
line for a no-brand seller.

### 2.2 Israeli-specific weather (IMS) — gated behind a signed paper form

RENDERED, `GuyKh/py-ims-envista` README: *"You can read about the API and about how to get a token
here (https://ims.gov.il/en/ObservationDataAPI) — **signing terms of use**, etc."*
RENDERED, `valleyco/ims` → `docs/api/swagger.yaml`: `name: IMS API License`,
`url: https://ims.gov.il/en/terms`, server `https://api.ims.gov.il/v1/envista`.
RENDERED, `sagitiminsky/CDEM` → `.swm/ims-scrapper.8L_U1.sw.md`: *"go to
https://ims.gov.il/he/ObservationDataAPI … fill in the following form
https://ims.gov.il/sites/default/files/docs/terms_0.pdf and **send it back to ims@ims.gov.il** …
After receiving the approval from the ims you will be provided with an API Token."*

So: a signed PDF, an email exchange with a government office, and a discretionary approval — before
a single row of data. Same category of blocker as SIRI, and the commercial-reuse clause inside
`terms_0.pdf` is unread (host blocked). **AMBER, plus an owner blocker outside the permitted
exceptions.**

There is also a keyless RSS forecast route (RENDERED, `liorexmotors/poanta-demo` →
`scripts/update_feed.py`: `WEATHER_CITY_RSS =
"https://ims.gov.il/sites/default/files/ims_data/rss/forecast_city/rssForecastCity_510_he.xml"`),
but reselling a government RSS feed whose terms we have not read is exactly the AMBER we may not build.

---

## 3. Aviation

### 3.1 OpenSky Network — explicitly non-commercial. This is a clean NO.

RENDERED, `openskynetwork/opensky-api` → `docs/free/index.rst`: *"The API lets you retrieve live
airspace information for **research and non-commerical purposes**."* … *"If you want to retrieve
live flight information for **commercial purposes, please contact us**."* README (RENDERED) adds
*"By using the OpenSky API, you agree with our terms of use"* and *"We may block AWS and other
hyperscalers due to generalized abuse from these IPs."*
SNIPPET (opensky-network.org/about/terms-of-use, unreachable here): any use by a for-profit entity
requires written permission and a licence; *use in any operational capacity — including integration
into a live product or automated system, even internal — requires a previous written agreement*;
commercial use explicitly includes ads on a page using the API.

Building a paid product on OpenSky would be a ToS violation → **RED**. Not buildable, and the
hyperscaler-IP blocking would break it operationally anyway.

### 3.2 Paid flight data is an incumbent market with licensed sources

SNIPPET (2026-09-04): aviationstack premium **from $49/month**; FlightAPI **from $49/month**, no
free tier, 50 free requests; AviationEdge **$49/month for 25,000 calls up to $499/month for 1M**;
aviationstack "trusted by over 5,000 companies". Comparison pieces name **FlightAware, Cirium and
OAG** for enterprise/schedule intelligence.

We have no licensed source. Every legal source of flight data is either non-commercial (OpenSky) or
a paid feed we would have to buy and resell at a loss. **Dead end.**

---

## 4. Maritime (AIS)

- **AISHub** — SNIPPET (aishub.net/join-us): free data sharing, but *"To access real-time data from
  all available sources, users are required to **share their own AIS feed**"* — i.e. operate a
  physical AIS receiver. A software-only colony cannot contribute a feed. **Structurally closed.**
- **aisstream.io** — RENDERED, https://github.com/aisstream/issues/issues/181 (opened **27 April
  2026**): a user asks *"is commercial use of the WebSocket feed permitted, with appropriate
  attribution?"* and asks for a contact email. **No maintainer response; the issue is still open.**
  Free WebSocket AIS with an unanswered commercial-licensing question is **AMBER** by definition.
- MarineTraffic / VesselFinder are commercial vendors whose terms forbid redistribution (not
  verified this session — no budget left; flagged as unverified, not asserted).

---

## 5. Payability to Israel

Not re-researched; taken from sibling scouts in this same sweep, both dated 2026-09-03:
- `agent-markets--apify.md`: Apify payouts **PayPal/Wise, min $20**, KYC required
  (government ID, proof of address, tax documentation), **no Israel exclusion found** — RENDERED
  from `apify/apify-docs` monthly-payouts.mdx.
- `agent-markets--rapidapi.md`: RapidAPI provider payouts **PayPal only, USD, 25% marketplace fee**
  — GitHub-sourced, snippet-grade on the fee.

So the *rail* is fine. Payability is not what kills this criterion; sources and buyers are.

---

## Bottom line

This criterion is close to empty for us. Every branch fails at least one gate:

| Branch | Fails on |
|---|---|
| Israeli static GTFS product | licence unresolved (AMBER) + free incumbent (Hasadna) + no buyer |
| Israeli real-time SIRI | signed form + government correspondence (owner blocker), terms unread |
| Israeli weather (IMS) | signed form emailed for approval (owner blocker), terms unread |
| Generic weather resale | price floor $0–29/mo set by CC-BY incumbents; ceiling ~0 |
| Aviation (OpenSky) | non-commercial only → RED |
| Aviation (paid feeds) | no licensed source; $49/mo incumbents with brands |
| Maritime (AISHub) | requires operating physical AIS hardware |
| Maritime (aisstream) | commercial terms unanswered since Apr 2026 → AMBER |

The only branch I would not call dead outright is a *derived computation* over the free static GTFS
(transit-accessibility scoring per Israeli address) — but I found builders, not payers, and the
licence question sits on it too. Low confidence, and it needs the gov.il licence page rendered
before anyone spends an hour on it.
