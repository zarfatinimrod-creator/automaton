# יומן משימה — 28.9.2026 — הכנת `mcp-il-tools` לפרסום בהפעלה אחת

worktree מבודד, ענף `worktree-wf_c2217608-016-1`, בסיס `a91d45e` (ה-worktree התחיל על `327111e`, שאינו צאצא של
`a91d45e`; `git reset --hard claude/new-session-j071dx` כמו שההנחיה אמרה). לא נגעתי ב-`logs/CHECKPOINT.md`,
`logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md` ולא ב-`docs/OWNER_STEPS.he.md`. שום דבר לא פורסם.

## 1. מה המשתמש ביקש
להכין את שרת ה-MCP החינמי (`products/mcp-il-tools`) כך שהפעלה ידנית אחת של workflow תפרסם אותו ל-npm ולרישום
ה-MCP הרשמי — ברגע שהבעלים עשה את צעד 7 (הארגון `mehudak` ב-GitHub הוא הבעלים של הריפו) ואת צעד 9 המוצע (חשבון
npm בשם `mehudak` וסוד `NPM_TOKEN`). בלי לפרסם כלום עכשיו. חמישה חלקים: `server.json` (שם `io.github.mehudak/il-tools`,
בלי `websiteUrl`), `package.json` (`mcpName`, ובלי repository/homepage/author/bugs/contributors), ה-workflow עצמו
(dispatch בלבד, `dry_run` ברירת מחדל true, שומרים לצעדים 7 ו-9, בלי `--provenance`, `mcp-publisher` מגרסה נעוצה),
קובץ בדיקה בשורש, ופסקת "Publishing" ב-README.

## 2. הפעולות המרכזיות שביצעתי
1. **קראתי את מקור הרישום** — שיבוט רדוד של `modelcontextprotocol/registry` ל-scratchpad (ה-API של GitHub חסום
   לריפו הזה; `git clone` דרך ה-proxy עובד). `main` = `bf4e88c`, התג האחרון `v1.8.1` = `f52dc85` (7.8.2026).
   - `internal/api/handlers/v0/auth/github_oidc.go`, `buildPermissions`: טוקן OIDC של GitHub Actions נותן הרשאת
     פרסום על `io.github.<repository_owner>/*` ותו לא.
   - `internal/validators/registries/npm.go`, `validateNPMPackage` (שורות 65-94): מושך
     `registry.npmjs.org/<identifier>/<version>` ודורש ש-`mcpName` שם יהיה שווה ל-`name` של `server.json`. זה המקור
     לשדה `mcpName` ב-`package.json`.
   - `pkg/model/constants.go`: `CurrentSchemaVersion = "2025-12-11"` — ה-`$schema` הקיים נכון.
   - `internal/validators/schemas/2025-12-11.json`: `description` מוגבל ל-**100 תווים**.
2. **ממצא שלא היה בבריף:** התיאור הקיים ב-`server.json` היה באורך 167 תווים. הרצתי את קוד האימות של הרישום עצמו
   (`validators.ValidateServerJSON`, v1.8.1, דרך `go run` בתוך השיבוט ב-scratchpad) על הקובץ הישן:
   `description: length must be <= 100, but got 167`. כלומר הרישום היה דוחה את הקובץ גם אחרי צעדים 7 ו-9. קיצרתי
   ל-99 תווים; אותו קוד מחזיר עכשיו `valid=true issues=0`.
3. **`server.json`:** `name` → `io.github.mehudak/il-tools`, `websiteUrl` הוסר (צעד 5 מוקפא), תיאור מקוצר. הגרסאות
   (0.1.0) לא השתנו ונשארו מתואמות.
4. **`package.json`:** נוסף `"mcpName": "io.github.mehudak/il-tools"`. לא נוספו repository/homepage/author/bugs/contributors.
5. **`products/mcp-il-tools/LICENSE` (חדש):** טקסט MIT עם `Copyright (c) 2026 Mehudak`. `package.json` מצהיר MIT, אבל
   ה-tarball לא הכיל את הטקסט (ממצא N3 בביקורת), ו-MIT מחייב שההודעה תצא עם כל עותק.
6. **`.github/workflows/mcp-il-tools-publish.yml` (חדש):** טריגר `workflow_dispatch` בלבד, קלט `dry_run` בוליאני
   ברירת מחדל true, `permissions: contents: read` ברמה העליונה. שתי עבודות:
   - `npm` (בלי id-token): שני שומרים ראשונים — (א) `github.repository_owner` חייב להיות `mehudak` (צעד 7), (ב)
     `NPM_TOKEN` לא ריק (צעד 9). בריצה אמיתית נכשלים עם הודעה שמציינת את מספר הצעד; ב-dry run ממשיכים עם notice.
     ההודעה **לא מדפיסה** את הבעלים הנוכחי (לוג ציבורי הוא עוד מקום לשם אישי). אחר כך checkout, setup-node 22 עם
     registry-url, `npm ci`, `npm test`, `npm run build`, בדיקת התאמה (שלוש הגרסאות, `mcpName`=`name`,
     `identifier`=שם החבילה, שם תחת `io.github.mehudak/`, אין שדות אסורים), `npm pack --dry-run --json` עם רשימה
     סגורה (dist/, src/, README.md, package.json, LICENSE) ואיסור מפורש על tests/, node_modules/, .env, בדיקת
     `npm view <name>@<version> version` שמדלגת על פרסום של גרסה קיימת, ואז `npm publish --access public` עם
     `NPM_CONFIG_PROVENANCE: "false"` ובלי `--provenance`.
   - `registry` (`needs: npm`, היחידה עם `id-token: write`): מוריד את `mcp-publisher_linux_amd64.tar.gz` מ-`v1.8.1`,
     בודק sha256 מול ערך נעוץ **וגם** מול `registry_1.8.1_checksums.txt` של השחרור, מריץ `mcp-publisher validate`
     (נקודת `/v0/validate` — בלי התחברות, לא שומרת כלום) בשני המצבים, ובריצה אמיתית בלבד: מחכה עד ש-npm מגיש את
     הגרסה עם `mcpName`, `login github-oidc`, `publish`.
   - ב-dry run: הכול רץ חוץ מ-npm publish, ההתחברות לרישום והפרסום לרישום, והסיכום מדפיס מה היה מתפרסם.
7. **הבדיקה `src/__tests__/revenue/mcp-il-tools-publish.test.ts` (45 בדיקות):** 19 בדיקות מבנה על הטקסט המנותח
   (yaml) ו-26 שמריצות בפועל את צעדי השומרים והבדיקות של ה-workflow ב-bash, עם `npm` מדומה ב-PATH, מול fixtures
   בתיקייה זמנית.
8. **README:** שורת הסטטוס מתוארכת ("Status on 28.9.2026: not on npm yet"), שם הרישום עודכן, ופסקת "Publishing".
   `products/README.md`: שלוש שורות שהיו שגויות אחרי השינוי (צעד 5 כתנאי, "no `mcp-publish.yml` workflow exists yet").

## 3. קבצים/מערכות ששונו
- חדש: `.github/workflows/mcp-il-tools-publish.yml`, `products/mcp-il-tools/LICENSE`,
  `src/__tests__/revenue/mcp-il-tools-publish.test.ts`, היומן הזה.
- שונה: `products/mcp-il-tools/server.json`, `products/mcp-il-tools/package.json`, `products/mcp-il-tools/README.md`,
  `products/README.md`.
- לא נגעתי: `src/server.ts` (הגרסה 0.1.0 שם כבר תואמת, והבדיקה מצמידה אותה), שום מערכת חיצונית, שום פרסום.

## 4. החלטות והנחות משמעותיות
- **שתי עבודות ולא אחת.** `id-token: write` רק בעבודת הרישום, וה-npm publish בעבודה בלי id-token. בלי טוקן OIDC
  npm לא יכול לייצר provenance גם אם משהו יבקש, וגם "trusted publishing" האוטומטי של npm לא יכול להידלק. זו הגנה
  מבנית נוספת על "בלי `--provenance`" ועל `NPM_CONFIG_PROVENANCE=false`.
- **נעיצת actions לפי תג (`@v4`) ולא לפי SHA** — כי כל שאר ה-workflows בריפו עושים כך; נכתב בהערה בראש הקובץ.
  הבינארי החיצוני היחיד (`mcp-publisher`) נעוץ חזק יותר: שחרור מדויק + sha256.
- **ה-sha256 נקרא מדף השחרור ב-github.com, לא מהקובץ עצמו.** הורדת נכסי שחרור עוברת ל-`release-assets.githubusercontent.com`,
  שה-proxy כאן לא מאפשר; לא ניסיתי לעקוף. קראתי את
  `https://github.com/modelcontextprotocol/registry/releases/expanded_assets/v1.8.1` פעמיים, בשתי שאלות שונות,
  וקיבלתי אותו digest (`a06c9096…43cf2cc`). ה-workflow בודק אותו גם מול קובץ ה-checksums של השחרור, וה-dry run
  מוריד ומאמת — כך שטעות העתקה תתגלה ב-dry run הראשון, לפני כל פרסום.
- **`mcp-publisher validate` רץ גם ב-dry run.** הוא לא אחד משלושת הדברים שההנחיה אמרה לדלג עליהם, והוא בודק את
  `server.json` מול הרישום החי בלי לשמור כלום (`internal/api/handlers/v0/validate.go` קורא רק ל-`ValidateServerJSON`;
  בדיקת הבעלות על npm נעשית רק ב-publish).
- **המתנה ל-npm לפני הפרסום לרישום:** הרישום מושך את הגרסה מ-npm; גרסה שפורסמה לפני שניות עלולה עוד לא להיות מוגשת.
  עד 5 דקות, ואז כישלון עם הוראה להפעיל שוב (ה-npm publish ידלג על גרסה קיימת).
- **LICENSE בשם המותג** — הוספה שלא התבקשה במפורש; הרשימה הסגורה של ה-tarball כללה LICENSE, והביקורת (N3) המליצה.
- **צעד 9 עדיין "מוצע"** — לא קיים ב-`docs/OWNER_STEPS.he.md` (שמונה צעדים) ולא ב-`src/revenue/owner-steps.ts`. ה-workflow
  וה-README קוראים לו "step 9" כמו ההנחיה; ב-`products/README.md` כתבתי "proposed step 9".
- **סטטוס מתוארך ב-README:** ה-README נכנס ל-tarball ויוצג בדף npm. "Not on npm yet" בלי תאריך היה נהיה שקר בדף npm
  מהרגע שהחבילה מתפרסמת; "Status on 28.9.2026" נשאר נכון.
- **טוקן npm:** כתבתי "access token that can publish @mehudak packages" ולא "automation token" — לא בדקתי מכאן
  את סוגי הטוקנים הנוכחיים של npm (npmjs.com לא נקרא), אז לא טענתי סוג מסוים.

## 5. שגיאות וניסיונות שנכשלו
- ה-worktree התחיל על `327111e` — `merge-base --is-ancestor a91d45e HEAD` נכשל; `git reset --hard claude/new-session-j071dx`.
- `api.github.com` ו-`mcp__github__get_release_by_tag` חסומים לריפו של הרישום (מחוץ לרשימת הריפואים של הסשן). לא
  ביקשתי להוסיף ריפו. עבדתי עם `git ls-remote` + שיבוט רדוד + WebFetch לדף השחרור.
- דף השחרור הרגיל (`/releases/tag/v1.8.1`) טוען את הנכסים ב-JS ("error while loading"); `expanded_assets/v1.8.1` עבד.
- `curl` ל-`github.com/.../releases/latest` החזיר 403 מה-proxy; לא נוסה שוב.
- שלוש פקודות Bash נחסמו על ידי בידוד ה-worktree (heredoc מורכב, משתנה שמכיל "GITHUB"); עברתי לקבצי סקריפט ב-scratchpad
  ול-Write.
- **בדיקת המוטציות הראשונה מצאה 4 שורדים מתוך 59:** שומר בעלים שמשווה לשם אחר, צעד `npm view` שהוסר, והסרת `.env` או
  `tests/` מרשימת האיסור — כולם עברו כי הבדיקות חיפשו מילים שמופיעות גם בהודעות השגיאה. תוקן בבדיקות שמריצות את
  הצעדים בפועל (ראו 6).

## 6. בדיקות ופעולות ולידציה
- **TDD:** הבדיקה נכתבה ראשונה — 15 נכשלו (שם, websiteUrl, תיאור 167>100, 12 על workflow שלא קיים), 3 עברו על מצב
  קיים; אחרי השינויים 19/19; בדיקת ה-LICENSE נכשלה לפני שהקובץ נוצר.
- **בדיקת מוטציות (עותק ב-scratchpad תחת /tmp, לא בריפו), `mutate.mjs`:** 71 מוטציות על `server.json`,
  `package.json`, `LICENSE`, `src/server.ts` וה-workflow — **70 נתפסו**. השורדת היחידה שקולה בהתנהגות: הוספת `tests/`
  לתיקיות המותרות, כש-`FORBIDDEN` עדיין דוחה `tests/` (הבדיקה מוודאת שה-tarball עם tests/ נכשל, והוא נכשל).
- **קוד האימות של הרישום עצמו** (v1.8.1, `go run`): `server.json` החדש `valid=true issues=0`; הישן
  `description: length must be <= 100, but got 167`.
- **actionlint 1.7.7** (הותקן ל-scratchpad דרך proxy.golang.org): 0 ממצאים. shellcheck לא מותקן — הסקריפטים נבדקו בהרצה.
- **הרצת הצעדים מקומית** (`run-step.mjs`, `guards.sh`, `checks.sh`, `negatives.sh` ב-scratchpad): השומרים בשש
  הקומבינציות; בדיקת ההתאמה ו-`npm pack --dry-run --json` האמיתי על המוצר (7 קבצים, 8,787 בתים); `npm view` אמיתי
  (`@mehudak/mcp-il-tools@0.1.0` → already=false; `vitest@4.1.11` → already=true); שש שבירות של ההתאמה ושלוש של
  ה-tarball — כולן exit 1.
- `products/mcp-il-tools`: `npm ci`, `npm test` → **2 קבצים, 19/19**; `npm run build` → `dist/israeli.js`, `dist/server.js`.
- שורש: `pnpm typecheck` → exit 0; `npx vitest run src/__tests__/revenue` → **35 קבצים, 881/881**.
- חיפוש שם החשבון האישי בכל הקבצים שנגעתי בהם: אין.
- **לא נבדק (אי אפשר מכאן):** ריצת ה-workflow ב-GitHub Actions עצמו, הורדת הבינארי ובדיקת ה-sha256 שלו, וקריאה
  ל-`/v0/validate` של הרישום החי. ה-dry run הראשון בריפו יבדוק את שלושתם.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **תיקון בסיס ה-worktree בפעם החמישית לפחות.** ה-harness צריך להריץ `merge-base --is-ancestor` ולאפס לפני שהסוכן מתחיל.
- **קידום גרסה של `mcp-il-tools` נוגע בארבעה מקומות** (`package.json`, שני שדות ב-`server.json`, `src/server.ts`).
  הבדיקה תופסת אי-התאמה, אבל סקריפט `bump` קטן היה חוסך את זה.
- **פתוח לחוט הראשי (קבצים שאסור לי לגעת בהם):** `MISSION.md:283` עדיין אומר `com.mehudak/il-tools` ושהדומיין הוא
  תנאי מוקדם לרישום; `docs/OWNER_STEPS.he.md` בלי צעד 9; `src/revenue/owner-steps.ts` ו-`owner-steps.test.ts:424`
  מזכירים `com.mehudak` בהקשר של צעד 5 המוקפא (נכון שם, אבל כדאי להוסיף שהרישום עובר ל-`io.github.mehudak`).
- **נשאר ב-README:** הקישור היחסי `../x402-il-api` (ממצא F10) יהיה מת בדף npm. לא בתחום המשימה.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- ניסיונות API של GitHub (curl ו-MCP) לריפו של הרישום לפני המעבר לשיבוט — שתי קריאות מבוזבזות; היומן של 27.9 כבר
  אמר שה-API חסום.
- WebFetch לדף השחרור הרגיל (נכסים לא נטענים) לפני `expanded_assets` — קריאה אחת מבוזבזת.
- WebFetch לקובץ ה-checksums שהפנה לדומיין חסום — קריאה אחת מבוזבזת.
- סבב מוטציות שני אחרי חיזוק הבדיקות — נחוץ: הסבב הראשון הוכיח שארבע בדיקות היו חלשות.
