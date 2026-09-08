# Revenue colony — board report

Generated 2026-09-07T16:12:28.138Z

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
| Line targets, summed | ₪1,500 against a ₪20,000 goal |
| Of that, **measured** | ₪0 |
| Inferred | ₪1,100 |
| **Resting on nothing yet** | ₪0 |
| **Contradicted by their own basis** | ₪400 |


Contradicted targets: `il-biz-tools`. These are not merely unproven — the evidence cited in each line's own basis field argues against its number. They are worse than the unevidenced ones and must not be summed with them.
## Revenue lines

| Line | Tier | Status | 30d | Target | Last supervisor call |
|---|---|---|---|---|---|
| `apify-actors` | core | awaiting_setup | ₪0.00 | ₪200.00 | escalate |
| `il-biz-tools` | core | awaiting_setup | ₪0.00 | ₪400.00 | escalate |
| `oss-bounties` | growth | awaiting_setup | ₪0.00 | ₪300.00 | escalate |
| `pcn874` | core | awaiting_setup | ₪0.00 | ₪600.00 | escalate |

## This tick

Ran: nothing (everything within its interval)
Skipped as not yet due: revenue_ledger_sync, revenue_supervisor_review, revenue_board_review, revenue_audit


## Blocked on

- apify-actors is waiting on the owner: Sign up at Apify with the brand as the username — the Store URL apify.com/<username>/… is public — and paste APIFY_TOKEN as a GitHub Actions secret (owner step 6; this half may be done straight after step 1). Nothing else: publishing free and counting stranger runs needs no identity verification. Apify KYC and a PayPal payout are deferred until stranger runs exist.
- il-biz-tools is waiting on the owner: Open a Gumroad account in your legal identity with the BRAND as the store name, add an Israeli bank account with the holder's name in Latin characters, and mint one access token (owner step 3); Buy the company domain at a registrar with WHOIS privacy on by default (owner step 5); Link the repo in Netlify and paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6)
- oss-bounties is waiting on the owner: Create the brand machine account on GitHub alongside your personal one and add it to the organisation (owner step 7); Sign in to Algora AS THE BRAND MACHINE ACCOUNT and complete Stripe Connect Express onboarding in your legal identity — individual, ID, Israeli address, Israeli bank account (owner step 4, done after step 7)
- pcn874 is waiting on the owner: Open a Gumroad account in your legal identity with the BRAND as the store name and mint one access token (owner step 3) — the same account il-biz-tools uses; Create the GitHub organisation under the brand name so the open-source core and the npm scope carry it and not your username (owner step 7)

## What the owner has to do (one time, per line)

**Apify Actors on one creator account (published free while the stranger count runs)** (`apify-actors`)
- [ ] Sign up at Apify with the brand as the username — the Store URL apify.com/<username>/… is public — and paste APIFY_TOKEN as a GitHub Actions secret (owner step 6; this half may be done straight after step 1). Nothing else: publishing free and counting stranger runs needs no identity verification. Apify KYC and a PayPal payout are deferred until stranger runs exist.

**Hebrew small-business web tools (invoices, receipts, VAT, net salary)** (`il-biz-tools`)
- [ ] Open a Gumroad account in your legal identity with the BRAND as the store name, add an Israeli bank account with the holder's name in Latin characters, and mint one access token (owner step 3)
- [ ] Buy the company domain at a registrar with WHOIS privacy on by default (owner step 5)
- [ ] Link the repo in Netlify and paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6)

**Open-source bounties on Algora, from the brand machine account** (`oss-bounties`)
- [ ] Create the brand machine account on GitHub alongside your personal one and add it to the organisation (owner step 7)
- [ ] Sign in to Algora AS THE BRAND MACHINE ACCOUNT and complete Stripe Connect Express onboarding in your legal identity — individual, ID, Israeli address, Israeli bank account (owner step 4, done after step 7)

**PCN874 builder — spreadsheet to a validated מע"מ detailed-report file** (`pcn874`)
- [ ] Open a Gumroad account in your legal identity with the BRAND as the store name and mint one access token (owner step 3) — the same account il-biz-tools uses
- [ ] Create the GitHub organisation under the brand name so the open-source core and the npm scope carry it and not your username (owner step 7)

When a line's steps are done, confirm it so the colony can start building:

```bash
pnpm exec tsx scripts/colony.ts setup-done apify-actors --evidence "done on <date>"
```

---

Money here is only what reached the ledger with a platform transaction id. Projections are never counted.
