# Scout notes — content-seo / converter-utility-sites

**Criterion:** Converter and utility sites: monetization, ad rates, competition from incumbents, and
whether a new entrant can still rank.
**Scout:** WORKER-SCOUT "converter-utility-sites", group `content-seo`. Date: 2026-09-06.
**Search budget spent: 8 / 8 (the cap).** Three WebFetch attempts on primary sources were
EGRESS_BLOCKED (`help.mediavine.com`, `help.raptive.com`, `support.google.com`). Two GitHub fetches
rendered. Everything not marked "rendered" is a **search snippet** and is weaker evidence.

## Evidence ledger

| # | Claim | Evidence kind | URL | Date seen |
|---|---|---|---|---|
| E1 | Mediavine minimum 50,000 sessions/month; Raptive dropped its minimum from 100,000 to 25,000 pageviews in Oct 2025; **Ezoic raised its minimum to 250,000 monthly users in Feb 2026**, abandoning small publishers | snippet of ad-industry blogs (vendor-adjacent, no primary page rendered) | https://arbitragetimes.com/ezoic-vs-mediavine-in-2026-which-platform-wins-for-mid-tier-publishers/ , https://newormedia.com/blog/mediavine-vs-raptive-vs-newor-media/ , https://earnifyhub.com/blog/blogging/mediavine-vs-raptive-vs-ezoic-rpm | 2026-09-06 |
| E2 | Raptive RPM 15–30% above Mediavine in finance/tech niches | snippet | https://newormedia.com/blog/best-ad-networks-for-publishers-2026/ | 2026-09-06 |
| E3 | 2026 average AdSense RPM $2–$10 general content, $20+ for high-value niches; **new sites commonly $1–$5 RPM** | snippet of ad-ops blogs | https://www.monetizemore.com/blog/website-ad-revenue/ , https://shaynly.com/adsense-rpm-calculator/ | 2026-09-06 |
| E4 | RPM depends heavily on geography; Americas typically 2–3x EMEA/APAC | snippet | https://www.monetizemore.com/blog/website-ad-revenue/ | 2026-09-06 |
| E5 | iLovePDF: ~264M monthly visitors, 71% organic (~188M visits/mo); claimed $1.4M revenue with 16 employees; 7.5M monthly brand searches; top market India 48.2M (22.2%) | snippet of a low-quality aggregator (techlist.ai) restating Semrush — **treat the revenue figure as unverified** | https://techlist.ai/ilovepdf.com , https://www.semrush.com/website/ilovepdf.com/overview/ (not rendered) | 2026-09-06 |
| E6 | Stirling-PDF: 91.4k stars, 8.3k forks, "50+ PDF tools", open-core, self-hostable desktop/browser/server, paid Server/Enterprise plan | **rendered** (GitHub) | https://github.com/Stirling-Tools/Stirling-PDF , https://raw.githubusercontent.com/Stirling-Tools/Stirling-PDF/main/README.md | 2026-09-06 |
| E7 | New site in a saturated niche with DA 0 fights uphill; KD<30 accessible, KD>50 serious, KD 70+ needs authority/backlinks; advice is to avoid head terms and take long-tail | snippet of SEO agency blogs (generic, no data) | https://www.link-assistant.com/rankdots/blog/rank-in-a-competitive-niche.html , https://seoprofy.com/blog/low-competition-keywords/ | 2026-09-06 |
| E8 | Freemium free-to-paid: 2–5% typical, 3–5% "good", 8–12% "great"; one Jan-2026 study of 200 B2B software products found a median of 8% and one quarter under 2.5% | snippet | https://www.artisangrowthstrategies.com/blog/freemium-conversion-rate-benchmarks , https://www.growthunhinged.com/p/free-to-paid-conversion-report , https://chartmogul.com/reports/saas-conversion-report/ | 2026-09-06 |
| E9 | Mediavine pays via Tipalti (licensed money transmitter in 196 countries, 120 currencies); non-US creators can take eCheck/local bank transfer, PayPal, check or wire. **Israel never named.** | snippet only — every Mediavine/Raptive help page is EGRESS_BLOCKED | https://help.mediavine.com/mediavine-payment-faq , https://help.raptive.com/hc/en-us/articles/360013465192-Payment-Methods | 2026-09-06 |
| E10 | AdSense SEPA payment method covers European countries; **Israel is not in SEPA**. No ILS/Israel payment-method evidence found either way. Israel is listed by third parties among higher-CPM countries. | snippet | https://support.google.com/adsense/answer/2975858 (blocked) , https://partnerkin.com/en/blog/articles/adsense_rpm_rates_by_country | 2026-09-06 |
| E11 | Hebrew query for Israeli converter/utility sites returned no converter sites at all — only AI-tool listicles, a Google Sites page, a web-design studio and a 1990s-style link index | snippet (the search itself) | search: "אתר כלים עברית ממיר קבצים מחשבון אונליין תחרות גוגל ישראל 2026" | 2026-09-06 |
| E12 (inherited) | Tool/interactive pages resist AI-Overview zero-click; transactional queries carry AIO only 13–19% vs 36% informational; new domain needs 4–8 months for meaningful organic traffic; 1.74% of new pages reach top 10 within a year; scaled programmatic pages were hit by the March 2026 core update | prior scout's ledger, snippets | /home/user/automaton/research/colony-sweep/scouts/distribution--seo-2026.md | 2026-09-04 |
| E13 (in-repo) | Paddle: Israel is a supported seller country (medium confidence, snippet-only); `products/il-biz-tools` already sells a ₪79 one-time Pro via Paddle overlay | repo files | /home/user/automaton/research/colony-sweep/scouts/payment-rails--paddle-onboarding.md , /home/user/automaton/products/il-biz-tools/README.md | 2026-09-06 |

### Blocked hosts confirmed this run
`help.mediavine.com`, `help.raptive.com`, `support.google.com`. GitHub and raw.githubusercontent.com rendered.

## What the evidence supports

1. **The ad-supported converter site is not a business for us.** The ladder that used to take a new
   site from AdSense to a real RPM is gone at the bottom: Ezoic, the only no/low-minimum step, moved
   to 250,000 monthly users in Feb 2026 (E1); Mediavine wants 50k sessions, Raptive 25k pageviews.
   A new tool site's realistic year-one traffic (E12: hundreds/month at 4–8 months, low thousands at
   8–12) times a new-site RPM of $1–5 (E3) is single-digit dollars a month. AdSense-first is a
   ₪30–₪150/month line at best, and `docs/REJECTED.md` already kills the portfolio version of it.
2. **The generic converter category has a zero price floor and a brand-locked head.** iLovePDF alone
   takes ~264M visits/month with 7.5M monthly brand searches (E5), and Stirling-PDF gives away 50+
   of the same operations under an open-core licence with 91.4k stars (E6). A new entrant competes
   against a free self-hostable substitute below and a household brand above.
3. **Ranking is possible only off the head.** Nothing found says a new tool site can take "pdf to
   word". The consistent advice is long-tail, low-KD, specific intent (E7), which matches the prior
   scout's finding that the surviving query class is "give me the calculator/converter" (E12).
4. **So the monetisation that works is conversion, not impressions.** 2–5% free-to-paid is the
   benchmark (E8), and one converted user at ₪79 is worth more than 20,000 ad pageviews at a new
   site's RPM. This is exactly the shape already shipped in `products/il-biz-tools` (E13).
5. **Payability is the unclosed gate on every ad-based variant.** AdSense-to-Israel and
   Mediavine/Raptive-to-Israel could not be confirmed from any rendered page (E9, E10). Paddle-to-
   Israel is YES at medium confidence and is already in production here (E13).

## Dead ends
- **Ad networks as the monetisation of a new utility site** — thresholds unreachable, RPM too low,
  and payability to Israel unverified. Not a line.
- **Generic file converters (PDF/image/video/unit)** — incumbent + free-OSS squeeze, no defensible slice.
- **Hebrew converter/utility competitive data** — one search returned nothing usable (E11). Either the
  Hebrew niche is genuinely thin (which would be an opportunity) or the query was wrong; I cannot tell
  from one search and will not guess.

## What a human or unblocked agent must open to close the gaps
- `https://support.google.com/adsense/answer/1714397` — AdSense payment methods for Israel (the hard gate).
- `https://help.mediavine.com/mediavine-international-publishers` and
  `https://help.raptive.com/hc/en-us/articles/360013465192-Payment-Methods` — Israeli publisher eligibility.
- `https://www.semrush.com/website/ilovepdf.com/overview/` — the traffic numbers first-hand, instead of via techlist.ai.
- Google Search Console for `il-biz-tools` — our own click curve on tool queries, free and trustworthy.
