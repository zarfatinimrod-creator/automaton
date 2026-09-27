# Algora bounty supply — the weekly claimable count

**Status: MEASURED 2026-09-27T23:43:21.244Z by `.github/workflows/algora-supply.yml` (`scripts/algora-supply.ts`).** Regenerated on every run — do not edit by hand. Ordered by `research/colony-sweep/BOARD-2.md §2.2` as the first build step of `oss-bounties`.

## The number

**108 claimable bounties** ($74,065 in visible amounts) out of 551 open issues carrying Algora's `💎 Bounty` label across 66 repositories.

Stricter reading, not gated: **108** once the 0 bounties whose claimed pull request Algora already saw merged are left out — funded and unpaid, but promised to that solver. The board's thresholds read the number above, on its own definition; this one is shown so the week-4 reader can weigh both.

**GitHub counted 3 issues it did not serve; the claimable count could be up to 3 higher.** Search reported 554; each query that stayed short was read twice in full and served the identical issues both times, so the gap is index entries GitHub counts and will not show (hidden, deleted or transferred issues, or repositories no longer available). It is within the allowance of 5 (max(5, 1% of the reported total)). The count above is of what was served; the gap is carried here, not added to it or read as a zero.

A count of jobs a payer has posted, not revenue: money counts only in `revenue_ledger` with a platform transaction id (MISSION rule 2).

## The board's reading — week 1 of 4

| ISO week | Measured at | Claimable |
|---|---|---:|
| 2026-W39 | 2026-09-27T23:43:21.244Z | 108 |

Week 1 of 4. The board reads the mean of 4 weekly readings: ≥ 10 keeps ₪300; 3-9 retargets to ₪100 (grade contradicted); under 3 kills the line. Until then the owner is not asked for step 4 on this line's account.

This file reads the rule; it does not apply it. The ₪300 target changes only when the main thread records the ruling in `src/revenue/portfolio.ts`.

## What was excluded, and why

| Filter | Dropped | Left | Why |
|---|---:|---:|---|
| (labelled, open) | — | 551 | GitHub search `is:issue is:open label:"💎 Bounty"` |
| `not-an-open-labelled-issue` — not an open issue carrying the label | 0 | 551 | The search result was a pull request, closed, or missing the `💎 Bounty` label. GitHub search should never return one; it is counted rather than trusted. |
| `rewarded-label` — carries `💰 Rewarded` | 31 | 520 | Algora adds this label when it pays (notify_transfer.ex). The `💎 Bounty` label stays on a paid issue, which is why labelled supply is a ceiling, not a count. |
| `archived-repo` — repository archived | 37 | 483 | Archived repositories keep their bounty labels and cannot take a pull request — the census's second method finding (BOARD-2 §2.2). |
| `payout-comment` — Algora's bot already announced the payout | 0 | 483 | "has been awarded" by algora-pbc[bot] (notify_transfer.ex): the bounty is paid even where the label was not added. |
| `no-algora-bounty-comment` — no bounty comment from algora-pbc[bot] | 242 | 241 | The line's channel is the payer's own comment; a dollar sign from anybody else is not evidence of a funded bounty (intake.ts rule 5). |
| `amount-unparseable` — no amount readable from the bot comment | 0 | 241 | BOARD-2 §2.2 requires a parseable amount. An unreadable amount is an unknown, not a zero, so it is not counted either way. |
| `amount-under-minimum` — amount under $50 | 128 | 113 | BOARD-2 §2.2: "a parseable amount ≥ $50". The census's accessible long tail was $3-$245 tickets with a median of 8 competing comments. |
| `policy-forbidden` — repository or issue bans AI-authored work | 5 | 108 | assessRepoPolicy (policy.ts) graded it `forbidden` from CONTRIBUTING, CODE_OF_CONDUCT, the pull-request template, the README or the issue itself. `unknown` is counted: silence is not a ban, and the colony discloses on every PR anyway. |

Examples, up to three per filter, so each can be checked by hand:

- `rewarded-label` — 18605041367/gogo#4: labels: 💎 Bounty, 💰 Rewarded
- `rewarded-label` — 192600/fishwww#1: labels: 💎 Bounty, 💰 Rewarded
- `rewarded-label` — 192600/fishwww#12: labels: 💎 Bounty, 💰 Rewarded
- `archived-repo` — CaravanaCloud/.github#1: CaravanaCloud/.github is archived
- `archived-repo` — CaravanaCloud/blink#22: CaravanaCloud/blink is archived
- `archived-repo` — CaravanaCloud/ecomarkets#13: CaravanaCloud/ecomarkets is archived
- `no-algora-bounty-comment` — ApexOpsStudio/ai-gitops-test-target#1: 23 comments, none from algora-pbc[bot] carrying /attempt or /claim
- `no-algora-bounty-comment` — ApexOpsStudio/ai-gitops-test-target#2: 18 comments, none from algora-pbc[bot] carrying /attempt or /claim
- `no-algora-bounty-comment` — ApexOpsStudio/ai-gitops-test-target#3: 15 comments, none from algora-pbc[bot] carrying /attempt or /claim
- `amount-under-minimum` — 18540233512/gggg#3: $10  $50
- `amount-under-minimum` — 18605041367/gogo#1: $1  $50
- `amount-under-minimum` — 18605041367/gogo#10: $5  $50
- `policy-forbidden` — go-gitea/gitea#1872: contributing: "Maintainers reserve the right to close pull requests and issues that do not disclose AI assistance, that appear to be low-quality AI-generated content, or wh..."
- `policy-forbidden` — go-gitea/gitea#4898: contributing: "Maintainers reserve the right to close pull requests and issues that do not disclose AI assistance, that appear to be low-quality AI-generated content, or wh..."
- `policy-forbidden` — UnsafeLabs/Coolify-Rust-v4#1: contributing: "- **No AI-Generated Code**: Do not submit code generated by AI tools without fully understanding and verifying it."

## Claimable bounties

| Repository | Issue | Amount | Policy | Solution merged | Title |
|---|---|---:|---|---|---|
| `getdozer/dozer` | [#1631](https://github.com/getdozer/dozer/issues/1631) | $21,000 | unknown | no | Create an Introductory Video for Dozer |
| `javelin-anticheat/py-workedtask` | [#2](https://github.com/javelin-anticheat/py-workedtask/issues/2) | $10,000 | unknown | no | [Feature] Implement Basic Anti-Cheat Protection |
| `UnsafeLabs/Bounty-Hunters` | [#520](https://github.com/UnsafeLabs/Bounty-Hunters/issues/520) | $7,000 | allowed | no | [ Cobol ] Fix race condition in concurrent CERT-STORE-FILE access causing FILE STATUS 92 |
| `UnsafeLabs/Bounty-Hunters` | [#519](https://github.com/UnsafeLabs/Bounty-Hunters/issues/519) | $4,000 | allowed | no | [ Cobol ] Fix STRING overflow silently truncating Subject DN in audit log entries |
| `UnsafeLabs/Bounty-Hunters` | [#516](https://github.com/UnsafeLabs/Bounty-Hunters/issues/516) | $1,700 | allowed | no | [ Cobol ] Fix OCCURS DEPENDING ON causing S0C4 abend when certificate chain has zero en... |
| `ccgjjnsvatk/fly` | [#9](https://github.com/ccgjjnsvatk/fly/issues/9) | $1,000 | unknown | no | testgogo |
| `UnsafeLabs/Bounty-Hunters` | [#920](https://github.com/UnsafeLabs/Bounty-Hunters/issues/920) | $900 | allowed | no | [ Crypto ] Fix cross-chain replay attack in CrossChainBridge signature verification |
| `UnsafeLabs/Bounty-Hunters` | [#754](https://github.com/UnsafeLabs/Bounty-Hunters/issues/754) | $800 | allowed | no | [ Laravel ] Implement webhook system with signature verification and retry queue |
| `UnsafeLabs/Bounty-Hunters` | [#916](https://github.com/UnsafeLabs/Bounty-Hunters/issues/916) | $800 | allowed | no | [ Crypto ] Fix MultiSigWallet confirmation race condition during execution callback |
| `SecureBananaLabs/bug-bounty` | [#80](https://github.com/SecureBananaLabs/bug-bounty/issues/80) | $780 | unknown | no | Pixel Art Creation with high Creative Thinking |
| `SecureBananaLabs/bug-bounty` | [#30](https://github.com/SecureBananaLabs/bug-bounty/issues/30) | $750 | unknown | no | Benchmark APIs with p50, p95, p99 latency, RPS, error rate and TTFB |
| `SecureBananaLabs/bug-bounty` | [#743](https://github.com/SecureBananaLabs/bug-bounty/issues/743) | $700 | unknown | no | Low Handing Fruit Automation |
| `UnsafeLabs/Bounty-Hunters` | [#515](https://github.com/UnsafeLabs/Bounty-Hunters/issues/515) | $700 | allowed | no | [ Cobol ] Fix EBCDIC-to-ASCII conversion corrupting certificate fingerprint in VERIFY-S... |
| `UnsafeLabs/Bounty-Hunters` | [#521](https://github.com/UnsafeLabs/Bounty-Hunters/issues/521) | $700 | allowed | no | [ Cobol ] Fix UNSTRING parsing failure for multi-value RDN certificates with escaped co... |
| `UnsafeLabs/Bounty-Hunters` | [#802](https://github.com/UnsafeLabs/Bounty-Hunters/issues/802) | $700 | allowed | no | [ FastAPI ] Implement standardized pagination with offset and cursor support |
| `UnsafeLabs/Bounty-Hunters` | [#912](https://github.com/UnsafeLabs/Bounty-Hunters/issues/912) | $700 | allowed | no | [ Crypto ] Fix tx.origin phishing vulnerability in GovernanceToken delegation |
| `UnsafeLabs/Bounty-Hunters` | [#835](https://github.com/UnsafeLabs/Bounty-Hunters/issues/835) | $650 | allowed | no | [ T3 Code ] Add multi-session management with device tracking and revocation |
| `getdozer/dozer` | [#1653](https://github.com/getdozer/dozer/issues/1653) | $600 | unknown | no | WASM UDF support |
| `getdozer/dozer` | [#1659](https://github.com/getdozer/dozer/issues/1659) | $600 | unknown | no | Support for 'IN' clause in streaming SQL |
| `UnsafeLabs/Bounty-Hunters` | [#790](https://github.com/UnsafeLabs/Bounty-Hunters/issues/790) | $600 | allowed | no | [ Laravel ] Implement file upload system with checksum dedup and thumbnail generation |
| `UnsafeLabs/Bounty-Hunters` | [#918](https://github.com/UnsafeLabs/Bounty-Hunters/issues/918) | $600 | allowed | no | [ Crypto ] Fix first-depositor price manipulation in LiquidityPool |
| `UnsafeLabs/Bounty-Hunters` | [#914](https://github.com/UnsafeLabs/Bounty-Hunters/issues/914) | $550 | allowed | no | [ Crypto ] Fix phantom reward accrual after period expiry in YieldVault |
| `gyroflow/gyroflow` | [#45](https://github.com/gyroflow/gyroflow/issues/45) | $500 | unknown | no | Optical only stabilization |
| `gyroflow/gyroflow` | [#742](https://github.com/gyroflow/gyroflow/issues/742) | $500 | unknown | no | Refactor lens profile handling |
| `UnsafeLabs/Bounty-Hunters` | [#829](https://github.com/UnsafeLabs/Bounty-Hunters/issues/829) | $500 | allowed | no | [ T3 Code ] Implement automatic token refresh in ACP client with Effect retry |
| `UnsafeLabs/Bounty-Hunters` | [#793](https://github.com/UnsafeLabs/Bounty-Hunters/issues/793) | $450 | allowed | no | [ Laravel ] Implement user notification preferences with channel routing |
| `UnsafeLabs/Bounty-Hunters` | [#845](https://github.com/UnsafeLabs/Bounty-Hunters/issues/845) | $450 | allowed | no | [ T3 Code ] Add Effect.Stream-based streaming to Codex integration with backpressure |
| `UnsafeLabs/Bounty-Hunters` | [#911](https://github.com/UnsafeLabs/Bounty-Hunters/issues/911) | $450 | allowed | no | [ Crypto ] Fix reentrancy vulnerability in StakingVault withdraw and claimRewards |
| `SecureBananaLabs/bug-bounty` | [#76](https://github.com/SecureBananaLabs/bug-bounty/issues/76) | $430 | unknown | no | Technical Poem Generation and Content Creation |
| `UnsafeLabs/Bounty-Hunters` | [#562](https://github.com/UnsafeLabs/Bounty-Hunters/issues/562) | $400 | allowed | no | [ MUMPS/M ] Fix naked reference cascade corrupting ^GLBTLS global after DO CERT^TLSUTIL... |
| `UnsafeLabs/Bounty-Hunters` | [#563](https://github.com/UnsafeLabs/Bounty-Hunters/issues/563) | $400 | allowed | no | [ Fortran 77 ] Fix EQUIVALENCE overlap causing CERTBUF to overwrite SIGBLOCK when X.509... |
| `UnsafeLabs/Bounty-Hunters` | [#564](https://github.com/UnsafeLabs/Bounty-Hunters/issues/564) | $400 | allowed | no | [ Ada ] Fix unchecked deallocation of TLS_Certificate_Chain access type causing danglin... |
| `UnsafeLabs/Bounty-Hunters` | [#565](https://github.com/UnsafeLabs/Bounty-Hunters/issues/565) | $400 | allowed | no | [ Prolog ] Fix non-terminating unification in verify_chain/3 when certificate issuer DN... |
| `UnsafeLabs/Bounty-Hunters` | [#566](https://github.com/UnsafeLabs/Bounty-Hunters/issues/566) | $400 | allowed | no | [ PL/I ] Fix AREA condition on-unit masking STRINGSIZE during certificate OID encoding ... |
| `UnsafeLabs/Bounty-Hunters` | [#611](https://github.com/UnsafeLabs/Bounty-Hunters/issues/611) | $400 | allowed | no | [ CONTEXT RIFT ] Fix typos in knowledge-base/context.json |
| `UnsafeLabs/Bounty-Hunters` | [#747](https://github.com/UnsafeLabs/Bounty-Hunters/issues/747) | $400 | allowed | no | [ Laravel ] Add caching layer to config loading and fix cache store connection validation |
| `UnsafeLabs/Bounty-Hunters` | [#798](https://github.com/UnsafeLabs/Bounty-Hunters/issues/798) | $400 | allowed | no | [ FastAPI ] Add SSE disconnect detection, event filtering, and reconnect replay |
| `UnsafeLabs/Bounty-Hunters` | [#822](https://github.com/UnsafeLabs/Bounty-Hunters/issues/822) | $400 | allowed | no | [ T3 Code ] Fix SSH askpass script leaking password via insecure temp file permissions |
| `UnsafeLabs/Bounty-Hunters` | [#856](https://github.com/UnsafeLabs/Bounty-Hunters/issues/856) | $380 | allowed | no | [ T3 Code ] Add sliding window metrics aggregation with Effect.Stream |
| `SecureBananaLabs/bug-bounty` | [#1](https://github.com/SecureBananaLabs/bug-bounty/issues/1) | $350 | unknown | no | Implement Secure Payment Gateway and Payment Service |
| `UnsafeLabs/Bounty-Hunters` | [#768](https://github.com/UnsafeLabs/Bounty-Hunters/issues/768) | $350 | allowed | no | [ FastAPI ] Add rate limiting and key rotation support to API key authentication |
| `UnsafeLabs/Bounty-Hunters` | [#786](https://github.com/UnsafeLabs/Bounty-Hunters/issues/786) | $350 | allowed | no | [ Laravel ] Implement audit logging trait for Eloquent model change tracking |
| `UnsafeLabs/Bounty-Hunters` | [#838](https://github.com/UnsafeLabs/Bounty-Hunters/issues/838) | $350 | allowed | no | [ T3 Code ] Add checkpoint snapshot pruning with retention policy and CLI command |
| `UnsafeLabs/Bounty-Hunters` | [#917](https://github.com/UnsafeLabs/Bounty-Hunters/issues/917) | $350 | allowed | no | [ Crypto ] Fix integer overflow in TokenVesting calculation for large allocations |
| `UnsafeLabs/Bounty-Hunters` | [#865](https://github.com/UnsafeLabs/Bounty-Hunters/issues/865) | $310 | allowed | no | [ T3 Code ] Add Effect.Cache-based provider API response caching with TTL |
| `UnsafeLabs/Bounty-Hunters` | [#763](https://github.com/UnsafeLabs/Bounty-Hunters/issues/763) | $300 | allowed | no | [ FastAPI ] Implement dynamic CORS origin validation with callback support |
| `UnsafeLabs/Bounty-Hunters` | [#826](https://github.com/UnsafeLabs/Bounty-Hunters/issues/826) | $300 | allowed | no | [ T3 Code ] Add IPC message queuing for backend disconnect resilience |
| `UnsafeLabs/Bounty-Hunters` | [#913](https://github.com/UnsafeLabs/Bounty-Hunters/issues/913) | $300 | allowed | no | [ Crypto ] Fix missing slippage protection and deadline in SimpleSwap |
| `UnsafeLabs/Bounty-Hunters` | [#844](https://github.com/UnsafeLabs/Bounty-Hunters/issues/844) | $280 | allowed | no | [ T3 Code ] Add Tailscale peer diagnostics with latency graph |
| `UnsafeLabs/Bounty-Hunters` | [#863](https://github.com/UnsafeLabs/Bounty-Hunters/issues/863) | $260 | allowed | no | [ T3 Code ] Add gzip and brotli response compression to HTTP layer |
| `getdozer/dozer` | [#1690](https://github.com/getdozer/dozer/issues/1690) | $250 | unknown | no | Sample: Dozer + LLM + Vector database + Langchain sample |
| `onyx-dot-app/onyx` | [#2281](https://github.com/onyx-dot-app/onyx/issues/2281) | $250 | unknown | no | Jira Service Management Connector |
| `UnsafeLabs/Bounty-Hunters` | [#756](https://github.com/UnsafeLabs/Bounty-Hunters/issues/756) | $250 | allowed | no | [ Laravel ] Add email verification flow and fix mail configuration for SMTP fallback |
| `UnsafeLabs/Bounty-Hunters` | [#796](https://github.com/UnsafeLabs/Bounty-Hunters/issues/796) | $250 | allowed | no | [ FastAPI ] Add router-level middleware support to APIRouter |
| `UnsafeLabs/Bounty-Hunters` | [#820](https://github.com/UnsafeLabs/Bounty-Hunters/issues/820) | $250 | allowed | no | [ T3 Code ] Add backend health monitoring and auto-restart to DesktopBackendManager |
| `UnsafeLabs/Bounty-Hunters` | [#919](https://github.com/UnsafeLabs/Bounty-Hunters/issues/919) | $250 | allowed | no | [ Crypto ] Fix zero-fee flash loans and add pool drainage protection |
| `UnsafeLabs/Bounty-Hunters` | [#851](https://github.com/UnsafeLabs/Bounty-Hunters/issues/851) | $230 | allowed | no | [ T3 Code ] Add deferred command scheduler with Effect.Schedule and SQLite persistence |
| `UnsafeLabs/Bounty-Hunters` | [#832](https://github.com/UnsafeLabs/Bounty-Hunters/issues/832) | $220 | allowed | no | [ T3 Code ] Add SSH tunnel keepalive and automatic reconnection with backoff |
| `gyroflow/gyroflow` | [#150](https://github.com/gyroflow/gyroflow/issues/150) | $200 | unknown | no | Support lensfun database |
| `UnsafeLabs/Bounty-Hunters` | [#752](https://github.com/UnsafeLabs/Bounty-Hunters/issues/752) | $200 | allowed | no | [ Laravel ] Implement API authentication controller with token-based login and registra... |
| `UnsafeLabs/Bounty-Hunters` | [#804](https://github.com/UnsafeLabs/Bounty-Hunters/issues/804) | $200 | allowed | no | [ FastAPI ] Add FastAPITestClient with auth helpers and WebSocket convenience methods |
| `UnsafeLabs/Bounty-Hunters` | [#858](https://github.com/UnsafeLabs/Bounty-Hunters/issues/858) | $200 | allowed | no | [ T3 Code ] Enable SQLite WAL mode and add Effect.Pool connection pooling |
| `UnsafeLabs/Bounty-Hunters` | [#915](https://github.com/UnsafeLabs/Bounty-Hunters/issues/915) | $200 | allowed | no | [ Crypto ] Fix PriceOracle missing staleness check and fallback mechanism |
| `UnsafeLabs/Bounty-Hunters` | [#841](https://github.com/UnsafeLabs/Bounty-Hunters/issues/841) | $190 | allowed | no | [ T3 Code ] Add request body size limiting with per-route overrides |
| `UnsafeLabs/Bounty-Hunters` | [#766](https://github.com/UnsafeLabs/Bounty-Hunters/issues/766) | $180 | allowed | no | [ FastAPI ] Add WebSocket heartbeat with configurable ping interval and disconnect call... |
| `UnsafeLabs/Bounty-Hunters` | [#825](https://github.com/UnsafeLabs/Bounty-Hunters/issues/825) | $180 | allowed | no | [ T3 Code ] Add runtime validation for provider configuration schemas |
| `UnsafeLabs/Bounty-Hunters` | [#788](https://github.com/UnsafeLabs/Bounty-Hunters/issues/788) | $175 | allowed | no | [ Laravel ] Implement lightweight role-based access control with permissions |
| `UnsafeLabs/Bounty-Hunters` | [#861](https://github.com/UnsafeLabs/Bounty-Hunters/issues/861) | $170 | allowed | no | [ T3 Code ] Standardize server error types with Effect.Data.TaggedEnum |
| `UnsafeLabs/Bounty-Hunters` | [#848](https://github.com/UnsafeLabs/Bounty-Hunters/issues/848) | $160 | allowed | no | [ T3 Code ] Add encryption key rotation for desktop safe storage credentials |
| `BAWES-Universe/workadventure-universe` | [#1](https://github.com/BAWES-Universe/workadventure-universe/issues/1) | $150 | unknown | no | 📱 Epic: BAWES Universe Mobile App (Android + iOS) |
| `UnsafeLabs/Bounty-Hunters` | [#758](https://github.com/UnsafeLabs/Bounty-Hunters/issues/758) | $150 | allowed | no | [ FastAPI ] Add OAuth2 token refresh support to security module |
| `UnsafeLabs/Bounty-Hunters` | [#831](https://github.com/UnsafeLabs/Bounty-Hunters/issues/831) | $150 | allowed | no | [ T3 Code ] Add Developer and Git menus to Electron application menu bar |
| `UnsafeLabs/Bounty-Hunters` | [#854](https://github.com/UnsafeLabs/Bounty-Hunters/issues/854) | $140 | allowed | no | [ T3 Code ] Add branch protection status display and force-push prevention |
| `UnsafeLabs/Bounty-Hunters` | [#800](https://github.com/UnsafeLabs/Bounty-Hunters/issues/800) | $130 | allowed | no | [ FastAPI ] Add brute force protection to HTTPBasic authentication |
| `UnsafeLabs/Bounty-Hunters` | [#837](https://github.com/UnsafeLabs/Bounty-Hunters/issues/837) | $130 | allowed | no | [ T3 Code ] Add syntax highlighting, copy button, and collapsible code blocks to ChatMa... |
| `UnsafeLabs/Bounty-Hunters` | [#749](https://github.com/UnsafeLabs/Bounty-Hunters/issues/749) | $120 | allowed | no | [ Laravel ] Add rate limiting middleware to web routes and fix session driver fallback |
| `UnsafeLabs/Bounty-Hunters` | [#818](https://github.com/UnsafeLabs/Bounty-Hunters/issues/818) | $120 | allowed | no | [ T3 Code ] Fix orchestration engine fiber interrupt not checkpointing partial state |
| `UnsafeLabs/Bounty-Hunters` | [#860](https://github.com/UnsafeLabs/Bounty-Hunters/issues/860) | $115 | allowed | no | [ T3 Code ] Implement global search across chat, files, and git history |
| `UnsafeLabs/Bounty-Hunters` | [#792](https://github.com/UnsafeLabs/Bounty-Hunters/issues/792) | $110 | allowed | no | [ Laravel ] Add global query scope, User observer with UUID, and lazy loading prevention |
| `UnsafeLabs/Bounty-Hunters` | [#843](https://github.com/UnsafeLabs/Bounty-Hunters/issues/843) | $110 | allowed | no | [ T3 Code ] Add visual keybinding editor with conflict detection and recording |
| `javelin-anticheat/py-workedtask` | [#4](https://github.com/javelin-anticheat/py-workedtask/issues/4) | $100 | unknown | no | [Feature] Add Integrity Verification (Hash of Executable/Script) |
| `revertinc/revert` | [#372](https://github.com/revertinc/revert/issues/372) | $100 | unknown | no | [REVER-48] Workday Integration |
| `revertinc/revert` | [#551](https://github.com/revertinc/revert/issues/551) | $100 | unknown | no | [REVER-51] Workable Integration |
| `UnsafeLabs/Bounty-Hunters` | [#864](https://github.com/UnsafeLabs/Bounty-Hunters/issues/864) | $100 | allowed | no | [ T3 Code ] Add deep linking support via t3code:// custom protocol |
| `UnsafeLabs/Bounty-Hunters` | [#795](https://github.com/UnsafeLabs/Bounty-Hunters/issues/795) | $95 | allowed | no | [ FastAPI ] Add request-scoped dependency caching to reduce duplicate resolution |
| `UnsafeLabs/Bounty-Hunters` | [#833](https://github.com/UnsafeLabs/Bounty-Hunters/issues/833) | $95 | allowed | no | [ T3 Code ] Add Prometheus metrics endpoint with Effect.Metric integration |
| `UnsafeLabs/Bounty-Hunters` | [#785](https://github.com/UnsafeLabs/Bounty-Hunters/issues/785) | $90 | allowed | no | [ Laravel ] Add database health check endpoint with retry logic |
| `UnsafeLabs/Bounty-Hunters` | [#859](https://github.com/UnsafeLabs/Bounty-Hunters/issues/859) | $90 | allowed | no | [ T3 Code ] Add system tray icon with context menu and status indicator |
| `UnsafeLabs/Bounty-Hunters` | [#823](https://github.com/UnsafeLabs/Bounty-Hunters/issues/823) | $85 | allowed | no | [ T3 Code ] Add rebase conflict detection and resolution to GitManager |
| `UnsafeLabs/Bounty-Hunters` | [#761](https://github.com/UnsafeLabs/Bounty-Hunters/issues/761) | $80 | allowed | no | [ FastAPI ] Add file size and content type validation to UploadFile |
| `UnsafeLabs/Bounty-Hunters` | [#846](https://github.com/UnsafeLabs/Bounty-Hunters/issues/846) | $80 | allowed | no | [ T3 Code ] Add inline commenting on diff lines in DiffPanelShell |
| `UnsafeLabs/Bounty-Hunters` | [#746](https://github.com/UnsafeLabs/Bounty-Hunters/issues/746) | $75 | allowed | no | [ Laravel ] Fix DatabaseSeeder creating duplicate test user on re-run and add proper se... |
| `UnsafeLabs/Bounty-Hunters` | [#842](https://github.com/UnsafeLabs/Bounty-Hunters/issues/842) | $75 | allowed | no | [ T3 Code ] Add update download progress, defer, and skip version to auto-updater |
| `TheSolaAI/sola-application` | [#157](https://github.com/TheSolaAI/sola-application/issues/157) | $70 | unknown | no | Make blinks interaction Handsfree |
| `UnsafeLabs/Bounty-Hunters` | [#764](https://github.com/UnsafeLabs/Bounty-Hunters/issues/764) | $70 | allowed | no | [ FastAPI ] Fix generate_unique_id producing duplicate operation IDs across routers |
| `UnsafeLabs/Bounty-Hunters` | [#830](https://github.com/UnsafeLabs/Bounty-Hunters/issues/830) | $70 | allowed | no | [ T3 Code ] Add fuzzy search with match highlighting to CommandPalette |
| `UnsafeLabs/Bounty-Hunters` | [#799](https://github.com/UnsafeLabs/Bounty-Hunters/issues/799) | $65 | allowed | no | [ FastAPI ] Add StreamingCSVResponse for large dataset exports |
| `UnsafeLabs/Bounty-Hunters` | [#857](https://github.com/UnsafeLabs/Bounty-Hunters/issues/857) | $65 | allowed | no | [ T3 Code ] Add drag-and-drop file moving to sidebar file tree with dnd-kit |
| `lablab-ai/community-content` | [#462](https://github.com/lablab-ai/community-content/issues/462) | $60 | unknown | no | Crafting a Comprehensive Tutorial for Vectara Chat |
| `UnsafeLabs/Bounty-Hunters` | [#755](https://github.com/UnsafeLabs/Bounty-Hunters/issues/755) | $60 | allowed | no | [ Laravel ] Fix .htaccess missing compression rules and add performance optimizations t... |
| `UnsafeLabs/Bounty-Hunters` | [#824](https://github.com/UnsafeLabs/Bounty-Hunters/issues/824) | $60 | allowed | no | [ T3 Code ] Add cross-platform copy/paste keybindings to terminal component |
| `UnsafeLabs/Bounty-Hunters` | [#794](https://github.com/UnsafeLabs/Bounty-Hunters/issues/794) | $55 | allowed | no | [ Laravel ] Fix phpunit.xml coverage config and add route and model test suites |
| `UnsafeLabs/Bounty-Hunters` | [#836](https://github.com/UnsafeLabs/Bounty-Hunters/issues/836) | $55 | allowed | no | [ T3 Code ] Add container, CI, and WSL environment detection to client runtime |
| `arakoodev/EdgeChains` | [#290](https://github.com/arakoodev/EdgeChains/issues/290) | $50 | unknown | no | BOUNTY: integrate AWS Comprehend as a utility to redact data |
| `caley-io/marketing` | [#1](https://github.com/caley-io/marketing/issues/1) | $50 | unknown | no | Multitenancy and Teams/Workspaces support |
| `UnsafeLabs/Bounty-Hunters` | [#745](https://github.com/UnsafeLabs/Bounty-Hunters/issues/745) | $50 | allowed | no | [ Laravel ] Fix User model password cast not applying bcrypt rounds from config |
| `UnsafeLabs/Bounty-Hunters` | [#803](https://github.com/UnsafeLabs/Bounty-Hunters/issues/803) | $50 | allowed | no | [ FastAPI ] Add concurrent task runner with semaphore limiting and timeout |
| `UnsafeLabs/Bounty-Hunters` | [#852](https://github.com/UnsafeLabs/Bounty-Hunters/issues/852) | $50 | allowed | no | [ T3 Code ] Add ARIA attributes and keyboard navigation to ChatView |

## Per repository

| Repository | Labelled open | Claimable | Claimable $ | Archived | Policy | Dropped by |
|---|---:|---:|---:|---|---|---|
| `UnsafeLabs/Bounty-Hunters` | 182 | 85 | $35,475 | no | allowed | amount-under-minimum 97 |
| `SecureBananaLabs/bug-bounty` | 30 | 5 | $3,010 | no | unknown | no-algora-bounty-comment 24, amount-under-minimum 1 |
| `getdozer/dozer` | 4 | 4 | $22,450 | no | unknown | — |
| `gyroflow/gyroflow` | 3 | 3 | $1,200 | no | unknown | — |
| `javelin-anticheat/py-workedtask` | 2 | 2 | $10,100 | no | unknown | — |
| `revertinc/revert` | 2 | 2 | $200 | no | unknown | — |
| `ccgjjnsvatk/fly` | 4 | 1 | $1,000 | no | unknown | no-algora-bounty-comment 2, amount-under-minimum 1 |
| `onyx-dot-app/onyx` | 1 | 1 | $250 | no | unknown | — |
| `BAWES-Universe/workadventure-universe` | 1 | 1 | $150 | no | unknown | — |
| `TheSolaAI/sola-application` | 1 | 1 | $70 | no | unknown | — |
| `lablab-ai/community-content` | 7 | 1 | $60 | no | unknown | rewarded-label 6 |
| `arakoodev/EdgeChains` | 3 | 1 | $50 | no | unknown | amount-under-minimum 2 |
| `caley-io/marketing` | 1 | 1 | $50 | no | unknown | — |
| `ClankerNation/OpenAgents` | 201 | 0 | $0 | no | — | no-algora-bounty-comment 201 |
| `tscircuit/docs-old` | 14 | 0 | $0 | yes | — | rewarded-label 1, archived-repo 13 |
| `192600/fishwww` | 10 | 0 | $0 | no | — | rewarded-label 5, amount-under-minimum 5 |
| `rohitdash08/FinMind` | 7 | 0 | $0 | yes | — | archived-repo 7 |
| `speakers-in-tech/conference-data` | 5 | 0 | $0 | no | — | rewarded-label 2, amount-under-minimum 3 |
| `highlight/highlight` | 4 | 0 | $0 | no | — | rewarded-label 3, amount-under-minimum 1 |
| `zio-archive/zio-jdbc` | 4 | 0 | $0 | yes | — | archived-repo 4 |
| `18605041367/gogo` | 3 | 0 | $0 | no | — | rewarded-label 1, amount-under-minimum 2 |
| `ApexOpsStudio/ai-gitops-test-target` | 3 | 0 | $0 | no | — | no-algora-bounty-comment 3 |
| `daytona/content` | 3 | 0 | $0 | yes | — | rewarded-label 1, archived-repo 2 |
| `kolotikwoan/robot-001` | 3 | 0 | $0 | no | — | amount-under-minimum 3 |
| `organization2025/Project` | 3 | 0 | $0 | no | — | no-algora-bounty-comment 3 |
| `UnsafeLabs/Coolify-Rust-v4` | 3 | 0 | $0 | no | forbidden | policy-forbidden 3 |
| `CaravanaCloud/ubi-java` | 2 | 0 | $0 | yes | — | archived-repo 2 |
| `gerderanvogdsde5587/gggg` | 2 | 0 | $0 | no | — | amount-under-minimum 2 |
| `go-gitea/gitea` | 2 | 0 | $0 | no | forbidden | policy-forbidden 2 |
| `PG-AGI/toingg-jarvis` | 2 | 0 | $0 | no | — | rewarded-label 1, amount-under-minimum 1 |
| `scratchdata/scratchdata` | 2 | 0 | $0 | — | — | rewarded-label 2 |
| `sudhakarbaghel/test` | 2 | 0 | $0 | no | — | no-algora-bounty-comment 2 |
| `WillSmithTE/qdrant-qdrant` | 2 | 0 | $0 | — | — | rewarded-label 2 |
| `18540233512/gggg` | 1 | 0 | $0 | no | — | amount-under-minimum 1 |
| `19224421664/robot` | 1 | 0 | $0 | no | — | amount-under-minimum 1 |
| `Bu1ldTh3Futur3/bounty-hunter-test` | 1 | 0 | $0 | no | — | no-algora-bounty-comment 1 |
| `CaravanaCloud/.github` | 1 | 0 | $0 | yes | — | archived-repo 1 |
| `CaravanaCloud/blink` | 1 | 0 | $0 | yes | — | archived-repo 1 |
| `CaravanaCloud/ecomarkets` | 1 | 0 | $0 | yes | — | archived-repo 1 |
| `CaravanaCloud/pet-feeder` | 1 | 0 | $0 | yes | — | archived-repo 1 |
| `CaravanaCloud/rinha-de-backend-2024-q1-impl` | 1 | 0 | $0 | yes | — | archived-repo 1 |
| `CaravanaCloud/sitting-ducks` | 1 | 0 | $0 | yes | — | archived-repo 1 |
| `Fahad-Dezloper/Crowdify` | 1 | 0 | $0 | no | — | no-algora-bounty-comment 1 |
| `Fahad-Dezloper/ProjectHunt` | 1 | 0 | $0 | no | — | no-algora-bounty-comment 1 |
| `flydelabs/flyde` | 1 | 0 | $0 | no | — | amount-under-minimum 1 |
| `ituoga/php-invproject` | 1 | 0 | $0 | yes | — | archived-repo 1 |
| `mohan-bee/curve` | 1 | 0 | $0 | no | — | amount-under-minimum 1 |
| `outerbase/starbasedb` | 1 | 0 | $0 | — | — | rewarded-label 1 |
| `ProKelly/mychart` | 1 | 0 | $0 | no | — | amount-under-minimum 1 |
| `reorproject/reor` | 1 | 0 | $0 | — | — | rewarded-label 1 |
| `respace-labs/bot-test` | 1 | 0 | $0 | no | — | no-algora-bounty-comment 1 |
| `samdev-ctrl/test2` | 1 | 0 | $0 | no | — | no-algora-bounty-comment 1 |
| `smallcloudai/refact-sublime` | 1 | 0 | $0 | — | — | rewarded-label 1 |
| `tailcallhq/graphql-benchmarks` | 1 | 0 | $0 | yes | — | archived-repo 1 |
| `tine1117/oss-hunter-livefire` | 1 | 0 | $0 | no | — | no-algora-bounty-comment 1 |
| `tryabby/abby` | 1 | 0 | $0 | no | — | amount-under-minimum 1 |
| `tscircuit/autorouting` | 1 | 0 | $0 | yes | — | archived-repo 1 |
| `tscircuit/file-server` | 1 | 0 | $0 | — | — | rewarded-label 1 |
| `tscircuit/jlcsearch` | 1 | 0 | $0 | no | — | amount-under-minimum 1 |
| `tscircuit/pcb-viewer` | 1 | 0 | $0 | no | — | amount-under-minimum 1 |
| `tscircuit/template-api-fake` | 1 | 0 | $0 | — | — | rewarded-label 1 |
| `UnsafeLabs/RFC-5322` | 1 | 0 | $0 | no | — | no-algora-bounty-comment 1 |
| `xeymxmkf/aaa` | 1 | 0 | $0 | no | — | amount-under-minimum 1 |
| `ylc8037/ylc8037` | 1 | 0 | $0 | no | — | amount-under-minimum 1 |
| `zbdpay/zbd-node` | 1 | 0 | $0 | — | — | rewarded-label 1 |
| `zio-archive/zio-nio` | 1 | 0 | $0 | — | — | rewarded-label 1 |

## Method

- Source: GitHub search `is:issue is:open label:"💎 Bounty"`, sorted by creation date and paged 100 at a time (split by creation date when a query exceeds GitHub's 1,000-result cap), then the GitHub REST API for repositories, issue comments and policy files. No request goes to Algora's own site: its terms forbid automated access (research/rendered/algora-terms.txt:258-260).
- Scope: labelled supply only. Algora adds the label only through its GitHub App installation (notify_bounty.ex); a bounty on a repository without the App gets a comment and no label, and is not counted here (the SWEEP-2.md github-native confound). The label count is a ceiling on labelled supply; this is the claimable part of it.
- Amount: read from the algora-pbc[bot] bounty comment by parseAlgoraBotComment (intake.ts); ≥ $50 counts, inclusive.
- Payout: an algora-pbc[bot] comment saying the bounty "has been awarded" (notify_transfer.ex), or the 💰 Rewarded label the same job adds. Merge: the bot's "has been merged. The bounty can be rewarded" comment does not drop an issue (it is not on the board's list); it is reported as the stricter number beside the count.
- Policy: assessRepoPolicy over CONTRIBUTING, CODE_OF_CONDUCT, the pull-request template and the README, located in .github/, the root and docs/ in GitHub's own precedence, plus the issue body. Read only for repositories with a bounty that passed every cheaper filter. `unknown` is counted.
- Failure: any API error, an exhausted rate-limit budget, or a search that returns fewer issues than it reports (past the one exception below) writes nothing and fails the job — an unmeasured week is a missing reading, never a zero.
- Search gaps: GitHub's reported total can include index entries it never shows (hidden, deleted or transferred issues, unavailable repositories). A query that falls short is read a second full time. Only if both passes serve the identical issues, and the gap to the larger reported total is at most max(5, 1% of that total) per query and over the whole search, is the run accepted, with the gap recorded as `searchUnserved` beside the count, never in it. Passes that differ fail the run as above, even when the second pass is complete on its own (an issue that left the results between page fetches): the short first pass is not overruled by a pass that disagrees with it. A larger gap fails the run too.
- This run: authenticated (GITHUB_TOKEN), 12 search and 645 REST requests, 0s spent waiting on rate limits; search reported 554 and served 551 (3 unserved).
