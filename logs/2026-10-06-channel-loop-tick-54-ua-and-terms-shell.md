# 2026-10-06 — לולאת הערוצים, טיק 54: ה-User-Agent בלי איש קשר, ומסלול `--js --terms-shell` (פסיקה 6.10 שורה 21 (b), (c))

ענף: `build/tick54-ua-and-terms-shell` (worktree מבודד, בסיס `claude/new-session-j071dx`). בונה Opus, בלי רשת.

## 1. מה המשתמש ביקש

הסוכן הראשי ביקש לממש בדיוק את קיפולים 5 ו-6 של `research/channel-loop/RULING-2026-10-06-robots-and-terms.md`:

- **קיפול 5** — ב-`scripts/render-watch.mjs` ה-`USER_AGENT` הופך ל-`MehudakRenderWatch/1.0 (robots.txt honoured; contact pending)`,
  בנוי מקבוע `UA_CONTACT` ריק היום; ההערה מעליו מונה את שני הטריגרים של החלטה 2(2) (אתר מותג חי לפי רשומת deploy
  מחויבת + לכידה עם status 200; תיבת הדואר של צעד 8) ושהגרסה עולה בכל אחד. בדיקות: המחרוזת המדויקת; אין URL כל עוד
  `UA_CONTACT` ריק; ופונקציה מיוצאת שדורשת `research/rendered/brand-<host>.meta.json` עם status 200 ביום שהקבוע יתמלא,
  נבדקת על fixture בתיקייה זמנית (ולא בדיקה שמדולגת לפי תנאי).
- **קיפול 6** — ב-`scripts/queue-zero-test.mjs` מסלול `--js --terms-shell` של החלטה 3(2): מותר רק כשה-slug מתחיל
  `terms-`, יש לכידה רגילה של אותו URL, ה-classifier של `capture-check.mjs` (מיובא, לא משוכפל) מדרג אותה `js-shell`,
  ה-meta אומר robots `allowed` או `none`, האתר `TERMS_PENDING` או `NO_TERMS`, ואין לכידת js קודמת (פעם אחת בלבד).
  השורה נושאת דגל `js`, הערה שמונה את הפסיקה ואת קידומת ה-sha256. כל השאר נדחה עם הסיבה. השורה צריכה לעבור את
  `termsGate` ואת שלב 1 של `scripts/render-dispatch.sh`, עם בדיקה לכך.
- תוכניות מוטציה (`render-watch.json`, `queue-zero-test.json` חדשה), `mutations/README.md`, `verify.sh` ממוקד ומלא,
  `freeze-capture.mjs --cited` בלי שינוי, הרצת dry-run ל-`terms-israel-post` ול-`terms-kaggle`, ויומן זה.

## 2. הפעולות המרכזיות שביצעתי

1. קראתי את סעיפים 2, 3 ואת הקיפולים בפסיקה, ואת `render-watch.mjs`, `queue-zero-test.mjs`, `capture-check.mjs`,
   `render-dispatch.sh`, `urls-pause-comments.mjs` ואת הבדיקות שלהם.
2. **קיפול 5**: `UA_CONTACT = ""`, `UA_VERSION = "1.0"`, `userAgentFor(contact, version)` (בלי איש קשר:
   `robots.txt honoured; contact pending`; עם איש קשר: `<contact>; robots.txt honoured`, איש הקשר ראשון לפי הצורה
   `(+<URL>; …)` של 2(2)), `USER_AGENT = userAgentFor()`, ו-`uaContactProblems(contact, dir)` — לכל URL באיש הקשר
   דורשת `brand-<host>.meta.json` שה-url שלו על אותו host, בלי error ועם status 200. עדכנתי את פסקת ה-UA ב-
   `research/rendered/README.md` (בדיקה קיימת דורשת שה-README יכיל את `USER_AGENT`).
3. **קיפול 6**: `queueTermsShell` (ועוזרים `jsCapturesOf`, `frozenCopiesOf`, `isShellTermsVerdict`,
   `TERMS_SHELL_RULING`), דגל CLI `--terms-shell` (דורש `--js`, אוסר `--terms`), הדפסת תזכורת הקפאה.
4. **`termsGate` קורא את דגל ה-js**: `termsGate(url, slug, verdicts, { js })`. אתר `NO_TERMS` שההערה שלו פותחת
   במילת הסוג `shell` (K4) עובר רק עבור שורת `terms-` עם `js`. `applyVerdicts`, `GATE_JS` של `render-dispatch.sh`
   ו-`urls-pause-comments.mjs` מעבירים את הדגל של השורה.
5. סימולציה ב-`scripts/sim-tree.sh`: עריכת מילת הסוג של israelpost (כפי שקיפול 2 יכתוב), הקפאה, תור לשתי השורות,
   והרצת כל חבילת revenue. היא חשפה שלוש בדיקות שהניחו "אין שורת js ב-urls.txt" או "השורה ישר מתחת להערת השורה";
   תיקנתי אותן (סעיף 4) ושיניתי את מיקום השורה (במקום השורה הרגילה הפעילה, לא לצידה).
6. 26 מוטציות חדשות דרך תוכניות זמניות בתיקיית ה-scratch, כולן נהרגו, ואז הוכנסו לתוכניות שבריפו.
7. הבסיס זז באמצע (5 קומיטים של הסוכן הראשי, כולל תיקון `frozen-citations`); מיזגתי אותו לענף (`--no-ff`, בלי
   קונפליקטים) לפני ה-verify המלא.

## 3. קבצים/מערכות ששונו

- `scripts/render-watch.mjs` — `UA_CONTACT`, `UA_VERSION`, `userAgentFor`, `uaContactProblems`, `USER_AGENT` החדש.
- `scripts/queue-zero-test.mjs` — מסלול `--terms-shell`, `queueTermsShell`, `jsCapturesOf`, `frozenCopiesOf`,
  `isShellTermsVerdict`, `TERMS_SHELL_RULING`, `termsGate(..., { js })`, `applyVerdicts` עם הדגל, הערת ראש.
- `scripts/render-dispatch.sh` — שלב 1 מעביר את דגל ה-js ל-`termsGate`.
- `scripts/urls-pause-comments.mjs` — `TERMS_PAUSED` לוכד את הדגל ומעביר אותו.
- `research/rendered/README.md` — פסקת ה-UA, ופסקה חדשה על מסלול ה-shell (לא לכידה; urls.txt ולכידות לא נגעו).
- בדיקות: `render-watch-robots.test.ts`, `queue-zero-test.test.ts`, `render-dispatch.test.ts`,
  `render-watch-terms-barred.test.ts`, `urls-pause-comments.test.ts`, `render-watch-js.test.ts`,
  `prize-terms-audit.test.ts`, `mutation-plans.test.ts`.
- תוכניות מוטציה: `mutations/render-watch.json` (+9), `mutations/queue-zero-test.json` (חדשה, 16),
  `mutations/render-dispatch.json` (+1), `mutations/README.md`.
- היומן הזה. לא נגעתי ב-`logs/CHECKPOINT.md`, `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`, `terms-verdicts.json`, `urls.txt`,
  לכידות או קבצי פסיקה.

## 4. החלטות והנחות משמעותיות

- **סדר המחרוזת עם איש קשר**: `(<contact>; robots.txt honoured)` — הפסיקה כותבת `(+<URL>; …)`, כלומר איש הקשר ראשון.
  ההוראה "carries it instead of contact pending" מתקיימת כי "contact pending" נעלם.
- **`uaContactProblems` בודקת רק את חצי הלכידה** של 2(2)(i). רשומת ה-deploy היא קובץ שה-workflow של ה-deploy יכתוב, וזה
  עוד לא קיים; כתוב בהערה. גם "הטקסט נושא את שם המותג" לא נבדק (אין שם מותג קבוע בקוד) — פער מוצהר.
- **`NO_TERMS` דורש מילת סוג `shell`** כדי ש-`termsGate` יעביר שורת js: הפונקציה טהורה ואינה רואה את הלכידה, ופסיקה
  3(1) קובעת שהסוג נקבע לפי המילה הראשונה בהערה. לכן המסלול מסרב ל-Israel Post עד שקיפול 2 יכתוב `shell:` בהערה של
  `israelpost.co.il`, עם סיבה שאומרת זאת. `TERMS_PENDING` עובר כמו קודם, עם דגל או בלעדיו.
- **סירוב נוסף לפי מילת סוג אחרת** (`refusal-type`, `exhaustive-negative`, `unanswered`, `deferred`) גם ב-
  `TERMS_PENDING` — פסיקה 3(1): K1 "No js attempt, ever". תוספת על רשימת התנאים, נגזרת מהפסיקה.
- **בדיקת robots לפני ה-classifier**: לכידה שנחסמה ב-robots היא בפועל `status` (לא נשלחה בקשה), כך שהסיבה האמיתית
  נאמרת. שתי הבדיקות חלות בכל מקרה.
- **פעם אחת בלבד** = אין שורת js ל-slug ב-urls.txt (פעילה או מוערת), ואין meta של ה-slug או של עותק קפוא שלו
  (`frozen.from`) עם `renderedWith`. מגבלה: לכידת js שנדרסה אחר כך בלכידה רגילה, בלי שורה מוערת, לא תיתפס.
- **הקפאה היא תזכורת, לא סירוב**: 3(2)(iv) הוא צעד של מי שקורא למסלול, ורשימת התנאים במשימה לא כוללת אותו. ה-CLI
  מדפיס אם יש עותק קפוא, ואם אין — את שתי הפקודות (`freeze-capture <slug> --allow-flagged`, ואז `--cited`).
- **מיקום השורה**: במקום השורה הרגילה הפעילה (שתי שורות לא יכולות לחלוק slug; ההערה רושמת את הלכידה הרגילה לפי
  sha256), או מתחת לשורה המוערת, שנשארת כתיעוד. ההערה ישירות מעל שורת ה-js.
- **שלוש בדיקות שומר עודכנו** כדי שהתור לא ישבור CI: `render-watch-js` (במקום "אין שורת js היום" — כל שורת js יושבת מתחת
  להערה של המסלול שאישר אותה), `render-watch-terms-barred` (שורת js של `terms-` באתר K4), ו-`listedRow` ב-
  `prize-terms-audit` מדלג רק על הערת המסלול.
- **מיזוג הבסיס לענף** במקום rebase: אין שכתוב היסטוריה, והמיזוג של הסוכן הראשי יהיה נקי.

## 5. שגיאות וניסיונות שנכשלו

- ב-fixture של הבדיקות `robots: undefined` הפעיל את ערך ברירת המחדל `"allowed"` (פרמטר ברירת מחדל ב-JS) — עברתי ל-`null`
  כסימן ל-meta בלי קריאת robots.
- שתי בדיקות נפלו בגלל בדיקת "שורה פעילה אחרת לאותו URL": ה-fixtures חלקו URL. תוקן בבדיקות, לא בקוד.
- verify מלא ראשון נכשל (`frozen-citations`, 2 בדיקות) — כשל של הבסיס `612eb5f` עצמו (הפסיקה החדשה ציטטה את
  `robots-nevo` חי). אומת ב-sim-tree שהבסיס המעודכן `87bf2bd` עובר; מוזג.
- סימולציה ראשונה כתבה את `terms-verdicts.json` דרך `JSON.stringify` ושברה את בדיקת הסריאליזציה — חפץ של הסימולציה;
  השנייה ערכה מחרוזת בלבד.
- הסימולציה גילתה שהעיצוב הראשון (להעיר את השורה הרגילה כ-superseded ולהוסיף לידה) שובר את `listedRow` של שורה 235;
  עברתי להחלפה במקום ולדילוג מוגדר בבדיקה.

## 6. בדיקות ופעולות ולידציה

- `scripts/verify.sh` על ששת הקבצים שבמשימה: exit 0 (typecheck 0, 375 בדיקות). הורץ שוב אחרי כל שינוי.
- `scripts/verify.sh` מלא: exit 0 (typecheck 0; 79 קבצים, 2594 עברו, 2 מדולגות שאינן שלי).
- `node scripts/freeze-capture.mjs --cited`: exit 0, "would repoint 0".
- מוטציות (כולן ב-`sim-tree.sh`): `render-watch` 9/9 נהרגו (52 שניות); `queue-zero-test` 16/16 נהרגו (133 שניות, ושוב
  108 אחרי שינוי המיקום); `render-dispatch` T54-D1 נהרגה (109 שניות). `mutate.mjs --check` על שלוש התוכניות: exit 0.
- dry-run על המאגר האמיתי: `terms-kaggle` — היה נכתב (sha256 `82280c1ad229`, robots none, TERMS_PENDING, לא קפוא עדיין);
  `terms-israel-post` — נדחה: הערת `israelpost.co.il` לא פותחת ב-`shell` (קיפול 2 עוד לא נעשה); `terms-streetlib-it` —
  נדחה: אין קריאת robots ב-meta (לכידה מלפני 30.9).
- סימולציה מלאה ב-sim-tree (מילת הסוג, הקפאה, תור לשתיהן): `--override 233-235` מחזיר את שתי שורות ה-js, התור השני
  נדחה (פעם אחת), `render-watch --needs-browser` ו-`termsGate` עוברים; נשארו רק שתי בדיקות `frozen-citations`, וגם אחרי
  `freeze-capture --cited --apply` נשארים 7 אזכורים של `terms-israel-post` (בפסיקה ובהערה של `terms-verdicts.json:314`)
  שדורשים רשומות `LIVE_MENTIONS` ברגע שהשורה פעילה — עבודה של הסוכן הראשי באותו קומיט של התור.
- grep לזהות (שני המונחים) על הקבצים ששונו: ריק. grep לכתובות דואר בשורות שנוספו: ריק.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **"תור, ואז הרץ את כל החבילה בעץ מדומה"**: כתבתי סקריפט סימולציה פעמיים כדי לראות אילו בדיקות שומר נשברות כש-urls.txt
  משתנה. כדאי מצב `--simulate` ל-`queue-zero-test.mjs` שכותב בעץ `sim-tree` ומריץ את `src/__tests__/revenue`.
- **רשומות `LIVE_MENTIONS`**: כשלכידה הופכת פעילה, אותה רשימה ידנית מתעדכנת בכל פעם (nevo, kaggle, ועכשיו Israel Post).
  כדאי שהמסלול ידפיס את האזכורים שיצטרכו רשומה.
- **בדיקות שמקבעות מצב נוכחי של urls.txt** ("אין שורת js היום") — כל אחת כזו היא מלכודת לשינוי הבא; עדיף אינווריאנטים.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `queue-zero-test.mjs` ו-`render-dispatch.sh` במלואם (כ-800 שורות) — נחוץ, אבל חלק מ-`render-dispatch.test.ts`
  נקרא פעמיים.
- verify מלא ראשון על בסיס ישן (נפל על דבר שלא שלי) — ריצה שהייתה נחסכת לו בדקתי קודם אם הבסיס זז.
- הסימולציה הראשונה עם `JSON.stringify` — ריצת חבילה מלאה שחלק מכשליה היו חפץ.
- העיצוב הראשון של מיקום השורה (superseded) — תיקון קוד, בדיקות ומוטציה אחת, והרצת התוכנית מחדש (108 שניות).
