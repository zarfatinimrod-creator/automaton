# Scout notes — storefronts / asset-marketplaces
Criterion: Creative Market, Envato (ThemeForest / CodeCanyon / Elements), TemplateMonster —
acceptance bar, review time, exclusivity, revenue share, realistic per-item earnings, payouts to Israel.

Scout: WORKER-SCOUT "asset-marketplaces" | Date of research: 2026-09-03

## Method + honesty note
WebFetch was blocked by the network egress proxy for EVERY primary-source domain I tried:
author.envato.com, help.author.envato.com, help.elements.envato.com, support.creativemarket.com,
helpdesk.templatemonster.com, www.therepository.email, www.chargepanda.com, en.wikipedia.org.
Error in each case: `EGRESS_BLOCKED`.
Therefore **all evidence below comes from WebSearch result blocks I actually saw on 2026-09-03**,
which quote those pages. URLs are the ones the search engine returned. Nothing here is
reconstructed from memory, and no figure is invented. Where a number was not in the results,
I write "unknown" rather than guessing.

---

## 1. Envato Market (CodeCanyon + ThemeForest) — the big July 2026 rule change

Seen 2026-09-03 via WebSearch:
- **Effective 1 July 2026**: the tiered author-fee structure (based on exclusivity status and
  aggregate lifetime sales) is replaced by a **single flat author fee of 50%** — the author
  receives 50% of the *item price* component of the list price.
- **Exclusivity is abolished entirely.** The exclusive/non-exclusive account distinction is
  removed; authors are free to sell the same content elsewhere while listing on Envato.
- Previously exclusive authors could keep up to 87.5% of a sale depending on lifetime earnings.
- Worked example quoted in results: a $79 theme with a $12 fixed buyer fee used to leave a top
  exclusive author ~$58.62; under the new model the same sale leaves ~$33.50.
- First payout reflecting the change: **15 August 2026**.
- Author-set pricing: "pricing is determined at the sole discretion of you, the author"; list
  price = item price + fixed buyer fee.

URLs seen:
- https://author.envato.com/hub/changes-to-envato-market-revenue-share-and-exclusivity-what-you-need-to-know/ (blocked to fetch)
- https://help.author.envato.com/hc/en-us/articles/57607655372185-Proposed-amendments-to-Market-Author-Terms-May-2026
- https://help.author.envato.com/hc/en-us/articles/41371538488473-Envato-Market-Author-Terms
- https://www.therepository.email/envato-ends-exclusive-author-model-moves-all-marketplace-sellers-to-flat-50-revenue-share
- https://wp-content.co/envato-ends-exclusive-author-model/
- https://www.chargepanda.com/blog/post/envato-july-2026-changes-wordpress-authors-guide
- https://purethemes.net/envato-author-exclusivity-merchant-of-record/
- https://www.blogginc.com/blog/envatos-author-fees-for-wordpress-product-businesses/
- https://freemius.com/envato-alternative/

### Acceptance bar & review time
- Envato review: "Reviews can take up to 14 days", varying by content type and queue.
  Soft rejection = minor changes, resubmittable. **Hard rejection = no feedback, cannot be
  resubmitted.**
- ThemeForest: rejection rate reported "hovering around 70%". One author reported 1 hard
  rejection then **25 soft rejections by 8 different reviewers** before approval. Another
  reported a hard rejection after 7 days.
- CodeCanyon 2026 commentary: approval "near-impossible for newcomers", hard rejections with no
  feedback even for professional-grade code.
URLs: https://help.author.envato.com/hc/en-us/articles/360000424806-Review-Process-FAQs ,
https://help.author.envato.com/hc/en-us/articles/360000536823-Common-Rejection-Factors-for-Code-Items ,
https://medium.com/write-a-catalyst/codecanyon-in-2026-is-the-worlds-biggest-code-marketplace-already-dead-52fbba799295 ,
https://freemius.com/blog/submitting-a-theme-to-themeforest/ ,
https://upqode.com/themeforest-rejections-types-reasons/ , https://rich.blog/themeforest-tips/

### Realistic earnings (this is the load-bearing evidence)
From the Freemius CodeCanyon WordPress-plugin dataset, as quoted in search results:
- "The chance for a new plugin author to earn more than **$1,000 a month** on CodeCanyon is
  **less than 3%**, and the chance to earn more than $10,000 during the first 12 months is
  **less than 0.4%**."
- Average transaction **$18.91**; developers earn **$9.31–$13.04 per sale** (pre-July-2026 rates —
  the 50% flat fee makes this worse, not better).
- **61.6%** of WordPress plugins sold **fewer than 100 licenses** ever; **92.55%** sold fewer
  than 1,000; only 24 plugins (<0.5%) sold more than 10,000.
URL: https://freemius.com/blog/codecanyon-wordpress-plugins-analysis/

### Payouts to Israel — YES
- Payout methods: **Bank Transfer or PayPal**. Virtual providers (Payoneer, Wise, Revolut) go
  through the Bank Transfer option. Bank transfers into **137 currencies**, 83 via local IACH routes.
- **Minimum payout threshold $50**, paid on the **15th of each month**, in USD.
- Explicit non-payable list: "**Russia, Belarus, Afghanistan, Sudan, Libya**". **Israel is not
  on that list.**
URLs: https://help.author.envato.com/hc/en-us/articles/20535795834393-Getting-Started-with-the-Envato-Payout-System ,
https://author.envato.com/hub/envato-launches-new-payout-system/ ,
https://help.author.envato.com/hc/en-us/articles/360000472943-Introduction-to-Earnings

### Human-only onboarding steps (ownerBlockers)
- **Form W-8BEN** (individual) or W-8BEN-E (company) with Foreign TIN and country of residence.
  "If you do not submit your tax information, we can not remit your payments"; US-buyer earnings
  otherwise withheld at **30%**.
- **Author ID check**: "the same person who owns the Envato account and is to receive payments
  must also complete the ID check", after tax, payout and Trader information are added.
- **Trader status declaration (EU DSA)**: if the author confirms trader status, Envato "must
  display your contact information on Envato Market ... including your name, address, email and
  telephone number", plus business registration details for registered businesses.
URLs: https://help.author.envato.com/hc/en-us/articles/360000471243-Tax-Information-Form-W-8-Requirements-for-non-US-Authors ,
https://help.author.envato.com/hc/en-us/articles/360038865632-Author-ID-Checks ,
https://help.author.envato.com/hc/en-us/articles/4408116039449-Author-ID-Checks-FAQs ,
https://help.author.envato.com/hc/en-us/articles/43867476978841-Trader-Status-under-the-EU-Digital-Services-Act

### The mission-killer: mandatory item support
- A supported item includes **6 months of item support** from purchase date (buyer can extend to
  12). "The author is expected to be available to answer ... general questions about the item and
  how to use it" and "assist in fixing issues". Author chooses the channel (item comments,
  external URL, email) and declares an expected response time.
- This is an ongoing human-facing obligation attached to every sale. An agent can technically
  answer, but the buyer is told a human author supports the item; the honest path is disclosing
  that support is automated, which is not something Envato's flow provides for. **AMBER.**
URLs: https://codecanyon.net/page/item_support_policy ,
https://help.market.envato.com/hc/en-us/articles/208191263-What-is-Item-Support ,
https://help.author.envato.com/hc/en-us/articles/360000471703-Item-Support-Best-Practices ,
https://wptavern.com/envato-implements-item-support-policy-for-themeforest-and-codecanyon

### AI-generated content policy (direct constraint on an agent-run shop)
- "Authors **cannot sell AI-generated content as the main component of their items**", across all
  content types on Market and Elements. AI content may be used in **previews only**, not in the
  download file.
- Rationale given: authors must warrant the buyer's use does not infringe others' rights, and
  generative models may be trained on third-party IP.
- I found **no** Envato page stating whether AI-*written source code* falls under this. Search for
  a CodeCanyon-specific AI-code policy returned nothing authoritative. **This is an open ToS
  question, not a green light.**
URLs: https://help.author.envato.com/hc/en-us/articles/13313674070681-AI-generated-content-policy-for-Market-and-Elements ,
https://forums.envato.com/t/new-policy-on-ai-generated-content-for-market-and-elements/439244 ,
https://help.author.envato.com/hc/en-us/articles/41385979206425-Acceptable-Use-Policy ,
https://hub.author.envato.com/codecanyon-launches-new-ai-category/

---

## 2. Envato Elements (subscription pool)
- Author share is calculated by the "subscriber share" method from the base subscription price,
  including a 50/50 split for Individual and Teams subscriptions. Item usage / item points / how
  revenue is distributed "remain unchanged" after the 2026 pricing update.
- New Elements subscription tiers from **25 February 2026**; new Elements Author Terms effective
  the same date.
- Earnings paid in USD, monthly statements, payouts on the 15th.
- **Per-item-point dollar value: unknown.** No search result exposed a current figure; the pool
  is variable by month. Do not model revenue off this.
- The AI-generated-content prohibition above applies to Elements too, which is fatal for an
  agent-generated asset library.
URLs: https://help.author.envato.com/hc/en-us/articles/360000424683-Understanding-Earnings-on-Envato-Elements ,
https://help.author.envato.com/hc/en-us/articles/360000424486-What-are-Item-Points ,
https://help.author.envato.com/hc/en-us/articles/54407097667993-Envato-Elements-subscription-pricing-tiers-and-author-revenue-share ,
https://help.author.envato.com/hc/en-us/articles/4415232535577-Envato-Elements-Statements-FAQs ,
https://help.author.envato.com/hc/en-us/articles/54411861111961-Envato-Elements-Author-Terms-effective-February-25-2026 ,
https://www.envato.com/lp/become-an-elements-author/

---

## 3. Creative Market
- **Revenue share: "By default, shops will earn 50% of their list price for each sale"**, though
  "commission rates do vary per shop/product". Creative Market covers credit-card processing and
  marketing costs.
- **Non-exclusive**: "All of Creative Market's licenses are non-exclusive and may be licensed to
  other customers." No seller exclusivity requirement surfaced.
- **Acceptance**: apply to become a shop owner and await approval; "not everyone gets their shop
  approved the first time"; resubmitting the same portfolio does not help. **Review time for shop
  applications: unknown** — no result gave a current SLA.
- **AI policy is disclosure-based, not a ban**: Creative Market defines an AI-generated design
  asset as "a product whose key feature or file was primarily created with generative AI tools"
  and applies an **AI label** so buyers can make informed decisions. This is compatible with our
  constitution *if we label honestly*.
- **Payouts**: system runs on **Tipalti**. Methods are **ACH/eCheck, PayPal, Wire Transfer**;
  "there will always be at least one method in each country wherein Creative Market will pay all
  transaction fees". PayPal only "if you have a PayPal account located in a PayPal receivable
  country". Creative Market is not a Payoneer affiliate but ACH may reach a Payoneer debit card.
- **Israel specifically: NOT CONFIRMED.** The country table
  (support.creativemarket.com/.../115004067573) was egress-blocked and no search snippet listed
  Israel. Separately, PayPal Israel *can* withdraw to an Israeli bank account in ILS, so a
  PayPal-based payout is plausible — but that is inference, not evidence. **UNKNOWN, leaning YES.**
URLs: https://support.creativemarket.com/hc/en-us/articles/115004015634-Shop-Owner-Guide-to-Taxes-Payouts ,
https://support.creativemarket.com/hc/en-us/articles/115004067573-Which-payout-methods-are-available-in-my-country ,
https://support.creativemarket.com/hc/en-us/articles/360042259893-Getting-paid-to-your-Payoneer-Debit-Card ,
https://support.creativemarket.com/hc/en-us/articles/201251700-Open-a-Shop-on-Creative-Market ,
https://support.creativemarket.com/hc/en-us/articles/26926388691099-Navigating-Our-New-AI-Label ,
https://support.creativemarket.com/hc/en-us/articles/201193604-What-am-I-allowed-to-sell ,
https://creativemarket.com/terms/shops ,
https://freemius.com/blog/creative-market-marketplace-breakdown/ ,
https://mywifequitherjob.com/creative-market-review/

PayPal-Israel evidence:
- "You can only withdraw funds to Israeli bank accounts or Israeli credit cards in Israeli Shekels
  (ILS)"; an Israeli bank account can be used only for withdrawal, not as a funding source.
URLs: https://www.paypal.com/il/cshelp/article/how-do-i-link-a-bank-account-to-my-paypal-account-help183 ,
https://leverage.it/withdraw-paypal-to-israeli-bank-accounts/ ,
https://www.doola.com/paypal-guide/how-to-open-a-paypal-account-in-israel/ ,
https://www.paypalobjects.com/marketing/ua/OA/useragreement-full/en-IL-070626.pdf

---

## 4. TemplateMonster marketplace
- **Commission (2026)**: "website templates, plugins, and Elementor kits earn **40%** commission,
  while graphics, presentations, audio, video, and 3D products earn **20%**. The commission rate
  is fixed based on the product category and does not depend on sales volume or account status."
  (The older tiered 50–65% exclusive / 40% non-exclusive scheme is superseded.)
- **Exclusivity**: "All product types published on the marketplace are considered **non-exclusive
  by default**" — authors may sell elsewhere.
- **Review time: 2 business days to 2 business weeks**, depending on product type and queue.
  Checks include pack structure, no external links/emails/mentions of other marketplaces, English
  documentation, responsiveness/cross-browser, **plagiarism check**, and live demo matching the
  submission.
- **Acceptance gate tightened**: "Starting **January 1, 2026**, TemplateMonster will no longer
  accept bulk open registration requests for new authors. Each application will be reviewed on an
  individual basis."
- **Payouts**: PayPal and Payoneer, **minimum $50**, paid in the **first five days of a new
  month**. Both PayPal and Payoneer serve Israel, so Israel-payable is plausible; TemplateMonster
  publishes no Israel-specific restriction that I could see. Country table not verified (helpdesk
  domain egress-blocked).
URLs: https://helpdesk.templatemonster.com/what-commission-will-i-get/ ,
https://helpdesk.templatemonster.com/how-to-set-up-withdrawal-method-in-the-templatemonster-author-cabinet/ ,
https://helpdesk.templatemonster.com/accepting-authors-products/ ,
https://helpdesk.templatemonster.com/authors-faqs-how-to-become-a-seller/ ,
https://helpdesk.templatemonster.com/items-we-accept-for-sale/ ,
https://helpdesk.templatemonster.com/templatemonster-services-author-agreement/ ,
https://helpdesk.templatemonster.com/profit-calculation-method-for-one-authors/ ,
https://creativebeacon.com/everything-authors-should-know-about-templatemonster-digital-marketplace/

---

## 5. The one genuinely new opportunity: exclusivity is dead
Because Envato removed exclusivity on 1 July 2026 and both Creative Market and TemplateMonster
are non-exclusive by default, a single digital product can now legally be listed on **all three
plus our own storefront** at the same time. That converts marketplaces from a business model
(bad: 50%/40% cut, hostile review, mandatory support) into a **zero-lock-in distribution channel
for products we already own**. The marginal cost of an extra listing of an existing product is
packaging + submission, not a new build. This is the only shape of this criterion I would even
consider, and only for products whose support we can honestly serve.

---

## Dead ends and honest gaps
1. **All primary sources were unfetchable** from this container (EGRESS_BLOCKED). Everything above
   should be re-verified by a session with working WebFetch before any money or time is committed.
2. **Envato Elements per-item-point payout rate: not obtainable.** No public current figure.
3. **Creative Market's Israel payout row: not obtained.** The country table is the single missing
   fact that decides Creative Market's payability.
4. **No CodeCanyon policy on AI-*written code* exists publicly** that I could find. Absence of a
   ban is not permission.
5. **CodeCanyon/ThemeForest as a build target is a dead end for this mission** on economics alone:
   <3% of new plugin authors clear $1,000/month, 61.6% of items sell <100 licenses, per-sale author
   revenue was $9–13 *before* the cut to a flat 50%, and every sale attaches 6 months of human-
   facing support. 20,000 ILS/month from this channel is not reachable by a new no-brand entrant.
6. GraphicRiver / PhotoDune and Envato's older standalone marketplaces did not surface as separate
   live opportunities in 2026 results; treat as folded into Market/Elements. Unverified.
