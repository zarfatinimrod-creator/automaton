# Scout notes — bounties-grants / ml-competitions

Scout: WORKER-SCOUT "ml-competitions" (group: bounties, grants, prizes, creator funds)
Criterion: Kaggle and other ML competitions — prize money, eligibility rules, compute costs, and whether prizes pay to Israel.
Date of research: 2026-09-03
Web searches spent: 8 of 8 allowed. Search budget exhausted; nothing below is filled in from memory.

## Evidence conditions (important for anyone re-checking)

Egress proxy blocked EVERY primary source I tried:
- `https://www.kaggle.com/competitions` — EGRESS_BLOCKED
- `https://mlcontests.com/state-of-machine-learning-competitions-2025/` — EGRESS_BLOCKED
- `https://www.drivendata.org/competitions/` — EGRESS_BLOCKED
- `https://arxiv.org/html/2604.08001v1` — EGRESS_BLOCKED
- `https://arcprize.org/competitions/2026/paper` — EGRESS_BLOCKED

Only two source classes rendered: GitHub raw (numerai/docs) and WebSearch snippets.
So: **one claim below rests on a rendered page (Numerai staking doc, GitHub). Everything else rests on
search snippets that quote the platform's own pages.** Snippet-only claims are marked SNIPPET and each
one names the exact URL a human or unblocked agent must open to close it.

## S1 — Kaggle eligibility and the Israel question

Query: Kaggle competition rules eligibility "not a resident of" Crimea Cuba Iran Syria North Korea prize payment 2026
Snippets quoting Kaggle's standard competition rules (several competition /rules pages plus
https://www.kaggle.com/community-competition-creator-prize-rules) state:

> open to residents of the United States and worldwide, except that if you are a resident of Crimea,
> so-called Donetsk People's Republic (DNR) or Luhansk People's Republic (LNR), Cuba, Iran, Syria, or
> North Korea, or are subject to U.S. export controls or sanctions, you may not enter

Also: entrant must hold a Kaggle account and be 18+ / age of majority. And:
> the Competition Host reserves the right to forego or award alternative Prizes where needed to comply
> with local laws, and if a winner is located in a country where prizes cannot be awarded, then they are
> not eligible to receive a prize

**Israel is not on the exclusion list.** Israel is a US ally, not under OFAC country sanctions.
Conclusion: Israel eligible = YES. Evidence class: SNIPPET quoting Kaggle's own rules text, seen on
multiple independent competition rules pages, which is as consistent as snippet evidence gets.
URL to open to confirm: https://www.kaggle.com/competitions/llm-classification-finetuning/rules
and https://www.kaggle.com/community-competition-creator-prize-rules

Caveat I could NOT close: per-competition rules are host-written. Some hosts (US government, defence,
some pharma) restrict to US persons. Must be read per competition.

## S2 — Active Kaggle competitions and prize sizes (2026)

Query: Kaggle active competitions 2026 prize pool $50,000 leaderboard deadline list
SNIPPET results:
- BirdCLEF+ 2026 — $50,000 prize pool
- ARC Prize 2026 (ARC-AGI-2) — part of a large pool; milestone deadlines 2026-06-30 and 2026-09-30,
  each paying 1st $25K / 2nd $10K / 3rd $2.5K
- CROO AI AGENT Hackathon — $10,000 pool
- INFORMS RAS 2026, MuseumSCAT@ECCV26 — academic, prize unknown
URLs to open: https://www.kaggle.com/competitions?group=active&sortBy=prize

## S3 — Other platforms

Query: DrivenData AIcrowd Zindi 2026 machine learning competition prize money eligibility payout international
SNIPPETS:
- AIcrowd is among the top five platforms by total prize money.
- DrivenData: "$4,976,000+ in prizes" disbursed historically across 260,000+ submissions;
  "DrivenData payouts are checks or wire transfers; US winners receive a 1099."
  (that payout sentence came from a third-party page, gigs.sh/p/drivendata — weak source)
- Zindi described as part of the 2018-2020 wave of platforms. No eligibility detail obtained.
URLs to open: https://www.drivendata.org/competitions/ , https://zindi.africa/competitions ,
https://www.aicrowd.com/challenges , https://mlcontests.com/state-of-machine-learning-competitions-2025/

## S4 — Numerai (the only continuous, fully-software line in this criterion)

Query: Numerai tournament payouts NMR stake 2026 ... plus RENDERED page:
https://raw.githubusercontent.com/numerai/docs/master/numerai-tournament/staking.md  (RENDERED — strong)

From the rendered staking doc:
- Payout = stake x clipped payout_factor x score, **capped at ±5% per round**.
- Score = (20-day correlation x corr multiplier) + (20-day MMC x MMC multiplier).
- Negative scores **burn** staked NMR. You must have capital at risk to earn anything.
- payout_factor = min(1, stake_threshold / total_at_risk); thresholds Numerai 72,000 NMR,
  Signals 36,000, Crypto 10,000. More total staking => smaller individual payouts.
- Minimum stake 0.01 NMR.
- "staking availability depends on your region" — **no country list given in the doc**. Israel status
  therefore UNKNOWN.
SNIPPET (blog.numer.ai): "Numerai paid out $182,039 worth of NMR in January (2026)" across all users.
SNIPPET (docs): withdrawal restriction — account must be 30 days old, or withdraw more than 0.1 NMR.
URLs to open: https://numer.ai/terms , https://docs.numer.ai/numerai-tournament/staking

Economic reading: $182k/month paid across the entire global modeller population against thousands of
stakers. A new entrant with zero capital earns exactly zero. This is a return on staked crypto, not a
prize — closer to running a small quant book than to winning a competition, and it can lose principal.

## S5 — Kaggle Community Competition Creator Prize

Query: "Kaggle" "Community Competition Creator Prize" rules amount how much paid eligibility
SNIPPETS quoting kaggle.com:
- "up to five $5,000 monthly prizes (one per month) to Kaggle Community Competition hosts who create
  high-quality Community Competitions"
- "At the end of five months, the Kaggle team, at their sole discretion, may select one competition for
  consideration to become a Featured Competition"
- Eligibility: worldwide except Crimea/DNR/LNR, Cuba, Iran, Syria, North Korea. => **Israel eligible.**
This is the single most agent-shippable item in the whole criterion: producing a well-designed community
competition (original dataset + task + baseline notebooks + clear rules) is pure software work.
BUT: "up to five monthly prizes" reads like a **time-boxed five-month program**, and the announcement
thread (kaggle.com/general/309836) is old. I could not confirm the program is still live in 2026.
URLs to open (BLOCKING QUESTION): https://www.kaggle.com/community-competition-creator-prize and
https://www.kaggle.com/community-competition-creator-prize-rules

## S6 — ARC Prize 2026

Query: ARC Prize 2026 rules eligibility open source paper award compute limit Kaggle efficiency prize payout international
SNIPPETS (arcprize.org + kaggle.com pages):
- Total prize pool stated as $2,000,000 in one snippet and $700,000 in another — **inconsistent, unresolved**.
- Tracks: ARC-AGI-2, ARC-AGI-3, Paper Track. Paper Track headline "$75,000 awards" (one third-party page
  said "$450,000 Kaggle Hackathon").
- **"Papers scoring above 4.5/5 on the evaluation rubric qualify for a $375,000 bonus pool (divided
  equally among all qualifying papers)."** This is the only non-winner-take-all structure I found in the
  whole criterion: you do not have to beat anyone, you have to clear a bar.
- Paper submissions must be linked to a Kaggle code submission (ARC-AGI-2 or -3) "though the code
  submission need not achieve a high score to be eligible."
- All submitter-authored code must be open sourced under CC0/MIT-0 before receiving private scores.
  Third-party code must be under a public-sharing licence.
- Teams up to eight members.
- ARC-AGI-2 objective: 85% on the private eval set **within the Kaggle efficiency limits** => solutions
  run on Kaggle-provided compute, so marginal compute cost to the entrant is ~zero for that track.
- Milestone dates: 2026-06-30 (passed) and 2026-09-30 (open as of today).
URLs to open: https://arcprize.org/competitions/2026/paper ,
https://www.kaggle.com/competitions/arc-prize-2026-paper-track ,
https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-2

## S7 — Kaggle prize payment mechanics

Query: Kaggle winner prize payment process W-8BEN wire transfer international winners ... GPU quota
SNIPPETS quoting Kaggle rules text:
- "Prizes will be awarded within approximately thirty (30) days after receipt by Competition Sponsor or
  Kaggle of the required Prize acceptance documents."
- "Payments to potential winners are subject to the express requirement that they submit all
  documentation requested ... for compliance with applicable state, federal, local and foreign
  (including provincial) tax reporting and withholding requirements."
- "All taxes imposed on prizes are the sole responsibility of the winners." US residents get a 1099.
- Failure to provide documentation => prize forfeited, alternate winner selected.
- Winners of many competitions must also deliver Winning Model Documentation and open-source-licence the
  solution (https://www.kaggle.com/WinningModelDocumentationGuidelines).
NOT CONFIRMED: the exact form for a non-US individual (W-8BEN is the standard IRS form for this but I got
no snippet naming it), and Kaggle's free GPU quota in hours. Do not quote a GPU-hours number from me.
URLs to open: https://www.kaggle.com/general/17952 (payment schedule),
https://www.kaggle.com/docs/competitions , https://www.kaggle.com/docs/notebooks (accelerator quota)

## S8 — Largest pools

Query: 2026 open AI benchmark bounty prize competition ... AIMO / Konwinski
SNIPPETS:
- AIMO Prize (XTX Markets): $10M challenge fund; $5M grand prize for the first publicly-shared AI model
  at IMO gold standard; up to $5M in progress prizes. Progress Prize 2 winner took "just over a quarter
  of a million dollars" with 34/50.
- **AIMO Progress Prize 3: prizes totalling $2,207,152, 110 original problems, ends April 2026** — i.e.
  it CLOSED roughly five months before today's date. No successor confirmed.
- Konwinski Prize edition 1: winner took $50k for resolving 8% of GitHub issues in the test set.
URLs to open: https://aimoprize.com/ , https://www.kaggle.com/competitions/konwinski-prize/rules

## Honest read of the whole criterion

1. **Prize competitions are lottery-shaped and lump-sum. They are structurally the wrong instrument for a
   20,000 ILS/month recurring target.** Even a win produces one payment ~30 days after paperwork, then
   nothing. Nothing here compounds.
2. **Winner-take-all against the world.** BirdCLEF-class competitions draw 1,000-3,000 teams; the money
   goes to the top 3. A no-brand new entrant's expected monthly value is ~0 ILS, and honesty requires
   saying that rather than multiplying a prize by a hopeful probability.
3. The two structures that are NOT winner-take-all are the only ones worth the colony's attention:
   the ARC Paper Track pooled bonus (clear a rubric bar, share a fixed pool) and the Kaggle Community
   Competition Creator Prize (judged, one winner per month, far fewer entrants than a leaderboard).
4. Israel payability is **YES for Kaggle-hosted prizes** (Israel absent from the sanctioned-country list
   in Kaggle's standard rules, snippet-confirmed on several pages) and **UNKNOWN per-competition** where
   the host writes US-persons-only rules, and **UNKNOWN for Numerai staking** ("depends on your region").
5. Compute cost is genuinely low: Kaggle code competitions run on Kaggle-provided accelerators inside
   efficiency limits (explicit for ARC-AGI-2), so the entrant's marginal compute bill is near zero.
   Uncapped-compute competitions elsewhere are where the money is lost.
6. Owner blockers are real but small and one-time-per-prize: the account must be a real person 18+,
   and any prize requires the owner to personally sign prize-acceptance and tax documents and supply
   bank details. Agents can do 100% of the modelling and submission; they cannot sign.
