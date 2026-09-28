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
