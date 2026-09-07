# Scout notes — productized-services / automated-audits
Criterion: Automated audit reports as a product (SEO, Lighthouse, accessibility, security headers, Core Web Vitals): who buys them, at what price, and which incumbents already give them away free.
Scout: WORKER-SCOUT "automated-audits". Date of research: 2026-09-03.
Search budget used: 8/8 WebSearch calls (cap respected). GitHub/WebFetch used for primary sources (free).

## Evidence strength key
- **[RENDERED]** = page actually fetched and read by me.
- **[SNIPPET]** = search-result summary quoting a page I did NOT render. Weaker. URL to open is listed.
- Nothing here rests on memory. Where I could only reason, it is marked as inference and rated low confidence.

## Primary sources actually rendered
1. https://github.com/GoogleChrome/lighthouse — [RENDERED 2026-09-03]. Lighthouse, Apache-2.0, free/open source. Produces Performance, Accessibility, SEO and Best-Practices audits. Runnable via CLI (`npm install -g lighthouse`), as a Node module, in Chrome DevTools and as an extension. Outputs JSON/HTML/CSV.
   → Meaning: the entire "audit engine" is a free commodity. Any paid product must sell packaging, scheduling, interpretation or distribution — never the scan itself.
2. https://github.com/dequelabs/axe-core — [RENDERED 2026-09-03]. MPL-2.0, free. Tests WCAG 2.0/2.1/2.2 at A, AA, AAA. Documentation states it finds "on average 57% of WCAG issues automatically" and flags the rest as "incomplete" needing manual review.
   → Meaning: an automated accessibility report can never honestly claim compliance. Ceiling on honest claims is hard-set by this 57% figure. Deque (a major commercial accessibility vendor) maintains it and gives it away.
3. https://github.com/mdn/mdn-http-observatory — [RENDERED 2026-09-03]. Mozilla/MDN HTTP Observatory, MPL-2.0. Free public JSON API at https://observatory-api.mdn.mozilla.net/ (`/api/v2/scan`), rate limit one scan per host per cooldown (default 60s), self-hostable.
   → Meaning: security-headers auditing is free, API-accessible, from Mozilla. Zero room for a paid standalone.
4. GitHub repo search "apify actor lighthouse audit" — [RENDERED 2026-09-03], 4 public repos, all created 2025-12 to 2026-07, all 0 stars:
   - https://github.com/VastHornet/lighthouse-audit
   - https://github.com/VastHornet/lighthouse-auditor
   - https://github.com/NewNautilus/google-lighthouse-audit
   - https://github.com/gameboyt1710/lighthouse-checker-actor
   → Meaning: the Apify "Lighthouse actor" idea is already occupied by several recent, unpopular entrants. Low differentiation, and evidently no one is winning big.

## Search-snippet evidence (weaker — URLs listed for a human/unblocked agent to open)
5. White-label SEO audit/report tooling pricing [SNIPPET 2026-09-03]:
   - Entry white-label audit tools ~$30–60/mo; agency platforms with client portal ~$90–300/mo.
   - Named: SEMrush $270/mo, SE Ranking $119/mo, AgencyAnalytics $20/mo (Agency white-label plan $179/mo annually, 10 clients, +$20/mo per extra client), DashThis $42/mo, Morningscore $69/mo, BrightLocal from $29/mo annually, Nightwatch from $32/mo annually.
   - Sources to open: https://morningscore.io/which-seo-tools-allows-to-send-white-label-reports-to-clients-pricing-overview/ , https://mapranking.com/white-label-seo-audit-tools-reports-2026-comparison/ , https://rankyak.com/blog/white-label-seo-audit
6. SEOptimer (the closest analogue to "audit report as a product") [SNIPPET 2026-09-03]: DIY SEO $29/mo, White Label $39/mo, White Label + Embedding $59/mo. The $59 tier is an embeddable audit form with lead capture, sold explicitly as top-of-funnel lead-gen for agencies.
   - URL to open to confirm: https://www.seoptimer.com/pricing/
7. Core Web Vitals monitoring pricing [SNIPPET 2026-09-03]: DebugBear cheapest paid plan cited at $79/mo (other aggregators say $39 or $49 — inconsistent across sources, so treat as ~$40–80 entry), RUM gated around ~$149/mo Pro. Calibre from $75/mo (RUM capped 5,000 sessions on Starter). Treo API access + competitor comparison at $75/mo "Vital".
   - URLs to open: https://www.debugbear.com/pricing (aggregator disagreement means the vendor page is the only authority)
8. Israeli web accessibility law [SNIPPET 2026-09-03]: Israeli standard IS 5568 ("תקן ישראלי 5568") is based on WCAG 2.0/2.1 level AA, which is the mandatory level in Israel. Regulations also require publishing an accessibility statement (הצהרת נגישות) naming what was made accessible, exemptions, and a contact. Snippet states the obligation attaches to a site providing a service, or information about a service, where turnover exceeds 100,000 ILS/year averaged over the last three years.
   - URLs to open (Israeli domains are egress-blocked from this container — a human must open them): https://www.isoc.org.il/freedom-of-internet/accessibility/all-about-accessibility , https://tabnav.com/he/info-center/accessibility-standard-5568-israel-law , https://sgo.co.il/website-accessibility/
   - NOT ESTABLISHED: whether a certified accessibility expert (מורשה נגישות שירות) sign-off is legally required for a website specifically, and the exact current exemption thresholds. Do not build marketing copy on the 100,000 ILS figure until the regulation text itself is read.
9. Accessibility widget/audit pricing [SNIPPET 2026-09-03]: EqualWeb widget from $39/mo unlimited pageviews (WCAG 2.2 AA / ADA / Section 508), 7-day trial, 2 months free annual. UserWay Small $49/mo, Medium $149/mo, Large custom; G2 data cited at $490–$1,490 (annual Widget Pro). A "Starter Website Audit" from UserWay cited at $4,900.
   - URLs to open: https://www.equalweb.com/platform/accessibility_widget/pricing.html , https://www.capterra.com/p/218549/UserWay/pricing/ , https://www.g2.com/products/userway/pricing
   - Note: EqualWeb and UserWay are both Israeli-founded and dominate exactly the Israeli accessibility niche. Any Hebrew accessibility-audit product is entering their home ground.
10. Shopify SEO/audit apps [SNIPPET 2026-09-03]: Avada SEO Suite ~6,300 reviews at 4.9; Booster SEO 5,235 reviews at 4.9; SearchPie has a free plan, Pro $14.99/mo; Booster Pro $39/mo; Avada Pro $34.95/mo; Plug In SEO $29.99–79.99/mo, 2,500+ reviews.
    - URL to open: https://apps.shopify.com/categories/store-design-site-optimization-seo/all
11. Shopify Partner payouts [SNIPPET 2026-09-03]: payout methods are PayPal or a real bank account (virtual accounts like Payoneer are NOT supported); payouts issued in USD with optional local-currency conversion via Hyperwallet at +0.50%. Shopify **Payments** does not operate in Israel — that is about merchants accepting money, not partner payouts, and the search did not establish whether Israel is a supported Partner-payout country.
    - URL to open to close this: https://help.shopify.com/en/partners/manage-account/manage-payouts-invoices/payout-method
    - Verdict: Shopify app channel payability to Israel = **UNKNOWN**, and it is a hard gate.
12. Fiverr per-report pricing [SNIPPET 2026-09-03, gig pages listed but not rendered]: "professional SEO audit report within 24 hours" $20; "complete SEO audit report" $20; "SEO audit report using AI tool" $10; "SEO audit + competitor analysis with detailed explanations" $80.
    - URLs: https://www.fiverr.com/arun22297/seo-audit-using-ai-tool , https://www.fiverr.com/sachinmaster/professional-seo-report , https://www.fiverr.com/jacob21/audit-your-website-and-give-you-a-full-seo-analysis-report
    - This is the true market clearing price for a one-off automated audit report: $10–$20. That number is the single most important fact in this criterion.

## The structural finding
The audit engines (Lighthouse, axe-core, MDN Observatory, PageSpeed Insights API) are free, open source, and maintained by Google, Deque and Mozilla. The report is therefore worth ~$10–20 as a one-off (Fiverr clearing price), and the recurring money is in *account management around the report* — scheduling, client portals, white-labelling, lead capture — which is exactly the part that needs brand, sales and trust, i.e. the part our constitution says the owner will not do. Every profitable incumbent found (SEOptimer $39–59, AgencyAnalytics $179, DebugBear ~$79, EqualWeb $39, UserWay $49) sells the wrapper, not the audit.

Consequence for the colony: automated audits are a **feature and a lead magnet**, not a standalone income line. The only shapes worth building are ones where a marketplace supplies the distribution we cannot supply ourselves (Apify pay-per-event, x402 API) or where the report is bundled into an existing shipped Hebrew product (il-biz-tools) as a Pro feature.

## ToS / constitution notes
- Selling an automated accessibility scan as "compliance" or "certification" would be deceiving the buyer: axe-core's own docs say ~57% automatic coverage. Any such product MUST state the coverage limit prominently. With that disclaimer: GREEN. Without it: RED.
- Scanning third-party sites the buyer does not own (e.g. bulk prospect lists for agency cold outreach) is fetching public pages, but shipping it as a cold-outreach lead engine borders on spam enablement → AMBER, do not build.
- Fiverr-style delivery needs buyer messaging and revisions; "owner does nothing" means an agent answers buyers. Marketplace terms on automated/AI account operation were not verified → AMBER.

## Dead ends (report so the colony does not re-search)
- Standalone paid security-headers audit: killed by MDN HTTP Observatory (free public API, rendered evidence) and securityheaders.com. Ceiling ≈ 0.
- Standalone Core Web Vitals monitoring SaaS: DebugBear/Calibre/Treo occupy $75–79/mo with brand and RUM infrastructure; the free PageSpeed Insights API and Lighthouse CI cover the low end. No-brand entrant ceiling ≈ 0.
- Generic "SEO audit PDF" SaaS: the SEOptimer/AgencyAnalytics/SE Ranking layer is mature and cheap; competing on price against a $29/mo incumbent with thousands of agency users is not a 40-hour win.
- Shopify app channel: blocked on an unverified payability gate plus incumbents with 5,000+ reviews.

## What I could not establish (limits of this scout)
- Actual DebugBear entry price (three aggregators disagree; vendor page not rendered).
- Whether Israeli law requires a human מורשה נגישות sign-off for websites, and the current exemption threshold.
- Whether Shopify Partner payouts reach Israel.
- Real sales volume for any of the above. No revenue figure in this document is mine; where none is quoted, none exists here.
