# AUDIT — group `distribution`

**Auditor:** AUDITOR agent, group `distribution`. **Date:** 2026-09-04.
**Brief:** refute, do not agree. Open every cited URL. Attack Israel payability hardest, then the
ceiling as a day-one entrant, then the build estimate and the "no human needed" claim.

---

## Verdict table

| # | Candidate | Supervisor | Verdict | Ceiling ₪/mo | israelPayable |
|---|---|---|---|---|---|
| 1 | Apify Store listing for the four day-one quality-score categories | score 62, ₪500, 8h, YES | **DOWNGRADED** | 500 → **200** (₪0 for the first 90+ days; net-new to the portfolio **₪0**) | YES (holds, snippet-grade on the PayPal leg) |
| 2 | Hebrew transactional tool pages on il-biz-tools | score 46, ₪400, 25h, YES | **DOWNGRADED** | 400 → **0** through month 12 (contingent ₪150–250 at month 12+ on three unmet preconditions) | YES → **UNKNOWN** |

**Both items fall below the supervisor's own reject bar** (`src/revenue/criteria.ts:362` — *"reject
… an honest ceiling under ₪300/month"*) once corrected. The supervisor's headline — *"the group's
honest net-new contribution to ₪20,000/month is ₪0"* — is the finding. The ranking contradicts it.

---

## What I re-verified myself (renders, not snippets)

| Claim | Source | Result |
|---|---|---|
| Apify quality score: 8 named categories; *"Actors with higher quality scores tend to rank higher on both surfaces"* | RENDERED `raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/publishing/quality_score.mdx` | **CONFIRMED verbatim.** Categories, both-surfaces sentence and MCP `search-actors` reference all present |
| Store search correlates with quality score | RENDERED `.../academy/build-and-publish/apify-store-basics/how_store_works.md` §"How Apify Store search works" | **CONFIRMED** |
| README section list, 300+ words, H2/H3 keyword guidance | RENDERED `.../platform/actors/publishing/publish/actor-readme.mdx` | **CONFIRMED.** Introduction / Tutorial / Pricing / Input and output examples / FAQ and support; *"aim for at least 300 words"*; *"The H1 heading of your page is the Actor name, so use only H2 and H3"* |
| 80% revenue share on PPE | RENDERED `.../how_actor_monetization_works.md:32` | **CONFIRMED** |
| KYC before payout | RENDERED `.../legal/latest/terms/store-publishing-terms-and-conditions.md` §10.1.2 | **CONFIRMED** — and **not in any of the four URLs the supervisor cited** |
| Payout minimum USD 20 PayPal / USD 100 other | same file §10.3.2 | **CONFIRMED** — again, **not in the cited URLs** |
| §2.2.4.2(i) forbids off-platform promotion in Actors or Store content | same file | **CONFIRMED verbatim** |
| `sindresorhus/awesome` rejects AI-generated PRs and requires 4 substantive reviews | RENDERED `raw.githubusercontent.com/sindresorhus/awesome/main/pull_request_template.md:15,18-19,45` | **CONFIRMED.** The rejection holds |
| `apify.com`, `api.apify.com`, `console.apify.com` reachable from the colony container | `curl` this session | **ALL THREE EGRESS_BLOCKED** (CONNECT tunnel 403) |
| The four evidence URLs behind candidate #2 | WebFetch this session | **ALL FOUR EGRESS_BLOCKED**: `searchlab.nl`, `cognizo.ai`, `digitalapplied.com`, `patrickstox.com` |
| AIO coverage 36% informational vs 5% transactional | WebSearch (Seer, 49,353 queries) | **Directionally corroborated at snippet grade**, and see the erosion finding below |
| il-biz-tools Pro is a purchasable ₪79 tier | `products/il-biz-tools/src/config/site.json`, `invoice.html:111` | **REFUTED — it is not purchasable** |

---

## 1. Apify Store listing — **DOWNGRADED**, ₪500 → ₪200

The mechanism is the best-evidenced thing in the group and I confirmed all of it. Everything
attached to it is wrong.

### 1.1 The ceiling cites a number this repo's own sibling audit already refuted

`whyThisRank` says: *"the whole Apify line is audited at ₪1,500 across 5-8 Actors… ₪500 is one
well-listed Actor's honest share."* Two audits set an Apify ceiling and **they disagree**:

- `audits/store-promotion.md:36,70` — a **generic** multi-Actor scraper portfolio: ₪1,500/month at
  12 months, explicitly *"₪0 in [at least] the first 90 days"*.
- `audits/agent-markets.md:53,176-196,458` — **our Actor**, the Israeli-open-data one, audited
  head-on: **REFUTED, 600 → ₪200**, with the ₪1,500 anchor attacked by name as *"a fraction of an
  unverified power-law mean… a method, not a measurement"* (the repo's own
  `src/revenue/portfolio.ts:36-40` calls the underlying $470/developer figure UNVERIFIED marketing).

The supervisor took the more favourable of two audited numbers, did not disclose the conflict, and
then claimed a **₪500 share of a whole that the closer audit puts at ₪200**. The share exceeds the
audited total. The corrected figure is **₪200/month at 12 months, ₪0 for the first 90+ days.**

Built upward from the report's own inputs it is worse: the only published portfolio datum is 8.7
monthly users per Actor for a builder with no direct competitor; we have at least three direct
competitors on the exact query (`parseforge/israel-companies-registrar-scraper`,
`bovi/israel-companies-registrar`, `lentic_clockss/israel-data-search`, the last carrying **33
Israeli sources in one Actor**), and one entrant on this niche is already deleted. One Actor, not
five to eight, at a store norm of $1–10/1,000 results, is single-digit dollars per month.

### 1.2 The firstStep cannot be run — and the group already knew

*"…publish it to Store with `apify push`."* I re-confirmed this session that `apify.com`,
`api.apify.com` **and** `console.apify.com` are EGRESS_BLOCKED from the colony container. `apify
push` is an API call to `api.apify.com`. The first action of the group's #1 candidate is not
executable by the agent that would be told to do it, and `audits/agent-markets.md:163-169` recorded
exactly this failure a day earlier. The supervisor repeated it.

Worse, this is not a one-time step. Every listing edit — and the whole candidate *is* listing edits —
needs another push. That is **recurring human dependency**, the class MISSION forbids outright, and
it is absent from `ownerBlockers`.

*The fix nobody proposed:* GitHub Actions runners are not behind this proxy. `apify push` from CI
with an `APIFY_TOKEN` secret converts a recurring owner op into a one-time secret paste. Nobody in
eight scout reports or the supervisor asked whether the colony can reach the platform it is
publishing to, let alone how to route around it.

### 1.3 The four/four category split is wrong in both directions

- **Pricing transparency is not a day-one lever.** The doc's advice is "use PPE" and "offer
  Bronze/Silver/Gold discounts" — i.e. *set prices*. `src/revenue/portfolio.ts:119`, quoting Apify's
  own terms, records that KYC *"gates ALL THREE of: receiving any payout, **setting a price on an
  Actor**, and x402/agentic eligibility."* An unverified publisher cannot move this category at all.
  So it is three controllable categories, not four — and the third is behind the owner blocker the
  report says must not be assumed done.
- **Reliability is partly controllable on day one.** `quality_score.mdx` says reliability is helped
  by passing automated QA tests and by implementing an input schema — both publisher-side, both
  available with zero runs. Listing it as prior-success-gated is also wrong.

### 1.4 Israel payability — attacked, and it holds, with two things the report missed

I read the Store Publishing Terms end to end. **No country list, no Israel exclusion**; governing
law Czech (§11.2); the only geographic hook is the sanctions/watchlist suspension right (§10.1.5)
and Israel is not sanctioned by the EU or Czechia. PayPal Israel withdraws to an Israeli bank in
ILS at NIS 0–8 (`scouts/payment-rails--paypal-israel.md`, snippet-grade). **YES holds.**

Two things the supervisor did not state:

1. **§10.1.6 is a destruction clause, not a delay.** *"Any accrued payout that remains withheld due
   to incomplete or failed KYC verification for a continuous period of twelve (12) months shall be
   deemed abandoned and automatically forfeited to Apify."* The owner blocker is not "before any
   payout" — it is a **12-month fuse on money already earned**. §10.3.2 applies the same forfeiture
   to a balance that stays under the minimum for twelve continuous months.
2. **The net is not the gross.** 18% Israeli VAT on PayPal fees since 6 July 2026, plus 5–9% USD→ILS
   drag on small tickets (both already in this repo). On a ₪200 line these are not rounding.

### 1.5 Build hours

8 hours for a README rewrite is plausible *as writing*. It excludes: creating the Apify account,
CI plumbing to push from an unblocked runner, an input/dataset schema congruent with the README
(the Congruency category the candidate is nominally optimising for), and Apify's own published
maintenance load of **~2 hours per week per public Actor** (`why_publish.md`) — 8 h/month forever
against a ₪200/month line. Honest: **12–16 h build + ~8 h/month upkeep.**

### 1.6 The constitution question, again unasked

We charge per record for data `data.gov.il` serves free and keyless, while a competitor's own
listing advertises the source as *"free, keyless, official"*. MISSION rule 4 makes this a question
that must be answered **on the listing**. Two audits have now asked it; this report did not.

---

## 2. Hebrew transactional tool pages — **DOWNGRADED**, ₪400 → ₪0

### 2.1 The money model describes a product that does not exist

`moneyModel`: *"the already-shipped Paddle Pro tier… ₪79 one-time."* I opened the product:

- `products/il-biz-tools/src/config/site.json` — `paddle.clientToken: ""`, `paddle.priceId: ""`,
  `environment: "sandbox"`, `pro.publicKey: null`.
- `products/il-biz-tools/invoice.html:111` — `<button … id="pro-cta" disabled>בקרוב</button>`.
- `src/lib/paddle.js` — `isProConfigured()` returns false, `loadPaddle()` rejects with
  *"Paddle is not configured"*.
- `tests/paddle-analytics.test.js:7` — *"is off by default (shows בקרוב)"*.

**There is no checkout.** A conversion rate multiplied by an unbuyable product is ₪0, and the
supervisor did not open the file it was monetising. This is the same defect MISSION names as the
repo's recurring one — a confident claim nobody checked.

### 2.2 The rail is not merely unbuilt, it is unapproved — and a sibling audit said so

`audits/payment-rails.md:95-146` audited Paddle three days ago: *"Real rail, plausibly
Israel-eligible, but it is **not live**, it earns ₪0… **Corrected ceiling ₪0.** `israelPayable: YES`
(low confidence, approval discretionary)"* — and adds that Paddle reviews the live site before
approving, and that *"a brand-new seller, no traffic, no revenue history, and a paid tier that does
not function is the exact profile that gets rejected or held."* The distribution supervisor ranked
a candidate whose entire revenue leg was already corrected to ₪0 by another auditor, without citing
it.

### 2.3 Israel payability — **YES → UNKNOWN**

Nobody in this repo — scout, supervisor or auditor — has ever rendered a Paddle page.
`paddle.com` and `developer.paddle.com` are EGRESS_BLOCKED; I retried both this session and got the
same. The sole corroboration is one unrelated third-party GitHub repo paraphrasing the page. That is
the *identical* evidence class on which `audits/payment-rails.md:216-226` corrected **Payoneer from
YES to UNKNOWN**, citing MISSION: *"a line that cannot pay an Israeli is worth zero however good the
idea."* Applying the standard consistently, this is **UNKNOWN**. And country eligibility was never
the binding question anyway — **approval is discretionary**, and the applicant is a brand-new seller
with a dead paid tier.

### 2.4 The ceiling is a kill threshold wearing a forecast's clothes

The supervisor's arithmetic is 300 clicks/month × 1–2% × ₪79 = ₪240–475, then picks ₪400. But 300
clicks/month at month 8 is the report's own **kill criterion** — the floor below which the line is
killed. Using the floor as the expected value inverts it. The 1–2% purchase rate is sourced to
nothing at all. And ₪79 gross is not ₪79 net: Paddle's cut on a ~$21 ticket is ~₪6, before Israeli
VAT and income tax.

### 2.5 Three preconditions the report never checked

1. **The site may not be live.** `logs/CHECKPOINT.md:195`: the Netlify site was created but
   `api.netlify.com` is blocked from the container, so *"the owner links the repo in the Netlify UI…
   or runs `npx netlify-cli deploy --prod` locally."* `il-biz-tools.netlify.app` is also
   EGRESS_BLOCKED from here, so I could not confirm it serves anything. The candidate's firstStep
   begins *"Verify the live il-biz-tools domain"* — **"live" is an unverified premise**, and the
   real blocker (nobody can deploy) is missing from `ownerBlockers` while a softer one is in it.
2. **There is no domain.** Every URL in `sitemap.xml`, `robots.txt` and `site.json` is
   `https://il-biz-tools.netlify.app`. An SEO line is being ranked on a shared-suffix free
   subdomain, and the report neither notices nor lists the domain purchase — the same ₪200-float,
   receipt-id-bearing spend it *did* catalogue for the MCP Registry.
3. **Nobody ran an occupancy test on a single Hebrew query.** I ran one. `מחשבון מע״מ 2026` and
   `תקרת עוסק פטור 2026` return `greeninvoice.co.il` (an incumbent Israeli invoicing SaaS whose free
   tier also issues invoices — a price floor of zero on our Pro feature), `bizportal.co.il`,
   `mako.co.il`, `gemel.net`, `sfb.co.il`, `kicky.co.il`, plus several accounting firms. These are
   aged Hebrew domains with real authority. The claim that a day-one netlify subdomain reaches them
   is asserted, never tested, in a group whose entire subject is whether strangers can find us.

### 2.6 The AIO premise is eroding on exactly this candidate's timeline

The direction is corroborated (informational 36% vs transactional 5%, Seer, 49,353 queries). The
trend is not, and neither scout nor supervisor reported it: over 2025 the informational share of
AIO-triggering queries fell **91.3% → 57.1%**, commercial rose to ~19%, and **navigational rose
0.74% → 10.33%**. The moat is being filled in over the 6–12 months this candidate needs to ramp.
The supervisor's own caveat that "no single figure should be quoted" is right; the reason it is
right is that the figures are moving in the direction that hurts.

### 2.7 The GSC owner blocker is mis-classified

MISSION permits owner steps that are *one-time identity/KYC/payout steps a platform legally
requires of a human*. Google Search Console verification is none of those — and the site is a
repo-deployed static folder, so an agent can verify a URL-prefix property by committing the HTML
verification file. (DNS verification, which the entry names, is impossible anyway: `netlify.app` is
on the Public Suffix List and we do not control it.) This is a self-imposed blocker on the
checklist MISSION says must contain nothing invented.

---

## 3. The supervisor's own errors

1. **Ranked two items it says contribute ₪0 net-new.** The headline, the `whyThisRank` of both
   entries and the summary all state the group's honest contribution is ₪0. The mandate's
   `must_never` includes *"Pad the ranking to fill six slots"*, and the reject bar is ₪300/month.
   The correct output was an empty `ranked` array with the two items described as hygiene. The
   prose is honest and the JSON is not — and `monthlyCeilingIls: 500` and `400` are the
   machine-readable fields a board sums.
2. **Cited a superseded ceiling and hid the conflict.** ₪1,500 was refuted to ₪200 by
   `audits/agent-markets.md` for this exact Actor. The supervisor cited the number that helped.
3. **Claimed a share (₪500) larger than the audited whole (₪200).**
4. **Wrote a firstStep that cannot execute** (`apify push`; `api.apify.com` EGRESS_BLOCKED),
   repeating a defect a sibling audit had already recorded.
5. **Attributed the KYC and payout-minimum claims to four URLs that contain neither.** The claims
   are true — I verified them in `store-publishing-terms-and-conditions.md` §10.1.2 and §10.3.2 —
   but the citation is wrong, and a citation nobody can follow is how an unverified claim survives.
6. **Did not open the product it was monetising.** Pro is disabled, Paddle unconfigured, license key
   null, CTA reads "בקרוב".
7. **Ignored `audits/payment-rails.md`, which had already corrected the Paddle leg to ₪0.**
8. **Applied the Israel-payability standard inconsistently** — UNKNOWN was demanded of Payoneer on
   third-party evidence; YES was granted to Paddle on third-party evidence of the same grade.
9. **Mis-split the Apify quality categories** — Pricing transparency is KYC-gated, Reliability is
   partly day-one controllable.
10. **Used a kill threshold as the revenue basis** for #2, and an unsourced 1–2% purchase rate.
11. **Missed the missing domain** for an SEO candidate, and the unconfirmed deployment beneath it.
12. **Mis-catalogued the GSC step** as an owner blocker of the permitted class, while omitting the
    real one (nobody can deploy: `api.netlify.com` blocked).
13. **Graded `seo-2026` "no primary source of any kind" and then ranked a candidate resting
    entirely on it**, without saying so in that candidate's entry.
14. **Silently dropped `llms.txt`** — the `seo-2026` scout's *only* RENDERED primary source (E13) —
    from both `ranked` and `rejected`. In a group whose thesis is that assistants are eating the
    clicks, the "be the cited source" channel received neither a candidate nor a kill.
15. **`whyThisRank` for #1 asserts "it is the only item in 8 scout reports whose mechanism rests on
    rendered primary evidence"** — false by its own report: the MCP Registry and n8n findings are
    listed as RENDERED in the same document.

Credit where due: the Stripe cross-border kill (Israel outside US/UK/EEA/Canada/Switzerland,
therefore beehiiv/Paved dead rather than deferred), the §30א ₪1,000-per-message correction that
closes list-building, the `scoutsWeak` section naming four of its own eight scouts, and the
"NOT owner blockers" paragraph are all real, checkable work. The rejections I re-tested
(`sindresorhus/awesome`, Apify §2.2.4.2(i)) hold verbatim.

---

## 4. Angles the group missed entirely

1. **MISSION constraint 4 was not answered.** *"Promotion must be structural, never per-store… one
   system promoting every store at once — a hub, a sitemap, a machine-readable catalogue, one
   submission covering the portfolio."* At 878 stores the budget is **eleven minutes per store per
   month**. Both survivors are single-store tactics: one Apify listing, one site's pages. The group
   charged with distribution produced **zero** analysis of the portfolio-scale promotion shape
   MISSION explicitly names as the one that survives — and neither survivor scales to a second store
   without re-spending its whole build.
2. **Nobody asked whether the colony can reach the channels it recommends.** `apify.com`,
   `netlify.app`, `paddle.com`, `google.com`, and every one of candidate #2's four evidence hosts are
   EGRESS_BLOCKED. A channel the agent cannot reach is an owner op in disguise. The routing answer —
   GitHub Actions runners, which are not behind this proxy — was never considered, and it would
   convert several rejected "owner must do it" items into automatable ones.
3. **No occupancy test on a single Hebrew SERP.** The group's central survivor is Hebrew tool-page
   ranking and nobody looked at who ranks today. `israel-bureaucracy` was told to run occupancy
   tests; `distribution` inherited the conclusion without the test.
4. **`llms.txt` / GEO — the "be the cited source" channel.** Dropped without a verdict.
5. **The Israeli SaaS partner ecosystem.** `partnerships-integrations` examined Zapier, Make and
   HubSpot — three American platforms whose gates are demand thresholds. It never looked at
   Green Invoice, SUMIT, Rivhit, iCount or Morning partner/affiliate/app directories, which is where
   our actual buyer already is, and which are the only integration surfaces whose *audience* is
   Israeli עוסקים.
6. **Our own shipped surfaces as distribution.** `telegram-il-tools-bot` is discoverable through
   Telegram's in-app global search and third-party bot indexes (storebot/tgstat); `x402-il-api` and
   `mcp-il-tools` are discoverable to agent clients. The report rejected the MCP Registry at ₪0 as
   hygiene without ever asking whether the MCP/agent-client directories are the acquisition channel
   for the one product we own that bills machines — which is the group's own stated best hope
   ("machine audiences").
7. **data.gov.il and gov.il as distribution surfaces.** CKAN portals list applications built on
   their datasets; the state links to tools built on its own data. Free, structural, Israel-native,
   and untouched by eight scouts.
8. **Time-to-first-shekel was never computed for either survivor**, though it is the number MISSION
   constraint 7 actually asks for. #1: Apify KYC → publish → 90 days to first run → PayPal $20
   minimum → invoice cut on the 11th. #2: 6–12 months of ramp, after a deploy, a domain and a Paddle
   approval that have not happened. Neither survivor can produce a ledger row inside the target
   horizon, and neither entry says so.
9. **Nobody asked what happens to the Apify listing if the KYC never comes.** §10.1.6 forfeits the
   accrued balance after twelve months. A line can earn and then have the earnings destroyed by an
   owner step nobody chased.
10. **The one genuinely net-new distribution idea in MISSION was ignored.** Constraint 8 names
    *accumulated operating history on a platform where history is a ranking input* as one of three
    shapes with a non-public input, and points at Apify's developer-level "History of success". That
    is an argument for publishing **free, today, forever**, and it is the opposite of the
    listing-polish candidate the group ranked first — polish is copyable, history is not.

---

## 5. What I would put in front of the board instead

- **`ranked: []`** for this group, with the headline unchanged. It is correct.
- Keep task #20 (publish `apify-il-open-data` **free**, count runs from strangers for 30 days) as the
  cheapest live test of MISSION constraint 7 — free publishing needs no KYC, no price, no README
  polish, and it starts the one clock (History of success) that cannot be bought. Route the push
  through GitHub Actions, not the blocked container.
- Before any SEO hour is spent: confirm the site is deployed and indexed, buy a domain, and make one
  Hebrew query's SERP the evidence. Those are three checks, not 25 build hours.
