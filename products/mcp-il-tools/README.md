# mcp-il-tools

An MCP server for the Israeli data checks that agents get wrong: the teudat-zehut
check digit, phone number classification, bank and branch codes, the Hebrew calendar,
and Hebrew-to-Latin transliteration.

Free, MIT, no account, no key, no network calls. Everything runs locally.

## Install

```json
{
  "mcpServers": {
    "il-tools": { "command": "npx", "args": ["-y", "@zarfatinimrod/mcp-il-tools"] }
  }
}
```

Registry name: `io.github.zarfatinimrod-creator/il-tools`.

## Tools

| Tool | What it answers |
|---|---|
| `validate_israeli_id` | Is this teudat zehut valid? Pads to nine digits first, which is the step most implementations skip. |
| `validate_israeli_phone` | Is this number valid, and is it mobile, landline, VoIP, toll-free (1-800), national-rate (1-700) or premium (1-900)? |
| `validate_israeli_bank` | Is this bank code, branch and account plausible, and which bank is it? |
| `hebrew_date` | What is this Gregorian date in the Hebrew calendar, and is it a Hebrew leap year? |
| `transliterate_hebrew` | Latin transcription of Hebrew text, for slugs and filenames. Approximate by design. |

Each returns JSON. Invalid input comes back as a result explaining why, not an exception —
callers are agents, and an agent can act on `{"valid": false, "reason": "..."}`.

### On 1-800

Israeli service numbers are not one class. **1-800 is toll-free** and costs the caller
nothing; **1-900 is premium-rate** and costs a lot; **1-700 is national-rate**. An earlier
version of this code reported all three as "premium", which told callers a free number
would charge them. They are now distinguished, and none of them gets an E.164 form,
because these prefixes are not internationally diallable.

## What this is honest about

- **Transliteration is approximate.** It is rule-based, not a standard romanisation, and
  every response says so. Do not use it for legal names.
- **Bank validation is structural.** It checks the code, branch and account shape and names
  the bank. It cannot tell you the account exists or belongs to anyone.
- **ID validation is a check digit.** A valid teudat zehut is a well-formed number, not a
  real person. It cannot confirm identity.

## The paid version, and why it is separate

The same logic is sold per-call over the x402 protocol in
[`products/x402-il-api`](../x402-il-api), for agents that would rather pay a fraction of a
cent than run a process. This package is not crippled to sell that one: identical
validators, no rate limit, no telemetry, nothing withheld. The paid API exists for callers
who want an HTTP endpoint instead of a dependency.

The validators here are a byte-identical copy of the API's `src/israeli.ts`, because a
published package has to stand alone. A test asserts the two files match, so the copy cannot
drift.

## Development

```bash
npm install     # a committed lockfile is required: plain `npm install` cannot
npm test        # resolve vitest's peer graph from scratch on npm 10.9.7
npm run build
```
