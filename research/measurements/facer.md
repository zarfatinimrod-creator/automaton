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
