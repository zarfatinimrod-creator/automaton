# Claim audit — `products/x402-il-api/README.md`

Audited 2026-09-25 against the working tree at `245a19e` (branch `claude/new-session-j071dx`; the only
untracked path is `research/owner-docs-audit/`). This is the Opus half. A separate refuter checks the
findings before anything changes. **I edited nothing except this file.**

Method: I read the document line by line and pulled out every checkable claim. I checked each one against
the repo using code, lockfile, tests, logs, and read-only `git log`/`grep` runs. I did not use web search.
For claims about external platforms (the npm registry, the x402 SDK internals, the upstream README, CDP
pricing), I checked only whether the repo backs them. None of them has a rendered source in
`research/rendered/` (`grep -rli "x402\|coinbase" research/rendered` → nothing). They are marked **X**
(external, out of scope) and are not graded.

Commands run (all read-only):

- `grep -cE "^\s*it\(" products/x402-il-api/tests/api.test.ts` → `37`. `grep -nE "\.(skip|only|todo|each|skipIf|runIf|concurrent)\b|test\(" …` → no output. Per `describe`: 3 + 6 + 3 + 13 + 2 + 3 + 5 + 2 = 37.
- **I could not run the suite.** `products/x402-il-api/node_modules` does not exist. The root `node_modules` has no `supertest`, `express`, `jsonrepair`, `@hebcal/core` or `@x402/*` (`node -e "require('<m>/package.json')"` → MISSING for each; `viem` 2.45.3 only). No `@x402` tarball is in `~/.npm/_cacache`. Installing would mean calling the npm registry, which this audit's rules forbid. The test count is therefore static and exact. Behaviour claims rest on the test file's assertions plus the record that it passed (`logs/2026-09-05-x402-v2-migration-and-vertical-niches.md:64`, 35/35 at that commit).
- `python3` over `package-lock.json` → `@x402/core|evm|express|extensions` 2.25.0, all `"license": "Apache-2.0"`, all `"optional": true`. `vitest` 5.0.0 has engines `^22.12.0 || ^24.0.0 || >=26.0.0`. No runtime (non-dev) package has an engines floor above 18.
- `grep -cE '"node_modules/(.*/)?(react|wagmi|porto|@tanstack/react-query|x402|x402-express)"' package-lock.json` → `0`.
- `grep -o '"vitest": "[^"]*"' products/*/package.json` → apify-il-open-data 3.2.7, il-biz-tools 4.1.11, mcp-il-tools 4.1.11, **pcn874 5.0.0**, telegram-il-tools-bot 4.1.11, x402-il-api 5.0.0.
- `cmp products/mcp-il-tools/src/israeli.ts products/x402-il-api/src/israeli.ts` → identical. `grep -rln "israeli\|teudat\|zehut" products/apify-il-open-data/src products/apify-il-open-data/test` → nothing.
- `git rev-parse --is-shallow-repository` → `true`. History starts at `a65a5b2` (2026-09-07), so the README and the test file look unchanged since then. Earlier states come only from logs.
- `ls ~/.automaton` → no such directory. `grep -rn X402_PAY_TO` outside the product's `src`/`tests` → only the README and a sibling audit.

Status key: C = CORRECT, W = WRONG, S = STALE, U = UNSUPPORTED, X = external, out of scope.

## Every claim checked (one line each)

| # | line | claim (short) | st | evidence |
|---|---|---|---|---|
| 1 | 3 | sold per request over x402, HTTP 402, USDC on Base | C | `config.ts:47-50,61` default `base`→`eip155:8453`; `app.ts:183,225` |
| 2 | 3 | buyers need no account or API key | C | `app.ts` has no auth middleware |
| 3 | 5 | revenue lines `paid-apis` and `agent-services` | **S** | F5 |
| 4 | 9 | x402 is the only rail in the portfolio needing no account/KYC | **S** | F6 |
| 5 | 9 | payments land directly in the automaton's own wallet | **U** | F4 |
| 6 | 9 | first thing that can earn while every other line waits on a signup | **S** | F6 |
| 7 | 11 | organic x402 demand is small | C | `portfolio.ts:416` (~₪6/provider/month) |
| 8 | 11 | shares its domain logic with the Apify actor line | **W** | F9 |
| 9 | 15-21 | `/health`, `/pricing`, `/.well-known/x402.json` are free | C | registered before the paywall, `app.ts:217-238`; tests `:333-344` |
| 10 | 19 | `/health` says whether the paywall is **armed** | **W** | F11 |
| 11 | 20-21 | `/pricing` and `/.well-known/x402.json` serve the same list | C | `app.ts:233-234` share `pricingBody()` |
| 12 | 23 | default $0.002, JSON repair $0.004 | C | `config.ts:74,158`; test `:343` |
| 13 | 27 | israeli-id: teudat zehut checksum | C | `israeli.ts:9-24`, `app.ts:241-245` |
| 14 | 28 | phone: validation, type, **and E.164 form** | **W** | F13 |
| 15 | 29 | bank: format check plus bank name | C | `israeli.ts:91-102` |
| 16 | 30 | hebrew-date `?date=YYYY-MM-DD`, defaults to today | C | `app.ts:258-261` (UTC today) |
| 17 | 31 | transliterate, rule-based | C | `israeli.ts:125-147` |
| 18 | 32 | JSON repair | C | `app.ts:276-289` |
| 19 | 34 | full schemas in `openapi.yaml` | C | all nine paths at `openapi.yaml:18-198` |
| 20 | 38 | CDP: 1,000 free settlements/month, then $0.001 | X | repo research only, snippet grade: `research/colony-sweep/scouts/crypto-native--paid-agent-services.md:31,133` ("[SNIPPET, SIBLING] for CDP pricing") |
| 21 | 38 | `X402_PRICE_USD` defaults to $0.002 | C | `config.ts:74,84` |
| 22 | 38 | JSON repair is double | C | `config.ts:158` `p * 2` |
| 23 | 43-46 | `npm install` / `npm test` / `npm run build` / `node dist/index.js` | C | `package.json:8-13`; `tsconfig.json` `outDir: dist`, `rootDir: src` |
| 24 | 44 | **22 tests** | **S** | F7 |
| 25 | 44 | includes the real paywall factory against the real v2 middleware | C | tests `:137-379` call `defaultPaywall`/`buildPaywall` with only the facilitator stubbed |
| 26 | 49 | free mode starts with a warning and serves everything unpaid | C | `index.ts:166-167`; `app.ts:120`; tests `:36-86` |
| 27 | 54 | paid-mode command | C | env names match `config.ts:133-145` (`0xYourWallet` is a placeholder and would be refused, `config.ts:118`) |
| 28 | 59 | `X402_PAY_TO` unset means free mode | C | `config.ts:145` `paywallEnabled: Boolean(payTo)` |
| 29 | 60 | `X402_NETWORK` default `base`→`eip155:8453`; `base` and `base-sepolia` mapped | C | `config.ts:47-50,61`; test `:439-447` |
| 30 | 60 | "anything else must be CAIP-2" | **W** | F12 |
| 31 | 61 | `X402_FACILITATOR_URL` unset → no url passed to the SDK | C | `app.ts:72` |
| 32 | 61 | the SDK default is `https://x402.org/facilitator` | X | SDK not installed. A Cloudflare doc names that URL, `agent-markets--mcp-registries.md:59` |
| 33 | 61 | the facilitator is paid mode's one network dependency | C | the only outbound client in `src/` is `createFacilitatorClient`, `app.ts:68-76` |
| 34 | 62 | `X402_FACILITATOR_AUTH`: bearer on verify, settle, supported | C | `app.ts:70-74` |
| 35 | 63 | `X402_PUBLIC_URL` sets the resource URL in a 402 | C | `config.ts:141`, `app.ts:185` |
| 36 | 63 | behind a TLS proxy, the API otherwise advertises `http://` | X | SDK behaviour. `app.ts` never sets `trust proxy`, which is consistent |
| 37 | 64 | price: default 0.002, ≤6 decimals, ≥0.000001, repair double | C | `config.ts:73-97`; tests `:456-464` |
| 38 | 65 | `PORT` default 8402 | C | `config.ts:135` |
| 39 | 67 | deploy on Node 22.12+ | C | `package.json:27-29` |
| 40 | 67 | test runner does not run on Node 20 | C | lock: vitest 5.0.0 engines `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0` |
| 41 | 67 | "the runtime itself runs on 20" | **U** | F14 |
| 42 | 67 | no database, no state, no build step beyond `tsc` | C | `package.json:9`; no db dependency |
| 43 | 76 | unpaid → 402, requirements in a base64 JSON `PAYMENT-REQUIRED` header | C | tests `:151-155,201-222` |
| 44 | 79 | a v2 client attaches `PAYMENT-SIGNATURE` automatically | X | client behaviour. Server side matches, tests `:250-253` |
| 45 | 82 | `{ input, normalized, valid: true }` for `000000018` | C | `israeli.ts:22-23` (`reason: undefined` drops out of JSON); test `:39-40` |
| 46 | 87 | "For x402: nothing" (what the owner has to do) | **W** | F1 |
| 47 | 87 | no account, no KYC, no payout setup | **W** | F1 (the README itself provides for a facilitator that needs a token) |
| 48 | 87 | USDC accrues in "the wallet the automaton already controls" | **U** | F4 |
| 49 | 87 | earnings can pay for the automaton's own compute directly | C | `src/conway/topup.ts:1-14` pays Conway credits in USDC on Base over x402. This holds only if `X402_PAY_TO` is that wallet (F4) |
| 50 | 89 | cash-out needs exchange KYC, only to cash out | C | agrees with `docs/OWNER_STEPS.he.md:271` |
| 51 | 91 | migrated 5.9.2026 | C | `logs/2026-09-05-x402-v2-migration-and-vertical-niches.md` |
| 52 | 93 | `x402-express@1.2.0`, v1, last published 2026-04-16 | X | as recorded, `CHECKPOINT.md:493` |
| 53 | 94 | 2.25.0 published 2026-09-04, same maintainers, same repo | X | as recorded, `CHECKPOINT.md:494-495` |
| 54 | 94 | same Apache-2.0 | C | lock `:717,727,739,759` |
| 55 | 95 | found by hand, before `check-deps-freshness.mjs` existed | C | `CHECKPOINT.md:491-497,524-525`; `scripts/check-deps-freshness.mjs` exists |
| 56 | 96 | now on `@x402/express`, `core`, `evm` 2.25.0 | C | `package.json:30-34` (as `optionalDependencies`) |
| 57 | 98-100 | v2 requirements travel in the header, not the 402 body | C | tests `:151-155` |
| 58 | 100-101 | the 402 body is `error: "payment_required"` plus a `/pricing` pointer | C | `app.ts:161-168`; tests `:208-209` |
| 59 | 101-102 | CAIP-2 ids, `eip155:8453` for Base mainnet | C | `config.ts:48` |
| 60 | 102-104 | anything else must already be CAIP-2 or the process refuses to start | **W** | F12 |
| 61 | 106-107 | v2 builds no 402 until it has asked the facilitator | C | tests `:346-368` (SDK internals X) |
| 62 | 107 | v1 built the challenge locally | X | historical SDK behaviour |
| 63 | 111-112 | unreachable facilitator: starts, discovery serves, paid → 5xx, nothing free | C | `index.ts:181-186` (warn, keep going); tests `:346-368`. "until it is reachable" (an SDK retry) is not tested |
| 64 | 113-115 | facilitator lacks `exact` on our network → refuses to start and names what it offered | C | `index.ts:173-180`; `app.ts:89-100`; tests `:414-435` |
| 65 | 115-116 | otherwise the SDK's background init would `exit` a few hundred ms later | X | only the code comment `app.ts:86` backs it |
| 66 | 118 | "The facilitator is an owner decision, not a default." | **W** | F1 |
| 67 | 119-120 | upstream README quote about x402.org on mainnet | X | no rendered source |
| 68 | 121 | "cannot be checked from this repo's sandbox" | **S** | F2 |
| 69 | 121-126 | the owner runs curl from a machine with egress before the first paid deploy | **W** | F1, F2 |
| 70 | 125 | the curl/jq check decides whether the facilitator supports us | **W** | F3 |
| 71 | 128-129 | set URL/AUTH if it prints nothing; paste the output here | **W** | F1 (the output was never pasted; the section is unchanged 20 days on) |
| 72 | 131-132 | v1 clients (`X-PAYMENT`, body requirements) no longer work | C | tests `:230-242`; v1 payload probe recorded in `logs/2026-09-05-…:67-69` |
| 73 | 132-133 | `@x402/fetch` / `@x402/axios` 2.25.0, published the same day | X | registry fact |
| 74 | 135-136 | `X402_PAY_TO`: `0x` + 40 hex, not the zero address | C | `config.ts:115-125`; tests `:474-481` |
| 75 | 136-137 | a mixed-case address must pass EIP-55 | C | `app.ts:134-139` (viem arrives through `@x402/evm`, lock `:731`); test `:370-374` |
| 76 | 137 | a well-formed wrong address cannot be caught | C | only shape and checksum are checked |
| 77 | 138-139 | `X402_NETWORK` must be `eip155:<chainId>` or a mapped name; only EVM exact is registered | C | `config.ts:58-69`; `app.ts:152-155` |
| 78 | 139-141 | a bad `X402_PRICE_USD` is refused, not silently replaced | C | `config.ts:83-97`; tests `:456-464` |
| 79 | 143-145 | real middleware, EVM scheme, conversion and route matching run; only the facilitator is stubbed, via `Config` | C | `config.ts:32-33`; tests `:137-185` |
| 80 | 145-148 | the suite asserts wallet, network, 2000/4000, bogus headers, unreachable → 5xx | C | tests `:215-219,343,230-242,346-368` |
| 81 | 148 | "22 tests." | **S** | F8 |
| 82 | 152-156 | the old tree was `x402`→`wagmi`→`porto`→`react`/`@tanstack/react-query`, with a React 18-vs-19 conflict | **U** | F15 |
| 83 | 153-154 | the v2 server packages depend on none of it | C | lock grep → 0 |
| 84 | 157-160 | npm 10.9.7 arborist crash; bisect details | **U** (part) | F15; crash and vitest-5 fix are recorded in `logs/2026-09-05-…:54-55` |
| 85 | 160-161 | this product is on vitest 5 | C | `package.json:25` |
| 86 | 161-162 | "The other four products are still on 4.1.11" | **S** | F10 |
| 87 | 166 | validators check format and checksum only | C | `israeli.ts:1-4` |
| 88 | 166 | nothing verifies that a person, line or account exists | C | pure functions, no I/O, `israeli.ts` |
| 89 | 166 | no request is stored or logged beyond server output | C | no request logger; only the error handler logs, `app.ts:293-296` |
| 90 | 166 | the bank response says so; transliteration is labelled approximate | C | `israeli.ts:89`; `app.ts:273` |

90 claims: 57 C, 10 X, 23 rows not correct (11 W, 7 S, 5 U). Several rows share a finding, so the 23 rows make 15 findings.

## Findings

### F1 — WRONG, HIGH — line 118 (and lines 87, 121-129): the README both says the owner does nothing and gives him a step

Claim (118): `**The facilitator is an owner decision, not a default.**` … (121-123) `Before the first paid deploy, from a machine with egress:` … (128-129) `If that prints nothing, set X402_FACILITATOR_URL … Paste the output into this section when known.`
Claim (87): `**For x402: nothing.** No account, no KYC, no payout setup`

Evidence:
- The document contradicts itself. Line 87 says the owner does nothing. Lines 118-129 give "the owner" a decision and a command to run "before the first paid deploy". `logs/CHECKPOINT.md:365-367` records it that way: "זו בדיקת `curl` אחת ממכונה עם egress, ורשומה ב-README של המוצר כצעד בעלים" ("one curl check from a machine with egress, recorded in the product README as an owner step"). The same framing is in `logs/2026-09-05-x402-v2-migration-and-vertical-niches.md:45-46,71`.
- The step is not in the owner's one checklist. `src/revenue/owner-steps.ts` has seven ids (`merge-pr`, `tax-file`, `gumroad`, `domain`, `github-org`, `algora-stripe`, `ci-tokens`). `src/__tests__/revenue/owner-steps.test.ts:17-24` fails the build on an eighth. `grep -n -i "x402\|facilitator\|wallet" docs/OWNER_STEPS.he.md src/revenue/owner-steps.ts` finds only `OWNER_STEPS.he.md:271` (USDC cash-out, "לא עכשיו", "not now"). MISSION rule 1 (`MISSION.md:322-323`): "Batch every unavoidable step into one ordered checklist … Never invent a step that isn't required."
- The step is not required. `paid-apis` and `agent-services` were killed on 2026-09-07 (`src/revenue/portfolio.ts:409-433`). The product is a "RAIL ON STANDBY … nothing is planned on it" (`:420-421`), so no "first paid deploy" is planned. The check itself is agent work (F2).
- "No account" is also undercut by the README itself. Line 38 sizes the price against the **Coinbase CDP** facilitator. Lines 62 and 128-129 plan for a facilitator that "requires" a bearer token (`X402_FACILITATOR_AUTH`, `app.ts:70-74`). Choosing such a facilitator means someone opens an account with it.

Owner impact: the owner either does a step the checklist does not contain, or reads "nothing" and skips it. Both are in the same file. Either way this is the invented, off-checklist owner step that MISSION rule 1 forbids.

Proposed fix (replace lines 118-129):
`**The facilitator is not chosen yet, and choosing it is agent work, not an owner step.** The SDK defaults to https://x402.org/facilitator. Whether that facilitator settles exact on eip155:8453 has not been checked. The container cannot reach it, but render-watch.yml can: add https://x402.org/facilitator/supported to research/rendered/urls.txt and dispatch the workflow. The line is killed (portfolio.ts KILLED_LINES), so no paid deploy is planned. Until one is, paid mode stays unconfigured. If a facilitator that needs an account (CDP) is ever chosen, that account becomes an owner step in docs/OWNER_STEPS.he.md, not here.`
Then line 87: `**For x402: nothing, and nothing is planned.** The line is on standby. If it is ever re-opened, anything it needs from the owner goes into docs/OWNER_STEPS.he.md first.`

### F2 — STALE, MEDIUM — line 121: "cannot be checked from this repo's sandbox"

Claim: `Whether it lists Base mainnet cannot be checked from this repo's sandbox.`

Evidence: this was true of the container on 5.9.2026. Since 7.9.2026 the repo has had its own way past the egress block. `.github/workflows/render-watch.yml:1-27` says it was built for pages that are "egress-blocked from the container … GitHub's runners have egress". It fetches JSON as well as HTML. `research/rendered/apify-store-accessibility.meta.json` records `"url": "https://api.apify.com/v2/store?search=accessibility"`, `"contentType": "application/json; charset=utf-8"`, `"status": 200`, fetched `2026-09-07T17:15:55Z`. `scripts/render-watch.mjs:185` picks `json` from the content type. `research/rendered/urls.txt` has a rule that a URL must appear verbatim in a repo file (`:7-10`), and this README already contains `https://x402.org/facilitator/supported` (line 125).

Proposed fix: `This container cannot reach it, but .github/workflows/render-watch.yml can: add https://x402.org/facilitator/supported to research/rendered/urls.txt, dispatch the workflow, and read research/rendered/<slug>.json.`

### F3 — WRONG, MEDIUM — line 125: the curl/jq check is looser than the gate `index.ts` enforces

Claim: `curl -s https://x402.org/facilitator/supported | jq '.kinds[] | select(.network=="eip155:8453")'` together with line 128 `If that prints nothing, set X402_FACILITATOR_URL…`, read as: if it prints something, the default is fine.

Evidence: the startup gate needs all three fields to match. `app.ts:98`: `kinds.some((k) => k.x402Version === 2 && k.scheme === "exact" && k.network === config.network)`. `index.ts:174-179` exits with code 1 when that is false. The jq filter checks only `network`. If a facilitator lists `eip155:8453` for x402 v1 only, or for a scheme other than `exact`, the check prints a kind. The reader concludes the default works, and the paid deploy then refuses to start. Test `:418-427` shows `unsupported` is decided on these fields.

Proposed fix: `curl -s https://x402.org/facilitator/supported | jq '.kinds[] | select(.x402Version==2 and .scheme=="exact" and .network=="eip155:8453")'`. It must print exactly the kind `index.ts` looks for. If it prints nothing, the paid deploy will refuse to start on this facilitator.

### F4 — UNSUPPORTED, MEDIUM — lines 9 and 87: "the wallet the automaton already controls"

Claims: (9) `Payments land directly in the automaton's own wallet.` (87) `earnings accrue as USDC in the wallet the automaton already controls`

Evidence:
- Payments go to whatever address `X402_PAY_TO` holds (`config.ts:133`; `app.ts:183` `payTo`). Nothing in the repo sets it to the runtime's wallet. `grep -rn X402_PAY_TO` outside `products/x402-il-api/{src,tests}` finds only this README (lines 54, 59, 135) and a sibling audit.
- The runtime's wallet is created on setup at `~/.automaton/wallet.json` (`src/identity/wallet.ts:44-48`). `ls ~/.automaton` → no such directory. The governance loop runs "בלי ארנק" ("without a wallet", `CHECKPOINT.md:542`).
- Nothing in the repo records a deploy of this API, and no URL for one appears anywhere (grep for deploy/fly/railway/url alongside `x402-il-api` finds only plans and the standby clause).
- Sibling audit `research/owner-docs-audit/products-readme.md` F6 found that no code path moves an inbound USDC settlement into `transactions` or `revenue_ledger`. So even USDC that did arrive would not count under MISSION rule 2 without a manual `colony.ts record`.

Proposed fix: (9) `Payments settle to the address in X402_PAY_TO.` (87) `Earnings would accrue as USDC at X402_PAY_TO. Nothing sets that to the runtime's own wallet yet, and nothing has been deployed. USDC that arrives is booked by hand (scripts/tag-payment.md), not automatically.`

### F5 — STALE, MEDIUM — line 5: revenue lines

Claim: `Revenue lines: \`paid-apis\` and \`agent-services\` in the automaton's revenue colony.`

Evidence: `src/revenue/portfolio.ts:409-433` lists both in `KILLED_LINES` with `killedOn: "2026-09-07"` and `targetMonthlyAgorot: 0`. The `paid-apis` entry's `standby` (`:420-421`) says: "products/x402-il-api stays deployed only while it costs ₪0/month, as a RAIL ON STANDBY rather than a line … nothing is planned on it." `DEFAULT_PORTFOLIO` ids (`:36,100,136,172,352,362`) contain neither. `CHECKPOINT.md:245-247` says the same.

Proposed fix: `Revenue lines: none. The board killed \`paid-apis\` and \`agent-services\` on 7.9.2026 (src/revenue/portfolio.ts KILLED_LINES). This API is a rail on standby. It is kept only while it costs ₪0/month, and nothing is planned on it.`

### F6 — STALE, MEDIUM — line 9: "the only rail in the portfolio … the first thing that can earn"

Claim: `x402 is the only rail in the portfolio that needs **no account and no KYC from the owner**. … That makes it the first thing that can earn while every other line is still waiting on a one-time signup.`

Evidence:
- x402 is no longer in the portfolio. `LINE_RAILS` in `src/revenue/rails.ts` has payins `apify`, `gumroad`, `gumroad`, `bounty-platform` (`:72,79,86,93`), and `"x402"` survives only in the type union (`:30`).
- The board killed the line on its expected earnings: "roughly ₪6 per provider per month, and 91.2% of listings never reach ten calls a month" (`portfolio.ts:416`).
- `CHECKPOINT.md:257-259` records the consequence: "עד היום `agent-services` לא דרש הרשמה וכיסה על זה. עכשיו … חוסם מפורש לכל קו" ("until today `agent-services` needed no registration and covered for that. Now … an explicit blocker for every line").
- x402 is not the only no-KYC path either: `apify-actors` publishes free with "no KYC and no payout method" (`rails.ts:74`).

Proposed fix: `Why it is kept: x402 needs no account and no KYC to receive USDC. That is why this API stays up on standby at ₪0/month. It is not a line: the board killed it on 7.9.2026 because the measured demand divides out to about ₪6 per provider per month.`

### F7 — STALE, MEDIUM — line 44: `npm test          # 22 tests`

Evidence: `grep -cE "^\s*it\(" tests/api.test.ts` → **37**, with no `skip`/`only`/`each`/`todo`. By describe: free/discovery 3 (`:12-34`), billable free mode 6 (`:36-86`), paywalled mode 3 (`:88-135`), defaultPaywall 13 (`:181-379`), fail-closed 2 (`:381-409`), probeFacilitator 3 (`:411-436`), config validation 5 (`:438-482`), openapi-in-step 2 (`:484-504`). History: `logs/2026-09-05-…:24` "15 → **35 בדיקות**" ("35 tests"). `:36` "קימטתי את המצב הנבדק (22/22)" ("I committed the state under review, 22/22"), which was the pre-fix interim commit. The later openapi describe ("The judge's last ask", `:484-485`) brings it to 37. 22 was an interim number that the same session's fixes superseded. I did not run the suite (see Method); the count is static.

Proposed fix: `npm test          # 37 tests, including the real paywall factory against the real v2 middleware`. Better: drop the number, which drifts, and say `npm test  # the full suite; paid-mode tests run the real @x402 middleware`.

### F8 — STALE, LOW — line 148: "22 tests."

Same evidence as F7. This sentence ends the paragraph about what the suite proves, and the count it gives is the pre-fix one.

Proposed fix: `37 tests.` (or remove the count).

### F9 — WRONG, LOW — line 11: "shares its domain logic with the Apify actor line"

Evidence: the Apify line is `apify-actors`, which publishes `products/apify-il-open-data` (`portfolio.ts:36-42`). That actor is a data.gov.il CKAN wrapper (`src/ckan.ts`, `csv.ts`, `dictionary.ts`, `normalize.ts`, …). `grep -rln "israeli\|teudat\|zehut"` over its `src` and `test` finds nothing. The logic this API sells (`src/israeli.ts`) is shared with `products/mcp-il-tools`: `cmp` says the files are identical, and `products/mcp-il-tools/tests/server.test.ts:98-105` enforces it ("is byte-identical to the x402 API's copy").

Proposed fix: `…and shares its validators with products/mcp-il-tools (a byte-identical copy of src/israeli.ts, enforced by that package's tests) rather than being a standalone bet.`

### F10 — STALE, LOW — lines 161-162: "The other four products are still on 4.1.11"

Evidence: there are five other products, and their pinned vitest versions are apify-il-open-data **3.2.7**, il-biz-tools 4.1.11, mcp-il-tools 4.1.11, **pcn874 5.0.0**, telegram-il-tools-bot 4.1.11. pcn874 was added on 7.9.2026 "בסגנון `x402-il-api`" ("in the style of `x402-il-api`", `logs/2026-09-07-pcn874-validator.md:86`). The CI matrix lists six products (`.github/workflows/products-ci.yml:18`).

Proposed fix: `Of the other five products, three are on vitest 4.1.11 (il-biz-tools, mcp-il-tools, telegram-il-tools-bot), apify-il-open-data is on 3.2.7 and pcn874 is on 5.0.0. None of them has an @x402 dependency, so the crash does not reach them.`

### F11 — WRONG, LOW — line 19: `/health` reports "whether the paywall is armed"

Evidence: `app.ts:217-219` returns `paywall: config.paywallEnabled ? "x402" : "free"`. That is true exactly when `X402_PAY_TO` is set (`config.ts:145`), and nothing about the facilitator or the loaded packages goes into it. Test `:346-368` has an unreachable facilitator: every `/v1` call answers 500/502 while `/health` is 200, and by the code it still says `"x402"`. Test `:385-396` has the packages missing: `/v1` answers 503, `/health` 200. An operator who checks `/health` to confirm paid mode works gets "x402" in both broken states.

Proposed fix: `| GET | /health | Liveness, and whether paid mode is configured (X402_PAY_TO set). It does not show whether a paid request can currently settle. |`

### F12 — WRONG, LOW — lines 60 and 102-104: "anything else must be CAIP-2"

Claims: (60) `anything else must be CAIP-2`. (102-104) `anything else must already be CAIP-2 or the process refuses to start`

Evidence: only EVM CAIP-2 is accepted. `config.ts:58` `EVM_CAIP2 = /^eip155:\d+$/`, and `:64-69` throws on anything else. Test `:450` refuses `"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"`, which is a valid CAIP-2 id. The same README gets it right at line 138.

Proposed fix: `anything else must be an EVM CAIP-2 id, eip155:<chainId>. Any other value, including a non-EVM CAIP-2 id such as solana:…, is refused at startup.`

### F13 — WRONG, LOW — line 28: phone returns "type, and E.164 form"

Evidence: `israeli.ts:53-54` returns `toll_free` (1-800), `national` (1-700) and `premium` (1-900) numbers with a `national` form and **no** `e164`. `e164` is built only for mobile, landline and VoIP (`:56-59`). `openapi.yaml:108` says so: "Absent for premium 1-700/800/900 numbers".

Proposed fix: `Israeli phone validation and type, plus the E.164 form for mobile, landline and VoIP numbers (1-700/1-800/1-900 get a national form only)`

### F14 — UNSUPPORTED, LOW — line 67: "the runtime itself runs on 20"

Evidence: `package.json:27-29` declares `"node": ">=22.12"` for the whole package. CI runs Node 22 only (`.github/workflows/products-ci.yml:24-26`). Nothing in the repo starts the server on Node 20. The lockfile does not contradict the claim, since no runtime (non-dev) package declares a floor above 18. But nothing tests it, and npm on Node 20 would report the package's own engines mismatch.

Proposed fix: `Deploy on any Node 22.12+ host (package.json engines; CI runs 22). No runtime dependency excludes Node 20, but nothing here tests it.`

### F15 — UNSUPPORTED, LOW — lines 152-160: historical dependency details

Claims: `x402-express@1.2.0 pulled x402 → wagmi → porto → react and @tanstack/react-query` / `a React 18-vs-19 peer conflict entirely inside the old packages` / `remove vitest and it installs; keep vitest and pass --legacy-peer-deps and it installs`

Evidence: the pre-migration lockfile is not in the repo. The clone is shallow from `a65a5b2` (2026-09-07), after the 5.9 migration. The migration log backs part of this: `logs/2026-09-05-…:66` "אפס `x402-express`, `wagmi`, `react`, `porto`" ("zero `x402-express`, `wagmi`, `react`, `porto`") after the regen; `:54-55` the `edgesOut` crash, `vitest@4.1.11` + `@x402/*`, and "`vitest@5.0.0` מתקין נקי" ("installs clean"). Nothing in the repo records the React 18-vs-19 conflict, `@tanstack/react-query`, the `--legacy-peer-deps` result, or "remove vitest and it installs". The crash cannot be re-run here without the registry (npm here is 10.9.7, `npm --version`). No owner action depends on any of this.

Proposed fix: keep it as history but mark it: `(recorded in logs/2026-09-05-x402-v2-migration-and-vertical-niches.md; the pre-migration lockfile is no longer in the repo)`.

## Observation outside the document's claims (for the refuter; not graded)

`probeFacilitator` calls `loadX402(load)` **before** its `try` (`app.ts:90`). So `index.ts:173` in paid mode, with the optional `@x402` packages absent, rejects at top-level await and the process exits. It does not reach the fail-closed 503 that `buildPaywall`'s comment describes (`app.ts:114-118`: "the API must boot in free mode even where they are absent, and paid mode fails closed here if they are"). The fail-closed tests (`:381-409`) go through `createApp` directly and never through `index.ts`. The README makes no claim about this path, so it is not a finding against the README. It is a code/comment mismatch worth a test.
