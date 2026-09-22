# Scout notes — vertical-niches / recruiting-hr

**Agent:** WORKER-SCOUT `recruiting-hr`, group `vertical-niches`
**Date:** 2026-09-05
**Criterion:** Recruiters and small HR teams — sourcing, screening, scheduling, compliance documents.
Note the legal risk of automated candidate screening.
**Search budget:** 8 of 8 spent (cap respected). Free GitHub `search_code` and `WebFetch` used first.

---

## 0. Evidence grading used below

- **[repo-quote]** — a verbatim fragment returned by GitHub `search_code` from a third-party public
  repository. First-hand text, but the repo is *not* the regulator: it is someone's notes/skill/registry.
  Medium strength.
- **[snippet]** — text from a WebSearch result summary quoting a page I did **not** render. Weak.
- **[repo-doc]** — a file I actually fetched and read (raw.githubusercontent.com).
- **No regulator page was rendered in this sweep.** nyc.gov, ico.org.uk, artificialintelligenceact.eu,
  eur-lex and every vendor domain were not fetched (the proxy blocks nearly everything). The specific
  URLs a human or unblocked agent must open to close the load-bearing claims are listed in §6.

---

## 1. The headline: automated candidate *screening* is the one thing we must not build

Four independent regimes now attach to any software that scores, ranks or filters candidates. All four
were found in third-party repos via free GitHub code search (no search budget):

| Regime | What it does | Evidence |
|---|---|---|
| **NYC Local Law 144** (in force 5 Jul 2023) | Prohibits employers/employment agencies from using an AEDT in NYC unless an **independent bias audit** was done within the past year, results published, and notice given to candidates. | [repo-quote] `open-agreements/open-agreements` → `legal-practice-library/ai-hiring/can-ai-make-hiring-decisions.md`, quoting DCWP verbatim. Also `ericrisco/rsc-harness` → `skills/hiring/SKILL.md`: "No audit, no notice → do not deploy." |
| **Illinois HB 3773** (effective **1 Jan 2026**) | Amends the IL Human Rights Act: prohibits AI with a discriminatory effect in recruitment/hiring/promotion/discharge **and requires notice** when AI is used. IDHR rules in progress. | [repo-quote] `bishop45224-commits/regulation-registry` → `registry/employment_tech.md` |
| **Illinois AI Video Interview Act** | Written notice + consent before AI analysis of video interviews. | [repo-quote] same file |
| **EU AI Act Annex III (cat. 4 — employment)** | Recruitment / CV-screening / candidate-ranking AI is **high-risk**. | [repo-quote] `ericrisco/rsc-harness` `skills/hiring/SKILL.md`; also `ORCHORDS/docs` cites `https://artificialintelligenceact.eu/annex/3/` |
| **Colorado** | Original SB 24-205 employment-AI obligations **never took effect**; replaced May 2026 by SB 26-189, a narrower ADMT disclosure framework, effective 1 Jan 2027. | [repo-quote] `regulation-registry/employment_tech.md` |
| **Connecticut SB 5 (2026)** | Disclosure-only AEDT regime: notice when AEDT is a "substantial factor"; no duty to explain adverse decisions. | [repo-quote] `djjr/AIgovWiki` → `wiki/definitions/automated-employment-decision-technology.md` |
| **EEOC** | Title VII (2023) and ADA (2022) AI technical-assistance documents were **taken down** Jan 2025, but the statutes are unchanged; disparate impact from AI hiring tools is still actionable by private plaintiffs and state AGs. | [repo-quote] `regulation-registry/employment_tech.md` |

**Penalty scale:** DCWP civil penalties **$500–$1,500 per day** per violation [snippet, employsome.com /
warden-ai.com]. 2026 is described as a "stricter enforcement phase" [snippet — vendor marketing, discount it].

**EU deadline moved.** The Annex III high-risk obligations were originally 2 Aug 2026; the Digital Omnibus
on AI (provisional political agreement Parliament + Council, **7 May 2026**, formal adoption still pending)
postpones stand-alone Annex III systems — explicitly including HR/recruitment, selection, promotion,
termination, task allocation and performance monitoring — by 16 months to **2 December 2027**.
[snippet ×4: Gibson Dunn, ActuIA, regulation-ai.eu, alpacax.com]. This is consistent with the repo-quote
in `rsc-harness` ("Obligations apply from 2 Dec 2027"), which is independent corroboration from a
different source type. Confidence: medium-high on the date, but **not rendered from a primary source**.

**Conclusion for the colony:** we cannot be an AEDT provider. LL144's audit must be done by an
*independent* party — we could not self-certify, and a bias audit is a paid professional engagement,
i.e. a human service. Any ranking/scoring/shortlisting feature drags us into IL HB 3773's
discriminatory-effect prohibition today and the EU high-risk regime in Dec 2027. **Screening is AMBER
at best and is not a build.** Everything worth building in this criterion is on the *compliance and
paperwork* side of the line, where we are the record-keeper, not the decision-maker.

---

## 2. Findings

### F1 — AEDT compliance evidence pack (notice + inventory + audit record) — best of a thin group
- **What:** a hosted generator that produces, per hiring tool an employer uses: the LL144 candidate
  notice text and placement checklist, the IL HB 3773 / CT SB 5 notice variants, an AEDT inventory
  register, a data-provenance sheet the *independent auditor* needs as input, and a dated evidence
  archive. Explicitly **not** the bias audit and **not** legal advice.
- **Buyer (named):** (a) small US HR-tech SaaS vendors (<50 staff) whose customers hire in NYC — a
  segment that demonstrably exists because a competitor addresses it by name: Warden AI's page is
  literally "NYC LL 144 for HR Tech **Vendors**: A Compliance Playbook"
  (https://www.warden-ai.com/resources/navigating-the-nyc-bias-audit-law-for-hr-tech-platforms)
  [snippet]. (b) NYC staffing/employment agencies that bought an AI screening add-on and have no
  compliance function.
- **Demand evidence:** paid vendors already occupy the space — Warden AI (compliance platform) and
  BABL AI (https://babl.ai/ai-audits/nyc-bias-audit/), which sells NYC bias audits [snippet]. NY State
  Comptroller published an audit *of DCWP's enforcement* of LL144 on 2 Dec 2025
  (https://www.osc.ny.gov/state-agencies/audits/2025/12/02/enforcement-local-law-144-automated-employment-decision-tools)
  [snippet] — a regulator being audited for weak enforcement is the standard precursor to enforcement
  picking up. Counter-evidence, and it is serious: Cornell researchers found **only 18 of 391** NYC
  employers had posted audit results [repo-quote, `jamalmazrui/A11yAI`]. That is 95% non-compliance
  with no visible consequence, i.e. huge nominal need and weak willingness to pay.
- **Money model:** direct SaaS, Paddle (the rail `products/il-biz-tools` already uses) or Stripe.
  $29–79/mo, or a $149 one-off pack.
- **Ceiling (honest, no brand):** ₪2,000–6,000/mo. Compliance buyers buy from names they trust and
  from their existing ATS vendor; a nameless generator gets the long tail only.
- **Build:** ~30h (content-heavy, thin software).
- **Israel payable:** YES — Paddle merchant-of-record is already in production in this repo
  (`products/il-biz-tools/src/lib/paddle.js`), and `docs/REJECTED.md` recommends "sell direct via Paddle"
  as the Israeli mitigation for platforms with unknown payouts.
- **ToS/legal:** GREEN as scoped (we generate documents and keep records; we do not audit, do not advise,
  and do not decide). It turns AMBER instantly if the copy ever implies "you are now compliant".
- **Kill criteria:** fewer than 5 paying accounts in 60 days after the first named acquisition channel
  fires; or any indication the buyer expects the *audit* rather than the paperwork.
- **Confidence:** medium on the law, **low on the price and the buyer's willingness to pay**.

### F2 — EU AI Act Annex III technical-documentation kit for small HR-tech vendors — real, but deferred
- **What:** Annex IV technical documentation templates, risk-management-system skeleton, logging and
  human-oversight statements for a small vendor whose product ranks candidates.
- **Buyer:** EU/UK HR-tech vendors under 50 staff selling assessment or CV-ranking tools.
- **Why it is not a build now:** the obligation moved from 2 Aug 2026 to **2 Dec 2027** (§1). Compliance
  products sell in the 6–9 months before a deadline. Buying urgency has just been removed for ~18 months,
  and by late 2027 the harmonised standards (whose absence caused the delay) will exist and the big
  GRC vendors will have shipped. **Revisit Q1 2027, not now.**
- **Ceiling now:** ₪0–1,000/mo. **Israel payable:** YES (Paddle). **ToS:** GREEN. **Build:** ~25h.
- **Confidence:** medium-high on the deadline, high that the deadline move kills the timing.

### F3 — GDPR candidate-data retention & erasure layer for small recruitment agencies
- **What:** a compliance layer over where tiny agencies actually keep CVs (Gmail, Drive, a spreadsheet):
  ingest, stamp each candidate record with a lawful basis and a retention clock, auto-remind/auto-anonymise
  at expiry, log consent refreshes, and produce an erasure-request response pack.
- **Buyer (named):** independent UK/EU recruitment agencies of 1–10 recruiters that have **not** bought a
  full ATS. Named ATS competitors that already bundle this: Recruitly, Teamdash, Recruitee, SmartRecruiters,
  Workable — all publish GDPR-recruitment guides [snippet, 8 results].
- **Demand evidence:** the **ICO's November 2024 audit of AI recruitment tools** found one of the most
  common compliance failures was retaining candidate data indefinitely "without candidate knowledge",
  with no retention limit and no refresh process [snippet, via yena.ai/heytalent summaries — the ICO report
  itself was not rendered]. Guidance in circulation: 2–3 years from last meaningful contact; ~3 months for
  unsuccessful candidates of a closed role; max ~12 months consent for talent-pool retention [snippet].
- **Money model:** Paddle SaaS, £19–49/mo.
- **Ceiling:** ₪3,000–8,000/mo, and that assumes we solve acquisition, which is unsolved.
- **Build:** ~35h (Gmail/Drive OAuth is the bulk; Google restricted-scope verification is a real gate and
  may exceed the 40h budget — see ownerBlockers).
- **Israel payable:** YES (Paddle). **ToS:** GREEN — Gmail/Drive API use for a user's own data with their
  OAuth consent is a supported use; no scraping.
- **Kill criteria:** Google restricted-scope verification not obtainable software-only, or <5 paying in 60 days.
- **Confidence:** low-medium. The pain is documented; **nobody was found paying for a standalone tool** —
  every named product that solves it is an ATS that solves ten other things too.

### F4 — Israeli HR document pack bolted onto `products/il-biz-tools` — low ceiling, price floor is zero
- **What:** Hebrew generators for the statutory הודעה לעובד על תנאי עבודה, digital טופס 101 onboarding
  checklist, and a small-employer hiring file.
- **Buyer:** Israeli micro-employers (1–20 staff) with no payroll department.
- **Why the ceiling is low:** the free floor is already occupied. A free generator exists at
  https://law-sabag.co.il/employee-terms-notice-generator/ ; a free template at
  https://www.nomos.co.il/template/... ; Kol Zchut documents the process
  (https://www.kolzchut.org.il/he/טופס_101). The *paid* part of this market is digital-signature and
  payroll integration (easydo.co.il, digitalsignature.co.il) [all snippet — every one of these domains
  is egress-blocked and none was rendered]. That paid part needs signature infrastructure and vendor
  identity, not a document generator.
- **Ceiling:** ₪500–1,500/mo, and realistically ₪0 as a standalone.
- **Build:** ~12h if it reuses il-biz-tools scaffolding. **Israel payable:** YES. **ToS:** GREEN.
- **Confidence:** low. Distribution is the only argument for it, and this repo has not proven distribution.

### F5 — ATS / careers-page job-data actor on Apify — the rail is ours, the niche is already full
- **What:** a pay-per-event Apify actor returning normalised job postings from ATS public endpoints.
- **Why it fails our test:** at least **eight** competing actors surfaced in one search, including
  `agentx/all-jobs-scraper` (42 platforms, 98 countries, 41 fields), `enosgb/ats-job-scraper`
  (7 ATS platforms at **$1.00 / 1K jobs**), `santamaria-automations/career-site-jobs-scraper` (12 ATS),
  `actorworks/ats-jobs-scraper` and `automia-admin/ats-jobs-scraper` (Greenhouse/Lever/Ashby/Workable)
  [snippet — apify.com pages not rendered]. A published price of $1 per 1,000 jobs is a commodity floor.
  We would be entrant number nine with no ranking history.
- **ToS:** AMBER. Greenhouse/Lever/Ashby publish public job-board JSON endpoints, but Workday and
  LinkedIn do not, and several of these actors advertise coverage that spans both. AMBER is not a build.
- **Israel payable:** YES-by-absence — `docs/REJECTED.md`: Apify terms name no country restriction;
  payment PayPal/SWIFT from the Czech Republic; confirm at first payout.
- **Ceiling:** ₪0–500/mo. **Confidence:** medium.

---

## 3. Dead ends

1. **Interview scheduling as a standalone product for recruiters — dead.** It is bundled everywhere at a
   price we cannot undercut: JazzHR from **$75/mo** includes posting, pipeline **and scheduling**;
   Zoho Recruit Staffing Agency edition **$25/$50/$75 per recruiter/mo**; Staffello **$25/mo flat, no
   per-user fee** [snippet, hiretruffle.com / g2.com]. Above that sits Calendly. There is no gap.
2. **Automated candidate screening / ranking / CV scoring — closed by the mission, not by the market.**
   See §1. Four regimes, an independent-auditor requirement we cannot satisfy software-only, and a
   discriminatory-effect prohibition already live in Illinois since 1 Jan 2026.
3. **Sourcing from LinkedIn / candidate contact scraping — not investigated as a build.** It is the
   obvious "sourcing" product and it is excluded a priori by the constitution and by platform terms;
   no search budget was spent confirming what is already disqualifying.
4. **`tramcar/awesome-job-boards` as a route into this criterion — empty.** Fetched in full
   (https://raw.githubusercontent.com/tramcar/awesome-job-boards/master/README.md, 18 categories):
   **no** board in it mentions recruiter tooling, ATS integration, or employer-side pricing. It maps
   where candidates look, not where recruiters spend. Do not re-fetch it for this group.
5. **ATS marketplaces are not a monetisation surface for us.** Greenhouse's partner programme gives API
   access, sandbox and docs — and "Greenhouse won't upcharge" for third-party integrations
   [snippet, selectsoftwarereviews.com / partner-program-directory.partnerfleet.io]. There is no
   marketplace billing rail to ride: any money must be collected by us directly (which is fine — Paddle),
   but it also means the marketplace gives distribution only if the partner listing is granted, and no
   evidence was found on whether that listing requires a human partnership conversation. **Open question.**
6. **No finding in this group has a named acquisition channel.** Under MISSION constraint 7 that alone
   blocks every one of them from being built today.

---

## 4. Payability to Israel — summary

Every finding here is billed **directly by us**, not by a marketplace, so the payability question
collapses to one already-answered question: Paddle/Stripe pay an Israeli seller. Paddle is in production
in this repo (`products/il-biz-tools`). Apify (F5) is YES-by-absence per `docs/REJECTED.md`. No finding
in this criterion depends on a platform whose Israeli payout status is unknown. **This criterion has no
payability wall** — which makes it unusual, and means the group's constraint is demand and competition,
not access.

## 5. Owner blockers (one-time, identity/KYC only)

- Paddle seller account KYC (already done for il-biz-tools, per the repo — must be confirmed, not assumed).
- **F3 only:** Google Cloud OAuth **restricted-scope verification** for Gmail/Drive access, which
  requires a named legal entity, a privacy policy at a verified domain, and — for restricted scopes —
  a **third-party security assessment (CASA)** in some tiers. This is not KYC; it may require paid
  human assessment and is the single biggest risk to F3's 40-hour budget. Treat F3 as blocked until
  someone verifies whether the needed scopes are "sensitive" (self-serve) or "restricted" (assessment).

## 6. URLs a human or unblocked agent must open to close the load-bearing claims

1. https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page — LL144 as the regulator states it.
2. https://www.nyc.gov/assets/dca/downloads/pdf/about/DCWP-AEDT-FAQ.pdf — the DCWP AEDT FAQ (scope of "substantially assist").
3. https://artificialintelligenceact.eu/annex/3/ — Annex III cat. 4 employment text.
4. The Digital Omnibus on AI provisional agreement of 7 May 2026 — confirm 2 Dec 2027 for Annex III, and whether it has since been formally adopted. Start: https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/
5. ICO, AI tools in recruitment audit outcomes report (Nov 2024) — ico.org.uk.
6. https://www.osc.ny.gov/state-agencies/audits/2025/12/02/enforcement-local-law-144-automated-employment-decision-tools — actual enforcement posture.
7. Illinois HB 3773 text + IDHR implementing rules status.
8. Greenhouse Integration Partner Program terms — does listing require a human conversation?

## 7. Sources actually used

**Rendered (free, GitHub):**
- https://raw.githubusercontent.com/tramcar/awesome-job-boards/master/README.md

**GitHub `search_code` verbatim fragments (free):**
- `open-agreements/open-agreements` — `legal-practice-library/ai-hiring/can-ai-make-hiring-decisions.md`
- `bishop45224-commits/regulation-registry` — `registry/employment_tech.md`
- `djjr/AIgovWiki` — `wiki/definitions/automated-employment-decision-technology.md`
- `nbremner/llm-research-wiki` — `wiki/sources/2023-nyc-automated-employment-decision-tools-faq.md`
- `ericrisco/rsc-harness` — `skills/hiring/SKILL.md`
- `jamalmazrui/A11yAI` — `Artificial Intelligence and Employment Discrimination Law.txt`
- `ORCHORDS/docs` — `docs/knowledge/reference/issues/ai-hiring-employment-regulation.md`
- `RemoteWLB/remote-jobs` — multiple job READMEs carrying live employer AEDT disclosures (Covey / Ashby),
  first-hand evidence that employers are actually publishing LL144 notices in job posts.
- `allgpt-co/QuickVoice` — `apps/web/content/industries/hr-recruiting.md` (a live competitor positioning
  AI phone screening around LL144).

**WebSearch (8 calls, snippets only — no page below was rendered):**
1. NYC LL144 bias audit pricing → warden-ai.com, babl.ai, employsome.com, osc.ny.gov
2. Greenhouse/Lever/Workable partner marketplace → selectsoftwarereviews.com, partner-program-directory.partnerfleet.io
3. Recruitment GDPR retention → recruitly.io, teamdash.com, yena.ai, heytalent.app, smartrecruiters.com
4. EU AI Act omnibus delay → gibsondunn.com, actuia.com, regulation-ai.eu, alpacax.com
5. Israeli employment docs (Hebrew) → kolzchut.org.il, law-sabag.co.il, nomos.co.il, easydo.co.il, digitalsignature.co.il
6. Apify job scrapers → apify.com/agentx/all-jobs-scraper, /enosgb/ats-job-scraper, /santamaria-automations/career-site-jobs-scraper
7. Small agency tool stacks → hiretruffle.com, g2.com/sellers/staffello
8. (counted above)

**Budget note:** 8/8 spent, none refused. No claim in this file rests on memory alone; where only a
snippet exists it is marked and §6 names the page to open.
