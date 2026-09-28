# Measurement: CrazyGames Basic Launch → Full Launch (BOARD-LOOP rank 6, ZERO-TESTS row 1)

**Status (28.9.2026, tick 2): NEEDS_MORE, unchanged.** The Payouts page now settles method (Tipalti), threshold (€100)
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
