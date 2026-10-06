# 2026-10-06 — לולאת הערוצים, טיק 52: סקריפט החלת הקריאה וסקריפט השיגור (הבונה)

## 1. מה המשתמש ביקש

ה-thread הראשי (טיק 52) ביקש לבנות את `logs/CHANNEL_LOOP.md` §9, "Queued 5.10 (tick 51)", פריט 1 (פריט 7 של טיק 49): שתי השרשראות שה-thread הראשי הריץ ביד חמש וארבע פעמים בטיקים 47-51.

- **חלק א**: `scripts/prize-apply-reading.mjs <workflow-output.json>... [--table] [--apply] [--json]` — התאים הסופיים של המאמת (`finalClauseCell`, `finalGrade`, `finalQualifies`) נכתבים לשורה בטבלה `research/measurements/ai-allowed-events.md` שתא ה-Event URL שלה הוא כתובת האירוע, וכל בית אחר נשמר; סירוב לפני כל כתיבה לתא עם `|`, ירידת שורה, כתובת בכל צורה, מצביע ללכידה שאינה קיימת; ריצה יבשה כברירת מחדל; `--apply` כותב, מדפיס את מצבי השורות ומריץ את בדיקות ה-prize.
- **חלק ב**: `scripts/render-dispatch.sh <lines-file> <ref> [--wait-seconds N] [--no-wait] [--gh <cmd>]` — אימות במפענח של render-watch ובשער התנאים, שיגור render-watch.yml, מציאת הריצה, המתנה, fetch ו-fast-forward, `capture-check`, ודוח כתובות לפי סוג. נבדק מול `gh` מזויף ו-origin חשוף (bare) בתיקייה זמנית, בלי רשת.
- **חלק ג** (אם יש זמן): `scripts/sim-tree.sh` לוכד INT, TERM, HUP ו-PIPE אחרי שהעץ קיים, משאיר את העץ, מדפיס את נתיבו עם פקודת הסרה מצוטטת ויוצא ב-128 ועוד מספר האות; בדיקה ששולחת SIGTERM; מוטציה ב-`mutations/sim-tree.json`.
- כללים: worktree בלבד, בלי `git stash`, בלי רשת ובלי קריאות GitHub, בלי push ובלי merge, בלי כתובות ובלי מזהה של הבעלים בקבצים, תיקיית scratch אחת בשמה המלא שנמחקת בסוף, מוטציות בתוך `sim-tree.sh`, אימות לפי קודי יציאה.

## 2. הפעולות המרכזיות שביצעתי

1. **הכנה**: הבסיס `f0fae38` (צאצא של `891a5ca`; `products/` ו-`src/revenue/` קיימים), worktree על הענף `build/tick52-reading-dispatch-scripts`, `pnpm install --frozen-lockfile` (exit 0), בסיס בדיקות ה-prize (`prize-dispatch` + `prize-intake-rules`): exit 0, ‏80 בדיקות. שני פלטי ה-Workflow האמיתיים וקובץ השורות של RoboSyn הועתקו לתיקיית ה-scratch כ-fixtures בלבד (לא נכנסו ל-commit).
2. **קריאה**: עוזר ה-Python של ה-thread הראשי (`apply-grades.py`: התאמה לפי תא `<url>`, תאים 6-8, כל השאר בית-בבית, exit 2 למפתח שמתאים ל-0 או ל-2 שורות, diff מאוחד), `parseAiAllowedTable`/`rowState`/`renderSlug`, `prize-dispatch.mjs`, המפענח של `render-watch.mjs` ו-`--needs-browser`, `capture-check.mjs`, `render-watch.yml`, `termsGate`, `domainKind`, `mutations/README.md`.
3. **חלק א, בדיקות קודם** (`src/__tests__/revenue/prize-apply-reading.test.ts`): טבלת fixture מועתקת מהטבלה המחויבת בזמן ריצה לתיקייה זמנית, פלטים סינתטיים בשתי הצורות (`[...]` ו-`{result: [...]}`, עם הערה אחרי ה-URL כמו בפלט האמיתי). אחר כך הסקריפט. האדום הראשון: 3 כשלים (שניים בביטויים של הבדיקות עצמן, ואחד — המשפט בשלב 3 — שעוד לא נכתב, כמצופה). commit `43ccca0`.
4. **משפט אחד בשלב 3** של "How a reading session fills a row", זהה בתבנית של `src/revenue/ai-allowed-events.ts` ובטבלה המחויבת (רק שורת הכותרת הזו בטבלה שונתה; אף תא לא נכתב): ``A reading workflow's output is applied with `node scripts/prize-apply-reading.mjs <output.json> --apply` ...``. בדיקת ההסכמה הקיימת (`prize-dispatch.test.ts`, preamble זהה לתבנית) עברה, ונוספה בדיקה שהמשפט נמצא בשתיהן.
5. **ריצה יבשה על הטבלה האמיתית** עם שני הפלטים האמיתיים — סעיף 6.
6. **חלק ב, בדיקות קודם** (`src/__tests__/revenue/render-dispatch.test.ts`): לכל מקרה "עולם" — origin חשוף בשם `.../fixture-owner/fixture-repo.git` (כך owner/repo נקראים מה-URL שלו), checkout של הענף עם העתקי הסקריפטים, פסקי תנאים מזויפים ו-`research/rendered/urls.txt`, ו-origin שמקדים את ה-checkout ב-commit של שתי לכידות (אחת עם מסכה, אחת נקייה, ואופציונלית כתובת גולמית שנבנית מחלקים בזמן ריצה). `gh` מזויף רושם כל קריאה ועונה JSON קבוע: רשימת הריצות הראשונה מחזירה רק ריצה ישנה וריצה על ענף אחר, השנייה גם את הריצה הנכונה; הריצה `in_progress` ואחר כך `completed`. commit `6c19aec`, יחד עם המשפט בכותרת של `prize-dispatch.mjs` ובדיקת ההסכמה שלו.
7. **בדיקת עשן אמיתית**: קובץ השורות של RoboSyn מטיק 51 (שלוש שורות `js`) דרך `render-dispatch.sh ... --no-wait` עם `gh` מזויף (נעצר לפני כל fetch, בלי רשת): המפענח exit 0 (`js=true`), השער exit 0, וגוף השיגור **זהה** לגוף שה-thread הראשי בנה ביד בטיק 51 (`dispatch-robosyn3-body.json`).
8. **תוכניות מוטציה** ליד הבדיקות: `mutations/prize-apply-reading.json` (21) ו-`mutations/render-dispatch.json` (14), שורות ב-`mutations/README.md` ובשמות החובה של `mutation-plans.test.ts`; `--check` exit 0 על שתיהן; commit `d643dba`; שתיהן רצו בתוך `sim-tree.sh` (במקביל, כל אחת בעץ משלה בתיקיית ה-scratch).
9. **חלק ג**: הבדיקה נכתבה ונכשלה על הסקריפט הישן (`{code: null, signal: 'SIGTERM'}` במקום `{code: 143}`), התיקון, ירוק (30 בדיקות sim-tree), ארבע מוטציות חדשות; commit `fbd35b1`; כל `sim-tree.json` (28) רץ בתוך `sim-tree.sh`.
10. `verify.sh` על קבצי המפרט ועל כל חבילת ה-revenue, טבלת הזמנים ב-README, והלוג הזה.

## 3. קבצים/מערכות ששונו

נוספו:
- `scripts/prize-apply-reading.mjs`
- `scripts/render-dispatch.sh` (ניתן להרצה)
- `src/__tests__/revenue/prize-apply-reading.test.ts` (25 בדיקות ועוד אחת שרצה רק עם `PRIZE_APPLY_REAL_OUTPUTS`)
- `src/__tests__/revenue/render-dispatch.test.ts` (15 בדיקות)
- `src/__tests__/revenue/mutations/prize-apply-reading.json`, `src/__tests__/revenue/mutations/render-dispatch.json`
- `logs/2026-10-06-channel-loop-tick-52-reading-dispatch-scripts.md`

שונו:
- `src/revenue/ai-allowed-events.ts` ו-`research/measurements/ai-allowed-events.md` — משפט אחד בשלב 3, זהה בשניהם (בטבלה: רק השורה הזו).
- `scripts/prize-dispatch.mjs` — פסקת `DISPATCHING` בכותרת (קוד לא שונה).
- `scripts/sim-tree.sh` — הלכידה (חלק ג).
- `src/__tests__/revenue/sim-tree.test.ts` — בדיקת ה-SIGTERM.
- `src/__tests__/revenue/mutations/sim-tree.json` — 4 מוטציות `T52-*`.
- `src/__tests__/revenue/mutations/README.md` — שתי שורות תוכנית, "ticks 51, 52" ל-sim-tree, וזמני הריצה.
- `src/__tests__/revenue/mutation-plans.test.ts` — שתי התוכניות החדשות ברשימת החובה.

לא נגעתי בקובץ ה-checkpoint, בקובץ הלולאה ובקובץ התור תחת `logs/`, ב-`MISSION.md`, בקובץ ההוראות של המאגר, בתאי הטבלה, ב-`research/rendered/` או ב-`urls.txt`. בלי push, בלי merge, בלי רשת.

## 4. החלטות והנחות משמעותיות

**prize-apply-reading.mjs**
- **התאים של המאמת נכתבים תמיד**; `gradeVerdict` רק מדווח. מאמת ש"שינה" הוא המילה האחרונה; מאמת ש"קיבל" נותן את אותם תאים. פריט בלי בלוק `verify` נדחה.
- **המפתח** הוא שדה ה-url עד הרווח הראשון, מושווה לתא `<url>` בשלמותו (לא תחילית ולא תת-מחרוזת). 0 או 2 שורות → exit 2 (כלל העוזר); שני פריטים לאותו מפתח → שניהם נדחים (exit 1). שורה "Listed again" שחולקת URL עם שורת הרבעון הסגור תמיד תתאים לשתי שורות — אותו כלל כמו בעוזר, וזה מכוון: את השורה הזו מכריעים ביד.
- **כלל התא של העוזר**: רווחים ו-tab מתכווצים לרווח אחד וקצוות נחתכים; ירידת שורה נבדקת **לפני** הכיווץ ונדחית. `|` לא מוברח נדחה; `\|` נשמר כפי שנכתב (העוזר הבריח כל `|`, גם `\|` שכבר הוברח — לא אידמפוטנטי; כאן כן).
- **כתובות**: נדחה כל @ בין תווי מילה, `%40`, `\u0040`/`\x40`, `&#64;`/`&#x40;`, וכל מסכה `[redacted:email]` (עם דומיין או בלי) — תא נושא סוגים בלבד. רחב בכוונה מהממסך של render-watch (גם שם קובץ כמו `logo@2x.png` יידחה); אף תא בטבלה היום לא מכיל @ או `%40`. הודעת הסירוב נותנת את הצורה, לא את הטקסט.
- **מצביעים**: `research/rendered/<file>[:N[-M]]` — קובץ לכידה (`.txt/.html/.pdf/.json/.xml`, לא `urls.txt` ולא `.meta.json`, כמו `rowState`), קיים ב-`--rendered`, עם `<slug>.meta.json`, וכל מספר שורה בין 1 לשורה האחרונה (שני קצוות טווח נבדקים).
- **RENDERED עם Qualifies ריק** מותר לפי המפרט (הצירוף שווה ל-`{yes, no, ""}` וריק רק כשהציון אינו RENDERED); השורה תהיה unsettled, ושורת הסיכום אומרת זאת עם הסיבה.
- **`--json`** נכתב גם בסירוב (זה הסיכום, לא הטבלה; את הסיבות צריך כדי לתקן). הטבלה לא נכתבת בסירוב.
- **`--apply` מריץ את בדיקות ה-prize בכל פעם**, גם כשאין שינוי (פשוט וצפוי); קוד היציאה שלהן הוא קוד היציאה. `PRIZE_APPLY_TEST_CMD` מחליף את הפקודה בבדיקות (כמו `VERIFY_TEST_CMD`). רשימת חמשת הקבצים קשיחה, ובדיקה משווה אותה לכל קבצי `prize-*.test.ts` חוץ מזה החדש — קובץ prize שישית יכשיל אותה בקול.
- **מצבי השורות** אחרי `--apply`: `rowState` על הטבלה שנכתבה; `relisted` מקורב ("שורה אחרת עם אותו URL ושם", בלי חישוב הרבעונים של הבונה) — משפיע רק על ספירת same-event.
- **Node 20**: הסקריפט מייבא את `ai-allowed-events.ts`. Node מ-22.18 מסיר טיפוסים בעצמו (בקונטיינר 22.22); ב-Node 20 (מטריצת ה-CI היא `[20, 22]`) צריך `node --import tsx`. הבדיקות בוחרות לפי `process.features.typescript`; הכותרת אומרת זאת.
- **בדיקת הרגרסיה מול הפלטים האמיתיים**: הפלטים לא נכנסים ל-commit (יש בהם טקסט לכידות), וה-scratch נמחק — לכן יש שתי בדיקות: אחת מחויבת שבונה פריטים בצורת הפלט האמיתי (`summary`, `result`, הערה אחרי ה-URL) מהתאים שהטבלה כבר מחזיקה ומוודאת שאין שינוי (exit 0, אין diff) מול `research/rendered` האמיתי; ואחת שרצה רק עם `PRIZE_APPLY_REAL_OUTPUTS` (רשימת קבצים). הרצתי אותה עם הפלט של טיק 47 (`wd2r9evwn`): עוברת.
- **ממצא חשוב ל-thread הראשי — פלט ישן דורס תא שתוקן אחריו**: הריצה היבשה על שני הפלטים האמיתיים מוצאת שינוי אחד בדיוק — שורת RoboSyn (`https://robosyn-bench.net/?ref=mlcontests`), תא ה-AI clause. הפלט של טיק 49 (`wtvzpn0j1`) אומר שהמסלולים `#/submit-policy`, `#/register`, `#/data` "were not captured"; הטבלה מחזיקה את התא שה-thread הראשי הרחיב ביד בטיק 51 אחרי שהמסלולים רונדרו ב-5.10 (2071 מול 2682 תווים; הציון RENDERED/no זהה). `--apply` של הפלט הזה היה מחזיר את התא לאחור. הכלי עושה מה שהמפרט אומר (התאים של המאמת), והריצה היבשה היא ההגנה; הצעה לא בתחום: לסרב לדרוס תא לא ריק ששונה מאז (למשל `--overwrite` מפורש), או להשוות לחותמת זמן של הפלט.

**render-dispatch.sh**
- **הכול מה-checkout שהסקריפט יושב בו**: הסקריפטים, ה-origin, `research/rendered`. הבדיקות מעתיקות את ששת הסקריפטים ל-checkout זמני ומחייבות אותם, כך שמוטציה בעץ ה-sim מועתקת ונבדקת.
- **שלב 1**: קובץ בלי שורת URL נדחה לפני הכול — קלט `urls` ריק גורם ל-render-watch למשוך את כל `research/rendered/urls.txt`. המפענח של render-watch (`--needs-browser`) הוא הסמכות לתחביר; השער מפרק שורות בעצמו (שדות לפי רווח) ולא דרך `parseUrlList`, כדי ששלב המפענח יהיה הבודק היחיד של תחביר (אחרת המוטציה "דלג על המפענח" לא נהרגת). שורה בלי slug נדחית בשער (render-watch היה ממציא slug שהקריאה לא יכולה לצטט). `termsGate` מיובא מ-`queue-zero-test.mjs`, אותו שער ש-`prize-dispatch.mjs` מייבא (`prize-dispatch` לא מייצא אותו, ו-`selectDispatchLines` שלו דוחה שורות `js`, שקובץ השורות כן נושא).
- **owner/repo** מתוך `git remote get-url origin` (שני הרכיבים האחרונים, עם בדיקת תווים). בלוגים של השלבים כתוב `repos/<origin>/...`, לא שם הבעלים; כתובת הריצה מודפסת כמו שהמפרט ביקש.
- **מציאת הריצה**: הזמן נלקח רגע לפני ה-POST (ברזולוציית שנייה), והריצה הראשונה על ה-ref שנוצרה בו או אחריו נבחרת. מגבלה מוצהרת: שיגור אחר על אותו ענף באותן שניות ייחשב לריצה הזו.
- **"מלוכלך"** = שינוי לא מחויב בקובץ במעקב (`--untracked-files=no`); קבצים לא במעקב לא חוסמים fast-forward. בכל עצירה ב-exit 4 ההודעה אומרת "commit them" — אף פעם לא stash.
- **`--no-wait`** מסתיים ב-0 אחרי שהריצה נמצאה, ומדפיס מה לעשות ביד אחר כך.
- **דוח הכתובות** סופר מסכות (לפי סוג הדומיין שנשמר, או "no domain kept") וגם מחרוזות גולמיות בצורת כתובת (רגילה, `%40`, `\u0040`/`\x40`) לפי סוג, בגלאי **עצמאי ורחב יותר** מהממסך (גם סיסמת URL ו-handle אחרי `/` ייספרו) — אחרת הוא היה מחזיר תמיד 0 על לכידות שהממסך כבר עבר עליהן. שמות קבצים (`@2x.png`) לא נספרים. אזהרה ב-stderr, קוד היציאה לא משתנה. הדוח הוא לכל קובץ (`.txt` ו-`.html` של אותה לכידה נספרים בנפרד).
- **הכותרת של `prize-dispatch.mjs`** ולא הכותרת של `urls.txt` נבחרה למשפט על `render-dispatch.sh`, כדי לא לגעת בקובץ שנכתב מחדש כל שבוע (הכותרת של urls.txt ושלב 1 בטבלה עדיין אומרים "its output is what goes in render-watch.yml's urls input"; שינוי שם דורש את התבנית, urls.txt והטבלה יחד — נשאר ל-thread הראשי אם ירצה).

**sim-tree.sh (חלק ג)**
- הפקודה רצה ברקע עם `wait`, כדי שהלכידה תרוץ כשהאות מגיע ולא כשהפקודה מסתיימת (בחזית, bash דוחה את ה-trap עד סוף הפקודה; מוטציה `T52-foreground` מוכיחה שהבדיקה רואה את ההבדל). stdin מועבר במפורש (`<&0`), כי פקודת רקע מקבלת `/dev/null`. בלכידה: TERM לפקודה, הודעה עם הנתיב ופקודת הסרה מצוטטת, `exit 128+N`; אות שני בזמן העצירה מתעלם, וההודעה לתוך stderr סגור נכשלת בשקט. לפני ה-`rm -rf` של ריצה שעברה הלכידות מבוטלות, כדי שלא תודפס "kept" על עץ שנמחק.
- **SIGPIPE עם `2>&1 | head`** (המקרה של טיק 51): עכשיו exit 141 והעץ נשאר — אבל ההודעה לא יכולה להגיע, כי ה-stderr עצמו הוא הצינור הסגור. בדקתי זאת בריפו זמני. אם צריך את הרמז, לא להעביר את stderr ל-`head` (או לתת `--dir` ידוע).
- טיוטה ראשונה של הכותרת טענה שפקודת רקע מתעלמת מ-SIGINT; מדדתי (`SigIgn: 0` ב-`/proc`, כי ה-trap על INT נקבע לפני שהפקודה מתחילה) — הכותרת אומרת את מה שנמדד.

**מחוץ לתחום, נרשם ונשאר**: (1) הדריסה של תא מתוקן בפלט ישן (למעלה); (2) שלב 1 בטבלה וכותרת urls.txt לא מזכירים את `render-dispatch.sh`; (3) מקרה הקצה של `capture-check` שיוצא 2 על לכידה חסרה — `render-dispatch.sh` הופך זאת ל-exit 1 עם הודעה, אחרי דוח הכתובות.

## 5. שגיאות וניסיונות שנכשלו

- **הכתיבה הראשונה של בדיקות חלק א השאירה בדיקת placeholder** בסוף הקובץ; הוחלפה בבדיקות האמיתיות לפני הריצה הראשונה.
- **הריצה האדומה הראשונה של חלק א**: 3 כשלים — הביטוי `/prize tests: .* exited 5/` בבדיקה עצמה (רווח מיותר), שם הצורה של המסכה הכיל את המחרוזת `[redacted:email]` ולכן הבדיקה "לא מדפיס את הכתובת" נכשלה עליו, והמשפט בשלב 3 שעוד לא נכתב (מצופה).
- **כלי הכתיבה פענח רצפי escape**: `\u0040` בשתי כותרות הפך ל-@ ו-`\uFEFF` בקוד הפך ל-BOM אמיתי. נתפס ב-grep של בתי הקובץ ותוקן בעריכת Python מפורשת (הביטויים הרגולריים עצמם היו תקינים).
- **grep ברקע על כל תיקיית ה-scratchpad** (לחפש ערכי `gradeVerdict`) לא הסתיים תוך 120 שניות ונעצר; הערכים נקראו משני ה-fixtures.
- **ניסיון `sed` רב-שורתי** כדי להדפיס פלט של "עולם" בדיקה לא עשה כלום (sed לא מתאים `\n` בתבנית שורה); הוחלף בהעתק זמני של קובץ הבדיקה עם משתנה סביבה, שנמחק מיד.

## 6. בדיקות ופעולות ולידציה

- בסיס: `npx vitest run prize-dispatch.test.ts prize-intake-rules.test.ts` — exit 0, 80 עברו.
- חלק א: אדום (3 כשלים, exit 1) → ירוק: `prize-apply-reading` + חמשת קבצי ה-prize — exit 0, 6 קבצים, 165 עברו, 1 דולגה (זו של `PRIZE_APPLY_REAL_OUTPUTS`).
- הבדיקה עם הפלט האמיתי: `PRIZE_APPLY_REAL_OUTPUTS=<wd2r9evwn> npx vitest run ... -t "real outputs"` — exit 0, עברה.
- **ריצה יבשה על הטבלה האמיתית**: `node scripts/prize-apply-reading.mjs <wd2r9evwn.output> <wtvzpn0j1.output> --json ...` — **exit 3**: build-arena `BLOCKED/` (5 מצביעים, 2 קבצים; כבר בטבלה; השורה unsettled כמו היום; verifier change), amp-challenge `RENDERED/no` (13 מצביעים, קובץ 1; כבר בטבלה; graded; verifier accept), RoboSyn `RENDERED/no` (14 מצביעים, 4 קבצים; **ישנה את השורה** — סעיף 4; graded; verifier accept). כל המצביעים בשלושת התאים עברו את הבדיקה מול `research/rendered` האמיתי.
- חלק ב: 14 → 15 בדיקות, exit 0; עשן עם שורות RoboSyn: exit 0, הגוף זהה לגוף של טיק 51.
- `pnpm -s typecheck`: exit 0 (אחרי כל חלק).
- `node scripts/mutate.mjs --check --plan` על `prize-apply-reading.json`: exit 0 (21 of 21); על `render-dispatch.json`: exit 0 (14 of 14); על `sim-tree.json`: exit 0 (28 of 28).
- **מוטציות, כל אחת בתוך `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan ...`** (עץ ב-`--dir` בתיקיית ה-scratch):
  - `prize-apply-reading.json`: 21 הוחלו, **21 נהרגו**, 0 שרדו; 208 שניות; exit 0.
  - `render-dispatch.json`: 14 הוחלו, **14 נהרגו**, 0 שרדו; 184 שניות; exit 0 (שתי אלה רצו במקביל).
  - `sim-tree.json`: 28 הוחלו, **28 נהרגו** (24 הישנות ו-4 `T52-*`), 0 שרדו; 501 שניות; exit 0.
- חלק ג: אדום (`{code: null, signal: 'SIGTERM'}`, exit 1) → ירוק: `sim-tree.test.ts` exit 0, 30 עברו; תרחיש `2>&1 | head` ידני: exit 141, העץ נשאר.
- `scripts/verify.sh src/__tests__/revenue/prize-apply-reading.test.ts src/__tests__/revenue/render-dispatch.test.ts src/__tests__/revenue/prize-intake-rules.test.ts src/__tests__/revenue/prize-dispatch.test.ts src/__tests__/revenue/sim-tree.test.ts src/__tests__/revenue/mutation-plans.test.ts` — **exit 0**; typecheck exit 0; 6 קבצים, 171 עברו, 1 דולגה.
- `scripts/verify.sh` (כל חבילת ה-revenue) — **exit 0**; typecheck exit 0; 77 קבצים, 2520 עברו, 2 דולגו (זו של `PRIZE_APPLY_REAL_OUTPUTS` ואחת קיימת ב-`narration-licence-gate.test.ts`); 57 שניות.
- grep (case-insensitive) לשני חצאי שם המשתמש של בעל המאגר על כל הקבצים ששונו: 0 (exit 1). grep לכתובת בשורות שנוספו (@ בין תווי מילה שאינו `[redacted:email]@`, ו-`%40`): הפגיעות היחידות הן הגלאים עצמם (`/%40/i` ב-`prize-apply-reading.mjs`, הגדרת `AT` והתיעוד שלה ב-`render-dispatch.sh`) — אף כתובת. grep לשם מודל בשורות שנוספו: 0; ב-commit רק בשורות ה-trailer.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **ה-greps של ההיגיינה לפני כל commit** (חצאי שם הבעלים, כתובת בשורות שנוספו חוץ ממסכות וגלאים, שמות מודלים מחוץ ל-trailers) — חוזרים בכל טיק ובכל סוכן. סקריפט `scripts/diff-hygiene.sh <base>` עם רשימת היתר לגלאים היה חוסך אותם ואת השיפוט מחדש של אותן פגיעות.
- **בדיקת רצפי escape שכלי הכתיבה פענח** (`\uXXXX` שהפך לתו) — אפשר לצרף לאותו סקריפט: שורות שנוספו עם תו לא-ASCII בקובץ קוד שבו המקור ASCII.
- **ההמתנה לשתי ריצות מוטציה ואיסוף התוצאות** — `mutate.mjs` יכול לכתוב שורת סיכום ל-JSON (`--json`) כדי שהלוג ייבנה ממנה ולא מ-tail של פלט.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת השורות הארוכות של `logs/CHANNEL_LOOP.md` §9 (כל "Fixed in tick N" היא פסקה של אלפי תווים) כדי למצוא פריט אחד.
- ה-grep ברקע על כל ה-scratchpad (נעצר) וההדפסות של רשימת המשימות שחזרו בתזכורות.
- ריצות חוזרות של קבצי הבדיקה אחרי תיקונים קטנים (ביטוי בבדיקה, שם צורה), ובדיקת העשן שהודפסה דרך העתק זמני של קובץ בדיקה.
- המתנה לריצת המוטציות של sim-tree (501 שניות, כמחצית בגלל הבדיקה שמארכבת את ה-checkout האמיתי בכל ריצה — §9 51(3)).

---

# המתקן: תיקון ממצאי הסקירה (טיק 52)

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש מהמתקן לתקן כל ממצא "fix" של הסקירה (שישה; אין "blocking"), ורשאי גם את ה-"note" (חמישה): לשחזר כל ממצא (פקודה ופלט), לתקן בבדיקה קודם, `verify.sh` על קבצי המפרט ועל כל חבילת ה-revenue, להריץ מחדש בתוך `sim-tree.sh` את התוכניות שהקוד שלהן השתנה, `mutate.mjs --check` על כל תוכנית, ריצה יבשה אמיתית על שני הפלטים (בלי `--apply`), grep לכתובות ולמזהה הבעלים, סעיף בעברית בלוג הזה, commit עם שתי שורות ה-trailer, ומחיקת תיקיית ה-scratch של המתקן בשמה המלא. בלי push, בלי merge, בלי רשת.

## 2. הפעולות המרכזיות שביצעתי

לכל ממצא: בדיקה חדשה, ריצה אדומה (זה השחזור), תיקון, ריצה ירוקה.

1. **F1 — render-dispatch: קובץ של BOM או רווח לא-שביר עבר את שומר הקובץ הריק.** השחזור: הבדיקה `refused(w, "﻿\n", /no URL line/)` נכשלה — `expected 'render-dispatch: [1/7] validate 1 lin…' to match /no URL line/` (ה-grep ספר שורה אחת והשיגור יצא). התיקון: ספירת שורות ה-URL ב-Node לפי הכלל של render-watch עצמו (BOM מוביל נזרק, כל שורה ב-`trim()` של JavaScript, הערות ושורות ריקות לא נספרות), במקום `grep [[:space:]]`. נבדקו `"﻿\n"`, `" \n"`, `"﻿# …\n"` ו-`" \n  \n"`: exit 1, אף קריאת gh.
2. **F2 — `--apply` של פלט ישן דורס עריכה ידנית מאוחרת.** השחזור: בדיקות ה-`--overwrite` נכשלו (`Unknown option '--overwrite'`; ה-`--apply` על שורה מדורגת יצא 0 וכתב). התיקון, שני החלקים שהסקירה הציעה: (א) תאים שונים במקום תאים שהשורה כבר מחזיקה הם "החלפה": ריצה יבשה מראה אותה ב-diff, מסמנת `replaces the cells the row holds (--apply needs --overwrite)` ואומרת זאת ב-stderr (exit 3); `--apply` מסרב (exit 1, כלום לא נכתב) אלא אם ניתן `--overwrite`; תאים זהים אינם שינוי בכלל. (ב) המשפט בשלב 3 (בתבנית וב-md, זהים): קודם ריצה יבשה, אחר כך `--apply`, ומה הוא מסרב לו.
3. **F3 — RENDERED בלי yes/no, בלי מצביע או עם תא ריק נכתב.** השחזור: שלוש הבדיקות יצאו 3 במקום 1. התיקון: RENDERED צריך yes או no וסעיף שמצביע על לכידה; תא סעיף ריק נדחה בכל ציון. BLOCKED בלי מצביע עדיין מותר (בדיקה מצמידה את הגבול).
4. **F4 — בדיקת הכתובות הייתה ASCII בלבד.** השחזור: בבדיקת הצורות, `jos` + `é` + `@`, דומיין שמתחיל ב-`ü` או בספרה, `＠` (U+FF20), `﹫` (U+FE6B), `&commat;`, `&#64` בלי נקודה-פסיק, `\u{40}` ו-`%EF%BC%A0` — כל אחת יצאה 3 במקום 1. בדוח הכתובות של render-dispatch, תשע הצורות (מקודדת, escape, הפניית תו, דומה-ל-@, מחוץ ל-ASCII) לא נספרו כולן. התיקון: מחלקות Unicode (`\p{L}\p{M}\p{N}` עם הדגל `u`) בשני הגלאים, הצורות הנוספות, והדוח קורא את הלכידה כ-UTF-8 (לא latin1).
5. **F5 — שלוש תכונות של render-dispatch בלי בדיקה.** בדיקות חדשות: קובץ CRLF עם טקסט מחוץ ל-ASCII ובלי ירידת שורה אחרונה נשלח בית-בבית; מציאת הריצה מוגבלת בזמן (stub שלא מציג ריצה חדשה: exit 1, כמה קריאות רשימה, הודעה שנוקבת ב-ref); שם קובץ בצורת `<name>@2x.png` לא נספר. הסקריפט כבר עשה את שלושתן נכון — הבדיקות הן מה שהיה חסר (RV-B2, RV-B3, RV-B5 שרדו אצל הסוקר; עכשיו נהרגות).
6. **F6 — רק SIGTERM נבדק ב-sim-tree.** הבדיקה עכשיו על TERM, INT, HUP ו-PIPE (143, 130, 129, 141), עם TMPDIR שבנתיב שלו רווח, כך שהציטוט של פקודת ההסרה נראה (`%q` שונה מהנתיב). הסקריפט כבר עשה את זה נכון.
7. **הערות שתוקנו**: (N1) sim-tree מחכה לטיפול של הפקודה ב-TERM, מוגבל ב-`SIM_TREE_STOP_SECONDS` (ברירת מחדל 10), ואז KILL — שנאמר; (N2) מצבי השורות אחרי `--apply` נבדקים במספרים מדויקים, וטבלה עם שורה של 7 תאים נדחית בשמה; (N3) רשימת שורות `2, 99` נבדקת כולה, טווח הפוך `9-2` נדחה, טבלה שמערבבת CRLF ו-LF נדחית בשמה, ושורות הן רק אלה שבסעיפים ש-`parseAiAllowedTable` קורא (בדיקת ספירה משווה בין השניים); (N4) מציאת הריצה — ראו סעיף 4; (N5) ה-README ו-`mutation-plans.test.ts` — ראו סעיף 4.
8. **תוכניות המוטציה**: הוזזו ה-find שזזו (`match-by-prefix`, `any-ref-run`, `older-run`, `T52-command-left-running`), ונוספו 19 + 12 + 8 מוטציות `F52-*`; כולן רצו בתוך `sim-tree.sh` (סעיף 6).
9. ריצה יבשה אמיתית, grep היגיינה, הלוג הזה, commits.

## 3. קבצים/מערכות ששונו

- `scripts/prize-apply-reading.mjs` — `--overwrite`, בדיקות RENDERED/סעיף ריק, גלאי כתובות Unicode וצורות נוספות, רשימות שורות וטווח הפוך, שורות לפי סעיף, סירוב לסיומי שורה מעורבים, הכותרת.
- `scripts/render-dispatch.sh` — ספירת שורות URL ב-Node, רשימת הריצות לפני השיגור ומרווח שעון (`RENDER_DISPATCH_CLOCK_SKEW_SECONDS`), הערת NOTE ל-slug שהקומיטים הממוזגים לא שינו, דוח כתובות Unicode/UTF-8, הכותרת.
- `scripts/sim-tree.sh` — המתנה מוגבלת לפקודה בעצירה, `SIM_TREE_STOP_SECONDS`, הכותרת.
- `src/revenue/ai-allowed-events.ts` ו-`research/measurements/ai-allowed-events.md` — המשפט בשלב 3, זהה בשניהם (בטבלה רק השורה הזו; אף תא לא נכתב).
- `src/__tests__/revenue/prize-apply-reading.test.ts`, `render-dispatch.test.ts`, `sim-tree.test.ts` — הבדיקות.
- `src/__tests__/revenue/mutations/prize-apply-reading.json` (40), `render-dispatch.json` (26), `sim-tree.json` (36), `mutations/README.md` (מספרים וזמנים).
- `logs/2026-10-06-channel-loop-tick-52-reading-dispatch-scripts.md` — הסעיף הזה.

לא נגעתי בקובץ ה-checkpoint, בקובץ הלולאה, בקובץ התור, ב-`MISSION.md`, בקובץ ההוראות, בתאי הטבלה, ב-`research/rendered/` או ב-`urls.txt`. בלי push, בלי merge, בלי רשת, בלי קריאה ל-gh האמיתי.

## 4. החלטות והנחות משמעותיות

- **F2, למה ריצה יבשה לא מסרבת**: היא הכלי לקרוא את ההחלפה לפני שמחליטים; לכן היא מראה את ה-diff ומסמנת, ורק `--apply` מסרב. "תא מוחזק" = כל אחד משלושת התאים לא ריק; תאים זהים אינם החלפה (האידמפוטנטיות נשמרת). מאמת ש"שינה" עדיין המילה האחרונה על תוכן הפריט; `--overwrite` הוא ההחלטה של האדם לדרוס שורה.
- **F3**: "סעיף ריק נדחה בכל ציון" רחב מהמפרט המילולי (שהתיר `""` לשלושת התאים) — שלב 3 בטבלה דורש שקריאה תאמר מה קראה או למה לא יכלה; אף פלט אמיתי ואף שורה בטבלה אינם ריקים. BLOCKED/SNIPPET/NONE לא נדרשים למצביע.
- **F4**: גם `&#64` בלי נקודה-פסיק נדחה (דפדפן קורא אותו כ-@), וכל `＠`/`﹫` נדחה בכל מקום בתא (אין להם שימוש לגיטימי בסעיף). דוח הכתובות סופר את אותן צורות; הוא מבחין עכשיו בדומיין שהתווית האחרונה שלו מתחילה באות ומכילה ספרות (למשל punycode).
- **N4, מציאת הריצה**: בדיקת הטריות לפי `fetchedAt` שהסקירה הציעה **לא** נבנתה: render-watch משאיר את `fetchedAt` של דף שלא השתנה (`scripts/render-watch.mjs`, שורות 2129-2130), ולכן היא הייתה מזהירה על כל דף יציב. במקום: לפני השיגור הרשימה נקראת פעם אחת ומזהי הריצות שבה מוצאים מהבחירה; אחר כך נבחרת ריצה על ה-ref שלא הייתה ברשימה ושנוצרה מרגע השיגור פחות `RENDER_DISPATCH_CLOCK_SKEW_SECONDS` (ברירת מחדל 120). שעון מקומי שמקדים פחות מזה עדיין מוצא את הריצה; שעון שמאחר לא יכול לבחור ריצה ישנה. וב-[6/7] שורת NOTE לכל slug שאף קובץ לכידה שלו לא השתנה בקומיטים שמוזגו (דף שלא השתנה, או שורת js שהריצה דילגה עליה; הלוג של הריצה אומר מה). הקוד שונה מ"created at or after the dispatch time" המילולי של המפרט בשני דברים: מרווח השעון, והחרגת הריצות שנרשמו לפני השיגור — קריאת `gh` אחת נוספת לפני השיגור, שכישלונה עוצר הכול לפני השיגור (exit 1).
- **N1**: הלולאה מחכה בבדיקת `kill -0` כל 0.1 שנייה (bash קוצר את הילד גם בתוך ה-trap — נמדד בניסוי), ואז `wait`. בלי הגבלה, פקודה שמתעלמת מ-TERM הייתה תוקעת את sim-tree; עם KILL אחרי `SIM_TREE_STOP_SECONDS` וההודעה.
- **N3**: הבדיקה שמשווה את ספירת השורות בסעיפים לספירה של `parseAiAllowedTable` היא שמירה מגננתית: הכללים מסכימים בבנייה, ואין בדיקה שיכולה לראות אותה נופלת — לכן אין לה מוטציה בתוכנית (לפי ה-README: מוטציה שאי אפשר לצפות בה לא נשמרת). `ROW_SECTION` הועתק מהמודול (הוא לא מיוצא) כדי לא לשנות את `ai-allowed-events.ts` מעבר למשפט.
- **N5**: ה-README נשאר (תהליך התוכניות דורש אותו) ועודכן במספרים ובזמנים; שתי השורות ב-`mutation-plans.test.ts` נשארו. שני הקבצים מחוץ לרשימת "אין קבצים אחרים" של המפרט — הסטייה רשומה כאן.
- **שורת RoboSyn האמיתית**: עם התיקון, `--apply` של הפלט של טיק 49 על עותק של הטבלה מסרב (exit 1, העותק זהה בית-בבית); הפלט של טיק 47 לבדו: exit 0, אין שינוי, `row states: graded 8, awaiting 57, unsettled 2, same-event 0`.
- **מחוץ לתחום, נרשם ונשאר**: שלב 1 בטבלה וכותרת `urls.txt` עדיין לא מזכירים את `render-dispatch.sh` (כמו שהבונה רשם). ב-`sim()` הוותיק של בדיקות sim-tree ה-SIM_TREE החיצוני עדיין עובר הלאה; אף בדיקה ותיקה לא כותבת דרכו (התוכנית של הבונה עברה), ולכן לא שיניתי.

## 5. שגיאות וניסיונות שנכשלו

- **ריצת התוכנית של sim-tree נעצרה ב-exit 4 אחרי 10 מוטציות**: `the run of S10-no-sim-tree-env changed the checkout: late`. הבדיקה החדשה שלי כתבה `touch "$SIM_TREE/late"`; תחת המוטציה S10 (sim-tree לא מגדיר SIM_TREE) הפקודה ירשה את ה-SIM_TREE של העץ החיצוני שבו רצה התוכנית, וכתבה לתוכו. תוקן: הפקודה כותבת `late` יחסית לתיקיית העבודה (העץ), וה-spawn מוריד את SIM_TREE מהסביבה. נבדק עם `SIM_TREE=<תיקייה> npx vitest run ... -t "stopped by a signal"`: exit 0, התיקייה נשארה ריקה. התוכנית רצה מחדש מההתחלה.
- **הביטוי בבדיקת ה-NOTE** לא כלל את המילה `NOTE:` — כשל אחד, תוקן בבדיקה.
- **`mutation-plans.test.ts` נכשל** אחרי שינוי הקוד (שלוש תוכניות, find שזז) — צפוי; התוכניות עודכנו ו-`--check` יצא 0.
- **grep הכתובות** תפס שם קובץ של תמונה בגודל כפול (שם, @, `2x.png`) בהערה שלי בבדיקה ובהערת מוטציה — שם קובץ, לא כתובת; נוסח מחדש כ-`<name>@2x.png`, ובבדיקה השם נבנה מחלקים בזמן ריצה.
- `sleep 240` בחזית נחסם על ידי הסביבה; ההמתנה לתוכניות עברה ללולאת `until` ברקע.

## 6. בדיקות ופעולות ולידציה

- **שחזורים (אדום לפני התיקון)**: `npx vitest run src/__tests__/revenue/prize-apply-reading.test.ts` — exit 1, ‏8 נכשלו, 24 עברו, 1 דולגה (F2, F3, F4, N2, N3). `npx vitest run src/__tests__/revenue/render-dispatch.test.ts` — exit 1, ‏8 נכשלו, 12 עברו (F1, N4, וסדר הקריאות החדש); בדיקות ה-CRLF ומציאת-הריצה-המוגבלת עברו כבר על הקוד הישן (F5: הקוד היה נכון, חסרה בדיקה).
- **ירוק**: `prize-apply-reading.test.ts` — exit 0; `render-dispatch.test.ts` — exit 0, ‏21 עברו; `sim-tree.test.ts -t "stopped by a signal"` — exit 0, ‏7 עברו (ארבעת האותות, ההמתנה, ה-KILL, הסירוב), וגם עם `SIM_TREE=<תיקייה>` בסביבה: exit 0 והתיקייה נשארה ריקה.
- `scripts/verify.sh src/__tests__/revenue/prize-apply-reading.test.ts src/__tests__/revenue/render-dispatch.test.ts src/__tests__/revenue/prize-intake-rules.test.ts src/__tests__/revenue/prize-dispatch.test.ts src/__tests__/revenue/sim-tree.test.ts src/__tests__/revenue/mutation-plans.test.ts` — **exit 0**; typecheck exit 0; 6 קבצים, 190 עברו, 1 דולגה.
- `scripts/verify.sh` (כל חבילת ה-revenue) — **exit 0**; typecheck exit 0; 77 קבצים, 2539 עברו, 2 דולגו; 61 שניות.
- `PRIZE_APPLY_REAL_OUTPUTS=<הפלט של טיק 47> npx vitest run src/__tests__/revenue/prize-apply-reading.test.ts -t "real outputs"` — exit 0.
- `node scripts/mutate.mjs --check --plan` על כל עשר התוכניות — exit 0 בכל אחת (prize-apply-reading 40 of 40, render-dispatch 26 of 26, sim-tree 36 of 36, והשבע האחרות כמו שהיו).
- **מוטציות, כל תוכנית בתוך `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan ...`** (TMPDIR בתיקיית ה-scratch של המתקן):
  - `prize-apply-reading.json`: 40 הוחלו, **40 נהרגו**, 0 שרדו; 580 שניות; exit 0.
  - `render-dispatch.json`: 26 הוחלו, **26 נהרגו**, 0 שרדו; 591 שניות; exit 0 (במקביל לקודמת).
  - `sim-tree.json`: ריצה ראשונה exit 4 אחרי 10 (כולן נהרגו) ב-229 שניות — סעיף 5; אחרי התיקון: 36 הוחלו, **36 נהרגו**, 0 שרדו; 927 שניות; exit 0.
  - בין הנהרגות: כל המוטציות של הסוקר שהיו "SURVIVED" (RV-A4, RV-A8, RV-A9 כ-`F52-table-shape-ignored`, RV-B2, RV-B3, RV-B5, RV-C1..C4).
- **ריצה יבשה אמיתית** (`node scripts/prize-apply-reading.mjs <wd2r9evwn> <wtvzpn0j1> --json ...`, בלי `--apply`) — **exit 3**: build-arena `BLOCKED/` ו-amp-challenge `RENDERED/no` — "the row already holds these cells"; RoboSyn `RENDERED/no`, 14 מצביעים ב-4 קבצים — "replaces the cells the row holds (--apply needs --overwrite)", ושורת אזהרה ב-stderr. sha256 של הטבלה לא השתנה.
- `--apply` של שני הפלטים על **עותק** של הטבלה (`--table <עותק> --no-tests`) — exit 1, ‏"1 of 3 item(s) refused; nothing written", העותק זהה בית-בבית (`cmp` exit 0); הפלט של טיק 47 לבדו על העותק — exit 0, ‏`row states: graded 8, awaiting 57, unsettled 2, same-event 0`, העותק זהה.
- grep (case-insensitive) לשני חצאי שם המשתמש של הבעלים בכל הקבצים ששונו: 0 (exit 1). grep לכתובת בשורות שנוספו מאז הבונה (תבנית ASCII ותבנית Unicode): 0. grep לשמות מודלים בשורות שנוספו: 0; ב-commits רק בשורות ה-trailer.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **עריכות find/replace "בדיוק פעם אחת" בקבצי קוד**: כתבתי עוזר Python קטן ב-scratch (נכשל אם ה-find מופיע 0 או 2 פעמים, כותב רק אם כל העריכות חלות). זה בדיוק `loop-edit.mjs replace-in-line` לקבצי קוד ורב-שורתי; הרחבה של `loop-edit.mjs` (או כלי אחות) לקבצי `scripts/` ו-`src/` הייתה חוסכת אותו בכל סוכן.
- **בדיקות שרצות בתוך עץ sim**: כל בדיקה שמעבירה `process.env` לתהליך-בן יורשת את SIM_TREE החיצוני; כדאי ש-`mutate.mjs` (או sim-tree) יריץ את הבדיקות בלי SIM_TREE בסביבה, או שבדיקת `mutation-plans` תחפש `$SIM_TREE` בפקודות של בדיקות.
- **ה-greps של ההיגיינה** — כמו שהבונה רשם: סקריפט `diff-hygiene.sh` עם רשימת היתר (מסכות, גלאים, `<name>@2x.png`).

## 8. על מה בוזבזו אסימונים, לפי פעולה

- תזכורות רשימת המשימות של ה-thread הראשי שחזרו בכל כמה קריאות (לא רלוונטיות למתקן).
- קריאה מלאה של שלושת קבצי הבדיקה והסקריפטים כדי לשבץ עריכות מדויקות.
- ריצת התוכנית של sim-tree שנעצרה (229 שניות) והריצה החוזרת מההתחלה.
- הסבר מחדש של ה-escape בכל שכבה (Python → TS template → bash → regex) בעריכות של ה-stub וה-REPORT_JS.
