---
name: revenue-pcn874
description: Playbook for the PCN874 line — the Israeli VAT detailed-report file, validator first, no legal figure until the spec is rendered (core).
auto-activate: false
---

# PCN874 — director playbook

**Audited ceiling: ₪600/month at twelve months** (`research/colony-sweep/CHIEF-AUDIT.md` §2.1 row 2; band
₪300–600). **Month one: ₪0.** Board decision 7.9.2026: the one new line, build #3, because its audience is
created by law — every עוסק מורשה above the reporting threshold must file this file — and not by traffic.

## What exists

`products/pcn874/`: `parsePcn874`, `validatePcn874`, a CLI (`pcn874 validate <file>`), 88 tests, and
`docs/SPEC-FROM-SOURCES.md` — the record layout rendered from **three independent open-source
implementations** (`Urigo/accounter-fullstack` MIT, `adam2314/linet3` AGPL, `RcBuilder/Scripts` no licence),
with every field cited to a repo, path and line, and the **seven places the sources disagree** recorded as
findings rather than resolved silently. `reportedVat` has no rule on purpose: the three sources give three
formulas. Nothing was copied from AGPL or unlicensed code; fixtures are generated.

## The gate that outranks the ceiling

**The Israel Tax Authority's specification has not been rendered.** gov.il and both vendor mirrors are
egress-blocked from the container. "Three implementations agree" is not "the Tax Authority says", and the
README, the CLI output and `products/README.md` all say so. `.github/workflows/pcn874-spec-watch.yml` fetches
the official document from a session with egress and records its hash; until a session has read it against
`SPEC-FROM-SOURCES.md`, **no legal figure ships**: no "your file is compliant", no generator whose output a user
would upload. A wrong PCN874 file is the user's VAT exposure (harm asymmetry noted by the chief audit).

## Loop

1. **Render the spec** (first thing, every session with egress): run the spec-watch workflow or read the
   mirrored PDF; reconcile each of the seven disagreements; update `SPEC-FROM-SOURCES.md` with the official
   citation; only then remove the "unverified" wording.
2. **Generator second:** spreadsheet or CSV → validated PCN874 file, built on the validator, with fixtures
   from the reconciled spec. Not before step 1.
3. **Acquisition channel, named before launch** (constraint 7): Hebrew long-tail on the statutory term
   (one SERP pull to `research/measurements/serp/`), plus the open-source core published on GitHub/npm under
   the brand — the validator is the free version and the funnel; the generator is what is sold.
4. **Rail:** Gumroad, ILS (owner step 3). Price band from the audit: a one-time licence or a per-period
   file; test two prices. Annual before monthly.
5. **Record money only as money:** every sale through the Gumroad connector with its sale id. A download of
   the free validator is a KPI, never revenue.

## Never

Publish a rule or figure without a citation in `SPEC-FROM-SOURCES.md`; call a file "compliant" or "accepted
by the Tax Authority"; resolve a source disagreement by picking the majority silently; copy code from the AGPL
or unlicensed implementations; present the product as an accountant or as filing on the user's behalf.
