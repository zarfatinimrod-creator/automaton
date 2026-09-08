# Scout notes — payment-rails / paddle-onboarding
Date of research: 2026-09-03. Scout: WORKER-SCOUT "paddle-onboarding".
Criterion: Paddle for an Israeli seller — exact onboarding steps, documents, timelines,
rejection reasons, payout mechanics, fees. This gates products/il-biz-tools Pro.

## Evidence quality warning (read first)
The egress proxy blocks **every** Paddle host: `paddle.com`, `developer.paddle.com`,
plus `supportedcountries.com` and `help.boathouse.co` all returned `EGRESS_BLOCKED`.
**Nothing below is a rendered page.** Every claim rests on WebSearch result snippets
that quote Paddle's own help-centre/dev-docs pages. That is weaker evidence than a
fetched page and is marked as such throughout. The exact URLs a human or unblocked
agent must open to close each gap are listed per item.

## What I could NOT verify (open the URL to close)
| Gap | URL to open |
|---|---|
| Israel on the seller-supported / non-sanctioned list, verbatim | https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle |
| Full seller-country + payout-country table | https://developer.paddle.com/concepts/sell/supported-countries-locales/ |
| Whether Paddle collects Israeli VAT (18%) on sales to Israeli buyers | https://www.paddle.com/help/sell/tax/which-countries-does-paddle-charge-sales-tax-or-vat-for |
| Exact tax-info fields asked of a non-US individual (W-8BEN?) | https://www.paddle.com/help/start/intro-to-paddle/essentials-to-sign-upcreate-a-paddle-account |
| Payout currency/method matrix and the $15 SWIFT fee | https://www.paddle.com/help/manage/get-paid/is-there-a-fee-taken-for-payouts ; https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid |
| Whether a rolling reserve is applied to new/low-volume sellers | https://www.paddle.com/help/manage/risk-prevention/understanding-chargebacks-with-paddle |
| Isracard / local Israeli card support at checkout | https://developer.paddle.com/concepts/payment-methods/overview |

## 1. Israel is a supported seller country (payability gate)
- Snippet (search 2026-09-03) from Paddle dev docs: Israel appears among Paddle's
  supported countries in Asia; Paddle "supports sellers and can payout to anywhere in
  the world with exception to sanctioned countries".
- Sanctioned/blocked list named in snippets: Russia, Belarus, Iran, North Korea, and the
  occupied Ukrainian regions (Crimea, Donetsk, Kherson, Luhansk, Zaporizhzhia).
  **Israel is not on it.**
- Verdict: payability to Israel = YES, confidence medium (snippet-only, no rendered page).
- URLs: https://developer.paddle.com/concepts/sell/supported-countries-locales/ ;
  https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle ;
  https://www.paddle.com/help/legal/sanctions

## 2. Onboarding is a three-phase verification; individuals skip one phase
Snippets from https://www.paddle.com/help/start/account-verification and its children:
1. **Domain verification** — prove you own the checkout domain by adding a DNS TXT record
   with a code Paddle emails you. Site must be live over HTTPS with a valid SSL cert, and
   must carry Terms & Conditions (containing the company name, or for a sole trader the
   legal name), Privacy Policy, Refund Policy, Contact page, and Pricing page. Also a
   content review against the Acceptable Use Policy.
   *Timeline: mostly auto-approved; manual review "estimated 5-7 business days".*
2. **Identity verification (KYC)** — run through Paddle's partner **Sumsub**: government
   -issued photo ID plus proof of address, and sometimes a **liveness check (short selfie
   video)**. *Timeline: usually instant; manual review "estimated 1-3 business days".*
3. **Business identification** — shareholder/ownership documentation. Snippet states this
   step is **not required for individuals or sole traders**.
   *Timeline: often instant; manual review "estimated 2-4 business days".*
- Signup itself asks for business type (choose "Individual") and **tax information**.
- Sources (snippets): https://www.paddle.com/help/start/account-verification ;
  .../what-is-domain-verification ; .../what-is-identity-verification ;
  .../what-is-business-verification ;
  https://www.paddle.com/help/start/intro-to-paddle/essentials-to-sign-upcreate-a-paddle-account ;
  https://developer.paddle.com/build/set-up-checklist/

## 3. No company required — an Israeli individual / osek can sell
- Snippet: "Paddle does not require you to establish a separate legal entity such as a
  corporation or limited company. You can sell as an individual but must abide by your
  local laws regarding taxes and declarations." Choose "Individual" as business type.
- Practical Israeli consequence (my inference, not Paddle's words): the owner still needs
  Israeli tax standing to legally book the income — osek patur/murshe or a company. That
  is an Israeli-law question, not a Paddle gate.
- Source (snippet): https://www.boathouse.co/paddle-video-series-episode/3-do-you-need-to-incorporate-to-sell-with-paddle ;
  https://help.boathouse.co/guides/beginners-guide-to-paddle/faq-can-i-sell-via-paddle-as-an-individual (BLOCKED, snippet only)

## 4. Rejection reasons (what actually kills an application)
Snippets from the domain-review and AUP pages:
- Product not aligned with the **Acceptable Use Policy**.
- Domain flagged as high-risk / T&Cs not followed.
- Failure to respond to Paddle's request for more information.
- Missing/insufficient reseller or product-ownership documentation when reselling
  third-party product.
- KYC document quality: colour photos only (no black-and-white, no photocopies), all four
  corners visible, nothing cropped or blurred, name/DOB/expiry legible.
- AUP prohibits, among others: physical products; human services unrelated to software;
  IP-infringing product; **automated social-media marketing products**; adult and
  age-restricted content; regulated financial products.
- Appeal: reply to the rejection email.
- Third-party reports of slow/backlogged verification exist (a LinkedIn post, a Medium
  write-up "How I Got My SaaS Platform Approved on Paddle", a dev.to "approved in 48
  hours" post). All BLOCKED to me; treat as anecdote, not evidence.
- URLs: https://www.paddle.com/help/start/account-verification/what-is-domain-verification ;
  https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle ;
  https://msalinas92.medium.com/how-i-got-my-saas-platform-approved-on-paddle-without-losing-my-mind-738e7f70cc45 (blocked)

## 5. Payout mechanics — the part that constrains an Israeli operator
Snippets from the get-paid help pages:
- **Schedule is monthly and not on demand.** If your balance is over the threshold, Paddle
  creates the payout on the **1st** and sends it **by the 15th**; up to 3 further working
  days to land. Balance under threshold rolls to the next month.
- **Minimum threshold $100** (settable up to $100,000).
- **Methods**: bank transfer, PayPal, Payoneer. Wise-style accounts work only insofar as
  they give you IBAN/SWIFT details.
- **Balance currencies**: USD, GBP, EUR, AUD, CAD. **Payout currencies**: AUD, GBP, CAD,
  CNY, CZK, DKK, EUR, HUF, PLN, ZAR, SEK, CHF, USD. **ILS is on neither list.**
- **Bank transfer supported only for EUR, GBP, USD.**
- Fee: free when payout currency matches the bank's local currency; otherwise SWIFT with a
  **$/€/£15 wire fee**. Since ILS is not payable, an Israeli bank account means a
  cross-currency USD SWIFT → expect the $15 per payout plus the bank's own conversion
  spread. Payoneer is USD-only and adds Payoneer's fees; PayPal adds PayPal's fees.
- **Reverse invoice / self-billing**: Paddle self-bills — for each payout it generates a
  Statement, one or more **Reverse Invoices** and a Remittance Advice, emailed to admins.
  So the owner does not have to raise an invoice to Paddle for the payout; whether the
  Israeli Tax Authority accepts that in place of a Hebrew חשבונית מס is an accountant
  question and is a real open item (Israel's mandatory e-invoice allocation-number regime,
  חשבונית ישראל, applies above thresholds).
- URLs: https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid ;
  https://www.paddle.com/help/manage/get-paid/is-there-a-fee-taken-for-payouts ;
  https://www.paddle.com/help/manage/get-paid/do-i-need-to-invoice-paddle-for-my-payout ;
  https://www.paddle.com/help/manage/get-paid/what-statements-will-i-receive ;
  https://developer.paddle.com/concepts/sell/supported-currencies/ ;
  https://www.paddle.com/help/manage/get-paid/can-i-be-paid-in-my-local-currency ;
  https://www.paddle.com/help/start/set-up-paddle/how-do-i-change-my-default-(balance)-currency

## 6. Fees
- Headline (snippets, multiple third-party sources agreeing): **5% + $0.50 per transaction**
  on the pay-as-you-go plan, no monthly fee. This is all-in: MoR, global tax
  registration/remittance, fraud, chargeback handling, subscription billing.
- Third-party commentary flags additional real costs: ~1% FX spread, payout wire fees,
  PayPal surcharges. Third-party blog, not Paddle — weak evidence.
- Arithmetic for il-biz-tools Pro (mine, not sourced): at a 39 ILS/month price point
  (~$10.5), Paddle takes ~$1.03, i.e. **~10% effective**, because the $0.50 is fixed.
  At 99 ILS/month (~$27) it falls to ~6.9%. Small-ticket Hebrew tooling is the worst case
  for Paddle's fee shape; annual billing materially improves it.
- Chargeback rate above **0.65%** triggers Paddle risk-team intervention.
- URLs: https://www.g2.com/products/paddle/pricing ;
  https://dodopayments.com/blogs/paddle-fees-explained (competitor blog — biased) ;
  https://www.paddle.com/help/manage/risk-prevention/understanding-chargebacks-with-paddle

## 7. Unresolved and material for il-biz-tools specifically
- **Does Paddle charge Israeli VAT to Israeli buyers?** Israel taxes digital services at
  18% and requires non-resident vendors to register via a local representative. If Paddle
  is registered in Israel, our Hebrew-language product priced for Israeli buyers gets 18%
  added at checkout (or absorbed). If Paddle is *not* registered for Israel, the liability
  question lands back on us. This is the single most important open item for a product
  whose entire buyer base is Israeli. Open
  https://www.paddle.com/help/sell/tax/which-countries-does-paddle-charge-sales-tax-or-vat-for
- **Local Israeli card/wallet coverage.** Paddle's listed methods are international card
  schemes (Visa/Mastercard/Amex/Maestro/CB/Diners/Discover/JCB/UnionPay) plus wallets and
  Korean local cards; no evidence found of Isracard, Bit, or PayBox support. Israeli
  buyers who pay with Bit or a local-only card cannot check out.
  Open https://developer.paddle.com/concepts/payment-methods/overview
- **Rolling reserve**: no Paddle-specific evidence found either way for a new low-volume
  seller. Generic industry snippets (5-10%, 30-180 days) are not Paddle facts.

## Owner blockers (one-time human steps — do not assume any are done)
1. Create the Paddle seller account and choose business type (Individual / company).
2. Submit tax information (national tax ID; likely a W-8BEN-equivalent declaration of
   non-US status).
3. Sumsub KYC: upload government photo ID + proof of address, and possibly record a
   liveness selfie video. **This is a camera step and it is unavoidable** — it is exactly
   the legally-required identity exception MISSION.md allows.
4. Add the DNS TXT record for domain verification (agent-doable if the owner delegates
   DNS; otherwise owner).
5. Configure payout details: bank/Payoneer/PayPal account in the owner's legal name, plus
   payout currency and threshold.
6. Respond to any Paddle follow-up email during review.
7. Israeli side: have tax standing (osek/company) and an accountant's answer on whether
   Paddle's reverse invoice satisfies Israeli bookkeeping and the חשבונית ישראל regime.

## ToS / constitution assessment
GREEN for our use. Selling access to a Hebrew SaaS/calculator tier is squarely within
Paddle's permitted categories; nothing in our plan touches the AUP's prohibited list.
The only AUP-adjacent risk in the wider colony is "automated social-media marketing
products", which we do not sell.

## Dead ends
- No Israeli-specific Paddle case study, forum thread, or founder report found anywhere.
  Israel appears to be an unremarkable supported country with zero published friction —
  but also zero published confirmation. Nobody has written this up.
- No Paddle-published minimum revenue or reserve policy for new sellers found.
- No evidence found of Paddle supporting ILS as a balance or payout currency; there is
  positive evidence it is absent from both published lists.
