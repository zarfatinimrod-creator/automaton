# Scout notes — crypto-native / trading-strategies

Agent: WORKER-SCOUT "trading-strategies", group "crypto-native".
Date of research: 2026-09-03. Search budget used: 8 / 8 (cap reached, stopped).
Verdict headline: **the criterion is a near-total dead end. Nothing here is recommended as a build.**

## Evidence discipline note
- Nothing below was fetched as a rendered page except the two GitHub raw files (Freqtrade, Hummingbot READMEs).
- Everything else is a **search snippet** quoting a page. Marked (SNIPPET) throughout. Snippets are weaker evidence.
- `trade.collective2.com` is **EGRESS_BLOCKED** (attempted, refused by the proxy). So is nearly everything else.
- No number below comes from memory. Where I had no evidence I wrote "unknown".

## Searches run (8)
1. MEV searcher profitability 2026 declining share builders Ethereum statistics
2. Collective2 Darwinex sell trading strategy subscribers payout Israel supported countries 2026
3. Aave USDC supply APY September 2026 stablecoin lending rates DeFi
4. DeFi hacks total losses 2026 stolen funds protocols report Chainalysis Immunefi
5. Israel ISA regulation crypto trading advice license investment advisory law automated signals
6. crypto funding rate arbitrage delta neutral basis trade returns 2026 annualized percent Hyperliquid Ethena
7. airdrop farming sybil detection disqualified wallets 2026 terms of service violation multi-account
8. Israeli banks refuse crypto funds deposit Bank of Israel Supervisor of Banks directive 2026

## Pages actually rendered (strong evidence)
- https://raw.githubusercontent.com/freqtrade/freqtrade/develop/README.md — verbatim: "This software is for educational purposes only. Do not risk money which you are afraid to lose. USE THE SOFTWARE AT YOUR OWN RISK. THE AUTHORS AND ALL AFFILIATES ASSUME NO RESPONSIBILITY FOR YOUR TRADING RESULTS." Free, MIT-ish OSS, supports Binance, Bybit, OKX, Kraken, Hyperliquid, Gate, Bitget, HTX etc., spot and futures, with backtesting, hyperopt, web UI and Telegram control.
- https://raw.githubusercontent.com/hummingbot/hummingbot/master/README.md — free, Apache 2.0, market making + arbitrage across 140+ venues.
  → Consequence: the entire "sell a crypto trading bot" product space is competing against two mature, free, Apache/GPL-licensed incumbents with active communities. That is fetched, first-party evidence, not opinion.

## Blocked / unreachable (a human or unblocked agent must open these)
- https://trade.collective2.com/c2-israel-service-transition.html — the single most decisive Israel-payability document I found for strategy marketplaces. EGRESS_BLOCKED.
- https://www.darwinexzero.com/docs/who-can-subscribe — Darwinex Zero eligibility by country. Not fetched.
- https://aavescan.com/stablecoins — live Aave stablecoin APYs. Not fetched.
- https://arxiv.org/html/2507.13023v1 — "Measuring CEX-DEX Extracted Value and Searcher Profitability". Not fetched; the searcher-share numbers below rest on the snippet only.

---

## 1. MEV searching (Ethereum / Solana / L2s) — REJECT
(SNIPPET, search 1) Titan alone ~50% of Ethereum blocks, May 2026. "SCP and Wintermute only retain 10-15% of their arbitrage revenue and transfer nearly 90% to their integrated builders." ~90% of validators run MEV-Boost; ePBS arriving with Glamsterdam. >$550M/yr extracted on Ethereum.
Reading: MEV is now an oligopoly of vertically integrated searcher-builders with exclusive order flow. A new entrant with no order-flow deals, no colocated infra and no inventory captures the residual of a residual. 10-15% retention is what *Wintermute* gets; a newcomer gets less.
Risk in numbers: capital at risk is unbounded per failed bundle (gas/priority fees paid on reverted or losing bundles), expected value for a no-brand entrant is negative. Honest monthly ceiling: 0 ILS.
Constitution: backrunning/arb is arguably neutral, but sandwiching — the profitable retail-facing subset — extracts value from a counterparty who did not consent. That is deceiving a buyer. RED under MISSION.md regardless of legality.
Buyer: none. This is principal trading, not a sale. There is no nameable buyer, which by rule 5 alone disqualifies it.
Build time: far beyond 40h (mempool infra, simulation, builder relationships, capital).
Sources: https://arxiv.org/html/2507.13023v1, https://arxiv.org/html/2608.05011v1, https://ethereum.org/developers/docs/mev/

## 2. Delta-neutral funding-rate / basis arbitrage — REJECT (capital, not skill, is the input)
(SNIPPET, search 6) Net return on BTC/ETH delta-neutral perp arbitrage "typically falls within a low single-digit annual percentage rate range"; longer-term net ~3-12% APR. 20-60%+ only on long-tail perps. Ethena runs this via Binance/Bybit/OKX/Deribit/Hyperliquid.
Arithmetic (mine, from that snippet): 20,000 ILS/month = 240,000 ILS/yr. At 8% APR net that requires ~3,000,000 ILS of capital continuously deployed; at 3% APR, ~8,000,000 ILS. At the 50,000 ILS/month target, 7.5M-20M ILS. The owner is not putting 3M ILS on a perp desk, and the colony must not ask him to.
Risk in numbers: the strategy is only delta-neutral until an exchange halts, a funding regime flips, or the hedge venue is the thing that breaks. Tail losses are 100% of deployed capital on a venue failure — and 2026 already showed venue/infra failure is the dominant loss mode (see §3).
Buyer: none. Principal trading again.
Sources: https://coinmarketcap.com/academy/article/crypto-delta-neutral-strategy-2026, https://arbitragescanner.io/blog/crypto-funding-rate-arbitrage-guide, https://eco.com/support/en/articles/15254002-ethena-usde-and-susde-2026-delta-neutral-yield

## 3. DeFi stablecoin lending / yield farming (Aave, Morpho, Spark, Sky) — REJECT
(SNIPPET, search 3) 2026 range on reputable venues: **3.5%-9% APY**, top of range only by accepting extra risk. Aave V3 the largest venue by deposits; rates algorithmic on utilisation. US insured savings accounts pay 4-5% for comparison.
Arithmetic: 20,000 ILS/month at 6% APY needs ~4,000,000 ILS. At 3.5%, ~6,900,000 ILS. There is no version of this that produces the target from a standing start.
Risk in numbers (SNIPPET, search 4): H1 2026 — **$972M lost across 207 incidents**, the highest incident count ever recorded (Immunefi). KelpDAO bridge exploit $292M via a single-verifier LayerZero config; Drift on Solana $285M from a six-month DPRK social-engineering operation. Chainalysis attributes ~76% of 2026 hack losses to state-backed actors. Median loss per hack fell to $1.5M, but Immunefi's framing is a *structural shift* toward infrastructure, key-compromise and privileged-access failures — i.e. exactly the risks an unattended software agent cannot audit.
So: a ~6% yield carrying a non-trivial annual probability of a 100% principal loss is not a 6% yield. Uninsured, unhedged, and the counterparty risk is a smart contract.
Buyer: none. This is the owner lending his own money.
Sources: https://aavescan.com/stablecoins, https://www.theblock.co/post/407707/crypto-hack-losses-fall-below-1-billion-in-h1-2026-even-as-attack-volume-hits-record-immunefi, https://deepstrike.io/blog/defi-hacks-exploits-statistics

## 4. Selling trading signals / a subscription signal bot to Israeli users — REJECT (RED, licensing)
(SNIPPET, search 5) "As a general rule, the provision of 'research papers' requires a license under the Israeli Investment Advice Law, and research providers may only receive fees from the end-clients." In **January 2026** the ISA published a proposed amendment to the "Directive to licensees relating to service provision using technological means", regulating investment marketers, advisors and portfolio managers "operating through algorithmic systems and digital platforms", and creating an "independent trading advice service" category whose characteristic is "the ongoing transmission of investment recommendations to independent traders via online means". The ISA has separately proposed bringing digital assets under the securities/advice/portfolio-management laws.
Reading: a paid Hebrew-language signal or auto-trade service aimed at Israelis lands inside a **licensed** activity. A licence attaches to a natural person who must qualify and be examined. That is not a one-time KYC step — it is an ongoing professional obligation and continuous human work, which MISSION.md forbids.
Verdict: RED for the Israeli market, AMBER-at-best offshore (each target market has its own advice regime; CFTC/FCA equivalents are no friendlier).
Buyer would have been: Israeli retail crypto/forex traders. Real buyer, unreachable legally.
Sources: https://www.lexology.com/library/detail.aspx?g=a52bcd84-af8d-4770-af14-d49fee56b446, https://www.legal500.com/guides/chapter/israel-blockchain-crypto-assets/, https://www.theblock.co/post/199076/israels-financial-regulator-proposes-crypto-inclusion-to-securities-law

## 5. Strategy marketplaces / copy-trading lead-trader income (Collective2, Darwinex Zero) — REJECT (low confidence, evidence blocked)
(SNIPPET, search 2) Collective2 pays strategy authors **50%** of subscription revenue, **60%** if certified Trades-Own-Strategy; subscriptions from **$19/mo**. Darwinex Zero: "any trader with an internet connection and credit card can subscribe... regardless of country of residence", but "there may be payment restrictions to some countries initially"; Darwinex cannot serve the USA.
Israel-specific (SNIPPET, search 2): a page titled "Collective2 Israel - Service Update" exists and says Israeli users move to the Collective2 USA site, and that a previously-used "Israel Interactive" brokerage account no longer works — users must open a new Interactive Brokers account. **I could not fetch this page (EGRESS_BLOCKED); treat as unconfirmed.**
Why it still fails: revenue requires a *long, real, audited track record trading real capital* before anyone subscribes. That means months of principal risk with the owner's money before the first shekel, and the money model is a percentage of other people's subscriptions to a strategy that must actually work. It is the gamble of §2 with a marketing layer and a delay. And in Israel it likely re-enters the Investment Advice Law from §4.
Honest ceiling for a no-brand new entrant with no track record: 0 ILS in months 1-12.
Sources: https://www.collective2.com/sell-trading-system, https://collective2.com/choose-plan, https://www.darwinexzero.com/docs/who-can-subscribe

## 6. Airdrop / points farming at scale — REJECT, RED, do not build
(SNIPPET, search 7) In the Linea airdrop **~517,000 of 1.3 million eligible addresses (~40%) were filtered as Sybil**. Detection: IP/subnet clustering from dApp frontends, bridges and RPC providers; hardware/browser fingerprinting; backward fund tracing 3-5 hops to a common funding source. 2026 consensus among farmers is 2-5 wallets maximum. "Sybil operations may breach a program's terms and get clawed back or disqualified, and using deceptive identities can cross legal lines in some jurisdictions."
Verdict: multi-wallet farming is, definitionally, presenting many fake identities to a distribution designed for distinct humans. That is deception of the counterparty and a terms violation. **RED under the constitution; not buildable at any expected value.** Note also that the entire visible tooling ecosystem here (anti-detect browsers, mobile-proxy vendors) sells evasion — that is what the search results were full of, and it is a tell.
Sources: https://blog.send.win/crypto-airdrop-sybil-detection-will-disqualify-your-wallets/, https://www.coronium.io/blog/sybil-defense-multi-wallet-farming

## 7. Selling a crypto trading bot / backtesting SaaS (the picks-and-shovels reframe) — WEAK, not recommended
This is the only shape in this criterion with a real buyer (retail algo traders) and no principal risk. But:
- (RENDERED) Freqtrade and Hummingbot are free, mature, Apache/GPL, cover 140+ venues, and already ship backtesting, hyperopt, a web UI, Telegram control, market making and arbitrage. A paid newcomer has to beat free.
- Any feature that *tells the user what to trade* crosses back into §4's licensing wall. Only pure infrastructure (hosting, monitoring, data) stays clear, and that is a commodity.
- Demand evidence for a *paid* tier: **none found**. I did not spend budget proving a market I already expect to be crowded and margin-free.
Ceiling: unknown, plausibly small; confidence low. Not recommended.

## Payability to Israel — the one genuinely positive finding
(SNIPPET, search 8) In mid-July 2026 the Banking Supervision Department **cancelled the automatic delay on deposits originating from crypto transactions exceeding NIS 100,000**. The Bank of Israel published a draft directive treating funds routed through a Capital-Market-Authority-licensed VASP as lower risk, and would **prohibit blanket refusals** of crypto-derived fiat deposits. Directive 411 already requires a risk-based approach rather than blanket refusal. Bank Leumi reportedly opened crypto trading to its customers in Aug 2026 (Genfinity, snippet — weak source, flag it).
Reading: crypto-origin fiat is becoming *bankable* in Israel when it comes through a licensed VASP. That materially helps every other crypto-native line the colony might run (x402 receipts, Telegram Stars conversions, on-chain product revenue). It does **not** rescue any strategy in this file, because the problem here was never the off-ramp — it was that these lines have no buyer and require capital the owner does not have.
Must be confirmed by an unblocked agent: the actual Bank of Israel draft directive text on boi.org.il, and the July 2026 Banking Supervision cancellation notice.
Sources: https://www.calcalistech.com/ctechnews/article/53uma5sxc, https://www.lexology.com/library/detail.aspx?g=ae91550b-496d-4031-a74b-770414582270, https://cryptolawmap.com/regulations/israel/

## Dead ends (do not re-search)
- MEV for a new entrant: structurally closed, ~90% of arb revenue flows to integrated builders.
- Any yield/arb line as a route to 20,000 ILS/month: the arithmetic needs 3-8 million ILS of capital. Capital, not software, is the binding constraint. No amount of agent cleverness changes a denominator.
- Signal/advice products for Israelis: blocked by the Investment Advice Law and the ISA's Jan-2026 algorithmic-advice directive. Licensing is ongoing human work — forbidden by MISSION.md.
- Airdrop/Sybil farming: RED, closed permanently.
- Bot software as a product: two free incumbents own it.
- I did NOT search: crypto tax treatment for Israeli residents (25% capital gains is my recollection, and recollection is not evidence — unverified, do not use); Binance/Bybit copy-trading lead-trader availability for Israeli residents (open question); grid-bot affiliate/referral revenue (open question, and note referral revenue for pushing leveraged products at retail is ethically AMBER at minimum).
