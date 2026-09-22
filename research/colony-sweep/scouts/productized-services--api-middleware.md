# Scout notes — productized-services / api-middleware

**Criterion:** Selling API wrappers, middleware and integration glue on marketplaces: what sells, and how quickly official APIs make it obsolete.
**Date:** 2026-09-03. **Search budget used:** 8 of 8 WebSearch calls (cap reached — stopped searching).
**Evidence grades:** RENDERED = page actually fetched and read; SNIPPET = search-result summary only (weaker, must be re-opened by an unblocked agent); MEMORY = not used as evidence.

## Sources actually touched

RENDERED (WebFetch, GitHub raw / GitHub API):
- https://raw.githubusercontent.com/apify/apify-docs/master/sources/academy/build-and-publish/apify-store-basics/how_actor_monetization_works.md — Apify's own docs repo. States: developer earns **80% of revenue minus platform usage costs** (pay-per-event); **80% of monthly rental fees** (rental model, being sunset); "most prices on Apify Store range between $1-10 per 1,000 results". No payout-threshold or country text in that file.
- https://raw.githubusercontent.com/thevgergroup/mad-skills/main/skills/aws-marketplace/seller-onboarding.md — THIRD-PARTY skill file, not AWS primary. Lists eligible seller jurisdictions: "United States, Canada, EU member states, UK, Australia, New Zealand, Japan, South Korea, India, **Israel**, UAE, Qatar, Bahrain, Norway, Switzerland, Colombia, Hong Kong SAR"; "If your business is not based in an eligible jurisdiction, you cannot sell paid products on AWS Marketplace. There is no waiver path."; non-US individual sellers file **W-8BEN**; bank "must accept USD disbursements; SWIFT code required for non-US banks"; "Cannot use a personal account in a different name from the seller entity."
  - To close: a human/unblocked agent must open https://docs.aws.amazon.com/marketplace/latest/userguide/seller-registration-process.html and confirm Israel is on AWS's own list.
- GitHub code search (mcp__github__search_code) confirmed the two files above exist at those paths.

SNIPPET-ONLY (WebSearch, 2026-09-03) — must be reopened to confirm:
- Apify earnings: help.apify.com/en/articles/8684010-make-money-publishing-your-actors-on-apify-store ; apify.com/partners/actor-developers ; docs.apify.com/platform/actors/publishing/monetize — snippets say top independent creators exceed $10k MRR, many exceed $1k/mo; payouts on the 11th; thresholds commonly $100 bank / $20 PayPal. A third-party blog (agentbyline.com) claimed ~$1.4M/month paid across ~3,000 developers (~$470 average incl. zero-earners) — treat as unverified.
- RapidAPI: docs.rapidapi.com/docs/monetizing-your-api-on-rapidapicom still documents provider monetization; Nokia acquired Rapid in Nov 2024 and is steering the platform to telecom/Network-as-Code; snippets describe declining third-party listings and developer activity. No documented payout-shutdown. Payout methods/countries: NOT established.
- Zapier / Make / n8n: zapier.com/developer-platform/partner-program and zapier.com/l/solution-partner describe benefits and *referral* revenue share, not per-integration revenue for app builders; n8n.io/affiliates pays 30% on cloud referrals for the first year. No search result showed any platform paying developers per install/use of an integration.
- MCP monetization: dev.to/lexwhiting/... , mcpize.com , agenticmarket.dev , chatforest.com guides. Claims: >20,000 MCP servers, 6,000+ on Smithery, <5% earn anything; MCPize 80/20 (85% for pre-2026-06-10 "founding" servers); AgenticMarket pay-per-call keeping 80-90%; Apify has paid MCP tools on the same pay-per-event rail at 80%; Smithery charges creators $30/mo with no income share. All SNIPPET-only and mostly vendor marketing; dev.to is egress-blocked here.
- Shopify Partners payouts: help.shopify.com/en/partners/getting-started/getting-paid — payouts via Hyperwallet to PayPal / bank / wire, availability depends on country+currency, 0.50% conversion fee for non-USD. **Israel not confirmed either way.**
- Obsolescence examples: Reddit API paid tiers 2023 killing Apollo/RIF/Sync and .json endpoints/OAuth closing (medium.com article, 2026); Tesla shipping an official API and discontinuing the old unofficial REST path (interestingengineering.com / news.ycombinator.com/item?id=37872150); Apple Ads Platform API v1.0 (Aug 2026) with the old Campaign Management API shutting down 2027-01-26 (ppc.land).

## Read-through

**What actually sells.** The only marketplace in reach where an unbranded software-only seller demonstrably gets paid per use, with a rendered revenue-share clause from the platform's own docs, is **Apify** (80% pay-per-event). Everything else in this criterion is either (a) a directory with no payment rail (Zapier/Make/n8n app listings, Smithery), (b) an enterprise channel that needs a salesperson (AWS Marketplace), (c) a declining marketplace with unverified payout rails (RapidAPI), or (d) an emerging pay-per-call MCP marketplace whose numbers are vendor marketing.

**Obsolescence half-life.** The evidence pattern is consistent: a wrapper over an *unofficial* or *undocumented* API dies when the platform ships an official one (Tesla) or closes access (Reddit); a wrapper over an *official* API dies on the platform's deprecation calendar (Apple Ads old API, off 2027-01-26). So the durable shape is not "wrapper over someone's API" at all — it is compute + normalization over data with no owner (open government data, public documents), or glue that adds work the official API will never do (aggregation across vendors, format conversion, per-call billing for agents). This is exactly the shape the colony already shipped (apify-il-open-data, x402-il-api).

**Constitution check.** Any wrapper of a private API that the platform's terms forbid is RED and is not proposed here.
