# SCOUT: agent-markets / apify

**Researched 2026-09-03 inline** (the `agent-markets` wave died on API 529). Evidence is
**first-party** — Apify's own documentation repository on GitHub, reachable when `docs.apify.com`
and `apify.com` are not.

**Why this criterion:** `apify-actors` carries our largest single target (₪3,000/month), and after
finding that the x402 figure we had been quoting was wrong by ~29×, the same question had to be
asked here: is the earnings figure underneath this target actually sourced?

---

## The answer: no, and now it is labelled

`src/revenue/portfolio.ts` cites *"roughly $470/developer/month on average and about $4k MRR for
the single most successful independent creator"*, and the playbook cites an **80% revenue share**.

**Apify's own docs contain neither figure.** `sources/platform/actors/monetizing/monthly-payouts.mdx`
covers payouts in detail and states no revenue-share percentage and no typical earnings. Those
numbers came from a partner or marketing page, not documentation — the same evidence class as the
x402 number that turned out to be off by 29×.

They are not *disproved*, and I have nothing better to replace them with. They are now marked
unverified where they are used, so they cannot keep being repeated as if measured.

## What the docs do confirm, verbatim

- **Payout minimums:** *"$20 for PayPal and Wise"*, *"$100 for other payout methods"*.
- **Schedule:** *"Payout invoices are automatically generated on the 11th of each month"*, requiring
  approval by the 14th, after which they are *"automatically approved"*.
- **Losing Actors are floored, not netted:** *"When it happens, Apify automatically sets that
  Actor's profit to $0 for the month. This way, a single Actor's loss doesn't reduce your total
  payout."*

## The third one is a real finding for the final goal

A loss-making Actor is floored at **$0**, not subtracted from the rest. So publishing many Actors
carries **no downside drag on the payout** from the ones that fail — the failures cost their own
platform usage and nothing more.

That matters because MISSION's final goal rests on launching hundreds of stores where roughly 95%
earn nothing. In most channels those failures accumulate a cost. Here they do not net against the
winners, which makes Apify one of the few surfaces where the portfolio model has **no downside
drag by design**, only the per-Actor upkeep.

It also sharpens the existing kill criterion. An Actor priced below its own platform usage cost
does not lose us money elsewhere — it simply earns zero while consuming compute. That makes it a
*silent* failure rather than a bleeding one, which is exactly the kind the no-progress watchdog in
`src/revenue/watchdog.ts` exists to catch.

## Still unverified, and worth someone's search budget later

The revenue-share percentage, the earnings distribution across creators, and whether the ~$470
average is a mean over all registered developers (including the many with zero users, which would
make it near-meaningless) or over active ones. Apify's partner page would settle it; it is
egress-blocked here.
