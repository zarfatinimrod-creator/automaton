# טיק 57 (6.10.2026) — הקריאה השלישית של agenthon.net: מדיניות הרישוי והודעת הפרטיות נקראו, NO_TERMS, exhaustive-negative, ואז NO_TERMS_ROBOTS_OK

בונה Opus, ב-worktree נפרד על הענף `build/tick57-agenthon` (בסיס: `origin/claude/new-session-j071dx` ב-`23e17e7`, ה-commit של
ה-render dispatch של טיק 57, שבו נמצאות שתי הלכידות). לא נגעתי ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`,
`logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, באף `RULING-*.md`, באף קובץ תחת `research/measurements/` ובאף יומן קיים. לא
הורדתי שום דבר מהרשת ולא הפעלתי `gh`. ה-checkout הראשי (`/home/user/automaton`) נשאר על ענפו; הרצתי בו רק `git worktree add`
(ו-`git branch --list` / `git worktree list` לקריאה).

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש (משימה מחושבת של workflow, לא הודעת בעלים) לבצע את הפסיקה שלו (טיק 57, 6.10) על שתי הקריאות של
`terms-agenthon-licensing` ו-`terms-agenthon-privacy` (קורא Opus אחד ומאמת אדברסרי Opus אחד לכל מסמך; כל הארבעה: NO_TERMS
למסמך, copying "unread"):

- **הפסיקה**: agenthon.net הופך ל-**NO_TERMS, exhaustive-negative**: מתוך סט ארבעת המסמכים (Official Competition Rules, Terms of
  Participation, Privacy Notice, Data & Software Licensing Policy) כל מסמך דמוי-תנאים נקרא על עותק קפוא ואף אחד אינו תנאי שימוש
  באתר; ה-Official Competition Rules (/rules/) הם כללי האירוע עצמו, מושא מכשיר הפרס לפי BOARD-LOOP §13, ונקראים במסגרתו. פריטים
  פתוחים: תנאי האתרים של SQA או Stony Brook; טבלאות המובילים הציבוריות נושאות שמות משתתפים (המנגנון ממסך כתובות בלבד). copying
  נשאר "unread".
- **בדיקת ה-robots** (ZERO-TESTS שורה 247) חוזרת להיות פעילה; `robots-verdict.mjs ... --apply` מותר רק אם הלכידה הנשפטת היא
  לכידת ה-robots של 6.10 והפסק הוא NO_TERMS_ROBOTS_OK; אם הוחל — הפניית ה-source לעותק הקפוא.
- שישה שלבים: הקפאה; `terms-verdicts.json` דרך `serializeVerdicts`; `urls.txt` (השהיית שתי השורות כנקראו, הפעלת הבדיקה, רענון
  הערות ההשהיה); הערת הביקורת (סעיף שלישי חדש ושורות היסטוריה מתוארכות) ו-ZERO-TESTS; בדיקות ומוטציות; בדיקות סיום.

## 2. הפעולות המרכזיות שביצעתי

1. יצרתי את ה-worktree; `git log --oneline -1` הראה `23e17e7`, ו-`products/` ו-`src/revenue/` קיימים; קישרתי `node_modules`.
2. קראתי את קובץ הקריאות במלואו (קורא ומאמת לכל מסמך, כולל `noteCorrections`), את יומני טיק 56 וטיק 57 (eurocontrol), את הכותרות
   של `robots-verdict.mjs`, `freeze-capture.mjs`, `urls-pause-comments.mjs`, `loop-edit.mjs`, `sim-tree.sh`, `prize-dispatch.mjs`,
   ואת השורות המצוטטות בשני העותקים הקפואים.
3. **בסיס ירוק**: ארבעה קבצי בדיקה על הבסיס (עם העותקים הקפואים החדשים): exit 0, 127 בדיקות.
4. **הקפאה**: `freeze-capture.mjs terms-agenthon-licensing` ו-`terms-agenthon-privacy` (dry-run ואז אמיתי, עם `--why`): שני
   עותקים `-2026-10-06`, זהים בייט לבייט ללכידות (`cmp` על `.txt` ו-`.html`); `FROZEN.sha256` +6 שורות.
5. **הפסק**: סקריפט scratch (`set-agenthon.mjs`) שמייבא `serializeVerdicts`, בודק round-trip בייט לבייט ושהקובץ זהה לבסיס, כותב
   את הרשומה החדשה (NO_TERMS; source בצורת הבית עם שני העותקים הקפואים ואחריו `; TERMS_PENDING before: ` וה-source של טיק 56;
   note שנפתחת ב-"exhaustive-negative: " עם הפסיקה, הממצאים, הפריטים הפתוחים ומשפט ה-copying; checked 2026-10-06; copying
   "unread"), בודק שרק שורות 26, 27, 29 השתנו ושאף רשומה אחרת לא זזה, וכותב את ה-fixture
   `terms-verdicts-23e17e7-agenthon-fold.json` (רשומת agenthon.net בבסיס).
6. **dry run של `robots-verdict.mjs`** (exit 0, הקבצים לא השתנו, נבדק ב-`sha256sum -c`): שפט את הלכידה החיה
   `research/rendered/robots-agenthon.txt` (fetched 2026-10-06T07:15:41.847Z, sha256 54048ccab842 — אותם בתים כמו העותק הקפוא
   `robots-agenthon-2026-10-06.txt`, `cmp` זהה, ואותו sha256 ב-meta), הדף האחד `https://www.agenthon.net/?ref=mlcontests` מותר
   (`Allow: /`), "would set agenthon.net to NO_TERMS_ROBOTS_OK". שני התנאים התקיימו.
7. **`urls.txt`**: `queue-zero-test.mjs --apply-verdicts` (dry-run: "would pause 2 line(s): terms-agenthon-licensing,
   terms-agenthon-privacy", ואז אמיתי); שלוש עריכות של שורה אחת דרך סקריפט scratch (`urls-line.mjs`: השורה הישנה פעם אחת
   בדיוק, ה-URL וה-slug זהים, `cmp` של שאר הקובץ לפני ואחרי): סיבת ההשהיה של שתי השורות ל-"terms read: ...", והחזרת שורת הבדיקה
   לצורתה לפני טיק 55 (`https://www.agenthon.net/robots.txt\trobots-agenthon`, נבדק מול `git show 7439a31^`).
8. **`--apply`**: `robots-verdict.mjs agenthon.net --urls research/measurements/ai-allowed-events.urls.txt --apply` (exit 0). אחר כך
   `repoint.mjs` (scratch): בודק שמה שנכתב הוא בדיוק `judgeSite` על הלכידה החיה, שה-meta והגוף של העותק הקפוא זהים ללכידה החיה
   (url, fetchedAt, sha256, byteLength, status, contentType, truncated, error, הגוף), מריץ `judgeSite` על העותק הקפוא, ומוודא שרק
   הנתיב שונה, שרק שורה 27 השתנתה ושהקובץ כבר לא מזכיר את הלכידה החיה.
9. `urls-pause-comments.mjs --check` (exit 1, 3 stale), `--fix --today 6.10.2026` (3 הערות: שורות 806, 810, 812 ל-NO_TERMS_ROBOTS_OK),
   `--check` exit 0 עם `--today` ובלעדיו; `--apply-verdicts --dry-run`: "would pause 0 line(s)".
10. **ZERO-TESTS**: `loop-edit.mjs set-cell --append` (dry-run לכל השלוש ואז כתיבה) לשורות 268, 269 (READ 6.10 (tick 57)) ו-247
    (ACTIVE again ו-VERDICT SET 6.10 (tick 57)); 4 תאים בכל שורה כמקודם.
11. **הערת הביקורת**: 22 עריכות `loop-edit.mjs` דרך `audit-edits.mjs` (scratch, מערך ארגומנטים בצורת `--x=...`; כל עריכה dry-run
    ואז כתיבה): הסעיף החדש "## Terms read, third round (6.10.2026, tick 57)" אחרי פסקת eurocontrol.int של טיק 57; קבוצות הרינדור
    (2, 4), שורת ה-URL, שורת Total, שורת היסטוריה חדשה, משפט הסיום; שורת agenthon.net ומשפט הספירה ב-"Robots verdicts"; תאי
    "Verdict now"/"Lines now" ופסקאות מתוארכות בסעיפי טיק 55 וטיק 56; מצביע מתוארך בפסקת eurocontrol.int של טיק 57.
12. **בדיקות**: `prize-terms-audit.test.ts` — fixture רביעי, `tick57e()`, `tick56()` שנבנה עליו, `ROBOTS_OK_TICK57E`/`ROBOTS_OK_NOW`
    (17/18), `READ3`, תיקון 21 בדיקות שנכשלו כך שיקראו את המצב ההיסטורי, ובלוק חדש "tick 57, third round" (9 בדיקות, CITED3 עם 74
    טווחים). `robots-verdict.test.ts` — בדיקת CLI יבשה ל-agenthon.net ("already NO_TERMS_ROBOTS_OK", exit 3).
13. **מוטציות**: `mutations/robots-verdict.json` — שלוש רשומות T57 עם find מעודכן (A1, A3, A4), שתיים מורחבות (RF2, D2) ו-18 רשומות
    T57B חדשות (46 בסך הכל); `--check` 46/46; ריצה ב-sim-tree (סעיף 6).
14. `verify.sh` ממוקד ומלא, grep שמות, commits.

## 3. קבצים/מערכות ששונו

- `research/rendered/terms-agenthon-licensing-2026-10-06.{html,txt,meta.json}`, `terms-agenthon-privacy-2026-10-06.{html,txt,meta.json}`
  (חדשים) ו-`research/rendered/FROZEN.sha256` (+6 שורות).
- `research/channel-loop/terms-verdicts.json` — agenthon.net בלבד: verdict NO_TERMS_ROBOTS_OK, source (של הסקריפט, מופנה לעותק
  הקפוא; אחרי `; NO_TERMS before: ` ה-source של הקריאה, ואחריו `; TERMS_PENDING before: ` וה-source של טיק 56), note חדשה,
  checked 2026-10-06, copying "unread". אף רשומה אחרת לא מפנה ל-agenthon.net (נבדק ב-grep), ולכן אין תיקון הפניה צולבת.
- `research/rendered/urls.txt` — שורה 768 (הבדיקה) פעילה; 810, 812 מושהות כנקראו; 806 (Terms) — מילת הפסק ב-`--fix`.
- `research/channel-loop/ZERO-TESTS.md` — שורות 247, 268, 269 (תא רביעי בלבד).
- `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` — הסעיף החדש ועריכות ההיסטוריה (סעיף 2, פריט 11).
- `src/__tests__/revenue/fixtures/terms-verdicts-23e17e7-agenthon-fold.json` (חדש, sha256 `70be8076...` מוצמד).
- `src/__tests__/revenue/prize-terms-audit.test.ts` (69 בדיקות), `src/__tests__/revenue/robots-verdict.test.ts` (+1).
- `src/__tests__/revenue/mutations/robots-verdict.json` (46 רשומות) ו-`mutations/README.md` (שורת התוכנית).
- יומן זה.

## 4. החלטות והנחות משמעותיות

- **ההשהיה דרך `--apply-verdicts` ואז ניסוח מחדש**, כמו שורת ה-Disclaimers בטיק 56, ולא שכתוב ישיר: התוצאה הסופית זהה בבייט,
  והסקריפט של הריפו עושה את חלק ההשהיה. הסיבות נוסחו בלי `;` וסוגריים, בצורה ש-`PAUSED` של `urls-pause-comments.mjs` מקבל.
- **הסדר**: הפסק NO_TERMS נכתב לפני ה-dry run (הסקריפט שופט רק אתר NO_TERMS שה-note שלו נפתח ב-exhaustive-negative), ולכן ה-note
  מנוסחת כך שתהיה נכונה בשני המקרים: "the main thread's word is given (tick 57) ... applied only if the capture it judges is that
  6.10 capture and the verdict it would set is NO_TERMS_ROBOTS_OK". הסקריפט שומר את ה-note.
- **חריגה מהיקף התדריך — שורות היסטוריה גם מחוץ לסעיפי טיק 55 וטיק 56.** התדריך ביקש שורות מתוארכות בסעיפי טיק 55 וטיק 56. גם
  "What the reading can render" (כותרת קבוצה 2 ורשימתה, קבוצה 4 כולה, שורת ה-URL, Total, שורת היסטוריה חדשה, משפט הסיום) וגם
  "Robots verdicts (tick 54)" (תא "Verdict now" של agenthon.net ומשפט הספירה) אמרו בזמן הווה דברים שהפכו שקריים, ובדיקות הספירה
  קיימות דורשות אותם. עודכנו בצורת ההיסטוריה המתוארכת של הטיקים הקודמים. גם פסקת eurocontrol.int של טיק 57 (בתוך סעיף טיק 56)
  קיבלה מצביע מתוארך לספירות החדשות (18, 21, 35).
- **שורת "(Left this list on 6.10, tick 55: ...)"** תחת "Now, on robots.txt" הוחלפה בשורת ה-URL הרגילה של agenthon.net (בדיקת
  ה-URL-lines דורשת אותה); ההיסטוריה שלה נשמרת בכותרת הקבוצה ("6.10, tick 54: ... until agenthon.net went back to TERMS_PENDING in
  tick 55").
- **קבוצה 4** חזרה ל-0/0, כמו ב-5.10, ולכן לפי כלל הבדיקה אין אחרי הכותרת "(5.10: ..." — ההיסטוריה כתובה אחרי "since tick 57 (",
  כמו קבוצה 6 בטיק 57.
- **"NO_TERMS exhaustive-negative sites"** — ספרתי את האתרים המבוקרים שהפסק שלהם NO_TERMS והערתם exhaustive-negative: 4 (flagos.io,
  mozilladatacollective.com, situatedevals.org, theemailgame.com), כמו לפני; agenthon.net עבר דרך התווית ויצא ממנה באותו טיק. בכל
  הקובץ: 5 (עם nevo.co.il). הערות שנפתחות ב-"exhaustive-negative" בין המבוקרים: 22 (4 + 18).
- **ניסוח ה-note**: לפי `noteCorrections` של המאמתים (היקף לפי הכותרת ו-:33-35 ולא לפי הטבלה; ציוויים בלי נושא; :134-135 ו-:153-154;
  טבלאות המובילים בדף הבית; קישור "NeurIPS privacy policy"; /rules/ לא נלכד). לא כתבתי שמות צוותים או כתובות; מצוטטות רק שורות
  הכותרת של טבלת המובילים (:281-285: "T1 Coding: teams 1–25 of 73", Rank, Team, Score).
- **הפרסר של ציטוטי טווח**: ":N-M:" נקרא כ-":N" בלבד (הלקח של טיק 56), ולכן נוסח "(:173-177, team names ..." בלי נקודתיים אחרי
  הטווח.
- **fixture רביעי ו-`tick57e()`**: `tick56()` נבנה עכשיו על `tick57e()` (agenthon.net של טיק 56 נשמר עד הקריאה הזו), כך שהבלוקים של
  טיקים 55-57 מחזיקים את מה שהחזיקו. מה שתיאר קבצים (urls.txt, ZERO-TESTS, הערת הביקורת) נבדק במצבו הנוכחי, עם הערכים הקודמים
  מתוארכים לידו.
- **eurocontrol.int — לא בהיקף, לדיווח**: פסקת טיק 57 שלו אומרת "the page has not been fetched", אבל `23e17e7` (ה-dispatch של טיק 57)
  לכד את `prize-www-eurocontrol-int-air-navigation-services-perf-fd12ebb3`, ו-`prize-dispatch --skip-captured` מדלג עליו. לא שיניתי
  את המשפט (התדריך לא ביקש, והקריאה של הלכידה הזאת היא של ה-thread הראשי).
- **/rules/**: השער מעביר אותו עכשיו (דף של אתר NO_TERMS_ROBOTS_OK), אבל הוא לא באף רשימת פרסים (לא ב-fixture ולא ברשימה החיה), ולכן
  אין שורה לשגר; לפי הפסיקה הוא נקרא במסגרת מכשיר הפרס.

## 5. שגיאות וניסיונות שנכשלו

- הבדיקה של `set-agenthon.mjs` שה-source הישן נשמר השוותה את טקסט ה-JSON הסדור (עם מרכאות מוברחות) למחרוזת הגולמית, ונכשלה (dry run,
  לא נכתב דבר); תוקן להשוואה על האובייקט.
- שתי רשומות מוטציה לא היו חד-משמעיות אחרי השינוי: T57-RF2 (המשפט "the copying field ("unread") are kept" מופיע עכשיו גם בפסקת
  ה-probe החדשה) ו-T57B-D2 (נתיב העותק הקפוא של ה-robots מופיע פעמיים ב-source, פעם בהיסטוריה). הורחבו ל-find ייחודי.
- שלוש רשומות T57 (A1, A3, A4) הפסיקו לחול כי הטקסט שהן מחפשות השתנה (20/17 → 21/18); עודכן ה-find, אותה כוונה.
- ריצת ה-`verify.sh` הממוקדת הראשונה רצה בלי `TMPDIR` לתיקיית ה-scratch, ולכן כתבה את הלוגים שלה ל-`/tmp/verify.97XQBa`. לא מחקתי
  אותה (לא בתיקיית ה-scratch שלי); הריצות הבאות עם `TMPDIR`.

## 6. בדיקות ופעולות ולידציה

כל התוצאות לפי exit code:

| פקודה | exit | הערה |
| --- | --- | --- |
| ארבעה קבצי בדיקה על הבסיס (אחרי ההקפאה) | 0 | 127 בדיקות |
| `node scripts/freeze-capture.mjs terms-agenthon-licensing` / `terms-agenthon-privacy` (`--dry-run`, ואז עם `--why`) | 0 | שני עותקים, `cmp` זהה ללכידות |
| `node scripts/capture-check.mjs` על שתי הלכידות ושני העותקים | 0 | ok, 11850 ו-11591 תווים |
| `node <scratch>/set-agenthon.mjs` (dry ואז `--write`) | 0 | שורות 26, 27, 29 בלבד; fixture נכתב |
| `node scripts/robots-verdict.mjs agenthon.net --urls research/measurements/ai-allowed-events.urls.txt` (dry) | 0 | ראו הפלט למטה; `sha256sum -c` על terms-verdicts.json ו-urls.txt: OK |
| `node scripts/queue-zero-test.mjs --apply-verdicts --dry-run` ואז אמיתי | 0 | would pause / paused 2: terms-agenthon-licensing, terms-agenthon-privacy |
| `node <scratch>/urls-line.mjs` ×3 (dry ואז `--write`) | 0 | `cmp` של שאר הקובץ זהה בכל אחת |
| `node scripts/robots-verdict.mjs agenthon.net --urls research/measurements/ai-allowed-events.urls.txt --apply` | 0 | `set agenthon.net to NO_TERMS_ROBOTS_OK` |
| `node <scratch>/repoint.mjs` (dry ואז `--write`) | 0 | שורה 27 בלבד |
| `node scripts/urls-pause-comments.mjs --check --today 6.10.2026` (לפני ה-fix) | 1 | 3 stale (806, 810, 812) |
| `node scripts/urls-pause-comments.mjs --fix --today 6.10.2026` | 0 | 3 comments rewritten |
| `node scripts/urls-pause-comments.mjs --check` (עם `--today 6.10.2026` ובלעדיו) | 0 | 0 stale |
| `node scripts/queue-zero-test.mjs --apply-verdicts --dry-run` (סופי) | 0 | would pause 0 line(s) |
| `loop-edit.mjs set-cell` ×3 (ZERO-TESTS) ו-22 עריכות בהערת הביקורת, כל אחת dry ואז אמיתית | 0 כל אחת | |
| `node scripts/freeze-capture.mjs --cited` (לפני ה-commit ואחריו) | 0 | 0 ציטוטים לפי שורה של לכידה פעילה; `git status` זהה לפני ואחרי |
| `node scripts/prize-dispatch.mjs --skip-captured --why` | 0 | 27 עוברות (23 אתרים), 66 נכשלות; שורת agenthon.net עוברת ומדולגת כנלכדת (`skipped 26`); בלי `--skip-captured`: `pass  prize-www-agenthon-net-ref-mlcontests-7f4f65c9  agenthon.net NO_TERMS_ROBOTS_OK`; /rules/ לא באף רשימה |
| `node scripts/mutate.mjs --check --allow-dirty --plan .../robots-verdict.json` | 0 | 46 of 46 would apply |
| `scripts/sim-tree.sh -- node scripts/mutate.mjs --plan .../robots-verdict.json` (TMPDIR=תיקיית ה-scratch, על `5c980e3`) | 0 | 46 applied: 46 killed, 0 survived; 155 שניות; העץ נמחק |
| `scripts/verify.sh` על prize-terms-audit, robots-verdict, frozen-citations, mutation-plans, urls-pause-comments, prize-dispatch, queue-zero-test | 0 | typecheck 0; 7 קבצים, 258 בדיקות (פעמיים: לפני ה-commit ועל המצב הסופי) |
| `scripts/verify.sh` מלא | 0 | typecheck 0; 80 קבצים, 2732 עברו, 2 דולגו |
| grep השמות (`git grep -n -i -E` בדפוס בשני חצאים) על כל הקבצים שהשתנו | 1 | לא נמצא דבר; אין כתובת דוא"ל בשורות שנוספו (הלכידות הקפואות נושאות רק כתובות ממוסכות) |

פלט ה-dry run של `robots-verdict.mjs` (ה-source מקוצר):

```
robots-verdict: agenthon.net (NO_TERMS)
  allowed     prize-www-agenthon-net-ref-mlcontests-7f4f65c9  https://www.agenthon.net/?ref=mlcontests  (active; "Allow: /")
would set agenthon.net to NO_TERMS_ROBOTS_OK (dry run; --apply writes .../research/channel-loop/terms-verdicts.json)
  source: robots.txt read at research/rendered/robots-agenthon.txt (https://www.agenthon.net/robots.txt, fetched 2026-10-06T07:15:41.847Z, sha256 54048ccab842): all 1 queued path allowed for MehudakRenderWatch (scripts/robots-verdict.mjs); ruling research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v); NO_TERMS before: research/rendered/terms-agenthon-licensing-2026-10-06.txt (...
```

הספירות (מהקבצים, דרך `termsGate` וה-fixture): אתרים מבוקרים NO_TERMS_ROBOTS_OK: 18 (17 לפני); כתובות כללים שעוברות על robots:
21 (20); השער מקבל 35 מתוך 101 (34); NO_TERMS exhaustive-negative מבוקרים: 4 (4); TERMS_PENDING מבוקרים: 1, adaptionlabs.ai (2);
הערות בלי מילת סוג: 23 (24).

לפני תיקון הבדיקות, אחרי שינוי הנתונים: `prize-terms-audit.test.ts` נכשל ב-21 בדיקות (בלוקים 45, 54 ×2, 55, 56, 57), ו-`mutation-plans`
נכשל ב-robots-verdict.json (שלוש רשומות T57 שה-find שלהן השתנה).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **`robots-verdict.mjs --cite-frozen`** — בפעם הרביעית (טיק 54, הערת טיק 56, eurocontrol בטיק 57, agenthon.net עכשיו) נכתב סקריפט
  scratch שמפנה את ה-source לעותק קפוא אחרי `--apply`. הסקריפט יכול לקרוא עותק קפוא שה-meta והגוף שלו זהים ללכידה החיה ולכתוב אותו.
- **סימון מסמך תנאים כנקרא** — השהיה עם סיבה, סימון ZERO-TESTS, וביטול השהיה של בדיקה: טיקים 54-57, כל פעם ביד. `mark-terms-read.mjs`
  ו-`urls-pause-comments.mjs --resume` (כבר הוצעו בטיק 56) היו חוסכים את `urls-line.mjs`.
- **מצב היסטורי לכל fold** — `tick54()`, `tick55()`, `tick56()`, `tick57e()`: ארבע פונקציות זהות מעל fixtures, וכל fold מתקן עשרות
  בדיקות "now". `stateAt(fixtures[])` ובדיקות שמתארות את ההיסטוריה פעם אחת היו מקצרות את זה.
- **רשימת CITED לכל טיק** — CITED2 ו-CITED3 נבנו ביד (CITED3 עם סקריפט scratch שמחלץ את הטווחים ומילה מכל אחד). פונקציה ברמת
  המודול שבונה את הרשימה מהטקסטים ומשווה למילים מוצמדות הייתה מקצרת.
- **עריכות רבות בהערת הביקורת** — 22 קריאות `loop-edit.mjs` דרך סקריפט; מצב `--batch` (הכל ב-dry-run ואז הכל או כלום) עדיין חסר.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `prize-terms-audit.test.ts` (כ-3,850 שורות) בחלקים, ותיקון 21 בדיקות שנכשלו בחמישה בלוקים: הכבד ביותר, ונחוץ.
- קריאת קובץ הקריאות (כ-58 אלף תווים) וסעיפי הערת הביקורת (שורות ארוכות מאוד): נחוץ.
- ניסוח הסעיף החדש והבלוק החדש (הצמדות שלמות של שלוש פסקאות וקבוצה 4).
- ריצת המוטציות (46 רשומות) ב-sim-tree, וריצת `verify.sh` המלאה.
