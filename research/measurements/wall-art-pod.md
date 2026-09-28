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

## 4. Tick 9 (row 131 render) — Displate Terms of Use

**Read 28.9.2026 by an Opus reader.** Capture: `displate-about-regulations` (200, fetchedAt 2026-09-28T21:03Z, first fetch;
983 txt lines). The whole Terms text was read (tou.txt:90-945, "These Terms of Use come into force on the 15 of July
2026.", :945). The html was used for the section numbering (the `<ol>` nesting, and the `__NEXT_DATA__` markdown at
tou.html:640) and for links. Short name `tou`. Every quote was checked with `grep -n -F`. Artist handles in the page's
menus are not reproduced.

**Status: NEEDS_MORE, still promising.**
- Of the board's pre-registered kills (§4 row 26), (a), (b) and (c) do not fire. (d) is UNSETTLED: the Terms have no
  general ban on automation, but three clauses give Displate discretion over bots.
- Two new facts go to the sitting: an Artist must be a business, and SMS identity verification sits before the first
  publication.
- No document is left to render that could settle (d). The next step is a written question to a captured address.

**Numbering.** The page numbers paragraphs with CSS counters. In chapter III, the list positions match the Terms' own
labels, and the explicit "3.39A" (tou.txt:381) confirms it. So:
- 3.2 is "The Product Model will be placed on an Account if:" (tou.txt:211-219).
- 3.3 is the removal list (:221-235).

Chapter IV does not match. The Terms cite SMS verification as "section 4.5" (:229, :457) and duplicate or fake accounts
as "section 4.11" (:229), but those paragraphs sit at list positions 12 and 18. The immediate-termination list names
"4.9., 4.10., 4.11., 4.12., 6.1., 6.2., 6.3., 7.1." (:481). [INFERENCE] Under the Terms' own cross-reference numbering,
4.11 is the duplicate, fake or bot-created account clause, so breaching it would be an immediate-termination ground.
Under the list positions it would not be.

**3.2 and 3.3: what artwork is refused** [RENDERED]
- **3.2, conditions for publishing.**
  - "a) The Artist is the owner of the Product Model;" (:213).
  - Technical parameters (:215).
  - "c) It will not involve re-uploading a Product Model with only minor changes to the color palette, composition, or
    other small adjustments (prohibition of duplicating the Product Models);" (:217).
  - The metadata "must be consistent with the theme of the Product Model, must not be misleading" (:219).
- **3.3, grounds for removal.** Displate "reserves the right to refrain from posting, modify, and/or remove Product
  Models" (:221) when:
  - "a) they do not comply with the profile of the Service and the Terms of Use," (:223);
  - they fail 3.2 (:225);
  - "c) they have not generated any sales in the last 3 months," (:227);
  - the Artist's identity "has not been verified following section 4.5 of the Terms or from the Accounts described in
    section 4.11 of the Terms of Use" (:229);
  - the metadata is grossly inconsistent (:231);
  - "f) they violate the rules outlined in section 6.2 of the Terms of Use." (:233). 6.2 covers illegal, offensive and
    indecent content, and "h) contain external links." (:513).
- **Neither paragraph has an AI rule.**

**Kills (a)-(d) are pre-registered on the board. (e) is from the refill note only, so it is PROPOSED.**
- **(a) AI-generated art barred: DOES NOT FIRE.**
  - [RENDERED] "artificial intelligence" occurs only in the buyers' Custom Displates feature. It covers Style Filters
    "using tools based on artificial intelligence" (:166, :401, :403), and uploaded buyer files "may be subject to
    verification using automated means, including tools based on artificial intelligence" (:391). Both are about
    buyers' own uploads, not about Artists' Product Models.
  - There is no "AI-generated" and no "human input" rule for Artists.
  - Residual risks for the sitting, both [INFERENCE] and neither a ban:
    - the ownership condition (:213) and the warranty that the Artist "holds (e.g. is the owner, licensee or lessee of)
      the copyrights" (:489) are an honesty question for purely AI output;
    - the definition "Product - a physical copy of a work or another product of human activity" (:118) describes the
      printed item, not the upload.
- **(b) The review requires a named human artist: DOES NOT FIRE.**
  - [RENDERED] An Artist may be "a natural person engaged in business activity, an unincorporated organisational entity
    that has been endowed with legal capacity on the basis of separate provisions, or a legal person" (:98).
  - The Artist form asks for "an email address, phone number and Password" (:423).
  - The public name is a nickname. A converted account without one gets "a random one, which can be changed by sending
    an email to" `artists@displate.com` (:447).
- **(c) The payout excludes Israel or needs a camera step: DOES NOT FIRE.**
  - [RENDERED] Payment goes to a "PayPal email address" (:277), with a minimum of "USD 50 (fifty)" (:267), "within 45
    (forty-five) days from the date the Artist submits a valid payment request" (:269).
  - There is a tax step: "At the time of pay-out, the Artist commits to provide basic and valid data (tax data) for
    identification purposes. The system will verify data within 72 hours." (:279). Advance tax deductions "(i.a. WHT,
    VAT)" (:275).
  - Identity is checked by SMS only: "The identity verification is carried out via SMS." (:455). Again on a PayPal
    change: "Future SMS verification may also apply to those users who have changed their Pay Pal address or critical
    information." (:449).
  - "passport", "selfie" and "camera" have 0 hits. "video" occurs only for reviews and ads (:345, :525). No country is
    barred; "Israel" occurs only in the buyers' delivery list (:327).
  - [repo] PayPal Israel holds PASS_TEST on the camera gate (`paypal-israel.md`).
- **(d) Manual upload only, and automation forbidden: UNSETTLED.**
  - The manual half stands: there is no API anywhere ("API": 0 hits), and the FAQ's route is an upload button (§1).
  - There is no general ban on automation, but three clauses give Displate discretion. [RENDERED]
    - (i) Displate may delete, or limit uploads on, "Accounts that exhibit characteristics of duplicate or fake
      accounts" (:471), including accounts "that indicate they were created using automated tools (e.g., bots)."
      (:471).
    - (ii) Artists must "a) use the Website in a way that does not distort its functioning, in particular through the
      use of certain software or devices;" (:561).
    - (iii) Displate may ignore, and act against, activity "(particularly those generated by bots or in other automated
      ways, if they are not genuine)" (:881).
  - Other rules that bear on it:
    - one registration per Artist, and no "using the Accounts of other Artists/Users/Influencers or sharing their
      Account with other Artists/Users/Influencers" (:563);
    - "The Artist/User/Influencer is solely responsible for the acts performed on the Website using a valid Name and
      Password." (:573).
  - [INFERENCE] One genuine account, opened by a person and operated through the normal interface without distorting
    the site, is not barred in words. An account opened by an agent meets clause (i) literally. The terms are silent on
    agents operating an account, and silence is not a yes. So (d) parks on the written question below.
- **(e) The trader shown to buyers (Q10): DOES NOT FIRE on these Terms.** This kill is PROPOSED only.
  - [RENDERED] The buyer's contract is with Displate. "The Service Provider is obliged to deliver the Product without any
    defects and is liable for the conformity of the Product with the sale agreement." (:317). The Service Provider is
    "GWD CONCEPT Sp. z o.o. with registered office in Warsaw" (:138).
  - There is no trader, DSA or traceability clause: "trader", "Digital Services" and "DSA" have 0 hits.
  - The Artist is shown by a nickname (:447).

**New for the sitting (not proposed kills)**
1. **The Artist must be a business.** "Artist is not a consumer within the meaning of the law." (:98), and must be a
   natural person "engaged in business activity" or an entity (:98). [INFERENCE] The owner's individual account fits
   only once step 2 (business registration) exists. That ties Displate to step 2, as the board already assumes for
   every paid line.
2. **The SMS gate before the first publication.** "The initial displaying and publication of the Product Model on the
   Artist's Account requires the Artist's identity to be verified" by an SMS code sent to the phone number in the form
   (:455). Without the code, nothing can be published. It is not a camera step. It is a one-time owner step: the
   owner's phone, or a brand number. It recurs only when the PayPal address or critical data changes (:449). Displate
   "reserves the right to exempt selected Artists" (:457).
3. **Two keep-alive rules.**
   - "Inactive Accounts, i.e. not used for more than three (3) months from last login may be removed without notice."
     (:571). An agent must log in within every 3 months.
   - Designs with no sale in 3 months may be removed (:227).
4. **The 15.7.2026 Terms postdate the FAQ read in §1.** The US-users version is a separate PDF,
   `https://cms-static-pages-assets.displate.com/DISPLATE_TERMS_OF_USE_US_26_06clean_9524ecc20f.pdf` (tou.html:637;
   "for United States Users", tou.txt:941). [INFERENCE] It does not govern an Israeli artist, so it is not queued.

**Gate line (was G1 P(r) · G2 U↗(r+repo) · G3 U↘(r, absence) · G4 U(r) · G5 P(g) · G6 U(r) · G7 U↗(r)).**
Now G1 P(r) · G2 U↗(r+repo) · **G3 U(r)** · **G4 U↗(r)** · G5 P(g) · **G6 U↗(r)** · G7 U↗(r).
- **G1:** no Artist fee in the Terms. The only fees are the buyers' Club subscription (:112).
- **G2:** PayPal, SMS and a tax-data form. The tax form's fields are UNKNOWN.
- **G3:** it moves from leaning FAIL to neutral. The Terms hold no general automation ban, only the three clauses above,
  and there is still no API.
- **G4:** no AI rule for Artists. Honest metadata is required, which suits declaring AI.
- **G6:** one account opening plus one SMS code unlocks publishing.
- **G7:** the public name is a nickname and the seller is Displate. The registration fields beyond email and phone are
  UNKNOWN.

**Next step.**
1. **The step-8 written question** (this settles (d)).
   - The recipient `artists@displate.com` is in this capture (tou.txt:447; `mailto:` at tou.html:340).
   - Draft, for the main thread to add to `research/owner-asks/questions.json` and its note together. Subject: "Question:
     an artist shop run by an AI agent".
     *"Hello Displate artist team. Mehudak (מהודק) is a small design brand considering a Displate shop. The shop would
     be opened and SMS-verified by its owner; after that, uploads, titles and descriptions would be done by an AI agent
     acting for the brand, through the normal web interface at a human pace, with AI assistance stated in each
     description. This message was written and sent by that agent. One question, yes or no: is that allowed under your
     Terms of Use? We are asking for your current rule only, not for an exception. Thank you, Mehudak (מהודק)"*
   - Pre-registered reading:
     - An explicit YES from a Displate domain means (d) cannot fire. Then ask in the same thread about a PayPal payout to
       an artist resident in Israel, and the tax-data form.
     - An explicit NO fires (d) for the sitting. It reopens on a written yes or an upload API.
     - Anything else is NOT ANSWERED. Note that the Terms let Displate ignore bot-generated messages "if they are not
       genuine" (:881).
2. **An optional render** (G7 and Q10): **https://displate.com/about-privacy** (tou.txt:116; tou.html:298). It shows
   which personal data an Artist gives (a legal name, an address, a tax ID?) and whether any of it is published.
3. A lower-value render: the sign-up page behind "Sell your art" (tou.txt:969). Its link is `/open-shop` (tou.html:640),
   so the URL is `https://displate.com/open-shop`. It would show the registration fields. [INFERENCE] It is likely a
   JavaScript form, so the privacy policy comes first.
