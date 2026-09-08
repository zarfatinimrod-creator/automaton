# Scout notes — israel-bureaucracy / worker-rights

**Scout:** WORKER-SCOUT "worker-rights"
**Group:** israel-bureaucracy
**Criterion:** Israeli employment-rights calculators — severance (פיצויי פיטורים), notice (הודעה מוקדמת),
recuperation pay (דמי הבראה), vacation (חופשה), sick pay (מחלה), minimum wage (שכר מינימום).
Search demand and existing tools.
**Date of research:** 2026-09-03
**Web searches spent:** 12 (of the 20 allowed). GitHub code search used where possible (free).

---

## 1. Evidence log — what I actually saw

Evidence kinds used below:
- **[SNIP]** = a WebSearch result snippet quoting the page. Weaker. The URL a human must open to close it is given.
- **[FETCH]** = a page I actually rendered (WebFetch).
- **[GH]** = a GitHub code-search hit returning the actual file fragment.
- Nothing here rests on memory. Where I could not get evidence I wrote "unknown".

### 1.1 The consumer calculator market is saturated (searched 2026-09-03)

Commercial Hebrew severance calculators found in one query [SNIP]:
- https://www.heshevavoda.co.il/cal/מחשבון-פיצויים — "חשב עבודה" (established payroll-professional publisher)
- https://www.workrights.co.il/מחשבון-פיצויים — law-firm-run rights portal
- https://www.taxo.co.il/labor/C_Worker1_Taxo.asp — updated to 2026 tax data, handles מצנח זהב
- https://cheshbonai.co.il/employee-rights/severance — "13 termination scenarios, סעיף 14, tax"
- https://simplecalc.co.il/severance/ — "full 2026 calculator, סעיף 14, חל״ת months, tax split"

Recuperation-pay (דמי הבראה) calculators found in one query [SNIP]:
- https://www.tamal.co.il/articles/... (ט.מ.ל — payroll vendor)
- https://www.xn----1hcmgxnk8ede.co.il/מחשבון-דמי-הבראה ("מחשבון-שכר.co.il")
- https://jobcalc.co.il/employee-rights/havra/
- https://www.law-tip.co.il/דמי-הבראה-2026-מדריך-מלא/
- https://cheshbonai.co.il/blog/recreation-pay-2026

Free / authority / nonprofit incumbents [SNIP]:
- https://www.kolzchut.org.il/he/חישוב_פיצויי_פיטורים — Kol Zchut, the default Israeli rights encyclopaedia
- https://kavlaoved.org.il/כלים-לעובד/מחשבון-זכויות/ — Kav LaOved's end-of-employment rights calculator
  (severance + notice + vacation redemption + holiday pay in one)
- https://www.btl.gov.il/Simulators/Pages/default.aspx — **Bituach Leumi's own official simulators**
- https://www.hilan.co.il/... — Hilan (largest Israeli payroll vendor) knowledge base + gross/net calculator
- https://www.law-net.co.il/מחשבון-זכויות-עוזרת-בית/ — free rights calculator for domestic/hourly workers

Conclusion: severance / הבראה / vacation / minimum wage are **already covered by (a) the state,
(b) two large nonprofits, (c) every payroll vendor, and (d) at least six commercial SEO calculator
sites, several of which are already updated to 2026**. There is no informational gap left to fill.

### 1.2 Hard demand datum: a real Israeli legal site's severance calculator gets zero traffic

The WordPress theme of the live Israeli legal-content site **jus-tice.co.il** is public on GitHub and
contains its own Google Search Console export.

- [FETCH] https://raw.githubusercontent.com/The-new-ben/justice-theme/27c724a0c519fd1a29d46ab36df81db9fc2c3b22/project-control/rebuild-plan-2026-07/D2-site-hierarchy-survivors.csv
  Header (rendered): `cluster_id,pillar_url,role,intent,url,primary_query,new_title,priority_wave,clicks_16mo,impressions_16mo,action`
- [GH] The row for their severance calculator, from the same file:
  `labor-employment,...,tool,template/tool,https://jus-tice.co.il/severance-pay-calculator/,מחשבון פיצויי פיטורים: חישוב לפי שכר וותק,...,20,0.0,0.0,KEEP-IMPROVE`
  → **clicks_16mo = 0, impressions_16mo = 0** over 16 months.
- For scale, from the same file [FETCH]: `עורך דין פלילי` pillar = 12 clicks / 80,964 impressions;
  `איפה הכי זול לקנות דירה בעולם` = 267 clicks / 58,601 impressions.

Caveat (honest): the CSV does not say when the calculator page was published or whether it was
indexed, so 0/0 could partly be a young or noindexed page. But on a site that pulls tens of
thousands of impressions on other pages, a calculator page with literally zero impressions is
strong evidence that **a new entrant's severance calculator page does not rank**.

Also [GH] from the same repo, `inc/revenue-streams.php`:
```
'public_title'   => 'מחשבון פיצויי פיטורים ובדיקת זכויות לפני פנייה לעורך דין',
'target_keyword' => 'מחשבון פיצויי פיטורים',
'monetization'   => 'Paid lawyer review and labor-law lead fee.',
'guard'          => 'Audit existing labor pages first. Calculator must be an estimate, not legal advice.',
'next_action'    => 'Package as owner/manual service first.',
```
An operator already in this niche concluded the money is in a **paid lawyer review / lead fee**, and
that it has to be **packaged as a manual service first**. That is exactly the thing our mandate forbids.

And [GH] `.reports/semrush/seo-research-patterns-schema-eeat.md` (same repo):
"Interactive calculator pages — Extreme dwell time (5–12 minutes), very low bounce rate.
Critical for מחשבון מזונות, מחשבון פיצויי פיטורים." → confirms the keyword is *valuable*, which is
precisely why it is already contested by better-resourced sites.

### 1.3 Legal / licensing constraints found

**Kol Zchut content is NON-COMMERCIAL licensed.** [SNIP]
https://www.kolzchut.org.il/he/כל-זכות:זכויות_יוצרים — content is under **CC-BY-NC-SA 2.5 IL**
(note: NC, not plain BY-SA). Reusing or adapting their explanatory text in a revenue-generating
product is a licence violation → RED. The underlying statutes and published rates are facts and are
free to compute from; the *wording* is not.
Human must open to close: https://www.kolzchut.org.il/he/כל-זכות:זכויות_יוצרים

**Lawyer lead fees.** [SNIP] כללי לשכת עורכי הדין (אתיקה מקצועית), תשמ"ו-1986 —
https://www.nevo.co.il/law_html/law00/4415.htm and
https://he.wikisource.org/wiki/כללי_לשכת_עורכי_הדין_(אתיקה_מקצועית) —
restrict fee-sharing and provide that a lawyer employed by a non-lawyer **operating for profit and
charging for that legal service** may not serve that non-lawyer's clients. Selling qualified
employment-law leads from a calculator to Israeli lawyers is at best AMBER, and I could not render
the operative clause in full. Human must open: https://www.nevo.co.il/law_html/law00/4415.htm

### 1.4 Facts I confirmed (usable as calculator inputs, all snippet-level)

- Minimum wage from 01.04.2026: **₪6,443.85/month, ₪35.40/hour** [SNIP]
  Primary source to open: https://www.btl.gov.il/Mediniyut/GeneralData/Pages/שכר%20מינימום.aspx
  (secondary: Kav LaOved, Malam, Goldfarb client update, all dated to the 1.4.2026 update)
- דמי הבראה 2026: private sector general arrangement **₪451.50/day**; state service general track
  **₪511.60/day from 1.6.2026**; 5 days in year 1, 6 in years 2–3, rising to 10 from year 20 [SNIP]
  Primary source to open: https://www.tamal.co.il/articles/דמי-הבראה-למי-מגיע-וכיצד-מחשבים/ and the
  Histadrut/Ministry of Labour הרחבה order.
- Vacation: 12 paid days for a 5-day week / 14 for a 6-day week in the first four years, rising to
  28 [SNIP] https://www.playroll.com/compliance-hub/severance-pay-regulations-in-israel and
  https://www.papayaglobal.com/countrypedia/country/israel/
- Severance: 1 month's salary per year of service after 1 year; סעיף 14 arrangement = monthly
  employer deposit of **8.33%** [SNIP], same sources.
- דמי הבראה are treated as expense reimbursement and are **not** included in the severance/pension
  base [SNIP] https://www.kolzchut.org.il/he/רכיבי_השכר_הבאים_בחשבון_לצורך_חישוב_פיצויי_פיטורים_והפרשות_לפנסיה

All of the above are **snippet-level** and must be re-verified against the primary source before
they go into any shipped calculator.

### 1.5 Software / build gap

- `mcp__github__search_repositories "israel severance pay calculator pitzuim labor law"` → **0 repositories**.
- `mcp__github__search_code "פיצויי פיטורים calculator language:javascript"` → 4 hits, none a reusable library
  (two are one-off Hebrew finance sites, one an SEO batch script).
- So: **no open-source Israeli employment-rights calculation library exists.** That is a genuine
  software gap — but a gap in *supply of code*, not a gap in *supply of answers to the public*, and
  the population of developers who need it is tiny.

### 1.6 Employer-side / household-employer segment

- https://maskoreshet.co.il/?about=price — "משכורשת", a paid online payroll system priced per active
  employee per month; explicitly says you pay only for the months you actually add/update salaries [SNIP].
  Exact prices not rendered. Human must open that URL to get the price list.
- https://play.google.com/store/apps/details?id=com.malam.tlush — Malam "תלוש אונליין" (employee-facing) [SNIP]
- https://www.law-net.co.il/מחשבון-זכויות-עוזרת-בית/ — a *free* rights calculator aimed exactly at the
  household-employer case [SNIP]
So even the household segment already has both a free calculator and paid payroll SaaS.

### 1.7 Payslip-audit services (the one place money visibly changes hands)

- https://www.law-net.co.il/בדיקת-תקינות-תלושי-שכר/ — "בדיקת תלושי שכר — בדיקה תוך 10 דקות" [SNIP]
- https://bodeksahar.co.il/Tlush_Sahar — a dedicated payslip-checking service [SNIP]
Both are funnels into a human legal/accounting service; neither published a price in the snippet.
Human must open both URLs to learn the price point and whether any part is self-serve.

---

## 2. Verdict on the criterion

**This criterion is a dead end for a standalone product line.** The calculators themselves are a
commodity supplied free by the state, by Kol Zchut, by Kav LaOved and by every payroll vendor; the
keyword is contested by at least six commercial sites already updated for 2026; and the only visible
monetisation in the niche (lawyer leads, paid payslip review) is a human service and is legally AMBER
under the Bar's ethics rules.

The only honest positive is a **cheap additive**: fold two or three of these calculators into the
already-shipped `products/il-biz-tools` as extra free SEO surface for the existing ₪79 Pro tier.
That is hours of work, no new payment rail, no new ToS surface, and no new owner blocker — but its
realistic contribution is a rounding error against the 20,000 ILS/month target, and it should not be
counted on.

## 3. What a human or unblocked agent must open to close my open questions
1. https://www.nevo.co.il/law_html/law00/4415.htm — the exact fee-sharing / non-lawyer-employer clauses.
2. https://www.kolzchut.org.il/he/כל-זכות:זכויות_יוצרים — confirm CC-BY-NC-SA (the NC is decisive).
3. https://maskoreshet.co.il/?about=price — actual per-employee monthly price for household payroll.
4. https://www.btl.gov.il/Mediniyut/GeneralData/Pages/שכר%20מינימום.aspx — minimum wage, primary.
5. https://bodeksahar.co.il/Tlush_Sahar and https://www.law-net.co.il/בדיקת-תקינות-תלושי-שכר/ — payslip-audit price points.
6. Keyword volume for מחשבון פיצויי פיטורים / מחשבון דמי הבראה — I have **no** volume figure; I refuse
   to invent one. Needs a keyword tool (Ahrefs/SEMrush/Keyword Planner), which this container cannot reach.
