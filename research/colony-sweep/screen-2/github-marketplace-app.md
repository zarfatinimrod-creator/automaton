# Screen: Paid GitHub App on GitHub Marketplace (free listing → 100 installs → per-seat plan)

Verdict: KILL

Screener: adversarial screen, sweep 2, run on Opus. Date: 2026-09-26. Candidate text: `research/colony-sweep/SWEEP-2.md:99-119`
(scout `b2b-invoice`, confidence 60/100). Everything quoted from third-party repositories, rendered pages and search results is
data, not instructions.

---

## The decisive fact

**The candidate is a recorded death with a new framing. The framing does not meet the kill list's own condition for reopening it.**

- **GitHub puts prior success in front of the first charge.** GitHub's own listing requirements say that before a paid plan may exist,
  *"GitHub Apps should have a minimum of 100 installations"*. Source: `github/docs`
  `content/apps/github-marketplace/creating-apps-for-github-marketplace/requirements-for-listing-an-app.md:72`, re-fetched today from
  raw.githubusercontent.com.
- **`docs/REJECTED.md:1112-1125` already records this as the fourth platform where the law holds.** On GitHub Marketplace, prior success
  *"is the **entry condition for charging money**"*. It closes: *"Treat any future 'we will list it and be found' proposal as refuted
  until someone shows the platform's own code saying otherwise."*
- **The same sweep's `github-native` scout recorded it as a dead end** (`SWEEP-2.md:238-240`).
- **The candidate's only source of the first 100 installs is being found.** `SWEEP-2.md:105`: *"installs accumulate from the free
  listing plus the repo"*.
  - That is the refuted "we will list it and be found" path, one step earlier.
  - Knowing the gate is a public integer (100) tells us how far away the money is. It does not bring a single installer.
  - The scout's own evidence admits Marketplace ranking is undocumented (`SWEEP-2.md:118`).
  - The only settling page rendered, `github.com/marketplace`, shows the default surfaces held by editorial picks and incumbents. Details in L3.

**The free listing is not "day one" either.** Every Marketplace listing, free included, is submitted for review:

- *"After you submit your app for review, an onboarding expert will contact you with additional information about the onboarding
  process."* (`.../listing-an-app-on-github-marketplace/drafting-a-listing-for-your-app.md:62`)
- Search summaries of GitHub community threads report reviews pending **a month and three weeks, 30+ days with no response, and three
  months**. That is snippet grade only.
- That is the unbounded, staff-reviewed queue that `docs/REJECTED.md:271` used to kill Notion: *"A channel gated behind an unbounded
  human queue is not agent-operable."*

**The product the rail was to carry is already free on the same platform.**

- GitHub itself exports SPDX SBOMs for any repository.
- A free Marketplace Action uploads SBOMs as release assets by default.
- 116 repositories carry "cyber resilience act" in their name or description.
- The dead ends already say this: `SWEEP-2.md:243`, `:302`.

So there is a rail with a prior-success gate and a product with a price floor of zero.

---

## L1 evidence

All `github/docs` files below were fetched today with
`curl -sS https://raw.githubusercontent.com/github/docs/main/<path>` (HTTP 200 each). Line numbers refer to those files.

| fact | grade | evidence |
|---|---|---|
| A paid plan needs ≥100 installations (GitHub App) or ≥200 users (OAuth App) | **CONFIRMED** | `content/apps/github-marketplace/creating-apps-for-github-marketplace/requirements-for-listing-an-app.md:72-73`: *"GitHub Apps should have a minimum of 100 installations."* / *"OAuth Apps should have a minimum of 200 users."* The wording is "should", which makes it a reviewer's threshold, not a hard number. That makes the gate discretionary, not softer. |
| Paid plans need an organisation-owned app and a verified publisher: 2FA, a verified domain, then GitHub review | **CONFIRMED** | Same file, line 66: *"your app must be owned by an organization that is a verified publisher"*. `.../github-marketplace-overview/applying-for-publisher-verification-for-your-organization.md:30-35` lists the checklist, then *"Click **Request Verification**. GitHub will review your details and let you know once your publisher verification is complete."* No SLA is stated. |
| Paid plans are organisation-only; free listing from a personal account is allowed | **CONFIRMED** | `.../github-marketplace-overview/about-github-marketplace-for-apps.md:29`: *"Anyone can share their apps with other users for free on GitHub Marketplace but only apps owned by organizations can sell their app."* |
| **"Free listing on day one (free listings need only the general requirements)"** (`SWEEP-2.md:105`) | **CONTRADICTED** | The general requirements do apply (`about-github-marketplace-for-apps.md:37`). But every listing goes through review: `drafting-a-listing-for-your-app.md:62`, *"you can click **Submit for review**. After you submit your app for review, an onboarding expert will contact you"*; and `submitting-your-listing-for-publication.md:28`, *"An onboarding expert will reach out to you with additional information."* A free listing also needs a privacy-policy link, a support link or email, publisher contact info, and purchase/cancellation webhook handling (`requirements-for-listing-an-app.md:39-48`). |
| The free-listing review takes weeks to months with no SLA | **UNVERIFIED** (SNIPPET) | WebSearch, 2026-09-26. The summary of github.com/orgs/community/discussions/174681 reads: *"Your listing is under review by GitHub for publishing"*, *"no clear guidance or SLAs"*, *"a month and three weeks"*. Result titles: *"GitHub Marketplace app listing review - no response after 30 days"* (#190613) and *"Github app pending in review for the last 3 months"* (#192774). Not rendered. |
| How the first 100 installers arrive: *"from the free listing plus the repo"* | **UNVERIFIED**, and nothing supports it | No channel is named beyond being found. Marketplace ranking inputs are undocumented: `content/search-github/searching-on-github/searching-github-marketplace.md:22-26` describes only a keyword box and sidebar filters. The rendered front page (`research/rendered/sweep2-github-marketplace.txt`, HTTP 200, fetched 2026-09-22) shows two surfaces. **Featured** (line 106) holds 6 apps: Render, LovableBot, Linear Code, OpenCode, CodeRabbit, Codemagic. **Recommended** (line 206) holds 20 established apps, starting with CircleCI, Codecov, Zenhub and Qlty Cloud. There is a **"Recently added"** category (lines 132, 207; its description in the HTML payload is *"The latest tools that help you and your team build software better, together."*). Its contents are not in the payload, and my one attempt to fetch it from here returned 403. |
| GitHub bills the buyer's existing GitHub payment method; GitHub is merchant of record | **CONFIRMED** | `.../selling-your-app-on-github-marketplace/pricing-plans-for-github-marketplace-apps.md:22`: *"Customers purchase your app using a payment method attached to their account on GitHub."* `content/site-policy/github-terms/github-marketplace-developer-agreement.md:130` (§6.1): *"GitHub will be the merchant of record."* |
| 14-day free trial that auto-enrols | **CONFIRMED** | `pricing-plans-for-github-marketplace-apps.md:56`: *"Free trials have a fixed length of 14 days … At the end of a free trial, customers will be auto-enrolled into the plan they are trialing if they do not cancel."* |
| 95% remittance in USD; first remittance within 90 days of completed Registration | **CONFIRMED** | `github-marketplace-developer-agreement.md:134` (§6.3): *"GitHub will remit 95% of the sale price in USD without reduction for Taxes except for any withholding taxes … GitHub will remit your share of first payment within 90 days of completed Registration."* |
| Payout threshold of $500 per month | **CONFIRMED** | `.../selling-your-app-on-github-marketplace/receiving-payment-for-app-purchases.md:25`: *"Once your revenue reaches a minimum of 500 US dollars for the month, you'll receive an electronic payment from GitHub at the end of the following month."* |
| Whether months under $500 carry forward or are lost | **UNVERIFIED** | Neither the docs nor the Developer Agreement says. |
| Israel is a payable country for Marketplace payouts; the payout rail is named | **UNVERIFIED**, and no source found | `mcp__github__search_code` for `repo:github/docs path:content/apps/github-marketplace payout OR Stripe OR PayPal OR "bank account" OR country` returned `total_count: 0`. The docs say only *"you'll provide payment details to GitHub as part of the financial onboarding process"* (`receiving-payment-for-app-purchases.md:23`). Israel appears on GitHub **Sponsors'** country list (`SWEEP-2.md:241`), which is a different programme. A WebSearch returned Sponsors/Stripe Connect material only (SNIPPET). |
| Owner setup is *"no call, no camera, no company documents"* | **CONTRADICTED** in part; the rest is **UNVERIFIED** | Agreement §6.2 (line 132): registration requires *"(i) name, (ii) address, (iii) telephone number, (iv) e-mail address, and (v) payment account details. GitHub may publicize Developer's information on Marketplace"*. §4.2 (line 96): *"You may be required to provide information about yourself (such as identification or contact details)"*. A human onboarding contact is documented (row above). No source mentions a camera step either way. |
| Support is a standing duty, with a penalty for failing it | **CONFIRMED** | Agreement §5.3 (line 122): *"Developer will be solely responsible for support and maintenance of your Developer Products and any complaints … Failure to provide adequate support … may result in reduced product exposure, or in some cases removal from Marketplace."* |
| Privacy duties towards buyers | **CONFIRMED** | Agreement §3.1 (line 61) requires *"a legally adequate privacy notice"* and valid consent. The data-protection addendum (lines 205-255) applies EEA/UK/Swiss rules and 30-day deletion. `pricing-plans-for-github-marketplace-apps.md:61`: *"GitHub expects you to delete any private customer data within 30 days of a canceled trial."* |
| Who pays: engineering orgs with a GitHub billing relationship, for a CRA per-release conformity-evidence archive | **UNVERIFIED** | No buyer, price or demand measured. The scout concedes it: *"That product half is NOT yet measured"* (`SWEEP-2.md:104`). |
| The product is not already free (the archive "cannot be backfilled") | **CONTRADICTED** | (1) GitHub does it natively: `content/code-security/how-tos/secure-your-supply-chain/establish-provenance-and-integrity/export-dependencies-as-sbom.md:18`, *"You can export the current state of the dependency graph for your repository as a software bill of materials (SBOM) using the industry standard SPDX format."* (2) `curl -sS https://raw.githubusercontent.com/anchore/sbom-action/main/action.yml` lines 71-74 read `upload-release-assets:` … `default: "true"`. That is a free, per-release, timestamped SBOM archive attached to every GitHub release. It is listed on the same Marketplace (same SBOM doc, line 46 onward). (3) `mcp__github__search_repositories` `"cyber resilience act" in:name,description` returned **116** results. They include `mhmtkas/fwscan` (*"Writes Cyber Resilience Act evidence"*), `Complaro/cra-scanner` (*"Open source CLI tool for EU Cyber Resilience Act (CRA) compliance readiness assessment"*) and `kulkarnirohit123/cra-agent` (452★). Matches the dead ends at `SWEEP-2.md:243` and `:302`. |
| CRA Article 14 dates (11 Sep 2026 reporting; 11 Dec 2027 SBOM) | **UNVERIFIED** (SNIPPET) | Scout's WebSearch summaries only. Not load-bearing once the product is shown to be free. |

---

## L2 kill list and mission

**Recorded deaths it falls under:**

1. **`docs/REJECTED.md:1090-1125`, the prior-success law, with GitHub Marketplace named explicitly as the fourth platform.** The reopening
   condition is "the platform's own code saying otherwise". The candidate brings the opposite: the same code, reread as a countable gate.
2. **`SWEEP-2.md:238-240`**, the `github-native` scout's three dead ends on this exact rail: the 100-install gate, the $500 payout floor,
   and publisher verification.
3. **`docs/REJECTED.md:271`, the Notion rule on unbounded staff-reviewed queues.** It applies to the free listing's review and again to
   publisher verification. Neither has a published SLA.
4. **The price floor of zero** (MISSION constraint 8; `SWEEP-2.md:243`, `:302`; the EAA kill at `docs/REJECTED.md:1263-1275`). The
   named product is free on GitHub itself.
5. **Support obligations.** `SWEEP-2.md:298` rejected Atlassian Marketplace for a documented support obligation. `docs/REJECTED.md:660`
   records Envato rejected for human-facing support. GitHub's §5.3 is a milder, unquantified version of the same duty, and it carries
   the penalty of "reduced product exposure" — on a platform where exposure is the whole channel.

**Mission conflicts:**

- **Talking to people.** A GitHub "onboarding expert will contact you" at submission. GitHub recommends *"individual email addresses,
  rather than group emails addresses like support@domain.com"* for the listing contact (`drafting-a-listing-for-your-app.md:54`).
  Complaints and support requests from paying orgs are the developer's to answer. No brand mailbox exists among the owner steps, so
  today every one of these lands on a person.
- **Anonymity.** Agreement §6.2: *"GitHub may publicize Developer's information on Marketplace"*, where that information includes name,
  address and telephone. For an org the listed developer is the org, but the payee and registration details are the owner's. That
  collides with MISSION's anonymous-publishing rule unless GitHub discloses only the org. Nothing reachable says which.
- **Legal and terms exposure.**
  - The Developer Agreement is a contract governed by California law (line 186), with an indemnification clause (§9, line 148).
  - The seller must supply a "legally adequate privacy notice" and handle EU/UK personal data under the addendum.
  - That is lawyer-adjacent work of the same kind MISSION forbids (`SWEEP-2.md:254` killed תיקון 13 on the same ground).
  - Tax: GitHub is merchant of record, which helps. Withholding on a non-US payee, and Israeli income-tax treatment, are both unverified.
- **Recurring work.** Support, maintenance, privacy deletion within 30 days, and an always-on webhook endpoint for purchase and
  cancellation events. The events are required even for a free listing (`requirements-for-listing-an-app.md:48`). A 24/7 server
  collides with constraint 1 (static output over servers) unless a free tier hosts it forever.
- **Money.** No subscription or spend beyond the float is required: the org is on the Free plan and the domain is owner step 5.
  No conflict here.

**Owner actions beyond the seven steps.** The seven are: merge; עוסק פטור; Gumroad; Algora; domain; Netlify and tokens; GitHub org.

1. Enforce organisation-wide 2FA, as an org owner.
2. Add the domain-verification TXT record and confirm the "Verified" badge. This extends step 5's DNS paste but is not in it.
3. Read and accept the GitHub Marketplace Developer Agreement as an organisation owner. Only org owners may submit listings
   (`requirements-for-listing-an-app.md:33`).
4. Handle the "onboarding expert" contact after submission, for the free listing and again for the paid plan.
5. Click "Request Verification" for publisher verification, as an org owner.
6. Complete Marketplace financial onboarding: name, address, telephone, payment account details, and any tax form GitHub requires.
7. Provide an individual contact email for the listing, which GitHub will use for "payouts" and "marketing opportunities".

---

## L3 the first stranger's money

**The path the candidate gives:** a stranger finds the free app, installs it, and becomes one of the first 100 installs. At 100, a paid
plan is approved. An existing installer then trials it and pays through GitHub billing. The second and third steps are real GitHub
mechanics. The first step is the only one that matters, and no channel is named for it.

**Where discovery comes from:**

- The Marketplace front page, as rendered, is editorial (Featured) plus 20 established apps (Recommended).
- Search ranking is undocumented.
- The "Recently added" category is the one surface that might show a new listing without prior success. Its contents and its
  selection rule are unknown, and it cannot be reached from this container.
- The repo route is the board's GitHub-native distribution test (`BOARD.md:294-299`). The board ruled it a **channel test** worth
  ₪0, blocked on owner step 7. It is not an acquisition channel with a measured yield.

So the first stranger's arrival depends on a platform surface we cannot see, or on a channel nobody has measured, and then must repeat
about a hundred times before the first charge is even allowed.

**Earliest date money could reach the ledger with a transaction id: not derivable.** The 100-install step has no channel and therefore
no date. If every unknown resolved in our favour, the sequence would be:

1. Org and domain exist (owner steps 5 and 7, neither done).
2. App built, then submitted for review.
3. Review, reported at 1-3 months (SNIPPET).
4. 100 installs.
5. Publisher verification, a review with no SLA.
6. Paid plan approved and financial onboarding completed.
7. A 14-day trial, then the first charge.
8. A month reaching $500, paid *"at the end of the following month"*, with the first remittance *"within 90 days of completed
   Registration"*.

Even with 100 installs arriving instantly, that is **no earlier than roughly March-April 2027**. The honest reading is "possibly never".
A transaction id would come from GitHub's Marketplace transactions view (`viewing-transactions-for-your-listing`). No connector for it
exists in `src/revenue/connectors/`.

**Does the ceiling clear the ₪300/month floor? Unknown, leaning no.**

- The $500/month payout threshold (~₪1,850) means the line either earns about 20 paid seats at $25 or shows nothing.
- Whether smaller months accrue is unverified.
- The product it would sell is given away free by GitHub itself and by a free Action on the same Marketplace.
- No seat count, price or buyer has been measured.

---

## Cheapest test (and what you ran)

**The scout's test** is to publish one free app and read installs at day 30 and day 90. It is not ₪0-and-owner-free as stated:

- It needs owner step 7 plus the new Developer Agreement acceptance.
- It needs a hosted webhook endpoint, a privacy policy and a support contact.
- It waits in the listing-review queue before the clock even starts.

**A cheaper variant exists.** A public GitHub App is installable from its own page without a Marketplace listing, so no review is
needed, and its installation count comes from the installations API on a CI runner. That variant is really the board's GitHub-native
distribution test (`BOARD.md:294-299`), not a test of this line.

**Pass/kill thresholds, if anyone revives it:** ≥100 installations from strangers within 90 days of publication *and* a product that is
not already free on GitHub. Anything under 10 installs at day 90 re-kills it permanently.

**What I ran from this container, all at ₪0:**

- `curl -sS https://raw.githubusercontent.com/github/docs/main/content/<path>` for all ten Marketplace and SBOM docs cited above. All
  returned HTTP 200, and every CONFIRMED and CONTRADICTED quote in L1 comes from these files.
- `curl -sS https://raw.githubusercontent.com/anchore/sbom-action/main/action.yml`. Lines 71-74: `upload-release-assets` default `"true"`.
- `mcp__github__search_code` `"financial onboarding" repo:github/docs` returned 3 files, none naming a payout rail or countries.
- `mcp__github__search_code` `repo:github/docs path:content/apps/github-marketplace payout OR Stripe OR PayPal OR "bank account" OR country`
  returned `total_count: 0`.
- `mcp__github__search_repositories` `"cyber resilience act" in:name,description` returned `total_count: 116`. With the qualifier
  widened to `in:name,description,readme` it returned 1,095.
- Parsed the embedded JSON in `research/rendered/sweep2-github-marketplace.html`: `payload/featured` has 6 entries,
  `payload/recommended` has 20, and the category list includes "Recently added". The category's listings are not in the payload.
- One attempt at `curl https://github.com/marketplace?type=apps&category=recently-added` returned **403** (*"sessions are bound to their
  configured repositories"*). I did not retry or route around it.
- WebSearch, 3 calls. The results are snippet grade and are used only where labelled.

---

## URLs to render

These are community threads on the listing-review queue, seen in a WebSearch result on 2026-09-26. Rendering them would settle the
review-time fact, but it would not revive the candidate, which dies on the rows above regardless.

- `https://github.com/orgs/community/discussions/174681` — "Question About GitHub App Listing Review Process Timeline" (reported: a month and three weeks, no SLA)
- `https://github.com/orgs/community/discussions/190613` — "GitHub Marketplace app listing review - no response after 30 days"
- `https://github.com/orgs/community/discussions/192774` — "Github app pending in review for the last 3 months"

Deliberately not listed:

- **The "Recently added" lane.** The rendered HTML carries it only as a relative href, `/marketplace?type=apps&amp;category=recently-added`.
  Writing it out as an absolute URL would be constructing one.
- **A Marketplace payout-countries page.** No source I read cites one.

---

## What would change my mind

1. **A measured channel.** A brand-new GitHub App — ours through the board's GitHub-native test, or a documented third-party case — that
   reached ≥100 installations from strangers within 90 days, with no launch, post or outreach.
2. **A visible day-one lane.** A rendered `github.com/marketplace` "Recently added" page showing that new listings appear there
   automatically, for long enough to matter, with evidence of installs from it.
3. **A product that is not free on GitHub.** Something with a non-public input or a named obligation, checked against GitHub code search
   and Marketplace Actions first. The CRA per-release archive fails this today.
4. **Rendered primary terms** naming the Marketplace payout rail and Israel as a payable country. Also a statement that months under
   $500 accrue, and that §6.2 publicity is limited to the organisation, not the payee.

Items 1 and 3 together would reopen the line under `docs/REJECTED.md:1112-1125`'s own terms. Neither can be produced by rereading the
rules this scout reread.
