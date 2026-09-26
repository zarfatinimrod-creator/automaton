# Claim audit — `products/README.md`

Audited 2026-09-25 against the working tree at `245a19e` (branch `claude/new-session-j071dx`; the only
untracked path is this directory). Opus half; findings go to a separate refuter before anything changes.
**Nothing outside this file was edited.**

Method: I read the document line by line and pulled out every checkable claim. I checked each one
against the repo using code, data files, tests, `git show`/`git log` (read-only), and a real run of the
pcn874 suite. I did not use web search. For claims about external platforms, I checked only that the
repo backs them (`src/revenue/*.ts`, `BOARD.md`, `REJECTED.md`, `research/rendered/*`).

Commands run (all read-only):

- `cd products/pcn874 && /home/user/automaton/node_modules/.bin/vitest run` → `Test Files 6 passed (6)`, `Tests 311 passed (311)`
  (cli 27, validate 148, generate 93, spec-watch 6, parse 12, layout 25). Root vitest 2.1.9, because the product has no `node_modules`; the product pins 5.0.0.
- `ls products/pcn874/tests/fixtures/*.txt | wc -l` → 26; `ls products/pcn874/tests/fixtures/csv | wc -l` → 35; `ls .../csv/audit-* | wc -l` → 27 (the audit's 26 cases a…s plus an extra `audit-n2-european-thousands.csv`). A per-file grep shows every `audit-*` fixture is named in `tests/generate.test.ts`.
- `git show HEAD:products/pcn874/docs/SPEC-SOURCES.lock.json` and `git show origin/main:…` → both contain `"sources": {}`.
- `git show 0761326^:products/pcn874/README.md` → the original list of "seven places" the sources disagreed.

Status key: C = CORRECT, W = WRONG, S = STALE, U = UNSUPPORTED.

## Every claim checked (one line each)

| # | line | claim (short) | st | evidence |
|---|---|---|---|---|
| 1 | 3 | each product has its own package.json | C | all six dirs have `package.json` |
| 2 | 3 | each product has its own tests | C | `test/` or `tests/` in all six |
| 3 | 3 | each product README has deploy steps and the owner's one-time setup | **W** | F5 |
| 4 | 3 | products sit outside the root pnpm workspace | C | `pnpm-workspace.yaml` lists only `packages/*` |
| 5 | 7 | apify-il-open-data → line `apify-actors` | C | `portfolio.ts:36` |
| 6 | 7 | Apify Store, **published free** | **W** | F4 |
| 7 | 7 | 30-day stranger count is the plan | C | `portfolio.ts:42-44` operatingLoop |
| 8 | 7 | owner step = step 6: Apify sign-up with the brand username + `APIFY_TOKEN` | **W** | F1 (omits the Publish-to-Store click) |
| 9 | 7 | allowed straight after step 1 | C | `owner-steps.ts:168-173` earlyPart `afterStep: "merge-pr"` |
| 10 | 7 | no KYC | C | `products/apify-il-open-data/README.md:144-146`; `owner-steps.ts:171` |
| 11 | 8 | il-biz-tools → line `il-biz-tools` | C | `portfolio.ts:100` |
| 12 | 8 | Gumroad, merchant of record, ILS payout rendered | C | `rails.ts:126-133` evidence `"rendered"` |
| 13 | 8 | Paddle retired 7.9.2026 | C | `site.json` has no paddle block; `tests/license-branding.test.js:161,169` |
| 14 | 8 | step 3 — Gumroad account + token | C | `owner-steps.ts:110-116` |
| 15 | 8 | step 5 — domain | C | `owner-steps.ts:123-129` |
| 16 | 8 | step 6 — Netlify link | **W** | F13 (the step-6 token paste is left out) |
| 17 | 9 | pcn874 → line `pcn874` | C | `portfolio.ts:172` |
| 18 | 9 | Gumroad (ILS) | C | `rails.ts:88` |
| 19 | 9 | validator and generator built | C | `src/validate.ts`, `src/generate.ts`; 311 tests pass |
| 20 | 9 | no price set | C | `products/pcn874/README.md:7` |
| 21 | 9 | owner step = step 3 only | **W** | F2 |
| 22 | 10 | mcp-il-tools is a channel test, not a line | C | `BOARD.md` §2 build #5 (₪0) |
| 23 | 10 | rail: none — free | C | `products/mcp-il-tools/README.md:7` |
| 24 | 10 | step 5 — domain, for DNS verification of the brand namespace | C | `MISSION.md:281-286` |
| 25 | 10 | step 7 — GitHub organisation | C | `BOARD.md:243` "Blocked on the domain and the org." |
| 26 | 11 | telegram line `telegram-bots` is PARKED | C | `portfolio.ts:435-445` |
| 27 | 11 | rail: Telegram Stars → TON via Fragment | C | `products/telegram-il-tools-bot/README.md:10` |
| 28 | 11 | killed because Fragment's payout KYC needs a selfie | C | `portfolio.ts:440-441`, `REJECTED.md:1166` (external fact, not re-checked) |
| 29 | 11 | owner step: none — do not start it | C | killed line, no step in `owner-steps.ts` |
| 30 | 12 | x402 is a standby rail for `paid-apis`/`agent-services`, not a line | C | `portfolio.ts:410-433` `standby` |
| 31 | 12 | x402 (USDC on Base) | C | `x402-il-api/src/config.ts:48` `base: "eip155:8453"` |
| 32 | 12 | kept only while it costs ₪0/month | C | `BOARD.md:104` |
| 33 | 12 | owner step: none | C | `x402-il-api/README.md:85-87` |
| 34 | 14 | line ids come from `src/revenue/portfolio.ts` | C | `DEFAULT_PORTFOLIO` + `KILLED_LINES` |
| 35 | 14 | line ids do not all match directory names | C | `apify-actors` vs `apify-il-open-data`, etc. |
| 36 | 14 | owner steps are numbered as in `docs/OWNER_STEPS.he.md` | C | headings in steps 1-7 match `number` |
| 37 | 14 | …and defined as data in `src/revenue/owner-steps.ts` | C | `OWNER_STEPS` |
| 38 | 18 | BOARD.md cut the portfolio to four lines | C | `BOARD.md:110` |
| 39 | 19 | no product was deleted | C | six dirs in `products/` |
| 40 | 19 | none left the CI matrix | C* | `products-ci.yml:18`; see note N1 (the board ruled otherwise) |
| 41 | 22 | telegram-il-tools-bot is parked; line killed on a mandate collision | C | `REJECTED.md:1163-1173` |
| 42 | 23 | Fragment KYC = ID scan plus selfie | C | `REJECTED.md:1166` (repo claim) |
| 43 | 23 | the owner's brief forbids a camera step | C | `BOARD.md:106`, `constraints.ts` per BOARD §4 |
| 44 | 24 | nothing is built on it and nothing is expected from it | C | no line, no target |
| 45 | 24 | it re-opens only on a rendered camera-free Fragment withdrawal (`docs/REJECTED.md`) | C | `REJECTED.md:1201` |
| 46 | 26 | paid-apis/agent-services killed because x402 works out to single-digit ₪ per provider per month | C | `BOARD.md:104` "~₪6" |
| 47 | 27 | may stay deployed only while it costs ₪0/month | C | `BOARD.md:104` |
| 48 | 28 | any USDC that arrives is booked through `connectors/x402-local.ts` | **U** | F6 |
| 49 | 29 | nothing is planned on it | C | `portfolio.ts:420-421` |
| 50 | 30 | il-biz-tools moved from Paddle to Gumroad | C | `gumroad.js:1`, `site.json` |
| 51 | 30-31 | Gumroad is the **only** MoR with rendered proof of ILS payout to an Israeli bank | **S** | F7 |
| 52 | 31-32 | Paddle is an option with three named risks in `rails.ts` | C | `rails.ts:140-144` (three risks) |
| 53 | 32 | Paddle is never a step on his checklist | C | `owner-steps.ts:118-119` ownerDecision |
| 54 | 33 | pcn874 is the one new product | C | `BOARD.md` §3 ADD |
| 55 | 33 | validator and generator exist | C | ran |
| 56 | 33 | 311 tests | C | vitest run → 311 passed |
| 57 | 33 | 26 fixed-width fixtures | C | 26 `.txt` |
| 58 | 33 | 35 CSV inputs | C | 35 files in `fixtures/csv` |
| 59 | 33-34 | since 7.9.2026 the layout comes from the ITA circular to software houses | C | `pcn874-gov-il-874-eng.meta.json` fetchedAt 2026-09-07 |
| 60 | 35 | Appendix A (layout), B (representatives' file), C (permitted values) | C | `pcn874-gov-il-874-eng.txt:91,194,220` |
| 61 | 35-36 | render-watch.yml fetched it from GitHub Actions | C | meta.json `note`: "fetched by .github/workflows/render-watch.yml" |
| 62 | 36 | stored as extracted text in `research/rendered/` | C | `pcn874-gov-il-874-eng.txt` (597 lines) |
| 63 | 37 | every rule in `SPEC.md` cites that document by line | **W** | F10 |
| 64 | 37-38 | the three OSS implementations are now corroboration | C | `SPEC.md:70` §1.3 |
| 65 | 38 | six of the seven recorded disagreements are resolved | **W** | F8 |
| 66 | 39 | five by the document, one by a newer vendor manual | **W** | F8 |
| 67 | 39-40 | `reportedVat` arithmetic and line-ending/empty-file stay open | C | `SPEC.md:516,521` |
| 68 | 40 | no rule was invented for them | **W** | F9 |
| 69 | 40-41 | the document contradicted all three implementations once (reference group takes letters) | C | `SPEC.md:554` §6.9 |
| 70 | 41-42 | the old validator would have rejected a legal file | C | `products/pcn874/README.md:17` |
| 71 | 43 | refutation audit at `research/colony-sweep/audits/pcn874-reconciliation.md` | C | file exists |
| 72 | 44 | all thirteen resolutions held on their primary quote | C | audit `:17` "13 CONFIRMED" |
| 73 | 45 | several rules did not hold; files were built to prove it both ways | C | pcn874 README:48-49 |
| 74 | 45 | nine rules moved | C | 9 rows, `products/pcn874/README.md:51-61` |
| 75 | 45-47 | two counter-party gaps became errors (TMCPI; identified sale > ₪5,000) | C | same table |
| 76 | 47 | two new warnings (petty-cash cap; H counter party) | C | same table |
| 77 | 48-51 | five rules demoted from error to warning (named list) | C | same table |
| 78 | 51-52 | the guard test passed three unsupported errors because it only checked that a citation existed | C | audit `:22-26`; `validate.test.ts:686-691` |
| 79 | 52 | a second test reads the cited lines and requires the quote to come from them | **U** | F11 |
| 80 | 53 | the circular is from 2009 | C* | see note N3 (dated by content) |
| 81 | 53 | it carries no version number | C | `grep -i version` on the .txt → nothing |
| 82 | 53-54 | no later edition of the layout has been rendered | C | only three `pcn874-*` renders |
| 83 | 54-55 | the two newer Hebrew documents are vendor manuals that do not restate the byte layout | C | `SPEC.md:58-59` "no record layout" ×2 |
| 84 | 55-56 | `pcn874-spec-watch.yml` watches all three hashes, so a new edition gets noticed | **W** | F3 |
| 85 | 57 | generator built 7.9.2026, described in `docs/GENERATOR.md` | C | `pcn874/README.md:7`; file exists |
| 86 | 57-60 | CSV in, fixed-width out, widths from the layout table, sum/count header totals computed | C | `GENERATOR.md:1-8`; generator audit §1.1 |
| 87 | 60-61 | refuses to write a file its validator rejects; runs `validatePcn874` | C | `src/generate.ts:1175-1180` |
| 88 | 61 | returns nothing at all if there is an error | **W** | F12 |
| 89 | 61-63 | will not compute `reportedVat`; takes it from the user; refuses without one | C | `GENERATOR.md:19-23`; generator audit `:121` |
| 90 | 63 | it has no price | C | `pcn874/README.md:7` |
| 91 | 63-64 | never says a file will be accepted; points at the free simulator | C | generator audit "Checked and clean" |
| 92 | 65-66 | second refuter, same evening, at `…/pcn874-generator.md` | C | audit head `4ed9d5f`; checkpoint 20:45 UTC |
| 93 | 66 | all seven computed header totals held | C | audit `:7` |
| 94 | 67 | three CSVs wrote wrong amounts, exit 0, no warning | C | audit `:8` (c2, l, n) |
| 95 | 68-69 | unquoted comma shifted a row; a truncated row became a zero-value sale; `"1800,00"` became ₪180,000 | C | audit rows c2, l, n |
| 96 | 70-71 | the validator cross-checks no amount, and this boundary sits next to the refusal claim | C | `GENERATOR.md:9-12` |
| 97 | 72 | all ten code findings are implemented | C | the rule names and behaviours of all ten are in `src/`; tests pass |
| 98 | 72 | each of the audit's 26 inputs is a fixture with a test | C | 26 audit cases, 27 `audit-*` fixtures, each named in `generate.test.ts` |
| 99 | 74 | products with no line: `mcp-il-tools` (only) | **W** | F14 |
| 100 | 74-75 | mcp-il-tools's registry listing is blocked on the domain (5) and the organisation (7) | **U** | F15 (the list is incomplete) |
| 101 | 77-78 | lines with no product: `oss-bounties`; its "product" is a pull request | C | four live lines; `src/revenue/bounties/` |

101 claims checked: 15 not CORRECT (1 STALE, 3 UNSUPPORTED, 11 WRONG), plus 3 CORRECT claims recorded
because checking them was not obvious.

## Findings in detail (most expensive first)

### F1 — WRONG, HIGH — line 7: the Apify owner step omits the Publish-to-Store click

Claim: `step 6 — Apify sign-up with the brand username + APIFY_TOKEN (allowed straight after step 1; **no KYC**)`

Evidence: every other repo source that covers publishing says the token is not enough and that a
Console click makes the Actor public.
- `products/apify-il-open-data/README.md:149-150`: "The first push creates the Actor privately. Open it in the Console once and press **Publication → Publish to Store** to make it visible."
- `.github/workflows/apify-publish.yml:180-181`: "Making it PUBLIC in the Store is a one-click step in the Console the first time".
- `products/apify-il-open-data/docs/PUBLISH.md:41` and `docs/OWNER_STEPS.he.md:219-222` (step 6, part C, "one click in Apify").
- `logs/CHECKPOINT.md:285` records that an earlier audit had already found this click missing from the owner guide. It was added there, but never to this index, and never to `owner-steps.ts:170-171` (`earlyPart.what`).

Consequence: an owner who does exactly what this row says leaves the Actor private. The daily count
(`scripts/apify-runs.mjs`) then reports zero strangers, and the kill rule at `portfolio.ts:73` ("strangerUsers30d
under 10 at day 30 → instrument only … permanently unless the count later crosses 50") would fire on a
listing nobody could see.
Caveat for the refuter: `research/owner-docs-audit/owner-steps.md` F23 notes that no rendered Apify page
backs the click itself. Still, all four repo sources agree the click is needed, so this row is
incomplete relative to the repo.

Proposed fix: `step 6 — Apify sign-up with the brand username + APIFY_TOKEN (allowed straight after step 1; **no KYC**), then one click after the first CI push: Apify Console → Actor → Publication → **Publish to Store** (without it the Actor stays private and the stranger count reads zero)`

### F2 — WRONG, MEDIUM — line 9: pcn874 is blocked on more than step 3

Claim: `pcn874 | … | step 3 — Gumroad account + token`

Evidence: `src/revenue/owner-steps.ts`, the source line 14 names for this table, lists `pcn874` under
step 5 (domain, `:123-129`), step 7 (GitHub org, `:136-142`) and step 6 (tokens, `:160-166`), as well as
steps 1, 2 and 3. `portfolio.ts:198-199` (pcn874 `humanSetup`) names both step 3 **and** step 7: "Create
the GitHub organisation under the brand name so the open-source core and the npm scope carry it". The
il-biz-tools row lists its line-specific steps 3, 5 and 6. The pcn874 row has the same 3, 5 and 6, plus 7,
but shows only 3. (`products/pcn874/README.md:5` repeats the same omission.)

Proposed fix: `step 3 — Gumroad account + token; step 5 — domain; step 7 — GitHub organisation (open-source core and npm scope); step 6 — GUMROAD_ACCESS_TOKEN into GitHub secrets`

### F3 — WRONG, MEDIUM — lines 55-56: the spec watch cannot notice a new edition

Claim: `.github/workflows/pcn874-spec-watch.yml watches all three hashes so a new edition is noticed rather than assumed away.`

Evidence:
- `products/pcn874/docs/SPEC-SOURCES.lock.json:3` → `"sources": {}`. This is identical at `HEAD` and at `origin/main`. No hash is stored.
- `scripts/spec-watch.mjs:125-128`: a URL with no stored entry is printed as `new` and never sets `changed`. Only a stored hash that differs sets `changed = true`, which gives exit 1.
- `.github/workflows/pcn874-spec-watch.yml:30-31` `permissions: contents: read`, and it has no commit step. The lock the script writes at `:148` is thrown away with the runner. So every scheduled run reads an empty lock, reports all three as `new`, and exits 0 even if the Authority re-issued the document.
- `tests/spec-watch.test.ts:39-41` asserts `expect(lock.sources).toEqual({})`, with the comment "this job, which has never run in CI". The empty lock is enforced by a test.
- Partial mitigation, not what the claim names: `render-watch.yml` (weekly, `:49`) re-fetches the same three URLs from `urls.txt:93-95` and silently commits a changed PDF (`:128`, `[skip ci]`).

Proposed fix: `.github/workflows/pcn874-spec-watch.yml downloads all three documents weekly, but **cannot yet flag a new edition**: its lock file holds no hashes and the job cannot commit one, so every run passes. Until the three SHA-256s in research/rendered/pcn874-*.meta.json are committed to docs/SPEC-SOURCES.lock.json (and tests/spec-watch.test.ts stops requiring it empty), the only signal is a silent "render: … changed" commit from render-watch.yml.`

### F4 — WRONG, MEDIUM — line 7: "published free" reads as a present state that is not true

Claim: `Apify Store, **published free** while the 30-day stranger count runs`

Evidence: the Actor has not been published and no count is running.
- `state/colony/REPORT.md:32` (and the same on `origin/main`): `apify-actors | core | awaiting_setup`.
- `logs/CHECKPOINT.md:60-61`: none of the owner's seven steps has been done.
- `state/colony/measurements/apify-runs.json`, the file the daily count writes (`apify-publish.yml` header; product README:170), does not exist.
- `apify-publish.yml` exits 0 with a notice while `APIFY_TOKEN` is missing.

The phrase is also the line's planned name (`portfolio.ts:37`), but here it sits in the Rail column in bold,
with no tense.

Proposed fix: `Apify Store — **to be published free** (not yet: awaiting step 6 and the Publish-to-Store click); the 30-day stranger count starts when it goes public`

### F5 — WRONG, MEDIUM — line 3: product READMEs do not all hold the owner's one-time setup, and some contradict this index

Claim: `Each directory is standalone (own package.json, tests, README with deploy steps and the owner's one-time setup).`

Evidence:
- `products/mcp-il-tools/README.md` has no deploy section and no owner section. Its headings are Install, Tools, On 1-800, What this is honest about, The paid version, Development. It also says (`:51-54`) that the logic "is sold per-call over the x402 protocol", which contradicts line 12's standby rail.
- `products/il-biz-tools/README.md:252-271`, "One-time steps only the owner can do", lists owner work that is not in `owner-steps.ts`'s seven steps:
  - `:262` "Google Search Console verification";
  - `:266-267` "confirm the 2026 brackets … and flip `verified` … Nobody here may flip it";
  - `:268-270` registrar amounts.

  `portfolio.ts:109` says the rate check is agent work ("confirmed against two independent GitHub-hosted implementations"), and MISSION rule 1 says "Never invent a step that isn't required".
- `products/telegram-il-tools-bot/README.md:7` is headed "What the owner does once (no KYC)" and tells him to create a bot in BotFather. This index (line 11) says "Fragment's payout KYC needs a selfie … do not start it".

Pointing the owner at these READMEs for "the owner's one-time setup" sends him to instructions that
conflict with the checklist.

Proposed fix: `Each directory is standalone (own package.json and tests; most READMEs also carry deploy steps). The owner's steps are the seven in docs/OWNER_STEPS.he.md and nothing else — where a product README lists an owner step that is not there (il-biz-tools: Search Console, tax-rate verification; telegram-il-tools-bot: BotFather), the checklist wins.`

### F6 — UNSUPPORTED, MEDIUM — line 28: USDC is not booked through `x402-local.ts` by any existing code path

Claim: `any USDC that arrives is booked through src/revenue/connectors/x402-local.ts`

Evidence:
- `x402-local.ts:1-8, 20-24, 34-35` only imports rows already in the runtime's `transactions` table whose type is `transfer_in`/`credit_purchase` **and** whose description carries `[line:<id>]`. Untagged rows are skipped ("untagged transfers are funding, not revenue").
- The only `insertTransaction` calls in the runtime are `src/agent/tools.ts:327-333` (a `credit_purchase` described as `x402 credit topup: $…`, with no line tag) and `:1031` and `:1769` (`transfer_out`).
- `grep -rn -i "ledger|transactions|sqlite|automaton" products/x402-il-api/src` finds nothing.
- USDC from the API settles on-chain to `X402_PAY_TO` (`x402-il-api/README.md:54`), and nothing reads it back into `transactions`.
- `products/x402-il-api/scripts/tag-payment.md:33` states "The runtime records the inbound transfer in `transactions` with the tag", but no code does this. Its fallback is a manual `scripts/colony.ts record … --source x402` (`:43-45`), which does not go through `x402-local.ts`, and it tags `[line:paid-apis]`, a line that is now killed.

Proposed fix: `any USDC that arrives has to be recorded by hand (scripts/colony.ts record … --source x402 --external-id <tx hash>, per products/x402-il-api/scripts/tag-payment.md); x402-local.ts only books transactions rows tagged [line:<id>], and nothing writes such a row for an inbound USDC settlement yet`

### F7 — STALE, LOW — lines 30-31: "the only merchant of record with rendered proof of ILS payout"

Claim: `Gumroad is the only merchant of record with rendered proof of ILS payout to an Israeli bank.`

Evidence: Freemius was rendered on the same day.
- `src/revenue/rails.ts:347-354`, evidence `"rendered"`, source `research/rendered/freemius-*.txt`.
- It is a merchant of record: `freemius-allowed-prohibited.txt:240` "As your Merchant of Record".
- It pays Israel: `freemius-supported-countries.txt:308` "Israel".
- It can convert a payout to local currency: `freemius-your-earnings.txt:143-150` — ILS sales go into the USD balance, and "For international Wise and wire transfers … you can convert payouts to your local currency".

Gumroad is still the only one with a direct `Israel | ILS` row. This agrees with sibling audit
`owner-steps.md` F22.

Proposed fix: `Gumroad is the only merchant of record with a rendered direct ILS payout row for Israel; Freemius (rendered 7.9.2026, rails.ts CANDIDATE_RAILS) pays Israel from a USD balance, convertible to ILS only via Wise or wire.`

### F8 — WRONG, LOW — lines 38-39: "six of the seven disagreements … five by the document"

Claim: `Six of the seven recorded disagreements are resolved (five by the document, one by a newer vendor manual); the reportedVat arithmetic and the line-ending/empty-file questions stay open`

Evidence:
- The arithmetic contradicts itself: six resolved plus two open is eight, not seven.
- The seven, as the source-derived spec listed them (`git show 0761326^:products/pcn874/README.md:32`): last header width (§6.1), last nine characters (§6.2), which records feed the input count (§6.4), `X`/`Z` (§6.5), line endings/empty file (§6.6), `reportedVat` arithmetic (§6.7), sign of zero (§6.8).
- `SPEC.md` headings: §6.1, §6.4, §6.5 and §6.8 are "RESOLVED (official)", §6.2 is settled by the H-ERP manual, and §6.6 and §6.7 are "STILL OPEN".
- So of the seven, **five** are resolved (four by the document, one by a vendor manual) and **two** are open. The "five by the document" count only works by also counting §6.3 (`zeroOrExemptSalesAmount`), which was not one of the seven.
- The error probably comes from `SPEC.md:424-428` ("Six were settled by the document; one by a vendor manual …; one is still open"), which contradicts its own §6.6 and §6.7 headings.

Proposed fix: `Of the seven recorded disagreements, five are resolved (four by the document, one by a newer vendor manual) and two stay open — the reportedVat arithmetic and the line-ending/empty-file question. (The eighth numbered place, zeroOrExemptSalesAmount, was also settled by the document.)`

### F9 — WRONG, LOW — line 40: "no rule was invented for them"

Evidence: `reportedVat` has no rule (correct). The line-ending and empty-file questions do have rules,
both warnings: `file.lineEnding.mixed` (`src/validate.ts:959-977`), whose sources are only
`accounter`/`rcbuilder`, and `file.detail.none` (`:1106-1112`). `SPEC.md:521` says "warn on mixed, warn on a
detail-free file", and `SPEC.md:359-361` says the line-ending warning "is the one rule in the product whose
basis is `oss-only`".

Proposed fix: `…stay open: no reportedVat rule exists at all, and the line-ending/empty-file questions carry warnings only (file.lineEnding.mixed, which rests on open-source code alone, and file.detail.none).`

### F10 — WRONG, LOW — line 37: "Every rule in SPEC.md cites that document by line"

Evidence: `SPEC.md:299` says "There is no rule in the validator today whose basis is `oss-only` except the
line-ending…". `SPEC.md:359-361` says the same, and `src/validate.ts:968-971` cites only `accounter:` and
`rcbuilder:` for it.

Proposed fix: `Every rule in products/pcn874/docs/SPEC.md but one cites that document by line; the exception, the file.lineEnding.mixed warning, rests on the open-source implementations and says so.`

### F11 — UNSUPPORTED (overstated), LOW — line 52: what the second test enforces

Claim: `a second test that reads the cited lines and requires the finding's quote to come from them.`

Evidence: `tests/validate.test.ts:692-695, 703-709, 727-737` requires only that the quote and the cited
lines share **at least one run of four consecutive words** (`RUN = 4`, `shared.length > 0`). Its own comment
says: "It cannot prove the rule follows from the document, but it does catch a quote that has drifted".
`products/pcn874/README.md:68` describes it correctly.

Proposed fix: `…a second test that reads the cited lines and requires the finding's quote to share a run of four consecutive words with them.`

### F12 — WRONG, LOW — line 61: "returns nothing at all"

Evidence: on a refusal `generatePcn874` still returns a result, with `text: null`, the validator's findings
and counts, and `parsed.records` emptied (`src/generate.ts:1180, 1205`; `GENERATOR.md:4-8`). The CLI prints
the findings and writes no file.

Proposed fix: `…and returns no file text at all — only the findings — if that reports an error`

### F13 — WRONG (incomplete), LOW — line 8: il-biz-tools' step 6 is not only the Netlify link

Evidence: `owner-steps.ts:160-167` (step 6) covers the Netlify link and pasting `GUMROAD_ACCESS_TOKEN`
("lets the loop read sales and write each one to the ledger"). `portfolio.ts:131` gives il-biz-tools' step 6
as "Link the repo in Netlify and paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret".

Proposed fix: `step 6 — Netlify link + GUMROAD_ACCESS_TOKEN into GitHub secrets`

### F14 — WRONG (inconsistent with its own table), LOW — line 74: "Products with no line: mcp-il-tools"

Evidence: the table itself calls `x402-il-api` a "standby rail, not a line" (line 12), and says the line of
`telegram-il-tools-bot` is killed (line 11; `KILLED_LINES`, `portfolio.ts:435`). Three products have no
live line, not one.

Proposed fix: `**Products with no live line:** mcp-il-tools, a distribution channel test rather than a storefront (registry listing blocked as below), plus the parked telegram-il-tools-bot and the standby x402-il-api described above.`

### F15 — UNSUPPORTED (incomplete blocker list), LOW — lines 74-75 and 10: what blocks the MCP registry listing

Claim: the listing `is blocked on the domain (step 5) and the organisation (step 7)`.

Evidence: the rendered registry quickstart the repo relies on
(`research/colony-sweep/scouts/distribution--partnerships-integrations.md:13-16`) puts `npm publish` of the
package, with `mcpName` in package.json, before `mcp-publisher publish`. But:
- `products/mcp-il-tools/package.json` has no `mcpName` (`grep` exit 1);
- no `NPM_TOKEN` or npm-account step exists anywhere in the repo;
- `.github/workflows/mcp-publish.yml`, which `BOARD.md:243` lists for this build, does not exist.

The two listed steps are necessary, but they are presented as the whole blocker set.

Proposed fix: `…whose registry listing is blocked on the domain (step 5) and the organisation (step 7), and on publishing @bediyuk/mcp-il-tools to npm — for which no step, token or workflow exists yet.`

## Correct, but not obvious to check

- **N1 — line 19, "none left the CI matrix": CORRECT as a fact, but not what the board ruled.**
  `products-ci.yml:18` still lists all six products. However, `BOARD.md:106` ("`products/telegram-il-tools-bot`
  stays on disk, out of the CI matrix") and `BOARD.md:246` ("killed products stay on disk, leave the CI
  matrix") ruled the other way. The deviation is recorded in `REJECTED.md:1172-1173` ("not removed from the
  products CI matrix") and `portfolio.ts:444`. The paragraph sits under "What the board decided", so a
  reader would assume the board chose this. Suggested addition: `(the board's §3 said killed products
  leave the matrix; they were kept in it deliberately — REJECTED.md)`.
- **N2 — line 33 and line 72, the numbers.** 311 was confirmed by running the suite (311 passed across 6
  files), 26 and 35 by listing the fixtures, and "the audit's 26 inputs" by the audit's §4 table (cases a …
  s = 26). There are 27 `audit-*.csv` fixtures because of an extra `n2` case; every one is named in
  `tests/generate.test.ts`.
- **N3 — line 53, "from 2009".** The circular has no date or version string. The year is inferred from
  its content: `pcn874-gov-il-874-eng.txt:12` "must be completed by 01/01/2010", `:59` "From 1/2011", `:63`
  "From 1/2012". The inference is sound, and `products/pcn874/README.md:117` says it was dated this way.
