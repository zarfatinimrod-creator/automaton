# products/

Sellable products built by the revenue colony. Each directory is standalone (own package.json, tests, README with deploy steps and the owner's one-time setup). They are intentionally outside the root pnpm workspace so the automaton runtime build stays independent.

| Product | Revenue line | Rail | Owner one-time step |
|---|---|---|---|
| `apify-il-open-data` | apify-actors | Apify Store, **published free** while the 30-day stranger count runs | step 6 — Apify sign-up with the brand username + `APIFY_TOKEN` (allowed straight after step 1; **no KYC**) |
| `il-biz-tools` | il-biz-tools | **Gumroad** (merchant of record, ILS payout rendered) — Paddle retired 7.9.2026 | step 3 — Gumroad account + token; step 5 — domain; step 6 — Netlify link |
| `mcp-il-tools` | (channel test, not a line) | none — free | step 5 — domain (DNS verification for the brand namespace); step 7 — GitHub organisation |
| `telegram-il-tools-bot` | ~~telegram-bots~~ — **PARKED** | ~~Telegram Stars → TON via Fragment~~ — killed: Fragment's payout KYC needs a selfie | none — do not start it |
| `x402-il-api` | ~~paid-apis / agent-services~~ — **standby rail, not a line** | x402 (USDC on Base), kept only while it costs ₪0/month | none |

Line ids come from `src/revenue/portfolio.ts` and do not all match their directory name; this table is the mapping. Owner steps are numbered as in `docs/OWNER_STEPS.he.md` and defined as data in `src/revenue/owner-steps.ts`.

## What the board decided on 7.9.2026, and what it means for this directory

`research/colony-sweep/BOARD.md` cut the portfolio to four lines. **No product was deleted, and none
left the CI matrix** — killing a line is a decision about how it gets paid and who finds it, not a
verdict on the code:

- **`telegram-il-tools-bot` is parked.** Its line was killed on a mandate collision: Fragment's payout
  KYC is an ID scan plus a **selfie**, and the owner's brief forbids a camera step. Nothing is built on
  it and nothing is expected from it. It re-opens only if Fragment renders a camera-free withdrawal to
  an Israeli resident (`docs/REJECTED.md`).
- **`x402-il-api` is a rail on standby.** `paid-apis` and `agent-services` were killed because the
  x402 arithmetic divides out to single-digit shekels per provider per month. The endpoint may stay
  deployed **only while it costs ₪0/month**; any USDC that arrives is booked through
  `src/revenue/connectors/x402-local.ts`, and nothing is planned on it.
- **`il-biz-tools` moved from Paddle to Gumroad.** Gumroad is the only merchant of record with rendered
  proof of ILS payout to an Israeli bank. Paddle is now an option the owner may choose knowing three
  named risks, recorded in `src/revenue/rails.ts` — never a step on his checklist.
- **`pcn874` is the one new product**, and it is not built yet (P1 in the board's list). Its spec must
  be rendered from two independent open-source implementations before any legal figure ships: a wrong
  PCN874 file is the user's VAT exposure.

**Products with no line:** `mcp-il-tools`, which is a distribution channel test rather than a
storefront, and whose registry listing is blocked on the domain (step 5) and the organisation (step 7).

**Lines with no product:** `oss-bounties`, which never gets one — it sells work performed on demand for
a named payer, so its "product" is a pull request; and `pcn874`, which is P1 and not built yet.
