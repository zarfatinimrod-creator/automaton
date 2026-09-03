# Scout notes — bounties-grants / hackathons
Criterion: Online hackathons with cash prizes that accept solo and AI-assisted entries: real prize pools, judging, and how payouts are made.
Scout: WORKER-SCOUT "hackathons". Date of research: 2026-09-03. Web-search budget used: 8/8.

## Evidence strength legend
- **RENDERED** = I actually fetched the page and read it.
- **MIRROR** = I rendered a third-party GitHub mirror/transcription of an official rules page. Strong wording, but it is somebody else's copy, not the official page. Must be re-confirmed on the official URL.
- **SNIPPET** = search-result summary quoting a page I could not render (host egress-blocked).
- Memory is not used as evidence anywhere in this file.

## Egress reality
Blocked (confirmed this session, EGRESS_BLOCKED): help.devpost.com, devpost.com, www.kaggle.com, ethglobal.com, dorahacks.io.
Working: WebSearch (snippets), github.com API code search, raw.githubusercontent.com.
Consequence: every official hackathon rules page is unreachable from this container. All rules text below came from GitHub mirrors that participants checked into their own repos, plus search snippets.

## Sources actually used
RENDERED (raw.githubusercontent.com):
1. https://raw.githubusercontent.com/alejandro-publius/blackbox-datahub/61f459076cf5f5d7774e95a91a6b4b478c4d0647/docs/HACKATHON_REQUIREMENTS.md — mirror of https://datahub.devpost.com/rules (participant states all four datahub.devpost.com pages were live-fetched by them).
2. https://raw.githubusercontent.com/asin2000/forge/fc6c4a18fabb76574c6bd269cc498718d5073af5/docs/HACKATHON-OFFICIAL-REQUIREMENTS.md — mirror of https://allthingsagentichackathon.devpost.com/rules
3. https://raw.githubusercontent.com/KaustubhUp025/gpuyantra/6bd27b1e415ec3f9689219fe4e2276083d281e8d/submission-docs/01-hackathon-rules-and-evaluation-baseline.md — second independent mirror of the same All Things Agentic rules
4. https://raw.githubusercontent.com/ducktyper17/velvetmint-diagnostic-agent/16bd3fa83159272a95d2f48224d8dc7d94a09692/00-shared/hackathon-rules.md — mirror of https://rapid-agent.devpost.com/ rules

GitHub code search (rendered result fragments), 2026-09-03, query `"Crimea, Cuba, Iran" hackathon eligibility prize in:file language:markdown` — 77 hits; exclusion-list text quoted from mirrors of:
- https://arm-ai-optimization-challenge.devpost.com/rules (yuanhawk/latticejack)
- https://qloo.devpost.com rules (Technikole/FlickyPlots)
- Google Gemini 3 Hackathon rules (cianfhoghlaim/cianfhoghlaim, BrnEzekiel/fluxOS)
- Gemini Live Agent Challenge rules (david-ac1/red-eye, nikships/Voidpilot)
- Chrome Built-in AI Challenge rules (vietanhdev/IntelliPen)
- an OpenAI-sponsored hackathon rules copy (mylokaye/OpenForm)
- https://agentic-cinema.devpost.com/rules (ArpitKumar8649/Agentic-Cinema)
- https://backblaze-generative-media.devpost.com/rules (HawaleShailesh004/provledger)

SNIPPET sources (URL a human/unblocked agent must open to close the claim):
- https://help.devpost.com/article/114-how-to-claim-your-hackathon-cash-prize-winners-only — payout rails
- https://help.devpost.com/hc/en-us/articles/360058308652-What-are-the-standard-exceptions-for-global-eligibility
- https://revenuecat-shipaton-2026.devpost.com/
- https://dorahacks.io/blog/news/prize-distribution/ and https://dorahacks.io/hackathon/circle-developer-bounties-1/detail
- https://blog.colosseum.com/announcing-the-solana-frontier-hackathon/
- https://www.kaggle.com/community-competition-creator-prize-rules

## Core factual findings

### 1. Israel is NOT on any exclusion list I saw
Across ~10 independently mirrored Devpost/Google/OpenAI hackathon rule sets, the ineligible-residency lists are variations of: Brazil, Italy, Quebec, Russia, Belarus, Crimea, Cuba, Iran, Syria, North Korea, Sudan, Venezuela, Donetsk/Luhansk, plus "any other country designated by OFAC". Israel appears in none of them. (MIRROR, multiple independent repos — this convergence is the strongest evidence in this file.)
Caveat: individual sponsors vary a lot. One mirror (AlvinGeorge-AG/campusops) shows a rule set that additionally excludes Argentina, Australia, Hong Kong, Indonesia, Italy, Malaysia, Philippines, Singapore, Thailand, UAE and Vietnam. So eligibility must be re-read per hackathon; there is no blanket answer.

### 2. Payout rails reach Israel
"Devpost winners can choose from PayPal, Payoneer, or Wise for payment, or receive a paper check if they are a US resident... Prizes will be delivered within 60 days of Devpost's receipt of the completed Required Forms. Winners are responsible for any fees." (SNIPPET of help.devpost.com/article/114.) PayPal, Payoneer and Wise all serve Israeli residents. Corroborating MIRROR: "Prize affidavits must be completed and verified before anyone is declared a winner. Prizes delivered within 60 days of receipt of completed forms. Winner bears all fees and taxes."
US/non-US tax paperwork: W-9 for US residents, W-8BEN for others; Devpost may withhold to comply with tax law (SNIPPET).

### 3. AI-assisted building is explicitly permitted (usually)
- All Things Agentic (Google, $180,000, Aug 3–31 2026): "standard tools, frameworks, libraries, and AI coding assistants permitted"; a second mirror adds "Allowed without disclosure: ... AI coding assistants. No attribution is required." (MIRROR x2)
- DataHub Agent Hackathon: "AI coding assistants and frameworks are permitted; disclose any other pre-existing code." (MIRROR)
- Counter-example: Rapid Agent Hackathon required Google Cloud AI tools and stated "All other artificial intelligence tools are not permitted" — OpenAI, Anthropic Claude, Llama, Mistral banned. (MIRROR) So a Claude-driven colony is disqualified from that class of sponsor-locked hackathon unless it swaps model provider.
- Universal constraint in every rule set: the project must be NEWLY created during the submission window and be the entrant's original, solely-owned work.

### 4. Solo entries are standard
"Solo participants (18+), teams, and organizations are eligible" (DataHub, MIRROR). "Individuals, teams, or organizations may compete... solo entries are eligible for Grand Prize, track-specific prizes, and individual categories" (All Things Agentic, MIRROR).

### 5. Real prize numbers seen in rendered mirrors
- All Things Agentic (Google): $180,000 pool, $50,000 grand prize, 14+ categories, ~6,126 participants (participant-reported), Aug 3–31 2026. One track: $20,000 cash + $2,000 GCP credits for 1st in category. Judging: Innovation & Operational Utility 40%, Architecture/Stack 30%, Demo & Production Readiness 30%. Max one prize per project.
- Build with DataHub: The Agent Hackathon: $20,500 pool — Grand $6,000; 4 category winners $3,000 each; 2 honourable mentions $1,000; 10 feedback prizes $50. ~2,969 registered participants. Jul 6 – Aug 10 2026. Two-stage judging (pass/fail viability, then six equally weighted criteria).
- Arm Create: AI Optimization Challenge: $8,000 pool, $3,000 overall winner. (GitHub search fragment)
- Gemini Live Agent Challenge: $80,000 in prizes, $25,000 grand prize cash. (GitHub search fragment)
- RevenueCat Shipaton 2026: "over $700,000 in cash prizes", submissions Aug 1 – Sep 30 2026 (SNIPPET).
- Colosseum Solana Frontier Hackathon 2026: $2.75M in prizes + pre-seed; ran Apr 6 – May 11 2026; 10,000+ participants, 150 countries, 2,857 final submissions, 26 winners (SNIPPET). Base rate visible here: 26/2857 ≈ 0.9% of submissions won anything.

### 6. Submission mechanics are camera-free but not owner-free
Typical required artefacts: public GitHub repo with an OSS licence, a working demo URL judges can test, a public video under 3 minutes showing the project working, a text description. A screen recording with synthetic narration satisfies the video requirement — no face, no live pitch. But: winners must respond to verification within ~2 business days, sign a prize affidavit, and supply full legal name, DOB and country of residence. That is a human-identity step the owner cannot delegate.

### 7. Crypto-native hackathons are a separate payout regime
DoraHacks: "All successful teams will need to pass KYC verification before prizes can be awarded"; prize funds "deposited via bank transfer or USDC (Base), processed by Merit Systems"; example bounty tier 1,500 USDC per track (SNIPPET, dorahacks.io blocked). Israel payability here is UNKNOWN — it depends on the Merit Systems / DoraHacks KYC provider's country list, which I could not render. Do not assume.

## Honest economics
Every one of these is a lottery with a real, judged payout — not a wage. The one hard base rate I have is Colosseum's 26 winners out of 2,857 submissions (~0.9%). DataHub's shape (17 paying slots incl. $50 feedback prizes, ~2,969 registrants) is friendlier but registrants >> submissions, so the true rate is unknown. A no-brand new entrant should model this as: several sub-40h builds per month, most returning zero, occasional $1,000–$6,000 hits. Any number presented as a monthly income is a guess; I have set ceilings low and marked confidence accordingly.

## Constitution / ToS guardrails
- Entering many hackathons with genuine, original, working builds is squarely permitted and is what the rules describe. GREEN.
- Mass-submitting low-effort near-duplicate entries across many hackathons to farm expected value would collide with "original work product, solely owned", with judges' time, and with our own honest-value rule. That variant is AMBER/RED and must not be built.
- Sponsor-locked hackathons that ban non-sponsor AI tools (Rapid Agent) must be skipped, not worked around.
- Every rule set grants the sponsor a perpetual, irrevocable, worldwide, royalty-free licence to the submitted project (All Things Agentic §12, MIRROR). Do not submit anything the colony intends to sell exclusively.

## Dead ends and unclosed questions
- Kaggle: kaggle.com is egress-blocked and my one search on Kaggle prize eligibility returned nothing usable. Kaggle competitions are also arguably a different criterion (leaderboard competitions, not judged hackathons). Unclosed: https://www.kaggle.com/community-competition-creator-prize-rules
- I could not enumerate what is open RIGHT NOW (Sept 2026), because devpost.com itself is blocked and search only surfaced a mix of past and current events. The live list at https://devpost.com/hackathons?status[]=open must be opened by an unblocked agent before any build decision.
- No official Devpost help-centre page was rendered; the payout-rails claim rests on a search snippet only.
- Israel-specific eligibility was established by absence from exclusion lists, not by an affirmative statement. No page said "Israel is eligible".
