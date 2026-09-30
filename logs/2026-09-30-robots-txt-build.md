# robots.txt ו-User-Agent מזהה ל-render-watch (30.9.2026, שלב 12 של הקיפול, פסיקה 16(d) D2(v))

## 1. מה המשתמש ביקש
- משימת בנייה מ-workflow (Opus, worktree מבודד). היא מבצעת את שלב 12 ב-"Fold actions for Opus" של
  `research/channel-loop/RULING-2026-09-30-video.md`, לפי 16(d) D2(v). שישה חלקים:
  1. User-Agent מזהה במקום מחרוזת ה-Chrome המועתקת.
  2. קריאת robots.txt לפי RFC 9309.
  3. שורת בדיקה של robots.txt בלבד (`robots-`).
  4. ערך פסיקה חדש `NO_TERMS_ROBOTS_OK` וסקריפט שקובע אותו.
  5. `googlesource.com` עובר ל-CONDITIONAL_MET, ושורת ה-googlesource חוזרת לפעול.
  6. עדכון README.
- הכול בגישת test-first, stdlib בלבד, בלי תלות חדשה.

## 2. הפעולות המרכזיות שביצעתי
- **בדיקת הבסיס:**
  - ה-worktree עמד על `a4719e1` והפסיקה קיימת בו, כך שלא נדרש reset.
  - `pnpm install --frozen-lockfile --prefer-offline` הצליח.
  - ריצת בסיס של `src/__tests__/revenue`: ‏1313 בדיקות עברו.
- **הבדיקות נכתבו לפני הקוד** ונכשלו מהסיבה הנכונה (פונקציות חסרות, UA ישן):
  - `render-watch-robots.test.ts` (50 בדיקות).
  - תוספות ל-`queue-zero-test.test.ts`.
  - `robots-verdict.test.ts` (16 בדיקות).
  - תוספות ל-`render-watch-terms-barred.test.ts`.
- **`scripts/render-watch.mjs`:**
  - `USER_AGENT` = `MehudakRenderWatch/1.0 (+https://il-biz-tools.netlify.app)`, ו-`ROBOTS_PRODUCT_TOKEN`.
  - מקטע robots.txt חדש:
    - `parseRobotsTxt`, `robotsRulesFor`, `robotsDecision`: התאמה ארוכה ביותר, Allow מנצח בשוויון, `*` ו-`$`, נרמול אחוזים, `/robots.txt` מותר תמיד. ההתאמה לינארית, בלי backtracking.
    - `fetchRobots`: ‏2xx נקרא; 4xx פירושו "none"; 5xx או כשל רשת פירושם "unreachable" = איסור מלא. עד 5 הפניות, ואף פעם לא אל מארח חסום.
    - `robotsChecker`: מטמון לכל origin לכל ריצה. יש בו `decide` ו-`probe`, ומשמר משלו שמסרב למארח חסום בלי שום בקשה.
  - `fetchOne` בודק robots לפני ה-URL הראשון ולפני כל hop. ה-hop נבדק אחרי סירובי tiktok ו-TERMS_BARRED.
  - מצב js: robots נקרא ב-GET רגיל לפני הדפדפן. hop של ה-main frame נבדק אחרי שהעמוד נטען.
  - המטא רושם `robots` ו-`robotsUrl`.
  - `parseUrlList` מכיר את צורת השורה `robots-` (`robotsProbe: true`).
  - `googlesource.com` הוצא מ-TERMS_BARRED. נוסח ה-`why` של `google.com` תוקן, כי "render-watch does not read robots.txt" כבר לא נכון.
- **`scripts/queue-zero-test.mjs`:** ב-`termsGate`:
  - `NO_TERMS_ROBOTS_OK` פעיל כמו NOT_BARRED.
  - שורת `robots-` של `/robots.txt` בדיוק עוברת לאתר TERMS_PENDING, ולאתר NO_TERMS שההערה שלו פותחת ב-`exhaustive-negative`.
- **`scripts/robots-verdict.mjs` (חדש):**
  - dry-run כברירת מחדל; `--apply` כותב.
  - יציאה 0: נקבע. יציאה 3: לא שונה, והפלט אומר למה. יציאה 1: שגיאת שימוש.
  - לא הורץ עם `--apply`.
- **נתונים:**
  - `terms-verdicts.json`: ‏`googlesource.com` → CONDITIONAL_MET, עם note. גם `_about` עודכן.
  - `urls.txt`: שורה אחת חזרה לפעול, `sweep2-google-vrp-faq`, בדיוק בצורתה המקורית מ-`2907dc4`.
- **README:** עודכנו טבלת המטא וסעיף שער התנאים, עם תת-סעיף חדש על robots.txt וה-UA. תוקנו גם שתי שורות שעוד אמרו "waits on row 16(d)", אף שהשורה כבר נפסקה.

## 3. קבצים/מערכות ששונו
- **סקריפטים:**
  - `scripts/render-watch.mjs`
  - `scripts/queue-zero-test.mjs`
  - `scripts/robots-verdict.mjs` (חדש)
- **נתונים ותיעוד:**
  - `research/channel-loop/terms-verdicts.json`
  - `research/rendered/urls.txt`
  - `research/rendered/README.md`
- **בדיקות:**
  - `src/__tests__/revenue/render-watch-robots.test.ts` (חדש)
  - `src/__tests__/revenue/robots-verdict.test.ts` (חדש)
  - `src/__tests__/revenue/render-watch.test.ts`
  - `src/__tests__/revenue/render-watch-js.test.ts`
  - `src/__tests__/revenue/render-watch-terms-barred.test.ts`
  - `src/__tests__/revenue/queue-zero-test.test.ts`
- **היומן הזה.**
- **לא נגעתי ב-** `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`.

## 4. החלטות והנחות משמעותיות
- **יותר מ-5 הפניות ב-robots.txt → "unreachable" (איסור מלא).** ה-RFC מתיר להניח "unavailable", כלומר הכול מותר. הקריאה המחמירה לא יכולה לגרום לשליפה של משהו שהאתר רצה לחסום.
- **המטמון הוא לפי origin** (scheme+host+port), כמו ש-RFC 9309 מגדיר. "Per host" במשימה מתקיים בזה.
- **שדה `robots` לא נכנס לבדיקת השינוי** (`hasChanged`). עמוד שלא השתנה לא כותב כלום, והמטא שלו שומר את מצב ה-robots של השליפה שלכדה את הבתים.
  - אילו השדה היה נכנס, היו נכתבים מחדש כל המטא הישנים, כולל אלה שנערכו ביד (ההערה ב-`hasChanged` מזהירה בדיוק מזה).
  - סירוב robots הוא `error`, ולכן הוא כן שינוי ונרשם.
- **4xx (כולל 429) = "none", כלשון המשימה וה-RFC** (טווח 400-499). Google מתייחס ל-429 כ-5xx. לא אימצתי את זה.
- **מגבלה במצב js:** הדפדפן עוקב אחרי הפניות בעצמו, ולכן hop נבדק רק אחרי שכבר נשלחה אליו בקשה.
  - מה שהבדיקה עוד עושה: העמוד לא נשמר.
  - משאבי-משנה לא נבדקים מול robots.txt.
  - אין היום אף שורת js ב-`urls.txt`.
- **`robots.check` שונה ל-`robots.decide`.** מבחן קוד-המקור של מצב js אוסר `.check(` (checkbox של Playwright).
- **`robots-verdict` מקבל לכידה של 4xx כ"אין כללים", כמו render-watch עצמו.** הוא דורש לכידה לכל מארח שהשורות של האתר יושבות עליו.
- **`_about` ב-`terms-verdicts.json` עודכן** כדי שלא יתאר שער שכבר לא קיים. זו הרחבה מעבר ל"touch nothing else there" שבמשימה, שהבנתי כהתייחסות לרשומות של Google. אפשר להחזיר.
- **שם הבעלים ו-URL הריפו לא נכתבו בשום מקום.**
  - מבחן ה-UA קורא את ה-remote בזמן ריצה, ואוסר כל אחד מהמזהים בלי לכתוב אותו.
  - grep על ה-diff: ‏0 מופעים של שם, של URL הריפו ושל owner/repo.

## 5. שגיאות וניסיונות שנכשלו
- **פקודות Bash מורכבות** (heredoc עם python, לולאות עם משתנים, `git` בתוך צינור) נחסמו על ידי שומר ה-worktree. עברתי ל-Edit ולפקודות פשוטות.
- **שבע בדיקות `main` קיימות נכשלו אחרי השינוי, כצפוי:**
  - המטא קיבל שני שדות.
  - רשימות קריאות ה-fetch כוללות עכשיו את robots.txt.
  - בדיקות js-only לא הגדירו stub ל-fetch, ו-robots.txt ניסה לצאת לרשת. נוסף להן stub ברירת מחדל: robots 404, כל השאר נכשל.
- **בדיקת `applyVerdicts` שכתבתי נכשלה בגלל שורת fixture בלי פסיקה.** הטעות הייתה בבדיקה, והיא תוקנה.

## 6. בדיקות ופעולות ולידציה
- `npx vitest run src/__tests__/revenue`: ‏48 קבצים, 1387 בדיקות עברו (בסיס: 1313).
- `pnpm typecheck`: נקי.
- `node scripts/queue-zero-test.mjs --apply-verdicts --dry-run`: "would pause 0 line(s)".
- `node scripts/robots-verdict.mjs nevo.co.il`: יציאה 3, "no committed robots.txt capture for https://www.nevo.co.il".
- **בדיקות מוטציה:** כל מוטציה הוחלה על עותק, והקובץ שוחזר (sha256 זהה). כל אחת הכשילה בדיקות:
  - הסרת סירוב ה-robots: 6 נכשלו.
  - החזרת UA של Chrome: 4 נכשלו.
  - הסרת המשמר למארח חסום ב-`robotsChecker`: בדיקה 1 נכשלה.
  - בדיקת robots לפני סירוב TERMS_BARRED ב-`fetchOne`: 3 נכשלו.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **ביטול השהיה של שורות אחרי שפסיקה משתנה נעשה ביד** (כאן googlesource; אחר כך nevo, אחרי `robots-verdict --apply`). כדאי להוסיף ל-`queue-zero-test.mjs` את `--unpause-verdicts [--dry-run]`, ההפך של `--apply-verdicts`: להחזיר כל שורת `# paused …` שעוברת עכשיו את השער לצורתה המקורית.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- **כ-6 ניסיונות Bash נחסמו** על ידי שומר ה-worktree (heredoc/לולאות/`git` בצינור) ונכתבו מחדש כפקודות פשוטות.
- **קריאת הבדיקות הקיימות** (כ-3000 שורות) לפני הכתיבה הייתה הכרחית. בלעדיה הייתי שובר את בדיקות `main` בלי להבין למה.
