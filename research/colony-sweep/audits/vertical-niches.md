# Audit — group `vertical-niches`

Auditor, wave 8. I do not report to this group's supervisor; I check it. Default is scepticism:
anything I could not verify is not CONFIRMED.

**Group verdict: 1 DOWNGRADED, 1 REFUTED. Corrected group revenue today: ₪0. Month one: ₪0.
Honest 12-month figure for the whole group: ₪150–400/month, from one line.**

The supervisor's headline ("almost no money here") is right and it deserves credit for saying so.
Its two survivors do not survive intact: one is real but three to five times overstated and its
single differentiating claim was never checked, and the other is not a candidate at all — it is a
re-ranking of an entry another group already closed on disk, with its payability evidence drawn
from two Wix programs that are not the Wix App Market.

---

## Egress note (method, stated up front)

From this container `www.nevo.co.il`, `dev.wix.com`, `support.wix.com`, `www.wix.com`,
`basecrm.co.il` and `tofsy.co.il` are all blocked by the egress proxy. Every fact below that
originates on one of those hosts is corroborated from independent search snippets quoting them,
and is labelled as such. **This matters for one of the supervisor's own claims — see error 4.**

---

## 1. Israeli gym/studio health-declaration service with the statutory expiry clock — **DOWNGRADED**

`monthlyCeilingIls 800 → **₪250** (12-month), **₪0 month one** · buildHours 30 → **45–80** ·
israelPayable **YES** (stands) · score 44 → **~25**`

### What holds — and it is the best-evidenced fact in the group

The statutory clocks are real. Independent search returns the operative Hebrew verbatim:

> מכון כושר ידרוש ממתאמן שימציא לו הצהרת בריאות **אחת לשנתיים**, ולעניין מתאמן שהמציא תעודה
> רפואית, ידרוש ממנו מכון הכושר להמציא לו תעודה רפואית **אחת לשנה**.

Two-year declaration, one-year medical certificate, the conditional certificate on any "yes"
answer, and parental consent for under-18s (corroborated separately: "since November 2015, any
person over 18 can start training after filling out a medical questionnaire and health
declaration; those under 18 need written consent from a parent"). The demand driver is compelled
by an instrument, not by a vendor's marketing. That is genuinely better than anything else in
this group and it is why this line is downgraded rather than refuted.

### Attack 1 — the wedge claim is unevidenced, and the incumbent's own marketing contradicts it

The entire pitch rests on one sentence: *"Four Israeli vendors already sell the signature; none of
them sells the clock, and the clock is the only part a gym cannot do."* The supervisor cites
nothing for it. Arbox's own marketing — the vendor it names as the ₪135–789/month incumbent —
says the platform **"automatically sends reminders with push notifications, collects forms and
health waivers"**, and that gyms **"create forms and waivers which can be signed digitally through
their app, and collect data directly in Arbox CRM"**. Both halves of the wedge (waiver capture,
automated reminders) are already shipping in the same product. Whether Arbox wires its reminders
specifically to the two-year statutory expiry is exactly the question that decides this line, and
neither the supervisor nor I could answer it. The burden is on the claimant. Unproven.

### Attack 2 — two live competitors the supervisor missed, one of which is free

- **`tofsy.co.il`** markets *"הצהרת בריאות למתאמן בחדר כושר — אוטומציה מהירה לעסקים"* — a health
  declaration for gym trainees sold explicitly as **business automation**. That is the wedge, already
  named, by a vendor the supervisor never lists.
- **`easydo.co.il`** does not "sell the form" as the report states. It **gives it away**: the gym
  health declaration is sent digitally **free and without registration**, inside a page whose URL
  path is literally `מאגר-טפסים-דיגיטליים-בחינם` (free digital forms bank), alongside a free
  digital-signature tier of 5 documents/month. There is a second domain, `easydoc.co.il`, running
  the same catalogue.

So the price anchor for the artefact is **₪0 with no signup**, not ₪49–79/month. The report's own
proposed free tier (20 declarations/month, account required) is *less* convenient than the
incumbent's free offer.

### Attack 3 — the ceiling, from the entrant's side rather than the leader's

Israel had **1,368 licensed gyms at end-2025** (vendor-published figure, order of magnitude only).
At ₪79/month, **capturing 100% of every gym in the country is ~₪108,000/month.** ₪800/month is
therefore ~10–16 paying studios — roughly **1% of the entire national market**, to be won by a
brand-new site with no audience, no reviews and no backlinks, in a Hebrew SERP where
`tofes101`, `fillfaster`, `easydo`, `2sign` and `tofsy` already rank for the exact query, and
where the two management suites that own the customer relationship bundle it.

Month one: **₪0** — the same answer the israel-bureaucracy audit forced on every line in that
group. Twelve-month honest figure: **₪150–400/month**, i.e. 2–5 paying studios. I put the single
number at **₪250**, in line with this repo's audited modal survivor of ₪200–500.

### Attack 4 — the build estimate omits the thing the buyer is actually buying

Israeli law (חוק חתימה אלקטרונית, תשס"א-2001) recognises **three** tiers: רגילה (any digital mark
identifying the signer), מאובטחת (cryptographic, tamper-evident) and מאושרת (certified). Only the
**secured** tier is admissible as **ראיה לכאורה** — prima facie evidence — in a legal proceeding.

A gym's *only* reason to want this document is evidentiary protection when a member is injured. A
30-hour build producing a click-signature delivers a חתימה רגילה, which is the tier that buys the
least. Either the product procures a secured signature (not in 30 hours, and the incumbents at
`2sign`/`easydo` exist precisely to sell that) or it sells the gym less protection than the gym
believes it is buying — which brushes the constitution's "no deceiving a buyer". **The supervisor
never raises the signature tier at all.** This is the sharpest omission in the report, because it
goes to the value proposition, not just to the estimate.

Also absent from the 30 hours: a data-processing agreement per customer under Amendment 13,
Hebrew support for non-technical gym owners, and data-subject requests over health data.
Corrected: **45 hours without a secured signature, 80 with**.

### Attack 5 — the DPO justification is internally inconsistent with the report's own ceiling

The supervisor imposes its architecture constraint (retain expiry + document reference, never the
answers) on the grounds that "a version that succeeded while holding it at scale would acquire a
DPO obligation". Amendment 13's mandatory triggers are data-broking on >10,000 people, systematic
monitoring, or processing sensitive data **at significant scale** — the worked examples being
banks, insurers and hospitals. At the report's own ₪800/month ceiling — 10–16 studios — this line
never comes close. The constraint is cheap and correct and should be kept; the reason given for it
is a scale the same paragraph rules out. Keep the rule, discard the rationale.

### What survives

`israelPayable: YES` stands — Paddle, the rail already in production in `products/il-biz-tools`.
The ownerBlocker is correctly stated as *believed complete, must be confirmed from the account*,
which is the right posture. The `tosRisk: GREEN` stands.

---

## 2. Wix App Market entry — "verified channel, product not yet chosen" — **REFUTED**

`monthlyCeilingIls 1200 → **0 (unknowable until a niche is named)** · israelPayable YES →
**UNKNOWN** · score 36 → **not a candidate**`

Refuted as a *ranked candidate*. The channel exists; the entry does not belong in a ranked list,
its payability evidence points at the wrong programs, and it duplicates a decision already on disk.

### Attack 1 — it is a duplicate of a closed entry, and the reopen conditions were not met

`research/colony-sweep/groups/storefronts.md:182` already ranked and closed the Wix App Market:

> **The cheapest open gate in this group**: one page,
> `dev.wix.com/.../payments-and-billing-faqs`. **Reopen only with a named niche *and* that page
> rendered.**

The supervisor names **no niche** — its own `firstStep` is a scan to go looking for one — and it
did **not** render that page (`dev.wix.com` is egress-blocked, here as there). Neither condition
was met and the entry was re-ranked anyway. This is precisely the offence the same report charges
its accountants scout with: *"never read `docs/REJECTED.md` or the israel-bureaucracy group
report, both on disk, both containing this answer."* The supervisor did not read
`groups/storefronts.md`, on disk, containing this answer.

### Attack 2 — the payability evidence is from two different Wix programs

Two of the six cited URLs do not describe App Market app-developer revenue at all:

| Cited URL | What it actually governs |
|---|---|
| `support.wix.com/en/article/wix-studio-receiving-revenue-share` | **Wix Studio partner** revenue share — agencies earning on Wix plans sold to their clients |
| `www.wix.com/marketplace/terms-of-use` | the **Wix Marketplace** — the freelancer/agency hire-a-pro marketplace |

The load-bearing "the only bank exclusions are Russia and Pakistan" comes from those two documents.
It is a fact about **Wix Partner payouts**, and it does **not** establish App Market app-developer
payout eligibility. Worse, `storefronts.md:169` had already logged this exact trap in advance:

> **Wix Marketplace (the freelancer one)** — RED... **Recorded because it shares a name with the
> Wix App Market and a later reader will otherwise confuse them.**

The warning was written down, on disk, for this reader. The supervisor walked into it and then
built its headline on it ("the only genuinely valuable thing the group produced is a **verified**
Israel-payable distribution channel").

### Attack 3 — what the rail actually is, which the supervisor did not find

The App Market payout rail is **Tipalti**, not a Wix bank transfer:

> Before you can publish a paid app to the Wix App Market, the account owner must set up a
> **Tipalti** account to receive payouts.

This is a genuine improvement on the report and it cuts both ways. It makes Israel payability
**probable** — Tipalti serves Israel, as this same report verified for GoHighLevel — and it
sharpens the ownerBlocker from a vague "bank details and a tax form (a W-8BEN or equivalent...
not confirmed for Wix specifically)" into a precise one: **one-time Tipalti payee onboarding with
identity and tax form, required *before* a paid app can be published, not after listing.** But
probable is not verified from a Wix first-party page, and this audit's default is that unverified
is not confirmed. `israelPayable` → **UNKNOWN**.

### Attack 4 — the ceiling and build hours are attached to nothing

The report states, correctly and to its credit, "Not a product proposal... the next action is to
find a real gap, not to build." It then attaches `monthlyCeilingIls: 1200` and `buildHours: 40` to
that unbuilt, unnamed product. Those numbers are unfalsifiable: there is no public install count,
no third-party app revenue data, and no named app. The only ecosystem figure in circulation
(~$140M of 2024 add-on revenue, +20%) is **Wix's own** apps, SEO and email products, not
third-party developer earnings. And the $200/month floor is ~₪740 — meaning a ceiling of ₪1,200
describes a business that spends most of its life below the threshold at which money moves at all.
Corrected ceiling: **0 until a niche is named**.

### Two things the supervisor got right, credited

- **The $200 floor rolls over rather than being forfeited.** Confirmed: "If earnings don't meet the
  $200 minimum, earnings will roll over to the next month until the minimum is met." This is a real
  correction to `storefronts.md:182`, which called it a floor "below which money accrues and never
  moves" without the rollover.
- **100% year one / 80% after** is corroborated by multiple independent sources quoting
  `dev.wix.com`. But it is **not 100%**: revenue is calculated **after a 2.5% transaction fee and
  applicable sales tax**, and the report's `moneyModel` omits this.

---

## The supervisor's own errors

1. **Ranked a non-candidate.** #2 is a channel with an admitted-undetermined product, given a score,
   a ceiling and a build estimate. Those three numbers describe nothing that exists.
2. **Duplicated a closed entry** already decided in `research/colony-sweep/groups/storefronts.md`,
   without meeting either of the two reopen conditions that entry sets — the exact failure it
   charges the `accountants` scout with in `scoutsWeak`.
3. **Cited two wrong-program Wix documents** (Wix Studio partner revenue share; Wix Marketplace
   freelancer terms) as evidence for App Market payability, after `storefronts.md:169` had
   explicitly recorded that these are confusable with the App Market and warned the next reader.
4. **Claimed a verification it cannot reproduce.** It writes "its best finding rested on a snippet
   of a regulation it never opened (**I opened it**; it held)". Both `nevo.co.il` URLs are
   egress-blocked from this container. The regulation's *content* is independently corroborated and
   stands — but the claimed method is exactly the sin it convicts the fitness scout of, and it is
   also, characteristically, the failure mode `CLAUDE.md` names as this repo's recurring defect.
5. **Missed two live competitors** on its own #1 line: `tofsy.co.il`, which sells the automation
   wedge by name, and the fact that `easydo` gives the gym declaration away **free with no signup**
   — the report lists easydo among vendors that *sell* the form.
6. **Asserted the single differentiating claim with no cited check** ("none of them sells the
   clock"), while the named incumbent's own marketing advertises both halves of it.
7. **Internal inconsistency**: justifies the health-data architecture constraint by a DPO obligation
   that arises only at a scale its own ₪800 ceiling forecloses.
8. **Stated Wix revenue splits, thresholds and exclusions as fact without rendering a single Wix
   first-party page**, while elsewhere correctly flagging that those hosts are blocked. Half-credit:
   it disclosed the blockage in the kill criteria; it did not let the disclosure change the verdict.
9. **Omitted the 2.5% transaction fee** from a `moneyModel` that says "100% of revenue".
10. **Never states the group's revenue.** Under MISSION rule 2, with no ledger entry and no platform
    transaction id, this group has earned **₪0** — the number the israel-bureaucracy audit made its
    headline. This report's headline is a ranking instead.

Two things it did better than most supervisors in this sweep and which should be copied: it killed
both of its own scouts' recommended builds by one search each (Eat App/Hostme; Wix first-party
Intake Forms), and its `ownerBlockersFound` includes an explicit **"NOT owner blockers"** section
that prevents a future session from mistaking a disqualifier for a schedulable step. That section is
the best single artefact the group produced — better than either survivor.

---

## Angles the group missed entirely

1. **The evidentiary tier of an Israeli electronic signature.** Three tiers exist in law; only the
   secured one is prima facie evidence. The whole legal value of survivor #1 turns on this and the
   word does not appear in the report.
2. **The clock generalises; the group scoped it to gyms.** The same "statutory declaration with a
   recurring expiry" shape recurs across Israeli law — swimming pools (חוק/תקנות בריכות שחייה,
   surfaced by the same search), school and student declarations (easydo already ships a
   `הצהרת בריאות לתלמידים` form), summer camps (קייטנות), and weapons licensing
   (`הצהרת בריאות לנשק`, another easydo form). If the renewal clock is the wedge, the product is a
   **multi-vertical Israeli statutory-declaration clock**, not a gym tool — a materially larger line
   the group never asked about.
3. **The buyer already pays somebody.** No analysis of whether a gym paying Arbox ₪140–860/month
   adds a second ₪49–79 subscription, nor of the obvious alternative shape: an **Arbox add-on or
   integration** rather than a standalone competitor. Nor whether Arbox has a marketplace at all.
4. **The Israeli angle on Wix was never taken.** Wix is an Israeli company with a large Hebrew-
   speaking SMB base, and this colony's one durable advantage is Hebrew and Israeli regulation. A
   Hebrew/Israeli-compliance Wix app is the single point where the group's home turf and its one
   open channel intersect, and the proposed occupancy scan is of **English** categories.
5. **Israeli hospitality was left unswept** — the supervisor names this against its own scout and
   then does not schedule it, while spending the group's remaining attention on Spain and Italy,
   both of which it correctly killed.
6. **Kill criteria are not instrumented.** "5 distinct studios have created an account" and "2 have
   paid a real Paddle transaction" require analytics and a ledger hook that do not exist in this
   repo. A kill criterion nobody can measure will not fire.
7. **No occupancy test of the Wix App Market was actually run**, despite it being the entry's own
   `firstStep` and costing the two hours the entry says it costs. The group had the budget and
   ranked the intention instead of executing it.
8. **Israeli gym franchise chains** (Holmes Place, Great Shape, and the municipal/country-club
   segment) are the segment with the most declarations and the most compliance exposure, and they
   buy through procurement — which would have been a fast MISSION §1 kill, or a reason to redraw the
   buyer. Neither was written down.
