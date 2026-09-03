# Scout notes — agent-markets / x402-economy

Scout: WORKER-SCOUT "x402-economy", group `agent-markets`.
Date of research: 2026-09-03.
Criterion: *x402 in 2026 — which services actually accept x402, measurable transaction volume,
who the machine buyers are, CDP facilitator economics, and whether a paid API there earns
anything real yet.*

Search budget used: **7 WebSearch calls** (cap was 8). No searches were refused.

## Evidence strength key
- **[RENDERED]** — I fetched the page and read it.
- **[SNIPPET]** — I only saw a search-result snippet quoting the source. Weaker. A human must open the URL to close it.
- **[BLOCKED]** — I tried to fetch and the egress proxy refused.

---

## 1. Who actually accepts x402

**[RENDERED]** https://raw.githubusercontent.com/xpaysh/awesome-x402/main/README.md
(fetched 2026-09-03; repo `xpaysh/awesome-x402`, 285 stars, 988 forks, 457 open issues)

This is the largest public catalogue of live x402 sellers. It lists **~150 named services with
live URLs and prices** — a full transcript of the table is in the raw fetch. Representative rows:

| Service | URL | Price |
|---|---|---|
| Octodamus | https://api.octodamus.com | $0.01–$0.02 USDC/call |
| Langston Search | https://langston.click/api/search | $0.02 USDC/query |
| Kaisha (Japan company registry) | https://kaisha-api.hp-vladic.workers.dev | $0.002–$0.01/call |
| Yield.xyz AgentKit (MCP) | https://mcp.yield.xyz/mcp | $0.001 USDC/call |
| PayAPI Market | https://payapi.market | $0.001–$0.01/request |
| Appraxa IP Valuation | https://api.appraxa.com/v1/info | from $0.99/valuation |
| Sentinel Intelligence | https://sentinel-intelligence-api.onrender.com | $2–$10 USDC |
| HSH Data | https://dod.hshintelligence.com | $0.02–$50/call |

**Critical caveat, and I want it on the record:** this list has **no stated verification
methodology, no sourcing statement, no last-updated marker and no version number**. 988 forks
against 285 stars and 457 open issues is the signature of a "submit a PR to add your endpoint"
list — i.e. it is a *directory of people who want to sell*, not evidence that anyone buys.
Every price in it is self-reported by the operator. The README's own headline volume claims
("AIsa: 10.5M+ cumulative transactions", "Ecosystem-wide: 500K+ weekly transactions",
"Coinbase CDP: hundreds of thousands of transactions weekly", "Zero fees, 2-second settlement")
are marketing copy inside that same unverified README and **contradict the independent
on-chain numbers in section 2 below**. Treat them as claims, not facts.

Institutional adoption is real and separate from that list. **[SNIPPET]** the x402 Foundation
launch member list spans 22 organisations including Adyen, AWS, American Express, Base, Circle,
Fiserv, Google, KakaoPay, Mastercard, Microsoft, Polygon Labs, PPRO, Shopify, Solana Foundation,
Stripe, thirdweb and Visa. Five named production deployments as of April 2026: Coinbase
Agent.market, Stripe Machine Payments, CoinGecko paid endpoints, Circle Wallets reference
workflow, Cloudflare Agents SDK.
To close: https://www.chainalysis.com/blog/x402-agentic-payments-adoption/ and
https://solana.com/x402/what-is-x402

Official first-party paid endpoints now compete directly with any data seller:
- CoinGecko x402 — https://docs.coingecko.com/ai-integration/x402 **[SNIPPET]** (USDC on Solana and Base)
- CoinMarketCap x402 — https://coinmarketcap.com/api/x402/ **[SNIPPET]**

---

## 2. Measurable transaction volume — the load-bearing numbers

All figures below are **[SNIPPET]**. Every primary source I wanted (note.com, coindesk.com,
en.wikipedia.org) is egress-blocked from this container, so a human must open these to close them.

**Volume trajectory (from Dune-derived analysis, quoted in search results):**
- Peak volume **$5.15M in November 2025**, fallen ~**77% to $1.19M in May 2026**.
- Transaction count peak **4.85M in December 2025**, down 41%, recovered to **2.89M by May 2026**.
- Coinbase Facilitator (Base) is the largest processor: **>$1.004M cumulative volume,
  >1.16M transactions**.
- Source dashboards (must be opened by a human — Dune requires JS):
  - https://dune.com/queries/6060125 (x402 total transactions by day)
  - https://dune.com/queries/6240463 (volume by facilitator & chain, 30 days)
  - https://dune.com/hashed_official/x402-analytics
  - https://dune.com/thechriscen/x402-payment-analytics
  - https://dashboard.agenteconomy.to/

**Market-wide snapshot** (x402 Inc. / Katomasa, **[BLOCKED]** note.com — snippet only):
- **3.69M transactions, $1.11M volume**; **average unit price ≈ $0.30/call**;
  **buyer:seller ratio ≈ 4.4 : 1**; **monthly volume stuck at the ~$1.1M/month level**.
- URL a human must open: https://note.com/x402inc/n/nfd6227f13b55?hl=en-US

**Cumulative, per agenteconomy.to as of 2026-07-19** **[SNIPPET]**:
**157,413,420 cumulative x402 transactions settled on-chain, moving $41,062,036 in stablecoin
volume across 7 chains and 18 tracked facilitators.**
URL: https://agenteconomy.to/stats/x402-transactions

**Numbers I am explicitly rejecting as unreliable:** blockchain.news claims
"X402 Processes $50B... across 200 million payments"
(https://blockchain.news/news/x402-ai-payments-stablecoins). That is off by roughly **1,000×**
from the $41M cumulative figure at a consistent ~$0.26–$0.30 average ticket. It is not
reconcilable with any other source I saw and I am not carrying it forward.

**The quality of that volume — this is the finding that matters:**
- **[SNIPPET]** CoinDesk, 2026-03-11: despite a roughly **$7 billion ecosystem valuation**,
  on-chain data shows x402 processes only about **$28,000 in daily volume, much of it from
  testing and "gamed" transactions rather than real commerce**.
  URL to close: https://www.coindesk.com/markets/2026/03/11/coinbase-backed-ai-payments-protocol-wants-to-fix-micropayment-but-demand-is-just-not-there-yet
  (**[BLOCKED]** — coindesk.com refused by the egress proxy.)
- **[SNIPPET]** Per Artemis statistics quoted in the x402 Inc. analysis: **~47% of transaction
  volume is related to leaderboard-incentive mechanisms**, though those account for only 14% of
  total transaction *value*.
- **[SNIPPET]**, and this is the single most important sentence I found:
  **"The majority of Top Sellers are self-trades, and genuine commercial transactions are
  limited to the DeFi and crypto asset data sectors."**

---

## 3. What a top seller actually earns

**[SNIPPET]** (from the same x402 Inc. market analysis):

| Rank | Seller | Cumulative earned | Transactions |
|---|---|---|---|
| 1 | **StableEnrich** | **$3.12K** | 108,000 |
| 2 | **BlockRun YOPO** | **$2.68K** | 85,000 |

That is **cumulative, not monthly**, and it is the **#1 seller in the entire x402 economy**.
$3,120 ≈ **~11,500 ILS cumulative over the life of the protocol**.

StableEnrich's model is instructive: pay-per-request access to *other people's* paid APIs —
Apollo, Clado, Exa, Firecrawl, Google Maps, Serper, Whitepages. It is an aggregator/reseller,
not an original data source. BlockRun YOPO is LLM routing (cf. `BlockRunAI/ClawRouter`,
6,578 stars — https://github.com/BlockRunAI/ClawRouter).

Against ~150+ listed sellers and a $1.1M/month ecosystem where roughly half the transactions are
incentive-farmed, **the median x402 seller earns approximately zero.**

---

## 4. CDP facilitator economics

**[SNIPPET]**, but from Coinbase's own announcement, and it corroborates exactly what
`products/x402-il-api/README.md` already assumes:

> "Coinbase x402 Facilitator will introduce a minimal fee starting Jan 1, 2026:
> → Free Tier: First 1,000 settled payments/month
> → Pricing: Just $0.001 per settled payment after that"
> — @CoinbaseDev, https://x.com/CoinbaseDev/status/1995564027951665551

Nuance worth capturing that our README does **not** currently have:
**fees are charged per on-chain settlement, not per payment request.** With batch settlement,
vouchers are verified off-chain for free and claimed together, so one on-chain transaction can
settle thousands of payments. That materially changes the pricing floor for a high-volume
seller — the $0.002 floor in our README is correct for naive per-call settlement but
conservative if batch settlement is used.
Primary URL a human must open: https://docs.cdp.coinbase.com/x402/core-concepts/facilitator

Facilitator competition means there is **no margin in being a facilitator**:
- Coinbase CDP — $0.001/settlement after 1,000/month free
- Cloudflare Workers x402 **[SNIPPET]**
- `rawgroundbeef/OpenFacilitator` — "Accept payments from AI agents. Open-source. Your data,
  your domain, your rules. **Free forever.**" https://github.com/rawgroundbeef/OpenFacilitator **[RENDERED via repo search]**
- `ChaosChain/chaoschain-x402`, GoPlausible (Algorand), xpay.sh, Dexter

---

## 5. Who the machine buyers are

Honest answer: **mostly not real buyers yet.** Buyer:seller ≈ 4.4:1 sounds healthy until you
read that ~47% of transactions are leaderboard-incentive-driven and that the majority of top
sellers are self-trading.

The buyer *populations* that are real, in descending order of credibility:
1. **Agents paying for LLM inference.** `BlockRunAI/ClawRouter` (6,578 stars) —
   "Every frontier model behind one wallet, USDC payments on Base & Solana via x402."
   `qntx/openai-python` (262 stars) — drop-in OpenAI client with transparent x402 support.
   `AlephantAI/AIephant-AI-Agent-Gateway` (110 stars).
2. **Agents buying crypto/DeFi market data** — the one sector the market analysis names as
   genuinely commercial. Buyers are trading-bot operators. CoinGecko and CoinMarketCap have
   already taken this with first-party endpoints.
3. **Framework/SDK-embedded spend** — Cloudflare Agents SDK, Google `a2a-x402`
   (https://github.com/google-agentic-commerce/a2a-x402, 559 stars),
   `aws-samples/sample-agentcore-cloudfront-x402-payments`, `solana-foundation/pay` (1,770 stars).
   These are *capability*, not demonstrated spend.

**I did not find a single nameable company that buys generic utility endpoints over x402.**
"AI agents" is not a buyer. Per rule 5, that means I have not found the buyer.

---

## 6. Discovery — does listing get you traffic?

**[RENDERED]** from the awesome-x402 fetch. Discovery mechanisms in use:
`/.well-known/x402` and `/.well-known/x402.json` (Coinbase Bazaar indexing),
`/.well-known/agent-card.json`, `llms.txt` (on 150+ endpoints), `/openapi.json`,
`/.well-known/mcp.json`, and the agent402.tools index/leaderboard
(https://agent402.tools — /api/find, /api/route, /api/leaderboard).

Our `products/x402-il-api` already serves `/.well-known/x402.json`, so it is
discovery-complete. Discovery is not the bottleneck. **Demand is the bottleneck.**

Also relevant: `Recall-Kitchen/awesome-x402-mcp-services` — a curated list of x402-paid MCP
services — has **1 star and 49 forks**, which is a fork-farming signature, not a user base.

---

## 7. Payability to Israel

**YES, with one unavoidable one-time human KYC step at the off-ramp.**

Receiving is clean: x402 settles USDC directly into a self-custodied wallet on Base. No account,
no platform, no KYC to *receive*. This is genuinely the only line in the portfolio that needs no
signup to start earning — which is exactly what our own README already claims.

Converting USDC → ILS is where a human is required:
- **[SNIPPET]** Israel's Supervision of Financial Services Law defines virtual currencies as
  "financial assets" and requires exchanges to be licensed; banks may no longer refuse
  crypto-derived deposits from licensed providers.
  To close: https://www.legal500.com/guides/chapter/israel-blockchain-crypto-assets/
- **[SNIPPET]** **Bits of Gold** is Israel's leading licensed broker (Capital Markets Authority),
  supports USDC, and has direct Israeli banking integration.
  https://www.bitsofgold.co.il/en/currency/usdc
- **[SNIPPET]** **Coinbase does not serve Israeli customers**; **Kraken's fiat list
  (USD, EUR, CAD, AUD, GBP, CHF, JPY, BRL, ARS, MXN) does not include ILS.**
  So the Israeli-bank route is effectively Bits of Gold or an equivalent local licensed VASP.
- **Risk flag: [SNIPPET]** CoinDesk 2026-08-17 — "Israel's largest crypto broker Bits of Gold hit
  by data breach affecting 200,000 customers."
  https://www.coindesk.com/tech/2026/08/17/israel-s-largest-crypto-broker-bits-of-gold-hit-by-data-breach-affecting-200-000-customers
  The owner should know this before handing over identity documents.

**Owner blockers (one-time, human, legally required — do not assume done):**
1. KYC registration at a CMA-licensed Israeli VASP (Bits of Gold or equivalent) to convert
   USDC → ILS into an Israeli bank account. Identity documents; a real human step.
2. Israeli tax treatment of crypto-denominated business income — reporting obligation on the
   owner. Not a platform step, but not something software can discharge.

I did **not** verify Bits of Gold's current onboarding requirements first-hand; bitsofgold.co.il
was not fetched. A human must confirm before this is treated as settled.

---

## 8. Verdict on the criterion

**Does a paid API on x402 earn anything real yet? No — not for a new no-brand entrant selling
general-purpose utility endpoints.**

The arithmetic is not close. Ecosystem-wide seller revenue is ~$1.1M/month, ~47% of transactions
are incentive-farmed, the majority of top sellers self-trade, and the **#1 seller in the entire
protocol has earned $3.12K cumulative**. Spread across 150+ listed sellers, the median seller's
monthly revenue rounds to zero. Reaching even 2,000 ILS/month (10% of the 20,000 ILS target)
would require roughly $540/month — about **17× what the #1 seller in the ecosystem has earned in
total, every month.**

This does **not** mean tear down `products/x402-il-api`. Our own README is already honest about
this ("organic x402 demand in 2026 is small... deliberately cheap to run and shares its domain
logic with the Apify actor line"). That framing survives contact with the evidence. The correct
posture is: **keep it running at near-zero cost as a call option on the rail maturing; invest
zero further hours; do not forecast revenue from it.**

## 9. Egress blocks encountered
`note.com`, `www.coindesk.com`, `en.wikipedia.org` — all EGRESS_BLOCKED.
`github.com` / `raw.githubusercontent.com` rendered fine and carried the best primary evidence.
The GitHub MCP `get_file_contents` tool is repo-restricted to `zarfatinimrod-creator/automaton`,
but `search_repositories` and WebFetch-on-github worked.
