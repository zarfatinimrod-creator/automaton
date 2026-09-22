# SCOUT: risk-governance / audit-trail

**Criterion:** What an accountant and a tax authority will later demand as evidence of
income — records, invoices, platform statements — and how our ledger must be structured
now so it satisfies them later.

**Date of sweep:** 2026-09-03
**Scout model:** Opus 5

---

## 0. Evidence conditions (read this before trusting anything below)

This sweep ran with almost no working evidence channel. Recorded honestly:

| Channel | Result |
|---|---|
| `WebSearch` | **Budget exhausted session-wide** on the first call: "this session has used its web search budget (200 of 200 WebSearch calls)". Zero searches available to this scout. |
| `WebFetch` www.gov.il | `EGRESS_BLOCKED` |
| `WebFetch` en.wikipedia.org | `EGRESS_BLOCKED` |
| `WebFetch` github.com/search | HTTP 429, `Retry-After: 3600` |
| `mcp__github__search_repositories` | **Works** — returned real, dated results (below) |
| `mcp__github__get_file_contents` | **Denied** — session allowlist is `zarfatinimrod-creator/automaton` only. Repo *contents* off-limits; only search metadata is readable. |
| Local repo (`/home/user/automaton`) | Fully readable — this is my only *strong* evidence source |

Consequence: every claim about **Israeli tax law** below is *unverified* and is listed as
an open question with the exact URL a human or unblocked agent must open. Every claim
about **our own ledger** is strong evidence (I read the schema and the types).

I did not invent a single number, threshold, date or price. Where I do not know, it says
unknown.

---

## 1. Strong evidence: what our ledger stores today

Read directly from the repo.

**Schema** — `/home/user/automaton/src/state/schema.ts` lines 712-728:

```
CREATE TABLE IF NOT EXISTS revenue_ledger (
  id TEXT PRIMARY KEY,                          -- ULID
  line_id TEXT NOT NULL,
  kind TEXT NOT NULL,                           -- sale|subscription|payout|refund|cost
  amount_minor INTEGER NOT NULL,                -- signed, minor units of currency
  currency TEXT NOT NULL,                       -- ILS|USD|USDC|EUR
  amount_agorot INTEGER NOT NULL,               -- signed, normalized to ILS agorot
  source TEXT NOT NULL,                         -- stripe|lemonsqueezy|gumroad|x402|manual|...
  external_id TEXT,                             -- idempotency key from the source
  occurred_at TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  note TEXT
);
CREATE UNIQUE INDEX ... ON revenue_ledger(source, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX ... ON revenue_ledger(line_id, occurred_at);
```

**Types** — `/home/user/automaton/src/revenue/types.ts` lines 63-128
(`LedgerKind`, `LedgerEntry`, `LedgerEntryInput`).
**Persistence** — `/home/user/automaton/src/revenue/ledger.ts`.

What is already right, and should be preserved:
- ULID primary key → time-ordered, non-guessable, stable.
- `external_id` + the **unique index on (source, external_id)** → idempotent ingestion,
  and it is the platform transaction id MISSION.md demands. This is the single most
  important audit property we already have.
- `occurred_at` **and** `recorded_at` kept separately → the difference between the
  economic event and the bookkeeping event is preserved. Accountants need exactly this.
- Signed minor units, never floats.
- Costs and refunds live in the same table as income (`kind`), so gross/net is derivable.

## 2. Strong evidence: the eight gaps an accountant will hit

These are gaps in *our* code, stated as facts about the schema above — not legal claims.

1. **The FX rate is not recorded.** `amount_agorot` is a normalized ILS figure but the
   rate, the rate's source and the rate's date are stored nowhere. Nobody — not an
   auditor agent, not an accountant, not the tax authority — can re-derive the shekel
   number from the USD number. A conversion you cannot reproduce is not evidence.
   Fix: `fx_rate`, `fx_rate_date`, `fx_rate_source` columns, written at ingest, never
   recomputed later.
2. **No gross / fee / net split.** Paddle (merchant of record), Telegram Stars, Apify and
   x402 all deduct a cut before money reaches us. One `amount_minor` cannot express
   "customer paid X, platform kept Y, we received Z". Tax treatment of the gross figure
   and of the platform fee is a legal question (open, below), but the *data* must survive
   either answer. Fix: `gross_minor`, `fee_minor`, `net_minor`.
3. **No payout↔sale linkage.** A bank statement shows one aggregated platform payout;
   the accountant must tie it to the underlying sales. `kind='payout'` exists, but no
   `payout_batch_id` foreign key ties sales rows to the payout row that settled them.
   This reconciliation is the most common accountant request and it is currently
   impossible to answer from our data.
4. **No archived platform statement.** Platform CSV/PDF statements are the primary
   evidence; our rows are secondary. We store no path, no URL, no content hash.
   Fix: a `revenue_statements` table (source, period, file path, sha256, fetched_at) and
   a `statement_id` on ledger rows.
5. **Rows are mutable and there is no correction trail.** Nothing in the schema makes
   `revenue_ledger` append-only, and there is no reversal/correction convention. Bookkeeping
   evidence is expected to be non-erasable with corrections booked as new entries.
   Fix: SQLite triggers rejecting UPDATE/DELETE on the table, plus a `reverses_id` column.
6. **No customer/counterparty jurisdiction.** Whether a sale is to an Israeli or a foreign
   customer changes VAT treatment (open legal question below). We store none of it, so we
   could not answer even if we knew the rule. Fix: `customer_country`, `customer_ref`
   (pseudonymous id from the platform — never PII we do not need).
7. **No invoice/document number field.** If an invoice must be issued per sale, the ledger
   is where the invoice number and (for Israel) any allocation number would have to live.
   No column exists. Fix: `doc_type`, `doc_number`, `allocation_number` (nullable).
8. **No period/closing concept.** No tax-year or period column and no frozen closing
   snapshot, so a restated past month is silently possible. Fix: a `revenue_periods`
   table with a `closed_at` and a hash over the period's rows.

Estimated build for all eight, as a migration plus ingest changes plus tests: on the order
of 20-30 hours of agent work. It ships without the owner and without any external account.

## 3. Weak evidence: the Israeli e-invoice ecosystem

The only external evidence I obtained. GitHub repository search via the authenticated MCP
tool, run 2026-09-03. These are *search-result descriptions I actually saw*; I could NOT
open the repository contents (session allowlist blocked it), so treat every fact inside a
description as the repo author's claim, not as verified law.

- https://github.com/peleg-jpg/tax-and-finance-israeli-e-invoice — created 2026-05-11,
  updated 2026-05-11, Python, **0 stars, 0 forks**. Description: "Generate, validate, and
  manage Israeli e-invoices (hashbonit electronit) per Tax Authority (SHAAM) standards …
  request allocation numbers, validate invoice compliance … Supports tax invoice (300), …".
- https://github.com/peleg-jpg/accounting-israeli-e-invoice — created 2026-05-11, 0 stars,
  near-identical description. Both look like generated agent-skill repos by one author.
- https://github.com/peleg-jpg/n8n-hebrew-workflows — created 2026-05-11, 0 stars.
  Description names the Israeli integration surface: "**Morning (formerly Green Invoice)**,
  israeli-bank-scrapers, data.gov.il, Israeli SMS gateways, and payment processors
  (**Cardcom, Tranzila, Grow by Meshulam**)".

What this is worth: it corroborates that (a) an Israeli Tax Authority e-invoicing /
allocation-number regime is a thing developers write code against, and (b) the incumbent
invoicing API in Israel is **Morning (ex-Green Invoice)**, with Cardcom/Tranzila/Grow as
the payment rails. It proves nothing about thresholds, dates or obligations.

Searches that returned **zero** results (real negative signal about how thin the public
open-source surface is, or about this search index's scope):
`BKMVDATA openformat מבנה אחיד` · `israeli invoice green invoice API client` ·
`חשבונית ישראל invoice` · `israel VAT report accounting software`.

## 4. Open questions — the exact URLs a human or unblocked agent must open

Everything here is unknown to this scout. Do not act on memory; open these.

1. Israeli Tax Authority, e-invoicing / allocation number (חשבונית ישראל) — the obligation,
   the amount threshold, and the phase-in dates:
   https://www.gov.il/he/departments/israel_tax_authority — **blocked here**.
2. VAT registration categories and the עוסק פטור annual turnover ceiling for the current
   year (this ceiling decides whether we must issue VAT invoices at all at ₪20k/month):
   https://www.gov.il/he/service/vat-registration — **blocked**.
3. Whether services sold to foreign customers are zero-rated (the "export of services"
   rule) and what documentation that requires. Determines gap #6's urgency. Source: VAT
   Law, via https://www.gov.il/he/departments/israel_tax_authority — **blocked**.
4. Bookkeeping record-retention period and the "uniform structure" (מבנה אחיד /
   BKMVDATA + INI.TXT) export that computerised books must be able to produce on demand.
   If that export is required of us, it is a *ledger schema* requirement, not a reporting
   one, and it belongs in the migration above. Source: Income Tax Regulations
   (ניהול פנקסי חשבונות), via gov.il — **blocked**.
5. Merchant-of-record treatment: whether Paddle's MoR statements make Paddle the seller of
   record for VAT and what we must then record. https://www.paddle.com/legal — **blocked**
   (noted as blocked in the sweep brief).
6. Telegram Stars payout documentation — what statement, if any, a Stars payout produces
   for an accountant. https://core.telegram.org/bots/payments-stars — not attempted, no
   budget left.
7. Apify pay-per-event payout statements and Apify's tax documentation.
8. Whether an Israeli resident needs a registered business (עוסק) *before* first shekel or
   only above a threshold — this is the gating question for the whole colony's compliance
   and it is currently **unanswered**.

## 5. Owner blockers this criterion implies (do not assume any are done)

These are genuine one-time human/legal steps, not agent work. Catalogued, never assumed:
- Registering as an עוסק (פטור or מורשה) with the Tax Authority, if required — a human
  identity act.
- Engaging an accountant / bookkeeper. Note the constraint from MISSION.md: the owner does
  not talk to people. An accountant relationship may be an unavoidable exception or may
  need to be an async, document-only service. **Unknown whether a fully async Israeli
  accountant exists** — worth a dedicated scout when search budget exists.
- Any SHAAM / allocation-number API enrolment, if the e-invoice regime applies to us.
- Payout-account KYC per platform (already catalogued elsewhere in the colony).

## 6. Verdict for the board

The honest answer to this criterion is: **the criterion is mostly internal, not a revenue
line.** It produces one clear, high-value, ship-now piece of engineering (the audit-grade
ledger migration) and a set of legal questions this session physically could not answer.
Building a *product* on Israeli tax compliance without being able to read a single tax
authority page would be exactly the kind of confident invention the constitution forbids.

Re-run this criterion when: search budget exists, or gov.il is unblocked, or the session
allowlist permits reading GitHub repository contents.
