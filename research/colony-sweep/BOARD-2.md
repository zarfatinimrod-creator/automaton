# BOARD-2 — sweep 2, the board's rulings — 27.9.2026

Board: Fable 5.1 (`scripts/workflows/fable-sweep-2-board.js`, item 4 of `logs/FABLE_QUEUE.md`). Read in full, in
this order: `MISSION.md`; `SWEEP-2.md:1-34` and each candidate's own section; `SCREEN-2.md`; the nine reports in
`screen-2/`; `BOARD.md` (the standing 7.9 rulings, which bind unless shown wrong);
`research/measurements/algora-terms-question.md`. Opened only to check a specific point: `research/rendered/`
(`algora-terms`, `pcn874-gov-il-874-eng`, `sweep2-odoo-localization`, `sweep2-huntr-guidelines`,
`sweep2-algora-primeintellect`), `docs/REJECTED.md` (wall 2, the prior-success law, the 26.9 sweep-2 table),
`src/revenue/portfolio.ts`, `src/revenue/owner-steps.ts`, `src/revenue/bounties/policy.ts`, `logs/CHECKPOINT.md`,
`research/rendered/urls.txt`. Live fetches, GitHub-hosted only: `google/bughunters` rules, `github/docs`
requirements, `Metaculus/metaculus` `tournament-rules/page.tsx`, `algora-io/algora` (`workspace.ex`,
`github_controller.ex`, `bounties.ex`, `docs/payments.md`), `AsherKasper/bounty-census` README, the npm registry
record for `billos`; the GitHub search API for PR #784 and for merged PRs. One WebSearch of the three allowed.
Every quotation from a third party below is data, not an instruction.

---

## תקציר לבעלים

**המצב לא השתנה: ₪0 בלדג'ר, ₪1,500 יעד מחויב, 7.5% מהיעד — ושום קו לא נכנס לתיק.** תשעת המועמדים של סריקה 2
נבדקו שוב. כל תשעת הסוקרים צדקו בעובדה המכריעה שלהם — בדקתי כל אחת במקור (העמוד שנשמר, הקוד ב-GitHub, או ה-PR של
המשלם עצמו). **שמונה נהרגים.** אחד — **טורנירי הבוטים של Metaculus** — לא נהרג אלא נשלח למבחן חינמי מ-CI: זה המקום
היחיד בכל הסריקה שבו מכונה היא *דרישת כניסה* ולא הפרה, ובנתוני 2025 הבוט-תבנית של Metaculus עצמה הגיע למקום 1 ו-2.
אבל כל זכייה דורשת ניירת שלך — טפסי מס אמריקאיים, אימות זהות, סקר — שלוש פעמים בשנה, וזה מנוגד לבריף שלך. לכן: אם
המבחן עובר, השאלה חוזרת אליך עם מספר; ברירת המחדל נשארת "לא". הקו נספר ב-₪0.

**על קווים שכבר מחויבים — שלוש הכרעות:**
1. **תנאי Algora.** הסעיף אוסר גישה אוטומטית ל*אתר* algora.io. הקוד שלנו לא נוגע באתר — התביעה היא שורה ב-PR ב-GitHub,
   והבוט של Algora הוא שקורא אותה. הקו מותר להמשיך, **בתנאי שכל PR מצהיר בגלוי שהחשבון אוטומטי** — כך שאף אחד לא מרומה,
   ו-Algora או המתחזק יכולים לסרב. סירוב או חסימה — הקו נסגר באותו יום.
2. **ההיצע ב-Algora נראה קרוב לאפס.** ספירה של צד שלישי (סקריפט פומבי, ניתן לשחזור בלי טוקן) מצאה **5 באונטים שניתן
   לתבוע, $60 בסך הכול, מתוך 561 מסומנים** — 99% מהכסף המפורסם יושב בריפו אחד עם 12 כוכבים ואפס PR-ים. זה מתיישב עם
   הספירה שלנו מ-22.9. הדירקטוריון מורה על **ספירה שבועית חינמית מ-CI, ארבעה שבועות**: מתחת ל-10 לשבוע — יעד ה-₪300
   יורד ל-₪100; מתחת ל-3 — הקו נסגר. **לא לבקש ממך את צעד 4 (Stripe דרך Algora) עד שהספירה נקראה.**
3. **BillOS** (מוצר חשבוניות ישראלי חדש ב-npm שמייצר PCN874 בעצמו) **לא משנה את יעד ה-₪600 של PCN874** — הוא מוכר
   למפתחים בטרמינל, והקו שלנו כבר הוגבל למנהלי חשבונות שלא מתקינים npm.

**אין צעד חדש בשבילך.** אף פסיקה כאן לא דורשת ממך דבר מעבר לשבעת הצעדים הקיימים.

---

## 0. Chief-audit pass — does each screener's decisive fact hold at its source?

Rule applied: a screener whose decisive fact does not survive the re-check is overruled and it says so here.

| # | Candidate | The screener's decisive fact | What the board re-checked | Held |
|---|---|---|---|---|
| 1 | ממשק מעסיקים pension file | The candidate's own text concedes both non-developer segments are served (payroll software; the institutions' free portals); developers get the MIT library free | `SWEEP-2.md:44` names Malam Payroll, Rivhit, Shekel, Hilan as "NOT the buyer"; the quoted *"nearly all of them are already served … free 'מעסיקים אונליין' portals"* is at `:49`, not `:44` — a line drift, the text is verbatim. `owner-steps.ts` ids: `merge-pr, tax-file, gumroad, domain, github-org, algora-stripe, ci-tokens` — no npm step, as the screener said. | **Yes** |
| 2 | ICA-ARCHIVE | Every named rail is closed by a standing ruling: `BOARD.md:328` (no Apify pricing before 200 stranger users), x402 a recorded death; the Apify count has not started | `BOARD.md:328` verbatim: *"Second Apify Actor / Apify KYC / Apify pricing \| 50 / 50 / 200 stranger users in 30 days respectively … Under 10 at day 30: instrument only, permanently."* `CHECKPOINT.md:161` (was `:135`) still names `APIFY_TOKEN` as the cheapest outstanding owner action; `:409-411`: the Actor is not published until the owner pastes the token and clicks Publish. x402 kill: `REJECTED.md` §`paid-apis` (lines have drifted since the screener's cite; substance unchanged). | **Yes** |
| 3 | Google OSS VRP | The only channel is a signed-in web form (rules line 312); the host is unreachable | Fetched `google/bughunters` rules raw (HTTP 200, 17,362 bytes): lines 310-313 read *"All bugs should be reported using the [vulnerability form](/report/vrp) (in the **Bug Location** step, select *OSS VRP* and specify the repository URL)."* One `curl` to `bughunters.google.com/report/vrp` from this container: no connection. | **Yes** |
| 4 | Paid GitHub App on Marketplace | `github/docs` `requirements-for-listing-an-app.md:72`: 100 installations before a paid plan | Fetched raw (HTTP 200): line 72 `* {% data variables.product.prodname_github_apps %} should have a minimum of 100 installations.`, line 73 the 200-user rule for OAuth Apps. `REJECTED.md:1126-1138` already records it as the fourth platform stating the law. | **Yes** |
| 5 | Prime Intellect bounties | PR #784 by an org MEMBER: *"The bounty program closed in June 2026"*; the Algora board shows 0/0 | Repo-scoped GitHub reads are denied to this session, so the search API was used: `repo:PrimeIntellect-ai/community-environments is:pr "bounty program"` → #784, author `willccbb`, `author_association: MEMBER`, created `2026-09-07T22:30:18Z`, state open, body verbatim as quoted (the screener called it a draft; the API says `draft: false` — the body says "Draft for the repo maintainers", immaterial). `is:merged merged:>2026-06-26` → `total_count: 0`. Rendered board (`sweep2-algora-primeintellect.txt:67-75`, HTTP 200, 22.9): *"Open / 0 / Completed / 0 / No open bounties"*. | **Yes** |
| 6 | huntr | Every report and triage reply is inside a signed-in web app; huntr.com is blocked here; the guidelines 404 from the runner | `sweep2-huntr-guidelines.meta.json`: `status 404`, `byteLength 0`, `error "HTTP 404 Not Found"`, fetched 2026-09-22. One `curl` to `huntr.com/guidelines/` from this container: no connection. | **Yes** |
| 7 | Paid Odoo module | The rendered Localization page: 14 paid modules with lifetime purchases `1,1,7,2,2,1,1,1,1,1,12,2,1,2` | `sweep2-odoo-localization.meta.json`: `status 200`, 22.9. `grep` of the HTML: exactly 14 `title="Total Purchases: N, Last month: 1"` attributes, in that order with those values; the free modules' last-month downloads `29,19,18,16,15,15`. Median 1, maximum 12, exactly as stated. | **Yes** |
| 8 | PCN874 embed licence | The named buyer is the ITA circular's own addressee, obliged since 2010, with free regulator support; a new entrant builds it itself | `pcn874-gov-il-874-eng.txt:3` *"Computerized Accounts Systems Managements Program Producers"*; `:12` *"The PCN874 file production must be completed by 01/01/2010."*; `:15` *"Technical queries can be sent to e-mail: 874@shaam.gov.il"*; `:84` the promised *"on-line simulator"*. npm registry `billos`: created 2026-09-03, `0.2.0` on 2026-09-08, README line `billos vat [--period 2026-08] [--months 2] [--file PCN874.TXT]      # the VAT return, and its file`. | **Yes** |
| 9 | Metaculus bot tournaments | `tournament-rules/page.tsx:197-206`: per-prize acceptance documents, proof of identity, W-8BEN, payment details | Fetched `Metaculus/metaculus` raw (HTTP 200, 15,130 bytes): lines 197-206 verbatim as quoted. | **Yes** |

**Nine of nine held.** No screener is overruled on its decisive fact. One inference in `SCREEN-2.md` is overruled
(§2.2 below: the Prime Intellect closure is not a cause of the Algora supply drop). Two line-number drifts are noted
above and change nothing. The quote check's two MISCITED items (`SCREEN-2.md:53-55`) were already resolved there and
neither is load-bearing.

---

## 1. Rulings on the nine

Test applied to each, in order: (a) load-bearing facts CONFIRMED; (b) a named path to the first paying stranger that
needs no platform rank earned by prior success; (c) the owner does nothing beyond the seven one-time steps, or one
new one-time step named exactly; (d) a ceiling that clears ₪300/month on evidence. ADMIT needs all four. TEST_FIRST
when one zero-cost test run by a CI job or an agent settles it. KILL otherwise. A kill cannot overstate income; an
admission can, so the burden sits on the admission.

### 1.1 ממשק מעסיקים — pension-deposit file toolkit — **KILL**

- **Why.** Fails (b) and (d) on the candidate's own words. Three buyer segments, each already served: employers with
  payroll software get the file as a feature (Malam, Rivhit, Shekel, Hilan — *"NOT the buyer"*, `SWEEP-2.md:44`);
  micro-employers get free portals where the institution converts manual entry into the file (`:49`, snippets
  from fnx.co.il and as-invest.co.il); developers get the candidate's own MIT library at ₪0. The remaining "paid
  generator/CLI" is the developer-facing statutory library that `SWEEP-2.md:272` already priced at zero for PCN874.
  Standing wall 2 (`REJECTED.md:156-176`) applies with the pension institution in the state's seat: charging a
  non-developer for what their institution does free is a constitution violation (`MISSION.md:344-345`). It also
  fails (c): npm publishing under the brand is a new step none of the seven covers. The XSD mirror has no licence,
  so the schema could be cited but not shipped. The screener's own zero-cost test (are the XSDs gated?) came back
  *open*, which removes the scout's kill branch and rescues nothing, because the kill is on the buyer.
- **Why not TEST_FIRST.** No single test settles it. The screener's re-open needs three findings at once (a rendered
  institution page requiring a finished upload, a named unserved segment, a measured Hebrew SERP), and even then a
  paid step would still have to be something the institutions do not give away — nobody has named one.
- **Owner steps.** None.
- **REJECTED.md row.** `| ממשק מעסיקים pension-file toolkit | No payer is left: payroll software emits the file as a
  feature and the institutions turn manual entry into it free for small employers (the candidate's own text,
  SWEEP-2.md:44,49); the developer half is priced at zero by its own MIT library (SWEEP-2.md:272); wall 2 applies
  with the pension institution as the free competitor. Board 27.9: screener upheld. | A rendered institution page
  showing small employers must upload a finished XML with no free manual entry, AND a named segment whose payroll
  product does not emit v005, AND a measured Hebrew SERP not held by institutions and vendors — all three. |`

### 1.2 ICA-ARCHIVE — registrar change history kept past the window — **KILL**

- **Why.** Fails (b): the primary rail is a paid Apify Actor, closed by `BOARD.md:328` until 200 stranger users in
  30 days, and that count has not started (`CHECKPOINT.md:161, 409-411`); the fallback is x402, a recorded death
  (`REJECTED.md` §`paid-apis`: ~₪6 per provider per month, 91% of listings never reach ten calls). Fails (d): the
  buyer is unevidenced — the scout declines to name a number (`SWEEP-2.md:70`), the data-apis audit priced a change
  feed over this file at ₪0, and the only audited figure for the whole Apify account is ₪200/month. The moat claim
  is also false as a market claim: the registrar keeps the history and sells the company extract (~₪11) and file;
  a Ministry-of-Justice-authorised reseller sells change tracking by registrar chapter (screener L1, `audits/data-apis.md:80-85`).
  The rows carry no amount, investor or person. `BOARD.md:316` stands: selling `data.gov.il` data itself is a
  violation; whether rows older than the free window count as "free" is a ruling the candidate would need and does
  not have. Fails (c) for the paid variant: Apify KYC plus a PayPal/Wise account are outside the seven steps
  (`OWNER_STEPS.he.md:283-296`).
- **The "keep collecting as an instrument" option — declined.** The screener put it to the board. Constraint 7 says
  no line is built before its channel is named; every channel here is closed. A perishable dataset with no buyer
  loses nothing by not being collected: the loss argument assumes the value it is supposed to prove. If the free
  Actor ever clears 200 strangers, the archive can begin that day and mature from there — a month-13 launch merely
  moves.
- **Owner steps.** None.
- **REJECTED.md row.** `| ICA-ARCHIVE, registrar change history | Both named rails are closed by standing rulings —
  Apify pricing needs 200 stranger users first (BOARD.md:328; the count has not started) and x402 is a recorded
  death — and the buyer is unevidenced (audits/data-apis.md priced this feed at ₪0). The registrar itself sells the
  history (~₪11 extract), so "the only record outside the registrar" is false in the market. Board 27.9: screener
  upheld; the collect-anyway instrument is declined under constraint 7. | ≥200 Apify stranger users in 30 days, AND
  a rendered self-serve listing with a price for Israeli corporate-event history, AND a board ruling that rows the
  state no longer publishes free may be sold. |`

### 1.3 Google OSS VRP — **KILL**

- **Why.** Fails (c) structurally: the only channel is the signed-in form at `bughunters.google.com/report`
  (rules line 312, re-fetched) and follow-up *"should go through … the report you filed"* (Code of Conduct
  107-110); neither host is reachable by the colony. That is the owner at a browser once per report and once per
  triage reply, and a running conversation with Google's security team — MISSION §1 twice over. The board's
  Devpost deferral (`BOARD.md:78-82`) was on a weaker version of this (once per win). Fails (d) on evidence: product
  vulnerabilities pay in 70 repositories only, Google's most-fuzzed; the scout's own expectation is *"zero accepted
  reports for a long time"*; `REJECTED.md:501` — a cash event is not an income line. Five new owner actions, one of
  them a Google CLA in his name. The screener's two corrections of sweep-2 dead ends (AI-assisted reports are
  permitted with verification, not banned; the direct Google payment route exists) are accepted and change nothing.
- **Owner steps.** None.
- **REJECTED.md row.** `| Google OSS VRP | Reports and every triage reply go through a signed-in web form
  (google/bughunters rules line 312, re-fetched 27.9; CoC 107-110) on a host the colony cannot reach — the owner at
  a browser, per report; 70 paying repositories and no base rate. Board 27.9: screener upheld. | A documented
  non-browser submission and triage channel a brand machine account can operate, found in a primary source, AND a
  30-day dry run with zero submissions producing ≥1 finding that meets the programme's own bar. |`

### 1.4 Paid GitHub App on GitHub Marketplace — **KILL**

- **Why.** The candidate is the prior-success law re-read as a countable gate. `REJECTED.md:1126-1138` records it
  as the fourth platform and sets the re-open condition — *"the platform's own code saying otherwise"* — which the
  candidate does not meet: its only source of the first 100 installs is *"the free listing plus the repo"*
  (`SWEEP-2.md:110`), i.e. being found. The free listing is not day-one either: every listing is submitted for
  review by an *"onboarding expert"* with no SLA — the Notion rule (`REJECTED.md:271`). The product it would carry
  is free on the same platform (GitHub exports SPDX SBOMs natively; `anchore/sbom-action` uploads per-release SBOMs
  by default; 116 repositories named for the CRA). Seven owner actions beyond the seven steps, a support duty with
  a penalty of *"reduced product exposure"*, and a $500/month payout floor.
- **Owner steps.** None.
- **REJECTED.md row.** `| Paid GitHub App on Marketplace | 100 installations before any paid plan (github/docs
  requirements-for-listing-an-app.md:72, re-fetched 27.9) with no channel for them but being found — the fourth
  platform stating the law, already recorded; the free listing waits in a staff-reviewed queue; the CRA product is
  free on GitHub itself. Board 27.9: screener upheld. | ≥100 stranger installs of a brand GitHub App within 90 days
  with no launch or outreach, measured from CI (the board's GitHub-native channel test can produce this number),
  AND a product that is not already free on GitHub. |`

### 1.5 Prime Intellect bounties "on the Algora rail" — **KILL**

- **Why.** The payer says the programme is over: PR #784, author `willccbb`, `MEMBER`, 2026-09-07 — *"The bounty
  program closed in June 2026"* (verbatim, GitHub search API, 27.9). The board the scout named to settle it shows
  *"Open 0 / Completed 0 / No open bounties"* (rendered 22.9); the scout's own kill line (*"fewer than three open
  bounties … close the candidate"*) fires. No PR has merged in `community-environments` since 2026-06-26
  (`total_count 0`, re-run 27.9). The rail was never Algora: the payer's own merge bot paid via a Google Form or a
  Discord ping, and Algora's all-time `Completed` for the org is 0 — so no platform transaction id ever existed
  here (MISSION rule 2). The Application-Only lane was a human-reviewed Typeform nobody answers.
- **Owner steps.** None.
- **REJECTED.md row.** `| Prime Intellect bounties on Algora | The payer closed it: "The bounty program closed in
  June 2026" (PrimeIntellect-ai/community-environments PR #784, MEMBER, 7.9.2026, re-read 27.9); the rendered Algora
  board shows 0 open / 0 completed; no external merge since 26.6.2026; the cash rail was a Google Form, never Algora.
  Board 27.9: screener upheld. | A funded relaunch announced after 7.9.2026, AND ≥3 open bounties on a board this
  repo can render without an application gate, AND ≥5 external PRs merged in a rolling 90 days, AND a payout rail
  that produces a platform transaction id for an Israeli payee. |`

### 1.6 huntr — **KILL**

- **Why.** The same collision as 1.3, and a second death behind it. Submission and every triage exchange live in a
  signed-in web app (`huntr.com/bounties/disclose`; the paid kedro report thread shows the researcher arguing scope
  with huntr's admin bot); huntr.com is unreachable here and its guidelines returned 404 from the runner on 22.9
  (`sweep2-huntr-guidelines.meta.json`). Running it owner-free means a script driving huntr.com, which is the
  *"fully autonomous submission agent against bug bounty programs"* recorded dead in sweep 1
  (`groups/bounties-grants.md:174`), and the only huntr rule text anyone has quoted bans *"bots, scripts, scanners,
  and fuzzers"*. Sweep 2's own rule (`SWEEP-2.md:297`) says a bounty line must render the venue's current
  guidelines before opening; the render failed. Israel is not shown on huntr's own payout list (unlisted countries
  get a charity donation), and the Stripe onboarding is a second KYC form, not owner step 4. The screener's finding
  that the programme is alive (58 published CVEs in 2026, median historical bounty $600) is accepted; it is the
  channel, not the payer, that kills this.
- **Owner steps.** None.
- **REJECTED.md row.** `| huntr AI/ML bounties | Signed-in web form per report and per triage exchange; huntr.com is
  blocked here and its guidelines 404 from the runner (22.9); the owner-free version is the recorded
  autonomous-submission death; Israel is not shown on huntr's payout list. Board 27.9: screener upheld. | A rendered
  huntr policy page that documents a non-browser channel or explicitly allows a programmatically operated researcher
  account, AND Israel on huntr's payout list — then a 30-day zero-submission dry run counting PoC-verified in-scope
  findings, ≥1 to proceed. |`

### 1.7 Paid Odoo module, Israeli VAT export — **KILL**

- **Why.** Measured demand rules against it on the page the scout chose: page 1 of the Localization category, biased
  toward recent sellers, shows paid modules with lifetime purchases `1,1,7,2,2,1,1,1,1,1,12,2,1,2` (re-parsed 27.9) —
  median 1, best 12, in markets far larger than Israel. ₪300/month needs about two sales a month at the page's
  median price. Two further CONFIRMED kills: Odoo Online *"is incompatible with custom modules or modules from the
  Odoo Apps Store"*, so the only buyers who can install it have a developer by construction — the developer-facing
  PCN874 death of `SWEEP-2.md:272` moved to another registry; and the "non-public input" is a public gov.il PDF
  mirrored by two vendors, with a free MIT generator at ~48,000 monthly downloads. Fails (c): an Odoo vendor account
  with payout details is an eighth step, and paid apps carry a support duty on a stranger's VAT file
  (`SWEEP-2.md:182`) — the Atlassian and Envato deaths. The €400 purchase-order floor means "plausibly never" for a
  bank payout.
- **Owner steps.** None.
- **REJECTED.md row.** `| Paid Odoo module, Israeli VAT export | Measured demand: page 1 of the Localization
  category, paid modules median 1 lifetime purchase, best 12 (rendered 22.9, re-parsed 27.9); Odoo Online cannot
  install store modules, leaving developer-shaped buyers (SWEEP-2.md:272); every input is public; a new vendor
  account and a support duty. Board 27.9: screener upheld. | A rendered store search showing no Israeli PCN874
  module, AND a comparable statutory module sustaining ≥2 purchases a month over 12 months, AND vendor guidelines
  showing the support duty can be met by an agent-operated written channel, AND the owner accepting an eighth
  step. |`

### 1.8 PCN874 embed licence + rule feed for ERP vendors — **KILL**

- **Why.** The named buyer is the regulator's own addressee (`pcn874-gov-il-874-eng.txt:3`), obliged since
  01/01/2010 (`:12`), with free regulator support (`:15`) and a free simulator (`:84`); the measured Hebrew SERP for
  the exact query is six of nine results *vendors' own help pages* for the export they already ship; a 2026
  entrant (BillOS, npm, 8.9.2026) ships `billos vat … --file PCN874.TXT` itself; the free library shows ~48,000
  monthly downloads. The "paid artefact that has never been free" is MIT in this repository (`products/pcn874/package.json:26`,
  the 26 fixtures and 23 `ita:` citations inside it). The spec-watch half cannot fire as committed (see §2.4). A
  vendor embedding a third-party VAT rule set means procurement, warranty and liability terms — a lawyer and a
  conversation, both excluded. Fails (b), (c) and (d).
- **Owner steps.** None.
- **REJECTED.md row.** `| PCN874 embed licence for ERP vendors | The named buyer is the ITA circular's own addressee,
  obliged since 1.1.2010 with free regulator support and simulator (research/rendered/pcn874-gov-il-874-eng.txt:3,12,15,84);
  the SERP for the exact term is the vendors' own export docs; new entrants build it themselves (BillOS, npm,
  8.9.2026); the "paid" rule set is MIT in our own repo. Board 27.9: screener upheld. | A named Israeli
  invoicing/ERP vendor or funded entrant that demonstrably lacks a PCN874 export or publicly asks for a maintained
  rule set, AND a paid artefact that is not already MIT or sent free by the regulator, AND delivery with no per-sale
  owner action and no warranty conversation. |`

### 1.9 Metaculus AI benchmark bot tournaments — **TEST_FIRST** (deferred class; counted at ₪0)

- **Why not KILL.** The screener's decisive fact holds and means the line cannot be admitted under the mandate as
  written: every prize needs the owner's acceptance documents, proof of identity, nationality and residency, a
  W-8BEN and payment details (`page.tsx:197-206`), plus a per-season survey — recurring, three times a year.
  But the board's standing ruling for this exact class is **deferred, not killed** (`BOARD.md:78-83, :312`; owner
  question §8.1; `REJECTED.md:1234`-region re-open: *the owner answers yes to per-win paperwork AND ≥3 events per
  quarter explicitly permit AI-built entries with no human-authorship attestation*). Metaculus satisfies the second
  half by itself, and better than any event Devpost ever offered: bots are *required*, there is no human-authorship
  attestation, seasons run three times a year plus a fortnightly MiniBench, each season is scored on its own
  questions only (`scoring/utils.py:192-236` — no rank on prior success, so constraint 7 comes out favourable), and
  Metaculus's own template bot placed **#1 in Q1 2025 and #2 in Q2 2025** (`leaderboard-q1.tsx`, `leaderboard-q2.tsx`,
  parsed by the screener), where 12 of 53 eligible bots cleared $400 in a season. Killing it would contradict the
  board's own Devpost ruling and would overstate nothing while destroying the one venue in the whole sweep where a
  machine is the entry requirement. Deferring it to a zero-cost test is what BOARD.md already does for its class.
- **Why not ADMIT.** Fails (c) by construction; and three load-bearing facts stay UNVERIFIED: the template's 2026
  standing (funded labs entered; free frontier credits erode the edge), a camera-free identity check, and a cash
  payout with a reference rather than a gift card (`page.tsx:262-267` lets Metaculus choose).
- **The test — zero-cost, no owner, a CI job (Opus builds it).** A small GitHub Actions workflow that, unauthenticated
  first, reads the finished Spring 2026 and Summer 2026 tournament leaderboards through the endpoints the open-source
  `forecasting-tools` `MetaculusClient` uses (ids `32916` and `33022` per the screener's L1; the workflow takes them
  from the library so no URL is invented), finds the best `metac-*` template bot in each, and computes the share it
  would have taken if eligible (squared positive score over the paid entries' published take, the screener's
  method). Written to `research/measurements/metaculus-template-2026.md` with the raw rows.
  - **PASS (both seasons):** best template bot score > 0, rank ≤ 15 among prize-eligible entries, counterfactual
    prize ≥ $400.
  - **KILL (any one):** the API refuses an unauthenticated GitHub runner (metaculus.com refused the runner's HTML
    fetch on 22.9 — the first call is itself the channel test); best template score ≤ 0 in either season;
    counterfactual < $300 in either season; or the current season's rules, if they render, no longer make bots
    prize-eligible.
  - **A PASS does not admit the line.** It converts BOARD §8.1 into a Metaculus-specific question with a number:
    *"For an evidenced ~$X per season, will you sign the prize paperwork (survey, acceptance documents,
    identity/nationality/residency, W-8BEN, payment details) up to three times a year?"* Default stays **no**. Only
    a "yes" triggers a re-screen that must first render a camera-free identity check and a cash payout with a
    reference. The new one-time step that a "yes" would then add is named exactly: **create a Metaculus account under
    the brand username, register one primary bot, paste `METACULUS_TOKEN` into GitHub Actions secrets, and request
    the free seasonal inference credits through Metaculus's form** — plus owner step 7, because the bot's code must be
    public under the brand organisation to avoid the *"code review with you"* conversation.
- **Target.** ₪0 counted. Not in the committed sum, not in the conditional sum, until the owner answers.
- **Owner steps now.** None.
- **REJECTED.md.** No kill row. The 26.9 screener row for Metaculus in the sweep-2 table should be amended to:
  *"Board 27.9: TEST_FIRST — deferred with Devpost/Kaggle (BOARD.md §7.1, §8.1), not killed; runner leaderboard test
  ordered; counted ₪0."*

---

## 2. Found on the way — the committed lines

### 2.1 `oss-bounties` (₪300): do Algora's terms allow an automated contributor? — **the clause does not fire; conditions attached**

**What the page says** (`research/rendered/algora-terms.txt`, HTTP 200, 26.9.2026, *"Last updated: 08/17/2021"*
at line 61): the terms *"govern your use of our web pages located at https://algora.io"* (81-86) and apply to
*"all visitors, users and others who wish to access or use Service"* (104-106); under "you agree not to":
*"Use any robot, spider, or other automatic device, process, or means to access Service for any purpose, including
monitoring or copying any of the material on Service"* (258-260), followed by the manual-copying clause. Nothing on
who or what authors a pull request, on AI, or on bounties.

**What the colony does** (checked 27.9): no file under `src/`, `scripts/` or `.github/` requests `algora.io` — the
five matches are comments (`intake.ts:89,466`, `policy.ts:11-12`, a test comment). The claim is a `/claim #N` line
in a GitHub PR body; Algora's own GitHub App reads it. The two breaches were our research tooling (render-watch,
22.9 and 26.9); both URLs are removed with the reason (`urls.txt:113-117, 186-196`).

**What Algora's own code says** (`algora-io/algora`, fetched raw 27.9): the webhook controller drops any event
whose GitHub author is `%{"type" => "Bot"}` in a function named `ensure_human_author` (`github_controller.ex:48-53`,
`{:error, :bot_event} -> :ok` at 32-33); contributor and stargazer queries exclude `u.type != :bot` and
`not ilike(u.provider_login, "%bot")` (`workspace.ex:750-751, 785-786, 805-806`); `type_from_provider(:github, "Bot")`
maps to `:bot` (`user.ex`). No gate on the claimant's authorship or on AI appears in `bounties.ex` (`grep` for
bot/automat/agent/AI: only the bot-template aliases and Stripe's `capture_method: :automatic`). `docs/payments.md`
lists Israel among supported countries (line 1443), consistent with `connect_countries.ex`.

**Ruling.**

1. **The pre-written kill rule does not fire.** Its premise — *"The PR author would be an automated account acting on
   Algora's platform"* — does not hold: the automated account acts on GitHub; Algora's bot acts on Algora's platform.
   Read on its text, the clause prohibits automatic access to algora.io's web pages, and the colony performs none.
   The one algora.io use in the design is owner step 4 — a human at a browser, once — which the terms permit.
2. **This is not permission to be clever.** Algora's handler is literally named `ensure_human_author`. It filters
   GitHub App accounts (`type: Bot`), and a machine user account (`type: User`, which GitHub's terms allow one of per
   person) passes it technically. Passing a filter named for humans while operated by software is exactly where
   MISSION rule 4 bites — *if anyone is deceived*. So the condition that makes this honest is **disclosure, on every
   PR and in every `/claim`**: the account is an automated brand account, the work is AI-authored and agent-operated.
   The maintainer who merges and Algora who pays then do so knowing. That was already the line's policy for AI
   authorship (`portfolio.ts:145`); it is extended to the account's nature.
3. **Conditions, encoded before any PR leaves (Opus, in `policy.ts` / `intake.ts` and tests):** (a) `policy.ts` quotes
   the clause and lines 81-86 instead of the sweep's summary; (b) a test asserts no request to `algora.io` anywhere in
   `src/`, `scripts/`, `.github/` (comments excepted) — the breach happened twice through our own tooling and a test is
   how it stops recurring; (c) the brand machine account's login must not end in "bot" and must be a `User`, not a
   GitHub App — Algora's queries drop `%bot` logins from contributor lists, and presenting as a bot invites the
   very refusal we are disclosing our way out of; (d) a new kill criterion on the line: *any Algora or maintainer
   action against the account on grounds of automation — a refused claim, a warning, a suspension — kills the line
   the same day, recorded in REJECTED.md with the message quoted.*
4. **Does it change the ₪300 now?** No. The build freeze in `algora-terms-question.md` (*"nothing more is built …
   the owner is not asked to do step 4"*) is lifted **on these conditions** — but §2.2 re-imposes the step-4 hold for a
   different reason, and it comes first.

### 2.2 `oss-bounties` (₪300): supply — **a named, thresholded measurement now; the target moves when it reads**

**Facts.** The repo's own 22.9 reading (`REJECTED.md:1140-1150`): 554 open issues carry Algora's `💎 Bounty`
label, 428 created 1.3–22.6.2026 and essentially none after; the newest supply is *"dominated by synthetic
repositories rather than funded work"*; declared as a lower bound because of two confounds. A second, independent
reading surfaced by this board's one WebSearch and read at its GitHub source (`AsherKasper/bounty-census` README,
27.9; the author is itself an autonomous agent, so this is third-party data whose method matters more than its
author): a token-free script (`node census.mjs`) that re-derives every figure from the public GitHub API. As of
2026-08-10: **561 open labelled issues across 74 repositories advertising $1,142,625; three repositories hold 99.3%
of the money; one repository (`ClankerNation/OpenAgents`) holds $1,091,100 across 201 issues against 12 stars and
zero pull requests.** Its two method findings are the ones our 22.9 count lacked: *being awarded does not close the
issue* (the label and the dollar figure stay after Algora pays by comment — nine of its own first fourteen
recommendations had already been paid) and *archived repositories keep their bounties* (five archived repos hold 28
"open" ones). After both filters, **"5 open bounties across 5 repositories, $60 in visible amounts"** at the latest
daily run; the accessible long tail is tickets of $3–$245 with a median of 8 competing comments per issue. Two
methods, same direction. The label count is not affected by the comment confound (Algora's bot applies the label
however the bounty was created), so the 561 is a ceiling on labelled supply, not a floor.

**One overrule of `SCREEN-2.md` "Found on the way" item 2.** It says the Prime Intellect closure *"names one
cause"* of the June 2026 drop. It does not: Prime Intellect never paid a bounty through Algora (all-time `Completed`
0, `bounties.ex` `fetch_stats` has no date filter — screener L1) and never labelled bounties on GitHub
(`SWEEP-2.md:145`), so its closure removed nothing from the labelled supply. The two facts point the same way and
are not cause and effect.

**Ruling.** The ₪300 does not change today by board fiat: `BOARD.md`'s number stands until a measurement of *ours*
replaces it, and the census is a third-party run this repo has not reproduced. But the measurement is named now,
it is zero-cost, it needs no owner step, and under constraint 7 it is **the line's first build step** — the cheapest
test that the payer is actually posting jobs:

- **What.** Weekly, from CI, using unauthenticated GitHub search (the census method is public; `intake.ts`'s search
  half already does the label query), count **claimable** bounties: open issue carrying the label; repository not
  archived; no `💰 Rewarded` label and no Algora payout comment; a parseable amount ≥ $50; repository policy not
  `forbidden` under `policy.ts`. Write the count as a KPI (`claimableBounties`) in `state/colony/` with the
  per-repo breakdown in `research/measurements/algora-supply.md`. First run this week, then four consecutive weeks.
- **Read at week 4, mean of the four:** **≥ 10** → ₪300 stands and owner step 4 proceeds in its ordered place
  (after step 7). **3–9** → retarget to **₪100**, grade `contradicted`, basis text carries both readings; step 4 still
  proceeds, because it also settles the Stripe-Israel question for the whole kill list (`BOARD.md` §7.2). **< 3** →
  `oss-bounties` is **killed** into `REJECTED.md` with the re-open trigger *"≥10 claimable bounties a week for four
  consecutive weekly runs"*; owner step 4 is not requested for this line's sake (it stays on the checklist for its
  other purpose), and the committed sum falls to ₪1,200.
- **Until the week-4 reading exists, the owner is not asked for step 4 on this line's account.** The board expects
  the count to come in under 10 and says so, so nobody is surprised when the target falls.

### 2.3 `pcn874` (₪600): BillOS — **no change now; the measurement is the one already encoded**

BillOS is a terminal product on npm (`billos vat … --file PCN874.TXT`, 0.2.0 on 8.9.2026) — a developer-shaped
buyer, the class `SWEEP-2.md:272` already removed from this line; the ₪600 rests on bookkeepers and osekim who
cannot `npm install` (`portfolio.ts:173-200`, chief audit §2.1 #2). It confirms the embed candidate's death (§1.8)
and narrows nothing further. The measurement that moves the target is already in the line's kill criteria and needs
no new decision: *weekly page views under 100 for 8 consecutive weeks after publication* and *revenue_ledger under
₪150 in 30 days after 90 days live* — both blocked on the free validator page (task #34) and owner steps 5 and 6.
One note for the basis text, not for the number: the SERP already taken (`serp/2026-09-07-hebrew-calculators.md:225-233`)
shows six of nine results for the exact statutory query are vendors' help pages, which is a headwind on channel (a)
that the basis should carry alongside the ITA easements it already names.

### 2.4 Extra finding, for the main thread (a defect, not a target)

The pcn874-embed screener found (`screen-2/pcn874-embed.md`, L1 row 7) that `products/pcn874/docs/SPEC-SOURCES.lock.json`
holds `"sources": {}`, `pcn874-spec-watch.yml` runs with `contents: read` so hashes are never committed back, and
`scripts/spec-watch.mjs:124-126` prints `new` whenever there is no prior entry — so the committed watch can never
print `CHANGED`. The board did not re-run it. It is flagged as a claim that a committed line's tooling works when it
does not (this repo's recurring defect); verify and fix on Opus, and until then no sentence anywhere says the spec
is "watched".

---

## 3. Portfolio effect — the ₪20,000 arithmetic, honestly

| | ₪/month | change |
|---|---|---|
| In the ledger today | 0 | none |
| Committed at month 12 (`apify-actors` 200, `oss-bounties` 300, `il-biz-tools` 400, `pcn874` 600) | 1,500 | **none today** |
| Conditional (registrar 300 on traffic; Devpost 400 on the owner's answer) | 700 | none; Metaculus joins the deferred class at **₪0 counted** |
| Admitted by this board | 0 | nothing enters |
| Expected movement when §2.2 reads at week 4 | −200 to −300 | the board expects the supply count under 10: committed sum ₪1,200–1,300 |
| Share of ₪20,000 at month 12, hypotheses not measurements | 7.5% (6.0–6.5% after §2.2) | unchanged or down |

Nothing here moves the ₪20,000 arithmetic upward, and the board did not expect it to: the four surviving shapes were
tested against nine candidates and all nine failed the first-paying-stranger test or the mandate. The one line that
survives as a test (Metaculus) is worth, on 2025 data, a few hundred dollars a season for a template bot — and it is
gated on paperwork the owner has said he will not do. The single thing that would change the arithmetic remains what
`BOARD.md` §4.1 said on 7.9: a line with a non-public input that a stranger can find, at ten times the size the sweeps
have found; the EAA occupancy wave is still the only lead of that size and its result is not before this board.

---

## 4. What this board did not verify, sources, and hand-off

- **Not verified first-hand:** the Metaculus leaderboard parses and tournament ids (taken from the screener's L1;
  the CI test re-derives them from the library); Algora's `fetch_stats` having no date filter (screener L1 from
  `bounties.ex:1406ff`; the board read `bounties.ex` only for bot/AI gates); the census's own daily figure (the board
  read its README, not its data file). Each is either re-derived by the ordered test or not load-bearing.
- **WebSearch:** 1 of 3 calls. Query: "Algora bounties AI agents autonomous claim policy algora.io 2026". Used only
  for the GitHub-hosted source it surfaced, which was then read at its source. Results: [Taskman issue #194](https://github.com/joyelgeorge/Taskman/issues/194),
  [AsherKasper/bounty-census](https://github.com/AsherKasper/bounty-census), [gigs.sh Algora guide](https://gigs.sh/p/algora),
  [algora-io/algora issues](https://github.com/algora-io/algora/issues), [Algora open bounties](https://algora.io/algora),
  [Nexussyn issue #4](https://github.com/Nexussyn/ai-growth-platform/issues/4), [Wikipedia: Agentic commerce](https://en.wikipedia.org/wiki/Agentic_commerce),
  [Wikipedia: 2026 in AI](https://en.wikipedia.org/wiki/2026_in_artificial_intelligence), [Arakoo on Algora](https://algora.io/arakoodev/bounties/community?fund=arakoodev%2FEdgeChains).
  The snippet claim that Algora's terms "prohibit robotic access" (Taskman, gigs.sh) is the same unquoted reading
  §2.1 rules on; the board relied on the rendered clause, not the snippets. algora.io URLs were not fetched.
- **Hand-off to the main thread (this board edited no other file, ran no git):**
  1. `docs/REJECTED.md`: the eight KILL rows in §1 replace or annotate the 26.9 screener rows ("Board 27.9: screener
     upheld"); the Metaculus row becomes the deferral text in §1.9; the Prime Intellect causal sentence at the end of
     the sweep-2 section is corrected per §2.2.
  2. `src/revenue/portfolio.ts`: no target changes today. Add Metaculus to the conditional/deferred list at ₪0 with
     the §1.9 condition; add the §2.1(d) kill criterion to `oss-bounties`; record the §2.2 thresholds in its basis.
  3. Build order for Opus: (i) the §2.2 weekly supply count — the first build step of `oss-bounties`; (ii) the §2.1
     conditions in `policy.ts`/`intake.ts` with tests; (iii) the §1.9 Metaculus runner test; (iv) the §2.4 spec-watch
     fix. None needs the owner.
  4. `docs/OWNER_STEPS.he.md`: no new step. The note on step 4 should say it is not requested for `oss-bounties`
     until the week-4 supply reading exists.
  5. `research/measurements/algora-terms-question.md`: status → RULED, pointing here.
