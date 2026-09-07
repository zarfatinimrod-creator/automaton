---
name: revenue-apify-actors
description: Playbook for the Apify Actor line — published free while the 30-day stranger count runs (core).
auto-activate: false
---

# Apify Actors — director playbook

**Audited ceiling: ₪200/month at twelve months** (`research/colony-sweep/CHIEF-AUDIT.md` §2.1 row 1; ₪1,500
is recorded as the contested upper bound and is not planned against). **Month one: ₪0. First ledger entry
expected around month nine.** Board decision 7.9.2026 (`research/colony-sweep/BOARD.md`): this line is the
colony's **first measurement**, not its first sale.

Why this line at all: Apify Store has audited developer payouts, automated review (daily health tests and a
quality score, no manual gate) and an 80% revenue share — and its quality score has a developer-level
"history of success" category, one of exactly three non-public inputs this colony can accumulate. That
history starts only once something is published, which is why the line is published **free** first.

## What is true today

- `products/apify-il-open-data` is the one Actor. It is published **unpriced** through
  `.github/workflows/apify-publish.yml` the moment the owner pastes `APIFY_TOKEN` (step 6 of
  `docs/OWNER_STEPS.he.md`) and clicks "Publish to Store" once in the Apify Console — publication is a
  console action, not a CLI one (`products/apify-il-open-data/docs/PUBLISH.md`).
- `scripts/apify-runs.mjs` counts runs daily and writes `state/colony/measurements/apify-runs.json`,
  separating **stranger** runs from our own by user id. That number is the KPI; nothing else on this line is.
- **No KYC, no pricing, no PayPal** until the count says someone is looking. Apify's identity verification
  (ID, proof of address, tax document, UBO) is a deferred owner step (`CHIEF-AUDIT.md` §4B), with a fuse:
  an accrued balance is forfeited after twelve continuous months without KYC or below the minimum.
- Two listed Actors already wrap the identical `data.gov.il` endpoint (`agent-markets`, `productized-services`
  audits). This is **not** unoccupied ground; the measurement is whether ours gets found anyway.

## Loop

1. **Measure first.** Read `apify-runs.json` weekly. Report `strangerRunsLast30Days` and distinct stranger
   users to the board through `revenue_kpi`. Do not add a second Actor, a price, or a funnel before the
   thresholds below.
2. **Thresholds (board, `BOARD.md` §5):**
   - **fewer than 10 stranger users in 30 days** → instrument only; improve the README and input schema;
     no new build.
   - **50 stranger users** → build a second Actor in the adjacent niche the runs suggest, and put Apify KYC
     on the owner's list as a step that has now earned itself.
   - **200 stranger users** → enable pay-per-event pricing; the listing **must name the free source**
     (`data.gov.il`) and price the convenience, never the data (MISSION rule 4).
3. **Build (only past the 50 threshold):** Crawlee + TypeScript template, strict input schema, README with
   example input/output, an integration test against the live source, error handling for empty results.
4. **Operate:** check the run log and quality score daily; a failing health check must be fixed within 48
   hours or the Actor is deprecated after 31 days of failures; answer the Actor's issue tab in writing.
5. **Record money only as money:** the monthly payout invoice (auto-approved on the 14th) goes into the ledger
   with `revenue_record source=apify external_id=<invoice id>`. A run count is a KPI, never revenue.

Substrate worth knowing: `next.obudget.org/api/query` (BudgetKey) is a free, keyless SQL API over Israeli
procurement and budget data — a better base than what the Actor normalises today
(`research/measurements/tenders-occupancy.md`). Use it when the count says anyone is looking.

## Never

Scrape personal profiles; bypass logins or paywalls; misdescribe what an Actor returns; publish without a
passing test; **price the Actor before the owner's KYC exists**; put a price on data the state gives away
without saying so in the listing; run our own Actor to inflate the count (own runs are subtracted, and
faking strangers is fraud against ourselves).
