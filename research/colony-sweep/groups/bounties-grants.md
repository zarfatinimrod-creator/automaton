# Group report — bounties-grants

**Supervisor:** SUPERVISOR (Opus 5). **Date:** 2026-09-03.
**Group:** Bounties, grants, prizes and creator funds.
**Scout reports received:** 6 criteria (OSS bounty platforms; authorized bug bounty; Kaggle/ML
competitions; online hackathons; protocol & ecosystem grants; AI/cloud credits & accelerators —
this last one arrived **truncated mid-finding**). **Two of the eight scouts' reports never reached
me.** I am not going to describe this group as covered by eight agents when I received six.

> **Editor's note, added after the wave closed.** The refusal to overstate coverage is the right
> instinct and it is kept verbatim. But the files disagree with it: all eight
> `bounties-grants--*.md` scout reports are on disk — `ai-credits-programs`, `bug-bounty`,
> `creator-funds`, `data-challenges`, `hackathons`, `ml-competitions`, `oss-bounties`,
> `protocol-grants`. **The group is 8/8 covered.** The two the supervisor never received are
> `data-challenges` and `creator-funds`, and the synthesis below was written without them.
> This is the second supervisor in a row to under-report its own coverage this way, which is why
> the supervisor prompt now tells supervisors to list the scouts directory and read their group's
> reports off disk before they start.

---

## Headline

There is money in this group, but it is **thin, lumpy and lottery-shaped**. My honest merged
ceiling across all five survivors is roughly **₪5,000–8,000/month at full maturity**, and only
**one** line in the entire group pays on a recurring schedule (Base/Talent Protocol Builder
Rewards, weekly). Everything else is a one-off prize you may or may not win.

Three structural facts decide the group:

1. **Prizes are not revenue.** A grant, a bounty and a hackathon prize are one-off lump sums with
   no renewal. Against a ₪20,000/**month** target, a ₪90,000 grant that lands once is a cash
   event, not an income line. I have therefore refused to score any line on its headline prize
   and scored it on what it can plausibly produce *every month*.
2. **The whole authorized-bug-bounty branch is dead by platform terms, not by economics.**
   HackerOne's misconduct policy bans automated report delivery outright; Bugcrowd requires a live
   webcam selfie before a single submission. Our operating model is exactly what is prohibited.
   This is a hard rejection, not a discount.
3. **2026 is the year OSS turned against agent-authored contributions.** curl closed its bug
   bounty after 20 AI-generated non-vulnerabilities in 21 days; GitHub shipped repo-level controls
   to disable or cap external PRs (2026-08-27). Any bounty line we run has to be built on an
   intake filter that *excludes* repos hostile to AI contributions, plus disclosure and instant
   stop-on-request. That is a design constraint, not a footnote.

---

## Verification I ran myself (not taken on the scouts' word)

| Claim | Scout | My verdict |
|---|---|---|
| Devpost pays winners via PayPal / Payoneer / Wise, USD international transfer, up to 60 days, W-8BEN for non-US individuals | hackathons | **CONFIRMED** (2026-09-03) — search result quoting `help.devpost.com/article/114` gives all four facts, plus the winner-eligibility form fields (legal name, DOB, city/country of residence, sponsor-employee declaration). This was the single load-bearing unverified fact in the group and it now holds. All three rails serve Israel. |
| GitHub Security Lab CodeQL query bounty is "the one GREEN shape" but may be closed | bug-bounty | **CONFIRMED CLOSED.** `github/securitylab` Discussion **#828 — "Sunsetting the GitHub CodeQL Bug Bounty Program"**. Not accepting submissions. The scout was right to flag it and right to refuse to build on it. Rejected. |
| Digital Science 2026 Catalyst Grant: £25,000 equity-free, global, individuals eligible, deadline 5 Oct 2026, no revenue or finished build required | credits/accelerators | **HALF CONFIRMED, THEN KILLED.** Amount, theme, deadline and global individual eligibility all confirmed. But the scout missed the decisive fact: **"Strong applicants are invited to a short interview with a live demo."** Judges score across seven areas including *team*. An interview is the owner talking to people. **Rejected on MISSION §1**, not on payability. This is the clearest example in the group of why supervisors verify. |
| Base / Talent Protocol Builder Rewards is live and permissionless | protocol-grants | **CONFIRMED LIVE, with a correction and a new blocker.** 2 ETH/week to the top 100 Base builders (not the "5 ETH monthly / 500 builders" in the operator's own T&C — the sources genuinely disagree, so treat the pool as ±3x). Base's *Creator* Rewards were killed 2026-02-15; **Builder** Rewards survived. **New owner blocker the scout flagged as unverified and I confirmed: the "Human Checkmark" requires a government ID upload plus a short selfie video.** That is a camera appearance. |
| Kaggle Community Competition Creator Prize: $5,000/month, Israel eligible | ml-competitions | **ELIGIBILITY CONFIRMED, LIVENESS NOT.** Exclusion list confirmed as Crimea/DNR/LNR, Cuba, Iran, Syria, North Korea — Israel absent, worldwide otherwise. $5,000 to one winner per month, and "a competition does not have to be created during the prize month, it must simply be live at some point during the award month." **Whether the program still runs in 2026 is still unconfirmed** — kaggle.com is egress-blocked to me too. Kept, gated on one page load. |
| Algora total payout volume | oss-bounties | **NOT CLOSED, and it matters.** The only figure obtainable anywhere remains **$65,785 across 600 bounties as of October 2023 — a $110 average.** No 2026 volume figure exists in any reachable source. algora.io is egress-blocked. The Israel-payability fact is solid (Algora's own `connect_countries.ex` gives IL a Stripe Connect Express account); the *size of the market* is not. |
| Base Builder Grants (Coinbase, retroactive, 1–5 ETH) | — (found during verification) | **CONFIRMED but not applicable as a line.** No application: recipients are found via ecosystem activity and a public *nomination* form, then contacted directly; W-8/W-9 before funds move. One-off per project, discovery driven by X/Farcaster visibility. Recorded as an attachment to the Base line, not as its own store. |
| Filecoin devgrants still accepting applications by GitHub issue | protocol-grants | **PARTLY CONFIRMED** — repo live, README describes an active grant platform, Open Grants up to $50,000, applications filed as GitHub issues (the only fully agent-operable foundation application in the group). Rejected anyway: we ship nothing on Filecoin, so entering means building *to* a grant, and open RFPs read "Stay tuned!". |

**Egress reality check.** algora.io, help.devpost.com, digital-science.com, eurekalert.org,
gitcoin.co, blog.google and kaggle.com were all blocked to me as well. Every "CONFIRMED" above
except the two GitHub ones rests on a search result quoting the primary page, corroborated where
possible. Good enough to decide where to build; not good enough to publish to a user.

---

## Merges and deduplication

- **Devpost mid-size vendor hackathons + Google/Devpost mega hackathons** → one line. They are the
  same operational pipeline, the same rails, the same forms, the same intake filter. Mega events
  are worse odds for the same build cost; they are entered only when a mid-size build adapts at
  near-zero marginal hours. Merged rather than double-counted.
- **Polar** appeared twice (bounty platform; payout rail). Its issue-funding product is parked and
  absent from its own README. It survives here **only** as a note for the payment-rails group:
  Polar is a Merchant of Record that lists Israel among its Stripe Connect Express payout
  countries. Not a revenue line in this group.
- **Kaggle** appeared under both ML-competitions and hackathons. The ML scout's version is better
  evidenced and is the one kept; the hackathon scout's Kaggle paragraph was an admitted blank.
- **"Agent PRs are the ecosystem's enemy"** and **"bounty money is retreating to invite-only
  tiers"** are the same finding seen from two criteria. Merged into constraint 3 above; neither is
  a line, both are intake rules.

---

## Ranked survivors

### 1. Devpost vendor-sponsored AI hackathons — score 62
Mid-size ($8k–$25k pool) sponsor hackathons on Devpost. Deliverable is a public repo, a working
demo, a **screen-recorded** sub-3-minute video and a README — no camera, no live pitch, no
selling. Solo entries eligible; the better events explicitly permit AI coding assistants.
Payout rails confirmed today. Israel is absent from every exclusion list seen across ~10
independently mirrored rule sets — but that is *negative* evidence and one sponsor's list was much
longer, so eligibility is re-read per event, every time.
**Honest ceiling ₪2,500/month.** ~3,000 registrants against ~17 paying slots in the one event with
real numbers; the only hard base rate anywhere in the group is Colosseum's 0.9%.
**First step:** run `GET https://devpost.com/api/hackathons?status[]=open&challenge_type[]=online`
from an unblocked runner and write every open cash-prize event to
`research/colony-sweep/data/devpost-open.json`.
**Kill:** 6 genuine entries across 6 different events returning ₪0, or any single build exceeding
40 hours.

### 2. Base / Talent Protocol Builder Rewards — score 55
The **only recurring payer in the group**: weekly ETH to ranked Base builders, no application, no
proposal, no judge. Paid straight to a wallet; compliance is automatic OFAC screening of the
address, and Israel is not OFAC-listed. It fits what we already do — `products/x402-il-api`
settles on Base — so the qualifying activity is work we would do anyway, which is exactly what the
terms' anti-gaming clause demands.
**Honest ceiling ₪1,200/month** and realistically ₪300–800 for a new entrant: the pool is fixed
and split by rank against full-time Base-native teams.
**First step:** deploy the existing `products/x402-il-api` settlement contract to Base mainnet
from a wallet the owner controls and verify the source on Basescan.
**Kill:** under ~₪200 cumulative after 8 weeks of genuine Base shipping — the rank is too low for
the tier split to ever matter. Kill instantly if the only way to climb is activity we would not
otherwise do.

### 3. Tenstorrent tt-metal bounties — score 48
The best *terms* in the group: a named company, published bounty terms, sanctions-only
eligibility, and — decisively — **payment requires prior assignment to the issue**, so it is not
an open PR race. Live bounties confirmed by GitHub issue search on 2026-09-03: $35,000, $5,000,
$2,500, $2,000 and a standing family of $1,500 TTNN model bring-ups.
The binding constraint is **hardware**, not competition: these are kernel/ML bring-ups on
Tenstorrent silicon, and we have none.
**Honest ceiling ₪1,800/month** (one $1,500 bounty a quarter).
**First step:** comment on `tenstorrent/tt-metal#32178` asking to be assigned and asking what
hardware or cloud access assigned bounty participants get — one GitHub comment, agent-operable,
and it resolves the only question that matters.
**Kill:** no assignment after 3 requests, or no free hardware/simulator path for external bounty
participants, or 40 engineering hours with no benchmarked PR.

### 4. Algora OSS bounties — score 38 — **the one AMBER I kept, deliberately**
Israel payability is the best-evidenced fact in the group (Algora's own
`lib/algora/psp/connect_countries.ex` assigns IL a Stripe Connect Express account) and the claim
mechanics are documented in Algora's own repo. I am keeping it at AMBER rather than re-rating it
GREEN to get past my own rejection rule: **Algora's terms do not prohibit agent-authored PRs — the
risk is per-repo maintainer policy, and it is real.** The line is only permissible behind a hard
intake filter: submit only to repos whose contribution policy permits AI-assisted PRs, disclose
agent authorship on every PR, submit only work we have actually verified correct, and stop
instantly on any maintainer's request. Without that filter this line violates the constitution
regardless of what Algora's terms allow.
Economics are the real weakness: a $110 average bounty in the last measurable year, against 8–158
competing PRs on a fresh bounty within hours.
**Honest ceiling ₪800/month.**
**First step:** build the intake filter — fetch the `CONTRIBUTING.md` and `.github/` policy files
of every repo with an open Algora bounty over $250 and emit the allowlist of those that permit
disclosed AI-assisted contributions.
**Kill:** 20 genuinely-correct, disclosed PRs with fewer than 2 merged and rewarded — or one
maintainer asking us to stop, which kills the line immediately and permanently.

### 5. Kaggle Community Competition Creator Prize — score 30
Kaggle pays **creators**, not solvers: $5,000 to one host per month for a high-quality Community
Competition. Building a competition — dataset, task, metric, starter notebooks, rules — is pure
software work and is the most agent-shippable item in the entire group; and we already run
`products/apify-il-open-data`, so we have a lawful original-dataset story rather than scraped
data we have no rights to. Israel eligibility confirmed today.
**The program may simply not exist any more.** It reads as a time-boxed five-month run announced
years ago, and kaggle.com is blocked to every agent here.
**Honest ceiling ₪1,500/month** — roughly an 8% hit rate on a $5,000 monthly prize, not the prize
itself.
**First step:** open `https://www.kaggle.com/community-competition-creator-prize` from an unblocked
runner and record whether it is accepting entries in 2026 — one page load decides whether this
line exists.
**Kill:** the page shows the program ended; or we cannot name an original dataset we hold the
rights to publish.

---

## Rejected, and why

| Line | Reason |
|---|---|
| **HackerOne bug bounty** | Its misconduct policy states verbatim that it "doesn't tolerate any sort of automated delivery of reports from scanners, scripts, browser automation frameworks, etc." Our model is precisely that. Also one non-transferable account bound to one natural person. |
| **Bugcrowd bug bounty** | Mandatory **live webcam selfie** plus government ID *before a single report may be submitted*. Two independent kills: the camera gate, and the same automated-submission ban. |
| **Intigriti** | Onfido liveness check before payout; Israel payability never confirmed either way; and the automated-submission problem is unresolved everywhere in this market. |
| **Fully autonomous submission agent against bug bounty programs** | Explicitly forbidden by platform terms and by our constitution. Recorded so no future scout re-derives it as a fresh idea. Expected outcome is a permanently burned identity. |
| **GitHub Security Lab CodeQL query bounty** | **Verified closed** — `github/securitylab` Discussion #828, "Sunsetting the GitHub CodeQL Bug Bounty Program". It was the only GREEN shape in the bug-bounty criterion. |
| **Digital Science 2026 Catalyst Grant (£25,000)** | **Verified: shortlisted applicants are interviewed with a live demo.** The owner does not talk to people. Rejected on the mandate, despite being otherwise excellent — global, equity-free, individuals eligible, open until 5 Oct 2026. |
| **Israel Innovation Authority "Tnufa" (up to ₪200,000)** | The largest number in the group and the least eligible: a Hebrew government application, signed legal undertakings, a **royalty liability on future revenue**, 12 months of milestone and financial reporting, and a probable review committee. That is ongoing manual ops, not a one-time identity step. |
| **Ethereum Foundation ESP / Arbitrum / Optimism RetroPGF / Gitcoin QF** | All one-off and round-based; all require KYC and, in the EF and Arbitrum cases, a **signed legal grant agreement**. None recurs, and we have no traction on any of these chains. Optimism additionally gates on hundreds of unique addresses interacting with our contracts, which we do not have. |
| **Solana Foundation grants** | Their own process schedules a call with a subject-matter expert and a legal negotiation. Owner human work. Dead on the mandate. |
| **Filecoin devgrants** | The only fully agent-operable foundation application found (submissions are GitHub issues) — but we ship nothing on Filecoin, open RFPs read "Stay tuned!", and entering means building *to* a grant. Bad ordering. |
| **Base Builder Grants (1–5 ETH retroactive)** | You cannot apply for yourself; recipients are discovered and nominated, and discovery runs on X/Farcaster visibility. One-off per project. Kept as an attachment to survivor #2, not as its own store. |
| **Gitcoin issue bounties** | Sunset. Bounties and hackathons handed to Buidlbox; Grants Stack wound down. Nothing to build. |
| **Polar issue funding** | Parked — absent from Polar's own README; the product pivoted to AI/usage billing. Survives only as a payout-rail note for the payment-rails group. |
| **Opire, BOSS (boss.dev), IssueHunt, Bountysource** | Snippet-only, no rendered page, no volume data, Israel payability unverified. BOSS shows 972 installs across all of GitHub, implying near-zero bounty flow. Unassessed, not opportunities. |
| **Selling bounty-hunting tooling** | Commoditised: ~49 GitHub repos of free Algora radars/snipers/MCP servers, nearly all at 0–8 stars. No paying buyer identified. |
| **Kaggle featured competitions, ARC Prize, AIMO, DrivenData, Numerai** | Winner-take-most against Grandmasters and frontier labs; AIMO's round closed April 2026; Numerai requires putting owner capital at risk and can burn principal — the mission is to earn, not to speculate. Honest expected value for a no-brand entrant: ₪0/month. |
| **RevenueCat Shipaton** | Requires live App Store / Google Play listings — Apple's identity verification of a human, recurring annually, plus a $99/yr fee. A per-store blocker larger than anything else in the group. |
| **Sponsor-locked hackathons banning non-sponsor AI** | e.g. Rapid Agent: "All other artificial intelligence tools are not permitted", naming Anthropic Claude. A Claude-driven colony is disqualified. Not a workaround — an intake filter: read the AI-tools clause before the prize table. |
| **HF ZeroGPU, Google/Microsoft/AWS/NVIDIA credits, Claude for Startups** | Zero revenue by construction — cost offsets, and offsets of costs we do not have (we consume hosted LLM tokens, not GPUs). Claude for Startups additionally requires institutional equity funding; Claude for Open Source requires a 5,000-star repo. Structurally ineligible. |

---

## Owner blockers found (precise, none invented, none assumed done)

1. **One-time:** a PayPal, Payoneer **or** Wise account in the owner's own legal name, verified,
   able to receive USD international transfers with no cap below the prize amount. *(Devpost rails
   — confirmed.)*
2. **Per hackathon win:** Devpost winner-eligibility form — full legal name, date of birth,
   city/country of residence, sponsor-employee declaration — returned within ~2 business days.
3. **Per hackathon/prize win:** **W-8BEN** as a non-US individual, plus a prize affidavit. Winner
   bears all fees and taxes; prizes arrive within 60 days of completed paperwork.
4. **One-time (Algora):** Stripe Connect Express onboarding as an Israeli resident — identity
   document, address and Israeli bank account. Algora files 1099s only for US solvers; an Israeli
   solver reports the income himself.
5. **One-time (Base):** an Ethereum address the owner controls or explicitly delegates, plus a
   **Basename** registered on Base (small one-time gas from the owner's funds).
6. **One-time (Base, heaviest blocker in the group — needs an explicit owner decision):**
   Talent Protocol **"Human Checkmark"** — upload a government-issued ID **and record a short
   selfie video**. It is a one-time identity step, which the mandate permits, but it is also a
   camera appearance, which the mandate rules out. I am not resolving that tension on the owner's
   behalf. Without it, survivor #2 does not pay.
7. **One-time:** a Kaggle account owned by a real person aged 18+; on a win, personally signed
   prize-acceptance and tax documents plus bank/wire details.
8. **Per Tenstorrent bounty win:** payee details (name, country, payment information). **The
   payment rail is not specified anywhere in Tenstorrent's terms — this is genuinely unresolved**
   and is the reason that line is marked UNKNOWN on payability rather than YES.
9. **Ongoing, unavoidable:** Israeli personal tax reporting on all foreign prize and bounty
   income. Every line in this group pays the *owner as a natural person*, not the company.

---

## Scouts whose work was thin, unsourced, or absent

- **Two of eight scouts produced nothing I received.** The payload contained six criteria and the
  sixth was cut off mid-finding. I cannot vouch for work I did not read and I will not pad the
  count.
- **AI/cloud credits & accelerators** — truncated, and both of its headline items rest on search
  snippets alone. My verification killed its best item (Digital Science) on a fact it never
  checked: the interview. Its ₪200,000 Tnufa figure was never verified against
  `innovationisrael.org.il` by anyone.
- **Kaggle / ML competitions** — rendered exactly **one** primary source in the whole criterion
  (numerai docs). Every Kaggle, ARC, DrivenData and AIMO number is a snippet, and it reported the
  ARC prize pool as $2,000,000, $700,000, $450,000 and $375,000+$75,000 from four sources without
  resolving the contradiction. Honest about it, which is why it is not the weakest.
- **OSS bounty platforms** — strong on primary sources for Algora and Polar (it found the
  country lists and the claim mechanics in the vendors' own repos, at zero search cost, which was
  the best tactic used anywhere in this group). But Opire, BOSS and IssueHunt are snippet-only
  with no volume, no rendered page and no Israel check, and the only hard payout figure in the
  criterion is from **October 2023**.
- **Online hackathons** — best method in the group (third-party GitHub mirrors of Devpost rules
  pages, cross-checked against each other), but **no rules text came from an official page**, no
  live list of open events was produced, and Israel eligibility rests entirely on *absence* from
  exclusion lists.
- **Authorized bug bounty** — the most useful negative report of the sweep. It killed its own
  criterion honestly, rendered zero vendor pages and said so on every claim, and identified the
  one GREEN shape in it (CodeQL) plus the exact URL to close it. That URL closed it: the program
  is sunset. No complaints.

---

## What this group is for

It is not a pillar. At an honest ₪5,000–8,000/month ceiling, mostly lottery-shaped, this group's
job in the portfolio is to be **cheap optionality attached to work we are doing anyway**:
survivor #2 pays us for shipping on Base, which our x402 product already does; survivors #1 and #4
convert build hours we would spend regardless into occasional cash. The moment a line here demands
a build that exists *only* to win the prize, it has stopped being optionality and should be killed.
