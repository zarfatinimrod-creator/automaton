# טיק 51 — `scripts/sim-tree.sh`, `mutate.mjs --check`, ותוכניות מוטציה ליד הבדיקות

## 1. מה המשתמש ביקש

בניית הפריט שתוכנן לטיק 51 ב-`logs/CHANNEL_LOOP.md` §10: §9 "Queued 5.10 (tick 50)" פריט 1, כלומר "Queued 5.10 (tick 49)" פריטים 4 ו-5. שני הדברים שכל בנייה בטיקים 48-50 שילמה על היעדרם:

- **חלק 1 — `scripts/sim-tree.sh`:** עותק זריק של ה-checkout ב-ref (`git archive | tar -x`, `git init`, commit אחד, קישור ל-`node_modules`), הרצת פקודה בתוכו עם `SIM_TREE`, הסרה אחרי הצלחה, שמירה אחרי כישלון או עם `--keep`, וסירובים (יציאה 2, בלי ליצור דבר). בדיקות ב-`src/__tests__/revenue/sim-tree.test.ts`.
- **חלק 2 — תוכניות מוטציה ליד הבדיקות:** תיקייה `src/__tests__/revenue/mutations/` עם תוכנית JSON לכל סקריפט (לפחות remask-captures, render-watch, freeze-capture, capture-check, loop-edit, prize-dispatch), שנבנית מהמוטציות שבלוגים; `scripts/mutate.mjs --check` (רק בדיקות שלב 2, בלי בדיקה ובלי נעילה); `src/__tests__/revenue/mutation-plans.test.ts` שמריץ `--check` על כל תוכנית; README; והרצה אמיתית של כל תוכנית, שבה כל מוטציה נהרגת.
- ≥5 מוטציות על `sim-tree.sh` ו-≥4 על קוד ה-`--check`, כולן בתוכניות `sim-tree.json` ו-`mutate.json`.

בתוך worktree בלבד, test-first, קומיט לכל חלק, בלי push ובלי merge, בלי לגעת בקבצי הלולאה, ב-`CLAUDE.md` או בלוגים קיימים.

## 2. הפעולות המרכזיות שביצעתי

1. Setup: הבסיס `claude/new-session-j071dx` ב-`deb8acb`; worktree על הענף `build/tick51-sim-tree-mutation-plans`; `pnpm install --frozen-lockfile` (exit 0); baseline של `mutate.test.ts`: exit 0, 66 בדיקות.
2. **חלק 1** (קומיט `fc2b409`): קודם `sim-tree.test.ts` (17 בדיקות; כולן נכשלו בלי הסקריפט), אחר כך `scripts/sim-tree.sh`. הבדיקות בונות מאגר git זמני עם קובץ אחד בשתי גרסאות (tag `v1`, ואז HEAD), שינוי לא-מקומט, קובץ לא-מעוקב ו-`node_modules` מזויף, עם gitconfig ריק (בלי זהות גלובלית). בדיקה אחת מריצה את הסקריפט על ה-checkout האמיתי עם `git rev-parse HEAD`.
3. **חלק 2א** (קומיט `e7e8326`): 5 בדיקות `--check` ב-`mutate.test.ts` (כולן נכשלו קודם), ואז השינוי: אופציה `check`, פונקציה `check()` של 14 שורות שמריצה את `prepare()` הקיים לכל מוטציה ובודקת את נתיבי הבדיקה, ו-`if (opts.check) return check(opts, root);` ב-`main` לפני הנעילה.
4. **חלק 2ב** (קומיט `261b523`): בניית שמונה תוכניות. הלוגים מתארים את המוטציות במילים ולא שומרים את טקסט ה-find, ולכן כל רשומה נכתבה מחדש מול הקוד של היום, אחרי קריאת הקוד הרלוונטי. כתבתי את התוכניות דרך סקריפט Python בתיקיית ה-scratch (מחרוזות raw, ובדיקה שכל find מופיע פעם אחת בדיוק), ואחר כך `mutate.mjs --check` על כל אחת. README, `mutation-plans.test.ts`, ושתי בדיקות שהרגו מוטציות ששרדו (סעיף 6).
5. הרצת כל התוכניות עד הסוף. שלוש מהן רצו בתוך `sim-tree.sh` (render-watch, loop-edit, freeze-capture), במקביל לריצה ב-worktree: לכל עץ נעילה משלו, כך שהכלי החדש שימש כבר בבנייה שלו.
6. `scripts/verify.sh` על שלושת קובצי הבדיקה, ואז על כל ה-revenue suite.

## 3. קבצים/מערכות ששונו

- `scripts/sim-tree.sh` — חדש (קובץ הרצה).
- `scripts/mutate.mjs` — `--check`: שורת כותרת, אופציה, `check()`, שורה ב-`main`, ה-usage ומשפט קוד היציאה.
- `src/__tests__/revenue/sim-tree.test.ts` — חדש, 19 בדיקות.
- `src/__tests__/revenue/mutate.test.ts` — describe חדש של 5 בדיקות `--check` (66→71).
- `src/__tests__/revenue/mutation-plans.test.ts` — חדש (בדיקה אחת לרשימה ושתיים לכל תוכנית: 17).
- `src/__tests__/revenue/capture-check.test.ts` — בדיקה אחת (127→128): `--summary` בלי `--dir` כותב `research/rendered` ולא את הנתיב המוחלט.
- `src/__tests__/revenue/mutations/` — חדש: `README.md` ושמונה תוכניות: `capture-check.json` (42), `freeze-capture.json` (23), `loop-edit.json` (46), `mutate.json` (6), `prize-dispatch.json` (28), `remask-captures.json` (45), `render-watch.json` (53), `sim-tree.json` (14). בסך הכול 257 מוטציות.
- הלוג הזה.

לא נגעתי: שום capture, שום yml, שום קובץ לולאה, `CLAUDE.md`, `MISSION.md`, לוגים קיימים.

## 4. החלטות והנחות משמעותיות

**sim-tree.sh:**
- `node_modules` הוא **קישור סימבולי** (כפי שהבריף אמר), לא hard link (כפי שנכתב בתור של טיק 50): אפס דיסק, ו-`rm -rf` של העץ מוחק את הקישור ולא עוקב אחריו (בדיקה מוכיחה שה-`node_modules` של המקור נשאר).
- הזהות של ה-commit בעץ: `-c user.name=sim-tree -c user.email=sim-tree -c commit.gpgsign=false` ו-`--no-verify`. ה-email בלי `@`, כדי שלא תהיה מחרוזת בצורת כתובת בקובץ.
- `git add -A -f`: קובץ מעוקב ש-`.gitignore` תופס (שנוסף ב-`-f`) נכנס ל-commit של העץ, כמו שהוא ב-ref. הקישור ל-`node_modules` נכתב ל-`.git/info/exclude` של העץ, כך ש-`git status` בעץ נקי גם כש-`.gitignore` לא מזכיר אותו.
- `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` וחבריהם מאופסים אחרי זיהוי ה-checkout ולפני העבודה בעץ: hook או קורא שהגדיר אותם היה מפנה את ה-git של העץ (ושל הפקודה) אל ה-checkout.
- הסירוב "בתוך המאגר" חל גם על ברירת המחדל: `TMPDIR` שבתוך ה-checkout מסורב (יציאה 2), כי העץ היה נוצר שם.
- כישלון באמצע בניית העץ (archive, init, commit) מוחק את העץ החלקי (trap) ויוצא בקוד של השלב שנכשל, לא 2; הפקודה לא רצה. כתוב בכותרת ונבדק (git מזויף שנכשל ב-`init`, יציאה 7).
- **"the sha matches" בבדיקה על ה-checkout האמיתי:** העץ הוא מאגר משלו, וה-HEAD שלו הוא ה-commit היחיד שלו, לא ה-sha של המקור. לכן הבדיקה משווה את ה-sha ש-sim-tree מדפיס ("from HEAD at <sha>") ל-`git rev-parse HEAD` של ה-checkout, ובודקת שהפקודה מחזירה sha של 40 תווים אחר; בדיקה אחרת מראה שנושא ה-commit בעץ מכיל את ה-ref ואת ה-sha.

**`mutate.mjs --check`:**
- נתיבי הבדיקה נבדקים רק תחת פקודת ברירת המחדל (vitest). תחת `--cmd` הם ארגומנטים של הפקודה (`pytest-product.sh` קורא אותם מתיקיית המוצר), ולכן לא נבדקים מול תיקיית העבודה. בדיקה מצמידה את זה.
- `--check` משתמש ב-`prepare()` הקיים כמו שהוא, כולל `--allow-dirty`. אין נעילה, אין baseline, ואין הרצה.

**התוכניות:**
- `mutation-plans.test.ts` מריץ `--check --allow-dirty`. בלי `--allow-dirty`, סקריפט שנערך ועדיין לא קומט היה מכשיל את התוכניות שלו מסיבה שאינה של התוכנית. ב-CI העץ נקי, ושתי הבדיקות זהות. כתוב בהערה בבדיקה וב-README.
- ה-id שומר את השם מהלוג (M7, F3, D2a). כשהשם מתנגש בין טיקים נוספה קידומת (`T48-M1`, `T34-C2`, `T50-R4`). כל note אומר מה נשבר ומאיזה טיק הוא בא.
- **מוטציות שזזו עם הקוד:** M3, M8, M9, M10, M17 ו-R6 של טיק 49 עברו ל-`maskedMeta` ב-`freeze-capture.mjs` בטיק 50. הן ב-`remask-captures.json` עם `file` של freeze-capture, והבדיקה היא עדיין זו של remask. B1 ו-B2 של טיק 50 הן C7 ו-C8 ב-`freeze-capture.json`.
- **A5 (render-watch):** ב-`maskView` של היום `inText` הוא סמן שזז רק קדימה, ולכן אין עריכה אחת שמשאירה בדיוק את ה-local part של כתובת `%40`. המקבילה (`text.slice(from, written === "%40" ? inText(sep) : start)`) משאירה את ה-local part ועוד שני תווים משובשים. זה עדיין שינוי התנהגות אמיתי, והוא נהרג.
- **מה לא נכלל, ולמה:**
  - טיק 49: R4 (שקולה, כפי שהמתקן הראה), R7 (לא נצפית), R8 ו-R9 (לא מתוארות בלוג).
  - טיק 50: R1 ו-R2 של הסוקר ב-render-watch, ו-R6-R8 של הסוקר ב-freeze-capture (לא מתוארות בלוג; R3 היא F4).
  - טיק 48: R1-R8 ו-R11 של הסוקר, ו-N11-N12 של המתקן (לא מתוארות בלוג; R9 ו-R10 כן, ונכללו).
  - טיק 43: 61 המוטציות של הבונה מתוארות רק לפי קטגוריות. כתבתי 25 לפי הקטגוריות (set-status, set-cell, insert-after, replace-in-line, repoint-capture, האינווריאנטים, קודי היציאה, `--dry-run`), ואת כל 21 של המתקן (D1a-D8b, R1, R4). R2 של הסוקר ("newline בהוספה") לא ברורה מספיק כדי לכתוב אותה.
  - טיק 38 (freeze-capture): 9 מוטציות מסדרת T ו-N1, שהקוד שלהן נשאר במקום. T1-T6, T8, T12-T16, T20, T22, U1-U4 ו-N2-N4 נוגעות בסורק הציטוטים ובהיסטוריה; לא שיחזרתי אותן. סדרת G מוטטה **קבצי נתונים** (מחקר, captures, `FROZEN.sha256`) שמשתנים בצדק (ה-re-mask של 5.10 שינה חלק מהם), ולכן אינה מתאימה לתוכנית קבועה.
  - טיק 35: Y1-Y5, F2b ו-F5c מוטטו את `render-watch.yml` ואת ה-README. מחוץ לתחום: הבריף אסר לגעת ב-yml.
  - טיק 33: 91 המוטציות של המתקן (כל חלופה של כל סמן) לא נרשמו אחת-אחת. כתבתי את שלוש המתוארות (סמן Radware, גבולות 400 ו-300).
- **מחוץ לתחום, נרשם ולא שונה:**
  1. ב-`/tmp` יש עשרות תיקיות `verify.*` מימים קודמים (verify.sh יוצר אחת לכל ריצה בלי `VERIFY_OUT`), ותיקיית `mutate-test-*` מ-04:53 שלא נוקתה. לא שלי, ולא נגעתי. בריצות שלי `VERIFY_OUT` הצביע לתיקיית ה-scratch.
  2. `CLAUDE.md` יכול להפנות בונים ל-`scripts/sim-tree.sh` ול-`src/__tests__/revenue/mutations/` (ה-thread הראשי עושה את זה, לפי הבריף).

## 5. שגיאות וניסיונות שנכשלו

- **מוטציה שבורה בתוכנית:** `I-target-dir` (loop-edit) החליפה את `if (...) root = dirname(parent);` ב-`root = dirname(parent);`. השורה הבאה מתחילה ב-`else if`, ולכן הקובץ לא נטען, ו-mutate.mjs סימן אותה "killed?" (vitest: "Tests no tests"). תוקנה ל-`if (true) root = dirname(parent);`, הורצה לבד, ונהרגה. העץ שנשמר אחרי היציאה 1 (`/tmp/sim-tree.R28QME`) נמחק לפי הנתיב שלו.
- **מוטציה ששרדה:** R6 של טיק 35 (הסיכום מציין את הנתיב המוחלט). כל בדיקות `--summary` מעבירות `--dir`, שנכתב כפי שניתן, ולכן אף אחת לא ראתה את ברירת המחדל. נוספה בדיקה (`--summary trolley-terms-of-service` בלי `--dir`), והמוטציה נהרגת.
- `sleep 60` בפקודה נחסם על-ידי הסביבה; עברתי ללולאות `until` ולריצות ברקע.
- הבדיקה החדשה ל-sim-tree של "עץ חלקי" צריכה git שנכשל רק ב-`init`. נכתב wrapper ב-bash שמפעיל את ה-git האמיתי בכל פקודה אחרת.

## 6. בדיקות ופעולות ולידציה

- Baseline: `npx vitest run src/__tests__/revenue/mutate.test.ts` — exit 0, 66 passed.
- TDD: `sim-tree.test.ts` לפני הסקריפט — exit 1, 17 failed; אחריו exit 0, 17 passed (אחר כך 19). בדיקות `--check` לפני הקוד — exit 1, 5 failed; אחריו `mutate.test.ts` exit 0, 71 passed. `mutation-plans.test.ts` עם תוכנית זמנית שה-find שלה לא קיים — exit 1 (בדיקת ה-`--check` שלה נכשלה); התוכנית הזמנית נמחקה ו-17 עוברות.
- `scripts/verify.sh src/__tests__/revenue/sim-tree.test.ts src/__tests__/revenue/mutation-plans.test.ts src/__tests__/revenue/mutate.test.ts` — exit 0 (typecheck exit 0; tests exit 0; 3 קבצים, 107 passed).
- `scripts/verify.sh` (ברירת המחדל, `src/__tests__/revenue`) — exit 0 (typecheck exit 0; tests exit 0; 75 קבצים, 2464 passed, 1 skipped — ה-`skipIf` הקיים של ארכיון ה-narration; 53 שניות).
- הרצות התוכניות (`node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/<name>.json`; render-watch, loop-edit ו-freeze-capture בתוך `scripts/sim-tree.sh -- node scripts/mutate.mjs ...`). בכל אחת ה-baseline עבר לפני ואחרי:

| תוכנית | רשומות | הוחלו | נהרגו | שרדו | זמן |
| --- | --- | --- | --- | --- | --- |
| `prize-dispatch.json` | 28 | 28 | 28 | 0 | 69 שניות |
| `capture-check.json` | 42 | 42 | 41 + R6 בהרצה חוזרת | R6, עד שנוספה בדיקה | 785 שניות (+ כ-50 להרצה החוזרת של R6) |
| `render-watch.json` | 53 | 53 | 53 | 0 | 117 שניות (בעץ sim) |
| `loop-edit.json` | 46 | 46 | 45 + `I-target-dir` אחרי התיקון | 0 (`I-target-dir` היה killed? כי היה שבור) | 188 שניות (בעץ sim) + כ-15 להרצה החוזרת |
| `freeze-capture.json` | 23 | 23 | 23 | 0 | 171 שניות (בעץ sim) |
| `remask-captures.json` | 45 | 45 | 45 | 0 | 523 שניות |
| `sim-tree.json` | 14 | 14 | 14 | 0 | 182 שניות |
| `mutate.json` | 6 | 6 | 6 | 0 | 243 שניות |

  בסך הכול 257 מוטציות, וכולן נהרגו (שתיים אחרי תיקון: בדיקה אחת חסרה, ורשומה אחת שבורה). אף תוכנית לא עברה 20 דקות.
- המוטציות על הקוד שלי (כולן killed):
  - `sim-tree.sh`, 14: S1 בלי ניקוי; S2 בלי `--keep`; S3 `exit 0`; S4 עץ שנכשל נמחק; S5 קישור תמיד; S6 `--dir` בתוך המאגר; S7 `--dir` קיים; S8 `TMPDIR` בתוך המאגר; S9 ref לא מוכר; S10 בלי `SIM_TREE`; S11 הפקודה רצה ב-checkout; S12 `add -A` בלי `-f`; S13 בלי trap של ניקוי; S14 בלי `info/exclude`.
  - `--check`, 6: K1 בלי ה-return המוקדם (רץ באמת); K2 בלי נתיבי בדיקה; K3 תמיד 0; K4 תנאי ה-`--cmd` הפוך; K5 תמיד `--allow-dirty`; K6 מדפיס ok תמיד.
- `ls -d /tmp/sim-tree.*` אחרי כל הריצות: ריק. כל עץ שהצליח נמחק על-ידי sim-tree, והעץ היחיד שנשמר (אחרי יציאה 1) נמחק ביד לפי הנתיב שלו.
- grep לשני חצאי שם המשתמש של בעל המאגר (case-insensitive) על כל הקבצים ששונו: 0. grep לכתובת בשורות שנוספו: 0. grep לשם מודל בשורות שנוספו: 0 (ארבע הפגיעות של התבנית הן שם הקובץ `CLAUDE.md` ושם הענף `claude/new-session-j071dx`, לא שם מודל).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **הלוגים לא שומרים את טקסט ה-find.** 257 הרשומות נבנו מתיאורים בעברית ומקריאת הקוד. מעכשיו בונה מוסיף רשומות ל-`mutations/<script>.json` עצמו, ו-`mutation-plans.test.ts` שומר אותן נכונות. בבריפים של בונים כדאי לכתוב "הוסף את המוטציות שלך לתוכנית של הסקריפט" במקום "כתוב תוכנית".
- סקריפט Python שכותב JSON ממחרוזות raw ובודק "פעם אחת בדיוק" נכתב כאן שוב. `--check` מחליף את חצי הבדיקה. את בעיית ה-escapes (תוכנית עם backslash) הוא לא פותר; עורך שקורא find/replace מקבצים היה פותר גם אותה, כפי שלוג טיק 50 הציע.
- ריצת תוכנית כבדה (capture-check, 13 דקות) נועלת את ה-worktree. הרצה בתוך `sim-tree.sh` מאפשרת לעבוד במקביל, ו-README מזכיר את זה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת חלקים גדולים מהסקריפטים כדי לכתוב find מדויק: render-watch (המסכה, כ-200 שורות), freeze-capture (כ-500), loop-edit (684), remask-captures (534), capture-check (כ-350). הכרחי, כי הלוגים לא שמרו את הטקסט.
- קריאת קטעי המוטציות בשמונה לוגים, חלקם (טיקים 38 ו-43) ארוכים בהרבה מהקטע הרלוונטי.
- ההרצה החוזרת של R6 ושל `I-target-dir`: קצרות.
- הרצת capture-check המלאה (13 דקות): זמן ולא אסימונים; הפלט נקרא רק דרך סינון שורות הסיכום.

## תוספת: תיקוני ה-fixer אחרי ה-review (5.10.2026)

### 1. מה המשתמש ביקש

לתקן כל ממצא "blocking" ו-"fix" של הסקירה האדברסרית של הענף (ב-`416adf3`), test-first, ולהחליט על כל "note". אחר כך: `scripts/verify.sh` על נתיבי הבדיקה של המפרט ועל כל חבילת ה-revenue, הרצה מחדש של המוטציות של הבונה ושל הסוקר שנוגעות בקוד שהשתנה, `--check` על כל התוכניות, ו-grep לכתובות ולמזהה הבעלים בקבצים ששונו.

### 2. הפעולות המרכזיות שביצעתי

- שחזרתי כל ממצא במאגר-סקראץ' בתיקיית ה-fixer, עם `TMPDIR` שמצביע לתוכה:
  - **המרוץ על `--dir` (blocking):** עשרה זוגות של שתי ריצות במקביל עם אותו `--dir`. רק בשני זוגות (3 ו-8) אחת הריצות סורבה (exit 2), ובזוג 3 גם הריצה השנייה נכשלה (128). בשמונה האחרים שתי הריצות עברו את בדיקת הקיום. קודי היציאה היו 1, 128 ו-0 בערבוב, למשל `fatal: cannot copy '.../templates/description' ... File exists` ו-`fatal: not a git repository`, וה-trap של אחת הריצות מחק את העץ שהשנייה בנתה.
  - **רמז ההסרה (fix):** עם `TMPDIR="<R>/case a/tmp dir"` ופקודה שיוצאת 7, השורה המודפסת הייתה `remove it with: rm -rf <R>/case a/tmp dir/sim-tree.DLjYUH`, בלי מרכאות.
  - **השמירה על `GIT_DIR` (fix):** עותק של הסקריפט בלי שורת ה-`unset` הורץ עם `GIT_DIR=<repo>/.git`. במאגר עצמו נוסף commit בשם `sim-tree: HEAD at 590805f…` מעל `one`. בסקראץ' בלבד; ה-commit בוטל אחר כך ב-`reset --soft`.
  - **`TMPDIR` ששווה לשורש (fix):** עותק בלי הזרוע `[ "$1" = "$root" ]` הורץ עם `TMPDIR=.` מהשורש, ובנה את `repo/sim-tree.MXe6wp` בתוך ה-checkout. הסקריפט האמיתי מחזיר exit 2.
  - **node_modules משותף (fix):** `echo probe > node_modules/written-from-sim-tree` בתוך העץ השאיר את הקובץ ב-node_modules של המקור, ו-exit היה 0.
  - **ה-notes:**
    - קישור תלוי כ-`--dir`, בעותק מוטנט R2: העץ נבנה ביעד של הקישור.
    - `gpgsign` גלובלי, בעותק מוטנט R3: `fatal: failed to write commit object`, exit 128.
    - `--dir ""`: נפל בשקט לתיקיית ה-temp של ברירת המחדל.
    - `--dir <R>/p1/p2/tree`: exit 0, ו-`p1/p2` נשארו ריקות.
    - `--check --json <F>/out.json`: exit 0, ולא נכתב קובץ.
- כתבתי קודם את הבדיקות. ב-`sim-tree.test.ts` נוספו 10:
  - ריקות ב-`--dir`;
  - קישור תלוי;
  - הורה חסר;
  - `TMPDIR` ששווה לשורש (כנתיב וכ-`.`);
  - מרוץ דטרמיניסטי;
  - מרוץ אמיתי של שלושה זוגות;
  - רמז עם רווחים;
  - משתני git של hook;
  - `gpgsign`;
  - כתיבה דרך node_modules.

  ב-`mutate.test.ts` נוספה אחת: `--check` עם `--json`. לפני הקוד: ב-sim-tree, exit 1 עם 5 נכשלות (ריקות, הורה חסר, שני המרוצים והרמז). ב-mutate, exit 1 עם נכשלת אחת. חמש הבדיקות האחרות עברו כבר על הקוד הקיים: הן בדיקות לשמירות שכבר קיימות, ומה שמוכיח אותן הוא המוטציות של הסוקר, שעכשיו נהרגות.
- `scripts/sim-tree.sh`:
  - ה-`--dir` נוצר ב-`mkdir` בלי `-p`. אם הנתיב קיים ברגע היצירה, הסירוב הוא "already exists". אם ההורה חסר, הסירוב הוא "cannot create --dir … (No such file or directory)". בשני המקרים exit 2, ושום דבר לא נוצר.
  - `--dir ""` מסורב.
  - בדיקת "הנתיב אינו מוחלט", שהייתה אחרי היצירה ולא הייתה ניתנת להשגה, הוסרה.
  - הרמז הוא עכשיו `rm -rf -- <printf %q>`.
  - הכותרת אומרת ש-node_modules משותף עם ה-checkout דרך הקישור, ושה-cache של vitest נכתב לשם.
- `scripts/mutate.mjs`: `--check` יחד עם `--json` הוא usage error (exit 2), והכותרת אומרת זאת.
- `mutations/README.md`: טבלת זמנים מדודים; שורה על הרצת תוכנית ארוכה בתוך `sim-tree.sh` כדי שה-worktree יישאר פנוי; האזהרה על node_modules.
- `mutations/sim-tree.json`: נוספו R1-R5 ו-R15 של הסוקר, ו-F1-F4 שלי (מ-14 ל-24 רשומות). `mutations/mutate.json`: נוספו R6-R8 ו-R18 של הסוקר, ו-K7 שלי (מ-6 ל-11).

### 3. קבצים/מערכות ששונו

- `scripts/sim-tree.sh`
- `scripts/mutate.mjs`: שורה אחת בקוד, ושתי שורות בכותרת.
- `src/__tests__/revenue/sim-tree.test.ts`: מ-19 ל-29 בדיקות. נוספו `simAsync`, ו-`treeOf` מקבל עכשיו נתיב עם רווחים.
- `src/__tests__/revenue/mutate.test.ts`: מ-71 ל-72.
- `src/__tests__/revenue/mutations/{README.md,sim-tree.json,mutate.json}`
- הלוג הזה.

אין שינוי ב-yml, בקבצי הלולאה, בלכידות או בקובץ ההוראות של המאגר.

### 4. החלטות והנחות משמעותיות

- **הורה חסר מסורב ולא נוצר.** הסוקר הציע שתי דרכים: לדרוש שההורה קיים, או למחוק רק את מה שהריצה יצרה. בחרתי בראשונה. היא נובעת ממילא מ-`mkdir` בלי `-p`, ולא משאירה שרשרת תיקיות ריקה. מחיקה של הורים "שיצרנו" הייתה מחזירה את בעיית המרוץ בקומה אחת למעלה.
- **מבחן המרוץ הדטרמיניסטי** משתמש ב-`realpath` מזויף ב-PATH. הוא יוצר את ה-`--dir`, עם `theirs.txt`, בין בדיקת הקיום לבין היצירה. המבחן תלוי בכך שהסקריפט קורא ל-`realpath -m` בין השתיים, וכתבתי זאת בהערה שלו. מבחן המרוץ האמיתי (שלושה זוגות במקביל, `sleep 1`) הוא בדיקת שפיות. לפני התיקון הוא נכשל, אבל ככלי להריגת מוטציה הוא לא דטרמיניסטי, ולכן F1 נשען על המבחן הדטרמיניסטי ועל מבחן ההורה החסר.
- **`--check --json` מסורב ולא נכתב.** זה השינוי הקטן מבין השניים שהסוקר הציע. ההחלטה על `--cmd` (נתיבי הבדיקה הם ארגומנטים של הפקודה) נשארת כפי שהיא, כפי שהסוקר כתב.
- **node_modules:** תיעוד בלבד, כפי שהמפרט ביקש קישור. נוספה בדיקה שמקבעת שכתיבה דרך הקישור נוחתת במקור, כך שאם הקישור יוחלף בהעתק, הבדיקה והתיעוד ישתנו יחד.
- **ה-archive של 260 MB** בבדיקה מול ה-checkout האמיתי נשאר כמו שהוא. הסוקר כתב "Acceptable now".
- **הבסיס זז** (ענף הבסיס ב-`1221ca4`, לא ב-`deb8acb`): לא נדרשת פעולה. המיזוג ייעשה ב-`scripts/merge-worktree.sh`.
- **מחוץ להיקף, לא תוקן:** sim-tree שנהרג מאות (למשל SIGPIPE כש-stderr מוזרם ל-`head -1`) אחרי שלב הבנייה משאיר את העץ, כי ה-trap חל רק על הבנייה. ראיתי זאת בשחזור: exit 141, והעצים בסקראץ' שלי נמחקו לפי הנתיב. זו אותה התנהגות כמו "נשמר אחרי כישלון", אבל בלי שורת הרמז.

### 5. שגיאות וניסיונות שנכשלו

- סקריפט ה-Python הראשון לעריכת `sim-tree.sh` כלל החלפה ריקה, שנכשלה ב-assert על מספר ההופעות. הסקריפט עוצר לפני הכתיבה, ולכן לא נכתב דבר. הרצתי שוב בלי ההחלטה הזאת.
- בשחזור, `| head -1` הרג את sim-tree ב-SIGPIPE (exit 141), והשאיר עצים בתיקיית ה-temp שלי בסקראץ'. מחקתי אותם לפי הנתיב. כך התגלתה הנקודה שבסעיף 4.
- ההפעלה הראשונה ברקע של שתי התוכניות: המעטפת שהפעילה אותן יצאה אחרי `sleep 2`, אבל תת-המעטפות המשיכו לרוץ. ההמתנה נעשתה על שורת `EXIT` בקבצי הלוג.

### 6. בדיקות ופעולות ולידציה

- TDD, לפני הקוד:
  - `npx vitest run src/__tests__/revenue/sim-tree.test.ts`: exit 1. מתוך 29: 5 נכשלו ו-24 עברו.
  - `npx vitest run src/__tests__/revenue/mutate.test.ts -t check`: exit 1. 1 נכשלה, 12 עברו.
- אחרי הקוד:
  - sim-tree: exit 0, 29 passed.
  - mutate: exit 0, 72 passed.
- `scripts/verify.sh src/__tests__/revenue/sim-tree.test.ts src/__tests__/revenue/mutation-plans.test.ts src/__tests__/revenue/mutate.test.ts`: exit 0. Typecheck exit 0, tests exit 0, 3 קבצים, 118 passed. הורץ פעמיים: לפני ה-commit ואחרי עדכון ה-README. שתי ההרצות עם אותה תוצאה.
- `scripts/verify.sh` עם ברירת המחדל, `src/__tests__/revenue`: exit 0. Typecheck exit 0, tests exit 0, 75 קבצים, 2475 passed ו-1 skipped (ה-`skipIf` הקיים). 49 שניות.
- התוכניות הורצו במלואן אחרי ה-commit `dea5416`, כל אחת בעץ sim משלה ושתיהן במקביל, ולכן הזמנים גבוהים מריצה בודדת. הפקודות: `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/<name>.json`. ה-baseline עבר לפני ואחרי בשתיהן.

| תוכנית | רשומות | הוחלו | נהרגו | שרדו | זמן | exit |
| --- | --- | --- | --- | --- | --- | --- |
| `sim-tree.json` | 24 | 24 | 24 | 0 | 349 שניות | 0 |
| `mutate.json` | 11 | 11 | 11 | 0 | 393 שניות | 0 |

- המוטציות על הקוד ששיניתי:
  - ארבע המוטציות של הסוקר ששרדו (R1, R2, R3, R15) נהרגות עכשיו.
  - נהרגות גם R4 ו-R5 של הסוקר, שנהרגו כבר אצלו.
  - ארבע המוטציות שלי נהרגות: F1 `mkdir -p`, F2 רמז בלי `%q`, F3 `--dir ""` מתקבל, F4 בלי הודעת "already exists" אחרי `mkdir` שנכשל.
  - ב-`--check`: R6, R7, R8 ו-R18 של הסוקר, ו-K7 שלי (`--json` לא מסורב).
  - 14 הרשומות של הבונה ב-sim-tree ו-6 ב-mutate נהרגות שוב.
- `node scripts/mutate.mjs --check --plan <file>` (בעץ נקי, בלי `--allow-dirty`) על כל שמונה התוכניות: כולן exit 0.
  - capture-check: 42/42.
  - freeze-capture: 23/23.
  - loop-edit: 46/46.
  - mutate: 11/11.
  - prize-dispatch: 28/28.
  - remask-captures: 45/45.
  - render-watch: 53/53.
  - sim-tree: 24/24.
  - סך הכול 272 רשומות.
- שחזור המרוץ אחרי התיקון מכוסה בשתי בדיקות: הדטרמיניסטית ושלושת הזוגות המקבילים. בכל זוג exit אחד 0 ואחד 2, והעץ של המנצח נשאר שלם עד הסוף.
- `ls -d /tmp/sim-tree.*` אחרי הריצות: אין כאלה. שני העצים של התוכניות נמחקו על-ידי sim-tree אחרי exit 0.
- grep על הקבצים ששיניתי (`git diff --name-only 416adf3 HEAD` ועוד הלוג הזה):
  - grep (case-insensitive) לשני חצאי שם המשתמש של בעל המאגר: 0, exit 1.
  - grep לתבנית של כתובת בשורות שנוספו: 0.
  - grep לשמות מודלים בשורות שנוספו: 0. ב-commit הם מופיעים רק בשורות ה-trailer.
- תיקיות `/tmp/verify.*` שנוצרו על-ידי `verify.sh` בהרצות שלי נשארו במקומן. זו התנהגות של הסקריפט, והבריף מתיר למחוק רק את תיקיית ה-fixer.

### 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- שחזור מוטציה של הסוקר נעשה ב-`sed` על עותק של הסקריפט ובהרצתו ידנית. זו מוטציה ידנית. `mutate.mjs` עושה את אותו הדבר על קובץ committed, ויכול להריץ פקודה אחרת ב-`--cmd`. אבל `--cmd` מפוצל לפי רווחים, ולכן פקודת הדגמה צריכה להיות סקריפט קטן בקובץ, לא `bash -c '…'`. בפעם הבאה אפשר לשחזר מוטנט כך, במקום עותק ידני.
- את קטעי ה-JSON של התוכניות שוב כתב סקריפט Python. `--check` תפס את התקינות מיד, אבל עורך תוכניות שקורא find/replace מקבצים עדיין חסר, כמו שכתוב בסעיף 7 של הבונה.

### 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `sim-tree.sh` ו-`sim-tree.test.ts` במלואם: הכרחי, כי רוב התיקונים שם.
- קריאת הרשימה של `mutate.test.ts` סביב `--check` ו-usage errors: קטע ממוקד.
- הלולאה של עשרה זוגות לשחזור המרוץ הדפיסה שורות `Done` של job control: רעש, כ-1.5K אסימונים.
- ההרצות המלאות של שתי התוכניות: זמן, לא אסימונים. נקראו רק שורות הסיכום.
