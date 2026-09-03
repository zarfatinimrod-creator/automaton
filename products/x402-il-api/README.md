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
npm test          # 15 tests, including the real paywall factory
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
| `X402_NETWORK` | `base` | Settlement network |
| `X402_FACILITATOR_URL` | unset | Override the default facilitator |
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

## Honesty

Every validator checks **format and checksum only**. Nothing here verifies that a person, a phone line or a bank account exists, and no request is stored or logged beyond ordinary server output. The bank endpoint says so in its own response body. Transliteration is rule-based and documented as approximate, not a standard romanisation.
