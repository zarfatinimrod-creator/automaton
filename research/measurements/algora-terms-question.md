# Do Algora's terms allow an automated contributor? — an open question on a committed line

**Status: UNSETTLED. Nobody in this repo has read Algora's terms.** Raised 26.9.2026 by the huntr
screener of sweep 2 (`research/colony-sweep/screen-2/huntr.md`, §L2, "One note outside this candidate,
for the board").

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
attempt). It is queued for `render-watch.yml` in `research/rendered/urls.txt` §9.

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
