# 11.10.2026 – טיק 68: קיפול פסיקת תקרת עוסק פטור (FABLE_QUEUE שורה 27, קיפולים 1–11)

עבודה ב-worktree מבודד (`.claude/worktrees/wf_544f8edd-e13-1`, ענף `worktree-wf_544f8edd-e13-1`), על בסיס `f934254`
(`claude/new-session-j071dx`). הפסיקה: `research/channel-loop/RULING-2026-10-11-osek-patur-ceiling.md`. GitHub Actions
מושבת במאגר, ולכן `products-ci.yml` לא ירוץ: כל "עובר" כאן נשען על ריצה מקומית ונמדד בקוד היציאה שלה בלבד.

## 1. מה המשתמש ביקש

תהליך העבודה (ה-thread הראשי, כבונה) ביקש: בדיקת בסיס (`git log --oneline -1`, קובץ הפסיקה קיים, אחרת `git reset --hard`
לענף); קיפול פריטים 1–11 של "Folds for Opus" בפסיקה, בדיוק כפי שהיא מנסחת אותם, עם הטקסטים העבריים שלה מילה במילה;
לא פריט 12 (`research/measurements/osek-patur-documents.md`) ולא פריט 13 (קבצי הלולאה) – אלה של ה-thread הראשי. פריט 10:
לכתוב את תוכנית המוטציות ולהריץ אותה בתוך `scripts/sim-tree.sh`, כל מוטנט נהרג אחרי baseline עובר. פריט 11: מסמכי
הבעלים ו-PDF מחודש ב-`node scripts/owner-steps-pdf.mjs`. ולידציה לפי קודי יציאה: בדיקות המוצר, ה-build, `scripts/verify.sh`.
אישורים: 122,833 בשום קובץ שנשלח מהמוצר (רק `osek-patur-unverified.json`, שה-build לא מעתיק); "נבדק"/"מאומת"/"verified"
ליד שום סכום של 2026; הקבצים נקיים מסימן ה-at ומתבנית השם. קומיט עם trailers, והיומן הזה.

## 2. הפעולות המרכזיות שביצעתי

- **בדיקת בסיס.** ה-worktree עמד על `297a20b` (קומיט טיק של המושבה) וקובץ הפסיקה לא היה בו, ולכן
  `git reset --hard claude/new-session-j071dx` → `f934254`. קראתי את הפסיקה כולה (ההחלטות, "What this does not decide",
  ה-REOPEN והקיפולים).
- **סביבה.** ל-worktree אין `node_modules`: קישור סמלי לזה של ה-checkout הראשי בשורש (כמו ש-`sim-tree.sh` עושה), ו**העתקה**
  (`cp -a`, בלי `.vite`) של `products/il-biz-tools/node_modules` – המוצר צריך vitest 4.1.11 והשורש מחזיק 2.1.9, והעתקה
  שומרת את כתיבות המטמון של vitest בתוך ה-worktree.
- **baseline לפני עריכה:** `npx vitest run` במוצר – exit 0, 32 קבצים, 887 בדיקות.
- **קיפול 1:** `src/config/osek-patur.json` נכתב מחדש בצורת osek-zair: `verified: true`, `about`, `documents.gazette`
  (העתק מלא של זה שב-`osek-zair.json`), `sourceLine: ["gazette"]`, `check` (`on` 2026-09-29, `how` read, `record`
  `logs/2026-09-29-osek-zair-check.md`, `note`, והחיפוש של 7.9 כ-`earlier` שאומר "never a read"), `warnBand` 0.85,
  `years` 2024 ו-2025 ב-120000 עם ציטוט סעיף 35 (עמ' 173, התמלול של שורה 44 ברשומה – נבדק שווה תו בתו), `defaultYear`
  "2025", `pendingYears.2026` עם המשפט של החלטה 2(2) וציטוט 37(ב). אין `year`, אין `ceiling`, אין כתובת כל זכות.
- **קיפול 2:** `src/config/osek-patur-unverified.json` (חדש): `verified: false`, `about` בצורת האח, `years.2026` עם הסכום,
  ה-`grade` של הפסיקה, וה-`toVerify` של `osek-zair-unverified.json` מילה במילה (נבדק שווה). ב-`publish-gate.js`: כלל
  `'verified'` עם הערת האח, ומשפט בהערת `PAGE_RATE_SOURCES`.
- **קיפול 3:** `src/lib/osek-patur.js`: `offeredYears`, `ceilingFor` (מסרב `pending`, `unknown`, וגם `unverified` כמו
  `compareTracks`), `refusalHe`; `trackOsekPatur(months, { year, warnBand }, cfg)` מחשב רק לשנה ב-`years` ומחזיר
  `{ status: 'refused', year, reason }` אחרת; `OSEK_PATUR_CEILING` ו-`OSEK_PATUR_YEAR` הוסרו; המודול לא טוען את הקובץ הלא-מאומת.
- **קיפול 4:** `assets/page-osek-patur.js`: בורר שנה (ברירת מחדל `defaultYear`), ה-span של הכותרת עוקב אחרי הבורר, מפתח
  localStorage לכל שנה, מצב pending (מד ריק, סכומים ריקים, המשפט בתיבת התוצאה), בלי `staleYearHe` ובלי `#ceiling-stale`.
- **קיפולים 5–6:** `osek-patur.html` ו-`index.html` – הטקסטים של החלטות 2(4), 2(5), 2(6) מילה במילה (title, description,
  og:description, תשובת ה-FAQ ותאומת ה-JSON-LD שלה, הכותרת, ה-lead, שורת המקור עם קישור לעותק ב-capitax, הבורר "2026 –
  הכלי לא מחשב", שורת "נותר" ב-₪120,000, כרטיס הבית וה-lead של הבית).
- **קיפול 7:** `src/lib/source-line.js`: `documentsSourceLineHe` (הקיבוץ הועבר מ-`osek-zair.js`, ו-`trackSourceLineHe`
  קורא לו ושומר את הודעות השגיאה שלו); `sourceLineHe` מחזיר אותו לקונפיג שמצטט מסמכים. `SOURCES` לא השתנה – capitax אינו מקור.
- **קיפול 8:** `README.md` – שתי השורות, תא המקור של שורת בעל עסק זעיר 2026, פסקת שורת המקור, סעיף בפסקת "What it
  refuses", והסיכום העברי.
- **קיפול 9:** הבדיקות (פירוט בסעיף 3), ובהן בדיקה חדשה: שום צורה של הסכום ב-`osek-patur.html`, `index.html`, הסקריפט,
  המודול וב-`osek-patur.json`, ובנייה של עותק המוצר שמפרסמת את הדף כעצמו ולא מעתיקה את הקובץ הלא-מאומת; ועוד בנייה שבה
  סקריפט שנשלח טוען את הקובץ הלא-מאומת – וה-build נעצר.
- **קיפול 10:** `products/il-biz-tools/tests/mutations/osek-patur-2026.json` – 22 מוטציות (7 שהפסיקה מונה ועוד 15).
  `--check` לפני הקומיט (`--allow-dirty`) ואחריו: 22 מתוך 22. ריצה מלאה בתוך `sim-tree.sh`: **22 נהרגו, 0 שרדו**.
- **קיפול 11:** `docs/OWNER_STEPS.he.md` (שורות 167–168 ו-177) ו-`docs/INCOME_PLAN.he.md:115` לפי החלטה 4(2) מילה במילה;
  `:380` לא השתנה. `node scripts/owner-steps-pdf.mjs` יצר `docs/OWNER_STEPS.he.pdf` מחדש (598,588 בתים, 19 עמודים), וחילוץ
  טקסט (pymupdf) הראה את הנוסח החדש בו.
- קומיט `9efc7ce` (הקיפול), וקומיט נפרד ליומן הזה.

## 3. קבצים/מערכות ששונו

- `products/il-biz-tools/src/config/osek-patur.json` – הצורה החדשה (קיפול 1).
- `products/il-biz-tools/src/config/osek-patur-unverified.json` – חדש (קיפול 2).
- `products/il-biz-tools/src/lib/osek-patur.js` – שנים, סירוב, בלי תקרה יחידה (קיפול 3).
- `products/il-biz-tools/src/lib/source-line.js` – `documentsSourceLineHe` (קיפול 7).
- `products/il-biz-tools/src/lib/osek-zair.js` – `trackSourceLineHe` קורא לפונקציה המשותפת.
- `products/il-biz-tools/src/lib/publish-gate.js` – כלל `'verified'` לקובץ החדש והערה.
- `products/il-biz-tools/assets/page-osek-patur.js` – בורר שנה ומצב pending (קיפול 4).
- `products/il-biz-tools/osek-patur.html`, `products/il-biz-tools/index.html` – טקסטי הפסיקה (קיפולים 5–6).
- `products/il-biz-tools/README.md` – קיפול 8.
- `products/il-biz-tools/tests/osek-patur.test.js`, `osek-patur-page.test.js` – נכתבו מחדש למסלול ה-pending.
- `products/il-biz-tools/tests/statutory-sources.test.js` – שורת המסמכים, רשומת הקריאה, ה-FAQ, דף הבית, "נבדק".
- `products/il-biz-tools/tests/osek-zair-page.test.js` – הקשר בין שני הקבצים הלא-מאומתים, וה-lead החדש של דף הבית.
- `products/il-biz-tools/tests/osek-zair.test.js` – שורות ה-README של עוסק פטור.
- `products/il-biz-tools/tests/tool-leads.test.js` – ה-lead החדש.
- `products/il-biz-tools/tests/mutations/osek-patur-2026.json` – חדש (קיפול 10).
- `docs/OWNER_STEPS.he.md`, `docs/OWNER_STEPS.he.pdf`, `docs/INCOME_PLAN.he.md` – קיפול 11.
- `logs/2026-10-11-channel-loop-tick-68-osek-patur-fold.md` – היומן הזה.

לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, בשום RULING
או SITTING, ב-`research/measurements/` או ב-`state/colony/`.

## 4. החלטות והנחות משמעותיות

- **ההיסטוריה ב-`check.earlier` לא כותבת את הסכום.** הפסיקה מתירה אותו שם, אבל `osek-patur.json` נשלח עם הדף, והתהליך ביקש
  שהסכום לא יופיע בשום קובץ שנשלח. ההערה אומרת "a 2026 figure" ומפנה לקובץ הלא-מאומת.
- **`documents.gazette` הועתק שלם** (כולל `grade` ו-`recordPages`, "same capture, meta, pages"), ובדיקה דורשת שהוא שווה לזה
  של `osek-zair.json`.
- **`trackOsekPatur` כבר לא מקבל `ceiling`.** תקרה שהקורא מזין היא אפשרות (c) של הפסיקה, שלא הוכרעה; המודול מקבל `cfg` כפרמטר
  שלישי לבדיקות, והשנה חובה (בלי שנה – סירוב `unknown`, לא ברירת מחדל שקטה).
- **og:title** "מעקב תקרת עוסק פטור 2026" הפך ל"מעקב תקרת עוסק פטור". הפסיקה לא מונה את השורה הזו; השנה 2026 בראש הדף
  כשהדף לא מחשב אותה הייתה מטעה, והנוסח החדש הוא החלק הראשון של ה-title שהפסיקה נתנה.
- **תיבת התוצאה:** נוסף `<span id="status-sep">` כדי שהמקף ייעלם במצב pending; ה-`<strong>` של ה-lead איבד את
  `id="ceiling"` – ה-₪120,000 שם סטטי לשתי השנים והסקריפט לא כותב אותו.
- **"exactly once" של קיפול 9 מול החלטה 2(4).** 2(4) מחייבת שתשובת ה-FAQ ותאומת ה-JSON-LD יסתיימו במילות שורת המקור, ולכן
  "נבדק: 29.9.2026" מופיע בקוד הדף שלוש פעמים. הבדיקה דורשת שכל "נבדק: <ספרה>" בדף הוא זנב שורת המקור (שלושה מופעים: השורה,
  ה-FAQ וה-JSON-LD), ושב-`vat.html`, `allocation.html` ו-`index.html` אין אף אחד. ל-`osek-zair.html` יש שורה משלו מ-29.9.
- **`osek-zair-page.test.js:661`** (ה-lead של דף הבית) עודכן ל-lead של החלטה 2(6); קיפול 9 לא מונה אותו, אבל ה-lead נכתב
  מילה במילה והבדיקה הישנה נשענה על הנוסח הקודם.
- **README:** מעבר לשורות שהפסיקה מונה, המשפט הראשון בפסקת שורת המקור קיבל פסוקית על שורת המסמכים (אחרת הוא היה לא נכון
  לגבי הדף); שורת הטבלה בשורה 18 ("yes") נשארה.
- **מיקום התוכנית:** במקום שהפסיקה קובעת. `mutation-plans.test.ts` בודק רק את `src/__tests__/revenue/mutations/`, כך שהתוכנית
  הזו לא נבדקת שם; ה-thread הראשי יחליט אם להעביר או להרחיב.
- **הפקודה של המוטציות:** `mutate.mjs` מפצל את `--cmd` ברווחים ומריץ בלי shell, ולכן `cd products/il-biz-tools && npx vitest run`
  לא יכול לרוץ שם. במקומו: `--cmd "node products/il-biz-tools/node_modules/vitest/vitest.mjs run --root products/il-biz-tools"` –
  כל חבילת המוצר לכל מוטנט (לרשומות אין `test`, כך שלא מצטרף מסנן). `sim-tree.sh` מקשר רק את `node_modules` של השורש,
  ולכן סקריפט עטיפה (בתיקיית ה-scratch) קישר בתוך העץ את `products/il-biz-tools/node_modules` להעתק של ה-worktree והוסיף אותו
  ל-`.git/info/exclude` של העץ.
- **"מאומת"/"verified":** ליד 122,833 מופיעים רק "unverified" (נוסח שורת ה-README שהפסיקה נתנה) ו-`"verified": false` בשורה
  נפרדת של הקובץ הלא-מאומת; המילה השלמה `verified` לצד הסכום מופיעה רק ב-`about` של `osek-zair-unverified.json` (קיים, לא שלי).

## 5. שגיאות וניסיונות שנכשלו

- שלוש פקודות נחסמו על ידי שומר הבידוד של ה-worktree (git מורכב בשרשור, heredoc לתיקיית ה-scratch, `sim-tree.sh` עם
  `bash` בתוך שרשור). פוצלו לפקודות פשוטות, והסקריפטים נכתבו בכלי הכתיבה.
- ריצה ראשונה אחרי העריכות: 11 כשלים (הבדיקות הישנות, צפוי). אחר כך 4 משלי: הערה במודול ובהערת `osek-zair.js` החזיקה את
  הספרות 2026 (`osek-zair.test.js` ו-`osek-patur.test.js` אוסרות שנים בקוד המודול); מסנן ה-README תפס גם את שורת טבלת
  הכלים; ספירה של שורת המקור בקוד הגולמי, שבו השורה הגלויה מכילה קישור; `textOf` מחבר h2 ו-p בלי רווח. תוקנו.
- `node scripts/build-site.js` – exit 1 על שישה חוסמים קיימים (איש הקשר בהצהרת הנגישות, קישור הביטול) – לא מהקיפול.
  `--preview` – exit 0, והדף יצא כעצמו.
- `scripts/verify.sh` – exit 1: שני כשלים ב-`frozen-citations.test.ts`, שניהם על קובץ הפסיקה עצמו (שורות 364 ו-399 מזכירות את
  `robots-nevo`; ב-364 הסורק קורא את מספרי השורות שאחרי השם, שמפנים ל-ROBOTS-RULING, כציטוט לפי שורה). אותם שני כשלים ב-`f934254`
  בתוך `sim-tree.sh --ref f934254` (exit 1, 2 נכשלו / 20 עברו): אדום שירשתי מקומיט הפסיקה. קבצי RULING אינם שלי לערוך.
- אין `pdftotext` בקונטיינר; חילוץ טקסט ה-PDF נעשה ב-pymupdf.

## 6. בדיקות ופעולות ולידציה

כולן לפי קוד היציאה של הכלי עצמו:

| פקודה | exit | תוצאה |
|---|---|---|
| `npx vitest run` (המוצר, לפני עריכה, `f934254`) | 0 | 32 קבצים, 887 בדיקות |
| `npx vitest run` (המוצר, אחרי הקיפול) | 0 | 32 קבצים, 909 בדיקות |
| `node scripts/build-site.js` (המוצר) | 1 | 6 חוסמים קיימים בלבד (נגישות, קישור ביטול) |
| `node scripts/build-site.js --preview` | 0 | `osek-patur.html` יצא כעצמו; `osek-patur-unverified.json` לא הועתק |
| `node scripts/check-html.js` | 0 | all pages ok |
| בנייה של עותק המוצר (בבדיקה, עם איש קשר לבדיקה) | 0 | הדף כעצמו, בלי הקובץ הלא-מאומת, שום צורה של הסכום בקבצים שנשלחו |
| `scripts/verify.sh` (typecheck + חבילת revenue) | 1 | typecheck 0; tests 1: 80 קבצים עברו, 1 נכשל; 2949 עברו, 2 נכשלו, 2 דולגו – שני הכשלים מירושת `f934254` (סעיף 5) |
| `sim-tree.sh --ref f934254 -- npx vitest run …frozen-citations.test.ts` | 1 | 2 נכשלו / 20 עברו – אותם כשלים לפני הקיפול |
| `node scripts/mutate.mjs --check --plan …osek-patur-2026.json --cmd …` | 0 | 22 מתוך 22 יחולו (לפני הקומיט ואחריו) |
| `scripts/sim-tree.sh -- bash run-plan.sh … --plan …osek-patur-2026.json --cmd …` | 0 | baseline 10.9 שנ' ושוב 10.8 שנ'; 22 נהרגו, 0 שרדו, 0 killed?, 0 timeout; כ-11 שנ' לריצה, כ-4.5 דק' בסך הכול |
| `node scripts/owner-steps-pdf.mjs` | 0 | 598,588 בתים, 19 עמודים |

אישורים (grep על הקומיט):

- **122,833** (`122[,_ ]?833`) במוצר: `README.md` (שתי השורות הלא-מאומתות), `osek-patur-unverified.json`,
  `osek-zair-unverified.json`, `osek-zair.json` (רק ב-`check.vatLaw`, היסטוריה שפסיקת 6.10 השאירה), והבדיקות ותוכנית
  המוטציות. מתוכם נשלח רק `osek-zair.json` – הוא עובר כך כבר מ-6.10 ולא מהקיפול; שום קובץ ש-`osek-patur.html` טוען
  לא מחזיק אותו, ו-`_preview/` הראה ש-`osek-patur-unverified.json` לא מועתק.
- **סימן ה-at** בשורות שנוספו: רק שורת ה-JSON-LD של תשובת התקרה, שמפתח ה-type שלה כתוב בו (השורה קיימת; הטקסט שלה השתנה).
  תגי JSDoc חדשים נכתבו כפרוזה.
- **תבנית השם:** 0 שורות שנוספו.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- `sim-tree.sh` מקשר רק את `node_modules` של השורש. מוצר עם `node_modules` משלו (כאן vitest 4 מול 2 בשורש) צריך עטיפה
  ידנית; אפשרות `--link products/<p>/node_modules` בסקריפט, או קישור אוטומטי של כל `products/*/node_modules`, הייתה חוסכת אותה.
- `mutation-plans.test.ts` לא רואה תוכניות שליד בדיקות של מוצר; כדאי שיסרוק גם `products/*/tests/mutations/*.json` עם
  ה-`--cmd` של המוצר.
- הסורק של `frozen-citations` קורא הפניה לקובץ אחר (`:152-154` של ROBOTS-RULING) כמספרי שורות של לכידה שמוזכרת לפניה –
  חיובי כוזב שחוזר בכל פסיקה שמזכירה את `robots-nevo` עם הפניה כזו.
- רתמת "סקריפט הדף מול DOM מזויף" נכתבת מחדש בכל קובץ בדיקה של דף (osek-zair, osek-patur); עוזר משותף ב-`tests/helpers/`.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `osek-zair.json` כולו (כ-43KB) כשהיו נחוצות רק שורות 1–110 – הבזבוז הגדול.
- שלוש פקודות שנחסמו בשומר הבידוד ונכתבו מחדש.
- ארבעה כשלים משלי בבדיקות שנכתבו לפני שבדקתי את הבדיקות הקיימות שאוסרות שנים במודולים ואת אופן `textOf`.
- קריאת הפסיקה כולה (64KB) – נחוצה, לא בזבוז.
- חמש ריצות של חבילת המוצר (כ-11 שנ' כל אחת) – זולות.

## תיקונים אחרי הסקירה

**החוסם:** `scripts/verify.sh` נכשל על שתי בדיקות ב-`frozen-citations.test.ts`, שתיהן על שורות הפסיקה עצמה (`:364`, `:399`;
כבר ב-`f934254`). את הפסיקה אסור לערוך, ולכן תוקן הסורק: `scripts/freeze-capture.mjs` מסמן עכשיו שם קצר של פסיקה
(`ROBOTS-RULING`, `VIDEO-RULING`; `RULING_NAME_RE`) כמו שהוא מסמן "the note", כך ש-`:N` חשוף אחריו שייך לפסיקה ולא
ללכידה שהוזכרה לפניו. השוואה של כל הציטוטים בכל קבצי ההחלטה לפני השינוי ואחריו: ציטוט הלכידה היחיד שהשתנה הוא `:364`
(`robots-nevo` איבד את `:152-154`); כל השאר הן הפניות שלא היו שייכות לשום דבר ועכשיו שייכות לפסיקה. שני האזכורים של
`robots-nevo` בלי שורה (הבדיקה השבועית שה-REOPEN מחכה לה) קיבלו רשומת `LIVE_MENTIONS` אחת. נוספו בדיקת יחידה ו-T68F-1 עד 3.

**הערות שתוקנו (`7b68429`):** (1) תיאור דף הבית לא מפרסם עוד מעקב ל-2026. (2) המשפט הממתין, ה-grade וה-`toVerify` מוצמדים
למילות הפסיקה ולקובץ האח; השנה בכותרת הסטטית היא `defaultYear`; og:title והראש לא מציעים 2026 (X1 עד X5 בתוכנית). (3) בדיקה
חדשה ב-`owner-steps.test.ts` לטקסטים של החלטה 4(2) ולאיסור של 4(3) (Y1 עד Y3 ב-`owner-steps.json`). (5) כותרת הבדיקה על
"נבדק" אומרת עכשיו את האמת: ל-osek-zair.html יש "נבדק" משלו מ-29.9. (7) ב-README הסכום מופיע רק בשתי השורות הלא-מאומתות
(X7). (8) `mutation-plans.test.ts` בודק גם `products/*/tests/mutations/*.json`, עם ה-vitest של המוצר כ-`--cmd`; README ליד
התוכנית אומר איך להריץ אותה ב-`sim-tree.sh` עם `node_modules` של המוצר.

**נדחו:** (4) שלוש הופעות "נבדק": החלטה 2(4) מחייבת אותן, והסוקר קיבל. (6) הסכום ב-`osek-zair.json:71` (היסטוריית
`check.vatLaw` שפסיקת 6.10 השאירה בכוונה) ו-"'verified' rule" ב-`about` של `osek-zair-unverified.json`: מחוץ לקיפול (רשימת
2(9) לא כוללת אותם; "What this does not decide" 8). הראשון הוא היסטוריה ולא נתון שמוצג, והשני לא נשלח ומתאר את כלל השער.
(9) שני משפטי הסירוב שאינם מהפסיקה: הדף לא מציע את השנים האלה. (10) הסטיות הקטנות שהבונה גילה תואמות את הפסיקה.

| פקודה | יציאה | תוצאה |
|---|---|---|
| `npx vitest run` במוצר | 0 | 32 קבצים, 911 בדיקות |
| `node scripts/build-site.js` | 1 | אותם 6 חוסמים קיימים (נגישות, קישור ביטול); אף אחד לא של osek-patur |
| `node scripts/build-site.js --preview` | 0 | `osek-patur.html` זהה למקור; `osek-patur-unverified.json` לא הועתק |
| `node scripts/check-html.js` | 0 | all pages ok |
| `scripts/verify.sh` | 0 | typecheck 0; 81 קבצים, 2958 עברו, 2 דולגו |
| `osek-patur-2026.json` ב-`sim-tree.sh` | 0 | 29 נהרגו מתוך 29; baselines 18.3 ו-13.5 שנ'; 448 שנ' |
| `freeze-capture.json` ב-`sim-tree.sh` | 0 | 32 נהרגו מתוך 32; 344 שנ' |
| `owner-steps.json` ב-`sim-tree.sh` | 0 | 10 נהרגו מתוך 10; 37 שנ' |
| `owner-steps-pdf.mjs --out <scratch>` | 0 | 598,588 בתים, 19 עמודים; שונה מהקובץ השמור רק ב-CreationDate/ModDate, ולכן ה-PDF לא הוחלף |

בשורות שנוספו: 0 סימני at, 0 התאמות לתבנית השם.
