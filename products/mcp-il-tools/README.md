# mcp-il-tools

An MCP server for the Israeli data checks that are easy to get wrong: the teudat-zehut
check digit, phone number classification, bank and branch codes, the Hebrew calendar,
and Hebrew-to-Latin transliteration.

Free, MIT, no account, no key, no network calls. Everything runs locally.

## Install

**Status on 28.9.2026: not on npm yet.** The npm registry answered 404 for `@mehudak/mcp-il-tools` that day. One manual run of a workflow publishes it (see [Publishing](#publishing)), and that run has not happened. The config below is what it will be:

```json
{
  "mcpServers": {
    "il-tools": { "command": "npx", "args": ["-y", "@mehudak/mcp-il-tools"] }
  }
}
```

Registry name: `io.github.mehudak/il-tools` (planned, not listed in any registry yet; see [Publishing](#publishing)).

## Tools

| Tool | What it answers |
|---|---|
| `validate_israeli_id` | Is this teudat zehut valid? Pads to nine digits first (IDs with dropped leading zeros are common, and the check digit needs all nine). |
| `validate_israeli_phone` | Is this number valid, and is it mobile, landline, VoIP, toll-free (1-800), national-rate (1-700) or premium (1-900)? |
| `validate_israeli_bank` | Is this bank code, branch and account plausible, and which bank is it? |
| `hebrew_date` | What is this Gregorian date in the Hebrew calendar, and is it a Hebrew leap year? |
| `transliterate_hebrew` | Latin transcription of Hebrew text, a starting point for slugs and filenames: it keeps spaces and turns א and ע into an apostrophe. Approximate by design. |

Each returns JSON. Invalid input comes back as a result explaining why, not an exception —
callers are agents, and an agent can act on `{"valid": false, "reason": "..."}` (`hebrew_date` answers
`{"error": "bad_request", "message": "..."}` instead). One exception: an argument of the wrong
type, such as an ID or phone number sent as a number, is rejected by the MCP SDK as a plain-text
tool error, not JSON.

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
  the bank. It cannot tell you the account exists or belongs to anyone. The bank code is
  looked up in a fixed table of 18 codes (the source calls it "the major banks"); any other code
  is reported invalid.
- **ID validation is a check digit.** A valid teudat zehut is a well-formed number, not a
  real person. It cannot confirm identity.

## The paid version, and why it is separate

The same logic is exposed per-call over the x402 protocol in
[`products/x402-il-api`](../x402-il-api) — an API that is not deployed and not a revenue line since 7.9.2026 (`KILLED_LINES` in `src/revenue/portfolio.ts`; it is kept as a rail on standby), so nothing is sold there today. It was built for agents that would rather pay a fraction of a
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

## Publishing

One workflow publishes both the npm package and the MCP Registry listing:
`.github/workflows/mcp-il-tools-publish.yml`, started by hand (Actions → mcp-il-tools-publish →
Run workflow). It has no other trigger.

1. **Dry run first.** `dry_run` is ticked by default. The run installs, tests, builds and packs the
   package; checks that `package.json`, `server.json` and the tarball agree; downloads the pinned
   `mcp-publisher` and checks its sha256; and validates `server.json` against the registry. It
   publishes nothing, and its summary lists what a real run would publish.
2. **Then untick `dry_run`.** A real run publishes `@mehudak/mcp-il-tools` to npm (public, without
   provenance) and then lists `io.github.mehudak/il-tools` in the MCP Registry. It stops at its first
   step until two owner steps are done:
   - **Step 7:** the GitHub organisation `mehudak` owns this repository. The registry's GitHub
     login grants names under `io.github.<repository owner>/` only, so this is what makes
     `io.github.mehudak/il-tools` publishable.
   - **Step 9:** an npm account `mehudak`, which owns the `@mehudak` scope, and a token that can
     publish to it, saved as the repository secret `NPM_TOKEN`.

A version already on npm is not published again. To release a new one, change `version` in
`package.json`, both `version` fields in `server.json`, and the server's own version in
`src/server.ts` together; a test fails if they differ.
