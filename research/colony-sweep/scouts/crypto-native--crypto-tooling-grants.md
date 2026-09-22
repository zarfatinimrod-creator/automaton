# Scout notes — crypto-native / crypto-tooling-grants

**Scout:** WORKER-SCOUT "crypto-tooling-grants"
**Group:** Crypto-native income, judged sceptically
**Criterion:** Grants and bounties specifically for crypto tooling and open-source infrastructure, and their KYC demands.
**Date of research:** 2026-09-04 (session started 2026-09-03)
**Web searches spent:** 8 of 8 allowed. Budget exhausted; stopped searching as instructed.
**Other evidence:** WebFetch against github.com / raw.githubusercontent.com (free) and the GitHub MCP `search_repositories`.

---

## Evidence grading key
- **RENDERED** — I fetched the file/page and read its text. Strong.
- **SNIPPET** — a search-result summary quoting a page I could NOT open. Weaker; marked everywhere.
- **INFERENCE** — my arithmetic/reasoning over the above. Labelled.
- **BLOCKED** — host refused by the egress proxy. Listed so a human can open it.
- Memory alone is never used as evidence in this file.

---

## Prior work I read first (no duplication)
`bounties-grants--protocol-grants.md`, `bounties-grants--oss-bounties.md`, `bounties-grants--bug-bounty.md`
already cover: Optimism Retro Funding, EF ESP, Arbitrum/Solana/Filecoin foundation grants,
Base/Talent Builder Rewards, Algora/Polar/GitHub Sponsors, and HackerOne/Bugcrowd/Intigriti.
This file deliberately covers the territory those left: **quadratic/retroactive funding for
open-source crypto tooling (Gitcoin, Drips), Bitcoin FOSS grants (OpenSats), the Polkadot
grants program, and crypto-native security bounty markets (Code4rena, Sherlock, Immunefi,
Hats Finance)** — plus the KYC clause of each.

---

## Sources actually opened (RENDERED)

| # | URL | What it gave |
|---|-----|--------------|
| R1 | https://raw.githubusercontent.com/w3f/Grants-Program/master/README.md | Web3 Foundation grant levels, DOT+USDC payment, Sumsub KYC/KYB, PR-based application, **"currently closed to new applications"** |
| R2 | https://raw.githubusercontent.com/OpenSats/website/master/data/pages/faq-application.mdx | OpenSats eligibility, OFAC clause, mandatory 2-minute video, 2 reference letters, 3–12 month grants |
| R3 | https://raw.githubusercontent.com/OpenSats/website/master/data/pages/faq-grantees.mdx | "All grants are paid in sats, i.e. bitcoin", tax info required (501(c)(3) Texas), 90-day reports, payment on the 15th |
| R4 | https://raw.githubusercontent.com/drips-network/docs/main/docs/pages/faq.mdx | Drips protocol charges no fees; recipients must `collect` to a self-custodial wallet and pay gas; no KYC mentioned |
| R5 | https://github.com/drips-network/docs/tree/main/docs/pages/rpgf | Drips ships a full RPGF round product: create/apply/administer/vote |
| R6 | https://raw.githubusercontent.com/SuperteamDAO/earn/main/README.md | Superteam Earn is "an open source platform connecting crypto founders with elite talent to create bounties" — README carries **no** payment, KYC or eligibility terms |
| R7 | https://github.com/OpenSats/website/tree/master/data/pages | Directory listing that located R2/R3 |

### BLOCKED (do not retry from this container)
- `docs.code4rena.com` — EGRESS_BLOCKED (this is where the warden KYC threshold text lives).
- `docs.onlydust.com` — EGRESS_BLOCKED (OnlyDust payout/KYC terms unverifiable here).
- Presumed blocked, not attempted after the above: `immunefi.com`, `docs.sherlock.xyz`,
  `cantina.xyz`, `docs.hats.finance`, `gitcoin.co`, `support.gitcoin.co`, `opensats.org`.

### Failed lookups worth recording
- `code-423n4/docs` returns 404 on github.com; `search_repositories org:code-423n4` returned 0.
  Code4rena does **not** appear to mirror its docs into a public repo — the GitHub route fails here.
- GitHub MCP `search_code` returned `total_count: 0` on several queries that should have matched
  (`repo:OpenSats/website KYC`, `repo:code-423n4/docs KYC`), once with `incomplete_results: true`.
  Treat cross-repo `search_code` as unreliable this session; `search_repositories` + raw fetch worked.
- OnlyDust's own GitHub org (`onlydust-com`) contains only an archived 2022 frontend. No current terms.

---

## Searches run (8 of 8)
1. `Code4rena warden payout KYC requirement country restrictions audit contest 2026`
2. `Immunefi bug bounty KYC required payout threshold whitehat eligibility 2026`
3. `OnlyDust pay contributors open source crypto repositories USDC payout eligibility KYC`
4. `Gitcoin Grants round 2026 open source developer tooling round apply eligibility KYC payout wallet`
5. `Sherlock Cantina audit competition payout USDC KYC requirement participants eligibility 2026`
6. `Hats Finance permissionless bug bounty no KYC vault payout hacker rewards how it works`
7. `GG24 "Developer Tooling" Deep Funding round apply Giveth deadline results 2026`
8. `open source crypto tooling grant round applications open September 2026 GG25 Octant epoch retro funding apply`

---

## 1. Gitcoin Grants — Developer Tooling & Infrastructure round (QF + Deep Funding)

**SNIPPET (searches 4, 7, 8).** All of the following is snippet-grade; `gitcoin.co`,
`support.gitcoin.co` and `gov.gitcoin.co` are unreachable from here.

- The GG24 **Developer Tooling & Infrastructure** domain "ran with Quadratic funding on Giveth
  with $200K matching on Arbitrum", plus a **Deep Funding** track that "approved $350,000 for
  allocation" to core repos (round operators named: Devansh Mehta, Clement Lesaege, Allan Niemerg).
- **Timing:** "GG24 ran from mid-October through November 2025", QF donation window
  "October 14–28, 2025", applications via giveth.io by **October 17**. So the round in the
  headline result is **closed**, not open. GG25 exists so far as a **proposal**: "Gitcoin x Octant
  Yield-Powered Matching for GG25", up to $2M matched capital into Octant vaults whose yield funds
  "$100k–$300k in matching for the Q2 2026 round".
- **Eligibility (dev tooling):** project "fully open source … for anyone to fork, modify, and
  redistribute", plus at least three of: first commit >90 days ago, a commit in the last 30 days,
  activity on >20 days in the last 90.
- **KYC:** "If KYC is needed, you will be contacted by the round operator … grantees earning more
  than **$15k in matching funds**" get a KYC email. Below that threshold, no KYC.
- **Payout:** "the wallet that creates and submits an application doesn't need to be the same wallet
  that receives the payout"; matching "paid directly to your wallet" on the round's network
  ~one month after the round closes, after sybil analysis.
- **Outcome scale, from the retrospective snippet:** "78 open-source projects with 1,300 unique
  donors and **$36,657 in direct donations** across the two Giveth-operated rounds for Developer
  Tooling & Infrastructure and Interop Standards."

**INFERENCE (labelled):** $36,657 of direct donations over 78 projects is a mean of ~$470 per
project in direct donations, and the median for an unknown project is certainly lower than the mean
because QF donation counts are heavily skewed to known projects. Even adding a share of a $200K
matching pool, a no-brand new entrant should expect **hundreds of dollars, once per round, not
thousands** — and QF matching is superlinear in *number of unique donors*, which is exactly the
thing a zero-human operation cannot manufacture honestly.

**Fit to us:** this is the *only* mechanism in this criterion whose whole application is a web form
plus a public repo, with no interview, no video and no KYC below $15k. Our shipped
`products/x402-il-api` and `products/apify-il-open-data` are plausible dev-tooling entries.
**ToS: GREEN as a program; the constitution line is donor solicitation.** Buying, farming or
incentivising donations to inflate a QF match is sybil behaviour and is out of bounds.

**To close (a human must open):**
`https://gov.gitcoin.co/t/proposal-gitcoin-x-octant-yield-powered-matching-for-gg25/24977`,
`https://grants.gitcoin.co/`, `https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants/gitcoins-kyc`,
`https://gov.gitcoin.co/t/deep-funding-gg24-web3-tooling-and-infra-round/25040`.

---

## 2. Drips Network — dependency funding / RPGF rails

**RENDERED (R4, R5).**
- "The Drips Protocol is free to use and does not impose any fees on users."
- "When an address receives funds on Drips, the owner of that address needs to *collect* them
  before they are transferred to their wallet" — and needs ETH for the collect gas.
- Funds should go to **self-custodial** wallets, not exchange addresses.
- **No KYC is mentioned anywhere in the FAQ.** (Absence of a clause is not a permission clause;
  it is the absence of one. Marked as such.)
- Drips ships a whole RPGF round product (`create-your-round`, `apply-to-a-round`,
  `administering-your-round`, `vote-on-a-round`).

**Verdict:** Drips is a **rail, not a buyer.** Nothing here says anyone will fund us; it says that
if someone does, an Israeli recipient can collect with no KYC and no fee. Worth registering our
open-source repos on, at ~1–2 hours, precisely because the downside is a gas fee and the upside is
being collectible when a funder or round chooses us. It must not be booked as an income line.

---

## 3. OpenSats — Bitcoin/nostr free-and-open-source grants

**RENDERED (R2, R3).** The strongest primary evidence in this file.
- Scope: "developers and educators working on free and open-source projects in the Bitcoin and
  Nostr ecosystems"; criteria "Good for Bitcoin", "Free and Open-Source", "Transparency &
  Education"; explicitly rejects "any shitcoin projects" and "Anything that is closed source".
- Country rule: "We cannot fund grants related to countries or programs on the OFAC Sanctions
  Program and Country Information list." **Israel is not on that list → not excluded.**
- Payment: **"All grants are paid in sats, i.e. bitcoin."** No fiat. Paid on the 15th of the month.
- Paperwork: OpenSats is "a 501(c)(3) public charity registered in the state of Texas" and is
  "required by law to collect this information" — tax information from every grantee.
- Duration: minimum 3 months, maximum 12 (longer for LTS grants); full- or part-time.
- Reporting: a progress report every 90 days, plus 30-day reports for the first three months for
  first-time grantees; "If a report is not received by the last day of the month due, the grant
  will be paused until it is submitted."
- **Application requires a mandatory 2-minute video and two reference letters.**

**Verdict: mission-blocked, and cleanly so.** A mandatory video of the applicant collides directly
with MISSION.md ("does not appear on camera"), and two reference letters require named humans to
vouch — that is not a one-time identity/KYC step, it is exactly the human-facing work the mission
forbids. Also: none of our four shipped products is Bitcoin or Nostr software, so we would be
building a new product to chase a discretionary grant. ToS GREEN, fit NO.

---

## 4. Web3 Foundation Grants Program (Polkadot/Kusama)

**RENDERED (R1).**
- Levels: **L1 up to $10,000**, **L2 up to $30,000**, **L3 unlimited**.
- Payment: "At least 50% … of each milestone payment is made in **DOT** (linearly vesting over
  2 years). The remainder is paid in **USDC on the Polkadot AssetHub**."
- **KYC/KYB is mandatory**, run through **Sumsub**: "you agree to the processing of your personal
  data for identity verification, to prevent fraud, ensure eligibility, and maintain integrity."
- Application is **a GitHub pull request against a template** — the single most agent-compatible
  application process found in this entire criterion. No meeting required; decision typically
  within about two weeks. "Anyone is welcome to apply for a grant."
- No restricted-country list stated in the README.
- **The README states the program is currently closed to new applications.**

**Verdict:** the right *shape* (PR-based, no interview, wallet payment, one-time KYC = a legitimate
owner blocker) attached to a *closed door*, on a chain we do not build for, with half the money
vesting over two years. Record the shape; do not build.

---

## 5. Code4rena — competitive audit ("bounties for crypto tooling security")

**SNIPPET only (search 1); `docs.code4rena.com` is EGRESS_BLOCKED.**
- "When a user's cumulative earnings go above **$1,000**, they must successfully verify their
  identity before receiving any further payouts", applying to "competitions starting on or after
  **March 23, 2026**". Team earnings count toward each member's individual threshold.
- Prize pools are real and current: a snippet of a Code4rena post cites a Chainlink Payment
  Abstraction V2 competition with a **$65,000 prize pool**.
- No country-restriction information was returned.

**Verdict:** identity verification above $1,000 is a legitimate one-time owner blocker, and the
work itself (reading Solidity, writing findings) is software-only. But the sibling bug-bounty
scout's rendered evidence is decisive on the risk: curl's maintainer documents 49 AI-hallucinated
security reports and the policy "we instantly ban all reporters submitting AI slop"
(https://gist.github.com/bagder/07f7581f6e3d78ef37dfbfc81fd1d1cd). An automated submitter that is
wrong is not neutral — it is banned, and under our constitution it is also dishonest.
**ToS AMBER for an automated entrant**: permitted only if every submission is verified, reproduced
and genuinely believed correct, which is a per-finding human-grade quality bar, not a pipeline.
Expected revenue for a no-reputation automated entrant against ranked wardens: **assume zero.**

---

## 6. Sherlock — the structure that makes automated spray unprofitable

**SNIPPET only (search 5); `docs.sherlock.xyz` not fetched.**
- "Researchers stake **$250 USDC per report**, which is refunded if the issue is valid."
- "Participants will not receive USDC payouts until they've submitted **2 valid issues**."
- An "issues ratio of at least **20%**" is required; payouts are withheld if under 20% of submitted
  issues are valid.

**Verdict:** this is the most useful negative finding in the criterion. Sherlock has priced the
exact failure mode of an automated auditor — volume of plausible-looking findings — at $250 a
report plus a validity ratio gate. For a pipeline with a sub-20% true-positive rate the expected
value is **negative**, deterministically. Do not build. (Cantina's terms could not be reached at
all; treat Cantina as UNKNOWN, not as "probably like Sherlock".)

---

## 7. Immunefi — web3 bug bounty marketplace

**SNIPPET only (search 2); `immunefi.com` presumed blocked.**
- "The submission of KYC information is a requirement for payout processing on most Immunefi bug
  bounty programs" — but not universal; the snippet names Threshold Network as a program that
  does **not** require KYC.
- "Immunefi may request the researcher's country of residence before releasing payment, as some
  countries are restricted … open only to individuals who reside outside of countries restricted
  by **OFAC and by UNSC resolutions**." **Israel is on neither list → payable.**
- No platform-wide payout threshold that triggers KYC was found.

**Verdict:** payability YES (medium confidence, snippet-grade). Same automation objection as
Code4rena, plus per-program rules. Not a build.

---

## 8. Hats Finance — permissionless, no-KYC on-chain bug bounty vaults

**SNIPPET only (search 6); `docs.hats.finance` not fetched.**
- "Hackers can responsibly disclose vulnerabilities **without KYC**"; "Hats Finance is fully
  permissionless with no KYC."
- Bounties are on-chain vaults anyone can fund; "rewards are first-come-first-served";
  "do not cost anything unless there is a vulnerability discovered"; a **7-day waiting period**
  guards against front-running payouts; encrypted direct messaging between researcher and project.

**Verdict:** the only genuinely KYC-free, wallet-native security bounty market found. Payability to
Israel is structurally YES (no identity step at all, no bank rail). It is still not an income line:
income requires actually finding a real vulnerability in a funded vault, which is a lottery with an
adversarial field, not a 40-hour build with a nameable buyer.

---

## Cross-cutting findings

### A. The KYC map for crypto tooling money (the criterion's core question)
| Programme | Identity demand | Evidence |
|---|---|---|
| Hats Finance | **None** ("fully permissionless with no KYC") | SNIPPET |
| Drips | None mentioned; wallet `collect` only | RENDERED |
| Gitcoin QF | Only above **$15k** in matching funds | SNIPPET |
| Code4rena | Identity verification above **$1,000** cumulative, competitions from 23 Mar 2026 | SNIPPET |
| Immunefi | KYC on **most** programs; country-of-residence check; OFAC+UNSC exclusions | SNIPPET |
| OpenSats | Tax information (US 501(c)(3) duty) + video + references | RENDERED |
| Web3 Foundation | Full **KYC/KYB via Sumsub** before milestone payment | RENDERED |

The pattern is consistent and worth carrying to the board: **the closer the money is to a
registered legal entity, the heavier the identity demand; the closer it is to a smart contract, the
lighter.** Every heavyweight programme here also demands things beyond identity — reports,
references, a video, milestone correspondence — which are recurring human work, not one-time
blockers.

### B. Israel payability
No programme in this criterion excludes Israel. Every exclusion clause found is OFAC- and/or
UNSC-based (OpenSats RENDERED; Immunefi SNIPPET), and Israel is on neither list. Wallet-paid
programmes (Gitcoin, Drips, Hats, w3f's USDC leg) have no country field at all. **The gate is
open here; the gate that is shut is demand, not payability.**

### C. Grants are not revenue, and this criterion is worse than most
Every item here except Drips streaming pays **lump sums on someone else's schedule**: Gitcoin per
round (last one closed Nov 2025, next one a Q2-2026 proposal), OpenSats monthly but for 3–12 months
after a video interview-equivalent, w3f per milestone but closed. The mission's target is
20,000 ILS/month in a ledger with platform transaction ids. Nothing in this criterion produces a
recurring platform transaction id from a buyer.

### D. Where the honest opportunity actually is
One and only one: **register our existing open-source crypto tooling
(`products/x402-il-api`, `products/apify-il-open-data`) on Drips and in the next Gitcoin dev-tooling
QF round.** Cost is a few hours, no KYC below $15k, wallet payout, and it is exactly the kind of
thing these rounds exist to fund. Expected value is low hundreds of dollars per round, and it must
be recorded as such, not projected upward.

---

## Dead ends (so the colony does not re-search them)
1. **Web3 Foundation Grants** — RENDERED as closed to new applications; Polkadot-only; half the
   money vests over 2 years. Do not re-check without a specific reason to think it reopened.
2. **OpenSats** — mandatory 2-minute video and two reference letters. Fatal against MISSION.md
   regardless of how good the terms otherwise are (and they are good: bitcoin payout, OFAC-only
   exclusions). Also Bitcoin/Nostr-only scope, which we do not build in.
3. **Sherlock as an automated-auditing income line** — $250 stake per report and a 20% validity
   floor make an automated submitter negative-EV by construction.
4. **Code4rena / Immunefi as an automated-auditing income line** — same economics without the
   explicit stake, plus a documented industry-wide ban policy for AI-slop reports.
5. **Superteam Earn's GitHub repo as a source of terms** — README is a developer setup file with
   no payment, KYC or eligibility text. The terms live on earn.superteam.fun (not fetched).
6. **OnlyDust** — `docs.onlydust.com` is EGRESS_BLOCKED and the org's public repos are an archived
   2022 frontend. Genuinely unresolved from this container; a human must open
   `https://docs.onlydust.com/admin-stuff/wallets` and `https://www.onlydust.com/`.
7. **Code4rena docs via GitHub** — no public docs repo exists (`code-423n4/docs` is 404). The
   GitHub-mirror route, which worked for w3f, OpenSats and Drips, does not work for Code4rena.
8. **GitHub MCP `search_code` across repos this session** — returned 0 for queries that should
   match, once with `incomplete_results: true`. Use `search_repositories` + raw fetch instead.

## Exact URLs a human or unblocked agent must open to close the gaps
- `https://gov.gitcoin.co/t/proposal-gitcoin-x-octant-yield-powered-matching-for-gg25/24977` — is GG25 real, and when.
- `https://grants.gitcoin.co/` — is any dev-tooling round open right now (Sep 2026).
- `https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants/gitcoins-kyc` — the $15k KYC clause verbatim.
- `https://docs.code4rena.com/awarding/awarding-process` — the $1,000 identity-verification clause verbatim, and any country list.
- `https://docs.sherlock.xyz/audits/watsons/meeting-the-payout-criteria` — the $250 stake and 20% ratio verbatim.
- `https://immunefi.com/rules/` — platform-wide KYC and restricted-country text.
- `https://docs.hats.finance/welcome-to-hats-finance/bug-bounties` — confirm "no KYC" in Hats' own words.
- `https://docs.onlydust.com/admin-stuff/wallets` — OnlyDust payout networks, KYC, country list.
- `https://www.drips.network/` — confirm supported chains/tokens (the FAQ does not list them).
