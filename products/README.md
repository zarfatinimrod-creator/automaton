# products/

Sellable products built by the revenue colony. Each directory is standalone (own package.json, tests, README with deploy steps and the owner's one-time setup). They are intentionally outside the root pnpm workspace so the automaton runtime build stays independent.

| Product | Revenue line | Rail | Owner one-time step |
|---|---|---|---|
| `apify-il-open-data` | apify-actors | Apify Store pay-per-event | Apify account + KYC + PayPal |
| `il-biz-tools` | il-biz-tools | Static site + Paddle checkout | Paddle seller account |
| `x402-il-api` | paid-apis / agent-services | x402 (USDC on Base) | none for x402; exchange account to cash out |
