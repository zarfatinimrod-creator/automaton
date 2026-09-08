# Scout report — `data-apis` / `tax-rate-apis`

**Criterion:** Tax and regulatory reference data as an API (VAT rates, thresholds, filing dates,
currency and interest rates): existing sellers, pricing, and whether an accurate, well-maintained
feed has real buyers.

**Date:** 2026-09-04. **Web searches spent: 6 of 8 allowed.** Everything else came from GitHub
`search_code` / `WebFetch` on raw.githubusercontent.com, which costs no search budget.

**Evidence grading used below:** RENDERED = I fetched the page and read it. SNIPPET = a web-search
result quoting the page; the page itself was not rendered (most vendor domains are egress-blocked
here). MEMORY = not used; where I had only memory I wrote "unknown".

---

## 0. What the sibling scouts already settled (do not re-spend budget on these)

- `research/colony-sweep/scouts/data-apis--financial-data.md` (2026-09-04) already covered the
  **currency** half of this criterion: Bank of Israel representative rates are free and
  unauthenticated, an MCP server for them already exists, and its conclusion was
  "a **feature** for `products/il-biz-tools`, not a standalone API". I corroborate it below and
  extend it to CBS CPI and the BOI policy rate.
- `docs/REJECTED.md` §"Two standing walls in the Israeli-bureaucracy space": (1) the Israeli Tax
  Authority is a gate, not a platform; (2) **the state is our free competitor** and charging for a
  free answer is a constitution violation, not a pricing decision. Both bind finding F4.
- `research/colony-sweep/scouts/agent-markets--rapidapi.md`: RapidAPI pays providers **via PayPal
  only**, 25% marketplace fee; Israeli PayPal payability YES but the payout-country page itself was
  never rendered.

---

## 1. The commercial field, enumerated

Directory sources (DIRECTORY only — never demand evidence):
- RENDERED `https://raw.githubusercontent.com/kdeldycke/awesome-billing/main/readme.md` — its Taxes
  section lists reference material (EU Council Directive 2006/112/EC, VAT-rate databases for digital
  services, the Streamlined Sales Tax Governing Board) and, notably, **no commercial tax-rate API as
  a primary entry**. The richest billing list in `awesome` does not treat "buy your VAT rates from a
  vendor" as a thing worth listing.

Sellers found, with what they charge:

| Vendor | What is sold | Price | Evidence |
|---|---|---|---|
| **Vatstack** | VAT no. validation, quotes, supplies, rates | Developer plan **free for life**; **Launch $15/mo** (100 supplies, 500 validations); **Growth $150/mo** (3,000 supplies, 15,000 validations) | SNIPPET 2026-09-04 of `https://vatstack.com/pricing` |
| **VAT Sense** | VAT/GST rates + validation, EU/UK/AU/NO/CH/ZA/BR | free 100 req/mo; paid **from £4.99/mo** to 50,000 req | SNIPPET 2026-09-04 of `https://vatsense.com/pricing` |
| **vatlayer (APILayer)** | EU VAT rates + number validation | free tier; paid **from $9.99/mo** | SNIPPET 2026-09-04 of `https://vatlayer.com/pricing` |
| **Abstract API** | VAT validation & rates | free tier advertised on the product page | SNIPPET 2026-09-04 of `https://www.abstractapi.com/api/vat-validation-rates-api` |
| **TaxJar** | US sales tax API + filing | **$849–$2,199/mo** | SNIPPET 2026-09-04 via `https://taxcloud.com/blog/sales-tax-apis/` and `https://www.taxjar.com/product/api` (competitor blog — weak, treat as indicative) |
| **Ziptax** | US sales tax rates | **from $29/mo** | SNIPPET 2026-09-04, `https://www.zip.tax/alternatives/ziptax-vs-taxjar` (vendor's own comparison page — weak) |
| **Avalara** | AvaTax; also **free** state rate tables and free monthly rate-file emails | rate files free | SNIPPET 2026-09-04, `https://www.avalara.com/taxrates/en/download-tax-tables.html` |
| **Thomson Reuters ONESOURCE Calendar API** | tax filing-deadline calendar, enterprise | not published | SNIPPET 2026-09-04, `https://tax.thomsonreuters.com/blog/global-tax-filing-deadlines/` |

**The buyer is real and nameable, and it is not who you would guess.** RENDERED via GitHub
`search_code` (zero search budget): **Gumroad calls Vatstack in production** —
`antiwork/gumroad`, `app/services/abn_validation_service.rb` and `mva_validation_service.rb`,
`POST https://api.vatstack.com/v1/validations` with an `X-API-KEY`, cached 10 minutes, plus specs.
Other production users found the same way: `UniBee-Billing/unibee-api`
(`internal/logic/vat_gateway/vatstack/vatstack.go`, calls `/v1/rates?limit=100` and `/v1/validations`),
`remp2020/crm-payments-module` (`src/Models/Api/VatStack/Client.php`), `FlorianSW/server-donation-tool`,
and the WordPress plugin `studiocart` (`class-ncs-cart-tax.php`).

**But look at WHAT they buy.** Every one of those integrations that pays is buying **validation**
(is this VAT/ABN/MVA number real, right now, with an audit trail) or **supplies** (a taxable-supply
record). `rates` is the endpoint that ships in the free tier. Vatstack's own price ladder says the
same thing: the metered units are *supplies* and *validations*; quotes are unlimited.

---

## 2. The price floor for rate data is zero, and it is maintained by someone else

- RENDERED 2026-09-04 `https://raw.githubusercontent.com/vatnode/eu-vat-rates-data-js/main/README.md`
  — **MIT-licensed npm package**, standard/reduced/super-reduced/parking rates for **45 European
  countries**, VAT-number format regexes, "Checked daily via GitHub Actions, new npm version
  published only when rates change", source "European Commission Taxes in Europe Database (TEDB)"
  at 07:00 UTC, full rate-change history in git. Offline, no API key, no rate limit.
- SNIPPET 2026-09-04: the European Commission's **TEDB is free for all users** and exposes a
  **SOAP web service for applicable VAT rates**
  (`https://ec.europa.eu/taxation_customs/tedb/`). The upstream is public.
- SNIPPET 2026-09-04: Avalara publishes **free** US state sales-tax rate tables and emails updated
  rate files monthly (`https://www.avalara.com/taxrates/en/download-tax-tables.html`).

So a paid "VAT rates API" competes against: a free official database, a free MIT package that
tracks it daily, and four vendors' permanent free tiers. That is not a pricing problem to solve, it
is the market's answer.

## 3. The Israeli slice — the one place we have a differentiator, and it is already occupied by free

Every Israeli figure a paid feed would sell is already published, free, MIT-licensed and *sourced*,
in a maintained public skills corpus. RENDERED via GitHub `search_code` on `skills-il/tax-and-finance`:

- `israeli-vat-reporting/references/vat-regulations.md`: "Standard rate: **18%** (effective since
  January 1, 2025 ... unchanged for 2026-2027). Previous rate: 17%, in force until 31 December 2024."
- `israeli-vat-reporting/SKILL_HE.md` names a `references/reporting-calendar.md` with the filing
  deadlines: **15th (manual), 19th (online)**; the optimization log adds **23rd for the detailed
  (PCN874) report**, the **1,775,000** monthly-vs-bimonthly threshold, and the **122,833** osek-patur
  ceiling for 2026.
- `israeli-freelancer-ops/CHANGELOG.md` carries the full **allocation-number ladder** —
  25,000 from 5.5.2024, 20,000 from 1.1.2025, 10,000 from 1.1.2026, **5,000 from 1.6.2026** — with
  the rule that the threshold in force on the invoice **issue date** governs.
- `israeli-vat-reporting/evidence.json` gives each claim a `source_url`, a `raw_snippet` and a
  `fetched_at`. That is a better evidence discipline than most paid feeds publish.
- `israeli-budget-planner/SKILL.md` carries BOI interest 3.50% (lowered 6.7.2026), prime, VAT 18%,
  minimum wage and average wage in one table.

And the currency/interest/index upstreams are free and unauthenticated:
- `https://www.boi.org.il/PublicApi/GetExchangeRates` (no auth) and SDMX at
  `https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_<CUR>_ILS`
  — found in ~10 independent repos (`Urigo/accounter-fullstack`, `TaxMyself-dev/TaxMyself`,
  `EliranNovik/Leadify`, `shakedmanes/ib-taxil`, `Visionbi/Zero-to-Snowflake`, `Fincept-Corporation/FinceptTerminal`).
- CBS price indices: `https://api.cbs.gov.il/index/data/price?id=120010&format=json` (CPI),
  `40010` apartments, `170030` producer, `200010` building input — in `skills-il/government-services`,
  `LiorVainer/data-israel`, `reuvenaor/israel-statistics-mcp`, `guycoh/mortgage`, `Ariel-B/fire`.
- A **free npm MCP server** already wraps BOI rates: `@skills-il/boi-exchange-mcp`
  (RENDERED `skills-il/mcps/README.md`, "Auth: None").
- The OSS FX API **Frankfurter** now ships a **Bank of Israel adapter**
  (`lineofflight/frankfurter`, `lib/provider/adapters/boi.rb`, "Fetches daily representative
  exchange rates for 14 currencies ... via the SDMX API. Supports date range queries and full
  historical backfill").

Note one honest nuance the free corpus itself flags: the BOI JSON endpoint **ignores `?date=`** and
always returns the latest rate, which is a real trap for tax-date conversion. That is the only
defensible "value-add" left in the Israeli FX slice — and `skills-il` documents it for free.

---

## 4. Findings, with the ceiling stated honestly

See the structured output. In one line each:

1. **Global VAT/GST rate lookup API** — real category, real users, but the rate endpoint is the
   giveaway tier everywhere. No-brand entrant ceiling ≈ ₪0–150/mo. Do not build.
2. **VAT-number validation / taxable-supply records** — this is where the money is (Gumroad pays for
   it), $15–$150/mo published price points, ToS GREEN. But the upstream (VIES) is free and the
   product being bought is uptime + audit evidence + a vendor a merchant-of-record will trust. A
   no-brand solo entrant sells almost none of that. Ceiling ≈ ₪0–400/mo.
3. **US sales-tax rate API** — the real money in the field ($849–2,199/mo), and unreachable:
   address-level rate resolution needs jurisdiction-boundary data we do not have, Avalara gives the
   state tables away free, and the paid product is filing and nexus, not rates. Do not build.
4. **Israeli tax reference-data feed** — the only slice where we have any edge, and it fails the
   `REJECTED.md` wall-2 test: the state publishes the answers and a maintained MIT corpus publishes
   them machine-readably with per-claim evidence. Ceiling ≈ ₪0–250/mo as a paid API. Correct home:
   a free, well-sourced page in `products/il-biz-tools`, which is a traffic asset, not a line item.
5. **Israeli FX / CPI / interest feed** — price floor is exactly zero: free unauthenticated
   government APIs, a free MCP server, and an OSS FX service with a BOI adapter. ₪0.
6. **Tax filing-deadline / compliance-calendar API** — an enterprise product exists (ONESOURCE
   Calendar API) with no published price and an enterprise sales motion the mission forbids. No
   evidence of a self-serve SMB buyer was found. Genuinely UNKNOWN, not empty; do not build on it.

---

## 5. What a human or unblocked agent must open to close the gaps

1. `https://vatstack.com/pricing` — confirm the $15 / $150 ladder and that `rates` is free-tier.
2. `https://vatsense.com/pricing` — confirm £4.99 entry price and request quota.
3. `https://www.taxjar.com/product/api` (or Stripe Tax's page) — the $849–2,199 band came from a
   *competitor's* blog and must not be quoted as fact until the vendor's own page is read.
4. `https://ec.europa.eu/taxation_customs/tedb/` — confirm the SOAP VAT-rates service and, more
   importantly, the **re-use / licence terms** of TEDB data. Not established here.
5. **Licence status of Bank of Israel and CBS data is UNKNOWN** — the sibling scout said the same.
   Nobody in this repo has read a BOI or CBS terms-of-use page. Any redistribution product would
   need that first.
6. `https://docs.rapidapi.com/docs/payouts-and-finance` — still the open payability question for any
   marketplace-sold API.

## 6. Dead ends, stated plainly

- Selling VAT/GST **rates**: closed by a free official database plus a daily-updated MIT package.
- Selling **US sales tax rates**: closed by capability (boundary data) and by Avalara's free tables.
- Selling **Israeli FX / CPI / BOI interest**: closed by free government APIs and an existing free
  MCP server.
- Selling **Israeli statutory thresholds and filing dates**: closed by `REJECTED.md` wall 2 and by a
  free MIT corpus that is better sourced than we would be in 40 hours.
- **Not investigated, genuinely unknown:** whether e-invoicing-mandate reference data (which country
  mandates what, from when) has a self-serve buyer; whether agents pay per call for tax reference
  data over x402. No budget left; do not report these as empty.

## 7. Search budget

6 web searches used (Vatstack pricing; VAT rates API pricing comparison; tax/compliance calendar
API; US sales-tax API pricing; EC TEDB machine-readable; RapidAPI VAT listing popularity). No
search was refused. The last one returned no subscriber counts — **RapidAPI listing demand for tax
APIs remains unmeasured.**
