# Group report — `agent-markets`

Supervisor: SUPERVISOR `agent-markets`. Date: **2026-09-03**. Model: Opus 5.

## Headline

**One line survives, and it is one the colony already half-owns.** Eight scouts swept the agent
economy — Apify, RapidAPI/Zyla/APILayer, MCP registries, Claude skill marketplaces, the GPT
Store and Poe, Hugging Face and Replicate, ERC-8004/Olas/Virtuals/Fetch.ai, and x402. Seven of
those eight criteria produced **no rankable candidate at all**, and they failed for the same
structural reason each time:

> **The agent economy in September 2026 is a supply-side boom with a registry problem instead of
> a buyer.** Tens of thousands of listings, four to seven-figure registration counts, and almost
> no payment rail attached to any of it. Where a rail exists, the money flows *from* the developer
> *to* the platform (Smithery $30/mo, Hugging Face Spaces per-minute, AI-directory listing fees
> $25–$347). Where a rail flows the other way, the amounts are cents: the **#1 seller in the
> entire x402 protocol has earned $3.12K cumulative**, and Olas mechs default to **$0.01/job**.

The single exception is the one marketplace whose billing predates the agent hype and which pays
a documented 80% share into a real bank rail: **Apify**. That is the whole of my ranked list, and
I am ranking it at 55, not higher, because its ceiling is ₪600 against a ₪20,000 target and its
acquisition channel is a named hypothesis nobody has tested with one real buyer.

**This group cannot reach ₪20,000/month.** That is a finding, not a research failure.

---

## Coverage — counted, not claimed

Eight files match `research/colony-sweep/scouts/agent-markets--*.md` on disk. **I read all eight
in full:**

1. `agent-markets--agent-registries.md` (19,536 B)
2. `agent-markets--apify.md` (14,767 B)
3. `agent-markets--gpt-poe-stores.md` (8,331 B)
4. `agent-markets--inference-hosting.md` (9,386 B)
5. `agent-markets--mcp-registries.md` (11,420 B)
6. `agent-markets--rapidapi.md` (24,054 B)
7. `agent-markets--skill-marketplaces.md` (14,219 B)
8. `agent-markets--x402-economy.md` (14,598 B)

Also read before ranking: `MISSION.md`, `docs/REJECTED.md`.

## Verification I did myself

**WebSearch calls spent: 0.** Every check below went through `raw.githubusercontent.com`, which
renders, and which is where Apify keeps its docs and legal terms in public source. This is the
route future waves should use for this platform — it costs nothing against the shared budget.

| Claim spot-checked | Verdict |
|---|---|
| Agentic-payments eligibility rules (`_agentic-payments-eligibility.mdx`) | **CONFIRMED**, and the scout **missed one requirement**: *"The Actor's developer must also have completed identity verification (KYC)."* That is a fifth gate and an owner blocker. |
| Discovery surfaces (`quality_score.mdx`) | **CONFIRMED, with a correction to `docs/REJECTED.md`.** Two surfaces are named: Apify Store search, and *"The Apify MCP server `search-actors` tool used by external AI agents"*. The eight categories are Reliability, Popularity, Feedback and community, Ease of use, Pricing transparency, Trustworthiness, History of success, Congruency of texts. The store-promotion audit said "five of eight are controllable on day one"; **it is four** — Ease of use, Pricing transparency, Trustworthiness, Congruency. Reliability and History of success need run history, not just users. |
| 80% revenue share (T&C §10.2.1) | **CONFIRMED verbatim**: *"80% of the fees paid by Users for your Actor, minus Platform usage costs."* |
| Payout minimums / abandonment (§10.3.2) | **CONFIRMED**: USD 20 PayPal (docs page adds Wise at $20), USD 100 other methods; below-minimum balances *"deemed abandoned and forfeited"* after twelve continuous months. |
| KYC before payout (§10.1.2) | **CONFIRMED verbatim.** |
| Israel restriction | **CONFIRMED ABSENT.** No country list anywhere in the terms or the payouts page; only a sanctions/watchlist suspension clause. Israel payability is therefore *YES by absence of restriction*, not by an affirmative statement — same grade as `docs/REJECTED.md` already carries. |
| §2.2.4.2(i) off-platform promotion ban | **CONFIRMED verbatim**: we may not *"directly or indirectly offer, link to, or promote any product or service outside of the Platform"* in our Actors or Store content. **This kills any plan to use an Actor README as a funnel to il-biz-tools or the x402 API.** |

Rendered URLs:
- `https://raw.githubusercontent.com/apify/apify-docs/master/sources/_partials/_agentic-payments-eligibility.mdx`
- `https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/publishing/quality_score.mdx`
- `https://raw.githubusercontent.com/apify/apify-docs/master/sources/legal/latest/terms/store-publishing-terms-and-conditions.md`
- `https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/monetizing/monthly-payouts.mdx`

---

## RANKED — one line

### 1. Israeli-source public-data Actors on Apify Store, pay-per-event and agentic-eligible — score 55

**What it is.** Extend the already-shipped `products/apify-il-open-data` into a small set of
pay-per-event Actors over *documented Israeli public data sources* — one Actor per genuinely
distinct dataset, never one Actor per city or keyword. Configure every one of them to the four
agentic-payments rules (PPE only, no usage passthrough, limited permissions, no Standby) so they
also surface to agent buyers via x402/Skyfire at zero extra build cost.

**Why this and nothing else in the group.** It is the only candidate in `agent-markets` that is
simultaneously: payable to Israel through a bank rail (PayPal/Wise, verified from the terms),
GREEN on ToS, buildable with no human conversation, backed by an *existing* asset, and pointed at
by a previous audit. `docs/REJECTED.md` says it outright: *"The obvious candidate the ranking
never constructed is the intersection: Israeli-dataset Actors on Apify Store, extending
`products/apify-il-open-data`, where the niche is thin and the knowledge is already ours."*

**Acquisition channel (MISSION constraint 7).** Apify Store's own search ranking, plus the Apify
MCP server's `search-actors` tool used by external AI agents. Both are named verbatim in
`quality_score.mdx` as *the* discovery surfaces, so this is a channel, not a hand-wave. Why a
no-brand new entrant can place: four of the eight ranking categories are fully controllable on day
one with zero users, and the query set is thin — the scout's searches for Israeli government
open-data Actors returned **no competitor**, and Hebrew source schemas are a real barrier to the
"98 actors in 6 months" volume builders who cannot read them.

**But I am not going to pretend this is measured.** It is a hypothesis. The honest base rate the
scout found is the only published portfolio datum in the whole channel: **855 monthly users across
98 Actors ≈ 8.7 users per Actor**, and the builder declined to state revenue. Only users on
*paid* Apify plans generate any developer revenue at all. So the first thing built is the test,
not the product.

**Money model.** Pay-per-event. Developer keeps 80% of user fees minus platform usage costs.
Store price norm is $1–10 per 1,000 results (Apify's own academy page). Monthly payout invoice on
the 11th, auto-approved the 14th, $20 PayPal/Wise minimum, roll-over below that.

**Honest ceiling: ₪600/month at 12-month maturity, ₪0 for at least the first three months.**
Derivation, so it can be argued with: the store-promotion auditor put a *generic* multi-Actor
Apify portfolio at ₪1,500 after cutting the supervisor's ₪4,000, reasoning that Apify's ~$470
mean across ~3,000 developers sits on a power law whose median is far below it. Our Israeli slice
is thinner than a generic portfolio — fewer possible Actors, a smaller buyer pool — so it must
sit below that ₪1,500, not above. ₪600 is roughly one-third of the mean payout, which for a
new entrant on a power-law distribution is still optimistic rather than conservative.

**ToS: GREEN**, with one live constraint: §2.2.4.2(i) forbids promoting anything off-platform
inside our Actors or Store content. Original PPE Actors over documented public APIs are exactly
the platform's intended use. Scraping sites whose own terms forbid it would be AMBER/RED and is
out of scope regardless.

**Owner blockers — both one-time identity steps of the kind MISSION §1 permits, and neither is
done.** (1) Apify Verified Creator KYC: government ID, proof of address, tax documentation, legal
name matching the ID. Required before *any* payout **and**, per the eligibility partial I
rendered, required for agentic payments at all. (2) A PayPal or Wise account in the owner's legal
name; Wise reportedly requires Israeli-resident verification since 31 March 2025 (snippet-grade,
unconfirmed).

**Not a merchant of record.** T&C §4.1–4.2: the contract is between us and the user, not Apify
and the user. Unlike Paddle, this is the owner's own B2B income for Israeli tax purposes.

**First step — the cheapest test that a stranger can find it, per constraint 7.** Publish **one**
Actor over a single dataset already parsed in `products/apify-il-open-data`, PPE-priced, limited
permissions, no Standby, no usage passthrough. Then observe for 30 days and record in the ledger
schema: Store-search impressions, run count, and whether any run came from a paid-plan user. **Do
not build Actors 2..N until that one Actor has a single paid run.**

**Kill criteria.** Zero runs from paid-plan users 60 days after listing → kill the line, build no
further Actors. Accrued payout below $20 at 120 days → stop investing hours; a balance under the
minimum for twelve continuous months is forfeited outright.

**The open question that bounds how big this can get** — and it is MISSION constraint 6, not a
detail: *how many genuinely distinct Israeli public datasets can we honestly serve?* Nobody has
counted. Until somebody does, "a portfolio of Israeli Actors" is a wish. My estimate is one to two
dozen, which is a real business and is nowhere near 878 stores.

---

## REJECTED — everything else, with reasons

### Rejected on new evidence this sweep (a demotion, not a re-litigation)

| Rejected | Why | Reopens if |
|---|---|---|
| **RapidAPI / Zyla multi-homing of our existing endpoints, as a revenue line** | `docs/REJECTED.md` carries this at an audited ₪500. **My scout found evidence that lowers it below the ₪300 bar**, and it is the best single artefact any scout in this group produced: Michael Lynch's monthly retrospectives, checked into a public repo, publishing his **actual** RapidAPI earnings for a genuinely useful niche API — **$2.27 to $103.33/month, median $10–35** (16 months, 2019–2021, i.e. a *better* era than now). The structural kill sits in the same tables: his "Enterprise Plan Earnings" line ran $679–$3,883/month, **10–100× the marketplace line, and every shekel of it came from inbound enquiries he negotiated as a human.** MISSION forbids the owner to negotiate or talk to anyone, so **we are structurally locked out of the only part of this channel that ever paid well.** Add a 25% marketplace fee, 2.9%+$0.30 processing, PayPal-ILS drag, a reported $50 payout threshold (2–5 months per payout at those earnings) and a documented ~60-day lag. | A rendered `docs.rapidapi.com/docs/payouts-and-finance` showing materially different terms, *or* a measured self-serve seller earning four figures monthly without human sales. Neither is likely. |
| **Apify "opportunity finder" / store-analyzer Actors** | Tempting adjacency, and dead on inspection: the gap-finder category is itself crowded — `apify-opportunity-scout`, `apify-store-opportunity-finder`, `market-gap-finder`, `apify-store-analyzer`, `apify-store-scraper` all exist. When the gap-finders are a crowded category, the obvious gaps are gone. | Nothing. This is a saturation signal, not a market. |

### Rejected on payability or the absence of any rail

| Rejected | Why | Reopens if |
|---|---|---|
| **APILayer marketplace** | Best headline share found in the group (85/15) and individuals are eligible — but **Israel payability UNKNOWN** (no country list, no currency, no threshold rendered; "direct to bank account" from a US/Turkish entity is unverified), and listing is gated behind a **human approval** on an unpublished timeline. A channel gated behind someone else's discretionary review is not agent-operable. | A rendered `marketplace.apilayer.com/docs/article/provider-faq` giving payout countries and currency, plus a published review SLA. |
| **Poe creator monetization** | **Israel does not appear in any enumerated country list** the scout could see (~18 of a claimed 23 countries). And the pool is derisory: the only aggregate found was *"over $100,000 paid out to bot makers by mid-2026"* — a **platform-wide lifetime** figure. | `help.poe.com`'s FAQ, opened from an unblocked network, listing Israel. Even then the pool size makes it marginal. |
| **OpenAI GPT Store revenue program** | Already rejected in `docs/REJECTED.md` (US-only) and **reconfirmed with a harder fact: there is no open application path at all, for anyone, anywhere.** It remains an invite-only pilot for a small group of US builders. Payability is moot when there is nothing to apply to. | OpenAI opening applications outside the US. |
| **Apps in ChatGPT (Apps SDK) monetization** | AMBER and self-contradictory: snippets of OpenAI's own docs say the supported route is external checkout on your own domain, *and* that developers cannot submit an app monetizing digital services. Could not be rendered to resolve. Do not build against it blind. | `developers.openai.com/apps-sdk/build/monetization` rendered and unambiguous. |
| **Character.AI, Coze, FlowGPT, Hugging Face as creator platforms** | No creator payout rail exists on any of them. Character.AI's "Charms" is in-app tipping currency with no cash-out. | A published payout programme. |
| **Hugging Face Spaces / Replicate as an income platform** | Verified from HF's own docs repo: **every documented money flow points from the account holder to the platform** — Spaces hardware per minute, ZeroGPU credits, Inference Endpoints, Jobs, storage, seats. There is no creator payout page, no payout settings, no revenue-share clause anywhere. Payability to Israel is not even the question; there is nothing to be paid. | HF or Replicate publishing a creator revenue share. |
| **HF Inference Provider registration** | The one route by which money reaches a third party through HF — and it is a nine-step B2B integration for a company that already operates GPU serving, gated behind a **Team or Enterprise plan**, where HF explicitly takes no markup and you must expose a billing endpoint HF polls every minute. We do not run GPU serving. | We become a GPU serving business, which is a different company. |

### Rejected on ceiling — the agent-economy registries

| Rejected | Why | Reopens if |
|---|---|---|
| **x402 as a revenue line** | Already rejected in `docs/REJECTED.md`; my scout **reconfirms it harder and from a different direction**. The #1 seller in the entire protocol, StableEnrich, has earned **$3.12K cumulative** across 108,000 transactions. Ecosystem is ~$1.1M/month and falling (peak $5.15M Nov 2025 → $1.19M May 2026, −77%). CoinDesk: ~$28,000 daily volume, *"much of it from testing and 'gamed' transactions rather than real commerce"*; ~47% of volume is leaderboard-incentive-driven; *"the majority of Top Sellers are self-trades."* Reaching even ₪2,000/month would require ~17× the #1 seller's lifetime earnings, every month. | Registry volume rising two orders of magnitude, *and* a nameable non-crypto buyer. Keep `products/x402-il-api` running at near-zero cost as a call option; invest zero further hours; forecast nothing. |
| **MCP registries as a revenue line** | Already rejected; reconfirmed from the hardest possible source. I read the official server schema: **there is no price, payment, billing, plan or commercial-terms field anywhere in it.** The registry cannot take money and does not model it. Docker's catalog has no payouts. The official registry publishes no server count and has no stats endpoint. | A registry shipping a payment rail. |
| **ERC-8004 registration** | Already rejected; reconfirmed verbatim from the ERC itself: *"Payments are orthogonal to this protocol and not covered here."* And the decisive measurement: of 45,000+ registered agents, **only 3% on Ethereum expose a valid registration file with a live service endpoint.** Nobody buys from a registry where 97% of the shopfronts are painted on. | Measured buyer traffic arriving through an agent registry. |
| **Olas Pearl staking** | **Not revenue.** It is OLAS token emissions paid to operators who first post an OLAS deposit — read directly from `StakingBase.sol` (`emissionsAmount = rewardsPerSecond * maxNumServices * timeForEmissions`). It demands owner capital at risk, pays in a volatile asset, and governance can and did re-shape the emission curve. Fails MISSION twice over. | Nothing. This is yield on collateral, not a buyer paying for value. |
| **Olas Mech Marketplace, as a seller** | The one genuinely honest micro-market in the criterion, and the cheque is **$0.01/job** — read from the platform's own default config (`1e16` wei), not from marketing. Worse, demand is **endogenous**: the dominant buyers are Olas's own prediction-market agents, funded by the same OLAS emissions. If emissions fall, demand falls. Honest ceiling ₪0–400/month with **₪0 as the modal outcome**. | Exogenous demand — buyers who are not themselves subsidised by the protocol. |
| **Virtuals Protocol ACP selling** | The headline *"up to $1 million per month distributed to agents that sell services"* is a **protocol subsidy announced in a launch press release**, not proof that end buyers paid for work — and split across 18,000 agents it is ~$55/agent/month even if fully paid and evenly split, which it will not be. Virtuals' own $59M "revenue" is overwhelmingly launchpad and trading fees. The whitepaper's own split burns **30% of a seller's earnings buying the seller's own token**. Supply-side signature is unmistakable: dozens of zero-star single-commit seller repos, no visible buyers. Plus an unverified **whitelisting** gate that may require a human. | Verified per-seller payouts from end buyers, and a self-serve whitelisting path. |
| **Virtuals / Fetch.ai agent tokenization** | **RED under the constitution**, before economics are discussed. Issuing a tradable token to speculators is not honest value to a nameable buyer — the money comes from the next buyer of the token — and it raises Israeli securities questions MISSION forbids us to hand-wave. | Nothing. |
| **Fetch.ai Agentverse** | 2.7 million registered agents and agents described as ready for *"future monetization"*. The word "future" is the whole finding. Its concrete 2026 launch is a token-issuance platform. | A rendered payout rail with a platform cut and a settlement currency. |

### Rejected on "no payment rail exists" — the skills/plugin channel

| Rejected | Why | Reopens if |
|---|---|---|
| **Claude plugin / skill marketplaces, as a revenue line** | Verified from Anthropic's own rendered docs: the entire plugin lifecycle contains **no price, purchase, licence check, billing field, revenue share or payout**. The only "cost" shown to a user is a context-token estimate. **You cannot sell a plugin in the marketplace.** And the attention→install ratio is measured, not guessed: the most-starred skill repo in the ecosystem (26,611 stars) pulls **~1,323 npm installs/month**, carrying ₪0. | Anthropic shipping a payments programme. Nothing in the rendered docs, the community repo or search suggests one exists. |
| **Third-party paid skill stores (Agensi, Claude Protocol, KissMySkills)** | Snippet-grade only, and the sites **contradict themselves** — Agensi's own pages say 70% on one page and 80% on others. **Not one verifiable earnings figure exists for any of them.** All four sources are themselves SEO-shaped content properties writing about their own market. Stripe-Israel merchant status is separately unresolved across this repo. | A rendered payouts page plus one verified transaction. |
| **Running our own directory, marketplace or listing site** | The cash in this ecosystem flows **from tool builders to directory owners** ($25 SimplifyAITools → $347 TAAFT → four figures/month Toolify). Charging for placement on a list with no audience is selling attention we do not have — a constitution problem, not just a business-model one. Separately: 4,104 marketplace repos already exist. | Nothing. |
| **Smithery-style hosted MCP** | Reaffirms the existing rejection: money flows developer → platform ($30/month, $0 income). | A revenue share. |

### Rejected because the platform already killed it

| Rejected | Why | Reopens if |
|---|---|---|
| **Apify rent-an-actor** | Dead by platform decision, with dates read from Apify's own sunset partial: **no new rental Actors since 2026-04-01**, and **fully retired 2026-10-01 — 28 days from today.** Rental Actors were also excluded from Apify's MCP search results, i.e. invisible to AI agents. Any colony document still mentioning rental is stale. | Nothing. |
| **Apify pay-per-usage** | The developer earns **$0 by definition** — the user pays platform costs only. Useful as a free-tier funnel, never as a money model. | Nothing. |
| **Apify's saturated categories** (Google Maps/Places, LinkedIn, Instagram, TikTok, X, Facebook, YouTube, Amazon, Trustpilot, Glassdoor) | `apify.com/compass/crawler-google-places` is quoted at **426K–571K users**, and Apify's own team is behind it. A no-brand new entrant does not displace that. | Nothing. |

---

## Scouts whose work was thin or unsourced

I am naming specific weak content rather than smearing whole reports, because most of this group's
work was unusually good.

**`gpt-poe-stores` — the thin one, and the only one I would send back.** It spent its **full 8-search
cap and rendered exactly one page** (a GitHub README for the Agentic Commerce Protocol). Everything
else in it is a snippet. It also failed to close the single gate question it existed to answer —
whether Israel is on Poe's eligible-country list — despite spending the entire budget. Its
**section 4 is the worst content in this group**: it repeats "MCPize claims 85% rev share… Apify 80%…
Agensi 70/30" and *"realistic first-year figures ($500–5,000/mo)"* sourced to `mcpize.com`,
`agensi.io` and `godberrystudios.com` — vendor marketing pages selling the exact service being
described. To its credit it labels them as marketing and does not carry the numbers into its
verdict, and its conclusion (dead end) is correct and robust. But it re-discovered Apify — a
criterion another scout in the same group covered from primary sources — and added nothing to it.

**Weak but honestly flagged, and I am relying on them anyway with the flag attached:**

- **`x402-economy`** — the top-seller earnings table ($3.12K cumulative for StableEnrich) is the
  load-bearing number for a rejection, and it is **SNIPPET-only** from a blocked `note.com` page.
  I am accepting it because three independent snippet sources (Dune-derived volume, CoinDesk's
  ~$28K/day, Artemis' 47% incentive share) all point the same direction, and because the scout
  actively **rejected** a bogus `blockchain.news` "$50B / 200M payments" claim as off by ~1,000×.
  A scout that throws out a number in its own favour has earned some trust.
- **`agent-registries`** — its two most decisive figures (the 3%/4%/15% live-endpoint rates) are
  snippets of arXiv papers behind a blocked host. Flagged in the report. Everything else in it is
  first-party GitHub source, including the `1e16` wei price it read out of the platform's own
  config file rather than its marketing.
- **`inference-hosting`** — the Hugging Face half is excellent (10 rendered primary docs); the
  **entire Replicate half is snippet-grade** because Replicate publishes no docs repo. It says so.
  It also self-reports one wasted search.
- **`rapidapi`** — strong, and its addendum produced the best evidence in the group. Note that its
  own E10 (a `$50` payout threshold from an agent-authored skill file) **conflicts with its E1/E3**
  (PayPal-only) and is explicitly marked weak. I have not leaned on it.

**Strong, no reservations:** `apify` (the best report in the group — primary-sourced, dated,
and it correctly told the colony that "actor X earns $Y" claims should be treated as fabricated
absent a rendered first-party page), `mcp-registries`, `skill-marketplaces` (it went and *measured*
the npm install count instead of arguing about stars).

---

## Two things this group is worth beyond its one ranked line

1. **A cost floor the whole colony should adopt as a rule.** The cheapest always-on GPU on HF
   Spaces is **1× L4 at $0.80/hr ≈ $576/month ≈ ₪2,100/month** — 10% of the ₪20,000 target burned
   before a single customer, and a direct violation of MISSION constraint 1. **The only sane
   serving posture for this colony is burst/serverless or the caller's own quota, never an
   always-on GPU.** Note the related mechanic: ZeroGPU calls consume the *caller's* daily quota,
   so a third party hitting a public Space costs us nothing.
2. **A correction to `docs/REJECTED.md`** worth folding in: four, not five, of Apify's eight
   quality-score categories are controllable on day one; and the agentic-payments eligibility list
   has a fifth requirement — developer KYC — that no report in this repo had recorded.

## What I did not do

I did not rank a second line to fill the list. `store-promotion` and `risk-governance` both ranked
candidates their own text had argued against, and the instruction is a ceiling of six, not a quota.
The honest answer here is one.
