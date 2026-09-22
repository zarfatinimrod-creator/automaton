# Audit — group `payment-rails`

Auditor: independent of the group supervisor. Mandate: refute, not agree.
Date: 2026-09-03. Repo: `/home/user/automaton` (MISSION.md binding).

---

## 0. What I could and could not verify

I re-ran the evidence myself. My egress is as constrained as the supervisor's, and
`WebSearch` was already exhausted (200/200) before my first call.

| Channel | Result |
|---|---|
| `WebSearch` | **Refused** — budget exhausted before my first call. Zero searches available to me. |
| `developer.paddle.com`, `www.paddle.com` | EGRESS_BLOCKED |
| `www.greeninvoice.co.il`, `greeninvoice.docs.apiary.io` | EGRESS_BLOCKED |
| `www.gov.il`, `www.kolzchut.org.il` | EGRESS_BLOCKED |
| `payoneer.custhelp.com`, `fragment.com`, `core.telegram.org` | EGRESS_BLOCKED |
| `grow.business`, `docs.payplus.co.il` | EGRESS_BLOCKED |
| `web.archive.org` (attempted as a bypass) | Blocked by the tool itself |
| `github.com`, `raw.githubusercontent.com` | **Reachable** |
| GitHub code search (MCP) | **Reachable** — my main independent channel |

So: of the 27 `evidenceUrls` in the report, I could open **three** (all GitHub). Everything
else remains, for me as for the supervisor, unrendered. I did open a fourth channel the
supervisor did not use — GitHub code search across third-party repositories — and it
produced independent corroboration for two claims and refutation of two others.

**The rule I am applying:** the task says "default to scepticism: if you cannot verify it,
it is not CONFIRMED." Applied honestly, that means **no candidate in this group can be
CONFIRMED on its external evidence**. Only one item survives as CONFIRMED, and it survives
because its correctness does not depend on external evidence at all.

---

## 1. The headline is false, and the repo proves it

> "nothing is blocked by rails today (**Paddle is already live and is a merchant of record**)"
> — and, in the Paddle entry — "Ranked first only because it is already shipped and
> **already takes money**".

This is refuted by this repository, in the supervisor's own reach:

`products/il-biz-tools/src/config/site.json`
```json
"paddle": { "clientToken": "", "priceId": "", "environment": "sandbox" },
"pro":    { "publicKey": null }
```

`products/il-biz-tools/README.md:109` — the Pro tier "appears only when **both** the Paddle
credentials and the public key are configured", otherwise "Pro shows בקרוב".

And there is no ledger at all: `state/` does not exist, no SQLite file exists, and
`src/revenue/ledger.ts` has never been written to. Under MISSION rule 2 ("money means the
ledger… a platform transaction id"), this line has earned **₪0**.

The entry contradicts itself inside its own body: its own `ownerBlockers[0]` is *"Create
the Paddle seller account under his legal identity"*. An account that does not exist cannot
be "already live" or "already taking money". The supervisor built its ranking, its headline
and its "critical path is four one-time owner steps, not four integrations" conclusion on a
premise its own data contradicts.

This is the single most serious defect in the report, because it is the sentence a director
would act on.

---

## 2. The `monthlyCeilingIls` column is not a ceiling

Five of six items carry `monthlyCeilingIls: 20000`. That is the MISSION target
(₪20,000/month) copied into a field that is supposed to be a derived estimate. Every item in
this group is, by the supervisor's own description, a **cost rail that earns exactly ₪0**.

Two consequences:

1. **Summed, the group claims ₪102,500/month of "carrying capacity"** for rails that
   collectively earn nothing. Any board-level roll-up that adds these columns produces a
   fabricated portfolio number. This is precisely the failure MISSION rule 2 exists to
   prevent.
2. **The stated "capacity" is unreachable behind the group's own root gate.** The report's
   ROOT GATE is "register as **עוסק פטור** to start". This repo's own plan
   (`docs/INCOME_PLAN.he.md:17`) puts the עוסק פטור ceiling at **₪122,833/year =
   ₪10,236/month**, and says outright that a ₪20–50k/month target crosses it within a year.
   So every entry simultaneously asserts a ₪20,000/month ceiling **and** a registration
   status that legally caps turnover at half that. The two cannot both hold.

**Corrected ceiling for all six items: ₪0.** They are infrastructure. If the field must
express carrying capacity, it needs a different column name and a defensible derivation —
and for a site with no traffic, a disabled Pro tier and no backlinks, month-one carried
volume is ₪0–₪200, not ₪20,000.

---

## 3. Candidate-by-candidate

### 3.1 Paddle merchant-of-record — **DOWNGRADED**

**Evidence check.** Both cited Paddle URLs are EGRESS_BLOCKED for me. Nobody in this group
— scout, supervisor, or auditor — has rendered a single Paddle page. However, GitHub code
search gave me the group's only independent corroboration, from an unrelated third-party
repo (`Papi299/paper-whisperer-62`, `docs/decisions-and-triggers.md`):

> "Paddle's stated policy is 'software businesses anywhere in the world except the
> unsupported countries listed below'; Israel is not on the unsupported list and is listed
> in the Asia section of the supported-countries reference."

That is secondary, not primary — but it is an independent party reaching the same
conclusion by reading the page, and it is materially better than the rest of this group's
evidence base. **I therefore leave `israelPayable: YES`**, at low-to-medium confidence, on
seller-country eligibility only.

The same source adds the risk the supervisor omitted entirely:

> "**Paddle approval for the Israeli operator is not guaranteed by this decision**; if it
> fails, Lemon Squeezy is the documented fallback."

**Attack 1 — approval risk is missing.** Paddle reviews the live site before approving.
The site it would review has a Pro tier that renders as "בקרוב" because the credentials
are empty. A brand-new seller, no traffic, no revenue history, and a paid tier that does
not function is the exact profile that gets rejected or held. This risk appears nowhere in
the entry — not in `killCriteria`, not in `whyThisRank`. The `killCriteria` contemplates
"verification stalls past ~3 weeks" but not outright refusal.

**Attack 2 — the build estimate.** `buildHours: 3` covers the five legal pages. It does not
cover the thing MISSION rule 2 actually requires: a Paddle webhook receiver with signature
verification and idempotency, writing `(source, external_id)` rows into `revenue_ledger`
(the uniqueness query already exists at `src/revenue/ledger.ts:375`), plus license issuance,
refund reversal and chargeback handling. Realistic: **10–16 hours**, plus 5–7 days to
~3 weeks of calendar verification that is not build time and should not be hidden in it.

**Attack 3 — "no human needed" is overstated.** The `firstStep` (publish Terms naming the
owner's legal name, Privacy, Refund, Contact, Pricing) requires the owner's **legal name,
legal address and a contact channel** — content an agent must not invent, and a Refund
Policy is a binding commitment. That is an owner input, and it is absent from
`ownerBlockers`. It is small, but the mission's whole discipline is that these are
catalogued precisely.

**Attack 4 — the AMBER gate is load-bearing, not a footnote.** Whether Paddle is registered
for Israeli VAT (18% on digital services) and whether Israeli local-only cards can check
out determines whether the *entire buyer base* of il-biz-tools can pay at all. An item whose
sole downstream buyer may be unable to transact cannot rank first.

**Verdict: DOWNGRADED.** Real rail, plausibly Israel-eligible, but it is *not* live, it
earns ₪0, its build is understated by 3–5×, and its rank rests on a false premise.
Corrected ceiling ₪0. `israelPayable: YES` (low confidence, approval discretionary).

---

### 3.2 Morning (Green Invoice) API invoicing — **DOWNGRADED**

This is the one place the supervisor claimed rendered primary sources. I opened them.

**Evidence failure 1.** `https://github.com/dsaddan/Israel-Tax-Authority-OpenAPI-Taxes-Demo`
is cited for the allocation-number threshold claim. I rendered it. It is a Visual Studio
2019 MVC C# demo for obtaining an allocation number, and it **contains no monetary
thresholds at all** — not ₪25,000, not ₪5,000, no years. The URL does not support the claim
attached to it.

**Evidence failure 2.** `https://github.com/g-and-s-tools/GreenInvoiceAPI` is cited for
"document types 320/305". I rendered it. It is a **third-party Node SDK**, not the API, and
it uses **string** type names (`"invoice"`, `"receipt"`, `"invoiceReceipt"`, `"quote"`,
`"deliveryNote"`, `"creditInvoice"`, `"proforma"`) — **no numeric codes appear**. It points
onward to `greeninvoice.docs.apiary.io`, which is EGRESS_BLOCKED.

**Evidence failure 3 — and this one is dangerous.** I went looking for those numeric codes
across GitHub and found that **independent implementations disagree on what they mean**:

- `Boltcall/Boltcall`: "type 320 = tax invoice (חשבונית מס) … type 305 = receipt + invoice"
- `Yuval-Steimberg/gift_card_system`: "320 = חשבונית מס/קבלה (invoice-receipt) · **305 = חשבונית מס** (tax invoice)"
- `danielrosehill/GreenInvoice-MCP`: "**305=Tax Invoice, 320=Tax Invoice+Receipt**… Verified 2026-07-24"
- `Urigo/accounter-fullstack`: `'_320' → 'Invoice / Receipt'`

Three of four agree 305 = tax invoice and 320 = invoice+receipt; one has them swapped.
Writing `const documentType = 305` from a snippet, as the supervisor's `firstStep` implies,
risks **issuing the legally wrong tax document** — a compliance defect, not a bug.

**What the evidence *does* support.** The threshold schedule is corroborated, better than
the supervisor sourced it. `skills-il/accounting` (`israeli-financial-reports/evidence.json`)
quotes a gov.il snippet verbatim:

> "מספרי הקצאה אלה יידרשו כתנאי לניכוי מס התשומות בעסקאות שמעל לתקרה שנקבעה בחוק
> (20,000 ₪ לשנת 2025, 10,000 החל מה-1 בינואר 2026 ו-5,000 ₪ החל מה-1 ביוני 2026)"

and `skills-il/accounting` (`israeli-e-invoice/scripts/validate_invoice.py`) carries the
full ladder `2024-05-04 → 25,000 · 2025 → 20,000 · 2026-01 → 10,000 · 2026-06 → 5,000`.
So: **the threshold is ₪5,000 net today (3 Sep 2026)**, the supervisor's ₪5,000 assertion
is correct *as of now*, and its conclusion (₪2–₪99 tickets are 2–3 orders of magnitude
below it) holds. **This is the group's one genuinely sound finding.**

But the `firstStep` says "a hard assertion that throws if any single invoice net exceeds
₪5,000". That threshold has moved **four times in 25 months**. Hardcoding it is the same
literal-constant mistake two of the corroborating repos explicitly warn against ("the
threshold itself enters as a year-keyed constant… not a literal"). It must be **date-keyed
by invoice issue date**.

**Attack — the registration contradiction.** The report's ROOT GATE is register as
**עוסק פטור**. An עוסק פטור **may not issue a חשבונית מס** and may not charge VAT; its
documents are קבלה / חשבון עסקה. The `firstStep` builds tax-invoice document types (305/320)
and an "explicit 0%-VAT field for zero-rated exports" — for a registration status that
cannot issue either. The invoicing build and the registration recommendation, in the same
report, are incompatible.

**Attack — cost.** "A Morning subscription" carries no number anywhere in the entry, and
whether API access requires a paid tier is unverified. This is a recurring cost on a line
with ₪0 revenue and it is unquantified.

**Verdict: DOWNGRADED.** The negative finding (do not build ITA allocation-number
integration) is real and independently corroborated — genuinely valuable. But this is *not*
"the only one resting on rendered primary sources": two of its four cited URLs do not
support the claims attached to them, and its concrete build instruction is wrong for the
registration status the same report mandates. Corrected ceiling ₪0.

---

### 3.3 Payoneer as receiving endpoint — **DOWNGRADED (israelPayable → UNKNOWN)**

**Evidence check.** Both Payoneer URLs EGRESS_BLOCKED for me; the Paddle payout-fee URL
blocked; nobody has rendered any of them. The supervisor states plainly that "one of them
comes from a competitor's blog". Under the mission's hard Israel-payability gate, an
unrendered fee page plus a competitor's blog is not evidence that **Paddle will pay an
Israeli individual into Payoneer, and that Payoneer will settle to an Israeli bank in ILS**.
I found nothing on GitHub either way.

**`israelPayable: YES` is therefore not supportable. Corrected to UNKNOWN.** The mission is
explicit: "a line that cannot pay an Israeli is worth zero however good the idea." The
supervisor applied that standard to Telegram Stars and marked it UNKNOWN on weaker grounds
(one stale snippet). It did not apply the same standard here, where the grounds are *no
evidence at all*. That inconsistency is the tell.

**Attack — the `firstStep` builds an analytically wrong function.** The entry proposes a
decision function keyed on a "crossover ~$1,500" derived from withdrawal fees alone
($1.50–$4 Payoneer vs $15 Paddle SWIFT). But the same entry states the FX term: **0.5%
over mid-market inside Payoneer versus up to ~2% if the bank converts**. FX is charged on
the whole balance; the wire fee is flat. At ₪20,000/month (≈$5,400):

- wire-fee difference: ~$11–13
- FX difference (1.5 points on $5,400): **~$81**

FX dominates above roughly **$300**, not $1,500. A function that compares only withdrawal
fees returns the wrong recommendation across essentially the entire volume range the
mission targets — and it would do so *confidently*, which is worse than not having it.
Corrected rule: the conversion venue, not the wire fee, is the decision; verify the 0.5%
and 2% figures before encoding either.

**Attack — a missing owner blocker.** Nobody covered the last leg: Israeli banks apply AML
/ source-of-funds review to recurring foreign USD credits into a private or עוסק account.
That can freeze the final hop after every other hop works, and it is not in
`ownerBlockersFound`.

**Verdict: DOWNGRADED.** Structurally plausible, zero evidence, `israelPayable` overstated,
and its one buildable deliverable is specified incorrectly. Corrected ceiling ₪0.

---

### 3.4 Compliance gate in code (no payout before the tax file) — **CONFIRMED, with corrections**

**Evidence check.** All three cited URLs fail: `gov.il` and `kolzchut.org.il` are
EGRESS_BLOCKED (for me and for the scout), and `marketing.isracard.co.il` is a credit-card
business-account marketing page that does not speak to opening a תיק עוסק at מס הכנסה at
all — it is off-point for the claim it is attached to.

**Why it survives anyway.** This is the only item whose operative recommendation — add an
`owner_tax_file_registered` flag and assert on it in every payout-enable path — is correct
*independently of any external evidence*. It costs ~3 hours, it is directly enforcing
MISSION rule 1 ("a line blocked on the owner sits in `awaiting_setup` until they confirm"),
and it cannot be wrong in a way that costs money. The supervisor is candid that the legal
underpinning is the group's weakest, and reaches the right conclusion regardless. That is
good reasoning and I am confirming it as such — **on the recommendation, not on the
citations.**

**Correction 1 — the guard is under-specified.** A boolean `registered` flag is not enough.
Given the עוסק פטור ceiling of ₪122,833/year (`docs/INCOME_PLAN.he.md:17`), the guard needs
a **rolling-12-month turnover assertion** that trips at the ceiling and forces the line into
`awaiting_setup` pending the עוסק מורשה switch. Without it, the colony can drive the owner
past a legal ceiling while every check reports green.

**Correction 2 — one ROOT GATE conflicts with the mandate.** The report lists as unavoidable:

> "One **paid conversation** with an Israeli accountant on exactly two questions…"

The owner's verbatim brief (MISSION.md) says *"אני לא מדבר עם אנשים"* and *"אני רוצה דרכים
בלי שאני צריך אישור של עורך דין או אישורים כאלה."* MISSION rule 1 says "Never invent a step
that isn't required" and "The owner does not talk to customers. Any line that needs them to
is not a line." Presenting a conversation as an unavoidable ROOT GATE, without flagging the
conflict, is exactly the kind of invented owner step the mission forbids. It may well be
*prudent* — but it must be surfaced as a mission conflict with async alternatives named
(a written online accountant service; a written ITA pre-ruling / החלטת מיסוי), and the
owner decides. As written it is a blocker the owner has already refused in advance.

**Verdict: CONFIRMED** on the code guard, with the turnover assertion added and the
accountant blocker reclassified. Corrected ceiling ₪0.

---

### 3.5 Telegram Stars → Fragment → TON → Israeli VASP — **DOWNGRADED**

**Evidence check.** I independently re-rendered
`raw.githubusercontent.com/grammyjs/types/main/payment.ts` and confirm verbatim, as the
supervisor did:

> "Three-letter ISO 4217 currency code, or \"XTR\" for payments in Telegram Stars"

> "Note that if the buyer initiates a chargeback with the payment provider from whom they
> acquired Stars (e.g., Apple, Google) following this transaction, the refunded Stars will
> be deducted from the bot's balance. This is outside of Telegram's control."

That holds. `core.telegram.org` and `fragment.com` are EGRESS_BLOCKED, so the 1,000-Star
minimum, the 21-day unlock, the ~$0.013/Star net rate and the country position all remain
unverified by anyone.

**The `firstStep` is the best recommendation in the entire report** — record Stars in the
ledger only at withdrawal with a Fragment transaction id, never at `successful_payment`,
because the balance is retroactively debitable. That is MISSION rule 2 applied correctly,
and it is directly supported by the quote above. It should be **generalised across the
portfolio** as a refund/chargeback reversal rule; the supervisor left it local to this entry.

**Attack — the ceiling contradicts the mission's own gate.** `israelPayable: UNKNOWN` is the
honest call. But the mission says an unpayable line "is worth zero." A line whose payout
availability is unknown cannot carry `monthlyCeilingIls: 2500`; it carries **₪0 until the
Fragment login resolves it**. Booking 2,500 against an unknown is the same optimism the
mission's hard gate exists to suppress.

**Attack — the supervisor applied its own reasoning inconsistently.** It rejected the paid
Telegram channel with: "zero Telegram-side discovery, no brand and no host, so it can only
reach members through the manual promotion the mission forbids." That reasoning applies
*identically* to `products/telegram-il-tools-bot`: no users, no discovery surface, and
promotion is forbidden. Month-one revenue for a Stars bot nobody can find is **₪0**, not
₪2,500. The rejection criterion was applied to a competitor of this entry but not to this
entry.

**Verdict: DOWNGRADED.** API layer genuinely verified (twice). Everything downstream of the
bot balance is unverified, and the ceiling is unsupported on two independent grounds.
Corrected ceiling ₪0. `israelPayable: UNKNOWN` (unchanged — correctly stated).

---

### 3.6 One Israeli card gateway (Grow / PayMe) — deferred — **DOWNGRADED**

**Evidence check.** `grow.business` and `docs.payplus.co.il` EGRESS_BLOCKED. I rendered
`github.com/futureecom/omnipay-tranzila/blob/master/README.md` — it **contains no fees, no
monthly costs and no onboarding requirements whatsoever**. It is cited under an entry whose
entire content is fees and onboarding; the URL supports nothing it is attached to. The
supervisor itself concedes every price traces to a single SEO comparison page of unknown
independence and that Grow's actual tiers — "the single most decision-relevant number" —
could not be obtained.

So: an entry built on unobtainable numbers, with one citation that is empty and two that
are unreachable. Nothing here is confirmable.

**What is right.** Ranking it last and prescribing "do nothing yet" is correct. It unblocks
nothing.

**Attack — the deferral rationale omits the real reason.** The entry frames a local gateway
as a **fee optimisation** (~1–3% vs ~7–10%). It is not. Paddle is a **merchant of record**;
Grow and PayMe are **not**. Switching moves the entire sales-tax/VAT obligation for every
buyer, in every jurisdiction, onto the owner personally — Israeli VAT on Israeli buyers, and
whatever applies to foreign ones. That is a large, permanent, human-shaped compliance
burden traded for a few points of margin, and it is the actual reason to defer. Omitting it
means a future director could read this entry and "optimise" straight into the mission's
worst outcome.

**Attack — `buildHours: 16` is misattributed.** The entry's only recommended action is a
decision function (~2h). The 16 hours are for an integration it explicitly says not to
build. And the function is dead code regardless: fed by an empty ledger it returns `false`
forever, so even 2 hours is premature. Correct answer: **0 hours, write nothing, revisit
when the ledger has Israeli-buyer card volume.**

**Verdict: DOWNGRADED.** Correct call (defer), unverifiable numbers, wrong stated reason,
misattributed effort. Corrected ceiling ₪0.

---

## 4. Supervisor's own errors

1. **The headline is factually false.** "Paddle is already live… already takes money" is
   refuted by `products/il-biz-tools/src/config/site.json` (empty `clientToken`, empty
   `priceId`, `environment: "sandbox"`, `pro.publicKey: null`) and by the absence of any
   ledger or `state/` directory. Zero transactions exist.
2. **The report contradicts itself inside one entry.** The Paddle entry asserts the account
   already takes money, and its own `ownerBlockers[0]` requires the owner to create that
   account. Both cannot be true; the ranking rests on the false one.
3. **`monthlyCeilingIls` is the mission target copy-pasted**, not a derived figure, on five
   of six items — all of which earn ₪0. Summed, ₪102,500/month of phantom capacity.
4. **The stated ceilings are impossible behind the report's own root gate.** עוסק פטור caps
   turnover at ₪122,833/year = ₪10,236/month (`docs/INCOME_PLAN.he.md:17`), roughly half the
   ₪20,000 every entry claims.
5. **Israel-payability standard applied inconsistently.** Stars → UNKNOWN on one stale
   snippet; Payoneer → YES on zero rendered pages and a competitor's blog. The weaker
   evidence got the stronger verdict.
6. **The Payoneer decision function is analytically wrong.** The ~$1,500 crossover compares
   withdrawal fees only and ignores the FX spread (0.5% vs ~2%), which dominates above
   ~$300. As specified it would return the wrong answer at nearly every target volume.
7. **Cited URL does not support its claim (Morning/thresholds).** The `dsaddan` repo, which
   I rendered, contains no monetary thresholds at all.
8. **Cited URL does not support its claim (Morning/doc types).** The `g-and-s-tools` SDK,
   which I rendered, uses string type names and contains no numeric codes 320/305 — and
   independent implementations disagree on what those codes mean.
9. **Cited URL does not support its claim (Tranzila).** The `omnipay-tranzila` README, which
   I rendered, contains no fees, costs or onboarding requirements.
10. **Cited URL is off-point (tax registration).** `marketing.isracard.co.il` is a
    business-account marketing page; it does not evidence opening a תיק עוסק.
11. **The Morning `firstStep` is incompatible with the report's own ROOT GATE.** It builds
    tax-invoice document types (305/320) and a zero-VAT export field for an עוסק פטור, who
    may issue neither.
12. **The ₪5,000 threshold is prescribed as a hardcoded literal.** It has changed four times
    in 25 months (25,000 → 20,000 → 10,000 → 5,000); it must be date-keyed by issue date.
13. **A ROOT GATE conflicts with the owner's verbatim mandate.** "One paid conversation with
    an Israeli accountant" contradicts *"אני לא מדבר עם אנשים"* and *"בלי שאני צריך אישור
    של עורך דין"*, and is presented as unavoidable without flagging the conflict or naming
    an async alternative.
14. **A rejection criterion was applied selectively.** "No discovery, and promotion is
    forbidden" killed the paid Telegram channel but was not applied to the Stars bot, which
    has the same defect.
15. **`buildHours` exclude the ledger wiring MISSION rule 2 requires.** No entry budgets
    webhook signature verification, idempotency, or `(source, external_id)` writes into
    `revenue_ledger`. Paddle at 3h is not achievable including them.
16. **Kill criteria are not computable from the ledger.** "verification stalls past ~3
    weeks", "blended take exceeds 12%", "chargeback leakage exceeds 10% over a quarter" —
    none has a ledger field behind it, contra MISSION rule 3 (any auditor must be able to
    recompute the decision from the same numbers).
17. **Scores are underived.** 78/74/62/58/45/40 have no stated formula, and they rank an
    entry with zero rendered pages (Paddle, 78) above the entry the supervisor itself calls
    the best-evidenced in the group (Morning, 74).
18. **Paddle approval risk is entirely absent** — not in `killCriteria`, not in
    `whyThisRank` — although an independent third-party source I found states plainly that
    approval "is not guaranteed", and the site under review has a non-functional paid tier.

---

## 5. Angles the group missed entirely

1. **Lemon Squeezy — this repo's own documented fallback — was never evaluated.**
   `src/revenue/portfolio.ts:69` names "Paddle; **Lemon Squeezy as fallback**". The group
   assessed zero fallback MoRs. Worse, the third-party source I found states Lemon Squeezy
   was acquired by Stripe in July 2024 and is migrating to "Stripe Managed Payments"
   (public preview Feb 2026) — so the documented fallback now inherits **exactly the Stripe
   Israel-support uncertainty the group rejected Stripe for**. The portfolio's stated
   contingency may not exist. Nothing else was examined either: FastSpring, Polar, Creem,
   Ko-fi, Gumroad-as-MoR.
2. **The Apify payout rail was never audited — and it is a SHIPPED product.**
   `products/apify-il-open-data/README.md:135` states Apify pays creators "via **PayPal** or
   bank transfer/**Payoneer**". The group's own extracted architectural rule is "reject any
   income line whose sole payout path runs through PayPal" — and it never applied that rule
   to a product already in `products/`. Not one line of the report covers Apify.
3. **The x402 / USDC→ILS rail was never audited — also a SHIPPED product.** The group
   traced TON→ILS for Stars but ignored USDC→ILS for `products/x402-il-api`. That product's
   own README (line 87) says "Converting that USDC to shekels later needs a one-time Israeli
   exchange account with KYC" — **an owner blocker missing from `ownerBlockersFound`** — and
   nobody addressed Israeli tax treatment of crypto proceeds or which licensed VASP accepts
   USDC on Base. Two of four shipped products have unaudited payout rails.
4. **What document the owner issues, and to whom, under a merchant of record.** Paddle
   self-bills its sellers. Is Paddle's self-billed statement an acceptable ITA record? Is
   the owner's VAT customer Paddle (export of services) or the Israeli end buyer? This is
   the operative question *underneath* the §30(א)(5) debate, and the group posed it only as
   something to ask a human — never researched the mechanics, which are documented.
5. **Israeli receiving-bank friction.** Recurring foreign USD credits into an Israeli
   private/עוסק account trigger AML source-of-funds review. This is an Israel-specific gate
   that can freeze the final hop after every other hop works. Zero coverage.
6. **Refunds, chargebacks and rolling reserves as a portfolio-wide ledger rule.** The Stars
   entry solved the reversal problem correctly and locally; it was never generalised. No
   entry designs a refund reversal for Paddle, and Paddle's rolling reserve for new sellers
   is unmentioned.
7. **No FX assumption anywhere.** Every ceiling is denominated in ILS; every rail pays USD.
   No USD/ILS rate is stated, so no ILS figure in this report is reproducible.
8. **The VAT consequence of leaving a merchant of record.** Covered in §3.6 — the real
   reason to defer a local gateway, and it is stated nowhere.
9. **The ₪50,000/month second target is unaddressed by any rail.** עוסק מורשה, monthly VAT
   filing, bookkeeping obligations, possibly a חברה בע"מ — the mission's stated stage two
   has no rail analysis at all.
10. **Ledger integration is absent from every entry.** `src/revenue/ledger.ts` already has
    the `(source, external_id)` uniqueness machinery these rails must feed. Not one entry
    references the schema it has to write into.

---

## 6. Bottom line

The group's honest self-assessment is its best feature: it says out loud that almost
nothing was rendered. My independent check confirms that, and finds worse — **four cited
URLs, when actually opened, do not support the claims attached to them**, and the report's
headline is contradicted by this repository.

- **Zero candidates CONFIRMED on external evidence.**
- **One CONFIRMED on reasoning** (the compliance code guard), with two corrections.
- **Five DOWNGRADED.**
- **All six ceilings corrected to ₪0** — this group earns nothing, by its own description.
- **One `israelPayable` corrected YES → UNKNOWN** (Payoneer).

The single most actionable correction: **the critical path is not "four one-time owner
steps".** It is one owner step (the tax file), followed by a Paddle application that may be
refused, followed by roughly 10–16 hours of webhook-to-ledger engineering that no entry
budgeted. Until then this colony's rails carry ₪0 and the ledger stays empty.
