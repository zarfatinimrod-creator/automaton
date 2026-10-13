# סבב 73 של לולאת הערוצים — 12.10.2026, בניין Opus של קיפולי פסיקת שורה 28 (מדדים נגזרים של YouTube)

## 1. מה המשתמש ביקש
החוט הראשי של סבב 73 שלח בונה Opus אחד, ב-worktree `build/tick73-row28-mfk` (מבוסס על `eb2da87`), לקפל את
`research/channel-loop/RULING-2026-10-12-youtube-derived-metrics.md` (ישיבת Fable של 12.10, שורה 28 ב-FABLE_QUEUE):
קיפולים 1, 2, 3, 4 ו-7 מתוך "Folds for Opus" — מצב ה-made-for-kids כרשומת עובדות של המושבה עם `assertColonyFactsOnly`;
הערת ההריגה של K-mfk לפי מספר סידורי ולא ספירה; שורת הסיכום של סקריפט הקריאה-חזרה, בדיקת האינווריאנט לפני הכתיבה
ופסקת ה-WRITES; תיעוד `ExperimentState` ב-`publisher-guard.ts`; ושני המשפטים ב-`T1-PROTOCOL.md`. קיפולים 5, 6 ו-8 הם
בניינים מאוחרים, 9 ו-10 של החוט הראשי, 11 (ניקיון) רק אם בטוח לחלוטין. בדיקות קודם, אחר כך הקוד; תוכניות מוטציה ב-sim-tree;
`verify.sh` ממוקד ומלא; בלי לגעת בקבצי הלולאה, בפסיקות, ב-`state/colony/` ובקבצי בונה שורה 29 המקביל.

## 2. הפעולות המרכזיות שביצעתי
- **הכנה:** worktree ב-`eb2da87` (הפסיקה קיימת), קישור ל-node_modules; קריאת הפסיקה כולה, המודול, הסקריפט, הבדיקות,
  תוכנית המוטציה וה-README; ריצת בסיס של ארבעת קבצי הבדיקה — 176 עברו.
- **בדיקות קודם (`81e95cc`):** כתבתי מחדש את כל ליטרלי המצב בבדיקות לצורה החדשה; עטפתי את `mergeReadings` בקובץ הבדיקה
  כך שכל מצב שהבדיקות מייצרות נבדק באינווריאנט (הליכה עצמאית של הבדיקה, לא של המודול); הוספתי: `p2ClockAt` נשאר null
  לכל חיי הרשומה כשקריאת הייעוד הראשונה לא הייתה ציבורית; `lastPublicAt` מתרענן ו-`leftPublicAt` נקבע מה-`lastPublicAt`
  הקודם; `readbackOf` נותן את ההצהרה מ-`firstDesignationAt` לבדו; `assertColonyFactsOnly` זורק על מצב שמכיל "public"
  ועל כל עלה אחר שאינו עובדה של המושבה, ונוקב בנתיב ולא בערך; בדיקה ממצה על כל רצף של 1-3 ריצות מתוך 13 הקריאות שהמפענח
  יכול לתת, בשני הקווים (4,758 מצבים), שמשווה את התשובות לאורקל של הקוד שלפני הפסיקה (§2 החלטה 3: "behaviour-preserving");
  בסקריפט — שלוש המילים בשורת הסיכום, הקובץ הנכתב עובר את האינווריאנט, אף אחת מחמש המילים לא מודפסת כערך קריאה, וסירוב
  לכתוב מצב שאינו עובדות בלבד (יציאה 1, הקובץ נשאר כמו שהיה); פסקת ה-WRITES; בהערת ההריגה — `upload i of n`, בלי
  `N made-for-kids overrides`, המספרים הסידוריים המדויקים, גם כשהעקיפות לא צמודות. **הרצה על קוד הבסיס: exit 1** —
  קובץ `youtube-madeforkids.test.ts` נכשל כבר באיסוף (העטיפה זרקה על `firstRead.privacyStatus`, `first.madeForKids` ...),
  ושלוש בדיקות חדשות ב-`t1-made-for-kids-kill.test.ts` נכשלו (`expected '2 made-for-kids overrides by YouTube …' to match
  /upload \d+ of \d+/`).
- **הקוד (`1bfe615`):**
  - קיפול 1, `src/revenue/youtube-madeforkids.ts`: `UploadReadback` עם `firstReadAt`, `firstReadReturned`, `p1Api`,
    `firstDesignationAt`, `p2ClockAt`, `lastPublicAt`, `leftPublicAt`, `contradictedAt` (בסדר של הפסיקה); `unreadEntry`,
    `mergeReadings` (שדות כתיבה-פעם-אחת עם `??`, היציאה מציבורי נבדקת מול `lastPublicAt` הקודם, `p2ClockAt` נכתב רק במיזוג
    שכותב את `firstDesignationAt`), `readbackOf`, `stayedPublic`, `firstUploadWindow` כמו בהחלטה 3; `assertColonyFactsOnly`
    מיוצא; הכותרת והתיעוד של `stayedPublic` ו-`FirstUploadWindow` אומרים שהמצב לא מחזיק שום ערך של ה-API ולמה.
    `MadeForKidsReading` לא השתנה (רק התיעוד שלו: בזיכרון בלבד).
  - קיפול 2, `src/revenue/experiments.ts`: הערת K-mfk היא עכשיו
    `` `${overridden.map(of).join(", ")} read back the designation this line does not declare (YouTube's made-for-kids override, P-2): this channel's line is killed, not both YouTube lines — never a replacement channel` ``;
    משפט אחד נוסף בהערה של P-2 (הספירה היא כלל עצירה, לא נשמרת, לא מודפסת ולא מוצגת) ומשפט אחד בתיעוד של
    `madeForKidsReadback` (כל רשומה היא ההצהרה של הקו או רשומת העקיפה של המושבה, לעולם לא הערך הנוכחי של YouTube).
    `MADE_FOR_KIDS_OVERRIDES` והנעיצה שלו לא השתנו.
  - קיפול 3, `scripts/youtube-madeforkids-readback.ts`: שורת הסיכום מדפיסה `as-declared` / `contrary` / `unread`;
    `assertColonyFactsOnly(next)` לפני `writeFileSync`, ובכישלון — רישום ו-exit 1 בלי כתיבה; פסקת WRITES חדשה.
  - קיפול 4, `src/revenue/publisher-guard.ts`: תיעוד בלבד ל-`ExperimentState` (§3 החלטה 3); `READING_FIELDS` לא השתנה.
  - קיפול 7, `research/faceless-youtube/T1-PROTOCOL.md`: המשפטים של §5 נוספו, מילה במילה (נלקחו מהפסיקה בתוכנה, לא
    הוקלדו), בסוף שורה 122; בסוף פסקת Recording (שורה 139) נוסף "the readings are kept; the API field values behind them are
    not stored (ruling 12.10 row 28 §2)". מספר השורות בקובץ לא השתנה.
  - תוכניות מוטציה: `youtube-madeforkids.json` — 12 רשומות T61 הוסטו לשורות החדשות (SP4, FW2-FW4, FR1-FR6, FR8, FR9),
    15 רשומות T73 נוספו (שבע שהפסיקה מונה — RB1, P2C1, LP1, P1A1, FRA1, AF1, ו-SP1 הקיים — ועוד LPR1, CL1, AF2-AF5, W1-W3);
    `experiments.json` חדש (K1 צורת הספירה חוזרת, K2 בלי מספרים סידוריים, K3 `>=` → `>`, K4 מספור מ-0).
- **מוטציות (ב-`sim-tree.sh --dir .../row28-scratch/sim`, לבד):** `youtube-madeforkids.json` — 43 מתוך 43 נהרגו, 121 שניות;
  `experiments.json` — 4 מתוך 4, 18 שניות. שורות ה-README עודכנו (`6ac7d5c`).
- **verify:** ממוקד (ארבעת הקבצים) — exit 0, 186 עברו; מלא (`src/__tests__/revenue`) — exit 0, 85 קבצים, 3,164 עברו,
  2 דולגו (קודמים: `prize-apply-reading`, `narration-licence-gate`).

## 3. קבצים/מערכות ששונו
- `src/revenue/youtube-madeforkids.ts`, `scripts/youtube-madeforkids-readback.ts`, `src/revenue/experiments.ts`,
  `src/revenue/publisher-guard.ts` (תיעוד בלבד), `research/faceless-youtube/T1-PROTOCOL.md`.
- `src/__tests__/revenue/youtube-madeforkids.test.ts`, `src/__tests__/revenue/t1-made-for-kids-kill.test.ts`.
- `src/__tests__/revenue/mutations/youtube-madeforkids.json`, `src/__tests__/revenue/mutations/experiments.json` (חדש),
  `src/__tests__/revenue/mutations/README.md` (רק השורות של שתי התוכניות האלה).
- היומן הזה. לא נגעתי ב-CHECKPOINT, CHANNEL_LOOP, FABLE_QUEUE, MISSION, CLAUDE.md, בפסיקות, ב-`state/colony/`, ולא
  בקבצים של בונה שורה 29.

## 4. החלטות והנחות משמעותיות
1. **נעיצות שהשתנו (הערך הישן → החדש, והמשפט בפסיקה שמשנה אותו):** כל ההנחות על `firstRead`, `first` ו-`latest`
   (§2 החלטה 2: "`firstRead`, `first` and `latest` as whole readings: removed"; החלטה 3: "Every existing fixture's answers
   ... must hold with the fixtures' state literals rewritten to the new shape"):
   - `first.madeForKids === "false"` (העקיפה אחרי הקריאה הראשונה) → `firstDesignationAt === T0`;
   - `latest.madeForKids === "false"` (אחרי הערעור) → `lastPublicAt === T1R` — הייעוד של הערעור לא נשמר בשום מקום, לפי §2;
   - `first`/`latest` כקריאות שלמות → `firstDesignationAt`, `p2ClockAt`, `lastPublicAt`, `leftPublicAt`;
   - `firstRead` `{readAt, returned, privacyStatus}` → `{firstReadAt, firstReadReturned, p1Api}` בכל מקום (כולל המצב
     שנערך ביד `{returned: false, privacyStatus: "public"}` → `firstReadReturned: false, p1Api: false`, כי `p1Api` הוא
     "returned and public");
   - בבדיקת הסקריפט: `latest.privacyStatus` `["public", null, "private"]` → `lastPublicAt` ו-`[firstReadReturned, p1Api]`;
     `latest.readAt` → `firstReadAt`; נוספה העלאה רביעית (`kidsVid0002`, false) כדי ששלוש המילים יופיעו בשורה אחת
     (קיפול 3: "`:541-563` asserts the summary's three words").
   - כותרות של שלוש בדיקות שהזכירו `firstRead` ו-"privacyStatus null" עודכנו לשמות החדשים; אף הנחה על פסק דין לא השתנתה.
   - `MADE_FOR_KIDS_OVERRIDES` ו-`t1-made-for-kids-kill.test.ts:119-120` לא השתנו.
2. **`assertColonyFactsOnly` מחמיר מהרשימה של הפסיקה:** מחרוזת תחת `experiment` חייבת להיות שם קו, תחת `id` — מזהה
   וידאו, ובכל מקום אחר — זמן ISO שעובר הלוך-חזור. כל מצב שעובר אצלי עובר גם את האינווריאנט של הפסיקה; ההפך לא
   (למשל `p2ClockAt: "t1Video001"`). ההודעה נוקבת בנתיבים בלבד, לעולם לא בערך, כי הסקריפט מדפיס אותה.
3. **"the invariant holds on every state the fixtures produce"** מומש בשתי דרכים: עטיפה של `mergeReadings` בקובץ הבדיקה
   (כל מיזוג בקובץ נבדק), ובדיקה ממצה מול אורקל של הקוד הישן. האורקל הוא ההוכחה ש-§2 החלטה 3 שומרת התנהגות.
4. **הטקסט של ה-"..." בהערת ההריגה:** "(YouTube's made-for-kids override, P-2)". הורדתי את "(kill at 2)" מההערה — הסף
   אינו הספירה, אבל ההערה נשארת בלי שום מספר מלבד המספרים הסידוריים; הסף נשאר בקוד ובהערת ההסלמה ("a second override
   kills the line").

## 5. שגיאות וניסיונות שנכשלו
- פסקת ה-WRITES נשברה פעמיים בבדיקה שלי עצמי: "no value the API returned" ו-"as-declared, contrary or unread" נפלו על
  שבירת שורה; סידרתי את השורות.
- נתיב הפסיקה נשבר בין שתי שורות בהערות של `experiments.ts` ו-`publisher-guard.ts`; תוקן כך שהנתיב שלם בשורה אחת.
- `asserts state is MadeForKidsState` הוסר מהחתימה — האינווריאנט לא בודק צורה, וההכרזה הייתה שקר של טיפוס.

## 6. בדיקות ופעולות ולידציה
- כישלון-קודם: `npx vitest run` על שני קבצי הבדיקה בקומיט הבדיקות (`81e95cc`) — exit 1.
- `node scripts/mutate.mjs --check` על שתי התוכניות — 43/43 ו-4/4 "would apply".
- `scripts/sim-tree.sh --dir /tmp/claude-0/-home-user/ad9f6939-0ae8-504a-8945-82eb5f3c951c/scratchpad/tick73/row28-scratch/sim
  -- node scripts/mutate.mjs --plan ...` — `youtube-madeforkids.json`: 43 נהרגו, 0 שרדו, 121 ש' (בסיס 2.9 ו-3.4 ש');
  `experiments.json`: 4 נהרגו, 18 ש'. העץ הוסר בשתי הפעמים.
- `scripts/verify.sh` על ארבעת הקבצים — exit 0, 186 עברו; `scripts/verify.sh` מלא — exit 0, 3,164 עברו, 2 דולגו.
- `git diff` של כל קומיט נבדק לדפוס השם ולסימן ה-at — 0 שורות שנוספו בשניהם.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- הסטת 12 רשומות מוטציה ל-find חדש אחרי שינוי צורה: נעשה ב-Python חד-פעמי. כלי `mutate.mjs --repoint <id> --find
  --replace` שבודק ייחודיות ושומר את פורמט ה-JSON היה חוסך את זה ואת הסיכון לשבירת הפורמט.
- ספירת "כמה שורות זזו" בשביל הערות הסטייה — `brief-drift.mjs` עושה זאת לתדריכים; אין כלי שאומר לבונה אילו ציטוטי
  `file:line` בפסיקות זזו בגלל הקומיט שלו.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת הפסיקה (63KB) כולה — הכרחי, אבל הקריאה הראשונה דרך `cat` נחתכה ונקראה שוב ב-Read בשלושה חלקים.
- קריאת `youtube-madeforkids.test.ts` כולו (813 שורות) בשלושה חלקים לפני השכתוב — הכרחי לשכתוב הליטרלים.
- שתי ריצות נוספות של הבדיקות בגלל שבירות שורה בפסקת ה-WRITES (סעיף 5).
- הודעות התזכורת על רשימת המשימות של החוט הראשי חזרו כמה פעמים עם כל 85 המשימות — רעש בהקשר.

## שאלות פתוחות לחוט הראשי
1. §2 החלטה 4 אומרת שהקריאה-חזרה מדפיסה את שלוש המילים "and the kill or escalation names"; קיפול 3 מונה רק את שלוש
   המילים, והסקריפט לא מריץ את `evaluateExperiment` (אין לו שאר הקריאות). מימשתי את שלוש המילים בלבד.
2. קיפול 11 לא בוצע: שורה מתוארכת אחרי EX:545 מזיזה את EX:546-547, שהפסיקה עצמה מצטטת (`:223`, `:352`, `:536`) וגם
   `SITTING-2026-10-09-BRIEF.md:478`, `:579`. ב-`research/youtube-kids/KIDS-LINE.md` אין משפט קריאה-חזרה שמזכיר `first`
   או `latest` — אין מה לשנות שם.
3. הסטת מצביעים שהקומיט יוצר: ב-`experiments.ts` כל שורה מ-:50 זזה ב-+2 ומ-:283 ב-+4 (ספירת העקיפות :289 → :293,
   `MADE_FOR_KIDS_OVERRIDES` :210 → :212, K0/K3 :311-342 → :315-346 — שורת FABLE_QUEUE החדשה של קיפול 9 מצטטת את
   :311-342); `publisher-guard.ts` `ExperimentState` :46-51 → :46-63, `READING_FIELDS` :136-148 → :148-160; כל מצביעי
   המודול והסקריפט שבפסיקה זזו. הערה (a) של EX (`experiments.ts:289`) מצביעה עכשיו על שורה אחרת.
4. מומלץ להוסיף את `experiments.json` ו-`youtube-madeforkids.json` לרשימת התוכניות החובה ב-`mutation-plans.test.ts`
   (אף אחת מהן אינה ברשימה היום); לא נגעתי בה כדי לא להתנגש עם הבונה המקביל.
5. ההערה של googleapis.com ב-`terms-verdicts.json` עדיין אומרת "not decided here" — קיפול 8, בניין מאוחר.

## תיקונים אחרי הסקירה
הסקירה (Opus) לא מצאה ממצא חוסם; ממצא "fix" אחד וחמש הערות. תיקנתי את ממצא ה-fix בלבד, כפי שהמשימה מגדירה.

- **מיזוג הבסיס:** `git log HEAD..origin/claude/new-session-j071dx` הדפיס קומיט אחד (`f082b52`, קובצי הלולאה של
  ישיבת 12.10), ולכן מוזג ב-`--no-ff` (`ad11ba2`, "merge base"). הוא נוגע רק ב-`logs/CHANNEL_LOOP.md`
  וב-`logs/FABLE_QUEUE.md`, ולא נגעתי בהם.
- **הממצא (`scripts/youtube-madeforkids-readback.ts`):** `--now` עבר לכל חותמת זמן בלי בדיקה. האינווריאנט מקבל רק זמן
  שחוזר זהה מ-`toISOString()`, ולכן `--now` תקין בלי מילישניות (למשל `2027-03-11T06:00:00Z`) עשה את הקריאה החיה,
  ורק אחריה סירב לכתוב (exit 1).
- **מה שונה:**
  - פונקציה חדשה ומיוצאת, `runClock(now)`. היא מחזירה את `now` בצורת `toISOString()`, או `null` כשהערך אינו
    תאריך-שעה ISO 8601 עם אזור זמן (`Z` או `±hh:mm`) ביום קיים.
  - `runReadback` מסרבת לערך `null` ביציאה 2 ("nothing asked, nothing written"), וזה קורה לפני קריאת הקבצים ולפני כל
    fetch.
  - הזמן המנורמל עובר ל-`parseVideosList` ול-`mergeReadings` במקום `run.now`.
  - בכותרת נוסף משפט ב-USAGE, ולשדה `ReadbackRun.now` נוסף תיעוד.
- **סטייה מנוסח ה-fix, ולמה:**
  - **(א) המיקום.** הסקירה הציעה לבדוק "בראש `runReadback`, לפני שער התנאים". שמתי את הבדיקה אחרי שני השערים ואחרי
    בדיקת הקו, ליד בדיקת הארגומנט הקיימת. הכותרת מתעדת "Two gates … checked in this order", וטסט נועץ שהתנאים
    נבדקים לפני המפתח, ולכן לא הכנסתי בדיקה שלישית לפניהם. התכונה שהממצא דורש מתקיימת בכל מקרה: `--now` לא קנוני
    אף פעם לא מגיע ל-fetch.
  - **(ב) הקפדה.** נוסח ה-fix הוא `new Date(values.now).toISOString()` עם סירוב רק כשהתוצאה NaN, אבל Date.parse מקבל
    הרבה ערכים שגויים בשקט:
    - `"1"` נקרא כשנת 2001;
    - תאריך בלבד נקרא כחצות;
    - שעה בלי אזור נקראת באזור הזמן של המכונה;
    - יום שאינו קיים (`2027-02-30`) מתגלגל למרץ.
    כל אלה היו נכתבים כזמן שגוי של המושבה, ולכן `runClock` מסרבת להם. ערך ISO תקין בצורה אחרת (בלי מילישניות,
    בלי שניות, או עם היסט) מנורמל כפי שהממצא ביקש.
- **ההערות:** חמש ההערות של הסקירה אינן "blocking" או "fix", ולא בוצעו:
  - אין כינוי T73 ל-`>=` → `>`;
  - "(kill at 2)" הושמט מהערת ההריגה;
  - מצביעים זזו ב-`terms-verdicts.json:273` ובשורה של קיפול 9;
  - "kill or escalation names";
  - רשימת התוכניות החובה.
  הן נשארות לחוט הראשי, כמו שהסקירה כתבה.

**קומיטים:**
- `ad11ba2`: מיזוג הבסיס;
- `f775294`: הטסטים בלבד, ראשונים;
- `6b89804`: התיקון ו-T73F-N1 עד N12;
- קומיט שלישי: שורות ה-README והסעיף הזה.

**נכשל קודם:** על הקוד שלפני התיקון, `npx vitest run src/__tests__/revenue/youtube-madeforkids.test.ts` יצא ב-exit 1,
עם 2 טסטים שנכשלו ו-74 שעברו:
- טסט הנרמול נכשל ב-"`2027-03-11T06:00:00Z`: expected 1 to be +0". הקריאה נעשתה והכתיבה סורבה.
- טסט הסירוב נכשל ב-"expected 1 to be 2". הקריאה נעשתה.

**הטסטים החדשים (`youtube-madeforkids.test.ts`):**
- חמישה ערכי `--now` מנורמלים ונכתבים כ-`2027-03-11T06:00:00.000Z`, והרשומה כולה נבדקת ב-`toEqual`:
  - בלי מילישניות;
  - בלי שניות;
  - `+02:00`;
  - `-05:00`;
  - הצורה הקנונית עצמה.
- אחד-עשר ערכים מסורבים ביציאה 2, בלי קריאה ובלי קובץ.

**מוטציות:** `youtube-madeforkids.json` גדלה מ-43 ל-55 רשומות, עם T73F-N1 עד N12. הן מכסות:
- את הסירוב;
- את הזמן המנורמל ב-parse וב-merge;
- את האזור: חובה, שני הסימנים, והנקודתיים;
- את השניות כאופציונליות;
- את סירוב התאריך בלבד;
- את בדיקת היום ואת החודש שלה;
- את בדיקת ה-NaN;
- את ערך ההחזרה המנורמל.

`node scripts/mutate.mjs --check` הראה ש-55 מתוך 55 חלות. הריצה בתוך
`scripts/sim-tree.sh --ref HEAD --dir …/row28-scratch/sim`, לבדה: 55 מתוך 55 נהרגו ב-139 שניות. שתי ריצות הבסיס
לקחו 2.3 ו-2.1 שניות. העץ הוסר לאחר ההצלחה. שתי שורות ה-README של התוכנית עודכנו; בשורות אחרות לא נגעתי.

**ולידציה:**
- `scripts/verify.sh` על ארבעת הקבצים יצא ב-exit 0: typecheck 0, ו-188 מתוך 188 טסטים עברו (לפני כן היו 186).
- `scripts/verify.sh` המלא יצא ב-exit 0: 85 קבצים, 3,166 עברו ו-2 דולגו (לפני כן 3,164).
- בדיפ אפס שורות נוספות עם תבנית השם ואפס שורות עם סימן ה-at.

**הסטת מצביעים בסקריפט:**
- שורות הסקריפט מ-:43 זזו ב-+2, ומ-:115 (`type FetchLike`) ב-+21.
- `assertColonyFactsOnly(next)`: :195 → :225.
- שורת המילים של הסיכום: :205 → :235.
- `main`: :213 → :243.

**פתוח:** אין דבר חדש מעבר לשאלות הפתוחות שלמעלה ולחמש ההערות.

**אסימונים:** עלות קטנה. ריצת המוטציות (כ-140 שניות) והאימות המלא (כ-100 שניות) רצו פעם אחת כל אחת.
