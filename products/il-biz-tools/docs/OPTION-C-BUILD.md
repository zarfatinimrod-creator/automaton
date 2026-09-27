# Option C build report — Gumroad-native Pro licences

**Date:** 2026-09-27 · **Builder:** Opus · **Decision built:** `research/measurements/gumroad-license-decision.md`
(Fable, Option C) and its structured form (18 acceptance tests, owner-step changes, buyer disclosure).
**Status in one line:** everything that can run offline is built and green; AT-15 and AT-16 are written and
wait on the owner's `GUMROAD_ACCESS_TOKEN`; AT-17's line stays "not yet" until the first real sale.

## What was built

| Piece | File | What changed |
|---|---|---|
| Verifier, classifier, storage, throttle, controller | `src/lib/license.js` | Rewritten. The ECDSA path is gone. `VERIFY_URL` (api host), `normalizeKey`, `isGumroadKeyShaped`, `classifyVerifyResponse`, `verifyWithGumroad` (form-encoded simple POST, `credentials: 'omit'`, 8 s timeout, returns only `{verdict, reason, uses}`), `readLicenseRecord` / `writeLicenseRecord` (whitelisted fields only), `shouldRecheck` (7 days), and `createLicenseController` — the page's whole licence behaviour without the DOM. |
| Page glue | `assets/page-invoice.js` | The Pro block now only wires `createLicenseController` to the DOM. `let proActive` … `// --- init` still contains neither `renderClients` nor `nextDocumentNumber`. |
| Button states | `src/lib/gumroad.js` | `gumroadProductId()`; `proButtonState` needs URL **and** product id; `no_public_key` → `no_product_id`; new `ready` note; header per §5. |
| Config | `src/config/site.json` | `gumroad.productId: ""` added, `pro` block removed, comments per §5. |
| CSP | `netlify.toml` | `connect-src` gains `https://api.gumroad.com`; `script-src` and `frame-src 'none'` unchanged. |
| Copy | `invoice.html`, `index.html` | §6 visible line under the key input; full §6 text in `<details id="pro-privacy">` "מה נשלח לאן"; placeholder `XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX`; FAQ answers per §5 (both copies on the home page). |
| Retired | `scripts/make-license.js` | Deleted. No stored value of the old signed format survives a page load. |
| Product-creation job | `scripts/gumroad-pro-product.js`, `.github/workflows/gumroad-pro-product.yml` | `create` (reuse by name or POST as draft with `rich_content` + `licenseKey` node, read back, print id/short_url, PR into `site.json`) and `enable` (only when the deployed `site.json` carries the id). `workflow_dispatch` only. |
| Live probe | `.github/workflows/gumroad-pro-probe.yml` | Sibling of `gumroad-cors-probe.yml` for AT-16, reading the real id and origin from `site.json`. |
| README | `README.md` | Pro section rewritten for Option C, env table, layout, owner item 1, Hebrew section, test count, the AT-17 line. |
| Owner checklist | `docs/OWNER_STEPS.he.md`, `docs/OWNER_STEPS.he.pdf`, `src/revenue/owner-steps.ts` | Exactly the four `ownerStepChanges`; PDF regenerated. No step added or removed. |
| Tests | `tests/license.test.js`, `tests/page-invoice.test.js`, `tests/gumroad-pro-product.test.js`, `tests/option-c-site.test.js`, `tests/fixtures/gumroad-verify.js`; edited `tests/license-branding.test.js`, `tests/gumroad-analytics.test.js` | See below. |

## Acceptance tests, one by one

| AT | Status | Where |
|---|---|---|
| AT-1 key shape gate | **pass** | `license.test.js` "AT-1"; page-level: `page-invoice.test.js` "a key that is not shaped" |
| AT-2 request shape | **pass** | `license.test.js` "AT-2" (one call, exact URL, host `api.gumroad.com` not `gumroad.com`, `URLSearchParams` body, `increment_uses_count=false` only when asked, `credentials:'omit'`, `AbortSignal`, no headers, 8000 ms) |
| AT-3 classifier, success payloads | **pass** | `license.test.js` "AT-3"; the `_76-license-keys.html.erb` payload is pasted verbatim in `tests/fixtures/gumroad-verify.js` (its inline `# …` comments are stripped only at parse time) |
| AT-4 classifier, definitive 404s | **pass** | `license.test.js` "AT-4", including the live 25.9 body verbatim |
| AT-5 non-definitive | **pass** | `license.test.js` "AT-5", table of all ten rows through `verifyWithGumroad` |
| AT-6 cached Pro survives | **pass** | `page-invoice.test.js` "AT-6": the real page, Pro on synchronously before the (deferred) fetch settles, then each of the ten AT-5 outcomes → still on, `status` active, `lastCheckAt` unchanged, note empty; refund / disabled / dispute → off, record gone, reason named |
| AT-7 throttle and stored product id | **pass** | `page-invoice.test.js` "AT-7"; `RECHECK_INTERVAL_MS` in `license.test.js` |
| AT-8 activation | **pass** | `page-invoice.test.js` "AT-8" (incl. pending retried on the next load with no press, and "הסרת הרישיון" with zero requests) |
| AT-9 privacy | **pass** | `license.test.js` "AT-9": exact stored keys, none of the eight leak strings in any storage value, console spies, verifier returns three keys |
| AT-10 legacy and retirement | **pass** | `page-invoice.test.js` "AT-10"; `option-c-site.test.js` "AT-10" (the whole product tree scanned for the old prefix, `make-license.js` absent, no `pro` key); build copies no key file ("AT-18") |
| AT-11 button states | **pass** | `gumroad-analytics.test.js` "pro button states"; `license-branding.test.js` keeps the `proButtonState(site)` / `proCta.disabled = !proState.enabled` check |
| AT-12 CSP | **pass** | `option-c-site.test.js` "AT-12" parses `netlify.toml` |
| AT-13 copy | **pass** | `option-c-site.test.js` "AT-13" (line beside `#license-key` with no `hidden` ancestor, full text equals §6 after tag stripping, placeholder, both home-page copies, old invoice sentence gone, `check-html.js` run) |
| AT-14 honesty test preserved | **pass** | `license-branding.test.js` "keeps the previously free features free" — byte-identical to before |
| AT-15 product-creation job, live | **not runnable yet** | Needs `GUMROAD_ACCESS_TOKEN` (owner step 3 → 6). Written and tested offline (`gumroad-pro-product.test.js`, 17 tests: draft, idempotent reuse, pagination, ambiguity stop, refusal stop naming the one-click fallback, missing-node stop, Bearer-only token never logged, enable refused until the deployed id matches). Without the secret the job and the script print a notice and exit 0 (dry-run locally). Not run, as instructed. |
| AT-16 live probe | **not runnable yet** | Needs a real product id in `site.json`, which only AT-15 produces. `gumroad-pro-probe.yml` prints a notice and exits 0 while the id is empty (dry-run locally). Not run. |
| AT-17 language gate | **pass (gate in place)** | README carries "First real key verified: not yet — the first sale is the test"; `option-c-site.test.js` greps for it and for any "working" / "verified end-to-end" claim in the README and pages. The line changes only with a `gumroad:<productId>` ledger sale plus a follow-up note in the decision file. |
| AT-18 suite | **pass** | `npm test` 217/217, count written in the README (both places); `check-html.js` green; `build-site.js` writes `_site/invoice.html` with the §6 text (asserted in `option-c-site.test.js`) |

## Test counts

Before: 120 tests in 10 files. After: **217 tests in 14 files, all passing** (`npx vitest run`, 27.9.2026).
New: `license.test.js` 43, `page-invoice.test.js` 26, `gumroad-pro-product.test.js` 17, `option-c-site.test.js` 15.
Changed: `gumroad-analytics.test.js` 15 → 18; `license-branding.test.js` 14 → 7 (the seven ECDSA tests went with
the ECDSA code). Seven deliberate mutations of `license.js` / `page-invoice.js` (429 revokes; the page never
loads the licence; the re-check counts a use; `dispute_won` ignored; an unknown re-check moves `lastCheckAt`;
the re-check uses the config product id; the whole body stored) each turned at least one test red.

A real-browser smoke run (headless Chromium over the DevTools protocol, scratch harness, nothing committed)
loaded the real page and module graph: an active record turned Pro on with no request; the old signed value
was cleared; with the shipped empty product id activation sent nothing and said "המיתוג עדיין לא הופעל באתר
הזה."; with a product id served in, the browser really sent the verify request (this container's egress
proxy rejected `api.gumroad.com`), which was classified unknown and stored as `pending` with exactly the
allowed fields; zero page errors.

## Judgement calls a reviewer should check

1. **A 404 that is not one of Gumroad's three bodies is `unknown`, not `revoked`.** §4 reads "404 + JSON with
   `success === false` → revoked, reason by message". Gumroad also has a generic
   `{success:false, error:"Not found"}` 404 (`application_controller.rb` `e404_json`) that says nothing about a
   key; revoking on it could switch Pro off for every buyer at their next re-check if a route ever moved. The
   build revokes only on the three exact messages and tests the generic body as `unknown`. This is narrower,
   in the buyer's favour.
2. **The invoice FAQ says "פעם אחת בהפעלה, ואחר כך לכל היותר פעם בשבוע"** where §5 wrote "פעם אחת". The page
   also re-checks weekly, so "once" alone understates what is sent. The same sentence was added to the visible
   copy of that FAQ, so the structured data matches what the page shows. The `ready` button note keeps §4's
   wording verbatim (it describes the activation, which is one check).
3. **The "not shaped" note** starts with §4's "המפתח אינו בפורמט הנכון" and adds the format.
4. **Three controller rules the decision did not spell out:** pressing "הפעלה" again with the key that is
   already active sends nothing (it would only spend a use); a definitive no or an unknown answer about a
   *different* key never removes or replaces a licence that is active; a `pending` key is not retried while
   `navigator.onLine === false`.
5. **`shouldRecheck` also fires when the stored check time is missing or in the future** (a clock that was
   wrong once would otherwise postpone refund detection indefinitely).
6. **README owner item 1:** applying the `ownerStepChanges` replacement literally leaves "…`gumroad.productUrl`
   and are not part of that step"; the dangling "and" was dropped ("Creating the Pro product and pasting its
   URL into `gumroad.productUrl` are not part of that step."). The rest is verbatim.
7. **The job's logic lives in `scripts/gumroad-pro-product.js`** so it could be tested offline; the workflow
   only calls it. Inputs reach it through env, the token only as a Bearer header. If the repository does not
   let Actions open pull requests, the job still pushes the branch and says so as a warning.

## What was not done, and why

- **AT-15 and AT-16 were not run** — they need the owner's token and then a real product. No owner step was
  added: the token is already step 3/6.
- **The optional downloadable guide** (`files` by URL) is not built. The product carries written Hebrew
  instructions plus the licence-key block, which is the minimum §1 names.
- **`index.html` lead** ("שישה כלים … בלי לשלוח נתונים לשום מקום") was left as it is: it describes the six free
  tools, which send nothing; the exception is in the paid add-on and is stated in the FAQ right below it. §5 did
  not list it. Flagged in case the reviewer reads it differently.
- **A domain change** will leave the old `invoice.html` URL inside the Gumroad product's description and
  activation text; `create` does not update a reused product. Noted in the README deploy steps.
- **Files outside this build's scope** (research notes, logs, `logs/CHECKPOINT.md`) still mention the retired
  script as history; they were not touched, per the brief.
- `.gitignore` still lists `.license-key.json` — harmless, and it keeps an old local key file out of a commit.
- Like the repo's other dispatch-only workflows, both new ones can be dispatched only once they are on the
  default branch.

## Commands run and results

```
cd products/il-biz-tools && npm ci && npm test      # 14 files, 217 passed
node scripts/check-html.js                          # all pages ok (net-salary withheld by the gate, as before)
node scripts/build-site.js                          # _site/ built; invoice.html carries the §6 text
grep -rn "ILBIZ""1" products/il-biz-tools --exclude-dir=node_modules   # no output (pattern split so this file does not match itself)
cd /home/user/automaton && npx vitest run src/__tests__/revenue    # 25 files, 482 passed
npx tsc --noEmit                                    # exit 0
node scripts/owner-steps-pdf.mjs                    # docs/OWNER_STEPS.he.pdf, 9 pages; text contains the new step-3 sentence
```
