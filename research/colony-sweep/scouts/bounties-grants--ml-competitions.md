# Scout notes — bounties-grants / ml-competitions
Date: 2026-09-03. Scout: WORKER-SCOUT "ml-competitions".
Criterion: Kaggle and other ML competitions — prize money, eligibility rules, compute costs, and whether prizes pay to Israel.

## Method and constraints
- Web tools loaded via ToolSearch (WebSearch, WebFetch).
- Search budget: 8 WebSearch calls used (the cap). No further searching after that; nothing below is filled in from memory.
- Egress proxy blocked EVERY platform domain I tried to render:
  - www.kaggle.com — EGRESS_BLOCKED
  - docs.numer.ai — EGRESS_BLOCKED
  - www.drivendata.org — EGRESS_BLOCKED
  - arxiv.org — EGRESS_BLOCKED
  - mlcontests.github.io — EGRESS_BLOCKED
- The ONLY primary, rendered source I obtained is the Numerai documentation repo on GitHub (raw.githubusercontent.com), which is the platform's own docs checked into a public repo. Everything else in this file is a SEARCH SNIPPET and is labelled as such.

## Rendered primary sources (strong evidence)
1. https://raw.githubusercontent.com/numerai/docs/master/SUMMARY.md — full page index of Numerai's official docs (tournament, signals, crypto, staking, bounties).
2. https://raw.githubusercontent.com/numerai/docs/master/numerai-tournament/staking.md — staking mechanics. Verbatim mechanics:
   - `score = corr20 * corr_multiplier + mmc20 * mmc_multiplier`
   - `payout = stake * clip(payout_factor * score, -0.05, 0.05)` → max payout OR BURN is ±5% of stake per round.
   - `payout_factor = min(1, stake_threshold / total_at_risk)`; stake_threshold: Numerai 72,000 NMR, Signals 36,000 NMR, Crypto 10,000 NMR.
   - Currency NMR, "purchasable via Coinbase or Uniswap". Negative scores BURN staked NMR.
   - No country/eligibility restriction appears on this page.
3. https://raw.githubusercontent.com/numerai/docs/master/numerai-tournament/bounties.md — Numerai's own bounty programme:
   - Bugs: display/styling/broken links/typos 0.1–1 NMR; data errors, scoring problems, broken services 1–5 NMR.
   - Security: low impact 0.1–2 NMR; moderate risk to funds 2–10 NMR; high 10–100 NMR; catastrophic 100+ NMR.
   - Credentials leaks: 0.1 NMR per non-exploitable leaked account; up to full stake if exploitable.
   - Rules: no spam, no DoS, no rate-limit exploitation, no attacking other users' accounts, no public disclosure, PoC required.
   - Payment: requires an active Numerai Tournament account; US recipients over $600 file W-9; recipient responsible for taxes; Numerai has sole discretion; 5–10 business days to respond.
4. https://raw.githubusercontent.com/numerai/docs/master/numerai-tournament/scoring/grandmasters-and-seasons.md — Grandmaster/Masters/Experts tiers are PRESTIGE ONLY. Explicitly: no prize pools, cash amounts or NMR distribution specified. Qualification = 20 on-time rounds with ≥1 NMR staked. So "become a Numerai Grandmaster" is not an income line.

## Search-snippet evidence (weaker — a human or unblocked agent must open the URLs to close these)
5. Kaggle standard competition rules — prize eligibility (snippet, 2026-09-03):
   - "You are not eligible to receive any Prize in the Competition if you are a resident of a country designated by the United States Treasury's Office of Foreign Assets Control." Also "if a winner is located in a country where prizes cannot be awarded, then they are not eligible".
   - Israel is NOT an OFAC-designated/comprehensively-sanctioned jurisdiction, so Israeli residents are eligible on the face of this clause. This is an inference from a snippet of the clause, not a rendered rules page.
   - URLs to open to confirm: https://www.kaggle.com/competitions/kaggle-llm-science-exam/rules , https://www.kaggle.com/c/acquire-valued-shoppers-challenge/rules
6. Kaggle prize-payment mechanics (snippet): winners must sign and return US tax forms — IRS Form W-9 (US) or **Form W-8BEN (foreign resident)**; documents due within two weeks of notification or the prize is forfeited and re-awarded; prizes paid ~30 days after documents received; taxes are the winner's responsibility and prizes are net of required withholding.
   - URL to open: https://www.kaggle.com/competitions/kaggle-llm-science-exam/rules
7. ARC Prize 2026 (snippet, 2026-09-03): prize pool "over $1 million"; Paper Track bonus prize of $375,000 divided equally among ALL papers scoring above 4.5/5 on the rubric; solutions must be open-sourced and attached to an official Solution Writeup within 7 days of the deadline or the entry is removed; submissions run as Kaggle notebooks in under 12 hours; **$10,000 USD maximum runtime cost including commercial API calls**; no internet access during Kaggle evaluation (no GPT/Claude API calls at eval time); no limit on pre-training compute.
   - URLs to open: https://arcprize.org/competitions/2026 , https://arcprize.org/competitions/2026/paper , https://arcprize.org/competitions/2026/arc-agi-2
8. Market size (snippet of mlcontests "State of Machine Learning Competitions 2025"): more than 390 ML competitions ended in 2025 across 30+ platforms, total prize pool over $16 million (cash and liquid crypto only; travel grants excluded). Note: $16M/year across the ENTIRE global field, split among winners of 390 contests.
   - URL to open: https://mlcontests.com/state-of-machine-learning-competitions-2025/
9. Zindi (snippet): prize payment "only to individual players or to the team leader", after code review and leaderboard sealing; explicit geographic limitation — "due to the ongoing Russia-Ukraine conflict, Zindi is not currently able to make prize payments to winners located in Russia". No statement found either way about Israel. Zindi is explicitly Africa-focused and many challenges are restricted to African citizens/residents.
   - URL to open: https://zindi.world/rules
10. AIcrowd (snippet): winners must provide a valid unexpired ID card or passport for identity verification before a cash prize transfer; solutions must be released under an open-source licence to be prize-eligible. No country list found.
    - URL to open: https://www.aicrowd.com/challenges/insurance-pricing-game/challenge_rules
11. Kaggle Community Competition Creator Prize (snippet): "Starting in March 2022, Kaggle awards up to five $5,000 monthly prizes (one per month) to Kaggle Community Competition hosts who create high-quality Community Competitions"; competition need only be live at some point during the award month; judged by Kaggle judges at their discretion. The programme's start date is 2022 and I could not verify it is still running in 2026 — treat as unverified.
    - URLs to open: https://www.kaggle.com/community-competition-creator-prize , https://www.kaggle.com/community-competition-creator-prize-rules

## Not established (do not claim these)
- Kaggle free GPU/TPU notebook quota in 2026 — not verified this session, no evidence gathered. Unknown.
- NMR/USD or NMR/ILS exchange rate — not verified. Every NMR figure above is therefore unvalued; I refuse to convert.
- Whether Israeli residents specifically have ever been paid by Kaggle/AIcrowd/Zindi — no evidence found either way.
- DrivenData and bitgrit prize/eligibility specifics — blocked domain, no usable snippet. Genuinely unknown.

## Judgement against MISSION.md
The whole criterion is structurally a LOTTERY, not an income line. $16M of global prize money across 390 competitions in 2025 is the entire addressable pool; Kaggle featured competitions routinely draw thousands of teams and pay only the top few; ARC Prize allows $10,000 of runtime cost per submission, i.e. it costs real money to compete. A no-brand new entrant's honest expected monthly revenue is 0 ILS, and the mission counts ledgered transactions, not expected values. Nothing here should be built as a revenue line. The one structurally different item — Numerai bounties — is real, small, paid in an unvalued token, and its "find bugs fast" shape sits one step away from rate-limit abuse that Numerai's own rules forbid, so it is AMBER for automated hunting and must not be recommended as a build.
