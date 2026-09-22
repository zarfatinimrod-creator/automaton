# Scout notes — plugin-ecosystems / chrome-extensions

**Criterion:** Chrome Web Store after in-app payments shut down: how paid extensions are monetized
now (ExtensionPay, own licensing), top-earning niches with evidence, review/permission bars, and
Manifest V3 constraints.

**Date of sweep:** 2026-09-04. **Searches spent:** 7 of 8 allowed. **Model:** Opus 5.

**Prior colony position:** `docs/REJECTED.md` already kills this ecosystem twice — "Chrome Web Store
extension portfolio" (RED, duplicate-experience clause) and "Chrome Web Store, one extension"
(ranking ceiling, no cold-start lane). Nothing found here reopens either. This scout's job reduced
to: confirm the mechanics with primary sources, and look for anything net-new the two rejections
did not cover.

---

## Evidence grades used

- **RENDERED** — I fetched the page and read its text.
- **SNIPPET** — a search result quoting a page I could not open. One grade weaker.
- **BLOCKED** — I tried to fetch and the egress proxy refused. URL named for a human.

---

## 1. Chrome Web Store payments: dead, with dates (RENDERED — strongest source in this sweep)

Fetched Google's own docs repo (developer.chrome.com is egress-blocked; its **source repo on GitHub
is not**):

`https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/cws-payments-deprecation/index.md`

Timeline quoted from that file:

| Date | Event |
|---|---|
| 2020-03-27 | "Publishing of paid items temporarily disabled." |
| 2020-09-21 | New paid extensions can no longer be created |
| 2020-12-01 | "Free trials are disabled. The 'Try Now' button in CWS will no longer be visible" |
| 2021-02-01 | "Your existing items and in-app purchases can no longer charge money with Chrome Web Store payments" |
| (future) | The Licensing API shuts down |

Google names **no replacement**. Verbatim: "There are many other ways to monetize your extensions",
and developers must "migrate to another payments processor" and implement their own "replacement
payment/licensing scheme".

**Consequence, and it is the whole shape of this criterion:** there is no store checkout, no paid
listing, no store-side license. Every extension that charges in 2026 runs its **own** billing.
The Chrome Web Store is a *distribution* channel with zero payment rail — which means it inherits
none of the payability protection a real marketplace gives an Israeli seller, and all of the
ranking problems `REJECTED.md` already documented.

## 2. Manifest V3: what a licensing scheme is allowed to do (RENDERED)

`https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/extensions/migrating/improve-security/index.md`

- Forbidden: "In Manifest V3, all of your extension's logic must be part of the extension package.
  You can no longer load and execute remotely hosted files according to Chrome Web Store policy."
  `eval()`, `new Function()`, `executeScript()` on remote strings are out. `script-src`/`object-src`/
  `worker-src` for `extension_pages` are limited to `self`, `none`, `wasm-unsafe-eval`, localhost.
- **Explicitly allowed, and this is the load-bearing sentence for monetization:** "Your extension
  calls a remote web service. This lets you keep code private and change it as needed while avoiding
  the extra overhead of resubmitting to the Chrome Web Store." Also allowed: caching a remote JSON
  config that "determines which features are enabled", and remotely hosted code inside **sandboxed
  iframes**.

So a server-side licence check that gates features is **MV3-legal and policy-clean (GREEN)**. The
MV3 remote-code ban is not the obstacle people assume it is for paywalls; it only bans shipping
*logic* from the server. Feature flags and entitlement checks are the sanctioned pattern.

## 3. Review and permission bars (RENDERED)

`https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/review-process/index.md`

- "most submissions completed review in less than 24 hours, with over 90% completed within three
  days" — self-dated "as of early 2021" in the doc, so treat the number as stale.
- Longer review is triggered by: **new developer accounts**, newly submitted extensions, requests
  for dangerous permissions, significant code modifications. A new publisher with a paywalled
  extension hits three of the four at once.
- Broad host permissions (`*://*/*`, `<all_urls>`) flagged as data-harvesting risk. Obfuscation
  prohibited; minification permitted. If it waits over three weeks, contact developer support —
  i.e. the escalation path is a human support conversation, which the mission forbids.

`site/en/docs/webstore/program-policies/index.md` returned **404** in the repo at that path; I did
not spend further turns hunting it, because `REJECTED.md` already carries a verified verbatim of the
duplicate-experience and minimum-functionality clauses.

## 4. ExtensionPay / ExtPay — the default rail, and its Israel problem

- **RENDERED:** `https://raw.githubusercontent.com/Glench/ExtPay/master/README.md` — "The JavaScript
  library for ExtensionPay.com, a service to easily add payments to browser extensions." MV3 fully
  supported (service-worker instructions in the README). Needs `storage` permission, a
  `connect-src https://extensionpay.com` CSP entry, and on Firefox a `https://extensionpay.com/*`
  permission. Modest permission footprint — does **not** by itself trigger the dangerous-permission
  review bar. The README **does not state the fee**.
- **RENDERED (GitHub issues):** `https://github.com/Glench/ExtPay/issues/11` (title "is this stripe
  payment only", closed 2021-08-05) confirms **Stripe-only**; the asker's stated reason is "stripe is
  not available in many place". `https://github.com/Glench/ExtPay/issues/338` (2026-03) shows the
  seller connects **their own Stripe account** and manages prices in Stripe.
- **SNIPPET:** fee is **5% to ExtensionPay on top of Stripe's own fees (~2.9% + $0.30)**, no monthly
  fee, with lower/flat rates negotiable at volume. Sources quoted: extensionpay.com and
  `https://addonews.com/extensionpay-review-scale/`. **extensionpay.com is EGRESS_BLOCKED** — a human
  must open `https://extensionpay.com/` to confirm the 5%.
- **The gate:** ExtPay pays out only through the developer's own Stripe account, so ExtensionPay is
  payable to Israel **iff Stripe is**. My search on that came back *contradictory*: one synthesized
  answer said "Stripe is not officially supported in Israel... Israel isn't currently on the list of
  countries supported by Stripe", while a second search surfaced `stripe.com/resources/more/payments-in-israel`
  as evidence of Israeli support. `stripe.com` and `docs.stripe.com` are **EGRESS_BLOCKED**, so I
  could not settle it. **Israeli payability of ExtensionPay = UNKNOWN.**
  URLs a human/unblocked agent must open to close this:
  - `https://stripe.com/global`
  - `https://support.stripe.com/questions/stripe-feature-availability-by-country`
  - `https://docs.stripe.com/connect/cross-border-payouts`

## 5. The Israel-safe alternative architecture: own licensing + merchant of record

Because MV3 explicitly blesses "calls a remote web service", nothing forces ExtensionPay. An
extension can hold a licence key / account token, call our own endpoint, and take money through a
merchant of record we already know pays this owner.

- Our repo already documents Paddle as merchant of record supporting Israeli individuals —
  `products/il-biz-tools/README.md:134` — though `docs/CRITERIA_SWEEP.md:141` records that the first
  sweep's Paddle scout honestly graded "is Israel on Paddle's supported-seller list" as
  **UNKNOWN-leaning-YES**, not YES. I inherit that grade; I did not re-verify it and I am not
  entitled to upgrade it.
- **SNIPPET:** an aggregator, ExtensionBill, markets exactly this — "bring your own MoR (Polar,
  Paddle, Lemon Squeezy, Creem, or Dodo) behind one clean, no-backend SDK... flat platform fee
  instead of a percentage" (`https://extensionbill.com/blog/merchant-of-record-vs-stripe-extension-payments/`).
  I could not verify the company, its fee, or whether it exists as more than SEO content. Note that
  several domains that dominated these result sets — chromegoldmine.com, extensionbooster.net,
  extensionradar.com, extensionbill.com — read as an SEO content-farm cluster around this exact
  keyword. **I treat every number from them as unverified.**
- No MoR platform's own docs were reachable: lemonsqueezy, polar.sh, paddle.com all blocked or
  unfetched. Israel payability for Polar/Lemon Squeezy = UNKNOWN, unsearched.

## 6. Niches and earnings — the evidence is weak and mostly vendor-authored

What I actually saw (all **SNIPPET**, none rendered):

- `https://www.debugbear.com/blog/counting-chrome-extensions` — "As of May 2026, the Chrome Web Store
  hosts over 251,488 extensions, yet **90.11% have fewer than 1,000 users**." This is the single most
  useful number in the criterion and it is a ceiling, not an opportunity: the modal extension has
  no audience. DebugBear is a third party with no stake in extension monetization, which makes it
  the most trustworthy source in this list.
- Same snippet set: "In most categories 1-3% of extensions are paid, with the Fun category being a
  clear outlier at 15% paid." Unattributed within the snippet — provenance unclear, low confidence.
- Named earners, all quoted from **ExtensionPay's own marketing page**
  (`https://extensionpay.com/articles/browser-extensions-make-money`, blocked) and from
  chromegoldmine.com: GMass ~$130k/month "as of 2019"; Closet Tools (Poshmark automation) ~$42k/month;
  Easy Folders $3,700 MRR / $42k total in six months. **A payments vendor publishing its customers'
  revenue is the definition of a motivated source.** None of these is independently confirmed here.
  Note also that Closet Tools is *marketplace automation* — the same shape our constitution and most
  platform ToS reject.
- The counter-example matters more than the winners: a snippet from a dev.to post (blocked) reports
  an indie dev at **$31.03 MRR across 38 live extensions** as of end-July 2026, using ExtensionPay.
  That is ₪115/month for a 38-extension portfolio — and a portfolio is the thing `REJECTED.md`
  already bans on policy grounds anyway.
- "Privacy and Workflow carry the highest average reach per listing, with Accessibility and Social
  close behind" — snippet, unattributed, low confidence. Not actionable.

## 7. Monetization routes I checked and will not recommend

- **Ad / bandwidth-sharing SDKs** (mellowtel.com appeared in results as both a vendor and a blog
  publisher). Monetizing by selling the user's bandwidth or browsing is AMBER at best under
  CWS user-data policy and fails our constitution's "no deceiving a buyer" test unless disclosure is
  perfect. Not recommended. Not searched further.
- **Selling the extension** (`https://exitbid.io/blog/sell-chrome-extension`, "$20K–$200K+"). An
  acquisition is a negotiation with a human buyer. Mission-forbidden regardless of the number.
- **Sponsorships** (chromegoldmine.com). Requires a human relationship and an audience we do not
  have. Forbidden and empty.

---

## Owner blockers found (do not assume any are done)

1. **Chrome Web Store developer registration: one-time US$5 fee** — SNIPPET only, from
   `https://developer.chrome.com/docs/webstore/register` (EGRESS_BLOCKED) and several SEO blogs.
   A human must pay it with a card, once.
2. **2-Step Verification on the publishing Google account** — SNIPPET; required before publishing or
   updating any item.
3. **EU DSA trader / non-trader declaration** — SNIPPET; a paperwork declaration affecting EU
   visibility. Reported as "not an extra payment". Unverified.
4. **A Stripe account (if ExtensionPay) or a Paddle/MoR seller account** — KYC on a real human, and
   for Stripe the Israeli availability question above is unresolved.
5. **The review escalation path is a human support conversation** if a submission stalls past three
   weeks. This is a standing mission risk on this channel, not a one-time step.

## Dead ends, stated plainly

- The criterion is **largely confirmatory, not generative**. Two `REJECTED.md` entries already close
  it and I found nothing that reopens either. The duplicate-experience clause kills portfolios; the
  undocumented ranking with no cold-start lane kills the single listing.
- **Google publishes no revenue data at all**, and the vacuum is filled by an SEO content-farm
  cluster and by a payments vendor's own marketing. There is no honest way to rank "top-earning
  niches" from here. Anyone who reports a confident niche ranking on this criterion is reporting
  content-farm output.
- `chromewebstore.google.com`, `developer.chrome.com`, `extensionpay.com`, `stripe.com`,
  `dev.to`, `debugbear.com` — all blocked. The only reason this scout has any rendered primary
  evidence is that Google keeps its extension docs in a public GitHub repo. That route generalizes
  and should be recorded: **when a vendor's docs site is blocked, look for the docs' source repo.**
- Firefox AMO and Microsoft Edge Add-ons are outside this criterion and were not searched. They are
  the obvious follow-up and `fregante/Awesome-WebExtensions` is the free map.

## Net-new facts worth the colony's time

1. MV3 does **not** block server-side licensing — Google's own migration doc names "calls a remote
   web service" as a sanctioned pattern. Any future extension work does not need ExtensionPay and
   therefore does not need Stripe.
2. **ExtensionPay is Stripe-only**, so it inherits Stripe's country list wholesale. If Stripe/Israel
   is a NO, the default monetization rail of this entire ecosystem is closed to this owner, and that
   fact is worth resolving once because it also gates several other criteria.
3. 90.11% of 251,488 extensions have under 1,000 users (May 2026, DebugBear). Pair that with the
   dev.to datapoint of $31/month across 38 extensions and the realistic ceiling for a no-brand new
   entrant is in the low hundreds of shekels, not thousands.

## Every URL used

Rendered:
- https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/cws-payments-deprecation/index.md
- https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/extensions/migrating/improve-security/index.md
- https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/review-process/index.md
- https://raw.githubusercontent.com/Glench/ExtPay/master/README.md
- https://github.com/Glench/ExtPay/issues/11
- https://github.com/Glench/ExtPay/issues/338
- https://github.com/Glench/ExtPay/issues/317

404 at that path: site/en/docs/webstore/program-policies/index.md

Blocked (named for a human): https://developer.chrome.com/docs/webstore/register ·
https://extensionpay.com/ · https://extensionpay.com/articles/browser-extensions-make-money ·
https://stripe.com/global · https://support.stripe.com/questions/stripe-feature-availability-by-country ·
https://docs.stripe.com/connect/cross-border-payouts

Snippet-only: https://www.debugbear.com/blog/counting-chrome-extensions ·
https://addonews.com/extensionpay-review-scale/ · https://exitbid.io/blog/sell-chrome-extension ·
https://extensionbill.com/blog/merchant-of-record-vs-stripe-extension-payments/ ·
https://chromegoldmine.com/blog/chrome-extension-monetization/chrome-extension-revenue-benchmarks/ ·
https://dev.to/ktg0215/real-numbers-freemium-chrome-extension-monetization-after-6-months-5hga ·
https://chromewebstore.google.com/top-charts/popular
