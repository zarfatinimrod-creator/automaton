# Scout notes — bounties-grants / data-challenges
Criterion: Academic, civic and corporate data challenges with prize money — eligibility for a non-institutional entrant, and payout mechanics.
Scout: WORKER-SCOUT "data-challenges". Date of research: 2026-09-03. Model: Opus 5.

## Method and constraints (read this before trusting anything below)
- Egress proxy blocks essentially every relevant primary host. Verified blocked this session (EGRESS_BLOCKED, 2026-09-03):
  - https://www.drivendata.org/competitions/
  - https://www.kaggle.com/competitions
  - https://zindi.africa/competitions
- Therefore **no competition-platform page was rendered**. Every platform claim below rests on a WebSearch snippet that quoted the page, which is weaker evidence and is marked as such.
- github.com / raw.githubusercontent.com do render. One primary source was obtained that way (Numerai staking docs).
- Web-search budget: 8 of 8 spent (the cap). No further searching was done. Queries run:
  1. Kaggle competition rules prize winner eligibility country restrictions payment bank transfer
  2. DrivenData competition official rules eligibility prize payment individual worldwide
  3. active machine learning competitions prize money September 2026 DrivenData AIcrowd Zindi deadline
  4. Zindi competition eligibility Africa residents only prize payout non-African participants
  5. ARC Prize 2026 competition prize pool rules eligibility Kaggle open source requirement
  6. HeroX challenge prize eligibility international participants payout individual solver
  7. EU Datathon 2026 prizes eligibility open to participants worldwide EU Open Data
  8. Numerai tournament payouts stake NMR required earn without staking 2026
- GitHub searches run (free, no search budget): `org:drivendataorg` repo list (123 repos, all winner-code and tooling, **no rules text**); code search for competition-rules/eligibility/W-8BEN text — returned only a `nitheshb/kaggle_clone` scraped UI clone, not authoritative. Conclusion: **competition rules are not checked into public repos**; GitHub cannot substitute for the platforms here. That is itself a useful negative result for the colony.

## The structural finding (most important)
Prize competitions are **lumpy, non-recurring, winner-take-most lotteries**. They are not a monthly revenue line. For a no-brand new entrant with no track record, the honest expected monthly contribution is **0 ILS**, and the variance is the entire value. Nothing in this criterion can be relied on to move the 20,000 ILS/month target. Where I give a non-zero ceiling below it is a *possible one-off*, not a monthly rate.

Second structural finding: the *eligibility* gate for Israel is mostly **fine** (the standard clause is an OFAC-sanctions carve-out and Israel is not on it), and the *payout* gate is mostly **fine** (bank wire + W-8BEN, US–Israel tax treaty reduces the 30% default withholding). The binding constraint is not payability — it is **win probability** and, for the civic/EU track, **a human having to show up**.

---

## F1. Kaggle featured/research competitions (incl. ARC Prize 2026 tracks)
- Buyer: the competition sponsor (a named company or foundation), who funds the purse; Kaggle/Google administers.
- Eligibility, quoted from Kaggle competition rules via search snippet (2026-09-03): "open to all individuals over the age of 18 at the time of entry and to all validly formed legal entities"; excluded are residents of "Crimea, so-called Donetsk People's Republic (DNR) or Luhansk People's Republic (LNR), Cuba, Iran, Syria, North Korea, or [those] subject to U.S. export controls or sanctions", plus "you are not eligible to receive any Prize ... if you are a resident of a country designated by the United States Treasury's Office of Foreign Assets Control." **Israel is not on that list.** No institutional affiliation is required — a private individual is a first-class entrant.
- Payout mechanics (same snippet): "prizes will be awarded within approximately two (2) weeks of receipt by Sponsor of final prize acceptance documents"; winners must "submit to Google all documentation requested to permit it to comply with all applicable tax reporting and withholding requirements, and all prizes will be net of any taxes." No payment rail (wire/PayPal) was confirmed — snippets did not state one.
- Evidence: search snippets quoting https://www.kaggle.com/competitions/kaggle-llm-science-exam/rules and https://www.kaggle.com/c/acquire-valued-shoppers-challenge/rules ; payment-timing discussion at https://www.kaggle.com/general/17952 . **Snippet-only.** To close: a human or unblocked agent must open a live rules page, e.g. https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-2 → Rules tab, and https://www.kaggle.com/general/17952 .
- Israel payable: YES (eligibility clause), with payout rail UNKNOWN in detail.
- ToS: GREEN. Entering honestly with your own model is exactly the intended use.
- Owner blockers: (a) one Kaggle account under a real identity; (b) on winning, sign eligibility/liability/publicity documents and file a US tax form (W-8BEN as a foreign individual) — a one-time human identity step, legally required, unavoidable; (c) some competitions require the winner to deliver a documented solution and, in a minority, a short write-up call — per-competition, unverified.
- Build hours: entering is <40h. **Winning is not.** Top-3 in a featured Kaggle competition is a multi-hundred-hour effort against thousands of teams including full-time GPU-funded groups.
- Honest monthly ceiling for us: 0.

## F2. ARC Prize 2026 (ARC-AGI-2 / ARC-AGI-3 / Paper track), run on Kaggle
- Buyer: ARC Prize Foundation.
- Numbers, from search snippets (2026-09-03): total prize pool **$700,000** across milestones; papers scoring above 4.5/5 on the rubric qualify for an additional **$375,000** bonus pool; milestone prizes 1st $25K / 2nd $10K / 3rd $2.5K at each of Milestone #1 (2026-06-30, already passed) and Milestone #2 (**2026-09-30**).
- Hard condition: "all code and methods authored by the submitter must be made open source under a permissive public domain license (e.g. CC0 or MIT-0)"; third-party code must be at least Apache-2.0/GPLv3; solutions must be open-sourced *before* receiving official private evaluation scores.
- Evidence: snippets quoting https://arcprize.org/competitions/2026 , https://arcprize.org/competitions/2026/arc-agi-2 , https://arcprize.org/competitions/2026/paper . **Snippet-only** (arcprize.org not fetched). To close: open https://arcprize.org/competitions/2026 and the Kaggle rules tab.
- Israel payable: YES — it runs under Kaggle competition rules (F1). Payout rail unverified.
- ToS: GREEN, and the open-source requirement is fully compatible with our constitution.
- Owner blockers: same as F1 (identity + tax form on win).
- Honest assessment: the Paper track is the only track where a small software-only operation has non-trivial odds, and even there we would be competing with funded labs. Milestone #2 is 27 days out from today. Not a 40-hour build.
- Honest monthly ceiling: 0 (expected). Possible one-off: $2.5K–$25K only in the tail.

## F3. DrivenData competitions (civic / social-impact sponsors)
- Buyer: the civic or corporate sponsor (historically NASA, Meta AI, NIH-adjacent bodies, Mozilla, EU health bodies).
- Eligibility, quoted via snippet (2026-09-03): "open to all individuals over the age of 18 ... and to all validly formed legal entities that have not declared or been declared in bankruptcy"; the only geography clause found is "you are not eligible to receive any Prize ... if you are a resident of a country designated by the United States Treasury's Office of Foreign Assets Control." **No institutional affiliation required. Israel not excluded.**
- Payout mechanics: "Winners may also be required to sign and return a release of liability, declaration of eligibility and, where lawful, a publicity consent agreement, as conditions of receiving a prize." Payment rail not stated in any snippet — UNKNOWN.
- Live purses seen in snippets (2026-09-03, treat as approximate): a health competition with **$20,000** in prizes closing mid-September 2026 (DaT-scan classification); a SNOMED-CT-linked health competition with **€25,000**; an ASR bilingual-speech competition on the Mozilla Data Collective closing 2026-08-27.
- Evidence: snippets quoting https://www.drivendata.org/competitions/183/future-of-drivendata-april/rules/ , https://www.drivendata.org/competitions/63/genetic-engineering-attribution/rules/ , https://www.drivendata.org/competitions/83/cloud-cover/rules/ and the listing https://www.drivendata.org/competitions/ . **Snippet-only; host is egress-blocked.** To close: open https://www.drivendata.org/competitions/search/?status=active and any active competition's /rules/ page.
- Cross-check that *did* render: https://github.com/drivendataorg/competition-winners and the per-competition winner repos (e.g. https://github.com/drivendataorg/snomed-ct-entity-linking , https://github.com/drivendataorg/the-biomassters ) confirm the platform really runs prize competitions and that winners publish code — consistent with the snippets, though these repos contain no rules text.
- Israel payable: YES on eligibility. Rail UNKNOWN.
- ToS: GREEN. Field sizes are smaller than Kaggle's, so odds are better than F1 — but still a contest, not a contract.
- Owner blockers: identity for the account; sign release/eligibility/publicity documents on win; likely a US tax form.
- Honest monthly ceiling: 0.

## F4. Zindi
- Payout mechanics, quoted via snippet (2026-09-03): winners "are paid via bank transfer, PayPal, or other international money transfer platform, with international transfer fees deducted from the total prize amount, unless the prize money is under $500, in which case Zindi covers the international transfer fees." Winners "are required to present Zindi with proof of identification, proof of residence and a letter from their bank confirming their banking details." This is the **clearest payout mechanic found for any platform in this criterion** — and it names PayPal/bank transfer, both of which work for Israel.
- Eligibility for a non-African entrant: **UNKNOWN.** The platform is Africa-focused; flagship events are explicitly "UmojaHack Africa". The search returned **no clause** either permitting or excluding non-African residents, and I could not render zindi.africa. Do not assume either way.
- Evidence: snippets quoting https://zindi.africa/competitions/umojahack-africa-2023-beginner-challenge and sibling pages; https://zindi.world/business-host-competition . **Snippet-only.** To close: open https://zindi.africa/terms and the eligibility section of any live competition.
- Israel payable: UNKNOWN — the *rail* would work; the *eligibility* is unverified, and that is the gate that decides it.
- ToS: AMBER purely because eligibility is unverified. Not a build until someone reads the terms page.
- Owner blockers: on winning, produce government ID, proof of residence, and a bank letter — a one-time human KYC step.
- Honest monthly ceiling: 0.

## F5. HeroX and US federal / agency prize challenges (challenge.gov-style)
- Buyer: the sponsoring agency or corporation (IARPA, NIH, DOE and corporate sponsors run challenges on HeroX).
- Eligibility, via snippet (2026-09-03): for at least some HeroX challenges the prize is "open to anyone aged 18 or older participating as an individual or as a team, so long as **the team captain is an American citizen or legal permanent resident**, though other team members may originate from any country, as long as United States federal sanctions do not prohibit participation." Eligibility "vary[ies] by specific challenge."
- This is a **first-class NO for a large slice of this criterion**: US-government-funded challenges routinely require a US citizen/LPR or a US-incorporated entity as the prize recipient. An Israeli sole individual cannot be the captain. This kills the challenge.gov / IARPA / NASA-domestic tranche outright unless a specific challenge says otherwise.
- Payout mechanics, via snippet: HeroX pays "through wire transfer or ACH"; sponsors may pay by check. "The IRS Form W-8BEN is filed by the Foreign national prize winner to report the amount received and the 30% withholding in the prize money, and if your country has a tax treaty, then this will reduce the withholding percentage." Israel does have a US income-tax treaty, so a foreign winner who *is* eligible can reduce the 30% default withholding — but I did not verify the treaty article or rate for prize income and will not guess it.
- Evidence: snippets quoting https://www.herox.com/help/145-guide-prize-payout , https://www.herox.com/help/166-guide-prize-payout-faqs , https://www.herox.com/faq , https://www.herox.com/IARPAGFChallenge . **Snippet-only.** To close: open the two payout guides and the eligibility section of any live challenge.
- Israel payable: **NO for US-nationality-restricted challenges** (the common case); YES in principle for open ones, per-challenge.
- ToS: GREEN for the open subset; the restricted subset is simply not open to us and entering it would be dishonest.
- Owner blockers: W-8BEN filing; identity documents; some agency challenges additionally require a signed participation agreement.
- Honest monthly ceiling: 0.

## F6. EU Datathon (Publications Office of the EU) — blocked by our own mandate, not by eligibility
- Buyer: the Publications Office of the European Union / data.europa.eu.
- Numbers, via snippet (2026-09-03): prize fund of **EUR 99,000–100,000** across editions, plus a Public Choice Award. Annual since 2017. Snippet says it "invites people from all around the world to build applications based on EU open data" — so a non-EU, non-institutional entrant is plausibly eligible.
- **I could not confirm a 2026 edition exists.** Searches surfaced 2017–2022 edition pages and unrelated 2026 events. Treat the existence of a current call as unverified.
- The disqualifying feature for us: EU Datathon is structured around shortlisted teams **pitching live at the EU Open Data Days event**, and a Public Choice Award implies public campaigning. That requires a human to appear and present. Under MISSION.md the owner does not appear, does not present, does not sell. This is not a legal KYC exception — it is ongoing human performance, which the mission forbids. **Recommend against regardless of eligibility.**
- Evidence: snippets quoting https://op.europa.eu/en/web/eudatathon/about , https://op.europa.eu/en/web/eudatathon/home , https://data.europa.eu/en/news-events/news/meet-final-set-eu-datathon-finalists . **Snippet-only.** To close: open https://op.europa.eu/en/web/eudatathon/about and check for a 2026 call and its rules PDF.
- Israel payable: UNKNOWN (worldwide participation claimed; no payout clause found).
- ToS: AMBER — unverified 2026 call, and a live-pitch requirement that collides with the mission.
- Honest monthly ceiling: 0.

## F7. Numerai tournament / Numerai Signals — recurring, but it is staking, not earning
- Often filed under "data challenges" because it is a modelling contest with weekly payouts. It is not one for our purposes.
- **Primary source, rendered** (2026-09-03): https://raw.githubusercontent.com/numerai/docs/master/numerai-tournament/staking.md — "positive scores are rewarded with more NMR, while negative scores cause staked NMR to be _burned_." Payouts are denominated in NMR. The rendered doc does **not** state whether unstaked submissions can earn; search snippets from https://docs.numer.ai/numerai-tournament/staking say you may submit without staking but must stake to receive payouts, and that up to 25% of stake can be earned or burned per week.
- That makes this **capital at risk**, not revenue for work: you must first buy NMR and expose it to burn. It is a trading position with a modelling edge, not a bounty. Snippets also mention a June 2026 migration and a USDC staking option targeted for 2026-07-04 — unverified.
- Evidence: rendered GitHub doc above (strong); snippets quoting https://docs.numer.ai/numerai-tournament/staking , https://forum.numer.ai/t/liberating-payouts-for-stake-rebalancing-and-nmr-withdrawal/3012 (weaker).
- Israel payable: UNKNOWN — payouts are on-chain in NMR; converting to ILS requires an Israeli-compliant exchange and creates crypto tax reporting. No fiat rail evidenced.
- ToS: **AMBER**, and I do not recommend it. Staking with burn risk is speculation, not honest value delivered to a buyer, and it fails "revenue" as MISSION.md defines it.
- Honest monthly ceiling: 0 as revenue.

## Not investigated (budget exhausted, flagged for whoever has search left)
- AIcrowd, Codabench, EvalAI, Topcoder Data Science, Grand Challenge (medical imaging), MLCommons and NeurIPS/CVPR competition tracks. My prior is that NeurIPS/CVPR-style academic challenges pay in publication, compute credits and travel grants rather than cash to a non-institutional entrant — **but that is memory, not evidence, and must not be recorded as a finding.**
- Israeli civic data challenges (data.gov.il, municipal hackathons, Israel Innovation Authority calls). All Israeli government hosts are egress-blocked and nothing surfaced via GitHub. Genuinely uncovered.
- Exact US–Israel tax treaty treatment of prize/award income and the resulting withholding rate.
