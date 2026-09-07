---
name: revenue-oss-bounties
description: Director playbook for the Algora OSS-bounty line — intake filter, disclosed AI authorship, brand machine account only. Blocked on owner steps 7 and 4.
auto-activate: false
---

# Algora OSS bounties — director playbook

**Line:** `oss-bounties`, ₪300/month (BOARD.md §3). **Ledger today: ₪0.**
**Status:** `awaiting_setup`. Nothing may be attempted until **owner step 7** (brand machine
account + `BRAND_GITHUB_TOKEN`) and **owner step 4** (Stripe Connect Express through Algora,
signed in as that account) are both done. Step 7 comes first: an organisation cannot sign in
anywhere, so the account that signs into Algora is the account whose name appears on every PR.

**Why this line exists at ₪300 rather than at its ceiling.** It is the only line whose
acquisition runs backwards — the payer posts the job, funds it in advance and publishes the
acceptance criteria — so no stranger has to find us (MISSION constraint 7). And Algora's own
`lib/algora/psp/connect_countries.ex` lists `{"Israel","IL"}` and routes it to a Stripe Connect
Express account: the only code-level Israeli payability proof the 121-criterion sweep produced.

## The pipeline

1. **Find.** GitHub search for issues carrying an `algora-pbc[bot]` bounty comment. GitHub is the
   one host this container reaches; `algora.io` is EGRESS_BLOCKED and always has been.
2. **Read the repository's policy.** `assessRepoPolicy()` over `CONTRIBUTING`, `CODE_OF_CONDUCT`,
   the PR template and the README. `forbidden` → walk away. `unknown` → treated as `disclose`,
   never as `allowed`; silence is not consent.
3. **Score.** `selectBounties()` returns at most two candidates and an explicit `skipped` list with
   the rule that refused each one. Read the skipped list: a filter nobody argues with is a filter
   that has stopped filtering.
4. **Attempt.** Comment `/attempt #N` **from the brand machine account** with a real
   implementation plan. Two in parallel, never three.
5. **Build and verify.** Tests pass in CI before the PR exists. Follow the repo's contribution
   guide exactly.
6. **Open the PR** from the brand machine account with the body `pullRequestBody()` produces, and
   run `auditPullRequestBody(body, { forClaim: true, ownerIdentifiers })` before posting. It fails
   the body if the disclosure sentence is missing, the recording placeholder is unfilled, the brand
   placeholder is unfilled, or any handle, email or byline appears.
7. **Record the demo.** Algora's own bot template: *"To claim a bounty, you need to provide a short
   demo video of your changes in your pull request."* A screen capture of the tests and the fixed
   behaviour. Record it, then link it.
8. **Claim.** `/claim #N` in the PR body — that is where Algora's bot says it goes.
9. **Ledger.** A payout counts **only** when Stripe pays out through Algora and the entry carries
   the platform transaction id. Nothing before that is revenue: not a merge, not a "Reward" click,
   not an expected amount. Money means the ledger (MISSION rule 2).

## The rules that are not negotiable

- **Two in parallel, maximum.** Enforced in `selectBounties`, not in judgement. A third eligible
  bounty is returned in `skipped` with `no-slot-free` and re-offered on the next scan.
- **Stop on the first request.** One maintainer asking us to stop closes the PR, ends attempts in
  that repository permanently, and — per the line's own kill criterion — kills the line. No reply
  arguing the point, no second account, no other repository under the same org.
- **Brand machine account only.** Never the owner's GitHub handle. A pull request is a published
  byline and the mandate forbids his name on anything we publish. This is the single correction
  BOARD.md §5 made to this line.
- **Disclose on every PR.** Unconditionally, including where the policy says nothing and where it
  explicitly permits AI work. `AI_AUTHORSHIP_DISCLOSURE` is the exact sentence; do not paraphrase it.
- **The pay floor: ₪37.50 per estimated hour.** Derived, not picked: ₪300/month is 20% of the
  ₪1,500 the board committed, so this line owns 32 of MISSION constraint 4's 160 agent-hours a
  month → ₪9.375/hour realized → divided by the line's own 25% kill-threshold acceptance rate →
  ₪37.50/hour gross, about $10.42/h. On the ~$110 average bounty that allows about ten and a half
  hours. `deriveBountyFloor()` shows the arithmetic and moves when the board's numbers move.

## The colony must never

- Open a PR from the owner's account, or put his name, handle, email or any byline in a PR body.
- Submit undisclosed AI work anywhere, for any reason, on any repository.
- Attempt a bounty in a repository whose policy bans AI-authored or automated contributions —
  whatever Algora's terms allow. This is the AMBER on the line (CHIEF-AUDIT §2.1 row 6).
- Fabricate a demo: describe, link or imply a recording that does not exist.
- Claim work that was not merged, or record revenue without a platform transaction id.
- Race an issue somebody else attempted in the last 7 days, or one the maintainer already assigned.
  Maintainers flooded with agent PRs take the first that arrives; entering that race costs the full
  price of the work and usually loses it.
- Sign a CLA, join a Discord, take a call, or accept anything needing a design review — the owner
  does not talk to people and we do not invent owner steps.

## KPIs and kill criteria

| KPI | Where it comes from |
|---|---|
| bounties attempted | `/attempt` comments from the brand account |
| pull requests merged | GitHub |
| payouts in ILS | `revenue_ledger`, transaction id required |
| acceptance rate | merged ÷ attempted |

**Kill:** no Algora payout in the ledger 90 days after the first attempted bounty; or acceptance
under 25% over 10 attempts; or an AI ban found in more than half the candidate repositories in a
month; or **one maintainer asking us to stop** — that one is immediate and permanent.
**Scale:** 30-day revenue at or above ₪300 with acceptance above 60%.

## Open questions, stated rather than buried

- **The bounty-comment layout was never rendered.** The `/attempt`, `/claim` and demo-video text is
  quoted from Algora's own `bot_templates.ex`; the **amount line is not** — no scout fetched a live
  bounty comment. `parseAlgoraBotComment` therefore reads the amount loosely and `scoreBounty`
  cross-checks it against the candidate. Re-render a real comment when a runner with egress exists.
- **The economics are thin.** The audit found the "$65,785 across 600 bounties" and "8–158 competing
  PRs" figures appear in no scout file. The only accepted figures are a $50–$2,500 range and a ~$110
  average. Treat ₪300 as a bound, not a measurement.
- **Stripe-Israel is settled at country level, not account level.** Owner step 4 answers it either
  way, and the same form settles the question for every other Connect platform in `docs/REJECTED.md`.

## Code

`src/revenue/bounties/` — `policy.ts` (repo policy), `intake.ts` (scoring, cap, floor, bot parser),
`disclosure.ts` (PR body and its audit). Tests: `src/__tests__/revenue/bounties-*.test.ts`.
Nothing is wired into the heartbeat, deliberately: a loop that attempted a bounty before owner
steps 7 and 4 exist would publish a pull request under the owner's handle.
