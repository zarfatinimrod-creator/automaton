# סבב 40 של לולאת הערוצים — תנאי PostHog והמסלול החינמי מ-GitHub; ההחלטה על פרויקט המותג (4.10.2026, ~09:50-~10:50 UTC)

## 1. מה המשתמש ביקש
הוראת הבעלים הקבועה (27.9): ערוצים בלי הפסקה, ב-₪0; "תמשיך בfable" (30.9). הסבב לקח את פריט 1 של תור 4.10 ב-§9: תנאי PostHog ב-github grade, פסק ל-posthog.com, והערכת תנאי הכרעת המסמכים (c) — "הפרויקט ו-API השאילתות נשארים במסלול החינמי" — לפני שנוצר פרויקט.

## 2. הפעולות המרכזיות שביצעתי
- **Workflow `wf_7ebad8a8-cca`** (בונה ב-worktree, סוקר אדברסרי, מתקן; Opus): הבונה מצא את התנאים ב-`PostHog/posthog.com` (`src/pages/terms.tsx`, `privacy.tsx` ב-`35fc817`) ואת נתוני התמחור והתיעוד (`4c27ff7`; `PostHog/posthog@526d64d`), שמר הפניות מצוטטות עם טווחי שורות ו-sha256 (לא עותק מלא: `LICENSE:5-6` מבקש לא להעתיק את האתר מחוץ ל-`/contents/`), כתב את `research/measurements/posthog-free-tier.md` (MET), והוסיף שומר לכל טקסט תנאים שמור. הסוקר מצא 10 פגמים (סעיף 2.1 חל גם על התיעוד; הסייג על אחסון לא נאכף; מטרת ה-API צוטטה משורה לא נכונה; ציטוטים לא נבדקו בריפו; ועוד) — כולם תוקנו: `PATH_LIMITS` ב-`termsGate` (רק `/docs/` ו-`/tutorials/`), 23 קבצי MIT נשמרו בשלמותם ב-`posthog-free-tier-sources/` עם בדיקת 69 ציטוטים, הסבר ה-API תוקן. מיזוג `479d3b9`.
- **הבדיקה החיה (ה-thread הראשי, קריאה בלבד דרך המחבר):** `project-get`, `organization-get`, `projects-get`, `billing-overview-get`, `read-data-schema`. מסלול חינמי, בלי ניסיון; ארגון אחד, פרויקט אחד (המגבלה), והפרויקט בשימוש מוצר אחר של הבעלים.
- **ההחלטה (Fable, ה-thread הראשי):** המותג לא משתף את הפרויקט הקיים (ערבוב נתונים; הטוקן הציבורי שלו כבר מזהה אתר אחר). פרויקט שני במסלול החינמי דורש ארגון שני; אין כלי יצירת ארגון במחבר — **צעד בעלים חינמי של קליק אחד**, הוצע ב-§6 ונרשם לשורה 25 ב-FABLE_QUEUE לאישור מקומו. שום דבר לא נוצר.
- **קבצי הלולאה:** §0, §6 (צעד מוצע), §9 (פריט 1 DONE, "Fixed in tick 40"), §10 (סבב 41); FABLE_QUEUE שורה 25; CHECKPOINT; `posthog-free-tier.md` קיבל סעיף "4.10 (tick 40, main thread)".

## 3. קבצים/מערכות ששונו
- `research/channel-loop/terms/posthog-terms-2026-10-04.md`, `posthog-privacy-2026-10-04.md`; `research/channel-loop/terms-verdicts.json` (posthog.com); `scripts/queue-zero-test.mjs` (`PATH_LIMITS`); `research/measurements/posthog-free-tier.md`, `posthog-free-tier-sources/` (23 קבצים + `SOURCES.json`); `src/__tests__/revenue/terms-saved-copies.test.ts`, `posthog-free-tier-sources.test.ts`; יומן המשימה `logs/2026-10-04-channel-loop-tick-40-posthog-terms.md`.
- `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `logs/CHECKPOINT.md`.

## 4. החלטות והנחות משמעותיות
- **קטעים ולא עותקים מלאים** של עמודי האתר של PostHog: בקשת הרישיון של הריפו מכובדת; הראיות נעוצות ב-SHA ומאומתות ב-sha256.
- **NOT_BARRED עם מגבלת נתיב בקוד** ולא CONDITIONAL_MET: תנאי בלי אכיפה בקוד לא היה אוכף דבר.
- **הפרויקט הקיים לא משותף:** החלטת כסף/כנות — נתוני המותג לא מתערבבים עם מוצר אחר, והציבור לא מקשר ביניהם דרך טוקן משותף.
- **ארגון שני = צעד בעלים:** פעולה חד-פעמית, חינם, בלי אימות זהות, בחשבון שכבר קיים — בתוך המנדט; מקומו בסדר הצעדים לאישור ישיבה (שורה 25), כי §6 הוא רשימה מסודרת אחת.
- api.github.com דרך מחבר GitHub הוא מארח GitHub ומותר; ייכתב במפורש ב-briefs הבאים.

## 5. שגיאות וניסיונות שנכשלו
- ה-worktree של הבונה התחיל שוב על בסיס ישן (`04e965d`) ואופס לפי ההנחיה.
- WebFetch החזיר סיכומים ולא טקסט; הבונה השתמש ב-`curl` ל-raw.githubusercontent.com בקומיטים נעוצים (מותר).
- קריאת `list_commits` דרך מחבר GitHub נדחתה (הריפו לא בהיקף המושב); פידי Atom של GitHub נתנו את ה-SHA.

## 6. בדיקות ופעולות ולידציה
- מיזוג דרך `scripts/merge-worktree.sh`: `verify.sh` exit 0 (68 קבצים, 2,176 בדיקות). `frozen-citations` exit 0; `urls-pause-comments.mjs --check` exit 0; 8 קבצי בדיקה שקוראים את `terms-verdicts.json` — 285 עברו.
- מוטציות: 9 (בונה) + 8 (מתקן) — כולן נהרגו.
- אחרי הוספת הסעיף החי ל-`posthog-free-tier.md`: `posthog-free-tier-sources.test.ts` ו-`frozen-citations.test.ts` ירוקים.
- grep למזהי הבעלים ולשם המוצר האחר בקבצים שנגעו בהם: 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- בדיקת מסלול/מגבלות של חשבון SaaS דרך מחבר — תבנית שחוזרת (Apify, PostHog): סקריפט `scripts/connector-check.mjs <service>` שמדפיס מסלול, מגבלות ושימוש היה חוסך קריאות ידניות.
- רשומות §6 "צעד מוצע" ושורות FABLE_QUEUE נכתבו ביד — כלי עריכת-לולאה (§7 של סבב 39) עדיין חסר.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- ה-workflow: ~1.07M אסימוני תת-סוכן (3 סוכנים; הסוקר הריץ בעצמו שליפות ובדיקות).
- הבדיקה החיה: שש קריאות מחבר, אחת מהן (billing-overview) החזירה ~15k אסימונים של תיאור מוצרים; `--json` עם סינון היה זול יותר.
- ה-thread הראשי: שלוש סדרות עריכה של קבצי הלולאה (ללא נפילות הפעם).
