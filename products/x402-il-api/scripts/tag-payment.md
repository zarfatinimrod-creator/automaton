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

## Which tag to use

| Buyer | Tag |
|---|---|
| Developers and agents paying for the endpoints in this product | `[line:paid-apis]` |
| Agent-to-agent services registered on the agent card | `[line:agent-services]` |

Both lines are served by this one codebase; the tag is what separates their ledgers,
so their kill and scale decisions stay independent.

## How it flows

1. An agent pays; the facilitator settles USDC to the wallet.
2. The runtime records the inbound transfer in `transactions` with the tag in its description.
3. `revenue_ledger_sync` (hourly) imports it — idempotently, keyed on the transaction id, so re-running never double-counts.
4. The supervisor sees it at the next review; the board sees it in the daily directive.

## Recording a payment by hand

When a payment arrives outside the runtime (a manual settlement, a direct transfer),
record it once with its real transaction id:

```bash
pnpm exec tsx scripts/colony.ts record \
  --line paid-apis --kind sale --amount 200 --currency USD \
  --source x402 --external-id 0xTRANSACTION_HASH
```

`--amount` is in minor units: 200 = $2.00. The external id makes the entry
idempotent, so running the command twice is safe.
