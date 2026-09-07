# pcn874

A validator **and generator** for the Israeli VAT detailed report file — **PCN874**, `דוח מע"מ מפורט` — the fixed-width text file a VAT-registered business uploads to the Israel Tax Authority.

Revenue line: `pcn874` in the automaton's revenue colony. Rail: Gumroad. Owner one-time step: **step 3** of [`docs/OWNER_STEPS.he.md`](../../docs/OWNER_STEPS.he.md).

Nothing in this package is for sale yet and no price is set. The board's build order was **validator first**, and a validator that nobody can check is worth less than none. The generator was added on 2026-09-07, on top of it: it turns a documented CSV of documents into the file, and it **refuses to write a file the validator rejects** — see [`docs/GENERATOR.md`](docs/GENERATOR.md).

---

## What changed on 2026-09-07

Until this date the record layout here was rendered from **three open-source implementations** and the package said so on every page, because the Tax Authority's own document was egress-blocked from the container. It is not any more: `.github/workflows/render-watch.yml` fetched all three specification URLs from GitHub Actions, and the extracted text now lives in [`research/rendered/`](../../research/rendered/).

**So the primary source is now the Tax Authority's own circular to software houses** — Appendix A (record layout), Appendix B (the representatives' alignment file), Appendix C (permitted values per document type). Every rule cites a line of `research/rendered/pcn874-gov-il-874-eng.txt`. The three implementations are still cited, as corroboration.

The document **contradicted all three of them in one place**, and the old validator would have rejected a legal file because of it — see "the reference group" below. That is exactly the failure the "three implementations agree is not the Authority" caveat existed to warn about, and it was real.

---

## What is now backed by the Tax Authority's own document

[`docs/SPEC.md`](docs/SPEC.md) carries the field-by-field table; every row cites the document and the line.

| what | where the Authority says it |
|---|---|
| Header entry is `O` + 130 characters = **131** | Appendix A's declared widths, `ita:…:94-126`, summing to 131 |
| Transaction entry is **60** characters in nine fields | Appendix A, `ita:…:127-152` |
| Closing entry is `X` + a 9-digit dealer id = **10** | Appendix A, `ita:…:154-161` |
| The eleven one-letter entry types `C H I K L M P R S T Y`, and which are sales and which inputs | the Table of Values, `ita:…:176-192` |
| Every field's offset, width and type — `A(n)`, `N(n)` or `+/-` | Appendix A, cited individually in `src/layout.ts` |
| The sign is a separate 1-character field before the digits; short fields take **leading zeros** | `ita:…:40-42` and Appendix A's own "+/- symbol" rows |
| Amounts are whole shekels, rounded, always positive in the digits | `ita:…:144,148-149` |
| **A zero amount takes `+`, never `-`** — in the header. In a transaction record, which of its *two* amounts line 174 means is not stated, so the error needs both to be zero | `ita:…:174` (Appendix C §2 is **not** a restatement of it — see below) |
| **The reference group is `A(4)` — letters are legal**, in either case | `ita:…:139` and `ita:…:580-581` |
| Per-entry-type values: `L` and `K` carry a zeros counter-party id, `Y` carries zeros VAT, `R`'s reference number is zeros, `K`'s is an invoice count | Appendix C's table, `ita:…:220-517`, and its notes at `ita:…:536-574` |
| **`T`, `M`, `C`, `P` and `I` must name their counter party**, and `M` (a self-invoice *sale*) names its **supplier** | Appendix C's cells at `ita:…:400,339,419,482,381` under *"All fields are compulsory"* (`ita:…:224`), and note C at `ita:…:556-557` |
| **An identified sale above ₪5,000 before VAT must name its customer** | note A, `ita:…:537-539` |
| **Petty cash is capped** at 2% of the file's VAT or ₪2,000, whichever is greater | note E, `ita:…:566-568` |
| The record counts cover **all** sales letters and **all** input letters | `ita:…:114-115,124` with the Table of Values |

257 tests cover every rule the validator emits and every path through the generator, in `tests/`, over 26 generated fixed-width fixtures and 8 generated CSV inputs.

## The refutation audit, and what it changed

On 2026-09-07 a refuter graded this package line by line against the extracted circular and wrote up
the result in [`research/colony-sweep/audits/pcn874-reconciliation.md`](../../research/colony-sweep/audits/pcn874-reconciliation.md).
**All thirteen resolutions below held on their primary quote.** Several of the *rules* built on them
did not, and it built files to prove it in both directions — four legal files this validator rejected,
four illegal ones it accepted. Every finding is implemented; [`docs/SPEC.md` §6.11](docs/SPEC.md) is
the ledger and each file is now a fixture.

| rule | was | is | why |
|---|---|---|---|
| `detail.{T,M,C,P,I}.counterpartyExpected` | *did not exist* | **error** | Appendix C names a party in each of those cells under "All fields are compulsory", and no note offers aggregation as a way out. A `T` input with a zeros supplier used to come back with zero findings. |
| `detail.H.counterpartyExpected` | *did not exist* | **warning** | Same cell, but note F sends the counter file number to "Sha'am" guidelines nothing here has rendered. |
| `totals.pettyCashCap` | *did not exist* | **warning** | Note E's cap had no rule at all. A warning because the note says the restriction may change and never defines its base. |
| `detail.S.counterpartyExpected` | warning always | **error above ₪5,000**, warning at or below | Note A calls the customer's number "obligatory" above that figure. A ₪100,000 unidentified sale used to be a warning. |
| `detail.refGroup.alphanumeric` | error | **warning**, and `[A-Za-z0-9]` now passes silently | `A(4)` types the field and stops. The rule still rejected `br2a`, `A/01` and `אב01` as errors on lines that mention neither case, punctuation nor script. |
| `file.encoding.ascii` | error | **warning** | The cited lines declare field *types*, not an encoding. Nothing is lost: an `N(n)`, `+/-` or fixed-value field still errors on a non-ASCII character under its own rule. |
| `footer.licensedDealerId.matchesHeader` | error | **warning** | No line says the two are equal — one is the *customer's* number, the other the *submitter's*. |
| `detail.invoiceSumSign.signOfZero` | error whenever the invoice total was zero | **error only when both amounts are zero**, warning otherwise | Line 174 says "the amount field", singular; a transaction record has two. A VAT-only credit is a real document. |
| `header.generationDate.calendar` | error | **warning** | Line 105 types the field `N(8)` and calls it "Yyyymm form". `YYYYMMDD` is the implementations' reading, not the Authority's. |

The audit also found that the test *"every ERROR is backed by the Tax Authority document"* passed
with three of those rules **because it only checked that an `ita:` citation existed**. There is now a
second test that reads the cited lines out of the extracted circular and requires the finding's quote
and those lines to share four consecutive words — which immediately caught two more paraphrases
presented as quotes, in `detail.length` and `file.record.unknown`. See [`docs/SPEC.md` §4.1](docs/SPEC.md)
for exactly what each test does and does not prove.

## The seven disagreements, resolved

The old spec logged eight numbered places where the implementations disagreed. [`docs/SPEC.md` §6](docs/SPEC.md) settles each and keeps the log as history:

| # | question | verdict |
|---|---|---|
| 6.1 | last header field: 11 digits or 9? | **RESOLVED (official)** — `N(11)`, so the header is 131. `linet3` was wrong. |
| 6.2 | the last 9 characters of a transaction record | **RESOLVED** — zeros in the 2009 document; the allocation number in today's regime, on the H-ERP manual's authority, which the circular itself anticipates. Both accepted. |
| 6.3 | `zeroOrExemptSalesAmount`: amount or count? | **RESOLVED (official)** — an amount; it has its own `+/-` sign field, and counts have no sign. |
| 6.4 | which records feed `inputsCount`; is `equipmentInputsVat` real? | **RESOLVED (official)** — all six input letters count, and equipment inputs are a real field. `rcbuilder` was wrong on both. |
| 6.5 | closing letter `X` or `Z`? | **RESOLVED (official)** — `X`. `Z` is real but belongs to Appendix B's representative file. |
| 6.6 | line endings, trailing newline, empty file | **STILL OPEN** — the document never states a record separator or a minimum transaction count. Warnings only. |
| 6.7 | the `reportedVat` arithmetic | **STILL OPEN (official is silent)** — the document defines the field and never its computation. **No rule is implemented.** |
| 6.8 | the sign of exactly zero | **RESOLVED (official)** — `+`, on line 174 alone. An error in the header; in a transaction record, which of its two amounts line 174 means is unstated, so the error needs both zero and a VAT-only credit is a warning. |

Plus **§6.9**, which was never in the log because all three implementations agreed and agreement was mistaken for evidence: the **reference group is `A(4)`, not `N(4)`**. A branch code like `BR2A` — which the document expressly permits, calling it "internal characters of the submitter" — was rejected as invalid by the old validator. The first fix did not go far enough either: it still rejected `br2a`, `A/01` and `אב01`. Five fixtures now pin the whole range, from `valid-refgroup-alpha.txt` to `warnings-refgroup-hebrew.txt`.

## What is still NOT verified

- **No later edition of the layout has been rendered.** The circular is from **2009** — it carries no version number, and it is dated by its own content (*"The PCN874 file production must be completed by 01/01/2010"*). It announces two later changes without specifying either. The two Hebrew documents we rendered are **newer but are vendor user manuals**, and neither restates the byte layout, so neither can confirm a width. `.github/workflows/pcn874-spec-watch.yml` watches all three hashes so a new edition is noticed rather than assumed away.
- **The document contradicts itself on one field's format.** `File Generation Date   N(8)   Yyyymm form` — eight digits, described with a six-character format string. The width is not in doubt; the format comment cannot be right. We read it as `YYYYMMDD`, and because that reading is the implementations' and not the Authority's, an impossible date there is a **warning**. ([`docs/SPEC.md` §5.1](docs/SPEC.md))
- **The document never says which characters an `A(n)` field admits** — not case, not punctuation, not script, and not the file's byte encoding, so not whether a Hebrew series code survives the Authority's reader. Letters and digits pass; anything else is a warning. ([`docs/SPEC.md` §5.7](docs/SPEC.md))
- **Which of a transaction record's two amounts the sign belongs to is not stated.** One `+/-` field, a VAT sum and an invoice total. ([`docs/SPEC.md` §6.8](docs/SPEC.md))
- **Whether the closing entry's "submitter" may differ from the header's "customer"** — for a representative, or a union of dealers. A warning, not a rejection. ([`docs/SPEC.md` §6.11](docs/SPEC.md))
- **No `reportedVat` arithmetic check is implemented**, because no source states a formula — not Appendix A, B or C, not either Hebrew manual. The H-ERP manual points the same way for every amount: the Authority requires per-entry rounding before summing, so the header can differ from the books *"by a few tens of shekels"* without that stopping the filing. An amount cross-check that failed a file on that difference would be worse than no check.
- **An import entry's reference number is ambiguous in the document itself**: Appendix C's `R` row says zeros, and the comment marker on the same row points at a note that says the opposite. Kept a warning, with both readings in the finding text.
- **Line endings and a detail-free file remain unsettled.** They are warnings, and the line-ending warning is the only rule in the product whose authority is open-source code alone. It says so in its own text.
- **This validator does not tell you your file is acceptable to the Tax Authority.** It tells you the file matches the layout in the Authority's circular. A file can pass here and still be rejected — for the contents of its numbers, for a rule in a later memo, for anything the simulator checks and we do not. **The Authority publishes a free simulator; use it:** `http://www.misim.gov.il/EmDvhmfrt/wUploadFileHeshboniotSim.aspx`
- **The generator does not compute `reportedVat` and never will on this evidence.** It takes the figure from you and refuses to build a file without one, saying which lines define the field and that none of them defines its arithmetic.
- **The generator's readings, where the circular stops short, are named rather than assumed**: that a sale is zero-rated when its VAT is zeros, that a credit subtracts from the period's totals, that an export counts as a zero-value sale (a warning on every file that has one), and that a half shekel rounds away from zero (a warning on the row where it decided a digit). All four are in [`docs/GENERATOR.md`](docs/GENERATOR.md), with what the document does and does not say.

---

## Use

```bash
npm install
npm test          # 257 tests
npm run typecheck
npm run build
node dist/cli.js validate path/to/PCN874.txt
node dist/cli.js generate documents.csv --out PCN874.TXT --reported-vat 1800
```

```
pcn874 validate <file> [--json] [--quiet]
pcn874 generate <input.csv> --out <file> [--reported-vat <shekels>] [--json]
```

`validate` exits `0` when there is no error finding, `1` when there is, `2` on a usage or I/O problem. `generate` exits `0` when the file was written, `1` when it refused — either because the input was wrong or because its own validator rejected the file it built — and `2` on a usage or I/O problem. Warnings never change either exit code.

**`--reported-vat` is in shekels**, signed: `+` is VAT to pay, `-` VAT to receive. It is the one number the generator will not compute, because no rendered source states how it is computed ([`docs/SPEC.md` §5.2](docs/SPEC.md)); without it, `generate` refuses. The CSV's columns, the header block, and every total that IS computed are documented in [`docs/GENERATOR.md`](docs/GENERATOR.md).

### As a library

```ts
import { parsePcn874, validatePcn874 } from './src/index.js';

const { valid, findings, counts } = validatePcn874(fileText);

for (const f of findings) {
  console.log(f.severity, f.basis, f.rule, f.record, f.field, f.message);
  if (f.officialText) console.log('  Tax Authority:', f.officialText);
  console.log('  cited from:', f.sources.join(', '));
  if (f.openQuestion) console.log('  still open:', f.openQuestion);
}
```

`parsePcn874(text)` returns records with their fields sliced at the layout offsets and judges nothing; `validatePcn874(text | parsed)` returns `{ valid, findings, parsed, counts }`. `valid` is exactly "no finding of severity `error`".

```ts
import { generatePcn874 } from './src/index.js';

const result = generatePcn874(csvText, { reportedVat: '1800' });
// result.text is null whenever result.ok is false, and ok is false whenever the
// generator's own validatePcn874 run reported an error. There is no other way
// to get a file out of this package.
```

`result.problems` are about the **input** (a bad column, an amount that is not an amount, a missing `reportedVat`); `result.validation.findings` are about the **output**, from the validator itself.

Every finding carries a `basis`, derived from its own citations so it cannot drift away from them:

| `basis` | means |
|---|---|
| `official` | the Tax Authority's circular backs this rule |
| `vendor-manual` | the only source is a software house's guide, newer than the circular |
| `oss-only` | the only source is open-source code. Exactly one rule: the mixed-line-endings warning. |

### Severity, and why it is three-valued

| severity | means | example |
|---|---|---|
| `error` | the circular states it outright, in words that admit no second reading | the closing entry is `X`; an `L` record's counter-party id is zeros and a `T` record's is not; a header amount of zero takes `+`; an identified sale above ₪5,000 names its customer |
| `warning` | the document gives a field its meaning without forbidding the value; or two parts of the document pull against each other; or the document is simply silent; or the only source is a manual or an implementation | a `K` record whose invoice count is zero; a reference group with punctuation in it; a closing dealer id that differs from the header's; petty cash over note E's cap; mixed line endings |
| `info` | reserved; nothing emits it today | — |

Before 2026-09-07 the ladder was "how many repositories agree". It is now "how the Authority states it", which moved five rules: the sign of zero, the two record counts, and the `L` and `Y` constraints became errors; the reference-group check stopped rejecting letters. The refutation audit then moved nine more, in both directions — see the table above. The dividing line is **what the cited line says**, not how serious the mistake feels: a rule that rejects a file on an inference is a rule that can reject a legal file, and here that is as much a defect as accepting an illegal one.

### What changed for anyone consuming the API

The reconciliation renamed a few things. Rule ids are still meant to be depended on, so the changes are listed rather than left to be discovered:

| was | is | why |
|---|---|---|
| `Finding.disagreement` | `Finding.openQuestion` | it no longer means "the sources disagree" — it means nothing rendered settles it, and most findings no longer carry one |
| — | `Finding.basis` | `official` \| `vendor-manual` \| `oss-only`, derived from the finding's own citations |
| — | `Finding.officialText` | the Authority's own words for the rule |
| `detail.refGroup.digits` | `detail.refGroup.alphanumeric` | the field is `A(4)`; the old rule rejected legal files. Now a **warning**, and `[A-Za-z0-9]` passes silently |
| `detail.K.refNumberNonZero` | `detail.K.refNumberInvoiceCount` | named for what the document says the field holds |
| — | `header.<field>Sign.signOfZero`, `detail.invoiceSumSign.signOfZero` | new: a zero amount must take `+`. The detail rule is an error only when **both** of the record's amounts are zero |
| — | `detail.S.counterpartyExpected` | new: **error** above ₪5,000 before VAT, warning at or below |
| — | `detail.{T,M,C,P,I}.counterpartyExpected` | new errors from Appendix C's own cells |
| — | `detail.H.counterpartyExpected` | new warning; note F defers to "Sha'am" guidelines |
| — | `totals.pettyCashCap` | new warning from note E |
| `FOOTER_RECORD_TYPE_LINET3` | `REPRESENTATIVE_SUMMARY_RECORD_TYPE` | `Z` is Appendix B's summary entry, not one implementation's quirk |
| `docs/SPEC-FROM-SOURCES.md` | `docs/SPEC.md` | it is a specification now, not a reading of other people's code |

## Files

| path | what |
|---|---|
| `docs/SPEC.md` | the specification: the official document, its date, the field-by-field table with citations, what remains open, and the disagreement log as history |
| `src/sources.ts` | every source with its kind (`official`, `vendor-manual`, `implementation`), licence and provenance |
| `src/layout.ts` | the layout as data — every field with offset, width, class, the document's own words, and any open question |
| `src/parse.ts` | `parsePcn874` — forgiving; a malformed file must still parse |
| `src/validate.ts` | `validatePcn874` — the rules, each carrying its citations |
| `src/generate.ts` | `generatePcn874` — CSV in, file out, self-validated before it is handed back |
| `src/cli.ts` | `pcn874 validate` and `pcn874 generate` |
| `docs/GENERATOR.md` | the CSV's columns and header block, each with the `SPEC.md` field it fills and the circular's line; what is computed and how; the readings taken where the document stops |
| `scripts/make-fixtures.mjs` | regenerates `tests/fixtures/`. **Not the generator, and must not be used for a filing** — it exists so the validator's fixtures are demonstrably built from the layout table. |
| `scripts/make-csv-fixtures.mjs` | regenerates `tests/fixtures/csv/` — the generator's sample inputs, built from the same column list the code uses |
| `tests/fixtures/csv/*.csv` | eight sample inputs, including the two that must be refused (`no-reported-vat.csv`, `input-no-supplier.csv`). `minimal.csv` is built to reproduce `valid-minimal.txt` byte for byte, and a test asserts it |
| `tests/fixtures/*.txt` | twenty-six files, all generated from the layout table with invented digits. The prefix is the assertion: `valid-*` and `warnings-*` must validate, `invalid-*` must not, and a test compares the directory listing against the list the suite walks so a new fixture cannot slip past |

### On the fixtures and the licences

Two of the three implementations cannot be copied from: `adam2314/linet3` is AGPL-3.0, and `RcBuilder/Scripts` publishes **no licence at all**. The Tax Authority circular is a government publication we cite and quote briefly rather than redistribute beyond the extracted text kept for citation. Field offsets and widths are facts about a government file format rather than expression, so citing them is fine; copying code or sample files is not. Every fixture is built by `scripts/make-fixtures.mjs` from the table, with digits that were invented for the purpose.

---

## בעברית — מה זה, ומה זה לא

זהו **מאמת** (validator) **ומחולל** (generator) לקובץ הדיווח המפורט למע"מ, PCN874 — הקובץ בעל המבנה הקבוע שעוסק מעלה לרשות המסים. המאמת קורא קובץ קיים, מפרק אותו לרשומות ולשדות, ומחזיר רשימת ממצאים: איזו רשומה, איזה שדה, איזה כלל, ומאיזו שורה של איזה מסמך הכלל נלקח.

**המחולל (7.9.2026):** מקבל קובץ CSV ובו שורה אחת לכל מסמך — עסקאות ותשומות — ובונה ממנו את הקובץ. העמודות, ומה כל אחת ממלאת במבנה הרשומה, מתועדות ב-[`docs/GENERATOR.md`](docs/GENERATOR.md). שני דברים שהוא **לא** עושה: הוא **לא מחשב את הסכום המדווח** (`reportedVat`) — המסמך הרשמי מגדיר את השדה (שורה 126) ואינו אומר לעולם איך מחשבים אותו, ולכן הערך נלקח מהמשתמש, ובלעדיו המחולל מסרב לייצר קובץ ואומר בדיוק למה; והוא **לא כותב קובץ שהמאמת שלו פוסל** — הוא בונה את הקובץ, מריץ עליו את `validatePcn874`, ואם יש ולו שגיאה אחת הוא מדפיס אותה ולא כותב דבר. אזהרות מודפסות והקובץ נכתב. הסכומים ב-CSV הם בשקלים (מותר עם אגורות) ומעוגלים לשקל השלם, כלשון החוזר; **כיוון העיגול של חצי שקל בדיוק הוא בחירה של המוצר, לא כלל של החוזר**, והוא מדווח כאזהרה בשורה שבה הבחירה הכריעה ספרה.

**מה שהשתנה ב-7.9.2026:** עד היום המבנה כאן נגזר משלושה מימושי קוד פתוח בלבד, כי המסמך הרשמי של רשות המסים היה חסום מהמכולה. הוא כבר לא. **המקור הראשי הוא כעת החוזר של רשות המסים ליצרני תוכנות הנהלת חשבונות** — נספח א' (מבנה הרשומות), נספח ב' (קובץ איחוד למייצגים) ונספח ג' (הערכים המותרים בכל שדה). כל כלל מצטט שורה מתוך `research/rendered/pcn874-gov-il-874-eng.txt`. שלושת המימושים עדיין מצוטטים — כאישוש, לא כסמכות.

**מה שאומת מול המסמך הרשמי:** אורכי הרשומות (כותרת 131, תנועה 60, סיום 10), הסדר, הרוחב והסוג של כל שדה, אחת-עשרה אותיות סוגי התנועה, מוסכמת הסימן, ההשלמה באפסים מובילים, הכלל שסכום אפס נושא `+`, והערכים המותרים לכל סוג תנועה מנספח ג'. **שבע המחלוקות שנרשמו קודם הוכרעו**: חמש לפי המסמך, אחת לפי מדריך ספק חדש יותר, ואחת — החישוב של הסכום המדווח — **נשארה פתוחה, כי המסמך פשוט לא אומר איך מחשבים אותו**, ולכן לא נכתב עליו שום כלל.

**מקום אחד שבו המסמך סותר את כל שלושת המימושים:** שדה "קבוצת אסמכתא" הוא `A(4)` — כלומר **מותרות בו אותיות**, "תווים פנימיים של המדווח (סדרה/סניף)". שלושת המימושים כותבים ספרות בלבד, והמאמת הקודם היה פוסל קובץ חוקי בגלל זה. זו בדיוק התקלה שהאזהרה "שלושה מימושים מסכימים אינו 'רשות המסים אומרת'" נועדה למנוע, והיא הייתה אמיתית.

**ביקורת הפרכה (7.9.2026):** מבקר חיצוני בדק את החבילה שורה מול שורה מול המסמך הרשמי. **כל שלוש-עשרה ההכרעות עמדו במבחן**, אבל חלק מהכללים שנבנו עליהן לא: הוא בנה ארבעה קבצים חוקיים שהמאמת פסל וארבעה קבצים פסולים שהמאמת קיבל. כל הממצאים תוקנו. **מה שנוסף כשגיאה:** חובת זיהוי הצד הנגדי ברשומות `T M C P I` (נספח ג' נוקב בצד הנגדי בכל אחת מהן, תחת "כל השדות חובה"), וחובת מספר עוסק בעסקה מזוהה מעל ₪5,000 (הערה A). **מה שנוסף כאזהרה:** תקרת קופה קטנה של הערה E, וזיהוי הצד הנגדי ב-`H` (הערה F מפנה להנחיות שע"ם שלא רונדרו). **מה שהורד משגיאה לאזהרה** — כי שום שורה מצוטטת לא אומרת את הכלל: תו שאינו אות לטינית או ספרה בשדה `A(n)`, קידוד שאינו ASCII, מספר עוסק בשורת הסיום השונה מזה שבכותרת, תאריך הפקה שאינו תאריך אמיתי, וסימן "-" על סכום חשבונית אפס כשסכום המע"מ אינו אפס. **פסילת קובץ חוקי היא תקלה חמורה בדיוק כמו קבלת קובץ פסול.**

**מה שעדיין לא אומת:** החוזר הוא מ-**2009** ואין לו מספר גרסה; לא רונדרה מהדורה מאוחרת יותר של המבנה עצמו. שני המסמכים בעברית שרונדרו חדשים יותר אך הם מדריכי משתמש של ספקי תוכנה ואינם מכילים את מבנה הבתים.

הכלי הזה **אינו אומר לך שהקובץ יתקבל ברשות המסים.** הוא אומר שהקובץ תואם למבנה שבחוזר. רשות המסים מפרסמת סימולטור בחינם — יש להשתמש בו: `http://www.misim.gov.il/EmDvhmfrt/wUploadFileHeshboniotSim.aspx`
