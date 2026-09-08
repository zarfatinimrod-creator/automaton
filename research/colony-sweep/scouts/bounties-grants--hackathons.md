# Scout notes — bounties-grants / hackathons
**Criterion:** Online hackathons with cash prizes that accept solo and AI-assisted entries: real prize pools, judging, and how payouts are made.
**Date of research:** 2026-09-03. **Search budget used:** 8 of 8 allowed (hard stop).

## Evidence-strength key
- **[R]** rendered page I actually fetched (strong)
- **[S]** search snippet quoting a page I could not render (weaker — must be re-opened by an unblocked agent)
- **[3P]** third-party repo transcribing a platform's rules (medium — verbatim quotes, but not the platform's own server)

## Hosts that are EGRESS-BLOCKED from this container (no primary source obtainable)
help.devpost.com, worldslargesthackathon.devpost.com (all *.devpost.com), www.kaggle.com,
dorahacks.io, microsoft.github.io. github.com and raw.githubusercontent.com DO render and
carried the only two rendered sources below.

## Rendered sources [R]
1. https://raw.githubusercontent.com/ducktyper17/velvetmint-diagnostic-agent/16bd3fa83159272a95d2f48224d8dc7d94a09692/00-shared/hackathon-rules.md
   — a participant's transcription of the **Rapid Agent Hackathon** (Devpost, sponsored by Google
   Cloud + Fivetran/Arize/MongoDB/Elastic/GitLab/Dynatrace). Fetched 2026-09-03. Key content:
   - **Solo participation: allowed.**
   - Restricted countries listed: Italy, Brazil, Quebec, Crimea, Cuba, Iran, Syria, North Korea,
     Sudan, Belarus, Russia, Afghanistan, Antarctica, China, Djibouti, Iraq, Kazakhstan, Somalia,
     Venezuela, Vietnam, Western Sahara, occupied Ukrainian territories. **Israel is NOT on the list.**
   - Verbatim AI clause: *"Projects are required to utilize Google Cloud artificial intelligence
     tools ... All other artificial intelligence tools are not permitted."* Prohibited in-project:
     OpenAI, Anthropic Claude, Cohere, Mistral.
   - Requirements: public GitHub repo under MIT/Apache-2.0, working public demo live during judging,
     ≤3-minute demo video on YouTube/Vimeo, submit ≥48h before deadline.
   - Judging: Technological Implementation / Design & UX / Potential Impact / Idea Quality, equal weight.
   - Prize pool amounts were NOT in this document.
2. https://github.com/otaliptus/effe/blob/master/project_plan_v0.md — a builder's plan for
   **ETHGlobal HackMoney 2026** (online). Fetched 2026-09-03. Sponsor cash bounties enumerated:
   Yellow $15,000, Uniswap Foundation $10,000 (two tracks), Sui $10,000, Arc/Circle $10,000,
   LI.FI $6,000, ENS $5,000 = ~$56,000. Finalist pack: **1000 USDC per finalist team member**,
   flight reimbursement, AWS credits. Constraints quoted: projects must start from scratch during
   the event; teams up to 5, each member individually accepted; a small ETH stake to secure a spot.
   (This is [3P] for ETHGlobal's own rules — it is one participant's reading.)

## Search-snippet evidence [S] (URL a human/unblocked agent must open to close the claim)
- Devpost payout mechanics — https://help.devpost.com/article/114-how-to-claim-your-hackathon-cash-prize-winners-only
  Snippet (2026-09-03): winners get an eligibility-verification email from prizes@devpost.com asking
  full legal name, date of birth, city/country of residence, sponsor-employee status. International
  individual winners upload **W-8BEN** (orgs: W-8BEN-E); **non-US winners choose PayPal, Payoneer or
  Wise**, account must accept USD international transfers with no cap below the prize. Without a
  W-8BEN, 30% US withholding by default.
- Devpost generic exclusions — https://worldslargesthackathon.devpost.com/rules
  Snippet: ineligible = residents of Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea, Syria
  and other OFAC-designated countries. **Israel not listed.** Prize pool "$1M+".
- Kaggle rules — https://www.kaggle.com/competitions/arc-prize-2025/rules (and generic Kaggle rules)
  Snippet: entry barred for Crimea, DNR/LNR, Cuba, Iran, Syria, North Korea and OFAC-designated
  residents; **prizes awarded ~30 days after receipt of prize acceptance documents**; team prizes
  split evenly unless the team says otherwise; winners bear all taxes and must supply tax documents.
  **Israel not excluded.**
- DoraHacks payouts — https://dorahacks.io/blog/news/prize-distribution/
  Snippet: organizer dashboard prize distribution; **payout services and compliance handled by Merit
  Systems**; organizer funds by bank transfer or **USDC on Base**; **winners verified through GitHub
  accounts**. Example pools: Injective Illuminate $100K, DomainFi Challenge $1M+ USDC.
- ETHGlobal — https://ethglobal.com/events/ethonline2025/prizes and https://ethglobal.com/rules
  Snippet: finalist team members receive **1000 USDC to verified wallets** (500 USDC at London 2024);
  Classic track work must begin after the hackathon starts; undisclosed pre-existing work =
  disqualification, prize revocation, ban.
- AI-authorship policy — https://www.hackerearth.com/lp/challenges/microsoft-build-ai
  Snippet: the solution "must clearly demonstrate meaningful human creativity, judgment, and
  engineering — AI-generated boilerplate alone does not constitute a good submission." AI tools are
  allowed as assistants; no blanket ban found anywhere in the 2026 results.
- Live 2026 events with cash, online, solo-friendly (snippets, 2026-09-03):
  - Qwen Cloud Global AI Hackathon Series — https://qwencloud-hackathon.devpost.com/ — "$70,000+ in
    cash and cloud credits across five tracks" (cash/credit split unverified).
  - AssemblyAI hackathon, Sept 1-30 2026 — $10,000 pool stated as $5k cash + $5k AAI credits.
  - Alpaca Trading Agents hackathon, Aug 28-Sep 4 2026 — $6,000 pool.
  - RevenueCat Shipaton 2026 — https://revenuecat-shipaton-2026.devpost.com/rules (rules page exists;
    prize structure unverified).
  - Google Cloud "Agents for Impact" — https://cloud.google.com/resources/agents-for-impact-2026 —
    Phase III **digital** hackathon Jan–Mar 2027, rolling submissions, cash prizes.
  - All Things Agentic — https://allthingsagentichackathon.devpost.com/ ; DevNetwork AI+ML 2026 —
    https://devnetwork-ai-ml-hack-2026.devpost.com/ ; UC Berkeley AI Hackathon 2026 —
    https://ai-hackathon-2026.devpost.com/ (solo teams allowed; 1st $1,500 / 2nd $1,000 / 3rd $500).

## Payability to Israel — verdict
**YES**, on both rails, but only at snippet strength:
- Fiat (Devpost-administered / Kaggle / sponsor-paid): Israel appears on no exclusion list I saw;
  payout via PayPal / Payoneer / Wise after a W-8BEN. All three serve Israel.
- Crypto (ETHGlobal, DoraHacks): USDC to a self-custodied wallet; no country gate beyond sanctions.
Open item a human must close: read the actual eligibility clause of each specific hackathon before
entering — exclusion lists vary a lot per sponsor (the Rapid Agent list excludes Italy and Kazakhstan;
the Bolt list excludes Brazil and Quebec). Israel was absent from every list seen, but per-event.

## Owner blockers (one-time, human-legally-required)
1. Winner eligibility form: full legal name, date of birth, country of residence (Devpost).
2. Signed **W-8BEN** (individual) — required to avoid 30% US withholding.
3. A payout account in the owner's own legal name: PayPal, Payoneer or Wise, USD-capable.
4. For crypto rails: a wallet the owner controls; ETHGlobal also requires wallet verification and
   (per [3P]) a small ETH stake to hold a spot.
5. Some events require a **live pitch / on-site finals** (e.g. hybrid AMD ACT III, ETHGlobal finals).
   Those are structurally incompatible with the mandate — the colony must filter to async-judged,
   video-only events. A demo video is agent-producible (screen capture + TTS) with no owner on camera.
6. Israeli tax reporting on prize income is the owner's (or his accountant's) responsibility.

## ToS / constitution risk
- **GREEN** for entering async online hackathons solo with agent-written code: no rule found anywhere
  in 2026 that bans AI-assisted development; AI hackathons require it.
- **AMBER** for events whose rules restrict which AI vendors may be used inside the project
  (Google-Cloud-sponsored ones ban Anthropic/OpenAI models in the submission) — buildable only if the
  colony actually swaps the runtime model to Gemini, and never by misdescribing what was used.
- **AMBER** for any event demanding an attestation of "meaningful human creativity" or that the
  submitter personally built it. A fully autonomous entry submitted under the owner's name against
  such a clause is a deception of the judge and is barred by our constitution regardless of payout.
- **RED** for mass-submitting near-identical entries across many hackathons (the "AI slop" pattern).
  It is spam, it is what will get a name banned, and it is out of bounds.
- ETHGlobal's from-scratch rule means reusing our shipped products as a submission is a
  disqualification-and-ban offence. Every entry must be built inside the event window.

## Honest ceiling
Prize income is lumpy, non-recurring and probabilistic. Nothing here is monthly revenue: a hackathon
pays once, months after the build, and most entries pay zero. A no-brand solo entrant with strong
async execution might plausibly average low-single-thousand ILS per month over a year while earning
₪0 in most individual months. This criterion is a **variance line, not a base line** — it cannot be
counted on for the ₪20,000 target and should never be projected into a ledger before a transaction id
exists.

## Dead ends and gaps
- Every hackathon platform's own domain is blocked here. Not one platform rule page was rendered.
- lablab.ai: appeared in two searches; I could not verify whether its prizes are cash or credits.
  Unresolved — open https://lablab.ai/ai-hackathons.
- Prize pools for Qwen Cloud ($70k "cash and cloud credits"), Shipaton and the Bolt $1M were snippet
  only; the cash-vs-credits split is the single most important unverified number in this report,
  because credits are worth ~nothing to us.
- No source found on realistic win rates or entry counts per hackathon — I deliberately did not
  estimate them rather than invent a number.
- Search budget hit its cap at 8; several natural follow-ups (lablab, HackerEarth payouts, Colosseum/
  Solana, Encode Club, Israeli-winner payout reports) were not run.
