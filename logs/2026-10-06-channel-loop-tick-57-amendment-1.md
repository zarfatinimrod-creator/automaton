# טיק 57 (6.10.2026) — amendment 1 של פסיקה 6.10 שורה 21: בלי workflow artifact, כלל הטווח הרחב, והמעבר השני של ה-trim

בונה Opus, ב-worktree על הענף `build/tick57-amendment` (מ-`origin/claude/new-session-j071dx` ב-`19d203a`).
הסמכות: `research/channel-loop/RULING-2026-10-06-robots-and-terms.md`, החלטה 4 (שורות 295-373) ו-"Amendment 1 (6.10 ~16:45 UTC,
tick 56, main thread)". ה-commits: `8da919b` (הבנייה), `558c654` (תיקון בדיקה אחרי mutation ששרדה), ו-commit הלוג הזה.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש לבנות את amendment 1, כפי שהוחלט ובלי להחליט מחדש:
- (A) להסיר מ-`.github/workflows/render-watch.yml` את שלב ה-upload ואת `RENDER_WATCH_ARTIFACT_NAME`; השמירה בשלב ה-commit נשארת, אבל
  קוראת רשימת slugs שכתב שלב ה-fetch (קובץ תחת `$RUNNER_TEMP`) ולא גוף על הדיסק.
- (B) ב-`scripts/render-watch.mjs`: גוף של דף מאתר שאוסר העתקה לא נשמר בשום מקום. הטקסט מחולץ בזיכרון (PDF דרך קובץ זמני שנמחק מיד),
  לעץ נכתבים רק ה-meta עם בלוק `trimmed` ו-`.txt` מרוקן; `artifact: null`, `fullBytesIn` אומר "not retained"; אוצר המילים "artifact"
  מוחלף ברשימת ה-slugs.
- (C) ב-`scripts/trim-capture.mjs`: טווח מצוטט ארוך מ-20 שורות לא שומר כלום (גם לא את קצותיו), גם "cited" וגם "on its line"; שורה
  שמצוטטת לחוד בתוכו שומרת ±2. והמעבר השני: לכידה שנגזמה ב-6.10 ושורותיה השמורות כוללות טווח כזה נגזמת מחדש ב-`--apply`.
- (D) המספרים על המאגר האמיתי, ב-sim-tree בלבד. (E) בדיקות ותוכניות mutation. (F) הוכחת קבלה ב-sim-tree. (G) README.
- ה-thread הראשי מריץ את המעבר השני על המאגר אחרי המיזוג; אני רק dry run על המאגר האמיתי.

## 2. הפעולות המרכזיות שביצעתי

- קראתי את החלטה 4 ואת amendment 1 במלואם, את הלוג של טיק 56 כולו, ואת הקוד והבדיקות שהוא מתאר.
- **workflow:** שלב ה-upload ו-`RENDER_WATCH_ARTIFACT_DIR/NAME` הוסרו. לשלב ה-fetch ולשלב ה-commit ניתן אותו
  `RENDER_WATCH_BARRED_LIST: ${{ runner.temp }}/render-watch-barred-slugs.txt`. השמירה בשלב ה-commit (לפני `git add`): מסרבת כשהרשימה
  חסרה, ומסרבת כש-`research/rendered/<slug>.{html,json,pdf,xml,bin}` קיים לאחד ה-slugs ברשימה. ההערות מזכירות את amendment 1 ואומרות
  שב-repository ציבורי artifact אינו פרטי.
- **render-watch.mjs:**
  - `storeBarredCapture` לא כותבת את הגוף לשום מקום. PDF נכתב לתיקייה זמנית (`mkdtempSync` תחת `tmpdir()`) רק בשביל pdftotext, ונמחק
    ב-`finally`, גם כשהחילוץ נכשל.
  - `routeTrimmed`: `fullBytesIn: NOT_RETAINED`, `history: NOT_RETAINED_HISTORY`, `wide: []`, `artifact: null`.
  - `ARTIFACT_RETENTION_DAYS`, `DEFAULT_ARTIFACT_DIR`, האפשרויות `artifactDir`/`artifact` והפלט `barred=` ל-GITHUB_OUTPUT הוסרו.
  - `main` יוצר את הרשימה ריקה לפני כל fetch (גם לרשימת URL ריקה), ו-`captureEntry` מוסיף שורה לכל slug שה-route כתב בריצה.
  - הלוג וה-job summary אומרים "body not retained" (עם ה-sha256 המקוצר) במקום שם artifact. הערת הכותרת נכתבה מחדש.
- **trim-capture.mjs:**
  - `isWide`, `keepingRanges`, `intersectRanges`, `linesIn`, `widePass`, `retrimPlan`, `replaceTrimmed`, `orderBlock`, `WIDE_RULING`,
    `BLOCK_KEYS`.
  - המעבר הראשון: טווח רחב לא שומר כלום; השמירה "refuses to blank a cited line" ובדיקת הגוף הבינארי לא סופרות אותו; הבלוק מקבל
    `wide` (הטווחים הרחבים) ו-`cited` בלעדיהם.
  - המעבר השני: לכל קובץ שמור (txt, או גוף שנשאר בעץ) שטווח רחב מגיע אליו, עכשיו או ברשומת `cited` של הבלוק, השורות החדשות הן
    השורות הישנות שטווח לא-רחב (מהרשומה או מהציטוטים של היום) עדיין שומר עם ±2. שום שורה לא חוזרת.
    `fullSha256`/`fullByteLength`/`lineCount`/`body.sha256` לא משתנים; `passes: [{ on, ruling, keptLinesBefore, bodyKeptLinesBefore }]`
    נוסף; השורות שמעל הבלוק לא זזות (`replaceTrimmed` כותב רק את הבלוק, שהוא המפתח האחרון); `FROZEN.sha256` מתעדכן לעותק קפוא.
  - הפלט: `would re-trim <slug> (wide range ...)` עם השורות והבייטים לפני ואחרי; שורת `wide:` אחת לכל טווח, עם כל שורות הציטוט שלו.
  - exit: 0 כשיש מה לגזום או לגזום מחדש, 3 כשאין.
  - התרופה בסירוב של לכידת route: "its full bytes were never retained (fullBytesIn: "..."), ... cite its URL, fetchedAt and sha256".
    אותו נוסח ב-`freeze-capture.mjs`.
- `capture-check.mjs`: רק הערה (לא "the workflow artifact").
- בדיקות: `render-watch.test.ts` (route בלי artifact, TMPDIR טרי שנשאר ריק, ה-PDF הזמני נמחק גם בכישלון, הרשימה נכתבת, נוצרת ריקה,
  מחליפה רשימה ישנה, נתיב שלא ניתן לכתוב עוצר את הריצה; ה-workflow: אין upload, אותו נתיב לשני השלבים, השמירה מורצת ב-bash על
  עץ דמה לכל סיומת, לרשימה ריקה, לרשימה חסרה ול-slug בלי newline, ומקצה לקצה עם `main`); `render-watch-js.test.ts` (סדר השלבים);
  `trim-capture.test.ts` (כלל הטווח הרחב, PDF שרק טווח רחב מצטט, יחידות של `widePass`, המעבר השני על fixture שנגזם כמו ב-6.10,
  idempotence, השמירה במעבר השני, `replaceTrimmed`, ה-route, צורת הבלוק).
- תוכניות mutation: `render-watch.json` (T56-RW7 הוסרה; 16 רשומות T57 נוספו, 6 מהן על ה-yml), `trim-capture.json` (17 רשומות T57;
  T56-T7, T11, T16, T19, X5, X8, X9 עודכנו ל-find החדש), הערה ב-`capture-check.json`, ו-README של התוכניות.
- `research/rendered/README.md`, הסעיף "Trimmed copies" בלבד: בלי artifact, כלל הטווח הרחב, המעבר השני, איך מצטטים לכידת route
  (בלי שורה: URL, `fetchedAt`, `sha256`).

## 3. קבצים/מערכות ששונו

- `.github/workflows/render-watch.yml`, `scripts/render-watch.mjs`, `scripts/trim-capture.mjs`, `scripts/freeze-capture.mjs` (נוסח
  ההודעה בלבד), `scripts/capture-check.mjs` (הערה בלבד).
- `src/__tests__/revenue/{render-watch,render-watch-js,trim-capture}.test.ts`.
- `src/__tests__/revenue/mutations/{render-watch,trim-capture,capture-check}.json` ו-`README.md`.
- `research/rendered/README.md` (רק "Trimmed copies"; כל הציטוטים של שורות ה-README הם לשורות 1-81, לפני הסעיף).
- הלוג הזה.
- לא נגעתי: אף לכידה במאגר (dry run בלבד; `git status` נקי מלבד הקבצים שלמעלה), `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`,
  `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, אף `RULING-*.md`, `research/measurements/*`, `terms-verdicts.json`, `urls.txt`.

## 4. החלטות והנחות משמעותיות

1. **אילו slugs ברשימה:** רק אלה שה-route כתב בריצה (דף שהשתנה). דף שלא השתנה לא נכתב, ולכן לא נרשם: אם הייתי רושם אותו, השמירה
   הייתה עוצרת כל commit בגלל גוף גזום שנשאר בעץ בכוונה (12 גופים מצוטטים לפי שורה, למשל `indiebook-terms.html`).
2. **השמירה מסרבת גם כשהרשימה חסרה.** כך שינוי שם של משתנה בשלב אחד בלבד לא משאיר שמירה עיוורת. בגלל זה `main` יוצר את הרשימה
   ריקה לפני הכול (גם לרשימת URL ריקה, לפני "Nothing to fetch").
3. **סיומות:** השמירה בודקת `html json pdf xml bin`. ה-brief מנה `html|json|pdf|bin`; הוספתי `xml` כי `extensionFor` יכול לתת
   אותה ו-`BODY_EXTS` כולל אותה. סטייה קטנה, רחבה יותר.
4. **הפלט `barred=` הוסר** מ-GITHUB_OUTPUT: הצרכן היחיד שלו היה תנאי שלב ה-upload. השורה חזרה לצורתה לפני טיק 56.
5. **המעבר השני ממשיך רק את כלל הטווח הרחב.** הוא נכנס לפעולה רק לקובץ שטווח רחב מגיע אליו, והשורות החדשות הן חיתוך של הישנות.
   הוא לא מרוקן שורות של ציטוטים שנעלמו מאז 6.10 (הרשומה בבלוק נחשבת). מוטציה T57-T17 מחזיקה את זה.
6. **הבלוק:** בחרתי `passes` (מערך) ולא שדה `wideRule`, כדי שמעבר עתידי יירשם באותה צורה. `on` נשאר תאריך הגזירה הראשונה.
   הבלוק שנכתב מחדש נכתב בסדר `BLOCK_KEYS` ואחריו `passes`.
7. **שורת `wide:`** אחת לכל טווח, עם כל שורות הציטוט שלו (בטיק 56: אחת לכל שורת ציטוט). מוטציות X8 ו-X9 נכתבו מחדש בהתאם.
8. **המספרים (D)** הם של הריצה ב-sim-tree, ותואמים ל-dry run על המאגר האמיתי.
   - `terms-btl-2026-09-29.txt` שומר גם 288-292: ‎`:290` מצוטט לחוד ב-`TERMS-AUDIT-2026-09-29.md:191`. מתוך 293-313 נשארות רק 297-305.

## 5. שגיאות וניסיונות שנכשלו

- **ריצת הקבלה הראשונה ב-sim-tree:** כל השלבים עברו, אבל `scripts/verify.sh` המלא נעצר באמצע עם `Terminated` (exit 143). ה-vitest
  שלו המשיך לרוץ יתום בקבוצת התהליכים, ונעלם כשמשימת הרקע הסתיימה.
  - הסיבה לא נמצאה. הריצה הייתה במקביל לשתי תוכניות mutation, בתוך `sim-tree.sh` שרץ כמשימת רקע.
  - הרצתי שוב את `verify.sh` המלא, בחזית, באותו עץ sim השמור (המצב שאחרי המעבר השני): exit 0.
- **T56-X7 שרדה** בריצה הראשונה של `trim-capture.json` (‏46/47). הבדיקה שהרגה אותה הייתה בדיקת הטווח הרחב של 6.10, שהחלפתי.
  - הוספתי לבדיקה החדשה את ספירת הטווחים המצוטטים ("; 7 cited range(s) kept;"), ווידאתי ש-X7 נהרגת.
  - commit `558c654`, והרצה חוזרת של כל התוכנית: ‏47/47.
- בדיקת המאגר האמיתי ב-`trim-capture.test.ts` נכשלה פעם אחת: היא לא הכירה את השורות `would re-trim`. תיקנתי את ה-regex.
- `git grep -n ... --cached` נכשל על סדר הארגומנטים (`--cached` אחרי הדפוס). הרצתי שוב עם `--cached` לפני הדפוס: לא הודפס כלום.
- `sleep` בחזית נחסם בסביבה; עברתי ל-`until ... sleep` כמשימת רקע או בחזית עם timeout.

## 6. בדיקות ופעולות ולידציה

כל "עבר" נשפט לפי קוד היציאה.

- **`scripts/verify.sh` על עשרת קבצי הבדיקה** (render-watch, render-watch-js, trim-capture, freeze-capture, capture-check,
  mutation-plans, frozen-citations, prize-terms-audit, remask-captures, render-watch-robots): exit 0, 631 עברו.
- **הקבלה (F)** ב-`scripts/sim-tree.sh` של כל המאגר ב-`8da919b`, עם TMPDIR בתיקיית ה-scratch:
  - `freeze-capture.mjs --cited` לפני: exit 0. dry run: exit 0.
  - `trim-capture.mjs --apply`: exit 0, שלושה re-trims. ריצה נוספת (dry): exit 3. עוד `--apply`: exit 3.
  - `freeze-capture.mjs --cited` אחרי: exit 0, פלט זהה בייט לבייט לפלט שלפני (`cmp`).
  - `sha256sum -c FROZEN.sha256` (מתוך `research/rendered`): exit 0.
  - `git status` בעץ: 7 קבצים (3 metas, 3 טקסטים, `FROZEN.sha256`).
  - `scripts/verify.sh` המלא על העותק שנגזם מחדש: exit 0 (typecheck 0; 80 קבצים, 2713 עברו, 2 skipped). זו הריצה החוזרת שבסעיף 5.
- **המספרים (D)**, שורות ובייטים של טקסט שנשמרים (בלי newlines), לפני → אחרי:

  | קובץ | שורות לפני | בייטים לפני | שורות אחרי | בייטים אחרי | התרוקנו |
  | --- | --- | --- | --- | --- | --- |
  | `indiebook-terms.txt` (298 שורות, 46,891 בייטי טקסט) | 245 (27-271) | 42,279 (90.2%) | 41 (45-49, 83-99, 125-129, 131-135, 163-171) | 8,527 (18.2%) | 33,752 בייטים |
  | `terms-btl-2026-09-29.txt` (508 שורות, 13,792) | 28 (288-315) | 3,375 (24.5%) | 14 (288-292, 297-305) | 2,389 (17.3%) | 986 |
  | `terms-worksheets4kids-2026-09-29.txt` (321 שורות, 8,583) | 27 (183-209) | 3,810 (44.4%) | 17 (183-187, 191-197, 205-209) | 2,320 (27.0%) | 1,490 |

  - סך הכול 36,228 בייטים מתרוקנים.
  - שתי שורות `FROZEN.sha256` (btl ו-worksheets4kids) נכתבות מחדש.
  - הגוף של `indiebook-terms.html` נשאר ב-810-814: ‎`html:812` מצוטט ואינו רחב.
  - ה-dry run על המאגר האמיתי ב-worktree נתן את אותם מספרים, exit 0, ובלי לכתוב (`git status` לא הראה לכידה).
- **Mutations**, כל תוכנית ב-sim-tree משלה (`mutate --check` על ארבע התוכניות: exit 0):

  | תוכנית | נהרגו | זמן (s) | commit |
  | --- | --- | --- | --- |
  | `render-watch.json` | 105/105 | 403 | `8da919b` |
  | `trim-capture.json` | 47/47 | 352 | `558c654` (ב-`8da919b`: ‏46/47, ‏X7 שרדה; סעיף 5) |
  | `freeze-capture.json` | 29/29 | 311 | `8da919b` |

  `capture-check.json` לא הורצה: ב-`capture-check.mjs` שונתה הערה בלבד, ובתוכנית שונתה note אחת.
- **בדיקת השמות:** הדפוס (מחובר) על כל הקבצים שהשתנו, לפני כל commit: לא הודפס כלום (exit 1). הכתובות היחידות בקבצים שהשתנו הן
  שורות fixture שהיו לפני (`example.invalid`) וצורה ממוסכת (`[redacted:email]@barred.test`).
- **`scripts/verify.sh` המלא ב-worktree** על `558c654` (ועם השינוי ב-README של התוכניות): exit 0 (typecheck 0; 80 קבצים, 2713 עברו,
  2 skipped). אחריו dry run על המאגר האמיתי: exit 0, שלושת ה-re-trims שבטבלה, ו-`git status` בלי שום לכידה.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **סקריפט קבלה ב-scratch:** כתבתי שוב "dry, apply, ריצה חוזרת = 3, `--cited` לפני/אחרי + `cmp`, `sha256sum -c`, `verify.sh`". זו
  ההמלצה של טיק 56 (`scripts/sim-apply.sh`), שעדיין לא נבנתה; פעם שלישית.
- **עדכון תוכניות mutation:** שוב בסקריפט node חד-פעמי (הסרה, עדכון find, הוספה). `mutate.mjs --add/--set` היה חוסך את זה.
- **בדיקת mutation בודדת:** אחרי ש-X7 שרדה הרצתי אותה לבד עם `--file/--find/--replace`. `mutate.mjs --only <id> --plan` היה פשוט יותר.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הלוג של טיק 56 במלואו ושל חלקים גדולים מ-`render-watch.mjs` ו-`trim-capture.mjs`: נחוץ, כי ה-route והגזירה הם הבסיס.
- ריצת הקבלה הראשונה שנעצרה (`Terminated`) וחקירת התהליכים היתומים: כ-10 דקות. ההרצה החוזרת בחזית פתרה את הבעיה, ולא הסיבה.
- הריצה הראשונה של `trim-capture.json` (412 s) שהסתיימה ב-46/47, וההרצה החוזרת (352 s).
- כתיבת fixture במצב "כמו ב-6.10" (`trimAsOn610` בבדיקה), כי הקוד החדש כבר לא יודע לגזום בדרך הישנה.
