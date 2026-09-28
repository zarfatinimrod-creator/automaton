# Revenue colony — board report

Generated 2026-09-28T08:53:40.813Z

## Where we are

| | |
|---|---|
| 30-day revenue | **₪0.00** |
| Target | ₪20,000.00 (0.0%) |
| Stretch target | ₪50,000.00 |
| Run-rate from last 7 days | ₪0.00/month |
| Costs (30d) | ₪0.00 |
| Net (30d) | ₪0.00 |

### What the plan rests on

| | |
|---|---|
| Line targets, summed | ₪1,100 against a ₪20,000 goal |
| Of that, **measured** | ₪0 |
| Inferred | ₪800 |
| **Resting on nothing yet** | ₪0 |
| **Contradicted by their own basis** | ₪300 |

Contested upper bounds, not targets and not in the sum: `apify-actors` ₪1,500 (target ₪200), `il-biz-tools` ₪400 (target ₪0).

Contradicted targets: `oss-bounties`. These are not merely unproven — the evidence cited in each line's own basis field argues against its number. They are worse than the unevidenced ones and must not be summed with them.
## Revenue lines

| Line | Tier | Status | 30d | Target | Last supervisor call |
|---|---|---|---|---|---|
| `apify-actors` | core | awaiting_setup | ₪0.00 | ₪200.00 | escalate |
| `il-biz-tools` | core | awaiting_setup | ₪0.00 | ₪0.00 | escalate |
| `oss-bounties` | growth | awaiting_setup | ₪0.00 | ₪300.00 | escalate |
| `pcn874` | core | awaiting_setup | ₪0.00 | ₪600.00 | escalate |

## This tick

Ran: nothing (everything within its interval)
Skipped as not yet due: revenue_ledger_sync, revenue_supervisor_review, revenue_board_review, revenue_audit


## Blocked on

- apify-actors is waiting on the owner: steps 6 of docs/OWNER_STEPS.he.md (not asked now: step 2 only when a paid product is ready, after the official cost check); Sign up at Apify with the brand as the username — the Store URL apify.com/<username>/… is public — and paste APIFY_TOKEN as a GitHub Actions secret (owner step 6; this half may be done straight after step 1). After the first CI push, open the Actor in the Apify Console once and press Publication → Publish to Store: the push creates it private and the workflow deliberately does not publish it (apify-publish.yml). Neither needs identity verification. Apify KYC and a PayPal or Wise payout are deferred until 50 stranger users in 30 days (scaleCriteria); under 10 at day 30 they are not asked for.
- il-biz-tools is waiting on the owner: steps 3, 6 of docs/OWNER_STEPS.he.md (not asked now: step 2 only when a paid product is ready, after the official cost check; step 5 frozen by the owner's ₪0 rule of 27.9.2026); Open a Gumroad account in your legal identity with the BRAND as the store name, add an Israeli bank account with the holder's name in Latin characters, and mint one access token (owner step 3); Link the repo in Netlify and paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6)
- oss-bounties is waiting on the owner: steps 7, 6 of docs/OWNER_STEPS.he.md (not asked now: step 2 only when a paid product is ready, after the official cost check; step 4 Stripe form, part 4b, asked only after a corrected week-4 count of 3 or more and a reward Algora holds — the 2-minute sign-in 4a rides step 7); Create the brand machine account on GitHub alongside your personal one and add it to the organisation (owner step 7) — a normal user account whose login does not end in "bot" (BOARD-2 §2.1.3(c)). In the same sitting, create its token for BRAND_GITHUB_TOKEN (pasted in step 6); the intake stays disabled in code until the corrected week-4 read, so the token changes nothing before then (RULING-2026-09-28-bounty-rail.md §4.4); Owner step 4a, in step 7's sitting: sign in to Algora once AS THE BRAND MACHINE ACCOUNT — a GitHub sign-in, two minutes, no identity, no money — ruled into step 7's sitting because one sitting is less owner involvement than two (RULING-2026-09-28-bounty-rail.md §4.1); Owner step 4b, asked only when the corrected week-4 mean is 3 or more AND a reward for a merged brand-account PR is held by Algora: complete Stripe Connect Express onboarding in your legal identity — individual, Israel, Israeli bank — under three stop rules: a US account country or a US bank/SSN/ITIN/EIN, a selfie or liveness check, or any fee → close the tab and complete nothing (RULING-2026-09-28-bounty-rail.md §4.1-§4.2)
- pcn874 is waiting on the owner: steps 3, 7, 6 of docs/OWNER_STEPS.he.md (not asked now: step 2 only when a paid product is ready, after the official cost check; step 5 frozen by the owner's ₪0 rule of 27.9.2026); Open a Gumroad account in your legal identity with the BRAND as the store name and mint one access token (owner step 3) — the same account il-biz-tools uses; Create the GitHub organisation under the brand name so the open-source core's repository URL carries it and not your username (owner step 7). The npm scope `@mehudak` (the brand the board chose on 27.9.2026) is a separate namespace on npm, not created by the GitHub organisation; publishing to it is our work and no workflow does it yet.; Paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6) — shared with il-biz-tools; without the token the loop cannot see a sale. (The company domain, owner step 5, is frozen by the owner's ₪0 rule of 27.9.2026 and is not asked for.)

## What the owner has to do (one time, per line)

**Apify Actors on one creator account (published free while the stranger count runs)** (`apify-actors`)
Owner steps still open for `apify-actors` (docs/OWNER_STEPS.he.md): 6 (not asked now: step 2 only when a paid product is ready, after the official cost check)
- [ ] Sign up at Apify with the brand as the username — the Store URL apify.com/<username>/… is public — and paste APIFY_TOKEN as a GitHub Actions secret (owner step 6; this half may be done straight after step 1). After the first CI push, open the Actor in the Apify Console once and press Publication → Publish to Store: the push creates it private and the workflow deliberately does not publish it (apify-publish.yml). Neither needs identity verification. Apify KYC and a PayPal or Wise payout are deferred until 50 stranger users in 30 days (scaleCriteria); under 10 at day 30 they are not asked for.

**Hebrew small-business web tools (invoices, receipts, VAT, net salary)** (`il-biz-tools`)
Owner steps still open for `il-biz-tools` (docs/OWNER_STEPS.he.md): 3, 6 (not asked now: step 2 only when a paid product is ready, after the official cost check; step 5 frozen by the owner's ₪0 rule of 27.9.2026)
- [ ] Open a Gumroad account in your legal identity with the BRAND as the store name, add an Israeli bank account with the holder's name in Latin characters, and mint one access token (owner step 3)
- [ ] Link the repo in Netlify and paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6)

**Open-source bounties on Algora, from the brand machine account** (`oss-bounties`)
Owner steps still open for `oss-bounties` (docs/OWNER_STEPS.he.md): 7, 6 (not asked now: step 2 only when a paid product is ready, after the official cost check; step 4 Stripe form, part 4b, asked only after a corrected week-4 count of 3 or more and a reward Algora holds — the 2-minute sign-in 4a rides step 7)
- [ ] Create the brand machine account on GitHub alongside your personal one and add it to the organisation (owner step 7) — a normal user account whose login does not end in "bot" (BOARD-2 §2.1.3(c)). In the same sitting, create its token for BRAND_GITHUB_TOKEN (pasted in step 6); the intake stays disabled in code until the corrected week-4 read, so the token changes nothing before then (RULING-2026-09-28-bounty-rail.md §4.4)
- [ ] Owner step 4a, in step 7's sitting: sign in to Algora once AS THE BRAND MACHINE ACCOUNT — a GitHub sign-in, two minutes, no identity, no money — ruled into step 7's sitting because one sitting is less owner involvement than two (RULING-2026-09-28-bounty-rail.md §4.1)
- [ ] Owner step 4b, asked only when the corrected week-4 mean is 3 or more AND a reward for a merged brand-account PR is held by Algora: complete Stripe Connect Express onboarding in your legal identity — individual, Israel, Israeli bank — under three stop rules: a US account country or a US bank/SSN/ITIN/EIN, a selfie or liveness check, or any fee → close the tab and complete nothing (RULING-2026-09-28-bounty-rail.md §4.1-§4.2)

**PCN874 builder — spreadsheet to a validated מע"מ detailed-report file** (`pcn874`)
Owner steps still open for `pcn874` (docs/OWNER_STEPS.he.md): 3, 7, 6 (not asked now: step 2 only when a paid product is ready, after the official cost check; step 5 frozen by the owner's ₪0 rule of 27.9.2026)
- [ ] Open a Gumroad account in your legal identity with the BRAND as the store name and mint one access token (owner step 3) — the same account il-biz-tools uses
- [ ] Create the GitHub organisation under the brand name so the open-source core's repository URL carries it and not your username (owner step 7). The npm scope `@mehudak` (the brand the board chose on 27.9.2026) is a separate namespace on npm, not created by the GitHub organisation; publishing to it is our work and no workflow does it yet.
- [ ] Paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6) — shared with il-biz-tools; without the token the loop cannot see a sale. (The company domain, owner step 5, is frozen by the owner's ₪0 rule of 27.9.2026 and is not asked for.)

When you finish a step, tell Claude which step is done and when. Claude records it (`scripts/colony.ts setup-done <line> --evidence "..."`) and commits state/colony, which moves the line out of awaiting_setup and queues its build goal. The scheduled loop runs `tick --no-feed` and does not build.

---

Revenue here is only what reached the ledger with a platform transaction id; costs may be entered by hand without one. Projections are never counted.
