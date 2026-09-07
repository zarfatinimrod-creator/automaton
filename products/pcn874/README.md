# pcn874

A validator for the Israeli VAT detailed report file — **PCN874**, `דוח מע"מ מפורט` — the fixed-width text file a VAT-registered business uploads to the Israel Tax Authority.

Revenue line: `pcn874` in the automaton's revenue colony. Rail: Gumroad. Owner one-time step: **step 3** of [`docs/OWNER_STEPS.he.md`](../../docs/OWNER_STEPS.he.md).

Nothing in this package is for sale yet and no price is set. The board's build order was **validator first**, and a validator that nobody can check is worth less than none.

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
| **A zero amount takes `+`, never `-`** | `ita:…:174`, restated by the sign table at `ita:…:523-535` |
| **The reference group is `A(4)` — letters are legal** | `ita:…:139` and `ita:…:580-581` |
| Per-entry-type values: `L` and `K` carry a zeros counter-party id, `Y` carries zeros VAT, `R`'s reference number is zeros, `K`'s is an invoice count | Appendix C's table, `ita:…:220-517`, and its notes at `ita:…:536-574` |
| The record counts cover **all** sales letters and **all** input letters | `ita:…:114-115,124` with the Table of Values |

134 tests cover every rule the validator emits, in `tests/`.

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
| 6.8 | the sign of exactly zero | **RESOLVED (official)** — `+`. Now an error. |

Plus **§6.9**, which was never in the log because all three implementations agreed and agreement was mistaken for evidence: the **reference group is `A(4)`, not `N(4)`**. A branch code like `BR2A` — which the document expressly permits, calling it "internal characters of the submitter" — was rejected as invalid by the old validator. `tests/fixtures/valid-refgroup-alpha.txt` is the regression test.

## What is still NOT verified

- **No later edition of the layout has been rendered.** The circular is from **2009** — it carries no version number, and it is dated by its own content (*"The PCN874 file production must be completed by 01/01/2010"*). It announces two later changes without specifying either. The two Hebrew documents we rendered are **newer but are vendor user manuals**, and neither restates the byte layout, so neither can confirm a width. `.github/workflows/pcn874-spec-watch.yml` watches all three hashes so a new edition is noticed rather than assumed away.
- **The document contradicts itself on one field's format.** `File Generation Date   N(8)   Yyyymm form` — eight digits, described with a six-character format string. The width is not in doubt; the format comment cannot be right. We read it as `YYYYMMDD` and the finding says so. ([`docs/SPEC.md` §5.1](docs/SPEC.md))
- **No `reportedVat` arithmetic check is implemented**, because no source states a formula — not Appendix A, B or C, not either Hebrew manual. The H-ERP manual points the same way for every amount: the Authority requires per-entry rounding before summing, so the header can differ from the books *"by a few tens of shekels"* without that stopping the filing. An amount cross-check that failed a file on that difference would be worse than no check.
- **An import entry's reference number is ambiguous in the document itself**: Appendix C's `R` row says zeros, and the comment marker on the same row points at a note that says the opposite. Kept a warning, with both readings in the finding text.
- **Line endings and a detail-free file remain unsettled.** They are warnings, and the line-ending warning is the only rule in the product whose authority is open-source code alone. It says so in its own text.
- **This validator does not tell you your file is acceptable to the Tax Authority.** It tells you the file matches the layout in the Authority's circular. A file can pass here and still be rejected — for the contents of its numbers, for a rule in a later memo, for anything the simulator checks and we do not. **The Authority publishes a free simulator; use it:** `http://www.misim.gov.il/EmDvhmfrt/wUploadFileHeshboniotSim.aspx`
- There is **no generator**. Not an oversight: a wrong generated PCN874 is the filer's exposure, not ours.

---

## Use

```bash
npm install
npm test          # 134 tests
npm run typecheck
npm run build
node dist/cli.js validate path/to/PCN874.txt
```

```
pcn874 validate <file> [--json] [--quiet]
```

Exit `0` when there is no error finding, `1` when there is, `2` on a usage or I/O problem. Warnings never change the exit code.

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

Every finding carries a `basis`, derived from its own citations so it cannot drift away from them:

| `basis` | means |
|---|---|
| `official` | the Tax Authority's circular backs this rule |
| `vendor-manual` | the only source is a software house's guide, newer than the circular |
| `oss-only` | the only source is open-source code. Exactly one rule: the mixed-line-endings warning. |

### Severity, and why it is three-valued

| severity | means | example |
|---|---|---|
| `error` | the circular states it outright, in words that admit no second reading | the closing entry is `X`; a zero amount takes `+`; an `L` record's counter-party id is zeros |
| `warning` | the document gives a field its meaning without forbidding the value; or two parts of the document pull against each other; or the only source is a manual or an implementation | a `K` record whose invoice count is zero; an `R` record carrying a reference number; mixed line endings |
| `info` | reserved; nothing emits it today | — |

Before 2026-09-07 the ladder was "how many repositories agree". It is now "how the Authority states it", which moved five rules: the sign of zero, the two record counts, and the `L` and `Y` constraints became errors; the reference-group check stopped rejecting letters.

### What changed for anyone consuming the API

The reconciliation renamed a few things. Rule ids are still meant to be depended on, so the changes are listed rather than left to be discovered:

| was | is | why |
|---|---|---|
| `Finding.disagreement` | `Finding.openQuestion` | it no longer means "the sources disagree" — it means nothing rendered settles it, and most findings no longer carry one |
| — | `Finding.basis` | `official` \| `vendor-manual` \| `oss-only`, derived from the finding's own citations |
| — | `Finding.officialText` | the Authority's own words for the rule |
| `detail.refGroup.digits` | `detail.refGroup.alphanumeric` | the field is `A(4)`; the old rule rejected legal files |
| `detail.K.refNumberNonZero` | `detail.K.refNumberInvoiceCount` | named for what the document says the field holds |
| — | `header.<field>Sign.signOfZero`, `detail.invoiceSumSign.signOfZero` | new: a zero amount must take `+` |
| — | `detail.S.counterpartyExpected` | new warning from Appendix C |
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
| `src/cli.ts` | `pcn874 validate` |
| `scripts/make-fixtures.mjs` | regenerates `tests/fixtures/`. **Not a PCN874 generator; must not be used for a filing.** |
| `tests/fixtures/*.txt` | sixteen files, all generated from the layout table with invented digits |

### On the fixtures and the licences

Two of the three implementations cannot be copied from: `adam2314/linet3` is AGPL-3.0, and `RcBuilder/Scripts` publishes **no licence at all**. The Tax Authority circular is a government publication we cite and quote briefly rather than redistribute beyond the extracted text kept for citation. Field offsets and widths are facts about a government file format rather than expression, so citing them is fine; copying code or sample files is not. Every fixture is built by `scripts/make-fixtures.mjs` from the table, with digits that were invented for the purpose.

---

## בעברית — מה זה, ומה זה לא

זהו **מאמת** (validator) לקובץ הדיווח המפורט למע"מ, PCN874 — הקובץ בעל המבנה הקבוע שעוסק מעלה לרשות המסים. הוא קורא קובץ קיים, מפרק אותו לרשומות ולשדות, ומחזיר רשימת ממצאים: איזו רשומה, איזה שדה, איזה כלל, ומאיזו שורה של איזה מסמך הכלל נלקח.

**מה שהשתנה ב-7.9.2026:** עד היום המבנה כאן נגזר משלושה מימושי קוד פתוח בלבד, כי המסמך הרשמי של רשות המסים היה חסום מהמכולה. הוא כבר לא. **המקור הראשי הוא כעת החוזר של רשות המסים ליצרני תוכנות הנהלת חשבונות** — נספח א' (מבנה הרשומות), נספח ב' (קובץ איחוד למייצגים) ונספח ג' (הערכים המותרים בכל שדה). כל כלל מצטט שורה מתוך `research/rendered/pcn874-gov-il-874-eng.txt`. שלושת המימושים עדיין מצוטטים — כאישוש, לא כסמכות.

**מה שאומת מול המסמך הרשמי:** אורכי הרשומות (כותרת 131, תנועה 60, סיום 10), הסדר, הרוחב והסוג של כל שדה, אחת-עשרה אותיות סוגי התנועה, מוסכמת הסימן, ההשלמה באפסים מובילים, הכלל שסכום אפס נושא `+`, והערכים המותרים לכל סוג תנועה מנספח ג'. **שבע המחלוקות שנרשמו קודם הוכרעו**: חמש לפי המסמך, אחת לפי מדריך ספק חדש יותר, ואחת — החישוב של הסכום המדווח — **נשארה פתוחה, כי המסמך פשוט לא אומר איך מחשבים אותו**, ולכן לא נכתב עליו שום כלל.

**מקום אחד שבו המסמך סותר את כל שלושת המימושים:** שדה "קבוצת אסמכתא" הוא `A(4)` — כלומר **מותרות בו אותיות**, "תווים פנימיים של המדווח (סדרה/סניף)". שלושת המימושים כותבים ספרות בלבד, והמאמת הקודם היה פוסל קובץ חוקי בגלל זה. זו בדיוק התקלה שהאזהרה "שלושה מימושים מסכימים אינו 'רשות המסים אומרת'" נועדה למנוע, והיא הייתה אמיתית.

**מה שעדיין לא אומת:** החוזר הוא מ-**2009** ואין לו מספר גרסה; לא רונדרה מהדורה מאוחרת יותר של המבנה עצמו. שני המסמכים בעברית שרונדרו חדשים יותר אך הם מדריכי משתמש של ספקי תוכנה ואינם מכילים את מבנה הבתים.

הכלי הזה **אינו אומר לך שהקובץ יתקבל ברשות המסים.** הוא אומר שהקובץ תואם למבנה שבחוזר. רשות המסים מפרסמת סימולטור בחינם — יש להשתמש בו: `http://www.misim.gov.il/EmDvhmfrt/wUploadFileHeshboniotSim.aspx`
