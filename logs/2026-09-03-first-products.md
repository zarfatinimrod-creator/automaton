# יומן משימה — מוצרים ראשונים, כלל מודל, המשכיות (2026-09-03)

Branch: `claude/monthly-income-plan-pfs7vu` · Session: https://claude.ai/code/session_018HcVJk7qcVHupvjvQZ91kR

## 1. מה המשתמש ביקש
- "כשנגמר ה-Fable 5.1 לא ממשיכים עד שהוא מתחדש; משתמשים רק בו."
- ללמוד מסרטון YouTube (m5qtqoDFCx0) ומ-web4.ai ולקחת מהם מה שצריך.
- "יש לך עבודה אחת: להרוויח כסף או שאתה מת" - להמשיך מהנקודה שנעצרנו.
- (הודעות ה-Routine: להמשיך מה-checkpoint.)

## 2. הפעולות המרכזיות שביצעתי
1. קראתי את התראת ה-Routine (הפעלה אחת ב-00:24 UTC) - התור התרוקן.
2. עדכנתי את ה-Routine ואת `CLAUDE.md` בכלל המודל: רק Fable 5.1; כשהמכסה נגמרת - לעצור ולרשום "waiting for Fable 5.1 quota" ב-CHECKPOINT.
3. ניסיתי לצפות בסרטון ולקרוא את web4.ai - שניהם חסומים ב-proxy של הסנדבוקס (גם noembed). למדתי על Web4 דרך חיפוש: Sigil Wen / Conway Research, אוטומטונים עם ארנק x402, "earn or die", 18,000+ אוטומטונים רשומים. שולב בסעיף 8 של `docs/INCOME_PLAN.he.md`.
4. תיקנתי הנחה שגויה: בוט טלגרם דורש יצירה ב-BotFather מחשבון טלגרם של הבעלים (2 דקות, בלי KYC). עודכנו `portfolio.ts`, הפלייבוק והתוכנית.
5. אימתתי עובדות בחיפוש ושילבתי בפלייבוקים: facilitator של Coinbase - 1,000 סליקות חינם בחודש ואז $0.001; Apify `Actor.charge({eventName})` ו-`eventChargeLimitReached`; Telegram Stars - משיכה רק דרך Fragment ל-TON, מינימום 1,000 כוכבים, החזקה 21 יום, ~30% אובדן ברכישות מובייל.
6. הפעלתי workflow של 3 סוכני-בנייה (מוצר לכל סוכן, תיקיות נפרדות): `products/apify-il-open-data`, `products/il-biz-tools`, `products/x402-il-api`.
7. Netlify: נמצא חשבון הבעלים (צוות `zarfatinimrod`, אתר קיים no-blood-no-bond). יצרתי פרויקט חדש `il-biz-tools` (il-biz-tools.netlify.app) ופתחתי גישה ציבורית. פריסה ישירה מהסנדבוקס חסומה ברשת - נרשם מסלול פריסה לבעלים.
8. הוספתי CI לבדיקות המוצרים (`.github/workflows/products-ci.yml`) ואינדקס `products/README.md`.

## 3. קבצים/מערכות ששונו
- `CLAUDE.md` (כלל מודל), `src/revenue/portfolio.ts` (טלגרם), `docs/INCOME_PLAN.he.md` (סעיפים 8-9 חדשים), `skills/revenue-{telegram-bots,paid-apis,apify-actors}/SKILL.md`, `products/README.md`, `.github/workflows/products-ci.yml`, `logs/CHECKPOINT.md`.
- מערכות חיצוניות: Routine `trig_01J5PYKxw746R7rW1sWBb8Ee` (prompt עודכן); Netlify - פרויקט חדש `il-biz-tools` (site id 2087c2ed-5270-4407-8746-675d6ea41d5e).
- `products/*` - ראו סעיף "תוצרי הבנייה" בהמשך.

## 4. החלטות והנחות משמעותיות
- בניית מוצרים במקום מחקר נוסף: הבעלים דרש "להרוויח כסף"; קווי x402 ו-Apify הם עם הראיות החזקות ביותר, ואתר הכלים הוא המשפך של קו הליבה.
- המוצרים חיים ב-`products/` מחוץ ל-workspace של pnpm כדי לא לקשור אותם לבניית הריצה.
- יצירת פרויקט Netlify נעשתה על סמך "אישור מלא" של הבעלים; הפעולה הפיכה (מחיקה בלחיצה).
- לא נעשה שימוש במחרוזת המזהה שהבעלים הדביק בצ'אט (uuid:hex) - מטרתה לא צוינה; אם זה מפתח API, יש להכניס אותו כמשתנה סביבה ולא בצ'אט.

## 5. שגיאות וניסיונות שנכשלו
- YouTube, web4.ai, noembed, data.gov.il, api.apify.com, api.telegram.org, x402.org, api.netlify.com, netlify-mcp.netlify.app - כולם חסומים ב-egress; רק github.com ו-registry.npmjs.org פתוחים. לכן המוצרים נבדקים עם fixtures ולא מול API חי.
- כלי ה-deploy של Netlify ב-MCP מחזיר פקודת CLI להרצה מקומית (עם token זמני) - לא ניתן להריץ מהסנדבוקס.

## 6. בדיקות ופעולות ולידציה
- `pnpm typecheck` נקי; `npx vitest run src/__tests__/revenue` - 31/31.
- בדיקות המוצרים: ראו "תוצרי הבנייה".

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- בדיקת egress לדומיינים (curl בלולאה) - כדאי סקריפט `scripts/egress-check.sh`.
- עדכון CHECKPOINT לפני כל פעולה ארוכה - כבר נוהל; אפשר hook.
- הפריסה ל-Netlify - אחרי שהבעלים יקשר את הריפו פעם אחת, כל push יפרוס אוטומטית.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- ניסיונות גישה לסרטון/web4.ai/noembed: 3 קריאות שנחסמו (~2K אסימונים) - ניתן היה לבדוק egress קודם.
- ניסיון deploy ב-MCP שהחזיר פקודה בלתי-שמישה מהסנדבוקס (~3K אסימונים כולל ה-token הארוך).
- הודעות מערכת חוזרות של הכלים (רשימות skills/MCP) - עשרות אלפי אסימוני קונטקסט שלא בשליטתי.
- workflow הבנייה: (יעודכן בסיום) אסימוני סוכנים.

## תוצרי הבנייה
(יעודכן כשה-workflow מסתיים)
