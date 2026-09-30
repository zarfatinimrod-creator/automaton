# 30.9.2026 — טיק 33, כלים: verify.sh, pytest-product.sh, capture-check.mjs (בנייה, ביקורת ותיקון)

יומן אחד לכל המשימה: הבנייה (builder), שתי הביקורות, והתיקון (fixer). היומן המפורט של הבנייה עצמה נשאר
ב-`logs/2026-09-30-tick33-tooling.md`; כאן הסיכום שלו ועבודת התיקון.

## 1. מה המשתמש ביקש
- **הבנייה (builder):** ה-workflow של השרשור הראשי ביקש שלושה כלים קטנים, stdlib בלבד, בדיקות קודם:
  1. `scripts/verify.sh`: typecheck ואז vitest, כל שלב ללוג משלו, והפסק לפי קודי היציאה ולא לפי grep. ואחר כך
     להעביר את `scripts/merge-worktree.sh` להריץ את החבילה פעם אחת דרכו.
  2. `scripts/pytest-product.sh <product>`: venv אחד לכל מוצר ולכל תוכן requirements, מחוץ לריפו, שנכשל על skip
     בכל מקום שה-CI של המוצר נכשל.
  3. `scripts/capture-check.mjs`: מסמן לכידות שאסור לקרוא כדפים שנקראו (`status`, `bot-challenge`, `js-shell`, `short`).
- **התיקון (fixer, אני):** שני סוקרים מצאו 11 פגמים (6 בכלי קודי היציאה, 5 ב-capture-check). לתקן כל פגם שמחזיק,
  בדיקה קודם איפה שאפשר; לכל פגם שנדחה לתת סיבה; להריץ את החבילה ואת ה-typecheck דרך `scripts/verify.sh`; לבצע
  commit; לכתוב את היומן הזה.

## 2. הפעולות המרכזיות שביצעתי
**הבנייה (builder), בקצרה:** שלושת הכלים עם 9, 17 ו-50 בדיקות, כל אחת נכשלה לפני שהסקריפט נכתב. הרצה אמיתית:
chart-explainer 155 passed, parent-guides 99 passed. `capture-check --all` על 465 לכידות: ok 305, status 66,
js-shell 70, short 20, bot-challenge 4.

**התיקון, לפי הפגמים (כל אחד: בדיקה אדומה, תיקון, בדיקה ירוקה):**
- **קודי יציאה 1 — הענף שופט את עצמו.** `merge-worktree.sh` מריץ עכשיו את ה-`verify.sh` שהיה בענף הנוכחי *לפני*
  המיזוג. הוא מוצא את הקומיט הזה כך: הולך על שרשרת ה-first-parent מ-HEAD, ועוצר בקומיט הראשון שאינו מכיל את
  הענף. זה עובד גם בהרצה החוזרת אחרי קונפליקט ("already merged"). את הקובץ הוא שולף מ-git לקובץ זמני, ומריץ אותו
  עם `VERIFY_ROOT` על העץ הממוזג. רק במיזוג שמוסיף את verify.sh לראשונה אין שופט קודם: אז רץ העותק הממוזג, עם
  הודעה.
  - ב-`verify.sh` נוסף גם וטו: שלב בדיקות שיצא 0 נכשל בכל זאת אם שורת הסיכום שלו אומרת `failed`.
- **קודי יציאה 4 — שלב שלא רץ דווח כעובר.**
  - `merge-worktree.sh` קורא לשופט דרך `env -u VERIFY_TYPECHECK_CMD -u VERIFY_TEST_CMD -u VERIFY_OUT`.
  - `verify.sh` יוצא 2 על פקודה ריקה ולא מריץ כלום.
  - כל כותרת מדפיסה את הפקודה שרצה בפועל.
  - שלב בדיקות שיצא 0 בלי שורת `Tests` נכשל.
- **קודי יציאה 5 — לוגים שלא ניתן לכתוב.** לפני שמריצים משהו, `verify.sh` בודק שאפשר לכתוב את שני קובצי הלוג. אם
  לא: `verify: cannot write logs in ...`, ויציאה 2. לשורות התצוגה נוסף `|| true`.
- **קודי יציאה 6 — בדיקות של טקסט בלבד.** קובץ חדש, `merge-worktree.test.ts`, מריץ את הסקריפט באמת: remote חשוף,
  ענף ב-worktree, ו-`pnpm`/`npx` מדומים ב-PATH. 8 בדיקות:
  - כשל ב-typecheck או בבדיקות עוצר לפני push. ה-remote לא זז, והענף וה-worktree נשארים.
  - הצלחה עושה push ומנקה. install, typecheck ו-vitest רצים פעם אחת כל אחד, בסדר הזה.
  - ענף שמחליף את verify.sh ב-`echo passed; exit 0` נכשל, גם בהרצה החוזרת אחרי קונפליקט.
  - המיזוג הראשון של verify.sh מודיע שהעותק הממוזג שופט.
  - משתני `VERIFY_*_CMD` בסביבה לא מחליפים את הפקודות האמיתיות.
  - שתי בדיקות הטקסט הישנות ב-`verify-sh.test.ts` הוסרו, והבדיקה "no npx vitest / no grep||true" עברה לקובץ החדש.
- **קודי יציאה 2 — skip מוסתר.** `pytest-product.sh` מוסיף `--junitxml <out>/junit.xml` אחרי הארגומנטים של הקורא.
  - במוצר שה-CI שלו נכשל על skip, הסקריפט סופר את אלמנטי ה-`<skipped>` בקובץ, חוץ מ-`type="pytest.xfail"`.
  - ה-grep על הלוג נשאר, כווטו נוסף.
  - אם pytest יצא 0 ולא כתב junit.xml, מוצר כזה נכשל.
- **קודי יציאה 3 — שני venv בבנייה בו-זמנית.** הבדיקה של קובץ הסימון והבנייה רצות עכשיו תחת
  `flock` על `<venv>.lock`. ריצה שנייה ממתינה, ואז לוקחת את ה-venv המוכן ("reused").
- **capture 1 — מקור הטקסט.** `readCapture` קורא את `<slug>.txt`, כמו `readTermsCapture`, וה-evidence אומר של מי
  הטקסט:
  - של ה-fetcher;
  - גוף הלכידה עצמו (לכידת text/plain);
  - חילוץ ידני שיושב ליד ה-PDF.

  לכידות `text/plain` נבדקות עכשיו לפי אורך.
- **capture 2 — שתי דרגות.**
  - `CHALLENGE_PAGES` קובע `bot-challenge`: Cloudflare orchestrate או "Just a moment...", דף incident של Incapsula,
    captcha של PerimeterX או DataDome, `rbzns` עם גוף ריק, challenge-container של AWS, "Your support ID is" של F5,
    Akamai, וניסוח של אתגר.
  - `BOT_SENSORS` רק נזכרים ("also ..."), ואף פעם לא מכריעים.
  - דואר ישראל הוא עכשיו `js-shell`, עם Radware ו-reCAPTCHA ב-evidence.
- **capture 3 — ניסוח ה-status.**
  - "the server answered N": refused, not found, a server error, a redirect not followed, או not a final answer.
  - "no answer (the fetch failed, or was not sent)".
  - "an older capture's text is still on disk", כשהטקסט הזה קיים.
- **capture 4 — כיסוי מוטציות.** מקרה סינתטי לכל חלופה של כל סמן ולכל גבול של status. גם hCaptcha, Turnstile,
  300/302/399 ו-101/199 בלי error.
- **capture 5 — תוויות.**
  - `noscript` ו-page state (`__NEXT_DATA__` וכו') הם עכשיו סימנים חלשים. הם קובעים `js-shell` רק מתחת ל-`WEAK_SIGN_TEXT` = 250
    תווים.
  - נוספו שלושה סימנים חלשים: `<template id="B:n">` של React streaming, `id="splash-screen"`, ו-`data-sjs`.
  - PayPal עכשיו `short`, ושני דפי TikTok Creator Academy והריל של Instagram עכשיו `js-shell`.
- **`capture-check --all` אחרי התיקון:** 465 לכידות. ok 309, status 66, js-shell 72, short 15, bot-challenge 3, ויציאה 3. עשר
  לכידות שינו סוג:
  - מ-`short` ל-`ok`: irs-us-israel-treaty ושלושת pcn874.
  - מ-`bot-challenge` ל-`js-shell`: terms-israel-post.
  - מ-`js-shell` ל-`short`: שני דפי paypal-il.
  - מ-`short` ל-`js-shell`: שני דפי TikTok Creator Academy, owner-reel-2026-09-22.

## 3. קבצים/מערכות ששונו
- **הבנייה (commits `99df8d9`, `eb786cb`, `d53ed02`, `e2c731a`):**
  - חדשים: שלושת הסקריפטים ושלושת קובצי הבדיקה.
  - שונו: `merge-worktree.sh`, שורה אחת ב-`research/rendered/README.md`.
  - היומן `logs/2026-09-30-tick33-tooling.md`.
- **התיקון (commits `c2870b0`, `e810f1b`, `46bd2a8`, ועוד commit של היומן הזה):**
  - `scripts/verify.sh`, `scripts/merge-worktree.sh`, `scripts/pytest-product.sh`, `scripts/capture-check.mjs`.
  - `src/__tests__/revenue/verify-sh.test.ts`, `pytest-product.test.ts`, `capture-check.test.ts`.
  - קובץ חדש: `src/__tests__/revenue/merge-worktree.test.ts`.
  - `logs/2026-09-30-tooling-verify-pytest-capture.md`.
- **מחוץ לריפו:** נוצרו קובצי `.lock` ליד ה-venv-ים ב-`~/.cache/mehudak-pytest/`. בנוסף נבנה venv צעצוע בתיקיית ה-scratch
  שלי (`tick33-fixer/venvs`).
- **לא נגעתי:** `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`,
  `terms-verdicts.json`, `urls.txt`, ולא בתיקיות ה-scratch של הסוקרים. לא עשיתי push.

## 4. החלטות והנחות משמעותיות
- **איך מוצאים את השופט שלפני המיזוג.** הסוקר הציע `HEAD^1` בהרצה החוזרת. בחרתי בהליכה על ה-first-parent עד
  הקומיט הראשון שאינו מכיל את הענף. זה נותן את אותה תשובה במסלול הרגיל. אבל זה נכון גם כשאחרי המיזוג נוסף קומיט
  (למשל תיקון אחרי בדיקה שנכשלה), ושם `HEAD^1` כבר מכיל את ה-verify.sh של הענף.
- **מיזוג ה-bootstrap.** בראש ה-main (`51524d5`) אין `scripts/verify.sh`. לכן במיזוג של הענף הזה עצמו רץ
  `merge-worktree.sh` הישן, שמריץ typecheck ובדיקות בעצמו, ואין בעיה. רק אם יהיה קונפליקט, ההרצה החוזרת תריץ את
  הסקריפט החדש, בלי שופט קודם. במקרה הזה רץ העותק הממוזג, עם הודעה מפורשת. זה קורה פעם אחת.
- **grep רק מטיל וטו.** מעבר מוצלח בא רק מקודי היציאה. אבל שלב בדיקות שיצא 0 נכשל אם שורת הסיכום אומרת `failed`,
  או אם אין שורת `Tests`. כך verify.sh שבור (`|| true`) עדיין נכשל על קובץ הבדיקות שבודק אותו.
- **skip לפי JUnit, בלי xfail.** בדקתי על pytest 9.1.1 אמיתי:
  - skip רגיל נרשם כ-`<skipped type="pytest.skip">`.
  - skip באיסוף (`importorskip` ברמת המודול) נרשם כ-`<skipped message="collection skipped">`, בלי type.
  - xfail נרשם כ-`<skipped type="pytest.xfail">`, ומודפס בטרמינל "xfailed", כך שה-grep של ה-CI לא סופר אותו.

  לכן סופרים כל `<skipped` חוץ מ-xfail.
- **flock חובה.** בלי `flock` הסקריפט יוצא 2. אין כאן macOS, ו-flock נמצא ב-`/usr/bin/flock` ובמכונות של GitHub.
  בניית venv בתיקייה זמנית ואז `mv` לא נבחרה, כי venv נשען על נתיבים מוחלטים.
- **חיישן פסיבי אף פעם לא מכריע, בניגוד ל-captcha.** הסוקר כתב "כמו captchas". captcha בדף קצר בלי סימן לאפליקציה
  עדיין קובע `bot-challenge`, כי זה כמעט תמיד דף captcha. חיישן פסיבי, לעומת זאת, יושב גם בדפים קצרים רגילים. לכן
  בדף כזה התוצאה היא `short`, והחיישן נזכר ב-evidence.
- **הסימנים החדשים הם חלשים.** `<template id="B:n">` מופיע גם ב-7 דפים ארוכים שסווגו `ok`. לכן הוא, ה-splash
  screen ו-`data-sjs` קובעים `js-shell` רק מתחת ל-250 תווים.
  - הסף 250 נבחר מהנתונים. ה-shell-ים עם סימן חלש בלבד מחזיקים עד 193 תווים (YouTube; ה-Notion של n8n מחזיק 95).
    דפי PayPal שמרונדרים בשרת מחזיקים 546 ו-726.
  - captcha בדף שיש בו סימן חלש כלשהו אינו נחשב דף captcha.
- **קיבוע לכידות אמיתיות.** קיבעתי רק את `irs-us-israel-treaty`, כי הסוקר ביקש, ואת דואר ישראל, שקיבוע שלו תוקן.
  את שאר המקרים (PayPal, TikTok, Instagram, vrp-faq) בדקתי במקרים סינתטיים, כי render-watch עלול לשנות לכידה
  אמיתית ולשבור את החבילה.
- **פגמים שנדחו:** אף אחד. כל 11 הפגמים החזיקו ותוקנו. הסטיות מההצעה המדויקת של הסוקרים הן רק אלה שמפורטות בסעיף
  הזה: first-parent במקום `HEAD^1`, flock שהוא חובה, חיישן פסיבי שאף פעם לא מכריע, וסימנים חדשים חלשים.
- ה-README של `research/rendered/` (שלב 2: "never fetched" על 403) לא שונה. זה ניסוח קודם ב-README, ולא אחד
  הפגמים.

## 5. שגיאות וניסיונות שנכשלו
- **תיקון בדיקות capture-check בסקריפט Python:** נכשל על מרכאות (`\'` בתוך heredoc), והקובץ לא השתנה. כתבתי את
  קובץ הבדיקות מחדש, במלואו.
- **את capture-check כתבתי לפני הבדיקות שלו.** כדי להראות "אדום לפני ירוק", הרצתי את הבדיקות החדשות על גרסת
  ה-builder מ-git: 60 נכשלו, 38 עברו. על הגרסה שלי: 98 עברו.
- **מוטציות ששרדו בסבב הראשון:** 2 מתוך 91. גבול ה-4xx (`>= 400` הוחלף ב-`>= 401`) וגבול ה-3xx (`>= 300` הוחלף
  ב-`>= 301`). הוספתי מקרי 400 ו-300, ובסבב השני כל 91 המוטציות נהרגו.
- **בדיקות הטקסט של builder על merge-worktree:** בדיקה אחת נכשלה אחרי השינוי, כי חיפשה את
  `scripts/verify.sh" src/__tests__/revenue`. החלפתי אותה בבדיקות התנהגות.

## 6. בדיקות ופעולות ולידציה
- **ריצה סופית דרך `scripts/verify.sh src/__tests__/revenue`:**
  - `verify.sh`: exit 0.
  - typecheck (`pnpm -s typecheck`): exit 0.
  - tests: exit 0. `Test Files 56 passed (56)`, `Tests 1654 passed | 1 skipped (1655)`. ה-skip הוא ה-`skipIf` הקיים
    ב-`narration-licence-gate.test.ts:270`.
- **אדום לפני ירוק:**
  - verify-sh: 6 בדיקות חדשות נכשלו, ואז 15/15 עברו (אחרי הסרת שתי בדיקות הטקסט: 13).
  - merge-worktree: 4 מתוך 7 נכשלו, ואז 8/8 עברו.
  - pytest-product: 9 מתוך 23 נכשלו, ואז 23/23 עברו.
  - capture-check: על גרסת ה-builder 60 מתוך 98 נכשלו, ועל הגרסה שלי 100/100 עברו, כולל מקרי 400 ו-300.
- **מוטציות (בכל אחת: שבירה, ראיתי כשל, שחזור מגיבוי ובדיקה ב-`cmp`):**
  - **verify.sh, הדוגמה של הסוקר (`|| tests=$?` הוחלף ב-`|| true`):** verify.sh עצמו רץ על `verify-sh.test.ts`,
    יצא 1, והדפיס `FAILED: tests (exit 0, but the summary says failed)`. לפני התיקון, אותה הרצה עברה.
  - **merge-worktree.sh:**
    - `|| true` אחרי השופט: 6 מתוך 8 נכשלו.
    - הרצת ה-verify.sh של הענף במקום השופט: 2 נכשלו.
    - הסרת `env -u`: 1 נכשלה.
  - **pytest-product.sh:**
    - התעלמות מה-junit: 3 נכשלו.
    - ביטול ה-lock: 1 נכשלה.
    - `--junitxml` לפני ארגומנטי הקורא: 4 נכשלו.
    - ספירת xfail כ-skip: 1 נכשלה.
  - **capture-check.mjs:** 91 מוטציות. הרתמה עובדה מזו של הסוקר, ורצה על עותק ב-scratch שלי. כולן נהרגו.
- **pytest אמיתי (9.1.1):** מוצר צעצוע עם skip, skip באיסוף ו-xfail, ועותק של `parent-guides-ci.yml`.
  - עם `-q -rs`, בלי דגלים, `-qq`, `-qq -rs`, `-p no:terminal` ו-`--no-summary -q`: כל אחת מההרצות יצאה 1, עם
    "2 test(s) skipped".
  - עם xfail בלבד: exit 0.
  - המוצרים האמיתיים: parent-guides (`-q -rs`) 99 passed, exit 0. chart-explainer 155 passed, exit 0. שניהם לקחו
    את ה-venv הקיים (reused).
- **`capture-check --all`:** exit 3, עם הספירות שבסעיף 2. השוויתי את הרשימה לפני ואחרי, ועברתי על ה-evidence של
  כל לכידה שסוגה השתנה.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **רתמת המוטציות של capture-check** (`tick33-fixer/mutate.mjs`): אותה רתמה נכתבה פעמיים, אצל הסוקר ואצלי. כדאי
  להפוך אותה לסקריפט בריפו (`scripts/mutate-lists.mjs`) שמקבל קובץ מקור וקובץ בדיקות. היא שוברת כל חלופה ברשימות
  `["name", /regex/]`, מריצה vitest ומדפיסה מי שרד. כך כל כלי מבוסס רשימות יקבל את זה חינם.
- **מוטציות ידניות לסקריפטי bash** (שבירה עם sed, הרצה, שחזור מגיבוי): חזרו כאן 9 פעמים. אפשר לעשות מזה עוזר קטן
  שמקבל קובץ, זוג "מ/אל" וקובץ בדיקות, ומשחזר תמיד ב-trap.
- **`capture-check` כשלב ב-`render-watch.yml`,** כהערה בסיכום בלבד ולא כשער. ה-builder כבר הציע את זה.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- **קריאת החומר:** הסקריפטים והבדיקות של ה-builder, ה-README וחלק מ-`queue-zero-test.mjs`. זה היה הכרחי. הדוח של
  הסוקרים כבר היה מפורט, אז לא חזרתי על הניסויים שלהם, מלבד ה-pytest האמיתי.
- **סריקת הלכידות:** סריקה ל-evidence, לסמנים לפי חלופה, ולסטטוסים. בערך שישה פלטים ארוכים, שהגדול בהם הוא
  רשימת 70 ה-js-shell במלואה. אפשר היה לסנן אותה מראש לדפים עם סימן חלש בלבד.
- **רשימת קבצים של כל ה-scratchpad המשותף** (כ-900 שורות), כשחיפשתי את הרתמה של הסוקר. הייתי צריך `ls` על
  התיקייה שלו בלבד.
- **ניסיון התיקון בסקריפט Python שנכשל על מרכאות:** כתיבה אחת מבוזבזת של כל הבלוק.
- **הרצות vitest של merge-worktree ו-pytest-product:** כ-15 הרצות קצרות, בזמן התיקונים ובזמן המוטציות.
