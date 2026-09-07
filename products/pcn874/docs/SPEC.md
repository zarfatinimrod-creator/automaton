# PCN874 record layout, from the Israel Tax Authority's own specification

**What this file is.** The Israeli VAT detailed report (`דוח מע"מ מפורט`, PCN874) is a fixed-width
ASCII text file uploaded to the Israel Tax Authority. Its layout is published by the ITA in a
circular to computerised accounts systems producers. **We have now read that document.** Every field
below cites the line of `research/rendered/pcn874-gov-il-874-eng.txt` — the extracted text of that
circular, stored in this repository — that states it. Three open-source implementations are still
cited, but they are **corroboration**; where they disagree with the document, the document wins, and
§6 records every place where it did.

**What this file is not.** It is not legal advice, and **it does not say your file will be accepted**.
Under `MISSION.md` rule 4 no format rule ships that was not rendered from a source; the primary
source is now the Authority's document, and §5 lists what it still does not settle. The Authority
publishes a free simulator — `http://www.misim.gov.il/EmDvhmfrt/wUploadFileHeshboniotSim.aspx`
(announced at `ita:…:84`, given as a URL by `herp:…:1263`) — and that is the thing that answers the
acceptance question.

Rewritten 2026-09-07 from `SPEC-FROM-SOURCES.md`, which read the same format out of open-source code
alone. The disagreement log that file kept is preserved in §6 as history, with each entry's verdict.

---

## 1. Sources

### 1.1 The official document

| | |
|---|---|
| title | *"Update: Deployment for PCN874 File Generation based on PC874 file structure"* — a circular **To: Computerized Accounts Systems Managements Program Producers** (line 3) |
| authors | Anat Glasner, Manager, Computerized Inspection Department, and Amir Bar Oz, Senior Manager – Procedures Development and Efficiency, Tax Authority (lines 23-26) |
| URL | `https://www.gov.il/BlobFolder/generalpage/tax-vat-online-invoice-reporting/he/IncomeTax_IncomeTaxSoftwareHousesInfo_874-eng.pdf` |
| rendered to | `research/rendered/pcn874-gov-il-874-eng.txt` (7 pages, 597 lines), fetched 2026-09-07, sha256 `072e03fb…3fc61b` |
| citation form | `ita:research/rendered/pcn874-gov-il-874-eng.txt:107` — key, file, line |
| structure | Appendix **A** the record layout (lines 91-192), Appendix **B** the representative's alignment file (194-215), Appendix **C** the permitted values per document type (220-594) |

**Date and version.** The document carries **no version number and no date of its own**. It is a
**2009** circular, and it says so four ways: *"The PCN874 file production must be completed by
01/01/2010"* (line 12); *"From 1/2011 'Sha'am' will allocate account numbers to users"* (line 59);
*"From 1/2012 this file will replace the periodical VAT report"* (line 63); and Appendix C §3 is
headed *"Additional Comments relating to the Variables Entry Field (in 2010 fiscal year)"* (line 536).

**What it says about later changes.** It announces two, and specifies neither: the allocation-number
regime from 1/2011 (lines 59-61 — *"provision must be made to enable the storage of an additional
reference number in the program (or to replace one of the existing fields)"*), and this file
replacing the periodical VAT report from 1/2012 (line 63). It also warns that *"Parameter values may
change from time to time. These changes will be published in memos"* (lines 586-588) — naming the
₪5,000 and 2% thresholds specifically, not the field widths.

**Nothing in this repository has rendered a later edition of the layout itself.** The two Hebrew
manuals below are newer than the circular, but they are vendor user guides: neither restates the byte
layout, so neither can be used to check a width or an offset. Both are cited only where they say
something the circular cannot know.

### 1.2 The two Hebrew vendor manuals

| key | document | date | what it is good for here |
|---|---|---|---|
| `rivhit` | Rivhit, *מדריך להכנת דיווח מקוון למע"מ, קובץ PCN874* — `https://www.rivhit.co.il/uploaded_files/documents/pcn874_manual_U1231.pdf`, rendered to `research/rendered/pcn874-rivhit-mirror.txt`, 33 pages | **edition 1.51, updated 7/7/2011** (line 10) | Confirms the file-name convention and the union-of-dealers flow. Contains **no record layout**: it is a guide to Rivhit's own screens. |
| `herp` | Hashavshevet, *חשבשבת ERP — מע"מ מקוון PCN874* — `https://downloads.h-erp.co.il/files/vatr/Guidance874W.pdf`, rendered to `research/rendered/pcn874-h-erp-mirror.txt`, 50 pages — its own footers number them "of 48" | undated; current to **release 2025 SP2** (line 1397), describes duties starting **1/1/2026** | The **only rendered source that describes the allocation-number regime**: from 1/1/26 an invoice of ₪10,000 or more before VAT must carry an allocation number, of which *"the 9 rightmost characters"* are recorded (lines 126-127, 303, 507-508). Also gives the Authority's simulator URL (line 1263) and the rounding tolerance (§5.2). Contains **no record layout** either. |

The H-ERP manual carries **two figures attached to two contexts, and explains neither**: ₪10,000 on
lines 126-127, 303 and 507-508, and ₪20,000 on line 1638. It is not a contradiction on its face.
Every ₪10,000 sentence is expressly dated *"החל מתאריך 1/1/26"* ("from 1/1/26"). The ₪20,000 sentence
is undated, describes a warning window in the release the manual documents (2025 SP2, line 1397), and
says the consequence is that the VAT is not deductible (line 1641) — not that the file is malformed.
The natural reading is a threshold in force when the manual was written and a lower one announced for
1/1/26; **the rendered texts do not say so**, and no Tax Authority document in this repository states
either figure or any schedule. That is why no threshold is encoded in this product.

### 1.3 The three implementations (corroboration)

| key | repo | path(s) | language | licence | independent? |
|---|---|---|---|---|---|
| `accounter` | [`Urigo/accounter-fullstack`](https://github.com/Urigo/accounter-fullstack) | `packages/pcn874-generator/src/{index,types,schemas}.ts`, `src/utils/{builders,data-handlers}.ts` | TypeScript | **MIT** | yes |
| `linet3` | [`adam2314/linet3`](https://github.com/adam2314/linet3) | `protected/models/FormReportPcn874.php`, `protected/models/Docs.php` | PHP (Yii2) | **AGPL-3.0** | yes |
| `rcbuilder` | [`RcBuilder/Scripts`](https://github.com/RcBuilder/Scripts) | `CODE/PCN-874/…/PCN874Manager.cs`, plus two committed sample files | C# | **none — no LICENSE file** | yes |

**How well they did.** On the 34 fields' **offsets** the three agree with the document everywhere. On
**widths** they agree everywhere except one field, where `linet3` alone reads 9 digits instead of 11
(§6.1). On field **types** they are wrong together exactly once — the reference group is `A(4)` and all
three write digits (§6.9). Everything else the document overturned is a matter of a field's *value or
scope* rather than its shape: the closing letter (`linet3`, §6.5), which records feed the two counts
and whether equipment inputs are real (`rcbuilder`, §6.4), and the sign of zero (`rcbuilder`, §6.8).
That is why the earlier reading held up as well as it did, and precisely where it did not.

`amitpo23/cfo` was found and **excluded** before it mattered — its own module docstring says its byte
offsets are unverified — and the document confirms that call: its layout differs from Appendix A in
four places at once.

**Licence consequences.** `accounter` is MIT; `linet3` is AGPL-3.0; `rcbuilder` has no licence at
all; the ITA circular is a government publication. Field offsets and widths are facts about a
government file format rather than expression, so citing them is fine and short quotation is fine;
copying code or sample files is not. Every fixture in `tests/fixtures/` is generated by
`scripts/make-fixtures.mjs` from the table below, with invented digits.

---

## 2. File grammar

> *"The file will include a header (summary) entry, transaction entries and a closing entry as
> detailed in Appendix 'A'. Due to the fact that the file is of a fixed structure, any instance where
> the field is in reality "shorter" than that required by the technical specifications, it is
> necessary to add preliminary zeros."* — official lines 39-42

```
<header entry>            exactly one, first        131 characters
<transaction entry> …     zero or more               60 characters each
<closing entry>           exactly one, last          10 characters
```

| property | value | source |
|---|---|---|
| file name | Appendix A heads its table *"File Name: PCN874.TXT"*, but **this validator does not check the name**, and the name is not fixed in practice: the two vendor manuals show three others — `PCN874_XXXXXXXXX_YYYYMM.txt` (`rivhit:…:264`), `pcn874.txt` (`herp:…:1238`) and `874_database - id_mmyy_ddmmhhmm.txt` (`herp:…:1525`) | `ita:…:93`, `rivhit:…:264`, `herp:…:1238,1525` |
| padding | **leading ("preliminary") zeros**; the sign is a separate 1-character field immediately before the digits | `ita:…:40-42`, and Appendix A's separate "+/- symbol" rows |
| amounts | whole shekels, rounded, absolute value in the digits | `ita:…:144,148-149` |
| sign of zero | **"+"** — *"In a '+/-' field: When the amount field is zero, the value of the '+/-' field will be '+'."* Line 174 carries this rule on its own; Appendix C §2 is **not** a restatement of it (§6.8) | `ita:…:174` |
| character set of an `A(n)` field | **not stated by any rendered source** — not case, not punctuation, not script, and not the file's byte encoding (§5.7) | — |
| dates | `YYYYMMDD` for invoice and generation dates, `YYYYMM` for the report period | `ita:…:102,105,138` (see §5.1 for the document's own inconsistency about the generation date) |
| encoding | whatever `A(n)`, `N(n)` and `+/-` admit; **the document declares no encoding**, so a non-ASCII byte is a *warning* at file level while an `N(n)`, `+/-` or fixed-value field still rejects it as an error on its own type rule | `ita:…:96-161` |
| record separator | **not stated by any rendered source** — see §5.3 | — |

---

## 3. The field-by-field table, from Appendix 'A'

Offsets are 0-based and derived by running totals of the document's declared widths. `class` is how
this validator enforces the document's `A(n)` / `N(n)` / `+/-` type.

### 3.1 Header entry — `O`, 131 characters

Official lines 94-126. `1+9+6+1+8 +1+11 +1+9 +1+11 +1+9 +9 +1+11 +1+9 +1+9 +9 +1+11 = 131`.

| # | off | len | id | official name (Appendix A) | type | class | `ita` line | corroboration |
|---:|---:|---:|---|---|---|---|---:|---|
| 1 | 0 | 1 | `recordType` | Entry Type — `"O"` fixed value | A(1) | literal | 100 | all three |
| 2 | 1 | 9 | `licensedDealerId` | Customer's Licensed Dealer identification Number | N(9) | digits | 101 | all three |
| 3 | 10 | 6 | `reportMonth` | Month for which detailed report is being submitted — Yyyymm form | N(6) | digits | 102 | all three |
| 4 | 16 | 1 | `reportType` | Report Type — Field Value=1, Future changes possible | N(1) | literal `1` | 103-104 | all three |
| 5 | 17 | 8 | `generationDate` | File Generation Date | N(8) | digits | 105 | all three — **§5.1** |
| 6 | 25 | 1 | `taxableSalesAmountSign` | +/- symbol for total taxable sales | +/- | sign | 106 | all three |
| 7 | 26 | 11 | `taxableSalesAmount` | Total amount of taxable sales (excluding VAT) | N(11) | digits | 107 | all three |
| 8 | 37 | 1 | `taxableSalesVatSign` | +/- symbol for total VAT on taxable sales | +/- | sign | 108 | all three |
| 9 | 38 | 9 | `taxableSalesVat` | Total VAT on taxable sales | N(9) | digits | 109 | all three |
| 10 | 47 | 1 | `differentRateSalesAmountSign` | +/- symbol … different rate — Currently `"+"` | +/- | sign | 110 | all three |
| 11 | 48 | 11 | `differentRateSalesAmount` | Total of sales taxable at different rate — Currently zeros, for future use | N(11) | digits | 111 | all three |
| 12 | 59 | 1 | `differentRateSalesVatSign` | +/- symbol … VAT at different rate — Currently `"+"` | +/- | sign | 112 | all three |
| 13 | 60 | 9 | `differentRateSalesVat` | Total VAT on sales taxable at different rate — Currently zeros | N(9) | digits | 113 | all three |
| 14 | 69 | 9 | `salesRecordCount` | Total number of records for "sales" — both taxable and zero-rated/exempt | N(9) | digits | 114-115 | **§6.4** |
| 15 | 78 | 1 | `zeroOrExemptSalesAmountSign` | +/- symbol for total of zero value and exempt sales | +/- | sign | 116 | all three |
| 16 | 79 | 11 | `zeroOrExemptSalesAmount` | Total of zero value/exempt sales for period | N(11) | digits | 117 | **§6.3** |
| 17 | 90 | 1 | `otherInputsVatSign` | +/- symbol for total VAT on "other" (non-capital) inputs | +/- | sign | 118 | all three |
| 18 | 91 | 9 | `otherInputsVat` | Total VAT on "other" inputs required during period | N(9) | digits | 119 | all three |
| 19 | 100 | 1 | `equipmentInputsVatSign` | +/- symbol for total VAT on "equipment" inputs | +/- | sign | 120-122 | all three |
| 20 | 101 | 9 | `equipmentInputsVat` | Total VAT on "equipment" inputs required during period | N(9) | digits | 123 | **§6.4** |
| 21 | 110 | 9 | `inputsCount` | Total number of records for inputs (other and equipment) | N(9) | digits | 124 | **§6.4** |
| 22 | 119 | 1 | `reportedVatSign` | +/- symbol for total VAT to pay / receive — `"+"` symbol to pay | +/- | sign | 125 | all three |
| 23 | 120 | 11 | `reportedVat` | Total VAT to pay / receive for period | N(11) | digits | 126 | **§6.1**, arithmetic **§5.2** |

### 3.2 Transaction entry — 60 characters

Official lines 127-152. `1+9+8+4+9+9+1+10+9 = 60`.

| # | off | len | id | official name (Appendix A) | type | class | `ita` line | corroboration |
|---:|---:|---:|---|---|---|---|---:|---|
| 1 | 0 | 1 | `recordType` | Entry Type (document type) — see the Table of Values | **A(1)** | alpha | 133, 176-192 | **§6.5** |
| 2 | 1 | 9 | `counterpartyVatId` | VAT identification number – of the other side of the transaction | N(9) | digits | 134-137 | all three |
| 3 | 10 | 8 | `invoiceDate` | Invoice Date/Reference — YYYYMMDD | N(8) | digits | 138 | all three |
| 4 | 18 | 4 | `refGroup` | Reference group — Series etc., zeros are possible at this stage | **A(4)** | alphanumeric | 139, 580-581 | **§6.8 — the document contradicts all three** |
| 5 | 22 | 9 | `refNumber` | Reference number — First 9 positions from the right | N(9) | digits | 141 | all three |
| 6 | 31 | 9 | `totalVat` | Total VAT in invoice / total VAT that is allowed (1/4…, 2/3…) — rounded, always a positive value | N(9) | digits | 142-144 | all three |
| 7 | 40 | 1 | `invoiceSumSign` | +/- symbol: credit/summary invoice — cancellation/credit always in minus | **A(1)** | sign | 145-146, 523-535 | all three |
| 8 | 41 | 10 | `invoiceSum` | Invoice total not incl. VAT — always the 100%, always a positive value, rounded | N(10) | digits | 148-149 | all three |
| 9 | 51 | 9 | `allocationNumber` | Space for future data — Reference number to be allocated by "Sha'am" to the supplier | N(9) | digits | 150-152, 583-584 | **§6.2** |

### 3.3 Closing entry — `X`, 10 characters

Official lines 154-161.

| # | off | len | id | official name | type | class | `ita` line |
|---:|---:|---:|---|---|---|---|---:|
| 1 | 0 | 1 | `recordType` | Entry Type — `"X"` fixed value | A(1) | literal | 158 |
| 2 | 1 | 9 | `licensedDealerId` | Licensed Dealer Identification Number of submitter | N(9) | digits | 159-161 |

### 3.4 The Table of Values — the eleven entry types

Official lines 176-192. **One character**, and exactly these eleven.

| letter | official name | side | `ita` line |
|---|---|---|---:|
| `S` | Sales – "regular" sale | sale | 181 |
| `L` | Sales – for unidentified (private) customer | sale | 182 |
| `M` | Sales – self invoice | sale | 183 |
| `Y` | Sales – export | sale | 184 |
| `I` | Sales – Palestinian Authority customer | sale | 185 |
| `T` | Input – "regular" from Israeli Supplier | input | 186 |
| `K` | Input – Petty Cash | input | 187 |
| `R` | Input – Import | input | 188 |
| `P` | Input – Supplier from Palestinian Authority | input | 189 |
| `H` | Input – Single document by law | input | 190 |
| `C` | Input – self invoice | input | 191 |

### 3.5 Appendix 'B' — the representative's alignment file, which this validator does NOT check

Official lines 194-215. A CPA or tax advisor may submit one file covering several users, all for the
same period; *"Use of this alignment will be optional"* (lines 44-48). Its shape:

```
A + representative VAT id N(9) + month N(6)          initial entry, 16 characters   (lines 198-204)
… the individual users' reports …                                                   (line 205)
Z + number of users N(9) + number of entries N(9)    summary entry, 19 characters   (lines 209-215)
```

This matters here for one reason: **`Z` is a real letter in this format**, which is what `linet3`
was reaching for. It is just not the letter that closes an individual merchant's file. The validator
recognises an `A` first record and says which file it is looking at, rather than "unknown record
type"; it does not validate the alignment file itself.

### 3.6 Appendix 'C' — permitted values per entry type

Official lines 220-517. *"All fields are compulsory. Below are the possible values for each field in
each situation. 'V' symbolizes a compulsory field in accordance with the column heading"* (line 224).
Thirteen rows for eleven letters — `S` and `L` each appear twice, once taxable and once zero-rated.

| entry type | counter party | invoice date | ref. group | ref. number | VAT sum | 100% sum | future allocation | `ita` lines |
|---|---|---|---|---|---|---|---|---:|
| `S` regular, identified customer | Customer | V | Zeros/V | V | V | V | Zeros | 250-270 |
| `S` zero value / exempt, not export | Customer | V | Zeros/V | V | **Zeros** | V | Zeros | 271-291 |
| `L` private/unidentified, aggregated | **Zeros** | Date of Aggregation | Zeros/V | V / No. of sale invoices | V | V | Zeros | 292-313 |
| `L` zero value / exempt, aggregated | **Zeros** | Date of Aggregation | Zeros/V | V / No. of sale invoices | **Zeros** | V | Zeros | 314-334 |
| `M` self invoice (sale) | Supplier | V | Zeros/V | V | V | V | Zeros | 335-355 |
| `Y` export entry | Export Entry or `999999999` | Export Entry Date | Zeros/V | V | **Zeros** | V | Zeros | 356-376 |
| `I` Palestinian Authority customer | Customer | V | Zeros/V | V | V | V | Zeros | 377-395 |
| `T` regular Israeli supplier | Supplier | V | Zeros/V | V | V | V | Zeros | 396-414 |
| `C` self invoice (input) | Supplier | V | Zeros/V | V | V | V | Zeros | 415-435 |
| `K` petty cash | **Zeros** | Entry Date | Zeros/V | **No. of Invoices** | V | V | Zeros | 436-456 |
| `R` import entry | Import Entry | Import Entry Date | Zeros/V | **Zeros** | V | V | Zeros | 457-477 |
| `P` Palestinian Authority supplier | Supplier | V | Zeros/V | V | V | V | Zeros | 478-496 |
| `H` other document by law | Supplier | V | Zeros/V | V | V | V | Zeros | 497-517 |

The notes that follow (lines 536-594) qualify several rows:

- **A** (line 537): the customer's merchant number is obligatory above ₪5,000 before VAT; below it,
  identification is optional and small sales may be aggregated. **The validator splits `S` on that
  figure**: above ₪5,000 a zeros counter party is an `error`, at or below it a `warning` — with the
  document's own caveat that parameter values *"may change from time to time … e.g 5000 shekels/2%
  etc."* (lines 586-588) quoted into both.
- **B** (line 543): `L` aggregates sales under ₪5,000; the **number** of aggregated sales goes in the
  reference field and the **last date** of the list in the date field.
- **C** (line 556): a self-invoice sale carries the **supplier** number in the counter-party field.
- **D** (line 560): an export sale carries the export entry number, or `999999999` for services and
  intangibles; VAT is zeros. Note D is marked on the `R` row as well — see §5.4.
- **E** (line 566): petty cash may repeat, capped at 2% of the file's VAT or ₪2,000, *"the greater of
  them"*; the reference number is the number of invoices. **`totals.pettyCashCap` reports a breach as
  a warning** — note E itself says the restrictions *"may change from time to time"* (lines 569-570)
  and never defines what *"the total VAT of the file's entries"* is; the rule takes the widest base,
  every transaction record's VAT, which is the reading most favourable to the file.
- **F** (line 573): for `H`, an unknown reference number is entered as zeros — and *"Counter file
  number: in accordance with 'Sha'am' guidelines"* (line 574), guidelines nothing here has rendered.
  That is why `H` is the one counter-party row this validator warns about rather than rejects.
- Mixed invoices are reported as taxable, or split into two entries with the same type, customer,
  date and reference number (lines 169-172, 551-555).
- A correction cancels the wrong invoice with the opposite sign and reports it again (lines 590-594).

### 3.7 Signs — Appendix 'C' §2

Official lines 523-535. The table is introduced as *"Table of possible values for a field
marked/designated '+/-'. This field represents the positive/negative sign of the value of the
input"* (lines 523-524).

| transaction | sale to customer | credit to customer | purchase from supplier | credit from supplier | zero value field |
|---|---|---|---|---|---|
| sign | `+` | `-` | `+` | `-` | `+` |

**The last column is ambiguous and is not used as a rule here.** Four of the five columns are kinds
of *transaction*, and the document uses *"zero value"* to mean **zero-rated** throughout — *"including
'zero value' and exempt transactions"* (line 57), *"taxation or zero value transactions"* (lines
169-170), *"Zero Value/Exempt 'SL'"* (line 271), *"A 'mixed' transaction (exempt/zero value and
regular)"* (line 551). Read that way the column says "a zero-rated transaction takes `+`", which is a
different rule from "an amount of zero takes `+`". **Line 174 carries the sign-of-zero rule on its
own**, and the validator's finding now cites 174 alone (§6.8).

---

## 4. What the validator does with all this

Severity is now set by how the document states a rule, not by how many repositories agree:

| severity | means | example |
|---|---|---|
| `error` | the circular states it outright, in words that admit no second reading | the closing entry is `X`; an `L` record's counter-party id is zeros; a `T`, `M`, `C`, `P` or `I` record's is not; a header amount of zero takes `+`; an identified sale above ₪5,000 names its customer |
| `warning` | the document gives the field its meaning but does not forbid the value; or two parts of the document pull against each other; or the document is simply silent; or the only source is a vendor manual or an implementation | a `K` record whose invoice count is zero; an `R` record carrying a reference number; a reference group with punctuation or Hebrew in it; a closing dealer id that differs from the header's; petty cash over note E's cap; mixed line endings |
| `info` | reserved; nothing emits it | — |

The dividing line is **what the cited line says**, not how serious the mistake feels. A rule that
rejects a file on an inference — however reasonable the inference — is a rule that can reject a legal
file, and a legal file rejected is as much a defect here as an illegal one accepted.

Every finding carries `basis`, derived from its own citations: `official`, `vendor-manual` or
`oss-only`. There is no rule in the validator today whose basis is `oss-only` except the line-ending
warning, which says so in its own text.

### 4.1 What the tests actually prove about an `error`

Two tests in `tests/validate.test.ts` guard the ladder above, and it matters exactly what each one
claims:

- *"every ERROR is backed by the Tax Authority document"* checks that the finding's `basis` is
  `official`, that it carries an `officialText`, and that at least one citation is an `ita:` one. That
  is **"every error cites the document"** — no more.
- *"every ERROR quotes a line that really says it"* reads the cited lines **out of
  `research/rendered/pcn874-gov-il-874-eng.txt`** and requires the finding's `officialText` and those
  lines to share four consecutive words. It cannot prove the rule *follows* from the document, but it
  does catch a quote that has drifted away from the line it names.

The second test exists because the first was once the whole of the claim, and it was not enough.
`research/colony-sweep/audits/pcn874-reconciliation.md` §3 found **three rules that were errors on
lines which do not state them** — `file.encoding.ascii`, `header.generationDate.calendar` and
`footer.licensedDealerId.matchesHeader` — and every one of them passed, because "an `ita:` citation
exists" is not "the cited line says this". All three are warnings now (§6.11), and adding the second
test immediately caught two more paraphrases-presented-as-quotes, in `detail.length` and
`file.record.unknown`, which were rewritten to quote the lines they cite.

**Neither test can settle whether a rule is right.** That is what the refutation audit was for, and
it is why the audit is a file in this repository rather than a claim in this one.

---

## 5. What the official document does NOT settle

### 5.1 The generation date's format — the document contradicts itself

Line 105 reads `File Generation Date   N(8)   Yyyymm form`. `N(8)` is eight digits; `Yyyymm` is six
characters, and it is the same comment the document gives the genuinely six-character report-month
field on line 102. The comment cannot be right for an eight-digit field. **The width is not in
doubt** — `N(8)`, and the widths sum to 131 only with 8 — but the format is stated wrongly.

**What this validator does:** reads it as `YYYYMMDD`, which is what all three implementations write,
and reports a value that is not a real calendar date as an error whose text names this inconsistency.
The extraction is faithful; the document is what is inconsistent.

### 5.2 The `reportedVat` arithmetic — no formula anywhere

The document defines the field (`Total VAT to pay / receive for period   N(11)`, line 126) and its
sign (`"+" symbol to pay`, line 125) and **never says how the value is computed**. There is no
formula in Appendix A, B or C. Neither Hebrew manual gives one. The three implementations give three
different answers, and one of them says it does not know.

**What this validator does: nothing.** No `reportedVat` arithmetic check is implemented, and none
should be until a source states the formula. A second fact points the same way for every amount, from
the H-ERP manual (lines 1185-1190): the Authority requires each journal entry to be rounded before
the totals are summed, so the header can differ from the unrounded books *"by a few tens of shekels"*,
and *"of course the difference should not prevent transmitting the file"*. An amount cross-check that
failed a file on that difference would be worse than no check.

### 5.3 Line endings, trailing newline, encoding

The circular calls the file *"of a fixed structure"* and lists its entries in order (lines 39-42) but
never states a record separator, a trailing newline, or a character encoding. Neither Hebrew manual
does either. **This validator accepts LF, CRLF and CR**, accepts a trailing newline or none, and
warns only when one file mixes endings. That warning is the one rule in the product whose basis is
`oss-only`, and it says so.

### 5.4 An import entry's reference number

Appendix C's `R` row gives the reference number as `Zeros` (line 467). The same row carries the
comment marker `D`, and note D — headed *"Export Entry Sale"* — says *"The reference number will
include the invoice number"* (line 563). One of the two is being applied to `R` by accident, and
nothing rendered says which. **Kept a warning**, with both readings in the finding text.

### 5.5 Whether a period with no transactions is a legal file

The document lists transaction entries in the file but never states a minimum of one, and neither
manual addresses a quiet month. `accounter` rejects a file of fewer than three lines; `rcbuilder`
ships a sample with no `S` or `L` records. **Warning, not an error.**

### 5.6 Whether the layout has changed since 2009

This is the largest open question and it is not a defect in the reading — it is the state of the
evidence. The circular announced allocation numbers for 1/2011 and the replacement of the periodical
report for 1/2012 without specifying either. The one rendered source describing the allocation-number
regime as it actually arrived is a **software vendor's manual**, not a Tax Authority document. So:

- the **widths and offsets** here are the Authority's own, and the two later manuals contain nothing
  that contradicts them;
- the **meaning of the last transaction field** has demonstrably changed since 2009 (§6.2), and we
  know that from a vendor, not from the Authority;
- a later official edition, if one exists, has not been rendered. `.github/workflows/pcn874-spec-watch.yml`
  watches the hash of all three documents so a new edition is noticed rather than assumed away.

### 5.7 The alphabet of an `A(n)` field, and the file's encoding

Appendix A types the reference group `A(4)` — *"Series etc.   zeros are possible at this stage"*
(line 139) — and Appendix C's notes call its content *"internal characters of the submitter
(series/branch etc.)"* (lines 580-581). **Neither line, and nothing else in 597 + 1,985 + 3,232 lines
of rendered text, says which characters an `A(n)` field admits**: not case, not punctuation, not
non-Latin script, and not the byte encoding of the file — so not whether a Hebrew series code, or a
UTF-8 BOM, survives the Authority's reader.

**What this validator does:** letters in either case and digits pass with no finding; anything else
in an `A(n)` field is a **warning** carrying that open question, as is a non-ASCII character anywhere
in the file. Nothing the document *does* state is lost by this: every `N(n)`, `+/-` and fixed-value
field rejects a non-ASCII character as an **error** under its own type rule, on the document's own
authority. The reference group is the one field where the demotion changes an outcome, and it is the
one field whose alphabet the document leaves open.

### 5.8 What the vendor manuals say that the circular does not

Recorded here as **vendor-sourced facts**, never as the Authority's. No rule is built on any of them.

| fact | source | why it is not a rule |
|---|---|---|
| An invoice whose VAT is above **₪300** may not be reported as petty cash | `rivhit:…:318-319` (edition 1.51, 2011) | A per-invoice cap the circular does not state anywhere; note E's cap is on the *total* of the `K` entries (lines 566-568). Recorded in `totals.pettyCashCap`'s open question. |
| A **refund** report must be produced in PCN874 form detailing **all** inputs, without aggregating those whose VAT is under ₪300 | `rivhit:…:3080-3081` | About which entries a filer must produce, not about the file's shape. |
| An **identified** sale is one where the customer has a VAT number **or an ID number**, and goes as `S`; an unidentified one as `L` | `rivhit:…:3163-3165` | The circular's Appendix C says `L`'s counter-party field is `Zeros` (lines 297, 318) and says nothing about a private customer's ID number. Whether an ID number may appear in an `L` record is unsettled; the validator follows the circular. |
| The "amount to pay" screen: *"amount to pay"* is the current report's VAT before marking entries, *"amount to pay after offset"* is it after offsetting the inputs marked in that window | `herp:…:1114,1116` | A description of one vendor's screen, not a definition of the file's `reportedVat` field. It is the nearest thing to a formula in any rendered source, and it is not one — see §5.2. |
| Per-entry rounding makes the header totals differ from the unrounded books *"by a few tens of shekels"*, and *"of course the difference should not prevent transmitting the file"* | `herp:…:1185-1190` | Evidence *against* writing an amount cross-check, not for one. |
| Three production types the circular never describes: a single-dealer file, a file shared by several dealers *"relevant for representatives"*, and a union of dealers | `herp:…:990-1002` | Why `footer.licensedDealerId.matchesHeader` is a warning (§6.11). |
| From 1/1/26, an invoice of ₪10,000 or more before VAT must carry an allocation number, of which *"the 9 rightmost **characters**"* are recorded | `herp:…:126-127,303,507-508` | The circular types the field `N(9)` — nine **digits**. The validator enforces `N(9)`, on the circular's authority, so a non-digit allocation number is rejected by the right document. See §6.2. |

---

## 6. The seven disagreements, reconciled against the document

`SPEC-FROM-SOURCES.md` recorded eight numbered places where the implementations disagreed, seven of
which its README counted as disagreements proper. Each is settled below, in that file's numbering, so
the history stays checkable. Six were settled by the document; one by a vendor manual the document
itself anticipates; one is still open. §6.9 was never in that log at all, because the implementations
agreed and agreement was mistaken for evidence.

**§6.11 is a second pass over all of it.** A refutation audit
(`research/colony-sweep/audits/pcn874-reconciliation.md`) graded every resolution and every rule
against the extracted text and built files to test both directions. The resolutions held; several of
the *rules* built on them did not, and §6.11 is the ledger of what changed.

### 6.1 (was §5.1) Width of the last header field — **RESOLVED (official): 11 digits**

> `Total VAT to pay / receive for period   N(11)` — `ita:…:126`

`accounter` and `rcbuilder` said 11, `linet3`'s comment said 9. The document says **N(11)**, and
Appendix A's declared widths sum to 131 only with 11. The header length of 131 is therefore the
Authority's, not an inference from two repositories and a sample file. `linet3` was wrong, and was
already internally inconsistent about it.

### 6.2 (was §5.2) The last nine characters of a transaction record — **RESOLVED (official for 2009; the Hebrew manual decides for today)**

The document is explicit for its own era:

> `Space for   future   data   N(9)   Reference number to be allocated by "Sha'am" to the supplier` — `ita:…:150-152`
>
> *"Future Field – intended for the subject of ascribing invoices as transactions. At this stage, the
> value in this field will be zeros."* — `ita:…:583-584`

and Appendix C's "For Future Allocation" column is `Zeros` in all thirteen rows. So `rcbuilder`
(`FutureData`, "all zero") and `linet3` (literal zeros) were right **for the document they were
written against**, and the circular already tells you the change was coming (lines 59-61).

For the regime in force now the only rendered source is the H-ERP manual:

> *"החל מתאריך 1/1/26 בחשבונית בסכום של 10,000 ₪ ומעלה לפני מע"מ, חובה לרשום את מספר ההקצאה שהתקבלה
> מרשות המיסים. יש לרשום את 9 התווים מימין."* — `herp:…:507-508`
> ("From 1/1/26, on an invoice of ₪10,000 or more before VAT, the allocation number received from the
> Tax Authority must be recorded. Record the 9 rightmost characters.")

which is `accounter`'s reading, from a vendor rather than from the Authority.

**What this validator does:** requires 9 digits and accepts zeros and any other 9 digits equally.
Whether a given invoice *requires* an allocation number is a legal question about the filer's own
invoices, and this product does not answer it.

One wrinkle worth naming: the manual says *"9 התווים"* — nine **characters** — while the circular
types the field `N(9)`, nine **digits**. The validator enforces `N(9)`, so a non-digit allocation
number is rejected on the circular's authority, which is the right authority. On the threshold, see
§1.2: two figures, ₪10,000 dated *"from 1/1/26"* and ₪20,000 undated, attached to two contexts the
manual never reconciles, and no Tax Authority source for either.

### 6.3 (was §5.3) `zeroOrExemptSalesAmount` — **RESOLVED (official): an amount**

> `Total of zero value/exempt sales for period   N(11)` — `ita:…:117`, preceded by
> `+/- symbol for total of zero value and exempt sales` — `ita:…:116`

An amount, and the giveaway is structural: the document gives it a `+/-` sign field of its own, and a
record count has no sign. `accounter`'s identifier `zeroValOrExemptSalesCount` is a misnomer; its own
doc comment on the same field was right.

### 6.4 (was §5.4) Which records feed `inputsCount`, and whether `equipmentInputsVat` is real — **RESOLVED (official)**

> `Total number of records for inputs (other and equipment)   N(9)` — `ita:…:124`
>
> `Total VAT on "equipment" inputs required during period   N(9)` — `ita:…:123`

The Table of Values marks `T K R P H C` as "Input" (lines 186-191). Inputs are either "other" or
"equipment", so **all six input letters count**. `rcbuilder` counting only `T` is wrong, and its
hardcoding `equipmentInputsVat` to zeros (*"תשומות ציוד - 0 קבוע"*) is that program's limitation, not
the format's. `accounter` was right on both.

The sales side is settled the same way: `Number of sales records - both taxable and zero-rated/
exempt` (lines 114-115), with `S L M Y I` marked "Sales" (lines 181-185), so `M`, `Y` and `I` count —
which no source had exercised.

**What changed in the validator:** both count cross-checks were warnings carrying a disagreement.
They are now **errors**, because the document defines each field as the number of records of a kind
and a count that disagrees with the records it counts cannot be right. No *amount* was promoted with
them (§5.2).

### 6.5 (was §5.5) The closing letter, `X` or `Z` — **RESOLVED (official): `X`, and `Z` explained**

> `Entry Type   A(1)   "X" – fixed value` — `ita:…:158`
>
> `Entry Type   A(1)   "Z" – fixed value` — `ita:…:209`, Appendix B, Summary Entries

`X` closes an individual merchant's file. `Z` is real, but it is the summary entry of the
representative's alignment file, which also has an `A` initial entry and carries a count of users and
of entries rather than a dealer id. `linet3` was writing an Appendix B letter into an Appendix A
file. The validator's finding now says exactly that instead of "two sources say X".

### 6.6 (was §5.6) Line endings, trailing newline, empty file — **STILL OPEN**

Nothing in the circular or either manual states a record separator or a minimum transaction count.
See §5.3 and §5.5. Behaviour unchanged: accept all endings, warn on mixed, warn on a detail-free file.

### 6.7 (was §5.7) The `reportedVat` arithmetic — **STILL OPEN (official is silent)**

See §5.2. No rule implemented, and the reason is now stronger than "three sources disagree": the
Authority's own document defines the field without ever defining its computation.

### 6.8 (was §5.8) The sign of exactly zero — **RESOLVED (official): `+`**

> *"In a '+/-' field: When the amount field is zero, the value of the '+/-' field will be '+'."* — `ita:…:174`

`accounter` writes `+` for zero and was right; `rcbuilder` writes `-` for a zero `reportedVat` and is
wrong. **This is an error in the header**, with the quote in the finding text.

**Two corrections since, both from the refutation audit.**

*The claimed restatement is withdrawn.* This section used to add "restated by Appendix C §2's table
of signs, whose last column is `Zero value field   +` (`ita:…:523-535`)", and the finding quoted it
too. That reading is not available: four of the table's five columns are kinds of *transaction*, and
the document uses *"zero value"* to mean **zero-rated** elsewhere (lines 57, 169-170, 271, 551), so
the column plausibly says "a zero-rated transaction takes `+`" — a different rule. **Line 174 carries
this on its own**, and both the section and the finding now rest on 174 alone. See §3.7.

*In a transaction record the rule is split.* Line 174 says *"the amount field"*, singular. The header
has one amount per sign, so it is unambiguous there. A **transaction** record has one `+/-` field
(lines 145-146) and **two** amounts — the VAT sum (lines 142-144) and the invoice total excluding VAT
(lines 148-149) — and line 524 says the sign is that *"of the value of the input"*, i.e. of the
document rather than of a named amount. Nothing rendered says which amount governs. So:

- both amounts zero and the sign `-` → **error** (the readings agree);
- the invoice total zero, the VAT not, and the sign `-` → **warning**, carrying that open question.

The second case is a real document: a VAT-only correction or credit. It was an error before, and
`tests/fixtures/warnings-vat-only-credit.txt` is the regression test.

### 6.9 The one place the document contradicts **all three** implementations

Not in the old disagreement log at all, because the implementations agreed and agreement was mistaken
for evidence:

> `Reference group   A(4)   Series etc.   zeros are possible at this stage` — `ita:…:139`
>
> *"Reference Group Field – enables attribution of reference to branch etc., zero values or internal
> characters of the submitter (series/branch etc.)"* — `ita:…:580-581`

**`A(4)`, not `N(4)`.** `accounter`, `linet3` and `rcbuilder` all treat the reference group as
digits, and the old validator emitted an **error** on any non-digit there. A file that used a branch
code like `BR2A` — which the document expressly permits, and calls "internal characters of the
submitter" — would have been declared invalid by this product. That is the failure mode the whole
"three implementations agree is not the Authority" caveat existed to warn about, and it was real.

**And the first fix did not go far enough.** It replaced `N(4)` with `/^[A-Z0-9]+$/` — which still
rejected `br2a`, `A/01` and `אב01` as **errors**, `basis: official`, on lines that say nothing about
case, punctuation or script. The document types the field `A(4)` and stops. So the rule now accepts
`[A-Za-z0-9]` with no finding at all and reports anything else as a **warning** carrying the open
question in §5.7.

Five regression fixtures: `valid-refgroup-alpha.txt` (`BR2A`), `valid-refgroup-lowercase.txt`
(`br2a`), `valid-refgroup-zeropad.txt` (`00AB`), `warnings-refgroup-punctuation.txt` (`A/01`) and
`warnings-refgroup-hebrew.txt` (`אב01`, which also trips the file-encoding warning).

### 6.10 The open question from §4.1 — **RESOLVED (official)**

`SPEC-FROM-SOURCES.md` §4.1 asked whether the entry type is really one character, given that
`accounter` keeps `S1`/`S2`/`L1`/`L2` in its API. The document answers twice: the field is `A(1)`
(line 133) and the Table of Values lists eleven single letters (lines 176-192). A taxable sale and a
zero-rated one share the letter `S`; Appendix C tells them apart by the VAT sum being zeros
(lines 283, 326), which is exactly the hypothesis that file recorded as most plausible.

---

### 6.11 The refutation audit's findings — what changed on the second pass

`research/colony-sweep/audits/pcn874-reconciliation.md` graded all thirteen resolutions above as
**CONFIRMED** on their primary quote, and then took the *rules* apart. It found rules that reject a
legal file and gaps that accept an illegal one, and it built the files to prove both. Every finding
is implemented; this table is the ledger.

| what it found | severity now | why |
|---|---|---|
| **No counter-party rule at all for `T M C P I H`** — a `T` input or an `M` self-invoice sale with a zeros counter party came back with *zero findings*, while the same omission on `S` got a warning | `error` for `T M C P I`, `warning` for `H` | Appendix C names a party in every one of those cells (lines 400, 339, 419, 482, 381, 501) under *"All fields are compulsory"* (line 224), and — unlike `S` — no note offers aggregation as a way out. Note C states outright that a self-invoice sale carries the **supplier's** number (lines 556-557). `H` is a warning because its own comment marker is note F, which sends the counter file number to *"'Sha'am' guidelines"* (line 574) that nothing here has rendered. |
| **`detail.refGroup.alphanumeric` rejected `br2a`, `A/01`, `אב01`** as errors | `warning`, and `[A-Za-z0-9]` passes silently | §6.9 above; §5.7 for the open question. |
| **`file.encoding.ascii` was an error** citing lines that declare field *types*, not an encoding | `warning` | §5.7. Nothing stated is lost: an `N(n)`, `+/-` or fixed-value field still errors on a non-ASCII character under its own rule. |
| **`footer.licensedDealerId.matchesHeader` was an error** on lines that never state equality | `warning`, with an open question | Line 101 names the header's field the **customer's**, lines 159-161 the closing entry's the **submitter's**. Appendix A's *"Individual Merchant"* heading (line 91) implies identity without stating it, and the H-ERP manual describes three production types the circular does not (lines 990-1002). |
| **`detail.invoiceSumSign.signOfZero` fired on `invoiceSum == 0` whatever the VAT was** | `error` only when **both** amounts are zero; `warning` otherwise | §6.8 above. |
| **`detail.S.counterpartyExpected` stayed a warning at ₪100,000** | `error` above ₪5,000, `warning` at or below | Note A calls the customer's number *"obligatory"* above that figure (lines 537-539), and the aggregation it allows below it does not reach a sale of that size. The document's own caveat on its own figure (lines 586-588) is quoted into the finding. |
| **Note E's petty-cash cap had no rule, not even a warning** | new `warning`, `totals.pettyCashCap` | Lines 566-568. A warning because lines 569-570 say the restriction may change and *"the total VAT of the file's entries"* is undefined. |
| **`header.generationDate.calendar` was an error** on the document's own inconsistency | `warning` | §5.1. The `YYYYMMDD` reading comes from the three implementations; "two parts of the document pull in different directions" is this file's own definition of a warning. |

Eight citation corrections came with it, and are applied above: the H-ERP rounding passage is at
`herp:…:1185-1190` (not 1163-1168); the ₪20,000 sentence at `herp:…:1638` (not 1637, which is blank);
the Rivhit edition line at `rivhit:…:10` (not 9, which is blank); Appendix C §2 is not a restatement
of line 174 (§3.7, §6.8); the file name is not checked and is not fixed in practice (§2); the
"backed by the document" claim is narrowed and a second test added (§4.1); the vendor-only facts are
listed as vendor-only (§5.8); and the allocation-number field's own text now notes *characters*
versus `N(9)` (§6.2).

## 7. What was already true and stayed true

The 2009 document confirmed the earlier reading in full for: the header length of 131 and its
literal `O`; the transaction length of 60; the closing length of 10; the eleven entry letters; the
separate `+/-` sign character before the digits; whole-shekel rounded absolute amounts; the
`YYYYMM` report period; every one of the 34 field offsets; and every width but one. It also promoted a batch of
per-entry-type constraints from "only one implementation checks this" to the Authority's own words —
`L` and `K` carry a zeros counter-party id, `Y` carries zeros VAT, `R`'s reference number is zeros,
`K`'s reference number is an invoice count — of which the first three are now errors and the last two
warnings, for the reasons in §4 and §5.4. The refutation audit re-graded all thirteen resolutions and
confirmed every one of them on its primary quote (§6.11); what it overturned were rules, not readings.

### 7.1 Every rule, by severity, as it stands

**Errors** (the circular states the rule outright): `header.length`, `detail.length`, `footer.length`;
`header.recordType.literal`, `header.reportType.literal`, `footer.recordType.literal`;
`<record>.<field>.digits` on every `N(n)` field; `<record>.<field>.sign` on every `+/-` field;
`detail.recordType.known`; `header.reportMonth.calendar`;
`header.<field>Sign.signOfZero`; `detail.invoiceSumSign.signOfZero` **when both amounts are zero**;
`detail.L.vatIdZeros`, `detail.K.vatIdZeros`, `detail.Y.vatZeros`;
`detail.S.counterpartyExpected` **above ₪5,000**; `detail.{T,M,C,P,I}.counterpartyExpected`;
`totals.salesRecordCount`, `totals.inputsCount`; `file.empty`, `file.record.unknown`,
`file.header.{missing,duplicate,position}`, `file.footer.{missing,duplicate,position}`.

**Warnings** (the document is silent, ambiguous, or the source is a vendor or an implementation):
`header.<reserved field>.reserved`; `header.generationDate.calendar`;
`footer.licensedDealerId.matchesHeader`; `detail.refGroup.alphanumeric`;
`detail.invoiceSumSign.signOfZero` **when only the invoice total is zero**;
`detail.S.counterpartyExpected` **at or below ₪5,000**; `detail.H.counterpartyExpected`;
`detail.K.refNumberInvoiceCount`, `detail.R.refNumberZeros`; `totals.pettyCashCap`;
`file.encoding.ascii`, `file.lineEnding.mixed`, `file.detail.none`.

**No rule at all**, deliberately: the arithmetic behind `reportedVat` (§5.2, §6.7), any threshold on
the allocation number (§6.2), and the file's name (§2).

## 8. Correction to the colony sweep (unchanged, still true)

`research/colony-sweep/audits/israel-bureaucracy.md:133,470-472` and
`research/colony-sweep/CHIEF-AUDIT.md:65,212` record that a supervisor fabricated a
`validatePcn874()` symbol that did not exist in `@accounter-toolkit/pcn874-generator@0.4.1`. That
audit was correct for the package it audited and is stale on two counts: the maintained artefact is
`@accounter/pcn874-generator` in `Urigo/accounter-fullstack` at v0.6.7, and
`export function validatePcn874(content: string): boolean` does now exist at
`packages/pcn874-generator/src/index.ts:30-71` — three length checks, one allow-list, and its own
`// TODO: this is a very basic validation`. The audit's conclusion is why this product exists.
