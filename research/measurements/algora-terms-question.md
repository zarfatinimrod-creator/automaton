# Do Algora's terms allow an automated contributor? — an open question on a committed line

**Status: READ (RENDERED 26.9.2026 00:44 UTC), answered in part; the part that decides the line is a
judgement queued for the Fable board.** Raised 26.9.2026 by the huntr screener of sweep 2
(`research/colony-sweep/screen-2/huntr.md`, §L2, "One note outside this candidate, for the board").

## Answer — what the terms actually say

Source: `research/rendered/algora-terms.txt`, fetched by `render-watch.yml` from `https://algora.io/legal/terms`,
HTTP 200, `Last updated: 08/17/2021` (line 61).

1. **Scope.** The terms *"govern your use of our web pages located at https://algora.io"* (lines 81-86), and
   *"These Terms apply to all visitors, users and others who wish to access or use Service"* (lines 104-106).
   "Service" is not defined more narrowly anywhere on the page.
2. **The automation clause, verbatim** (lines 258-260), under "Additionally, you agree not to": *"Use any robot,
   spider, or other automatic device, process, or means to access Service for any purpose, including monitoring
   or copying any of the material on Service."*
3. **Nothing on authorship.** The page has no clause about who or what writes a pull request, about AI, agents or
   bots as contributors, or about bounties at all (grep for robot/automat/agent/AI/bounty/claim/GitHub: the
   only clause on automated access is the one above).

**So both unquoted readings were half right.** Taskman's "Algora's terms prohibit robotic access" is true — of
algora.io. This repo's "Algora's terms do not prohibit agent-authored PRs" is literally true — the terms are
silent on PRs — but it left out the one clause that binds us.

**What it means mechanically (checked in this repo, 26.9):**
- The colony's own code never touches algora.io: `src/revenue/bounties/intake.ts:10` — *"It fetches nothing.
  GitHub search finds the issues carrying `algora-pbc[bot]`"*; no file under `src/`, `scripts/` or `.github/`
  calls algora.io. Claims are a `/claim #N` line in a GitHub PR body, per Algora's own bot template
  (`intake.ts:83-85`).
- **Our research tooling did breach it, twice:** `render-watch.yml` fetched `algora.io/PrimeIntellect-ai/bounties`
  on 22.9 and this terms page on 26.9 — an automatic process accessing the Service. Both URLs are now removed from
  `research/rendered/urls.txt`, with the reason, so the weekly job never fetches algora.io again. The captures stay
  as the record.

**What stays open — a judgement, queued for the Fable board (`logs/FABLE_QUEUE.md` item 4 reads this file):** does an
automated contributor that works only on GitHub, whose `/claim` is then processed by Algora's own GitHub App, "use
[an] automatic … means to access Service"? One reading: no — the automated party never loads algora.io; the only
algora.io use is the owner's one-time, human Stripe onboarding (owner step 4). The other: yes — the claim, the
reward and the payout are the Service, reached through Algora's bot, and a 2021 clause written against scrapers
still covers them. That is a reading of a contract with money and an account ban on the line, which the model rule
gives to Fable. **Until it rules, nothing more is built on `oss-bounties` and the owner is not asked to do step 4 for
its sake.**

**The rule written before the page was read, and why it is not applied here.** "What each answer does" below was
written first, and its first branch says: if the terms prohibit automated or robotic access, *"the line as designed
is dead"*. Read literally, that branch fires. It carried a premise — *"The PR author would be an automated account
acting on Algora's platform"* — and that premise is exactly the point the page leaves open: the clause binds access to
algora.io, and the colony's automation never goes there. I am not applying the kill myself, and I am not reading the
clause as permission either: the conservative default holds (nothing built, no owner step for it), and the board
rules with this paragraph in front of it. If it finds the premise holds, the pre-written rule applies as written.

## Why it matters

`oss-bounties` is a committed line (₪300 of the ₪1,500 target in `src/revenue/portfolio.ts`), with owner
steps 7 and 4 queued for it. Its permission rests on one sentence written in the first sweep:

> **Algora's terms do not prohibit agent-authored PRs — the risk is per-repo maintainer policy, and it is
> real.** — `research/colony-sweep/groups/bounties-grants.md:133-134`, repeated in
> `src/revenue/bounties/policy.ts:5-6`

That sentence quotes no clause of the terms. The evidence around it is about payability (Algora's own
`lib/algora/psp/connect_countries.ex`) and claim mechanics, not about the terms of service.

## The contrary claim

A comparable autonomous-income project on GitHub records Algora as closed for exactly this reason:

- `joyelgeorge/Taskman` `packages/core/income/venues.js:125-126` — *"platform terms prohibit robotic
  access, so this system may not participate — a human with the same account could"*
- the same file, `:141-142` — *"What remains true is that Algora's terms prohibit robotic access."*
- `joyelgeorge/Taskman` `docs/BRAIN-TRANSFER.md:118` — *"Algora terms prohibit robotic access"*, and
  `:370`, `algora-bounties` **KILLED**: *"Terms prohibit robotic/automated access — holds regardless of
  country"*

Fetched 26.9.2026 from `raw.githubusercontent.com`. It quotes no clause either. So the repo holds two
unquoted, opposite readings of the same document; neither is evidence of what the document says.

## The one page that settles it

Algora's footer links its terms as `href="/legal/terms"` on algora.io
(`research/rendered/sweep2-algora-primeintellect.html`, the rendered Algora page), i.e.:

https://algora.io/legal/terms

This container cannot open it (`curl https://algora.io/legal/terms` → no response, 26.9.2026, one
attempt). It was fetched once by `render-watch.yml` (`research/rendered/urls.txt` §9) and then removed from
the list — see "Answer" above.

## What each answer does

- **The terms prohibit automated or robotic access, or bots operating accounts:** the line as designed
  is dead, whatever the repository policy filter says. The PR author would be an automated account
  acting on Algora's platform. It goes to `docs/REJECTED.md`, owner steps 7 and 4 lose their reason for
  this line, and the ₪300 leaves the target sum.
- **The terms are silent on automation, or restrict only scraping of the site:** the first-sweep sentence
  becomes true for the first time, with a clause to cite. `policy.ts` should quote that clause instead of
  the sweep's summary.
- **The page renders as a JavaScript shell with no text:** the question stays open. It must not be read
  as permission.

Until the page is read, the line is not built past what already exists, and the owner is not asked to do
step 4 for its sake.
