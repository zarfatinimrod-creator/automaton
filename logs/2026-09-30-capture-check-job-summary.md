# 30.9.2026 — טיק 35: `capture-check` בתוך `render-watch.yml`, בסיכום של כל ריצה (builder)

## 1. מה המשתמש ביקש
ה-workflow של השרשור הראשי ביקש לחבר את `scripts/capture-check.mjs` ל-`.github/workflows/render-watch.yml`, כך שכל ריצת
render תציין את הלכידות שהיא עצמה שמרה ושאינן דף שנקרא (`status`, `bot-challenge`, `js-shell`, `short`). היום מוצאים אותן
ביד, שבועות אחר כך: בטיק 33, הריצה הראשונה של `--all` מצאה שתי שורות פעילות (EUR-Lex ו-UNESCO) שעונות ב-bot challenge
מאז 29.9.

הדרישות:
- רק הלכידות שהריצה שינתה או יצרה תחת `research/rendered/` (קובץ `*.meta.json` ששונה או חדש). הלוגיקה של git בתוך
  `capture-check.mjs` עצמו, עם דגלים (`--changed`, `--summary`), כך שאפשר לבדוק אותה ב-vitest על מאגר git זמני.
- הצעד כותב ל-`$GITHUB_STEP_SUMMARY` טבלת Markdown קצרה (slug, kind, evidence), או שורה אחת שאומרת שכל לכידה ששונתה
  נקראת כדף, או שלא השתנה כלום. בנוסף, `::warning::` אחד לכל לכידה מסומנת.
- הצעד לעולם לא מכשיל את ה-job ולא חוסם את ה-commit:
  - 3 היא התשובה הצפויה;
  - 2 או קריסה הן אזהרה, והריצה ממשיכה.
- לא כותב כלום תחת `research/`. בלי הרשאות חדשות, בלי סודות ובלי רשת.
- בדיקות למבנה ה-workflow ולדגלים החדשים, בדיקת מוטציה של 5+ מוטציות עם `scripts/mutate.mjs`, ועדכון שלב 0 ב-
  `research/rendered/README.md`.
- בלי push, בלי `git stash`, ובלי לגעת ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`,
  `MISSION.md` או `CLAUDE.md`.

## 2. הפעולות המרכזיות שביצעתי
- **בדיקות קודם:** 15 בדיקות חדשות ב-`capture-check.test.ts`, על מאגר git זמני. כולן נכשלו לפני הקוד (ה-exports לא
  קיימים), ואחרי הקוד כולן עברו.
- **`capture-check.mjs`:**
  - `changedSlugs(dir)`: מריץ `git status --porcelain=v1 -z --untracked-files=all --no-renames -- .` מתוך התיקייה, ומחזיר
    כל `*.meta.json` שנמצא ישירות בה, שהוא modified, staged או untracked, ושעדיין קיים בדיסק.
  - `summaryMarkdown(rows)`: טבלה של השורות שאינן `ok`, או שורה אחת.
  - `warningLine(row)`: פקודת workflow מסוג `::warning::` עם ה-escaping של ה-toolkit.
  - `main`: הדגלים `--changed` ו-`--summary`.
  - ב-`--summary`, ה-Markdown יוצא ל-stdout והאזהרות ל-stderr. ה-runner מפרש פקודות workflow משני הזרמים, והצעד
    "Fail the run" כבר מסתמך על `::error` ב-stderr.
- **`render-watch.yml`:** צעד חדש, "Name the captures this run stored that are not read pages (capture-check)", בין
  צעד ה-fetch לצעד ה-commit:
  - `continue-on-error: true`;
  - `timeout-minutes: 3`;
  - שתי שורות shell: exit 0 או 3 הם תשובה, כל קוד אחר מדפיס `::warning` והצעד יוצא ב-0.
- **בדיקות מבנה:** 4 בדיקות חדשות ב-`render-watch-js.test.ts`:
  - מיקום הצעד (מיד אחרי ה-fetch ומיד לפני ה-commit), בלי `if`, בלי env ובלי token;
  - הצעד כותב רק לסיכום;
  - הצעד לא יכול להכשיל את ה-job: הרצה אמיתית של ה-`run` ב-`bash -e`, עם `node` מזויף שיוצא ב-0/1/2/3/127/137, ועם
    קובץ סיכום שאי אפשר לכתוב אליו;
  - שלב 0 ב-README.
- **סבב מוטציה ראשון (לפני ההרצה):** מצאתי שבדיקת `startsWith(prefix)` לא יכולה להיכשל, כי ה-pathspec `-- .` כבר מגביל
  את הנתיבים לתיקייה. הסרתי אותה, והוספתי fixture שמגן על ה-pathspec: תיקייה אחות `research/renderer/` באותו אורך, עם
  meta באותו שם. הוספתי גם `git mv` מ-staged שמגן על `--no-renames`.
- **מוטציות:** 21 מוטציות ב-`scripts/mutate.mjs`, וכולן נהרגו (הטבלה בסעיף 6).
- **שלב 0 ב-README** עודכן: סיכום ה-job של כל ריצה מפרט עכשיו את הלכידות המסומנות.

## 3. קבצים/מערכות ששונו
- `scripts/capture-check.mjs`: `changedSlugs`, `summaryMarkdown`, `warningLine`, הדגלים `--changed` ו-`--summary`, וכותרת
  התיעוד. ה-CLI הקיים, שורות ה-tab וקודי היציאה לא השתנו.
- `.github/workflows/render-watch.yml`: הצעד החדש, עם הערה שמסבירה למה הוא לפני ה-commit.
- `src/__tests__/revenue/capture-check.test.ts`: 15 בדיקות חדשות.
- `src/__tests__/revenue/render-watch-js.test.ts`: 4 בדיקות חדשות, והשדה `timeout-minutes` בטיפוס `Step`.
- `research/rendered/README.md`: שורת שלב 0.
- `logs/2026-09-30-capture-check-job-summary.md`: הלוג הזה.

## 4. החלטות והנחות משמעותיות
- **הצעד רץ לפני ה-commit, לא אחריו.** לפני ה-commit, `git status` של `research/rendered` הוא בדיוק מה שהריצה כתבה: העץ
  נקי בקצה הענף אחרי צעד ה-pull, ודף שלא השתנה לא כותב כלום (`render-watch.mjs`). אחרי ה-commit העץ נקי, וניסיון push
  חוזר עשוי לעשות rebase ל-HEAD מעל לכידות של ריצות אחרות. אז "מה הריצה הזו שינתה" היה צריך sha שנשמר מראש.
  הלכידות עדיין נשמרות בכל מקרה:
  - קוד 3 הוא תשובה;
  - כל קוד אחר הוא אזהרה;
  - `continue-on-error` מכסה קריסה של ה-shell עצמו;
  - `timeout-minutes: 3` מכסה תקיעה.
- **בלי `if` על הצעד:** הוא רץ בדיוק כשצעד ה-commit רץ (ברירת המחדל `success()`), וצעד `continue-on-error` שנכשל לא משנה
  את `success()` של הצעדים שאחריו.
- **`summaryMarkdown` מסמן escaping** לתווים שהם markup או מפריד תא (`\ ` * _ [ ] < > & | ~`), ומכווץ רווחים לשורה אחת.
  כך ראיה כמו `"<div id=\"root\"></div>"` מוצגת כמו שהיא, ולא נבלעת כ-HTML.
- **לכידה שאי אפשר לקרוא** (meta שמציין קובץ חסר): ב-`--summary` היא שורה ואזהרה משלה, מסוג `unreadable`, והיציאה 2
  כמו קודם. בלי `--summary` היא שורת השגיאה הקיימת ב-stderr.
- **`--changed` בלי שינויים** מחזיר 0 ולא שגיאת שימוש. תיקייה ש-git לא יכול לקרוא מחזירה 2, וב-`--summary` מודפסת גם
  שורה לסיכום.
- **ההערה על מגבלת האנוטציות** ("עשר אזהרות לצעד בזמן הכתיבה") היא מהזיכרון, לא מבדיקה ברשת. הטבלה בסיכום מלאה בכל מקרה.

## 5. שגיאות וניסיונות שנכשלו
- **heredoc עם המילה git:** פקודת bash שכתבה בדיקות דרך heredoc נחסמה על ידי בידוד ה-worktree ("too complex to verify").
  עברתי לכלי Edit.
- **בדיקת `startsWith(prefix)` מתה:** נכתבה בגרסה הראשונה, והתגלתה כמיותרת לפני הרצת המוטציות. הוסרה ב-commit השני.

## 6. בדיקות ופעולות ולידציה
- `npx vitest run src/__tests__/revenue/capture-check.test.ts`: 119 עברו.
- `npx vitest run src/__tests__/revenue/render-watch-js.test.ts`: 68 עברו.
- הרצה על המאגר האמיתי:
  - `node scripts/capture-check.mjs --changed --summary` החזיר "No changed or new capture in research/rendered: nothing to
    check.", exit 0;
  - `--summary eu-dsa-2022-2065 unesco-uis-terms terms-medium trolley-terms-of-service` החזיר טבלה של 3, שלוש אזהרות,
    exit 3.
- `scripts/mutate.mjs --plan` (21 מוטציות, baseline ו-baseline חוזר עברו). כולן נהרגו:

| id | קובץ | מוטציה | תוצאה |
|---|---|---|---|
| C1 | capture-check.mjs | `--untracked-files=all` → `normal` (ריצה ראשונה, תיקייה untracked כולה) | killed |
| C2 | capture-check.mjs | בלי `--no-renames` (שינוי שם ב-staged) | killed |
| C3 | capture-check.mjs | בלי pathspec `-- .` (תיקייה אחות) | killed |
| C4 | capture-check.mjs | meta בתת-תיקייה נספר | killed |
| C5 | capture-check.mjs | meta שנמחק נספר | killed |
| C6 | capture-check.mjs | כשל של git מתעלם | killed |
| C7 | capture-check.mjs | תא בלי כיווץ שורה | killed |
| C8 | capture-check.mjs | `\|` בלי escaping | killed |
| C9 | capture-check.mjs | הסיכום מפרט גם שורות ok | killed |
| C10 | capture-check.mjs | `%` בלי escaping בפקודת workflow | killed |
| C11 | capture-check.mjs | `:` בלי escaping ב-title | killed |
| C12 | capture-check.mjs | `--changed` עם slug מתקבל | killed |
| C13 | capture-check.mjs | כשל git בלי שורת סיכום | killed |
| C14 | capture-check.mjs | אזהרה גם ללכידה ok | killed |
| C15 | capture-check.mjs | מצב רגיל מאבד את שורת השגיאה | killed |
| C16 | capture-check.mjs | בלי שורת ספירה ל-`--changed` | killed |
| Y1 | render-watch.yml | בלי `continue-on-error` | killed |
| Y2 | render-watch.yml | `-eq 3` → `-eq 2` | killed |
| Y3 | render-watch.yml | `\|\|` → `;` (bash -e מכשיל ביציאה 3) | killed |
| Y4 | render-watch.yml | `--changed` → `--all` | killed |
| Y5 | render-watch.yml | בלי הפניה ל-`$GITHUB_STEP_SUMMARY` | killed |

- `scripts/verify.sh` (typecheck וחבילת revenue), על `bae786d`: typecheck יצא ב-0, והבדיקות יצאו ב-0 (57 קבצים, 1743
  עברו ו-1 דולגה). התוצאה: `verify: passed`, exit 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **הכנת מאגר git זמני:** כבר שלוש קבוצות בדיקות בונות מאגר git זמני עם config ריק ו-`GIT_CEILING_DIRECTORIES`: `mutate`,
  `merge-worktree`, ועכשיו `capture-check`. אם תהיה רביעית, כדאי helper משותף ב-`src/__tests__/`.
- **בדיקת צעד `run:`:** מריצים את ה-`run:` של צעד ב-`bash -e` עם פקודה מזויפת על PATH. זה חוזר על עצמו (כאן, ובצעד
  "Fail the run"). אפשר להפוך את זה ל-helper לבדיקות workflow.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- **ניסיון heredoc שנחסם:** כתיבת בלוק בדיקות שלם ב-heredoc, שנדחה וחזר ככלי Edit. זה הבזבוז העיקרי.
- **קריאת קבצים גדולים:** קריאה אחת של `capture-check.mjs` המלא ושל קטע ה-workflow tests. זה נחוץ, והחלק הזול.
