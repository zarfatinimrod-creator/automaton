# WORKER-SCOUT notes — storefronts / etsy-digital
Date of research: 2026-09-03
Criterion: Etsy digital downloads — Israeli seller eligibility and the Payoneer path, fees,
which digital goods sell, saturation, and Etsy policy on AI-generated goods.

## Method and an honesty caveat about sources
The container's egress proxy **blocks every Etsy-owned domain** (`www.etsy.com`,
`help.etsy.com`, `developer.etsy.com`, `developers.etsy.com`) and also blocked
`en.wikipedia.org`, `printify.com`, `alura.io`, `iscompliant.app`, `blog.marmalead.com`,
`web.archive.org`. Only `github.com` fetched successfully.

Therefore: everything below that is attributed to an Etsy Help/Legal page comes from
**WebSearch result snippets that I actually saw in this session**, quoting those pages —
not from a page I fetched myself. I mark those `[snippet]`. Anything I fetched directly is
marked `[fetched]`. Nothing here is invented; where I do not know, I say "unknown".
A future session on an unblocked network should re-verify the `[snippet]` items against
the primary Etsy pages, whose URLs are all listed.

---

## 1. Israeli seller eligibility and payout — the hard gate

**Verdict: PAYABLE TO ISRAEL = YES, via Etsy Payments direct to an Israeli bank account in ILS.
The Payoneer path specifically is NOT available to Israel.**

Evidence `[snippet]`, 2026-09-03:
- "Etsy Payments is currently available to sellers in Israel." — Countries Eligible for Etsy
  Payments, https://help.etsy.com/hc/en-us/articles/115015710408-Countries-Eligible-for-Etsy-Payments
- "Etsy Payments via Payoneer is currently available to sellers in Argentina, Brazil, Chile,
  China, Egypt, Georgia, India, Japan, Kazakhstan, Pakistan, Peru, Serbia, South Korea,
  Thailand, United Arab Emirates, & Ukraine." — **Israel is not in that list.**
  https://help.etsy.com/hc/en-us/articles/16999319005207-How-Do-I-Use-a-Payoneer-Account-With-Etsy-Payments
  => The "Payoneer path" the criterion asks about is a dead end for an Israeli seller.
     It is also unnecessary, because the direct-bank path works.
- "In Israel, available funds can only be deposited into bank accounts in the domestic
  currency of the account, including Israeli Shekel (ILS)." `[snippet]`, same Help page.
- "PayPal is not available to Etsy sellers located in Israel and enrolled in Etsy Payments.
  If you offer PayPal in your shop and are located in Israel, PayPal will be removed after
  you sign up for Etsy Payments." `[snippet]`
- Israel seller landing page (blocked to fetch, surfaced in search): https://www.etsy.com/il-en/sell
  and https://www.etsy.com/il-en/legal/etsy-payments/ — an Israel-localised Etsy seller funnel
  exists, which is corroborating (Etsy does not run a country funnel for a country it cannot pay).

**Onboarding / KYC (one-time, human, unavoidable)** `[snippet]`:
- "Etsy partners with Persona to run identity and fraud-prevention checks, requiring a photo
  of your government ID and a clear selfie."
  https://help.etsy.com/hc/en-us/articles/360001980067-How-to-Verify-Your-Seller-Information-for-Etsy-Payments
- "The name on the bank account must match your government-issued identification."
  https://help.etsy.com/hc/en-us/articles/115015775908-How-to-Update-and-Verify-Your-Bank-Account-for-Etsy-Payments-Deposits
- "When enrolling in Etsy Payments, you'll be asked for your credit card, bank account, and
  residential address for receiving deposits, and you will also be required to verify your
  personal identity."
- New shops are frequently auto-suspended pending verification in the first hours/days:
  https://www.shieldmyshop.com/blog/etsy-shop-suspended-what-to-do-2026 ,
  https://blog.adnabu.com/etsy/etsy-account-suspended/ — i.e. the owner must be able to answer
  one verification email. Cannot be delegated to software.

**Israeli tax side** (owner/accountant, not automatable):
- Israeli residents must report all income including internet income; VAT-exempt status
  (עוסק פטור) applies only to VAT and does not remove income-tax/Bituach Leumi duty; 2026
  עוסק פטור turnover ceiling ₪122,833.
  https://www.kolzchut.org.il/he/עוסק_פטור , https://www.din.co.il/articles/4211/B-22028/ ,
  https://alfie.co.il/income-tax-vat-and-ecommerce/
- Good news on the buyer-side VAT: Etsy itself collects and remits EU VAT on automatically
  downloaded digital items on behalf of all sellers regardless of seller location.
  https://www.etsy.com/seller-handbook/article/26557870596 ,
  https://help.etsy.com/hc/en-us/articles/115015587567-How-VAT-Works-on-Digital-Items
  This removes an entire compliance workstream from a software-only operation.

## 2. Fee stack (2026)

`[snippet]` figures, cross-checked across two independent searches:
- Listing fee: **$0.20 USD per listing, per 4 months / per sale renewal.**
  https://www.etsy.com/legal/fees/
- Transaction fee: **6.5%** of the total order (item price + shipping, N/A for digital).
  https://blog.marmalead.com/etsy-fees-explained/ , https://craftybase.com/blog/the-complete-guide-to-etsy-fees
- Payment processing, **Israel-specific: 4.5% + ₪2.00 per sale** `[snippet]` from
  https://www.etsy.com/il-en/sell and https://help.etsy.com/hc/en-us/articles/115015628847-What-are-Payment-Processing-Fees-for-Selling-on-Etsy
  (Note: the generic US figure quoted elsewhere is 3% + $0.25 — Israel is materially worse.)
- Offsite Ads: **15%** of the order if trailing-12-month sales < $10,000 USD and you have not
  opted out; **12%** and **mandatory, cannot opt out**, once you cross $10,000.
  https://craftybase.com/blog/everything-you-should-know-about-etsy-offsite-ads
- Etsy Ads (optional, on-site): self-set daily budget; guidance for new shops is $1–3/day.
  https://mydesigns.io/blog/etsy-ads/ , https://listybox.com/blog/etsy-ads-guide-pod-sellers-2026

**Worked example for an Israeli seller, one $12 digital download, no offsite-ad attribution:**
0.20 listing + 6.5% (=$0.78) + 4.5% ($0.54) + ₪2.00 (≈$0.54) ≈ **$2.06, ~17% of gross**.
If the sale is attributed to Offsite Ads at 15% (+$1.80), the take rate is **~32%**.
The ₪2.00 flat component is the killer at low price points: on a $4 printable it alone is ~13%.
=> **Do not sell cheap single printables from Israel. Price ≥ $12, prefer bundles $19–39.**

## 3. Etsy policy on AI-generated goods and on templates — the real constraint

- Etsy's Creativity Standards: https://www.etsy.com/legal/creativity ; Seller Policy:
  https://www.etsy.com/legal/sellers/ ; Prohibited Items Policy effective 2026-08-11:
  https://www.etsy.com/legal/policy/prohibited-items-policy-effective/1475031537022
- `[snippet]` "Etsy explicitly added digital downloads to the Creativity Standards in June 2025
  and prohibited reselling third-party templates as your own."
- `[snippet]` The old wording allowed items "based on a seller's original design **or using a
  templated design or pattern**"; the new wording says items must be "based on a seller's
  original design". **Starting August 11, 2026, items produced using computerized tools must
  be based on the seller's original design.**
- `[snippet]` "Reselling Canva templates, PLR files or design bundles you didn't create risks
  removal under the Creativity Standards."
- `[snippet]` AI is **not banned** — it is regulated by disclosure. AI-assisted digital products
  are allowed if (a) AI involvement is disclosed in the listing, (b) the seller adds genuine
  creative input, (c) the seller is the creator. AI-generated items sit under "Designed by a
  seller", not "Made by a seller".
  Sources seen: https://www.promptlesspress.com/blog-etsy-ai-policy-2026-digital-products ,
  https://printablekit.ai/blog/ai-images-etsy-rules-2026 ,
  https://www.inkfluenceai.com/blog/etsy-ai-disclosure-explained-2026 ,
  https://iscompliant.app/Blog/etsy-ai-digital-downloads ,
  https://www.shieldmyshop.com/blog/2026-04-28-etsy-august-2026-policy-changes-original-design-pod-sellers ,
  https://blog.marmalead.com/etsy-policy-updates/
- `[snippet]` "Shops caught selling undisclosed AI art have reported suspensions and permanent
  removal, particularly when the content also triggered copyright or style-similarity complaints."

**Reading for our constitution:** a shop that mass-produces AI *images* and lists them as
original art is AMBER→RED (originality claim is thin, style-similarity complaints are the
common suspension trigger). A shop that ships **functional artefacts our agents genuinely
author** — spreadsheets with our own formulas, Notion databases with our own schema, a PDF
whose layout and copy we wrote — is squarely "the seller's original design", and AI-assistance
disclosure is easy and honest. That is the only Etsy branch I can recommend.

## 4. Automation surface — what software can and cannot do

- Etsy Open API v3 exists, REST + OAuth2 (authorization code + PKCE), `x-api-key` on every
  request. `createDraftListing` POSTs to
  `https://api.etsy.com/v3/application/shops/{shop_id}/listings`, and the API covers listings,
  images, **files** (digital downloads), inventory, translations, receipts.
  https://developers.etsy.com/documentation/ , https://developer.etsy.com/documentation/tutorials/listings ,
  https://developers.etsy.com/documentation/tutorials/quickstart/
  `[fetched]` https://github.com/gordonturner/etsy-open-api-client/blob/main/docs/ShopListingApi.md
  — confirms `createDraftListing` / `deleteListing` exist and take api_key + oauth2; that
  generated doc does **not** name the scope strings, so exact scopes are unknown to me.
  `[snippet]` a known wart: listings created via `createDraftListing` may not publish from the
  new listing form, only from the dropdown —
  https://github.com/etsy/open-api/discussions/1296
- Webhooks exist (`order.paid` etc.): https://developers.etsy.com/documentation/essentials/webhooks/
- **There is no Messages/Conversations endpoint in Etsy API v3.** `[snippet]` from
  https://www.rapidevelopers.com/api-automations/how-to-automate-etsy-customer-messages-using-the-api
  and https://developer.etsy.com/documentation/tutorials/shopmanagement/ — buyer conversations
  are dashboard-only.
- Etsy's Terms of Use / API Terms prohibit crawling, scraping or automated access outside the
  API. `[snippet]` — so "have an agent drive the seller dashboard headlessly" is **not** an
  allowed workaround. https://www.etsy.com/legal/terms-of-use/
- Etsy Seller Policy prohibits using buyer contact details for unsolicited commercial messages
  or off-platform transactions. `[snippet]` https://www.etsy.com/legal/sellers/
  => Transactional follow-up via the receipt email is defensible; a marketing list is not.

**Consequence: Etsy cannot be made 100% owner-free.** Listing creation, file upload, pricing,
inventory and order data are fully automatable. Buyer messages, case/dispute handling and the
verification-email loop are not, and the only compliant handler is a human in the dashboard.
For digital downloads with auto-delivery the message volume is low but it is not zero. This is
a real, permanent mismatch with the mandate and must be stated plainly to the supervisor.

## 5. What actually sells, prices, saturation

`[snippet]` sources, all 2026:
- https://www.outfy.com/blog/top-selling-digital-products-on-etsy/
- https://litcommerce.com/blog/digital-products-to-sell-on-etsy/
- https://mydesigns.io/blog/digital-products-to-sell-on-etsy/
- https://www.sellerapp.com/blog/etsy-trends/
- https://www.insightagent.app/trends/digital-trends
- https://www.listifyai.net/blog/etsy-digital-downloads-guide-2026
- https://busymomsidehustle.com/digital-products-to-sell-on-etsy/
- https://www.insightagent.app/guides/how-to-sell-spreadsheets-on-etsy
- https://resellready.co/blogs/news/digital-downloads-that-sell-on-etsy-in-2026

Categories named as top sellers: printable planners, SVG cut files, editable Canva templates,
classroom worksheets, wedding invitation templates, digital wall art, **spreadsheets**, and
**niche business templates**.

Specific numbers I actually saw (all third-party estimates, none from Etsy):
- Notion templates: "$8–$25", described as "low-competition category with high buyer intent".
- Spreadsheet templates: "$3–$50 per template, bundles $20–$100+".
- Single printable "$4–8", bundle of 10 "$15–25".
- Niche beats generic: the example given was generic "Nurse Life" saturated vs "Labor and
  Delivery Nurse" listings at "$2,000/mo with only 500 reviews".
- Niche-selection rule of thumb quoted: target exact keywords with **under 5,000 competing
  listings**.
- Shop-size benchmark: top digital shops carry "200–500+ active listings"; new-shop target
  "20–30 listings in the first 3 months"; established 200+ listing shops "routinely generate
  two to five thousand pounds monthly" (that is a vendor blog claim, treat as marketing).
- Conversion rule of thumb quoted: "on average it takes 100 views to secure 1 sale."
- Time to first sale: "most well-set-up shops make their first sale within 2–4 weeks";
  "most sellers see first sales within 30 to 90 days, significant income takes 6 to 12 months."
  https://outandbeyond.com/how-long-does-it-take-to-sell-on-etsy/ ,
  https://www.meersworld.net/2026/02/how-long-does-it-take-to-get-sales-on-etsy-realistic-timelines.html
- **The sobering one: "65% of sellers make less than $100/year."**
  https://sidequesthustle.com/guides/etsy-shop-revenue-calculator

I could not find a trustworthy marketplace-wide count of active digital-download listings.
Unknown. Anyone quoting one to the colony should be asked for the primary source.

**Saturation verdict:** printable wall art, generic planners and generic budget printables are
saturated *and* now legally exposed by the Aug-2026 original-design rule. Functional,
profession-specific templates (spreadsheets, Notion) are the only sub-niche where the search
evidence repeatedly used the words "low competition" and "high buyer intent".

## 6. Where this leaves us

The one Etsy line worth proposing is a **small, deliberately narrow shop of functional business
templates our agents genuinely author** — Google Sheets / Excel trackers and Notion dashboards
for a named professional buyer — priced ≥ $12 to survive the ₪2.00 flat fee, with honest AI
disclosure, kept under the $10,000 Offsite-Ads threshold in year one, and with the owner
accepting a small, unavoidable human duty: KYC once, and reading Etsy convos occasionally.

Everything else in this criterion is either saturated, policy-exposed, or both.

## 7. Full URL list used (in the order encountered)
https://help.etsy.com/hc/en-us/articles/115015710408-Countries-Eligible-for-Etsy-Payments
https://help.etsy.com/hc/en-us/articles/16999319005207-How-Do-I-Use-a-Payoneer-Account-With-Etsy-Payments
https://help.etsy.com/hc/en-us/articles/360002120927-What-is-Etsy-Payments
https://help.etsy.com/hc/en-us/articles/115015628847-What-are-Payment-Processing-Fees-for-Selling-on-Etsy
https://help.etsy.com/hc/en-us/articles/360001980067-How-to-Verify-Your-Seller-Information-for-Etsy-Payments
https://help.etsy.com/hc/en-us/articles/115015775908-How-to-Update-and-Verify-Your-Bank-Account-for-Etsy-Payments-Deposits
https://help.etsy.com/hc/en-us/articles/115015587567-How-VAT-Works-on-Digital-Items
https://www.etsy.com/legal/etsy-payments/
https://www.etsy.com/il-en/legal/etsy-payments/
https://www.etsy.com/il-en/sell
https://www.etsy.com/legal/fees/
https://www.etsy.com/legal/creativity
https://www.etsy.com/legal/sellers/
https://www.etsy.com/legal/policy/prohibited-items-policy-effective/1475031537022
https://www.etsy.com/legal/terms-of-use/
https://www.etsy.com/seller-handbook/article/26557870596
https://www.etsy.com/seller-handbook/article/22264723533
https://www.etsy.com/seller-handbook/article/1183344188826
https://developers.etsy.com/documentation/
https://developers.etsy.com/documentation/tutorials/quickstart/
https://developers.etsy.com/documentation/essentials/webhooks/
https://developer.etsy.com/documentation/tutorials/listings
https://developer.etsy.com/documentation/tutorials/shopmanagement/
https://github.com/gordonturner/etsy-open-api-client/blob/main/docs/ShopListingApi.md   [fetched]
https://github.com/etsy/open-api/discussions/1296
https://www.rapidevelopers.com/api-automations/how-to-automate-etsy-customer-messages-using-the-api
https://blog.marmalead.com/etsy-fees-explained/
https://blog.marmalead.com/etsy-policy-updates/
https://craftybase.com/blog/the-complete-guide-to-etsy-fees
https://craftybase.com/blog/everything-you-should-know-about-etsy-offsite-ads
https://www.gelato.com/blog/how-much-does-etsy-take-from-a-sale
https://www.shieldmyshop.com/blog/2026-04-28-etsy-august-2026-policy-changes-original-design-pod-sellers
https://www.shieldmyshop.com/blog/etsy-shop-suspended-what-to-do-2026
https://blog.adnabu.com/etsy/etsy-account-suspended/
https://iscompliant.app/Blog/etsy-ai-digital-downloads
https://iscompliant.app/Blog/etsy-creativity-standards-pod-sellers-guide
https://www.promptlesspress.com/blog-etsy-ai-policy-2026-digital-products
https://printablekit.ai/blog/ai-images-etsy-rules-2026
https://www.inkfluenceai.com/blog/etsy-ai-disclosure-explained-2026
https://www.outfy.com/blog/top-selling-digital-products-on-etsy/
https://litcommerce.com/blog/digital-products-to-sell-on-etsy/
https://mydesigns.io/blog/digital-products-to-sell-on-etsy/
https://mydesigns.io/blog/etsy-ads/
https://www.sellerapp.com/blog/etsy-trends/
https://www.insightagent.app/trends/digital-trends
https://www.insightagent.app/guides/how-to-sell-spreadsheets-on-etsy
https://www.listifyai.net/blog/etsy-digital-downloads-guide-2026
https://busymomsidehustle.com/digital-products-to-sell-on-etsy/
https://resellready.co/blogs/news/digital-downloads-that-sell-on-etsy-in-2026
https://listybox.com/blog/etsy-ads-guide-pod-sellers-2026
https://outandbeyond.com/how-long-does-it-take-to-sell-on-etsy/
https://www.meersworld.net/2026/02/how-long-does-it-take-to-get-sales-on-etsy-realistic-timelines.html
https://sidequesthustle.com/guides/etsy-shop-revenue-calculator
https://www.alura.io/docs/article/etsy-payments-guide-by-country            (blocked, snippet only)
https://www.kolzchut.org.il/he/עוסק_פטור
https://www.din.co.il/articles/4211/B-22028/
https://alfie.co.il/income-tax-vat-and-ecommerce/
