# טיק 69 (11.10.2026) — capitax.co.il: רשומת TERMS_PENDING ושורת תנאים אחת (פסיקה 11.10 שורה 27, קיפול 13(d))

בונה (Opus) ב-worktree מבודד (`/home/user/automaton/.claude/worktrees/wf_927f10b0-b09-2`, ענף
`worktree-wf_927f10b0-b09-2`, בסיס `00d35bc` על `claude/new-session-j071dx`). הלוג הזה הוא של הקיפול בלבד; את
`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md` ו-`logs/FABLE_QUEUE.md` מעדכן החוט הראשי.

## 1. מה המשתמש ביקש

לבצע את קיפול 13(d) של `research/channel-loop/RULING-2026-10-11-osek-patur-ceiling.md`: רשומת `TERMS_PENDING` ל-
`capitax.co.il` ב-`terms-verdicts.json` ושורה פשוטה אחת `terms-capitax` ב-`research/rendered/urls.txt` (דרך
`scripts/queue-zero-test.mjs`), אחרי קריאת הכותרת התחתונה של הלכידה `tt-src-capitax-co-il-content-2-3311` לכתובת
התנאים. החוט הראשי מצא `href="/legalterms"` בשורות 580 ו-655 של ה-.html, ולכן הכתובת היא
`https://www.capitax.co.il/legalterms` — לאמת בעצמי.

- בדיוק בתבנית שבה טיק 45 הוסיף את תשעת אתרי ה-TERMS_PENDING שלו: שורת ZERO-TESTS כמו 235-243 (המספר הבא), הערה
  ושורה פשוטה ב-`urls.txt` (בלי js), ורשומה ב-`terms-verdicts.json` עם `copying: "unread"`.
- הערת הרשומה חייבת לומר: שלכידות של האתר כבר קיימות ונלכדו לפני כל קריאת תנאים (לפרט כל `tt-src-capitax-*` ו-
  `tt2-capitax-*`); שפסיקה 11.10 שורה 27 מבססת את ה-₪120,000 של osek-patur ושל osek-zair על עותק `tt2-capitax` של
  רשומות; ושה-REOPEN (a) שלה נדלק אם קריאת robots או תנאים אוסרת את הלכידות האלה.
- לקרוא את קיפול 10 של פסיקת 6.10 ולעשות רק את מה ש-13(d) מבקש.
- כל בדיקה שסופרת רשומות, אתרים, שורות פעילות או שדות copying — לעדכן לאמת החדשה, לא להחליש; שחזורים היסטוריים על
  fixtures מוצמדים כמו בקיפול virtualembryo של טיק 68. להוסיף בדיקה שמצמידה את הרשומה ואת השורה.
- לא לגעת ב-`mutations/README.md` (לדווח זמני ריצה), ולא בקבצים של הבניות האחרות.

## 2. הפעולות המרכזיות שביצעתי

1. **בדיקת בסיס.** ה-worktree התחיל ב-`297a20b` (קומיט render ישן), בלי
   `research/channel-loop/RULING-2026-10-11-ledger-sale-ids.md`; `git reset --hard claude/new-session-j071dx` → `00d35bc`,
   ושני הקבצים קיימים.
2. **קריאה.** קיפול 13(d) (`:583-585`), ה-REOPEN (`:414-417`), "What this does not decide" 2 (`:468-471`), פסקת העותק
   של הגזט (`:238-248`); קיפול 10 של פסיקת 6.10 (`:413-415`) — מעבר audit של copying ו-`[robots-bar]`, ולא בוצע כאן;
   `queue-zero-test.mjs` (השער, `queueZeroTest`, ה-CLI); שורות 235-243 ו-266-269 של ZERO-TESTS והערותיהן ב-`urls.txt`;
   רשומות טיק 45 ב-`5de515a` ורשומות טיק 55 (קישור שנמצא בלכידה) ב-`7439a31`.
3. **אימות הכתובת.** פענחתי את ה-.html כ-windows-1255: שורה 580 היא `<li><a href="/legalterms">תנאי שימוש</a></li>`
   (פריט התפריט בכותרת התחתונה), 655 היא שורת זכויות היוצרים עם אותו קישור, ו-39 היא
   `<base href="https://www.capitax.co.il/"/>`, כך שהכתובת היא `https://www.capitax.co.il/legalterms`. אין בלכידה קישור
   אחר לתנאים או לעמוד משפטי (ה-"terms" הנוסף הוא checkbox של טופס הרשמה).
4. **הלכידות של האתר.** שש: `tt-src-capitax-co-il-content-2-3311` (28.9 21:02 UTC) וחמישה PDF של 28.9 23:22 UTC
   (`tt2-capitax-265-2023` הגזט, `-21072025-1`, `-11122024`, `-26112024-2`, `-28052025-1` — חמשת המסמכים של
   `osek-zair.json:4-64`). לאף meta אין מפתח `robots` (לפני בניית robots.txt של 30.9). אף אחת לא בשורת `urls.txt`.
5. **ממצא אגב.** ה-.txt של הלכידה מחזיק 6,866 תווי U+FFFD ואף אות עברית: render-watch מפענח כל גוף HTML כ-UTF-8 לפני
   חילוץ הטקסט (`extractText(body.toString("utf8"))`), גם כשה-Content-Type אומר windows-1255. דף התנאים, אם הוא באותו
   קידוד, ייקרא רק דרך ה-.html. נרשם בהערה כאזהרה לקורא; לא תיקנתי את render-watch (מחוץ ל-13(d)).
6. **הרשומה.** סקריפט חד-פעמי ב-scratch שכותב דרך `serializeVerdicts` של `robots-verdict.mjs` (בודק קודם שהקובץ
   בפורמט שלו ושהמפתחות ממוינים), במקום הממוין (אחרי `build-arena.github.io`): `TERMS_PENDING`, `checked` 2026-10-11,
   `copying` unread; source בתבנית "link observed in a capture" של טיק 55; הערה שנפתחת "terms unread:" (בלי מילת סוג —
   הדף לא נלכד עדיין, כמו טיק 55).
7. **השורה.** `node scripts/queue-zero-test.mjs --date 11.10.2026 --candidate … --url https://www.capitax.co.il/legalterms
   --slug terms-capitax --settle … --note …` (dry-run ואז אמיתי): שורה 270 אחרי 269, וההערה והשורה בסוף `urls.txt`.
   השער עבר (TERMS_PENDING ו-slug שמתחיל ב-terms-).
8. **בדיקות.** הרצת החבילה המלאה מצאה 13 כשלים צפויים (ספירות) — תוקנו כמתואר ב-4; בדיקה חדשה
   `capitax-terms.test.ts` (8 בדיקות) ובלוק "tick 69" ב-`prize-terms-audit.test.ts` (3 בדיקות).
9. **תוכנית מוטציות.** 20 רשומות `T69-CX` ב-`mutations/robots-verdict.json` (שם ישבו רשומות הנתונים של טיקים 57-68);
   `--check` לפני ואחרי הקומיט, וריצה מלאה של התוכנית (176 רשומות) בתוך `scripts/sim-tree.sh`.
10. **קומיטים.** `fb79b74` (הנתונים, הבדיקות והתוכנית), ואחריו הלוג הזה בקומיט נפרד.

## 3. קבצים/מערכות ששונו

- `research/channel-loop/terms-verdicts.json` — רשומת `capitax.co.il` חדשה (7 שורות); שום רשומה אחרת לא זזה.
- `research/channel-loop/ZERO-TESTS.md` — שורה 270.
- `research/rendered/urls.txt` — הערת שורה 270 והשורה `https://www.capitax.co.il/legalterms	terms-capitax`.
- `src/__tests__/revenue/capitax-terms.test.ts` — חדש: מצמיד את הרשומה, כל שורה שהיא מצטטת (הכותרת התחתונה המפוענחת,
  שורות הפסיקה, שורות שני הקונפיגים), שש הלכידות, שורת ZERO-TESTS, השורה ב-`urls.txt` ותשובות השער.
- `src/__tests__/revenue/prize-terms-audit.test.ts` — `CX69`, `cx69Before()`, `cx69UrlsBefore()`; `ve68Before()` קורא
  דרך `cx69Before()`; קשירת השורות של טיק 45 מכסה את שורה 270; שלוש בדיקות שתיארו את מצב טיק 60/68 קוראות דרך
  `cx69Before()`/`cx69UrlsBefore()`; בלוק "tick 69" חדש.
- `src/__tests__/revenue/frozen-citations.test.ts` — כניסת `LIVE_MENTIONS` וכניסת `NOT_CAPTURES` לאזכור ה-slug בפסיקה,
  והערת `NOT_CAPTURES` מורחבת לסוג הזה.
- `src/__tests__/revenue/mutations/robots-verdict.json` — 20 רשומות `T69-CX` (156 → 176).
- `logs/2026-10-11-channel-loop-tick-69-capitax-terms.md` — הלוג הזה.
- לא נגעתי: `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, שום
  `RULING-*`/`SITTING-*`, `research/measurements/*`, `state/colony/*`, `mutations/README.md`, קבצי הבניות האחרות.
- `node_modules` ב-worktree: קישור סימבולי ל-`/home/user/automaton/node_modules` (מוחרג ב-`.gitignore`, לא בקומיט).

## 4. החלטות והנחות משמעותיות

- **הכתובת** נקבעה מה-`<base href>` של הלכידה ולא מניחוש; `new URL("/legalterms", base)` נבדק בבדיקה.
- **"no GitHub-hosted copy was looked for"** ולא "no GitHub-hosted text" כמו בטיק 45: לא חיפשתי (אין רשת), ולא כתבתי
  שאין.
- **ה-slug `terms-capitax` לא מופיע בהערה או במקור.** קובץ החלטה שמזכיר slug פעיל נבדק מול `LIVE_MENTIONS`; רק ההערה
  ב-`urls.txt` (שאינה קובץ החלטה) ושורת הפסיקה עצמה מזכירות אותו. הפסיקה כבר כתבה אותו (`:584`), ואסור לי לערוך
  אותה, ולכן נוספו כניסת `LIVE_MENTIONS` וכניסת `NOT_CAPTURES` (אין עדיין לכידה על הדיסק). שתיהן נכשלות כשהן
  מתיישנות: `NOT_CAPTURES` ברגע שהרינדור כותב את הלכידה, `LIVE_MENTIONS` כשהשורה מושהית אחרי הקריאה — מי שקורא את
  הרינדור מסיר אותן.
- **ציטוט ביטוי ולא מספר שורה בקוד.** ההערה מצטטת `extractText(body.toString("utf8"))` ב-`scripts/render-watch.mjs`
  ולא `:2482`, כדי שעריכה לא קשורה של render-watch לא תזיז את הציטוט; הבדיקה מצמידה את הביטוי ושאין ב-render-watch
  `TextDecoder`/`windows-1255`/`iconv` (כשמישהו יתקן את הפענוח, הבדיקה תכשל וההערה תתעדכן).
- **שחזורים.** האתר לא היה קיים לפני הטיק, ולכן אין צורך ב-fixture של הרשומה (כמו googleapis.com בטיק 61):
  `cx69Before()` מוציא אותה, ו-`ve68Before()` קורא דרכו, כך שכל שחזור של טיק קודם (tick54() עד renderBefore(),
  yt61Before(), un60Before()) מחזיק את מה שהחזיק. בדיקות שתיארו מצב "מאז טיק 60/68" קוראות כעת את המצב שהטיק השאיר
  דרך `cx69Before()`, והבלוק "tick 69" מחזיק את המצב הנוכחי. `cx69UrlsBefore()` מוציא בדיוק את שתי השורות של `urls.txt`
  (ונכשל אם לא מצא כל אחת פעם אחת, השורה מתחת להערה).
- **קשירת השורות של טיק 45** הורחבה לשורה 270 (חזקה יותר, לא חלשה יותר), ו-`Math.max` של השורות עדיין מוצמד.
- **מקום רשומות המוטציה**: `robots-verdict.json`, כמו רשומות הנתונים של טיק 68 (T68-VE). ה-README לא עודכן לפי ההוראה;
  השורה שלו על `robots-verdict.json` (טיקים 54-68, 156 רשומות) צריכה את טיק 69 ו-176 — לחוט הראשי.
- **קיפול 10 של פסיקת 6.10 לא בוצע**: הוא מעבר audit (copying לכל אתר, `[robots-bar]` ללכידות שלפני 30.9), ו-13(d)
  מבקש רק את הרשומה והשורה.
- **הלכידה `tt-src-capitax-co-il-content-2-3311` לא הוקפאה**: אין לה שורה ב-`urls.txt`, ולכן שום רינדור לא כותב אותה מחדש,
  והציטוטים לפי שורה בה יציבים (כמו `tt2-capitax-265-2023`, שגם הוא לא מוקפא).
- **הערת הרשומה מוסיפה שתי אזהרות לקורא** מעבר למה שהתבקש: ש-meta של שורת התנאים יענה על robots.txt רק עבור
  `/legalterms` (ולא עבור `/Attachments/` או `/content/`), ושהטקסט ייקרא דרך ה-.html. שתיהן נובעות מהקוד ומהלכידה,
  לא מפסיקה.
- **לא נכתב שם אדם.** שורת זכויות היוצרים בלכידה נושאת שם של משרד; הבדיקה בודקת רק את הקישור `| <a href…>` שבסופה.

## 5. שגיאות וניסיונות שנכשלו

- ה-worktree נפתח על `297a20b`, בלי קובץ הפסיקה של 11.10 — אופס ב-`git reset --hard claude/new-session-j071dx`.
- ב-worktree לא היה `node_modules` — קישור סימבולי ל-node_modules של ה-checkout הראשי.
- רתמת הבידוד סירבה שלוש פעמים לפקודות מורכבות (heredoc עם כמה פקודות, לולאת `for` עם `sed -n ${n}p`, `cat >>` עם
  הרצה): פוצלו לפקודות פשוטות, `awk` במקום הלולאה, וכלי Write/Edit במקום heredoc.
- הרצה מלאה ראשונה אחרי הנתונים: 13 כשלים (2 ב-frozen-citations, 11 ב-prize-terms-audit — ספירות של 133/120/23/22,
  max row 269, רשימת אתרים). אחרי שרשור `ve68Before()` דרך `cx69Before()` נשארו 6, מהם 2 חדשים: שחזור של verdicts ישנים
  על `urls.txt` הנוכחי השהה את `terms-capitax` (לאתר לא הייתה רשומה) — נוסף `cx69UrlsBefore()`.
- טיוטה ראשונה של ההערה ציטטה `scripts/render-watch.mjs:2482` — הוחלף בביטוי (ראו 4).

## 6. בדיקות ופעולות ולידציה

- `node scripts/queue-zero-test.mjs --dry-run …` → exit 0 ("would queue row 270: terms-capitax"); אמיתי → exit 0.
- `serializeVerdicts(JSON.parse(raw)) === raw` אחרי כל כתיבה → true.
- `npx vitest run src/__tests__/revenue/prize-terms-audit.test.ts` → exit 0, 103 עברו (100 + 3 חדשות).
- `npx vitest run src/__tests__/revenue/frozen-citations.test.ts` → exit 0, 23 עברו.
- `npx vitest run src/__tests__/revenue/capitax-terms.test.ts` → exit 0, 8 עברו.
- `scripts/verify.sh` (typecheck + `src/__tests__/revenue`) → exit 0: typecheck exit 0; 82 קבצים, 2969 עברו, 2 דולגו
  (2971), כ-3:38 דקות.
- `node scripts/mutate.mjs --check --allow-dirty --plan src/__tests__/revenue/mutations/robots-verdict.json` (לפני הקומיט)
  → exit 0, 176 מתוך 176; אחרי הקומיט בלי `--allow-dirty` → exit 0, 176 מתוך 176.
- `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/robots-verdict.json` (מ-`fb79b74`,
  לבד, כולל הקמת העץ) → sim-tree exit 0: 9 קווי בסיס לפני ו-9 אחרי, כולם exit 0; "176 applied: 176 killed, 0 survived,
  0 killed?, 0 timeout; 0 not applied; 0 not run". משך: 13:39:53 עד 13:59:47 UTC, כ-1,194 שניות לכל 176; 20 רשומות
  `T69-CX` לקחו יחד כ-71 שניות (1.3-8.2 שניות לרשומה: capitax-terms לבד כ-1.5, עם prize-terms-audit כ-4, עם
  frozen-citations כ-7.5). זמן הריצה של `robots-verdict.json` לטבלה ב-`mutations/README.md` (שלא נגעתי בה): 1,194 שניות,
  176 רשומות, טיק 69, בתוך sim-tree.sh, לבד, כולל הקמת העץ.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **הוספת רשומת TERMS_PENDING אין לה כלי.** `queue-zero-test.mjs` כותב את השורה והעמודה אבל דורש שהרשומה כבר תהיה
  קיימת, והרשומה נכתבת בכל פעם בסקריפט חד-פעמי דרך `serializeVerdicts` (טיקים 45, 55, 61, 69). כדאי
  `queue-zero-test.mjs --pending-entry` (או `terms-verdict.mjs add`) שכותב רשומת TERMS_PENDING עם source ו-note נתונים,
  במקום הממוין, ומסרב לאתר קיים.
- **שחזור "לפני הטיק" ב-`prize-terms-audit.test.ts` נכתב ביד בכל טיק** (`yt61Before`, `ve68Before`, `cx69Before`, ועכשיו גם
  `cx69UrlsBefore`), והקובץ עבר 5,800 שורות. רישום אחד של "אתרים ושורות שנוספו בטיק N" שכל השחזורים קוראים ממנו היה
  חוסך את העריכות בבלוקים הישנים.
- **ל-`mutate.mjs` אין `--only <ids>`**: כדי להריץ 20 רשומות חדשות רצה כל התוכנית (176), וכתיבת תוכנית חלקית ב-scratch
  אסורה. אפשרות `--only T69-CX` (prefix) הייתה חוסכת את רוב הזמן.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `prize-terms-audit.test.ts` (5,700 שורות) כדי למצוא את מנגנון השחזור ואת הבדיקות הסופרות — החלק הגדול.
- הרצה מלאה של החבילה פעמיים (לגילוי כשלים ול-verify) — נחוץ, כי הספירות פזורות.
- הרצת כל 176 רשומות התוכנית כדי לבדוק 20 חדשות (ראו 7).
- פלט `--check` של 176 שורות שהודפס פעמיים.
- שלוש פקודות שהרתמה סירבה להן ונכתבו מחדש.
