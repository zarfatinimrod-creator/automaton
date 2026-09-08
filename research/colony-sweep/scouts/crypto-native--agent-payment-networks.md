# Scout notes — crypto-native / agent-payment-networks

Scout: WORKER-SCOUT "agent-payment-networks", group `crypto-native`.
Date of research: 2026-09-04.
Criterion: *Agent-to-agent payment networks and machine commerce: measured volume, real buyers,
and time horizon.*

Search budget used: **6 of 8 WebSearch calls.** No search was refused. Everything else came from
GitHub / raw.githubusercontent.com fetches (free) and from two sibling scouts' notes (free).

## Evidence strength key
- **[RENDERED]** — I fetched the page and read it. Strong.
- **[SNIPPET]** — I only saw a search-result snippet quoting the source. Weak; a human must open the URL.
- **[SIBLING]** — from another scout's notes in this sweep, not re-verified by me.
- **[BLOCKED]** — egress proxy refused the fetch.

## What I deliberately did NOT re-research
`agent-markets--x402-economy.md` and `crypto-native--paid-agent-services.md` (this sweep,
2026-09-03) already did the x402 seller-side economics. I treat their numbers as **[SIBLING]**.
My criterion is the *network* layer: every agent-payment rail, not just x402 — who moves money,
how much is measured, who the buyers are, and how far away the money is.

---

## 1. The field, enumerated (free, from GitHub directories)

**[RENDERED]** https://raw.githubusercontent.com/bitrefill/awesome-agentic-payments/main/README.md
(fetched 2026-09-04) — a curated DIRECTORY, not demand evidence.

| Rail | What it is | Backers quoted by the list |
|---|---|---|
| **ACP** (Agentic Commerce Protocol) | agent↔merchant checkout | OpenAI + Stripe; "1M+ merchants via Shopify and Etsy" |
| **AP2** (Agent Payments Protocol) | payment-agnostic mandates via Verifiable Digital Credentials | Google; "60+ orgs incl. Adyen, Mastercard, PayPal, Visa, Coinbase" |
| **UCP** (Universal Commerce Protocol) | merchant-side agentic commerce | Google + Shopify; "Target, Walmart, Etsy, Wayfair, 20+ partners" |
| **MPP** (Machine Payments Protocol) | machine payments | Tempo + Stripe; Visa network tokens, Lightning |
| **x402** | HTTP 402 stablecoin micropayments | Coinbase; x402 Foundation, 22 orgs, co-founded with Cloudflare |
| **L402 / Fewsats** | Lightning + macaroons API auth | Lightning Labs |
| **Visa TAP / Mastercard Agent Pay** | card-network agent credentials | Visa "30+ partners in sandbox, early 2026" |

**[RENDERED]** https://raw.githubusercontent.com/xpaysh/awesome-agentic-commerce/main/README.md
(fetched 2026-09-04; maintained list that explicitly refuses unlinkable adoption claims):
ACP "cuts dated releases"; UCP "draft with active deployments"; **AP2 "pre-stable, no released
tag"**; TACP (Forter) is an external trust-signal layer. That list contains **no transaction
counts, no revenue figures, no merchant volume at all** — it says self-reported numbers without a
link "get cut". As of its June 2026 review date every protocol is recently released or draft.

**[RENDERED]** https://raw.githubusercontent.com/google-agentic-commerce/AP2/main/README.md —
Google's own AP2 repo is code samples and demos built on ADK. No partner list, no status, no
volume in the README. AP2 is a spec with demos, not a rail that pays anyone today.

---

## 2. Measured volume — and a contradiction I cannot resolve here

This is the load-bearing section and it does not agree with itself. Both numbers below are
**[SNIPPET]**.

**Optimistic set** (search 2026-09-04, quoting the official x402 dashboard and Base):
- "75.41 million transactions and $24.24 million in volume over the past 30 days, with
  **94,060 buyers and 22,000 sellers**".
- "165M+ transactions, ~$50M+ volume, 480K+ agents transacting" cumulative.
- Base, 30 days to 2026-05-29: **3.1M transactions, $1.2M value**, sellers +23%, buyers +37%.
  URL to close: https://cryptobriefing.com/agent-payments-growth-x402/
- Named service providers on Coinbase Agentic.Market: Firecrawl, OpenAI, Anthropic, Alchemy,
  CoinGecko. URL to close: https://www.coinbase.com/developer-platform/discover/launches/agentic-market **[BLOCKED]**

**Pessimistic set** **[SIBLING]** (from `agent-markets--x402-economy.md`, 2026-09-03):
- ecosystem volume ~**$1.1M/month**, peak $5.15M (Nov 2025) → $1.19M (May 2026);
- CoinDesk 2026-03-11: ~**$28,000/day**, "much of it from testing and gamed transactions";
- **~47% of volume is leaderboard-incentive driven**; "the majority of Top Sellers are
  self-trades, and genuine commercial transactions are limited to the DeFi and crypto asset
  data sectors";
- **#1 seller in the whole protocol has earned $3.12K cumulative** across 108,000 transactions.

$24.24M in 30 days across 22,000 sellers cannot coexist with a top seller who has earned $3.12K
cumulative unless the two are measuring different things (chains counted, incentive transfers
counted as volume, different windows). **I am not carrying either as fact.** The honest reading
that survives both: transaction *counts* are large and cheap, dollars are small, and the
distribution is brutally skewed. A human must open the Dune dashboards to settle it:
- https://dune.com/queries/6060125 · https://dune.com/queries/6240463
- https://dune.com/hashed_official/x402-analytics · https://dashboard.agenteconomy.to/
- https://x402-list.com/ (**[BLOCKED]**; its MCP exposes `x402_facilitator_volumes` —
  per-facilitator on-chain-verified settlement volume, today/7d/30d/all, with tx counts:
  **[RENDERED]** https://raw.githubusercontent.com/mcccsm/x402-list-mcp/main/README.md)

**Reachable-without-a-browser route the colony should use:** `x402-list-mcp` is on npm and is an
MCP server. Running it locally would give us facilitator settlement volumes as data instead of
snippets. That is a build task, not a research task, and it is cheap.

---

## 3. The fiat/card rails: the biggest one closed while we were watching

**[SNIPPET]**, search 2026-09-04 — three independent results say the same thing:
- OpenAI launched "Buy it in ChatGPT" / Instant Checkout to **all US ChatGPT users on
  2026-02-16**, buying from **US** Etsy sellers and (announced) Shopify merchants.
- **On 2026-03-24 OpenAI ended Instant Checkout**, the product that carried ACP checkout inside
  ChatGPT, and re-pointed ACP at product *discovery*. The protocol lives; the checkout is gone.
- URLs a human must open: https://www.digitalcommerce360.com/2026/03/06/openai-shifts-checkout-plans-agentic-commerce-strategy/ ,
  https://www.nuvei.com/posts/openai-tried-to-checkout-it-couldnt ,
  https://verityscore.io/en/kb/acp-agentic-commerce-protocol/ , https://openai.com/index/buy-it-in-chatgpt/

Consequences for us, and they are decisive:
1. Every card-rail agent-commerce standard (ACP, UCP, AP2, TAP, Agent Pay, MPP) requires you to be
   a **merchant of record with a card acquirer or a payment institution**. We are a software-only
   Israeli operation; `payment-rails--stripe-alternatives.md` **[SIBLING]** records that whether
   Stripe onboards an *Israel-based merchant* is unresolved, and Shopify Partner payouts to
   Israel are UNKNOWN in `docs/REJECTED.md`. So these rails inherit an unresolved payability gate
   *before* any demand question.
2. Even had it stayed open, Instant Checkout was **US buyers, US sellers**. Israel: **NO**.
3. These are checkout rails for **physical/retail goods**. We sell software output. Wrong shape.

---

## 4. The rails a software-only Israeli seller can actually reach

Only the crypto-native ones, because they settle to a self-custodied wallet with no account and
no platform KYC. **[SIBLING]** `crypto-native--israel-offramp.md`: receiving USDC needs nothing;
converting USDC→ILS needs KYC at a CMA-licensed Israeli VASP (Bits of Gold or equivalent), which
is a one-time owner identity step and belongs in ownerBlockers.

### 4a. AWS Bedrock AgentCore payments — GA 2026-08, and it pays x402 sellers
**[SNIPPET]** https://aws.amazon.com/about-aws/whats-new/2026/08/bedrock-agentcore-payments-ga/ and
https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-payments-is-now-generally-available-enabling-agents-to-transact-safely-and-autonomously-at-scale/
(both **[BLOCKED]** to fetch; docs.aws.amazon.com is blocked too). GA announced August 2026:
AgentCore payments lets agents "autonomously discover, access, and pay for paid APIs, MCPs, and
content", integrating Coinbase and Stripe Privy wallets, with configurable spend limits.

**[RENDERED]** https://raw.githubusercontent.com/aws-samples/sample-agentic-serverless-payments/main/README.md
(AWS's own sample, fetched 2026-09-04) confirms the mechanism from the seller's side:
- the seller answers with **HTTP 402 carrying price in USDC, the seller `payTo` address, the
  facilitator URL and supported networks** — i.e. **plain x402**, no AWS-side seller account;
- sample runs on Base Sepolia (EIP-3009) and Solana Devnet (SPL);
- the buyer plugin calls AgentCore `ProcessPayment`, signs via the Token Vault, retries with a
  `PAYMENT-SIGNATURE` header, and the seller settles through the x402 facilitator;
- "no facilitator fees beyond on-chain settlement costs" in the sample's configuration.

**Why this matters more than the raw volume numbers:** it means the buyer side of x402 is being
wired into an *enterprise* runtime with budgets, rather than only into crypto-native agents
chasing a leaderboard. That is the first credible non-incentive demand channel I found. It is
also brand new (GA one month ago) with **zero public seller-revenue evidence**, so it is a
hypothesis with a named source, not a market.

### 4b. Coinbase Agentic.Market / x402 Bazaar — the discovery layer
**[SNIPPET]** (search 2026-09-04): to list, you supply your endpoint's **schema, price and
description**; agents then discover it. Commentary in the same results claims services
discoverable via Bazaar need "99.99%+ uptime" and that "sellers need VASP licensing, Travel Rule
compliance…" — that compliance sentence comes from vendor blogs (crossmint, cobo) discussing
**payment-service operators / facilitators**, not people selling an API for USDC, and I found no
Coinbase-owned text imposing KYC on a Bazaar listing. Treat as unresolved.
URLs to close: https://docs.x402.org/faq , https://x402.org/ ,
https://x.com/CoinbaseDev/status/1965445897489428869

### 4c. Virtuals Protocol ACP — a subsidy, not a market
**[SNIPPET]** (search 2026-09-04): Virtuals ACP is an on-chain marketplace where agents discover,
hire and pay each other; "as of February 12, 2026… over 18,000 agents"; **"up to $1 million per
month will be distributed to agents that sell services through the Agent Commerce Protocol"**;
public beta launched 3 July. URLs to close:
https://www.virtuals.io/ , https://whitepaper.virtuals.io/about-virtuals/agent-commerce-protocol-acp
(**[BLOCKED]**), https://www.prnewswire.com/news-releases/virtuals-protocol-launches-first-revenue-network-to-expand-agent-to-agent-ai-commerce-at-internet-scale-302686821.html

A programme that *distributes* $1M/month to sellers is an incentive pool. Combined with the
sibling finding that ~47% of x402 volume is leaderboard-driven and top sellers are largely
self-trading, building an agent whose income is that pool is subsidy farming, not honest value —
and it carries token-price exposure on top. **Do not build.** AMBER.

### 4d. Skyfire (KYAPay) — unresolved
**[SNIPPET]**: sell access to your LLM/dataset/API to agents and "receive payments directly
without requiring a bank account"; F5 partnership March 2026; "biggest use case is developer API
usage billing". No volume, no payout-country statement, no seller earnings anywhere in the
results. URLs to close: https://skyfire.xyz/product/ , https://kyapay.org/whitepaper

---

## 5. Picks-and-shovels: already commoditised
GitHub repo search (free, 2026-09-04) for "x402 facilitator" returns **345 repositories**, at
least 20 of them production-grade open-source facilitators (qntx/facilitator 151★,
Dhaiwat10/x402-sovereign, rawgroundbeef/OpenFacilitator "free forever", daydreamsai/facilitator,
OpenZeppelin relayer plugin, chain-specific ones for Stellar, Solana, Starknet, Hedera, Casper,
Stacks, Monero). "agentic commerce protocol" returns 369 repos including free ACP handlers from
Vercel and NVIDIA. Selling facilitator or protocol-adapter software into this is selling water by
a river. **Dead end.**

---

## 6. Time horizon, stated plainly
- **Today:** only x402 pays a software-only Israeli seller without a gate, and its honest dollar
  volume is small and mostly not organic.
- **~6-12 months:** AgentCore-style enterprise buyers are the thing to watch; if organic
  (non-incentive) x402 demand grows it will show up as enterprise agents paying data/inference
  APIs, not as retail checkout.
- **12+ months, and probably never for us:** the card rails (ACP/UCP/AP2/TAP/Agent Pay/MPP)
  require merchant-of-record status we have not established, and their flagship consumer product
  was withdrawn in March 2026.

## 7. What I would actually do with this (one line)
Nothing new. `products/x402-il-api` is already on the only reachable rail; the two cheap, honest
moves are (a) list it in the Bazaar with schema+price+description, and (b) run `x402-list-mcp`
locally so the colony measures facilitator volume instead of quoting snippets. Both are hours,
not days, and neither requires believing any of the numbers above.

## Searches run (6)
1. Virtuals Protocol Agent Commerce Protocol ACP agents hiring agents transaction volume 2026
2. Skyfire agent payments network 2026 adoption developers earning sellers
3. OpenAI Instant Checkout Agentic Commerce Protocol merchants live sales volume 2026 eligibility countries
4. Coinbase agent.market x402 marketplace sellers earnings 2026 Amazon Bedrock AgentCore payments availability
5. Nevermined Payman AI agent payments 2026 traction payout countries supported
6. x402 Bazaar list your service seller requirements KYC Coinbase Agentic Market discovery directory

## Blocked hosts this session
x402-list.com, whitepaper.virtuals.io, docs.aws.amazon.com, www.coinbase.com.
