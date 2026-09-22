# SCOUT — store-promotion / paid-acquisition-floor

**Date:** 2026-09-03
**Question:** We have ₪200, once. Is any paid channel reachable at all? Measure it precisely enough that nobody re-proposes paid ads for a year.
**Verdict in one line:** Three channels are *technically* reachable (Meta, Google Search, Microsoft Ads, and marginally Reddit). What ₪200 buys is roughly **6,000 Meta impressions OR ~19-40 search clicks — once**. Everything else (Telegram, TikTok, LinkedIn, X, Israeli portals, Taboola) is out of reach at this float. **Paid acquisition is not a channel for this company at ₪200; it is a rounding error.**

---

## 0. The float, converted honestly

- **1 USD ≈ 3.03 ILS** as of early September 2026 (search snippet quoting Xe/Investing.com live rate, 2026-09-03; range 2.94-3.06 over Aug 3 - Sep 1 2026). Evidence: search snippet, not a rendered page.
  - https://www.xe.com/en-us/currencycharts/?from=USD&to=ILS
  - https://www.investing.com/currencies/usd-ils-historical-data
- **₪200 gross ≈ $66.**
- **Israeli VAT is 18% in 2025-2026** and applies to digital services sold to Israeli customers (snippet quoting invoicedataextraction.com and creem.io, 2026).
  - https://invoicedataextraction.com/blog/israel-vat-invoice-requirements
  - https://www.creem.io/blog/israel-vat-rate-guide-for-digital-sellers-in-2026
  - Google's Hebrew help page states Google charges VAT on digital services to customers with 'individual' and 'sole trader' tax status in Israel (snippet quoted "12%" — that figure looks stale/garbled versus the 18% statutory rate; **unresolved**).
    URL a human must open: https://support.google.com/google-ads/answer/2375370?hl=iw  (EGRESS_BLOCKED here)
- **Net media budget after VAT: ~₪169.5 ≈ $56.** All numbers below use $56.

---

## 1. Channel-by-channel floor

### Meta (Facebook / Instagram) — REACHABLE, best value per shekel
- Platform minimum: **$1/day** for impression/awareness objectives, **$5/day** for click- or conversion-optimised campaigns (search snippets, multiple 2026 guides).
  - https://cropink.com/minimum-budget-for-facebook-ads
  - https://www.stackmatix.com/blog/meta-ads-minimum-daily-budget-2026
  - https://www.tryvizup.com/blog/meta-ads-minimum-budget-requirements-2026
- **Israel CPM, real measured data:** 12-month median **≈ $9.15**, low $6.19 (Sep 2025), high $15.18 (Nov 2025). Source page is superads.ai's Israel CPM tracker; **EGRESS_BLOCKED**, so this is a search snippet quoting it.
  - URL a human must open: https://www.superads.ai/facebook-ads-costs/cpm-cost-per-mille/israel
- **What ₪200 buys:** $56 / $9.15 CPM ≈ **6,100 impressions**, once. At a generous 1% CTR that is **~61 clicks**; at a realistic 0.5-0.9% for cold Hebrew traffic, **30-55 clicks**. Spread over 11 days at the $5/day click minimum, or 1-2 days at a budget large enough to leave the learning phase.
- Sources are unanimous that the *practical* minimum for a campaign that exits learning and produces usable data is **$30-$50/day** — i.e. our entire float is one day of a real test.
- **Payability/eligibility:** Meta accepts credit/debit cards and PayPal broadly; no evidence found that Israel is excluded. Israeli advertisers plainly buy Meta ads. UNKNOWN only on ILS-denominated billing specifics.
- **Automation:** Marketing API with `ads_management` scope is the *authorized* route and supports fully automated campaign creation; scopes require Meta App Review before use outside your own Business Manager. Meta actively flags UI-driven automation. So: API = GREEN, browser scripting = AMBER/RED.
  - https://developers.meta.com/blog/updates-to-ads-management-standard-access-feature/
  - https://admanage.ai/blog/meta-ads-api
  - https://admakeai.com/blog/meta-account-flagged-automation

### Google Ads (Search) — REACHABLE, no minimum spend, but ~19-40 clicks total
- **There is no minimum spend on Google Ads.** No search result surfaced any Israel-specific minimum spend threshold; daily budgets are free-form.
  - https://www.get-ryze.ai/blog/google-ads-minimum-budget-guide-2026
- **CPC:** 2026 global average Search CPC **$2.96** (WebFX 2026 benchmarks; snippet), range $1.16 e-commerce to $6.75 legal. **No Israel/Hebrew-specific CPC data was findable** — searched explicitly, came back empty. Hebrew-language auctions are thinner and plausibly cheaper, but that is inference, not evidence.
  - https://www.webfx.com/blog/ppc/google-ads-benchmarks/
  - https://www.wordstream.com/blog/2026-google-ads-benchmarks
- **What ₪200 buys:** $56 / $2.96 ≈ **19 clicks** at the global average; **~48 clicks** if Hebrew long-tail runs at $1.16. Call it **19-48 clicks, once**.
- **Hard gate — advertiser verification.** Google requires advertiser verification; the Israel document page specifies that an **individual must submit an Israeli government-issued photo ID**, and an organisation must submit registration documents *plus* a photo ID of an authorised representative.
  - https://support.google.com/adspolicy/answer/9872280?hl=en&co=GENIE.CountryCode%3DIL
  - https://support.google.com/adspolicy/answer/9703665?hl=en
  - The Hebrew Google Ads help confirms account type can be set to "אדם פרטי" (individual) where that fits local tax needs — **so a registered business entity is NOT strictly required**, but a human ID document is.
    https://support.google.com/google-ads/answer/6366720?hl=iw
  - All of these are **EGRESS_BLOCKED** here; the above is search-snippet evidence. A human or unblocked agent must open them to close this.
- **Automation:** Google Ads API needs a developer token with **Basic Access** (production, 15,000 ops/day), applied for from a manager account; approval takes days, and since **2026-07-07** a brand-verification pilot gates/expedites it.
  - https://developers.google.com/google-ads/api/docs/api-policy/developer-token
  - https://developers.google.com/google-ads/api/docs/api-policy/access-levels

### Microsoft Advertising (Bing) — REACHABLE, cheapest clicks, but likely irrelevant volume in Israel
- **"No minimum spend and no signup fee"** (snippet of Microsoft's own ads.microsoft.com plus 2026 cost guides).
  - https://ads.microsoft.com/
  - https://megadigital.ai/en/blog/bing-ads-cost/
- **Average CPC 2026: $1.54** vs $2.69 on Google (snippet). ₪200 → **~36 clicks**.
  - https://www.stackmatix.com/blog/microsoft-advertising-cost-pricing-guide
- **Israel availability/ILS currency: UNKNOWN.** Searched; results only said "187 global markets" with no Israel confirmation and no supported-currency list.
  URL a human must open: Microsoft Advertising supported currencies/markets doc on learn.microsoft.com or help.ads.microsoft.com.
- Bing's search share in Israel is unknown to us and is the reason this channel is probably worthless here even though it is the cheapest per click.

### Reddit Ads — TECHNICALLY REACHABLE, practically pointless
- **Minimum daily budget $5.00 per campaign, minimum lifetime budget $25.00.** Self-serve at ads.reddit.com, no sales rep, no contract, no setup/platform/management fees.
  - https://www.stackmatix.com/blog/reddit-ads-minimum-budget-requirements-2026
  - https://recho.co/blog/how-much-do-reddit-ads-cost-in-2026
- **What ₪200 buys:** ~11 days at the $5/day floor, or two full lifetime-minimum campaigns. Sources say **$50-100/day for 14-21 days** is what produces statistically meaningful data — i.e. our whole float is 1 day of a real test.
- Reddit is English-language; it cannot promote Hebrew storefronts. Israel advertiser eligibility: **UNKNOWN** (not searched — no reason to, given the language mismatch).

### LinkedIn Ads — NOT REACHABLE in any useful sense
- **Minimum daily budget $10 per campaign, all formats.** Confirmed by LinkedIn's own help centre (snippet) and echoed in multiple rendered GitHub files.
  - https://www.linkedin.com/help/linkedin/answer/a422101
  - https://www.stackmatix.com/blog/linkedin-ads-minimum-daily-budget-2026
  - Rendered via GitHub code search (primary-ish, third-party skill docs quoting the figure): `tarkaai/gtm-skills` → `fundamentals/ads/linkedin-ads-thought-leader-setup.md` ("Minimum daily budget: $10/day per campaign"; "Typical CPC: $2-5 (vs $8-15 for company-page Sponsored Content)"); `ekatasingh1107/b2b-gtm-skills` → `skills/composites/linkedin-ads-builder/SKILL.md` ("Minimum daily budget: $10 USD per campaign", "Average CPL: $25-75"); `brainbytes-dev/everything-claude-marketing` → `skills/paid-ads/linkedin-ads/SKILL.md`; `matthewhalliard/mediaplanningtool` → `src/data/directory/linkedin-campaign-manager.md`.
- **What ₪200 buys:** 5.6 days at the floor, or **~4-7 clicks** at $8-15 CPC, or **0-2 leads** at $25-75 CPL. Zero.

### X (Twitter) Ads — NOT REACHABLE in any useful sense
- No platform minimum spend, but **self-serve campaigns effectively start at $20/day**, and campaigns under **$500/month** rarely exit the learning phase (snippet).
  - https://www.stackmatix.com/blog/x-twitter-ads-cost
  - https://improvado.io/blog/twitter-ads-guide
- **What ₪200 buys:** 2.8 days at $20/day. Nothing.

### TikTok Ads — NOT REACHABLE
- **Minimum $50/day at campaign level, $20/day at ad-group level**, applying to every objective (snippet quoting TikTok's own help article, which is EGRESS_BLOCKED here).
  - URL a human must open: https://ads.tiktok.com/help/article/budget
  - https://www.stackmatix.com/blog/tiktok-ads-minimum-daily-budget-2026
- **What ₪200 buys: one single day** of the minimum campaign, $6 short of a second. CPM $4.20-9.00, CPC $0.17-1.00.
- Israel eligibility for TikTok Ads Manager: **UNKNOWN** (searched, no answer).

### Telegram Ads — NOT REACHABLE, and Israel appears to be excluded outright
- Two separate blockers, either of which is fatal:
  1. **Israel is reported excluded from the platform's covered markets** ("excluding Russia, Ukraine, Israel, and Palestine") — snippet from a 2026 vendor guide. This is the single most consequential claim in this report and rests on **one snippet**.
     URL a human must open: https://promote.telegram.org/ (EGRESS_BLOCKED) and https://propellerads.com/blog/adv-telegram-ads/
  2. **Minimums are 4 to 5 orders of magnitude above our float.** Direct account: **€2,000,000** minimum top-up. Via official reseller/agency: **€1,000-€5,000** typical entry, some sources €3,000-€5,000. Adsgram cabinet: 10 USDT/day plus a **500 USDT frozen reserve** for a new region/language pair. First deposit via TON: 20 TON.
     - https://propellerads.com/blog/adv-telegram-ads-minimum-budget/
     - https://blog.invitemember.com/telegram-ads-in-2026-setup-costs-and-requirements/
     - https://adsgram.ai/blog/adsgram/telegram-ads-the-complete-guide-to-formats-costs-and-launching-your-first-campaign
     - https://crmchat.ai/blog/telegram-ads-minimum-budget-breakdown
- **Conflicting claim to be aware of:** a GitHub file (`link-assistant/formal-ai` → `data/seed/concepts.lino`, rendered via code search) asserts "minimum budget of €2 for self-serve campaigns", citing promote.telegram.org as official-docs. That is almost certainly the **€2 minimum CPM** misread as a minimum budget. Another repo (`Anda4ka/telegram-supervisor` → `docs/archive/research/telegram_ecosystem.md`) records "Was 2M EUR initially, then reduced. [VERIFY current minimum]". Treat any "Telegram ads cost €2" claim as false until promote.telegram.org is rendered.
- **This matters beyond ads:** we already ship `products/telegram-il-tools-bot`. If Israel is genuinely excluded from Telegram's ad platform, we cannot buy Telegram traffic for our own Telegram product, ever.

### Taboola / Outbrain (native) — Outbrain marginally reachable, Taboola not
- **Outbrain self-serve:** daily budgets **$10-$20**, no monthly commitment, **no upfront deposit**, self-serve account free (snippet).
  - https://openadlibrary.com/blog/outbrain-minimum-budget/
  - https://www.stackmatix.com/blog/outbrain-ads-guide
- **Taboola:** **$50/day** recommended minimum; a long-standing community report of a **$1,500 minimum deposit** for advertisers (BlackHatWorld thread — weak, dated evidence).
  - https://checkthat.ai/brands/taboola/pricing
  - https://www.blackhatworld.com/seo/taboola-com-advertising-minimum-deposit-1500.815470/
- Managed accounts on both: **$500-$5,000/month minimums**. Out of reach and require a salesperson (which the owner will not be).
- **What ₪200 buys on Outbrain:** ~3-5 days at $10-20/day of low-intent native traffic. Native clicks are cheap but notoriously low-intent; ₪200 of it will not produce a signal.

### Israeli portals / local networks (Ynet, Walla, local ad reps) — NOT REACHABLE, structurally
- **Searched in Hebrew for Israeli self-serve platforms and 2026 rate cards; found nothing.** No Israeli portal publishes a self-serve minimum. The Israeli display market is sold by sales reps and rate cards obtained by contacting a sales department.
  - https://www.ynet.co.il/economy/marketingadvertising (topic page only, no rate card)
- This is a **double failure against the mission**: no self-serve API means no software-only operation, and "contact the sales department" means the owner would have to talk to a person, which MISSION.md forbids.

---

## 2. Owner blockers (one-time, human, unavoidable)

These are the *only* human steps, and they are identity/payment steps a platform legally requires:
1. **Google Ads:** advertiser verification requires the owner's Israeli government-issued photo ID (individual account type) — per Google's Israel document-requirements page. Not yet done. No business entity strictly required if account type = individual, but this is snippet-level and must be confirmed.
2. **Any channel:** a payment instrument in the owner's name (credit/debit card or PayPal) attached to the ad account. Not yet done.
3. **Meta Marketing API:** Business Manager creation and App Review submission — the App Review itself is agent-doable, but Business verification may request the owner's ID.
4. **Google Ads API:** manager account + developer token Basic Access application; brand verification of the Cloud project (since 2026-07-07) may require owner identity.

No other human steps were found and none should be invented.

## 3. ToS / constitution reading

- Buying ads honestly is **GREEN** on every channel above. Nothing here is spam or engagement farming.
- Operating the ad account **through the official APIs** (Google Ads API with a Basic-Access developer token; Meta Marketing API with `ads_management` after App Review) is **GREEN**.
- Operating an ad account by **scripting the web UI** is **AMBER→RED**: Meta explicitly flags accounts for automation, with account-level consequences.
- Anything that promises to promote "hundreds of storefronts" via paid ads at this float is not a ToS problem, it is an arithmetic problem.

## 4. The answer, stated so nobody re-proposes this for a year

₪200 is **one single day** of a genuine test on the cheapest serious channel, and the platform minimums say so directly: Meta wants $30-50/day to leave the learning phase, TikTok's floor alone is $50/day, Reddit needs $50-100/day for 14-21 days, LinkedIn $10/day buys ~5 clicks. Our entire float is **$56 net of VAT**.

The single best deployment of ₪200, if it must be spent, is **one Meta campaign, one audience, one creative, $5/day for 11 days, ≈6,100 Israeli impressions and 30-60 clicks** — enough to measure a landing-page click-through rate and nothing else. It cannot measure conversion, cannot compare creatives, cannot compare audiences, and cannot be scaled from.

**Recommendation: do not spend it.** ₪200 is worth more as a reserve against a domain renewal or a payment-rail fee than as 6,000 impressions. Paid acquisition becomes a real question at roughly **₪1,500-2,000/month** and not before. Re-open this file when monthly ledger revenue exceeds ₪3,000 — not on a date, on a number.

## 5. Dead ends found

- Israel-specific Google Ads CPC/CPM benchmarks: searched explicitly, **do not exist in reachable sources**.
- Israeli portal (Ynet/Walla) self-serve minimums and 2026 rate cards: **do not exist publicly**; sales-rep only.
- Microsoft Advertising Israel market/currency support: **unanswered** after one search.
- TikTok Ads Manager Israel availability: **unanswered**.
- Reddit Ads Israel advertiser eligibility: **not searched** (language mismatch makes it moot).

## 6. Evidence-quality ledger

- **Rendered pages:** only GitHub (via `mcp__github__search_code`) — the LinkedIn $10/day figure and the two Telegram minimum-budget claims. No platform's own site rendered.
- **EGRESS_BLOCKED (confirmed by attempt):** support.google.com, www.superads.ai, promote.telegram.org, ads.tiktok.com.
- **Everything else is search-snippet evidence** and is marked as such above.
- Web searches spent: **14**.
