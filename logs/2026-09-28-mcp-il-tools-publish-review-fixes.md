# יומן משימה — 28.9.2026 — תיקוני הביקורת על ה-workflow לפרסום `mcp-il-tools`

worktree `wf_c2217608-016-1`, ענף `worktree-wf_c2217608-016-1`, מעל `a0b25c4` (ההכנה של הבונה). לא נגעתי
ב-`logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`, `docs/OWNER_STEPS.he.md`.
שום דבר לא פורסם ולא נדחף; ה-workflow לא הופעל.

## 1. מה המשתמש ביקש
לתקן כל ליקוי משתי ביקורות (אבטחה: 7 ממצאים; רישום: 6 ממצאים) על `.github/workflows/mcp-il-tools-publish.yml`
וקבצי המוצר, ולנמק כאן כל ליקוי שנדחה. להריץ שוב את בדיקות המוצר וה-build, `pnpm typecheck` ואת
`npx vitest run src/__tests__/revenue`, ולבצע commit.

## 2. הפעולות המרכזיות שביצעתי
1. **אימתתי את העובדות לפני שכתבתי אותן:**
   - הריפו הזה **ציבורי** (`api.github.com`: `"private": false`, ענף ברירת מחדל `main`).
   - לפי `github/docs@b5f08dd` (`data/reusables/gated-features/environments.md`, `deployments-and-environments.md`),
     בריפו ציבורי זמינים בכל מסלול: סודות סביבה, הגבלת ענפים ו-required reviewers. סוד סביבה נמסר ל-job רק
     אחרי אישור.
   - לפי `npm/documentation@d1cbe2e`:
     - לפרסום צריך 2FA או טוקן גרנולרי עם "Bypass two-factor authentication".
     - הרשאה "Read and write (stage only)" לא יכולה לפרסם (`E_STAGE_REQUIRED`).
     - **פרסום ישיר עם טוקן גרנולרי יוסר בינואר 2027.**
2. **סידרתי את ה-workflow מחדש בארבע עבודות:**
   - `check` — כל ריצה, בלי סוד ובלי id-token. יש בה שלושה שומרים: בעלים (צעד 7), `main` בריצה אמיתית,
     ו-`NPM_TOKEN` שאסור שיהיה סוד ברמת הריפו או הארגון. אחריהם:
     - `npm ci --ignore-scripts`, בדיקות ו-build;
     - בדיקת התאמה ובדיקת README;
     - אריזה אחת עם `--ignore-scripts`, שמוציאה שם קובץ ו-integrity;
     - בדיקה אם הגרסה כבר ב-npm, ואם כן — האם היא שלנו;
     - העלאת ה-tarball כ-artifact, רק בריצה אמיתית.
   - `registry-validate` — כל ריצה, בלי id-token. מוריד את `mcp-publisher` הנעוץ ומריץ `validate`.
   - `npm-publish` — ריצה אמיתית מ-`main` בלבד, `environment: npm-publish`, `permissions: {}`, בלי checkout
     ובלי setup-node; כל action בה נעוצה ב-SHA. הצעדים, לפי הסדר:
     - שומר שבודק שהסוד קיים;
     - `.npmrc` שקורא את הטוקן מ-`NODE_AUTH_TOKEN`;
     - `npm whoami` חייב להחזיר `mehudak` (משווים את התשובה ולא מדפיסים אותה);
     - הורדת ה-artifact;
     - השוואת sha512 מול ה-integrity מ-`check`, ואז `npm publish "$FILE" --access public --ignore-scripts`;
     - המתנה ב-curl על ה-URL המדויק שהרישום קורא.
   - `registry-publish` — ריצה אמיתית מ-`main` בלבד, אחרי שתי הקודמות, והיחידה עם `id-token: write`.
     רק checkout נעוץ ב-SHA, התקנת הבינארי, `login github-oidc` ו-`publish`, בלי setup-node.
3. **README נכתב למצב שאחרי הפרסום:**
   - אין בו שורת סטטוס מתוארכת, runbook, ה-x402 או קישורים יחסיים.
   - החומר הפנימי עבר ל-`products/mcp-il-tools/MAINTAINING.md` (חדש, לא נארז — נבדק ב-`npm pack`): סטטוס,
     תהליך הפרסום, הנוסח המלא המוצע לצעד 9, מועד ינואר 2027, קידום גרסה, פיתוח, והיחס ל-`x402-il-api`.
   - ה-workflow נכשל על README עם ביטויי סטטוס או מידע פנימי.
4. **`products/README.md`** — שלוש הפניות עודכנו: `MAINTAINING.md` במקום "Publishing", צעד 9 עם הסביבה, ומועד
   ינואר 2027.
5. **הבדיקה `src/__tests__/revenue/mcp-il-tools-publish.test.ts` נכתבה מחדש:** 91 בדיקות (היו 45). חוץ מבדיקות
   המבנה, היא מריצה בפועל כל צעד שהביקורות ציינו, עם stubs ל-npm, curl, sleep ו-uname:
   - שלושת השומרים;
   - ההתאמה, ה-README, האריזה ובדיקת הגרסה הקיימת;
   - שומר הטוקן, `.npmrc` ו-whoami;
   - ההשוואה והפרסום, וההמתנה;
   - התקנת `mcp-publisher` מול tar.gz אמיתי שנבנה בבדיקה.

## 3. קבצים/מערכות ששונו
- שונו: `.github/workflows/mcp-il-tools-publish.yml`, `products/mcp-il-tools/README.md`, `products/README.md`,
  `src/__tests__/revenue/mcp-il-tools-publish.test.ts`.
- חדשים: `products/mcp-il-tools/MAINTAINING.md`, היומן הזה.
- לא נגעתי במערכת חיצונית. לא נוצרה סביבה ב-GitHub ולא הוגדר סוד.

## 4. החלטות והנחות משמעותיות
**ממצאי אבטחה:**
1. **פרסום מכל ענף — תוקן.** השומר `main` נמצא ב-`check`, ושתי עבודות הפרסום נושאות את אותו `if`. הטוקן הוא סוד
   של הסביבה `npm-publish`, והבעלים מגביל אותה ל-`main` ול-reviewer. אם `NPM_TOKEN` קיים גם כסוד ריפו או ארגון,
   כל ריצה נכשלת. הבדיקה משתמשת ב-`${{ secrets.NPM_TOKEN != '' }}` (בוליאני, כך שהסוד לא נכנס ל-job). כותרת
   הקובץ תוקנה: לא רק אדם יכול להפעיל את ה-workflow, אלא כל מי שמחזיק actions:write.
   - **נדחה חלקית: "שתי העבודות תחת environment".** רק `npm-publish` נמצאת בסביבה. סביבה מגינה על **סוד**, וטוקן
     OIDC אינו סוד סביבה: workflow בכל ענף יכול לבקש `id-token: write` בעבודה משלו. סביבה על `registry-publish`
     הייתה מוסיפה עוד לחיצת אישור בלי לסגור שום פרצה. במקום זה, `registry-publish` נושאת את אותו `if` של
     main-בלבד, ורצה רק אחרי ש-`npm-publish` המאושרת הצליחה.
2. **אין בדיקה של מי בעל טוקן ה-npm — תוקן.** נוסף שלב `npm whoami` = `mehudak`, והוא לא מדפיס את התשובה, כדי
   ששם אישי לא יופיע בלוג ציבורי. ב-`MAINTAINING.md`, צעד 9: משתמש npm (לא ארגון) בשם `mehudak`, שנרשם עם תיבת
   המותג מצעד 8.
   - **נדחה: "ריצת ניסיון עם טוקן תדווח את התוצאה".** ריצת ניסיון לא נכנסת לסביבה (זה התיקון של ממצא 1), ולכן
     אין לה טוקן. הריצה האמיתית בודקת את הטוקן לפני הפרסום, וכישלון שם לא מפרסם כלום. סיכום ריצת הניסיון אומר
     שהטוקן לא נבדק בה.
3. **README ישן/פנימי בדף npm — תוקן.** ראו סעיף 2.3.
4. **אמון בגרסה קיימת בלי בדיקה — תוקן.** השלב קורא `npm view --json`:
   - E404 או תשובה ריקה → לא פורסם;
   - כל שגיאה אחרת → כישלון, ולא ניחוש;
   - `_npmUser.name` שאינו `mehudak` → כישלון, בלי להדפיס את השם;
   - `dist.integrity` שונה מהאריזה המקומית → כישלון, עם הוראה לקדם גרסה.

   הנחה שבדקתי: אריזה חוזרת נותנת את אותו integrity (אריזה, build מחדש ו-touch — אותו sha512). אם גרסת npm של
   ה-runner תשתנה בין ריצה לריצה, האריזה עלולה להשתנות. הכשל אז הוא כשל סגור, וההודעה אומרת לקדם גרסה.
5. **טוקן נוכח כשרץ קוד תלויות — תוקן בגרסה ה"טובה יותר" שהמבקר הציע:**
   - `npm ci --ignore-scripts` ו-`npm pack --ignore-scripts` רצים ב-`check`, שאין בה סוד.
   - `npm-publish` מפרסמת את ה-tgz עם `--ignore-scripts`, בלי checkout ובלי node_modules.
   - `.npmrc` נכתב ידנית במקום setup-node, כדי שתרוץ action אחת פחות בעבודה שמחזיקה את הטוקן.

   אימתתי מקומית ש-`npm ci --ignore-scripts`, הבדיקות וה-build עוברים.
6. **id-token גם בריצת ניסיון — תוקן.** ה-validate נמצא בעבודה בלי id-token, ו-login ו-publish נמצאים בעבודה
   נפרדת שרצה רק בריצה אמיתית. בעבודה הזו checkout נעוץ ב-SHA
   (`actions/checkout@11d5960a…` = v4.4.0 = מה ש-`v4` הצביע עליו ב-28.9), ואין setup-node. גם
   `download-artifact` בעבודת הטוקן נעוצה ב-SHA (`d3f86a10…` = v4.3.0 = `v4`). אימתתי ב-`git ls-remote` וב-fetch
   ששני ה-SHA הם commits.
7. **ההערה על הלוג לא הייתה נכונה — תוקן אחרת ממה שהוצע.** הבעלים נקרא מהמשתנה המובנה `GITHUB_REPOSITORY_OWNER`,
   שאינו מופיע בכותרת ה-`env:` של הצעד. ההערה אומרת עכשיו במפורש שהבעלים עדיין מופיע ב-URL של הריצה.
   - **נדחה: `${{ github.repository_owner == 'mehudak' }}`.** השוואת מחרוזות בביטויי GitHub אינה תלוית רישיות,
     ואילו קידומת ההרשאה ברישום תלוית רישיות. `Mehudak` היה עובר את השומר ונכשל רק ב-login. נוספה בדיקה שמוודאת
     ש-`Mehudak` נכשל.

**ממצאי רישום:**
1. **README** — כמו אבטחה 3, כולל שלב בדיקה ב-workflow ובדיקת vitest.
2. **תיאור הטוקן** — תוקן לפי מסמכי npm: "Read and write (publish and stage)", "All Packages", ו-"Bypass
   two-factor authentication" מסומן. הנוסח מופיע בהודעת השומר, ב-`MAINTAINING.md` וב-`products/README.md`.
   **נוסף מה שלא היה בביקורת:** פרסום ישיר בטוקן גרנולרי יוסר בינואר 2027, ולכן הריצה האמיתית צריכה לקרות לפני
   כן. אחרי המועד צריך טוקן stage-only עם `npm stage publish` ואישור, או trusted publishing — ו-trusted publishing
   מצרף provenance. נכתב ב-`MAINTAINING.md` וב-`products/README.md`.
3. **שיטת ה-login לא נעוצה** — תוקן: הבדיקה דורשת שהצעד יכיל בדיוק `"$RUNNER_TEMP/mcp-publisher" login github-oidc`.
4. **שינויים שהבדיקות לא תפסו** — כל 13 השורדים של המבקר נתפסים עכשיו (סעיף 6). ההתאמות:
   - **"ה-`if` של שלב ההמתנה הוא `!inputs.dry_run`"** — ההמתנה עברה ל-`npm-publish`, שחסומה ברמת העבודה. הבדיקה
     מצמידה את ה-`if` של העבודה.
   - **"להריץ את ההמתנה מול npm מדומה"** — ההמתנה עברה ל-curl (ממצא 5), ולכן ה-stub הוא ל-curl ול-sleep.
     ל-`seq` אין צורך ב-stub: `sleep` המדומה מסיים את 30 הסבבים מיד.
5. **ההמתנה בדקה endpoint אחר** — תוקן. ההמתנה מושכת `https://registry.npmjs.org/${NAME//\//%2F}/${VERSION}`,
   כמו `url.PathEscape` של Go, שמקודד רק את ה-`/` (בדקתי ב-`reg/internal/validators/registries/npm.go`). היא
   קוראת `.mcpName` עם jq. הבדיקה מוודאת שה-URL מדויק.
6. **לחוט הראשי, מחוץ לתחום שלי:**
   - `MISSION.md:283` (`com.mehudak/il-tools`);
   - צעד 9 עדיין לא קיים ב-`docs/OWNER_STEPS.he.md` וב-`src/revenue/owner-steps.ts`. הנוסח המוצע המלא (משתמש npm,
     טוקן, סביבה) נמצא ב-`MAINTAINING.md`.

**עוד החלטות:**
- **`npm-publish` תלויה גם ב-`registry-validate`.** אם `server.json` לא עובר את הרישום, לא מפרסמים ל-npm חבילה
  שאי אפשר לרשום.
- **האחראי לאישור (required reviewer):** ב-`MAINTAINING.md` כתבתי את חשבון המכונה מצעד 7 (`mehudak-ci`), וגם
  להפעיל ולאשר ממנו. דף הריצה בריפו ציבורי מציג מי הפעיל. שהוא מציג גם מי אישר — לא אומת, וכך נכתב.
- **actions ב-node20:** `checkout@v4`, `download-artifact@v4` ו-`upload-artifact@v4` כולן `using: node20`, כמו בשאר
  ה-workflows בריפו. לא שיניתי את זה כאן: זו החלטה לכל הריפו.

## 5. שגיאות וניסיונות שנכשלו
- **בדיקה שגויה שכתבתי:** `pack(CLEAN, undefined)` קיבל את ברירת המחדל של הפרמטר, ולכן לא בדק כלום. תוקן ל-`null`,
  ונוסף מקרה `sha1-…`.
- **`npm pack --pack-destination` לתיקייה שלא קיימת נכשל** (בניסוי מקומי). ב-workflow יש `mkdir -p` לפני האריזה.
- **הרצה אחת של חבילת revenue במקביל ל-`pnpm typecheck` דיווחה 34 קבצים / 839 בדיקות, במקום 35 / 927.** לא הצלחתי
  לשחזר את זה: חמש הרצות אחר כך, כולל אחת במקביל ל-typecheck, החזירו 35 / 927. אין לי הסבר.
- `mcp__github__search_repositories` לא החזיר את הריפו. `api.github.com` דרך ה-proxy כן החזיר, וכך נקבע שהריפו ציבורי.
- **הרצתי את `scripts/brand-check.mjs` בטעות**, כי חשבתי שזו בדיקת שמות אישיים בקבצים. זה כלי חיפוש שמות מותג,
  והוא דרס את `research/measurements/brand-candidates.json` בתוצאות 403 מה-proxy. שחזרתי את הקובץ מ-HEAD
  (`git checkout HEAD -- …`) ווידאתי ב-`git diff` שאין הבדל. הקובץ לא נכנס ל-commit.

## 6. בדיקות ופעולות ולידציה
- **`products/mcp-il-tools`:** `npm test` → 2 קבצים, 19/19. `npm run build` → `dist/israeli.js` ו-`dist/server.js`.
  בנוסף, בעותק ב-scratchpad: `npm ci --ignore-scripts`, 18 מתוך 19 עוברים; היחיד שנכשל הוא בדיקת ההשוואה לקובץ
  של x402, שלא קיים בעותק — שאלה של מיקום, לא של `--ignore-scripts`.
- **שורש:** `pnpm typecheck` → exit 0. `npx vitest run src/__tests__/revenue` → **35 קבצים, 927/927**. קובץ
  הבדיקה של הפרסום → 91/91.
- **actionlint 1.7.7:** נקי (shellcheck לא מותקן).
- **בדיקת מוטציות** (`scratchpad/fix016mut/mut.py`, עותק מחוץ לריפו): **58 מוטציות, 57 נתפסו.**
  - בהן כל 13 השורדים של המבקר: `always()`; החלפת סדר login ו-publish; `.name` במקום `.mcpName`; קיצור הלולאה;
    `grep -qx` → `if false`; `v1.7.0`; מחיקת ה-working-directory; ניטרול `validate`; `--tag next`.
  - וגם מוטציות חדשות על השומרים, whoami, השוואת ה-sha512, ה-URL, הצמדות ה-SHA, `NODE_AUTH_TOKEN` על צעד ה-npmrc
    וה-README.
  - **השורד היחיד שקול להתנהגות המקורית:** המוטציה מוסיפה `if [ "${DRY_RUN:-}" = "true" ]; then exit 0; fi` לשומר
    המיקום, אבל לצעד אין `DRY_RUN` ב-env, אז הענף לעולם לא רץ. אותה מוטציה יחד עם מיפוי ה-env **נתפסת** (אומת
    בנפרד).
- **הרצת צעדי `check` עם npm אמיתי** (`scratchpad/fix016real/run.mjs`) על המוצר האמיתי:
  - התאמה ו-README עוברים;
  - האריזה: 7 קבצים, integrity `sha512-WRmA…`;
  - בדיקת הגרסה: ‏E404 אמיתי → `already=false`;
  - אותו צעד מול `vitest@4.1.11`, שקיים ב-npm → כישלון "not published by the npm user mehudak".
- **`npm pack --dry-run` אחרי השינוי:** 7 קבצים, בלי `MAINTAINING.md`.
- **לא נבדק (אי אפשר מכאן):**
  - ריצה ב-GitHub Actions;
  - אישור בסביבה;
  - `npm whoami` מול טוקן אמיתי;
  - `download-artifact` בפועל;
  - ה-login וה-publish ברישום.

  ריצת הניסיון הראשונה בריפו בודקת את `check` ואת `registry-validate`. את השאר תבדוק רק הריצה האמיתית.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **בדיקת מוטציות על workflows נכתבת מחדש בכל סבב** (אצל הבונה, אצל המבקר ועכשיו אצלי). כדאי סקריפט קבוע
  ב-`scripts/`, שמקבל קובץ מוטציות ומריץ קובץ בדיקה על עותק.
- **צעד 9 יושב עכשיו ב-`MAINTAINING.md` ולא במקור האמת (`owner-steps.ts`).** כשהחוט הראשי יכניס אותו, כדאי בדיקה
  שהשמות (`npm-publish`, `NPM_TOKEN`, "Read and write (publish and stage)") זהים בשני המקומות.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- **חיפוש נראות הריפו דרך `search_repositories`** — קריאה מבוזבזת. `api.github.com` ענה ישירות.
- **שיבוט `github/docs` (sparse)** — נחוץ, כי זה מה שקבע שהסביבות זמינות לריפו ציבורי. אבל חיפוש ב-grep אחר ניסוח
  על נראות האישורים לא מצא דבר.
- **ההרצה המקבילה החריגה (34/839)** ושתי הרצות השחזור.
- **`scripts/brand-check.mjs`** — הרצה בלי לקרוא את הכותרת קודם, ואחריה שחזור של קובץ המדידה שנדרס.
