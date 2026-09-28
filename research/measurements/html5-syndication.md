# Measurement: HTML5 syndication, Y8 and GameDistribution (CHANNEL_LOOP §4 row 14, ZERO-TESTS rows 80-87)

**Date:** 2026-09-28. **Branch:** `claude/new-session-j071dx`. **Ordered by:** `logs/CHANNEL_LOOP.md:138` and
`research/breadth/REPLENISH-2026-09-28.md` §3.3-3.4. **Grades:** [RENDERED] = quoted from a stored capture in
`research/rendered/`, cited `file:line`, each quote checked with `grep -n -F`. [INFERENCE] = my reading, not the network's
words. UNKNOWN = no capture answers it. **Admission waits for a game in every case:** row 14 opens "only after a game has
passed CrazyGames Basic Launch" (`BOARD-LOOP.md:178`). Nothing here changes that. It only decides which network, if any,
is worth the one proposed owner step once a game exists.

## Y8

**Status: proposed kill (a) is MET as worded. (b) and (c) are NOT MET. (d) is UNKNOWN.** The render corrects the
replenish premise. The owner's own AdSense account is not the only route. It is not even the default. What is left is
an invoice for each payout. Whether a runner-issued invoice after step 2 counts as "owner paperwork" is the open
`research/breadth/BOARD.md:78` ruling, and it belongs to the board, not to this note. **Recommendation:** record Y8 as
KILL-(a) unless that ruling accepts a runner-issued invoice. In that case, PARK Y8 behind CrazyGames.
**Tick 8 (`y8-docs-studio`): (a) still fires as worded, and nothing new weakens it.** docs.y8.com has no payments
page. The revshare wording (:393, :397) reads as an invoice we submit and Y8 accepts, not one the portal issues. That
is UNKNOWN at rendered grade. G7 leans PASS: the studio form's public field is "Studio Name", and the form has no
legal-name field. No camera, ID or fee step is named. The 29.9 sitting decides two things: the `BOARD.md:78` invoice
ruling (KILL or PARK), and the shared portal ruling for (d).
**Tick 9 (`y8-docs-overview`): (a) still fires as worded. The public docs are exhausted.** The overview names the
portal's per-game tabs (SDK Initialization, leaderboards, achievements, QA checks, review status). It names no payments
or invoice screen. It also says the docs "deliberately" do not mirror the portal. So whatever invoice form exists sits
behind the login, and (a) is for the 29.9 sitting alone. No new kill fires. No further render is named.

**G2, payout routes (kill a).**
- [RENDERED] There are two routes, and only two. y8-revshare.txt:385: "Under the Y8 Managed Partnership (YMP) , Y8 manages the ads and pays the developer." Same line: "Y8 Managed Partnership (YMP) is available when a game is approved, while AFP is available only to eligible developers."
- [RENDERED] AFP is eligibility-gated, and Google decides. y8-revshare.txt:425: "Google has the final right to approve or reject every AdSense and AFP application." / "Developers who are not eligible for AFP can continue earning through YMP." This corrects REPLENISH:197, which called the developer's own AdSense account the first route. AFP is optional, and no owner AdSense step is needed.
- [RENDERED] YMP rails and minimums. y8-revshare.txt:389: "The minimum payment is $100 for PayPal and $500 for bank transfer." PayPal is already row 14's proposed owner rail (`BOARD-LOOP.md:182`). Its camera question is still UNKNOWN in `paypal-israel.md`.
- [RENDERED] The invoice. y8-revshare.txt:393: "You need a valid invoice to receive payments directly from Y8." y8-revshare.txt:397: "Y8 normally processes an eligible payment within 10 business days after accepting a complete and valid invoice." [INFERENCE] That means one invoice per payout. Under $100, the balance carries forward (:389), so a small game produces few invoices, but every payout needs one.
- [RENDERED] The share. y8-revshare.txt:381: "Developers receive 50% of eligible advertising revenue earned from in-game ads."

**G1, fees (kill b). NOT MET on these pages.** [RENDERED] `grep -i fee` over the four Y8 texts finds only "feedback". No
listing or developer fee is named. Transfer or PayPal fees on YMP payouts are UNKNOWN.

**Israel and identity.** UNKNOWN. No capture names a country list, a tax form, an ID check or a camera step. [INFERENCE] Some
verification exists. y8-revshare.txt:353 says: "The request must come from the verified developer, studio owner, publisher, or rights holder."

**Per-game steps (kill d, "per-game human step").**
- [RENDERED] Every game is created in the portal, and the SDK needs its IDs. y8-sdk-intro.txt:109: "Before installing the SDK, make sure you have created your game in the Y8 Developer Portal and obtained your App ID and Game ID."
- [RENDERED] Each game is reviewed. y8-revshare.txt:307: "Y8 reviews every game before publishing it." Feedback is per game, inside the portal (:315, "Each game has its own Feedback tab"). The other channel is email to developers@y8.com (:437). [INFERENCE] That is a portal thread plus the brand mailbox, not a messenger conversation.
- [RENDERED] y8-revshare.txt:299: "You must complete the SDK requirements shown for your game in the Developer Portal." This is code, so a runner can do it.
- UNKNOWN: whether any page names an upload API. None does. Whether Y8 lets a runner operate the portal is also UNKNOWN. Whether the portal has a captcha is UNKNOWN too. [RENDERED] Every www.y8.com page's config carries `turnstileSiteKey` (y8-revshare.html:35, y8-studios.html:35, y8-new-games.html:35). [INFERENCE] Cloudflare Turnstile is deployed somewhere on the site. Which forms use it is not shown.
- [RENDERED] Runner play-testing on the live game is out. y8-revshare.txt:429: "Bots, automated plays, fake traffic, invalid clicks, traffic exchanges, and rewarded or encouraged ad clicks are not allowed." [INFERENCE] QA must run on local builds only.

**AI (kill c). NOT MET.** [RENDERED] y8-revshare.txt:377: "You can use AI tools if you have the required rights and the final
game meets Y8’s quality and content rules." The same line adds: "Y8 may reject copied, misleading, low-quality, repeatedly
reskinned, or mass-generated games." [INFERENCE] That caveat is the same bar as constraint 6: one distinct game per launch.

**Exclusivity, and the CrazyGames conflict.**
- [RENDERED] Y8 is non-exclusive. y8-revshare.txt:295: "You can also continue publishing your game on other platforms after it is published on Y8."
- [RENDERED] CrazyGames' opt-in +50% (crazygames-developer-terms.txt:263) defines exclusivity as "the sole right to publish and make the Game" available on a browser gaming website (:274). [INFERENCE] Taking that uplift delays Y8 by two months after Full Launch. Without it, there is no conflict.
- [RENDERED] crazygames-developer-terms.txt:227 says: "The Game does not contain any form of branding of another browser game platform or portal;". [INFERENCE] So the Y8-SDK build must be a separate build.

**Public name (G7).** [RENDERED] y8-revshare.txt:283: "You do not need to be a registered company to create a studio." Extra
studios are allowed "only when the studios represent different teams, companies, publishers, or brands" (:287). The public
directory lists games by studio name (y8-studios.txt:183-241). [INFERENCE] A studio named Mehudak is possible. Whether the
account holder's legal name also shows publicly is UNKNOWN.

**Recency lane (G5 for a game with no plays). Weak.** [RENDERED] y8-new-games.txt:179: "Update: New Games are now sorted by
popularity. Use sorting to view latest releases by date." The sidebar timer carries `data-game-release-cron="7 */1 * * *"`
(y8-new-games.html:668). Page 1 shows 46 "New" badges (`grep -c -x New`). [INFERENCE] New games are released on an hourly
slot. A game with no plays still ranks under that week's popular new games, unless the player sorts by date. What holds up
for the long run is y8-revshare.txt:87: "Your game remains available on Y8 and is not removed based on performance."

**Next check (Y8):** render `https://docs.y8.com/studio/studio/`. This is the "Studio" link at y8-sdk-intro.html:382
(`href="../../studio/studio/"`), resolved against the canonical `https://docs.y8.com/sdk/intro/` at y8-sdk-intro.html:15.
Suggested slug `y8-docs-studio`. Grep it for invoice, PayPal, bank, country, legal, verif, tax and studio name. It settles
whether the YMP "invoice" is a form generated in the portal (a runner could submit it after step 2) or an external tax
invoice, and whether the brand can be the only public name.

## GameDistribution

**Status: NEEDS_MORE, leaning KILL on `BOARD-LOOP.md:183`.** The rendered terms confirm a per-game publish request. The
dashboard ad-watch that would make that request a human act is still sourced only at github grade (REPLENISH:215). The
money mechanics are better than Y8's: GameDistribution self-bills, so no developer invoice is needed. The share is lower
(33%), and the payout rail is unread.
**Tick 8 (`gamedistribution-sdk-implementation`): the lean to KILL is withdrawn. Status is NEEDS_MORE.** The ad-watch
and the publish request are official steps, now at rendered grade. The page is GameDistribution's own wiki, and today's
guidelines link to it, but it was last edited 2021-12-09. The activation ad is a demo "fake advertisement", so tick 7's
invalid-traffic reason for a human watch falls. No upload API is named. `:183` fires only if the 29.9 sitting rules
that portal-only steps are human steps.
**Tick 9 (`gamedistribution-wiki-faq`): NEEDS_MORE, unchanged. The public pages this runner can read are exhausted.**
The FAQ was last edited 2018-04-16. It lifts two lines to rendered grade: the ad-watch "only possible from the page
within your Gamedistribution.com control panel", and the "designated button" for the publish request. It names no
payout rail, country, identity or camera step, and no upload API. The partnership page now returns 200, but like the
payment FAQ it is an empty client-side shell. `:183` still turns only on the portal ruling. No further render is named.

**G1, fees.** [RENDERED] No developer fee is named. Revenue is counted net of costs. gamedistribution-developer-terms.txt:45:
"Ads less: (i) In-Game Ads and Hosting costs;" plus invalid-traffic deductions. [INFERENCE] That comes out of revenue, so it
is not the owner paying (MISSION.md:352).

**G2, payout, Israel, identity.**
- [RENDERED] The share. gamedistribution-developer-terms.txt:175: "the Developer is entitled to a revenue share of 33% (thirty three percent)".
- [RENDERED] Timing and minimum. gamedistribution-developer-terms.txt:182-183: "Within 60 days after the report for the preceding calendar month becoming available, the Distributor will pay" … "if: (i) the Developer Revenue Share is at least EUR" 100. This supersedes REPLENISH:218 ("A 50-euro minimum and a payment term of up to 8 weeks"), which came from the wiki. The terms govern.
- [RENDERED] Self-billing. gamedistribution-developer-terms.txt:187: "Distributor sends a credit invoice to the Developer". [INFERENCE] There is no per-payout invoice to issue, so BOARD.md:78's question does not arise here.
- [RENDERED] Payment details are one-time account fields. :184 requires that "the Developer has filled out the payment information needed to make the payment in its account,". **The rail itself is UNKNOWN.** The payment FAQ capture is an empty client-side shell (gamedistribution-payment.html:1: `<div id="__next"></div>`, `"pageProps":{}`), and the partnership page returned "HTTP 502 Bad Gateway" (gamedistribution-partnership.meta.json:10).
- [RENDERED] Israel is not in the sanctions examples (:88: "not limited to Cuba, Iran, North Korea, the Crimea Region of Ukraine, Donetsk People's Republic and Luhansk"). [INFERENCE] The terms do not exclude Israel. Whether an Israeli payee can actually be paid is UNKNOWN.
- UNKNOWN: ID and camera steps. [RENDERED] The party is defined as "the company or other legal entity for which you are accepting this Agreement, as entered into" the sign-up form (:109). Whether an individual, or an עוסק after step 2, may sign is UNKNOWN.

**Per-game steps (kill d).**
- [RENDERED] Each game needs a publish request, and it is gated on the SDK. gamedistribution-developer-terms.txt:141-142: "implement the SDK in the Games as instructed by the Distributor; failure" / "to do this will result in a denied request for publishing;".
- [RENDERED] Each game is reviewed. gamedistribution-guidelines.txt:37-38: "When w e r eceiv e y our game, it ent ers our r e view queue." / "The initial assessment typically tak es up t o one w eek". (The PDF extraction splits words; the quotes are verbatim.)
- The dashboard ad-watch is **not in the terms or the guidelines**. It stands only on the GD-HTML5 wiki FAQ quoted at REPLENISH:215 ("It is mandatory to completely watch a video advertisement …"). [INFERENCE] If it holds, a runner that plays a real ad to satisfy it creates the kind of impression the invalid-traffic definition covers (:66-68: events judged fraudulent or suspect in quality). The honest reading is that a person has to do it, once per game. That fires the :183 kill.
- [RENDERED] Runner monitoring needs consent. gamedistribution-developer-terms.txt:20-21: "No monitoring. Y ou may not access the Distribution Platform, including the Games, for monitoring availability ," / "performance, or functionality , or for benchmarking or competitive purposes without prior written consent." [INFERENCE] The colony's watchers must not poll the live GameDistribution game.
- UNKNOWN: an upload API, and a captcha. Neither capture names either.

**AI. No bar.** [RENDERED] Only deepfakes must be labelled. gamedistribution-developer-terms.txt:156: "clearly and distinguishably
disclose that a content that is part of the Games has been artificially created". The guidelines section is titled
"1 . 5 Deep F ak e and AI Usage" (:141) and covers deepfakes only. Declaring AI anyway is MISSION's rule, and nothing here forbids it.

**Exclusivity.** [RENDERED] The terms are non-exclusive: gamedistribution-developer-terms.txt:120 reads "Developer hereby grants
to Distributor a worldwide, royalty-free, non-exclusive" license. There is also a parity duty: the GameDistribution copy must be
"identical to the latest version of the Games published on other platforms/websites, apps etc.;" (:145). [INFERENCE] Per-portal
SDK builds (which CrazyGames:227 forces) probably count as the same game. That is UNKNOWN. The CrazyGames +50% option delays
GameDistribution by two months, exactly as it delays Y8. :8 adds "pay-to-own model, nor via native apps." Whether that binds the
same game outside GameDistribution is UNKNOWN.

**Public name.** [RENDERED] The terms license the developer's "trademarks and logos" (:127-128). gamedistribution-guidelines.txt:361:
"Y ou ar e allo w ed t o displa y y our brand name or logo in t he loading scr een". [INFERENCE] The brand is usable. The name shown
in the public catalog is UNKNOWN.

**Recency lane.** UNKNOWN. No new-games feed appears in the captures. [RENDERED] The guidelines favour mobile builds:
"com patible on m obile de vices r eceiv e priority placem ent" (gamedistribution-guidelines.txt:232).

**Next check (GameDistribution):** render `https://github.com/GameDistribution/GD-HTML5/wiki/SDK-Implementation/`. It is linked
from GameDistribution's own guidelines as the implementation guide (gamedistribution-guidelines.html:719), and GitHub is
reachable from this container. Suggested slug `gamedistribution-sdk-implementation`. Grep it for watch, advertisement,
publish, control panel, Game ID and API. It settles whether the per-game ad-watch and publish button are official current
steps, which is the :183 ruling. Rendering the payment FAQ needs a JS-capable path, because render-watch stores only the
empty shell.

## What this note did not verify

Y8's own terms of service (no capture links them; the cookie banner links only the privacy and cookie policies), any logged-in
portal page, PayPal fees, and GameDistribution's partnership page (502). Nothing was fetched in this pass. Every claim rests on
the stored captures listed above.

## Tick 8 reading (28.9.2026): the Y8 studio docs and the GameDistribution SDK wiki

**Captures.** `research/rendered/y8-docs-studio.{txt,html}` (200, 132 text lines, `https://docs.y8.com/studio/studio/`,
fetched 2026-09-28T18:36:17Z). `research/rendered/gamedistribution-sdk-implementation.{txt,html}` (200, 592 text lines,
`https://github.com/GameDistribution/GD-HTML5/wiki/SDK-Implementation/`, fetched 2026-09-28T18:36:18Z). Both are first
fetches (`*.meta.json`). Nothing was fetched in this pass. Every quote below was checked with `grep -n -F`.

### Y8: kill (a) still fires as worded. The studio page clears the public name and names no camera step and no fee.

- **The invoice is not documented anywhere on docs.y8.com.** [RENDERED] The studio page never mentions an invoice, PayPal, a bank, tax, a country or a legal name. `grep -n -i` finds only the nav item "Verifying Players" (y8-docs-studio.txt:47), which links to the SDK's check on players (`../../sdk/backend-verification/`, y8-docs-studio.html:703). The site's whole nav is short: Home, Platforms, a four-page Developer Portal section, 13 SDK pages and Best Practices (:990). The four portal pages are Overview, Studio, Create Game and SDK Initialization (html:356, :411, :481, :509). None is about payments. So the only rendered words on the invoice are still y8-revshare.txt:393 and :397.
- **What those words say, read again.** [RENDERED] y8-revshare.txt:393: "You need a valid invoice to receive payments directly from Y8. You are responsible for checking that your legal, tax, bank, and payment details are correct." :397: "after accepting a complete and valid invoice". :401: "You can check your payment status in the Developer Portal." [INFERENCE] Y8 *accepts* the invoice, and the developer answers for its legal and tax details. That describes a document we submit. It is not a self-billed credit note like GameDistribution's (gamedistribution-developer-terms.txt:187: "Distributor sends a credit invoice to the Developer"). Whether the portal offers a form or a template for it is UNKNOWN. Either way, there is one per payout. **Answer:** UNKNOWN at rendered grade, leaning towards a separate invoice we issue each time.
- **Public name leans PASS.** [RENDERED] y8-docs-studio.txt:81: "A Studio represents you as a developer on Y8. Every game belongs to one, so this". :85: "You do not need to be a registered company. A solo developer is a studio." The form asks for five fields: Logo, Studio Name, About, Website and Social links (:96-114). The name field is "The name shown for your studio on Y8." (:102). There is no legal-name field on the form. [INFERENCE] The public sees a studio called Mehudak / מהודק. The legal name sits in the payment details (revshare:393), and no capture says those are shown. Whether the account holder's own profile shows a name is still UNKNOWN.
- **No identity or camera step is named.** [RENDERED] The studio form has no ID, country, tax or photo field (y8-docs-studio.txt:92-114). `grep -c -i -E 'selfie|camera|webcam|liveness|passport|identity document|photo id'` returns 0 in each of the five Y8 texts. [INFERENCE] The "legal, tax, bank" details (revshare:393) imply that the payee is checked at payout, and that form is unread. So no camera step appears in anything read, but none is excluded either.
- **Per game.** [RENDERED] The studio is set up once ("is the first thing to set up", y8-docs-studio.txt:82). Every game then goes under it: "Create a game under your new studio." (:122). The page names no fee (`grep -i -E 'fee|price|cost'` finds nothing) and has no AI line. The per-game form is on the "Create Game" page, which has not been captured. Nothing here adds a human step beyond the portal question already open (Create Game, SDK requirements and review; see tick 7).

**Kills after tick 8 (Y8).**
- (a) **FIRES as worded, on rendered facts** (revshare:385, :393, :397). Tick 8 finds nothing that weakens it. **For the 29.9 sitting:** does an invoice the colony issues after step 2, once per payout, count as owner paperwork (`research/breadth/BOARD.md:78`)? If yes, KILL Y8. If no, PARK Y8 behind CrazyGames.
- (b) NOT MET. None of the five Y8 pages names a fee.
- (c) NOT MET.
- (d) does **not** fire on a rendered fact. Y8 needs no messenger: game questions go through the portal's Feedback tab and everything else by email ("Use the game’s Feedback tab for game review questions.", revshare:437). Payout is PayPal or bank, not USDT. Israel is UNKNOWN. The per-game portal steps wait on the same portal ruling as GameDistribution (below).

**Next check (Y8):** render `https://docs.y8.com/studio/overview/`. This is the "Overview" link at y8-docs-studio.html:18
(`<link rel="prev" href="../overview/">`), resolved against the canonical `https://docs.y8.com/studio/studio/` at :15.
Suggested slug `y8-docs-overview`. It is the last unrendered page in the portal section that could name a payments or
invoice screen. Grep it for invoice, payment, payout, revenue, legal, tax, verif, id.net and API. If it is silent, the
invoice form sits behind a login and (a) is for the sitting alone. The sitting's ruling on (a) does not wait for this render.

### GameDistribution: both per-game steps are official, the ad is a demo ad, and `:183` now turns only on the portal ruling

- **Official and linked as current, but dated 2021.** [RENDERED] The page sits in GameDistribution's own repository ("GameDistribution" / "GD-HTML5", gamedistribution-sdk-implementation.txt:100-104). Today's guidelines send developers to it: gamedistribution-guidelines.txt:152 has "Y ou can find t he implementation guide f or our SDK and our r ules r egar ding ads . her e", and the link target is `https://github.com/GameDistribution/GD-HTML5/wiki/SDK-Implementation/` (gamedistribution-guidelines.html:719). The terms make those instructions binding. gamedistribution-developer-terms.txt:141-142: "implement the SDK in the Games as instructed by the Distributor; failure" / "to do this will result in a denied request for publishing;". The last edit is old: "[name removed] edited this page Dec 9, 2021" (the quoted part, "edited this page Dec 9, 2021", is at gamedistribution-sdk-implementation.txt:154; the html has `datetime="2021-12-09T11:16:54Z"` at :713). [INFERENCE] These are the current official instructions, adopted by reference. Whether today's admin still works this way is UNKNOWN without a login.
- **The per-game chain, now at rendered grade.** [RENDERED] Upload: "To activate your SDK integration you will need to upload your game first ( https://developer.gamedistribution.com/ )" (:263). The iframe: "the upload view within this admin. Here you'll also find a button to open your game within an iframe. Click this button." (:265). The ad watch: "You must completely view your new in-game pre-roll advertisement once, from within this iframe. Doing this will activate and verify the integration." (:267). Publishing: "Your game will be flagged to have a valid integration of the SDK and your game can be requested for publishing." (:269). The wait: "This can currently take up to two weeks." (:281). The game ID comes from the same admin, "which you can retrieve from your Gamedistribution.com control panel" (:201), and is "unique for each one of your games" (:301). Then comes the review queue of up to a week (tick 7, guidelines:37-38). [INFERENCE] That makes five portal acts per game: upload, open the iframe, watch the ad, copy the game ID and request publishing. Then comes a wait of up to three weeks.
- **The ad is a demo ad, not a paid one. This corrects tick 7.** [RENDERED] :275: "A demo VAST tag for calling a fake advertisement is already enabled, so you only have to click the "showBanner" button, in order to request an advertisement." :281: "Make sure you completely watch the fake advertisement. Once the CONTENT_RESUME_REQUESTED event is triggered - without cancelling the advertisement - your game its SDK implementation will be approved." [INFERENCE] Tick 7 argued that a runner playing a real ad would create invalid traffic, so only a person could do the watch. The ad is fake, so no billable impression is created, and that argument falls. The other acts are "Click this button" (:265) and "Make sure you disable your ad blocker." (:277). A scripted browser can do both. Support is needed only when something goes wrong ("Please contact support if you're having any trouble concerning this step.", :269). That is not a routine conversation, so the messenger clause is not met.
- **No upload API is named.** [RENDERED] Uploading happens in a web "admin" (:263, :265). The page's only "api" strings are the SDK script host `html5.api.gamedistribution.com` (:160, :195) and a sidebar page title, "Store API Integration" (:556). The sidebar lists six pages ("Pages 6", :490). Their previews did not load in the capture ("There was an error while loading.", :498-560), so the capture shows titles only. [INFERENCE] The terms define "In-Game Purchase Revenue" (gamedistribution-developer-terms.txt:48). A "Store API" is therefore more likely about in-game purchases than uploads, but what it covers is UNKNOWN. The terms name no rule on scripted use of the admin. Their one access clause is "No monitoring." (:20). Whether there is a captcha is UNKNOWN.
- **Nothing new on money, identity or the public name.** [RENDERED] `grep -i -E 'paypal|bank|invoice|israel|country|payment|payout|legal|verif'` over the text finds only "verify the integration" (:267), and the camera-term count is 0. The rail and Israeli payability stay UNKNOWN (tick 7).

**Kills after tick 8 (GameDistribution).** `BOARD-LOOP.md:183` does **not** fire on a rendered fact. Every per-game step
is now rendered, and each one is a portal act. None is written as a person's act. The one reason tick 7 gave for "a
person has to do it" was a real ad, and :275 and :281 refute it. **The lean to KILL is withdrawn. Status: NEEDS_MORE.**

**For the 29.9 sitting: the portal ruling** (`research/breadth/REPLENISH-2026-09-28.md:224-226`). A per-game step can
exist only in a web admin, with no API, and be done by a runner. Is that a "per-game human step"? The sitting should
rule once, for CrazyGames, GameMonetize, GameDistribution and Y8. If yes, `:183` fires for GameDistribution and kill (d)
fires for Y8. If no, both PARK behind CrazyGames. The other `:183` clauses do not fire. No messenger is named. Nothing
read says the payout is USDT-only. The sanctions list does not exclude Israel (tick 7), but whether Israel can be paid is
UNKNOWN. The metrics and RPM clauses wait for a game.

**Next check (GameDistribution):** render `https://github.com/GameDistribution/GD-HTML5/wiki/F.A.Q.`. This is the
sidebar link at gamedistribution-sdk-implementation.html:1194 (`href="/GameDistribution/GD-HTML5/wiki/F.A.Q."`). It is
on github.com, which this container can reach. Suggested slug `gamedistribution-wiki-faq`. REPLENISH read this page at
github grade (REPLENISH-2026-09-28.md:215-217). A render lifts two lines to rendered grade: "clicking the designated
button", and the "only possible from the page within your Gamedistribution.com control panel" line. It is also the only
reachable official page that might name the payout rail. The payment FAQ is an empty shell, and the partnership page
returned 502. Grep it for PayPal, bank, wire, Payoneer, country, Israel, invoice, button, publish and API. The `:183`
ruling does not wait for this render.

## Tick 9 reading (28.9.2026): the Y8 portal overview and the GameDistribution wiki FAQ

**Captures.** `research/rendered/y8-docs-overview.{txt,html}` (200, 115 text lines, `https://docs.y8.com/studio/overview/`,
fetched 2026-09-28T19:17:31Z). `research/rendered/gamedistribution-wiki-faq.{txt,html}` (200, 296 text lines,
`https://github.com/GameDistribution/GD-HTML5/wiki/F.A.Q.`, fetched 2026-09-28T19:17:32Z). Both are first fetches
(`*.meta.json`). Nothing was fetched in this pass. Every quote below was checked with `grep -n -F`.

### Y8: no payments or invoice screen is documented, and the docs say they will not mirror the portal

- **What the portal is for, in the docs' words.** [RENDERED] y8-docs-overview.txt:77-80: "Everything outside your game's own code happens in the" / "Y8 Developer Portal — creating a" / "studio and a game, getting the credentials the SDK needs, uploading builds, and" / "submitting for review." The portal is `https://developer.y8.com/` (y8-docs-overview.html:1103). The list has no payment, payout or invoice step.
- **The tabs it names are all per game.** [RENDERED] "My Games , which lists your games and is where builds are uploaded." (:84). A game's SDK Initialization tab holds "the App ID and Game ID" and is where development addresses are registered (:86-88). "A game's other tabs cover leaderboard tables, achievements, QA checks and" / "review status." (:90-91). None is about money.
- **The docs will not describe the portal's screens.** [RENDERED] :91-93: "They are self-explanatory in the portal itself, and it is the" / "authority on what they currently do — this documentation deliberately does not" / "mirror them." `grep -c -i` over the text and the html finds 0 for invoice, payment, payout, revenue, PayPal, bank, legal, tax, fee, price, cost, country and Israel. The one "verif" hit is the nav item "Verifying Players" (:45). [INFERENCE] The docs say nothing about the invoice, on purpose. Y8's revshare lines stay the only public words on it (y8-revshare.txt:393, :397, :401), and the answer sits behind the login. Tick 8 expected exactly this outcome (its next check: "If it is silent, the invoice form sits behind a login and (a) is for the sitting alone"). **Is the invoice generated in the portal, or issued by us each time?** UNKNOWN at rendered grade, and no public page can settle it.
- **Identity and camera.** [RENDERED] The only prerequisite named is "An account, and a Studio" (:97). There are 0 hits for camera, selfie, passport, identity or photo. [INFERENCE] As at tick 8, no such step is named and none is excluded. The payee check that "legal, tax, bank" (revshare:393) implies is unread.
- **Public name.** [RENDERED] :98: "belongs to one, and you do not need to be a registered company to have one." This repeats y8-docs-studio.txt:85. G7 still leans PASS.
- **Upload.** [RENDERED] Builds are uploaded in My Games (:84). The html's only "api" strings are the Google Fonts host (html:53) and a search box's `autocapitalize` attribute (html:168). [INFERENCE] No upload API is named, as on every Y8 page read.

**Kills after tick 9 (Y8).**
- (a) **FIRES as worded**, on the same rendered facts (revshare:385, :393, :397). The overview adds nothing that weakens it. The ruling stays with the 29.9 sitting (`research/breadth/BOARD.md:78`). If an invoice the colony issues once per payout counts as owner paperwork, KILL. If not, PARK behind CrazyGames.
- (b) NOT MET. Six Y8 pages read, and none names a fee.
- (c) NOT MET. The overview has no AI line, and revshare:377 stands.
- (d) does **not** fire on a rendered fact. [INFERENCE] The overview makes every step outside the game's code a portal act (:77-80). So (d) is entirely the sitting's portal ruling.
- **Public docs: exhausted.** Two portal-section pages are still unrendered: Create Game and SDK Initialization (y8-docs-overview.html:470, :498). [INFERENCE] By the overview's own account (:86-88, :100), they cover the per-game form and the SDK credentials, not money. The portal ruling covers them whatever they say, and neither can change the invoice ruling. **No further render is named.**

### GameDistribution: both lines reach rendered grade, the page dates from 2018, and it names no rail

- **Date and standing.** [RENDERED] "[name removed] edited this page Apr 16, 2018". The quoted part, "edited this page Apr 16, 2018", is at gamedistribution-wiki-faq.txt:154, the html has `datetime="2018-04-16T09:05:16Z"` at :713, and the page shows "12 revisions" (:156). It is in the same official repository as the SDK page ("GameDistribution" / "GD-HTML5", :100-104). [INFERENCE] It is older than the SDK page (2021-12-09, tick 8) and older than today's terms and guidelines. Where they differ, the newer source governs.
- **The control-panel line, now rendered.** [RENDERED] :180: "In order for us to verify a correct SDK implementation it is mandatory to completely watch a video advertisement within your uploaded game. This is only possible from the page within your Gamedistribution.com control panel where you've uploaded your game." The same line ends: "A flag will be set for your games once an advertisement is watched or skipped." [INFERENCE] "Or skipped" is looser than the 2021 page, which says "completely watch the fake advertisement" without cancelling it (gamedistribution-sdk-implementation.txt:281). The newer, stricter wording governs. Either way, it is one act in the control panel, and the line does not say a person must do it.
- **The designated button, now rendered.** [RENDERED] :182: "Now you can request your game to be published by clicking the designated button within your control panel." The same line: "It can take up to 2 days for a game to be reviewed." [INFERENCE] Today's guidelines replace the 2-day figure: "The initial assessment typically tak es up t o one w eek" (gamedistribution-guidelines.txt:38). The step itself is a portal click, the same act tick 8 counted.
- **Money: a minimum and a term, but no rail.** [RENDERED] :186-187: "After the minimum of 50 euro share is met, payment is sent once data is collected at the end of each month." / "Payments have a maximum payment term of 8 weeks." This brings REPLENISH:218 to rendered grade, and the terms supersede it: EUR 100 and 60 days (gamedistribution-developer-terms.txt:182-183, tick 7). `grep -c -i` over the text finds 0 for PayPal, bank, wire, Payoneer, Tipalti, country, Israel, invoice, legal and tax. **The rail stays UNKNOWN.**
- **Fees.** [RENDERED] :202: "Gamedistribution.com offers a free service for developers and publishers." Every "fee" hit in the html is GitHub's own "feedback" markup. G1 still passes.
- **Identity and camera.** [RENDERED] There are 0 hits for camera, selfie, passport, identity and legal. The one "verif" hit is "verify a correct SDK implementation" (:180). Who may sign stays UNKNOWN (tick 7).
- **No upload API.** [RENDERED] Uploading is a control-panel act ("before you upload your game", :170; :180). The page's one "API" is the sidebar title "Store API Integration" (:260). Its preview failed to load, like those of the other wiki pages ("There was an error while loading. Please reload this page .", :214, :222, :248, :256, :264). The testing call `gdsdk.openConsole();` (:166) runs in the browser console to show a fake ad for testing (:164). It is not an upload route.
- **No messenger.** [RENDERED] Every "support", "contact" or "mail" hit in the text is GitHub's own navigation or footer (:62-63, :85, :290). The page names no contact channel.
- **Cross-promotion.** [RENDERED] :191: "This is decided by our content team; based on engagement, session duration, organic game plays and more." [INFERENCE] Placement is editorial and follows engagement. That leaves the recency lane as UNKNOWN as it was.
- **Correction: the partnership page is a shell, not a 502.** [RENDERED] It was refetched at 2026-09-28T18:35:45Z with status 200 and 3,700 bytes (gamedistribution-partnership.meta.json). Its text file is 1 byte. Its html holds `<div id="__next"></div>`, and its `pageProps` carries only a title and a description (`"meta":{"title":"Partnership"`, gamedistribution-partnership.html:1). The G2 bullet above cites "HTTP 502 Bad Gateway" at meta.json:10. That line is no longer in the stored file. [INFERENCE] Both money pages, payment and partnership, render only in a browser that runs JavaScript. render-watch does not run one.

**Kills after tick 9 (GameDistribution).** `BOARD-LOOP.md:183` does **not** fire on a rendered fact.
- Messenger: none is named.
- Per-game human step: :180 says the ad-watch is "only possible from the page within your Gamedistribution.com control panel". That is a portal-only step, not a person's act. It waits on the 29.9 portal ruling, as tick 8 said.
- USDT-only: no rail is named, and nothing says USDT. Israel: UNKNOWN (the sanctions list does not exclude it, tick 7).
- **Public pages: exhausted for this runner.** The wiki's four other pages (Home, Display Ads, Rewarded Ads, Store API Integration) are titles only in both wiki captures (:210-264; tick 8). [INFERENCE] Only Home has a title that could cover money. Its date is unknown, and this wiki's one money answer, the FAQ's 50 euro and 8 weeks, is a 2018 figure that the terms have since replaced. It is not worth a render. Both money pages are JavaScript shells. **No further render is named.** [INFERENCE] The rail and whether Israel can be paid are read in one of two ways: a JavaScript-capable fetch of the payment FAQ (a tooling change, not a render), or the payment fields of a developer account once one exists.
