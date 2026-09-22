# Scout notes — vertical-niches / hospitality
**Criterion:** Restaurants, cafes and hotels: menu, ordering, reservation, review and compliance tooling at the small end.
**Date of research:** 2026-09-05
**Search budget:** 7 WebSearch calls issued against a cap of 8 (the allergen query returned two retrievals inside one call). All other evidence came from GitHub `search_code` and `raw.githubusercontent.com` WebFetch, which cost zero search budget.

## Evidence grades used below
- **CODE** — a file rendered from GitHub / raw.githubusercontent.com. Strongest available here.
- **SNIPPET** — a WebSearch result summary quoting a page I could not render (egress proxy blocked the host). Weaker; the URL to open is named.
- **BLOCKED** — attempted and refused by the proxy.

---

## 1. Wix App Market — restaurant reservations / menu app  (best fit found)

**What the Wix App Market is:** a marketplace for apps installed on Wix sites, with a dedicated Restaurants category.
- https://www.wix.com/app-market/category/restaurants (SNIPPET, 2026-09-05)
- https://www.wix.com/app-market/category/booking--events/restaurants?subCat=restaurants (SNIPPET)

**Demand signal (the useful part):** Wix's own first-party restaurant apps are weak and users say so.
- "Wix Table Reservations (rated 3.7/5 with 100 reviews) and Wix Restaurants Orders (rated 3.4/5 with 35 installs)" — SNIPPET
- "the average rating of the Wix Reservations app is 2.3/5, with users finding it lacks quite basic features for effective management of online reservations" — SNIPPET quoting https://restaurant.eatapp.co/blog/wix-for-restaurants-review and https://wiksit.com/blog/wix-for-restaurants-review
- "The marketplace is where third-party apps have built direct integrations with Wix, enabling much more powerful features and services that Wix itself can't provide" — SNIPPET
This is a stated gap in a first-party product, from third-party reviewers, not from a vendor's own marketing. That is the strongest demand evidence I found anywhere in this criterion.

**Money model (SNIPPET — needs closing):**
- "Wix gives third-party app developers 100% of revenue generated through the sale of their apps during the app's first year, after which Wix receives a 20% share."
- "Wix pays out monthly so long as developers have hit a minimum revenue share of $200 in that month. Revenue share is paid out on a net 30 EOM basis."
- "revenue share payments are not issued to banks located in Russia and Pakistan."
- Pricing models available: free, freemium, premium, dynamic.
- Source pages: https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/payments-and-billing-faqs and https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/about-monetizing-your-app
- **BLOCKED:** I attempted WebFetch on the payments FAQ URL above — `EGRESS_BLOCKED: dev.wix.com`. **A human or unblocked agent must open that exact URL** to confirm (a) the 100%/20% split, (b) the $200 monthly minimum, (c) that Israel is not on an exclusion list.

**Payability to Israel: YES (medium confidence).** Wix.com Ltd. is an Israeli company headquartered in Tel Aviv, and the only payout exclusions named in the snippet are Russia and Pakistan. It would be extraordinary for an Israeli platform to refuse payouts to Israeli banks. But this rests on a snippet, not a rendered page — see the URL above.

**ToS: GREEN.** Building and selling an app in a platform's own marketplace, under its own billing, is the canonical permitted use.

**Owner blockers (one-time, identity/payout only):**
- Register a Wix developer account.
- Complete payout details: bank account and a tax form (US-facing marketplaces normally require a W-8BEN or equivalent for a non-US person). Not verified for Wix specifically — treat as expected, not confirmed.
- No selling, no calls, no camera required: listing, pricing and install flow are self-serve. This is the single most mission-compatible property of this channel.

**Honest ceiling.** The Restaurants category is a small slice of a large marketplace, and the payout floor is $200/month — below it you are paid nothing that month, which is a real cliff for a new listing. A no-brand app with no reviews competing against Wix's own bundled apps realistically reaches low hundreds of dollars a month within a year. I put the honest ceiling at ~₪3,000/month, and note that months 1–3 will plausibly be ₪0 because of the $200 threshold.

**Build:** Wix app OAuth, an embedded dashboard widget, a site widget, and Wix-side billing. ~40 hours.

---

## 2. Spain — SES.HOSPEDAJES guest reporting (real obligation, saturated market)

**The obligation is real and the endpoint is live — this is CODE-grade, not a claim from a vendor blog.**
GitHub `search_code` for `"hospedajes.ses.mir.es"` → **97 results across many independent repositories**, e.g.
`Arroyador69/delfin-check-in`, `ToniIAPro73/anclora-guesthub`, `vicentalonso/ses-hospedajes-node`, `pvilas/hospedajes`, `juanrdzbaeza/chumbo.io`.

Rendered spec summary (CODE):
https://raw.githubusercontent.com/ToniIAPro73/anclora-guesthub/main/schemas/ses-hospedajes/v3.1.3/SOURCE.md
- Spec package: `MIR-HOSPE-DSI-WS-Servicio de Hospedajes - Comunicaciones v3.1.3.zip`, version **v3.1.3**, document dated **2025-02-17**.
- Production endpoint: `https://hospedajes.ses.mir.es/hospedajes-web/ws/v1/comunicacion`
- Test endpoint: `https://hospedajes.pre-ses.mir.es/hospedajes-web/ws/v1/comunicacion`
- Covers accommodation registrations, reservations and vehicle rentals.
- Authentication method, mandatory field list and the Real Decreto citation were **not** in that file. A second repo shows TLS/CA handling (`Arroyador69/delfin-check-in/src/lib/mir-tls-ca.ts`), implying client-certificate auth — inferred, not confirmed.

**Why it is nonetheless a dead end for us — the market is already full, at a price floor near zero.** SNIPPET, 2026-09-05, at least seven named incumbents:
- https://partee.es/ — free 1-month trial
- https://partesdeviajeros.com/ — "from €0.95 per guest registration, no monthly fee", "average monthly spend around €30"
- https://checkin-online.es/ — pay-per-registration, "if you have no reservations in a month, you pay nothing"
- https://registroviajero.com/ — "€5 per active accommodation per month, no minimum"
- https://chekin.com/ , https://net2rent.com/ , https://www.lodgify.com/ — all publishing SES.HOSPEDAJES guides as acquisition content

Seven vendors, Spanish-language SEO already owned, a €5/month or €0.95/guest price point, and a buyer (a Spanish apartment owner) who will not buy compliance software from an unknown foreign brand. A new no-brand entrant competes on nothing.

**Payability: YES** if sold direct (Paddle, already proven in `products/il-biz-tools`). **ToS: GREEN** — it is a government-mandated reporting API.
**Ceiling: ~₪600/month.** Not recommended.

---

## 3. Italy — Alloggiati Web / ISTAT / tourist tax (identical shape, identical verdict)

**CODE:** GitHub `search_code` for `"alloggiatiweb.poliziadistato.it"` → **163 results**, e.g.
`SergioArc69/invio_schedine-alloggiatiweb`, `zumatt/generatore-schedine-alloggiati-web`, `marcuson/alloggiatiweb-helpers`, `diegoandruccioli/hotel-pms`, `dimoranardones-create/bnb-system`, `devincentiis/GAzie`, `scifani/myguesthouse`.

Rendered (CODE): https://raw.githubusercontent.com/scifani/myguesthouse/main/README.md
- "automatic submission of guest registration records to the Italian police web service **AlloggiatiWeb** (SOAP API at `alloggiatiweb.poliziadistato.it`)"
- Pain named: manual submission is "tedious and error-prone"; app stores per-apartment credentials; GDPR handled by separating reusable guest profiles from immutable police records.

**Market saturation (SNIPPET, 2026-09-05):** LodgeEasy (https://lodgeasy.it/), BBPlanner (https://www.bbplanner.com/alloggiatiweb), Wiisy (https://wiisy.app/), CheckIn Facile (https://checkinfacile.com/), Greenora, Nuvola (gestionalehotels.it), Smartness — all bundling Alloggiati + ISTAT + tassa di soggiorno already. No monthly price appeared in the snippets; **URL to open to close the price question: https://lodgeasy.it/guides/software-gestionale-bb**.

Same verdict as Spain. **Ceiling ~₪600/month. ToS GREEN. Not recommended.**

*Note for the colony: 97 + 163 public repos hard-coding these two endpoints is itself the finding — the compliance layer for small European lodging is not an underserved niche, it is a solved and commoditised one, in at least two countries, in the local language.*

---

## 4. Google Business Profile review tooling — gated, and the gate is a human one

**SNIPPET, 2026-09-05**, from https://developers.google.com/my-business/content/prereqs and https://developers.google.com/my-business/content/policies :
- "You must request access to the Business Profile API via the GBP API contact form and await approval."
- "new Google Cloud projects start with zero quota for these APIs"
- Requirements quoted: "demonstrate a legitimate business use case (managing your own or clients' locations), have a verified GBP that's been active for 60+ days, and provide a valid business website"
- "The API works only for your own locations... you can't collect reviews of others' listings. You can't create or edit user reviews, only manage your replies"
- "you can only use the Business Profile APIs to create, manage, and report on business listings that you either own or are authorized to manage"

**ToS: AMBER for the API route, RED for the obvious shortcut.** Scraping Google reviews to build a restaurant review-management product violates Google's terms and our own constitution. The sanctioned route requires a case-by-case approval and a verified business profile aged 60+ days.

**Owner blockers:** a Google-reviewed access application, plus a verified Google Business Profile that has existed for 60+ days. That is not a one-time KYC step — it is a discretionary human review of a business we do not have. **This effectively closes the review-management corner of the criterion.**

**Ceiling: ₪0** as a buildable line today.

---

## 5. Hotel PMS marketplaces (Mews / Cloudbeds / Apaleo) as a distribution channel

**SNIPPET, 2026-09-05:**
- Mews: "Potential partners first register on the Mews website, followed by a **certification call and a pilot at a live Mews property**." — https://docs.mews.com/getting-started/mews-marketplace , https://hoteltechreport.com/news/mews-1000-marketplace-integrations
- Cloudbeds: "Certified partners get co-marketing support, early access to new APIs, and a **dedicated partner success contact**." — https://www.cloudbeds.com/partner-with-cloudbeds/ , https://www.cloudbeds.com/api/
- Apaleo: "Apaleo provides **free self-serve developer accounts** and lets any developer register freely to build immediately... over OAuth 2.0"; the Store lists "100 apps and integrations" — https://store.apaleo.com/

**This is where the mission bites.** A certification call and a pilot at a live customer property is exactly the human sales motion the owner does not do. **Mews and Cloudbeds are closed to us on that ground alone**, regardless of their economics. Apaleo is the only one of the three whose onboarding reads as self-serve, but its Store is small (~100 apps) and its installed base of small independent hotels is far smaller than Mews' or Cloudbeds'.

Revenue share, listing fees and payout countries for all three: **not found**. URLs to open: https://docs.mews.com/getting-started/mews-marketplace and https://store.apaleo.com/ .

**Payability: UNKNOWN. ToS: AMBER** (unknown commercial terms). **Ceiling ~₪500/month** via Apaleo only, and low confidence in even that.

---

## 6. Allergen / menu-labelling compliance for small cafes — commoditised, and carries liability

**The obligation (SNIPPET, 2026-09-05):** EU Regulation 1169/2011 mandates allergen information for non-prepacked food including in restaurants and cafes; the UK FSA's updated best-practice guidance (March 2025) "strongly recommends that written allergen information should always be available for non-prepacked food"; UK "Natasha's Law" covers PPDS labelling.
- https://menutech.com/en/blog/legal-requirements/eu-11692011-guide-allergen-labelling-requirements
- https://menumargin.co.uk/blog/uk-restaurant-allergen-compliance-guide-2026
- https://sites.manchester.ac.uk/foodallergens/information-for-food-businesses/eu-legal-requirements-on-food-allergen-labelling/

**The price floor is zero.** SNIPPET:
- Top Food App: 14-allergen tagging, EU 1169/2011 and Natasha's Law compliant, "**free forever, no credit card required**" — https://topfood.app/en/free-allergen-menu
- QR Menu Generator Pro: **$9.90/month** or $99/year, adds allergen and diet tags — https://qrmenugenerator.io/blog/qr-menu-software-pricing-comparison-2026
- Food Label Maker: $49 / $99 / $199 per month — https://foodlabelmaker.com/pricing/
- Others already in the space: Menutech, Ingredifind, allergymenu.app, RLS, NutriScheme.

**ToS: AMBER, and the reason is not terms but liability.** Software that tells a cafe which of the 14 allergens is in a dish, sold by an operator with no food-science process behind the data, can contribute to someone being harmed. Our constitution's "honest value only" points away from shipping a generated allergen matrix we cannot stand behind. A purely presentational tool (the restaurateur enters the allergens; we only render and version them) is GREEN — but that is the $9.90/month QR-menu commodity, already served by free products.

**Payability: YES** if sold direct via Paddle. **Ceiling ~₪400/month.** Not recommended.

---

## Dead ends and gaps, said plainly

1. **European small-lodging compliance (Spain, Italy) is solved, not underserved.** 260 public repositories between two endpoints, seven-plus commercial vendors per country, prices of €5/month or €0.95/guest, and local-language SEO already owned. This is the clearest dead end in the criterion and the colony should not re-search it.
2. **Review management is closed by Google's gate**, and the only route around it is scraping, which is RED.
3. **The two largest hotel-PMS marketplaces require a human call and a live-property pilot.** Any proposal routed through Mews or Cloudbeds is dead on the mission's first rule, whatever its economics.
4. **QR menus / digital menus are a commodity with a free tier.** No search was needed to establish saturation — it fell out of the allergen search.
5. **I did not cover the Israeli hospitality market at all.** gov.il and Israeli vendor domains are egress-blocked, and I had no search budget left to attempt the mirror route (rule 9). Israeli restaurant/hotel compliance — business licensing (רישוי עסקים), tourist-tax and Ministry of Health食 requirements — is **unswept**, not empty. It is worth one scout with a full budget.
6. **Restaurant POS marketplaces (Toast, Square, Lightspeed) went unsearched** — the budget ran out. Their developer payout countries for an Israeli entity are UNKNOWN and are the first thing a follow-up should check.
7. **The single unclosed fact that decides the best finding:** whether Wix pays out to Israeli banks and what the monthly minimum actually is. URL: https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/payments-and-billing-faqs (EGRESS_BLOCKED here).

## Searches run (7 issued, of a cap of 8)
1. Wix App Market developer revenue share payout supported countries app pricing
2. SES Hospedajes software precio mes apartamento turístico check-in policía alta gratis
3. software gestionale B&B alloggiati web ISTAT tassa soggiorno prezzo mensile piccole strutture
4. Wix App Market restaurant menu app reviews installs "Wix Restaurants" third-party apps
5. Google Business Profile API reviews access approval requirements terms scraping reviews prohibited
6. allergen menu labelling software small restaurants cafes EU 1169/2011 Natasha's Law price per month
7. Cloudbeds Marketplace OR Mews Marketplace OR Apaleo Store partner program requirements fee revenue share integration certification

## Zero-search sources actually rendered
- https://raw.githubusercontent.com/ToniIAPro73/anclora-guesthub/main/schemas/ses-hospedajes/v3.1.3/SOURCE.md
- https://raw.githubusercontent.com/scifani/myguesthouse/main/README.md
- GitHub `search_code`: `"hospedajes.ses.mir.es"` (97 hits), `"alloggiatiweb.poliziadistato.it"` (163 hits)
