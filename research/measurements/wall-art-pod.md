# Wall-art print-on-demand: Displate (row 26), Zazzle (row 25), Society6 (row 27)

**Date:** 28.9.2026. **Branch:** `claude/new-session-j071dx`. **Written by:** an Opus reader in the channel loop; wrote this file only.
**Read:** `research/rendered/displate-com-about-faq.txt` (1,279 lines) and `displate-com-about-copyright.txt` (135 lines), both
in full (status 200, fetched 2026-09-28T20:35Z); the seven `.meta.json` files of the Zazzle and Society6 captures;
`research/breadth/REPLENISH-2026-09-28-2.md` §2, §3.2-3.4, §6; `logs/CHANNEL_LOOP.md:149-151`; `research/owner-asks/brand-mailbox-questions.md:1-40`.
**Grades:** [RENDERED] = quoted from a capture under `research/rendered/`, cited `file:line`. [INFERENCE] = my reading.
UNKNOWN = no capture answers it. A proposed kill fires only on a rendered fact and is recorded for the sitting to confirm.
The artist names printed in the captures' menus (`faq.txt:38-43`) are not reproduced here. The ledger is ₪0.00.

## 1. Displate (row 26)

**Status: NEEDS_MORE. No proposed kill fires. Kill (b) is contradicted by the rendered sign-up; (a) and (d) turn on
Terms of Use points 3.2-3.3, which the FAQ cites but does not quote.**
Gate line after this read: G1 P(r) · G2 U↗(r+repo) · G3 U↘(r, absence) · G4 U(r) · G5 P(g) · G6 U(r) · G7 U↗(r).

- **Sign-up is a form, not a portfolio review (kill b: not met).** [RENDERED] "Fill out the form and click "Create an
  account." Once your shop is set up, we'll send you a verification email." (`displate-com-about-faq.txt:1048`); "That's it -
  your shop is ready! You can start uploading your artworks." (`:1050`). This supersedes the 2024 guide's "registration is
  subject to a review where you need to have a portfolio online" (`REPLENISH-2026-09-28-2.md:132`). What is reviewed is
  each artwork: "Displate reserves the right not to publish or to reject any artwork that is not in line with our Terms of
  Use points 3.2 and 3.3." (`:1056`; also `:1095-1098`, `:1117`, `:1120`).
- **AI (kill a: not met on these two pages).** [RENDERED] The only AI text on either page is the Verified Creator answer
  (`:1207-1208`). The badge covers work "whether created entirely by hand or with assistance from the latest technologies
  like AI"; the Verified list excludes portfolios "whose artworks are clearly generated without human creative input". That
  gates a badge and a search filter (`:429`), not the marketplace. The copyright page has zero hits for "AI", "artificial"
  or "generated"; it is an infringement rule with "a zero tolerance policy" (`displate-com-about-copyright.txt:93`, `:97`).
  [INFERENCE] Any AI rule lives in ToU 3.2-3.3; a "primarily AI" ban there fires (a) on the Modrinth precedent
  (`REPLENISH-2026-09-28.md:88`).
- **No fee to join (G1 PASS).** [RENDERED] "Becoming an artist on Displate is completely free!" (`:1053`); for the
  artist's own link, "there is no additional fee" (`:1235`). Commission is fixed per size: "$4.50 USD for M size",
  "$9.00 USD for L size", "$14.50 USD for XL size" (`:1158-1162`), "subject to taxes, fees, and any discounts applied"
  (`:1164`); "Artists cannot set the prices for their works" (`:1144`); own-link sales earn "a 41% commission on the net
  price" (`:1220`). This settles the conflicting reports at `REPLENISH-2026-09-28-2.md:296`.
- **Payout: PayPal only, no camera step named (kill c: not met).** [RENDERED] "Please ensure PayPal is available in your
  country, as all payouts are made through PayPal." (`:1164`; also `:769`). Minimum "$50" (`:1173`); "Payments are made
  within 45 days from the date you request the payout." (`:1179`); the request takes "your PayPal email address and
  Displate password" (`:1176`); "Approval of your tax data can take up to 72 hours." (`:1188`). The FAQ has no selfie,
  camera, video, passport or identity step for artists (grep). [repo] PayPal Israel receives goods-and-services payments on
  a personal account, withdraws to an Israeli bank in ILS, and holds PASS_TEST on the camera gate
  (`research/measurements/paypal-israel.md:5-15`).
- **Upload route (kill d: at most half-met).** [RENDERED] "go to "My Artist Profile" and click on "Upload Artwork,""
  (`:1084`); status under "Upload history" (`:1087`). No API, bulk upload or automation rule for artists appears in the FAQ
  (grep; the "bot" hits are the buyers' support bot). [INFERENCE] Manual-only leans true, but "automation forbidden" is
  unread, so (d) cannot fire. The binding cap on an algorithmic series: "Multiple uploads of the same image with only slight
  variations are not allowed" (`:1074`).
- **Public name (G7 leans PASS).** [RENDERED] Even for the badge, "Using your real name or a recognizable artistic
  pseudonym helps build trust" (`:1197`); several featured shops carry single-word handles (`:38-43`). [INFERENCE] Displate
  sells to the buyer ("transactions on our website are between Displate and individuals", `:515`) and sets every price
  (`:1144`), so the artist is a licensor rather than the EU trader. That weakens kill (e) (BOARD Q10), but the ToU decides.
  The login email cannot be changed (`:371`), so the shop must open on the brand mailbox (step 8).
- **Buyers talk to Displate.** [RENDERED] Order status and faults go to its bot and contact form (`:937`, `:940`).
  [INFERENCE] The owner never talks to customers.

**UNKNOWN:** ToU 3.2-3.3 (AI, automated access, exclusivity, name or trader display); the registration form's fields (a
legal-name field?); what the tax-data form asks; whether PayPal's linked country list covers Israel for this payout;
whether an unverified shop is ever found (main-page featuring is automatic on profile visits, `:1150`).

**One next check:** render the Terms of Use at `https://displate.com/about-regulations`, the target of every "Terms of
Use" link in the FAQ (`displate-com-about-faq.html`, 5 links). Read points 3.2 and 3.3 first. A primarily-AI ban there
fires (a); a bar on automated access, with the manual route above, fires (d).

## 2. Zazzle (row 25)

**Status: NEEDS_MORE (unread, route refused). No proposed kill fires; nothing was rendered.**

- [RENDERED: status codes only] All five URLs (ZERO-TESTS rows 117-121) returned no body. The four on `www.zazzle.com`
  gave "HTTP 403 Unknown Error" (e.g. `zazzle-com-terms-user-agreement.meta.json:5`, `:10`); the CAP help section gave
  "HTTP 403 Forbidden" (`help-zazzle-com-hc-en-us-sections-360005063194-create-a-prod.meta.json:5`, `:10`).
  [INFERENCE] As with Spreadshirt (`spreadshirt.md`), a re-render would spend a slot on the same 403.
- **The refill note's GitHub-grade facts stand** (`REPLENISH-2026-09-28-2.md:128`, `:266-271`). CAP is sanctioned and needs no
  per-item click, but "The call itself creates nothing server-side; it renders a product page", so CAP products sit only
  behind our own links. Store products reach Zazzle's buyers, but the published contracts "declare no write operations".
  CAP needs "one Associates enrolment, acceptance of the CAP terms and a declaration of image domains" (`:266`). G5 passes
  (CrUX global 10,000 in 20 of 20 months, `:128`). The `#generativecontent` rule is still snippet grade (`:264`).

**UNKNOWN:** kill (a), both halves (the automation rule; whether CAP products can enter the marketplace); (b) payout and
camera; (c) any creator fee; (d) the store name.

**One next check: the step-8 written question.** No capture holds a Zazzle address (only the render list `urls.txt` names
Zazzle), and an address may come only from a capture (`brand-mailbox-questions.md:5-6`). Finding the recipient is
therefore the pre-send step; if none can be captured, the route is recorded as closed and row 25 parks. Subject:
"Question: automated publishing to a Zazzle store".

```text
Hello Zazzle creator team,

Mehudak (מהודק) is a small design brand considering a Zazzle store. Its accounts are run by an AI agent acting on the
brand's behalf, and its designs are made with AI and would be tagged #generativecontent; this message was written and
sent by that agent.

One question, yes or no: may a creator create and publish store products that appear in Zazzle's marketplace through
an automated process, either the Create-a-Product API or an automated browser session run on the creator's behalf? If
an API creates store products, a link to its documentation would answer the question too. We are asking for your
current rule only, not for an exception or a commitment.

Thank you,
Mehudak (מהודק)
```

**Reading (pre-registered).** An explicit YES from a Zazzle domain means (a) cannot fire. The held questions then go in the
thread, one at a time: royalty payout to a creator resident in Israel with no video or selfie check (b), then the brand
alone as the store's public name (d). An explicit NO fires (a), recorded for the sitting with the reopen trigger "a write
API for store products, or a written yes". Anything else is NOT ANSWERED.

## 3. Society6 (row 27)

**Status: NEEDS_MORE (unread, both URLs gone). No proposed kill fires.**

- [RENDERED: status codes only] Both help-centre articles returned "HTTP 404 Not Found"
  (`help-society6-com-en-us-updates-to-society6-artists-account.meta.json:5`;
  `help-society6-com-en-us-updates-to-pricing-and-artist-earnin.meta.json:10`). The pages are gone, not refused.
- No capture carries a Society6 help-centre index or any other Society6 URL. Across `research/rendered/`, "society6"
  occurs only in those two meta files and the render list `urls.txt`. So the index route has no source yet, and none is guessed.
- The snippet-grade facts stand, unconfirmed (`REPLENISH-2026-09-28-2.md:317-321`): the artist plan fee ended
  3.2.2025; since 18.3.2025 "a new artwork submission and approval process"; a 5-10% artist share; no API or uploader repo
  on GitHub.
- The refill note's held fallback (`:526`, "only if the new-scheme URL above fails") now has its condition met.
  [INFERENCE] It is not the next check: it is the pricing article (G1 and the share), not admission, and it uses the help
  centre's older URL scheme, whose newer scheme already returns 404.

**UNKNOWN:** kill (a) admission; (b) the AI rule; (c) payout and camera; (d) the submission route and automation; the terms
URL (to come from a rendered footer, `REPLENISH-2026-09-28-2.md:323`).

**One next check: the step-8 written question.** No capture holds a recipient, so the pre-send step is the same as
Zazzle's. Subject: "Question: joining as an AI-operated artist account".

```text
Hello Society6 artist team,

Mehudak (מהודק) is a small design brand considering selling wall art on Society6. Its accounts are run by an AI agent
acting on the brand's behalf, and its designs are made with AI and would be declared as such in each listing; this
message was written and sent by that agent.

One question, yes or no: may such an artist account join Society6 today and submit designs for approval? We are asking
for your current rule only, not for an exception or a commitment.

Thank you,
Mehudak (מהודק)
```

**Reading (pre-registered).** An explicit NO fires (a), and (b) as well if the stated reason is AI; both go to the sitting.
After an explicit YES, the held questions go in the thread, one at a time: may designs be submitted through an automated
process (d); then payout to an artist resident in Israel with no video or selfie check (c). Anything else is NOT
ANSWERED. Society6 remains the smallest expected cell of the three (`REPLENISH-2026-09-28-2.md:331-332`).
