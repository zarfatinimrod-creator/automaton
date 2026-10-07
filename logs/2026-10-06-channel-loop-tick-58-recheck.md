# טיק 58 (6.10.2026) — `robots-verdict.mjs --recheck`, ותיקון משפט eurocontrol.int של טיק 57

בונה Opus, ב-worktree נפרד על הענף `build/tick58-recheck` (בסיס: `origin/claude/new-session-j071dx` ב-`9f549cc`). לא נגעתי
ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, בפסיקות, ב-`research/measurements/*`,
ב-`urls.txt` או ב-`terms-verdicts.json`.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש (משימה מחושבת של workflow, לא הודעת בעלים), לפי `logs/CHANNEL_LOOP.md` §9, "Queued 6.10 (tick 54)" פריט 3:

1. מצב `node scripts/robots-verdict.mjs --recheck [--apply] [--site <site>] [--verdicts …] [--urls …] [--rendered …]`: לכל אתר
   NO_TERMS_ROBOTS_OK שה-source שלו מצטט עותק robots קפוא — להשוות את הלכידה החיה לעותק הקפוא ולומר unchanged / unreachable /
   refresh (הקפאת הלכידה החיה כעותק מתוארך חדש, FROZEN.sha256 עוקב, ה-source מצביע עליו, משפט מתוארך בהערה) / revert (חזרה ל-NO_TERMS,
   ההיסטוריה נשמרת, מילת הסוג "exhaustive-negative" נשארת, משפט מתוארך שמונה את הנתיב החסום). שיפוט מחדש דרך פונקציה משותפת עם
   `judgeSite`, לא העתק. dry run כברירת מחדל; exit 0 / 3 / 1. לא להביא שום דבר מהרשת, ולא לגעת באתר שאינו NO_TERMS_ROBOTS_OK.
2. לכתוב בהערת הכותרת את ההשלכה על `urls.txt` ב-revert: שורות הפרסים נחסמות ב-`termsGate` לפי הפסק, ה-probe נשאר פעיל, אין השהיה.
3. בדיקות ב-`robots-verdict.test.ts` (unchanged, לכידה חיה חסרה, 404 חי מול 200 קפוא, refresh, revert, `--site`, קודי יציאה, dry run
   על המאגר האמיתי) ולפחות 8 מוטציות ב-`robots-verdict.json`, הרצה ב-sim-tree, כולן נהרגות, ועדכון ה-README של התוכניות.
4. משפט אחד במקום שבו `robots-verdict.mjs` מתועד: מתי `--recheck` רץ ומה פירוש כל תוצאה.
5. תיקון נפרד: בפסקת "eurocontrol.int's robots verdict" של טיק 57 בהערת האודיט, הפסוקית "the page has not been fetched" שקרית מאז
   `23e17e7`; להחליף דרך `loop-edit.mjs replace-in-line` ולעדכן את הבדיקה ב-`prize-terms-audit.test.ts` שמקבעת את הפסקה כולה.
6. בדיקות: `verify.sh` ממוקד ומלא, `freeze-capture.mjs --cited`, ו-`--recheck` על המאגר האמיתי (צפוי: הכל unchanged, exit 3).

## 2. הפעולות המרכזיות שביצעתי

1. יצרתי את ה-worktree כפי שנכתב, `git log --oneline -1` (`9f549cc`) ו-`ls products/ src/revenue/` (הכל קיים, לא היה צורך ב-reset),
   קישור `node_modules`.
2. קראתי את `robots-verdict.mjs` כולו, את ראש `freeze-capture.mjs` ואת מסלול ההקפאה הבודדת (`sourceVersion`, `planFreeze`,
   `freezeCapture`, `recordFiles`, `existingCopy`), את 18 רשומות NO_TERMS_ROBOTS_OK, את זוגות הלכידות החיות/הקפואות, את שורות ה-probe,
   את שלוש הבדיקות, את תוכנית המוטציות, את יומני טיק 54 וטיק 57 ואת לוח הזמנים של `render-watch.yml` (`23 5 * * 2`).
3. **פיצול `judgeSite`**: שלבים 2-4 (הנתיבים בתור, לכידת ה-robots של כל host, החלטת כל נתיב) עברו ל-`judgeRobots`, שמחזירה גם `kind`
   (allowed / disallowed / no-page / no-capture / refused / unreachable) ואת הציטוטים. `judgeSite` קוראת לה וכותבת בדיוק מה שכתבה קודם.
   הציטוט עצמו עבר ל-`robotsCite`, ו-`parseRobotsSource` קוראת אותו בחזרה.
4. **`--recheck`** (`recheckSite` + `recheckMain`): לכל ציטוט — העותק הקפוא חייב להחזיק את מה שהציטוט אומר (url, fetchedAt, קידומת
   sha256 או סטטוס 404, בלוק `frozen`), אחרת error. לכידה חיה: חסרה או לא-קריאה → unreachable; בתים זהים, או 404 שנשאר 404 → unchanged;
   אחרת שיפוט מחדש ב-`judgeRobots` על העותק שהיה נקפא (תוכנית `freezeCapture` ב-dry run) → refresh או revert. ב-`--apply`: `freezeCapture`
   אמיתי (קבצים + FROZEN.sha256) ואז כתיבה דרך `serializeVerdicts`.
5. סימולציה מקדימה על העתק scratch של קבצי ה-robots, קובץ הפסקים והרשימות: שיניתי את ה-robots החי של agenthon (מתיר) ושל eurocontrol
   (חוסם את דף הפרס) → refresh ו-revert כצפוי; ריצה שנייה → unchanged; ההעתק נמחק.
6. כתבתי 15 בדיקות חדשות (סעיף 6), תיעוד ב-`research/rendered/README.md`, ותיקון פסקת eurocontrol דרך `loop-edit.mjs` (dry run קודם).
7. commit, ואז תוכנית המוטציות ב-`sim-tree.sh` לצד `verify.sh` המלא; מוטציה אחת שרדה, תיקנתי את הבדיקה, commit שני, וריצה
   שנייה של כל התוכנית: 76/76.
8. עדכון `mutations/README.md` (שורת התוכנית וזמן הריצה), יומן זה, `verify.sh` המלא על המצב הסופי.

## 3. קבצים/מערכות ששונו

- `scripts/robots-verdict.mjs` — `robotsCite`, `judgeRobots` (משותפת), `judgeSite` דרכה, `readRobotsCapture` מחזירה גם `bytes`,
  `readCaptureBySlug`, `parseRobotsSource`, `liveVersion`, `recheckSite`, `recheckMain`; `--urls` ניתן לחזרה (רק ב-`--recheck`);
  הערת כותרת חדשה ל-`--recheck` (כולל השלכת ה-revert על `urls.txt` ומתי הוא רץ).
- `src/__tests__/revenue/robots-verdict.test.ts` — 15 בדיקות חדשות (43 בקובץ).
- `src/__tests__/revenue/mutations/robots-verdict.json` — 25 רשומות T58 (22 על `--recheck`, אחת מהן על `freeze-capture.mjs`;
  3 על הפסקה המתוקנת), ו-T57-RF1 הופכה כיוון (76 רשומות).
- `research/rendered/README.md` — סעיף "The weekly re-check of NO_TERMS_ROBOTS_OK" ושורה מעודכנת על קריאת העותקים הקפואים.
- `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` — שורה 1998 בלבד, דרך `loop-edit.mjs replace-in-line`.
- `src/__tests__/revenue/prize-terms-audit.test.ts` — הפסקה המקובעת: הפסוקית החדשה מחושבת מהמטא של לכידת הפרס, משורת הכותרת
  שלה ומהפסק של ansperformance.eu; בדיקות לסטטוס, ל-fetchedAt, לשורה הראשונה ול-828 השורות.
- `src/__tests__/revenue/mutations/README.md` — שורת התוכנית וזמן הריצה.
- `logs/2026-10-06-channel-loop-tick-58-recheck.md` — יומן זה.

## 4. החלטות והנחות משמעותיות

- **רשימות ברירת המחדל של `--recheck`: שתיהן** (`research/rendered/urls.txt` ו-`research/measurements/ai-allowed-events.urls.txt`),
  כל שורה פעם אחת (`judgeRobots` מסננת כפילות url+slug). ב-17 מתוך 18 האתרים שורת הפרס נמצאת רק ברשימת המדידות, ופסקי טיק 54/57
  הוחלו עם `--urls` שלה; עם `urls.txt` בלבד לא היה נתיב לשפוט. שתי שורות terms מושהות של eurocontrol ושלוש של agenthon נספרות גם הן
  (הגדרת "queued" של `queuedPaths`), ולכן N במשפט ההערה יכול להיות גדול מ-N שב-source (agenthon: 4 מול 1).
- **refresh לא נוגע ב-`checked`**: "the rest of the entry byte-identical" — רק הציטוט מוחלף, וההמשך מ-": all N queued paths …" נשאר.
  **revert כן משנה את `checked` להיום**, כמו כל שינוי פסק של `judgeSite`.
- **source של revert**: `<הציטוט החדש>: <הנימוק של judgeRobots> (re-checked <date> by scripts/robots-verdict.mjs --recheck); ruling …;
  NO_TERMS_ROBOTS_OK before: <ה-source הישן>`. כך `judgeSite` יכול לשפוט את האתר שוב על robots.txt מאוחר יותר.
- **גם revert מקפיא** את הלכידה החיה, כדי שה-source לא יצטט לכידה שהריצה השבועית משכתבת (לקח ביקורת טיק 54).
- **רק המטא והקבצים שהוא מציין** נקפאים (`namedFiles`): גוף ישן שנשאר ליד מטא של 404 לא נכנס לעותק.
- **`liveVersion`**: כש-`--rendered` הוא `research/rendered` של מאגר git, ההקפאה עוברת דרך `sourceVersion` (מסרבת לשינויים שלא
  נכנסו ל-commit ונוקבת ב-commit); בתיקייה של בדיקה — הקבצים מהדיסק, commit null.
- **שם העותק**: עותק קיים עם אותם בתים (`existingCopy`), אחרת `<slug>-<יום fetchedAt>`, ואם השם תפוס — עם ה-commit, כמו `--cited`.
- **קוד 3 כולל unreachable**: "3 when every site is unchanged" לא מכסה אתר unreachable, שאינו שינוי ואינו שגיאה; בחרתי 3 = "אין מה
  לשנות" וכתבתי זאת בכותרת. **error לא עוצר את האחרים**: עם `--apply` שאר האתרים נכתבים, והיציאה 1.
- **שינוי ב-robots.txt בלי נתיב בתור** הוא error ולא refresh ריק: `judgeSite` לא קובע פסק בלי עמוד, ו-"all 0 paths still allowed"
  היה ריק מתוכן.
- **`--site` על אתר שאינו NO_TERMS_ROBOTS_OK, או שאינו בקובץ** — שגיאת שימוש (exit 1).
- **משפט ההערה** מתחיל באות גדולה ("Re-checked …") ומסתיים בנקודה, כי הוא משפט חדש; הנוסח בבקשה היה באות קטנה.
- **בדיקת המאגר האמיתי** מקבלת unchanged או unreachable (לא רק unchanged): robots.txt שעונה 503 לא ניתן לתיקון ב-`--recheck`, וחסימת
  CI בגללו לא הייתה מתקנת דבר; refresh / revert / error כן מפילים אותה (tripwire עד שה-tick מריץ `--apply`).
- **סעיף ה-README** הוא כמה משפטים ולא משפט אחד: כל אחת מחמש התוצאות צריכה משמעות.
- **שאלה פתוחה ל-thread הראשי**: unchanged לא שופט מחדש את הנתיבים, לפי התכנון. שורת פרס חדשה שה-intake השבועי מוסיף לאתר
  NO_TERMS_ROBOTS_OK על נתיב ש-robots.txt שלו (שלא השתנה) חוסם עוברת את `termsGate`, כי השער בודק רק את הפסק. render-watch עדיין
  בודק robots.txt לפני כל הבאה, ולכן היא לא תובא בפועל. אם רוצים לסגור את זה גם בקובץ הפסקים, מספיק להריץ את `judgeRobots`
  גם על unchanged (זול).
- **פסקת eurocontrol**: הדירוג BLOCKED (`c276517`, ב-`origin` אחרי הבסיס שלי) לא מוזג לענף, לפי ההוראה; הבדיקה מחשבת את זמן
  ההבאה, הסטטוס, שורת הכותרת והפסק של ansperformance.eu, והמילה BLOCKED מקובעת כטקסט. אחרי המיזוג אפשר לבדוק גם את שורה 39 בטבלה.

## 5. שגיאות וניסיונות שנכשלו

- **הפרת כלל רשת**: הרצתי פעם אחת `git fetch -q origin` בתיקיית ה-checkout הראשי כדי לבדוק אם הבסיס זז. זו פעולת רשת שהבריף אסר.
  היא עדכנה רק את ה-ref המרוחק `origin/claude/new-session-j071dx` (ל-`735d0ca`). שום עץ עבודה וענף מקומי לא השתנו. לא חזרתי עליה.
- הרכבת הסקריפט מחלקים השאירה שתי שורות ריקות כפולות; כיווצתי אותן (בדקתי שבמקור אין כאלה).
- `node -e '…'` עם גרש בתוך המחרוזת ("run's") שבר את המירכאות של ה-shell; עברתי לסקריפטי עריכה בקבצים בתיקיית ה-scratch.
- **מוטציה ששרדה**: בריצה הראשונה T58-RC15 (revert שמשאיר את ה-checked הישן) שרדה, כי ה-fixture קבע את הפסקים בתאריך של היום
  (2026-10-06), כך ש-checked הישן והחדש זהים. ה-fixture קובע אותם עכשיו ב-2026-10-01, והבדיקה דורשת את שני הערכים.
- ניסוח ראשון של בדיקת ה-unreachable השתמש ב-`"0 unchanged".replace(...)` — מגושם; הוחלף בשורת totals מלאה.

## 6. בדיקות ופעולות ולידציה

- **`--recheck` על המאגר האמיתי** (`node scripts/robots-verdict.mjs --recheck`, dry, מתוך ה-worktree): exit 3. שורת הפתיחה
  `robots-verdict --recheck: 18 NO_TERMS_ROBOTS_OK site(s); queued paths from research/rendered/urls.txt, research/measurements/ai-allowed-events.urls.txt (dry run; --apply writes)`;
  18 שורות `unchanged` — 12 "the live capture research/rendered/robots-<x>.txt is the bytes of the frozen copy … (sha256 …)"
  (agenthon, aicrowd, alignmentforum, crunchdao, drivendata, eurocontrol, geminixprize, health-data-hub, ijcai-2026, k12-ai-infrastructure,
  sophelio, wundernn) ו-6 "answered 404, as the frozen copy … did (404): no rules either way" (bcamlc, learn2design2026, microblink,
  pasteurlabs, solafune, thinkonward); `totals: 18 site(s): 18 unchanged, 0 unreachable, 0 refresh, 0 revert, 0 error`;
  `dry run: nothing written`.
- **בדיקת עקביות על המאגר**: לכל 18 האתרים `parseRobotsSource` קורא את ה-source, העותק המצוטט קפוא ורשום ב-FROZEN.sha256,
  ו-`robotsCite` על העותק כותב את הציטוט מילה במילה (נבדק גם ב-`it` קבוע); `judgeRobots` על העותקים הקפואים עם שתי הרשימות: 18/18
  allowed (agenthon 4 נתיבים, eurocontrol 3, crunchdao 3, wundernn 2, השאר 1).
- **סימולציה ידנית** (העתק scratch, לא המאגר): robots חי של agenthon שמתיר → refresh, `robots-agenthon-2026-10-13` נקפא, ה-source
  והמשך ה-source זהים מלבד הציטוט; robots חי של eurocontrol שחוסם את דף הפרס → revert ל-NO_TERMS, ה-source מסתיים ב-"NO_TERMS_ROBOTS_OK
  before: " והישן; ריצה שנייה → 17 unchanged, exit 3; `judgeSite` על eurocontrol אחרי ה-revert מסרב ("robots.txt disallows 1 queued path").
- `npx vitest run src/__tests__/revenue/robots-verdict.test.ts`: 43 עברו (28 לפני; 15 חדשות: parseRobotsSource ×2, unchanged,
  unreachable ×4 מצבים, refresh, 404↔קובץ, revert, אתר שאינו ROBOTS_OK, `--site`, error, אין נתיב בתור, פורמט, commit של git, כפילות,
  המאגר האמיתי).
- `npx vitest run src/__tests__/revenue/prize-terms-audit.test.ts`: 71 עברו.
- `scripts/verify.sh` ממוקד (robots-verdict, prize-terms-audit, frozen-citations, mutation-plans, queue-zero-test, prize-dispatch):
  exit 0 (typecheck 0, tests 0, 6 קבצים, 257 בדיקות) — על ה-commit הראשון, ושוב על המצב הסופי.
- `scripts/verify.sh` המלא: exit 0 על ה-commit הראשון (80 קבצים, 2749 עברו, 2 skipped, 86 שניות); ושוב exit 0 על המצב הסופי (`8a793d7` ועדכון ה-README של התוכניות והיומן לפני ה-commit: 80 קבצים, 2749 עברו, 2 skipped, 72 שניות).
- `node scripts/freeze-capture.mjs --cited`: exit 0 ("0 citation(s) by line of an active capture"; 0 to repoint, 0 refused).
- `node scripts/mutate.mjs --check --allow-dirty --plan …/robots-verdict.json`: 76 of 76 would apply (כולל T54-R1..R4 על `judgeSite`
  אחרי הפיצול).
- **מוטציות** ב-`scripts/sim-tree.sh -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/robots-verdict.json`
  (TMPDIR בתיקיית ה-scratch): ריצה 1 על `8b0cffe` — 76 הוחלו, 75 נהרגו, **1 שרדה** (T58-RC15: revert שמשאיר את ה-checked הישן;
  ה-fixture קבע את הפסקים ביום הריצה עצמה, 2026-10-06), 347 שניות, sim-tree יצא 1 והשאיר את העץ, שנמחק בנתיבו המוחלט. תיקון: ה-fixture
  קובע את הפסקים ב-2026-10-01 והבדיקה דורשת `[old.checked, entry.checked] = ["2026-10-01", today]`. ריצה 2 על `8a793d7` — 76 הוחלו,
  **76 נהרגו**, 0 שרדו, 0 timeout, 338 שניות, sim-tree יצא 0 והסיר את העץ.
- grep השמות (`git grep -n -i -E` על שני חצאי הדפוס) על כל קובץ ששונה: exit 1 (לא נמצא דבר) לפני כל commit; חיפוש כתובות דואר בשורות
  שנוספו: ריק.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **בניית fixture של לכידות robots** (מטא + גוף + עותק קפוא + FROZEN.sha256): נכתבה כאן כ-`writeRobots`/`recheckFixture`, ובטיק 54
  נבנתה שוב בסקריפט scratch. עזר משותף ב-`src/__tests__/revenue/helpers/` היה חוסך את הפעם הבאה.
- **עריכת קבצים עם טקסט שמכיל גרשים ו-backticks**: בכל טיק נכתב סקריפט node חד-פעמי עם `rep(find, replace)` שבודק ייחודיות.
  זה בדיוק `mutate.mjs`-style find/replace; פקודת `edit-unique --file --find-file --replace-file` הייתה מונעת את השבירה של ה-shell.
- **הרצת `--recheck` אחרי כל ריצה שבועית**: כרגע ה-tick של 07:11 צריך לזכור. צעד ב-`render-watch.yml` שמריץ `--recheck` (dry)
  ומדפיס את התוצאה ל-job summary היה מראה שינוי כבר ב-05:23.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `freeze-capture.mjs` (1,396 שורות) בשלושה חלקים, כולל `cited` כולו — נחוצה רק כדי לראות איך `--cited` נותן שם לעותק כשהשם
  תפוס; פונקציה מיוצאת (`copyName`) הייתה חוסכת את הקריאה.
- הדפסת כל 18 ה-source המלאים בבת אחת (47KB) — מספיק היה ראש ה-source עד "NO_TERMS before:", כפי שעשיתי מיד אחר כך.
- הרצת `--recheck` בסימולציה פעמיים (dry ו-apply) והדפסת הפלט המלא של `checkManifest` (מאות שורות חסרות בהעתק החלקי) — הדבר
  היחיד שהיה צריך משם הוא שאין בעיה בשני העותקים החדשים.

## Review fixes

תיקוני הסקירה של `2e2f721` (אותו יום, Opus fixer). הסוקר מצא ממצא blocking אחד, שני ממצאי fix וכמה הערות; כל ה-exit codes
שלמטה נמדדו בהרצה, לא הועתקו.

### מה התבקש
לתקן כל ממצא blocking ו-fix (הערה רק כשהיא קלה ובטוחה), בלי להחליש בדיקה ובלי לשנות את התכנון שבתדריך; להריץ מחדש verify
ממוקד ומלא, כל תוכנית מוטציות שנגעתי בה, כל מוטציה ששרדה אצל הסוקר (נוספת לתוכנית ונהרגת), ואת ההוכחה מקצה לקצה של refresh ו-revert.

### מה עשיתי
1. **מיזוג הבסיס.** `origin/claude/new-session-j071dx` (ה-ref המקומי, `a2c44b4`, כולל `c276517`) התקדם מעבר לבסיס `9f549cc`, ולכן
   מוזג ב-`--no-ff` (`fe5a023`). בלי rebase, בלי stash, בלי fetch.
2. **Blocking: 200 שהפך ל-404 ליד גוף ישן, במצב מאגר.** קודם בדיקה (TDD): מאגר git בתיקייה זמנית, לכידה של 6.10 עם robots.txt של
   יותר מ-1,000 תווים, commit של מטא 404 שמשאיר את ה-.txt על הדיסק, ו-commit לא קשור אחריו. היא נכשלה בדיוק כמו אצל הסוקר
   (`froze robots-law -> robots-law-2026-10-06 (already frozen)`). התיקון: `liveVersion` משווה את המטא ש-`sourceVersion` החזיר למטא
   החי. כשהם שונים (ה-fallback של fetch שנכשל), הגרסה היא הקבצים שעל הדיסק (נקיים: `sourceVersion` כבר בדק) עם ה-commit האחרון
   שכתב את המטא; `planCopy` כבר משאיר רק את המטא ואת מה שהוא מציין (`namedFiles`), כך שהגוף הישן לא נכנס לעותק. בנוסף שומר ב-`recheckSite`:
   עותק מתוכנן שאינו התשובה החיה (סוג אחר, סטטוס אחר או בתים אחרים) הוא שגיאה, ושום דבר לא מוקפא ולא נכתב.
3. **Fix 1: `--apply` השאיר את ה-CI אדום.** בחרתי באפשרות הראשונה של הסוקר, שחזור, ולא רק ברשימת pins: `isRecheckOf(now, before)`,
   `parseRevertSource` ו-`beforeRechecks(sites, base)` ב-`robots-verdict.mjs`, ו-fixture של 18 רשומות ה-NO_TERMS_ROBOTS_OK כפי
   שהיו ב-`5c980e3` (sha256 נעוץ, השוואה ל-`git show` כשה-commit זמין). `verdicts()` של `prize-terms-audit.test.ts` עובר דרך
   `verdictsOf`, וכך גם הקריאות הישירות של הקובץ במבחני טיקים 54, 56 ו-57 וההרצות החוזרות של `judgeSite` בהם. שני מבחני ה-CLI
   "declines … on the committed files" רצים על עותק scratch של הקובץ המשוחזר, ומבחן ה-parse של המקורות הקיימים מכסה גם אתר שהוחזר.
   רשומה ששונתה ביד, או verdict חדש אחרי revert, לא מוחזרת, ולכן המבחנים עדיין רואים אותה. מבחן טיק 55 שנעץ את הלכידה החיה של
   eurocontrol.int (status 200) קורא עכשיו את העותק הקפוא שלה, שמחזיק את אותה עובדה ולא נכתב מחדש. T57-D7 ו-T57B-D4 בתוכנית הוזזו
   מהמשפט האחרון של ההערה, שמשפט re-check היה מעלים.
4. **Fix 2: בדיקות שלמות בלי מבחן.** מבחנים ל-URL, ל-fetchedAt, לסוג (קובץ מול 404) ולסטטוס (410 מול 404) של העותק הקפוא, כל אחד עם
   ההודעה המדויקת; שינוי באותו אורך בבתים (RV1); ספירת הנתיבים של המקור מול זו של המשפט (RV9); dry run על קובץ לא קנוני משאיר אותו
   כמות שהוא (RV15, הערה).
5. **תוכנית המוטציות.** נוספו 26 רשומות T58-FX: שבע הניצולות של הסוקר (RV1, RV9, RV15, RV17, RV18, RV20, RV21), `liveVersion`, השומר,
   `isRecheckOf`, `parseRevertSource`, `beforeRechecks` והשחזור במבחן. T58-RC20 הוזז לקוד החדש. בריצה הראשונה (102) שרדה FX2: מסנן
   `namedFiles` שני ב-`liveVersion`, ש-`planCopy` כבר מפעיל. זו מוטציה שקולה, ולכן היא הוסרה מהתוכנית והמסנן הוסר מהקוד.

### קבצים ששונו
`scripts/robots-verdict.mjs`, `src/__tests__/revenue/robots-verdict.test.ts`, `src/__tests__/revenue/prize-terms-audit.test.ts`,
`src/__tests__/revenue/fixtures/terms-verdicts-5c980e3-robots-ok.json` (חדש), `src/__tests__/revenue/mutations/robots-verdict.json`,
`src/__tests__/revenue/mutations/README.md`, `research/rendered/README.md` והיומן הזה. לא נגעתי ב-`terms-verdicts.json`, ב-`urls.txt`,
ב-`research/measurements/*` או בקבצי הלולאה.

### החלטות
- **שחזור, לא רק תיעוד:** טיק 07:11 של יום שלישי לא צריך לכתוב fixtures ביד על כל שינוי של robots.txt. ההגנה מפני הסתרה:
  `isRecheckOf` מקבל רק את צורת השכתוב המדויקת (refresh: רק הציטוט ומשפטי re-check; revert: הצורה, היום וההיסטוריה).
- **`urls-pause-comments --fix` לא נכנס ל-`--recheck`:** לפי התכנון `--recheck` לא משנה דבר ב-urls.txt. זה צעד מתועד, שנחוץ רק
  ל-agenthon.net ול-eurocontrol.int.
- **revert ממשיך לקבוע את `checked` ליום,** כמו אצל הבונה.
- **הערות שהשארתי להכרעת המשנה הראשי:** N במשפט מול המקור (לפי התכנון, ועכשיו גם נבדק); revert בגלל דף terms מושהה שכבר נקרא;
  robots.txt שלא השתנה לא נשפט מחדש (השאלה הפתוחה של הבונה); המילים "the row" בפסקה של eurocontrol.int.

### שגיאות וניסיונות שנכשלו
- **ריצות vitest שנתקעו:** שלוש ריצות `npx vitest run` בלי נתיב (שכוללות בדיקות מחוץ ל-`src/__tests__/revenue`) נתקעו כ-15 דקות.
  עצרתי את שלושת תהליכי ה-vitest שלי לפי PID (לא לפי תבנית) והרצתי שוב על `src/__tests__/revenue`.
- **ארטיפקט בהוכחה:** ריצת e2e אחת העתיקה את ה-worktree לפני שעדכנתי את T58-RC20, ולכן mutation-plans נכשל שם. הרצתי שוב.
- **מבחן רגיש לעומס:** `sim-tree.test.ts` ("stopped by a signal") נכשל פעמיים כשרצו 3-4 ריצות במקביל. הוא עובר ב-verify המלא על ה-worktree.

### בדיקות ו-exit codes
| בדיקה | תוצאה |
|---|---|
| verify ממוקד (robots-verdict, prize-terms-audit, frozen-citations, mutation-plans, queue-zero-test, prize-dispatch) | exit 0, 6 קבצים, 265 מבחנים |
| verify מלא | exit 0, 80 קבצים, 2757 עברו, 2 דולגו |
| `freeze-capture --cited` | exit 0 |
| `--recheck` dry על המאגר האמיתי | exit 3, 18 מתוך 18 unchanged |
| `mutate.mjs --check` | 101 מתוך 101 חלות |
| תוכנית המוטציות ב-sim-tree | 101 מתוך 101 נהרגו, 755 s (ריצה ראשונה: 102, 101 נהרגו, FX2 שרדה, 767 s) |

**הוכחה מקצה לקצה** על עותקים של המאגר (sim-tree): הלכידות החיות שונו כפי שריצה שבועית הייתה כותבת אותן, ואז commit, dry,
`--apply`, `--fix` (אחרי revert), commit, ריצה שנייה, `--cited`, `sha256sum -c` ו-verify מלא:
- **16 האתרים שאינם agenthon.net ו-eurocontrol.int:**
  - refresh: הריצה השנייה exit 3, verify מלא exit 0.
  - revert: הריצה השנייה exit 3, verify מלא exit 0.
  - 200 שהפך ל-404: ‏10 refresh. aicrowd, ‏health-data-hub ו-wundernn קיבלו עותק של המטא לבד שמצטט 404, משפט אחד, ו-commit
    המטא נקרא בשם. הריצה השנייה exit 3, verify מלא exit 0.
- **כל 18 האתרים:**
  - refresh: נכשל רק mutation-plans (T57-D2, ‏D5, ‏D6, ‏T57B-D2).
  - revert עם `--fix`: נכשלים mutation-plans (6 רשומות) ו-7 מבחנים שנועצים את הערת ההשהיה של שני האתרים. זה תואם בדיוק לרשימה
    שבכותרת.
- **לפני התיקון,** על אותם עותקים: revert של 18 האתרים הפיל 35 מבחנים, ו-refresh הפיל 11.

ה-grep של השם וה-grep של כתובות על כל קובץ ששונה: ריקים.

### עבודה ידנית שכדאי להפוך לאוטומטית
- **סימולציה של יום שלישי:** "לשנות לכידות robots חיות, להריץ `--recheck --apply`, ואז את כל הבדיקות". בניתי אותה ב-scratch
  (`mutate-live.mjs` ו-`e2e-final.sh`). סקריפט `scripts/recheck-sim.sh` היה מאפשר לטיק 07:11 לבדוק לפני commit מה עוד יידרש.
- **הערות ההשהיה ב-urls.txt:** שחזור שלהן לפני re-check (כמו `beforeRechecks`) היה סוגר את שבעת המבחנים של agenthon.net
  ו-eurocontrol.int.

### על מה בוזבזו אסימונים
- **שלוש ריצות vitest מלאות שנתקעו** (כ-19 דקות), כי לא הגבלתי אותן לנתיב.
- **ריצת e2e דרך `verify.sh`,** שמדפיס רק את 10 ה-FAIL הראשונים. היה צריך להריץ שוב עם דוח JSON כדי לקבל את כל הרשימה.
