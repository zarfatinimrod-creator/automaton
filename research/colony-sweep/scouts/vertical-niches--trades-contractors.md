# Scout notes — vertical-niches / trades-contractors
Date: 2026-09-05. Agent: WORKER-SCOUT "trades-contractors".
Criterion: Contractors and trades — quoting, invoicing, scheduling, permits. What one-person operations genuinely buy.

## Budget spent
8 WebSearch calls (the cap). 2 GitHub `search_code` calls (free). 1 WebFetch attempt, blocked.

## Evidence log — every URL touched

### Search 1 — solo contractor software pricing (2026-09-05, snippets only)
- https://www.microgaps.com/blog/jobber-alternative-solo-contractors-2026
- https://contractoropsguide.com/how-much-does-contractor-software-cost/
- https://ustechautomations.com/resources/blog/joist-vs-housecall-pro-for-small-contractors-2026
- https://www.cleansavannah.com/post/best-handyman-software-solo-operators-2026
Snippet-grade claims: Joist $10/mo Basics (5 documents/month cap); Jobber $49/mo monthly for 1 user, $29/mo annual; Housecall Pro $79/mo standard, basic from $59/mo; solo tools broadly $0-50/mo, small teams $50-300/mo.
NOTE: these are affiliate-flavoured comparison blogs, not vendor pages. To close: open getjobber.com/pricing, housecallpro.com/pricing, joist.com/pricing (not attempted — egress unknown, budget spent).

### Search 2 — QuickBooks App Store / Intuit developer (2026-09-05, snippets only)
- https://investors.intuit.com/news-events/press-releases/detail/584/intuit-launches-new-developer-experience-and-global-app-store-for-quickbooks-online (Rest-of-World app store, publish in 200+ countries, per-market availability control)
- https://quickbooks.intuit.com/accountants/products-solutions/pricing-promotions/papp/revenue-share/ (ProAdvisor/Payments revenue share is US-only — this is NOT the developer app store)
No source found stating whether an Israeli developer entity may publish. UNKNOWN.

### Search 8 — Intuit publishing requirements (2026-09-05, snippets only)
- https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/technical-requirements
- https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/security-requirements
- https://developer.intuit.com/app/developer/qbo/docs/go-live/list-on-the-app-store/maintaining-compliance
- https://satvasolutions.com/blog/intuit-app-store-approval-timeline-developer-guide
Snippet-grade: technical review, then security review; critical/high/medium issues must be remediated before publishing; annual compliance re-review after publication. Nothing found on developer-country eligibility or on who bills the end customer.

### Search 3 — permit data (2026-09-05, snippets only)
- https://www.shovels.ai/api , https://www.shovels.ai/permit-database
- https://coldiq.com/tools/shovels — snippet: "Shovels starts at $599/month", pricing sales-gated
- https://permit-stack.com/blog/building-permit-data-api-pricing-compared.html
- https://www.homelogs.io/blog/permit-data-api-comparison-homelogs-shovels-attom-batchdata
Snippet-grade: 185M+ permits, 3.3M contractors, 2,750+ US jurisdictions, ~85% of US population, refresh on the 1st and 15th.

### GitHub code search — Shovels (code-grade, free)
`search_code "api.shovels.ai" language:python` → 9 hits, independent repos hard-coding the endpoint:
- nicolasakf/pyshovels `src/pyshovels/client.py` — BASE_URL "https://api.shovels.ai/v2", docs at https://docs.shovels.ai/api-reference/
- savrik85/FENIX `fenix-eagle/src/services/crawl4ai_scraper.py` — "https://api.shovels.ai/v2/permits/search"
- jwordenaii/wordenstandard `app/services/license_service.py` — GET https://api.shovels.ai/v1/contractors/license with X-API-Key, params state + license_number
- DeepNandre/Atlasly-flow — ShovelsClient used for AHJ (authority-having-jurisdiction) resolution
This is first-hand evidence the permit/contractor-licence API exists and what it does. It is not evidence of price; the $599 figure is a third-party snippet.

### Search 4 — Jobber developer program (2026-09-05, snippets only)
- https://secure.getjobber.com/app_marketplace
- https://help.getjobber.com/hc/en-us/articles/360062128653-App-Marketplace
- https://developer.getjobber.com/docs/custom_integrations/ — WebFetch BLOCKED (EGRESS_BLOCKED)
- https://dev.to/jobber/building-an-app-in-jobber-platform-5259 (dev.to blocked for fetch)
Snippet-grade: Technology Partners build apps listed in the App Marketplace; Developer Center access; "over 200,000 Home Service Pros"; three partner types (technology, referral, reseller); current focus is integrations launched in the App Marketplace.

### GitHub code search — Jobber (code-grade, free)
`search_code "api.getjobber.com/api/graphql"` → 263 hits across many unrelated third-party repos (amp-labs/connectors, n8n node, several private CRMs, CLIs). Establishes first-hand:
- Single GraphQL endpoint POST https://api.getjobber.com/api/graphql
- OAuth2 authorization-code + refresh: /api/oauth/authorize, /api/oauth/token
- Required header X-JOBBER-GRAPHQL-VERSION, date-versioned (2023-08-18 … 2026-03-10 seen in the wild)
- Rate limiting: 2,500 req / 5 min DDoS guard plus a leaky-bucket query-cost budget in extensions.cost
- api-evangelist/providers `_providers/jobber.md`: "100,000+ businesses across more than 50 trade verticals … Third-party apps are published in the Jobber App Marketplace" (third-party directory text, medium confidence)
- mvanhorn/printing-press-library research note (2026-05-15) records a live introspection probe: 18 GraphQL root connections, quotes/invoices/jobs/visits/payments.
The integration surface is real, open, documented by usage, and already has many independent integrators — which is both the opportunity and the competition.

### Search 5 — solo contractor software reviews (2026-09-05, snippets only)
- https://www.capterra.com/handyman-software/ , https://www.capterra.com/p/230138/Joist/reviews/?page=2 , https://capterra.com/p/10033295/Contractor-AI , https://www.capterra.com/p/10039087/SoloOp/
Snippet-grade: Joist Pro $16/mo unlimited estimates+invoices but no scheduling/calendar/pipeline/e-signature (Capterra review dated March 2026); Contractor AI base $24.99/mo; SoloOp exists. The gap named repeatedly is "team software is overkill and overpriced for one person".

### Search 6 — Etsy contractor templates (2026-09-05, snippets only)
- https://www.etsy.com/market/contractor_estimate_templates
- https://www.etsy.com/listing/4512181538/construction-invoice-template-editable
- https://www.etsy.com/market/contractor_spreadsheet
Snippet-grade: an active category exists (editable Excel/Sheets estimate + invoice + contract bundles with auto-calculating markup). No sales counts obtained — Etsy listing pages were not rendered, so demand size is UNKNOWN.

### Search 7 — Etsy payability to Israel (2026-09-05, snippets only)
- https://help.etsy.com/hc/en-us/articles/115015710408-Countries-Eligible-for-Etsy-Payments (the page a human must open to confirm)
- https://www.etsy.com/legal/etsy-payments/
Snippet-grade: Israel is listed as eligible for Etsy Payments; PayPal is NOT available to Israel-located sellers enrolled in Etsy Payments (cards/Apple Pay/Google Pay are).

### Repo-internal evidence (strong, first-hand)
- /home/user/automaton/products/il-biz-tools — Paddle already wired as our payment rail, so a self-billed SaaS is payable to Israel without a new gate.
- /home/user/automaton/docs/REJECTED.md — multi-shop Etsy/POD is RED (anti-detect operator literature); a *single* shop is explicitly not rejected. Also: Etsy-style marketplaces are conversion-history-locked for new entrants.

## Judgement

The criterion is real and has money in it, but almost all of that money is already collected by
Joist / Jobber / Housecall Pro / Contractor+ at $10-79/month, and the buyer is US/CA/UK/AU. For a
no-brand Israeli software-only operation the honest reading is:

1. A standalone solo quoting/invoicing app is a saturated commodity with a $10 price floor. Not a build.
2. The defensible shapes are *attachments* to an existing platform whose users already pay — a Jobber
   App Marketplace app is the cleanest, because the API is open, OAuth-based, well documented by
   third-party code, and the buyer is nameable (an existing Jobber subscriber).
3. Permits look like the interesting word in the criterion but are not a solo-trade purchase. Permit
   data is a lead-gen product sold to suppliers/insurers at $599/mo input cost; a solo contractor
   does not buy a permit database, he pulls one permit at his own city's counter.
4. Digital templates are payable and legal but small.

## Open questions a human or unblocked agent must close
- https://developer.getjobber.com/docs/custom_integrations/ and the Jobber Technology Partner
  agreement: is there a country restriction on developers, is marketplace listing gated on a signed
  partner agreement, and does Jobber take a cut or does the developer bill the customer? BLOCKED here.
- https://help.etsy.com/hc/en-us/articles/115015710408-Countries-Eligible-for-Etsy-Payments — confirm
  Israel on the rendered list.
- developer.intuit.com publishing docs — developer-entity country eligibility, and who bills.
- Vendor pricing pages (getjobber.com/pricing, joist.com/pricing) — all pricing above is snippet-grade.
