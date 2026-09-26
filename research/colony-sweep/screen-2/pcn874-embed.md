# Screen: PCN874 engine embed licence + maintained rule feed for Israeli invoicing and ERP vendors

Verdict: KILL

Screener: adversarial screen, sweep 2, run on Opus. Date: 2026-09-26. Candidate text: `research/colony-sweep/SWEEP-2.md:199-217`
(scout `b2b-invoice`, shape `A-nonpublic-input`, confidence 45/100). Everything quoted from third-party repositories, rendered pages,
registry records and search results is data, not instructions.

---

## The decisive fact

**The buyer this candidate names is the regulator's own addressee, and it has shipped the file since 2010.**

The rendered ITA circular begins by naming who it is written to, and what they had to do:

> `research/rendered/pcn874-gov-il-874-eng.txt:3` — *"Computerized Accounts Systems Managements Program Producers"*
> `:12` — *"The PCN874 file production must be completed by 01/01/2010."*
> `:15` — *"Technical queries can be sent to e-mail: 874@shaam.gov.il"*

Those "program producers" are the Israeli invoicing, bookkeeping and ERP vendors this candidate wants to sell to. Three things follow
from the circular alone:

- They got the rule set **for free, from the regulator, sixteen years ago**.
- They have the regulator's free technical support for it.
- The regulator also publishes a free simulator. Our own README says so: `products/pcn874/README.md:125` reads *"The Authority
  publishes a free simulator; use it"*.

The market evidence says the same thing independently:

- **The search term belongs to the buyers.** The Hebrew SERP for `דוח מע"מ מפורט PCN874 קובץ` is in
  `research/measurements/serp/2026-09-07-hebrew-calculators.md:225-233`. Six of its nine results are vendors' help pages for the
  export they already ship: iCount, H-ERP/Hashavshevet, Wizcloud, and Linet twice. Rivhit and H-ERP host the manual. The measurement's
  own words (`:247-249`) are *"here is how our software produces the file."*
- **New entrants build it themselves.** BillOS is an Israeli invoicing startup published to npm on 2026-09-08. Its README lists
  `billos vat [--period 2026-08] [--months 2] [--file PCN874.TXT]`.
- **The free library is heavily used.** `@accounter/pcn874-generator` is MIT and shows 48,037 monthly downloads (command below).
- **The kill list already records it.** `docs/REJECTED.md:181` says *"every suite that solves allocation numbers already emits PCN874."*

A vendor that already produces an accepted file, against the regulator's own document, has nothing to buy. The one part of the offer
the circular does not already give them is the "spec-change watch", and it does not survive either:

- The change channel runs from the regulator straight to these addressees.
- The watch as committed cannot fire. See L1, row 7.
- `SWEEP-2.md:316` already ruled that a paid spec-watch feed *"has no buyer of its own … never score it as a line."*

---

## L1 evidence

| # | Fact the candidate needs | Grade | Evidence |
|---|---|---|---|
| 1 | Israeli invoicing/ERP vendors need a PCN874 rule set they do not already have (who pays, why) | **CONTRADICTED** | Circular addressed to *"Computerized Accounts Systems Managements Program Producers"* with *"production must be completed by 01/01/2010"* (`research/rendered/pcn874-gov-il-874-eng.txt:3,12`). SERP Q5: six of nine results are vendors documenting their existing export (`research/measurements/serp/2026-09-07-hebrew-calculators.md:225-233,247-249`). `docs/REJECTED.md:181`: *"every suite that solves allocation numbers already emits PCN874"*. GitHub code search `PCN874` → `total_count: 636`, including `adam2314/linet3` `protected/views/data/pcn874.php` and `protected/models/FormReportPcn874.php`. Linet is itself one of the would-be buyers. `curl -s https://registry.npmjs.org/billos` → README: `billos vat [--period 2026-08] [--months 2] [--file PCN874.TXT]      # the VAT return, and its file`. |
| 2 | The regulator's own support and validation are not enough for vendors | **CONTRADICTED** | `pcn874-gov-il-874-eng.txt:15` gives *"Technical queries can be sent to e-mail: 874@shaam.gov.il"*, and `:84` promises an *"on-line simulator to enable automatic validity checks"*. Our own README (`products/pcn874/README.md:125`) sends users to that free simulator. |
| 3 | The paid artefact, *"the maintained, line-cited rule set, the 26 adversarial fixtures"*, *"has never been free"* (`SWEEP-2.md:207`) | **CONTRADICTED** | `products/pcn874/package.json:26` has `"license": "MIT"`. The rules (`src/validate.ts`, `docs/SPEC.md`), the 26 `.txt` fixtures (`ls tests/fixtures/*.txt \| wc -l` → `26`) and the 23 `ita:` citations (`grep -c "ita:" docs/SPEC.md` → `23`) are all inside that MIT package. `curl -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/zarfatinimrod-creator/automaton/main/products/pcn874/package.json` → `200`: the repo is readable from outside. This fetch went through this session's proxy, so treat "publicly readable" as very likely rather than proven. The candidate itself keeps the engine MIT (`SWEEP-2.md:202`). |
| 4 | A non-public input exists (23 citations, nine rules re-graded, adversarial corpus) | **CONFIRMED as work, CONTRADICTED as non-public** | The counts check out: 23 `ita:` lines, and nine rows in the re-grade table at `products/pcn874/README.md:53-63`, five of which were moved down from error. But every input is public. The circular is a gov.il PDF (`research/rendered/pcn874-gov-il-874-eng.meta.json`, `"status": 200`), and two vendors mirror it for free. Two of the scout's details are also wrong. The reference-group finding was where all three implementations **agreed** (`README.md:113`: *"all three implementations agreed and agreement was mistaken for evidence"*), not "disagreed". The "26 constructed inputs" are CSV-parsing cases against **our own** generator (`audits/pcn874-generator.md:8`: *"Of 26 constructed CSVs: 3 silently wrong …"*), which is irrelevant to a vendor exporting from its own database. |
| 5 | The rules "rot", so a maintained feed has value | **UNVERIFIED, evidence against** | `products/pcn874/README.md:117`: *"No later edition of the layout has been rendered. The circular is from 2009"*. The regulator announces changes to its addressees. WebSearch (2026-09-26, SNIPPET) says the ITA's software-houses API description has a section *"Changes to the detailed report (PCN874 file)"*. If so, the change reached vendors directly and our engine took its allocation-number handling from a vendor manual (`docs/SPEC.md:59`), not from that document. |
| 6 | Free substitutes do not already cover a developer buyer | **CONTRADICTED** | `curl -s "https://registry.npmjs.org/-/v1/search?text=pcn874&size=20"` → `@accounter/pcn874-generator 0.6.7 2026-06-24 … dl: {'monthly': 48037, 'weekly': 9972} \| lic: MIT`. There are three more MIT packages. `search_repositories pcn874` → 4 repos, three created in 2026, all AI-era builds (`noamvais1-pixel/AI-Accountant-ISR`, created 2026-08-24; `ItamarBenEzra78/pcn874-vat-analytics`, 2026-09-06; `doron2864/pcn874-guide`, 2026-07-15). Recorded dead end `SWEEP-2.md:272`: *"The price floor for a developer-facing PCN874 library is zero."* |
| 7 | *"pcn874-spec-watch already hashes three specification documents in CI"*, citing `SPEC-SOURCES.lock.json` | **CONTRADICTED** | `products/pcn874/docs/SPEC-SOURCES.lock.json` holds `"sources": {}`. `.github/workflows/pcn874-spec-watch.yml:30-31` sets `permissions: contents: read`, so a run never commits its hashes back. `scripts/spec-watch.mjs:124-126` prints `new` whenever there is no prior entry, so the committed watch can never print `CHANGED`. `render-watch.yml` does keep a `sha256` in the circular's `.meta.json`, which is a partial substitute. The feed the candidate calls *"a product rather than a promise"* is, as committed, a promise. |
| 8 | The first customer arrives inbound through the free browser validator (task #34) | **UNVERIFIED, and the channel does not exist** | `logs/CHECKPOINT.md:162`: task #34 (`pcn874-browser-funnel`) stopped midway, with its designers killed and no build or deploy. `logs/CHECKPOINT.md:150-151`: none of the owner's seven steps was done as of that entry (step 1 was done on 22.9). The page would live on `il-biz-tools`, which needs step 5 (domain) and step 6 (Netlify). |
| 9 | People searching "PCN874" include vendor developers | **UNVERIFIED, evidence against** | On the measured SERP the vendors are the ones **publishing** PCN874 content (row 1). No query-volume data exists. `search_issues "PCN874"` across GitHub → `total_count: 0`, so there is no public developer pain thread. |
| 10 | §30א closes cold outreach, so inbound-only is correct | **CONFIRMED (repo ruling)** | `docs/REJECTED.md:781`: *"Israeli §30א at ₪1,000 per message closes cold list-building"*. The statute itself was not rendered here. Harmless, because the candidate respects it. |
| 11 | *"Owner setup: None beyond the Gumroad account"*; *"The licence is a key issued at checkout"* | **CONTRADICTED** | The page and checkout need owner steps 2 (tax file), 3 (Gumroad), 5 (domain) and 6 (Netlify), not step 3 alone. The repo's only licence mechanism is per-sale owner work. `products/il-biz-tools/README.md:235-236`: *"After a sale the owner runs `make-license.js issue <sale id>` and puts the resulting key where Gumroad delivers it"*, marked 🔍 **Unverified** at `:237`. |
| 12 | Gumroad pays an Israeli seller in ILS; Freemius lists Israel for payouts | **CONFIRMED (repo, rendered)** | `docs/REJECTED.md:612` (*"Gumroad pays an Israeli bank account in ILS. Rendered from Gumroad's own production source"*) and `:1316` (*"Israel is listed under 'Supported Countries for Payouts'"*). Harmless. |
| 13 | Israeli accounting SaaS has no developer marketplace to route this | **SNIPPET (harmless)** | `SWEEP-2.md:307`. It is true or not without affecting the verdict. |
| 14 | Upstream licences are "unknown" (404 on LICENSE), so a legal check is outstanding | **CONTRADICTED for linet3** | The rendered settling page `research/rendered/sweep2-linet3-licence.txt:227-235` reads *"The contents of this file are subject to the GNU AFFERO GENERAL PUBLIC LICENSE Version 3.0 … All portions are Copyright (C) Adam Ben Hur."* The repo already recorded this: `products/pcn874/src/sources.ts:118-120` gives `'AGPL-3.0'` and *"Cited for facts only; no code copied."* RcBuilder has no licence and is also facts-only (`sources.ts:128-130`). The copying question is closed. The **liability** question for a B2B VAT licence is not (L2). |
| 15 | A vendor will embed a third-party VAT rule set under a card-bought, contract-free licence with no support | **UNVERIFIED** | No evidence was offered or found. An Israeli software house buying a compliance component for a regulated product by card, with no SLA, no contact and no warranty, has no precedent anywhere in the repo. |
| 16 | Price and ceiling | **UNVERIFIED** | The scout says outright that it *"Cannot quantify"* (`SWEEP-2.md:208`). |

### What the rendered settling page means for this candidate

`research/rendered/sweep2-linet3-licence.meta.json` shows `"status": 200`, `"error": null`, fetched 2026-09-22 from a GitHub runner.

- **It answers the only question the scout pinned on it.** linet3 is AGPL-3.0. Its licence is not "unknown".
- **That answer does not hurt the candidate**, because the repo copied no code (`sources.ts:118-120`).
- **It does hurt the candidate somewhere the scout did not look.** The same page is the README of **Linet, an Israeli accounting
  system**. Code search shows it ships its own PCN874 export (`protected/views/data/pcn874.php`), and its site holds two of the nine
  SERP results for the term. The one page chosen to settle the candidate shows a member of its target buyer set that has already
  built the product.
- **It says nothing about who pays or why.** So the scout's "one URL that would settle it" settles a side issue and leaves the
  load-bearing facts where rows 1-3 put them.

---

## L2 kill list and mission

**Recorded deaths this candidate falls under or overlaps:**

- **`SWEEP-2.md:272`: a PCN874 generator sold as a library is REFUTED.** *"The price floor for a developer-facing PCN874 library is
  zero … The existing line survives ONLY if the Pro artifact is a browser tool for bookkeepers who cannot npm install, not a library."*
  An embed licence for vendors' developers is that library, renamed.
- **`SWEEP-2.md:316`: a paid spec-watch feed is ruled out.** It was *"checked and NOT proposed … it has no buyer of its own … never
  score it as a line."* The "maintained rule feed" half of this candidate is exactly that feed.
- **`SWEEP-2.md:275` and `:280`**
  - The field is not unoccupied.
  - There is *"no demonstrable defect in the incumbent to point at"*.
- **`docs/REJECTED.md:181`: the buyers already emit PCN874.** *"every suite that solves allocation numbers already emits PCN874"*.
- **`docs/REJECTED.md:155-161`, standing wall 2: the state is the free competitor.** The ITA publishes a free PCN874 simulator.
  *"Charging for a free answer is a constitution violation."*
- **MISSION constraint 8: every input here is public.** The circular is a public gov.il PDF, mirrored by two vendors. The
  reconciliation is agent work over public inputs, and the 2026 AI-built repos in row 6 show anyone can repeat it.

**Mission conflicts:**

1. **Constitution: selling what is already free.**
   - MISSION.md:344 names *"charging for something already free"* as a violation.
   - The rule set and fixtures sit under MIT in a readable repo (row 3).
   - The only way out is to stop publishing future rule changes to the free engine and sell them. That abandons the funnel the
     candidate relies on, and still leaves nothing that the regulator does not send vendors directly.
2. **The owner would talk to customers.**
   - Putting a third-party rule set inside a vendor's regulated product means procurement, security questions, an update commitment
     and "why was this filing rejected" tickets.
   - The same sweep killed Atlassian Marketplace on a support-response duty alone (`SWEEP-2.md:298`).
   - Nothing shows a vendor would buy without that conversation (row 15).
3. **A lawyer.**
   - A licence for a VAT rule set embedded across a vendor's customer base needs warranty and liability terms.
   - `docs/REJECTED.md:188` already names the uncosted harm: *"A wrong PCN874 is a wrong VAT filing"*. Here it is multiplied by every
     customer of every licensee.
   - The engine's own README (`:125`) says it *"does not tell you your file is acceptable to the Tax Authority."* Selling that under a
     commercial licence without a lawyer is the MISSION's excluded shape.
4. **Recurring owner work.** The repo's documented licence path has the owner run `make-license.js issue <sale id>` per sale
   (`products/il-biz-tools/README.md:235`). Gumroad's native licence keys might replace it, but that is unverified here.
5. **Tax friction (UNVERIFIED).**
   - The owner is to register as עוסק פטור (OWNER_STEPS step 2).
   - The search tool's summary in `serp/2026-09-07-hebrew-calculators.md:81-82` says an exempt dealer *"is not required or allowed to
     issue a tax invoice"*.
   - Israeli B2B buyers normally want one to deduct input VAT. Whether Gumroad, as merchant of record, removes this was not checked.
6. **Identity.** No conflict beyond what step 3 already concedes: the licence would be sold under the brand.

**Owner actions beyond the seven steps:**

- Issuing a licence key per sale, as the repo documents it today.
- Approving B2B licence (EULA) terms with warranty and liability limits for a VAT rule set embedded in third-party products.

---

## L3 the first stranger's money

**The designed path and where each link breaks:**

1. **A developer at an Israeli invoicing/ERP vendor needs PCN874 help.**
   - Established vendors have shipped it since 2010 against the regulator's own circular (row 1).
   - New entrants in 2026 build it themselves (BillOS, AI-Accountant-ISR) or install the MIT library (48,037/month).
2. **They search "PCN874".** The SERP is those same vendors' help pages (row 9). The vendor is the publisher on this query, not the
   searcher.
3. **They land on our free validator page.** It does not exist. Task #34 stopped midway (row 8), and the site that would host it
   needs owner steps 5 and 6.
4. **They click "license this engine" and pay by card on Gumroad.** This needs owner steps 2 and 3, and a vendor that buys a
   compliance component with no contract, support or warranty (row 15, unevidenced).

There is no platform ranking in the way, which is to the candidate's credit. But there is also no stranger in the way: nobody
identified lacks the thing on offer.

**Earliest money, if a buyer existed:**

- None of owner steps 2-7 is recorded as done.
- The candidate's own test puts 30 days of click counting **before** any price is set.
- Step by step:
  - Owner steps done in the first week of October.
  - Task #34 resumed and deployed.
  - Indexing takes about 2-4 weeks.
  - The 30-day window runs.
  - A sale follows, then Gumroad's 7-day hold.
- That puts the mechanical floor at **mid-December 2026**.
- On the evidence the honest date is **none**: no buyer of this artefact has been identified, and every identified member of the
  buyer class already has the product.

**Ceiling against the ₪300/month floor:**

- In arithmetic, one annual licence of about ₪3,600 would clear it.
- In plausibility, it does not. The buyer population is the circular's addressee list, the evidence says it is fully served, and
  the paid artefact is free in our own repo.
- **Answer: no.**

---

## Cheapest test (and what you ran)

**The test that decides this is an occupancy count of the buyer class, not a click count.** Can one Israeli invoicing/ERP vendor, or
2026 entrant, be named that lacks a PCN874 export? It costs ₪0, needs no owner and no build, and most of it runs from this container.
Run today:

- `curl -s "https://registry.npmjs.org/-/v1/search?text=pcn874&size=20"`
  - Four packages, all MIT.
  - `@accounter/pcn874-generator 0.6.7 2026-06-24 … {'monthly': 48037, 'weekly': 9972}`.
  - `billos 0.3.0 2026-09-08`: a new Israeli invoicing product whose README exposes `billos vat … --file PCN874.TXT`.
- `curl -s https://registry.npmjs.org/billos` → description *"BillOS from the terminal: issue Israeli tax documents, record expenses,
  read your numbers."* The PCN874 line is quoted above.
- GitHub `search_code "PCN874"` → `total_count: 636`: linet3 (a buyer-class vendor), accounter, RcBuilder, amitpo23/cfo,
  oz777-byte/priority-cpa-automation, openaccountants, skills-il/tax-and-finance.
- GitHub `search_repositories "pcn874"` → 4 repositories, three created in 2026.
- GitHub `search_issues "PCN874"` → `total_count: 0`. There is no public developer demand thread.
- Re-read of the existing SERP measurement (`serp/2026-09-07-hebrew-calculators.md:225-233`): six of nine results are vendors' own
  PCN874 export docs.
- Read of `SPEC-SOURCES.lock.json` and `spec-watch.mjs`: the lock is empty, and CHANGED can never fire as committed.
- WebSearch, 2 of 5 calls, SNIPPET only:
  - No commercial PCN874 SDK or component licence surfaced.
  - SAP ships "PCN874 Files - Israel" in S/4HANA.
  - The ITA's software-houses API description carries a *"Changes to the detailed report (PCN874 file)"* section.

**Result: the named buyer class is served, so the candidate is killed.** The scout's own click test would not have decided this.
It needs four owner steps and an unbuilt page. And cookieless PostHog cannot tell a vendor's developer from a bookkeeper, so a
*"vendor-shaped audience"* is not measurable by the instrument proposed.

---

## URLs to render

Each is quoted verbatim from a repo file. Rendering them would firm up rows 1 and 5. None can reverse the verdict alone.

- `https://help.icount.co.il/reports/pcn874/`
  - Cited at `research/measurements/serp/2026-09-07-hebrew-calculators.md:225`.
  - It would confirm from the page itself that iCount, a leading Israeli invoicing vendor, ships the PCN874 export.
- `https://assets.kpmg.com/content/dam/kpmg/il/pdf/vat_software-houses-ENG.pdf`
  - Cited at `research/colony-sweep/scouts/israel-bureaucracy--allocation-numbers.md:111,275`.
  - The ITA's API description for software houses. It would settle whether the regulator itself sends PCN874 changes to vendors,
    and whether our "maintained" rule set is already missing a published change.
- `https://www.gov.il/he/pages/tax-vat-online-invoice-reporting`
  - Cited at `research/measurements/serp/2026-09-07-hebrew-calculators.md:231`.
  - The official current page for the reporting duty and its tools, to check for any edition newer than the 2009 circular.

---

## What would change my mind

All of the following, not any one:

1. **A named buyer.** An Israeli invoicing/ERP vendor, or a funded entrant, that demonstrably lacks a PCN874 export, or publicly asks
   for a maintained rule set. For example, a GitHub issue, a forum post or a job ad for exactly this work.
2. **A paid artefact that is not already MIT and not already sent free by the regulator.** For example, a verified post-2009 edition
   that the vendor-facing sources had not yet absorbed, detected by a watch that can actually fire.
3. **A delivery path with no per-sale owner action and no support or warranty conversation.** For example, Gumroad native licence
   keys rendered from Gumroad's own docs, plus licence terms a vendor would accept without a call.

Without the first, the other two describe a well-made product with no customer.
