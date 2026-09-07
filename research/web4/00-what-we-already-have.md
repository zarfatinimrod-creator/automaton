# The Web4 stack this repo already implements

**Written 2026-09-03, from the code, not from the docs.** Every claim below was checked against a
file and a symbol. This is the baseline: before adopting anything from the agentic-web world, it
is worth knowing that most of its primitives are already here — and that the gap is not
capability, it is **discoverability**.

The repo's own one-paragraph summary of Web4 (`docs/INCOME_PLAN.he.md` §8) rests on an unverified
reading from a session where web4.ai was egress-blocked. A sibling file
(`01-web4-deep.md`) covers the external picture. This file covers ours.

## What is implemented, verified

| Web4 primitive | Where it lives | What exists |
|---|---|---|
| **Agent wallet** | `src/identity/wallet.ts` | EVM and Solana keypairs, `getWallet`, `walletExists`, `getWalletChainType`. The automaton holds its own keys. |
| **Machine payments, buy side** | `src/conway/x402.ts` | `x402Fetch`, `checkX402`, `getUsdcBalance`/`getUsdcBalanceDetailed` — it can pay a 402 challenge in USDC on Base and check its own balance first. Exposed to the agent as the `x402_fetch` tool. |
| **Machine payments, sell side** | `products/x402-il-api` | Six paid endpoints behind an x402 paywall, `.well-known/x402.json`, `payTo`, a facilitator hook, 15 tests. Verified live: an unpaid request returns a 402 challenge with the amount. |
| **Agent identity registry** | `src/registry/erc8004.ts` | ERC-8004 as real code: `registerAgent`, `updateAgentURI`, `queryAgent`, `hasRegisteredAgent`, `leaveFeedback`, plus `getTotalAgents` and `getRegisteredAgentsByEvents` — enumeration with a Transfer-event fallback for when `totalSupply` reverts. Agent tools: `register_erc8004`, `update_agent_card`, `discover_agents`. |
| **Agent-to-agent discovery** | same | `discoverAgents` with caching, sequential iteration when `totalSupply` works and event scanning when it does not. There is a dedicated test file for the ABI and enumeration paths. |
| **Reputation** | same | `leaveFeedback` — the ERC-8004 feedback path. |
| **Earning its own compute** | `src/conway/credits.ts`, `topup.ts` | Credit balance and USDC top-up: revenue in USDC can fund inference before any conversion to shekels. |
| **Self-replication** | `src/agent/tools.ts` | `spawn_child`, `fund_child` (guarded by `policy-rules/financial.ts` treasury limits). |

**So the "earn or die" architecture is not aspirational here.** Wallet, payments both directions,
on-chain identity, discovery, reputation, and self-funding compute are all present with tests.

## The one real gap: nobody can find us

The sell side is built and unreachable. `products/x402-il-api` has everything a buyer needs
*once it knows the URL* — and no path by which an agent would ever learn the URL. There is:

- no MCP transport, so no agent client can call it as a tool;
- no registration on any discovery surface (the CDP facilitator's Bazaar or equivalent);
- no listing in an MCP registry;
- and no free tier published anywhere a machine reads.

That is the difference between a shop with no sign and a shop with no stock. We have stock.

It matters more than it looks, because of the constraint in `MISSION.md`: stores multiply but
accounts do not. Discovery surfaces that need no account are the only ones that scale to the
hundreds of storefronts the final goal requires — and x402 needs no buyer account at all, which is
precisely why it was picked as the first line with a real product.

## What this baseline implies for the external research

Two questions are worth spending search budget on, and the rest is noise:

1. **Which discovery surface is real and reachable today**, and what exactly registration requires
   — because our problem is a missing sign, not a missing shop.
2. **Whether anything out there measurably pays**, as opposed to publishing a spec. Our own
   figure for the whole x402 protocol is about **$800k/day** ($24M over 30 days) at ~$0.32 average
   per payment, across ~22,000 sellers — a **mean of ~$1,090 per seller per month**, and far less
   for the median in a power-law market. (Corrected 2026-09-03: an earlier version of this file
   said $28k/day at $0.028, which was wrong by roughly 29x and 11x. See
   `research/colony-sweep/scouts/agent-markets--x402-economy.md`. The conclusion held; the number
   did not.) That per-seller figure is why `paid-apis` targets ₪1,200/month and not ₪10,000.
   Any claim of a large agent economy has to survive that number.

Everything else in the agentic-web space — new wallets, new identity schemes, new payment rails —
is a replacement for code we already have and tested, and adopting it would cost more than it
returns unless it comes with buyers attached.
