# CHIEF AUDIT — the whole 15-group sweep, auditors included

Chief auditor: Fable 5.1, board-only wave. Date: 2026-09-06.
Read in full: all 15 files in `research/colony-sweep/groups/`, all 15 in `research/colony-sweep/audits/`,
`CRITIC-synthesis.md` (the seven-group critic of 2026-09-04), `MISSION.md`, and the repo state the audits
argue about (`products/il-biz-tools/src/config/site.json`, `src/revenue/portfolio.ts`, `src/revenue/rails.ts`,
`docs/INCOME_PLAN.he.md` §6, `state/colony/REPORT.md`, `state/colony/colony.db`).
Evidence I generated myself: `revenue_ledger` row count read from `state/colony/colony.db` (**0 rows**);
`site.json` Paddle block (`clientToken: ""`, `priceId: ""`, `environment: "sandbox"`); the scouts directory
counted (121 files = 15 groups × 8 criteria + content-seo's ninth).

Nothing below is a WebSearch result. This wave is the board checking the checkers, and the instrument is the
files on disk read against each other.

---

## 0. Coverage — counted, not claimed

| | on disk | missing |
|---|---|---|
| Criterion groups defined in `src/revenue/criteria.ts` | 15 | — |
| Group reports (`groups/*.md`) | 15 | **none** |
| Audits (`audits/*.md`) | 15 | **none** |
| Scout reports (`scouts/*.md`) | 121 | **none** (8 per group, 9 for content-seo) |

**No group is missing entirely.** Every part of the criterion space defined in code has been searched once and
audited once. That is the good news, and it is the only unqualified good news in this file.

What *is* missing is finer than a group, and each item is an unsearched part of the space rather than an empty
one (the auditors found these; I am consolidating them):

- **Israeli government tenders / procurement alerts** — a live, priced Israeli market (Govi at ₪249+VAT/month over
  free `mr.gov.il` data) that none of `data-apis`'s eight scouts enumerated. Task #25 exists; nothing has run.
- **The European Accessibility Act scanner** — the `compliance-scanners` scout called it "the single biggest reason
  a scanning product has buyers in 2026"; the supervisor dropped it without a word; task #22 exists; no occupancy
  test has run.
- **Apple App Store** — never researched by any scout (budget exhausted before the query ran). Poor mission fit
  anyway, but "not researched" is not "rejected".
- **Israeli hospitality**, **`ecommerce-sellers`' actual question** ("repeatedly requested gaps") — both declared
  half-swept by their own supervisor and never scheduled.
- **Agent-native bounty marketplaces** (TaskBounty, sandbox-verified payout, AI solvers invited) — found by a scout,
  dropped by the supervisor, never audited on its merits.
- **An English-language property** — every content-seo gate that killed the group is Tier-1 *geography*, and nobody
  questioned the assumption that our content must be Hebrew.
- **GitHub itself as a distribution channel** — the one comparable with real revenue in `content-seo` started as a
  GitHub curated list; the only host our proxy allows; never examined as *our* channel.
- **Getty/iStock, Alamy, Creative Fabrica, Canva Creators** — the largest asset venues, absent from `licensing-ip`.
- **Kaggle Community Hackathons** (the live 2026 successor to the dead 2022 prize) — nobody looked.
- **Israeli SaaS partner directories** (Morning, iCount, SUMIT, Rivhit) as distribution to the buyer we actually have —
  `distribution` examined Zapier, Make and HubSpot instead.

---

## 1. The auditors, audited

The question asked was: which auditors rubber-stamped — every verdict CONFIRMED, no corrections, no missed angles?

**By that definition, none.** All fifteen audits corrected at least one ceiling, listed supervisor errors (7–18 each)
and named missed angles (6–10 each). Nine refuted at least one ranked line outright; the six zero-survivor groups
had no lines to refute and their auditors attacked the *reasons* instead, which is the correct move. Several audits
are the best work in the repo: `storefronts` (found `sale_made` in Gumroad's own `recommendations.rb`),
`plugin-ecosystems` (rendered WordPress's `class-plugin-search.php` and computed the 100–200× handicap),
`payment-rails` (opened four cited URLs and found none supported the claim attached), `productized-services` (ran the
41 tests, then found the free daily Kaggle mirror two clicks from the supervisor's own source),
`israel-bureaucracy` (caught a fabricated `validatePcn874()`), `bounties-grants` (found the base rate behind the
largest ceiling in no scout file).

That said, "not a rubber stamp" is not "clean". Three auditor failures matter enough to name, because an auditor's
error is inherited as settled fact by the next wave:

1. **`vertical-niches` — partial rubber stamp on the hard gate.** It wrote *"`israelPayable: YES` stands — Paddle,
   the rail already in production in `products/il-biz-tools`"* and accepted the owner blocker as *"believed
   complete, must be confirmed."* Four sibling audits dated 09-03/09-04 and on disk when it ran (`payment-rails`,
   `risk-governance`, `distribution`, `plugin-ecosystems`) had already shown from `site.json` that **no Paddle
   account exists**. The auditor convicted its supervisor of not reading `groups/storefronts.md` on disk and then
   did not read `audits/payment-rails.md` on disk. It also criticised the supervisor for not running the two-hour
   Wix occupancy scan and did not run it either.
2. **`content-seo` — loosened the gate it was told to attack.** The audit opens with *"Nothing in this audit
   rendered"* and then **upgrades** AdSense, Skimlinks and (implicitly) Whop payability toward YES on snippet-only
   evidence, calling the supervisor's UNKNOWN "over-conservative". The auditor mandate is to attack Israel
   payability hardest and to treat what it cannot verify as not confirmed. Moving a payability grade in the
   optimistic direction on unrendered pages is the supervisors' recurring sin performed by an auditor. The
   *outcome* is unaffected (the lines die on arithmetic), but the AdSense = YES sentence will be inherited.
3. **`data-apis` — an auditor "correction" that is itself wrong.** It declared the supervisor's *"AWS Data
   Exchange excludes Israel"* an error and asserted inclusion, on two search snippets. The `licensing-ip` datasets
   scout, its supervisor **and** its auditor each **rendered** `provider-getting-started.md` from AWS's own docs
   repo — three independent renderings — and Israel is absent from the eligible-jurisdiction list. The snippet the
   `data-apis` auditor found almost certainly describes the AWS *Marketplace software* seller list, which the
   `licensing-ip` scout explicitly distinguished. Rendered beats snippet. The supervisor was right; the auditor's
   "must be corrected" must itself be reversed, and the blocker catalogue keeps AWS DX as closed to Israel.

Two softer weaknesses, recorded so nobody treats the numbers as harder than they are:

- **`store-promotion`** set the Apify portfolio at ₪1,500 by haircutting the very "$470/developer mean" it had
  just labelled a power-law marketing figure. Three later audits (`agent-markets`, `productized-services`,
  `distribution`) derived ₪150–250 *upward* from the only real base rate (8.7 users/Actor) after finding direct
  competitors on the Israeli niche. ₪1,500 is therefore the *first* audited number, not the best-evidenced one,
  and the CRITIC synthesis built on it before the later audits existed.
- **`crypto-native`** — the only audit whose headline verdict is a plain "CONFIRMED", and it is earned (it
  corroborated the x402 market size independently and found CARF and BILS). But it accused the supervisor of a
  citation error (€253.40/90d) that I cannot verify either way; both parties assert about a file only one rendered.

---

## 2. The single cross-group survivor list — auditor-corrected, deduplicated

Rules applied: the auditor's number, never the supervisor's; where two auditors sized the same thing, the framing
with rendered evidence and a derivation wins; the sweep's own reject bar (`criteria.ts:362`, ₪300/month) is
applied to every line except the one explicitly kept as a measurement instrument; a line whose only stated rail is
Paddle is payable **only** because a rendered ILS rail (Gumroad) exists for the same product shape.

### 2.1 Survivors

| # | Line (group) | Auditor ceiling, 12-mo | Month 1 | Israel | ToS | Evidence | Notes |
|---|---|---|---|---|---|---|---|
| 1 | **One Apify creator account** — merges `store-promotion` #1 (₪1,500), `agent-markets` #1 (₪200), `productized-services` #1 (₪0 net-new / ₪150–250), `distribution` #1 (₪200), half of `israel-bureaucracy` #4 | **₪200** (₪1,500 is the contested upper bound: a generic 5–8-Actor scraper set at ~2 h/week/Actor, resting on an unverified mean) | ₪0, first ledger entry ~month 9 | **YES** — Store T&C rendered, no country clause; PayPal (USD 20) or SWIFT (USD 100) | **AMBER** — two audits asked and none answered whether charging per record for a free keyless `data.gov.il` source is "charging for something free"; must be stated on the listing; supermarket variant has unread chain terms | adequate on terms, thin on demand | Kept **as the constraint-7 instrument, forecast ₪0**: publish the existing Actor free (no KYC needed), count runs from strangers 30 days, start the developer-level "History of success" clock. Five groups' survivors are this one account; the container cannot reach `apify.com`, so the push must go through CI. |
| 2 | **PCN874 builder** — spreadsheet → validated מע״מ detailed-report file (`israel-bureaucracy` #1; `vertical-niches` accountants duplicate dropped) | **₪600** (band ₪300–600) | ₪0 | **YES via Gumroad** (rendered `Israel \| ILS`); **UNKNOWN via Paddle** as currently wired | GREEN, with harm asymmetry: a wrong file is the user's VAT exposure; no legal figure may ship until the 874 spec is rendered (gov.il and both commercial mirrors are egress-blocked) | adequate: cohort confirmed across CPA circulars; dependency stale (Feb 2024, no `validatePcn874()`); ITA easements (sub-₪5,000 aggregation, deferral to 2027) shrink the pain | The only line in the sweep with a verified, dated, legally created cohort. |
| 3 | **il-biz-tools free-calculator funnel → Pro** (`israel-bureaucracy` #3; `content-seo` candidate B; `distribution` #2; `risk-governance` #1 redaction folded in as a feature, not a line) | **₪400** (band ₪200–400) | ₪0 through month 12 as things stand | **YES via Gumroad**; Paddle UNKNOWN | GREEN, conditional: `tax-2026.json` carries `verified: false` and rule 4 forbids publishing unverified rates | **thin** — no Search Console reading exists, site deployment unconfirmed, no domain, checkout renders "בקרוב" | Three preconditions before any SEO hour: deploy, buy a domain, read one Hebrew SERP. |
| 4 | **Company-registrar compliance watchdog** (`israel-bureaucracy` #2) | **₪300** (band ₪150–300) | ₪0 | **YES via Gumroad** | GREEN, with two uncatalogued duties: §30א(ג) disclosure at capture, Amendment 13 on stored emails/company numbers | **thin** — fee arithmetic (₪1,338 → ₪1,777 on 1.4.2026) is the group's hardest fact; demand is zero-evidenced; the Registrar emails the deadline itself; the "status" half is unbuildable until `data.gov.il` renders | At the bar, not above it. |
| 5 | **Devpost sponsor AI hackathons** (`bounties-grants` #1) | **₪400** | ₪0 (months 1–3) | **YES** — PayPal/Payoneer/Wise, W-8BEN, ≤60 days; snippet-grade, re-read per event | **AMBER** — "meaningful human creativity" attestation clauses and named-AI-vendor bans exist; the intake filter must exclude both or the line deceives a judge | adequate on rails; the supervisor's base rate was invented, the auditor's ₪400 is a bound not a measurement | Optionality on work done anyway; two entries a month, never mass submission. |
| 6 | **Algora OSS bounties** (`bounties-grants` #4) | **₪300** | ₪0; 2–5 days after a first rewarded PR | **YES, medium** — `connect_countries.ex` rendered twice (`{"Israel","IL"}` → Stripe Connect Express `:express`) | **AMBER** — per-repo maintainer policy; disclosed AI authorship on every PR; stop on first request; demo video per claim | adequate on payability, thin on economics (only volume figure is Oct 2023) | The one line whose acquisition runs backwards (the payer posts the job) and the shortest documented path to a platform transaction id. The critic's recommended first action; still correct. |

**Sum: ₪2,200/month at 12 months** (₪3,500 if Apify's contested ₪1,500 held). **Month one: ₪0 on every line.
Today: ₪0 — `revenue_ledger` has 0 rows.** Against ₪20,000 that is 11–17.5%; against ₪83,333 it is 2.6–4.2%.

Rail concentration, stated plainly: lines 2–4 share one site and one merchant-of-record account; lines 1, 5 (and
RapidAPI if ever used) share one PayPal account. Six lines, three rails, and two of the three unverified at the
account level. MISSION's "one rail failing must not take the company down" is not met by this list.

### 2.2 Survived scrutiny but sit below the ₪300 bar — not ranked, not forgotten

| Line | Auditor ceiling | Why it is here |
|---|---|---|
| Gumroad storefront (`storefronts` #1) | ₪250 gross (12.9% + $0.80 take; Discover gated on `sale_made`) | **Not a storefront — the colony's best-verified rail.** Its value is as the replacement for the Paddle account that does not exist. Already in `rails.ts:321`. |
| Gym health-declaration expiry clock (`vertical-niches` #1) | ₪250 | Only verified recurring statutory trigger in the sweep; wedge unproven (Arbox advertises reminders; easydo gives the form away); signature-tier question unasked. The multi-vertical "statutory declaration clock" generalisation was never examined. |
| WordPress.org plugin + Pro (`plugin-ecosystems` #1; `store-promotion` #3 at ₪1,000; `risk-governance` #2 AI-disclosure variant at ₪200) | ₪0–200 | Rendered ranking code: ~100–200× search handicap on day one; GPL means the Pro code is redistributable; 4,715-plugin review queue; Guideline 5 forces the Pro build outside the directory. The ₪1,000 was the earlier audit and did not have the ranking code. |
| Base Builder Rewards | ₪100 (top-25 builders earn ₪555–1,110) | Do not deploy to mainnet for it. |
| iCount partner tail | ₪0–100 | The **only** end-to-end ILS-to-Israeli-bank payment path anyone in the sweep could describe; killed by traffic, not by rail. |
| RapidAPI multi-homing | ₪0 forecast | Two auditors disagree (₪500 vs ₪0); the one with 16 months of a real seller's retrospective wins. Carry only as a <10-hour distribution test. |
| Tenstorrent bounties | ₪0–300, Israel UNKNOWN | All ten open bounties assigned; rail unspecified. |
| Personal-import landed-cost API | ₪0–200, Israel UNKNOWN | The supervisor's own date ladder was wrong; x402→ILS never costed. |

### 2.3 Leads that are not lines (never tested, never sized — do not add to any total)

EAA / EN 301 549 scan-as-API (task #22) · Israeli tenders alerting (task #25) · TaskBounty and the agent-native
bounty category · a free Claude/MCP-catalogue plugin as an acquisition channel for the four shipped products ·
Freemius as an ILS rail (task #21, `rails.ts:331`, unrendered) · monday.com marketplace as a rail with no product ·
the multi-vertical Israeli statutory-declaration clock · Canva Creators (pays for training rights to human-made
content — a constraint-8 shape) · Adobe Stock, only if Adobe's own page ever shows the generative-AI declaration
settable without a per-batch human · BILS opening beyond the institutional pilot (re-open trigger for crypto) ·
Cerebras / Cloudflare Workers AI free inference tiers (zero owner blockers; lower the colony's *own* cost, not any
store's).

---

## 3. Systemic problems — where the whole fleet was optimistic, where evidence was thin, what nobody searched

1. **The phantom Paddle account.** At least eight group reports assumed "Paddle already ships / already pays us".
   `site.json` holds empty credentials in sandbox; the Pro box renders "בקרוב"; no account exists; Paddle does
   not pay out in ILS; approval is discretionary and pre-revenue sellers get refused; Sumsub may demand a
   liveness video the mandate forbids. Every `israelPayable: YES via Paddle` in the sweep is UNKNOWN, and one
   auditor (`vertical-niches`) inherited the phantom too. The repo has since corrected `rails.ts` and
   `INCOME_PLAN.he.md` §6 — but §6 still lists Paddle as step 4 ahead of Gumroad, which is the rail with rendered
   proof.
2. **Ceilings were asserted, not derived, and the haircut was uniform.** Fifteen supervisors: ~₪39,400 of ranked
   ceilings (₪141,900 counting `payment-rails`' `monthlyCeilingIls: 20000` copy-pasted onto cost rails). Fifteen
   auditors: ~₪6,750 before dedup, **₪2,200–3,500 after**. A 6–18× haircut, consistent across groups, models and
   dates. Not one supervisor showed traffic × conversion × price; not one stated a month-one figure; the modal
   auditor correction was "₪0 in month one". The supervisors' *headlines* were usually honest ("almost no money
   here") and their *rankings* contradicted them — the machine-readable field a board sums was the dishonest one.
3. **"Verified" was written over snippets — by supervisors, and by two auditors.** Not one Israeli government or
   Israeli vendor page was rendered by any of ~150 agents across 15 groups. Not one Paddle, PayPal, Payoneer,
   Wise, Shopify, Unity, Adobe or Kaggle page either. The only channel that works is `raw.githubusercontent.com`
   and GitHub code search, and the strongest evidence in the entire sweep came from it (Gumroad's `_13-getting-
   paid.html.erb` and `recommendations.rb`, Algora's `connect_countries.ex`, WordPress's `class-plugin-search.php`,
   Apify's T&C, AWS DX eligibility, OFL clause 1). Every future scout should lead with it and label everything
   else SNIPPET.
4. **Nobody measured a buyer. Anywhere.** Fifteen groups measured fees, terms, competitors, queue depths and
   payout rails — supply-side facts — and inferred demand. No Search Console export, no occupancy test executed
   (two were specified and neither run), no run count, no transaction. Every ceiling in this document is an
   estimate of an untested market. MISSION constraint 7 is now a measured fact about the sweep itself.
5. **The price floor of zero hit eleven of fifteen groups** (MISSION constraint 8 said six of seven). Free issuer
   APIs, free MIT wrappers, free daily Kaggle mirrors, the state's own simulators, our own open-source detector,
   free AI-visibility checkers, free icon and font libraries, free OSS engines. The mandate selects for products
   anyone can build from public inputs. The three non-public-input shapes constraint 8 names remain the only
   defensible ones, and the survivor list above is exactly those three (platform history → Apify; a statutory
   obligation → PCN874 / registrar / gym; work for a named payer → Devpost / Algora).
6. **Apify concentration, now five groups deep, on a platform the colony cannot see.** One creator account, one
   KYC, one PayPal payout, one set of terms — and `apify.com`, `api.apify.com`, `console.apify.com` are all
   EGRESS_BLOCKED from the container. Every kill criterion written for that line is unreadable from inside the
   system that must act on it; `apify push` cannot run except from CI. §10.1.6/§10.3.2 forfeit an accrued balance
   after twelve months below the minimum or without KYC. `portfolio.ts` still carries this line at ₪3,000
   "inferred" against audited ₪200–1,500.
7. **Supervisors did not read the disk.** Two supervisors under-reported their own coverage and called complete
   files "truncated"; `accountants` re-proposed PCN874; `vertical-niches` re-ranked the Wix App Market against a
   written reopen condition and cited the wrong Wix programme after `storefronts` had warned about exactly that
   confusion; `licensing-ip` re-swept Unity after `storefronts` closed it; `israel-bureaucracy` wrote "x402 — no
   KYC, no blocker" against Apify's own eligibility partial quoted by `risk-governance`. The chain of command
   only works if each rank reads the rank beside it.
8. **Cross-group contradictions were left standing.** Stripe/Israel has three answers on disk (merchant NO;
   Connect Express YES at code grade via Algora/Polar/NativePHP; "cross-border payouts only" rendered from Stripe's
   docs) that are reconcilable and nobody reconciled. Paddle: YES / UNKNOWN. Payoneer: YES → UNKNOWN. Telegram
   Stars: "established" / UNKNOWN. AWS DX: rendered-excluded ×3 / snippet-included ×1. WordPress ceiling: ₪1,000 /
   ₪200. Apify controllable categories: five / four. Each pair is a re-open trigger waiting to fire wrongly.
9. **Owner blockers were both invented and missed.** Invented or unverified: a Talent Protocol selfie video
   escalated to the owner as a mandate decision; a Gumroad W-8BEN; Google Search Console verification;
   a WordPress.org account; a "one-time" Basename. Missed: Apify KYC gating *pricing* not only payout; the
   12-month forfeiture fuse; USDC→ILS VASP KYC under a shipped product; Israeli bank AML review of recurring
   foreign credits; the Paddle liveness video; that the owner cannot deploy the site from the container.
   And a "paid conversation with an accountant" sits as ROOT gate #3 of the owner checklist against the owner's
   verbatim *"אני לא מדבר עם אנשים"* without an async alternative named.
10. **First steps that cannot be executed and kill criteria that cannot be computed.** `validatePcn874()` (does
    not exist); KPIs written into `revenue_ledger` (schema has no such fields — `recordKpi` is the call);
    `per_page=250` (caps at 100) with `browse=new` for a 12-month cohort; asking for assignment on
    `tt-metal#32178` (assigned since 2025, PR submitted); `apify push` from a container that cannot reach
    `api.apify.com`; a Discover-views kill test on a channel gated on a prior sale. Not one kill criterion in the
    sweep names a ledger field.
11. **Six of fifteen groups returned zero survivors, and in three of them the auditor found the stated *reasons*
    false or stale** (`content-seo`: Mediavine/Journey thresholds eight months stale, AdSense grade wrong;
    `licensing-ip`: two of three walls refuted, Iconfinder researched as live ten months after it shut;
    `crypto-native`: tax-report line killed on a 58-filer statistic measuring the wrong population, CARF missed).
    A wrong "no" is invisible and gets inherited. The narrower walls the auditors wrote are the ones to keep.
12. **Budget starvation blinded whole groups.** `risk-governance` and `payment-rails` ran with WebSearch at
    200/200 before their first scout started; their auditors were blind too. The checkpoint already records the
    fix (small waves, GitHub first); it is recorded here because those two groups' snippet-grade rail facts are
    the ones the owner checklist is built on.
13. **The board's own instruments are stale.** `state/colony/REPORT.md` (generated 09-03) tells the owner
    "measured ₪6,500" while `portfolio.ts` now grades nothing as measured; `summarizeTargetBasis()` sums targets
    that total ₪16,500 — below ₪20,000 even if every unevidenced target is met. MISSION says a dashboard that shows
    a number nobody earned is worse than none. Regenerate it before the owner sees it again.

---

## 4. Owner blocker catalogue — consolidated, deduplicated, ordered, nothing invented, nothing assumed done

MISSION §1: only one-time identity/KYC/payout steps a platform legally requires of a human. Everything that is
recurring human work is a reason a line was *rejected*, not an item here. **Nothing below is done.**

### A. Do now — these gate the first transaction id

1. **Israeli tax file.** Open תיק עוסק at מס הכנסה and register for מע״מ (עוסק פטור to start); register as עצמאי at
   ביטוח לאומי. Online, with ת״ז. Required by law for any business income on every line. *Known consequence, decided
   later, not now:* the עוסק פטור ceiling (₪122,833/yr ≈ ₪10,236/month) is below the first target, so a switch to
   עוסק מורשה is an owner decision that arrives at roughly half the target.
2. **One merchant-of-record account in the owner's legal identity — Gumroad, not Paddle.** Gumroad is the only
   rail with rendered proof of ILS payout to an Israeli bank: government photo ID (colour, front and back), proof
   of residence in Israel (no P.O. box), an Israeli bank account with the holder's name in Latin characters, then one
   API token minted in the dashboard. No liveness video is reported anywhere. $100 minimum balance, 7-day hold, and a
   1–3-week account review after the first ~3–4 sales. Unlocks lines 2, 3, 4 and the Pro tier of a shipped product.
   *Paddle is not on this list unless the owner prefers it, knowing:* Sumsub may demand a short selfie video (mandate
   collision), approval is discretionary and pre-revenue sellers have been refused, ILS is not a payout currency.
3. **Stripe Connect Express onboarding through Algora** as an Israeli individual: identity document, address,
   Israeli bank account. Self-serve. This is both the shortest path to a platform transaction id (2–5 days after a
   rewarded PR) and the one form that closes the most-contested payability question in the sweep for every other
   Stripe-Connect platform. Do it before writing a line of bounty code.
4. **A company domain.** One card payment against the ₪200 float, receipt id recorded as a cost in the ledger.
   Prerequisite for anonymity (the MCP registry derives the namespace from the GitHub account otherwise), for
   Gumroad/Paddle domain review, and for any SEO line — every URL in `il-biz-tools` is still `*.netlify.app`.
5. **Secrets into CI, one paste each.** Link the repo in the Netlify UI (or run `npx netlify-cli deploy --prod`
   once, or paste a Netlify token); paste the Gumroad token and an `APIFY_TOKEN` as GitHub Actions secrets. The
   container cannot reach `api.netlify.com`, `api.apify.com` or Gumroad; GitHub Actions runners can. This converts
   every "the owner must push" recurring op into a one-time step.
6. **Move the repository to a GitHub organisation.** One-time, owner-only; until then every
   `raw.githubusercontent.com/<username>/…` URL carries his name.

### B. Only when a line has earned it — deferred, and deliberately not on the "now" list

7. **Apify Verified Creator KYC** — government ID, proof of address, tax documentation, ultimate-beneficial-owner
   information — plus a PayPal **or** Wise payout method in the owner's legal name. Required before any Actor can be
   *priced*, paid, or made agentic-eligible. **Not required for task #20** (publishing free and counting runs). Note
   the fuse: an accrued balance is forfeited after twelve continuous months without KYC or below the minimum.
8. **A PayPal Israel account able to receive**, bank link with the holder's name in Latin characters — needed only
   if Apify pays by PayPal rather than Wise, on a Devpost win, or for RapidAPI. One account serves all three.
9. **Per Devpost win, unavoidable and per-event:** the winner-eligibility form (legal name, DOB, city/country,
   sponsor-employee declaration) within ~2 business days, a W-8BEN as a non-US individual, and a prize affidavit.
   Cannot be batched in advance.
10. **Telegram Stars** — first, one login to `fragment.com` to see whether withdrawal is offered to an Israeli
    resident at all; only then Fragment's Sumsub KYC (ID + selfie) and a TON self-custody wallet. Do nothing here
    until a Star balance exists. Stars not withdrawn are not revenue.
11. **USDC → ILS** — a KYC'd account at a licensed Israeli VASP (e.g. Bits of Gold) to convert x402 proceeds. Only
    when USDC accrues. The fee/spread page has been attempted twice and never rendered; no crypto line may be booked
    net until it is. Tax arises on receipt, not on conversion.
12. **Invoicing account** (Morning / SUMIT) with an API key — only for domestic sales outside a merchant of record.
    Under an MoR the document flow (self-billing, who is the VAT customer) is an open question, and an עוסק פטור
    issues קבלה, not חשבונית מס.

### Flagged as a mandate conflict, not catalogued as a blocker

- **"One paid conversation with an Israeli accountant"** (INCOME_PLAN §6 step 3). Two questions are real
  (§30(א)(5) zero-rating under an MoR; when the עוסק מורשה switch is forced). The step conflicts with the owner's
  verbatim brief. The async alternatives are a written online accountant service or a written ITA pre-ruling; the
  conservative default (treat income as taxable, do not zero-rate) costs money and risks nothing. The owner decides;
  we do not put a conversation on his list.

### Removed from catalogues found in the groups — invented, unverified, or attached to a rejected line

Talent Protocol "Human Checkmark" selfie video (absent from the rendered T&C, unfindable, escalated anyway) ·
Gumroad W-8BEN (not in Gumroad's help source; 0 code hits) · Google Search Console verification (not a legal
identity step; agent-doable by committing a file) · WordPress.org account (username + email, no KYC) · Chrome Web
Store $5 registration (store rejected) · Basename registration ("one-time" unverified; likely annual, i.e. a
subscription) · Payoneer KYC (no surviving line needs it once Gumroad pays ILS) · everything attached to Shopify,
Wix, monday/Tipalti, Etsy, Envato, Adobe, Unity, Fab, Cults3D, Amazon SP-API, Google Play, AWS Data Exchange,
Discord, JetBrains, Figma, Notion — the lines are rejected, so the steps are not steps.

---

## 5. What the board should do with this

1. Treat **₪2,200/month at twelve months, ₪0 today, ₪0 in month one** as the audited state of the whole sweep.
   Say it to the owner in those words. The ₪20,000 target is not reachable from anything measured; the repo does
   not yet contain evidence that could establish it either way, because no buyer has been measured.
2. Reorder `docs/INCOME_PLAN.he.md` §6 to match §4 above: tax file → Gumroad → Algora Stripe Express → domain →
   CI secrets → org move. Paddle becomes an option, not step 4. The accountant item becomes a flagged conflict.
3. Regenerate `state/colony/REPORT.md`; retire the "measured ₪6,500" sentence; set `apify-actors` to the audited
   ₪200 with ₪1,500 recorded as the contested bound, or state in the basis why the board measures against ₪3,000.
4. Run the two cheapest measurements before any build: publish `apify-il-open-data` free through CI and count
   runs for 30 days (task #20); pull one Hebrew SERP and, once the site is deployed under a domain, one Search
   Console export. Both cost the owner nothing.
5. Fold the auditor-narrowed walls into `docs/REJECTED.md` in place of the supervisors' universal ones
   (`licensing-ip`, `content-seo`, `crypto-native`), and record the three re-open triggers that were added: BILS
   opening to businesses, CARF data landing in 2027, Adobe's declaration becoming settable without a human.
6. Reverse the `data-apis` auditor's AWS Data Exchange "correction": three renderings exclude Israel; keep it
   closed.
7. Sweep the unsearched cells in §0 as small GitHub-first waves before sweeping anything again: tenders (#25),
   EAA (#22), TaskBounty, an English-language property, GitHub-native distribution. Each is a hypothesis with a
   named acquisition channel, which is more than most of the 121 criteria could say.
