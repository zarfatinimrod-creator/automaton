# Audit — group `israel-bureaucracy`

Auditor: independent of the group supervisor. Mandate: **refute, not agree.**
Date: 2026-09-03. Repo: `/home/user/automaton` (MISSION.md binding).

---

## 0. What I could and could not open

I re-ran the evidence myself rather than trusting the report.

| Channel | Result |
|---|---|
| `WebSearch` | Working — 12 searches used |
| `registry.npmjs.org` | **Reachable** (JSON) |
| `raw.githubusercontent.com` | **Reachable** — my best independent channel |
| GitHub repo search (MCP) | **Reachable** |
| `www.paddle.com`, `developer.paddle.com` | EGRESS_BLOCKED |
| `www.maariv.co.il`, `www.gadgety.co.il`, `www.knesset.tv` | EGRESS_BLOCKED |
| `www.rivhit.co.il` (the mirrored PCN874 spec PDF) | EGRESS_BLOCKED |
| `il-biz-tools.netlify.app` (our own product) | EGRESS_BLOCKED |
| `api.github.com`, `api.npmjs.org` via `curl` | proxy 403 |

**Of the 27 `evidenceUrls` in the six ranked entries, I could render exactly two**
(both `raw.githubusercontent.com` paths inside `gilgardosh/accounter-toolkit`). Everything
else is snippet-grade for me exactly as it was for the supervisor — which matters, because
the supervisor repeatedly writes "I confirmed / I verified" about pages it demonstrably
could not open. Verification by search snippet is a real method; calling it "directly
confirmed" is not.

The report's own STRUCTURAL note says this honestly. Its individual entries then ignore it.

---

## 1. The three defects that run through the whole group

### 1.1 Not one ceiling in this group is derived. They are asserted.

Six entries, six `monthlyCeilingIls` values (2500 / 900 / 1500 / 1500 / 1200 / 400), and
**not one** shows a traffic → conversion → price arithmetic, and **not one** states a
month-one number. The task I was given asks the specific question the supervisor never
asked: *what does a brand-new entrant with no audience, no reviews and no backlinks earn in
month one?*

The answer is available in this repo and it is **₪0**, for a harder reason than pessimism:

- `products/il-biz-tools/src/config/site.json` — `paddle.clientToken: ""`,
  `paddle.priceId: ""`, `paddle.environment: "sandbox"`, `pro.publicKey: null`.
- `products/il-biz-tools/README.md` — Pro renders only when **both** the Paddle credentials
  and the licence public key are set; otherwise the page shows *בקרוב*.
- Deploying the site is **still an open task** (task #9, `pending`), and the Netlify host is
  unreachable from here, so nobody in this sweep has established that the funnel is even
  live.
- There is no ledger. Under MISSION rule 2, every line in this group has earned ₪0.

Three of the six survivors (1, 3, 5) route **all** their revenue through that disabled Pro
tier. A ranking that puts a ₪2,500 ceiling on a checkout that cannot open is not a ceiling,
it is a wish. The merged "₪4,000–7,000/month at maturity" headline is the sum of six
unanchored numbers, which is worse than any one of them.

**Corrected group figure: ₪0 today; ₪0 in month one; ₪500–1,500/month is the honest
optimistic band across all six lines at 12-month maturity, conditional on the site
actually shipping and on an acquisition channel that does not yet exist (see §4.6).**

### 1.2 The group-wide owner blocker is missing, and the one it *does* list is applied inconsistently

`ownerBlockersFound` singles out iCount for requiring "an active Israeli עוסק registration"
and calls it "RECURRING… likely disqualifying under MISSION §1". That obligation is not
unique to iCount. It applies to **every line in this group**, because all six earn Israeli
business income:

- `docs/INCOME_PLAN.he.md:70` — step 1 of the owner checklist is *"פתיחת תיק עוסק ברשות
  המסים ורישום למע״מ (עוסק פטור להתחלה)"*.
- The sibling `payment-rails` group's ROOT GATE is the same registration.
- `docs/INCOME_PLAN.he.md:17` puts the עוסק פטור ceiling at **₪122,833/year = ₪10,236/month**
  — *below the mission's first target*, so the registration status the repo plans around
  cannot carry ₪20,000/month anyway.

So the supervisor used a standard to kill its own #6 that it declined to apply to #1–#5.
That asymmetry is the tell that the ranking came first and the reasoning second.

### 1.3 "x402 — wallet only, no account, no KYC, NO BLOCKER" is false, and it is stated in the most dangerous possible form

The supervisor wrote it into `ownerBlockersFound` with the annotation *"Recorded so no
future agent invents one."* — i.e. it is explicitly designed to stop future agents from
re-checking. It is wrong twice:

1. **On Apify (which is half of survivor 4's money model).** The sibling auditor in *this
   same sweep* read Apify's own terms and recorded, in
   `research/colony-sweep/groups/risk-governance.md:47`, from
   `sources/_partials/_agentic-payments-eligibility.mdx`:
   > "The Actor's developer must also have completed identity verification (KYC)… Until they
   > do, none of their Actors are eligible."

   and from `store-publishing-terms-and-conditions.md` §10.1.2–10.1.3: Verified Creator
   status requires government ID, proof of address, tax documentation and UBO information,
   and *"no payments will be issued until verification is complete"*. Payout is 80%, with a
   **$20 (PayPal/Wise) or $100 (other methods)** minimum.
2. **On the self-hosted x402 route.** A wallet receives USDC. It does not put shekels in an
   Israeli bank. That last hop needs a KYC'd Israeli VASP and survives an Israeli bank's
   source-of-funds review of recurring crypto proceeds. Nobody in this group costed it.

The supervisor did not read a sibling group's finding that directly contradicts its own
strongest assertion. That is a chain-of-command failure, not a research gap.

---

## 2. Candidate-by-candidate

### 2.1 PCN874 Builder — **DOWNGRADED** (₪2,500 → **₪300–600/month at 12-month maturity; ₪0 month one**)

**What survives.** The legal cohort is real and I re-derived it independently. Search
corroboration across two CPA circulars (Brit Pikuach, Stark & Stark) gives:

> חובת הגשת דוח תקופתי מפורט למע"מ על ידי עוסק שהוא יחיד שמחזור עסקאותיו עולה על 500,000 ש"ח
> תחול החל מיום **1.1.2026** (במקום 1.9.2025), על דוח מפורט לתקופה 1/2026 ואילך.

That much is CONFIRMED. Everything the supervisor built on top of it is not.

**Attack 1 — the "verified free build accelerator" is stale and the supervisor invented an
API on it.** This is the one claim the supervisor said it verified by rendering, and it is
the one I could actually check.

- `registry.npmjs.org/@accounter-toolkit/pcn874-generator`: latest **0.4.1**, published
  **2024-02-11**. Nothing since. MIT — that part holds.
- `gilgardosh/accounter-toolkit`: **4 stars, 35 open issues**, `updated_at 2025-08-17`.
- `raw.githubusercontent.com/.../packages/pcn874-generator/src/index.ts` — I rendered it.
  The **only** exports are `EntryType` and `pcnGenerator`.
- `.../README.md` — I rendered it. Validation is listed under **TODO**: *"Add header vs
  transactions sum validation"*, plus multi-representative reporting as incomplete.

The supervisor's `firstStep` instructs a builder to *"confirm the generator and
**`validatePcn874()`** cover the record types we need"*. **`validatePcn874()` does not
exist.** It is a fabricated symbol in an instruction written to be executed verbatim — the
exact failure mode this group flagged in someone else's public skill ("a fake 'Amendment 157'
and invented endpoints") and then committed itself.

Worse: a generator frozen in **February 2024** predates the entire Israel-Invoices
allocation-number era. It contains no allocation-number (מספר הקצאה) field. The supervisor
sold a 28-hour build partly on a dependency that must be re-derived against a spec none of
us can open.

**Attack 2 — the buyer is being eroded from both sides, and both erosions are documented in
the same sources the supervisor cited.**

- *The ITA already made this easy for exactly this cohort.* The same Brit Pikuach /
  Stark circulars state that an individual osek **need not itemise** tax invoices under
  ₪5,000 net — it reports their aggregate, and enters the fixed supplier number
  **77777772** for such input invoices. And an individual osek **may apply to defer the
  whole obligation from 1.1.2026 to 1.1.2027**. Both facts are in the supervisor's own
  top evidence URL and neither appears in the entry. They cut the file's complexity and
  the deadline pressure — the product's two selling points.
- *The cohort is being pushed into invoicing software by other law.* I confirmed the
  allocation-number ladder independently (Grant Thornton, Stark, Chamber of Commerce):
  ₪25,000 → ₪20,000 (2025) → ₪10,000 (1.1.2026) → **₪5,000 from 1.6.2026**, with input-VAT
  deduction denied without a valid allocation number. An osek above ₪500k turnover issuing
  invoices over ₪5,000 now needs an online allocation number per invoice. The "keeps books
  in Excel and pays for no accounting suite" buyer is being legislated out of existence,
  and every suite that solves allocation numbers already emits PCN874.

**Attack 3 — the demand evidence is thinner than described.** I re-ran the GitHub repo
search. `pcn874` returns **three** repos in all of GitHub:

| repo | created | stars | state |
|---|---|---|---|
| `doron2864/pcn874-guide` | 2026-07-15 | 0 | static HTML "interactive guide", 16 KB, one push day |
| `noamvais1-pixel/AI-Accountant-ISR` | 2026-08-24 | 0 | one push, same day it was created |
| `gilgardosh/pcn874-generator` | 2021 | 1 | standalone, `updated_at 2021-12-28`, description says "PCN**875**" |

The dates the supervisor gave are accurate. The inference is not: two zero-star,
single-push repos are evidence that two people ran an AI scaffold, not that "someone feels
this now". Note also that `accounter-toolkit` does **not** appear in a `pcn874` repo search
at all — the supervisor's claim to have located it "via GitHub code search" is plausible but
the artefact it corrected the scout toward is the *less* discoverable of the two.

**Attack 4 — the ceiling.** ₪2,500/month is ₪30,000/year. At ₪79 one-off that is ~32
purchases *every month, forever*; at the entry's own 1% conversion kill-line, that requires
**~3,200 monthly users** of a Hebrew tool for individual oseks above ₪500k who refuse
accounting software. Nobody produced a size for that cohort; my searches for ITA/CBS
counts returned nothing usable. A number this specific with no denominator is not an
estimate.

**Attack 5 — the line is un-shippable under its own kill criteria.** The entry says *"Do
not ship any legal figure until a human or unblocked agent opens the official 874 spec PDF
at gov.il"*. The report elsewhere says no agent can open gov.il. So the #1-ranked build is
gated on a step no agent in this colony can perform, and the ranking does not reflect that.
The one plausible workaround — the spec is mirrored at
`rivhit.co.il/uploaded_files/documents/pcn874_manual_U1231.pdf`, edition 1.51 — is **also
egress-blocked** (I tried). Note the mirror exists, though: it is the best lead in the group
for a future agent on a different egress path.

**Attack 6 — harm asymmetry, which nobody priced.** A wrong PCN874 is a wrong VAT filing.
The blast radius of a bug is the *user's* exposure to the Tax Authority, not our refund
rate. Building it from snippets, with no primary spec and a 2024-era dependency, is a
constitution risk (MISSION rule 4), not just a quality risk.

**Payability.** Paddle-Israel: `paddle.com` and `developer.paddle.com` are egress-blocked
to me; search results assert Israel is listed under Asia in Paddle's supported countries,
and the sibling `payment-rails` audit found third-party corroboration plus the warning that
*"Paddle approval for the Israeli operator is not guaranteed"*. Paddle also reviews the live
site before approving, and the site it would review has a paid tier that renders "בקרוב".
**`israelPayable: YES` at low confidence, on seller-country eligibility only** — and it is
gated behind an account that, per `site.json`, does not exist.

**Verdict: DOWNGRADED.** Real cohort, real date, invented API, stale dependency, eroding
buyer, undenominated ceiling, un-shippable under its own gate.

---

### 2.2 Company-registrar compliance watchdog — **DOWNGRADED** (₪900 → **₪150–300/month; ₪0 month one**)

**What survives.** The arithmetic is CONFIRMED and it is the cleanest fact in the group:
₪1,338 reduced through **31.3.2026**, ₪1,777 from **1.4.2026**. I re-derived it across
Stark, YFCPA, PKF Amit Halfon, Gabbay & Shlafman, Brit Pikuach and Erlich — six independent
CPA circulars. No interpretation needed. The supervisor is right about this.

**Attack 1 — the registrar notifies companies itself, which the entry never mentions.** My
search returned, from the CPA circulars describing the process: the Registrar **no longer
sends payment vouchers but does send a notification of the amounts and the payment dates**.
So the product's core promise — "we will tell you the deadline" — competes with (a) the
Registrar's own notice, (b) six CPA firms publishing it free as SEO bait every January,
(c) gov.il's service page, and (d) a free calendar reminder. The entry names only the
accountant as competition.

**Attack 2 — the "per-company status page" cannot be built.** The entry promises status
(*חברה מפרה* or not). The supervisor **itself rejected** exactly that in the same report:
*"the entire product hinges on whether the data.gov.il registrar dataset actually exposes a
status / מפרה field… data.gov.il is egress-blocked… Unbuildable until one unblocked fetch
settles it."* The rejected item and the ranked item share the same data dependency. Strip
the unbuildable half and survivor 2 is a **date calculator plus an email**, at 16 hours.

**Attack 3 — the ceiling.** ₪900/month = ₪10,800/year = **~200–270 paying companies** at
₪39–59/company/year, or ~54 practice tiers at ₪199. For a product with one annual moment of
value, sold from a site with no traffic, in a market where the alternative is free. Month
one: ₪0. Year one, realistically: a few dozen shekels or nothing.

**Attack 4 — an owner blocker the entry created and did not catalogue.** This is the only
line that **collects and stores personal and business data** (company numbers, contact
emails) and mails Israeli residents. Israel's Privacy Protection Law as amended (Amendment
13, in force since August 2025) materially raised controller obligations and administrative
fines. The entry lists the Resend/SES DNS step and stops there. Also unlisted: an Israeli
commercial site owes an accessibility statement and IS 5568 conformance.

**Payability.** Same Paddle gate as §2.1 — **YES, low confidence, account does not exist.**

**Verdict: DOWNGRADED.** The fee arithmetic is the group's most solid fact and the product
built on it is the group's least defensible: half of it is the supervisor's own rejected
item, and the other half competes with the Registrar's own email.

---

### 2.3 il-biz-tools free-calculator expansion — **DOWNGRADED** (₪1,500 → **₪200–400/month; ₪0 month one**)

**What survives.** Merging eight scout findings into one funnel line was the right call, and
"judge page by page, delete pages under 100 impressions" is the best kill criterion in the
report. The scepticism about head terms is correct.

**Attack 1 — the funnel it feeds is switched off.** `monthlyCeilingIls: 1500` is 19 sales a
month at ₪79, through a checkout that `site.json` disables and a site whose deployment is an
open task. The entry's premise — *"marginal cost is near zero on a product that already
exists"* — is true of the code and false of the revenue path. A funnel with no exit is not a
funnel.

**Attack 2 — the line cannot legally ship what it is made of.** The entry's own kill
criterion: *"Do not publish any rate before a primary source is opened — every 2026 figure
across these pages is snippet-grade."* The repo agrees with it:
`products/il-biz-tools/src/config/tax-2026.json` carries `"verified": false` and a note
saying the figures must be checked against the ITA deduction booklet and the Bituach Leumi
employer letter before reliance. Both are on gov.il / btl.gov.il. Both are egress-blocked.
So **every page in this line is blocked on the same unavailable step**, and the entry still
carries a ₪1,500 ceiling and a `firstStep` that says "ship the diagnostic first".

**Attack 3 — the Telegram half rests on a rail a sibling auditor marked UNKNOWN.** The
entry writes *"Telegram Stars payout — already established for products/telegram-il-tools-bot;
confirm, do not assume"* and then assumes it. The `payment-rails` audit
(`audits/payment-rails.md` §3.5) recorded `israelPayable: UNKNOWN` for Stars: `fragment.com`
and `core.telegram.org` are egress-blocked and **nobody has verified the 1,000-Star minimum,
the 21-day unlock, the ~$0.013/Star net rate, or Israel's position on Fragment**. It also
recorded that Stars are retroactively debitable on buyer chargeback. Reminders are free, so
this is not fatal here — but "already established" is not a true statement about it.

**Attack 4 — the negative evidence the supervisor leaned on is weaker than it admitted, in
the direction that flatters the entry.** The group-wide traffic pessimism rests on one
undated Google Search Console CSV row from a third party's public repo. The supervisor
flagged the missing date and then still used the row as the load-bearing datum. A single
undated row from an unrelated site is not a traffic model in either direction; the honest
statement is that **this group has no traffic evidence at all**, which is a reason to book
₪0 until measured, not ₪1,500.

**Payability.** Paddle gate as above. **YES, low confidence.**

**Verdict: DOWNGRADED.** Right structure, right kill criterion, ceiling attached to a
disabled checkout and to pages that its own constitution forbids publishing today.

---

### 2.4 Israeli personal-import landed-cost rules API — **DOWNGRADED, and `israelPayable` corrected to UNKNOWN** (₪1,500 → **₪0–200/month**)

**Attack 1 — the supervisor demoted a scout for being right, and replaced its timeline with
a wrong one.** This is the most concrete error in the report.

The `fees-and-benefits` scout wrote (`scouts/israel-bureaucracy--fees-and-benefits.md:52-54`):

> "goods up to **$75** fully exempt; between **25 Feb 2026 and 1 Jun 2026** the exemption
> was raised to **$130**"

The supervisor called this *"factually wrong"* in `scoutsWeak`, and substituted:

> "$75 → $150 (Dec 2025) → $130 (Feb) → $75 restored by the Knesset voting **59-25**,
> effective two hours after the vote… extended to 1 Jun 2026"

I reconstructed the sequence from six independent Hebrew outlets (Calcalist, TheMarker,
Globes, Ynet, Mako, Maariv, Knesset Channel — all egress-blocked to me, all consistent in
snippet):

| when | what |
|---|---|
| 26 Nov 2025 | Smotrich announces the raise to **$150** |
| ~23 Dec 2025 | order signed; **takes effect 1 Jan 2026** (Chamber of Commerce petitions the High Court) |
| **24 Feb 2026** | Knesset plenum cancels the **$150** order, **59–25** → back to $75 |
| shortly after | Smotrich signs a **new** order at **$130**, bypassing the Knesset |
| ~1–2 Jun 2026 | Knesset cancels the **$130** order, **59–23** → back to **$75**, second defeat |

So: the scout's "$130 between 25 Feb and 1 Jun 2026" is **substantially correct**. The
supervisor's ladder is wrong on at least three points — $150 dated to December when it took
effect 1 January; the 59-25 vote (which killed the *$150* order in February) fused with the
June vote (59-23, which killed the *$130* order); and "$130 (Feb)" listed as a step the
Knesset then reversed in the same breath. The supervisor's `firstStep` tells a builder to
encode that ladder as a versioned JSON with **a failing test per transition**. Executed as
written, it produces a test suite that asserts the wrong law on the wrong dates — precisely
the harm the product exists to prevent.

The irony is total: the entry's thesis is *"free static content is wrong within weeks, which
is exactly what a maintained API is for"*, and the entry's own spec is wrong on arrival.

**Attack 2 — `israelPayable: YES` does not hold on either rail.** Both halves of the money
model are gated:

- Apify requires Verified Creator **KYC** before any payout, and its agentic/x402 payments
  require the developer's identity verification too (see §1.3, quoting Apify's own terms via
  the risk-governance audit). Payout floors $20/$100; revenue share 80%.
- Self-hosted x402 pays USDC to a wallet. Converting to ILS needs a KYC'd Israeli VASP and
  survives an Israeli bank's source-of-funds review of recurring crypto credits. Unverified
  by anyone in this sweep.

Under MISSION's hard gate, unverified settlement to Israel means **UNKNOWN**, not YES.

**Attack 3 — the buyer is inferred, and volatility cuts both ways.** The entry concedes
"zero measured demand". Add: a rules engine that must be corrected within *hours* of a
Knesset vote is a permanent maintenance obligation on a line with no revenue, and a stale
answer is a wrong landed cost shown to a consumer at checkout — a buyer harm, not a stale
cache. The competitor (`agentskills.co.il`) remains unpriced and unverified.

**Attack 4 — the ceiling.** ₪1,500/month over x402/Apify metered calls, from a standing
start, with no audience and no named customer, is not a month-one or a month-twelve number
for this colony. The realistic band is ₪0 until a first paying key exists.

**Verdict: DOWNGRADED**, `israelPayable` **YES → UNKNOWN**, corrected ceiling ₪0–200.

---

### 2.5 English-language olim 2026 tax-benefit calculator — **DOWNGRADED to ₪0 pending enactment** (₪1,200 → **0**)

**Attack 1 — the gate the entry set for itself is still not met, and I could not close it.**
The entry says: *"Do not build unless the 0% rate is confirmed enacted in final legislation
with a citable section — that check gates the whole line."* I searched for exactly that.
What I can establish:

- The bill was advanced by the Knesset Finance Committee and approved for final (second and
  third) readings, reported around **March 2026**, within the 2026 budget framework.
- A source discussing status **as of May 2026** still says it *"has passed the Finance
  Committee and been approved for final readings but is not yet formally signed into law,
  and modifications are possible"*.
- Today is **3 September 2026** and I found **no source confirming final passage**. Several
  commercial CPA blogs write about it in the present tense, which is marketing, not
  legislative record. `gov.il/en/pages/tax-reforms-for-new-olim` appears in results and is
  egress-blocked.

Under "default to scepticism", the gate is **open**. A line whose own precondition is
unmet cannot carry ₪1,200/month or a rank.

**Attack 2 — the supervisor's description of the benefit is materially incomplete, in ways
that decide whether a calculator is right or wrong.** From the same sources it cited:

- The exemption is **capped** — reported as income up to **₪1,000,000**. The entry's pitch
  ("what the 0%-for-two-years benefit is worth in shekels at a given salary") without the
  cap produces wrong answers for exactly the high-income buyer it targets.
- It applies to **Israeli-source active income** (business or employment) only. **No**
  exemption for Israeli-source passive income: interest, FX differences, dividends, rent,
  asset sales, capital gains, real-estate gains.
- Eligibility is tied to arrival **on or after 5 November 2025**, and returning residents
  need 10 years abroad.
- The schedule is 0% (2026–27) → 10% (2028) → 20% (2029) → 30% (2030).

None of the cap, the active-income-only restriction, or the arrival-date cut-off appears in
the entry. A calculator built to the entry's spec would overstate the benefit for the
wealthiest users — the ones paying ₪49–99 for the summary.

**Attack 3 — the paid tier is closer to the licensing line than "GREEN" admits.** A
**personalised** written tax summary and document checklist, priced, keyed to an individual's
income and residency facts, is a step beyond an information page. The regulated act under
חוק הסדרת העיסוק בייצוג ע"י יועצי מס is *ייצוג* (representation), which we would not do — so
this is probably fine — but the entry asserts GREEN with no analysis of where the line sits,
in a group that correctly rejected two other lines on exactly that statute.

**Attack 4 — the ceiling.** ₪1,200/month is 12–25 paid summaries a month, in English, to
pre-aliyah high earners, from a site with no audience, competing with CPA firms who already
own the search results and can convert the same reader into a four-figure engagement.
Month one: ₪0.

**Payability.** Paddle gate as above.

**Verdict: DOWNGRADED**, corrected ceiling **₪0 until enactment is confirmed with a citable
section**; ₪300–600/month is the optimistic post-enactment band. The supervisor halving the
scout's ₪2,500 to ₪1,200 was directionally right and insufficient — the correct number for an
unenacted statute is zero.

---

### 2.6 iCount partner programme — **DOWNGRADED on the ceiling, but the supervisor's disqualification is not supported** (₪400 → **₪0–100/month**)

**What survives, and it is the best-verified commercial term in the group.** I re-derived
the programme terms from the iCount page's indexed text:

> "עמלה של **עד 15%** מהסכום ששולם בפועל על ידי כל לקוח חדש שהצטרף… באמצעות קוד ייחודי…
> למשך **3 שנים** ממועד הצטרפות הלקוח"
> — for **new customers on the full plan only** (not Express), **base plan price only**, no
> commission on add-ons.
> "העמלות… יועברו לשותף בהעברה בנקאית… כאשר סך העמלות מגיע ל-**100 ₪**", and *"כתנאי לכל
> תשלום… על השותף להעביר לחברה חשבונית מס או קבלה."*

CONFIRMED. Note the supervisor wrote *"up to 15%"* correctly in `moneyModel` and then
"15%" flatly in `whyThisRank` — "up to" is doing work in an affiliate contract.

**Attack 1 — this is the group's *strongest* Israel payability and it is ranked last.**
An Israeli company paying an Israeli partner by **bank transfer into an Israeli bank in
shekels** requires no Paddle approval, no foreign wire, no FX, no crypto and no VASP. Every
other line in this group depends on an unverified foreign rail. On the mission's own hard
gate, this is the only line whose payment path I can describe end to end.

**Attack 2 — the disqualification is inconsistent, not wrong-in-itself.** The entry flags
the per-payout tax receipt as *"RECURRING… likely disqualifying under MISSION §1"*. But (a)
issuing a receipt is a mechanical act our own invoice generator performs — the entry says so
in its own kill criteria — and (b) the underlying עוסק registration is required by **all six
lines** and is already step 1 of the repo's owner checklist (§1.2). Flagging it here only is
a double standard. The genuine open question is the one the entry names and cannot answer:
**is signup self-serve or a sales call?** `icount.co.il` is egress-blocked to me too. That
question, not the receipt, is the kill switch.

**Attack 3 — the ceiling is optimistic even at ₪400.** 15% of base plan only, on a plan the
entry estimates at ~₪300/year, is ~₪45/customer/year. ₪400/month = ₪4,800/year ≈ **107
referred paying customers per year**, converted from a site with no traffic, into a full
(non-Express) plan. And below the **₪100 accrual floor** nothing is ever transferred — so
the realistic first-year outcome is either ₪0 or a single ₪100 transfer.

**Attack 4 — an honesty obligation nobody wrote down.** A coded recommendation on a
"neutral" free calculator is a paid placement. Israeli consumer-protection norms and MISSION
rule 4 both require it be disclosed as such, prominently, in Hebrew, next to the link — not
in a footer. That is a design constraint on the page, and it lowers click-through, which
lowers the ceiling further.

**Verdict: DOWNGRADED** on the ceiling. `israelPayable: YES` — **the only YES in this group
I would defend without qualification**. The "likely disqualifying" flag is unsupported as
written and should be replaced with the self-serve-signup question.

---

## 3. The supervisor's own errors

1. **Fabricated an API.** `validatePcn874()` in survivor 1's `firstStep` does not exist. The
   package exports `EntryType` and `pcnGenerator`; the README lists validation as a TODO. I
   rendered both files.
2. **Sold a stale dependency as a verified accelerator.** `@accounter-toolkit/pcn874-generator`
   last published **2024-02-11**; parent repo 4 stars / 35 open issues. It predates the
   allocation-number era and has no מספר הקצאה field. Presented as a reason to rank the line
   first and to budget 28 hours.
3. **Demoted a scout for being correct, and replaced its timeline with a wrong one.** The
   `fees-and-benefits` scout's "$130 between 25 Feb and 1 Jun 2026" is substantially right;
   the supervisor's substitute ladder mis-dates the $150 order and fuses the 24 Feb 59-25
   vote with the ~1 Jun 59-23 vote. That wrong ladder is the `firstStep` a builder would
   encode as tests.
4. **"x402 — no account, no KYC, NO BLOCKER", written specifically to stop future agents
   re-checking.** Contradicted by Apify's own terms, quoted by the sibling auditor in this
   same sweep, and silent on crypto→ILS settlement (Israeli VASP KYC, bank source-of-funds).
5. **Claimed verification it could not have performed.** "I confirmed the 15%/3-year/₪100
   structure **directly**" while stating icount.co.il is egress-blocked; "I verified the
   volatility is extreme" for customs while every cited news domain is egress-blocked; "I
   confirmed the ₪500,000 threshold **against** a Brit Pikuach circular" — the circular is
   on `britcpa.co.il`. Snippet corroboration is legitimate; calling it direct rendering is
   not, and it is the same sin it charged the scouts with.
6. **Applied MISSION §1 asymmetrically.** iCount killed for requiring Israeli עוסק
   registration; survivors 1–5 exempted from the identical requirement, which
   `docs/INCOME_PLAN.he.md:70` already lists as owner step 1.
7. **Ignored a sibling group's finding on a shared rail.** `audits/payment-rails.md` marked
   Telegram Stars payability **UNKNOWN**; this report calls it "already established".
8. **No ceiling in the group is derived.** Six numbers, zero traffic→conversion→price
   arithmetic, zero month-one figures, then summed into a headline band. MISSION rule 2
   exists to prevent exactly this.
9. **Did not check whether the funnel exists.** `site.json` has empty Paddle credentials, a
   sandbox environment and `pro.publicKey: null`; deployment is still an open task. Three of
   six survivors route all revenue through that checkout.
10. **Ranked #1 a line that is un-shippable under its own kill criteria** (needs a gov.il
    spec no agent can open) without letting that bind the rank — while correctly letting the
    same logic sink other candidates into `rejected`.
11. **Kept the unbuildable half of survivor 2.** The per-company *status* page needs the
    data.gov.il registrar field the same report rejected as unverifiable. The ranked entry
    and the rejection contradict each other.
12. **Over-read two zero-star repos as market signal.** Both are single-push, zero-star,
    created within weeks — evidence of AI scaffolding, not of felt pain.

---

## 4. Angles the group missed entirely

1. **The recurring Israeli obligation behind every line.** עוסק registration, periodic VAT
   and income reporting, and receipt issuance are ongoing duties for all six lines, not just
   iCount — and the עוסק פטור ceiling (₪122,833/yr = ₪10,236/mo, `docs/INCOME_PLAN.he.md:17`)
   sits **below** the mission's first target, so the registration status the repo plans
   around cannot carry ₪20,000/month. Nobody in this group reconciled the money models with
   the registration status.
2. **Crypto → shekels.** x402 revenue is USDC in a wallet. No line costed the KYC'd Israeli
   VASP hop, the bank's source-of-funds review of recurring crypto credits, or the FX and
   spread. Declared a non-blocker instead.
3. **Apify Verified Creator KYC** gates both the Apify actor and the Apify-hosted x402 route
   (Apify's own T&C §10.1.2–10.1.3), with $20/$100 payout floors and an 80% share. Found by
   a sibling auditor in this same sweep; never cross-read.
4. **Privacy law.** Survivors 2 and 3 collect and store identifying data (company numbers,
   emails, income inputs) and one of them mails Israeli residents. Israel's Privacy
   Protection Law as amended (Amendment 13) raised controller obligations and administrative
   fines. Zero mentions across nine agents.
5. **Website accessibility.** An Israeli commercial site owes an accessibility statement and
   IS 5568 conformance. Zero mentions — and it is a real, cheap, buildable task that a fine
   can attach to.
6. **Distribution.** Every ceiling in this group assumes organic Hebrew SEO against funded
   incumbents, and every entry concedes the head terms are owned. No line proposes an
   acquisition channel that (a) works and (b) requires no human — and the obvious real
   channels for Israeli עצמאים (Facebook groups, accountant word-of-mouth) all require one.
   **Without an owner-free acquisition channel, every ceiling in this group is ₪0 regardless
   of build quality.** This is the group's central unexamined assumption.
7. **The ITA's own easements on the detailed report** — aggregate reporting of sub-₪5,000
   invoices with fixed supplier code 77777772, and the deferral application to 1.1.2027 —
   are in the supervisor's own top source and shrink survivor 1's pain. Missed by scout,
   supervisor and, until this audit, by the group.
8. **Currency.** All the shekel pricing (₪39–59, ₪79, ₪199) goes through Paddle. Whether ILS
   is a supported *presentment* currency there, and whether Israeli local-only cards can
   check out, is unverified — and if not, the pricing model in four entries needs restating.
9. **The mirrored primary spec.** The group concluded no primary Israeli source is reachable.
   The PCN874 spec (edition 1.51) is mirrored on a **commercial** domain
   (`rivhit.co.il/uploaded_files/documents/pcn874_manual_U1231.pdf`), as is a second copy at
   `downloads.h-erp.co.il/files/vatr/Guidance874W.pdf`. Both are egress-blocked here, but
   "gov.il is blocked" is not the same as "the spec is unreachable" — commercial mirrors of
   Israeli government specs are a general research route nobody tried.
10. **Liability and the refund promise.** A wrong PCN874, a wrong landed cost or a wrong olim
    figure harms the user, not us. No line carries a disclaimer, accuracy-bound or liability
    analysis, and a Paddle refund policy is a binding commitment. In a group whose entire
    product surface is regulated numbers derived from snippets, this is the largest
    unpriced risk.
