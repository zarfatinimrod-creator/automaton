# Measurement: Wix App Market (BOARD-LOOP rank 11, ZERO-TESTS row 5)

**Date:** 2026-09-27
**Ordered by:** `research/channel-loop/BOARD-LOOP.md:157-162` (candidate 11) and `research/channel-loop/ZERO-TESTS.md:14`
(row 5: "whether it pays Israel, and whether the $200 floor rolls over or is forfeited").
**Gate being tested (BOARD-LOOP.md:160):** "if it is payable to Israel and the floor rolls over rather than forfeits, run
the two-hour occupancy scan of the Hebrew/Israeli App Market categories and either name one niche or record 'none'".
**Kill list (BOARD-LOOP.md:162):** Israel not payable; the floor forfeits or accrues without moving on any plausible
ceiling; the niche has free incumbents; developer terms impose a support SLA or human conversations; or no niche can be named.

**Status (after tick 8, 28.9.2026): NEEDS_MORE.** The last docs page on the submission path (`wix-submit-first-app-version.txt`, "Last updated: 28 July 2026", newer than the June 30, 2026 agreement) asks for no third-party security test and no evidence of one. Its only prerequisite is clearing the dashboard's blockers, then an automated AI review decides (`:98`, `:122-125`). It states no fee, no call, no demo video, no ID step and nothing on payout country. The Wix review checklist it links (on GitHub) has no such item either. The docs are exhausted on agreement:185, so the step-8 written question already drafted in `research/owner-asks/brand-mailbox-questions.md` §2 takes over. Israel-as-payee is still UNKNOWN. See "Tick 8 reading" at the end. Earlier: **Status (after tick 7, 28.9.2026): NEEDS_MORE.** The submission step's security evidence is a self-answered Security & Privacy form in the app dashboard, with a box confirming the answers are accurate (`wix-security-privacy-info.txt:95-106`). It asks for no upload and names no third party, tester, tool or price, so ZERO-TESTS row 65 does not fail. It does not pass either: the page shows one question of "a few", so whether the form asks about agreement:185's third-party test is UNKNOWN, and a 2024 docs page does not waive the 2026 agreement. Israel-as-payee is still UNKNOWN. See "Tick 7 reading" at the end.

Earlier: **Status (after tick 6, 28.9.2026): NEEDS_MORE.** The App Market guidelines add no kill: support means a monitored email with no response clock, there is no AI rule, and the company-info fields have no personal-name slot. But Wix's own review (AI plus a review team) asks for a demo account and notes, not a security report, and it cannot be the pre-submission third-party test that the agreement requires (`wix-partner-agreement-body.txt:185`), which prevails over the guidelines (`wix-app-market-guidelines.txt:106`). Tipalti's US-ROW coverage page returned 403, so Israel-as-payee is still open. See "Tick 6 reading" at the end.

Earlier: **Status (after tick 5, 28.9.2026): NEEDS_MORE.** The security best-practice page is advice only. It names no third-party tester, tool or evidence for the pre-submission security test (`wix-partner-agreement-body.txt:185`) or for the documented multi-developer review (`:181`), so the ₪0 question moves on to the App Market guidelines (ZERO-TESTS row 57). Tipalti's payees FAQ returned 403, so Israel-as-payee is still open too. See "Tick 5 reading" at the end.

Earlier: **Status (after tick 4, 28.9.2026): NEEDS_MORE.** The agreement body confirms that the $200 floor rolls over and is forfeited only for breach, and it does not exclude Israel, but it names no payee countries and adds an unpriced pre-submission third-party security test (`wix-partner-agreement-body.txt:185`), so the ₪0 check comes next. See "Tick 4 reading" at the end.

Earlier: **Status (after tick 3, 28.9.2026): NEEDS_MORE, unchanged.** Tick 3 found the partner-agreement capture was only the docs wrapper; the body is at https://dev.wix.com/app-market-partner-agreement (ZERO-TESTS row 18). Tick 2's text follows. The floor half of the gate passes (rolls over, tick 1). The
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

---

## Tick 4 reading (28.9.2026): the partner agreement body

**Read:** `research/rendered/wix-partner-agreement-body.txt`, all 676 lines. The agreement runs from line 1 to 613, and lines 615-676 are the site footer. Meta: `url` = `https://dev.wix.com/app-market-partner-agreement`, `fetchedAt` = 2026-09-28T07:15:19Z, status 200, `truncated` false, `sha256` = `f3da3f30874298d61ca9289f8890e935434e039e1be88d2939429d6f7fb75587`. Its own version line is `:7` "Version effective as of June 30, 2026". The "#ItsThatEasy" summaries are not binding (`:21` "in no way defines or explains any section or provision hereof, or legally binds any of us"), so only clause text is quoted below. Citations are `wix-partner-agreement-body.txt:<line>`, shortened to `:<line>`. [RENDERED]

**Revenue share (Section 9.3)**
- `:347` "Partner will be entitled to eighty percent (80%) of the Net App Revenues and Wix will be entitled to twenty percent (20%)". [RENDERED]
- `:353` "during the first twelve (12) months of the launch of the App at the App Market ... Partner will be entitled to one hundred percent (100%)". [RENDERED] The clock runs from each app's launch. The FAQ puts it per developer instead ("your first year on our platform", wix-app-payments-faq.txt:130), and where the two differ the agreement governs. [INFERENCE]
- `:355` Net App Revenues are "the aggregate amounts actually paid by Users ... less the Transaction Fee", which is "two and one-half percent (2.5%) of each payment". Unlike the FAQ, the definition says nothing about sales tax. Wix may waive the fee (`:357`). [RENDERED]
- `:429` "Wix shall have the right to cancel or modify the Partner compensation program and/or the revenue sharing method ... upon a ninety (90) day prior notice." [RENDERED]

**Payment: timing, threshold, method, currency, fees, forfeiture**
- `:371` "payable to the other Party within thirty (30) days following the end of each month, by the Party that collected the relevant Net App Revenues." [RENDERED]
- `:375` "Wix will not pay to a Partner hereunder an amount lower than two hundred US Dollars ... such balance shall be carried over and added to the next month's Revenue Share amount until the total amount payable to such Partner reaches the Minimal Payment Amount." The binding text says the balance rolls over. [RENDERED]
- `:385` "payable in U.S. Dollars only. Payment shall be made through wire transfer or any other method chosen by Wix, at its sole discretion. All payments hereunder shall be made against a lawful tax invoice to be issued by the Party receiving the respective payment." [RENDERED]
- Transfer or payout-provider fees are not in the agreement: "tipalti", "paypal" and "payoneer" each get 0 hits. The only deductions it names are the 2.5% fee (`:355`) and the exchange-rate set-off on apps priced outside USD (`:391`). [RENDERED]
- A dormancy or expiry forfeiture is not in the agreement: "dormant" and "inactiv" each get 0 hits. Unpaid money is lost only through breach. `:537` "Wix shall be entitled ... to forfeit any unpaid Partner Revenue Share amounts, which accrued prior to such termination". `:43` says an account not in good standing lets Wix "retain associated account fees payable to you". `:253` leaves out of the pay-out promise any removal "due to breach of this Agreement or as a result of an infringement allegation". [RENDERED]
- One gap: on a termination without cause Wix pays the revenue share "that is payable to Partner on the date of such termination" (`:527`). The agreement does not say whether a balance under $200 counts as "payable" under `:375`, so such a balance may be lost at exit. [INFERENCE]

**Countries, sanctions, Israel**
- `:277` The Partner warrants it is not "located, organized or resident in a country or territory that is the subject of comprehensive territorial Sanctions". `:279` lists the comprehensively sanctioned countries (in the clause on user access) as "Crimea - region of Ukraine, Cuba, Iran, North Korea, and Syria". Israel is not on that list. Israel appears only as a source of sanctions: "Israeli sanctions" (`:277`) and "Israeli regulations" (`:279`). [RENDERED]
- `:563` "governed by the laws of the State of Israel ... instituted in the courts of Tel Aviv, Israel." [RENDERED]
- `:593` An addendum applies "if you are offering your App(s) to residents of the state of Israel". `:599` "Wix will act as a reseller of the App to Israeli Users." [RENDERED] The Hebrew/Israeli category scan targets exactly those users, so a candidate-11 app would fall under the addendum. [INFERENCE]
- A list of payee countries, or any statement that a partner resident in Israel gets paid, is not in the agreement. [RENDERED absent] Nothing in the agreement excludes a partner resident in Israel, but whether such a partner is actually payable is still not rendered. [INFERENCE]

**Individual or company; trade name; who operates the account**
- `:13` "a developer (whether entity or person)". An individual may be the Partner. `:447` sets a minimum age of 18. [RENDERED]
- The agreement neither allows nor bans a trade name. It refers to "the Partner's and the App's name and trademarks" (`:75`) and bars Wix marks in "Partner's business name, logo, branding" (`:87`). [RENDERED] So a partner brand is expected, but the agreement does not address a payee name that differs from the legal name, and it does not explain tick 2's "registering your company" (wix-payout-account.txt:134). [INFERENCE]
- `:43` "Your account is only for your own use, and you are responsible for all activities through your account." [RENDERED] The agreement does not say whether an agent operating the owner's account counts as "own use".

**Tax**
- `:391` "Partner shall be responsible for the payment of any and all taxes ... The payments made by Wix to Partner shall be subject to any applicable withholding tax obligations (if any)." [RENDERED] Tax forms (W-8, W-9 or any other) are not in the agreement.
- The "lawful tax invoice" required against each payment (`:385`) is recurring paperwork. What it means for the owner's Israeli tax status is a question for `research/measurements/step2-cost.md`, not this file. [INFERENCE]

**Support duties (what the text literally requires)**
- The agreement sets no response time for user support, no SLA and no duty to talk to users. A grep finds 0 "response time" and 0 "business day", and the two "sla" hits at `:133` are inside "Legislation". [RENDERED]
- `:301` The Partner has "the sole responsibility for ... the development, proper operation and maintenance of the App and the provision of services to Users." [RENDERED]
- `:259` Withdrawing an app takes 90 days' notice, during which the Partner must "maintain the App and provide all support services to the Users". After termination the Partner keeps serving existing users "until the end of their applicable subscription period" (`:527`). "Support services" is never defined. [RENDERED]
- Two 24-hour clocks run toward Wix, not toward users. `:309` "Partner must respond to the claim within 24 hours" covers third-party claims that Wix refers. `:195` requires notice to Wix "within no later than 24 hours" of a data-security compromise. [RENDERED]
- For Israeli users, `:611` says "Wix may offer support services to Israeli Users. Partner undertakes to assist Wix", and `:613` says the Partner will "provide timely and adequate responses and information to Wix". No clock is set. [RENDERED]
- Nothing in the text requires the owner, or any human, to talk to users, so an agent-run brand inbox can meet it. The 24-hour claim clock (`:309`) does mean someone must watch that inbox every day, and a claim response is legal work, not routine support. [INFERENCE]

**Termination, clawbacks, liability, indemnity**
- `:523` Wix may terminate "at any time, with or without cause" on 30 days' notice, while the Partner needs 90. `:253` Wix may remove any app "at any time ... with no obligation to provide any explanation or prior notice". `:557` Wix "may modify any of the terms and conditions of this Agreement at any time". [RENDERED]
- Clawback, `:335`: after a user refund the Partner must "return such Revenue Share amount to Wix within no later than thirty (30) days", or Wix deducts it from later payouts. [RENDERED]
- `:509` caps Wix's aggregate liability at "USD 50,000". `:515` says the "Partner will defend, indemnify and hold harmless Wix" against third-party claims, including those about "use of or inability to use of the App". The agreement puts no cap on the Partner's indemnity. [RENDERED] For Israeli users, `:607` says "Partner undertakes to fully support and indemnify Wix". [RENDERED]

**AI or automation**
- Neither is in the agreement. Its only two "AI" hits (`:617`, `:623`) are in the site footer. [RENDERED]

**Up-front cost (₪0 rule)**
- The agreement charges no listing, registration or account fee. Every "fee" hit is the 2.5% fee, taxes, usage fees, legal fees or user subscription fees. [RENDERED] Three clauses could still cost money before any income arrives, and none of them names a price:
- `:185` "(v) An App shall be reviewed and tested by a third party for any security vulnerabilities before submitting the App to the App Market;" [RENDERED] Third-party security testing is usually a paid service. [INFERENCE]
- `:181` "(iii) Partner's code shall be reviewed by more than one developer, and the code review process shall be documented;" [RENDERED] The agreement does not say whether an agent counts as a developer.
- `:165` Data from Wix may be handled only on "Google Cloud Platform; IBM Cloud Services; AWS - Amazon Web Services; Microsoft Cloud Services; Salesforce.com or Oracle Cloud Platform", and on any other provider "only after obtaining Wix's express, prior written consent". [RENDERED] Any other host therefore needs a written exchange with Wix first. [INFERENCE]
- Two duties recur rather than cost money up front. `:399` requires a monthly report to Wix "within no later than fifteen (15) days from the end of each calendar month", and the text does not limit this to apps the Partner bills itself. [RENDERED] `:409` requires a certified accountant's confirmation, on request, only in years a Partner "was obligated to pay any amounts to Wix". Under `:371` a Wix-billed app does not trigger it. [INFERENCE]

**Verdict for candidate 11 (Wix App Market): NEEDS_MORE**

The floor half of the gate now passes on the binding text: a balance under $200 carries over (`:375`) and is lost only for breach (`:537`, `:43`). The Israel half has narrowed but is still open: the agreement excludes only comprehensively sanctioned territories (`:277`, `:279`, which do not include Israel) and pays USD by wire (`:385`), but it names no payee countries. For that half, tick 2's Tipalti-form fork still applies. Nothing in the text triggers the support kill criterion, since there is no user-support SLA and no AI clause, but the agreement raises two ₪0 risks the board has not priced: a third-party security test before submission (`:185`) and the six-cloud hosting rule (`:165`).

**Single next check:** render `https://dev.wix.com/docs/build-apps/launch-your-app/legal-and-security/security-and-privacy-best-practice` (linked in the docs navigation of the tick 1-3 captures). Read what evidence Wix accepts for `:185` and `:181`, and whether a free route satisfies them. Suggested `urls.txt` line for the main thread: `https://dev.wix.com/docs/build-apps/launch-your-app/legal-and-security/security-and-privacy-best-practice	wix-security-best-practice`.

## Tick 5 (28.9.2026): Tipalti's payees FAQ refused

The page the breadth board named to settle Israel-as-payee and any camera step at Tipalti (ZERO-TESTS row 33,
https://help.tipalti.com/hc/en-us/articles/30607242003223-Payees-FAQs) answered HTTP 403 to the runner (fetchedAt 2026-09-28T13:17:48.345Z).
So the payout-form Israel question is still gated on a Tipalti reading that no free render has produced. Options recorded in
`research/measurements/spreadshirt.md` (same Zendesk refusal): a GitHub mirror, or a written question once the brand mailbox
(owner step 8) exists.

## Tick 5 reading (28.9.2026): the security best-practice page

**Read:** `research/rendered/wix-security-best-practice.txt`, all 202 lines. Lines 1-95 are the docs navigation and the in-page contents list, the article runs from `:96` to `:200`, and `:201-202` are the feedback widget. Meta: `url` = `https://dev.wix.com/docs/build-apps/launch-your-app/legal-and-security/security-and-privacy-best-practice`, `fetchedAt` = 2026-09-28T13:17:39Z, status 200, `truncated` false, `sha256` = `b68e0a36b6044233b4b08e3cf04132fef64cc5d78120ac010c92b37c71a141d8`. The article's markdown source, which is embedded in the `.html`, has the same sections as the text and only four links (two to the GDPR page, one to Let's Encrypt, one to a Wikipedia article on brute-force attacks), so the text extraction dropped nothing. Citations are `wix-security-best-practice.txt:<line>`, shortened to `:<line>`. The agreement is cited as `agreement:<line>` (`wix-partner-agreement-body.txt`). [RENDERED]

**What kind of page it is**
- `:98` "It's really important that you make sure that your app is secure and protects the user's privacy. In this article we will go over some basic best practices." [RENDERED] The page gives advice. It sets no submission requirement and asks for no artefact.
- `:200` "Last updated: 3 June 2024", while the agreement in force is the "Version effective as of June 30, 2026" (agreement:7). The page never mentions the agreement. [RENDERED] The page is two years older than that version, so it cannot be read as the guide to how its clauses are met. [INFERENCE]
- The "Legal and Security" group in the docs navigation (`:61-71`) lists five pages: GDPR Compliance, Wix Terms of Use Policy, the Partner Agreement, this page, and About Consent Apps. None of them is a security-review or submission-evidence page. [RENDERED]

**Security testing before submission (agreement:185)**
- In the 202 lines, "third" appears once, in "third-party content like statistics and CDNs" (`:132`), which is about HTTPS. "review", "scan", "penetration", "vulnerab", "audit", "questionnaire", "submit", "submission" and "evidence" appear 0 times each. [RENDERED]
- The page's only sentence about testing is a tip to test the app yourself: `:160` "Ready to test your app? Make sure to check your app as a site owner and as a contributor." [RENDERED]
- The page therefore names no third party, no tool or service, no self-assessment or questionnaire, and no place to send a report. It does not say what satisfies agreement:185, or whether Wix's own app review counts toward it. [RENDERED absent]
- The page establishes no free route. By the clause's own wording, a scanner the partner runs is a tool, not "a third party", so a free scanner on its own probably does not meet agreement:185 unless Wix says it does. [INFERENCE]

**Multi-developer review (agreement:181) and the rest of 6.3.5**
- "developer" and "review" appear 0 times each. The page does not mention code review, how to document one, or whether an agent counts as a developer. [RENDERED absent]
- Rereading agreement 6.3.5 around these clauses shows three more duties: "Secure Coding Guidelines" (agreement:177), testing "against the sans.org top 25 software errors" (agreement:183), and "a security assessment for an App on a regular basis" (agreement:189). The page mentions none of them. [RENDERED] The regular security assessment is a recurring duty, not a one-time gate, and it has no stated price. [INFERENCE]

**Hosting and data handling (agreement:165)**
- The page names none of the six clouds. "Google Cloud", "AWS", "Microsoft", "Azure", "IBM", "Oracle", "Salesforce", "cloud" and "host" appear 0 times each. It does not repeat the six-cloud rule or the route to written consent for another host. [RENDERED absent]
- Its data rules are general. `:140` "Encrypt all sensitive data, and don't store sensitive data in cookies." Payment settings are shown to "site owners only – and hide it from contributors" (`:144`), which the app checks by comparing `uid` with `siteOwnerId` (`:152`). `:184` "Passwords must be hashed with a secure hashing function such as SHA-256 or bcrypt. Storing raw passwords is a violation of the GDPR." [RENDERED]
- It also asks for these build items, all of them code: verify the Wix-signed instance on the server (`:102-110`), check that `permission` is 'OWNER' (`:112`), re-validate the instance on every save and ask for a refresh when the signature is more than a day old (`:116-120`), serve every endpoint over HTTPS (`:124`), and guard every input field against XSS (`:136`). [RENDERED] None of these needs a paid service. [INFERENCE]

**Anything that costs money or needs the owner**
- The only service the page names is free: `:128` "Check out Let's Encrypt, a free and easy to use SSL certificate authority." [RENDERED]
- Its only clock toward users comes from GDPR requests. For edits or deletions, `:176` says "comply without undue delay. We suggest completing this request within a week (but no more than 30 days)". For access requests, `:178` says to send the data "within 30 days". `:166` allows handling these requests "automatically", and `:170` says to ask for "details as proof of identity" first. [RENDERED] These are suggestions attached to a legal duty, not a Wix support SLA, and an agent-run brand inbox can meet them, so they do not trigger the support kill criterion. [INFERENCE]
- The page implies no per-app owner action and no paid service. The possible per-app cost is in the agreement: agreement:185 applies to "An App", so if the test is paid, the cost recurs for every app submitted. [INFERENCE]

**Verdict for candidate 11 (Wix App Market): NEEDS_MORE**

The security page is advice only. It names no third-party tester, tool, questionnaire or artefact, says nothing about the multi-developer review, and does not repeat the six-cloud rule. The ₪0 question for agreement:185 and agreement:181 is therefore still open: this page neither settles it nor makes it worse. The Israel-as-payee half is also still open after Tipalti's 403 (Tick 5 above).

**Single next check:** read Batch B row 57, the App Market guidelines (`https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-market-guidelines`). Of the queued pages, it is the likeliest to describe the review at submission and to say whether that review asks for a security report. If it is also silent, the fallback is a written question to Wix from the brand mailbox (owner step 8): what evidence satisfies agreement:185?

## Tick 6 reading (28.9.2026): App Market guidelines and company info

**Read:** `research/rendered/wix-app-market-guidelines.txt` (360 lines, with navigation at `:1-98` and the article at `:100-358`) and `research/rendered/wix-add-company-info.txt` (127 lines, with the article at `:93-125`), both in full. Meta: fetchedAt 2026-09-28T16:11:57Z and 16:11:58Z, status 200, `truncated` false, `firstFetch` true, sha256 `f9e7e888…` and `10222f0d…` (render commit 5d597e4). Each `.html` embeds the article's Markdown source, which matches the `.txt`. The guidelines source has 13 links, and none of them goes to a security-report form. Citations are shortened to `guidelines:<line>`, `company:<line>` and `agreement:<line>` (`wix-partner-agreement-body.txt`). `guidelines:358` says "Last updated: 11 May 2026", which is older than the agreement version in force (agreement:7, June 30, 2026). [RENDERED]

**Tipalti refused again (ZERO-TESTS row 56).** `tipalti-payment-methods-us-row.meta.json` records status 403, byteLength 0 and fetchedAt 2026-09-28T16:11:56Z. This is the second Tipalti Zendesk 403 after tick 5's payees FAQ, so Israel-as-payee is still UNKNOWN. [RENDERED]

**(1) The review at submission**
- `guidelines:122` "Wix will review your app both before it is added to the App Market, and as we deem relevant once your app is live. When you submit your app for review, provide an active demo account, login information and any resources that may be needed. Keep this demo account active as long as your app is in the Wix App Market." [RENDERED]
- Wix does the review itself. `guidelines:338` mentions "Our review team", and a changelog blurb embedded in the page (`wix-app-market-guidelines.html:193`, dated 2026-07-27) says "Wix now runs an automated AI review that checks your app against the App Market requirements." [RENDERED]
- The review asks for three things: the demo account (`:122`), "detailed explanations in the App Review notes, as well as supporting documentation where needed" (`:124`), and fixes made "always within the allocated time-frame" (`:126`). [RENDERED]
- The Security section (`:256-284`) sets build rules and asks for no proof. `:262` "As per OWASP, your security must include stored salted password hashes, not actual passwords." `:264` "Protect your app against cross-site request forgery attacks (CSRF), cross-site scripting attacks (XSS) and other security vulnerabilities." `:266` HTTPS. `:284` PCI-DSS and PA-DSS for apps that "collect financial data for payments". [RENDERED]
- The page never asks for a report, a pentest or a questionnaire. "report", "penetration", "questionnaire", "evidence", "sans", "audit", "attest", "certif" and "scan" each get 0 hits. All 10 "third party" hits (`:156-350`) are about rights, ads, SDKs, content or logos. [RENDERED absent]
- Wix's review does not satisfy agreement:185 as that clause is worded. The clause requires review "by a third party ... before submitting the App". Wix is a party to the agreement, not a third party, and its review runs at submission, not before it. [INFERENCE]
- Silence here does not waive the clause: `guidelines:106` "In the case of an inconsistency between these guidelines and Wix's Terms, Wix's Terms shall prevail." Agreement :181, :183, :185 and :189 still bind at submission (tick 3). The review probably will not check for a test report, but a breach found later lets Wix forfeit unpaid revenue (agreement:537). [INFERENCE]

**(2) Support obligations**
- `:146` "You should support all users – both paying and free – for the lifetime of your app." [RENDERED]
- `:148` "Include an active customer support email address (a current email address that is regularly maintained and monitored), so that users can easily get support when they need it." [RENDERED]
- `:150` asks for Wix-specific documentation. `:152` says replies to user comments must not "include personal information, spam, or marketing". [RENDERED]
- No response clock is set: "hours" and "business day" get 0 hits. The four "within" hits are the review time-frame (`:126`) and layout wording. No phone, chat or human contact is required. [RENDERED]
- An agent-run brand mailbox checked every day meets `:148`, and `:152` is compatible with the brand-only rule. The support kill criterion is not triggered. [INFERENCE]

**(3) AI or automation rules**
- There are none. "AI" appears once, as the navigation item `:43` "Build with AI". "automat", "artificial" and "LLM" get 0 hits, and the only "bot" is "botnet" (`:288`). [RENDERED]
- The rules nearest to agents are the ban on "cheating the review process ... manipulating ratings" (`:158`) and the ban on fake reviews (`:138`). Nothing on this page bars an app that an agent builds and supports. [RENDERED / INFERENCE]

**(4) What the listing publishes about the company**
- `company:95` "Your app's listing in the Wix App Market includes basic info about your company." [RENDERED]
- The fields (`company:103-113`) are a logo, "Company name: Max 23 characters, including spaces.", "Company description: Max 1,200 characters, including spaces.", "Company address", "Company website" and "Privacy policy link". [RENDERED]
- The page does not say which fields are public or required: "public", "display", "required", "optional", "email", "legal" and "individual" each get 0 hits in the article. It has no legal-name, personal-name or contact-email field. [RENDERED absent]
- Brand-only rule: nothing rendered puts an individual's legal name on the listing, and the brand fits the 23-character name field. [INFERENCE]
- Risk (a): if "Company address" is shown and the business has no address of its own, the listing would publish a home address. A PO box or virtual address would avoid that, and its price is not known. [INFERENCE]
- Risk (b): `guidelines:308` "Don't imply that you're an individual, public figure or company/organization unless you have the (legal) right to do so. {You'll need to provide authorization on request (e.g., a contract or legal agreement).}" A brand presented as a company may have to prove its right to the name, but only to Wix and only on request. [RENDERED / INFERENCE]
- Tick 2's "registering your company" (wix-payout-account.txt:134) is still unexplained.

**(5) Money up front**
- Nothing on the page has a price. "fee" gets 0 hits, and "cost" (`:172`) and "premium" (`:184`) refer to what the user pays. [RENDERED]
- `:168` "All apps that collect money for any purpose (including donations) must implement the Wix Billing System". Using it means the app never collects card data, which keeps it clear of PCI-DSS (`:284`). [RENDERED / INFERENCE]
- The one likely up-front cost is still agreement:185's unpriced third-party test. [INFERENCE]

**Verdict for candidate 11 (Wix App Market): NEEDS_MORE**

The guidelines add no kill criterion. Support is a monitored email with no clock (`:148`), there is no AI rule, and none of the company fields asks for a personal name. They also leave the ₪0 question open. Wix's review (automated AI plus a review team) asks for a demo account and notes, not a security report, and it cannot itself be the third party that agreement:185 requires "before submitting", a clause that prevails over the guidelines (`:106`). Israel-as-payee is still UNKNOWN after a second Tipalti 403.

**Single next check:** render `https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/add-security-and-privacy-information` (docs navigation, `guidelines:67`, the distribution step just before "Submit Your First App Version"). Read whether it asks the partner to attest to or upload agreement:185's test, and what evidence it accepts. If it is silent too, send the fallback written question from the brand mailbox. Suggested `urls.txt` line: `https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/add-security-and-privacy-information	wix-security-privacy-info`.

## Tick 7 reading (28.9.2026): the Security & Privacy form at submission

**Read:** `research/rendered/wix-security-privacy-info.txt`, all 118 lines: navigation `:1-91`, article `:93-116`, feedback widget `:117-118`. Meta: `url` = `https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/add-security-and-privacy-information`, fetchedAt 2026-09-28T17:19:19.832Z, status 200, `truncated` false, `firstFetch` true, sha256 `92c84138…`. The `.html` (24 lines, 604,613 bytes) embeds the article's Markdown source at `wix-security-privacy-info.html:24`. It matches the text, and its only links are the two "See also" items (about-market-listings, gdpr-and-data-protection). That source's `createdDate` and `updatedDate` are both 2024-08-23 (html:24), which matches `:116` "Last updated: 23 August 2024". The page is therefore about two years older than the agreement version in force (agreement:7, June 30, 2026), and it never mentions the agreement. The source file sits in a private repository (`wix-private/developer-docs`, html:24) that cannot be read. Citations: `privacy:<line>` = the `.txt`, `agreement:<line>` = `wix-partner-agreement-body.txt`, `guidelines:<line>` = `wix-app-market-guidelines.txt`. [RENDERED]

**(1) What the submission step asks for**
- `privacy:95` "Wix takes the security and privacy of user data seriously. Each time you submit an app for review, we ask you to answer a few questions on how you store, process, and secure user data you collect." [RENDERED]
- `privacy:97` "You must complete the Security & Privacy form before submitting a new app, each time changes are made and you resubmit the app, or in cases where the app was published without the completion of this form." [RENDERED]
- The steps (`privacy:101-108`) are "Go to the Security & Privacy page in your app's dashboard." (`:101`); "Answer all questions in the form." with one example, "Is access to Wix user data through your networks, operating systems and databases / configured to prevent unauthorised access and changes?" (`:103-104`); "Check the box at the bottom confirming that your answers are accurate." (`:106`); and "Click Save ." (`:108`). [RENDERED]
- So the evidence the submission step asks for is the partner's own answers plus an accuracy checkbox. That is a self-attestation, not an upload, a report or a named third party. [RENDERED / INFERENCE]

**(2) Does the step ask about agreement:185's third-party test?**
- Not on this page. In the text, "third", "upload", "report", "attach", "evidence", "penetration", "scan", "tool", "audit" and "certif" each get 0 hits, and the one "test" is the navigation item "Test Your App" (`:75`). The whole `.html`, including the embedded i18n and changelog data, has 0 hits for "penetration", "pentest", "vulnerab", "questionnaire", "attest", "audit" and "OWASP". Its two "third-party" hits are one changelog item about third-party cookies. [RENDERED absent]
- The page shows one question out of "a few" (`:95`). Whether another question asks whether the app was tested by a third party is **UNKNOWN**. The full form lives in the app dashboard (`:101`), behind a Wix developer account. [UNKNOWN]
- The example question is about access control on Wix user data. That is agreement 6.3.5's territory (data security), but it is not about testing. [INFERENCE]

**(3) The gate that publishes**
- A changelog item embedded in this capture (html:24, `dateAdded` 1785110400000 = 2026-07-27) reads: "When you submit your app and publish it, Wix now runs an automated AI review that checks your app against the App Market requirements. Results are typically available within minutes. If it doesn't pass, blockers appear in your app's dashboard describing what to fix. If your app passes, it's published to the Wix App Market." Its `articleLink` is `https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/submit-your-first-app-version`. [RENDERED]
- The gate that decides publication is automated and quick, and nothing rendered says it inspects an outside security report. That does not waive agreement:185. `guidelines:106` makes Wix's Terms prevail over guidelines, and a breach found after launch still lets Wix forfeit unpaid revenue (agreement:537, tick 6). [INFERENCE]

**(4) The honesty edge of the checkbox**
- `:106` makes every answer a statement the partner confirms as accurate. If the form asks about a third-party test, an honest brand answers "no" until one has been done, because `MISSION.md:378` allows honest value only. What Wix does with a "no" (a blocker, a note, or nothing) is UNKNOWN. A false "yes" is ruled out whatever the review checks. [INFERENCE]
- The form recurs: it is filled in for every new app and every resubmission (`:97`). It is written paperwork an agent can do once the account exists. The page names no owner action, no camera step and no payment. [RENDERED / INFERENCE]
- Only the dashboard shows the full question list, and `MISSION.md:380-381` bars us from opening an account in the owner's name. So that read waits for the account the owner opens. It cannot be rendered. [INFERENCE]

**(5) Money up front (row 65's FAILS_TEST condition)**
- "fee", "cost", "price" and "paid" each get 0 hits in the text, and the page names no tester, tool or service of any kind. The FAILS_TEST condition ("names a paid tester or tool as required") is not triggered. [RENDERED absent]

**Verdict for candidate 11 (Wix App Market): NEEDS_MORE**

The submission step's security evidence is a self-answered Security & Privacy form with an accuracy checkbox (`privacy:95-106`). It asks for no upload, names no third party, tester or tool, and states no price, so row 65 does not fail. It does not pass either. The page shows one question of "a few", so whether the form asks about agreement:185's third-party test is UNKNOWN. The docs are dated 23.8.2024 and do not waive a clause of the June 2026 agreement, which prevails (`guidelines:106`). The accuracy checkbox also means any question about testing must be answered truthfully. Israel-as-payee is unchanged: UNKNOWN after two Tipalti 403s.

**Single next check:** render `https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/submit-your-first-app-version`. It is the `articleLink` of the AI-review changelog item at `wix-security-privacy-info.html:24`, and the navigation step after this one (`privacy:69`; relative link at html:16). Suggested `urls.txt` line: `https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/submit-your-first-app-version	wix-submit-first-app-version`. Read it for what the submission and the AI review check, whether a security report or third-party test can be a blocker, and whether anything is uploaded. It is the last docs page on the submission path. If it is silent too, the docs are exhausted for agreement:185, and the question goes to Wix in writing from the step-8 mailbox, in the same message as the Israel-as-payee question.

## Tick 8 reading (28.9.2026): the submission page, and the review checklist it links

**Read:** `research/rendered/wix-submit-first-app-version.txt`, all 154 lines: navigation `:1-90`, in-page contents `:91-94`, article `:96-152`, feedback widget `:153-154`. Meta: `url` = `https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/submit-your-first-app-version`, fetchedAt 2026-09-28T18:36:15.371Z, status 200, 619,700 bytes, `truncated` false, `firstFetch` true, sha256 `3b1bc563…`. The `.html` (54 lines) embeds the article's Markdown source at `wix-submit-first-app-version.html:55` (source file in `wix-private/developer-docs` at commit `5d62846c`, html:55), which matches the text. Its only links go to test-your-app, pricing and billing, payout account setup, the guidelines, the listing, the "App Market review skill" on GitHub and contact-us. None goes to a security-report or evidence page. `:152` "Last updated: 28 July 2026". This is the first page on this path that is **newer** than the agreement version in force (agreement:7, June 30, 2026). Citations: `submit:<line>` = the `.txt`, `agreement:<line>` = `wix-partner-agreement-body.txt`, `privacy:<line>` = `wix-security-privacy-info.txt`, `guidelines:<line>` = `wix-app-market-guidelines.txt`. [RENDERED]

**(1) What submission asks for**
- `submit:98` "When you're ready to list your app in the Wix App Market, you submit it for an automated AI review." `submit:100` "The review checks your app against the App Market requirements. If your app doesn't pass, you'll see blockers to fix before it can go live." [RENDERED]
- `submit:122` "Fix all blockers shown in your app's dashboard. Blockers are the only prerequisite for submission, so resolve them before moving forward." `submit:124` "Click Submit & Publish ." `submit:125` "The AI review runs automatically when you submit and publish." `submit:129` "If your app passed, it's now live on the Wix App Market." [RENDERED]
- The "Before you submit" list is advice ("we recommend that you:", `submit:104`): test the app (`:106`), handle errors (`:108`), set up billing and payout for paid apps (`:110`), follow the guidelines (`:112`), complete the listing (`:114`), and "Use the App Market review skill to audit your app against technical review requirements before submitting." (`:116`). [RENDERED]
- The submission step is therefore: clear the dashboard blockers, press one button, and an automated AI review decides. The page does not mention the Security & Privacy form (tick 7). Its only "Security" hits are the navigation items `:61` and `:67`. Since `privacy:97` says the form "must" be completed "before submitting", it presumably surfaces as a dashboard blocker. [RENDERED / INFERENCE]

**(2) The third-party security test (agreement:185): not asked for, and no evidence of it is asked for**
- In the text, "third", "report", "upload", "attach", "evidence", "penetration", "scan", "attest" and "questionnaire" get 0 hits each. "audit" appears once, in the review-skill line (`:116`). [RENDERED absent]
- In the whole `.html`, "evidence", "penetration", "pentest", "attest" and "questionnaire" get 0 hits each. Its two "third" hits are one changelog item about third-party cookies, and its "scan" hits are the Accessibility Scans API changelog item (html:55). [RENDERED absent]

**(3) The review checklist the page links, read from GitHub**
- **Grade.** [GITHUB] means quoted from the file on GitHub with the line checked by `grep -n` on the downloaded copy (the precedent is `wavedash.md:95` and this repo's `spreadshirt.md:59`). The file is `wix/skills` `skills/wix-app/references/APP_MARKET_REVIEW.md` on `main`, the link at `submit:116` (html:12, html:55). It was fetched 28.9.2026 18:40 UTC from `raw.githubusercontent.com` (200), 311 lines, 21,311 bytes, sha256 `5696fee5397d19150d3e9a81b6993cedfc934c15855bf15f617db90dd732173e`. It is pinned by that hash, not by a commit: the GitHub API answered 403 for this repo in this session, and git was not used. It is not stored under `research/rendered/`. Cites are `review:<line>`.
- `review:3` "Use this reference when preparing a Wix CLI app for App Market submission," and `review:65` "Work through this before submission. Only applicable unchecked items are" (continuing "potential decline reasons.", `:66`). [GITHUB]
- Scope limit, in its own words: `review:9` "This page covers code-facing and repository-verifiable requirements. App" and `review:10` "Dashboard, pricing-page setup, company profile, and listing-copy checks require" (continuing "separate dashboard or listing verification", `:11`). [GITHUB]
- Its "Technical Review Taxonomy" (`review:228-311`, "Use these IDs for traceability when mapping findings to review feedback.", `:230`) lists 78 numbered requirements, #25 to #170 with gaps. The 16 in the Security area are all code rules: salted hashes, CSRF/XSS, HTTPS, signed-instance and `signDate` checks, secret keys, PCI-DSS for apps that collect financial data (`:269`), and password resets (e.g. `:262` "| 64 | Protect against CSRF, XSS, and other security vulnerabilities. | Security |"). [GITHUB]
- "third", "penetration", "pentest", "scan", "code review", "reviewed by", "developer", "attest" and "questionnaire" get 0 hits each. The 5 "report" hits are the skill's own "report-only pass" (`:21`) and Partner-Billed revenue reporting (`:71`, `:164-165`, `:174`). The 4 "fee" hits are all "feedback". [GITHUB]
- Reading: Wix's own taxonomy of review findings has no item for a third-party security test (agreement:185) or a documented multi-developer code review (agreement:181). So the AI review is unlikely to raise either as a blocker. [INFERENCE] Two limits: the numbering has gaps (for example #82-91 and #134-150), and `review:9-11` leaves dashboard checks out of scope, which is where the Security & Privacy form lives (`privacy:101`). Whether a dashboard question asks about third-party testing therefore stays **UNKNOWN**. [INFERENCE / UNKNOWN]
- This checklist is Wix's tool, run by the partner, so it is not "a third party" under agreement:185. Running it before each submission is free and fits the draft's "second, separate AI agent" review. [INFERENCE] Wix publishing a review skill for coding agents suggests it expects agent-prepared submissions. Nothing here bars an agent-built app. [INFERENCE]

**(4) Fee, human steps, identity, payout country**
- **Fee:** the text has 0 hits for "fee", "cost" and "price". The two "paid" hits are at `:110` ("For paid apps", "a paid app"). The page charges nothing to submit. [RENDERED absent]
- **Human call, demo video, ID:** "demo", "video", "call", "interview", "identity", "passport", "camera", "selfie", "human" and "reviewer" get 0 hits each in the text. The reviewer is "an automated AI review" (`:98`). An appeal is written: "If you disagree with a blocker or believe it doesn't apply to your app, you can contact Wix support and open a ticket to appeal the decision." (`:142`). [RENDERED] The demo account that guidelines:122 asks for (tick 6) is a login, not a video, and a runner can create it. Nothing on this page is beyond a runner once the account exists. [INFERENCE]
- **Payout country:** "country", "Israel", "Tipalti" and "tax" get 0 hits in the text. The one payout line is `:110` "Make sure payout account setup is complete before you publish a paid app.", which links to the tick 2 payout page, and that page names no countries. The `.html`'s two Tipalti hits are changelog items already recorded (`wix-app-market.md:62`, tick 2). Israel-as-payee is still **UNKNOWN**. [RENDERED absent]

**(5) The docs are exhausted on agreement:185**
- The distribution section of the docs navigation (`submit:63-75`) runs: About App Distribution, Add Security and Privacy Information (tick 7), Submit Your First App Version (this page), Common Reasons for App Rejection, App Market Guidelines (tick 6), Test Your App. The agreement (tick 4), the best-practice page (tick 5), the guidelines (tick 6), the Security & Privacy page (tick 7) and this page have all been read, and none of them asks for the third-party test or evidence of it. [RENDERED]
- One sibling page is unread: "Common Reasons for App Rejection" (`submit:71`; href `/docs/build-apps/launch-your-app/app-distribution/common-reasons-for-app-rejection` at html:1 and html:47). It describes rejections, not what submission asks for, and the review taxonomy that rejections map to (`review:228-311`) has no such item. So it is not queued. [INFERENCE]
- The page is dated after the agreement version and still does not mention the test. It does not waive the clause either, because "Wix's Terms shall prevail" over guidelines (guidelines:106), and a breach found later lets Wix forfeit unpaid revenue (agreement:537). Only a written answer from Wix can say whether a free route meets it. [INFERENCE]

**Verdict for candidate 11 (Wix App Market): NEEDS_MORE**

The last page on the submission path, updated 28.7.2026, asks for no third-party security test and no evidence of one. The only gate is the dashboard blockers plus an automated AI review. It charges no fee, and it has no call, demo video or ID step. Wix's own review checklist has no third-party-test item either. The documentation route is exhausted on agreement:185 (and :181). No kill fires: nothing asks for a paid tester. Nothing passes either, because the clause still binds and no page says how to meet it at ₪0. Israel-as-payee is unchanged: UNKNOWN after two Tipalti 403s, and this page is silent on countries.

**Single next check:** the step-8 written question already drafted in `research/owner-asks/brand-mailbox-questions.md` §2 (`:67-98`), sent from the brand mailbox to `support.developers@in.wixanswers.com` with subject "Partner Agreement 6.3.5(iii) and (v): can they be met at no cost?". Its pre-send condition ("the ZERO-TESTS row 65 render comes first …; send only if it is silent on :185", `brand-mailbox-questions.md:71-72`) is met: row 65 (tick 7) and this page are both silent. It waits for owner step 8. Israel-as-payee stays the held follow-up in the same thread, sent only after a yes (`brand-mailbox-questions.md:97-98`). Tick 7's closing line put it "in the same message", but the mailbox file's rule of one decisive question per message (`brand-mailbox-questions.md:16`) governs.

Provenance note (not a check, and it decides nothing): to make the `review:` quotes re-checkable from the repo, a `urls.txt` line could store the file: `https://raw.githubusercontent.com/wix/skills/main/skills/wix-app/references/APP_MARKET_REVIEW.md	wix-app-market-review-skill`.
