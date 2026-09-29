---
name: revenue-apify-actors
description: Playbook for the Apify Actor line — published free while the 30-day stranger count runs (core).
auto-activate: false
---

# Apify Actors — director playbook

**Planned target: ₪0** as the constraint-7 instrument until the day-30 stranger count exists (board ruling 29.9.2026,
`research/channel-loop/RULING-2026-09-29-lines.md` (b); graded `inferred`). **Audited ceiling: ₪200/month at twelve
months** (`research/colony-sweep/CHIEF-AUDIT.md` §2.1 row 1; the 8.7 users/Actor base rate) — now recorded as the
CONTESTED UPPER BOUND, not a target, and it returns only from that reading. ₪1,500 is the figure the board refused (an
unverified marketing mean), kept in the `TARGET_BASIS` basis text only. **Month one: ₪0. First ledger entry
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
- **No pricing, no PayPal** until the count says someone is looking. Apify's identity verification (ID, proof
  of address, tax document, UBO) is an owner step with a fuse: an accrued balance is forfeited after twelve
  continuous months without KYC or below the minimum. **When it is asked changed on 28.9.2026** (next bullet).
- **The count is biased low while the developer is unverified (breadth board, 28.9.2026,
  `research/breadth/BOARD.md` Q5).** Apify's default Store-API search excludes Actors from developers who have not
  passed identity verification, so a near-zero count can mean "hidden" as well as "unwanted". The KPI carries
  this label wherever it is printed, word for word (`APIFY_STRANGER_KPI_LABEL` in `src/revenue/portfolio.ts`):
  *"stranger runs — biased low while the developer is unverified: hidden from default Store-API search"*.
  Before the Publish click, two free reads: the Store-API pair (`?search=israel&limit=1000` with and without
  `includeUnrunnableActors=true`, ZERO-TESTS row 51) to size the hidden share, and Apify's identity-verification
  requirements from the GitHub-hosted `apify-docs` repository. **If that read shows document-only verification**
  (no selfie, liveness or video), verification is asked at the Publish sitting (owner step 6, part ג) — no
  longer deferred to 50 stranger users — so the day-30 count measures demand and not visibility. **If it shows
  any camera step**, verification is never asked, the line stays a biased-low ₪0 instrument, and the "history of
  success" clock is noted as unverified to accrue while the Actor is hidden. (Until 28.9 this bullet read "No
  KYC … until the count says someone is looking", with KYC deferred to 50 stranger users, `CHIEF-AUDIT.md` §4B.)
- Two listed Actors already wrap the identical `data.gov.il` endpoint (`agent-markets`, `productized-services`
  audits). This is **not** unoccupied ground; the measurement is whether ours gets found anyway.

## Loop

1. **Measure first.** Read `apify-runs.json` weekly. Report `strangerRunsLast30Days` and distinct stranger
   users to the board through `revenue_kpi`, always with the label above. Do not add a second Actor, a price,
   or a funnel before the thresholds below.
2. **Thresholds (board, `BOARD.md` §5, as amended by the breadth board of 28.9.2026, Q5):**
   - **fewer than 10 stranger users in 30 days** → **TEST_MORE** (hidden or unwanted, indistinguishable), never
     "permanent instrument", until Apify identity verification is settled as above; improve the README and
     input schema; no new build, and no verification request on this reading.
   - **50 stranger users** → build a second Actor in the adjacent niche the runs suggest. Apify identity
     verification is no longer asked here: it moved to the Publish sitting if document-only, and is never
     asked if it needs a camera.
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
