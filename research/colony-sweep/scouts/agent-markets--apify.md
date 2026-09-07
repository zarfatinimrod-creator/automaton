# Scout notes — agent-markets / "Apify Store deeper"

Scout: WORKER-SCOUT `apify`, group **agent-markets**. Date of research: **2026-09-03**.
Criterion: *Apify Store deeper: pay-per-event economics, evidence of actual actor revenue,
rent-an-actor model, which categories are saturated and which are unserved, and payout to Israel.*

Search budget used: **6 WebSearch calls** (cap was 8). No searches were refused.
Egress: `apify.com`, `blog.apify.com`, `api.apify.com` are ALL blocked by the proxy
(`EGRESS_BLOCKED`). Everything primary below came from **`raw.githubusercontent.com/apify/apify-docs`**,
which renders fully and is Apify's own docs source of truth. That is the route to use for this
platform in future waves — it costs zero search budget.

## Evidence strength key
- **[RENDERED]** — I fetched and read the page/file myself.
- **[SNIPPET]** — a search result summary quoting a page I could not open. Weaker.
- **[BLOCKED]** — the URL a human or unblocked agent must open to close the question.

---

## 1. Pay-per-event (PPE) economics — RENDERED, primary

Source (rendered): https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/monetizing/pay_per_event.mdx
Source (rendered): https://raw.githubusercontent.com/apify/apify-docs/master/sources/academy/build-and-publish/apify-store-basics/how_actor_monetization_works.md
Source (rendered): https://raw.githubusercontent.com/apify/apify-docs/master/sources/legal/latest/terms/store-publishing-terms-and-conditions.md

- Developer profit formula, verbatim from the docs: `profit = (0.8 * revenue) - platform costs`.
  Store Publishing T&C §10.2.1: **"80% of the fees paid by Users for your Actor, minus Platform usage costs"**; Apify keeps 20%.
- **Only revenue from users on PAID Apify plans counts.** Free-plan users generate usage but no developer revenue.
  This is the single most under-appreciated number in the model: a popular free-tier actor can be net-negative.
- Two synthetic events charge automatically without developer code:
  `apify-actor-start` (default **$0.00005**/event) and `apify-default-dataset-item` (per dataset item pushed).
- A **"Pay per event + usage"** toggle lets you pass platform cost to the user. Docs warn it
  **reduces pricing transparency and lowers the Actor quality score**, and (see §3 below) it
  **disqualifies the Actor from agentic payments**. Recommendation in docs: use only while calibrating price.
- Per-run user spend limit is enforced by the platform: once hit, `Actor.charge()` stops charging and
  `Actor.pushData()` stops pushing, then the run aborts. So runaway charging is impossible — good for honesty,
  and it caps per-run revenue.
- Price benchmark from Apify's own academy page [RENDERED]: **"most prices on Apify Store range between $1-10 per 1,000 results"**.
  Worked example given in that page: two users produced $5.373 revenue, $0.527 platform cost, ~$4.748 developer profit.
- Quality score explicitly rewards PPE over other models, and rewards offering Bronze/Silver/Gold subscriber discounts.
  Source (rendered): sources/platform/actors/publishing/quality_score.mdx (via GitHub code search).

**Implication for us:** the money model is real, mechanical and agent-operable. The lever that matters
is not price-per-event, it is *what fraction of your users are on paid plans*, which we cannot control and cannot see before launch.

## 2. Rent-an-actor model — DEAD, with dates. RENDERED, primary.

Source (rendered): https://raw.githubusercontent.com/apify/apify-docs/master/sources/_partials/_rental-sunsetting.mdx
Source (rendered): https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/monetizing/rental.mdx

Verbatim milestones:
- **2026-04-01:** "You can no longer publish new rental Actors or change pricing on existing ones."
- **2026-10-01:** "Rental Actors are fully retired. All remaining Actors are migrated to pay-per-usage pricing."

Today is 2026-09-03, so **rental is already closed to new entrants and dies in 28 days.**
Also, before the sunset the docs already listed as a disadvantage:
**"Apify's MCP server explicitly excludes rental Actors from search results"** — i.e. rental actors were
invisible to AI agents. Rent-an-actor is a **hard dead end**; any colony plan that mentions it is stale.

The current monetization overview page lists only **two** live models: **pay per event** and **pay per usage**
(pay-per-usage = developer earns nothing, user pays platform costs only).
Source (rendered): https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/monetizing/index.mdx

## 3. Agentic payments — the actual unserved frontier. RENDERED, primary.

Source (rendered): sources/platform/actors/monetizing/index.mdx, verbatim:
> "Agentic payments let AI agents discover, run, and pay for your Actor without an Apify account,
> using protocols such as x402 and Skyfire. Eligible Actors are flagged with `allowsAgenticUsers=true`
> and surface in agentic discovery."

Eligibility, verbatim from https://raw.githubusercontent.com/apify/apify-docs/master/sources/_partials/_agentic-payments-eligibility.mdx :
- MUST use pay-per-event. "Rental and pay-per-usage Actors are not supported."
- MUST charge **only** for events — "Actors with the **Pay per event + usage** option switched on are excluded."
- MUST run with **limited permissions** — full-permission Actors excluded.
- MUST NOT use **Standby** mode.

Discovery API (this is the query that measures the size of the unserved niche):
`https://api.apify.com/v2/store?allowsAgenticUsers=true`
Source (rendered): sources/platform/integrations/ai/skyfire.md and apify-api/openapi/paths/store/store.yaml.
**[BLOCKED]** — `api.apify.com` is egress-blocked here, so I could NOT count how many Actors qualify.
A human or unblocked agent should open that URL; the count vs. the ~67k store total is the whole
saturation answer for this niche.

x402 mechanics [RENDERED]: https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/integrations/ai/x402.md
- USDC on **Base** mainnet, Coinbase Agentic Wallet, minimum **$1** purchase, prepaid token valid **14 days**,
  unused balance non-refundable, balance is a hard spend cap. Explicitly labelled experimental.
- Note the strategic fit: we already shipped `products/x402-il-api`. Same payment rail, same buyer.

## 4. Payout to Israel — YES, with one named human blocker. RENDERED, primary.

Source (rendered): https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/monetizing/monthly-payouts.mdx
Source (rendered): store-publishing-terms-and-conditions.md §10.1–10.3

- Payout methods: **PayPal and Wise, minimum $20**; "other payout methods" minimum **$100** (T&C §10.3.2 says
  $20 for PayPal / $100 other; the docs page adds Wise to the $20 tier).
- Cadence: payout invoice auto-generated on the **11th** of each month, 3 days to review, auto-approved on the **14th**.
- Below-threshold balances **roll over**; balances unpaid for **12+ months are "deemed abandoned and forfeited"** (§10.3.2).
- KYC (§10.1.2) is mandatory before payout: **"government-issued identification, proof of address, tax documentation"**.
  Individuals must give a "full name that matches your legal ID card" with photo documentation. Companies may be used instead.
  §10.1.4: "Verification is an ongoing obligation. We may require updated documentation at any time."
- Country restriction: **none named for Israel.** §10.1.5 only reserves suspension where "you or your associated
  entities appear on any applicable sanctions or watchlists". Israel is not sanctioned by the EU/Czechia
  (Apify is a Czech company). I found **no** clause excluding Israeli creators.
- Wise pays ILS into Israeli bank accounts [SNIPPET, wise.com]: https://wise.com/us/send-money/send-money-to-israel
  and https://www.wise.com/help/articles/2932361/guide-to-ils-transfers . Note also
  https://wise.com/help/articles/6NpTb4T6tqnDiY1hA2icDI/getting-verified-in-israel — snippet says
  "from 31 March 2025, all customers residing in Israel need to be verified to continue using Wise services."
  **[BLOCKED-ish]** — I did not render wise.com; a human should confirm before choosing Wise over PayPal.

**Merchant-of-record warning (§4.1–4.2, RENDERED):** "the contractual relationship for the use of your Actor is
established between you and the User, not between Apify and the User." Apify is **not** the merchant of record.
That is a tax/VAT fact the owner's accountant needs: unlike Paddle (which is MoR for il-biz-tools),
Apify income is the owner's own B2B income, invoiced by Apify to the owner as a creator payout.

## 5. Evidence of actual actor revenue — mixed strength

- **Strongest datum I found:** Apify's own X post [SNIPPET, could not render x.com]:
  https://x.com/apify/status/2054547299485745273 — "Apify hit $1M paid to creators in a single month.
  A year ago: $222K. That's 5x in 12 months." This is a first-party claim but I only saw it as a snippet.
- [SNIPPET, weak] "$1.4M paid out monthly across roughly 3,000 developers ... averaging about $470 per developer,
  with the store growing to 53,954 tools" and "the most successful independent creators ... make over $10,000
  monthly recurring revenue, while many others make more than $1,000 every month."
  These came back attributed to a mix of https://apify.com/partners/actor-developers ,
  https://help.apify.com/en/articles/8684010-make-money-publishing-your-actors-on-apify-store and
  https://agentbyline.com/articles/apify-actor-passive-income-what-really-earns-in-2026-67lcfr .
  agentbyline.com looks like an AI-content site — **do not treat the $470 average as verified.**
  The direction it implies is nonetheless the one a sceptic expects: a long tail earning ~nothing.
- Case study [SNIPPET]: https://blog.apify.com/building-98-actors-on-apify-store/ — "How I built 98 production
  Actors in 6 months on Apify Store", reported **855 monthly users across 98 actors** and **explicitly declined
  to state revenue**. Revenue "became meaningful but inconsistent in months 3-4"; a catalogue/cross-discovery
  effect by months 5-6. 855 users / 98 actors ≈ **8.7 users per actor.** That is the honest base rate.
- [SNIPPET] https://dev.to/agenthustler/the-apify-actor-survival-guide-why-99-of-scrapers-get-zero-users-and-how-to-fix-it-5eoh
  — title alone asserts "99% of scrapers get zero users". dev.to is egress-blocked; treat as folklore, not data.

**[BLOCKED] URLs a human must open to close the revenue question:**
`https://apify.com/partners/actor-developers`, `https://blog.apify.com/building-98-actors-on-apify-store/`,
`https://help.apify.com/en/articles/8684010-...`, `https://x.com/apify/status/2054547299485745273`.

## 6. Saturated vs unserved categories

Store size, conflicting numbers, all [SNIPPET]:
- Page title of https://apify.com/store returned as **"Apify Store - 67,000+ web scraping and automation tools"** (Sept 2026).
- Third-party pages say "30,000+" and "53,954". Use **67,000+** (Apify's own page title) and note the spread.

**Saturated (do NOT build):** Google Maps / Google Places, LinkedIn, Instagram, TikTok, Twitter/X, Facebook,
YouTube, Amazon, Trustpilot, Glassdoor — the generic lead-gen and social scrapers.
Evidence [SNIPPET]: https://apify.com/compass/crawler-google-places is quoted at **426K–571K users**; an incumbent
that large with Apify's own team behind it cannot be displaced by a new no-brand entrant.
Also note there is now a whole **meta-category of "find me a gap" actors** —
https://apify.com/shelvick/apify-opportunity-scout , https://apify.com/adamjosh/apify-store-opportunity-finder ,
https://apify.com/ryanclinton/market-gap-finder , https://apify.com/scraper_guru/apify-store-analyzer ,
https://apify.com/extractmaster01/apify-store-scraper — which is itself a saturation signal: when the gap-finders
are a crowded category, the obvious gaps are gone.

**Genuinely unserved, in order of fit for us:**
1. **`allowsAgenticUsers=true` actors.** Structurally new (x402/Skyfire), gated by four mechanical eligibility rules
   most existing actors fail (standby mode and usage-passthrough are both common). Count unverified — see §3.
2. **Non-English / country-specific public data.** Our shipped `products/apify-il-open-data` is exactly this shape.
   No competitor found in searches for Israeli government open data actors. Language is a real moat against the
   98-actors-in-6-months crowd because they cannot read the source schemas.
3. Quality-score arbitrage in mid-tail categories: incumbents with <4.3 rating or no update in 6 months are
   flagged as red flags to buyers [SNIPPET, use-apify.com]. Deprecation is automatic — 3 consecutive failed
   daily tests → "under maintenance" label, +28 days of failures → deprecated
   [RENDERED, sources/academy/build-and-publish/apify-store-basics/how_store_works.md]. Abandoned actors
   really do leave holes.

## 7. Cost side — Creator Plan

[SNIPPET] https://apify.com/pricing/creator-plan — "$1/month, $500 of platform usage for the first 6 months",
capped at 10 GB residential proxy and 10,000 SERPs/month, and it **limits access to Actors on Apify Store**.
Free plan: **$5/month** of prepaid usage, no card. **[BLOCKED]** — apify.com unreachable; verify before relying.
If true this makes build-and-test cost ≈ $1/month for six months, which is the cheapest developer runway in the sweep.

## 8. ToS / constitution check

Store Publishing T&C (RENDERED) §2.2.4.2 forbids exactly the things our constitution forbids:
(i) "directly or indirectly offer, link to, or promote any product or service outside of the Platform" —
**this is a real constraint on us: we may not use an Actor README to funnel buyers to il-biz-tools or our x402 API.**
(ii) "Offer incentives for reviews, solicit fake reviews, use multiple accounts to influence ratings".
§2.2.3 forbids copying another creator's code/readme/description.
Building original PPE actors over documented public APIs is **GREEN**. Scraping actors targeting sites whose
terms forbid it would be AMBER/RED and are out of scope for us regardless.

## Dead ends (do not re-search)
- **Rent-an-actor**: closed to new entrants 2026-04-01, fully retired 2026-10-01. Zero.
- **Pay-per-usage**: developer earns $0 by definition. Only useful as a free-tier funnel.
- **api.apify.com / apify.com / blog.apify.com / help.apify.com**: all egress-blocked. Do not retry.
- **Named per-actor revenue numbers**: nobody publishes them. The 98-actor builder deliberately withheld
  the figure. Any specific "actor X earns $Y" claim in this colony should be treated as fabricated
  unless it links to a rendered first-party page.
