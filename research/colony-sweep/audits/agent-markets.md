# AUDIT — group `agent-markets`

Auditor: AUDITOR agent, independent of the group supervisor. Date: 2026-09-03.
Mandate: refute, not agree. Default verdict is "not confirmed" unless the evidence renders.

## Evidence rules used here
- **RENDERED** = I fetched the page myself in this container and read it.
- **SNIPPET** = a search-result summary of a page the egress proxy blocks. Never presented as a
  rendered page.
- Domains confirmed EGRESS_BLOCKED from this container during this audit: **`apify.com`**
  (re-tested this session, still blocked). Inherited from the scouts and not re-tested:
  `api.apify.com`, `blog.apify.com`, `help.apify.com`, `docs.rapidapi.com`, `zylalabs.com`,
  `marketplace.apilayer.com`, `help.poe.com`, `developers.openai.com`, `huggingface.co`,
  `replicate.com`, `smithery.ai`, `glama.ai`, `mcp.so`, `claude.com`, `note.com`, `coindesk.com`,
  `arxiv.org`, `whitepaper.virtuals.io`, `docs.agentverse.ai`, `olas.network`.
- What did render: `raw.githubusercontent.com` (Apify docs and legal terms) and WebSearch snippets.
- **WebSearch calls spent: 3 of 5 allowed.** Two were spent refuting the single load-bearing claim
  under the group's only ranked line; one on whether the metric its firstStep names exists.

---

## Headline of this audit

**The supervisor's negative findings are the best work in this sweep. Its one positive finding does
not survive two searches.**

Seven of eight rejections are well-sourced, primary-anchored and correct, and the report deserves
credit for reading a smart-contract config and a JSON schema instead of marketing copy. But the
single ranked line rests on one empirical claim — *"the query set is thin — the scout's searches for
Israeli government open-data Actors returned no competitor"* — and that claim is **false**. Apify
Store already carries at least five Israeli-data Actors, two of them wrapping the identical
`data.gov.il/api/3/action/datastore_search` endpoint our shipped product wraps, one of them
published with a price ($7.50 per 1,000 results), and one of them advertising coverage of **33
Israeli data sources** — which is more than the supervisor's own estimate of how many distinct
Israeli datasets exist to serve.

With the "no competitor" premise gone, so goes the whole reason a no-brand entrant was said to be
able to place, so goes the Hebrew-schema moat, and so goes the supply estimate that bounded the
line. The remaining product is a paid convenience wrapper over a **free, keyless, documented public
API**. That is the price-floor-of-zero test the previous audit in this colony demanded be run on
the *top* candidate, and it fails it.

Corrected: **₪600 → ₪200/month at 12 months, ₪0 for at least the first nine.** That is below the
sweep's own ₪300 rejection bar (`src/revenue/criteria.ts:362`: *"Reject ruthlessly: … an honest
ceiling under ₪300/month"*), so by the group's own stated rule this line should have been rejected,
not ranked at 55.

**The group's corrected ceiling is ₪200/month. The supervisor's own headline — "this group cannot
reach ₪20,000/month" — was right, and was still an understatement.**

---

## 1. Israeli-source public-data Actors on Apify Store — **REFUTED**

Corrected ceiling: **₪200/month at 12 months** (from ₪600), **₪0 for months 1–9**.
Israel payable: **YES** — attacked below, and it holds. Payability is not the failing gate.
Corrected disposition: **not a ranked line.** Below the group's own ₪300 bar.

### What survives, and it is real work

Four verifications I re-ran myself against Apify's own docs source, all **RENDERED** from
`raw.githubusercontent.com/apify/apify-docs`:

- **The fifth agentic-payments requirement is real and the supervisor found it.** `_agentic-
  payments-eligibility.mdx` lists PPE-only, events-only, limited permissions, no Standby, **and**
  *"The Actor's developer must have finished identity verification (KYC). Until this verification is
  complete, their Actors remain ineligible."* The scout missed it; the supervisor caught it. This is
  the single most useful new fact in the report and it belongs in the repo.
- **§2.2.4.2(i) is quoted accurately and its consequence is drawn correctly.** Verbatim: *"Unless we
  explicitly agree otherwise in writing, directly or indirectly offer, link to, or promote any
  product or service outside of the Platform in your Actors or in any other content you publish on
  Apify Store."* The supervisor is right that this kills the Actor-README-as-funnel play. Nobody
  else in this repo had found it.
- **§10.1.2 and §10.3.2 quoted correctly.** KYC before Verified Creator and payout; USD 20 PayPal /
  USD 100 other. I also confirmed **no country or jurisdiction restriction of any kind** appears in
  the Store Publishing Terms.
- **The eight quality-score categories are quoted correctly**, and so is the discovery-surface
  sentence: the score *"directly influences your visibility in Apify Store"*, and *"Actors with
  higher quality scores tend to rank higher on both surfaces"* (Store search and the MCP
  `search-actors` tool).

The rejections are separately strong and I am not re-litigating them; see §2.

### The price floor is zero, and the niche is not thin — the decisive finding

The whole ranking rests on this sentence: *"the query set is thin — the scout's searches for Israeli
government open-data Actors returned **no competitor**, and Hebrew source schemas are a real barrier
to the '98 actors in 6 months' volume builders who cannot read them."*

**SNIPPET, WebSearch 2026-09-03** (`apify.com` is EGRESS_BLOCKED, so these are canonical Store URLs
and their search descriptions, not rendered pages — stated plainly, and sufficient to refute an
*absence* claim):

| Actor on Apify Store | What the snippet says |
|---|---|
| `apify.com/parseforge/israel-companies-registrar-scraper` | *"turns the https://data.gov.il/api/3/action/datastore_search public endpoint into a clean, structured dataset, parses the response, and flattens it into one row per record"* — **priced from $7.50 per 1,000 results** |
| `apify.com/bovi/israel-companies-registrar` | *"queries the government's own open-data CKAN API (data.gov.il/api/3/action/datastore_search) — a free, keyless, official public dataset"*; **pay-per-event, one charge per company record delivered** |
| `apify.com/lentic_clockss/israel-data-search` | *"searches **33 Israeli data sources** including ICA company registry, contractor licenses, health directories, cannabis pharmacies, and government procurement tenders"* |
| `apify.com/parseforge/tase-tel-aviv-listings-scraper` | Tel Aviv Stock Exchange listings |
| `apify.com/alinz/israel-real-estate-index` | *"Israel Real Estate Data API — Prices, Rent & Yield by City"* |
| `apify.com/behar.system/deleted-actor-2105817466` | *"Israeli Business Lookup — Company Search, KYB, Risk Score API"* — **deleted**, i.e. an entrant that already came and went |
| a generic CKAN Actor | *"Search and export open data from any CKAN portal: data.gov, data.gov.uk, the EU Data Portal and thousands of government catalogs"* — subsumes data.gov.il entirely |
| `rapidapi.com/appaio/api/israel-company-data` | the multi-homing idea is taken on the other hub too |

Four things die at once:

1. **"No competitor" is false.** Two Actors wrap the identical endpoint
   `products/apify-il-open-data/src/ckan.ts` wraps. One of them uses the identical money model
   (pay-per-event, one charge per record).
2. **The Hebrew-schema moat is false.** The competitors read the Hebrew schemas. `parseforge` and
   `bovi` are not our language barrier; they are our product.
3. **The supply estimate is refuted by a single competitor.** The supervisor's own bound on how big
   this can get was *"my estimate is one to two dozen"* distinct Israeli datasets. `lentic_clockss`
   advertises **33 sources in one Actor**. The entire proposed portfolio is inside one incumbent
   listing.
4. **The price floor is zero.** `bovi`'s own listing text is the refutation, in the competitor's
   words: the source is *"a free, keyless, official public dataset."* Our shipped README says the
   same thing about itself — *"uses only the documented JSON API"*. The buyer's alternative to
   paying us per record is `curl https://data.gov.il/api/3/action/datastore_search?resource_id=…`
   at ₪0, no key, no account. What we sell on top is Hebrew→English key mapping and type coercion.
   That is genuine work and it is a thin, copyable margin — `parseforge` already ships "parses and
   flattens" for $7.50/1,000.

This is precisely the test the `store-promotion` audit ran on that group's #2 and demanded be run on
a group's #1. This supervisor did not run it on its own #1 either. **The colony has now made the
same mistake twice in a row.**

### The named acquisition channel is half-closed by construction

MISSION constraint 7 requires a named channel. The supervisor names one — Store search and the MCP
`search-actors` tool — and then argues a newcomer can place because *"four of the eight ranking
categories are fully controllable on day one with zero users."*

Read that sentence the other way, which is the way that decides the money. I have the definitions
**RENDERED** from `quality_score.mdx`:

| Category | Definition (verbatim) | Available to a brand-new anonymous listing? |
|---|---|---|
| Reliability | *"maintains high run success rates and passes automated quality assurance tests"* | Partly — needs run history |
| **Popularity** | *"the number of users running your Actor, save counts, and return usage patterns"* | **No** |
| **Feedback and community** | *"Users who have run your Actor multiple times are invited to provide reviews"* | **No** |
| Ease of use | *"how quickly users can understand and successfully run your Actor"* | Partly |
| Pricing transparency | clear, predictable costs | Yes |
| Trustworthiness | *"follows the principle of least privilege by using limited permissions"* | Yes |
| **History of success** | *"**Developers** with a proven track record of publishing successful Actors receive recognition"* | **No — and it is developer-level, not Actor-level** |
| Congruency of texts | consistency across the Actor's components | Yes |

So roughly **half the score is structurally unreachable** on day one, and one of the unreachable
halves attaches to the *developer account*, not the Actor — a new anonymous creator starts at the
floor there and stays there until a first Actor succeeds. The channel therefore reads: we rank in
the bottom half of a 67,000-Actor store, on the only surface named, against incumbents who already
have the users, the reviews and the track record in this exact niche. The supervisor presented the
same arithmetic as grounds for optimism. It is the reason the line earns ₪0 for a long time.

The supervisor also writes that *"Reliability and History of success need run history, not just
users"* — naming two of the four unreachable categories and quietly leaving out **Popularity**,
which is the one that is purely users. That is the identical selective-quotation move the
`store-promotion` audit caught (its error #4, `sortBy` with `popularity` dropped). Same group, same
platform, same omission, one day later.

### And the channel cannot be observed from inside this colony

This is new and nobody in the group noticed it. `apify.com` **and** `api.apify.com` are
EGRESS_BLOCKED from the container the colony runs in — the apify scout says so, the store-promotion
audit says so, and I re-confirmed `apify.com` this session. The supervisor then writes a kill
criterion — *"Zero runs from paid-plan users 60 days after listing → kill the line"* — and a
30-day observation plan, both of which require reading Apify's own dashboard or API.

**The colony cannot evaluate its own kill criterion on its own named acquisition channel.** Either
the owner reads the dashboard (a recurring manual op MISSION forbids), or the egress rule changes,
or the line runs unmeasured, which is the failure mode MISSION rule 5 exists to prevent. A channel
you cannot measure is not a tested channel; under constraint 7 it is still ₪0.

### Ceiling — refuted at ₪600, and the method is the problem

The supervisor's derivation is: the store-promotion auditor set a *generic* Apify portfolio at
₪1,500; ours is thinner; ₪600 is "roughly one-third of the mean payout". Three faults:

1. **It anchors to a number this repo's own code calls unverified.** `src/revenue/portfolio.ts:36-40`:
   *"UNVERIFIED (checked 2026-09-03): the '$470/developer/month average…' figures come from a
   partner/marketing page, NOT from Apify's documentation… Same evidence class as the x402 number
   that proved 29× wrong."* Taking a fraction of an unverified power-law mean is a method, not a
   measurement.
2. **It is derived downward from a generic portfolio instead of upward from the base rate the
   supervisor itself quotes.** Do it upward. Only paid-plan users produce any developer revenue.
   The only published portfolio datum is 855 monthly users across 98 Actors = **8.7 users/Actor** —
   and that builder had no direct competitor sitting on his exact query. Ours does, now, at least
   three of them. A maintained set is 5–8 Actors, because Apify's own `why_publish.md` says reserve
   **~2 hours per week per public Actor**. Take 6 Actors × 8 users × a generous 20% on paid plans ≈
   **10 paying users**, at Apify's own store norm of $1–10 per 1,000 results, so a few dollars each
   per month → **$15–40 gross → 80% minus platform usage ≈ ₪45–110/month.** Double it for optimism
   and you reach ₪200. That is the corrected ceiling, and it is arithmetic from the report's own
   inputs, not a haircut on someone else's number.
3. **₪200 is below the group's own reject bar.** `src/revenue/criteria.ts:362` instructs the
   supervisor to reject anything whose honest ceiling is under ₪300/month. The supervisor ranked it
   anyway, at 55.

Time-to-first-shekel makes it worse and is never computed: at that revenue the **USD 20 PayPal
minimum takes months to clear**, the payout invoice only cuts on the 11th, and §10.3.2 forfeits a
below-minimum balance after twelve continuous months. The realistic first ledger entry is month 9
or later, if ever.

### The firstStep is not executable as written — three defects

The brief for this audit says to check any symbol a builder is told to call. All three fail.

1. **It names the wrong system for the measurement.** *"record in the ledger schema: Store-search
   impressions, run count, and whether any run came from a paid-plan user."* The ledger cannot hold
   any of that. `src/revenue/types.ts:63`: `LedgerKind = "sale" | "subscription" | "payout" |
   "refund" | "cost"`, and an entry is `{amountMinor, currency, amountAgorot, source, externalId}`.
   There is no impressions field, no run-count field, no plan field. The correct call is
   `recordKpi(db, lineId, kpi, value, unit)` (`src/revenue/ledger.ts:633`), which writes to
   `revenue_kpi_snapshots`. A builder following this instruction literally would either fail or —
   far worse — write non-money rows into the money ledger, corrupting the one artefact MISSION §2
   says is the only definition of revenue.
2. **"Store-search impressions" does not appear to exist as a developer metric.** SNIPPET,
   WebSearch 2026-09-03: Apify's Actor analytics (Development → Insights → Analytics) exposes
   *builds and runs, total users, active users (7/30/90 days), reviews, average ratings and
   bookmarked users*. No impressions. Nor is there any documented per-run attribution of the
   caller's plan tier; revenue > 0 is the only proxy. So the constraint-7 test — *can a stranger
   find it* — is specified against a number the platform does not publish.
3. **It is blocked on an owner step the report itself says is not done.** The firstStep is *"Publish
   one Actor … **PPE-priced**"*. This repo's own `src/revenue/portfolio.ts:100` records, from
   Apify's terms, that KYC *"gates ALL THREE of: receiving any payout, **setting a price on an
   Actor**, and x402/agentic eligibility. Publishing free Actors is the only thing possible before
   it."* The supervisor lists the KYC blocker and then writes a first step that cannot begin until
   it clears — when the cheapest constraint-7 test (publish free, watch whether anyone runs it) does
   **not** need KYC at all. The report unnecessarily parked its own first test behind the owner.

### The plan collides with MISSION constraint 6, and the supervisor half-knew it

The proposal is *"a small set of pay-per-event Actors … one Actor per genuinely distinct dataset."*
But `products/apify-il-open-data` is **already one generic Actor that serves all of them** — one
CKAN client, one field dictionary, `mode: search_datasets | fetch_records`, `resourceId` as an
input. Splitting it into N listings adds no capability to any buyer; each new listing is the same
code with a different `resourceId`. That is the substitution shape constraint 6 names, on a platform
whose §2.2.3 forbids copying listings and whose `$1M Challenge` terms disqualify *"publishing too
many low-quality or spammy Actors"* (surfaced by the previous audit; still never asked of an Apify
#1 candidate).

For the record I ran the repo's own screens rather than arguing: `screenProposal()` on the
candidate's full text returns **GREEN** — so the proposal does not *say* the forbidden thing, which
is exactly the caveat that function prints about itself. And `checkHonestStorePlan(12, 1)` returns
`ok:false` — *"12 stores rest on only 1 distinct sources"*. Whether data.gov.il is one source or 33
is the question that decides this line, and **nobody in the group asked it.** The competitor who
put 33 sources in a single Actor has answered it in the direction that hurts.

### Israel payability — attacked, and it holds

**YES, unchanged.** I re-read the Store Publishing Terms in full: **no country list, no jurisdiction
clause, no exclusion of Israel anywhere** — only the sanctions/watchlist suspension right, and
Israel is not sanctioned by the EU or Czechia. §10.3.2 gives PayPal at USD 20, and PayPal Israel
withdraws to an Israeli bank in ILS. Two independent rails (PayPal, and SWIFT at USD 100) reach
Israel. Payability is not what kills this line.

Two costs the supervisor's gross ₪600 never nets, both already recorded elsewhere in this repo:
**18% Israeli VAT on PayPal fees since 6 July 2026** (`scouts/payment-rails--paypal-israel.md`),
and USD→ILS drag estimated there at 5–9% on small tickets. On a ₪200 line those are not rounding.
The Wise alternative is snippet-grade in both directions — the T&C names only PayPal at $20 and
"any other payout option" at $100; Wise-at-$20 comes from a docs page, and Wise's Israeli-resident
verification requirement since 31 March 2025 is unconfirmed. Correctly hedged by the supervisor.

### The constitution question, which was again not asked of the group's own #1

MISSION rule 4 names it explicitly: *"charging for something already free … is a violation — not a
TODO."* Our Actor charges per record for data that data.gov.il serves free and keyless. My reading
is that this is **defensible but not automatic**: the Hebrew→English mapping, typing and pagination
handling are real transformation, and Apify's whole store is built on paid convenience over public
sources. But it is a question that must be asked and answered on the listing, and the report never
asks it. Given that a competitor's own listing text advertises the source as *"free, keyless,
official"*, the honest listing has to say so too — which is itself a material constraint on price.

---

## 2. The rejections — audited, and they mostly hold

I checked the rejections for the failure mode that costs money: a *correct* rejection whose
supporting evidence is weaker than claimed, and a rejection that discards something valuable
alongside the thing being rejected.

| Rejected item | Rejection verdict | Note |
|---|---|---|
| GPT Store revenue program | **CONFIRMED** | No open application path anywhere. Payability moot. |
| Apps in ChatGPT / Apps SDK | **CONFIRMED** | Correctly refused to build against an unresolved page. |
| Poe creator monetization | **CONFIRMED, on the pool, not the country** | "Israel absent from ~18 of a claimed 23 countries" is absence-of-evidence from a blocked page. The rejection is safe anyway: $100k platform-wide **lifetime** payout is the killer, and the supervisor leads with it. |
| APILayer | **CONFIRMED** | UNKNOWN payability plus a discretionary human review gate. Correct on both grounds. |
| Character.AI / Coze / FlowGPT | **CONFIRMED** | No rail exists. |
| Hugging Face / Replicate | **CONFIRMED** | Best-verified rejection in the group: ten rendered primary docs, every money flow pointing developer→platform. |
| HF Inference Provider | **CONFIRMED** | Team/Enterprise gate, HF takes no markup, we do not run GPUs. |
| MCP registries | **CONFIRMED** | The strongest single artefact in the sweep: the official server schema has no price/billing field at all. Read from the schema, not from marketing. |
| ERC-8004 | **CONFIRMED** | *"Payments are orthogonal to this protocol"*, verbatim from the ERC. |
| Olas Pearl staking | **CONFIRMED** | Emissions on posted collateral. Correctly refused as not-revenue. |
| Virtuals / Fetch.ai tokenization | **CONFIRMED** | RED on the constitution before economics. Correct. |
| Fetch.ai Agentverse | **CONFIRMED** | *"future monetization"* is the whole finding. |
| Virtuals ACP selling | **CONFIRMED** | $1M/month is a protocol subsidy in a launch press release. Correctly read. |
| Apify rent-an-actor / pay-per-usage / saturated categories | **CONFIRMED** | Dated from Apify's own sunset partial. |
| Apify "opportunity finder" Actors | **CONFIRMED** | Saturation signal, correctly read. |
| Running our own directory | **CONFIRMED** | Selling attention we do not have. Constitution-correct. |

Two rejections where the *conclusion* holds but the *handling* is wrong, and both are the same
error — the supervisor kept the pessimistic half of a scout's conclusion and threw away the
operative half:

- **RapidAPI/Zyla multi-homing — rejection as a *revenue line* CONFIRMED; discarding the scout's
  actual recommendation is an error.** The Michael Lynch series is the best evidence anyone produced
  in this sweep and the structural finding (the money was in human-negotiated enterprise contracts
  we are forbidden to pursue) is exactly right. But the scout's own F5 was *"multi-homing an
  already-built origin is cheap and worth doing **as a distribution experiment**… well under 40
  hours, and under 10 if the origin is already deployed"* — and it explicitly separated that from
  "nothing here should be built *for* these marketplaces". The supervisor quoted the second half and
  dropped the first. Under constraint 7 a <10-hour second acquisition channel for an origin we
  already run is not judged on its own ceiling; it is judged as a test of whether a stranger arrives.
  It should have been carried as a distribution experiment with ₪0 forecast, not deleted.
  *(Newly relevant: `rapidapi.com/appaio/api/israel-company-data` already exists, which strengthens
  the rejection of the ceiling and weakens the "we would be the only one" story on both hubs.)*
- **Claude skill/plugin marketplaces — rejection as a *revenue line* CONFIRMED; burying the finding
  is the error, and it is the same error the previous audit named.** The scout's bottom line was not
  "dead end". It was: *"the one shape that works is the one Vercel, Supabase, Sentry and Adobe are
  using in the official marketplace right now: ship a free plugin that is genuinely useful on its
  own and whose deeper function calls a paid service you already operate. **We already operate
  four.** That is a ~1-2 day integration task."* The supervisor rejected the row and never surfaced
  that. Given that Apify §2.2.4.2(i) has just closed the Actor-README funnel, and that MISSION
  constraint 7 says the acquisition problem outranks every ceiling in the repo, **a free, zero-cost,
  no-KYC listing channel into a 500+ entry official catalogue is worth more to this colony today
  than the ₪200 line the group ranked.** It was in a rejection table.

One evidence caution that does not move a verdict:

- **The x402 headline number is internally inconsistent and was used anyway.** The supervisor's
  headline leans on *"the #1 seller in the entire x402 protocol has earned $3.12K cumulative"*
  across 108,000 transactions — $0.029 per transaction, against the *same snippet's* market average
  of ~$0.30/call, a 10× discrepancy inside one table from a blocked `note.com` page. The scout
  flagged the source as SNIPPET-only; the supervisor promoted it to the group headline without
  reconciling it. The rejection stands regardless on better-grade evidence (CoinDesk's ~$28k/day
  *"much of it from testing and 'gamed' transactions"*, Artemis' 47% incentive share, and the −77%
  volume trend) — but the sentence as written over-claims.
- Similarly, *"Olas mechs default to $0.01/job"* flattens a hedge the scout was careful to keep:
  `1e16` wei is 0.01 of the **chain's native token**, which the scout correctly priced on Gnosis
  (xDAI ≈ $0.01) while noting identical `_polygon`/`_optimism` variants — where 0.01 ETH is two
  orders of magnitude more. Doesn't change the verdict (demand is endogenous), but the scout was
  more careful than its supervisor.

---

## 3. Supervisor's own errors

1. **The load-bearing empirical claim under its only ranked line is false.** *"The scout's searches
   for Israeli government open-data Actors returned no competitor"* — at least five Israeli-data
   Actors are on Apify Store, two wrapping the identical `data.gov.il` datastore endpoint, one
   priced at $7.50/1,000 results, one covering 33 Israeli sources.
2. **It did not run the price-floor test on its own #1** — the exact failure the previous audit in
   this colony named, and named as a rule to apply to top candidates. The source data is free,
   keyless and documented, and a competitor's own listing says so.
3. **It repeated the selective-quotation error the previous audit caught, on the same document.**
   It names *"Reliability and History of success"* as the categories needing run history and omits
   **Popularity** — literally "the number of users running your Actor" — from a four-item set it was
   summarising.
4. **It presented a half-closed ranking surface as evidence of openness.** "Four of eight
   controllable" means half the score, including the developer-level History of success, is shut to
   a new anonymous account. That is a reason the line earns ₪0, not a reason it can place.
5. **Its firstStep instructs a builder to write non-money metrics into `revenue_ledger`.** The
   ledger's kinds are `sale|subscription|payout|refund|cost`; the right call is `recordKpi`. This is
   the one file MISSION §2 makes load-bearing, and the instruction would corrupt it.
6. **Its firstStep names a metric that does not exist.** Apify's developer analytics expose runs,
   users, active users, reviews, ratings and bookmarks — not "Store-search impressions".
7. **Its firstStep is gated behind a blocker it itself lists as not done.** "Publish one Actor,
   PPE-priced" requires KYC before a price can be set. The free-Actor version of the same test needs
   no owner step and would have satisfied constraint 7 immediately.
8. **It wrote a kill criterion the colony cannot evaluate.** `apify.com` and `api.apify.com` are
   egress-blocked from this container; "zero runs from paid-plan users at 60 days" is unreadable
   from inside the system that must act on it.
9. **Its ceiling breaks the group's own reject rule and it did not notice.** ₪300 is the stated
   floor (`src/revenue/criteria.ts:362`); the corrected ceiling is ₪200; even the supervisor's own
   ₪600 was set by taking a fraction of a figure this repo's code labels UNVERIFIED.
10. **It contradicted itself on the RapidAPI payout threshold.** The rejection table leans on *"a
    reported $50 payout threshold (2–5 months per payout at those earnings)"* as part of the
    structural kill; the scouts section says of the same E10 *"explicitly marked weak. I have not
    leaned on it."* It did lean on it.
11. **It aimed its correction at the wrong file and left the wrong number live.** It offers *"a
    correction to `docs/REJECTED.md`"* on the five-vs-four question while
    `src/revenue/portfolio.ts:52` still says *"FIVE are controllable on day one"* and
    `TARGET_BASIS["apify-actors"]` still carries **₪3,000, grade `"measured"`**, sourced to the same
    partner page the file's own comment calls unverified. The board computes from the code, not from
    `REJECTED.md`. A supervisor setting ₪600 while the code says ₪3,000 "measured" is a 5×
    divergence it never reconciled.
12. **Its ranked plan conflicts with the code's kill criteria.** The line's own kill trigger in
    `portfolio.ts` is *"under 25 monthly users across all Actors after 60 days live **with 10+
    Actors**"*, while the firstStep says *"do not build Actors 2..N until that one Actor has a
    single paid run."* A one-Actor line can never fire its own kill criterion. Nothing would ever
    kill it.
13. **It buried the group's most valuable output in a rejection table** — the free-plugin funnel
    into the official Claude catalogue, which is an *acquisition channel* for four products we
    already run, in a repo whose binding constraint 7 says acquisition outranks every ceiling. This
    is the identical failure the previous audit recorded as its error #3.
14. **It promoted a snippet with a 10× internal inconsistency to its group headline** (the $3.12K /
    108,000-transaction x402 seller row) without reconciling it against the same source's $0.30
    average ticket.

---

## 4. Angles the group missed entirely

1. **Nobody asked whether the colony can observe the channel it named.** `apify.com` and
   `api.apify.com` are blocked from the container. Every KPI, every kill criterion and the entire
   constraint-7 test for the ranked line live behind that wall. This should have been the first
   question asked of any Apify plan and it was asked by nobody in eight scout reports plus a
   supervisor.
2. **Nobody asked the anonymity question, which MISSION added today.** Apify KYC requires a *"full
   name that matches your legal ID card"*; Verified Creator status is public; Store URLs are
   `apify.com/<creator>/<actor>`. Whether the creator profile displays the legal name or only a
   handle is **unresolved** — I read the whole Store Publishing Terms and it does not say. The T&C
   does allow a company instead of an individual, but the company does not exist yet. For a group
   whose only ranked line requires a public creator identity, this is a gate, not a footnote.
3. **Maintenance never entered the agent-markets arithmetic.** Apify's own `why_publish.md` says
   reserve **~2 hours per week per public Actor** with a publicly visible support response time. The
   previous audit surfaced this; this supervisor proposed "one to two dozen" Actors without carrying
   it. Two dozen Actors is 48 hours a week, forever, against MISSION constraint 4's ceiling of about
   **eleven minutes per store per month**. Maintenance alone caps this line at a handful of Actors,
   independent of every other finding.
4. **Every ceiling is gross.** Platform usage is deducted before the 80%; then 18% Israeli VAT on
   PayPal fees since 6 July 2026; then USD→ILS drag of 5–9% on small tickets. On a ₪200 line the fee
   side is a larger effect than anything argued about in the ranking. *(One genuine positive the
   supervisor also never computed: data.gov.il needs no residential proxy, so platform usage cost on
   this Actor is unusually low — the margin structure is the best part of the line and nobody
   modelled it.)*
5. **Time-to-first-shekel is never stated.** USD 20 minimum, invoice on the 11th, forfeiture of a
   below-minimum balance after twelve continuous months. At the corrected ceiling the first ledger
   entry lands around month 9 — if the balance ever clears $20 at all. A group ranking one line
   should say that on the face of the ranking.
6. **The colony's own MCP server was never considered as the thing being distributed.** The group
   studied MCP registries exclusively as revenue lines and correctly found no rail — then stopped.
   `products/mcp-il-tools` exists and is shipped. Whether it can be listed in the official MCP
   registry, Docker's catalog or the Claude connectors directory as a **free acquisition channel**
   for the paid rails we already run is a different question with a different answer, and it was
   never asked. Same shape as missed angle #5 of the previous audit.
7. **Rail concentration was not tested.** The one surviving line pays through PayPal, which is also
   the RapidAPI rail and a rail the repo already depends on. MISSION requires that one rail failing
   must not take the company down. A one-line group cannot diversify, but it can say so.
8. **The base rate was available and never divided.** 67,000+ Actors in the store against ~3,000
   developers receiving payouts is a ~4–5% chance that a listing earns anything at all — the same
   order as the 5% hit rate `src/revenue/growth.ts` already assumes (`MEASURED_ASSUMPTIONS.hitRate =
   0.05`). The supervisor had both numbers in its own text and never divided them, so it never
   noticed that its ranked line is a coin-flip *at the platform's base rate*, before competition.
9. **Nobody asked whether the existing single Actor is the right shape.** The strongest version of
   this line is not N Actors: it is **one** well-maintained Actor (the one already built, which
   already covers every dataset), priced honestly, with maintenance load of 2h/week instead of 48.
   That version is not doorway-shaped, does not trip constraint 6, has one-Nth the support burden,
   and has the same ceiling — because the ceiling is set by buyers, not by listing count. The
   supervisor's instinct to multiply came from the store-count arithmetic in MISSION, which
   constraint 6 exists to restrain.

---

## Corrected summary

| # | Candidate | Supervisor | Audit | Ceiling ₪/mo | Israel |
|---|---|---|---|---|---|
| 1 | Israeli-source public-data Actors on Apify Store | ranked, score 55 | **REFUTED** | 600 → **200** | YES (holds) |

**Group total: ₪600/month claimed → ₪200/month defensible, ₪0 for at least nine months, and below
the group's own ₪300 rejection bar.** The supervisor's headline — *"this group cannot reach
₪20,000/month, and that is a finding, not a research failure"* — is correct, well earned, and the
most valuable sentence in the report. The correct disposition is that `agent-markets` produced
**zero ranked lines and two acquisition-channel leads** (the free-plugin funnel into the official
Claude catalogue; multi-homing an already-running origin as a discovery test), and that the leads
are worth more than the line, because MISSION constraint 7 says they are.

What should survive into the repo from this group, none of which is a revenue line:
- The fifth agentic-payments requirement (developer KYC) — a genuine new fact, correctly found.
- §2.2.4.2(i): no off-platform promotion inside Actors or Store content. This closes a funnel the
  colony was implicitly counting on.
- The always-on-GPU cost floor (1× L4 at $0.80/hr ≈ ₪2,100/month) as a standing rule.
- The correction that four, not five, quality-score categories are controllable on day one — applied
  to `src/revenue/portfolio.ts:52`, not only to `docs/REJECTED.md`.
- And the correction this audit adds: `TARGET_BASIS["apify-actors"]` must not remain **₪3,000 graded
  `"measured"`** on the strength of a partner page the same file calls unverified. On this evidence
  it is ₪200, grade `estimated`, and `docs/REJECTED.md`'s *"the niche is thin and the knowledge is
  already ours"* is no longer true of the niche.
