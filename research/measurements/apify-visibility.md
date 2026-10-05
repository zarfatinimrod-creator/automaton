# Apify Store visibility: the hidden share (breadth board Q5; ZERO-TESTS row 51)

**Status (28.9.2026):** measured. Both Store-API captures were parsed, and Apify's KYC requirements were read from
GitHub (`apify/apify-docs`, branch `master`, raw files, read 28.9.2026).

**What was read:**
- `research/rendered/apify-store-israel-all-2026-09-28.json` (`?search=israel&limit=1000&includeUnrunnableActors=true`, captured
  13:18:14Z, sha256 `c5efd9ea…`; re-masked 5.10.2026, one address: now `c031fd6d…`);
- `research/rendered/apify-store-israel-default-2026-09-28.json` (the same query without the parameter, captured 13:18:15Z,
  sha256 `0a94cd5d…`).

Both were parsed with python3 and matched by `id`.

**Numbers** [RENDERED]
- With the parameter: `total` 474 and 474 items. Default: `total` **462** but only **410** items.
- Present only with the parameter: **64 Actors**. Present only in the default list: 0. The 410 in both keep the same order.
- The 64 come from 43 developers. 37 of those have no Actor visible in this search (37 of 191 developers wholly
  hidden); 6 have both hidden and visible Actors.
- The default response contradicts itself (462 vs 410). Trusting `total` would put the hidden share at 2.5% instead of
  13.5%. [INFERENCE] 474 − 462 = 12, exactly the number of rental Actors below, which hints at a two-stage filter. That
  is a guess, not a reading.

**Fields on the hidden 64** [RENDERED]
- No item field marks an Actor as unrunnable, deprecated or not KYC-verified. `badge` is null on all 474 items.
- `notice` does not separate the sets: NONE 58, UNDER_MAINTENANCE 5, null 1, against 385 / 16 / 9 among the visible.
- `pricingModel`: the hidden 64 are 44 PAY_PER_EVENT, 12 FLAT_PRICE_PER_MONTH and 8 FREE. The visible 410 are 409
  PAY_PER_EVENT and 1 FREE. **All 12 rental and 8 of the 9 FREE Actors are hidden.**
- `isWhiteListedForAgenticPayments` is true on 32 of the hidden 64 and on 338 of the visible 410.
- The hidden Actors are live: 61 of 64 last ran in 2026-09, and 45 of 64 had at least one user in the last 30 days.
- Titles are Israel scrapers (e.g. "Israeli Job Boards Scraper", "Yad2 Property Search Scraper"). Usernames are not
  copied here: most are personal-name handles.

**What the parameter hides** [RENDERED, GitHub]
- `apify-api/openapi/paths/store/store.yaml:97-101`: *"By default, search results exclude Actors that are not safe to run
  automatically (e.g. Actors from developers who haven't passed KYC, or full-permission Actors without a large user base)."*
- `sources/_partials/_agentic-payments-eligibility.mdx:5,8`: a whitelisted Actor must *"Run with limited permissions"*,
  and its *"developer must also have completed identity verification (KYC)"*.
- [INFERENCE, assuming the flag is current] The 32 hidden Actors flagged whitelisted are hidden for neither named reason.
  41 of the 64 belong to KYC-passed developers. **Passing KYC is necessary but not sufficient to be visible.**

**KYC requirements** [RENDERED, GitHub]
- `sources/platform/actors/monetizing/monthly-payouts.mdx:48-49` asks individuals for *"the full name that matches your
  legal ID card"* and *"a clear, high-resolution photo of your ID card or driver's license"*.
- `sources/legal/latest/terms/store-publishing-terms-and-conditions.md:123` adds proof of address, tax documentation and
  beneficial-ownership information.
- Neither file has selfie, liveness or video wording. [INFERENCE] Verification is document-only as written; the
  vendor's live screens are not rendered.

**Our Actor** (`products/apify-il-open-data`, `israel-open-data-api`)
- It appears in neither capture because it is unpublished (the Publish click is still an open owner step).
- `actor.json` says it is *"Free while we measure demand"* and declares no permission level.
- [INFERENCE] As it stands, it falls into the most-hidden class here: FREE (8 of 9 hidden) and from an unverified
  developer (a named cause). So the "stranger runs: biased low while the developer is unverified" label is confirmed,
  and for a FREE Actor the bias may be close to total.
- [INFERENCE] Q5 item 3 moves verification to the Publish sitting, since the docs show document-only verification. That
  alone may not make the Actor visible: enabling pay-per-event pricing and confirming limited permissions are the other
  levers this correlational data points to.

**Reading for Q5:** 64/474 hidden by default (13.5%); 37/191 developers wholly hidden; 8/9 FREE Actors hidden.

**Next check (named by the ruling), done:** the KYC read is at `apify/apify-docs` →
`sources/platform/actors/monetizing/monthly-payouts.mdx` (§ "Verify your identity"). Still to do: read
`sources/platform/actors/development/permissions` there for the default permission level of a new Actor.
