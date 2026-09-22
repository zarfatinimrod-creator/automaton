# Scout notes — vertical-niches / legal-admin
Date: 2026-09-05. Scout: WORKER-SCOUT "legal-admin", group vertical-niches.
Criterion: Law firms and paralegal admin — document assembly, deadline calculators,
court-form automation. Be explicit about where this becomes unauthorized practice of law (UPL).

Search budget used: 8 of 8 allowed WebSearch calls. Plus 5 free GitHub/WebFetch calls
(2 rendered, 3 returned 404) and 1 local repo check.

## Evidence register (what kind of evidence each claim rests on)

STRONG — rendered page:
- https://raw.githubusercontent.com/freelawproject/juriscraper/main/README.rst (rendered 2026-09-05)
  Juriscraper: BSD-licensed scraper library for US judicial opinions, oral arguments and
  PACER data; opinions from all federal appellate courts and all state supreme courts
  except Georgia. Reference deployment is CourtListener.com.
- https://raw.githubusercontent.com/SuffolkLITLab/docassemble-AssemblyLine/main/README.md (rendered 2026-09-05)
  Suffolk LIT Lab "Document Assembly Line": open-source runtime + question library on top of
  Docassemble for guided, mobile-friendly court-form interviews. Public front end
  CourtFormsOnline.org. Massachusetts-first with partner jurisdictions. Distributed on PyPI.
  => The open-source floor for court-form automation is mature, free, and institution-backed.

WEAK — search snippet only (URL a human must open to confirm):
- LawToolBox pricing, snippet says $29-$35/user/mo (2-9 users), $33-$40 (10-19), $23-$30
  (20-79), +$4/user for NetDocuments/iManage, 1-year minimum.
  MUST OPEN: https://lawtoolbox.com/pricing/ and https://lawtoolbox.com/partner-pricing/
- Court-calendaring category pricing "~$25-30 per user or case per month"; CompuLaw covers
  "more than 2,500 jurisdictions" with full-time licensed US attorneys maintaining rules.
  MUST OPEN: https://directory.lawnext.com/categories/court-calendaring/buyers-guide/
- Gavel (ex-Documate) document automation: Lite $99/mo (10 templates, 100 sessions),
  Standard $250, Pro $350, Scale $417 (API, SSO). Another source said "from $83".
  MUST OPEN: https://www.gavel.io/pricing
- E-filing rejections: "an average of 3.7% of eFilings are rejected by the court";
  filing-procedure issues 45% of rejections, document-format issues 26%, exhibit
  mis-marking / missing proof of service ~10%. NOTE: these figures come from an e-filing
  service provider's own marketing blog (bayareafile.com) — an interested party. The
  primary source that would settle it is the LA Superior Court EFSP rejection report:
  MUST OPEN: https://www.lacourt.org/newsmedia/uploads/14202413133737NTA24-01-03-2024-NEWEFSPREJECTIONREPORTS.pdf
- Bates numbering: a free, client-side, no-signup Bates/exhibit stamping tool exists
  (batesstamp.com), alongside Adobe Acrobat Pro, PDF-XChange, Bates Blaster.
  MUST OPEN: https://batesstamp.com/bates-stamp/

UPL — the legal boundary (snippet-level, but the cases are well identified):
- Unauthorized Practice of Law Committee v. Parsons Technology (Quicken Family Lawyer),
  179 F.3d 956 (5th Cir. 1999). District court held selling the software WAS the practice
  of law under Tex. Gov't Code s.81.101 and enjoined it. The Texas legislature then amended
  s.81.101 so that "the 'practice of law' does not include the design, creation, publication,
  distribution, display, or sale ... [of] computer software, or similar products if the
  products clearly and conspicuously state that the products are not a substitute for the
  advice of an attorney." The Fifth Circuit vacated the injunction in light of the amendment.
  MUST OPEN: https://law.justia.com/cases/federal/appellate-courts/F3/179/956/546619/
  => This is the single most important fact for this criterion: a *software safe harbor
  exists, it is statutory, it is state-by-state, and it is conditioned on a conspicuous
  disclaimer*. It was created by legislation, not by the court agreeing the software was fine.
- Upsolve, Inc. v. James, No. 22-1345 (2d Cir. 2025). Nonprofit wanted to train nonlawyer
  "Justice Advocates" to advise low-income New Yorkers on a check-the-box debt-collection
  answer form. All parties agreed the activity violated New York's UPL statutes; the fight
  was First Amendment. 2d Cir. held intermediate scrutiny applies; per snippet, an SDNY
  ruling of 2026-03-06 held the statute survives intermediate scrutiny and dismissed.
  MUST OPEN: https://law.justia.com/cases/federal/appellate-courts/ca2/22-1345/22-1345-2025-09-09.html
  and https://ww3.ca2.uscourts.gov/decisions/isysquery/2943c69f-c744-476e-8590-0d9f1a00b81d/3/doc/22-1345_opn.pdf
  => Individualized help choosing/completing a form for a specific person's situation is
  still UPL even when free, even when charitable, even in 2026.

REPO EVIDENCE (payability):
- products/il-biz-tools/src/lib/paddle.js and products/il-biz-tools/src/config/site.json
  — this repo already ships a Paddle-billed product for an Israeli owner. Direct self-serve
  SaaS billing to an Israeli seller is therefore a proven rail here. Marketplace rails
  (Clio App Directory, Microsoft AppSource, Tyler EFSP partner programs) are UNKNOWN — not
  checked, no budget left.

## Where this becomes unauthorized practice of law — the line, stated plainly

Safe (mechanical, no judgement about a person's situation):
- Arithmetic on published court rules: "Rule X says 30 days, the trigger date is D,
  weekends and listed court holidays excluded, therefore D+30 = date." Publishing the
  calculation and the rule citation is publishing, not advising.
- Format compliance checks on a PDF: page size, margins, font legibility, page numbering,
  text-searchability, file size, exhibit stamps.
- Filling a form with data the user typed, where the user chose the form.
- Selling a template to a *licensed attorney* who exercises judgement over it. Selling to
  lawyers moves the UPL risk almost entirely off us.

The line is crossed when the software:
- selects which form or which cause of action fits the user's facts;
- tells the user what to put in a field based on their circumstances;
- answers "should I file this / do I have a case / what does this mean for me";
- markets itself as a substitute for a lawyer, or omits the conspicuous disclaimer that
  the Texas safe harbor is expressly conditioned on.
Upsolve shows the personalisation line is enforced against *nonlawyers giving advice*;
Parsons shows the *software* line was only made safe by an express statutory carve-out
that not every state has. Selling to lawyers avoids the whole question. Selling to
consumers reopens it in 50 separate jurisdictions.

## The gate this criterion actually fails

It is not the legal gate. It is MISSION.md's "the owner does nothing" gate.
Legal software is a trust purchase with a malpractice tail: a missed deadline is a
malpractice claim, so firms buy court-rules products from vendors that employ licensed
attorneys to maintain the rulesets (CompuLaw's pitch is exactly that) and that carry
insurance. A no-brand, no-human, no-E&O vendor cannot credibly sell rules-derived
deadlines. Everything in this criterion that a software-only shop *can* honestly sell is
either (a) commodity utilities already free, or (b) plumbing sold to institutions through
human procurement.

## Findings (see structured output)
1. US court-deadline / rules-based docketing SaaS — legal GREEN, commercially closed.
2. E-filing pre-flight format checker — the one genuinely buildable, UPL-free item.
3. Word-template document assembly SaaS — squeezed between free docassemble and funded Gavel.
4. Docassemble/AssemblyLine implementation for legal aid and courts — real money, human sales.
5. Consumer self-help court-form filling — AMBER/RED on UPL. Do not build.
6. Bates/exhibit stamping micro-tool — commodity, free alternatives, dead end.

## Dead ends and what I could NOT check
- Israel-specific Hebrew legal admin (batei mishpat forms, Hotza'a Lapoal / execution office
  deadlines, Israeli lawyer document assembly): NOT SEARCHED. Search budget was exhausted on
  the US market and the UPL question, which the criterion explicitly asked for. gov.il and
  court.gov.il are egress-blocked. This is the highest-value unexplored corner of this
  criterion for an Israeli owner and should be handed to a scout with fresh budget. Note the
  Israeli analogue of the UPL question is the Bar Association Law (Chok Lishkat Orchei HaDin)
  s.20 reserved acts — I have NO evidence on it and did not check it; treat as unknown.
- No primary court source rendered. lacourt.org, gavel.io, lawtoolbox.com, justia.com,
  supremecourt.gov were never fetched — snippets only.
- GitHub 404s: SuffolkLITLab/EFSPIntegration README and docs (repo may be renamed/private);
  mcp__github__search_code with repo: filter returned 0 for that repo; search_repositories
  for Tyler EFM/Odyssey e-filing returned 0. So I have NO evidence about programmatic
  access to Tyler Technologies' e-filing manager, which is the gatekeeper for any real
  court-form *submission* automation in most US states. That is a decisive unknown for
  finding 2 and 4.
