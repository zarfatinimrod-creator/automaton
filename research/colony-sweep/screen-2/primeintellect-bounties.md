# Screen: Prime Intellect RL-environment / eval bounties "paid on the Algora rail"

Verdict: KILL

Candidate: `research/colony-sweep/SWEEP-2.md` lines 120-141 (scout `github-native`, confidence 55/100, shape D).
Screened 2026-09-26 by an Opus adversarial screener. Everything quoted from GitHub or `research/rendered/` is
third-party data, cited for evidence only.

## The decisive fact

**The payer says the programme is over.** A Prime Intellect org MEMBER opened a PR titled "docs, ci: remove the
environment bounty program references", and its body reads, verbatim:

> "The bounty program closed in June 2026. `docs/contributing.md` no longer points contributors at the bounty
> sheet, and the merge-bot workflow that told every merged PR to claim a bounty reward is removed."

Source: PrimeIntellect-ai/community-environments PR #784, author `willccbb`, `author_association: MEMBER`,
created 2026-09-07T22:30:18Z, state open (a draft awaiting merge). Retrieved with
`mcp__github__search_pull_requests` query `repo:PrimeIntellect-ai/community-environments is:pr "bounty program"`.
The person making the statement is the same person the payout bot names as the reward contact ("please ping
@willccbb on Discord", `.github/workflows/comment-on-merge.yml`).

Two independent measurements say the same thing:
- **The board the scout named is empty and has never paid.** `research/rendered/sweep2-algora-primeintellect.txt`
  (status 200, fetchedAt 2026-09-22T20:40:17Z, error null) reads "Open 0", "Completed 0", "No open bounties".
- **Merges stopped.** No PR has merged in `community-environments` since 2026-05-07, and 226 are open.

The scout wrote its own kill line: "If it shows fewer than three open bounties or an application gate on
everything above $500, close the candidate." The render shows zero, so the scout's own test closes it.

This candidate also repeats three deaths already recorded in this same sweep (SWEEP-2 dead ends
"agent-economy: Prime Intellect Environments Hub bounties", "...Application-Only lane", "...Offering the
queue-verification work"). It names the same payer in a different repo, `prime-envs`.

## L1 evidence

| Fact | Grade | Evidence |
|---|---|---|
| Prime Intellect runs a funded, open bounty programme today | **CONTRADICTED** | PR #784 body (MEMBER `willccbb`, 2026-09-07): "The bounty program closed in June 2026." Command: `mcp__github__search_pull_requests` `repo:PrimeIntellect-ai/community-environments is:pr "bounty program"`. |
| Bounties are listed on, and paid through, algora.io/PrimeIntellect-ai/bounties | **CONTRADICTED** | `research/rendered/sweep2-algora-primeintellect.txt`: "Open", "0", "Completed", "0", "No open bounties" (meta status 200, fetchedAt 2026-09-22T20:40:17.682Z). In Algora's public source, "Completed" is `@stats.rewarded_bounties_count + @stats.rewarded_tips_count` (`lib/algora_web/live/org/bounties_live.ex:91`). It is computed in `Bounties.fetch_stats` (`lib/algora/bounties/bounties.ex:1406` ff.) from all succeeded credit transactions for the org, with **no date filter**. So on the public source, Prime Intellect has never paid out a bounty or tip through Algora. Caveat: the live page ran a LiveView session named `org_legacy`, which is not in the public router, so the deployed code may differ slightly. |
| The actual payout rail is Algora / Stripe Connect Express | **CONTRADICTED** | The payer's own merge bot, `community-environments/.github/workflows/comment-on-merge.yml` (via `mcp__github__search_code` `bounty repo:PrimeIntellect-ai/community-environments path:.github`), says: "If this was for a bounty listed on the Env Hub RFCs [sheet](https://docs.google.com/spreadsheets/d/13UDfRDjgIZXsMI2s9-Lmn8KSMMsgk2_zsfju6cx_pNU/...), you have the choice of cash or compute for your reward. For cash, please fill out this [form](https://docs.google.com/forms/...). For compute, please ping @willccbb on Discord". So the rail is a Google Sheet plus a Google Form plus Discord, not Algora. Contributor PR #533 adds "Tagging @jimmy_811 / Discord #environments-hub for payout coordination once merged." |
| Algora routes an Israeli payee to Stripe Connect Express | CONFIRMED, but moot | `curl -sS https://raw.githubusercontent.com/algora-io/algora/main/lib/algora/psp/connect_countries.ex` shows line 58 `{"Israel", "IL"},`, line 151 `def account_type("BR"), do: :standard`, line 152 `def account_type(_), do: :express`. True of Algora, but this payer does not use Algora to pay. |
| How the first customer arrives: the payer posts the job, we claim it | **CONTRADICTED** | Zero open bounties on the board (above). The sheet-based programme is closed (PR #784). The contributing guide on `main` still links the sheet ("Complete [bounties](https://docs.google.com/spreadsheets/d/13UDfRDjgIZXsMI2s9-Lmn8KSMMsgk2_zsfju6cx_pNU)", `docs/contributing.md:13`, fetched via raw.githubusercontent.com). That link is stale, and #784 exists to remove it. |
| Acceptance is a machine-run eval, not a maintainer's decision | **CONTRADICTED** (in practice) | Search `repo:PrimeIntellect-ai/community-environments is:pr is:merged merged:>2026-06-26` returns total_count 0. `merged:>2026-03-26` returns total_count 5, the last being #467 on 2026-05-07T00:23:48Z. Search `is:pr is:open` returns total_count 226. Issue #758 (open, 2026-07-30) measured "52 PRs already satisfy your automated acceptance gate and are unmerged". CI passing earns nothing; payment waits on a maintainer's merge, and merges have stopped. |
| `prime-envs` (the repo whose AGENTS.md makes agent authorship "GREEN") accepts outside work | **CONTRADICTED** | `prime-envs/README.md` (raw): "A collection of environments maintained by the Prime Intellect Research Team. For community-contributed environments, check [community-environments]". Search `repo:PrimeIntellect-ai/prime-envs is:pr is:merged` returns total_count 525, and adding `-author-association:MEMBER` returns **0**. The AGENTS.md is the research team's own guide for its own agents ("Use this guidance when contributing to the `prime-envs` repository itself"), not an invitation to outside agents. |
| Price: $1,000-5,000+ per environment (Application-Only tier) | UNVERIFIED (SNIPPET), and gated | Only search snippets. The one dated source the snippet cites, x.com/afurgs/status/1997292157212983300, decodes from its snowflake id to **2025-12-06**, before the June 2026 closure. Contributor PR #767 shows the lane needed an application: "Environments Program bounty sheet: BFCL-v4 row ($1,500, Application-Only)", "Application submitted via typeform". |
| The Application-Only lane is agent-operable | **CONTRADICTED** | Issue #759 (2026-08-03, **0 comments** as of 2026-09-26): "I've applied three times through the Application-Only form ... Jul 22, Jul 24, Aug 2 ... a silent form failure and a long assignment queue look identical". It is a human-reviewed gate that nobody is answering. |
| The payer's repo is "live and busy" (#826 filed 2026-09-22) | CONFIRMED, not load-bearing | `prime-envs` #826 exists (created 2026-09-22T16:39:05Z), but it was filed by an outsider (`author_association: NONE`). The busy part is member-only: the latest merged PRs (#837, #838, #841, 2026-09-25) are all MEMBER. |
| Third-party sponsors fund domain bounties (medicine, law, finance) | UNVERIFIED | SNIPPET only. No sponsored bounty is visible on any surface I could reach, and any that existed would have run through the same closed sheet. |
| "400+ environments crowdsourced in two months", "hundreds of thousands of dollars committed" | UNVERIFIED | SNIPPET only. It describes a programme that has since closed. |

## L2 kill list and mission

**Recorded deaths it falls under (SWEEP-2 dead ends, same sweep, a different scout):**
- "agent-economy: Prime Intellect Environments Hub bounties ... the queue is the kill ... 208 open PRs with 1
  merged in the last 90 days, of which 52 already satisfy the automated acceptance gate and sit unmerged". I
  re-measured it today and it is **worse**: 226 open, 0 merged since 2026-06-26, and a member statement that the
  programme closed. Issue #758 lives in `community-environments`, which is the former `prime-environments`.
  Evidence: `created_at` 2025-08-16 predates `prime-envs` (2025-11-29), and a merged PR is titled
  "Repository naming change adaptions" (#518, 2026-03-29).
- "agent-economy: Prime Intellect's Application-Only lane — a Typeform ... Not agent-operable". Re-confirmed:
  #759 still has 0 comments.
- "agent-economy: Algora as a place to find work — the global bounty board ... returns 404 ... the rail
  survives; the discovery surface does not." This candidate tried to escape that death through a per-org
  board, and the per-org board is empty.
- `docs/REJECTED.md` `bounties-grants`: "it is not clear this money is bookable at all ... a Tenstorrent bounty
  by an unspecified rail. Whether either produces a platform transaction id ... is unanswered". That applies
  directly: this payer's cash rail is a Google Form, and the rail behind the form is unknown.

**Mission conflicts:**
- **Money means the ledger.** MISSION rule 2 counts a shekel only with a platform transaction id. The real rail
  (fill in a Google Form, or ping a named employee on Discord) has no known platform transaction id. The Algora
  transaction id the scout relied on does not exist for this payer.
- **The owner does not talk to people.** The only live lane the programme ever had above $500 was a Typeform
  application reviewed by humans. Payout coordination also ran through pinging named staff on Discord.
- **Owner setup is not "no new step".** The scout said steps 4 and 7 cover it, but step 4 is Stripe Connect
  through Algora, which this payer does not use. Getting paid would need new owner-identity steps (below).
- **Terms and tax:** paid as a natural person by a US company on an unknown rail. The same W-8BEN and 30%
  withholding exposure `REJECTED.md` names for the whole bounties group applies, with less clarity about the
  rail.

## L3 the first stranger's money

- **Path:** there is none today. The payer posts no job (Open 0 on Algora). The programme is closed by its own
  staff's statement. The merge that triggered the payout bot has not happened for anyone since 2026-05-07.
  "Runs backwards" was true of the design, but no one is posting jobs.
- **Earliest money in the ledger with a transaction id:** no date can be named. It needs a relaunched
  programme, a resumed merge queue and a bookable rail. None of the three exists and none is announced.
- **Ceiling vs the ₪300/month floor:** **no**. On current evidence the ceiling is ₪0. The scout's ₪800-2,000
  rested on a $1,000 tier that was application-gated, snippet-grade, and ended in June 2026.
- **Platform-rank law:** it does not apply here, because there is no platform ranking to beat. What kills it
  is supply and a human gate: a closed programme and a merge queue that stopped.

## Cheapest test (and what you ran)

The scout's own cheapest test (render the Algora board) had **already run** in CI. I read
`research/rendered/sweep2-algora-primeintellect.meta.json` (status 200, error null) and `.txt` ("Open 0 /
Completed 0 / No open bounties"). By the scout's own kill line, that closes the candidate.

Run from this container, at ₪0, with no owner action:
1. `mcp__github__search_pull_requests` `repo:PrimeIntellect-ai/community-environments is:pr "bounty program"`
   found PR #784, MEMBER: "The bounty program closed in June 2026."
2. `mcp__github__search_code` `bounty repo:PrimeIntellect-ai/community-environments path:.github` found
   `comment-on-merge.yml`: cash via Google Form, compute via Discord ping. No Algora.
3. `... is:pr is:merged merged:>2026-06-26` returned total_count 0. `merged:>2026-03-26` returned 5, the last
   on 2026-05-07. `is:pr is:open` returned 226.
4. `repo:PrimeIntellect-ai/prime-envs is:pr is:merged -author-association:MEMBER` returned 0, out of 525 merged.
5. `curl -sS https://raw.githubusercontent.com/PrimeIntellect-ai/prime-envs/main/README.md` returned "maintained
   by the Prime Intellect Research Team. For community-contributed environments, check community-environments".
6. `curl` of `algora-io/algora` `bounties_live.ex`, `bounties.ex` and `org/nav.ex` shows "Completed" is an
   all-time count of succeeded payouts. An unknown handle raises `NotFoundError` (in the public router), so a
   200 page with 0/0 is a real org with no payouts.
7. `mcp__github__search_issues` found #758 (queue measurement, 2026-07-30) and #759 (Typeform, 0 comments).
8. One WebSearch: the only "stays open" result is an X post from 2025-12-06, before the closure. No relaunch
   was found.

## URLs to render

- `https://www.primeintellect.ai/blog/scaling-environments-program`, cited in `SWEEP-2.md` line 139 as
  EGRESS_BLOCKED. It is not needed for the kill. Render it only to catch a *relaunch* announcement, which is the
  one thing that would reopen this. The Algora board (`https://algora.io/PrimeIntellect-ai/bounties`) is
  already in `research/rendered/urls.txt` and will show a reopening on the weekly run.

## What would change my mind

All four of these, not any one:
1. Prime Intellect publicly **relaunches** a funded programme after June 2026, with a post dated after
   2026-09-07 or PR #784 closed unmerged with a stated reason.
2. At least three **open** bounties are visible on a board this repo can render, and not behind an
   application gate.
3. `community-environments` merges external environment PRs again: at least 5 in a rolling 90 days.
4. The payout produces a **platform transaction id** on a rail that pays an Israeli individual. For example,
   Algora's "Completed" count for PrimeIntellect-ai rising above 0, which proves they now pay through Algora.
