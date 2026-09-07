# Scout notes — payment-rails / "stripe-alternatives"
**Criterion:** Card processing for a site selling to Israelis: Tranzila, Cardcom, Meshulam, PayPlus, Grow, Isracard gateways. Requirements for a small seller, fees, and whether a legal entity is required.
**Date of research:** 2026-09-03
**Scout:** WORKER-SCOUT stripe-alternatives, payment-rails group

## Evidence conditions (read this before trusting any number)
The container's egress proxy blocked **every** Israeli gateway/vendor domain I tried:
`www.tranzila.com`, `www.cardcom.solutions`, `grow.business`, `docs.payplus.co.il`,
`docs.tranzila.com`, `www.greeninvoice.co.il`, `netolink.co.il`, `www.autoflowr.co.il`
— all returned `EGRESS_BLOCKED`. Only `github.com` rendered.

So: **almost every price below is a SEARCH-SNIPPET claim, not a rendered page.**
Snippets are quoted by the search engine from the page, so they are real text I saw,
but I could not verify context, date of last price update, or fine print. Each finding
below names the exact URL a human or unblocked agent must open to close the gap.

Only two sources rendered fully and count as strong evidence:
- https://github.com/futureecom/omnipay-tranzila/blob/master/README.md (fetched 2026-09-03)
- https://github.com/MosheRivkin/cardcom-ts-sdk (fetched 2026-09-03)

## 1. Does an Israeli seller need a legal entity (חברה)?
**No — but a tax registration is required.** No gateway found sells to an unregistered private person.

- Snippet (repeated across Tranzila's עוסק-פטור page and Isracard's business-account page):
  "אדם פרטי אזרח ישראלי שהינו עצמאי, עוסק פטור או עוסק מורשה, המנהל חשבון בנק בתאגיד בנקאי
  בישראל יכול להשתמש בפתרון לקבלת תשלומים מלקוחות באמצעות חיוב כרטיס אשראי."
  URLs to open: https://www.tranzila.com/עוסק-פטור/ , https://marketing.isracard.co.il/biz-account/
- Isracard business account snippet is stricter: "החשבון מיועד לאזרח ישראלי בעל חשבון בנק ישראלי
  שהינו עוסק פטור או עוסק מורשה **בעל תיק במע"מ**."
- עוסק פטור ceiling quoted at ~120,000 ₪/yr (2024 figure per a Tranzila glossary snippet;
  the number is indexed annually and MUST be re-checked before relying on it).
  URL: https://www.tranzila.com/glossary.html and https://www.kolzchut.org.il/he/עוסק_פטור
- Practical read: **עוסק פטור is enough to start; a חברה בע"מ is not required.** Above the
  עוסק-פטור ceiling the owner must move to עוסק מורשה. That is a tax-registration step, not
  an incorporation step.

## 2. Documents every gateway asks for (the owner-blocker list)
Snippet from a merchant-onboarding page describing standard requirements:
"צילום ת.ז (אם ביומטרית, אז צילום של שני הצדדים) וצילום של צ'ק/אישור ניהול מחשבון הבנק אליו
יופקדו הזיכויים" plus, for home-based businesses, "מסמכי אימות קיום בית עסק
(לדוגמה העלאת חשבוניות המעידות על רכישת סחורה עבור העסק)".
Found via search 2026-09-03; also corroborated by PayMe's own help-centre snippet:
"When registering for the PayMe service, you need to fill in all required details in the
registration form, including an ID card photo and either a check image or bank account
management certificate."
URL to open: https://help.payme.io/hc/en-us/articles/4409003509906-Getting-Started-with-PayMe

So the irreducible human steps are: (a) be registered as עוסק, (b) hand over ID scan,
(c) hand over אישור ניהול חשבון / cheque scan, (d) sign the acquiring agreement.
Everything after that is API work an agent can do.

## 3. Fee comparison (SNIPPET-ONLY — verify before quoting to anyone)
From a third-party comparison page (autoflowr.co.il, blocked; snippet only), dated "2026":
| Gateway | Clearing % | Monthly cost |
|---|---|---|
| Cardcom | 1.2–1.6% | 90–180 ₪ |
| Tranzila | 1.2–1.7% | 90–200 ₪ |
| PayPlus | 0.9–1.3% | 0–150 ₪ |
URL to open: https://www.autoflowr.co.il/compare/payment-gateways-israel-2026
Caveat: this is an SEO comparison page of unknown independence. Treat as an order-of-magnitude
sanity check only, never as a quote.

Grow (grow.business, blocked; snippet from its own fees page):
- "אין דמי הקמה, אין עלות חודשית" — no setup fee, no monthly fee.
- Rate is volume-tiered, set monthly by clearing volume.
- Diners costs "+0.5% ... מינימום 1.5% לעסקה".
- Digital wallets (Bit, Apple Pay, Google Pay) charged at the same rate as cards.
URL to open: https://grow.business/fees/

PayMe (snippet): "עמלת הסליקה של PayMe היא 3% + מע״מ + 1.2 ש"ח לעסקה, ואין עמלה במשיכה
לחשבון הבנק, אין דמי הקמה ואין עלות חודשית למסוף."
URL to open: https://payme.io/terms-conditions/ and https://help.payme.io/

Bit acceptance (snippet, from Hyp's blog): "עמלת העברת תשלום בביט היא 1.25% עד 1.9% בהתאם
למסלול סליקת האשראי שהעסק בוחר." Bit is not a standalone rail — it is resold through
Tranzila / Grow / Hyp / Invoice4u.
URLs: https://hyp.co.il/blog/bit-for-business/ , https://www.tranzila.com/bit.html , https://grow.business/bit/

## 4. Corporate identity note
"Meshulam" and "Grow" are the same company. Confirmed by two independent listings:
- IVC Research Center listing: "Meshulam Payment Solutions (Grow) Ltd."
  https://www.ivc-online.com/Google-Card?id=cf8c6436-c392-e111-ad2f-00155d32a403
- Duda App Store listing: "Grow Payments (Recently Meshulam)"
  https://apps.duda.co/apps/grow-payments-(recently-meshulam)
Do not treat Meshulam and Grow as two options in the portfolio. They are one.

## 5. API / integration quality (the part that decides build hours)
**Tranzila — best evidenced.** From the rendered omnipay-tranzila README:
- Credentials needed: App Key, Secret, Terminal Name (plus terminal password for the
  handshake/iframe flow).
- Operations: authorize, capture, purchase, refund, void, reversal, verify, handshake.
- Currencies: **ILS, USD, EUR, GBP.**
- A sandbox exists (README notes void "may not function on Tranzila test accounts ...
  a limitation of the Tranzila sandbox environment").
- Public docs portal exists at https://docs.tranzila.com/ (blocked here); search surfaced
  "Handshake API V2" and "Tranzila API V2" section titles, and the handshake is described
  as a time-limited transaction token (`thtk`) generated before redirecting the customer.

**PayPlus — real developer portal.** https://docs.payplus.co.il/reference/introduction
(blocked here). Snippet: PCI DSS Level 1; generate payment links, add tokens, charge
transactions, add customers; "All API requests must be made server-side"; callback URL for
server-side transaction updates plus success/failure redirect URLs. GitHub org exists:
https://github.com/PayPlus-Gateway . Community wrapper: https://github.com/ZevWisegroup/payplus-api

**Cardcom — API exists, community SDK is thin.** Rendered https://github.com/MosheRivkin/cardcom-ts-sdk :
generated by openapi-ts, auth is `ApiName` + `TerminalNumber`, **2 stars**, README shows
one endpoint example (`POST /Transactions/ListTransactions`) and nothing else. Do not plan
around this SDK; plan around the raw REST API. Official org https://github.com/CardCom exists.
Other community code: https://github.com/gasner/cardcom (PHP), https://github.com/studioraz/magento2-cardcom.

**Hyp** — claims PCI Level 1 and native-language APIs plus Shopify/Konimbo plugins, but I
found no public developer-docs URL and no public price. https://hyp.co.il/online-payments/

**Isracard / CAL (direct acquirers)** — these are the acquiring banks, not developer
platforms. CAL publishes standard contracts for download and a business fee tariff page:
https://www.cal-online.co.il/business/more/amlot/ , https://www.cal-online.co.il/business/more/contracts/
Isracard's own gateway is resold through Wix as a payment provider
(https://support.wix.com/en/article/connecting-isracard-as-a-payment-provider — the article
title says "חיבור האתר לחברת הסליקה ישראכרט **מבית PayMe**", i.e. Isracard's SMB gateway is
PayMe-powered). Going direct to an acquirer means a sales process, not a signup form.

## 6. Regulatory ceiling — do NOT build our own aggregator
Israel's חוק הסדרת העיסוק בשירותי תשלום וייזום תשלום, תשפ"ג-2023 puts non-bank payment
services under the Israel Securities Authority, with licensing. A "מאגד" (aggregator) is
defined as an entity that centralises charges and credits of *other* suppliers via debit cards.
Sources: https://www.boi.org.il/media/ilqdi5sv/...2023.pdf , https://www.nevo.co.il/law_html/law00/216790.htm ,
https://www.gornitzky.co.il/... , https://barlaw.co.il/...
=> Collecting money on behalf of third-party sellers is a licensed activity. **RED.** Any
future product must charge for our own goods only, or ride a licensed rail (PayMe, Grow,
Isracard) as a merchant.

## 7. Stripe — ambiguous, do not assume
Search results conflict: Stripe supports ILS as a currency and ILS payouts to an Israeli
bank account, but sources disagree on whether Israel is an officially supported *merchant*
country, and several third-party guides push the "form a US LLC" workaround (which would be
an entity-formation blocker and is out of scope for a software-only operation).
URL to open: https://stripe.com/resources/more/payments-in-israel and Stripe's own
global availability page. **Status: UNKNOWN, verify directly before relying on it.**

## Full URL list actually seen (search results or fetched)
- https://www.tranzila.com/עוסק-פטור/ (snippet)
- https://www.tranzila.com/merchant-express.html (snippet: terminal in 24h, no guarantees, no minimum fees)
- https://www.tranzila.com/faq.html , /glossary.html , /english.html , /bit.html , /cal.html (snippets)
- https://docs.tranzila.com/ , /docs/payments-billing/khkfaiy9j4ln9-handshake-api-v2 (snippet; blocked)
- https://github.com/futureecom/omnipay-tranzila/blob/master/README.md (FETCHED)
- https://www.cardcom.solutions/ , /עמלת-סליקה-לעסקים/ , /blog/clearing-fees-comparison-guide (snippets; blocked)
- https://github.com/MosheRivkin/cardcom-ts-sdk (FETCHED)
- https://github.com/CardCom , https://github.com/gasner/cardcom , https://github.com/studioraz/magento2-cardcom
- https://www.payplus.co.il/recurring-payments , https://payplus.co.il/en (snippets)
- https://docs.payplus.co.il/reference/introduction , /reference/website-or-app , /reference/payment-methods (snippets; blocked)
- https://github.com/PayPlus-Gateway , https://github.com/ZevWisegroup/payplus-api
- https://grow.business/ , /fees/ , /terms/ , /bit/ , /popular-questions/ (snippets; blocked)
- https://apps.duda.co/apps/grow-payments-(recently-meshulam)
- https://www.ivc-online.com/Google-Card?id=cf8c6436-c392-e111-ad2f-00155d32a403
- https://payme.io/terms-conditions/ , https://help.payme.io/hc/en-us/articles/4409003509906-Getting-Started-with-PayMe
- https://en.wikipedia.org/wiki/PayMe
- https://hyp.co.il/ , /online-payments/ , /blog/bit-for-business/ , /blog/small-business-credit-clearance-price/
- https://www.isracard.co.il/business , /lobby-clearance/business , https://marketing.isracard.co.il/biz-account/
- https://support.wix.com/en/article/connecting-isracard-as-a-payment-provider
- https://www.cal-online.co.il/business/slika/online/ , /business/more/amlot/ , /business/more/contracts/
- https://www.autoflowr.co.il/compare/payment-gateways-israel-2026 (snippet; blocked)
- https://www.greeninvoice.co.il/magazine/exempt-dealer-credit-clearing/ (snippet; blocked)
- https://www.bitpay.co.il/he/bit-for-businesses , https://www.invoice4u.co.il/market/bit/
- https://www.kolzchut.org.il/he/עוסק_פטור
- https://www.boi.org.il/media/ilqdi5sv/חוק-הסדרת-העיסוק-בשירותי-תשלום-ויזום-תשלום-תשפ_ג-2023.pdf
- https://www.nevo.co.il/law_html/law00/216790.htm
- https://stripe.com/resources/more/payments-in-israel

## Bottom line for the colony
1. The rail question is **solved, not blocked**: an Israeli עוסק פטור with a bank account can
   get a real card-processing terminal. No company formation needed.
2. The owner's unavoidable steps are exactly four and all one-time: register as עוסק,
   supply an ID scan, supply an אישור ניהול חשבון, sign the acquiring agreement.
   **None of them are done yet — do not assume otherwise.**
3. If minimising owner touch is the priority, **PayMe** (aggregator, no setup, no monthly,
   ~3%+VAT+1.2₪) is the lowest-friction door and **Grow** the lowest fixed cost.
   If minimising rate on volume, **PayPlus**. If maximising API certainty and multi-currency,
   **Tranzila**.
4. Until any of that is signed, **Paddle (already live on il-biz-tools) remains the only rail
   that actually takes money today**, because Paddle is merchant-of-record and needs no
   Israeli acquiring agreement. The Israeli gateways buy a better rate and Bit/local cards;
   they do not unblock anything that is currently blocked.
