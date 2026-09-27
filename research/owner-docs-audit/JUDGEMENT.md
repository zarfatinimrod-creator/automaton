# Owner-facing documents — Fable judgement on the 26 queued findings (27.9.2026)

Refuter: Fable 5.1. Input: the 26 `JUDGEMENT/NEEDS_FABLE` rows of `APPLIED.md`, ruled against `MISSION.md`,
`src/revenue/portfolio.ts`, `src/revenue/owner-steps.ts`, `research/colony-sweep/BOARD.md`, `CHIEF-AUDIT.md`,
`src/revenue/rails.ts`, the rendered pages under `research/rendered/`, and the code the documents describe.
Every `oldText` below was checked to occur exactly once in its document at HEAD (line numbers are HEAD's).
Three WebSearch calls were spent, on the three outside-world facts no repo file settled; each is marked
**[search]** and none is treated as proof — a snippet only moved a sentence toward "not verified", never toward
"true". Nothing was edited except this file.

**Tally: 26 CONFIRMED, 0 REFUTED, 0 OWNER_QUESTION.** Every queued sentence was either a forecast above the
audited figures, an outside-world fact no rendered page supports, an owner action the checklist does not contain,
or an older plan contradicted by the 7.9 board ruling. Several are small precision fixes; none is cosmetic, because
each is a sentence the owner reads as a fact.

---

## docs/OWNER_STEPS.he.md:174 — `BRAND_GITHUB_TOKEN` "later, I'll tell you when" — CONFIRMED
The document defers the brand machine account's token to an unscheduled later ask. The board (BOARD.md §5, step 6:
"6b: Netlify link, GUMROAD_ACCESS_TOKEN, and BRAND_GITHUB_TOKEN") and the code (`owner-steps.ts:147` "becomes
BRAND_GITHUB_TOKEN in step 6"; `:171`; `portfolio.ts:168` "owner step 6") put it inside step 6. MISSION §1: batch
every unavoidable step into ONE ordered checklist. A separate future request is a second owner touch for a step the
board already batched. The refuter's fact that no code consumes the token yet (`bounties/intake.ts:15`,
`bounties/index.ts:9` are comments) is true and is a reason to write the code, not to schedule another ask. Fix: say
the token is pasted in step 6 with the others. Follow-on inside the same document, outside this row: the step-6
heading (:205) and table (:224–235) say "שני טוקנים"; they need a third row for `BRAND_GITHUB_TOKEN` ("what happens
when pasted: nothing yet — `bounties/intake.ts` is blocked on it").

## docs/OWNER_STEPS.he.md:305 — "₪2,200 from six lines at 12 months" — CONFIRMED
The audited ₪2,200 is real (CHIEF-AUDIT §2.1 sum), but the portfolio is four lines at ₪1,500 committed
(`portfolio.ts:16–25`, `committedTargetIls`), and the other ₪700 is `CONDITIONAL_TARGETS` (registrar ₪300 on 100
weekly views; Devpost ₪400 on the owner's paperwork answer, default NO). BOARD.md §6.2 row 5.1 rules exactly this:
"distinguish the ₪1,500 the portfolio now commits to from the ₪700 that is conditional, so the owner is not told a
conditional number as a plan." "Six lines" is the pre-board count. Fix: keep ₪2,200 as the audited ceiling, split it.

## docs/OWNER_STEPS.he.md:301 — first shekel "a few weeks ... 2–5 days, and that IS measured" — CONFIRMED
BOARD.md §5 amends this exact section to "first transaction id 4–10 weeks after the checklist, if a stranger finds
anything at all". "שבועות בודדים" is the earlier, more optimistic estimate; the later board ruling wins (brief rule 1).
The "2–5 days ... זה כן נמדד" sub-claim is wrong as worded: its only source is Algora's own bounty-bot template
(`scouts/bounties-grants--oss-bounties.md:30`: "100% of the bounty is received 2-5 days post-reward") — a platform's
stated term, measured by nobody here. Fix: 4–10 weeks, labelled estimate; 2–5 days attributed to Algora.

## docs/INCOME_PLAN.he.md:9 — "months 4–6 ₪1,000–8,000; months 9–12 ₪5,000–20,000" — CONFIRMED
A 2.9 forecast, 2–13× above every audited figure: CHIEF-AUDIT §2.1 "₪2,200/month at 12 months … Month one: ₪0 on
every line"; `portfolio.ts` ₪1,500 committed; TARGET_BASIS apify-actors "first ledger entry is ~month 9". Brief rule 1:
a forecast may stay only labelled and never above the audited figures. This one is unlabelled and far above. Fix:
replace with the audited scenario (₪0 month one; first ledger row an estimate at 4–10 weeks; ₪1,500 / ₪2,200 /
₪3,500 at month 12; ₪20,000 and ₪50,000 unsupported by anything measured).

## docs/INCOME_PLAN.he.md:97 — "YouTube removes templated AI channels" — CONFIRMED
The rendered policy (`research/rendered/youtube-monetization-policies.txt:130,140`) says such channels "are not
allowed to monetize" and that policy violations may lead to termination (:286). The mass-removal figures
(`docs/REJECTED.md:88–93`: 130,000 channels; 16 channels in January 2026) are search-snippet grade. Rule 2: state
what is rendered (demonetisation) and label the removals as snippet-grade. The line's rejection does not change.

## docs/INCOME_PLAN.he.md:74 — Stripe Express onboarding "no camera" — CONFIRMED
No Stripe page is rendered in the repo (stripe.com is egress-blocked, REJECTED.md). OWNER_STEPS itself only says
"אין צילום וידאו שאנחנו יודעים עליו" and "Stripe עשוי לבקש העלאת מסמך זהות". **[search]** Stripe's own docs describe
a selfie check as an *additional verification* a platform can enable during Connect onboarding (invitation-only for
platforms); whether Algora enables it is unknown. So "בלי מצלמה" is asserted beyond the evidence, on the one fact the
mandate forbids getting wrong. Fix: "camera — unknown; if the form asks for a selfie or video, stop and tell me."

## products/README.md:30 — "Gumroad is the only MoR with rendered proof of ILS payout" — CONFIRMED (precision)
Stale by one word since Freemius was rendered on 7.9.2026 (`rails.ts` CANDIDATE_RAILS `freemius`, evidence
"rendered": pays Israel, `supported-countries.txt:308`; ILS sales become a USD balance, `your-earnings.txt:143`; Wise
or wire "can convert payouts to your local currency", :147–154). The distinct fact Gumroad alone has is a *native* ILS
payout row (`Israel | ILS`). Fix: add "native" and name Freemius's route. Same sentence lives in
`owner-steps.ts:121` and `portfolio.ts:108` (code change noted). This differs from the refuted OWNER_STEPS:119 row,
where "הוכחה כזו" meant source-code proof; here the claim is "rendered", which Freemius now also is.

## products/README.md:75 — "listing blocked on the domain (5) and the organisation (7)" — CONFIRMED (incomplete)
Matches BOARD.md:243, but reads as owner-only blockage. The listing is also blocked on our own undone work:
`@bediyuk/mcp-il-tools` is unpublished (mcp-il-tools README:11 "npm registry returns 404"), `.github/workflows/` has
no `mcp-publish.yml`, and `server.json` points the registry at that npm identifier. Fix: name both blockers.

## products/apify-il-open-data/docs/PUBLISH.md:55 — the runs-list stranger split is an unverified assumption — CONFIRMED
`scripts/apify-runs.mjs` lists the Actor's runs with the owner's token and splits by `userId`; `api.apify.com` has
never been reached from here (`apify-runs.mjs` comment; `logs/2026-09-07-apify-publish-and-measure.md:117–119`: only a
mocked API). The one rendered Apify payload in the repo (`research/rendered/apify-store-accessibility.json`, from a
runner) exposes per-Actor aggregates `stats.totalUsers30Days` and `stats.publicActorRunStats30Days`. **[search]** Apify's
docs describe other users' runs on a public Actor as an aggregate excluding the owner's runs — the same shape — not
as rows in the owner's runs list. If the runs list is scoped to the caller, `strangerRunsLast30Days` is 0 by
construction and the job commits a "real zero" that ends the line under the day-30 rule. Fix: state the assumption in
the document; code change: read the Actor object's `stats` and record `strangerUsers30d` from `totalUsers30Days`.

## products/apify-il-open-data/docs/PUBLISH.md:53 — "the only thing that matters is the run count" — CONFIRMED
BOARD.md §6.3.1: "Readout rule: strangerUsers30d = distinct users minus the brand account"; `portfolio.ts:73,80–81`
put every kill/scale threshold on `strangerUsers30d`. The script emits runs only. Fix: name distinct users as the
deciding number; run count secondary. Code change shared with the row above.

## products/apify-il-open-data/docs/PUBLISH.md:59 — "if strangers run it: KYC and pricing" — CONFIRMED
BOARD.md §6.3.1 and §7.2 stage it: <10 instrument; 10–49 keep counting; 50+ one more Actor and KYC to the owner;
200+ pricing designed with the free-source disclosure. `portfolio.ts:73,80–81` encode the same. The document
compresses it to "run → KYC → pricing", which is an owner ask (KYC) at the wrong threshold. Fix: state the stages.

## products/apify-il-open-data/docs/PUBLISH.md:24 — "none of it is reversible in a way that matters" — CONFIRMED
The sentence says the opposite of its evident intent (a reassurance): as written it tells the owner nothing can be
undone. Whether an Apify account, listing or username can be undone is unrendered (grep finds no repo evidence).
Rule 2: say what is true (no identity verified, no price set) and that reversibility was not verified — which is one
more reason the username is the brand from the first click. The checker's proposed "hard to undo" is not adopted
either; it is equally unverified.

## products/apify-il-open-data/docs/PUBLISH.md:62 — "would kill several ₪-thousand ceilings" — CONFIRMED
After the board there are no ₪-thousand committed ceilings: targets are ₪200/₪400/₪300/₪600 (`portfolio.ts:87,126,
163,196`); the one ₪-thousand figure left is Apify's contested ₪1,500 upper bound (`TARGET_BASIS`, :280). Older
research files carry larger numbers but are not the plan. Later ruling wins. Fix: name the one figure it would close.

## products/il-biz-tools/README.md:235 — "after a sale the owner runs make-license.js issue" — CONFIRMED
A per-sale owner action is recurring work; MISSION §1 makes everything recurring ours, and no step in
`docs/OWNER_STEPS.he.md` / `owner-steps.ts` contains it (OWNER_STEPS:128–130 records it as "עוד לא נפתר"; step 3 has
no licence-delivery item, so "confirm it at owner step 3" points at nothing). `make-license.js:2–6` plans the per-sale
owner run in its own header. Gumroad's routes (`scouts/storefronts--gumroad.md` §4) show per-sale licence keys and a
verify endpoint, so an owner-free design exists; which one is a director decision. Fix: say it is unresolved and not
an owner task, and that Pro is not sold until it is automated.

## products/il-biz-tools/README.md:40 — osek patur ceiling ₪122,833 "verified" — CONFIRMED (grade word only)
The figure is not challenged: **[search]** several secondary sources and, per the result summary, a gov.il page
carry 122,833 for 2026; nothing contradicts it. What is wrong is the grade. The README's own standard withholds the
registrar amounts because "no primary source was ever opened"; the ceiling's sources are Kol Zchut, Bizportal, mako —
none rendered (`research/rendered/` holds no such page), and OWNER_STEPS:88 tells the owner to verify the same number
himself. Two documents, two grades. Fix: "verified against secondary sources only; no gov.il page rendered from
here". Code change: render a primary page through `render-watch` (the search result named
`https://www.gov.il/he/pages/small-business-owner-income-tax`; recorded here so `urls.txt`'s verbatim rule holds) and
let the flag follow the rendered text. The VAT-rate and allocation-threshold rows carry the same secondary grade and
deserve the same wording; outside this row.

## products/il-biz-tools/README.md:31 — "Gumroad's rules allow a file-free licence product" — CONFIRMED
The one reading of Gumroad's rules in the repo (`scouts/storefronts--gumroad.md` §3, from Gumroad's own
`prohibited.html.erb`, "Last revised August 2, 2026") prohibits "products with no content attached" and "services
fulfilled outside Gumroad", concludes Gumroad "only works for self-contained files/courses/memberships delivered on
Gumroad", and describes licence keys for a *downloadable* tool (§4). A file-free key that unlocks a feature on our
site is near both prohibitions; "allow" is asserted, not shown. Fix: say it is unsettled and name the safe shape (a
downloadable delivered on Gumroad carrying the key).

## products/il-biz-tools/README.md:277 — "Optional: Plausible, or PostHog" under owner steps — CONFIRMED
Listed under "One-time steps only the owner can do". No such step exists in `owner-steps.ts`; BOARD.md §6.3 assigns
page views to "the PostHog connector attached to this session" — ours. Rule 3. Fix: mark it not an owner step.

## products/il-biz-tools/README.md:18 — "the ~600k Israeli self-employed" — CONFIRMED
No source in the repo (grep: only this line and the audit files quoting it). Rule 2: soften to what is known — the
audience without a headcount. No number is substituted, because none is sourced.

## products/pcn874/README.md:125 and :260 — "the Authority publishes a free simulator; use it: <URL>" — CONFIRMED (both)
The 2009 circular only promises a simulator "in the nearest time" (`pcn874-gov-il-874-eng.txt:84`); the URL comes
from the H-ERP vendor manual (`pcn874-h-erp-mirror.txt:1263`), which also says the simulator checks the file "only
partially" (:1269–1270); "free" appears in no rendered source (only `src/sources.ts:184` and CLI text). Rule 2: keep
the URL, attribute it, drop "free", carry the partial-check caveat. Code change: `sources.ts` comment, `cli.ts:44,158`.

## products/x402-il-api/README.md:118 — "the facilitator is an owner decision … run the curl and paste" — CONFIRMED
Contradicts :87 "For x402: nothing" and the checklist (x402 is on no owner step; the lines are killed,
`portfolio.ts:412–435`). Choosing a facilitator is a deploy-time technical choice; the curl needs egress, which GitHub
Actions runners have (`render-watch.yml`). Rule 3. Fix: ours, from a runner, and no paid deploy is planned on standby.

## products/x402-il-api/README.md:87 — "earnings accrue as USDC in the wallet the automaton already controls" — CONFIRMED
Payments go to `X402_PAY_TO` (`src/config.ts:133`), an operator-set env var; the API never reads the automaton's wallet
(`grep identity/wallet products/x402-il-api/src` → nothing). Nothing is deployed and the variable is unset, so the
statement describes a present-tense accrual that does not exist. Fix: conditional and accurate.

## products/x402-il-api/README.md:9 — "the only rail in the portfolio … the first thing that can earn" — CONFIRMED
x402 is not in `LINE_RAILS` (`rails.ts:70–99`); both x402 lines are `KILLED_LINES` (₪6/provider/month, 91% of
listings under ten calls); "first thing that can earn" is a forecast the board refuted. The heading "Why this line
exists" contradicts line 5 "Revenue lines: none". Fix: keep the true no-KYC property, drop the ranking claim, state
standby.

## products/mcp-il-tools/README.md:62 — "the same logic is sold per-call over x402" — CONFIRMED
Nothing is sold: the API is not deployed and is a rail on standby with nothing planned (`portfolio.ts:421–423`,
`products/README.md:26–29`). Fix: "exposed … not deployed, not a line since 7.9.2026".

## products/mcp-il-tools/README.md:29 — "the step most implementations skip" — CONFIRMED
No survey of other implementations exists in the repo; the tool description (`src/server.ts:44`) repeats the claim.
Rule 2 and MISSION §4 (no unsupported claim in a storefront). Fix: state why padding matters without ranking others.
Line 3 "that agents get wrong" and `server.ts:44` need the same softening (code change noted).

## state/colony/REPORT.md:67 — "GitHub organisation … so the npm scope carries it" — CONFIRMED (generated)
A GitHub organisation does not create or own an npm scope; `@bediyuk` is an npm-side namespace, and no workflow in
the repo publishes to it (grep: only `portfolio.ts:181,200,326` and BOARD.md:72 mention it). The sentence makes owner
step 7 promise something step 7 cannot deliver. Source: `portfolio.ts:200` (pcn874 humanSetup); REPORT.md is generated
from it. Fix in code, then `sync-portfolio` and regenerate.
