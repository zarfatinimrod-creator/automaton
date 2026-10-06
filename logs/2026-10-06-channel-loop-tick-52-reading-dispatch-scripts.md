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
