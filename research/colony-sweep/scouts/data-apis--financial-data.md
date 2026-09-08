# Scout notes — data-apis / financial-data

**Criterion:** Financial and market data APIs: the cheap end of the market, licensing constraints on
redistribution, and where a small clean API still wins buyers.
**Scout:** WORKER-SCOUT "financial-data", group `data-apis`. Date: 2026-09-04.
**Search budget used:** 8 of 8 (the cap). GitHub/raw fetches used freely (zero search budget).

## Evidence grades used below
- **RENDERED** — page actually fetched and read in this session.
- **SNIPPET** — a WebSearch result summary quoting the page; weaker, and marked as such.
- **BLOCKED** — the primary source exists but the egress proxy refused it; the URL a human must open is named.

---

## 1. The licensing wall — why the profitable middle of this market is closed

**Exchange-proprietary real-time data cannot be redistributed without a per-month vendor licence.**
- SNIPPET, 2026-09-04, from `https://www.nasdaqtrader.com/content/AdministrationSupport/Policy/USEquitiesandOptionsDataPolicies.pdf`
  and SEC rule filings: a Nasdaq **Non-Display Enterprise License Fee of $10,530/month (effective 1/1/25),
  $10,942/month (1/1/26), $11,177/month (1/1/27)**.
- SNIPPET, same date, `https://www.nyse.com/publicdocs/nyse/data/NYSE_Market_Data_Complete_Policy_Package.pdf`:
  "if a vendor of real-time proprietary NYSE Market Information would like to redistribute this data
  externally, the vendor must contract with NYSE directly for such use and pay the relevant fee".
- Reading: the target is ₪20,000/month ≈ $5,400. **One exchange's redistribution licence costs about twice
  the entire revenue target, before any customer exists.** Real-time US equity data is structurally closed
  to this operation. Not a build.
- To close properly a human should render the two PDFs above (nyse.com and nasdaqtrader.com were not fetched here).

**Reselling a cheap vendor's API is prohibited by that vendor's own terms.**
- SNIPPET, 2026-09-04, `https://site.financialmodelingprep.com/terms-of-service`: FMP prohibits customers from
  "reselling, sublicensing, distributing or otherwise providing access to the services or data ... to any third
  party"; displaying or redistributing FMP data requires a separate Data Display and Licensing Agreement.
- SNIPPET, same date, `https://twelvedata.com/terms`: prohibits redistributing, reselling, sublicensing or
  transferring data or access rights to third parties except as expressly permitted by tier or separate agreement.
- Alpha Vantage: the search returned `https://www.alphavantage.co/terms_of_service/` and
  `https://www.alphavantage.co/realtime_data_policy/` but **no redistribution clause was actually retrieved** —
  UNKNOWN, and a human must open those two URLs before anyone builds on Alpha Vantage.
- Reading: the "wrap a cheap API and resell it on a marketplace" play — the most obvious cheap-end business —
  is a **ToS violation, RED under the constitution**. It is also how most cheap "stock APIs" appear to be built.

**What is genuinely free to redistribute: US government data.**
- SNIPPET, 2026-09-04, `https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data`
  (sec.gov is EGRESS_BLOCKED — WebFetch refused): EDGAR data is US government work, **not subject to copyright,
  so it may be redistributed**; the SEC asks only that you not imply endorsement. Fair-access rules: max
  **10 requests/second**, declare a real User-Agent, no IP/UA rotation to evade throttling.
- This is the one clean GREEN source in the criterion. Its problem is not licensing, it is competition (below).

---

## 2. The cheap end is a commodity — the price floor is zero

SNIPPET, 2026-09-04, from `https://www.edgar.tools/vs/sec-api`, `https://sec-api.io/pricing`,
`https://edgrapi.com/blog/sec-edgar-api`:
- **sec-api.io**: Personal $49/mo billed annually ($55 monthly), Business $199/mo annually ($239 monthly);
  free tier is 100 calls *lifetime*.
- **edgar.tools**: $0–$79/mo, 100 API calls per *day* on a permanent free tier, plus a web app and an
  AI plugin for Claude and ChatGPT.
- **edgartools** (open source Python, ~6M PyPI downloads claimed in the snippet): free, no key, parses EDGAR directly.
- **sec.gov itself**: free, and it is the source of truth.

Reading: a no-brand new entrant selling "clean EDGAR data" enters a market where a competitor gives away
100 calls/day forever, an OSS library does the parsing for nothing, and the upstream is free. The realistic
ceiling for an unknown seller here is a few paying hobbyists, not thousands of shekels.

Directory source for the field (DIRECTORY only, not demand evidence): RENDERED
`https://raw.githubusercontent.com/shi-rudo/awesome-stock-trading/main/README.md` — its "Financial Data APIs"
section lists Alpha Vantage, EOD Historical Data, Financial Modeling Prep, MarketStack, Massive (the list states
this is the 2025 rebrand of Polygon.io — unverified), Morningstar, Nasdaq Data Link, Refinitiv Eikon, Adanos
sentiment. Roughly ten vendors already occupy the cheap-to-mid band.

---

## 3. Where a small clean API could still win: data that is free but hard to use correctly

### 3a. Bank of Israel representative rates (שער יציג)
- RENDERED, 2026-09-04:
  `https://raw.githubusercontent.com/skills-il/tax-and-finance/620b766d309b0d23b09a3e7c90a7306d12b3d1d9/shekel-currency-converter/references/boi-api-guide.md`
  - Current rates: `https://www.boi.org.il/PublicApi/GetExchangeRates` — GET, **no authentication**, JSON.
  - Historical: SDMX at `https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_<CUR>_ILS`
    with `startPeriod`/`endPeriod`/`format=csv`.
  - Publication schedule: Mon–Thu shortly after 15:15 Israel time; Fri and holiday eves after 12:15; nothing on
    Sat/Sun/holidays. 14 currencies. The legacy `currency.xml` feed is gone. The JSON endpoint **ignores `?date=`**
    and always returns the latest rate — a real trap for anyone doing tax-date conversion.
  - Import VAT on goods needs a separate customs rate; services use the representative rate.
  - **The guide contains no licensing or terms statement** — licence status of BOI data is UNKNOWN.
- Corroboration that this is widely used and that the endpoints are real: GitHub `search_code` (zero search budget)
  found the same endpoints in ~10 independent repos, e.g. `TaxMyself-dev/TaxMyself` (`backend/src/shared/fx-rate.service.ts`),
  `saar120/money-monitor`, `itayost/mta-website`, `yeti-switch/yeti-web` (a test stubbing
  `https://boi.org.il/PublicApi/GetExchangeRates`), and an MCP server `skills-il/mcps/boi-exchange-mcp`
  ("Auth: None (public API)").
- Also RENDERED via search_code: `yonilev2003/countmedemo/src/lib/expenses/boi-exchange-rate.ts` carries the note
  "this sandbox's egress policy blocks boi.org.il itself" — i.e. **another agent hit the same block; the field names
  are unverified from here too.**
- Honest reading: the *value* is not the data, it is the tax-correct semantics (right date, right unit of 1/10/100,
  customs vs representative). But the upstream is free and unauthenticated, an MCP server for it already exists,
  and there is no evidence anyone pays for it. This is a **feature for `products/il-biz-tools`**, not a standalone API.

### 3b. Israeli securities data (TASE / Maya) — licensed, and the free routes are scraping
- SNIPPET, 2026-09-04, `https://info.tase.co.il/Eng/about_tase/disclaimer/Pages/terms_of_service.aspx` and
  `https://www.tase.co.il/en/content/about/data_vendors`: "The TASE owns the intellectual property and other rights
  in the securities prices that are computed and published by it" and grants licences to other entities subject to
  prescribed terms. TASE runs a paid **Data Hub / Data Services** product
  (`https://www.tase.co.il/en/content/products_lobby/datahub`, `.../data_services`) with an API key issued through a
  developers' portal (`https://openapigw.tase.co.il/tase/prod/oauth/oauth2/token` appears in several repos).
- The tase.co.il domains were **not rendered** — they are Israeli hosts and the proxy blocks them. A human must open
  the two URLs above to get the exact clauses and the price list.
- Meanwhile GitHub `search_code` shows a large public ecosystem quietly using **undocumented, key-less JSON endpoints**:
  `https://api.tase.co.il/api/company/securitydata`, `https://maya.tase.co.il/api/v1/...`,
  `https://mayaapi.tase.co.il/api/report/filter`, `https://market.tase.co.il/`, `https://datawise.tase.co.il`
  (repos: `RBenhGit/Portfolio-Dashboard`, `guyru/tasekit`, `AlonMarkovich4/tase-pipeline`, `yoavweizman94-cmyk/DAILY-BRIEF`,
  `OpenBudget/budgetkey-data-pipelines`, `cozion1/METRI`, `Vestika/portfolio`, `mrlifelesss/taseproject`).
  One of them (`DAILY-BRIEF`) documents a **WAF that 403s on certain pagination fields** — TASE actively defends these.
- Reading: building a commercial redistributed Israeli-market-data API on those endpoints is **RED**: it redistributes
  data TASE claims IP in, through endpoints TASE does not publish, past a WAF. The licensed route (TASE Data Hub) is
  priced for institutions and unknown to us. **Do not build.** Israeli-market data is the one genuine differentiator
  we have, and it is the one that is licensed.

---

## 4. Distribution and payability

- **RapidAPI Hub** is the only near-turnkey marketplace for a micro-API. SNIPPET, 2026-09-04,
  `https://docs.rapidapi.com/docs/payouts-and-finance`: RapidAPI **pays providers via PayPal only** and "cannot
  accommodate other payout methods". **No list of supported provider countries was retrieved — Israel payability is
  UNKNOWN.** A human must open `https://docs.rapidapi.com/docs/payouts-and-finance` and the Zendesk article
  "How are payouts calculated?" to close this.
  - The same search returned a 2025 commentary (`https://wisgate.ai/blogs/top-5-api-marketplaces-2025-beyond-rapidapi`)
    claiming horizontal marketplaces take **20–30% of every API call**. SNIPPET, vendor blog, treat as weak.
  - RapidAPI is **not** shut down as of this search; statusgator shows it operational. The "Nokia acquired RapidAPI"
    idea returned nothing and should be treated as unverified memory, not fact.
- **Rails we already own and that demonstrably pay an Israeli**: Paddle (merchant of record) in
  `products/il-biz-tools`, Telegram Stars in `products/telegram-il-tools-bot`, Apify pay-per-event in
  `products/apify-il-open-data`, and x402 in `products/x402-il-api`. Any data API we build should sell through those
  rather than depend on an unverified marketplace payout.

---

## 5. Dead ends, stated plainly

1. **Real-time exchange data.** Redistribution licence ≈ $10.5–11k/month from a single exchange versus a ₪20k/month
   target. Closed by arithmetic, not by policy.
2. **Wrapping/reselling a cheap vendor API.** FMP and Twelve Data prohibit it in terms. RED.
3. **"Another clean stock API".** ~10 incumbents, a permanent free tier at 100 calls/day, and a free OSS parser.
   No wedge for a no-brand entrant.
4. **TASE/Maya scraped into a product.** TASE asserts IP in its published prices and defends the endpoints with a WAF.
   RED, however tempting the Israeli angle is.
5. **Alt/sentiment data (Adanos and similar).** Not investigated — no search budget left. Genuinely unknown, not empty.
6. **Whether AI agents pay per call for financial data over x402.** Not investigated. The colony already has the rail;
   nobody has evidence of the buyer. Unknown.

## 6. What a follow-up with network access must open first
1. `https://docs.rapidapi.com/docs/payouts-and-finance` — provider payout countries, Israel yes/no.
2. `https://www.alphavantage.co/terms_of_service/` and `/realtime_data_policy/` — is any redistribution permitted at all.
3. `https://info.tase.co.il/Eng/about_tase/disclaimer/Pages/terms_of_service.aspx` and
   `https://www.tase.co.il/en/content/products_lobby/datahub` — exact TASE clauses and Data Hub price list.
4. `https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data` — confirm the public-domain
   redistribution language verbatim.
