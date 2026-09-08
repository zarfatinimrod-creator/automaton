# Audit — group `licensing-ip`

Auditor, wave 9. I do not report to this group's supervisor; I check it. Default is scepticism:
anything I could not verify myself is not CONFIRMED. A "zero survivors" verdict gets the same
treatment as a padded list — in both directions.

**Group verdict: the headline SURVIVES, two of its three walls do not. Zero survivors is the
right answer and I would revive nothing. Corrected group revenue: today ₪0 (`state/colony/REPORT.md`,
30-day revenue ₪0.00, no transaction id anywhere in `state/`). Month one: ₪0. Honest 12-month
figure for the whole group: ₪0/month.**

The supervisor reached the right verdict through two walls that do not hold as stated and one that
holds only after correction. That matters more here than usual, because a wall is a **re-open
trigger**: a future session that finds "the price floor is zero" and "every venue refuses AI" both
false — and both are refutable from this group's own evidence in under an hour — will conclude the
group was closed carelessly and re-open all of it. The narrower wall I state below is the one that
actually holds, and it is the one worth writing into `docs/REJECTED.md`.

Two hard factual errors sit under the report. The group researched **an icon marketplace that had
been shut for ten months**, and it measured its lines against **₪20,000/month** — the whole mission
target — rather than this repo's own ₪300/month reject floor, which understates by a factor of
roughly 66 how much traffic the one venue with a real rate would actually need.

---

## Egress note (method, stated up front)

Attempted and EGRESS_BLOCKED from this container: `help.author.envato.com`, `shotkit.com`,
`webiano.digital`, `www.iconfinder.com`, `hackaday.com`. Rendered successfully:
`raw.githubusercontent.com` (five files, listed inline). GitHub `search_code` reached across
GitHub and cost no search budget.

**Searches spent: 8 of 8.** Listed at the end.

The supervisor's egress claim is right in substance and contains one error worth naming — see
error 3.

---

## Wall 1 — "the price floor for a licensable digital asset is zero, and it is structural" — **DOWNGRADED**

**As stated: false. Corrected: the price floor is zero for the asset classes this colony can
actually produce, which is a narrower and more useful claim.**

### Attack 1 — the evidence cited for it is disallowed by this repo's own rule

Wall 1 rests on two `awesome-*` lists: `neutraltone/awesome-stock-resources` (~100 free vs 6 paid)
and `notlmn/awesome-icons` (~50 free vs 4 paid). I rendered both.

`neutraltone/awesome-stock-resources` describes itself as *"A curated list of awesome stock
photography, video and illustration websites"*, organised **by licence type** (CC0, public domain,
attribution) with a **"Paid Resources" section at the end**. Its free:paid ratio is a property of
its own editorial structure, not a measurement of the market. `notlmn/awesome-icons` states no
free-only inclusion criterion at all, so its ratio measures the maintainer's taste.

`docs/AWESOME_ROUTE.md:20` and `:110` of this repository say, in as many words: *"It is not
evidence of demand, of revenue, or of payability to Israel… Cite the list as a directory, never as
evidence of demand."* A price floor is a claim about what buyers will pay. The `stock-media` scout
got this exactly right and labelled its own list *"a DIRECTORY; it proves the resources exist, not
that anyone buys"* — and the supervisor promoted that same directory into the group's **first
wall**. The rule was written down, on disk, for this reader.

### Attack 2 — per asset class, which the supervisor never did. Three classes have a live, published, non-zero price

The brief for this audit was to attack the floor per class, not in aggregate. Doing so:

| Asset class | Demonstrated non-zero price | Grade |
|---|---|---|
| **Hebrew retail fonts** | `fontbit.co.il` price list, re-derived by me 2026-09-06: **₪450 for a single weight; ₪350/weight from two weights up; ₪590 for a single weight per web domain up to 50,000 monthly pageviews.** A live Israeli storefront with a published מחירון | search snippet quoting `fontbit.co.il/מחירון-הגופנים/` (host not renderable) |
| **Stock stills, at Adobe** | **$0.33–0.99 per download** (33% of net). $0.33 ≈ ₪1.22 — that is not "a fraction of a shekel" | snippet, group's own |
| **Self-serve commercial code licence** | Qt for Application Development, small-business tier, **€546/yr**, published, card checkout | snippet, group's own (`dual-licensing`) |
| Generic stock photo/vector | **zero** — Unsplash/Pexels/Pixabay, CC0, always free | holds |
| Icons | **zero, and newly so** — see the mechanism below | holds, with a better reason than the supervisor gave |
| Consumer STL files | **zero** — Printables and Thingiverse give them away | holds |
| Datasets we can prove provenance for | **zero** — `data.gov.il` is free at source | holds |

So the wall is real for four classes and false for three. The supervisor's aggregate phrasing
erases the distinction, and the distinction is the whole point: **the floor is zero for generic
assets with a one-line free substitute, which is precisely what a prompt-to-upload pipeline
produces.** That is MISSION constraint 8 restated, and stating it that way makes it directional
rather than defeatist.

### Attack 3 — the mechanism the supervisor missed, which is worth more than the directory count

The paid icon tier did not merely face free competition. **It collapsed into the cheapest venue in
the group, on a dated event.** Iconfinder — 50/50 split, $2 minimum price, the venue the
`fonts-icons` scout graded Israel-payable — **shut down on 15 November 2025.** Its founder, in his
own words:

> "Iconfinder, the company I founded in 2011, is shutting down tomorrow… In 2022, @Iconfinder was
> acquired by @freepik, and now it's time to sunset the service… there's an excellent substitute
> for Iconfinder in @flaticon."
> — Martin LeBlanc, `x.com/martinleblanc/status/1990137085806670158`

Freepik's contributor rate is **$0.04–0.07 per download**. So the $2-minimum icon marketplace was
absorbed by the $0.05-per-download one. That is a first-party, dated account of the price floor
falling, and it is worth more than counting entries in a curated list. **Wall 1's conclusion
survives on this evidence; it does not survive on the evidence the supervisor gave for it.**

---

## Wall 2 — "every venue that holds real money refuses our supply, or requires a human" — **REFUTED as stated, replaced**

This is the wall the brief told me to attack hardest, and it does not survive contact with the
group's own files.

### Attack 1 — the supervisor's own §5.1 says the opposite

`groups/licensing-ip.md` §5.1, verbatim: *"marketplaces whose product is a **catalogue** accept it
with a mandatory label (Adobe, Freepik, Dreamstime, Fab, Unity, itch.io)."* Six named venues that
accept our supply, in the same document whose first wall says every venue refuses it. And §3 grades
Adobe *"GREEN on terms, payable to Israel… and end-to-end automatable at the ingestion layer"* —
i.e. one venue that accepts AI supply, holds real money, and pays an Israeli. Wall 2 is contradicted
three times inside the report that states it.

### Attack 2 — on at least one paying venue the honest AI declaration is settable by API, not by a human

This is the group's strongest technical evidence and the supervisor never connected it to his own
wall. Cults3D's `createCreation` GraphQL mutation takes **`madeWithAi` as a writable argument**. I
verified it myself, independently of the scout:

- `raw.githubusercontent.com/CheekyCodexConjurer/cults3d-api-docs/main/data_dictionary.md`
  (rendered 2026-09-06): `createCreation` arguments are
  `name, description, categoryId, subCategoryIds, downloadPrice, currency, licenseCode, imageUrls,
  fileUrls, tagNames, metaTags, madeWithAi`; the field is *"listed as an argument in both
  `createCreation` and `updateCreation` mutations"* and *"filterable in `creationsBatch`"*.
- Corroborated across independent repos by `search_code` for `madeWithAi`: `metorial/metorial`
  (`integrations/cults/src/tools/create-creation.ts`), `fredonia88/destl`, `comarni/renderHub`,
  and a July-2026 docs snapshot at `reclear-io/llmref`.

So: a marketplace that takes money, whose publishing **and** whose AI disclosure are both
API-driven, with no portal and no human. Wall 2 says this cannot exist. It exists.

### Attack 3 — the ban is a media-marketplace fact, applied by the supervisor across the whole group

Every venue in the RED table bans AI in **photo, video, audio or 3D-art** supply: Shutterstock,
Pond5, Envato/AudioJungle, TurboSquid, icon-icons. Not one of those bans reaches a **font**, a
**dataset**, or a **code licence** — three of this group's eight criteria. Those three die on
other grounds (OFL clause 1; Israeli Amendment 13 and free source data; the absence of prior
adoption), and the supervisor's own §4 kills them on exactly those grounds. But Wall 2 is stated
group-wide, and group-wide it is not true.

### Attack 4 — venues with real money that **no agent in this group checked**

Nine agents, ~55 searches, and these were never named once. I checked the repo: none of them appears
anywhere else in `docs/REJECTED.md`, `research/colony-sweep/groups/` or `audits/` either, so they
were not deduplicated away — they were missed.

- **Creative Fabrica** (Amsterdam). A live digital-asset marketplace selling exactly this group's
  categories — fonts, icons, SVG, templates — that runs its **own** AI generators, i.e. the one
  large venue whose business model makes an AI ban implausible. It supports the wall's *conclusion*
  from the seller's side, which is why it should have been in the report: an independent contributor
  account (`thetexturequeen.com`, "My first two months selling on Creative Fabrica") describes
  commissions as *"so tiny that it takes several months to earn even small amounts"*, with **50% to
  the platform on a sale to a non-member**.
- **Canva Creators.** Canva has committed **$200 million in content and AI royalties to its creator
  community over three years**, and updated its Contributor Agreement on **14 January 2026** for
  "tax, sanctions and financial-crime compliance". Its AI relationship runs the *opposite* way from
  everything in this report — Canva **pays creators for the right to train on their human-made
  content** (the Creator Compensation Program / Magic Creators Payment Model), rather than accepting
  AI-made content. That inversion is the shape MISSION constraint 8 asks for, and this group never
  considered it. Payout countries unstated; Israel UNKNOWN.
- **Getty/iStock** and **Alamy** — the `stock-media` scout marked both "not established" and ran out
  of budget; the supervisor did not schedule either.

Naming venues you did not check is not optional in a report whose first claim is a universal
quantifier over venues.

### The wall that actually holds — write this one down instead

> **The venue that pays the only non-trivial rate requires a human action in a portal on every
> batch, and every venue whose publishing is fully API-driven either hides AI-declared work by
> default or pays $0.04–0.07 a download.**

That is narrower, it is true, it survives all four attacks above, and it names its own re-open
condition (§ "Adobe Stock" below) instead of inviting a future session to re-litigate a universal
claim it can falsify in an hour.

---

## Wall 3 — "the venues that take our supply pay fractions of a shekel, and mostly cannot be shown to pay an Israeli at all" — **DOWNGRADED**

**The first half is true of four venues and false of the one that matters. The second half states
an evidence gap as a fact.**

- **"Fractions of a shekel" — CONFIRMED** for Freepik ($0.04–0.07/download), itch.io ($0–10 packs
  against free competitors) and, on new evidence I found, Creative Fabrica. **REFUTED for Adobe**,
  at $0.33–0.99 per download — ₪1.22–3.66. The supervisor's own §3 concedes the point ("the
  economics are secondary and were never established") and then Wall 3 asserts the opposite in the
  headline.
- **"Cannot be shown to pay an Israeli" — this is UNKNOWN, and UNKNOWN is the right posture, but it
  is not a fact about the venues.** The supervisor writes it as one. He also states in §5.3 that
  payability was closed *"for **zero** music, 3D, icon, font or dataset venues"* — which contradicts
  his own `fonts-icons` scout (Creative Market graded YES at medium confidence, on Creative Market's
  own stated policy of guaranteeing one fee-free payout method in every country) and the repo's own
  rendered finding that **Gumroad pays an Israeli bank account in ILS** (`docs/REJECTED.md` ≈ line
  612, cited by the `datasets` scout). Downgrading medium-confidence YES to "not closed" is correct;
  restating it as "zero venues" erases the difference between *graded and not rendered* and
  *no evidence at all*.
- And the icon venue in that sentence **did not exist on the day it was graded.** See error 5.

**Corrected Wall 3:** *payability is UNKNOWN for every venue in this group except Adobe Stock, and
UNKNOWN is a reason not to build, not a finding about the venues.*

---

## Candidates and claims — verdict by verdict

### Adobe Stock, labelled AI portfolio — **CONFIRMED dead, on stronger evidence than the supervisor had, and for a corrected reason**

The supervisor's §1 kill is the single most load-bearing finding in the group and it was
snippet-grade. I upgraded it, independently, without spending a search:

1. **The CSV has five columns and none of them is an AI flag.** GitHub `search_code` for the literal
   Adobe Stock header `Filename,Title,Keywords,Category,Releases` returns **27 files across ~14
   independent repos** (`riefkyhd/adobe-stock-csv-generator`, `eoyilmaz/stocker`, `c0desk1/adogen`,
   `savelevvo/photostock-csv-skills`, `querl369/adobe-stock-uploader`, `samjan190799-cmyk/StockFlow.ios`,
   `zcodex-dev/sela`, `onlysigma/adobe-auto-tool`, …). I rendered
   `riefkyhd/adobe-stock-csv-generator/docs/CSV_SPEC.md`: five columns, **"does not include any
   column for flagging AI-generated or generative AI content"**.
2. **There is no contributor upload API at all.** `ibank31/stockforge-ai`,
   `docs/archive/2026-08-25/research/ADOBE_CONTRIBUTOR_UPLOAD_AUTOMATION_2026.md` (rendered
   2026-09-06) — a third-party engineering research doc dated 2026-08-25, written to build exactly
   this pipeline — states: *"the API does **not** support Stock Contributor use cases: there is no
   contributor API to upload new Stock content"*; all contributor actions *"must occur in the
   Contributor Portal"*; the GenAI declaration *"is not a listed CSV column, so StockForge must keep
   an explicit per-asset declaration manifest and require portal confirmation instead of pretending
   CSV applied it."*
3. **New, and it is the harder blocker:** the same doc records that in its recommended workflow
   *"login and CAPTCHA remain user-controlled."* A CAPTCHA on the contributor portal login defeats
   the supervisor's fallback ("an unattended browser agent") without anyone needing to read Adobe's
   automation terms.

**But the supervisor's arithmetic around it is wrong, and the correction makes the ops kill more
important, not less.** §4 states that Freepik *"needs 75,000–135,000 downloads a month to reach the
mission target"*, and the `stock-media` scout says Adobe needs *"5,500–16,000 downloads every month,
forever"*. Both are computed against **₪20,000/month — the entire mission target for the whole
portfolio.** MISSION says in as many words that the target is reached by several lines summing to
it, and this repo's own reject floor is **₪300/month**. Against the real bar:

| Venue | Rate | Downloads/month for **₪20,000** (supervisor's bar) | Downloads/month for **₪300** (the repo's bar) |
|---|---|---:|---:|
| Adobe Stock | $0.33–0.99 | 5,500–16,000 | **~82–246** |
| Freepik | $0.04–0.07 | 75,000–135,000 | **~1,160–2,030** |

Adobe needs roughly **80 to 250 paid downloads a month**, not 16,000, to clear this repo's own
floor. That is not an absurd number, and it means **economics were never what killed this line.**
The ops gate is the whole of it — which is why upgrading that gate from a community-forum snippet to
a code-corroborated fact was the right use of the group's attention, and why it is the only thing
worth re-checking.

Verdict: **CONFIRMED dead. Ceiling ₪0.** Not because 16,000 downloads are unreachable, but because
every batch needs a human in a portal behind a CAPTCHA, and because there is still not one credible
dated figure for what a day-one AI portfolio earns.

### monday.com marketplace paid app — **CONFIRMED not rankable** (agreeing with the supervisor)

The supervisor recorded a verified rail and refused to rank it, citing `audits/vertical-niches.md`
§2, which refuted a different supervisor for ranking exactly this shape (Wix) with the channel
verified and the product unchosen. That is the correct call and it is the best judgement in the
report. I have nothing to add against it and I decline to spend budget re-verifying a rail nobody
is proposing to use. One correction: the "869 apps at 31 Dec 2025, 704 with native monetization"
datum is called *"an SEC-filing-grade size datum"*; the scout obtained it from a **search snippet
quoting** the 20-F, not from the filing. Snippet, not filing-grade.

### Self-serve white-label tier on `il-biz-tools` — **CONFIRMED ₪0**

And the supervisor's refutation of the `white-label` scout's "Paddle already pays us" is correct and
well-cited: `docs/REJECTED.md:685-694`, *"Paddle **code** ships. No Paddle **account** exists."* I
re-read that passage and `state/colony/REPORT.md` (30-day revenue ₪0.00). Confirmed. This is the
report's best single act of internal auditing.

### Cults3D API-published catalogue — **DOWNGRADED reasoning, same ₪0 verdict**

The supervisor rejects it on a default-on "No AI" filter that no agent rendered. I spent a search
and the claim **holds** at snippet level from `cults3d.com/en/pages/filtering-ai-generated-designs`:
a "No AI" filter enabled by default site-wide, models identified as AI-created *"do not appear in
search results or on other pages of the platform"* by default, with a user setting
*"🙅 Hide creations made with AI"*; AI models remain allowed but their visibility is regulated.

What the supervisor should have said, and did not: **this is the only venue in the group where an
honest AI declaration is machine-settable** (above), so it is the only place where his own Wall 2
fails — and the thing that kills it is a *ranking* fact, not a *supply* fact. It then dies again on
Israel payability (Hyperwallet or Payoneer, Cults3D's own eligibility list unrendered; I spent a
search and could not close it) and on the absence of any demand evidence for a parametric-STL
catalogue, against Printables and Thingiverse giving STLs away. **₪0.** The scout's ₪500/month with
an admitted "buyer NOT ESTABLISHED" under it was rightly not carried forward.

### AWS Data Exchange excludes Israel — **CONFIRMED first-hand, third rendering**

I fetched `raw.githubusercontent.com/awsdocs/aws-data-exchange-user-guide/main/doc_source/provider-getting-started.md`
myself (2026-09-06). Eligible jurisdictions: Australia, Bahrain, EU member state, Hong Kong SAR,
Japan, New Zealand, Norway, Qatar, Switzerland, UAE, UK, US. **Israel absent.** Plus, verbatim:
*"To provide data products, you must also request on-boarding through the Create case wizard for
AWS Support."* Two independent disqualifiers, both rendered. The `datasets` scout's separation of
this from the AWS **Marketplace software** seller list (which does include Israel) is a genuine
correction and should be preserved.

### OFL Hebrew fonts unsellable — **CONFIRMED, with one exception that makes "unconditional" wrong**

I fetched `google/fonts/main/ofl/heebo/OFL.txt` myself: *"Neither the Font Software nor any of its
individual components, in Original or Modified Versions, may be sold by itself"* plus the Reserved
Font Name clause. Holds.

But the supervisor calls it **"Unconditional"**, and it is not, because his own corpus contains a
counter-example. The `fonts-icons` scout ran `repo:google/fonts … path:ofl` — a query that can only
return OFL files — and reported *"62 families with a Hebrew subset, all OFL, all free"*, where "all
OFL" is an artefact of the filter, not a finding. I re-ran the count (**62**, confirmed) and then
ran the same search over `path:apache`: **`apache/opensanshebrew` and `apache/opensanshebrewcondensed`**.
I fetched their licence: **Apache-2.0, which contains no clause prohibiting sale** and expressly
permits redistribution "in any medium, with or without modifications". So two Google Hebrew families
*can* lawfully be sold as derivatives. It changes no verdict — a paid derivative of a free
Apache-licensed font faces the same zero floor — but "unconditional" is the kind of absolute a future
session will act on without re-checking.

### Iconfinder — **REFUTED. The venue does not exist.**

See error 5. This is not a downgrade of a ceiling; it is a rejection of a marketplace that closed
ten months before the report was written.

### Unity Asset Store — **the rejection is right and was already on disk**

`docs/REJECTED.md:649`: *"### Unity Asset Store — REFUTED to ₪0"*, from the `storefronts` group,
audited 2026-09-04, on the same reasons (Israel payability UNKNOWN, no programmatic listing path).
Two scouts in this group (`music-sfx`, `3d-print-on-demand`) re-swept it and the supervisor
re-rejected it in §4 without noticing. No wrong verdict resulted — only spent budget — but it is
the same duplication offence `audits/vertical-niches.md` convicted its supervisor of, one wave
earlier, in a file on disk.

---

## The supervisor's own errors

1. **Built Wall 1 on two `awesome-*` directories**, in defiance of `docs/AWESOME_ROUTE.md:20`
   ("not evidence of demand, of revenue, or of payability") and of the `stock-media` scout's own
   explicit "DIRECTORY, not demand" label on the same file.
2. **Wall 2 is contradicted by the report's own §5.1 and §3**, and by the group's strongest
   technical evidence (`madeWithAi` writable in `createCreation`). A universal quantifier over
   venues, falsified inside the same document.
3. **Internal contradiction in the egress note.** §1 ends: *"Not one marketplace policy page,
   royalty page or **payout-country page** was rendered by any of the nine agents in this group."*
   Two rows above, in the same table, he records rendering the AWS Data Exchange **provider
   eligibility list** — a seller-country page — and the `datasets` scout rendered it first. The
   companion sentence ("the only pages any agent rendered are on `raw.githubusercontent.com`") is
   true; the payout-country sentence is false.
4. **Measured the group against ₪20,000/month, not the repo's ₪300/month floor.** Corrected in the
   table above: Adobe ~82–246 downloads/month, Freepik ~1,160–2,030. The 75,000–135,000 figure is
   rhetorically decisive and analytically off by 66×, and it is repeated as one of the three walls.
5. **Carried a dead marketplace through the entire report.** Iconfinder was **shut down on
   15 November 2025** — announced by email in October 2025 (an email sent with CC instead of BCC,
   exposing every recipient's address), founder's statement quoted above, Freepik-owned since 2022,
   traffic pointed at Flaticon. The `fonts-icons` scout quoted its live contributor guide, graded
   Israel payability **YES (medium)** and listed it as a channel; the supervisor put "Iconfinder icon
   sets" in §4 as a live venue whose *"AI policy [is] unread"* and counted it in §5.3's payability
   tally. **The AI policy of a marketplace that no longer exists is not an open question.** Search
   snippets return cached pages; nobody checked whether the shop was open.
   And the detail that should outlive the error: **contributors who had not verified their accounts
   lost their balances.** That is a dated, first-party demonstration of MISSION rule 2 — a balance on
   a platform is not money — and it is the best negative-knowledge item in the group.
6. **"Israel payability was closed for zero icon, font, music, 3D or dataset venues"** contradicts
   his own `fonts-icons` scout (Creative Market, YES-medium) and the repo's rendered Gumroad-pays-ILS
   finding.
7. **Asserted a causal claim about the AI bans that the dates refute.** §5.1: the bans are *"downstream
   of US copyright law, not of taste, so [they] will not soften while Thaler stands."* Envato's ban
   dates to **2023** and Shutterstock's and Pond5's predate the D.C. Circuit's **18 March 2025**
   decision; a 2025–26 case cannot be upstream of a 2023 policy. *Thaler* also concerned a work its
   applicant affirmatively claimed had **no human author at all**; cert denial (2 Mar 2026) settles
   that, not the copyrightability of AI-assisted work. The §4 phrasing ("no copyright in purely
   AI-generated output") is accurate; the §5.1 forecast built on it is not.
8. **Called a community-forum snippet "a second, independent source"** for the Adobe checkbox. Both
   it and the scout's reading describe the same Adobe policy. (The finding is nonetheless correct —
   I confirmed it from genuinely independent code, above.)
9. **Upgraded a search snippet to "SEC-filing-grade"** for the monday.com app counts.
10. **Re-swept the Unity Asset Store**, refuted to ₪0 on disk in `docs/REJECTED.md:649` one wave
    earlier.
11. **Never states the group's ledger position as a number.** "Ranking ZERO survivors" is a ranking
    statement. Under MISSION rule 2 the group has earned **₪0**, and that is the sentence the board
    reads.

**Credited, because they are better than most of this sweep:** the §1 self-verification table, which
overturned a scout's open question rather than inheriting it; the refutation of "Paddle already pays
us" from our own repo; the refusal to launder Medium testimonials and platform marketing blogs into
ceilings ("I will not launder them into a ceiling" is the right sentence); the refusal to re-rank
monday.com after `vertical-niches` refuted the identical shape; and §6's explicit **"NOT owner
blockers"** list, which stops a future session filing a disqualifier as a schedulable step.

---

## Angles the group missed entirely

1. **A marketplace can close, and a contributor balance is not money.** No scout asked what happens
   to unpaid earnings when a venue shuts. Iconfinder answers it: verified accounts over $20 were
   paid; unverified contributors lost their balances. Any future asset-marketplace proposal should
   carry this as a standing risk line.
2. **Creative Fabrica and Canva Creators** — two live venues with real money in this group's exact
   categories, named by nobody, and absent from every other file in the repo. Canva's is the more
   interesting omission: it pays creators **for training rights to human-made content**, which is
   the inverse of everything this group researched and is a MISSION constraint-8 shape (an input
   somebody must pay for) rather than an asset sale.
3. **Hebrew speech and TTS — the one Hebrew asset class nobody checked, and it is already free.**
   The group asked whether *Hebrew fonts* are underserved (they are not) and never asked about
   Hebrew voice or speech data. The answer is the same and sharper: **`ivrit.ai` released 20,000+
   hours of Hebrew audio in April 2025** under its own licence, alongside a ~15,000-hour
   auto-transcribed corpus with 300+ hours of hand-corrected recordings, and the Israeli MoD's
   `resources.nnlp-il.mafat.ai` publishes Hebrew/Arabic NLP resources. Selling a Hebrew voice
   additionally requires a **real human speaker's recorded consent** — an identity step MISSION
   forbids. This is constraint 8's price-floor mechanism operating on our home turf, and recording
   it costs the next scout nothing.
4. **The obligation-shaped product the group's own evidence points at, and then walks past.**
   `ai-output-rights` §Part 3 establishes that the EU AI Act Art. 50(2) marking duty lands on the
   **provider of the generative system** — a named, legally obligated cohort — and then §5.1 proposes
   selling a rules table to *asset sellers*, who have no such duty, on demand inferred from other
   vendors' SEO blogs. MISSION constraint 8 shape 2 is *"an obligation somebody must discharge and
   cannot get free"*; the scout found the obligation and the supervisor filed the wrong buyer.
   I am **not** reviving it — the group's own three objections stand (no observed purchase; the
   source policy pages are egress-blocked; the table is copyable in a day) — but the mis-aimed buyer
   is why it reads as weaker than it is, and the reopen condition should name the generator-operator,
   not the seller.
5. **Dual licensing is a sequencing argument, and nobody made it.** The `dual-licensing` scout proved
   that every case with a number (lightGallery 12 years/7,054 stars; Sidekiq; Plausible 7 years)
   monetised **pre-existing** adoption, and correctly budgeted a new library at ₪0 for 12 months.
   That is also MISSION constraint 8 shape 1 — *accumulated operating history, which cannot be bought
   or copied and compounds* — i.e. an argument for publishing something free **today** so a licence
   is sellable later. The group had the premise and did not draw the conclusion, in either direction.
6. **The 2026 movement in the 3D vertical went the other way and nobody saw it.** `MyMiniFactory
   acquired Thingiverse in February 2026 with an explicitly anti-AI focus` (Hackaday, 13 Feb 2026 —
   host egress-blocked; surfaced in my Cults3D search). Two of the three consumer-3D venues in this
   group have now moved against AI supply within twelve months. That belongs in the negative
   knowledge, and it also refutes §5.1's framing of the split as static.
7. **Getty/iStock and Alamy were left "not established"** by the `stock-media` scout for lack of
   budget, and the supervisor neither closed them nor scheduled them, while ranking the group at
   zero. Zero is probably right; leaving two of the largest venues unexamined is not how you earn it.
8. **White-label of the colony's own products was assessed only as a paid tier on `il-biz-tools`.**
   Shape D from the same scout — an affiliate/referral programme, self-onboarding, no negotiation —
   was tabulated as "closes without a conversation: YES" and then never appeared again in the merge.
   It is worth ₪0 for the same reason as everything else here (no audience to refer from), but it
   was dropped silently rather than rejected, and a dropped shape re-appears.

---

## What would change this verdict

One document: **`https://helpx.adobe.com/stock/contributor/submit-your-content/submit-generative-ai-content/submit-generative-ai-content.html`**,
rendered — or, equivalently, a working unattended path that applies Adobe's generative-AI
declaration without a per-batch human and without defeating a CAPTCHA.

The supervisor names the same URL, and I agree with it for a different reason. It is not that the
checkbox is the last obstacle among many; it is that **Adobe is the only venue in this group where
the rate, measured against the repo's real ₪300/month floor, is not absurd — roughly 80 to 250 paid
downloads a month.** Everything else here is either free at source, hidden by default, paid at five
cents a download, or extinct.

To be exact about what that document would and would not do: it would move Adobe Stock from
**disqualified** to **the group's only testable candidate**. It would not make it a survivor.
Constraint 7 still applies — no stranger has been shown to find a day-one AI portfolio — and there
is still not one credible dated figure for what such a portfolio earns. The survivor test would be
**250 paid downloads inside one month, read from the contributor dashboard**, and until that number
exists the honest 12-month figure for this group stays **₪0**.

---

## Searches spent (8 of 8, all 2026-09-06)

1. Cults3D "No AI" filter enabled by default AI-generated designs hidden search results
2. Creative Fabrica contributor AI generated content policy 2026 seller payout countries commission
3. Cults3D designer payout Hyperwallet Payoneer supported countries Israel 2026
4. Iconfinder contributor AI generated icons policy allowed 2026 review criteria payout Israel PayPal Payoneer
5. מחירון גופן עברי מסחרי רישיון fontbit fontef alefalefalef מחיר משקל 2026
6. "Iconfinder" shut down November 2025 closed marketplace contributors announcement
7. Hebrew TTS voice licensing marketplace sell synthetic voice model Israeli Hebrew speech dataset commercial license 2026
8. Canva Creators contributor AI-generated content policy accepted royalties payout countries 2026

Zero-cost work: GitHub `search_code` for `"Filename,Title,Keywords,Category,Releases"` (27 results),
`madeWithAi cults3d` (24), `repo:google/fonts "subsets: \"hebrew\"" path:ofl` (62),
`repo:google/fonts hebrew path:apache` (2), `"generative ai" adobe stock contributor checkbox csv` (57);
rendered `google/fonts/ofl/heebo/OFL.txt`, `google/fonts/apache/opensanshebrew/LICENSE.txt`,
`awsdocs/aws-data-exchange-user-guide/.../provider-getting-started.md`,
`notlmn/awesome-icons/readme.md`, `neutraltone/awesome-stock-resources/README.md`,
`riefkyhd/adobe-stock-csv-generator/docs/CSV_SPEC.md`,
`ibank31/stockforge-ai/docs/archive/2026-08-25/research/ADOBE_CONTRIBUTOR_UPLOAD_AUTOMATION_2026.md`,
`CheekyCodexConjurer/cults3d-api-docs/{data_dictionary,faq}.md`. Read `state/colony/REPORT.md`,
`docs/REJECTED.md`, `docs/AWESOME_ROUTE.md`.

Blocked and abandoned: `help.author.envato.com`, `shotkit.com`, `webiano.digital`,
`www.iconfinder.com`, `hackaday.com`.

---

## For `docs/REJECTED.md`

**`licensing-ip` — zero survivors, and the walls were wrong.** The verdict stands: ₪0 today, ₪0 at
twelve months. Two of the three walls do not. The price floor is zero only for what we can make —
Hebrew fonts publish ₪350–450 a weight — and AI supply is not universally refused: Cults3D's
`createCreation` takes a writable `madeWithAi`. What closes the group is narrower: Adobe pays the
only non-trivial rate and its AI declaration is portal-only (no contributor upload API), and every
API-driven venue either hides AI work by default or pays $0.04–0.07 a download. Iconfinder,
researched as live, shut on 15 Nov 2025; unverified contributors lost their balances. Reopen only
on Adobe's own page showing the declaration set without a per-batch human.
