# Scout notes — store-promotion / "first reviews, honestly"

Scout: WORKER-SCOUT `first-reviews-honestly`
Group: store-promotion
Date of research: 2026-09-03
Search budget spent: 14 WebSearch calls (cap was 20)

Criterion assigned: *The social-proof cold start — how a new store gets its first ratings
and reviews without buying or faking any. What each major platform permits (review
requests, follow-ups, incentives, samples), quoted. How much a first review is worth in
conversion, and whether a store can sell at all with none.*

---

## 0. Evidence grading used below

- **RENDERED** = I actually fetched the page and read it in this session.
- **SNIPPET** = a WebSearch result summary quoting the page. Weaker. The exact URL a human
  or unblocked agent must open to close the claim is given every time.
- **BLOCKED** = the primary source exists but the egress proxy refused it here.

Egress proxy blocked, confirmed this session: `developer-docs.amazon.com`,
`corporate.trustpilot.com`, `support.google.com`, `www.ecfr.gov`,
`spiegel.medill.northwestern.edu`. Do not retry from this container.

GitHub renders. It carried the single strongest primary source in this sweep (Amazon's
own OpenAPI model file).

---

## 1. What each platform actually permits

### 1.1 Amazon — RENDERED PRIMARY SOURCE

Amazon ships a first-party API whose entire purpose is asking a buyer for a review.
Fetched verbatim from Amazon's own public model repo:

- URL (RENDERED): https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/models/solicitations-api-model/solicitations.json
- API description, verbatim: *"With the Solicitations API you can build applications that
  send non-critical solicitations to buyers."*
- `getSolicitationActionsForOrder`, verbatim: *"Returns a list of solicitation types that
  are available for an order that you specify."*
- `createProductReviewAndSellerFeedbackSolicitation`, verbatim: *"Sends a solicitation to
  a buyer asking for seller feedback and a product review for the specified order."*
- Rate limit stated in the model: **1 request per second, burst of 5**, on both operations.

Why this matters for the constitution: the message body is **Amazon's own template**. The
seller supplies no copy. That means it is structurally impossible to ask for a *positive*
review, to offer an incentive inside it, or to gate on sentiment. It is the cleanest
compliant review-request surface that exists on any marketplace.

The older doc repo `amzn/selling-partner-api-docs` is archived and its markdown now only
carries a migration notice to `developer-docs.amazon.com/sp-api/docs/solicitations-api-v1-reference`
(RENDERED: the notice; the destination is BLOCKED here).

Amazon policy around it (SNIPPET only, must be closed by a human):
- Repeat review/feedback requests per order are against policy; using "Request a Review"
  means agreeing not to also send review requests via Buyer-Seller Messaging.
- Offering incentives (discount, free product, refund, compensation) in exchange for a
  review is prohibited; so is asking for a *positive* rating, contacting only satisfied
  buyers, and asking for removal of criticism.
- URLs a human must open to close this: Amazon's own PDF
  https://m.media-amazon.com/images/G/01/sell/pdf/Understanding-Amazon-Policies-on-Customer-Product-Reviews._CB464352042_.pdf
  and Seller Central "Communication Guidelines" + "Customer product reviews policies".

**Amazon Vine** is the one Amazon-sanctioned way to *pay* for reviews — because Amazon runs
it and picks the reviewers. SNIPPET-level pricing (must be verified on Seller Central):
US enrollment tiers reported as $0 for up to 2 units, $75 for 3–10, $200 for 11–30 units
per parent ASIN; up to 30 units per parent product; charge reportedly only after the first
Vine review publishes, and no charge if no review within 90 days; and a reported change
from March 2026 dropping the fee to $0 for products under $100. Every one of those numbers
is a snippet, not a rendered page. Requires Brand Registry (which requires a registered
trademark — a real, human, money-and-months step).
- Source seen (SNIPPET): https://www.bellavix.com/amazon-vine-program-costs-in-2026-what-sellers-and-vendors-need-to-know/ , https://novadata.io/resources/blog/amazon-vine-program-true-cost
- To close: https://sellercentral.amazon.com/help/hub/reference/vine (auth-walled).

### 1.2 Etsy (SNIPPET)

Etsy's Anti-Shilling policy prohibits offering incentives for positive reviews. Etsy sends
its own automated review reminders; the seller has no compliant lever to add incentives.
- Seen: https://www.etsy.com/legal/sellers/ (Seller Policy — House Rules), via snippet.
- To close: open https://www.etsy.com/legal/sellers/ and the Anti-Shilling section.

### 1.3 Trustpilot (SNIPPET — primary source BLOCKED)

Trustpilot bans **both** halves of the usual growth-hack playbook:
- Cherry-picking / review gating: choosing whom to invite, inviting only likely-happy
  customers, or "if you were happy leave a review, if not contact us" — described in the
  guidelines as not permitted and as illegal.
- Incentives: discounts, promo codes, prize-draw entries, refunds, freebies or any other
  benefit connected to the business, in exchange for a review.
- Enforcement is real: reported action against 330+ paying businesses, 39 paid
  subscriptions terminated, for gating or fake reviews.
- Primary URL (BLOCKED here, must be opened elsewhere):
  https://corporate.trustpilot.com/legal/for-businesses/guidelines-for-businesses/jun-2026

### 1.4 Google Business Profile / Maps UGC (SNIPPET — primary source BLOCKED)

- Fake engagement is prohibited; contributions must reflect a genuine experience.
- Businesses may not offer incentives — payment, discounts, free goods or services — in
  exchange for posting a review, or for revising/removing a negative one.
- Review gating is explicitly prohibited: any process that filters which customers get a
  review request, by expected sentiment, transaction size, or staff recommendation.
- Enforcement includes profile-level restrictions: a profile can be blocked from receiving
  new reviews for a period, or have existing reviews unpublished.
- Primary URLs (BLOCKED here): https://support.google.com/contributionpolicy/answer/7400114
  and https://support.google.com/business/answer/7400114

### 1.5 eBay (SNIPPET)

- Sellers can't demand positive feedback; can't make a refund, discount, return label or
  any other gesture contingent on revising/removing feedback; can't trade feedback; can't
  create, solicit or use fake/manipulated feedback.
- eBay even exposes a report path specifically for "feedback solicitation".
- Seen: https://www.ebay.com/help/policies/feedback-policies/feedback-policies?id=4208 (snippet).

### 1.6 G2 / Capterra — the one lane where paying reviewers is permitted (SNIPPET)

This is the notable exception and worth stating precisely, because it is easy to
over-generalise from it:
- Capterra permits gift cards **up to $25** for submitting a review.
- The incentive must reward **the act of reviewing, never the rating**, and must be offered
  equally to all eligible participants regardless of the rating given.
- Excluded: employees/affiliates of the reviewed company, direct competitors, G2/Capterra
  employees, government employees, anyone whose employer bars gifts.
- Incentivised reviews must be disclosed; failure to disclose gets an incentivisation
  notice or removal.
- Seen: https://sell.g2.com/resources/review-campaign-incentives and
  https://www.capterra.com/legal/community-guidelines/ (snippets).
- To close: open both URLs directly.

So: B2B software review sites permit a nominal, sentiment-neutral, disclosed incentive.
Consumer marketplaces (Amazon, Etsy, eBay, Google, Trustpilot) do not.

### 1.7 Law, not just terms

- **US, FTC 16 CFR Part 465**, "Rule on the Use of Consumer Reviews and Testimonials",
  published 2024-08-14, **effective 2024-10-21**. Bans creating, buying, selling or
  disseminating fake or false reviews and testimonials, and addresses review suppression.
  Civil penalties **up to $51,744 per violation**. (SNIPPET; primary eCFR page BLOCKED.)
  To close: https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-465 and
  https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers
- **EU, Omnibus Directive (EU) 2019/2161.** A trader may not state that reviews were
  submitted by consumers who actually used or bought the product unless it took
  "reasonable and proportionate steps" to ensure that. Traders displaying reviews must also
  explain what checks they run. (SNIPPET.)
- **Israel**: I searched in Hebrew and found **no** Israel-specific fake-review statute or
  Consumer Protection Authority guidance. חוק הגנת הצרכן תשמ"א-1981 general deception
  provisions would presumably apply, but I have no source that says so about reviews.
  Recorded as a dead end, not as a permission.

---

## 2. What a first review is actually worth

Best available number is Spiegel Research Center (Northwestern) with PowerReviews, 2017,
"How Online Reviews Influence Sales" — the study everyone else is quoting:
- Purchase likelihood for a product with **five reviews is 270% greater** than for a
  product with **zero** reviews.
- Essentially all of the lift lands within the first ~10 reviews; the first 5 drive most
  of it; marginal value falls off fast after that.
- Displaying reviews lifted conversion **+190% on a lower-priced product and +380% on a
  higher-priced product**.
- Evidence grade: SNIPPET only. The primary page is BLOCKED here:
  https://spiegel.medill.northwestern.edu/how-online-reviews-influence-sales/
  A human must open that to confirm the exact figures and the sample.

Answering the criterion's second question directly: **yes, a store can sell with zero
reviews — but at roughly a third of the conversion it would get at five.** The cold start
is not a wall, it is a ~2.7x tax that mostly disappears after five honest reviews per SKU.
That reframes the whole problem: the target is not "many reviews", it is "the first five,
per product, fast, honestly".

How hard are five reviews? Review-request email submission rates were reported at a
**5–15%** target band, with outliers to 22% (SNIPPET, https://wiserreview.com/blog/review-request-email/).
At 10%, five reviews ≈ 50 delivered orders per SKU. That is the honest arithmetic of the
cold start, and it is why the compliant answer is "ask every single buyer, once,
automatically" rather than anything cleverer.

---

## 3. The trap in this criterion

The most commercially obvious product in this space is **review gating** — send the review
request only to customers who first indicated they were happy. It is a standard feature
request, it demonstrably works, and it is:
- prohibited by Google (explicitly, including filtering by expected sentiment),
- prohibited by Trustpilot (cherry-picking, described as illegal),
- against Amazon policy (contacting only satisfied buyers),
- squarely in the target zone of FTC 16 CFR 465 and the EU Omnibus Directive,
- and against our own constitution regardless of any of that.

Any finding in this group that quietly includes a "sentiment filter", "happy-path", "NPS
pre-screen" or "smart send" is RED. This is the single easiest place in the whole colony to
violate terms and the constitution in one line of code.

Same for: sending review requests to people who did not buy, seeded reviews from friends
or staff, "sample in exchange for a review" outside Vine, and any coupon-for-review flow on
a consumer marketplace.

---

## 4. Payability to Israel

- **Selling our own SaaS directly** (Paddle / Lemon Squeezy / Stripe as merchant of
  record): YES — this repo already ships `products/il-biz-tools` on Paddle. Israel is a
  supported seller geography there in our own prior work.
- **Shopify App Store payouts to an Israeli partner: UNKNOWN.** I could not confirm it.
  Shopify Payments (merchant side) does not operate in Israel; partner payouts are a
  separate rail and the docs I could reach did not list supported countries. Payoneer and
  other virtual bank accounts are reportedly **not** accepted for Partner payouts, which
  removes the usual Israeli workaround. This is a hard gate and it is unresolved.
  To close: https://help.shopify.com/en/partners/manage-account/manage-payouts-invoices/payout-method
  (open it, check the country list for Israel and whether a local ILS/USD bank account
  qualifies) before any Shopify-App-Store-billed build is approved.
- **Amazon SP-API apps**: we would bill the seller ourselves off-platform, so payability is
  our own checkout's problem → YES. But SP-API developer registration and app approval are
  their own gate (see owner blockers).

---

## 5. Owner blockers actually implied (one-time, human, unavoidable)

Do not assume any of these are done.
- Paddle / Lemon Squeezy / Stripe seller identity + tax/KYC for an Israeli entity — one-time.
- Amazon: an SP-API **developer profile** registration, tied to a legal entity, with a
  security/data-protection questionnaire that a human signs, before a public app can call
  the Solicitations API on other sellers' accounts.
- Amazon Vine specifically requires **Brand Registry**, which requires a **registered
  trademark** — a months-long, money-costing human process. Vine is therefore not
  reachable by this colony for our own products in any near term.
- Shopify Partner account payout method setup (blocked on the UNKNOWN above).
- G2 / Capterra vendor profile claim, if we ever run a compliant incentive campaign for our
  own products.

---

## 6. Searches run (14)

1. Amazon "Request a Review" button seller policy communication guidelines incentives
2. Etsy seller policy reviews incentive discount in exchange for review
3. Trustpilot guidelines for businesses incentives / cherry-picking
4. Google Business Profile prohibited & restricted content, fake engagement, gating
5. FTC 16 CFR Part 465 effective date and civil penalty
6. Spiegel Research Center 270% five reviews conversion
7. G2 / Capterra gift card incentive policy $25
8. Amazon Vine enrollment fee 2026 per parent ASIN
9. Shopify Partner payouts supported countries Israel
10. Judge.me / Loox Shopify review app pricing 2026
11. eBay feedback solicitation / incentive policy
12. EU Omnibus Directive 2019/2161 reasonable and proportionate steps
13. Review request email submission-rate benchmark
14. (Hebrew) ביקורות מזויפות / חוק הגנת הצרכן / הרשות להגנת הצרכן

GitHub/WebFetch sources rendered (no search cost): amzn/selling-partner-api-models
solicitations.json; amzn/selling-partner-api-docs references tree and migration notices.
