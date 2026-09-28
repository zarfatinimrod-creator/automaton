# Wall-art print-on-demand: Displate (row 26), Zazzle (row 25), Society6 (row 27)

**28.9.2026, branch `claude/new-session-j071dx`; an Opus reader in the channel loop; wrote this file only.** Read in full:
`research/rendered/displate-com-about-faq.txt` (1,279 lines) and `displate-com-about-copyright.txt` (135), both 200, fetched
2026-09-28T20:35Z. Also read the seven Zazzle/Society6 `.meta.json` files, `research/breadth/REPLENISH-2026-09-28-2.md`
§2, §3.2-3.4, §6 and `logs/CHANNEL_LOOP.md:149-151`. **Grades:** [RENDERED] = quoted from a capture, `file:line`;
[INFERENCE] = my reading; UNKNOWN = no capture answers it. A proposed kill fires only on a rendered fact and goes to the
sitting to confirm. Artist names in the captures' menus (`faq.txt:38-43`) are not reproduced. Ledger: ₪0.00.

## 1. Displate (row 26)

**Status: NEEDS_MORE. No proposed kill fires; (b) is contradicted by the rendered sign-up; (a) and (d) turn on Terms of
Use points 3.2-3.3, which the FAQ cites but does not quote.** Gates now: G1 P(r) · G2 U↗(r+repo) · G3 U↘(r, absence) ·
G4 U(r) · G5 P(g) · G6 U(r) · G7 U↗(r).

- **Sign-up is a form, not a portfolio review (kill b: not met).** [RENDERED] "Fill out the form and click "Create an
  account." Once your shop is set up, we'll send you a verification email." (`displate-com-about-faq.txt:1048`); "That's it -
  your shop is ready! You can start uploading your artworks." (`:1050`). This supersedes the 2024 guide's "registration is
  subject to a review where you need to have a portfolio online" (`REPLENISH-2026-09-28-2.md:132`). Review is per artwork:
  "Displate reserves the right not to publish or to reject any artwork that is not in line with our Terms of Use points 3.2
  and 3.3." (`:1056`; also `:1095-1098`, `:1117`, `:1120`).
- **AI (kill a: not met on these pages).** [RENDERED] The only AI text is the Verified Creator answer (`:1207-1208`): the
  badge covers work "whether created entirely by hand or with assistance from the latest technologies like AI", and the list
  excludes portfolios "whose artworks are clearly generated without human creative input". That gates a badge and a search
  filter (`:429`), not the marketplace. The copyright page has zero hits for "AI", "artificial" or "generated"; it is an
  infringement rule, "a zero tolerance policy" (`displate-com-about-copyright.txt:93`, `:97`). [INFERENCE] Any AI rule is in
  ToU 3.2-3.3; a "primarily AI" ban there fires (a) on the Modrinth precedent (`REPLENISH-2026-09-28.md:88`).
- **No fee to join (G1 PASS).** [RENDERED] "Becoming an artist on Displate is completely free!" (`:1053`); own-link sales:
  "there is no additional fee" (`:1235`). Commission is fixed: "$4.50 USD for M size", "$9.00 USD for L size", "$14.50 USD
  for XL size" (`:1158-1162`), "subject to taxes, fees, and any discounts applied" (`:1164`); "Artists cannot set the prices
  for their works" (`:1144`); own-link sales earn "a 41% commission on the net price" (`:1220`). This settles the
  conflicting reports at `REPLENISH-2026-09-28-2.md:296`.
- **Payout: PayPal only, no camera step named (kill c: not met).** [RENDERED] "Please ensure PayPal is available in your
  country, as all payouts are made through PayPal." (`:1164`; also `:769`); minimum $50 (`:1173`); "Payments are made within
  45 days from the date you request the payout." (`:1179`); the request takes "your PayPal email address and Displate
  password" (`:1176`); "Approval of your tax data can take up to 72 hours." (`:1188`). No selfie, camera, video, passport
  or identity step for artists (grep). [repo] PayPal Israel takes goods-and-services payments on a personal account, pays
  out to an Israeli bank in ILS, and holds PASS_TEST on the camera gate (`research/measurements/paypal-israel.md:5-15`).
- **Upload route (kill d: at most half-met).** [RENDERED] "go to "My Artist Profile" and click on "Upload Artwork,""
  (`:1084`), tracked in "Upload history" (`:1087`). No API, bulk upload or automation rule for artists (grep; "bot" hits are
  the buyers' support bot). [INFERENCE] Manual-only leans true; "automation forbidden" is unread, so (d) cannot fire. The
  cap on an algorithmic series: "Multiple uploads of the same image with only slight variations are not allowed" (`:1074`).
- **Public name (G7 leans PASS).** [RENDERED] Even for the badge, "Using your real name or a recognizable artistic
  pseudonym helps build trust" (`:1197`); several featured shops use single-word handles (`:38-43`). [INFERENCE] Displate
  sells to the buyer ("transactions on our website are between Displate and individuals", `:515`) and sets every price
  (`:1144`), so the artist is a licensor, not the EU trader; that weakens kill (e) (BOARD Q10), but the ToU decides. Buyers
  go to Displate's bot and contact form (`:937`, `:940`), so the owner talks to no customer. The login email cannot be
  changed (`:371`): open the shop on the brand mailbox (step 8) from the start.

**UNKNOWN:** ToU 3.2-3.3 (AI, automated access, exclusivity, name or trader display); the registration fields (a legal
name?); the tax-data form; whether PayPal's linked country list covers this payout to Israel; whether an unverified shop
is ever found (main-page featuring is automatic on profile visits, `:1150`).

**One next check:** render `https://displate.com/about-regulations`, the target of all 11 "Terms of Use" links in the FAQ
(10 in the body, 1 in the footer; `displate-com-about-faq.html`). Read 3.2 and 3.3 first: a primarily-AI ban fires (a); a
bar on automated access, with the manual route above, fires (d).

## 2. Zazzle (row 25)

**Status: NEEDS_MORE (unread, route refused). No proposed kill fires; nothing was rendered.**

- [RENDERED: status codes only] All five URLs (ZERO-TESTS rows 117-121) returned no body: the four on `www.zazzle.com` gave
  "HTTP 403 Unknown Error" (e.g. `zazzle-com-terms-user-agreement.meta.json:5`, `:10`), the CAP help section "HTTP 403
  Forbidden" (`help-zazzle-com-hc-en-us-sections-360005063194-create-a-prod.meta.json:5`, `:10`). [INFERENCE] As with
  Spreadshirt (`spreadshirt.md`), a re-render spends a slot on the same 403.
- **The refill note's GitHub-grade facts stand** (`REPLENISH-2026-09-28-2.md:128`, `:264-271`): CAP needs no per-item click,
  but "The call itself creates nothing server-side; it renders a product page", so its products sit only behind our links;
  store products reach Zazzle's buyers, but the contracts "declare no write operations". CAP needs "one Associates
  enrolment, acceptance of the CAP terms and a declaration of image domains" (`:266`). G5 passes (CrUX global 10,000,
  `:128`). The `#generativecontent` rule is still snippet grade (`:264`).

**UNKNOWN:** both halves of (a) (automation; CAP in the marketplace), (b) payout and camera, (c) any fee, (d) the store name.

**One next check: the step-8 written question.** No capture holds a Zazzle address (only the render list `urls.txt` names
Zazzle), and an address may come only from a capture (`research/owner-asks/brand-mailbox-questions.md:5-6`). Finding it
is the pre-send step; if none can be captured, the route is recorded closed and row 25 parks. Subject: "Question:
automated publishing to a Zazzle store".

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

**Reading (pre-registered).** An explicit YES from a Zazzle domain means (a) cannot fire; then, one at a time in the
thread: royalty payout to a creator resident in Israel with no video or selfie check (b), then the brand alone as the
store name (d). An explicit NO fires (a) for the sitting, reopen trigger "a write API for store products, or a written
yes". Anything else is NOT ANSWERED.

## 3. Society6 (row 27)

**Status: NEEDS_MORE (unread, both URLs gone). No proposed kill fires.**

- [RENDERED: status codes only] Both articles returned "HTTP 404 Not Found"
  (`help-society6-com-en-us-updates-to-society6-artists-account.meta.json:5`;
  `help-society6-com-en-us-updates-to-pricing-and-artist-earnin.meta.json:10`): gone, not refused.
- No capture carries a Society6 help-centre index or any other Society6 URL ("society6" occurs only in those two meta
  files and `urls.txt`), so the index route has no source, and none is guessed.
- Snippet-grade facts stand, unconfirmed (`REPLENISH-2026-09-28-2.md:317-321`): plan fee ended 3.2.2025; since 18.3.2025
  "a new artwork submission and approval process"; a 5-10% share; no API or uploader on GitHub.
- The held fallback (`:526`, "only if the new-scheme URL above fails") now has its condition met. [INFERENCE] It is not the
  next check: it is the pricing article (G1), not admission, on the older URL scheme of a centre whose newer one 404s.

**UNKNOWN:** (a) admission, (b) AI, (c) payout and camera, (d) route and automation; the terms URL (`REPLENISH-2026-09-28-2.md:323`).

**One next check: the step-8 written question** (recipient pre-send step as for Zazzle). Subject: "Question: joining as an
AI-operated artist account".

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

**Reading (pre-registered).** An explicit NO fires (a), and (b) if the reason given is AI, for the sitting. After an explicit
YES, one at a time in the thread: automated submission (d), then payout to an artist resident in Israel with no video or
selfie check (c). Anything else is NOT ANSWERED. Society6 stays the smallest expected cell (`REPLENISH-2026-09-28-2.md:331-332`).
