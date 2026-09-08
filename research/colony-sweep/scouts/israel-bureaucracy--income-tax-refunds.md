# Scout: israel-bureaucracy / income-tax-refunds
Date: 2026-09-03. Agent: WORKER-SCOUT "income-tax-refunds".
Criterion: Israeli income tax — 2026 brackets, credit points (נקודות זיכוי), and the tax-refund (החזרי מס) industry: who charges what, what is automatable, what legally requires a licensed representative.

## Evidence quality warning (read first)
The egress proxy blocked EVERY page I tried to render: www.kolzchut.org.il, www.gov.il,
fs.knesset.gov.il, msl.org.il — all `EGRESS_BLOCKED`. github.com search returned zero
Israeli-tax repos. **Therefore every number below rests on WebSearch snippets, not on a
rendered page.** Snippets are marked [SNIPPET]. Nothing here is from memory.
13 WebSearch calls spent of the shared ~200 budget.

## URLs a human / unblocked agent must open to harden this
- https://www.gov.il/he/pages/hor-software-other  (SHAAM Open API + software-house docs) — BLOCKED here
- https://www.kolzchut.org.il/he/החזר_מס_הכנסה  (refund eligibility, 6-year rule, form list) — BLOCKED here
- https://fs.knesset.gov.il/globaldocs/MMM/a4622f6b-9905-f111-a13e-005056aa7c52/2_a4622f6b-9905-f111-a13e-005056aa7c52_11_21431.pdf (Knesset MMM: 2026 bracket-widening analysis — the authoritative bracket table) — BLOCKED here
- https://www.nevo.co.il/law_html/law00/73862.htm (חוק הסדרת העיסוק בייצוג על ידי יועצי מס, תשס"ה-2005 — exact scope of "ייצוג")
- https://he.wikisource.org/wiki/חוק_הסדרת_העיסוק_בייצוג_על_ידי_יועצי_מס (free full text of the same law)
- https://www.ynet.co.il/economy/article/rjvt8jilt ("זול ופשוט או לא הגון ולא מקצועי" — the cheap-refund-company exposé; best single source on competitor conduct)
- https://www.timesofisrael.com/israel-unveils-0-tax-rate-for-2026s-immigrants-and-returning-residents/ (olim 0% rate)

## Facts gathered
### 2026 parameters [SNIPPET, 2026-09-03]
- Credit point (נקודת זיכוי) = **242 ₪/month = 2,904 ₪/year**; basic 2.25 points for an
  Israeli resident = **6,534 ₪/year**.
  src: https://danel-jobs.co.il/info-center/נקודות-זיכוי/ , https://www.bizportal.co.il/career/news/article/20035600
- Brackets: six progressive rates 10%–47% plus 3% מס יסף above ~721,560 ₪/yr. From Jan-2026
  the 20% band was widened to **19,000 ₪/month** and the 31% band to **25,100 ₪/month**.
  src: https://www.mako.co.il/news-money/calculators/Article-54d2f6451f9ff91027.htm , https://msl.org.il/מחקר/מדרגות-מס/
- Brackets and the credit-point value are **frozen (no inflation indexation) for 2025-2027** —
  so a 2026 calculator's constants stay valid for two more years, which is unusually good for
  a content/product shelf life.
  src: https://www.ynet.co.il/economy/article/yokra14629288 , https://www.malam-payroll.com/ריווח-מדרגות-מס-הכנסה-מינואר-2026-הבהרה-למ/
- Credit points by status [SNIPPET]: child +1.0–1.5; discharged soldier +2.0/month for 36
  months (1.0 for partial service); academic first degree +1.0 for 3 years, second degree +0.5
  for 2 years; new immigrant on a declining 42-month scale.
  src: https://taxes-refund.co.il/תנאי-נקודות-זיכוי-מס/ , https://www.mako.co.il/news-money/calculators/Article-0f7976ebed65f91026.htm

### The refund market [SNIPPET, 2026-09-03]
- Standard fee: **15–25% of the refund + 18% VAT**, success-fee only, sometimes a **minimum
  fee ~800 ₪** and/or a file-opening fee.
  src: https://indigofinance.co.il/כמה-אחוזים-לוקחים-על-החזרי-מס , https://www.ultra-fi.co.il/החזרי-מס/ , https://taxes-refund.co.il/כמה-עמלה-לוקחים-על-החזר-מס/
- Size: ~**8.5 billion ₪** estimated owed to Israeli employees; Tax Authority reported
  **1.65 billion ₪** of over-collection accumulated (Sept 2025) and that only ~**20%** of
  eligible people claim. Average refund ~**8,000 ₪** (2024 refunds); one vendor site claims
  10,500 ₪ average. Claims may be filed **6 years back**.
  src: https://www.kolzchut.org.il/he/החזר_מס_הכנסה (snippet only), https://www.supermarker.themarker.com/Taxes/TaxReturnForEmployees.aspx , https://taxes-refund.co.il/
- Incumbents already own the search term: taxes-refund.co.il, finupp (מיטב דש),
  missim-refund.co.il, money-back.co.il, ultra-fi, indigofinance. Several already offer a
  **free online eligibility check** as the funnel. Meitav's finupp claims it auto-pulls
  Form 106 and pension confirmations from state systems.

### What is automatable / what needs a licence
- **Form 135** (short annual return / refund claim) can be filled and filed **online by the
  taxpayer with no יועץ מס or רו"ח** [SNIPPET].
  src: https://easydo.co.il/מאגר-טפסים-דיגיטליים-בחינם/שכירים/טופס-135-דיגיטלי/ , https://www.zscpa.co.il/טופס-135/
- **Representation before the Tax Authority (ייצוג) is licensed**: חוק הסדרת העיסוק בייצוג
  על ידי יועצי מס, תשס"ה-2005. Licence from מועצת יועצי המס (Ministry of Finance), requires
  exams + a 12-month apprenticeship; CPAs and lawyers may represent under their own statutes
  [SNIPPET]. src: https://he.wikipedia.org/wiki/יועץ_מס , https://www.nevo.co.il/law_html/law00/73862.htm
  => A software-only operation may **compute, explain and estimate**, and may hand the user
  their own numbers to file themselves. It may **not** act as their מייצג, file on their
  behalf under a representative code, or take a success fee for representation.
- The Tax Authority's **SHAAM Open API** exists but is a software-house channel (invoice
  model / withholding / advances), gated behind registration and certificates — not a
  citizen-refund API. No public API for filing a 135 was found.
  src: https://www.gov.il/he/pages/hor-software-other , https://www.gov.il/BlobFolder/service/connect-to-shaam/he/Service_Pages_shaam_connection-work-process-software-houses.pdf (both BLOCKED here; snippet only)

### Olim angle (freshest, least crowded) [SNIPPET, 2026-09-03]
- Israel announced a **0% income tax rate for the first two years** for immigrants and
  returning residents arriving in 2026, on top of the existing 10-year foreign-income
  exemption. src: https://www.timesofisrael.com/israel-unveils-0-tax-rate-for-2026s-immigrants-and-returning-residents/
- From **1/1/2026** new olim / returning residents have a **disclosure requirement** to the
  ITA for foreign income and assets. src: https://aaci.org.il/new-disclosure-rules-for-olim-and-returning-israelis-effective-1-1-2026/
- English-language CPA content already competing: https://cpa-dray.com/en/blog/olim-tax-2026/ ,
  https://www.nbn.org.il/life-in-israel/finances/taxes/us-tax-compliance/ ,
  https://taxsummaries.pwc.com/israel/individual/other-tax-credits-and-incentives

## Dead ends
- No affiliate / pay-per-lead programme for Israeli tax-refund firms is publicly documented.
  Search returned only generic affiliate-marketing blogs. Any such deal needs a human BD call.
- No open-source Israeli income-tax calculator on GitHub (github search: 0 results).
- No citizen-facing API for filing or checking a refund.
- The refund service itself (the 15-25% money) is closed to us: licensed representation.
