# Measurement: CrazyGames Basic Launch → Full Launch (BOARD-LOOP rank 6, ZERO-TESTS row 1)

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
