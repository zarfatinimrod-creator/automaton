# Scout notes — israel-bureaucracy / fees-and-benefits

**Criterion:** Municipal tax (ארנונה) discounts, customs and personal imports, government fees,
and benefit entitlements — calculators, eligibility checkers, and search demand.

**Date of research:** 2026-09-03
**Search budget used:** 13 WebSearch calls. WebFetch attempts: 4, of which 3 EGRESS_BLOCKED
(agentskills.co.il, data.gov.il, www.kolzchut.org.il) and 1 HTTP 404 (raw.githubusercontent.com
danielrosehill/Israel-Open-Data-Resources README on `main`).
**Evidence grade used throughout:** almost every claim below is a SEARCH SNIPPET, not a rendered
page — the egress proxy blocks every Israeli government and Israeli commercial domain I tried.
Treat every number as "reported by snippet, needs one human/unblocked fetch to close".

---

## 1. The single most important structural fact

The consumer side of this criterion is already served, for free, by the state and by a
Ministry-of-Justice-backed nonprofit:

| Free incumbent | URL (snippet-sourced, must be opened to confirm) |
|---|---|
| Official personal-import tax calculator (רשות המסים) | https://shaarolami-query.customs.mof.gov.il/CustomspilotWeb/PersonalImportTax |
| Official work-grant eligibility check (מס הכנסה שלילי) | https://www.misim.gov.il/gmmhszakaut/BdikatZakaut.aspx |
| National Insurance income-support simulator | https://www.btl.gov.il/Simulators/Pages/IncomeSupportCalc.aspx |
| National Insurance "rights at other bodies" | https://www.btl.gov.il/AllRights/Pages/mosdot.aspx |
| Kol-Zchut — the whole rights corpus, free | https://www.kolzchut.org.il/he/ |
| Arnona income tables per authority (e.g. Tel Aviv) | https://www.tel-aviv.gov.il/Residents/Arnona/Documents/טבלת%20הכנסות%20לשנת%202026.pdf |

Consequence for the colony: **charging an Israeli consumer to be told whether they qualify for
a benefit is competing with a free government tool for the same answer**, and skirts the
constitution's "charging for something already free". Any viable line here must sell either
(a) machine-readable *data* the state publishes only as HTML/PDF, or (b) *distribution/embedding*
to a business, not the answer itself to a citizen.

Kol-Zchut licence: a search snippet states the content is **CC BY-NC-SA 2.5 IL** — the NC clause
would make any commercial derivative a licence violation (RED). This is snippet-only evidence.
URL a human must open to close it:
https://www.kolzchut.org.il/he/כל-זכות:זכויות_יוצרים (blocked here).
Their GitHub org (github.com/kolzchut, 69 repos, checked via GitHub MCP on 2026-09-03) contains
only MediaWiki extensions and the SRM social-services platform (`srm-api`, `srm-frontend`) —
**no content dump, no rights API**. So there is no clean, licence-safe corpus to build on.

---

## 2. Sub-area: customs / personal imports (מכס, יבוא אישי)

Strongest sub-area in this criterion, because the rules are **volatile** and volatility kills
free static content.

Snippet-sourced facts (2026):
- De-minimis has flip-flopped: goods up to **$75** fully exempt; between **25 Feb 2026 and
  1 Jun 2026** the exemption was raised to **$130**; the Tax Authority then circulated a letter to
  customs agents extending the $75 order to 1 Jun 2026.
- $75–$500: **VAT only, 18%**. Above $500: VAT plus possible customs duty and purchase tax.
- Shipping/insurance excluded from the value test *if separately stated*, included if not.
- Israel uses a **10-digit** national classification (6-digit HS + 4 national digits).
- Mainstream press wrote confusion pieces about exactly this in 2026 (Calcalist, Mako, Ynet,
  Maariv) — a demand signal that the rule is hard to apply.

Evidence URLs (search results seen 2026-09-03, pages NOT rendered):
- https://www.kolzchut.org.il/he/זכותון_בנושא_יבוא_אישי_(חבילות_מחו"ל)
- https://shaarolami-query.customs.mof.gov.il/CustomspilotWeb/PersonalImportTax
- https://www.calcalist.co.il/shopping/article/s1hks1suzl ("הזמנתם מאמזון מעל 75 דולר? המדריך המלא לבלבול במכס")
- https://www.mako.co.il/finances-consumer/Article-9af02f71fe78e91027.htm
- https://www.maariv.co.il/economy/israel/article-1288490
- https://www.gov.il/en/service/customs-tariff
- https://www.shopify.com/il/blog/international-import-shipping (2026 tariff guide)
- https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties

Existing competition (all free or bundled, no observed paid API for Israel specifically):
- https://www.tlvflights.com/en/customs/ — claims **12,000+ tariff items** from the official
  customs book (snippet). Free.
- https://www.pinebill.app/tools/us-tariff-calculator/israel — "Israel Tariff Calculator 2026".
- https://en.56ok.com/hscode/israel.html — HS lookup for Israel.
- https://www.goodada.com/us/israel-customs-import-and-export-duty-calculator
- https://traddal.com/resources/calculate-duties-taxes-imports-israel
- https://agentskills.co.il/en/skills/tax-and-finance/israeli-customs-duty-calculator — an
  "Israeli Customs Duty Calculator" sold as an AI *skill* on an Israeli skills marketplace.
  **Blocked (EGRESS_BLOCKED); pricing unknown.** This is the closest thing to a direct competitor
  and the single most valuable page for someone unblocked to open.
- Generic landed-cost vendors: https://dutify.com/ , https://calcurates.com/features/international-shipping-shopify

Machine-readable source: Shaar Olami publishes **code tables** ("data ... available for disclosure
to the general public without need for user identification ... updated once every 24 hours") at
https://shaarolami-query.customs.mof.gov.il/CustomspilotWeb/he/UrlHash/SystemTables?hash=...
Snippet-only. Terms of use for that endpoint were NOT read → ToS **AMBER** until read.
Also relevant: the Tax Authority is paying software houses to integrate with Shaar Olami
(tender/notice https://mr.gov.il/ilgstorefront/he/p/554878) — i.e. the integration market is
real but is a government-procurement market, not self-serve.

---

## 3. Sub-area: arnona (ארנונה) discounts and tariffs

Snippet-sourced facts (2026):
- Interior Ministry published the 2026 income-test discount regulations: average monthly 2025
  income up to **₪3,513** → up to **90%** discount; the scale is now pegged to minimum wage and
  household size. (https://www.ice.co.il/consumerism/news/article/1110123)
- Nationwide automatic 2026 uplift of **1.626%**; **108 local authorities** filed requests for
  exceptional (above-index) increases for 2026, most approved.
  (https://www.globes.co.il/news/article.aspx?did=1001530173 ,
   https://www.themarker.com/allnews/2025-12-03/ty-article/0000019a-e2f5-dece-a9da-e7f7b1c50000 ,
   https://www.kan.org.il/content/kan-news/economic/908487/ ,
   https://www.nadlancenter.co.il/article/13556)
- Each authority publishes its own **צו ארנונה** (tax order) — per-authority PDFs, e.g.
  https://www.nzc.org.il/uploads/n/1750251251.6812.pdf ("צו מיסים ארנונה לשנת 2026").
- State Comptroller has an entire report on arnona regulation, imposition and discounts:
  https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/7650-3.aspx
- Kol-Zchut pages: הנחה בארנונה לבעלי הכנסה נמוכה, טבלאות הכנסות (URLs in §1).

**The gap:** there is no single machine-readable national table of arnona tariffs by authority,
zone, and property classification. I searched data.gov.il for it and could not fetch the CKAN API
(blocked); snippets show data.gov.il runs CKAN (https://data.gov.il/api/docs) and mention a
Beer-Sheva arnona dataset, i.e. **municipal, not national**. Apify already hosts Israeli
government-data actors by third parties (parseforge: Companies Registrar, Amutot; lentic_clockss:
Israel Data API) — proof that Israeli public-data actors are a live category on a platform that
pays us — but **no arnona actor was found**.
- https://apify.com/parseforge/israel-companies-registrar-scraper
- https://apify.com/lentic_clockss/israel-data-search/api
- https://github.com/danielrosehill/Israel-Open-Data-Resources (index of Israeli open data; README
  404 on `main`, needs the right branch/path)

**The buyer that already pays cash here** is the arnona-reduction industry: firms that audit a
business's arnona bill (wrong measurement, wrong classification) on a success fee.
- https://bills.co.il/ — "הפחתת ארנונה לעסקים"
- https://hgj.co.il/taxation/חיסכון-במיסי-ארנונה/ — accountancy firm's arnona-saving practice
- https://www.tel-aviv.gov.il/Residents/Arnona/Pages/Refunds.aspx — municipal refund process (30 days)
That industry is human consulting — the owner cannot run it. But it is a plausible *data customer*.

---

## 4. Sub-area: benefit entitlements (מיצוי זכויות)

- Work grant (מענק עבודה / negative income tax): claim window for tax year 2025 runs
  1 Jan 2026 – 30 Nov 2026; grant reported "up to ~₪4,000/yr and more in some cases"; single
  parent income ceiling reported ₪11,190/month. Official eligibility checker is free.
  Evidence: https://www.kolzchut.org.il/he/מענק_עבודה_(מענק_הכנסה,_מס_הכנסה_שלילי) ,
  https://www.misim.gov.il/gmmhszakaut/BdikatZakaut.aspx ,
  https://israelpost.co.il/בנק-הדואר/מס-הכנסה-שלילי-מענק-עבודה/
- The revealing signal: **private financial firms build their own copies of this calculator as
  lead magnets** — indigofinance.co.il, michpalyeda.co.il, yuvalim-finance.co.il, plus media
  (ice.co.il), aviv.org.il for seniors, bshcpa.co.il for returning residents. That identifies a
  *business* buyer for a widget, not a consumer buyer for an answer.
- Municipal/institutional "rights-realisation" SaaS: searched, found nothing self-serve — the
  space is State Comptroller reports and procurement-style vendors (e.g. flowdms.co.il for
  municipal document management). Public tender sales cycle → structurally impossible for us.

## 5. Sub-area: government fees (אגרות)

Essentially empty as a calculator market: Israeli statutory fees are **flat published numbers**,
not computations. Example: Companies Registrar annual fee 2026 = **₪1,338 if paid by 31 Mar 2026,
₪1,777 after 1 Apr 2026** (snippets from ahcpa.co.il, cpa-gs.co.il, yfcpa.co.il; official page
https://ica.justice.gov.il/IcaSite/request-type-menu/8/3). There is nothing to compute, and
accountants already send the reminder to their clients. No buyer found.

---

## 6. Payability to Israel

No new platform risk in this criterion. Every money model proposed below rides a rail the repo has
already shipped on — Paddle (products/il-biz-tools), Telegram Stars
(products/telegram-il-tools-bot), Apify pay-per-event (products/apify-il-open-data), x402
(products/x402-il-api). RapidAPI payouts to Israel: **UNKNOWN — not verified, do not assume.**

Owner blockers: none *new*. The existing one-time platform identity/payout steps on those four
accounts still apply and must not be assumed done.

## 7. What I could not close (open questions for an unblocked agent)

1. https://agentskills.co.il/en/skills/tax-and-finance/israeli-customs-duty-calculator — price, seller, traction.
2. Shaar Olami SystemTables endpoint terms of use — decides GREEN vs AMBER for the tariff dataset.
3. Kol-Zchut copyright page — confirm CC BY-NC-SA 2.5 IL (decides whether any rights-content reuse is RED).
4. data.gov.il CKAN: `package_search?q=ארנונה` — does a national arnona dataset already exist?
5. Real keyword volumes for "מחשבון מכס", "הנחה בארנונה", "מענק עבודה" — I have **no** volume data,
   only the existence of many competing pages. Nobody should treat my demand claims as measured.
