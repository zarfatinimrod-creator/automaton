# Measurement: Wix App Market (BOARD-LOOP rank 11, ZERO-TESTS row 5)

**Date:** 2026-09-27
**Ordered by:** `research/channel-loop/BOARD-LOOP.md:157-162` (candidate 11) and `research/channel-loop/ZERO-TESTS.md:14`
(row 5: "whether it pays Israel, and whether the $200 floor rolls over or is forfeited").
**Gate being tested (BOARD-LOOP.md:160):** "if it is payable to Israel and the floor rolls over rather than forfeits, run
the two-hour occupancy scan of the Hebrew/Israeli App Market categories and either name one niche or record 'none'".
**Kill list (BOARD-LOOP.md:162):** Israel not payable; the floor forfeits or accrues without moving on any plausible
ceiling; the niche has free incumbents; developer terms impose a support SLA or human conversations; or no niche can be named.

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
