# 28.9.2026 — תיקוני ביקורת על החלת שתי ההכרעות (רצפות ההריגה + מסילת הבאונטי)

## 1. מה המשתמש ביקש
סקירת הקוד של ה-builder (worktree `wf_4d5df347-dc7-1`, ענף `worktree-wf_4d5df347-dc7-1`) מצאה תשעה פגמים. המשימה:
לתקן כל פגם שעומד בבדיקה מחודשת מול ההכרעות והקוד, לדחות עם נימוק את מה שלא עומד, להריץ `pnpm typecheck`
ו-`npx vitest run src/__tests__/revenue`, ולבצע commit. בלי push, בלי `git stash`, ובלי לגעת ב-`logs/CHECKPOINT.md`,
`logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md` ו-`CLAUDE.md`.

## 2. הפעולות המרכזיות שביצעתי
- **ממצא 1, מסנן `not-a-payer` (`policy.ts`):** שחזרתי את כל תשעת החיובים השגויים (כולל cal.com, README שורה 579).
  כתבתי קודם בדיקות שנכשלו, ואז הידקתי את הכללים:
  - **כוכב/מעקב:** נדרש אובייקט מפורש (this/the/our + repo/repository/project/org/account) שסוגר את הצירוף, והפועל
    מופיע בהקשר של תנאי: לפני פתיחת PR, חובה, או פנייה לסוכנים. הענף של must/need/have to עם follow/watch בלבד
    הוסר.
  - **מחקר בלבד:** נשארו "for research purposes" ו-"not be merged into production". הוסרו "into the (main)
    codebase/project" ו-"no PRs will be merged". הצירוף "nothing … merged" נספר רק עם "ever".
  - **כסף לא אמיתי:** "symbolic/fake/part of an experiment" נספרים רק כשהם מתארים את הבאונטים עצמם ("bounties … are
    …") או בצירוף "symbolic bounties".
  - **דרישת סודות:** נדרש פועל דרישה שאינו שלול ("never share your API keys" לא נספר) ואובייקט של התורם ("your …").
    צעד קונפיגורציה ("as an environment variable", ".env") לא נספר.
  - **"not the right repo":** הכיוון ההפוך מחייב "for paid work/bounties".
  - בנוסף הרצתי את `assessRepoPolicy` על מסמכי המדיניות של 14 מאגרים שהורדו היום מ-raw.githubusercontent.com (13
    מהספירה ועוד cal.com). UnsafeLabs ו-SecureBananaLabs עדיין `not-a-payer`, ו-12 האחרים, כולל cal.com, `unknown`.
- **ממצא 2 (`loop.test.ts`):** נוספו שני מקרים לקו il-biz-tools חי, עם יעד ₪400 והכנסה של ₪150 אחרי 100 יום. המפקח
  והדירקטוריון הורגים אותו, כלי `revenue_line_detail` מציג KILL, והמבקר מסמן `hold` שהוגש. בדקתי כל אחד מארבעת אתרי
  הקריאה: כשהוא הוחזר ל-policy החשוף, בדיקה נכשלה.
- **ממצא 3 (`intake.ts`):** רצפת התשלום חזרה ל-₪37.50. ה-₪1,500 מוחזק כקבוע `FLOOR_CAPACITY_BASE_ILS` עם הנימוק,
  וההערה המטעה ("Nothing was edited here but this comment") תוקנה. נוספה בדיקה נפרדת לעיגול לאגורה, כי העיגול עצמו
  תיקון נכון. גם `skills/revenue-oss-bounties/SKILL.md` תוקן.
- **ממצא 4 (`OWNER_STEPS.he.md`):** נוסחו מחדש בלשון ניטרלית (שם פועל או סביל) השורה ששוכתבה ("רק באישור שלך לניירת
  של כל זכייה") וכל החלקים שה-builder ערך בתוכם: צעד 6 חלקים א-ב ופריט 5, רשימת צעד 7, "מה מגיע…" ו"מה קורה אחרי
  שסיימת". הצעדים שלא נגעו בהם (1, 3, 5, כללי הפתיחה) נשארו כמו שהם. בדרך תוקנה גם אי-התאמה: פריט 5 בצעד 6 אמר
  "הדבקתי X ו-Y", והטבלה כבר אמרה 3 טוקנים. ה-PDF נוצר מחדש.
- **ממצא 5 (`INCOME_PLAN.he.md`):** פסקת 28.9 הועברה אל אחרי שורת המקור של פסקת 7.9. הפסקה של 7.9 והמקור שלה מחוברים
  שוב כמו במקור.
- **ממצא 6 (`portfolio.ts`, basis של oss-bounties):**
  - ארבע העובדות של §2.1 נכתבו ממוספרות (1)-(4), כולל עובדה 1 (Stripe עצמאי לעסק ישראלי: לא), תקדים Polar, ו-Stripe
    cross-border:92,96.
  - שורה 59 של ה-README של SecureBananaLabs מצוטטת מילה במילה. ווידאתי אותה מול הקובץ שהורד.
- **ממצא 7:** נוספה הערה מתוארכת 28.9 בראש `portfolio.ts` (1,100 מחויב + 700 מותנה + 400 שנוי במחלוקת), וגם בהערה של
  `CONDITIONAL_TARGETS`.
- **ממצא 8 (`measurements.ts`):**
  - **שורש הבעיה:** הקובץ נמחק במקום, עם אותו `measuredAt`, ולכן ה-ingest קורא אותו כ-`unchanged` ואף פעם לא מגיע
    לענף `struck`.
  - **התיקון:** כשהקריאה האחרונה שנקלטה ב-DB רשומה ב-`instrumentFaults`, כל ה-snapshots של `claimableBounties` מאז
    אותה קריאה משנים שם ל-`claimableBountiesStruck`. הם נשמרים כרשומה ולא מוגשים כנוכחיים.
  - **הרצה על ה-DB האמיתי:** דרך `ingestAlgoraSupplyMeasurement` עצמה, לא בעריכה ידנית. אחריה `latestKpis` כבר לא
    מחזיר `claimableBounties` = 108.
- **ממצא 9 (`owner-steps.ts`):** ה-`short` של צעד 4 מתחיל עכשיו ב-"Stripe form, part 4b, asked only after…". בדוח זה
  נקרא "step 4 Stripe form, part 4b…", והצירוף "step 4 4b" נעלם. הציטוט במסמך ובדיקת ה-runner עודכנו.
- הרצתי `sync-portfolio` ו-`report`, ואחריהם `node scripts/owner-steps-pdf.mjs`.

## 3. קבצים/מערכות ששונו
- **קוד:** `src/revenue/bounties/policy.ts`, `src/revenue/bounties/intake.ts`, `src/revenue/measurements.ts`,
  `src/revenue/owner-steps.ts`, `src/revenue/portfolio.ts`.
- **בדיקות:** `src/__tests__/revenue/{bounties-policy,bounties-intake,bounties-supply,loop,measurements,owner-steps,runner}.test.ts`.
- **מסמכים:** `docs/OWNER_STEPS.he.md`, `docs/OWNER_STEPS.he.pdf`, `docs/INCOME_PLAN.he.md`,
  `skills/revenue-oss-bounties/SKILL.md`, והערת הפניה אחת ב-`logs/2026-09-28-floors-ruling-applied.md`.
- **מצב:** `state/colony/colony.db` (ה-snapshot של 108 שונה בשמו דרך קוד ה-ingest, ואחר כך sync ו-report),
  `state/colony/REPORT.md`, `state/colony/dashboard.html`.

## 4. החלטות והנחות משמעותיות
- **הבסיס של רצפת הבאונטי מוחזק ב-₪1,500 ולא נגזר מ-₪1,100.** שורה 9 השאירה ל-il-biz-tools תקציב בנייה במפורש, כך
  שהשעות שלו לא עברו ל-oss-bounties. אף הכרעה לא החליטה להוריד את הרצפה ב-27%. **השאלה לדירקטוריון (Fable):** איך
  נספר קו ב-₪0 שעדיין צורך שעות בנייה בחלוקת הקיבולת? צריך לרשום אותה ב-`logs/FABLE_QUEUE.md`, וזה בידי ה-thread
  הראשי, כי הקובץ מוגן בפניי.
- **`SUPPLY_COUNTER_VERSION` לא הועלה.** הכללים שהודקו שייכים למונה 2, ואף קריאה של מונה 2 עוד לא נעשתה: הריצה
  הראשונה תהיה אחרי שהתיקון ינחת ב-`main`.
- **הצעדים שה-builder לא נגע בהם ב-OWNER_STEPS נשארו בזכר.** זה עקבי עם ההחלטה שלו ועם היקף הביקורת.
- **ממצא 8, מקרה קצה:** אם קריאה מתוקנת נקלטה לפני ה-strike, `latestKpis` כבר מגיש אותה ולא משנים שם לאף שורה. לא
  בניתי גבול זמן לפי ה-`measuredAt` הבא. בבדיקה ניסיתי גבול כזה, והוא מחק בטעות קריאה מתוקנת כשהשעון קדם ל-`measuredAt`.
- **קריאת המדיניות מחדש כיסתה רק מסמכי מדיניות.** גוף ה-issues לא נקרא: `api.github.com` ו-`github.com` החזירו 403
  מהקונטיינר, ו-raw עובד.

## 5. שגיאות וניסיונות שנכשלו
- **תיקיית scratch:** סקריפט הפענוח הראשון קרא גם תיקיות ישנות עם קו תחתון אחד, מסשן קודם. סיננתי ל-`__` בלבד.
- **העברת פסקה ב-INCOME_PLAN:** ההעברה הראשונה השאירה שורה ריקה בין פסקת 7.9 למקור שלה, ותוקנה.
- **סקריפט tsx:** מתיקיית ה-scratch הוא לא מצא את `better-sqlite3`. הרצתי אותו עם `tsx -e` מתוך ה-worktree.

## 6. בדיקות ופעולות ולידציה
- `pnpm typecheck`: נקי.
- `npx vitest run src/__tests__/revenue`: 32 קבצים, 793 מתוך 793. היו 785, ונוספו 8 בדיקות.
- **מוטציות:**
  - כל אחד מארבעת אתרי `policyForLine` שהוחזר ל-policy החשוף הפיל בדיקה אחת.
  - ביטול `strikeIngestedFaults` הפיל בדיקה אחת.
  - הבדיקות השליליות החדשות של `not-a-payer` נכשלו לפני התיקון (שתי בדיקות).
- `assessRepoPolicy` על 14 מאגרים אמיתיים: ראו סעיף 2.
- `latestKpis` על ה-DB האמיתי אחרי ה-strike: `claimableBountiesStruck` = 108, ואין `claimableBounties`.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **הורדת מסמכי מדיניות של מאגרים מ-raw.githubusercontent.com לבדיקת רגרסיה של `policy.ts`.** כדאי לשמור קבוצת
  fixtures קבועה, 14 מאגרים עם sha256 כמו ב-UnsafeLabs, ובדיקה שמריצה עליהם את הכללים. כל שינוי בכללים ייבדק אז מול
  משלמים אמיתיים.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- **קריאת הכרעת מסילת הבאונטי במלואה (43KB):** כדי לאמת את ממצאים 6 ו-8 היה מספיק §2.1, §3.3-§3.5 ו-§8.
- **פלט ה-diff של `REPORT.md`:** שורות ה-blocker הארוכות חזרו פעמיים.
