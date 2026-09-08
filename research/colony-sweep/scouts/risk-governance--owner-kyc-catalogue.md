# Scout notes — risk-governance / owner-kyc-catalogue

**Criterion:** the exhaustive catalogue of steps that unavoidably require the human owner —
identity verification, bank details, tax forms, phone verification, app-store enrolment.
For each: which platform, why unavoidable, how long, and what it unlocks.
**Date:** 2026-09-03. **Scout:** WORKER-SCOUT `owner-kyc-catalogue`, group `risk-governance`.

---

## 0. Evidence conditions — read before trusting anything below

**This scout ran with zero web access.** The first `WebSearch` call returned:
*"Web search was not performed: this session has used its web search budget (200 of 200
WebSearch calls)."* No search was available to me at all. `WebFetch` remains blocked by the
egress proxy for essentially every host these platforms live on (sibling scouts recorded
`EGRESS_BLOCKED` today for paddle.com, developer.paddle.com, paypal.com, support.google.com,
developer.chrome.com, gov.il, misim.gov.il, taxes.gov.il, kolzchut.org.il, tranzila.com,
cardcom.solutions, greeninvoice.co.il — only github.com renders).

So the evidence class of this file is **[repo-secondary]**: it is a *synthesis* of the
dated scout notes already committed in `research/colony-sweep/scouts/` by sibling scouts on
2026-09-03, each of which cites the URL its claim came from and labels it snippet or rendered.
Nothing here comes from my own memory. Where a sibling marked a claim snippet-only, it stays
snippet-only here. **The catalogue's *structure* is high-confidence (it is what the colony's
own notes say); many individual numbers are not.** Every entry names the URL to open.

This is the right job for a synthesis scout: the criterion asks for a *catalogue*, and the
raw material for it was gathered by eight sibling scouts today. It is not a substitute for
one session with a live search budget on the four items marked **UNCLOSED** below.

---

## 1. The catalogue

Ordered by what gates the most. "Unavoidable because" is the legal/contractual reason, not
a convenience. **None of these are done. Never mark one done without the owner saying so.**

### C1 — Israeli tax registration (תיק עוסק / מע"מ / ביטוח לאומי)
- **Platform:** מדינת ישראל (רשות המסים, ביטוח לאומי). Not a platform we choose.
- **Steps:** open תיק עוסק at מס הכנסה; register for מע"מ as עוסק פטור (or עוסק מורשה);
  register as עצמאי at ביטוח לאומי. Online with ת"ז; no lawyer needed.
- **Why unavoidable:** Israeli law ties registration to *carrying on income-producing
  activity*, not to crossing a number. Separately, **no Israeli payment gateway will onboard
  an unregistered private person** — Isracard's business account is explicitly for
  "עוסק פטור או עוסק מורשה **בעל תיק במע"מ**". [repo-secondary, snippet]
- **The real hazard:** foreign rails (Paddle, Apify, Telegram, x402) will happily pay an
  unregistered Israeli. The money lands and the compliance debt accrues silently. The repo's
  own rule — register **before the first payout is enabled** — is the safe one.
- **Time:** unknown-hours online + one accountant conversation. **Unlocks:** literally everything.
- **Numbers NOT verified:** the 2026 עוסק פטור ceiling appears in this repo as ₪122,833 in
  three places and "~₪120,000 (2024)" in a fourth. At ₪20k/month = ₪240k/year the owner is
  above any plausible ceiling anyway → **עוסק מורשה with periodic מע"מ reporting**, which adds
  bookkeeping. Plan for מורשה, not פטור.
- **UNCLOSED, highest value:** VAT treatment of digital *exports* (מע"מ בשיעור אפס, §30(א)(5))
  when the merchant of record is Paddle. All four shipped products are exports. Zero-rating vs
  18% changes the net on every shekel. This is an accountant question, not an agent question.
- URLs to open: https://www.gov.il/he/service/opening-a-file-vat ,
  https://www.kolzchut.org.il/he/עוסק_פטור ,
  https://www.kolzchut.org.il/he/פתיחת_תיק_עוסק_במס_הכנסה ,
  https://www.gov.il/he/departments/general/vat-rate ,
  https://www.tranzila.com/עוסק-פטור/ , https://marketing.isracard.co.il/biz-account/
- Source files: `payment-rails--israeli-tax-registration.md`, `payment-rails--stripe-alternatives.md`,
  `payment-rails--invoicing-obligations.md`.

### C2 — PayPal Israel business account (the root payout rail)
- **Steps (all owner):** (1) create a **Business** account in his real legal name;
  (2) identity verification with **ת"ז or passport**; (3) supply business name, address,
  **phone** and a **tax identification number**; (4) link an **Israeli bank account with the
  account name written in Latin characters** — a Hebrew name is rejected; (5) link a credit
  card as funding source, because the Israeli bank link is **withdrawal-only**.
- **Why unavoidable:** PayPal is a regulated payment service provider; KYC on the beneficial
  owner is statutory. The Latin-name rule is a platform-mechanical gate that will silently
  fail if an agent guesses.
- **Mechanics:** withdrawal in **ILS only**; **NIS 8 fee under NIS 1,000, free at/above
  NIS 1,000**; **3–5 business days**. [snippet-only]
- **Unlocks:** Apify payouts, Lemon Squeezy/Payhip payouts, Envato/asset marketplaces,
  Etsy indirectly, API-marketplace vendor accounts. It is the single highest-leverage step.
- URLs to open: https://www.paypal.com/il/cshelp/article/how-do-i-link-a-bank-account-to-my-paypal-account-help183
- Source: `payment-rails--paypal-israel.md` (2026-09-03).

### C3 — Apify: identity verification + billing details
- **Steps:** create account, verify email, **complete billing details, select a payment
  method, and pass identity verification**; ת"ז/photo ID, proof of address, possibly a tax
  document; link PayPal (or Wise) as payout method.
- **Why unavoidable:** Apify's own docs tie it to **AML regulation** — "to qualify you must
  complete billing details, select a payment method, and pass identity verification."
  This is the strongest-evidence item in the catalogue: it comes from a **rendered
  github.com page** of Apify's own open-source docs, not a snippet.
- **Sequencing trap:** *billing and payment details must be complete before pricing can be
  defined.* So the KYC gate blocks not just payout but **publishing a priced Actor at all**.
- **Payout mechanics:** invoices on the 11th, 3 days to review, auto-approve on the 14th;
  **minimum $20 PayPal/Wise, $100 other methods**; below minimum, funds carry forward.
- **Unlocks:** revenue line 1 (`products/apify-il-open-data`), the colony's designated core.
- **Note (a real route around it, buy-side only):** Apify put 20,000+ Actors behind **x402 on
  Base** — "no Apify account, billing, or API key required". That unblocks *buying* data with
  the agent's own wallet. It does **not** unblock selling.
- URLs (rendered by sibling scout, github.com):
  https://github.com/apify/apify-docs/blob/master/sources/platform/actors/monetizing/monthly-payouts.mdx ,
  https://github.com/apify/apify-docs/blob/master/sources/platform/actors/monetizing/set-up-monetization.mdx ;
  blocked but binding: https://apify.com/store-terms-and-conditions ,
  https://help.apify.com/en/articles/10057167-how-developer-payouts-work
- Sources: `risk-governance--automation-tos.md` §5, `payment-rails--payoneer-wise.md`.

### C4 — Paddle seller onboarding (three-phase; includes a possible **liveness video**)
- **Steps:** (1) create seller account, choose business type "Individual", supply **tax
  information**, and **accept the Master Services Agreement** — a human contracting act an
  agent may not perform on his behalf; (2) **domain verification** (DNS TXT record; site live
  on HTTPS with T&C, Privacy, Refund, Contact and Pricing pages — *this part is agent work*);
  (3) **identity verification via Sumsub**: government photo ID + proof of address, **and
  sometimes a liveness check — a short selfie video**; (4) payout details: Israeli bank
  (USD/EUR/GBP SWIFT) or Payoneer; (5) answer one email if Paddle asks for more during review.
- **Business identification (shareholder docs) is NOT required for individuals/sole traders.**
- **Time [snippet-only]:** domain review mostly auto, manual "5–7 business days"; identity
  usually instant, manual "1–3 business days".
- **The MISSION collision, stated plainly:** the mandate says the owner does not appear on
  camera. A Sumsub liveness check is exactly that. It is a legitimate one-time KYC exception
  under MISSION §1, but it is a genuine risk that the owner refuses, and the colony must not
  pretend otherwise or plan around it silently.
- **Unlocks:** revenue line 2 (`products/il-biz-tools` Pro) and line 7 (browser-extension Pro).
- **Israel payability:** Paddle supports sellers worldwide except sanctioned countries
  (Russia, Belarus, Iran, North Korea, occupied Ukrainian regions); **Israel is not on that
  list** → YES, medium confidence, snippet-only.
- URLs to open: https://www.paddle.com/help/start/account-verification (+ its
  what-is-domain/identity/business-verification children),
  https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle ,
  https://developer.paddle.com/concepts/sell/supported-countries-locales/
- Sources: `payment-rails--paddle-onboarding.md`, `storefronts--paddle.md`.

### C5 — Etsy + Payoneer (the one entry that is **not** one-time)
- **Steps:** open the shop; **Etsy Payments identity verification via Persona — government ID
  photo + a clear selfie**; enter credit card, bank account and **residential** address;
  the **bank-account name must match the government ID**; enrol Payoneer (own KYC:
  ID, proof of address, 1–3 business days, up to 5–7 with extra documents).
- **Why it is different:** new shops are frequently **auto-suspended pending verification in
  the first hours/days**, and buyer convos / case handling cannot be delegated to software
  under Etsy's rules. So Etsy carries a **recurring** human duty, not a one-time one.
  Under MISSION §1 ("the owner does not talk to customers") this is a **permanent mismatch**,
  not a KYC exception. Say it to the supervisor rather than burying it.
- **Unlocks:** revenue line 3 (Sheets/Notion templates).
- URLs to open: https://help.etsy.com/hc/en-us/articles/360001980067-How-to-Verify-Your-Seller-Information-for-Etsy-Payments ,
  https://help.etsy.com/hc/en-us/articles/115015775908-How-to-Update-and-Verify-Your-Bank-Account-for-Etsy-Payments-Deposits ,
  https://help.etsy.com/hc/en-us/articles/115015710408-Countries-Eligible-for-Etsy-Payments ,
  https://help.etsy.com/hc/en-us/articles/16999319005207-How-Do-I-Use-a-Payoneer-Account-With-Etsy-Payments
- Sources: `storefronts--etsy-digital.md`, `payment-rails--payoneer-wise.md`.

### C6 — US tax forms: **W-8BEN** (the step everyone forgets)
- **Platforms:** Gumroad, Envato/asset marketplaces, Creative Market, and any US-domiciled
  payer. Paddle and Lemon Squeezy as Merchants of Record absorb this differently (they ask
  for "tax information" at signup instead) — **which form Paddle asks a non-US individual for
  is UNCLOSED.**
- **Why unavoidable:** without a foreign-status certification the payer must withhold — Envato
  is explicit: *"If you do not submit your tax information, we can not remit your payments"*;
  Gumroad-side sources put the exposure at up to **30% US withholding on US-sourced income**.
- **Content:** legal name, country of residence, **Foreign TIN** (the Israeli tax number from
  C1 — so C1 gates C6), signature. Individual = W-8BEN; company = W-8BEN-E.
- **Unlocks:** any payout from a US marketplace at full value instead of 70%.
- URLs to open: https://help.author.envato.com/hc/en-us/articles/360000471243-Tax-Information-Form-W-8-Requirements-for-non-US-Authors ,
  https://www.topbubbleindex.com/blog/gumroad-taxes/ ,
  https://www.paddle.com/help/start/intro-to-paddle/essentials-to-sign-upcreate-a-paddle-account
- Sources: `storefronts--asset-marketplaces.md`, `storefronts--gumroad.md`.

### C7 — Gumroad / Lemon Squeezy / Payhip seller identity
- **Gumroad steps:** account; **government photo ID (colour scan, front+back for licences)**;
  **proof of residence in the payout country — P.O. boxes not accepted**; Israeli bank details
  with the name in Latin characters; W-8BEN (C6); generate the API token once.
  Everything after — selling, pricing, fulfilment, support macros — is API-able.
- **Lemon Squeezy steps:** identity verification with a **government-issued ID photo**, plus
  KYC **and KYB**; bank payouts to 79 countries, **PayPal payouts to 200+**, requiring a
  verified PayPal account.
- **Israel payability:** Gumroad **YES via PayPal/bank**; Lemon Squeezy **UNKNOWN, leaning YES
  via PayPal** — Israel was not named in any snippet and the country page is blocked.
  **Stripe (and Lemon Squeezy's successor "Stripe Managed Payments") is NO for an
  Israeli-domiciled seller** — the route Israelis are pushed to is a US LLC + EIN + US bank,
  which is a *company formation*, i.e. far beyond a one-time KYC step and out of scope.
- URLs to open: https://docs.lemonsqueezy.com/help/getting-started/supported-countries ,
  https://docs.lemonsqueezy.com/help/getting-started/verify-your-identity ,
  https://gumroad.com/help/article/13-getting-paid , https://stripe.com/global
- Sources: `storefronts--gumroad.md`, `storefronts--lemonsqueezy-payhip.md`.

### C8 — App-store enrolment: Google Play vs Chrome Web Store vs Apple
- **Chrome Web Store — the cheap one.** One-time **US$5** developer registration fee charged
  at registration [snippet]; needs a Google account (which in practice means **phone-verified
  2FA** — an owner step). **Google deprecated Chrome Web Store payments** (paid items stopped
  charging through CWS from **February 2021**); developers must bring their own processor.
  Consequence: CWS is a **distribution** rail, not a payment rail — **no store payout plumbing,
  no store tax interview, no revenue share**, and Israel payability is inherited from whatever
  rail we already use (Paddle). Cheapest store to be present on.
- **Google Play — AMBER on process, not on money.** One-time **US$25** [snippet]; a Google
  **payments profile** whose **bank account must be in the same country as the profile**; and
  — the load-bearing find — under the **Israeli Payment Service Providers Law**, developers
  with an Israeli billing address must complete **identity verification** within a requested
  window, with **enhanced identity verification mandatory above 50,000 ILS over a trailing
  six months**. That is ~₪8.3k/month — we cross it *before* the first target, so it is not a
  hypothetical. **Whether Israel is on the supported developer/merchant registration list is
  UNKNOWN from our evidence.** Separately, a possible **12-tester closed-testing requirement
  for new personal developer accounts** would be a *structural* blocker: it needs recruiting
  real human testers, which the mandate forbids and which agents may not fake. **Do not
  schedule Play work until that one question is answered.**
- **Apple — a genuine gap, not a dead end.** Zero evidence gathered by any scout. The
  $99/year figure, the Paid Apps agreement and W-8BEN are **memory, therefore not recorded**.
  Independently a poor fit: iOS needs macOS/Xcode signing infrastructure we do not have.
- URLs to open (ranked): https://support.google.com/googleplay/android-developer/answer/9306917 ,
  the Play closed-testing/12-tester policy, 
  https://support.google.com/googleplay/android-developer/answer/7161426 ,
  Google's Israel PSP-Law identity-verification notice,
  https://developer.chrome.com/docs/webstore/register ,
  https://developer.apple.com/support/enrollment
- Source: `payment-rails--app-store-payouts.md`.

### C9 — Telegram: BotFather + Fragment KYC + the crypto off-ramp
- **BotFather (tiny, real):** the bot must be created from the **owner's Telegram account** —
  which is itself **phone-number-verified** — and the token handed to the agents. ~2 minutes,
  no document KYC. This is the cheapest unlock in the whole catalogue: it opens revenue line 6
  (`products/telegram-il-tools-bot`, Telegram Stars) end-to-end.
- **The catch is the off-ramp, not the earning.** Stars accumulate without any KYC, but
  converting them to shekels does not. **Fragment introduced mandatory Sumsub KYC in Nov-2024
  (email, phone, ID scan, selfie)** [snippet, secondary press]. Sources conflict on whether
  withdrawing Stars→TON to a self-custody wallet avoids it. **Treat KYC as required until the
  owner sees his own Fragment page.** Then TON→ILS needs an **Israeli exchange with its own
  KYC** (Bits of Gold holds a Capital Markets Authority licence, 2022; **whether it lists TON
  is unverified** — if not, add an offshore hop).
- **Consequence for the ledger:** Stars earned but not withdrawn are **not banked revenue**
  and must not be counted as such.
- **UNCLOSED:** whether an Israeli-resident account can complete Fragment KYC at all.
- URLs to open: https://fragment.com , https://thearabianpost.com/fragment-now-mandates-kyc-for-blockchain-transactions/ ,
  https://www.binance.com/en/square/post/11-26-2024-telegram-auction-platform-enforces-kyc-verification-16756031639618
- Source: `payment-rails--telegram-stars.md`.

### C10 — Invoicing provider account + API key (Morning / SUMIT / Cardcom)
- **Steps:** open an invoicing account **in the owner's own name** (identity-bound, and it
  depends on C1) and generate an **API key + secret**. One-time; everything after is API —
  Morning has a REST API with sandbox and webhooks, SUMIT covers חשבוניות and
  **allocation numbers**, and community SDKs/MCP servers exist.
- **Why unavoidable:** issuing a legal Israeli invoice/receipt is an act of a registered עוסק.
  No agent can be the issuer.
- **What is NOT yet required:** enrolling in the ITA **מספר הקצאה** (allocation-number) service.
  The threshold applies to a **single invoice above ₪10,000–5,000 net** and our lines are
  per-download / per-event / per-call — two to three orders of magnitude below it. **Do not
  put ITA enrolment on the owner's checklist yet**; do add a threshold assertion in code so
  the day a single enterprise/lifetime invoice crosses it, the colony stops instead of
  invoicing illegally.
- URLs to open: https://www.greeninvoice.co.il/api-docs , https://www.sumit.co.il/invoices ,
  https://www.gov.il/he/service/request-assignment-number-for-tax-invoice
- Source: `payment-rails--invoicing-obligations.md`.

### C11 — The zero-blocker line (why it matters that this entry exists)
- **x402 / USDC on Base** (`products/x402-il-api`) requires **no account, no KYC, no bank, no
  form, no phone**. The agent holds its own wallet. It is the only line that can earn before
  the owner does anything at all — and it can fund the colony's own compute in USDC before any
  conversion to shekels.
- **The blocker is displaced, not absent:** converting USDC→ILS needs an Israeli exchange with
  KYC (same gate as C9). Earning is free; banking it is not.
- Sources: `docs/INCOME_PLAN.he.md` §3 line 5, §8; `research/tiktok/07-ai-money-tooling.md`.

---

## 2. The dependency order (this is the part the checklist was missing)

The repo's existing checklist (`docs/INCOME_PLAN.he.md` §6) lists steps 1–7 but understates
two dependencies. Correct order:

```
C1 תיק עוסק / מע"מ / ביטוח לאומי   ─┬─> gives the Foreign TIN that C6 (W-8BEN) needs
                                    ├─> gives the עוסק status Israeli gateways demand
                                    └─> gives the standing C10 invoicing account requires
C2 PayPal Israel  ──> C3 Apify (payout method) , C7 Lemon Squeezy , C6 marketplaces
C4 Paddle  ──> il-biz-tools Pro , browser-extension Pro
C9 BotFather (2 min)  ──> Telegram Stars line, earning immediately
C11 x402  ──> needs nothing; start here
```

**Cheapest-first ordering for a suspicious owner:** C9 (2 minutes, no documents) → C11 (zero)
→ C1 (unblocks everything else and is legally required anyway) → C2 → C3 → C4.
Etsy (C5) should be *last or never*, because it is the only one with a recurring human duty.

## 3. What an agent must NEVER do here (constitution boundary)
Every entry above is an act of the owner's legal identity. An agent may prepare, explain and
queue, and may do the *non-identity* parts (Paddle's DNS TXT record and legal pages, the API
wiring, the Actor publishing once billing exists). An agent may **not** open an account in his
name, answer an identity check, sign an MSA, submit a W-8BEN, or mark `revenue_setup_done` on
its own initiative. A line blocked on the owner sits in `awaiting_setup` and says so.

## 4. UNCLOSED items, ranked by cost of being wrong
1. Google Play **12-tester** requirement for new personal accounts — decides if Play is usable at all.
2. VAT zero-rating of digital exports under §30(א)(5) with Paddle as MoR — touches every shekel.
3. Whether an Israeli resident can complete **Fragment KYC** — decides if Telegram Stars can be banked.
4. Whether Paddle's Sumsub flow will demand a **liveness video** of this owner — decides two lines.
5. Israel's presence on the Lemon Squeezy and Google Play supported-country lists.

## 5. Dead ends found while cataloguing
- **No product falls out of this criterion.** It is a gate, not a revenue line; its correct
  output is a checklist. Monthly ceiling as a business: ₪0. Selling "KYC-help" to Israelis
  would be a trust/regulated-adjacent business an anonymous agent operation cannot run honestly.
- **Stripe** is not an Israeli-seller rail, and the workaround (US LLC + EIN + US bank) is a
  company formation, not a one-time KYC step. Out of scope by MISSION.
- **Chrome Web Store payments do not exist** — nothing to catalogue on the payout side there.
- **Apple** is unresearched, not researched-and-empty. Requeue with a live search budget.
