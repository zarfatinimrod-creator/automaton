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
| `rivhit` | Rivhit, *מדריך להכנת דיווח מקוון למע"מ, קובץ PCN874* — `https://www.rivhit.co.il/uploaded_files/documents/pcn874_manual_U1231.pdf`, rendered to `research/rendered/pcn874-rivhit-mirror.txt`, 33 pages | **edition 1.51, updated 7/7/2011** (line 9) | Confirms the file-name convention and the union-of-dealers flow. Contains **no record layout**: it is a guide to Rivhit's own screens. |
| `herp` | Hashavshevet, *חשבשבת ERP — מע"מ מקוון PCN874* — `https://downloads.h-erp.co.il/files/vatr/Guidance874W.pdf`, rendered to `research/rendered/pcn874-h-erp-mirror.txt`, 50 pages — its own footers number them "of 48" | undated; current to **release 2025 SP2** (line 1397), describes duties starting **1/1/2026** | The **only rendered source that describes the allocation-number regime**: from 1/1/26 an invoice of ₪10,000 or more before VAT must carry an allocation number, of which *"the 9 rightmost characters"* are recorded (lines 126-127, 303, 507-508). Also gives the Authority's simulator URL (line 1263) and the rounding tolerance (§5.2). Contains **no record layout** either. |

The H-ERP manual is **internally inconsistent about the threshold** — ₪10,000 on lines 126, 303 and
507, ₪20,000 on line 1637. That is why no threshold is encoded in this product.

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
| file name | `PCN874.TXT` | `ita:…:93` |
| padding | **leading ("preliminary") zeros**; the sign is a separate 1-character field immediately before the digits | `ita:…:40-42`, and Appendix A's separate "+/- symbol" rows |
| amounts | whole shekels, rounded, absolute value in the digits | `ita:…:144,148-149` |
| sign of zero | **"+"** — *"In a '+/-' field: When the amount field is zero, the value of the '+/-' field will be '+'."* | `ita:…:174`, restated `ita:…:523-535` |
| dates | `YYYYMMDD` for invoice and generation dates, `YYYYMM` for the report period | `ita:…:102,105,138` (see §5.1 for the document's own inconsistency about the generation date) |
| character set | whatever `A(n)`, `N(n)` and `+/-` admit; the document declares no encoding | `ita:…:96-161` |
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
  identification is optional and small sales may be aggregated.
- **B** (line 543): `L` aggregates sales under ₪5,000; the **number** of aggregated sales goes in the
  reference field and the **last date** of the list in the date field.
- **C** (line 556): a self-invoice sale carries the **supplier** number in the counter-party field.
- **D** (line 560): an export sale carries the export entry number, or `999999999` for services and
  intangibles; VAT is zeros. Note D is marked on the `R` row as well — see §5.4.
- **E** (line 566): petty cash may repeat, capped at 2% of the file's VAT or ₪2,000, *"the greater of
  them"*; the reference number is the number of invoices.
- **F** (line 573): for `H`, an unknown reference number is entered as zeros.
- Mixed invoices are reported as taxable, or split into two entries with the same type, customer,
  date and reference number (lines 169-172, 551-555).
- A correction cancels the wrong invoice with the opposite sign and reports it again (lines 590-594).

### 3.7 Signs — Appendix 'C' §2

Official lines 523-535.

| transaction | sale to customer | credit to customer | purchase from supplier | credit from supplier | zero value field |
|---|---|---|---|---|---|
| sign | `+` | `-` | `+` | `-` | **`+`** |

---

## 4. What the validator does with all this

Severity is now set by how the document states a rule, not by how many repositories agree:

| severity | means | example |
|---|---|---|
| `error` | the circular states it outright, in words that admit no second reading | the closing entry is `X`; a zero amount takes `+`; an `L` record's counter-party id is zeros |
| `warning` | the document gives the field its meaning but does not forbid the value; or two parts of the document pull against each other; or the only source is a vendor manual or an implementation | a `K` record whose invoice count is zero; an `R` record carrying a reference number; mixed line endings |
| `info` | reserved; nothing emits it | — |

Every finding carries `basis`, derived from its own citations: `official`, `vendor-manual` or
`oss-only`. There is no rule in the validator today whose basis is `oss-only` except the line-ending
warning, which says so in its own text.

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
the H-ERP manual (lines 1163-1168): the Authority requires each journal entry to be rounded before
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

---

## 6. The seven disagreements, reconciled against the document

`SPEC-FROM-SOURCES.md` recorded eight numbered places where the implementations disagreed, seven of
which its README counted as disagreements proper. Each is settled below, in that file's numbering, so
the history stays checkable. Six were settled by the document; one by a vendor manual the document
itself anticipates; one is still open.

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

restated by Appendix C §2's table of signs, whose last column is `Zero value field   +`
(`ita:…:523-535`). `accounter` writes `+` for zero and was right; `rcbuilder` writes `-` for a zero
`reportedVat` and is wrong. **This is now an error**, with the quote in the finding text.

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

`tests/fixtures/valid-refgroup-alpha.txt` is the regression test.

### 6.10 The open question from §4.1 — **RESOLVED (official)**

`SPEC-FROM-SOURCES.md` §4.1 asked whether the entry type is really one character, given that
`accounter` keeps `S1`/`S2`/`L1`/`L2` in its API. The document answers twice: the field is `A(1)`
(line 133) and the Table of Values lists eleven single letters (lines 176-192). A taxable sale and a
zero-rated one share the letter `S`; Appendix C tells them apart by the VAT sum being zeros
(lines 283, 326), which is exactly the hypothesis that file recorded as most plausible.

---

## 7. What was already true and stayed true

The 2009 document confirmed the earlier reading in full for: the header length of 131 and its
literal `O`; the transaction length of 60; the closing length of 10; the eleven entry letters; the
separate `+/-` sign character before the digits; whole-shekel rounded absolute amounts; the
`YYYYMM` report period; every one of the 34 field offsets; and every width but one. It also promoted a batch of
per-entry-type constraints from "only one implementation checks this" to the Authority's own words —
`L` and `K` carry a zeros counter-party id, `Y` carries zeros VAT, `R`'s reference number is zeros,
`K`'s reference number is an invoice count — of which the first three are now errors and the last two
warnings, for the reasons in §4 and §5.4.

## 8. Correction to the colony sweep (unchanged, still true)

`research/colony-sweep/audits/israel-bureaucracy.md:133,470-472` and
`research/colony-sweep/CHIEF-AUDIT.md:65,212` record that a supervisor fabricated a
`validatePcn874()` symbol that did not exist in `@accounter-toolkit/pcn874-generator@0.4.1`. That
audit was correct for the package it audited and is stale on two counts: the maintained artefact is
`@accounter/pcn874-generator` in `Urigo/accounter-fullstack` at v0.6.7, and
`export function validatePcn874(content: string): boolean` does now exist at
`packages/pcn874-generator/src/index.ts:30-71` — three length checks, one allow-list, and its own
`// TODO: this is a very basic validation`. The audit's conclusion is why this product exists.
