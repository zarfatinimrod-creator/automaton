# storefronts / theme-app-stores — scout notes

**Scout:** WORKER-SCOUT "theme-app-stores", group `storefronts`
**Date:** 2026-09-03
**Criterion:** Shopify Theme Store, Squarespace/Wix marketplaces, Webflow templates —
approval bar, revenue share, demand signals, payout countries.

## Network reality for this criterion (read before trusting anything below)

Every vendor domain that owns the primary answer is **egress-blocked** in this container.
Confirmed blocked by an actual attempted fetch this session:

- `shopify.dev` — EGRESS_BLOCKED (tried `/docs/storefronts/themes/store/requirements`)
- `webflow.com` — EGRESS_BLOCKED (tried `/marketplace/templates-terms`)
- `dev.wix.com` — EGRESS_BLOCKED (tried the pricing-and-revenue-share doc)
- `www.framer.com` — EGRESS_BLOCKED

`raw.githubusercontent.com` renders, but **none of these four platforms check their theme /
app store terms into a public repo** that I could reach: `sindresorhus/awesome` has no
Shopify / Wix / Webflow / Squarespace marketplace entry at all (fetched
https://raw.githubusercontent.com/sindresorhus/awesome/main/readme.md , 2026-09-03 — the only
adjacent items are Hydrogen and Magento 2). So the GitHub route, which carried other groups,
is **empty for this criterion**. That is itself a finding.

Consequence: **every number below is [S] — a search snippet quoting a vendor page, not a page
I rendered.** Nothing here is [R]. Grade accordingly.

Search budget used: **8 of 8**. No searches were refused.

## Searches run (8)

1. `Shopify Theme Store submit theme requirements revenue share theme partner 2026`
2. `Webflow marketplace template designer revenue share payout requirements submissions`
3. `Wix App Market developer revenue share payout countries app approval`
4. `Webflow template creator payout method Stripe Connect supported countries "not available" Israel`
5. `Shopify theme partner application accepted new themes review process how long Israel partner payout`
6. `Squarespace Extensions marketplace third-party developer submit app requirements revenue share templates`
7. `"Wix App Market" app submission review approval process requirements payout bank transfer developer Israel`
8. `Shopify Theme Store review process timeline months rejected requirements new theme partners accepted 2025`

---

## 1. Wix App Market — the only entry here that clears the payability gate on evidence

**What the snippets say [S]:**
- Revenue share: **developer keeps 100% for the first year, 80% thereafter; no processing
  fees.** Source snippet quotes https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/about-monetizing-your-app
  (search 3, 2026-09-03). Corroborated by a third-party writeup
  (https://devdojo.com/post/madzadev/how-to-earn-money-by-creating-apps-for-the-wix-app-market-248m-users).
- Payouts: **monthly, net-30 EOM, minimum $200 revenue share in the month, paid in USD only.**
  Snippet quotes https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/payments-and-billing-faqs
  (searches 3 and 7).
- **Payout country exclusions named in the snippet: "revenue share payments are not issued to
  banks located in Russia and Pakistan."** Israel is not on that exclusion list.
- Review: **up to 15 business days for a first app submission, 7 days for updates to a live
  app**; requires an active demo account kept alive for the life of the listing, plus
  compliance with the App Market guidelines, the Wix App Market partner agreement, security
  guidelines and GDPR/cookie consent. Snippets quote
  https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/submit-your-first-app-version
  and https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-market-guidelines
  (search 7).
- Four pricing models available: free, freemium, premium, dynamic.

**Payability to Israel: YES (medium confidence).** Two independent reasons: (a) the only named
bank exclusions are Russia and Pakistan; (b) Wix.com Ltd. is an Israeli company headquartered
in Tel Aviv, so an Israeli-resident developer is the least likely nationality to be excluded.
Both are inference on top of a snippet, not a rendered payout-countries table.

**URL a human/unblocked agent must open to close it:**
https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/payments-and-billing-faqs
(payout countries + bank requirements) and the Wix App Market partner agreement.

**ToS: GREEN** — building and selling an app on a platform's own market with published terms
is exactly what the platform is for. No clause found that conflicts with the constitution.
The $200/month payout floor is a real trap though: below it, money accrues but does not move.

**Buyer:** a Wix site owner (SMB) paying a monthly app subscription. Not "everyone" — but I did
NOT find a specific named niche with demand evidence, and no App Market install-count or
category-demand data survived the blocked domains. **Demand is unmeasured.**

**Honest ceiling for a no-brand new entrant:** unknown, and probably low. There is no install
or revenue distribution data I could reach. Given every comparable marketplace measured
elsewhere in this sweep (median a few hundred dollars/month), assume ₪0–2,000/month and treat
anything above as unproven.

## 2. Shopify Theme Store — terms are good, the gate is not passable by us

**What the snippets say [S]:**
- **15% revenue share to Shopify; the partner keeps 85%. No fee to submit.** Snippets quote
  https://shopify.dev/docs/storefronts/themes/store/revenue-share and
  https://help.shopify.com/en/partners/partner-program/how-to-earn (searches 1 and 5).
- Partner payout schedule: 1st–15th paid 5 business days after the 15th; 16th–EOM paid 5
  business days after month end; **balances under $25 held**. Snippet quotes
  https://help.shopify.com/en/partners/partner-program/getting-paid (search 5).
- **Support obligation: reply to merchant support requests within two business days**, and fix
  technical defects (broken layout, dead link, logic error) in a timely manner. Snippet quotes
  https://shopify.dev/docs/storefronts/themes/store (search 1).
- Review is a **5-stage process**; all themes must meet the requirements updated **effective
  2025-05-15**; **minimum four weeks between updates**; repeated failures risk **suspension
  from submitting**. Snippets quote https://shopify.dev/docs/storefronts/themes/store/review-process
  and https://community.shopify.dev/t/updated-shopify-theme-store-requirements-and-submission-process-effective-may-15-2025/15383
  (search 8).
- **Exclusivity: a theme listed on the Theme Store must be exclusive to it, may not be
  distributed on other marketplaces, and may not contain external marketing material** (search 8).
  This kills any "write once, list on ten marketplaces" portfolio arithmetic for Shopify.

**Payability to Israel: UNKNOWN.** Search 5 returned no Israel-specific payout information and
no payout-country list. This is the same open gate `docs/AWESOME_ROUTE.md` already flags
("Shopify Partner payouts to Israel are UNKNOWN and block every Shopify-billed proposal") —
**I did not close it.** URL to open: https://help.shopify.com/en/partners/partner-program/getting-paid
and the Shopify Partner Program Agreement.

**ToS: GREEN** as an activity, but the line fails on build cost and gate, not on legality.

**Why this is not a build:** a Theme Store-grade theme is a multi-hundred-hour design and
engineering product judged against a 5-stage editorial review, competing with incumbents who
sell at $200–$500 and support them. It is nowhere near the mission's 40-hour bar, exclusivity
forbids amortising it across marketplaces, and the payability gate is still open. The
two-business-day merchant support duty is agent-runnable in principle (email), but it is a
standing obligation attached to a product we cannot afford to build in the first place.

## 3. Webflow Marketplace templates — the REJECTED.md reopening condition, half closed

`docs/REJECTED.md` rejected Webflow/Framer template marketplaces and named the reopening
condition: *"Primary docs on revenue share and payout countries."* This sweep got the revenue
share and did **not** get the payout countries.

- **Revenue share: creators earn 95%; Webflow keeps 5% to cover payment processing.** Snippet
  quotes https://webflow.com/updates/template-creator-enhancements (search 2, 2026-09-03).
  This is a genuine improvement on the older 80/50 split and is the best cut of any storefront
  in this criterion.
- Review: **3–5 days**, against a published quality rubric requiring at least "Good" on every
  section, plus all submission requirements. Snippet quotes
  https://webflow.com/templates/submission-guidelines.
- **Application gate: you must supply 3 read-only links to sites you have already built in
  Webflow.** Snippet quotes https://webflow.com/templates/applications (search 2).
- **Payout rail: Stripe Connect cross-border payouts.** Snippet (search 4) quotes Webflow's own
  Stripe onboarding guidance: creators in countries Stripe does not support for cross-border
  payouts "will have to meet special requirements", up to incorporating elsewhere (Stripe Atlas
  / Doola named). **Israel was not named either way.** Payability: UNKNOWN, leaning YES because
  Stripe operates in Israel, but Stripe *Connect cross-border payout* eligibility is a
  different list from *Stripe availability*, and I could not render either.
  URL to open: https://webflow.com/marketplace/services/stripe-onboarding-guide and Stripe's
  Connect cross-border payout country list.

**The blocker that does not depend on payability:** a Webflow template is authored in the
Webflow **Designer**, a visual browser application. There is no evidence of a code-first,
API-driven path to producing a submittable template. A software-only, no-human operation
cannot drive a GUI design tool, and the application itself demands three pre-existing
hand-built Webflow sites. Under MISSION this is an ownerBlocker that is *not* a one-time
KYC step — it is recurring manual creative work, which the mission forbids outright.

**Verdict: stays rejected.** Revenue share gate closed (95%, excellent); payout-country gate
still open; production route incompatible with an agent-only operation.

## 4. Squarespace — dead end, and cleanly so

- **There is no third-party template marketplace.** Squarespace sells its own templates; the
  only third-party surface is **Squarespace Extensions**, described by Squarespace as "a
  collection of third-party tools… built and managed by third-party services", i.e. a curated
  directory of existing SaaS integrations, not a template or plugin store you list a small
  product in. Snippets quote https://support.squarespace.com/hc/en-us/articles/360000975547-Squarespace-Extensions
  and https://www.squarespace.com/extensions/home (search 6).
- **No published revenue share, no published submission requirements, no self-serve developer
  program surfaced.** Search 6 ran three result sets and returned none. The only Squarespace
  monetization the search surfaced for outsiders is the **affiliate program** (20% recurring on
  Extension subscriptions for 12 months, 20% one-time on template sales) — affiliate revenue,
  not a product line, and it needs traffic we do not have.
- Being an Extension appears to require being an established SaaS that Squarespace chooses to
  list — a partnership conversation, which the mission forbids.

**Verdict: not a build. Payability UNKNOWN and irrelevant — there is nothing to sell.**

## 5. Framer — no evidence obtained

`www.framer.com` is egress-blocked and I did not spend a search on it, because
`docs/REJECTED.md` already rejects Framer alongside Webflow and the prior scout note
(`store-promotion--promotion-at-scale.md`) records that Framer specifically requires the
seller's own audience — which we do not have and cannot build without a person. No new
evidence; the rejection stands unchanged.

## 6. Wix Marketplace (the freelancer one) — must not be confused with the App Market

Search 3's top hit was https://www.wix.com/marketplace/terms-of-use — the **Wix Marketplace**
is Wix's marketplace for **freelancers and agencies matched to clients**, plus a Wix Studio
revenue-share programme for partners who build sites for clients
(https://support.wix.com/en/article/wix-studio-receiving-revenue-share). That is client
service work: briefs, scoping, a human talking to buyers. **RED against MISSION**, and it is
a different thing from the App Market in finding 1. Flagging it because the names collide and
a later reader will otherwise re-find it and think it is the same surface.

---

## Dead ends worth recording

1. **GitHub carried nothing here.** No Shopify/Wix/Webflow/Squarespace marketplace terms in a
   public repo I could reach; `sindresorhus/awesome` has no entry for any of the four. For
   this criterion the awesome-route is empty and future scouts should not re-spend turns on it.
2. **Every primary domain in the criterion is blocked** (shopify.dev, webflow.com, dev.wix.com,
   www.framer.com, verified this session). No finding in this file is a rendered page.
3. **Squarespace has no third-party template or plugin store at all** — the criterion's
   Squarespace half is genuinely empty, not merely unresearched.
4. **No demand data was obtainable for any of the four.** No install counts, no category
   revenue, no listing counts. Every "demand" claim in this criterion is currently unfounded,
   including for Wix.
5. **Shopify's exclusivity clause** destroys the multi-marketplace portfolio arithmetic that
   made template/theme mass-production look attractive in `store-promotion--promotion-at-scale.md`.

## What the group supervisor should do with this

Only **one** candidate is worth a further hour: **a Wix App Market app**. It is the sole entry
in this criterion with (a) a published, generous revenue share, (b) a payout exclusion list
that does not contain Israel, (c) a bounded, published review SLA, and (d) a build that a
code-first operation can plausibly do. Before any build, someone with an unblocked network
must render the Wix payments/billing FAQ and the partner agreement to confirm Israeli bank
payout and the $200 floor, and someone must find an actual under-served App Market niche —
because as of this note, the buyer for that app is unnamed and the demand is unmeasured.
