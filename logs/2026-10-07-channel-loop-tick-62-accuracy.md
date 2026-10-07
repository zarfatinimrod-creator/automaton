# סבב 62 (7.10.2026): בנייה קטנה של דיוק — שלושה טקסטים שהבעלים קורא, או שהקוד מדפיס, ושכבר לא היו נכונים

## 1. מה המשתמש ביקש

המשימה הגיעה מהשרשור הראשי של לולאת הערוצים (סבב 62), אחרי דוח הסטטוס לבעלים של היום
(`logs/2026-10-07-owner-status-report.md`) והמאמתים שלו. הם מצאו שלושה טקסטים שכבר לא נכונים, וביקשו לתקן בדיוק אותם
ולא שום דבר אחר:

1. **הישיבה של צעד 7, כפי שדוח המושבה מדפיס אותה.** פריט ה-`humanSetup` של `oss-bounties` (עם `steps: [7, 6]`) אמר
   ש-`BRAND_GITHUB_TOKEN` הוא "the only other thing step 7's sitting does". מאז 4.10 (פסיקה 4.10 שורה 18 והתיקון שלה)
   הישיבה גם מגדירה לארגון תקציב Actions של $0 עם "stop usage", מצטרפת להתראות השימוש ויוצרת את
   `ORG_BUDGETS_READ_TOKEN`. לשכתב רק את הפסוקית הזאת, במילים של הקוד לצעד 7, ולנעוץ כל בדיקה שנועצת את הטקסט.
2. **צעד 6 חלק ד בדוח המושבה.** פסיקה 7.10 שורה 25 הפכה את שני ארגוני PostHog לחלק ד של צעד 6, מבוקש עכשיו, אבל הדוח
   השעתי לא מזכיר אותו כי אף פריט `humanSetup` לא מזכיר PostHog. להוסיף פריט אחד לשורה `il-biz-tools` עם `steps: [6]`,
   כך שיירד כשצעד 6 נרשם כבוצע, ולנעוץ את הרשימה החדשה בבדיקות. לא להריץ את המושבה ולא לכתוב מחדש את
   `state/colony/REPORT.md`.
3. **הטקסטים של סקריפט הקריאה-חזרה** (`scripts/youtube-madeforkids-readback.ts`): (א) הסירוב אמר שאין קריאה "עד שתנאי
   YouTube API Services ייקראו ברמת github ויירשמו" — הם נקראו ב-7.10 והפסק הוא CONDITIONAL_UNMET; (ב) פסקת ה-WRITES
   לא הזכירה את `firstRead`; (ג) התיעוד של `stayedPublic()` צריך לומר ש-`first` מעגן את השעון ולא `firstRead`.
4. לאמת ב-`scripts/verify.sh` (ממוקד ואז מלא), לבצע commit בענף `build/tick62-accuracy`, לכתוב את היומן הזה ולבצע לו
   commit. לא לדחוף.

## 2. הפעולות המרכזיות שביצעתי

- יצרתי worktree מבודד ב-scratchpad על הענף `build/tick62-accuracy` מ-`origin/claude/new-session-j071dx`; בדקתי שהבסיס
  (`20d630f`) מכיל את `15efffa` כאב (`git merge-base --is-ancestor`), ש-`products/` ו-`src/revenue/` לא ריקים, וקישרתי את
  `node_modules` של הקופה הראשית.
- קראתי את צעד 7 ב-`src/revenue/owner-steps.ts` (`unlocks`: "a $0 Actions product-level budget scoped to the whole
  organisation with "Stop usage when budget limit is reached" ticked … the included-usage alerts opted in; and a read-only
  token, ORG_BUDGETS_READ_TOKEN"), את §1, §2 ו-"Folds for Opus" של פסיקת PostHog, את חלק ד ב-`docs/OWNER_STEPS.he.md`
  (שמות הארגונים, כלל העצירה, 3 דקות, הסדר של ₪0), ואת שרשרת הדוח: `humanSetupOf()` / `humanSetupItemFor()` ב-portfolio,
  `openSetupItems()` / `describeOpenSetup()` ב-owner-steps (מורידים פריט כשכל הצעדים שלו בוצעו), ו-`updateLineFromSeed()`
  ב-ledger, שמסנכרן את `human_setup` של שורה קיימת מה-seed. הוא רץ רק מ-`colony.ts sync-portfolio`: הטיק המתוזמן זורע רק מסד ריק ולא מרענן שורה קיימת (תוקן בסקירה).
- **פריט 1:** ב-`src/revenue/portfolio.ts` הפסוקית ", and the only other thing step 7's sitting does" הוחלפה בסוגריים:
  "(the same sitting also sets the organisation's $0 Actions budget with "Stop usage when budget limit is reached" ticked,
  opts in to the included-usage alerts and creates the read-only ORG_BUDGETS_READ_TOKEN: ruling 4.10 row 18 and its
  amendment, RULING-2026-10-04-mozilla-precondition.md)". שאר הטקסט של הפריט נשאר בית אחר בית.
- **פריט 2:** פריט חדש שני ברשימה של `il-biz-tools` (אחרי תיבת הדואר, לפני Gumroad), `steps: [6]`: שני ארגוני PostHog,
  Mehudak ו-chartsplained, בחשבון שהמחבר כבר מגיע אליו, בלי לגעת בארגון הקיים; כ-3 דקות, חינם, בלי כרטיס ובלי זהות; כלל
  העצירה של המסמך; "Without them no page-view counter runs and no D0 is recorded"; ציטוט פסיקה 7.10 שורה 25.
- **פריט 3:** בסקריפט — קבוע חדש `API_TERMS_EXCERPT` (קובץ הציטוט של 7.10); הסירוב אומר עכשיו "No call is made until
  googleapis.com's verdict there is active-eligible (ruling 7.10 row 24 (b)); the conditions the 7.10 read found unmet are
  listed in research/channel-loop/terms/youtube-api-services-terms-2026-10-07.md; nothing asked, nothing written."
  (`${terms.why}` נשאר בתחילתו). פסקת ה-WRITES מזכירה את `firstRead` (הקריאה הראשונה לאותו id, עם ייעוד או בלי, נכתבת
  פעם אחת; פסיקה 7.10 שורה 24 תיקון 1). ב-`src/revenue/youtube-madeforkids.ts`, בתיעוד של `stayedPublic()`: "The clock
  starts at the first designation read (the entry's `first`, never its `firstRead`)".
- נעיצות: עדכנתי את `runner.test.ts` (עשרה פריטים במקום תשעה, `gone` 8 במקום 7, האינדקסים של `il-biz-tools` זזו באחד,
  ובדיקה מפורשת שפריט PostHog יורד עם צעד 6 ונשאר כל עוד צעד 6 פתוח); הוספתי שתי בדיקות ל-`owner-steps.test.ts` ובדיקה אחת
  ל-`youtube-madeforkids.test.ts` (פירוט בסעיף 6).
- הרצתי את `scripts/verify.sh` הממוקד ואז המלא, `mutate.mjs --check` על שתי התוכניות שנוגעות בקבצים ששיניתי, ו-grep
  פרטיות על ה-diff.

## 3. קבצים/מערכות ששונו

- `src/revenue/portfolio.ts` — פסוקית צעד 7 בפריט הראשון של `oss-bounties`; פריט PostHog חדש (השני) ב-`il-biz-tools`.
- `scripts/youtube-madeforkids-readback.ts` — פסקת ה-WRITES, הקבוע `API_TERMS_EXCERPT`, טקסט הסירוב.
- `src/revenue/youtube-madeforkids.ts` — פסוקית אחת בתיעוד של `stayedPublic()`.
- `src/__tests__/revenue/runner.test.ts` — הספירה והאינדקסים של פריטי ההגדרה, ונעיצת פריט PostHog.
- `src/__tests__/revenue/owner-steps.test.ts` — שתי בדיקות חדשות (הגדר בפריט של `oss-bounties`; חלק ד כפריט השני של
  `il-biz-tools`).
- `src/__tests__/revenue/youtube-madeforkids.test.ts` — ייבוא `API_TERMS_EXCERPT` ובדיקה חדשה לטקסט הסירוב.
- `logs/2026-10-07-channel-loop-tick-62-accuracy.md` — היומן הזה (חדש).
- לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, פסיקות
  וישיבות, `research/measurements/*`, `state/colony/*`, ושום יומן קיים. לא היה push.

## 4. החלטות והנחות משמעותיות

- **פסוקית צעד 7 בסוגריים.** אחרי הפסוקית בא "the intake stays disabled … so the token changes nothing before then",
  שמדבר על `BRAND_GITHUB_TOKEN`. אם הייתי מכניס את הגדר כפסוקית רגילה, "the token" היה נקרא כ-`ORG_BUDGETS_READ_TOKEN`.
  בסוגריים זה נשאר משפט אחד, והנושא חוזר לטוקן של חשבון המכונה. ההמשך נשאר בית אחר בית, כמו שהתבקש.
- **המיקום של פריט PostHog: שני ולא אחרון.** במסמך הבעלים, בסדר של ₪0, צעד 8 ראשון, והחלק של Apify והחלק של PostHog
  שניים, ו-Gumroad (צעד 3) חמישי. לכן הפריט יושב אחרי תיבת הדואר ולפני Gumroad. המחיר הוא שהאינדקסים של
  `il-biz-tools` בבדיקות זזו באחד. אלה אותם פריטים בדיוק, נעוצים במקום החדש; לא נמחקה ולא רוככה אף בדיקה.
- **הפריט מקושר רק לצעד 6**, כמו שהתבקש, ולכן הוא יורד כשצעד 6 נרשם כבוצע. אם חלק ד ייעשה לפני שאר צעד 6 ("ארגוני
  PostHog נוצרו"), הדוח ימשיך לבקש אותו עד שצעד 6 כולו נרשם. אותו דבר קורה כבר עם פריט Apify, שגם הוא חלק מוקדם של צעד 6.
  לא הוספתי מנגנון לחלקי צעד: זה מחוץ להיקף.
- **"no card and no identity"** כתוב כמו בבקשה, אבל צירפתי את כלל העצירה של המסמך (כרטיס, תשלום, תעודה, טלפון, או רק
  ניסיון/מסלול בתשלום → סוגרים ולא יוצרים כלום). הסיבה: הפסיקה מציינת שאף טקסט של PostHog שנקרא לא אומר שיצירת ארגון
  לא דורשת כרטיס (דרגה none, נשען על הרשומה). הפריט לא מזכיר את `POSTHOG_READ_KEY`, כי השורה הזאת מוחזקת עד שהפרויקט קיים,
  ולבדיקה שמונה אותה פעם אחת לדוח אסור לראות עוד מופע שלה.
- **"the conditions the 7.10 read found unmet"** ולא "the conditions still unmet": הסירוב מודפס גם כשהקובץ חסר או כשאין
  רשומה. בניסוח עבר הוא נכון בכל מקרה, כי הוא אומר מה הקריאה של 7.10 מצאה. שם הקובץ בא מקבוע, והבדיקה מוודאת שהוא קיים
  ושהוא מקור הפסק שב-`terms-verdicts.json`.
- לא הורצה המושבה ו-`state/colony/REPORT.md` לא נכתב מחדש. הטיק המתוזמן **לא** מסנכרן את ה-seed: `colony.ts tick` זורע רק מסד ריק,
  ו-`updateLineFromSeed` רץ רק מ-`colony.ts sync-portfolio`; אחרי המיזוג השרשור הראשי מריץ `sync-portfolio` ואז `report` ומבצע commit ל-`state/colony` (תוקן בסקירה; ראו "תיקוני הסקירה").

## 5. שגיאות וניסיונות שנכשלו

- `node scripts/mutate.mjs --check --plan src/__tests__/revenue/mutations/youtube-madeforkids.json` החזיר exit 1 לפני
  ה-commit: "has uncommitted changes, so git checkout would lose them" לכל 28 השורות. זו לא שגיאת find. עם `--allow-dirty`
  היו 28 מתוך 28 "would apply", ואחרי ה-commit הבדיקה רצה שוב נקייה (סעיף 6).
- בהתחלה כתבתי את פסוקית צעד 7 כפסוקית רגילה ("; the same sitting also sets …"). תיקנתי לסוגריים מסיבת המשמעות שבסעיף 4.

## 6. בדיקות ופעולות ולידציה

- `scripts/verify.sh` על `youtube-madeforkids.test.ts`, `owner-steps.test.ts`, `mutation-plans.test.ts` ו-`runner.test.ts`
  (כל קבצי הבדיקה ששיניתי): typecheck exit 0, tests exit 0, 4 קבצים, 225 בדיקות, "verify: passed", exit 0.
- `scripts/verify.sh` מלא (ברירת המחדל `src/__tests__/revenue`): typecheck exit 0, tests exit 0, 80 קבצים, 2892 עברו ו-2 דולגו (מתוך 2894), "verify: passed", exit 0. שני הדילוגים קיימים מראש ותלויים בסביבה, בקבצים שלא נגעתי בהם: `narration-licence-gate.test.ts:296` (`it.skipIf` על ארכיון שמור) ו-`prize-apply-reading.test.ts:496` (`it.runIf` על משתנה סביבה).
- `node scripts/mutate.mjs --check --plan src/__tests__/revenue/mutations/owner-steps.json`: 7 מתוך 7, exit 0.
  `.../youtube-madeforkids.json`: 28 מתוך 28 אחרי ה-commit, exit 0 (לפני ה-commit: 28 מתוך 28 עם `--allow-dirty`). אף find לא זז: הסירוב שונה רק בתוך
  התבנית, ו-`  if (!terms.ok) {\n` נשאר בדיוק כמו שהיה.
- נעיצות חדשות:
  - `owner-steps.test.ts` "names the fence in oss-bounties' setup item too, in step 7's own words, not the token alone" —
    הטקסט הישן לא מופיע, והתקציב, "Stop usage", ההתראות, `ORG_BUDGETS_READ_TOKEN` ומקור הפסיקה מופיעים, וכל אחד מהם
    מופיע גם ב-`unlocks` של צעד 7.
  - `owner-steps.test.ts` "asks part ד in the report: il-biz-tools' second setup item is the two PostHog organisations,
    linked to step 6" — הצעדים של הרשימה הם `[[8], [6], [3], [6]]`; רק פריט אחד מזכיר PostHog; הוא לא מבקש את
    `POSTHOG_READ_KEY`.
  - `youtube-madeforkids.test.ts` "says what the refusal waits for since the 7.10 read" — הטקסט החדש; הישן לא מופיע;
    קובץ הציטוט קיים, הוא מקור הפסק המחויב, ויש בו "conditions unmet".
  - `runner.test.ts` — `gone` 8 (עשרה פריטים); פריט PostHog לא נשאל כשצעדים 3, 7 ו-6 בוצעו, ועדיין נשאל כשרק צעד 3 בוצע.
- מוטציות חד-פעמיות (`mutate.mjs --file --find --replace --test`, לא תוכנית בתיקיית scratch), כל אחת בעץ זמני של `scripts/sim-tree.sh` מ-`682caab`, עם baseline עובר לפני כל אחת: M1 ("creates the read-only ORG_BUDGETS_READ_TOKEN" → "creates nothing else") נהרגה ב-`owner-steps.test.ts`; M2 ("PostHog" → "analytics" בפריט החדש) נהרגה ב-`owner-steps.test.ts`; M3 ("verdict there is active-eligible" → "terms there are read at github grade") ו-M4 (שם קובץ הציטוט → "the terms file") נהרגו ב-`youtube-madeforkids.test.ts`; M5 (`POSTHOG_READ_KEY` נכנס לטקסט הפריט) שרדה מול `runner.test.ts` לבדו, כי הבדיקה שם סופרת רק את הצורה עם backticks, ונהרגה מול `owner-steps.test.ts`; M6 ("owner step 6 part ד" → "owner step 8") נהרגה. לא הוספתי אותן לתוכניות שליד הבדיקות: אין תוכנית ל-`portfolio.ts`, והבנייה הייתה לתקן טקסטים בלבד.
- grep הפרטיות (התבנית הוקלדה מחולקת) על ה-diff: 0 שורות; כתובות דוא"ל ב-diff: 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **אינדקסים קבועים בבדיקות** (`itemsOf("il-biz-tools")[1]`) שוברים כל הוספה של פריט באמצע רשימה. עוזר קטן שמוצא פריט
  לפי הצעדים שלו או לפי תחילת הטקסט היה חוסך את עדכון האינדקסים. לא בניתי אותו: זה מחוץ להיקף.
- **`mutate.mjs --check` נכשל על עץ מלוכלך**, גם כשכל מה שרוצים לדעת זה אם ה-find עדיין נמצא. יכול להיות שכדאי ש-`--check`
  יבדוק finds גם על עץ מלוכלך (בלי להחיל כלום) ויסמן את הלכלוך רק כאזהרה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הפסיקה של PostHog (שורות הפתיחה הארוכות של "Read" ו-"Pointers that moved") לפני שהגעתי ל-§1 ול-"Folds for
  Opus": בערך רבע מהקריאה, ורובו לא היה נחוץ לבנייה הזאת.
- ה-`grep` הראשון על "github grade" בבדיקות החזיר עשרות שורות fixtures לא רלוונטיות. סינון לפי `src/__tests__/revenue/*.ts`
  בלי `fixtures/` היה מספיק.
- תזכורות רשימת המשימות של השרשור הראשי, שחזרו כמה פעמים בתוצאות הכלים, לא נגעו לעבודה. לא נגעתי ברשימה.

## תיקוני הסקירה

הסקירה של `682caab`..`65c312e` מצאה ממצא חוסם אחד, שני תיקונים ושלוש הערות. תיקנתי את החוסם ואת שני התיקונים. ההערות
לא דרשו שינוי, ולא נגעתי בהן. הבסיס לא זז: `git log HEAD..origin/claude/new-session-j071dx` לא הדפיס כלום, ולכן לא היה
מיזוג.

1. **חוסם: הטיק המתוזמן לא מסנכרן את ה-seed.** היומן אמר פעמיים (בסעיף 2 ובסעיף 4) שהטיק המתוזמן הבא יעתיק את
   הטקסטים החדשים למסד. זה לא נכון. הטיק זורע רק מסד ריק: ב-`src/revenue/heartbeat.ts:392-395` התנאי הוא
   `listLines(db).length === 0`, והוא מוביל ל-`seedDefaultPortfolio` ול-`insertLineFromSeed`, שלא עושה כלום לשורה
   קיימת. `updateLineFromSeed` נקרא רק מ-`syncPortfolio()` (`src/revenue/portfolio.ts:798`), ש-`scripts/colony.ts`
   מריץ רק בפקודה `sync-portfolio` (`:247-248`). ה-workflow `.github/workflows/colony.yml:75` מריץ רק
   `colony.ts tick --no-feed`. שכתבתי את שני המשפטים במקומם עם `loop-edit.mjs replace-in-line` (שורות 33 ו-84-85).
   אותה טעות הייתה גם בדוח המסירה של הבונה ("on the next scheduled tick", "until the next scheduled tick"). הדוח שלי
   לשרשור הראשי מתקן אותה.
   - **מדידה** על עותק של `state/colony/colony.db` בתיקיית ה-scratch, עם הקוד של `247f7da` (`--db`, `--report` ו-`--html`
     הופנו כולם לתוך ה-scratch):
     - אחרי `colony.ts tick --no-feed --force`: בדוח 0 מופעים של "Create two PostHog organisations" ו-4 מופעים של
       "the only other thing step 7's sitting does".
     - אחרי `colony.ts sync-portfolio` ואז `colony.ts report`: 2 ו-0. כל אחד משני הטקסטים המתוקנים מופיע פעמיים.
     - `sync-portfolio` רענן ארבע שורות (apify-actors, il-biz-tools, oss-bounties, pcn874), לא רק את שתי השורות של
       הבנייה הזאת. כלומר המסד המחויב מפגר אחרי `portfolio.ts` גם בשורות אחרות.
     - `git status` של ה-worktree נשאר נקי מקבצי מושבה.
   - **צעד אחרי המיזוג, לשרשור הראשי** (קבצי המושבה שייכים לו, לא ל-worktree):
     1. בענף הממוזג להריץ `pnpm exec tsx scripts/colony.ts sync-portfolio`, ואחריו `pnpm exec tsx scripts/colony.ts report`
        (הפקודה כותבת גם את `REPORT.md` וגם את `dashboard.html`).
     2. לקרוא את ה-diff של שני הקבצים: ארבע שורות מתרעננות.
     3. לבצע commit ל-`state/colony`.

     עד שזה קורה, הטקסט הישן של `oss-bounties` נשאר במסד. `humanSetupItemFor` משווה טקסט מדויק, ולכן הטקסט הישן לא
     מתאים לאף פריט מקושר. הוא יישאל כפי שנכתב גם אחרי שצעדים 7 ו-6 יירשמו כבוצעו.
2. **תיקון: של מי הטוקן לקריאה בלבד.** ב-`src/revenue/portfolio.ts:331` "creates the read-only ORG_BUDGETS_READ_TOKEN"
   הפך ל-"creates the owner's own read-only ORG_BUDGETS_READ_TOKEN, never the machine account's". הפסוקית באה מיד אחרי
   הטוקן של חשבון המכונה עצמו, ובלי התוספת הבעלים יכול היה ליצור אותו בחשבון המכונה.
   - **המקורות:** התיקון של 4.10, כפי ש-`owner-steps.ts` כותב אותו: בצעד 7 "a fine-grained personal access token of the
     owner's own account", ובצעד 6 "it is the owner's own fine-grained token, never the machine account's". וגם
     `docs/OWNER_STEPS.he.md:47`: "מהחשבון האישי".
   - **סטייה מנוסח הסקירה:** כתבתי פסיק ולא סוגריים, כי הפסוקית כבר נמצאת בתוך סוגריים.
   - **הבדיקה:** ב-`owner-steps.test.ts` ("names the fence in oss-bounties' setup item too") הטקסט הנעוץ השתנה, ולכן נעצתי
     את הטקסט החדש והנכון. הטקסט הישן ננעץ כנעדר. נוספו שתי בדיקות: שהמילים "the owner's own account" נמצאות ב-`unlocks`
     של צעד 7, ושהמילים "never the machine account's" נמצאות ב-`unlocks` של צעד 6.
3. **תיקון: כלל העצירה של PostHog אומר לנו.** ב-`src/revenue/portfolio.ts:264` "close the tab and create nothing" הפך
   ל-"close the tab, create nothing and tell us".
   - **המקורות:** פסיקה 7.10 שורה 25 §1(6): "closes the tab and tells us, creating nothing", ו-"Either stop reopens this
     ruling's section 1". וגם `docs/OWNER_STEPS.he.md:414`: "סוגרים את הלשונית וכותבים לי".
   - **למה זה חשוב:** עצירה שקטה לא פותחת מחדש את הפסיקה, והדוח ממשיך לבקש את הארגונים.
   - **הבדיקה:** ב-`owner-steps.test.ts` ("asks part ד in the report") נעצתי את הטקסט החדש, והטקסט הישן ננעץ כנעדר.
4. **הערות שלא טופלו** (לא נדרש בהן שינוי):
   - פריט PostHog נשאר פתוח עד שכל צעד 6 נרשם כבוצע, כמו פריט Apify.
   - השם החלופי datawalkthrough לא מופיע בפריט.
   - רשימת הקריאה האחרונה בפסקת ה-WRITES לא מזכירה את `returned`.

**בדיקות:**
- `scripts/verify.sh` על `owner-steps`, `runner`, `youtube-madeforkids` ו-`mutation-plans`: exit 0, 4 קבצים, 225 בדיקות.
- `scripts/verify.sh` מלא: exit 0, 80 קבצים, 2892 עברו ו-2 דולגו (אותם שני דילוגים שתלויים בסביבה).
- שתי מוטציות חד-פעמיות ב-`scripts/sim-tree.sh --ref 247f7da`, כל אחת אחרי baseline עובר:
  - R1 החזירה את "creates the read-only ORG_BUDGETS_READ_TOKEN:".
  - R2 החזירה את "close the tab and create nothing.".

  שתיהן נהרגו ב-`owner-steps.test.ts` (exit 1), והעץ הזמני נמחק אחרי ההרצה. לא הוספתי אותן לתוכנית: אין תוכנית
  ל-`portfolio.ts`, כמו שהבונה כתב.
- grep הפרטיות (התבנית הוקלדה מחולקת) על ה-diff של התיקונים: 0 שורות. כתובות דוא"ל ב-diff: 0.

**שגיאה אחת:** קריאה אחת ל-`loop-edit.mjs` נכשלה (exit 2) כי ערך ה-`--anchor` התחיל ב-"-". צריך לכתוב
`--anchor=...`, כמו שכתוב בכותרת הסקריפט. הקובץ לא השתנה, והקריאה החוזרת עם `=` עברה.
