# Scout notes — bounties-grants / bug-bounty
**Scout:** WORKER-SCOUT "bug-bounty" · **Date of research:** 2026-09-03
**Criterion:** Bug bounty via authorized programmes only (HackerOne, Bugcrowd, Intigriti): eligibility, KYC, payout to Israel, realistic earnings for automated analysis, and the rules that forbid unauthorized testing.

## Budget and evidence conditions
- Web searches spent: **8 of 8 allowed**. Stopped on budget, not on exhaustion of the question.
- **Every vendor documentation host is egress-blocked**: `www.hackerone.com`, `docs.hackerone.com`,
  `docs.bugcrowd.com`, `kb.intigriti.com`, `securitylab.github.com` all returned `EGRESS_BLOCKED`.
  So **no HackerOne / Bugcrowd / Intigriti page was ever rendered by me**. Everything about their
  payout, KYC and misconduct rules below rests on **search snippets quoting those pages** — weaker
  evidence, explicitly marked. GitHub repo pages *did* render and are the only strong sources here.
- Strong (rendered) sources: `github.com/arkadiyt/bounty-targets-data`, `github.com/disclose/disclose`,
  `github.com/disclose/dioterms`, `github.com/bugcrowd/vulnerability-rating-taxonomy`,
  `github.com/github/securitylab`, `github.com/google/oss-fuzz` (disclosure guidelines).

## What rendered (strong evidence)
- **arkadiyt/bounty-targets-data** — hourly/30-min dumps of in-scope bug bounty targets for HackerOne,
  Bugcrowd, Federacy, Intigriti, YesWeHack. Last update shown: **Thu 09/03/2026 17:00 UTC**.
  Rendered 2026-09-03. https://github.com/arkadiyt/bounty-targets-data
  → Confirms the *scope* data a machine would need is freely available. Scope discovery is not the bottleneck.
- **disclose/disclose (diodb)** — indexes programs and their safe-harbor status; does not itself define terms.
  https://github.com/disclose/disclose
- **disclose/dioterms** — Full Safe Harbor requires four tenets, quoted from the rendered page:
  "Authorisation against anti-hacking laws (CFAA, CMA, equivalent)"; "Exemption from anti-circumvention
  laws (DMCA, equivalent)"; "Exemption from violation of the organisation's own TOS/AUP during security
  testing"; "A statement acknowledging good-faith research".
  → **The legal shield exists only inside a specific programme's written scope.** Anything outside it is
  unauthorized testing, i.e. a criminal-law question, not a ToS question. https://github.com/disclose/dioterms
- **bugcrowd/vulnerability-rating-taxonomy** — VRT defines P1 Critical … P5 Informational; "the recommended
  priority … might apply without context" and can be overridden by "bounty brief restrictions".
  https://github.com/bugcrowd/vulnerability-rating-taxonomy
- **github/securitylab** — rendered: "queries submitted directly to this repository are not eligible for
  bounties"; bounty requests tracked via issues; points at securitylab.github.com/bounties (blocked).
  https://github.com/github/securitylab
- **google/oss-fuzz** disclosure guidelines — rendered, contains **no reward information at all**, only the
  90-day / 14-day-grace disclosure rule. https://github.com/google/oss-fuzz/blob/master/docs/getting-started/bug_disclosure_guidelines.md

## Search-snippet evidence (weaker — the underlying page is blocked to me)
### Payability to Israel
- Snippets of https://www.hackerone.com/blog/Faster-and-better-New-Bank-Transfer-Payment-Feature-for-Hackers:
  bank transfer "in 30 different currencies to almost any country in the world"; methods are
  Bank Transfer, PayPal, Coinbase, plus direct-to-wallet BTC/USDC.
- Snippet of https://www.hackerone.com/sanctions-faq: payments **paused to sanctioned regions**; Russia and
  Belarus balances held; Ukraine explicitly not blocked; country questions go to sanctions@hackerone.com.
  **Israel is not named anywhere in the snippets, in either direction.**
- Intigriti (snippets of kb.intigriti.com): wire transfer, PayPal, crypto; "direct bank transfers in more
  than 30 currencies"; India-specific UPI. No Israel statement seen.
- Bugcrowd (snippets of docs.bugcrowd.com): Bank Transfer and PayPal; Bitcoin for select programs.
- **Verdict: YES, medium confidence.** Israel is not an OFAC-sanctioned jurisdiction and PayPal/SWIFT both
  operate there, and all three platforms pay by ordinary international bank transfer. But I could not render
  a single page saying so. **A human must open these to close it:**
  https://www.hackerone.com/sanctions-faq ,
  https://docs.hackerone.com/en/articles/8399426-payment-faqs ,
  https://docs.bugcrowd.com/researchers/payments/frequently-asked-questions-payment-methods/ ,
  https://kb.intigriti.com/en/articles/3379502-payout-methods

### KYC / identity — the owner blockers
- Bugcrowd (snippet of https://docs.bugcrowd.com/changelog/researchers/verifying-your-identity/):
  identity verification "required for all researchers prior to submitting reports to Managed Bug Bounty
  (MBB) programs — both public and private", requiring **a live selfie capture via webcam** and a
  government-issued ID. → A live selfie is a physical act by the owner. It cannot be automated and it is
  **not** merely a one-time paperwork step; it is a camera step.
- Intigriti (snippet of https://kb.intigriti.com/en/articles/5378971-id-verification-process):
  identity verified through **Onfido**; required for KYC, tax and bookkeeping, before any payout.
- Bugcrowd: "must set up at least one payment method … and after setting up a payment method, must submit
  a tax form" (US tax form, i.e. W-8BEN for a non-US individual).

### The rules that forbid unauthorized and automated activity — decisive for us
- Snippet of https://docs.hackerone.com/en/articles/8466603-misconduct:
  **"HackerOne doesn't tolerate any sort of automated delivery of reports from scanners, scripts, browser
  automation frameworks, etc."**
- Snippet of https://www.hackerone.com/policies/code-of-conduct: "Community Members are permitted to have and
  use one sole account, and are prohibited from sharing, selling, trading, or giving away their account."
- Program-level variation (snippets of hackerone.com program policies): Autodesk — "High volume scanners or
  automated testing tools may be flagged as malicious and result in suspension of your account or banning
  your IP address"; Amazon VRP — automated scanners allowed only if configured to ≤5 requests/second;
  TransUnion — automated scanners prohibited outright; DoS and flooding out of scope across programs.
- AI-assisted testing "must comply with HackerOne's terms and each applicable program's scope, policies, and
  testing restrictions, including limits on automation, request volume, and rate limiting."
→ **This is the finding that governs the whole criterion.** A fully autonomous agent that discovers and files
  reports is exactly the thing the platform bans. The only compliant shape is a human-validated,
  human-submitted report — which the mission forbids the owner from doing.

### Market condition 2026 — the AI-slop crackdown
- Snippets of https://www.bugcrowd.com/blog/bugcrowd-policy-changes-to-address-ai-slop-submissions/ and
  https://www.computing.co.uk/news/2026/security/bug-bounty-platforms-battle-ai-slop:
  Bugcrowd queues up "more than 334% over three weeks"; submissions characterised by "thin evidence,
  templated write-ups, and issues not verified before submission"; Bugcrowd updated submission policies to
  "prioritise verified findings while discouraging speculative automated spam"; HackerOne added semantic
  duplicate detection and program-policy templates letting programs **prohibit fully autonomous AI submissions**.
  Programs reported shut down, paused or restricted: curl, Google, HackerOne, Node.js, Nextcloud.
- GitHub restructured its own bug bounty in 2026: **public payouts cut, top rewards moved to an invite-only
  VIP tier**, explicitly in response to AI-generated report volume
  (https://thehackernews.com/2026/07/github-cuts-public-bug-bounty-payouts.html ,
  https://www.techradar.com/pro/security/github-restructures-bug-bounty-program-following-flood-of-ai-generated-reports —
  headlines/snippets only, pages not rendered).
→ The exact strategy this criterion would have us run is the strategy that broke the market this year, and the
  platforms' countermeasures are aimed at us specifically.

### Realistic earnings
- Snippet of https://bug-bounties.as93.net/learn/bug-bounty-economics-what-hunters-actually-earn/ :
  "$81M annual figure divided by 50,000 earning researchers on HackerOne gives approximately **$1,620 per
  earning researcher per year**" — note this is the blog's own arithmetic, **not a platform-published median**,
  and it is an average over *earning* researchers only (most registered researchers earn nothing).
  ≈ $135/month ≈ **₪500/month** before the long right tail is removed.
- Same source cluster: beginners "$0-500 monthly over 0-12 months"; top 50 HackerOne hackers each >$100k/yr;
  ~9,000 people have ever earned "at least something". These are secondary blogs, not platform data.
→ For a no-brand new entrant with no human operator, **the honest expected value is ₪0**, with a thin tail.

### GitHub Security Lab CodeQL bounties — the one shape that fits us, and it looks closed
- "All For One" rewarded community CodeQL queries that detect whole vulnerability classes; "Bug Slayer" added
  reward on top for using the query to find and fix real OSS vulns. Historic amounts seen in snippets:
  up to $3,000 at launch; $5,500 for a ZipSlip RCE query; up to $7,800 for 8 critical CVEs.
- **A search result explicitly states the CodeQL bug bounty program "is no longer active" / not accepting new
  submissions.** I could not render securitylab.github.com/bounties to confirm — it is egress-blocked.
  **Exact URL a human must open: https://securitylab.github.com/bounties/**
→ Structurally this was the ideal line for us: writing static-analysis queries touches **no live third-party
  system**, so the unauthorized-testing problem vanishes entirely, and the work is pure software. If it is
  genuinely dead, the criterion loses its only green shape. Worth one human minute to check.

## Assessment
Bug bounty is a **dead end for this company as constituted**, for three independent reasons, any one of which
is sufficient:
1. **The platforms forbid our operating model in writing.** Automated delivery of reports is misconduct on
   HackerOne. One account, one human, no sharing.
2. **The mandatory KYC is not a one-time form, it is a live webcam selfie** (Bugcrowd) and an Onfido liveness
   check (Intigriti). The owner does not appear on camera. Even granting that as an allowed identity
   exception, it only unlocks a line that reason 1 already forbids.
3. **The economics are terrible even if 1 and 2 were solved**: ~₪500/month average across *earning*
   researchers, ₪0 median for new entrants, in a market that in 2026 is actively hostile to new automated
   entrants and moving its money to invite-only tiers.
Do not build. Do not "try a few reports to see". Recommend the group spend its remaining capacity on grants
and prize competitions, where the submission is a document rather than an act against someone's servers.
