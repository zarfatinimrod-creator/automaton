# Audit — group `data-apis`

Auditor: independent of the group supervisor. Mandate: refute, not agree.
Date: 2026-09-04. Repo: `/home/user/automaton` (MISSION.md binding).

---

## 0. Scope problem: there is nothing to audit in the normal sense

The supervisor ranked **zero** survivors. There are no ranked candidates, so the usual
per-candidate audit has no target. I therefore audited the only two lines that reached the
supervisor's desk alive and were killed *by the supervisor's own verification* — the CBS
indexation API and the registrar change feed — plus the supervisor's method, its factual
claims, and what the group never looked at.

A zero-survivor report is the cheapest possible report to write and the hardest to falsify,
so it deserves *more* scrutiny than a ranked one, not less. The finding below is that the
two headline kills are **correct and better-sourced than the supervisor managed**, and that
the report nevertheless contains one clear factual error, several overstated-confidence
claims, and one whole vertical with a live priced Israeli market that nobody enumerated.

---

## 1. What I could and could not verify

| Channel | Result |
|---|---|
| `api.cbs.gov.il`, `www.cbs.gov.il` | EGRESS_BLOCKED (same as supervisor) |
| `data.gov.il` (CKAN API, via curl) | `connect_rejected` by the egress proxy |
| `api.apify.com` (store API, via curl) | `connect_rejected` |
| `docs.aws.amazon.com`, `aws.amazon.com` | EGRESS_BLOCKED |
| `docs.rapidapi.com`, `open-meteo.com`, `glama.ai` | EGRESS_BLOCKED |
| `registry.npmjs.org` | **Reachable** — used for two first-hand package checks |
| GitHub code search (MCP) | **Reachable** — my strongest independent channel |
| `WebSearch` | Available; used for the Israeli-market and AWS checks |

**Method note that matters for every future Israeli sweep:** nine agents in this group
reported "no Israeli primary source could be rendered" and stopped there. Nobody tried
**GitHub code search over third-party repos that call the endpoint**. One call to it produced
first-hand, code-grade evidence for the group's single most decisive claim (below). That
workaround belongs in the sweep checklist next to the supervisor's own two lessons.

---

## 2. Verdicts on the two would-be-ranked lines

### 2.1 CBS indexation (הצמדה למדד) API / il-biz-tools Pro tier — **REFUTED** (kill upheld, evidence upgraded)

The supervisor killed the group's top scout recommendation on a snippet it admitted it could
not render. I upgraded that to code-grade evidence and the kill holds harder than stated.

GitHub code search returns **11 hits across 5 independent public repositories** calling
`https://api.cbs.gov.il/index/data/calculator/{id}`:

- `talmiller2/tax_forms_generator` — `.../calculator/120010?value=100&date=1-1-1990&toDate=…&format=xml`
- `yonatanKreiner/actuar-services` — same endpoint, and it reads `res.data.answer.to_value`
  (so the response shape is confirmed, not inferred)
- `2944444-byte/contracts-system` — a Next.js server action wrapping the same URL, and its UI
  links to it as "מחשבון הלמ"ס הרשמי" (the official CBS calculator)
- `LiorVainer/data-israel` — a typed `buildCalculatorUrl()` helper
- `reuvenaor/israel-statistics-mcp` — documents `GET /index/data/calculator/{id}` as a first-class
  CBS API function in both `INSTRUCTIONS.md` and Hebrew `INST-HEBREW.md`, and ships it as a free
  MCP tool `get_index_calculator`

So: the issuer publishes the exact calculation, an existing **free MIT MCP server already
wraps it for agents**, and at least three unrelated Israeli products already consume it
directly. Honest ceiling **0 ILS/month**. Israel payability is irrelevant at a zero ceiling
(the Paddle rail would have carried it). Constitution point stands: charging for the state's
own free answer is `docs/REJECTED.md` wall 2.

*One nuance the supervisor missed and that cuts the other way:* `israel-statistics-mcp`
carries the comment "CBS misparses dd-mm-yyyy silently — always send unambiguous yyyy-mm-dd",
and the group separately found the CBS catalogue endpoint unreliable. The issuer's answer is
free **and quietly wrong if you call it naively**. That is not a business either (the fix is a
paragraph of documentation), but it is the one question the group never asked — see §4.5.

### 2.2 Israeli companies-registrar change/diff feed — **REFUTED** (kill upheld, and it is worse than the supervisor said)

Two independent lines of evidence, both new to this sweep:

1. **The incumbents exist, as the supervisor said.** CofaceBDI's own service pages describe
   adding companies to monitoring and "receiving detailed alerts about changes according to
   registrar chapters", plus cross-user synchronisation, sold by a Ministry-of-Justice
   authorised registrar-information provider with credit scoring attached. Confirmed at
   `bdicoface.co.il` / `bdicode.co.il` (search-rendered; the host is egress-blocked to me too).
2. **The substrate is already free, which nobody in the group noticed.** `data.gov.il`
   publishes a dataset literally named **"פרטי שינויים בתאגידים — רשם החברות"** (`ica-changes`,
   resource `28780ab5-3ef1-44c7-8377-da82c0aa6781`). The scout's premise — that the change
   history is the scarce derived good — is false at the source, not just at the market.

Honest ceiling **0 ILS/month**. Demand was graded "low, entirely unevidenced" by the scout
itself; the claimed 800 ILS had no transaction behind it. Month-one revenue for a no-brand
entrant against CofaceBDI and D&B Israel, selling a feed the state publishes: zero.

---

## 3. Supervisor's own errors

**3.1 AWS Data Exchange excludes Israel — this is wrong, and it was written into the owner-blocker catalogue.**
The report states as rendered fact that "AWS Data Exchange's rendered provider eligibility list
(Australia, Bahrain, EU, Hong Kong, Japan, NZ, Norway, Qatar, Switzerland, UAE, UK, US)
**EXCLUDES Israel**", dismisses the scout's contradicting snippet as unresolved, and then files
"MOOT/NOT PAYABLE" in `ownerBlockersFound`. Two independent search renderings of AWS's own
`provider-getting-started` / `seller-eligibility` pages both return a list that **includes
Israel**, with the specific note that providers of paid products in "Australia, Bahrain, EU
member states, **Israel**, Norway, Switzerland and UAE must provide VAT registration
information in country of establishment". A second rendering adds that non-US sellers need a
W-8, a VAT/GST number and "a bank account with a SWIFT code in an eligible jurisdiction" —
i.e. the supervisor's "US bank details" requirement also looks stale. Neither of us could
render `docs.aws.amazon.com` directly, so I do not claim certainty; I claim the **opposite of
what the supervisor claimed**, on better evidence than the supervisor had, and MISSION.md
requires this catalogue to be precise. This does not resurrect the line (no owned corpus, no
buyer), but the blocker entry is false and must be corrected.

**3.2 Confidence inflation on unrendered claims.** The headline asserts "CBS **even ships** an
indexation-calculator API endpoint" as settled fact; the body admits it is snippet-grade with
the host egress-blocked. Likewise the rejected-list entry for the registrar lookup states
"parseforge at $7.50/1,000 results" as a measured price while the verification table admits
"NOT INDEPENDENTLY VERIFIED". I could not verify the Apify prices either (`api.apify.com` is
`connect_rejected` for me as well) — so the caveat was right and dropping it in the deliverable
is the error. The conclusions survive; the epistemic hygiene does not.

**3.3 Open-Meteo's free tier is non-commercial only.** The report says "Open-Meteo gives 300k
calls/month free and charges $29/month", and grades the line "legally clean (CC BY) and
commercially empty". Open-Meteo's own pricing page: the free API is **for non-commercial use**,
10,000 calls/day (~300k/month); commercial use starts at $29/month for 1M calls. A commercial
reseller cannot stand on that free floor at all. The verdict (empty) is unchanged; the stated
floor is wrong.

**3.4 RapidAPI payability was left UNKNOWN when half of it was one search away.** The report
elevates "no scout could retrieve the supported provider-country list" into a cross-group open
question. The PayPal leg is resolved and cheap: PayPal Israel accounts can receive funds and
withdraw to Israeli bank accounts in ILS (PayPal IL User Agreement, last updated 6 July 2026;
withdrawals to Israeli bank accounts or Israeli credit cards in ILS). What remains genuinely
unknown is only RapidAPI's own provider-country policy. Leaving the whole thing "UNKNOWN"
overstates the blocker.

**3.5 The group killed a shipped product and never said so.** `products/apify-il-open-data` IS
the "Israeli companies registrar lookup API / Apify actor" this report rejects, and repo task
#20 is "Publish apify-il-open-data free and count runs from strangers for 30 days".
`products/mcp-il-tools` is exposed by the same finding that free MCP servers eat these lines
(`@skills-il/boi-exchange-mcp` — verified first-hand: v1.0.1, MIT, published 2026-04-21,
keyless BOI SDMX wrapper; and `israel-statistics-mcp` for CBS). A group report whose rejections
are simultaneously kill verdicts on two live repo products, without naming them, has not
finished its job. That is the single most actionable thing in this group and it is absent.

**3.6 An inconsistent kill standard.** VAT-number validation is rejected because "what the
buyer purchases is uptime, an audit-grade stored evidence record and a vendor name their
auditors accept … exactly what a no-brand solo operation cannot sell." Applied consistently,
that argument also kills `products/x402-il-api` and the `il-biz-tools` Pro tier, both already
shipped. The supervisor never says where the line is, which makes the criterion unusable by
the board.

**3.7 "Mark data-apis CLOSED" is a board call made without the colony's own rails in view.**
See §4.1–4.2.

---

## 4. Angles the group missed entirely

**4.1 Israeli government tenders / procurement alerts — a live, priced Israeli market, never enumerated.**
Eight scouts produced ~40 candidates and not one is tenders, although `products/apify-il-open-data`'s
own README lists "government tenders" among its datasets and "procurement intelligence:
monitor tenders and government contracts" among its target buyers. The market exists and is
priced: **Govi (`govi.co.il`) sells Israeli government-tender alerts at 249 ILS + VAT per
month, no commitment, after a 14-day trial**; the Israel Export Institute sells tender
location/alerts at 1,500 ILS/year for members or ~$1,000/year to the public, plus 550 ILS/month
for an analyst add-on; the Tel Aviv Chamber of Commerce runs a free weekly alert as membership
marketing. This is a direct counterexample to the group's headline wall — the issuer
(`mr.gov.il`, data.gov.il) publishes the tenders free and people still pay monthly for the
alerting layer. I am **not** ranking it: Govi is an incumbent, part of what buyers pay for is a
human analyst, and no buyer has been observed paying *us*. But "this vertical was never
examined" is a real hole in a report that concludes the whole group is empty.

**4.2 The x402 rail — already shipped, KYC-free, and never considered.** Every payability
discussion in this group is about KYC-gated marketplaces (RapidAPI/PayPal, Apify KYC, AWS DX
W-8/VAT, Snowflake BD contact, Datarade subscription). `products/x402-il-api` exists in this
repo, sells per-request over HTTP 402 with USDC settlement, and its README states plainly:
"the only rail in the portfolio that needs no account and no KYC from the owner." Several
rejections in this group rest on payout/KYC uncertainty that this rail does not have. Whether
x402 demand is thin is a separate (and probably fatal) question — but the group never asked it.

**4.3 Free MCP servers were counted only as competitors, never as a channel.** The group found
free MCP wrappers eating three candidates and drew one conclusion (we lose). It never drew the
other (agents are a distribution surface the colony already builds for, in
`products/mcp-il-tools`). Whether that surface monetises belongs to `agent-markets`, but the
handoff was never made.

**4.4 Only one product shape was ever scored: the metered API subscription.** One-off dataset
or report sales through rails already live and Israel-payable (Paddle, Telegram Stars) were not
considered for a single candidate.

**4.5 Nobody asked whether the free issuer is correct or up.** "The issuer publishes it free"
was treated as terminal. The group's own sources document CBS silently misparsing `dd-mm-yyyy`
dates and an unusable catalogue endpoint. Correctness and availability are the two things an
issuer never sells. This is probably still not a business — but it is the question that
distinguishes "free substrate" from "free *and sufficient*" substrate, and it was never asked.

**4.6 The registrar-changes dataset on data.gov.il** (§2.2) — missed by both the scout and the
supervisor, and it is the strongest single fact against the group's last surviving candidate.

**4.7 Getting paid for data without selling an API** — pay-per-crawl / AI-crawler
monetisation, the 2026-native shape for this group's subject matter, appears nowhere in the
sweep.

---

## 5. Bottom line

The supervisor's headline conclusion — **no revenue in `data-apis`** — survives this audit. I
tried to break the two lines it killed itself and instead found stronger evidence for both
kills. Corrected ceilings for both: **0 ILS/month**.

What does not survive is the report's precision: the AWS Data Exchange blocker is factually
wrong in the direction of pessimism, two "verified" claims are snippet-grade, the Open-Meteo
floor is misstated, RapidAPI payability was left more unknown than it is, and the report never
tells the board that its own rejections condemn two shipped products. And "mark the group
CLOSED" is premature by exactly one vertical: Israeli **tenders**, where an incumbent charges
249 ILS/month for alerting over free public data, was never enumerated by any of the eight
scouts.

Recommendation: accept the zero-survivor verdict; correct the AWS blocker entry; route the
registrar/Apify and MCP findings to the two shipped products before task #20 spends another
30 days; and do not close the group until the tenders vertical has been swept once.
