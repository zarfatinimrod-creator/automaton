# סבב 73 — קיפול פסיקה 12.10 שורה 29 (סדר הצעדים של הבעלים): צעד 3 מוחזק עד ה-PASS של יום 56, שורות טוקן מחכות לצעד שיוצר אותן, החלק המוקדם של צעד 6 אחרי צעד 8 — 12.10.2026

בונה (Opus) בעץ עבודה מבודד (`wt-row29`, ענף `build/tick73-row29-steps`), מ-`eb2da87` על `claude/new-session-j071dx`
(הקומיט של הפסיקה עצמה). בונה שני עבד במקביל על שורה 28 (`youtube-madeforkids.ts` ושכניו); לא נגעתי בקבצים שלו.

## 1. מה המשתמש ביקש

החוט הראשי (סבב 73) ביקש לקפל את `research/channel-loop/RULING-2026-10-12-owner-step-order.md` (ישיבת Fable של 12.10,
`logs/FABLE_QUEUE.md` שורה 29), פריטים 1–6 של "Folds for Opus":

1. `src/revenue/owner-steps.ts` — שום צעד לא נוסף/הוסר/מוספר מחדש/הוזז; `order` נשאר. צעד 3 מקבל `precondition`
   (ה-PASS של קריאת הצפיות של יום 56, או של יום 112 אחרי ההארכה, יחד עם צעד 2, `metOn` ביד); שורת סוד שהצעד שיוצר
   אותה (`madeIn`) לא בוצע לא נשאלת (`isSecretRowAsked`, `secretRowHoldReason`); `earlyPart.afterStep: "brand-mailbox"`;
   צעד 8 מקבל את `apify-actors`; `OWNER_STEP_ORDER_REVIEW` → `OWNER_STEP_ORDER_RULED`; הנוסח של "6b".
2. `owner-steps.test.ts` ותוכנית המוטציות שלו.
3. `docs/OWNER_STEPS.he.md` (והעתק מרונדר אם יש).
4. `src/revenue/runner.ts` (+ `runner.test.ts`, `mutations/colony.json`): שורת "Not asked yet" עם הסיבה, סעיף החלק המוקדם
   בשורת כל קו, ושומר ה-PASS (חוסם לחוט הראשי, לעולם לא בקשה מהבעלים).
5. `src/revenue/portfolio.ts`: פריט Apify אחרי צעד 8, פריטי Gumroad עם השער, הדבקת הטוקן רק אחרי צעד 3.
6. `src/revenue/owner-report.ts` (+ בדיקה ותוכנית מוטציות), ושורת התחזוקה ב-`docs/INCOME_PLAN.he.md`.

פריטים 7–8 (FABLE_QUEUE, CHANNEL_LOOP, CHECKPOINT) של החוט הראשי — לא נגעתי. סדר העבודה שנדרש: בדיקות קודם, בקומיט
לבד, עם יציאה שאינה 0 על הקוד הישן; אחר כך הקוד והמסמכים; מוטציות ב-`sim-tree.sh`; `verify.sh` ממוקד ומלא.

## 2. הפעולות המרכזיות שביצעתי

1. **הקמה:** `git worktree add … origin/claude/new-session-j071dx` — `eb2da87`, וקובץ הפסיקה קיים. `node_modules` קושר.
   הרצת בסיס של שלושת קובצי הבדיקה: יציאה 0, 178 עברו.
2. **קריאת הפסיקה במלואה** (551 שורות), ואחריה `owner-steps.ts` כולו, `owner-steps.test.ts`, `runner.ts`/`runner.test.ts`
   בחלקים הרלוונטיים, `owner-report.ts`/`owner-report.test.ts`, `portfolio.ts`, `page-views.ts` (השערים), והמסמך העברי.
3. **בדיקות קודם (קומיט `dc9146d`):** כל מה שהפסיקה מונה ב-Fold 2, 4, 6 — צעד 3 מוחזק עם `short`/`what`, `isSecretRowAsked`
   ו-`secretRowHoldReason`, `afterStep`, הקווים של צעד 8, `OWNER_STEP_ORDER_RULED`, סעיף החלק המוקדם, "Not asked yet",
   שומר ה-PASS (קריאה סינתטית ו-tick אמיתי), שורת הסדר והספירות בדוח הבעלים, והטקסטים העבריים. **הרצה על הקוד הישן:
   יציאה 1 — 35 נכשלו, 161 עברו (196).**
4. **הקוד והמסמכים (קומיט `d066899`):**
   - `owner-steps.ts`: הבלוק המתוארך של 12.10 (מילה במילה), שני הבולטים של `:54-59` בזמן עבר, `:142-144` בהתאם; ה-`unlocks`
     של צעד 8 עם המשפט על כתובת ההרשמה של Apify; `lines: ["apify-actors", "il-biz-tools"]`; ה-`precondition` של צעד 3
     (ה-`what` וה-`short` של הפסיקה; 56 ו-112 מוזנים מ-`PAGE_VIEW_GATES`, הטקסט זהה); `earlyPart` עם המשפט על תיבת המותג
     ו-`afterStep: "brand-mailbox"`; תיעוד השדה; `OWNER_STEP_ORDER_RULED` עם הטקסט של הפסיקה ותיעוד; "6b" = שורת הטוקן של
     Gumroad; `isSecretRowAsked(row, site, steps)`, `secretRowHoldReason`, ו-`steps` שעובר ב-`askedSecretRows`,
     `heldSecretRows`, `followUpSecretRows`, `heldFollowUpSecretRows`. `heldRows` ו-`secretRowsPastedBeforeMade` לא השתנו.
   - `runner.ts`: `earlyPartNote` (";step 6's early part, 8 min, may follow step 8" בסוף שורת כל קו שצעד 6 מבוקש בו);
     `heldSecretRowsNote` דרך `secretRowHoldReason`, השורות עם שער קודם ואז השורות שצעד אחר יוצר (`gatedRowsFirst`);
     `paidProductReadyBlockers` ונקודת הקריאה אחרי חוסמי שערי הצפיות.
   - `portfolio.ts`: Fold 5 מילה במילה.
   - `owner-report.ts`: `orderRuled`, הסיבות דרך `secretRowHoldReason`, הכותרת. `scripts/owner-report.ts`: משפט הכותרת.
   - `docs/OWNER_STEPS.he.md`: Fold 3 מילה במילה; ה-PDF חודש ב-`node scripts/owner-steps-pdf.mjs` (כמו בסבב 69):
     יציאה 0, 19 עמודים, 612,522 בתים; צילום המסך הראשון נקרא — RTL תקין, פסקת 12.10 מופיעה.
   - `docs/INCOME_PLAN.he.md` §6: "שמונה צעדים, בסדר שבקוד (פסיקות 7.9, 28.9 ו-12.10): 1 → 8 → 2 → 3 → 5 → 7 → 4 → 6" ו-"מיד
     אחרי צעד 8".
5. **תוכניות מוטציה:** `owner-steps.json` +29 (T73-OS1..29), `colony.json` +17 (T73-C1..17), `owner-report.json` +3
   (T73-OR1..3); חמש find הוזזו (T69-S2, T69R-S4, T64-OR14, T69-OR13, T69-OR15) כי הטקסט שהן מצאו השתנה בקיפול.
   `--check` על שלושתן: יציאה 0. הרצה מלאה בתוך `sim-tree.sh --dir …/row29-scratch/sim`, אחת אחרי השנייה — תוצאות בסעיף 6.

## 3. קבצים/מערכות ששונו

- `src/revenue/owner-steps.ts`, `src/revenue/runner.ts`, `src/revenue/portfolio.ts`, `src/revenue/owner-report.ts`,
  `src/revenue/types.ts` (הערת תיעוד בלבד: הדוגמה של `contextSteps`), `scripts/owner-report.ts` (הערת כותרת בלבד).
- `docs/OWNER_STEPS.he.md`, `docs/OWNER_STEPS.he.pdf`, `docs/INCOME_PLAN.he.md`.
- `src/__tests__/revenue/owner-steps.test.ts`, `runner.test.ts`, `owner-report.test.ts`.
- `src/__tests__/revenue/mutations/owner-steps.json`, `colony.json`, `owner-report.json`, `README.md` (רק השורות של שלוש
  התוכניות שלי).
- הלוג הזה. לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`,
  בפסיקות, ב-`research/measurements/`, ב-`state/colony/`, ולא בקבצים של שורה 28.

## 4. החלטות והנחות משמעותיות

**סיכות שהשתנו (ישן → חדש), עם המשפט של הפסיקה:**

שמונה-עשרה שהפסיקה מונה בעצמה (Fold 2, 4, 6) — `afterStep` `merge-pr` → `brand-mailbox` (§3(2)); הקווים של צעד 8
`["il-biz-tools"]` → `["apify-actors", "il-biz-tools"]` (§3(3)); `isOwnerStepOpen(gumroad)` true → false (§2(2)); il-biz-tools
`[8, 3, 6]` → `[8, 6]`; pcn874 `[3, 7, 6]` → `[7, 6]`; המוחזקים: il-biz-tools/pcn874 `["tax-file"]` → `["tax-file", "gumroad"]`;
הצעדים עם תנאי ממתין `["algora-stripe", "tax-file"]` → `["algora-stripe", "gumroad", "tax-file"]`; צעד 2 לבד: pcn874
`[2, 3, 7, 6]` → `[2, 7, 6]` ומוחזק `[]` → `["gumroad"]` (ומקרה שני: שניהם → `[2, 3, 7, 6]`); הכותרות; מחט התיבה `**צעד 3 —
חשבון Gumroad.**` + `**צעד 2 — …**` → `**צעדים 2 ו-3 — …**`; "ממתין לפסיקה" → "פסק ב-12.10"; `OWNER_STEP_ORDER_REVIEW` →
`OWNER_STEP_ORDER_RULED`; `contextSteps` של פריט Apify `[1]` → `[8]` (Fold 5); runner: pcn874 `3, 7, 6` → `7, 6` עם step 3
בסוגריים, il-biz-tools `8, 3, 6` → `8, 6`, החוסם של apify-actors `steps 6` → `steps 8, 6`; owner report: שורת הסדר, il-biz-tools
`[2, 5]` → `[2, 3, 5]`, apify-actors `[2, 6]` 78–113 → `[8, 2, 6]` 88–123 ("apify-actors' path becomes steps 8, 2, 6,
88-123 minutes"), ו-`withoutLater.smallest` בהתאם.

ואלה שהקיפול שינה בלי שהפסיקה מנתה אותם (כל אחד עובדה חדשה ואמיתית, לא החלשה):

- `owner-steps.test.ts` "names owner step 8 in the setup notes of every line it gates, first": לכל קו שצעד 8 חוסם, הפריט
  הראשון אמר "Open the brand mailbox (owner step 8)". apify-actors נוסף לקווים, ופריט ה-Apify שלו מונה את צעד 8 כהקשר
  (§3(3): "The apify-actors setup item names step 8 as context, not as its step"). הבדיקה דורשת עכשיו: הפריט הראשון מונה
  צעד 8; אם 8 הוא מצעדיו — הוא פריט התיבה; אחרת 8 ב-`contextSteps`.
- `:303` pcn874 פריט 2: `[[6], [5]]` → `[[6], [3, 5]]` — הטקסט של Fold 5 מוסיף "once step 3 is done", ובדיקת "no more, no
  fewer" דורשת שכל צעד שהטקסט מונה יהיה מקושר.
- "still tells the owner the Apify token may go in right after step 1" → "…right after step 8, with the brand mailbox"
  (§3(2); הטקסט החדש של `:75`).
- `askedSecretRows`/`heldSecretRows` על הרשימה האמיתית: `["GUMROAD…", "APIFY…", "BRAND…", "ORG…"]` → `["APIFY_TOKEN"]`
  (ועם הפרויקט: `["APIFY_TOKEN", "POSTHOG_READ_KEY"]`), והמוחזקות בהתאם (§2(5)). הסיכות הישנות נשמרו מילה במילה על רשימה
  סינתטית שבה צעדים 3 ו-7 בוצעו.
- runner: הסוף של שורת oss-bounties (`…sign-in\)$`), של הערת הדומיין הקפוא (`…2026\)$`), ושל apify-actors כשצעד 2 בוצע
  (`2, 6$` → `8, 2, 6; step 6's early part, 8 min, may follow step 8$`) — כי Fold 4 מוסיף את הסעיף בסוף השורה.
- runner `heldSecretRowsNote(["il-biz-tools"], { projectId: "12345" })`: `""` → שלוש שורות ה-`madeIn`, מילה במילה (§2(5)).
- owner report `heldSecretRows` עם הפרויקט: `[]` → שלוש שורות ה-`madeIn` עם הסיבה.
- owner report, ה-fixture `STEPS_DB`: הבדיקה "asks a step only for a line the database still has waiting" דורשת שיהיה צעד פתוח
  בלי קו מחכה. זה היה צעד 3; עכשיו הוא מוחזק. הוספתי `setHumanSetupDone("apify-actors")`, כך שצעד 8 (apify-actors,
  il-biz-tools) הוא הצעד הזה, ומפת המצבים בהתאם. שאר הבדיקות על אותו fixture לא השתנו.

**החלטות:**
- המשפט של `heldSecretRowsNote` מסדר שורות עם שער (`askedOnlyWhen`) קודם ואז שורות של צעד יוצר — כמו הדוגמה של הפסיקה
  (Fold 4: POSTHOG_READ_KEY ראשון) ובלי לשבור את הסיכה הקיימת `^Not asked yet: step 6's \`POSTHOG_READ_KEY\``.
  `heldSecretRows` עצמה נשארה בסדר הטבלה. אותו סדר בדוח הבעלים.
- `secretRowHoldReason` כששתי הסיבות חלות: שתיהן, הסיבה של השער קודם, מחוברות ב-", and " (פירוש של "the askedOnlyWhen
  reason first when both hold"; אין היום שורה כזאת).
- שומר ה-PASS: היום (56 או 112) נקבע לפי ממוצע שבועות 5–8 מול `passMinWeeklyAverage` (בדיוק התנאי של `reachRead`);
  התאריך — היום שבו נכתבה הקריאה של השבוע האחרון של הקריאה. הטקסט כפי שבפסיקה, "steps 2 and 3", גם אם רק אחד מהם עוד ממתין
  (הפסיקה: "while gumroad or tax-file has a pending precondition pushes one blocker").
- חוסם אחד לכל קו שעבר מבין הקווים של צעד 3.

**תוספות מעבר לטקסט של הפסיקה (כדי שבדיקה עומדת תישאר נכונה):**
- בסעיף של צעד 3 במסמך העברי הוספתי אחרי משפט הפסיקה את הציטוט של הדוח השעתי (`not asked now: step 3 …`), כמו בצעדים 2
  ו-4: הבדיקה העומדת "quotes, for each held step, exactly what the hourly report prints" דורשת אותו לכל צעד מוחזק.
- `contextSteps: [2]` בשני פריטי Gumroad ו-`[3]` (ב-pcn874 `[3, 5]`) בשני פריטי הדבקת הטוקן — הטקסטים של Fold 5 מונים את
  הצעדים האלה, ובדיקת "no more, no fewer" דורשת קישור.
- "append" של Fold 5 בוצע מילולית: בפריט של pcn874 הסיומת באה אחרי משפט הדומיין שבסוגריים.
- הערות בלבד: הדוגמה ב-`types.ts`, כותרת `scripts/owner-report.ts`, הערה בבדיקה.

**שאלות פתוחות לחוט הראשי:**
- `docs/OWNER_STEPS.he.md:14` (פסקת 28.9: צעד 8 "מבוקש עכשיו, מיד אחרי צעד 1") ו-`:121` (בתוך ה"בוצע" של צעד 1 מ-22.9:
  טוקן Apify "מותר מיד אחרי צעד 1") — לא ברשימת Fold 3, ולא נגעתי. `:121` כתוב בהווה וסותר עכשיו את `:75`.
- אם צריך, שומר ה-PASS יכול למנות רק את הצעד שעוד ממתין (היום הטקסט קבוע, "steps 2 and 3").
- פריט ה-Apify של apify-actors מונה את צעד 8 כהקשר בלבד (§3(3)), ולכן `openSetupItems` מוריד אותו כשצעד 6 בוצע גם אם צעד 8
  לא; שורת "Owner steps still open" של הקו עדיין מונה את 8. הבדיקה הישנה על "התיבה ראשונה בכל קו" נכתבה בדיוק נגד פער כזה
  ב-il-biz-tools.
- `state/colony/colony.db` שמור עם הטקסטים הישנים של הפריטים; `syncPortfolio` של הריצה המתוזמנת מביא את החדשים, ו-Actions
  כבוי — REPORT.md ימשיך להראות "8, 3, 6" עד ריצה.

## 5. שגיאות וניסיונות שנכשלו

- הרצה ראשונה אחרי הקוד: 3 נכשלו — ייבוא `PAGE_VIEW_KPI` מהמודול הלא נכון בבדיקה החדשה שלי (הוא ב-`page-views.ts`), והשתיים
  שבסעיף 4 (הדומיין הקפוא, `STEPS_DB`). תוקנו.
- find אחד בתוכנית `colony.json` (T73-C16) עם סוגר עודף; `--check` תפס, תוקן.

## 6. בדיקות ופעולות ולידציה

- בסיס לפני הכול: 3 קבצים, 178 עברו.
- בדיקות קודם על הקוד הישן (`dc9146d`): **יציאה 1**, 35 נכשלו / 161 עברו (196).
- אחרי הקוד: 3 הקבצים יציאה 0 (198 עברו); עם `mutation-plans`, `dashboard`, `target-basis`, `frozen-citations`, `colony-cli`,
  `page-views-reader`: 9 קבצים, 398 עברו, יציאה 0. `pnpm typecheck`: יציאה 0.
- מוטציות: בתוך `scripts/sim-tree.sh --dir …/row29-scratch/sim`, אחת אחרי השנייה, הקומיט `d066899`:
  - `owner-steps.json`: 58 רשומות, **כולן נהרגו**, 243 שניות (ליד ה-`verify.sh` הממוקד ואחר כך המלא).
  - `colony.json`: 59 רשומות, **כולן נהרגו**, 517 שניות (ליד ה-`verify.sh` המלא בכ-2 הדקות הראשונות).
  - `owner-report.json`: 80 רשומות, **כולן נהרגו**, 448 שניות (לבד).
  - שורות ה-README של שלוש התוכניות עודכנו (מספר רשומות, זמן מדוד, מה נוסף ואילו find הוזזו).
  - מוטציה שלא הוספתי: `followUpSecretRows` בלי `steps` — שקולה היום, כי `heldRows` נותן רק שורות עם `askedOnlyWhen`,
    ולאף אחת מהן אין `madeIn`.
- `scripts/verify.sh` ממוקד (`owner-steps`, `runner`, `owner-report`, `portfolio`, `frozen-citations` — `portfolio.test.ts`
  לא קיים, ו-vitest הריץ את הארבעה האחרים): **יציאה 0**, typecheck 0, 4 קבצים, 221 עברו. `scripts/verify.sh` מלא
  (`src/__tests__/revenue`): **יציאה 0**, typecheck 0, 85 קבצים, 3,172 עברו ו-2 דולגו (3,174), 220 שניות.
- `git diff eb2da87` נבדק לתבנית השם של הבעלים ולסימן ה-at: 0 שורות נוספות בכל אחת.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- הוספת רשומות לתוכנית מוטציה בלי לשכתב את כל הקובץ (שלוש התוכניות בשלושה סגנונות עיצוב) — כתבתי סקריפט Python חד-פעמי
  שמזיז find ומוסיף רשומות בטקסט; פקודה `mutate.mjs --add` הייתה חוסכת אותו בכל בנייה.
- "כל סיכה שנכשלה — האם הפסיקה מנתה אותה?" עשיתי ביד מול רשימת הפריטים של Fold 2/4/6; כלי שמשווה רשימת "line → expected"
  מתוך פסיקה לכשלונות של vitest היה מקצר.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הפסיקה (59KB) פעמיים בחלקים, וקריאת `owner-steps.test.ts` (1,570 שורות) בחלקים — הכרחי, אבל הגדול שבהם.
- שלוש הרצות של קובצי הבדיקה עד ירוק, והתראות רשימת המשימות של החוט הראשי שחזרו בכל כמה קריאות.

## תיקונים אחרי הסקירה

**הבסיס.** `origin/claude/new-session-j071dx` התקדם ל-`f082b52` (קומיט של קובצי הלופ בלבד: CHANNEL_LOOP ו-FABLE_QUEUE), ולכן
מוזג `--no-ff` ("merge base", `cb1c0f3`), בלי קונפליקט. לסקירה לא היה ממצא blocking; שלושה ממצאי fix (1-3) תוקנו, וארבעת
ה-notes (4-7) לא דרשו שינוי ונשארו פתוחים לחוט הראשי.

**ממצא 1 — מבחן הסדר קרא את השורה הלא נכונה.** `doc.match(/(\d(?:\s*→\s*\d){7})/)` מצא את הרצף הראשון, ומאז Fold 3 זה
תבליט הסדר שבתיבת ה-0 ₪ (`:70`), כך שהשורה של הדירקטוריון ("כפי שרשום בקוד:", `:78`, שה-Fold 2 אומר שהבדיקה ממשיכה לקרוא)
לא נבדקה. תוקן לפי טקסט ה-fix: `matchAll` של **כל** רצף חצים של ספרות, בכל אורך (לא רק שמונה, כדי שגם הסדר של שבעה צעדים
מ-7.9 ייתפס), כל אחד שווה ל-`ownerStepsInOrder()`, לפחות שניים, ובנוסף השורה של הדירקטוריון נמצאת לפי המילים שלה
("כפי שרשום בקוד: …"). מוטציות: T73R-OS1 (R-X1 של הסוקר), OS2 (סדר החצים בתבליט), OS3 (השורה של הדירקטוריון בסדר של שבעה
צעדים).

**ממצא 2 — שני טקסטים שעוד אמרו "מיד אחרי צעד 1".** `docs/OWNER_STEPS.he.md:126` (בהערת "בוצע" של צעד 1) ו-`products/README.md:7`
(שורת `apify-il-open-data`) — שניהם סותרים את §3(2) של הפסיקה. הסוקר הציע נוסח אנגלי חדש ("after step 8 (the Apify account
uses the brand mailbox)"); במקומו לקחתי את הנוסח של הפסיקה עצמה, כדי לא להמציא טקסט: בעברית — הנוסח של Fold 3 ל-`:75`,
"והוא מותר מיד אחרי צעד 8 (חשבון Apify נפתח עם תיבת המותג)."; באנגלית — הנוסח של Fold 5 ל-`portfolio.ts:229`, "(allowed straight
after step 8, with the brand mailbox as the account's address; **no KYC**)". שורה `:14` של המסמך ("צעד 8 … מבוקש עכשיו, מיד אחרי
צעד 1", 28.9) מדברת על צעד 8 ולא על Apify, והיא נכונה — לא נגעתי. גם הבלוקים המתוארכים ב-`owner-steps.ts` (`:34`, `:122`) הם
היסטוריה ונשארו. בדיקה חדשה, "never says the Apify half follows step 1", **נכשלה קודם**: יציאה 1, 1 נכשלה ו-111 עברו (112),
בעץ העבודה וגם שוב ב-`sim-tree.sh` על קומיט הבדיקות `e379706`. מוטציות: T73R-OS9 (המסמך), OS10 (ה-README). ה-PDF נוצר מחדש
(`node scripts/owner-steps-pdf.mjs`): 19 עמודים, 612,634 בייטים; העמוד הראשון נבדק בתמונה (מימין לשמאל), והטקסט שחולץ ממנו
מכיל "נפתח עם תיבת המותג" ו-0 סימני at.

**ממצא 3 — שלוש הפסקאות של Fold 3 היו מוצמדות רק בחלקן.** בדיקה חדשה מצמידה כל אחת מהן במלואה — הפסקה המתוארכת של 12.10,
פריט 5 המאוחד בתיבה ותבליט הסדר — אחרי השטחת קידומות ה-"> " של הציטוט והשבירות. שלושת הנוסחים בבדיקה הושוו בסקריפט למחרוזות
שנחתכו מקובץ הפסיקה: זהים. נוסף גם שהיום שבתיבה הוא היום של השער (`PAGE_VIEW_GATES.reachDay` ו-`.extensionDay`), לא מספר שהוקלד.
מוטציות: T73R-OS4 עד OS8 (R-X2 עד R-X6 של הסוקר).

**נכשל קודם (ממצאים 1 ו-3).** הבדיקות הקודמות לא נכשלו על המסמך הנכון, ולכן ההוכחה היא המוטציות: על `cb1c0f3`, לפני הבדיקות
החדשות, שבע מוטציות רצו ב-`sim-tree.sh` — **6 שרדו** (R-X1 עד R-X6) ואחת נהרגה (סדר החצים בתבליט, כי הבדיקה הישנה קראה אותו
ראשון). אחרי הבדיקות החדשות כולן נהרגות.

**תוכנית המוטציות.** `owner-steps.json` עלתה מ-58 ל-68 רשומות (T73R-OS1 עד OS10). `--check`: 68 מתוך 68 חלות. ריצה מלאה בתוך
`sim-tree.sh --dir …/row29-scratch/sim` על `1c9d1b3`, לבד: **68 מתוך 68 נהרגו**, 0 שרדו, 216 שניות כולל הקמת העץ. שורת ה-README
של התוכנית עודכנה (מספר הרשומות, הזמן, מה נוסף). `colony.json` ו-`owner-report.json` לא השתנו ולא הורצו שוב.

**ולידציה.**
- `scripts/verify.sh` ממוקד (`owner-steps`, `runner`, `owner-report`, `portfolio`, `frozen-citations`; `portfolio.test.ts` לא קיים):
  **יציאה 0**, typecheck 0, 4 קבצים, 223 עברו.
- `scripts/verify.sh` מלא: **יציאה 0**, typecheck 0, 85 קבצים, 3,174 עברו ו-2 דולגו (3,176), 97 שניות.
- הדיף כולו (בלי ה-PDF הבינארי) נבדק לתבנית השם של הבעלים ולסימן ה-at: 0 שורות נוספות בכל אחת.

**קומיטים.** `e379706` (הבדיקות לבד), `1c9d1b3` (המסמך, ה-README, ה-PDF ותוכנית המוטציות), והקומיט של הלוג הזה ושורות ה-README של
המוטציות.

**נשאר פתוח (notes של הסקירה, לא שונו).**
- ממצא 4: בצעד 3 במסמך מצוטטת שורת הדוח השעתי ("not asked now: step 3 …"), אבל `REPORT.md` ממשיך להציג "8, 3, 6" עד שסבב של
  המושבה ירוץ (Actions כבוי). הסיכום הבא לבעלים (Fold 8, של החוט הראשי) צריך לומר שהדוח מתעדכן רק אחרי הסבב הבא.
- ממצא 5: שומר ה-PASS ב-`runner.ts` מתעלם מ-`doneOn` ותמיד אומר "steps 2 and 3"; לפי הפסיקה כלשונה. אם החוט הראשי ירצה — לדלג
  על צעד שבוצע ולנקוב רק בצעד שעוד ממתין.
- ממצא 6: פריט ההגדרה של apify-actors מקשר את צעד 8 כהקשר בלבד (§3(3)), ולכן הוא יורד מהרשימה כשצעד 6 בוצע גם אם צעד 8 לא.
  נפסק כך; רק ישיבה עתידית יכולה לשנות.
- ממצא 7: קומיט הבדיקות של הבנאי (`dc9146d`) לא הכיל את כל הזזות הסיכות. בתיקונים האלה כל שינוי בבדיקה נכנס לקומיט הבדיקות.

**עבודה ידנית שחזרה על עצמה.** שוב סקריפט חד-פעמי להוספת רשומות לתוכנית מוטציה (הפעם ב-Node, כדי לשמור על צורת
`JSON.stringify(…, null, 2)`); `mutate.mjs --add` היה חוסך אותו. ובדיקת "נוסח הבדיקה = נוסח הפסיקה" נעשתה בסקריפט Python חד-פעמי;
עוזר בבדיקות שקורא את הנוסח ישירות מקובץ הפסיקה היה מבטל את הצורך.

**אסימונים.** הקריאה הגדולה הייתה קובץ הפסיקה (59KB), שנקרא בחלקים לפי מספרי שורות; ריצת מוטציות ראשונה שנכשלה מיד כי
`/usr/bin/time` לא קיים בקונטיינר (נמדד במקום זה ב-`date +%s`); והתראות רשימת המשימות של החוט הראשי שחזרו כמה פעמים.
