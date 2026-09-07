# Scout: plugin-ecosystems / wordpress

**Criterion:** WordPress plugin economy and Freemius — market size in 2026, freemium
conversion norms, competition, and payout rails.
**Date:** 2026-09-04. **Model:** Opus 5 (scout tier).
**Search budget spent:** 7 of the 8 allowed. GitHub/MCP calls (free): 8.

---

## 0. Evidence grading used below

- **rendered** — I fetched the page/file and read its text.
- **snippet** — a WebSearch result summary quoting a page I could NOT open (the egress
  proxy blocks the host). Weaker. Every such claim names the exact URL to open.
- **repo-internal** — a prior finding already in this repository.
- Nothing here rests on memory. Where I had only memory, I wrote "unknown".

**Hosts confirmed blocked this session:** `freemius.com` (both `/pricing/` and
`/help/documentation/...` returned `EGRESS_BLOCKED`). `wordpress.org` and
`api.wordpress.org` were already recorded as blocked in `docs/REJECTED.md`.
**Hosts confirmed working:** `raw.githubusercontent.com`, `github.com` (via MCP
`search_code`, which reaches across all of GitHub).

---

## 1. The rulebook — RENDERED, primary source, zero search budget

`wordpress.org` is blocked, but WordPress checks the Detailed Plugin Guidelines into a
public repo as markdown. Fetched and rendered:

**https://raw.githubusercontent.com/WordPress/developer-plugins-handbook/main/wordpress-org/detailed-plugin-guidelines/index.md**
(fetched 2026-09-04)

Verbatim, from that file:

- **Guideline 5 — Trialware is not permitted:** *"Plugins may not contain functionality
  that is restricted or locked, only to be made available by payment or upgrade."*
- **Guideline 5, continued:** *"Attempting to upsell the user on ad-hoc products and
  features _is_ acceptable, provided it falls within bounds of guideline 11."*
- **Guideline 11 — dashboard hijacking:** *"Upgrade prompts, notices, alerts, and the
  like must be limited in scope and used sparingly, be that contextually or only on the
  plugin's setting page."*
- **Guideline 6 — SaaS is permitted:** *"Plugins that act as an interface to some
  external third party service (e.g. a video hosting site) are allowed, even for paid
  services."*
- **Guideline 12:** *"Links to directly required products, such as themes or other
  plugins required for the plugin's use, are permitted within moderation."*
- **Guideline 1:** *"Although any GPL-compatible license is acceptable, using the same
  license as WordPress — 'GPLv2 or later' — is strongly recommended."*

All 18 headings are in that file. Cross-checked against a second rendered primary source,
WordPress's own site code:
**https://github.com/WordPress/wordpress.org** →
`wordpress.org/public_html/wp-content/themes/pub/wporg-plugins-2024/patterns/page-developers.php`
(via MCP `search_code`, 2026-09-04) which reads: *"The plugin must not impose artificial
restrictions on its built-in functionality. This includes license gates, paywalls,
time-limited trials, usage quotas, or any other mechanism that limits features included
in the plugin code and/or that the plugin code can do."*

**What this settles.** `docs/REJECTED.md:306` was right that guideline 5 forbids trialware
outright — and it is now backed by a rendered clause rather than an inference. But the
same guideline **explicitly permits upselling**, and guideline 6 explicitly permits paid
external services. So the legal shape of a WordPress freemium business is precise and
GREEN:

> A fully functional free plugin ships in the directory. The Pro build is a *separate
> download*, distributed from outside the directory (Freemius/EDD/own site). The free
> plugin may advertise Pro, but only on its own settings page and sparingly (g11).

That is not a workaround; it is the model every WordPress freemium vendor uses. What it
costs us is that "add a paid tier to the plugin we already published" is not a small
edit — it is a second distributable, a licensing/update server (or a vendor for one), and
an upsell surface constrained by g11.

## 2. Market size and competition — SNIPPET ONLY

WebSearch, 2026-09-04, query *"WordPress plugin directory number of plugins 2026
statistics market size"*. Numbers below come from third-party statistics blogs quoting
each other; I could not open `wordpress.org/plugins/` or `api.wordpress.org` to verify a
single one. **Treat all of §2 as snippet-grade and probably inflated.**

- ~**66,695** plugins in the wordpress.org directory (cited "as of August 2026"); other
  results in the same set said "more than 65,000" and "more than 63,000". The spread
  across three sources for the same month is itself the signal about the quality here.
- New submissions **above 500/week** by early 2026, said to have nearly doubled in 2025.
- ~326.3M active installs, 15.4B all-time downloads, ecosystem-wide.
- CodeCanyon carries **~5,200** paid WordPress plugins.
- A "$596.7bn annual economic activity" figure for the whole WordPress economy circulates
  in these posts. It is a marketing number for hosting+services+agencies and has no
  bearing on what a plugin author earns. I record it only so nobody re-finds it and
  treats it as a market we can address.
- Sources seen (not opened): https://blog.wpodyssey.com/plugins-tools/how-many-wordpress-plugins-are-there/ ,
  https://www.wpzoom.com/blog/wordpress-statistics/ , https://sqmagazine.co.uk/wordpress-statistics/ ,
  https://wp.md/wordpress-plugin-stats/

**To close this properly** someone on an unblocked network must open
`https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[per_page]=1`
(returns the true total in `info.results`) and, for any specific competitor, that
plugin's `active_installs`. `docs/REJECTED.md:357` already flagged that this repo has
**never** read an `active_installs` figure — that remains true after this sweep.

Earnings, also snippet-grade and worse: a search summary gave "average revenue for a
plugin in a directory is around **$8,350**" and "a WordPress plugin author earns around
**$13,334**", with **no stated period and no named source**. I would not put weight on
either; both smell like scraped aggregate numbers, and plugin revenue is a power law, so
a mean is the wrong statistic anyway (the same mistake `docs/REJECTED.md` caught in the
Apify ranking).

## 3. Freemium conversion norms — SNIPPET, from Freemius's own blog

WebSearch, 2026-09-04, query *"Freemius freemium conversion rate benchmark WordPress
plugin free to paid percentage"*:

- Feature-gated freemium converts in the **low single digits — 2.1%** typical, up to
  **7.4%** with strong product-led onboarding.
- Free trial **without** a payment method converts at ~**18.78%** to paying.
- Generic pricing-page-to-paid range quoted as 2–4%.

Pages quoted (blocked, not opened): https://freemius.com/blog/freemium-pricing-strategy/ ,
https://freemius.com/blog/trials-premium-wordpress-plugins-themes/

**The arithmetic that matters.** At 2.1% conversion and a $49/yr Pro tier, reaching
₪20,000/month (~$5,400) needs ~110 new paying customers per month, which needs ~5,200 new
free activations per month, every month. That is the whole finding: the WordPress plugin
economy is not gated on building the plugin, it is gated on **installs**, and installs
come from directory search ranking, which is driven by existing installs and ratings.
A day-one plugin has neither. This is the same "multiplier on zero" refutation the
`cross-promotion` scout wrote and `docs/REJECTED.md` preserved.

Note also that the 18.78% trial number is unusable for us in the directory: guideline 5
forbids time-limited trials inside directory-hosted code.

## 4. Freemius — fees and payout rails (task #21)

**freemius.com is egress-blocked**, so nothing here is rendered. Two searches, 2026-09-04.

Fees (snippet, from https://freemius.com/blog/new-freemius-pricing-2025/ and
https://freemius.com/wordpress/pricing/):
- Platform fee for WordPress makers starts at **4.7%**, plus **2.3%** for the full
  dedicated WordPress solution = **7%** all-in platform.
- Tiered down with volume, to 0.5% above $100k/month (irrelevant to us).
- **Gateway fees ~3.5% effective are charged on top.** So the honest entry-level cost is
  ~**10–11% of revenue**, not 7%.

Payouts (snippet, from https://freemius.com/help/documentation/selling-with-freemius/your-earnings/
and https://freemius.com/help/documentation/selling-with-freemius/supported-countries/):
- Paid out **monthly**, via **PayPal, Payoneer, or bank wire (IBAN/SWIFT)**.
- **Minimum balance $100** before a payout is issued.
- "Software makers in **190+ countries**", excluding US-sanctioned countries; the
  supported-countries list is defined as "all countries where at least one payout method
  is available".
- Corroborated independently by a third-party research file rendered on GitHub
  (https://github.com/nnnkit/totem `plans/research/premium-monetization/raw/rs-payments.md`,
  via MCP search_code 2026-09-04): *"Freemius (WP/plugin MoR) … payouts via PayPal MassPay
  (default), Payoneer, wire/SWIFT, or Wise"*. Same methods, different author — so the
  payout-method claim is now double-sourced, though still not rendered from Freemius.

### Correction to `src/revenue/rails.ts`

The Freemius entry in `src/revenue/rails.ts` says Freemius *"pays out in ILS with no
conversion fee"*. **I found no support for that and I think it is a misreading.** The
search result that mentions ILS says you can **sell in** ILS — ILS is a *pricing/checkout*
currency offered to buyers, alongside USD/GBP/EUR/CAD/AUD/PLN. That is a different claim
from being paid out in ILS. The rails entry should be downgraded to "selling currency
includes ILS; payout currency unverified" until someone renders the page.

### Israel payability: UNKNOWN, leaning YES

- **For:** 190+ countries; Israel is not US-sanctioned; and all three payout methods
  (PayPal, Payoneer, SWIFT wire) independently reach Israel — this repo already documents
  PayPal Israel and Payoneer as working rails.
- **Against:** I have zero direct evidence. No page listing Israel was rendered or even
  quoted. Absence of a blocker is not evidence of support, and this repo has been burned
  by exactly that inference before.
- **Verdict: UNKNOWN.** I will not upgrade it on a syllogism.
- **The one URL that closes it:**
  `https://freemius.com/help/documentation/selling-with-freemius/supported-countries/`
  — a human or an unblocked agent opens it and searches for "Israel". Second question for
  the same visit: whether an **osek patur** (individual, no company) can register as a
  seller, and what payout currency an Israeli account actually receives.

## 5. Israeli WooCommerce niche — measured on GitHub, free

`wordpress.org` is blocked, but a large slice of the plugin directory is mirrored into
public GitHub orgs (`common-repository/*`, `WordPressBugBounty/plugins-*`), and MCP
`search_code` reaches them. Hebrew-language searches, 2026-09-04:

- `"חשבונית" filename:readme.txt org:common-repository` → 3 hits.
- `"מע\"מ" org:common-repository` → 7 hits.

Plugins surfaced: `payplus-payment-gateway`, `z-credit-webcheckout-for-woo`,
`yaad-sarig-payment-gateway-for-wc`, `wizshop` / `wizshop-for-elementor` (Hashavshevet
integration), `responder-integration`. WebSearch additionally surfaced
`wc-gateway-greeninvoice` (Morning / Green Invoice) and `icount`.

**These counts are NOT a census.** The mirror is a partial snapshot and GitHub code search
indexes a subset of it; the true directory count of Hebrew plugins is higher and unknown.
What the sample *does* establish, and this is the real finding:

> Every Israeli WooCommerce plugin I found is published **by the vendor whose paid service
> it connects to** — PayPlus, Z-Credit, Yaad Sarig, iCount, Morning/Green Invoice,
> Hashavshevet. The plugin is free because it is a *channel* for a paid clearing or
> accounting subscription. The money in this niche sits with the licensed financial
> vendor, not with the plugin author.

A third-party plugin author cannot capture that: we cannot clear cards, and we cannot
issue a tax-authority-signed Israeli invoice. This is the same structural rule the
`plugin-ecosystems` supervisor already recorded in `docs/REJECTED.md` — *"the engine is
always free and the paid layer is always brand and sales"* — showing up again in the one
sub-niche where our Israeli knowledge would otherwise be an edge.

## 6. Build-time and process reality

- A compliant freemium pair is **two** distributables plus a licensing/update path. With
  Freemius's SDK the licensing part is a drop-in (that is the whole reason the SDK
  exists, 305 stars, https://github.com/Freemius/wordpress-sdk, rendered README
  2026-09-04). Realistic build for a small plugin + Pro split + Freemius wiring: **30–40h**.
- **The queue is the schedule, not the build.** `docs/REJECTED.md` records the wp.org
  review queue at **4,715 plugins, 3,854 older than a week**. Submission is a human-reviewed
  gate with an unbounded wait, and this is the only revenue line I looked at where we
  cannot control time-to-first-dollar at all.
- Owner blockers are thin and real: a wordpress.org account (self-serve, no KYC), and a
  Freemius seller account whose identity/tax step is unverified — see §4.

## 7. All URLs used

Rendered:
- https://raw.githubusercontent.com/WordPress/developer-plugins-handbook/main/wordpress-org/detailed-plugin-guidelines/index.md
- https://raw.githubusercontent.com/Freemius/wordpress-sdk/master/README.md
- https://github.com/WordPress/wordpress.org (via MCP search_code)
- https://github.com/nnnkit/totem `plans/research/premium-monetization/raw/rs-payments.md` (via MCP search_code)
- https://github.com/common-repository/* Hebrew plugin mirrors (via MCP search_code)
- https://github.com/Freemius (repo listing, 26 repos)

Blocked, quoted only via search snippets — these are the pages to open:
- https://freemius.com/help/documentation/selling-with-freemius/supported-countries/  ← the payability gate
- https://freemius.com/help/documentation/selling-with-freemius/your-earnings/
- https://freemius.com/blog/new-freemius-pricing-2025/
- https://freemius.com/wordpress/pricing/
- https://freemius.com/blog/freemium-pricing-strategy/
- https://blog.wpodyssey.com/plugins-tools/how-many-wordpress-plugins-are-there/
- https://wordpress.org/plugins/wc-gateway-greeninvoice/ , https://wordpress.org/plugins/icount/
- https://api.wordpress.org/plugins/info/1.2/?action=query_plugins  ← the only honest install/count source

Failed fetches (recorded so nobody retries): https://freemius.com/pricing/ (EGRESS_BLOCKED),
https://freemius.com/help/documentation/selling-with-freemius/payouts/ (EGRESS_BLOCKED),
https://raw.githubusercontent.com/WordPress/developer-plugins-handbook/trunk/... (404 — the
branch is `main`, not `trunk`), https://raw.githubusercontent.com/Freemius/freemius-ai/main/README.md
(renders, but contains nothing about fees).
