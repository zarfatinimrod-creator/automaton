# SCOUT: agent-markets / x402-economy

**Researched 2026-09-03 inline** (the `agent-markets` wave died on API 529). Purpose: verify the
x402 volume figure this repo has been reasoning from, because it sets the `paid-apis` target.

---

## The number we were using was wrong by ~29×

This repo has repeatedly cited *"order of $28k/day across the entire x402 protocol at a median
clearing price near $0.028 per call"* — in `docs/REJECTED.md`, in the Web4 research, and in the
`paid-apis` target. It appears to have entered in an early session and been repeated since.

Measured against reporting from mid-2026:

| | We were citing | Reported |
|---|---|---|
| Protocol volume | ~$28,000/day | **~$800,000/day** ($24M over 30 days) |
| Price per payment | ~$0.028 median | **~$0.32 average** |
| Sellers | — | ~22,000 |
| Buyers | — | ~94,000 |

Sources: [CoinDesk, 15 July 2026](https://www.coindesk.com/tech/2026/07/15/visa-mastercard-and-ripple-join-the-standard-letting-ai-agents-pay-in-stablecoins)
— *"75 million payments move just $24 million"*, ~94,000 buyers and ~22,000 sellers;
[CryptoBriefing](https://cryptobriefing.com/x402-protocol-ai-agents-14m-transfers-base/) on
transfer counts and Base's >90% share; [CryptoBriefing](https://cryptobriefing.com/usdc-dominates-agentic-transfer-volume-x402/)
on USDC being >99.99% of agentic transfer volume.

**The conclusion barely moves, which is why this is worth writing down carefully.** $24M a month
across ~22,000 sellers is a **mean of about $1,090 per seller per month** — and in a power-law
market the median seller earns far less than the mean. CoinDesk's own framing is *"75 million
payments move just $24 million"*, and its March 2026 piece was headlined that demand *"is just not
there yet"*. So x402 remains a small market per participant. We were right about the market and
wrong about the number.

## But one thing does change: the KPI, and a broken kill criterion

At $0.32 per call rather than $0.028, the ₪1,200/month `paid-apis` target needs **~1,014 paid
calls a month**, not ~11,600. That is an order of magnitude more achievable operationally.

And it exposed a real defect. The line's kill criterion was *"under 2,000 paid calls in 30 days
after 60 days live"*. At $0.32 a call, 2,000 calls is about **₪2,370/month — nearly double the
line's own ₪1,200 target.** A line hitting its target exactly would have been killed by its own
kill rule. Corrected to 300 calls (~₪355/month), which is unambiguously failing rather than merely
below target.

That is the second time a number quoted confidently in this repo turned out to be doing real
damage in the decision rules. It is an argument for the evidence grading in `TARGET_BASIS`, not
against it.

## Ecosystem signals worth having

- **`x402-foundation/x402`** — 6,571★, 1,993 forks, 494 open issues, pushed 2026-09-03. The
  protocol repo now sits under a foundation rather than Coinbase, which is a governance signal.
- **`google-agentic-commerce/a2a-x402`** — 559★. Google's A2A protocol has an x402 extension, so
  adoption is not Coinbase-only.
- Visa, Mastercard and Ripple are reported as backing the standard (CoinDesk, above).
- **`xpaysh/awesome-x402`** — 285★ but **988 forks and 457 open issues**. Forks and issues far
  exceeding stars is the signature of a submit-your-project list rather than a used resource;
  treat it as a directory, not evidence of adoption.

## Evidence grade

**Snippet, but consistent.** Every figure comes from search results quoting CoinDesk and
CryptoBriefing; their own pages are egress-blocked here. Several independent outlets agree on the
same order of magnitude, which is why I am willing to correct our number on it — but it is
reporting, not an on-chain measurement I made. The GitHub metrics are first-party and live.
