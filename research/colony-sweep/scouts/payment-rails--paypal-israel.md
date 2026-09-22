# Scout notes — payment-rails / "paypal-israel"

Criterion: **PayPal for an Israeli business: account requirements, withdrawal to an Israeli bank, fees, and known freezing problems.**
Scout: WORKER-SCOUT `paypal-israel`. Date of research: **2026-09-03**.

## Evidence quality warning (read first)
The egress proxy in this container **blocks every PayPal-owned domain** and most of the
useful secondary sources. Confirmed blocked (EGRESS_BLOCKED, tried and failed):

- `www.paypal.com` (fee pages, legal hub, user agreement)
- `www.paypalobjects.com` (the fee/user-agreement PDFs)
- `docs.paypal.ai` (Payouts country table mirror)
- `leverage.it`, `illuminea.com`, `www.loc.gov`

So **every number below is a search-result snippet, not a rendered page.** Snippets are
weaker evidence and are marked as such. The exact URLs a human or unblocked agent must
open to close each claim are listed per finding under "URL to close".
Nothing below comes from my own memory; where I had no snippet I wrote "unknown".

---

## F1 — Withdrawal from PayPal to an Israeli bank account works, in ILS only

- Israeli PayPal accounts **can withdraw to an Israeli bank account or Israeli credit
  card, in ILS only** (snippet of the PayPal IL help/fees pages, seen 2026-09-03).
- **Withdrawal fee: NIS 8 for withdrawals under NIS 1,000; free for NIS 1,000 and above**
  (snippet, repeated across two independent searches, attributed to PayPal IL fee pages
  and Globes coverage).
- **Timing: ~3–5 business days** to land in the Israeli bank account (snippet).
- The Israeli bank account is **withdrawal-only** — it cannot be used to fund payments;
  PayPal IL help text tells Israeli users to fund payments with a credit card (snippet).
- Account name must be in **English** (Latin letters) or the bank link is rejected (snippet
  of PayPal IL help article help183).
- Withdrawal to an Israeli credit card was reported at **NIS 22 per transaction** in a
  Hebrew-language snippet; a second search could **not** find this in current official fee
  docs. Treat as **unverified**.

URLs to close:
- https://www.paypal.com/il/cshelp/article/how-do-i-link-a-bank-account-to-my-paypal-account-help183?locale.x=en_IL
- https://www.paypal.com/il/digital-wallet/paypal-consumer-fees
- https://www.paypalobjects.com/marketing/ua/pdf/IL/en/il-en-consumer-fees-13-jan-2025.pdf
- https://www.globes.co.il/news/article.aspx?did=1000514257
- https://www.calcalist.co.il/internet/articles/0,7340,L-3367296,00.html

**Payability to Israel: YES.** ToS risk: GREEN.

## F2 — Merchant receiving fees for an Israeli seller are high, and higher again on foreign buyers

- **3.49% + NIS 1.60 fixed** for ILS commercial transactions (snippet attributed to the
  PayPal IL merchant-fees page, seen 2026-09-03). Not rendered — must be confirmed.
- **Cross-border fee 1.5%–2%** on payments from foreign buyers, charged even when no
  currency conversion happens (snippet of PayPal US help550 + secondary guides).
- **Currency-conversion markup ~3–4%** when converting to ILS (secondary guides only:
  monito, tipalti, vaultleap — weak, commercially motivated sources).
- Practical read for our products (all small-ticket, mostly non-Israeli buyers):
  effective take is plausibly **5%–9% of gross on a $5–$20 sale**, before the fixed fee
  eats another slice. On a $5 sale the fixed fee alone is ~9%.
- **Micropayments rate (5% + $0.05)** exists and is cheaper below ~$10, but it is
  **opt-in and requires PayPal approval**, and I found **no evidence it is offered to
  Israeli accounts**. Unknown.

URLs to close:
- https://www.paypal.com/il/webapps/mpp/merchant-fees?locale.x=en_IL
- https://www.paypal.com/us/cshelp/article/what-are-the-cross-border-fees-when-selling-internationally-help550

## F3 — Structural change: services move to "PayPal Israel Payment Services Ltd" on 6 July 2026, and 18% VAT is charged on PayPal fees

This is the single most important Israel-specific fact found, and it is **recent**.

- PayPal notified users of a **transfer of services from PayPal Pte. Ltd. to PayPal Israel
  Payment Services Ltd.**, effective **6 July 2026** (snippet of PayPal IL Policy Updates
  page; corroborated by the filename of the current IL user agreement PDF,
  `en-IL-070626.pdf`, which appeared as a search result title
  "User Agreement for PayPal Services Last updated on 6 July 2026").
- The snippet states **PayPal Israel Payments Services Ltd., company number 516478872,
  is licensed and regulated by the Israel Securities Authority (ISA)** as a Payment
  Service Provider. (Note: one SEO page claimed "Bank of Israel oversight" instead —
  that page is a content farm; the ISA claim is the one that traces to PayPal's own
  policy page. Regulator identity is **not fully closed**.)
- The snippet states **VAT at the statutory 18% is charged on PayPal fees** for consumer
  and merchant transactions processed by PayPal Israel from the effective date.
  If true, a 3.49% merchant fee becomes ~4.12% all-in. **This is a live 2026 cost
  increase for Israeli sellers and must be verified before any pricing model uses PayPal.**
- Context: Israel's **חוק הסדרת העיסוק בשירותי תשלום וייזום תשלום, תשפ"ג-2023** brings
  foreign wallets serving Israeli customers into local licensing; the migration is
  consistent with that law.

URLs to close (highest priority for an unblocked agent):
- https://www.paypal.com/il/legalhub/paypal/upcoming-policies-full?locale.x=en_IL
- https://www.paypal.com/il/legalhub/paypal/useragreement-full?locale.x=en_IL
- https://www.paypalobjects.com/marketing/ua/OA/useragreement-full/en-IL-070626.pdf
- https://www.nevo.co.il/law_html/law00/216790.htm
- https://barlaw.co.il/regulated-payment-services-and-financial-services-in-israel-summary-and-outlook-for-2025/

## F4 — Freezing / holds: real, documented, and badly matched to a no-brand digital seller

Not Israel-specific, but it is the risk that decides whether PayPal can be a primary rail.

- **New sellers: payments held up to 21 days**, with a monthly release limit; once the
  limit is hit the rest is held again (snippet of PayPal US help848 / brc funds-availability).
  For **intangible/service items** the release path is "mark order Completed → released
  7 days later" — there is no tracking number to shortcut it.
- **Permanent limitation → 180-day hold** of the balance as a reserve against
  chargebacks, extendable at PayPal's discretion (snippets across several secondary
  sources; the 180-day figure is consistent, the "extendable" wording is secondary).
- **Seller Protection does not cover "Significantly Not As Described" claims**, which is
  the most common dispute type for digital products; intangible-goods protection since
  Sept 2020 also requires PayPal to have flagged the transaction/business category as
  eligible (snippets: PayPal newsroom + several merchant blogs).
- Israel-specific freezing evidence: **I found no credible Israel-specific dataset.**
  One SEO page (doola/onesafe class) claimed a "late-2025 Israeli government automated
  compliance system" freezing accounts and demanding Israeli ID/address documents.
  I could not corroborate this anywhere and the source is a content farm.
  **Marked as unverified rumour — do not repeat it as fact.**

URLs to close:
- https://www.paypal.com/us/cshelp/article/new-paypal-account-%E2%80%93-payments-on-hold-and-accessing-your-money-quicker-help848
- https://www.paypal.com/us/brc/article/funds-availability
- https://www.paypal.com/us/legalhub/paypal/seller-protection
- https://www.paypal.com/c2/legalhub/paypal/sellerprotection-il-tr (Israel-specific seller protection)

## F5 — Historical proof PayPal's Israeli behaviour is litigable: the forced-conversion class action

- Israel's **Central District Court, 31 May 2015**, approved a class action against PayPal
  for requiring Israeli customers withdrawing to foreign-currency Israeli bank accounts to
  first convert to ILS and pay a conversion commission (plaintiff Raz Klinghoffer;
  alleged **2.5%** conversion fee). PayPal removed the forced conversion shortly after the
  complaint was filed. The court also **voided PayPal's foreign jurisdiction clause** as
  an unlawful standard-contract term, so Israeli users can sue PayPal in Israel.
- Snippets: Library of Congress Global Legal Monitor (blocked, snippet only), Ynet,
  Takdin, Jewish Business News.
- Relevance: it is a precedent that **withdrawal to Israel is ILS-denominated and that
  FX handling has been the recurring dispute**, and that Israeli consumer law bites.

URLs to close:
- https://www.loc.gov/item/global-legal-monitor/2015-06-16/israel-jurisdiction-over-suits-involving-provision-of-services-to-israeli-customers-via-internet-by-international-corporations
- https://www.ynet.co.il/articles/0,7340,L-4665843,00.html
- https://portal.takdin.co.il/article/Article/5008246

## F6 — PayPal as a *payout* rail from third-party platforms is fragile

- **PayPal terminated its payout relationship with Gumroad** (reported Oct–Dec 2024);
  Gumroad moved to bank payouts, which are not supported in every country, and creators
  reported lost/delayed payouts (snippets: alternativeto.net news 2024-12, polycount
  thread, Gumroad help article on Payoneer).
- Lesson for the colony: **do not architect an income line whose only payout path is
  PayPal.** A platform can lose PayPal overnight, independent of anything we do.

URLs to close:
- https://alternativeto.net/news/2024/12/paypal-ends-service-with-gumroad-a-major-blow-to-creators-and-sales/
- https://gumroad.com/help/article/223-payoneer-and-gumroad

## F7 — Account requirements and the owner's unavoidable one-time human steps

From snippets of PayPal IL help pages and secondary guides (weak on the business-account
document list — no official Israeli business-onboarding document list was reachable):

Owner blockers (one-time, human, legally required — do NOT assume any are done):
1. Create/confirm a PayPal **Business** account with the owner's real legal identity.
2. Identity verification with **Israeli teudat zehut or passport** (KYC).
3. Provide **business name, address, phone and a tax identification number**
   (עוסק מורשה / עוסק פטור / company number) — required for a business account.
4. Link an **Israeli bank account, with the account name written in English**;
   confirm the link. Withdrawal-only.
5. Link a credit card as the funding source (Israeli bank cannot fund payments).
6. Possibly re-accept the new **PayPal Israel Payment Services Ltd** user agreement
   around the 6 July 2026 migration.

Everything after those steps (checkout integration, invoicing, webhooks, reconciliation,
withdrawal scheduling) is API-driven and agent-operable.

## F8 — Dead end: Braintree is not available in Israel

- Braintree (PayPal's own gateway product) lists availability as US, Canada, Australia,
  Europe, Singapore, Hong Kong SAR, Malaysia, New Zealand — **Israel is not listed**
  (snippet of developer.paypal.com/braintree country reference).
- So the only PayPal-family option for an Israeli merchant is **PayPal Checkout / REST
  Orders API** on the standard IL business account.

URL to close: https://developer.paypal.com/braintree/docs/reference/general/countries/ruby/

---

## Bottom line for the payment-rails supervisor

- **Payability to Israel: YES.** PayPal genuinely pays an Israeli business into an Israeli
  bank account, in ILS, at NIS 0–8 per withdrawal, in 3–5 business days. This is a real,
  working payout rail and the criterion is **not** a dead end.
- **But it is a poor *primary* rail for us:** ~3.49% + NIS 1.60, plus 1.5–2% cross-border
  on foreign buyers, plus FX markup, plus (from 6 July 2026, if the snippet is right)
  **18% VAT on the fees themselves**; plus 21-day new-seller holds and a 180-day hold on
  limitation, with **no SNAD protection for digital goods** — exactly our product shape.
- **Recommended posture: PayPal as a secondary/optional checkout button and as an
  accepted payout destination, never as the sole rail** for any income line. Our existing
  lines (Paddle, Telegram Stars, Apify, x402) should keep their own payout paths.
- **Highest-value follow-up for an unblocked agent:** render
  `https://www.paypal.com/il/legalhub/paypal/upcoming-policies-full?locale.x=en_IL`
  and `https://www.paypal.com/il/webapps/mpp/merchant-fees?locale.x=en_IL` to confirm the
  18% VAT-on-fees change and the exact IL merchant fee table. Those two numbers change
  the unit economics of every ILS-priced product we sell.

## Every search query I ran (2026-09-03)
1. PayPal Israel business account withdraw to Israeli bank account 2026
2. פייפאל ישראל משיכה לחשבון בנק ישראלי עמלה
3. PayPal Israel account frozen 180 days funds hold seller complaints
4. PayPal Israel merchant fees receiving payments percentage 3.4% cross-border 2026
5. "PayPal" ישראל חוק שירותי תשלום רישיון בנק ישראל 2025 2026
6. PayPal business account Israel requirements עוסק מורשה חברה פתיחת חשבון עסקי מסמכים
7. PayPal Payouts API supported countries Israel receive mass payments
8. PayPal Israel account limitation frozen Israeli sellers 2025 חסימת חשבון פייפאל ישראלים
9. PayPal Israel account hold USD balance currency conversion forced shekel withdrawal class action ruling
10. "PayPal" Israel merchant fee "3.4%" OR "3.49%" fixed fee ILS shekel receiving payment
11. PayPal Israel international receiving fee "cross-border" percentage merchant fees il-en-merchant-fees pdf
12. PayPal withdrawal Israel bank fee "8" shekels under 1000 free above 3-5 business days official
13. PayPal new seller 21 day payment hold policy release funds ramping merchant
14. Gumroad Payoneer PayPal payout Israel supported creators withdraw
15. PayPal Israel merchant accept payments website REST API integration available Braintree Israel not supported
16. פייפאל דיווח לרשות המסים ישראל הכנסות עוסק עצמאי חובת דיווח
17. "PayPal Israel Payment Services Ltd" transfer of services 2026 merchants user agreement
18. PayPal Israel withdraw to credit card fee 22 NIS visa cannot pay from Israeli bank account
19. PayPal micropayments rate 5% + fixed fee eligibility digital goods small transactions apply
20. PayPal Seller Protection Israel intangible digital goods covered eligibility

## Fetches attempted
- WebFetch www.paypal.com/il/webapps/mpp/paypal-fees — EGRESS_BLOCKED
- WebFetch www.paypalobjects.com/.../en-IL-070626.pdf — EGRESS_BLOCKED
- WebFetch leverage.it/how-paypal-really-works-for-israelis-and-shekels/ — EGRESS_BLOCKED
- WebFetch illuminea.com/how-paypal-really-works-for-israelis-and-shekels/ — EGRESS_BLOCKED
- WebFetch docs.paypal.ai/growth/payouts/reference/countries-supported-features — EGRESS_BLOCKED
- WebFetch www.loc.gov/item/global-legal-monitor/2015-06-16/... — EGRESS_BLOCKED
**Zero pages rendered. All findings are snippet-grade.**
