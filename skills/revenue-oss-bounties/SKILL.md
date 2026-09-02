---
name: revenue-oss-bounties
description: Playbook for open-source bounties (experimental, unverified payout to Israel).
auto-activate: false
---

# Open-source bounties — director playbook

Before enabling: the creator must confirm the bounty platform pays out to Israel (several use Stripe Connect, which does not serve Israel). Until confirmed this line stays in awaiting_setup.

Loop
1. Daily scan of funded bounties on platforms attached to GitHub; filter to TypeScript/Python/docs/tests within the colony's strengths and under 2 days of work.
2. At most two attempts in parallel; follow the maintainer's contribution guide exactly; tests must pass in CI.
3. Open the PR from the creator's connected account; claim only when merged; record each payout via revenue_record with the bounty id.
4. Track attempts, merged PRs, acceptance rate; stop after 10 attempts if acceptance is under 25%.

Never: submit low-effort PRs, spam maintainers, or claim work that was not merged.
