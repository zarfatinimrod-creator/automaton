# 30.9.2026 — טיק 35: `capture-check` בסיכום של כל ריצת `render-watch.yml` (builder, review, fixer)

הלוג הזה מכסה את כל הטיק: מה שה-builder בנה (לוג משלו: `logs/2026-09-30-capture-check-job-summary.md`), חמשת הליקויים
שה-reviewer מצא, ומה שה-fixer תיקן.

## 1. מה המשתמש ביקש
- **הבנייה (builder):** לחבר את `scripts/capture-check.mjs` ל-`.github/workflows/render-watch.yml`, כך שכל ריצת render
  תציין בסיכום ה-job את הלכידות שהיא עצמה שמרה ושאינן דף שנקרא (`status`, `bot-challenge`, `js-shell`, `short`). בטיק 33
  מצאו ביד ש-EUR-Lex ו-UNESCO עונים ב-bot challenge כבר ימים. הצעד לא יכול להכשיל את ה-job, לא כותב כלום תחת `research/`,
  בלי token, בלי סודות ובלי רשת.
- **התיקון (fixer, הלוג הזה):** לתקן כל ליקוי של ה-reviewer שעומד, קודם בדיקה ואחר כך קוד; לנמק כל ליקוי שנדחה; להריץ
  `scripts/verify.sh` ותוכנית `scripts/mutate.mjs` עם מוטציה אחת לפחות לכל תיקון; commit ב-branch של ה-worktree בלבד.
  בלי push, בלי `git stash`, ובלי לגעת ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`
  או `CLAUDE.md`.

## 2. הפעולות המרכזיות שביצעתי
**ה-builder (שלושה commits: `efa73fa`, `bae786d`, `1a08f44`):**
- `changedSlugs(dir)`: `git status --porcelain=v1 -z --untracked-files=all --no-renames -- .` מתוך התיקייה, עם
  `--no-optional-locks`.
- הדגלים `--changed` ו-`--summary`: טבלת Markdown ל-stdout, ו-`::warning::` אחד לכל לכידה מסומנת ב-stderr.
- צעד חדש ב-workflow בין ה-fetch ל-commit: `continue-on-error: true`, `timeout-minutes: 3`, ויציאה 0 בכל קוד יציאה.
- 19 בדיקות ו-21 מוטציות, כולן נהרגו.

**ה-reviewer** מצא חמישה ליקויים (פירוט בסעיף 4). כולם עמדו בבדיקה, ואף אחד לא נדחה.

**ה-fixer (commit `35e3d9f`):**
1. **מגבלת זמן לכל לכידה.** מדדתי קודם את הביטויים הרגולריים על קלט עוין. 25 KB של `<div ui-view ` לקחו 14 שניות,
   26 KB בתוך עמוד לקחו 16 שניות, והזמן גדל בחזקה שלישית של הגודל. זה הרבה יותר גרוע ממה שה-reviewer מדד
   (`<div ` חוזר, ריבועי).
   - כל לכידה נבדקת עכשיו ב-worker thread (`timedClassifier`). ה-thread הראשי מחכה ב-`Atomics.wait` עם מגבלה
     (`--timeout`, ברירת מחדל `CAPTURE_TIMEOUT_S = 10`).
   - אחרי המגבלה, `worker.terminate()` עוצר גם regex באמצע (בדקתי: תוך 5 ms). הלכידה נרשמת כשורה מסוג `timeout`,
     ו-worker חדש לוקח את הבאה.
2. **הסיכום נכתב תוך כדי.** `summaryMarkdown` פוצל ל-`summaryHead`, `summaryRow` ו-`summaryEnd`.
   - הכותרת נכתבת לפני הלולאה, ושורת "Checking N ..." אומרת שבלי שורת הסיכום בסוף הבדיקה נקטעה.
   - כל שורה מסומנת והאזהרה שלה נכתבות מיד. ריצה שנעצרת ב-timeout של הצעד שומרת את כל מה שלפני.
3. **קוד יציאה ל-unreadable.** עם `--summary`, לכידה שאי אפשר לקרוא היא שורה כמו כל לכידה מסומנת, והיציאה 3.
   - יציאה 2 עם `--summary` פירושה עכשיו "אין רשימה בכלל" (שגיאת שימוש או git).
   - בלי `--summary`, 2 כמו קודם.
   - שורת הספירה כוללת עכשיו גם `unreadable` ו-`timeout`.
   - הודעת האזהרה של הצעד לכל יציאה אחרת: "the list of flagged captures in the job summary is missing or incomplete",
     ולא "no list", כי עכשיו רשימה חלקית אפשרית.
4. **בדיקות שחסרו:**
   - `--no-optional-locks`: בדיקה שנוגעת ב-mtime של לכידות committed ומוודאת ש-`.git/index` לא השתנה (sha ו-mtime) ושאין
     `index.lock`.
   - escaping של פקודות workflow עם שניים מכל תו.
   - בדיקת קצה לקצה עם meta שאינו JSON (השורות הגולמיות שלו מגיעות להודעת השגיאה של V8): כל שורת stderr שמתחילה ב-`::`
     היא אזהרה של הסקריפט עצמו.
5. **ליקויים קטנים:**
   - `cell()` מסמן escaping גם ל-`$` (math) ול-`@` (mention).
   - בדיקת קצה לקצה מריצה את פקודת ה-`run:` של הצעד עם node אמיתי, במאגר צעצוע שאליו הועתקו שלושת הסקריפטים. היא
     מכסה את התווית "research/rendered" (R6), יציאה 0, והיעדר אזהרת צעד מעל רשימה מלאה.
   - README שלב 0 לא מבטיח עוד "a warning each", והערת הקוד לא נוקבת במספר מגבלה שלא נבדק.

## 3. קבצים/מערכות ששונו
- `scripts/capture-check.mjs`:
  - ה-builder: `changedSlugs`, `summaryMarkdown`, `warningLine`, `--changed`, `--summary`.
  - ה-fixer: `timedClassifier`, `CAPTURE_TIMEOUT_S`, `--timeout`, `summaryHead`/`summaryRow`/`summaryEnd`, צד ה-worker,
    `isMainThread` בשומר ה-main, קודי יציאה ב-`--summary`, `$@` ב-`cell`, ותיעוד הסוגים `timeout` ו-`unreadable`.
- `.github/workflows/render-watch.yml`: הצעד (builder). ה-fixer שינה את נוסח האזהרה ואת ההערה.
- `src/__tests__/revenue/capture-check.test.ts`: 15 בדיקות של ה-builder. ה-fixer הוסיף 8 מקרים (4 `it` ו-4 מקרי `it.each`
  של `--timeout`) ועדכן 4.
- `src/__tests__/revenue/render-watch-js.test.ts`: 4 בדיקות של ה-builder. ה-fixer הוסיף בדיקת קצה לקצה ועדכן שתיים.
- `research/rendered/README.md`: שלב 0.
- `logs/2026-09-30-capture-check-job-summary.md` (builder) והלוג הזה.

## 4. החלטות והנחות משמעותיות
- **ליקוי 1: מגבלת זמן, לא חיתוך HTML.** ה-reviewer הציע לחתוך את ה-HTML ל-256 KB, או מגבלת זמן לכל לכידה. בחרתי
  במגבלת זמן, יחד עם כתיבה תוך כדי:
  - הדפוס הקובי לוקח 14 שניות כבר ב-25 KB, אז חיתוך ל-256 KB לא חוסם אותו.
  - חיתוך היה משנה את הסיווג של דפים גדולים אמיתיים (למשל `</body>` אחרי 256 KB).
  - מגבלת זמן מכסה גם דפוסים שעוד לא מצאנו.
  - ה-regexes עצמם לא שונו, ולכן `--all` על 465 הלכידות במאגר נותן פלט זהה בית-לבית, לפני ואחרי.
- **10 שניות** לכל לכידה. הלכידה האיטית ביותר במאגר (`gamedistribution-guidelines`, 5 MB) לוקחת 0.18 שניות.
  - 18 דפים עוינים או יותר בריצה אחת יעברו את 3 הדקות של הצעד. אז הכתיבה תוך כדי שומרת את כל השורות עד העצירה.
  - לא הוספתי תקציב זמן כולל (YAGNI).
- **worker תקוע בעלייה** (לא סביר, זה אותו קובץ שכבר נטען) ייראה כ-`timeout` לכל לכידה. ה-evidence במקרה כזה יאשים את
  ה-HTML. רשמתי את זה כאן ולא טיפלתי.
- **`workerData.captureCheckWorker === true`** מסמן את ה-worker. בלי הסימון, ייבוא של הקובץ בתוך worker של vitest היה
  רושם מאזין על ה-port של vitest.
- **ליקוי 2: קוד 3 עם `--summary` ל-unreadable, 2 בלי.** שתי ההצעות של ה-reviewer יחד:
  - שינוי קוד היציאה, כדי שרשימה מלאה לא תקבל אזהרת צעד;
  - שינוי הנוסח, כי עם כתיבה תוך כדי, קריסה באמצע משאירה רשימה חלקית ו-"no list" כבר לא נכון.
- **ליקוי 5:**
  - `$` ו-`@` מקבלים escaping.
  - URL חשוף לא מקבל: אם GitHub יהפוך אותו לקישור, זה קישור לדף שהלכידה עצמה מציינת.
  - איך סיכום job של GitHub מציג math או mention לא נבדק (בלי גישה לרשת).
  - גם מגבלת האנוטציות לצעד לא נבדקה, ולכן הנוסח ב-README הוא "GitHub may show only some of them", בלי מספר.
- **שום ליקוי לא נדחה.**

## 5. שגיאות וניסיונות שנכשלו
- **הבדיקה שאוסרת להעתיק את `MIN_TERMS_TEXT`** (`\b1000\b`) נכשלה על `timeoutS * 1000`. הפתרון היה להעביר את
  המגבלה בשניות ולהמיר עם `1e3`, במקום אחד, בלי לגעת בבדיקה.
- **בדיקות חדשות קראו ל-`commitAll`** על מאגר בלי שינויים ("nothing to commit"). הקריאה הוסרה, כי `repo()` כבר עושה
  commit.
- **בבדיקת הקצה לקצה** בדקתי שהנתיב המוחלט לא מופיע בסיכום בכלל. הבדיקה נכשלה, כי הודעת השגיאה של `readCapture`
  לגיטימית ומכילה את הנתיב. צמצמתי את הבדיקה לשורות "Checking" ו-"Not read pages".

## 6. בדיקות ופעולות ולידציה
- **אדום לפני הקוד:** 9 בדיקות נכשלו על הקוד של ה-builder. שתי בדיקות הכיסוי (index, escaping) עברו כבר אז, כי הקוד
  נכון. הן מוכחות במוטציות R1 עד R4b.
- **ירוק אחרי:** `capture-check.test.ts` ו-`render-watch-js.test.ts` עברו, 196 בדיקות.
- **רגרסיה על המאגר האמיתי:** `node scripts/capture-check.mjs --all` לפני ואחרי: stdout ו-stderr זהים (465 לכידות),
  4.7 שניות מול 4.9 שניות.
- **הרצת הצעד קצה לקצה** עם שני דפים עוינים (400 KB של `<div ` ו-390 KB של `<div ui-view `, שבלי המגבלה לוקחים דקות)
  ודף קצר:
  - הצעד יצא ב-0 אחרי 20 שניות;
  - הסיכום מלא: 2 `timeout` ו-1 `short`;
  - 3 אזהרות;
  - שום דבר לא נכתב.
- **`scripts/verify.sh`** על העץ של `35e3d9f`: typecheck יצא ב-0, והבדיקות יצאו ב-0 (57 קבצים, 1752 עברו ו-1 דולגה).
  התוצאה: `verify: passed`, exit 0.
- **`scripts/mutate.mjs --plan`:** 16 מוטציות על `35e3d9f`, baseline ו-baseline חוזר עברו (3 פקודות בדיקה), 16 נהרגו, 0 שרדו, exit 0. R1 עד R6 הן
  המוטציות שה-reviewer השאיר בחיים, עם אותו find/replace; R4b נוספה ל-`:` ב-title.

| id | קובץ | מוטציה | ליקוי | תוצאה |
|---|---|---|---|---|
| F1a | capture-check.mjs | `Atomics.wait` בלי מגבלת זמן | 1 | killed |
| F1b | capture-check.mjs | שורות הסיכום נדחות לסוף (`setImmediate`) | 1 | killed |
| F1c | capture-check.mjs | `CAPTURE_TIMEOUT_S = 0.001` | 1 | killed |
| F1d | capture-check.mjs | `--timeout 0` מתקבל (`>= 0`) | 1 | killed |
| F2a | capture-check.mjs | `--summary` יוצא ב-2 מעל רשימה מלאה | 2 | killed |
| F2b | render-watch.yml | האזהרה חוזרת ל-"no list of flagged captures this run" | 2 | killed |
| F2c | capture-check.mjs | שורת הספירה משמיטה `unreadable` | 2 | killed |
| R1 | capture-check.mjs | בלי `--no-optional-locks` | 3 | killed |
| R2 | capture-check.mjs | רק ה-LF הראשון מקבל escaping | 4 | killed |
| R3 | capture-check.mjs | רק ה-CR הראשון | 4 | killed |
| R4 | capture-check.mjs | רק ה-`%` הראשון | 4 | killed |
| R4b | capture-check.mjs | רק ה-`:` הראשון ב-title | 4 | killed |
| R5 | capture-check.mjs | הודעת שגיאה גולמית ל-stderr ב-`--summary` | 4 | killed |
| R6 | capture-check.mjs | הסיכום מציין את הנתיב המוחלט (`where: dir`) | 5 | killed |
| F5b | capture-check.mjs | בלי escaping ל-`$` ו-`@` | 5 | killed |
| F5c | README.md | שלב 0 חוזר ל-"a warning each on the run page" | 5 | killed |

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **מדידת הביטויים הרגולריים על קלט עוין** נעשתה ביד, עם סקריפט probe ב-scratch. כדאי בדיקה קבועה: לכל regex ב-
  `CHALLENGE_PAGES`/`JS_SIGNS`/... קלט עוין מוכר עם תקרת זמן. או לתקן את הדפוסים הקוביים עצמם; זה שינוי סיווג, ולכן
  דורש השוואת `--all` לפני ואחרי.
- **מאגר git זמני לבדיקות** נבנה עכשיו בארבעה מקומות: `mutate`, `merge-worktree`, ושני קבצי הבדיקה כאן. הגיע הזמן ל-helper
  משותף.
- **הרצת `run:` של צעד workflow** ב-`bash -e` (עם `node` מזויף ועם node אמיתי במאגר צעצוע) חוזרת על עצמה. מתאים ל-helper.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- **קריאת רשימת ה-scratchpad כולה** (`ls` על תיקייה עם מאות קבצים) בטעות: הבזבוז הגדול ביותר, בלי תועלת.
- **שלוש הרצות של שני קבצי הבדיקה** עד ירוק (בדיקת `1000`, `commitAll`, הנתיב בסיכום). כל אחת כ-17 שניות, והפלט שלה
  נקרא.
- **ה-probe** על 12 משפחות קלט: זול, והוא שמצא את הדפוס הקובי שה-reviewer לא ראה.
