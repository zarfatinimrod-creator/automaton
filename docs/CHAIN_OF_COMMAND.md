# Revenue Colony — chain of command

The revenue colony is the income engine layered on the automaton's orchestration
primitives (`goals → planner → task_graph → workers`). It adds a hierarchy with
explicit mandates, a ledger that is the only source of truth for money, decision
rules that are code, and an audit chain that checks the checkers.

```
BOARD (parent automaton)            daily; immediately on escalation
├── CHIEF AUDITOR                    monthly: audits the auditors
│   └── AUDITOR                      weekly: re-derives every supervisor decision from the ledger
├── DIRECTOR <line-1>                continuous while the line has an active goal
│   ├── SUPERVISOR supervisor-<line-1>   every 6h: files hold/scale/pivot/kill/escalate
│   └── WORKERS                      per task, from the planner
├── DIRECTOR <line-2> …
```

| Level | Owns | Must never |
|---|---|---|
| board | target, portfolio, budget, launch/kill/scale, one goal at a time | count projected money; keep a line past its kill rule without a written rationale; do human KYC/setup |
| director | one line's operating loop; ledger + KPI recording; escalating human steps | spam/ToS violations; accounts in the creator's name; spend over budget; "live" without a working payment path |
| supervisor | recompute metrics from the ledger; apply the rules; file a review | change status directly; accept numbers not in the ledger; skip a review |
| worker | one task to its success criteria | act outside scope; touch credentials not granted |
| auditor | sample supervisor reviews; recompute; flag disagreement; structural ledger checks | edit anything; audit itself |
| chief auditor | verify audits happened and flags were acted on | approve a period with missing audits; modify records |

## The loop (heartbeat tasks)

| Task | Cadence | What it does |
|---|---|---|
| `revenue_ledger_sync` | hourly | pulls money events from Stripe / Lemon Squeezy / Gumroad (env keys) and `[line:<id>]`-tagged x402 transfers into `revenue_ledger`; idempotent on `(source, external_id)` |
| `revenue_supervisor_review` | every 6h | per line: `computeLineMetrics` → `decideLine` → review row; non-hold decisions request a board review |
| `revenue_board_review` | daily (or when requested) | seeds the portfolio on first run; applies kill/scale/pivot/escalate; starts ready lines; retries failed goals up to 3× then pauses; caps experiments; reallocates budget; feeds the next queued goal to the orchestrator; writes the directive into the system prompt |
| `revenue_audit` | weekly (+ monthly chief audit) | recomputes each supervisor decision from the stored metrics; flags disagreements; checks duplicate external ids and spend on killed lines |

The board files **one goal at a time** (`revenue.goal_queue` in KV) because the orchestrator processes goals sequentially. A line becomes `live` only when a positive ledger entry lands on it — "live" is defined by money, not by a status a director sets.

## Decision rules (`src/revenue/rules.ts`)

1. `awaiting_setup` and setup not done → **escalate** (creator must act).
2. `building` for 30+ days with no revenue → **escalate** (director must ship, or the board kills).
3. Live 45+ days and 30-day revenue < ₪500 → **kill**.
4. Live 21+ days and costs > 2× revenue → **pivot**; a second time → **kill**.
5. 30-day revenue ≥ target with ≥ 50% margin → **scale** (status `scaling`, grow goal queued, budget boost).
6. 7-day run-rate < 40% of the 30-day level → **escalate** (fix goal).
7. 21+ days without revenue on a live line → **escalate**.
8. At most 3 experimental lines active at once; newer ones are paused.

Budget (`allocateBudget`): tier weight (core 3 / growth 2 / experimental 1) × (1 + target attainment) × 1.5 if scaling; zero to lines marked kill; a floor per surviving line.

## Human setup is a first-class state

Every line lists the one-time actions only the creator can do (accounts in their name, identity checks, payout details). Such lines sit in `awaiting_setup` and are never started. When the creator confirms, the board calls `revenue_setup_done` with the evidence; the build goal is queued.

## Tools

`revenue_status`, `revenue_lines`, `revenue_line_detail` (read), `revenue_record`, `revenue_kpi`, `revenue_map_product`, `revenue_launch_line`, `revenue_setup_done`, `revenue_propose_line`, `revenue_set_target`, `revenue_board_review`, `revenue_sync_ledger` (write), `revenue_decide` (board/supervisor decisions; audited).

## Configuration

| Key | Where | Default |
|---|---|---|
| `revenue.enabled` | KV | `1` |
| `revenue.target_monthly_agorot` / `revenue.stretch_monthly_agorot` | KV | 2,000,000 / 5,000,000 (₪20k / ₪50k) |
| `revenue.monthly_compute_budget_cents` | KV | 20,000 |
| `revenue.fx.USD` etc. | KV | 3.6 ILS per USD |
| `STRIPE_SECRET_KEY`, `LEMONSQUEEZY_API_KEY`, `GUMROAD_ACCESS_TOKEN` | env | connectors are skipped when absent |

Schema: migration v12 (`revenue_lines`, `revenue_ledger`, `revenue_reviews`, `revenue_kpi_snapshots`).
