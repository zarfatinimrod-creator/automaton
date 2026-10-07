# סבב 64 (7.10.2026): ריצת דוח בלבד לא רושמת שום דבר שטיק מתוזמן רושם, ולכן "the loop did not run" נשאר

## 1. מה המשתמש ביקש

המשימה הגיעה מהשרשור הראשי של לולאת הערוצים (סבב 64), אחרי מדידה של סבב 62: `pnpm exec tsx scripts/colony.ts report`
הריץ את `tick(db.raw, { force: false, feedGoals: false, seed: false })`, כלומר כל צעד שהגיע זמנו. כשהורץ ביד על
`colony.db` המחויב הוא הדפיס "Ran: revenue_ledger_sync" ורשם סנכרון ספר חשבונות, ומכאן שורת החסימה "the loop did not run
for 7 hours ..." נעלמה מהדוח, והלוח אמר שאין חסימות פתוחות, בזמן שהמושבה המתוזמנת לא רצה שעות. החסימה הזו היא המכשיר
היחיד שמראה ש-GitHub מפיל את ההרצה השעתית. המטרה: ריצת דוח בלבד (וכל פקודה אחרת שרק מציגה) לא רושמת שום דבר שטיק
מתוזמן רושם — לא זמן סנכרון, לא מרווח צעד, לא שורת KPI או ספר — וה-`tick` המתוזמן רושם בדיוק כמו היום. בפירוט:

1. לקרוא את `scripts/colony.ts` (כל פקודה), את `tick()` ב-`src/revenue/runner.ts` ואת `src/revenue/heartbeat.ts`, ואיך
   חסימת הטריות מחשבת "last ledger sync"; למדוד על עותק של `state/colony/colony.db` כל כתיבה שריצת `report` עושה היום.
2. לשנות את `report` כך שלא יכתוב אף שורה ואף ערך kv, בשינוי הקטן והבטוח מבין השניים (הצגה מהמסד כפי שהוא, או טיק במצב
   שלא כותב, עם מסד לקריאה בלבד אם אפשר), ולהגיד למה; הדוח עדיין מראה את החסימות, כולל "the loop did not run" כשזה נכון;
   `tick` מתנהג בדיוק כמו קודם, מוכח בבדיקות הקיימות ובהשוואת טבלאות לפני/אחרי של טיק על עותק.
3. בדיקות: (א) על מסד שהסנכרון האחרון בו בן 7 שעות, `report` משאיר כל טבלה ו-kv זהים בבית והדוח עדיין אומר שהלולאה לא
   רצה; (ב) טיק מתוזמן על אותו מסד עדיין רושם את הסנכרון ומנקה את החסימה; (ג) כל פקודת הצגה אחרת מקבלת את אותה ערובה
   או נרשמת. מוטנטים חד-פעמיים ב-`scripts/sim-tree.sh` שמחזירים כל שינוי, ותוכנית מוטציות לצד הבדיקות (וזמן ריצה ב-README).
4. הכותרת של `colony.yml`: להחליף את המשפטים הישנים ("lives on a feature branch … Until it is merged") במה שנכון.
5. `scripts/verify.sh` על הבדיקות ששונו ועל `mutation-plans.test.ts`, אחר כך המלא; commit על `build/tick64-report`, היומן
   הזה. לא לדחוף.

## 2. הפעולות המרכזיות שביצעתי

- יצרתי worktree ב-scratchpad על `build/tick64-report` מ-`origin/claude/new-session-j071dx`; הבסיס `fa897b7`, `products/` ו-
  `src/revenue/` לא ריקים, `node_modules` מקושר לקופה הראשית.
- קראתי את `scripts/colony.ts` כולו, את `tick()`, `checkLiveness()` ו-`renderReport()` ב-`runner.ts`, את כל
  `heartbeat.ts` (`runLedgerSync`, `runSupervisorReview`, `runBoardReview`, `runAudit`), את `readPageViews` ואת כותבי הקבצים
  ב-`src/revenue/` (`page-views-reader.ts`, `prize-intake.ts`), ואת `createDatabase`. חסימת הטריות (`runner.ts` :180-199)
  קוראת את `kv` `revenue.last_run.revenue_ledger_sync`, ש-`markRan` כותב אחרי כל סנכרון שרץ.
- **מדידת הכתיבות של `report` היום** על עותקים של `state/colony/colony.db` (הסנכרון האחרון בו 2026-10-07T14:29:01.475Z),
  עם סקריפט dump בתיקיית ה-scratch שמוציא כל שורה של כל טבלה ואת הסכמה, לפני ואחרי, בלי מפתחות connector בסביבה:
  - `report --now 2026-10-07T21:30:00.000Z` (7 שעות; סנכרון ומפקח בזמנם, לוח וביקורת לא): 8 ערכי kv נכתבו —
    `revenue.connector_cursor.x402` (אותו ערך, `updated_at` חדש), `revenue.x402_held_rows`,
    `revenue.gumroad_refund_rate.last_read`, `revenue.last_ledger_sync`, `revenue.last_run.revenue_ledger_sync`,
    `revenue.board_review_requested`, `revenue.last_supervisor_review`, `revenue.last_run.revenue_supervisor_review` — ועוד
    4 שורות `revenue_reviews` של מפקחים. הדוח של הריצה הזו עוד הראה את החסימה (`checkLiveness` רץ לפני `markRan`), אבל
    `report` שני חמש דקות אחריו הדפיס "Ran: nothing (everything within its interval)", ו"did not run" נעלם גם מ-REPORT.md
    וגם מ-dashboard.html (0 מופעים). זה הפגם שנמדד בסבב 62.
  - `report --now 2026-10-14T12:00:00.000Z` (כל ארבעת הצעדים בזמנם): 11 ערכי kv נכתבו (אלה, בלי
    `board_review_requested` שנמחק, ועם `revenue.last_board_directive`, `revenue.last_run.revenue_board_review`,
    `revenue.last_audit`, `revenue.last_run.revenue_audit`) ו-17 שורות `revenue_reviews` (4 מפקח, 5 לוח, 8 מבקר). מעבר
    התקציב של הלוח רץ ולא שינה שורה (אף תקציב לא זז), אבל דוח הריץ אותו.
  - כתיבות שהקוד הישן היה עושה ושלא הופעלו במדידה (אין מפתחות): שורות ספר מה-connectors, שורות KPI של שיעור ההחזרים ושל
    צפיות הדף, דגל ה-priced query בקובץ `page-view-clock.json`, שינויי סטטוס ומטרות בתור מהלוח, `revenue.last_run.chief_audit`.
- **`src/revenue/runner.ts`**: `TickOptions.readOnly` (:248-255, חדש). ב-`tick` (`const readOnly` :295; `dueNotRun: []` רק
  ב-render, :302) שער הצעדים `shouldRun` (לפני :320-324, אחרי :331-338): צעד שהגיע זמנו רץ רק כשאין readOnly; ב-render הוא
  נרשם ב-`TickResult.dueNotRun` (:263-264, שדה אופציונלי) ולא ב-`skipped`, ושום `markRan` לא נקרא. כל השאר ב-tick
  (`checkLiveness`, שערי הצפיות, `findStalledLines`, `findStuckGoals`, הבדיקה של brand-mail, רשימת המשימות של הבעלים,
  `computePortfolioSummary`) רץ כמו בטיק, ולכן החסימות שאינן של צעד הן של טיק — אבל לא החסימות שרק צעד מחשב (קובץ מדידה פגום, צפיות הדף, שגיאות הסנכרון, ממצאי הביקורת): ה-render הזה השמיט אותן, והטענה "החסימות הן של טיק" כאן הייתה שקרית; הסקירה מצאה ותוקן ("תיקוני הסקירה" בסוף). `renderReport` (לפני :550, אחרי :565-570): ב-render
  "Ran: nothing — a report-only render runs no step and records nothing; the scheduled tick runs the steps" ו-"Due now, left
  for the scheduled tick: …"; טיק מדפיס בדיוק כמו קודם.
- **`scripts/colony.ts`**: `rendersOnly()` (:149-159, חדש) — `report`, `dashboard`, `status`, `growth`, ו-`criteria` בלי
  `--mark`/`--supervised`/`--reconcile`; אחרי `openDb` (לפני :204, אחרי :220-221) הידית שלהם `PRAGMA query_only = ON`, כך
  שכתיבה בנתיב הצגה זורקת במקום לנחות. `report` (לפני :234-236, אחרי :251-254): `tick(... readOnly: true ...)` במקום
  `force: false`, וההערה השקרית "A report-only run must not consume the intervals it just checked" הוחלפה. `dashboard` (לפני
  :376-377, אחרי :394-398): מחשב את החסימות ב-render readOnly ומעביר אותן ל-`renderDashboard`; לפני כן הדף שהפקודה כתבה אמר
  "אין חסימות פתוחות מלבד ההרשמות שלך" תמיד. טקסט ה-usage של `report` ו-`dashboard` (:62-64, :93-95).
- **`.github/workflows/colony.yml`** (לפני :12-19, אחרי :12-20): במקום "THIS DOES NOT RUN UNTIL IT IS ON THE DEFAULT BRANCH …
  Until it is merged" — שהוא רץ מ-main בכל שעה בדקה 17 וביד מ-Actions, ש-GitHub עלול לעכב או להפיל ריצה מתוזמנת בעומס
  (בין 6.10 18:00 ל-7.10 13:00 UTC המושבה רצה 3 פעמים, נספר מה-commits של colony-bot: 20:17, 00:40, 07:12), שחסימת "the
  loop did not run for N hours" היא מה שמראה את זה, ושני הצעדים ביד.
- בדיקות (סעיף 6), תוכנית מוטציות `src/__tests__/revenue/mutations/colony.json` (13), שורה ב-README ובטבלת זמני הריצה,
  ו-`colony.json` ברשימה של `mutation-plans.test.ts`.

## 3. קבצים/מערכות ששונו

- `src/revenue/runner.ts` — `TickOptions.readOnly`, `TickResult.dueNotRun`, שער הצעדים, שורות "This tick" בדוח.
- `scripts/colony.ts` — `rendersOnly` ו-`query_only`, `report` ו-`dashboard` דרך render readOnly, usage.
- `.github/workflows/colony.yml` — הכותרת בלבד (:12-20); השלבים לא נגעו.
- `src/__tests__/revenue/runner.test.ts` — describe חדש, 3 בדיקות (:775 ואילך).
- `src/__tests__/revenue/colony-cli.test.ts` — import-ים, 2 describe חדשים, 6 בדיקות (:132 ואילך); ה-pins הקיימים לא שונו.
- `src/__tests__/revenue/mutations/colony.json` (חדש), `mutations/README.md` (שתי שורות), `mutation-plans.test.ts` (שורה).
- היומן הזה. לא נגעתי ב-`state/colony/`, ב-`logs/CHECKPOINT.md`, ב-`CHANNEL_LOOP.md`, ב-`FABLE_QUEUE.md` או ביומן קיים.
  מחוץ לריפו: קובץ `/dev/null-journal` (512 בתים) נוצר בטעות (סעיף 5) ולא נמחק.

## 4. החלטות והנחות משמעותיות

- **למה טיק במצב readOnly ולא נתיב הצגה נפרד**: החסימות מחושבות בתוך `tick` מעשרה מקורות (חסימת הטריות, שורות שקטות,
  שערי הצפיות, brand-mail, מטרות תקועות, צעדי בעלים…). נתיב שני היה משכפל את כל זה ונשחק ממנו עם הזמן — בדיוק סוג ההבדל
  שהסתיר את הפגם. הדגל עוצר את ארבעת הצעדים בנקודה אחת (`shouldRun`), וכל השאר הוא אותו קוד. השינוי ב-tick עצמו: שתי שורות חדשות ושתיים ששונו בשער, ועוד הערה.
  **תיקון (סקירה):** "אותו קוד" נכון רק לבדיקות שמחוץ לצעדים; עצירת הצעדים בנקודה אחת עצרה גם את החסימות שהם מחשבים, וזה הפגם שהסקירה מצאה ("תיקוני הסקירה").
- **ולמה גם `query_only`**: הוא מה ש"פותח את המסד לקריאה בלבד" מבלי לעקוף את `createDatabase` (`readonly: true` של
  better-sqlite3 היה מדלג על המיגרציות, וקובץ במצב WAL לקריאה בלבד דורש קבצי ‎-shm). ה-pragma מופעל אחרי הפתיחה, כך
  שמיגרציה של מסד ישן עדיין חלה כמו בכל פקודה, וכל כתיבה אחרי זה זורקת `attempt to write a readonly database`. נמדד: על
  המסד המחויב הקובץ עצמו נשאר זהה בבית (sha256) אחרי `report` ואחרי כל פקודות ההצגה.
- **`dashboard`** הוא פקודת הצגה שהסתירה את החסימה גם בלי לכתוב (הוא כתב `state/colony/dashboard.html` בלי חסימות). נתתי לו
  את אותה ערובה (render readOnly ואותן חסימות). זו הרחבה קטנה מעבר ל-`report`, לפי סעיף 3(ג).
- **`status`** לא מדפיס חסימות בכלל (לא מציג ולא מסתיר); קיבל רק את `query_only`. **`growth`** לא נוגע במסד. **`criteria
  --wave-args`** קורא רק מהדיסק; לא נבדק דרך ה-CLI כי על הריפו הנוכחי הוא יוצא 1 בסירוב שלו עצמו ("already swept").
- **טיק מתוזמן לא השתנה**: בלי `readOnly` השער מחזיר את אותן תשובות, ל-result אין שדה `dueNotRun` (נבדק ב-`runner.test.ts`, ולכן
  גם ה-JSON של `--json` בלי השדה), והדוח מדפיס את אותן שורות (נמדד, סעיף 6).
- `rendersOnly` לא מיוצא: `scripts/colony.ts` מריץ את `main()` בטעינה, ולכן הבדיקות מריצות את ה-CLI ב-spawnSync.
- כלל ה-₪0: שום תקציב, הוצאה או הקצאה לא גדלו; render פשוט לא מריץ את מעבר התקציב של הלוח.
- סבב 62 כתב שהחסימה "נעלמה" אחרי ריצת `report` אחת; במדידה שלי היא נעלמה רק בהצגה **הבאה** (הדוח של הריצה עצמה עוד הראה
  אותה, כי `checkLiveness` רץ לפני `markRan`). ההשפעה אותו דבר: אחרי דוח ביד, כל דוח ולוח עד הטיק הבא שקטים.

## 5. שגיאות וניסיונות שנכשלו

- **שגיאה שלי**: בסוף פקודה של השוואת הטיקים השארתי לולאה מיותרת שהריצה `colony.ts tick --no-feed --json --db /dev/null`
  פעמיים. היא לא כתבה דבר בריפו (`git status` נקי, `state/colony/` בלי שינוי, חותמות הזמן 16:51), אבל SQLite יצר את
  `/dev/null-journal` (512 בתים, 17:00). לא מחקתי אותו (הכלל: למחוק רק את תיקיית ה-scratch שלי); הוא לא מזיק, ונרשם כאן
  כדי שהשרשור הראשי יחליט.
- הנרמול הראשון של ה-dump להשוואת טיק ישן/חדש לא מיסך `created_at` בפורמט ISO עם מילישניות, ושתי ריצות של הקוד הישן נראו
  שונות; אחרי המיסוך שתיהן זהות, ורק אז השוויתי לקוד החדש.

## 6. בדיקות ופעולות ולידציה

- **אחרי השינוי, על עותקים של `colony.db`**: `report --now 21:30` ו-`report --now 2026-10-14T12:00` — exit 0, הקובץ זהה
  בבית (sha256), ה-dump זהה, אין ‎-wal/‎-shm; REPORT.md: "Due now, left for the scheduled tick: revenue_ledger_sync,
  revenue_supervisor_review" (ובשני: כל ארבעת הצעדים) ו-"the loop did not run for 7 hours" (ובשני: 166 hours); הלוח מכיל
  את החסימה. `status`, `dashboard --now`, `growth`, `growth --json`, `criteria`, `criteria --json`, `criteria --due --briefs`
  — exit 0, הקובץ זהה בבית. `criteria --mark storefronts` עדיין כותב.
- **טיק לפני/אחרי**: `tick --no-feed` עם `--now 2026-10-07T21:30:00.000Z` ו-`--now 2026-10-14T12:00:00.000Z`, פעמיים בקוד
  הישן ופעם בחדש, כל אחד על עותק טרי: ה-dump המנורמל (ULID, `updated_at`, `created_at` ושעת הקיר ב-`last_ledger_sync`
  ממוסכים) זהה בין ישן לחדש בשני הזמנים (20 ו-40 שורות שונו מול המסד המחויב, אותן שורות); REPORT.md ו-dashboard.html זהים
  בבית; stdout שונה רק בנתיב שבשורת "Report written to".
- **בדיקות חדשות**: `runner.test.ts` — (א) render 7 שעות אחרי: ה-snapshot של כל הטבלאות זהה, `ran` ריק, `dueNotRun` = סנכרון
  ומפקח, החסימה בדוח ובלוח, ו-render שני עדיין עם החסימה (8 hours); render עם כל הצעדים בזמנם על ידית `query_only` לא
  זורק ולא משנה דבר; (ב) טיק מתוזמן על אותו מסד רושם את הסנכרון, ל-result שלו אין `dueNotRun`, והחסימה נעלמת מה-render
  הבא. `colony-cli.test.ts` — דרך ה-CLI על עותק של מסד שנבנה ב-`tick --now T0`: (א) `report` שעה 7 ו-8 — sha256 וטבלאות
  זהים, `last_run` נשאר T0, REPORT.md ו-dashboard.html אומרים שהלולאה לא רצה; (ג) `status`, `dashboard`, `growth`, `criteria`,
  `criteria --json --due` — sha256 זהה והלוח מראה את החסימה, ו-`criteria --mark` כותב; (ב) `tick --no-feed --now T0+7h`
  רושם `last_run` = T0+7h ו-`report` אחריו בלי "the loop did not run"; pin של `query_only` ו-`rendersOnly`; שני pins לכותרת
  של `colony.yml` (אין "feature branch"/"Until it is merged"/"DOES NOT RUN"; יש main, דקה 17, הפלה, החסימה, שתי הפקודות,
  וה-cron בקובץ הוא `17 * * * *`).
- **בקרה**: ב-`scripts/sim-tree.sh --dir <scratch>/sim-control` החזרתי את שלושת הקבצים ל-`fa897b7` והרצתי את שני קבצי
  הבדיקה: vitest exit 1, 8 נכשלו ו-51 עברו — כל הבדיקות החדשות חוץ מ-(ב) של ה-CLI, שהיא הערובה שהטיק לא השתנה ולכן עוברת
  גם על הקוד הישן.
- **מוטציות**: `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/colony.json` — 13 applied,
  13 killed, 0 survived, 179 שניות, exit 0. T64-C4 (בלי `query_only`) ו-T64-C6 (`report` מחוץ לרשימה) נהרגים רק על ידי ה-pin:
  היום אף נתיב הצגה לא כותב, ולכן אין התנהגות שרואה אותם. `node scripts/mutate.mjs --check` על `colony.json` (13 of 13) ועל
  `ledger.json` (17 of 17, ה-finds שלו ב-`colony.yml` לא זזו).
- `scripts/verify.sh src/__tests__/revenue/runner.test.ts src/__tests__/revenue/colony-cli.test.ts
  src/__tests__/revenue/mutation-plans.test.ts` — exit 0 (typecheck 0; 3 קבצים, 102 בדיקות). `scripts/verify.sh` המלא —
  exit 0 (typecheck 0; 80 קבצים, 2916 עברו ו-2 skipped שהיו קודם), 171 שניות.
- grep של ה-diff לשם הבעלים ולכתובות דוא"ל: 0 שורות; הודעות ה-commit בלי אסימון דילוג על CI.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **dump והשוואה של `colony.db`**: כתבתי שוב סקריפט שמוציא כל טבלה ונרמול של שדות שעון-קיר ו-ULID כדי להשוות טיק לטיק.
  סבב 63 עשה סימולציות דומות ביד. כדאי `scripts/colony-diff.mjs <a.db> <b.db> [--normalize]` שמדפיס אילו טבלאות ומפתחות kv
  השתנו — הוכחת "הטיק לא השתנה" בכל בנייה של המושבה תהיה פקודה אחת.
- הרצת פקודות המושבה בלי מפתחות connector (`env -u` לחמישה שמות) חזרה בכל ריצה; הבדיקה החדשה מוחקת אותם מהסביבה של ה-CLI,
  וכדאי שגם הסימולציות ידניות ישתמשו בעטיפה אחת.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `heartbeat.ts` ו-`runner.ts` במלואם (כ-1,600 שורות): נחוצה כדי למנות כל כתיבה, אבל חצי מהם (הרינדור) לא היה רלוונטי.
- הלולאה המיותרת עם `--db /dev/null` (סעיף 5) והבדיקה אחריה.
- נרמול ה-dump בשני סבבים (סעיף 5).
- תזכורות רשימת המשימות של השרשור הראשי שחזרו בתוצאות הכלים (כל הרשימה בכל פעם); לא נגעתי בה.

## תיקוני הסקירה

הסקירה (Opus) אישרה ש-`report` לא כותב דבר ושהטיק המתוזמן לא השתנה, ומצאה פגם חוסם אחד, תיקון אחד ושלוש הערות. התיקונים
ב-commit `c532ff2`, אחרי מיזוג הבסיס `992f1e5` (commit של colony-bot, `state/colony/` בלבד; בלי קונפליקט) ב-`01c628b`.

- **ממצא 1 (חוסם): render השמיט כל חסימה שרק צעד מחשב.** נכון, ונמדד מחדש (למטה). המשפט "החסימות הן של טיק" בסעיפים 2 ו-4
  ובהודעת ה-commit `2467fdd` היה שקרי: קובץ מדידה שאינו JSON, "page views: not configured while a clock runs", "page views:
  <error>", המוצרים הלא-ממופים והשגיאות של הסנכרון, וממצאי הביקורת לא הופיעו ב-render, בעוד שטיק באותו רגע והדוח הישן
  הראו אותם. התיקון, לפי טקסט הסקירה:
  - **סנכרון בזמנו ב-render** (`runner.ts`, ענף `else if (result.dueNotRun?.includes("revenue_ledger_sync"))`): קבצי
    המדידה נבדקים כמו שה-ingest בודק אותם ולא נרשמים (`measurements.ts`: `readMeasurementFile` משותף ל-ingest ול-
    `invalidMeasurementFiles`, `MEASUREMENT_FILES`); קריאת הצפיות במצב `offline` (`page-views-reader.ts`): כל בדיקה שלפני
    השאילתה הראשונה — כולל רשימת דפי האתר — ואז סטטוס חדש `due` ("N completed week(s) to read … a render sends no query") בלי
    שאילתה ובלי כתיבה. כך "page views: <error>", "not configured while a clock runs" ושורת "Page views:" הם של טיק, מילה במילה.
  - **הממצאים של הצעד עצמו** — מהריצה השמורה האחרונה, כל אחד פותח ב-"last ledger sync, <זמן>: " או "last audit, <זמן>: "
    (`heartbeat.ts`: `LAST_LEDGER_SYNC_KEY`, `LAST_AUDIT_KEY`, `lastLedgerSync`, `lastAudit`). זמן הסנכרון הוא
    `revenue.last_run.revenue_ledger_sync` (אותו זמן שחסימת הטריות מדפיסה), לא ה-`at` של הרשומה, שהוא שעון קיר גם תחת
    `--now`. `revenue.last_audit` לא שמר ממצאים, ולכן `runAudit` שומר עכשיו גם `chiefFindings` (שיעור הדגלים מחושב
    flagged / sampled, כמו ב-`runAudit`; רשומה מלפני התיקון — בלי ממצאים). **זה השינוי היחיד בכתיבות של טיק מתוזמן**: ערך
    ה-kv הזה, פעם בשבוע, מקבל שדה נוסף.
  - הממצאים השמורים מודפסים רק כשהצעד בזמנו ולא רץ: צעד שלא בזמנו לא מוסיף חסימה משלו גם בטיק, ולכן render שאין בו צעד
    בזמנו זהה לטיק. מה שצעד שלא רץ היה משנה לבדיקות שאחריו לא מדומה, ונאמר כך: ביקורת מפקח שלא רצה לא מרעננת את האות האחרון
    של שורה (בדיקת התקיעה), וביקורת לוח שלא רצה לא משנה סטטוס.
  - **הטקסטים**: `TickOptions.readOnly`, ה-USAGE של `report` ו-`dashboard`, ההערות ב-`colony.ts` — כולם אומרים עכשיו את
    זה במפורש. בדוח של render עם צעד בזמנו נוספה שורה אחת: "What a render cannot show: what the due steps would find now. …".
- **ממצא 2 (תיקון): ארבעת המוטנטים של הסקירה שרדו.** בדיקה חדשה ב-`runner.test.ts` ("a render's blockers are a tick's at the
  same moment"): fixture עם כל מחלקה — `apify-runs.json` שאינו JSON, `algora-supply.json` בלי measuredAt, brand-mail שאינו
  JSON, שעון il-biz-tools רץ ו-`pcn874.d0` שאינו יום UTC, שורה תקועה 8 ימים, צעדי בעלים — render וטיק באותו רגע (T0+8 ימים,
  רק הסנכרון בזמנו): אותן חסימות באותו סדר ובאותן מילים, ואותה שורת "Page views:"; וחמש דקות אחרי, בלי צעד בזמנו, שוב
  שוויון. בדיקה שנייה: ממצאי סנכרון וביקורת שמורים מופיעים עם הזמן שלהם, והשאר שווה לטיק; שלישית: ביקורת מתוזמנת אמיתית
  (עלות על שורה שנהרגה) שומרת את הממצא, ו-render שבוע אחרי מדפיס אותו. ב-`page-views-reader.test.ts`: render עם שבועות
  לקריאה — 0 קריאות fetch, טבלאות זהות, סטטוס `due`, והטיק באותו רגע קורא 2 שבועות; ושגיאת apiHost זהה ב-render ובטיק.
  `colony.json`: RV-G1..G4 נכנסו כ-T64R-G1..G4, ועוד 17 (T64R-S1..S10, A1..A5, L1, W2); ה-find של T64-R6 עבר עם השורה
  לבלוק החדש.
- **הערה 3 (כותרת colony.yml)**: תוקנה — "which only a tick (or the automaton's heartbeat task of the same name) records";
  ה-find של T64-W1 עבר איתה, pin חדש ב-`colony-cli.test.ts` ומוטנט T64R-W2.
- **הערה 4 (להדפיס ב-render את החלטת הלוח, ביקורת המפקח והסנכרון האחרונים)**: אופציונלית, לא נעשתה.
- **הערה 5 (`/dev/null-journal`)**: לא נמחק (הכלל: רק תיקיית ה-scratch שלי) — נשאר לשרשור הראשי; המשפט השקרי ביומן תוקן
  במקומו בסעיפים 2 ו-4.
- **מדידה מחדש** (סעיף 6 של הסקירה, על עותקים של `colony.db` מ-`992f1e5`, בעצי `sim-tree.sh`, `--now 2026-10-07T23:50Z`,
  `apify-runs.json` שאינו JSON ו-d0 של il-biz-tools 2026-10-05, בלי מפתחות): ב-`fa897b7` (לפני הבנייה) `tick --no-feed` ו-`report` — 7 חסימות כל אחד, זהות, אבל `report` שינה את המסד; ב-`04050f0` (הבנייה) `report` לא שינה את המסד אבל הראה 5: חסרו "measurement state/colony/measurements/apify-runs.json: not JSON …" ו-"page views: not configured while a clock runs (il-biz-tools from 2026-10-05) …" (כמו שהסקירה מדדה); ב-`c532ff2` `report` — המסד זהה בבית, 7 חסימות **זהות** לטיק (diff ריק), אותה שורת "Page views: not configured …", שורות "Due now" ו-"What a render cannot show", והלוח מכיל את שתי החסימות. הטיק: רשימת החסימות, REPORT.md ו-dashboard.html זהים בבית בין `fa897b7` ל-`c532ff2`, וה-dump של המסד אחרי הטיק זהה (`updated_at`/`created_at`, ULID ו-`at` של `last_ledger_sync` ממוסכים). ב-`--now 2026-10-14T21:30Z` (כל הצעדים בזמנם): `report` של `c532ff2` לא שינה את המסד, ו-7 החסימות שלו זהות לטיק; טיק ישן וחדש — אותן חסימות, וההבדל היחיד שנמצא הוא `revenue.last_audit` עם `"chiefFindings":[]`.
- **בדיקות**: `scripts/verify.sh` על `runner.test.ts`, `page-views-reader.test.ts`, `colony-cli.test.ts`, `measurements.test.ts`, `apify-runs.test.ts`, `brand-mail.test.ts` ו-`mutation-plans.test.ts` — exit 0 (typecheck 0; 7 קבצים, 242 בדיקות). `scripts/verify.sh` המלא — exit 0 (typecheck 0; 80 קבצים, 2922 עברו ו-2 skipped שהיו קודם; 6 בדיקות חדשות), 112 שניות. אף assertion לא הוחלש, דולג או נמחק.
- **מוטציות**: `node scripts/mutate.mjs --check` על `colony.json` — 34 of 34; `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/colony.json` — 34 applied, 34 killed, 0 survived, 218 שניות, exit 0 (נרשם ב-README).
- grep לשם הבעלים ולכתובות דוא"ל ב-diff: 0 שורות; אין אסימון דילוג על CI בהודעות.
- **הבסיס זז שוב בזמן העבודה** (`06ea5d4`, בניית `owner-report` של השרשור הראשי): מוזג ב-`85595d5` בלי קונפליקט; `owner-report.ts` לא קורא ל-`tick`, ל-`revenue.last_audit` או לסטטוסים של קריאת הצפיות. אחרי המיזוג `--check` על כל התוכניות עובר, ו-`scripts/verify.sh` המלא — exit 0 (81 קבצים, 2943 עברו ו-2 skipped).
- אסימונים: רוב הזמן הלך על קריאת `readPageViews`, `runAudit` ו-`ingestFile` כדי למצוא איפה בדיוק נגמרות הבדיקות שאינן רשת
  ואינן כתיבה; ותזכורות רשימת המשימות של השרשור הראשי שחזרו בתוצאות הכלים.
