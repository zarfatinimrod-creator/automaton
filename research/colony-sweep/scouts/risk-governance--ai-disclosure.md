# Scout notes — risk-governance / ai-disclosure
Date: 2026-09-03
Criterion: Where AI-generated content and AI-operated accounts must be disclosed — platform rules and emerging law (EU AI Act transparency duties) through 2026.

## Evidence environment (read this before trusting anything below)
- **WebSearch was unavailable for this scout.** The session had already consumed its
  entire web-search budget (200/200 calls) before this scout started. Both search
  attempts returned: "Web search was not performed: this session has used its web
  search budget (200 of 200 WebSearch calls)."
- WebFetch on `artificialintelligenceact.eu` returned `EGRESS_BLOCKED`.
- WebFetch on `github.com/search?...` returned HTTP 429 (Retry-After: 3600).
- `mcp__github__get_file_contents` is restricted to `zarfatinimrod-creator/automaton`;
  READMEs of third-party repos could NOT be read.
- **The only live evidence channel that worked was the authenticated GitHub MCP
  search API** (`search_repositories`, `search_code`). So every claim below rests on
  repository metadata (name, description, topics, stars, created/updated dates) and
  code snippets that I actually saw in tool output on 2026-09-03.
- Evidence strength labels used: **[GH-META]** = GitHub repo description/topics I saw
  (weak, third-party assertion); **[GH-CODE]** = source text I saw (strong for what the
  code does, weak for what the law says); **[NONE]** = could not verify at all.

## What I could NOT verify (must be opened by a human or unblocked agent)
These URLs are the ones that would close the open questions:
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj — Regulation (EU) 2024/1689, Article 50
  (transparency duties) and Article 113 (application dates). **Unverified.**
- https://artificialintelligenceact.eu/article/50/ — BLOCKED (EGRESS_BLOCKED).
- https://support.google.com/youtube/answer/14328491 — YouTube altered/synthetic content
  disclosure. **Unverified.**
- https://www.tiktok.com/community-guidelines/en/integrity-authenticity — TikTok AIGC
  labelling. **Unverified.**
- https://transparency.meta.com/ — Meta "AI info" labelling. **Unverified.**
- https://partner.steamgames.com/doc/gettingstarted/onboarding (AI disclosure section)
  and https://store.steampowered.com/news/group/4145017/view/3862463747997849618 —
  Steam AI-content disclosure. **Unverified.**
- https://www.w3.org/community/ai-content-disclosure/ — W3C CG charter/status.
- https://cv.iptc.org/newscodes/digitalsourcetype/ — IPTC Digital Source Type vocabulary.

## Raw evidence actually seen (2026-09-03, GitHub MCP search)

### A. EU AI Act Article 50 tooling — a wave of 2026 repos, essentially all with 0 stars
`search_repositories("EU AI Act article 50 transparency compliance")` → total_count 15.
Items seen:
- https://github.com/euaicompliance/eu-ai-act-ready — PHP, "AI transparency and EU AI Act
  compliance for WordPress. Disclose AI-generated content and chatbots under Article 50."
  1 star, created 2026-02-18, updated 2026-09-01. [GH-META]
- https://github.com/seekdaseek/eu-ai-act-article-50 — Python, topics list c2pa/iptc,
  0 stars, created 2026-07-26. [GH-META]
- https://github.com/EdgeF-4/ai-act-kit — TypeScript, "Self-hostable EU AI Act Article 50
  transparency toolkit for deployers", topics include c2pa, content-credentials,
  deepfake-disclosure, ed25519, provenance. 0 stars, created 2026-07-12. [GH-META]
- https://github.com/omergili/neuralflow-wp — WordPress plugin, "AI transparency badge",
  0 stars, created 2026-03-21. [GH-META]
- https://github.com/satwikbasu/article50 — "Scan your code, audit your site, generate the
  fix **before August 2, 2026**." 0 stars, created 2026-06-11. [GH-META]
- https://github.com/eduard-wolf/eu-ai-act-content-transparency — "Decision tree, case
  catalog and a git-native editorial-evidence gate for the EU AI Act's content
  transparency duties (Article 50)." 0 stars, created 2026-08-24. [GH-META]
- https://github.com/alfalf09/minimal-eu-ai-act-compliance-banner — React/Tailwind banner
  "to comply with Article 50 (AI Transparency) of the EU AI Act **by August 2, 2026**."
  0 stars, created 2026-06-04. [GH-META]
- https://github.com/closermethod/eu-ai-act-mcp — MCP server, "Risk classification, GPAI
  rules, Article 50 transparency, AI literacy, enforcement timeline." 0 stars. [GH-META]
- https://github.com/K0-Cyber/grc-eu-ai-act-compliance — GRC portfolio project referencing
  "Regulation (EU) 2024/1689 ... Article 50 transparency". 0 stars, 2026-08-20. [GH-META]
- https://github.com/goww7/acttrace — "classify AI systems by risk and generate Article 50
  transparency notices. API + MCP server + Claude Code skill". 1 star, 2026-05-16. [GH-META]

**Inference:** two independent repos state the Article 50 compliance date as
**2 August 2026** and one names the instrument **Regulation (EU) 2024/1689**. That is
consistent and dated, but it is third-party repo prose, not the OJ text. Treat the date as
*probable, unconfirmed*; confirm at eur-lex before quoting it to a paying customer.

### B. Machine-readable marking: C2PA + IPTC digitalSourceType
`search_repositories("c2pa content credentials sdk")` (5 results) and
`search_code("trainedAlgorithmicMedia digitalSourceType")` (total_count 2200).
- https://github.com/contentauth/c2pa-mcp — official Content Authenticity Initiative MCP
  server for reading C2PA Content Credentials, Rust, 4 stars, created 2026-03-26. [GH-META]
- https://github.com/hexrift/oprindo-sdk-py and .../oprindo-sdk-js — "C2PA Content
  Credentials signing **for generative-AI providers**", topics include `eu-ai-act`,
  created 2026-07-27. [GH-META] — i.e. others are already selling into exactly the
  "providers must mark synthetic output" duty.
- Code seen in `contentauth/c2pa-swift` (`Library/Sources/Manifest/DigitalSourceType.swift`):
  "The value of digitalSourceType is one of the URLs specified by the International Press
  Telecommunications Council (IPTC) NewsCodes Digital Source Type scheme of the form
  http://cv.iptc.org/newscodes/digitalsourcetype/<CODE>". [GH-CODE]
- Code seen in `ingo-eichhorst/human-ai-provenance-demo` (`src/types/c2pa.ts`) enumerating
  `.../digitalsourcetype/trainedAlgorithmicMedia` and `.../humanEdits`. [GH-CODE]
- `unjs/unhead` (a mainstream, widely-used package) ships a schema.org
  `DigitalSourceType = 'TrainedAlgorithmicMediaDigitalSource' | 'AlgorithmicMediaDigitalSource'`
  type. [GH-CODE] — the vocabulary is reaching ordinary web tooling, not just niche tools.
- https://github.com/SerhiiRaievskyi/ainsign — WordPress, "visible badge + machine-readable
  XMP metadata (IPTC Digital Source Type). Transparency tooling for the EU AI Act era."
  0 stars, created 2026-08-06. [GH-META]

### C. Web-standards track for text/HTML disclosure
- https://github.com/w3c-cg/ai-content-disclosure — "W3C AI Content Disclosure Community
  Group repository for drafts, issues, meeting minutes". 20 stars, 23 open issues,
  created 2026-02-10, updated 2026-09-01 (active). [GH-META]
- https://github.com/dweekly/ai-content-disclosure — "Explainer: AI Content Disclosure for
  HTML — element-level markup for AI authorship transparency", 22 stars, topics w3c /
  web-standards, created 2026-01-26. [GH-META]
**Reading:** an HTML-level disclosure markup is being standardised but is pre-REC. Building
a product that depends on it settling is premature.

### D. AI-authorship disclosure inside software supply chains
- https://github.com/chaoss/disclosure — CHAOSS (Linux Foundation project) "CLI tool and
  GitHub Action to gather signals of disclosed AI contribution to aid community health
  monitoring tools and open source maintainers." 26 stars, 29 open issues, 11 forks,
  created 2026-02-13, updated 2026-09-02. [GH-META]
- https://github.com/ggfevans/ai-disclosure — "lightweight, machine-readable convention for
  declaring AI involvement in source code", 9 stars, created 2026-05-17. [GH-META]
**Reading:** real, active, but it is a foundation-backed free tool. No paying buyer visible.

### E. Storefront disclosure (Steam)
- https://github.com/seeeeew/aiwarningforsteam — "Browser extension to increase the
  visibility of **AI Generated Content Disclosures in the Steam store**." **148 stars**,
  created 2025-05-17, updated 2026-09-02. [GH-META]
**Reading:** this is the single strongest *demand* signal I found in the whole criterion —
148 stars and 15 months of maintenance — but the demand is from *consumers wanting to see*
disclosures, i.e. an audience, not a buyer. It also corroborates (weakly) that Steam
requires developers to declare AI-generated content at submission.

### F. Platform rules (YouTube, TikTok, Meta, Instagram, X, Reddit, LinkedIn)
`search_repositories("AI generated content disclosure label YouTube TikTok policy compliance")`
→ **total_count 0**. Several other narrow queries also returned 0.
**I have NO evidence in this session about any social-platform AI-labelling policy.**
Anything I "know" about YouTube's altered-content checkbox, TikTok's AIGC label, or Meta's
"AI info" tag is memory, which is not evidence. The URLs in the section above must be
opened before the colony relies on any of it.

## Honest read of the market
Supply is heavy and demand is invisible. Ten Article-50 repos created between Feb and Aug
2026, and **eight of them have zero stars**. The two things with real traction are a free
Linux-Foundation CLI and a free consumer browser extension. That is the shape of a market
where builders believe a deadline creates buyers and no buyer has yet shown up on GitHub.
GitHub stars are also a poor proxy for a compliance market whose buyers are SMB marketers
and agencies, not developers — so this is evidence of *no visible* demand, not proof of
*no* demand. Closing that gap needs one search I could not run: whether anyone is charging
for an Article 50 disclosure product and getting paid.

## Israeli payability
Not one item here is a platform that pays out. Every candidate is a self-published product,
so payability equals the owner's existing rails: the repo already ships Paddle
(`products/il-biz-tools`), Telegram Stars, Apify pay-per-event and x402. Payability to
Israel is therefore YES for anything sold through those rails, and the gate moves to the
merchant-of-record's own KYC, which is a known one-time owner step (ID + bank/tax details).
No new payout blocker was discovered by this scout.

## Constitution / ToS note
Everything in this criterion is *pro*-disclosure tooling, which sits on the right side of
the constitution. The one live risk is **selling legal certainty we do not have**: with
Article 50's text unverified in this session, any product must be positioned as tooling
("insert and manage disclosures") and never as legal advice or a compliance guarantee.
A product that promised "AI Act compliant" on the strength of a GitHub repo description
would itself be deceiving the buyer.
