# Scout notes — israel-bureaucracy / business-registration

**Scout:** WORKER-SCOUT "business-registration", group `israel-bureaucracy`
**Date of research:** 2026-09-03
**Criterion:** Opening and running a business in Israel — עוסק פטור/מורשה registration, רשם החברות,
רישוי עסקים, forms and fees — and which steps a software tool can genuinely simplify.

## Evidence conditions (read this before trusting any number below)

- The container has **no general outbound network**. `WebFetch` was **EGRESS_BLOCKED** for every
  Israeli source that matters: `www.gov.il`, `he.wikisource.org`, `www.kolzchut.org.il`,
  `britcpa.co.il`. So **no gov.il page was rendered in this session**.
- The only pages I actually **rendered** are on GitHub:
  - `https://raw.githubusercontent.com/skills-il/food-and-dining/master/israeli-food-business-compliance/SKILL_HE.md`
  - `https://github.com/skills-il/government-services`
- Everything else is a **WebSearch snippet** — a search engine's summary quoting a page I could not
  open. Marked `[snippet]` throughout. Snippets are weaker than a rendered page and every load-bearing
  number below carries the exact URL a human or unblocked agent must open to close it.
- 15 web searches spent (budget cap 20).

## Facts gathered

### 1. עוסק פטור / עוסק מורשה registration
- `[snippet]` Registration can be done **online and free of charge** at the Tax Authority, without an
  accountant and without an appointment. Three authorities: **מס הכנסה, מע"מ, ביטוח לאומי**.
  Source to open: https://www.icount.co.il/blog/osek-patur/ ,
  https://www.greeninvoice.co.il/magazine/עוסק-פטור/ (search 2026-09-03)
- `[snippet]` 2026 עוסק פטור turnover ceiling: **₪122,833**. Matches the value already verified in
  `products/il-biz-tools/src/config/osek-patur.json`.
- `[snippet]` National Insurance opening/updating for a self-employed person is **טופס 6101**
  (דין וחשבון רב שנתי), submittable online. To open: 
  https://www.btl.gov.il/טפסים%20ואישורים/tfasimMkuvanim/Pages/dinvcheshbon.aspx
  I could not confirm the VAT opening form number (821) from any source — treat as **unknown**.
- `[snippet]` Market price of having a human do it: **₪300–800** one-off with an accountant
  (two independent snippets: ₪400–800 and ₪300–600), **free** if done alone; ongoing bookkeeping
  ₪200–500/month; annual return ₪1,400–2,000.
  To open: https://calliber.co.il/prices-list/exempt-dealer-opening-price/ ,
  https://bscpa.co.il/כמה-עולה-רואה-חשבון-לעוסק-פטור-כל-מה-שצ/
  **Implication:** the paid alternative is cheap and human; a software product cannot charge more
  than a few tens of shekels for the same job.

### 2. רשם החברות (Companies Registrar)
- `[snippet]` Company registration fee 2026: **₪3,123**, reduced to **₪2,559** when filed online
  (~₪500 discount). To open: https://www.digitalawyer.co.il/אגרת-רישום-חברה-ב-2021/ ,
  https://gbs-law.co.il/open-company/
- `[snippet]` Annual fee 2026: **₪1,338** if paid by **31.03.2026**, **₪1,777** from **01.04.2026**.
  To open (authoritative, blocked here): https://www.gov.il/he/service/company_partnership_annual_payment
  and https://cpa-gs.co.il/תשלום-אגרה-שנתית-לחברה-לשנת-2026/
- `[snippet]` A private company that does not file its **annual report** is declared a
  **חברה מפרה** under s.362א of the Companies Law: financial penalties on the company and its
  directors, liens not registered (blocks financing), and other registrar actions frozen.
  Exempt from the annual fee only in the calendar year of registration.
  To open: https://britcpa.co.il/hozrim/חברה-פרטית-חובת-תשלום-אגרה-שנתית-והגשת-6/ ,
  https://www.greeninvoice.co.il/magazine/רשם-החברות-דוח-שנתי/
- `[snippet]` **A lawyer is legally required** for parts of the corporate flow: registering a
  "מורשה על" for a corporation in the Tax Authority's digital-authorisations system can be entered
  **by lawyers only**, the lawyer performing signature/authority verification and replacing the paper
  נספח א'. To open: https://www.grantthornton.co.il/insights1/tax-insignths/2025/Authorized_Registration/
  Registrar portal: https://ica.justice.gov.il/IcaSite/

### 3. רישוי עסקים (business licensing)
- `[rendered]` From `skills-il/food-and-dining` SKILL_HE.md (an MIT-licensed public repo, which is a
  secondary source citing משרד הפנים):
  - Licensing fee from **1 April 2026: ₪381** for the main request types (new licence, renewal,
    temporary permit, היתר מזורז, change of ownership); duplicate of a lost licence **₪190.5**.
  - The fee is charged **per פריט רישוי separately** — a business holding several items pays several fees.
  - The tariff is updated **twice a year, 1 April and 1 October**.
  - Where a **מפרט אחיד** has been published for an item it is the binding nationwide requirement list
    and a local authority may not add different requirements on covered subjects; many food items still
    have no מפרט אחיד, and then the municipality's own requirements page governs.
  - **Licence validity is set per item in the schedule to the Order and ranges from 1 to 15 years** —
    never quote a single uniform validity.
  - Reform tracks beside the regular one: **רישוי על יסוד תצהיר**, **היתר מזורז א'**, **היתר מזורז ב'**;
    which track is allowed is set **per item** in the schedule.
  - Ministry links it gives: https://www.gov.il/he/departments/units/reform1/govil-landing-page (unified
    specifications + "הצו החכם") and https://www.gov.il/he/pages/fee-height (tariff).
- `[snippet]` **הצו החכם** is a free official Ministry of Interior search engine over the schedule to the
  Order: it returns, per licensing item, the approving bodies, licence validity, a link to the national
  מפרט אחיד and its publication date, plus related legislation. As of Jan 2019 43 unified specifications
  had been published. To open: https://www.misgav.org.il/הצו-החכם-מנוע-חיפוש-בתוספת-לצו-רישוי-עסקים/
  **Implication:** the lookup itself is already solved, free, by the state — as a *web UI*. There is no
  documented public API.
- `[snippet]` היתר מזורז א' = simple-to-medium complexity, 180 days, then a permanent licence after the
  approvers check. היתר מזורז ב' = medium complexity, business may not open for 49 days from filing the
  declaration. To open: https://www.rishuy.co.il/maslul-tazhir/ , https://www.buslic.co.il/ccl_mezoraz_b/
- `[snippet]` A human **יועץ רישוי עסקים** charges **₪5,000–15,000** on average per business.
  To open: https://avivbarishuy.co.il/כמה-עולה-להוציא-רישיון-עסק/
  This is the one part of the criterion with real money in it.

### 4. Withholding-tax / bookkeeping certificate (אישור ניכוי מס במקור וניהול ספרים)
- `[snippet]` A business customer is legally expected to check a supplier's withholding rate in the
  state system before paying; the Tax Authority provides a **free public web query** where you type the
  supplier's ע.מ/ע.פ/ת.ז/ח.פ and get a PDF certificate; validity is annual.
  To open: https://secapp.taxes.gov.il/gmIshurim/firstPage.aspx and
  https://taxinfo.taxes.gov.il/gmishurim/firstPage.aspx
- **No documented public API was found.** Automating this query in bulk means scraping a government
  portal whose terms I could not read (gov.il blocked) → **AMBER**, not a build.

### 5. Competition and prior art actually observed
- `[rendered]` **skills-il** (https://github.com/skills-il) — a 19-repo GitHub org, **MIT-licensed**,
  publishing free Hebrew AI-agent skills for exactly our home turf: `tax-and-finance` (33★),
  `localization`, `government-services` (12★, 30 skills incl. **israeli-company-lookup** — "Rasham
  HaChevarot integration, Ltd/amuta/partnership comparison" — **israeli-gov-form-automator**,
  **israeli-bureaucracy-decoder**), `accounting`, `legal-tech`, `security-compliance`, and an `mcps`
  repo of MCP servers for Israeli data sources. Distribution via a marketplace, agentskills.co.il
  (seen as a search result, not opened).
  **This is the single most important competitive fact in this report:** the "Israeli bureaucracy
  knowledge as a packaged agent skill" niche is already occupied by a free, open-source, actively
  maintained org (repos updated within days of 2026-09-03).
- `[github search, rendered metadata]` **XenoFlight/business-licensing-backend**,
  `.../business-licensing-backend-dev`, `.../Business-Licensing-Inspection-System` — a working
  municipal licensing back-office built **for מועצה אזורית יואב** (footer: "מערכת רישוי עסקים -
  מועצה אזורית יואב", "פותח עבור מחלקת רישוי עסקים"), with a `LicensingItem` model "לפי צו רישוי עסקים"
  and a `utils/seedSystem.js` seeding items with per-item approver flags (env, police, fire, health,
  agriculture, labour). Evidence that (a) municipalities do buy/commission this software, and (b) a
  machine-readable licensing-item table is something builders have to assemble themselves.
- Hebrew content competition on the registration keywords is heavy and well-funded: greeninvoice,
  icount, invoice4u, ucan2, kolzchut, and every accounting firm's blog all rank for
  "פתיחת עוסק פטור 2026". A no-brand static site does not win those keywords in months.
- `[snippet, negative]` I searched for an **affiliate/referral program** for Israeli invoicing SaaS
  (Green Invoice/Sumit/iCount) and found **no evidence one exists publicly**. Pricing seen: Green
  Invoice from ₪19/mo, iCount ₪119/yr. Do not model affiliate revenue until a program page is opened:
  https://www.icount.co.il/ , https://help.sumit.co.il/ .
- `[snippet]` Generic Israeli cost-per-lead reference: ~₪97 average (2020/21 figure, stale), sector
  dependent; lead resellers explicitly sell "לידים לרואה חשבון".
  To open: https://www.bluegiraffe.co.il/לידים/מחירון-לידים/ , https://www.clickon.co.il/לידים-לרואה-חשבון/

## What a software tool can genuinely simplify (and what it cannot)

Can: (a) telling a person which status/entity to open and what it will cost over 3 years;
(b) deadline and fee arithmetic that is genuinely error-prone (annual fee ₪1,338 before 31.3 vs ₪1,777
after; per-item licensing fees; licence validity read per item, 1–15 years); (c) turning the schedule
to the Order into a machine-readable table that other software can query — the state publishes a UI,
not an API; (d) watching the public Companies Registrar dataset for status changes.

Cannot: (a) file on the person's behalf — every filing route is an authenticated personal identity
session; (b) do the corporate work a lawyer is legally required for; (c) beat "הצו החכם" as a
human-facing lookup; (d) beat free MIT skills as a knowledge artefact.

## Dead ends (do not re-search these)

1. **Self-serve company incorporation product** — lawyer verification is legally required in the flow
   (Grant Thornton snippet above); an automated "register your Ltd" product either misleads the buyer
   or edges into unauthorised practice. AMBER at best.
2. **Municipal licensing back-office SaaS** — the buyer is a local authority. Procurement, tenders,
   demos, human relationships. Directly contradicts the mission's "owner does nothing". Also already
   given away by XenoFlight.
3. **Bulk automation of the Tax Authority withholding-certificate query** — no public API found,
   scraping a gov portal whose terms could not be read. AMBER.
4. **A human-facing "which licensing item am I?" search tool** — הצו החכם already does this, free,
   officially, with authoritative data.
5. **Affiliate revenue from Israeli invoicing SaaS** — searched, no public program found. Unknown, not zero.
6. **"Israeli bureaucracy knowledge pack" as a paid product** — skills-il gives an equivalent away MIT.
7. **Anything that requires reading gov.il from this container** — permanently blocked; queue for an
   unblocked agent.

## Open questions for an unblocked agent (exact URLs)

- https://www.gov.il/he/service/company_partnership_annual_payment — confirm ₪1,338 / ₪1,777 and dates.
- https://www.gov.il/he/pages/fee-height — confirm ₪381 / ₪190.5 licensing fee and the next update date.
- https://www.gov.il/he/departments/units/reform1/govil-landing-page — is הצו החכם data downloadable /
  does it expose a JSON endpoint? This decides whether finding F3 is a 10-hour or a 40-hour build.
- https://data.gov.il — does the Companies Registrar dataset carry the **מפרה חוק** / status fields?
  This decides finding F5.
- https://he.wikisource.org/wiki/צו_רישוי_עסקים_(עסקים_טעוני_רישוי) — full schedule as free text.
- https://www.icount.co.il / sumit / greeninvoice — is there a partner program page at all?
