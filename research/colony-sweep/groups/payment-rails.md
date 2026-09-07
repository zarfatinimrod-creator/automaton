# GROUP REPORT — payment-rails
**Supervisor:** payment-rails supervisor (Opus 5). **Date:** 2026-09-03.
**Scouts reporting:** 8 (paddle-onboarding, stripe-alternatives, paypal-israel, payoneer-wise,
telegram-stars, app-store-payouts, israeli-tax-registration, invoicing-obligations).

---

## Headline

**There is no money in this group. Not one line here earns a shekel.** Payment rails are a
feasibility gate: they decide whether other groups' lines can be paid at all, and what
percentage of each shekel survives. The "reject anything under ₪300/month" rule therefore
cannot be applied literally here — every honest direct ceiling in this group is ₪0. I have
instead ranked by *how much revenue each rail can legally carry into an Israeli bank account*,
and I label that number **enablement, not earnings**, everywhere it appears.

The operative finding of the whole group: **nothing is blocked by rails today.** Paddle is
already live on `products/il-biz-tools` and is a merchant of record, so it needs no Israeli
acquiring agreement. Everything else in this group is either (a) a legally required compliance
step the owner must take once, or (b) a fee optimisation to run *after* real revenue exists.
The colony should not spend another week on rails research.

## Verification conditions this session — read before trusting any number below

I attempted to spot-check the strongest claims and **could not**. Recorded honestly:

- `WebSearch` — **refused, budget exhausted (200/200)** before my first call. Zero searches available.
- `WebFetch developer.paddle.com/concepts/sell/supported-countries-locales` → `EGRESS_BLOCKED`
- `WebFetch wise.com/help/articles/2813542` → `EGRESS_BLOCKED`
- `WebFetch core.telegram.org/bots/payments-stars` → `EGRESS_BLOCKED`
- Proxy status confirms a policy allowlist (`selective:false`, hosts denied upstream). Per
  `/root/.ccr/README.md` I did not retry or route around it.
- **The only channel that works is github.com / raw.githubusercontent.com.**

What I *did* verify today, first-hand:
- `raw.githubusercontent.com/grammyjs/types/main/payment.ts` rendered. Confirmed verbatim:
  `"Three-letter ISO 4217 currency code, or \"XTR\" for payments in Telegram Stars"` and
  `"if the buyer initiates a chargeback with the payment provider from whom they acquired Stars
  (e.g., Apple, Google) following this transaction, the refunded Stars will be deducted from the
  bot's balance"`. The telegram-stars scout's two strongest claims stand.
- Re-fetch of `grammyjs/types/main/methods.ts` truncated before the payments section, so the
  `subscription_period = 2592000` and `subscription_price 1-2500` quotes remain
  **scout-rendered, not supervisor-re-verified**.

**Consequence: I promoted nothing above `medium` confidence on the strength of my own checking.**
Every Paddle, PayPal, Payoneer, Wise, Google and Israeli-gateway number in this report is
search-snippet grade, gathered by scouts, and must be labelled unverified when shown to the owner.

---

## Merge and dedupe

| Duplicate seen under | Kept version | Why |
|---|---|---|
| Paddle payout mechanics (paddle-onboarding, payoneer-wise) | paddle-onboarding | Full currency lists, $15 SWIFT fee, $100 min, 1st→15th schedule |
| Paddle Israel seller support (paddle-onboarding, payoneer-wise) | paddle-onboarding | Names the sanctions carve-out set; payoneer-wise only says "not explicitly named" |
| עוסק registration requirement (israeli-tax-registration, stripe-alternatives, invoicing-obligations) | invoicing-obligations | Only one with rendered sources |
| Export VAT zero-rating (israeli-tax-registration says UNRESOLVED; invoicing-obligations says §30(a)(5) applies with the "Israeli resident is also a beneficiary" trap) | invoicing-obligations, **with the conflict flagged** | Better sourced, but the two scouts disagree on whether it is settled — treat as an accountant question, not a fact |
| "Meshulam" and "Grow" as two gateways | one entry | Same company: Meshulam Payment Solutions (Grow) Ltd |
| Israeli gateways (PayMe / Tranzila / PayPlus / Grow / Cardcom / Isracard) | **one consolidated entry** | Six near-identical cost rails with identical onboarding; presenting six inflates the portfolio |

---

## RANKED SURVIVORS (6)

### 1. Paddle merchant-of-record — the rail that already works (score 78)
Israel is a supported *seller* country (sanctioned set is Russia, Belarus, Iran, DPRK, occupied
Ukrainian regions — Israel absent). No company required: business type "Individual", and the
business-identification phase is skipped for individuals/sole traders. Cost 5% + $0.50, which is
~10% effective at ₪39/mo and ~7% at ₪99/mo — **annual-first pricing is the fix**, because the
fixed $0.50 dominates small tickets. Payouts: monthly only, created on the 1st, paid by the 15th,
$100 minimum, USD (ILS is on neither the balance-currency nor the payout-currency list), $15 SWIFT
wire to an Israeli bank. First revenue reaches a shekel account roughly six weeks after the first sale.
**Open gate, AMBER, not resolved:** whether Paddle is registered for Israeli VAT (18% on digital
services) and whether Israeli local cards/Bit can check out at all. il-biz-tools' entire buyer base
is Israeli, so this is not academic — it may force Pro to be B2B-only or locally billed.
Evidence: snippet-only, zero Paddle pages rendered by anyone.

### 2. Automated Israeli invoicing through the Morning (Green Invoice) API (score 74)
The best-evidenced item in the group and the only one with rendered primary sources. Every Israeli
עוסק must issue a tax document for every sale including foreign buyers; Morning exposes a REST API
with sandbox and webhooks, and the whole loop after one-time account setup is machine-callable —
**no human in the invoicing loop.** Critically, the scout *killed a false burden*: the חשבוניות
ישראל allocation-number regime bites only above a per-invoice net threshold (₪25k→20k→10k→5k as it
stepped down), and our tickets are ₪2–₪99. Two-to-three orders of magnitude below. **Do not build
SHAAM/ITA API integration for this portfolio** — build a threshold assertion instead.

### 3. Payoneer as the receiving endpoint for foreign payouts (score 62)
Israel-payable, wired into Paddle's payout options and ~2,000 platforms. Cheaper than SWIFT below
roughly $1,500/payout ($1.50–$4 withdrawal vs $15 wire). Cannot hold ILS — 100% of revenue crosses
one FX conversion; convert inside Payoneer (~0.5% over mid-market) rather than letting the Israeli
bank do it. $29.95/yr, waived above $2,000 received per rolling 12 months. Nothing rendered.

### 4. A compliance gate encoded in code: no payout method enabled before the tax file exists (score 58)
Not a rail — the rule that keeps the rails legal. Israeli gateways refuse unregistered persons, so
"revenue before registration" **cannot happen domestically**; it can only happen on the foreign rails
we already ship on (Paddle, Apify, Telegram Stars, x402), which will pay an Israeli individual with
no תיק עוסק while unreported-income and un-issued-invoice debt accrues silently. `docs/INCOME_PLAN.he.md`
already states the rule ("רישום עצמאי ... לפני התשלום הראשון"); it is not enforced anywhere in code.
The penalty regime is **unverified and must not be guessed**.

### 5. Telegram Stars → Fragment → TON → licensed Israeli VASP (score 45)
The rail under an already-shipped product (`products/telegram-il-tools-bot`). API layer is the
best-verified thing in the group (re-confirmed by me today). Everything downstream of the bot balance
is not: 1,000-Star minimum, 21-day per-batch hold, Fragment Sumsub KYC, and **an unresolved question
of whether an Israeli resident can withdraw at all** — one snippet (traced to an April-2024 article
about the *channel ad-revenue* programme, a different programme) lists Israel among excluded countries.
Then TON must reach shekels through a licensed Israeli VASP, and whether Bits of Gold lists TON is
unconfirmed. Pre-withdrawal Stars are **not banked revenue** and must never be written to the ledger
as such — Apple/Google chargebacks are deducted from the bot balance retroactively.

### 6. One Israeli card gateway (Grow or PayMe) for ILS + Bit checkout — deferred (score 40)
Buys a better rate (~1–3% vs Paddle's ~7–10% effective) and access to Bit and Israeli-card-only
buyers. Grow and PayMe are the only two with no setup fee and no monthly fee, so they are free to
hold idle; Tranzila/Cardcom/PayPlus carry ₪90–200/month which only pays for itself above roughly
₪5,000–8,000/month of card volume. **Every price in this paragraph comes from a single SEO comparison
page of unknown independence and must not be quoted to the owner as fact.** Deferred: it unblocks
nothing that is blocked today.

---

## REJECTED

| Rejected | Why |
|---|---|
| **Wise (business receiving rail)** | Wise states businesses registered in Israel (with Bahrain, Malaysia) cannot hold money in a Wise Business account, and its Terms forbid business transactions in a personal account. Both halves close the loop. Not Israel-payable for a business. |
| **Braintree** | Israel absent from Braintree's supported-merchant country list. No PayPal-family gateway route exists for an Israeli merchant. |
| **PayPal as a primary rail** | Stacked cost: ~3.49% + ₪1.60, plus 1.5–2% cross-border, plus ~3–4% FX, plus (from 6 July 2026, PayPal Israel Payment Services Ltd) 18% VAT charged on the fees themselves — plausibly 5–9% all-in on our ticket sizes. Plus 21-day new-seller holds, 180-day holds on limitation, and **no Seller Protection for "significantly not as described" on digital goods**, which is the dominant dispute type for exactly what we sell. AMBER. Keep as a secondary checkout option only; never the sole rail for any line. |
| **Google Play** | Israel's presence on the *developer/merchant registration* supported-locations list is **unconfirmed** (buyer-side support is not seller-side support). Worse, a "12-tester rule" for new personal accounts would require recruiting real humans — mission-forbidden, and fabricating testers would violate the constitution, so there is no workaround. Weakest evidence in the group: a search-result *title* and a summary line. |
| **Apple App Store** | **Not researched at all** — the scout's search budget was exhausted before the query ran, and it correctly refused to write the $99/W-8BEN figures from memory. Separately a poor mission fit: needs macOS/Xcode signing infrastructure this operation does not have. |
| **Chrome Web Store as a payout rail** | Genuine dead end: CWS payments were deprecated (no store charging since early Feb 2021). Useful negative — it means CWS is a $5-once *distribution* surface with zero payment-rail risk, and nobody needs to research "CWS payouts to Israel" again. |
| **Direct Isracard / CAL acquiring** | Requires signing three separate standard agreements and, on the evidence, a sales conversation. Violates "the owner does not talk to people". And Isracard's SMB gateway is PayMe-powered anyway, so going direct lands on PayMe. |
| **Building an aggregator / taking a cut of third-party sales** | Israel's חוק הסדרת העיסוק בשירותי תשלום וייזום תשלום, תשפ"ג-2023 puts non-bank payment services under Israel Securities Authority licensing and defines a מאגד. **RED.** Any "we clear for other sellers" idea anywhere in this colony must be dropped, not researched. |
| **Stripe** | Sources conflict on whether Israel is a supported *merchant* country; the commonly-pushed workaround is forming a US LLC, which is entity formation and out of scope. Status genuinely UNKNOWN — do not build on it. |
| **Gumroad as a payout destination** | Pays only by bank deposit or PayPal — no Payoneer, no Wise — and PayPal terminated its Gumroad payout relationship in late 2024. Architectural rule extracted: reject any income line whose sole payout path is PayPal. |
| **Tranzila / Cardcom / PayPlus / Isracard as separate options** | Merged into survivor #6. Six entries for one decision inflates the portfolio. PayPlus additionally asks integrators to email before building — a human touch we avoid where a self-serve alternative exists. |
| **Paid Telegram channel via createChatSubscriptionInviteLink** | Not a rail — a product, and it belongs to another group. Also AMBER on execution: zero discovery, no brand, and the mission forbids the manual promotion that would fix it. |

---

## OWNER BLOCKERS — consolidated, deduplicated, none assumed done

Legally unavoidable one-time identity/payout steps only. **Nothing below is done. Never mark any
of it done on our own initiative.**

**Root gate (blocks everything, do first):**
1. Open תיק עוסק at מס הכנסה and register for מע"מ (עוסק פטור to start) — online, with ת"ז.
2. Register at ביטוח לאומי as עצמאי.
3. One paid conversation with an Israeli accountant on exactly two questions: (a) does §30(א)(5)
   zero-rating of digital exports survive the "an Israeli resident is also a beneficiary" carve-out
   for our SaaS, and who is the VAT customer under a merchant-of-record; (b) when the עוסק מורשה
   switch must happen given a ₪20k/month target. *Two of my scouts disagree on whether (a) is
   settled — this is the single highest-value open question in the group.*

**Paddle (survivor #1):**
4. Create the Paddle seller account in the owner's legal identity; choose business type "Individual".
5. Supply a national tax identification number in the tax-information step.
6. Sumsub identity verification: colour photo ID (uncropped, unblurred, all corners), proof of
   address, possibly a short liveness selfie video.
7. Add the DNS TXT record Paddle emails — delegable to an agent only if the owner grants DNS access.
8. Reply to any Paddle follow-up or rejection email during review.
9. Register a payout destination in his own legal name and set it plus a threshold in Paddle.

**Payoneer (survivor #3):**
10. Payoneer KYC (passport or ת"ז) and linking the Israeli bank account — account-holder name must
    be in Latin characters or foreign rails reject the link.

**Invoicing (survivor #2):**
11. Open a Morning (Green Invoice) account and generate the API key + secret. One-time; everything
    after that is API.
12. Only if a single invoice ever exceeds the allocation-number threshold: register for the ITA
    allocation-number service (identified-taxpayer login). **Not expected at our price points.**

**Telegram Stars (survivor #5):**
13. Complete Fragment Sumsub KYC (ID scan + selfie) and connect a TON self-custody wallet.
14. **Log into fragment.com with his own Telegram account and confirm the withdrawal option is
    available to an Israeli resident.** Until he does, every Stars line is worth an unknown amount.
15. Open and KYC an account at a licensed Israeli VASP (e.g. Bits of Gold) and link his bank account.

**Israeli gateway (survivor #6, only if pursued):**
16. ID scan, אישור ניהול חשבון or cheque image, SMS OTP, and signing the merchant agreement.

**Conditionally, only if a rejected branch is ever revived:**
17. PayPal: re-accept the PayPal Israel Payment Services Ltd agreement around the 6 July 2026 migration.
18. Google Play: $25 fee + Google payments profile identity + Israeli PSP-law identity verification,
    with a second *enhanced* verification once trailing six-month revenue passes ₪50,000 (weak evidence).

---

## SCOUTS WHOSE WORK WAS THIN OR UNSOURCED

Named honestly, worst first. The auditor should check this list against the scout files.

1. **`payment-rails--app-store-payouts` — thinnest by a wide margin.** Two searches ran before the
   budget died; **Apple was not researched at all**; two of its five findings rest on a search-result
   *summary line* and a search-result *title* respectively. It was honest about this, which is why it
   is useful at all, but no build decision may depend on the ₪50,000 PSP threshold or the 12-tester rule.
2. **`payment-rails--israeli-tax-registration` — zero primary evidence.** Its search budget was
   exhausted before its first call and every gov.il / רשות המסים / כל-זכות domain was blocked. It is
   almost entirely `[repo-secondary]`, and it left the group's highest-value question (export
   zero-rating) explicitly UNRESOLVED. It also correctly flagged that the עוסק פטור ceiling appears
   inconsistently in this repo (₪122,833 in three files, "~₪120,000 (2024)" in a fourth).
3. **`payment-rails--paypal-israel` — zero pages rendered.** The two facts that would actually change
   our unit economics (the IL merchant fee table, and 18% VAT on fees from July 2026) are snippet-only.
   It also correctly refused to repeat an uncorroborated SEO claim about Israeli accounts being
   auto-frozen — good discipline, but the report is unverified throughout.
4. **`payment-rails--payoneer-wise` — zero pages rendered.** Every host blocked. The Wise rejection,
   which I acted on, rests on two snippets.
5. **`payment-rails--paddle-onboarding` — zero Paddle pages rendered**, in a criterion that gates a
   shipped product. Thorough, internally consistent and honest about it, but not verified.
6. **`payment-rails--stripe-alternatives` — prices are unsourced in substance.** Only two GitHub pages
   rendered; every Israeli gateway fee comes from one SEO comparison page (autoflowr.co.il) of unknown
   independence, and Grow's actual tier table — the single most decision-relevant number in the
   criterion — could not be obtained at all. Its *negative* findings (no self-serve onboarding exists;
   aggregation is licensed) are strong and well-argued.

**Good work, for contrast:** `payment-rails--invoicing-obligations` (rendered GitHub sources, dated,
and it removed a burden the colony was about to build for) and `payment-rails--telegram-stars`
(rendered primary API sources; I independently re-confirmed two of its quotes today).

---

## What the group is really telling the board

1. **Rails are not the bottleneck. Demand is.** Every rail question resolves to "fine, once the owner
   has a tax file". Not one product is blocked on a payment rail today.
2. **The critical path is four owner steps, not four integrations:** תיק עוסק → accountant ruling on
   export zero-rating → Paddle identity verification → one payout destination. Everything else is ours.
3. **The one thing that could invalidate a shipped product** is the Paddle-Israeli-VAT gate: if Paddle
   is not registered for Israel, il-biz-tools Pro cannot sell to Israeli consumers through it.
4. **The one thing that could invalidate another shipped product** is Fragment withdrawal eligibility
   for an Israeli resident. One login answers it.
5. **This group should not be swept again until someone can render pages.** Six of eight scouts hit the
   same wall. Re-running blocked searches burns tokens and returns the same snippets.
