# סבב 69 — build "owner-truth": עובדות הצעדים מסכימות, והדוח מדפיס את המסלול הקצר לתשלום ראשון — 11.10.2026

בונה (Opus) בעץ עבודה מבודד (`.claude/worktrees/wf_927f10b0-b09-3`), על `claude/new-session-j071dx` מ-`00d35bc`.

## 1. מה המשתמש ביקש

החוט הראשי (סבב 69) ביקש build בשם "owner-truth", מתוך הסתירות שהמאמת האדברסרי מצא ב-11.10
(`logs/2026-10-11-owner-can-you-earn-now.md`, `logs/CHANNEL_LOOP.md` §9 "Queued 11.10"):

- (a) דקות הצעדים: צעד 6 הוא 18–23 ב-`src/revenue/owner-steps.ts` ו-"18" ב-`docs/OWNER_STEPS.he.md`. ליישר את המסמך
  העברי לקוד בכל צעד, לחדש את ה-PDF, ולהוסיף בדיקה שמפרקת את הדקות מהמסמך ומשווה לקוד.
- (b) מתי נשאל אימות הזהות של Apify: `portfolio.ts:229` ו-`research/breadth/BOARD.md` Q5 שמים אותו בישיבת ה-Publish
  כשהוא מסמכים בלבד. למצוא כל טקסט שאומר אחרת, לתקן את מה שמותר לי, ולרשום לחוט הראשי את מה שבקובצי הלולאה. אם שתי
  פסיקות סותרות באמת — לא להכריע, לדווח.
- (c) x402: `portfolio.ts` אומר "stays deployed", וה-README שלו אומר שלא פרוס. לקבוע את האמת מהריפו ולתקן את הטקסט
  השגוי; לעולם לא לטעון "פרוס" בלי בדיקת runner.
- סעיף חדש ב-`src/revenue/owner-report.ts` ו-`scripts/owner-report.ts`: "המסלול הקצר לתשלום ראשון", לקריאה בלבד,
  מחושב מ-`owner-steps.ts` ו-`portfolio.ts`: לכל קו חי — הצעדים שמבוקשים עכשיו בסדר `order` של הקוד עם דקות והאם יש
  בדיקת זהות; הצעדים המושהים/המוקפאים עם השער; מה כל צעד פותח; הקריאות המתוזמנות שהקו מחכה להן; ואז הקבוצה הקטנה ביותר
  של צעדים שמביאה קו אחד לקבל תשלום, עם סך הדקות. בלי לבחור בין שני הסדרים (FABLE_QUEUE שורה 29 פתוחה). בדיקות ורשומות
  מוטציה ב-`owner-report.json`, הרצה ב-`sim-tree.sh`.

## 2. הפעולות המרכזיות שביצעתי

1. **בדיקת בסיס:** העץ היה על `297a20b` (בסיס ישן, בלי `RULING-2026-10-11-ledger-sale-ids.md`) — `git reset --hard
   claude/new-session-j071dx` ל-`00d35bc`, כמו שהבריף אומר. `node_modules` קושר לזה של הצ'קאאוט הראשי (כמו בשני העצים
   האחרים). `scripts/verify.sh` על הבסיס: יציאה 0 (81 קבצים, 2,958 עברו, 2 דולגו).
2. **(a) דקות:** פירקתי כל `**זמן…**` בכל `## צעד N` ובטבלת הסיכום. רק צעד 6 סטה (18 במקום 18–23, בצעד ובטבלה). ב-
   `docs/INCOME_PLAN.he.md` §6 סטו גם צעד 7 (10–15 במקום 15–20) וצעד 6 (15–20 במקום 18–23). תוקנו כולם; סך הכול נכתב
   כ-150–190 דקות (`ownerStepMinutes()`), והצעדים החינמיים כ-35–40 (צעד 8 + הגדרת הרשת 2 + החלק המוקדם של 6 (8) + צעד 7),
   במקום "כ-38". ה-PDF חודש ב-`node scripts/owner-steps-pdf.mjs` (19 עמודים, 605,133 בתים; צילום המסך הראשון נבדק בעין:
   RTL תקין, שורת העדכון של 11.10 מופיעה).
3. **(b) Apify:** הכלל הקובע הוא Q5 סעיף 3 של לוח הרוחב (28.9): אם הקריאה ב-`apify-docs` מראה מסמכים בלבד — האימות עובר
   לישיבת ה-Publish (צעד 6, חלק ג); אם יש מצלמה — לעולם לא. הקריאה נעשתה ב-28.9 (סבב 5,
   `research/measurements/apify-visibility.md`: "Verification is document-only as written"). תיקנתי את מה שסתר:
   - `docs/OWNER_STEPS.he.md`: הפתיח ("למשל אימות זהות ב-Apify לפני שמתמחרים"), חלק ג (אמר "חינם, בלי אימות זהות" —
     עכשיו הקליק עצמו בלי אימות, ובאותה ישיבה אימות הזהות של Apify עם "עצור אם" למצלמה), הערת הפיצול של צעד 6 (הקליק
     בחלק ג' כבר לא "ראשון, כבר עכשיו", כי הוא נושא צעד זהות), והרשימה "מה מגיע רק אם קו מתחיל להרוויח" (שם נשאר רק
     אמצעי התשלום של Apify, והאימות "כבר לא כאן"). שורת עדכון מתוארכת 11.10 בראש.
   - `docs/INCOME_PLAN.he.md` שורה 10 והפסקה "מה שמגיע רק אם קו מתחיל להרוויח".
   - `products/apify-il-open-data/README.md` ("That is all; no identity verification") — עכשיו: זה כל מה ש-Apify דורשת,
     והבעלים נשאל על האימות בישיבת ה-Publish לפי Q5.
   - `skills/revenue-apify-actors/SKILL.md` — תוצאת הקריאה של 28.9 נוספה לתנאי.
   - `.github/workflows/apify-publish.yml` — הערה בלבד ("should not have to for a test").
   - בקוד: לכל צעד שדה `identity` (yes/part/no ומה), וצעד 6 הוא `part` — חלק ג בלבד.
4. **(c) x402:** אין ב-`.github/workflows/` שום workflow שפורס את `products/x402-il-api` (רק `products-ci.yml` מריץ את
   הבדיקות שלו במטריצה), אין בדיקת runner, ואין כתובת בשום מקום בריפו; ה-README שלו (שורה 87) אומר "the API is not
   deployed". לכן הטקסט השגוי הוא ב-`portfolio.ts` (`KILLED_LINES` paid-apis `standby`), ותוקן ל-"built and tested but NOT
   deployed … allowed to be deployed only while it costs ₪0/month". גם `products/README.md` ("may stay deployed"),
   `docs/INCOME_PLAN.he.md:367` ("רץ במצב חינמי") ו-`docs/REJECTED.md` (הערה מתוארכת 11.10: "may stay deployed" היא
   רשות של הדירקטוריון, לא רישום של פריסה).
5. **הסעיף החדש:** `buildFirstPaymentPath` ו-`renderFirstPayment` ב-`owner-report.ts`, `firstPayment` ב-`OwnerReport`
   (וגם ב-`--json`). ב-`owner-steps.ts` נוספו `LINE_PAYMENT_WAITS` (הקריאות המתוזמנות, בנויות מ-`PAGE_VIEW_GATES`
   ו-`SUPPLY_THRESHOLDS`, ולאפיפיי גם פעולת בעלים מחוץ לשמונה הצעדים: אמצעי תשלום) ו-`OWNER_STEP_ORDER_REVIEW` (השורה
   על FABLE_QUEUE שורה 29). התוצאה על מסד מאותחל: הקבוצה הקטנה ביותר — **צעדים 8, 2, 3, 6, 108–143 דקות, עבור
   `il-biz-tools`, ורק אחרי שקריאת יום 56 עוברת**; בדיקות זהות בתוכה: 2 (כן), 3 (כן), 6 (בחלק אחד). `apify-actors` (2, 6,
   78–113 דקות) לא נספר: התשלום שלו צריך גם אמצעי תשלום בשם הבעלים, שאינו אחד מהשמונה.
6. **בדיקות ומוטציות:** 5 בדיקות חדשות ב-`owner-steps.test.ts` לדקות (שני המסמכים, שתי הטבלאות, הסכומים), 5 לזהות,
   5 ל-`LINE_PAYMENT_WAITS` ולהערת הסדר; 11 ב-`owner-report.test.ts` לסעיף. `owner-report.json` קיבל T69-OR1..30,
   `owner-steps.json` קיבל T69-S1..11; שתי התוכניות הורצו ב-`sim-tree.sh` (ראה §6).

## 3. קבצים/מערכות ששונו

- `src/revenue/owner-steps.ts` — `OwnerStepIdentity` ו-`identity` לכל צעד; `LINE_PAYMENT_WAITS`; `OWNER_STEP_ORDER_REVIEW`;
  הערת סבב 69 בכותרת. שום צעד לא נוסף, הוסר, מוספר מחדש או הוזז.
- `src/revenue/owner-report.ts` — הסעיף "Shortest path to a first payment" (`firstSentence`, `buildFirstPaymentPath`,
  `renderFirstPayment`, השדה `firstPayment`).
- `scripts/owner-report.ts` — הכותרת מתארת את הסעיף (בלי שינוי לוגיקה).
- `src/revenue/portfolio.ts` — רק משפט ה-`standby` של x402.
- `docs/OWNER_STEPS.he.md`, `docs/OWNER_STEPS.he.pdf` — דקות צעד 6, הסכומים, אימות Apify, שורת עדכון 11.10.
- `docs/INCOME_PLAN.he.md` — דקות צעדים 7 ו-6, הסכום, אימות Apify, x402.
- `docs/REJECTED.md` — הערה מתוארכת על x402. `products/README.md` — x402.
- `products/apify-il-open-data/README.md`, `skills/revenue-apify-actors/SKILL.md`, `.github/workflows/apify-publish.yml`
  (הערה בלבד) — כלל Q5.
- `src/__tests__/revenue/owner-steps.test.ts`, `src/__tests__/revenue/owner-report.test.ts` — הבדיקות.
- `src/__tests__/revenue/mutations/owner-report.json` (36 → 66), `owner-steps.json` (10 → 21).
- לא נגעתי: `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, שום `RULING-*`
  או `SITTING-*`, `research/measurements/*`, `state/colony/*`, הקבצים של ה-builds האחרים, ו-`mutations/README.md`.

## 4. החלטות והנחות משמעותיות

1. **הזהות היא שדה בקוד.** `owner-steps.ts` הוא מקור האמת לדקות, לזהות ולשערים, ולא היה בו שדה זהות; `catalogueRef`
   לא מתאים (גם הדומיין והארגון ב-GitHub נושאים אותו). הסיווג: 1, 8, 5, 7 — לא; 2, 3, 4 — כן; 6 — בחלק ג בלבד. בדיקה
   מוודאת שכל צעד "כן"/"בחלק" מזכיר "תעודת זהות" בסעיף העברי שלו, וצעד "לא" אף פעם לא; בצעד 6 — רק בחלק ג.
2. **"יכול לקבל תשלום" מוגדר מהקוד:** כל צעד ש-`lines` שלו כולל את הקו ("cannot earn until this step is done"), חוץ
   מצעד שבוצע ומצעד מוקפא (הקו הולך בלעדיו ב-₪0, וזה מה ש-`frozen.freeInstead` אומר). קו שהתשלום שלו צריך פעולת בעלים
   מחוץ לשמונה (`owner-later`) לא נספר. הקטן ביותר = הכי מעט דקות בקצה התחתון, אחר כך בעליון, אחר כך מספר הצעדים; תיקו
   — כולם מודפסים. הקריאות לא מזרזות כלום, ולכן הן מודפסות ליד הקבוצה ("once its read above passes") ולא נספרות כצעד.
3. **`LINE_PAYMENT_WAITS` ב-`owner-steps.ts`, לא ב-`portfolio.ts`:** `portfolio.ts` לא יכול לייבא את
   `bounties/supply.ts` (מעגל: supply → intake → portfolio, ו-`intake.ts` קורא את `KILLED_LINES` בזמן טעינה). זה גם
   "שער" — ולכן במקור האמת לשערים. המספרים של Apify (200, 10) אינם קבועים בקוד; הם מצוטטים מה-criteria של הקו, ובדיקה
   מחזיקה אותם יחד.
4. **בלי הכרעה בין הסדרים:** הסעיף מדפיס את `order` של הקוד (1 → 8 → 2 → 3 → 5 → 7 → 4 → 6) ושורה אחת שהסדר בבדיקה
   (FABLE_QUEUE שורה 29). הקבוצה הקטנה היא קבוצה; סדרה הוא סדר הקוד, וזה לא בחירה בסדר. שימו לב: לפי פסיקת ה-floors
   (28.9, שורה 9) צעדי השכבה בתשלום של il-biz-tools (2, 3, 6b) מצטרפים לבקשה רק כשקריאת יום 56 עוברת, והקוד מבקש את
   צעד 3 עכשיו — זו בדיוק שאלת שורה 29, והסעיף מראה את שני הצדדים (צעד 3 תחת "Asked now", והקריאה עם הפסיקה שלה) ולא
   מכריע.
5. **אימות Apify:** אין כאן שתי פסיקות סותרות. Q5 (28.9) הוא הפסיקה היחידה; `BOARD-LOOP.md:89-92, :210` ("deferred until
   ≥50 stranger users") קודם לו, ו-Q5 סעיף 4 אומר במפורש ש-BOARD-LOOP לא נכתב מחדש. לכן לא נגעתי ב-BOARD-LOOP, וגם לא
   ברשומות היסטוריות (`research/breadth/BREADTH-SWEEP.md:349`, `research/breadth/critic.json:40`,
   `research/breadth/verify/verdicts.json:788`, `research/channel-loop/scouts.json:35`, `research/owner-docs-audit/*`) —
   הן מתעדות את המצב לפני Q5.
6. **x402:** "לא פרוס" נשען על היעדר — אין workflow פריסה, אין בדיקת runner, אין כתובת. לא טענתי "פרוס" בשום מקום.
   `research/colony-sweep/BOARD.md:104` ("may stay deployed") הוא רשות של הדירקטוריון ורשומה — לא נגעתי.
7. **הדקות של צעד 6 לא כוללות את אימות Apify בחלק ג.** לא שיניתי אותן (שינוי דקות הוא פסיקה); נרשם כשאלה פתוחה.
8. **לחוט הראשי — טקסטים בקובצי לולאה שלא נגעתי בהם:**
   - `logs/CHANNEL_LOOP.md` §6, "Held, not asked": השורה "Apify KYC, until 50 stranger users;" סותרת את Q5 ואת השורה
     שאחריה ("Apify identity verification: at the Publish sitting only if the read shows no camera (Q5)"); הקריאה של 28.9
     כבר מצאה מסמכים בלבד, כך שהשורה הראשונה יורדת והשנייה יכולה לומר שהתנאי התקיים.
   - `logs/CHANNEL_LOOP.md` §6, הכותרת "about 30 minutes": הפריטים מסתכמים ב-35–40 (כמו שהמסמך העברי אומר עכשיו).
   - `logs/CHANNEL_LOOP.md` §0, תמצית המצב — עדיין הנוסח של סבב 39 (פריט 4 של "Queued 11.10"; לא חלק מה-build הזה).
   - `logs/CHANNEL_LOOP.md` §9 "Queued 11.10" — פריטים (1), (2), (3), (5) טופלו כאן; (4) לא.
   - `research/channel-loop/BOARD-LOOP.md:89-92, :210` — "deferred until ≥50 stranger users"; Q5 סעיף 4 קבע שלא כותבים
     אותו מחדש, ולכן נשאר.
9. **פער נוסף שראיתי ולא תיקנתי (בבעלות build אחר):** `portfolio.ts` (standby של x402) אומר "any USDC that arrives is
   booked through src/revenue/connectors/x402-local.ts", ו-`products/README.md` אומר שהוא עוד לא נרשם אוטומטית (שום קוד לא
   כותב שורת `[line:<id>]` לתשלום x402 נכנס). `src/revenue/connectors/*` שייך ל-build אחר, ולכן רק מדווח.

## 5. שגיאות וניסיונות שנכשלו

- **בסיס ישן** (`297a20b`): תוקן ב-`reset --hard` לפני כל קובץ, כמו שהבריף אומר.
- **בדיקת "צורה מגדרית" נכשלה** (`owner-steps.test.ts`, step 7 fence): בשורת העדכון של 11.10 כתבתי "כתוב עכשיו" (בינוני),
  והבדיקה מסננת את המילה "כתוב" בכל הטקסט מ"עודכן 4.10" עד תיבת ה-0 ₪. נוסח מחדש ("הוא", "עבר", "יצא").
- **רשומת מוטציה T69-S8 לא נמצאה בפעם הראשונה:** ה-find כלל "סלפי" שנמצא בשורה הבאה (שבירת שורה במסמך). קוצר ל-
  "**עצור אם** המסך מבקש".
- **פקודות שהסוכן המבודד סירב להריץ** (heredoc עם `cat >>` ומשתנה בנתיב של `node`): עברתי לסקריפטים בתיקיית ה-scratchpad
  ולנתיבים מלאים.
- **מוטנט ישן שרד:** T61-OS6 (הסרת "עצור אם" מחלק ד) שרד אחרי שחלק ג קיבל "עצור אם" משלו — השינוי שלי החליש בדיקה קיימת. תוקן בבדיקה (חלק ד נקרא לבד), והריצה החוזרת הרגה את כל ה-21.
- טקסט ראשון של שורת הקבוצה הקטנה כשאין צעד ("No further owner step: after them …") היה עקום; תוקן ל-"No owner step is
  left:" עם בדיקה.

## 6. בדיקות ופעולות ולידציה

- `scripts/verify.sh` על הבסיס `00d35bc`: יציאה 0 — typecheck 0, vitest 0: 81 קבצים, 2,958 עברו, 2 דולגו.
- `pnpm -s typecheck` אחרי כל שלב: יציאה 0.
- `npx vitest run owner-report owner-steps target-basis runner mutation-plans`: יציאה 0, 243 עברו.
- `node scripts/mutate.mjs --check --plan …/owner-report.json`: יציאה 0, 66 מתוך 66; `--check` על `owner-steps.json`:
  יציאה 0, 21 מתוך 21.
- `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan …/owner-report.json` (ב-`bc37f97`): יציאה 0, baseline עבר (5.0 שניות), **66 מתוך 66 נהרגו** (36 הישנים ו-T69-OR1..30), 0 שרדו; **388 שניות** כולל הקמת העץ, במקביל לתוכנית של owner-steps ולחלק מה-verify המלא.
- `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan …/owner-steps.json`: בריצה הראשונה (ב-`bc37f97`, 70 שניות) 20 מתוך 21 נהרגו — **T61-OS6 (מסבב 61) שרד**: חלק ג קיבל "עצור אם" משלו, והבדיקה של חלק ד קראה את כל צעד 6. הבדיקה חוזקה לקרוא את חלק ד עצמו (`c1b24af`), והריצה השנייה (ב-`c1b24af`): יציאה 0, **21 מתוך 21 נהרגו**, **107 שניות** כולל הקמת העץ, במקביל לתוכנית של owner-report ול-verify.
- `node scripts/owner-steps-pdf.mjs`: יציאה 0, 19 עמודים, 605,133 בתים; צילום המסך הראשון נקרא.
- `node --import tsx scripts/owner-report.ts --db <מסד מאותחל ב-scratchpad>`: יציאה 0; הסעיף נקרא בעין (§2 סעיף 5). גם על עותק של `state/colony/colony.db` ב-scratchpad (לא על המקור, כדי לא ליצור קובצי -wal/-shm ב-`state/colony/`): יציאה 0, אותה קבוצה קטנה.
- `scripts/verify.sh` ב-`c1b24af` (הקוד הסופי; היומן נוסף אחריו): יציאה 0 — typecheck 0, vitest 0: 81 קבצים, **2,984 עברו**, 2 דולגו (26 בדיקות חדשות מעל 2,958 של הבסיס; `frozen-citations.test.ts` בתוכם). הרצה נוספת אחרי קומיט היומן — ראה התשובה לחוט הראשי.
- grep לכתובות דוא"ל ולשמות מצד הבעלים בקבצים ששיניתי: אין.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **השוואת הדקות היא עכשיו בדיקה** (שני המסמכים העבריים, שתי הטבלאות, הסכומים). מה שעוד לא: §6 של
  `logs/CHANNEL_LOOP.md` ("about 30 minutes" בכותרת מול 35–40 בפריטים) — קובץ לולאה, ולכן לא נבדק כאן; בדיקה שמפרקת את
  §6 מול `ownerStepMinutes` תתפוס את זה בפעם הבאה.
- **"מה הקו מחכה לו"** נאסף בכל פעם מטקסטים של פסיקות; עכשיו הוא `LINE_PAYMENT_WAITS`, אבל הטקסטים שלו עדיין
  נכתבים ביד (עם המספרים מהקבועים). קריאת ה-D0 מ-`state/colony/page-view-clock.json` ומצב קריאת השבוע הרביעי מ-
  `algora-supply.json` לתוך הסעיף (ימים שנותרו) היא הצעד הבא.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת ההקשר (owner-steps, owner-report, portfolio, המסמך העברי, Q5, הפסיקות, FABLE_QUEUE שורה 29): הנתח הגדול, ~110K.
- הרצת ה-verify המלא פעמיים ותוכניות המוטציה: זמן, מעט אסימונים.
- הסירובים של הסוכן המבודד לפקודות עם heredoc/משתנים: ~5K על ניסוח מחדש.
- רשומת המוטציה ששברה על שבירת שורה, ובדיקת המגדר: ~3K.

## תיקונים אחרי הסקירה

הסוקר לא מצא שום BLOCKING, ומצא שבע הערות. תיקנתי חמש מהן ב-`d16749a`, ולא תיקנתי שתיים ועוד חצי של אחת. ההערות שלא
תיקנתי, ומה הסיבה:

**מה תיקנתי:**

- **הערות 1 ו-2 (x402):**
  - ב-`standby` של `portfolio.ts` היה כתוב שה-USDC "is booked through" ה-connector. עכשיו כתוב שהוא "is to be booked",
    ושעדיין שום דבר לא רושם אותו אוטומטית: `x402-local.ts` קורא רק שורות `transfer_in` עם תג `[line:<id>]`, ושום קוד לא
    כותב שורה כזאת.
  - אותו משפט תוקן גם ב-`docs/REJECTED.md`.
  - נוספה בדיקה ב-`target-basis.test.ts`. היא דורשת שהטקסט יגיד "NOT deployed" ולא יגיד "stays deployed" או "is booked
    through". היא גם בודקת את העובדות שהטקסט נשען עליהן: מבין קובצי ה-workflow, רק `products-ci.yml` מזכיר את
    `x402-il-api`, ואף קובץ ב-`src/` חוץ מהבדיקות לא כותב `type: "transfer_in"`.
- **הערה 5 (זהות בצעד 6):**
  - ל-`OwnerStepIdentity` נוסף השדה `partLines`, ונוספה הפונקציה `identityOnLine`. חלק ג של צעד 6 משרת רק את
    `apify-actors`.
  - צעד "part" שלא מונה שום קו נספר על כל קו, כדי שהדרישה לזהות לא תוצג לעולם כקטנה ממה שהיא.
  - כל צעד בדרך של קו מחזיק עכשיו גם `identityHere`.
  - בדרך של `il-biz-tools`, צעד 6 מודפס עכשיו כך: "identity check: no on this line (its identity part is for `apify-actors` only)".
  - בקבוצה הקטנה נשארו רק צעד 2 (yes) וצעד 3 (yes).
- **הערה 6 (סדר הצעדים, ושתי דרכים שכמעט שוות):**
  - `OWNER_STEP_ORDER_REVIEW` מזכיר עכשיו גם את פסיקת הרצפות מ-28.9, שורה 9 סעיף 3: צעדי השכבה בתשלום (2, 3 ו-6b)
    מצטרפים רק ב-PASS של הצפיות, ביום 56 או ביום 112. המספרים נלקחים מ-`PAGE_VIEW_GATES`.
  - השדה `closeBehind` מדפיס כל קו נוסף שמתחיל באותו גבול תחתון: "Close behind, at the same lower bound:
    `oss-bounties`, steps 2, 7, 4, 6, 108-148 min; the upper bound alone decides between them."
  - הסעיף עדיין לא בוחר בין שני הסדרים.
- **הערה 7, חלקים ב ו-ג:**
  - אם הקבוצה הקטנה היא של קו שלפי מסד הנתונים כבר לא מחכה לבעלים, היא אומרת זאת עכשיו.
  - הפסקה הפותחת של `docs/OWNER_STEPS.he.md` אומרת עכשיו "150–190 דקות בסך הכול (כ-2.5 עד 3 שעות)", במקום "בערך שעתיים
    וחצי". נוספה בדיקה שמשווה את המספר לקוד.
  - ה-PDF נוצר מחדש: יציאה 0, 605,227 בתים, 19 עמודים.
- **מוטציה ישנה שזזה:** הטקסט ש-T69-OR24 חיפש זז, ועכשיו הוא מחפש את `identityHere`. כדי שהמוטנט ייהרג, נוספה בדיקה
  שבה הקבוצה הקטנה כוללת צעד "part" (הדרך של `apify-actors` בלי פעולת הבעלים).

**מה לא תיקנתי:**

- **הערה 3 (ציטוטים שזזו):** `logs/FABLE_QUEUE.md` ו-`SITTING-2026-10-10-BRIEF.md` מוגנים, ולכן אני לא עורך אותם.
  רשימת המיקומים החדשים עוברת לחוט הראשי.
- **הערה 4:** השורה ב-§6 של `logs/CHANNEL_LOOP.md` היא בקובץ לולאה, ולכן היא עוברת לחוט הראשי.
- **הערה 7, חלק א:** המספרים 200 ו-10 של Apify נשארו כתובים ביד. `portfolio.ts` מחזיק אותם רק בתוך פרוזה, ובדיקה כבר
  מחייבת אותם להתאים לו. לגזור אותם מפרוזה היה גרוע יותר מהבדיקה.

**ולידציה:** כל התוצאות נשפטו לפי קוד היציאה.

- `pnpm -s typecheck`: יציאה 0.
- `mutate.mjs --check`: 77 מתוך 77 ב-`owner-report.json`, ו-29 מתוך 29 ב-`owner-steps.json`.
- `sim-tree.sh` עם `owner-steps.json`: יציאה 0. כל 29 המוטנטים נהרגו (21 ישנים ו-T69R-S1..8), אף אחד לא שרד, 149
  שניות.
- `sim-tree.sh` עם `owner-report.json`: יציאה 0. כל 77 המוטנטים נהרגו (66 ישנים ו-T69R-OR1..11), אף אחד לא שרד, 454
  שניות. שתי ההרצות רצו במקביל זו לזו ול-verify.
- `scripts/verify.sh` ב-`d16749a`: יציאה 0. ב-typecheck יציאה 0, וב-vitest יציאה 0: 81 קבצים, 2,989 בדיקות עברו ו-2
  דולגו. `frozen-citations.test.ts` כלול בהן.
- `scripts/owner-report.ts` על עותק של `colony.db`: יציאה 0. בקבוצה הקטנה עדיין `il-biz-tools`, עם צעדים 8, 2, 3 ו-6,
  ב-108–143 דקות.
