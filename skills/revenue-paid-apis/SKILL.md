---
name: revenue-paid-apis
description: Playbook for paid developer APIs over x402 and an API marketplace (growth).
auto-activate: false
---

# Paid APIs — director playbook

Endpoints (start with what the Apify line already needs): Hebrew nikud/transliteration, RTL-correct PDF/image rendering, Israeli ID/bank/phone validators, Hebrew date conversion, structured extraction, PDF→Markdown.

Rails: x402 (USDC on Base) via the automaton's wallet — no human setup for receiving; the Coinbase CDP facilitator settles Base/Polygon/Arbitrum/Solana with 1,000 free settlements per month, then $0.001 each (billing since Feb 2026), so price each call above $0.002; register the endpoints on the agent card and in the x402 bazaar. Ready code: products/x402-il-api. Cross-list on an API marketplace (creator opens the provider account + PayPal payout once); free tier + metered PRO tiers.

Loop
1. One endpoint per iteration: OpenAPI spec, tests, p95 under 500 ms, clear error codes, rate limits.
2. Publish docs page + examples; tag every x402 receipt with [line:paid-apis] so the ledger sync picks it up.
3. Daily: calls, paying subscribers, x402 paid requests, error rate → revenue_kpi.
4. Improve the endpoint with the most free-tier usage; deprecate endpoints with zero paid calls after 60 days.

Reality: organic x402 volume is small in 2026 (top sellers earn a few thousand dollars a month at most); marketplace subscriptions are the steadier half. Keep this line cheap and shared-code with Apify.
