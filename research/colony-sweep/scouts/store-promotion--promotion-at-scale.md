# Scout notes — group: store-promotion / criterion: promotion-at-scale

Date of research: 2026-09-03. Agent: WORKER-SCOUT "promotion-at-scale".

**Criterion:** how does anyone promote 100–900 separate storefronts when per-store human
effort is impossible? Who actually runs portfolios at that scale, what do they really do,
and where exactly does portfolio promotion become a spam cluster in the eyes of Google,
the marketplaces and the ad networks?

## Evidence strength key
- **[R]** rendered page I actually fetched (primary source, strongest)
- **[S]** search snippet quoting a page I could NOT render (weaker — the URL to open is given)
- egress note: `developers.google.com`, `developer.wordpress.org`, `etsy.com`, `reddit.com`,
  `help.apify.com`, `apify.com` are all blocked by the proxy. `github.com` and
  `raw.githubusercontent.com` render, and Apify + WordPress check their real policies into
  public repos — that carried this scout's primary evidence.

---

## 1. The single sharpest answer to the criterion

Nobody promotes 900 storefronts. The operators who actually run portfolios at that scale
**do not do per-listing promotion at all** — they publish into a marketplace whose own
search/ranking surface is the distribution channel, and they spend their effort on the
*ranking inputs* the marketplace measures, not on outbound marketing per listing.

Primary evidence, Apify (the only marketplace I found that both permits an unlimited
portfolio and states its ranking function in public):

[R] https://raw.githubusercontent.com/apify/apify-docs/master/sources/academy/build-and-publish/apify-store-basics/how_store_works.md
> "Search ranking evaluates parameters similar to those in the Actor quality score" …
> "Actors with higher quality scores tend to rank higher in Apify Store search."
> Actors failing automated tests for 3 consecutive days get a maintenance label; after a
> further 28 days of failure they are deprecated and removed.
> No limit is stated on how many Actors one developer may publish.

[R] https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/publishing/quality_score.mdx
> Quality score aggregates 8 dimensions: reliability, popularity, feedback/community,
> ease of use, pricing transparency, trustworthiness (limited permissions), history of
> success (developer track record), and **congruency** (consistency across titles,
> descriptions, schemas, documentation). Recalculated multiple times daily; can move
> without the developer changing anything.

Read together: at portfolio scale the lever is **uptime + honest schemas + congruent
listings + real usage**, which is exactly what software can maintain across 900 listings.
"Marketing" per listing is what does not scale — and, see §3, is also what gets you killed.

## 2. Where the marketplaces draw the spam line (quoted)

### Chrome Web Store — a portfolio of near-identical listings is banned outright
Source repo is Google's own (archived 2024-03-14, so date-stamp this as "policy text as of
March 2024" — the live policy page is on developer.chrome.com and should be re-checked).

[R] https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/program-policies/spam-and-abuse/index.md
> "We don't allow any developer, related developer accounts, or their affiliates to submit
> multiple extensions that provide duplicate experiences or functionality on the Chrome
> Web Store."
> Also bans "inflating product ratings, reviews, or install counts by illegitimate means,
> such as fraudulent or incentivized downloads, reviews and ratings."

[R] https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/program-policies/minimum-functionality/index.md
> Prohibits "template extensions that only vary slightly in functionality with negligible
> utility"; prohibits an extension whose "single purpose [is] installing or launching
> another app, theme, webpage, or extension"; requires a "basic degree of functionality and
> utility that provide value to the catalog".

[R] https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/program-policies/quality-guidelines/index.md
> Single-purpose rule: an extension must have "a single purpose that is narrow and easy to
> understand."

**Conclusion: the CWS is the clearest "NO" in the whole criterion.** A templated
100–900-extension portfolio is a policy violation by definition, and enforcement is
account-wide.
[S] https://tryhoverify.com/blog/5-browser-extension-patterns-that-will-get-you-banned-from-the-chrome-store/
(third-party, weak) claims Google removes *all related extensions*, not just the flagged
one, and can permanently ban the publisher account. Treat as unverified colour, not fact.

### WordPress.org plugin directory — portfolio allowed, listing-copy spam is not
[R] https://github.com/WordPress/wporg-plugin-guidelines (18 guidelines; #12 is the spam one)
[R] https://raw.githubusercontent.com/WordPress/wporg-plugin-guidelines/trunk/guideline-12.md
> "Public facing pages on WordPress.org (readmes) must not spam." Spam includes
> "unnecessary affiliate links, tags to competitors plugins, use of over 12 tags total,
> blackhat SEO, and keyword stuffing." Readmes must be "written for people, not bots."
> Affiliate links must be disclosed and direct (no redirects).
Note: a [S] snippet of the older developer.wordpress.org rendering of the same guideline
quotes "over 5 tags" and an enforcement heuristic ("a keyword repeated over 30 times …
you're probably spamming"; "the same word 50 or more times … you'll likely be receiving a
warning") and says that when one plugin is flagged the developer is expected to fix *all*
their plugins. The trunk file I rendered says 12 tags, so the numeric heuristics are
snippet-only — open https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/
to confirm.
There is **no guideline capping the number of plugins** one developer may publish.

### Apify — explicitly permits functional overlap, bans copied content
[R] https://raw.githubusercontent.com/apify/apify-docs/master/sources/legal/latest/terms/store-publishing-terms-and-conditions.md
> "Creating an Actor that offers similar functionality or an outcome similar to another
> Actor is permitted. However, you must not copy another Creator's code, readme,
> description, or other content and publish it as your own."
> Names must be "relevant and non-deceptive"; no implying third-party affiliation.
> Apify may "unpublish, delete, restrict, or modify" Actors without prior notice.
> Payout: 80% to the creator / 20% Apify. Minimum USD 20 (PayPal) or USD 100 (other
> methods); below-minimum balances roll over and are forfeited after 12 months.
> **Identity verification (KYC) is required**; unverified for 12 months = forfeiture.
> No clause restricts the number of Actors a developer may publish.

[R] https://raw.githubusercontent.com/apify/apify-docs/master/sources/legal/latest/policies/acceptable-use-policy.md
> Prohibits "review system abuse, including … creating fake accounts" and "using multiple
> or coordinated accounts to submit reviews"; prohibits "unsolicited mass messaging" and
> "deceptive content (such as disinformation, clickbait, misleading ad, scam emails)".
> Apify may "block, delete, or otherwise restrict any such non-compliant User or Actor …
> without notice."

### Etsy / print-on-demand — multi-shop portfolios are the wrong shape
All Etsy evidence is [S] only (etsy.com blocked). Snippets of Etsy's policy say: "You may
have more than one account for distinct business purposes, but you must not use multiple
accounts to manipulate Etsy's policies or processes"; production partners must be
disclosed; originality standards tightened against "purchased templates, reused graphics,
AI output with minimal human input". The whole third-party literature around this
criterion is about *evading account linking* (anti-detect browsers, separate payment
instruments, GoLogin) — i.e. the operators who "run 5–50 Etsy shops" are running an
evasion operation, which is RED under our constitution regardless of Etsy's exact wording.
URLs to open on an unblocked agent: https://www.etsy.com/legal/sellers/ and
https://www.etsy.com/legal/terms/.
[S] Amazon Merch on Demand: tiered slot system starting at 10 live designs (10 → 25 → 100
→ 500 → 1000 → 2000 → 4000 → 8000+), advanced only by sales; 2026 tiers based on trailing
12-month performance; listings with no sales in 18 months auto-deleted. Israel is **not**
listed among eligible/selling countries in any snippet I saw, and the programme is
application-gated and manually reviewed. Sources are SEO blogs, not Amazon — open
https://merch.amazon.com/ to confirm before anyone builds on it.

## 3. Where Google draws the line — this is where "portfolio promotion" dies

developers.google.com is egress-blocked, so all four definitions below are [S] snippets
quoting https://developers.google.com/search/docs/essentials/spam-policies — that exact URL
must be opened by a human/unblocked agent to close this.

- **Scaled content abuse** — "when many pages are generated for the primary purpose of
  manipulating search rankings and not helping users … creating large amounts of
  unoriginal content that provides little to no value to users, no matter how it's
  created." Examples given include using generative AI to "generate many pages without
  adding value", scraping feeds/search results to generate many pages, and "stitching or
  combining content from different web pages without adding value."
- **Site reputation abuse** — "when third-party pages are published with little or no
  first-party oversight or involvement, where the purpose is to manipulate Search rankings
  by taking advantage of the first-party site's ranking signals." Policy tightened
  2024-11 (https://developers.google.com/search/blog/2024/11/site-reputation-abuse).
- **Doorway abuse** — "sites or pages … created to rank for specific, similar search
  queries", explicitly including "having multiple websites with slight variations to the
  URL and home page to maximize their reach for any specific query" and "multiple domain
  names or pages targeted at specific regions or cities that funnel users to one page."
- **Expired domain abuse** — buying an expired domain "and repurposed primarily to
  manipulate search rankings by hosting content that provides little to no value."

**This is the answer to "where does it stop being marketing":** the moment the *only*
difference between storefront N and storefront N+1 is a substituted variable (city, niche,
keyword), Google's doorway-abuse clause names it directly, and the March 2024 core+spam
update is when they started enforcing it at scale. [S] case material: a travel site with
50,000 "hotels in [city]" pages was 98% deindexed within 3 months; a 512-page programmatic
build with unique per-page data and real internal linking survived both the March 2024 core
update and the November 2025 refresh
(https://thestacc.com/blog/programmatic-seo-case-study/ ,
https://www.searchenginejournal.com/why-website-deindexed-by-google-for-programmatic-seo-bounced-back/552179/).
The discriminator in every account is **unique data per page**, not volume.

### Ad networks
[S] AdSense program policies (https://support.google.com/adsense/answer/48182) forbid
"pages with more advertising than publisher-provided content" and pages that "encourage
accidental clicks"; the MFA ("made for advertising") ecosystem consequently monetises
through Taboola/Outbrain-class networks and advertiser-side blocklists (Adalytics) rather
than AdSense. Read: an ad-monetised storefront portfolio has no honest, durable demand
side. Not a route for us.

### Community platforms
[S] Reddit content policy: users must "post authentic content into communities where you
have a personal interest, and do not cheat or engage in content manipulation (including
spamming, vote manipulation, ban evasion, or subscriber fraud)"; spam is "repeated,
unwanted, or unsolicited actions". Snippets claim a 2025 sweep removed ~70% of automated
posting accounts and that identical cross-posting across many subreddits is the primary
detection signal. Open https://www.reddit.com/policies/content-policy to confirm.

## 4. The trap inside the platform's own advice

Apify's own Academy tells creators to do exactly the thing Google's site-reputation-abuse
policy names, and to do the 27-step per-Actor promotion run that cannot scale:

[R] https://raw.githubusercontent.com/apify/apify-docs/master/sources/academy/build-and-publish/promoting-your-actor/parasite_seo.md
> "Parasite SEO is a strategy where you publish a quality piece of content on an
> established, high-authority external site to rank on search engines." Recommends Medium,
> LinkedIn Pulse, Reddit (`site:reddit.com [keyword]`) and Quora, with "subtle
> calls-to-action linking to your Actor".

[R] https://raw.githubusercontent.com/apify/apify-docs/master/sources/academy/build-and-publish/promoting-your-actor/checklist.md
27 manual steps per Actor: X/LinkedIn demo videos, Discord/Slack posts, 5–10 min tutorial
video, short-form video, Product Hunt launch, Hacker News submission (8–10 AM EST), Reddit
post + cross-posts, Stack Overflow answers, Quora, "Best X" articles on Medium/dev.to/
Hashnode/LinkedIn, "How to use" tutorials on the same four, GitHub example repo, personal
socials, email signature, UpWork/Fiverr portfolio, Notion content hub.

At 1 storefront this is a weekend. At 900 it is 24,300 manual acts, and automating steps
7–11 and 13–20 is precisely "third-party pages published with little or no first-party
oversight" (Google) plus "repeated, unwanted, or unsolicited actions" (Reddit). **The
platform's own playbook becomes a spam cluster the moment it is run at portfolio scale.**
This is the single most important sentence in this scout's report.

## 5. What operators at scale actually earn (honest numbers)

[S] only — apify.com and help.apify.com are blocked:
- Apify Store lists **53,954** tools/automations; Apify pays out **~$1.4M/month** across
  **~3,000** community developers → **~$470/developer/month average**, with "a handful of
  top actors pulling five figures, and plenty of published actors earning nothing."
  Top independent creators reportedly clear $10,000/month.
  Source snippet chain: https://apify.com/partners/actor-developers ,
  https://help.apify.com/en/articles/8684010-make-money-publishing-your-actors-on-apify-store ,
  https://agentbyline.com/articles/apify-actor-passive-income-what-really-earns-in-2026-67lcfr
  (the last is a third-party blog — the $1.4M/3,000 figures need confirming on apify.com).
- Rental model is being retired: no new rental listings after 2026-04-01, full retirement
  2026-10-01; pay-per-event is the surviving model. [S] — confirm at
  https://docs.apify.com/platform/actors/publishing/monetize
- [S] Framer/Webflow templates: "$500–$2,000 per template" for beginners, one named
  creator at "$4,000–$7,000/month"; Webflow's marketplace described as "more passive"
  (the marketplace sells for you), Framer as requiring the seller's own audience.
  All from vendor-adjacent blogs (segmentui.com, bryntaylor.co.uk) — low confidence.

**Honest read for a no-brand new entrant:** the median outcome in a 3,000-developer
marketplace is a few hundred dollars a month, not the top-decile five figures. A portfolio
gets you from "one listing, near zero" to "a distribution of small listings whose sum is
meaningful" — the arithmetic, not the marketing, is the mechanism.

## 6. Payability to Israel
- **Apify: YES.** [R] store-publishing T&Cs specify PayPal (min USD 20) or other Console
  methods (min USD 100), 80/20 split, KYC required, and state **no country restriction**.
  PayPal and international wire both serve Israel. Owner blocker: one-time identity
  verification + billing details in Apify Console; nothing recurring.
- **WordPress.org: N/A** (the directory pays nothing; money comes from your own
  Paddle/Freemius/Stripe checkout, all of which pay Israel).
- **Chrome Web Store: moot** — the portfolio shape is prohibited.
- **Amazon Merch on Demand: UNKNOWN, leaning NO** — Israel not seen in any eligible-country
  list; application-gated and manually reviewed. Do not build on it without confirming.
- **Etsy: UNKNOWN and irrelevant** — the multi-shop shape is RED for us anyway.

## 7. Searches spent
12 WebSearch calls (budget-conscious; GitHub carried the primary evidence).
