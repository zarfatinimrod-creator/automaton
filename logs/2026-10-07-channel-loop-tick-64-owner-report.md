# סבב 64 בלולאת הערוצים — `scripts/owner-report.ts`, עובדות דוח המצב לבעלים מתוך colony.db והקוד (7.10.2026)

## 1. מה המשתמש ביקש
משימת בנייה של סבב 64 (מנהל הלולאה, Opus): הבעלים ביקשו פעמיים דוח מצב מפורט (`logs/2026-10-07-owner-status-report.md` הוא השני), ובשתי הפעמים עשרה סוכנים אספו ביד את אותן עובדות. לבנות `scripts/owner-report.ts` לקריאה בלבד שמדפיס, מבסיס הנתונים של המושבה ומהקוד בלבד, את העובדות של סעיפי הכסף, הקווים וצעדי הבעלים: (א) כסף — ₪ נכנס ויוצא, מאז ומעולם וב-30 הימים האחרונים, מומר ולא מומר, מספר שורות הלדג'ר, בלי מזהה חיצוני של שורה; (ב) הקווים — מזהה, tier, סטטוס, יעד, תקציב, צעדי הבעלים הפתוחים לכל קו; (ג) הצעדים שמתבקשים עכשיו לפי הסדר עם הדקות והסכום, ואלה שלא מתבקשים עם הסיבה שהקוד נותן; (ד) בריאות — זמן סנכרון הלדג'ר האחרון והשעות מאז (כפי שחוסם ה-staleness מחשב), וזמן סקירת הדירקטוריון האחרונה. `--json` מדפיס את אותן עובדות כאובייקט אחד. בדיקות על בסיס נתונים זמני שנבנה בעזרי המושבה, הרצה על עותק של colony.db, ו-`verify.sh` ממוקד ומלא.

## 2. הפעולות המרכזיות שביצעתי
- worktree ב-`/tmp/.../tick64/wt-owner-report` על `build/tick64-owner-report` מ-`origin/claude/new-session-j071dx`; הבסיס `992f1e5` (צאצא של `fa897b7`, נבדק ב-`git merge-base --is-ancestor`), `products/` ו-`src/revenue/` מלאים; `node_modules` כקישור.
- קראתי את הדוח לבעלים (הנספח), `ledger.ts`, `portfolio.ts`, `owner-steps.ts`, `money.ts`, ואת `renderReport`/`checkLiveness` ב-`runner.ts` (קריאה בלבד; הקובץ לא נערך).
- `src/revenue/owner-report.ts` (חדש): `buildOwnerReport(db, { nowIso, site })` ו-`renderOwnerReport(report)`. הלוגיקה ב-`src/` כדי ש-`pnpm typecheck` (שכולל רק `src/**`) יבדוק אותה; `scripts/owner-report.ts` הוא CLI דק (`--db`, `--json`, `--now`; יציאה 0/1/2).
- `src/revenue/ledger.ts`: `sumWindow`, `sumUnconverted` ו-`WindowSums` יוצאו (שלוש מילות `export` ושורת הערה), כדי שהסכומים של "מאז ומעולם" יהיו הסכומים של הלדג'ר עצמו ולא חשבון חדש.
- `src/__tests__/revenue/owner-report.test.ts` (חדש, 15 בדיקות) ותוכנית מוטציות `src/__tests__/revenue/mutations/owner-report.json` (20 רשומות), שורה ב-README של התוכניות ובטבלת זמני הריצה, והשם ברשימת התוכניות שב-`mutation-plans.test.ts`.
- הרצה על עותק של `state/colony/colony.db` בתיקיית ה-scratch: ₪0.00 בכל השורות, 0 שורות לדג'ר, ארבעה קווים פעילים ושישה מומתים, ארבעה צעדים מתבקשים (8, 3, 7, 6) — 63-73 דקות, סנכרון אחרון 16:48:59 UTC, סקירת דירקטוריון אחרונה 07:12:46 UTC; ה-hash של העותק זהה לפני ואחרי.

## 3. קבצים/מערכות ששונו
- חדשים: `scripts/owner-report.ts`, `src/revenue/owner-report.ts`, `src/__tests__/revenue/owner-report.test.ts`, `src/__tests__/revenue/mutations/owner-report.json`, היומן הזה.
- שונו: `src/revenue/ledger.ts` (ייצוא בלבד, בלי שינוי התנהגות), `src/__tests__/revenue/mutations/README.md`, `src/__tests__/revenue/mutation-plans.test.ts`.
- לא נגעתי: `logs/CHECKPOINT.md`, `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, פסיקות וישיבות, `research/measurements/*`, `state/colony/*`, `scripts/colony.ts`, `runner.ts`, `heartbeat.ts`. לא נדחף דבר.

## 4. החלטות והנחות משמעותיות
1. **בלי חשבון כסף חדש.** 30 הימים: חלון `computeLineMetrics` עצמו, והבדיקות מחזיקות את הסכומים ל-`computePortfolioSummary` (הכנסה פחות החזרים = `total30dAgorot`, עלויות, לא מומר, net). מאז ומעולם: אותם `sumWindow`/`sumUnconverted` לכל קו, על חלון שמכיל כל שורה (`""` עד `9999-12-31T23:59:59.999Z`, כולל שורה מתוארכת לעתיד). ה-net של 30 יום מודפס מ-`summary.net30dAgorot`; ל"מאז ומעולם" אין net, כי הוא היה חשבון חדש — מודפסים נכנס, החזרים ועלויות לחוד. הכסף מודפס דרך `formatIls`.
2. **שורה על קו שלא קיים במסד** לא נכנסת לאף סכום לפי-קו (כמו ב-REPORT.md), ולכן היא נספרת ומוזכרת בשורת הספירה ("on no line in the database") — אחרת הפער לא היה נראה. ספירות השורות הן `COUNT`, לא כסף.
3. **אין מזהים מהשורות:** השאילתות לא בוחרות `external_id`, `note` או `source` בכלל; רק סכומים וספירות. מהסקירות נקרא רק `createdAt`; שמות הקווים ופריטי ה-setup לא מודפסים (רק מספר הפריטים הפתוחים).
4. **הצעדים הם של `owner-steps.ts`:** "מתבקש עכשיו" = `isOwnerStepOpen` לפי `ownerStepsInOrder`, הסכום = `ownerStepMinutes` על אותם צעדים, והסיבה של שאר הצעדים בסדר העדיפויות של הקוד: done (התאריך), frozen (`frozen.rule`), held (`precondition.short`) — כמו `notAskedNowNote` ב-`runner.ts`. שורות הסוד המוחזקות (`POSTHOG_READ_KEY`) נקראות מ-`site.json` כמו `secretGateSite` ב-`runner.ts` (קובץ שלא נקרא מחזיק את השורה).
5. **פער שמתגלה מהפלט ולא תוקן כאן:** לפי הקוד מתבקשים עכשיו 8, 3, 7, 6 — 63-73 דקות, כולל Gumroad (צעד 3) וצעד 6 כולו. הדוח לבעלים (7.10) מנה "עכשיו, בחינם, כ-38 דקות": 8, 6ד, הרשאת רשת, 6 Apify, 7, ו-Gumroad "אחר כך" — לפי רצף ה-₪0 שבמסמך העברי. ההערה בראש `owner-steps.ts` אומרת שהרצף הזה חי במסמך בלבד עד שהדירקטוריון יפסוק מחדש, והרשאת הרשת אינה צעד בקוד. הכלי מדפיס את מה שהקוד אומר; היישור הוא החלטה, לא תיקון של הכלי.
6. **השעות מאז הסנכרון** מעוגלות כמו ב-`checkLiveness` (`Math.round` של הפער בשעות), והחוסם עצמו נלקח מ-`checkLiveness(db, nowMs)` (רק SELECT). מפתח ה-kv (`revenue.last_run.revenue_ledger_sync`) נכתב בקוד המודול כי `lastRunKey` פרטי ב-`runner.ts`, שבנייה אחרת משנה עכשיו.
7. **קריאה בלבד:** `new Database(path, { readonly: true, fileMustExist: true })`, ובדיקה מוקדמת שהקובץ קיים (יציאה 1, הקובץ לא נוצר). מסד ב-WAL שנפתח לקריאה בלבד עדיין יוצר לידו `-wal` (0 בתים) ו-`-shm` של SQLite; הם ב-`.gitignore` (`*.db-wal`, `*.db-shm`), והקובץ הראשי זהה בבית. פתיחה כ-`immutable` נבדקה ונפסלה: ה-better-sqlite3 כאן לא מקבל URI.
8. **ברירת המחדל של `--db`** היא `state/colony/colony.db` של ה-checkout (לפי מיקום הסקריפט, לא ה-cwd), ו-`site.json` נקרא מ-`products/il-biz-tools` של ה-checkout; `--db` מפורש נפתר מה-cwd.

## 5. שגיאות וניסיונות שנכשלו
- ההרצה הראשונה של הבדיקות נפלה באיסוף: `report(EMPTY_DB)` בגוף `describe` רץ לפני `beforeAll`, והקובץ עוד לא היה קיים ("the directory does not exist"). הבנייה של המסדים הועברה לראש הקובץ (בזמן האיסוף).
- ברשימת המחרוזות האסורות היה `"gumroad"`, אבל מזהה הצעד `gumroad` (צעד 3) מודפס בצדק; הוסר מהרשימה לפני ההרצה.
- `SYNC_AT` הראשון (7 שעות ו-20 דקות) לא היה מבדיל בין `Math.round` ל-`Math.floor`; שונה ל-6:40 (מעוגל 7, floor 6) לפני תוכנית המוטציות, כדי ש-T64-OR15 ייהרג.
- ניסיון `file:...?immutable=1` נכשל ("the directory does not exist"): אין תמיכת URI. נשארנו בקריאה בלבד רגילה.

## 6. בדיקות ופעולות ולידציה
- `scripts/verify.sh src/__tests__/revenue/owner-report.test.ts src/__tests__/revenue/mutation-plans.test.ts src/__tests__/revenue/ledger.test.ts`: typecheck exit 0, tests exit 0, 3 קבצים, 81 בדיקות; "verify: passed", יציאה 0.
- `scripts/verify.sh src/__tests__/revenue/owner-report.test.ts` (אחרי שורת זמן הריצה ב-README): typecheck exit 0, tests exit 0, קובץ 1, 15 בדיקות; יציאה 0.
- `node scripts/mutate.mjs --check --allow-dirty --plan .../owner-report.json`: 20 of 20 would apply, יציאה 0.
- תוכנית המוטציות המלאה ב-`scripts/sim-tree.sh` (מ-`4d5a482`): baseline פעמיים exit 0, 20 הוחלו, 20 נהרגו, 0 שרדו, יציאה 0, 169 שניות.
- `scripts/verify.sh` המלא (על `4d5a482`): typecheck exit 0, tests exit 0, 81 קבצים, 2,922 עברו ו-2 דולגו (2,924), "verify: passed", יציאה 0, 111 שניות.
- הרצה על עותק של colony.db: טקסט exit 0, `--json` exit 0 ונקרא ב-`JSON.parse`, sha256 של העותק זהה לפני ואחרי; `state/colony/colony.db` של ה-worktree לא נגע (`git status` נקי).
- grep על ה-diff לתבנית שם הבעלים: 0 שורות. כתובת דואל אחת בשורות שנוספו — המחרוזת המושתלת של הבדיקה ב-`example.com`, שהבדיקה מוודאת שאינה מודפסת. הודעות ה-commit נבדקו לטוקן דילוג ה-CI: 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- זה בדיוק מה שהכלי עושה: בדוח הבא, `pnpm exec tsx scripts/owner-report.ts --json` מחליף את אוספי הכסף, הקווים והצעדים. נשארים ידניים: השבוע האחרון (git log, PRים, פסיקות) והסיכונים; סקריפט `--week` שמונה commits, מיזוגים ופסיקות מ-git בלבד יחסוך עוד אוסף.
- הפער בין "מתבקש עכשיו" בקוד לבין רצף ה-₪0 במסמך העברי נמצא פעמיים ביד (בדוח ובסבב הזה). בדיקה שמשווה את רשימת הצעדים שהמסמך מבקש "עכשיו" ל-`isOwnerStepOpen` הייתה תופסת אותו — אחרי שהדירקטוריון יחליט איזה מהשניים נכון.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת `owner-steps.ts` המלא (~49KB) ו-`ledger.ts` (~32KB): הכרחית בחלקה; ה-`unlocks` הארוכים לא נדרשו.
- קריאת חלקים של `runner.ts` פעמיים (`renderReport`, ואז `checkLiveness`): הייתי יכול לחפש את `LOOP_GAP` בפעם הראשונה.
- ה-README של תוכניות המוטציות (טבלת זמנים ארוכה מאוד) נקרא כולו כדי למצוא את המבנה; מספיק היה `head` וחיפוש.
- תוכנית המוטציות (169 שניות) ו-verify המלא רצו ברקע/ב-sim-tree, בלי המתנה ידנית.
