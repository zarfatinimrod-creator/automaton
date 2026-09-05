# x402-il-api

Israeli and Hebrew utility endpoints sold **per request** over the [x402](https://x402.org) protocol — HTTP 402 with USDC settlement on Base. Buyers are AI agents and developers who need one small correct answer and do not want an account, an API key or an invoice.

Revenue lines: `paid-apis` and `agent-services` in the automaton's revenue colony.

## Why this line exists

x402 is the only rail in the portfolio that needs **no account and no KYC from the owner**. Payments land directly in the automaton's own wallet. That makes it the first thing that can earn while every other line is still waiting on a one-time signup.

Honest caveat: organic x402 demand in 2026 is small. This line is deliberately cheap to run and shares its domain logic with the Apify actor line rather than being a standalone bet.

## Endpoints

Free, so agents can discover us:

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness, and whether the paywall is armed |
| GET | `/pricing` | Machine-readable price list |
| GET | `/.well-known/x402.json` | The same list at the conventional discovery path |

Billable (default $0.002, JSON repair $0.004):

| Method | Path | Returns |
|---|---|---|
| POST | `/v1/validate/israeli-id` | Teudat zehut checksum validation |
| POST | `/v1/validate/phone` | Israeli phone validation, type, and E.164 form |
| POST | `/v1/validate/bank` | Bank/branch/account **format** check, with the bank's name |
| GET | `/v1/hebrew-date?date=YYYY-MM-DD` | Gregorian → Hebrew date (defaults to today) |
| POST | `/v1/transliterate` | Hebrew → Latin, rule-based |
| POST | `/v1/json/repair` | Repairs malformed JSON, the kind LLMs emit |

Full schemas in [`openapi.yaml`](openapi.yaml).

## Pricing floor, and why

The Coinbase CDP facilitator gives 1,000 free settlements per month and charges $0.001 for each one after that. A price at or below $0.001 would lose money on every call past the free tier, so `X402_PRICE_USD` defaults to **$0.002** and JSON repair — the only endpoint with real CPU cost — is double.

## Run it

```bash
npm install
npm test          # 22 tests, including the real paywall factory against the real v2 middleware
npm run build
node dist/index.js
```

Free mode (no wallet set) starts with a warning and serves everything unpaid — useful for development and for letting an agent try before it pays.

Paid mode:

```bash
X402_PAY_TO=0xYourWallet X402_NETWORK=base node dist/index.js
```

| Variable | Default | Meaning |
|---|---|---|
| `X402_PAY_TO` | unset | Wallet that receives USDC. **Unset means free mode.** |
| `X402_NETWORK` | `base` → `eip155:8453` | Settlement network, CAIP-2. `base` and `base-sepolia` are mapped; anything else must be CAIP-2 |
| `X402_FACILITATOR_URL` | unset (`https://x402.org/facilitator`) | Override the facilitator. Paid mode's one network dependency |
| `X402_PRICE_USD` | `0.002` | Price per billable request |
| `PORT` | `8402` | Listen port |

Deploy on any Node 20+ host: a Conway sandbox with an exposed port, Fly, Railway, a VPS. No database, no state, no build step beyond `tsc`.

## Calling it as an agent

Unpaid request returns the challenge:

```bash
curl -sS -X POST https://your-host/v1/validate/israeli-id \
  -H 'content-type: application/json' -d '{"id":"000000018"}'
# HTTP 402 + the x402 payment requirements
```

With an x402 client (`x402-fetch`, `x402-axios`, or any wallet that speaks the protocol) the payment header is attached automatically and the same call returns:

```json
{ "input": "000000018", "normalized": "000000018", "valid": true }
```

## What the owner has to do

**For x402: nothing.** No account, no KYC, no payout setup — earnings accrue as USDC in the wallet the automaton already controls, and they can pay for the automaton's own compute directly.

Converting that USDC to shekels later needs a one-time Israeli exchange account with KYC. That step is only required to *cash out*, never to *earn*.

## x402 v2 — migrated 5.9.2026, and what changed underneath

This API ran on `x402-express@1.2.0` (v1 protocol, last published 2026-04-16) until 5.9.2026, while
the ecosystem had moved to the scoped `@x402/*` line (2.25.0 published 2026-09-04, same maintainers,
same Apache-2.0, same `x402-foundation/x402` repo). Found by `scripts/check-deps-freshness.mjs`'s
predecessor — by hand — and now on `@x402/express`, `@x402/core` and `@x402/evm` at 2.25.0.

**The protocol change a client has to know about.** In v2 the payment requirements travel in the
`PAYMENT-REQUIRED` response header, base64-encoded JSON, not in the 402 body. This API's 402 body is
a small JSON of its own — `error: "payment_required"` plus a pointer to `/pricing` — so an agent that
only reads bodies still learns where to look. Network ids are CAIP-2 (`eip155:8453` for Base
mainnet); `X402_NETWORK=base` and `base-sepolia` are still accepted and mapped, anything else must
already be CAIP-2 or the process refuses to start, because a guessed network is a guessed
settlement chain for real money.

**The operational change.** v2 will not build a single 402 until it has asked the facilitator which
(scheme, network) pairs it supports. v1 built the challenge locally. So paid mode now has one
network dependency — the facilitator (`https://x402.org/facilitator` unless `X402_FACILITATOR_URL`
says otherwise) — and if that call fails, the first paid request answers with a **5xx and the
endpoint stays shut**. It never falls through to a free response. Free mode and the discovery
endpoints are unaffected.

**What the tests now prove that they did not before.** The real middleware, the real EVM scheme, the
real price-to-USDC conversion and the real route matching all run in the suite; only the facilitator
hop is stubbed, through a seam in `Config`. So the suite asserts, from a real 402, that the wallet is
ours, the network is `eip155:8453`, `$0.002` became exactly `2000` atomic units and JSON repair
`4000`, that a bogus `payment-signature` or `x-payment` header does not unlock a route, and that an
unreachable facilitator produces a 5xx rather than a 200. 22 tests.

**Two things found on the way, recorded because they will bite again:**

- **The old dependency tree was a browser wallet UI inside a headless API.** `x402-express@1.2.0`
  pulled `x402` → `wagmi` → `porto` → `react` and `@tanstack/react-query`. The v2 server packages
  depend on none of it. `npm install` had only ever succeeded because the lockfile froze a
  consistent tree; touching it exposed a React 18-vs-19 peer conflict entirely inside the old
  packages.
- **npm 10.9.7 crashes on `vitest@4.1.11` + `@x402/*` in the same manifest** — `Cannot read
  properties of null (reading 'edgesOut')` in arborist's `#loadPeerSet`, reproducible in an empty
  directory. Bisected: remove vitest and it installs; keep vitest and pass `--legacy-peer-deps` and it
  installs; move to `vitest@5.0.0` and it installs cleanly with no flag. This product is on vitest 5
  for that reason and no other. The other four products are still on 4.1.11 and unaffected until
  they take an `@x402` dependency.

## Honesty

Every validator checks **format and checksum only**. Nothing here verifies that a person, a phone line or a bank account exists, and no request is stored or logged beyond ordinary server output. The bank endpoint says so in its own response body. Transliteration is rule-based and documented as approximate, not a standard romanisation.
