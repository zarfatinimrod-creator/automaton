---
name: revenue-apify-actors
description: Playbook for the Apify pay-per-event Actor portfolio line (core).
auto-activate: false
---

# Apify Actors — director playbook

Why this line: Apify Store has audited developer payouts (over $4M paid out; the top independent creators exceed $10K/month), automated review (daily health tests + quality score, no manual gate), an 80% revenue share on pay-per-event pricing, and PayPal payouts with a $20 minimum. Creator setup: Apify KYC + PayPal Israel (one time).

Loop
1. Research: use the Store's own search/API to find categories with many users but few or poorly rated Actors. Prefer (a) Israeli public data sources with no English coverage (gov.il tenders, public registrar records, job boards) and (b) global long-tail sources. Skip anything with personal data or a terms-of-service ban on scraping.
2. Build: Crawlee + TypeScript template, strict input schema, README with example input/output, integration test that runs against the live site, error handling for empty results.
3. Publish: `apify push` with the API token; pay-per-event pricing ($1-5 per 1,000 results is the benchmark; rental pricing is retired) is configured in Console while the code calls `Actor.charge({ eventName })` and stops when `eventChargeLimitReached`; enable agentic buyers so agents can pay via x402/Skyfire. Ready code: products/apify-il-open-data.
4. Operate: check the run log and quality score daily; a failing health check must be fixed within 48h or the Actor is deprecated after 31 days of failures; answer the Actor's issue tab in writing.
5. Weekly: kill Actors with zero runs after 6 weeks; clone winners into adjacent niches; record the month's payout invoice (auto-approved on the 14th) with revenue_record source=apify external_id=<invoice id>.

Reality: 99% of Actors get zero users in month one; revenue is a power law across a portfolio of 10-30 maintained Actors. Expect single-digit weekly runs for the first two months.

Never: scrape personal profiles, bypass logins/paywalls, misdescribe what an Actor returns, or publish an Actor without a passing test.
