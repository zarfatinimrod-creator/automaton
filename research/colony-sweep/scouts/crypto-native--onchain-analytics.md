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

---
---

# SECOND PASS — same criterion, re-scouted 2026-09-03

**Scout:** WORKER-SCOUT `onchain-analytics` (second assignment on this criterion).
**Web searches spent this pass:** 4 (cap 8). None refused. Everything else came from
GitHub code search + `raw.githubusercontent.com`, which costs no search budget.
**Why a second pass:** the first pass's headline recommendation (finding #1, the alert-bot
subscription) was rated GREEN with its single load-bearing question left open — "is
commercial redistribution of DefiLlama's free public API permitted?" I closed that question.
**The answer flips the rating.** That is the main output of this pass.

## Evidence strength key (same as pass 1)
[RENDERED] = I fetched and read the page. [SNIPPET] = search-result text quoting a page I
could not render. [BLOCKED] = egress proxy refused.

---

## CORRECTION 1 — the "only GREEN lane" is not GREEN. It is AMBER.

Three independent sources, two of them rendered by me, say the free feeds this colony would
build on are **licensed for non-commercial use** and forbid re-serving:

1. **DefiLlama's own Terms of Use**, `https://defillama.com/terms` — **[SNIPPET]**, 2026-09-03,
   host is EGRESS_BLOCKED so I could not render it. Quoted text: DefiLlama grants a
   *"revocable, non-transferable, non-exclusive licence to access and use the Site for
   **personal, non-commercial purposes**."* Same snippet: content, data sets, layout, design,
   logos and underlying code *"are owned by or licensed to DefiLlama and are protected by UAE
   copyright, trademark and database-rights laws."*
   → A paid subscription product served off `api.llama.fi` is a commercial purpose.

2. `https://raw.githubusercontent.com/elkassabgi/econdatalibrary/main/catalog/site/defillama.html`
   — **[RENDERED]** 2026-09-03. A data-catalogue entry whose author states they hold
   *"Written permission (DeFiLlama, 2026) — attribution required, **non-commercial**"*, and
   the entry's own fields read: **Commercial use: "Restricted / no"**; Redistribution:
   "Permitted (served here)"; Required attribution: "Source: DeFiLlama".
   → Someone who went and asked DefiLlama got a *non-commercial* permission back.

3. `https://raw.githubusercontent.com/Savoy11/Finance-Now/main/frontend/src/lib/server/sourceTerms.ts`
   — **[RENDERED]** 2026-09-03. A production per-source terms register. It rates **DefiLlama
   "Conditional — attribution required; fair-use rate limits (no bulk mirroring)"**, and rates
   **CoinGecko "Conditional"** with the quoted clause: *"You are not permitted to **sell, rent,
   lease, sub-license, re-distribute or syndicate access**"*, attribution mandatory
   ("Powered by CoinGecko"), plus clause 4.1.7.3 (never use the data to target advertising),
   clause 4.5 (Brand Attribution Guide, do not imply endorsement) and clause 4.1.7.6 (no public
   statements about CoinGecko without prior written consent).
   The same file bars redistribution for Messari ("no redistribution of research content") and
   StockTwits ("display only — do not mirror or re-serve"), and marks Finnhub/Tiingo free tiers
   **non-commercial only**.

**The dissenting source, and why I do not follow it:**
`https://raw.githubusercontent.com/NAME0x0/Pantheon-Trades/main/docs/EDGE_SOURCES.md`
— **[RENDERED]** 2026-09-03 — asserts DefiLlama is *"CC-BY 4.0 attribution"*. That is a
third-party repo's unsourced characterisation, it contradicts DefiLlama's own terms page, and
the same file carries its own disclaimer: *"re-verify each licence at the time of use — the
data landscape moves ... the use of an external data source is governed by that source's terms."*
I treat the vendor's own terms as controlling.

**Consequence.** ChainAlert's architecture (pass 1, finding #1) polls **CoinGecko** and
blockchain.com. CoinGecko's terms forbid selling or re-distributing access. DefiLlama's terms
limit the free tier to personal, non-commercial use. So the product as specced in pass 1 —
"subscription alert bot on free feeds" — is **AMBER, not GREEN, and under rule 4 must not be
recommended as a build.** Pass 1's own README quote actually predicted this and was read too
generously: *"reselling raw API data usually violates vendor terms; the value you sell is the
alerts/UI on top."* True, but the licence attaches to *access*, not only to resale of the rows.

**The commercial route exists and it kills the economics.** DefiLlama Pro is **$300/month**
[pass 1, RENDERED]. CoinGecko's commercial API tiers are **Analyst ~$129/mo, Lite ~$250/mo,
Pro $499/mo** [see the price table below]. Against pass 1's own benchmark — median indie SaaS
revenue **$145 MRR** — a product whose *data input alone* costs $129–$300/month is
underwater from month one unless it clears ~50 paying subscribers before it ever profits.

---

## CORRECTION 2 — competition, priced from a rendered source

`https://raw.githubusercontent.com/RickArko/ccquant/main/documentation/API_Pricing.md`
— **[RENDERED]** 2026-09-03. A third-party engineering doc, so the prices are transcriptions,
not the vendors' own pages; but they are specific, internally consistent, and they agree with
the Celo range from pass 1.

| Vendor | Tiers as transcribed |
|---|---|
| **Glassnode** | Discover free (display only, no API); **Advanced $49/mo annual, $99/mo monthly** (Light API, 14-day history, 50 calls/day); **Professional $799–999/mo**; Institutional custom — *"Full + redistribution"* |
| **CryptoQuant** | Basic free (charts, 7-day); **Advanced $29/mo**; **Professional $99/mo**; **Premium $799/mo** |
| **CoinGecko API** | Demo free (30 calls/min, 10k/mo); **Analyst ~$129/mo**; **Lite ~$250/mo**; **Pro $499/mo**; Enterprise custom |
| **bitcoinisdata.com** | Lightning micropayments: 30 days 3,000 sats (~$1.50); 90 days 8,000 sats (~$4.00); 360 days 25,000 sats (~$12.50) |

Two things to take from this table. First, **redistribution is an explicitly priced
institutional-tier right at Glassnode** — confirming that the industry treats "may I re-serve
this data" as a paid licence, not a default. Second, the **bitcoinisdata.com** row is the only
example I found in this whole criterion of on-chain data sold *without* a subscription, at
$1.50–$12.50 a window over Lightning. It is a real existence proof for micropriced on-chain
data, and it is also the size of the prize: single-digit dollars.

---

## NEW FINDING — grant-funded analytics tooling, with a GitHub intake and a published rate

This is the one thing in the criterion I found that pays four figures per unit, names its
buyer, and does **not** require a human to talk to anyone. Applications are pull requests and
issues on GitHub.

- **The rate is published.** `w3f/Grants-Program`, `applications/DeepAccountAnalytics-PolkadotDataAlliance.md`
  — via GitHub code search, **[RENDERED via search_code]** 2026-09-03, verbatim:
  **`- **FTE:** 150 FTE hours [100 USD/hr]` / `- **Costs:** 15,000 USD`**.
  On-chain account-analytics work, priced by its own applicant at **$100/hour, $15,000 for the
  milestone**, in a public repo. Sibling applications in the same repo cover exactly this
  criterion: `applications/Hyperdot.md` (a Dune-like SQL query API + dashboards),
  `applications/fidi-dotsight-analytics.md` (TVL/UAW/wallet dashboards),
  `applications/polkaflow.md` (an analytics dashboard, self-described as filling a gap).
- **The programme structure**, `https://raw.githubusercontent.com/w3f/Grants-Program/master/README.md`
  — **[RENDERED]** 2026-09-03: intake is *fork → copy the application template → open a pull
  request → address committee feedback within 2 weeks → sign the CLA*. Levels:
  **Level 1 $10,000** (2 approvals), **Level 2 $30,000** (3 approvals), **Level 3 unlimited**
  (5 approvals, or Council approval and a pitch above $100k). Payment: *"At least 50% ... of
  each milestone payment is made in DOT (linearly vesting over 2 years). The remainder is paid
  in USDC on the Polkadot AssetHub."* KYC/KYB **required, via Sumsub**. No country restriction
  stated in the README.
- **THE KILL, and it is on the same page:** *"The Web3 Foundation has decided to discontinue
  the general Grants Program. **We are not accepting new applications at this point.**"*
  So the archetype is proven and priced, and this particular door is shut.
- **A door that is open:** `https://raw.githubusercontent.com/filecoin-project/devgrants/master/README.md`
  — **[RENDERED]** 2026-09-03. Open Grants intake is **a GitHub issue**
  (`https://github.com/filecoin-project/devgrants/issues/new/choose`), *"Grants up to $50,000
  are available"* for novel ecosystem ideas. The README says nothing about KYC, country
  eligibility, payment currency, or whether analytics tooling is in scope — I tried to render
  the open-grant issue template at
  `.github/ISSUE_TEMPLATE/open-grant-application.md` and got **404**, so the template path has
  changed. Those four gaps are unclosed.

Honest read: this is **lumpy project revenue, not a recurring line**, it is competitive,
it demands genuine delivery over months of milestones, and the payment is half in a
two-year-vesting token. It is the best-evidenced money in the criterion and it is still not a
20,000 ILS/month machine.

---

## NEW EVIDENCE on the Israeli crypto-tax lead (pass 1 finding #5)

Pass 1 flagged this as "the one unexplored door" with **no demand evidence at all**. I spent
one search on it. The regime is now better evidenced — and the demand evidence that came back
is **negative**, which is more useful than nothing.

**[SNIPPET], 2026-09-03**, from a search returning these pages (none rendered):
- *"The seller of cryptocurrency is required, **within 30 days from the date of the sale**, to
  submit to the ITA **Form 1399** that includes the calculation of profit/loss resulting from
  the sale, the tax calculation and an advance payment on the tax."* Also: *"mandatory
  registration with Israeli tax authorities ... for all crypto transactions exceeding $50,000"*,
  and CGT at **25%**. Source pages a human must open:
  `https://www.crowe.com/il/insights/taxation-of-cryptocurrencies`,
  `https://www.lawfirmwolf.com/cryptocurrency-us-and-israeli-taxes-and-voluntary-disclosure`.
- The ITA is running a **2026 reform** of digital-asset reporting and capital-gains
  calculation: `https://beaumont-capitalmarkets.co.uk/israel-2026-crypto-tax-foreign-investors-complete-guide/`
  (a UK marketing site — weak; needs an ITA primary source).
- **The demand red flag, and it is loud.** Two separate headlines in the same result set:
  *"Israel Crypto Tax Disclosure Draws Shocking **58 Filers**"*
  (`https://www.squaredtech.co/israel-crypto-tax-disclosure-only-58-filers-show-up`) and
  *"Israel crypto tax plan misses target as **reporting gap widens**"*
  (`https://crypto.news/israel-crypto-tax-plan-misses-target-as-reporting-gap-widens/`).
  → The *obligation* is large and the *observed willingness to comply* is tiny. A compliance
  tool is sold to people who intend to comply. On this evidence, in Israel, that population
  measured **58**. This is exactly the trap of sizing a market by the size of the law.

**Competition check** [SNIPPET, 2026-09-03]: Koinly has an Israel landing page
(`https://koinly.io/crypto-accountants/israel/`) and says it *"supports over 100 countries"*,
but its **country-specific report list** — *"USA, Canada, Australia, UK, Germany, Norway,
Denmark & Sweden"* (`https://support.koinly.io/en/articles/9489962-which-countries-does-koinly-calculate-taxes-for`)
— **does not include Israel**. Israel is served only by the generic FIFO/ACB engine.
So there *is* a genuine gap: no incumbent emits an Israeli Form 1399. There is also, on the
only demand evidence I could find, almost nobody trying to file one.

---

## DEAD END, and it is a trap worth naming: "whale-alert bots earn $3k–$30k/month"

I spent one search hunting for a **disclosed** revenue figure for a crypto alert bot. What came
back was a wall of numbers with no source under any of them:
*"a channel with 200 paid subscribers can earn $6,000+/month with zero ongoing work"*,
*"many signal providers earn $3,000–$30,000/month"*, *"$5–$50/member/month"*
— **[SNIPPET]**, 2026-09-03, all from `https://aziqdev.com/blog/profitable-telegram-bot-ideas-2026`
and `https://aziqdev.com/blog/top-telegram-bot-ideas-2025`, which are **content marketing by a
bot-development agency selling bot development**. That is an advertisement, not evidence.
Anyone quoting "$6k/month from 200 subscribers" into a plan is quoting a sales page.
Note also that most of those numbers describe **paid trading signals**, which is a different
and worse business: it is financial advice, it is the archetypal crypto scam vector, and
selling it fails our constitution regardless of what it pays. ChainAlert's author drew the same
line unprompted: *"No buy/sell signals or advice — data and alerts only, by design."*

**Combined with pass 1's identical result, I now consider this settled: there is no public,
credible, disclosed revenue figure for a solo-operated on-chain analytics or alert product.**
Two scouts have looked. Do not spend a third scout's budget on it.

---

## Revised bottom line for this criterion

Pass 1 said the criterion was "thin but not empty" and offered one GREEN build. After closing
its open question, I say: **the criterion is thinner than that.**

- The subscription-alert-bot lane is **AMBER** — the free feeds it stands on are licensed
  non-commercially, and the commercial feeds cost $129–$300/month against a $145 median MRR.
- The only structurally clean data source left is **raw public blockchain data via a
  self-run or public RPC node**, where no vendor licence attaches because nobody owns the
  chain. That is a real GREEN lane and nobody in this sweep has costed it. It is also more
  than 40 hours of work to reach parity with what DefiLlama gives away.
- The best-evidenced money is **ecosystem grants for analytics tooling** — $100/hr, $10k–$50k
  per grant, GitHub-native intake, KYC once — and it is lumpy project work, not a line.
- Everything else here is closed, forbidden, or unpriced.

## What must still be checked (named URLs for an unblocked agent)
- `https://defillama.com/terms` — render it. The "personal, non-commercial purposes" clause is
  the single most consequential sentence in this criterion and I have it only as a snippet.
- `https://docs.llama.fi/pro-api` — do the Pro tiers grant commercial redistribution rights,
  and at what price?
- CoinGecko API terms, full text — confirm clauses 4.1.7.3, 4.5, 4.1.7.6 and the
  "sell, rent, lease, sub-license, re-distribute or syndicate" clause at source.
- `https://github.com/filecoin-project/devgrants/issues/new/choose` — the live open-grant
  template: scope, KYC, payment currency, country eligibility. (The old template path 404s.)
- `https://www.crowe.com/il/insights/taxation-of-cryptocurrencies` — confirm Form 1399 and the
  30-day deadline from an Israeli CPA firm rather than a snippet.
- An ITA primary source for the 2026 digital-asset reporting reform.

## Dead ends confirmed this pass (do not re-search)
- Disclosed revenue for solo on-chain analytics/alert products. Searched twice across two
  passes. Nothing exists but agency marketing.
- DefiLlama / CoinGecko free tiers as the data base for a *paid* product. Their own terms say no.
- W3F Grants Program. Priced and documented, and closed to new applications.
- Paid trading signals. Fails the constitution before payability is even reached.
