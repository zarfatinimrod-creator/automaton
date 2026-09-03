# Scout notes — crypto-native / trading-strategies

Agent: WORKER-SCOUT "trading-strategies", group "crypto-native".
Date of research: 2026-09-03. Search budget spent: 8 of 8 allowed WebSearch calls.
Criterion: "Automated trading, MEV and yield strategies: assess honestly and expect to REJECT —
the colony must not gamble the owner money. State the risk in numbers."

## Verdict up front

**Every line under this criterion is REJECTED.** Not one of them is a software-only business
that a nameable buyer pays for. They are all one of three things:

1. A **bet with the owner's capital** (MEV, arbitrage, LP, yield) — MISSION forbids nothing
   explicitly here, but the criterion instructs scepticism and the arithmetic below shows the
   capital requirement is between 2.4M and 9.7M ILS to reach 20,000 ILS/month. The owner does
   not have a stated capital base, and returns are not revenue.
2. A **regulated activity** (selling signals / advice / portfolio management on digital assets
   to Israelis) that the ISA has moved to license.
3. A **constitution violation** (sandwich MEV, sybil airdrop farming).

The one shape that survives on principle — selling tools and data *to* traders rather than
trading — I could not find a named buyer for inside budget, so it is reported at low confidence,
not recommended.

## Evidence collected

### E1. MEV searcher economics (search snippet, 2026-09-03)
Query: "MEV searcher profitability 2026 declining revenue Ethereum statistics".
Snippet-level claims, sources listed but NOT rendered by me:
- "MEV competition has eroded searcher profits to less than 10%".
- "Top searchers capture 90% of MEV, totaling 526,207 ETH (0.12% DEX volume) from 2022-2024".
- "three searchers captured three-quarters of both volume and extracted value".
- Ethereum staking base APR ~2.78% in 2026, MEV-Boost adding 0.5-1% for validators; MEV revenue
  increasingly flows to *proposers*, not searchers.
- The battleground has moved from Ethereum L1 to L2s and Solana; value increasingly "enshrined"
  in protocol-level auctions rather than captured by third-party bots.
EVIDENCE CLASS: search snippet only (weak). To close, a human must open:
- https://arxiv.org/html/2507.13023v1 (Measuring CEX-DEX Extracted Value and Searcher Profitability)
- https://arxiv.org/html/2608.05011v1 (Towards Decentralized Searcher Competition in MEV Markets)
- https://info.arkm.com/research/beginners-guide-to-mev
- https://coinbureau.com/guides/is-ethereum-node-profitable

### E2. Flashbots' own docs on sandwich bots (RENDERED — strong)
https://raw.githubusercontent.com/flashbots/flashbots-docs/main/docs/flashbots-protect/overview.mdx
Exact quote returned: "Transactions are sent to a private Flashbots mempool where they will be
hidden from frontrunning and sandwich bots."
Interpretation: the leading MEV infrastructure provider ships a product whose stated purpose is
protecting users *from* sandwich bots. That is the industry itself classifying sandwiching as
harm done to a counterparty. Under our constitution ("honest value only", "no deceiving a buyer")
sandwich/frontrun MEV is RED and not buildable, independent of profitability.
Repo confirmed to exist and be current: https://github.com/flashbots/flashbots-docs
(245 stars, updated 2026-08-30, per GitHub API).
Note: `mcp__github__search_code` returned 0 results for flashbots org queries; the docs tree was
reached via WebFetch on github.com/flashbots/flashbots-docs/tree/main/docs and raw.githubusercontent.

### E3. Stablecoin lending yields (search snippet, 2026-09-03)
Query: "Aave USDC supply APY 2026 stablecoin lending yield real rate".
- "As of August 2026, Aave v3 USDC supply pays 3.28% on Ethereum ($186M supplied) and 3.52% on Base."
- 30-day trailing range quoted as 3.8-5.2%.
- **"USDC on Aave yield is on average a 31 basis point discount from the 1-year treasury rate. For
  78% of 2026, USDC on Aave has earned lower annualized returns than the 1-year treasury rate."**
  That last line is the whole finding: the DeFi line pays *less* than a T-bill while carrying
  smart-contract, oracle, depeg and bridge risk that a T-bill does not.
EVIDENCE CLASS: snippet only. To close, open:
- https://eco.com/support/en/articles/15253991-best-usdc-yield-platforms-2026-aave-morpho-sky-compared
- https://coinmetrics.substack.com/p/state-of-the-network-issue-379
- https://alphagrowth.io/blog/best-stablecoin-yields-on-base-in-august-2026-aave-morpho-euler-and-more-compared/
- and the live rate at app.aave.com (authoritative, not fetchable from here)

### E4. DeFi loss run-rate (search snippet, 2026-09-03)
Query: "DeFi hacks stolen funds total 2025 2026 losses protocol exploits report".
- 2025: DeFi protocol losses ~$680M; total crypto hack losses ~$2.87B, of which Bybit alone $1.46B (51%).
- 2026 through May: **>$840M lost across 50+ incidents in five months**, vs 30 incidents in the same
  window of 2025 — a ~70% YoY increase in incident count. April 2026 alone >$600M, led by
  KelpDAO ($292M) and Drift Protocol ($285M).
- 89% of 2025 DeFi protocol losses were protocol-logic exploits (i.e. the contract itself, not a bridge).
- North Korea-linked actors: 76% of global crypto hack losses through April 2026 (64% in 2025).
EVIDENCE CLASS: snippet only. To close, open:
- https://deepstrike.io/blog/defi-hacks-exploits-statistics
- https://altfins.com/blog/defi-hacks-2026/
- https://coinpaprika.com/education/defi-exploits-in-2026-biggest-hacks-and-attack-vectors/
I deliberately did NOT compute an expected-loss percentage: that needs a DeFi TVL figure I could
not source, and inventing one would be exactly the kind of fake number the mission forbids.

### E5. Uniswap v3 LP outcomes (search snippet, 2026-09-03)
Query: "Uniswap v3 liquidity providers lose money impermanent loss study percentage unprofitable".
Bancor / IntoTheBlock study (v3 launch May through end of September, year not stated in snippet —
context implies 2021):
- ">51% of Uniswap V3 liquidity providers in volatile pairs were unprofitable as a result of
  impermanent loss".
- ">80% of the pools analyzed saw LPs lose out due to impermanent loss".
- "impermanent losses (-$260.1M) outshadow the returns earned from trading fees ($199.3M)" —
  i.e. aggregate LP economics were net negative by ~$60.8M over the studied window.
- "the average liquidity provider in the Uniswap v3 ecosystem has been financially harmed by their
  choice of activities and would have been more profitable simply holding their assets."
Counterweight in the same snippet: high-volume pools with a high volume/TVL ratio can net out positive.
EVIDENCE CLASS: snippet only. To close, open:
- https://thedefiant.io/news/research-and-opinion/uniswap-v3-impermanent-loss
- https://arxiv.org/pdf/2205.08904 (Risks and Returns of Uniswap V3 Liquidity Providers)
- https://arxiv.org/pdf/2111.09192 (Impermanent Loss in Uniswap v3)

### E6. Israeli regulation of digital-asset advice (search snippet, 2026-09-03)
Query: "Israel Securities Authority crypto investment advice license digital assets 2025 regulation trading signals".
- "The Israel Securities Authority has proposed to mandate entities providing investment advice,
  marketing, and portfolio management services in relation to digital assets to obtain a license."
- ISA proposed bringing digital assets under the securities / joint investments / investment
  consultation-marketing-portfolio-management laws.
- July 2025 Non-Bank Broker-Dealer Bill extends ISA supervision over investment firms handling crypto;
  a January 2026 ISA amendment gives regulatory relief to *digital* investment advice providers
  (i.e. robo-advice is being brought inside the licensing perimeter, not exempted from it).
- Definition adopted: digital asset = "a digital representation of value used for the purpose of
  financial investment, and can be transferred and stored electronically by using distributed ledger
  technology or another technology."
- The snippet explicitly notes: no explicit ISA statement about *trading signals* was found.
EVIDENCE CLASS: snippet only, and the specific question (do paid signal subscriptions count as
"investment marketing"?) is UNANSWERED. To close, open:
- https://www.theblock.co/post/199076/israels-financial-regulator-proposes-crypto-inclusion-to-securities-law
- https://barlaw.co.il/practice_areas/capital-markets/client_updates/digital-assets-and-israels-economic-plan/
- https://practiceguides.chambers.com/practice-guides/blockchain-2025/israel/trends-and-developments/O21417
- isa.gov.il directly (egress-blocked from this container)
The honest read: an unlicensed Israeli entity selling automated buy/sell recommendations on digital
assets is at minimum AMBER and plausibly requires a licence. We must not build it on a guess.

### E7. Israeli tax on trading (search snippet, 2026-09-03)
Query: "Israel crypto trading tax 25% capital gains vs business income frequent trading marginal rate 2025".
- Standard treatment: 25% capital gains tax, no long-term discount, rate applies regardless of holding period.
- "If your crypto activity is frequent, systematic, or business-like, the ITA may classify it as
  business income rather than capital gains", taxed at progressive rates 10%-50%.
- Some sources quote 25%-33% depending on gain size (surtax).
This is decisive for *automated* strategies specifically: an always-on bot is by construction
"frequent, systematic, and business-like", which is the exact fact pattern that pushes the owner
out of the 25% CGT bracket into marginal rates up to 50%. Automation makes the tax worse, not better.
EVIDENCE CLASS: snippet only. To close, open:
- https://www.crowe.com/il/insights/taxation-of-cryptocurrencies
- https://en.blockchain.org.il/crypto-regulation-israel-2025/
- taxes.gov.il circulars (egress-blocked)

### E8. Signal / bot marketplaces as a revenue channel (search snippet, 2026-09-03)
Query: "Cryptohopper 3Commas marketplace strategy signal provider earnings payout how much creators make".
- 3Commas marketplace signal providers can request payout of subscriber earnings;
  **minimum withdrawal threshold $50**.
- "Many marketplace providers on 3Commas offer free signals, earning through the platform's referral
  structure rather than direct subscriber fees" — i.e. the direct-subscription economy is thin.
- Subscription prices quoted at $10-$50/month, average $20-30/month.
- The snippet states plainly: "The search results don't contain specific information about how much
  individual creators typically make."
No evidence at all was found that these platforms pay to Israel. israelPayable = UNKNOWN.
EVIDENCE CLASS: snippet only. To close, open:
- https://docs.cryptohopper.com/docs/sellers/
- https://help.3commas.io/en/articles/9140366-withdraw-rewards-as-a-marketplace-signal-provider
- and each platform's Terms for a restricted-countries list.

### E9. Sybil / airdrop farming (search snippet, 2026-09-03)
Query: "airdrop farming sybil detection disqualified addresses LayerZero terms multiple wallets ban".
- LayerZero: **803,273 wallets, 59% of all applicants, disqualified** from the ZRO airdrop.
- Flagged conduct: "industrial farming via multiple wallets, minting valueless NFTs to move between
  networks, repeatedly bridging minuscule asset values, and interacting with known sybil farming apps".
- Self-report amnesty window recovered 15% of allocation; those found later got nothing.
- Detection: common funding source within 30 days, correlated bridge amounts, overlapping timing,
  shared IP/subnet — "LayerZero identified clusters where 50+ wallets shared a single datacenter IP."
This is the single most tempting "automated crypto income" idea and it is RED twice over: it is a
deliberate misrepresentation of one operator as many distinct users (deception), and it is against
the issuing protocols' own stated rules. The detection numbers also make it a bad *bet* even setting
ethics aside — a 59% disqualification rate on one of the largest airdrops.
EVIDENCE CLASS: snippet only. To close, open:
- https://thedefiant.io/news/defi/layerzero-tells-sybil-farmers-to-out-themselves-or-face-airdrop-exclusion
- https://invezz.com/news/2024/05/20/layerzero-flags-over-800k-sybil-addresses-in-airdrop-farming-crackdown/
(Note: several of the top results for this query were vendors selling proxies and anti-detect
browsers specifically to defeat sybil detection. That the tooling ecosystem around this idea is
built on evasion is itself a signal.)

## The capital arithmetic (this is the core rejection)

Assumption stated openly: I could not fetch a live USD/ILS rate (egress-blocked), so I work in ILS
and note that a rate near 3.5 ILS/USD is assumed only for the parenthetical dollar figures. The ILS
figures do not depend on that assumption.

Target = 20,000 ILS/month = 240,000 ILS/year.

At the Aave USDC rate actually measured in August 2026 (3.28%, E3):
  capital required, pre-tax = 240,000 / 0.0328 = **7,317,000 ILS** (~$2.09M)
At the same rate after Israeli 25% CGT (net 2.46%):
  capital required = 240,000 / 0.0246 = **9,756,000 ILS** (~$2.79M)
If the activity is reclassified as business income at a 47% marginal rate (E7, plausible for an
always-on bot), net 1.74%:
  capital required = **13,793,000 ILS** (~$3.94M)

Even at an aggressive and unsustained 10% net-of-tax yield, the requirement is 2,400,000 ILS
(~$686k) — and to earn 10% rather than 3.3% you must take exactly the smart-contract risk that cost
the ecosystem >$840M across 50+ incidents in five months (E4).

For the 50,000 ILS/month stretch target, multiply all of the above by 2.5.

**Conclusion: to hit the mission target through yield, the owner would have to put roughly 7-14
million shekels at risk. There is no version of this criterion that reaches 20,000 ILS/month from a
standing start with software alone.** Every finding below is a rejection, and the criterion as a
whole is a dead end for the colony.

## What a "no-brand new entrant" actually gets in MEV

Restating E1 as an entry decision rather than a market description: three searchers take ~75% of
extracted value; margins are under 10%; the surplus is being routed to proposers and to enshrined
protocol auctions rather than to independent bots. A new searcher with no colocated infrastructure,
no exclusive orderflow agreements, no builder relationships and no inventory is competing for the
residual of a residual. Honest monthly ceiling for such an entrant: **0 ILS, with a real probability
of net loss from gas spent on losing bundles.** I have no evidence for a positive figure and will
not invent one.

## The one shape that is not forbidden — and why I still cannot recommend it

Selling *tooling and data to traders* (backtest infrastructure, DEX/MEV analytics, an onchain data
API priced per call) is picks-and-shovels: honest value, no owner capital at risk, no regulated
advice, and it fits the repo's existing x402-il-api pattern. But rule 5 requires a nameable buyer,
and inside my 8-search budget I found none — no pricing evidence, no named customer, no demand
signal. Reporting it as a recommendation would be exactly the "confident tone with nothing
underneath" failure the brief warns about. It is listed at LOW confidence with an explicitly
unestablished buyer, as a pointer for a different scout, not as a build.

## Owner blockers common to every trading/yield line

These are real, and they are NOT the "one-time identity step" exception the mission tolerates —
they are recurring human financial acts:
- Funding: someone must move real money into a wallet or exchange account. That is the owner acting,
  and acting in a way that can lose the principal.
- Exchange KYC (one-time, legitimate exception) — but then also
- Israeli bank source-of-funds documentation on every fiat off-ramp of crypto proceeds. Banks
  routinely demand a paper trail; this is recurring, per-withdrawal human work.
- Annual tax filing with a classification argument (CGT vs business income) that a human accountant
  has to make and defend.
None of this is automatable. The mission's "owner does nothing" constraint alone kills the category
before the economics do.

## Search budget note

8 of 8 WebSearch calls used, as instructed. No searches were refused. Two free GitHub attempts
(`search_code` on flashbots org) returned zero results; the useful Flashbots evidence came from
WebFetch on raw.githubusercontent.com, which worked. No Israeli government domain was reachable —
isa.gov.il and taxes.gov.il were not attempted because the brief lists gov.il as egress-blocked;
all Israeli regulatory and tax claims here are therefore snippet-grade and marked as such.
