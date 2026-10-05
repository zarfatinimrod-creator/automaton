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
