# CHECKPOINT — where we stopped

עדכון: 2026-09-03 04:05 UTC · branch `claude/monthly-income-plan-pfs7vu` · הקומיט האחרון: `1b9e73d`

קרא קודם את `MISSION.md` (המנדט של הבעלים), ואז את הקובץ הזה.

## מה עובד עכשיו

- **הלופ רץ באמת.** `scripts/colony.ts` מריץ את מחזור הממשל (סנכרון כסף → ביקורת מפקח → ישיבת דירקטוריון → ביקורת) מקובץ SQLite בלבד, בלי ארנק, בלי Conway, בלי inference. `.github/workflows/colony.yml` מריץ אותו כל שעה ודוחף את `state/colony/` חזרה לריפו, כך שכל החלטה של הדירקטוריון נשמרת בהיסטוריית ה-git. אומת מקצה לקצה: הטיק הראשון זרע 9 קווים, טיק מיידי שני לא הריץ כלום (חסימת אינטרוולים), מכירת x402 של ₪450 קידמה קו ל-live והייתה אידמפוטנטית, והדירקטוריון הקצה לו את כל התקציב.
- **ארבעה מוצרים, 127 בדיקות עוברות**: `apify-il-open-data` (41), `il-biz-tools` (60), `telegram-il-tools-bot` (11), `x402-il-api` (15).
- **מנוע ההכנסה** `src/revenue/` עם 49 בדיקות; typecheck נקי.
- **חוק המודלים** ב-`CLAUDE.md`: Opus 5 מנוע, Fable 5.1 שמור לאימות ולשיפוט, מיושם לכל סוכן בנפרד ב-workflows.

## מה תוקן בסבב הזה (שני באגים אמיתיים)

1. **x402 לא יכול היה לקבל שקל.** `defaultPaywall` קרא ל-`require()` בתוך מודול ESM; החריגה נבלעה וכל endpoint החזיר 503 ברגע שהוגדר ארנק. תוקן עם `createRequire`, ואומת מול שרת רץ: בקשה לא משולמת מחזירה 402 עם הסכום והארנק.
2. **ה-Pro של il-biz-tools היה הונאה בפוטנציה.** מכר לוגו ממותג שלא היה קיים, ורשימת לקוחות ומספור אוטומטי שכבר היו חינמיים; שום דבר לא קרא את `?pro=1`. עכשיו Pro מוכר רק מיתוג אמיתי, עם מפתח רישיון חתום שמאומת אופליין, והכפתור מופיע רק כשגם Paddle וגם המפתח הציבורי מוגדרים.

## מה רץ ברקע כרגע (שלושה מחקרים)

| Workflow | Run ID | מה הוא מחזיר |
|---|---|---|
| השלמת מחקר ההכנסה | `wf_d846d2e8-694` | 4 הסריקות החסרות + אימות אדברסרי + סינתזה |
| סריקת GitHub | `wf_ec0fe76f-82c` | skills, סוכנים, MCP, כלים לאמץ |
| סריקת YouTube | `wf_def6b5f0-7e0` | פלייבוקים, ביקוש לא מסופק, מה להוסיף |

כשהם מסתיימים: לקפל את התוצאות ל-`src/revenue/portfolio.ts`, ל-`docs/INCOME_PLAN.he.md` ולפלייבוקים ב-`skills/`.

## הצעד הבא של הבעלים (חד-פעמי, לפי סדר)

הצ'קליסט המלא בסעיף 6 של `docs/INCOME_PLAN.he.md`. בקצרה: PayPal Israel ← Apify + KYC ← Paddle ← Etsy + Payoneer ← עוסק פטור. שני קווים לא דורשים כלום: `agent-services` (x402) ו-`telegram-bots` (רק יצירת בוט ב-BotFather).

אחרי כל צעד: `pnpm exec tsx scripts/colony.ts setup-done <lineId> --evidence "..."`.

## חסום, ולמה

- **פריסה ל-Netlify** — האתר `il-biz-tools` נוצר (site id `2087c2ed-5270-4407-8746-675d6ea41d5e`), אבל api.netlify.com חסום ב-proxy של הסנדבוקס. הבעלים מקשר את הריפו ב-Netlify UI (base `products/il-biz-tools`, publish `_site`, build `node scripts/build-site.js`) או מריץ מקומית `npx netlify-cli deploy --prod`.
- **ביצוע של דירקטורים** — הלופ מנהל, אבל לא מבצע. דירקטור צריך inference; עד שהאוטומטון יקבל מפתח, הדוח מסמן כל goal תקוע כחוסם ולא מעמיד פנים שמישהו עובד עליו.
- **הסרטון שנשלח** (YouTube) — חסום ב-proxy; המחקר עוקף דרך תמלולים וסיכומים.

## איך ממשיכים

```bash
pnpm install
pnpm exec tsx scripts/colony.ts status      # מה מצב התיק
pnpm exec tsx scripts/colony.ts tick        # מחזור אחד
npx vitest run src/__tests__/revenue        # 49 בדיקות
```
