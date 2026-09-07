---
name: revenue-pcn874
description: Playbook for the PCN874 line — the Israeli VAT detailed-report file, validator first; the Tax Authority spec is rendered and reconciled, generator next (core).
auto-activate: false
---

# PCN874 — director playbook

**Audited ceiling: ₪600/month at twelve months** (`research/colony-sweep/CHIEF-AUDIT.md` §2.1 row 2; band
₪300–600). **Month one: ₪0.** Board decision 7.9.2026: the one new line, build #3, because its audience is
created by law — every עוסק מורשה above the reporting threshold must file this file — and not by traffic.

## What exists

`products/pcn874/`: `parsePcn874`, `validatePcn874`, a CLI (`pcn874 validate <file>`), 134 tests, and
`docs/SPEC.md` — **the record layout from the Israel Tax Authority's own circular to software houses**
(Appendix A the layout, B the representatives' alignment file, C the permitted values per document type),
rendered by `render-watch.yml` on 7.9.2026 and stored as extracted text in `research/rendered/`. Every
field cites that document by line. The three open-source implementations (`Urigo/accounter-fullstack` MIT,
`adam2314/linet3` AGPL, `RcBuilder/Scripts` no licence) are still cited, now as **corroboration**. Nothing
was copied from AGPL, unlicensed or government text; fixtures are generated from the table.

## The gate that outranks the ceiling — status 7.9.2026

**The specification is rendered and reconciled.** The gate that blocked the generator is cleared for the
layout; two things it protected are still live.

**Resolved by the document** (`docs/SPEC.md` §6): the last header field is `N(11)` so the header is 131;
the closing entry is `X` and `Z` is Appendix B's representative-file letter; `zeroOrExemptSalesAmount` is an
amount; all six input letters feed `inputsCount` and equipment inputs are a real field; a zero amount takes
`+`. The allocation-number field is settled for 2009 (zeros) by the document and for today by the H-ERP
manual, which the circular itself anticipates. **The document contradicted all three implementations once**:
the reference group is `A(4)`, letters are legal, and the old validator would have rejected a legal file.

**Still open, and no rule was invented for either:** the `reportedVat` **arithmetic** — the document defines
the field and never its computation, and nothing else does — and line endings / whether a detail-free file is
legal. Both are warnings or silence, never errors.

**Still not verified, and this is the live gate:** the circular is from **2009**, carries **no version
number**, and **no later edition of the layout has been rendered**. The two newer Hebrew documents are
vendor user manuals; neither restates the byte layout, so neither can confirm a width.
`.github/workflows/pcn874-spec-watch.yml` watches all three hashes so a new edition is noticed rather than
assumed away — **its own wording is now stale ("egress-blocked") and is the one thing this reconciliation
did not touch, because it lives outside `products/pcn874/`. Fix it in a session that owns that path.**

So: **still no "your file is compliant"**, ever. The tool says a file matches the layout in the circular and
points at the Authority's free simulator (`http://www.misim.gov.il/EmDvhmfrt/wUploadFileHeshboniotSim.aspx`)
for the acceptance question. A wrong PCN874 file is the user's VAT exposure (harm asymmetry noted by the
chief audit).

## Loop

1. **Render the spec — DONE 7.9.2026.** What is left of this step: re-run the spec-watch workflow when a
   hash changes, and if the Authority has re-issued the circular, diff the new text against `docs/SPEC.md`
   before anything ships. Never assume a new edition kept a width.
2. **Generator second, and it is now unblocked for the layout.** Spreadsheet or CSV → validated PCN874 file,
   built on the validator, fixtures from the reconciled spec. Two hard limits carry over from step 1: it may
   **not** compute `reportedVat` (no source gives the formula — take it from the user and validate nothing
   about it), and it must **not** claim the output will be accepted. Ship it pointing at the simulator.
3. **Acquisition channel, named before launch** (constraint 7): Hebrew long-tail on the statutory term,
   plus the open-source core published on GitHub/npm under the brand — the validator is the free version and
   the funnel; the generator is what is sold. **SERP pull done 7.9.2026**
   (`research/measurements/serp/2026-09-07-hebrew-calculators.md`): nine results for the statutory term,
   **zero standalone tools** — six accounting-software help pages, two mirrors of the Tax Authority's manual,
   gov.il. Verdict: channel NAMED and the best-evidenced in the pull. Two qualifications travel with it: six
   of the nine are vendors whose software already emits the file (the strongest counter-hypothesis to the
   ₪600 ceiling, and a SERP cannot settle it), and the pull is an instrument reading, not demand. The
   board's order — free validator first, count downloads — is the right test of both.
4. **Rail:** Gumroad, ILS (owner step 3). Price band from the audit: a one-time licence or a per-period
   file; test two prices. Annual before monthly.
5. **Record money only as money:** every sale through the Gumroad connector with its sale id. A download of
   the free validator is a KPI, never revenue.

## Never

Publish a rule or figure without a citation in `docs/SPEC.md`; call a file "compliant" or "accepted by the
Tax Authority"; compute `reportedVat` from a guessed formula; treat "all three implementations agree" as
authority again — the reference-group field is the proof it is not; resolve an ambiguity in the document by
picking a reading silently instead of recording both; copy code from the AGPL or unlicensed implementations,
or redistribute the Authority's document beyond the extracted text kept for citation; present the product as
an accountant or as filing on the user's behalf.
