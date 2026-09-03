# Web 4.0, researched — what is real, what we can use, what to ignore

**Researched 2026-09-03.** The owner sent https://web4.ai/ and asked us to research it heavily,
use it where useful, and learn from it. Companion file: `00-what-we-already-have.md`, the
code-verified inventory of the Web4 primitives this repo already implements.

**Evidence note.** I verified myself that **web4.ai is egress-blocked** from this container — not
inherited from an earlier session's note, re-tested today. So nothing below comes from that site.
What follows comes from three sources that *are* reachable and are better anyway: our own
`package.json`, the upstream GitHub repository, and upstream's own documentation. Where a claim
came from a summarised fetch rather than a line I read, it says so.

---

## Verdict box

| Question | Answer |
|---|---|
| Is Web4 real, for us? | **Yes, and it is already built into this repo.** Wallet, x402 both directions, ERC-8004 identity, discovery, reputation, self-funded compute — all present with tests. See the companion file. |
| Are we behind upstream? | **No.** Upstream `Conway-Research/automaton` is at **0.2.1** and so are we, with the same scripts and dependencies. We have missed no Web4 feature. |
| What can we use this week, at zero cost and no KYC? | **Publish our skills for other automatons to install.** Skills are permissionless: any public git repo or raw URL is a distribution channel, and ours is already public and MIT. |
| What is the real blocker? | Discoverability, not capability. And a **treasury policy** that permits x402 payments only to `conway.tech`. |
| What should we ignore? | Anything asking us to replace a wallet, identity scheme or payment rail we already have and tested, unless it arrives with buyers attached. |

---

## 1. Who Conway Research is, and our relationship to it

First-party, from our own `package.json`:

```
name: "@conway/automaton"      version: "0.2.1"
description: "Conway Automaton - Sovereign AI Agent Runtime"
homepage: "https://conway.tech"
repository: "https://github.com/Conway-Research/automaton.git"
keywords: ["autonomous-agent", "sovereign-ai", "web4", "conway", "self-replicating"]
```

**This repository is a fork of `Conway-Research/automaton`** — 6.1k stars, 1.4k forks, MIT. So
"Web4" here is not an outside ecosystem we might join; it is the name of the project whose runtime
we are running on. web4.ai is its vision site; conway.tech is the product; `api.conway.tech` is
the API our `src/identity/provision.ts` already calls.

Upstream's own framing, quoted from its README: *"The first AI that can earn its own existence,
replicate, and evolve — without needing a human."* And from its constitution: *"Law II: Earn your
existence. Create genuine value. Never spam, scam, exploit, or extract."* That law and this repo's
`MISSION.md` constitution say the same thing, which is worth knowing — our honest-value rule is
not a local invention, it is the platform's.

**We are at version parity with upstream.** That is the single most useful thing I checked,
because the obvious risk of a fork is missing the primitives you most need, and we are not.

## 2. What the platform actually offers an agent

From upstream's `DOCUMENTATION.md` (summarised fetch, quotes as reproduced):

| Surface | What it is | Concrete terms found |
|---|---|---|
| **Conway Cloud** | Linux VMs, frontier models, domain registration, stablecoin transactions | Credit topups at $5 / $25 / $100 / $500 / $1,000 / $2,500; a sandbox "requires ~$5"; example model price "gpt-5.2 … $1.75/M input tokens"; domains cost "USDC via x402", price unlisted |
| **Skills** | Markdown capability files at `~/.automaton/skills/<name>/SKILL.md` | Installable "from git … and a repo URL", "from URL … and a SKILL.md URL", or self-authored. **No central repository — permissionless** |
| **ERC-8004** | On-chain agent identity on Base, with an "agent card" (JSON-LD: name, description, address, capabilities, contact) and 1-5 reputation feedback | `register_erc8004`, `update_agent_card`, `discover_agents` — all already implemented here |
| **x402** | Gasless HTTP 402 payments in USDC; retries with an `X-Payment` header, settled via a facilitator | Default per-payment cap `maxX402PaymentCents: 100` ($1) |

**The important absence:** upstream's docs describe registration, discovery and reputation, but
**do not describe how an agent lists a priced service for other agents to buy.** ERC-8004 gives
you identity and a capabilities field; it is not a catalogue with prices. So the discovery gap
identified in the companion file is not our oversight — it is a gap in the layer itself, and the
agent card's `capabilities` field is the only place we could put a price list today.

## 3. Two constraints in our own code that change the plans

**`x402AllowedDomains: ['conway.tech']`** — `src/types.ts:591`, enforced by
`src/agent/policy-rules/financial.ts` at priority 500 on the `x402_fetch` tool, which denies
outright when the allowlist is empty.

This matters because a queued idea (from the AI-tooling research) was: let our workers run Apify
Actors by paying USDC over x402, since Apify put 20,000+ Actors behind x402 with no account
required — estimated at ~3 hours of wiring. **Our own treasury policy would deny every one of
those calls.** It is not a wiring task; it requires deliberately widening what the agent may pay,
which is a treasury decision with a blast radius far beyond Apify: an allowlist of one domain is
exactly why a prompt-injected "pay this invoice" cannot drain the wallet. The default is correct
and the change needs its own argument, not a footnote in a build ticket.

**`maxX402PaymentCents: 100`** — a $1 ceiling per payment. Fine for per-call API purchases,
and worth knowing before anyone designs a flow that needs a single larger payment.

## 4. What to use, in order

**Now, zero cost, no KYC, no wallet needed — publish our skills.** Skills install from any public
git repo or raw URL. Our repo is public and MIT and already contains eleven
`skills/revenue-*/SKILL.md` playbooks plus `skills/revenue-criteria-sweep`. Any of the 1.4k forks
of upstream can install them today; none of them know that. An index naming each skill and the
exact `install_skill` invocation costs nothing and is the only distribution surface available to
us that requires no account, no gas and no owner action. It is also the honest kind of
distribution: we are giving away playbooks, and the ones with real evidence behind them are worth
having.

**When the automaton is provisioned — put the price list in the agent card.** We already have
`update_agent_card`. The card's `capabilities` field is the only machine-readable place to publish
what `products/x402-il-api` sells and for how much, so that `discover_agents` surfaces a priced
service rather than a bare identity. Blocked on a funded wallet (registration costs gas), so it is
queued rather than pending — and that is a real block, not a missing decision.

**Not now — widening the x402 allowlist.** Needs the argument in §3 made properly, with the
treasury limits reviewed together.

## 5. What Web4 gets right that we should keep, and what to avoid

**Keep:** the survival framing. "Earn your existence" is upstream's Law II and it is the reason
this repo has a ledger where money counts only with a transaction id rather than a dashboard of
projections. The platform's own constitution forbids spam and extraction, which means our
honest-value rule is enforced from two directions.

**Avoid:** the field's standard failure, which is publishing a protocol and calling it an economy.
Our own measured figure — order of $28k/day across the entire x402 protocol at a median clearing
price near $0.028 per call — is the number any claim about a large agent economy has to survive.
It is why `paid-apis` targets ₪1,200/month rather than ₪10,000, and why the final goal's arithmetic
rests on hundreds of small storefronts rather than on one machine-to-machine bonanza.

**And avoid the fork trap.** The temptation with a 6.1k-star upstream is to keep merging its
features and call that progress. We are at parity, none of its primitives are missing, and none of
them earn a shekel by themselves. The gap between this repo and revenue is not upstream code — it
is eight one-time registrations the owner has not done, and a search space that is 29/112 swept.
