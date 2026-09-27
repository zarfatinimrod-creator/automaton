# יומן משימה — 27.9.2026 — כלל ה-0 ₪ והאישור הקבוע, בקוד ובמסמכי הבעלים

worktree מבודד (משימה B של ה-workflow), בסיס `df26984`. **לא** נגעתי ב-`MISSION.md`, `logs/CHECKPOINT.md`,
`logs/CHANNEL_LOOP.md` (של החוט הראשי) ולא ב-`state/colony/` (ה-tick השעתי מקמט לשם, קונפליקט בינארי מובטח).

## 1. מה המשתמש ביקש
הבעלים, 27.9.2026, מילה במילה: "תמזג, ויש לך אישור קבוע למזג ולפרסם תחת המותג, אני רוצה להתחיל בלי לבזבז כסף
מתי שהכסף יכנס ואני יראה שזה עובד ומרוויחים אז אני מוכן לשים כסף עד אז תנסה למצוא דרכים שאני לא ישלם כלום
אפילו לא שקל". החוט הראשי רושם את זה ב-`MISSION.md`; המשימה שלי: לעגן את זה בקוד (תקרת ה-float ל-₪0), לתקן כל
מקום שיגיד לבעלים משהו שכבר לא נכון, ולעדכן את `docs/OWNER_STEPS.he.md` + ה-PDF.

## 2. הפעולות המרכזיות שביצעתי
1. **`budget.ts`:** `DEFAULT_OWNER_FLOAT_AGOROT = 0`. כשהתקרה 0, `assertCanSpend` מסרב לכל סכום (גם אגורה) עם
   הודעה שמסבירה את הכלל במילים של הבעלים, שה-₪200 מ-3.9 מושהים עד שהלדג'ר מראה הכנסה **וגם** הבעלים אומר,
   ושרק הבעלים מעלה (`setOwnerFloatIls`). כותרת הקובץ נכתבה מחדש (היסטוריה נשמרת, לא נמחקת).
2. **`owner-steps.ts`:** שדה חדש `frozen` (since/rule/why/costs/freeInstead/returnsWhen) — מוצב על צעד 5 בלבד.
   שדה חדש `precondition` — על צעד 2 (בדיקה מהמקור הרשמי אם הרישום עולה משהו או מחייב תשלום חודשי מינימלי,
   ובקשה רק כשמוצר בתשלום מוכן; בלי שום סכום). צעד 1: האישור הקבוע, "עצור" מבטל, ו-PR #3 (`61fae4e`).
   פונקציות `isOwnerStepOpen`, `openOwnerStepsForLine`, `frozenOwnerStepsForLine`. **שדה `order` לא שונה** —
   הבדיקות מצמידות אותו לפסק הדירקטוריון; רצף ה-0 ₪ כתוב במסמך כטקסט ו"ממתין לפסיקה מחדש".
3. **`runner.ts` (הדוח):** "Owner steps still open" לא כולל צעד מוקפא, ומוסיף "(not asked now: step 5 frozen by
   the owner's ₪0 rule of 27.9.2026)". מספר ה-blockers לא השתנה (בדיקה קיימת מצמידה אותו).
4. **`portfolio.ts`:** הוסר "Buy the company domain" מה-humanSetup של `il-biz-tools`, ונוסח מחדש ב-`pcn874`;
   ה-operatingLoop של `il-biz-tools` אומר "deploy on *.netlify.app while step 5 is frozen" במקום "deploy under the domain".
5. **`dashboard.ts`:** "הכסף שלך" מציג את כלל ה-0 ₪ כשהתקרה 0, ואת ההערה הישנה רק אם הבעלים העלה אותה.
6. **`criteria.ts`:** הבריף `paid-acquisition-floor` כבר לא אומר לסוקר "We have a total float of ₪200".
   `workflows/colony-criteria-sweep.js` נוצר מחדש (`scripts/gen-sweep-workflow.ts`), שורה אחת השתנתה.
7. **מסמכים:** `OWNER_STEPS.he.md` — תיבת "כלל ה-0 ₪ (27.9)" בראש, רצף החינם (6-Apify, 7, 6-Netlify, 3, 2), צעד 1
   עם PR #3 והאישור הקבוע, צעד 2 עם הבדיקה המוקדמת, צעד 3 "פתיחה חינם, עמלות רק ממכירות, שום מוצר בתשלום לפני 2",
   צעד 5 מוקפא עם מה זה עולה ומה מחליף בחינם, צעד 6 מפוצל, טבלת סיכום. `INCOME_PLAN.he.md` §6 שורה 5.
   `skills/revenue-il-biz-tools/SKILL.md`: הערה שהשער "do not promote before both" נעשה בלי תאריך סיום.
8. **אימות מרחב השם של MCP מהמקור:** `modelcontextprotocol/registry@bf4e88c`,
   `internal/api/handlers/v0/auth/github_oidc.go` — `buildPermissions` נותן `io.github.<repository_owner>/*`.
   כלומר workflow בריפו של הארגון מפרסם תחת `io.github.mehudak`. (ב-`github_at.go`: מרחב של ארגון ניתן ב-OAuth רק
   לבעלים של הארגון.) לא נשמר ל-`research/rendered/` — שם הקבצים נוצרים ב-CI עם meta; ציטוט הקובץ וה-SHA כאן ובקוד.
9. **PDF:** `node scripts/owner-steps-pdf.mjs` רץ (Chromium מ-`/opt/pw-browsers`), 12 עמודים, 417,232 בתים;
   צילום העמוד הראשון נבדק — RTL תקין.

## 3. קבצים/מערכות ששונו
`src/revenue/{budget,owner-steps,runner,portfolio,dashboard,criteria}.ts`,
`src/__tests__/revenue/{budget,owner-steps,runner,dashboard}.test.ts`, `docs/OWNER_STEPS.he.md`,
`docs/OWNER_STEPS.he.pdf`, `docs/INCOME_PLAN.he.md`, `skills/revenue-il-biz-tools/SKILL.md`,
`workflows/colony-criteria-sweep.js` (נוצר), והיומן הזה.

## 4. החלטות והנחות משמעותיות
- **"מוקפא" ≠ "בוצע".** צעד 5 נשאר עם המספר, עם הקווים שלו (`lines`) ועם ההוראות — כדי שיחזור בלי שחזור. רק
  הדוח מפסיק לבקש אותו. `ownerStepsForLine` לא השתנה (בדיקת הניתוב המוצמדת עוברת כמו שהיא).
- **הכנסה לא פותחת את ה-float לבד.** יש בדיקה שמכירה בלדג'ר לא משנה את התקרה. זה התנאי של הבעלים להחליט, לא ההחלטה.
- **המסמך מצטט את הבעלים מילה במילה**, כולל הכתיב שלו, בלי שם.
- **"חינם" של Gumroad:** המודל שלהם אצלנו הוא עמלה לכל מכירה; דף המחירים עצמו לא נשמר מכאן — סומן 🔍.
- **צעד 2:** לא כתבתי שום סכום (גם לא "אפס") — המקור הרשמי לא נשמר. השורה "מס הכנסה וביטוח לאומי חלים בכל מקרה"
  קיימת מקודם ונשארה.
- **מה לא שיניתי, בכוונה (החלטות של הדירקטוריון):** קריטריון ההריגה של `il-biz-tools` ("under ₪200 in 30 days
  after 90 days live **with the domain deployed**") — עם דומיין מוקפא השעון שלו לא מתחיל לעולם; שער הקידום
  ב-SKILL.md; הבסיס המבוקר ב-`TARGET_BASIS` ("buy the domain" כתנאי ל-SEO); `products/mcp-il-tools/server.json`
  שעדיין `com.mehudak/il-tools` ו-`websiteUrl: https://mehudak.com`. כולם מסומנים לחוט הראשי.
- רשומות היסטוריות (`docs/REJECTED.md`, מחקר) לא נגעתי.

## 5. שגיאות וניסיונות שנכשלו
- ה-worktree התחיל על `61fae4e` (לא צאצא של `df26984`) — `git reset --hard df26984` כמו שההנחיה אמרה. פעם רביעית.
- פקודת Bash מורכבת (שני heredoc של python ואחריהם tsc) נחסמה על ידי בידוד ה-worktree ולא רצה בכלל; עברתי ל-Edit.
- בדיקה ראשונה של צעד 2 נפלה: `/₪\s?\d/` תפס את המילים "₪0 rule" עצמן. תוקן בבדיקה, לא בטקסט.
- `sweep-workflow.test.ts` נפל כי הקובץ המחולל לא התאים לבריף החדש — נוצר מחדש.
- `colony.ts sync` לא קיים; הפקודה היא `sync-portfolio`.

## 6. בדיקות ופעולות ולידציה
- לפני השינוי: `npx vitest run src/__tests__/revenue` — 32 קבצים, 627 בדיקות, הכול עבר.
- אחרי: `npx vitest run src/__tests__/revenue` — 32 קבצים, **648 עברו, 0 נכשלו** (21 חדשות).
  `pnpm -s typecheck` — יציאה 0. `npx vitest run src/__tests__/skills-hardening.test.ts` — 30/30.
- הרצה על עותק של `state/colony/colony.db` ב-scratchpad: `sync-portfolio` ואז `report` — הדוח מראה "2, 3, 6 (not
  asked now: step 5 frozen…)" ל-`il-biz-tools`, "2, 3, 7, 6 (…)" ל-`pcn874`, ואין "- [ ] Buy the company domain".
  הדשבורד מראה "כלל ה-0 ₪ שלך (27.9)". ה-DB האמיתי לא נגע.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **ה-tick השעתי לא מריץ `sync-portfolio`.** כל שינוי ב-`portfolio.ts` מחייב מישהו להריץ `sync-portfolio` + `report`
  ולקמט `state/colony/`, אחרת הדוח ממשיך להדפיס את הגרסה הקודמת (כאן: "Buy the company domain"). כדאי שה-tick
  יריץ `syncPortfolio` בעצמו בתחילתו.
- תיקון בסיס ה-worktree ידני בפעם הרביעית; כדאי שה-harness יבדוק `merge-base --is-ancestor` לפני שהסוכן מתחיל.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת `OWNER_STEPS.he.md` המלא (32KB) פעם אחת — נחוץ; קריאה חוזרת רק של הקטעים שנערכו.
- חיפוש ראיה ל"Gumroad חינם לפתיחה" ב-research — לא נמצאה; הסתכם בסימון 🔍. זול, אבל אפשר היה לדלג.
- ניסיון חיפוש קוד ב-GitHub API (חסום לריפו הזה) לפני שעברתי ל-raw.githubusercontent.com — קריאה אחת מבוזבזת.
