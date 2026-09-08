# Scout notes — productized-services / monitoring-alerting

Sweep date: 2026-09-03. Scout: Opus 5 (WORKER-SCOUT "monitoring-alerting").
Criterion: **Monitoring and alerting as a product** — uptime, price changes, regulatory
changes, competitor changes, domain and certificate expiry. Pricing and buyers.

Search budget used: **8 of 8 allowed WebSearch calls.** All other evidence came from
GitHub (repo + code search), which is free of that budget and renders as primary source.

## Evidence grading used below
- **[RENDERED]** — I actually got the content (GitHub API repo/code search results).
- **[SNIPPET]** — a search-result summary quoting a page I could NOT open (egress blocked).
  Weaker. Where it matters I list the exact URL a human must open.
- Nothing here rests on memory. Where I had neither, I wrote "unknown".

---

## 1. Generic uptime monitoring — DEAD END for a no-brand entrant

**[SNIPPET]** UptimeRobot 2026: free tier **50 monitors** at 5-minute intervals
(non-commercial use), Solo $7–15/mo, Team $29–38/mo, Enterprise $54–289/mo.
Better Stack free tier 10 monitors / 3-min, Team $29–34/mo annual.
- https://www.stackscored.com/pricing/uptime-monitoring/uptimerobot/
- https://www.stackscored.com/pricing/uptime-monitoring/better-stack/
- https://betterstack.com/community/comparisons/better-stack-vs-uptimerobot/
- https://uptimerobot.com/knowledge-hub/comparisons-and-alternatives/top-better-stack-alternatives/
Snippet wording worth keeping: "While UptimeRobot's free tier was unmatched in 2018, in
2026 multiple competitors now offer comparable or better free plans with no commercial
restrictions. UptimeRobot, StatusCake, Instatus, Grafana Cloud, and OneUptime all offer
free plans, with self-hosted options like Uptime Kuma and Prometheus also available."

**[RENDERED]** GitHub repo search "uptime monitoring self-hosted status page" — the
free/self-host layer is deep and actively maintained:
- https://github.com/TwiN/gatus — 11,974 stars, updated 2026-09-03
- https://github.com/kuvasz-uptime/kuvasz — 603 stars, includes SSL monitoring
- https://github.com/uptimepage/uptimepage — AGPL hosted+self-host, 8 check types
  including "cron heartbeats, DNS, TLS and domain expiry"
- https://github.com/SelmiAbderrahim/pulsy.org — 74 stars, created 2026-07-11
  (i.e. brand-new free entrants keep arriving)

Read: the price of the *feature* is zero and falling. A new brandless seller has no wedge.

## 2. Website change monitoring (generic) — commoditised by one dominant free tool

**[RENDERED]** https://github.com/dgtlmoon/changedetection.io — **33,538 stars, 1,996
forks**, updated 2026-09-03. Its own description sells its SaaS plan and explicitly claims
"price drops, restock alerts, and website defacement monitoring". So the category leader is
free, self-hostable, AND already monetised. Everything else in that GitHub search was a
0-star clone.

**[SNIPPET]** Visualping pricing 2026: free = 5 pages / 150 checks/mo / 60-min interval;
Personal from **$10/mo**; Business **$100/mo**; up to **$250/mo** for ~50,000 checks / 1,500 pages.
- https://visualping.io/blog/visualping-pricing-explained
- https://www.g2.com/products/visualping/pricing
- https://www.capterra.com/p/211816/Visualping/
**[SNIPPET]** PageCrawl: free 6 monitors, **$8/mo** 100 monitors, **$30/mo** 500 monitors.
- https://pagecrawl.io/blog/regulatory-change-management-software

## 3. Regulatory change monitoring — real money, but the money sits behind human sales

**[SNIPPET]** "Prices range from free tiers to **$200–500/month** for professional plans to
**$1,000+/month** for enterprise"; SMB-focused regulatory monitoring "typically
$200–$2,000/month"; GRC platforms $20,000–$150,000+/yr; Vanta/Drata $10–15k/yr.
- https://www.v-comply.com/blog/grc-software-pricing/
- https://www.regpulse.io/blog/regulatory-monitoring-software
- https://us.fitgap.com/search/regulatory-change-management-software/small-business
The $200–2,000/mo tier is bought by a compliance officer after a demo. That is a human
in the loop on the *sell* side, which MISSION.md forbids. The self-serve end of the same
category is exactly PageCrawl/Visualping at $8–$30/mo (see §2) — thin margins, crowded.

## 4. Competitor / price-change monitoring — best documented willingness to pay

**[SNIPPET]** Prisync **$99–$599/mo**; Price2Spy from **$57.95/mo** ($157.95 with custom reports).
- https://prisync.com/alternative/price2spy/
- https://www.price2spy.com/price2spy-vs-prisync-comparison.html
- https://www.thepricegeek.com/competitor-monitoring/price2spy-review/

**[SNIPPET]** Shopify App Store, self-serve distribution, no salesperson:
- Snoopie: Price Tracking — 4.6★, **68 reviews**, free plan — https://apps.shopify.com/snoopie
- CompeteTracker — free (3 competitors) / **$19.99** (10) / **$49.99** (25) — https://apps.shopify.com/competetracker
- Competitor Price Tracker Pro — from **$1.99/mo** — https://apps.shopify.com/competitor-price-tracker-pro
- Competitor Price Tracker — from **$6.99/mo**, has a reviews page — https://apps.shopify.com/price-comparison-affiliate/reviews
- Comparison writeups: https://beaconmon.com/blog/shopify-competitor-price-tracking-apps-compared
  https://www.delightchat.io/best-shopify-apps/competitor-price-tracking

**ToS problem.** Making this work means scraping arbitrary competitor retail sites on a
schedule. That is the thing most retailer terms forbid and it is exactly the "AMBER"
bucket. I do **not** recommend building general competitor-price scraping. The exception
is data a law *requires* to be published — see §5.

**Open question I could not close:** whether Shopify Partner payouts reach an Israeli bank.
Not verified, not assumed. URL to open: https://help.shopify.com/en/partners/getting-paid

## 5. Israeli grocery price data — the one place where price monitoring is GREEN

**[RENDERED, GitHub code search]** Israel's 2015 price-transparency regime forces chains to
publish machine-readable price and promo XML publicly. Rendered clauses from third-party
repos:
- https://github.com/LiorVainer/data-israel — `.agents/skills/israeli-grocery-price-intelligence/SKILL.md`:
  "Under the 2015 Price Transparency Law (חוק שקיפות מחירים), Israeli supermarket chains
  with 3+ stores must publish product prices as XML files. Data published at:
  prices.shufersal.co.il, and similar portals per chain".
- https://github.com/Danielrouach/SmartCart — README (Hebrew): "על פי חוק המזון (2015),
  כל רשת מזון בישראל מחויבת לפרסם מחירים בזמן אמת".
- https://github.com/OpenIsraeliSupermarkets/israeli-supermarket-scarpers — maintained
  scraper library; `scripts/dump_gov_il_links.py` enumerates every chain endpoint
  (`https://prices.shufersal.co.il/`, `ftp://url.retail.publishedprices.co.il/` with
  per-chain FTP users such as `SuperCofixApp`, `doralon`).
- https://github.com/fluhus/prices, https://github.com/ganoti/prices,
  https://github.com/TheGiftsProject/FastPrice — older Go/Java/Ruby aggregators, same sources.
- https://github.com/idoschwartz11/SmartCart — README documents the discovery endpoint
  `https://prices.shufersal.co.il/FileObject/UpdateCategory`.

**[SNIPPET]** Regulation text and the government's own index of retailer price URLs:
- https://www.gov.il/he/pages/cpfta_prices_regulations ("שקיפות מחירים — קישורים לאתרי הקמעונאים")
- https://www.nevo.co.il/law_html/law00/135376.htm (תקנות קידום התחרות בענף המזון (שקיפות מחירים), תשע"ה-2014)
- https://www.consumers.org.il/item/transparency_price
Snippet claims chains must update the site "no later than one hour" after a register price
change, pharmacy chains report hourly too, and the Authority "receives price files from all
large retail chains every hour". Both gov.il and nevo.co.il are egress-blocked here; a human
must open them to confirm the update-frequency clause verbatim.

**Competition [SNIPPET]:** consumer-side comparison is already free and established —
https://www.pricez.co.il/ ("השירות המוביל בישראל להשוואת מחירים"), plus chp.co.il (not
verified this run). My Hebrew search for a supplier-side *price-monitoring/BI vendor*
returned nothing specific — the search engine surfaced Yellow-Pages and cyber-intel pages
instead. So: consumer comparison = saturated and free; supplier/brand-side alerting =
no vendor found, which is weak evidence of a gap, not proof of one.

## 6. Domain / TLS certificate expiry — real but tiny

**[SNIPPET]** TrackSSL from **$0.72 per domain**, premium **$17–$136/yr**, free up to 2 domains;
CertsMonitor **$29/yr for 30 domains**; a starter tier at $204/yr for 20 domains and
$864/yr for 200; updown.io usage-based (~€1.17/mo for two sites at 1-min checks).
- https://trackssl.com/ , https://sslreminder.pro/ , https://domain-monitor.io/products/ssl-monitoring/
- https://betterstack.com/community/comparisons/ssl-certificate-monitoring-tools/
- https://geekflare.com/cybersecurity/monitor-ssl-certificate-expiry/
**[RENDERED]** and it ships free inside self-hosted tools (kuvasz "ssl-monitor";
uptimepage "TLS and domain expiry"). ARPU is a rounding error; this is a lead magnet,
not a business.

## 7. Payability to Israel
Not re-researched here (no budget left) — leaned on sibling scouts' rendered evidence in
this same directory:
- `storefronts--gumroad.md`: **YES**, rendered from Gumroad's own open-source repo
  (`IsraelBankAccount` payout class, `Israel | ILS`).
- `agent-markets--apify.md`: payout to Israel fine via PayPal/Wise at $20 threshold;
  one-time government-ID upload is the only human step.
- `storefronts--paddle.md` and `storefronts--lemonsqueezy-payhip.md`: **UNKNOWN**,
  supported-country pages were egress-blocked.
Shopify Partner payouts to Israel: **UNKNOWN**, unverified.

## 8. Owner blockers seen (do not assume any are done)
- One-time government-ID / KYC upload on whichever payout rail is used (Apify, Gumroad).
- Israeli tax status for receipts (covered by `payment-rails--israeli-tax-registration.md`,
  not re-derived here).
- Nothing in this criterion needs the owner to talk to a buyer, appear on camera, or
  operate anything manually — *provided* we stay on self-serve/machine rails and avoid
  the $200–2,000/mo compliance tier, which is sales-led.

## 9. What a human or unblocked agent must open to close my gaps
1. https://www.gov.il/he/pages/cpfta_prices_regulations — official retailer price-URL index.
2. https://www.nevo.co.il/law_html/law00/135376.htm — the transparency regulations' exact duties.
3. https://help.shopify.com/en/partners/getting-paid — Shopify payouts to Israel.
4. https://apps.shopify.com/snoopie — confirm the 68-review / 4.6★ figure on the store page.
5. https://visualping.io/blog/visualping-pricing-explained — confirm the $10/$100/$250 tiers.
6. Any Israeli source on whether Reshumot (רשומות) / gov.il regulatory updates expose a
   machine-readable feed — I found none and could not fetch gov.il.
