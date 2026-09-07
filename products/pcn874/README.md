# pcn874

A validator for the Israeli VAT detailed report file — **PCN874**, `דוח מע"מ מפורט` — the fixed-width text file a VAT-registered business uploads to the Israel Tax Authority.

Revenue line: `pcn874` in the automaton's revenue colony. Rail: Gumroad. Owner one-time step: **step 3** of [`docs/OWNER_STEPS.he.md`](../../docs/OWNER_STEPS.he.md).

Nothing in this package is for sale yet and no price is set. The board's build order was **validator first**, and a validator that nobody can check is worth less than none.

---

## What is verified

Every rule this validator applies was rendered from source code we opened and read. [`docs/SPEC-FROM-SOURCES.md`](docs/SPEC-FROM-SOURCES.md) carries the field-by-field table, and every field cites the repository, path and line that supports it:

| what | verified how |
|---|---|
| Header record is `O` + 130 characters = **131** | `Urigo/accounter-fullstack` (MIT), `RcBuilder/Scripts` (C#), and a committed sample file that measures 131 |
| Detail record is **60** characters, in nine fields | the same three sources plus `adam2314/linet3` (AGPL-3.0), agreeing field for field and width for width |
| Trailer record is `X` + a 9-digit dealer id = **10** | two sources and two committed sample files |
| The eleven one-letter record types `C H I K L M P R S T Y` | `accounter`'s enum and allow-list, and `rcbuilder`'s enum, independently |
| Field offsets, widths and character classes for all 23 header fields, all 9 detail fields and both trailer fields | cited individually in `src/layout.ts`, which is the machine-readable twin of the research file; `tests/layout.test.ts` fails if the two drift |
| Sign convention: a separate 1-character `+`/`-` immediately before the digits, digits carrying the absolute value | all three sources |
| Amounts are whole shekels, rounded | `accounter` and `rcbuilder` |

83 tests cover every rule the validator emits, in `tests/`.

## What is NOT verified

**We could not open the official specification.** The Israel Tax Authority PDF, and both commercial mirrors of it named in the colony's research, are egress-blocked from the container this was built in — verified, the proxy returns `403` on the tunnel. So:

- This is **"three independent open-source implementations agree"**, not **"the Tax Authority says"**. That distinction is on every page of this product and it is not going to be quietly dropped.
- **The sources disagree in seven places** and none was resolved silently. They are listed in [`docs/SPEC-FROM-SOURCES.md` §5](docs/SPEC-FROM-SOURCES.md) — the width of the last header field (11 or 9 digits), the trailer letter (`X` or `Z`), what the last nine characters of a detail record hold (allocation number, or reserved zeros), which record types feed the input count, the line-ending and empty-file questions, the sign of exactly zero, and the reported-VAT arithmetic. Where a finding touches a disagreement, the finding text says so and names both readings.
- **No `reportedVat` arithmetic check is implemented at all**, because the three sources give three different formulas and one of them says it does not know. Guessing would mean asserting a VAT position on no evidence.
- **A taxable sale cannot be told from a zero-rated one by record type** in any file these sources write; the two-character codes `S1`/`S2`/`L1`/`L2` never reach the file. Whether that is right is an open question against the PDF.
- **This validator does not tell you your file is acceptable to the Tax Authority.** It tells you it is structurally consistent with three open-source implementations. A file can pass here and be rejected, or pass here and be wrong. The ITA publishes a free simulator; use it.
- There is **no generator**. Not an oversight: a wrong generated PCN874 is the filer's exposure, not ours, and nothing should generate one from a table nobody has checked against the source document.

`.github/workflows/pcn874-spec-watch.yml` runs in GitHub Actions, which has egress. It downloads the official spec from the URLs above, records the SHA-256 in `docs/SPEC-SOURCES.lock.json`, and fails when a hash changes — so a later session can diff the real document against the table instead of re-deriving it.

---

## Use

```bash
npm install
npm test          # 83 tests
npm run typecheck
npm run build
node dist/cli.js validate path/to/PCN874.txt
```

```
pcn874 validate <file> [--json] [--quiet]
```

Exit `0` when there is no error finding, `1` when there is, `2` on a usage or I/O problem. Warnings never change the exit code: a warning is a place the sources disagree or where only one source states the rule, and failing a build on a disagreement would be claiming more than we know.

### As a library

```ts
import { parsePcn874, validatePcn874 } from './src/index.js';

const { valid, findings, counts } = validatePcn874(fileText);

for (const f of findings) {
  console.log(f.severity, f.rule, f.record, f.field, f.message);
  console.log('  cited from:', f.sources.join(', '));
  if (f.disagreement) console.log('  sources disagree:', f.disagreement);
}
```

`parsePcn874(text)` returns records with their fields sliced at the layout offsets and judges nothing; `validatePcn874(text | parsed)` returns `{ valid, findings, parsed, counts }`. `valid` is exactly "no finding of severity `error`".

### Severity, and why it is three-valued

| severity | means | example |
|---|---|---|
| `error` | all three sources agree, and a file breaking it would be malformed | header is not 131 characters |
| `warning` | only one source states the rule, or the sources disagree about its scope | an `L` record carrying a customer VAT id; a declared input count that does not match the records |
| `info` | reserved; nothing emits it today | — |

## Files

| path | what |
|---|---|
| `docs/SPEC-FROM-SOURCES.md` | the research: sources, licences, the field-by-field table with citations, and the seven disagreements |
| `src/sources.ts` | the three source repositories and the official spec URLs, with provenance for each |
| `src/layout.ts` | the layout as data — every field with offset, width, class and citations |
| `src/parse.ts` | `parsePcn874` — forgiving; a malformed file must still parse |
| `src/validate.ts` | `validatePcn874` — the rules, each carrying its citations |
| `src/cli.ts` | `pcn874 validate` |
| `scripts/make-fixtures.mjs` | regenerates `tests/fixtures/`. **Not a PCN874 generator; must not be used for a filing.** |
| `tests/fixtures/*.txt` | eleven files, all generated from the layout table with invented digits |

### On the fixtures and the licences

Two of the three sources cannot be copied from: `adam2314/linet3` is AGPL-3.0, and `RcBuilder/Scripts` publishes **no licence at all**. Field offsets and widths are facts about a government file format rather than expression, so citing them is fine; copying code or sample files is not. Every fixture is therefore built by `scripts/make-fixtures.mjs` from the table, with digits that were invented for the purpose. Nothing was copied from any source repository.

---

## בעברית — מה זה, ומה זה לא

זהו **מאמת** (validator) לקובץ הדיווח המפורט למע"מ, PCN874 — הקובץ בעל המבנה הקבוע שעוסק מעלה לרשות המסים. הוא קורא קובץ קיים, מפרק אותו לרשומות ולשדות, ומחזיר רשימת ממצאים: איזו רשומה, איזה שדה, איזה כלל, ומאיזה מקור הכלל נלקח.

**מה שאומת:** אורכי הרשומות (כותרת 131 תווים, שורת תנועה 60, שורת סיום 10), הסדר והרוחב של כל שדה, אחת-עשרה אותיות סוגי הרשומה, ומוסכמת הסימן (`+`/`-` בתו נפרד לפני הספרות). כל זה נגזר משלוש מימושים עצמאיים בקוד פתוח — TypeScript, PHP ו-C# — שקראנו בפועל, וכל שדה בקובץ `docs/SPEC-FROM-SOURCES.md` מצטט את המאגר, הנתיב והשורה שמאחוריו.

**מה שלא אומת, ואומר זאת במפורש:** **לא הצלחנו לפתוח את המפרט הרשמי של רשות המסים.** גם האתר הרשמי וגם שני העותקים המסחריים שלו חסומים מהמכולה שבה נבנה הקוד. לכן כל מה שכתוב כאן הוא "שלושה מימושי קוד פתוח מסכימים ביניהם", ולא "רשות המסים אומרת". בשבעה מקומות המקורות **חלוקים** ביניהם, וכל מחלוקת נרשמה בפירוש במקום להכריע בשקט. אין כאן מחולל קבצים ואין כאן מחיר — קובץ שגוי הוא חשיפה של המגיש מול רשות המסים, ולא שלנו, ולכן לא ייווצר קובץ מטבלה שאיש עדיין לא הצליב מול המסמך המקורי.

הכלי הזה **אינו אומר לך שהקובץ יתקבל ברשות המסים.** הוא אומר שהקובץ עקבי מבנית מול שלושה מימושי קוד פתוח. רשות המסים מפרסמת סימולטור בחינם — יש להשתמש בו.
