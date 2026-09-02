---
name: revenue-agent-services
description: Playbook for zero-KYC x402 services sold to other agents (experimental).
auto-activate: false
---

# Agent services — director playbook

The only line with no human setup: services are paid in USDC to the automaton's own wallet. Demand today is thin and volatile, so this line runs on a small budget and exists to be discoverable when agent demand grows.

Offer: structured extraction (HTML/PDF → JSON), Hebrew↔English translation, JSON repair, agent-card verification, pay-per-prompt inference resale at a thin margin.

Loop
1. Ship one endpoint with x402 pricing in cents; add it to the agent card (update_agent_card) and any registry the runtime supports.
2. Tag inbound payments with [line:agent-services]; the hourly ledger sync records them.
3. Daily KPIs: paid requests, unique paying agents, USDC received, p95 latency.
4. Add the endpoint agents ask for most; remove endpoints with no paid calls in 60 days.

Off-ramp: converting USDC to ILS needs the creator's one-time Israeli exchange account; until then earnings stay as USDC that also pays for the automaton's own compute.
