# טיק 54 — osek-zair: שנת המס 2026 חוזרת ל-`pendingYears`, וכל ציטוט של nevo יוצא מהמוצר (פסיקה 6.10, שורה 21 (a), קיפולים 3 ו-4)

ענף: `build/tick54-osek-zair-2026`, ב-worktree נפרד, מבוסס על `612eb5f` (`claude/new-session-j071dx` כשה-worktree נוצר).
הקומיט של הבנייה: `1b88919`. הלוג הזה נכנס בקומיט נפרד.

## 1. מה המשתמש ביקש

ה-thread הראשי (Opus, טיק 54) ביקש לבצע את קיפולים 3 ו-4 של `research/channel-loop/RULING-2026-10-06-robots-and-terms.md`
בדיוק כפי שהם כתובים, ב-worktree ועל ענף:

- **קיפול 3:** מ-`products/il-biz-tools/src/config/osek-zair.json` להסיר את `documents.vatLaw` ואת כל ציטוט ה-vatLaw
  (`facts.cap`, `facts.cap2026`, `facts.vatSense`); להעביר את 2026 מ-`years` ל-`pendingYears` במבנה שלפני 29.9, עם משפט
  ההצמדה שמקורו בגזט בלבד; לשכתב את `about`; להשאיר את `check.vatLaw` עם המשפט האחד שהחלטה 1(5) מוסיפה.
  ב-`osek-zair-unverified.json` מחזירים את תקרת 2026 (122,833) עם הדירוג "nevo capture [robots-bar] (ruling 6.10 row 21
  (a)); not a product input" ועם ה-`toVerify` הקיים. מ-`osek-patur.json` מוחקים את המשפט שמתחיל ב-"Beside Kol Zchut:"
  ועד סופו, ולא נוגעים בשום דבר אחר.
- **קיפול 4:** `osek-zair.html`, `README.md`, `tests/osek-zair.test.js` ו-`tests/osek-zair-page.test.js` עוקבים אחרי
  הקונפיג: 2026 ממתינה, אין 122,833 ואין nevo. את `facts.vatSense` מצטטים מחדש לקטע `lawsofisrael` מוצמד תחת
  `research/channel-loop/law/` רק אם קטע כזה כבר קיים, ואחרת משמיטים. מוסיפים בדיקות שנועלות את המצב החדש.
  `statutory-sources.test.js` לא משתנה וחייב לעבור.
- לוודא כל שלב לפי קוד היציאה: כל חבילת הבדיקות של המוצר, `scripts/verify.sh`, `node scripts/freeze-capture.mjs --cited`
  ו-grep השמות. לכתוב את הלוג הזה ולעשות לו commit.

## 2. הפעולות המרכזיות שביצעתי

1. יצרתי את ה-worktree ובדקתי את הבסיס: `612eb5f`, ו-`products/` ו-`src/revenue/` קיימים. קישרתי את `node_modules` של
   השורש ושל המוצר. ה-baseline של `npx vitest run tests/osek-zair.test.js` יצא בקוד 0, עם 33 בדיקות.
2. קראתי בפסיקה את §1 (שורות 1-161), את ה-Folds ואת "Not decided" (שורות 375-432).
3. מצאתי את המבנה שלפני 29.9: `git log` על הקונפיג הראה ששני הקומיטים שהכניסו את 2026 הם `b6e1d64` ו-`55706ca`.
   המבנה הקודם הוא `271872f`, שהוא `b6e1d64~1`. השוויתי מולו כל קובץ שהקיפולים נוגעים בו.
4. **קונפיג** (סקריפט Python שמחליף מחרוזת מדויקת אחת וכותב רק כשיש בדיוק התאמה אחת):
   - `osek-zair.json`: הסרתי את `documents.vatLaw` ואת `"vatLaw"` מ-`sourceLine`. הסרתי את ציטוט ה-vatLaw מ-`facts.cap`,
     והטקסט חזר להיות "120,000 ₪ בשנות המס 2024 ו-2025.". הסרתי את `facts.cap2026` כולו ואת `facts.vatSense` כולו.
     `facts.turnover` חזר לנוסח שלפני 29.9 ("את ההגדרה בחוק מס ערך מוסף עצמו לא קראנו"). את `years` צמצמתי ל-2024 ו-2025.
     ב-`pendingYears.2026` יש עכשיו `he`, `unverifiedValueIn` ו-`cite`. שכתבתי את `about`, ולסוף ההערה של
     `check.vatLaw` הוספתי משפט אחד.
   - `osek-zair-unverified.json`: `years.2026` הוא `cap: 122833`, עם ה-`grade` של הפסיקה ועם `toVerify`. ה-`about` רושם
     שהחריג בוטל. ב-`vatLawSense` תיקנתי שלושה משפטים שהפכו ללא נכונים (סעיף 4 למטה).
   - `osek-patur.json`: מחקתי את המשפט מ-"Beside Kol Zchut:" ועד סופו. ההערה זהה עכשיו בייט-בייט לנוסח שלפני 29.9.
5. **הדף:** בניתי את `osek-zair.html` מחדש מהגרסה שלפני 29.9 (`git show b6e1d64~1:…`), עם שני תיקונים: משפט ה-pending
   החדש (בשלושה מקומות: JSON-LD, הפסקה בסעיף "המסלול לפי החוק" ותשובת השאלות הנפוצות), ותשובת "האם עוסק זעיר…" בלי
   המשפט המשני הישן ועם משפט הסיום מ-`55706ca`. התוצאה: 2026 מוצעת כ-"2026 – הכלי לא מחשב", ובדף אין 122,833, אין
   קישור ל-nevo ואין "נבו".
6. **README:** החזרתי לנוסח שלפני 29.9 את שורת הטבלה של הכלי, את שורת התקרה ל-2026 (שורה 68, עכשיו בלי nevo ועם הפניה
   לפסיקה), את שורת `osek-zair-unverified.json`, ואת הפסקאות "What it answers", "What it refuses", שורת המקור וסעיף השם.
7. **הערות קוד:** תיקנתי הערות שהפכו לשגויות. ב-`src/lib/osek-zair.js` הכותרת חזרה ל-"a primary text", וההערה של
   `citeHe` כבר לא מזכירה את חוק המע"מ. ב-`src/lib/publish-gate.js` תיקנתי שתי הערות. ב-`scripts/freeze-capture.mjs`
   וב-`src/__tests__/revenue/freeze-capture.test.ts` היה כתוב שבדיקת הדף "מצמידה" את צורת העותק הקפוא של nevo, וזה כבר
   לא נכון.
8. **בדיקות:** החזרתי לנוסח שלפני 29.9 את בדיקות ה-2026 בשני הקבצים, והוספתי בדיקות נעילה (סעיף 6).
9. הרצתי בדיקות מוטציה על הנעילות, ואת כל שלבי האימות.

## 3. קבצים/מערכות ששונו

- `products/il-biz-tools/src/config/osek-zair.json`
- `products/il-biz-tools/src/config/osek-zair-unverified.json`
- `products/il-biz-tools/src/config/osek-patur.json` (משפט אחד נמחק)
- `products/il-biz-tools/osek-zair.html`
- `products/il-biz-tools/README.md`
- `products/il-biz-tools/src/lib/osek-zair.js` (הערות בלבד)
- `products/il-biz-tools/src/lib/publish-gate.js` (הערות בלבד)
- `products/il-biz-tools/tests/osek-zair.test.js`
- `products/il-biz-tools/tests/osek-zair-page.test.js`
- `scripts/freeze-capture.mjs` (הערה בלבד)
- `src/__tests__/revenue/freeze-capture.test.ts` (הערה בלבד)
- `logs/2026-10-06-channel-loop-tick-54-osek-zair-2026.md` (הקובץ הזה)

לא שיניתי: `statutory-sources.test.js`, `index.html`, `osek-patur.html`, אף קובץ פסיקה, אף לכידה, `urls.txt`,
`terms-verdicts.json`, `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md` ו-`logs/FABLE_QUEUE.md`.

## 4. החלטות והנחות משמעותיות

1. **את `facts.vatSense` השמטתי ולא ציטטתי מחדש.** התיקייה `research/channel-loop/law/` לא קיימת, ובריפו אין קטע מוצמד
   של `lawsofisrael`. הקובץ היחיד ששמו מכיל "excerpt" הוא fixture של `loop-edit`. ההערה
   `research/measurements/osek-patur-documents.md:61-62` מצטטת את המראה ברמת github, אבל ציטוט בתוך הערה אינו קטע
   מוצמד במבנה של PostHog כפי שהפסיקה דורשת. לפי ההוראה ("ONLY if such an excerpt already exists… else dropped") ולפי
   החלטה 1(5) ("otherwise it is dropped with the year") — הושמט.
2. **"no nevo string" מול `check.vatLaw`.** המשימה מבקשת בדיקה שבקונפיג אין המחרוזת "nevo", אבל הפסיקה (ועוד באותה
   משימה) מורה להשאיר את `check.vatLaw` כהיסטוריה, וההערה שלו מזכירה את nevo וגם את 122,833. הפסיקה גוברת. הבדיקה
   מוודאת שאין "nevo", "נבו" או 122,833 **מחוץ ל-`check.vatLaw`**, ושההערה שלו מסתיימת במשפט של 1(5). זה סטייה מהנוסח
   המילולי של המשימה, והיא מדווחת.
3. **המקורות של `pendingYears.2026`:** גזט עמ' 173 סעיף 37(ב), גזט סעיף 87ז(ב), ושורה 11 בדוח רשות המסים. שורה 11 רק
   מזכירה את שם החוק: הבדיקה הקיימת "a cite that names the Economic Efficiency Law comes with a text capture that names
   it" דורשת אותה, כי בעמודי הגזט (שהם תמונה) שם החוק לא מופיע. את שורות הדוח 34-35 ("משנת 2026 תוצמד…") לא החזרתי,
   כי הפסיקה קובעת "sourced to the gazette alone". שני המשפטים נשענים על הגזט בלבד.
4. **נוסח ה-pending:** "לשנת המס 2026 הכלי לא מחשב. הסכום שבהגדרת "עוסק פטור" מותאם למדד לראשונה ב-1 בינואר 2026,
   והכלי יחשב לשנת המס 2026 אחרי שנקרא מקור ראשוני שמציין את הסכום המעודכן. שר האוצר רשאי גם לשנות בצו את שיעור הניכוי
   (סעיף 87ז(ב) לפקודה); צו כזה לא קראנו."
   - לא החזרתי את המשפט הישן "והסכום המעודכן לא מופיע באף אחד מהמסמכים שקראנו". הוא כבר לא נכון: הסכום הופיע בלכידה
     שקראנו, והיא חסומה.
   - את 126(א) לא ציטטתי. את הטקסט שלו קראנו רק אצל nevo, והגזט מזכיר רק "סעיף 126".
   - "צו כזה לא קראנו" הוא הנוסח מביקורת 29.9.
5. **`toVerify` של 2026:** רשימת המקורות הועתקה מילה במילה מ-`:93` (הודעה ברשומות, דף gov.il של רשות המסים, חוזר של
   רשות המסים). את המכניקה ("cite … in facts.cap and facts.cap2026 beside the nevo cite … delete grade and toVerify here")
   החלפתי במכניקה שלפני 29.9: להעביר ל-`years` ולהסיר מ-`pendingYears` ומהקובץ. הסיבה: `facts.cap2026` ו"ציטוט nevo"
   כבר לא קיימים. הוספתי גם את סייג ויקיטקסט מהסוגריים של הפסיקה. זו פרשנות של "the existing toVerify", והיא מדווחת.
6. **`vatLawSense` בקובץ ה-unverified:** ה-`why` אמר "The page now says that… (facts.vatSense)", וה-`toVerify` אמר "the
   page states what it shows". שני המשפטים הפכו לשקריים, ותיקנתי אותם. ל-`grade` הוספתי את הסימון `[robots-bar]`. האזכור
   של לכידת nevo כסיבה **לא** לצטט את 31(3) נשאר: זה שימוש מותר לפי D1(1)(ii), החלטה לא לעשות דבר.
7. **`facts.cap2026` נמחק כולו.** החלק שלו שלא תלוי ב-nevo (ההצמדה מ-1.1.2026 וצו השיעור) עבר ל-`pendingYears.2026`. החלק
   "ושר האוצר רשאי לקבוע סכום גבוה יותר" הגיע מהגדרת nevo בלבד, ולכן יצא.
8. **תשובת "האם עוסק זעיר הוא אותו דבר?":** המשפט המשני שלפני 29.9 ("הוא גם מונח בחקיקת המע״מ") לא חוזר. הטקסט של החוק,
   בכל מקום שנקרא, מראה שההגדרה נמחקה. משפט הסיום מ-`55706ca` נשאר.
9. `index.html` לא השתנה. ה-lead שלו ("…שאומרת בדף שלה לאילו שנות מס היא מחשבת") נכון גם עכשיו.
10. ה-122,833 של `osek-patur.html` לא נגעתי: "Not decided" 1, ומחוץ לשורה הזאת.

## 5. שגיאות וניסיונות שנכשלו

- בגרסה הראשונה של `pendingYears.2026` היו רק ציטוטי גזט. כשקראתי את בדיקת הדף ראיתי שהשרשרת "Economic Efficiency Law"
  תיכשל, ולכן הוספתי את שורת הדוח 11 ובניתי את הדף מחדש. בדיקת היחידה עודכנה בהתאם.
- כתבתי שורת regex מוסלשת דרך שכבות escape של Python ו-JS. החלפתי אותה ב-`endsWith`, שעושה אותו דבר ופשוט יותר.
- `mutate.mjs --check` סירב לרוץ על קובץ שיש בו שינויים שלא נכנסו לקומיט, כצפוי. הרצתי שוב אחרי הקומיט: 23 מתוך 23 ok.
- **`scripts/verify.sh` יצא בקוד 1:** typecheck עבר (0), וב-vitest על `src/__tests__/revenue` נכשלו 2 מתוך 2566 בדיקות,
  שתיהן ב-`frozen-citations.test.ts`. 10 השורות הנכשלות כולן ב-`research/channel-loop/RULING-2026-10-06-robots-and-terms.md`
  עצמו: הפסיקה מצטטת לפי שורה את `robots-nevo.txt` ואת `terms-kaggle`, ושתיהן לכידות פעילות. הרצתי את אותה בדיקה
  ב-`sim-tree` על `612eb5f` (הבסיס, לפני כל שינוי שלי): אותו קוד יציאה ורשימת כשלים זהה (`diff` ריק).
- **`node scripts/freeze-capture.mjs --cited` יצא בקוד 1** מאותה סיבה: "2 citation(s) by line of an active capture in 1
  decision-bearing file(s): RULING-2026-10-06-robots-and-terms.md". אותו פלט בדיוק על `612eb5f` ועל קצה הענף `6a0239d`.
  התיקון (`--apply`, שמפנה את הציטוטים ל-`robots-nevo-2026-09-30`) עורך קובץ פסיקה, ואסור לי לגעת בו. זה נשאר ל-thread
  הראשי.

## 6. בדיקות ופעולות ולידציה

| בדיקה | קוד יציאה | פרטים |
|---|---|---|
| baseline `tests/osek-zair.test.js` (לפני שינוי) | 0 | 33 בדיקות |
| `tests/osek-zair.test.js` + `tests/osek-zair-page.test.js` | 0 | 108 בדיקות (35 + 73) |
| כל חבילת המוצר `npx vitest run` ב-`products/il-biz-tools` (אחרי הקומיט) | 0 | 32 קבצים, 885 בדיקות |
| `tests/statutory-sources.test.js` (הקובץ לא שונה) | 0 | 19 בדיקות |
| `node scripts/check-html.js` | 0 | all pages ok |
| מוטציות על הנעילות (`mutate.mjs --plan`, תוכנית בתיקיית scratch) | 0 | 7 מתוך 7 נהרגו (ראו למטה) |
| `mutate.mjs --check` על `mutations/freeze-capture.json` | 0 | 23 מתוך 23 עדיין מתאימות אחרי שינוי ההערה |
| `scripts/verify.sh` | 1 | typecheck 0; בדיקות: 2 נכשלו, קיימות כבר בבסיס `612eb5f` (סעיף 5) |
| `node scripts/freeze-capture.mjs --cited` | 1 | אותו דיווח בדיוק בבסיס ובקצה הענף; לא נגרם מהשינוי |
| grep שמות/כתובות על הקבצים שהשתנו | 1 (לא נמצא כלום) | |

הבדיקות החדשות (בדיקות נעילה):
- בקונפיג אין מסמך `vatLaw`, אף ציטוט לא מפנה ל-`vatLaw`, ו-`sourceLine` הוא `['gazette', 'report']`. אין
  `facts.cap2026` ואין `facts.vatSense`.
- מחוץ ל-`check.vatLaw` אין בקונפיג "nevo", "נבו" או 122,833. ההערה של `check.vatLaw` מסתיימת במשפט של 1(5).
- 2026 נמצאת ב-`pendingYears` ולא ב-`years`, וכל המשפטים שלה נשענים על הגזט. `defaultYear` הוא 2025.
- בקובץ ה-unverified נמצאת התקרה של 2026 עם ה-`grade` של הפסיקה ועם המקורות הראשוניים שעוד חייבים.
- הדף, ה-head וה-JSON-LD לא מציגים 122,833 או 122833, ואין בהם nevo, "נבו" או "נוסח משולב".
- בסקריפט, במודול ובקונפיג (מחוץ ל-`check.vatLaw`) שעולים לאתר אין 122,833.
- ההערה של `osek-patur.json` כבר לא נשענת על הלכידה.
- 2026 נדחית במודול, ב-`resultHe` ובדף (בדיקה מול stub DOM).

המוטציות, שכולן נהרגו: L1 — ה-lead מציג שוב 122,833; L2 — קישור nevo בשורת המקור; L3 — "nevo" ב-`about`; L4 —
`[robots-bar]` יורד מה-grade; L5 — "Beside Kol Zchut" חוזר ל-`osek-patur.json`; L6 — המשפט של 1(5) יורד; L7 — 122,833
ב-`facts.cap`.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **ביטול בנייה קודמת "למבנה שלפני X".** השוויתי ידנית את `b6e1d64` ו-`55706ca` מול `b6e1d64~1` בכל קובץ. נקודת התחלה
  טובה יותר: `git show <commit>~1:<path>` לקבצים שרק הבנייה ההיא שינתה (כאן הדף והקונפיגים), ואחר כך תיקונים ממוקדים.
  כך בניתי את הדף, וכדאי לרשום את זה כנוהל לקיפולים שמבטלים בנייה.
- **מוטציות לבדיקות של מוצר.** תוכניות המוטציה חיות ב-`src/__tests__/revenue/mutations/` ומיועדות לסקריפטים של השורש.
  למוצר `il-biz-tools` אין להן בית, ולכן כתבתי תוכנית בתיקיית scratch, והיא עבדה עם `--cmd "npx vitest run --root
  products/il-biz-tools"`. כדאי לתת בית (למשל `products/il-biz-tools/tests/mutations/`) ולהרחיב אליו את
  `mutation-plans.test.ts`.
- **החלפה מדויקת בקבצי מוצר.** `loop-edit.mjs` מטפל רק בקבצי לולאה. לקבצי מוצר כתבתי שוב סקריפט Python של "החלפה עם
  התאמה אחת בדיוק". כלי `exact-replace` כללי היה חוסך את זה.
- **`freeze-capture --cited` ו-`frozen-citations.test.ts` אדומים בכל קיפול** כל עוד הפסיקה של 6.10 מצטטת לכידות פעילות
  לפי שורה. ה-thread הראשי צריך להריץ פעם אחת `--apply`, או שהפסיקות צריכות להיכתב מראש מול עותקים קפואים.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת הקונפיג המלא (41KB) והדיפים הארוכים של `b6e1d64` עד `55706ca` (פעמיים, כי הפלט נשמר לקובץ ונקרא שוב). זה היה
  נחוץ, אבל אפשר היה להתחיל ישר מ-`git show b6e1d64~1:<path>` ולקרוא רק את ה-hunks של 2026.
- תזכורות רשימת המשימות (של ה-thread הראשי) שחזרו בהקשר שוב ושוב: לא שלי, ולא השפיעו על העבודה.
- זוג "placeholder" מת בסקריפט העריכה של בדיקת היחידה (נוצר ונמחק מיד) ושורת regex שנכתבה ואז הוחלפה.
- שתי הרצות `sim-tree` (על הבסיס ועל קצה הענף) של `freeze-capture --cited`, ועוד אחת של `frozen-citations.test.ts`.
  הן היו נחוצות כדי להוכיח שהכשל קיים בלי קשר לשינוי.

## Review fixes

הסוקר (סקירת Opus של הענף) מצא שני ממצאים בדרגת "fix" ואף לא אחד בדרגת "blocking". שניהם תוקנו בקומיט `b3a5e32`. לפני
התיקונים מוזג קצה הבסיס `claude/new-session-j071dx` (`227b3cb`, שכבר כולל את `87bf2bd`) לתוך הענף, בקומיט המיזוג `82171da`.
המיזוג עבר בלי קונפליקט. הוא נדרש כי `verify.sh` ו-`freeze-capture --cited` נכשלו על קצה הענף בכשל שירש מ-`612eb5f`, והבסיס
כבר תיקן אותו.

1. **fix — `vatLawSense` ב-`osek-zair-unverified.json` אמר דבר שקרי והפנה ללכידה `[robots-bar]`.**
   - הבעיה: ה-`why` אמר שתקנות מע"מ (רישום) "have not been rendered here". בפועל הן רונדרו ב-29.9 ב-13:02:22Z
     (`nevo-vat-registration-regs`), והלכידה הזו סומנה `[robots-bar]` בהחלטה 1(2). ה-`toVerify` שלח את העובד הבא לקרוא
     15א(ג) "when" הסלאג הזה ירונדר.
   - התיקון ב-`why`: הוא אומר עכשיו שהתקנות רונדרו, ושאין רישום של קריאת 15א(ג) בלכידה. הוא אומר גם שהלכידה סומנה
     `[robots-bar]` ולכן לא יכולה להכריע ברשומה.
   - התיקון ב-`toVerify`: לעולם לא להכריע מהלכידה של 29.9. מחכים לטקסט מותר: עותק נעוץ במאגר מאתר שהתנאים וה-robots.txt
     שלו מתירים את הרץ. דוגמה לכזה היא המראה של lawsofisrael ב-GitHub, שמחזיקה את התקנות בנוסח מאוחד עד 2016 (MREG,
     `osek-patur-documents.md:1213`). הדרך האחרת היא אחזור חדש מ-nevo, רק כשתנאי ה-REOPEN IF של הפסיקה מתקיים.
   - אותו נוסח "תקנה שלא רונדרה" תוקן גם ב-`README.md` (שורת הקובץ הלא-מאומת, ופסקת השם בסוף הסעיף) ובהערה של
     `publish-gate.js`. ב-README לא נשאר שם הסלאג.
   - הבדיקה ב-`osek-zair-page.test.js` שנעלה את הסלאג (`toContain('nevo-vat-registration-regs')`) הוחלפה במבחן חדש.
     המבחן קורא את ה-meta של הלכידה, ובודק שה-`why` נוקב בה ובשעת האחזור שלה. הוא בודק גם שה-`toVerify` אוסר להכריע ממנה,
     ושהוא מחכה לטקסט מותר או ל-REOPEN IF.

2. **fix — "gazette alone" סתר את הקונפיג.**
   - הבעיה: ה-README, ה-`about` של הקונפיג וכותרת מבחן ב-`osek-zair.test.js` אמרו ש-`pendingYears.2026` מבוסס "על הרשומות
     בלבד". אבל ה-cite שלו כולל גם את שורה 11 של הדוח.
   - מה שנבחר: ניסוח מחדש, לא הסרת שורת הדוח. השורה נדרשת למבחן השרשרת של חוק ההתייעלות הכלכלית: עמודי הרשומות הם תמונה
     ולא נוקבים בשם החוק.
   - התיקון: ההצמדה ומשפט 87ז(ב) מצוטטים לרשומות, עמ' 173. שורה 11 של הדוח רק נוקבת בשם החוק.
   - נוסף מבחן: כל עוד ה-cite של 2026 כולל מסמך שאינו הרשומות, הביטוי "gazette alone" לא מופיע ב-README וב-`about`.

3. **note — מוטציות D1 ו-D6 שרדו בסקירה. שתיהן נהרגות עכשיו.**
   - D1: נוסף assert על משפט ה-wikisource (החלטה 1(4)) ב-`years.2026.toVerify`.
   - D6: נוסף מבחן README. שורות ה-README של osek-zair (הסעיף "The בעל עסק זעיר self-check", וכל שורה שמזכירה
     osek-zair או "עסק זעיר") לא מזכירות nevo או נבו. 122,833 מופיע רק בשורה אחת, השורה הלא-מאומתת של 2026.

4. **note — תיקון ללוג הזה.** סעיף 2 כאן אומר ש-`271872f` "הוא `b6e1d64~1`". זה לא נכון: `b6e1d64~1` הוא `4262342`.
   בדקתי ב-`git diff --quiet` (exit 0) שקובצי osek-zair (הדף, שני הקונפיגים ו-`osek-patur.json`) זהים בשני הקומיטים,
   ולכן תוכן ההשוואה לא משתנה. את הטקסט הקודם בלוג לא ערכתי.

5. **שאר ה-notes לא דרשו שינוי:**
   - `toVerify` של 2026 שנכתב מחדש: גלוי ומוצדק לפי הסוקר. ההחלטה עליו ל-thread הראשי.
   - ההיסטוריה ב-`check.vatLaw`: הפסיקה מתירה אותה.
   - ארבעת הקבצים שהשתנו בהערות בלבד: לא מזיקים.

**ולידציה (לפי קוד היציאה):**
- `cd products/il-biz-tools && npx vitest run`: exit 0, ‏32 קבצים, 887 מבחנים (885 + 2 חדשים).
- `scripts/verify.sh`: exit 0 (typecheck exit 0; ‏79 קבצים, 2576 עברו ו-2 דולגו).
- `node scripts/freeze-capture.mjs --cited`: exit 0.
- `node scripts/check-html.js`: exit 0.
- מוטציות: תוכנית הסוקר (21) ועוד 7 חדשות (E1-E7, על התיקונים עצמם), 28 בסך הכול, עם `--cmd` של vitest על שני קובצי
  המבחן של osek-zair. התוצאה: 28 נהרגו ו-0 שרדו, D1 ו-D6 ביניהן. התוכנית נמצאת רק בתיקיית ה-scratch
  (`tick54/fix-osek-zair/plan.json`), כי למוצרים אין בית לתוכניות מוטציה.
- grep השם/כתובת על הקבצים שהשתנו מול הבסיס: ריק.
