# WORKER-SCOUT: storefronts / lemonsqueezy-payhip

Date of research: 2026-09-03
Group: storefronts (marketplaces that pay an Israeli software-only seller)
Criterion: Lemon Squeezy (post Stripe acquisition) and Payhip — merchant-of-record status,
whether an Israeli seller can onboard today, VAT/tax handling, fees, payout rails,
current status of new signups.

## Method and its limits (read this before trusting anything below)

The container's egress proxy blocked **every** direct `WebFetch` I attempted:
`www.lemonsqueezy.com`, `docs.lemonsqueezy.com`, `payhip.com`, `help.payhip.com`,
`stripe.com`, `docs.stripe.com`, `dodopayments.com`, `en.wikipedia.org` all returned
`EGRESS_BLOCKED`. `curl http://127.0.0.1:40307/__agentproxy/status` confirms a
policy-denial pattern (403 to CONNECT) for arbitrary hosts.

Therefore **every fact below comes from WebSearch result snippets**, not from a page I
rendered myself. That is a real evidence-quality downgrade and it is why the two central
questions — "is Israel on Lemon Squeezy's supported-countries list" and "is Israel on
Payhip's Stripe-country list" — come back UNKNOWN rather than YES. Both lists exist on
pages I could not open. **A human or an unblocked agent must open two URLs to close this:**

1. https://docs.lemonsqueezy.com/help/getting-started/supported-countries
2. https://payhip.com/payment-gateways  (and https://help.payhip.com/article/65-connecting-your-stripe-account)

Until then, treat "Israel payable" on both as UNKNOWN-leaning-YES-via-PayPal.

## URLs seen in search results (used as evidence)

Lemon Squeezy / Stripe:
- https://www.lemonsqueezy.com/blog/2026-update — "2026 Update: Lemon Squeezy + Stripe Managed Payments"
- https://www.lemonsqueezy.com/blog/stripe-acquires-lemon-squeezy
- https://www.lemonsqueezy.com/blog/stripe-lemon-squeezy-update-2025
- https://finovate.com/stripe-acquires-lemon-squeezy-for-undisclosed-amount/
- https://x.com/lmsqueezy/status/1816873931409866871 — acquisition announcement, "help build a global merchant of record solution"
- https://docs.lemonsqueezy.com/help/getting-started/supported-countries
- https://docs.lemonsqueezy.com/help/getting-started/getting-paid
- https://docs.lemonsqueezy.com/help/getting-started/verify-your-identity
- https://docs.lemonsqueezy.com/help/getting-started/activate-your-store
- https://docs.lemonsqueezy.com/help/getting-started/prohibited-products
- https://docs.lemonsqueezy.com/api/webhooks/create-webhook
- https://docs.lemonsqueezy.com/guides/developer-guide/getting-started
- https://docs.lemonsqueezy.com/guides/developer-guide/taking-payments
- https://docs.lemonsqueezy.com/help/licensing
- https://x.com/lmsqueezy/status/1405523942949867520 — "bank payouts to 79 countries and PayPal payouts to 200+ countries"
- https://www.lemonsqueezy.com/blog/new-bank-payouts
- https://www.lemonsqueezy.com/pricing
- https://stripe.com/managed-payments
- https://dodopayments.com/blogs/stripe-managed-payments-fees-explained
- https://dodopayments.com/blogs/stripe-supported-countries-alternatives
- https://www.paddle.com/resources/stripe-managed-payments
- https://www.swell.is/content/lemon-squeezy-pricing
- https://owelet.app/blog/lemon-squeezy-fees-2026
- https://getstacksmart.com/blog/lemon-squeezy-merchant-of-record-fees-2026
- https://www.trustpilot.com/review/lemonsqueezy.com

Payhip:
- https://payhip.com/features/vat-taxes
- https://payhip.com/payment-gateways
- https://payhip.com/blog/new-feature-payhip-integrates-with-11-new-payment-gateways/
- https://payhip.com/blog/whats-new-at-payhip-2025/
- https://payhip.com/api-reference
- https://help.payhip.com/article/65-connecting-your-stripe-account
- https://help.payhip.com/article/64-connecting-your-paypal-account
- https://help.payhip.com/article/173-how-do-i-get-paid
- https://help.payhip.com/article/174-taxes-for-digital-products
- https://help.payhip.com/article/127-digital-eu-vat
- https://help.payhip.com/article/205-what-products-are-not-allowed-on-payhip
- https://help.payhip.com/article/347-public-api
- https://help.payhip.com/category/48-developer
- https://sellfy.com/blog/payhip-pricing/
- https://www.passivekit.com/payhip-pricing/
- https://fungies.io/payhip-review-2026/
- https://dodopayments.com/blogs/payhip-review

Israel payment rails:
- https://stripe.com/resources/more/payments-in-israel
- https://thepaypers.com/payments/news/stripe-unveils-its-operations-in-israel
- https://www.doola.com/stripe-guide/how-to-open-a-stripe-account-in-israel/
- https://leverage.it/withdraw-paypal-to-israeli-bank-accounts/
- https://en.globes.co.il/en/article-1000514257
- https://www.paypal.com/il/cshelp/article/how-do-i-link-a-bank-account-to-my-paypal-account-help183
- https://www.paypalobjects.com/marketing/ua/OA/useragreement-full/en-IL-070626.pdf — PayPal IL user agreement, last updated 6 July 2026
- https://www.creem.io/blog/israel-vat-rate-guide-for-digital-sellers-in-2026

## Findings

### 1. Lemon Squeezy as MoR storefront — still open, still 5% + $0.50

- Stripe acquired Lemon Squeezy (announced July 2024, terms undisclosed) explicitly "to help
  build a global merchant of record solution" (X post 1816873931409866871; finovate.com).
- As of the platform's own 2026 update post (lemonsqueezy.com/blog/2026-update), Lemon Squeezy
  **is still live, still priced the same, and still accepting new signups. No shutdown date
  has been announced.** Search on "signups closed/paused September 2026" returned nothing.
- It is a genuine Merchant of Record: it is the seller of record, and it collects and remits
  digital sales taxes globally (lemonsqueezy.com/reporting/merchant-of-record).
- Fees as of mid-2026: **5% + $0.50 per sale**, no monthly fee, processing bundled in.
  Surcharges reported: international cards +1.5%, PayPal +1.5%, subscriptions +0.5%,
  recovered carts +5%, affiliate referrals +3%. Payouts: US bank free, **international bank
  payout 1% per payout**. (swell.is, owelet.app, getstacksmart.com — all secondary, all 2026.)
  Effective take on a $50 sale ≈ 6.0%; for an Israeli seller taking international cards and a
  1% international payout fee, budget **~8–9% all-in**, not 5%.
- Payout rails: **bank payouts to 79 countries, PayPal payouts to 200+ countries**
  (x.com/lmsqueezy/1405523942949867520; docs "Getting Paid"). PayPal payouts are always USD
  and require a verified Personal or Business PayPal account.
- Onboarding: identity verification with a **government-issued ID photo**, plus KYC & KYB
  review of the store; approval typically 1–2 business days
  (docs/verify-your-identity, docs/activate-your-store).
- API surface is full: create products, create checkouts, webhooks with signing secret,
  license-key API, official SDKs (docs.lemonsqueezy.com/api/..., /guides/developer-guide/...).
  This is the decisive operational point — an agent can run a Lemon Squeezy store end to end
  after the one-time human ID step. Payhip cannot say the same (see below).
- Prohibited: **services of any kind** (marketing, design, dev, consulting), PLR/MRR resale
  products, anything you don't hold IP rights to, drugs/alcohol/tobacco/vaping, and
  **NFT & crypto-related products** (docs/prohibited-products). Software, SaaS, ebooks, PDFs,
  design assets, audio, video are all explicitly fine.
- **Israel payability: UNKNOWN.** Docs say "hundreds of supported countries" and PayPal
  payouts to 200+ countries; Israel is not named in any snippet I could see, and the actual
  country list page is behind the egress block. PayPal Israel *can* receive USD and withdraw
  to Israeli bank accounts in ILS (leverage.it; globes.co.il; paypal.com/il help article), so
  the payout leg is plausible. The unresolved question is whether Lemon Squeezy accepts an
  Israel-domiciled merchant at KYB. Must be verified by opening the supported-countries page
  or by attempting a signup.
- ToS risk: **GREEN** for selling our own software/digital products honestly. AMBER only if
  we tried to sell "services", which the mission's products do not.

### 2. Stripe Managed Payments (the successor Lemon Squeezy is steering people to) — likely NO for Israel

- The Lemon Squeezy team is now building **Stripe Managed Payments**, Stripe's own MoR
  product; CEO JR Farr has called it "the future" and the stated goal is to give Lemon
  Squeezy users an easy migration path (lemonsqueezy.com/blog/2026-update).
- Access is **by waitlist / invite today**; the CEO said in June 2026 that public signup
  without an invite is coming. No date.
- Fee: **3.5% on top of standard Stripe Payments fees** (stripe.com/managed-payments;
  dodopayments fee breakdown) — i.e. roughly 6.4%+ all-in, comparable to Lemon Squeezy.
- Availability: **~35 countries as of May 2026**, North America / Western Europe / a few APAC.
  Stripe itself is **not an officially supported country for businesses in Israel** — Stripe
  has an Israel presence and Israel-facing marketing pages, but the standard route Israelis
  are told to take is a US LLC + EIN + US bank (doola guide; stripe.com/resources/more/payments-in-israel;
  thepaypers). Lemon Squeezy's own 2026 post tells non-Stripe-country merchants to use
  **Stripe Atlas** to incorporate a US C-Corp or LLC.
- **Israel payability: NO** as an Israeli-domiciled entity today; YES only via a US entity,
  which is a company formation the owner would have to do personally (and which carries US
  tax filing obligations). This is a strategic risk to any Lemon Squeezy build: the platform's
  own stated future may not be available to us on the same terms.
- ToS risk: GREEN as a product; AMBER as a *plan*, because the migration target may exclude us.

### 3. Payhip — NOT a merchant of record; you keep the tax liability

- Payhip is **not** an MoR in the Paddle/Lemon-Squeezy sense. You remain the merchant; Stripe
  or PayPal is your own processor and money lands in **your** account
  (fungies.io/payhip-review-2026; dodopayments payhip review; help.payhip.com/article/173).
- Partial tax coverage only: Payhip acts as reseller and is responsible for **digital EU and
  UK VAT**, and is a **marketplace facilitator in the US / digital platform operator in
  Canada** for sales tax (payhip.com/features/vat-taxes; help article 127 and 174). Everything
  else — Australian GST, and critically **Israeli VAT on the seller side** — is yours.
- Fees: Free $0/mo at **5%**, Plus **$29/mo at 2%**, Pro **$99/mo at 0%**; identical feature
  set on all three. **Stripe/PayPal processing (~2.9% + $0.30) is on top on every plan**
  (sellfy.com/blog/payhip-pricing; passivekit.com/payhip-pricing). Break-evens quoted:
  Free below ~$967/mo, Plus to ~$3,500/mo, Pro above.
- Payout rail: there is no Payhip payout — funds settle straight into your connected
  Stripe/PayPal. This is actually a *plus* for cash-flow and a *minus* for compliance.
- Gateways: 13 processors — Stripe, PayPal, Square, Mollie, Mercado Pago, Paystack,
  Flutterwave, PayU, Razorpay, Iyzico, Midtrans, Xendit, PayTabs
  (payhip.com/payment-gateways; payhip.com/blog/new-feature-payhip-integrates-with-11-new-payment-gateways/).
  The Stripe country list quoted in that page (40+ countries: Austria…US) **does not include
  Israel**; the PayPal list quoted (200+ countries) does not name Israel either but PayPal
  demonstrably operates in Israel with ILS bank withdrawal.
- **Israel payability: UNKNOWN, leaning YES via PayPal only.** PayPal IL supports business
  accounts, receiving payments, and withdrawal to Israeli bank accounts in ILS
  (leverage.it; globes.co.il; PayPal IL user agreement PDF dated 6 July 2026). Stripe-on-Payhip
  for an Israeli entity is almost certainly NO without a US entity.
- API: **coupons and license keys only**, plus webhooks. Payhip's own docs say the API "is
  currently limited in scope, with plans to expand to support many more resource types"
  (payhip.com/api-reference; help.payhip.com/article/347-public-api). **You cannot create
  products via API.** For a mission where "the owner does nothing", that means product
  publishing on Payhip is either manual owner work (violates the mandate) or browser
  automation of a logged-in dashboard (fragile and ToS-AMBER).
- ToS: prohibits cannabis, unlicensed medical advice, scraped/lead lists, card-sharing
  software, and anything illegal in your own jurisdiction; sellers must also satisfy
  PayPal/Stripe rules (help.payhip.com/article/205).
- ToS risk for our use: **GREEN** for the storefront itself; the AMBER is operational
  (UI automation), not legal.

### 4. Where Payhip's remaining edge actually is: PayPal-only checkout for the Israeli seller

The one thing Payhip does that Lemon Squeezy's payout rail does not settle for us is
**taking money without any MoR onboarding at all**. If Lemon Squeezy's KYB rejects an
Israeli merchant, Payhip + a PayPal Israel business account is a rail that is documented to
work for Israelis end to end, at 5% (Free plan) + PayPal's own fees, with zero platform
onboarding risk. It is a fallback, not a primary: PayPal-only checkout costs conversion
versus card checkout, and the Israeli VAT/invoicing burden lands on the owner.

### 5. Honest ceiling

Neither of these is an income line. **They are payment plumbing.** A no-brand new entrant
publishing a Hebrew digital product on Lemon Squeezy or Payhip in month one earns whatever
the demand is, minus ~6–9%. The storefront changes the *take rate and the tax burden*, not
the demand. Estimated realistic first-90-day revenue attributable to *choosing* one of these
over the existing Paddle setup: **0 ILS**. The value is optionality and a lower tax-compliance
load, not new money. Any finding that claims otherwise is padding.

## Dead ends and unresolved

- Could not confirm Israel on either supported-country list — egress blocked. This is the
  single most important open item and it is cheap to close (two page opens).
- Found **no** Israeli-seller first-hand account of Lemon Squeezy or Payhip in search results
  (Reddit/Indie Hackers searches came back empty on Israel specifically).
- Found nothing on how Lemon Squeezy handles **Israeli VAT for Israeli buyers**, i.e. whether
  it charges 18% ILS VAT to a customer in Israel and issues a compliant invoice. UNKNOWN.
- No evidence of any Lemon Squeezy signup freeze; the "they're winding down, grab an account"
  urgency you see in third-party blogs is not supported by the platform's own 2026 post.
- Stripe Managed Payments' actual 35-country list was not obtainable; only the summary
  "North America, Western Europe, a few APAC" plus the exclusion list (India, Indonesia,
  Philippines, Pakistan, Nigeria, most emerging markets).
