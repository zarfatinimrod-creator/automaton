# סבב 63 (7.10.2026): סנכרון ה-seed — הריצה המתוזמנת מחילה את portfolio.ts לפני הטיק, והסנכרון לא כותב עוד את תקציב הלוח

## 1. מה המשתמש ביקש

המשימה הגיעה מהשרשור הראשי של לולאת הערוצים (סבב 63), אחרי שהסוקר של בניית הדיוק של סבב 62 מצא שני דברים: טקסט שמשתנה
ב-`src/revenue/portfolio.ts` לא מגיע אף פעם ל-`colony.db`, ל-`REPORT.md` או ל-`dashboard.html` (הריצה המתוזמנת מריצה רק
`colony.ts tick --no-feed`, והטיק זורע רק מסד ריק), ו-`colony.ts sync-portfolio`, הדרך היחידה להביא את הטקסטים, דורס את
הקצאת התקציב של הלוח. המטרה: שינוי בטקסט seed מגיע למסד ולדוח בריצה המתוזמנת הבאה, ואף סנכרון seed לא דורס את הקצאת
הלוח. בפירוט:

1. `updateLineFromSeed` לא כותב יותר `budget_monthly_cents` של שורה קיימת (`insertLineFromSeed` ממשיך לזרוע שורה חדשה
   מה-seed); לבדוק כל עמודה אחרת שהוא כותב מול כל כותב אחר של `revenue_lines`, ולא לדרוס עמודה שהחלטת לוח, שער או מפקח
   משתמשת בה; להוכיח ש-status, `launched_at` ו-`human_setup_done` נשארים בלי שינוי.
2. הריצה המתוזמנת מסנכרנת: שלב `sync-portfolio` ב-`.github/workflows/colony.yml` לפני הטיק, באותו job, לפני שלב ה-commit;
   לבדוק כל workflow אחר שמריץ טיק; הסנכרון לא הורג שורה שלא הייתה הרוגה במסד המחויב.
3. בדיקות (תקציב נשמר, שורה חדשה מקבלת את תקציב ה-seed, טקסט שהשתנה מגיע ל-`renderReport` ויורד כשהצעדים בוצעו, סדר
   השלבים ב-workflow), מוטנטים חד-פעמיים ב-`scripts/sim-tree.sh`, ותוכנית מוטציות לצד הבדיקות.
4. סימולציה על עותק של `state/colony/colony.db` בתיקיית ה-scratch: sync-portfolio, אחר כך `tick --no-feed --force`.
5. טקסט אחד: פסקת ה-WRITES של `scripts/youtube-madeforkids-readback.ts` צריכה לכלול את `returned` בקריאה האחרונה.
6. `scripts/verify.sh` ממוקד ומלא, commit על `build/tick63-sync`, היומן הזה. לא לדחוף.

## 2. הפעולות המרכזיות שביצעתי

- יצרתי worktree ב-scratchpad על `build/tick63-sync` מ-`origin/claude/new-session-j071dx`; הבסיס `b40f32e`, `products/` ו-
  `src/revenue/` לא ריקים, `node_modules` מקושר לקופה הראשית.
- קראתי את `updateLineFromSeed` / `insertLineFromSeed` (`src/revenue/ledger.ts`), את `syncPortfolio` ו-`humanSetupItemFor`
  (`src/revenue/portfolio.ts`), את `openSetupItems` (`src/revenue/owner-steps.ts`), את `runBoardReview` ו-`allocateBudget`
  (`heartbeat.ts`, `rules.ts`), את `tools.ts` (`revenue_decide`, `revenue_propose_line`), את `scripts/colony.ts` ואת
  `colony.yml` כולו.
- **ביקורת העמודות** (סעיף 4 למטה): `grep -rn "UPDATE revenue_lines" src/ scripts/` ועוד grep על כל `revenue_lines`
  בכל קבצי ts/mjs/js/py/sh/yml בריפו (כולל `.github`), וכל `setLine*` / `setHumanSetupDone` / `updateLineStatus` וקוראיהם.
- **`src/revenue/ledger.ts`** `updateLineFromSeed` (לפני :323-350, אחרי :335-358): ה-UPDATE לא כותב עוד
  `budget_monthly_cents` (לפני :330 ו-:343) ולא `tier` (לפני :329 ו-:333). ההערה מעליו אומרת למה, עם המספרים שנמדדו.
- **`.github/workflows/colony.yml`**: שלב חדש "Apply portfolio.ts to the database" (:58-67) אחרי `pnpm install` ולפני
  "Run one colony tick" (הטיק עבר מ-:75 ל-:88), באותו job `tick`, לפני "Commit state and report" (`git add -f state/colony`,
  :100), כך שהמסד שהסנכרון כתב נכנס ל-commit. הפקודה בלי אופציות, כלומר על `state/colony/colony.db`, אותו קובץ שהטיק
  קורא; `set -euo pipefail`, בלי `if` ובלי `continue-on-error`: סנכרון שנכשל עוצר את הריצה ולא מתחייב דוח מטקסטים ישנים.
  גם הכותרת (:3-6) והפקודות הידניות (:17-19) מזכירות אותו.
- `src/revenue/portfolio.ts` (הערת `syncPortfolio`, :780-793) ו-`scripts/colony.ts` (טקסט ה-usage, :64-71): מה הסנכרון
  שומר, ושהריצה המתוזמנת מריצה אותו לפני כל טיק.
- **פריט 5:** `scripts/youtube-madeforkids-readback.ts:18`: "the latest read (madeForKids …" → "the latest read (returned,
  madeForKids …" (`MadeForKidsReading.returned`, `src/revenue/youtube-madeforkids.ts:53`).
- בדיקות ב-`ledger.test.ts`, `runner.test.ts`, `colony-cli.test.ts`; תוכנית `src/__tests__/revenue/mutations/ledger.json`
  (12 רשומות), רשומה ב-`mutation-plans.test.ts` וב-`mutations/README.md`.
- commit `1fd7fbc`, אחריו הרצת התוכנית ב-sim-tree, שתי סימולציות (קוד חדש מול קוד ישן) עם טיק מאולץ ושתיים בלי, ואז
  `verify.sh` מלא.

## 3. קבצים/מערכות ששונו

- `src/revenue/ledger.ts` — `updateLineFromSeed`: בלי `budget_monthly_cents` ובלי `tier`; הערה.
- `.github/workflows/colony.yml` — שלב `sync-portfolio` לפני הטיק; כותרת ופקודות ידניות.
- `src/revenue/portfolio.ts` — הערת `syncPortfolio` בלבד (אין שינוי קוד).
- `scripts/colony.ts` — טקסט ה-usage של `sync-portfolio` בלבד.
- `scripts/youtube-madeforkids-readback.ts` — מילה אחת בפסקת ה-WRITES.
- `src/__tests__/revenue/ledger.test.ts` — describe חדש, 5 בדיקות.
- `src/__tests__/revenue/runner.test.ts` — בדיקה חדשה אחת ב-describe של רשימת הבעלים; import של `seedDefaultPortfolio`,
  `syncPortfolio`.
- `src/__tests__/revenue/colony-cli.test.ts` — describe חדש, 2 בדיקות; import של `yaml`.
- `src/__tests__/revenue/mutation-plans.test.ts` — `ledger.json` ברשימת התוכניות הנדרשות.
- `src/__tests__/revenue/mutations/ledger.json` (חדש), `src/__tests__/revenue/mutations/README.md` (שורה בטבלת התוכניות
  ושורה בטבלת הזמנים).
- `logs/2026-10-07-channel-loop-tick-63-seed-sync.md` (היומן הזה).
- לא נגעתי ב-`state/colony/` (ה-sha256 של כל הקבצים בו בקופה הראשית זהים לפני ואחרי; `colony.db` עדיין
  `7d46a1c8…bcc62`), לא ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`,
  פסיקות, ישיבות או מדידות.

## 4. החלטות והנחות משמעותיות

**ביקורת העמודות של `updateLineFromSeed`** (כל עמודה שהוא כתב, הכותבים האחרים שלה, וההחלטה; מספרי השורות בטבלה הם של
הבסיס `b40f32e`, ומספרי השורות אחרי תיקוני הסקירה נמצאים בסעיף "תיקוני הסקירה"):

| עמודה | כותבים אחרים (מלבד `insertLineFromSeed`) | החלטה |
| --- | --- | --- |
| `budget_monthly_cents` | `setLineBudget` (`ledger.ts:397`), שנקרא רק מ-`runBoardReview` (`heartbeat.ts:523`) עם הפלט של `allocateBudget` | **לא מסונכרן.** ההקצאה הנוכחית של הלוח (`rules.ts:188-194`); הסנכרון הישן העלה אותה |
| `tier` | `setLineTier` (`ledger.ts:402`), שנקרא מ-`revenue_decide` (`tools.ts:426`), החלטת לוח; `allocateBudget` שוקל לפיו (core 3, growth 2, experimental 1) | **לא מסונכרן.** במסד המחויב ה-tier של כל ארבע השורות שווה ל-seed, כך שאין שינוי היום |
| `target_monthly_agorot` | `setLineTarget` (`ledger.ts:407`) — **אין לו אף קורא** ב-`src/` או `scripts/` | מסונכרן. ה-seed הוא הכותב החי היחיד, והחלטות היעד של הלוח (7.9) חיות ב-portfolio.ts. אם מישהו יחבר את `setLineTarget`, צריך לחזור לכאן (כתוב בהערה) |
| `name`, `category`, `director_role`, `operating_loop`, `kpis`, `kill_criteria`, `scale_criteria`, `human_setup`, `skill_name` | אין | מסונכרנים (זו מטרת הבנייה) |
| `updated_at` | כל הכותבים | נכתב; אף קוד לא קורא `updatedAt` של שורה (ה-watchdog קורא במכוון רק KPI, ledger ו-review) |
| `status`, `launched_at`, `killed_at`, `kill_reason` | `updateLineStatus` (`ledger.ts:381`) | לא היו ב-UPDATE ולא נוספו; נבדק (`ledger.test.ts`, ומוטנטים T63-L3, T63-L5) |
| `human_setup_done` | `setHumanSetupDone` (`ledger.ts:391`; `tools.ts:320, :414`; `colony.ts:316, :325`) | לא היה ב-UPDATE ולא נוסף; נבדק (מוטנט T63-L4) |
| `created_at` | אף כותב בקוד המוצר | לא נכתב; נבדק |

- **מחיר ההחלטה על `tier`:** tier שישתנה ב-portfolio.ts לשורה שכבר קיימת לא יוחל בסנכרון; הוא עובר דרך `revenue_decide`,
  שדורש סביבת סוכן שלא רצה היום. כתבתי את זה בהערה של `updateLineFromSeed` ושמתי כשאלה פתוחה בסעיף 7. לא הוספתי דיווח
  על tier שונה בתוצאת `syncPortfolio`: לא נדרש, ואין היום הבדל כזה.
- **כלל ה-₪0 (תוקן בסקירה; ראו "תיקוני הסקירה" למטה):** בגרסת הבונה המשפט כאן היה "הבנייה לא מגדילה אף תקציב", והוא
  לא היה נכון: הסנכרון השעתי הפך את `insertLineFromSeed` בתוך `syncPortfolio` לכותב אוטומטי של תקציב ה-seed, ושורה שנוספה
  ל-portfolio.ts הייתה מחזיקה 4000 סנט בכל טיק עד סקירת הלוח היומית, ולתמיד כשהמושבה כבויה (נמדד על ידי הסוקר). אחרי
  התיקון `syncPortfolio` מכניס שורה חדשה בתקציב 0 ולא משנה כלום כשהמושבה כבויה, ולכן עכשיו הבנייה לא מגדילה אף תקציב,
  הוצאה או הקצאה; היא מסירה כתיבה שהגדילה (נמדד: סכום התקציבים 0 בכל אחד משלושת התרחישים בסימולציה למטה).
- **שלב ב-workflow ולא אופציה לטיק:** הכי קטן (שלב אחד, בלי קוד), והפקודה כבר קיימת ונבדקה ידנית. שלב נפרד שנכשל מופיע
  ככישלון גלוי של הריצה ועוצר את ה-commit; אופציה בטיק הייתה דורשת שינוי ב-`runner.ts`, ב-CLI ובבדיקות שלהם.
- **הריגת שורות:** `syncPortfolio` הורג רק שורות ב-`KILLED_LINES` שקיימות במסד ואינן הרוגות. במסד המחויב כל שש
  (`templates`, `paid-apis`, `agent-services`, `telegram-bots`, `dev-extensions`, `hebrew-content`) כבר `killed`, ולכן
  killed 0 (נמדד, וגם נבדק ב-`ledger.test.ts` על הפורטפוליו האמיתי). הוספת שורה ל-`KILLED_LINES` תוחל מעכשיו בריצה
  המתוזמנת הבאה — זו בדיוק המשמעות של החלטת לוח ב-portfolio.ts.
- **`colony.ts report`** מריץ טיק (`scripts/colony.ts:229-236`) שסנכרון ה-ledger שלו מאפס את החוסם "the loop did not run
  for N hours" של המושבה; בגלל זה השרשור הראשי לא מתחייב `REPORT.md` שנוצר מקומית. לא שלי לשנות; רק נרשם כאן.
- כותרת `colony.yml` עדיין אומרת שהקובץ לא רץ עד שהוא על הענף הראשי (נבדק 2026-09-03). לא בדקתי אם זה עדיין נכון (אין לי
  רשת ואין `gh`), ולא שיניתי את הטענה; רק הוספתי את הסנכרון לפקודות הידניות.

## 5. שגיאות וניסיונות שנכשלו

- `which sqlite3` נכשל (אין CLI של sqlite בקונטיינר); בדקתי את המסד עם `better-sqlite3` דרך סקריפט ב-scratch.
- החילוץ הראשון שלי של הטקסט הישן מקובץ הבדיקה (grep עם `-o -A1`) שלף את השורה הלא נכונה, ו-`cmp` אמר "differ". חילוץ
  ב-Python עם regex הראה שהטקסט בבדיקה זהה בית בבית לטקסט השמור ב-`colony.db` המחויב.
- בגרסה הראשונה של בדיקת ה-workflow הביטוי `/sync-portfolio\n/` היה עובר גם כשהפקודה מוערת בתוך ה-`run`; נעצתי את ה-`run`
  המדויק (`"set -euo pipefail\npnpm exec tsx scripts/colony.ts sync-portfolio\n"`) לפני ה-commit, והמוטנט T63-W5 מוכיח
  את זה.

## 6. בדיקות ופעולות ולידציה

- **בדיקות חדשות:** `ledger.test.ts` — "a seed sync keeps what the board decided in the database" (:231): (א) תקציב 0 אחרי
  `setLineBudget` נשאר 0 כשה-seed אומר 4000, ו-700 נשאר 700 דרך `updateLineFromSeed` ישירות; (ב) שורה חדשה דרך הסנכרון
  מקבלת 2500 של ה-seed; tier ש-`setLineTier` קבע נשמר; status `live`, `humanSetupDone`, `launchedAt`, `createdAt`,
  `killedAt`, `killReason`, tier ותקציב נשמרים בזמן שעשר העמודות של portfolio.ts מוחלפות; ועל הפורטפוליו האמיתי עם שש
  השורות ההרוגות וכל התקציבים 0: updated 4, inserted 0, killed 0, כל התקציבים 0. `runner.test.ts` (:654): (ג) מסד עם
  הטקסטים של המסד המחויב — הטקסט הישן של `oss-bounties` מבוקש גם כשצעדים 7 ו-6 בוצעו, ופריט PostHog חסר; אחרי
  `syncPortfolio` שני הטקסטים החדשים מבוקשים, "the only other thing step 7's sitting does" נעלם, וכשהצעדים בוצעו שניהם
  יורדים. `colony-cli.test.ts` (:74): (ד) ב-job היחיד `tick`: install < sync < tick < commit, ה-`run` המדויק, בלי `if`
  ובלי `continue-on-error`, בלי `--db` בטיק; ו-`colony.yml` הוא ה-workflow היחיד שמריץ `colony.ts tick` (שורות לא-הערה),
  ובכל workflow כזה הסנכרון בא קודם.
- **לא שיניתי אף assertion קיים.**
- **מוטציות** (`node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/ledger.json` בתוך
  `scripts/sim-tree.sh --ref 1fd7fbc`): 12 הוחלו, **12 נהרגו**, 0 שרדו, 53 שניות כולל הקמת העץ, exit 0. החזרת כל שינוי:
  T63-L1 (התקציב בחזרה ב-UPDATE), T63-L2 (tier), T63-W1 (בלי שלב סנכרון), T63-W4 (הסנכרון אחרי הטיק); ועוד T63-L3 עד L5
  (status, setup-done, launch), T63-L6 (הטקסט השמור נשאר), T63-P1 (`syncPortfolio` לא מרענן), T63-W2 (`--db` אחר), T63-W3
  (`continue-on-error`), T63-W5 (פקודה מוערת). `mutate.mjs --check` על התוכנית: 12 of 12 would apply, exit 0.
  פריט 5 הוא הערה בלבד ואין בדיקה שקוראת אותה, ולכן אין לו מוטנט.
- **סימולציה** (כל אחת ב-sim-tree, על עותק של `colony.db` המחויב בתיקיית ה-scratch, `--db`/`--report`/`--html` לשם):
  - קוד חדש (`1fd7fbc`), `sync-portfolio`: "Inserted 0, refreshed 4, killed 0". מול המסד המחויב השתנו רק `updated_at` בארבע
    השורות, `human_setup` ב-`il-biz-tools` וב-`oss-bounties`, `operating_loop` ב-`oss-bounties`, ו-kv `revenue.goal_queue`.
    כל עשרת התקציבים 0 אחרי הסנכרון ו-0 אחרי `tick --no-feed --force` (ran 4, 4 decisions, 5 blockers). tier ו-status של
    כל עשר השורות כמו במסד המחויב. ב-REPORT.md: "Create two PostHog organisations" 4 פעמים, "the same sitting also sets
    the organisation's $0 Actions budget" 4, "creates the owner's own read-only ORG_BUDGETS_READ_TOKEN, never the machine
    account's" 4, "the only other thing step 7's sitting does" 0 (ב-REPORT.md המחויב: 0, 0, 0, 4). גם ב-dashboard.html:
    PostHog 1, הטקסט הישן 0.
  - קוד ישן (`b40f32e`), אותו דבר: אחרי הסנכרון התקציבים 4000 (`apify-actors`), 4000 (`il-biz-tools`), 3000
    (`oss-bounties`), 4000 (`pcn874`); הטיק המאולץ הריץ את סקירת הלוח והחזיר אותם ל-0.
  - בלי `--force` (צורת הריצה המתוזמנת הבאה; רצו ledger sync וסקירת מפקח, סקירת הלוח והביקורת "Not due"): קוד חדש — כל
    התקציבים 0; קוד ישן — 4000, 4000, 3000, 4000 היו נשארים במסד שמתחייב, עד סקירת הלוח היומית. PostHog 2, הטקסט הישן 0
    בשני הדוחות.
  - `git status --short` בתוך כל עץ אחרי הסימולציה: ריק (הטיק לא כתב קובץ בעץ).
- **verify ממוקד** (`scripts/verify.sh` על `ledger.test.ts`, `runner.test.ts`, `colony-cli.test.ts`,
  `mutation-plans.test.ts`, `youtube-madeforkids.test.ts`): typecheck exit 0, tests exit 0, 5 קבצים, 179 בדיקות, "verify:
  passed", exit 0.
- **verify מלא** (`scripts/verify.sh`, ברירת המחדל `src/__tests__/revenue`, על `1fd7fbc` ועוד שורת הזמנים ב-README):
  typecheck exit 0, tests exit 0, 80 קבצים עברו, 2902 בדיקות עברו ו-2 דולגו, 119 שניות, "verify: passed", exit 0. שתי
  הדילוגות קיימות מקודם ותלויות סביבה: `narration-licence-gate.test.ts:296` (`skipIf` בלי ארכיון במטמון) ו-
  `prize-apply-reading.test.ts:496` (`runIf` משתנה סביבה).
- grep על ה-diff לפני כל commit לתבנית השם (כפי שהוגדרה במשימה) ולכתובות דואר: 0 שורות.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **בדיקת מסד המושבה בלי sqlite3:** כתבתי שלושה סקריפטים קטנים ב-scratch (טבלת שורות, השוואת seed לעמודות, diff עמודות
  בין שני מסדים). `scripts/colony-db-diff.mjs <a.db> <b.db>` (עמודות `revenue_lines` שהשתנו, מפתחות kv, ספירות שורות)
  היה חוסך את זה לכל סוקר של בנייה שנוגעת במסד.
- **סימולציה של ריצה מתוזמנת:** `sync-portfolio` + `tick` על עותק, עם `--db`/`--report`/`--html` לתיקייה זמנית, בתוך
  sim-tree — שלוש שורות שחזרתי עליהן ארבע פעמים (חדש/ישן × מאולץ/לא). `scripts/colony-sim.sh [--ref] [--force]` שמריץ את
  שני השלבים של ה-workflow בדיוק כמו ב-`colony.yml` על עותק היה גם עוזר לשרשור הראשי, שלא מתחייב REPORT.md מקומי.
- **שאלה פתוחה לשרשור הראשי:** tier ששונה ב-portfolio.ts לשורה קיימת לא מוחל עכשיו (ראו סעיף 4). אם הלוח של הקוד (פסיקות
  Fable) ישנה tier, צריך דרך: פקודת CLI `colony.ts tier <line> <tier> --reason` שרושמת review, או החלטה שה-seed כן קובע
  tier. ההחלטה יקרה אם טועים בה (היא משנה את משקלי ההקצאה), ולכן מתאימה ל-Fable.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `CLAUDE.md` הארוך של ריפו אחר (OmniRoute) שנטען להקשר ולא נוגע למשימה: עלות קבועה, לא בשליטתי.
- רשימת המשימות של השרשור הראשי שהוזרקה שוב ושוב בתזכורות: לא רלוונטית לסוכן בונה.
- הקריאה של הבדיקות הקיימות ב-`runner.test.ts` (כ-150 שורות) — נחוצה, כדי לבנות את הבדיקה החדשה על `withDone` ו-
  `checklist` הקיימים במקום לכתוב עזרים חדשים.
- החילוץ השגוי של הטקסט הישן (סעיף 5) — סבב כלי אחד מיותר.
- הסימולציות בלי `--force` — לא התבקשו, אבל הן ההוכחה לצורה של הריצה המתוזמנת הבאה, ולכן לא נחשבות לבזבוז.

## תיקוני הסקירה

הסוקר (JSON, 7.10) מצא ממצא חוסם אחד, שני ממצאי "fix" ושלוש הערות. המתקן (Opus) עבד באותו worktree על
`build/tick63-sync`. קודם מוזג הבסיס: `origin/claude/new-session-j071dx` התקדם ל-`74b9bce` (מיזוג PR #64), שהעץ שלו זהה
לזה של `b40f32e` (`git diff b40f32e 74b9bce` ריק), ולכן המיזוג עבר בלי קונפליקטים (`0649d4d`, עם שורות הייחוס).

**ממצא → שינוי** (מספרי שורות של HEAD אחרי התיקון):

- **B1 (חוסם), `syncPortfolio` מכניס שורה חדשה בתקציב ה-seed שלה, ועם הסנכרון השעתי זה קורה בלי השגחה.** תוקן לפי התיקון
  שהסוקר הציע: `src/revenue/portfolio.ts:836` מכניס `{ ...seed, budgetMonthlyCents: 0 }`; סקירת הלוח מקצה. ההערה מעל
  `syncPortfolio` (:793-823) אומרת למה, עם המדידה של הסוקר. ההערה של `updateLineFromSeed` (`ledger.ts:308-336`), הערת השלב
  ב-`colony.yml` (:59-65) וטקסט ה-usage של `colony.ts` (:64-74) תוקנו כך שלא יגידו עוד "never writes a line's budget"
  בלי הסייג של שורה חדשה. משפט כלל ה-₪0 בסעיף 4 למעלה תוקן במקומו ומסומן. הזריעה של מסד ריק בתוך `runBoardReview`
  (`seedDefaultPortfolio`) נשארה כמו שהיא, כפי שהסוקר כתב: שלב 6 של אותה סקירה מקצה מיד, לכל השורות.
- **F1 (fix), שלב הסנכרון מתעלם ממתג הכיבוי.** בחרתי בדרך הראשונה של הסוקר, ברמת הפונקציה ולא רק ב-CLI: `syncPortfolio`
  חוזר מיד עם `disabled: true` ובלי לגעת בשום דבר כש-`isRevenueColonyEnabled` שקר (`portfolio.ts:831`), וה-CLI מדפיס
  "Revenue colony is disabled (kv revenue.enabled = 0): portfolio.ts was not applied, no line changed." ויוצא 0
  (`colony.ts:258-263`), כמו הטיק, כדי שהטיק שאחריו עדיין יכתוב את הדוח שאומר שהמושבה כבויה. **החלטה:** זה חל גם על
  הרצה ידנית של `sync-portfolio`; מתג הכיבוי אומר שהמושבה לא משנה כלום, ומי שרוצה להחיל פסיקה מדליק אותה קודם. לא הוספתי
  דגל עקיפה (YAGNI).
- **F2 (fix), שדות ההריגה לא הוכחו.** בדיקה חדשה, `ledger.test.ts:276`: שורה מ-`DEFAULT_PORTFOLIO` נהרגת ב-
  `updateLineStatus(..., "killed", { reason, force: true })`, ה-seed שלה עדיין ברשימה, `syncPortfolio` מרענן את הטקסט שלה
  ו-status, `killedAt` ו-`killReason` לא משתנים. שני המוטנטים של הסוקר נוספו לתוכנית בשמות T63-L7 (R63-X1) ו-T63-L8 (R63-X4),
  ושניהם נהרגים.
- **N1 (הערה), tier ששונה ב-portfolio.ts נזרק בשקט.** עשיתי: `PortfolioSyncResult.tierDiffers` (`portfolio.ts:835`) מונה
  שורה קיימת שה-tier השמור שלה שונה מה-seed, וה-CLI מדפיס אותה (`colony.ts:268-270`), כך שפסיקת tier שנרשמה רק בקוד תופיע
  בלוג של הריצה המתוזמנת במקום להיעלם. השאלה הפתוחה לסעיף 7 (מי מחיל tier לשורה קיימת) נשארת לסבב Fable; עכשיו לפחות
  רואים אותה.
- **N2 (הערה), מספרי השורות בטבלת העמודות הם של הבסיס.** נוסף לכותרת הטבלה בסעיף 4 שהם של `b40f32e`. ב-HEAD:
  `insertLineFromSeed` :276, `updateLineFromSeed` :337, `updateLineStatus` :377, `setHumanSetupDone` :400, `setLineBudget`
  :408, `setLineTier` :413, `setLineTarget` :418 (`ledger.ts`).
- **N3 (הערה), בדיקת "כל workflow" תופסת רק את הנתיב.** `colony-cli.test.ts:100`: הביטוי תופס עכשיו גם את הסקריפט `colony`
  של `package.json` (`pnpm colony tick`, `pnpm run colony -- tick`, `npm run colony tick`), עם בדיקה עצמית שלו ושל ביטוי
  הסנכרון; `colony.yml` עדיין ה-workflow היחיד שמריץ טיק.

**בדיקות:** ב-`ledger.test.ts` הבדיקה "still starts a new line at its seed's budget" **שונתה**: הטקסט הנעוץ היה 2500 של
ה-seed, ועכשיו היא "starts a line it inserts at budget 0, for the board review to allocate" ומצפה ל-0, ובנוסף מריצה את
הפורטפוליו האמיתי על מסד ריק (הריצה המתוזמנת הראשונה) ומצפה שכל ארבע השורות ייכנסו ב-0. זו הבדיקה שהבונה הוסיף, והיא
נעצה את ההתנהגות שהסוקר מצא שגויה; ההחלפה נעשתה כפי שהסוקר ביקש. בדיקת ה-tier מוסיפה `tierDiffers`; בדיקת הפורטפוליו
האמיתי מוסיפה `disabled: false` ו-`tierDiffers: []`. שתי בדיקות חדשות: השורה ההרוגה (F2), והמושבה הכבויה (F1): שורות
`revenue_lines` וטבלת kv זהות לפני ואחרי, התוצאה `{ disabled: true, ... }` כולה ריקה, ואחרי הדלקה אותו סנכרון מכניס, מרענן
והורג. אף assertion קיים אחר לא שונה ולא הוחלש.

**מוטציות:** `src/__tests__/revenue/mutations/ledger.json` עכשיו 17 רשומות. חדשות: T63-L7, T63-L8, T63-P2 (`syncPortfolio`
מכניס שוב בתקציב ה-seed), T63-P3 (מדווח שהמושבה כבויה ומחיל בכל זאת), T63-P4 (`tierDiffers` לא מתמלא). ה-`find` וה-`replace`
של T63-W4 עברו אחרי ההערה ב-`colony.yml`. `mutate.mjs --check`: 17 of 17 would apply. ריצה ב-`scripts/sim-tree.sh --ref
df76ffc`: 17 הוחלו, **17 נהרגו**, 0 שרדו, 67 שניות, exit 0. הזמן נרשם ב-`mutations/README.md`.

**סימולציה** (ב-sim-tree, על עותקים טריים של `colony.db` המחויב, sha `7d46a1c8…`, בתיקיית ה-scratch):

- **א. צורת הריצה המתוזמנת** (`sync-portfolio`, אחר כך `tick --no-feed`): "Inserted 0, refreshed 4, killed 0", exit 0. השתנו
  רק `updated_at` בארבע השורות, `human_setup` ב-`il-biz-tools` וב-`oss-bounties`, `operating_loop` ב-`oss-bounties`. אף
  ערך kv לא השתנה ואף ספירת שורות לא השתנתה. הטיק הריץ ledger sync וסקירת מפקח, וסקירת הלוח והביקורת היו "Not due". כל
  עשרת התקציבים 0, וה-tier, status ו-setupDone כמו במסד המחויב. ב-REPORT.md: PostHog 2, הטקסט הישן של צעד 7 0, שני
  המשפטים החדשים של צעד 7 2 כל אחד. אחרי `--force`: 4, 0, 4, 4, וכל התקציבים עדיין 0. ב-REPORT.md המחויב: 0, 4, 0, 0.
- **ב. seed חדש בצורת pcn874** (`pcn874-sim`), אחר כך טיק לא מאולץ ואז מאולץ: בקוד המתוקן השורה נכנסה ב-0 ונשארה 0, וסכום
  התקציבים 0 בכל שלב. בקוד של הבונה (`1761517`), אותו תרחיש: 4000 אחרי הסנכרון ואחרי הטיק הלא מאולץ (סכום 4000), ו-0 רק אחרי
  סקירת הלוח המאולצת. זו המדידה של הסוקר, שחוזרת.
- **ג. מושבה כבויה** (`revenue.enabled = 0` על העותק): ה-CLI הדפיס את משפט הכיבוי ויצא 0; גם הסנכרון עם ה-seed הנוסף החזיר
  `disabled: true` וריק; אחרי שני הסנכרונים ואחרי הטיק (שנחסם ב-"revenue colony is disabled") אף עמודה, ערך kv או ספירת
  שורות לא השתנו. בקוד של הבונה, אותו עותק: "Inserted 0, refreshed 4" והסנכרון הנוסף הכניס את `pcn874-sim`.
- `git status` בעץ הסימולציה אחרי הכול ריק. `state/colony/` בקופה הראשית: ה-sha256 של כל קובץ זהה לפני ואחרי.

**הרצות:** `scripts/verify.sh` על חמשת קבצי הבדיקה שהשתנו (`ledger`, `runner`, `colony-cli`, `mutation-plans`,
`youtube-madeforkids`): typecheck exit 0, tests exit 0, 181 בדיקות, exit 0. `scripts/verify.sh` מלא: typecheck exit 0,
tests exit 0, 80 קבצים, 2904 עברו ו-2 דולגו (אותן שתיים מקודם), 114 שניות, exit 0. grep על ה-diff לתבנית השם ולכתובות
דואר: 0 שורות.

**מה נשאר פתוח (לא נדרש בסקירה):** `colony.ts seed` (ידני) ו-`revenue_propose_line` (`tools.ts`, דורש סביבת סוכן) עדיין
מכניסים שורה בתקציב של ה-seed או ההצעה; אף אחד מהם לא רץ בריצה המתוזמנת. ה-`colony.ts report` שמאפס את חוסם "the loop did
not run" נשאר כמו שנרשם בסעיף 4.

**שגיאות בדרך:** סקריפט הבדיקה שלי ב-scratch נכתב כ-`.ts` בלי `package.json` ו-tsx הריץ אותו כ-CJS (top-level await נכשל);
שיניתי ל-`.mts`. בהרצה הראשונה של תרחיש א' חתכתי את פלט ה-CLI ב-`| head -1`, וה-EPIPE הפיל אותו עם exit 1 אחרי הכתיבה
למסד; הרצתי את כל הסימולציה מחדש עם פלט לקובץ, והמספרים למעלה הם מההרצה השנייה.
