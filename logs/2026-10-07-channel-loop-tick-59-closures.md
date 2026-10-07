# טיק 59 (7.10.2026) — שלוש סגירות קטנות: `--recheck` על robots.txt שלא השתנה, לכידה גזומה ב-`--terms-shell`, ו-dry run של `trim-capture` מול לכידה שלא נכנסה ל-commit

בונה Opus, ב-worktree נפרד על הענף `build/tick59-closures` (בסיס: `origin/claude/new-session-j071dx` ב-`f2fc8bc`). לא נגעתי
ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, בפסיקות, ב-`research/measurements/*`,
ב-`terms-verdicts.json`, ב-`urls.txt` או בלכידה כלשהי. לא הרצתי `git fetch`, `gh`, push או `git stash`.

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש (משימה מחושבת של workflow, לא הודעת בעלים) שלוש סגירות נפרדות, כל אחת מינימלית, לפי `logs/CHANNEL_LOOP.md` §9
("Queued 6.10 (tick 57)" פריט 4, "Queued 6.10 (tick 58)" פריט 2):

1. `robots-verdict.mjs --recheck`: באתר שהלכידה החיה שלו לא השתנתה, להריץ `judgeRobots` גם על כל נתיב שנמצא עכשיו בתור; נתיב שה-robots.txt
   הנוכחי חוסם בזמן שהפסק נשאר NO_TERMS_ROBOTS_OK מדווח כתוצאה `disallowed-path` עם הנתיב ושורת הרשימה שמצטטת אותו. דיווח בלבד: `--apply`
   לא כותב דבר, היציאה 0 (דורש תשומת לב) ולא 3, ובשורת ה-totals ספירה חדשה. הכותרת ו-`research/rendered/README.md` אומרים מה ה-thread
   הראשי עושה עם זה. בדיקה עם fixture, dry run על המאגר האמיתי (עדיין exit 3), ושלוש מוטציות: התוצאה מושתקת, exit 3 במקום 0, `--apply`
   שכותב.
2. `queue-zero-test.mjs --js --terms-shell`: לכידת תנאים רגילה ש-`trim-capture.mjs` גזם (יש במטא שלה בלוק `trimmed`) נשפטת לפי הסוג שהבלוק
   רושם (`trimmed.captureCheck`), לא לפי הטקסט שהתרוקן, כך שסיבת הסירוב נכונה ("trimmed: its pre-trim kind was <kind>; <reason>") ולכידה
   גזומה מסוג js-shell עדיין כשירה למסלול ה-js החד-פעמי. בדיקות על fixtures ושתי מוטציות (הבלוק מתעלמים ממנו; הסוג נקרא מהשדה הלא נכון).
3. הבדיקה של המאגר האמיתי ב-`trim-capture.test.ts` לא תיכשל בגלל לכידות שלא נכנסו ל-commit: עותק של המאגר, או להפוך את תשובת
   "uncommitted" של `historyOf` למצב מדווח ב-dry run (השינוי הקטן מבין השניים, כש-`--apply` ממשיך לסרב); בדיקה ומוטציה אחת.
4. בדיקות: `verify.sh` ממוקד ומלא, `--recheck` ו-`trim-capture.mjs` (dry) על המאגר האמיתי, תוכניות המוטציות ב-sim-tree, וה-README של התוכניות.

## 2. הפעולות המרכזיות שביצעתי

1. יצרתי את ה-worktree כפי שנכתב; `git log --oneline -1` (`f2fc8bc`) ו-`ls products/ src/revenue/` — הכל קיים, לא היה צורך ב-reset; קישור
   `node_modules`.
2. קראתי את יומן טיק 58 (כולל תיקוני הסקירה), את `robots-verdict.mjs` כולו, את ראש `queue-zero-test.mjs`, `checkTermsCapture` ו-`queueTermsShell`,
   את ראש `trim-capture.mjs`, `historyOf` ו-`trimStore`, את `classifyCapture`/`readCapture` ב-`capture-check.mjs`, את בדיקת המאגר האמיתי
   ב-`trim-capture.test.ts`, ואת הערות §9 (קריאה בלבד). בדקתי ב-`render-watch.mjs` שבדיקת ה-robots שלו רצה לפני כל הבאה.
3. **סגירה 1** (`recheckSite`, `recheckMain`): בענף ה-unchanged, `judgeRobots` רץ על העותקים הקפואים (אותם בתים) לכל host שה-source מצטט,
   ועל הלכידה החיה ל-host שהוא לא מצטט. `disallowed` → `disallowed-path` עם `checked` ו-`refused`. ב-`recheckMain` הרשימות נקראות עם שמן
   (`texts`), `queuedAt` מוצא את `<list>:<line>` של כל שורה שמכניסה את הנתיב לתור (`queuedPaths` שורה אחר שורה), הפלט מדפיס `DISALLOWED`
   ושורת "report only", `OUTCOMES` קיבל את `disallowed-path` בסוף, וקוד היציאה סופר אותו. הכותרת, תיאור `recheckSite` וה-README עודכנו.
4. **סגירה 2** (`queueTermsShell`): בדיקת הקיום של ה-`.html` עברה אחרי קריאת המטא, ולא נדרשת כשיש בלוק `trimmed`; הדירוג נשאר של
   `capture-check` (שכבר קורא את `trimmed.captureCheck`, ו-status קודם לו); סירוב של לכידה גזומה (שאינו status) נוסח
   "trimmed: its pre-trim kind was <kind> (<evidence>), not js-shell; <reason>", ו-"not recorded" כשהבלוק לא רשם סוג (המסלול של render-watch).
   הכותרת וה-README עודכנו.
5. **סגירה 3** (`historyOf`, `trimStore`): השגיאה של שינויים שלא נכנסו ל-commit מסומנת `uncommitted: true`; ב-dry run היא מודפסת כשורת
   `uncommitted: …` והלכידה מתוכננת על הקבצים שבדיסק (commit null); עם `--apply` היא נזרקת כמו קודם (סירוב של הריצה כולה). הכותרת, ה-README
   והערה בבדיקת המאגר האמיתי.
6. בדיקות (סעיף 6), commit ראשון (`503e6dd`), שלוש תוכניות המוטציות ב-sim-tree ברקע, `verify.sh` המלא במקביל, הרצות המאגר האמיתי, עדכון
   `mutations/README.md` והיומן, commit שני.

## 3. קבצים/מערכות ששונו

- `scripts/robots-verdict.mjs` — `recheckSite` (ענף unchanged שופט את התור), `OUTCOMES`, `queuedAt` (חדש, לא מיוצא), `recheckMain` (שמות
  הרשימות, הדפסת `disallowed-path`, קוד היציאה); הכותרת ותיאור `recheckSite`.
- `scripts/queue-zero-test.mjs` — `queueTermsShell` (ה-`.html` של לכידה גזומה, נוסח הסירוב); הכותרת.
- `scripts/trim-capture.mjs` — `historyOf` (השגיאה מסומנת), `trimStore` (dry run מדווח); הכותרת.
- `research/rendered/README.md` — פסקת ה-re-check השבועי (`disallowed-path`, קוד היציאה), סעיף "Trimmed copies" (קוד היציאה של
  `trim-capture`, קורא `--terms-shell` של לכידה גזומה).
- `src/__tests__/revenue/robots-verdict.test.ts` — בדיקה חדשה ל-`disallowed-path` (50 בקובץ, 49 לפני).
- `src/__tests__/revenue/queue-zero-test.test.ts` — ארבע לכידות גזומות ב-fixture ובדיקה חדשה (60 בקובץ, 59 לפני).
- `src/__tests__/revenue/trim-capture.test.ts` — בדיקת ה-git הורחבה (dry run מדווח, `--apply` מסרב; 30 בקובץ, כמו לפני) והערה בבדיקת המאגר האמיתי.
- `src/__tests__/revenue/mutations/{robots-verdict,queue-zero-test,trim-capture}.json` — T59-DP1..5, T59-Q1..5, T59-T1..3; T58-RC18 הוזזה.
- `src/__tests__/revenue/mutations/README.md` — שורות התוכניות וזמני הריצה.
- `logs/2026-10-07-channel-loop-tick-59-closures.md` — היומן הזה.

## 4. החלטות והנחות משמעותיות

- **סגירה 1 — על מה נשפט התור.** בענף unchanged העותקים הקפואים הם אותם בתים כמו הלכידה החיה (זה מה ש-unchanged אומר), ולכן `judgeRobots`
  רץ עליהם, כמו שענף ה-refresh עושה ל-host שלא השתנה. host שה-source לא מצטט (עמוד שנוסף על host אחר של האתר) נשפט על הלכידה החיה שלו;
  אם אין לו לכידה, או שהיא לא robots.txt שנקרא, האתר נשאר unchanged כמו עד היום (לא unreachable): render-watch קורא את תשובת ה-host
  הזה לפני כל הבאה. כתבתי את המגבלה בכותרת. במאגר היום אין מקרה כזה (18 מתוך 18 נשפטו על העותקים המצוטטים בלבד).
- **סגירה 1 — שורת הרשימה** מחושבת ב-`recheckMain` (שם יש שמות קבצים), לא ב-`recheckSite`, שנשאר טהור ובלי פרמטר חדש. השם הוא הנתיב
  יחסית לתיקיית העבודה, כמו בשורת הפתיחה; המספר הוא מספר השורה בקובץ שלה, לא בטקסט המחובר.
- **סגירה 1 — שורת ה-totals:** הספירה החדשה נוספה בסוף ("…, 0 error, 0 disallowed-path"), לא אחרי unreachable, כדי שכל ה-`toContain` הקיימים
  של שורת ה-totals (שנגמרים ב-"0 error") ימשיכו לחול בלי לגעת בהם.
- **סגירה 1 — מה ה-thread הראשי עושה:** הכותרת וה-README אומרים "pause the line in urls.txt or take it off the prize list"
  (`research/measurements/ai-allowed-events.urls.txt`), ושבדיקת ה-robots של render-watch כבר מסרבת להביא את העמוד בינתיים. אין `--apply`
  לזה: הפסק נשאר נכון לנתיבים שהוא נשפט עליהם, והשורה החדשה היא מה שצריך תיקון.
- **סגירה 2 — עיצוב שונה מהניסוח בבריף (סטייה).** הבריף אומר ש-`queue-zero-test` ישפוט לפי `trimmed.captureCheck`. הסיווג במסלול הזה הוא
  של `capture-check` ("capture-check's own classifier, never a copy of it", 3(2)(i)), וה-classifier כבר מחזיר את `trimmed.captureCheck`
  ללכידה גזומה, אחרי בדיקת ה-status. מה ששבר את המסלול היה דרישת ה-`.html` (גוף שיצא מהעץ) שבאה לפני הסיווג: לכידה גזומה מכל סוג נדחתה
  כ-"no plain capture … with its .html: the plain GET must have seen the shell first", כלומר סיבה שגויה ו-js-shell גזומה שלא עוברת.
  לכן השינוי הקטן: אין דרישת `.html` כשיש בלוק `trimmed`, ונוסח סירוב "trimmed: its pre-trim kind was <kind> (<evidence>), not js-shell;
  <reason>". קריאה של השדה בתוך `queue-zero-test` הייתה עותק של ה-classifier, ובלי סדר ה-status שלו. המוטציה "הסוג נקרא מהשדה הלא נכון"
  (T59-Q2) נמצאת לכן ב-`queue-zero-test.json` אבל משנה את `scripts/capture-check.mjs`, המקום היחיד שקורא את השדה; היא נהרגת בבדיקת
  `queue-zero-test`.
- **סגירה 2 — שני מקרים נוספים** שהנוסח החדש חייב לטפל בהם כדי לא לשקר: לכידה שהמסלול של render-watch שמר גזומה (בלי `captureCheck`;
  ה-classifier מחזיר `trimmed`) נאמרת "its pre-trim kind was not recorded", ולכידה גזומה שההבאה האחרונה שלה נכשלה (status 503) נשארת
  "grades the plain capture status", כמו לא-גזומה. לכל אחד fixture ומוטציה (T59-Q4, T59-Q5) מעבר לשתיים שהתבקשו.
- **סגירה 2 — `checkTermsCapture` (המסלול `--js --terms <slug>`) לא שונה (שאלה פתוחה).** ההודעה שם, "that is an empty JavaScript shell or a
  stub, not a read terms page", היא כנראה ה-"stub" שבהערת הסוקר של fold 9: המסלול הזה סופר תווים ב-`.txt`, ו-`.txt` של לכידה גזומה התרוקן.
  לקבל שם לכידת תנאים גזומה שהבלוק שלה אומר ok היה מרחיב שער (שורת js נוספת שנשענת על תנאים של אתר שאסר העתקה), וזו לא הסגירה
  שהתבקשה. ההחלטה ל-thread הראשי.
- **סגירה 3 — האפשרות שנבחרה: מצב מדווח ב-dry run, לא עותק של המאגר.** עותק היה צריך את כל הקבצים מכריעי ההחלטה (`citationsOf` קורא את
  `research/**`, `docs/`, README של מוצרים ועוד), ולכידה שלא נכנסה ל-commit הייתה או חסרה בו (git archive) או מועתקת ומוסתרת; השינוי שנבחר
  הוא שלוש שורות סביב קריאה אחת, והסירוב של `--apply` לא זז (אותה שגיאה נזרקת). הסימון הוא שדה `uncommitted` על השגיאה ולא התאמת טקסט
  של ההודעה. ב-dry run הלכידה מתוכננת עם commit null, ולכן ה-`fullBytesIn` של התוכנית (שלא נכתבת) ריק.
- **סגירה 3 — מתי זה קורה בפועל:** במאגר היום אין לכידה לא-גזומה של אתר copying-barred (44 גזומות, 2 בלי כלום בעץ), כך ש-`historyOf` לא נקרא
  בכלל ב-dry run האמיתי. המקרה הוא אתר ששדה ה-`copying` שלו הופך ל-`barred` בזמן שיש לו לכידות שלא נכנסו ל-commit (render שהובא זה עתה).
  לכידה שכבר גזומה ונערכה באמצע עדיין נדחית ב-"files no longer match its block" — סירוב אחר, לא של `historyOf`, ולא שיניתי אותו (שאלה פתוחה).
- **מוטציות מעבר למבוקש:** T59-DP4 (ספירת ה-totals), T59-DP5 (מספר השורה), T59-Q3 (נוסח הסירוב הגזום), T59-Q4, T59-Q5, T59-T2 (dry run שמסרב
  שוב), T59-T3 (שגיאה לא מסומנת). T58-RC18 הוזזה לשורת היציאה החדשה (אותה מוטציה, `return 3`).

## 5. שגיאות וניסיונות שנכשלו

- **עיצוב ראשון של סגירה 2 נזרק לפני commit.** כתבתי תחילה `trimmedKind(meta)` ב-`queue-zero-test.mjs` שקורא את `trimmed.captureCheck` בעצמו.
  לפני שהרצתי משהו ראיתי שזה עותק של ה-classifier שמדלג על בדיקת ה-status שלו (לכידה גזומה שההבאה האחרונה שלה נכשלה הייתה נשפטת
  כ-js-shell), ושה-classifier כבר קורא את השדה. החזרתי את הקובץ ל-HEAD (`git checkout -- scripts/queue-zero-test.mjs`, הקובץ שלי בלבד)
  וכתבתי את השינוי הקטן.
- **regex שגוי בבדיקה של סגירה 3:** ציפיתי ל-"( M research/…)" אבל `historyOf` עושה `trim()` לפלט של `git status --porcelain`, כך שהרווח
  המוביל של " M" נעלם. תיקון הבדיקה (לא הקוד). ניסיון ראשון לתקן ב-`sed` לא תפס בגלל ה-escaping של הלוכסנים ההפוכים; תיקנתי ב-python
  עם בדיקת ייחודיות.
- **אין עוד:** אף מוטציה לא שרדה (סעיף 6), ואף הרצה לא נכשלה מלבד הבדיקה שלמעלה.

## 6. בדיקות ופעולות ולידציה

| בדיקה | תוצאה |
|---|---|
| `scripts/verify.sh` ממוקד (robots-verdict, queue-zero-test, trim-capture, prize-terms-audit, frozen-citations, mutation-plans), לפני ה-commit | exit 0 (typecheck 0; 6 קבצים, 268 בדיקות) |
| `scripts/verify.sh` מלא על `503e6dd` | exit 0 (typecheck 0; 80 קבצים, 2759 עברו, 2 דולגו; 115 s, לצד שתי תוכניות מוטציות) |
| `scripts/verify.sh` ממוקד (אותם שישה) ומלא על `da3f062`, המצב הסופי | exit 0 ו-exit 0 (268 בדיקות; 80 קבצים, 2759 עברו, 2 דולגו, 81 s, לבד) |
| `node scripts/robots-verdict.mjs --recheck` (dry) על המאגר האמיתי, מתוך ה-worktree | exit 3 (ראו למטה) |
| `node scripts/trim-capture.mjs` (dry) על המאגר האמיתי | exit 3, `git status` נקי (שום דבר לא נכתב) |
| `node scripts/mutate.mjs --check --allow-dirty` על שלוש התוכניות | 106/106, 37/37, 54/54 would apply |
| `robots-verdict.json` ב-`scripts/sim-tree.sh` (TMPDIR בתיקיית ה-scratch) | 106 הוחלו, **106 נהרגו**, 0 שרדו, 0 timeout; 748 s; sim-tree exit 0, העץ הוסר |
| `queue-zero-test.json` ב-sim-tree | 37 הוחלו, **37 נהרגו**; 249 s; sim-tree exit 0 |
| `trim-capture.json` ב-sim-tree | 54 הוחלו, **54 נהרגו**; 414 s; sim-tree exit 0 |
| grep השם (`git grep -n -i -E` על שני חצאי הדפוס) על כל קובץ ששונה, וחיפוש כתובות דואר בשורות שנוספו | exit 1 שניהם (לא נמצא דבר), לפני כל commit |

- **`--recheck` על המאגר האמיתי:** שורת הפתיחה `robots-verdict --recheck: 18 NO_TERMS_ROBOTS_OK site(s); queued paths from research/rendered/urls.txt,
  research/measurements/ai-allowed-events.urls.txt (dry run; --apply writes)`; 18 שורות `unchanged` — 12 "the live capture … is the bytes of the
  frozen copy …" (agenthon, aicrowd, alignmentforum, crunchdao, drivendata, eurocontrol, geminixprize, health-data-hub, ijcai, k12-ai-infrastructure,
  sophelio, wundernn) ו-6 "answered 404, as the frozen copy … did (404): no rules either way" (bcamlc, learn2design2026, microblink, pasteurlabs,
  solafune, thinkonward); `totals: 18 site(s): 18 unchanged, 0 unreachable, 0 refresh, 0 revert, 0 error, 0 disallowed-path`; `dry run: nothing written`.
  כלומר `judgeRobots` על כל נתיב שבתור עכשיו, בשתי הרשימות, מתיר את כולם בכל 18 האתרים. הבדיקה של המאגר האמיתי ב-`robots-verdict.test.ts`
  (exit 3, רק unchanged/unreachable) עוברת כמו שהיא.
- **`trim-capture.mjs` על המאגר האמיתי:** `copying allowed 1, barred 11, unread 120`; 657 לכידות, 46 של 10 אתרים copying-barred; `totals: 46 capture(s)
  … 0 would be trimmed …, 44 already trimmed, 2 with nothing in the tree, 0 refused alone; 0 … would be re-trimmed …`; אף שורת `REFUSED` ואף שורת
  `uncommitted:`.
- **הבדיקות החדשות נכשלות על הקוד הישן:** בדיקת `queue-zero-test` מול `HEAD:scripts/queue-zero-test.mjs` נכשלה עם "no plain capture at
  research/rendered/terms-trimshell.meta.json with its terms-trimshell.html" (בדיוק הסיבה השגויה). לשתי האחרות מעידות המוטציות: T59-DP1
  (התוצאה מושתקת = הקוד הישן של ענף unchanged) ו-T59-T2 (dry run שמסרב = הקוד הישן) נהרגו.
- **מוטציות שהבריף ביקש, וזהותן:** "the new outcome suppressed" = T59-DP1; "the exit code for it 3 instead of 0" = T59-DP2; "--apply writing on it"
  = T59-DP3; "the block ignored" = T59-Q1; "the kind read from the wrong field" = T59-Q2 (ב-`capture-check.mjs`, סעיף 4); "--apply no longer refusing
  an uncommitted capture" = T59-T1. כולן נהרגו.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **סקריפט עריכה חד-פעמי עם `rep(find, replace)` שבודק ייחודיות** נכתב שוב, שש פעמים בבנייה הזו (קוד, כותרות, בדיקות, תוכניות). יומן טיק
  58 ביקש את אותו הדבר: `scripts/edit-unique.mjs --file <f> --find-file <a> --replace-file <b>` (או plan JSON בפורמט של `mutate.mjs`, אבל
  מחיל לצמיתות) היה חוסך את כולם ואת שבירת ה-escaping של `sed`.
- **בדיקה שבדיקה חדשה נכשלת על הקוד הישן** נעשתה ביד: העתקת הקובץ החדש הצידה, `git show HEAD:<file> > <file>`, הרצה, החזרה. `mutate.mjs`
  עושה את זה בדיוק למוטציה אחת; אפשרות `--revert-to <ref>` (להריץ את הבדיקות על גרסת ה-ref של קובץ אחד ולשחזר) הייתה מחליפה את זה.
- **הוספת רשומות לתוכנית מוטציות** (קריאה, `push`, כתיבה באותה הזחה, `--check`): `mutate.mjs --add <entry.json> --plan <plan>` שמוסיף ובודק
  שה-find חל, היה מונע עריכה ידנית של JSON.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `robots-verdict.mjs` כולו (876 שורות) בשלושה חלקים, כשהשינוי נגע בשלושה מקומות; נחוץ חלקית (`recheckSite` והיסטוריה), אבל
  `isRecheckOf`/`beforeRechecks` לא היו נחוצים לסגירה.
- הדפסה של כל ה-task list החיצוני (רשימת טיקים של ה-thread הראשי) שחזרה בתזכורות המערכת — לא בשליטתי, אבל ארוכה.
- עיצוב `trimmedKind` שנזרק (סעיף 5): כתיבה, diff והחזרה.
- הרצת `--recheck` על המאגר האמיתי פעמיים (פעם אחרי שינוי הקוד, פעם אחרי ה-commit לצורך הדוח); הפלט זהה.

## Review fixes

הסוקר (Opus) מצא שלושה ממצאי "fix" ושתי הערות, בלי חוסם. תיקנתי את שלושת ממצאי ה-fix, והרגתי גם את שלוש המוטציות ששרדו אצלו
(R59-3, Q59-5, T59R-4), כל אחת ברשומה בתוכנית של הסקריפט שלה. הענף לא זז: `origin/claude/new-session-j071dx` עדיין על `f2fc8bc`, ולכן
לא היה מה למזג.

**1. התרופה ל-`disallowed-path` לא ניקתה אותו.** הכותרת, שורת הקונסולה ו-`research/rendered/README.md` אמרו "pause the line". אבל
`queuedPaths` קורא שורת `# paused … URL<TAB>slug` כנתיב בתור, כי `judgeSite` שופט שורות מושהות בכוונה. לכן שורה מושהית הייתה
מדווחת שוב בכל הרצה, ובדיקת המאגר האמיתי הייתה נשארת אדומה. בשלושת המקומות הניסוח הוא עכשיו: לפרוש את השורה (`# retired …`, ש-
`queuedPaths` לעולם לא קורא כנתיב בתור) או למחוק אותה. השהיה אינה תרופה. שורת הקונסולה היא עכשיו `report only, nothing written: retire the
line or remove it (a paused line is still queued; research/rendered/README.md)`. בדיקה חדשה מראה ששורה מושהית עדיין מדווחת (exit 0,
`(paused; "Disallow: /search")`), ושורה שפרשה או נמחקה מחזירה `unchanged` עם exit 3.

**2. עמוד על host שהמקור לא מצטט הסתיר נתיב אסור.** `judgeRobots` נעצר ב-host הראשון שאין לו קריאת robots.txt (`no-capture`,
`refused`, `unreachable`) לפני שהוא שופט נתיב כלשהו. הענף של robots.txt שלא השתנה הפך כל kind שאינו `disallowed` ל-`unchanged`.
את זה שחזרתי כבדיקה אדומה לפני התיקון (P2 של הסוקר: exit 3 במקום 0). עכשיו, כשהשיפוט הראשון נכשל באחד משלושת ה-kinds האלה,
השורות של כל עמוד על host בלי קריאת robots.txt מוצאות מהשיפוט, ושאר הנתיבים נשפטים שוב. כך עמוד כזה לא מסתיר נתיב אסור על host
אחר, ושורת האתר אומרת מה לא נשפט: `; not judged, on a host with no robots.txt read: <slug> (<url>) — <why>`. שורת probe של אותו
host (בתור ועוד לא הובאה) אינה עמוד, ואינה נמנית. אתר שאין לו דבר אחר לדווח נשאר `unchanged`, עם exit 3 והסיבה על השורה. בחרתי
בשתי האפשרויות שהסוקר הציע יחד, גם שיפוט מחדש בלי ה-host הזה וגם הסיבה על השורה, כי כל אחת לבדה משאירה חור: בלי שיפוט מחדש
הנתיב האסור מוסתר, ובלי הסיבה השורה לא מראה שעמוד לא נשפט. ה-host המצוטט תמיד קריא, כי `frozenProblem` כבר בדק שה-kind של העותק
הקפוא תואם לציטוט. הכותרת ו-README מתארים את ההתנהגות הזאת במקום ה-"known limit" הקודם.

**3. אין בדיקה ל-host לא מצוטט שנשפט על הלכידה החיה שלו.** הוספתי את P3 של הסוקר כבדיקה. `https://law.example/robots.txt` עם
`Disallow: /nowww`, ועמוד `https://law.example/nowww` בתור, נותנים `disallowed-path` ו-exit 0. כשאותו host מתיר את העמוד, מתקבל
exit 3 בלי "not judged". R59-3 נכנסה לתוכנית כ-T59R-DP6.

**הערות (טריוויאליות ובטוחות, ולכן טופלו):**
- Q59-5: מטא ש-`trimmed` שלו `null` אינה לכידה גזומה, וצריכה את ה-`.html` שלה. נוספו fixture (`terms-trimnull`), בדיקה ורשומה
  T59R-Q6. כמו שהסוקר מדד, אין היום מטא כזו במאגר.
- T59R-4: `git status` שנכשל ב-`historyOf` (כאן אינדקס פגום, `.git/index` = "not an index") נשאר סירוב גם ב-dry run, ואינו
  מסומן `uncommitted`. נוספו בדיקה ורשומה T59R-T4. לפני כן וידאתי ש-`rev-parse --show-toplevel` ממשיך לעבוד עם אינדקס פגום ש-
  `git status` נכשל עליו (exit 0 מול 128).
- לא טופלו, ונשארים פתוחים כמו בדוח הבנאי: נתיב `--js --terms <slug>` (`checkTermsCapture`), ולכידה גזומה שעוברת עריכה ונכשלת על
  "files no longer match its block".

**קבצים:** `scripts/robots-verdict.mjs` (הענף של robots.txt שלא השתנה, הכותרת, שורת הקונסולה), `research/rendered/README.md`,
`src/__tests__/revenue/robots-verdict.test.ts` (שלוש בדיקות חדשות, והצמדת שורת הקונסולה לניסוח החדש),
`src/__tests__/revenue/queue-zero-test.test.ts`, `src/__tests__/revenue/trim-capture.test.ts`, שלוש תוכניות המוטציה, ו-
`src/__tests__/revenue/mutations/README.md` (תיאורים, ספירות וזמנים). שום קובץ אסור לא נגע.

**מוטציות** (כל אחת ב-`scripts/sim-tree.sh`, עם TMPDIR בתיקיית ה-scratch שלי, וכל sim-tree יצא 0 והסיר את העץ שלו):
- `robots-verdict.json`: 115 מתוך 115 נהרגו, ב-857 שניות, ליד שתי התוכניות האחרות. נוספו T59R-DP6 עד DP14, וה-find של T59-DP1
  עבר לשורה החדשה (המוטציה עצמה לא השתנתה).
- `queue-zero-test.json`: 38 מתוך 38, ב-223 שניות.
- `trim-capture.json`: 55 מתוך 55, ב-429 שניות.

**בדיקות:**
- `scripts/verify.sh` ממוקד (robots-verdict, queue-zero-test, trim-capture, prize-terms-audit, frozen-citations, mutation-plans):
  exit 0, 272 בדיקות, לפני ה-commit `210d705` ועל העץ הסופי.
- `scripts/verify.sh` מלא: exit 0, ב-80 קבצים: 2763 עברו ו-2 דולגו (2759 של הבנאי ועוד 4 הבדיקות החדשות), 83 שניות, על העץ הסופי.
- `node scripts/robots-verdict.mjs --recheck` על המאגר האמיתי: exit 3, `18 site(s): 18 unchanged, 0 unreachable, 0 refresh, 0
  revert, 0 error, 0 disallowed-path`, ואף שורה אינה "not judged".
- `node scripts/trim-capture.mjs` (dry run): exit 3. נבדקו 46 לכידות של 10 אתרים: 44 כבר גזומות, ול-2 אין דבר בעץ. אין שורות REFUSED
  או `uncommitted:`, ו-`git status` נשאר נקי.
- grep השם וה-grep לכתובות על כל קובץ ששונה: exit 1, כלומר לא נמצא דבר.

**שגיאות:** `mutate.mjs --check` על `robots-verdict.json` סירב בהתחלה, כי הקובץ לא היה ב-commit. עם `--allow-dirty` הוא מצא ש-T59-DP1
לא חל, כי ה-find שלו השתנה עם השורה. כיוונתי את ה-find מחדש, ואחריו 115 מתוך 115 חלו.

**אסימונים:** בהמתנה לשלוש התוכניות במקביל (כ-14 דקות) הפעלתי Monitor ושלוש לולאות `until`, וזו כפילות. Monitor לבדו היה מספיק
אילו אפשר היה לחכות לו בלי לסיים את התור.
