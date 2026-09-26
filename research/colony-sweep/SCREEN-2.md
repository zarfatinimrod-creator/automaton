# Sweep 2, screened — nine candidates, nine kills, board pending — 26.9.2026

**Status: every candidate SWEEP-2.md shortlisted was killed by its screener. This is the checking tier, not a
decision.** The board (`scripts/workflows/fable-sweep-2-board.js`, item 4 of `logs/FABLE_QUEUE.md`) audits
each screener's decisive fact and may overrule it. Until then nothing below enters the portfolio — which,
with nine kills, changes nothing in the ₪20,000 arithmetic either way.

## What ran

| | |
|---|---|
| Workflow | `scripts/workflows/sweep-2-screen.js`, run `wf_cd1f24c5-b07` |
| Screeners | 9 on Opus, one per candidate, three lenses each (evidence; kill list and mission; the first stranger's money) |
| Returned | 9 of 9, no errors |
| Cost | ~2.2M tokens, 500 tool calls, 44 minutes |
| Why Opus | CLAUDE.md's fleet rule: the checking tier runs on Opus, only the chief auditor and the board on Fable. The 22.9 design put 27 screeners on Fable and the quota died in that fan-out. |
| Structured results | [`screen-2/results.json`](screen-2/results.json) (the workflow journal dies with the container) |

## The nine

Facts column: CONFIRMED / CONTRADICTED / UNVERIFIED among the load-bearing facts the screener listed.
"Clears ₪300" is the screener's reading of whether the line's ceiling could clear the per-line floor.
"New steps" counts the owner actions the screener found the candidate needs beyond the seven in
`docs/OWNER_STEPS.he.md`. The decisive fact is the screener's own text, truncated.

| Candidate | Verdict | Facts | Clears ₪300 | New steps | Decisive fact | Report |
|---|---|---|---|---|---|---|
| ממשק מעסיקים — pension-deposit file toolkit | **KILL** | 5 / 3 / 7 | no | 1 | No paying buyer is left. The candidate's own entry concedes that both non-developer segments are already served: "nearly all of them are already served: Malam, Hilan, Shekel and Rivhit emit the file inside payroll software the employer already pays for, and the pension companies run free 'מעסיקים אונליין' portals for tiny employers" (research/colony-sweep/SWEEP-2.md:44). My WebSearch (SNIPPET) independently shows … | [`pension-mimshak.md`](screen-2/pension-mimshak.md) |
| ICA-ARCHIVE — registrar change stream, archived | **KILL** | 4 / 3 / 5 | no | 3 | Every rail the candidate names is closed by a standing ruling. (1) The primary rail is a paid Apify Actor. research/colony-sweep/BOARD.md:328 closes it: "Second Apify Actor / Apify KYC / Apify pricing \| 50 / 50 / 200 stranger users in 30 days respectively … Under 10 at day 30: instrument only, permanently". That count has not started (logs/CHECKPOINT.md:135 still lists APIFY_TOKEN as outstanding), and the only base … | [`ica-archive.md`](screen-2/ica-archive.md) |
| Google OSS VRP | **KILL** | 8 / 4 / 4 | unknown | 5 | Google's only channel is a signed-in web form, and the colony cannot reach it, so every report and every triage reply needs the owner at a browser talking to Google's security team. Evidence: (1) OSS VRP rules, line 312 of raw.githubusercontent.com/google/bughunters/main/bughunters/articles/about/rules/open-source/google-open-source-software-vulnerability-reward-program-rules.md: "All bugs should be reported using … | [`google-oss-vrp.md`](screen-2/google-oss-vrp.md) |
| Paid GitHub App on Marketplace | **KILL** | 6 / 3 / 5 | unknown | 7 | GitHub makes 100 installations the condition for charging anything: "GitHub Apps should have a minimum of 100 installations" (github/docs content/apps/github-marketplace/creating-apps-for-github-marketplace/requirements-for-listing-an-app.md:72, re-fetched 2026-09-26). The candidate names no source for those installs except being found: "installs accumulate from the free listing plus the repo" (SWEEP-2.md:105). That … | [`github-marketplace-app.md`](screen-2/github-marketplace-app.md) |
| Prime Intellect bounties on Algora | **KILL** | 2 / 7 / 2 | no | 3 | The payer says the programme is over. PrimeIntellect-ai/community-environments PR #784 (author willccbb, author_association MEMBER, 2026-09-07) reads: "The bounty program closed in June 2026. `docs/contributing.md` no longer points contributors at the bounty sheet, and the merge-bot workflow that told every merged PR to claim a bounty reward is removed." Found with mcp__github__search_pull_requests … | [`primeintellect-bounties.md`](screen-2/primeintellect-bounties.md) |
| huntr AI/ML vulnerability bounties | **KILL** | 5 / 3 / 7 | unknown | 5 | Every huntr report is filed through a signed-in web form (huntr.com/bounties/disclose), and every triage exchange after it happens in the same web app. This container cannot reach huntr.com: `curl https://huntr.com/guidelines` returned "curl: (56) CONNECT tunnel failed, response 403". That leaves two ways to run the line, and both are recorded deaths. (1) The owner submits and replies at a browser for every report, … | [`huntr.md`](screen-2/huntr.md) |
| Paid Odoo module: Israeli VAT export | **KILL** | 2 / 5 / 6 | no | 3 | The scout's own settling page rendered (research/rendered/sweep2-odoo-localization.meta.json: status 200, error null) and it measures demand against the candidate. The 14 paid modules on page 1 of the Localization category carry title attributes 'Total Purchases: 1,1,7,2,2,1,1,1,1,1,12,2,1,2' (research/rendered/sweep2-odoo-localization.html:683-1101): median 1 lifetime purchase, best 12 (Indian GST Reports, $32.11, … | [`odoo-il-vat.md`](screen-2/odoo-il-vat.md) |
| PCN874 embed licence for ERP vendors | **KILL** | 2 / 8 / 5 | no | 2 | The named buyer (Israeli invoicing/ERP vendors) is the ITA circular's own addressee and has shipped the PCN874 file since 2010. The circular is addressed to "Computerized Accounts Systems Managements Program Producers" and says "The PCN874 file production must be completed by 01/01/2010", with free regulator support at "874@shaam.gov.il" (research/rendered/pcn874-gov-il-874-eng.txt:3,12,15). The market shows the … | [`pcn874-embed.md`](screen-2/pcn874-embed.md) |
| Metaculus AI benchmark bot tournaments | **KILL** | 11 / 4 / 5 | unknown | 4 | Every prize reaches the owner only through per-win paperwork he has to do himself. The source of Metaculus's own tournament-rules page says: "prize winners must sign and return any and all acceptance documents ... (a) eligibility certifications or proof of identity; (b) U.S. tax forms (such as ... IRS Form W-8BEN ...); (c) payment delivery information" (Metaculus/metaculus … | [`metaculus-bots.md`](screen-2/metaculus-bots.md) |
**The pattern.** Five of the nine die on two facts the first sweep already knew, now from new sources:
the payer is already served free (the pension institutions; the ITA's own circular to software houses), or
the channel needs the owner at a browser for every report, prize or triage reply (Google's VRP form,
huntr, Metaculus's per-season identity paperwork). Of the other four, one falls under standing rulings
(the ICA archive's Apify and x402 rails), one is a platform stating the prior-success law in its own words
(GitHub Marketplace's 100 installations), one is a payer that closed the programme (Prime Intellect, June
2026, in a PR by a member of its own organisation), and one is measured demand (on page 1 of Odoo's
Localization category, the best paid module shows 12 lifetime purchases and the median 1).

## Quote check — mechanical, `scripts/verify-quotes.py`

Run over `results.json` with the screeners' own reports excluded, so a report cannot vouch for itself:
`{"MISCITED": 2, "MISSING": 6, "NO_QUOTE": 14, "UNCHECKABLE": 55, "VERIFIED": 8}`. Most evidence cites a
command and its output (UNCHECKABLE from a file — the screeners ran live GitHub, npm and curl queries). The
eight flagged quotes, read one by one:

- **MISCITED, real (2):** "Required before any Actor can be priced…" is at `CHIEF-AUDIT.md:269` (the
  screener cited `OWNER_STEPS.he.md`); "Technical queries can be sent to e-mail: 874@shaam.gov.il" is at
  `research/rendered/pcn874-gov-il-874-eng.txt`.
- **Real, in a rendered file the checker could not match (1):** the two PCN874 circular sentences are in
  `research/rendered/pcn874-gov-il-874-eng.txt`; the third fragment is command output.
- **Command output caught as a quote (3):** fragments of `meta.json` fields, an npm listing, a `grep` line.
- **From a live fetch outside the repo (2):** the Eliyahubi/israel-registrar-mcp docstring (ICA archive) and
  line 362 of Google's OSS VRP rules on GitHub. Neither is decisive: the ICA kill rests on the standing Apify
  and x402 rulings, and the Google fact it supports (a direct payout route exists) was graded in the
  candidate's favour.

**No fabricated quote was found, and no kill rests on an unreadable one.**

## Found on the way — about lines already committed

These are not about the nine candidates, and they matter more than any of them:

1. **`oss-bounties` (₪300): does Algora allow an automated contributor at all?** The line's permission
   rests on *"Algora's terms do not prohibit agent-authored PRs"* (`groups/bounties-grants.md:133`), which
   quotes no clause. The huntr screener found a comparable autonomous project (`joyelgeorge/Taskman`) that
   killed the same venue because *"Algora's terms prohibit robotic access"* — also without a clause. Nobody
   has read the terms. Queued for render-watch (`research/rendered/urls.txt` §9); the question and what
   each answer does are in `research/measurements/algora-terms-question.md`.
2. **`oss-bounties`, supply:** the Prime Intellect screener found the payer's own statement that *"The bounty
   program closed in June 2026"* (PrimeIntellect-ai/community-environments PR #784, 7.9.2026). That lines up
   with the 22.9 measurement in `docs/REJECTED.md` — Algora-labelled bounty issues stopping after
   2026-06-22 — and names one cause of it.
3. **`pcn874` (₪600): a new entrant.** BillOS, an Israeli invoicing product on npm since 2026-09-08, exposes
   `billos vat … --file PCN874.TXT` (`screen-2/pcn874-embed.md:35-36`, `:186-188`). Invoicing products
   building the file themselves is the embed candidate's death, and it narrows the core line's buyer to
   the one SWEEP-2.md:272 already named: bookkeepers who cannot `npm install`.

## URLs the screeners named — not queued

38 URLs across the nine reports, listed so a board that wants one can find it. None is queued for
render-watch: every kill's decisive fact is already sourced (a rendered page, source code on GitHub, or the
payer's own PR), and none of these pages could reopen a candidate on its own — each report's "What would
change my mind" section needs several conditions at once. The one exception, Algora's terms, is queued
because it concerns a committed line.

- `pension-mimshak`: https://www.swiftness.co.il/%D7%9B%D7%9C%D7%9C%D7%99-%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA/
- `pension-mimshak`: https://www.fnx.co.il/takanottashlum/
- `pension-mimshak`: https://www.as-invest.co.il/interstedin/gemel/payment_and_reporting_employers/
- `pension-mimshak`: https://www.clalbit.co.il/media/brgb2lby/%D7%97%D7%95%D7%96%D7%A8-%D7%91%D7%A0%D7%95%D7%A9%D7%90-%D7%93%D7%99%D7%95%D7%95%D7%97-%D7%90%D7%97%D7%99%D7%93-%D7%95%D7%94%D7%A4%D7%A7%D7%93%D7%AA-%D7%AA%D7%A9%D7%9C%D7%95%D7%9E%D7%99%D7%9D.pdf
- `pension-mimshak`: https://www.rivhit.co.il/knowledgebase/%D7%9E%D7%9E%D7%A9%D7%A7-%D7%9E%D7%A2%D7%A1%D7%99%D7%A7%D7%99%D7%9D-%D7%93%D7%99%D7%95%D7%95%D7%97-%D7%A9%D7%95%D7%98%D7%A3-%D7%94%D7%A4%D7%A7%D7%AA-%D7%A7%D7%95%D7%91%D7%A5-xml/
- `pension-mimshak`: https://www.swiftness.co.il/employers/shotef-dm/
- `ica-archive`: https://data.gov.il/api/3/action/datastore_search?resource_id=28780ab5-3ef1-44c7-8377-da82c0aa6781
- `ica-archive`: https://data.gov.il/api/3/action/package_search?fq=organization:ministry_of_justice&rows=1000
- `ica-archive`: https://content.justice.gov.il/Corporations/ica-datagov-changes.pdf
- `ica-archive`: https://www.bdicoface.co.il/service/corporations-authority/
- `google-oss-vrp`: https://bughunters.google.com/report
- `google-oss-vrp`: https://go.dev/security/policy
- `google-oss-vrp`: https://bughunters.google.com/blog/ossvrp-rule-updates-2026
- `google-oss-vrp`: https://blog.google/security/vrp-2025-year-in-review/
- `github-marketplace-app`: https://github.com/orgs/community/discussions/174681
- `github-marketplace-app`: https://github.com/orgs/community/discussions/190613
- `github-marketplace-app`: https://github.com/orgs/community/discussions/192774
- `primeintellect-bounties`: https://www.primeintellect.ai/blog/scaling-environments-program
- `huntr`: https://huntr.com/guidelines/
- `huntr`: https://huntr.com/faq
- `huntr`: https://huntr.com/new-huntr-faq
- `huntr`: https://huntr.com/bounties/hacktivity
- `huntr`: https://huntr.com/challenges/3AjanuyEaXoNr6ySHpyo6L/v1/rules
- `huntr`: https://unit42.paloaltonetworks.com/frontier-ai-vulnerability-burst/
- `huntr`: https://docs.stripe.com/connect/cross-border-payouts
- `odoo-il-vat`: https://apps.odoo.com/apps/faq
- `odoo-il-vat`: https://apps.odoo.com/apps/vendor-guidelines
- `odoo-il-vat`: https://apps.odoo.com/apps/modules/19.0/ksef_integration
- `odoo-il-vat`: https://apps.odoo.com/apps/modules/19.0/oe_ksef
- `pcn874-embed`: https://help.icount.co.il/reports/pcn874/
- `pcn874-embed`: https://assets.kpmg.com/content/dam/kpmg/il/pdf/vat_software-houses-ENG.pdf
- `pcn874-embed`: https://www.gov.il/he/pages/tax-vat-online-invoice-reporting
- `metaculus-bots`: https://forms.gle/aQdYMq9Pisrf1v7d8
- `metaculus-bots`: https://www.metaculus.com/futureeval/participate/
- `metaculus-bots`: https://www.metaculus.com/tournament/fall-futureeval-2026/
- `metaculus-bots`: https://www.metaculus.com/notebooks/38928/ai-benchmark-resources/
- `metaculus-bots`: https://www.metaculus.com/help/scores-faq/#tournaments-section
- `metaculus-bots`: https://metaculus-web-media.s3.us-west-2.amazonaws.com/Fall2025-AIB-Participant-Survey-Google-Forms.pdf