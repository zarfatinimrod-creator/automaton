# Scout: israel-bureaucracy / vat-reporting

Criterion: Israeli VAT (מע״מ) reporting — online filing, deadlines, penalties, what small
businesses get wrong, existing software, and the gap a free tool + small Pro tier could fill.

Date of research: 2026-09-03. Session web-search budget used: 13 searches.

## Evidence strength legend
- **RENDERED** — I fetched the page/file and read it.
- **SNIPPET** — a search-result summary quoting the page; weaker, needs a human to open the URL.
- Nothing here rests on memory alone; where I could only infer, it is marked low confidence.

---

## 1. The rules, as far as I could verify them

### Reporting deadline
- Periodic VAT report due by the **15th** of the month following the reporting period;
  **filing online extends it to the 19th**.
  SNIPPET, 2026-09-03, from https://www.ucan2.co.il/דיווח-מקוון-למעמ/ (host EGRESS_BLOCKED — a
  human must open it) and https://www.kolzchut.org.il/he/הגשת_דו%22חות_תקופתיים_ותשלום_מס_ערך_מוסף
  (also EGRESS_BLOCKED).
- Monthly vs bi-monthly frequency is turnover-dependent; I could **not** verify the current
  threshold. Open question. URL to close it: https://www.gov.il/he/service/vat-periodic-report
  and https://www.rivhit.co.il/מועדי-דיווח-לשנת-מס-2026/

### Detailed report (דיווח מפורט / PCN874)
- **From 1 January 2026, an individual osek (עוסק יחיד) with annual turnover above
  ₪500,000 must file the detailed report.** This is the single most important fact for this
  criterion: it drags a large new cohort of one-person businesses into PCN874.
  SNIPPET, 2026-09-03. Sources seen in results:
  - https://www.gov.il/he/pages/pa280825-1 (ITA page titled "חובת הגשת דוח תקופתי מפורט למע״מ
    על ידי עוסק, שהוא יחיד, אשר…") — **gov.il is EGRESS_BLOCKED; this is the URL a human must
    open to confirm the ₪500,000 figure and its exact effective date.**
  - https://tzer.co.il/en/vat-pcn-report-in-israel/ ("VAT changes in Israel ahead: detailed PCN
    reporting becomes mandatory from January 2026") — EGRESS_BLOCKED.
  - https://www.ucan2.co.il/דיווח-מעמ-מפורט/ — EGRESS_BLOCKED.
- Businesses under the threshold can still be required to file if they receive a formal notice
  from the ITA. Osek patur generally not required. SNIPPET, same sources.
- Filing route: taxes.gov.il → דיווחים → מע״מ → upload the PCN874 file, authenticated with a
  digital identity. SNIPPET, https://www.linet.org.il/מה-זה-pcn874-… , 2026-09-03.

### Penalties
- Administrative fines for late filing to VAT authorities: **₪750 to ₪5,000** depending on the
  tax amount arising from the report (per תקנות העבירות המנהליות (קנס מנהלי — חיקוקי מסים)
  (תיקון), התשע״ו-2015). Late filing of the *detailed/online* report by nonprofits and financial
  institutions: **₪3,000**.
  SNIPPET, 2026-09-03, https://www.bdo.co.il/he-il/כתבות-ומאמרים/מיסים/מידעון-המיסים/קנסות-מנהליים-על-אי-הגשת-דוחות…
  (BDO Israel). A human should open this to confirm current amounts.
- On top: קנס פיגורים, linkage differences and interest on unpaid VAT; possible delay of VAT
  refunds and an ITA examination. SNIPPET, same batch.

### VAT rate
- 18% standard rate, in force since January 2025, unchanged as of 2026. SNIPPET, 2026-09-03,
  results incl. https://globalrules.org/il/vat-rate and https://vatcalculator.co.il/ .

### The file format (this is the buildable part)
- PCN874 is a fixed-width **.txt** file: a header record plus one record per transaction, with
  the counterparty's VAT/ID number, so the ITA can cross-match your input invoices against your
  supplier's output invoices. SNIPPET + RENDERED (see library below).
- Official spec PDF referenced by the open-source implementation:
  https://www.gov.il/BlobFolder/generalpage/tax-vat-online-invoice-reporting/he/IncomeTax_IncomeTaxSoftwareHousesInfo_874-eng.pdf
  (RENDERED reference from the library README; the PDF itself is on gov.il = EGRESS_BLOCKED).
- **`@accounter/pcn874-generator` — MIT-licensed TypeScript generator + validator.**
  RENDERED:
  - https://raw.githubusercontent.com/gilgardosh/accounter-toolkit/master/packages/pcn874-generator/README.md
  - https://raw.githubusercontent.com/gilgardosh/accounter-toolkit/master/packages/pcn874-generator/src/index.ts
  - https://raw.githubusercontent.com/gilgardosh/accounter-toolkit/master/LICENSE → "MIT License, Copyright (c) 2022 Gil Gardosh"
  API: `pcnGenerator(header, transactions, options) => string`, plus `validatePcn874(content)`.
  Entry types (RENDERED from source): sales S1 (identified customer), S2 (identified zero/exempt),
  L1 (unidentified), L2 (unidentified zero/exempt), M (self-invoice sale), Y (export),
  I (Palestinian Authority customer); inputs T (Israeli supplier), K (petty cash),
  R (import), P (PA supplier), H (single document by law), C (self-invoice input).
  Validation is per-record with indexed error messages; the README lists two known gaps —
  header-vs-transaction sum reconciliation, and multi-user reporting via a representative.
- Real production users of that library: https://github.com/Urigo/accounter-fullstack
  (RENDERED via GitHub code search — `pcn874.resolver.ts`, `pcn.helper.ts`, a `pcn874` table with
  a record-type enum `('S1','S2','L1','L2','M','Y','I','T','K','R','P','H','C')`).
- Other repos seen (GitHub search, RENDERED metadata): `doron2864/pcn874-guide` (HTML guide,
  created 2026-07), `noamvais1-pixel/AI-Accountant-ISR` (created 2026-08, "Bookkeeping and VAT
  reporting for an Israeli osek murshe … PCN874 detailed VAT filing"). Both are 0-star, days-old
  hobby repos — they are a demand signal (people are building this *right now*), not competition.

### Israel Invoice model (חשבוניות ישראל) — adjacent and relevant
- Allocation number required for a domestic B2B tax invoice above **₪5,000 before VAT**, and from
  **1 June 2026 the ceiling stands at ₪5,000 (excl. VAT)**. Without an allocation number the
  *recipient* cannot deduct input VAT. SNIPPET, 2026-09-03, results incl.
  https://www.greeninvoice.co.il/magazine/israel-invoice/ , https://www.icount.co.il/blog/invoice-israel/ ,
  https://britcpa.co.il/hozrim/מודל-חשבוניות-ישראל-עדכונים-לשנת-2026/ .
  NOTE: the repo's own `products/il-biz-tools/src/lib/allocation.js` already models this threshold
  timeline, so this is already covered by a shipped product.
- Getting allocation numbers programmatically goes through the **SHAAM Open API**, which requires
  registering as a software house with the ITA. SNIPPET, 2026-09-03:
  https://www.gov.il/BlobFolder/service/connect-to-shaam/he/Service_Pages_shaam_connection-work-process-software-houses.pdf
  and https://www.gov.il/he/pages/hor-software-other (both gov.il = EGRESS_BLOCKED).
  There is also a public software registry: https://www.misim.gov.il/mm_tocna/ .

### What small businesses get wrong (input VAT)
- No input VAT deduction on hospitality — restaurants, cafés, entertainment — even when the
  purpose is fully business. SNIPPET, 2026-09-03,
  https://www.zscpa.co.il/מעמ-תשומות/ , https://www.kolzchut.org.il/he/מס_תשומות .
- Mixed private/business expense: **66%** of the VAT deductible when mainly business, **25%**
  when mainly private. SNIPPET, same sources.
- Deduction requires an original invoice issued lawfully in the business's name. SNIPPET, same.

### Existing software and pricing
- The PCN874 file is a one-click export inside every Israeli accounting suite: iCount
  (https://help.icount.co.il/reports/pcn874/), Hashavshevet/WizCloud
  (https://home.wizcloud.co.il/help/pcn874/), Rivhit
  (https://www.rivhit.co.il/knowledgebase/עריכה-ואיחוד-עוסקים-קובץ-pcn874/), Invoice4u, Linet,
  Priority, SAP B1 & S/4HANA (https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/…/97f7e7dcc60f44838cab99ba33668a2e.html).
  All SNIPPET-level except the SAP/gov URLs I did not fetch.
- Pricing band: roughly **₪0–150/month**, most freelancers paying **₪29–69/month**; iCount from
  ₪9.90/month, an Express annual plan at ₪276+VAT; Sumit has a free tier. SNIPPET, 2026-09-03,
  https://www.icount.co.il/plans/ and comparison pages (basecrm.co.il, adircpa.com).
- **The ITA publishes a simulator that validates a PCN874 file before transmission.** SNIPPET,
  2026-09-03, seen in results for h-erp's Guidance874W.pdf
  (https://downloads.h-erp.co.il/files/vatr/Guidance874W.pdf) and Finbot's
  https://finbot.helpjuice.com/tax-prc/how-to-pcn-prc . This materially weakens any
  "free PCN874 validator" pitch and is the honest cap on finding #2.

---

## 2. What is already ours
`products/il-biz-tools` already ships `vat.html` (VAT add/extract calculator, 18% from
`src/config/vat.json`) and `allocation.html` (allocation-number threshold checker), with a Paddle
Pro tier (`src/lib/paddle.js`, `src/lib/license.js`). So a plain VAT calculator is *taken*; only
the PCN874 layer is new ground.

## 3. Payability to Israel
YES for the money models proposed here: the colony already sells to Israelis through Paddle in a
shipped product (`products/il-biz-tools/src/lib/paddle.js`, `scripts/make-license.js`,
`tests/license-branding.test.js` — RENDERED, local repo). Paddle is merchant of record and pays
out to Israeli sellers; the owner's Paddle payout/KYC step is the standing one-time blocker
already catalogued for that product, not a new one.

## 4. Dead ends
- Selling a PCN874 *library/API* to Israeli SaaS: a complete MIT implementation already exists
  (`@accounter/pcn874-generator`). Nobody pays for what npm gives away.
- A standalone free "VAT deadline calendar": Rivhit and others publish the 2026 date table for
  free as SEO bait. Commoditized.
- Anything that submits to the ITA or pulls allocation numbers automatically: gated behind
  SHAAM software-house registration. Not shippable by software alone, and not GREEN.
- Blocked hosts that cost me turns: gov.il, kolzchut.org.il, tzer.co.il, ucan2.co.il — all
  EGRESS_BLOCKED. Every ITA primary source is behind gov.il, so the *legal* facts here are all
  SNIPPET-grade and must be confirmed by a human before anything is published as guidance.
