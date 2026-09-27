# CC BY 3.0 IGO — ruling for publication gate G1 (27.9.2026, Fable)

**סיכום לבעלים:** הרישיון `CC BY 3.0 IGO` נכנס לרשימת הרישיונות המותרים **בתנאים** — במה שמותר לעשות הוא CC BY רגיל, והסעיפים המיוחדים לארגונים בינלאומיים (חסינות, גישור ובוררות) נוגעים רק למי שמתווכח, ואנחנו לא מתווכחים (G8); נתוני האו"ם (אוכלוסייה, עיור) נפתחים אחרי רינדור של דף התנאים שלהם, אבל **UNESCO UIS נשאר סגור** — שלוש עדויות עצמאיות אומרות ShareAlike, ורשומת OWID סותרת את עצמה.
**B2 (Unlicense ו-PDDL בפנים, MIT בחוץ) — מאושר**, עם נימוק מתוקן: MIT על מאגר נתונים הוא רישיון של האורז לקוד, לא הצהרת המפיק על הנתונים.

---

## 0. The ruling in one paragraph

**ADD_WITH_CONDITIONS.** `CC-BY-3.0-IGO` enters `ALLOWED_DATA_LICENCES`. Read side by side with CC BY 3.0 Unported
(already in the set), its grant, its adaptation right and its attribution clause are the same licence; what is
IGO-specific changes *how a dispute is handled*, not *what a licensee may do*. The conditions (C1–C5 below) exist for
two reasons the reading exposed: (i) the only evidence for the two target datasets is third-party records, and the
UNESCO record turned out to be self-contradictory, so an IGO licence may be relied on only from the licensor's own
rendered page; (ii) the licence's no-endorsement and logo clauses are the realistic exposure for a channel, and they
are cheap to enforce in the manifest. Separately: **UN World Population Prospects (and World Urbanization Prospects)
become eligible once `population.un.org/wpp/downloads/` is rendered; UNESCO UIS stays FAIL** — the weight of evidence
says its licence is ShareAlike, which this set excludes regardless of the IGO question. **B2 is UPHELD** with the MIT
reasoning corrected.

## 1. What was read, and from which host

| Item | Where I read it | Grade |
|---|---|---|
| CC BY 3.0 IGO legal code (17,572 bytes) | `raw.githubusercontent.com/spdx/license-list-data/main/text/CC-BY-3.0-IGO.txt` | CODE |
| Same, cross-check | `raw.githubusercontent.com/creativecommons/cc-legal-tools-data/main/docs/licenses/by/3.0/igo/legalcode.en.html` and `.../legacy/legalcode/by_3.0_igo.html` — identical clauses (mediation, arbitration, immunities, endorsement, logo) | CODE |
| CC BY 3.0 Unported, for the diff | `raw.githubusercontent.com/spdx/license-list-data/main/text/CC-BY-3.0.txt` | CODE |
| Unlicense, MIT, PDDL-1.0 | same SPDX repo. Note: SPDX names the ODC licence `PDDL-1.0`; `ODC-PDDL-1.0` returns 404 there. datahub's own `datasets/co2-ppm/datapackage.json` writes `"name": "ODC-PDDL-1.0"`, which is the string the gate holds | CODE |
| `creativecommons.org` itself | `CONNECT tunnel failed, response 403` | BLOCKED |
| UN WPP terms: `https://population.un.org/wpp/downloads/`, `https://population.un.org/wpp/`, `https://www.un.org/en/about-us/terms-of-use` | all 403 from the proxy, one attempt each | BLOCKED |
| UN's own copyright notice, as preserved verbatim in downstream files | GitHub code search, 37 files, e.g. `PPgp/wpp2024` (package `Author: United Nations Population Division`; `LICENSE` is the full CC BY 3.0 IGO legal code; `README.md` l.31), `rivm-syso/mpox-network/R/data.R`, `Disease-Control-Priorities/UW-RTSL-100MLives` | CODE-secondary, many independent copies of one sentence |
| owid/etl records for the UN | `snapshots/un/2022-07-11/un_wpp.zip.dvc`, `snapshots/un/2024-07-12/un_wpp_population_low.csv.dvc`, `snapshots/un/2024-01-17/urbanization_urban_rural.csv.dvc`: all `name: CC BY 3.0 IGO`, `url: http://creativecommons.org/licenses/by/3.0/igo/` (the 2024-07-12 record points its url at the WPP downloads page instead) | CODE-secondary |
| WPP 2024 Summary of Results | WebSearch snippet: "Figures and tables in this publication can be reproduced without prior permission under a Creative Commons license (CC BY 3.0 IGO)" | SNIPPET |
| UNESCO UIS terms: `https://databrowser.uis.unesco.org/terms-and-conditions`, `https://uis.unesco.org/en/terms-and-conditions`, `https://download.uis.unesco.org/bdds/202602/` | all 403 | BLOCKED |
| UIS main-site terms | WebSearch snippet of `uis.unesco.org/en/terms-and-conditions`: "licensed under the Creative Commons Attribution-ShareAlike 3.0 IGO License", attribution formats, "may not represent or imply that the UIS has participated in, approved, endorsed or otherwise supported their use ... may not claim any affiliation with the UIS" | SNIPPET |
| UIS licence as recorded by third parties | `jentic/jentic-public-apis/.../uis.unesco.org/.../source.dat`: `"license": {"name": "Creative Commons Attribution-ShareAlike 3.0 IGO", "url": "http://creativecommons.org/licenses/by-sa/3.0/igo/"}`; `worldbank/counting-people-climate-risk/docs/reproducibility.md`: "License: Attribution-Sharealike 3.0 Intergovernmental Organization (CC BY-SA 3.0 IGO)" for UIS 2024; `koala73/worldmonitor/docs/data-sources.mdx`: "UNESCO UIS Data Browser: CC BY-SA 4.0" citing the databrowser terms page | CODE-secondary, three independent |
| owid/etl records for UNESCO | `snapshots/unesco/2024-06-16/education_opri.zip.dvc`, `2024-06-25/education_sdgs.zip.dvc`, `2024-11-21/enrolment_rates.csv.dvc`: **`name: CC BY 3.0 IGO` beside `url: http://creativecommons.org/licenses/by-sa/3.0/igo/`** — the name says BY, the URL says BY-SA. `2026-05-12/education_sdgs.zip.dvc` and `education_opri.zip.dvc`: `CC BY 3.0 IGO`, url = the databrowser terms page | CODE-secondary, self-contradictory |

Two WebSearch calls were used, the maximum allowed. Nothing from the UN's or UNESCO's own servers was read; every
statement about their terms below is second-hand and graded so.

## 2. The licence, clause by clause (quoted from the SPDX text)

**Grant — commercial use and adaptations are in.** §3: "the Licensor hereby grants You a worldwide, royalty-free,
non-exclusive license to exercise the rights in the Work as follows: a. to Reproduce, Distribute and Publicly
Perform the Work ... b. to create, Reproduce, Distribute and Publicly Perform Adaptations, provided that You clearly
label, demarcate or otherwise identify that changes were made to the original Work." §1(f): "Distribute" means
making the Work or Adaptation available "by sale, rental, public lending or any other known form of transfer". There
is no NonCommercial and no ShareAlike clause anywhere in the text. A chart drawn by code from the data, with a
narration, is an Adaptation under §1(h) ("any alterations and arrangements of any kind involving the Work").

**Attribution — the same four items as CC BY 3.0.** §4(b): "keep intact all copyright notices for the Work and
provide, reasonable to the medium or means You are utilizing: (i) any attributions that the Licensor indicates be
associated with the Work as indicated in a copyright notice, (ii) the title of the Work if supplied; (iii) to the
extent reasonably practicable, the URI, if any, that the Licensor specifies to be associated with the Work ...; and,
(iv) consistent with Section 3(b), in the case of an Adaptation, a credit identifying the use of the Work in the
Adaptation." §4(a): "You must include a copy of, or the Uniform Resource Identifier (URI) for, this License with
every copy of the Work You Distribute or Publicly Perform."

**No endorsement — present here, and present in Unported too.** §4(b), last sentence: "You may only use the credit
required by this Section for the purpose of attribution in the manner set out above and, by exercising Your rights
under this License, You may not implicitly or explicitly assert or imply any connection with, sponsorship or
endorsement by the Licensor or others designated for attribution, of You or Your use of the Work, without the
separate, express prior written permission of the Licensor or such others." The diff against Unported shows the same
sentence there with "the Original Author, Licensor and/or Attribution Parties" in place of "the Licensor".

**Logo and emblem — the one IGO-specific wording in §4.** §4(a): "If You create an Adaptation, upon notice from a
Licensor You must, to the extent practicable, remove from the Adaptation any credit (inclusive of any logo,
trademark, official mark or official emblem) as required by Section 4(b), as requested." Unported has the same
sentence without the parenthetical.

**Moral rights.** §4(c): "You must not distort, mutilate, modify or take other derogatory action in relation to the
Work which would be prejudicial to the honor or reputation of the Licensor where moral rights apply." Same duty as
Unported §4(c), owed to the Licensor instead of the Original Author.

**Termination and cure — more forgiving than Unported.** §7(b): "this License and the rights granted hereunder will
terminate automatically upon any breach ... Notwithstanding the foregoing, this License reinstates automatically as
of the date the violation is cured, provided it is cured within 30 days of You discovering the violation, or upon
express reinstatement by the Licensor." Unported 3.0 has no cure clause.

**Immunities.** §8(g): "Nothing in this License constitutes or may be interpreted as a limitation upon or waiver of
any privileges and immunities that may apply to the Licensor or You, including immunity from the legal processes of
any jurisdiction, national court or other authority."

**Disputes.** §8(h): "Where the Licensor is an IGO, any and all disputes arising under this License that cannot be
settled amicably shall be resolved in accordance with the following procedure: i. ... non-binding mediation ...
The language used in the mediation proceedings shall be English ... ii. If any such dispute has not been settled
within 45 days ... either You or the Licensor may ... elect to have the dispute referred to and finally determined
by arbitration ... in accordance with the UNCITRAL Arbitration Rules as then in force. The arbitral tribunal shall
consist of a sole arbitrator ... The place of arbitration shall be where the Licensor has its headquarters. The
arbitral proceedings shall be conducted remotely (e.g., via telephone conference or written submissions) whenever
practicable." §8(f) makes interpretation follow "general principles of international law" rather than a national
copyright act.

**What the sentence-level diff against Unported shows is IGO-specific**, in full: the IGO definition (§1(a)) and the
"may be, but is not necessarily, an IGO" licensor (§1(c)); a database "by reason of the selection and arrangement of
its contents" counted as a Work (§1(b)); the logo/emblem parenthetical (§4(a)); "where moral rights apply" (§4(c));
the 30-day cure (§7(b)); interpretation under international law (§8(f)); immunities (§8(g)); mediation and
arbitration (§8(h)). Everything else is rewording. None of the IGO-specific clauses narrows what may be done with the
Work; §8(g)–(h) decide where a fight happens, and G8 (never file a counter-notice) already commits this channel to
not fighting: on any notice, comply within the 30-day window and let the board look. For a licensee with that
policy, the arbitration clause is dormant text.

**What this ruling does not re-decide.** Two questions apply equally to `CC-BY-3.0` and `CC-BY-4.0`, which the set
already holds, and are not IGO deltas: CC 3.0 licences (IGO included) do not expressly cover EU sui generis database
rights the way CC 4.0 §4 does — a handful of series per video is not a "substantial part" extraction, and neither
Israel nor the US has such a right, but it is a real difference between 3.0 and 4.0 for all 3.0 data; and §4(a)'s
ban on "effective technological measures" versus a platform's own streaming protection is a general CC-on-YouTube
question. Both are noted, neither is grounds against IGO specifically.

## 3. What the two licensors add on top of the licence

**United Nations (WPP, WUP).** The UN publishes one sentence with every file, and it is the "copyright notice" §4(b)(i)
and §8(h) refer to. Verbatim, as carried in `PPgp/wpp2024` and 36 other files: *"Copyright © 2024 by United Nations,
made available under a Creative Commons license CC BY 3.0 IGO: http://creativecommons.org/licenses/by/3.0/igo/
Suggested citation: United Nations, Department of Economic and Social Affairs, Population Division (2024). World
Population Prospects 2024, Online Edition."* The 2018 WUP carries the same sentence with its own citation
(`Rbanism/repro-r-workshop/data/README.md`). So the UN designates (a) the licence and its URI, and (b) the exact
credit. The UN's general Terms of Use were **not read** (403); if they add anything, C1 is where it surfaces, because
the render of the downloads page is what unlocks the dataset. Independently of copyright, the UN emblem is protected
by its own instruments; C4 makes "no emblem, no logo" a rule regardless of what those say.

**UNESCO UIS.** Four independent sources — the UIS main-site terms (SNIPPET), the UIS Data API's own metadata as
mirrored by jentic, a World Bank repository citing UIS 2024, and the worldmonitor project citing the databrowser
terms page — say **ShareAlike** (3.0 IGO or 4.0). OWID's own records say BY in the name field and BY-SA in the URL
field for three snapshots, then BY with a new URL in 2026. The most that can be said for plain BY is that OWID's
2026 record might reflect a change of terms on the new data browser; nobody here has read that page. On this
evidence **UIS fails G1 as ShareAlike**, and adding `CC-BY-3.0-IGO` to the set does not change that: a manifest may
only carry `CC-BY-3.0-IGO` for a dataset whose rendered licensor page says so (C1). The UIS terms also prescribe an
attribution form ("Source: (If appropriate 'Adapted from') UNESCO Institute for Statistics (UIS), complete URL, date
of extraction") and a no-affiliation clause — if the data-browser page is ever rendered and says plain BY, those two
become the UIS-specific manifest rules, on top of C1–C5.

## 4. Decision: ADD_WITH_CONDITIONS

`CC-BY-3.0-IGO` is added to `ALLOWED_DATA_LICENCES`. Every dataset carrying a licence in `IGO_LICENCES` must satisfy:

| # | Condition | Clause | Enforced |
|---|---|---|---|
| C1 | `licenceSnapshot` is a render-watch capture of the **licensor's own** terms page, stored under `research/rendered/`. An owid/etl `.dvc`, a packager's README or any other third party's record is not a snapshot for an IGO licence. Before the first publish an auditor reads the capture and records in DATASETS.md that it says "CC BY 3.0 IGO" / "Attribution 3.0 IGO" and **not** ShareAlike; if it says ShareAlike or adds a NonCommercial term, the dataset fails. | Evidence rule; UNESCO record contradiction | G1: path prefix check; content check by auditor |
| C2 | The description carries the licence URI `https://creativecommons.org/licenses/by/3.0/igo/` and a changes-made statement — a phrase of the form "computed from" / "derived from" / "calculated from" / "adapted from" the named dataset. | §4(a) URI; §3(b) "identify that changes were made" | G7 |
| C3 | The description carries, verbatim, `<Licensor> did not produce, endorse or approve this video, and no affiliation with <Licensor> is claimed.` with `licensor` set in the manifest (e.g. `United Nations`). | §4(b) last sentence | G7; G1 requires `licensor` |
| C4 | The licensor's name and short forms (`UN`, `U.N.`, `UNDESA`, `UNESCO`, `UIS`, "United Nations") do not appear in the title; the attribution lives in the description and a source line on the chart. No IGO logo, emblem, official mark or trademark anywhere in the video, thumbnail or channel art. | §4(b) "only ... for the purpose of attribution"; §4(a) logo/emblem removal | G7: title regex; the logo rule is a G3/G5 auditor check (visuals are not in the manifest) |
| C5 | Any notice from an IGO licensor — credit removal, a complaint, a mediation notice — is complied with within 30 days and never contested, and while it is open nothing using that licensor's data publishes. `ChannelState.openLicensorNotices` records the licensor; the board closes it. | §4(a) "upon notice ... remove"; §7(b) 30-day cure; §8(h) "settled amicably"; G8 | G1 |

Manifest rules for the auditor, not code: **A1** `name` for a UN dataset is the UN's suggested citation verbatim
(`United Nations, Department of Economic and Social Affairs, Population Division (2024). World Population Prospects
2024, Online Edition.`), since §4(b)(i) makes the licensor's designated attribution the required one. **A2** WPP
years after the last estimate are projections; the narration and chart label them as the UN's projection and name
the variant (medium, low, high) — §4(c) hygiene, and B6 already asks this of Wittgenstein. **A3** WPP carries
international-migration components; the G2 regex blocks `migration`, `migrants`, `immigra…`, so topic strings and
scripts stay off them (B5).

Why conditions and not a plain ADD: a plain ADD would let a manifest cite OWID's `.dvc` as its snapshot, which for
UNESCO would have passed a ShareAlike dataset through G1 on a record that contradicts itself. Why not KEEP_OUT: the
licence text gives no ground for it — the grant and attribution clauses are CC BY 3.0's, the IGO clauses bind a
party that litigates, and the UN's own notice (37 independent copies) states the licence and the credit outright.
Keeping it out would forfeit UN population and urbanisation for a risk the text does not contain.

## 5. B2 ruling: UPHELD, reasoning amended

**`Unlicense` in — upheld.** The text: "Anyone is free to copy, modify, publish, use, compile, sell, or distribute
this software ... for any purpose, commercial or non-commercial, and by any means. In jurisdictions that recognize
copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to
the public domain." No notice, no attribution, no condition survives. `davidmegginson/ourairports-data/LICENSE` is
this text, at the root of a repository that holds only the data, from the operator who compiles it. Recording the
string the source uses rather than mapping it to `public-domain` is the right call: the gate stays an exact-string
match and the manifest stays honest about what the source said.

**`ODC-PDDL-1.0` in — upheld.** The PDDL: "It is not a requirement that recipients provide further users with a copy
of this licence or attribute the original creator of the data or database as a source." §3.1: "dedicates the Work to
the public domain ... and relinquishes all rights in Copyright and Database Rights over the Work." §4.1: "Any
Community Norms statement associated with the Work is not a contract." It is the one licence in the set that
expressly covers database rights. The string `ODC-PDDL-1.0` is what datahub writes in `datapackage.json`; SPDX calls
it `PDDL-1.0`, so a manifest written from SPDX would fail — the safe error, and not worth a second entry now. As R12
says and the gate already encodes, a packager's PDDL does not reach the upstream data; the `upstream` check carries
that.

**`MIT` out — upheld, but for a different reason.** Opus's stated reason — the notice "has no clean place in a
narrated video" — is not right: a YouTube description holds 5,000 characters and the MIT notice is a paragraph. The
real reason is evidentiary. MIT licenses "the Software"; on a data repository it is the packager's choice for the
code, and it says nothing about whether the rightsholder of the *data* licensed it (R7: Barro-Lee's README gives a
citation and no data licence; R8: the Exoplanet Catalogue imports NASA data on unread terms). So an MIT dataset is
UNKNOWN in substance, which is already FAIL. Re-open per dataset only when the producer itself states MIT for the
data — and then the requirement is the full notice in the description, a G7 extension rather than a set entry. The
doc comment in the code change below carries this correction.

## 6. The exact code change (verified on a copy; Opus applies it)

Type-checked (`tsc --noEmit --strict`) and exercised on a scratch copy of `publication-gate.ts` with a stubbed
`experiments.ts`: the existing fixture (no `licensor`, no `openLicensorNotices`) still passes with no failures; a
compliant UN WPP manifest passes; each of C1–C5 fails alone with a reason naming the clause; a title of
"Unemployment and unit costs: an unusual decade" is not a false hit; `MIT`, `CC-BY-SA-3.0-IGO`, `CC-BY-SA-4.0`,
`CC-BY-NC-SA-3.0-IGO` still fail G1. The repository file was not touched.

```diff
--- a/src/revenue/publication-gate.ts
+++ b/src/revenue/publication-gate.ts
@@ -30,4 +30,9 @@
    */
   upstream: { source: string; licence: string | null }[];
+  /**
+   * The licensor's name as it must appear in the no-endorsement sentence, e.g. "United Nations". Required when the
+   * licence is in IGO_LICENCES (LICENCE-IGO-DECISION.md, condition C3); ignored otherwise.
+   */
+  licensor?: string;
 }
 
@@ -61,4 +66,10 @@
   yppReviewPending: boolean;
   dmcaCounterNoticeFiled: boolean;
+  /**
+   * Licensors who have sent any notice about our use of their data (CC BY 3.0 IGO §4(a) credit removal, §7(b) cure,
+   * §8(h) "settled amicably"). While one is open, nothing using that licensor's data publishes; the board closes it
+   * (LICENCE-IGO-DECISION.md, condition C5). Optional so existing channel states keep working.
+   */
+  openLicensorNotices?: string[];
 }
 
@@ -79,6 +90,14 @@
  * stricter than `public-domain`, and a manifest records the licence string the source actually uses rather than our
  * mapping of it. `MIT` stays out — a software licence whose notice must travel "in all copies or substantial
- * portions" has no clean place in a narrated video (R6, R7). `CC-BY-3.0-IGO` is not in the set pending a Fable ruling
- * (B1): it closes UN population and UNESCO education, and its IGO clauses are a legal judgement, not a mapping.
+ * portions" is a software licence, and on a data repository it is the packager's licence for the code, not the
+ * producer's statement about the data (R7, R8) — so it is UNKNOWN in substance, not merely inconvenient (Fable, B2
+ * ruling, LICENCE-IGO-DECISION.md §5).
+ *
+ * `CC-BY-3.0-IGO` was added 27.9.2026 by Fable ruling (research/faceless-youtube/LICENCE-IGO-DECISION.md). Its grant
+ * (§3: worldwide, royalty-free, Distribute "by sale", Adaptations) and its attribution clause (§4(b)) are CC BY 3.0's.
+ * What is IGO-specific — §8(g) no waiver of the licensor's privileges and immunities, §8(h) mediation then
+ * arbitration at the licensor's headquarters, §4(a) credit removal "inclusive of any logo, trademark, official mark
+ * or official emblem" on notice — only bites a licensee that contests, and G8 says this channel never contests.
+ * The conditions it carries are enforced below for every licence in IGO_LICENCES.
  */
 export const ALLOWED_DATA_LICENCES: ReadonlySet<string> = new Set([
@@ -86,8 +105,33 @@
   "CC-BY-4.0",
   "CC-BY-3.0",
+  "CC-BY-3.0-IGO",
   "public-domain",
   "Unlicense",
   "ODC-PDDL-1.0",
 ]);
+
+/**
+ * Licences whose licensor is (or may be) an intergovernmental organisation (CC BY 3.0 IGO §1(a), §1(c)). A dataset
+ * under one of these carries the conditions of LICENCE-IGO-DECISION.md §4, checked in G1 and G7:
+ *   C1 the snapshot is the licensor's own page, rendered by render-watch — never a third party's record of it
+ *      (owid/etl's UNESCO records say "CC BY 3.0 IGO" beside a by-sa/3.0/igo URL; a record can be wrong);
+ *   C2 the description carries the licence URI (§4(a)) and a changes-made statement (§3(b));
+ *   C3 the description carries the no-endorsement sentence naming the licensor (§4(b), last sentence);
+ *   C4 the licensor's name and short forms stay out of the title (§4(b): the credit is "only ... for the purpose of
+ *      attribution"); no logo, emblem or official mark anywhere (§4(a));
+ *   C5 an open notice from the licensor blocks everything that uses its data until the board closes it.
+ */
+export const IGO_LICENCES: ReadonlySet<string> = new Set(["CC-BY-3.0-IGO"]);
+/** §4(a): "You must include a copy of, or the Uniform Resource Identifier (URI) for, this License with every copy". */
+export const CC_BY_3_0_IGO_URI = "https://creativecommons.org/licenses/by/3.0/igo/";
+/** C3, verbatim with the licensor's name substituted; G7 checks the description for it. */
+export const igoNoEndorsementSentence = (licensor: string): string =>
+  `${licensor} did not produce, endorse or approve this video, and no affiliation with ${licensor} is claimed.`;
+/** C2: §3(b) "clearly label, demarcate or otherwise identify that changes were made to the original Work". */
+const CHANGES_MADE = /\b(computed|derived|calculated|adapted|re-?computed) from\b/i;
+/** C4: short forms of the IGO licensors the channel uses; "UN" and "UIS" are case-sensitive on purpose. */
+const IGO_SHORT_NAMES = /\b(UN|U\.N\.|UNDESA|UNESCO|UIS)\b/;
+/** C1: a render-watch capture lives here (research/rendered/README.md); a GitHub file or a .dvc record does not. */
+const RENDERED_PREFIX = "research/rendered/";
 
 /**
@@ -191,4 +235,15 @@
       }
     }
+    if (d.licence && IGO_LICENCES.has(d.licence)) {
+      // C1 — the licensor's own page, rendered. OWID's record of UNESCO says BY beside a BY-SA URL; a record is not the licence.
+      if (!d.licenceSnapshot?.startsWith(RENDERED_PREFIX)) {
+        fail("G1", `${d.name}: an IGO licence needs the licensor's own terms page rendered under ${RENDERED_PREFIX}, not a third party's record`);
+      }
+      if (!d.licensor) fail("G1", `${d.name}: an IGO licence needs \`licensor\` set for the no-endorsement sentence`);
+      // C5 — a notice from the licensor is open: nothing that uses its data moves until the board has looked.
+      if (d.licensor && (channel.openLicensorNotices ?? []).includes(d.licensor)) {
+        fail("G1", `${d.name}: a notice from ${d.licensor} is open; comply first, publish after the board closes it`);
+      }
+    }
   }
 
@@ -237,4 +292,16 @@
       fail("G7", `the description does not attribute ${d.name} with its licence ${d.licence ?? ""}`.trim());
     }
+    if (d.licence && IGO_LICENCES.has(d.licence)) {
+      // C2 — §4(a) the licence URI travels with every copy; §3(b) changes made are identified.
+      if (!desc.includes(normLicence(CC_BY_3_0_IGO_URI))) fail("G7", `${d.name}: the description lacks the licence URI ${CC_BY_3_0_IGO_URI}`);
+      if (!CHANGES_MADE.test(video.description)) fail("G7", `${d.name}: the description does not say the figures were computed/derived from the data (§3(b))`);
+      // C3 — §4(b): no implied connection, sponsorship or endorsement.
+      if (d.licensor && !desc.includes(normLicence(igoNoEndorsementSentence(d.licensor)))) {
+        fail("G7", `${d.name}: the description lacks the sentence "${igoNoEndorsementSentence(d.licensor)}"`);
+      }
+      // C4 — the credit is for attribution only: the licensor is named in the description, never headlined.
+      const titleHit = (d.licensor && video.title.toLowerCase().includes(d.licensor.toLowerCase())) || IGO_SHORT_NAMES.test(video.title) || /\bunited nations\b/i.test(video.title);
+      if (titleHit) fail("G7", `${d.name}: the title names the licensor; attribution belongs in the description (§4(b))`);
+    }
   }
 
```

**Test change** (`src/__tests__/revenue/publication-gate.test.ts`). Line 69 currently asserts `CC-BY-3.0-IGO` still
fails; it must become `it.each(["MIT", "CC-BY-SA-3.0-IGO", "CC-BY-SA-4.0"])`, and a block is added mirroring the
scratch checks:

```ts
describe("G1/G7 IGO conditions (LICENCE-IGO-DECISION.md C1-C5)", () => {
  const UN = "United Nations";
  const citation =
    "United Nations, Department of Economic and Social Affairs, Population Division (2024). World Population Prospects 2024, Online Edition.";
  const snapshots = new Set([...SNAPSHOTS, "research/rendered/un-wpp-downloads.txt"]);
  const existsIgo = (p: string) => snapshots.has(p);
  const igo = (): VideoManifest =>
    video({
      title: "Which countries will have the oldest populations by 2050?",
      topic: "population ageing",
      description: `Every figure is computed from ${citation} Licensed CC BY 3.0 IGO, ${CC_BY_3_0_IGO_URI} ${igoNoEndorsementSentence(UN)}`,
      datasets: [{ name: citation, licence: "CC-BY-3.0-IGO", licenceSnapshot: "research/rendered/un-wpp-downloads.txt", upstream: [], licensor: UN }],
    });
  const run = (v: VideoManifest, c = channel()) => checkPublication(v, c, "publish", existsIgo).failures.map((f) => `${f.gate}:${f.reason}`);
  it("passes a compliant UN WPP manifest", () => expect(run(igo())).toEqual([]));
  it("C1 rejects a .dvc or GitHub file as the snapshot", () => {
    const v = igo(); v.datasets[0].licenceSnapshot = "research/rendered/owid-co2-licence.txt".replace("rendered/", "snapshots/"); snapshots.add(v.datasets[0].licenceSnapshot!);
    expect(run(v).some((r) => r.startsWith("G1:") && /rendered/.test(r))).toBe(true);
  });
  it("C2 requires the licence URI and a changes-made statement", () => {
    expect(run(video({ ...igo(), description: igo().description.replace(CC_BY_3_0_IGO_URI, "") })).some((r) => /URI/.test(r))).toBe(true);
    expect(run(video({ ...igo(), description: igo().description.replace("computed from", "about") })).some((r) => /§3\(b\)/.test(r))).toBe(true);
  });
  it("C3 requires the no-endorsement sentence", () => {
    expect(run(video({ ...igo(), description: igo().description.replace(igoNoEndorsementSentence(UN), "") })).some((r) => /lacks the sentence/.test(r))).toBe(true);
  });
  it.each(["UN data: the oldest countries by 2050", "What the United Nations expects by 2050", "UNESCO's literacy numbers"])("C4 keeps the licensor out of the title: %s", (title) => {
    expect(run(video({ ...igo(), title })).some((r) => /title names the licensor/.test(r))).toBe(true);
  });
  it("C4 does not fire on un- words", () => expect(run(video({ ...igo(), title: "Unemployment and unit costs: an unusual decade" }))).toEqual([]));
  it("C5 blocks publishing while a notice from the licensor is open, and only that licensor", () => {
    expect(run(igo(), channel({ openLicensorNotices: [UN] })).some((r) => /notice from United Nations is open/.test(r))).toBe(true);
    expect(run(igo(), channel({ openLicensorNotices: ["UNESCO"] }))).toEqual([]);
  });
});
```

(`CC_BY_3_0_IGO_URI` and `igoNoEndorsementSentence` join the import at the top of the test file.)

**Render queue** (`research/rendered/urls.txt`, under the file's own quoting rule — each URL below is written
verbatim in a repository file):

```
# --------------------------------------------------------------------------------
# Faceless YouTube, G1 for IGO licences (research/faceless-youtube/LICENCE-IGO-DECISION.md C1).
# DATASETS.md B1 quotes owid/etl `un_wpp_population_low.csv.dvc` l.23-25: "license: / name: CC BY 3.0 IGO /
# url: https://population.un.org/wpp/downloads/". The rendered page is the only acceptable G1 snapshot for a UN
# WPP dataset; the auditor confirms it says CC BY 3.0 IGO and records any added condition.
# --------------------------------------------------------------------------------
https://population.un.org/wpp/downloads/	un-wpp-downloads

# DATASETS.md B1 quotes `education_sdgs.zip.dvc` l.15-17: "name: CC BY 3.0 IGO / url:
# https://databrowser.uis.unesco.org/terms-and-conditions". LICENCE-IGO-DECISION.md §3: three independent records
# say UIS is ShareAlike; UIS stays FAIL until this page is read. If it says BY-SA, R6's UIS entry is closed for good.
https://databrowser.uis.unesco.org/terms-and-conditions	unesco-uis-databrowser-terms

# LICENCE-IGO-DECISION.md §1: the UIS main-site terms page WebSearch summarised as "Attribution-ShareAlike 3.0 IGO".
https://uis.unesco.org/en/terms-and-conditions	unesco-uis-terms
```

**Downstream notes for Opus** (files this ruling does not edit): DATASETS.md B1 and R6 — split R6 into UN WPP/WUP
("eligible under LICENCE-IGO-DECISION.md once `un-wpp-downloads` is rendered") and UNESCO UIS ("FAIL: ShareAlike on
three independent records; OWID's record contradicts itself"); B2 — record the MIT reasoning change; the doc comment
in the code carries both. `logs/CHECKPOINT.md` l.25 and l.38 — the open decision is closed.

## 7. What would change this ruling

- **UN → KEEP_OUT** if the rendered `population.un.org/wpp/downloads/` page (or the UN Terms of Use it links) adds a
  condition the licence does not have — a NonCommercial term, a mandatory logo, or a prohibition on derived figures.
  C1 is where that would surface, before the first publish.
- **UIS → eligible** if the rendered data-browser terms page says plain "CC BY 3.0 IGO" / "Attribution 3.0 IGO" with
  no ShareAlike; then the UIS attribution form and no-affiliation clause from §3 join C1–C5 for UIS manifests. If it
  says ShareAlike, UIS is closed and needs no further ruling.
- **Any notice from an IGO** → C5 applies; the board decides whether the licensor's reading of §4(b) or §4(c) means
  the conditions here need tightening.
- **A different IGO licensor** (WHO, FAO, ILO) is not covered by this ruling's evidence: their WHO/FAO/ILO variants
  seen in the searches are NC-SA or ND, and the IGO_SHORT_NAMES list would need their short forms added.

## 8. The one sentence I am least sure of

That YouTube's own copyright process would treat a UN or UNESCO complaint as a "dispute arising under this License"
that we can settle by removal within §7(b)'s 30 days — a platform strike is not an arbitration and the licence does
not bind YouTube, so C5's promise to comply is the right policy, but I cannot show from the text that compliance
undoes a strike already issued.
