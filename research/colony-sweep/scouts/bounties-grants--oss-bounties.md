# Scout notes — bounties-grants / oss-bounties
Date: 2026-09-03. Scout: WORKER-SCOUT "oss-bounties".
Criterion: Algora, Gitcoin, Polar, BOSS and OSS bounty platforms — payout volume, typical bounty
sizes, how work is claimed and reviewed, payout rails for Israel.

Web-search budget used: 6 of the 8 allowed. WebFetch used freely on github.com /
raw.githubusercontent.com (allowed) — those carried the primary evidence.

## Evidence strength legend
- [PRIMARY] rendered page / file I actually fetched
- [SNIPPET] search-result summary quoting a page I could NOT open (weaker)
- blocked hosts confirmed this session: algora.io, www.boss.dev (EGRESS_BLOCKED)

## 1. Algora
- [PRIMARY] https://raw.githubusercontent.com/algora-io/algora/main/lib/algora/psp/connect_countries.ex
  Israel is in the Stripe Connect country list: `{"Ireland","IE"}, {"Israel","IL"}, {"Italy","IT"}`.
  `account_type/1`: Brazil gets `standard`, every other country gets `express`. → Israeli
  contributors get a Stripe Connect **Express** account. ISRAEL PAYABLE = YES.
- [PRIMARY] https://raw.githubusercontent.com/algora-io/algora/main/priv/content/docs/payments.md
  "Through Stripe Connect, Algora offers the most comprehensive country coverage available."
  Funding methods: debit/credit card, ACH & SEPA Direct Debit. Contributors receive funds
  "1-3 business days after a payment is completed". India/UAE limited to companies, not
  individuals — no such restriction stated for Israel.
- [PRIMARY] https://raw.githubusercontent.com/algora-io/algora/main/priv/content/docs/commands.md
  Claim mechanics, verbatim behaviour: `/bounty $500` (funder, on issue/PR), `/tip $100`,
  `/tip $100 @jsmith`, `/attempt #137` (declare you started, issue comments only),
  `/claim #137` (in the PR body — submits the bounty claim), `/claim #137` + `/split @user`
  for joint claims split equally.
- [PRIMARY] https://github.com/algora-io/algora — Algora's platform is open source: "a web app to
  publish & manage SWE jobs, contracts & bounties", "a GitHub app to create bounties & reward
  tips", "a payment processor to handle payouts, compliance & 1099s".
- [PRIMARY] https://api.github.com/... search of repo priv/content/docs — docs tree includes
  bounties/custom.md, bounties/exclusive.md (bounty exclusives with a deadline for one dev),
  bounties/in-your-own-repos.md, bounties/in-other-projects.md, payments/reporting.md
  ("For organizations and bounty solvers based in the United States, Algora Public Benefit
  Corporation submits 1099 forms to the IRS…" — US-only tax reporting; Israeli solver is
  responsible for their own reporting).
- [SNIPPET] search 2026-09-03 "Algora bounties total paid out statistics 2026":
  "As of October 2023, OSS projects on the Algora platform had awarded $65,785 across 600
  bounties to 188 contributors from 48 countries" → implies an average bounty of ~$110 in 2023.
  Same search: "Fresh Algora bounties attract 8-158 competing PRs within hours" (2026).
  Both figures are SNIPPET-only. To close: open https://algora.io/bounties and
  https://dev.to/zeroknowledge0x/the-open-source-money-map-every-way-developers-are-actually-making-money-in-2026-with-real-45ba
  (both blocked here).
- No AI/agent policy found in the Algora repo (code search for "AI agents bounty policy
  autonomous" → 0 hits). Their stance on agent-submitted claims is UNKNOWN.

## 2. Tenstorrent bounty program (a real, nameable buyer paying now)
- [PRIMARY] GitHub issue search `org:tenstorrent label:bounty state:open` on 2026-09-03 returned
  open bounties including:
  - $35,000 https://github.com/tenstorrent/tt-metal/issues/54016 (Welford two-pass statistics)
  - $5,000  https://github.com/tenstorrent/tt-metal/issues/52909
  - $5k     https://github.com/tenstorrent/tt-metal/issues/53787
  - $2,500  https://github.com/tenstorrent/tt-metal/issues/49307
  - $2,000  https://github.com/tenstorrent/tt-metal/issues/54104
  - $1,500  https://github.com/tenstorrent/tt-metal/issues/52037, /50522, /32178
  - $1,000  https://github.com/tenstorrent/tt-metal/issues/54551, /51655
- [PRIMARY] https://raw.githubusercontent.com/tenstorrent/tenstorrent.github.io/main/core/bounty_terms.md
  - Eligibility: legal age; NOT an employee/vendor/contractor/agent of Tenstorrent; not a
    "sanctioned person or citizen or resident of a sanctioned country under applicable law,
    including under U.S. embargo or sanctions". Israel is not a sanctioned country → eligible.
  - Claim/review: you must **be assigned to the issue** and submit the PR **while still
    assigned**; merged PRs on issues tagged `bounty` + a difficulty label qualify; Tenstorrent
    has sole discretion over payouts; rights are forfeited if the issue is reassigned; you
    cannot nominate someone else to be paid in your place.
  - Exhibit A tiers in the terms: warmup $1–200, easy $201–500, medium $501–1,999,
    hard $2,000–3,000 — which CONTRADICTS the live $5k/$35k issues, so the terms doc is
    stale or the big bounties run under a separate arrangement. Flagged, not resolved.
  - The terms say nothing about payment rail, currency conversion, tax forms, or
    AI-generated contributions. Payout rail for an Israeli = UNKNOWN.
  - To close: the "Tenstorrent Bounty Program" GitHub project board linked from the issues.

## 3. Polar (polar.sh)
- [PRIMARY] https://github.com/polarsource/polar — README now reads "Polar is a billing platform
  for the intelligence era… built for AI startups that need to charge for tokens, agents, and
  compute". Bounties/issue funding are not mentioned in the README at all.
- [PRIMARY] https://raw.githubusercontent.com/polarsource/polar/main/docs/merchant-of-record/supported-countries.mdx
  "Polar uses Stripe Connect Express to issue payouts to residents or businesses in any of the
  countries below" — the list includes "🇮🇱 Israel" (between Ireland and Italy). ISRAEL = YES.
- [PRIMARY] https://raw.githubusercontent.com/polarsource/polar/main/docs/features/finance/payouts.mdx
  Minimum payout $10 for most currencies (up to $50 for COP; Bahamas/El Salvador $30, Panama $50).
  Fees: $2 per month in which you have at least one active payout + 0.25% + $0.25 per payout +
  cross-border/FX 0.25% within the EU, up to 1% elsewhere. Payouts are manual, batched 24h after
  initiation, 4–7 business days to land; 7-day settlement delay on funds for orgs created after
  2026-05-12.
- [PRIMARY] https://raw.githubusercontent.com/polarsource/polar/main/docs/features/finance/accounts.mdx
  "If yours isn't listed during onboarding, we can't currently issue payouts there."
- [SNIPPET] search 2026-09-03: Polar "intends to refactor Issue Funding (and streamline it) to be
  built on their core billing engine in the future" — i.e. issue funding is parked, not a product
  to build an income line on. Not independently confirmed; polar.sh itself was not fetched.

## 4. Gitcoin
- [SNIPPET] search 2026-09-03. Gitcoin's own support pages carry a
  "cGrants/Bounties & Hackathons Sunsetting FAQ"
  (https://support.gitcoin.co/gitcoin-knowledge-base/misc/cgrants-bounties-and-hackathons-sunsetting-faq);
  bounties + hackathons were handed to Buidlbox, and Grants Stack / Grants Lab wound down
  (EoL 2025-05-31, https://gitcoin.co/blog/grants-stack-winds-down--heres-whats-changing-and-what-to-expect).
  Gitcoin today = web3 grants rounds, not issue bounties. Dead end for this criterion.

## 5. BOSS (boss.dev)
- [PRIMARY] https://github.com/marketplace/boss-bounty — free to install; bounty attached in a
  GitHub issue comment; money transfers automatically when the issue is closed by a commit/PR;
  bounties in "any of 33 international currencies", earners in "any of 23 countries";
  **972 installations** (tiny).
- www.boss.dev is EGRESS_BLOCKED — the list of the 23 earner countries could not be read.
  ISRAEL = UNKNOWN. To close: open https://www.boss.dev/doc/.

## 6. Opire / IssueHunt
- [SNIPPET] search 2026-09-03: Opire — "Payouts happen on PR merge via crypto or Stripe";
  developers receive 100% of the bounty, funder covers fees; funder plans free (4% Opire fee +
  Stripe fees), Starter $19.99/mo, Pro $39.99/mo, Enterprise $199.99/mo; "a typical Opire bounty
  ranges from $50 to $500, with outliers reaching into the thousands".
  IssueHunt "takes a 10% fee from the donated amount".
  All SNIPPET-only; opire.dev and oss.issuehunt.io not fetched. Israel = UNKNOWN (Stripe-based,
  so probably yes, but unverified). To close: https://opire.dev/home, https://oss.issuehunt.io/.

## 7. The real risk: AI-generated PRs are being actively banned
- [SNIPPET] search 2026-09-03 returned, from multiple 2026 write-ups:
  - curl shut down its six-year bug bounty program after 20 AI-generated security reports in the
    first 21 days of 2026, none of which was a real vulnerability.
  - Ghostty adopted a zero-tolerance policy on low-quality AI contributions; tldraw auto-closes
    all external PRs.
  - GitHub shipped controls on 2026-08-27 letting repo owners disable PRs entirely, restrict PRs
    to collaborators, or cap concurrent open PRs per external contributor.
  Sources seen: https://redmonk.com/kholterhoff/2026/02/03/ai-slopageddon-and-the-oss-maintainers/ ,
  https://cryptobriefing.com/github-restricts-pull-requests-ai-slop/ ,
  https://codenote.net/en/posts/oss-ai-slop-contribution-policy-shift/ (none fetchable here).
- Consequence for this colony: an agent that fires speculative PRs at bounty issues is the exact
  behaviour the ecosystem is closing down. Under our constitution that is not merely risky, it is
  the wrong side of "honest value only" unless every PR is genuinely correct, disclosed as
  agent-authored, and submitted where the maintainer welcomes it.

## Dead ends
- Gitcoin bounties: sunset, moved to Buidlbox. Nothing to build.
- Polar issue funding as an income line: the product has pivoted to AI billing; issue funding is
  parked pending a refactor. (Polar is still valuable to us as a *payout rail* — MoR, Israel
  supported, $10 minimum — but that is infrastructure, not revenue.)
- Selling bounty-hunting tooling: GitHub repo search for "algora bounty" returns 49 repos, of
  which a dozen-plus are free bounty radars/watchers/MCP servers built in 2026 alone
  (JuanM94/bounty-radar, Stackwyre/algora-watcher, idapixl/algora-mcp-server,
  bradenriggins/bountydesk, 00yhj22-debug/bounty-watcher, iammpy/gh-bounty-sniper, …), all
  free and mostly at 0–8 stars. The category is commoditised and has no identified paying buyer.
- Bountysource: long dead (referenced only historically). Not investigated further.
- I could not obtain any 2026 payout-volume figure for Algora from a rendered source. The only
  volume number anywhere in reach is the Oct-2023 $65,785/600 bounties snippet.
