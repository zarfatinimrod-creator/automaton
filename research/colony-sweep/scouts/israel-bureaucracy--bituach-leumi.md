# Scout: israel-bureaucracy / bituach-leumi

Criterion: National Insurance (ביטוח לאומי) for the self-employed — 2026 rates and ceilings,
advance payments (מקדמות), benefits and grants, and which calculators people search for.

Date of research: 2026-09-03. Session web-search budget used: **14 searches**.

## Evidence strength legend
- **RENDERED** — I fetched the page/file and read it myself.
- **SNIPPET** — a search-result summary quoting the page. Weaker. A human must open the URL.
- Nothing below rests on memory alone. Where I could not verify, it says "unknown".

## Egress reality
`btl.gov.il`, `gov.il`, `kolzchut.org.il`, `data.gov.il` are ALL **EGRESS_BLOCKED** from this
container (verified: WebFetch on the btl 2026 circular PDF and on the data.gov.il CKAN API both
returned EGRESS_BLOCKED). Every primary-source number below is therefore SNIPPET-grade and needs
one human/unblocked fetch to close. `github.com` renders (used it, see §4).

---

## 1. The 2026 numbers (self-employed)

| Item | 2026 value | Evidence |
|---|---|---|
| Average wage (שכר ממוצע, for NI purposes) | ₪13,769–13,770 | SNIPPET, 2026-09-03 |
| Reduced bracket ceiling (מדרגה מופחתת) | **₪7,703 / month** | SNIPPET ×4, and matches repo config |
| Maximum insurable income (תקרה) | **₪51,910 / month** | SNIPPET ×3, and matches repo config |
| Self-employed, reduced tier | **4.47% NI + 3.23% health = 7.70%** | SNIPPET |
| Self-employed, full tier (7,703 → 51,910) | **12.83% NI + 5.17% health = 18.00%** | SNIPPET |
| Minimum income floor for contributions | ₪3,442 / month (pay from a minimum income if below) | SNIPPET, single source — weakest number here |
| Above ₪51,910 | no contributions at all (ceiling, not a third bracket) | SNIPPET |

Employee comparison (for cross-checking a calculator): 4.27% reduced / 12.17% full (employee
share incl. health). SNIPPET — and this **exactly reconciles** with the numbers already in this
repo at `products/il-biz-tools/src/config/tax-2026.json`
(employee reduced 1.04% + 3.23% = 4.27%; full 7.00% + 5.17% = 12.17%; reducedTierUpTo 7703;
maxInsurableIncome 51910). RENDERED (local file). That is the strongest corroboration I have:
two independent derivations of the same bracket boundaries.

Sources seen (all EGRESS_BLOCKED unless noted — these are the URLs a human must open):
- https://www.btl.gov.il/Insurance/HozrimBituah/Hozrim/_שינוי_בתשלום_דמי_ביטוח_לאומי_ודמי_ביטוח_בריאות_לשנת_2026.pdf — **the authoritative circular. BLOCKED. Open this first.**
- https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx (official self-employed rate table) — BLOCKED
- https://www.bizportal.co.il/guides/news/article/20039168 ("ביטוח לאומי לעצמאי 2026: 7.7% עד 7,703 שקל בחודש")
- https://www.eddiecpa.com/articles/דמי-ביטוח-לאומי/
- https://www.malam-payroll.com/national-insurance-updates-for-2026/
- https://www.hashavim.co.il/articles/labor-law/national-insurance-updates/
- https://www.capitax.co.il/content/2/3137
- https://igoolim.co.il/bituach-leumi-2026-changes/

**Number conflict to flag:** one snippet gave the reduced bracket as ₪7,703/month, another as
"up to ₪7,710". 7,703 appears in 4+ independent snippets and in the repo config; treat 7,710 as
noise, but a calculator must not ship until the btl circular is read.

### The 2026 structural change (this is the news hook)
Under חוק ההסדרים 2025, from 2026 the **reduced collection bracket is indexed to the CPI rather
than to the average wage**. Knesset research centre estimate quoted: ~₪10/month more in 2026,
rising to ~₪50/month by 2030, hitting low-to-mid earners hardest. SNIPPET, 2026-09-03, from
igoolim.co.il and davar1.co.il (https://www.davar1.co.il/647229/). Needs a human to confirm.

---

## 2. Who counts as "עצמאי" — the trap nobody calculates

An עוסק is a *"עובד עצמאי העונה להגדרה"* (full rights) only if one of three tests holds
(SNIPPET, 2026-09-03):
1. ≥ 20 hours/week in the occupation; **or**
2. average monthly income > **₪6,885** (half the average wage, 2026); **or**
3. ≥ 12 hours/week **and** income > **₪2,065** (quarter of the average wage, 2026).

Fail all three → **"עצמאי שאינו עונה להגדרה"**: pays reduced contributions but is **outside
work-injury (פגיעה בעבודה) cover and outside maternity rights**. SNIPPET. This is a real,
expensive, widely misunderstood cliff and almost no free calculator models it.
URLs to close it: https://www.kolzchut.org.il/he/עובד_עצמאי_(לפי_הגדרת_המוסד_לביטוח_לאומי) (BLOCKED),
https://www.ucan2.co.il/עצמאי-שאינו-עונה-להגדרה/ , http://gititkaplan.co.il/עצמאי-שאיננו-עומד-בהגדרה…

---

## 3. Advance payments (מקדמות) and refunds

- Annual liability is divided into monthly **advances**, set from the last tax assessment.
  SNIPPET.
- **תיקון מקדמות (form 672)**: allowed only if income changed by **≥10%**, and only **once per
  quarter** (Q1 = 1 Jan–31 Mar, Q2 = 1 Apr–30 Jun …). SNIPPET, 2026-09-03, from
  https://www.ezcount.co.il/blog/social-security-advances and
  https://www.btl.gov.il/…/672 - בקשה לתיקון מקדמות (BLOCKED).
- **תיאום דמי ביטוח / refund**: overpayment happens routinely for someone who is both שכיר and
  עצמאי, or has several employers, because the ₪51,910 ceiling applies to *total* income.
  Coordination is relevant when the main employer's salary is below ₪7,703 or total income
  exceeds ₪51,910/month. SNIPPET.
- Refunds can be claimed **retroactively (multi-year; one snippet says up to 7 years)** and
  **ביטוח לאומי does not initiate the check — the insured must ask**. SNIPPET, weak on the exact
  lookback. URLs: https://www.gov.il/he/service/coordinationofnationalinsurancecontributions ,
  https://www.btl.gov.il/Insurance/Teum/Hechzer/Pages/default.aspx (both BLOCKED).
- Payment deadline (15th of month) — **I could not verify it.** Unknown. Do not state it.

---

## 4. Benefits and grants that hang off the contributions

- **דמי פגיעה בעבודה**: 75% of the income contributions were paid on, ÷90 per day, capped at
  **₪1,314.25/day** (2026). SNIPPET. Conditional on lawful registration and timely payment —
  i.e. on being "עונה להגדרה" and not in arrears.
- **דמי לידה לעצמאית**: full entitlement requires contributions for 10 of the last 14 months (or
  15 of 22); **partial, 8 weeks, for 6 of the last 14 months**. Amount is the higher of two
  assessments (the quarter preceding the determining day vs. the preceding tax-year assessment).
  Income tax, NI and health are withheld from it. SNIPPET, 2026-09-03,
  https://www.bshcpa.co.il/חישוב-דמי-לידה-לעצמאית/ , https://www.zscpa.co.il/חישוב-מי-לידה/ ,
  https://www.btl.gov.il/benefits/maternity/…/ShiureyLeda.aspx (BLOCKED).
- **מענק עבודה (מס הכנסה שלילי)** — Tax Authority, not NI, but the same buyer searches for it:
  ~₪4,000/year; self-employed qualify if they had business income and **filed the annual return
  on time**; claims for tax year 2025 open **01/01/2026 → 30/11/2026**; extra grant since 2025
  for parents of under-3s, payable even to some who miss the general grant.
  SNIPPET, https://www.misim.gov.il/gmmhszakaut/ , https://israelpost.co.il/…מס-הכנסה-שלילי… ,
  https://protocol.co.il/negative-income-tax/ , kolzchut (BLOCKED).
- **Unemployment for the self-employed**: I did **not** research it. Unknown; open question.

---

## 5. Competitive landscape — who already owns "מחשבון ביטוח לאומי"

Web (crowded): the **official btl simulator**
(https://www.btl.gov.il/Simulators/BituahCalc/Pages/Insurance_NotSachir.aspx, BLOCKED),
https://jobcalc.co.il/national-insurance/bituach-leumi/self-employed/ , https://cpa-ea.co.il/mahshevon-bituah-leumi/ ,
https://ins-digital.co.il/… , https://www.xn----1hcmgxnk8ede.co.il/מחשבון-דמי-ביטוח-לאומי .
SEO for the head term is contested by an official government tool. A new generic calculator ranks nowhere.

Code (empty): GitHub search for `bituach leumi israel tax calculator` returns **2 repos, both
`peleg-jpg/*`, both created 2026-05-11, both 0 stars, both employee-payroll focused**
(RENDERED via GitHub API, 2026-09-03). Search for `israel national insurance rates dataset
hebrew freelancer` returns **0 repos**. There is no maintained, machine-readable, self-employed
2026 rate/bracket artifact in open source. That is the only genuinely uncontested space I found.

Israeli invoicing SaaS with public developer APIs (potential integrators, and also the reason
nobody buys a rates feed): SUMIT (https://help.sumit.co.il/he/articles/5840952-…, free tier then
₪19/mo + ₪0.35/action — SNIPPET), Green Invoice / morning (https://www.greeninvoice.co.il/api-docs/),
Invoice4u, YPAY. These maintain their own tax tables in-house.

Market size: **unknown.** I could not find a CBS figure for the number of self-employed in
Israel. Only anchor found: **עוסק פטור turnover ceiling 2026 = ₪122,833** (SNIPPET,
https://www.greeninvoice.co.il/magazine/תקרת-עוסק-פטור/).

---

## 6. What is actually buildable (see structured findings)

Ranked by honesty of the revenue case, not by excitement:
1. `il-bituach-leumi-2026` machine-readable rates artifact (npm/JSON + Apify actor + x402 endpoint).
2. Refund/תיאום checker for שכיר+עצמאי over the ceiling — the only tool that hands the user money.
3. "עונה להגדרה?" rights-cliff diagnostic — uncontested, high stakes, cheap.
4. מקדמות planner (10% rule, quarterly window, form 672 prep).
5. מענק עבודה eligibility checker — seasonal spike, deadline 30/11.
Free calculators feed the existing Paddle Pro tier in `products/il-biz-tools`; none of them is a
₪20k/month line on its own and I will not pretend otherwise.

## 7. Dead ends
- **Another generic "מחשבון ביטוח לאומי"**: the government publishes its own and 5+ commercial
  sites already rank. Zero-differentiation SEO play.
- **Scraping btl.gov.il for a live feed**: impossible from this container (EGRESS_BLOCKED), and
  scraping-permission on gov.il is unverified → AMBER at best. The rates change once a year;
  a hand-verified annual JSON is both legal and sufficient.
- **"We file your תיאום / 672 / מענק עבודה for you"**: requires acting for a person before
  ביטוח לאומי / רשות המסים and likely a licensed tax advisor. Owner does not talk to people.
  RED against the mission. Compute-and-hand-them-the-numbers only.
- **Selling a rates feed to Israeli invoicing SaaS**: named candidates (SUMIT, Green Invoice,
  Invoice4u) all maintain their own tables and buying would need a sales conversation. No buyer.
- **Affiliate/lead-gen to accountants**: needs the owner to negotiate. Out.
- **Unemployment cover for the self-employed**: not researched, genuinely open.

## 8. The five URLs that would upgrade everything here from SNIPPET to RENDERED
1. https://www.btl.gov.il/Insurance/HozrimBituah/Hozrim/_שינוי_בתשלום_דמי_ביטוח_לאומי_ודמי_ביטוח_בריאות_לשנת_2026.pdf
2. https://www.btl.gov.il/Insurance/National%20Insurance/type_list/Self_Employed/Pages/rates.aspx
3. https://www.kolzchut.org.il/he/דמי_ביטוח_לאומי_לעצמאי
4. https://www.btl.gov.il/Insurance/Teum/Hechzer/Pages/default.aspx
5. https://www.btl.gov.il/About/news/Pages/hadasaidkonkitzva2026.aspx (2026 benefit amounts)
