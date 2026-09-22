# AUDIT — group `bounties-grants`

Auditor: AUDITOR agent, independent of the group supervisor. Date: 2026-09-03.
Mandate: refute, not agree. Default verdict is "not confirmed" unless the evidence renders.
Standard matched: `research/colony-sweep/audits/store-promotion.md`.

## Evidence rules used here
- **RENDERED** = I fetched it myself in this container and read it.
- **SNIPPET** = a search-result summary of a page the egress proxy blocks. Never presented as a page.
- **GITHUB-API** = returned by the GitHub MCP search tools (structured data, not a snippet).
- Search budget: **5 of 5 WebSearch calls spent.** Everything else was free (raw.githubusercontent.com,
  github.com, GitHub issue search).
- Domains I confirmed EGRESS_BLOCKED during this audit: **`devpost.com`** (so the group's #1
  firstStep endpoint could not be verified by me either). Blocked to the scouts and the supervisor
  and therefore still blocked to this audit: `algora.io`, `help.devpost.com`, `kaggle.com`,
  `digital-science.com`, `hackerone.com`, `docs.hackerone.com`, `docs.bugcrowd.com`,
  `kb.intigriti.com`, `huggingface.co`, `innovationisrael.org.il`, `esp.ethereum.foundation`,
  `arcprize.org`, `drivendata.org`, `zindi.africa`.
- What rendered for me: `raw.githubusercontent.com` (Algora `connect_countries.ex`, Talent Protocol
  Builder Rewards T&C, TaskBounty README), `github.com` (tt-metal issue #32178, securitylab
  discussion #828), and GitHub issue search over `tenstorrent/tt-metal`.

---

## Headline of this audit

**The supervisor's framing is the best in this colony so far. Its numbers are not, and three of
them are invented.**

The report's structural analysis — prizes are not revenue, the bug-bounty branch is dead by terms,
2026 turned OSS against agent PRs — is correct, well-argued and worth keeping verbatim. But the
five ceilings it then assigns sum to **₪7,800/month**, and every load-bearing number underneath
them fails when opened:

- The base rate behind candidate #1 (`~3,000 registrants against ~17 paying slots`, `Colosseum's
  0.9%`) **appears in no scout file in this group**, and the hackathons scout wrote in its own
  report that it *refused* to estimate win rates because no source existed, and that Colosseum was
  one of the follow-ups it never ran.
- The ceiling for candidate #2 is **higher than what a top-25 builder on the entire Base
  leaderboard earns** under the terms the supervisor itself cites.
- The firstStep for candidate #3 tells a builder to ask for assignment on an issue that has been
  **assigned since 2025 and already has a PR submitted** — and all ten open bounty issues in that
  repo are assigned to other people.
- Candidate #5 is a programme the report itself says "may simply not exist any more", carried at
  ₪1,500/month. One search says it was a five-month run in 2022.

My corrected ceilings for the same five candidates sum to **₪800/month at twelve months**, with
**₪0 for at least the first quarter on every one of them** — a ~90% cut. Separately, the report
omits the single most mission-aligned finding any of its scouts produced, and rejects an entire
criterion for a reason its own scout's second pass refutes.

---

## 1. Devpost vendor-sponsored AI hackathons — **DOWNGRADED**

Corrected ceiling: **₪400/month at 12 months** (from ₪2,500), **₪0 for months 1–3.**
Israel payable: **YES**, unchanged — but still negative evidence (absence from exclusion lists),
snippet-grade, and genuinely per-event. The report is right to re-read eligibility every time.

### The base rate is invented, and the scout said so first
The ceiling rests on one sentence: *"~3,000 registrants against ~17 paying slots in the one event
with real numbers; the only hard base rate anywhere in the group is Colosseum's 0.9%."*

`grep` across all eight `bounties-grants--*.md` scout files: **neither number exists in any of
them.** "Colosseum" appears exactly once in the group's evidence, in the hackathons scout's own
closing section:

> *"Search budget hit its cap at 8; several natural follow-ups (lablab, HackerEarth payouts,
> **Colosseum**/Solana, Encode Club, Israeli-winner payout reports) **were not run**."*

and, in the same file:

> *"No source found on realistic win rates or entry counts per hackathon — **I deliberately did not
> estimate them rather than invent a number**."*

The supervisor cited, as "the only hard base rate anywhere in the group", a figure from a search its
scout recorded as never having been performed — and supplied the registrant/slot ratio the same
scout explicitly refused to supply. I spent one of my five searches trying to find a public
Devpost submission-to-winner statistic and found none either. This is the most serious evidentiary
failure in the report, because it is the number the largest ceiling in the group is derived from.

### The ceiling contradicts the report's own build cap
Take the supervisor's own framing at face value: a mid-size $8k–$25k pool across ~17 paying slots
is a mean paying slot of roughly **$470–$1,470**. Even on a *generous* base rate — counting
submissions rather than registrants, so 17 of perhaps 200–400 entries, i.e. 4–8% — the expected
value of one entry is about **$36–$72**. The report's own kill criterion caps a build at **40
hours**. That is roughly **$1/agent-hour**, and ₪2,500/month (~$675) would require on the order of
**ten to twenty entries every month, forever**.

That volume is not merely impractical, it is the thing the group's own scout marked RED:

> *"**RED** for mass-submitting near-identical entries across many hackathons (the 'AI slop'
> pattern). It is spam, it is what will get a name banned, and it is out of bounds."*

So the ₪2,500 ceiling is only reachable through the operating pattern the evidence forbids. At an
honest two entries a month it is **₪250–₪800/month of expected value in the good case and ₪0 in
most individual months**. I set **₪400**.

### A constitutional finding was dropped
The scout raised, and the supervisor did not carry, an AMBER that bears directly on this line:

> *"**AMBER** for any event demanding an attestation of 'meaningful human creativity' or that the
> submitter personally built it. A fully autonomous entry submitted under the owner's name against
> such a clause is a deception of the judge and is barred by our constitution regardless of payout."*

The scout's own rendered/snippet evidence shows this clause is live (HackerEarth/Microsoft Build:
*"must clearly demonstrate meaningful human creativity, judgment, and engineering"*). It belongs in
the intake filter next to the AI-vendor clause the supervisor did carry. Its absence means the
intake filter as written passes events we are barred from entering.

### firstStep — unverifiable, and honestly labelled
`GET https://devpost.com/api/hackathons?status[]=open&challenge_type[]=online`: **devpost.com is
EGRESS_BLOCKED to me**, so I cannot confirm this endpoint exists or returns what is claimed. The
firstStep does say "from an unblocked runner", which is the honest form. Flagging only so nobody
treats the endpoint as verified: **it is not**, by anyone in this chain.

### What survives, and it is real
The shape of the line is genuinely mission-compatible: public repo, screen-recorded video, README,
no camera, no pitch, no selling, async judging, solo entries. The payout-rail verification
(PayPal/Payoneer/Wise, W-8BEN, ≤60 days) is the single most useful piece of work in the report.
Keep the line as **variance attached to work we do anyway** — which is exactly what the report's
closing section says. Just not at ₪2,500.

---

## 2. Base / Talent Protocol Builder Rewards — **REFUTED at ₪1,200; DOWNGRADED to ₪100**

Corrected ceiling: **₪100/month**, and **₪0–₪60/month realistically for a new entrant** (from
₪1,200 / "realistically ₪300–800").
Israel payable: **YES**, unchanged and well-founded — OFAC-only screening, payout to a
self-custodied wallet, no bank rail, no country field.

### The arithmetic is in the document the supervisor cited
RENDERED by me, `raw.githubusercontent.com/talentprotocol/public-docs/main/docs/legal/builder-rewards-terms-conditions.mdx`
(document date **29 December 2025**):

- *"The program distributes **5 ETH for every 500 builders each month**."*
- Tier 1 (top 25) **30%**; Tier 2 (next 75) **30%**; Tier 3 (next 150) **20%**; Tier 4 (next 250)
  **20%**. No carryover.

Worked through:

| rank band | share | ETH/builder/month | at ETH $2,500 | at ETH $5,000 |
|---|---|---|---|---|
| Tier 1 (top 25) | 30% of 5 ETH | 0.060 | ~₪555 | ~₪1,110 |
| Tier 3 (ranks 101–250) | 20% of 5 ETH | 0.0067 | ~₪62 | ~₪124 |
| Tier 4 (ranks 251–500) | 20% of 5 ETH | 0.0040 | ~₪37 | ~₪74 |

**A ₪1,200/month ceiling for a brand-new entrant is above what a top-25 Base builder on the entire
leaderboard receives** at any plausible ETH price. This is the same failure the previous audit found
on Apify — a ceiling set above the platform-wide top — only sharper, because here the distribution
is published rather than inferred.

The supervisor's escape hatch ("the sources genuinely disagree, so treat the pool as ±3x") does not
save it. Under the *other* reading it cites — **2 ETH/week to the top 100** — everyone outside the
top 100 receives **nothing at all**, so a new entrant's ceiling under that reading is **₪0**, not
₪1,200. Both available readings refute the number; the report picked neither and averaged upward.

The group's own scout did this arithmetic and reached the right answer, in the file the supervisor
read: *"At any plausible ETH price this is **tens of shekels per month, not thousands**."*

### The "heaviest blocker in the group" is unsourced
Owner blocker #6 — *"Talent Protocol 'Human Checkmark' — upload a government-issued ID **and record
a short selfie video**"*, escalated to the owner as a mandate conflict needing his personal
decision — is:
- **absent from the rendered T&C** I opened (no mention of Human Checkmark, ID, selfie or video
  anywhere in it);
- **absent from the scout's evidence** — the scout has only a snippet listing three onboarding steps
  *"Basename • Builder Score ≥ 40 • Human Checkmark"*, with no description of what the checkmark
  requires, and explicitly flags it as unverified;
- **not found by my search** (one of my five) for Talent Protocol Human Checkmark verification
  requirements: nothing describing an ID upload or a selfie video.

The supervisor wrote *"the scout flagged as unverified and **I confirmed**"*. Nothing in the report
records how. Default verdict: **NOT CONFIRMED.** It may still turn out to be true, and it must be
checked before anyone acts — but the mandate forbids *assuming* a blocker, and it equally forbids
inventing one. Raising an unverified camera requirement to the owner as a decision he must make is
the more expensive error of the two, because it burns the one resource the mission is built to
conserve.

### And a blocker under-described in the other direction
Owner blocker #5 describes the Basename as *"a small one-time gas from the owner's funds"*.
Basenames are name registrations on Base and, like ENS, are priced **per year with renewal** — I
could not verify the 2026 fee schedule within budget, so I assert nothing except that
**"one-time" is unverified and the recurring reading is the more likely one**. If it renews
annually it is a subscription, and `MISSION.md` is categorical that the ₪200 float *"must never
become a subscription"*. Check before spending.

### A conflict with the scout's instruction that the report inherited without resolving
The scout's verdict was **AMBER** with an explicit rule: *"Per rule 4, **do not build for this**. It
is acceptable only as a passive by-product of work we were doing anyway."* The T&C I rendered
prohibits *"Using automated tools, bots, or other technical measures to artificially inflate
activity metrics"* and *"activities contradicting the program spirit."*

The supervisor's firstStep is *"deploy the existing `products/x402-il-api` settlement contract to
Base mainnet"* — a mainnet deployment whose stated purpose in the ranked list is to earn Builder
Rewards. The report argues this is fine because we would ship on Base anyway. That argument is
available, but it is exactly the argument the scout pre-emptively ruled out, and the report never
acknowledges that it is overriding its own evidence. At the corrected ceiling (~₪60/month) the
question is moot: **nothing here justifies owner gas on a mainnet deploy.**

---

## 3. Tenstorrent tt-metal bounties — **REFUTED**

Corrected ceiling: **₪0–₪300/month** (from ₪1,800). Israel payable: **UNKNOWN** — unchanged, and
the report is right that the rail is genuinely unspecified.
**The firstStep does not work.**

### The named issue is taken, and so is everything else
GITHUB-API, `search_issues repo:tenstorrent/tt-metal label:bounty state:open`, run by me
2026-09-03. **Total open bounty issues: 10. Number with no assignee: 0.**

| issue | bounty | assignee |
|---|---|---|
| #54551 | $1,000 | kanapitsas |
| #54104 | $2,000 | Sedherthe |
| #54016 | $35,000 | jasondavies |
| #53787 | $5,000 | kanapitsas |
| #52909 | $5,000 | kinginu |
| #52037 | $1,500 | EazyHood |
| #51655 | $1,000 | kinginu |
| #50522 | $1,500 | sreeshanth-soma |
| #49307 | $2,500 | morhimanshu |
| **#32178** | **$2,000** | **ayewo** |

RENDERED, `github.com/tenstorrent/tt-metal/issues/32178`: open, **opened 10 November 2025**,
assigned to **@ayewo**, project status **"PR Submitted"**, and it is a **$2,000** CosyVoice
bring-up — not the $1,500 the ceiling is built on.

This is fatal on the supervisor's own reasoning. It called prior assignment *"decisively"* the best
property of the line — *"payment requires prior assignment to the issue, so it is not an open PR
race"*. The corollary it did not draw is that **an assigned issue is unavailable**, and it verified
the bounty inventory on the same day without recording that every single item in it was already
claimed. The firstStep instructs a builder to comment on a ten-month-old issue asking to be
assigned to work that someone else has already submitted a PR for.

Against the previous audit's category "a firstStep naming a function or endpoint that does not
exist", this is the same class of defect: the action named cannot be performed as described.

### The ceiling was never derived
*"Honest ceiling ₪1,800/month (one $1,500 bounty a quarter)"* is the arithmetic of *winning*, with
no probability attached, on a line where the report states two unresolved blockers in the same
paragraph: **we have no Tenstorrent hardware**, and **the payout rail is unknown**. A ceiling that
assumes quarterly success on a line that cannot currently be started, on hardware we do not have,
paid by a rail nobody has identified, is a projection. Corrected: **₪0 until the hardware question
is answered**, and at most ₪300/month afterwards.

### What survives
The *terms* praise is deserved — a named company, published bounty terms, sanctions-only
eligibility, assignment-gated payment. If Tenstorrent provides cloud silicon to assigned external
participants, this becomes the cleanest line in the group. The corrected firstStep is therefore:
**do not ask to be assigned to #32178. Ask the hardware question on a currently unassigned bounty
— and when there is none, ask it in the repo's discussions instead, then re-run the bounty search
weekly until an unassigned item appears.**

---

## 4. Algora OSS bounties — **DOWNGRADED**

Corrected ceiling: **₪300/month at 12 months** (from ₪800), ₪0 month one.
Israel payable: **YES**, but at **medium** confidence, not "the best-evidenced fact in the group".

### The payability evidence holds — I re-rendered it
RENDERED by me, `raw.githubusercontent.com/algora-io/algora/main/lib/algora/psp/connect_countries.ex`:
`{"Israel", "IL"},` is present, and the module's `account_type/1` returns `:express` for every
country except Brazil. So Israel is a supported Stripe Connect **Express** payout country in
Algora's own code. That part is solid and the supervisor deserves credit for using the
vendor-source-code route.

### But the group contains a contradiction the supervisor never saw
The `creator-funds` scout — **one of the two reports the supervisor never read** — is built around
the opposite fact:

> *"Writers in Israel are locked out of Substack's core economic layer... **Stripe does not provide
> service in Israel**"* … *"Israel is not a supported country for a Stripe **account holder /
> Connect payee**, which is exactly what every creator-payout program requires."*

Two scouts in the same group, on the same day, reached opposite conclusions about Stripe and Israel,
and the supervisor merged neither because it read only six of the eight files. The reconciliation
is probably that Stripe's cross-border *recipient*-only Connect accounts (the scout found Algora's
service agreement string is literally `"recipient"`) cover far more countries than Stripe's
merchant-account list — but **that reconciliation is my inference, not a rendered clause**, so the
honest label is YES at medium confidence with a named open question, not a settled fact.

### The economics numbers have no provenance
*"$65,785 across 600 bounties as of October 2023 — a $110 average"* and *"8–158 competing PRs on a
fresh bounty within hours"* appear **in no scout file in this group**. The oss-bounties scout wrote
the opposite: *"**No platform-wide payout volume is published**"*, offering only a $50–$2,500 range
and a single-org $143K testimonial. `algora.io` is blocked to the supervisor by its own admission.
These are snippet-grade figures at best, presented as the measured facts the ceiling rests on.

### A hard product requirement the report never mentions
RENDERED by the scout from Algora's own bot templates, and absent from the group report entirely:

> *"To claim a bounty, you need to **provide a short demo video** of your changes in your pull
> request."*

Agent-producible (screen capture), but it is a per-submission deliverable that changes the build
spec and the per-PR cost, and it never reached the ranked entry.

### Ceiling
The intake filter the supervisor designed is the right answer to the constitutional risk and should
be built as specified — it is the most useful concrete artefact in the report. But at a $110
average, maintainer-discretion payment, a flood of agent PRs, and the report's own kill criterion
(20 correct disclosed PRs, fewer than 2 rewarded), one to two rewarded bounties a month in the
*good* case is ~$110–220 ≈ ₪400–800 gross, and the base case is zero merged. **₪300/month**, ₪0 in
month one, nothing until Stripe Express onboarding is complete.

---

## 5. Kaggle Community Competition Creator Prize — **REFUTED**

Corrected ceiling: **₪0** (from ₪1,500). Israel payable: **YES** on eligibility — and irrelevant,
because the programme is not evidenced to exist.

### One search closed it
WebSearch, 2026-09-03 (one of my five): the Community Competition Creator Prize was announced in
**March 2022** as *"up to five $5,000 monthly prizes (one per month)"* — i.e. a **five-month run**,
not five recipients per month. No result indicates it operates in 2026. What Kaggle launched
instead, in 2026, is a **different** programme — *Community Hackathons* (announced on
`blog.google`), with a different structure.

### The report knew, and booked the number anyway
Its own text: *"**The program may simply not exist any more.** It reads as a time-boxed five-month
run announced years ago"* — followed immediately by *"Honest ceiling ₪1,500/month"*. And the ml
scout it was grading had already written *"The programme's start date is 2022 and I could not
verify it is still running in 2026 — **treat as unverified**."*

Carrying ₪1,500/month — 19% of the group's headline — on a programme the report believes is dead is
the exact failure `MISSION.md` names: *projections are not revenue*. The correct treatment is
**₪0 with a one-page-load research task attached**, which is what the firstStep already is.

### And an acquisition problem nobody named
Even if the programme were live, the product is a *Community Competition* judged on quality — and a
competition with no participants is not high quality. That makes participants an input the line has
no channel to acquire, which is constraint 7 of `MISSION.md` applied to the group's most
"agent-shippable" candidate. The report never asks the question.

---

## Rejections — audited

I attacked the rejection table too, because an over-rejection is also an error.

**Confirmed and, in one case, understated:**
- **GitHub Security Lab CodeQL bounty.** RENDERED by me, `github.com/github/securitylab/discussions/828`,
  *"Sunsetting the GitHub CodeQL Bug Bounty Program"* — *"We are phasing out the GitHub CodeQL Bug
  Bounty Program"*, open until **24 June 2024**. Rejection **CONFIRMED**.
- **The whole bug-bounty branch.** The supervisor rejected it on HackerOne's automated-delivery
  clause and a Bugcrowd webcam gate. My search found the current, harder facts it missed:
  **Bugcrowd identity verification is mandatory before submitting** (ID document plus a photo of
  the researcher's face through Jumio/NetVerify), **and all submissions must be made through a
  browser with a human-verified token**; and **HackerOne now also mandates ID verification for
  submission eligibility**, with researchers *"asked to complete a live selfie or present their
  identity document using a device camera"*. Rejection **CONFIRMED and under-stated** — the branch
  is dead twice over, on both platforms, at the submission step rather than the payout step. The
  human-verified browser token is the cleanest single kill and appears nowhere in the report.
- **Creator funds** (never reported to the supervisor, so never in the table). The `creator-funds`
  scout's conclusion is sound and should be added verbatim: Reddit/Medium/Substack/X are dead for
  Israel on the Stripe gate; Medium bans AI-written paywalled content outright; YouTube is the only
  payable one and its gate is audience, not software. **No line. Add to `rejected` so nobody
  re-derives it.**
- **Data challenges** (also never received). Three independent scouts — ml-competitions,
  data-challenges, hackathons — each wrote "honest monthly ceiling: **0**" for competition prizes.
  The supervisor assigned ₪4,000/month across two lines its scouts had independently scored at zero.
- **HeroX / challenge.gov** (never received): the `data-challenges` scout found US-government
  challenges commonly require the prize recipient to be a **US citizen or LPR**. That is a clean,
  large, structural NO that never reached the table.

**Rejected for a reason its own evidence refutes:**
- **"HF ZeroGPU, Google/Microsoft/AWS/NVIDIA credits, Claude for Startups — zero revenue by
  construction — cost offsets, and offsets of costs we do not have (we consume hosted LLM tokens,
  not GPUs)."** The credits scout's **wave-2 pass**, in the same file, concludes precisely the
  opposite: *"Wave 1 concluded 'credits do not touch our real cost'. That is **right about grants
  and wrong about free tiers**."* It then names three that cut LLM token cost with **zero owner
  blockers**: **Cerebras** (1,000,000 free tokens/day, no waitlist, no company, API key on signup),
  **Cloudflare Workers AI** (10,000 neurons/day free — RENDERED from Cloudflare's own docs repo,
  the strongest vendor source anywhere in this group), and OpenAI's data-sharing tokens (which the
  scout itself rules out on privacy grounds, correctly). The supervisor's stated reason for
  rejecting the criterion is refuted by the criterion's own strongest rendered evidence. The
  *conclusion* — this is not revenue — is right. The *reason* is wrong, and the wrong reason is why
  the finding was thrown away instead of handed onward.

**Rejections I would keep as written:** Tnufa, EF ESP / Arbitrum / Optimism / Gitcoin, Solana,
Filecoin, Base Builder Grants, Gitcoin issue bounties, Polar, sponsor-locked hackathons, RevenueCat
Shipaton, selling bounty-hunting tooling, Numerai. The Numerai reasoning ("the mission is to earn,
not to speculate") and the Digital Science interview kill are the two best judgement calls in the
report and both should survive into the portfolio.

---

## Supervisor's own errors

1. **Invented the base rate its largest ceiling rests on.** `~3,000 registrants against ~17 paying
   slots` and `Colosseum's 0.9%` are in none of the eight scout files. The hackathons scout wrote
   that it *"deliberately did not estimate them rather than invent a number"* and listed Colosseum
   among the searches it never ran.
2. **A firstStep that cannot be performed.** `tenstorrent/tt-metal#32178` has been assigned since
   its opening in November 2025 and its project status is "PR Submitted". All **10** open
   bounty-labelled issues in that repo are assigned. The instruction is to ask for work that is
   already taken — under a mechanism the report itself calls decisive.
3. **A ceiling above the top of the leaderboard.** ₪1,200/month for a new entrant on Base Builder
   Rewards exceeds the ~₪555–1,110/month a **top-25** builder receives under the rendered T&C
   (5 ETH / 500 builders / month, Tier 1 = 30% ÷ 25). Under the alternative reading the report
   itself offers (2 ETH/week to the top 100), a new entrant gets **₪0**. Both readings refute it.
4. **Asserted an unverified owner blocker as confirmed, and escalated it to the owner.** The
   "Human Checkmark = government ID + selfie video" claim is absent from the T&C the report cites,
   absent from the scout's evidence, and unfindable in my search. `MISSION.md` forbids inventing
   owner blockers as firmly as it forbids assuming one is done.
5. **Under-described an owner blocker in the other direction.** The Basename is called *"small
   one-time gas"*. Name registrations of this type are normally annual with renewal; if so it is a
   subscription, which the ₪200 float rule prohibits outright. Unverified either way — and
   "one-time" was asserted.
6. **Kept a candidate it believes does not exist, at ₪1,500/month.** *"The program may simply not
   exist any more"* and *"Honest ceiling ₪1,500/month"* are in the same five-line entry.
7. **Read six of eight scout files and merged accordingly.** `creator-funds` and `data-challenges`
   were never opened. The cost is not abstract: `creator-funds` contains the group's only
   Israel-specific payability finding (the Stripe gate) and it contradicts the payability claim the
   supervisor calls "the best-evidenced fact in the group". The contradiction was never reconciled
   because it was never seen. (The editor's note already corrects the coverage count; it does not
   correct the synthesis, which is still 6/8.)
8. **The truncation claim is false.** The `ai-credits-programs` report is complete on disk: a
   wave-1 pass, a full **wave-2 pass** with new rendered sources, and a clean closing
   recommendation. Describing it as *"cut off mid-finding"* justified discarding the half of it
   that mattered. This is the second supervisor in this colony to make this exact claim about a
   file that is whole.
9. **Rejected a criterion for a reason its own evidence refutes.** *"Offsets of costs we do not
   have (we consume hosted LLM tokens, not GPUs)"* — the same scout's wave-2 pass identifies three
   programmes that offset **LLM token cost specifically**, with zero owner blockers, one of them
   rendered from Cloudflare's own documentation repository.
10. **Omitted the most mission-aligned item any scout found.** The `oss-bounties` scout's closing
    paragraph: *"The one structurally different option is **TaskBounty**, because payout is gated
    on **automated sandbox verification** rather than a maintainer's mood."* Its README (RENDERED
    by me) says AI agents are explicitly invited, PRs are verified end-to-end in a sandbox before
    money moves, payouts are USDC/ETH/BTC, and it claims no KYC and no country restrictions.
    TaskBounty appears **nowhere** in the group report — not as a survivor, not in `rejected`, not
    in the merges. The single item whose payout mechanism removes the human-discretion problem the
    report identifies as the group's central flaw was dropped without a line of explanation.
11. **Presented unsourced figures as measurements.** `$65,785 across 600 bounties`, `$110 average`,
    `8–158 competing PRs` — none in any scout file, no URL, and `algora.io` blocked to the author.
12. **Dropped a constitutional finding that constrains its own #1.** The hackathons scout's AMBER on
    "meaningful human creativity" attestations never reached the intake filter, so the filter as
    written passes events we are barred from entering.
13. **Understated its strongest rejection.** The bug-bounty branch dies at the *submission* step on
    both platforms — mandatory IDV on Bugcrowd and now HackerOne, plus Bugcrowd's human-verified
    browser token — not only on the misconduct clause and not only on Bugcrowd.
14. **No ILS/USD rate and no time-to-first-shekel anywhere.** Five ceilings are stated in shekels
    from dollar and ETH inputs with no stated conversion, so not one of them is reproducible; and
    the report's own evidence (≤60 days post-paperwork on Devpost, 2–5 days post-reward on Algora,
    weekly on Base, unknown on Tenstorrent) is the most decision-relevant thing it holds and is
    never assembled.

---

## Angles the group missed entirely

1. **Agent-native bounty marketplaces — the one segment built for this operation.** TaskBounty is
   real (README rendered; site confirms an 80/20 solver split, first verified payout released
   immediately, then monthly batching at a $50 threshold, sandbox verification via E2B), and it is
   not alone: my search surfaced BountyBook (Show HN), `agentbounty.org`, `botbounty.ai` and
   `trybounty.ai` as a live 2026 category. Unknowns are large — volume, longevity, whether crypto
   payout to an Israeli resident is clean, and whether a funder-side subscription leaks into the
   solver side. But a group whose central finding is *"payment happens only if a specific human
   clicks Reward"* should have opened the door marked "payment happens when a sandbox passes".
2. **Kaggle Community Hackathons.** The 2026 successor surface to the dead creator prize,
   announced on `blog.google`, with prize pools reported up to $10,000. Nobody in this group looked
   at it, because the criterion was closed on the 2022 programme.
3. **The cost floor is this group's only defensible output, and it was thrown away.** Cerebras
   (1M tokens/day) and Cloudflare Workers AI (10k neurons/day) reduce the colony's only cost that
   scales with traffic, with **zero owner blockers** — no company, no application, no KYC. That is
   worth real ₪/month against `MISSION.md` constraint 1 (marginal cost per store approaching zero),
   it belongs to no other group, and it died in this one's rejection table.
4. **Time-to-first-shekel, and whether any of this is even bookable.** `MISSION.md` counts money
   only *"in the ledger with a real platform transaction id"*. A hackathon prize arrives as a
   PayPal transfer initiated by a sponsor's finance team; a Tenstorrent bounty by an unspecified
   rail. Whether these produce a platform transaction id at all — and if not, how the ledger and
   the manager's screen are supposed to record them honestly — is unasked, and it applies to the
   whole group.
5. **Constraint 7, in both directions.** The report never applies it. It should have, because this
   is the one group where the answer is *favourable*: a prize sponsor announces the event and
   publishes the judging, so the buyer finds us rather than the reverse — a genuinely rare property
   in this sweep and an argument the report was entitled to make and did not. The flip side is the
   line where it fails outright (a Kaggle Community Competition needs entrants nobody can acquire),
   which is also unasked.
6. **What the prizes actually net.** Every line pays the **owner as a natural person**, and the
   report says so once at blocker 9 and never prices it: 30% US withholding by default without a
   W-8BEN, Israeli personal income tax on foreign prize income, international transfer fees, ILS
   conversion. All five ceilings are gross, some by a large margin.
7. **Rail concentration is inverted here, and nobody noticed it is a strength.** Unusually for this
   colony, the group's lines sit on three genuinely independent rails — PayPal/Payoneer/Wise,
   Stripe Connect Express, and a self-custodied wallet. `MISSION.md` requires that one rail failing
   cannot take the company down; this group satisfies that better than any other and never claims
   the credit.
8. **Nothing was costed against the ₪200 float.** Survivor #2's firstStep is a mainnet deploy plus
   a Basename registration, both paid in owner funds, on a line whose corrected ceiling is ~₪60/
   month and whose own scout said "do not build for this". That is the only spend proposal in the
   group and it is the one that should not be made.

---

## Corrected group total

| # | candidate | supervisor | corrected | verdict |
|---|---|---|---|---|
| 1 | Devpost vendor AI hackathons | ₪2,500 | **₪400** | DOWNGRADED |
| 2 | Base / Talent Builder Rewards | ₪1,200 | **₪100** | REFUTED at stated figure |
| 3 | Tenstorrent tt-metal bounties | ₪1,800 | **₪0–300** | REFUTED (firstStep invalid) |
| 4 | Algora OSS bounties | ₪800 | **₪300** | DOWNGRADED |
| 5 | Kaggle Creator Prize | ₪1,500 | **₪0** | REFUTED (programme not evidenced live) |
| | **total** | **₪7,800** | **₪800** | |

Month-one revenue for the whole group is **₪0**, and the earliest defensible first shekel is
Algora's 2–5 days after a first rewarded PR — which requires Stripe Express onboarding to be
finished first.

## What this group is actually for

The supervisor's closing paragraph is the most valuable sentence in the report and survives this
audit intact: this is **cheap optionality attached to work we are doing anyway**, and the moment a
line demands a build existing only to win the prize, it is dead. At ₪800/month rather than ₪7,800
that is even more true. Two concrete outputs are worth carrying forward and neither is a ceiling:
the **Devpost payout-rail verification** (the only fully-closed factual chain in the group), and
the **Algora intake filter** (the only reusable artefact). One output the report discarded should
be carried forward too: the **free-inference cost floor**, which is the only line in this group
that changes the company's arithmetic without anyone having to win anything.
