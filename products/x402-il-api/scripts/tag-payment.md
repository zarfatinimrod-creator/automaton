# Getting x402 income into the revenue ledger

Payments for this API arrive as USDC in the automaton's wallet. The revenue colony
only counts money that reaches `revenue_ledger`, so each inbound payment needs to be
attributable to a revenue line.

## The tag

The colony's local connector (`src/revenue/connectors/x402-local.ts`) reads the
runtime's own `transactions` table and imports every `transfer_in` or
`credit_purchase` row whose description contains a line tag:

```
[line:paid-apis]
```

Rows without a tag are treated as funding, not revenue, and are ignored on purpose —
a top-up from the owner must never be counted as a sale.

A tagged row also carries the settlement's on-chain transaction hash, in a second tag:

```
[line:paid-apis] [tx:0x<64 hex characters>]
```

The hash is the row's platform transaction id. x402 settles USDC, so the ledger books
each receipt as USDC at its shekel value on the day it arrived (the Israeli calendar
day), flagged **unconverted**: the report and the manager's screen show it apart from
converted money, and no target, floor or rule counts it
(`research/channel-loop/RULING-2026-09-28-bounty-rail.md` §6.2). A tagged row with no
`[tx:…]` tag, or whose day has no rate recorded, is **held**: not booked, reported as a
blocker at every sync, and booked on the first sync after it can be.

## Which tag to use

| Buyer | Tag |
|---|---|
| Developers and agents paying for the endpoints in this product | `[line:paid-apis]` |
| Agent-to-agent services registered on the agent card | `[line:agent-services]` |

Both lines are served by this one codebase; the tag is what separates their ledgers,
so their kill and scale decisions stay independent.

## How it flows

1. An agent pays; the facilitator settles USDC to the wallet.
2. The runtime records the inbound transfer in `transactions` with both tags in its description.
3. `revenue_ledger_sync` (hourly) imports it — idempotently, keyed on the on-chain hash, so re-running never double-counts.
4. The supervisor sees it at the next review; the board sees it in the daily directive.

## Recording a payment by hand

When a payment arrives outside the runtime (a manual settlement, a direct transfer),
record it once with its real transaction id:

```bash
pnpm exec tsx scripts/colony.ts fx --currency USDC --date 2026-09-29 --rate 3.71
pnpm exec tsx scripts/colony.ts record \
  --line paid-apis --kind sale --amount 200 --currency USDC \
  --source x402 --external-id 0xTRANSACTION_HASH --occurred-at 2026-09-29T10:00:00Z
```

`--amount` is in minor units: 200 = 2.00 USDC. The first line records the day's rate
(ILS per USDC); without it the entry is refused rather than valued at a guessed rate.
The external id makes the entry idempotent, so running the command twice is safe.
