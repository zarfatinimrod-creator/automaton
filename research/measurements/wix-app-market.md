# Measurement: Wix App Market (BOARD-LOOP rank 11, ZERO-TESTS row 5)

**Date:** 2026-09-27
**Ordered by:** `research/channel-loop/BOARD-LOOP.md:157-162` (candidate 11) and `research/channel-loop/ZERO-TESTS.md:14`
(row 5: "whether it pays Israel, and whether the $200 floor rolls over or is forfeited").
**Gate being tested (BOARD-LOOP.md:160):** "if it is payable to Israel and the floor rolls over rather than forfeits, run
the two-hour occupancy scan of the Hebrew/Israeli App Market categories and either name one niche or record 'none'".
**Kill list (BOARD-LOOP.md:162):** Israel not payable; the floor forfeits or accrues without moving on any plausible
ceiling; the niche has free incumbents; developer terms impose a support SLA or human conversations; or no niche can be named.

**Status (after tick 3, 28.9.2026): NEEDS_MORE, unchanged.** Tick 3 found the partner-agreement capture was only the docs wrapper; the body is at https://dev.wix.com/app-market-partner-agreement (ZERO-TESTS row 18). Tick 2's text follows. The floor half of the gate passes (rolls over, tick 1). The
Israel half is still UNKNOWN: the rendered payout-account page names Tipalti as the payout handler but says nothing about
countries, methods, documents or fees. A new open question came up: the Partner onboarding flow registers "your company"
(wix-payout-account.txt:134). See "Tick 2 reading" at the end of this file.

## Grades
- **RENDERED**: the sentence is quoted from the stored capture, with its line number (`grep -n`).
- **UNKNOWN**: the capture does not answer it. Nothing below is filled in from general knowledge.

---

## 1. What was read

| File | What it is |
|---|---|
| `research/rendered/wix-app-payments-faq.txt` (218 lines) | extracted text of the FAQ, read in full |
| `research/rendered/wix-app-payments-faq.html` (63 lines, 670,360 bytes) | raw HTML, read for link targets and for the page's embedded changelog data (line 64, a JSON blob of 100 "What's new" entries that ships inside this page) |
| `research/rendered/wix-app-payments-faq.meta.json` | capture metadata |

From the `.meta.json`: `url` = `https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/payments-and-billing-faqs`,
`fetchedAt` = **`2026-09-27T22:46:04.311Z`**, `status` = 200, `byteLength` = 670360, `truncated` = false,
`firstFetch` = true, `sha256` = `db55f47ed9da75f65fc7db4028b3708995b4b36124b6f209a5db07dca9696924`. Captured by
`.github/workflows/render-watch.yml`. The page itself says (txt:216) "Last updated: 9 September 2026".

**Only this one page was captured.** `ls research/rendered/ | grep -i wix` returns only the three `wix-app-payments-faq.*`
files, and `research/rendered/urls.txt:249-250` queues only this URL. The FAQ defers its money rules to the Partner
Agreement and its payout setup to a separate article (see §3); neither is captured.

**Two kinds of evidence below.** Most quotes are from the FAQ body (`.txt`). A few come from the changelog blurbs embedded
in the raw HTML at line 64; those are Wix's own one-paragraph summaries of other articles, served in this page, not the
FAQ text. They are marked "(html:64, changelog blurb)" so the board can weigh them accordingly.

---

## 2. The questions

### Q1. Payout countries and method (PayPal? bank? Payoneer?)

**Answer: payouts go to a bank account, through a Tipalti account the Wix account owner sets up once. Whether Israel is a
payable country is not on this page. PayPal and Payoneer do not appear anywhere in the capture.**

- txt:138 (RENDERED): "Payment arrives in your bank account at the beginning of the next month. For example, revenue earned in March would arrive at the beginning of May."
- html:64, changelog blurb dated 2026-07-20, titled "New article: Set up your payout account for paid apps" (RENDERED): "Before you can publish a paid app to the Wix App Market, the account owner must set up a Tipalti account to receive payouts. This is a one-time setup at the account level."
- html:64, changelog blurb dated 2026-09-01, "New release: Earnings APIs" (RENDERED): "The invoices Wix's payment handler, Tipalti, raised for the partner and their payment state."
- **Israel as a payout country: NOT ON THIS PAGE.** `grep -c -i israel` on both the `.txt` and the `.html` returns 0. Grade **UNKNOWN**.
- **PayPal / Payoneer as methods: NOT ON THIS PAGE** (0 occurrences of either in the `.html`). Grade **UNKNOWN**.
- **Which methods Tipalti offers a payee in Israel: NOT ON THIS PAGE.** Grade **UNKNOWN**.
- Note: `docs/REJECTED.md:938-940` records "the App Market is Israel-payable, free to enter" at the grade it had in
  `storefronts`, i.e. not rendered. This capture does not raise that grade.

### Q2. The payout threshold: is it $200, and does an unpaid balance roll over or get forfeited?

**Answer: yes, $200, and it is a threshold on the accumulated balance, not on each month's earnings. Below it, earnings
roll over month to month until the threshold is met. The page does not describe any expiry or forfeiture.**

- txt:134 (RENDERED): "As per the Partner Agreement , we pay out monthly once your accumulated revenue share reaches the minimum payout threshold of $200 . If your earnings are below the threshold, they roll over to the next month until the minimum is met."
- txt:136 (RENDERED): "Around the middle of the following month, we post the details of your upcoming payout in your Wix Partners account under Earnings > Payouts , if your accumulated earnings have passed the $200 threshold. You need the Manage Earnings permission to access this area."
- **Rolls over: RENDERED.**
- **Forfeiture, dormancy expiry, or loss of a sub-threshold balance on account closure or delisting: NOT ON THIS PAGE.**
  The FAQ neither says a balance can be lost nor says it never can; it points to the Partner Agreement (txt:134).
  Grade **UNKNOWN**.
- **Correction for the board:** `BOARD-LOOP.md:159` calls it "a $200/month payout floor (~₪740) ... below which money
  accrues and never moves". The rendered text says the $200 is reached by *accumulated* revenue share (txt:134, 136), so
  a small line crosses it after enough months rather than needing $200 in a single month. "Never moves" holds only if
  cumulative earnings never reach $200.
- Timing (RENDERED, txt:138): money earned in month M arrives at the beginning of month M+2.

### Q3. Revenue share

**Answer: 80% to the developer, 20% to Wix, after a 2.5% transaction fee and applicable sales tax, paid monthly; 100% to
the developer for their first 12 months on the platform. It applies only to users who start at Wix.**

- txt:130 (RENDERED): "We split all revenue with you 80/20 , with 80% going to you and 20% to us. This revenue share is paid out to you monthly. If it's your first year on our platform, you keep 100% of everything you earn for the first 12 months. Revenue is calculated after a 2.5% transaction fee and applicable sales tax. The revenue share applies to users that start at Wix, meaning users who aren't already paying for your app on another website."
- txt:126 (RENDERED), which names the governing text: "It's important that you've read and understood the Partner Agreement , particularly Section > 9: Pricing, Collection and Revenue Sharing ."
- txt:196 (RENDERED): "The primary price of your app is always set in US dollars ($) by you. When we list your app in other territories, our system calculates the fair market rate for that location and sets the price in the local currency to optimize sales."
- txt:198 (RENDERED): "This means that the money you receive for each app sale can fluctuate up and down, depending on the territory in which it was sold."

### Q4. Developer account and identity requirements

**Answer: the page names only an account owner who sets up Tipalti once, and permissions inside the Wix account. Identity
documents, tax forms, legal name versus brand name, and whether the listing can carry the brand "Mehudak" are not on this
page.**

- html:64, changelog blurb (RENDERED): "the account owner must set up a Tipalti account to receive payouts. This is a one-time setup at the account level."
- txt:136 and txt:146 (RENDERED): "You need the Manage Earnings permission to access this area."
- txt:150 (RENDERED), on refunds: "It's totally up to you if you want to offer refunds for your app and you can do this directly from your app's dashboard (this feature is only accessible to Collaborators defined as 'Owners')."
- **What the Tipalti setup asks for (ID, proof of address, tax form, a camera or selfie step): NOT ON THIS PAGE.** Grade **UNKNOWN**.
- **Whether the payee must be a person in their legal name or can be a business/brand: NOT ON THIS PAGE.** Grade **UNKNOWN**.
- **Whether the public developer/company name on the listing can be "Mehudak": NOT ON THIS PAGE.** The navigation lists an
  article "Add Your Company Info" (href `/docs/build-apps/launch-your-app/market-listing/add-your-company-info`), but its
  content is not captured. Grade **UNKNOWN**.
- **Whether an agent can hold a collaborator role with the Manage Earnings permission, or the 'Owners' role that refunds need: NOT ON THIS PAGE.** Grade **UNKNOWN**.
- **Any fee to open a developer account: NOT ON THIS PAGE.** Grade **UNKNOWN**.

### Q5. Support SLA or other obligations to users

**Answer: no support SLA, response-time rule or duty to talk to users is on this page. The obligations it does state are
light and mostly carried by Wix when Wix does the billing.**

- **Support SLA / required response time / required human contact: NOT ON THIS PAGE.** `grep -i` for "respond within",
  "24 hours", "business days" and "customer support" in the `.html` returns 0 each. The navigation has a "User Support"
  section (txt:105) whose articles are linked but not captured: `about-user-support`, `user-reviews`, `issue-a-refund`,
  `delisting-an-app` (under `/docs/build-apps/manage-your-app/user-support/`). Grade **UNKNOWN**.
- Refunds are optional (txt:150, quoted in Q4): "It's totally up to you if you want to offer refunds for your app". RENDERED.
- Failed card payments are chased by Wix, not the developer (RENDERED): txt:158 "When payment fails a 45-day grace period begins." txt:162 "We'll email users every 3 days to let them know that payment has failed, and remind them to make any necessary changes." txt:168 "If we've been unsuccessful in taking payment from the user after 45 days, their package will be cancelled."
- Sales tax to buyers is Wix's job when Wix bills (RENDERED): txt:174 "If Wix takes care of your payments and billing, there's nothing you need to do – our system resolves this for you. If you manage billing on your own platform, then you're responsible for all applicable tax rates."
- Chargebacks (RENDERED): txt:208 "If your app uses Wix's billing, Wix will automatically attempt to reverse the chargeback. If the reversal fails, you will see the chargeback to the user in your payout data."
- Exchange rates (RENDERED): txt:204 "The exchange rate we use is updated from time to time, but we won't increase the price for existing users. If the updated exchange rate lowers the price, we'll lower the price for all users who pay in this currency."

### Extra findings in the same capture (not asked, relevant to the kill list)

- App review is automated (html:64, changelog blurb dated 2026-07-27, "New feature: AI review for Wix App Market
  submissions", RENDERED): "When you submit your app and publish it, Wix now runs an automated AI review that checks your app against the App Market requirements. Results are typically available within minutes. If it doesn't pass, blockers appear in your app's dashboard describing what to fix. If your app passes, it's published to the Wix App Market."
  This bears on "no human conversations" for submission; it says nothing about user support.
- Earnings are readable by API (html:64, changelog blurb dated 2026-09-01, "New release: Earnings APIs", RENDERED):
  "The Earnings APIs allow a Wix Partner to track what they earn through the Wix Partner Program and what Wix pays them."
  If the agent can hold credentials for it, the ledger could ingest payouts without the owner forwarding statements.
  Who may call it is not on this page.
- Ranking signal (html:64, changelog blurb dated 2026-08-03, "New release: Verified badge in the Wix App Market",
  RENDERED): "Wix grants it automatically to apps that follow the App Market guidelines, have been live 60+ days, and have 40+ live installs on premium Wix sites."
  So a new app starts without the badge; how much that affects ranking is not on this page.

---

## 3. Verdict for the board: **NEEDS_MORE**

The gate (BOARD-LOOP.md:160) has two halves:

| Half | Result | Grade |
|---|---|---|
| The floor rolls over rather than forfeits | Rolls over, on the accumulated balance (txt:134) | RENDERED |
| Payable to Israel | Not on this page; the rail is a Tipalti account and a bank transfer (html:64, txt:138) | UNKNOWN |

The floor half **passes**. The Israel half is open, so the occupancy scan must not start yet.

**The page that settles the open half** (linked from this capture at txt:146 "Learn more in Set up your payout account",
and it is the article the html:64 changelog blurb announces):

- **https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/set-up-your-payout-account**
  — payee countries or a link to them, what Tipalti asks for (identity, tax form, any camera step), person vs business payee.

Two further pages, named in the capture, settle the remaining kill criteria and should go in the same render batch:

- **https://dev.wix.com/app-market-partner-agreement** (linked at txt:126 and txt:134) — Section 9 "Pricing, Collection
  and Revenue Sharing" for whether a sub-$200 balance can ever be forfeited (on termination, delisting or dormancy), and
  any developer duties to users.
- **https://dev.wix.com/docs/build-apps/manage-your-app/user-support/about-user-support** (in the capture's navigation)
  — whether the developer must provide support, and on what clock.

Suggested `urls.txt` lines (for the main thread, which owns that file):

```
https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/set-up-your-payout-account	wix-payout-account
https://dev.wix.com/app-market-partner-agreement	wix-partner-agreement
https://dev.wix.com/docs/build-apps/manage-your-app/user-support/about-user-support	wix-user-support
```

---

## 4. What the owner would have to do if admitted

**One-time (from this page):**
- Be the Wix "account owner" and set up the Tipalti payout account: "a one-time setup at the account level" (html:64,
  changelog blurb). What it asks for is UNKNOWN until the payout-account page is rendered; if it includes a camera or
  selfie step, that breaks the "no owner on camera" rule for this candidate.
- Step 2 applies per `BOARD-LOOP.md:161`; its cost under the ₪0 rule is measured separately in
  `research/measurements/step2-cost.md`, not here.

**Recurring (from this page): none stated.**
- Payouts are automatic once the accumulated balance passes $200 (txt:134); no per-payout request is described.
- Failed payments (txt:158-168), buyer sales tax (txt:174) and chargeback reversal (txt:208) are handled by Wix when the
  app uses Wix's billing. Using Wix billing rather than partner billing keeps it that way (txt:174).
- One possible per-item owner action to design out: refunds are "only accessible to Collaborators defined as 'Owners'"
  (txt:150). Refunds are optional ("totally up to you", txt:150), so a no-refund policy, or an agent holding an Owner
  collaborator role (UNKNOWN whether allowed), avoids the owner handling each one.
- Whether the owner must issue a receipt or invoice for each payout is NOT ON THIS PAGE; the capture says only that
  Tipalti raises invoices "for the partner" (html:64, changelog blurb). That is a Step 2 question.

**Does anything cost the owner money?**
- Nothing on this page is a charge to the developer. Every cost it names is taken out of revenue before payout: the
  2.5% transaction fee and applicable sales tax, then Wix's 20% share (0% in the first 12 months) (txt:130).
- **UNKNOWN (not on this page):** any developer-account fee; any Tipalti or bank-transfer fee on a payout; whether testing
  requires buying anything (the navigation lists "Test your app on a premium site",
  `/docs/build-apps/launch-your-app/app-distribution/test-your-app/test-your-app-on-a-premium-site`, content not captured).
  Under the ₪0 rule of 27.9.2026 the last one must be checked before any build, because a premium-site purchase would be
  an owner cost before the ledger shows income.

---

## Tick 2 reading (28.9.2026)

**Ordered by:** `research/channel-loop/ZERO-TESTS.md:22` (row 13: "whether an Israeli payee can set up a payout account, and
how"), queued at `research/rendered/urls.txt:266-267`. It is the first of the three pages that §3 above asked for.

### What was read

| File | What it is |
|---|---|
| `research/rendered/wix-payout-account.txt` (182 lines) | extracted text, read in full. Lines 1-111 are site navigation; the article is lines 113-182 |
| `research/rendered/wix-payout-account.html` (71 lines, 649,560 bytes) | raw HTML, searched for link targets and for the article's Markdown source (line 72), which matches the `.txt` word for word |
| `research/rendered/wix-payout-account.meta.json` | capture metadata |

From the `.meta.json`: `url` = `https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/set-up-your-payout-account`,
`fetchedAt` = **`2026-09-28T00:52:00.430Z`**, `status` = 200, `truncated` = false, `firstFetch` = true,
`sha256` = `1ee3f65a3a854efed04aac475633070634d4293ad0f33288fcb35284aa83f289`. The page says (txt:180) "Last updated: 9 September 2026".

**Term counts** (`grep -c -i` on the `.txt`; `grep -o -i | wc -l` on the `.html`):

| Term | `.txt` | `.html` | Note |
|---|---|---|---|
| israel | 0 | 0 | |
| countr (country/countries) | 0 | 0 | |
| paypal / payoneer | 0 / 0 | 0 / 0 | |
| bank | 0 | 0 ("bank account", "wire") | |
| tipalti | 2 | 6 | all six are the article text, its meta description and its Markdown copy, plus one changelog blurb already quoted in tick 1 |
| fee | 0 | 7 | all seven are in the page's embedded changelog (Wix Capital, restaurant cancellation fees, cart totals, social media), none about payouts |
| tax / W-8 / W-9 | 0 / 0 / 0 | 0 "tax form", 0 W-8, 0 W-9 | |
| identity / passport / government / selfie | 0 / 0 / 0 / 0 | 13 / 0 / 0 / 0 | the 13 "identity" hits are all in the embedded changelog (html:72: comment reactions, member sign-in with an identity provider, and an "Identity" product tag), none about payees |

The article body contains no link to Tipalti, to a country list, or to any fee schedule (`grep -o 'href="[^"]*"'` for
tipalti/partner/payout/earnings returns only the article's own anchors, the Payouts dashboard doc, the Wix dashboard
`https://manage.wix.com/studio/revenues/payouts`, and a navigation link to the Partner Agreement).

### The questions

**Q1. Can a developer located in Israel set up a payout account? — UNKNOWN.**
- Neither "Israel" nor any word for country appears in the `.txt` or the `.html` (0 each, table above).
- What the page does render is that the payout account is a Tipalti account, set up once, and that it is required only
  for paid apps:
  - txt:119 (RENDERED): "Before you can publish a paid app, you must become a Wix partner and then set up a Tipalti account to receive payouts. This is a one-time setup at the account level, not the app level."
  - txt:121 (RENDERED): "If your app's business model isn't free, a blocker appears during the app review process requiring you to complete this setup. Until payout account setup is complete, you can't publish the app."

**Q2. Which payout methods and providers? — provider RENDERED (Tipalti); methods UNKNOWN.**
- txt:136 (RENDERED): "Set up your Tipalti account to configure how you receive payouts."
  This places the choice of method inside Tipalti; the page does not name any method. Bank, PayPal, Payoneer, wire, check:
  0 occurrences each. The only method in any Wix capture remains the FAQ's "Payment arrives in your bank account at the
  beginning of the next month" (wix-app-payments-faq.txt:138, tick 1).

**Q3. Which countries are supported or excluded? — UNKNOWN.** Not on this page (0 occurrences), and the page links to no
country list.

**Q4. What identity or tax documents are required? — UNKNOWN.** Not on this page. What it renders is the order of steps
and one wording that matters for Israel:
- txt:132 (RENDERED): "In your account dashboard, navigate to Earnings > Payouts ."
- txt:134 (RENDERED): "Click Join the Partner Program . The Wix Partners onboarding flow guides you through registering your company as a Wix partner."
- txt:138 (RENDERED): "Return to your app and continue the publish flow."
- **"registering your company" (txt:134): whether this requires a legal entity, or accepts an individual or an Israeli
  sole trader (osek patur / osek murshe), is NOT ON THIS PAGE. Grade UNKNOWN.** It is recorded as an open question, not as
  a blocker: the wording may be generic. If it does require an incorporated company, that is an owner cost and per-year
  paperwork, which the ₪0 rule and the "no per-item paperwork" rule would not allow.
- Whether the Tipalti payee is the owner in their legal name, and whether the listing can show "Mehudak": still UNKNOWN (as in tick 1, Q4).

**Q5. Is there any fee? — UNKNOWN.** No payout, Tipalti, transfer, currency or partner-program fee appears on this page
(0 "fee" in the `.txt`; the 7 in the `.html` are unrelated changelog text). Tick 1's finding stands: every cost Wix names is
taken out of revenue before payout (wix-app-payments-faq.txt:130), and no charge to the developer is rendered anywhere.

### New finding: the payout setup need not be done by the owner in person

This partly answers tick 1's open line (Q4 above: "Whether an agent can hold a collaborator role with the Manage Earnings
permission ... NOT ON THIS PAGE"). It is now rendered that a teammate can hold it:
- txt:126 (RENDERED): "You need the Manage Earnings permission to complete this flow. Account owners have this access by default. To give a teammate access, see Grant a teammate access to payouts ."
- txt:142 (RENDERED): "If you want a teammate to set up, view, or manage payouts, create a custom role with the Manage Earnings permission and assign it to them."
- txt:152 (RENDERED): "This permission allows teammates to set up a payout account, view payouts from templates, apps, and revenue share, and manage payout settings."
- txt:160 and txt:170 (RENDERED): "Enter the teammate's email address." ... "The teammate receives an email invitation. Once they accept, they can set up and manage payouts in Earnings > Payouts ."
- txt:164 (RENDERED): "If you grant access to specific sites only, Earnings won't appear for the teammate."

Limits of this finding, stated so it is not over-read:
- The page says a *teammate* invited by email can hold the permission. It does not say whether that teammate can be an
  agent-operated login (for example the brand mailbox). That is UNKNOWN.
- It supersedes the wording of tick 1's changelog blurb ("the account owner must set up a Tipalti account",
  wix-app-payments-faq.html:64) only for *who clicks through Wix*. Whose identity and bank details go into Tipalti is not
  on this page, and is most likely the owner's (UNKNOWN; not inferred).
- Refunds still need an 'Owners' collaborator (wix-app-payments-faq.txt:150, tick 1). This page does not change that.

### Verdict for the board: **NEEDS_MORE**

The payout-account page is a how-to for clicking through Wix (Earnings > Payouts > Join the Partner Program > Tipalti). It
hands everything the gate asks about (country, method, documents, fees) to the Tipalti step, which this page does not
describe. The gate at BOARD-LOOP.md:160 stays half-passed: the floor rolls over (RENDERED, tick 1); Israel payable is UNKNOWN.
The occupancy scan must still not start.

**What would settle the rest, cheapest first:**

1. **Render the Partner Agreement at its docs address**, found in this capture's navigation (html:64,
   `href="/docs/build-apps/launch-your-app/legal-and-security/wix-app-market-partner-agreement"`):
   `https://dev.wix.com/docs/build-apps/launch-your-app/legal-and-security/wix-app-market-partner-agreement`.
   It is the text the FAQ says governs payouts (wix-app-payments-faq.txt:126, 134). Look for: eligible payee territories or
   sanctions exclusions, individual vs company partner, payout method and fees, forfeiture of a sub-$200 balance.
   (Tick 1 proposed `https://dev.wix.com/app-market-partner-agreement`; the docs path above is the one this capture actually links.)
2. **Render the Payouts Dashboard doc**, linked from this capture (txt:176 "About the Payouts Dashboard", html:62):
   `https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/payouts-dashboard`. Look for: payout method,
   currency, transfer fees, and what Tipalti asks for.
3. Still queued from tick 1: `https://dev.wix.com/docs/build-apps/manage-your-app/user-support/about-user-support` (support SLA).

Suggested `urls.txt` lines (for the main thread, which owns that file):

```
https://dev.wix.com/docs/build-apps/launch-your-app/legal-and-security/wix-app-market-partner-agreement	wix-partner-agreement
https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/payouts-dashboard	wix-payouts-dashboard
https://dev.wix.com/docs/build-apps/manage-your-app/user-support/about-user-support	wix-user-support
```

4. **If both render and are still silent on Israel**, the only remaining source is the Tipalti form inside the logged-in flow
   (`https://manage.wix.com/studio/revenues/payouts`, txt:132). That needs a Wix account, which BOARD-LOOP.md:210 holds until
   this ₪0 test passes. The board then chooses between (a) recording Israel as UNKNOWN-unresolvable from public pages and
   killing or parking candidate 11, or (b) asking the owner for one look at the country list in that form, with no data
   entered. This measurement does not choose; it names the fork.

---

## Tick 3 reading (28.9.2026): partner agreement and payouts dashboard

**Queued at** `research/rendered/urls.txt:271-274` (ZERO-TESTS rows 15 and 16, per those comments). Both captures:
`fetchedAt` 2026-09-28T01:55Z, status 200, `truncated` false, `firstFetch` true. Both `.txt` files read in full; the raw
`.html` files were searched for each article's embedded Markdown source (`"content"` field) and link targets.

**The agreement body was NOT captured.** `wix-partner-agreement.txt` is site navigation (lines 1-85) plus a one-paragraph
wrapper article (87-93). The article's Markdown source in the `.html` is that same one paragraph and nothing else. No
clause text is present: 0 hits in the `.txt` for israel, countr, forfeit, terminat, tax, tipalti, paypal, payoneer. [RENDERED]
- wix-partner-agreement.txt:89: "We recommend that you read through our entire Partner Agreement before developing." [RENDERED]
- The "Partner Agreement" link there points to **`https://dev.wix.com/app-market-partner-agreement`**. This is the `href` in the
  `.html` and the `fallback::` target in the Markdown source. The agreement text lives at that address. [RENDERED]
- The article's `source` field names `github.com/wix-private/developer-docs/.../app-market-partner-agreement.md`. That repo is
  probably not public, so it is no route to the text. [INFERENCE]
- wix-partner-agreement.txt:91 "Last updated: 23 August 2024" is the date of the wrapper article. The agreement's own version
  date is not in the capture. [RENDERED]

**The payouts-dashboard capture is a UI how-to.** Lines 1-111 are navigation; the article runs from 113 to 183, and its
Markdown source matches the `.txt`. It contains 0 hits for israel, countr, tipalti, currency, threshold, "200", fee, tax, bank,
paypal, payoneer, forfeit. Its 3 "individual" hits mean "individual transactions", and its 1 "company" hit is "credit card
company". [RENDERED]

### The open questions

"[RENDERED] absent" means the term does not appear in either capture (checked by grep); it is not a claim about Wix.

| Question | This tick's captures | Grade |
|---|---|---|
| Revenue share / Wix's cut | Not in the capture. The dashboard shows "total monthly collections less deductions" (wix-payouts-dashboard.txt:137) but does not itemize the deductions. Tick 1's 80/20 after a 2.5% fee (wix-app-payments-faq.txt:130) stays the only rendered split. | [RENDERED] |
| Payout method | Not in the capture. Tipalti and bank: 0 hits each. | [RENDERED] absent |
| Threshold / rollover | Not in the capture. No "$200" or "threshold". Tick 1's rollover (faq.txt:134) stands. | [RENDERED] absent |
| Schedule | "The data is updated daily and should be considered an estimate until it's finalized on the 9th of every month (for the previous month's transactions)." (wix-payouts-dashboard.txt:141). This is when the dashboard data is finalized. It is not a stated payout date. | [RENDERED] |
| Currency, transfer fees | Not in the capture. | [RENDERED] absent |
| Country eligibility / Israel | Not in the capture. There is no country list (0 "israel", 0 "countr", 0 "sanction" in either capture). | [RENDERED] absent |
| Individual vs company; brand or trade name as payee | Not in the capture. The only "company" is "credit card company" (wix-payouts-dashboard.txt:161). Tick 2's "registering your company" (wix-payout-account.txt:134) is still unexplained. | [RENDERED] absent |
| Forfeiture of unpaid balances | Not in the capture. The agreement body, which would hold it, is absent. | [RENDERED] absent |
| Support / SLA duties | Not in the capture. "User Support" (wix-partner-agreement.txt:79, wix-payouts-dashboard.txt:105) is a navigation heading only. The dashboard lets the developer "Request refunds ." (wix-payouts-dashboard.txt:129) but states no duty to do so. | [RENDERED] |
| Chargebacks | "Note that Wix will automatically attempt to reverse the chargeback." (wix-payouts-dashboard.txt:161) | [RENDERED] |
| Tax forms | Not in the capture. There are 0 "tax" hits in the dashboard `.txt`. The `.html` of the agreement page has 2 "tax" hits, both in unrelated changelog text (a Pricing Plans tax setting and eCommerce cart totals). | [RENDERED] |
| A teammate can set up and manage payouts | "You can access the app Payouts dashboard if you have the Manage Earnings permission. Account owners have this access by default. To grant access to a teammate, see Grant a teammate access to payouts ." (wix-payouts-dashboard.txt:121). This confirms tick 2 (wix-payout-account.txt:142). Whether an agent-run login counts as a teammate is still UNKNOWN. | [RENDERED] |
| Paid-app gate | "Before you can publish a paid app, payout account setup must be complete at the account level. Until this is done, you can't publish paid apps." (wix-payouts-dashboard.txt:131) | [RENDERED] |

Two further points bear on the ₪0 and brand rules:
- The terms bind at submission: "During app submission in your app's dashboard, you'll need to acknowledge your agreement to
  the Partner Agreement." (wix-partner-agreement.txt:89) [RENDERED] So the unread clauses (forfeiture, support, payee
  identity) are accepted before any listing goes live, so they have to be read before submission. [INFERENCE]
- One path needs human contact: "Payments for apps included in Wix Premium plans won't be shown in the payouts dashboard.
  For info on payments for these upgrades you need to contact us ." (wix-payouts-dashboard.txt:143) [RENDERED] Whether a
  new app would fall under this is not in the capture.

**Verdict for candidate 11 (Wix App Market): NEEDS_MORE**

Settled [RENDERED]: a paid app cannot publish until the payout account exists (dashboard:131), and a teammate can hold
Manage Earnings (dashboard:121). Wix attempts chargeback reversal (dashboard:161), and payout data finalizes on the 9th
(dashboard:141). Still UNKNOWN, because the agreement body was not captured: Israel eligibility, forfeiture of a
sub-$200 balance, whether the payee is an individual, company or brand, tax forms, fees, payout currency, and any support
SLA. The single next check is to render **`https://dev.wix.com/app-market-partner-agreement`** and read its Section 9
(named at wix-app-payments-faq.txt:126). Suggested `urls.txt` line for the main thread:
`https://dev.wix.com/app-market-partner-agreement	wix-partner-agreement-body`.
