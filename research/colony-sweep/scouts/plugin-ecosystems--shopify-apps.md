# Scout notes — plugin-ecosystems / shopify-apps

Scout: WORKER-SCOUT "shopify-apps", group `plugin-ecosystems`.
Date of research: 2026-09-04. Search budget spent: **8 / 8** (the cap). WebFetch attempts: 8 (6 blocked).

## Criterion
Shopify App Store: developer requirements, revenue share, review bar, app categories with
demand and weak incumbents, and payouts to Israel.

## Evidence-quality warning — read before using anything below

**Every Shopify-owned domain is blocked by this container's egress proxy.** Confirmed blocked, by
actual WebFetch attempts on 2026-09-04:

- `shopify.dev` — EGRESS_BLOCKED
- `apps.shopify.com` — EGRESS_BLOCKED
- `help.shopify.com` — EGRESS_BLOCKED
- `www.shopify.com` — EGRESS_BLOCKED
- `community.shopify.dev` — EGRESS_BLOCKED
- `docs.hyperwallet.com` — EGRESS_BLOCKED
- `supportedcountries.com` — EGRESS_BLOCKED
- `www.gapquery.com` — EGRESS_BLOCKED

So **not one primary Shopify page was rendered in this sweep.** Everything here rests on either
(a) a third-party GitHub research file that itself cites shopify.dev, or (b) WebSearch snippets.
Both are weaker than a rendered page and are marked as such per claim. Nothing below is from memory.

## Sources actually obtained

### S1 — rendered page (strongest thing I have, but third-party)
`https://raw.githubusercontent.com/GodMode-Team/godmode/main/research/plugin-marketplace-research.md`
Fetched 2026-09-04, rendered in full. A third party's research note on plugin marketplaces. It is
**not** a Shopify source; it is a summary that cites shopify.dev pages I cannot open. Treat its
numbers as second-hand. Found via `mcp__github__search_code` (zero search budget).

Verbatim content relevant to us:
- Revenue share: "0% on first $1M USD lifetime revenue (changed in 2025; previously reset annually)";
  "15% on revenue above $1M"; "2.9% processing fee on all billing, plus applicable sales tax";
  "Developers earning $20M+/year or with $100M+ company revenue pay 15% on ALL revenue";
  "$19 one-time registration fee".
- Scale: "Developers have collectively earned $1.5B+ since inception. The top 25% earn approximately
  $167K/year, with an average of $93K across the developer base." (Unverifiable here; the "average"
  is almost certainly an average over *earning* developers, not over all partners — do not use it.)
- Requirements (stated as of April 2025): GraphQL Admin API; "Lighthouse performance scores within
  10% of baseline"; Polaris design system.
- Review: "100-checkpoint review for every new app submission"; ongoing App Excellence Team checks.
- Built for Shopify badge: "Only ~676 apps (1 in 20) qualify"; "49% boost in new installs within
  14 days"; reviewed annually.
- Review integrity: "Pressuring merchants for positive reviews or offering incentives is explicitly
  forbidden."
- Its cited sources (all blocked for me, all must be opened by a human/unblocked agent to confirm):
  - https://shopify.dev/docs/apps/launch/distribution/revenue-share
  - https://shopify.dev/changelog/update-to-shopifys-app-developer-revenue-share
  - https://betakit.com/shopify-app-developers-will-no-longer-be-exempt-from-sharing-their-first-1-million-usd-in-revenue-every-year/
  - https://shopify.dev/docs/apps/launch/app-store-review/review-process
  - https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements
  - https://www.shopify.com/partners/blog/built-for-shopify-updates
  - https://appnavigator.io/statistics/

### S2 — search snippets, payouts (2 searches)
Queries: "Shopify Partners payouts Israel PayPal bank direct deposit supported countries partner
dashboard"; ""Shopify Partner Program" payout methods PayPal "direct deposit" countries eligible 2026".
Snippet claims:
- Partner payouts run through **Hyperwallet** (a PayPal company); "you need to create a Hyperwallet
  account in the Partner Dashboard" before adding a payout method. Methods: PayPal, bank account,
  wire transfer. Availability depends on country/region and currency.
  URL to open: https://help.shopify.com/en/partners/manage-account/manage-payouts-invoices/payout-method
- Non-USD payouts are converted by Hyperwallet at base rate + **0.50% conversion fee**.
- New payout regions named in Shopify's own partner blog snippet: Ukraine, Turkey, Bangladesh,
  Nigeria, Pakistan. **Israel is not named either way.**
  URL to open: https://www.shopify.com/partners/blog/payout-methods
- Separately: **Shopify Payments does not operate in Israel** — this is the *merchant* acquiring
  product, a different thing from partner payouts. Do not confuse the two.
  URL: https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries

### S3 — search snippets, Hyperwallet country coverage (2 searches)
- One aggregator snippet lists Israel among Hyperwallet-supported countries ("Israel is included in
  Hyperwallet's supported countries in Asia"). Aggregator, not Hyperwallet — weak.
  URLs to open: https://supportedcountries.com/hyperwallet/ ,
  https://docs.hyperwallet.com/content/transfer-methods/v1/payout-networks/transfer-method-payee-country-availability
- Hyperwallet's own marketing (via snippet): bank-account transfer "available in 90 countries";
  "200+ markets and 50+ send currencies". Whether IL/ILS is inside the 90 is **unconfirmed**.
- **Load-bearing constraint found in a snippet of the Shopify developer forum:** "virtual bank
  accounts like Payoneer aren't supported for Partner payouts". If true this removes the route most
  Israeli solo developers use, and forces a real Israeli bank account or a PayPal wallet.
  URL to open: https://community.shopify.dev/t/payouts-via-hyper-wallet/29142
- Same forum threads show partners hitting Hyperwallet activation failures ("financial accounts
  could not receive payouts"), i.e. the rail is a real operational risk, not a formality.
  URL: https://community.shopify.dev/t/hyperwallet-activation-not-received-cannot-complete-payout-setup-partner-id-3230237/23165

### S4 — search snippets, market shape (2 searches)
- Store counts (conflicting, all third-party): "21,509 live public apps" (AppstorePulse, May 2026)
  vs "17,891 apps from 11,352 partners" (another aggregator). Average rating ~4.65–4.70.
  URLs: https://www.appstorepulse.com/reports/state-of-shopify-app-store-may-2026 ,
  https://www.appjubilee.io/shopify-app-store-report-2026 , https://meetanshi.com/blog/shopify-app-store-statistics/
- Distribution mechanic that decides everything for a new entrant: "new apps need 10+ reviews in
  their first 30 days to gain traction, and without reviews, they're invisible." Snippet only.
- Gap claims (GapQuery, snippet only, page blocked): "19,528 of 21,095 Shopify app tags have 5 or
  fewer apps, though most are dead"; "Voice commerce has 4 apps with 4 total reviews, while AI
  recommendation has 3 apps with 4,134 reviews — same tiny supply, opposite signal";
  "76.6% of live Shopify apps ship in English only".
  URL to open: https://www.gapquery.com/guides/shopify-app-ideas
- Category saturation claims: install-side gaps ("98.5% of stores lack support, 98.3% subscriptions,
  98.2% analytics, 95.3% reviews, 70.7% email") — these are *merchant adoption* gaps, NOT app-supply
  gaps, and the same categories are among the most crowded. Anyone reading them as "weak incumbents"
  is misreading them.

### S5 — search snippets, Israel-specific (1 search)
- A live Shopify app **"morning ‑ Green Invoice Israel"** exists: https://apps.shopify.com/green-invoice
  (blocked for me; existence and listing text confirmed via snippet plus third-party listing mirrors
  https://www.appstoreanalytics.io/shopify-app-store-listings/green-invoice and
  https://shopify-spy.com/apps/green-invoice/). Snippet says pricing "from $396/year", Hebrew only,
  "available for Israeli businesses only".
- Shopify runs a localized Israeli site (https://www.shopify.com/il/blog/best-invoice-app).
- Together this is the strongest available *circumstantial* evidence that an Israeli company can
  publish and be paid on the Shopify App Store. It is not proof that *our* payout rail works.

## Judgement

**Payability to Israel: UNKNOWN, leaning YES.** No Shopify or Hyperwallet page naming Israel was
rendered. The Israeli-built paid app on the store is circumstantial. The Payoneer exclusion is the
specific thing that could bite. One human/unblocked check closes this: open the Partner payout-method
page and, in the Partner Dashboard, select Country = Israel and see which transfer methods appear.

**ToS: GREEN to build an honest app.** RED only for the review-gaming path (incentivised or
pressured reviews), which the constitution forbids anyway and which Shopify explicitly forbids.

**The real blocker is not the store, it is the mission's "owner does nothing" rule.** The store's
own distribution mechanic requires early reviews from merchants, and reviews may not be bought or
pressured. That leaves organic install→satisfy→review, which needs a product good enough that
merchants review it unprompted, plus responsive support. Agents can do support; agents cannot
manufacture the first ten reviews honestly. Any Shopify plan that quietly assumes the reviews appear
is a plan with a hole in it.

## Dead ends
- Every Shopify-owned domain and Hyperwallet's docs are proxy-blocked; no primary source is
  obtainable from this container. This criterion cannot be closed from here.
- `sindresorhus/awesome` has no plugin-marketplace or Shopify-ecosystem list (only Hydrogen, a
  storefront framework). The awesome route is empty for this criterion.
- GitHub code search for Shopify store terms mostly returns noise (translation .po files); exactly
  one usable file (S1) in 153 hits.
- "Categories with weak incumbents" could not be answered with real data: the only category-level
  numbers available are third-party snippets, and the most quoted ones (98.5% lack support, etc.)
  measure merchant adoption, not competitive weakness.
