# Scout notes — group: store-promotion / criterion: cross-promotion

Scout: WORKER-SCOUT "cross-promotion". Date of research: 2026-09-03.
Criterion: a portfolio promoting itself — internal linking between our own stores, a shared
hub site, bundles, footers, one newsletter across many products. What is legitimate vs. what
Google calls a link scheme / PBN. Whether marketplaces permit cross-listing a seller's own
products. And the honest question: does cross-promotion between low-traffic stores move
anything, or is it zero times zero?

## Method and constraints
- The egress proxy blocked every primary source I actually wanted: `developers.google.com`,
  `help.etsy.com`, `telegram.org`. Confirmed EGRESS_BLOCKED on all three.
- `raw.githubusercontent.com` renders. Google's spam policies and the Chrome Web Store
  policies are mirrored verbatim into public repos, and that is where the strongest evidence
  in this report comes from — rendered pages, not snippets.
- Web searches spent: 12 of the 20 allowed.

## Evidence grades used below
- **RENDERED** = I fetched the page and read the text.
- **SNIPPET** = a search result summary quoting a page I could not open. Weaker.
- Nothing here rests on memory.

---

## 1. Google's actual wording (RENDERED)

Source: mirror of `developers.google.com/search/docs/essentials/spam-policies` at
https://raw.githubusercontent.com/lesishu/seo-guide-skill/ab8af275605f249b8a3eb620ba0cd1b74eb01436/references-google/essentials-spam-policies.md
(fetched 2026-09-03). Cross-checked against a second file in the same repo,
`references-google/spampolicy-full.md`, same date.

Link spam definition: *"the practice of creating links to or from a site primarily for the
purpose of manipulating search rankings."* The bullet list, verbatim, includes:

> * Excessive link exchanges ("Link to me and I'll link to you") or partner pages exclusively for the sake of cross-linking
> * Requiring a link as part of a Terms of Service, contract, or similar arrangement without allowing a third-party content owner the choice of qualifying the outbound link
> * Low-quality directory or bookmark site links
> * Keyword-rich, hidden, or low-quality links embedded in widgets that are distributed across various sites
> * **Widely distributed links in the footers or templates of various sites**
> * Creating low-value content primarily for the purposes of manipulating linking and ranking signals

And the exemption:

> Google does understand that buying and selling links is a normal part of the economy of the
> web for advertising and sponsorship purposes. It's not a violation of our policies to have
> such links as long as they are qualified with a `rel="nofollow"` or `rel="sponsored"`
> attribute value to the `<a>` tag.

**The bullet that governs our criterion is "Widely distributed links in the footers or
templates of various sites."** A shared footer link block replicated across N owned domains is
the named example. Note what the bullet does *not* say: it does not ban a footer. It bans a
link block distributed across various *sites* whose purpose is ranking signal. The safe
version is (a) one site, where footer links are internal navigation and not a cross-domain
link graph at all, or (b) cross-domain footer links carrying `rel="nofollow"` — which buys
referral traffic and buys no ranking credit, which is exactly the honest trade.

Doorways, verbatim from the same source: *"Doorway abuse is when sites or pages are created to
rank for specific, similar search queries."* Examples include:

> * "Having multiple websites with slight variations to the URL and home page to maximize their reach for any specific query"
> * "Having multiple domain names or pages targeted at specific regions or cities that funnel users to one page"

This is the second live risk for us, and it is the bigger one. A portfolio strategy that spins
up `mas-hachnasa-calculator.co.il`, `maam-calculator.co.il`, `sachar-neto-calculator.co.il`
as separate near-identical microsites that all funnel to one hub is *literally* the first
doorway example. The existing `il-biz-tools` shape — one domain, `vat.html`,
`net-salary.html`, `osek-patur.html`, `allocation.html`, `invoice.html` as pages of one site
— is the compliant shape and should not be split.

Site reputation abuse, verbatim: *"a tactic where third-party content is published on a host
site mainly because of that host's already-established ranking signals, which it has earned
primarily from its first-party content."* This one does **not** apply to us: our content is
first-party on our own sites. Worth recording because it is the guideline people misquote when
they say "a hub site is a PBN". It is not the relevant clause; link spam and doorways are.

**What Google never publishes:** there is no clause anywhere in the spam policies saying "you
may not own several sites" or "you may not link between sites you own." The prohibition is
purpose-based — links created *primarily* to manipulate rankings. That is the line, and it is
a line about intent and about whether the link would exist if search engines did not.

## 2. One site beats several (SNIPPET)

Search 2026-09-03: Google's John Mueller's position, as reported, is that *"focusing on a
single website makes it much easier for Google's algorithms to understand your site, the
services you're providing, and the regions that you service."* Sources seen as snippets:
https://support.google.com/webmasters/thread/66780007/multiple-domains-for-the-same-company
and https://www.webfx.com/web-development/learn/how-to-consolidate-two-websites/ .
**To close this properly a human must open the support.google.com thread** — I could not.
The practical conclusion does not depend on it: consolidation is both the SEO-safe and the
doorway-safe answer, and it is cheaper to operate.

## 3. Marketplaces: does the platform permit cross-listing your own products?

### Apify — YES, explicitly encouraged (SNIPPET, strong)
Search 2026-09-03 surfaced Apify's own Actor marketing playbook stating that if you have
created other Actors *"it's completely fine to include a promo for them in the end, and it's
even better if you edit your old Actors and put in a link to your new Actor,"* with the
worked example *"Like my Amazon Crawler? See my Amazon Review Crawler."*
Page to open to confirm: https://docs.apify.com/academy/actor-marketing-playbook/store-basics/how-store-works
and https://help.apify.com/en/articles/2644024-seo-for-actors . `docs.apify.com` was not
reachable from this container. This is the single cleanest GREEN cross-promotion surface we
have, and it costs approximately zero hours: it is a README edit on an Actor we already ship.

### Chrome Web Store — cross-promotion is not the risk; cloning is (RENDERED)
Source: https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/program-policies/spam-faq/index.md
(fetched 2026-09-03), plus `.../spam-and-abuse/index.md`, same date.

> "Our developer policy prohibits the submission of repetitive content. In general, this means
> you cannot submit multiple extensions that provide the same experience."

> "We don't allow any developer or their affiliates to submit repetitive content. If related
> developers or publishers submit multiple extensions that provide duplicate experiences or
> functionality, that is a repetitive content violation."

> "Keywords must be relevant to the extension's purpose and not unnecessarily repeat in an
> unnatural way. Including more than 5 instances of a single keyword may result in increased
> scrutiny."

> "Developers must not attempt to manipulate the placement of any extensions in the Chrome Web
> Store. This includes, but is not limited to, inflating product ratings, reviews, or install
> counts by illegitimate means, such as fraudulent or incentivized downloads, reviews and ratings."

The FAQ contains **no clause permitting or forbidding linking to your other extensions**. So
in-listing cross-promotion is unaddressed (AMBER by silence), while the "publish twelve
variants of one calculator extension" portfolio strategy is squarely banned and the stated
penalty reaches the developer account. The `dev-extensions` revenue line in
`src/revenue/portfolio.ts` should carry this as a hard constraint: one extension per genuinely
distinct function, never variants.

### Etsy — About page yes, listing description no (SNIPPET only)
Search 2026-09-03. Reported rules: outbound links are clickable only in the RELATED LINKS
section of the About page; *"You may not use Etsy to direct shoppers to another online selling
venue to purchase the same items as listed in your Etsy shop"* (fee avoidance). Cross-shop
mention in the About section is reported as allowed. Page a human must open to confirm:
https://www.etsy.com/legal/advertising/ — `help.etsy.com` is egress-blocked here. Marked
low confidence; Etsy is also not a rail this portfolio currently uses.

### Telegram — could not verify (DEAD END)
`telegram.org/tos/bot-developers` is EGRESS_BLOCKED. Search returned only third-party blogs
claiming a Telegram affiliate program pays a developer-set percentage when referred users
spend Stars in a mini app. That is a marketing blog claim about a revenue-sharing mechanic and
I will not report it as fact. A human or unblocked agent must open
https://telegram.org/tos/bot-developers and https://core.telegram.org/bots/payments before any
cross-bot promotion is built.

## 4. One newsletter across many products — the Israeli law is the binding constraint

Source (RENDERED): https://raw.githubusercontent.com/threeheartsdigital/email-marketing-regulations/main/country/israel.md
(fetched 2026-09-03), which summarises Section 30A of the Communications Law
(Telecommunications and Broadcasting), 1982 — the Amendment 40 anti-spam regime.

Key clauses as rendered:
- *"You can only send marketing emails to those who have provided explicit consent to receive
  marketing emails from you"* — consent must be *"in advance and in writing,"* and an
  electronic message counts as writing.
- Existing-customer exception is narrow: it applies where details came from a purchase, you
  told them at the time the details would be used for advertising, **and** *"your advert
  relates to a similar type of product or service."*
- Unsubscribe must be free and in the same medium.
- The message must be marked as an advertisement (the word "advertisement" in the subject
  line per this source) and carry the sender's name, address and contact details.
- Civil damages *"could be as much as 1,000 ILS for each message sent by the advertiser to the
  recipient"* — without proof of damage.

Cross-checked by search snippet against https://www.gov.il/en/departments/faq/17052018_7 and
https://www.hunton.com/privacy-and-information-security-law/new-anti-spam-law-takes-effect-in-israel
(both surfaced 2026-09-03; gov.il itself is egress-blocked).

**Consequence for this criterion, stated plainly.** "One newsletter across many products" is
the single most dangerous item on the list. A list collected on a Hebrew VAT calculator and
then used to promote a Telegram bot and a paid API is not obviously *"a similar type of product
or service."* At 1,000 ILS per message, a 2,000-address send that a regulator or a single
annoyed recipient challenges is a five- to six-figure ILS exposure against a portfolio that
currently earns nothing. The compliant build is not "be careful with the newsletter" — it is:
one opt-in checkbox per product, unticked, whose label names the scope explicitly ("…and
occasional updates about our other Israeli small-business tools"), consent timestamp and
wording stored per subscriber, advertisement marking and full sender identity on every send,
one-click unsubscribe. That is a real build and it is GREEN. Anything that merges lists
collected under different scopes is AMBER at best and must not be built.

## 5. The honest question: is it zero times zero?

Yes, at today's traffic. The arithmetic is multiplicative and it is not close.

Anchors I could actually source (SNIPPET, 2026-09-03):
- Standard display/banner CTR benchmarks sit around 0.05–0.2%, with footer placements
  explicitly below top-of-page placements (https://webeyez.com/insights/guides/average-click-through-rate-banner-ads-optimization-guide,
  https://www.bannerflow.com/blog/display-advertising-ctr-for-your-industry). A promo block
  is not identical to a display ad — an in-context "you might also need our VAT calculator"
  text link on a relevant page should beat 0.2% by a lot — but the order of magnitude for a
  generic sitewide footer block is fractions of a percent.
- Ecommerce visit-to-purchase conversion: *"Statista reports that 1.4% of global ecommerce
  visits converted into purchases in Q1 2026, while Dynamic Yield puts the global average
  higher, at 2.66%"* (https://www.shopify.com/blog/ecommerce-conversion-rate).
- "Cross-selling alone generates 10-30% of ecommerce sales" appeared in results
  (https://www.triplewhale.com/blog/ecommerce-benchmarks). **I am flagging this one as
  unreliable** — it is a vendor blog restating a widely-copied figure, and it describes
  established stores with existing order flow. It does not transfer to a portfolio with no
  orders, and I will not build a projection on it.

The model: incremental revenue ≈ (monthly visitors to store A) × (CTR on the cross-promo) ×
(conversion at store B) × (price). Every term after the first is a fraction. With 1,000
monthly visitors across the whole portfolio, a generous 2% in-context CTR and a 2% purchase
conversion, that is 0.4 sales a month. At an il-biz-tools Pro-tier price that is single-digit
shekels. **Cross-promotion is a multiplier on traffic, and a multiplier on zero is zero.**

The correct read is not "don't build it" but "don't fund it, and don't schedule it as a
growth line." The cheap, GREEN, permanently-useful pieces (Apify README links, one
consolidated domain, honest in-context links between genuinely related tools, a per-product
opt-in list) cost a handful of hours and compound the day traffic exists. The expensive
pieces (a separate hub property, a cross-rail bundle system, a newsletter operation with
legal review) are pure cost until at least one store has demand. **The colony's acquisition
problem is upstream of this criterion, and no amount of internal linking substitutes for it.**

## 6. Bundles — a structural blocker specific to this portfolio

From `products/README.md` in this repo (read 2026-09-03): the four shipped products sit on
four different payment rails — Paddle (il-biz-tools), Telegram Stars→TON via Fragment
(telegram-il-tools-bot), Apify pay-per-event (apify-il-open-data), x402/USDC on Base
(x402-il-api). There is no checkout that can charge for two of these at once. A real
cross-product bundle therefore requires either (a) restricting the bundle to products on a
single rail, or (b) building a license/entitlement server that sells one Paddle SKU and then
grants access on the other products — which is a genuine build, not a footer edit.

Bundle mechanics on the rails themselves (SNIPPET, 2026-09-03): Gumroad supports bundling
existing products (https://help.gumroad.com/article/52-making-multiple-purchases, and a
long-standing feature request at https://gumroad.nolt.io/479); Lemon Squeezy is reported to
have a one-line-item checkout limit requiring multiple products to collapse into a single
custom-priced item (https://docs.lemonsqueezy.com/help/checkout). Paddle's bundling behaviour
I could not source — https://www.paddle.com/help/ is egress-blocked and must be opened by a
human before a bundle SKU is designed.

Payability to Israel: Paddle already pays this portfolio (it is the live rail for
il-biz-tools per `products/README.md`), so a Paddle-only bundle inherits a YES. Lemon Squeezy
and Gumroad Israel payout status I saw only as ambiguous snippets and I am recording them as
UNKNOWN rather than guessing.

## 7. Full URL list

Fetched and rendered:
- https://raw.githubusercontent.com/lesishu/seo-guide-skill/ab8af275605f249b8a3eb620ba0cd1b74eb01436/references-google/essentials-spam-policies.md
- https://raw.githubusercontent.com/lesishu/seo-guide-skill/ab8af275605f249b8a3eb620ba0cd1b74eb01436/references-google/spampolicy-full.md
- https://raw.githubusercontent.com/lesishu/seo-guide-skill/ab8af275605f249b8a3eb620ba0cd1b74eb01436/references-google/spam-policies-full.md
- https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/program-policies/spam-faq/index.md
- https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/program-policies/spam-and-abuse/index.md
- https://raw.githubusercontent.com/threeheartsdigital/email-marketing-regulations/main/country/israel.md

Seen only as search snippets (a human must open these to close the claims):
- https://developers.google.com/search/docs/essentials/spam-policies (canonical; blocked here)
- https://support.google.com/webmasters/thread/66780007/multiple-domains-for-the-same-company
- https://docs.apify.com/academy/actor-marketing-playbook/store-basics/how-store-works
- https://help.apify.com/en/articles/2644024-seo-for-actors
- https://www.etsy.com/legal/advertising/
- https://telegram.org/tos/bot-developers
- https://core.telegram.org/bots
- https://www.gov.il/en/departments/faq/17052018_7
- https://www.hunton.com/privacy-and-information-security-law/new-anti-spam-law-takes-effect-in-israel
- https://www.law.co.il/en/news/2016/08/19/israeli-anti-spam-law-amended-for-first-time/
- https://www.shopify.com/blog/ecommerce-conversion-rate
- https://www.triplewhale.com/blog/ecommerce-benchmarks (figure flagged unreliable)
- https://webeyez.com/insights/guides/average-click-through-rate-banner-ads-optimization-guide
- https://www.bannerflow.com/blog/display-advertising-ctr-for-your-industry
- https://help.gumroad.com/article/52-making-multiple-purchases
- https://docs.lemonsqueezy.com/help/checkout
- https://www.paddle.com/help/ (blocked)

Confirmed EGRESS_BLOCKED from this container: developers.google.com, help.etsy.com, telegram.org.
