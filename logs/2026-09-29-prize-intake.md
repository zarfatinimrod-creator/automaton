# קליטת אירועי פרסים שמתירים AI — מכשיר מדידה בלבד (29.9.2026, עץ עבודה מבודד, Opus)

## 1. מה המשתמש ביקש
- בנייה של שורה 13 בתור הלולאה (`logs/CHANNEL_LOOP.md` §4): "AI-allowed prize-event intake (instrument only)".
- זו קריאה שבועית, בעלות ₪0, של הרשימה של mlcontests:
  `https://raw.githubusercontent.com/mlcontests/mlcontests.github.io/master/competitions.json`.
- הבנייה לפי הדפוס של המכשירים הקיימים (ספירת האספקה של Algora ו-job הלוחות של Metaculus):
  - מודול טהור של פירוק וסינון, עם בדיקות על fixture מקוצץ מהנתונים האמיתיים.
  - סקריפט שכותב **מספרים בלבד** ל-`state/colony/prize-intake.json`.
  - workflow שבועי שאפשר גם להפעיל ידנית, ושמבצע commit של קובץ המצב עם `[skip ci]`.
  - שורה אחת בדוח המושבה.
- ספירת "מותר AI או פתרון אוטומטי" נכנסת רק אם יש בנתונים שדה כזה. אם אין שדה, צריך לומר זאת, ואסור להסיק.
- המכשיר לא מגיש דבר, לא פותח חשבון ולא מוציא כסף.

## 2. הפעולות המרכזיות שביצעתי
- **יישור הבסיס:** עץ העבודה נפתח על `63f7ca4`, שאינו צאצא של `f2481be`. לכן הרצתי `git fetch` ואז `git reset --hard origin/claude/new-session-j071dx`, והבסיס עבר ל-`f2481be`.
- **קריאה אחת של הקובץ האמיתי (curl):** 200, 229,200 בתים, sha256 `49e37469…c389`.
  - הקובץ הוא `{"data": [...]}` עם 397 רשומות.
  - הרשומות משתמשות ב-18 מפתחות בסך הכול.
- **fixture:** `src/__tests__/fixtures/mlcontests-competitions-trimmed.json` מכיל 14 רשומות אמיתיות, מועתקות כלשונן ובסדר השדות המקורי.
  - הרשומות נבחרו כדי לכסות כל מקרה: מועד אחרון שנופל ביום הקריאה, הרשמה שכבר נסגרה, פרס null, תאריך שבור, יום דו-ספרתי, ושני האיותים של שנת הכנס.
  - קובץ `.meta.json` לצדו רושם את הכתובת, ה-sha256, הספירה המלאה ואת האינדקסים שנבחרו.
- **בדיקות תחילה.** שני קבצים:
  - `prize-intake.test.ts` (25 בדיקות);
  - `prize-intake-workflow.test.ts` (10 בדיקות).
  - בהרצה הראשונה שניהם נכשלו, כי המודול עוד לא היה קיים.
- **`src/revenue/prize-intake.ts`:**
  - `parseListDate` (מחמיר), `parseStatedUsd` ו-`summarisePrizeIntake`.
  - `runPrizeIntake`: בקשת GET אחת עם `redirect: "error"`, ואחריה נכתב הקובץ או כלום.
  - `readPrizeIntake`: הופך את הקובץ לשורה אחת בדוח. היא אף פעם לא חוסמת.
- **`scripts/prize-intake.ts`:** CLI דק, באותו דפוס של `algora-supply.ts`.
- **`.github/workflows/prize-intake.yml`:**
  - רץ בימי שלישי ב-05:41 UTC, ולא ביום שני, כי אז רץ algora.
  - אפשר להפעיל אותו ידנית, והוא רץ פעם אחת כשהמכשיר עצמו נכנס ל-main.
  - `ref: main`, קבוצת concurrency משלו, `contents: write` בלבד, בלי סודות.
  - הוא מבצע commit לקובץ המצב בלבד עם `[skip ci]`, ואם ה-push נדחה הוא עושה rebase ומנסה שוב, עד שלוש פעמים.
- **`src/revenue/runner.ts`:** נוספו `prizeIntakeFile` ו-`prizeIntake`, והשורה מודפסת תחת "This tick".

## 3. קבצים/מערכות ששונו
- חדש: `src/revenue/prize-intake.ts`, `scripts/prize-intake.ts`, `.github/workflows/prize-intake.yml`.
- חדש: `src/__tests__/revenue/prize-intake.test.ts`, `src/__tests__/revenue/prize-intake-workflow.test.ts`.
- חדש: `src/__tests__/fixtures/mlcontests-competitions-trimmed.json` ו-`.meta.json`.
- שונה: `src/revenue/runner.ts`, בחמש נקודות: import, אפשרות, שדה בתוצאה, קריאה ושורת דוח.
- **לא נוצר `state/colony/prize-intake.json`.**
  - את הקריאה הראשונה יבצע ה-workflow כשייכנס ל-main.
  - קריאה מקומית מקונטיינר פיתוח לא נחשבת קריאה של הסדרה.
- לא נגעתי ב-`CHECKPOINT.md`, `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`, `MISSION.md` ו-`CLAUDE.md`.
- את הסטטוס של שורה 13 ("not built") יעדכן החוט הראשי.

## 4. החלטות והנחות משמעותיות
- **אין ברשימה שדה של כלל AI, ולכן לא נספר דבר.** 18 המפתחות הם:
  - name, url, tags, deadline, launched, prize, platform, sponsor;
  - additional_urls, added, registration-deadline, conference;
  - conference_year, conference-year, data-size, note, additional_prizes, end-date.
  - אף אחד מהם לא קובע אם פתרון של AI או פתרון אוטומטי מותר או אסור.
  - התגיות `llm` (63) ו-`agents` (14) מתארות את נושא המשימה ולא הרשאה. **הן לא נספרו כ"מותר AI".**
  - ב-`note` יש טקסט חופשי, ב-9 רשומות, למשל "open to U.S. residents only". הוא לא מפוענח. נספר רק אם יש הערה, כדי שאדם יקרא אותה.
  - לכן בקובץ יופיעו `aiRuleFieldInSource: false`, `openAiAllowedStated: null` ו-`openAiNotForbiddenStated: null`. המשמעות: לא נמדד, ולא 0.
  - הקורא דוחה קובץ שמכיל ספירת AI, כי המודול לעולם לא מייצר אחת.
- **מה כן נספר (רק מה שהשדות אומרים):**
  - `listed` ו-`undatable`;
  - `open`: המועד האחרון נופל ביום הקריאה (UTC) או אחריו, כולל היום עצמו, כי ברשימה אין שעה ואין אזור זמן;
  - `openRegistrationClosed`, `openNotYetLaunched`;
  - `openWithStatedUsdPrize` ו-`openStatedUsdPrizeTotal`: רק "$N,NNN" מפורש. זה סכום הנקוב ברשימה לכל המקומות יחד, ולא הכנסה צפויה;
  - `openWithNote`;
  - `unknownFields`: מספר המפתחות החדשים. הערכים שלהם לא נקראים, ובדוח מופיעה בקשה לקרוא אותם ידנית.
- **אף פעם לא אפס מזויף.** במקרים הבאים לא נכתב כלום והיציאה היא 1:
  - שגיאת HTTP, הפניה, גוף שאינו JSON או שאין בו `data`, או רשימה ריקה;
  - יותר ממחצית המועדים האחרונים לא ניתנים לפענוח, כלומר הפורמט זז.
  - במצב כזה ה-job נכשל, והקובץ של השבוע הקודם נשאר.
- **השורה בדוח אינה חוסמת.** שום קו ושום KPI לא תלויים במכשיר.
  - כשאין עדיין קריאה, מודפסת השורה "no reading yet", בדומה לשורת "no reading yet" של המדידות המתויגות.
  - קריאה בת יותר מ-8 ימים מסומנת STALE בתוך השורה.
- **סדרה בזמן:** אין מערך שבועי בקובץ, כי היסטוריית ה-git של הקובץ היא הסדרה (YAGNI, או-פוניטייל).
- **בלי `--autostash`** ב-`git pull --rebase`, ובניגוד ל-algora-supply.yml: אחרי commit העץ נקי, ואין צורך בשום stash.

## 5. שגיאות וניסיונות שנכשלו
- **הבסיס:** בדיקת `merge-base --is-ancestor f2481be HEAD` נכשלה, ולכן בוצע reset.
- **הרשאות הרתמה:** פקודת bash מורכבת עם `cd` ל-scratchpad ו-heredoc של Python נחסמה, כי ה-harness לא הצליח לוודא שהיא נשארת בתוך עץ העבודה.
  - עברתי לסקריפט Python בקובץ, ולכלי Edit לעריכות.
- **תיקון לפני הרצה:** ה-regex בבדיקת ה-workflow (`-f `) היה נתפס על `[ ! -f "$JSON" ]`. תיקנתי אותו לפני ההרצה הראשונה.
- **ההרצה הראשונה של הבדיקות:** נכשלה כמתוכנן, כי המודול חסר. אחרי המימוש כל 35 הבדיקות עברו.

## 6. בדיקות ופעולות ולידציה
- `npx vitest run src/__tests__/revenue/prize-intake.test.ts src/__tests__/revenue/prize-intake-workflow.test.ts`: 35/35.
- `pnpm typecheck` (tsc --noEmit): יציאה 0.
- `npx vitest run src/__tests__/revenue`: 41 קבצים, 1,041/1,041.
- **הרצה חיה אחת** של `pnpm exec tsx scripts/prize-intake.ts --out <scratchpad>`, מחוץ למאגר:
  - 30 פתוחות מתוך 397;
  - 3 עם הרשמה סגורה, 0 שעוד לא הושקו;
  - 24 עם פרס דולרי נקוב, $2,624,825 בסך הכול;
  - 1 עם מועד אחרון שבור, 0 שדות לא מוכרים.
  - ה-sha256 זהה לזה שב-meta של ה-fixture, והמספרים זהים לפרופיל שהפקתי ב-Python באופן עצמאי.
- **שלב ה-commit של ה-workflow רץ ב-bash מול git מדומה** (הדפוס של brand-mail-workflow). נבדקו ארבעה מקרים:
  - הקובץ חסר: סירוב;
  - commit עם הנושא המדויק ו-`[skip ci]`;
  - הקריאה לא השתנתה: אין commit;
  - push נדחה: rebase וניסיון חוזר, וכישלון אחרי שלוש דחיות.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **שלד "מכשיר שבועי":** זה המכשיר השלישי באותה צורה, אחרי algora-supply ו-apify count-runs. הצורה היא:
  - קריאה → JSON של מספרים → commit ל-main עם rebase וניסיון חוזר;
  - שורה בדוח;
  - בדיקת YAML, ושלב commit שרץ מול git מדומה.
- כדאי גנרטור, או action מורכב משותף, לשלב "Commit the reading back to main". הבלוק הזה מועתק כמעט מילה במילה בין ה-workflows.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- **הדפסת פרופיל השדות:** הדפסתי את כל השדות החריגים בכל 397 הרשומות, כמה אלפי שורות. ספירה לפי מפתח הייתה מספיקה.
- **פקודות שנחסמו:** שתי פקודות bash מורכבות נחסמו, ונכתבו מחדש כקובץ או כעריכה.
- **קריאת הקשר:** רוב הקריאה ב-`CHANNEL_LOOP.md` הייתה שורות ארוכות מאוד שאינן קשורות לשורה 13. הספיק `grep` לשורה עצמה.
