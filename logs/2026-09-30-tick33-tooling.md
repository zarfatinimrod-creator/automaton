# 30.9.2026 — טיק 33, בניית כלים: verify.sh, pytest-product.sh, capture-check.mjs (builder, worktree)

## 1. מה המשתמש ביקש
ה-workflow של השרשור הראשי ביקש שלושה כלים קטנים, stdlib בלבד ובדיקות קודם (TDD), עם בדיקות ב-`src/__tests__/revenue/`:
1. `scripts/verify.sh`: typecheck ואז vitest, כל שלב ללוג משלו, והפסק לפי קוד היציאה של כל runner ולא לפי grep.
   ואחר כך להעביר את `scripts/merge-worktree.sh` להריץ את החבילה פעם אחת דרכו, במקום פעמיים.
2. `scripts/pytest-product.sh <product>`: venv אחד לכל מוצר ולכל תוכן requirements, מחוץ לריפו. חייב להיכשל על skip
   בכל מקום שה-CI של המוצר נכשל עליו. להריץ אותו באמת על שני המוצרים.
3. `scripts/capture-check.mjs`: מסמן לקורא לכידות שאסור לקרוא כדפים שנקראו (`status`, `bot-challenge`, `js-shell`,
   `short`). צריך לעבוד על הלכידות האמיתיות, להריץ `--all`, ולהוסיף שורה אחת ל-`research/rendered/README.md`.

## 2. הפעולות המרכזיות שביצעתי
- **verify.sh:** קודם כתבתי 9 בדיקות, וראיתי אותן נכשלות כי הסקריפט עוד לא היה קיים. אחר כך כתבתי את הסקריפט:
  - `VERIFY_TYPECHECK_CMD` ו-`VERIFY_TEST_CMD` מחליפים את הפקודות;
  - הלוגים נכתבים ל-`VERIFY_OUT` (ברירת מחדל: `mktemp -d`);
  - שני השלבים רצים תמיד;
  - שורות "Test Files" ו-"Tests" מוצגות בלבד;
  - היציאה היא 1, עם "FAILED: typecheck (exit N), tests (exit M)".

  הבדיקה המרכזית משתמשת ב-stub שמדפיס "Tests 10 passed" ויוצא 1, ו-verify.sh חייב להיכשל עליו.
- **merge-worktree.sh:** שלוש השורות (typecheck, הרצה עם grep ו-`|| true` להצגה, והרצה שקטה בשביל הפסק) הוחלפו בקריאה אחת
  ל-`"$ROOT/scripts/verify.sh" src/__tests__/revenue`. ההתקנה, ה-push, הניקוי והטיפול בקונפליקט לא השתנו.
- **pytest-product.sh:** קודם כתבתי 17 בדיקות עם `python` מדומה (`PYTEST_PRODUCT_PYTHON`) ושורש ריפו מדומה
  (`PYTEST_PRODUCT_ROOT`). הן בודקות:
  - סירוב (exit 2);
  - hash יציב, שלא תלוי בנתיב ה-checkout;
  - venv חדש כשתוכן ה-requirements משתנה;
  - התקנה שנכשלה לא נחשבת venv מוכן;
  - קוד היציאה של pytest (0/1/4/5) עובר הלאה;
  - חוק ה-skip, כולל קריאת שני קובצי ה-workflow האמיתיים.
- **capture-check.mjs:** קודם כתבתי 50 בדיקות: מקרה סינתטי לכל סוג, 10 סמני bot manager, 7 סימני JavaScript, ולכידות
  אמיתיות מקובעות. אחר כך כתבתי `classifyCapture` ו-`readCapture` ואת ה-CLI (כולל `--all` ו-`--dir`).
- **הרצה אמיתית של המוצרים:**
  - chart-explainer: 155 passed, exit 0. בהרצה השנייה ה-venv נלקח מחדש ("reused"), 155 passed.
  - parent-guides (`-q -rs`, כמו ב-CI): 99 passed, 0 skipped, exit 0.
- **capture-check --all:** 465 לכידות. ok 305, status 66, js-shell 70, short 20, bot-challenge 4. היציאה 3. לא פעלתי על
  אף אחת מהן.
- הוספתי שלב 0 ל-README של `research/rendered/`: להריץ את capture-check על לכידות חדשות לפני הקריאה.

## 3. קבצים/מערכות ששונו
- חדש: `scripts/verify.sh`, `scripts/pytest-product.sh`, `scripts/capture-check.mjs`.
- חדש: `src/__tests__/revenue/verify-sh.test.ts`, `pytest-product.test.ts`, `capture-check.test.ts`.
- שונה: `scripts/merge-worktree.sh` (שלב 3 ותיאורו בכותרת), `research/rendered/README.md` (שורה אחת).
- מחוץ לריפו: `~/.cache/mehudak-pytest/chart-explainer-d11a58db618c`, `~/.cache/mehudak-pytest/parent-guides-a11eedc02b26`.

## 4. החלטות והנחות משמעותיות
- **capture-check, שתי דרגות של סמנים.**
  - סמן של bot manager, יחד עם מעט מדי טקסט, קובע `bot-challenge`. הסמנים: Cloudflare challenge-platform ו-"Just a
    moment...", Incapsula, PerimeterX, DataDome, Radware, Reblaze, AWS WAF, F5 TSPD, Akamai וניסוח של אתגר.
  - captcha (reCAPTCHA, hCaptcha, Turnstile) קובע `bot-challenge` רק בדף קצר שאין בו סימן לאפליקציה. בדף שהוא
    app shell ה-captcha נזכר ב-evidence בלבד.
  - הסיבה היא Facer: `facer-terms` ו-`facer-creator-partner` הם shell של AngularJS (`<div ui-view>` ריק) שטוען את
    reCAPTCHA v3 בדיוק כמו דואר ישראל. אילו reCAPTCHA לבדו היה מכריע, הקורא היה מסיק מ-D2(iv) "סירוב" על דף שאינו אתגר.
  - זו סטייה מודעת מהניסוח במשימה, שמנה את reCAPTCHA ו-hCaptcha בין הסמנים.
- **דואר ישראל, בכנות:**
  - ב-HTML יש שני דברים: ה-connector של Radware Bot Manager (ShieldSquare): `__uzdbm_*`, `stormcaster.js`,
    `validate.perfdrive.com`. ובנוסף `recaptcha/api.js?render=KEY`, כלומר reCAPTCHA v3.
  - שניהם יושבים על `index.html` של SPA, עם `<div id="root"></div>` ריק.
  - לפי הכלל, זה `bot-challenge`, וה-evidence מזכיר את שלושת הדברים.
  - הדף עצמו אינו דף captcha: זה shell שבוט-מנג'ר שומר עליו. אם זה סירוב או רק דף שצריך JavaScript, זו שאלה שהקורא
    מכריע, ובטיק 31 הוכרע ביד.
- **Trolley:** ה-CSP שלו מזכיר את `www.google.com/recaptcha/`. לכן תבנית ה-reCAPTCHA דורשת `api.js`/`enterprise.js` או
  class `g-recaptcha`, ולא מסתפקת בשם המארח. Trolley מסווג `js-shell` לפי `auraLoadingBox` של Salesforce.
- **"דף" הוא HTML או PDF.** לכידת JSON, טקסט או JS היא נתונים: `ok` עם "not a page; not text-checked". PDF בלי
  `textPath` הוא `short` ("no extracted text"). כך סומנו ארבעה PDF עם טקסט ידני לצידם (irs-us-israel-treaty,
  שלושת pcn874), וזה נכון: לממיר אין טקסט שלו עבורם.
- **ביטויים רגולריים בטוחים:** הערות ו-`<style>` מוסרים קודם בהחלפה גלובלית. "גוף של סקריפטים בלבד" נבדק בהסרה ולא
  בביטוי אחד עם חזרה על קבוצה, כדי להימנע מ-backtracking על דפים של 1.4MB.
- **pytest-product, מה מותקן:** כל `requirements*.txt` בקריאת pip אחת, כמו שהמשימה ביקשה. ב-parent-guides זו קבוצה
  רחבה ממה שה-CI מתקין (הוא מתקין רק `requirements-test.txt`), וזה מאט רק את ההתקנה הראשונה.
- **pytest-product, זיהוי חוק ה-skip:** הסקריפט קורא את `.github/workflows/<product>-ci.yml`. אם יש בו שורה שמתאימה ל-
  `grep.*skipped`, ריצה עם exit 0 שבלוג שלה מופיע `[0-9]+ skipped` (אותה תבנית כמו ב-CI) יוצאת 1. כך הסקריפט נשאר
  מסונכרן עם ה-CI בלי רשימה שנכתבה ביד.
- **venv "מוכן":** רק אחרי קובץ הסימון `.pytest-product-ready`, שנכתב בסוף התקנה מוצלחת. לא העברתי venv ממקום למקום
  (mv), כי venv נשען על נתיבים מוחלטים.
- **verify.sh מריץ את הבדיקות גם כש-typecheck נכשל.** זה עולה זמן בכשל, אבל מראה את שני הממצאים.

## 5. שגיאות וניסיונות שנכשלו
- מגבלת הבידוד של ה-worktree דחתה פקודות bash מורכבות: לולאה עם `python -c` על משתנה, `awk -v`, ו-`git` בשרשרת עם `cp`.
  פיצלתי אותן לפקודות פשוטות או העברתי אותן ל-node.
- בדיקה אחת ב-verify-sh חיפשה את המחרוזת `verify.sh src/...` בלי המירכאה שבקוד (`verify.sh" src/...`). תיקנתי אותה לחיפוש
  בביטוי רגולרי.
- בטיוטה הראשונה של capture-check, reCAPTCHA לבדו היה מסמן את facer-terms כ-`bot-challenge`. התגלה בסריקה של הלכידות
  האמיתיות לפני הקוד, ומכאן החלוקה לדרגות.

## 6. בדיקות ופעולות ולידציה
- ריצה סופית, דרך `scripts/verify.sh` (typecheck ואז `npx vitest run src/__tests__/revenue`):
  - typecheck: exit 0.
  - tests: exit 0. Test Files 55 passed, Tests 1586 passed | 1 skipped. ה-skip הוא ה-`skipIf` הקיים ב-
    `narration-licence-gate.test.ts:270`.
  - `pnpm typecheck` בנפרד: exit 0.
- בדיקות מוטציה, אחת לכל כלי. בכל אחת שברתי, ראיתי בדיקה נכשלת, ושחזרתי מעותק:
  - verify.sh: `|| tests=$?` הוחלף ב-`|| true`. 3 בדיקות נכשלו, ואחרי השחזור exit 0.
  - pytest-product.sh: זיהוי ה-skip הוחלף בתבנית שלא מתאימה לשום דבר. 2 נכשלו, ואחרי השחזור exit 0.
  - capture-check.mjs: סמן Radware בוטל. 4 נכשלו (כולל terms-israel-post), ואחרי השחזור exit 0.
- הרצות אמיתיות: chart-explainer 155 passed / exit 0, parent-guides 99 passed / exit 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- הרצת `capture-check.mjs` על הלכידות החדשות בכל טיק שקורא renders. אפשר להוסיף אותה כשלב ב-`render-watch.yml`, כהערה
  בסיכום בלבד ולא כשער, כי היא לא שופטת.
- ב-`short` יש שני דפי TikTok Creator Academy: `<!--$?--><template id="B:0">`, React streaming עם Suspense ממתין. אין להם
  סימן JavaScript שאני יודע לנסח בלי חשש מתוצאות שגויות. אם זה יחזור, כדאי להוסיף סימן.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- סריקת 465 הלכידות: שלוש הרצות של סקריפטי סריקה, והצגת גופי HTML של 15 דפים. זה היה הכרחי: בלי זה Facer ו-Trolley
  היו מסווגים לא נכון.
- פקודות bash שנדחו ע"י מגבלת הבידוד, וחזרו מפוצלות: כחמש.
- פלט ה-`--all` המלא (160 שורות מסומנות) הודפס פעם אחת כדי לבדוק את הסיווגים.
