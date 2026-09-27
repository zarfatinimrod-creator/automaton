# Publishing this Actor — the owner's steps, and why they are worth taking first

## Why this is the first thing to do, before any other build in the repo

Two independent auditors, working on different criterion groups, ended at the same
recommendation (`research/colony-sweep/audits/productized-services.md` §6 and
`research/colony-sweep/audits/agent-markets.md`):

> Publish `apify-il-open-data` free, today, and count runs from strangers for 30 days.

It is the cheapest test in the project of the constraint that decides everything else.
`MISSION.md` constraint 7 says nobody knows how a stranger finds any of this, and until they do
every ceiling in the repo is ₪0. **This Actor is already built and already tested.** Publishing it
costs no build hours, no money, and no owner time beyond account creation, one token pasted as a GitHub secret and one click in the Apify Console — and the number it
returns collapses or confirms every Apify estimate in the repo at once: ₪200 (`apify-actors`
target, cut from ₪3,000 by the board), ₪1,500 (`store-promotion` audit), ₪0 net-new and ₪200 (the two audits above; the first refutes its group's ₪500 headline).

There is also a fact that makes free the only option rather than merely the wise one: **Apify
requires the developer to complete identity verification before an Actor can carry any price.**
Publishing free is the one thing possible before KYC. So the sequencing is not a compromise.

## What the owner does

Six steps. Nothing here is KYC, nothing costs money, and nothing here commits you: no identity is verified and no price is set. What can be undone afterwards — the account, the listing, the public username — was not verified from here (Apify is egress-blocked), which is one more reason the username is the brand name from the first click.

1. **Create an Apify account** at `apify.com` with **the brand as the username**, not your name: the
   Store URL `apify.com/<username>/…` is public, so the username is a published name (`MISSION.md`,
   anonymity; `src/revenue/portfolio.ts` says the same). Email and password. No identity documents at
   this stage.
2. **Create an Apify API token and paste it into GitHub** as a repository secret named exactly
   `APIFY_TOKEN` (Apify Console → *Settings → Integrations → Personal API tokens* 🔍; this is
   `docs/OWNER_STEPS.he.md` step 6). Never paste it in chat.
3. **The push is done by CI, not by hand**: `.github/workflows/apify-publish.yml` tests, builds and
   runs `apify push`. Adding the secret does not trigger it by itself, so the workflow is run once
   after the secret is set, and you are told when the push has finished. The CLI route in the
   README (*Deploy steps by hand (fallback)*) is a fallback only.
   `.actor/actor.json` already carries the name, title, description, input schema, dataset views
   and Dockerfile, so there is nothing to fill in by hand.
4. **Publish it to the Store** from the Apify Console: Actor → Publication → *Publish to Store* 🔍
   (menu names not verified from here; look for the function, not the exact words).
   Leave the pricing model as **Free**. Do not set a price, and do not start KYC yet.
5. **Tell me it is published**, so the loop stops treating it as blocked. I record it with
   `pnpm exec tsx scripts/colony.ts setup-done apify-actors --evidence "<your message, date>"` in the
   committed `state/colony/colony.db` on `main`, which is what the loop reads (it runs in GitHub
   Actions, so a run on your machine alone never reaches it). That moves the line from
   `awaiting_setup` to `proposed` and queues its build goal; it becomes `live` only when money lands
   in the ledger.
6. **Send back the Store URL.** That is the whole handover.

## What happens then, without you

For 30 days the only thing that matters is how many distinct people we did not tell ran it — `strangerUsers30d`, distinct users minus the brand account, the number the board's thresholds read (`research/colony-sweep/BOARD.md` §6.3.1; kill and scale criteria in `src/revenue/portfolio.ts`). The run count is a secondary signal. A daily
GitHub Actions job (`count-runs` in `.github/workflows/apify-publish.yml`, 05:41 UTC) reads the
Actor's runs from the Apify API with `APIFY_TOKEN` and commits
`state/colony/measurements/apify-runs.json` to `main`. Nothing in the colony reads that file into
its KPIs yet. **Unverified assumption in that job:** it lists the Actor's runs with the owner's token and splits them by `userId`. Apify's API has never been reached from this container, and Apify's own documentation describes other users' runs on a public Actor as an aggregate (`stats.totalUsers30Days`, `stats.publicActorRunStats30Days` on the Actor object — the shape the repo has rendered in `research/rendered/apify-store-accessibility.json`), not as rows in the owner's runs list. Until the first real response, a stranger count of 0 from the runs list must not be read as "nobody ran it"; the job should record the Actor object's `stats.totalUsers30Days` alongside it.

- **If strangers run it:** constraint 7 has its first real answer — and the response is staged by the board, not switched on at once (`research/colony-sweep/BOARD.md` §6.3.1; `src/revenue/portfolio.ts` kill and scale criteria): under 10 stranger users at day 30 the line stays an instrument and no KYC is asked for; 10–49, keep counting and fix what the runs show; 50 or more, one more Actor and Apify KYC goes to the owner; 200 or more, pricing is designed, with the free `data.gov.il` source disclosed on the listing.
- **If nobody runs it:** that is the more valuable result, and it arrives for free. It says the
  discoverability problem is real and that no amount of building more Actors fixes it — which
  would close the one ₪-thousand figure still standing in this repo — Apify's contested ₪1,500
  upper bound (`src/revenue/portfolio.ts`, `TARGET_BASIS`) — and the committed ₪200 with it.

Either way we stop guessing. The one thing that is not acceptable is another month of ceilings with
no measurement under them.

## What is deliberately not claimed

The listing says the Actor is free and that pricing is planned but not enabled. It shows the planned
per-event price table, marked as not enabled, but sets no price, because the listing cannot carry
one yet, and this repo has already shipped one product
that sold a feature that did not exist. That is not happening twice.

Two things are also known and worth stating plainly before publishing:

- **The niche is not empty.** Apify Store already carries Israeli-data Actors, including ones
  wrapping the same `data.gov.il` endpoint this Actor wraps, and one creator runs a whole
  Israeli-dataset family. See `docs/REJECTED.md`. This publish is a measurement, not a land grab.
- **The underlying API is free and keyless.** Anyone can call `data.gov.il` directly. What this
  Actor sells is the English keying, the typing and the pagination — worth something to a buyer in
  a hurry, worth nothing to a buyer who is not there. Which is, again, the thing being measured.
