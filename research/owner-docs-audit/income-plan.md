# Owner-docs claim audit — `docs/INCOME_PLAN.he.md`

**Audited:** 2026-09-25, against HEAD `245a19e` (branch `claude/new-session-j071dx`) and `origin/main` as fetched.
**Method:** every checkable claim, line by line, against the repo only: code read, `grep`, file listings, a read-only
`better-sqlite3` query of `state/colony/colony.db` (`readonly: true`), `git log` (read-only), and two targeted test
runs (`npx vitest run` on six revenue test files → 92 passed; `vitest run` inside `products/pcn874` → 311 passed; the
cache directory that run created in `products/pcn874/node_modules/.vite` was removed afterwards). No web access, nothing
published, nothing committed. The document was not edited.
**Clone is shallow** (`git rev-parse --is-shallow-repository` → `true`); only 5 commits touch the document, the last
`6db122b` on 2026-09-07. It is 18 days behind HEAD.

## The fact that changes most of this document

**PR #2 was merged by the owner on 2026-09-22.** `git log origin/main --format='%h %ad %an %s'` →
`31cda66 2026-09-22 21:39:15 +0300 Nimrod zarfati Merge pull request #2 — the revenue colony, six products, the criteria
sweep and the board's decision`. `.github/workflows/colony.yml` is on `origin/main` (`git show
origin/main:.github/workflows/colony.yml` succeeds) and `colony-bot` has committed 16 ticks since
(`2026-09-22 18:40:14 +0000` … `2026-09-25 13:44:58 +0000`, all reporting `30d ₪0.00`). `logs/CHECKPOINT.md` (22.9,
18:20 UTC) still says "PR #2 פתוח, לא מוזג" — written 19 minutes before the merge. Owner step 1 is done; the document
(§6 row 1) still asks for it.

## Claim ledger — one line per claim

Status key: C = CORRECT, W = WRONG, S = STALE, U = UNSUPPORTED. Line numbers are the document's.

| L | Claim (abridged) | St | Evidence |
|---|---|---|---|
| 3 | "עדכון אחרון: 2026-09-02" | S | body has 3.9/4.9/7.9 updates; last commit `6db122b` 2026-09-07 |
| 7 | `src/revenue/` has board, director per line, supervisor, auditor, chief auditor | C | `src/revenue/org.ts`, `heartbeat.ts:4-7`, `runAudit` chief audit `CHIEF_AUDIT_INTERVAL_MS = 30 * DAY_MS` |
| 7 | ledger is the single source of truth for money | C | `ledger.ts:462` "live is defined by money" |
| 7 | kill/scale rules are code | C | `src/revenue/rules.ts` |
| 7 | intervals: sync hourly, supervisor 6h, board daily, audit weekly | C | `heartbeat.ts:54-57` |
| 7 | "הלופ רץ מה-heartbeat" (the loop runs from the heartbeat) | U | what runs is `colony.yml` → `scripts/colony.ts tick --no-feed` (`colony.yml:67`), governance only: "Director and worker EXECUTION still needs the automaton runtime" (`colony.yml:7-9`); the heartbeat needs `--run` + a Conway key (`src/index.ts:199-202`) |
| 8 | 9 lines (2 core, 2 growth, 5 experiments), cumulative target ₪25,000/month | W | `portfolio.ts:34-203`: 4 lines (3 core, 1 growth), sum ₪1,500; the old nine summed to ₪16,500 (`CRITIC-synthesis.md:195-197`, doc L43-44); colony.db tiers of the old nine: 2 core / 3 growth / 4 experimental; ₪25,000 appears in no repo source |
| 9 | Gumroad median ≈$72/month, 44% of products earn 0 | C | `scouts/storefronts--gumroad.md:135-136` (snippet grade) |
| 9 | scenario: months 4–6 ₪1,000–8,000; months 9–12 ₪5,000–20,000; stack of 4–6 lines | W | every audit: ₪0 month one; chief audit ₪2,200/month at 12 months (`CHIEF-AUDIT.md:123`); board committed ₪1,500 (`portfolio.ts:16-25`) |
| 9 | ₪50,000 needs a breakthrough (Actors category or popular plugin) | W | plugin line killed, WordPress ₪0–200 (`portfolio.ts:453`, `CHIEF-AUDIT.md:136`); Apify target ₪200 |
| 10 | owner list ≈2–3 hours | C | `owner-steps.ts` minutes sum 132–172 |
| 10 | "ואחריה הכל אוטומטי" (after it everything is automatic) | W | doc L311-312 + `OWNER_STEPS.he.md:271` (later KYC steps); `owner-steps.ts:106,132` (עוסק מורשה switch, domain renewal are owner decisions); `colony.yml:7-9` (no execution runtime) |
| 17-25 | seven group rows (supervisor → audited) | C | `CRITIC-synthesis.md:153-160` |
| 26 | total 34,300 → 4,850–5,850 | W | the column as printed sums to 136,800; source: "**136,800** (34,300 excluding the phantom rails column)" `CRITIC-synthesis.md:161` |
| 28 | after dedup ₪4,650–5,650 | C | `CRITIC-synthesis.md:163` |
| 28-29 | ₪200 and ₪0–250 are the same Apify account | C | `CRITIC-synthesis.md:163-166` |
| 31 | "אין קובץ state/, אין בסיס נתונים של לדג'ר" | S | `state/colony/{colony.db,REPORT.md,dashboard.html}` tracked; 16 colony-bot ticks since 22.9 |
| 31-32 | no ledger row ever written; earned ₪0 | C | `SELECT count(*) FROM revenue_ledger` → 0 |
| 34 | ₪4,650–5,650 = 23–28% of target | C | arithmetic |
| 35 | 7× haircut "עקבי בכל קבוצה ובכל מבקר" | U | per-group ratios in the same table: 3× (agent-markets) to 16× (israel-bureaucracy low end), ∞ for two |
| 36 | "שש הקבוצות שנותרו" still to sweep | S | all 15 swept: `REJECTED.md:1021` "the fifteenth and last group"; `CHIEF-AUDIT.md:1` |
| 43-44 | nine targets summed to ₪16,500; 82.5% | C | colony.db killed lines + survivors' former targets; `growth.ts:340-344` |
| 45-46 | a check says the fix is to add a line with evidence | C | `growth.ts:397`; `growth.test.ts:206-211` |
| 48-50 | 9→4 lines, ₪16,500→₪1,500, +₪700 conditional, 7.5% | C | `portfolio.ts:16-25, 350-371, 570-578` |
| 51 | BOARD.md and REJECTED "Board decision, 7.9.2026" | C | `REJECTED.md:1114` |
| 53 | SERP file, six queries, all SNIPPET | C | `research/measurements/serp/2026-09-07-hebrew-calculators.md:1-40` |
| 54 | both calculator SERPs "מוחזקות כולן" by small independent tool sites | W | net-salary top-3 = newspaper, tax-refund service, Malam Payroll; independents at #4,#7,#8 (`…hebrew-calculators.md:332`, analysis ~L150-160) |
| 55-56 | eight free VAT calculators, two on matching domains | C | same file L201-213 |
| 56-57 | four money queries return zero tools; Kol Zchut, Green Invoice, iCount, YPAY | C | same file L330-336 |
| 57 | "שמונה משרדי רו״ח" | W | "six CPA practices … and two law firms" (same file L303-305) |
| 57-58 | PCN874: nine results, no tool, six are software vendors | C | same file L245-248 |
| 59-61 | two constraint-7 verdicts; build #4 as measurement, build #3 validator first | C | same file L372-404 |
| 61 | "ושער המפרט עדיין מעליו" | S | spec rendered and reconciled the same day (doc L121-128; `products/pcn874/docs/SPEC.md`) |
| 67-69 | Apify free publish, 30-day stranger count, KYC for pricing, $20 minimum, first ledger row ~month 9 | C | `portfolio.ts:48-52, 89-96, 280` |
| 70-73 | Algora: acquisition runs backwards; `connect_countries.ex` lists Israel; 2–5 days after PR | C | `portfolio.ts:155-162, 307`; `CHIEF-AUDIT.md` §4A.3 |
| 72-73 | "הראיה היחידה ברמת קוד לזכאות ישראלית בכל הסריקה" | U | Gumroad's own production source `_13-getting-paid.html.erb` (`Israel | ILS`) is called the strongest payability evidence of the sweep (`rails.ts:340`); Freemius payout to Israel rendered (`rails.ts:352`) |
| 74 | onboarding "בלי שיחה, בלי מצלמה, בלי הוצאה" | U | no Stripe Connect Express requirement page in the repo; `CHIEF-AUDIT.md` §4A.3 says only "identity document, address, Israeli bank account. Self-serve."; `stripe.com` EGRESS_BLOCKED (`REJECTED.md:1341-1343`) |
| 78-87 | Stripe: scouts' conflicting sources; Algora `account_type/1` → Express; check stripe.com/global | C | `REJECTED.md:1323-1347`; scouts exist |
| 88 | list previously rejected on the Stripe ground | C | `logs/2026-09-02-monthly-income-plan.md:74,77,83,84`; `REJECTED.md:1347` |
| 90 | Paddle scout UNKNOWN-leaning-YES, medium confidence; risk-governance quote | C | `scouts/storefronts--paddle.md:19,154`; `audits/risk-governance.md:328` |
| 90 | "אחת מארבע הבדיקות של שלושים השניות למטה" | W | no such checks anywhere in the document (`grep -n "שלושים\|שניות"` → only L90) |
| 91 | Lemon Squeezy acquired by Stripe July 2024 | C | `audits/payment-rails.md:433-436` (third-party source) |
| 92 | PayPal Israel 18% VAT on fees since 6.7.2026 | C | `rails.ts:350`; `audits/store-promotion.md:247-249` (snippet) |
| 93 | Payoneer YES → UNKNOWN | C | `audits/payment-rails.md:216` |
| 94 | Freemius pays in ILS without conversion fee; snippet only; see task #21 | S | task #21 closed: "pays in ILS" REFUTED; payout to Israel RENDERED; USD balance, ILS only via Wise/wire (`rails.ts:352`, `REJECTED.md:1265`, `CHECKPOINT.md:104`) |
| 95 | crypto (USDC/x402, TON) — "בלי KYC" | W | `audits/israel-bureaucracy.md:482-484` (x402 "no KYC" contradicted by Apify terms; crypto→ILS VASP KYC); `OWNER_STEPS.he.md:271` |
| 96 | "רק x402/USDC ו-Telegram Stars עובדים בלי שום KYC" | W | `portfolio.ts:441` Fragment payout KYC = ID plus SELFIE; `BOARD.md:106,311` |
| 97 | "YouTube מסיר ערוצי AI תבניתיים" | U | rendered policy: template channels "are not allowed to monetize" (`research/rendered/youtube-monetization-policies.txt:130,156`); `REJECTED.md:1316` "penalised and demonetised" |
| 98 | עוסק פטור ceiling ₪122,833 for 2026; target crosses it within a year | C | `CHIEF-AUDIT.md` §4A.1; SERP summary L136 (snippet) |
| 99 | "הקוד תומך גם ב-OpenAI/Anthropic/Ollama ישירות, אז הלופ לא תלוי ב-Conway" | W | `src/index.ts:199-202` exits with "No API key found. Run: automaton --provision" when no Conway key; only `scripts/colony.ts` is Conway-free (`colony.yml:7`) |
| 103 | israel-bureaucracy "התקרה הכנה … ₪4,000–7,000" | W | audit: "the sum of six unanchored numbers"; corrected ₪500–1,500 (`audits/israel-bureaucracy.md:58-62`) |
| 103 | PCN874 build ~₪2,500 (supervisor) | C | same audit L110 |
| 105 | ₪20,000 needs "קבוצות שעדיין לא נסרקו" | S | none remain (`REJECTED.md:1021`) |
| 107 | two structural walls in REJECTED | C | `REJECTED.md:142` |
| 109 | 28 h, ₪2,500 → ₪300–600, ₪0 month one | C | `audits/israel-bureaucracy.md:110,140` |
| 111 | ₪500,000 cohort from 1.1.2026, confirmed twice | C | same audit L113-118 (two CPA circulars, snippet) |
| 115 | `validatePcn874()` invented; exports `EntryType`, `pcnGenerator` | C | same audit L128-135 |
| 116 | frozen Feb 2024, 0.4.1, 4 stars, 35 issues, no allocation field | C | same audit L124-126, 138-140 |
| 117 | ₪5,000 aggregation, 77777772, deferral to 1.1.2027, ladder to ₪5,000 on 1.6.2026 | C | same audit L146-158 |
| 121-122 | 2009 circular fetched via CI; `products/pcn874/docs/SPEC.md` | C | file exists; `pcn874-spec-watch.yml:15-17` |
| 122-124 | Fable audit: 13 resolutions confirmed; five error rules not backed; misclassified both ways | C | `audits/pcn874-reconciliation.md:17-35` |
| 124 | fixed, 199 tests | C | `git log --merges`: `c23d3b2 … 199 tests` |
| 127-128 | "`pcn874-spec-watch.yml` מגבב את שלושת המקורות כל שבוע" (the remaining gate) | U | lock is empty (`products/pcn874/docs/SPEC-SOURCES.lock.json` → `"sources": {}`), job has `contents: read` and never commits; `spec-watch.mjs:124-126` treats a missing entry as "new" and exits 0 — it cannot detect a new edition |
| 128 | code never says "valid for the Authority"; points to the simulator | C | `products/pcn874/src/cli.ts:82,159` |
| 130-131 | seven header totals confirmed vs `ita:107-124`; 26 CSVs | C | `audits/pcn874-generator.md:3,7` |
| 131-133 | three silent files = missing-cells row, `"1800,00"`, Hebrew refGroup 62 bytes | W | the three were: extra-cells row (unquoted thousands separator), missing-cells row, `"1800,00"`; Hebrew refGroup was "warned but under-described" (`audits/pcn874-generator.md:8`) |
| 133-134 | all passed self-validation; refusal leaked via `validation.parsed` | C | same audit L9, L89 |
| 135 | fixed and merged, 311 tests | C | run: `Tests 311 passed (311)`; merge `f6a153f` |
| 137 | remaining steps are owner steps "3 ו-4ב" | S | `pcn874` is unlocked by steps 3 and 7 (`owner-steps.ts:116,142`; `portfolio.ts:197-200`); 4ב is a retired numbering (`CHECKPOINT.md:228`) |
| 141 | store-promotion swept 8/8 | C | 8 `scouts/store-promotion--*.md` |
| 142-145 | ₪15,500 → ₪3,000; 78%; ₪0 month one | C | `audits/store-promotion.md:23,426` |
| 147-150 | ~40% of AI citations from community participation | C | `REJECTED.md:242`; scout AEO L62 (snippet) |
| 151 | Apify playbook, 27-step checklist | C | `groups/store-promotion.md:24` |
| 154-157 | "שש המגבלות" in `constraints.ts` with a test | S | `PROMOTION_CONSTRAINTS` holds seven (adds `no-offsite-funnel-from-a-marketplace-listing`, `constraints.ts:140`); file header still says six |
| 159-160 | Google names it in four spam policies; doorway abuse | C | `constraints.ts:48-49` |
| 161-163 | 878 stores; the sixth constraint in MISSION | C | `MISSION.md:87,155` |
| 169 | Apify ₪4,000 → ₪1,500; $1.4M/~3,000 ≈ $470 ≈ ₪1,730 | C/U | arithmetic and audit C (`audits/store-promotion.md:63-65`); "$1.4M" stated as fact is an "unverified marketing mean … not in Apify's own documentation" (`portfolio.ts:280`) |
| 170 | AI visibility ₪4,000 → ₪0–500; Semrush 3/day; AI Rank Lab 25 prompts | C | `audits/store-promotion.md:131,140-146,420` |
| 171 | WordPress ₪4,000 → ₪1,000; Guideline 5; queue 4,715 / 3,854 | S | true of the 3.9 audit; superseded: "₪0–200 … The ₪1,000 was the earlier audit" (`CHIEF-AUDIT.md:136`); line killed (`portfolio.ts:447-457`) |
| 172 | RapidAPI ₪1,500 → ₪500; 25% from 15.11.2025; PayPal only; ~60 days | S | facts C (`audits/store-promotion.md:240-260`); ceiling superseded: "₪0 forecast" (`CHIEF-AUDIT.md:139`) |
| 173 | Amazon $39.99/month vs ₪200; video call | C | `audits/store-promotion.md:286-292` |
| 175-177 | cross-promotion quote | C | `scouts/store-promotion--cross-promotion.md:205` |
| 181 | `products/apify-il-open-data` | C | exists |
| 184 | 19 rejections in REJECTED | C | `REJECTED.md:233` |
| 191-195 | no surviving line's main cost is inference; ₪5/store upkeep in `growth.ts` | C | `CRITIC-synthesis.md:242-255`; `growth.ts:62` |
| 200-201 | seven groups, ~40 findings, no line killed by cost | C | `CRITIC-synthesis.md:257-259` |
| 205-206 | "העלות היחידה שלנו שגדלה עם התנועה היא טוקנים" | W | `CRITIC-synthesis.md:244-248` (Apify platform usage — compute/proxy; RapidAPI hosting); doc L191-193 says the same |
| 206-207 | scout found three free tiers without company/application/KYC | C | `scouts/bounties-grants--ai-credits-programs.md:246-251` |
| 211-212 | Cerebras 1M tokens/day; Workers AI 10,000 neurons/day | C | same scout L248-249; audit L378 |
| 212 | "המוצרים שלנו כבר יושבים על תשתית בצורת Cloudflare" | U | `il-biz-tools/netlify.toml` (Netlify), Apify, x402 "any Node host" (`products/x402-il-api/README.md:67`); no product on Cloudflare |
| 213 | OpenAI data-sharing = "ההקצאה הגדולה מהשלוש" | U | tiers 1–2 = 250,000 tokens/day, below Cerebras's 1M (scout L210-212) |
| 215-218 | OpenAI data sharing rejected as AMBER on buyer data | C | scout L251-256 |
| 220-222 | wire free tiers into `apify-il-open-data` "ובבוט הטלגרם"; <40 h | S | Telegram bot PARKED (`products/README.md`, `portfolio.ts:444`); <40 h C (scout L281) |
| 224-227 | Mistral Ambassador expired; Cloudflare $250k, R2 $10k, card required | C | scout L216-219, L261-266 |
| 231-233 | deleted table promised ₪8,160–72,600; every audit ₪0 month one | C | `CRITIC-synthesis.md` (grep hit); `CHIEF-AUDIT.md:123` |
| 236-249 | "אותם תשעה קווים", ranked table | S | 6 of the 9 killed 7.9 (`portfolio.ts:396-470`); `pcn874` (largest target, ₪600) absent from the table |
| 241 | bounties = part of the group's ₪800 | S | target ₪300 (`portfolio.ts:163`) |
| 246 | Telegram "חסום על שאלה אחת: האם משיכת Fragment פתוחה" | W | killed on a mandate collision — Fragment KYC is ID + selfie (`portfolio.ts:441`) |
| 248 | x402: 302,072 calls, $0.01 median, 1,772 providers ≈ ₪6/provider; 200× | C | `scouts/store-promotion--machine-discovery.md:49-53` |
| 251 | audited sum ₪4,650–5,650 | S | chief audit ₪2,200 (`CHIEF-AUDIT.md:123`); board ₪1,500 committed |
| 259 | TikTok rejected 3.9.2026, programmes listed | C | `REJECTED.md:24-67` |
| 262 | earlier rejections list | C | `REJECTED.md:1310-1321` |
| 262 | "ערוצי YouTube תבניתיים — נענשים ומוסרים" | U | `REJECTED.md:1316` "demonetised"; rendered policy L130,156 |
| 262 | Medium / Substack / beehiiv rejected on Stripe | U | `REJECTED.md:1347` "provisional, not closed"; doc L87 itself |
| 266-273 | chain of command, cadences | C | `heartbeat.ts:4-7,54-60` |
| 275 | loop task names | C | `heartbeat.ts:527-608`; `src/heartbeat/config.ts:60-80` |
| 276 | rules: <₪500/30d after 45 days → kill; cost >2× → pivot then kill; target + 50% margin → scale; collapse or 21 quiet days → escalate; max 3 experiments; tier × performance, 0 if killed | C | `types.ts:212-222`; `rules.ts:77-130, 150-200` (see note below) |
| 277 | live only when real money lands | C | `ledger.ts:462-466` |
| 278 | one goal at a time; queue in KV | C | `goal-queue.ts:1-37` |
| 279 | human steps are `awaiting_setup` | C | `rules.ts` escalate on `awaiting_human_setup`; REPORT.md |
| 281 | `docs/CHAIN_OF_COMMAND.md` | C | exists |
| 285 | checklist moved to OWNER_STEPS | C | exists |
| 290-291 | chief audit found six identity items; the list had eleven | C | `CHIEF-AUDIT.md:239-265`; `owner-steps.ts:12-13` |
| 293-295 | seven steps; order 1→2→3→5→7→4→6; Apify half after step 1 | C | `owner-steps.ts:29-36, 168-173` |
| 299 | step 1: "למזג את PR #2" (pending) | S | merged `31cda66` 2026-09-22 |
| 300-305 | steps 2–7 minutes and unlocks | C | `owner-steps.ts:95-175` |
| 307-309 | not on the list: accountant, Paddle (three risks in rails.ts), GSC | C | `rails.ts:140-144` |
| 311-312 | later-only: Apify KYC, PayPal, Stars/USDC | C | `OWNER_STEPS.he.md:262-271` |
| 314-315 | code + test forbidding an eighth step, every live line unlocked | C | `owner-steps.test.ts:24,76`; test run passed |
| 321 | `pnpm install && pnpm build` | C | `package.json:41` |
| 322 | `scripts/install-skills.sh` copies playbooks to `~/.automaton/skills` | C | script L6-15 |
| 323 | `node dist/index.js --run` → loop starts, first board seeds portfolio | W | `src/index.ts:189-202` (setup wizard, then exit without Conway key); the loop that runs is `scripts/colony.ts tick` (`colony.yml:67`, `CHECKPOINT.md:696`) |
| 326 | env keys `LEMONSQUEEZY_API_KEY`, `GUMROAD_ACCESS_TOKEN`, `STRIPE_SECRET_KEY`; x402 local with no key | C | `src/revenue/connectors/*.ts:4,14`; `colony.yml:60-63` |
| 330 | x402 line "מקבל מוצר אמיתי ראשון"; USDC funds compute; "תוספת ולא הליבה" | S | paid-apis and agent-services killed 7.9; x402-il-api is a "RAIL ON STANDBY rather than a line" (`portfolio.ts:420-421`) |
| 330 | x402 line "אינו דורש שום חשבון אנושי" | W | `audits/israel-bureaucracy.md:482-484` |
| 332-336 | products built: three listed | S | six in `products/` (adds `pcn874`, `mcp-il-tools`, `telegram-il-tools-bot`; `products/README.md` table) |
| 334 | apify-il-open-data ready for `apify push` after account | S | publishes from CI (`.github/workflows/apify-publish.yml`, push to main + dispatch) with `APIFY_TOKEN` |
| 335 | il-biz-tools Pro "דרך Paddle כשיהיה חשבון" | W | Paddle removed; `src/lib/gumroad.js`, `site.json:5-7` gumroad block; `products/README.md` "moved from Paddle to Gumroad" |
| 336 | x402-il-api "רץ במצב חינמי" | U | no deployment recorded; README L67 "Deploy on any Node host"; standby only while ₪0/month |
| 341 | research = 4 scouts; adversarial stage failed | S | 15-group sweep + audits + chief audit + board (`CHIEF-AUDIT.md:1`, `BOARD.md`) |
| 351 | `logs/2026-09-02-monthly-income-plan.md` | C | exists |

**Claims checked: 118** (rows above, several rows carrying more than one claim). Non-CORRECT: 44.

## Findings in detail (every non-CORRECT claim, most expensive first)

### F1 — L299 — STALE — HIGH
**Claim:** `| 1 | למזג את PR #2 | 2 | הסכמה, לא זהות: מעביר את הלולאה ל-main. …`
**Evidence:** `git log origin/main --format='%h %ad %an %s' --date=iso` →
`31cda66 2026-09-22 21:39:15 +0300 Nimrod zarfati Merge pull request #2 — the revenue colony, six products, the
criteria sweep and the board's decision`. `git show origin/main:.github/workflows/colony.yml` returns the file; 16
`colony-bot` "colony tick" commits since `2026-09-22 18:40:14 +0000`. The owner did step 1 three days ago; the
document still lists it as the first thing to do, and therefore does not tell him that the Apify half of step 6
("אפשר לעשות מיד אחרי צעד 1", L294-295) is available now.
**Fix:** `| 1 | למזג את PR #2 | ✅ בוצע 22.9.2026 (\`31cda66\`) | הלולאה על main ורצה. הצעד הבא: 2; חצי ה-Apify של צעד 6 פתוח כבר עכשיו |`
(`src/revenue/owner-steps.ts` and `docs/OWNER_STEPS.he.md` carry the same stale state — out of this audit's scope.)

### F2 — L236-249 — STALE — HIGH
**Claim:** `מה שבא במקומה: אותם תשעה קווים, מדורגים לפי **מה שנשאר אחרי שהמבקר עבר**` and the nine-row table.
**Evidence:** `DEFAULT_PORTFOLIO` holds four lines — `apify-actors` ₪200, `il-biz-tools` ₪400, `oss-bounties` ₪300,
`pcn874` ₪600 (`portfolio.ts:34-203`); `KILLED_LINES` holds six killed 2026-09-07 — templates, paid-apis,
agent-services, telegram-bots, dev-extensions, hebrew-content (`portfolio.ts:396-470`; colony.db status `killed`).
Rows 4–9 of the "ranked plan" are killed lines; `pcn874`, the largest committed target, is not in the table at all.
Row 1 says "חלק מ-₪800" — the target is ₪300 (`portfolio.ts:163`). Row 6 gives a wrong reason (see F14).
**Fix:** replace with the board's four: `| 1 | Bounties (Algora) | ₪300 | inferred, קוד | … | 2 | PCN874 | ₪600 (טווח ₪300–600) | inferred | … | 3 | Apify Actors | ₪200 (גבול עליון שנוי במחלוקת ₪1,500) | inferred | … | 4 | il-biz-tools | ₪400 | contradicted | …` — sum ₪1,500 committed + ₪700 conditional (`CONDITIONAL_TARGETS`); the six killed lines move to §4 with a pointer to `docs/REJECTED.md` "Board decision, 7.9.2026".

### F3 — L9 — WRONG — HIGH
**Claim:** `תרחיש סביר: חודשים 1–3 כמעט אפס; חודשים 4–6 ₪1,000–8,000; חודשים 9–12 ₪5,000–20,000 אם 2–3 קווים תופסים.`
**Evidence:** every audit returns ₪0 in month one on every line; the whole-sweep audited ceiling is "₪2,200/month at 12
months (₪3,500 if Apify's contested ₪1,500 held). Month one: ₪0 on every line" (`CHIEF-AUDIT.md:123`); the board
committed ₪1,500 (`portfolio.ts:16-25`); Apify's first ledger entry is ~month 9 (`portfolio.ts:280`); il-biz-tools
₪0 through month 12 (`portfolio.ts:292`). The executive summary promises up to 13× what the repo's own audited
evidence supports. The ₪50,000 "breakthrough" paths named (Actors category, popular plugin) are a ₪200 target and a
killed line (`portfolio.ts:453`).
**Fix:** `התרחיש המבוקר: ₪0 בחודש הראשון בכל קו; תקרה מבוקרת כ-₪2,200 לחודש אחרי 12 חודשים (₪3,500 אם הגבול השנוי במחלוקת של Apify יחזיק); הדירקטוריון התחייב ל-₪1,500. אף קונה לא נמדד. ₪20,000 אינו נתמך בשום ראיה.`

### F4 — L8 — WRONG — MEDIUM
**Claim:** `9 קווים (2 ליבה, 2 צמיחה, 5 ניסויים), יעד מצטבר ₪25,000/חודש`
**Evidence:** today 4 lines, 3 core + 1 growth, ₪1,500 (`portfolio.ts:34-203`, REPORT.md "Line targets, summed ₪1,500").
The original nine summed to ₪16,500, not ₪25,000 (`CRITIC-synthesis.md:195-197`; the document's own L43-44); the
colony.db tiers of the original nine were 2 core / 3 growth / 4 experimental. `₪25,000` has no source anywhere in the repo.
**Fix:** `**תיק ההכנסות**: 4 קווים (3 ליבה, 1 צמיחה) אחרי פסק הדירקטוריון 7.9.2026, יעד מצטבר ₪1,500/חודש + ₪700 מותנים. התיק המקורי (9 קווים) הסתכם ב-₪16,500.`

### F5 — L251 — STALE — MEDIUM
**Claim:** `**הסכום המבוקר, אחרי ניכוי כפילויות: ₪4,650–5,650 לחודש בבגרות.**`
**Evidence:** that was the seven-group figure of 4.9. The chief audit over all 15 groups: ₪2,200 (`CHIEF-AUDIT.md:123`);
the board committed ₪1,500 (`portfolio.ts:16`). `docs/OWNER_STEPS.he.md` tells the owner ₪2,200; this section tells him
₪4,650–5,650.
**Fix:** `**הסכום המבוקר של כל 15 הקבוצות: כ-₪2,200 לחודש בבגרות (ביקורת ראשית); הדירקטוריון התחייב ל-₪1,500.** (₪4,650–5,650 היה הסכום אחרי שבע קבוצות, 4.9.)`

### F6 — L10 — WRONG — MEDIUM
**Claim:** `הרשימה המינימלית בסעיף 6 — כ-2–3 שעות עבודה סה"כ, ואחריה הכל אוטומטי.`
**Evidence:** the same document (L311-312) and `OWNER_STEPS.he.md:262-271` list owner steps that come later (Apify KYC,
PayPal, Stars/USDC identity checks); `owner-steps.ts:106,132` make the עוסק מורשה switch and every domain renewal the
owner's decision; `colony.yml:7-9`: "Director and worker EXECUTION still needs the automaton runtime" — governance
runs, execution does not.
**Fix:** `…כ-2–3 שעות עבודה סה"כ. אחריה: הממשל רץ לבד (דוח ב-\`state/colony/\`); צעדי זהות נוספים רק אם קו מתחיל להרוויח (סוף \`docs/OWNER_STEPS.he.md\`), וחידוש הדומיין הוא החלטה שלך בכל שנה.`

### F7 — L31 — STALE — MEDIUM
**Claim:** `**והיום זה ₪0.** אין קובץ \`state/\`, אין בסיס נתונים של לדג'ר, ומעולם לא נכתבה אליו שורה.`
**Evidence:** `git ls-files state` → `state/colony/{REPORT.md,colony.db,dashboard.html}`; 16 colony-bot ticks since
2026-09-22. `SELECT count(*) FROM revenue_ledger` → 0. The ₪0 conclusion stands; the reason given is obsolete.
**Fix:** `**והיום זה ₪0.** הלדג'ר קיים (\`state/colony/colony.db\`) והלולאה רצה על main מאז 22.9.2026, אבל לא נכתבה אליו אף שורה.`

### F8 — L7 — UNSUPPORTED — MEDIUM
**Claim:** `הלופ רץ מה-heartbeat: סנכרון כסף כל שעה, ביקורת מפקח כל 6 שעות, ישיבת דירקטוריון יומית, ביקורת שבועית.`
**Evidence:** the intervals are right (`heartbeat.ts:54-57`). But nothing runs the Automaton heartbeat: that needs
`node dist/index.js --run` with a Conway key (`src/index.ts:199-202`). What actually runs is `colony.yml` →
`pnpm exec tsx scripts/colony.ts tick --no-feed` (`colony.yml:67`), governance only, goals never fed ("No orchestrator
runs here… Governance runs; execution waits", `colony.yml:64-66`). Its commits land every ~3–6 hours, not hourly
(16 commits 22.9 18:40 → 25.9 13:44; the commit step fires on every run because REPORT.md is re-stamped).
**Fix:** `מחזור הממשל רץ מ-GitHub Actions (\`colony.yml\` → \`scripts/colony.ts tick\`) על main מאז 22.9.2026: סנכרון כסף, ביקורת מפקח, דירקטוריון, ביקורת — כל אחד לפי המרווח שלו. ביצוע (דירקטורים ועובדים) עדיין לא רץ: הוא דורש את ה-runtime של האוטומטון.`

### F9 — L99 — WRONG — MEDIUM
**Claim:** `הקוד תומך גם ב-OpenAI/Anthropic/Ollama ישירות, אז הלופ לא תלוי ב-Conway.`
**Evidence:** inference routing supports other providers (`src/inference/registry.ts`, `src/ollama/`), but `run()`
exits when no Conway key exists: `const apiKey = config.conwayApiKey || loadApiKeyFromConfig(); if (!apiKey) {
logger.error("No API key found. Run: automaton --provision"); process.exit(1); }` (`src/index.ts:199-202`). Only the
governance tick is Conway-free (`colony.yml:7`).
**Fix:** `מחזור הממשל (\`scripts/colony.ts\`) לא תלוי ב-Conway. ה-runtime המלא (\`--run\`) כן: הוא יוצא בלי מפתח Conway (\`src/index.ts:199-202\`).`

### F10 — L323 — WRONG — MEDIUM
**Claim:** `node dist/index.js --run             # הלופ מתחיל; ישיבת הדירקטוריון הראשונה זורעת את התיק`
**Evidence:** `src/index.ts:189-202` — first run launches an interactive setup wizard, then exits without a Conway API
key. The loop that runs is `pnpm exec tsx scripts/colony.ts tick` (`colony.yml:67`; `CHECKPOINT.md:696`), which §7
never mentions.
**Fix:** replace with `pnpm exec tsx scripts/colony.ts tick   # מחזור ממשל אחד מקובץ SQLite, בלי ארנק ובלי Conway (כך רץ ב-CI)` and note `--run` needs a Conway key and wallet.

### F11 — L103 — WRONG — MEDIUM
**Claim:** `התקרה הכנה של כל שישה השורדים יחד: **₪4,000–7,000 לחודש בבגרות**`
**Evidence:** the audit of this group: "The merged '₪4,000–7,000/month at maturity' headline is the sum of six
unanchored numbers, which is worse than any one of them. **Corrected group figure: ₪0 today; ₪0 in month one;
₪500–1,500/month**" (`audits/israel-bureaucracy.md:58-62`). The document's own §1ב table uses 500–1,500.
**Fix:** `המפקח כתב ₪4,000–7,000; המבקר תיקן ל-**₪500–1,500 לחודש בבגרות, ₪0 בחודש הראשון**.`

### F12 — L137 — STALE — MEDIUM
**Claim:** `מה שנשאר — פרסום חינמי תחת המותג ומכירה ב-Gumroad — הוא צעדים 3 ו-4ב של הבעלים.`
**Evidence:** there is no step "4ב"; step 4 is Stripe Connect via Algora. `pcn874` is unlocked by steps 3 and 7
(`owner-steps.ts:116,142`; `portfolio.ts:197-200`). "4ב" was the machine-account step under a retired numbering
(`CHECKPOINT.md:228`).
**Fix:** `…הוא צעדים 3 (Gumroad) ו-7 (ארגון GitHub + חשבון מכונה) של הבעלים.`

### F13 — L127-128 — UNSUPPORTED — MEDIUM
**Claim:** `השער שנשאר הוא מהדורה חדשה — \`pcn874-spec-watch.yml\` מגבב את שלושת המקורות כל שבוע.`
**Evidence:** the workflow is scheduled weekly (`cron: "17 4 * * 1"`) and now on main, but it cannot notice a new
edition: the committed lock is empty (`products/pcn874/docs/SPEC-SOURCES.lock.json` → `"sources": {}`), the job has
`permissions: contents: read` and no commit step, and `scripts/spec-watch.mjs:124-126` prints `new` and exits 0 for
any source with no stored hash. Every run is a "first download"; the lock it writes dies with the runner.
Unreachable sources also exit 0 (`spec-watch.mjs:150-157`). The document presents a guard that cannot fire.
**Fix:** `…\`pcn874-spec-watch.yml\` מוריד את שלושת המקורות כל שבוע, אבל עד שה-hash הראשון נשמר בקובץ ה-lock בריפו הוא לא יכול לזהות מהדורה חדשה.`

### F14 — L246 — WRONG — MEDIUM
**Claim:** `| 6 | בוטים בטלגרם ב-Stars | לא נמדד | ללא ראיה | חסום על שאלה אחת: האם משיכת Fragment פתוחה לתושב ישראל.`
**Evidence:** killed 2026-09-07: "A MANDATE COLLISION, not a weak ceiling. Fragment's payout KYC is ID plus SELFIE — a
camera step the owner's brief forbids" (`portfolio.ts:441`; `BOARD.md:106`).
**Fix:** remove the row; in §4: `בוטים בטלגרם ב-Stars — נהרג 7.9: ה-KYC של Fragment דורש סלפי; נפתח רק אם יתרנדר משיכה בלי מצלמה.`

### F15 — L96 — WRONG — MEDIUM
**Claim:** `רק x402/USDC ו-Telegram Stars עובדים בלי שום KYC.`
**Evidence:** Telegram Stars payout via Fragment = "ID plus SELFIE" (`portfolio.ts:441`; `BOARD.md:311`). x402 "no
account, no KYC, NO BLOCKER" is listed as a refuted supervisor claim: "Contradicted by Apify's own terms … and silent
on crypto→ILS settlement (Israeli VASP KYC, bank source-of-funds)" (`audits/israel-bureaucracy.md:482-486`);
`OWNER_STEPS.he.md:271`: "Telegram Stars / USDC … ואז יש אימות זהות נוסף".
**Fix:** `אין מסילה בלי KYC: Fragment (Stars) דורש ת״ז + סלפי, והמרת USDC לשקלים עוברת KYC של נותן שירות קריפטו.`

### F16 — L95 — WRONG — MEDIUM
**Claim:** `**קריפטו (USDC/x402, TON)** — היחיד שהאוטומטון שולט בו בעצמו, בלי KYC ובלי צד שלישי שיכול לסגור אותו.`
**Evidence:** as F15 — TON/Stars withdrawal is Fragment's ID + selfie; crypto→ILS needs VASP KYC
(`audits/israel-bureaucracy.md:482-486`); both x402 lines were killed (`portfolio.ts:410-433`).
**Fix:** `קריפטו (USDC/x402) — הארנק בשליטת האוטומטון, אבל ההמרה לשקלים עוברת KYC; קווי x402 נהרגו 7.9 והמסילה בהמתנה בלבד.`

### F17 — L94 — STALE — MEDIUM
**Claim:** `**Freemius** — ישראלית במקור, לפי הדיווח משלמת בשקלים בלי עמלת המרה. **ברמת snippet בלבד**, ראה משימה #21.`
**Evidence:** task #21 closed 7.9: "The earlier 'pays in ILS, no conversion fee' claim stays REFUTED as stated"; payout
to Israel RENDERED (`supported-countries.txt` L308); USD balance, ILS only via Wise/wire; fee 4.7% + ~3.5% ≈ 8.2%
(`rails.ts:348-354`; `REJECTED.md:1265`).
**Fix:** `**Freemius** — משלם לישראל (מרונדר 7.9.2026); היתרה בדולרים, תשלום בשקלים רק דרך Wise או העברה בנקאית; עמלה כ-8.2%. הטענה "משלם בשקלים בלי עמלת המרה" הופרכה.`

### F18 — L90 — WRONG — MEDIUM
**Claim:** `זה **לא סגור**, וזו אחת מארבע הבדיקות של שלושים השניות למטה.`
**Evidence:** `grep -n "שלושים\|שניות" docs/INCOME_PLAN.he.md` → only this line; no list of thirty-second checks exists
in the document (the §6 list moved to OWNER_STEPS, and Paddle is no longer a step at all — `rails.ts:136-147`).
**Fix:** `זה **לא סגור**, והוא לא צעד שלך: Paddle היא אפשרות בלבד, עם שלושה סיכונים ב-\`src/revenue/rails.ts\`.`

### F19 — L335 (and L332-336) — WRONG / STALE — MEDIUM
**Claim:** `\`products/il-biz-tools\` - … מוכן לפריסה ב-Netlify; שער Pro דרך Paddle כשיהיה חשבון.`
**Evidence:** Paddle was removed (`src/lib/paddle.js` gone; `src/lib/gumroad.js` present; `src/config/site.json:5-7`
gumroad block "Paste the full https URL of the Gumroad product page here (owner step 3)"); `products/README.md`:
"`il-biz-tools` moved from Paddle to Gumroad". The section lists three products; `products/` holds six (adds
`pcn874`, `mcp-il-tools`, `telegram-il-tools-bot`). A Paddle mention here contradicts §6, which says Paddle is not a step.
**Fix:** `שער Pro דרך Gumroad (צעד 3), מושבת עד שקישור המוצר מודבק.` and add the three missing rows from `products/README.md`.

### F20 — L330 — STALE / WRONG — MEDIUM
**Claim:** `קו x402 הוא היחיד שאינו דורש שום חשבון אנושי, ולכן הוא מקבל מוצר אמיתי ראשון (\`products/x402-il-api\`)` … `הוא תוספת ולא הליבה`
**Evidence:** both x402 lines killed 7.9 (`portfolio.ts:410-433`); x402-il-api "stays deployed only while it costs
₪0/month, as a RAIL ON STANDBY rather than a line" (`portfolio.ts:420-421`). "No human account" contradicted by
`audits/israel-bureaucracy.md:482-486`.
**Fix:** `קווי x402 נהרגו 7.9.2026 (₪6 לספק לחודש). \`products/x402-il-api\` נשאר מסילה בהמתנה בלבד, כל עוד הוא עולה ₪0.`

### F21 — L97 (and L262) — UNSUPPORTED — MEDIUM
**Claim:** `YouTube מסיר ערוצי AI תבניתיים` (L97); `ערוצי YouTube תבניתיים — נענשים ומוסרים ב-2026` (L262).
**Evidence:** the rendered policy says template-made channels "are not allowed to monetize" and "monetization may be
removed from your entire channel" (`research/rendered/youtube-monetization-policies.txt:130,156`); removal applies to
Community Guidelines violations (L106). `REJECTED.md:1316` says "penalised and demonetised". Matters now: the owner
sent a faceless-YouTube reel on 25.9 and the reassessment is open (`CHECKPOINT.md:7-45`).
**Fix:** `YouTube לא מאפשר מונטיזציה לערוצים שנראים עשויים מתבנית (מדיניות "inauthentic content", מרונדרת); זו הסרת מונטיזציה, לא הסרת ערוץ.`

### F22 — L74 — UNSUPPORTED — MEDIUM
**Claim:** `העלות שלך: onboarding self-serve, בלי שיחה, בלי מצלמה, בלי הוצאה.`
**Evidence:** nothing in the repo renders Stripe Connect Express onboarding requirements; `stripe.com` is
EGRESS_BLOCKED (`REJECTED.md:1341-1343`). The chief audit says only "identity document, address, Israeli bank account.
Self-serve." (`CHIEF-AUDIT.md` §4A.3). "No camera" is asserted, not found — and a camera step would be a mandate
collision (`BOARD.md:242` planned a screen for exactly that).
**Fix:** `…onboarding self-serve (ת״ז, כתובת, חשבון בנק). אם Stripe מבקש סלפי או וידאו — עצור ודווח; זו התנגשות עם המנדט.`

### F23 — L26 — WRONG — LOW
**Claim:** `| **סה״כ** | **34,300** | **4,850–5,850** |`
**Evidence:** the supervisor column as printed (15,500 + 102,500 + 8,000 + 1,900 + 600 + 500 + 7,800) sums to 136,800.
Source: "**136,800** (34,300 excluding the phantom rails column)" (`CRITIC-synthesis.md:161`).
**Fix:** `| **סה״כ** | **136,800** (34,300 בלי 102,500 הפנטום של payment-rails) | **4,850–5,850** |`

### F24 — L35 — UNSUPPORTED — LOW
**Claim:** `**חיתוך של פי 7, עקבי בכל קבוצה ובכל מבקר.**`
**Evidence:** the table two paragraphs up: agent-markets 600→200 (3×), store-promotion 5.2×, risk-governance 5.4×,
bounties-grants 9.75×, israel-bureaucracy 5.3–16×, two groups →0. The 7× is the aggregate (34,300/4,850), not a
per-group constant.
**Fix:** `חיתוך מצטבר של פי 7 (בין פי 3 לפי 16 לקבוצה, ושתיים לאפס).`

### F25 — L36 and L105 — STALE — LOW
**Claims:** `כדי ששש הקבוצות שנותרו יסגרו את הפער…` (L36); `היעד של ₪20,000 מחייב קווים מקבוצות שעדיין לא נסרקו.` (L105)
**Evidence:** all 15 groups swept by 6.9 (`REJECTED.md:1021` "the fifteenth and last group"; `CHIEF-AUDIT.md:1`
"the whole 15-group sweep"); result ₪2,200.
**Fix:** `כל 15 הקבוצות נסרקו (6.9.2026); התוצאה המבוקרת היא כ-₪2,200, ושום קבוצה לא סגרה את הפער.`

### F26 — L54 — WRONG — LOW
**Claim:** `שתי שאילתות המחשבון (מע״מ, שכר נטו) מוחזקות כולן בידי אתרי כלים עצמאיים קטנים`
**Evidence:** the net-salary SERP's top three are `israelhayom.co.il, taxes-refund.co.il, malam-payroll.com`; the three
independents sit at #4, #7, #8 ("newspaper + payroll bureau above the independents",
`research/measurements/serp/2026-09-07-hebrew-calculators.md:332`). Only the VAT SERP is entirely independents. (The
wording is copied from the file's own 100-word summary, L456, which contradicts its own table.)
**Fix:** `שאילתת המע״מ מוחזקת כולה בידי אתרי כלים עצמאיים קטנים, ובשכר נטו שלושה כאלה בעמוד הראשון מתחת לעיתון ולמלם — הוכחה ש…`

### F27 — L57 — WRONG — LOW
**Claim:** `…ו־YPAY (חשבונית חינם) ושמונה משרדי רו״ח.`
**Evidence:** "six CPA practices (#1, #2, #3, #4, #6, #8) and two law firms (#5, #7)" (same file L303-305).
**Fix:** `…ושמונה משרדי שירותים מקצועיים (שישה רו״ח ושני עורכי דין).`

### F28 — L61 — STALE — LOW
**Claim:** `ולידטור חינם קודם, ושער המפרט עדיין מעליו.`
**Evidence:** the same document, L121-128: the official spec was rendered and reconciled that evening; SPEC.md cites
it line by line.
**Fix:** `ולידטור חינם קודם; שער המפרט נפתח באותו ערב (ראה למטה).`

### F29 — L72-73 — UNSUPPORTED — LOW
**Claim:** `זו גם **הראיה היחידה ברמת קוד לזכאות ישראלית בכל הסריקה**`
**Evidence:** `rails.ts:340`: Gumroad's "own production source file _13-getting-paid.html.erb carries a row reading
Israel | ILS … This is the strongest payability evidence the 120-criterion sweep produced." The document's own §6
(L301) relies on it. (`portfolio.ts:161` makes the same "only" claim for Algora — the repo contradicts itself.)
**Fix:** `…אחת משתי הראיות ברמת קוד מקור לזכאות ישראלית (השנייה: קובץ המקור של Gumroad, \`Israel | ILS\`).`

### F30 — L131-133 — WRONG — LOW
**Claim:** `שלושה יצרו קובץ שגוי בשקט — שורה חסרת-תאים, פסיק בסכום שנמחק (\`"1800,00"\` → ₪180,000), עברית בקבוצת ההפניה שמייצרת רשומה של 62 בייט`
**Evidence:** "**3 silently wrong** (a row with more cells than columns — an unquoted thousands separator …; a row with
fewer cells than columns …; a quoted comma-decimal `"1800,00"` …), … **1 warned but under-described** (Hebrew in
`refGroup` writes a 62-byte record …)" (`audits/pcn874-generator.md:8`).
**Fix:** `שלושה יצרו קובץ שגוי בשקט — שורה עם יותר תאים מכותרות (מפריד אלפים לא מצוטט), שורה עם פחות תאים, ופסיק עשרוני (\`"1800,00"\` → ₪180,000); ועברית בקבוצת ההפניה יצרה רשומה של 62 בייט עם אזהרה שלא מסבירה את זה.`

### F31 — L154-157 — STALE — LOW
**Claim:** `**שש המגבלות שיצאו מהקבוצה הן התוצר האמיתי שלה**, והן נמצאות עכשיו בקוד — \`src/revenue/constraints.ts\``
**Evidence:** `PROMOTION_CONSTRAINTS` has seven ids (`constraints.ts:46,68,87,112,122,140,158`); the seventh,
`no-offsite-funnel-from-a-marketplace-listing`, comes from Apify §2.2.4.2(i). The file's header comment still says
"six" (`constraints.ts:5`).
**Fix:** `שבע מגבלות נמצאות עכשיו בקוד… ונוספה שביעית: לא לתכנן ליסטינג בשוק כמשפך החוצה (סעיף 2.2.4.2(i) של Apify).`

### F32 — L169 — UNSUPPORTED — LOW
**Claim:** `Apify משלמת $1.4M לחודש ל-~3,000 מפתחים`
**Evidence:** `portfolio.ts:280` calls it "an unverified marketing mean ($470/developer/month across ~3,000 developers,
a power-law MEAN and not in Apify's own documentation)". Stated here as fact.
**Fix:** `לפי נתון שיווקי שלא אומת (לא בתיעוד של Apify): $1.4M לחודש ל-~3,000 מפתחים…`

### F33 — L171-172 — STALE — LOW
**Claims:** WordPress plugin `₪4,000 | **₪1,000**`; RapidAPI `₪1,500 | **₪500**`.
**Evidence:** chief audit: WordPress "₪0–200 … The ₪1,000 was the earlier audit and did not have the ranking code"
(`CHIEF-AUDIT.md:136`); RapidAPI "₪0 forecast; Two auditors disagree (₪500 vs ₪0); the one with 16 months of a real
seller's retrospective wins" (`CHIEF-AUDIT.md:139`). The dev-extensions line was killed (`portfolio.ts:447-457`).
**Fix:** add a column or note: `(ביקורת ראשית 6.9: WordPress ₪0–200, RapidAPI ₪0)`.

### F34 — L205-206 — WRONG — LOW
**Claim:** `**העלות היחידה שלנו שגדלה עם התנועה היא טוקנים.**`
**Evidence:** "Apify Actors — the deduction before the 80% is Apify platform usage: compute and proxy, not inference …
RapidAPI listing — hosting and uptime. Not one surviving line has inference as its dominant marginal cost"
(`CRITIC-synthesis.md:244-251`). The document's own L191-193 says this. L222 repeats the error ("העלות היחידה שבאמת
גדלה עם התנועה שלנו").
**Fix:** `טוקנים הם עלות התפעול של המושבה (סריקות), לא של החנויות; עלות השוליים של Apify היא שימוש בפלטפורמה.`

### F35 — L212 — UNSUPPORTED — LOW
**Claim:** `המוצרים שלנו כבר יושבים על תשתית בצורת Cloudflare`
**Evidence:** `products/il-biz-tools/netlify.toml` (Netlify); Apify Actor (`Dockerfile`); x402-il-api "Deploy on any
Node 22.12+ host … Fly, Railway, a VPS" (`products/x402-il-api/README.md:67`). No product has Cloudflare config
(`grep -rli wrangler products` → none). Copied from the scout (L249-250).
**Fix:** drop the clause: `| **Cloudflare Workers AI** | 10,000 neurons ביום | אפס חסימות בעלים |`

### F36 — L213 — UNSUPPORTED — LOW
**Claim:** `| טוקנים של OpenAI תמורת שיתוף נתונים | ההקצאה הגדולה מהשלוש |`
**Evidence:** "Usage tiers 1–2: up to 250,000 tokens/day …; tiers 3–5: 1M/day and 10M/day" (scout L210-212). At the
tiers a new account reaches, it is below Cerebras's 1M/day.
**Fix:** `| … | 250 אלף ביום בדרגות 1–2, עד 10M בדרגה 5 | **נפסל — ראה למטה** |`

### F37 — L221 — STALE — LOW
**Claim:** `…העשרה בכמות ב-\`apify-il-open-data\` ובבוט הטלגרם.`
**Evidence:** `telegram-il-tools-bot` is PARKED ("do not start it", `products/README.md`; `portfolio.ts:444`).
**Fix:** `…העשרה בכמות ב-\`apify-il-open-data\`.`

### F38 — L262 — UNSUPPORTED — LOW
**Claim:** `**Medium Partner** — … ומשלם דרך Stripe. **Substack/beehiiv** — Stripe.`
**Evidence:** `REJECTED.md:1347`: "the rejections above that rest on it (Substack, beehiiv, Medium Partner, Polar) are
provisional, not closed"; the document's own L87 says the Stripe limit may not be used to reject a line.
**Fix:** `**Substack/beehiiv/Medium Partner** — נשענים על Stripe; פסילה זמנית עד שתיבדק שאלת Stripe-ישראל (צעד 4 סוגר אותה).`

### F39 — L336 — UNSUPPORTED — LOW
**Claim:** `\`products/x402-il-api\` - שרת API … רץ במצב חינמי עד שמוגדר ארנק.`
**Evidence:** no deployment is recorded anywhere; `products/x402-il-api/README.md:67` is a deploy instruction; the board
keeps it only "while it costs ₪0/month" (`portfolio.ts:420-421`).
**Fix:** `…בנוי ונבדק; לא פרוס. מסילה בהמתנה, לא קו.`

### F40 — L334 — STALE — LOW
**Claim:** `מוכן ל-\`apify push\` אחרי פתיחת חשבון Apify.`
**Evidence:** publishing is a CI job now (`.github/workflows/apify-publish.yml`: `push: branches: [main]`,
`workflow_dispatch`, `schedule`), needing `APIFY_TOKEN` as a secret (owner step 6, early half); main is live since 22.9.
**Fix:** `מתפרסם בחינם מ-CI (\`apify-publish.yml\`) ברגע שיש \`APIFY_TOKEN\` בסודות של GitHub (החצי המוקדם של צעד 6).`

### F41 — L341 — STALE — LOW
**Claim:** `**המחקר** נעשה ב-4 סוכני-סריקה במקביל … 4 סוכני סריקה נוספים ושלב האימות האדברסרי נכשלו על מגבלת הסשן`
**Evidence:** since 2.9: a 15-group, 121-criterion sweep with supervisors and auditors (`CHIEF-AUDIT.md:1`;
`portfolio.ts:161`), a chief audit and a board (`BOARD.md`).
**Fix:** `**המחקר**: סריקה של 15 קבוצות (121 קריטריונים) עם מפקח ומבקר לכל קבוצה, ביקורת ראשית ודירקטוריון (3–7.9.2026) — \`research/colony-sweep/\`.`

### F42 — L3 — STALE — LOW
**Claim:** `עדכון אחרון: 2026-09-02.`
**Evidence:** sections dated 3.9, 4.9 and 7.9 (L12, L48, L121, L130); last commit `6db122b` 2026-09-07.
**Fix:** `עדכון אחרון: 2026-09-07 (מצב הצעדים: ראה \`docs/OWNER_STEPS.he.md\`).`

### Correct claims whose checking was not obvious

- **L276 — CORRECT, noteworthy (LOW).** The rules are stated exactly as coded (`types.ts:212-222`, `rules.ts:77-130`).
  But the coded kill floor is global — ₪500 per 30 days after 45 days live (`killFloorAgorot: 50_000`) — and it is
  checked before the scale rule. Three of the four live lines have targets below it (₪200, ₪300, ₪400), so a line that
  meets its target in full is killed on day 45. The per-line `killCriteria` in `portfolio.ts` (e.g. il-biz-tools "under
  ₪200 … after 90 days", pcn874 "under ₪150 … after 90 days") are prompt text only (`org.ts:172,278`); `decideLine`
  never reads them (`grep killCriteria src/revenue/*.ts`). The document is right about the code; the code contradicts
  the board's targets. Worth a separate fix, not a document edit.
- **L135 — CORRECT.** "311 בדיקות" re-run: `vitest run` in `products/pcn874` → `Test Files 6 passed (6) / Tests 311 passed (311)`.
- **L43-44 — CORRECT.** ₪16,500 re-derived from `state/colony/colony.db` (`target_monthly_agorot` of the six killed rows:
  3,000 + 1,200 + 800 + 1,500 + 2,500 + 1,500) plus the three survivors' former targets (3,000 + 1,500 + 1,500), matching
  `CRITIC-synthesis.md:195-197`.
