# WORKER-SCOUT: storefronts / paddle

Date of research: 2026-09-03
Group: storefronts (marketplaces/rails that pay an Israeli software-only seller)
Criterion: **Paddle as merchant of record** — exact onboarding and approval bar for a new
Israeli seller, documents demanded, review time, product types accepted and refused,
payout to an Israeli bank, and reports of rejections.

## Method and its limits — read before trusting anything below

`WebFetch` was blocked by the container's egress proxy for **every** host I tried:
`www.paddle.com`, `developer.paddle.com`, `news.ycombinator.com`, `dev.to`,
`supportedcountries.com`, `unibee.dev`, `help.boathouse.co`, `freemius.com`,
`www.merchantofrecordfinder.com` — all `EGRESS_BLOCKED`. Same pattern the
lemonsqueezy/payhip scout hit.

So **every fact below comes from WebSearch result snippets** that quote those pages, not
from a page I rendered. That is an evidence downgrade. It is why "is Israel on an explicit
Paddle supported-seller list" is **UNKNOWN-leaning-YES** rather than a hard YES, and why the
"3 months of processing statements" requirement is reported as *seller complaints* rather
than as documented policy.

**Two URLs a human or unblocked agent must open to close this:**
1. https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle (full unsupported-country list — confirm Israel absent from it)
2. https://www.paddle.com/help/manage/get-paid/can-i-be-paid-in-my-local-currency (confirm payout currencies and whether ILS is payable)

## URLs seen in search results (evidence base)

Paddle official (snippets only, pages not renderable from here):
- https://www.paddle.com/help/start/account-verification
- https://www.paddle.com/help/start/account-verification/what-is-account-verification
- https://www.paddle.com/help/start/account-verification/what-is-identity-verification
- https://www.paddle.com/help/start/account-verification/what-is-business-verification
- https://www.paddle.com/help/start/account-verification/what-is-domain-verification
- https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle
- https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle
- https://www.paddle.com/help/start/intro-to-paddle/what-currencies-do-you-support
- https://www.paddle.com/help/start/intro-to-paddle/which-payment-methods-do-you-support
- https://www.paddle.com/help/start/intro-to-paddle/how-paddle-is-able-to-take-on-your-vat-and-tax-responsibilities
- https://www.paddle.com/help/sell/tax/how-paddle-handles-vat-on-your-behalf
- https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid
- https://www.paddle.com/help/manage/get-paid/can-i-be-paid-in-my-local-currency
- https://www.paddle.com/help/manage/get-paid/is-there-a-fee-taken-for-payouts
- https://www.paddle.com/help/legal/sanctions
- https://www.paddle.com/help/legal/sanctions/impact-of-sanctions-on-russia-and-belarus
- https://www.paddle.com/legal/terms , /legal/refund-policy , /legal/buyer-terms
- https://developer.paddle.com/concepts/sell/supported-countries-locales/
- https://developer.paddle.com/concepts/sell/supported-currencies/

Third-party / seller reports:
- https://news.ycombinator.com/item?id=41179262 — "Chicken-and-egg: paddle payment rejected me as I have no processing statements"
- https://www.trustpilot.com/review/paddle.com (and pages 4, 8)
- https://www.capterra.com/p/173382/Paddle/reviews/
- https://www.g2.com/products/paddle/reviews
- https://checkthat.ai/brands/paddle/reviews , https://checkthat.ai/brands/paddle/pricing
- https://www.boathouse.co/paddle-video-series-episode/4-paddle-rejected-my-business-give-up-or-persevere
- https://www.boathouse.co/paddle-video-series-episode/2-preparing-your-website-for-paddle-verification
- https://www.boathouse.co/paddle-video-series-episode/1-what-can-you-sell-on-paddle-the-acceptable-use-policy
- https://www.boathouse.co/paddle-video-series-episode/34-aup-update-gen-ai
- https://help.boathouse.co/guides/beginners-guide-to-paddle/faq-why-did-paddle-reject-my-business
- https://dev.to/danteisshipping/2025-how-to-get-your-paddle-account-approved-in-48-hours-277a
- https://dev.to/onsen/paddle-review-2026-pros-cons-pricing-explained-4cgk
- https://freemius.com/blog/payment-platform-restrictions-ai-apps/
- https://dodopayments.com/blogs/paddle-fees-explained
- https://www.merchantofrecordfinder.com/providers/paddle
- https://supportedcountries.com/paddle/
- https://unibee.dev/blog/paddle-review-features-pricing-pros-cons/
- https://wpsmartpay.com/how-to-transfer-money-from-paddle-to-payoneer/
- https://www.capterra.co.il/software/173382/paddle

## 1. The approval bar, as documented

Account verification has **three separate gates** (Paddle help center, verification section):

**a. Identity verification (KYC).** "If you are an individual or sole trader, you will be the
person required to do the identity verification check." Run through **Sumsub**. Documents:
government-issued ID plus proof of address; "in some cases Sumsub will also ask you to
complete a quick liveness check — a short video that confirms it's really you." Paddle says
most sellers finish it "in just a few minutes."
Source snippet: /help/start/account-verification/what-is-identity-verification

**b. Business identification.** Explicitly **not required for individuals or sole traders**.
A company seller supplies registration documents.
Source: /help/start/account-verification/what-is-business-verification

**c. Domain review.** Paddle reviews the domain(s) you will sell from against its T&C and
Acceptable Use Policy. Requirements reported: **Terms and Conditions, Refund Policy, and
Privacy Policy clearly reachable from site navigation**; the company name or sole
proprietor's brand named inside the T&C; the site **live and on HTTPS with a valid SSL
certificate**; custom/enterprise pricing sheets if applicable. Information may be spread
across the main domain and subdomains but must be easy to find. Only submit domains
directly related to the product sold through Paddle.
Timing: "Paddle automatically approves most domain submissions"; manual review is
"typically completed within an estimated 5-7 business days" — an estimate, not a guarantee.
Rejection reasons named: product not aligned with the AUP; domain flagged high-risk;
failure to respond to a request for more information.
Source: /help/start/account-verification/what-is-domain-verification

**d. The undocumented gate.** Paddle "may ask for … a processing statement from your
payment processor covering the last 3 months", with a stated caveat that a new business
without one is "taken into account". Sellers report otherwise: multiple Trustpilot/HN
reports of rejection after ~a week specifically for having no 3-month processing history,
which reviewers call an undisclosed requirement ("nowhere on their website, not in their
help docs, or during signup"). The HN thread title is literally
"Chicken-and-egg: paddle payment rejected me as I have no processing statements"
(https://news.ycombinator.com/item?id=41179262).
**This is the single biggest risk to our approval**, because our products are pre-revenue.

Counter-evidence: a 2025 dev.to walkthrough claims approval "in 1-2 days" / "48 hours"
with proper preparation. Both things are probably true — prepared, clearly-software,
policy-compliant sites go through fast; anything ambiguous gets the statements demand.

## 2. Product types accepted and refused (AUP)

Accepted: B2B SaaS, consumer software, games, cloud services, software licences, and —
per third-party summaries of the AUP — ebooks and online courses as digital products.
Refused: physical products or anything requiring physical delivery; **human services not
related to a software offering (consulting, advisory)**; offerings with no bona fide
software/service — donations, crowdfunding, community access; gambling.
Restricted/enhanced due diligence, per the 2026 gen-AI AUP update: **AI image generators,
face swap, deepfakes, voice cloning/impersonation**, and **automated social-media marketing
/ mass-marketing products**. AI used as a *feature* (an AI writing assistant, an AI code
editor) is fine.
Sources: /help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle ;
boathouse episode 34 (AUP update, gen-AI) ; freemius.com/blog/payment-platform-restrictions-ai-apps/

**Direct consequence for this colony:** our Hebrew calculator/Pro tier and any SaaS API are
in-policy. Any line that is really consulting-by-agent, or a social-media automation tool,
or a face/voice generator, is out on Paddle — build those elsewhere or not at all.

## 3. Payouts to Israel

- Country reach: "Paddle supports sellers and can payout to anywhere in the world with
  exception to sanctioned countries." Named unsupported/sanctioned: Russia, Belarus, Iran,
  North Korea. **Israel is not named as sanctioned or unsupported anywhere I saw.**
- Payout methods: **bank/wire transfer (ACH, SEPA, international SWIFT) or Payoneer**;
  PayPal is also reported as a payout method.
- Payout currency: bank transfer is reported to support **USD, EUR, GBP** (some sources add
  AUD, CAD). **ILS is a supported *selling* currency but is not reported as a payout
  currency** — an Israeli seller takes USD (or EUR/GBP) and converts at their own bank.
- Schedule: balance above your threshold (**minimum $100**, adjustable up to $100,000)
  converts to a payout **on the 1st**, paid **by the 15th**, arriving up to 3 working days
  later. So the first shekel from a first sale can land **~6 weeks** after that sale.
- Fees: platform fee **5% + $0.50 per transaction** on the standard plan, no monthly fee.
  Payout fee: usually none, but a **$15 SWIFT fee** applies for certain countries — an
  Israeli USD wire is an international SWIFT transfer, so budget for it, plus the receiving
  bank's own charges and FX spread (third-party analyses cite conversion margins of ~1.5%
  and up).
Sources: /help/manage/get-paid/when-and-how-do-i-get-paid ;
/help/manage/get-paid/is-there-a-fee-taken-for-payouts ;
/help/manage/get-paid/can-i-be-paid-in-my-local-currency ;
dodopayments.com/blogs/paddle-fees-explained

**Verdict on payability to Israel: YES (medium confidence).** Nothing found excludes Israel;
payout rails (SWIFT USD wire, Payoneer) reach Israel normally; ILS payout appears
unavailable. Not upgraded to high confidence because I could not render the supported-
countries page and found **no first-hand report by a named Israeli Paddle seller**.

## 4. Tax position for the owner

Paddle is the **merchant of record / reseller of record**: it registers, charges and remits
VAT/GST/sales tax in 100+ jurisdictions and invoices the buyer in its own name. The owner
therefore does not handle buyer-side VAT. What remains is the owner's own Israeli reporting
of Paddle *payouts* as income — which is exactly what products/il-biz-tools/README.md
already states. Sources: /help/sell/tax/how-paddle-handles-vat-on-your-behalf ;
/help/start/intro-to-paddle/how-paddle-is-able-to-take-on-your-vat-and-tax-responsibilities

## 5. Reports of rejection and of post-approval risk

- Rejection for no 3-month processing statements — HN 41179262; Trustpilot reviews quoted in
  search results calling the onboarding "completely broken" and a "verification deadlock"
  lasting over a week.
- Post-approval risk, from Trustpilot/Capterra review summaries: accounts closed without
  clear explanation with completed sales auto-refunded and the balance withheld; one report
  of an account closed after 5 years with funds withheld 13+ months; one of $11,500 held
  7 months. Support response times of 2-3 days typical, 10+ days for payment issues.
  I could not open Trustpilot itself, so these are review-aggregator summaries — treat as
  directionally real (they are numerous and consistent) but not individually verified.
- Practical read: Paddle is a legitimate, widely-used MoR (a Capterra Israel listing exists,
  and Paddle's own site claims 200+ countries of sale), but it is **not a rail to hold a
  large balance on**. Keep the payout threshold at the $100 minimum so money moves out
  monthly rather than accumulating.

## 6. Owner blockers (one-time, human, legally required — do not assume done)

1. Create the Paddle seller account and accept the Master Services Agreement (a human must
   contract; an agent may not sign for him).
2. **Sumsub identity check**: upload government ID + proof of address. **A liveness check —
   a short video — may be demanded.** MISSION says the owner does not appear on camera; this
   is a KYC exception, but it must be stated plainly rather than glossed over, and it is a
   genuine risk that he refuses.
3. Enter payout details: Israeli bank (USD/EUR/GBP SWIFT) or a Payoneer account; set the
   payout threshold.
4. Respond once to any Paddle request for more information during domain review (email).
5. Israeli tax reporting of received payouts.
Everything else — the site's legal pages, the checkout wiring, the price objects, the
webhooks, the ledger — is software and is ours.

## 7. Dead ends found

- No renderable Paddle page from this container; snippet-only evidence throughout.
- No explicit "Israel supported" statement located; only the negative "anywhere except
  sanctioned countries" formulation.
- No ILS payout currency found.
- No first-hand Israeli Paddle seller write-up found in English or Hebrew search.
- No public SLA on approval time; "5-7 business days" is Paddle's own estimate for manual
  domain review only, and says nothing about the KYC or processing-statement stages.
