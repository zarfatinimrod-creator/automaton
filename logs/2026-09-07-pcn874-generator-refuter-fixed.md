# 2026-09-07 — תיקון המחולל של pcn874 לפי ביקורת ההפרכה

## 1. מה המשתמש ביקש

לתקן את המחולל ב-`products/pcn874/` לפי ביקורת ההפרכה
`research/colony-sweep/audits/pcn874-generator.md`, שנכתבה על ידי מבקר Fable בערב שבו המחולל נבנה.
במפורש:

1. **לממש את כל עשרת ממצאי הקוד** ב-§6 של הביקורת, לפי סדר החומרה שלה ובתיקון המינימלי שהיא נוקבת בו
   — אלא אם הקוד או החוזר סותרים את המבקר, ואז לצטט בלוג ולהסביר.
2. **להפוך את 26 קבצי ה-CSV הבנויים של §4 לפיקסצ'רים ולבדיקות**, שנוצרים על ידי סקריפט הפיקסצ'רים ולא
   מוקלדים ביד, כשכל מקרה נבדק: נדחה בכלל ששמו נקוב, מוזהר בכלל ששמו נקוב, או נכתב נכון. לשמור את 257
   הבדיקות הקיימות ירוקות ואת סוללת הדחייה.
3. **ליישם את ממצאי התיעוד**: ציטוט תעודת הזיכוי, משפטי "הדרך היחידה", הערת רוחב-הבתים, הפניית השורה
   ב-`productChoice`, ניסוח הדחייה של `# Note:`/`# TODO:`, ומשפט אחד ב-`docs/GENERATOR.md` שאומר
   שערכי `reportedVat` בפיקסצ'רים אינם מגלמים שום כלל.
4. לעדכן את `products/pcn874/README.md` ואת שורת pcn874 ב-`products/README.md` רק במקום שבו טענה
   השתנתה; לנקוב במספרי בדיקות רק אחרי מדידה.
5. לאמת: `npm run typecheck`, `npm test`, `npm run build`, הרצת ה-CLI הבנוי על כל פיקסצ'ר CSV עם הדבקת
   קודי היציאה, ו-`pnpm typecheck` משורש המאגר.
6. לכתוב את הלוג הזה ולבצע commit על ענף ה-worktree. לא לדחוף. לא לגעת ב-`logs/CHECKPOINT.md`,
   ב-`docs/OWNER_STEPS.he.md`, ב-`MISSION.md`, ב-`.github/` וב-`skills/revenue-pcn874/SKILL.md` מעבר
   למשפט שהפך לשקרי.

## 2. הפעולות המרכזיות שביצעתי

**קודם כל — איפוס בסיס ה-worktree.** `git log --oneline -1` החזיר `90816df` (המיזוג הישן, בלי
`products/` ובלי `research/`), בדיוק כפי שהתדריך הזהיר. `git fetch` ואחריו
`git reset --hard claude/monthly-income-plan-pfs7vu` הביאו את ה-worktree ל-`dcc1673`, ורק אז נגעתי
בקובץ.

**קריאת הביקורת במלואה** (136 שורות) ואחריה `src/generate.ts`, `src/cli.ts`, `src/validate.ts`,
`src/parse.ts`, `tests/generate.test.ts`, `tests/cli.test.ts`, `tests/validate.test.ts`,
`scripts/make-csv-fixtures.mjs` ו-`docs/GENERATOR.md`. בסיס מדוד לפני שינוי: **257 בדיקות עוברות**.

**עשרת ממצאי הקוד, לפי סדר הביקורת:**

1. **`csv.row.cellCount`** — בדיקה בראש הלולאה של `parseRows`: שורה שמספר התאים שלה שונה ממספר
   העמודות בשורת הכותרת נדחית כשגיאה, לפני שנקרא תא אחד. זה סוגר את שני הקבצים שנכתבו שקטים ושגויים
   (c2 ו-l).
2. **פרשנות פסיק** — `parseAmount` כבר לא מוחק כל פסיק. הביטוי החדש
   `^([+-]?)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?$` מקבל פסיק רק במקום שבו מפריד אלפים יכול לעמוד; כל
   פסיק אחר נדחה. בנוסף `^[+-]?\d{1,3}\.\d{3}$` (כמו `1.000`) נדחה כדו-משמעי במקום להיקרא כ-1.
   `amountHint()` מנסח את שתי הצורות הלועזיות בהודעה.
3. **`withoutRecords()`** — בדחייה שאחרי הבנייה, `validation` חוזר עם הממצאים והספירות אבל בלי
   `parsed.records`, כך שהקובץ שנדחה אינו ניתן לשחזור דרך הספרייה. ארבעת המשפטים שטענו "אין דרך אחרת"
   תוקנו לאמת (`src/cli.ts`, `docs/GENERATOR.md`, `README.md`, ה-docstring של סוללת הדחייה).
4. **קובץ ישן ב-`--out`** — ה-CLI קורא `existsSync(out)` *לפני* הכתיבה ומעביר את התוצאה ל-
   `formatGenerate`, ששורת ה-REFUSED שלה מוסיפה שהקובץ שנמצא שם ישן מהריצה הזו. שום דבר לא נמחק.
5. **`file.byteWidth`** — אזהרה חדשה במאמת (`checkFileShape`) על כל רשומה שרוחבה בבתים תחת UTF-8 שונה
   מאורכה בתווים, עם שני המספרים בהודעה. ראו §4 להסבר מדוע זו אזהרה ולא דחייה.
6. **`row.vatSum.empty`** — אזהרה על שורת מכירה שתא ה-`vatSum` שלה ריק, ששמה את כל הסכום בסך המכירות
   בשיעור אפס/פטורות. אפס מפורש נשאר שקט.
7. **`row.vat.roundedToZero`** — אזהרה כשמע"מ שאינו אפס מתעגל לאפס ומזיז את השורה לסך אחר, עם
   `productChoice` באותה צורה כמו אזהרת התיקו.
8. **שורה ריקה לגמרי נזרקת** — `parseCsv` זורק שורה שכל תאיה ריקים, לא רק שורה בת תא ריק אחד.
9. **`meta.malformed`** — שורת `#` שהמילה הראשונה בה היא שם דירקטיבה מוכר אך אין אחריה נקודתיים נדחית
   בשם, במקום להיזרק כהערה ואז להידחות בגלל "לא סופק".
10. **`--reported-vat ""`** — שגיאת שימוש (קוד יציאה 2), במקום לדרוס את שורת ה-CSV ואז להיקרא כחסר.

**פיקסצ'רים ובדיקות.** הוספתי ל-`scripts/make-csv-fixtures.mjs` את כל 26 המקרים של §4 ועוד אחד
(`n2`, המקרה ההפוך של פסיק עשרוני — `1.000` — שהתדריך נקב בו במפורש), כלומר **27 קבצי
`audit-*.csv`**, כולם נגזרים מ-`COLUMNS` ומשורת המכירה של `minimal.csv` ולא מוקלדים ביד. בצד הבדיקות
נוספה טבלת `AUDIT_CASES` שמצהירה לכל קובץ: נכתב או נדחה, אילו `problems` ואילו `findings` חייבים
להופיע, ומה אסור שיופיע; ואחריה בדיקות ערך פרטניות לשלושת הקבצים שנכתבו שקטים ושגויים, לשתי
ההסטות השקטות, ולקבצים שחייבים לצאת זהים לקובץ הזהב.

**תיעוד.** `docs/GENERATOR.md` — גבול הדחייה (המאמת אינו מצליב סכומים), רוחב השורה, פורמט הסכומים,
דחיית `# Note:`/`# Source:`/`# TODO:` והמוצא ממנה, `meta.malformed`, הערת רוחב-הבתים, ניסוח מחדש של
"קריאה 2" (סימן הרשומה מול שדות הסימן של הכותרת), הפניה ל-`ita:563-564` במקום ל-564 לבדה, העיגול
שמזיז סך, קובץ ישן ב-`--out`, והפסקה על 35 הפיקסצ'רים ועל ערכי `reportedVat` שאינם מגלמים כלל.

## 3. קבצים/מערכות ששונו

| קובץ | מה |
|---|---|
| `products/pcn874/src/generate.ts` | ממצאים 1, 2, 3, 6, 7, 8, 9; docstring המודול; docstring של `computeTotals` (קריאה 2); `productChoice` של `totals.exportInZeroOrExempt` |
| `products/pcn874/src/validate.ts` | ממצא 5 — הכלל `file.byteWidth` ב-`checkFileShape` |
| `products/pcn874/src/cli.ts` | ממצאים 4, 10; משפט הגבול ליד טענת הדחייה; ההערה על "אין דרך אחרת" |
| `products/pcn874/scripts/make-csv-fixtures.mjs` | 27 פיקסצ'רי `audit-*`; פסקת ה-`reportedVat` בראש הקובץ |
| `products/pcn874/tests/generate.test.ts` | `AUDIT_CASES` + בדיקות; בלוק "קובץ שנדחה אינו נגיש"; docstring סוללת הדחייה |
| `products/pcn874/tests/cli.test.ts` | קובץ ישן ב-`--out`, `--reported-vat ""`, `file.byteWidth`, שלוש הדחיות החדשות, משפט הגבול |
| `products/pcn874/tests/validate.test.ts` | שתי בדיקות ל-`file.byteWidth` |
| `products/pcn874/tests/fixtures/csv/audit-*.csv` | 27 קבצים חדשים (נוצרו על ידי הסקריפט) |
| `products/pcn874/docs/GENERATOR.md` | כל ממצאי התיעוד |
| `products/pcn874/README.md` | מספר הבדיקות, קטע הספרייה, פסקה אנגלית ופסקה עברית על ביקורת המחולל |
| `products/README.md` | שורת pcn874: מספרים + פסקה על ביקורת המחולל ועל גבול הדחייה |
| `skills/revenue-pcn874/SKILL.md` | משפט אחד שהפך לשקרי: "257 tests" → "311 tests" |

## 4. החלטות והנחות משמעותיות

**ממצא 5 — לא הפכתי תו שאינו ASCII ב-`refGroup` לדחייה.** התדריך ביקש "אזהרת `file.byteWidth` במאמת,
והמחולל דוחה תו שאינו ASCII ב-`refGroup`", אך גם הורה לבדוק מה המבקר אומר ב-§4 ולשמור על עקביות עם
ההערה בראש `src/validate.ts`. שלושתם מצביעים לאותו כיוון, ואני מצטט:

- המבקר, §6.5: *"a generator **warning** `file.byteWidth` … — a warning, not an error, because the
  encoding is genuinely unstated."*
- המבקר, §4 מקרה d: *"Not silent, but the warning under-describes the hazard"* — כלומר החסר הוא בניסוח
  האזהרה, לא בכך שאין דחייה.
- `src/validate.ts` בראשו: `error` שמור למקום שבו *"the official circular states the rule outright, in
  words that do not admit a second reading"*, ו-`A_N_ALPHABET_OPEN` באותו קובץ אומר במפורש
  *"rejecting a legal file is as much a defect as accepting an illegal one"*.
- החוזר עצמו: `ita:40-42` קורא לקובץ *"of a fixed structure"* ואינו נוקב בקידוד כלל, ו-`docs/SPEC.md`
  §5.7 רושם זאת כשאלה פתוחה (פריט 6 ב-§7 של הביקורת).

לכן מימשתי אזהרה, לא דחייה. דחייה הייתה פוסלת קובץ שאולי חוקי בגלל כלל שאיש לא כתב — בדיוק התקלה
שהביקורת הקודמת של המאמת מצאה חמש פעמים.

**מיקום `file.byteWidth` — במאמת.** המבקר הציע להוסיף אותה במחולל; התדריך אמר במאמת. בחרתי במאמת:
היא מכסה גם `pcn874 validate` על קובץ קיים, והמחולל מדפיס ממצאי מאמת ממילא, כך שהיא מופיעה בשני
המסלולים במקום באחד.

**`csv.row.cellCount` הוא קפדני.** המבקר הציע לשקול סובלנות לתא ריק עודף אחד (העמודה הריקה של Excel).
לא מימשתי סובלנות: התדריך ניסח את הכלל ללא סייג, וממצא 8 (זריקת שורה שכולה ריקה) מטפל בדיוק בתוצר
של Excel שהיה מצדיק אותה. פחות חורים, פחות ניחושים.

**`row.vat.roundedToZero` רק על שורות מכירה.** בשורת תשומה עיגול לאפס אינו מזיז דבר בין סכומי כותרת —
הוא רק מוסיף 0 לאותו סך. התדריך ניסח "כשזה משנה את הדלי של השורה", וזה קורה רק במכירות.

**זיהוי "מע"מ שאינו אפס"** נעשה על ידי `/[1-9]/` על התא הגולמי: `0.36` מזוהה, `0.00` ו-`0` שקטים.

**הערות הפיקסצ'רים נאלצו להשתנות.** הניסוח הראשון שכתבתי (`# b: quoted thousands separators…`) הפך
בעצמו לדירקטיבה — מילה אחת ואז נקודתיים — ו-24 מ-27 הקבצים נדחו עם `meta.unknown`. זו הוכחה חיה
לממצא התיעוד על `# Note:`. ניסחתי מחדש כ-`# case b — …`.

**`reportedVat` לא חושב בשום מקום.** כל 27 קבצי הביקורת נושאים את אותו 1800 שהומצא, גם כשהשורות שלהם
מסתכמות ב-1782 (e1) וב-3600 (i), ושתי בדיקות טוענות בדיוק את זה. זו ההדגמה הזולה ביותר לכך שהערך
נלקח ואינו נגזר.

## 5. שגיאות וניסיונות שנכשלו

- **ה-worktree התחיל על `90816df`.** בדיוק כפי ש-`CLAUDE.md` מזהיר. `git reset --hard` פתר.
- **הערות הפיקסצ'רים כדירקטיבות** — ראו §4. הריצה הראשונה של המדידה הראתה `e:meta.unknown` על כמעט כל
  קובץ; תוקן בכתיבה מחדש של 23 מחרוזות הערה.
- **שתי בדיקות נכשלו בהרצה הראשונה של הבלוק החדש.** (א) `audit-f` הוא קובץ שנדחה אבל הכלל ששמו נקוב
  (`row.vatSum.empty`) הוא אזהרה, כי הדחייה באה מהמאמת — הוספתי שדה `warnings` נפרד לטבלה. (ב) הנחתי
  ששורת c2 היא 10 תאים מול 8; היא 9 מול 8. תיקנתי את הטענה לפי המדידה ולא להפך.
- **ערכתי בטעות את `skills/revenue-pcn874/SKILL.md` בעותק המשותף** (`/home/user/automaton`) במקום
  ב-worktree, כי כתבתי `cd /home/user/automaton` בפקודה. החזרתי את הקובץ במאגר המשותף למצבו המקורי
  ואימתתי בגריפ על שני העצים, ואז החלתי את השינוי ב-worktree.
- **סקריפט בדיקה ארעי** (`probe.mts`) שנכתב לתוך תיקיית המוצר — נמחק לפני ה-commit; `git status` נקי
  ממנו.

## 6. בדיקות ופעולות ולידציה

בתוך `products/pcn874/`: `npm ci` (13 חבילות, 0 פגיעויות), `npm run typecheck` — נקי,
`npm run build` — נקי, `pnpm typecheck` משורש המאגר — נקי.

**שורת הסיכום הסופית של הבדיקות:**

```
 Test Files  6 passed (6)
      Tests  311 passed (311)
```

(בסיס לפני העבודה: 257. 54 בדיקות חדשות, אף אחת מהקיימות לא הוסרה או הוחלשה.)

**ה-CLI הבנוי על כל 35 פיקסצ'רי ה-CSV** (`node dist/cli.js generate <f> --out …`), קודי היציאה:

```
audit-a-bom-crlf.csv                   exit=0 written=yes
audit-b-quoted-thousands.csv           exit=0 written=yes
audit-c1-unquoted-thousands.csv        exit=1 written=no
audit-c2-extra-cells.csv               exit=1 written=no
audit-c3-unquoted-total.csv            exit=1 written=no
audit-d-refgroup-hebrew.csv            exit=0 written=yes
audit-e1-credit.csv                    exit=0 written=yes
audit-e2-sign-conflict.csv             exit=1 written=no
audit-e3-parentheses.csv               exit=1 written=no
audit-f-bare-sale.csv                  exit=1 written=no
audit-g-missing-column.csv             exit=1 written=no
audit-h1-directive-case.csv            exit=0 written=yes
audit-h2-directive-typo.csv            exit=1 written=no
audit-h3-directive-no-colon.csv        exit=1 written=no
audit-i-duplicate-row.csv              exit=0 written=yes
audit-j1-note-directive.csv            exit=1 written=no
audit-j2-comment-with-colon.csv        exit=0 written=yes
audit-j3-comment-url.csv               exit=0 written=yes
audit-k-empty-row.csv                  exit=0 written=yes
audit-l-short-row.csv                  exit=1 written=no
audit-m-semicolons.csv                 exit=1 written=no
audit-n-decimal-comma.csv              exit=1 written=no
audit-n2-european-thousands.csv        exit=1 written=no
audit-o-empty-vat.csv                  exit=0 written=yes
audit-p-extra-column.csv               exit=1 written=no
audit-q-vat-rounds-to-zero.csv         exit=0 written=yes
audit-s-negative-ties.csv              exit=0 written=yes
equipment.csv                          exit=0 written=yes
input-no-supplier.csv                  exit=1 written=no
minimal.csv                            exit=0 written=yes
mixed.csv                              exit=0 written=yes
no-reported-vat.csv                    exit=1 written=no
rounding.csv                           exit=0 written=yes
sign-of-zero.csv                       exit=0 written=yes
warnings.csv                           exit=0 written=yes
```

שלושת הקבצים שהביקורת הוציאה מהמחולל שקטים ושגויים — `audit-c2`, `audit-l`, `audit-n` — יוצאים היום
`exit=1` ובלי קובץ. כל 18 הקבצים שנכתבו הועברו ב-`node dist/cli.js validate <f> --quiet` וכולם החזירו
0.

**שתי בדיקות ידניות נוספות מול ה-CLI הבנוי:**

- ריצה שנכתבה ואחריה ריצה שנדחתה לאותו `--out`: השורה
  `An earlier file is still at …/minimal.txt. This run did not produce it and did not touch it` הודפסה,
  והקובץ הישן נשאר כפי שהיה.
- `--reported-vat ""` → `pcn874: the --reported-vat value is empty…`, קוד יציאה **2**.

**הרצה חוזרת של `node scripts/make-csv-fixtures.mjs`** לא שינתה אף קובץ במעקב — הפיקסצ'רים ניתנים
לגזירה מחדש ולא נערכו ביד.

**מה שלא נבדק:** אף קובץ לא הועלה לסימולטור של רשות המסים. אין כאן שום טענה על מה שהרשות תעשה עם
הקובץ.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **מדידת התנהגות של 27 פיקסצ'רים** נעשתה בסקריפט Node חד-פעמי שהדפיס `ok`, קודי בעיות וכללי ממצאים
  לכל קובץ. זה בדיוק מה שטבלת `AUDIT_CASES` עושה היום כבדיקה, אבל בדרך כתבתי אותו פעמיים (פעם כ-`.mts`
  שלא רץ בגלל הרחבת `.js` בייבוא, ופעם כ-`node --input-type=module` על `dist/`). **שווה סקריפט קבוע**
  `scripts/describe-csv-fixtures.mjs` שמדפיס את הטבלה מהקוד, כדי שהוספת פיקסצ'ר חדש לא תדרוש שוב
  סקריפט חד-פעמי.
- **בדיקת `officialText` מול השורות המצוטטות** קיימת בשני קבצי בדיקה בשתי העתקות כמעט זהות
  (`tests/validate.test.ts` ו-`tests/generate.test.ts`). כדאי להוציא ל-helper משותף.
- **סנכרון ספירת הבדיקות** מופיע בארבעה מקומות (`README.md` פעמיים, `products/README.md`,
  `skills/revenue-pcn874/SKILL.md`). זה מסוג הטענות שמתיישנות בשקט — שווה בדיקה שקוראת את המספר
  מהריצה ומשווה לתיעוד.
- **הרגל ה-worktree**: `git log --oneline -1` ואיפוס. זה כבר כתוב ב-`CLAUDE.md`, ועדיין נדרש ידנית
  בכל פעם; אפשר hook.

## 8. על מה בוזבזו אסימונים, לפי פעולה

| פעולה | בזבוז |
|---|---|
| קריאת הביקורת | 35KB. שתי קריאות ראשונות (`cat` ואז `sed`) נשמרו לקובץ בגלל הגודל ולא החזירו תוכן; רק הקריאה השלישית, ב-`Read`, החזירה. **~2 קריאות מבוזבזות** — היה נכון לפתוח קובץ 35KB ב-`Read` מלכתחילה. |
| הערות הפיקסצ'רים | סבב מלא של יצירה + מדידה + כתיבה מחדש של 23 מחרוזות, כי לא חשבתי על כך שההערה שלי עצמה עומדת בכלל הדירקטיבות שאני מתעד. **הבזבוז היחיד המשמעותי בעבודה** (~3 פקודות + מדידה חוזרת). |
| סקריפט המדידה | נכתב פעמיים: `probe.mts` נכשל על ייבוא `./src/generate.js` (TypeScript עם סיומות `.js`), ואז נכתב מחדש מול `dist/`. |
| עריכה בעץ הלא נכון | `sed` על `skills/revenue-pcn874/SKILL.md` בעותק המשותף במקום ב-worktree, ואחריה שחזור ואימות. **3 פקודות מבוזבזות** — הסיבה היא `cd /home/user/automaton` מיותר בתחילת הפקודה. |
| שתי בדיקות שנכשלו | הנחתי ערכים (severity, מספר תאים) במקום למדוד אותם קודם. זול לתקן, אבל זו בדיוק ההנחה ש-`verification-before-completion` נועדה למנוע. |
| פקודות שנחסמו | שתי פקודות נחסמו על ידי מנגנון בידוד ה-worktree (heredoc ל-`/tmp` ולולאה עם `cd`), ונכתבו מחדש בפשטות. |
