# Scout notes — israel-bureaucracy / allocation-numbers

Criterion: **Israel Invoices / allocation numbers (חשבוניות ישראל, מספר הקצאה)** — the 2026
threshold timeline, who is affected, which tools exist today, what is missing, and whether
anyone would pay for tooling around it.

Scout: WORKER-SCOUT "allocation-numbers" · date of research: **2026-09-03**
Search budget spent: **12 WebSearch calls** (of a shared ~200). GitHub code/repo search used
heavily instead — it is free and renders primary text.

---

## 0. Evidence grading used below

- **[RENDERED]** — file content returned verbatim by GitHub code search or a successful fetch. Strong.
- **[SNIPPET]** — WebSearch result summary quoting a page I could not open. Weaker; the URL to open is named.
- **[BLOCKED]** — I tried to fetch and the egress proxy refused. Listed so a human/unblocked agent can close it.

Nothing below rests on my own memory.

---

## 1. The threshold timeline (the core fact) — HIGH confidence

Two independent classes of source agree exactly.

**[RENDERED]** `skills-il/tax-and-finance` → `il-invoice-organizer/references/domain-checklist.md`:

> SHAAM allocation number (מספר הקצאה) required above the issue-date threshold (25k from
> 5-May-2024 / 20k 2025 / 10k Jan-2026 / 5k Jun-2026; 5,000 is the terminal step and nothing
> below it is legislated). Keyed to the invoice ISSUE date.

**[RENDERED]** `squadcodercom/squadcoder` → `.squadcoder/skills/il-invoice-organizer/SKILL.md`:

> | 1 Jan 2026 to 31 May 2026 | NIS 10,000 |
> | From 1 Jun 2026 | NIS 5,000 (permanent floor) |

**[RENDERED]** `skills-il/accounting` → `gws-israeli-business-sheets/SKILL.md`:

> The threshold in force is NIS 5,000 (before VAT) from June 2026 ... NIS 25,000 from May 2024,
> NIS 20,000 from January 2025, NIS 10,000 from January 2026, NIS 5,000 from June 2026, and
> nothing at all before May 2024.

**[SNIPPET]** Sovos / VATupdate / EDICOM (2026-04-12 and 2025-12-10 posts):
> "The NIS 15,000 threshold will be skipped ... NIS 10,000 (approx. €2,500) or more from
> 1 January 2026, and for invoices of NIS 5,000 (approx. €1,250) or more from 1 June 2026."
> Instrument named: **VAT Implementation Order 01/2025**.

**[SNIPPET]** Hebrew vendor guides (Invoice4u, Green Invoice/Morning, iCount, Hyp, grow.business),
all updated 2026: same ladder, "נכון לאוגוסט 2026 ... מעל 5,000 ש\"ח (לפני מע\"מ)".

Timeline is therefore **settled and terminal**. Consequence for the colony: *there is no
upcoming deadline to sell against*. The last step-down already happened on 1 June 2026,
three months before this research. The urgency window closed.

### Legal mechanics (matters, and is commonly misstated)

**[RENDERED]** `skills-il/tax-and-finance` → `israeli-price-quote-generator/SKILL.md`:

> - The allocation number gates the **buyer's input-VAT deduction**, not the invoice's validity.
>   An invoice issued without one is not void; the issuer still reports and remits the output VAT.
>   The loss falls on the customer, who cannot offset the VAT.
> - The number can be requested **retroactively up to a year** from issuance (past six months a
>   deferral application is also needed).

**[RENDERED]** `skills-il/accounting` → `green-invoice/SKILL.md`:
> The statute says `עולה על` (exceeds), so an invoice at exactly the threshold is outside it.
> The number is 9 digits, and a missing one blocks the recipient's deduction without voiding the invoice.

**[RENDERED]** `skills-il/accounting` → `israeli-e-invoice/optimization-log.json` — a useful
negative: an earlier version of that skill cited a **fabricated "Amendment 157"**; the real basis
is *the Economic Arrangements Law 2023-2024 amending VAT Law §47 (allocation duty) + §38
(input-VAT deduction condition)*. Treat any source citing "Amendment 157" as unreliable.
**[SNIPPET]** Hebrew CPA pages state it as **סעיף 38(א1) לחוק מע"מ**.

### Who is affected

**[SNIPPET]** Invoice4u / Green Invoice, 2026: "הרפורמה רלוונטית לכל עסק שמפיק חשבוניות מס או
חשבוניות מס קבלה: עוסקים מורשים, שותפויות וחברות בע״מ." Osek Patur is **out** (issues receipts,
no VAT). At a 5,000 ₪ floor this now touches essentially every B2B osek murshe in the country.
I found **no reliable count** of affected businesses — the Knesset MMM paper
<https://fs.knesset.gov.il/globaldocs/MMM/36f0e7a9-79e3-ed11-8157-005056aac6c3/2_36f0e7a9-79e3-ed11-8157-005056aac6c3_11_20075.pdf>
is the place to look and I could not open it. **Market size = unknown.**

---

## 2. The API surface — HIGH confidence, fully mapped for free

**[RENDERED]** `skills-il/accounting` → `israeli-e-invoice/references/shaam-api-reference.md`:

| Service | Sandbox | Production |
|---|---|---|
| Allocation (single) | `POST https://ita-api.taxes.gov.il/shaam/tsandbox/Invoices/v2/Approval` | `POST https://ita-api.taxes.gov.il/shaam/production/Invoices/v2/Approval` |
| Allocation (batch) | `POST .../shaam/tsandbox/Multi-invoices/v2/MultiApproval` | `POST .../shaam/production/Multi-invoices/v2/MultiApproval` |
| Lookup by allocation # | `GET https://ita-api.taxes.gov.il/shaam/tsandbox/invoice-information/v1/details` | `GET https://openapi.taxes.gov.il/shaam/production/invoice-information/v1/details` |

> This split is real: the allocation request runs on `ita-api.taxes.gov.il`, while the OAuth token
> exchange and the lookup endpoints run on `openapi.taxes.gov.il`.

**[RENDERED]** `thebarlev/app.ux` → `lib/shaam/config.ts` — an independent team hitting exactly
that trap:
> An earlier version of this file assumed there was and normalised everything onto
> openapi.taxes.gov.il — which sent the allocation request to a URL that does not exist and
> broke the sandbox outright.

**[RENDERED]** `skills-il/accounting` → `israeli-e-invoice/evidence.json`: OAuth2 **User Restricted**
token at `https://openapi.taxes.gov.il/shaam/{tsandbox|production}/longtimetoken/oauth2/token`;
allocation number returned in the **`confirmation_number`** response field; auth manual at
`https://secapp.taxes.gov.il/OpenApiUserGuide/OpenApiUserGuide.pdf`; official ITA demo repo
<https://github.com/dsaddan/Israel-Tax-Authority-OpenAPI-Taxes-Demo>. Cites
<https://assets.kpmg.com/content/dam/kpmg/il/pdf/vat_software-houses-ENG.pdf> (fetched 2026-08-18).

Other real integrations found on GitHub (all **[RENDERED]**):
- `BillRun/system` → `application/plugins/israelInvoice.php` (production billing platform, PHP)
- `TaxMyself-dev/TaxMyself` → `backend/src/shaam/shaam.constants.ts`
- `Lio311/budget-manager-plus` → `docs/plans/2026-06-29-ita-allocation-number-design.md` + `src/app/api/ita/connect/route.ts`
- `RcBuilder/Scripts` → `CODE/TaxesIL API/TaxesILManager.cs` (notes `openapi.../tsandbox` "deprecated on 01.01.2024", replaced by `ita-api...`)
- `ISRTaxesOpenAPI/nodeJSExample`, `ISRTaxesOpenAPI/uni-struct-file` (ITA-adjacent org)
- `slatecoil/app` — "Slate is an invoicing and billing platform built specifically for Israeli
  businesses ... direct integration with Israel Tax Authority's allocation-number system"

**Conclusion:** the API is documented, sandboxed, and already integrated by many parties.
Nothing about it is secret or hard to discover. The moat is not knowledge.

---

## 3. The hard gate: production API access — THE decisive finding

**[SNIPPET]** from <https://openapi-portal.taxes.gov.il/shaam/production/node/3> ("Using our APIs"),
surfaced via WebSearch on 2026-09-03:

> Using the ITA services in the production environment is subject to authorization from the ITA,
> and authorized users can sign up their organization in the developers' portal. As part of the
> sign-up process, you'll need to submit **signed registration documents** available in the portal.
> After sign-up, the organization's request is **reviewed**, and a notice of confirmation/denial is
> sent by email. **Only users who signed up to the sandbox portal will get approved to production.**
> **Only users who signed up using their ID number** can access the developers' portal.

**[SNIPPET]** gov.il, "בקשה לרישום תוכנה המיועדת לניהול מערכת חשבונות ממוחשבת"
<https://www.gov.il/he/service/registration-software-designed-managing-computerized-accounting-system>
— corporations must register company details and grant digital authorization to users through
רשות המסים's הרשאות דיגיטליות system.

**[BLOCKED]** I could not render either page:
- `https://openapi-portal.taxes.gov.il/shaam/production/node/3` → EGRESS_BLOCKED
- `https://www.gov.il/he/service/registration-software-designed-managing-computerized-accounting-system` → EGRESS_BLOCKED
- `https://developer-guide.sovos.com/wp-content/uploads/2023/10/ENG-official-OpenApiUserGuide.pdf` → EGRESS_BLOCKED

**URLs a human or unblocked agent must open to close this:** the three above, plus
<https://secapp.taxes.gov.il/OpenApiUserGuide/OpenApiUserGuide.pdf> and
<https://www.gov.il/BlobFolder/service/connect-to-shaam/he/Service_Pages_shaam_connection-work-process-software-houses.pdf>.

**Why this is decisive under MISSION.md.** Every product that *calls* the allocation or
verification API requires: (a) a human signing up with an Israeli ID number, (b) signing and
submitting registration documents, (c) waiting for ITA review and approval, and plausibly
(d) registration in the מרשם תוכנות software registry. That is materially more than the
"one-time identity/KYC/payout step" MISSION allows as an unavoidable exception — it is a
discretionary regulatory approval of an unknown duration with an unknown denial rate, and the
owner does not do manual ops. **Every API-calling idea in this criterion inherits this blocker.**

---

## 4. Competition — dense, incumbent, and already priced

**[SNIPPET]** Rivhit, "מודולים למפתחים מול רשות המיסים"
<https://www.rivhit.co.il/מודולים-למפתחים-מול-רשות-המיסים/> — **199 ₪ + VAT / month**, 30-day
free trial, up to **2,000 operations/month**, then **0.0625 ₪ + VAT per extra operation**.
Included free inside Rivhit's own accounting product.

Other Israeli vendors selling Israel-Invoice API middleware or built-in allocation:
- Apoint — "ממשק API לחשבונית ישראל עבור בתי תוכנה" <https://www.apoint.co.il/ראשי/פיתוח-ושירותים/חשבונית-ישראל-api/>
- Medform — <https://medform.co.il/invoice-api/> (explicitly covers **supplier-side retrieval/verification** of the allocation number, token per company)
- Hashavshevet H-ERP — <https://www.h-erp.co.il/israel-invoice/>
- Green Invoice / Morning, iCount, Invoice4u, Cardcom, Hyp — all attach the number inside their own products.

**[RENDERED]** `skills-il/accounting` → `green-invoice/SKILL.md` names a genuine UX trap:
> Morning attaches the allocation number automatically, **BUT ONLY AFTER a one-time authorization
> grant in the user's Morning account.** This is NOT automatic on signup.

**[SNIPPET]** iCount: "approximately 60,000 businesses", plans from 9.90 ₪/month
<https://www.icount.co.il/plans/>. That is the price ceiling for anything invoicing-adjacent
sold to an Israeli micro-business.

**And the government competes for free.** Two official ITA services:
- request an allocation number manually: <https://www.gov.il/he/service/request-assignment-number-for-tax-invoice>
- **verify a supplier invoice against the allocation number**: <https://www.gov.il/he/service/verify-vendor-invoice-information>
  — "שירות זה מאפשר לעוסקים ולכל מי שקיבלו מהם הרשאה, לאמת על סמך מספר הקצאה, שנתוני חשבונית הספק
  תואמים לנתונים שהספק דיווח לרשות המסים." **[SNIPPET]**
- FAQ: <https://www.gov.il/he/pages/faq_israel_invoice>

So the buyer-side verification idea competes with a free government web service for the
single-invoice case; only *bulk* adds value, and bulk needs the gated API.

---

## 5. What is genuinely missing

1. **No open-source SDK.** GitHub repo search for `shaam invoice israel sdk allocation number npm`
   returned **0 results**; `israel invoice allocation number tax authority` returned only **4** repos,
   the largest with **2 stars**. There is no `npm i shaam-invoice`. Real gap — with no money in it.
2. **Buyer-side (accounts-payable) bulk verification** is thinly served relative to seller-side
   issuance. Medform mentions it; nobody markets it as a product.
3. **A correct, date-keyed threshold reference.** Almost every vendor page states one number and
   is stale within months; the skill files above are the only sources I found that key the
   threshold to the *invoice issue date* across the full ladder and note the `עולה על` strictness
   and the 1-year retroactive window.

## 6. What is NOT missing

Agent/LLM skills for this domain. Already free and plentiful on GitHub: `skills-il/accounting`
(`israeli-e-invoice`, `green-invoice`, `israeli-receipt-scanner`, `gws-israeli-business-sheets`),
`skills-il/tax-and-finance` (`il-invoice-organizer`, `israeli-price-quote-generator`),
`openaccountants/openaccountants` (`il-freelancer-ops`), `peleg-jpg/*-israeli-e-invoice`,
`amitpo23/cfo`, `squadcodercom/squadcoder`. Shipping another one earns nothing.

---

## 7. Payability to Israel

**YES** for anything sold through the rails the colony already uses. **[RENDERED]** from this
repo, `products/il-biz-tools/README.md`:
> **Paddle** (merchant of record; supports Israeli individuals): sign up at paddle.com, complete
> [KYC] ... **צעדים שרק הבעלים יכול לבצע:** פתיחת חשבון Paddle (KYC + פרטי משיכה ל-Payoneer/בנק)

Payability is not the binding constraint in this criterion. **ITA production API approval is.**

---

## 8. Findings, honestly ranked

See structured output. Summary of the verdict: **this criterion is a knowledge-rich, revenue-poor
home-turf topic.** The facts are easy and free to establish; the money sits behind a government
approval gate the owner cannot pass without doing manual work, and behind incumbents (Rivhit at
199 ₪/mo, plus every invoicing SaaS in the country) who already passed it. The one thing a
software-only operation can ship inside 40 hours — a correct date-keyed threshold checker —
is worth building for credibility and SEO adjacency to `il-biz-tools`, not for revenue.

---

## 9. Every URL touched

Fetched successfully (GitHub API / code search, RENDERED):
- https://github.com/skills-il/accounting — `israeli-e-invoice/references/shaam-api-reference.md`, `israeli-e-invoice/evidence.json`, `israeli-e-invoice/optimization-log.json`, `israeli-e-invoice/SKILL_HE.md`, `green-invoice/SKILL.md`, `gws-israeli-business-sheets/SKILL.md`, `israeli-receipt-scanner/SKILL.md`, `israeli-receipt-scanner/references/domain-checklist.md`
- https://github.com/skills-il/tax-and-finance — `il-invoice-organizer/SKILL.md`, `il-invoice-organizer/references/domain-checklist.md`, `israeli-price-quote-generator/SKILL.md`, `israeli-price-quote-generator/references/domain-checklist.md`
- https://github.com/openaccountants/openaccountants — `agent-skills/il-freelancer-ops/SKILL.md`, `packages/israel/il-freelancer-ops.md`
- https://github.com/thebarlev/app.ux — `lib/shaam/config.ts`
- https://github.com/TaxMyself-dev/TaxMyself — `backend/src/shaam/shaam.constants.ts`
- https://github.com/Lio311/budget-manager-plus — `docs/plans/2026-06-29-ita-allocation-number-design.md`, `src/app/api/ita/connect/route.ts`
- https://github.com/RcBuilder/Scripts — `CODE/TaxesIL API/TaxesILManager.cs`
- https://github.com/BillRun/system — `application/plugins/israelInvoice.php`
- https://github.com/dsaddan/Israel-Tax-Authority-OpenAPI-Taxes-Demo
- https://github.com/ISRTaxesOpenAPI/nodeJSExample , https://github.com/ISRTaxesOpenAPI/uni-struct-file
- https://github.com/slatecoil/app , https://github.com/peleg-jpg/tax-and-finance-israeli-e-invoice , https://github.com/amitpo23/cfo , https://github.com/squadcodercom/squadcoder
- (local) /home/user/automaton/products/il-biz-tools/README.md

Seen as search snippets only (NOT rendered — must be opened to confirm):
- https://openapi-portal.taxes.gov.il/shaam/production/node/3 · https://openapi-portal.taxes.gov.il/sandbox/
- https://www.gov.il/he/service/verify-vendor-invoice-information
- https://www.gov.il/he/service/request-assignment-number-for-tax-invoice
- https://www.gov.il/he/service/registration-software-designed-managing-computerized-accounting-system
- https://www.gov.il/he/pages/faq_israel_invoice · https://www.gov.il/he/departments/targetaudience/taxes-adience-software
- https://www.gov.il/BlobFolder/service/connect-to-shaam/he/Service_Pages_shaam_connection-work-process-software-houses.pdf
- https://www.gov.il/BlobFolder/generalpage/israel-invoice-160723/he/IncomeTax_software-houses-050623.pdf
- https://sovos.com/regulatory-updates/vat/israel-tax-authority-confirms-accelerated-timeline-for-ctc-invoice-allocation-number/
- https://www.vatupdate.com/2026/04/12/israel-to-lower-invoice-allocation-number-thresholds-further-in-2026-for-real-time-tax-compliance/
- https://www.vatupdate.com/2025/12/10/israel-accelerates-ctc-invoice-allocation-number-rollout-lower-thresholds-effective-2026/
- https://edicomgroup.com/blog/israel-electronic-invoice-clearance-model
- https://www.rivhit.co.il/מודולים-למפתחים-מול-רשות-המיסים/ · https://www.rivhit.co.il/פתרונות-api-לבתי-תוכנה-ולמפתחים/ · https://www.rivhit.co.il/חשבוניות-ישראל-ומספר-הקצאה/
- https://www.apoint.co.il/ראשי/פיתוח-ושירותים/חשבונית-ישראל-api/ · https://medform.co.il/invoice-api/ · https://www.h-erp.co.il/israel-invoice/
- https://www.greeninvoice.co.il/magazine/israel-invoice/ · https://www.icount.co.il/blog/invoice-israel/ · https://www.icount.co.il/plans/
- https://www.invoice4u.co.il/blog/... (three allocation-number posts) · https://hyp.co.il/blog/israel-invoices/ · https://grow.business/israel-invoice/
- https://www.cardcom.solutions/... · https://cpa-dray.com/he/blog/חשבוניות-ישראל/ · https://hgj.co.il/מספר-הקצאה-לחשבונית-2026/ · https://www.keren-law.co.il/הקצאת-מספרי-חשבוניות/ · https://bitancpa.com/knowledge/...
- https://www.chamber.org.il/serviceslobby/finance/1427/146310/ · https://aci.org.il/knowledge/allocation-number-input-tax-2026/
- https://fs.knesset.gov.il/globaldocs/MMM/36f0e7a9-79e3-ed11-8157-005056aac6c3/2_36f0e7a9-79e3-ed11-8157-005056aac6c3_11_20075.pdf
- https://assets.kpmg.com/content/dam/kpmg/il/pdf/vat_software-houses-ENG.pdf
- https://secapp.taxes.gov.il/OpenApiUserGuide/OpenApiUserGuide.pdf

Confirmed EGRESS_BLOCKED this session: www.gov.il, openapi-portal.taxes.gov.il, developer-guide.sovos.com,
raw.githubusercontent.com (404 on the path tried; github.com API search worked instead).
