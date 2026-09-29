# Measurement: Topcoder active challenges (BOARD-LOOP rank 12, ZERO-TESTS row 6)

**Date:** 2026-09-27
**Ordered by:** `research/channel-loop/BOARD-LOOP.md:164-169` (candidate 12) and `research/channel-loop/ZERO-TESTS.md:15`
(row 6: "how many active challenges are auto-scored and carry prizes").
**Admission rule being tested (BOARD-LOOP.md:167):** "Admit only if AI-generated submissions are allowed, ≥3 auto-scored
paid challenges a month exist, and Israel is on Trolley's list."
**Kill rule (BOARD-LOOP.md:169):** terms forbid AI-generated or non-personal submissions; fewer than 3 auto-scored paid
challenges a month; Israel absent from Trolley; OTP per withdrawal with no brand mailbox; or a camera step in payee
onboarding.

## Grades
- **RENDERED**: quoted from the stored capture.
- **UNKNOWN**: the capture does not answer it. Nothing below is filled in from general knowledge.

## How the quotes are located
The capture is raw JSON written as **one line with no trailing newline** (`wc -l` prints `0`; `grep -n` prints line
`1` for every match). A line number alone would therefore point at the whole file, so every quote below is cited as
`json:1 @N`, where `N` is the byte offset `grep -n -b -o` prints for the quoted fragment. Reproduce any of them with
`grep -n -b -o -E '<fragment>' research/rendered/topcoder-active-challenges.json`.

---

## 1. What was read

| File | What it is |
|---|---|
| `research/rendered/topcoder-active-challenges.json` (7,384 bytes) | the raw API response body, read in full (parsed and pretty-printed locally to read it; not modified) |
| `research/rendered/topcoder-active-challenges.meta.json` | capture metadata |

From the `.meta.json`: `url` = `https://api.topcoder.com/v6/challenges?status=ACTIVE`, `fetchedAt` =
**`2026-09-27T22:46:05.493Z`**, `status` = 200, `contentType` = `application/json; charset=utf-8`, `byteLength` = 7384,
`truncated` = false, `firstFetch` = true, `sha256` = `a1011af24cf1edab75c5844a3b0c9872e58a72ca408ce6e56cd3d0a5f9bfa8af`.
Captured by `.github/workflows/render-watch.yml` (`research/rendered/urls.txt:251-252`).

**This is one API page, and the capture cannot say whether it is the whole population.** The body is a bare JSON array
(it opens with `[` and closes with `}]`), not an object with a `total`, `page` or `perPage` field: `grep -o` finds no
`perPage`, no `page`, and the only `"total` in the file is `"totalPrizes"` inside the one challenge's `overview`
(json:1 @6938). The `.meta.json` stores no response headers, so if the API reports a total count or page count in
headers, that was not captured. **Total-count field or header: ABSENT from the capture.**

Nothing else about Topcoder is in `research/rendered/` (`ls research/rendered/ | grep -i topcoder` returns only these
two files). The member terms, the AI policy, the challenge terms and Trolley's country list that BOARD-LOOP.md:167 asked
for were **not** captured.

---

## 2. The questions

### Q1. How many ACTIVE challenges are in the response?

**Answer: one.** The array has exactly one element, and the string `"status":"ACTIVE"` occurs once in the file.

- json:1 @1900 (RENDERED): `"status":"ACTIVE"`
- json:1 @0 (RENDERED): the challenge is `"name":"Scan-to-3D Factory Layout Automation - POD to PRT Conversion PoC"`,
  `"id":"ce0647a1-e1d4-40ab-a9e3-92c5abdf0ddc"`.
- Grade **RENDERED** for "one in this response". Whether one is the full count of active challenges on Topcoder:
  **UNKNOWN** (no total field or header, see §1).

Two further facts from the same record, both **RENDERED**, matter for "active":

- **Nothing in it was open to a new entrant on the capture date.** Registration and submission were both closed and the
  challenge was in review:
  - json:1 @1533: `"currentPhaseNames":["Review"]`
  - json:1 @2645: `"name":"Registration","description":"Registration Phase","isOpen":false`
  - json:1 @2264: `"name":"Submission","description":"Submission Phase","isOpen":false`
  - json:1 @1677: `"submissionEndDate":"2026-09-21T12:17:24.754Z"`
  So "ACTIVE" here includes a challenge whose submissions closed six days before `fetchedAt`. On this capture the
  number of paid challenges an agent could have entered on 27.9.2026 is **zero**.
- **Competition on the one challenge:** json:1 @1457: `"numOfRegistrants":181,"numOfSubmissions":32`.

### Q2. Type and track of each challenge

**Answer: type "Challenge", track "Development". Not a Marathon Match and not a data-science track.**

- json:1 @6563 (RENDERED): `"type":{"id":"927abff4-7af9-4145-8ba1-577c16e64e2e","name":"Challenge"}`
- json:1 @6466 (RENDERED): `"track":{"id":"9b6fc876-f4d9-4ccb-9dfd-419247628825","name":"Development","track":"DEVELOPMENT"}`
- The strings `Marathon`, `marathon` and `DATA_SCIENCE` occur **zero** times in the file (`grep -o | wc -l` = 0).
- Its skill tags include data science, but that is a skill label, not the track: json:1 @5994 `"name":"Data Science"`,
  json:1 @6152 `"name":"AI/ML Inference"`.
- Other flags: json:1 @1585 `"funChallenge":false`; json:1 @2115 `"name":"is_test_challenge","value":"false"`;
  json:1 @6715 `"isTask":false`; json:1 @6684 `"confidentialityType":"public"`.
- Grade **RENDERED**.

### Q3. Prize amounts

**Answer: USD 2,500 / 1,000 / 500 / 200 / 100 for placements 1-5 (USD 4,300), plus a separate USD 600 set of type
COPILOT.**

- json:1 @4751 (RENDERED): `"prizeSets":[{"type":"PLACEMENT","prizes":[{"type":"USD","value":2500},{"type":"USD","value":1000},{"type":"USD","value":500},{"type":"USD","value":200},{"type":"USD","value":100}]}`
- json:1 @4934 (RENDERED): `"type":"COPILOT","prizes":[{"type":"USD","value":600}]`
- json:1 @6926 (RENDERED): `"overview":{"totalPrizes":4300,"type":"USD"}`
- Arithmetic on the quoted values: 2,500 + 1,000 + 500 + 200 + 100 = 4,300, so `totalPrizes` equals the PLACEMENT set
  alone and does not include the COPILOT 600.
- **Who receives the COPILOT prize: NOT ON THIS PAGE.** It is not assumed here to be open to competitors. Grade
  **UNKNOWN**.
- Grade **RENDERED** for the amounts.

### Q4. Auto-scored (Marathon Match / data science) or reviewed?

**Answer: reviewed. The record lists one human member reviewer plus three AI-workflow scorecards, preceded by an "AI
Screening" phase. It is not an auto-scored Marathon Match.**

- json:1 @5036 (RENDERED): `"isMemberReview":true,"memberReviewerCount":1` with json:1 @5184 `"type":"REGULAR_REVIEW"`
- json:1 @5271, @5438, @5605 (RENDERED): `"isMemberReview":false`, each paired with an `aiWorkflowId`
  (json:1 @5343 `"aiWorkflowId":"awsOP_maxNUvnW"`, @5510 `"aiWorkflowId":"q35ZL_bf9NUvnQ"`, @5677
  `"aiWorkflowId":"QWNcBJ1-BGlDIk"`)
- json:1 @3030 (RENDERED): `"name":"AI Screening","description":"AI Screening Phase"`, which ran and closed:
  json:1 @3311 `"actualEndDate":"2026-09-21T13:57:42.182Z"`
- json:1 @3466 (RENDERED): `"name":"Review","description":"Review Phase","isOpen":true`, scheduled to end at
  json:1 @3644 `"scheduledEndDate":"2026-09-27T13:57:42.182Z"`, which is about nine hours **before** `fetchedAt`
  (22:46:05Z); the review was still open at capture time.
- json:1 @6660 (RENDERED): `"reviewType":"INTERNAL"`
- The evaluation criteria themselves are not public. json:1 @950 (RENDERED): "Register for the challenge to view the
  full specification.** Detailed requirements, technical resources, submission instructions, and evaluation criteria are
  available only after registration."
- **How the member review and the three AI scorecards are weighted into the final placement: NOT ON THIS PAGE.** Grade
  **UNKNOWN**.
- Grade **RENDERED** for "reviewed, with a human member reviewer; not a Marathon Match".

**Count for the ZERO-TESTS question** ("how many active challenges are auto-scored and carry prizes"): **0** auto-scored
among the **1** prize-carrying active challenge in this response.

### Q5. Any field naming an AI policy or eligibility

**AI policy: NOT ON THIS PAGE.** The strings `policy` and `eligib` occur zero times. Every `AI` in the file is one of:
the description's subject matter (json:1 @766 "AI/ML, and CAD automation"), the "AI Screening" phase Topcoder runs on
submissions (json:1 @3038, @3067), the skill tags (json:1 @6101, @6160, @6262), or the `aiWorkflowId` reviewers above.
None of them says whether an entrant may submit AI-generated work. Grade **UNKNOWN**.

**Eligibility-shaped fields that are present (RENDERED), none of which the capture explains:**

- json:1 @1564: `"wiproAllowed":false`
- json:1 @1616: `"groups":[]`
- json:1 @5741: `"terms":[{"id":"0a507fb7-3fe0-402b-b121-1a24af4a9cf1","roleId":"732339e7-8e30-49d7-9198-cccf9451e221"},{"id":"4bc0e7fc-8413-4de6-a231-9f9c6bcc65d9","roleId":"732339e7-8e30-49d7-9198-cccf9451e221"}]`
  (two terms are attached to the challenge by id; their text is not in the capture)
- json:1 @950: "Access to confidential project data also requires the applicable NDA and Topcoder confidentiality terms."

**Country eligibility, Israel, Trolley, payout method, OTP on withdrawal, account-in-a-brand-name: NOT ON THIS PAGE.**
Grade **UNKNOWN**.

---

## 3. Verdict for the board

**NEEDS_MORE, leaning FAILS_TEST.**

What this capture settles (RENDERED): on 27.9.2026 the ACTIVE listing returned **one** challenge. It was a reviewed
Development "Challenge", not an auto-scored Marathon Match; it paid USD 4,300 across five places; it was already closed to
registration and submission; and 32 entries had been submitted. So the snapshot count of auto-scored, prize-carrying
active challenges is **0**, and the count an agent could enter that day is **0**.

Why it is not a clean FAILS_TEST: the admission rule is per month ("≥3 auto-scored paid challenges a month",
BOARD-LOOP.md:167), and one day's ACTIVE list with no total count cannot measure a month. The other two admission
conditions (AI-generated submissions allowed; Israel on Trolley) were not captured at all.

A new risk found on this page: the one active challenge requires "the applicable NDA and Topcoder confidentiality terms"
(json:1 @950). If such an NDA had to be accepted in the owner's legal name for each challenge, that would be per-item
owner paperwork, which the mission rules out. Whether a click-through by the brand account is enough is **UNKNOWN**.

Further pages that would settle it, in order of how much they decide:

1. **The 90-day history of completed challenges, with type and track.** It decides the ≥3-a-month condition. **No URL for
   it is named in the capture.** A candidate to render, built by changing only the `status` value of the captured URL
   (so it is **unverified**, not taken from the capture): `https://api.topcoder.com/v6/challenges?status=COMPLETED`.
   If this also comes back as a bare array, render-watch must store the response headers, or the page count stays unknown.
2. **The text of the two challenge terms** `0a507fb7-3fe0-402b-b121-1a24af4a9cf1` and
   `4bc0e7fc-8413-4de6-a231-9f9c6bcc65d9`, plus Topcoder's member terms and AI policy. These decide the AI-submission
   condition and whether the NDA is per-challenge owner paperwork. **No URL for any of them is named in the capture.**
3. **Trolley's supported-country list.** It decides the Israel condition. **No URL is named in the capture.**
4. The only URL in the capture is the challenge's forum page,
   `https://www.topcoder.com/opportunities/challenge/ce0647a1-e1d4-40ab-a9e3-92c5abdf0ddc?tab=forum` (json:1 @4576). It
   would not settle any of the above: the record says the specification and evaluation criteria are "available only
   after registration" (json:1 @950).

If (1) shows fewer than three auto-scored paid challenges in any recent 30 days, the candidate fails outright under
BOARD-LOOP.md:169 and (2)-(3) need not be rendered.

---

## 4. What the owner would have to do if admitted, and what it costs

From BOARD-LOOP.md:168 (the board's proposal; **none of it is confirmed by this capture**):

| Step | One-time or recurring | Source |
|---|---|---|
| A Topcoder member account under the brand. This needs the brand mailbox (proposed step 8, BOARD-LOOP.md:207), which does not exist yet | one-time | BOARD-LOOP.md:168 (not rendered) |
| Trolley payee onboarding with a tax form in the owner's legal name | one-time | BOARD-LOOP.md:168 (not rendered) |
| An OTP on every withdrawal. This is recurring unless the agent can read the brand mailbox | **recurring** | BOARD-LOOP.md:166, citing the tc-finance-api README (not rendered here) |
| NDA / confidentiality terms on each challenge with confidential data | **possibly per challenge**; who must sign is UNKNOWN | json:1 @950 (RENDERED) |
| Step 2 (the tax file and Bituach Leumi registration) | one-time registration, recurring contributions | BOARD-LOOP.md:168; `research/measurements/step2-cost.md` |

**Owner money:** entering a Topcoder challenge costs nothing according to this capture. No entry fee or other charge
field appears in the record. That the platform is free to join is **not stated on this page (UNKNOWN)**. The one cost the
repo already knows about is Step 2: under the owner's ₪0 rule, the Bituach Leumi self-employed floor contribution
recorded in `research/measurements/step2-cost.md` (PARTLY MEASURED) must not start before the ledger shows income.
Whether Trolley or PayPal/Payoneer charge the payee a fee is **UNKNOWN** (not on this page).

---

## 29.9 (GitHub read)

**Date:** 2026-09-29, read 03:05-03:33 UTC. **Reader:** Opus subagent; no git, no edits outside this section.
**Question (loop row 12):** do auto-scored challenges exist at all (schema, scorer, history); is there an AI-use or agent
rule; how are members paid, which countries, and is there an identity step with a camera (G2).

**Grades in this section.** **github** = Topcoder's own source or issues on GitHub. Three sub-kinds:
*codesearch* = a fragment returned by GitHub code search (exact indexed text, pinned to the commit in the result's
`object_url`, listed in §A); *webfetch* = a `github.com` or `raw.githubusercontent.com` URL read through WebFetch, which
returns model-converted text (where it returned a whole file it is marked "full file"; otherwise a render should re-check
exact wording); *issue* = a GitHub issue read through the issues search API. **rendered** = the 27.9 capture above.
**snippet** = the one WebSearch. **repo** = this repo's research. **none** = inference, flagged.
curl to `api.github.com` returned 403 from this container, so no directory listings or commit history were read; the
GitHub MCP file reader refused every `topcoder-platform` repo ("not configured for this session"). Code search and
WebFetch worked.

### A. What was read (exact URLs and pinned commits)

*Code search (github/codesearch), repo @ commit:*
`topcoder-platform/challenge-api-v6` @ `06ca2b60fef521b5ccc38c1ecfe68d59b9c2c461` ·
`topcoder-platform/marathon-match-api-v6` @ `8b56089e95ae90f0145604c7d4481b096c7a2d13` ·
`topcoder-platform/platform-ui` @ `e1e8136bc000441e47f94f8049e9b5de38795065` ·
`topcoder-platform/tc-finance-api` @ `3b760d951a34420241291ef862616a42b0dad8d6` ·
`topcoder-platform/terms-service` @ `062de8cf5c14035e06ccaa7e10b151a665a4eb71` ·
`topcoder-platform/universal-navigation` @ `00c656f9be99a2defd092dddfaaeaf490f9ab95c` ·
`topcoder-platform/identity-api-v6` @ `5e2d17a02ddb9da2e6f34cd3af8492cf2b62ecb4` ·
`topcoder-platform/review-api-v6` @ `f8932063059519722f8f57ebb126ad1c3294494d` ·
`topcoder-platform/tc-mcp` @ `36b5084f75a07326e9bf0e05419f5be07a01f606`.

*WebFetch (github/webfetch):*
https://github.com/topcoder-platform/marathon-match-api-v6 ·
https://github.com/topcoder-platform/marathon-match-api-v6/tree/develop/examples ·
https://github.com/topcoder-platform/marathon-match-api-v6/issues?q=is%3Aissue+sort%3Acreated-desc ·
https://github.com/topcoder-platform/tc-mcp (only a partial README came back) ·
https://raw.githubusercontent.com/topcoder-platform/challenge-api-v6/develop/src/scripts/seed/ChallengeType.json (summarised, not full) ·
https://raw.githubusercontent.com/topcoder-platform/challenge-api-v6/develop/docs/swagger.yaml (parameter list) ·
https://raw.githubusercontent.com/topcoder-platform/tc-finance-api/dev/src/api/webhooks/trolley/handlers/recipient-verification.types.ts (full file) ·
https://raw.githubusercontent.com/topcoder-platform/tc-finance-api/dev/src/api/webhooks/trolley/handlers/recipient-verification.handler.ts (full file) ·
https://raw.githubusercontent.com/topcoder-platform/tc-finance-api/dev/src/api/withdrawal/withdrawal.service.ts (quoted blocks) ·
https://raw.githubusercontent.com/topcoder-platform/tc-finance-api/dev/src/shared/global/trolley.service.ts (quoted block) ·
https://raw.githubusercontent.com/topcoder-platform/tc-finance-api/dev/src/api/repository/identity-verification.repo.ts (summarised).
One guessed path returned 404: `raw.githubusercontent.com/topcoder-platform/challenge-api/develop/README.md` (the org
search lists no repo named `challenge-api`; the live one is `challenge-api-v6`).

*Issues (github/issue):* https://github.com/topcoder-platform/marathon-match-api-v6/issues/34 ·
https://github.com/topcoder-platform/marathon-match-api-v6/issues/32 ·
https://github.com/topcoder-platform/marathon-match-api-v6/issues/162 (and 17 more titles from the same repo, all
28-30.5.2026 security/functionality reports).

*The one WebSearch (snippet):* query `Trolley recipient identity verification government ID selfie "Trolley" payee
verification`. Result URLs: https://support.trolley.com/s/article/Identity-Verification ·
https://trolley.com/trust/ · https://trolley.com/use-cases/music-royalties/know-your-artist/ ·
https://trolley.com/trust/dsa-compliance/ · https://trolley.com/blog/trolley-trust-idv-tool/ ·
https://support.trolley.com/s/article/Identity-Verification-FAQ (plus two unrelated hosts). None of these was opened.

### B. Auto-scored challenges: they exist in the schema and are being operated (settles the "none exist" question)

- **The type exists and is active.** `src/scripts/seed/ChallengeType.json` (codesearch):
  `"description": "A match predicated on solving one problem using only what is deemed the best method",` /
  `"isActive": true,` / `"isTask": false,` / `"abbreviation": "MM",` / `"isLegacy": false,`; its id is paired with the
  name in `data-migration/src/scripts/recalculateChallengeWinners.js`: `["929bc408-9cf2-4b3e-ba71-adfbf693046c",
  "Marathon Match"],`. The 27.9 challenge's type `927abff4-…` is `"Challenge"` in the same list. github.
- **A live machine scorer exists.** `marathon-match-api-v6/README.md` (codesearch): "NestJS service for managing
  marathon match scorer configuration, compiling tester JARs, consuming submission events from Kafka, and launching ECS
  scoring tasks." `docs/marathon-processor-specification-and-scoring-terminology.md`: "This article describes how
  Topcoder Marathon Match submissions are compiled, executed, scored, and reported by the current Marathon Match
  processor. … Marathon Match submissions are scored by an AWS ECS/Fargate runner task. Each scoring task downloads the
  configured tester, downloads the member submission, runs the tester for the configured seed range, uploads artifacts,
  and posts score results back to Topcoder services." The repo was created 2026-03-02 and last updated 2026-09-28
  (repository search metadata). github.
- **The challenge API closes MMs from scores, with no human reviewer.** `docs/swagger.yaml` (codesearch): "Close a
  Marathon Match challenge by selecting winners from final review summations, closing all phases, and setting the
  challenge status to COMPLETED." github.
- **The front end promotes MMs as a running programme.** `platform-ui/src/apps/opportunities/src/components/
  ChallengeSidebar.tsx` (codesearch): `{marathonMatch ? 'Marathon Match Tournament' : 'Join the AI Exponential league'}`
  and `'Join the battle of competitors in a series of challenging Marathon Matches.'`; the site nav carries
  `marketingPathname: '/marathon-match-tournament',` (`universal-navigation/src/lib/config/nav-menu/all-nav-items.config.ts`).
  github.
- **When the new scorer went live.** Issue #162 (29.5.2026), steps to reproduce: "1.Register and compete in Marathon
  Match 2026 Beta Test". Issue #32 (28.5.2026) reports a member's live submission flow ("When submitting code, the
  system reports "Failed submission" at first"). So the v6 MM stack was in a public beta at the end of May 2026.
  github/issue.
- **What this does NOT settle: volume.** Nothing on GitHub counts MMs per month. Issue #34 names MMs 144 and 145 and says
  "For more recent matches the correct rank is shown", which dates nothing. The ≥3-a-month admission condition
  (BOARD-LOOP.md:167) stays **UNKNOWN**.
- **Why the 27.9 snapshot missed them:** it queried `status=ACTIVE` for all types and got one Development challenge.
  The API filters by type: swagger `type` = "Filter by type abbreviation, exact match. If provided, the typeId will be
  ignored"; `types` = "Filter by multiple type abbreviation, exact match. If types is provided, typeIds will be
  ignored"; also `status`, `endDateStart`, `endDateEnd`, `page`, `perPage`, `isLightweight` (webfetch of swagger).
  Status values include `ACTIVE`, `COMPLETED` and seven `CANCELLED_*` variants (webfetch).
- **Page count lives in headers the capture did not store.** `src/common/helper.ts` (codesearch):
  `res.set("X-Total", result.total);` / `res.set("X-Total-Pages", totalPages);`. So a bare-array body is expected;
  `perPage=100` makes the array length the count whenever it is under 100.
- **Side fact:** the `AI` track filter is a topic tag, not a policy: swagger `track` = "AI is a synthetic facet that
  matches the exact canonical AI challenge tag." github.

**Conclusion for B: the "no auto-scored challenges exist" kill reason is REFUTED at github grade.** The 27.9
"leaning FAILS_TEST" rested on a snapshot that could not have seen an MM; it should not be carried forward.

### C. AI-use and agent rules: none on GitHub

Code search over `org:topcoder-platform` for `"AI-generated"`, `"use of AI"`, `"AI policy"` returned 0 hits, and over
`platform-ui` for `"AI-assisted"` and `"AI tools" OR "AI assistance" OR "AI usage"` returned 0 hits. What exists is
Topcoder's own AI reviewing members' work: `platform-ui/.../opportunity-learning.utils.ts` (codesearch) `/** Published
guide to AI review behavior for challenge participants. */ export const AI_REVIEWERS_HELP_URL`, whose value in the spec
is `'https://www.topcoder.com/thrive/articles/ai-reviewers-member-help-guide'`. No rule for or against AI-written
submissions, bots or agent-operated accounts was found. **UNKNOWN (none).**

### D. Terms attached to the 27.9 challenge: identified; one is a DocuSign NDA

- `0a507fb7-3fe0-402b-b121-1a24af4a9cf1`: `platform-ui/src/config/environments/default.env.ts` (codesearch)
  `export const DEFAULT_STANDARD_TERMS_UUID = '0a507fb7-3fe0-402b-b121-1a24af4a9cf1'`. github.
- `4bc0e7fc-8413-4de6-a231-9f9c6bcc65d9`: `prod.env.ts` (codesearch) `export const NDA_TERMS_URL =
  'https://www.topcoder.com/challenges/terms/detail/4bc0e7fc-8413-4de6-a231-9f9c6bcc65d9'` and `'DEFAULT_NDA_UUID',
  '4bc0e7fc-8413-4de6-a231-9f9c6bcc65d9',`; the same file: `export const NDA_DOCUSIGN_TEMPLATE_ID = getReactEnv<string>(
  'NDA_DOCUSIGN_TEMPLATE_ID', '8b101e82-87c0-42c9-8440-d922749c4076',)`. The prod general terms page is `export const
  TERMS_URL = 'https://www.topcoder.com/challenges/terms/detail/564a981e-6840-4a5c-894e-d5ad22e9cd6f'`. github.
- The terms service signs DocuSign-type terms through a template: `terms-service/src/services/TermsOfUseService.js`
  (codesearch) `if (termsOfUse.agreeabilityTypeId === AGREE_FOR_DOCUSIGN_TEMPLATE) {`. Agreement is stored per user and
  terms id (`TermsOfUse.hasMany(models.UserTermsOfUseXref, …)`, `src/models/TermsOfUse.js`), so one signature of the NDA
  plausibly covers every later challenge that carries it (**inference, none**). A DocuSign NDA is signed in a legal
  name: one owner step, not per item, if the inference holds. Whether MMs carry the NDA at all: **UNKNOWN**.

### E. Payment: Trolley, with a mandatory identity check before any withdrawal (G2)

- **Methods.** `tc-finance-api/README.md` (codesearch): "A comprehensive payment management system for Topcoder
  platform, handling winnings, withdrawals, and payment processing through integration with Trolley payment provider."
  and "**Payment Methods**: Support for multiple payment methods (Trolley, PayPal, Payoneer)". github.
- **The payee onboards inside a Trolley widget that includes the identity product.** `trolley.service.ts`
  (webfetch, quoted block): `products: 'pay,tax,trust',` alongside `refid: recipient.userId,` and `roEmail: 'true',`.
  The wallet embeds it as an iframe: `title='Trolley'` (`platform-ui/src/apps/wallet/src/home/tabs/payout/PayoutTab.tsx`,
  codesearch). github.
- **No withdrawal without identity verification, tax form, payment method and an OTP.** `withdrawal.service.ts`
  (codesearch + webfetch): `'Please complete identity verification before making a withdrawal.',` ·
  `'Please complete your tax form before making a withdrawal.',` · `'Please add a payment method before making a
  withdrawal.',` · `if (!otpCode) { const otpError = await this.otpService.generateOtpCode(userInfo,
  reference_type.WITHDRAW_PAYMENT,);` · a floor `TROLLEY_MINIMUM_PAYMENT_AMOUNT` read from env (value not in source).
  The identity check has no threshold or flag around it; `identity-verification.repo.ts` returns true only when an
  ACTIVE verification record exists (webfetch, summarised). github.
- **The OTP goes to the member's email.** `src/shared/global/otp.service.ts` (codesearch):
  `async generateOtpCode(userInfo: BasicMemberInfo, actionType: reference_type) { const email = userInfo.email;`. So a
  withdrawal needs a mailbox read every time: recurring owner action unless the agent reads the brand mailbox. github.
- **What the identity record is.** `recipient-verification.types.ts` (webfetch, full file):
  `export enum RecipientVerificationType { phone = 'phone', individual = 'individual', business = 'business', }`;
  `VerifiedIdentityData` holds `dob`, `lastName`, `firstName`, `documentType`, `documentIssuingCountry`,
  `documentValidUntil` and `matchSignals: { yobMatch: boolean; countryMatch: boolean; postalCodeMatch: boolean | null; }`.
  The handler counts only `individual`/`business` ("Handling only individual/business status updates, ignoring phone
  verification", full file). So a government ID document is required. github.
- **Camera: yes, per Trolley's own help pages, at snippet grade.** The search summary of
  support.trolley.com/s/article/Identity-Verification and trolley.com/trust: "Recipients are prompted to upload a clear
  photo of their government-issued ID" and "**Live Selfie Verification**: Recipients take a live selfie to verify they
  are the same person shown in the ID document"; "live photo validation uses the power of live image recognition to
  ensure the uploaded ID matches the actual person submitting it." snippet. **Superseded (tick 18):** the rendered
  wording of the "live photo validation" line differs (`trolley-trust-idv-tool.txt:292`); see §29.9 (tick 18, rendered).
  **Counter-signal (github):** the webhook's `matchSignals` carry no face-match or liveness field, so the source cannot
  confirm the selfie; it only confirms a document check. The render in §G settles which is true.
- **Israel on Trolley's country list:** no GitHub file names countries; no Trolley country-list URL was seen.
  **UNKNOWN (none).** Wipro accounts are barred from withdrawing (`isWiproEmail`), irrelevant here.

### F. Submission route (G3)

- Submissions are an API resource: `review-api-v6/docs/MANUAL_UPLOAD_FLOW.md` (codesearch) `Client->>ReviewAPI: POST
  /submissions/manual-upload` "…the endpoint calls the standard `createSubmission(...)` path with a privileged flag."
  The member-facing client lists them from `v6/submissions?challengeId=…&memberId=…&type=CONTEST_SUBMISSION`
  (`opportunities.service.spec.ts`). MFA is per-user and off by default in fixtures (`mfa_enabled: input.mfa_enabled ===
  undefined ? false : input.mfa_enabled`, identity-api-v6). github. Whether a runner can obtain a member token without a
  browser login: **UNKNOWN**. Topcoder's own MCP server is read-only (`readOnlyHint: true`, "Query Topcoder Challenges",
  tc-mcp). github.

### Gates

| Gate | Verdict | Grade | Basis |
|---|---|---|---|
| G1 ₪0 up front | **PASS** | github + rendered | No `entryFee` in challenge-api-v6 (0 hits); no fee field in the 27.9 record. Trolley/PayPal payee fees UNKNOWN. |
| G2 paid in Israel, no camera | **FAIL** | github (gate) + snippet (camera) | Withdrawal throws without an ACTIVE identity verification; the widget loads `trust`; Trolley's IDV is ID photo + live selfie per its help pages (snippet). Israel on Trolley UNKNOWN. |
| G3 list without per-item owner click; terms allow agents | **UNKNOWN** | github / none | Submission API exists; MM scoring is machine-only; headless member login UNKNOWN; no agent or AI clause found; DocuSign NDA plausibly once per member. |
| G4 honest value, AI declared | **UNKNOWN** | none | No AI-use rule found on GitHub; render the MM how-to, AI-reviewers guide and terms. |
| G5 venue brings buyers | **PASS** | rendered + github | Prizes are posted by the platform (27.9: USD 4,300 placements); MM tournament promoted in site nav. Only placing entries are paid; win rate unmeasured. |
| G6 one owner step unlocks many | **PASS, conditional** | github | Account, Trolley pay/tax/trust and the NDA are one-time; the per-withdrawal OTP is emailed, so it is automatic only if the agent reads the brand mailbox (step 8). |
| G7 brand is the only public name | **UNKNOWN** | none | Leaderboards show handles; legal name goes to Trolley and DocuSign. Whether a profile shows a real name: not read. |

### Verdict: **KILL-PROPOSED** (on G2, not on auto-scoring)

- The question this read was sent to settle comes out the other way: auto-scored challenges **do** exist and have a
  live 2026 scorer (github, §B). Do not kill the row for "no auto-scored challenges".
- The row fails the kill rule's camera clause instead: "or a camera step in payee onboarding" (BOARD-LOOP.md:169).
  Topcoder will not release a withdrawal without Trolley identity verification (github), and Trolley's verification asks
  for a live selfie (snippet). The proposal is graded by its weakest link, the snippet, so it goes to the board as
  **proposed**, with one pre-registered check:
  - **Confirm:** render https://support.trolley.com/s/article/Identity-Verification. If it shows a selfie or liveness
    step that an individual recipient must complete, the kill stands and nothing else below needs rendering.
  - **Reopen:** if the render shows the selfie is optional or payer-configurable (the webhook's missing face-match field
    is the one hint of that), the row returns to NEEDS_MORE, and the MM history render below decides the ≥3-a-month
    condition next.
- Even if G2 were reopened, three more owner-facing costs are now on record (github): an OTP emailed on every
  withdrawal, a DocuSign NDA in a legal name, and an ID document in a legal name.

### G. Next render URLs (in order)

*Seen verbatim in a source named above:*
1. https://support.trolley.com/s/article/Identity-Verification (snippet result; decides the kill)
2. https://support.trolley.com/s/article/Identity-Verification-FAQ (snippet result)
3. https://trolley.com/trust/ (snippet result)
4. https://www.topcoder.com/community/how-it-works/terms/ (`platform-ui` default.env.ts `TERMS_OF_USE`)
5. https://www.topcoder.com/challenges/terms/detail/564a981e-6840-4a5c-894e-d5ad22e9cd6f (`prod.env.ts` `TERMS_URL`)
6. https://www.topcoder.com/challenges/terms/detail/4bc0e7fc-8413-4de6-a231-9f9c6bcc65d9 (`prod.env.ts` `NDA_TERMS_URL`)
7. https://www.topcoder.com/thrive/articles/How%20To%20Compete%20in%20a%20Marathon%20Match (`opportunity-learning.utils.ts`)
8. https://www.topcoder.com/thrive/articles/ai-reviewers-member-help-guide (`ChallengeSidebar.spec.tsx`)

*Constructed, not seen verbatim* (flagged for the `urls.txt` one-rule; host and base path from swagger `host:
api.topcoder.com`, `basePath: /v6`; parameter names from the swagger; the web paths from `${TOPCODER_URL}` templates):
9. https://api.topcoder.com/v6/challenges?type=MM&status=COMPLETED&endDateStart=2026-06-29T00:00:00.000Z&perPage=100&isLightweight=true (the 90-day MM count; only needed if the row is reopened)
10. https://api.topcoder.com/v6/challenges?type=MM&status=ACTIVE&perPage=100&isLightweight=true
11. https://www.topcoder.com/marathon-match-tournament (`opportunity-learning.utils.ts`: ``MARATHON_MATCH_TOURNAMENT_URL = `${EnvironmentConfig.TOPCODER_URL}/marathon-match-tournament` ``)
12. https://www.topcoder.com/challenges/terms/detail/0a507fb7-3fe0-402b-b121-1a24af4a9cf1 (id from `DEFAULT_STANDARD_TERMS_UUID`, path pattern from item 6)

No URL for Trolley's supported-country list was seen anywhere; the Israel question has no render target yet.

---

## Tick 15 (rows 147-149 render)

**Read 29.9.2026 by an Opus reader.** Render commit `033f044`, fetchedAt 2026-09-29T03:53Z. Short names: `TIV` =
`research/rendered/trolley-identity-verification` (row 147), `FAQ` = `…/trolley-identity-verification-faq` (row 148),
`TOU` = `…/topcoder-terms-of-use` (row 149). Both txt files were read in full (6 lines each). Both html files were grepped
whole, script tags included. Every quote below was checked with `grep -n -F`.

**Status: KILL-PROPOSED, unchanged and still at snippet grade. The kill is UNSETTLED because row 147 did not render.**

### What the three captures hold
- **Rows 147 and 148 are not rendered.** Both returned 200 with 444,107 bytes. Both are the same Salesforce Aura
  help-centre shell with no article in it. The whole text is `Trolley Help Center` (TIV.txt:1, FAQ.txt:1) and
  `× Sorry to interrupt CSS Error` (TIV.txt:4, FAQ.txt:4). In the html this is the boot-error box:
  `<span id="auraErrorTitle">Sorry to interrupt</span>` and `<div id="auraErrorMessage">CSS Error</div>` (TIV.html:520,
  FAQ.html:520).
- **The two html files are the same page.** I masked the per-request nonces and the order of four keys in one
  `lwcRuntimeFlags` object; after that the diff is 0 lines. Neither file even names which article was asked for.
- **No article text is hidden in the scripts.** These terms have 0 hits in TIV.html: `selfie`, `liveness`, `camera`,
  `photo`, `passport`, `government`, `Identity-Verification`, `urlName`, `articleBody`, `Knowledge__kav`. The one
  `identity` hit is the Salesforce namespace `"identityLogin"` in a config list (TIV.html:586). The file has no JSON-LD
  and no `application/json` script. The only Trolley hosts in it are platform hosts in the CSP (TIV.html:2), such as
  `https://trolley.my.salesforce.com` and `https://trolley.file.force.com`.
- **Why render-watch cannot fix this.** The article body is fetched by the browser after boot. The runner stores what the
  server sends: `<noscript> content is kept (the runner never runs JavaScript)` (`scripts/render-watch.mjs:305`) and
  `text rendered by JavaScript is not here at all: this stores what the server` (`:307`). Re-queuing rows 147 and 148
  will return this same shell every time.
- **Row 149 has no body.** It returned `"error": "HTTP 404 Not Found",` (TOU.meta.json:10) for
  `https://www.topcoder.com/community/how-it-works/terms/` (:2). The `TERMS_OF_USE` URL in platform-ui's
  `default.env.ts` is dead. Nothing from it was read, so no clause on automated access, AI, identity or payment is on
  record.

### GitHub alternatives (github.com through WebFetch; files from raw.githubusercontent.com)
- **Trolley's own org holds SDKs, not help pages.** github.com/trolley describes itself as "building the payouts platform
  for the internet economy" (webfetch). It lists six SDKs (JavaScript, .NET, Ruby, Python, Java, PHP) and one fork. There
  is no docs or help-centre repo.
- **The SDK verification record is opaque.**
  - `verifiedData: any;` (javascript-sdk `lib/types.ts:101`, sha256 `751cd2bb6248`).
  - `"verifiedData": "",` (python-sdk `trolley/types/verification.py:16`, sha256 `766f4087cb04`).
  - The verification type is only a path segment: `const endPoint = buildURL("verifications", verificationType,
    "trigger");` (javascript-sdk `lib/VerificationGateway.ts:36`, sha256 `4631ad59917c`).
  - Those three files and python-sdk `trolley/verification_gateway.py` have 0 whole-word hits for selfie, liveness, face,
    biometric, camera or photo. Grade: github/raw.
- **No mirror found.** A GitHub repository search for `trolley identity verification` returned "0 results" (webfetch).
  No GitHub-hosted copy of the help centre was found.
- **Net: two absences against one positive snippet.** GitHub shows no selfie in two data schemas: §E's webhook
  `matchSignals` has no face-match field, and the SDKs leave `verifiedData` untyped. The one positive is the snippet
  that describes a live selfie. A data schema that lacks a selfie field does not show that the widget UI lacks a selfie
  step, so neither side is settled.

### Kill verdict: **UNSETTLED**
The camera clause ("or a camera step in payee onboarding", BOARD-LOOP.md:169) stands exactly where §29.9 left it:
- **github grade:** every withdrawal is gated on identity verification.
- **snippet grade:** that verification includes a live selfie. **Superseded (tick 18):** a live-photo step is now
  named at rendered grade (`trolley-trust-idv-tool.txt:292`); the word "selfie" itself is still snippet only.

### What a rendered selfie would change
- **If the selfie is mandatory for an individual payee:**
  - G2 FAIL moves from snippet grade to rendered grade.
  - The camera clause fires, and KILL-PROPOSED becomes a kill for the sitting.
  - §G items 5-12 are dropped unread.
- **If the selfie is optional or set by the payer:**
  - G2 goes back to UNKNOWN. The ID document in a legal name (§E) is still required.
  - The row returns to NEEDS_MORE.
  - The MM count (§G items 9-10) decides the ≥3-a-month condition next.
- **The FAQ's country list** (Israel) stays unanswered either way. No capture or GitHub file names Trolley's countries.

### Gates (changes from §29.9 only)
| Gate | Verdict | Grade | Basis |
|---|---|---|---|
| G2 paid in Israel, no camera | **FAIL** (unchanged) | github (gate) + snippet (camera) | Render attempted 29.9 03:53Z: rows 147-148 came back as an Aura shell with no text. The Trolley SDKs have no selfie field (absence, github/raw). Israel is still UNKNOWN. |
| G3 terms half | **UNKNOWN** (unchanged) | none | Row 149 returned 404, so nothing was read. |

G1 and G4-G7 are unchanged.

### Verdict: **KILL-PROPOSED** (unchanged; weakest link is still the snippet)
Render-watch can never render this page, so the pre-registered "confirm" step cannot be done by the runner. The
board has three ways to close it:
- **(a)** Accept snippet grade and kill.
- **(b)** Queue a Trolley page that might be served as HTML (see below). Whether it is is UNKNOWN.
- **(c)** Leave it proposed until a JavaScript-capable reader exists.

Rows 147-149 should come off `urls.txt`: two will always return the shell, and the third is a 404.

### Next URLs
- **Seen in a capture: none.** The two shells name only Salesforce platform hosts (TIV.html:2), and the 404 has no body.
- **Carried from §G, seen verbatim in the 29.9 GitHub read or its WebSearch result list (not a capture):**
  - https://trolley.com/trust/ (§G item 3). It is one of four trolley.com pages outside the Salesforce help centre in
    that result list (§A); https://trolley.com/blog/trolley-trust-idv-tool/ is another. Whether either is served as
    HTML is UNKNOWN. **Superseded (tick 18):** the blog post is served as HTML with its text (200, 677 lines).
  - https://www.topcoder.com/challenges/terms/detail/564a981e-6840-4a5c-894e-d5ad22e9cd6f (§G item 5, `prod.env.ts`
    `TERMS_URL`). It is the live candidate to replace row 149's dead URL.

## 29.9 (tick 17): the URL of Trolley's own terms

**Read 29.9.2026 by an Opus reader (tick 17, task B item 4).** The question: where are Trolley's terms of service on
trolley.com, as opposed to the `support.trolley.com/s/…` Salesforce shell that rows 147-148 returned? The goal is a URL
a runner can render plainly. Nothing below is rendered yet. Grades: **github** (a GitHub file or code-search fragment I
read), **snippet** (a search result I could not open), **none** (my inference, marked [inference]).

### What was searched
- **GitHub code search, 29.9:**
  - `"trolley.com/legal"`: 0 results.
  - `"trolley.com/terms"`: 0 results.
  - `trolley "recipient terms"`: 0 results.
  - `"paymentrails.com/terms" OR "paymentrails.com/legal"`: 0 results.
- **Two third-party GitHub files name trolley.com legal pages (github):**
  - An `llms.txt` copy of trolley.com stored by a third party lists `- [API Terms of Use](https://trolley.com/api-terms):
    Legal agreement governing use of Trolley API and developer applications`. Source:
    `afterpartyai/llms_txt_store` at `148b11d989a6`, `com/t/r/o/l/l/e/y/llms.txt:39`, sha256 `461214c5ebf3`, 39 lines,
    checked with `grep -n -F`. It lists no terms of service and no recipient agreement. It is not Trolley's own file.
  - `chardinne/Zik4U-web` `src/app/legal/privacy/page.tsx` (code-search fragment, ref `06cc8b2976ee`) names Trolley as
    "Creator payout processing (KYC)" with the link `https://trolley.com/privacy-policy/`.
- **The one WebSearch** (`trolley.com terms of service payouts recipient legal`, restricted to trolley.com) returned
  these result titles and URLs (snippet):
  - "Terms of Service - United States (US) - Trolley", https://trolley.com/terms-of-service/
  - "Terms of Service - EU - Trolley", https://trolley.com/terms-eu/
  - "Legal Agreements - Trolley", https://trolley.com/legal-agreements/
  - "Terms of Service - Canada (CA) - Trolley", https://trolley.com/terms-canada/
  - "Terms of Service - United Kingdom (UK) - Trolley", https://trolley.com/terms-uk/
  - "API Terms of Use - Trolley", https://trolley.com/api-terms
  - "Privacy Policy (US, CA) - Trolley", https://trolley.com/privacy/
- **What the search summary said (snippet only).** The terms apply to software "to facilitate the making of payments to
  third party individuals or companies around the world ("Recipients")". Also, "Upon becoming a Merchant, users receive
  a "Merchant Agreement"". [inference] The regional terms of service are the payer's (merchant's) contract, which here
  means Topcoder's. Whether a separate agreement binds a recipient, such as a Topcoder member, is UNKNOWN. The
  legal-agreements index is the page that would list one. Which regional version would govern an Israeli recipient is
  also UNKNOWN.

### Why this matters for the camera clause (G2)
- Tick 15 wrote "Render-watch can never render this page" (`:494`). That was before the opt-in `js` mode.
- Now a `support.trolley.com/s/article/…` line can be rendered in Chromium, if it is queued with
  `scripts/queue-zero-test.mjs --js --terms <slug>`. The `<slug>` must be a successful capture with at least 1,000
  characters of text, from the same registrable domain, and not the target page itself (`research/rendered/README.md:154-158`).
- [inference] A plain capture of `trolley.com/terms-of-service/` is on the same registrable domain as
  `support.trolley.com`. If its `.txt` is real text, it is exactly that `--terms` capture.
- **The reader must still check that the terms do not bar automated access.** If they do not, rows 147 (Identity
  Verification) and 148 (FAQ) can be re-queued as `js` lines. That is the pre-registered confirm step for the camera
  clause in BOARD-LOOP.md:169, which §29.9 and tick 15 could not run.
- Whether trolley.com's marketing and legal pages are served as HTML or as a JavaScript shell is UNKNOWN. No trolley.com
  page outside the help centre has been captured. **Superseded (tick 18):** both captured plainly with their text
  (`trolley-terms-of-service`, `trolley-trust-idv-tool`, 200).

### Verdict: **KILL-PROPOSED** (unchanged)
Nothing here is rendered, so G2 keeps its grades: github for the gate, snippet for the camera. **Superseded (tick 18):**
camera now rendered grade (§29.9 (tick 18, rendered)). The change is the route:
three plain renders on trolley.com, then possibly two `js` re-renders on support.trolley.com.

### Next render URLs (in order; each URL is written above with its source)
| # | URL | Slug | What it settles |
|---|---|---|---|
| 1 | https://trolley.com/terms-of-service/ | `trolley-terms-of-service` | The US terms: recipient definitions, any bar on automated access. If ≥ 1,000 characters with no such bar, this becomes the `--terms` capture for re-queuing rows 147-148 with `js`. |
| 2 | https://trolley.com/legal-agreements/ | `trolley-legal-agreements` | Which agreements exist; whether one binds a recipient (a Topcoder member) and which region's version applies to Israel. |
| 3 | https://trolley.com/privacy/ | `trolley-privacy` | Whether Trolley's privacy policy names biometric or facial data for identity checks. That is rendered-grade evidence on the camera clause, weaker than the verification article but not a snippet. |

Not queued: https://trolley.com/api-terms (the developer and payer API contract, not the payee side), the EU, Canada and
UK variants (only if item 2 names one of them for Israel), and https://trolley.com/privacy-policy/ (a third party's link;
item 3 is the URL under Trolley's own title).

## 29.9 (tick 18, rendered)

**Read 29.9.2026 by an Opus reader (tick 18, reader B).** Two plain captures from trolley.com. Both came back 200,
not truncated, with their text in the HTML (neither is a JavaScript shell):

| Capture (short name) | URL | fetchedAt | Text |
|---|---|---|---|
| `trolley-trust-idv-tool` (IDV) | https://trolley.com/blog/trolley-trust-idv-tool/ | 2026-09-29T09:56:52Z | 677 lines, 16,964 bytes |
| `trolley-terms-of-service` (TOS) | https://trolley.com/terms-of-service/ | 2026-09-29T09:56:51Z | 712 lines, 56,761 bytes |

Grades: **rendered** = these captures, cited `IDV:n` / `TOS:n` (`research/rendered/<slug>.txt`); **github** = §E above;
**[inference]** is marked. Every quote was checked with `grep -n -F` against the capture.

### What Trolley's IDV post names (rendered)
- **The post is addressed to platforms. The people it verifies are the platform's recipients:**
  - "Trust in Trolley to manage your recipient onboarding and IDV" (IDV:300; the same heading at :252).
  - "We want you to rely on us to help you build trust in your recipients." (IDV:302)
  - The platform's users are the people it pays: "adding new users (vendors, sellers, freelancers, artists… you name it) every
    day." (IDV:235)
- **The tool describes itself as live:** "Introducing Trolley IDV, our latest tool that uses live, multi-step ID
  verification technology to validate the identity of your users" (IDV:245).
- **The built-in steps**, under "Trolley IDV has built in:" (IDV:288):
  - "Identity & document verification: Collect and validate IDs versus 11,000 official government ID templates from over
    200 countries." (IDV:290)
  - **"Live photo validation: Use the power of image recognition to ensure the uploaded ID is from the actual person
    submitting it."** (IDV:292)
  - "Proof of address and age comparisons: Verify details provided during onboarding, such as address and DOB, with the ID
    document." (IDV:294)
- **A platform switches IDV on.** The post covers "how to turn it on, and why you’ll want it as part of your onboarding
  processes" (IDV:233), and asks "Wondering how to enable IDV in Trolley? Our Help Center takes you through the steps."
  (IDV:298).
- **Dates:** published "October 23, 2023" (IDV:227); "Last updated: February 25, 2026" (IDV:229).
- **Word counts.**
  - In IDV: "selfie" 0, "liveness" 0, "biometric" 0, "camera" 0, "webcam" 0, "face" 0, "live photo" 1 (:292). "video"
    has 4 hits, all navigation ("Video games & eSports", :177).
  - In TOS: 0 for every one of these words, with two exceptions that are not about verification. "video": navigation, plus
    "videos" in the IP clause (:342). "face": 2 hits, both "Interface" (:238, :345).
  - "Israel": 0 hits in either capture.

### What the terms say about identity (rendered)
- **The terms are the payer's contract, so tick 17's [inference] is confirmed:**
  - "For companies registered in the United States" (TOS:230).
  - "The Services may only be used by legally-constituted entities" (TOS:235).
  - Recipients are the third parties who get paid: "to facilitate the making of payments to third party individuals or
    companies around the world (“Recipients”)" (TOS:233).
  - [inference] If Topcoder is on the standard terms, these are Topcoder's terms with Trolley, not a member's terms (TOS:324 defers to an "applicable service agreement"; no capture shows which Topcoder signed).
- **The only identity text is about the customer opening its own account:** "We may also ask to see your driver’s license
  or other identifying documents for you, the Legal Entity, and its beneficial owners." (TOS:285). The terms describe no
  identity-verification step a recipient performs; the only check that touches recipients is the payer-run IRS TIN Matching, which "verifies the TIN … provided by your Recipients against their name" (TOS:303).
- **IDV is billed to the payer as a separate service.** The fees clause lists "fraud prevention services, bank account
  validation services, identity verification services, and background screening services" (TOS:324).
- [inference] Put this next to "how to turn it on" (IDV:233): IDV is a service the platform turns on. Topcoder turned it
  on. Its widget requests `products: 'pay,tax,trust'`, and withdrawal is gated on it (§E, github).

### Kill verdict (pre-registered): **KILL — fires**
- **The ruling:** "if Trolley's rendered text names a selfie, liveness or video" / "step, Topcoder is killed on the camera
  rule without a sitting" (`RULING-2026-09-29-loop.md:113-114`).
- **What the rendered text names:**
  - A "Live photo validation" step that uses image recognition to make sure the ID is from "the actual person submitting
    it" (IDV:292).
  - It sits inside a tool built on "live, multi-step ID verification technology" (IDV:245), sold for "recipient onboarding"
    (IDV:300).
  - [inference] IDV:292 says only "Live photo validation … ensure the uploaded ID is from the actual person submitting it". A live photo is a camera capture whether it shows a face or an ID, so "a camera step in payee onboarding" (`BOARD-LOOP.md:169`) is met either way; the kill does not rest on reading it as a selfie.
    It is also a camera step, whatever the photo shows.
  - Document verification is a separate bullet, listed first (IDV:290). So the text is **not** document-only.
- **The chain to a Topcoder member:**
  1. Topcoder releases no withdrawal without an ACTIVE Trolley identity verification, and its widget loads `trust`
     (github, §E).
  2. Trolley IDV has live photo validation "built in" (rendered, IDV:288, :292).
  - The kill rule is met: "or a camera step in payee onboarding" (`BOARD-LOOP.md:169`).
- **What the text does not settle:** whether a platform can switch off the live-photo step and keep the document check.
  - The post describes the product as sold to platforms, not the screens a payee sees.
  - No rendered text says the step is optional or set by the payer. That was §29.9's reopen condition (`:392-394`).
  - The only counter-signal is still an absence on GitHub: the webhook's `matchSignals` has no face-match field (§E).
  - §29.9's own confirm test ("a selfie or liveness step that an individual recipient must complete", `:390-391`) asked
    for more than this post shows. The board's pre-registered wording (above) says "names", and that test is met.
- **Reading note for the board:** "selfie" and "liveness" have 0 hits, and "video" has 0 hits outside navigation (4 navigation hits in IDV: 177, 178, 474, 622).
  - If "names" means one of those three words has to appear, this is **UNSETTLED**. The js render under "Next render URLs"
    would then decide it.
  - This reader reads the three words as examples of a camera step. "Live photo … the actual person submitting it" is one.

### Gates (changes from Tick 15 only)
| Gate | Verdict | Grade | Basis |
|---|---|---|---|
| G2 paid in Israel, no camera | **FAIL** | github (gate) + **rendered** (camera) | Withdrawal is gated on Trolley IDV (github, §E). IDV has "Live photo validation" built in (IDV:292). Israel: 0 hits in both captures, still UNKNOWN. |

G1 and G3-G7 are unchanged.

### Verdict: **KILLED on the camera clause** (the pre-registered rule; no sitting)
- The `status=COMPLETED` render (§G items 9-10) is **not** queued. The ruling queues it only on a document-only reading.
- §G items 4-8 and 11-12 are dropped unread.
- §E's two snippet quotes stay at snippet grade: "Live Selfie Verification" appears in neither capture, and the rendered
  "live photo" wording differs (IDV:292).

### The `--js` gate for the help-centre article (asked for; not needed if the kill stands)
- **What the terms bar (rendered).** Visiting the site counts as using the Services: "using our Services includes visiting
  the Website, even if you have not created or logged into your Trolley account." (TOS:234). Section 2(vi) then bars:
  - "(3) bypass any measures Trolley may use to prevent or restrict access to the Services or any element thereof;"
    (TOS:256)
  - "(4) use manual or automated software, devices, or other processes to “crawl” or “spider” any page of the Website; or"
    (TOS:257)
  - "(5) harvest or scrape any content from the Website in an unreasonable manner; and;" (TOS:258)
- **Which site that covers:** "https://www.trolley.com (the “Website”) or such other channel we designate from time to
  time." (TOS:233). Whether support.trolley.com is such a channel is not stated.
- **No general bar on automated access.** The terms bar crawling or spidering (by hand or by software), scraping "in an
  unreasonable manner", and getting around access controls.
- [inference, for the board] One scheduled render of one named article follows no links, so it is not a crawl. It is not
  unreasonable scraping either.
  - Rows 166-167's plain GETs of trolley.com already ran under this same clause. A `js` line that rests on it is the same
    kind of access.
  - Facer is different (`RULING-2026-09-29-loop.md:396`). Its clause named "agent" and "software" as barred means of any
    access. Trolley's clause names only the crawl, spider and scrape activities.
- **Script check (dry run; nothing written).**
  - `checkTermsCapture` passed with no throw for `terms: trolley-terms-of-service`, target
    `https://support.trolley.com/s/article/Identity-Verification`. The capture has 56,457 characters of trimmed text, and
    `siteOf` gives `trolley.com` for both hosts.
  - `node scripts/queue-zero-test.mjs --dry-run --js --terms trolley-terms-of-service --url
    https://support.trolley.com/s/article/Identity-Verification --slug trolley-identity-verification …` printed `would
    queue row 174: trolley-identity-verification (js)`, exit 0. A new slug, `trolley-identity-verification-js`, gave the
    same result.
  - Control: the same call without `--js` was refused as "a Salesforce Experience Cloud page (/s/article/...)", exit 1.
  - The sha256 of `ZERO-TESTS.md` and `urls.txt` was identical before and after, and `git status` shows neither file changed.

### Next render URLs
- **None required.** The kill fires without a sitting.
- **Only if the board reads "names" literally (UNSETTLED):**
  - URL: https://support.trolley.com/s/article/Identity-Verification, as a `js` line, queued with
    `--js --terms trolley-terms-of-service`.
  - Seen in: §G item 1. The dry run above passes.
  - It decides one thing: whether the live-photo step is mandatory for an individual recipient.
