# 2026-09-07 — פרסום חינם ל-Apify Store וספירת הרצות (משימה 20)

## 1. מה המשתמש ביקש

המדידה הזולה ביותר שהביקורת הראשית ביקשה: לפרסם את `products/apify-il-open-data` ל-Apify Store
**בחינם** (בלי מחיר, בלי KYC) דרך GitHub Actions, ולספור במשך 30 יום כמה זרים מריצים את ה-Actor —
כדי שלכוורת יהיה סוף-סוף סיגנל ביקוש **נמדד** ולא עוד תקרה משוערת. הבעלים מדביק סוד מאגר יחיד בשם
`APIFY_TOKEN` (צעד 6 ב-`docs/OWNER_STEPS.he.md`, שאסור היה לגעת בו).

הנדרש: workflow חדש `apify-publish.yml` עם job לפרסום ו-job יומי לספירה, סקריפט
`scripts/apify-runs.mjs` עם פונקציה טהורה ובדוקה `summariseRuns(runs, now)`, מבחני vitest, וסעיף
קצר ב-README של המוצר.

## 2. הפעולות המרכזיות שביצעתי

1. קראתי `MISSION.md`, `CLAUDE.md`, ה-README של המוצר, `.actor/actor.json`, `package.json`,
   `Dockerfile`, ואת `colony.yml` ו-`products-ci.yml` לסגנון הבית (concurrency guard, commit-back,
   טיפול בסודות).
2. **בדקתי את ה-CLI במקום לנחש אותו.** התקנתי `apify-cli@1.10.0` ל-scratchpad והרצתי `--help`,
   `push --help`, `login --help`, וניסויים ממשיים — ראה סעיף 4 לשלוש עובדות שהניסויים גילו והיו
   שוברות את ה-workflow אילו הנחתי אחרת.
3. אימתתי את צורת ה-API של Apify דרך Context7 (`/websites/apify_api_v2`) — `data.items`,
   `total/offset/limit/count`, `startedAt`, `userId`, `meta.origin`, תקרת 1000 לעמוד.
4. כתבתי `scripts/apify-runs.mjs`: stdlib + `fetch` מובנה בלבד, בלי אף תלות.
5. כתבתי 27 מבחנים ב-`src/__tests__/revenue/apify-runs.test.ts`.
6. כתבתי `.github/workflows/apify-publish.yml` עם שני jobs ושומר-מחיר.
7. בדקתי כל קטע shell ב-workflow ב-`bash -n`, והרצתי את שומר-המחיר ואת שני קטעי ה-node
   הפנימיים **verbatim** מול קבצים אמיתיים ומזויפים.
8. עדכנתי את ה-README: סעיף "Published free through CI", ותיקון רשימת הצעדים החד-פעמיים
   שסתרה אותו (היא הורתה על KYC ותמחור כתנאי מוקדם).

## 3. קבצים/מערכות ששונו

| קובץ | מה |
|---|---|
| `.github/workflows/apify-publish.yml` | חדש. job `publish` (push ל-main על נתיב המוצר / dispatch) ו-job `count-runs` (schedule יומי / dispatch). |
| `scripts/apify-runs.mjs` | חדש. `summariseRuns`, `classifyStarter`, `daysBetween`, `dayKey`, `toMs`, `fetchMe`, `fetchAllRuns`, `main`. |
| `src/__tests__/revenue/apify-runs.test.ts` | חדש. 27 מבחנים. |
| `products/apify-il-open-data/README.md` | סעיף "Published free through CI"; תיקון רשימת הצעדים החד-פעמיים; שכתוב "Deploy steps" ל-fallback ידני נכון. |
| `state/colony/measurements/apify-runs.json` | **לא נוצר.** ה-workflow יוצר אותו בריצה אמיתית; קובץ פיקטיבי היה בדיוק המספר-שאיש-לא-בדק שהמאגר הזה סובל ממנו. |
| `docs/OWNER_STEPS.he.md` | **לא נגעתי** — נאסר במפורש. |
| `state/colony/colony.db`, קוד המוצר, תמחור | **לא נגעתי** — נאסר במפורש. |

## 4. החלטות והנחות משמעותיות

**שלוש עובדות שאומתו בניסוי מול `apify-cli@1.10.0`, וכל אחת מהן הייתה שוברת את ה-workflow:**

1. **`apify push` לא קורא את `APIFY_TOKEN` מהסביבה.** עם `APIFY_TOKEN=fake` ובלי קובץ אישורים הוא
   יוצא בקוד 1 עם `"You are not logged in with your Apify account."` לכן ה-workflow מריץ
   `apify login --token` תחילה.
2. **`apify login` יוצא בקוד 0 גם כשהטוקן נדחה.** לכן קוד היציאה שלו לא מוכיח כלום, וה-workflow
   בודק במקום זה שנוצר `~/.apify/auth.json` — התחברות כושלת לא כותבת אותו (אומת).
3. **`--no-wait-for-finish`, שמופיע בדוגמאות של ה-CLI עצמו, נדחה על ידי מנתח הדגלים שלו.** הדגל
   הנכון הוא `-w` / `--wait-for-finish=<שניות>`. נבחר `--wait-for-finish=900`.

**החלטות נוספות:**

- **`apify-cli` מוצמד ל-1.10.0** ב-`npx`. שלוש העובדות למעלה תלויות בגרסה, וזה השלב שמפרסם לחנות
  ציבורית. `check-deps-freshness.mjs` קיים בדיוק בגלל תלות שזזה מתחת לרגליים.
- **ה-Actor נשאר חינם באכיפה, לא בהבטחה.** שלב שומר מוציא כל מפתח ב-`.actor/actor.json` ששמו מכיל
  `pric`, ומפיל את הבנייה אם נמצא משהו מלבד `suggestedPriceUsd` (תיעוד בלבד בתוך `ppeEvents`, שאינו
  שדה בספציפיקציית actor.json של Apify כלל — אומת מול התיעוד; מונטיזציה נקבעת רק ב-Console).
  אומת: `pricingModel`, `pricingInfos`, `pricePerUnitUsd` — כולם מפילים; המניפסט האמיתי עובר.
  ל-`apify push` אין דגל תמחור בכלל — המנתח דוחה `--pricing-model`.
- **`/v2/actors/...` עם נפילה חזרה ל-`/v2/acts/...` על 404.** המשימה נקבה ב-`/v2/acts/`, אבל
  הלקוח הרשמי (`apify-client`) משתמש ב-`resourcePath: 'actors'` והתיעוד הנוכחי מתעד `actors`.
  מכיוון ש-api.apify.com חסום מהקונטיינר הזה, לא יכולתי לבדוק אף אחד מהשניים מול השירות — לכן
  נפילה חזרה ולא הימור.
- **הפרדת "זרים" מ"אנחנו".** ההרצות שלנו נושאות את ה-`userId` של החשבון שלנו; ספירתן כביקוש הייתה
  מייצרת בדיוק את ההצלחה המזויפת ש-`MISSION.md` קיים כדי למנוע. בלי `ownUserId` הכל `unknown`
  ו-`strangerRuns*` נשאר 0 — לנחש היה גרוע יותר מלהודות.
- **שתי סירובים מכוונים לכתוב אפס:** בלי טוקן, ו-404 על ה-Actor. קובץ מדידה שאומר "0 הרצות" אינו
  ניתן להבחנה מ"הדבר מעולם לא פורסם". אפס **אמיתי** (פורסם, אף אחד לא הריץ) כן נכתב, בבירור.
- **`byDay` ממולא באפסים** על פני כל תאריך UTC שהחלון נוגע בו (31 מפתחות ל-30 יום, כי היום הישן
  ביותר חלקי). תיק שלא מרוויח חייב להראות אפס, לא אובייקט ריק שנקרא "אין עדיין נתונים".
- **קבוצת concurrency נפרדת (`apify-publish`), לא `colony-state`.** שיתוף הקבוצה היה מסדר גם בין
  ה-workflows, אבל GitHub שומר רק ריצה ממתינה אחת לקבוצה — טיק שעתי היה יכול לבטל בשקט את הספירה
  היומית ויום מדידה היה נעלם. מרוץ הכתיבה מטופל היכן שהוא באמת קורה: לולאת rebase-and-retry.
- **`count-runs` עושה checkout ל-`ref: main`** — סדרת מדידה מפוצלת בין ענפים אינה סדרה.
- **סקריפט בלי תלויות בכוונה.** מדידה יומית שתלויה בעץ חבילות היא מדידה שמישהו אחר יכול לשבור.
- **לא עדכנתי את `logs/CHECKPOINT.md`.** אני אחד מכמה סוכנים בעצי-עבודה מקבילים; עריכת קובץ
  "איפה עצרנו" משותף הייתה מייצרת התנגשות מיזוג לכל אח. הלוג הזה הוא בשם ייחודי ולא מתנגש.

## 5. שגיאות וניסיונות שנכשלו

- **עץ העבודה התחיל על ה-commit הלא נכון.** ה-worktree היה על `90816df` (מיזוג ישן) ולא הכיל
  `products/` או `.github/` בכלל. `git reset --hard claude/monthly-income-plan-pfs7vu` (21d0226)
  לפני כל עבודה. אילו לא הייתי בודק, הייתי בונה על בסיס ריק.
- **`--no-wait-for-finish` נכשל** — הועתק מהדוגמאות של ה-CLI עצמו ונדחה על ידי מנתח הדגלים שלו.
  נתפס בניסוי, לא בקריאה.
- **הנחתי בתחילה ש-`APIFY_TOKEN` בסביבה מספיק ל-`push`.** הניסוי הפריך את זה. זו הייתה נכשלת
  בייצור עם הודעה מבלבלת.
- **גרשיים אחוריים בתוך מחרוזת bash במרכאות כפולות.** כתבתי `` `apify login` `` בתוך הודעת שגיאה —
  זו הרחבת פקודה ב-bash. נתפס ב-`bash -n` ותוקן.
- **`grep -i price` היה מפיל את הבנייה על המניפסט האמיתי**, כי `suggestedPriceUsd` קיים בו. השומר
  מוציא רשימת מפתחות ומחסיר את היחיד המוכר-כתמים, במקום להתאים תבנית גסה.
- לא הצלחתי לאמת דבר מול api.apify.com: פרוקסי היציאה מחזיר `CONNECT tunnel failed, response 403`.

## 6. בדיקות ופעולות ולידציה

| פקודה | תוצאה |
|---|---|
| `pnpm typecheck` | ✅ יצא 0 |
| `npx vitest run src/__tests__/revenue/apify-runs.test.ts` | ✅ 27/27 עברו |
| `node --check scripts/apify-runs.mjs` | ✅ |
| `python3` — פענוח YAML של ה-workflow | ✅ 2 jobs, 3 טריגרים, concurrency + permissions כמצופה |
| `bash -n` על כל 11 קטעי ה-`run:` | ✅ 0 כשלים |
| שומר-המחיר verbatim מול 4 מניפסטים | ✅ אמיתי עובר; `pricingModel`/`pricingInfos`/`pricePerUnitUsd` מפילים |
| שני קטעי ה-node של ה-workflow verbatim מול JSON אמיתי | ✅ נושא commit ותקציר ריצה תקינים |
| `main()` מול API מדומה: 1500 הרצות, 2 עמודים | ✅ עמודים, `daySum == runsLast30Days`, 31 מפתחות יום, ההפרדה own/stranger נכונה |
| `main()` — נתיב `acts` הישן | ✅ הנפילה-חזרה פועלת ו-`source` מדווח את הנתיב שבו באמת השתמש |
| `main()` — 404 על ה-Actor | ✅ הודעה, יציאה 0, שום קובץ לא נכתב |
| `main()` — בלי טוקן / טוקן ריק | ✅ הודעה שנוקבת בצעד 6, יציאה 0 |
| `npm ci && npm test && npm run build` במוצר | ✅ 41/41, בנייה 0 |
| `apify-cli validate-schema` במוצר | ✅ input schema ו-dataset schema תקינים |

**מה שלא ניתן היה לאמת מהקונטיינר הזה, במפורש:** ההתחברות האמיתית, ה-push האמיתי, ותשובת ה-API
האמיתית. `api.apify.com` חסום (`403` על CONNECT). כל מה שמעל נבדק מול ה-CLI האמיתי במצב לא-מקוון
ומול API מדומה בצורה שאומתה מול התיעוד הרשמי.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **בדיקת קטעי shell בתוך workflows.** כתבתי סקריפט חד-פעמי שמפענח YAML ומריץ `bash -n` על כל
  `run:`. תפס באג אמיתי (גרשיים אחוריים). שווה `scripts/lint-workflows.mjs` קבוע — יש במאגר
  ארבעה workflows ואף אחד לא נבדק כך.
- **בדיקת CLI לפני שכותבים עליו workflow.** שלוש מתוך שלוש ההנחות שלי על `apify-cli` היו שגויות.
  התבנית "התקן ל-scratchpad, הרץ `--help`, נסה את מסלול הכישלון" צריכה להיות ברירת מחדל.
- **`npx` לא מוצמד ב-CI.** אין במאגר בדיקה שתופסת `npx <pkg>` בלי גרסה. הרחבה טבעית
  ל-`check-deps-freshness.mjs`.

## 8. על מה בוזבזו אסימונים, לפי פעולה

| פעולה | הערכה | הערה |
|---|---|---|
| קריאת `MISSION.md` + `CLAUDE.md` | ~13k | חובה לפי ההוראות; לא בזבוז |
| `grep` על `APIFY_TOKEN` ב-`node_modules` של ה-CLI | ~1.5k **מבוזבז** | הפלט היה 1MB ונחתך; היה צריך `grep -oh` עם הקשר מלכתחילה |
| קריאת ה-README המלא של המוצר | ~4k | נדרש — ערכתי אותו |
| Context7 על Apify API | ~3k | חסך ניחוש על צורת התשובה; הוחזר בערך |
| ניסויי CLI (התקנה, help, probes) | ~4k | גילה שלוש עובדות שוברות-workflow. ההוצאה הכי משתלמת בסשן |
| התחלה בעץ עבודה שגוי | ~1k **מבוזבז** | שתי קריאות כושלות לפני `git status`; לבדוק HEAD ראשון תמיד |
| בדיקת workflow (YAML, `bash -n`, שומר, קטעי node) | ~3k | תפס באג גרשיים אחוריים |
