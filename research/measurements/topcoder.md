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
