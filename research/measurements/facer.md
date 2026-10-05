# Facer creator marketplace (loop row 23): the render read

**Status (28.9.2026, after tick 8): DEAD. Verdict: kill (a) fires, so G3 FAILS [RENDERED terms; INFERENCE on scope]. It
can reopen (trigger at the end).** The template cache (`facer-templates-js.bin`, fetched 18:36 UTC) holds Facer's full Terms
of Service. They forbid reaching the Services through any "engine, software, tool, / agent" other than Facer's own software
or an ordinary browser (bytes 475268-475582). Among 464 templates, the only way to publish is a web form, filled once per
face. It has no API or bulk route, and `.face` import is "Admin Only". G1 PASSES: basic use is free (461897). G2, G4 and G7
stay UNKNOWN, and kills (b), (c) and (d) do not fire. Correction to tick 7: the "5,000 syncs" figure *is* in a capture,
but inside an HTML comment that the page does not show (1072779-1073541).

**Tick 7 status, kept: READ 28.9.2026 (captures of 17:19 UTC, ZERO-TESTS rows 71-79). Verdict: NEEDS_MORE.** No proposed kill fires on
a rendered fact. Kill (a) (G3) comes closest: a forum member, not Facer, says the Creator editor is the only way to make
faces. Facer's own terms are an unreadable JavaScript shell, so whether the agent may operate that editor is UNKNOWN,
the same position as CrazyGames (`crazygames.md:75`). G2 is wholly UNKNOWN. The "5,000 syncs" in `REPLENISH-2026-09-28.md:181`
is in no capture. Reader's lean: G3 toward FAIL and a weak outlook, so no admission on this evidence.

## What was read

| Row | Capture | HTTP | Readable? |
|---|---|---|---|
| 71 | facer-terms | 200 | **Shell.** An AngularJS app with an empty `<div ui-view>` (`facer-terms.html:394`). Its only body text, "TEST", is a font-loader placeholder (`:399`). The 3-line .txt is the `<title>` plus that placeholder. |
| 72 | facer-creator-partner | 200 | **Shell.** The same template (`:394`). It differs only in URL and `"isCreatorRoute":true` (`:115`). |
| 73 | facer-premium-admission | 200 | Readable in the .html's no-JS crawler body: 20 posts, 28.6-8.7.2018, **page 1 only** (`?page=2`, `:278`). The .txt is broken because the extractor stopped at a `40rem` media attribute (`.txt:3`). The same applies to rows 74, 75 and 78. |
| 74 | facer-premium-route | 200 | Readable: 20 posts from 2017, page 1 only (`:278`). Post 1 was edited 18.9.2025 (`:528`). |
| 75 | facer-payment-options | 200 | Readable: 3 posts from 2020 (`:523`). It is about **paying for Creator Pro**, not payouts, so the row's premise was wrong. |
| 76 | facer-community-guidelines | 403 | **Not read** (the help.facer.io Zendesk refused). |
| 77 | facer-creator-getting-started | 403 | **Not read** (the help.facercreator.io Zendesk refused). |
| 78 | facer-third-party-tools | 200 | Readable: 8 posts, Aug 2023 (`:525`). |
| 79 | facer-payouts-news | 200 | Readable: a server-side Ghost page. The 122-line .txt is the whole post of 7.12.2021 (`.txt:40`). |

Rows 73-75 and 78 are forum members' posts, not Facer's rules. Row 79 is Facer's own text.

## Gate by gate

- **G1 fee: UNKNOWN, leaning PASS; kill (c) does not fire.** [RENDERED, members, 2023] "you do not need PRO subscription to
  publish faces in general." (`facer-third-party-tools.html:678`) and "To get started, you do not need PRO." (`:609`). Pro is
  optional at "6/month or 50/year" (`:764`, currency not shown). But "the promo media area is available only to pro
  subscribers" (`:678`), and in 2020 "without the paid version, my options are really limited" (`facer-payment-options.html:531`).
  [INFERENCE] Only the free tier fits ₪0, because Pro is a recurring charge. Facer's terms and any partner fee: UNKNOWN (row 71 is a shell).
- **G2 payout: UNKNOWN; kill (b) does not fire.** No payout method, country list, tax form or identity step is on any
  readable page. [RENDERED] The partner share is contractual and private: "We are simply under an official contract and
  that means as well that we don´t speak about the terms." (`facer-premium-admission.html:1254`, 2018). The thread's
  opening question about the share (`:547`) gets no answer on page 1. The partner countries end "Malaysia, and more!"
  (`facer-payouts-news.txt:45`), so Israel is not named and no country is excluded. [INFERENCE] The rail may be learnable only after an invitation.
- **G3 listing without a per-face owner click: UNKNOWN, leaning FAIL; kill (a) is not fired.** [RENDERED, a member, 2023]
  "the Facer Creator is the only way to make Facer Faces" (`facer-third-party-tools.html:573`). The Creator is a download or
  runs in the browser (`:609`), and "your work is still saved to the Cloud" (`:644`). No readable page names an import
  path, upload API or bulk route, and the official getting-started page (row 77) refused. Paid faces go one at a time:
  "Premium designers are allowed re-submit previously free faces as Premium faces." (`facer-premium-route.html:746`, 2017).
  The shell does expose the site's internal backend, `serverUrl: "https://www.facer.io/parse",` (`facer-terms.html:105`).
  [INFERENCE] That is not a published API, and its use terms are unread, so it does not count as a route. If the terms forbid
  automated access, or each face needs an owner click, kill (a) fires.
- **G4 AI and honest value: UNKNOWN; kill (d) does not fire.** No readable page has an AI rule, and the guidelines (row 76)
  refused. [RENDERED] The partner criteria include "Unique and original ideas" and "No evidence of past copyright or
  trademark infringements" (`facer-payouts-news.txt:54`, `:57`). Every free face is competition: the site title is "Thousands of FREE
  watch faces" (`facer-terms.txt:1`). [INFERENCE] Replica faces of real watch brands are out; the forum links "Replica
  Faces" and "Cease and desist" topics (`facer-premium-admission.html:577-580`).
- **G5 buyers: PASS, now [RENDERED]** (Facer's own claim, 2021): "distributed over $1 MILLION in payout to these designers"
  (`facer-payouts-news.txt:49`), across 75+ designers (`:45`). Money reaches only the "invite-only program allowing top designers
  on Facer to monetize their watch faces on our platform" (`:44`). Free faces reach the venue's users.
- **G6 one account, many faces: PASS at member grade.** [RENDERED] One member's account holds "more than six watches which
  fullfill the desired 3000 syncs in 30 days" (`facer-premium-admission.html:714`). [INFERENCE] The account needs an inbox
  (proposed step 8). Per-face work is a G3 question.
- **G7 brand-only name: UNKNOWN, leaning PASS.** [RENDERED] Facer asks partners for "Brand identity: you are able to create a
  strong brand identity that is reflected consistently in your designs" (`facer-payouts-news.txt:56`). Whether a contract or
  payee name is ever shown publicly: UNKNOWN.

## Corrections to the replenish pass (§3.2)

- **"5,000 syncs" is unconfirmed.** The only "5,000" in the captures is a member quoting "Most of Facer’s 5,000 designers"
  (`facer-premium-admission.html:536`). The rendered bars are dated and differ:
  - 2017: three free faces with "3,000 syncs within the first 30 days after publishing" (`facer-premium-route.html:713`, a member's question).
  - 2021: an application window for "any designer — whether they’re already Facer designers or not" (`facer-payouts-news.txt:52`),
    reviewed by Facer's "editorial team" (`:53`).
  - 2023: "some criteria like numbers of syncs" (`facer-third-party-tools.html:682`).
  - Facer's 2017 announcement now says only "you can apply here" (`facer-premium-route.html:533`).
- **The outlook stands and gets worse.** Paid sales are invite-only (`facer-payouts-news.txt:44`). The share is kept
  private: "until someone is invited into the program there is no need to discuss revenue" (`facer-premium-admission.html:1182`).

## UNKNOWN

1. Facer's terms: fee, AI rule, automated access (row 71, a shell).
2. Payout rail, Israel, any identity or camera step, and the share (on no page; the share is under contract).
3. Any import or upload path, and whether the agent may operate the Creator (row 77, refused).
4. The AI rule (row 76, refused).
5. Today's admission bar. The last dated window is 2021, which promised "other enrollment windows will be open later that year" (`facer-payouts-news.txt:63`).
6. Whether any name besides the brand is shown.

## Single most decisive next check

Render `https://www.facer.io/js/templates.min.js?t=1790275483051`. Both shells load it: `<script
src="js/templates.min.js?t=1790275483051"></script>` (`facer-creator-partner.html:461`, `facer-terms.html:461`). The script
resolves against `<base href="/" />` (`:48` in both). It is a static file on a host that already answered 200 to the runner,
so a plain GET should read it. [INFERENCE] It is AngularJS's template cache. If the terms and the partner FAQ are
templated there, one read settles G1, G3's automated-access question and G4, and perhaps G2.

**Fallback if it holds no legal text** (loaded from the backend at run time instead): the step-8 written question, sent from
the brand mailbox to the address in `facer-payment-options.html:567` (`Facer-support@little-labs.com`; dated 2020, may be stale).
The form at `:566` is on the Zendesk host that refused rows 76-77. The question:
- (1) Can a creator in Israel be paid, by which method, and does onboarding need a selfie or video step?
- (2) May faces made with declared AI tools be published, and may software rather than hand work in Facer Creator create or upload them?
- (3) Is there any fee to publish or to join the Partner Program?

## Tick 8 reading (28.9.2026): the template cache and the full forum text

### What was read

- **`facer-templates-js.bin`**: 1,141,780 bytes on one line, fetched 2026-09-28T18:36:12Z, HTTP 200, sha256 `0a69bfd2…` (re-masked 5.10.2026, 18 addresses: now `86029b2c…`)
  (`facer-templates-js.meta.json`). It is a webpack chunk (`webpackChunkFacerWeb`, byte 0) whose module map lists 464
  template paths. Each template is a JS string put into `$templateCache` as `/html/<name>` or `/components/<path>`.
  Citations below are **byte offsets into the .bin**, each checked with `grep -F -b -o`. Source lines are joined by a raw
  `\n` and indentation, so every quote is one source line. A " / " marks a join between two quoted lines.
- **The cache does hold legal text.** It has the full Terms of Service (`/html/terms.html`, module 21098, string bytes
  457051-493894, heading `<h1 align="center">Terms of Service</h1>` at 457091), the Privacy Policy (`/html/privacy.html`,
  408220-423195), and the partner page with its FAQ (`/components/creator/partner-program/partner-program.component.html`,
  1065101-1074719). [INFERENCE] These are what `/terms` and `/creator/partner` render. The publish form links
  `ui-sref="facer.terms"` (774039) and prints `https://www.facer.io/terms` (774695), and no other Terms template exists.
  Facer's official forum account points applicants to that partner URL (`facer-premium-route.txt:15`). The terms carry
  "Last Updated: 04/17/2015" (457163) but mention "running WearOS" (461500), a name that came after 2015, so the text was
  edited without the date changing [INFERENCE].
- **Forum captures, re-extracted in full**: premium-admission 370 lines, third-party-tools 159, premium-route 297,
  payment-options 51. Both long threads are still **page 1 only** ("next page →", `facer-premium-admission.txt:358`,
  `facer-premium-route.txt:285`). The full text adds no fact beyond tick 7; the gain is that the .txt files can now be
  cited. Tick 7's .html line cites were re-checked against the 18:35 re-fetch and still hold (`facer-third-party-tools.html:573`,
  `facer-premium-admission.html:1254`, `facer-premium-route.html:746`, `facer-payment-options.html:531`, `:567`).

### Gate by gate

- **G3: FAIL. Kill (a) fires.**
  - [RENDERED, Facer's terms, "General Prohibitions"] The user agrees not to "Attempt to access or search the Services or
    Content or download / Content from the Services through the use of any engine, software, tool, / agent, device or
    mechanism (including spiders, robots, crawlers, data / mining tools or the like) other than the software and/or search
    agents / provided by Little Labs or other generally available third-party web" browsers (475268, 475341, 475423, 475502, 475582).
  - [RENDERED] The only way for a user to publish, among all 464 templates, is one web form per face. It has a title field,
    `placeholder="Describe your watchface..."` (770214), a category, an "I accept the Terms of Service" checkbox,
    "Enable Monetization" (775303) and a publish button. Its one file input takes an Apple Watch export, "Select
    <b>.watchface</b> File" (766162, `apple-watchface-file-uploader` at 765842). Only admins can import a `.face` file:
    "Import/Update (Admin Only)" (807374) and "Import/Update Variant (Admin Only)" (809693); the third import link (574784)
    sits under `ng-if="isAdmin && watchface"`. The legacy upload page takes a `.face` file exported from Facer for Android,
    "Submit your .face file here" (513909), and after submission "we will notify you / with next steps shortly." (517647,
    517727). "API" and "bulk"
    occur 0 times in the file.
  - [RENDERED] Paid faces are also reviewed by hand: "to pass through our QA process before going live." (646634) and
    "We’ll review your designs to make sure they meet the quality standards for publishing and" (1069049).
  - [RENDERED, a member, 2023] To "Is it the only way to create my Watch Faces and upload them here to Facer?"
    (`facer-third-party-tools.txt:25`) a member answers "the Facer Creator is the only way to make Facer Faces" (`:39`).
  - [INFERENCE] Tick 7 fixed the rule before this read: "If the terms forbid automated access, or each face needs an owner
    click, kill (a) fires" (`facer.md:51-52`). Both halves now hold. The colony's agent is "software"
    and an "agent" in the clause's own words, and the exceptions cover only Facer's software and ordinary browsers. **The
    weak point:** the clause is standard anti-scraping wording, and a lenient reading lets an agent drive an ordinary
    browser. Even on that reading there is no API, CLI or bulk route, which is the fact that killed Fitbit ("each face is
    uploaded by hand", `docs/REJECTED.md:1226`). So G3 fails on the Fitbit standard, and Facer's terms also bar the one
    workaround in writing.
- **G1 fee: PASS. Kill (c) does not fire.** [RENDERED] "Creation of an Account and use of basic Services is free."
  (461897). Pro is optional: "Start free, unlock advanced tools with Pro, or apply to Partner" (251879). A partner gets
  Creator Pro "Enabled automatically with \'Partner\' status" (449417; the raw bytes escape the quotes). Every whole-word
  "fee" in the file is legal text (attorneys' and arbitration fees, contest rules) or the optional "Paid Features" (461691).
  None is a fee to publish or to join.
- **G2 payout: UNKNOWN. Kill (b) does not fire.** [RENDERED] "Earnings are calculated monthly and / distributed through
  supported payout options." (1070599, 1070660). No rail is named: "PayPal", "Payoneer", "Tipalti", "W-8", "W-9", "KYC",
  "passport" and "Israel" each occur 0 times. "Stripe" appears only for buyers' subscriptions (`isStripePurchase()`,
  449592) and as an admin revenue column (85115). There is no camera or identity step. The three "camera" hits are icons
  for a comment attachment (204977), a video upload (605200) and an editor screenshot (780443). "Selfie" is the social
  "Looks" feature ("Moderate wrist selfies", 982906). App users warrant "you are not located in a country that is"
  (472805) "subject to a U.S. Government embargo" (472855). [INFERENCE] Israel is not under a U.S. embargo, so this clause
  does not exclude it.
- **G4 AI: UNKNOWN, leaning PASS. Kill (d) does not fire.** [RENDERED absence] No AI rule appears in the 464 templates:
  "artificial", "generative", "AI-generated", "Midjourney" and whole-word "AI" each occur 0 times. The rules that apply:
  the user warrants that "your User Content is original" (466221); content must not be "false, misleading or deceptive;"
  (473756); and the partner FAQ welcomes "any style is welcome, as long as" it is original and high-quality (1071976).
  Every face has a free-text description (770214). [INFERENCE] AI use can be declared there. Whether AI output counts as
  "original" is a legal question that Facer's text does not answer.
- **G7 brand-only name: UNKNOWN, leaning PASS.** [RENDERED] The profile is public: "and other Account holders will be
  able to view your profile information / (including your name, photograph, biography and city or country)." (416389,
  416470). Country is "Optional. Shown on your public profile and watchface details." (528628). Accounts for an
  organisation are foreseen: "accessing and using the Services on behalf of a company (such as your" (458139), and "we’ll
  also collect your organization’s corporate name." (411204). The terms require "you provide us with accurate, complete
  and" up-to-date information (460570). The older designer-program page asks by email for "Your full name" (264321).
  [INFERENCE] That name goes to Facer, not to the public.

### Also found (outlook, not a gate)

- [RENDERED] Free faces earn nothing, and Facer may sell them: "under this license, Little Labs will have the right to
  commercialize / your User Content without any compensation to be paid to you." (465969, 466047).
- [RENDERED] Commercial use is barred unless the terms allow it: "Use the Services or Content, or any portion thereof,
  for any / commercial purpose or for the benefit of any third party or in any" manner not permitted (476106, 476176).
  [INFERENCE] Selling runs only through the partner contract, and the share stays private (tick 7, `facer-premium-admission.txt:316`).
- **Correction to tick 7 ("is in no capture").** "<li>Your watch faces must have received at least 5,000 syncs in the
  past 30 days.</li>" (1072951) is in the capture, inside an HTML comment. The comment opens at 1072779
  (`\x3c!-- <li>You must be an independent designer`) and closes at 1073541 (`comment threads, etc.</li> --\x3e`), so
  the page does not show it. The live bar is computed in code. The apply button is disabled unless
  `canApplyToPartnerPlan()`, and it shows `{{ getPartnerRequirementLabel() }}` (1066468). Neither function's text is in
  this file. The older designer-program page says "apply again after you have an original design that hits 2500 syncs."
  (265765) and "Most designers will not be accepted and there are many reasons why." (265443).

### Kills settled

| Kill | Result | Basis |
|---|---|---|
| (a) created or published only by hand | **FIRES** | Terms 475268-475582; one form per face; `.face` import admin-only (807374, 809693); no API or bulk route |
| (b) payout excludes Israel or needs a camera | does not fire | Rail unnamed (1070660); no camera or identity step in 464 templates |
| (c) any creator fee | does not fire | 461897; Pro is optional and free for partners (449417) |
| (d) AI banned or undeclarable | does not fire | No AI rule; a free-text description on every face (770214) |

### Verdict and reopen trigger

**DEAD on G3 (kill (a)).** Deciding this row does not need the step-8 question. **Reopen** if Facer ships a creator
upload API or bulk import, or confirms in writing that an agent may operate Facer Creator to publish faces for a brand
account. If the board wants to test that before closing the row, send one written question from the brand mailbox to
`Facer-support@little-labs.com` (`facer-payment-options.txt:29`, dated 2020, may be stale):
- (1) Given the "engine, software, tool, agent" clause, may an AI agent operating Facer Creator in an ordinary browser create and publish faces for a brand account?
- (2) If yes: can a partner in Israel be paid, by which method, and does onboarding need a selfie or video step?
- (3) If yes: may faces made with AI tools be published if the description says so?
