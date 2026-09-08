# WORKER-SCOUT storefronts / creator-storefronts

**Criterion:** Ko-fi, Buy Me a Coffee, Stan Store, Beacons, Sellfy — digital-product support, fees,
payout rails available to Israel, and whether any of them works without an audience.

**Date of research:** 2026-09-03. **Search budget spent:** 8 of 8 (cap reached, stopped).

## Egress reality for this criterion

Every one of the five platforms' own help centres is blocked by the proxy. Confirmed blocked this
session (each returned `EGRESS_BLOCKED`):

- `ko-fi.com`, `help.ko-fi.com`
- `help.buymeacoffee.com`
- `docs.sellfy.com`
- `help.stan.store`
- `www.ruzuku.com`

`help.beacons.ai` was never fetchable either (only surfaced as search links). Consequence: **not one
primary platform page was rendered.** Everything platform-specific below rests on search snippets
that quote those pages, and is marked as such. The one exception is the Stripe evidence, which is a
rendered primary source via a GitHub mirror.

## The rendered primary source — Stripe's own docs, mirrored on GitHub

`https://raw.githubusercontent.com/Eyre921/ofiicial-developer-docs/main/dev-platforms/stripe/pages/payouts.md`
(rendered in full, 2026-09-03 — this is a mirror of `docs.stripe.com/connect/payouts` bank-account
requirements, and `docs.stripe.com` is itself blocked here).

Verbatim, from the Israel section of that page:

> Israel is only available for Cross-border payouts accounts.

with the IL bank format `IBAN | IL620108000000099999999 (23 characters)`.

**What this means, and it is the single most load-bearing fact in this whole criterion:** Stripe
splits payout countries into (a) fully supported standard payout countries and (b) countries
reachable *only* through Stripe's **Cross-border payouts** product. Israel is in group (b). A
platform that onboards sellers with ordinary Stripe Connect Standard/Express accounts therefore
**cannot onboard an Israeli seller at all** unless that platform has specifically enabled
cross-border payouts. Corroborating rendered source: `polarsource/polar`
`docs/merchant-of-record/supported-countries.mdx` lists Israel and states

> any individual or company operating in our supported countries can receive payouts from Polar even
> if Stripe standalone is invite-only there

i.e. Stripe standalone in Israel is invite-only; Israel is reachable only when the platform carries
it via Connect/cross-border. Also seen rendered: `shiguruikai/streamdeck-forza-telemetry`
`docs/stream-deck/distribution/stripe.md` (dated "accurate as of 1st April 2026") lists Israel among
Stripe **Connect cross-border payout recipient** countries — again the recipient tier, not the
standard tier.

**The structural conclusion for the whole group:** on these five platforms, Stripe is not a rail an
Israeli seller can assume. PayPal is. That collapses the field from five to two.

## Platform by platform

### 1. Ko-fi — the only free, PayPal-native option

Evidence (search snippets, 2026-09-03; the underlying pages are blocked):
- `https://help.ko-fi.com/hc/en-us/articles/24482435253661-What-payment-methods-are-available-on-Ko-fi`
  — snippet: creators get paid "directly and instantly into your own PayPal or Stripe account"; you
  need one or the other.
- `https://help.ko-fi.com/hc/en-us/articles/360009265834-Can-I-use-Stripe-in-my-country` — snippet:
  Stripe usable by creators in "over 40 countries"; PayPal "works in over 200 countries and can
  accept PayPal and card payments." Israel was NOT visible in any rendered list — the list itself
  could not be opened.
- `https://ko-fi.com/pricing` and `https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee`
  — snippets: 0% on tips; **5% on Shop sales, memberships and commissions on the free plan**; Ko-fi
  Gold drops platform fee to 0%.
- **Gold price is contested in the snippets**: one source says $6/mo, another says $12/mo for new
  creators. I did not render either page. Treat the Gold price as **unknown**; open
  `https://ko-fi.com/gold` and `https://ko-fi.com/pricing` to settle it.
- `https://ko-fi.com/shop` — snippet: digital downloads delivered instantly after purchase, no
  listing fees.

Ko-fi is the only one of the five with **no fixed monthly cost** — the free plan sells digital
downloads at 5%. That matters more than the fee level: it is the only one where a failed experiment
costs nothing.

### 2. Buy Me a Coffee — Israel is NOT a payout country

`https://help.buymeacoffee.com/en/articles/6258038-supported-countries-for-payouts-on-buy-me-a-coffee`
(snippet only, page blocked, 2026-09-03). The snippet reproduces the list:

> Australia, Austria, Belgium, Brazil, Bulgaria, Canada, Croatia, Cyprus, Czech Republic, Denmark,
> Estonia, Finland, France, Germany, Gibraltar, Greece, Hong Kong, Hungary, India, Ireland, Italy,
> Japan, Latvia, Liechtenstein, Lithuania, Luxembourg, Malaysia, Malta, Mexico, Netherlands, New
> Zealand, Norway, Poland, Portugal, Romania, Singapore, Slovakia, Slovenia, Spain, Sweden,
> Switzerland, Thailand, United Arab Emirates, United Kingdom, United States

**Israel is absent.** BMC payouts run exclusively through Stripe
(`https://help.buymeacoffee.com/en/articles/9770774-understanding-your-payouts-on-buy-me-a-coffee-through-stripe-express`,
`.../10025793-how-do-you-set-up-payouts-on-your-buy-me-a-coffee-page`), which is exactly consistent
with the rendered Stripe fact above: Stripe Express/Standard Connect, so Israel is out by
construction. This is a clean NO and it is a finding, not a failure.

### 3. Stan Store — Israel not in the Stripe Custom country list, and it charges rent

`https://help.stan.store/article/217-countries-available-for-stripe-custom-accounts` (snippet only,
blocked). Snippet: Stripe **Custom** accounts in **37 countries** — US, Canada, UK, most of the EU,
Australia, NZ, Japan, Singapore, Hong Kong, UAE. Israel not among them. Stan Store is also a paid
subscription: `https://cartmango.com/stan-store-pricing/` snippet gives **$29/mo and $99/mo** tiers.
So the shape is: pay rent up front, in a currency the owner can't be paid back in.

### 4. Beacons.ai — genuinely unknown, and that is the finding

No supported-payout-country list exists in anything I could reach. `help.beacons.ai` articles
(`/en/articles/4698049` Setting up Payments and Payouts, `/en/articles/4700289` Products Transaction
Fees, `/en/articles/4700929` International Currencies) all surfaced as links but the host is not
fetchable. Snippets confirm only that Beacons uses **Stripe and PayPal** and supports "over 20
currencies". Given the Stripe fact above, Beacons' Israeli payability turns entirely on whether its
PayPal path is a full seller rail or only a checkout option — unresolved.

**To close it, a human or unblocked agent must open:**
`https://help.beacons.ai/en/articles/4698049` and `https://help.beacons.ai/en/articles/4700289`.

### 5. Sellfy — PayPal direct-to-seller, but $22/mo of rent

- `https://docs.sellfy.com/article/42-how-to-receive-payments-from-customers` (snippet, blocked):
  Sellfy integrates **Stripe and PayPal** only; **money goes directly into the seller's own Stripe
  or PayPal account** (Sellfy is not the merchant of record and does not hold funds). Critically the
  snippet also says: "if both PayPal and Stripe do not allow receiving payments in your country, you
  can only use Sellfy to offer free products."
- `https://sellfy.com/pricing/` (snippet): plans **from $22/mo**, **0% transaction fees**.
- `https://docs.sellfy.com/article/375-how-to-add-payment-options` — the page that would settle the
  PayPal-only question. Blocked. **Open this to close it.**

Because payment lands in the seller's *own* PayPal account, Sellfy's Israeli payability inherits
PayPal's, not Stripe's. That is the same escape hatch Ko-fi has.

## The rail that actually decides it: PayPal in Israel

Search 2026-09-03 returned PayPal's own Israeli help domain:
`https://www.paypal.com/il/cshelp/article/how-do-i-link-a-bank-account-to-my-paypal-account-help183?locale.x=en_IL`
(snippet; `paypal.com` not fetched). Snippet, from PayPal IL:

> You can use an Israeli bank account only to withdraw funds from your PayPal account. You can only
> withdraw funds to Israeli bank accounts or Israeli credit cards in Israeli Shekels (ILS).
> ... make sure that the name on your account is in English, as our system won't let you add your
> bank account if the name is in Hebrew.

PayPal also publishes an Israel-specific user agreement:
`https://www.paypalobjects.com/marketing/ua/OA/useragreement-full/en-IL-070626.pdf` (updated 6 July
2026) — a direct, dated indication that PayPal operates a live Israeli seller relationship. This is
the strongest available evidence that **PayPal Israel can receive and withdraw**, and it is still
snippet-grade. A human should render the PDF above to confirm the seller/receiving terms.

Net: **Ko-fi and Sellfy are payable to Israel via PayPal (medium confidence). BMC and Stan Store are
not payable (Stripe-only, Israel absent from both published lists). Beacons is unknown.**

## The question that kills all five: does any of them work without an audience?

Search 2026-09-03 (snippets, blocked pages):
- `https://www.creatorstackclub.com/software/ko-fi-shop` — snippet: "Ko-fi does not have a
  marketplace or discovery feature. Nobody browses Ko-fi to find new products the way they browse
  Gumroad Discover or Etsy. Like Gumroad and Payhip, Ko-fi is a storefront, not a marketplace — it
  won't send you buyers." and "you will need to drive all traffic yourself."
- `https://sellfy.com/blog/starting-online-store/` / `https://fourthwall.com/blog/ko-fi-alternatives`
  — snippets: Sellfy is a standalone storefront with custom domain and embeddable widgets; **neither
  platform has a built-in audience**.

This is the decisive fact for MISSION. A storefront is a **checkout mechanism**, not a **channel**.
None of the five supplies a single buyer. Under MISSION the owner does not appear, does not post and
does not sell, so "drive all traffic yourself" resolves to *no traffic exists*. MISSION constraint 7
(no line may be built before its acquisition channel is named) is therefore **unsatisfiable by
anything in this criterion on its own**.

## Honest verdict

The correct output of this criterion is not a revenue line. It is one piece of infrastructure and
three eliminations:

- **Keep**: Ko-fi free plan as a zero-fixed-cost, PayPal-settled checkout for a digital file, to be
  bolted onto a line whose traffic comes from somewhere else (SEO on il-biz-tools, the Telegram bot,
  an Apify actor listing). Value = it removes a payment-rail blocker, not that it earns.
- **Eliminate**: Buy Me a Coffee (Israel not payable), Stan Store (Israel not payable + $29-99/mo
  rent), Sellfy (payable but $22/mo rent for a storefront with zero traffic — negative expected
  value until a channel exists).
- **Unresolved**: Beacons.

## Owner blockers (one-time human KYC only)

For the Ko-fi/PayPal route, and only this:
1. Create/verify a PayPal account able to **receive** business payments as an Israeli resident
   (PayPal identity verification — a human identity step).
2. Link an Israeli bank account to PayPal **with the account name written in English** (per the
   PayPal IL snippet above) so ILS withdrawal works.
3. Create the Ko-fi account and connect PayPal to it (account creation is software-doable; the PayPal
   consent click sits behind the verified human account).

I am *not* asserting any Israeli tax-registration step here; that is outside what I could evidence
this session and I will not invent it.

## Every URL used

Rendered (strong evidence):
- https://raw.githubusercontent.com/Eyre921/ofiicial-developer-docs/main/dev-platforms/stripe/pages/payouts.md
- (via GitHub code search, quoted fragments) https://github.com/polarsource/polar — docs/merchant-of-record/supported-countries.mdx
- (via GitHub code search, quoted fragments) https://github.com/shiguruikai/streamdeck-forza-telemetry — docs/stream-deck/distribution/stripe.md
- (via GitHub code search, quoted fragments) https://github.com/antiwork/gumroad — app/modules/user/compliance.rb
- https://raw.githubusercontent.com/stripe/stripe-ruby/master/README.md (no country content — dead end)

Snippet-only (weaker; host blocked, listed so a human can close them):
- https://help.ko-fi.com/hc/en-us/articles/24482435253661-What-payment-methods-are-available-on-Ko-fi
- https://help.ko-fi.com/hc/en-us/articles/360009265834-Can-I-use-Stripe-in-my-country
- https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee
- https://ko-fi.com/pricing , https://ko-fi.com/gold , https://ko-fi.com/shop
- https://help.buymeacoffee.com/en/articles/6258038-supported-countries-for-payouts-on-buy-me-a-coffee
- https://help.buymeacoffee.com/en/articles/9770774-understanding-your-payouts-on-buy-me-a-coffee-through-stripe-express
- https://help.stan.store/article/217-countries-available-for-stripe-custom-accounts
- https://cartmango.com/stan-store-pricing/
- https://help.beacons.ai/en/articles/4698049 , https://help.beacons.ai/en/articles/4700289 , https://help.beacons.ai/en/articles/4700929
- https://docs.sellfy.com/article/42-how-to-receive-payments-from-customers
- https://docs.sellfy.com/article/375-how-to-add-payment-options
- https://sellfy.com/pricing/
- https://www.paypal.com/il/cshelp/article/how-do-i-link-a-bank-account-to-my-paypal-account-help183?locale.x=en_IL
- https://www.paypalobjects.com/marketing/ua/OA/useragreement-full/en-IL-070626.pdf
- https://www.creatorstackclub.com/software/ko-fi-shop
- https://fourthwall.com/blog/ko-fi-alternatives
- https://sellfy.com/blog/starting-online-store/

Blocked (do not retry): ko-fi.com, help.ko-fi.com, help.buymeacoffee.com, docs.sellfy.com,
help.stan.store, www.ruzuku.com.
