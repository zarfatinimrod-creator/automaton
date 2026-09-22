# Scout notes — agent-markets / agent-registries

Scout: WORKER-SCOUT "agent-registries", group `agent-markets`.
Date of research: **2026-09-03**.
Criterion: *ERC-8004, Virtuals, Olas, Fetch.ai and agent registries: distinguish real
recurring revenue from token speculation, and say plainly whether any of it pays rent.*

Search budget used: **8 / 8 WebSearch calls**. No searches were refused. Budget is now
exhausted; anything below marked [SNIPPET] could not be upgraded and anything I could not
source at all is reported as a dead end, not filled in from memory.

## Evidence strength key
- **[RENDERED]** — I fetched the page/file and read it.
- **[GH]** — GitHub code/repo search result, i.e. the platform's own repository text.
- **[SNIPPET]** — search-result snippet quoting a source I could not open. Weaker.
- **[BLOCKED]** — the egress proxy refused the fetch.

---

## 0. The headline answer

**No. As of 2026-09-03 none of this pays rent for a no-brand new entrant.**

The four things named in my criterion split cleanly into three buckets, and only one of
them is revenue at all:

| Thing | What it actually is | Pays an unknown newcomer? |
|---|---|---|
| ERC-8004 | An identity/reputation *standard*. Payments explicitly out of scope. | No revenue exists to earn |
| Olas Pearl staking | OLAS token emissions paid to operators who post an OLAS deposit | Not revenue — subsidised yield on capital at risk |
| Virtuals agent tokenization | A token launchpad | Speculation; excluded by our constitution |
| Olas Mech Marketplace / Virtuals ACP seller | Genuine pay-per-job micro-services, settled in crypto | Yes in principle, at cents per job, ceiling far below rent |

The honest summary is that this whole criterion is a **supply-side boom with almost no
identified demand**. The strongest single piece of evidence for that is section 1.

---

## 1. ERC-8004 — a standard, not an income line

**[RENDERED]** https://raw.githubusercontent.com/ethereum/ERCs/master/ERCS/erc-8004.md
(fetched 2026-09-03). Verbatim from the front-matter and body:
- `status: Draft`, `created: 2025-08-13`
- authors include Marco De Rossi (MetaMask), Davide Crapis (ethereum.org), Jordan Ellis
  (Google), Erik Reppel (Coinbase)
- three registries: **Identity** (ERC-721 handle + registration file), **Reputation**
  (feedback attestations), **Validation** (stake/zk/TEE re-execution hooks)
- **"Payments are orthogonal to this protocol and not covered here."**

So the standard itself defines no fee, no revenue share, and no buyer. Money, if any,
has to come from something built *on top* of it — which is x402, a criterion another
scout in this group already covered.

**[GH]** `mcp__github__search_code` on `repo:ethereum/ERCs` for "ERC-8004 registry"
returned 22 hits: erc-8041 (fixed-supply agent NFT collections), erc-8048 (metadata,
`x402` service type), erc-8122 (deployable non-singleton agent registries), erc-8126,
erc-8127, erc-8183, erc-8217, erc-8226, erc-8257 (tool identity), erc-8273, erc-8354
(confidential policy verdicts, with full Solidity assets). That is a dozen *derivative
draft standards* referencing 8004. It is intense spec activity. It is not a customer.

**Reference implementation [GH]:** https://github.com/ChaosChain/trustless-agents-erc-ri
— "Reference Implementation for ERC-8004", Solidity, 54 stars, 24 forks, 14 open issues,
last updated 2026-08-31. A second one at https://github.com/aadeexyz/erc-8004 (5 stars).

### The decisive number: registrations are mostly empty shells
**[SNIPPET]** — arxiv.org is **[BLOCKED]** by the egress proxy, so I have only the
snippets. Two 2026 papers measure the ecosystem:
- *From Agent Identity to Agent Economy: Measuring the Operational Readiness of ERC-8004
  AI Agents* — https://arxiv.org/html/2606.12128v1 — studies the first 10,000 agents on
  Ethereum mainnet, registered **2026-01-29 to 2026-04-09**; mainnet launch 2026-01-29
  with **"more than 45,000 agents already registered"**. Conclusion quoted in the
  snippet: adoption is **"registration-heavy but operationally shallow"**.
- *Can Trustless Agents Be Trusted? An Empirical Study of the ERC-8004 Decentralized AI
  Agent Ecosystem* — https://arxiv.org/abs/2606.26028 — snippet reports that
  **only 3% (Ethereum), 4% (BSC) and 15% (Base) of registered agents expose a valid
  registration file with at least one live service endpoint**, and that only 29.4% /
  83.4% / 26.9% respectively have a valid registration file at all.

**A human or unblocked agent must open https://arxiv.org/abs/2606.26028 and
https://arxiv.org/html/2606.12128v1 to close these two numbers.** They are the load-
bearing facts of this whole report: 97% of registered "agents" on Ethereum have no live
endpoint. Nobody is buying from a registry where 97% of the shop fronts are painted on.

**Verdict:** ERC-8004 is infrastructure worth *knowing*, worth zero to build *for*.
Registering our own agents there costs gas and buys nothing today.

---

## 2. Olas (Autonolas) — two very different things wearing one brand

### 2a. Pearl staking = token emissions, not revenue

**[GH]** `valory-xyz/olas-operate-app` — repo description is literally
*"Pearl - Run agents, stake & earn rewards\*"*, with the asterisk. The README itself
**[RENDERED]** (https://raw.githubusercontent.com/valory-xyz/olas-operate-app/main/README.md)
says only *"A cross-platform desktop application used to run autonomous agents powered by
Olas"* — the README does **not** carry the disclaimer the asterisk points to. The
disclaimer lives on the website.

**[GH]** `valory-xyz/olas-website`, `pages/disclaimer.tsx` — two clauses I read directly
in the code-search fragments:
> "…are provided by third parties under their own authorizations and terms. Availability
> of such services, and of individual product features, **may be restricted by
> jurisdiction**, including within the Union."
> "**Bonding and staking programmes.** Bonding programme availability varies and
> programmes may be closed at any time."

**[GH]** The mechanism is unambiguous in the contracts. `valory-xyz/autonolas-registries`,
`contracts/staking/StakingBase.sol`:
```
emissionsAmount = _stakingParams.rewardsPerSecond * _stakingParams.maxNumServices *
    _stakingParams.timeForEmissions;
```
Rewards are **emissions**, denominated in OLAS, funded by a `dispenserLimit`
(`valory-xyz/autonolas-staking-programmes/scripts/audit_staking_setups/audit_setup.js`
calls `checkEmissionsAmount(rewardsPerSecond, maxNumServices, timeForEmissions,
dispenserLimit, ...)`). The operator must first post `minStakingDeposit` — i.e. **buy
OLAS and lock it** — to occupy one of `maxNumServices` slots.

**[SNIPPET]** https://olas.network/blog/lower-emissions — a governance vote titled
"The Next Phase of Olas Staking" chose *"Projection A: High Staking Growth"* for the
emissions curve, passing "with 100% of votes in favor". Snippet also reports, as of
**2026-06-29**, **3,670 agents deployed, 614 daily active agents, 4.4M OLAS staked**.
Rewards "depend on agent activity and are not guaranteed" and are conditional on hitting
KPI targets.

**Verdict: this is not income, it is leveraged exposure to the OLAS token.** You buy the
token, lock it, run a computer, and are paid more of the same token out of a scheduled
emission that governance can and did re-shape. Under MISSION.md that fails twice: it
demands owner capital at risk, and its "revenue" is a projection in a volatile asset, not
a platform transaction from a buyer. I do not recommend it.

### 2b. Olas Mech Marketplace = real pay-per-job, but the cheque is cents

This is the one genuinely honest agent-to-agent market I found in this criterion. A
"mech" is an agent that performs a task on-chain for payment.

**[GH]** `valory-xyz/mech-server` — *"A CLI to create, deploy and manage Mechs — AI agents
that execute tasks on-chain for payment — on the Olas Marketplace."*

**[GH]** The default price is checked into the repo. `mech-server`,
`mtd/templates/runtime/config_mech_base.json` (and the identical `_gnosis`, `_polygon`,
`_optimism` variants):
```json
"name": "Mech request price",
"description": "The price for requesting the mech's services in wei.",
"value": "10000000000000000"
```
That is `1e16` wei = **0.01 of the chain's native token per request**. On Gnosis (xDAI)
that is roughly **$0.01 per job**. This is the strongest price evidence in this report
because it is the platform's own default config, not marketing.

**[RENDERED]** https://raw.githubusercontent.com/valory-xyz/mech-client/main/README.md —
payment methods supported are **native token, OLAS, USDC, and NVM subscriptions**, and
*"the payment type is determined by the mech's smart contract, not by the user"* — i.e.
each operator sets their own price. There is no platform-wide rate card.
**[GH]** `valory-xyz/mech-client/mech_client/services/marketplace_service.py` confirms the
settlement path: *"The marketplace pulls up to `max_delivery_rate * numRequests` from the
requester via `BalanceTracker.checkAndRecordDeliveryRates`."*

**[SNIPPET]** https://olas.network/blog/olas-launches-the-mech-marketplace-the-ai-agent-bazaar
— "over 4 million agent transactions, including 2m+ agent-to-agent transactions". A
third-party page (synthesis.mandate.md) quotes a "25K–200K wei per request" fee band;
**that contradicts the 1e16 default in the repo and I do not trust it** — 200,000 wei is
economically zero. I am reporting the repo value and flagging the discrepancy.

**Who the buyer is — and this matters:** the dominant mech customers are Olas's own
prediction-market agents. `valory-xyz/trader` ("AI agent for trading on prediction
markets… Omen on Gnosis and Polymarket on Polygon", 77 stars) and `valory-xyz/mech-interact`
are the demand side. So demand is **endogenous**: agents subsidised by OLAS emissions are
buying from mechs. If emissions fall, demand falls. That is the single most important
structural fact about "Olas revenue".

**Honest ceiling:** at ~$0.01/job, ~500 daily-active agents ecosystem-wide, and a new
unknown mech competing against incumbents, a realistic capture is a few hundred jobs a
day at best after a long ramp. Call it **₪0–400/month**, and ₪0 is the modal outcome.

---

## 3. Virtuals Protocol — the biggest numbers, and the biggest asterisk

### 3a. ACP (Agent Commerce Protocol) selling — real USDC, real escrow
**[RENDERED]** https://raw.githubusercontent.com/Virtual-Protocol/acp-cli/main/README.md
(fetched 2026-09-03). The seller path is short and concrete:
```
npm i -g @virtuals-protocol/acp-cli
acp configure
acp agent create          # creates an EVM wallet
acp agent add-signer      # OS-keychain signer for on-chain txs
acp offering create --name "Logo Design" --price-type fixed \
    --price-value 5.00 --sla-minutes 60
acp subscription create --name "Pro Monthly" --price 50 --duration-days 30
```
Jobs are **USDC-escrowed**; the provider is paid on completion. Tokenization is a separate,
optional command (`acp agent tokenize`). The README states **no registration fee and no
listing fee**, and I could find none.

**Gate found [GH]:** `Virtual-Protocol/acp-python` README — *"2. Create Smart Wallet and
Whitelist Dev Wallet"*, and the client is constructed with
`wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY`. Its examples add: *"Ensure both
agents are registered and **whitelisted** on the ACP platform."* The examples also
reference *"the difference between graduated and pre-graduated agents"*. So there is a
whitelisting step and a two-tier agent status. The tutorial behind it lives at
whitepaper.virtuals.io, which I could not fetch.
**To close: https://whitepaper.virtuals.io/info-hub/builders-hub/agent-commerce-protocol-acp-builder-guide/acp-tech-playbook**
— specifically whether whitelisting is automatic/self-serve or requires a human approval,
and what "graduated" requires. If it requires a human conversation or a token launch, the
line dies on MISSION.md's owner-does-nothing rule.

**Scale claims [SNIPPET], all from press coverage of one February 2026 announcement:**
- Virtuals Revenue Network launched at Consensus Hong Kong, Feb 2026; *"over 18,000
  agents"*; **"up to $1 million per month is distributed to agents that sell services
  through ACP"**.
  https://www.prnewswire.com/news-releases/virtuals-protocol-launches-first-revenue-network-to-expand-agent-to-agent-ai-commerce-at-internet-scale-302686821.html
- *"$59M in 12-month revenue across multiple fee streams"*, *"$39.614M revenue since
  October 2024"*, *"average daily fees around $170K"* —
  https://messari.io/report/understanding-virtuals-protocol-a-comprehensive-overview
- ACP integrated with Arbitrum 2026-03-24.

**Read the $1M/month carefully.** "Distributed to agents that sell services" is a
*protocol distribution* — a subsidy program announced in a launch press release — not
proof that end buyers paid $1M for work. Divided across 18,000 agents it is ~$55/agent/
month even if fully paid out and evenly split, which it will not be. Virtuals' own $59M
"revenue" is overwhelmingly **launchpad and trading fees**, i.e. token speculation
revenue accruing to the protocol, not service revenue accruing to a seller. The fee split
described in **[SNIPPET]** whitepaper coverage — *"30% is used to purchase and burn the
agent seller's token, while 60% is returned to the agent's wallet"* — is itself a
tokenomics loop: 30% of what a seller earns is spent buying its own token.

**Supply-side signal [GH]:** a repo search for Virtuals ACP seller agents returns a long
tail of **zero-star, single-commit repos** created through 2026 — `moonshot-cyber/virtuals-acp`,
`squidlor/squidlor-virtuals-acp`, `singgihgunawan/acp-yield-agent`, `shawnhvac/agentstore-acp`,
`polyagentbot/tokenomics-health-agent`, `devclone20/{doctorwho,matrix,supersayatin}`,
`AzouO/MY-AGENT-Azou`, `Saber1Y/ACP-Seller-Agent-for-ZK-Attested-Verification---Virtuals`,
`jhlosin/catalyst-orchestrator`. Dozens of sellers, no visible buyers. That is exactly the
shape of a market where the subsidy, not the demand, is what people showed up for.

### 3b. Agent tokenization / launchpad — excluded
`acp agent tokenize`, the Virtuals Launchpad, pairing an agent with $VIRTUAL liquidity,
sellers who *"earn from trading fees… and their token gains value as the agent's
capabilities grow"* **[SNIPPET]** https://whitepaper.virtuals.io/about-virtuals/tokenization/agent-tokenization-platform.
This is issuing a tradable token to speculators. For an Israeli resident it raises
securities and ISA questions that MISSION.md forbids us to hand-wave, and it is not
"honest value to a nameable buyer" — the money comes from the next buyer of the token.
**RED under our constitution. Do not build.**

---

## 4. Fetch.ai / ASI Alliance — huge registry, no legible payout to a builder

**[GH]** `fetchai/agentverse` (26 stars, 69 open issues, last updated 2026-08-10),
`fetchai/avctl`, `fetchai/innovation-lab-examples` (1,144 stars — the popular repo is the
*examples*, i.e. developer-side, not buyer-side), `fetchai/agentverse-skills` (created
2026-04-20, 2 stars).

**[SNIPPET]** https://docs.agentverse.ai/documentation/getting-started/overview and
coverage: **"more than 2.7 million AI agents are registered on Agentverse"**; developers
*"can offer paid access through tags, subscriptions, or deep links"* and agents are
*"ready for discovery, feedback, and **future** monetization"* — the word "future" is the
tell. The concrete 2026 launch is **Agent Launch (May 2026, BNB Chain)**, which
*"allows AI agents to autonomously create and trade their own tokens… no human founder
required"* — https://invezz.com/news/2026/05/20/fetch-ai-launches-platform-that-gives-ai-agents-their-own-economy/.
So Fetch.ai's headline 2026 monetization story is, again, **token issuance**.

2.7M registered agents with no documented per-call payout rail is the same pathology as
ERC-8004's 45,000: registration is free, so registration is meaningless.

**To close: https://docs.agentverse.ai/documentation/getting-started/overview** — whether
a paid subscription on Agentverse settles in fiat, FET, or nothing at all, and what the
platform's cut is. I could not open it.

---

## 5. Payability to Israel

Every line in this criterion settles **on-chain to a self-custodied EVM wallet**: USDC on
Base/Arbitrum (Virtuals ACP), native token / OLAS / USDC on Gnosis, Base, Polygon,
Optimism (Olas mechs), FET/BNB (Fetch.ai). None of them runs a fiat payout rail, none of
them asked for a bank account, and I found **no country restriction naming Israel** — a
code search for OFAC/restricted-countries text across `fetchai` returned zero hits, and
the only jurisdiction language I found anywhere (Olas's `disclaimer.tsx`) is a generic
"may be restricted by jurisdiction, including within the Union" with no country list.

So: **payable to a wallet — YES. Payable as ILS in a bank account — that is a separate
rail we do not own here.** Turning USDC into shekels requires an Israeli exchange or
off-ramp with KYC on the owner, which is exactly the one-time identity step MISSION.md
permits, but it is a real owner blocker and it is *not already done*. It also creates an
Israeli crypto-tax reporting obligation on every disposal. I am marking these UNKNOWN
rather than YES where the last mile is unproven, and the honest statement is: **the money
would arrive, in a currency the owner then has to convert himself.**

---

## 6. Dead ends (things I checked and found genuinely empty)

1. **ERC-8004 as a revenue line.** No fee mechanism exists in the standard by design; 97%
   of Ethereum registrations have no live endpoint. There is nothing to earn.
2. **"Sell agent-registry liveness/verification monitoring."** Tempting adjacency — the
   8004 papers show the data gap, and `nexus-mcp-infra/erc8004-agent-liveness` already
   exists as an MCP server — but I could not name a single buyer who pays for it. Under
   rule 5 that is not a finding, it is a guess.
3. **Olas Pearl staking as income.** It is emissions on posted collateral. Not revenue.
4. **Virtuals / Fetch.ai agent tokenization.** Token issuance to speculators. Excluded by
   the constitution before economics are even discussed.
5. **Per-seller earnings data, anywhere in this criterion.** Not one platform publishes
   what a median seller earns. Every figure available is a protocol-level aggregate or a
   launch press release. I could not find a single verified "an unknown developer earned
   $X/month here" datapoint across Virtuals, Olas or Fetch.ai. That absence is itself the
   finding.
6. **arxiv.org, whitepaper.virtuals.io, docs.agentverse.ai, olas.network** — all
   unfetchable from this container. The three URLs a human must open are listed inline
   above (§1, §3a, §4).

---

## 7. What I would tell the board in one line

The agent-registry economy in September 2026 is a **subsidised bazaar**: Virtuals pays up
to $1M/month *out of protocol funds* to get sellers to show up, Olas pays OLAS emissions
to get operators to show up, Fetch.ai and ERC-8004 have millions of free registrations and
no payment rail, and in all four the money that visibly moves is launchpad and trading
fees. The one honest micro-market — Olas mechs at ~$0.01/job — is real, legal and
buildable, and would not pay a fifth of the owner's rent even if we won it. **Recommend:
build nothing here. Revisit only if a platform publishes verified per-seller payouts.**
