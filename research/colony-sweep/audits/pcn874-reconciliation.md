# Refutation audit: `products/pcn874/` reconciled against the Tax Authority circular

**Audited:** branch `claude/monthly-income-plan-pfs7vu`, validator sources as at `6b231f2` (during the
audit the branch advanced to `1be6bcc`; the two commits on top touch `.github/`, `logs/`,
`skills/README.md` and `tests/spec-watch.test.ts` only — not `src/`, `docs/SPEC.md` or the fixtures).
**Method:** every claim graded against the rendered text by `file:line`, quoted verbatim; the validator
executed (`npm test`: 134 passed; `npm run build`; `node dist/cli.js validate <file>`) on files I built.
**Scope:** correctness of legal-format claims only. Style, naming, prose: out of scope.

Citation keys, as the code uses them: `ita:` = `research/rendered/pcn874-gov-il-874-eng.txt` (597
lines); `herp:` = `research/rendered/pcn874-h-erp-mirror.txt` (1,985 lines); `rivhit:` =
`research/rendered/pcn874-rivhit-mirror.txt` (3,232 lines). The Hebrew extractions have RTL
word-order damage; they are quoted as rendered.

## 1. Verdict

1. **Resolutions (SPEC.md §6.1–§6.10, §5.1, §5.4, §5.5 — 13 graded): 13 CONFIRMED on their primary
   quote, 0 MISREAD, 0 UNSUPPORTED, 0 CONTRADICTED.** Three carry a defective *secondary* citation:
   §6.8's Appendix C §2 "restatement" is ambiguous (the column reads "Zero value field", and the
   document uses "zero value" to mean zero-rated); §5.2/§6.7's H-ERP rounding passage is at
   `herp:1185-1190`, not `1163-1168`; §1.2/§6.2's ₪20,000 is at `herp:1638`, not `1637`.
2. **Error rules (29 rule names in `src/validate.ts`): 24 CONFIRMED, 1 MISREAD
   (`detail.refGroup.alphanumeric`), 1 split (`*.signOfZero`: CONFIRMED on the header, MISREAD on the
   transaction record), 3 UNSUPPORTED as errors (`footer.licensedDealerId.matchesHeader`,
   `file.encoding.ascii`, `header.generationDate.calendar`).** The test "every ERROR is backed by the
   Tax Authority document" passes with all three, because it checks that an official citation *exists*,
   not that the cited line states the rule.
3. **Misclassified files: yes, built on both sides.** Three files that break a stated Appendix C cell
   or note come back `VALID — 0 error(s), 0 warning(s)` (a `T` input with a zeros counter-party, an `M`
   self-invoice sale with a zeros counter-party, a petty-cash `K` over note E's cap); one comes back
   VALID with only a warning (an `S` sale of ₪100,000 with a zeros counter-party, which note A calls
   obligatory to identify). Four files are rejected as `error` with `basis: official` on rules the
   cited lines do not state (a closing-entry id that differs from the header's; lowercase, a slash,
   and Hebrew letters in the `A(4)` reference group). The reference-group letters `BR2A` and `00AB`
   are accepted, as claimed.

## 2. The resolutions, with quotes and grades

| § | Claim | Cited lines, quoted verbatim | Grade |
|---|---|---|---|
| 6.1 | last header field is N(11); header is 131 | `ita:126` — `Total VAT to pay / receive for period   N(11)`. Widths at `ita:100-126` sum 1+9+6+1+8+1+11+1+9+1+11+1+9+9+1+11+1+9+1+9+9+1+11 = 131. | **CONFIRMED** |
| 6.2 | last 9 transaction characters: zeros in 2009; allocation number today, per H-ERP | `ita:150-152` — `Space for   future   data   N(9)   Reference number to be allocated by "Sha'am" to the` / `supplier`. `ita:583-584` — `Future Field – intended for the subject of ascribing invoices as transactions. At this` / `stage, the value in this field will be zeros.` The "For Future Allocation" cell is `Zeros` on all thirteen rows (`ita:268,289,311,332,353,374,395,414,433,454,475,496,515`). `herp:507-508` — `החל מתאריך 1/1/26 בחשבונית בסכום של 10,000 ₪ ומעלה לפני מע"מ, חובה לרשום את מספר` / `ההקצאה שהתקבלה מרשות המיסים. יש לרשום את 9 התווים מימין.` | **CONFIRMED** — but the ₪20,000 line is `herp:1638`, not 1637 (see §5 of this report); and the manual says 9 *characters* (`התווים`), the validator requires 9 *digits* (the circular's N(9)) |
| 6.3 | `zeroOrExemptSalesAmount` is an amount | `ita:116` — `+/- symbol for total of zero value and exempt sales   +/-`; `ita:117` — `Total of zero value/exempt sales for period   N(11)` | **CONFIRMED** |
| 6.4 | all six input letters feed `inputsCount`; `equipmentInputsVat` is real; both counts are errors | `ita:124` — `Total number of records for inputs (other and equipment)   N(9)`; `ita:123` — `Total VAT on "equipment" inputs required during period   N(9)`; `ita:186-191` list `T K R P H C` under "Input"; `ita:114-115` — `Total number of records for "sales"*   N(9)   Number of sales records - both` / `taxable and zero-rated/ exempt`; `ita:181-185` list `S L M Y I` under "Sales". `herp:1038-1048` (2025) lists the same eleven letters and no others. | **CONFIRMED** (the asterisk on `"sales"*` at `ita:114` resolves to nothing in the rendered text) |
| 6.5 | closing letter is `X`; `Z` is Appendix B | `ita:158` — `Entry Type   A(1)   "X" – fixed value`; `ita:209` — `Entry Type   A(1)   "Z" – fixed value` under `Summary Entries` (`ita:207`), Appendix B (`ita:194-195`) | **CONFIRMED** |
| 6.6 | line endings, trailing newline, empty file: still open | `ita:39-42` — `The file will include a header (summary) entry, transaction entries and a closing entry as` / `detailed in Appendix 'A'. Due to the fact that the file is of a fixed structure, any instance` / `where the field is in reality "shorter" than that required by the technical specifications, it` / `is necessary to add preliminary zeros.` No separator, newline or encoding anywhere in 597 lines. `grep -n` for `CRLF`, `CR/LF`, `מפריד`, `קידוד`, `ASCII`, `ANSI`, `UTF`, `ללא תנועות`, `ללא רשומות` in both manuals: no hits. | **CONFIRMED (open)** |
| 6.7 / 5.2 | `reportedVat` arithmetic: no formula anywhere | `ita:125` — `+/- symbol for total VAT to pay / receive   +/-   + symbol to pay`; `ita:126` as above. Nothing else in Appendix A/B/C. The nearest thing in the manuals is a screen description, `herp:1114` — `סכום לתשלום: סכום המע " מ לתשלום בדוח הנוכחי (טרם סימון תנועות בחלון זה).` and `herp:1116` — `סכום לתשלום לאחר קיזוז: סכום המע " מ לתשלום לאחר קיזוז התשומות שסומנו בחלון זה.` — not a definition of the file field. | **CONFIRMED (open)** — the rounding passage the SPEC cites at `herp:1163-1168` is actually at `herp:1185-1190` (below) |
| 6.8 | sign of exactly zero is `+` | `ita:174` — `•   In a "+/-" field: When the amount field is zero, the value of the "+/-" field will be "+".` | **CONFIRMED** on line 174. The claimed restatement at `ita:523-535` is **ambiguous**: the table's row header is `Transaction` (`ita:525`) and its five columns are `Sale to the` / `customer`, `Cancellation/credit` / `to the customer`, `Purchase` / `from supplier`, `Cancellation/credit` / `from supplier`, `Zero value` / `field` (`ita:525-534`), signs `+   -   +   -   +` (`ita:535`). Four of the five columns are *kinds of transaction*, and the document uses "zero value" for zero-rated transactions throughout: `ita:57` `including "zero value" and exempt transactions`, `ita:169-170` `taxation or zero value transactions`, `ita:271` `Zero Value/Exempt "SL" –`, `ita:551` `A "mixed" transaction (exempt/zero value and regular)`. Read that way the column says "a zero-rated transaction takes +", which is a different rule. The finding text and SPEC §6.8 should rest on 174 alone. |
| 6.9 | reference group is `A(4)`; letters legal; all three implementations wrong | `ita:139` — `Reference group   A(4)   Series etc.   zeros are possible at this stage`; `ita:580-581` — `•   Reference Group Field – enables attribution of reference to branch etc., zero values` / `or internal characters of the submitter (series/branch etc.)`. Independently re-extracted from the PDF's content streams (stdlib `zlib`, no PDF library): `Reference group A\(4\Series etc.  zeros are possible at this stage` (the stream escapes parentheses; the closing one is swallowed by the extractor, as it is for every `N(n)` on the page). | **CONFIRMED** — the *resolution* is right. The *rule* built on it (`ALPHANUMERIC = /^[A-Z0-9]+$/`, `src/validate.ts:80`) is narrower than the document, which never defines the alphabet of `A(n)`: see error-rule table and files a2/a4/d. |
| 6.10 | entry type is one character | `ita:133` — `Entry Type (document type)   A(1)   See attached table of values`; eleven single letters at `ita:181-191` | **CONFIRMED** |
| 5.1 | the document contradicts itself on the generation-date format, not its width | `ita:102` — `Month for which detailed report is being submitted   N(6)   Yyyymm form`; `ita:105` — `File Generation Date   N(8)   Yyyymm form`. PDF content stream, re-extracted: `File Generation Date N\(8\ Yyyymm form`. The extraction is faithful. | **CONFIRMED** (as a fact about the document; the *error* severity built on it is graded below) |
| 5.4 | R's reference number: table says Zeros, note D says invoice number | `ita:467` — `Zeros` (R row, reference-number column, `ita:457-477`); `ita:477` — `D`; `ita:560-563` — `D.   Export Entry Sale – the opposite party identification field will include the` / `export entry number. …` / `… The reference number will include the invoice number.` | **CONFIRMED (open)** |
| 5.5 | a detail-free file is not settled | `ita:39-42` as above; no minimum stated; manuals silent (greps above) | **CONFIRMED (open)** |

## 3. The error rules, with quotes and grades

"CONFIRMED" here means: the cited line states the thing as a requirement, at the scope the validator
applies it. Rule names are those emitted by `src/validate.ts`.

| Rule (severity `error`) | Cited line(s), quoted | Grade |
|---|---|---|
| `header.length` 131 / `detail.length` 60 / `footer.length` 10 | `ita:40` `the file is of a fixed structure`; widths at `ita:100-126`, `133-152` (1+9+8+4+9+9+1+10+9 = 60), `158-161` (1+9). | **CONFIRMED** |
| `header.recordType.literal` "O" | `ita:100` — `Entry Type   A(1)   "O" – fixed value` | **CONFIRMED** |
| `header.reportType.literal` "1" | `ita:103-104` — `Report Type   N(1)   Field Value=1, Future changes` / `possible` | **CONFIRMED** for the rendered documents; "Future changes possible" is the document's own caveat, and neither manual shows another value (`grep -n 'סוג דוח\|סוג הדוח\|מתקן'`: no hits) |
| `*.digits` on every N(n) field (header, detail, footer) | Appendix A types each as `N(n)`; `ita:41-42` — `it` / `is necessary to add preliminary zeros`. Supporting, for R's counter-party: `herp:772` — `מע"מ תשומות ייבוא עמיל המכס תאריך הרשימון מספר הרשימון ( 9 ספרות)`; for the reference number: `herp:503` — `יש לרשום מספר חשבונית ספק ללא אותיות וסימנים.` | **CONFIRMED** |
| `*.sign` ("+" or "-") | `ita:106,108,110,112,116,118,120-122,125` type `+/-`; `ita:145` — `+/- symbol: credit/summary invoice   A(1)`; `ita:535` — `Sign   +   -   +   -   +` (no third value) | **CONFIRMED** |
| `*.signOfZero` | `ita:174` — `In a "+/-" field: When the amount field is zero, the value of the "+/-" field will be "+".` | **CONFIRMED for the header** (each sign has exactly one amount). **MISREAD for the transaction record**: 174 says `the amount field`, singular; the transaction has two amount fields (`ita:142-144` VAT, `ita:148-149` invoice total) and one sign, which `ita:524` says `represents the positive/negative sign of the value of the input` — the document, not one of its amounts. `src/layout.ts` ties the sign to `invoiceSum` alone (`signs: 'invoiceSum'`), so a document whose base is zero and whose VAT is not — a VAT-only correction or credit — with sign "-" is an error on a reading the document does not state. File a3 below. |
| `detail.refGroup.alphanumeric` (`/^[A-Z0-9]+$/`) | `ita:139`, `ita:580-581` quoted in §2 above. Neither line, and nothing else in the document, defines the character set of `A(n)`: not case, not punctuation, not script. | **MISREAD** — the rule rejects `br2a`, `A/01` and `אב01` as `error` with `basis: official`, and its own message says `letters ARE permitted here`. The document says "internal characters of the submitter". Files a2, a4, d. |
| `detail.recordType.known` | `ita:133`; `ita:176-177` — `Table of Values for the Entry Type Field . The values will be derived from` / `transaction type / details are in the account card.`; `ita:181-191`. Corroborated by `herp:1038-1048` (2025), the same eleven. | **CONFIRMED** |
| `header.reportMonth.calendar` | `ita:102` — `…N(6)   Yyyymm form` | **CONFIRMED** (a month of 13 is not `Yyyymm form`) |
| `header.generationDate.calendar` | `ita:105` — `File Generation Date   N(8)   Yyyymm form` | **UNSUPPORTED as an error.** The validator's own severity rule (`src/validate.ts:8-12`) puts "two parts of the document pull in different directions" under `warning`; the SPEC (§5.1) says the document "contradicts itself"; the `YYYYMMDD` reading comes from the three implementations. By the product's own standard this is a warning. Practical risk is low (every implementation writes YYYYMMDD), but the rule is an error on a non-official reading. |
| `footer.recordType.literal` "X" (incl. the "Z" branch) | `ita:158`; `ita:209` | **CONFIRMED** |
| `footer.licensedDealerId.digits` | `ita:159-161` — `Licensed Dealer Identification` / `Number of submitter` / `N(9)` | **CONFIRMED** |
| `footer.licensedDealerId.matchesHeader` | `ita:101` — `Customer's Licensed Dealer identification Number   N(9)`; `ita:159-161` as above; `ita:194-215` (Appendix B) | **UNSUPPORTED as an error.** No cited line says the two numbers are equal; the document names one "Customer's" and the other "of submitter". Appendix A is headed `Individual Merchant` (`ita:91`), which *implies* identity but does not state it. The manuals describe file kinds the circular does not: `herp:990-1002` — `סוג ההפקה : בסעיף זה ניתן לבחור בין שלוש האפשרויות הבאות:` … `קובץ לעוסק בודד` … `קובץ משותף למספר עוסקים – הדיווח כולל נתונים של מספר חברות. אפשרות זו רלוונטית` / `למייצגים. בחירה באפשרות זו תציג חלון שבו רושמים את מספר המייצג.` … `איחוד עוסקים – דיווח משותף לכמה עוסקים` — and neither says what the closing record of such a file carries. Rivhit's own union-file check, `rivhit:3051-3052` — `מספר   בקובץ   שונה   עוסק   מספר X מו   העוסק   מספר העסקים   בכל   זהה   להיות   חייב   רשה` / `עוסקים   שבאיחוד` — is vendor evidence that dealer numbers must agree *across the businesses merged*, not that closing must equal header. File a1. |
| `detail.L.vatIdZeros` | `ita:224-225` — `General Explanation: All fields are compulsory. Below are the possible values for each field in each situation.` / `"V" symbolizes a compulsory field in accordance with the column heading or the value stated in the` … ; L rows' counter-party cell `ita:297` — `Zeros`, `ita:318` — `Zeros`. Corroborated `rivhit:3163-3165` — `1 ( מזוהה   עסקה   כאשר ) ע   מספר   בעלת . מ / ת . ז ( מסוג   ברשומה   תדווח S מזוהה   לא   ורשומה` / `ברשומה   תדווח מסוג L .` (identified — VAT no. or ID no. — goes as S; unidentified as L). | **CONFIRMED** |
| `detail.K.vatIdZeros` | `ita:440` — `Zeros` (K row, `ita:436-456`) | **CONFIRMED** |
| `detail.Y.vatZeros` | `ita:368` — `Zeros` (Y row, VAT column); `ita:563-564` — `The sum of the` / `VAT will include zeros` | **CONFIRMED** |
| `totals.salesRecordCount` | `ita:114-115`; `ita:181-185` | **CONFIRMED** — the field is *defined* as a record count; a count that disagrees with the records is wrong by definition |
| `totals.inputsCount` | `ita:124`; `ita:186-191` | **CONFIRMED** (same reasoning) |
| `file.encoding.ascii` | `ita:96-161` (Appendix A's type column) | **UNSUPPORTED as an error.** The cited range declares field *types*, not an encoding; SPEC §2 itself says `the document declares no encoding`. For every N(n), `+/-` and literal field the type rules already reject a non-ASCII byte as an error on their own authority; the only field where this rule adds anything is the `A(4)` reference group, whose alphabet the document leaves open. File d. |
| `file.empty` | `ita:39-40` | **CONFIRMED** |
| `file.record.unknown` | `ita:100`, `ita:158`, `ita:176-192` | **CONFIRMED** |
| `file.header.missing` / `.duplicate` / `.position` | `ita:39-40` — `a header (summary) entry` (singular, first-named, summarising) | **CONFIRMED** ("exactly one, first" is inferred from the singular and from the word "header"; no line says "exactly one", but no other reading is available) |
| `file.footer.missing` / `.duplicate` / `.position` | `ita:39-40`; `ita:154-161` `Closing Entry:` | **CONFIRMED** (same inference) |

Warnings were not graded as errors, but two are relevant to §4: `detail.S.counterpartyExpected` and
the absence of any counter-party rule for `T M C P I H`.

## 4. The constructed files

All files: LF endings, no trailing newline, built by hand from Appendix A widths. Header/detail/footer
lengths verified 131/60/10 (`awk '{print length($0)}'`). Run with
`node dist/cli.js validate <file>` from `products/pcn874/` after `npm run build`. The header used
unless stated: `O514457282202601120260210+00000010000+000001800+00000000000+000000000000000001+00000000000+000000000+000000000000000000+00000001800`
(one sale of ₪10,000, VAT 1,800); footer `X514457282`.

### 4a. Files the circular does not forbid, which the validator rejects

| id | detail / footer line | predicted | actual | what it proves |
|---|---|---|---|---|
| **a1** | footer `X512345678` (header id `514457282`) | error | `INVALID — 1 error(s)`: `footer.licensedDealerId.matchesHeader` | Rejected on a rule no cited line states (`ita:101` "Customer's", `ita:159-161` "of submitter"). Whether a representative may put their own number in the closing entry is unsettled by every rendered text. |
| **a2** | `S51234567820260112br2a000000101000001800+0000010000123456789` | error | `INVALID — 1 error(s)`: `detail.refGroup.alphanumeric`, `found "br2a"`, `basis: official` | The document says `A(4)` and `internal characters of the submitter`; nothing restricts case. The finding's own text says letters are permitted. |
| **a3** | `S512345678202601180001000000102000000180-0000000000123456790` (base 0, VAT 180, sign "-") | error | `INVALID — 1 error(s)`: `detail.invoiceSumSign.signOfZero`, `the amount in invoiceSum is zero, so this sign must be "+"` | The validator applies `ita:174` to one of the record's two amount fields. A VAT-only credit document has a non-zero amount; which amount 174 means is not stated. |
| **a4** | `S51234567820260112A/01000000101000001800+0000010000123456789` | error | `INVALID — 1 error(s)`: `detail.refGroup.alphanumeric`, `found "A/01"` | A series written as `A/01` is "internal characters of the submitter" on the face of `ita:580-581`; whether punctuation is inside `A(4)` is not stated. Rejected as `error`, `basis: official`. |
| **d** | `S51234567820260112אב01000000101000001800+0000010000123456789` (UTF-8) | 2 errors | `INVALID — 2 error(s)`: `file.encoding.ascii` (`first at offset 150`), `detail.refGroup.alphanumeric` | Hebrew letters in a Hebrew filer's series code. The document declares no encoding and no alphabet. Whether the Authority accepts them is unknown; the validator asserts it knows, citing `ita:96-161`, which does not say so. (Also: in UTF-8 this line is 62 bytes and 60 characters; the validator measures characters.) |

### 4b. Files that break a stated requirement, which the validator accepts

| id | file | predicted | actual | what it proves |
|---|---|---|---|---|
| **b1** | header `O514457282202601120260210+00000000000+000000000+00000000000+000000000000000000+00000000000+000000900+000000000000000001-00000000900`; detail `T000000000202512300000000000301000000900+0000005000000000000` | accepted, no finding | `VALID — 0 error(s), 0 warning(s), 0 info` | Appendix C's T row gives the counter-party as `Supplier` (`ita:400`) under `All fields are compulsory` (`ita:224`). A `T` input with counter-party `000000000` gets **no finding at all**, while the same omission on `S` gets a warning. The circular treats the two rows alike. |
| **b4** | detail `M000000000202601120001000000101000001800+0000010000000000000` | accepted, no finding | `VALID — 0 error(s), 0 warning(s), 0 info` | M row: `Supplier` (`ita:339`); note C `ita:556-557` — `Self Invoice Sales – the supplier number will be entered in the place of the` / `counter party file number.` No rule exists. Same gap for `C` (`ita:419` `Supplier`), `P` (`ita:482` `Supplier`), `I` (`ita:381` `Customer`); for `H` (`ita:501` `Supplier`) note F `ita:574` — `Counter file number: in accordance with "Sha'am" guidelines.` — makes a warning the right ceiling. |
| **b2** | header `O514457282202601120260210+00000100000+000018000+00000000000+000000000000000001+00000000000+000000000+000000000000000000+00000018000`; detail `S000000000202601120001000000101000018000+0000100000000000000` (₪100,000 before VAT, counter-party zeros) | warning only | `VALID — 0 error(s), 1 warning(s)`: `detail.S.counterpartyExpected` | Note A, `ita:537-539` — `Regular local sale to commercial customer – In a sale where the pre-VAT` / `amount is higher than 5,000 NIS, it is obligatory to state the customer's` / `merchant number`. The figure is restated fourteen years later, `herp:911-913` — `על פי הנחיית רשות המיסים, בכל חשבונית בסכום של 5,000` / … / `ש ' ומעלה חייב להופיע מספר עוסק מורשה.` and `herp:300-301`. The validator's reason for a warning (small sales may be aggregated, `ita:540-542`) does not reach a ₪100,000 sale. Caveat the document itself gives: `ita:586-588` — `Parameter values may change from time to time. These changes will be published` / `in memos and will be valid for a specified period e.g 5000 shekels/2% etc.` |
| **b3** | header `O514457282202601120260210+00000010000+000001800+00000000000+000000000000000001+00000000000+000005000+000000000000000001-00000003200`; details: the standard S line and `K000000000202601310000000000003000005000+0000027778000000000` (petty-cash VAT ₪5,000 in a file whose VAT is ₪6,800) | accepted, no finding | `VALID — 0 error(s), 0 warning(s), 0 info` | Note E, `ita:566-568` — `Petty Cash Input – The entry may appear a number of times, even on the` / `same date, provided that the total VAT for these entries is less than 2% of` / `the total VAT of the file's entries or 2,000 NIS (the greater of them).` ₪5,000 exceeds both. No rule exists, not even a warning. Same caveat `ita:569-570` — `The` / `restrictions regarding the Petty Cash may change from time to time`. |

### 4c. Reference-group letters

| id | detail line | actual |
|---|---|---|
| c1 | `S51234567820260112BR2A000000101000001800+0000010000123456789` | `VALID — 0 error(s), 0 warning(s)` |
| c2 | `S5123456782026011200AB000000101000001800+0000010000123456789` | `VALID — 0 error(s), 0 warning(s)` |

Uppercase letters and zero-padded letters pass, as the reconciliation claimed. The fixture
`tests/fixtures/valid-refgroup-alpha.txt` is the same case as c1.

## 5. The allocation-number threshold (H-ERP ₪10,000 vs ₪20,000)

Quoted in full:

- `herp:126-127` — `מספר הקצאה: החל מתאריך 1/1/26 עבור חשבונית בסכום של 10,000 ש"ח ומעלה לפני מע"מ יש` / `לציין מספר הקצאה שהתקבל ע"י רשות המיסים.`
- `herp:303` — `עבור חשבוניות בסכום של 10,000 ₪ ומעלה חובה לקבל הקצאה מרשות המיסים החל מה 1/1/26 .`
- `herp:507-508` — quoted in §2 above.
- `herp:1636-1639` — `תנועות ללא מספר הקצאה` / (blank) / `אם נרשמו חשבוניות לקוח או חשבוניות ספק בסכום לפני מע"מ של 20,000 ש"ח ומעלה ללא מספר` / `הקצאה, יוצג החלון הבא:` — and `herp:1641` — `לא ניתן להזדכות על המע"מ ב חשבוניות אלו ללא מספר הקצאה.`

**Line 1637 is blank; the ₪20,000 sentence is line 1638.** `docs/SPEC.md:62`, `src/layout.ts:673`
cite 1637.

**Is it a contradiction?** Not on its face. Every ₪10,000 sentence is explicitly dated `החל מתאריך 1/1/26`
("from 1/1/26"). The ₪20,000 sentence is undated, describes a warning window in the release the manual
documents (`herp:1397` — `** סעיף זה פעיל רק ממהדורה 2025 SP2 ואילך **`, i.e. 2025), and says the
consequence is deductibility (`herp:1641`), not file rejection. The natural reading is a threshold in
force when the manual was written and a lower one announced for 1/1/26. **The rendered texts do not say
so**, and no ITA document in the repository states either figure or any schedule, so the SPEC should
say "two figures attached to two contexts, unexplained by the manual", not "internally inconsistent".

**Is the validator's behaviour safe?** Yes, for a format validator. It requires nine digits and accepts
zeros or a number (`src/layout.ts` `allocationNumber`, class `digits`; test §6.2 exercises both).
Nothing rendered says a zeros value makes the *file* malformed; H-ERP says it makes the VAT
non-deductible. Encoding a threshold would assert a legal figure from a vendor manual. One small
wrinkle is worth a doc note: the manual says `9 התווים` ("9 characters"), the circular says `N(9)`;
a non-digit allocation number would be rejected on the circular's authority, which is the right
authority.

## 6. The two things left open — verified

**`reportedVat` arithmetic.** `src/validate.ts` implements no rule touching `reportedVat` beyond
the generic `digits`, `sign` and `signOfZero` checks; `checkTotals` compares record counts only
(`totals.salesRecordCount`, `totals.inputsCount`) and its comment says so. Test
`§6.7 implements no reportedVat arithmetic check` covers it. Nothing in the three texts gives a
formula: `ita:125-126` define the field; `herp:1114,1116` describe a screen ("amount to pay after
offsetting the inputs marked in this window"); Rivhit's `לתשלום`/`להחזר` hits (`rivhit:1801-1802,
3072-3084`) concern which side of the ledger the VAT account is on and a union-of-dealers refund case.
**Confirmed open.** One correction: the rounding evidence the SPEC and layout cite as
`herp:1163-1168` is at `herp:1185-1190` — `סכום המע"מ ללא עיגול : בדוח מע"מ מקוון , PCN874 , לפי דרישת רשות ה מיסים התוכנה מעגלת` / `כל סכום בכל תנועת יומן, ומסכמת את הסכומים המעוגלים. כתוצאה מכך, סכומי המע"מ עלולים` / `להיות שונים. ההפרש עלול להיות כמה עשרות שקלים. רשות ה מיסים מודע ים לנושא , וכמובן` / `ההפרש לא צריך למנוע את שידור הקובץ.` Lines 1163-1167 are about creating the transmission
file (`יצירת קובץ לשידור . כעת ירשמו נתוני הדוח לקובץ עבור רשות המיסים.`).

**Line endings and detail-free files.** `file.lineEnding.mixed` is a warning with `basis: oss-only`
(its only citations are `accounter:` and `rcbuilder:`); `file.detail.none` is a warning with an
`openQuestion`. The parser accepts LF, CRLF, CR and no trailing newline. Greps listed under §2 (6.6)
found nothing in either manual. Rivhit's error table mentions an opening and a closing record
(`rivhit:3060` — `פת   רשומת   נמצאה   לא מספר   בקובץ   יחה X`, `rivhit:3062` — `מספר   בקובץ   סגירה   רשומה   נמצאה   לא X`) but not a separator. **Confirmed open.**

## 7. Findings

### 7a. Requiring a code change — most severe first

1. **No counter-party rule for `T`, `M`, `C`, `P`, `I`, `H` (files b1, b4 — accepted with zero
   findings).** Appendix C cells: `ita:400` `Supplier` (T), `ita:339` `Supplier` (M), `ita:419`
   `Supplier` (C), `ita:482` `Supplier` (P), `ita:381` `Customer` (I), `ita:501` `Supplier` (H);
   `ita:224` `All fields are compulsory`; note C `ita:556-557`. Minimal fix: in `checkDetailSemantics`
   add `detail.<T|M|C|P|I>.counterpartyExpected` on a zeros counter-party, with the same shape as
   `detail.S.counterpartyExpected`. Severity is the owner's call, but it should be *at least* the
   warning `S` gets, and an `error` is as well-founded as `detail.L.vatIdZeros` is (same table, same
   "possible values" sentence, and — unlike `S` — no note offers aggregation as a way out). For `H`
   a warning is the ceiling, quoting note F `ita:574`.
2. **`detail.refGroup.alphanumeric` and `file.encoding.ascii` reject characters the document does
   not exclude, as `error` with `basis: official` (files a2, a4, d).** `ita:139` `A(4)`; `ita:580-581`
   `internal characters of the submitter`; no alphabet, case or encoding anywhere. Minimal fix:
   (i) `ALPHANUMERIC` → `/^[A-Za-z0-9]+$/` with no finding; any other character in `refGroup` →
   `warning` carrying an `openQuestion` ("the document does not define the character set of A(n)");
   (ii) `file.encoding.ascii` → `warning` with the same `openQuestion` — every N(n), `+/-` and literal
   field already errors on a non-ASCII byte under its own type rule, so nothing the document *does*
   state is lost.
3. **`footer.licensedDealerId.matchesHeader` is an `error` on lines that do not state equality
   (file a1).** `ita:101` "Customer's …", `ita:159-161` "… of submitter". Minimal fix: `severity:
   'warning'` plus an `openQuestion` quoting both names and `herp:990-1002` (three production types the
   circular does not describe). If the owner prefers to keep it an error, the finding must stop
   claiming `basis: official` for an inference — which the current `basisOf()` cannot express.
4. **`detail.invoiceSumSign.signOfZero` fires on `invoiceSum == 0` regardless of `totalVat` (file
   a3).** `ita:174` `the amount field` (singular); `ita:524` `the value of the input`. Minimal fix: in
   `checkSignOfZero`, for the detail record fire the `error` only when *both* `totalVat` and
   `invoiceSum` are zeros; when `invoiceSum` is zeros and `totalVat` is not, emit a `warning` with an
   `openQuestion` naming the two amount fields.
5. **`detail.S.counterpartyExpected` stays a warning above the document's own figure (file b2).**
   `ita:537-539` "obligatory" above 5,000 NIS; `herp:300-301`, `herp:911-913` (2025) repeat 5,000.
   Minimal fix: split the rule — `error` when the record's `invoiceSum` exceeds 5,000 and the
   counter-party is zeros (quoting `ita:537-539`, `herp:911-913`, and the caveat `ita:586-588` in the
   text), `warning` at or below. If the owner will not encode any figure, at least the message should
   say the figure and that the file is over it.
6. **Note E's petty-cash cap has no rule (file b3).** `ita:566-568`. Minimal fix: a `warning`
   (`totals.pettyCashCap`) when the sum of `totalVat` over `K` records exceeds
   `max(2000, 2% × Σ totalVat over all detail records)`, quoting `ita:566-570`; warning not error,
   because `ita:569-570` says the restriction may change and "the total VAT of the file's entries" is
   not defined (sales, inputs, or both). Also record, as vendor-only, `rivhit:318-319` —
   `מהמותר   גדול   קטנה   קופה   סכום המע   שסכום   חשבוניות   לפרט   חובה " מ   גבוה   בהן   מ -` / `300 ש " ח , קטנה   כקופה   לדווחן   ניתן   לא   ולכן .` (a ₪300 per-invoice VAT cap, 2011).
7. **`header.generationDate.calendar` is an `error` on the document's own inconsistency.** `ita:105`.
   Minimal fix: `severity: 'warning'`, keeping the message and `openQuestion` as they are. (Low
   practical risk; the change is for consistency with `src/validate.ts:8-12`.)

### 7b. Requiring only a doc change

1. `docs/SPEC.md:297` and `src/layout.ts:463`: H-ERP rounding passage is `1185-1190`, not `1163-1168`.
2. `docs/SPEC.md:62` and `src/layout.ts:673`: ₪20,000 is `herp:1638`, not `1637`; and reword
   "internally inconsistent" per §5 of this report (dated 1/1/26 figure vs undated current-release
   figure; not explained by the manual; no ITA source for either).
3. `docs/SPEC.md:58` and `src/sources.ts:86`: the Rivhit edition line is `rivhit:10`, not 9 (line 9 is
   blank; `rivhit:10` — `מהדורה 1.51 , לתאריך   מעודכן 7/7/2011`).
4. `docs/SPEC.md` §6.8 and the `signOfZero` `officialText`: drop "restated by Appendix C §2" or mark it
   ambiguous — the column is `Zero value` / `field` in a table of transaction kinds, and "zero value"
   means zero-rated elsewhere in the document (`ita:57,169-170,271,551`). Line 174 carries the rule.
5. `docs/SPEC.md:107` (`file name PCN874.TXT`, `ita:93`): the manuals show three other names —
   `rivhit:264` `PCN874_XXXXXXXXX_YYYYMM.txt`, `herp:1238` `pcn874.txt`, `herp:1525`
   `874_database - id_mmyy_ddmmhhmm.txt` — so the row should say the name is not checked and is not
   fixed in practice.
6. `docs/SPEC.md` §4 and `tests/validate.test.ts:456-462` ("every ERROR is backed by the Tax Authority
   document"): the test asserts that an `ita:` citation and an `officialText` exist, not that the
   cited line states the rule; three UNSUPPORTED error rules pass it. Either say so in §4, or make the
   claim narrower ("every error cites the document").
7. `docs/SPEC.md` §5: add what the manuals say that the circular does not, as vendor-only facts:
   `rivhit:318-319` (₪300 petty-cash VAT cap), `rivhit:3080-3081` — `קובץ   להפיק   יש   להחזר   דוח   עבור PCN874 במבנה לרכז   מבלי   התשומות   כלל   את   המפרט   אחר` / `המע   שסכום   תשומות " מ   קטן   בהן   מ - 300 ש " ח .` (a refund report must detail all inputs without aggregating those under ₪300 VAT), `rivhit:3163-3165` (identified = VAT no. *or ID no.* → `S`), `herp:1114,1116` (the amount-to-pay screen).
8. `src/layout.ts` `allocationNumber.officialText`: note that H-ERP says `9 התווים` (characters) while the
   validator enforces the circular's `N(9)`.

## 8. Not settled by the rendered texts — stated as such

- **The alphabet of `A(n)`**: case, punctuation, non-Latin script, and the file's byte encoding (and
  therefore whether a Hebrew series code, or a UTF-8 BOM, survives the Authority's reader). Nothing in
  597 + 1,985 + 3,232 lines says.
- **Whether the closing entry's "submitter" may differ from the header's "Customer"** — for a
  representative filing an individual file, or a union of dealers (`herp:999-1002`).
- **Which amount `ita:174` means in a transaction record** with one sign and two amounts.
- **The generation-date format** (`ita:105` says `Yyyymm form` for an `N(8)` field; the PDF stream
  says the same).
- **Whether any post-2009 ITA edition changed a width or a value.** No ITA document later than the
  circular is rendered; both manuals are user guides with no byte layout (verified: no line in either
  matches `^[OSLMYITKRPHCXZ][0-9]{9}` or contains a `+/-`-and-digits run).
- **The allocation-number schedule** (§5 above) and whether a zeros value ever makes a file
  *malformed* rather than the VAT non-deductible.
- **Note E's base** ("the total VAT of the file's entries"): sales VAT, input VAT, or both.
- **Whether a private customer's ID number may appear in an `L` record.** `ita:297,318` say Zeros;
  `rivhit:3163-3165` (2011) routes an ID-numbered sale to `S`; no ITA text after 2009.
- **Line endings, trailing newline, detail-free file, `reportedVat` arithmetic** — confirmed open (§6).
- **The asterisk in `"sales"*` at `ita:114`** — no footnote in the rendered text.

## 9. Reproduction

```
cd products/pcn874 && npm test            # 134 passed
npm run build && node dist/cli.js validate <file>
```
The constructed files are reproduced in full in §4; each is three or four lines and can be recreated
with `printf '%s\n%s\n%s' header detail footer > file`.
