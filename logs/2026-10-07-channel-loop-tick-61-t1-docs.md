# 7.10.2026: tick 61, קיפול פסיקת 7.10 שורה 24, חלק המסמכים (קיפולים 1, 6, 8, 11)

## 1. מה המשתמש ביקש

התהליך הראשי (tick 61) שלח בונה Opus בשם "docs" ל-worktree מבודד
(`build/tick61-t1-docs`), לקפל ארבעה מתוך רשימת "Folds for Opus" של הפסיקה
`research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md` (commit `692e905`):

- **קיפול 1:** ב-`research/faceless-youtube/T1-PROTOCOL.md` להחליף את שורות הטבלה P1, P2, P4 (`:77`, `:78`, `:80`)
  בשורות החדשות של §3 החלטות (1)-(3), בהחלפה של שורה שלמה ואחרי הוכחה ב-`grep -n -x -F` שהשורה הנוכחית היא בדיוק
  מה שהפסיקה מצטטת; להוסיף את המשפט של §3 (4) לסעיף מפתח ה-Data API, את טקסט תת-המותג לילדים של §3 (6), ואת
  משפט ה-Recording של §3 (5). שום שורה אחרת.
- **קיפול 6:** ב-`research/youtube-kids/KIDS-LINE.md`: פריט 11 של "Not ruled here" (`:311-314`) בנוסח הפסיקה;
  המצביע ב-`:251`; פסקת "Recorded 7.10.2026" ב-§7 כלל 4 אחרי `:184`, כשמשפט החיפוש מסתיים ב-"recorded here:
  pending — the main thread runs the one search and fills this line." (אין לי רשת; התהליך הראשי ממלא).
- **קיפול 8:** ב-`src/__tests__/revenue/brand-check.test.ts` (`:245-276`): לקבע ש-`firstAllFree` של
  `kids-subbrand-candidates.json` הוא `worldincharts` ו-`allFree` הוא `["worldincharts", "askthechart"]`, ושה-KIDS-LINE
  נוקב בקובץ הפסיקה; להשאיר את `:251` על חמש.
- **קיפול 11:** ב-`research/channel-loop/BOARD-LOOP.md:118` ו-`:210`: `T1-PROTOCOL.md:71-96` → `:89-133`, אחרי אימות
  שזה טווח שלב A ב-HEAD.

אסור היה: `git stash`, checkout/switch בעותק הראשי, fetch/pull/push, רשת, `gh`; לגעת ב-CHECKPOINT, CHANNEL_LOOP,
FABLE_QUEUE, MISSION, CLAUDE.md, בפסיקות ובתדריכים, בקבצי `research/measurements/*` (push מריץ מחדש את הבדיקות שלהם)
או בלוג קיים; לכתוב שם של אדם או כתובת מייל.

## 2. הפעולות המרכזיות שביצעתי

1. פתחתי את ה-worktree מ-`origin/claude/new-session-j071dx`; `git log --oneline -1` הראה `692e905` (הפסיקה עצמה),
   `products/` ו-`src/revenue/` מלאים; קישור `node_modules`.
2. קראתי את הפסיקה כולה (656 שורות), את `T1-PROTOCOL.md` כולו (137 שורות), את קטעי KIDS-LINE (`:165-190`,
   `:244-256`, `:290-314`), את בלוק הילדים ב-brand-check.test.ts, את ה-JSON של המדידה, את `BOARD-LOOP.md:110-122`,
   `:205-214`, ואת תחילת `MISSION.md` וסופו (הכללים).
3. הוכחה ב-`grep -n -x -F -f` שהשורות הנוכחיות הן הציטוטים של הפסיקה: שורת הפסיקה `:330` = T1-PROTOCOL `:77`,
   `:342` = `:78`, `:354` = `:80`. את השורות החדשות לקחתי ישירות מהפסיקה (`:336`, `:348`, `:360`) בלי להקליד אותן;
   ספרתי `|` בכל אחת (4, כלומר שלושה תאים, כמו היום).
4. כתבתי סקריפט Node חד-פעמי בתיקיית ה-scratch שמבצע את קיפולים 1 ו-6: כל find חייב להופיע פעם אחת בדיוק, כל
   טקסט חדש נבדק (אחרי נרמול רווחים) שהוא אכן טקסט הפסיקה, ומספר השורות של T1-PROTOCOL נבדק שלא השתנה. הרצה יבשה
   לקבצים ב-scratch, `diff`, ואז כתיבה.
5. קיפול 11 עם `scripts/loop-edit.mjs replace-in-line` (BOARD-LOOP הוא קובץ לולאה תחת `research/channel-loop/`), קודם
   `--dry-run` ואז כתיבה, אחרי אימות ששלב A הוא `:89` (הכותרת) עד `:133` (`## Recording` ב-`:134`).
6. קיפול 8: `it` חדש בתוך ה-describe של רשימת הילדים, ו-`existsSync` לייבוא.
7. `scripts/verify.sh` על ארבע הבדיקות שבתדריך, ואז המלא; ואחרי ה-commit, מוטציות על הקיבוע החדש בתוך
   `scripts/sim-tree.sh`.

## 3. קבצים/מערכות ששונו

- `research/faceless-youtube/T1-PROTOCOL.md` (137 שורות לפני ואחרי): `:77` P1, `:78` P2, `:80` P4 — שורות הפסיקה;
  `:120` — משפט §3 (4) אחרי "(`ASSESSMENT.md:423-426`)."; `:124-125` — תת-המותג `worldincharts` (§3 (6));
  `:137` — משפט §3 (5) אחרי "with its timestamp and source,".
- `research/youtube-kids/KIDS-LINE.md` (314 → 320 שורות): `:185-189` פסקת "Recorded 7.10.2026" (חדשה, בתוך §7 כלל 4,
  שעובר ל-`:175-189`); `:256` (היה `:251`) — `T1-PROTOCOL.md:72-82` → `:75-81`, fail rule `:83-87`; `:316-320` (היה
  `:311-314`) — פריט 11 בנוסח הפסיקה.
- `src/__tests__/revenue/brand-check.test.ts`: `existsSync` בייבוא (`:3`); `it` חדש ב-`:277-286`, בתוך ה-describe
  של רשימת הילדים (עכשיו `:245-287`); `:251` (`toHaveLength(5)`) לא נגעתי.
- `research/channel-loop/BOARD-LOOP.md:118`, `:210`: `(T1-PROTOCOL.md:71-96)` → `(T1-PROTOCOL.md:89-133)`.
- הלוג הזה (חדש).

## 4. החלטות והנחות משמעותיות

1. **T1-PROTOCOL שומר על מספרי השורות.** הוספתי את משפטי §3 (4), (5), (6) בתוך השורות הקיימות (שורות ארוכות) ולא
   עטפתי מחדש: עטיפה הייתה מוסיפה שורות ומזיזה את שלב A (`:89-133`, ייעד קיפול 11), את Recording (`:134-137`) ואת
   ערכת הקליקים של הילדים (`:121-130`), שהפסיקה וקבצים אחרים מצביעים עליהם. Markdown לא מושפע; בקובץ כבר יש
   שורות של 614 תווים.
2. **§3 (4) נכנס אחרי "(`ASSESSMENT.md:423-426`)."**, כפי שהפסיקה אומרת, ולפני "Stage A is not asked before that
   reader is built…" — לא בסוף הסעיף. התדריך אמר "append to the bullet"; הפסיקה קובעת את המקום, והלכתי לפיה.
3. **§3 (6): הטקסט שהפסיקה מחליפה נפרש על `:123-125`, לא רק `:124`.** `:123` מסתיים ב-"under the" ונשאר כמו שהוא;
   `:124` ו-`:125` השתנו (`:125` התחיל ב-"name in list order is used), "). התוצאה, אחרי נרמול רווחים, מכילה בדיוק את
   הנוסח החדש של הפסיקה (נבדק בסקריפט).
4. **"the same ruling" ב-T1-PROTOCOL `:120` ו-`:124` — מילה במילה.** בסעיפים האלה "ruling" הקודם הוא פסיקת 4.10 של
   הילדים, אבל הנוסח של הפסיקה כולל "ruled 7.10.2026", והתאריך מכריע לאיזו פסיקה הכוונה (זו ששורת P1 ב-`:77` נוקבת
   בנתיב המלא). לא שיניתי נוסח שהפסיקה קבעה.
5. **סטייה אחת מנוסח מילולי: בפסקת "Recorded 7.10.2026" כתבתי את נתיב הפסיקה במקום "ruling".** נוסח קיפול 6 הוא
   "(ruling (e))". ב-KIDS-LINE המילה "ruling" לבדה היא תמיד פסיקת 4.10 של הילדים (למשל `:5`, `:175`), וה-(e) שלה הוא
   §6 "Made for kids, COPPA and money" — כך שהמצביע היה מפנה לפסיקה הלא נכונה. החלטה 6 של §5 בפסיקה עצמה דורשת "a
   dated line in `PREREG-DECISIONS.md:547-549`'s form", והצורה ההיא נוקבת בפסיקה בנתיב
   ("`research/channel-loop/RULING-2026-09-29-lines.md` (e)"). לכן: "(`research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md` (e))".
   שאר הפסקה מילה במילה.
6. **משפט החיפוש** נשאר "pending — the main thread runs the one search and fills this line.", כפי שהתדריך אמר; החלטה 5
   של §5 (חיפוש אחד ברמת snippet לפני שלב A) היא של התהליך הראשי.
7. **משפט ה-Recording נוקב ב-`firstUploadWindow(...)`, שעדיין לא קיים ב-`692e905`** (`grep` ב-`src/revenue/youtube-madeforkids.ts`:
   רק `stayedPublic` ב-`:171`). זה הנוסח של הפסיקה, והפונקציה היא קיפול 2 של בונה אחר. אם קיפול 2 לא יתמזג, המשפט
   נוקב בפונקציה שאינה קיימת — בדיוק סוג הפגם ש-CLAUDE.md מזהיר ממנו; על התהליך הראשי למזג את שניהם יחד.
8. **הקיבוע של קיפול 8 הוא `it` חדש ולא שינוי של קיים**, עם `existsSync` על קובץ הפסיקה כדי ש-"נוקב בקובץ" יהיה
   מצביע שקיים. `toHaveLength(5)` נשאר. לא קיבעתי את "the kids sub-brand is `worldincharts`" בתוך KIDS-LINE: אם החיפוש
   של החלטה 5 יעביר את הבחירה ל-`askthechart`, הקיבוע של המדידה (`firstAllFree`) עדיין נכון, אבל קיבוע של הבחירה היה
   נשבר; הפסיקה ביקשה את המדידה ואת שם הקובץ.
9. **לא הוספתי קובץ תוכנית מוטציות:** אין תוכנית ל-`brand-check` ב-`src/__tests__/revenue/mutations/`, וקובץ חדש שם אינו
   ברשימת הקבצים שמותר לי לשנות. המוטציות רצו בצורת שורת הפקודה של `mutate.mjs` (`--file --find --replace --test`) בתוך
   `sim-tree.sh`, כי שתיים מהן משנות זמנית את `kids-subbrand-candidates.json`, שאסור לגעת בו בעותק.

## 5. שגיאות וניסיונות שנכשלו

1. הריצה היבשה הראשונה של הסקריפט סירבה (exit 2, לא נכתב כלום): הבדיקה שלי שהשורה היא סעיף מפתח ה-Data API הסתכלה
   על האינדקסים של `:119-:120` במקום `:118` (השורה עם "The `madeForKids` read-back" היא `:118`). תיקנתי את הבדיקה
   (`:116` מתחיל ב-"- **The Data API key", `:118` מכיל את ה-read-back), והריצה עברה.
2. `loop-edit.mjs` סירב ל-`--anchor "- **First action:** …"` ("ambiguous"): ערך שמתחיל ב-"-" צריך את צורת ה-`=`,
   כפי שכתוב בראש הסקריפט. עם `--anchor=- **First action:** …` עבר.

## 6. בדיקות ופעולות ולידציה

- `grep -n -x -F -f` לפני: `:77`, `:78`, `:80` שווים לשורות הפסיקה `:330`, `:342`, `:354`; אחרי: השורות החדשות
  (`:336`, `:348`, `:360` של הפסיקה) נמצאות ב-`:77`, `:78`, `:80`. `wc -l` 137 לפני ואחרי. `## Stage A` ב-`:89`,
  `## Recording` ב-`:134`, כלל הכישלון `:83-87`, הטבלה `:75-81`.
- מצביעים שכתבתי, נפתחו מחדש ב-HEAD: `scripts/render-watch.mjs:535` (youtube.com ב-`TERMS_BARRED`);
  `logs/CHANNEL_LOOP.md:81-86` (הפורטל שמופעל בידי runner); `src/revenue/youtube-madeforkids.ts` (`stayedPublic`
  ב-`:171`, `part: "id,status"` ב-`:95`); `scripts/youtube-madeforkids-readback.ts` (קיים);
  `research/measurements/kids-subbrand-check.md` ו-`218ffca` (ה-commit של הריצה ב-4.10 09:28:54Z, שכתב את ה-JSON
  ואת ה-md); `firstAllFree` = `worldincharts`, `allFree` = `worldincharts`, `askthechart`; T1-PROTOCOL `:75-81`,
  `:83-87`, `:77`, `:78`, `:80`; BOARD-LOOP `:118`, `:210`; קובץ הפסיקה קיים.
- `scripts/verify.sh` על brand-check, frozen-citations, kids-explainers-kills, experiments: typecheck exit 0, vitest
  exit 0, 4 קבצים, 103 בדיקות עברו (כולל החדשה).
- `scripts/verify.sh` המלא: typecheck exit 0; vitest exit 0 על `src/__tests__/revenue`: 80 קבצים, 2789 עברו, 2 דילוגים (ב-`prize-apply-reading.test.ts` וב-`narration-licence-gate.test.ts`, שלא נגעתי בהם; היו שם קודם), 118 שניות; `verify: passed`, exit 0. רץ לפני ה-commit, על אותו עץ.
- מוטציות (`node scripts/mutate.mjs --file … --find … --replace … --test src/__tests__/revenue/brand-check.test.ts`
  בתוך `scripts/sim-tree.sh`): ארבע ריצות, כל אחת עם baseline כפול שעבר (exit 0); K1 `"firstAllFree": "worldincharts"` → `"askthechart"`: **killed**; K2 `allFree` מקבל שם שלישי (`chartfacts`): **killed**; K3 הסדר של `allFree` מתהפך: **killed**; K4 ב-KIDS-LINE נתיב הפסיקה בפסקת "Recorded" (`--nth 1`) מוחלף בנתיב פסיקת 4.10: **survived** (exit 1 של mutate.mjs) — בכוונה: פריט 11 עדיין נוקב בקובץ, והקיפול ביקש רק שהקובץ נוקב בו, לא באיזה מקום. 3 מתוך 4 נהרגו; השורד הוא קיבוע שלא התבקש, ונשאר כך. `sim-tree.sh` exit 0, העץ נמחק. אין בדיקה שמקבעת את שורות T1-PROTOCOL (גם לפני הקיפול לא הייתה, והפסיקה לא ביקשה), ולכן לא הרצתי עליהן מוטציות.
- **מצביעים שזזו או שלא תואמים, שמצאתי (דיווח בלבד מחוץ לקיפולים):**
  - §3 (6) של הפסיקה אומר `T1-PROTOCOL.md:124`; הטקסט שהוא מחליף נפרש על `:123-125` (ראו §4 החלטה 3).
  - קיפול 1 אומר "Data API key bullet (`:118-120`)" ו-§3 (4) אומר `:116-120`: הסעיף הוא `:116-120`, העוגן ב-`:120`. לא סתירה.
  - KIDS-LINE אחרי הקיפול: §7 כלל 4 `:175-189` (היה `:175-184`), K-T1k `:256` (היה `:251`), פריט 11 `:316-320` (היה
    `:311-314`). אין קובץ מתוחזק שמצביע על שורה של KIDS-LINE (grep על כל המאגר מלבד פסיקות, תדריכים ולוגים).
  - brand-check.test.ts: ה-describe של רשימת הילדים הוא עכשיו `:245-287` (היה `:245-276`); `:251` לא זז.
  - `KIDS-LINE.md:36` מצביע על `T1-PROTOCOL.md:51-53` ל-"16:9 long-form as T1"; ב-HEAD הסעיף הוא `:54-56` (`:52` היא
    הכותרת "## The T1 video"). לא תיקנתי: מחוץ לקיפול.
  - `KIDS-LINE.md:180-182` (הנרטיב של 4.10 על תיקון ה-brand-check): `.github/workflows/brand-check.yml:20-25` — ב-HEAD
    ה-paths הם `:24-29` (ה-glob ב-`:29`, כפי שהפסיקה מצטטת); `scripts/brand-check.mjs:46` — ה-lookup של YouTube הוא
    עכשיו `:84`; `research/channel-loop/terms-verdicts.json:460-464` — ב-HEAD שם mozilla.org, ו-youtube.com ב-`:852-857`.
    המשפט מתאר את העץ של 4.10; לא תיקנתי: מחוץ לקיפול.
  - `KIDS-LINE.md:178` עדיין אומר "if it is taken the next name in list order is used", ואילו T1-PROTOCOL `:125` אומר עכשיו
    "the next name in list order that is free on all three probes is used — today `askthechart`" (נוסח הפסיקה). לא
    סתירה מהותית (הרשימה עצמה, `kids-subbrand-candidates.txt:8-10`, אומרת "free on all three"), אבל שני נוסחים.
  - מחוץ לרשות שלי, לתהליך הראשי: `logs/FABLE_QUEUE.md:48` ו-`logs/CHANNEL_LOOP.md:438`, `:440` עדיין מצביעים על
    `T1-PROTOCOL.md:74-77` (השורות הן `:77`, `:78`, `:80`); `SITTING-2026-10-01-BRIEF.md:558` (`:78` ל-P5, היום `:81`) —
    תדריך, לא מתוחזק, כפי שהפסיקה רשמה.
- `git diff` כולו נבדק לתבנית של שם הבעלים ולכתובות מייל: 0 שורות.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **החלפת שורה שלמה בקובץ מחקר שאינו קובץ לולאה.** `loop-edit.mjs` מסרב לכל קובץ מחוץ ל-`logs/` ול-`research/channel-loop/`,
  ולכן T1-PROTOCOL ו-KIDS-LINE דרשו סקריפט חד-פעמי עם בדיקות משלו — אותו דפוס שהכלי נבנה כדי לבטל. הרחבה של
  `loop-edit.mjs` ל-`research/**/*.md` (פקודת `replace-line --line N --old-from <file:line> --new-from <file:line>`,
  שמעתיקה את השורה החדשה מקובץ הפסיקה) הייתה חוסכת את הסקריפט ואת בדיקת ה-"זה הנוסח של הפסיקה".
- **"תוכן הפסיקה הוא המפרט":** בכל קיפול מסמכים בונה מעתיק בלוקי קוד מהפסיקה. פקודה שמחלצת את זוגות ה-"Current line"
  / "New line" של §3 מהפסיקה ומוכיחה כל אחד ב-`grep -x -F` הייתה הופכת את שלב 3 לפקודה אחת.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הפסיקה כולה (~28 אלף אסימונים): נחוצה — התדריך דרש, וההחלטות על (4)-(6) והסטייה ב-5 נשענו על §3 ו-§5.
- grep רחב על `T1-PROTOCOL\|KIDS-LINE\|BOARD-LOOP` ב-`src/__tests__` (~6 אלף): הדפיס שורות ענק מ-`prize-terms-audit.test.ts`
  ומ-fixtures של `loop-edit` שלא היו רלוונטיות; `-l` קודם ואז grep ממוקד היה זול יותר.
- קריאת `MISSION.md` (~6 אלף, התחלה וסוף): לפי CLAUDE.md; לא שינתה דבר בקיפול הזה.
- ההודעות האוטומטיות על רשימת המשימות של התהליך הראשי חזרו כמה פעמים (כמה אלפי אסימונים כל אחת) — לא בשליטתי.
