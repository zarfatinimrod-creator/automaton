# products/

Sellable products built by the revenue colony. Each directory is standalone (own package.json, tests, README with deploy steps and the owner's one-time setup). They are intentionally outside the root pnpm workspace so the automaton runtime build stays independent.

| Product | Revenue line | Rail | Owner one-time step |
|---|---|---|---|
| `apify-il-open-data` | apify-actors | Apify Store pay-per-event | Apify account + KYC + PayPal |
| `il-biz-tools` | il-biz-tools | Static site + Paddle checkout | Paddle seller account |
| `telegram-il-tools-bot` | telegram-bots | Telegram Stars to TON via Fragment | create the bot with @BotFather and hand over the token; no KYC |
| `x402-il-api` | paid-apis / agent-services | x402 (USDC on Base) | none for x402; exchange account to cash out |

Line ids come from `src/revenue/portfolio.ts` and do not all match their directory
name; this table is the mapping. Lines with no product yet: `templates`,
`dev-extensions`, `hebrew-content`, `oss-bounties`.
