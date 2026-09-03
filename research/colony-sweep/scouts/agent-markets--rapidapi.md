# Scout notes — agent-markets / "rapidapi"

**Criterion:** RapidAPI and alternative API marketplaces (APILayer, Zyla): seller payouts to
Israel, categories with genuine paying buyers, pricing norms, and how much traffic a new listing gets.

**Scout:** WORKER-SCOUT `rapidapi`. **Date of research:** 2026-09-03.
**Search budget spent:** 8 WebSearch calls (the cap). Plus 4 free GitHub/raw.githubusercontent
fetches (2 succeeded and carried the best evidence) and 4 WebFetch attempts that were blocked.

## Evidence-quality warning (read first)

Every first-party marketplace domain in this criterion is **blocked by the egress proxy**.
Confirmed EGRESS_BLOCKED, tried and failed:

- `docs.rapidapi.com` (payouts-and-finance, monetizing-your-api) — the single most important page
- `rapidapi.zendesk.com` (payout methods, payout schedule articles)
- `zylalabs.com` (monetize-your-api, terms)
- `marketplace.apilayer.com` (provider FAQ)

So **no marketplace's own payout page was rendered**. What saved this scout is GitHub: two
independent public repos had crawled/quoted `docs.rapidapi.com` and checked the result in.
Those are marked "strong (rendered, second-hand quote of a first-party page)". Everything else
is a search snippet and is marked as such. Nothing below is from memory.

---

## Evidence ledger

### Strong — rendered GitHub pages quoting first-party docs

**E1.** `https://raw.githubusercontent.com/adunato/SideGig/main/research/channels/rapidapi/overview.md`
— rendered 2026-09-03. An independent researcher's channel assessment of RapidAPI, citing
`docs.rapidapi.com/docs/payouts-and-finance` and the Nokia press release.
- **"Marketplace Fee: 25% of all transactions."**
- Payouts flow through **PayPal**; "specific thresholds and schedules are not detailed in public
  documentation"; recent provider reports mention **payout delays and refund-handling concerns**.
- Traffic: "substantial search clutter, spam and low-quality listings, which increases effective
  supply and **reduces discoverability**" for new listings.
- One 2026 anecdote: an API launched in **May 2026 had recurring customers by July 2026**
  (renewals in months 2 and 3). Explicitly labelled anecdotal, not typical.
- Historical (pre-Nokia): one API ~**$1,500/month**; a cohort of **ten providers >$50,000/month
  combined** (~$5k each). All pre-November-2024; treated as proof of concept, not a benchmark.
- Marketplace is **live, not shut down**; multiple 2025–2026 provider accounts describe reduced
  platform activity, higher fees and operational friction. Confidence stated as medium.
- Categories: the doc **does not name** which verticals have paying buyers. It says "narrow
  specialist APIs can still differentiate" against commoditisation.

**E2.** `https://raw.githubusercontent.com/chocholous/apify-check/main/pricing-analysis-v5-flat-20260416/extracted.old/rapidapi.com.json`
— rendered 2026-09-03. A crawl of rapidapi.com's own terms/pricing, dated ~2026-04-16.
- Publisher-defined tier **templates: BASIC / PRO / ULTRA / MEGA / CUSTOM**.
- Quota MONTHLY or DAILY; **soft limits bill overage**, hard limits block.
- Free APIs default **1,000 requests/month**; **credit card required**, prepaid cards blocked;
  **$0.50 authorization hold** on freemium, released after 7 days.
- ToS wording: Rapid "deducts any applicable taxes, marketplace, or processing fees" before
  remitting to the Provider; **the exact fee % is not in the ToS** (it is in the docs — see E1/E3).
- Consumer payment methods: credit/debit card only.
- The crawler could not reach `rapidapi.com/pricing` — **reCAPTCHA-blocked**.

**E3.** GitHub code search hits, rendered as fragments 2026-09-03 (`mcp__github__search_code`):
- `gusmartinuk/propertyAPI` → `RapidAPI_REQUIREMENTS.md`: **"Marketplace fee is 25%. Payouts are
  via PayPal only."** Also documents the gateway pattern: RapidAPI proxies calls and the origin
  must validate the `X-RapidAPI-Proxy-Secret` header (403 otherwise).
- `TheoryofShadows/Mcp` → `MARKET.md`: "RapidAPI flat 25% marketplace fee (providers keep 75%);
  metered billing supported. docs.rapidapi.com/docs/payouts-and-finance — **H**[igh confidence]".
- `Deesmo/Arch-AI-Tools` → `for-providers.html` / `migrate-from-rapidapi.html`: a **competitor's
  marketing page** claiming "~80% (RapidAPI takes ~20%)" and payout currency "USD
  (PayPal/wire transfer)". **This conflicts with the 25% figure and is a commercially motivated
  source — treat 25% as the better-sourced number** (two repos, both citing the docs page).

### Weaker — search snippets only (2026-09-03)

**E4.** RapidAPI economics snippet (search: RapidAPI pricing/monetization 2026), snippet quoting
`docs.rapidapi.com/docs/monetizing-your-api-on-rapidapicom` and `1xapi.com`:
- **"RapidAPI keeps 25% of your revenue, plus payment processing fees of 2.9% + $0.30 per
  transaction."** (This corroborates 25% from a third direction.)
- Buyer-side norms quoted: **Pro $20/month, Ultra $50/month** as typical template prices.
- **Per-request floor:** for plans allowing over 500,000 req/month the minimum is
  **$0.00003 per request above 500K**; a 2M req/month plan must be priced at **>= $45/month**.
- RapidAPI recommends **freemium: a free tier plus 2–3 paid tiers** (use all four templates).
- Hub scale quoted variously as **40,000+ APIs / 4M+ developers** (Nokia press release figures)
  and "over 98,000 APIs" (a vendor blog — inconsistent, do not rely on either).

**E5.** Nokia acquisition (search 2026-09-03; `nokia.com` newsroom + `techcrunch.com` 2024-11-13):
Nokia acquired Rapid's technology assets and R&D unit, **signed and closed November 2024**.
"Rapid's API hub is used by 4 million developers across more than 40,000 APIs." The public
marketplace continues to operate, folded into Nokia's Network-as-Code platform.
**Snippet only — nokia.com and techcrunch.com were not fetched.**

**E6.** Zyla API Hub provider terms (search snippet quoting `zylalabs.com/monetize-your-api`
and `zylalabs.com/terms`, 2026-09-03):
- Revenue share **80% provider / 20% ZylaLabs**, "may vary depending on the service level".
- **Uptime gate: below 95% uptime the provider receives 0%** of that month's revenue.
- Payout formula: `[(Amount Received − Input Processing Fee − Refunds) × Revenue Share %] ×
  (100% − Output Processing Fee)`; input fee ~3% (Stripe), **output processing fee 2%**.
- **Payouts are via PayPal only**, to the account set in Account Settings.
- **60-day hold**: at least 60 days must have passed since the consumer's payment; no open
  disputes; not refunded; >=95% uptime that month. Then the provider *requests* a payout,
  processed within 5 business days.
- Payout orders are only processed **between the 20th and 30th of each month**.
- Publishing unlimited APIs is free; no upfront cost.

**E7.** APILayer marketplace provider programme (search snippet quoting
`marketplace.apilayer.com/docs/article/provider-faq` and `apilayer.com/docs/article/provider-faq`,
2026-09-03):
- **Provider keeps 85%; APILayer takes 15%** ("versus the industry standard 20%").
- **Individuals may apply** and be accepted, not only companies.
- **Monthly payouts.** *Company* providers must issue an **invoice**; *individual* providers
  "receive payments directly to their bank account".
- **Application + approval gate**: APILayer reviews the API against its quality standards before
  listing. No SLA on review time found.
- **No country list, no minimum threshold, no currency found.**

**E8.** Israeli PayPal payability — taken from a sibling scout in this same repo,
`/home/user/automaton/research/colony-sweep/scouts/payment-rails--paypal-israel.md` (2026-09-03,
itself snippet-level): Israeli PayPal accounts can withdraw to an Israeli bank account **in ILS
only**; NIS 8 fee under NIS 1,000, free at/above NIS 1,000; 3–5 business days; account name must
be in Latin letters. Also: from **6 July 2026** services moved to *PayPal Israel Payment Services
Ltd.* and **18% VAT is charged on PayPal fees** for Israeli users. Cross-border/FX drag on
inbound USD is estimated there at ~5%–9% on small tickets.

---

## Findings

### F1 — Rapid API Hub (RapidAPI) provider listing: payable to Israel, but a 25% + PayPal-FX haircut and a discoverability problem

- Fee stack for an Israeli seller: **25% marketplace** (E1/E3/E4) + **2.9% + $0.30** processing
  (E4) + PayPal Israel inbound cross-border/FX drag (E8). On a $20/month Pro subscription the
  net to an Israeli PayPal account is plausibly **~$12–13**, i.e. ~45 ILS.
- **Payout method: PayPal only, USD** (E1, E3). No rendered country restriction list exists —
  `docs.rapidapi.com` and `rapidapi.zendesk.com` are both blocked. Israeli PayPal accounts do
  receive USD and withdraw to Israeli banks (E8), so **Israel payability = YES**, but this is
  inference from two snippet-level sources stacked on each other, not a rendered RapidAPI page.
- **Traffic for a new listing is the weak point.** The only rendered assessment (E1) says
  discoverability is reduced by spam and clutter, and the only 2026 data point is one anecdote
  (May launch → recurring customers by July). Historical per-provider figures (~$1,500/mo,
  ~$5k/mo average across a ten-provider cohort) **all predate the November 2024 Nokia
  acquisition** and should not be used as a forecast.
- **Owner blockers:** a verified PayPal account in the owner's own legal name with an Israeli
  bank account linked (identity/KYC, one-time); the RapidAPI account's payout settings must be
  bound to it. Whether RapidAPI demands a US tax form (W-8BEN) from non-US providers is
  **UNKNOWN** — the page that would say so is blocked.
- **ToS: GREEN.** Listing your own API and letting Rapid bill for it is the platform's intended
  use. The origin must honour `X-RapidAPI-Proxy-Secret` (E3) — that is a build requirement,
  not a risk.
- **Honest ceiling for a no-brand new entrant: ~0–800 ILS/month in the first 6 months.** No
  evidence supports more, and E1's own confidence is medium.

### F2 — Zyla API Hub: better headline split (80/20), materially worse cash-flow terms

- 80/20 split, but with a **2% output processing fee** and a **60-day hold before a payout can
  even be requested**, and payouts only processed on the 20th–30th (E6). First cash lands
  roughly **3 months** after the first sale.
- **95% uptime or you get 0% of that month.** For a software-only operation this is the real
  risk: an unattended outage on a hobby host zeroes a month's revenue, not just prorates it.
- **PayPal only** → **Israel payability = YES** on the same reasoning (and same weakness) as F1.
- ToS: **GREEN**.
- Zyla is a smaller hub than Rapid; I found **no evidence at all** of provider earnings, buyer
  volume, or new-listing traffic. Ceiling is a guess and is marked low confidence.

### F3 — APILayer marketplace: the best revenue share found (85/15), but gated by human approval and Israel payout is UNKNOWN

- **85% to the provider, 15% to APILayer** (E7) — better than both Rapid (75%) and Zyla (80%).
- **Individuals are eligible** (E7), which matters: the owner can list without a company.
- **Payout to individuals is "directly to their bank account"** — no PayPal haircut. But there
  is **no rendered country list, no currency, no threshold**, and an Israeli bank account
  receiving a USD/EUR wire from a US/Turkish entity is unverified. **Israel payability = UNKNOWN.**
- **Approval gate:** APILayer reviews and approves each API. That is a third party's decision on
  an unknown timeline — a software-only operation can submit, but cannot guarantee listing.
- ToS: **GREEN** (a normal provider programme), but the unknown payout path means this cannot
  be recommended as a first build until the FAQ page is actually read.

### F4 — Pricing norms are known well enough to design a listing without further research

From E2 and E4, a RapidAPI listing should be shaped as: **free tier (~1,000 req/mo) + Pro ~$20/mo
+ Ultra ~$50/mo + Mega**, with soft limits and overage above the quota; above 500K req/mo the
platform enforces a **$0.00003/request floor** (2M req/mo ⇒ >= $45/mo). This is enough to write
the Monetize tab without seeing it. Note the consumer-side friction the same crawl documents:
a **$0.50 authorization hold even on the free plan** and **overage billing on soft limits** —
both are the platform's, not ours, but they suppress free-tier signups and they generate the
refund disputes that E1 says providers complain about.

### F5 — The cheap move is multi-homing an API we already run, not building a new one

The colony already ships `products/x402-il-api` and `products/apify-il-open-data`. The same
origin can be fronted by a RapidAPI listing (validate `X-RapidAPI-Proxy-Secret`, E3) and a Zyla
listing simultaneously; neither charges to list. Marginal build is a proxy-secret check, per-hub
plan definitions and an uptime monitor to defend Zyla's 95% gate — well under 40 hours, and
under 10 if the origin is already deployed and stable. The buyer is not "everyone": it is the
developer already paying for Israeli company/gov/geo data on a hub, who finds our endpoint
because it is the only one covering that dataset. Commodity APIs (weather, currency, IP lookup)
are exactly the saturated categories E1 warns about — do not enter those.

---

## Dead ends and unclosed questions

1. **No first-party payout page could be rendered for any of the three marketplaces.** The 25%,
   the PayPal-only rule, the 80/20 and the 85/15 all rest on second-hand quotes or snippets.
2. **No marketplace publishes a provider country list that I could reach.** "Payable to Israel"
   is therefore an inference from "payout is PayPal" + "Israeli PayPal works". A rendered
   restricted-country list could still overturn F1 and F2.
3. **Which categories have genuine paying buyers is unanswered.** The one rendered assessment
   explicitly declines to name verticals. I found no per-category revenue or subscriber data
   anywhere, and I will not invent it.
4. **New-listing traffic is unquantified.** One 2026 anecdote is the entire evidence base.
   Nobody publishes impressions/subscriptions for a cold listing.
5. **Conflicting fee figures** (25% from two repos citing the docs vs "~20%" from a competitor's
   marketing page). Unresolved without the docs page.
6. **APILayer vs "APILayer marketplace"** — apilayer.com also sells its own first-party APIs
   (Idera-owned). Whether the third-party provider programme is still actively onboarding in 2026
   is unverified; the FAQ snippet is undated.
7. **One search was wasted**: the api.market query drifted entirely to Stripe Connect
   documentation and returned nothing about api.market's provider terms. api.market remains
   uninvestigated.
8. **Tax paperwork for a non-US provider (W-8BEN or equivalent) is unknown for all three.**

### URLs a human or unblocked agent must open to close this

- https://docs.rapidapi.com/docs/payouts-and-finance  ← highest value: fee %, threshold, schedule, countries
- https://docs.rapidapi.com/docs/monetizing-your-api-on-rapidapicom
- https://docs.rapidapi.com/docs/hub-listing-monetize-tab
- https://rapidapi.zendesk.com/hc/en-us/articles/11432098898580-What-payment-methods-are-available-for-payouts
- https://rapidapi.zendesk.com/hc/en-us/articles/17777288883988-API-Provider-Payout-Schedule
- https://zylalabs.com/monetize-your-api  and  https://zylalabs.com/terms
- https://marketplace.apilayer.com/docs/article/provider-faq
- https://www.trustpilot.com/review/rapidapi.com  (2025–2026 provider complaints about payouts)
- https://blog.apify.com/rapidapi-vs-apify/  (January 2026 comparison)
- https://docs.api.market/about-us  (the uninvestigated alternative)

### URLs actually rendered by this scout

- https://raw.githubusercontent.com/adunato/SideGig/main/research/channels/rapidapi/overview.md
- https://raw.githubusercontent.com/chocholous/apify-check/main/pricing-analysis-v5-flat-20260416/extracted.old/rapidapi.com.json
- GitHub code-search fragments from `gusmartinuk/propertyAPI` (RapidAPI_REQUIREMENTS.md),
  `TheoryofShadows/Mcp` (MARKET.md), `Deesmo/Arch-AI-Tools` (for-providers.html,
  migrate-from-rapidapi.html)
- /home/user/automaton/research/colony-sweep/scouts/payment-rails--paypal-israel.md (sibling scout)
