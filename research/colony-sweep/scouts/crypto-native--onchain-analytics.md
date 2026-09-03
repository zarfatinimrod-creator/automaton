# Scout notes — crypto-native / onchain-analytics

**Scout:** WORKER-SCOUT `onchain-analytics`, group `crypto-native`.
**Criterion:** On-chain analytics products (Dune dashboards, alert bots, portfolio tools):
who pays and how much.
**Date:** 2026-09-03.
**Web searches spent:** 8 of 8 (the cap). No search was refused. Everything after search #8
came from GitHub raw / MCP code search, which costs no budget.

## Evidence strength key
- **[RENDERED]** — I fetched the page and read it. Strong.
- **[SNIPPET]** — search-result snippet quoting a page I could NOT render. Weak; a human
  or an unblocked agent must open the named URL to close it.
- **[SIBLING]** — taken from another scout's notes in this same sweep, not re-verified.
- **[BLOCKED]** — egress proxy refused: `docs.dune.com`, `dune.com`,
  `cryptocurrencyalerting.com`. Do not retry these from this container.

---

## Headline

The criterion is **thin but not empty**. There is a real, priced market for on-chain
analytics — but it splits into three parts and this colony can only stand in one of them:

1. **Dashboard-building as freelance labour** (Dune Wizard Request, Fiverr, Upwork).
   Real money, real named buyers, priced at $125/dashboard or $15–25/hr — and it is
   *human relationship work* routed through Discord and client chat. It fails the
   owner-does-nothing mandate and, if an agent runs the chat posing as a freelancer, it
   fails the constitution. **Do not build.**
2. **Reselling the data** (Dune API, CSV exports, white-labelled dashboards).
   Explicitly forbidden by Dune's own terms. **RED. Do not build.**
3. **Selling alerts/UI built on genuinely free, redistributable feeds** (DefiLlama public
   API, public RPC). This is the only GREEN lane. It is buildable in well under 40 hours,
   it is payable to Israel through the Paddle rail the colony already runs, and its honest
   ceiling for a no-brand new entrant is **low three figures of shekels per month**, not
   20,000. It is a portfolio line, never the load-bearing one.

---

## Sources actually opened

### Rendered (strong)

1. `https://raw.githubusercontent.com/celo-org/celopedia-skills/main/skills/celopedia-skill/references/business-model.md`
   — Celo's own skills repo, business-model reference. Rendered 2026-09-03. Verbatim:
   - Pattern C (Premium Subscription) is "the productivity/utility default" and is
     "**Best for**: dashboards, analytics, alerts, advanced trading tools, productivity apps".
   - "**Typical price**: **$2-10/month for retail crypto users; $20-100/month for
     power-users/traders**".
   - Worked example: "**$5/month × 200 subscribers = $1,000 MRR**".
   - Mechanics: "time-bounded NFT pass, on-chain subscription contract (Sablier-like
     streams), or off-chain with on-chain receipt".
   - Warning in the same file: this pattern is "**hardest to launch — requires meaningful
     feature differentiation between free and paid**".
   This is the single best price anchor I found, and it is a foundation's own guidance,
   not a marketing page.

2. `https://raw.githubusercontent.com/ephopho/chainalert/master/README.md`
   — ChainAlert, an open-source Laravel crypto price + on-chain alert bot for
   Telegram/Discord. Rendered 2026-09-03. Load-bearing findings:
   - Architecture is exactly what a software-only operation needs: "**poll-once, serve-many**"
     — a scheduled poller batches API calls into a cache, "allowing thousands of subscribers
     without scaling API usage". Marginal cost per subscriber ≈ 0.
   - Data sources: **CoinGecko** (prices) and **blockchain.com Explorer Gateway** (whale
     transfers, wallet activity, token movements). No Dune, no Nansen.
   - Constitution-relevant, and the author says it unprompted: "**No buy/sell signals or
     advice — data and alerts only, by design.**"
   - ToS-relevant, and this is the sentence the whole criterion turns on:
     "**reselling raw API data usually violates vendor terms; the value you sell is the
     alerts/UI on top.**"
   - Monetisation is a stub: "Payment/subscription flow (`plan` column +
     `Subscriber::ruleLimit()` are the hooks; wire your billing provider to flip `plan`)."
     **No pricing model is implemented and no revenue is disclosed.** So this is proof the
     thing is cheap to build — it is NOT proof anyone pays for it.

3. `https://raw.githubusercontent.com/api-evangelist/defillama/main/README.md`
   — third-party API profile of DefiLlama. Rendered 2026-09-03:
   - "Free API requires no authentication", "**31+ endpoints** for protocol TVL, chain TVL,
     coin prices, stablecoin metrics, yield pools, DEX volumes, and fees".
   - Pro API: "**$300/month**", "38 exclusive endpoints covering token unlocks, cross-chain
     bridges, digital-asset treasury data".
   - **It says nothing about commercial-redistribution terms.** That gap is unclosed and it
     matters: see "What must still be checked" below.

4. `https://raw.githubusercontent.com/api-evangelist/dune-analytics/main/README.md`
   — third-party API profile of Dune. Rendered 2026-09-03. Confirms the API surface
   (Query API, Trends API, Echo/Sim multichain wallet API) and that it is
   "**credit-based** ... query executions, data exports, and writes consume credits against
   a plan-tier monthly allowance". Pricing itself lives on `dune.com/pricing` — **[BLOCKED]**.

### Search snippets (weak — a human must open these)

5. **Dune's own terms**, quoted by a search result on 2026-09-03. URLs a human must open:
   `https://dune.com/terms`, `https://dune.com/application-terms`, `https://dune.com/sql-api-terms`.
   Snippet text:
   - "Users shall not copy, transmit, transfer, modify or create derivative works from
     Queries and public Dashboards nor **wrap them in a white label manner for free or resale**."
   - "**CSV exports cannot be sold directly and/or provided on a running basis as a data
     product or service by the user.**" Internal company use and occasional reports are
     allowed, with credit to Dune and the query creator.
   - "Users shall keep API Keys confidential and shall not sell, transfer, sublicense, or
     disclose the API Keys to any third party."
   I could not render these (`dune.com` is EGRESS_BLOCKED) but the snippet is specific,
   quoted, and internally consistent across three separate addenda. I treat it as
   **strong enough to kill a build**, and not strong enough to authorise one.

6. **Dune Wizard Request Program** — `https://docs.dune.com/bounties/wizard-request-program`
   **[BLOCKED]**, snippet only, 2026-09-03: "The Wizard Request program is meant to unlock
   long-lasting relationships/collaborations between analysts and projects. Wizards looking
   for bounties should **join Dune's Discord and go to the `freelancer-listing` channel**.
   Projects fill out a form explaining what they want and how much they're willing to pay."
   → **No posted rate card. Price is per-negotiation, and the channel is Discord.**

7. **Freelance market rates for Dune dashboards**, snippets, 2026-09-03:
   - Fiverr gig, `https://www.fiverr.com/onechimad/create-dune-analytic-dashboard-for-you`:
     "I will create dune analytic dashboard for you **for $125**".
   - Upwork open jobs titled "Dune Analytics Dashboard Developer" exist
     (`https://www.upwork.com/freelance-jobs/apply/Dune-Analytics-Dashboard-Developer_~021914362818821396720/`).
   - Freelancer.com listings quoted at "**$15-25 USD per hour**".
   → The buyer is real and nameable: **crypto protocol growth/marketing teams that want a
   public dashboard for their token or their chain.** The delivery channel is human.

8. **Flipside Crypto bounties**, snippets, 2026-09-03. Historical scale only:
   PR Newswire, `https://www.prnewswire.com/news-releases/flipside-crypto-hits-record-150k-bounty-submissions-acquires-bites-digital-group-301600080.html`
   — "150k bounty submissions"; a 2022-era figure of "**more than $2 million paid out in
   bounties**" with "19,000 analysts onboarded in March". Current (2025–26) per-bounty
   amounts: **unknown**. Note the ratio: $2M across 19,000 analysts is ~$105 per analyst per
   year. That is the shape of a lottery, not an income line.

9. **Incumbent subscription prices**, snippets, 2026-09-03:
   - `https://cryptocurrencyalerting.com/` **[BLOCKED]** — snippet: tiers "**$19.99/month
     (Trader) to $49/month (Pro)** for one-year subscriptions", web UI + Telegram bot delivery.
   - A third-party repo's competitor table (`wjamestaylor/CryptoSentiment`,
     `docs/PRICING_STRATEGY.md`, via GitHub code search) lists "**Glassnode | $39/month
     ($29 yearly) | On-chain analytics**" and "TradingView | $14-67/month". This is a random
     repo quoting vendors, not the vendors — weakest tier of evidence, listed only because it
     agrees with the Celo range.

10. **Indie SaaS base rates** — snippet quoting TrustMRR's dataset, 2026-09-03
    (`https://superframeworks.com/articles/trustmrr-api-ideas-indie-hackers`,
    `https://ideaproof.io/lists/micro-saas-ideas`): across 8,000+ tracked startups, the 3,787
    with active revenue "average **$4,298 MRR** with a **median of $145**", and "only **6.1%**
    clear $10K MRR". This is the number to hold against every ceiling below. A new no-brand
    subscription product's expected value is the median, not the average.

### Sibling scout notes (not re-verified by me)

11. `research/colony-sweep/scouts/agent-markets--x402-economy.md` and
    `crypto-native--paid-agent-services.md` (this sweep, 2026-09-03): x402 ecosystem volume
    ~$1.1M/month, ~47% incentive-driven self-trades, and the **#1 seller in the entire
    protocol has earned $3.12K cumulative** across 108,000 transactions. Also: receiving USDC
    to a self-custodied wallet needs no KYC; converting USDC→ILS requires KYC at a
    CMA-licensed Israeli VASP.
    → I use this to price the "sell on-chain analytics as a paid x402 API" idea at
    **effectively zero**, without spending my own budget re-deriving it.

---

## The five findings, judged

### 1. Alert bot on free feeds, sold as a subscription — the only GREEN lane
Buyer: retail crypto holders and small traders who want whale/wallet/TVL alerts in Telegram.
Price anchor: $2–10/mo retail, $20–100/mo power user [Celo, RENDERED]; incumbent
CryptocurrencyAlerting charges $19.99–$49/mo [SNIPPET]. Build: ChainAlert proves the
architecture and the API-cost story (poll-once-serve-many) [RENDERED]; a fresh Node build on
DefiLlama's free 31-endpoint no-auth API plus a public RPC is **under 40 hours**.
Payability: YES — Paddle (already live in this colony) or Telegram Stars (already live).
ToS: GREEN *provided* the product sells alerts and UI, never raw redistributed data — which
is precisely the line ChainAlert's own README draws.
Honest ceiling: the median indie SaaS is $145 MRR. Call it **≤1,800 ILS/month** for a
no-brand entrant in year one, and be ready for zero. Competition is brutal and free:
Glassnode, DeBank, DEXTools, Telegram trading bots, and dozens of free open-source clones
of exactly this bot.

### 2. Dune dashboard freelancing (Wizard Request / Fiverr / Upwork) — real money, wrong shape
Buyer is genuinely nameable: protocol growth teams. Price is genuinely known: $125/dashboard,
$15–25/hr [SNIPPET]. But the intake is Discord's `freelancer-listing` channel and a
negotiation form [SNIPPET], and delivery is client back-and-forth. Under MISSION.md the owner
will not do that; under the constitution an agent must not pose as a human freelancer in that
chat. **AMBER on ToS/constitution grounds, and a hard fail on the owner-does-nothing mandate.
Do not build.**

### 3. Reselling or white-labelling Dune data — RED
Dune's terms, in three separate addenda, forbid white-labelling dashboards "for free or
resale", forbid selling CSV exports "on a running basis as a data product or service", and
forbid sublicensing API keys [SNIPPET, three URLs listed above]. Any product whose value is
"Dune's numbers, re-served" is a terms violation. **Do not build.** Worth recording because it
is the obvious first idea in this criterion and it is dead on arrival.

### 4. On-chain analytics sold as a paid x402 API — priced at zero by sibling evidence
The rail works and pays an Israeli, but the demand is not there: the protocol's top seller has
earned $3.12K *cumulative* [SIBLING]. A no-brand analytics endpoint is not going to out-earn
the #1 seller. Not a dead end technically; a dead end commercially.

### 5. Hebrew crypto capital-gains helper for Israeli holders — the one unexplored door
Israeli CPA firms state the regime plainly: 25% capital gains tax on real profit for private
investors, marginal rates up to ~50% plus National Insurance if the activity is classified as
a business, wallet-to-wallet transfers between your own wallets are not a sale, and a surtax
above roughly 700,000 ILS/year (2025) [SNIPPET: `https://www.cpa.co.il/accounting-services/cryptocurrency-taxation/`,
`https://www.bshcpa.co.il/מיסוי-קריפטו/` — both would need rendering to confirm].
The buyer is nameable (Israeli retail crypto holders facing an annual report), the language
moat is real, and it sits directly on top of the colony's existing Hebrew-calculator +
Paddle product. **But I found no pricing evidence, no competitor evidence, and no demand
evidence at all** — only that the tax exists. I am flagging it as a lead for a scout with
budget, not recommending it. Confidence: low.

---

## What must still be checked (named URLs, for an unblocked agent)
- `https://dune.com/terms`, `https://dune.com/application-terms`, `https://dune.com/sql-api-terms`
  — confirm the resale/white-label clauses verbatim. Currently snippet-only.
- `https://docs.llama.fi/pro-api` and DefiLlama's terms — **is commercial redistribution of
  the free public API permitted?** Finding #1's entire GREEN rating rests on this and I could
  not close it. If DefiLlama forbids it, the lane drops to AMBER.
- `https://docs.dune.com/bounties/wizard-request-program` — confirm there is no non-Discord,
  non-conversational intake.
- `https://cryptocurrencyalerting.com/` — confirm the $19.99/$49 tiers and look for any
  disclosed customer count.
- Israeli crypto-tax CPA pages above — confirm the 25%/50%/700k figures before any build.

## Dead ends (do not re-search)
- Dune as a *data supply* for a resold product. Terms forbid it.
- Dune/Flipside bounties as an income line. Discord-gated, negotiated per job, and the
  historical Flipside ratio is ~$105/analyst/year.
- x402-distributed analytics APIs. Sibling scout already priced the whole rail.
- Any claim of a solo founder's disclosed on-chain-analytics revenue: I searched for it
  explicitly and the search returned nothing. No such public figure surfaced.
