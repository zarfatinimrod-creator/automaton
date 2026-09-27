# Claim audit — `docs/OWNER_STEPS.he.md` (and its PDF, and `src/revenue/owner-steps.ts`)

Auditor: Opus, read-only. Date: 2026-09-25. Branch `claude/new-session-j071dx` (HEAD `0eff91f`, which contains
`origin/main`). Nothing in the repo was edited except this file. No git write command was run.

Scope and method: every checkable claim in the document, line by line, checked against the repo only (code, research
files, `research/rendered/*`, git history read with `git log` / `git show` / `git branch --contains`). Claims about
external platform UIs (menu names, click paths, Netlify/GitHub/claude.ai screens) are out of scope unless the repo
holds a rendered source; they are listed as `OUT` and not graded.

Commands run (all read-only):
- `npx vitest run src/__tests__/revenue/owner-steps.test.ts` → **12/12 passed**. That test checks only the heading
  numbers, the order string `1 → 2 → 3 → 5 → 7 → 4 → 6` and an Apify / "אחרי צעד 1" mention. It does not check
  titles, minutes, lines, tokens or completion state, so everything below passes it.
- `git log origin/main`, `git branch -a --contains ad28d27`, `git ls-tree origin/main .github/workflows/`,
  `git show origin/main:state/colony/REPORT.md`, plus greps cited per line.

**The PDF.** `docs/OWNER_STEPS.he.pdf` is 244,888 bytes, committed in `74c306d` (7.9.2026 18:25 UTC) by
`scripts/owner-steps-pdf.mjs` from this Markdown, which has not changed since `a65a5b2` (7.9.2026 17:13 UTC). The
later "step 1 done" version of the PDF (291,029 bytes, `ad28d27`) exists only on the PR branch. **Every finding
below applies to the PDF as well**, and the PDF must be regenerated after any fix.

---

## Part 1 — every claim checked, one line each

Status key: C = CORRECT, W = WRONG, S = STALE, U = UNSUPPORTED, OUT = external UI/law, not graded. `F#` = detailed
finding below.

| # | Line | Claim (short) | Status | Evidence |
|---|---|---|---|---|
| 1 | 1 | Seven steps | C | `owner-steps.ts:83-175` (7 entries); test "has exactly seven steps" passes |
| 2 | 3 | "עודכן 7.9.2026" — the document is current | S | F1: step 1 done 22.9.2026; doc unchanged since `a65a5b2` (7.9) |
| 3 | 3 | After an adversarial check of every claim against the research | C | `logs/2026-09-07-board-owner-guide-and-first-builds.md:22-29` (Opus checker found 8 errors, fixed) |
| 4 | 3-4 | Each step once, ~2.5 hours total | C | doc minutes sum 132–162; code `ownerStepMinutes()` 132–172; test bounds 100–200 |
| 5 | 4 | No conversation, no video we know of | C | `CHIEF-AUDIT.md:248` "No liveness video is reported anywhere" |
| 6 | 6 | These steps are all the machine needs to start selling and receiving money | W | F3 (Pro licence keypair + per-sale key issue assigned to the owner outside the list) |
| 7 | 7 | Apify KYC only before pricing; contest-win form | W (minor) | F17: KYC goes to the owner at 50 stranger users, pricing at 200 |
| 8 | 10 | Board ruling 7.9.2026: order 1→2→3→5→7→4→6 | C | `BOARD.md:208-210`; `owner-steps.ts:29-36`; test passes |
| 9 | 10-11 | Numbers kept stable, only order changed | C | `owner-steps.ts:54-58` |
| 10 | 11-12 | Org (7) before Algora (4) because Algora must be the brand account | C | `BOARD.md:199`; `owner-steps.ts:154` |
| 11 | 12-13 | Apify token (half of step 6) may go in right after step 1 | C | `owner-steps.ts:168-173` `earlyPart.afterStep: "merge-pr"` |
| 12 | 13 | That token starts the first measurement | C | `.github/workflows/apify-publish.yml` (publish + daily `count-runs`) |
| 13 | 19-21 | Tokens go into GitHub secrets (step 6), not to chat | C | `colony.yml:62`, `apify-publish.yml:120-123` read `secrets.*` |
| 14 | 22-23 | Public name = brand; legal identity must be the owner's | C | `MISSION.md:276-303` |
| 15 | 24-25 | Gov sites, Gumroad, Apify, Netlify, Algora blocked for the container | C | `scouts/storefronts--gumroad.md:5-10`; `CHIEF-AUDIT.md:259-262`; `scouts/bounties-grants--oss-bounties.md:40`; `sweep-workflow.ts:41` |
| 16 | 25 | What they require is verified from their own sources on GitHub | U | F12 (gov/BTL: snippet only; Stripe fields: scout, no Stripe source) |
| 17 | 26 | Menu names are not verified (🔍) | C | self-description; `owner-steps-pdf.mjs:63-67` turns 🔍 into the badge |
| 18 | 30 | Step 1 heading: merge PR #2 (pending) | S | F1 |
| 19 | 32 | 2 minutes | C | `owner-steps.ts:89` `[2, 2]` |
| 20 | 35 | PR #2 URL `zarfatinimrod-creator/automaton/pull/2` | C | `git remote -v`; merge commit `31cda66` "Merge pull request #2" |
| 21 | 36-38 | Check green checks, then Merge / Confirm merge | S | F1 (already merged) |
| 22 | 40-41 | Alternative: say "תמזג" and the agent merges | C (historical) | `ad28d27` message: the owner said "תמזג" |
| 23 | 43 | Checked via API: PR open, not draft, no conflicts | S | F1 |
| 24 | 46 | All the code sits on a side branch | S | F1: `31cda66` merged it to `main` |
| 25 | 46 | "חמשת המוצרים" — five products | W | F15: `ls products/` → 6 product directories |
| 26 | 47 | GitHub runs scheduled work only on `main` | C | `colony.yml:11-17` |
| 27 | 47-48 | `main` has only two test workflows; the loop is not registered | S | F1: `git ls-tree origin/main .github/workflows/` → 7 files incl. `colony.yml` |
| 28 | 51 | Hourly ledger, supervisors every 6h, board daily, audit weekly | C | `heartbeat.ts:53-58`; `colony.yml:20-23` cron `17 * * * *` |
| 29 | 52 | `state/colony/REPORT.md` is updated | C | `git show origin/main:state/colony/REPORT.md` (generated 2026-09-25T13:44:58Z) |
| 30 | 52 | "עד עכשיו הרצתי את זה ידנית" | S | F1: 16 `colony tick` commits on `origin/main` since 22.9 |
| 31 | 58 | 60–90 minutes | C | `owner-steps.ts:100` `[60, 90]` |
| 32 | 58 | Online, with ID and phone (gov identification) | OUT | external |
| 33 | 61-62 | Tax Authority: open file, choose עוסק פטור | OUT | 🔍-marked UI; `CHIEF-AUDIT.md:241-242` supports the substance |
| 34 | 63-64 | BTL form is 6101 — "המספר של הטופס מאומת" | U | F11: `scouts/israel-bureaucracy--business-registration.md:30` is `[snippet]` |
| 35 | 67 | Kol-Zchut link as explainer | C | `products/il-biz-tools/src/config/osek-patur.json:6` uses the same source |
| 36 | 70 | Law: any business income, even ₪10, needs a file | C | `CHIEF-AUDIT.md:241-243`; `owner-steps.ts:102` |
| 37 | 70-71 | Gumroad and Stripe ask ID and bank, not a tax file | C | `scouts/storefronts--gumroad.md:154-164`; `scouts/bounties-grants--oss-bounties.md:115-117` |
| 38 | 72 | עוסק פטור: VAT-exempt, reports once a year, no accountant | OUT | Israeli law; only "no accountant to register" has a snippet (`...business-registration.md:23`) |
| 39 | 73 | Ceiling ₪122,833/year for 2026 | C | `osek-patur.json:3-5` (`verified: true`); `CHIEF-AUDIT.md:243` |
| 40 | 73-74 | No government page was opened from here | C | `sweep-workflow.ts:41`; `osek-patur.json` source is Kol-Zchut |
| 41 | 74 | Income tax and NI apply regardless | OUT | law |
| 42 | 77 | Without it, money in is exposure | C | `CHIEF-AUDIT.md:241-242` |
| 43 | 79 | ₪122,833/yr ≈ ₪10,000/month | C | 122,833 / 12 = 10,236 (`BOARD.md:150`) |
| 44 | 79-80 | Reaching it forces עוסק מורשה, decided then | C | `BOARD.md:150-151`, `BOARD.md:197` |
| 45 | 83-86 | Accountant conversation removed; default taxable, no zero-rating; written async routes | C | `BOARD.md:309`; `CHIEF-AUDIT.md:289-293` |
| 46 | 92 | 20 minutes | C | `owner-steps.ts:113` `[20, 20]` |
| 47 | 92 | Review 1–3 weeks after the first 3–4 sales | C | `audits/storefronts.md:162-163` (rendered Gumroad text) |
| 48 | 95 | Store name = brand | C | `portfolio.ts:129` |
| 49 | 96 | Israel, Israeli bank, holder name in Latin letters | C | `scouts/storefronts--gumroad.md:162`; `CHIEF-AUDIT.md:247` |
| 50 | 97-98 | Colour ID front and back; proof of Israeli address, no P.O. box | C | `CHIEF-AUDIT.md:246-247`; `scouts/storefronts--gumroad.md:159-161` |
| 51 | 98 | No selfie video reported anywhere | C | `CHIEF-AUDIT.md:248` |
| 52 | 99 | Token lives under Advanced settings / Applications | OUT | 🔍 UI path |
| 53 | 100 | Secret name `GUMROAD_ACCESS_TOKEN` | C | `connectors/gumroad.ts:4,14`; `colony.yml:62` |
| 54 | 103 | Collects, holds 7 days, pays the bank in ILS | C | `scouts/storefronts--gumroad.md:40-59`; `audits/storefronts.md:161` |
| 55 | 103-104 | Verified from Gumroad's own source; the only one found with such proof | S (minor) | F22: Freemius rendered 7.9 (`research/measurements/freemius-rail.md:340-358`) |
| 56 | 104-105 | Gumroad brings no buyers; a product with no prior sale is not recommended | C | `audits/storefronts.md:77` (`sale_made`) |
| 57 | 106 | $100 minimum before payout | C | `audits/storefronts.md:160` |
| 58 | 108 | Fee 12.9% + $0.80 **plus** 2.9% + $0.30 | W | F7: the 2.9% + $0.30 is already inside 12.9% + $0.80 |
| 59 | 108-109 | ~22% at $9, ~17% at $19 | C | `audits/storefronts.md:140-146` (these are 12.9% + $0.80 only — contradicts line 108) |
| 60 | 112 | Opens **three** revenue lines incl. the registrar compliance clock | W | F8 |
| 61 | 113-114 | Pro's only other condition is `tax-2026.json` `verified:false` (agent side) | W | F3 |
| 62 | 114 | `tax-2026.json` is `verified: false` | C | `products/il-biz-tools/src/config/tax-2026.json:3` |
| 63 | 117-118 | Paddle: "שלוש סיבות מאומתות" — selfie video, discretionary approval, no ILS | U | F13: `rails.ts:146` grades them `evidence: "snippet"` |
| 64 | 119 | Gumroad covers the same products | C | `BOARD.md:310`; `rails.ts:139` |
| 65 | 120 | Gumroad's terms forbid AI services (bots, API) | C (non-obvious) | `scouts/storefronts--gumroad.md:81-91`, `groups/storefronts.md:46` — rendered `prohibited.html.erb` (BOARD §5 thought it unverified; it was verified in `groups/`) |
| 66 | 126 | 15 minutes | C | `owner-steps.ts:152` `[15, 15]` |
| 67 | 129 | Open algora.io → "Sign in with GitHub" (no account named) | W | F2 |
| 68 | 130 | "Set up payouts" opens a Stripe form | OUT | 🔍 UI |
| 69 | 131 | Individual, legal name, ID, Israeli address, Israeli bank | C | `scouts/bounties-grants--oss-bounties.md:115-117`; `portfolio.ts:167` |
| 70 | 131 | Bank in Latin letters (for Stripe) | U | F25: Latin-letters rule is Gumroad's, not in any Stripe/Algora source |
| 71 | 132 | Stripe may ask for an ID upload | C | `scouts/bounties-grants--oss-bounties.md:117` |
| 72 | 132 | No token to copy; Algora pays the account | C | no code reads an Algora/Stripe token for this line; `payments.ex` → Stripe Connect Express |
| 73 | 135 | Algora = bounty board; solver gets the amount | C | `scouts/bounties-grants--oss-bounties.md:22-33` |
| 74 | 136 | Israel is in Algora's own supported-countries code | C | `portfolio.ts:161-162`; `CHIEF-AUDIT.md:121` (`connect_countries.ex`, rendered twice) |
| 75 | 137-138 | Rules: AI disclosure per PR, demo video per claim, stop on first request | C | `portfolio.ts:145`; `bot_templates.ex` quote at `scouts/bounties-grants--oss-bounties.md:31` |
| 76 | 141 | Money 2–5 days after approval, with a transaction id | C | `scouts/bounties-grants--oss-bounties.md:30` (Algora bot template) |
| 77 | 143 | The form answers "does Stripe pay Israelis" | C | `BOARD.md:333` |
| 78 | 146-147 | An org cannot sign in; step 7 does not fix the Algora byline | C | `BOARD.md:199`; `owner-steps.ts:141` |
| 79 | 148-149 | Option (א): personal account, handle visible on PRs | C | `BOARD.md:313`, `BOARD.md:352-353` |
| 80 | 150-154 | GitHub ToS allows one free machine account, automation only | C (non-obvious) | substance rendered at `scouts/risk-governance--automation-tos.md:25-27`; the exact `github/site-policy` wording is recorded only in `logs/CHECKPOINT.md:99` and the 7.9 log, not stored as a rendered file |
| 81 | 154 | 5 minutes, other email, brand name | C | `BOARD.md:202` "about five extra minutes, email only, no KYC" |
| 82 | 154-155 | Add it to the org from step 7, then sign in to Algora with it | C | `portfolio.ts:166-167` |
| 83 | 156-157 | `BRAND_GITHUB_TOKEN` asked for later, when the consuming code exists | W (drift) | F6 |
| 84 | 158 | Board ruled (ב) | C | `BOARD.md:352-353`; `owner-steps.ts:144-145` |
| 85 | 164 | 10 minutes; one payment from the ₪200 | C | `owner-steps.ts:126,132`; `MISSION.md:242-258` |
| 86 | 167 | Agent sends one brand domain name | C | `MISSION.md:276-279` (brand "בדיוק/Bediyuk" proposed, not approved: `CHECKPOINT.md:555`) |
| 87 | 168-169 | Board: `.com`, not `.co.il`, WHOIS privacy | C | `BOARD.md:200`, `BOARD.md:314` |
| 88 | 169 | WHOIS privacy usually free | OUT | external |
| 89 | 170 | Buy it at any registrar | W (minor) | F24: board says a registrar with privacy ON BY DEFAULT |
| 90 | 170 | Price tens of shekels a year, unverified | C | stated as unverified |
| 91 | 171 | Configure nothing; agent sends 2–3 DNS lines | C | `BOARD.md:282-283` |
| 92 | 172 | Keep the receipt id; it goes into the ledger as a cost | C | `MISSION.md:255-257`; `owner-steps.ts:132` |
| 93 | 174-175 | Domain renewal is the owner's decision each time, per the mandate | C | `MISSION.md:264-266` |
| 94 | 178 | Today every site URL is `*.netlify.app` | C | `products/il-biz-tools/src/config/site.json:2` |
| 95 | 178-179 | Google takes a domain seriously; stores check it at approval | OUT / C | Google part external; store review per `CHIEF-AUDIT.md:257-258` |
| 96 | 182 | MCP registry derives the public name from the GitHub account | C | `MISSION.md:283-285` |
| 97 | 183 | No search-dependent line exists without it | C | `owner-steps.ts:128`; `CHIEF-AUDIT.md:118` |
| 98 | 187 | Step 6 heading: "two tokens" | W (drift) | F6 (code title "את הטוקנים"; code includes `BRAND_GITHUB_TOKEN`) |
| 99 | 189 | 15 minutes | W (drift) | F14: `owner-steps.ts:163` `[15, 20]` |
| 100 | 191-192 | Container blocked from Netlify, Apify, Gumroad; Actions reach them | C | `CHIEF-AUDIT.md:261-262`; `owner-steps.ts:165` |
| 101 | 195 | Site `il-biz-tools` exists, id `2087c2ed-…` | C | `logs/2026-09-03-first-products.md:18,23` |
| 102 | 196-197 | Link repository → repo `automaton`, branch `main` | OUT | 🔍 UI |
| 103 | 199-201 | Base `products/il-biz-tools`, build `node scripts/build-site.js`, publish `_site` | C | `products/il-biz-tools/netlify.toml:4-6`; `scripts/build-site.js:30` |
| 104 | 202 | Every push to `main` deploys; no Netlify token needed | OUT | Netlify behaviour |
| 105 | 203-204 | Fallback `NETLIFY_AUTH_TOKEN`; `NETLIFY_SITE_ID` already known | C | `products/il-biz-tools/README.md:163,249`; site id in logs |
| 106 | 207 | Gumroad token from step 3 | C | — |
| 107 | 208-209 | Apify sign-up by email; no KYC needed to publish free | C / W | no-KYC C (`CHIEF-AUDIT.md:268-270`); omission of the brand username W — F5 |
| 108 | 209 | Personal API token under account settings → Integrations | C | matches `apify-publish.yml:132` notice |
| 109 | 210-211 | Secrets page at `zarfatinimrod-creator/automaton/settings/secrets/actions` | S (minor) | F10: in the ruled order step 6 comes after the repo transfer |
| 110 | 212-213 | Secret names exactly `GUMROAD_ACCESS_TOKEN`, `APIFY_TOKEN` | C | `colony.yml:62`; `apify-publish.yml:128,220`; `scripts/apify-runs.mjs:294` |
| 111 | 216 | Gumroad token works immediately; loop reads sales hourly | C | now true: `colony.yml` on `main`, `heartbeat.ts:54` |
| 112 | 217 | `APIFY_TOKEN` works once "the workflow I'm building now" merges (today/tomorrow) | S | F4: `apify-publish.yml` is on `origin/main` |
| 113 | 220 | The workflow pushes `apify-il-open-data` to Apify | C | `apify-publish.yml:68-192` |
| 114 | 220-222 | Per Apify's own docs, going public is a console click Publication → Publish to Store | U | F23 |
| 115 | 222 | Free, no identity verification | C | `CHIEF-AUDIT.md:268-270` |
| 116 | 227 | Netlify is not deployed at all yet | C | no deploy recorded; `logs/2026-09-07-board-owner-guide-and-first-builds.md:72` |
| 117 | 228-229 | Gumroad token → each sale in the ledger with a transaction id | C | `connectors/gumroad.ts:38` (`externalId: String(sale.id)`) |
| 118 | 230-231 | Apify token + click → free listing, 30-day stranger count | C | `apify-publish.yml:198-280`; `portfolio.ts:44` |
| 119 | 231 | No buyer measured yet | C | `REPORT.md` on main: measured ₪0 |
| 120 | 234 | Deploy, publish, sales-reading become automatic | C | workflows above |
| 121 | 238 | Step 7 heading: move the repo to an org (no machine account) | W (drift) | F14: `owner-steps.ts:138` title includes "(וחשבון מכונה בשם המותג)" |
| 122 | 240 | 10 minutes | W (drift) | F14: `owner-steps.ts:139` `[10, 15]` |
| 123 | 243-246 | New organization (Free); Transfer ownership; type repo name | OUT | 🔍/external UI |
| 124 | 247-248 | Give Claude connector access to the new org | OUT | 🔍 |
| 125 | 249-250 | After transfer, check step-6 secrets are still there | S | F10 (in the ruled order only `APIFY_TOKEN` can exist then) |
| 126 | 250 | A missing Gumroad token silently stops the ledger | C | `heartbeat.ts:143` skips unconfigured connectors; `gumroad.ts:14,17,23` |
| 127 | 251 | Netlify may need relinking | S | F10 (Netlify link is step 6, after step 7) |
| 128 | 254-255 | Today every file is at `github.com/zarfatinimrod-creator/...` | C | `git remote -v`; `skills/README.md:53-58` raw links |
| 129 | 258-259 | Without step 7 I cannot publish anything from the repo without your name | W (minor) | F16 |
| 130 | 259 | Step 7 does not solve Algora sign-in | C | `BOARD.md:199` |
| 131 | 265-266 | Apify KYC items; PayPal or Wise in the owner's name | C | `CHIEF-AUDIT.md:268-270` |
| 132 | 266 | "רק לפני שמתמחרים" | W (minor) | F17 |
| 133 | 266-267 | Unwithdrawn balance forfeited after 12 months without KYC | C | `CHIEF-AUDIT.md:270-271` |
| 134 | 268-269 | Devpost per win: form within ~2 business days, W-8BEN, affidavit | C | `CHIEF-AUDIT.md:274-276` |
| 135 | 270 | PayPal Israel only if Apify or Devpost pay that way | C | `CHIEF-AUDIT.md:272-273` |
| 136 | 271 | Telegram Stars / USDC: later, with extra KYC | S | F18 |
| 137 | 277 | "הדירקטוריון מחליט (רץ עכשיו)" | S | F4: `research/colony-sweep/BOARD.md` dated 2026-09-07 |
| 138 | 277 | "ה-workflow של Apify נבנה עכשיו" | S | F4 |
| 139 | 277-279 | PCN874 generator waits for the official spec, being fetched via Actions | S | F4 |
| 140 | 279 | 2–3 weeks agent-side, an estimate | C | labelled as an estimate |
| 141 | 280-281 | First shekel "a few weeks" — "my estimate, not a research number" | W (minor) | F19: `BOARD.md:213-215` rules "4–10 weeks" |
| 142 | 281 | 2–5 days after approval — "זה כן נמדד" | U | F19: documented by Algora, not measured |
| 143 | 281-282 | Gumroad slower: $100, 7 days, review; auditors wrote "several months" | C | `audits/storefronts.md:158-169` |
| 144 | 283 | Month one: ₪0 on every line | C | `CHIEF-AUDIT.md:123` |
| 145 | 284-285 | After 12 months ~₪2,200/month from six lines (₪3,500 with Apify's contested bound) | W (framing) | F9: arithmetic C, presentation contradicts `BOARD.md:257` |
| 146 | 285 | ₪20,000/month not supported by anything measured | C | `BOARD.md:153-155` |
| 147 | 286 | Steps 1 and 6 are what start measuring | C | `apify-publish.yml`; `colony.yml` |
| 148 | 289 | Price floor of zero closed 11 of 15 groups | C (non-obvious) | `CHIEF-AUDIT.md:182`; `BOARD.md:145` (MISSION's own count is "six of seven", an older tally) |
| 149 | 290 | Some closed on geography (ad networks wanting US audience) | C | `CHIEF-AUDIT.md:43`; `BOARD.md:288` |
| 150 | 290-291 | Two angles nobody checked: English property, GitHub distribution | S | F20 |
| 151 | 299 | Table row 1: merge PR #2 | S | F1 |
| 152 | 301 | Table row 3: "3 קווים" | W | F8 |
| 153 | 304 | Table row 6: 15 min, "2 טוקנים" | W (drift) | F6, F14 |
| 154 | 305 | Table row 7: 10 min | W (drift) | F14 |
| 155 | 307 | ~2.5 hours total | C | as #4 |
| 156 | 307 | "ועוד שתי החלטות שהן שלך" | W | F21 |

Claims checked: 156 rows (12 `OUT`, not graded; 98 CORRECT; 46 WRONG/STALE/UNSUPPORTED, row 107 being half of each). The 46 rows collapse into the 25 findings below.

---

## Part 2 — findings in detail, most consequential first

### F1 — STALE, HIGH — Step 1 is presented as not done; PR #2 was merged on 22.9.2026 (lines 3, 30-52, 299)

Claims: line 30 `## צעד 1 — למזג את PR #2 ב-GitHub (או להגיד לי "תמזג")`; line 43 `(בדקתי מול ה-API של GitHub: ה-PR פתוח, לא טיוטה, אין קונפליקטים.)`; lines 46-48 `כל הקוד ... יושב היום על "ענף" צדדי ... ב-main היום יש רק שני workflows של בדיקות; הלולאה שלי לא רשומה בכלל`; line 52 `עד עכשיו הרצתי את זה ידנית`; line 299 table row 1; line 3 `עודכן 7.9.2026`.

Evidence:
- `git log origin/main` → `31cda66 2026-09-22 21:39:15 +0300 Merge pull request #2 — the revenue colony, six products, the criteria sweep and the board's decision`.
- `git ls-tree --name-only origin/main .github/workflows/` → `apify-publish.yml ci.yml colony.yml pcn874-spec-watch.yml products-ci.yml release.yml render-watch.yml` (before the merge, `90816df` had only `ci.yml release.yml`).
- `git log origin/main | grep -c "colony tick"` → 16; first `3e9e3f6 2026-09-22 18:40:14`, latest `a88aa99 2026-09-25 13:44:58 colony tick: 30d ₪0.00, ran 1, 4 blocker(s)`.
- The doc was updated to "done" on the PR branch only: `git branch -a --contains ad28d27` → `remotes/origin/claude/monthly-income-plan-pfs7vu` only. `ad28d27` ("owner step 1 done: PR #2 merged, the colony loop verified live on main") and `bda1ee0` (heading shape the drift test accepts) never reached `main` or this branch. `logs/2026-09-22-merge-and-first-tick.md` exists only there.
- The PDF on this branch is the pre-merge one (244,888 bytes; `ad28d27` shows `Bin 244888 -> 291029 bytes`).
- Aggravating: `logs/CHECKPOINT.md:60` on this branch still says `PR #2 פתוח, לא מוזג` — the session that owns this branch does not know either.

Impact: the owner opens a merged PR, finds nothing to click, and loses trust in the document that is supposed to be exact; the summary table tells him his first step is still open.

Proposed fix (do not apply): port `ad28d27` + `bda1ee0` — heading `## צעד 1 — ✅ בוצע 22.9.2026 · למזג את PR #2 ב-GitHub (או להגיד לי "תמזג")` (this shape keeps `owner-steps.test.ts:122` passing); replace line 43 with `(מוזג ב-22.9.2026, קומיט 31cda66; ה-workflow colony רשום ורץ על main.)`; rewrite lines 46-48 in the past tense (`המיזוג העביר הכול ל-main; מאז ב-main יש 7 workflows, כולל colony`); line 52 `מאז 22.9 זה רץ כל שעה בלי אף אחד`; table row 1 `✅ בוצע 22.9`; line 3 date to the date of the fix. Regenerate the PDF.

### F2 — WRONG (doc/code drift), HIGH — Step 4's actions say "Sign in with GitHub" without saying WHICH account (line 129)

Claim: `1. פתח https://algora.io ולחץ **Sign in with GitHub** 🔍.`

Evidence: the code requires the brand machine account: `src/revenue/owner-steps.ts:154` "Done SIGNED IN AS THE BRAND MACHINE ACCOUNT (which is why it now follows step 7)"; `src/revenue/portfolio.ts:167` "Sign in to Algora AS THE BRAND MACHINE ACCOUNT and complete Stripe Connect Express onboarding…"; `research/colony-sweep/BOARD.md:199`. The owner's live report on `main` (`state/colony/REPORT.md`, "Blocked on") says the same. In the doc the requirement appears only 17 lines later, inside "התנגשות פתוחה שאתה צריך להכריע", after "מה זה עושה" and "מה יוצא לך מזה". An owner following "מה לעשות" in order signs in with whatever GitHub account his browser holds — his personal one — which creates the Algora account and the Stripe onboarding under his handle: the byline leak the board reordered the whole checklist to prevent, and not obviously reversible.

Proposed fix: line 129 → `1. **התנתק מ-GitHub והתחבר כחשבון המכונה של המותג** (זה שפתחת בצעד 7 — ראה (ב) למטה). רק אז פתח https://algora.io ולחץ **Sign in with GitHub** 🔍. אם בחרת במסלול (א) — התחבר בחשבון האישי.`

### F3 — WRONG, HIGH — The Pro tier's remaining condition is not `tax-2026.json`; it is a licence keypair and per-sale key issuing that the repo assigns to the owner (lines 6, 113-114)

Claims: line 113-114 `**הסתייגות כנה:** ל-Pro של המחשבונים יש עוד תנאי בצד שלי — קובץ שיעורי המס ל-2026 מסומן verified: false … זה אצלי, לא אצלך.`; line 6 `הם כל מה שצריך כדי שהמכונה תוכל **להתחיל** למכור ולקבל כסף`.

Evidence:
- Pro is document branding on `invoice.html` only (`products/il-biz-tools/README.md:14,191-195`). `invoice.html` is gated on `vat.json` (`verified: true`), not on `tax-2026.json`: `products/il-biz-tools/src/lib/publish-gate.js:34-35` — `'net-salary.html': ['src/config/tax-2026.json'], 'invoice.html': ['src/config/vat.json']`. `tax-2026.json` withholds `net-salary.html`, which is free.
- What actually gates Pro is `gumroad.productUrl` AND `pro.publicKey`: `src/lib/gumroad.js:50-66`; README table at `:216-224`; `site.json` `pro.publicKey: null`.
- The repo assigns both to the owner, outside the seven steps: `products/il-biz-tools/README.md:206` "**Setting it up (owner, once):** `node scripts/make-license.js init`"; `:252-258` "One-time steps only the owner can do … create the Pro product, then paste its full product URL into `gumroad.productUrl` and run `make-license.js init`"; and **per sale**: `scripts/make-license.js:2-6` "The owner runs this after a Gumroad sale … `issue <buyer>   # per sale`", README `:229`. `grep -rn make-license` finds no workflow or connector that automates issuing.
- `logs/CHECKPOINT.md:81`: "Pro נשאר מושבת עד `pro.publicKey` ו-`gumroad.productUrl` (צעד 3 של הבעלים)" — but step 3 in the doc names neither.

Impact: either the checklist is missing an owner action plus a recurring per-sale owner task (which breaks MISSION §1 "one ordered checklist … one-time"), or the product README is wrong and the agent is meant to do it. Either way the owner is told the wrong thing about what his step 3 buys.

Proposed fix (wording for the doc; the README contradiction needs its own decision): `**הסתייגות כנה:** Pro של המחשבונים (מיתוג המסמך) דורש עוד שני דברים אחרי צעד 3: מוצר Pro ב-Gumroad ומפתח חתימה לרישיונות (products/il-biz-tools/scripts/make-license.js). את שניהם אני עושה, לא אתה, והנפקת מפתח לכל מכירה תהיה אוטומטית — אם זה לא אפשרי, אגיד לך לפני שמשהו נמכר, כי זה יהיה צעד שני שלך.` And, until that is true, remove "כל מה שצריך" from line 6 or qualify it.

### F4 — STALE, MEDIUM — Agent-side work described as "being built now" is built (lines 217, 277-279)

Claims: line 217 `| APIFY_TOKEN | … | עובד ברגע שה-workflow שאני בונה עכשיו יתמזג (היום/מחר) |`; line 277 `הדירקטוריון מחליט (רץ עכשיו). ה-workflow של Apify נבנה עכשיו. מחולל PCN874 מחכה ל**מפרט הרשמי** — הוא חסום לקונטיינר שלי, ואני מוריד אותו דרך GitHub Actions`.

Evidence: `.github/workflows/apify-publish.yml` is on `origin/main` (`git ls-tree`), so `APIFY_TOKEN` works the moment it is pasted (the `publish` job then needs a `workflow_dispatch` or a push under `products/apify-il-open-data/**` — `apify-publish.yml:33-40,69`). The board ruled on 2026-09-07 (`research/colony-sweep/BOARD.md:3`). The official PCN874 spec was fetched by CI: `research/rendered/pcn874-gov-il-874-eng.meta.json` (`fetchedAt 2026-09-07T18:28:25Z`, status 200); the generator exists: `products/pcn874/src/generate.ts`, `products/README.md` row `pcn874` "validator and generator built" (311 tests). The registrar-fee page and the Algora intake filter are also built (`products/il-biz-tools/registrar-fee.html`, `src/revenue/bounties/`).

Proposed fix: line 217 → `עובד מיד (ה-workflow כבר על main); אחרי ההדבקה אני מפעיל את ההעלאה`; line 277-279 → `**צד שלי:** הדירקטוריון פסק ב-7.9. ה-workflow של Apify, מחולל PCN874 (לפי החוזר הרשמי של רשות המסים, שהורד דרך GitHub Actions), דף אגרת רשם החברות ומסנן הבאונטי — בנויים. מה שנשאר: פריסה, חיבור ובאונטי ראשון, וכולם מחכים לצעדים שלך.`

### F5 — WRONG (doc/code drift), MEDIUM — Apify sign-up omits that the username must be the brand (line 208-209)

Claim: `**טוקן Apify**: פתח https://console.apify.com, הירשם (אימייל; **בלי** אימות זהות …)`.

Evidence: `owner-steps.ts:170` "Apify sign-up with the BRAND as the username (the Store URL apify.com/<username>/… is public)"; `portfolio.ts:95` (same); `BOARD.md:201`; `BOARD.md:232` lists "Apify username" among the P0 amendments to this very document; `products/README.md` row 1 "Apify sign-up with the brand username". The preamble rule 2 (line 22) covers it only in general, and the Apify half is the one the doc tells him to do first, right after step 1. (Related, outside this doc: `products/apify-il-open-data/docs/PUBLISH.md:27` still says "Create an Apify account … in your own name".)

Proposed fix: `הירשם עם **שם המשתמש = שם המותג** (הוא מופיע בכתובת הציבורית apify.com/<שם>/…), אימייל, **בלי** אימות זהות.`

### F6 — WRONG (doc/code drift), MEDIUM — `BRAND_GITHUB_TOKEN`: the doc defers it; the code and the board put it in step 6 (lines 156-157, 187, 206, 304)

Claims: line 156-157 `בהמשך אבקש ממנו **טוקן אחד** … בשם BRAND_GITHUB_TOKEN … אגיד לך מתי, כשהקוד שצורך אותו יהיה קיים`; line 187/206 "שני טוקנים"; table line 304 "2 טוקנים".

Evidence: `owner-steps.ts:141` "Its personal access token becomes BRAND_GITHUB_TOKEN in step 6"; `:165` step 6 unlocks "BRAND_GITHUB_TOKEN lets bounty PRs leave the brand account"; `BOARD.md:201` "6b … `BRAND_GITHUB_TOKEN`"; `BOARD.md:232` "tokens table with `BRAND_GITHUB_TOKEN`". The doc's version is truer to the current code (no workflow or `process.env` reads `BRAND_GITHUB_TOKEN`; it appears only in comments, `src/revenue/bounties/intake.ts:15`, `index.ts:9`), but the two sources disagree, and deferring it means a second owner trip to GitHub settings after step 6 — the thing batching into one checklist exists to prevent. Step 6 now comes after step 7, so the machine account already exists when the owner is on the secrets page.

Proposed fix: add a third row to the table in step 6: `| BRAND_GITHUB_TOKEN | Personal access token של חשבון המכונה (מצעד 7) | נשמר עכשיו כדי שלא תצטרך לחזור; ישמש כשה-PR הראשון ייצא |`, headings "שלושה טוקנים"; or, if deferral is kept, change `owner-steps.ts:141,165` to match. One of the two must move.

### F7 — WRONG, LOW — Gumroad fee double-counts the processor fee (line 108)

Claim: `12.9% + $0.80 לכל מכירה, ועוד 2.9% + $0.30 כי מוכר ישראלי לא יכול לחבר Stripe משלו.`

Evidence: `research/colony-sweep/audits/storefronts.md:111-137` derives 12.9% + $0.80 from Gumroad's code AS the sum of 10% + $0.50 (Gumroad) and 2.9% + $0.30 (processor, charged when `charged_using_gumroad_merchant_account?`): `spec/models/preorder_spec.rb` `fee_cents eq(209) # 100c (10% flat fee) + 50c + 29c (2.9% cc fee) + 30c (fixed cc fee)`. The Israeli-specific point (`:148-153`) is that an Israeli seller always pays the rate that INCLUDES the processor fee. The doc's own next sentence proves it: at $9, 12.9% + $0.80 = $1.96 = 21.8% (the doc's "~22%"); adding another 2.9% + $0.30 would give $2.52 = 28%. Same error in `src/revenue/rails.ts:81,129` and `skills/revenue-il-biz-tools/SKILL.md:21-22`.

Proposed fix: `**העמלה:** 12.9% + $0.80 לכל מכירה — זה כבר כולל 2.9% + $0.30 של סליקה, שמוכר ישראלי תמיד משלם כי אינו יכול לחבר Stripe משלו. על מוצר של $9 זה בערך 22%; על $19 בערך 17%.`

### F8 — WRONG, LOW — Gumroad "opens three revenue lines" (lines 112, 301)

Claim: `זה פותח **שלושה קווי הכנסה**: מחולל דוח המע"מ (PCN874), שכבת ה-Pro של המחשבונים ב-il-biz-tools, ושעון הציות לרשם החברות`.

Evidence: `owner-steps.ts:116` gumroad `lines: ["il-biz-tools", "pcn874"]` (two). The registrar item is `CONDITIONAL_TARGETS` `registrar-reminder` (`portfolio.ts:350-360`): "not lines, carry no budget" (`:333-337`), and "Below [100 weekly page views] the product is not built".

Proposed fix: `זה פותח **שני קווי הכנסה**: מחולל PCN874 ו-Pro של il-biz-tools. (שעון הציות לרשם החברות הוא אופציה, לא קו — נבנה רק אם דף האגרה מגיע ל-100 צפיות בשבוע.)`; table row 3 `2 קווים, תשלום בשקלים`.

### F9 — WRONG (contradicts a board ruling), MEDIUM — The 12-month figure is given as ₪2,200 "from six lines" without the committed/conditional split (lines 284-285)

Claim: `**אחרי 12 חודשים:** התקרה המבוקרת היא **כ-₪2,200 לחודש** משישה קווים (עד ₪3,500 …)`.

Evidence: the arithmetic is right (`CHIEF-AUDIT.md:123`; `BOARD.md:127-131`). But the board ruled on exactly this sentence: `BOARD.md:257` "Amended to distinguish the ₪1,500 the portfolio now commits to from the ₪700 that is conditional, so the owner is not told a conditional number as a plan"; `portfolio.ts:16-25,328-337`. The portfolio has four lines (₪1,500); the other two are not lines, and ₪400 of the ₪700 (Devpost) depends on the owner saying yes to per-win paperwork, whose default is NO (`portfolio.ts:365-366`, `BOARD.md:350-351`) — a question this doc never asks him (F21).

Proposed fix: `**אחרי 12 חודשים:** ₪1,500 לחודש מארבעת הקווים — זה המספר שהתוכנית מתחייבת אליו. עוד ₪700 תלויים בתנאים שעוד לא קרו (₪300 אם דף אגרת הרשם יגיע ל-100 צפיות בשבוע; ₪400 רק אם תסכים לחתום על טפסים בכל זכייה ב-Devpost — ברירת המחדל: לא). עד ₪3,500 אם הגבול השנוי במחלוקת של Apify יחזיק.`

### F10 — STALE, LOW — Step 7's post-transfer checks and step 6's URL assume the old order (lines 210-211, 249-251)

Claims: line 249-250 `אחרי ההעברה, **בדוק שהסודות מצעד 6 עדיין מופיעים** … טוקן Gumroad שנעלם עוצר בשקט…`; line 251 `את חיבור Netlify אולי צריך לחבר מחדש`; line 210 the secrets URL under `zarfatinimrod-creator/automaton`.

Evidence: the ruled order is 1, 2, 3, 5, **7**, 4, **6** (`owner-steps.ts:60,137,160`; doc line 10). At step 7 only the early `APIFY_TOKEN` can exist; `GUMROAD_ACCESS_TOKEN` and the Netlify link are step 6, after the transfer. And step 6 then happens in the org's repo, not at the personal-account URL on line 210.

Proposed fix: line 249-250 → `אחרי ההעברה, אם כבר הדבקת APIFY_TOKEN — בדוק שהוא עדיין מופיע (Settings → Secrets). את שאר הסודות תדביק בצעד 6, שבא אחרי זה.`; drop line 251's Netlify sentence; line 210 → `פתח את הריפו בארגון החדש → Settings → Secrets and variables → Actions`.

### F11 — UNSUPPORTED, MEDIUM — "The form number [6101] is verified" (lines 63-64)

Claim: `הטופס הוא **טופס 6101 (דין וחשבון רב-שנתי)** … (המספר של הטופס מאומת; מיקומו באתר לא).`

Evidence: the only source in the repo is `research/colony-sweep/scouts/israel-bureaucracy--business-registration.md:30` — tagged `` `[snippet]` `` (a search snippet, not a rendered page); the same scout says the neighbouring VAT form number "could not [be confirmed] … treat as unknown". No audit or rendered file backs 6101. `grep -rn 6101` finds only that scout, the 7.9 log and this doc.

Proposed fix: `הטופס הוא כנראה **טופס 6101 (דין וחשבון רב-שנתי)** — המספר הגיע מתקציר חיפוש, לא מעמוד שנפתח; אם באתר ביטוח לאומי הוא נקרא אחרת, חפש "פתיחת תיק עצמאי".`

### F12 — UNSUPPORTED, LOW — "What they require is verified from their own sources on GitHub" (line 25)

Claim: `מה שהם **דורשים** (ת"ז, בנק, טוקן) מאומת מהמקורות שלהם עצמם ב-GitHub.`

Evidence: true for Gumroad (`antiwork/gumroad`), Algora (`algora-io/algora`) and Apify (`apify/apify-docs`). Not for the government sites in the same sentence (form 6101 is a snippet — F11), and not for the Stripe fields in step 4 (`scouts/bounties-grants--oss-bounties.md:115-117`, no Stripe source; `stripe.com` is blocked, `scouts/storefronts--gumroad.md:5`).

Proposed fix: `מה ש-Gumroad, Apify ו-Algora **דורשים** מאומת מהמקורות שלהם עצמם ב-GitHub; דרישות האתרים הממשלתיים ו-Stripe — מסיכומי חיפוש בלבד.`

### F13 — UNSUPPORTED, LOW — Paddle: "three verified reasons" (line 117)

Evidence: `src/revenue/rails.ts:136-147` Paddle `evidence: "snippet"`; source `CHIEF-AUDIT.md §3.1, §4A.2`. (`rails.ts:81` calls them "rendered", with a different three reasons — the repo disagrees with itself.)

Proposed fix: `שלוש סיבות (מסיכומי חיפוש, לא מעמודים שנפתחו): …`.

### F14 — WRONG (doc/code drift), LOW — Step 7 title and minutes, step 6 minutes (lines 189, 238, 240, 304-305)

Evidence: `owner-steps.ts:138` step 7 title "להעביר את הריפו לארגון ב-GitHub (וחשבון מכונה בשם המותג)", `minutes: [10, 15]` (doc: heading without the machine account, "10 דקות"); `:162-163` step 6 title "…להדביק את הטוקנים…", `[15, 20]` (doc: "שני טוקנים", "15 דקות"). The code's step 7 includes creating the machine account; the doc's step 7 "מה לעשות" (lines 243-251) does not, so the owner creates it only on reaching step 4's option (ב) and goes back to the org to add it. The drift test does not look at titles or minutes (`owner-steps.test.ts:121-139`), which is why this passed.

Proposed fix: step 7 heading `## צעד 7 — להעביר את הריפו לארגון ב-GitHub (וחשבון מכונה בשם המותג)`, "זמן: 10–15 דקות", and add after item 1: `1א. פתח חשבון GitHub נוסף בשם המותג (אימייל אחר) — חשבון המכונה, ראה צעד 4 (ב) — והוסף אותו כחבר בארגון.`; step 6 "זמן: 15–20 דקות"; table rows 6-7 to match.

### F15 — WRONG, LOW — "חמשת המוצרים" (line 46)

Evidence: `ls products/` → `apify-il-open-data il-biz-tools mcp-il-tools pcn874 telegram-il-tools-bot x402-il-api` (six); the merge commit's own title says "six products".

Proposed fix: `ששת המוצרים` (or name the four live lines).

### F16 — WRONG (overbroad), LOW — "Without step 7 I cannot publish anything from the repo without your name" (lines 258-259)

Evidence: the ruled order publishes the Apify Actor from this repo before step 7 (`owner-steps.ts:168-173`, earlyPart after step 1) under a brand username; `grep -rn zarfatinimrod products/` → no hits in any product manifest. The leak is the repository URL and raw links (`skills/README.md:53-58`, `MISSION.md:296-300`).

Proposed fix: `בלי הצעד הזה, כל קישור לקוד עצמו (github.com/… ו-raw.githubusercontent.com/…) נושא את שם המשתמש שלך, ולכן אני לא מפרסם אותו בשום מקום.`

### F17 — WRONG, LOW — Apify KYC arrives "only before we price" (lines 7, 265-266)

Evidence: `portfolio.ts:80` "strangerUsers30d at or above 50 → one more Actor …, and Apify KYC goes to the owner"; pricing is at 200 (`:81`); `BOARD.md:270-271`, `BOARD.md:328`.

Proposed fix: `**רק אם 50 זרים או יותר הריצו את ה-Actor ב-30 יום** (תמחור מתוכנן רק מ-200).`

### F18 — STALE, LOW — Telegram Stars listed as a possible future owner step (line 271)

Evidence: `telegram-bots` killed 2026-09-07 as a mandate collision: "Fragment's payout KYC is ID plus SELFIE" (`portfolio.ts:434-445`); `products/README.md`: `telegram-il-tools-bot` PARKED, "do not start it". Nothing can accumulate there, and the step it names is a camera step the preamble promises is absent.

Proposed fix: `**USDC**: רק אם יצטבר שם משהו (אין על זה תוכנית). Telegram Stars — סגור: התשלום דורש סלפי.`

### F19 — WRONG / UNSUPPORTED, LOW — First-shekel timing (lines 280-281)

Claims: `**הערכה שלי, לא מספר מהמחקר:** שבועות בודדים…`; `(2–5 ימים אחרי אישור — זה כן נמדד)`.

Evidence: `BOARD.md:213-215` rules this exact section amended to "first transaction id 4–10 weeks after the checklist, if a stranger finds anything at all". The 2–5 days is Algora's own bot text (`scouts/bounties-grants--oss-bounties.md:30`), documented, not measured by us.

Proposed fix: `**שקל ראשון בלדג'ר:** 4–10 שבועות אחרי שכל 7 הצעדים בוצעו (פסק הדירקטוריון), ורק אם זר מוצא משהו. באונטי: 2–5 ימים אחרי אישור — כך Algora כותבים, לא מדדנו.`

### F20 — STALE, LOW — "Two angles nobody checked" (lines 290-291)

Evidence: the English-language angle was occupancy-tested on 7.9 through the EAA wave the board ordered (`BOARD.md:288-293`) and closed: `research/measurements/eaa-occupancy.md`, `docs/REJECTED.md` "The two measurements", `logs/CHECKPOINT.md` ("EAA (#22): סגור … ≥11 חינם"). GitHub distribution is ruled YES and blocked on step 7 (`BOARD.md:294-299`).

Proposed fix: `שתי זוויות: נכס באנגלית — נבדק ב-7.9 דרך חוק הנגישות האירופי ונסגר (יש כבר ≥11 סורקים חינמיים); הפצה דרך GitHub — מאושרת, ומחכה לצעד 7.`

### F21 — WRONG, LOW — "ועוד שתי החלטות שהן שלך" (line 307)

Evidence: the doc itself carries a third (step 2's accountant / zero-rating decision, lines 82-86). `BOARD.md:346-359` lists five owner questions: Devpost paperwork, the bounty handle, Paddle, the reading of ₪200, Search Console. The Devpost one carries ₪400 of the ₪2,200 in line 284 (F9).

Proposed fix: `ועוד החלטות שהן שלך, עם ברירת מחדל שחלה עד שתגיד אחרת: Paddle (לא), המסלול ב-Algora (ב'), רו"ח/אפס-מע"מ (לא), חתימה על טפסים בכל זכייה ב-Devpost (לא), וה-₪200 כסכום חד-פעמי (כן).`

### F22 — STALE, LOW — Gumroad is "the only one we found with such proof" (line 103-104)

Evidence: Freemius was rendered on 7.9 (`research/measurements/freemius-rail.md:340-358,376-381`; `rails.ts:352-353` `evidence: "rendered"`): it pays Israel; a USD balance can be paid out converted to ILS via Wise or wire. Gumroad remains the only one with a direct `Israel | ILS` bank row.

Proposed fix: `…והוא היחיד שמצאנו עם תשלום ישיר בשקלים (Freemius משלם מיתרה בדולרים, עם המרה לשקלים דרך Wise או העברה).`

### F23 — UNSUPPORTED, LOW — "Per Apify's own documentation" the Store publish is a console click (lines 220-222)

Evidence: no rendered Apify page in `research/` states the Publication → Publish to Store path; it is asserted in `products/apify-il-open-data/docs/PUBLISH.md:41` and a workflow comment (`apify-publish.yml:180-182`), neither citing a source. The scouts cite `apify-docs/.../publishing/index.mdx` (`scouts/risk-governance--automation-tos.md:97`) but quote nothing about the button.

Proposed fix: `…להפוך אותו לציבורי בחנות זה קליק בקונסול (כך אנחנו מבינים; לא ראינו את המסך) 🔍`.

### F24 — WRONG (drift from the board), LOW — "Buy it at any registrar" (line 170)

Evidence: `BOARD.md:200` "a registrar with WHOIS privacy on by default (Cloudflare Registrar, Namecheap)"; `owner-steps.ts:128`; `portfolio.ts:130`.

Proposed fix: `קנה אותו ברשם שמסתיר את פרטי הבעלים כברירת מחדל (למשל Cloudflare Registrar או Namecheap) 🔍`.

### F25 — UNSUPPORTED, LOW — Stripe bank details "in Latin letters" (line 131)

Evidence: the Latin-letters rule is sourced for Gumroad only (`scouts/storefronts--gumroad.md:162`). The Stripe Express requirements (`scouts/bounties-grants--oss-bounties.md:115-117`) say "an Israeli bank account in the same legal name", nothing about script.

Proposed fix: drop "(אותיות לטיניות)" from step 4, or mark it 🔍.

---

## Part 3 — CORRECT claims whose checking was not obvious

- **Line 120, Gumroad forbids AI services.** `BOARD.md:198` told this doc to demote it to "our rule" as unverified. It is verified: rendered `antiwork/gumroad/app/views/home/prohibited.html.erb` (self-dated 2 Aug 2026), quoted at `scouts/storefronts--gumroad.md:81-91` and "CONFIRMED verbatim" at `groups/storefronts.md:46`. The board had not opened `groups/` (`BOARD.md:7`). Keep as written.
- **Line 289, "11 of 15 groups".** `MISSION.md:206` says "six of seven"; the current count is `CHIEF-AUDIT.md:182` "The price floor of zero hit eleven of fifteen groups", repeated at `BOARD.md:145`.
- **Lines 150-154, the GitHub machine-account clause.** The substance is rendered in the repo (`scouts/risk-governance--automation-tos.md:25-27`, from `github/docs`, 3.9). The exact `github/site-policy` wording the doc quotes is recorded only as a quote in `logs/CHECKPOINT.md:99` and `logs/2026-09-07-board-owner-guide-and-first-builds.md:28`, not stored as a rendered file. A refuter should not count this as unsupported on substance.
- **Line 109, 22% / 17%.** Right, and they prove F7: they equal 12.9% + $0.80 alone (`audits/storefronts.md:140-146`).
- **Line 250, "silently".** A missing secret is skipped without a blocker line: `heartbeat.ts:143` `if (!connector.isConfigured(env)) continue;`; a failed call returns empty (`gumroad.ts:23`).
- **Line 216, "עובד מיד".** It was not true when written (7.9, `colony.yml` not on `main`); it is true since 22.9.

## Part 4 — related defects outside this document (not graded, for whoever applies the fixes)

- `src/revenue/owner-steps.ts:25-27` says "the test parses the document to check that it has not [drifted]". The test (`owner-steps.test.ts:120-139`) checks heading numbers, the order string and one phrase. Titles, minutes, lines, tokens and done-state all drifted (F1, F6, F14) and it stays green.
- `owner-steps.ts:106` and `:132` say the watchdog raises the עוסק מורשה switch at ₪8,000 and the domain renewal 30 days out. `src/revenue/watchdog.ts` (112 lines) contains neither (`grep -n -i "renew\|8000\|8_000\|osek" src/revenue/watchdog.ts` → nothing).
- The fee double count (F7) is also in `src/revenue/rails.ts:81,129` and `skills/revenue-il-biz-tools/SKILL.md:21-22`.
- `products/apify-il-open-data/docs/PUBLISH.md:27` tells the owner to open the Apify account "in your own name" (contradicts F5's brand username) and describes a manual `apify push` that CI now does.
- `products/il-biz-tools/README.md:252-262` lists "Google Search Console verification" as an owner one-time step; `BOARD.md:282-284` rules it out of the checklist.
- `logs/CHECKPOINT.md:60` still records PR #2 as open (F1).
