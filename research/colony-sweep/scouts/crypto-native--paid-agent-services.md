# Scout notes — crypto-native / paid-agent-services

Scout: WORKER-SCOUT "paid-agent-services", group `crypto-native`.
Date of research: 2026-09-03.
Criterion: *Selling agent or API services for stablecoins: who actually pays, settlement costs,
and honest current volume rather than promise.*

Search budget used: **8 of 8 WebSearch calls**. No searches were refused. All remaining evidence
came from GitHub (free) and from a sibling scout's already-written notes (free).

## Evidence strength key
- **[RENDERED]** — I fetched the page and read it. Strong.
- **[SNIPPET]** — I only saw a search-result snippet quoting the source. Weak; a human must open the URL.
- **[SIBLING]** — taken from another scout's notes in this same sweep, not re-verified by me.
- **[BLOCKED]** — egress proxy refused the fetch.

---

## 0. What I did not have to re-research

`research/colony-sweep/scouts/agent-markets--x402-economy.md` (this sweep, 2026-09-03) already
established the ecosystem-level numbers for the x402 rail. I treat those as **[SIBLING]** and do
not re-spend budget on them. The load-bearing ones:

- Ecosystem volume ~**$1.1M/month**, peak $5.15M (Nov 2025) → $1.19M (May 2026).
- **~47% of transaction volume is leaderboard-incentive driven**; *"the majority of Top Sellers
  are self-trades, and genuine commercial transactions are limited to the DeFi and crypto asset
  data sectors."*
- **#1 seller in the entire protocol (StableEnrich) has earned $3.12K cumulative** over 108,000
  transactions. #2 (BlockRun YOPO) $2.68K.
- Coinbase CDP facilitator: **first 1,000 settled payments/month free, then $0.001 per settled
  payment** from 2026-01-01. Fees are per **on-chain settlement**, not per payment request.
- Israel: receiving USDC to a self-custodied wallet needs no account and no KYC; converting
  USDC→ILS requires KYC at a CMA-licensed Israeli VASP (Bits of Gold or equivalent).

My job was the seller-side question that sits underneath those aggregates: **does anyone actually
pay a no-brand seller, and what does it cost to get the money.** New primary evidence below.

---

## 1. New primary evidence — three independent honest sellers' own numbers

These are the best things I found and they all cost zero search budget.

### 1a. An operator who kept an honest ledger and earned nothing
**[RENDERED]** https://raw.githubusercontent.com/Daisuke134/life-manager/main/skills/earn/x402-sell/SKILL.md
(fetched 2026-09-03)

> *"External revenue as of 2026-07-14: **$0**. All 9 inflows in the 48h baseline were self-pay
> seeds (INV-7: excluded)."*

Its own honesty rule: *"A sale counts only when REAL USDC arrives from a REAL EXTERNAL buyer …
verified by `verify-inflow.mjs` on-chain."* Default price $0.003/call. Its conclusion in my
words: **listing is proven, revenue is aspirational.** This is a builder with a working x402
seller, correct discovery wiring, and a disciplined definition of revenue, reporting zero.

It also documents the indexing gate precisely: a stable **https** origin in `X402_PUBLIC_URL`
is mandatory — *"without it you will never be indexed"* — and one seeding payment per route
through the public URL triggers the Bazaar listing, with listing latency of "minutes–hours".

### 1b. The one seller I found with a real, named, counted customer
**[RENDERED]** https://raw.githubusercontent.com/strale-io/strale/main/docs/x402-listing.md
(fetched 2026-09-03)

Strale sells **290 pay-per-call APIs** for agents (search, SERP, email/domain verification,
company enrichment, tech-stack detection), priced **$0.01–$0.22 per call** (Google Search $0.10,
SERP Analysis $0.15, Email Deliverability $0.05, Tech-Stack Detection $0.03, Keyword Suggest
$0.03), with 11 free capabilities. Its pricing table is *"Ordered by real external revenue over
the last 30 days."*

The sentence that decides this criterion:

> *"Our only paying customer made 1,306 calls in 30 days and not one was a compliance call:
> they buy search, email validation, deliverability, tech-stack detection and keyword tools."*

**One** paying customer. 1,306 calls in 30 days. Against their published price band that is
roughly **$13–$290/month gross, most plausibly $50–$150** — for a catalogue of 290 endpoints.
Their listings: https://api.strale.io/x402/catalog , https://api.strale.io/.well-known/x402.json ,
https://api.strale.io/.well-known/agent-card.json

### 1c. A third-party measurement of conversion
**[SNIPPET]** — search result quoting an x402 market analysis, 2026:

> *"In late Q1 2026, a single independent data marketplace reported 1,183 agent probes, only
> 5 settlements, and $0.11 of revenue."*

That is a **0.42% probe→settlement rate** and eleven cents. URLs a human must open to close it:
https://stablecoininsider.org/ai-agents-for-stablecoins-in-2026/ and
https://majormatters.co/x402 and https://note.com/x402inc/n/nfd6227f13b55?hl=en-US
(note.com is **[BLOCKED]** from this container).

**Read 1a, 1b and 1c together.** Three independent sellers, three honest ledgers: **$0**,
**one customer**, **$0.11**. This is the actual state of selling API services for stablecoins in
September 2026.

---

## 2. Who actually pays — the buyer question, answered as precisely as I can

I looked for *nameable* buyers rather than "AI agents".

**Real, nameable buyer-side software (they exist and they spend):**
- **Obol Network** — **[RENDERED]**
  https://raw.githubusercontent.com/ObolNetwork/obol-stack/main/internal/embed/skills/buy-x402/SKILL.md
  Their agents (Hermes / OpenClaw) buy three things over x402: long-running paid **inference**
  (`paid/<remote-model>` routes), one-shot **agent** calls, and stateless **HTTP services**.
  Spend is capped per purchase with `--budget` / `--cost-cap`; *"Max loss = N × price (only as
  vouchers are spent)"*. Chains: Base Sepolia, Base Mainnet, Ethereum Mainnet. Tokens: USDC
  (EIP-3009) or OBOL (Permit2). Default facilitator `https://x402.gcp.obol.tech`.
  The **only** external seller their docs name is `POST https://swiss-knife.xyz/api/usdc-pay`,
  described as a smoke-test endpoint — i.e. even a real buyer's documentation names no
  commercial third-party seller it habitually buys from.
- **BlockRun / ClawRouter** **[SIBLING]** (6,578 stars) — agents paying for LLM inference in USDC.
- **Strale's single anonymous customer** (§1b) — buys web search and enrichment. Not named.

**What this adds up to:** the demonstrated stablecoin buyer is an **agent runtime buying
inference or web-search/enrichment**. I found **no nameable company that pays stablecoins for a
generic utility or data endpoint**. Per rule 5, that means the buyer for a new no-brand seller
has not been found.

Two structural facts make that worse for a newcomer:
- Buyers of *inference* are served by BlockRun, which we cannot underprice.
- Buyers of *crypto market data* — the one sector the market analysis calls genuinely commercial
  — are served first-party by **CoinGecko** (https://docs.coingecko.com/ai-integration/x402) and
  **CoinMarketCap** (https://coinmarketcap.com/api/x402/) **[SNIPPET, SIBLING]**.

---

## 3. Settlement costs — the one part of this criterion with clean answers

| Rail | Who pays gas | Platform fee | Evidence |
|---|---|---|---|
| x402 direct to own wallet, CDP facilitator | Seller's facilitator pays on-chain gas; **buyer pays zero gas** | 1,000 settled payments/month free, then **$0.001 per settled payment** | **[RENDERED]** Obol skill for the gas mechanics; **[SNIPPET, SIBLING]** for CDP pricing |
| x402, self-facilitated | Seller, needs *"a sliver of Base ETH"* | 0 | **[RENDERED]** life-manager skill |
| x402, open-source facilitator | Seller | *"Free forever"* — `rawgroundbeef/OpenFacilitator` | **[SIBLING]** |
| NOWPayments (hosted gateway) | — | **0.5%** without conversion, **1%** with conversion; no setup/monthly fee | **[SNIPPET]** |
| CoinGate | — | flat **1%** | **[SNIPPET]** |
| Coinbase Commerce | customer pays network fee | **1%**; ~2–2.5% all-in if you auto-convert to USD | **[SNIPPET]** |
| Stripe stablecoin payments (Bridge) | — | flat **1.5%**, accepts from 70+ countries, settles USDC on Solana/Ethereum/Polygon, pays out USD or stablecoin | **[SNIPPET]** |
| USDC → ILS off-ramp | — | unknown spread; licensed Israeli VASP | **[SNIPPET, SIBLING]** |

Key nuance worth carrying: **batch settlement**. Vouchers are verified off-chain for free and
claimed together, so one on-chain transaction can settle thousands of payments. The $0.001
per-settlement floor is therefore an upper bound for a high-volume seller, and irrelevant at the
volumes anyone is actually doing.

Snippet sources for the fee table (a human should open at least one of these):
https://nowpayments.io/blog/payment-gateway-israel ,
https://coingate.com/blog/post/best-crypto-payment-gateway ,
https://thefinrate.com/coinbase-commerce-review-2026-pricing-pros-cons/ ,
https://stripe.com/blog/everything-we-announced-at-sessions-2026 ,
https://stripe.com/use-cases/crypto

**Verdict on settlement cost:** it is **not the bottleneck and never was.** 0.5%–1.5% on hosted
rails, effectively 0 on self-custodied x402. A rail that costs nothing to use is still worth
nothing if nobody buys. The criterion asked for costs; the honest report is that costs are
solved and demand is not.

---

## 4. Accepting USDC for an ordinary subscription — a different, less exciting model

Distinct from agent micropayments: price a normal SaaS/API subscription in USD and let the
customer pay in USDC. **[SNIPPET]** the pattern vendors describe for 2026 is *"SaaS subscriptions
priced in USD but paid in USDC"*, with annual B2B billing called *"the cleanest crypto payment
use case in the subscription economy — the buyer is human, the cadence is predictable, and the
ticket size justifies the ops."* Tooling named: Request Finance, Copperx, Sphere Pay, Stripe
Invoicing with Pay-with-Crypto.

**I am marking this weak on purpose.** Every source I got was a payment vendor's own marketing
blog (dodopayments.com, fungies.io, aurpay.net, eco.com, payyd.co, stablecoininsider.org). Not
one of them showed a merchant-side figure for what share of buyers actually chose stablecoin.
The honest reading: **accepting USDC is a seller-side cost saving (0.5% vs 2.9%), not a
demand-side driver.** It does not create a buyer. It is a checkbox to add to a product that
already sells, not a product.

Note also that the "buyer is human" framing collides with our mandate: a human B2B annual
subscription normally implies sales contact, which the owner does not do.

---

## 5. Things in this criterion that are RED and must not be built

- **Leaderboard / incentive farming and self-trading.** ~47% of x402 volume **[SIBLING]**, and the
  majority of top sellers self-trade. Wash-trading your own endpoint to climb an index is
  deceiving the index and its users. **RED under our constitution regardless of platform ToS.**
  I am recording it as a finding specifically so nobody in this colony rediscovers it as a
  "growth tactic".
- **Reselling third-party paid APIs over x402** — the StableEnrich model (Apollo, Clado, Exa,
  Firecrawl, Google Maps, Serper, Whitepages) **[SIBLING]**. This is the highest-earning model in
  the ecosystem and it is **AMBER at best**: Google Maps Platform, Apollo and Whitepages all
  restrict redistribution and caching of their data to third parties. A seller doing this is
  one enforcement email from zero. Not a build for us.
- **Agent tokenization launchpads** (Virtuals) — token issuance to speculators, excluded by our
  constitution and already covered by `agent-markets--agent-registries`.

---

## 6. Payability to Israel

**YES for the self-custody path, and it is the only path I would rely on.**

- x402 / direct-wallet USDC receipt: no account, no platform, no KYC to receive. **[SIBLING]**,
  and consistent with `products/x402-il-api`'s existing design.
- Hosted gateways: **UNKNOWN for Israel.** **[SNIPPET]** NOWPayments' restricted list names the
  US, Cuba, Iran, North Korea, Crimea, Sudan, Syria, Russia — *Israel is not named either way in
  anything I saw*, and NOWPayments publishes a blog page targeted at Israeli businesses
  (https://nowpayments.io/blog/payment-gateway-israel), which is marketing, not a terms page.
  **[SNIPPET]** NOWPayments requires no merchant KYC for standard non-custodial acceptance but
  **fiat settlement requires KYC** and KYC thresholds appear as volume grows.
  **[SNIPPET]** Coinbase Commerce's "self-managed" plan settles to your own wallet and is
  described as not limited by country availability, unlike "Coinbase managed" — relevant because
  **[SIBLING]** Coinbase does not serve Israeli customers.
  **[SNIPPET]** Stripe stablecoin payments accept from 70+ countries; Israel not confirmed.
  URLs a human must open to close all of this: the actual terms pages —
  https://nowpayments.io/terms-of-service , https://commerce.coinbase.com , https://stripe.com/il
- USDC → ILS: **one-time human KYC at a CMA-licensed Israeli VASP.** **[SIBLING]**, unverified
  first-hand; note the reported 2026-08-17 Bits of Gold breach affecting 200,000 customers before
  handing over identity documents.

**Owner blockers (one-time, human, legally required):**
1. KYC at a CMA-licensed Israeli VASP to convert USDC → ILS into an Israeli bank account.
2. Israeli tax reporting of crypto-denominated business income.
Nothing else. Selling over x402 itself requires no signup, no identity, and no human.

---

## 7. Honest ceiling for a no-brand new entrant

Arithmetic, using only numbers above:

- 20,000 ILS/month ≈ **$5,400/month**.
- Total seller-side revenue in the whole x402 economy ≈ $1.1M/month, of which roughly half is
  incentive-farmed and much of the rest is self-trade.
- The **#1 seller in the protocol has earned $3.12K in its entire life.**
- The best-documented honest seller with a real customer (Strale, 290 endpoints) is doing on the
  order of **$50–$150/month**.
- An honest seller with correct discovery wiring reported **$0**.

To hit the first target through this rail we would need roughly **$5,400/month — about 1.7× the
lifetime earnings of the #1 seller, every month.** It is not close, and no amount of build
quality changes it, because the constraint is the number of agents in the world with a funded
wallet and a reason to spend it on us.

**My honest ceiling for a new no-brand entrant selling agent/API services for stablecoins:
0–300 ILS/month.** I would put the modal outcome at **0**.

---

## 8. What I recommend to the supervisor

1. **Do not open a new build in this criterion.** There is no finding here that clears even 5%
   of the first target.
2. **Keep `products/x402-il-api` exactly as it is**: near-zero running cost, correct discovery,
   honest README, **zero further engineering hours**, forecast nothing from it. It is a call
   option on the rail maturing, and its domain logic is shared with the Apify line anyway.
3. **One cheap hygiene item, worth <1 hour:** the Bazaar/index ecosystem delists resources with
   no settled payment in a trailing 30-day window, and indexing requires a stable public https
   origin. If we want the option to stay alive we should confirm `X402_PUBLIC_URL` is set to the
   real origin. We must **not** seed self-payments to stay listed — that is §5 wash-trading.
   (The 30-day rule is **[SNIPPET]** from a GitHub code-search fragment in `remp0x/atelier`
   `docs/x402-bazaar-setup.md`; I could not render the file — the raw URL 404'd on `main`, so a
   human should confirm against https://docs.cdp.coinbase.com/x402/ .)
4. **If the owner ever wants stablecoin acceptance on an existing product**, it is a 0.5%–1.5%
   checkbox, not a project, and it should be judged as a cost saving rather than a revenue line.
5. **Watch, do not build.** The one thing that would change this verdict is a named buyer with a
   funded budget. Re-check when someone other than a facilitator vendor publishes seller-side
   revenue.

---

## 9. Dead ends (do not re-search these)

- **Being an x402 facilitator.** Coinbase charges $0.001/settlement, Cloudflare and
  `rawgroundbeef/OpenFacilitator` are free, Obol runs its own. **[SIBLING]** Zero margin in a
  commoditised layer. Not a business.
- **Nevermined's and Skyfire's blogs as evidence.** nevermined.ai returned nine near-identical
  "45 Agent-to-Agent Payment Stats", "31 AI Agent Payment Statistics", "40 Stablecoin Payments
  for AI Agents Statistics" pages. This is SEO content farming by a vendor in the market it is
  measuring. **Do not cite these numbers.** Their headline aggregates (stablecoin volume "$46
  trillion annually", McKinsey's "$390 billion actual payments volume") are about stablecoins in
  general, not about anyone paying for agent services, and quoting them here would be a category
  error.
- **Generic "the agentic economy is $X trillion" forecasts.** Not revenue. MISSION.md is explicit.
- **Selling generic utility endpoints over x402 hoping discovery brings buyers.** Discovery is
  solved and free; three independent sellers show demand is not.
- **Israeli-specific stablecoin niches.** I found nothing. Every Israeli-domain source is
  egress-blocked from this container and GitHub carried no Israeli stablecoin merchant material.

## 10. Egress blocks encountered
`note.com` **[BLOCKED]**. `raw.githubusercontent.com/remp0x/atelier/main/...` returned 404 (wrong
default branch, not a block). `github.com` and `raw.githubusercontent.com` otherwise rendered
fine and carried every piece of strong evidence in this report. The GitHub MCP `search_code` tool
worked across all of GitHub and was by far the highest-value zero-cost tool available.
