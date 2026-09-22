# Scout notes — licensing-ip / ai-output-rights

**Criterion:** Who owns AI-generated output, and what each marketplace requires you to disclose:
the legal picture in 2026 for selling AI-made assets commercially.

**Scout:** WORKER-SCOUT "ai-output-rights", licensing-ip group. **Date:** 2026-09-05.
**Search budget spent: 7 of the 8 cap.** One left deliberately unspent for the scouts behind me.
Everything else below came from GitHub (`search_code` + `raw.githubusercontent.com`), which costs
no search budget, or from sibling scout files already in this directory.

---

## Evidence-grade key

- **[R] RENDERED** — I fetched the page and read it.
- **[S] SNIPPET** — a WebSearch result summarising a page I could not open. Weaker. The exact URL a
  human or unblocked agent must open is given each time.
- **[C] CODE** — first-hand source code in a public GitHub repo. Strong for "what the format/field
  is and who emits it", weak for "what a platform's written policy says".
- **[X] SCOUT** — an evidence claim already recorded by a sibling scout in this same directory.

**Blocked in this container (confirmed by attempt):** `artificialintelligenceact.eu` → EGRESS_BLOCKED.
Not attempted but blocked per sibling scouts and the sweep doc: `helpx.adobe.com`, `gov.il`,
`support.unity.com`, `legal.epicgames.com`, `submit.shutterstock.com`, `itch.io`.
**Every legal and policy claim below is [S] unless marked otherwise.** That is the single largest
weakness of this file and it must not be papered over: no primary legal text was rendered.

---

## Part 1 — Ownership: what the law actually says in 2026

### 1.1 United States — settled, and settled against us

**[S]** Search 2026-09-05, "US Copyright Office human authorship … Thaler v Perlmutter":

- *Thaler v. Perlmutter*, D.C. Cir., decided **18 March 2025**: human authorship is a bedrock
  requirement for copyright registration; an AI system cannot be the author. Works created **solely**
  by AI get no copyright.
- The **US Supreme Court denied certiorari on 2 March 2026.** This is no longer an open question in
  the US.
- Aligned with the **US Copyright Office January 2025 report** on copyright and AI: AI may assist,
  but the work must reflect human creative input to be registrable.

URLs to open to upgrade this from [S] to [R] (all unfetched here):
- https://media.cadc.uscourts.gov/opinions/docs/2025/03/23-5233.pdf (the opinion itself — primary)
- https://law.justia.com/cases/federal/appellate-courts/cadc/23-5233/23-5233-2025-03-18.html
- https://www.mayerbrown.com/en/insights/publications/2026/03/supreme-court-denies-review-in-ai-authorship-case
- https://www.hklaw.com/en/insights/publications/2026/03/the-final-word-supreme-court-refuses-to-hear-case-on-ai-authorship

**What this means for money.** You can *sell* an AI-generated asset. You largely cannot *own* it,
and where you cannot own it you cannot honestly grant an **exclusive** licence, cannot promise the
buyer freedom from third parties copying the same file, and cannot enforce. Every "exclusive
rights", "you own it outright", "royalty-free exclusive" line on an AI asset listing is, in the US,
a claim we cannot back. Under MISSION's honest-value constraint that closes the exclusive-licence
business model on pure AI output, independently of any marketplace's terms.

### 1.2 Israel — unresolved, and this is the jurisdiction that matters to us

**[S]** Search 2026-09-05, "Israel copyright AI generated output ownership Ministry of Justice":

- The Israeli **Ministry of Justice opinion of 18 December 2022** (Office of Legal Counsel and
  Legislative Affairs) concluded that using copyrighted works to **train** ML systems is generally
  permissible under existing Israeli Copyright Act exceptions (fair use / incidental / transient
  copy).
- **The opinion expressly does not cover output.** It addresses the learning process only. Multiple
  summaries make the same point: ownership of AI-generated output and liability for infringing
  output remain unanswered in Israeli law.
- So: **who owns AI output under Israeli law in 2026 = UNKNOWN.** Not "no one", not "the prompter" —
  unresolved. Nothing I found shows an Israeli statute, regulation or reported judgment settling it.

Primary document (Hebrew, **gov.il is egress-blocked here**):
- https://www.gov.il/BlobFolder/legalinfo/machine-learning/he/18-12-2022.pdf
  I tried the mirror route recommended in the sweep brief (search the document title/filename on
  unblocked hosts) but did not spend a search on it. **This is the highest-value single URL for an
  unblocked agent to open for this criterion, and I could not open it.**

Secondary, all [S] and all blocked or unfetched:
- https://herzoglaw.co.il/en/news-and-insights/ministry-of-justice-opinion-on-the-use-of-copyrighted-works-for-machine-learning-purposes/
- https://project-disco.org/intellectual-property/011823-israel-ministry-of-justice-issues-opinion-supporting-the-use-of-copyrighted-works-for-machine-learning/
- https://www.whitecase.com/insight-our-thinking/ai-watch-global-regulatory-tracker-israel
- https://www.gornitzky.com/innovation-and-regulation-finding-the-balance-for-ai/

### 1.3 The practical rule the group should adopt

Not legal advice, and I am not qualified to give it. But as an operating constraint that is safe
under every reading above:

> Sell AI-generated assets **non-exclusively**, describe the licence as a licence to *use* and never
> as a transfer of *ownership*, disclose AI involvement wherever a platform asks, and never state or
> imply that the buyer receives exclusive or enforceable copyright.

That formulation survives both the settled US position and the unsettled Israeli one.

---

## Part 2 — Disclosure: what each marketplace requires in 2026

Sibling scouts in this directory already covered three verticals in detail; I did not re-spend
budget on them and I cite them rather than repeat them.

### 2.1 Already covered by siblings — [X]

| Vertical | File | Headline |
|---|---|---|
| Stock photo/video | `licensing-ip--stock-media.md` | Adobe Stock, Freepik, Dreamstime, Vecteezy, 123RF **accept with mandatory labels**; **Shutterstock and Pond5 refuse AI outright**, both on the stated ground that contributors cannot prove IP ownership of model output — i.e. §1.1 above is the reason for the ban |
| Music / SFX | `licensing-ip--music-sfx.md` | AI audio **banned** at Envato/AudioJungle, Pond5, Bandcamp; **accepted with disclosure** on game-asset stores (Unity Asset Store, itch.io mandatory tagging since 2025) |
| 3D | `licensing-ip--3d-print-on-demand.md` | **TurboSquid refuses** AI content; **Fab / ArtStation accept if tagged `CreatedWithAI`**; Cults3D filters AI designs |

The pattern across all three is one fact, not three: **marketplaces whose product is a warranty of
provenance ban AI; marketplaces whose product is a catalogue accept it with a mandatory label.**

### 2.2 What I added — the non-stock marketplaces

**Adobe Stock** [S] (search 2026-09-05, confirming the sibling's finding independently): tick
"Created using generative AI tools" on all AI submissions; AI content barred from Illustrative
Editorial; model release still required for identifiable people, and you may only prompt with images
of people you hold a signed release for; property release for recognisable real property; contributor
warrants they hold rights from the AI tool provider.
→ https://helpx.adobe.com/stock/contributor/submit-your-content/submit-generative-ai-content/generative-ai-content-guidelines.html (BLOCKED)

**Amazon KDP** [S] (search 2026-09-05 — note: *every* result was an SEO blog from a KDP-tooling
vendor, not Amazon; treat accordingly):
- Disclosure is a **required field in the submission flow**, not optional.
- "AI-generated" = an AI tool produced the text/images/translation, **even if you then edited it**.
  If AI made the first draft, it is AI-generated.
- "AI-assisted" (brainstorming, grammar, refining human-written text) **need not** be disclosed.
- The disclosure is **internal to Amazon, not shown on the product page**, and is stated not to
  affect royalties or ranking.
- Non-disclosure is a terms violation → book blocked/removed, repeat violations → account
  termination.
URLs to close (all vendor blogs, no Amazon primary source found): https://kdpbuilder.com/blog/kdp-ai-disclosure-rules ,
https://www.aipolicydesk.com/blog/amazon-kdp-ai-disclosure-compliance-guide-2026 ,
https://www.inkfluenceai.com/blog/amazon-kdp-ai-disclosure-policy-2026
**An unblocked agent should open Amazon's own KDP content-guidelines page instead of any of these.**

**Etsy** [S] (same caveat — all sources were seller-tool vendor blogs):
- AI-made digital products are **permitted**; the policy regulates disclosure, not existence.
- Etsy "Creativity Standards" require disclosure when an item was created or materially assisted by
  AI — in the listing title/description.
- **New in 2026: a required tag for AI-generated or AI-enhanced images during listing creation**, and
  a requirement that product images depict the actual item.
- Non-compliance → listing removal or suppressed search visibility.
URLs to close: https://www.artomate.app/blog/etsy-ai-disclosure-policy-2026 ,
https://www.inkfluenceai.com/blog/etsy-ai-disclosure-explained-2026 (both vendor blogs; Etsy's own
Creativity Standards page is the one that matters and I did not reach it).

**Steam / Valve** [S] (search 2026-09-05):
- Disclosure mandatory since **January 2024**, **rewritten January 2026** to *exclude* AI dev tools
  (code assistants) and to cover only generative AI content **players actually experience**.
- Two categories: **pre-generated** (art, voice, music, dialogue, localisation, marketing shipped
  with the game) and **live-generated** (runtime NPC dialogue etc.), where the developer must also
  describe the guardrails preventing illegal/inappropriate output.
- Store page shows the disclosure publicly, before purchase.
- Scale claim [S, secondary]: "over 7,300 games on Steam have disclosed AI content" as of March 2026;
  a separate source says ~20% of games. Both are third-party counts, neither is Valve's number.

**Epic Games Store** [S]: **no mandatory AI disclosure.** Tim Sweeney publicly criticised Steam's
rule as enabling review-bombing. The asymmetry between the two biggest PC storefronts is itself the
finding. → https://legal.epicgames.com/epicgames/marketplace-disclosure-requirements (BLOCKED)

**Unity Asset Store** [S]: disclosure **not** required if only *marketing* material is AI-made;
**required** if any functional part of the asset is AI-generated or AI-assisted. Additionally,
AI/AI-assisted content **may not use keywords implying human effort** — "drawn", "hand drawn",
"painted" — anywhere in the submission. That last clause is the sharpest one I found anywhere: it
regulates the *vocabulary of the listing*, not just a checkbox.

**Sketchfab / Fab (Epic)** [S]: mandatory generative-AI labelling for 3D assets, alongside the
migration to Epic Games accounts. → https://www.gamedeveloper.com/business/sketchfab-to-require-mandatory-ai-disclosure-epic-games-accounts-for-users

### 2.3 The shape of the rule set, stated plainly

There is no single disclosure standard. As of September 2026 a seller of the same AI-made asset faces
at least **five incompatible mechanisms**: a metadata checkbox (Adobe), a specific literal tag string
(Freepik `_ai_generated`, Fab `CreatedWithAI`), free-text in the title or description (Dreamstime,
Etsy), a private submission-form declaration invisible to buyers (KDP), a public store-page banner
(Steam), plus **negative** requirements on wording (Unity's ban on "hand drawn") and outright bans
(Shutterstock, Pond5, TurboSquid, Envato). Any software that lists to more than one venue has to
encode all of them separately. **That gap is where the only real product in this criterion lives.**

---

## Part 3 — The EU AI Act, Article 50: live right now, and narrower than it looks

**[S]** Search 2026-09-05:

- **Article 50 transparency obligations became applicable 2 August 2026** — i.e. five weeks before
  today's date. This is in force, not upcoming.
- Four areas: direct interaction with a person; AI-generated content; emotion recognition/biometric
  categorisation; deepfakes and AI-generated text on matters of public interest.
- **Art. 50(2) — the marking duty — falls on the PROVIDER of the generative AI system**, who must
  ensure outputs are marked "machine-readable" and detectable as AI-generated. It does **not** fall
  on someone who merely resells an image a third-party model produced.
- **Art. 50(4) — deepfake and public-interest-text disclosure — falls on the DEPLOYER**, who must
  disclose to a natural person at first exposure, clearly. A deployer **may not** discharge this duty
  by pointing at the provider's machine-readable mark; a human-visible disclosure is separate.
- **Digital Omnibus:** most of Art. 50 is unaffected by the proposed delays. The exception, per the
  Council/Parliament provisional agreement of **7 May 2026**, is the marking obligation for
  synthetic-content systems **placed on the market before 2 August 2026** — delayed to
  **2 December 2026**. Content generated before 2 August 2026 needs no retroactive labelling.
- Commission published **final Guidelines on transparency obligations** and confirmed a **Transparency
  Code of Practice as adequate** in **July 2026**.

URLs to close (the first is the authoritative one; the second is EGRESS_BLOCKED, confirmed):
- https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations
- https://artificialintelligenceact.eu/transparency-rules-article-50/ → **BLOCKED**
- https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50
- https://datamatters.sidley.com/2026/06/24/eu-ai-act-transparency-obligations-preparing-for-compliance-by-2-august-2026/

**Why this matters commercially and why it is easy to get wrong.** The obvious read — "the EU now
requires AI images to be labelled, so sell labelling tools to asset sellers" — is wrong. The duty
lands on whoever *provides the generative system*, i.e. small SaaS products with a "generate an
image/copy" button, and on deployers publishing deepfakes or public-interest text. An Israeli seller
uploading AI art to Etsy is bound by **Etsy's** rules, not by Art. 50(2). Any product built here must
be sold to the generator-operator, not to the asset seller. A finding that ignores this is selling
compliance theatre, which the constitution forbids.

---

## Part 4 — The technical standard, and this is the strongest evidence in the file

This is the one place I got **[C] CODE-grade** evidence, using `search_code` for
`trainedAlgorithmicMedia digitalSourceType` (2,608 hits, 2026-09-05):

- The machine-readable marking primitive in practice is **C2PA Content Credentials** carrying an
  **IPTC Digital Source Type** URI. The AI values are:
  - `http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia` (generative AI)
  - `.../compositeWithTrainedAlgorithmicMedia`
  - `.../compositeSynthetic`
  - `.../algorithmicMedia` (non-AI algorithm)
- **[R]** `contentauth/c2pa-rs` — the reference Rust implementation, creates/signs/embeds and
  validates C2PA manifests, ships a **CLI ("C2PA Tool")**, and is **dual MIT / Apache-2.0**. So the
  whole stamping stack is free to build on commercially.
  → https://raw.githubusercontent.com/contentauth/c2pa-rs/main/README.md (fetched 2026-09-05)
- **[C]** Model vendors already embed it. `storytold/artcraft` hard-codes the exact manifest bytes
  emitted by two commercial generators:
  - `crates/lib/video_info/src/sora_info.rs` — `"Generated by OpenAI."` +
    `digitalSourceType = .../trainedAlgorithmicMedia`
  - `crates/lib/video_info/src/veo_info.rs` — `"Created by Google Generative AI."` + the same
    digitalSourceType + `"Applied imperceptible SynthID watermark."`
- **[R/C] A real marketplace already reads it.** `modrinth/code`,
  `apps/frontend/src/helpers/c2pa.ts`, defines `AI_DIGITAL_SOURCE_TYPES` = the three AI URIs above
  and a `fileDeclaresAi()` predicate that scans an uploaded file's C2PA manifest.
  → https://raw.githubusercontent.com/modrinth/code/main/apps/frontend/src/helpers/c2pa.ts
    (fetched 2026-09-05; the fetch showed the detector but **not** what Modrinth does with the
    result — whether it labels, blocks or merely records is **unverified**.)
- Also CODE-grade that the vocabulary is broadly implemented: `contentauth/c2pa-swift`,
  `TrustNXT/c2pa-ts`, `duggaraju/c2pa-go`, `trufo-ai/trufo-py`, `spatie/schema-org`,
  `unjs/unhead`, `nystudio107/craft-seomatic`, `wikimedia/mediawiki` (localised EXIF labels for
  `exif-digitalsourcetype-trainedalgorithmicmedia` in dozens of languages), and Apple —
  `blacktop/ipsw-diffs` shows `Freeform` in iOS 26.1 gaining both AI digitalSourceType strings and an
  `isAILabelingEnabled` symbol.

**Conclusion from Part 4:** AI-provenance marking is not a proposal. It is a shipped, multi-vendor,
open-licensed format that generators emit and at least one marketplace's upload path already parses.
The direction of travel is automated detection at upload, not self-declaration.

---

## Part 5 — What could actually be sold, honestly

### 5.1 Marketplace AI-disclosure rules, as a machine-readable API — the one real candidate

Part 2.3 is a genuine, verified integration burden: five incompatible mechanisms, some of them
*negative* (banned keywords), several changed within the last twelve months (Steam rewrote its form
in Jan 2026; Etsy added an image tag in 2026; Fab/Sketchfab added labelling in Dec). A versioned JSON
API — per marketplace: accepted / banned, the mechanism, the literal tag string, the exact field,
banned keywords, the penalty, a `last_verified` date and a source URL — plus a change feed, is
buildable in well under 40 hours on the rails we already have.

**Buyer, named, not "everyone":** the vendors who are *already spending money* on this problem as
content marketing. The 2026 search results surfaced at least seven commercial listing-tool companies
publishing KDP/Etsy AI-compliance guides — `kdpbuilder.com`, `univers.studio`, `inkfluenceai.com`,
`artomate.app`, `inkrify.com`, `shakespeareai.net`, `aipolicydesk.com`. A listing-automation tool has
to encode these rules or its users get delisted; maintaining that table by hand is exactly the sort of
job a small vendor would rather rent.

**Honest weaknesses, stated up front:**
1. The demand evidence is *inference from content marketing*, not a single observed purchase.
   Nobody in these results says "I would pay for a rules API". Confidence on demand: **low**.
2. Our own source data would be **SNIPPET-grade** — the very pages we would need to read to build the
   table (helpx.adobe.com, Etsy policies, Unity support, Epic legal) are egress-blocked in this
   container. A compliance product built on blogs about policies rather than policies is exactly the
   dishonest-confidence failure MISSION warns about. **This must be built from rendered primary
   policy pages or not at all**, which means it is blocked on an unblocked fetch path, not on
   engineering.
3. The rules are small in number (~15 venues) and public. A competitor can copy the table in a day.
   The only defensible part is *freshness* — the change feed — and freshness is an ongoing crawl of
   blocked domains.

### 5.2 C2PA provenance stamping as a paid API — technically clean, buyer thin

Everything needed is MIT/Apache (`c2pa-rs` + CLI), the field values are settled, and it is a pure
batch transform: in → signed image with `trainedAlgorithmicMedia` + creator assertions → out. Fits
the `x402-il-api` shape already shipped.

But the buyer is the problem, and Part 3 is why: the Art. 50(2) marking duty is the **generator
operator's**, and the large generators (OpenAI, Google) **already embed it themselves** — CODE-grade,
Part 4. So the addressable buyer is the narrow band of small EU-facing SaaS with a generate button
that have not implemented C2PA, in a window that closes 2 December 2026 for pre-existing systems.
Signing also needs a certificate from a recognised trust list to be worth anything — self-signed
credentials are validated as untrusted — and I did **not** establish the cost, availability or
eligibility of a C2PA conforming-signer certificate for an Israeli entity. **Unresolved and
potentially disqualifying.**

### 5.3 A free "will this listing pass?" disclosure checker, with a Pro tier

The `il-biz-tools` shape: paste your listing, pick your venue, get the exact checkbox/tag/wording
required and the banned keywords flagged. Free tier for individual sellers, Pro for bulk/CSV.
Cheap to build on the 5.1 data — it is the consumer face of the same table. Same fatal dependency:
the table must come from primary policy pages we cannot currently reach. Ceiling on individual
sellers paying for a compliance checker is, honestly, very low.

### 5.4 Not to build

- **Selling AI assets with exclusive/ownership language.** §1.1: no US copyright subsists in pure AI
  output and cert was denied 2 Mar 2026, so the promise cannot be kept. **AMBER at best, and RED the
  moment the listing says "exclusive" or "you own it".** This constrains the whole `licensing-ip`
  group, not just this criterion.
- **Legal templates / "AI rights compliance packs".** We are not lawyers, the Israeli position is
  genuinely unresolved (§1.2), and selling documents that read as legal advice on an unsettled
  question is the deceiving-a-buyer failure mode. **AMBER → do not build.**
- **AI-provenance *stripping*.** `search_code` surfaced live repos in this space
  (`wiltodelta/remove-ai-watermarks`, `guillaumemeyer/watermarks-remover`). Removing a
  `trainedAlgorithmicMedia` mark to pass a marketplace filter is deception of the buyer and, from
  2 Aug 2026, likely circumvention of an Art. 50 obligation. **RED. Recorded here only so that no
  future scout mistakes it for an opportunity.**

---

## Dead ends and unclosed questions

1. **No primary legal text was rendered.** Not the D.C. Circuit opinion, not the Israeli MoJ opinion,
   not the AI Act, not the Commission guidelines. Everything in Parts 1 and 3 is [S].
2. **Israeli ownership of AI output is genuinely unresolved**, not merely un-researched by me. The
   2022 MoJ opinion covers training and says so explicitly.
3. **No marketplace's own AI policy page was rendered** — every one is egress-blocked. The KDP and
   Etsy findings rest entirely on vendor SEO blogs, which is the weakest evidence in this file.
4. **C2PA signing-certificate economics for an Israeli entity: unknown.** Unresolved and it may be
   the thing that kills 5.2.
5. **What Modrinth does with `fileDeclaresAi()` is unverified** — detector confirmed, consequence not.
6. **No observed purchase anywhere in this criterion.** Not one data point of someone paying for
   AI-disclosure compliance tooling. Every ceiling below is an estimate with nothing under it.
7. **Ceilings are estimates, not evidence.** Nothing in this criterion produced a revenue figure,
   a price point charged by anyone, or a user count. I did not invent one.

---

## Full URL list (every URL touched)

Fetched and rendered [R]:
- https://raw.githubusercontent.com/c2pa-org/specifications/main/README.md
- https://raw.githubusercontent.com/contentauth/c2pa-rs/main/README.md
- https://raw.githubusercontent.com/modrinth/code/main/apps/frontend/src/helpers/c2pa.ts
- GitHub `search_code`: `trainedAlgorithmicMedia digitalSourceType` (2,608 results, 2026-09-05)

Attempted and BLOCKED:
- https://artificialintelligenceact.eu/article/50/ → EGRESS_BLOCKED

Seen only as search results [S] — listed in the body above, principally:
- https://media.cadc.uscourts.gov/opinions/docs/2025/03/23-5233.pdf
- https://www.gov.il/BlobFolder/legalinfo/machine-learning/he/18-12-2022.pdf
- https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations
- https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50
- https://helpx.adobe.com/stock/contributor/submit-your-content/submit-generative-ai-content/generative-ai-content-guidelines.html
- https://legal.epicgames.com/epicgames/marketplace-disclosure-requirements
- https://assetstore.unity.com/publishing/submission-guidelines
- https://www.gamedeveloper.com/business/sketchfab-to-require-mandatory-ai-disclosure-epic-games-accounts-for-users
