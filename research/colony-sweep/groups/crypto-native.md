# Group report — `crypto-native`

Supervisor: SUPERVISOR `crypto-native`. Date: **2026-09-04**. Model: Opus 5.

## Headline

**Nothing in this group is rankable. I rank zero lines, and that is the finding.**

Eight scouts swept the whole crypto-native surface — the Israeli off-ramp, agent-to-agent payment
networks, crypto tooling grants and bounties, paid agent/API services for stablecoins, on-chain
analytics, paid crypto infrastructure, trading strategies, and NFTs/collectibles. Across roughly
forty distinct candidate lines, **not one clears the ₪300/month floor with honest evidence**, and
most do not clear ₪0.

The group fails for three structural reasons, each independently sufficient:

1. **Where the rail works, there is no buyer.** x402 settles in seconds, costs ~0, pays an Israeli
   wallet with no account and no KYC. It is the best payment rail this colony has found anywhere.
   And the best-documented honest seller on it, measured against its own on-chain ledger, earns
   **€132.19 in 30 days across ~250–290 endpoints, 89.7% of it from a single wallet.** That is
   ~₪530/month for a catalogue fifty times larger than ours.
2. **Where there is money, it is captive or emitted, not addressable.** The top x402 seller does
   $189,707/30d — but *eight of the top ten buyers pay exactly one seller*. That is a product and
   its own customers settling on-chain, not a market a newcomer can enter. Every open
   infrastructure role (POKT, Lava, AR.IO, Graph Horizon) pays a **token emission**, not a
   customer; every infrastructure role with a customer (Filecoin Warm Storage, EigenDA, Chainlink)
   is admitted by **a human committee**.
3. **Where there is a buyer, entry is gated on a human.** Dune dashboard work is negotiated in a
   Discord channel. OpenSats requires a 2-minute video of the applicant and two reference letters.
   Israeli signal products fall inside the Investment Advice Law. All forbidden by MISSION.md.

The one genuinely valuable output of this group is **not an income line at all** — it is that the
Israeli off-ramp got materially better in 2026, which raises the payability of crypto revenue
this colony might earn *elsewhere*. That belongs in the group's findings, not in a ranked list.

---

## Coverage — counted, not claimed

Eight files match `research/colony-sweep/scouts/crypto-native--*.md` on disk. **I read all eight in
full**, including the five swept in an earlier wave that were excluded from this wave's fan-out:

| # | File | Bytes | Wave |
|---|---|---|---|
| 1 | `crypto-native--israel-offramp.md` | 10,851 | this wave (JSON) |
| 2 | `crypto-native--agent-payment-networks.md` | 14,037 | this wave (JSON) |
| 3 | `crypto-native--crypto-tooling-grants.md` | 21,367 | this wave (JSON) |
| 4 | `crypto-native--paid-agent-services.md` | 29,173 | earlier wave, read from disk |
| 5 | `crypto-native--infra-services.md` | 32,511 | earlier wave, read from disk |
| 6 | `crypto-native--onchain-analytics.md` | 30,453 | earlier wave, read from disk |
| 7 | `crypto-native--trading-strategies.md` | 14,925 | earlier wave, read from disk |
| 8 | `crypto-native--digital-collectibles.md` | 8,715 | earlier wave, read from disk |

Reading the earlier wave was not a formality: **two of the five contain second passes that reverse
their own first-pass recommendations**, and both reversals kill candidates this wave's scouts were
still carrying. `paid-agent-services` pass 2 replaced "#1 seller earned $3.12K cumulative" with a
measured $189,707/30d *and* showed why that is worse for us, not better. `onchain-analytics` pass 2
downgraded its single GREEN recommendation to AMBER after closing its own open question on DefiLlama's
licence. A report written from this wave alone would have ranked at least two dead lines.

---

## Verification I ran myself (5 calls)

I spot-checked the five claims that most affect the ranking. Two survived, two were demoted, one is
new and material.

**CONFIRMED — the x402 market snapshot.** I fetched
`raw.githubusercontent.com/HanbeenMoon/agent-failure-archive/main/MARKET.md` myself. The top-seller
table (rank 1: 7,802,976 tx / $189,707; rank 5: 124,985 tx / $105,615 at $0.845/call), the
measurement date 2026-08-25, and the sourcing statement *"Every number here came from a public
endpoint you can call yourself … Nothing here is modelled, projected, or averaged across sources"*
are all verbatim as reported. So is the sentence that decides the criterion: *"Eight of the top ten
buyers pay exactly one seller. That is not a marketplace, it is a set of vertically integrated
products whose clients happen to settle onchain."* And so is the discovery gate: *"a new x402 seller
is invisible to every automated discovery surface until someone who already knows the URL pays."*

**CONFIRMED — Strale's revenue, the group's only honest comparable.** I fetched
`strale-io/strale/docs/strategy/2026-08-demand-mined-build-queue.md`: **€132.19 over 30 days, of
which one wallet is €118.56 (89.7%)**, plus €21.74 lost to failed calls against a rate-limited free
upstream. This is the best-documented honest crypto-native seller anywhere in the sweep, and it is
~₪530/month. (Note: `MEASUREMENT.md`, which the scout also cited, does **not** contain the
€253.40/90d figure — it carries "~€48/week" and a 99.3% single-buyer week. The scout's headline
number checks out against the other file; the citation was imprecise.)

**CONFIRMED — the Israeli off-ramp improved in 2026.** Independent search corroborates the
`trading-strategies` scout: in mid-July 2026 the Banking Supervision Department **cancelled the
automatic delay on deposits originating from crypto transactions exceeding NIS 100,000**, and the
Bank of Israel drafted a directive **barring blanket refusals** of fiat deposits sourced from
licensed providers, treating funds routed through a supervised VASP as lower risk. This is the one
piece of good news in the group and it was buried in the scout file least likely to be read.

**DEMOTED — AWS Bedrock AgentCore payments as a buyer channel.** The `agent-payment-networks` scout
ranked this first, at a ₪600 ceiling, claiming the AWS sample proves "no AWS-side seller account, no
AWS revenue share". I fetched the same README. It does **not** say that. It presents sellers as
*"infrastructure components within the sample rather than as independent marketplace participants"*,
provisioned by the same administrator who provisions the buyer, and it **makes no statement about
seller earnings, external seller onboarding, or marketplace listing at all**. The scout's own text
already conceded *"ZERO public evidence of what any seller has earned through this channel"*. A
₪600 ceiling assigned to a channel with no evidence of an external seller is a projection, not a
finding. Demoted to rejected.

**DEMOTED — Gitcoin Grants as a live opportunity.** The `crypto-tooling-grants` scout gave this a
₪150 ceiling and a kill criterion reading "register in the next dev-tooling round". There is no next
round to register in. GG24's dev-tooling QF ran **14–28 October 2025 and is closed**; the successor
proposal is titled, in Gitcoin's own governance forum, **"WITHDRAWN — Gitcoin x Octant Yield-Powered
Matching for GG25"**. I also corrected the scout's arithmetic in the *optimistic* direction and it
still does not save the line: GG24 distributed **$300,000 in matching to 64 curated projects** (a
~$4,690 mean, not the ~$470 the scout computed from direct donations alone). But entry was
*curated*, QF matching is superlinear in the count of unique human donors — the one input a
zero-human operation cannot honestly manufacture — and there is no open round. Rejected on
availability, not only on size.

---

## Merged and deduplicated — the same opportunity under many names

Four candidates appeared under three or more criteria. I kept the best-evidenced version and
discarded the rest rather than counting them twice:

- **"Sell an API/agent service for stablecoins"** appeared in `paid-agent-services` (two passes),
  `agent-payment-networks` (AWS AgentCore, Skyfire), and `onchain-analytics` (#4, analytics over
  x402). The best-evidenced version is `paid-agent-services` pass 2, which measured it. All others
  are subsumed.
- **Bits of Gold / USDC→ILS off-ramp** appeared in `israel-offramp`, `paid-agent-services` (S5),
  `infra-services` (source 12) and `digital-collectibles`. Best version: `israel-offramp`, upgraded
  by the `trading-strategies` bank-acceptance finding, which the off-ramp scout did not have.
- **Israeli crypto tax reporting as a product** appeared in `israel-offramp` (weak, self-declared)
  and `onchain-analytics` (#5 plus a second-pass demand check). Best version: `onchain-analytics`,
  because it is the only one that went looking for *demand* and found the answer was negative.
- **Web3 Foundation Grants** appeared in `crypto-tooling-grants` and `onchain-analytics`. Both
  rendered the same README; both found the same closure sentence. Counted once.

---

## Ranked list

**NONE.** Zero lines survive.

I want to be explicit about what I did *not* do, because the two audited groups before me both
ranked a candidate their own text had already argued against. The two temptations here were:

- **Rank `products/x402-il-api` because we already own it.** It is already shipped, it costs ~₪0/month
  to keep running, and I agree with the `paid-agent-services` scout that it should stay up as a free
  call option on the rail maturing. But "keep a shipped thing running at zero cost" is not a ranked
  income line, and dressing it as one would put a ₪500 ceiling in the portfolio that the evidence
  says is modally ₪0. The honest entry is: no new engineering hours, forecast nothing.
- **Rank Gitcoin at ₪150 because grants feel safe.** ₪150 is below the ₪300 floor by the rules I was
  given, the round does not exist, and the successor was withdrawn. Ranking it would be padding.

**This group cannot contribute to ₪20,000/month.** Not at a lower ceiling, not with more build hours,
not with better execution. The constraint is that there is no buyer, and no amount of agent
cleverness manufactures one.

---

## Rejected, and why

Ordered by how attractive they look before you check.

| Line | Why rejected |
|---|---|
| **Selling agent/API services for stablecoins (x402)** | Best honest comparable earns €132/30d across ~290 endpoints, 89.7% from one wallet (VERIFIED). Top-line volume is captive: 8 of top 10 buyers pay exactly one seller (VERIFIED). Discovery is transaction-gated — you cannot be indexed until you have been paid. Ceiling 0–₪500, modal ₪0. Below floor. |
| **AWS Bedrock AgentCore payments as a buyer channel** | The cited source does not support the claim (VERIFIED against the same README). No evidence of any external seller, any earning, or any listing path. ₪600 ceiling was a projection. |
| **Gitcoin Grants dev-tooling QF** | No open round. GG24 closed Oct 2025; GG25 proposal WITHDRAWN (VERIFIED). Entry was curated; QF matching scales with unique human donors, which we cannot honestly generate. One-off, not a line. |
| **Skyfire / KYAPay** | Israel payability genuinely UNKNOWN — no source states any payout country. No volume, no seller earnings. Competes with x402, which needs no account at all. |
| **Virtuals Protocol ACP** | The "$1M/month distributed to selling agents" is the protocol's own incentive pool. An income line whose payer is a subsidy budget is subsidy farming — fails rule 4 regardless of legality. |
| **Card-network agent rails (UCP, AP2, Visa TAP, Mastercard Agent Pay, MPP)** | Partner counts published, transaction volume never. All require merchant-of-record status with a card acquirer and its KYB — a sales conversation the owner will not have. Israel UNKNOWN. |
| **OpenAI/Stripe ACP + ChatGPT Instant Checkout** | US buyers, US merchants; Instant Checkout ended 2026-03-24. Israel NO. |
| **Selling agent-payment infrastructure (facilitators, protocol handlers)** | 345 x402-facilitator repos and 369 agentic-commerce repos on GitHub, with free production implementations from Vercel, NVIDIA, OpenZeppelin and AWS. Price floor is literally zero. |
| **Drips Network registration** | A rail, not a buyer. No evidence of any funder ever choosing an unknown project. ₪50 ceiling. |
| **OpenSats grants** | Mandatory **2-minute video of the applicant** and **two reference letters**, plus 30/90-day progress correspondence. Not a one-time KYC exception — a standing human obligation. Fatal under MISSION.md. Terms are otherwise excellent, which is why this must be recorded as closed rather than re-investigated. |
| **Web3 Foundation Grants** | README states the programme is closed to new applications (rendered independently by two scouts). ≥50% of each milestone vests in DOT over 2 years. |
| **Code4rena / Immunefi (automated audit submission)** | Sub-threshold accuracy plus a documented industry ban policy for AI-generated reports (curl: 49 hallucinated reports, *"we instantly ban all reporters submitting AI slop"*). AMBER → never a build under rule 4. |
| **Sherlock** | $250 USDC staked **per report**, refunded only if valid, plus a 20% validity-ratio gate before any payout. Deterministically negative-EV for an automated submitter, before competition. Also the only line asking the owner to risk capital. |
| **Hats Finance** | The only zero-KYC programme in the group and the only one with zero owner blockers — and zero predictable income. Note it if a real vulnerability is ever found incidentally; never build for it. |
| **Israeli crypto tax-report generator** | The demand evidence is *negative*, not absent: Israel's crypto voluntary-disclosure window drew a reported **58 filers**. A compliance tool sells to people who intend to comply, and that population measured 58. Also AMBER — a filing-ready computation edges into regulated advice and a wrong number costs the buyer money with our name on it. The Koinly gap (no Israeli report) is real and irrelevant at this demand. |
| **On-chain alert bot / analytics subscription** | AMBER, not GREEN. DefiLlama's free tier is licensed *"for personal, non-commercial purposes"*; CoinGecko forbids *"sell, rent, lease, sub-license, re-distribute or syndicate access"*. The commercial feeds cost $129–$300/month against a $145 median indie-SaaS MRR — underwater from month one. |
| **Dune dashboard freelancing** | Real buyer, known price ($125/dashboard, $15–25/hr) — and intake is Dune's Discord `freelancer-listing` channel with per-job negotiation. Owner will not; an agent posing as a freelancer would fail the constitution. |
| **Reselling/white-labelling Dune data** | Dune's terms forbid white-labelling "for free or resale", forbid selling CSV exports "on a running basis as a data product", and forbid sublicensing API keys. RED. |
| **The Graph — Subgraph Service indexer** | 100,000 GRT locked + 16 CPU/32 GB/1 TB hardware, against a network-wide usage revenue of ~$43k/month split over 65 serving indexers (~$660/mo gross each). Minimum-stake indexers are *explicitly* scored ~0.8 by the gateway. Margin inverted. |
| **POKT Shannon supplier** | The protocol's own spec documents that the operator serving 92.8% of relays was paid **6.4× less per relay** than slot-holders who served almost none, and that 31.1% of claimed work goes unpaid network-wide. A new supplier is by construction the losing party. |
| **Self-hosted RPC resale** | Alchemy's *free* tier (30M CU/month) is larger than our paid tier could be; enterprise floor $2–3/M credits against $500–1,500/month per box plus bandwidth. |
| **Chainlink node operator** | Running is permissionless; *being paid* requires admission to a specific oracle network that restricts contributors. Admission is a relationship. |
| **Celestia light node** | Pays nothing by design. The incentivised testnet is over. |
| **Lava Network provider** | Permissionless (vendor's own FAQ), but requires a synced node per chain — the same $500–1,500/month box — plus 50,000 LAVA staked, and then shares the subscription pool across every provider who served relays. |
| **EigenLayer / EigenDA operator** | Operator set is capped; entry means out-staking an incumbent with *delegated* TVL, i.e. persuading restakers to delegate to you. Marketing work. Each AVS sets its own admission conditions unilaterally. |
| **Filecoin classic storage provider** | Epyc CPU + datacentre GPU + 128 GiB RAM + per-sector FIL pledge. A hardware business with a token deposit. |
| **Filecoin PDP / Warm Storage** | Looks like the cheap door (32 GiB box, set your own USDFC price). Is not: a **SAFE multisig** controls the approved set, endorsement is *"granted and removed manually"* and expects *"support response times and incident handling"* — a human on call. And network-wide demand was 49.41 TiB across 478 datasets. |
| **Akash provider** | Network-wide lease revenue $253,250 in Q1 2026, **down 45% QoQ**, split across every provider, in a business where you must buy GPUs first. |
| **AR.IO gateway operator** | Genuinely permissionless — and paid by *"rewards based on your gateway performance"*, i.e. a protocol emission, not a customer. 30-day withdrawal lock or a 50% haircut. A token-yield position in an infrastructure costume. |
| **The Graph Horizon minor data services (Dispatch/Seahorn/Nuthatch/SDSCE)** | The only genuinely open door in infrastructure — 0–555 GRT, no whitelist — and it is open because the room is empty. Dispatch's own gateway was *retired* 2026-07-20; Seahorn has no endpoint; Nuthatch consumers are allowlisted. Zero competition and zero demand are the same fact seen from two ends. |
| **MEV searching** | ~90% of arbitrage revenue flows to vertically integrated builders; Wintermute itself retains only 10–15%. Sandwiching — the profitable retail-facing subset — extracts value from a non-consenting counterparty: RED. No buyer; this is principal trading. |
| **Delta-neutral / funding-rate arbitrage** | 3–12% APR net. ₪20,000/month needs ₪3–8M of continuously deployed capital. Capital, not software, is the binding constraint. |
| **DeFi stablecoin lending** | 3.5–9% APY needs ₪4–7M. And H1 2026 saw **$972M lost across 207 incidents** — a 6% yield carrying a real annual probability of 100% principal loss is not a 6% yield. |
| **Selling trading signals to Israelis** | Lands inside the Investment Advice Law; the ISA's January 2026 proposal explicitly covers *"ongoing transmission of investment recommendations to independent traders via online means"*. A licence attaches to an examined natural person — ongoing human work. RED. |
| **Copy-trading / strategy marketplaces (Collective2, Darwinex Zero)** | Requires months of audited real-capital track record before the first shekel, then re-enters the advice regime in Israel. Ceiling ₪0 in months 1–12. |
| **Airdrop / points farming** | ~40% of Linea's eligible addresses were filtered as Sybil. Multi-wallet farming is presenting fake identities to a distribution designed for distinct humans. RED, permanently. |
| **Crypto trading bot / backtesting SaaS** | Freqtrade and Hummingbot are free, mature, Apache/GPL, cover 140+ venues and already ship backtesting, hyperopt, web UI and Telegram control. Any feature that tells the user *what* to trade crosses back into the licensing wall. |
| **Minting/selling our own NFT collection** | Art NFT volume −93% from peak, traders −96%, royalties unenforceable since OpenSea disabled enforcement. Also fails rule 4: selling a token whose only plausible thesis is resale is not honest value. |
| **NFT ticketing / POAP-style utility NFTs** | POAP had the brand, 46,000+ issuers, 7.6M mints, Coinbase/Amex/Warner as customers and $10M raised — and wound down in August 2026 for lack of sustainable monetisation. |
| **Physically-backed collectibles (Courtyard model)** | The one growing segment, and it needs vaulting, grading, insurance and shipping (Courtyard uses Brink's). Not software-only. |
| **Telegram Gift trading/sniping bots** | Depends on reverse-engineered private APIs driven by an **extracted user session** from web.telegram.org. Classic ToS-violation shape, and a zero-sum speculation product. RED. |

---

## Findings the colony should keep, which are not income lines

These are the group's real output. None of them earns a shekel; two of them change what other
groups may assume.

**1. The Israeli off-ramp is materially better than the colony's docs assume — and receiving is
still not the problem.** Bits of Gold holds CMA and Ministry of Finance licences and supports
USDC↔ILS bank transfer; Bit2C is the named alternative; no international exchange offers ILS
(Coinbase does not serve Israel; Kraken serves Israel but in USD only). Crucially, in **mid-July
2026 the Banking Supervision Department cancelled the automatic delay on crypto-origin deposits
above NIS 100,000**, and the Bank of Israel drafted a directive **barring blanket refusals** of
fiat deposits sourced from licensed VASPs (Directive 411 already required a risk-based approach).
**Consequence for the portfolio: crypto-denominated revenue earned on any other line is now more
credibly convertible to shekels than it was.** The off-ramp *fee/spread is still unknown* — nobody
has rendered Bits of Gold's fee page — so no crypto line may be booked net of conversion until
someone does.

**2. A factual error in a shipped product's README, which I may not fix myself.**
`products/x402-il-api/README.md` states that converting USDC to shekels *"is only required to cash
out, never to earn"*. The payment half of that is right; the **tax half is wrong**. Multiple
sources agree Israeli tax liability arises on **receipt** of virtual currency as consideration for
a service, not on conversion. The line stays legitimate; the sentence needs rewording by whoever
owns that file. Flagging to the board because a shipped artifact making an incorrect tax statement
is exactly the kind of drift rule 4 exists to catch.

**3. A tax question that must be answered before any crypto line scales.** If USDC-priced API
revenue makes the owner a VAT **"financial institution"** (input VAT not deductible, plus a
wage-and-profit tax), crypto-billed lines are structurally more expensive than Paddle-billed ones.
This is snippet-grade and needs a professional answer. It is *advice*, not a sales conversation —
permitted under MISSION.md — but it is unavoidable before scaling, and it is currently unresolved.

**4. Do not re-search this group.** The pattern held across eight criteria and two independent
second passes: *cheap-and-open* and *paid-by-a-customer* are mutually exclusive here. Re-open only
on a specific trigger — a **named buyer with a funded budget** appearing on x402, or a third party
publishing seller-side (non-incentive, non-captive) revenue. Not on a new protocol launch, not on a
funding announcement, not on a partner count.

---

## Scouts whose work was thin or unsourced

Named honestly, including where the thinness was declared by the scout itself.

- **`crypto-native/agent-payment-networks` — the weakest work in the group, and it was ranked first.**
  Its top finding assigned a ₪600 ceiling to AWS Bedrock AgentCore as a buyer channel. I fetched its
  own cited source and it does not support the claim: sellers appear as provisioned components inside
  the sample, and the document says nothing about external sellers, earnings or listing. The scout had
  already written *"ZERO public evidence of what any seller has earned through this channel"* and then
  put a number on it anyway. It also could not resolve the order-of-magnitude contradiction in x402
  volume figures it surfaced — a contradiction the earlier-wave `paid-agent-services` scout had
  **already resolved** on disk, which suggests it did not read its own group's prior work.
- **`crypto-native/israel-offramp` — thin, but honestly so.** By its own accounting, **zero primary
  sources rendered**; every regulatory and tax claim is snippet-grade, with gov.il, legal500, barlaw
  and blockeden all confirmed blocked. Its Coinbase-Israel claim traces to a **2020** statement quoted
  in a 2026 snippet. It correctly declared all of this and correctly concluded the criterion yields no
  products. The failure is environmental, not dishonest — but nothing in that file should be treated
  as established. It also missed the July 2026 banking change, which was sitting in a sibling file.
- **`crypto-native/crypto-tooling-grants` — strong on primaries, wrong on liveness.** It rendered
  OpenSats, w3f and Drips from source and produced the group's cleanest owner-blocker catalogue. But
  it assigned a ceiling and a kill criterion to a Gitcoin round that does not exist, having read the
  GG25 proposal without noticing it was withdrawn, and it computed the mean payout from direct
  donations while ignoring the matching pool — an error in the pessimistic direction that happened not
  to change the verdict.
- **`crypto-native/digital-collectibles` — thin by budget, right by conclusion.** Fifteen of its
  eighteen evidence rows are self-marked "weak" and only three pages were rendered. It said so, it did
  not overclaim, and its three rendered GitHub sources are what actually carry its verdict. Acceptable,
  but no number in it should be quoted.

**The best work in the group, for contrast, and the board should note the pattern:**
`paid-agent-services` and `onchain-analytics` each ran a **second pass that corrected its own first
pass downward** — one replacing a headline number with a measured one that was worse for us, the
other closing its own open licensing question and demoting its only GREEN recommendation to AMBER.
`infra-services` closed all four of the gaps its first pass had confessed to. That is the standard.
