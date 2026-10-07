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

## תיקוני הסקירה
בסקירה (Opus) לא היו ממצאים חוסמים. היו שני ממצאי `fix` ושש הערות. שני ה-`fix` תוקנו, וארבע הערות זולות תוקנו איתם. commit התיקונים: `fa83647`. ה-README של תוכניות המוטציות והיומן הזה נמצאים ב-commit שאחריו.

**ממצא 1 (`fix`): שורה שצעד שבוצע עדיין חייב, כשהשער שלה פתוח.** לפני התיקון היא הודפסה כ-"Asked now, alone" מתחת לכותרת "Not asked now:", והכותרת לא ספרה אותה. תיקנתי לפי נוסח התיקון של הסקירה.
- ב-`renderOwnerReport` השורות האלה מודפסות עכשיו בגוש משלהן, "Asked now, alone (rows done steps still owe):", לפני "Not asked now:". רק השורות שעדיין מוחזקות נשארות תחת "Not asked now", וכל שורה מודפסת פעם אחת.
- כותרת הצעדים מוסיפה ", and N row(s) of done steps asked alone" כשיש שורה כזו. כך ב-`renderReport` של `runner.ts`, שם השורה מקבלת כותרת משלה ("## Asked now: one row of a done step").
- נוספה בדיקה שקוראת ל-`renderOwnerReport` עם `owedRows` סינתטי, שורה אחת שמתבקשת ואחת מוחזקת. היא בודקת את סדר הכותרות ושהשורה המתבקשת מופיעה פעם אחת בלבד.

**ממצא 2 (`fix`): הצעדים שמתבקשים עכשיו התעלמו ממצב הקווים במסד.** הסקירה הציעה שתי חלופות. לקחתי את שתיהן יחד, וכך עושה גם `renderReport` (המקור).
- צעד מתבקש, נספר בסכום הדקות ומקבל קווים רק עבור קו שעדיין ממתין לבעלים. קו ממתין הוא קו במצב `awaiting_setup` שה-setup שלו לא סומן כבוצע, כמו `waiting` ב-`renderReport`.
- צעד שפתוח ב-`owner-steps.ts`, אבל אף קו ממתין לא צריך אותו, עובר ל-"Not asked now" במצב `no-line-waiting`. לידו מופיע מצב כל אחד מהקווים שלו: killed, set up (<status>) או not in the database. כך שינוי בקוד שלא עודכן עדיין נראה, אבל לא מתבקש מהבעלים.
- צעד שמתבקש מציין גם את הקווים האחרים שהקוד מונה לו, עם מצבם (`linesNotWaiting`).
- תוספת שלי, לפי המקור: טבלת הקווים לא מבקשת דבר מקו שכבר לא ממתין, וכותבת "none: the line no longer waits on the owner". אחרת הטבלה הייתה סותרת את הרשימה הכללית. `renderReport` מציג צעדים רק לקווים ממתינים.
- נוספה בדיקה על מסד שבו `il-biz-tools` מומת ו-`pcn874` מסומן setup-done. בו נשארים מתבקשים רק 7 ו-6, 33-43 דקות. 8 ו-3 עוברים ל-"Not asked now" עם מצב הקווים שלהם.
- על עותק של `colony.db` של היום הפלט לא השתנה: 8, 3, 7, 6, 63-73 דקות. ארבעת הקווים במסד ממתינים.

**הערות שתוקנו (זולות, כל אחת עם בדיקה):**
- `--now` מנורמל ל-ISO אחד, `new Date(nowMs).toISOString()`, גם ל-`asOf` וגם לגבולות החלון. הבדיקה מעבירה אותו רגע עם `+03:00`.
- זמן סנכרון שאחרי שעון הדוח מודפס כ-"N hours after this report's clock (a sync time in the future)" ולא כ-"-3 hours ago". המספר ב-JSON נשאר שלילי, וזה מתועד בממשק.
- עמודת התקציב נקראת עכשיו "Budget, credit cents/month", בלי הסיומת `c`.
- `chmod +x scripts/owner-report.ts`, כמו `scripts/colony.ts`. `./scripts/owner-report.ts` רץ ויוצא 0.

**הערות שלא שונו, ולמה:**
- ממצאי `silent_line` של `checkLiveness`: אין היום קו live, אז הרשימה ריקה. ההוספה היא שטח חדש בדוח, ולא תיקון.
- `lastRunKey` ו-`secretGateSite` הכפולים: `runner.ts` אסור לעריכה, כי בנייה אחרת משנה אותו עכשיו. אחרי שהיא תמוזג, אפשר לייצא אותם משם ולייבא כאן.
- `ledger.ts`: לא נדרש שינוי. כדאי לזכור במיזוג שנוסף שם `export` סביב שורה 600.
- הפער בסדר הצעדים בין `owner-steps.ts` לרצף ה-₪0 במסמך העברי: זו החלטת דירקטוריון ולא תיקון לכלי. היא עוברת לשרשור הראשי, כפי שהבונה כתב.

**בדיקות ומדידות של התיקונים:**
- קובץ הבדיקות: 19 בדיקות, 4 מהן חדשות.
- `mutations/owner-report.json`: נוספו T64-OR21 עד OR36, ו-T64-OR11 הוזז לשורה ששמה שונה (`const open = ...`). `mutate.mjs --check` מראה ש-36 מתוך 36 יוחלו.
- הרצה מלאה ב-`sim-tree.sh` מ-`fa83647`: 36 הוחלו, 36 נהרגו, 0 שרדו, יציאה 0, 219 שניות. בערך 120 שניות מהן רצו במקביל ל-verify המלא.
- `scripts/verify.sh src/__tests__/revenue/owner-report.test.ts`: typecheck יצא 0, הבדיקות יצאו 0, 19 בדיקות, יציאה 0.
- `scripts/verify.sh` המלא: typecheck יצא 0, הבדיקות יצאו 0, 81 קבצים, 2,926 עברו ו-2 דולגו, יציאה 0, 123 שניות.
- הרצה על עותק של `colony.db`: הטקסט ו-`--json` יצאו 0, ה-JSON נקרא, וה-sha256 של העותק זהה לפני ואחרי. בפלט 0 כתובות דואל ו-0 התאמות לתבנית השם.
- ב-diff יש 0 שורות שמתאימות לתבנית השם. בהודעות ה-commit אין את טוקן דילוג ה-CI.

**אסימונים:** רוב ההוצאה הייתה על קריאת `renderReport` ו-`doneStepRowsReport` כדי ליישר את הטקסטים למקור. תוכנית המוטציות רצה ברקע, במקביל ל-verify.
