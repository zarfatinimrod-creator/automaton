# Scout notes — content-seo / hebrew-seo

**Criterion:** Hebrew SEO opportunity — keyword volumes for Israeli business and tax queries, the
incumbents (Kol Zchut, Green Invoice magazine, accountants' blogs), and where a small site can
actually win.
**Scout:** WORKER-SCOUT "hebrew-seo", group `content-seo`. Date: 2026-09-06.
**Search budget spent: 8 / 8 (the cap). Stopped.**
**WebFetch: 4 attempts. 2 rendered (github.com), 2 EGRESS_BLOCKED.**

## Evidence grades used
- **rendered** — I fetched the page (or a GitHub code/file match) and read the text myself.
- **code** — a first-hand code/README match returned by GitHub `search_code`. Strong.
- **snippet** — a WebSearch result summary quoting a page I could NOT open. Weaker; URL named.
- Nothing here rests on memory.

## Blocked this run (do not retry)
`resources.clicks.so`, `www.ezcount.co.il`. By inference from nine sibling scouts, every Israeli
vendor/gov domain (`greeninvoice.co.il`, `icount.co.il`, `kolzchut.org.il`, `yeshinvoice.co.il`,
`payplus.co.il`, `gov.il`) is blocked. GitHub and raw.githubusercontent render fine.

---

## Evidence ledger

| # | Claim | Kind | URL | Date |
|---|---|---|---|---|
| E1 | **Kol Zchut content is licensed CC BY-NC-SA 2.5 IL — NonCommercial.** A third-party project credits: *"This project uses content from Kol Zchut, licensed under CC BY-NC-SA 2.5 IL"* | **code** (rendered README) | https://github.com/Public-Housing-Forum/AWS_CI-CD/blob/main/Parsing_src_files/README.md | 2026-09-06 |
| E2 | Independent confirmation: the NNLP-IL / Webiks Kol-Zchut paragraph corpus states *"This data is published under Creative Commons Attribution-NonCommercial-ShareAlike 2.5 license"* | **code** | https://github.com/NNLP-IL/Webiks-Hebrew-RAGbot-KolZchut-Paragraph-Corpus/blob/main/README.md | 2026-09-06 |
| E2b | Third confirmation: a legal-info page in another Kol-Zchut-derived project links `creativecommons.org/licenses/by-nc-sa/2.5/il/legalcode.he` next to a link to כל זכות | **code** | https://github.com/Shnior213/right-access/blob/main/Legal%20information/info.html | 2026-09-06 |
| E3 | Kol Zchut runs a **public, unauthenticated MediaWiki API**: `https://www.kolzchut.org.il/w/api.php` (also `/w/he/`, `/w/ar/`, `/w/en/`, `/w/ru/`). Multiple third-party clients hard-code it | **code** (4 independent repos) | https://github.com/skills-il/mcps `kolzchut-mcp/src/client.ts` ; https://github.com/drorsnir/mediawiki-bots-wordcounter ; https://github.com/tzedek-app/tzedek `parser/formatter.py` ; https://github.com/mofeed28/israeli-law-llm `scraper/config.py` | 2026-09-06 |
| E4 | The Kol Zchut org is a real MediaWiki shop — 88 repos, GPL-2.0/3.0 extensions, `opensource@kolzchut.org.il`. No public data dump or content-licence repo | rendered | https://github.com/kolzchut | 2026-09-06 |
| E5 | kolzchut.org.il traffic: **2.3M visits Feb-2024, 2.4M Sep-2024, ~1.7M more recently; 79.57% of desktop visits from organic search**; Israel is the top country; audience 58.9% male, largest cohort 25–34 | **snippet** (Similarweb page not rendered) | https://www.similarweb.com/website/kolzchut.org.il/ ; https://ahrefs.com/websites/kolzchut.org.il/competitors | 2026-09-06 |
| E6 | The Hebrew SERP for `עוסק פטור` / `פתיחת עוסק פטור` is owned by **vendor content-marketing and accountancy-firm blogs**: greeninvoice.co.il/magazine, kolzchut.org.il, icount.co.il/blog, ucan2.co.il, cpa-ea.co.il, zair.co.il, tax-advisor.co.il | **snippet** (the result set of my own search) | search: `כמות חיפושים חודשית ... "מחשבון מס הכנסה" "פתיחת עוסק פטור"` | 2026-09-06 |
| E7 | Same SERP shape for `חשבונית ירוקה` comparison queries: lp.greeninvoice.co.il, icount.co.il, avivmalka.com, ctrlplus.biz, poptin.co.il/blog, alphanetx.co.il, financon.co.il, hagshama.biz, mazkirshet.co.il — i.e. **a dense layer of Israeli affiliate/agency blogs already occupying the money terms** | **snippet** | searches on `חשבונית ירוקה תוכנית שותפים` and `יש חשבונית / ezcount / payplus` | 2026-09-06 |
| E8 | Hebrew-language market size: **combined monthly search volume for Hebrew keywords ≈ 149,241,000, average CPC $1.24**; ~78% of Israeli searches are in Hebrew; Google >95% of Israeli search share; >80% of searches on smartphones. Most competitive terms are navigational (`yout`, `n12`); highest CPCs are `tiktok` $9.88, `גלים פרו` $9.12 | **snippet only — clicks.so page is EGRESS_BLOCKED** | https://resources.clicks.so/top-google-searches/israel/hebrew (blocked) ; https://gs.statcounter.com/search-engine-market-share/all/israel ; https://www.argosmultilingual.com/blog/hebrew-seo | 2026-09-06 |
| E9 | **No per-keyword Hebrew volume could be obtained.** Two searches aimed at it returned zero volume figures; the search engine itself advised using Keyword Planner / Trends | snippet (negative result) | — | 2026-09-06 |
| E10 | **EZcount (איזיקאונט, a Hyp company) affiliate: 70 ₪ per registered user, before VAT, flat one-off** — not recurring, not percentage | **snippet — affiliate page EGRESS_BLOCKED** | https://www.ezcount.co.il/affiliates (blocked) | 2026-09-06 |
| E11 | Other live Israeli affiliate programs in this niche, all with **undisclosed / negotiated** rates: יש חשבונית (fixed discount per new customer, negotiated at volume), PayPlus (fixed monthly commission on customers' monthly payments, varies by business type and volume), AccountIT, iCount ("הטבת שותפים" in its sitemap) | snippet | https://yeshinvoice.co.il/affiliates ; https://www.payplus.co.il/affiliates ; https://www.account-it.co.il/תוכנית-השותפים-של-מערכת-accountit-לניהול-עסק/ ; https://www.icount.co.il/sitemap/ | 2026-09-06 |
| E12 | **Israeli tax-refund lead market: 20–40 ₪ per lead typical, 20–100 ₪ for quality/segmented leads.** Buyers named: accounting firms, tax consultants (יועצי מס), rights-realisation companies (מיצוי זכויות), non-profits. Sellers are lead vendors (leady.co.il, nuevo-media.co.il, start-point.co.il) | snippet | https://start-point.co.il/tax-refund-salaried-leads-guide/ ; https://leady.co.il/לידים-להחזרי-מס/ ; https://nuevo-media.co.il/לידים-להחזרי-מס/ | 2026-09-06 |
| E13 | AI Overviews (global, not Hebrew-specific): **48% of Google queries as of March 2026**, up from 34.5% Dec-2025 and 31% Feb-2025; organic CTR falls **34–61%** when an AIO appears; **60–83% of AIO searches end without a click**; **~99% of AIO citations come from the organic top 10** | snippet | https://seoprofy.com/blog/google-ai-overviews/ ; https://thestacc.com/blog/google-ai-overview-statistics/ ; https://slatehq.com/blog/google-ai-overviews-statistics | 2026-09-06 |
| E14 | Israel-specific GEO/AI-search research exists and quantifies an Israeli digital-ad market of **$1.58B (2025) → $1.91B (2028)** with a claimed NIS 750M–2.4B reallocation opportunity over 24–36 months. **I could not open it; treat the numbers as a vendor's own research** | snippet | https://www.5wpr.com/research/ai-israeli-brand/ | 2026-09-06 |

### Reused from sibling scouts (cost no budget)
- `content-seo--ad-networks.md`, `content-seo--converter-utility-sites.md` (2026-09-06): **Ezoic raised its
  floor to 250,000 monthly users in Feb 2026; Mediavine 50,000 sessions; Raptive 25,000 pageviews.**
  New sites commonly earn $1–5 RPM; Americas RPM 2–3× EMEA. **AdSense→Israel is YES at medium
  confidence, never confirmed on a rendered page** (URL to close: https://support.google.com/adsense/answer/9905).
- `distribution--seo-2026.md` (2026-09-04): new domain → meaningful organic in **4–8 months**; only
  **1.74%** of new pages reach top 10 within a year; AIO covers transactional queries only **13–19%**
  versus **36%** informational — i.e. `מחשבון X` survives, `מה זה X` does not.
- `docs/REJECTED.md`: ad-monetised content portfolios already **rejected**; and the Israeli state
  publishes free calculators, so charging for an answer the state gives free is a constitution breach.

---

## What the evidence actually supports

**1. The obvious Hebrew-SEO play is illegal, and this is the single most useful thing in this file.**
The tempting build — scrape Kol Zchut's 1.7–2.4M-visit rights corpus, restructure it, monetise with
ads or affiliate links — is **barred by the licence**. CC BY-NC-SA 2.5 IL is NonCommercial: three
independent third-party projects state it in their own repos (E1, E2, E2b). Building a revenue site
on that corpus is RED under both the licence and our constitution. The public API (E3) is real and
usable — for a *free* tool. It is not a revenue asset.

**2. Kol Zchut is not a beatable incumbent on informational terms.** ~1.7–2.4M monthly visits with
79.6% organic (E5), non-profit, no ads, wiki-scale, and Google evidently trusts it. A new domain
takes 4–8 months to see meaningful organic traffic and 1.74% of new pages reach the top 10 in a year.

**3. The commercial Hebrew SERP is a vendor land-grab, not an open market.** Green Invoice's
magazine and iCount's blog (E6, E7) exist to acquire customers, not to earn ad revenue. Their content
budget is a CAC line; ours would have to be a P&L. We cannot outspend a funded vendor on the terms
they need. Their existence is also the demand proof: they would not run magazines if the queries had
no commercial value.

**4. Money model, ranked honestly.**
- *Ads:* structurally dead for a new Hebrew site. Hebrew avg CPC $1.24 (E8), EMEA RPM ~⅓ of US,
  and the ad networks' 2026 floors (25k–250k) sit far above what a Hebrew niche site reaches.
- *Israeli SaaS affiliate:* real, named, small. **EZcount pays 70 ₪ flat per signup** (E10). 20,000
  ILS/month = **~286 paid signups per month** from a brand-new Hebrew site. That is not reachable in
  year one. PayPlus's recurring-commission model (E11) is structurally better but the rate is
  negotiated — and negotiating is a human act the owner will not do.
- *Tax-refund lead-gen:* the highest price per action found (20–100 ₪, E12) and a nameable buyer —
  but selling identified personal contact data in Israel is regulated (Privacy Protection Law and its
  Amendment 13 regime), the buyers contract by phone, and the sector's reputation is poor. **AMBER;
  do not build.**
- *Content as a funnel into our own product:* the only model where the margin is ours. Hebrew content
  pointing at `products/il-biz-tools` (a free calculator with a Pro tier on Paddle) monetises through
  a rail we already control and an Israeli payability question already answered.

**5. Where a small site can actually win.** Not informational head terms. Transactional/tool intent:
AIO covers those 13–19% of the time versus 36% informational, and the answer is a computation rather
than a paragraph, so the click still has to happen. Concretely: `מחשבון X`, `טופס X`, `כמה X 2026`
attached to a working calculator. That is what il-biz-tools already is; the finding is that **Hebrew
SEO is a distribution channel for it, not a business of its own.**

---

## Dead ends (report them so nobody re-searches)
1. **Per-keyword Hebrew search volumes are unobtainable from this container.** Two searches produced
   zero numbers (E9); every keyword tool is behind a login or a blocked domain. Google Keyword
   Planner needs a Google Ads account — an owner action. **Do not spend more searches on this.**
   URL to close it from an unblocked machine: https://resources.clicks.so/top-google-searches/israel/hebrew
2. **Israeli affiliate commission rates are not published.** Only EZcount's 70 ₪ surfaced, and only in
   a snippet. yeshinvoice / PayPlus / iCount / AccountIT all say "contact us". Pages to open:
   https://www.ezcount.co.il/affiliates , https://yeshinvoice.co.il/affiliates , https://www.payplus.co.il/affiliates
3. **No Hebrew/Israel-specific AI-Overview coverage rate exists in anything I could reach.** All AIO
   statistics found are global English datasets (E13). The one Israel-specific study is a PR firm's
   own research (E14) and I could not open it. This is a real gap in the group's thesis.
4. **Green Invoice magazine's scale (page count, traffic) could not be measured** — greeninvoice.co.il
   is blocked and no third party reports it.
