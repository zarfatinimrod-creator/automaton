# 28.9.2026 — הכרעת מסלול הבאונטי (שורה 10) הוחלה בקוד

## 1. מה המשתמש ביקש
סוכן Opus בעץ עבודה מבודד קיבל מהסקריפט של זרימת העבודה: להחיל את §8 של
`research/channel-loop/RULING-2026-09-28-bounty-rail.md` — כל פריט חוץ משניים שהחוט הראשי מחזיק
(`logs/CHANNEL_LOOP.md` ו-`logs/FABLE_QUEUE.md`): `rails.ts` (+ `dashboard.ts` ובדיקות), `oss-bounties` ב-`portfolio.ts`,
`bounties/{policy,supply,supply-github,intake,disclosure}.ts` עם בדיקות fixture (קובץ ה-CONTRIBUTING של UnsafeLabs),
קובצי המדידה של Algora עם הקריאה שנמחקה, `owner-steps.ts` + `docs/OWNER_STEPS.he.md` (עברית, ניטרלית מגדרית) + PDF,
שורות T1-T4 ב-`ZERO-TESTS.md` ו-`urls.txt`, פסקה מתוארכת ב-`docs/REJECTED.md`, והיומן הזה. אחר כך `sync-portfolio`
ו-`report`. זה הקומיט השני בענף; הראשון החיל את הכרעת הרצפות (`logs/2026-09-28-floors-ruling-applied.md`).

## 2. הפעולות המרכזיות שביצעתי
- **המסלול (§2.5):** `PayoutRail` קיבל `stripe-connect-express`; שדה חובה `payoutEvidence`
  (`ledger`/`rendered`/`code`/`none`); `oss-bounties` → `stripe-connect-express` + `code` עם ההערה של ארבע העובדות;
  שני קווי Gumroad → `rendered`; `apify-actors` → `none` (אף עמוד שנשמר בריפו לא מזכיר את ישראל לתשלום של Apify —
  "כן, מתוך היעדר"). `linesWithUnverifiedPayout()` חדש; הדשבורד מראה את שתי הרשימות. תוקנה גם תווית הדרגה
  `contradicted` שהייתה מודפסת ריקה בטבלה.
- **policy.ts (§3.3, §5.2):** הרשאה נספרת רק מטקסט גלוי (`visibleText` מאפס הערות HTML, הערה לא סגורה ושורות
  `[//]: #` באותו אורך, כדי שהציטוט יישאר מהטקסט המקורי). איסור וסירוב נספרים מכל הטקסט. פסק חדש `not-a-payer`
  עם טבלת חמישה כללים (באונטי סמלי/מחקר, "לא ימוזג", "not the right repo", כוכב/מעקב כתנאי, דרישת system prompt/
  סביבה/טוקנים), והוא מוביל ל-`do-not-attempt`.
- **supply.ts:** מסנן `not-a-payer` אחרי `policy-forbidden`; `claimableFresh365` לצד הספירה; `SUPPLY_COUNTER_VERSION = 2`
  על כל קריאה; קריאה בלי חותמת גרסה (מהמונה הישן) עוברת אוטומטית מ-`history` ל-`instrumentFaults` עם הסיבה
  מצוטטת; `strikePreFixReadings()`; טבלת "Struck readings" ובאנר STRUCK ב-Markdown; טקסטי `readBoardVerdict` לפי §4.1/§4.3.
- **supply-github.ts + scripts/algora-supply.ts:** הקריאה הקודמת מעבירה גם את `instrumentFaults`; פקודה חדשה
  `--strike-pre-fix` (`strikeSupplyFiles`) שמוחקת בלי למדוד, דרך אותן פונקציות שריצה רגילה משתמשת בהן. הרצתי אותה על
  הקבצים האמיתיים: W39 (108) עבר ל-`instrumentFaults`, הסדרה ריקה, שבוע 0 מתוך 4.
- **measurements.ts:** קובץ שהקריאה שלו נמחקה לא נרשם כ-KPI.
- **intake.ts:** כלל 9 — `not-a-payer` נדחה (`repo-not-a-payer`); כלל 10 — `selectBounties` לא מוציא כלום כל עוד
  פסק שבוע 4 הוא `pending` או לא סופק, ולעולם לא אחרי `kill`.
- **disclosure.ts:** `attemptComment()` + `auditAttemptComment()` עם אותה הצהרה וכללי זהות; שני השערים דוחים עכשיו גם
  "חומר סשן" (system prompt, טוקנים, השמת סודות, תיקיית בית/עבודה, תקציב טוקנים).
- **portfolio.ts:** `oss-bounties` → דרגה `contradicted`, בסיס ו-rail לפי §3.5, קריטריוני הריגה לפי §8 (המונה המתוקן,
  4b אחרי תגמול מוחזק, כלל עצירה של צעד 4), `operatingLoop` עם פריטים 1-5 ו-8 של §5.2, `humanSetup` ל-4a/4b/טוקן עם צעד 7.
- **owner-steps.ts + OWNER_STEPS.he.md + PDF:** צעד 4 עם `earlyPart` (4a, אחרי `github-org`, 2 דקות), `precondition`
  (4b מוחזק), שדה חדש `stopIf` עם שלושת הכללים; צעד 7 יוצר את `BRAND_GITHUB_TOKEN`; צעד 6 כבר לא עוצר אותו. במסמך:
  סעיף צעד 4 נכתב מחדש כולו בעברית ניטרלית מגדרית (4א/4ב, "עצור אם", "מה יוצא לך מזה" פריט 2), תיבת ה-0 ₪, צעדים 6
  ו-7, שורת ה-USDC מפנה ל-§6.2, וטבלת הסיכום. ה-PDF נוצר מחדש (13 עמודים) ונבדק בצילום מסך.
- **ZERO-TESTS.md:** שורות 29-32 ל-T1-T4. **urls.txt:** ציטוט לשורות 30 ו-32 (ארבעה עמודים).
- **REJECTED.md:** פסקה מתוארכת מתחת לאזהרת Algora: המלכודת, הקריאה שנמחקה, עובדות הקוד של §2.1, ונוסח פתיחה מחדש
  כתוב מראש לשלושת כללי העצירה.
- **skills/revenue-oss-bounties/SKILL.md** ו-`.github/workflows/algora-supply.yml` עודכנו כדי לא לסתור את הקוד
  (`policy.ts` נוסף לנתיבי ה-push, כי הוא משנה את מה שנספר).

## 3. קבצים/מערכות ששונו
`src/revenue/{rails,dashboard,portfolio,owner-steps,measurements}.ts`,
`src/revenue/bounties/{policy,supply,supply-github,intake,disclosure}.ts`, `scripts/algora-supply.ts`,
`.github/workflows/algora-supply.yml`; בדיקות: `src/__tests__/revenue/{rails,dashboard,target-basis,bounties-policy,
bounties-supply,bounties-supply-github,bounties-intake,bounties-disclosure,measurements,owner-steps,runner}.test.ts`;
fixture חדש: `src/__tests__/fixtures/unsafelabs-bounty-hunters-CONTRIBUTING.md` (+ `.meta.json`);
`state/colony/measurements/algora-supply.json`, `research/measurements/algora-supply.md`;
`docs/OWNER_STEPS.he.md`, `docs/OWNER_STEPS.he.pdf`, `docs/REJECTED.md`; `research/channel-loop/ZERO-TESTS.md`,
`research/rendered/urls.txt`; `skills/revenue-oss-bounties/SKILL.md`.

## 4. החלטות והנחות משמעותיות
- **שתי ההכרעות נוגעות ב-`contradictedLines`.** שורה 9 מוציאה את il-biz-tools (הקומיט הראשון נעץ `[]`); הכרעת
  הבאונטי מכניסה את oss-bounties. המצב הסופי שנעוץ: `contradictedLines = ["oss-bounties"]`, `contradictedIls = 300`,
  `inferredIls = 800`, il-biz-tools `inferred` עם גבול עליון 400. שני הפסקים מתקיימים.
- **הסתייגות §4.1 נבדקה בקוד של Algora (GitHub, raw):** `reward_bounty` → `create_payment_session` →
  `create_transaction_pairs` רושם את הזיכוי בלי לבדוק `payouts_enabled`, ו-`/claim` יוצר משתמש מהלוגין של GitHub אם אין
  (`workspace.ex` `ensure_user` → `create_user_from_github`). לכן 4b נשאר "אחרי תגמול מוחזק" — וגם: 4a לא נחוץ כדי
  שזיכוי יירשם. החלתי את 4a כפי שנפסק (ישיבה אחת במקום שתיים) ורשמתי את העובדה בקוד ובדוח לדירקטוריון.
- **צעד 4 מוחזק בדוח** (`precondition`), כמו צעד 2. לפני כן הדוח השעתי ביקש את צעד 4 בזמן שהמסמך אמר "מושהה" —
  סתירה ישנה שנסגרה. דקות צעד 4 עודכנו ל-17 (2+15).
- **קריאות מהמונה הישן נמחקות לפי גרסת מונה**, לא לפי שבוע: כך גם ריצה של 06:23 ב-28.9 על `main` (אם הייתה) תירשם
  כתקלה ולא תוחלף בשקט באותו שבוע ISO.
- **T1 ו-T3 אינם עמודים ל-render-watch** (ספירה ב-CI עם מפתח; קריאת קוד דרך `add_repo`), ולכן יש להם שורות ב-ZERO-TESTS
  אבל לא שורות ב-urls.txt. עמוד התנאים של Superteam וכתובות עמודי ההרשמה של הבורסות לא ידועים; נשמרים דף הבית/עמוד
  הסוכנים, וממנם עוקבים לעמוד המדויק (כמו שורה 18 אחרי 15).
- **ניטרליות מגדרית:** כתבתי בניטרלי (שם פועל) את כל הטקסט החדש/המשוכתב. שאר המסמך נשאר בפנייה בזכר, כפי שהיה; לא
  שכתבתי סעיפים שההכרעה לא נגעה בהם.
- ה-fixture נשמר כמו שהוא, כנתונים. יש בו טקסט שמופנה למערכות אוטומטיות (הערות HTML וטבלת §4.7) — לא פעלתי לפיו.

- **אחרי שני הקומיטים:** `pnpm exec tsx scripts/colony.ts sync-portfolio` ואז `report` (הדרך שמתועדת ב-`scripts/colony.ts`
  וב-CHECKPOINT). הדוח מראה ₪1,100 מחויב, ₪800 מוסק, ₪300 מוכחש (`oss-bounties`), il-biz-tools ב-₪0 עם הגבול העליון
  ₪400 לידו, ו-oss-bounties מחכה לצעדים 7, 6 בלבד (4 מוחזק). הריצה המקומית של `report` הריצה גם סקירת מפקח ודירקטוריון
  שהיו בשלות, ורשמה בלוקר אמיתי: הלולאה המתוזמנת לא רצה 8 שעות (סנכרון אחרון 00:43 UTC).
- **נשאר ב-`colony.db`:** צילום KPI ישן `claimableBounties = 108` (00:43 UTC) מלפני המחיקה. הקובץ המחוק לא ייקלט שוב
  (אותו `measuredAt`, ועכשיו `struck`), והריצה המתוקנת הראשונה תכתוב צילום חדש. לא ערכתי את מסד הנתונים ביד.

## 5. שגיאות וניסיונות שנכשלו
- שמירת קוד TS דרך מחרוזת Python רגילה הפכה `\b` לתו backspace (20 מופעים ב-`policy.ts`); זוהה כשתבניות לא תפסו,
  תוקן, ונבדק שאין עוד מופעים בשום קובץ.
- פקודות Bash עם heredoc/לולאות נחסמו על ידי שומר הבידוד ("too complex"); פוצלו לפקודות פשוטות וקובצי סקריפט.
- `api.github.com` החזיר 403 לרשימת הקבצים של SuperteamDAO/earn, לכן לא אותר נתיב סכמת ההגשה (זה ממילא T3 של הלולאה).
- אין `pdftotext` בקונטיינר; ה-PDF אומת בצילום המסך של העמוד הראשון.

## 6. בדיקות ופעולות ולידציה
- כל שינוי התחיל בבדיקה שנכשלה מהסיבה הנכונה (RED), ואז קוד (GREEN): policy (11), supply (17 ועוד 1), supply-github
  (3 ועוד 1), measurements (1), intake (3), disclosure (קריסה בייבוא → ירוק), rails/dashboard (3 ועוד 1), owner-steps
  ו-runner (8).
- `pnpm typecheck` נקי; `npx vitest run src/__tests__/revenue`: 32 קבצים, 784/784.
- `render-watch.test.ts`: 105/105; ו-`parseUrlList` רץ על `urls.txt` האמיתי בלי שגיאה (93 כתובות; ארבע החדשות בסוף, האחרונה בשורה 311).
- `pnpm exec tsx scripts/algora-supply.ts --strike-pre-fix` רץ פעמיים (אידמפוטנטי: "struck 0" בפעם השנייה).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- בדיקה שמשווה כל מספר/סכום שמופיע בפרוזה (SKILL.md, INCOME_PLAN, OWNER_STEPS) לערך בקוד — כמו רצפת התשלום של הבאונטי.
- סקריפט עזר לעריכת קבצים ב-Python עם מחרוזות raw בלבד, כדי שלא יחזור באג ה-`\b`.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת `supply.ts` (700 שורות) ו-`intake.ts` במלואם — נחוצה לשינוי, אבל חלקים מהם נקראו פעמיים.
- ניסיונות Bash שנחסמו על ידי שומר הבידוד ונכתבו מחדש כקבצים.
- חיפוש כתובות לשורות T1-T4 (skill.md, רשימת הקבצים של הריפו שנכשלה ב-403).
