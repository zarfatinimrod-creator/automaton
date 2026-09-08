# Publishing this Actor — the owner's steps, and why they are worth taking first

## Why this is the first thing to do, before any other build in the repo

Two independent auditors, working on different criterion groups, ended at the same
recommendation (`research/colony-sweep/audits/productized-services.md` §6 and
`research/colony-sweep/audits/agent-markets.md`):

> Publish `apify-il-open-data` free, today, and count runs from strangers for 30 days.

It is the cheapest test in the project of the constraint that decides everything else.
`MISSION.md` constraint 7 says nobody knows how a stranger finds any of this, and until they do
every ceiling in the repo is ₪0. **This Actor is already built and already tested.** Publishing it
costs no build hours, no money, and no owner time beyond account creation — and the number it
returns collapses or confirms every Apify estimate in the repo at once: ₪3,000 (`apify-actors`
target), ₪1,500 (`store-promotion` audit), ₪500 and ₪200 (the two audits above).

There is also a fact that makes free the only option rather than merely the wise one: **Apify
requires the developer to complete identity verification before an Actor can carry any price.**
Publishing free is the one thing possible before KYC. So the sequencing is not a compromise.

## What the owner does

Six steps. Nothing here is KYC, nothing costs money, and none of it is reversible in a way that
matters.

1. **Create an Apify account** at `apify.com` in your own name. Email and password. No identity
   documents at this stage.
2. **Install the CLI and log in**, from a machine with the repo checked out:
   ```bash
   npm install -g apify-cli
   apify login
   ```
3. **Push the Actor** from the product directory:
   ```bash
   cd products/apify-il-open-data
   apify push
   ```
   `.actor/actor.json` already carries the name, title, description, input schema, dataset views
   and Dockerfile, so there is nothing to fill in by hand.
4. **Publish it to the Store** from the Apify Console: Actor → Publication → *Publish to Store*.
   Leave the pricing model as **Free**. Do not set a price, and do not start KYC yet.
5. **Tell the colony it is live**, so the loop stops treating it as blocked:
   ```bash
   pnpm exec tsx scripts/colony.ts setup-done apify-actors --evidence "published free to Apify Store on <date>, URL <url>"
   ```
6. **Send back the Store URL.** That is the whole handover.

## What happens then, without you

For 30 days the only thing that matters is the run count from people we did not tell. Apify's
Console shows runs and unique users per Actor.

- **If strangers run it:** constraint 7 has its first real answer, KYC becomes worth doing, and
  pricing gets switched on with the table already written into the README.
- **If nobody runs it:** that is the more valuable result, and it arrives for free. It says the
  discoverability problem is real and that no amount of building more Actors fixes it — which
  would kill several ₪-thousand ceilings in this repo that currently rest on the opposite
  assumption.

Either way we stop guessing. The one thing that is not acceptable is another month of ceilings with
no measurement under them.

## What is deliberately not claimed

The listing says the Actor is free and that pricing is planned but not enabled. It does not promise
a price, because the listing cannot carry one yet, and this repo has already shipped one product
that sold a feature that did not exist. That is not happening twice.

Two things are also known and worth stating plainly before publishing:

- **The niche is not empty.** Apify Store already carries Israeli-data Actors, including ones
  wrapping the same `data.gov.il` endpoint this Actor wraps, and one creator runs a whole
  Israeli-dataset family. See `docs/REJECTED.md`. This publish is a measurement, not a land grab.
- **The underlying API is free and keyless.** Anyone can call `data.gov.il` directly. What this
  Actor sells is the English keying, the typing and the pagination — worth something to a buyer in
  a hurry, worth nothing to a buyer who is not there. Which is, again, the thing being measured.
