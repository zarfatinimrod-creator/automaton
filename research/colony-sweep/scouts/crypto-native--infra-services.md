# Scout notes — crypto-native / infra-services

**Criterion:** Running paid infrastructure (RPC, indexing, data availability, oracles):
capital and ops cost, competition, and whether it can run unattended.

**Scout:** WORKER-SCOUT `infra-services`, group `crypto-native`.
**Date of research:** 2026-09-03. **Web searches spent:** 6 of an 8 allowance.
**Evidence policy:** every number below is either (S) a rendered primary source, (R) a
rendered secondary/third-party repo, or (N) a search snippet quoting a page I did not
render. Nothing here comes from memory.

---

## Headline

The criterion is, with one narrow exception, **empty**. Every established paid-infrastructure
role in crypto is either (a) capital-gated far beyond what this colony has, (b) priced below
its own hardware cost by well-funded incumbents giving the service away, or (c) permissioned
through human relationships the owner will not have. The one genuinely open door — The Graph's
new Horizon "data services", where the provider floor is 0–555 GRT and there are literally no
competing providers — is open precisely because **nobody is paying on the other side of it yet**.
Zero competition and zero demand are the same fact seen from two ends.

---

## Sources actually opened

### Primary (rendered)

1. `https://raw.githubusercontent.com/pokt-network/poktroll/main/docs/settlement_budget_redistribution_spec.md`
   — POKT Network's own protocol repo (Shannon). Rendered 2026-09-03. Verbatim findings:
   - "**183 owners running 4,228 operator addresses at a median of 1.01× min_stake**" on mainnet.
     Nobody stakes above the minimum because staking more is strictly dominated under the
     head-split model.
   - Session 834100 on the `poly` service: nodefleet.net held 26 of 50 slots (52%),
     easy2stake.com 14 (28%), rpcgate.xyz 5 (10%), kalorius.tech 2 (4%), spacebelt.xyz 2 (4%).
   - In that same session kalorius "**achieved 92.8% of relays**" while holding 4% of slots,
     and was paid "**454 POKT / Mrelay**" against "**2,885 POKT / Mrelay**" for others —
     roughly **6.4× less pay for the same unit of work**.
   - Aggregate: kalorius "**claimed 2,982 POKT and was paid 470**" in one settlement.
   - Post N=60→N=20 flip: unpaid work = "**31.1%**" of claimed value, "**97.6 POKT**" per block
     unpaid; over 12 consecutive settlements the network **claimed 323.50 POKT/block and settled
     219.75**, i.e. **103.75 POKT/block (~51.5M POKT/yr) of relay work delivered and never paid for**.
   This is the single most important document I found. It is the protocol's own engineers
   documenting that on POKT the *work you do* and the *money you get* are decoupled, and that
   the party doing 93% of the work is the party eating 100% of the loss.

2. GitHub code search (MCP `search_code`, no search-budget cost) over `graphprotocol/docs`:
   - `website/src/pages/en/resources/tokenomics.mdx`: "In order to run an indexing node,
     Indexers must self-stake **100,000 GRT** or more with the network."
   - `website/src/pages/en/resources/glossary.mdx`: "The minimum is 100,000 GRT, and there is
     no upper limit."
   - `website/src/pages/en/gateways/subgraphs/components/indexer-selection.mdx`: gateway
     selection scores "Slashable GRT ... around 0.8 at the 100,000 GRT minimum stake" — i.e.
     a minimum-stake indexer is *structurally* ranked below larger ones for query routing.
   - `edgeandnode/candidate-selection` `indexer-selection/src/lib.rs`: the same constant in
     code — "Currently setting a minimum score of ~0.8 at the minimum stake requirement of
     100,000 GRT."
   - Hardware from a community mirror of The Graph's own guidance (GRTDataHub chatbot content,
     quoting thegraph.com/blog/how-to-become-indexer): "many Indexers often start with a setup
     of **16 CPUs, a 1 TB disk, and 32 GB of RAM**", plus PostgreSQL, graph-node, indexer-agent,
     indexer-service, Prometheus.

3. `pokt-network/pocket-core` `doc/guides/quickstart.md` — legacy Morse minimum stake
   "`15,000 POKT` or `15,000,000,000 uPOKT`". (Superseded by Shannon; kept for context.)

4. `pokt-network/poktroll` `proto/pocket/supplier/params.proto` and
   `tools/scripts/params/params_templates/supplier_min_stake.json` — supplier `min_stake` is a
   governance parameter, template value `1000000 upokt` (= 1 POKT). Note: template ≠ live
   mainnet value; `docs/bug_min_stake_default.md` in the same repo says the *application*
   min_stake is "currently 1,000 POKT on mainnet". **The live supplier min_stake in POKT terms
   is a number I did not close.** To close it, a human should query
   `pocketd query supplier params` or open `https://docs.pokt.network` (egress-blocked here).

### Secondary (rendered, third-party operator's repo)

5. `https://raw.githubusercontent.com/nightswatchhq/lodestar/main/docs/becoming-an-operator.md`
   and `.../src/data/data-services.ts` — an independent operator's site that reads The Graph
   Horizon `ProvisionManager` contracts on Arbitrum One. Rendered 2026-09-03. Values stated
   "as of 2026-08-30". **This is a third party's reading of on-chain state, not The Graph's own
   docs — treat as strong-but-unaudited.** Findings:

   | Data service | Min provision | Thawing | Providers today |
   |---|---|---|---|
   | Subgraph Service | 100,000 GRT | 28 days | "99 Indexers held allocated stake and 65 were actively serving queries as of end-Q3 2025" |
   | Dispatch (decentralized JSON-RPC) | **555 GRT** | 14–28 d | "**Nobody is serving it**" — contract live, self-run gateway **retired 2026-07-20** |
   | Seahorn (Solana structured data) | **555 GRT** | 14–28 d | **none** |
   | Mainline (Firehose block streams) | none set | 21–28 d | one self-run operator, "unaudited" |
   | Nuthatch | **0 GRT service floor** | 14 d | one self-run provider; consumer signing "currently allowlisted for the beta" |
   | SDSCE (Substreams CE) | **0 GRT (soft launch)** | 14 d | "Single self-run provider", "unaudited" |

   Payment on all of them: GraphTally / RecurringCollector micropayments, with a 1–2% data
   service cut (1% burn + 1% retained). Dispatch pays "per request"; Mainline "per streamed
   gigabyte and per Fetch request".

   The operator's own commentary is worth quoting because it names the trap: "100,000 GRT is
   what it takes to be an indexer, everybody knows it, and it is not what these ask ... That is
   a difference of about a hundred and eighty times, and it was on chain the whole time nobody
   was running these."

   **URL a human should open to verify independently:** the Arbitrum One `ProvisionManager` /
   `HorizonStaking` contracts on Arbiscan, and `https://thegraph.com/docs/en/indexing/` (both
   egress-blocked from this container).

6. `Rotwang9000/OnChainRPC` README (rendered via search_code snippet, (R)): "Pocket Network
   (POKT): Requires ~15,000 POKT stake (~$600–$1,500 USD) ... **Lava Network: High stake
   (50,000 LAVA per chain, ~$7,500+ USD)** ... dRPC: Form-based approval; vague on provider
   earnings." Third-party summary, **not** confirmed against Lava's own docs. Marked low
   confidence; a human should open `https://docs.lavanet.xyz` to close it.

### Search snippets only (weakest tier — I did not render these pages)

7. (N) **The Graph network revenue.** Messari "State of The Graph Q2 2025"
   (`https://messari.io/report/state-of-the-graph-q2-2025`), via snippet: "In Q2 2025, total
   usage-based revenue rose 6.4% quarter-over-quarter to **$128,862**." Same search reported
   Q4 2025 subgraph query fees "declined 8.7% quarter-over-quarter" while Substreams revenue
   "4x quarter-over-quarter growth to 6.08 million GRT".
   **The arithmetic that kills the line:** $128,862 per *quarter* is ~$43,000/month for the
   entire network. Split across the 65 indexers actually serving queries that is **~$660/month
   gross per indexer, before hardware, before the 100,000 GRT of locked capital.**
   Snippet-grade. A human must open the Messari report to confirm the $128,862 figure and
   whether it is query fees only or includes indexing rewards.

8. (N) **RPC market floor.** Searched 2026-09-03. Alchemy free tier is "**30M compute units per
   month, roughly 1.15M eth_call requests**", handling "around 300 RPS". Enterprise floor:
   "even for the heaviest RPC users in the world, prices typically don't go below **$2–3 per
   million API Credits**". Credit units are deliberately non-comparable across vendors (one
   eth_call = 1 credit on Dwellir, 20 QuickNode, 26 Alchemy, 80 Infura, 200 Ankr).
   Sources listed: `https://www.dwellir.com/blog/best-ethereum-rpc-providers`,
   `https://chainstack.com/alchemy-rpc-provider-overview-2026/`,
   `https://www.quicknode.com/blog/best-ethereum-rpc-providers-2026-a-full-comparison`.
   All snippet-grade; all vendor-published and therefore self-interested.

9. (N) **Hardware cost.** Searched 2026-09-03. Solana bare metal "**$800–1,200 per month**";
   RPC config with 256–512 GB ECC RAM + NVMe "$500–$1,500+/month"; a turnkey Solana dedicated
   RPC node "from **$999/month**"; archive RPC in 2026 needs "**10+ TB of NVMe**"; bandwidth
   "$200–$500 monthly" on top. Sources listed: `https://www.cherryservers.com/blog/solana-node-cost`,
   `https://bmcservers.com/solana-rpc-node-2026`, `https://argusnodes.com/chains/solana`.
   Snippet-grade.

10. (N) **Chainlink oracles.** Searched 2026-09-03. chain.link's own blog, via snippet: "The
    Chainlink Network is permissionless to run an oracle on, but **each oracle network can
    restrict the individual oracles allowed to contribute**" and "No LINK is required in order
    to be a node operator, however, holding LINK on your node ... helps with ranking".
    Sources listed: `https://blog.chain.link/what-is-a-chainlink-node-operator/`,
    `https://docs.chain.link/chainlink-nodes/v1/running-a-chainlink-node`.
    Snippet-grade. The operative clause is the restriction one: getting into a *paying* feed is
    a business-development act, not a deployment act.

11. (N) **Celestia / data availability.** Searched 2026-09-03. Snippet, of a light node: "the
    node **does not pay out any TIA rewards** and does not require staking or other upfront
    investments." Incentivised-testnet rewards (54,000–108,000 TIA) were historical and are over.
    Sources listed: `https://stride.zone/blog/celestia-light-node-challenge`,
    `https://medium.com/@breizh-node/...`. Snippet-grade but unambiguous: DA light nodes are
    not an income line at all.

12. (N) **Israel payability.** Searched 2026-09-03. Bits of Gold (Tel Aviv) "received a Capital
    Markets Authority license in 2022" and on **2026-04-27** was authorised to issue BILS, a
    shekel-pegged stablecoin, explicitly "for use in foreign exchange transactions against major
    stablecoins such as USDC", with "a working KYC pipeline".
    Sources listed: `https://www.coindesk.com/policy/2026/04/28/a-digital-shekel-is-here-israel-approves-its-first-ever-regulated-stablecoin`,
    `https://blockeden.xyz/blog/2026/04/29/israel-bils-shekel-stablecoin-solana-bits-of-gold/`.
    Snippet-grade. Practical reading: **on-chain earnings are receivable by an Israeli with no
    permission from anyone (a wallet is a wallet), and there is a licensed domestic off-ramp to
    a shekel bank account.** The gate is one-time human KYC at the exchange, which MISSION.md
    permits as an unavoidable identity step.

---

## Verdicts, line by line

### 1. The Graph — Subgraph Service indexer. DEAD (capital + unit economics).
Capital: 100,000 GRT locked, 28-day thaw. Ops: 16 CPU / 32 GB / 1 TB minimum, graph-node +
Postgres + indexer-agent + indexer-service + tap-agent, plus an archive node per chain indexed.
Competition: 99 indexers, 65 serving (end-Q3 2025) — not many, but the network's whole
usage-based revenue was ~$43k/month (Q2 2025), and a minimum-stake indexer is explicitly scored
~0.8 by the gateway *because* it is at the minimum. So the new entrant buys the worst routing
weight in a pool paying ~$660/indexer/month gross against $500–1,500/month of hardware.
Unattended: mostly yes, but POI submission, allocation management and chain re-syncs are real
operational duties with slashing attached. **Honest ceiling: negative.**

### 2. POKT Shannon supplier (decentralised RPC relays). DEAD (rewards decoupled from work).
The stake bar is low and this is the part that tempts people. The protocol's own spec is the
refutation: 4,228 operator addresses already exist, session slots are captured by a handful of
established names, and the entity that served 92.8% of relays was paid 6.4× less per relay than
slot-holders who served almost none. 31.1% of claimed work goes unpaid network-wide. A new
supplier is by construction the low-slot party — i.e. the party the spec shows losing.
Unattended: yes, technically. **Honest ceiling: ~₪0, plausibly negative after hardware.**

### 3. The Graph Horizon minor data services (Dispatch / SDSCE / Nuthatch / Mainline / Seahorn).
**THE ONLY OPEN DOOR — and it is open because the room is empty.**
Provider floor 0–555 GRT (≈180× cheaper than the indexer bar), 14-day thaw, no whitelist, paid
per request / per streamed GB through GraphTally micropayments. Zero or one provider on each.
But: Dispatch's own gateway was *retired* on 2026-07-20, Seahorn has no endpoint at all, and
Nuthatch's consumers are "allowlisted for the beta". There is no measured revenue on any of them
and I found no evidence of a paying consumer. This is a **cheap option, not an income line**:
worth a bounded experiment only if the colony can find a consumer first, which is the exact
thing it has no evidence for. **Honest ceiling today: ₪0.** Kill criterion should be written as
"no paid collect() from a third-party consumer within 30 days".

### 4. Self-hosted RPC resale (own bare metal, sell endpoints direct). DEAD (undercut by free).
Alchemy gives away 30M CU/month — enough for most small projects to never pay anybody. The
enterprise floor is $2–3 per million credits. Our cost floor is $500–1,500/month per Solana box
plus $200–500 bandwidth. A no-brand entrant with no SOC 2 (QuickNode holds SOC 1 Type II, SOC 2
Type II and ISO 27001, recertified Q1 2026) competes on price against companies whose free tier
is larger than our paid tier could be. **Honest ceiling: negative.**

### 5. Chainlink node operator / oracle provision. DEAD for this owner (permissioned in practice).
Running the software is permissionless; being *paid* requires being admitted to a specific
oracle network, and each network restricts which oracles may contribute. Admission is a
relationship. MISSION.md says the owner does not talk to people, and an agent cannot honestly
impersonate one in a partner conversation. **Honest ceiling: ₪0. Not a build.**

### 6. Data availability (Celestia light node). DEAD (pays nothing, by design).
Light nodes receive no TIA. The incentivised testnet that made people rich is over. Validator
economics are a staking line, not an infrastructure-services line, and belong to a different
criterion. **Honest ceiling: ₪0.**

### 7. Lava Network provider. UNRESOLVED, probably dead.
One third-party README puts the bar at 50,000 LAVA per chain (~$7,500+). Not confirmed against
Lava's own docs, which are egress-blocked. Flagging as low confidence rather than asserting it.

---

## What this means for the colony

Do not build in this criterion. The pattern across all six lines is the same and it is worth
naming, because it will recur: **paid crypto infrastructure sells a commodity into a market where
the marginal price is set either by a venture-subsidised free tier or by a token emission, and in
both cases the price is below the operator's hardware cost.** The operator's margin is not
squeezed, it is inverted. The only participants who profit are those with either (a) enormous
locked capital that earns emissions regardless of work, or (b) a slot position captured before we
arrived. Neither is available to a software-only operation starting today.

The adjacent thing that *does* work is the shape we already shipped in `products/x402-il-api`:
sell a narrow, differentiated dataset over a paid API on our own terms, with no protocol staking,
no slot lottery and no emission dependence. That is not "running infrastructure"; it is selling a
product that happens to be delivered over HTTP. It belongs in a different criterion and I am not
claiming it here.

## Honest limits of this sweep

- 6 web searches of an 8 allowance; no search was refused.
- Four of the twelve sources are snippet-grade. The three that most affect the verdict and most
  deserve human verification are: the Messari $128,862 figure, the live POKT supplier `min_stake`,
  and Lava's 50,000 LAVA per chain.
- I rendered no page from thegraph.com, docs.pokt.network, chain.link or any vendor site —
  all egress-blocked. Every "primary" source above is a GitHub-hosted repo file.
- I did not investigate: Akash/Fluence-style decentralised compute, Arweave/Filecoin storage
  providers, or restaking-based AVS operation (EigenLayer). Those are arguably in-criterion for a
  wider reading of "paid infrastructure" and are genuinely unexamined here, not dismissed.
