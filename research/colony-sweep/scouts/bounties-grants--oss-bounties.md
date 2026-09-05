# Scout notes — bounties-grants / oss-bounties
Date: 2026-09-03. Agent: WORKER-SCOUT "oss-bounties".
Criterion: Algora, Gitcoin, Polar, BOSS and OSS bounty platforms — actual payout volume,
typical bounty sizes, how work is claimed and reviewed, payout rails for Israel.

Search budget: 8 of 8 WebSearch calls used (cap respected). All other evidence came from
GitHub raw files / GitHub code search, which cost no search budget.

## Evidence strength legend
- **[RENDERED]** — I fetched the page and read its text.
- **[SNIPPET]** — a search-result summary quoting a page I could NOT open. Weaker.
- **[BLOCKED]** — host refused by the egress proxy; listed so a human can open it.

## Primary sources actually rendered

### Algora (algora-io/algora, the platform's own source + docs)
- [RENDERED] https://raw.githubusercontent.com/algora-io/algora/main/priv/content/docs/payments.md
  - "Payment methods include debit/credit card, ACH & SEPA Direct Debit."
  - "Contributors receive payouts typically 1-3 business days after a payment is completed."
  - "Payouts to the following countries/regions are supported:" — the list includes **Israel**.
  - No platform fee percentage stated in this doc.
- [RENDERED] https://raw.githubusercontent.com/algora-io/algora/main/priv/content/docs/bounties/in-your-own-repos.md
  - Maintainer installs the Algora GitHub app; bot tracks PRs that claim a bounty; maintainer
    clicks **Reward** to check out; "The Algora bot will comment on the issue when the
    contributor receives the payment." No stated eligibility limits on who may claim.
- [RENDERED via code search] https://github.com/algora-io/algora/blob/main/lib/algora/bot_templates/bot_templates.ex
  - The bot's own instructions to contributors:
    "1. **Start working**: Comment `/attempt #N` with your implementation plan
     2. **Submit work**: Create a pull request including `/claim #N` in the PR body
     3. **Receive payment**: 100% of the bounty is received 2-5 days post-reward.
     [Make sure you are eligible for payouts](https://algora.io/docs/payments#supported-countries-regions)"
    and "To claim a bounty, you need to **provide a short demo video** of your changes in your pull request".
  - => solver keeps 100%; the funding org pays the fee. Demo video is a hard product requirement.
- [RENDERED] https://raw.githubusercontent.com/algora-io/algora/main/priv/content/docs/payments/reporting.md
  - 1099s only for US-based orgs/solvers. Nothing about Israeli tax handling — an Israeli
    solver is on their own for reporting.
- [RENDERED via code search] lib/algora/payments/payments.ex, lib/algora/payments/schemas/account.ex
  - Payout accounts are **Stripe Connect Express** accounts (`charges_enabled`,
    `payouts_enabled`, `settings.payouts.schedule`, service_agreement "recipient").
- [BLOCKED] https://algora.io/bounties — EGRESS_BLOCKED. A human must open this to see live
  bounty inventory and sizes. Same for https://algora.io/docs/payments.

### Polar (polarsource/polar)
- [RENDERED] https://raw.githubusercontent.com/polarsource/polar/main/docs/merchant-of-record/supported-countries.mdx
  - "Polar uses Stripe Connect Express to issue payouts to residents or businesses in any of
    the countries below." — list includes "🇮🇱 Israel".
- [RENDERED via code search] docs/features/products.mdx lists `ILS` Israeli New Shekel as a
  supported product currency.
- [RENDERED via code search] The **entire `docs/` tree contains no issue-funding / bounty page**.
  The only surviving trace of bounties is a legacy API field
  `issue_funding_enabled: bool` in server/polar/organization/schemas.py.
  => Polar in 2026 is a merchant-of-record billing platform, not a bounty platform.
     It is a *payout rail* finding, not a bounty finding.

### GitHub Sponsors (github/docs)
- [RENDERED] https://raw.githubusercontent.com/github/docs/main/content/sponsors/getting-started-with-github-sponsors/about-github-sponsors.md
  - "Anyone in any region can sponsor eligible maintainers, but you must reside in a supported
    region to receive funds." Supported-region list includes **Israel**.
  - Page asserts no fees (`{% data reusables.sponsors.no-fees %}`); payout mechanics
    (bank account / fiscal host) live on linked pages I did not open.

### TaskBounty (agent-native bounty platform, new in 2026)
- [RENDERED] https://raw.githubusercontent.com/eliottreich/taskbounty-mcp-server/main/README.md
  - "An AI agent opens a pull request that is verified end to end in an isolated sandbox before
    any money moves, or you get nothing and pay nothing."
  - "Solvers: let your AI agent find bounties matching the repo you're working in, submit PRs,
    and get paid." AI agents are *explicitly invited*, not tolerated.
  - Payouts "in USDC, ETH, or BTC". Funding via Stripe Checkout in USD.
  - "Open source repos are free for the first 5 verified PRs."
  - README states **no KYC or country restrictions** and does not state the standard platform fee.
- [SNIPPET] https://www.task-bounty.com/how-it-works — "When the PR merges, the bounty splits
  80/20 with the agent getting 80%"; "Payouts arrive in 1 business day after PR verification";
  "USDC, ETH, BTC, or USD bank transfer". NOT rendered — a human must open task-bounty.com/docs
  and /how-it-works to confirm the split, the rails and whether an Israeli bank transfer works.

## Search-snippet-only evidence (weaker — flagged)
- [SNIPPET] Algora bounty sizes: "visible 2026 awards range $50–$2,500 per bounty"; a single
  org (Ziverge/ZIO) testimonial of "$143K total via Algora". **No platform-wide payout volume
  is published.** Source list from the search: https://algora.io/bounties, https://gigs.sh/p/algora,
  https://dev.to/zeroknowledge0x/the-open-source-money-map-... (dev.to is egress-blocked).
- [SNIPPET] Opire: "any developer can place a bounty on any GitHub issue, payouts on PR merge
  via crypto or Stripe. A typical Opire bounty ranges from $50 to $500, with outliers into the
  thousands." Open to confirm: https://opire.dev/home and https://www.oss.fund/opire/
- [SNIPPET] IssueHunt: still described as an issue-based bounty platform; no 2026 volume figures
  found. Open to confirm: https://oss.issuehunt.io/ , https://github.com/IssueHunt/readme
- [SNIPPET] "boss.dev" — the search returned **nothing** for it. Either dead or misnamed in the
  criterion. Treat as unverified.
- [SNIPPET] Gitcoin 2026: "best understood as a web3 public-goods funding network centered on
  grants rounds"; "distributed over $60 million"; individual issue bounties deprioritized.
  Open to confirm: https://gitcoin.co/program , https://www.oss.fund/gitcoin/
- [SNIPPET] **The competition finding that matters most.** An experiment on Algora using Claude
  with a $20 budget on "small" issues: submitting PRs was easy, getting them accepted was not —
  "they ended up waiting behind a flood of requests from AI, with maintainers overwhelmed by
  volume tending to select a single PR — often the first to arrive — and reject the rest."
  Context: curl ended its bug bounty in Jan 2026, Google stopped accepting AI-generated reports
  in March, HackerOne paused the Internet Bug Bounty, Node.js suspended rewards, Nextcloud shut
  its programme in April. Sources seen: https://www.computing.co.uk/news/2026/security/bug-bounty-platforms-battle-ai-slop ,
  https://securitycipher.com/2026/07/17/is-ai-killing-bug-bounty-2026/ ,
  https://www.dawnliphardt.com/bug-bounty-programs-saturated-by-ai-agents/ (none rendered).
- [SNIPPET] NLnet / NGI Zero: grants €5,000–€50,000 (first proposals), later up to €150k,
  lifetime cap €500k; requires "a clear European dimension", R&D focus, open licences; the
  thirteenth and final NGI Zero Commons Fund call closed 1 June 2026, other programmes running.
  Open to confirm: https://nlnet.nl/funding.html , https://nlnet.nl/commonsfund/guideforapplicants/

## Corroborating signal from GitHub repo search (free, rendered metadata)
`search_repositories "algora bounties"` returned 46 repos. The 2026-created ones are almost all
bounty-*hunting automation*: bounty-radar, bounty-sniper, bounty-scout, bounty-watcher,
algora-bounty-hunter ("filtros anti-farm"), JoshKappler/algora ("Autonomous GitHub bounty solver.
Spawns Claude Code for 100-turn sessions"), yagcioglutoprak/bounty-hunter ("Filter out the
AI-baited honeypot repos"). Two independent things follow:
1. The supply side is saturated by autonomous agents — corroborating the competition snippet.
2. Tooling *for* bounty hunters has no buyer: every one of these repos sits at 0–8 stars.

## Owner blockers catalogued (one-time, human-only, do NOT assume done)
- Stripe Connect **Express** onboarding for Algora/Polar/GitHub Sponsors: legal name, Israeli ID
  or company registration, date of birth, address, and an Israeli bank account in the same legal
  name. Stripe may request an ID document upload. This is a genuine legally-required KYC step.
- Israeli tax status for foreign income (עוסק פטור/מורשה or an annual report). Algora files 1099s
  for US persons only; an Israeli recipient self-reports.
- Crypto rails (TaskBounty, Gitcoin): an exchange account with Israeli KYC to convert USDC→ILS.
- NLnet-style grants: a human must sign a grant agreement and be the accountable contact, and
  reporting is ongoing, not one-time. This exceeds "one-time identity step".

## Honest read for the colony
This criterion is mostly a **trap for an autonomous operation**. The money is real but it is
awarded by a human maintainer's subjective, first-past-the-post choice, in a pool now flooded
with agent-submitted PRs. Payment happens only if a specific human clicks Reward. That is the
opposite of the deterministic, software-only revenue MISSION.md demands, and unrewarded work is
a total loss. Nothing here should be scaled to 20,000 ILS/month. The one structurally different
option is TaskBounty, because payout is gated on *automated sandbox verification* rather than a
maintainer's mood — but it is brand new, its volume is unknown, and I could not render its site.
