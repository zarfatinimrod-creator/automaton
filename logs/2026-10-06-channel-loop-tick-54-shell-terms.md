# 2026-10-06 — לולאת הערוצים, טיק 54: דפי תנאים-מעטפת שרונדרו פעם אחת (kaggle.com, דואר ישראל) (הבונה)

## 1. מה המשתמש ביקש

ה-thread הראשי (Fable 5.1, טיק 54) ביקש להחיל את פסיקותיו על שני הרינדורים החד-פעמיים במצב js (פסיקה 6.10 שורה 21 (c), החלטה 3(2)-(3)), שנכנסו לתור ב-`c058238` ורונדרו בריצה של `a3cb438`:

- **kaggle.com — BARRED** על שלוש עילות עצמאיות: `:77` (crawl/scrape/spider של כל דף, ידני או אוטומטי, בלי סף ובלי חריג robots.txt/מחקר), `:87` (אין העתקה או פרסום של Content שאינו שלך בלי הסכמת הבעלים; `:89` — זמינות ציבורית לא משנה), `:70` (שימוש פנימי, אישי, לא מסחרי בלבד). copying: "barred". הצטרפות ל-`TERMS_BARRED`, ריטייר של שורת ה-js ב-`urls.txt` בצורה שניתנה (עם דגל ה-js), הקפאת הלכידה המרונדרת (בשם של freeze-capture להעתק שני של אותו slug ואותו יום), הערה שנפתחת ב-"BARRED on access and copying:".
- **דואר ישראל — refusal-type**: הרינדור ענה 403, וזו תשובת האתר; ההערה נפתחת ב-"refusal-type:" (K1) ומתעדת K4 קודם; ריטייר של שורת ה-js; שורת ZERO-TESTS של דף התנאים → RETIRED 6.10 בצורה של שורה 243; שאלת המוצר (תעריף הדואר הרשום) נשארת במקומה, ואין שליפה של שום דף של דואר ישראל עד שעותק של התנאים ב-GitHub נקרא.
- ZERO-TESTS שורה 235 → BARRED בצורה של שורות 236-242; סעיף חדש בהערת הביקורת אחרי "Terms read", ועדכון קבוצות הרינדור (17 שורות הכללים של kaggle עוברות לקבוצה הסגורה); בדיקות; אימות; לוג בעברית.
- כללים: worktree בלבד, בלי `git stash`, בלי רשת, בלי התקנה, בלי רינדור; קבצי לולאה דרך `loop-edit.mjs`; בלי שמות ובלי כתובות דוא"ל בקבצים; trailers בכל commit; שיפוט לפי קודי יציאה.

## 2. הפעולות המרכזיות שביצעתי

1. **הכנה**: worktree על `build/tick54-shell-terms` מ-`origin/claude/new-session-j071dx` בבסיס `a3cb438`; `products/` ו-`src/revenue/` קיימים; קישור `node_modules`.
2. **קריאה**: הכותרת של `scripts/freeze-capture.mjs` (כלל השמות), `queueTermsShell`/`termsGate`/`jsCapturesOf` ב-`scripts/queue-zero-test.mjs`, `serializeVerdicts`, הכותרת של `loop-edit.mjs` ו-`urls-pause-comments.mjs`, החלטה 3 בפסיקה, קובץ הקריאה (`kaggle-reading.json`: הקורא והמאמת), ושלושת קבצי הבדיקות הגדולים.
3. **A — הקפאה**: ה-CLI של `freeze-capture.mjs` סירב (exit 1: `terms-kaggle-2026-10-06` כבר קיים עם בתים אחרים — העתק המעטפת). הכלל של הסקריפט עצמו להעתק שני של אותו slug ואותו יום הוא `<slug>-<day>-<commit>` (הכותרת ו-`cited()`), ולכן סקריפט חד-פעמי בתיקיית ה-scratch קרא ל-`sourceVersion` ול-`freezeCapture` של הסקריפט עם `frozenSlug: "terms-kaggle-2026-10-06-a3cb438"` (ריצה יבשה, אחר כך כתיבה): שלושה קבצים, נרשמו ב-`FROZEN.sha256`, 0 מחרוזות מוסוות, `capture-check` מדרג `ok` (36,788 תווים; ה-reCAPTCHA נקוב ואינו משנה את הסוג), כך שלא היה צורך ב-`--allow-flagged`.
4. **B — פסקי התנאים**: סקריפט node חד-פעמי שמייבא את `serializeVerdicts`: kaggle.com → `BARRED`, מקור שנפתח בהעתק הקפוא ונגמר ב-`; TERMS_PENDING before: ` ובמקור של טיק 45, הערה עם הציטוטים והשורות (`:77`, `:74`, `:87`, `:89`, `:70`, `:57`, `:60`, `:62`, `:103`, `:113`, `:63`, ותיקוני המאמת `:120`, `:78`, `:108`, ו-`:75` שלא נקרא), 17 שורות הכללים מוצמדות ל-`548be52`, copying `barred`; israelpost.co.il → `NO_TERMS` נשאר, checked 2026-10-06, הערה חדשה שנפתחת ב-`refusal-type:`.
5. **C — `TERMS_BARRED`**: רשומה ל-kaggle.com בסוף הרשימה ב-`scripts/render-watch.mjs`, עם ציטוט `:77` וההעתק הקפוא, `:87`, ושורת הערה בצורה של רשומות טיק 54; שום שינוי אחר בסקריפט.
6. **D — `urls.txt`**: אף סקריפט לא כותב שורת `# retired`, ולכן שתי עריכות של שורה שלמה בצורות שניתנו, בסקריפט node חד-פעמי שמוודא התאמה אחת בדיוק לכל שורה. `--apply-verdicts` לא שימש: בריצה יבשה הוא היה עושה pause (לא retire) לשתי השורות.
7. **E — ZERO-TESTS**: `loop-edit.mjs set-cell` על שורות 233 ו-235 (עמודה 4).
8. **F — הערת הביקורת**: `replace-in-line` על כותרות קבוצה 3 וקבוצה 6 ועל שורת ה-Total, `insert-after` לשורת היסטוריה רביעית ("after the terms read and before kaggle.com's js render") ולסעיף "## Shell terms pages rendered once (6.10.2026, tick 54)" (פסקה על החלטה 3, טבלה של שתי שורות, "The reading", "Copying and kinds").
9. **G — בדיקות**: `prize-terms-audit.test.ts` (TERMS_READ, TERMS_LINES עם `js`, `jsReadBefore()`, קבוצות הרינדור, סעיף ה-Terms read תחום עד הסעיף הבא, ובלוק חדש "tick 54: the shell terms pages rendered once (6.10)" עם שש בדיקות), `render-watch-terms-barred.test.ts` (בלוק kaggle.com), `queue-zero-test.test.ts` (המסלול רץ כ-CLI עם `--dry-run` מול ה-store האמיתי לשני ה-slugs ומצפה לסירוב שנוקב בשורה המרוטרת), `frozen-citations.test.ts` (ארבע רשומות LIVE_MENTIONS שאינן תקפות עוד), ושני קבצים שהאימות המלא חשף: `prize-intake-rules.test.ts` ו-`capture-check.test.ts` (סעיף 4).
10. **H — אימות** (סעיף 6), commit `a5e8234`, ואחריו הלוג הזה.

## 3. קבצים/מערכות ששונו

נוספו:
- `research/rendered/terms-kaggle-2026-10-06-a3cb438.{html,meta.json,txt}` (ההעתק הקפוא של הרינדור)
- `logs/2026-10-06-channel-loop-tick-54-shell-terms.md` (הלוג הזה)

שונו:
- `research/rendered/FROZEN.sha256` (שלוש שורות)
- `research/channel-loop/terms-verdicts.json` (kaggle.com, israelpost.co.il)
- `scripts/render-watch.mjs` (רשומה אחת ב-`TERMS_BARRED`)
- `research/rendered/urls.txt` (שתי שורות js → `# retired`)
- `research/channel-loop/ZERO-TESTS.md` (שורות 233, 235)
- `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` (קבוצות 3 ו-6, Total, שורת היסטוריה, סעיף חדש בסוף)
- `src/__tests__/revenue/prize-terms-audit.test.ts`, `render-watch-terms-barred.test.ts`, `queue-zero-test.test.ts`, `frozen-citations.test.ts`, `prize-intake-rules.test.ts`, `capture-check.test.ts`

לא נגעתי: `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, קובצי RULING, `research/measurements/ai-allowed-events*`, ולוגים קיימים. ב-`scripts/queue-zero-test.mjs` לא שונה דבר.

## 4. החלטות והנחות משמעותיות

- **שם ההעתק הקפוא: `terms-kaggle-2026-10-06-a3cb438`, לא `-js`.** ה-CLI מקבל רק `--date` ומסרב להעתק שני של אותו יום; הכלל של הסקריפט עצמו (`<slug>-<day>-<commit>`) הוא מה שהבריף אמר לנקוט במקרה כזה. גם סיבה מעשית: הביטוי `DATED` ב-`frozen-citations.test.ts` (`/-\d{4}-\d{2}-\d{2}(-[0-9a-f]{7,})?$/`) מכיר רק את הצורה הזו, ושם עם `-js` לא היה מזוהה כהעתק קפוא בבדיקות הציטוט.
- **דואר ישראל — ה-meta החי של ה-403 הוא הראיה, ולא הוקפא**, כמו opensky: השורה מרוטרת, ולכן שום רינדור לא כותב עליו. המקור (source) של הפסק לא שונה; checked עודכן ל-2026-10-06.
- **מתח בין הפסיקה לבין ההוראה**: 3(2)(vi) אומר שחסימה נרשמת כ-"shell: rendered once <date>, <what came back>", אבל K1 מוגדר כ-"the terms URL answered 401, 403 or 429". הלכתי לפי פסיקת ה-thread הראשי (refusal-type), שמתיישבת עם הגדרת K1.
- **שורה 233**: היסטוריית 30.9 נשמרה כטקסט רגיל לפני הסטטוס המודגש, כך שהתא נגמר בדיוק בצורה של שורה 243 ("**RETIRED 6.10 (403 to the runner; 16(d) D2(iv)).**").
- **סעיף "Terms read" נשאר היסטוריה**: שורת kaggle שבו עדיין "TERMS_PENDING (shell)", ופסקת ה-copying שבו עדיין "121"; הסעיף החדש מציין את המצב הנוכחי (11 barred, 120 unread), והבדיקה של הסעיף הישן משווה אותו ל-`jsReadBefore()`.
- **כותרת קבוצה 6** הורחבה ל-"Shut by the 6.10 terms fetch and the once-only js render", והבדיקה מצמידה את הקידומת החדשה.
- **בדיקת המסלול מול ה-store האמיתי** נכנסה ל-`queue-zero-test.test.ts` (זו בדיקה של המסלול); הבריף לא נקב בקובץ.
- **שני קבצי בדיקות מחוץ לרשימה**: `prize-intake-rules.test.ts` נכשל בגלל השינוי שלי (ARC ו-BIOHUB הם דפי kaggle, ו-`parseUrlList` מסרב להם עכשיו): הציפייה עודכנה ל-`[BIOHUB, ARC, ZINDI]`, ובדיקת ה-slug רצה על host שאינו חסום. `capture-check.test.ts` היה אדום כבר בבסיס `a3cb438` (commit הרינדור עם `[skip ci]` החליף את `terms-israel-post` ב-meta של 403; אומת ב-`sim-tree.sh --ref` על הבסיס: 2 כשלים): שתי הבדיקות הופנו להעתק הקפוא `terms-israel-post-2026-09-30`, ונוספה בדיקה שהלכידה החיה היא עכשיו `status` עם 403.
- הקוד שמקבל שורת js לאתר TERMS_PENDING מסוג shell נשאר בבדיקה (זה הכלל), ונוספה טענה שאין כרגע אף אתר כזה עם שורת js פעילה.

## 5. שגיאות וניסיונות שנכשלו

- `node scripts/freeze-capture.mjs terms-kaggle --dry-run` → exit 1 ("already exists with other bytes"); נפתר בשם לפי כלל הסקריפט (סעיף 4).
- `loop-edit.mjs replace-in-line --anchor "- **Terms page ..."` → exit 2: ערך שמתחיל ב-"-" נקרא כאופציה; תוקן בצורת `--anchor=...` (כפי שכותרת הסקריפט אומרת).
- הבדיקה החדשה ב-`queue-zero-test.test.ts` נכשלה בפעם הראשונה: לדואר ישראל יש גם את השורה הפשוטה המרוטרת של 30.9; הסינון שונה לשורות שנגמרות ב-`\tjs`.
- `scripts/verify.sh` המלא בפעם הראשונה: exit 1, ארבעה כשלים בשני קבצים (סעיף 4); תוקנו, והריצה השנייה עברה.
- `sim-tree.sh` על הבסיס נכשל כמצופה (exit 1) והשאיר את העץ `/tmp/sim-tree.IyCCzp`: הוא מחוץ לתיקיית ה-scratch (לא הגדרתי `TMPDIR`), ולפי כלל המחיקה לא מחקתי אותו. צריך `rm -rf -- /tmp/sim-tree.IyCCzp`.

## 6. בדיקות ופעולות ולידציה

- `scripts/verify.sh` על שבעת הקבצים שבבריף (prize-terms-audit, queue-zero-test, render-watch-terms-barred, render-watch-js, frozen-citations, urls-pause-comments, robots-verdict): **exit 0**, typecheck exit 0, ‏262 בדיקות (פעמיים: לפני תיקוני האימות המלא ואחריהם).
- `node scripts/freeze-capture.mjs --cited`: **exit 0**, "would repoint 0 citation(s)", שום קובץ לא השתנה.
- `node scripts/urls-pause-comments.mjs --check`: **exit 0** ("0 stale comment(s)"); `node scripts/queue-zero-test.mjs --apply-verdicts --dry-run`: exit 0, "would pause 0 line(s)" (לפני הריטייר: "would pause 2").
- `queue-zero-test.mjs --js --terms-shell --dry-run` לשני ה-slugs מול ה-store האמיתי: **exit 1**, "urls.txt line 744 is already a js line for terms-kaggle ..." ו-"line 739 ... terms-israel-post", ו-`urls.txt` לא השתנה.
- `node scripts/prize-dispatch.mjs --skip-captured --why 2>&1 | grep -c kaggle` → 1: `fail  kaggle.com  17: kaggle.com is in TERMS_BARRED: Kaggle's terms bar using or interacting with the Services in a manner that "“Crawls,” “scrapes,” or “spiders” any page, ..." (research/rendered/terms-kaggle-2026-10-06-a3cb438.txt:77), and copying or publishing any Content not owned by you without its owner's prior consent (:87); ...`.
- `scripts/verify.sh` המלא (כל `src/__tests__/revenue`): בפעם הראשונה exit 1 (4 כשלים), אחרי התיקונים **exit 0**: ‏79 קבצים, 2639 עברו, 2 דולגו.
- `capture-check.mjs` על שלושת ההעתקים: `terms-kaggle-2026-10-06` ‏js-shell, `terms-israel-post-2026-09-30` ‏js-shell, `terms-kaggle-2026-10-06-a3cb438` ‏ok.
- חיפוש השמות (`git grep -n -i -E` על הקבצים ששונו מול הבסיס): exit 1, כלומר שום התאמה.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **העתק קפוא שני של אותו slug ואותו יום**: מצב ה-slug היחיד של `freeze-capture.mjs` מסרב, אף ש-`--cited` יודע לתת `<slug>-<day>-<commit>`. כדאי להחיל את אותו כלל גם במצב היחיד (או `--name` שמחייב את הצורה), כדי שלא יידרש סקריפט חד-פעמי.
- **ריטייר של שורה ב-`urls.txt`**: אין סקריפט שכותב `# retired (...) — <url>\t<slug>[\tjs]`; בכל טיק זו עריכה ידנית. כדאי פקודה ב-`queue-zero-test.mjs` או ב-`loop-edit.mjs` (שורה שלמה, התאמה אחת, דגל ה-js נשמר).
- **עדכון פסקי תנאים**: בכל טיק סקריפט node חדש שמייבא `serializeVerdicts`. כדאי `verdict-set.mjs` שמקבל JSON של שינוי, בודק את סדר השדות ואת מילת הסוג, וכותב.
- **בסיס אדום אחרי commit רינדור עם `[skip ci]`**: בדיקות שקוראות לכידה חיה (`capture-check.test.ts`) נשברות בלי שאיש נגע בקוד. כדאי שבדיקות כאלה יקראו העתק קפוא כבר מההתחלה, או שה-render workflow יריץ את הבדיקות האלה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת `prize-terms-audit.test.ts` (1,906 שורות) בחלקים, ובעיקר בלוק טיק 45 שנשמר לקובץ ונקרא מחדש: הכרחי, אבל הכבד ביותר.
- תזכורות רשימת המשימות של ה-harness שחזרו בהקשר שוב ושוב (לא רלוונטיות לבונה).
- שתי ריצות של האימות המלא (כדקה וחצי כל אחת) ושתי ריצות של שבעת הקבצים: את הכשל של `prize-intake-rules` היה אפשר לצפות מראש ב-grep על "kaggle" בכל הבדיקות לפני הריצה הראשונה.
- ריצת `sim-tree.sh` על הבסיס כדי להוכיח ש-`capture-check.test.ts` היה אדום כבר שם: עלות קטנה, והיא מבדילה בין כשל שלי לכשל שירשתי.

## Review fixes

סקירת Opus של הענף (0b0ad8a) לא מצאה ממצא "blocking" ומצאה ממצא "fix" אחד. הוא טופל ב-cfb2413. קצה הבסיס
`origin/claude/new-session-j071dx` לא זז (עדיין a3cb438, ה-merge-base של הענף), ולכן לא היה מה למזג.

1. **fix — הרשומה של kaggle.com לא תיארה נכון את האימות שלה.** ההערה ב-`terms-verdicts.json` ופסקת "The reading" בהערת הביקורת
   אמרו שהמאמת "corrected four supporting points" וציינו כמסמך שלא נקרא רק את ה-Acceptable Use Policy. ברשומת המאמת
   (`tick54-main/kaggle-reading.json`, `verify`) יש שבע הפרכות, בשורות :120, :118, :70, :78, :77, :88 ו-:113.
   - **ההפרכה ל-:77** מסייגת את הסעיף שהרשומה מכנה מכריע: אפשר לטעון לקריאה צרה יותר (bulk-only), שנשענת על המסייג של :78.
   - **שש ההפרכות האחרות** מתקנות טיעונים תומכים.
   - **התיקון:**
     - ההערה והפסקה מונות עכשיו שבע הפרכות.
     - המשפט על :77 אומר שהסעיף "very likely" חל אך לא באופן חד-משמעי, ושפסק הדין עומד גם בלעדיו, כי :87 ו-:70 חוסמים כל אחד לבדו.
     - שש ההפרכות האחרות מפורטות, כל אחת עם השורה שלה. ההפרכה החדשה לגבי :118 אומרת שהרישיון למשתמשים האחרים נכשל לא בגלל שהרץ
       אינו רשום (:67, :96), אלא בגלל "as permitted by the functionality of the Services", ש-:89 אומר שאינו מסיר שום הגבלה.
     - נוספו כל המסמכים שלא נקראו: ה-AUP (:75), ה-Privacy Policy וה-Community Guidelines (:60), וה-Competition Rules של כל
       תחרות (:104).
     - כל ציטוט נבדק מול העותק הקפוא `terms-kaggle-2026-10-06-a3cb438.txt`.
   - **פסק הדין לא השתנה:** BARRED, ‏copying ‏"barred".
   - **ה-why של kaggle.com ב-`TERMS_BARRED`** (`scripts/render-watch.mjs`, רק בתוך הרשימה) הציג גם הוא את :77 בלי סייג. נוספו לו
     הסייג ו-:70 עם ציטוט, וצוין ש-:87 ו-:70 מספיקים כל אחד לבדו.
   - **אופן העריכה:**
     - `terms-verdicts.json` נכתב דרך `serializeVerdicts`, בבדיקה שהקובץ כבר היה בצורה הזאת ושרק שורה אחת השתנתה.
     - הפסקה בהערת הביקורת נכתבה ב-`loop-edit.mjs replace-in-line`.
     - בפסקה נשאר משפט היסטוריה קצר: "four supporting points" עד התיקון הזה.

**בדיקות.**
- `prize-terms-audit.test.ts`:
  - ב-`KAGGLE_LINES` נוספו שש שורות: ‏:60 (Privacy Policy/Community Guidelines), ‏:67, ‏:96, ‏:104 ו-:118 פעמיים.
  - הבדיקה דורשת שבע הפרכות ואת סייג :77. היא גם דורשת שהקטע "The other six" יתפצל לשש בדיוק, כל אחת עם השורה שלה, ואת רשימת
    המסמכים שלא נקראו. היא אוסרת את "four supporting points" בהערה.
  - אותן דרישות חלות גם על פסקת "The reading" בהערת הביקורת.
- `render-watch-terms-barred.test.ts`: ‏:70 נוסף ל-`CLAUSES`, והבדיקה דורשת את הסייג ואת הציטוט של :70 ב-why.
- לא דולגה ולא נמחקה אף בדיקה.

**הערות שלא טופלו (severity "note"), ונשארות ל-thread הראשי:**
- שורה 233 ב-ZERO-TESTS: הסטטוס של 30.9 שהוסר ממנו ההדגשה.
- ההבדל בין נוסח 3(2)(vi) בפסק לבין refusal-type של Israel Post.
- המיקום של הבדיקות ב-describe חדש.
- רשימת ההעתקים לקיפול 9 (`trim-capture.mjs`).
- `/tmp/sim-tree.IyCCzp` של הבונה: נמצא מחוץ לתיקיית ה-scratch שלי, ולכן לא נגעתי בו. הוא דורש `rm -rf -- /tmp/sim-tree.IyCCzp`
  מה-thread הראשי.

את הערת תוכנית המוטציות כן לקחתי, כי CLAUDE.md דורש את זה: ל-`src/__tests__/revenue/mutations/render-watch.json` נוספו T54-TB1 (ה-probe ‏(b)
של הסוקר: הרשומה של kaggle.com מוערת), T54-TB2 (ה-why בלי הסייג) ו-T54-TB3 (ה-why בלי :70). ה-README עודכן: השורה של התוכנית,
67 רשומות ו-162 שניות.

**ולידציה.**
- `scripts/verify.sh` על שבעת הקבצים: exit 0 (7 קבצים, 262 בדיקות).
- `scripts/verify.sh` המלא: exit 0 (79 קבצים, 2639 עברו, 2 דולגו).
- `node scripts/mutate.mjs --check --allow-dirty --plan .../render-watch.json`: exit 0 (67 מתוך 67 יחולו).
- אחרי ה-commit: `scripts/sim-tree.sh --dir <scratch>/sim-rw -- node scripts/mutate.mjs --plan src/__tests__/revenue/mutations/render-watch.json`:
  exit 0. כל 67 המוטציות נהרגו ואף אחת לא שרדה (162 שניות), והעץ נמחק.
- תשע מוטציות נתונים (D1-D9) רצו כל אחת ב-`mutate.mjs --file --find --replace` (בלי תוכנית ב-scratch), וכולן נהרגו (exit 0):
  - בהערה: seven→four, הסרת "the verdict stands without it", הסרת ה-Privacy Policy/Community Guidelines מהמסמכים שלא נקראו,
    הסרת התיקון של :108, והסרת משפט :77.
  - בהערת הביקורת: seven→four, ‏":87 and :70"→":87", הסרת התיקון של :118, והסרת ה-Competition Rules ‏(:104).
- בסקירה לא שרדה אף מוטציה, ולכן אין מוטציות ששרדו להריץ מחדש.
- `git grep` על השם, על הקבצים שהשתנו: exit 1 (אין התאמה).
- `git status` נקי אחרי כל ריצה.

**אסימונים.** הכבד היה קריאת רשומת המאמת המלאה (`verify` ב-JSON) כדי לספור את ההפרכות ולמפות כל אחת לשורה. זה הכרחי, כי
הממצא היה בדיוק ספירה שגויה. הניסיון הראשון לכתוב את ה-JSON הניח `JSON.stringify(...,1)+"\n"`, ושמירה בסקריפט עצרה אותו
לפני שנכתב משהו. הקובץ נכתב ב-`serializeVerdicts`, בלי שורה ריקה בסוף.
