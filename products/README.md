# products/

Sellable products built by the revenue colony. Each directory is standalone (own package.json, tests, README with deploy steps and the owner's one-time setup). They are intentionally outside the root pnpm workspace so the automaton runtime build stays independent.

| Product | Revenue line | Rail | Owner one-time step |
|---|---|---|---|
| `apify-il-open-data` | apify-actors | Apify Store pay-per-event | Apify account + KYC + PayPal |
| `il-biz-tools` | il-biz-tools | Static site + Paddle checkout | Paddle seller account |
| `pcn874` | pcn874 | Gumroad | Gumroad account — step 3 of `docs/OWNER_STEPS.he.md` |
| `telegram-il-tools-bot` | telegram-bots | Telegram Stars to TON via Fragment | create the bot with @BotFather and hand over the token; no KYC |
| `x402-il-api` | paid-apis / agent-services | x402 (USDC on Base) | none for x402; exchange account to cash out |

Line ids come from `src/revenue/portfolio.ts` and do not all match their directory
name; this table is the mapping. Lines with no product yet: `templates`,
`dev-extensions`, `hebrew-content`, `oss-bounties`.

`pcn874` is a **validator only** and has no price. Its layout was rendered from three
independent open-source implementations, not from the Israel Tax Authority specification,
which is egress-blocked here — `products/pcn874/docs/SPEC-FROM-SOURCES.md` cites every
field and records the seven places the sources disagree. Nothing legal ships from that line
until the real document has been read; `.github/workflows/pcn874-spec-watch.yml` is the
step that makes reading it possible from a session with egress.
