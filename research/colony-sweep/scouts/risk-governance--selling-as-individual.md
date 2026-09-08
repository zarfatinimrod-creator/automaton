# Scout: risk-governance / selling-as-individual
Criterion: Israeli law on an individual selling digital products — registration thresholds,
occasional versus regular income, and the practical enforcement picture.
Date: 2026-09-03. Scout model: Opus 5.

## Evidence conditions (read before trusting anything below)

- **WebSearch budget was already exhausted** at the start of this scout: the first two calls
  returned "this session has used its web search budget (200 of 200 WebSearch calls)". Zero
  searches were available.
- **Every Israeli authority and reference site is EGRESS_BLOCKED.** Confirmed today:
  `https://www.gov.il/he/pages/vat_exempt_dealer`, `https://www.nevo.co.il/law_html/law01/151_001.htm`,
  `https://he.wikipedia.org/wiki/עוסק_פטור`, `https://en.wikipedia.org/wiki/Taxation_in_Israel` — all
  EGRESS_BLOCKED. (A sibling scout also confirmed taxes.gov.il, misim.gov.il, kolzchut.org.il blocked.)
- **What did work:** `github.com` / `raw.githubusercontent.com` via WebFetch, and GitHub code
  search via the github MCP. That turned out to be far more than a consolation prize: a public
  repo mirrors Israeli primary and secondary legislation as Akoma Ntoso XML, so I was able to
  read **statutory text of חוק מס ערך מוסף and תקנות מס ערך מוסף (רישום)** — the actual law, not
  a blog about it.

### Evidence grades used below
- **[STATUTE-MIRROR]** — legislative text read out of a third-party GitHub mirror of Israeli law
  (`nitzba/OCR_Error_Detection_Deep_Learning/LawRepoWiki/...`). The wording is the law's, but the
  snapshot's currency is unverified and the repo is an OCR/ML dataset. Strong on *what the rule is*,
  weak on *what the current numbers are* (see the ₪100,000 problem below).
- **[REPO-CORROBORATED]** — the same fact stated independently in several unrelated GitHub repos
  fetched or search-matched today. Good for numbers, not authoritative.
- **[SNIPPET]** — seen only as a GitHub code-search snippet, not a rendered file.
- **[REPO-SECONDARY]** — prior scout notes already in this repo (earlier sessions).
- My own memory is **not** used as evidence anywhere.

---

## Sources actually used today (2026-09-03)

Statutory mirror (fetched, WebFetch):
1. `https://raw.githubusercontent.com/nitzba/OCR_Error_Detection_Deep_Learning/master/LawRepoWiki/akn/il/act/PrimaryLegislation/1976-01-06/147931/he@/main.xml`
   — חוק מס ערך מוסף, התשל"ו–1975 (definitions in §1).
2. `https://raw.githubusercontent.com/nitzba/OCR_Error_Detection_Deep_Learning/master/LawRepoWiki/akn/il/act/SecondaryLegislation/1976-02-09/100008536/he@/main.xml`
   — תקנות מס ערך מוסף (רישום), התשל"ו–1976.
3. `https://raw.githubusercontent.com/nitzba/OCR_Error_Detection_Deep_Learning/master/LawRepoWiki/akn/il/act/SecondaryLegislation/1976-05-12/100008757/he@/main.xml` (via code search snippet)
   — עסקת אקראי במקרקעין: the buyer pays the tax. Not our case, but it shows the מקרקעין carve-out.

Practitioner corpora (fetched, WebFetch):
4. `https://raw.githubusercontent.com/nm-digitalhub/KALFA-RSVP-React/c426463d15ca29cdd432b8fe28df435edf4e5395/.claude/agents/shared/tax-catalog-israel.md`
5. `https://raw.githubusercontent.com/yonilev2003/countmedemo/main/knowledge/toc.generated.json` and the notes
   `עוסק-פטור-זעיר-מורשה/עוסק-פטור-הגדרה.md`, `עוסק-פטור-זעיר-מורשה/עוסק-זעיר-מסלול-ותנאים.md`,
   `מס-הכנסה/מי-חייב-בהגשת-דוח-שנתי.md`, `מעמ/יצוא-ואפס-מעמ.md`, `מעמ/עונשי-איחור-בדיווח-מעמ.md`
   (all under `https://raw.githubusercontent.com/yonilev2003/countmedemo/main/knowledge/`).
6. `https://raw.githubusercontent.com/skills-il/developer-tools/3469e136d1e0baa269727db380857502008e8e9f/israeli-marketplace-seller/SKILL_HE.md`
   (fetched — turned out to be a chat menu, no tax content; recorded as a dead end).

Code-search snippets seen today (github MCP `search_code`, not rendered):
7. `skills-il/tax-and-finance` → `israeli-freelancer-ops/SKILL_HE.md`, `israeli-freelancer-ops/SKILL.md`,
   `il-invoice-organizer/SKILL_HE.md`, `israeli-tax-returns/SKILL_HE.md`, `cardcom-payment-gateway/SKILL_HE.md`
8. `skills-il/accounting` → `israeli-expense-categorizer/SKILL_HE.md`, `israeli-financial-reports/SKILL_HE.md`
9. `skills-il/developer-tools` → `israeli-postgres-toolkit/scripts/israeli-data-types.sql`
10. `squadcodercom/squadcoder` → `.squadcoder/skills/israeli-freelancer-ops/SKILL_HE.md`
11. `petwashglobal/petwash-marketplace` → `shared/israel-compliance-config.ts`
12. `nm-digitalhub/KALFA-RSVP-React` → `src/lib/data/tax-ceiling.ts`
13. `rabbigab/tloush` → `src/lib/freelanceMode.ts` (**stale outlier**, see below)
14. `matanmalka1/YM_Backend` → `tax_rules_config/app/tax_rules/financials/constants_2025.py`, `constants_2026.py`, `app/vat/...`
15. `tamirSida/ai-cpa`, `amitpo23/cfo`, `YouvalPolacsekCode/Ziggy_PC`, `FDU-INS/Insurance-Skills`, `amirbiron/Markdown-Docs`
16. `hamishpatworldarchive/hamishpatworldarchive.github.io` → `Courses/99202/202-01-Syllabus2003.html`
    — a Hebrew tax-law course syllabus: "2.5.4 **הכנסה מעסקת אקראי בעלת אופי מסחרי - סעיף 2(1) סיפא**".
    Independent confirmation of *where* occasional commercial income sits in the Income Tax Ordinance.

---

## 1. The registration trigger is the START OF ACTIVITY, not a revenue number

**[STATUTE-MIRROR]** תקנות מס ערך מוסף (רישום), תקנה 2:
> "חייב במס ימציא למנהל טופס כאמור בתקנה זו **לא יאוחר מהיום שבו החל בעסקיו או בפעולותיו**."

תקנה 3 allows registering *in advance*, before activity starts.

**[STATUTE-MIRROR]** חוק מע"מ §1 defines:
> "עוסק" – "מי שמוכר נכס או נותן שירות במהלך עסקיו, ובלבד שאינו מלכ"ר או מוסד כספי, **וכן מי שעושה עסקת אקראי**"
> "עסק" – "לרבות מקצוע ומשלח־יד"

This is the single most decision-relevant fact in the whole criterion, and it is the opposite of
the intuition the mission's framing invites. **There is no "sell a little first, register when it
gets real" threshold.** The ceiling (₪122,833) does not decide *whether* to register — it decides
*which status* you register under. Selling a digital product to the public on a continuing basis is
"מכירה במהלך עסקיו" from the first sale.

Consequence for this colony: the owner's registration is a **precondition of shipping a paid
product**, not a milestone to hit later. `docs/INCOME_PLAN.he.md` already says "לפני התשלום הראשון";
the statute text supports that wording exactly.

## 2. The ₪122,833 number, and why it must still be re-verified

**[REPO-CORROBORATED]** ₪122,833 for 2026 (up from ₪120,000 in force 2024–2025) appears
independently in `skills-il/tax-and-finance`, `skills-il/accounting`, `skills-il/developer-tools`,
`squadcodercom/squadcoder`, `petwashglobal/petwash-marketplace`, `nm-digitalhub/KALFA-RSVP-React`,
`FDU-INS/Insurance-Skills` and `yonilev2003/countmedemo`. KALFA's catalogue adds a back-series:
2025 = ₪120,000, 2024 = ₪120,000, 2023 = ₪107,692, 2022 = ₪102,292, and quotes the statutory shape
"...אינו עולה על 122,833 שקלים חדשים לשנה או על סכום גבוה יותר שקבע שר האוצר".

**But the statute mirror I actually read says ₪100,000**, not ₪122,833:
> **[STATUTE-MIRROR]** "עוסק פטור" – "עוסק שמחזור העסקאות שלו בכל עסקיו אינו עולה על **100,000**
> שקלים חדשים לשנה או על סכום גבוה יותר שקבע שר האוצר"

That is not a contradiction — it is the un-updated base figure in an old snapshot, uplifted each
year by order/indexation (KALFA attributes the indexation to §111 of the VAT Law; the countmedemo
note calls the ceiling "צמודה למדד"; `skills-il` warns it is "מתעדכן מעת לעת" and that the Minister
is empowered to raise it, so it should not be assumed to move automatically every January).
**And there is a live stale outlier**: `rabbigab/tloush/src/lib/freelanceMode.ts` carries
`OSEK_PATUR_THRESHOLD_2026 = 120_000` and `VAT_RATE_2026 = 0.17`, both self-labelled
"LAST_VERIFIED_DATE = '2026-04-16'". Two of the SQL toolkits still default to `120000.00`.

**Rule for the colony: never hardcode this number in a shipped product without a dated
verification line next to it.** The exact page a human or unblocked agent must open to close it:
`https://www.kolzchut.org.il/he/עוסק_פטור` and the רשות המסים ceiling page on `misim.gov.il` / `gov.il`.

## 3. Occasional versus regular income — the one real de-minimis, and why it does not save us

This is the heart of the criterion and it has a genuine statutory answer at the VAT level.

**[STATUTE-MIRROR]** חוק מע"מ §1: "עסקת אקראי" – "מכירת טובין או מתן שירות **באקראי**, כשהמכירה או
השירות הם **בעלי אופי מסחרי**; מכירת מקרקעין לעוסק בידי אדם שאין עיסוקו במכירת מקרקעין".

**[STATUTE-MIRROR]** תקנות מע"מ (רישום), תקנה 15א(א):
> "רישומו של מי שעשה עסקת אקראי ואינו חייב להירשם על פי סעיף 52 לחוק לענין עסקאותיו במהלך עסקו,
> יהא **בהודעה למנהל בטופס שקבע המנהל**, שבה יפרט את טיב עסקת האקראי, מועד עשייתה, מחירה, ואם
> העסקה טרם נסתיימה – מחירה הצפוי..."

and the de-minimis, תקנה 15א(ג):
> "היה מחירה של עסקת אקראי **נמוך מהסכום הקובע**, תהא חובת הרישום כאמור בתקנת משנה (א) רק אם בשנת
> המס שבה נעשתה העסקה נעשו בידי אותו עוסק **עסקאות אקראי נוספות, שסך כל מחיריהן יחד עם מחיר אותה
> עסקה היה בסכום הקובע או יותר**... לענין תקנת משנה זו, "הסכום הקובע" – **סכום מחזור העסקאות של
> עוסק זעיר לענין סעיף 31(3) לחוק**."

So the law does have an occasional-transaction lane, and it does have a cumulative annual cut-off.
**Three reasons it is useless to this colony, and they should be stated plainly to the owner:**

1. The lane is defined by the word **"באקראי"**. A product that is listed, priced and continuously
   sold by software is the definition of "במהלך עסקיו", not "באקראי". Selling the same digital
   product 300 times is not 300 occasional transactions.
2. The cut-off is **cumulative across the tax year**, so it cannot be gamed by keeping each sale small.
3. It is a *VAT registration* relief only. **[SNIPPET, countmedemo `מי-חייב-בהגשת-דוח-שנתי`]** income tax
   is separate: anyone with business income files a full annual return (1301) regardless of turnover.
   And **[SNIPPET, hamishpatworldarchive syllabus]** even a one-off commercial deal is taxable income
   under **סעיף 2(1) סיפא לפקודת מס הכנסה** ("הכנסה מעסקת אקראי בעלת אופי מסחרי").
   There is **no hobby allowance**: no source I could reach names any shekel amount of digital-product
   income that is free of income tax.

**Honest gap:** I could not read פקודת מס הכנסה §2(1) itself, only a course syllabus naming it.
Page to open to close this: the Ordinance text on nevo.co.il, or `https://www.kolzchut.org.il/he/הכנסה_מעסק`.

## 4. עסק זעיר — the 2024 track that actually fits a software-run micro line

**[SNIPPET, `skills-il/tax-and-finance/israeli-freelancer-ops/SKILL_HE.md` and the same file mirrored in `squadcodercom/squadcoder`]**:
> "**עסק זעיר:** מסלול שהושק ב-2024 (**סעיפים 87ב עד 87ז לפקודת מס הכנסה, נוספו בתיקון 277**).
> פרילנסרים מתחת לתקרת עוסק פטור יכולים להירשם כעסק זעיר ולקבל **ניכוי הוצאות נורמטיבי של 30%**
> (ללא צורך בקבלות) ודיווח מפושט (**פטור מהדו"ח השנתי למס הכנסה ברוב המקרים**). סייגי זכאות...:
> הוא לא יכול להיות עובד לשעבר של הלקוח שמקבל את החשבונית, ולא יותר מ-**25%** מההכנסה השנתית יכול
> להגיע מצד קשור או ממעסיק לשעבר. התקרה משותפת לעוסק פטור (122,833 ש"ח ל-2026)."

**[FETCHED, countmedemo `עוסק-זעיר-מסלול-ותנאים`]** confirms the shape: personal work only, no
employees, personal-exertion income only (not passive), same ceiling, and a **מגבלת ריכוזיות**
against disguised employment. It also notes the track does **not** defer the duty to convert to
עוסק מורשה on crossing the ceiling.

Why this matters here: a colony selling many small digital products to many unrelated buyers is
the *ideal* עסק זעיר profile — the concentration test that trips up freelancers cannot bite when
income is spread over hundreds of strangers, and the 30% normative deduction needs no receipts,
which is exactly the paperwork an agent cannot generate for the owner. **It is the right structure
for months 1–N while revenue is small, and it is worthless at the mission target**: ₪20,000/month
is ₪240,000/year, roughly double the ceiling. The owner will pass through עוסק פטור/עסק זעיר and
out the other side into עוסק מורשה within the first year of hitting target.

**Honest gap:** I have this only as code-search snippets, from two files that are the same text.
Page to open: `https://www.kolzchut.org.il/he/עסק_זעיר` and תיקון 277 to the Ordinance.

## 5. Crossing the ceiling: the duty is triggered by the FORECAST, not by the money

**[SNIPPET, `skills-il/tax-and-finance/israeli-freelancer-ops/SKILL.md`]**:
> "**Notify BEFORE the invoice that crosses the line.** The duty is triggered by the projection, not
> by the arrival of the money: `ברגע שצופים שההכנסות עד סוף השנה יעברו את התקרה השנתית של העוסק
> הפטור, יש להודיע על כך לרשות המסים ולבקש לשנות את סיווג העסק מעוסק פטור לעוסק מורשה`."
> and: "`אי אפשר לדרוש רטרואקטיבית קיזוז מע"מ על הוצאות שהיו לעסק מתחילת השנה כאשר היה מוגדר כעוסק
> פטור, אלא רק על הוצאות שייווצרו מרגע הפיכתו לעוסק מורשה`."

**[FETCHED, KALFA tax-catalog]** adds the mechanics: **טופס 821** (change of status) + ID + business
docs at the **regional VAT office**; reclassification is retroactive to the date the ceiling was
crossed; mid-year openings pro-rate the ceiling; and — usefully — it explicitly **debunks** the
widespread "you're allowed 25% over until year-end" claim as unfound in any verified source.

**This is directly automatable and is the one place software genuinely protects the owner:** a
running turnover monitor that fires a *forecast* alarm (not a *breach* alarm). Several third-party
repos already implement exactly that (`ai-cpa` `threshold_status`, `YM_Backend`
`vat_data_entry_common.py` with an 80% warning, KALFA `tax-ceiling.ts`, countmedemo
`ניטור-התקדמות-לתקרה`) — evidence the pattern is standard, and evidence the niche is crowded (§8).

## 6. Reporting cadence and the enforcement picture

- **[STATUTE-MIRROR]** תקנה 15: "עוסק הפטור מתשלום המס לפי סעיף 31(3) לחוק... **יצהיר עד ה־31 בינואר
  בכל שנה** על מחזור עסקאותיו בשנה שחלפה." An עוסק פטור files one annual turnover declaration, not
  periodic VAT returns.
- **[SNIPPET, `skills-il/accounting/israeli-financial-reports/SKILL_HE.md`]** עוסק מורשה reports VAT
  **bi-monthly up to ₪1,775,000 annual turnover (2026 figure; ₪1,725,000 in 2025)** and **monthly**
  above it; the separate ₪1.67M figure is the דוח מפורט threshold under §67א, not the frequency threshold.
- **[FETCHED, countmedemo `עונשי-איחור-בדיווח-מעמ`]** late VAT filing carries a fixed penalty **per
  two-week period of delay**, escalating, **plus interest (Bank of Israel rate + margin) and
  index-linkage**; a **"zero" report is still mandatory in inactive periods**; and repeated
  non-filing "exposes businesses to deeper tax authority audits and may negatively affect future
  income tax advance-payment rates based on compliance history." The exact shekel amounts are
  system-published and were not obtainable.
- **[SNIPPET, `skills-il/tax-and-finance/israeli-tax-returns/SKILL_HE.md`]** the annual-return duty
  is set by **תקנות מס הכנסה (פטור מהגשת דין וחשבון), 1988, under §131(א)**, and **עצמאים (עוסק
  מורשה או עוסק פטור) are listed first among those who must file 1301** — i.e. self-employment
  removes the filing exemption outright, with no turnover floor.
- **[FETCHED, KALFA tax-catalog, SECONDARY]** claims issuing a tax invoice without authority is a
  criminal offence carrying **up to one year imprisonment under §117(א)(5) of the VAT Law**. My own
  attempt to read §52 and §117 out of the statute mirror came back paraphrased and unreliable, so
  **I am not asserting the §117 wording**. Directionally: non-registration and unauthorised invoicing
  sit in the criminal chapter, not the administrative one. Page to open: חוק מע"מ §117 on nevo.co.il.
- **What I could NOT establish at all: the *practical* enforcement picture.** No data on audit rates
  for micro digital sellers, no evidence about whether/how רשות המסים receives data from foreign
  platforms (Paddle, Apify, Telegram, PayPal, Payoneer) or from Israeli payment apps, and no
  retroactive-assessment case material. Two targeted GitHub searches for this returned **zero results**.
  Treat "nobody checks" as **unknown and unsafe**, never as a finding.

## 7. Invoice allocation numbers (מודל חשבוניות ישראל) — mostly out of scope, but know the number

**[SNIPPET, `skills-il/accounting/israeli-expense-categorizer/SKILL_HE.md`, corroborated by
`skills-il/tax-and-finance/cardcom-payment-gateway/SKILL_HE.md` and `il-invoice-organizer/references/expense-categories.md`]**
thresholds **before VAT**: ₪25,000 from May 2024 → ₪20,000 from Jan 2025 → ₪10,000 from Jan 2026 →
**₪5,000 from June 2026 (in force now)**; the categorizer quotes §38(א1) — "לא יותר ניכוי מס
התשומות הכלול בחשבונית מס שסכומה, בלא המס, עולה על 5,000 שקלים חדשים... ושאינה כוללת מספר שהקצה לה
המנהל" — with the seller-side duty in §47(א2)(1), and notes the rule bites only on invoices carrying
a VAT component to an עוסק מורשה buyer, and that "עולה על" means an invoice exactly at the line is
out of scope.

Relevance: our four shipped lines are micro-B2C exports, so allocation numbers are **not** a
day-one blocker. They become one the first time the colony invoices an Israeli business more than
₪5,000 — e.g. a B2B API contract or a sponsorship. **[REPO-SECONDARY]** the allocation API is
machine-callable (`dsaddan/Israel-Tax-Authority-OpenAPI-Taxes-Demo`), but enrolment is identity-bound.

## 8. Competition note: the "Israeli freelancer tax tracker" niche is already crowded

Ceiling-monitoring and Israeli-tax-rule tooling is being built by many people right now:
`yonilev2003/countmedemo` (a full Hebrew knowledge vault + agent), `tamirSida/ai-cpa`,
`amitpo23/cfo`, `matanmalka1/YM_Backend` (year-versioned constants files for 2025 and 2026),
`rabbigab/tloush`, `petwashglobal/petwash-marketplace`, `nm-digitalhub/KALFA-RSVP-React`,
`YouvalPolacsekCode/Ziggy_PC`, plus at least four `skills-il/*` skill packs and their mirrors in
`squadcodercom/squadcoder`, `FDU-INS/Insurance-Skills`, `amirbiron/Markdown-Docs`. Most are
2026-vintage, zero-to-few stars, and none demonstrates revenue. Read as demand signal: **weak**
(builders, not buyers). Read as competition signal for a paid Israeli tax calculator: **crowded and
undifferentiated**, which is consistent with `products/il-biz-tools` keeping its calculators free.

---

## Owner blockers (one-time, human, unavoidable — none of these is assumed done)

1. **Register before the first paid sale, not after.** תקנה 2 requires the form "לא יאוחר מהיום שבו
   החל בעסקיו"; תקנה 3 permits registering in advance. Online self-registration is possible
   **[REPO-SECONDARY]**.
2. **Choose the status deliberately**: עוסק פטור, or עוסק פטור **+ עסק זעיר** (30% normative
   deduction, simplified reporting) while under ₪122,833/yr. Only the owner can register.
3. **ביטוח לאומי registration as עצמאי** — separate from the VAT status **[REPO-SECONDARY]**;
   `skills-il/israeli-pension-advisor` **[SNIPPET]** notes the first business year is exempt from
   מס יסף-adjacent duties and that liability is on net taxable income, not turnover.
4. **One accountant conversation, on exactly four questions:** (a) does עסק זעיר fit an agent-run
   digital-product line, given "יגיעה אישית" and the no-employees condition when the work is done by
   software? (b) zero-rating of digital exports where Paddle is Merchant of Record; (c) the timing of
   the עוסק מורשה switch given a ₪240,000/yr target and the *forecast-based* notification duty;
   (d) whether any past unreported income exists that needs regularising before the first shipped sale.
5. **Diary the two hard dates**: 31 January (הצהרת עוסק פטור for the previous year) and, once עוסק
   מורשה, the bi-monthly VAT cycle — including **zero reports in dead months**.

## Dead ends (report them so the colony does not re-search)

- **`skills-il/developer-tools/israeli-marketplace-seller/SKILL_HE.md`** looked exactly on-criterion
  and is not: fetched in full, it is a chat menu for listing products on זאפ/יד2/Facebook Marketplace.
  Zero tax content.
- **Enforcement statistics do not exist in any source I could reach.** Two GitHub searches aimed at
  ITA information demands / platform reporting / penalties returned **zero results**. This is the
  criterion's one genuinely unclosed half and it needs a session with WebSearch.
- **There is no product in this criterion.** Tax content is a trust business; an anonymous,
  agent-run site issuing Israeli tax positions would breach the constitution's "no deceiving a
  buyer" even where legal, and §8 shows the calculator niche is crowded and unpaid. The correct
  output of this criterion is a **checklist and a monitor**, not a revenue line. Monthly ceiling as
  a business: **₪0**.
- **"Sell first, register later" is not an available strategy.** It is not a grey area to be
  optimised; it is a registration offence with a criminal chapter attached, and the payment rails
  make it possible only on foreign platforms — which is precisely where the compliance debt accrues
  silently. Marked **RED**; never recommend it.
