# AUDIT — group `store-promotion`

Auditor: AUDITOR agent, independent of the group supervisor. Date: 2026-09-03.
Mandate: refute, not agree. Default verdict is "not confirmed" unless the evidence renders.

## Evidence rules used here
- **RENDERED** = I fetched the page myself in this container and read it.
- **SNIPPET** = search-result summary of a page the egress proxy blocks.
- Domains confirmed EGRESS_BLOCKED from this container during this audit:
  `apify.com`, `help.apify.com`, `docs.apify.com`, `docs.rapidapi.com`,
  `developer-docs.amazon.com`, `developer-docs.amazon`, `spapi.cyou`,
  `thatmarketingbuddy.com`, `otterly.ai`, `localseoisrael.co.il`,
  `make.wordpress.org`, `agentbyline.com`.
- What did render: `raw.githubusercontent.com` (Apify docs, WordPress guidelines, Amazon
  SP-API models) and `WebSearch` snippets.

---

## Headline of this audit

**The supervisor's group report is directionally right and evidentially unreliable.** Its
one-line summary ("almost no money here") is correct and is the most valuable thing in it.
But the report then assigns four ceilings summing to **₪15,500/month** — roughly 78% of the
₪20,000 target — from a group it just described as earning almost nothing. Both statements
cannot be true. My corrected ceilings for the same five candidates sum to **₪3,000/month**,
and the honest month-one figure for every one of them is **₪0**.

Separately, three of the supervisor's factual claims about its own scouts are false against
the files on disk, and its central mechanism claim about Apify Store is contradicted by
Apify's own documentation, which neither the scout nor the supervisor found.

---

## 1. Apify Store multi-Actor portfolio — **DOWNGRADED**

Corrected ceiling: **₪1,500/month** (from ₪4,000). Israel payable: **YES** (holds).
Corrected build: **40h buys 5–8 Actors, not ~40**, and the build is not the constraint.

### What survives
RENDERED, `raw.githubusercontent.com/apify/apify-docs/.../store-publishing-terms-and-conditions.md`:
- *"To become a Verified Creator and receive a payout, you must successfully complete
  identity verification and the Know Your Customer (KYC) process."* — the ownerBlocker is real.
- *"Your payout for a monetized Actor will be calculated as 80% of the fees paid by Users
  for your Actor, minus Platform usage costs for the corresponding Actor runs."* — 80/20 holds.
- *"Creating an Actor that offers similar functionality or an outcome similar to another
  Actor is permitted."* — the no-policy-risk claim holds.
- *"The minimum amount payable is USD 20 for PayPal and USD 100 for any other payout option"*
  — the payout blocker is real.
- No country exclusion list; only a sanctions/watchlist clause. Israel is not sanctioned.

### Israel payability — attacked, and it holds
PayPal Israel withdraws to an Israeli bank account or Israeli credit card **in ILS**
(SNIPPET, PayPal IL help). Apify also pays by SWIFT wire from the Czech Republic at a
USD 100 minimum. Two independent routes reach Israel. **YES stands.**

**But a cost the supervisor missed:** this repo's own sibling scout
(`research/colony-sweep/scouts/payment-rails--paypal-israel.md`) records that from
**6 July 2026** PayPal services for Israelis moved to *PayPal Israel Payment Services Ltd.*
and **18% Israeli VAT is charged on PayPal fees**. Nothing in the group report accounts for
this on either PayPal-dependent line.

### Ceiling — refuted at ₪4,000
The supervisor's own headline figure defeats it. `$1.4M/month` paid across `~3,000`
community developers (SNIPPET, apify.com/partners/actor-developers) is a **platform-wide mean
of ~$470/developer/month ≈ ₪1,730** — and it is a power-law mean, so the median developer
earns far less. The store now lists **53,954 tools** (same source). The supervisor set a
brand-new entrant's ceiling **above the mean of every developer already on the platform**.
Apify's own marketing language is *"no guaranteed floor"* (SNIPPET).

Corrected: **₪1,500/month at 12 months** for a small, genuinely maintained set. **₪0 in
month one**, and not one shekel moves until the USD 20 PayPal minimum is cleared.

### The central mechanism claim is overstated — this is the important finding
The supervisor wrote: *"A zero-run Actor is NOT structurally invisible here, which is untrue
of every other marketplace in this sweep"* and *"the whole lever is listing text, uptime,
schema congruence and freshness."* Apify's own docs say otherwise, and neither the scout nor
the supervisor located them:

- RENDERED, `sources/academy/build-and-publish/apify-store-basics/how_store_works.md`:
  *"Search ranking evaluates parameters similar to those in the Actor quality score. As a
  result, the two correlate strongly: Actors with higher quality scores tend to rank higher in
  Apify Store search and the Apify MCP server `search-actors` tool."*
- RENDERED, `sources/platform/actors/publishing/quality_score.mdx`: the score's eight
  categories are *"Reliability, Popularity, Feedback and community, Ease of use, Pricing
  transparency, Trustworthiness, History of success, Congruency of texts"*, where **Popularity
  is defined as "the number of users running your Actor, save counts, and return usage
  patterns"**, and the page's own description says the score *"directly influences your
  visibility in Apify Store."*

So accumulated usage **is** a ranking input on Apify, exactly as on the marketplaces the
supervisor rejected for that reason. Apify is *less* usage-locked than Etsy or Figma; it is
not the clean exception the report claims, and "History of success" means a portfolio of dead
listings actively harms the next one.

Also: the supervisor quoted the `sortBy` values as *"`relevance` … with `newest` and
`lastUpdate` as two further sorts"* and **silently dropped `popularity`**. The scout it was
grading had quoted all four correctly. Selective quotation in the direction of the
conclusion.

### Build estimate — refuted
RENDERED, `sources/academy/build-and-publish/why_publish.md`: *"Public Actors require higher
standards than private ones. Since users depend on your Actor, you'll need to commit to
regular maintenance — reserve approximately **2 hours per week** for bug fixes, updates, and
user support"*, and *"respond promptly to issues through the Issues tab, where your response
time is publicly visible."*

40 Actors × 2h/week = **80 hours per week of ongoing maintenance**, forever. The supervisor's
`buildHours: 40` for a ~40-Actor portfolio is ~1 hour per Actor including research, code,
input schema, README, testing and monetization setup. The binding constraint is not the
build, it is the permanent maintenance and support load — and "user support with a publicly
visible response time" is the hidden human-shaped work in the one line sold as needing no
human. An agent can plausibly answer, but nothing in the report tests that.

### One more thing the supervisor did not surface
Apify's own `$1M Challenge` terms disqualify *"Low-Quality Submissions: Publish too many
low-quality or spammy Actors, notwithstanding the fact that you may have published other
Actors that are high-quality"* and *"Fraud and Gaming: Any attempt to manipulate the Actor
Quality score."* The report asked the constitution question of Etsy and Chrome and never
asked it of its own #1.

### Misquote
The report says *"Unverified balances are forfeited after 12 months."* The T&C actually says
*"Any accrued payout that remains **below the Minimum Payout** for a continuous period of
twelve (12) months shall be deemed abandoned and forfeited."* Different clause, and the real
one bites harder on a low-earning portfolio.

---

## 2. Hebrew-first AI-answer visibility monitoring — **REFUTED**

Corrected ceiling: **₪0–500/month**. Israel payable: YES (not the failing gate).

### The price floor is zero, not $29 — and the supervisor already knew this test
The whole ranking rests on *"I verified the price floor myself (Otterly $29/$189/$489, Peec
$95/$245/$495) so the pricing headroom is real."* The Otterly tiers are correct — I
corroborated $29 Lite / $189 Standard / $489 Premium independently by search. **But those are
not the floor.** Free tools already do more than the proposal, in more engines (SNIPPET,
2026-09-03):

- **Semrush AI Search Visibility Checker** — free, **three checks per day, no account
  required**, covering ChatGPT, Gemini, AI Mode and AI Overviews, returning visibility score,
  total brand mentions, per-platform breakdown and the pages driving citations.
- **Ahrefs AI Visibility Checker** — free, queries ChatGPT, Gemini, Perplexity, Copilot and
  Google AI Overviews.
- **AI Rank Lab** — free, **25 prompts**, with citations, sentiment and competitor
  share-of-voice, no credit card.

The proposal is 15 prompts against **two** engines (Anthropic + OpenAI APIs), monthly, at
₪75/month (~$20). It is a strictly smaller product than three free ones.

This is the exact test the supervisor itself used to kill a candidate three sections later:
*"The price floor is zero and I verified it: Judge.me's Forever Free plan includes unlimited
orders AND unlimited review requests… Do not spend 40 hours rebuilding a free product."*
It applied that test to a rejected line and not to its own #2.

### The verification claim cannot be true as written
Both pricing URLs it says it verified itself — `thatmarketingbuddy.com` and
`localseoisrael.co.il` — are EGRESS_BLOCKED from this container, as is `otterly.ai`. The
numbers are right; the claim to have rendered them is not. Flagging because "I verified this
myself, not the scout" was the stated reason this candidate outranked others.

### There is no distribution, and this is a store-promotion group
The candidate has no marketplace, no storefront, no directory, no ranking surface — nothing
this group exists to study. Its ₪4,000 ceiling is ~53 Israeli SMBs paying ₪75/month, acquired
by an owner who does not sell, in a market where the report itself found the only Hebrew
evidence is *a competitor already selling the service*. That is evidence a competitor exists,
not that a buyer does.

The group's own scout wrote the refutation
(`research/colony-sweep/scouts/store-promotion--cross-promotion.md`, §5):
*"Cross-promotion is a multiplier on traffic, and a multiplier on zero is zero… The colony's
acquisition problem is upstream of this criterion, and no amount of internal linking
substitutes for it."*

### What survives
The honesty analysis is genuinely good: killing optimisation advice because llms.txt and
schema changes are measurably noise, and refusing to scrape the consumer ChatGPT surface, are
both right. Keep the reasoning. Do not fund the product.

---

## 3. WordPress.org plugin + Paddle/Freemius Pro tier — **DOWNGRADED**

Corrected ceiling: **₪1,000/month** (from ₪4,000). Israel payable: **YES**, with a caveat the
supervisor overstated in the other direction. Corrected build: **80–120h for three plugins.**

### A policy the supervisor missed, and it hits the money model directly
RENDERED, `raw.githubusercontent.com/WordPress/wporg-plugin-guidelines/trunk/guideline-05.md`
— **Guideline 5, "Trialware is not permitted"**: *"Plugins may not contain functionality that
is restricted or locked, only to be made available by payment or upgrade"* and *"Functionality
may not be disabled after a trial period or quota is met."* Paid services are permitted
*"provided all the code inside a plugin is fully available."*

The pitch as written — *"Free plugin as the acquisition channel; paid Pro tier"* — is only
compliant if the Pro code ships **outside** the directory plugin (a separate download, or a
genuine remote service), with nothing gated inside the .org-hosted code. That is buildable,
and it is what Freemius does, but it is a real design constraint the report reviewed
guideline 12 in detail and never mentioned. The GPL consequence is also unmentioned: the Pro
plugin is legally redistributable by anyone who buys it once.

Guideline 12 itself checks out as quoted: *"use of over 12 tags total"* prohibited,
*"Repetitive use of a tag or specific term is considered to be keyword stuffing, and is not
permitted"*, *"Readmes are to be written for people, not bots."*

### The review queue is worse than "slow"
SNIPPET, WordPress Plugins Team update of **31 Aug 2026**: **4,715 plugins in the queue**,
**3,854 older than 7 days**, 593 new plugins not yet processed. The team also published an
"Update on the status of the team" in June 2026. Human review, unbounded, contended. The
supervisor's downward correction from "300 plugins" to "3–5 plugins" is the right call; the
120-day kill criterion is optimistic against this queue, because the clock it names starts at
directory approval and approval itself is the unbounded part.

### An ownerBlocker that should not be in the catalogue
The report lists *"One-time WordPress.org account creation in a human identity"* as an owner
blocker. WordPress.org account creation requires **no identity verification and no KYC** — it
is a username and an email address. MISSION.md permits cataloguing only the identity/KYC
steps a platform **legally requires of a human**, and forbids inventing extras. This one does
not qualify. The genuine constraint is the repo's own anonymity policy, which a company name
satisfies. Remove it from the blocker list; it inflates the count of things that need the
owner.

### Israel payability
YES via Paddle — but see the supervisor error in §"Errors" below: the report asserts Paddle
Israel is "ALREADY DONE", while `logs/CHECKPOINT.md` records the Paddle scout marking Israeli
eligibility as **UNKNOWN-leaning-yes** with two pages a human still has to open. Paddle's own
positioning is that it pays out *"anywhere in the world with exception to sanctioned
countries"* (SNIPPET), and Israel is not sanctioned, so YES is the right call — but it is
snippet-grade, not "done".

---

## 4. RapidAPI Hub as a second storefront — **DOWNGRADED**

Corrected ceiling: **₪500/month** (from ₪1,500), and **₪0 for at least the first 90 days**
after the documented payout lag. Israel payable: **YES**, on a single fragile rail.
Corrected build: **24h**.

### Two of the supervisor's snippet-grade claims independently corroborate
I could not render `docs.rapidapi.com` either — it is EGRESS_BLOCKED, so the supervisor's own
citation of it is a snippet too. But independent search confirms: **the marketplace fee is
25% of all payments through the API Hub as of 15 November 2025** (up from 20%), and
**"RapidAPI currently only pays out API providers via PayPal."** Also confirmed the Hub is
alive under Nokia (acquired Nov 2024) with the public marketplace explicitly retained, not
wound down. That part of the report is stronger than it claimed for itself.

### Israel payability — the failure mode is concentration, not geography
PayPal reaches Israel. But this line's entire cash rail is one PayPal account, and this repo's
own payment-rails scout flags (a) the 6 July 2026 migration to PayPal Israel Payment Services
Ltd., (b) **18% Israeli VAT now charged on PayPal fees**, and (c) that it found no credible
Israel-specific dataset on freeze rates. Stack: 25% marketplace fee, ~2% PayPal payout fee,
VAT on those fees, then ILS conversion. Take-home is materially under the ~73% the report
implies.

### Ceiling
The report's own honest framing kills its number: Popularity is usage-driven and closed to a
new listing, on a Hub with **35,000–40,000 APIs and ~4 million developers**. Latency and
service level are real day-one levers, but they are tie-breakers on a listing nobody has
found. Every earnings figure available for this platform is vendor-published. ₪1,500/month is
a hope. **₪500** is a defensible 12-month ceiling; month one is ₪0, and the report's own
~60-day payout lag means the first shekel cannot arrive before day ~90 even in the good case.

### Build
16h for the port is plausible. It omits provider onboarding, tax forms, and the operational
cost of actually holding the 99.9% service level the pitch leans on as its differentiator.
24h, and a standing uptime obligation.

---

## 5. Amazon Solicitations API review-request agent — **REFUTED**

Corrected ceiling: **₪0**. Israel payable: irrelevant — the line does not clear the mandate.

### The API claim is true. It is the only true part.
RENDERED, `raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/solicitations-api-model/solicitations.json`:
two operations (`getSolicitationActionsForOrder`, `createProductReviewAndSellerFeedbackSolicitation`),
rate limit **1 req/sec, burst 5**, and the POST takes **only** `amazonOrderId` (path) and
`marketplaceIds` (query) — **no request body schema at all**. The "structurally impossible to
ask for a positive review" property is genuine and well-sourced. Credit where due.

### The blocker the supervisor missed is a mandate violation, not a KYC step
SNIPPET, Amazon SP-API registration docs: **"You must have a Professional selling account and
be the primary account user to create an SP-API developer profile"**, and registration runs
through Seller Central → Apps and Services → Develop Apps → Public Developer.

That means, before any code:
1. An Amazon **Professional selling account at $39.99/month, recurring** — not a one-time
   identity step, an indefinite subscription. This repo enforces a **₪200 total** budget in
   `src/revenue/budget.ts`; $39.99/month burns it in under two months with zero revenue.
2. Amazon seller registration commonly requires an **identity verification video call** with
   an Amazon associate — instant or scheduled 2–7 business days out, 10–20 minutes, showing
   both sides of original documents on camera (SNIPPET, Seller Central forums and seller-law
   guidance). **MISSION.md states the owner does not appear on camera.** A live video
   interview is not the "one-time identity/KYC step a platform legally requires" carve-out as
   scoped; it is a scheduled human appearance, and the mandate names camera work explicitly.
3. A **publicly available website** describing the app's services to Amazon sellers.
4. For PII-scoped access, Amazon's Data Protection Policy requires **180-day vulnerability
   scans and annual penetration tests** (SNIPPET) — recurring paid engagements with human
   vendors, again against a ₪200 total budget.

The supervisor called this "the worst owner blocker in the group" and still under-described
it by a subscription, a video call and a security-audit programme.

### Market
Mature and partly free — FeedbackWhiz, eComEngine, SellerLabs, plus free browser extensions
clicking the same button; the API is public to everyone, so there is no moat in the call. The
report says this and still ranked it. It should have been in `rejected`.

---

## Supervisor's own errors

1. **The coverage claim is false.** The report opens with *"2 of 8 assigned scouts returned NO
   report at all — this group is 6/8 covered at best."* All **eight** `store-promotion--*.md`
   scout reports exist in `research/colony-sweep/scouts/`, all dated 2026-09-03, 96–267 lines
   each. `logs/CHECKPOINT.md` records `store-promotion` as one of four groups **completed
   8/8**, and explains that three criteria in this group were researched directly after launch
   failures. The supervisor under-reported its own coverage and built a caveat on it.

2. **The truncation claim is false.** It says the cross-promotion report *"arrived TRUNCATED
   mid-sentence inside its second finding… only its first two findings were usable. Effective
   group coverage 5.5/8."* The file on disk has **nine complete sections**, a full URL list
   and a clean closing line. The supervisor discarded five sections it had.

3. **It buried the group's actual headline.** Section 5 of the report it declared truncated
   contains the finding that governs every candidate in the group: *"a multiplier on zero is
   zero… The colony's acquisition problem is upstream of this criterion."* Nothing in the
   ranked list answers it.

4. **Selective quotation of Apify's `sortBy`** — dropped `popularity`, the one value that
   contradicts the thesis, from a list its own scout had quoted in full.

5. **It never found Apify's ranking documentation.** `how_store_works.md` and
   `quality_score.mdx` state plainly that store search ranking correlates with a quality score
   whose named categories include Popularity (users, saves, return usage) and History of
   success. This refutes the report's central "zero-run Actors are not structurally invisible"
   claim, and both pages render freely from `raw.githubusercontent.com`.

6. **Misquoted the Apify forfeiture clause** ("unverified balances" vs. the actual
   below-Minimum-Payout-for-12-months clause).

7. **Inconsistent application of its own strongest test.** It killed the Shopify/WooCommerce
   review SaaS because "the price floor is zero" and did not run that test on its own #2,
   where the floor is also zero (Semrush, Ahrefs and AI Rank Lab all free, all broader).

8. **Claimed personal verification of two egress-blocked domains** (`thatmarketingbuddy.com`,
   `localseoisrael.co.il`) as the reason candidate 2 outranked others.

9. **Declared a blocker done that the repo records as unknown.** "Paddle merchant-of-record
   identity and tax verification — ALREADY DONE" contradicts `logs/CHECKPOINT.md`, which
   records the Paddle scout marking Israeli eligibility **UNKNOWN-leaning-yes** with two pages
   a human must still open. MISSION.md says never assume a blocker is done.

10. **Invented an ownerBlocker.** WordPress.org account creation requires no identity
    verification or KYC and therefore does not belong in a catalogue MISSION.md restricts to
    legally-required human identity steps.

11. **Under-described the Amazon blocker** by a $39.99/month Professional selling account, a
    likely on-camera identity verification call, and a recurring pentest obligation.

12. **Its arithmetic contradicts its own headline.** "Almost no money here" alongside ceilings
    summing to ₪15,500/month — 78% of the ₪20,000 target — from one group. A board reading the
    ranked list would conclude the opposite of the headline.

---

## Angles the group missed entirely

1. **Cost of goods and recurring platform fees appear nowhere.** Amazon $39.99/month; Apify
   platform usage deducted *before* the 80%; PayPal receiving fees plus 18% Israeli VAT on
   those fees since 6 July 2026; RapidAPI 25% plus ~2% payout fee. Every ceiling in the report
   is gross. Against a ₪200 total enforced budget, the fee side decides more than the ceiling
   side.

2. **Maintenance is the constraint, not the build.** Apify quantifies it itself at ~2h/week
   per public Actor with a publicly visible support response time. No candidate has a
   maintenance line, and the group's #1 is a portfolio play whose cost scales linearly with
   listing count.

3. **Automated deprecation as portfolio decay.** The report mentions Apify's 3-days-failing →
   maintenance-label → removal-in-28-days rule only inside a kill criterion. It is actually
   the mechanism by which a 40-Actor portfolio becomes a 0-Actor portfolio: scrapers break
   because target sites change, and re-listing is not the repair.

4. **The constitution question was never asked of the group's own #1.** Apify's challenge
   terms name "Publish too many low-quality or spammy Actors" and "manipulate the Actor
   Quality score" as disqualifying. Etsy and Chrome were interrogated on exactly this; Apify
   was not.

5. **Rail concentration.** Three of five survivors bill through Paddle and two pay out through
   PayPal. MISSION.md requires that one rail failing must not take the company down. The group
   presents five storefronts and delivers two rails.

6. **The portfolio's only real asset is discarded.** Four of five candidates have nothing to
   do with Israel or Hebrew, so they compete with the whole world on generic ground; the one
   that uses the Israeli-market asset is the one with no distribution. The obvious unexamined
   candidate — Israeli-dataset Actors on Apify Store, extending `products/apify-il-open-data`,
   where the niche is thin and the knowledge is already ours — is exactly the intersection the
   ranking never constructs.

7. **Time-to-first-shekel is never stated.** RapidAPI has a documented ~60-day payout lag;
   Apify holds everything below USD 20; Amazon gates on an unbounded approval. A portfolio
   plan whose lines all pay nothing for a quarter needs to say so on the face of the ranking.

8. **Base rates were available and not computed.** 53,954 Apify tools against ~3,000
   developers receiving payouts is a ~5% chance that a listing earns anything at all —
   the same order as the 5% hit rate `src/revenue/growth.ts` already assumes. The group had
   the numerator and denominator in its own headline and never divided them.

9. **Nobody tested whether the reviews/social-proof work belongs in this group at all.** Two
   of five candidates (Amazon Solicitations, and the rejected Shopify SaaS) are review tooling
   sold to *other* merchants — a different business from promoting our own stores. The group's
   brief was our storefronts' discoverability.

---

## Corrected summary

| # | Candidate | Supervisor | Audit | Ceiling ₪/mo | Israel |
|---|---|---|---|---|---|
| 1 | Apify Store multi-Actor portfolio | 82 | **DOWNGRADED** | 4,000 → **1,500** | YES |
| 2 | Hebrew AI-answer visibility monitoring | 68 | **REFUTED** | 4,000 → **0–500** | YES (moot) |
| 3 | WordPress.org plugin + Pro tier | 58 | **DOWNGRADED** | 4,000 → **1,000** | YES |
| 4 | RapidAPI Hub second storefront | 52 | **DOWNGRADED** | 1,500 → **500** | YES |
| 5 | Amazon Solicitations SaaS | 40 | **REFUTED** | 2,000 → **0** | n/a |

**Group total: ₪15,500/month claimed → ₪3,000/month defensible, ₪0 in month one.**
This is consistent with the supervisor's own headline and inconsistent with its ranking.
