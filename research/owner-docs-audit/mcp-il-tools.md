# Claim audit: `products/mcp-il-tools/README.md` (and `server.json`)

Audited 2026-09-25 against the repo at `245a19e` (a shallow clone, whose graft root is `a65a5b2`). Read-only. Nothing in the
product or the repo was edited except this file.
Method: every checkable line was checked against the code, the tests, `server.json`, `package.json`, the
owner-step sources and the board records. Dependencies were installed and the package was built, packed and run
**in a scratch copy** (`$SCRATCH` below is
`/tmp/claude-0/-home-user/ad9f6939-0ae8-504a-8945-82eb5f3c951c/scratchpad/mcpaudit`). The only network
use was npm registry downloads for `npm ci` / `npm install`. Nothing was published or deployed.

Status key: C = CORRECT, W = WRONG, S = STALE, U = UNSUPPORTED, X = out of scope (an external fact with no rendered
source in `research/rendered/`).

## Every claim, one line each

| # | Line | Claim | St | Evidence |
|---|---|---|---|---|
| 1 | 1 | name `mcp-il-tools` | C | dir name; `package.json:8` bin `mcp-il-tools` |
| 2 | 3 | "An MCP server" | C | `src/server.ts:18-19,32` (`McpServer`, `StdioServerTransport`) |
| 3 | 3 | "the Israeli data checks that agents get wrong" | U | nothing in the repo measures this (F8) |
| 4 | 3-5 | five checks: ID check digit, phone classification, bank+branch, Hebrew calendar, transliteration | C | five `registerTool` calls, `server.ts:38-117`; the live `listTools` returned exactly these five |
| 5 | 7 | "Free" | C | no paywall or licence check in `src/` |
| 6 | 7 | "MIT" | C | `package.json:6`. Note: no LICENSE file ships. The `npm pack` contents are README.md, dist/*, package.json and src/* |
| 7 | 7 | "no account, no key" | C | no auth or env reads in `src/` |
| 8 | 7 | "no network calls. Everything runs locally." | C | `grep -n "fetch\|http\|telemetry" src/*.ts` → nothing; `grep -rl "fetch(\|node:http" node_modules/@hebcal/*/dist` → nothing |
| 9 | 11-17 | install: `npx -y @bediyuk/mcp-il-tools` in an `mcpServers` block | **W** | the server does not start when launched this way (F1) |
| 10 | 11-17 | (implied) the package can be installed from npm | **U** | no publish is recorded anywhere, and no npm step, token or workflow exists (F2) |
| 11 | 14 | server key `il-tools` | C | `server.ts:34` `{ name: "il-tools" }` |
| 12 | 19 | "Registry name: `com.bediyuk/il-tools`" | **U** | it matches `server.json:3`, but it is presented as settled and it is not (F3) |
| 13 | — | `server.json` `websiteUrl: https://bediyuk.co.il` | **W** | it contradicts the board's `.com` ruling and the `com.bediyuk` namespace (F4) |
| 14 | — | `server.json` version 0.1.0 / npm identifier / stdio | C | `package.json:2-3`, `server.ts:34`, `server.ts:125` |
| 15 | 23-29 | tool names (5) | C | `tests/server.test.ts:27-38` passes (10/10 in the scratch copy) |
| 16 | 25 | ID tool pads to nine digits first | C | `israeli.ts:15` `padStart(9,"0")`; tests at `:49-53` |
| 17 | 25 | padding is "the step most implementations skip" | U | F8 |
| 18 | 26 | phone: mobile / landline / VoIP / toll-free 1-800 / national 1-700 / premium 1-900 | C | `israeli.ts:45-50`; probe: `1-700-123-456` → `national`, `1-800-123-456` → `toll_free` |
| 19 | 27 | bank: plausible code/branch/account, and which bank | C | `israeli.ts:91-101`, but any code outside the 18 listed is rejected (F7) |
| 20 | 28 | hebrew_date: the Hebrew calendar date for a Gregorian date | **W** | off by one day on any host west of UTC (F5) |
| 21 | 28 | and whether it is a Hebrew leap year | C | `israeli.ts:121`, but computed from the same wrong date (F5) |
| 22 | 29 | Latin transcription, "Approximate by design" | C | `israeli.ts:132-147`; `server.ts:115` note |
| 23 | 29 | "for slugs and filenames" | U | the output contains `'` and spaces (F9) |
| 24 | 31 | "Each returns JSON." | **W** (partly) | schema-level rejections come back as plain text (F6) |
| 25 | 31-32 | invalid input returns a result that explains why, e.g. `{"valid": false, "reason": "..."}` | **W** (partly) | `hebrew_date` returns `{error, message}`. A numeric ID is refused before the validator runs (F6) |
| 26 | 36-37 | 1-800 toll-free / 1-900 premium / 1-700 national-rate (tariff facts) | X | an external telecom fact; nothing in `research/rendered/` covers it |
| 27 | 38-39 | "An earlier version of this code reported all three as 'premium'" | C | the history is shallow, but the old code survives in `products/telegram-il-tools-bot/src/utils.ts:52`: `/^1(700\|800\|900)\d{6}$/ → "premium"`; `CHECKPOINT.md:545` records the fix |
| 28 | 39 | "They are now distinguished" | C | `israeli.ts:48-50` |
| 29 | 39-40 | none of the three gets an E.164 form | C | `israeli.ts:53-55`; `tests/server.test.ts:62`; the probe output has no `e164` for 1-700 or 1-800 |
| 30 | 40 | "these prefixes are not internationally diallable" | X | external fact |
| 31 | 44-45 | transliteration is rule-based, not a standard romanisation, and every response says so | C | `server.ts:112-116` always adds `note` |
| 32 | 46-47 | bank check is structural, names the bank, cannot tell whether the account exists | C | `israeli.ts:89` BANK_NOTE is on every return |
| 33 | 48-49 | ID validation is a check digit, not identity | C | `israeli.ts:9-24` |
| 34 | 53-54 | "The same logic is **sold** per-call over the x402 protocol in products/x402-il-api" | **S** | the directory exists, but both x402 lines were killed on 7.9 and no deploy is recorded (F10) |
| 35 | 55 | "a fraction of a cent" | C | `x402-il-api/src/config.ts:74` DEFAULT_PRICE_USD 0.002; JSON repair costs 2x (`:158`) |
| 36 | 55-56 | "not crippled … identical validators" | C | `cmp products/mcp-il-tools/src/israeli.ts products/x402-il-api/src/israeli.ts` → identical |
| 37 | 56 | "no rate limit, no telemetry" | C | grep: no rate, limit, throttle, fetch or http in `src/` |
| 38 | 56 | "nothing withheld" | W (literal) | the paid API also sells `/v1/json/repair`, which this package does not have (F11) |
| 39 | 56-57 | "The paid API exists for callers who want an HTTP endpoint" | **S** | F10 |
| 40 | 59 | byte-identical copy of the API's `src/israeli.ts` | C | `cmp` exit 0 |
| 41 | 59-60 | "a published package has to stand alone" | C | `israeli.ts` is a local copy, not a cross-package import; `package.json:10-14` files |
| 42 | 60-61 | "A test asserts the two files match" | C | `tests/server.test.ts:99-104`; CI runs it (`products-ci.yml:18`) |
| 43 | 66 | `npm install` | C | with the lockfile: `npm install` → "added 150 packages", exit 0 |
| 44 | 66 | "a committed lockfile is required" | C | `git ls-files products/mcp-il-tools` lists `package-lock.json` |
| 45 | 66-67 | plain `npm install` cannot resolve vitest's peer graph from scratch on npm 10.9.7 | C | reproduced: npm 10.9.7, `package.json` alone → `npm error Cannot read properties of null (reading 'edgesOut')`, stack in arborist `#loadPeerSet`, last manifest fetched `@vitest/browser-playwright` |
| 46 | 67 | `npm test` | C | `npx vitest run` → "Tests 10 passed (10)" |
| 47 | 68 | `npm run build` | C | `tsc` built `dist/server.js` + `dist/israeli.js`; `tsc --noEmit` clean |
| 48 | — | `server.json` / `package.json`: publishable to the registry as-is | U | no `mcpName` in `package.json` (F3) |

Checked: 48 lines. Non-CORRECT: 14 (W 6, U 6, S 2), plus 2 out of scope.

## Findings

### F1 — WRONG, HIGH — lines 11-17: the install config starts a process that never serves MCP

Claim: `{ "mcpServers": { "il-tools": { "command": "npx", "args": ["-y", "@bediyuk/mcp-il-tools"] } } }`

Evidence:
- `src/server.ts:123` starts the transport only when
  `import.meta.url === \`file://${process.argv[1]}\``.
- npm installs the `bin` as a **symlink**:
  `ls -la $SCRATCH/consumer/node_modules/.bin/mcp-il-tools` →
  `mcp-il-tools -> ../@bediyuk/mcp-il-tools/dist/server.js`. npx does the same in its cache:
  `/root/.npm/_npx/464f7129852fbcbe/node_modules/.bin/mcp-il-tools -> ../@bediyuk/mcp-il-tools/dist/server.js`.
- Node puts the symlink path in `process.argv[1]` and the resolved path in `import.meta.url`, so the guard is false.
  A minimal reproduction (`$SCRATCH/guard`):
  `node real/s.mjs` → `"guard":true`; `node link.mjs` (a symlink to it) → `"argv1":".../guard/link.mjs","url":"file:///.../guard/real/s.mjs","guard":false`.
- End to end. The package was built, packed with `npm pack` (`bediyuk-mcp-il-tools-0.1.0.tgz`) and sent an MCP
  `initialize` request on stdin:
  - `node dist/server.js` (the real path) → `{"result":{"protocolVersion":"2025-06-18",…,"serverInfo":{"name":"il-tools","version":"0.1.0"}},"jsonrpc":"2.0","id":1}`
  - `node_modules/.bin/mcp-il-tools` (the symlink) → **no output, exit 0**
  - `npx -y --package=$SCRATCH/bediyuk-mcp-il-tools-0.1.0.tgz mcp-il-tools` (the same path the README config takes) → **no output, exit 0**
- Why the tests miss it: `tests/server.test.ts:5,13-15` imports `buildServer()` and uses an in-memory transport,
  so the bin entry is never run. CI (`products-ci.yml`) runs only `npm test`.
- On Windows, npm's `.cmd` shim passes a backslash path, so `file://C:\…` cannot equal `file:///C:/…` either. This
  was found by inspection only and was not run.

Impact: this README is the only install path, and it is what the registry listing would point to. BOARD.md:74 makes
"registry installs recorded as KPIs" the measure of this channel test. Every install would fail silently, so the test
would read zero for a reason unrelated to demand. The owner's steps 5 and 7 are partly bought for this listing
(`products/README.md:10`).

Proposed fix. The document cannot fix this alone. The code needs a fix before publishing: for example
`import { realpathSync } from "node:fs"; import { fileURLToPath } from "node:url";` and
`if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url))`. That guard was verified
true both directly and through a symlink (`$SCRATCH/guard/f.mjs` → `{"fixedGuard":true}` twice). A separate `bin`
entry that always connects would also work. Add a test that spawns the packed bin through `node_modules/.bin`.
Until then, the README wording: `**Not installable yet.** The package is not on npm, and the published entry point
does not yet start when launched through npx (fix pending in src/server.ts). The config below is what it will be:`
followed by the block.

### F2 — UNSUPPORTED, MEDIUM — lines 11-17: the package is presented as installable from npm

Evidence:
- No workflow publishes it. `ls .github/workflows/` lists apify-publish, ci, colony, pcn874-spec-watch,
  products-ci, release and render-watch. `grep -n "npm publish\|mcp-publisher\|NODE_AUTH_TOKEN" .github/workflows/*.yml`
  → nothing. `release.yml:13-17` only builds the root package.
- Nothing in the repo holds an npm token or an npm-account owner step: `grep -rn NPM_TOKEN` → only the sibling audit
  `research/owner-docs-audit/products-readme.md:316`. `src/revenue/owner-steps.ts` has seven step ids (`:42-49`) and
  none of them is npm.
- `logs/CHECKPOINT.md:555` (3.9): "scope `@bediyuk` בלי חבילות" ("the `@bediyuk` scope has no packages"). No later
  record says a package was published.
- The board planned a `.github/workflows/mcp-publish.yml` for this build (`BOARD.md:74,243`). It does not exist.

Proposed fix: put `Not yet published to npm (no publish workflow or npm account exists yet; see products/README.md).`
above the config block.

### F3 — UNSUPPORTED, MEDIUM — line 19: "Registry name: `com.bediyuk/il-tools`." stated as settled

Evidence:
- The name matches `server.json:3`. But the listing is blocked on the domain (step 5) and the organisation
  (step 7): `products/README.md:10,74-75` and `BOARD.md:243` ("Blocked on the domain and the org").
- The brand itself is not confirmed. `logs/CHECKPOINT.md:555`: "ההמלצה שלי היא בדיוק / Bediyuk … **לא אושר עדיין**,
  וממתין לבדיקת דומיין וסימן מסחר של הבעלים" ("my recommendation is Bediyuk … **not confirmed yet**, pending the
  owner's domain and trademark check"). The owner step still reads "אני אשלח לך שם דומיין אחד" ("I will send you one
  domain name", `docs/OWNER_STEPS.he.md:167`).
- The namespace depends on DNS proof for a company domain (`MISSION.md:283-286`). `com.bediyuk` needs
  `bediyuk.com`, and no domain has been bought.
- The registry quickstart recorded in the repo (`research/colony-sweep/scouts/distribution--partnerships-integrations.md:14`,
  fetched 2026-09-04 but not in `research/rendered/`) requires `mcpName` in `package.json`.
  `grep -c mcpName products/mcp-il-tools/package.json` → `0`.

Proposed fix: `Planned registry name: com.bediyuk/il-tools — not listed. Listing needs the brand domain (owner step 5,
for DNS proof of the namespace), the GitHub organisation (step 7), the package on npm, and "mcpName":
"com.bediyuk/il-tools" in package.json. The brand name is not confirmed; if it changes, the namespace, the npm scope
and server.json change with it.`

### F4 — WRONG, MEDIUM — `server.json:5` (in scope for this audit): `"websiteUrl": "https://bediyuk.co.il"`

Evidence: the board ruled `.com`, not `.co.il` (`docs/OWNER_STEPS.he.md:168`: "פסק הדירקטוריון: סיומת `.com`,
לא `.co.il`", i.e. "the board's ruling: a `.com` suffix, not `.co.il`"). `src/revenue/owner-steps.ts:128` says the
same (".co.il only if ISOC-IL privacy is confirmed first"). The namespace in the same file (`com.bediyuk`) is the
reverse-DNS of `bediyuk.com`, not `bediyuk.co.il`. `grep -rn "bediyuk\.co"` finds this line and nothing else. The
file points at a domain nobody has bought, and a published listing would send traffic to it.

Proposed fix: remove `websiteUrl` until the domain is bought, then set it to the bought `.com` domain. In the README
line 19 note (F3), say that server.json follows the domain.

### F5 — WRONG, MEDIUM — line 28: `hebrew_date` returns the previous Hebrew day west of UTC

Claim: "What is this Gregorian date in the Hebrew calendar, and is it a Hebrew leap year?"

Evidence: `israeli.ts:113` builds `new Date(Date.UTC(y, mo - 1, d))`, which is midnight **UTC**. `israeli.ts:117`
then passes it to `new HDate(date)`, and HDate reads the **local** calendar fields:
`node_modules/@hebcal/hdate/dist/esm/greg.js:93` has
`toFixed(date.getFullYear(), date.getMonth() + 1, date.getDate())` (@hebcal/hdate 0.14.5 under @hebcal/core 5.10.1,
the versions the lockfile pins). The server runs on the caller's machine (line 7, "Everything runs locally"), so it
uses the caller's time zone. Scratch run of `toHebrewDate` from the built `dist/israeli.js`:

```
UTC                 2026-09-12 -> 1st of Tishrei, 5787
Asia/Jerusalem      2026-09-12 -> 1st of Tishrei, 5787
America/New_York    2026-09-12 -> 29th of Elul, 5786     (wrong day, wrong year)
America/Los_Angeles 2026-09-03 -> 20th of Elul, 5786     (UTC gives 21st)
```

`isLeapYear` is computed from that wrong year (`israeli.ts:121`). The test (`tests/server.test.ts:75`) only checks
`year > 5780`, and CI runs in UTC, so this passes green. The same function is in `x402-il-api` (a byte-identical copy).

Proposed fix. Code: build the date from local components, `new HDate(new Date(y, mo - 1, d))`, and add a test run
under `TZ=America/New_York`. Until then, the README wording:
`hebrew_date … Known defect: on a machine west of UTC it currently returns the previous Hebrew day.`

### F6 — WRONG (partly), LOW — lines 31-32: "Each returns JSON. Invalid input comes back as a result explaining why … `{"valid": false, "reason": "..."}`"

Evidence (in-memory client probe, `$SCRATCH/products/mcp-il-tools/probe.mjs`):
- `validate_israeli_id {"id":12345}` → `isError=true`, with the plain text `MCP error -32602: Input validation error: … expected string, received number at id`.
  The validator itself accepts numbers (`israeli.ts:10`), but `server.ts:46` declares `z.string()`, so a numeric
  ID, which is a natural input, never reaches it. The phone tool behaves the same (`server.ts:60`).
- `hebrew_date {"date":"2026-02-30"}` → `{"error":"bad_request","message":"invalid calendar date"}`, not the `valid`/`reason` shape.

Proposed fix: `Each tool returns JSON. A malformed value (a bad ID, phone, bank or date) comes back as a JSON result
that says why: {"valid": false, "reason": "..."} from the validators, {"error": "bad_request", "message": "..."} from
hebrew_date. An argument of the wrong type (for example an ID sent as a number rather than a string) is rejected by
the MCP SDK as a plain-text tool error.`

### F7 — UNSUPPORTED (incomplete), LOW — lines 27 and 46-47: the bank check rejects any bank code outside a fixed list of 18

Evidence: `israeli.ts:62` says "this list covers the major banks", and `:63-82` lists 18 codes. For any other code,
`:98` returns `valid:false, reason:"unknown Israeli bank code N"`, so a real bank missing from the list is reported
as not plausible. The "What this is honest about" section does not say this.

Proposed fix: add to the bank bullet: `The bank list is a fixed table of 18 codes; a code outside it is reported
invalid even if the bank exists.`

### F8 — UNSUPPORTED, LOW — lines 3 and 25: "the Israeli data checks that agents get wrong" / "the step most implementations skip"

Evidence: nothing in the repo surveys other implementations or agent behaviour. `server.ts:44` itself says "get
wrong", not "skip".

Proposed fix: line 3 `An MCP server for Israeli data checks that are easy to get wrong: …`; line 25
`Pads to nine digits first, a step that is easy to miss.`

### F9 — UNSUPPORTED, LOW — line 29: transliteration output "for slugs and filenames"

Evidence: probe `transliterate_hebrew {"text":"שלום עולם"}` → `"latin": "shlvm 'vlm"`; `{"text":"אבא"}` → `"'v'"`.
`israeli.ts:126,128` maps א and ע to `'`, and the function keeps whitespace (`:134-136`). The output is not
slug-safe without more processing.

Proposed fix: `Latin transcription of Hebrew text, as a starting point for slugs and filenames (it keeps spaces and
renders א/ע as an apostrophe). Approximate by design.`

### F10 — STALE, MEDIUM — lines 51-57: "The same logic is sold per-call over the x402 protocol … The paid API exists for callers who want an HTTP endpoint"

Evidence:
- Both x402 lines were killed on 2026-09-07: `src/revenue/portfolio.ts:410-433` (`paid-apis`, `agent-services`,
  `targetMonthlyAgorot: 0`). The standby clause (`:420-421`) says: "products/x402-il-api stays deployed only while it
  costs ₪0/month, as a RAIL ON STANDBY … nothing is planned on it."
- No deploy is recorded. `grep -rn "x402-il-api"` for any URL or deploy host finds only the standby clause and plans.
  The sibling audit concluded the same (`research/owner-docs-audit/x402-il-api.md:166`). Paid mode also needs
  `X402_PAY_TO` (`config.ts:133,145`).
- The board killed `agent-services` partly because it "fails 'never sell what is already free': the Israeli identifier
  detector it would meter exists free inside this repository" (`portfolio.ts:430`), and MISSION.md:344-345 says
  "charging for something already free, is a violation". This section still argues the pre-7.9 position.
- The link `[products/x402-il-api](../x402-il-api)` is relative. This README ships in the npm tarball (`npm pack` lists
  `README.md`), and `package.json` has no `repository` field, so the link would be dead on npm.

Proposed fix: `## The HTTP version
The same validators also exist as an HTTP API over x402 inside this repository (products/x402-il-api). It is not
deployed and it is not a revenue line: the board killed both x402 lines on 7.9.2026, in part because it would charge
for what this package gives away. This package is the complete product: identical validators, no rate limit, no
telemetry.` Drop the relative link, or make it absolute once the repo is under the organisation.

### F11 — WRONG (literal), LOW — line 56: "nothing withheld"

Evidence: the paid API has six billable endpoints. The sixth, `POST /v1/json/repair` ("Repair malformed JSON produced
by LLMs", `x402-il-api/src/config.ts:158`, `app.ts:276`), is not in this package. The five Israeli validators are all
here. Read narrowly, as "nothing withheld from the Israeli logic", the claim holds.

Proposed fix: `identical Israeli validators, no rate limit, no telemetry, none of them withheld (the paid API's one
extra endpoint, JSON repair, is unrelated and not part of this package).` If F10's wording is adopted, this sentence
goes away.

## Correct, but not obvious to check

- **N1 — line 38, "An earlier version … reported all three as 'premium'": CORRECT.** Git history cannot show it (the
  clone is shallow, graft root `a65a5b2`). The old logic survives verbatim in the parked
  `products/telegram-il-tools-bot/src/utils.ts:52` (`/^1(700|800|900)\d{6}$/ → "premium"`). A side note outside this
  document: `CHECKPOINT.md:545` says the bug was "fixed in both copies", but there were three copies, and the Telegram
  bot's copy still reports 1-800 as premium. The bot is parked, so this has no live impact.
- **N2 — lines 66-67, the lockfile comment: CORRECT, reproduced.** npm 10.9.7 with `package.json` alone fails with
  `Cannot read properties of null (reading 'edgesOut')` in arborist `#loadPeerSet` while resolving vitest's peers.
  With the committed lockfile, `npm install` and `npm ci` both succeed (150 packages). End users are not affected,
  because `npx` installs production dependencies only (102 packages, no vitest).
- **N3 — line 7, "MIT": CORRECT** by `package.json:6`. However, the tarball ships no LICENSE text (the `npm pack`
  file list). Before publishing, consider adding one, with a brand-name copyright line: the root `LICENSE` reads
  "Copyright (c) 2026 Conway".
