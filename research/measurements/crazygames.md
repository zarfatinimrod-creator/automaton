# Measurement: CrazyGames Basic Launch → Full Launch (BOARD-LOOP rank 6, ZERO-TESTS row 1)

**Status (28.9.2026, after tick 4): NEEDS_MORE.** Tick 4 read the three docs Requirements pages ("Tick 4 reading" at the
end). They never call themselves "Publisher Guidelines", and they say nothing about AI content, automated submission or an
upload API. The Basic Launch bars are file limits, visual QA and PEGI12. SDK and ads are Full Launch work. No playtime or
retention benchmark appears. Runner-operated submission is still unanswered by every public page read. Tick 3's status follows as written:

**Status (28.9.2026, tick 3): NEEDS_MORE, unchanged.** Tick 3 read the terms PDF ("Tick 3 reading" at the end): non-exclusive by
default with a +50% opt-in, paid 30 days after invoice (NET 60 is the Payouts page, not the contract), a compensation
formula with no rate, no country clause, no brand-name payee, no AI or automation clause, an uncapped IP indemnity, and
binding "Publisher Guidelines" not yet read (ZERO-TESTS rows 22-24). Tick 2's status follows as written:

**Tick 2 status: NEEDS_MORE.** The Payouts page now settles method (Tipalti), threshold (€100)
and NET terms (NET 60, "NET 10 in practice"), and shows that billing onboarding is required **before a game can be
submitted**. The developer terms PDF was captured but **could not be read** here (no `pdftotext`, no `pypdf`), so
automated submission, revenue share, AI rules, fees and exclusivity are still UNKNOWN. See "Tick 2 reading" at the end.

**Date:** 2026-09-27
**Ordered by:** `research/channel-loop/BOARD-LOOP.md:122-126` (candidate 6) and `research/channel-loop/ZERO-TESTS.md:10`
(row 1: "automated or API submission, payout countries and forms, account requirements, content rules").
**Admission rule being tested (BOARD-LOOP.md:125):** admit to build only when the terms allow runner-operated submission
or an API/CLI exists; Israel is not excluded and no camera step appears; the owner has said yes to proposed step 10;
BBU < 6.

## Grades
- **RENDERED**: the sentence is quoted from the stored capture, with its line number (`grep -n`).
- **UNKNOWN**: the capture does not answer it. Nothing below is filled in from general knowledge.

---

## 1. What was read

| File | What it is |
|---|---|
| `research/rendered/crazygames-faq.txt` (832 lines) | extracted text of the page, read in full |
| `research/rendered/crazygames-faq.html` | the raw HTML, read only for link targets (which page each "see our Terms" points to) |
| `research/rendered/crazygames-faq.meta.json` | capture metadata |

From the `.meta.json`: `url` = `https://docs.crazygames.com/faq/`, `fetchedAt` = **`2026-09-27T22:45:58.479Z`**,
`status` = 200, `byteLength` = 100974, `truncated` = false, `firstFetch` = true,
`sha256` = `b134daf3d30414638aa23b3af90a4c33875206105641f4390b98871bc74466a2`. Captured by
`.github/workflows/render-watch.yml`.

**Only this one page was captured.** The other pages ZERO-TESTS and BOARD-LOOP named (`/payouts/`, the developer
terms, the Basic Launch page) are **not** in `research/rendered/` (`ls research/rendered/ | grep -i crazy` returns only
the three `crazygames-faq.*` files). The FAQ sends most money and rules questions to them (see §3).

---

## 2. The questions

### Q1. Can a game be submitted by a brand/studio account, by API/CLI or automated upload, or only by a human in a web portal?

**Answer: the only submission path the page describes is the Developer Portal, including a drag-and-drop upload area.
No submission API or CLI is mentioned. Whether an account may be held under a brand/studio name, and whether an
agent may operate it, is not on this page.**

- faq.txt:806 (RENDERED): "To publish a game on CrazyGames, developers submit their HTML5 build through the developer portal , integrate the CrazyGames SDK, and provide required metadata such as descriptions, thumbnails, and instructions."
- faq.txt:590 (RENDERED): "Yes, you can update your game at any time through your developer account. Simply upload the updated files and submit them for approval."
- faq.txt:650 (RENDERED): "Just drag the Build and StreamingAssets folder in the upload area on our developer portal."
- faq.txt:446 (RENDERED): "Yes, we provide a preview environment via our Developer Portal to test how your game will look on CrazyGames. You can easily reach it via Submit a game and test different versions before actually submitting."
- faq.txt:774 (RENDERED), on who may submit: "Yes. CrazyGames works with a wide range of developers, from solo creators and hobbyists to indie teams and established studios. Team size is not the deciding factor."
- faq.txt:573 (RENDERED), on how acceptance is reported: "We'll let you know via email."
- The only "API" on the page is a navigation item, faq.txt:63 "Leaderboards API", which is a game-side leaderboard feature, not a submission route.
- **Submission API / CLI / automated upload: NOT ON THIS PAGE.** Grade **UNKNOWN**.
- **Account in a brand or studio name (rather than a person's name): NOT ON THIS PAGE.** Line 774 says studios are
  welcome as developers; it says nothing about what name the account is registered in. Grade **UNKNOWN**.
- **Whether the terms permit an agent or automation to operate the portal: NOT ON THIS PAGE.** Grade **UNKNOWN**.

The portal links in the HTML are `https://developer.crazygames.com/games` ("Submit a game", faq.html:231) and
`https://developer.crazygames.com/` (faq.html:3022, 3236). BOARD-LOOP.md:124 records that `developer.crazygames.com`
returns 403 from this container, so the portal itself is not a readable source here.

### Q2. Which countries are paid, by what method (Tipalti? PayPal?), what threshold, what NET terms?

- **Method: RENDERED.** faq.txt:641: "We support payouts via wire transfer or PayPal. For more information, see our Terms & Conditions ."
- **Threshold and rollover: RENDERED.** faq.txt:639: "Payments are made monthly once your balance reaches the €100 minimum threshold. If you don't reach this amount in a given month, your earnings roll over to the next."
- **Schedule: RENDERED as "monthly"** (same sentence, line 639). **NET terms (how many days after month end): NOT ON
  THIS PAGE.** Grade **UNKNOWN**.
- **Tipalti: NOT ON THIS PAGE.** The word does not appear anywhere in the capture (`grep -n -i tipalti` returns
  nothing). Grade **UNKNOWN**. BOARD-LOOP.md:126 assumed a Tipalti payee form; this page does not support or refute that.
- **Payout countries: NOT ON THIS PAGE.** The only country sentence is about *submissions*, not payouts.
  faq.txt:452 (RENDERED): "We welcome submissions from developers all around the world, there are no location restrictions. What matters most to us is the quality of your game, not where you're based."
  That settles that an Israeli-based developer may **submit**. It does not say that one can be **paid**. Israel is not
  named anywhere in the capture (`grep -n -i israel` returns nothing). **Israel payability: UNKNOWN.**

### Q3. What account and identity requirements apply?

**NOT ON THIS PAGE.** Grade **UNKNOWN.** The page mentions a "developer account" (faq.txt:590) and email notifications
(faq.txt:586: "you can also manage your email notification settings to avoid inbox overload"), which means the account
has a mailbox. It says nothing about identity verification, KYC, legal name vs brand name, company vs individual,
tax forms (W-8BEN or other; `grep -i "tax\|w-8"` returns nothing), or age. What an account holder must supply to be
paid is deferred to the Terms (faq.txt:641).

### Q4. Revenue share terms for Basic Launch vs Full Launch?

- **Basic Launch earns nothing: RENDERED.**
  faq.txt:420: "Basic Launch: The SDK is optional. You can go live without it, and monetization isn't available at this stage."
  faq.txt:533: "During Basic Launch, ads are temporarily disabled for a few key reasons:"
- **Full Launch is where ads switch on: RENDERED.**
  faq.txt:541: "Once your game shows strong performance and passes Basic Launch, it becomes eligible for Full Launch. At that point, ads are enabled and your game can start benefiting from broader promotional exposure."
  faq.txt:517: "Games that perform well during Basic Launch and are updated to meet our Full Requirements are reviewed once more by our QA team before moving to full launch."
  faq.txt:422: "Full Launch: The SDK is required. It unlocks monetization and key platform features, and for most developers it's a one-time setup that adds:"
- **Monetization eligibility conditions: RENDERED.** faq.txt:607-617: "Yes, once your game meets our requirements, you can start earning through our monetization system." / "To be eligible, your game needs to:" / "Not include branding from another game portal" / "Integrate the CrazyGames SDK" / "Not contain external advertisements" / "Be original and clearly distinguishable from existing games"
- **The share itself (percentage or formula): NOT ON THIS PAGE.** Grade **UNKNOWN.** The page confirms a share exists
  (faq.txt:675: "Developers monetize through advertising revenue share and optional in-game purchases.") and then
  defers: faq.txt:633-635: "Earnings vary depending on how your game performs. Key factors include player engagement, retention, and overall popularity, as well as advertiser demand." / "The better your game performs with players, the more it can earn. For more details, see our Terms & Conditions ."
- **Basic Launch exposure** (the reason the board ranked this candidate): faq.txt:503 (RENDERED): "It will be shown to a small segment of players, helping us understand how it performs in a live environment." The
  board's figure of "≥500 real players for 7-21 days" (BOARD-LOOP.md:124, sourced to the scouts) is **NOT ON THIS
  PAGE** and stays scout-grade until the Basic Launch page is rendered. faq.txt:596 (RENDERED) adds only: "For example, new games may receive an initial boost to help them reach an audience."

### Q5. Content rules: clones, asset flips, AI-generated content?

- **Clones and asset flips are a rejection reason: RENDERED.** faq.txt:481-495 list reasons a game fails the initial QA
  check, "including (but not limited to):" — faq.txt:483 "Bugs or broken mechanics", faq.txt:485 "Missing English-language support", faq.txt:487 "Unoriginal content (e.g. clones or asset flips)", faq.txt:489 "Inappropriate themes or content", faq.txt:491 "Not meeting our Developer Requirements, Terms & Conditions , or ethical standards", faq.txt:493 "Does not adhere to PEGI-12 guidelines", faq.txt:495 "Content is targeted for kids".
- **Originality again as a monetization condition: RENDERED.** faq.txt:617: "Be original and clearly distinguishable from existing games"
- **Distribution rights: RENDERED.** faq.txt:436: "You can publish on CrazyGames even if your game is already live or has been previously published on mobile, Steam, or other platforms, as long as you hold the distribution rights."
- **Termination on a violating update: RENDERED.** faq.txt:529: "Game and art updates for games in Basic Launch go live instantly. Updates that violate the Terms and Conditions will result in the games being terminated immediately."
- **What a submission must include: RENDERED.** faq.txt:467-475: "To submit your game, you'll need:" / "Your game build for the web" / "SDK integration" / "Game metadata (description, instructions, thumbnails)" / "Design and video for the game cover and game trailer". (Note the tension with faq.txt:420, which calls the SDK optional for Basic Launch. The page does not resolve it.)
- **AI-generated content: no rule on this page. Grade UNKNOWN as policy.** The only AI text is advice in the
  "Web Games 101" section, not a rule: faq.txt:786-790: "AI is also changing the landscape. Today, you can use AI tools to:" / "Generate code snippets or even entire game mechanics" / "Create art, sound effects, and music"; and faq.txt:796: "In practice, many developers now combine these approaches, using AI to speed things up, no-code tools to prototype, and coding to refine and scale their games."
  It is permissive in tone, but it neither permits nor forbids AI-generated games or assets in the Terms' sense, and it
  says nothing about disclosure. Do not read it as a policy.

### Q6. Is there any fee to the developer?

**No fee is named anywhere on the page, and the page does not state that there is none. Grade UNKNOWN.**
(`grep -n -i -E "\bfees?\b"` finds only faq.txt:701, about mobile: "On mobile, high UA costs and platform fees can make scaling expensive and risky.")
What the page does settle about costs:
- **Hosting and CDN are CrazyGames': RENDERED.** faq.txt:646: "All the game files you upload on Developer Portal are hosted by us, and they are distributed via a CDN."
- **Multiplayer servers are the developer's cost: RENDERED.** faq.txt:664: "No, we only host the game files. For multiplayer servers, you'll need your own solution, for example, Photon ." A ₪0 line must therefore be single-player (or peer-to-peer with no paid backend).
- **No paid user acquisition is needed: RENDERED** (marketing claim, not a fee statement). faq.txt:679: "On CrazyGames, developers launch directly to over 50 million monthly active users with zero user acquisition costs."

---

## 3. Verdict for the board: **NEEDS_MORE**

Nothing on this page **fails** the test: submissions are open to all locations (faq.txt:452), no camera step and no
customer contact appear, no developer fee is named, hosting is theirs (faq.txt:646), and payout is by wire or PayPal
with a €100 rollover threshold (faq.txt:639-641). But the three gates that decide admission are all **UNKNOWN** here:

1. **Runner-operated submission.** The page describes only a human-style portal with a drag-and-drop upload area
   (faq.txt:650, 806) and names no API or CLI. Whether the terms let an agent operate that account is not stated.
   If every new game needs a human to upload it, that is per-item owner work and the line fails the mandate.
2. **Israel payability and identity.** Payout countries, KYC and tax forms are not on the page (§Q2, §Q3).
3. **The revenue share itself.** Basic Launch earns ₪0 by design (faq.txt:420); the Full Launch percentage is not stated.

The page defers every one of these to one document, linked six times in the HTML (faq.html:3020, 3050, 3126, 3131,
3134, 3137), including directly under "How will I be paid?":

- **Settles gates 1-3 (most likely): the developer terms PDF,
  `https://files.crazygames.com/documents/developer_terms_20250818.pdf`**

Two further pages are named in the capture and would settle the rest:

- **Payout countries, method details, Tipalti or not:** the docs' own Payouts page, linked in the navigation
  (faq.txt:269 "Payouts"; faq.html:2400 `href="../payouts/"`), i.e. `https://docs.crazygames.com/payouts/`
- **Basic Launch exposure numbers (the board's "≥500 players, 7-21 days"):** the page the FAQ calls its
  "Launching on CrazyGames" guide (faq.html:3027, 3064 `href="/resources/basic-launch-metrics/"`), i.e.
  `https://docs.crazygames.com/resources/basic-launch-metrics/`

Next render-watch dispatch: those three URLs. The PDF needs a text extractor in the workflow; a PDF stored as bytes is
not a reading (see the `.meta.json` note: "Storing bytes is not reading them").

---

## 4. What the owner would have to do if admitted

From this page alone (the terms may add more):

**One-time**
- **A CrazyGames developer account** (proposed step 10, BOARD-LOOP.md:209). The page confirms an account with a
  mailbox exists (faq.txt:586, 590). What identity it takes, and whether it can be under the brand "Mehudak", is
  **UNKNOWN**.
- **A brand mailbox the agent can read** (proposed step 8, BOARD-LOOP.md:207), because acceptance is reported by email
  (faq.txt:573).
- **Payout details, only after a Full Launch**: wire-transfer bank details or a PayPal account (faq.txt:641). Whose
  legal name, what tax form, and whether Israel is served are **UNKNOWN**.
- Step 2 (tax file and Bituach Leumi) applies to any earning line (BOARD-LOOP.md:126); its cost under the ₪0 rule is
  being measured separately (ZERO-TESTS rows 7-9).

**Recurring**
- **Per game: an upload through the Developer Portal** (faq.txt:590, 650, 806), plus metadata, thumbnails, a cover
  and a trailer video (faq.txt:473-475). The metadata, art and trailer are game assets the agent can make; the trailer
  is a game trailer, and nothing on the page asks for a person on camera. **The upload is the problem**: unless the
  terms allow the agent to operate the portal, every game and every update (faq.txt:590) would be an owner action,
  which the mandate does not allow.
- Payouts arrive monthly once €100 is reached (faq.txt:639); the page names no recurring owner step for receiving them.

**Does anything cost the owner money?** Nothing on this page is a charge to the developer: no submission, listing or
account fee is named (grade UNKNOWN, since absence is not a statement), hosting is CrazyGames' (faq.txt:646), and user
acquisition is not needed (faq.txt:679). The one cost the page names is multiplayer servers (faq.txt:664), avoided by
building single-player games. Bank or PayPal charges on an incoming payout are not addressed on the page (UNKNOWN).
Under the ₪0 rule, the line can be prepared at ₪0 but **cannot be admitted to build** until the terms PDF settles
runner-operated upload and Israel payability.

---

## Tick 2 reading (28.9.2026)

Same grades as above: **RENDERED** = quoted from the stored capture with its line number; **UNKNOWN** = the capture
does not answer it. Nothing here comes from general knowledge.

### T2.1 What was read

| File | What happened |
|---|---|
| `research/rendered/crazygames-payouts.txt` (411 lines) | read in full. `.meta.json`: `url` = `https://docs.crazygames.com/payouts/`, `fetchedAt` = **`2026-09-28T00:51:58.670Z`**, `status` = 200, `byteLength` = 59466, `truncated` = false, `sha256` = `a69a665724afaccc062b381aaa6392a1bddac40fba0c21350225f02837b73203` |
| `research/rendered/crazygames-developer-terms.pdf` (304,839 bytes) | **could not be read.** `.meta.json`: `url` = `https://files.crazygames.com/documents/developer_terms_20250818.pdf`, `fetchedAt` = **`2026-09-28T00:51:57.602Z`**, `status` = 200, `contentType` = `application/pdf`, `truncated` = false, `sha256` = `d409a8da62d1e5e250f96a2a1957edae9cae4bf9357a82fcf488e0b23eb93c15`, **`textPath` = null** |

Why the PDF is unread: `pdftotext` is not installed in this container (`which pdftotext` prints nothing;
`find / -name 'pdftotext*'` finds nothing) and python3 has no `pypdf` (`ModuleNotFoundError: No module named 'pypdf'`).
No other extractor was tried; a home-made decoder of the compressed streams would not count as a reading. The only
thing legible without an extractor is the uncompressed Info dictionary at the top of the file,
`/Title (CrazyGames_Developer Terms_20250818)` and `/Producer (Skia/PDF m140 Google Docs Renderer)`: that shows the
capture is the terms document and not an error page, and nothing more. The runner did not write a text file because
`scripts/render-watch.mjs:557` writes a `.txt` only when the content type is HTML.

**Every question below that depends on the developer terms therefore stays UNKNOWN.** The Payouts page is the only
new text.

### T2.2 Answers

#### A. Does anything forbid automated or scripted submission, or require a human to upload?

**UNKNOWN.** The Payouts page does not address game submission by any method. `grep -n -i` for `upload`, `human`,
`api` and `automat` finds no submission sentence: `api` hits only the nav item payouts.txt:63 "Leaderboards API", and
`automat` hits only Tipalti's own payment automation (payouts.txt:255, 347) and payment reprocessing (payouts.txt:405).
The onboarding it describes is done in the web portal (RENDERED):
- payouts.txt:269 "Log into the Developer Portal ."
- payouts.txt:271 "Navigate to Account → Billing ."
- payouts.txt:273 "Complete all required fields in Steps 1–4 ."

**New constraint on submission (RENDERED):** billing onboarding is a precondition of submitting a game.
- payouts.txt:337 (the page's own FAQ heading): "Why am I unable to submit my game without completing the payment setup?"
- payouts.txt:339: "To create your self-billing invoices based on your monthly earnings, we need a few details from you. Please provide your personal or company information, including your address and country. You can complete the onboarding process without adding payment details by selecting the “hold payments” option in step 2."
- payouts.txt:257: "Before receiving any payments, you’ll need to complete a short onboarding via our Developer Portal . We highly recommend finishing this step early to prevent delays."

This is a **one-time** step (the mandate allows it), but it moves identity (personal or company information, address,
country) to **before the first game**, not after a Full Launch (see T2.3).

#### B. Israeli payouts: eligibility, method, threshold, NET terms, identity and tax forms

- **Israel eligible: UNKNOWN.** Israel is not named (`grep -n -i israel` returns nothing). The page says availability
  is per country and names a fallback for unserved countries (RENDERED):
  - payouts.txt:293: "The availability of each method depends on your country and local financial regulations. Each method may include processing fees and minimum thresholds."
  - payouts.txt:375-377: "Tipalti doesn’t process payments to my country. What should I do?" / "Please contact [email protected] so we can investigate your specific situation. You can still receive monthly invoices by putting your payment method on ‘Hold Payments’."
  (The address is obfuscated in the text capture as "[email protected]".)
- **Method: RENDERED. Tipalti** (this corrects §Q2, where Tipalti was NOT ON THE FAQ PAGE).
  - payouts.txt:255: "CrazyGames uses Tipalti , a global payment automation platform, to handle monthly developer payouts securely and efficiently."
  - payouts.txt:283-291: "We offer multiple payout options through Tipalti" / "Wire Transfer" / "Direct Deposit / ACH" / "eCheck" / "PayPal"
  - PayPal where it is not offered, payouts.txt:371-373: "Why is PayPal not shown as an option in my country?" / "In the first step of registration, choose your Payment Country at the bottom of the address form and set this to ‘United States’. PayPal transactions are processed in USD, so we strongly encourage you to select USD as currency, otherwise FX fees will be charged."
    Whether that route is open or sensible for an Israeli resident is not stated (UNKNOWN); it is recorded, not recommended.
  - Payee in one country, bank in another, payouts.txt:365: "In the first step of registration, click on ‘if you want to be paid in a country different than the above, select a country below’ at the bottom of the address form:"
- **Threshold: RENDERED, €100 to pay out; €10 to invoice.**
  - payouts.txt:299: "Regardless of payment method selected, CrazyGames requires a minimum of €100 in earnings before issuing a payout."
  - payouts.txt:303: "Payments are made monthly, or once your total unpaid earnings reach €100."
  - payouts.txt:397: "In general we advise you to wait a few business days after month-end. Invoices appear under Payment & Invoice History once they're generated. We have an invoicing threshold of 10 EUR, amounts below the threshold are transferred to next month’s earnings."
- **NET terms: RENDERED, NET 60 contractual, NET 10 aimed for** (this settles the §Q2 UNKNOWN).
  - payouts.txt:305: "While CrazyGames operates with NET 60 payment terms, we currently aim to process payments sooner, typically by the 10th of the following month (so NET 10 in practice)."
  - payouts.txt:309: "You earn €100 in January → An invoice is generated in early February → Payment is processed mid-February."
  - payouts.txt:313: "You earn €30 in January and €70 in February → An invoice for €30 is generated in early February, and an invoice for €70 is generated early March → Both invoices are paid out together mid-March."
  - payouts.txt:317: "Actual receipt dates depend on your selected method, local bank processing, and country-specific factors."
- **Identity and tax form: RENDERED that a Tipalti wizard chooses the form; WHICH form (W-8BEN or other) is UNKNOWN.**
  `grep -n -i "w-8\|w8"` returns nothing.
  - payouts.txt:369: "Tipalti’s built-in wizard will guide you through selecting the correct form based on your location and entity type."
  - payouts.txt:351: "Login to the Developer Portal → Go to Account > Billing → Complete all sections (Address, Tax Details, Payment Info)."
  - payouts.txt:279: "Any errors or incomplete details can delay your payouts. Some fields may require additional verification."
  - What "additional verification" involves (document upload, camera, video) is **UNKNOWN**; no camera, selfie,
    passport or identity-document step is named (`grep -n -i "camera\|selfie\|passport\|identity"` returns nothing).
- **Per-payout paperwork: none named for the developer; CrazyGames issues the invoices (RENDERED "self-billing").**
  - payouts.txt:333: "The amounts on the self-billing invoice are leading. Minor discrepancies with reporting can exist due to timezone & cut-off differences"
  - payouts.txt:393: "If you put your payment method on ‘Hold Payments’ you will receive a monthly self-billing invoice, but no payout. When, after a few months, you decide the amount is high enough to be paid out, you can update your payment method and all self-billing invoices will be paid out in 1 transaction, so you save on transaction costs."
  Whether Israeli bookkeeping requires the owner to issue a document per payout is outside this capture (UNKNOWN;
  it belongs to the step-2 measurement, ZERO-TESTS rows 7-9).

#### C. Revenue share, Basic vs Full Launch

**UNKNOWN.** The Payouts page names no share, percentage or formula (`grep -n -i "share\|percent\|%"` returns
nothing; "Basic Launch" appears only as the nav item payouts.txt:87 "Basic Launch Guide"). The FAQ already deferred the
figure to the terms (§Q4); the terms are unread.

#### D. Rules on AI-generated content or assets

**UNKNOWN.** Nothing on the Payouts page; the only "AI" is the site widget payouts.txt:411 "Ask AI". The terms are unread.

#### E. Any fee charged to developers

- **A CrazyGames fee (listing, submission, account, revenue deduction): UNKNOWN.** None is named on the Payouts page;
  absence is not a statement, and the terms are unread.
- **Payout-side charges exist and come out of what arrives: RENDERED.**
  - payouts.txt:293: "Each method may include processing fees and minimum thresholds."
  - payouts.txt:361: "Yes, certain payment methods allow selection of a different payout currency. Be aware that foreign exchange (FX) fees apply when converting from USD/EUR to another currency."
  - payouts.txt:389: "Your bank may deduct intermediary fees or FX conversion charges . CrazyGames has no control over these charges. Please contact your bank for full fee breakdowns and ask if there’s a preferred intermediary bank that could reduce costs."
  The amounts are UNKNOWN. These reduce a payout; the page names nothing the owner pays out of pocket. Holding payments
  and paying out in one transaction (payouts.txt:393) is the page's own way to cut the per-transaction cost.

#### F. Any exclusivity

**UNKNOWN.** `grep -n -i exclusiv` returns nothing in either text capture (payouts.txt, faq.txt). faq.txt:436 (§Q5)
permits a game that was **previously** published elsewhere; it says nothing about publishing elsewhere **after**
CrazyGames. The terms are unread.

### T2.3 Corrections to tick 1 (the earlier text is left as written)

- §Q2 "Tipalti: NOT ON THIS PAGE" was true of the FAQ; Tipalti is now RENDERED (payouts.txt:255).
- §Q2 "NET terms ... UNKNOWN" is now RENDERED: NET 60, NET 10 aimed for (payouts.txt:305).
- §Q2 methods: the FAQ named two (faq.txt:641, wire or PayPal); the Payouts page names four, country-dependent
  (payouts.txt:283-293).
- §4 "Payout details, only after a Full Launch" and BOARD-LOOP.md:124 "After a Full Launch invitation only: a Tipalti
  payee form" are **superseded in part**: personal or company information, address and country are required before a
  game can be submitted (payouts.txt:337-339). Only the payment method can wait, via "hold payments" (payouts.txt:339).
  The Tipalti onboarding therefore belongs to proposed step 10 itself. It stays one-time.
- The "personal or company information" wording (payouts.txt:339) means a company payee is accepted. Whether an
  unregistered brand name ("Mehudak") can be the payee or account name is **UNKNOWN**.

### T2.4 Verdict for the board (tick 2): **NEEDS_MORE**

Nothing read so far **fails** the test. Israel is not excluded (not named either way); no camera step is named; payout
paperwork is a one-time onboarding followed by self-billing invoices CrazyGames generates (payouts.txt:333, 339, 393);
the €100 threshold with NET 60 (NET 10 aimed for) is in writing (payouts.txt:299, 305). Still open, and what settles each:

1. **Automated or agent-operated submission, revenue share (Basic vs Full), AI-content rules, developer fees,
   exclusivity.** All five sit in the developer terms, which are captured but unread. **Settles it:** a text extraction
   of the stored PDF. Either give `scripts/render-watch.mjs` a PDF branch next to line 557 (run `pdftotext -layout` on
   the runner and write `research/rendered/crazygames-developer-terms.txt`, so `textPath` is no longer null), or make
   `pypdf` available in the container. Then grep that text for `upload`, `submit`, `automat`, `script`, `bot`,
   `account`, `agent`, `share`, `%`, `AI`, `artificial`, `generat`, `fee`, `exclusiv` and quote the lines. No new fetch
   is needed; sha256 `d409a8da…3c15` pins the document to be read.
2. **Israel payability and the tax form.** Not on any public page captured. The Payouts page defers both to the
   in-portal Tipalti wizard (payouts.txt:369) and to support (payouts.txt:377). **Settles it:** the one-time billing
   onboarding in proposed step 10 (Account → Billing, step 1 Payment Country and step 2 methods), recording whether
   Israel is offered, which methods, and which form the wizard selects; or one email from the brand mailbox (proposed
   step 8) to CrazyGames support asking whether Tipalti pays to Israel and by which methods. Because that onboarding is
   required before the first submission (payouts.txt:337), the board can ask for step 10 **before** the 5-10 agent-days
   of the first game are spent, and learn Israel payability without building anything.
3. **Whether the account or payee may carry the brand name.** Payouts page: "personal or company information"
   (payouts.txt:339) only. Settled by the terms text (item 1) or by the step-10 onboarding form (item 2).

---

## Tick 3 reading (28.9.2026): the developer terms, read from the PDF text

Grades for this section: **[RENDERED]** = quoted exactly from `research/rendered/crazygames-developer-terms.txt` with its
line number; **[INFERENCE]** = my reading, not the document's words. "Not found in the terms" means a `grep -n -i` of the
whole text returns no such clause; that is a [RENDERED] finding about the capture, recorded as absence, never filled in.

**What was read.** All 666 lines of `crazygames-developer-terms.txt`: the runner's `pdftotext -layout` output for the
stored PDF (the `.meta.json` `textPath` now names it; `sha256` is still `d409a8da…3c15`, the bytes tick 2 pinned;
`fetchedAt` `2026-09-28T00:51:57.602Z`). The document is headed crazygames-developer-terms.txt:1 "DEVELOPER PORTAL TERMS AND CONDITIONS" and crazygames-developer-terms.txt:3 "Last updated: 18.08.2025"; the counterparty is a Belgian company, crazygames-developer-terms.txt:69-71 "Maxflow BV, a Belgian corporation", "which uses inter alia the tradename “CrazyGames”".

### T3.1 Revenue share
- **Percentage or split: not found in the terms.** [RENDERED] `grep -i share` returns nothing; `%` appears once, for the exclusivity uplift (T3.4).
- [RENDERED] How it is computed: crazygames-developer-terms.txt:243-244 "The amount of the Compensation due to Developer will be calculated by Publisher on a monthly basis on the basis of the following objectively quantifiable criteria:"; crazygames-developer-terms.txt:247-248 "The popularity of the Game(s) in terms of the number of users browsing to the Game(s) on the Portal Site; and"; crazygames-developer-terms.txt:251 "The performance of in-game ads shown and the interest of advertisers in the Game(s)."; crazygames-developer-terms.txt:254-256 "the amount of the Compensation is not subject to the discretion of Publisher but depends on the web traffic the Game(s) realizes on the Portal Site and thus the advertising displays it generates."
- [RENDERED] Full Launch only: crazygames-developer-terms.txt:222-224 "provided that the following conditions are met and the Game is released in Full Launch:"; crazygames-developer-terms.txt:238-240 "if the Game does not meet all of the conditions mentioned above, and if the Game is accepted by Publisher, no Compensation will be due by Publisher to Developer unless otherwise agreed." Promotion is CrazyGames' call: crazygames-developer-terms.txt:46-48 "The transition to Full Launch is determined solely by CrazyGames based on editorial, quality, and/or performance criteria."
- [INFERENCE] The terms name the inputs, not a rate, so no per-play earning can be projected from them. Basic Launch earns nothing under the contract, matching faq.txt:420.

### T3.2 Payment
- **Method or processor: not found in the terms** (no Tipalti, PayPal, wire or bank). [RENDERED] The developer's duty only: crazygames-developer-terms.txt:303-305 "providing accurate, up-to-date payment details in the billing section of the Developer Portal, that enable successful transfer of funds".
- **Timing, a correction.** [RENDERED] crazygames-developer-terms.txt:284-285 "All amounts payable to Developer are due and owing thirty (30) days after the date of Publisher’s invoice of such amounts." "NET 60" and "NET 10" are not in the terms (`grep -n 60` returns nothing); both come only from payouts.txt:305. [INFERENCE] The contractual term is 30 days after the self-bill, which the Payouts page says is issued early the next month (payouts.txt:309), so the note's "NET 60 contractual" should read "30 days after invoice per the terms; NET 60 per the Payouts page". The terms claim to be the whole deal: crazygames-developer-terms.txt:616-617 "These Terms and Conditions collectively set forth the entire agreement and understanding between the Parties".
- [RENDERED] Advertiser lag and offset: crazygames-developer-terms.txt:285-287 "Pay-out to Publisher by advertisers ranges however between thirty (30) and ninety (90) days after the end of the month during which the advertisements were shown."; crazygames-developer-terms.txt:289-290 "Publisher will have the right to offset the amount it did not receive against any payments due to Developer."
- [RENDERED] Threshold: crazygames-developer-terms.txt:296-298 "Payments of less than 100 EUR will be carried over to the next month until the amount of 100 EUR is reached. Publisher may decide, at its sole discretion, to waive these limits at the request of Developer." **Currency clause: not found in the terms**; EUR appears only in this threshold.
- **Who bears transfer or processing fees: not found in the terms.** [RENDERED] Taxes: crazygames-developer-terms.txt:293-294 "Payments are inclusive of VAT (unless a VAT exemption applies, or no VAT is due) and exclusive of any withholding taxes. Each Party shall be responsible for its own taxes of whatever nature." **Tax forms (W-8BEN or other): not found in the terms.** [INFERENCE] "exclusive of any withholding taxes" does not say whether anything is withheld from a payee outside Belgium; that stays UNKNOWN.
- [RENDERED] Self-billing: crazygames-developer-terms.txt:341-343 it applies "to the service consisting of the granting of licenses regarding a copyright or other similar rights in the sense of applicable tax legislation by the Developer"; crazygames-developer-terms.txt:348-349 "every self-bill will be considered accepted from a VAT viewpoint unless the Developer reacts within two weeks following the month in which the self-bill has been issued."; crazygames-developer-terms.txt:361-364 "It is the decision of Developer to register the self-bill in:" ... "Either a register of outgoing invoices per self-bill". [INFERENCE] The payee books each self-bill in its own invoice records, and the money is characterised as a copyright licence fee; both belong to the step-2 tax measurement (ZERO-TESTS rows 7-10), not to anything CrazyGames runs.

### T3.3 Eligibility, country, name
- [RENDERED] An individual may contract; no company is required: crazygames-developer-terms.txt:36-37 "“Developer” means any physical person or legal entity making available one or several Games through Publisher’s Developer Portal;"; crazygames-developer-terms.txt:77 "“You” means “Developer” (either a corporation or a physical person)."
- **Country restriction: not found in the terms** (`grep -i "countr\|israel"` returns nothing). [INFERENCE] Nothing in the contract excludes Israel; payability still turns on Tipalti (payouts.txt:293, 375-377).
- **Account or payee under a brand or trade name: not found in the terms.** The only trade name in the document is CrazyGames' own (crazygames-developer-terms.txt:71). [RENDERED] What the terms tie to a legal identity: crazygames-developer-terms.txt:386 "all information provided on the Developer Portal will be accurate, true and correct;"; crazygames-developer-terms.txt:547-549 a termination notice "must state the full legal name of the Developer, the title of the Game(s), and the reason for termination."; crazygames-developer-terms.txt:356-357 a non-acceptance notice is signed "including the name and position of the signatory".
- [RENDERED] What the brand may carry: crazygames-developer-terms.txt:110 "be allowed to promote the Game(s) using its own branding;"; crazygames-developer-terms.txt:152-154 a licence to "Developer’s trademarks, including logos and game covers, used for the Game(s), on the Portal Site".
- [INFERENCE] The contracting party must be a physical person or a legal entity; an unregistered brand is neither, so account and payee are the owner's legal identity (MISSION.md's "payout and platform identity" exception), while "Mehudak" can be what players see on the game, logo and cover. Whether the public developer name on the site may be the brand: not found in the terms.

### T3.4 Exclusivity
- [RENDERED] Default non-exclusive: crazygames-developer-terms.txt:101-103 "The right will be non-exclusive, but the Developer may choose to make the Game(s) exclusively available to the Publisher, in which case Developer will be entitled to a higher compensation pursuant to article V."
- [RENDERED] The one tier: crazygames-developer-terms.txt:263-264 "Developer will be entitled to an increase in Compensation of 50% if the following conditions are met and Developer opts in for the time-based exclusivity:"; crazygames-developer-terms.txt:267-268 "The Game is exclusively available on the Portal Site for two (2) months after the Full Launch release date."; crazygames-developer-terms.txt:270 "The Game is hosted by Publisher."; crazygames-developer-terms.txt:272-273 "The increase in Compensation will only be due for the two (2) months the Game is exclusively available on the Portal Site."; crazygames-developer-terms.txt:275-276 "Platforms such as Steam, Apple app store and Google play store are not considered browser gaming websites."
- [RENDERED] CrazyGames judges compliance: crazygames-developer-terms.txt:279-280 "If Publisher has determined that the conditions were not complied with, the Compensation due to Developer may be affected and reduced". Basic Launch is crazygames-developer-terms.txt:16-17 "the initial limited public release of a Game on the Portal Site to test its user metrics." and earns no Compensation (T3.1).
- [INFERENCE] Non-exclusive is the default and needs no action; other browser portals stay open only for builds free of their branding, crazygames-developer-terms.txt:227 "The Game does not contain any form of branding of another browser game platform or portal;".

### T3.5 Content and technical rules
- **AI-generated content or AI-assisted development: not found in the terms** (`grep -i "artificial\|\bAI\b"` returns nothing; "generat" hits only player-generated content, lines 198-202, and ad displays, line 256).
- **Automated, scripted or bulk submission: not found in the terms.** No upload method, API, rate or cap on the number of games is named. [RENDERED] The only submission wording: crazygames-developer-terms.txt:50-51 "“Game” means the gaming software developed by Developer and submitted to the Publisher through the Developer Portal;". [INFERENCE] Silence neither allows nor forbids runner-operated submission, so the admission condition "terms allow runner-operated submission" (BOARD-LOOP.md:125) is neither met nor failed by this text.
- [RENDERED] Quality: crazygames-developer-terms.txt:235-236 "The Game and its total game assets must maintain a level of originality that make it distinguishable from existing games."; crazygames-developer-terms.txt:412 "the availability of, and support for the Game(s) will be at all times of a high quality"; crazygames-developer-terms.txt:121-123 acceptance "may be withheld at its full discretion without the need to provide any justification for its decision. Publisher reserves the right to remove a Game from the Portal Site at any time, at its sole discretion and without prior notice."
- [RENDERED] Rules incorporated by reference and not yet read: crazygames-developer-terms.txt:63-66 "“Publisher Guidelines” means the guidelines of Publisher with respect to the quality of games, in-game ads and SDK available on the Developer Portal which may be amended from time to time. Developer’s continued use of the Developer Portal or submission of Games constitutes acceptance of these guidelines;"
- [RENDERED] Ownership warranties: crazygames-developer-terms.txt:396-397 the Game "is and will be of original development by (employees of) Developer"; crazygames-developer-terms.txt:393-394 Developer "is and will be the owner of all intellectual property rights in the Game(s) under copyright, trademark, trade secret, and other applicable law or has acquired the necessary rights". [INFERENCE] Whether AI-generated code or art counts as "original development" the Developer owns is not addressed; that is where an AI question would land.
- [RENDERED] Prohibited: crazygames-developer-terms.txt:182 "(iii) obscene, indecent, pornographic or otherwise objectionable; or"; crazygames-developer-terms.txt:183-184 anything "protected by copyright, trademark, trade secret, right of publicity or privacy or any other proprietary right, without the express prior written consent of the applicable owner."; crazygames-developer-terms.txt:415-416 "be violent, sexual or abusive in nature so as to be reasonably likely to cause offense".
- [RENDERED] SDK and ads: crazygames-developer-terms.txt:229-230 "The Game integrates the Publisher SDK to enable advertisements and maintains integration with the latest supported version of the Publisher SDK as reasonably required;"; crazygames-developer-terms.txt:232-233 "The Game does not include advertisements other than advertisements integrated via the SDK of the Developer Portal;"; crazygames-developer-terms.txt:137-138 "Only upon approval of Publisher, Developer may include in-game transactions."
- [RENDERED] Open source: crazygames-developer-terms.txt:140-143 no "open source or other software that is licensed under terms that purport to bind Publisher to contractual obligations (e.g. the GNU General Public License or Lesser General Public License), without prior discussion with and separate written agreement from Publisher." [INFERENCE] No GPL/LGPL code in a build; CC0 assets are not affected.
- [RENDERED] No cross-promotion without written consent: crazygames-developer-terms.txt:591-592 "advertise or promote its own or third party content, websites, products or services through the Portal Site, the Game(s) or otherwise." [INFERENCE] A game cannot send players to the brand's other lines.

### T3.6 Termination, forfeiture, clawbacks, liability
- [RENDERED] CrazyGames may end it at will: crazygames-developer-terms.txt:564-566 "Publisher, at its discretion, may decide to quit publishing a Game on the Portal Site and terminate these Terms and Conditions with Developer at any time. Such decision by Publisher will have an immediate effect."; crazygames-developer-terms.txt:566-567 "Publisher will not be liable for any damages for deciding not to make (or from ceasing to make) a Game available".
- [RENDERED] Term and tail: each game runs to one year after Full Launch (crazygames-developer-terms.txt:535-536), then crazygames-developer-terms.txt:545-547 "automatically renew for successive one (1) year periods unless either Party provides written notice of termination at least one (1) month before the end of the then-current Term."; afterwards crazygames-developer-terms.txt:561-562 "Publisher is entitled (but not obliged) to maintain the publication of the Game on any Portal Site for up to a one (1) year period." **Compensation during that transition year: not found in the terms. Loss of accrued earnings on termination: not found in the terms.**
- [RENDERED] Forfeiture: crazygames-developer-terms.txt:309-311 "If a payment balance remains unclaimed or unpaid for eighteen (18) months or more from the date of the earliest unpaid corresponding invoice, Publisher shall inform Developer of the pending forfeiture."; crazygames-developer-terms.txt:316-318 after "a minimum total period of twenty-four (24) months" the amount "shall be deemed forfeited by the Developer". [INFERENCE] "Hold Payments" (payouts.txt:393) must be released before 18 months.
- [RENDERED] Clawbacks: the advertiser offset (crazygames-developer-terms.txt:289-290, T3.2), the exclusivity reduction (crazygames-developer-terms.txt:279-280, T3.4), and crazygames-developer-terms.txt:445-447 "Publisher will be entitled to withhold any and all sums it was forced to pay to a third party due to an infringement of copyright or other intellectual property right by a Game of Developer, from the Compensation due to Developer".
- [RENDERED] Developer liability: crazygames-developer-terms.txt:440-443 "Developer will indemnify and hold Publisher harmless from and against all claims, suits, demands, actions, judgments, penalties, damages, costs and expenses (including attorney's fees and costs), losses or liabilities of any kind arising from a claim that a Game infringes a copyright or other intellectual property right"; crazygames-developer-terms.txt:200-201 the Developer will "indemnify Publisher for any damages resulting from such player generated content."; crazygames-developer-terms.txt:427-429 failing to answer a take-down notice in time "will be considered an incurable material breach of this Agreement."
- [RENDERED] The cap protects CrazyGames only: crazygames-developer-terms.txt:456-457 "IN NO EVENT SHALL PUBLISHER’S LIABILITY EXCEED THE COMPENSATION PAID OR PAYABLE TO DEVELOPER"; crazygames-developer-terms.txt:464-465 "Except for, and without prejudice to Developer’s full liability and indemnification obligations set forth in Article IV.5 and VII.4". [INFERENCE] The developer's IP exposure is uncapped; recorded asset provenance (CC0/OFL or code-drawn, per game) is the control.
- [RENDERED] Changes, law, forum: crazygames-developer-terms.txt:628-629 "Publisher will have the right to amend or modify these Terms and Conditions."; crazygames-developer-terms.txt:635-636 "Continued use by the Developer of the Developer Portal, will irrefutably be considered as acceptance of the amended Terms and Conditions notified by Publisher."; Belgian law and the courts of Antwerp (crazygames-developer-terms.txt:647-652).

### T3.7 What costs money or needs the owner's identity
- **A fee charged to the developer: not found in the terms**; the only "fees" is attorney's fees inside the indemnity (crazygames-developer-terms.txt:442).
- [RENDERED] Hosting: Publisher hosting is one of the two delivery routes (crazygames-developer-terms.txt:159-161) and is a condition of the uplift (crazygames-developer-terms.txt:270); developer hosting is "at its own expense" (crazygames-developer-terms.txt:556). [INFERENCE] Publisher hosting keeps it at ₪0.
- [RENDERED] Recurring duties, not cash: crazygames-developer-terms.txt:206-207 "promptly correct all material errors or defects in the Game(s) reported by Publisher"; crazygames-developer-terms.txt:209-210 "(d) promptly respond to Publisher's questions regarding the Game(s)."; plus SDK upkeep (crazygames-developer-terms.txt:229-230). [INFERENCE] Agent work, but it needs the brand mailbox (proposed step 8) watched for the life of each game.
- [RENDERED] Identity: the contract is accepted by crazygames-developer-terms.txt:84-85 "clicking “I Accept” upon registration"; legal name, accurate information and signed notices as in T3.3. [INFERENCE] Registration and billing stay owner steps (MISSION.md: we never open an account in the owner's name); nothing in the terms requires the owner's name to be shown to players.
- [INFERENCE] Cash risks the terms create, none of them a charge: the uncapped IP indemnity (T3.6), any withholding tax (T3.2, UNKNOWN), and the payout-side bank and FX fees already recorded (T2.2 E).

### T3.8 Corrections to earlier ticks (earlier text left as written)
- [RENDERED] T2.2 B calls NET 60 "contractual"; the terms say 30 days after the invoice date (crazygames-developer-terms.txt:284-285). NET 60 is in writing on the Payouts page only (payouts.txt:305), not in the contract. [INFERENCE] BOARD-LOOP.md's kill test "the €100 threshold plus NET-60" should be read with 30 days after invoice.
- [RENDERED] §3 expected the PDF to settle gates 1-3 "most likely". It settles none of gate 1 (submission method) or gate 2 (Israel payability), and gate 3 only as a formula without a rate.
- [RENDERED] faq.txt:635 and faq.txt:641 send earnings and payment methods to the Terms; the terms name no rate and no payment method. faq.txt:675 calls it an "advertising revenue share"; the terms never say "share" and treat the money as a copyright licence fee (crazygames-developer-terms.txt:341-343).
- T2.2 F exclusivity "UNKNOWN" is now [RENDERED]: non-exclusive by default, opt-in two-month exclusivity for +50% (T3.4). T2.3's "a company payee is accepted" holds, and individuals are accepted too (crazygames-developer-terms.txt:36-37).

**Verdict for candidate CrazyGames: NEEDS_MORE**

The terms settle the money mechanics and none of them fails the test [RENDERED]: an individual may contract, no country is excluded, no developer fee is named, exclusivity is opt-in, and Compensation starts only at Full Launch and is due 30 days after CrazyGames' self-bill once €100 has accrued. Still UNKNOWN: the rate (inputs only, no percentage), whether our runner may operate the portal (the terms are silent), AI rules (silent here, but the incorporated Publisher Guidelines, crazygames-developer-terms.txt:63-66, are unread), and Israel payability (a Tipalti question, payouts.txt:375-377, left to proposed step 10 as T2.4 item 2 says). Single next check, ₪0 and owner-free: render the docs Requirements pages the FAQ points to as its rules (faq.txt:497; faq.html `href="../requirements/intro/"`, siblings `quality/`, `gameplay/`, `ads/`) and grep them for AI, automation and upload rules; that they are the public form of the Publisher Guidelines is [INFERENCE].

---

## Tick 4 reading (28.9.2026): the requirements pages

Grades as in tick 3: **[RENDERED]** = quoted from the stored text with its line number; **[INFERENCE]** = my reading.
"Not found" = a `grep -n -i` of all three texts returns nothing. **What was read, in full:** `crazygames-requirements-intro.txt`
(310 lines), `-quality.txt` (306), `-ads.txt` (310); URLs `docs.crazygames.com/requirements/{intro,quality,ads}/`, all
`fetchedAt` 2026-09-28T07:15Z, status 200, not truncated; sha256 `b64e9a7c…753c`, `7a411127…6204`, `5aed158d…1394`. The HTML
was opened only for link targets and the table's column layout.

### T4.1 Are these the "Publisher Guidelines"?
- **The name "Publisher Guidelines" is not found** in the three texts or their HTML. [RENDERED] They call themselves requirements, with optional guidelines inside: intro:185 "To be published on CrazyGames, your game must meet our requirements."; intro:262 "Additionally we offer some Quality Guidelines to optimize your game for success on the CrazyGames platform. These are optional"; quality:185 "The guidelines should be used alongside our mandatory requirements ."
- [INFERENCE] They match the terms' definition in subject ("quality of games, in-game ads and SDK", developer-terms:63-66) but not in place: the terms say "available on the Developer Portal", and these pages are on docs.crazygames.com. Whether this is the binding text, and whether the "optional" Quality page is binding under the terms: UNKNOWN.

### T4.2 AI content, automated submission, upload route
- **AI-generated content or AI-assisted development: not found.** The only "AI" is the docs widget intro:310, quality:306, ads:310 "Ask AI". Not allowed, not disclosed, not banned.
- **Automated, scripted or bulk submission; a cap on games; an upload API or CLI: not found.** [RENDERED] The one "API" is the game-side nav item intro:79 "Leaderboards API". The route named is the portal: "Submit a game" (intro:11) links to `https://developer.crazygames.com/games` (intro.html:231); intro:298 "On our Developer Portal you'll be able to preview your game."; intro:258 "As part of the submission process, you will also need to provide qualitative metadata (game description and controls) and Game covers (images and videos)."
- [INFERENCE] Same as the terms (T3.5): silence. Admission condition (BOARD-LOOP.md:125) not met; kill row "Terms forbid automated submission" not triggered.

### T4.3 Quality bars, Basic vs Full
- [RENDERED] Technical, Basic column (confirmed in the intro.html table): intro:205 "Initial download size &le; 50MB"; intro:206 "Total file size &le; 250MB ( 50MB without SDK )"; intro:207 "File count &le; 1500". Full adds intro:209 "SDK & GameplayStart event".
- [RENDERED] Gameplay: Basic intro:213 "Basic visual QA checks", intro:214 "Adhere to PEGI12"; Full intro:216 "Full visual QA check", intro:217 "Land directly in gameplay".
- [RENDERED] Mobile is optional and appears only as a guideline: quality:236 "The game interface is designed for the user's device (desktop and optionally mobile)."; for banners, ads:283 "(including on mobile)".
- **Loading-time limit: not found** (only the nav item intro:105 "Game Loading Tips"). **Performance:** guideline wording only (quality:228, 244).
- **Playtime, retention or conversion benchmarks: not found.** [RENDERED] Metrics are shown without thresholds: intro:274 "you'll be able to monitor key game metrics on your Developer Dashboard", intro:278 "Average playtime", intro:280 "Gameplay conversion", intro:282 "Retention". Progression is sent elsewhere: intro:189 "Review the Basic Launch Guide to understand how progression is evaluated." (href `/resources/basic-launch-metrics/`, unrendered). [INFERENCE] The kill-row benchmarks (10 min, D1 10-15%, 80%, BOARD-LOOP.md:126) remain scout-grade.

### T4.4 SDK and ads
- [RENDERED] Basic Launch: intro:189 "The CrazyGames SDK is optional and monetization is not available."; ads:180 "Advertisements will be disabled; no revenue will be shared."; ads:182 if the Ads SDK is integrated anyway, "The game will be rejected if it does not" run smoothly with ads disabled. Even in Basic, intro:222 "No external ads".
- [RENDERED] Full Launch: intro:191 "you are required to comply to all integration requirements listed below, including the CrazyGames SDK."; ads:184 "Only Ads requested through the CrazyGames SDK are allowed."; intro:225 "Works with AdBlock", with ads:299 "It is never allowed to block players with AdBlockers from playing".
- [RENDERED] Placement: ads:195-201 ads "should not appear before the user has experienced a reasonable amount of gameplay" and must not "Interrupt gameplay", "Trigger deceptively" or "Chain multiple ads"; ads:214 "max 1 every 3 minutes" (set by the SDK); ads:220 "Poorly designed levels that can only be completed by a rewarded ad are not acceptable."; ads:285 "Do not show in-game banners during game-play."
- **External links rule: not found on these pages.** Nearest [RENDERED]: intro:230 "No external login options" (Basic column, "Only when applicable"). Cross-promotion is already barred by developer-terms:591-592 (T3.5).

### T4.5 Content rules
- **Clones, asset flips, templates: not found** on these pages (the rejection reason is faq.txt:487 only). [INFERENCE] It may sit on the unread Gameplay page (intro table link `/requirements/gameplay`); not verified.
- [RENDERED] IP and naming (guideline): quality:261 "The game is not easily confused with another that features a similar name or iconography."; quality:263 "The game does not use a common identifier unless the game developer owns the respective IP."; quality:257 "Major features such as the game's genre should not change after submission."
- **Still unread** of the category pages: `technical/`, `gameplay/`, `account-integration/`, `multiplayer/`, `game-covers/`; intro:193 says "Each category has a dedicated page with detailed descriptions".

### T4.6 Anything that makes each game an owner click
- **Not found:** no per-game step on these pages is assigned to a person. [RENDERED] Each game still needs the portal submission with metadata and covers (intro:258). Full Launch is CrazyGames' choice (intro:191 "selected"). SDK help comes only at intro:294 "Once your games reach 50k plays (combined)".
- [INFERENCE] Single-player games that collect no extra data avoid the account-integration and consent rows (intro:228-234, 290). The per-upload question is unchanged from T3.5: the portal is the only route named, and nothing says who may operate it.

**Verdict for candidate 6 (CrazyGames): NEEDS_MORE**

These pages fail nothing [RENDERED]. They have no AI ban and no automation ban. The Basic Launch bars are file limits (intro:205-207), visual QA and PEGI12 (intro:213-214). The SDK, ad and AdBlock rules are Full Launch work the agent can build. The admission gate is still open: the FAQ, Payouts page, terms and now the three requirements pages all name the portal (intro.html:231) and never say whether a runner may operate it, and no upload API exists in any of them. The single next check is one written question to CrazyGames from the brand mailbox (proposed step 8): "May a developer account submit and update games through an automated browser session run on the developer's behalf, and is there an upload API?" Record the answer verbatim. A yes meets BOARD-LOOP.md:125. A no triggers the KILL-4 row.

## Tick 5 (28.9.2026): Tipalti's payees FAQ refused

The page the breadth board named to settle Israel-as-payee and any camera step at Tipalti (ZERO-TESTS row 33,
https://help.tipalti.com/hc/en-us/articles/30607242003223-Payees-FAQs) answered HTTP 403 to the runner (fetchedAt 2026-09-28T13:17:48.345Z).
So step 10 is still gated on a Tipalti reading that no free render has produced. Options recorded in
`research/measurements/spreadshirt.md` (same Zendesk refusal): a GitHub mirror, or a written question once the brand mailbox
(owner step 8) exists.
