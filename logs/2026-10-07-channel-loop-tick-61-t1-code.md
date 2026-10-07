# טיק 61 (7.10.2026) — קיפולי הקוד של פסיקה 7.10 שורה 24: `firstUploadWindow()` הוא `t1Passed`, השעון של `stayedPublic()`, ושער התנאים של googleapis.com בסקריפט ה-read-back

בונה Opus, ב-worktree נפרד על הענף `build/tick61-t1-code` (בסיס: `origin/claude/new-session-j071dx` ב-`692e905`, הקומיט של הפסיקה). לא
נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, בפסיקות, ב-`SITTING-*`, ב-`research/measurements/*`,
ב-`terms-verdicts.json` או בקובץ קיים כלשהו תחת `logs/`. לא הרצתי `git fetch`, `git pull`, `git push`, `gh`, חיפוש או fetch ברשת. לא
עשיתי push; ה-worktree נשאר ל-`scripts/merge-worktree.sh` של ה-thread הראשי.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש (משימה מחושבת של workflow, לא הודעת בעלים) את קיפולים 2, 3 ו-4 מרשימת "Folds for Opus" של
`research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md` (§4 החלטות 1-3, §2 החלטה 2 לשער; §3 שייך לבונה התיעוד):

1. **קיפול 2** — ב-`src/revenue/youtube-madeforkids.ts`: משפט אחד בתיעוד של `stayedPublic()` (השעון מתחיל בקריאת הייעוד הראשונה, שנלקחת
   באותה ריצת colony כמו תשובת המפרסם, ולכן אף פעם לא מוקדם ולכל היותר ריצה אחת מאוחר; קריאה בלי ייעוד לא מתחילה אותו);
   `firstUploadWindow(entry, publisherAccepted, p3, p4, hours = 72)` והטיפוס `FirstUploadWindow` בדיוק כמו §4 החלטה 3, טהורה, בלי I/O. בבדיקות:
   ה-fixture החסר (קריאה `public` ש-`madeForKids` שלה null, ואחריה קריאות `public` 72 שעות אחר כך → null; עזיבה אחריה → false), ו-describe
   של `firstUploadWindow` שמכסה true/false/null לכל קריאה, את שלוש התשובות של `passed`, ו-`entry` null.
2. **קיפול 3** — ב-`src/revenue/experiments.ts`, הערת התיעוד בלבד: `t1Passed` הוא `firstUploadWindow(...).passed`, עם שם הפסיקה. הצמדות
   ב-`experiments.test.ts:135` וב-`kids-explainers-kills.test.ts:73`, וההערה ב-`experiments.ts:246` (שנבדקת ב-`kids-explainers-kills.test.ts:178`)
   לא משתנות — להריץ את הבדיקות כדי להוכיח.
3. **קיפול 4** — ב-`scripts/youtube-madeforkids-readback.ts`: `FetchLike` מקבל `redirect?: "error"` והקריאה מעבירה אותו; סירוב שלישי (exit 2)
   כש-`research/channel-loop/terms-verdicts.json` אין בו רשומת `googleapis.com` שה-verdict שלה ב-`ACTIVE_VERDICTS` כפי ש-`scripts/queue-zero-test.mjs`
   מגדיר (קריאת הקובץ כמו `brand-check.mjs:58-64`, נכשל סגור על קובץ חסר או לא קריא); הכותרת נוקבת בשני השערים. בבדיקות: סירוב עם fixture
   בלי הרשומה, עם `CONDITIONAL_UNMET`, ושעם `NOT_BARRED` שער המפתח בא אחריו; ושה-init של ה-fetch נושא `redirect: "error"`.
4. תוכנית מוטציות חדשה `src/__tests__/revenue/mutations/youtube-madeforkids.json` (לפחות ה-`>=` וה-`!== null` של `stayedPublic()`, כל ענף false
   של `firstUploadWindow()`, וענף הרשומה החסרה של השער), `--check`, הרצה בתוך `scripts/sim-tree.sh`, ושורה ב-README עם זמן הריצה שנמדד.
5. `scripts/verify.sh` ממוקד (youtube-madeforkids, experiments, kids-explainers-kills, mutation-plans, brand-check) ואחריו מלא, שניהם exit 0 לפני
   הקומיט.

## 2. הפעולות המרכזיות שביצעתי

1. יצרתי את ה-worktree כפי שנכתב; `git log --oneline -1` הראה `692e905` (הקומיט של הפסיקה), `ls products/ src/revenue/` לא ריק, ו-`692e905`
   אב של HEAD — לא היה צורך ב-reset. קישור `node_modules`, ותיקיית scratch בנתיב שנקבע.
2. קראתי את הפסיקה כולה (656 שורות), ואת הקבצים בשלמותם: `youtube-madeforkids.ts` (175), `youtube-madeforkids-readback.ts` (163),
   `youtube-madeforkids.test.ts` (390), תיעוד `ExperimentReadings` ב-`experiments.ts`, `brand-check.mjs:1-120`, ו-`queue-zero-test.mjs` סביב
   `ACTIVE_VERDICTS` (`:100-128`) ו-`termsGate`/`verdictGate` (`:215-250`). הרצת בסיס של שלושת קבצי הבדיקה: 87 בדיקות עוברות.
3. **`youtube-madeforkids.ts`**: שלוש שורות נוספו לתיעוד של `stayedPublic()` (`:170-172`), עם הפניה ל-§4 החלטות 1-2. אחרי הפונקציה:
   הממשק `FirstUploadWindow` (`p1`, `p2`, `p3`, `p4`, `passed`, כל אחד `boolean | null`) והפונקציה `firstUploadWindow()` (`:206-224`):
   `p1` = false אם `publisherAccepted === false`, או אם `entry.first` אינו null ו-`privacyStatus` שלו אינו `"public"`; true אם
   `publisherAccepted === true` ו-`entry.first.privacyStatus === "public"`; אחרת null. `p2` = `stayedPublic(entry, hours)`, ו-null כש-`entry` null.
   `passed` = false אם אחת הארבע false; true אם כל הארבע true; אחרת null. כל ענף בשורה משלו, כך שכל ענף false הוא מוטציה בפני עצמה.
4. **`experiments.ts`**: ארבע שורות בתיעוד של `t1Passed` (`:28-30`), בלי שינוי אחר בקובץ.
5. **`youtube-madeforkids-readback.ts`**:
   - ייבוא `ACTIVE_VERDICTS` ו-`isRobotsOkVerdict` מ-`./queue-zero-test.mjs` (עם `@ts-expect-error`, כמו ייבוא `render-watch.mjs` בבדיקה), כך שיש
     הגדרה אחת ולא עותק.
   - `TERMS_VERDICTS` (הנתיב במאגר), `API_TERMS_SITE = "googleapis.com"`, `readTermsVerdicts(path)` (כמו `brand-check.mjs:58-64`: JSON או null),
     ו-`apiTermsGate(verdicts)` שמחזיר `{ ok, verdict, why }`: לא קריא → "the terms verdicts are missing or unreadable"; בלי רשומה → "there is no
     googleapis.com entry"; verdict לא פעיל → "googleapis.com is <verdict>, not one a call may run under".
   - `ReadbackRun` מקבל `verdictsPath` (חובה); `runReadback` בודק את שער התנאים **לפני** שער המפתח (§2 החלטה 2 ו"with NOT_BARRED the key gate
     applies next"), וההודעה נוקבת בקובץ ובפסיקה. `main()` מעביר `TERMS_VERDICTS` ואין דגל שורת פקודה שמחליף אותו.
   - `FetchLike` מקבל `redirect?: "error"`, והקריאה היא `{ signal: AbortSignal.timeout(30_000), redirect: "error" }`.
   - הכותרת (`:21-30`): "Two gates, each a refusal (exit 2) …", בסדר שלהם, עם הפסיקה, ו-`redirect: "error"`.
6. **בדיקות** (`youtube-madeforkids.test.ts`, 33 → 57 בדיקות):
   - בתוך ה-describe של מצב הניסוי: "a public read that carried no designation does not start the clock" — קריאה `public` עם `madeForKids` null
     ב-0, קריאות כאלה ב-72 וב-144 → null; עזיבה ל-`private` ב-80 → false; קריאה עם ייעוד ב-96 נעשית `first`, ב-167 → null, ב-168 → true (72 שעות
     ממנה, לא מהקריאה הלא-מיועדת).
   - describe חדש, `firstUploadWindow` (13 בדיקות): P1 true/false (שני הענפים, private ו-unlisted)/null (כל אחד מהחצאים חסר, רשומה שלא נקראה,
     קריאה לא מיועדת, סרטון שלא הוחזר); P2 true/false/null ו-null בלי רשומה, ושווה ל-`stayedPublic(entry, 72)` על חמש רשומות; ברירת המחדל 72
     (71 → null, 72 → true) ו-`hours` של הקורא; P3 ו-P4 עוברים כמו שהם בשלושת הערכים; `passed` true, false לכל אחת מהארבע, null לכל אחת מהארבע;
     `entry` null; טהרה (`structuredClone` לפני ואחרי); וש-false שלו הוא K-T1 בקו של T1 ו-K-T1k בקו הילדים.
   - ב-`setup` של הסקריפט: קובץ verdicts (ברירת מחדל `NOT_BARRED`) נכתב לתיקייה הזמנית, ה-init של כל fetch נשמר; לשמונה הקריאות הקיימות
     ל-`runReadback` נוסף `verdictsPath: s.verdictsPath` — אף assertion קיים לא שונה.
   - ב-"no live call before Stage A": שהכותרת נוקבת בשני השערים.
   - describe חדש, "the terms gate" (9 בדיקות): בלי רשומת googleapis.com (עם github.com פעיל ו-youtube.com BARRED לידה) → 2, אין בקשה, אין קובץ;
     `CONDITIONAL_UNMET`, `BARRED`, `TERMS_PENDING`, `NO_TERMS`, `UNKNOWN` → 2; קובץ חסר, JSON שבור, `null`, `sites: null`, בלי `sites` → 2;
     `NOT_BARRED` ו-`CONDITIONAL_MET` בלי מפתח → הודעת המפתח (ולא הודעת התנאים), ועם מפתח → 0 וקריאה אחת; בלי שניהם → הודעת התנאים; כלל
     `NO_TERMS_ROBOTS_OK` (ידני נדחה, של `robots-verdict.mjs` מתקבל), רשומת `www.googleapis.com` לא נחשבת, רשומה בלי verdict; `redirect: "error"`
     ו-`signal` ב-init; הפניה שנדחתה (fetch שזורק) → 1, נרשמת בלוג, שום קובץ; והקובץ המחויב היום — `TERMS_VERDICTS` הוא הנתיב במאגר, אין בו
     רשומה פעילה, והסקריפט עצמו (`node --import tsx`, עם מפתח מזויף ו-`--videos` לנתיב שלא קיים, כך שלעולם אין קריאת רשת) יוצא ב-2.
7. תוכנית מוטציות של 19 רשומות (T61-SP1..SP4, T61-FW1..FW8, T61-TG1..TG7); `--check` 19 מתוך 19; הרצה ב-sim-tree אחרי הקומיט הראשון.
8. שורה בכל אחת משתי הטבלאות ב-`mutations/README.md` (התוכנית, וזמן הריצה שנמדד).

## 3. קבצים/מערכות ששונו

- `src/revenue/youtube-madeforkids.ts` — תיעוד `stayedPublic()`; `FirstUploadWindow`, `firstUploadWindow()` (175 → 224 שורות).
- `src/revenue/experiments.ts` — תיעוד `t1Passed` בלבד (+4 שורות).
- `scripts/youtube-madeforkids-readback.ts` — שער התנאים, `redirect: "error"`, הכותרת (163 → 217 שורות).
- `src/__tests__/revenue/youtube-madeforkids.test.ts` — 24 בדיקות חדשות, `verdictsPath` בשמונה קריאות (390 → 690 שורות).
- `src/__tests__/revenue/mutations/youtube-madeforkids.json` — חדש, 19 רשומות.
- `src/__tests__/revenue/mutations/README.md` — שתי שורות.
- `logs/2026-10-07-channel-loop-tick-61-t1-code.md` — הקובץ הזה.

קומיטים על `build/tick61-t1-code`: `71decf4` (הקוד, הבדיקות, התוכנית), והקומיט השני (שורות ה-README והיומן הזה).

## 4. החלטות והנחות משמעותיות

1. **סדר השערים**: תנאים, אחר כך מפתח, אחר כך הקו. הפסיקה כותבת "with NOT_BARRED the key gate applies next", ולכן שער התנאים ראשון; בדיקה
   (בלי שניהם → הודעת התנאים) ומוטציה (T61-TG6) מחזיקות את הסדר.
2. **"ב-`ACTIVE_VERDICTS` כפי ש-`queue-zero-test.mjs` מגדיר"**: התיעוד של הקבוע עצמו (`:106-109`) אומר ש-`NO_TERMS_ROBOTS_OK` נחשב רק כש-
   `isRobotsOkVerdict` אומר ש-`robots-verdict.mjs` קבע אותו, ו-`verdictGate` (`:245`) קורא כך. השער כאן קורא בדיוק כך — אותה שורה, לא מחמיר
   ולא מקל ממנה. זו קריאה של ההגדרה, לא פסיקה; אם ה-thread הראשי רוצה רק את `ACTIVE_VERDICTS.has(...)`, זו שורה אחת ומוטציה אחת (T61-TG4).
3. **המפתח המדויק `googleapis.com`**: הפסיקה מורה על "a `terms-verdicts.json` entry for `googleapis.com`", והרשומות בקובץ ממופתחות לפי אתר
   (`siteOf`), לא לפי host. רשומת `www.googleapis.com` לא נחשבת (בדיקה).
4. **`verdictsPath` חובה ב-`ReadbackRun`, בלי דגל CLI**: דגל שמצביע לקובץ אחר היה דרך לעקוף את השער מהשורה בשורת פקודה של workflow; `main()`
   מעביר רק את `TERMS_VERDICTS`.
5. **ייבוא ולא העתקה** של `ACTIVE_VERDICTS`: הגדרה אחת. הייבוא מושך גם את `capture-check.mjs` ו-`render-watch.mjs`; לשלושתם שומר main (`argv[1]`),
   כך שאין תופעות לוואי. הסקריפט לא נבדק ב-`pnpm typecheck` (`tsconfig.json` כולל רק `src/**`, בלי `__tests__`); בדקתי אותו, את המודול ואת
   קובץ הבדיקה ב-`tsc` עם tsconfig זמני בתיקיית ה-scratch: exit 0, כלומר ה-`@ts-expect-error` בשימוש (בלעדיו TS7016).
6. **הצמדה של עובדה של היום**: הבדיקה "the committed verdicts hold no active googleapis.com entry today" תיכשל ביום שקיפול 5 (קריאת התנאים
   ב-github) יכתוב רשומה פעילה — בכוונה, כמו ה-assertion "no workflow" (`:539-545` עכשיו), שהפסיקה אומרת שיתחלף "into an assertion of the gate"
   בקיפול שמחבר את הריצה. ההרצה של הסקריפט בבדיקה מעבירה `--videos` לנתיב שלא קיים, כך שגם אז היא יוצאת ב-0 בלי קריאה.
7. **פער בין §1 החלטה 1 ל-§4 החלטה 3 (לא הוכרע כאן)**: §1 אומרת ש"A first read that is not `public` — `private`, `unlisted`, or null because the
   video was not returned — fails P1". §4 החלטה 3 מגדירה את `p1` דרך `entry.first`, שהיא קריאת **הייעוד** הראשונה; קריאה שבה הסרטון לא הוחזר
   (או שה-status שלה בלי `madeForKids` בוליאני) אינה קריאת ייעוד ולא נעשית `first`, ולכן `p1` נשאר null ולא false. מימשתי את §4 החלטה 3
   כלשונה, כפי שהתבקשתי. התוצאה לעולם אינה מעבר (`passed` null), ו-§4 החלטה 1 אומרת ש-null אחרי החלון הוא תקלת מכשיר תחת KILL-1 — אבל
   ה-P1 נקרא null ולא false. לתור של ה-thread הראשי, אם צריך פסיקה.
8. **"A non-null value means at least one upload exists"** (`experiments.ts:26`, לא שונה): `firstUploadWindow(null, false, …).passed` הוא false גם
   כשאין העלאה (המפרסם סירב). אז `experiments.ts:267` (היה `:263`; `madeForKidsReadback.length === 0 && t1Passed !== null ? [null]`) יוסיף K-mfk-unmeasured
   ליד הריגת K-T1. הריגה קורית ממילא; המשפט בתיעוד פשוט לא מדויק למקרה הזה. קיפול 3 הוא תיעוד בלבד ("nothing else in the file"), ולכן לא
   נגעתי — שאלה פתוחה.
9. **`mutation-plans.test.ts` לא שונה**: הוא לא ברשימת הקבצים שלי. ה-`describe.each` שלו מריץ `--check` על כל תוכנית בתיקייה, כולל החדשה;
   רק הרשימה של "has a plan for each script" לא מזכירה אותה. אפשר להוסיף בקיפול הבא.
10. **הודעת הפניה שנדחתה**: עם `redirect: "error"` ה-fetch של Node דוחה את ה-promise (לפי מה שידוע לי `TypeError: fetch failed` עם הסיבה ב-`cause`; inference, לא נבדק כאן, כי אין כאן קריאת רשת), וה-catch הקיים כותב
    "fetch failed — nothing written" ויוצא ב-1. לא הוספתי את ה-`cause` להודעה (מעבר למפרט); ההפניה נדחית ונרשמת, כמו שהפסיקה דורשת.
11. **הפניות (pointer drift)**: כל ההפניות של הפסיקה לקבצים שלי תאמו את HEAD (`youtube-madeforkids.ts:165-175`, `experiments.ts:23-28` ו-`:246`,
    `youtube-madeforkids-readback.ts:21-23`, `:60`, `:72-81`, `:103`, `youtube-madeforkids.test.ts:209`, `:374-390`, `:377-383`, `brand-check.mjs:58-64` ו-`:70-74`,
    `queue-zero-test.mjs:110`). `experiments.test.ts:135` ו-`kids-explainers-kills.test.ts:73` הן שורות הקבועים המוצמדים (ה-expect ב-`:131` וב-`:65`) —
    עקבי עם "the pins". העריכות שלי הזיזו: `!== null` של `stayedPublic()` מ-`:172` ל-`:175`, ה-`>=` מ-`:174` ל-`:177`; הערת K-T1k מ-`experiments.ts:246`
    ל-`:250` (התוכן לא השתנה); ה-assertion "no workflow" מ-`youtube-madeforkids.test.ts:377-383` ל-`:539-545`.

## 5. שגיאות וניסיונות שנכשלו

1. בדיקה אחת נכשלה בהרצה הראשונה: עזר `after()` בלי קריאות החזיר `videos[0]` של מצב ריק (undefined), ו-`stayedPublic` זרק. זה היה באג בבדיקה,
   לא בקוד; החלפתי ברשומה מפורשת שלא נקראה (`first: null, latest: null, …`).
2. **מעידה שלי**: בפקודת ה-`tsc` הוספתי בטעות `git stash list` (פקודת קריאה בלבד, בלי פלט, שלא יצרה ולא שלפה שום stash). הכלל אוסר להריץ
   `git stash` מכל סוג; זו הפרה של הכלל ככתבו, בלי נזק. נרשם כאן כדי שלא יוסתר.
3. ניסיון לחכות ל-verify המלא ב-`sleep 240` נחסם על ידי הסביבה; עברתי ללולאת `until` שמחכה לשורת הסיום.

## 6. בדיקות ופעולות ולידציה

- בסיס לפני שינוי: `npx vitest run` על youtube-madeforkids, experiments, kids-explainers-kills — exit 0, 87 בדיקות ב-3 קבצים.
- `tsc` זמני על הסקריפט, המודול וקובץ הבדיקה — exit 0.
- `scripts/verify.sh` ממוקד (youtube-madeforkids, experiments, kids-explainers-kills, mutation-plans, brand-check) — typecheck exit 0, tests exit 0,
  5 קבצים, 172 בדיקות. כולל ההצמדות: `PINNED_GATES_SHA256` (`experiments.test.ts:135`, ה-expect ב-`:131`), `KIDS_PINNED_SHA256`
  (`kids-explainers-kills.test.ts:73`, ה-expect ב-`:65`) ו-"never a fetch of the watch page" (`:178`) — עוברות בלי שינוי.
- `scripts/verify.sh` מלא (`src/__tests__/revenue`) — typecheck exit 0, tests exit 0, 80 קבצים, 2814 עוברות ו-2 מדולגות (שתיהן קיימות, ב-
  `prize-apply-reading.test.ts` וב-`narration-licence-gate.test.ts`); 07:50:28 עד 07:52:50 UTC.
- `node scripts/mutate.mjs --check --plan src/__tests__/revenue/mutations/youtube-madeforkids.json` — exit 0, "19 of 19 would apply".
- `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan …` על `71decf4` — exit 0, "19 applied: 19 killed, 0 survived, 0 killed?, 0 timeout; 0 not
  applied; 0 not run", 75 שניות כולל הקמת העץ, לבד; העץ הוסר.
- לפני הקומיט השני (ה-README והיומן): שוב `verify.sh` ממוקד (exit 0, 5 קבצים, 172) ומלא (exit 0, 80 קבצים, 2814 ו-2 מדולגות).
- grep של כל ה-diff לדפוס השם (מוקלד מחובר): 0 שורות; grep לכתובות דוא"ל ב-diff: 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

1. **סקריפטי `.ts` מחוץ ל-typecheck**: `tsconfig.json` כולל רק `src/**` בלי `__tests__`, כך ש-`scripts/*.ts` וקובצי הבדיקה לא נבדקים לטיפוסים
   בכלל, ב-CI ומקומית. כתבתי tsconfig זמני כדי לבדוק. `tsconfig.scripts.json` (או `include` רחב יותר ב-`typecheck`) היה תופס שגיאה כזו לכולם.
2. **שתי טבלאות ב-README של המוטציות**: כל תוכנית חדשה נכנסת ביד לשתיהן, ו-`mutation-plans.test.ts` מחזיק רשימה שלישית ביד. סקריפט שמפיק את
   שורת הזמן מפלט `mutate.mjs` (רשומות, שניות, killed) היה חוסך את ההעתקה.
3. **הוספת שדה חובה ל-`ReadbackRun`** חייבה עריכה של שמונה קריאות זהות בבדיקה; עזר `run()` משותף ב-`setup` (כמו שעשיתי ב-describe של השער)
   היה חוסך זאת בפעם הבאה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

1. קריאת הפסיקה כולה (כ-63KB) — נחוצה (המפרט), אבל §3 ו-§5 לא היו שלי; בערך שליש מהקריאה.
2. פלט הבדיקות של ה-verify המלא נשמר לקובץ ורק הסיכום הודפס — זול.
3. ה-README של המוטציות הודפס במלואו כדי למצוא את מקום השורות (השורות שלו ארוכות מאוד) — היה מספיק `grep -n` על תחילות השורות.
4. ניסיון ה-`sleep` שנחסם וה-`tsc` הראשון בלי `typeRoots` (תשע שגיאות של `node:*` שלא היו קשורות לשינוי) — שני סבבים מיותרים.
