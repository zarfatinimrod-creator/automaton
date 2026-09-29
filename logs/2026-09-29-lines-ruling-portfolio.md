# יומן משימה — 29.9.2026 — פסיקת הקווים: התיק, ה-staleDays, אירוע הלדג'ר של Apify ותת-המותג של T1

worktree מבודד של `claude/new-session-j071dx` (בסיס `f378977`) · מודל: Opus 5.5 · סוכן fold של תהליך עבודה

## 1. מה המשתמש ביקש
סקריפט התהליך (לא הבעלים ישירות) ביקש להחיל את `research/channel-loop/RULING-2026-09-29-lines.md` — פריטים (b), (c),
(d), (e), ומשפטי ה-`TARGET_BASIS` של (a), (f) ו-(h) סעיף 4 — על רשימת קבצים סגורה: `src/revenue/portfolio.ts`,
`src/revenue/rails.ts`, הבדיקות שהפסיקה מצטטת, `docs/INCOME_PLAN.he.md:60`, הרצת `sync-portfolio` ו-`report`, תיקון
אזכורי "1,100" שמציינים את הסכום המחויב של היום ב-`docs/` וב-`skills/`, קובץ מועמדי תת-מותג ל-T1, בדיקת Netlify
ב-`scripts/brand-check.mjs`, קלט לרשימה ב-`.github/workflows/brand-check.yml`, ורישום "ממתין לבדיקת ה-runner" ב-T1-PROTOCOL,
ב-PREREG §3.5 ובערכת הזהות. לא לשגר שום workflow, לא לדחוף, ₪0.

סבב שני (אותו יום, סוכן תיקון על Opus): לתקן כל ממצא של סוקר הקוד שמחזיק אחרי אימות, ולרשום כאן ממצאים שנדחו ולמה.

## 2. הפעולות המרכזיות שביצעתי
- **בסיס:** ה-worktree נפתח על `215b19b` שאינו צאצא של `f378977` → `git reset --hard origin/claude/new-session-j071dx`.
- **בדיקות קודם:** כתבתי/עדכנתי את הבדיקות לפני הקוד והרצתי אותן אדומות (21 כישלונות צפויים), ורק אז מימשתי.
- **(b) Apify ל-₪0:** `targetMonthlyAgorot: agorotFromIls(0)` עם הערה; `TARGET_BASIS["apify-actors"]`: `ils: 0`,
  `inferred`, `contestedUpperBoundIls: 200`; טקסט הבסיס שומר את משפטי ה-₪1,500 (הממוצע השיווקי שלא אומת) ומוסיף את
  המשפט המילולי של הפסיקה. הסכום המחויב: ₪900.
- **(c) staleDays לכל קו:** שדה אופציונלי `staleDays?` ב-`TargetBasis` עם הערת הפסיקה; Apify = 45; `policyForLine` ממזג
  אותו בדיוק כמו `killFloorFraction`. ברירת המחדל 21 ב-`types.ts` לא שונתה.
- **(d) אירוע הלדג'ר:** משפט ה-LEDGER EVENT נוסף להערת `LINE_RAILS["apify-actors"]` — הדוח החודשי המאושר הוא ההכנסה,
  ההעברה היא התאמה בלבד. בלי קוד מחבר, כפי שהפסיקה אומרת.
- **(a), (f), (h)4:** משפט ה-Pro (₪79, מכשיר מדידה ולא הכנסה) וכלל ההריגה (המשיב להחזרים ממשיך
  `refundPeriodDays + 7` ימים אחרי המכירה האחרונה) נוספו לבסיס של il-biz-tools; שער התמחור נוסף לבסיס של pcn874.
- **(e) תת-המותג:** `research/measurements/t1-subbrand-candidates.txt` (חמשת השמות בסדר הפסיקה, `tikufi` מוחרג);
  `brand-check.mjs` קיבל בדיקה רביעית (`https://<name>.netlify.app`, 404 = פנוי), `allFree` דורש את ארבעתן, `firstAllFree`,
  פלט Markdown (`<stem>-check.md`), `--candidates` עם שומר נתיב, ו-`checkName`/`probeStatus` שמקבלים fetch מוזרק לבדיקות.
  ה-workflow מקבל קלט `candidates`, ובדחיפה מריץ רק רשימות ששונו.
- **רישומים:** "ממתין לבדיקת ה-runner" (לא שם שנבחר) ב-`T1-PROTOCOL.md` סעיף 4, ב-`PREREG-DECISIONS.md` §3.5
  ובערכת הזהות (`VERDICT.md` §14.6), בכל אחד שורה אחת: שאלת חשבון Google נדחתה לשורה 16 ב-`FABLE_QUEUE`.
- **מסמכים:** `INCOME_PLAN.he.md` (שורות 8, 9, 15, 60, 265) ו-`OWNER_STEPS.he.md:495` — הסכום המחויב של היום ₪900;
  ה-PDF של צעדי הבעלים חודש מקומית (Chromium, בלי רשת).
- **מצב המושבה:** `sync-portfolio` (apify-actors עכשיו ₪0.00) ואז `report`; הדוח מדפיס ₪900, Inferred ₪600,
  ו-"`apify-actors` ₪200 (target ₪0)".

**סבב תיקוני הביקורת — שבעה ממצאים, כולם אומתו ותוקנו, אף אחד לא נדחה:**
1. `skills/revenue-apify-actors/SKILL.md:9-10` — המשפט "₪1,500 is recorded as the contested upper bound" היה שקרי. הפסקה
   נפתחת עכשיו ב-"**Planned target: ₪0**" (כמו ב-il-biz-tools), ₪200 כגבול עליון שנוי במחלוקת שחוזר רק מקריאת יום 30,
   ו-₪1,500 כנתון שנדחה ונשאר רק בטקסט הבסיס. `skills/revenue-oss-bounties/SKILL.md:81-82` — הסיבה "planned at ₪0, build
   budget kept" חלה עכשיו על שני הקווים, בדיוק כמו ב-`intake.ts:245-246`.
2. `products/apify-il-open-data/docs/PUBLISH.md:15` — "₪200 (`apify-actors` target …)" הפך ל-"₪0 planned … ₪200 contested
   upper bound"; `:85-86` — "Apify's contested ₪1,500 upper bound … the committed ₪200" הפך ל-"the ₪1,500 the board refused
   (recorded in the `TARGET_BASIS` basis text) … the contested ₪200".
3. `.github/workflows/algora-supply.yml:6` — "₪300 of the committed ₪1,100" → "₪900".
4. `.github/workflows/brand-check.yml` — אומת: `workflow_dispatch` עם ברירת המחדל `brand-candidates.txt` היה מריץ מחדש את
   רשימת המותג של 27.9, דורס את `brand-candidates.json` ומוסיף עמודת Netlify. בחרתי **בלי ברירת מחדל** (הקלט עדיין
   `required: true`), ולא ברירת מחדל של רשימת T1: הפסיקה (שורה 272) אומרת לשגר "עם קובץ המועמדים כקלט", וכך אף רשימה
   שכבר הכריעה משהו — גם T1 אחרי שתימדד — לא תתוארך מחדש מלחיצה על "Run" בלי שם.
5. `src/revenue/portfolio.ts:159-161` — ההערה הישנה בזמן הווה ("is recorded … See CONTESTED_UPPER_BOUNDS") הועברה לזמן
   עבר כרשומת 7.9 שסומנה "Superseded", והסימול `CONTESTED_UPPER_BOUNDS` (שלא קיים בשום מקום בקוד) הוסר. טקסט הפסיקה נשאר
   מתחתיה.
6. `brand-check.test.ts` — אומת: הסרת `signal` מ-`probeStatus` השאירה את כל 12 הבדיקות ירוקות. ה-fetch המזויף רושם עכשיו
   את `init.signal`; בדיקת ה-404 דורשת `AbortSignal` שעוד לא בוטל, ונוספה בדיקה שבה ה-fetch נדחה ב-`DOMException`
   מסוג `TimeoutError` והפסק הוא `unknown`.
7. `docs/INCOME_PLAN.he.md:60` — משפט ה-28.9 שוחזר מילה במילה (כמו ב-`f378977`), ונוספה פסקה נפרדת "**עודכן 29.9.2026:**"
   עם ₪900 (Apify 0, גבול שנוי במחלוקת ₪200) מיד אחריה; ההפניה ב-`:16` מונה עכשיו גם אותה, וכותרת ההערה ב-`:14`
   אומרת "עודכנה 29.9". זה סוטה מהלשון המילולית של הפסיקה ("`:60` … → ₪900") אבל לא מכוונתה: המספר של היום מופיע
   באותו מקום בסעיף, והרשומה המתוארכת לא נמחקת — כמו כל שאר הרשומות המתוארכות בקובץ.

## 3. קבצים/מערכות ששונו
- קוד: `src/revenue/portfolio.ts`, `src/revenue/rails.ts`, `src/revenue/bounties/intake.ts` (הערות בלבד),
  `scripts/brand-check.mjs`, `.github/workflows/brand-check.yml`.
- בדיקות: `src/__tests__/revenue/{target-basis,rules,rails,brand-check,bounties-intake,runner}.test.ts`.
- נתונים/מחקר: `research/measurements/t1-subbrand-candidates.txt` (חדש), `research/faceless-youtube/{T1-PROTOCOL,PREREG-DECISIONS,VERDICT}.md`.
- מסמכים: `docs/INCOME_PLAN.he.md`, `docs/OWNER_STEPS.he.md`, `docs/OWNER_STEPS.he.pdf`.
- מצב: `state/colony/{colony.db,REPORT.md,dashboard.html}`. היומן הזה.
- סבב התיקונים: `skills/revenue-apify-actors/SKILL.md`, `skills/revenue-oss-bounties/SKILL.md`,
  `products/apify-il-open-data/docs/PUBLISH.md`, `.github/workflows/{algora-supply,brand-check}.yml`,
  `src/revenue/portfolio.ts` (הערה בלבד), `docs/INCOME_PLAN.he.md`,
  `src/__tests__/revenue/{brand-check,target-basis}.test.ts`, היומן הזה. שום נתון של התיק לא השתנה, ולכן
  `colony.db`/`REPORT.md`/`dashboard.html` לא חודשו.

## 4. החלטות והנחות משמעותיות
- **"לשמור את משפטי ה-₪1,500 מילה במילה" מול משפט שהפך לשקרי.** המשפט "the board committed to ₪200 and records
  ₪1,500 as the CONTESTED UPPER BOUND" היה נשאר שקר אחרי השינוי. העברתי אותו לזמן עבר ("the 7.9 board committed … and
  recorded …") והוספתי משפט 29.9 אחריו; משפט ההנמקה "The ₪1,500 rests on … marketing mean …" נשאר מילה במילה.
- **השלכות שהפסיקה לא מנתה:** מעבר Apify ל-₪0 שבר ארבע בדיקות מחוץ לרשימה (`rails`, `bounties-intake`, `runner`, ו-
  `summarizeTargetBasis` ב-`target-basis`). עדכנתי אותן למספרים החדשים ולא החלשתי אף אחת: בדיקת "פלטפורמה שלא רואים"
  מאמתת עכשיו ש-Apify עדיין מסומן עיוור עם 0% מהיעד, **ובנוסף** שעל עותק עם יעד ₪200 הבדיקה עדיין סופרת אותו ומדפיסה
  "cannot observe" — כך הכיסוי של הבדיקה נשמר. בסיס הקיבולת של מחיר-הרצפה לבאונטיז נשאר ₪1,500 (Apify נכנס עכשיו דרך
  הגבול השנוי במחלוקת במקום דרך היעד), ולכן הרצפה ₪37.50 לא זזה.
- **בדיקת Netlify:** 404 = פנוי; 200 = תפוס; כל דבר אחר (כולל 301 של אתר שמפנה לדומיין שלו) = לא ידוע, כלומר נכשל
  בצד הבטוח. הבקשות לא עוקבות אחרי הפניות. הקריאה "Site not found = 404" היא מהזיכרון (grade none) וכך היא מתועדת
  בקובץ, בפלט ה-Markdown ובהערת הסקריפט.
- **דחיפה של הענף תפעיל את `brand-check.yml`:** הנתיבים כוללים עכשיו `research/measurements/*-candidates.txt`, ודחיפה
  מריצה כל רשימה שהשתנתה בה — כלומר את רשימת T1, ורק אותה. שיניתי במכוון את ההתנהגות הקודמת (שינוי בסקריפט בלבד
  הריץ מחדש את רשימת המותג): עכשיו שינוי בסקריפט בלבד לא מודד מחדש כלום, כדי שהמדידה שהכריעה את המותג ב-27.9 לא תתוארך
  מחדש בשקט. לא שיגרתי ולא דחפתי.
- **קלט ה-workflow מאובטח:** הקלט עובר דרך `env` ולא נכנס לטקסט הסקריפט; `outputsFor()` דוחה כל נתיב שאינו
  `research/measurements/<stem>-candidates.txt`; `set -f` מונע glob על הרשימה.
- **שמות הפלט:** רשימה `X-candidates.txt` כותבת `X-candidates.json` (הנתיב שבו נשמרו תשובות המותג ב-27.9) ו-`X-check.md`,
  כך שהפסיקה מקבלת בדיוק `t1-subbrand-check.md`.
- **INCOME_PLAN:60** נמצא בתוך פסקה מתוארכת "עודכן 28.9.2026". בסבב הראשון כתבתי בתוכה "אחרי אותה ישיבה: ₪1,100;
  מ-29.9.2026: ₪900"; הסוקר צדק שזה משכתב רשומה מתוארכת, ובסבב התיקונים היא שוחזרה והמספר עבר לפסקת 29.9 משלו (ממצא 7). אזכורי ₪3,500 נשארו (900+400+1,500+700 = 3,500 עדיין
  נכון), אבל התווית שונתה מ"הגבול השנוי במחלוקת של Apify" ל"נתון ה-₪1,500 שהדירקטוריון דחה", כי הגבול הוא עכשיו ₪200.
- **בסבב הראשון לא נגעתי** ב-`skills/revenue-apify-actors/SKILL.md:9` ("Audited ceiling: ₪200") — וזו הייתה טעות:
  התקרה אכן ₪200, אבל הסוגריים אחריה ("₪1,500 is recorded as the contested upper bound") הפכו לשקר, והיעד המתוכנן ₪0
  לא הופיע בספר ההפעלה בכלל. תוקן בסבב התיקונים (ממצא 1). ברשומות מתוארכות (REJECTED.md, טבלת 4.9 ב-INCOME_PLAN,
  `portfolio.ts:31`) לא נגעתי.

## 5. שגיאות וניסיונות שנכשלו
- הסקריפט הראשון שלי לעריכת הבדיקות (Python heredoc) נחסם על ידי שומר ה-worktree כ"מורכב מדי לאימות"; עברתי לכלי
  Edit — אותה תוצאה, בלי הסיכון.
- ב-worktree לא היה `node_modules`; קישרתי (symlink) לזה של הצ'קאאוט הראשי. הוא ב-`.gitignore` ולא נכנס לקומיט.
- שתי בדיקות נפלו אחרי המימוש הראשון: (1) "FABLE_QUEUE row 16" נשבר בין שתי שורות הערה בקובץ המועמדים — תיקנתי את
  הקובץ, לא את הבדיקה; (2) `summarizeTargetBasis` — ה-Inferred ירד מ-₪800 ל-₪600, השלכה אמיתית של (b); עדכנתי את
  המספר עם הערה.
- אין כאן `pdftotext` או `pypdf`, אז לא חילצתי טקסט מה-PDF החדש כדי לאמת את ₪900 בתוכו; הוא נוצר מה-md הערוך.
  (הסוקר חילץ אותו אחר כך עם pymupdf ומצא אותו תואם.)
- **מה הסבב הראשון פספס, לפי הסוקר:** grep על "1,100" בלבד לא תופס משפטים שקובעים את *מבנה* היעד ("committed ₪200",
  "contested ₪1,500 upper bound") — ולכן שני מסמכים שהסוכן של הקו קורא (ספר ההפעלה ו-PUBLISH.md) נשארו עם המספרים
  הישנים; וה-default של קלט ה-workflow נשאר מהגרסה הקודמת בלי שנשאלה השאלה מה הוא מריץ.

## 6. בדיקות ופעולות ולידציה
- לפני המימוש: 6 קבצי בדיקה, 21 כישלונות צפויים. אחרי: `npx vitest run src/__tests__/revenue` — 41/41 קבצים,
  1,063/1,063 בדיקות עוברות. `pnpm typecheck` — יציאה 0.
- בדיקות ה-Netlify רצות מול fetch מזויף בלבד (404/200/301/401/שגיאת DNS); שום בקשה לא יצאה מהקונטיינר, ו-CLI ה-brand-check
  לא הורץ כאן (כלל ₪0: שום API חי מכאן).
- `outputsFor` ו-`parseCandidates` נבדקו גם ידנית על שני הקבצים; ה-YAML של ה-workflow נותח בהצלחה ב-`yaml.safe_load`.
- `sync-portfolio` ו-`report` הורצו; ההבדל ב-REPORT.md נקרא (₪900, Inferred ₪600, apify ₪200 (target ₪0)).
- **סבב התיקונים:** נוספו שלוש קבוצות בדיקה — ב-`target-basis.test.ts` ספר ההפעלה ו-PUBLISH.md לא מכילים "₪1,500 is
  recorded as the contested upper bound" / "contested ₪1,500 upper bound" / "committed ₪200" / "₪200 (`apify-actors` target",
  וספר ההפעלה מכיל "**Planned target: ₪0**"; ב-`brand-check.test.ts` בדיקת ה-signal ובדיקת ה-`TimeoutError`, ובדיקה
  שלקלט `candidates` של ה-dispatch אין `default:`. כל אחת אומתה שהיא נכשלת על הגרסה הישנה: טקסט ה-HEAD של שני המסמכים
  תואם את הביטויים האסורים (grep); הסרת `signal` מ-`probeStatus` בעותק זמני — 2 כישלונות; החזרת ה-`default:` ל-YAML
  בעותק זמני — כישלון אחד; שני הקבצים שוחזרו מגיבוי ב-scratchpad.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **שינוי יעד של קו אחד נוגע בשבע בדיקות ובשלושה מסמכים.** המספרים ₪1,100/₪900 מופיעים מילולית ב-`target-basis`,
  `rails`, `bounties-intake`, `runner`, בהערות ב-`portfolio.ts`, `rails.ts`, `intake.ts`, וב-`INCOME_PLAN`/`OWNER_STEPS`.
  כדאי בדיקה אחת שסורקת את `docs/*.he.md` לסכום המחויב "של היום" מול `committedTargetIls()` — אז שינוי יעד ייכשל פעם
  אחת, במקום אחד, במקום להתגלות בגרפ ידני.
- **ה-PDF של צעדי הבעלים** מחודש ידנית אחרי כל עריכה של ה-md; כדאי צעד CI שמחדש אותו (או בדיקה שמשווה חותמת זמן/hash).

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת הפסיקה המלאה (509 שורות) — הכרחי, אבל רק (b)-(f) ו-(h)4 היו רלוונטיים; כ-40% מהקריאה היה (g)/(h) שלא בתחום.
- ניסיון העריכה ב-Python שנחסם — סבב אחד מבוזבז.
- גילוי השלכות הסכום דרך grep רחב על `1,100` בקוד ובבדיקות — משתלם; בלעדיו ארבע בדיקות היו נופלות רק בריצה המלאה.
- סבב חילוץ טקסט מה-PDF (שני ניסיונות בלי כלי) — מבוזבז; היה עדיף לבדוק זמינות כלים לפני.
- סבב התיקונים כולו (שבעה ממצאים) הוא מחיר של grep צר מדי בסבב הראשון; grep על "₪200"/"₪1,500"/"contested" בקבצים
  שמזכירים את `apify-actors` היה תופס את ממצאים 1, 2 ו-5 מראש.
