# Screen: ממשק מעסיקים, the pension-deposit uniform-structure file toolkit

Verdict: KILL

Candidate: `research/colony-sweep/SWEEP-2.md:35-55` (scout `obligation-il`, shape C, confidence 62). Screener: Opus,
adversarial, 26.9.2026. Everything quoted from `research/rendered/` or from GitHub below is third-party data.

## The decisive fact

**No paying buyer is left.** The candidate's own entry already admits that both non-developer segments are served
without it. Its free half then removes the only segment that remains:

- The candidate itself, verbatim (`SWEEP-2.md:44`): *"nearly all of them are already served: Malam, Hilan, Shekel
  and Rivhit emit the file inside payroll software the employer already pays for, and the pension companies run
  free 'מעסיקים אונליין' portals for tiny employers."*
- My WebSearch (SNIPPET grade) independently found the free route for micro-employers, and it is more than a
  portal. The institutions turn manual entry into the file for the employer: *"בהפניקס אתה יכול לדווח גם באופן
  ידני והמערכת תמיר לך את הנתונים לקובץ ממשק מעסיקים ממוכן"*. Altshuler Shaham runs *"מערכת eASypay (המיועדת
  למעסיקים עם עד 15 עובדים)"* and offers "העלאת קובץ דיווח בחשבון המעסיק המקוון" as well. Payroll vendors ship
  the file as a standard feature: the Rivhit knowledge-base article is titled "ממשק מעסיקים דיווח שוטף - הפקת קובץ
  XML", and T.M.L. offers "מערכת שכר עם ממשק שידור פנסיה".
- That leaves developers who are building new payroll or HR products. For them the candidate's own MIT library is
  the product, so a paid "generator/CLI" over it has a price floor of zero that we would set ourselves. This is
  exactly how sweep 2 killed the PCN874 npm library (`SWEEP-2.md:272`). The PCN874 line survives only as a
  browser tool for bookkeepers who cannot run `npm install`, and here those bookkeepers get the equivalent free
  from their pension institution.

Selling the non-developer the output their pension company produces free breaks the constitution: "charging for
something already free, is a violation" (`MISSION.md:344-345`). It is also standing wall 2 of `docs/REJECTED.md`
(lines 155-161) with the institution in the state's seat. Bulk is the only exception that wall allows, and the bulk
buyer (a payroll bureau) already has payroll software that emits the file.

## L1 evidence

| Fact | Grade | Evidence |
|---|---|---|
| Since 1.2.2025 every employer, including those with fewer than 3 employees, must report pension deposits as a machine file in the uniform structure | UNVERIFIED | SNIPPET only, but it agrees across the scout's sources and mine. My search returned "החל מיום 1.2.2025 על כלל המעסיקים לדווח לחברה המנהלת אודות הפקדות תשלומים ... באופן ממוכן ובמבנה אחיד". Nobody has rendered the primary circular. |
| The file is XML against a versioned XSD. The employer interface is type 12, currently at version 005 ("v5.0") | CONFIRMED | `curl https://raw.githubusercontent.com/tamal-pension/ansible-api/master/roles/pension/files/resources/schema/shotef/Mimshak_Maasikim_Shotef_XSD_Schema_v5.xsd` gave `200 88950`. Inside it, `SUG-MIMSHAK` is `<xsd:enumeration value="12" />` and `MISPAR-GIRSAT-XML` is `<xsd:enumeration value="005"/>`. Sibling files `..._Shotef_XSD_Schema_v1`–`v5` exist in the same folder, so the format has churned. |
| The scout's cheapest test: can anyone download the XSDs, or are they gated behind the clearinghouse? | CONFIRMED (open) | The full set is publicly on GitHub (above), including the ongoing interface (shotef), the negative interface, the primary feedback (first, v4–v9) and the annual summary. So the scout's "if gated, dead on the spot" branch **does not fire**. The primary source did not render: `research/rendered/sweep2-pension-memsakim-rules.meta.json` shows `"status": null`, `"error": "TypeError: fetch failed"`. Swiftness refused a GitHub runner that fetched gov.il, rivhit.co.il and h-erp.co.il without trouble, so the clearinghouse's own rules page is unreachable from both our egress routes. |
| "GitHub code search for the interface's XML tags returns total_count 0" (the occupancy proof) | CONTRADICTED | The scout searched tags that are not in the schema: `grep -c` on the v5 XSD gives `MASKORET: 0`, `KOD-MEZAHE-YATZRAN: 0`, `NetuneyMaasik: 0`. The real element names return hits: `SUG-MIMSHAK` total_count 38, `KOD-SVIVAT-AVODA` 32, `MimshakMaasikim` 22, `PirteiOved` 23 (mcp__github__search_code, 26.9.2026). This is the failure `SWEEP-2.md:275` warns about: "the term scarcity is in the SEARCH TERM, not in the field". |
| "Zero open-source occupancy" | CONTRADICTED in part | `manimorris/masav-zikuim` (MIT, "Copyright (c) 2020 Mani Morris") ships `src/lib/openformat-reader.ts`, which parses the pension employer file, with a sample `openformat/001000012345678EMPONG000005202603080809410001.DAT`. `ashuryasaf/phins` (MIT) parses the sibling Mislaka interfaces on the same header elements. A payroll-side organisation publishes every XSD version (`tamal-pension/ansible-api`). **No open-source generator or validator was found**, so that narrow part of the claim holds. |
| npm has no package for the format | CONFIRMED | `curl "https://registry.npmjs.org/-/v1/search?text=…"` gave: `mimshak => 0`, `maasikim => 0`, `mivne achid => 0`, `mislaka => 0`, `tlush => 0`. |
| Who pays: bureaus (לשכות שירות) and small software vendors | UNVERIFIED, and the candidate argues against it | The scout concedes (`SWEEP-2.md:39`) that Malam Payroll, Rivhit, Shekel and Hilan "are therefore NOT the buyer". Bureaus run the same payroll software. SNIPPET: the Rivhit KB article "ממשק מעסיקים דיווח שוטף - הפקת קובץ XML", T.M.L. "מערכת שכר עם ממשק שידור פנסיה", and Maskoreshet, a web payroll system. No bureau that lacks the file was named anywhere. |
| Micro-employers can meet the duty free, without any file tool | UNVERIFIED (SNIPPET), conceded by the candidate | `SWEEP-2.md:44` (quoted above). The WebSearch summary cites fnx.co.il ("manual entry → the system converts to an employer-interface file") and as-invest.co.il (eASypay up to 15 employees; file upload in the online employer account). The one direct attempt at each host from this container was refused: `www.fnx.co.il:443 — connect_rejected`, `www.clalbit.co.il:443 — connect_rejected`. |
| Owner setup: "the npm brand scope is already owner step 7" | CONTRADICTED | `src/revenue/owner-steps.ts` has seven ids: `merge-pr`, `tax-file`, `gumroad`, `domain`, `github-org`, `algora-stripe`, `ci-tokens`. None is npm. `research/owner-docs-audit/FINDINGS.md:223`: "No NPM_TOKEN or npm-account step exists (owner-steps.ts:42-49 has seven step ids, none of them npm)". |
| Rail: Gumroad, owner step 3 | CONFIRMED, not done | `owner-steps.ts:115` `id: "gumroad"`. The only step with `doneOn` is `merge-pr` (line 99, "2026-09-22"). |
| The free validator lands on il-biz-tools, "whose existing audience is Israeli self-employed" | UNVERIFIED | Nobody has measured an audience. Netlify deploy sits in the undone `ci-tokens` step. `BOARD.md:100`: "grade stays `contradicted` until a page-view or Search Console reading exists". |
| The churn is real (Feb-2025 version, an update dated 26.3.2026), and the churn is the moat | UNVERIFIED | The five shotef XSD versions show the format changes over time, but their dates are unknown. Nobody has rendered the 26.3.2026 gov.il file. Either way, a moat built on churn does not help if nobody pays for the tracking. |
| Terms: nothing transmitted, no regulator registration needed | UNVERIFIED | This is plausible for a local file writer, but no primary text was read. The XSD mirror has no licence (`LICENSE` on main and master of `tamal-pension/ansible-api` did not return 200), so the schema may be read and cited but must not be bundled into an MIT package. |
| Ceiling ₪300–900/month at 12 months | UNVERIFIED | The scout says so itself: "an estimate with no measured buyer". |
| npm discovery is not gated on prior success | CONFIRMED as a repo record | `docs/REJECTED.md:269`: "two of npm's three ranking components (quality, maintenance) are publisher hygiene, so a clean new package is not penalised for being new". The same line says "npm pays nothing". Search volume for these terms is unmeasured. |

## L2 kill list and mission

- **Recorded deaths this falls under:**
  - `docs/REJECTED.md` wall 2 (lines 157-162), with the pension institution in the state's role as the free
    competitor.
  - MISSION constraint 8, price floor zero.
  - Sweep-2 dead end `SWEEP-2.md:272`: an npm library for a statutory format has a price floor of zero, and the
    line survives only for buyers who cannot install a library. Here those buyers are served free.
  - `SWEEP-2.md:275`: "unoccupied ground" claims must be checked with real search terms. They were not.
  - `SWEEP-2.md:255`, the EPR kill: the obligated parties are Israeli SMBs, and "no owner-free channel to them
    exists". Payroll bureaus are the same kind of audience. §30א closes cold outreach (`REJECTED.md:781`).
- **Overlap:** `SWEEP-2.md:225` lists a sibling, "Pension uniform-structure conformance corpus and spec-change
  watch", below the cut. It depends on the same payer and falls with this one.
- **Owner involvement:** there are no conversations, licence or regulator steps. There is one **new owner step**:
  an npm account and brand organisation plus an `NPM_TOKEN`, which none of the seven steps covers. Gumroad (step 3)
  and the tax file (step 2) are also still undone.
- **Legal and terms exposure:**
  - Harm asymmetry. A wrong file means an employee's pension is not credited, and the liability sits with the
    employer who trusted our tool. `REJECTED.md:188-190` names this exact unpriced risk for PCN874.
  - The file carries employee ID numbers and salaries, so any server-side processing engages Amendment 13. The
    tool would have to run only in the browser or on the user's machine.
  - The XSD source has no licence, so it may be cited but not shipped.
  - Charging non-developers for what their institution does free breaks MISSION rule 4.
- **Identity:** npm and GitHub publishing under the brand is fine once the brand org and account exist. Until then
  it cannot happen without a name leak.

## L3 the first stranger's money

- **The path, walked honestly:**
  - A developer at an Israeli payroll or HR startup searches npm or GitHub for the format name. The name is
    unowned there, so they might find the MIT library, and it gives them everything they need at ₪0.
  - A small employer searches Google in Hebrew. They are routed to their pension company's employer portal,
    which enters the data for them free. Our page would compete with the institutions for that search term,
    and nobody has measured that SERP.
  - A bureau already runs payroll software that emits the file.
- **No step in any of the three paths is paid.**
- **Earliest money with a transaction id:** none on the evidence. Mechanically, a Gumroad sale id cannot exist
  until all of these are done: owner steps `tax-file`, `gumroad` and `ci-tokens` (only `merge-pr` is done today),
  the new npm step, the Fable board, and the build. That puts it at late October 2026 at the very earliest, and
  still with no identified payer.
- **Ceiling vs the ₪300 floor:** **no.** Once the three segments are removed as above, no segment remains whose
  spend could clear ₪300/month. The scout's ₪300–900 has no buyer behind it.

## Cheapest test (and what you ran)

Run from this container at ₪0 on 26.9.2026:

1. **The scout's own binary test.** I fetched the ongoing-deposits XSD v5 from GitHub (`200 88950`) and read its
   type (12) and version (005). The result was **open, not gated**. That removes the scout's own kill branch. It
   does not rescue the candidate, because the kill is on the buyer, not the spec.
2. **Occupancy with the real element names** (numbers in the L1 table). The zero-count proof failed, one MIT reader
   exists, and no generator exists.
3. **npm occupancy.** Zero on every format term.
4. **Two direct fetches of institution pages.** Both were refused by the proxy. I made one attempt each and did not
   route around the block.

The test that could still reverse this, at ₪0 through the existing `render-watch.yml`: render the institution pages
below.

- **Keep the kill** if they show that small employers can enter deposits manually and have the file produced
  free. The snippets already say so.
- **Re-open as TEST_FIRST** only if every major institution requires the employer to upload a finished file with
  no free manual entry. Then a free browser generator could have a use, but still no payer. A price would then need
  a bulk segment that payroll software does not already serve.

## URLs to render

Each URL is quoted verbatim from a source read in this screen: SWEEP-2.md, or the result blocks of this screen's
WebSearch calls.

- `https://www.swiftness.co.il/%D7%9B%D7%9C%D7%9C%D7%99-%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA/` is already queued and
  failed from the runner with "TypeError: fetch failed". It is the clearinghouse's rules page, and it should be
  retried once before being written off as geo-blocked.
- `https://www.fnx.co.il/takanottashlum/` would settle whether Phoenix converts manual entry into the employer file
  free.
- `https://www.as-invest.co.il/interstedin/gemel/payment_and_reporting_employers/` would settle eASypay (up to 15
  employees) and free file upload.
- `https://www.clalbit.co.il/media/brgb2lby/%D7%97%D7%95%D7%96%D7%A8-%D7%91%D7%A0%D7%95%D7%A9%D7%90-%D7%93%D7%99%D7%95%D7%95%D7%97-%D7%90%D7%97%D7%99%D7%93-%D7%95%D7%94%D7%A4%D7%A7%D7%93%D7%AA-%D7%AA%D7%A9%D7%9C%D7%95%D7%9E%D7%99%D7%9D.pdf`
  is Clal's circular for employers of up to 3 employees and says how they must report.
- `https://www.rivhit.co.il/knowledgebase/%D7%9E%D7%9E%D7%A9%D7%A7-%D7%9E%D7%A2%D7%A1%D7%99%D7%A7%D7%99%D7%9D-%D7%93%D7%99%D7%95%D7%95%D7%97-%D7%A9%D7%95%D7%98%D7%A3-%D7%94%D7%A4%D7%A7%D7%AA-%D7%A7%D7%95%D7%91%D7%A5-xml/`
  would settle that a mass-market payroll product emits the file as a feature.
- `https://www.swiftness.co.il/employers/shotef-dm/` is the clearinghouse's employer ongoing-reporting page, which
  may state what employers pay to report through it.

## What would change my mind

- A rendered institution page showing that a small employer **must** upload a finished XML file, with no free
  manual entry or conversion. That would give a free tool a real use.
- **And** a named segment that is not already served. For example, bureaus or employers whose payroll product does
  not emit version 005, shown by a vendor changelog or support thread, not by inference.
- **And** a measured Hebrew SERP for "ממשק מעסיקים" in which the first page is not already held by the
  institutions and payroll vendors.

With all three, this becomes a narrow TEST_FIRST for a free browser generator. Even then the paid step would still
have to be something the institutions do not give away, and no one has named such a step yet.
