# Scout: payment-rails / israeli-tax-registration
Date: 2026-09-03. Scout model: Opus 5.

## Evidence conditions this session (read this before trusting anything below)

**This scout could not gather primary evidence.** Two hard constraints hit immediately:

1. **WebSearch budget was already exhausted** when this scout started: the very first call
   returned "this session has used its web search budget (200 of 200 WebSearch calls)".
   Zero searches were available to me.
2. **WebFetch is blocked for every Israeli authority and reference site.** Attempted and
   confirmed `EGRESS_BLOCKED` on 2026-09-03:
   - https://www.gov.il/he/service/opening-a-file-vat → EGRESS_BLOCKED
   - https://www.misim.gov.il/ → EGRESS_BLOCKED
   - https://taxes.gov.il/ → EGRESS_BLOCKED
   - https://www.kolzchut.org.il/he/עוסק_פטור → EGRESS_BLOCKED

So: **no gov.il, no רשות המסים, no כל-זכות page was rendered.** Everything below rests on
(a) two github.com sources I actually fetched/queried today, and (b) prior scout notes already
committed in this repo, which themselves cite URLs but were gathered in earlier sessions.
Prior repo notes are marked **[repo-secondary]**. My own memory is not used as evidence anywhere.

**Every number in this file must be re-verified against a rendered רשות המסים page before the
owner acts on it.** The single most important number — the עוסק פטור ceiling — appears in this
repo as ₪122,833 for 2026 in three places, and as "~₪120,000 (2024 figure)" in a fourth. That
inconsistency is exactly why it must be re-checked, not quoted.

## Sources actually fetched today (strong, but narrow)
- https://github.com/dsaddan/Israel-Tax-Authority-OpenAPI-Taxes-Demo — fetched 2026-09-03.
  Repo metadata + README render: "A demo for the OpenAPI and Invoice Number Allocation of the
  Israel Tax Authority", a C# MVC demo walking through *system registration → Authorization
  Code → Access Token → submit sample invoice*. Topics: `invoice-number-allocation`,
  `israel-tax-authority`. Last updated 2025-06-23. It points at `demo.open-api.co.il`
  (not fetchable from here). This is direct, dated evidence that the **מודל חשבוניות ישראל /
  invoice allocation-number API exists, is OAuth-style, and is machine-callable.** It is NOT
  evidence of thresholds or effective dates — the README does not state them.
- GitHub code search (mcp github, 2026-09-03) for Israeli invoicing/VAT tooling returned an
  almost empty field: only https://github.com/peleg-jpg/israeli-receipt-scanner ,
  https://github.com/peleg-jpg/il-invoice-organizer , https://github.com/peleg-jpg/n8n-hebrew-workflows
  (all created 2026-05-11, 0 stars, look like AI-generated skill stubs). **Weak evidence**, and
  only of interest as a demand signal: someone bothered to write "Osek Murshe/Patur recognition,
  VAT 1/6 extraction, Tax Authority expense categories" tooling. Zero stars = no proven demand.

## [repo-secondary] What prior scouts in this repo already established
- `research/colony-sweep/scouts/payment-rails--stripe-alternatives.md`: **no Israeli payment
  gateway found sells to an unregistered private person.** Snippet quoted there from Tranzila /
  Isracard: "אדם פרטי אזרח ישראלי שהינו עצמאי, עוסק פטור או עוסק מורשה, המנהל חשבון בנק בתאגיד
  בנקאי בישראל יכול להשתמש בפתרון...", and Isracard stricter: "...עוסק פטור או עוסק מורשה **בעל
  תיק במע"מ**." URLs to open: https://www.tranzila.com/עוסק-פטור/ ,
  https://marketing.isracard.co.il/biz-account/
- Same file: **a חברה בע"מ is NOT required.** עוסק פטור is enough to start; crossing the ceiling
  is a tax-registration step, not an incorporation step.
- `research/colony-sweep/scouts/storefronts--etsy-digital.md`: "VAT-exempt status (עוסק פטור)
  applies only to VAT and does not remove income-tax/Bituach Leumi duty; 2026 עוסק פטור turnover
  ceiling ₪122,833." URLs to open: https://www.kolzchut.org.il/he/עוסק_פטור ,
  https://www.din.co.il/articles/4211/B-22028/ , https://alfie.co.il/income-tax-vat-and-ecommerce/
- `research/tiktok/01-monetization-israel.md` §6: Israeli law requires anyone carrying on
  income-producing activity to open a **תיק עוסק** at מס הכנסה and register for מע"מ; **עוסק
  פטור registration can be done online** without an office visit. Also: at ₪20,000/month =
  ₪240,000/year the owner is **above any plausible עוסק פטור ceiling → עוסק מורשה with periodic
  מע"מ reporting**. URL to open: https://www.kolzchut.org.il/he/פתיחת_תיק_עוסק_במס_הכנסה
- `docs/INCOME_PLAN.he.md` line 17 and line 70 already encode this as owner work:
  "עוסק פטור — תקרה ₪122,833 לשנת 2026, רישום עצמאי אונליין ברשות המסים, דיווח שנתי... אין צורך
  בעורך דין; רואה חשבון הוא בחירה, לא חובה" and "רישום עצמאי באתר רשות המסים **לפני התשלום
  הראשון**."

## The four questions in my criterion — what I can and cannot answer

### Q1. When must an Israeli individual register as עוסק פטור / עוסק מורשה?
**Answerable in substance, not in exact numbers from this session.** Substance: registration is
tied to *carrying on a business*, not to crossing a revenue number — the ceiling only decides
*which* status. Practically the gateways force the question anyway (Q4). The exact 2026 ceiling
and the "when in the year" mechanics are **UNVERIFIED here**. Open:
https://www.gov.il/he/service/opening-a-file-vat and https://www.kolzchut.org.il/he/עוסק_פטור

### Q2. VAT treatment of digital exports (services/software sold to non-Israeli customers)
**NOT ESTABLISHED THIS SESSION.** I could render nothing on מע"מ בשיעור אפס / סעיף 30(א)(5)
and I will not state a rule from memory. This is the highest-value open item in my criterion
because all four shipped products (Paddle, Telegram Stars, Apify, x402) are *exports*, and
zero-rating vs 18% changes the net take on every shekel. Exact pages a human/unblocked agent
must open:
- https://www.gov.il/he/departments/general/vat-rate (VAT rate)
- חוק מס ערך מוסף סעיף 30(א)(5) and (א)(7) text, e.g. via https://www.nevo.co.il or
  https://www.kolzchut.org.il/he/מע"מ_בשיעור_אפס
- The specific trap to ask an accountant about: **a "service to a foreign resident" is
  zero-rated only if an Israeli resident is not also a beneficiary of the service** — this
  carve-out is where digital-export zero-rating usually breaks. Treat as a question, not a fact.
- Second trap, also unverified: Paddle is Merchant of Record. Who is the owner's *customer* for
  VAT purposes — Paddle (a UK/foreign entity) or the end user (possibly Israeli)? This determines
  zero-rating on the same revenue. **Must be settled by an accountant, not by an agent.**

### Q3. Income reporting duties
**[repo-secondary] only.** Established: עוסק פטור status is a *VAT* status and does not remove
income-tax or ביטוח לאומי duty; annual reporting for עוסק פטור, periodic (monthly/bi-monthly)
מע"מ reporting once עוסק מורשה. Frequency thresholds, advance-payments (מקדמות) rates and the
ביטוח לאומי brackets are **not verified here**.

### Q4. What happens if revenue arrives before registration? — **the actual blocker**
This is where my criterion earns its keep, and the answer is sharper than the tax law itself:

**The payment rails refuse to onboard an unregistered person in the first place, so in practice
"revenue before registration" mostly cannot happen on Israeli rails — it can only happen on
foreign rails (Paddle, Apify, Telegram Stars, x402/crypto), and that is the dangerous case.**
[repo-secondary, Tranzila/Isracard snippets above.] Foreign platforms will happily pay an
Israeli individual with no תיק עוסק; the money lands, and the compliance debt (unreported
business income, un-issued invoices, retroactive VAT) accrues silently.

I could not verify the penalty regime (retroactive registration date, קנסות, ריבית והצמדה) from
any renderable source. **Unknown, and it must not be guessed.** The safe operating rule, which
follows from the mission's own constitution rather than from a fetched page: **register before
the first payout is enabled, not after the first shekel arrives.** `docs/INCOME_PLAN.he.md`
already says exactly this ("לפני התשלום הראשון") and nothing I found today contradicts it.

## Owner blockers (one-time, human, unavoidable — do NOT assume any are done)
1. Open תיק עוסק at מס הכנסה + register for מע"מ (עוסק פטור to start), online, with ת"ז.
2. Choose/obtain the status the rails demand: Isracard-type accounts want **תיק במע"מ** explicitly.
3. Register at ביטוח לאומי as עצמאי (implied by [repo-secondary]; not verified today).
4. One conversation with an accountant on exactly two questions: (a) zero-rating of digital
   exports under §30(א)(5) given a Merchant-of-Record like Paddle; (b) when the עוסק מורשה
   switch must happen given a ₪20k/month target. This is the one human step no agent can take,
   and it is cheap relative to being wrong.
5. Later, at scale: **מודל חשבוניות ישראל** allocation numbers for invoices above the threshold —
   API exists and is automatable (github evidence above), but enrolment is identity-bound.

## Dead ends / what this criterion does NOT yield
- **No sellable product falls out of the tax rules themselves for this operator.** Tax advice is
  a regulated-adjacent trust business; an anonymous agent-run site giving Israeli tax rulings is
  a constitution problem (deceiving a buyer about who is behind the advice) even where it is
  legal. Calculators that state the rules neutrally are fine — that is already shipped in
  products/il-biz-tools.
- **This criterion is a gate, not a revenue line.** Its correct output is a checklist, not a
  product. Monthly ceiling for the criterion as a business = ₪0.
- Searching was impossible this session; do not read "few findings" as "criterion is empty".
  The criterion is *live and unclosed* — it needs one session with a working WebSearch budget
  and, ideally, an unblocked fetch of gov.il.
