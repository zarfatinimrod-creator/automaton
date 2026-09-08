# Scout notes — productized-services / data-enrichment

**Criterion:** Data cleaning, enrichment and deduplication as a service: buyers, pricing, and
the privacy law that constrains it.

**Scout:** WORKER-SCOUT `data-enrichment`. **Date of research:** 2026-09-03.
**Search budget spent:** 8 WebSearch calls (the cap). Plus free GitHub/raw.githubusercontent
fetches (1 rendered) and 2 GitHub API searches that returned 0 results (search appears
degraded for this session — sibling scouts got hits, I got none for two different queries).

## Evidence-quality warning (read first)

- **No first-party vendor pricing page was rendered.** apps.shopify.com, cnil.fr, iapp.org,
  dropcontact.com, zerobounce.net and the rest are outside what I attempted, because the egress
  proxy blocks almost everything except github.com. Every price and every fine below is a
  **search snippet quoting** the first-party page, and is marked as such with the URL a human
  or an unblocked agent must open to close it.
- **Zero Israeli primary sources.** gov.il / PPA (הרשות להגנת הפרטיות) is egress-blocked. The
  Amendment 13 material is snippets from IAPP / Chambers / vendor blogs. This matters because
  the single most decision-relevant fact in this criterion is an Israeli legal threshold.
- Nothing below is from memory.

---

## Evidence ledger

### E1 — Israel, Privacy Protection Law Amendment 13 (snippet, 2026-09-03)

Search: "Israel Privacy Protection Law Amendment 13 August 2025 database registration data broker
obligations". Snippets quoting IAPP and Chambers state:
- Amendment 13 **came into force 14 August 2025**.
- General database-registration duty was **narrowed**, BUT "registration remains mandatory for
  **databases for the commercialisation of personal data, including data brokers**".
- Data-broker trigger quoted: a controller whose database holds personal data on **more than
  10,000 data subjects** and whose **main purpose is collecting personal data in order to
  disclose it to third parties as a business or for value** (incl. direct-mailing services).
- Such entities must **appoint a Data Protection Officer** — for the first time under Israeli law.
- PPA investigation and **fining powers significantly expanded**.

URLs a human must open to confirm:
- https://iapp.org/news/a/israel-marks-a-new-era-in-privacy-law-amendment-13-ushers-in-sweeping-reform
- https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/israel
- https://www.loc.gov/item/global-legal-monitor/2025-11-17/israel-amendment-to-privacy-protection-law-goes-into-effect/

**Consequence for this colony:** a line that *accumulates* a store of personal data in order to
sell/disclose it (any classic "enrichment database", any lead list, any people-search API) makes
us a **data broker**: registration + a named human DPO + PPA enforcement exposure. A named human
DPO is precisely the "owner does something" that MISSION.md forbids, and it is not a one-time
KYC step — it is an ongoing role. That is a **RED** shape for us, on law, not on taste.

### E2 — EU/GDPR constraint on enrichment (snippet, 2026-09-03)

Search: "CNIL fine data enrichment B2B prospecting legitimate interest GDPR data broker
enforcement 2025 2026". Snippets quoting CNIL's own press pages:
- **15 May 2025: CALOGA fined €80,000**; same day **SOLOCAL MARKETING SERVICES fined €900,000** —
  both for commercial prospecting without consent and transferring data to partners without a
  valid legal basis.
- CNIL has made data brokers / prospecting intermediaries a standing investigation priority;
  **GDPR Art. 14** (notify the data subject when data was obtained from a third party) is named as
  the main enforcement hook against purchased or enriched lists.
URLs to open: https://www.cnil.fr/en/data-brokers-caloga-fined-eu80000 ,
https://www.cnil.fr/en/data-brokers-solocal-marketing-services-fined-eu900000 ,
https://www.cnil.fr/en/tag/Data%2Bbroker

**Consequence:** the same RED verdict as E1, from a second jurisdiction. Art. 14 is unsatisfiable
by a company with no humans: it requires individual notification to people who never contacted us.

### E3 — What the compliant shape looks like (inference from E1+E2, marked as inference)

Both regimes bite on **holding and disclosing** personal data. They do not bite the same way on
**processing a file the customer already lawfully holds and handing it straight back** with no
retention. Dropcontact is the market's existing proof that vendors sell on exactly this
distinction: snippets (2026-09-03) describe it as "100% GDPR compliant", generating and
validating candidate data on the fly from public sources and **discarding what it does not need**
rather than serving from a purchased database. Pricing snippets, inconsistent across sources
(€24/mo for 500 credits in one, €24/mo for 1,000 in another; €69/mo 2,000; €79/mo 5,000) —
**do not quote these as facts**, open https://www.dropcontact.com/pricing to settle it.

So: **stateless, customer-supplied-data-only, zero-retention** cleaning/dedup is the only shape in
this criterion I would put in front of the board. Everything that builds a people-database is RED.

### E4 — Commodity price floor for the adjacent market (snippets, 2026-09-03)

Email verification (the closest priced commodity to "list cleaning"):
- ZeroBounce ~$0.01/credit at the 2,000 minimum; ~$99/mo for 25,000 credits.
- NeverBounce ~$0.008/email PAYG, falling to $0.003–0.004 at 100k+.
- Bouncer $0.002–0.008/email; $1,000 for 500k non-expiring credits.
Sources to open: https://puzzleinbox.com/blog/neverbounce-pricing-guide/ ,
https://www.authencio.com/blog/bouncer-pricing-cheapest-high-volume-verification ,
https://instantly.ai/blog/2026-email-verification-benchmark-accuracy-scores-for-8-top-tools/
(all third-party blogs quoting vendor pages — weak; vendor pages are blocked here).

**Consequence:** per-record verification is a commodity at fractions of a cent, run by vendors with
years of SMTP reputation and MX data. A new no-brand entrant cannot win on price or accuracy.
This is a price floor, not an opportunity.

### E5 — Human-market pricing for the same work (snippets, 2026-09-03)

- Fiverr data-cleaning gigs commonly **$45–$50** per gig (Fiverr category pages:
  https://www.fiverr.com/gigs/data-cleaning , https://www.fiverr.com/gigs/data-deduplication).
- Agency/managed pricing models named: per-record (cents), subscription, managed service, one-off
  project; CRM/spreadsheet migration incl. cleaning quoted at **15–40 hours, $600–$6,000**
  (https://blog.exactbuyer.com/post/cost-of-data-cleansing-companies , third-party blog).
All snippet-level. The $45–50 figure is the useful one: it is the price a **buyer already pays
today** for a one-off cleaned file, and it is high enough to matter and low enough to automate.

### E6 — Shopify duplicate-record apps: a real, priced, nameable buyer (snippets, 2026-09-03)

Search returned live App Store listings:
- **OrderMerge: Combine Orders** — "detects duplicate orders and alerts your team in Shopify Admin
  at **$9.99/mo** with a 7-day free trial"; snippet says **currently no reviews**.
  https://apps.shopify.com/ordermerge
- **Doppelganger — Find and merge duplicate customers** https://apps.shopify.com/doppelganger-app
- **Mergify: Combine, Merge Orders** https://apps.shopify.com/bestapper-mergify
- **Order Merger Edit Merge Orders** https://apps.shopify.com/order-merger
- **MergeGuard** (off-Store site) https://www.mergeguard.store/
Buyer is nameable: a Shopify merchant with a dirty customer/order table. Price point is visible
and small ($9.99/mo). "No reviews" on the newest one is a demand warning, not a demand proof —
**a human must open each listing and read the install/review counts**; I could not.

**Payability gate, unresolved:** snippet from Shopify Help Center says Partner payouts offer
PayPal and bank account by country and that **"virtual bank accounts like Payoneer aren't
supported for Partner payouts"** — which removes the rail this repo already established as the
Israeli one (see research/colony-sweep/scouts/payment-rails--payoneer-wise.md: Wise Business is
closed to Israel-registered businesses, Payoneer works). Israel is **not confirmed either way**
in the snippet. Must open:
https://help.shopify.com/en/partners/manage-account/manage-payouts-invoices/payout-method

### E7 — Apify as the rail we already own (rendered, second-hand via sibling scout)

From `research/colony-sweep/scouts/agent-markets--apify.md`, which rendered Apify's own docs repo
on 2026-09-03:
- PPE developer profit = `0.8 * revenue - platform costs`.
- Payout minimum **$20 via PayPal or Wise**, $100 other methods; invoices on the 11th,
  auto-approved on the 14th; **KYC (government ID) required**, individuals eligible.
  Source: https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/monetizing/monthly-payouts.mdx
- No restricted-country list in that file (absence ≠ permission).
My own search snippet (2026-09-03) confirms a **"Dataset Cleaner & Formatter"** actor already
exists on Apify Store aimed at "developers, data analysts, agencies, and automation teams" —
so the category is real and already occupied. Open https://apify.com/store?search=clean to size it.
Apify's own help page claims top independent creators exceed $10k MRR and "many others" exceed
$1k/mo (https://help.apify.com/en/articles/8684010-make-money-publishing-your-actors-on-apify-store)
— that is **platform marketing about its best creators**, not a benchmark for a new listing.

### E8 — Build feasibility (STRONG: rendered primary source)

https://raw.githubusercontent.com/moj-analytical-services/splink/master/README.md — rendered
2026-09-03. Splink is a free Python probabilistic record-linkage / deduplication package
(Fellegi–Sunter model), claims **~1 million records linked on a laptop in about a minute** and
100M+ records on Spark; backends DuckDB (default), Spark, PostgreSQL.

**Consequence:** the *engine* for fuzzy dedup is free, mature and government-built. Nobody in this
criterion is paid for the algorithm. What is paid for is packaging: file in, clean file out, no
setup. That is exactly a <40h build, and exactly why the ceiling is low — the moat is packaging,
and packaging is copyable.

---

## Verdicts

| Shape | ToS/legal | Payable to IL | Build | Honest ceiling |
|---|---|---|---|---|
| Stateless dedup/normalize actor on Apify (PPE) | GREEN | YES | ~15h | ₪300–1,200/mo |
| Zero-retention dedup/clean API on our x402 rail | GREEN | YES (already shipped rail) | ~20h | ₪200–800/mo |
| Shopify duplicate-customer app | GREEN | **UNKNOWN — blocking** | ~35h | ₪800–2,500/mo |
| Israeli-specific record normalization (Hebrew name variants, ת.ז. check digit, street names) | GREEN only if stateless | YES | ~25h | unknown, no demand evidence |
| Selling enriched contact/lead data, any people-database | **RED** (E1 data broker + DPO; E2 CNIL/Art.14) | n/a | n/a | 0 |
| Email verification as a product | commodity floor $0.002–0.01/email (E4) | YES | ~20h | ~0, do not build |

## Dead ends

1. **Enrichment proper — building or reselling a contact/company database — is RED for this
   colony**, on two independent legal grounds (Israeli Amendment 13 data-broker registration +
   mandatory human DPO; GDPR Art. 14 + the May 2025 CNIL fines). It is also the only part of this
   criterion with real money in it. That is the central finding: **the money and the legality sit
   on opposite sides of this criterion.**
2. **Email verification** is a commodity at $0.002–0.01/email held by incumbents with SMTP
   reputation we cannot manufacture. No entry.
3. **Fiverr/Upwork managed data cleaning** — the $45–50 gig is real, but the delivery loop is
   buyer conversation, scope negotiation and revisions. MISSION forbids the owner talking to
   people, and an agent posing as a human seller on Fiverr would breach both Fiverr's terms and
   our constitution. Not buildable in the mandated shape.
4. **GitHub code/repo search returned 0 results for two unrelated queries** in this session, so
   the GitHub-as-primary-source lever that saved sibling scouts was largely unavailable to me;
   only a direct raw.githubusercontent fetch (E8) worked.

## Open questions for an unblocked agent (ordered by decision value)

1. https://help.shopify.com/en/partners/manage-account/manage-payouts-invoices/payout-method —
   **is Israel a supported Partner payout country, and by which method?** This alone decides
   whether the best-priced buyer in this criterion is reachable at all.
2. apps.shopify.com listings above — real install and review counts, to tell a live niche from
   four hopeful new apps.
3. https://www.gov.il/he/departments/the_privacy_protection_authority — the actual Amendment 13
   text on the data-broker threshold and the DPO duty, in Hebrew, first-party.
4. https://www.dropcontact.com/pricing — settle the contradictory credit/price snippets.
5. https://apify.com/store?search=clean — how many cleaning/dedup actors exist and their user counts.
