# Scout notes — group: store-promotion / criterion: marketplace-ranking

Date of research: 2026-09-03. Scout: WORKER-SCOUT "marketplace-ranking".

Criterion: the ranking algorithms INSIDE marketplaces (not Google SEO) — Etsy search,
Apify Store, Chrome Web Store, RapidAPI Hub, npm, Notion Marketplace, Figma Community.
For each: what ranks a listing with zero sales / zero reviews / no history, how long the
cold start lasts, whether ranking is structurally usage-driven, and which levers a
publisher genuinely controls.

## Evidence rules applied
- STRONG = page actually rendered by WebFetch (raw.githubusercontent.com only, in practice).
- WEAK = WebSearch snippet quoting a page I could not render.
- Memory = not evidence; not used.
- Egress proxy blocked: developer.chrome.com, docs.rapidapi.com, help.etsy.com (all
  confirmed EGRESS_BLOCKED this session). help.figma.com, notion.com, help.apify.com,
  groups.google.com were not attempted after three consecutive blocks — assume blocked.
- Web-search budget used: 12 calls.

## 1. Apify Store — STRONG evidence (only platform where I rendered a primary source)

Rendered: https://raw.githubusercontent.com/apify/apify-docs/master/apify-api/openapi/paths/store/store.yaml
(Apify's own OpenAPI spec for GET /v2/store, in apify/apify-docs, fetched 2026-09-03)

Verbatim facts from that spec:
- `search`: "String to search by. The search runs on the following fields: `title`,
  `name`, `description`, `username`, `readme`."
- `sortBy`: "The supported values are `relevance` (default), `popularity`, `newest` and
  `lastUpdate`."
- Filters: `category`, `username`, `pricingModel` (FREE, FLAT_PRICE_PER_MONTH,
  PRICE_PER_DATASET_ITEM, PAY_PER_EVENT), `allowsAgenticUsers`, `responseFormat`
  (full | agent-optimized), `includeUnrunnableActors`. Max 1,000 records returned.

Reading: the DEFAULT ordering is `relevance`, computed over publisher-written text
(title, name, description, username, README). Usage (`popularity`) is a SEPARATE,
user-chosen sort, not the default. `newest` and `lastUpdate` are also user-choosable —
i.e. two of four sort modes actively favour a brand-new or freshly-updated listing.
This is the friendliest cold start of the whole set: a zero-run Actor is not
structurally invisible in the default view.

Levers a publisher genuinely controls on Apify: the exact text of title / SEO name /
description / README (README is indexed by store search — this is the big one and is
under-exploited), category choice, pricingModel (buyers filter by it),
`allowsAgenticUsers`, and update recency (feeds `lastUpdate` sort).

Also rendered (weaker, advice not algorithm):
- https://raw.githubusercontent.com/apify/apify-docs/master/sources/academy/build-and-publish/apify-store-basics/name_your_actor.md
  — "The Actor SEO name: this is the name that appears in search engine results."
  Explicitly about Google, NOT about store-internal ranking. Says you can change the SEO
  name to A/B test rankings.
- https://raw.githubusercontent.com/apify/apify-docs/master/sources/academy/build-and-publish/apify-store-basics/how_actor_monetization_works.md
  — "You earn 80% of the revenue minus platform usage costs." / "You earn 80% of the
  monthly rental fees." / "most prices on Apify Store range between $1-10 per 1,000 results."
- Apify docs contain a page literally called `parasite_seo.md`
  (sources/academy/build-and-publish/promoting-your-actor/parasite_seo.md) telling
  publishers to write articles on third-party sites linking back. That is off-store SEO
  and outside this criterion; it is also the kind of thing that becomes spam at scale —
  flag AMBER if anyone in the colony proposes automating it.

Payouts (WEAK, search snippet of help.apify.com / docs.apify.com legal terms,
2026-09-03): "The minimum amount payable is USD 20 for PayPal and USD 100 for any other
payout option"; "paid in US dollars and exclusively via wire transfer or a PayPal
account." No country exclusion list found. Israel: treat as YES (PayPal + wire both
reach Israel; the colony already ships products/apify-il-open-data), confidence medium.
URL for a human to close: https://docs.apify.com/legal/store-publishing-terms-and-conditions
and https://help.apify.com/en/articles/10057167-how-developer-payouts-work

## 2. npm — STRONG-ish evidence

Rendered: https://raw.githubusercontent.com/npm/registry/main/docs/REGISTRY-API.md
The public search endpoint takes `quality`, `popularity`, `maintenance` weights
("normalized into a unit-vector", values 0–1; "to return results based solely on quality,
set quality=1.0, maintenance=0.0, popularity=0.0") and returns a score object with
`final`, `detail.{quality,popularity,maintenance}` and `searchScore`.

So npm ranking = weighted blend where only ONE of three components is usage. The other
two are pure publisher hygiene. WEAK (search snippet, npms-analyzer scoring writeups,
2026-09-03): default weights around quality 0.3 / maintenance 0.35 / popularity 0.35,
and a "finished project" rule giving each sub-score a floor of 0.9 when the package has
version >= 1.0.0, is not deprecated, has fewer than 15 open issues, has a README and has
tests. If that rule still holds, a brand-new package can score near the top on 2 of 3
axes on day one. URL a human must open to close it:
https://www.npmjs.com/search API docs + https://github.com/npms-io/npms-analyzer
(the analyzer repo is the canonical description of quality/maintenance/popularity).

npm pays nothing. It is a distribution funnel, not a revenue line.

## 3. Chrome Web Store — WEAK evidence only (Google's docs are egress-blocked)

developer.chrome.com/docs/webstore/discovery returned EGRESS_BLOCKED. Everything below
is search snippets (2026-09-03) from third-party extension-SEO vendors plus the
chromium-extensions Google Group; Google publishes no official ranking documentation.
- Heuristic ranking over user ratings and usage statistics (installs vs uninstalls over
  time), extension quality/editorial value, and relevance of name and description.
- Title carries the most weight for keyword relevance; short description and full
  description also count.
- A zero-install, zero-rating extension is "buried"; visibility is limited until real
  usage signals exist. No published cold-start duration.
- Badges (WEAK, from 9to5google/ghacks/blog.google coverage of the April 2022 launch):
  * "Featured" badge — Chrome staff MANUALLY evaluate; awarded for best practices,
    clear listing page, quality images, detailed description, privacy respect. Since
    2022-04-20 developers can NOMINATE their own extension via the One Stop Support page.
    This is the one genuine cold-start lever on CWS that does not require usage.
  * "Established Publisher" badge — automatic, requires verified publisher identity AND
    "a consistent positive track record"; for a new developer, "at least a few months".
  * Neither badge can be bought.
- Monetization: Chrome Web Store Payments was deprecated 2020-09-21 and shut down; in
  2026 a paid extension must use a third-party processor (Stripe / Paddle / ExtensionPay).
  The colony already runs Paddle, so Israel payability is YES via the existing rails.
URLs a human must open: https://developer.chrome.com/docs/webstore/discovery ,
https://blog.google/products-and-platforms/products/chrome/find-great-extensions-new-chrome-web-store-badges/ ,
https://groups.google.com/a/chromium.org/g/chromium-extensions/c/2_futjKuTCY

Owner blockers: one-time $5 Chrome developer registration fee (payment by the human) and
publisher identity verification (KYC) for the Established Publisher badge.

## 4. Etsy — WEAK evidence, and the worst cold start

All sources are SEO-vendor blogs (voolist, sellertoolshq, insightagent, listybox,
dodgeprint), 2026-09-03; help.etsy.com is egress-blocked. Consensus of those blogs:
- Two-stage: query matching, then ranking by predicted conversion, using Listing Quality
  Score (built from clicks, favourites and purchases FROM SEARCH) and Shop Quality Score
  (shop performance and reviews), with Star Seller weighted as a trust signal.
- "For a brand new shop with no sales, expect 60 to 90 days in a de facto sandbox."
  (blog claim, NOT Etsy's own words — do not treat as fact.)
Structurally usage-driven: yes, more than any other platform here. Nothing a publisher
controls except tags/title/attributes/photos, which only get you into the candidate set.

Payability (WEAK): a search snippet asserts Israel IS eligible for Etsy Payments with
ILS payouts to a domestic bank account, and that PayPal is removed for Israeli sellers
enrolled in Etsy Payments. I could not render the page. URL a human must open:
https://help.etsy.com/hc/en-us/articles/115015710408-Countries-Eligible-for-Etsy-Payments
Until that is rendered, Etsy payability is UNKNOWN.

## 5. RapidAPI Hub — WEAK evidence (docs.rapidapi.com egress-blocked)

Search snippets of docs.rapidapi.com/docs/faqs and rapidapi.zendesk.com (2026-09-03):
- "Popularity is a number between 1 and 10 ... based on a formula that considers the
  number of requests and the number of users of the API."
- Three metrics shown on every listing: Popularity, Average Latency (last 30 days),
  Service Level (last 30 days).
- Search is refined by categories, collections and tags.
- Payouts: PayPal only ("cannot accommodate other payout methods"); flat 25% marketplace
  fee; PayPal payout processing fee ~2% capped at $20 depending on country.
Structurally usage-driven for Popularity — but Latency and Service Level are performance
metrics the publisher fully controls and buyers filter/compare on, which is a real
cold-start lever: a new API with 99.9% service level and low latency looks better on
those two of three displayed metrics than a popular but flaky incumbent.
Israel: PayPal operates in Israel, so YES, confidence medium. URLs to close:
https://docs.rapidapi.com/docs/faqs ,
https://rapidapi.zendesk.com/hc/en-us/articles/11432098898580-What-payment-methods-are-available-for-payouts

## 6. Notion Marketplace — WEAK evidence, but the best documented cold-start opening

Search snippets of notion.com/help pages (2026-09-03):
- Featured templates and creators are "refreshed for every language at varying timeframes
  from weekly to monthly, and ONLY NEW SUBMISSIONS are taken into account for each
  refresh." If accurate, featured placement is a race among new listings, not against
  incumbents — the single clearest structural opening found in this whole criterion.
- Featured selection criteria: timing/trend fit, design quality, specific use case,
  popularity, audience fit.
- Localization: "Native language templates receive priority ranking; for example, French
  templates rank higher than English ones in the French Marketplace." Notion ships AI
  localization; localized versions share the same slug and are served by user language.
- Selling requires: waitlist, approval by the Notion team ("may take a few months"),
  and Stripe onboarding.
Payability: Stripe, and Stripe supports Israel → YES, confidence medium.
Owner blockers: Stripe KYC (identity + bank), and the creator-approval waitlist.
URLs to close: https://www.notion.com/help/getting-featured-in-the-template-gallery ,
https://www.notion.com/help/selling-on-marketplace ,
https://www.notion.com/help/template-localization-on-marketplace

## 7. Figma Community — WEAK evidence

Search snippets (2026-09-03): Community ranking data is "views, users, saves, likes and
comments" — entirely usage-driven; Community behaves like an app store with install
counts and reviews visible. Selling requires being an approved seller and activating
Stripe; minimum price $2.00 USD, whole numbers, one-time or subscription.
Creator payouts country list quoted in a snippet of
https://help.figma.com/hc/en-us/articles/12067637274519-About-selling-Community-resources
explicitly INCLUDES Israel. Confidence medium (snippet, page not rendered).

## Cross-cutting conclusion

Rank the seven by how survivable the cold start is for a listing with zero history:
1. Apify Store — default sort is relevance over publisher text; `newest`/`lastUpdate`
   sorts actively favour new listings. Text is the whole game. BEST.
2. Notion Marketplace — featured refresh considers only new submissions; localization
   gives an uncontested language lane. Gated by approval + Stripe KYC.
3. npm — 2 of 3 score components are hygiene, not downloads; "finished project" floor.
   No money, funnel only.
4. RapidAPI — popularity is usage, but latency/service-level are shown and controllable.
5. Chrome Web Store — usage-driven and opaque; the self-nominated Featured badge is the
   only non-usage lever.
6. Figma Community — pure usage metrics; no documented new-listing lane.
7. Etsy — conversion-prediction ranking on click/favourite/purchase signals; worst.

The honest general finding: on five of seven platforms ranking is a function of existing
usage, so a new listing IS structurally near-invisible, and the only legitimate levers
are (a) text that matches the query, (b) the platform's own new/recent sort modes, (c)
manual/editorial nomination paths, and (d) quality metrics displayed next to popularity.
Everything else that "works" — install farming, review trading, mass listing spam — is
RED under the constitution and is not reported here as an option.
