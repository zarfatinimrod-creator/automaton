# טיק 61 (7.10.2026) — תיקון 1 לפסיקה 7.10 שורה 24: `firstRead` על הרשומה, ו-`p1` של `firstUploadWindow()` קורא אותו

בונה Opus, ב-worktree נפרד על הענף `build/tick61-firstread` (בסיס: `origin/claude/new-session-j071dx` ב-`c35725d`, הקומיט של התיקון). לא
נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, בפסיקות, ב-`SITTING-*`, ב-`research/measurements/*`
או בקובץ קיים כלשהו תחת `logs/`. לא הרצתי `git stash`, `git checkout`/`git switch` ב-checkout הראשי, `git fetch`, `git pull`, `git push`, `gh`, חיפוש או
fetch ברשת. לא עשיתי push; ה-worktree נשאר ל-`scripts/merge-worktree.sh` של ה-thread הראשי.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש (משימה מחושבת של workflow, לא הודעת בעלים) לבנות את פריטי "Decided" 1-3 של "## Amendment 1" בסוף
`research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md`, על רקע §1 החלטה 1 ו-§4 החלטות 1-3:

1. `UploadReadback` מקבל `firstRead: { readAt, returned, privacyStatus } | null` — הקריאה הראשונה שה-read-back לוקח ל-id, מיועדת או לא, נכתבת פעם
   אחת ולא משתנה; `returned` false ו-`privacyStatus` null כשהסרטון לא היה בתשובה, אחרת ה-status שנקרא. `first` שומר על משמעותו ועל עיגון
   השעון של `stayedPublic()`.
2. `p1` של `firstUploadWindow()` קורא את `firstRead` ולא את `first`: false אם `publisherAccepted === false`, או אם `firstRead` קיים ו-(`returned === false`
   או `privacyStatus !== "public"`); true אם `publisherAccepted === true` ו-`firstRead.privacyStatus === "public"`; אחרת null. `p2`, `p3`, `p4` ו-`passed` ללא שינוי.
3. בדיקות (ה-fixture שנמדד כבדיקת רגרסיה; `firstRead` נכתב פעם אחת; קריאה ראשונה ציבורית בלי ייעוד נותנת `p1` true ו-`p2` נשאר null עד קריאת
   ייעוד; המקרה שלא הוחזר), תוכנית מוטציות, ולידציה ב-`scripts/verify.sh`, קומיט ולוג. `T1-PROTOCOL.md` ו-`experiments.ts` רק אם המשפט שלהם מתאר
   את P1 דרך `first`.

## 2. הפעולות המרכזיות שביצעתי

1. הקמת ה-worktree לפי ההוראות; `git log --oneline -1` הראה `c35725d`, `products/` ו-`src/revenue/` לא ריקים; קישור `node_modules`.
2. קריאת §1 החלטה 1, §4 החלטות 1-3 ו-Amendment 1, את `src/revenue/youtube-madeforkids.ts` כולו, את הבדיקות (690 שורות), את
   `scripts/youtube-madeforkids-readback.ts`, את תוכנית המוטציות ואת שורותיה ב-README.
3. **מדידת ההתנהגות שלפני התיקון** בתיקיית ה-scratch (`git show HEAD:src/revenue/youtube-madeforkids.ts` לקובץ זמני וסקריפט tsx):
   קריאה ראשונה שלא הוחזרה ואחריה קריאות `public` מיועדות `"false"` ב-+1 וב-+73 שעות → `{"p1":true,"p2":true,"p3":true,"p4":true,"passed":true}`;
   אותו רצף עם קריאה ראשונה `private` בלי ייעוד → גם `passed:true`; קריאה ציבורית בלי ייעוד לבדה → `p1:null`. זה מה שהבונה והסוקר של קיפול 2
   מדדו.
4. **בדיקות קודם (TDD):** כתבתי את השינויים בבדיקות ואת ה-`describe` החדש לפני הקוד. ריצה: 15 נכשלו, 51 עברו (66), exit 1 — כצפוי.
5. **הקוד** (`src/revenue/youtube-madeforkids.ts`):
   - `MadeForKidsReading` מקבל `returned: boolean` (`:49-53`), ו-`parseVideosList` קובע אותו לפי אם הפריט נמצא בתשובה (`:128-133`). התיעוד של
     `privacyStatus` תוקן לאמת של הקוד: null גם כשה-status בלי מחרוזת (`:56`).
   - `UploadReadback.firstRead` עם התיעוד במילות התיקון (`:65-71`); תיעוד `first` אומר שהוא תחילת השעון של `stayedPublic()` (`:72-76`).
   - `unreadEntry` עם `firstRead: null` (`:137-138`); `mergeReadings` כותב `firstRead: p.firstRead ?? { readAt, returned, privacyStatus }` מהקריאה של
     הריצה (`:163`), והתיעוד שלו אומר "written once, never changed" ושהעלאה ברשימה שאין לה קריאה בריצה נשארת כפי שהייתה (`:140-146`).
   - `FirstUploadWindow.p1` ותיעוד `firstUploadWindow()` במילות התיקון (`:208-211`, `:228-232`); הקוד (`:241-245`):
     `const firstRead = entry?.firstRead ?? null;` ואז שלושת הענפים כפי שהתיקון אומר.
   - כותרת המודול מונה את `firstRead` בין מה שהמצב שומר (`:16-22`).
6. ריצה: 66 עברו, exit 0; `pnpm -s typecheck` exit 0.
7. **תוכנית המוטציות:** T61-FR1 עד FR9 נוספו (ראו §4); ה-`find` של T61-FW2, FW3 ו-FW4 עברו לשורות החדשות (הענפים קוראים עכשיו `firstRead`),
   וההערות שלהם אומרות זאת. `node scripts/mutate.mjs --check --allow-dirty --plan …`: "28 of 28 would apply", exit 0.
8. שורת התוכנית ב-README (עמודת ה-Script(s)) נוספו לה ערכי התיקון.
9. `scripts/verify.sh` על ארבעת הקבצים הממוקדים: exit 0, 4 קבצים, 155 בדיקות.
10. grep על ה-diff לתבנית השם (מוקלדת מחולקת) ולכתובות דוא"ל: 0 ו-0. קומיט `7a44bf6`.
11. `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/youtube-madeforkids.json`: exit 0, 113 שניות (לבד, כולל הקמת
    העץ), "28 applied: 28 killed, 0 survived".
12. עדכון שורת הזמן הנמדד ב-README (28 רשומות, 113 שניות; ה-75 של 19 הרשומות נשמר אחריו), ואז `scripts/verify.sh` המלא.

## 3. קבצים/מערכות ששונו

- `src/revenue/youtube-madeforkids.ts` — השדה `returned` על הקריאה, `firstRead` על הרשומה, הכתיבה ב-`mergeReadings`, ה-`p1` של `firstUploadWindow`,
  והתיעוד.
- `src/__tests__/revenue/youtube-madeforkids.test.ts` — `describe` חדש של שמונה בדיקות (`:417-502`), בדיקה חדשה בתוך ה-`describe` של
  `firstUploadWindow` (`:341-346`), והתאמת ה-fixtures הקיימים לטיפוס (`returned`, `firstRead`).
- `src/__tests__/revenue/mutations/youtube-madeforkids.json` — 19 → 28 רשומות.
- `src/__tests__/revenue/mutations/README.md` — שורת התוכנית ושורת הזמן הנמדד.
- `logs/2026-10-07-channel-loop-tick-61-firstread.md` — הלוג הזה (חדש).
- **לא שונו, ובכוונה:** `research/faceless-youtube/T1-PROTOCOL.md` — משפט ה-Recording (`:137`) אומר "P1's API half and P2 from the read-back
  state" ולא נוקב ב-`first`, ולכן לפי ההוראה אין מה לשנות; `src/revenue/experiments.ts` — תיעוד `t1Passed` (`:28-30`) אומר "P1's API half and P2
  from the read-back's entry for the first upload", כלומר הרשומה של ההעלאה הראשונה ולא השדה `first`, ולכן גם הוא לא שונה.

## 4. החלטות והנחות משמעותיות

1. **סטייה: `returned` נוסף גם ל-`MadeForKidsReading`, לא רק ל-`firstRead`.** `mergeReadings` מקבל רק את הקריאות של הריצה, ובלי השדה הזה אי
   אפשר להבחין בין סרטון שלא היה בתשובה לבין סרטון שהוחזר עם status בלי `privacyStatus` מחרוזתי — שניהם נקראים היום `privacyStatus` null. לנחש
   `returned` מתוך `privacyStatus === null` היה רושם "לא הוחזר" על סרטון שהוחזר; התיקון מגדיר את `returned` כעובדה נפרדת ("otherwise the status
   read"). הסקריפט (`scripts/youtube-madeforkids-readback.ts`, לא ברשימת הקבצים שלי) לא השתנה: הוא מעביר את הקריאות של `parseVideosList` ל-`mergeReadings`
   כמו שהן. התוצאה: גם `first` ו-`latest` במצב נושאים `returned`. שלוש ה-assertions של הפרסר (`:84-104`) וה-`latest` הצפוי בבדיקת הסקריפט קיבלו את
   השדה — עובדה נוספת, שום דבר לא רוכך. מוטציה T61-FR8 (ניחוש מ-`privacyStatus`) נהרגת רק על ידי הבדיקה "a video the response returned with no
   privacyStatus".
2. **"listed upload the response did not return" = הקריאה שהפרסר מחזיר עם `returned` false**, והיא עוברת בענף הרגיל של `mergeReadings` (יש קריאה
   `r`). הענף `if (!r) return p;` הוא העלאה ברשימה שלריצה אין לה קריאה בכלל (לא נשאלה); שם לא נכתב `firstRead`, כי לא נלקחה קריאה — רשומת
   "קריאה ראשונה" שם הייתה ממציאה קריאה. בסקריפט כל id ברשימה נשאל ו-`parseVideosList` מחזיר קריאה לכל id, כך שהענף הזה לא קורה שם. הבדיקה
   "a listed upload a run did not read keeps its entry as it was" ומוטציה T61-FR9 מקבעות זאת. זו קריאה שלי של ניסוח המשימה מול הקוד, ולא הכרעה
   חדשה; אם ה-thread הראשי התכוון אחרת, זה המקום לשנות.
3. **כתיבה חד-פעמית כ-`p.firstRead ?? {...}`**, כמו `first: p.first ?? …`. מצב שנכתב לפני התיקון (בלי המפתח `firstRead`) היה מקבל את הקריאה הבאה
   כ"קריאה הראשונה"; מצב כזה לא קיים — ה-read-back מעולם לא רץ חי (שער התנאים מסרב, והבדיקות אומרות שאף workflow לא מריץ אותו) — ולכן לא טיפלתי
   בו. `firstUploadWindow` על רשומה בלי `firstRead` נותן `p1` null (לא נקרא), לעולם לא true.
4. **הענף `returned === false` עודף כשהפרסר כתב את הקריאה** (לא הוחזר ⇒ `privacyStatus` null, ו-`!== "public"` תופס את זה). כתבתי אותו כלשון התיקון;
   מוטציה T61-FR1 שמסירה אותו נהרגת רק על ידי בדיקה של מצב שנערך ביד (`firstRead` עם `returned` false ו-`privacyStatus` "public") — מצב שהפונקציה,
   שמבקר מריץ על קובץ מצב, צריכה להכשיל ממילא.
5. **שתי עובדות מקובעות השתנו, ונקבעו מחדש בגלוי.** ב-"P1 is null while either half is unread" היו
   `firstUploadWindow(undesignated, true, true, true).p1` → null ו-`firstUploadWindow(notReturned, true, true, true).p1` → null. לפי התיקון הראשונה היא
   true והשנייה false; הן עברו לבדיקה חדשה, "P1 reads the first read, designated or not (amendment 1)…" (`:341-346`), עם הערה שאומרת מה היה
   קודם ולמה. במקומן בבדיקה הישנה: `firstUploadWindow(undesignated, null, true, true).p1` → null (חצי המפרסם לא נקרא). שמות שתי בדיקות P1
   שאמרו "the first designation read" אומרים עכשיו "the first read"; בשלוש הרשומות שבהן (stayed, early, privated; firstPrivate, firstUnlisted) שתי
   הקריאות זהות, כך שהמשמעות לא השתנתה. כל assertion אחר נשאר כפי שהיה.
6. בבדיקת הסקריפט "re-reads an upload…" שיניתי את שם המשתנה המקומי `firstRead` ל-`earlierRead`, כדי שלא יתבלבל עם השדה החדש; ה-assertion
   עליו לא השתנה, ונוסף לידו `firstRead` שלא השתנה בריצה השנייה.
7. בבדיקות, ה-helpers `read()` קובעים `returned = privacyStatus !== null` כברירת מחדל: כך ה-fixtures הקיימים שסימנו "לא הוחזר" כ-`read(…, null, …, null)`
   (ההערות שלהם אומרות זאת, `:190`, `:229`) ממשיכים לומר זאת. בדיקת "returned with no privacyStatus" עוברת דרך הפרסר עצמו ולא דרך ה-helper.

## 5. שגיאות וניסיונות שנכשלו

אין שגיאה של ממש. הריצה הראשונה של הבדיקות נכשלה (15 מתוך 66) לפני הקוד, כמתוכנן. כותרת `scripts/youtube-madeforkids-readback.ts` (פסקת
WRITES, `:15-19`) מונה את מה שהרשומה שומרת ולא נוקבת ב-`firstRead`; הקובץ לא ברשימת הקבצים שלי, ולכן לא תיקנתי — נשאר ל-thread הראשי.

## 6. בדיקות ופעולות ולידציה

- לפני השינוי: `npx vitest run src/__tests__/revenue/youtube-madeforkids.test.ts` — exit 0, 57 עברו.
- מדידת הקוד הישן על ה-fixture (סעיף 2.3): `passed:true` בשני הרצפים.
- אחרי הבדיקות ולפני הקוד: exit 1, 15 נכשלו, 51 עברו (66).
- אחרי הקוד: exit 0, 66 עברו; `pnpm -s typecheck` exit 0.
- `node scripts/mutate.mjs --check --allow-dirty --plan src/__tests__/revenue/mutations/youtube-madeforkids.json` — exit 0, "28 of 28 would apply".
- `scripts/verify.sh src/__tests__/revenue/youtube-madeforkids.test.ts src/__tests__/revenue/experiments.test.ts src/__tests__/revenue/kids-explainers-kills.test.ts src/__tests__/revenue/mutation-plans.test.ts`
  — exit 0 (typecheck exit 0, vitest exit 0), 4 קבצים, 155 בדיקות.
- `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/youtube-madeforkids.json` על `7a44bf6` — exit 0, 113 שניות,
  baseline פעמיים exit 0, "28 applied: 28 killed, 0 survived, 0 killed?, 0 timeout; 0 not applied; 0 not run". אין שורד.
- `scripts/verify.sh` המלא (ברירת המחדל, `src/__tests__/revenue`): exit 0 (typecheck exit 0, vitest exit 0), 172 שניות, 80 קבצים, 2824 עברו ו-2 דולגו (2826); רץ על `7a44bf6` כששינוי שורת הזמן ב-README עוד לא היה בקומיט.
- grep על ה-diff לתבנית השם (מוקלדת מחולקת) ולכתובות דוא"ל לפני כל קומיט: 0 שורות.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **שורת הזמן הנמדד ב-README של תוכניות המוטציות** מתעדכנת ביד בכל בנייה (מספר רשומות, שניות, הקשר הריצה). `mutate.mjs` כבר יודע את כל
  המספרים בסוף הריצה; דגל כמו `--record "<context>"` שכותב את השורה (דרך עורך בטוח כמו `loop-edit.mjs`, שהיום מוגבל ל-`logs/` ו-`research/channel-loop/`)
  היה חוסך את הסקריפט החד-פעמי.
- **מדידת ההתנהגות של הקוד לפני שינוי** (`git show HEAD:<file>` לקובץ זמני + סקריפט tsx שמייבא ממנו) — נעשתה גם בקיפול 2. סקריפט קטן
  `scripts/at-ref.sh <ref> -- <cmd>` (או `sim-tree.sh --ref` עם פקודה אחת) היה הופך את זה לשורה אחת; `sim-tree.sh --ref` קיים, וכדאי לבדוק אם
  הוא מספיק לזה לפני שבונים משהו.
- עריכות מדויקות בקבצי TS/JSON/README נעשו בסקריפטי Python עם בדיקת "מופע אחד בדיוק" לכל החלפה — אותו דפוס כמו `loop-edit.mjs`, מחוץ לתחום שלו.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- הדפסת שורות ה-README של תוכניות המוטציות כולן (`sed -n 1,100p`): שורת `robots-verdict.json` לבדה ארוכה מאוד; היה מספיק `grep -n youtube-madeforkids`.
- קריאת קובץ הבדיקות כולו (690 שורות) — נחוצה, כי ה-fixtures בכל ה-`describe` מושפעים מהטיפוס.
- הדפסת 28 שורות התוצאה של `mutate.mjs` במלואן (עם ההערות) — מעט; `tail -1` היה מספיק לספירה, והשורות נשמרו בקובץ ב-scratch.
