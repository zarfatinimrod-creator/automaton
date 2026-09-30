# Revenue colony — board report

Generated 2026-09-30T23:47:06.230Z

## Where we are

| | |
|---|---|
| 30-day revenue, converted (not in the wallet) | **₪0.00** |
| 30-day revenue, unconverted (wallet; in no target) | ₪0.00 |
| Target | ₪20,000.00 (0.0%) |
| Stretch target | ₪50,000.00 |
| Run-rate from last 7 days | ₪0.00/month |
| Costs (30d) | ₪0.00 |
| Net (30d) | ₪0.00 |

### What the plan rests on

| | |
|---|---|
| Line targets, summed | ₪900 against a ₪20,000 goal |
| Of that, **measured** | ₪0 |
| Inferred | ₪600 |
| **Resting on nothing yet** | ₪0 |
| **Contradicted by their own basis** | ₪300 |

Contested upper bounds, not targets and not in the sum: `apify-actors` ₪200 (target ₪0), `il-biz-tools` ₪400 (target ₪0).

Contradicted targets: `oss-bounties`. These are not merely unproven — the evidence cited in each line's own basis field argues against its number. They are worse than the unevidenced ones and must not be summed with them.
## Revenue lines

| Line | Tier | Status | 30d converted | 30d unconverted | Target | Last supervisor call |
|---|---|---|---|---|---|---|
| `apify-actors` | core | awaiting_setup | ₪0.00 | ₪0.00 | ₪0.00 | escalate |
| `il-biz-tools` | core | awaiting_setup | ₪0.00 | ₪0.00 | ₪0.00 | escalate |
| `oss-bounties` | growth | awaiting_setup | ₪0.00 | ₪0.00 | ₪300.00 | escalate |
| `pcn874` | core | awaiting_setup | ₪0.00 | ₪0.00 | ₪600.00 | escalate |

Labelled measurements — each is printed with its label wherever it is printed:

- `apify-actors` strangerUsers30d: no reading yet — stranger runs — biased low while the developer is unverified: hidden from default Store-API search. Rule: a reading under 10 is TEST_MORE (hidden or unwanted, indistinguishable), never "permanent instrument", until Apify identity verification is settled: pulled to the Publish sitting if the apify-docs read shows document-only verification, never asked if it shows any camera step (research/breadth/BOARD.md Q5).
- `apify-actors` strangerRuns30d: no reading yet — stranger runs — biased low while the developer is unverified: hidden from default Store-API search. Rule: a reading under 10 is TEST_MORE (hidden or unwanted, indistinguishable), never "permanent instrument", until Apify identity verification is settled: pulled to the Publish sitting if the apify-docs read shows document-only verification, never asked if it shows any camera step (research/breadth/BOARD.md Q5).
- `il-biz-tools` weeklyPageViews: no reading yet — cookieless page views on the canonical host, one row per week from the clock's anchor day; /preview/, noindex and withheld pages excluded; an upper bound on human readers (posthog-js blocks known bots only). Rule: no gate reads it before two consecutive weekly writes; a week without a row is unmeasured, never zero; the gates (M-instrument by D0+21, M-reach at D0+56, the 8-week kill from the domain deploy) are src/revenue/page-views.ts and their verdicts are the board's to apply.
- `pcn874` weeklyPageViews: no reading yet — cookieless page views on the canonical host, one row per week from the clock's anchor day; /preview/, noindex and withheld pages excluded; an upper bound on human readers (posthog-js blocks known bots only). Rule: no gate reads it before two consecutive weekly writes; a week without a row is unmeasured, never zero; the gates (M-instrument by D0+21, M-reach at D0+56, the 8-week kill from the domain deploy) are src/revenue/page-views.ts and their verdicts are the board's to apply.

## This tick

Ran: revenue_ledger_sync, revenue_supervisor_review
Skipped as not yet due: revenue_board_review, revenue_audit

- Ledger sync: 0 new entries, 0 already known, sources [none configured]
- Gumroad Pro refund rate: not configured — GUMROAD_ACCESS_TOKEN is not set
- Supervisors reviewed 4 line(s), escalating 4
- Prize-event intake (instrument only; files nothing): 29 open of 397 listed on the mlcontests list, read 2026-09-30 13:02 UTC (0.4 days ago) — 2 with registration already closed, 0 not yet launched, 23 with a stated USD prize ($2,564,825 stated in total, all places combined, not an expected payout), 1 listed with a deadline that does not parse (neither open nor closed). AI or automated solutions allowed: not counted — none of the list's fields states it. Rules pages (research/measurements/ai-allowed-events.md, graded by a reading session, never by the job): 2026-Q3 (current): 39 events, 0 graded, qualifying not counted (no row graded), 39 awaiting a reading; 2026-Q4 (next): 27 events, 0 graded, qualifying not counted (no row graded), 27 awaiting a reading. 101 URLs await a render (research/measurements/ai-allowed-events.urls.txt, for render-watch's urls input). Kill (two consecutive closed, fully graded quarters under 3 qualifying): not computable yet.
- Page views: not configured — POSTHOG_READ_KEY is not set; no project id (POSTHOG_PROJECT_ID, or posthog.projectId in site.json) — nothing is read
- Page views `il-biz-tools`: no_clock — no D0 recorded: nothing is read and no gate runs
- Page views `pcn874`: no_clock — no D0 recorded: nothing is read and no gate runs

## Blocked on

- apify-actors is waiting on the owner: steps 6 of docs/OWNER_STEPS.he.md (not asked now: step 2 only when a paid product is ready, after the official cost check); Sign up at Apify with the brand as the username — the Store URL apify.com/<username>/… is public — and paste APIFY_TOKEN as a GitHub Actions secret (owner step 6; this half may be done straight after step 1). After the first CI push, open the Actor in the Apify Console once and press Publication → Publish to Store: the push creates it private and the workflow deliberately does not publish it (apify-publish.yml). Neither needs identity verification. Apify identity verification (ID, proof of address, a tax document, ownership information) is asked at that Publish sitting only if the apify-docs read shows it is document-only — no selfie, liveness or video — because an unverified developer's Actors are hidden from default Store-API search; if the read shows any camera step it is never asked (breadth board, 28.9.2026, research/breadth/BOARD.md Q5). A PayPal or Wise payout waits for pricing (scaleCriteria).
- il-biz-tools is waiting on the owner: steps 8, 3, 6 of docs/OWNER_STEPS.he.md (not asked now: step 2 only when a paid product is ready, after the official cost check; step 5 frozen by the owner's ₪0 rule of 27.9.2026); Open the brand mailbox (owner step 8): a Google account under the brand (Gmail, mehudak) — or a free Outlook.com mailbox if Google's sign-up asks for more than a phone number — connected here as a second Gmail connector. The site's accessibility page (accessibility.html) will publish it as the brand-owned accessibility contact — the publish gate refuses the site until a real one is there, so it is the line's last publish gate — and it is published in no other role (research/breadth/BOARD.md Q2); Open a Gumroad account in your legal identity with the BRAND as the store name, add an Israeli bank account with the holder's name in Latin characters, and mint one access token (owner step 3); Link the repo in Netlify and paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6)
- oss-bounties is waiting on the owner: steps 7, 6 of docs/OWNER_STEPS.he.md (not asked now: step 2 only when a paid product is ready, after the official cost check; step 4 Stripe form 4b, asked only after a corrected week-4 count of 3 or more and a reward Algora holds — the form begins with the Algora sign-in); Create the brand machine account on GitHub alongside your personal one and add it to the organisation (owner step 7) — a normal user account whose login does not end in "bot" (BOARD-2 §2.1.3(c)). In the same sitting, create its token for BRAND_GITHUB_TOKEN — made with step 7, pasted in step 6, and the only other thing step 7's sitting does; the intake stays disabled in code until the corrected week-4 read, so the token changes nothing before then (RULING-2026-09-28-bounty-rail.md §4.4); Owner step 4b, asked only when the corrected week-4 mean is 3 or more AND a reward for a merged brand-account PR is held by Algora: the form begins by signing in to Algora with GitHub as the brand machine account, then Stripe Connect Express onboarding in your legal identity — individual, Israel, Israeli bank — under three stop rules: a US account country or a US bank/SSN/ITIN/EIN, a selfie or liveness check, or any fee → close the tab and complete nothing (RULING-2026-09-28-bounty-rail.md §4.1-§4.2; research/breadth/BOARD.md Part B(b))
- pcn874 is waiting on the owner: steps 3, 7, 6 of docs/OWNER_STEPS.he.md (not asked now: step 2 only when a paid product is ready, after the official cost check; step 5 frozen by the owner's ₪0 rule of 27.9.2026); Open a Gumroad account in your legal identity with the BRAND as the store name and mint one access token (owner step 3) — the same account il-biz-tools uses; Create the GitHub organisation under the brand name so the open-source core's repository URL carries it and not your username (owner step 7). The npm scope `@mehudak` (the brand the board chose on 27.9.2026) is a separate namespace on npm, not created by the GitHub organisation; publishing to it is our work and no workflow does it yet.; Paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6) — shared with il-biz-tools; without the token the loop cannot see a sale. (The company domain, owner step 5, is frozen by the owner's ₪0 rule of 27.9.2026 and is not asked for.)

## What the owner has to do (one time, per line)

Not asked yet: step 6's `POSTHOG_READ_KEY` row waits until the colony has created the brand's PostHog project (posthog.projectId in products/il-biz-tools/src/config/site.json).

**Apify Actors on one creator account (published free while the stranger count runs)** (`apify-actors`)
Owner steps still open for `apify-actors` (docs/OWNER_STEPS.he.md): 6 (not asked now: step 2 only when a paid product is ready, after the official cost check)
- [ ] Sign up at Apify with the brand as the username — the Store URL apify.com/<username>/… is public — and paste APIFY_TOKEN as a GitHub Actions secret (owner step 6; this half may be done straight after step 1). After the first CI push, open the Actor in the Apify Console once and press Publication → Publish to Store: the push creates it private and the workflow deliberately does not publish it (apify-publish.yml). Neither needs identity verification. Apify identity verification (ID, proof of address, a tax document, ownership information) is asked at that Publish sitting only if the apify-docs read shows it is document-only — no selfie, liveness or video — because an unverified developer's Actors are hidden from default Store-API search; if the read shows any camera step it is never asked (breadth board, 28.9.2026, research/breadth/BOARD.md Q5). A PayPal or Wise payout waits for pricing (scaleCriteria).

**Hebrew small-business web tools (invoices, receipts, VAT, net salary)** (`il-biz-tools`)
Owner steps still open for `il-biz-tools` (docs/OWNER_STEPS.he.md): 8, 3, 6 (not asked now: step 2 only when a paid product is ready, after the official cost check; step 5 frozen by the owner's ₪0 rule of 27.9.2026)
- [ ] Open the brand mailbox (owner step 8): a Google account under the brand (Gmail, mehudak) — or a free Outlook.com mailbox if Google's sign-up asks for more than a phone number — connected here as a second Gmail connector. The site's accessibility page (accessibility.html) will publish it as the brand-owned accessibility contact — the publish gate refuses the site until a real one is there, so it is the line's last publish gate — and it is published in no other role (research/breadth/BOARD.md Q2)
- [ ] Open a Gumroad account in your legal identity with the BRAND as the store name, add an Israeli bank account with the holder's name in Latin characters, and mint one access token (owner step 3)
- [ ] Link the repo in Netlify and paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6)

**Open-source bounties on Algora, from the brand machine account** (`oss-bounties`)
Owner steps still open for `oss-bounties` (docs/OWNER_STEPS.he.md): 7, 6 (not asked now: step 2 only when a paid product is ready, after the official cost check; step 4 Stripe form 4b, asked only after a corrected week-4 count of 3 or more and a reward Algora holds — the form begins with the Algora sign-in)
- [ ] Create the brand machine account on GitHub alongside your personal one and add it to the organisation (owner step 7) — a normal user account whose login does not end in "bot" (BOARD-2 §2.1.3(c)). In the same sitting, create its token for BRAND_GITHUB_TOKEN — made with step 7, pasted in step 6, and the only other thing step 7's sitting does; the intake stays disabled in code until the corrected week-4 read, so the token changes nothing before then (RULING-2026-09-28-bounty-rail.md §4.4)
- [ ] Owner step 4b, asked only when the corrected week-4 mean is 3 or more AND a reward for a merged brand-account PR is held by Algora: the form begins by signing in to Algora with GitHub as the brand machine account, then Stripe Connect Express onboarding in your legal identity — individual, Israel, Israeli bank — under three stop rules: a US account country or a US bank/SSN/ITIN/EIN, a selfie or liveness check, or any fee → close the tab and complete nothing (RULING-2026-09-28-bounty-rail.md §4.1-§4.2; research/breadth/BOARD.md Part B(b))

**PCN874 builder — spreadsheet to a validated מע"מ detailed-report file** (`pcn874`)
Owner steps still open for `pcn874` (docs/OWNER_STEPS.he.md): 3, 7, 6 (not asked now: step 2 only when a paid product is ready, after the official cost check; step 5 frozen by the owner's ₪0 rule of 27.9.2026)
- [ ] Open a Gumroad account in your legal identity with the BRAND as the store name and mint one access token (owner step 3) — the same account il-biz-tools uses
- [ ] Create the GitHub organisation under the brand name so the open-source core's repository URL carries it and not your username (owner step 7). The npm scope `@mehudak` (the brand the board chose on 27.9.2026) is a separate namespace on npm, not created by the GitHub organisation; publishing to it is our work and no workflow does it yet.
- [ ] Paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6) — shared with il-biz-tools; without the token the loop cannot see a sale. (The company domain, owner step 5, is frozen by the owner's ₪0 rule of 27.9.2026 and is not asked for.)

When you finish a step, tell Claude which step is done and when. Claude records it (`scripts/colony.ts setup-done <line> --evidence "..."`) and commits state/colony, which moves the line out of awaiting_setup and queues its build goal. The scheduled loop runs `tick --no-feed` and does not build.

---

Revenue here is only what reached the ledger with a platform transaction id; costs may be entered by hand without one. Projections are never counted.
