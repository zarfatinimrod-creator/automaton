# Claim audit — `products/il-biz-tools/README.md`

**Audited:** 2026-09-25, against the repo only (no web). **Document:** `products/il-biz-tools/README.md` (310 lines).
**Method:** every checkable claim pulled out line by line and checked against code, config, tests, logs and the
repo's own rulings (`MISSION.md`, `docs/OWNER_STEPS.he.md`, `src/revenue/owner-steps.ts`,
`research/colony-sweep/BOARD.md`, `research/colony-sweep/CHIEF-AUDIT.md`). Nothing in the document or the product was edited.

**Commands run (all read-only, or run on a scratch copy):**

- `cp -r products/il-biz-tools $SCRATCH/ilbiz` and symlinked the repo root `node_modules`, then in the copy:
  - `./node_modules/.bin/vitest run` → `Test Files 10 passed (10)`, `Tests 120 passed (120)` (vitest 2.1.9 from the
    repo root; the product pins 4.1.11, which does not change the count).
  - `node scripts/build-site.js` → `built _site/ with: 404.html, allocation.html, assets, index.html, invoice.html,
    net-salary.html, netlify.toml, osek-patur.html, registrar-fee.html, robots.txt, sitemap.xml, src, vat.html` and
    `withheld net-salary.html: unverified source(s) src/config/tax-2026.json`. 37 files. The shipped `sitemap.xml`
    has no `net-salary.html`. `_site/src/config/registrar-fee.json` contains `1338` and `1777`;
    `_site/src/config/tax-2026.json` contains all 7 brackets.
  - `node scripts/check-html.js` → `all pages ok`, exit 0, plus `withheld from _site/: net-salary.html`.
  - Added a copy of `vat.html` as `foo.html` (not in `PAGE_RATE_SOURCES`): `check-html.js` exit **0**,
    `build-site.js` exit **1** (`refusing to build: foo.html not listed in PAGE_RATE_SOURCES`). Removed afterwards.
- `git log` (read-only). History is shallow (one commit per config file), so it could not show when the
  `verified: true` flags were set.

---

## Every claim checked (one line each)

| Line | Claim (short) | Status | Evidence |
|---|---|---|---|
| 3 | six tools | CORRECT | 6 tool pages + `index.html` + `404.html`; `src/lib/publish-gate.js:30-39` |
| 4 | no runtime dependencies | CORRECT | `package.json:13-15`: only `devDependencies.vitest` |
| 4-5 | "the build only copies files" | WRONG (LOW) | `scripts/build-site.js:67-71` writes a generated notice page; `:81-84` writes a filtered sitemap |
| 5 | deploy artifact is `_site/` | CORRECT | `netlify.toml:5`; `build-site.js:30` |
| 11-16 | page file names; free/Pro split | CORRECT | files exist; `src/lib/branding.js:1-6`; `index.html:75` |
| 14 | invoice: saved clients, per-type numbering free | CORRECT | `src/lib/invoice.js:74-77` (`type` filter); `page-invoice.js:145-153` |
| 16 | registrar page shows no shekel amounts | CORRECT | `registrar-fee.html:98`; `tests/registrar-fee.test.js:94-106` |
| 18 | "~600k Israeli self-employed" | UNSUPPORTED (LOW) | `grep -rn "600[,.]?000\|600k"`: the only hit is this README line |
| 20-21 | every tool page has title, description, canonical, FAQPage JSON-LD | CORRECT | `check-html.js:13-20`, exit 0 on 7 pages |
| 25 | Pro "one-time ₪79" | UNSUPPORTED (LOW) | no price in `site.json` or any product file; ₪79 appears only in research that quotes the Paddle-era README |
| 25 | Gumroad replaced Paddle | CORRECT | `src/lib/gumroad.js:1-9`; `tests/license-branding.test.js:161,169`; no `paddle` in code |
| 26 | Gumroad "sells in ILS (the one payment rail this repo has rendered evidence for)" | UNSUPPORTED (LOW) | the rendered evidence is for ILS **payout** (`src/revenue/owner-steps.ts:115`, `_13-getting-paid.html.erb` `Israel \| ILS`), not for the currency buyers are charged in |
| 27 | Gumroad "needs no liveness video to open" | UNSUPPORTED (LOW) | the evidence is only that none was reported: `CHIEF-AUDIT.md:248` "No liveness video is reported anywhere"; `OWNER_STEPS.he.md:98` |
| 28 | "Stripe is not available to an Israeli individual" | WRONG (LOW) | `CHIEF-AUDIT.md:200-201` (merchant NO; Connect Express YES); owner step 4 is Stripe Connect Express as an Israeli individual (`OWNER_STEPS.he.md:124-132`) |
| 30-32 | Gumroad's rules allow a file-free licence-key product | UNSUPPORTED (MEDIUM) | `scouts/storefronts--gumroad.md:91-103`, see finding F12 |
| 38 | VAT 18%, `vat.json`, "verified" | value CORRECT; label UNSUPPORTED | `vat.json:2,4`; the sources are news sites (F11) |
| 39 | Osek patur ceiling ₪122,833, "verified" | value CORRECT; label contradicted | `osek-patur.json:3,5`; `OWNER_STEPS.he.md:73-74` says no government page was opened (F11) |
| 40 | 2026 brackets 10/14/20/31/35/47/50 at 7,010…60,130, estimate | CORRECT | `tax-2026.json:12-20`, `"verified": false` |
| 40 | widened brackets approved 30.3.2026, retroactive | CORRECT (matches config) | `tax-2026.json:4` |
| 41 | credit point ₪242 | CORRECT | `tax-2026.json:21` |
| 42 | surtax 3% above ₪721,560, not modelled | CORRECT | `scouts/israel-bureaucracy--income-tax-refunds.md:26`; `net-salary.js` has no surtax |
| 43-44 | NI reduced tier 7,703, 1.04% + 3.23%; full tier to 51,910, 7% + 5.17% | CORRECT | `tax-2026.json:25-29` |
| 45 | allocation thresholds 25k→20k→10k→5k from 1.6.2026, "verified", four sources | values and sources CORRECT; label see F11 | `allocation-number.json:2,5-17` |
| 46 | registrar 1338/1777 in `registrar-fee.json`, never rendered | CORRECT (not rendered), but see F2 | `registrar-fee.json:12-13`; the page gets no amount from `feeAmountDisclosure` |
| 46 | six circulars quoted in `audits/…` §2.2 and `groups/israel-bureaucracy.md` | CORRECT (short paths) | `research/colony-sweep/audits/israel-bureaucracy.md:212-215`; `research/colony-sweep/groups/israel-bureaucracy.md:51-55` |
| 47 | reduced-rate deadline shown, with a label | CORRECT | `registrar-fee.json:6-9`; `registrar-fee.html:69,91-95` |
| 49-50 | not modelled in net salary: surtax, pension credit, special points… | CORRECT | `src/lib/net-salary.js:46-77` (pension is a deduction, not a credit) |
| 54 | "MISSION rule 4 — never publish an unverified legal figure" | UNSUPPORTED (LOW) | `MISSION.md:341-345` (rule 4) never says this; the rule is the board's (`BOARD.md:73,317`) |
| 56 | "the rule is now enforced by the build" | WRONG (MEDIUM) | F2 |
| 58 | `publish-gate.js` maps each page to its config files | CORRECT | `publish-gate.js:30-39` |
| 59-65 | withheld page not copied; notice with banner, noindex, no figure; URL dropped from sitemap | CORRECT | build run above; `publish-gate.js:83-127` |
| 67-68 | serve/tests still see the real page; one flag republishes | CORRECT (mechanism) | `build-site.js:13-15`; the standard for verifying differs, see F7 |
| 69-70 | `check-html.js` fails if an HTML page is missing from the map | WRONG (LOW) | F14: `foo.html` test, exit 0 |
| 72 | the gate withholds exactly one page: `net-salary.html` | CORRECT | build output |
| 74-80 | registrar amounts gated by `feeAmountDisclosure()`; a test checks the HTML | CORRECT | `registrar-fee.js:98-119`; `tests/registrar-fee.test.js:94-106` (reads source HTML, which the build copies unchanged) |
| 84-87 | 31 Mar deadline, 1 Apr switch, next window, days | CORRECT | `registrar-fee.js:54-78`; tests `:6-38` |
| 89-92 | corroboration and "not one primary source" are in "the same research file"; quote | WRONG (LOW) | F15 |
| 95-96 | the "חברה מפרה" status is not built | CORRECT | `registrar-fee.html:99`; `CHIEF-AUDIT.md:119` |
| 98 | reminder shown disabled, posts nowhere | CORRECT | `registrar-fee.html:120` `<fieldset disabled`; `page-registrar-fee.js:66-68`; test `:118-122` |
| 99 | board gated the paid reminder on 100 weekly views | CORRECT | `BOARD.md:75,341` |
| 103-110 | §30א(ג) refusal box; Amendment 13: what is kept, 24 months, deletion, not sold | CORRECT | `registrar-fee.html:147-149`; tests `:124-134` |
| 112 | "נוסח טיוטה, טרם נבדק משפטית" note | CORRECT | `registrar-fee.html:150` |
| 116-130 | layout: files, lib list (12), config list (6) | CORRECT | `ls` of `src/lib`, `src/config`, `assets`, `scripts` |
| 129 | `check-html.js` checks … "on every page" | WRONG (LOW) | F14: `check-html.js:7` hard-codes 7 pages; `404.html` and any new page are skipped |
| 137 | `npm install` installs vitest only | CORRECT | `package.json:13-15` |
| 138 / 310 | 120 unit tests | CORRECT | vitest run: `Tests 120 passed (120)` |
| 139-141 | check:html, build, serve on :8080 | CORRECT | `package.json:8-11`; `serve.js:7` |
| 144 | ES modules plus JSON import attributes | CORRECT | `assets/common.js:1` `with { type: 'json' }` |
| 145-146 | Chrome/Firefox/Safari on `file://` | not checked (external browser behaviour) | — |
| 150-151 | no server-side env vars; `site.json` holds public config | CORRECT | `site.json` |
| 155 | `siteUrl` is used for `<link rel=canonical>`; also edit sitemap and robots | WRONG (MEDIUM) | F8 |
| 156-161 | defaults for `productUrl`, analytics, posthog, `pro.publicKey` | CORRECT | `site.json:6,10-11,15-16,20`; `analytics.js:26,36-37`; `gumroad.js:54-64` |
| 163 | `NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID` optional | CORRECT | `OWNER_STEPS.he.md:203-204` (fallback only) |
| 169 | PostHog key empty; "no account was created" | key CORRECT; account see F13 | `site.json:15`; `BOARD.md:73,281` |
| 172-178 | PostHog options table | CORRECT | `analytics.js:38-45` |
| 181-184 | the 100-weekly-views gate; options retrieved 2026-09-07 | CORRECT | `analytics.js:7-16`; `BOARD.md:75` |
| 186-189 | cookieless server-hash toggle (🔍) | not checked (external; flagged by the doc itself) | — |
| 188-189 | no key → nothing runs, no request | CORRECT | `analytics.js:34-37,55-57`; `provider: "none"` |
| 193-197 | Pro sells only branding; client list, numbering, PDF free | CORRECT | `branding.js:1-6`; `index.html:29,75` |
| 199-204 | offline ECDSA P-256 licence via Web Crypto | CORRECT | `license.js:61-86`; `make-license.js:33,57-65` |
| 208-211 | `init` writes the gitignored `.license-key.json` and fills `pro.publicKey`; `issue <buyer>` | CORRECT (mechanics) | `make-license.js:28-45,47-68`; `.gitignore:5` |
| 206 / 257 | the owner runs `make-license.js init` | WRONG (HIGH), ownership | F5 |
| 214 | losing `.license-key.json` invalidates every key already issued | WRONG (LOW) | F16 |
| 216-224 | exactly four button states, unit-tested, `noopener` | CORRECT | `gumroad.js:49-82,91`; `tests/gumroad-analytics.test.js:34-80` |
| 226-227 | no Gumroad SDK/overlay/iframe; CSP `frame-src 'none'`, no `cdn.paddle.com` | CORRECT | `netlify.toml:19` |
| 229-233 | after each sale the owner runs `issue` and puts the key in Gumroad's content field; confirm at owner step 3 | WRONG (HIGH) | F4 |
| 235-237 | the index FAQ was corrected | CORRECT | `index.html:29,75` |
| 241 | "Add new site → Import from Git" | STALE (HIGH) | F3 |
| 242 | base `products/il-biz-tools`, build `node scripts/build-site.js`, publish `_site` | CORRECT | `netlify.toml:4-6`; `OWNER_STEPS.he.md:199-201` |
| 242-243 | the allowlist is what `netlify.toml` declares; `netlify.toml` "already declares this" | WRONG (LOW) | F17 |
| 242 | `package.json`, `README.md`, `tests/`, `scripts/` never uploaded | CORRECT for the Git build | the built `_site` has none of them |
| 244-245 | set custom domain; update `siteUrl`, `sitemap.xml`, `robots.txt`; commit | WRONG (MEDIUM) | F8 |
| 246 | submit the sitemap in Google Search Console | WRONG (MEDIUM) | F9 |
| 248-249 | CLI: `npx netlify-cli deploy --dir=products/il-biz-tools --prod` | WRONG (HIGH) | F1 |
| 254-255 | Gumroad is owner step 3; the Paddle account was never opened and is not on the list | CORRECT | `OWNER_STEPS.he.md:90,117-119`; `owner-steps.ts:109-119` |
| 255-257 | owner creates the product, pastes its URL into `gumroad.productUrl`, runs `init` | WRONG (HIGH) | F5 |
| 257-258 | needs both URL and key, otherwise "בקרוב" | CORRECT | `gumroad.js:54-74` |
| 259-260 | fallback: swap the one `openProCheckout` call | WRONG (LOW) | F18 |
| 261 | owner step: "Netlify account + domain purchase (or use the free subdomain)" | STALE/WRONG (MEDIUM) | F10 |
| 262 | owner step: Google Search Console verification | WRONG (MEDIUM) | F9 |
| 263 | optional owner step: Plausible or PostHog | WRONG (MEDIUM) | F13 |
| 264-265 | tax registration is the owner's | CORRECT | `OWNER_STEPS.he.md:56-74` (step 2) |
| 266-267 | owner confirms the brackets and flips `verified`; "Nobody here may flip it" | WRONG (HIGH) | F6 |
| 268-270 | owner opens the registrar primary source and flips both flags | WRONG (MEDIUM) | F7 |
| 273-274 | a page whose figures are unverified is not published at all | CORRECT for pages | see F2 for the JSON |
| 275 | no personal data collected; data stays in `localStorage` | CORRECT | `page-invoice.js:12,160-170`; analytics off |
| 276-278 | reminder form disabled; legal copy flagged | CORRECT | as at lines 98 and 112 |
| 285 | (Hebrew) "ה-build רק מעתיק קבצים" | WRONG (LOW) | as at lines 4-5 |
| 287-301 | (Hebrew) tool summaries: 18%, 122,833, 85% band, projection, 242, 7,703/51,910, allocation by amount/date/client type, registrar | CORRECT | `vat.json`, `osek-patur.json:4`, `osek-patur.js:34-44`, `tax-2026.json`, `allocation.js:60-80` |
| 303-305 | (Hebrew) gate: one flag once the booklet confirms it | CORRECT (mechanism); standard see F6 | — |
| 307-308 | (Hebrew) owner-only: Gumroad store + product + URL, Netlify account and domain, Search Console | WRONG (MEDIUM) | F5, F9, F10 |

---

## Findings in detail (every non-CORRECT claim, plus the non-obvious ones)

### F1 — The CLI deploy command publishes the source tree and bypasses the unverified-rate gate — WRONG, HIGH (line 248)

**Claim:** `CLI alternative: npx netlify-cli deploy --dir=products/il-biz-tools --prod`

**Evidence:**
- `--dir=products/il-biz-tools` is the **source** directory. It contains the real `net-salary.html`, whose
  figures come from the unverified `tax-2026.json`. It also contains `README.md`, `package.json`, `package-lock.json`,
  `tests/`, `scripts/` (including `make-license.js`) and the unfiltered `sitemap.xml` that still lists
  `net-salary.html` (`sitemap.xml:6`). `ls products/il-biz-tools/` shows all of these.
- The gate only runs in `scripts/build-site.js`, which writes `_site/` (`build-site.js:30,60-84`). A deploy pointed
  at the source directory never goes through it.
- The repo's own comments give the reason for `_site`: `netlify.toml:1-2` ("Publish an explicit allowlist rather
  than the whole folder, so package.json, README.md, tests/ and scripts/ are never uploaded") and
  `build-site.js:4-6` ("Netlify publishing "." served package.json, README.md, tests/ and scripts/ to anyone").
- The README itself says two lines earlier (line 242) that the publish directory is `_site`.

**Impact:** anyone who follows this line publishes the page the board ordered kept off the site
(`BOARD.md:73`, "keep every page that depends on `tax-2026.json` unpublished"), which breaks MISSION rule 4, and
leaks the dev files.

**Proposed fix:** "CLI alternative (from `products/il-biz-tools`): `node scripts/build-site.js && npx netlify-cli
deploy --dir=_site --prod` (needs `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID`). Never point `--dir` at the product
folder itself: that skips the unverified-rate gate and uploads the dev files."

### F2 — "The rule is now enforced by the build" — WRONG, MEDIUM (line 56; context lines 46, 92-93, 273-274)

**Claim:** "MISSION rule 4 — never publish an unverified legal figure — … It is not, so the rule is now enforced by the build."

**Evidence:**
- `build-site.js:32` copies `src/config` into `_site` whole (`DIRS = ['assets', 'src/lib', 'src/config']`). The
  scratch build ships `_site/src/config/tax-2026.json`, with all 7 unverified brackets and the NI rates, and
  `_site/src/config/registrar-fee.json`, with `"reducedIls": 1338` and `"fullIls": 1777`.
- `assets/page-registrar-fee.js:7` does `fetch('src/config/registrar-fee.json')` on every visit. So every visitor's
  browser downloads both unverified amounts. They are not rendered, but they are public at
  `/src/config/registrar-fee.json`.
- `netlify.toml:26-29` even sets a cache header for `/src/*`, so the path is served on purpose.

The gate keeps unverified figures off **rendered pages**. It does not stop publishing them. Lines 46 ("never
rendered") and 273-274 ("a page … is not published") are literally true. Line 56's "the rule is now enforced"
overstates it.

**Proposed fix:** "The build enforces it for rendered pages: a page that renders an unverified figure is not
published. The config files themselves still ship under `/src/config/` (the registrar page fetches its JSON at
runtime), so the unverified amounts and brackets are reachable by URL, though no page shows them." Or change the
build so it does not copy unverified configs that no published page needs.

### F3 — Deploy step 1 would create a second Netlify site — STALE, HIGH (line 241)

**Claim:** "Push the repo. In Netlify: *Add new site → Import from Git*, pick the repo."

**Evidence:**
- `logs/2026-09-03-first-products.md:18` says the owner's Netlify account already exists (team `zarfatinimrod`),
  and a project `il-biz-tools` (`il-biz-tools.netlify.app`) was created. Line 23 of the same log gives site id
  `2087c2ed-5270-4407-8746-675d6ea41d5e`.
- `logs/CHECKPOINT.md:220-221`: the connector's `get-project` returns `il-biz-tools`, and the current deploy is
  empty. `logs/CHECKPOINT.md:687` says the same.
- `docs/OWNER_STEPS.he.md:195-196` (step 6): "there is already a site named `il-biz-tools` … click it → **Link
  repository**". It gives "Add new site" only as the fallback if no site exists.
- `siteUrl`, every canonical tag and `sitemap.xml` point at `il-biz-tools.netlify.app`. A second site cannot take
  that subdomain, so the new site would get another name while every canonical points at the empty original.

**Proposed fix:** "1. In Netlify, open the existing site `il-biz-tools` (id `2087c2ed-…`) → build & deploy
settings → *Link repository* → `automaton`, branch `main`. Use *Add new site → Import an existing project* only if
that site is gone (see owner step 6 in `docs/OWNER_STEPS.he.md`)."

### F4 — Per-sale key issuance is written as an owner action — WRONG, HIGH (lines 229-233; also 211)

**Claim:** "After a sale the owner runs `make-license.js issue <sale id>` and puts the resulting key where Gumroad
delivers it to the buyer — the product's content / licence field … confirm it at owner step 3."

**Evidence:**
- This is a **recurring, per-sale** owner task. `MISSION.md:318-327` (rule 1) says every unavoidable owner step goes
  into one ordered checklist, `docs/OWNER_STEPS.he.md`, and that "The owner does not talk to customers." The
  checklist has no per-sale step. Its step 3 (`OWNER_STEPS.he.md:94-100`) ends at minting the access token.
  `src/revenue/owner-steps.ts:109-120` has no licence issuance either.
- The repo's own Gumroad research says issuance can be automated. `research/colony-sweep/scouts/storefronts--gumroad.md:111-119`
  (from Gumroad's `routes.rb`): API v2 covers sales `index/show`, `licenses` verify/rotate and webhooks, and "A
  software agent can create, price, publish, discount and fulfil products." `OWNER_STEPS.he.md:216`: once
  `GUMROAD_ACCESS_TOKEN` is set, "the loop reads sales from Gumroad every hour."
- The delivery path does not hold together as written. The key is minted **after** the sale with the sale id as its
  subject (`make-license.js:59`), but a product's content is fixed before the sale and is the same for every buyer.
  A per-sale key cannot sit in a per-product field. The README flags the Gumroad screen as unverified 🔍 but
  presents the owner's part as the plan.
- "confirm it at owner step 3": owner step 3 has no such check (`OWNER_STEPS.he.md:94-100`).

**Proposed fix:** "Licence delivery is an open design gap, and it is not an owner step. Keys must be issued without
the owner, for example by a CI job that reads new sales with `GUMROAD_ACCESS_TOKEN` and signs them with a private
key held as a GitHub secret, or by switching to Gumroad-issued licence keys. Until that exists, Pro should not go on
sale even once the URL and public key are set."

### F5 — One-time Gumroad/licence setup puts steps on the owner that the checklist does not have — WRONG, HIGH (lines 206, 255-257, 307-308)

**Claim:** "create the Pro product, then paste its full product URL into `gumroad.productUrl` and run
`make-license.js init`". Also "Setting it up (owner, once)", and the Hebrew "יצירת המוצר והדבקת כתובתו".

**Evidence:**
- Owner step 3 in the canonical checklist is: sign up under the brand name, payout settings, ID verification, mint
  an access token (`docs/OWNER_STEPS.he.md:94-100`). It has no product creation, no config edit and no
  `make-license.js`. `MISSION.md:322-323`: the checklist is the one list, and "Never invent a step that isn't
  required."
- Product creation is agent-doable with the access token: `storefronts--gumroad.md:111-116` ("full CRUD on
  products … A software agent can create, price, publish").
- Pasting a URL into `src/config/site.json` is a repo edit, which is agent work.
- `make-license.js init` needs a local clone, Node ≥ 22 (`package.json:17`), running a script, and committing
  `site.json` ("commit that one", `make-license.js:43`). None of that is in the checklist, and the checklist
  assumes the owner does no git work beyond merging a PR (step 1).
- `logs/CHECKPOINT.md:81` ties both `pro.publicKey` and `gumroad.productUrl` to "owner step 3". That is one more
  mismatch with `OWNER_STEPS.he.md`, not support for this line.

**Proposed fix:** "1. **Gumroad** (owner step 3 in `docs/OWNER_STEPS.he.md`): open the store under the brand name,
complete identity and payout details, and mint the access token, exactly as that step says. Creating the Pro product,
filling `gumroad.productUrl`, and generating the licence keypair are agent-side (see the licence-delivery gap under
*The Pro tier*). Until the URL and the public key both exist, the Pro box stays on **בקרוב**."

### F6 — Tax-bracket verification is placed on the owner, against the board and the checklist — WRONG, HIGH (lines 266-267; see also 67-68, 303-305)

**Claim:** "**Before `net-salary.html` can be published at all:** confirm the 2026 brackets and NI rates against the
Tax Authority booklet and flip `verified` in `tax-2026.json`. Nobody here may flip it."

**Evidence:**
- `docs/OWNER_STEPS.he.md:112-114` (step 3), to the owner: "קובץ שיעורי המס ל-2026 מסומן `verified: false`, ואסור
  לי לפרסם שיעורים לא מאומתים. **זה אצלי, לא אצלך.**" ("it's on me, not on you").
- The board's order, `research/colony-sweep/BOARD.md:73`: keep dependent pages unpublished "until its rates are
  confirmed against two independent GitHub-hosted implementations and `verified` flips to true". The same wording is
  at `BOARD.md:317` and `src/revenue/portfolio.ts:109`. That is an agent task with an agent-reachable standard.
  It does not use the Tax Authority booklet and it does not involve the owner.
- "Nobody here may flip it" has no source anywhere in the repo (`grep -rn "Nobody here may"` finds only this line).

**Impact:** the owner reads one document telling him to check tax tables himself, while the checklist says it is
the agent's job. Each side can wait on the other, and the page is never published.

**Proposed fix:** remove it from the owner list. Under *The unverified-rate gate*: "`net-salary.html` is published
once `tax-2026.json`'s brackets and NI rates are confirmed against two independent GitHub-hosted implementations
(board order, `BOARD.md` §4 build #4), and then `verified` is set to true. That is agent work, not an owner step."

### F7 — Registrar primary-source verification is placed on the owner — WRONG, MEDIUM (lines 268-270)

**Claim:** owner step 7: "open the primary source (תקנות החברות (אגרות) / רשות התאגידים), correct the amounts in
`registrar-fee.json`, and set both `verified` and `renderAmounts` to true."

**Evidence:**
- The step is not in `docs/OWNER_STEPS.he.md` or `src/revenue/owner-steps.ts`.
- The research this README cites says who can do it: `research/colony-sweep/groups/israel-bureaucracy.md:54-55`,
  "must first have a **human or unblocked agent** open the primary source."
- The repo has an agent path to gov.il. `research/rendered/pcn874-gov-il-874-eng.meta.json` shows a gov.il PDF
  fetched by `.github/workflows/render-watch.yml` with `"status": 200`, and `research/rendered/README.md` describes
  that path.
- Editing JSON flags is repo work.

**Proposed fix:** move it out of "only the owner can do": "Before any shekel amount appears on
`registrar-fee.html`, an agent renders the primary source through `render-watch` (add the URL to
`research/rendered/urls.txt` with its citation), corrects the amounts and sets both flags. Not an owner step."

### F8 — Changing the domain needs more than `siteUrl`, `sitemap.xml` and `robots.txt` — WRONG, MEDIUM (lines 155, 244-245)

**Claim (155):** "`siteUrl` | Canonical origin, used for `<link rel=canonical>`; also edit `sitemap.xml` and `robots.txt`".
**Claim (244-245):** "set the custom domain and update `siteUrl` in `src/config/site.json`, `sitemap.xml` and
`robots.txt` to the real domain; commit."

**Evidence:**
- Every page hard-codes the canonical in static HTML. `grep -n "netlify.app" *.html` finds
  `allocation.html:8`, `index.html:8`, `index.html:20` (JSON-LD `"url"`), `invoice.html:8`, `net-salary.html:8`,
  `osek-patur.html:8`, `registrar-fee.html:8`, `vat.html:8`.
- `siteUrl` only rewrites the canonical at runtime in JavaScript (`assets/common.js:17-21`). The HTML that
  crawlers get, and the JSON-LD, keep `il-biz-tools.netlify.app`.
- The actor is also wrong. `OWNER_STEPS.he.md:171` (step 5) tells the owner **not** to configure anything after
  buying the domain ("אל תגדיר כלום … ואני אשלח 2–3 שורות (רשומות DNS)"). The file edits and the commit are agent
  work.

**Proposed fix (155):** "Canonical origin. JS overwrites the canonical at runtime, but the static
`<link rel=canonical>` in all 7 pages and the `url` in `index.html`'s JSON-LD are hard-coded, so change those
too, along with `sitemap.xml` and `robots.txt`." **(244-245):** "After the owner buys the domain (owner step 5), an
agent sends the DNS records and replaces `il-biz-tools.netlify.app` everywhere: `site.json`, the 7 canonical tags,
the `index.html` JSON-LD, `sitemap.xml`, `robots.txt`."

### F9 — Google Search Console is listed as an owner step; the board ruled it is not — WRONG, MEDIUM (lines 246, 262, 307-308)

**Claim:** deploy step 4, "Submit `https://<domain>/sitemap.xml` in Google Search Console". Owner step 3, "**Google
Search Console** verification for the domain". The Hebrew list includes "אימות ב-Google Search Console".

**Evidence:**
- `research/colony-sweep/CHIEF-AUDIT.md:297-298` lists it under "Removed from catalogues … invented, unverified":
  "Google Search Console verification (not a legal identity step; agent-doable by committing a file)".
- `research/colony-sweep/BOARD.md:278-284` (§6.3): page views come from PostHog now; the GSC property is optional,
  and the export "asked for only after `il-biz-tools` shows 100 weekly views. **Not a checklist step.**"
  `BOARD.md:358-359`: "Search Console. Two minutes in his own Google account, optional, asked for only after the
  site shows traffic."
- `docs/OWNER_STEPS.he.md` has no Search Console step.

**Proposed fix:** drop owner step 3, and change deploy step 4 to: "Search Console is optional and deferred (board
§6.3): only if the owner chooses to add the property, and only after the site shows 100 weekly views. It is not on
the checklist."

### F10 — "Netlify account + domain purchase (or use the free subdomain)" — STALE/WRONG, MEDIUM (line 261; Hebrew 307-308)

**Evidence:**
- The Netlify account and the `il-biz-tools` site already exist (`logs/2026-09-03-first-products.md:18,23`). The
  owner's remaining Netlify action is *Link repository*, in owner step 6 (`OWNER_STEPS.he.md:187-204`).
- The domain is owner step 5, with the board's ruling: `.com` plus WHOIS privacy (`OWNER_STEPS.he.md:162-171`;
  `owner-steps.ts:128`).
- The free subdomain is not an equivalent. `owner-steps.ts:128`: without a domain "every site URL stays
  *.netlify.app, and no line that depends on search exists." `BOARD.md:100`: "three preconditions (deploy, domain,
  one SERP read) before any SEO hour".

**Proposed fix:** "2. **Domain** (owner step 5): buy one `.com` with WHOIS privacy and configure nothing; the agent
sends the DNS records. **Netlify** (owner step 6): link the repo to the existing `il-biz-tools` site. The account
already exists. The free `*.netlify.app` URL is not a substitute: the SEO line needs the domain."

### F11 — "verified" status for VAT, the osek patur ceiling and allocation thresholds — UNSUPPORTED/contradicted, MEDIUM (lines 38, 39, 45)

**Claim:** the "Status" column says **verified** for VAT 18%, the ₪122,833 ceiling and the allocation thresholds.

**Evidence:**
- Their sources in config are secondary: `vat.json:5` (ynet), `osek-patur.json:6` (kolzchut), and
  `allocation-number.json:6-10` (a gov.il department **home page** plus the Chamber of Commerce, Grant Thornton,
  Green Invoice and iCount). No record in the repo says a primary source was opened for any of them.
- The owner checklist says so for the ceiling: `docs/OWNER_STEPS.he.md:73-74`, "(הנתון ל-2026 כפי שמופיע במקורות
  שלנו; **אף עמוד ממשלתי לא נפתח מכאן**, אז תאמת אותו במסך של רשות המסים)".
- The research's own standard, `groups/israel-bureaucracy.md:51-55`, applies to "every legal number in this report —
  including the ones I marked CONFIRMED": they rest on snippets, and a page shipping them needs the primary source
  opened. `groups/israel-bureaucracy.md:45` also records `kolzchut.org.il` as egress-blocked.
- The same README treats **six** CPA circulars as not enough for the registrar amounts (line 46,
  "unverified — not published"), but treats four secondary sources as enough for allocation thresholds. The gate
  (`publish-gate.js:42-44`) trusts the flag, so these pages go live on the strength of this label.

**Proposed fix:** "verified (secondary sources only; no primary government page was opened; see
`docs/OWNER_STEPS.he.md` step 2)". Or re-grade them to the gate's standard and record how each was checked.

### F12 — Gumroad's rules and a file-free licence key — UNSUPPORTED, MEDIUM (lines 30-32)

**Claim:** "Gumroad's rules allow a downloadable/licence product, which is exactly what Pro is: a file-free licence
key that unlocks branding in the buyer's own browser."

**Evidence:** the only rendered reading of Gumroad's rules in the repo (`research/colony-sweep/scouts/storefronts--gumroad.md:81-103`,
from `prohibited.html.erb`, "Last revised: August 2, 2026") lists as prohibited "Services fulfilled outside
Gumroad" and "products with no content attached that direct buyers to contact you on external platforms". It
concludes: "Gumroad only works for **self-contained files/courses/memberships delivered on Gumroad**." The only
licence-key pattern it describes is "a **downloadable tool** behind **Gumroad-issued license keys**" (`:118-119`).
A file-free key that unlocks a feature on our own website is not shown to be allowed. The board chose Gumroad for
the rail (`BOARD.md:73`), not for this product form.

**Proposed fix:** "Whether Gumroad accepts a file-free licence key for a feature on an external site is unverified.
The rendered prohibited-products page allows self-contained products delivered on Gumroad and prohibits
content-less products and services fulfilled elsewhere. Check this before listing, for example by attaching a real
file (a branded template pack) with the key."

### F13 — PostHog framed as an optional owner step — WRONG, MEDIUM (lines 169, 263)

**Claim:** "`posthog.projectKey` is empty in the repo and **no account was created**" (169). "Optional: Plausible,
or PostHog (`posthog.projectKey` + the cookieless server-hash-mode toggle)" as an owner step (263).

**Evidence:** `research/colony-sweep/BOARD.md:73` says page views come "from the PostHog connector attached to this
session", and `BOARD.md:280-282` says "page views now, from the PostHog connector attached to this session
(cookieless mode, no PII, Amendment-13 safe), written weekly as KPIs." The board made page-view measurement
agent-side and non-optional, because the 100-weekly-views gate for the registrar reminder (`BOARD.md:75,341`)
depends on it. `OWNER_STEPS.he.md` has no PostHog step. The empty key is true (`site.json:15`). "No account was
created" is at odds with a connector being attached. That is not proven wrong from the repo alone, since the
connector may be the operator's existing account.

**Proposed fix (263):** "PostHog page views are agent-side (board §6.3: the PostHog connector attached to the
session). Plausible stays optional. Neither is an owner step." **(169):** "`posthog.projectKey` is empty in the
repo; the board expects the key from the PostHog connector attached to the session."

### F14 — `check-html.js` does not check every page, and does not catch an unregistered one — WRONG, LOW (lines 69-70, 129)

**Evidence:** `scripts/check-html.js:7` hard-codes 7 pages. Only `[...pages, '404.html']` is checked against the map
(`:57-59`). On a scratch copy with an added `foo.html`, `node scripts/check-html.js` exited **0** (`all pages ok`)
and `node scripts/build-site.js` exited **1**. The build (`build-site.js:35-47`) and the test
`tests/publish-gate.test.js:71-74` do read the directory, so the gap is caught elsewhere, but not by
`check-html.js`. `404.html` gets none of the title/description/canonical/class checks.

**Proposed fix:** "`node scripts/check-html.js` prints the same verdict for its fixed list of 7 pages plus `404.html`.
The build (`build-site.js`) and `tests/publish-gate.test.js` are what refuse an HTML page missing from the map."

### F15 — Research attribution and quote — WRONG, LOW (lines 89-92)

**Evidence:** the six-circular corroboration is in `research/colony-sweep/audits/israel-bureaucracy.md:212-215`. The
"not one primary source" sentence is in a different file, `research/colony-sweep/groups/israel-bureaucracy.md:51-54`,
so "the same research file" is wrong. The quotation is also paraphrased. The source reads "That is enough to
*decide where to build*; it is **not** enough to *publish to users as guidance*." And it says "rendered by any of the
nine agents in this group", not "ever opened".

**Proposed fix:** "…across six independent accountancy circulars (`audits/israel-bureaucracy.md` §2.2), and the
group report (`groups/israel-bureaucracy.md`) states that not one primary source was rendered by any agent in that
group: 'That is enough to decide where to build; it is not enough to publish to users as guidance.'"

### F16 — Losing the private key — WRONG, LOW (line 214)

**Claim:** "Losing `.license-key.json` invalidates every key already issued."

**Evidence:** verification uses only the public key in `site.json` (`license.js:61-85`). The private file is read
only by `issue` (`make-license.js:52-57`). Losing it stops **new** keys from being issued. Existing keys stop
verifying only when `init` is run again, because that overwrites `pro.publicKey` (`make-license.js:38-40`). That is
still the only way to resume selling, so the backup advice stands.

**Proposed fix:** "Losing `.license-key.json` means no new key can ever be issued. Re-running `init` to recover
replaces the public key, and every key already issued stops working. Back it up."

### F17 — Where the allowlist lives — WRONG, LOW (lines 242-243)

**Evidence:** `netlify.toml:4-6` declares only `publish = "_site"` and `command`, with no `base`. The allowlist is in
`scripts/build-site.js:32-35` (`DIRS`, `FILES`, and the `.html` pages). The base directory has to be set in the UI.

**Proposed fix:** "…Publish directory: `_site`, written by `build-site.js` from an explicit allowlist, so
`package.json`, `README.md`, `tests/` and `scripts/` are never uploaded. `netlify.toml` declares the build command,
the publish directory, headers/CSP and redirects. The base directory is set in the Netlify UI."

### F18 — The Gumroad fallback is more than one swapped call — WRONG, LOW (lines 259-260)

**Evidence:** there is exactly one call (`assets/page-invoice.js:251`). But the click handler is attached only when
`proButtonState(site).enabled` (`page-invoice.js:243-256`), which needs a valid https `gumroad.productUrl` and a
public key (`gumroad.js:49-74`). The "ready" note names Gumroad ("התשלום מתבצע ב-Gumroad", `gumroad.js:80`), and
`page-invoice.js:261` tells buyers to look for their key "ב-Gumroad". Swapping the call alone leaves the button disabled.

**Proposed fix:** "Fallbacks if Gumroad refuses: PayPal Business or Payoneer Checkout. Changing rails means
`proButtonState`/`openProCheckout` in `src/lib/gumroad.js`, the config key, and the Gumroad wording in
`gumroad.js` and `page-invoice.js`, not one call."

### F19 — Lower-grade wording (LOW, one line each)

- **Line 18**, "~600k Israeli self-employed": only this README says it (grep). Fix: drop the number or cite it.
- **Line 25**, "one-time ₪79": no price is configured anywhere; ₪79 dates from the Paddle-era README
  (`scouts/content-seo--converter-utility-sites.md:26`). Fix: "suggested price ₪79 (not configured; set when the
  product is created)".
- **Line 26**, "sells in ILS": the rendered evidence is ILS **payout** (`owner-steps.ts:115`). Fix: "pays out in ILS
  to an Israeli bank".
- **Line 27**, "needs no liveness video": the evidence is "not reported" (`CHIEF-AUDIT.md:248`). Fix: "no liveness
  video is reported in any source".
- **Line 28**, "Stripe is not available to an Israeli individual": Stripe Connect Express is owner step 4
  (`OWNER_STEPS.he.md:124-132`; `CHIEF-AUDIT.md:200-201`). Fix: "Stripe as a direct merchant account is not
  available to an Israeli individual".
- **Line 54**, "MISSION rule 4 — never publish an unverified legal figure": `MISSION.md:341-345` does not say this;
  the order is `BOARD.md:73,317`. Fix: "MISSION rule 4 (honest value), as applied by the board: a page whose rates
  are unverified is not published".
- **Lines 4-5 / 285**, "the build only copies files": `build-site.js:67-71,81-84` generates the withheld notice and
  a filtered sitemap. Fix: "the build copies an allowlist, swaps withheld pages for a notice, and filters the
  sitemap".

---

**Counts:** 96 claims checked. CORRECT: 66 (including 4 that are value-correct but label-flagged under F11/F13,
and 3 external claims left unchecked). Non-CORRECT: 30, in findings F1–F19. HIGH: F1, F3, F4, F5, F6. MEDIUM: F2,
F7, F8, F9, F10, F11, F12, F13.
