# 4.10.2026: קיפול שורה 23 בקוד: קו הסרטונים לילדים (פסיקת 4.10, fold actions 5-9)

## 1. מה המשתמש ביקש

סקריפט הזרימה של tick 39 שלח אותי כבונה הקוד (Opus) לקפל לקוד את פסיקת הוועדה של 4.10.2026 על קו היוטיוב לילדים
(`research/channel-loop/RULING-2026-10-04-kids-youtube.md`). הפסיקה מקבלת את `kids-explainers` כניסוי: באנגלית, מסומן
"מיועד לילדים", לילדים שיודעים לקרוא, בלי יעד הכנסה ובלי צעד חדש של הבעלים, ומחכה מאחורי T1.

החלק שלי הוא fold actions 5-9, בסדר בדיקה-ואז-קוד, וכל שער או kill צריך לעבור בדיקת מוטציה ב-`scripts/mutate.mjs`:

- **5:** הניסוי בקוד והקריאה החוזרת של הסימון.
- **6:** G11 ו-G7-k בשער הפרסום.
- **7:** קורא `madeForKids`, החצי של הקוד.
- **8:** סירוב ל-probe של YouTube ב-brand-check, יחד עם רשימת שמות לתת-המותג של הילדים.
- **9:** תגית על כל פריים ב-chart-explainer.

ההגבלות: לעבוד ב-worktree מבודד בלבד. אסור `git stash`, אסור לדחוף, ואסור לערוך את `CHECKPOINT.md`, `CHANNEL_LOOP.md`,
`FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, את הלכידות, את `terms-verdicts.json`, את `freeze-capture.mjs` ואת הפסיקה עצמה. אסור
לגשת לשום אתר חסום, ושום פרט מזהה של הבעלים לא נכתב.

## 2. הפעולות המרכזיות שביצעתי

- **פתיחה:** ה-worktree נפתח על `d88739c`, בסיס ישן בלי הפסיקה. לכן הרצתי `git reset --hard claude/new-session-j071dx`
  והגעתי ל-`cc76b14`. בדקתי שהקבצים הנדרשים קיימים, הרצתי `pnpm install`, וקראתי את `MISSION.md` (כולל סעיף 30.9) ואת
  הפסיקה כולה, 583 שורות.
- **Fold 5, `src/revenue/experiments.ts`:**
  - **הניסוי:** נוסף `KIDS_EXPLAINERS_EXPERIMENT`, עם השערים של T1 כעותק כתוב (§8 rule 3). ל-`ExperimentSpec` נוספו
    `declaresMadeForKids` ו-`firstUploadKill` (`K-T1` מול `K-T1k`).
  - **הקריאה החוזרת:** ל-`ExperimentReadings` נוסף `madeForKidsReadback: ("true"|"false"|null)[]`, ערך אחד לכל העלאה.
  - **מה נגזר מהקריאה:**
    - `false` בקו הילדים: kill `K-mfk-designation`.
    - `null` כשהגיע זמן הקריאה: הסלמה `K-mfk-unmeasured`, ו-`uploadsFrozen` חוסם את ההעלאה הבאה (§10 rule 2).
    - `null` מיום K0 והלאה: `K0-unmeasured`, גם ב-T1 (§10 rule 3).
    - `true` ב-T1: נספר כעקיפה של P-2.
  - **ניסוח מחדש:** ההערה על P-2 נוסחה לפי §8 rule 4, והערת `madeForKidsOverrides` לפי §10 rule 1 (עכשיו יש קורא).
  - **הצמדה:** הניסוי מוצמד ב-hash משלו ב-`kids-explainers-kills.test.ts`. ה-`PINNED_GATES_SHA256` של T1 לא נגעתי בו.
- **Fold 6, `src/revenue/publication-gate.ts`:**
  - **שדות חדשים ב-`VideoManifest`:** `line`, `tags`, `thumbnailBrief`, `madeForKids` ו-`onScreenTagEveryFrame`.
  - **G11:** `null` נכשל. קו הילדים דורש `true`, ו-T1 דורש `false`.
  - **G7-k, רק בקו הילדים:**
    - התסריט פותח ב-`KIDS_SPOKEN_DECLARATION` מילה במילה.
    - התגית שהרנדרר אישר שווה ל-`KIDS_ON_SCREEN_TAG`.
    - התיאור פותח ב-`KIDS_AUDIENCE_SENTENCE` ומיד אחריו `SYNTHETIC_VOICE_DISCLOSURE`.
    - הקול הוא אחד מ-`KIDS_VOICES`, 28 המפתחות החיים של `voices.js`.
    - לינט של מילים שלמות על הכותרת, התיאור והתגיות, לפי הרשימה של ASSESSMENT:402-405 ותבנית העברית מ-:411-415.
    - לינט על בריף התמונה הממוזערת: בלי ילד, דמות, קמע או צעצוע.
    - בדיקה שהקריין לא מציג את עצמו כמורה או כחבר.
  - **G9:** קורא את התקרות של הניסוי של הקו עצמו, ומציין את שמו בהודעה.
  - **רשומת הרישיון:** ל-`trainingData` נוספו ארבע שורות ה-CC BY מהעותק הקפוא של כרטיס המודל (:263, :267, :271, :275).
- **Fold 7, הקורא:**
  - **המודול:** `src/revenue/youtube-madeforkids.ts` בונה בקשת `videos.list` עם `part=id,status` ועד 50 מזהים. הוא מפרק את
    התשובה (וידאו שחסר, או שאין לו בוליאני, נקרא `null` ולא `false`) וממזג את המצב: קריאה אחת לכל העלאה, שלא נדרסת לעולם.
  - **הסקריפט:** `scripts/youtube-madeforkids-readback.ts` מסרב לרוץ בלי `YOUTUBE_DATA_API_KEY`, פונה רק ל-
    `www.googleapis.com`, מסתיר את המפתח בכל פלט, וכותב ל-`state/colony/measurements/<line>-madeforkids.json`.
  - **הבדיקות:** fixtures ל-true, ל-false ולחסר. בדיקה נוספת מוודאת ששום workflow ושום package script לא מריצים את הקורא.
- **Fold 8, ב-commit אחד:**
  - **הסירוב:** `scripts/brand-check.mjs` משמיט את ה-probe של YouTube כש-youtube.com נמצא ב-`TERMS_BARRED` או מסומן
    `BARRED` ב-`terms-verdicts.json`. אם קובץ ההכרעות לא נקרא, ברירת המחדל היא סגירה.
  - **ההדפסה והספירה:** הסקריפט מדפיס את משפט הסירוב של הפסיקה, וסופר "פנוי" לפי שלושה probes. גם `probeStatus` מסרב לכל host
    חסום.
  - **ה-workflow:** הודעת ה-commit של `brand-check.yml` סופרת עכשיו את ה-probes שבאמת נשאלו.
  - **הרשימה:** `research/measurements/kids-subbrand-candidates.txt` עם חמישה שמות.
  - **הערת הציות:** נוספה ל-`t1-subbrand-check.md` אחרי שורה 4, כדי שהפניית הפסיקה ל-`:3` לא תזוז.
- **Fold 9:**
  - **`manifest.py`:** כותב `line`, `madeForKids`, `tags`, `thumbnailBrief` ו-`onScreenTagEveryFrame` מתוך ה-spec, ומשקף את
    שלושת המשפטים המוצמדים. בבדיקת זוגיות מול ה-TS.
  - **`charts.py`:** מצייר את התגית בכל פריים של קו הילדים. `tag_problems()` קורא אותה בחזרה מהפריים, ו-`render_scene_chart`
    מסרב לשמור פריים בלי התגית, עם טקסט אחר, או עם תגית שחוצה שוליים או טקסט אחר.
  - **T1:** ל-`analyses/t1.json` נוספו `line` ו-`madeForKids: false`. ה-fixture של T1 עודכן בשדות החדשים.
  - **בלי spec לילדים:** לא נכתב, לפי §9.

## 3. קבצים/מערכות ששונו

- **קוד:**
  - `src/revenue/experiments.ts`, `src/revenue/publication-gate.ts`.
  - חדש: `src/revenue/youtube-madeforkids.ts`.
  - `scripts/publication-check.ts`, `scripts/brand-check.mjs`.
  - חדש: `scripts/youtube-madeforkids-readback.ts`.
  - `.github/workflows/brand-check.yml`.
- **מוצר:** `products/chart-explainer/{manifest.py,charts.py,README.md,analyses/t1.json}`,
  `tests/{test_manifest.py,test_charts.py}`, `tests/fixtures/t1-manifest.fixture.json`.
- **בדיקות:**
  - חדשות: `kids-explainers-kills.test.ts`, `kids-publication-gate.test.ts`, `youtube-madeforkids.test.ts`, וה-fixtures
    `youtube-videos-list-mfk-{true,false,missing}.json`.
  - עודכנו: `experiments.test.ts`, `t1-made-for-kids-kill.test.ts`, `publication-gate.test.ts`,
    `narration-licence-gate.test.ts`, `publication-check.test.ts`, `brand-check.test.ts`.
- **מחקר:**
  - חדש: `research/measurements/kids-subbrand-candidates.txt`.
  - הערת כותרת ב-`research/measurements/t1-subbrand-check.md`.
- **לא נגעתי:** קבצי `logs/` קיימים, `research/rendered/*`, `terms-verdicts.json`, `freeze-capture.mjs` והפסיקה.

## 4. החלטות והנחות משמעותיות

- **"numbers" בלינט:**
  - **מה נחסם:** הביטוי "learn numbers". המילה החשופה לא נחסמת.
  - **למה:** התיאור של קו הילדים חייב לנקוב במספרים שלו. המשפט המוצמד עצמו אומר "Every number comes from real data", כך
    שחסימת המילה הייתה חוסמת ייחוס כן.
  - **המעמד:** זו קריאה שלי של §2 rule 2. היא כתובה בקוד ומחכה לאישור של הוועדה.
- **עוד מילים בלינט:** הוספתי story/stories, song, rhyme ו-poem בלי תלות בהקשר, כי §2 rule 2 מוציא אותן בקו הזה. חסימה
  שגויה היא הטעות הבטוחה.
- **בדיקת המורה או החבר בתסריט:** הוספתי אותה מ-§2 rule 2, למרות ש-fold 6 לא מנה אותה במפורש.
- **שדות חדשים במניפסט:** `tags` ו-`thumbnailBrief` נוספו כשדות חובה, כי בלעדיהם אין מה לבדוק בלינט. אצל T1 הם `[]` ו-`null`.
  - **בריף ריק:** `thumbnailBrief: null` פירושו שאין תמונה ממוזערת מותאמת, ו-YouTube מציג פריים מהסרטון. זה עובר.
- **קריאה ריקה אחרי העלאה:** `madeForKidsReadback` ריק אחרי ש-`t1Passed` כבר נקבע נחשב העלאה שלא נקראה (`null`), ולא
  מצב נקי.
- **קריאה `true` ב-T1:** נחשבת עקיפה של P-2. הספירה היא `max(madeForKidsOverrides, trues)`. זו הסקה מ-§8 rule 4, ולא
  פסיקה מפורשת.
- **`uploadsFrozen`:** אמת בכל kill, ב-`K-mfk-unmeasured` (§10 rule 2) וב-`K-compute`, שכבר אמר "pause the next upload".
- **ההצמדה של קו הילדים:** ה-hash מחושב על `{id, declaresMadeForKids, firstUploadKill, gates}`, כדי שיהיה שונה מה-pin של
  T1. הערכים הוקלדו ביד מתוך הפסיקה, ולא נקראו מהמודול.
  - **בדיקה צולבת:** אותם שערים, כשהוקלדו ביד, נותנים בדיוק את ה-hash של T1 (`1e1f49d2…`). זה מאשר ש-:108-120 שווים.
- **פרטי הבקשה לקורא:**
  - **החלקים:** `part=id,status`, כי מדריך המפתחים המרונדר אומר "at minimum, the id and status parts"
    (`yk2-dev-made-for-kids-status.txt:192-193`).
  - **רמת הראיה:** כתובת ה-endpoint, מעטפת התשובה והתקרה של 50 מזהים הם הסקה בלבד, עד הקריאה החיה הראשונה ("Not ruled here" 4).
- **מיקום התגית:** מעל הכותרת, מיושרת לימין בשוליים של 5% שהרנדרר כבר שומר.
- **מזהה הקורא:** הסקריפט מקבל `--line` ולא `--experiment`, כמו ה-`YoutubeLine` של השער.
- **מצביעים שזזו:**
  - **המפתחות החיים של `voices.js`:** בעותק הקפוא הם ב-:5-208 (הפסיקה כותבת :7-203). ה-TODO נמצא ב-:210, כמו בטסט הקיים.
  - **השאר נבדקו ונמצאו במקומם:** `render-watch.mjs:426`, `:458`, `terms-verdicts.json:460`, `brand-check.yml:20-25`,
    `narration-licence-gate.test.ts:208` ו-`manifest.py:24`.
- **ה-workflow של brand-check:**
  - **מתי הוא רץ:** ב-push לכל ענף שאינו main שמשנה `*-candidates.txt`, `brand-check.mjs` או את ה-yml.
  - **מה הוא מריץ:** רק את הרשימות שהשתנו.
  - **ההשלכה:** push של הענף הזה יריץ את רשימת הילדים. לכן הרשימה והסירוב נכנסו באותו commit (`727692f`).
  - **הוכחה:** הרצה מלאה של `main()` עם fetch מזויף אישרה שלושה probes ושום פנייה ל-youtube.com.
  - **רשימת T1:** לא נגעתי ב-`t1-subbrand-candidates.txt`, כי שינוי שלה היה מריץ אותה מחדש.

## 5. שגיאות וניסיונות שנכשלו

- **בסיס ישן:** ה-worktree התחיל ב-`d88739c`, בלי הפסיקה, ותוקן ב-reset כפי שהבריף מורה.
- **פקודות שנחסמו:** מגן הבידוד חסם heredoc של Python, לולאות shell, `awk` עם getline, ו-`node --import` עם משתנה. עברתי
  לעריכות בכלי Edit ולפקודות פשוטות.
- **טסטים שתיקנתי:**
  - **ספירת הסרטונים:** ב-fixtures של K0 בטסט הילדים שכחתי את `videosPassedGate: 6`, ו-`K-supply` הרג אותם. תוקן.
  - **regex הצהרה:** ציפה ל-"opens with" במקום "does not open with". תוקן.
  - **בדיקת ה-yml:** אסרה את המחרוזת youtube.com בכל הקובץ, כולל ההערה החדשה. עכשיו היא בודקת רק שורות שאינן הערה.
- **מוטציה ששרדה:** P4 שרדה. הטסט של "השוליים השמאליים" שם את התגית מחוץ לפריים, ולכן `x0 < 0` תפס גם את המוטנט. נוסף
  טסט ששם את התגית בתוך הפריים, 2% מהקצה, משני הצדדים. בהרצה חוזרת P4 נהרגה.

## 6. בדיקות ופעולות ולידציה

- **`scripts/verify.sh`:** exit 0. typecheck 0, ו-vitest על `src/__tests__/revenue`: 64 קבצים, 2083 עברו ו-1 דולג.
- **`scripts/pytest-product.sh chart-explainer`:** exit 0, 180 עברו.
- **`npx vitest run src/__tests__/revenue/frozen-citations.test.ts`:** exit 0, 22 עברו.
- **`grep -rli` על שם הבעלים:** בכל הקבצים שנגעתי בהם, ריק.
- **הרצת `brand-check.mjs` מלאה בלי רשת:** עם fetch מזויף דרך `--import`. התוצאה: שלושה probes, משפט הסירוב, ושום
  youtube.com. היא נשמרה גם כטסט.
- **מוטציות, `scripts/mutate.mjs`:** 89 מוטציות, כולן נהרגו. P4 נהרגה בהרצה החוזרת אחרי הטסט החדש.

| קבוצה | קובץ | מוטציות | נהרגו | שרדו |
|---|---|---|---|---|
| E1-E16 | `experiments.ts`: K-mfk-designation, K-mfk-unmeasured, K0-unmeasured, uploadsFrozen, P-2 מהקריאה, K-T1k, spec, pin | 16 | 16 | 0 |
| G1-G29 | `publication-gate.ts` ו-`publication-check.ts`: G11 ×3, מיפוי קו, G7-k ×17, G9, שורת כרטיס, שלושת המשפטים, `--expect G11`, שדות הטוען | 29 | 29 | 0 |
| R1-R13 | `youtube-madeforkids.ts` והסקריפט: בוליאני, readAt, אי-דריסה, קריאה חוזרת, 50, parts, מזהה, גוף שגיאה, קהל, מפתח, הסתרה, סטטוס, קו | 13 | 13 | 0 |
| B1-B12 | `brand-check.mjs` ו-`brand-check.yml`: סירוב, fail-closed, שני המקורות, `probeStatus`, ברירות מחדל, allFree, Markdown, main, הודעת commit | 12 | 12 | 0 |
| P1-P19 | `charts.py` ו-`manifest.py`: ציור, טקסט, שוליים ×3, חפיפה, שמירה, תגית ב-T1, תגית חסרה, שדות המניפסט, זוגיות ×3, LINES | 19 | 18 + P4 בהרצה חוזרת | 0 |

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **בדיקת `main()` בלי רשת:** הרצת סקריפט עם fetch גלובלי מזויף (`--import`) היא תבנית שימושית. כדאי עוזר משותף ב-
  `scripts/tests/` במקום לכתוב קובץ fake לכל טסט מחדש.
- **תוכניות מוטציה:** כתבתי אותן ביד כ-JSON, בעשרות שורות. כלי שמייצר שלד תוכנית מתוך diff (כל `if`, קבוע ו-regex שנוסף)
  היה חוסך את רוב הזמן.
- **בדיקת מצביעי שורות:** הצלבה של מצביעי שורות בפסיקה מול העץ חזרה כאן שוב. כדאי בודק שמקבל רשימת `path:line` וציטוט ומדווח
  מה זז.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- **קריאת הפסיקה המלאה, 583 שורות, ו-`MISSION.md`:** נחוץ, כי כל עובדה בקוד מצביעה לסעיף.
- **קריאת `publication-gate.ts` במלואו פעמיים** (פעם ב-cat ופעם ב-Read בשביל Edit): כפילות של כ-30KB.
- **רשימת המשימות של הסשן הראשי:** הוצגה שוב ושוב בתזכורות. לא רלוונטית ל-worktree.
- **ניסיונות פקודות שנחסמו:** heredoc, awk ו-`--import` עם משתנה. כל ניסיון עלה סבב.
- **הרצות מוטציה:** 89 מוטציות ושני סבבי בסיס, שרצו ברקע. המחיר הוא בעיקר בזמן, לא באסימונים.

---

# המשך, 4.10.2026: תיקוני הסקירה (Opus, מתקן)

## 1. מה המשתמש ביקש

סקריפט הזרימה של tick 39 שלח אותי כמתקן (Opus) לאותו worktree, עם תשעה ליקויים שהסוקר מצא בבנייה שלמעלה. ההוראה: לתקן
כל ליקוי שעומד, טסט קודם. על כל ליקוי שאני דוחה, לנמק. אחר כך להריץ את `scripts/verify.sh`, את שומר הציטוטים הקפואים ואת
`scripts/pytest-product.sh chart-explainer`, ולהריץ תוכנית `scripts/mutate.mjs` עם מוטציה אחת לכל תיקון. לסיום: commit,
והוספת החלק הזה ליומן. ההגבלות של הבנייה חלות גם כאן: בלי `git stash`, בלי push, בלי לגעת ב-`CHECKPOINT.md` ובשאר הקבצים
האסורים, ובלי פרט מזהה של הבעלים.

## 2. הפעולות המרכזיות שביצעתי

כל הליקויים עמדו, ואף אחד לא נדחה. 7 commits על `worktree-wf_164f72d7-201-2`, אחרי `dc6e556`:

- **ליקוי 1, T1 הוקפא לפני ההעלאה הראשונה (`181d82a`):**
  - **הבעיה:** `uploadDue` נקבע לפי `videosPassedGate > 0`, ולכן T1 הוקפא בלי שום העלאה. הקפאה כזו לא יכלה להשתחרר לעולם.
  - **התיקון:** קריאה ריקה פירושה שאין העלאה. במצב כזה יש רק הערה, בלי הקפאה ובלי הסלמה.
  - **הבסיס בפסיקה:** לפני ההעלאה הראשונה, התנאי המוקדם הוא הקורא עצמו, בנוי ונבדק (§10 rule 1). ההקפאה חלה רק על
    העלאה שקיימת ולא נקראה (§10 rule 2).
- **ליקוי 2, ספירת P-2 לא נוצרה והקורא קרא כל סרטון פעם אחת (`181d82a`):**
  - **השדה הוסר:** `madeForKidsOverrides` נמחק מ-`ExperimentReadings`. ספירת P-2 היא עכשיו מספר ערכי `"true"` בקריאה
    החוזרת, כך שהפלט האמיתי של הקורא לבדו משחרר את T1.
  - **הקורא קורא שוב בכל ריצה:** כל העלאה ברשימה נקראת שוב בכל הרצה. לכל העלאה נשמרים ארבעה דברים:
    - הקריאה הראשונה שנשאה סימון.
    - הקריאה האחרונה, עם הזמן שלה.
    - הקריאה הראשונה שסתרה את ההצהרה של הקו (`contradictedAt`, לא מתאפס לעולם).
    - הפעם הראשונה שסרטון ציבורי הפסיק להיות ציבורי (`leftPublicAt`).
  - **`readbackOf(state, uploads)`:** נותן ערך אחד לכל העלאה ברשימה.
  - **`stayedPublic()`:** עונה על "still public 72 hours later" של K-T1k ושל P2 של T1, מתוך קריאות ה-API.
- **ליקוי 8(b) (`181d82a`):**
  - **בקו הילדים:** `"false"` מוקדם לא נדרס על ידי `"true"` טרי.
  - **בקו של T1:** עקיפה נשארת בספירה גם אחרי הערעור.
  - נוסף טסט לכל אחד מהמקרים.
- **ליקוי 9(a) (`181d82a`):** ההערה על `uploadsFrozen` אומרת עכשיו "MUST read". היא גם אומרת שאין עדיין מפרסם, ושמפרסם לא
  ייבנה בלי לסרב להעלאה כשההקפאה פעילה, עם טסט שמוכיח שהוא מסרב.
- **ליקוי 3, מניפסט ה-release של T1 לא עבר את השער (`dc2b45d`):**
  - **מה נוסף:** חמשת השדות, בלי רינדור מחדש, בדיוק כפי ש-`manifest.py` כותב אותם מ-`analyses/t1.json`. זה התקדים של
    `voicesFile` ו-`modelFile` מ-30.9.
  - **הערות:** הערה לכל שדה ב-`manifest.notes.json`, והערה ב-`T1-PROTOCOL.md:45` שהמעבר של 27.9 היה G1-G10 בלבד.
  - **השומר:** טסט ב-`publication-check.test.ts` מריץ G1-G11 על הקובץ המחויב.
  - **התוצאה:** `publication-check.ts` על הקובץ מחזיר `PASS (0 failure(s))`, exit 0.
- **ליקויים 4, 5 ו-8(a) (`fd101ae`):**
  - **4:** המילה "numbers" חסומה כמילה שלמה, כפי שנפסק.
  - **5:** כל אות עברית (`\p{Script=Hebrew}`) בכותרת, בתיאור, בתגיות, בבריף התמונה הממוזערת או בתסריט נכשלת ב-G7-k.
    בדיקת המילים העבריות שנפסקה נשארת.
  - **8(a):** טסטים ל-`undefined`, `"true"`, `"false"`, `1` ו-`0` בשני הקווים.
- **ליקוי 6, התגית יצאה מהאזור הבטוח אנכית (`a37e682`):**
  - **הבדיקה:** `tag_problems` בודק עכשיו 5% גם למעלה ולמטה.
  - **הפריסה:** בקו הילדים התגית ב-0.93, הכותרת ב-0.875, כותרת המשנה ב-0.815, והגרף בגובה 0.56. ראש התגית נמצא 62 פיקסלים מהקצה.
  - **T1:** נשאר בפריסה של 27.9, וטסט מצמיד אותה.
  - **טסט הפיקסלים:** משווה עכשיו פריים עם תגית לאותו פריים עם תגית מוסתרת.
- **ליקוי 7, BOARD-LOOP (`4b06e3b`):**
  - **שתי העריכות של fold 5:** `:120` מונה את ה-kills של הילדים ואומר ש-K-mfk-unmeasured מקפיא, והורג כ-K0-unmeasured
    מיום 56. ב-`:17`, `types.ts:222` הוחלף ב-`:247`, והערך 3 נמצא ב-`:259`.
  - **מצביעים שהבנייה הזיזה:** חמישה מצביעים ל-`experiments.ts` תוקנו: ב-`:13`, ב-`:64`, ב-`:66`, ב-`:119` וב-`:120`.
- **ליקוי 9(b) ותיקון של "numbers":** ראו סעיף 4 למטה. היומן הוא היסטוריה, ולכן לא מחקתי ממנו. התיקונים נכתבו כאן.

## 3. קבצים/מערכות ששונו

- **קוד:** `src/revenue/experiments.ts`, `src/revenue/youtube-madeforkids.ts`, `scripts/youtube-madeforkids-readback.ts`,
  `src/revenue/publication-gate.ts`, `products/chart-explainer/charts.py`.
- **טסטים:** `experiments.test.ts`, `t1-made-for-kids-kill.test.ts`, `kids-explainers-kills.test.ts`,
  `youtube-madeforkids.test.ts`, `publication-check.test.ts`, `kids-publication-gate.test.ts`,
  `products/chart-explainer/tests/test_charts.py`.
- **ראיות ומסמכים:**
  - `products/chart-explainer/releases/t1/manifest.json` ו-`manifest.notes.json`.
  - `research/faceless-youtube/T1-PROTOCOL.md`, בשורה 45 בלבד. ה-worktree של המסמכים עורך את השורות 71 ואילך, כך שאין חפיפה.
  - `research/channel-loop/BOARD-LOOP.md`.
- **לא נגעתי:** `logs/CHECKPOINT.md` ושאר הקבצים האסורים, `research/rendered/*`, `terms-verdicts.json`,
  `freeze-capture.mjs` והפסיקה.

## 4. החלטות והנחות משמעותיות

- **תיקון לסעיף 4 למעלה, "numbers" בלינט:** הנימוק שנכתב שם שגוי, כפי שהסוקר מצא.
  - **הנימוק:** חסימת המילה הייתה חוסמת את "Every number comes from real data".
  - **למה הוא לא מחזיק:** המשפט הזה ביחיד. הוא חלק מהתסריט המדובר, ולתסריט אין לינט מילים. אף משפט מוצמד בתיאור לא
    מכיל "numbers".
  - **ההחלטה:** המילה חסומה כפי שנפסק. קריאה צרה יותר דורשת אישור של הוועדה.
- **תיקון לסעיף 4 למעלה, "מצביעים שזזו":** הסעיף על המפתחות החיים של `voices.js` הוא לא תזוזה, והוא נסוג.
  - **מה הפסיקה מצטטת:** `voices.js:7-203`. אלה בדיוק השורה הראשונה והאחרונה של `language: "en-…"`, וזה מה שהפסיקה
    מצטטת אותן בשבילו.
- **לפני ההעלאה הראשונה, הערה ולא הסלמה:** הסוקר אפשר הערה או הסלמה שלא מקפיאה, ובחרתי בהערה.
  - **למה הייתה הסלמה:** ההסלמה של 30.9 קיימת כי לא היה אז קורא ("nothing reads status.madeForKids yet").
  - **מה השתנה:** עכשיו הקורא קיים, והוא התנאי המוקדם להעלאה (§10 rule 1).
  - **המחיר של הסלמה:** היא הייתה משאירה את T1 במצב "escalate" עד ההעלאה, בלי שום דבר שהוועדה יכולה לעשות.
  - **מה השתנה בטסטים:** טסט אחד של 30.9 הפך: "unread once a video has passed the gate" דרש הסלמה. עכשיו הוא בודק העלאה
    קיימת שלא נקראה. מקרה של סרטון שעבר שער ולא הועלה נבדק בטסט נפרד, שמוודא שאין הקפאה.
- **ספירת העקיפות, "דביקה" ולא "אחרונה":** הסוקר הציע לספור לפי ה-`"true"` האחרון.
  - **מה בחרתי:** ספירה של כל העלאה שקריאה כלשהי שלה נשאה `"true"`.
  - **למה:** כך P-2 מנוסח ב-`experiments.ts`: "counted when YouTube sets them, whatever the one appeal later decides". ספירה
    לפי האחרון הייתה מאבדת עקיפה שהערעור ביטל.
- **פער נוסף שמצאתי (לא בסקירה):** `readbackOf(state)` החזיר ערך רק להעלאות שהקורא כבר ראה. העלאה שהקורא עוד לא רץ עליה
  הייתה נעלמת, ולא נספרת כ-`null`. עכשיו הפונקציה מקבלת את רשימת ההעלאות, ומחזירה ערך אחד לכל אחת.
- **קריאה אחרונה בלי סימון:** אם הקריאה האחרונה לא החזירה את הסרטון (למשל, פרטי), הקריאה הקודמת לא נמחקת. ההנחה היא
  שמפתח API בלי OAuth לא רואה סרטון פרטי. זו הסקה בלבד, עד הקריאה החיה הראשונה.
- **עברית בקו הילדים:** לא נמצא מקרה לגיטימי. כל מערכי הנתונים שאושרו (C1-C9) באנגלית, וקולות Kokoro באנגלית לא מדברים
  עברית. הבדיקה מכסה רק עברית, לא כל כתב שאינו לטיני, כי זה מה שהפסיקה סוגרת במפורש.
- **5% למעלה ולמטה:** זה השוליים שהרנדרר כבר שומר בצדדים. אין מקור YouTube שנותן מספר, ולכן זו הסקה, וכך זה כתוב בקוד.
- **`BOARD-LOOP.md:17` תתנגש במיזוג:** ה-worktree של המסמכים מוסיף שם את משפט ה-ACCOUNT CAP (fold 10). הפתרון: לקחת את
  הגרסה שלהם, ולהחליף בה את `types.ts:222 maxExperiments` ב-`types.ts:247 maxExperiments, value 3 at :259`. זה כתוב גם
  בהודעת ה-commit.

## 5. שגיאות וניסיונות שנכשלו

- **סביבה בלי numpy:** הרצת `manifest.py` ב-`python3` של המערכת נכשלה. השתמשתי ב-venv של `pytest-product.sh`.
- **טסט ש"חסם את עצמו":** טסט החפיפה "on the title" השתמש במיקום הכותרת של T1 (0.925). אחרי שהכותרת של הילדים ירדה ל-0.875,
  הוא כבר לא בדק חפיפה. עכשיו הוא קורא את `KIDS_HEADER`, ונוסף מקרה עם כותרת המשנה.
- **מדידה ראשונה:** גובה גרף של 0.575 השאיר 5 פיקסלים בין כותרת המשנה לתווית המורמת של גרף היחס. ירדתי ל-0.56, וזה נותן
  13 פיקסלים.

## 6. בדיקות ופעולות ולידציה

- **`scripts/verify.sh`:** exit 0. typecheck 0, ו-vitest על `src/__tests__/revenue`: 64 קבצים, 2121 עברו ו-1 דולג.
- **`npx vitest run src/__tests__/revenue/frozen-citations.test.ts`:** exit 0, 22 עברו.
- **`scripts/pytest-product.sh chart-explainer`:** exit 0, 186 עברו.
- **`npx tsx scripts/publication-check.ts products/chart-explainer/releases/t1/manifest.json`:** `PASS (0 failure(s))`, exit 0.
- **מצביעי BOARD-LOOP:** כל מצביע חדש נבדק ב-`sed -n` מול הקוד.
- **מוטציות, `scripts/mutate.mjs`:** 12 מוטציות, 12 נהרגו. שתי הריצות יצאו ב-exit 0. תוכנית TypeScript אחת, ותוכנית Python
  אחת עם `--cmd "scripts/pytest-product.sh chart-explainer"`.

| מזהה | תיקון | הקובץ | מה המוטציה שוברת | תוצאה |
|---|---|---|---|---|
| F1 | 1 | `experiments.ts` | סרטון שעבר שער בלי העלאה נחשב שוב העלאה שלא נקראה | נהרגה |
| F2a | 2 | `experiments.ts` | ספירת P-2 לא נגזרת מהקריאה החוזרת | נהרגה |
| F2b | 2 | `youtube-madeforkids-readback.ts` | הסקריפט שואל רק על העלאות בלי סימון (קריאה אחת) | נהרגה |
| F2c | 2 | `youtube-madeforkids.ts` | `readbackOf` משמיט העלאה שאין לה רשומה | נהרגה |
| F3 | 3 | `releases/t1/manifest.json` | `madeForKids` של ה-release לא הוכרע | נהרגה |
| F4 | 4 | `publication-gate.ts` | "numbers" מצטמצם שוב ל-"learn numbers" | נהרגה |
| F5a | 5 | `publication-gate.ts` | בדיקת העברית בודקת כתב אחר | נהרגה |
| F5b | 5 | `publication-gate.ts` | התסריט מושמט מבדיקת העברית | נהרגה |
| F6a | 6 | `charts.py` | הבדיקה האנכית חוזרת לקצות הפריים בלבד | נהרגה |
| F6b | 6 | `charts.py` | התגית חוזרת ל-0.968, 21 פיקסלים מהקצה | נהרגה |
| F8a | 8(a) | `publication-gate.ts` | `!== want` → `=== !want`, המוטציה שהסוקר מצא ששרדה | נהרגה |
| F8b | 8(b) | `youtube-madeforkids.ts` | סתירה מחושבת מחדש בכל קריאה | נהרגה |

- **ליקויים 7 ו-9:** תיקונים בטקסט בלבד, בלי מוטציה. 7 נבדק מול הקוד ב-`sed -n`, 9(a) היא הערה בקוד, ו-9(b) היא תיקון
  ביומן.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **מצביעי שורות במסמכים:** בנייה שמזיזה קוד שוברת מצביעים כמו `experiments.ts:NNN` במסמכים חיים. השבר הזה התגלה רק
  בסקירה. כדאי בודק שמוצא כל `path:line` במסמכים החיים (לא בפסיקות ולא ביומנים) ומשווה לציטוט שמור.
- **ראיות מחויבות מול שער שהשתנה:** המניפסט של ה-release נשבר בשקט, כי שום טסט לא הריץ עליו את השער. הטסט נוסף עכשיו.
  כדאי לעבור על שאר קבצי הראיות ש-T1-PROTOCOL מצטט.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- **קריאת הפסיקה והקוד:** קראתי את סעיפים 2-11 של הפסיקה ואת כל הקבצים שנגעו בהם. זה נחוץ, אבל חלק כבר נקרא בבנייה.
- **רשימת המשימות של הסשן הראשי:** הוצגה בתזכורות שוב ושוב, ולא רלוונטית ל-worktree.
- **`measure.py`:** סקריפט מדידה זמני ב-scratch, שתי הרצות. זה זול, וחסך ניחוש של הפריסה.
