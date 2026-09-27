# 27.9.2026 — ביצוע ההוראות של דירקטוריון סריקה 2 (BOARD-2), רישוי Pro, ומבחן Metaculus

המשך ישיר של `logs/2026-09-26-fable-queue-and-sweep2-screen.md` (שם: פריטים 1-2 בתור Fable). כאן: פריטים 3-4 בתור,
והבנייה שהדירקטוריון הורה עליה. לבונה של ספירת הבאונטים יש יומן משלו: `logs/2026-09-27-algora-supply-count.md`.

## 1. מה המשתמש ביקש
- אין בקשה חדשה מאז "מה עכשיו, תמשיך" (25.9). ההוראה העומדת: "תעבוד ותעשה דברים לבד". כל מה שנכנס בסשן הזה היה
  התראות מערכת (CI, בדיקות Fable מתוזמנות, דוחות של סוכני-משנה) — לא קלט של הבעלים.

## 2. הפעולות המרכזיות שביצעתי
1. **פריט 3 בתור (Fable): איך מנפיקים רישיון Pro ל-il-biz-tools** — Option C: מפתחות רישיון מקוריים של Gumroad,
   אימות מול `api.gumroad.com/v2/licenses/verify`, מטמון מקומי ובדיקה חוזרת לכל היותר כל 7 ימים, ביטול רק על תשובה
   חד-משמעית (`ebe0d8d`). נבנה על ידי בונה Opus מול 18 בדיקות קבלה, נסקר והתקבל: 217/217; AT-15/16 מחכות לטוקן של
   הבעלים (`619c4d7`..`a09fe24`). `make-license.js` נמחק.
2. **פריט 4 בתור (Fable): הדירקטוריון של סריקה 2** (`9d8d72c`) — תשעה סוקרים אושרו, אף קו לא נכנס; Metaculus
   נשלח ל-TEST_FIRST; סעיף התנאים של Algora לא חל על ה-PR-ים שלנו (חל על דפי algora.io בלבד), בתנאים. קופל ל-REJECTED
   (`a2291d1`). התור של Fable ריק.
3. **תיקון spec-watch של PCN874** (`58c6904`): הבדיקה נעלה קובץ lock ריק ולכן לא יכלה לומר CHANGED; ה-lock נזרע
   מה-hashes של הלכידות ב-render-watch.
4. **ספירת היצע שבועית ל-oss-bounties** (BOARD-2 §2.2) — בונה Opus; נסקרה על ידי. **תיקון בסקירה:** הבונה הוסיף
   מסנן `solution-merged` להגדרה של הדירקטוריון. הספים (10/3) נקבעו על ההגדרה של הדירקטוריון, אז המספר המדורג נשאר
   עליה, והמספר המחמיר מדווח לידו בלי שער (`4ae25c2`). ה-workflow רץ רק מ-main.
5. **מבחן Metaculus (BOARD-2 §1.9)** — קודם שיגרתי את `render-watch` עם שתי כתובות הלוח (403, גוף ריק). זה לא היה
   הערוץ שהדירקטוריון ציין, אז נבנה `metaculus-template.yml` (`c107af4`): לוקח את כתובת הבסיס ואת מזהי העונות מקוד
   הספרייה `forecasting-tools==0.3.1` ובודק שהם תואמים לסקריפט, וקורא דרך `requests` בלי טוקן. תשובת השרת:
   *"The API is only available to authenticated users"* — **KILL** לפי קו ההריגה הראשון, כפי שנכתב (`c82d5bd`, `35ce69e`).
6. **מסמכי הבעלים** (`35ce69e`): צעד 4 — הערת "לא מבקש עכשיו" עד קריאת שבוע 4; צעד 4(ב) וצעד 7 — חשבון משתמש רגיל ושם
   שלא מסתיים ב-`bot`; שורת `BRAND_GITHUB_TOKEN` — עדיין לא להדביק, מהסיבה החדשה; `owner-steps.ts` תואם; PDF חודש.
   `algora-terms-question.md` → RULED.

## 3. קבצים/מערכות ששונו
- `products/il-biz-tools/` (Option C), `.github/workflows/gumroad-pro-product.yml`, `gumroad-pro-probe.yml`.
- `src/revenue/bounties/{supply,supply-github,policy,intake,index}.ts`, `scripts/algora-supply.ts`,
  `.github/workflows/algora-supply.yml`, `src/revenue/{measurements,runner,portfolio,owner-steps}.ts`.
- `scripts/metaculus-template.mjs`, `.github/workflows/metaculus-template.yml`,
  `research/measurements/metaculus-template-2026.md`, `research/rendered/metaculus-lb-*`.
- `docs/OWNER_STEPS.he.md` + PDF, `docs/REJECTED.md`, `research/measurements/algora-terms-question.md`,
  `products/pcn874/docs/SPEC-SOURCES.lock.json`.
- בדיקות: `bounties-supply*.test.ts`, `no-algora-requests.test.ts`, `metaculus-template.test.ts` ועוד.

## 4. החלטות והנחות משמעותיות
- **לא מזיזים קו אחרי שהכלל נכתב.** מסנן `solution-merged` של הבונה נכון לגופו, אבל הדירקטוריון בחר את 10 ו-3 מול
  ההגדרה שלו. המספר המחמיר מוצג לצד המספר המדורג; הדירקטוריון יכריע בשבוע 4 אם הוא רוצה אותו.
- **קו הריגה שנורה על ערוץ שאינו הערוץ שנקבע — לא נחשב עד שהערוץ הנכון נבדק.** 403 של render-watch (User-Agent של
  דפדפן) לא הספיק; רק אחרי שהערוץ של הספרייה נבדק והשרת נימק, הפסק נרשם. הסקריפט מחזיר PENDING עד שכל הערוצים רצו.
- **Metaculus לא נוסף ל-`portfolio.ts`.** הדירקטוריון אמר "רשימה מותנית ב-₪0" בזמן שהמבחן תלוי; המבחן הוכרע ל-KILL,
  והוא אף פעם לא היה קו (`KILLED_LINES` דורש יעד קודם > 0). מקומו ב-REJECTED.md.
- **תנאי הכללים של Metaculus נבדק ביד** מקוד האתר ב-GitHub (`futureeval-participate-tab.tsx:84,204,234`) — הבוטים
  עדיין זכאים לפרסים, אז קו ההריגה הזה לא נורה. זה מתועד בדוח עם תאריך.
- **ה-workflow של Metaculus רץ רק מענפי עבודה, לא מ-main** — מבחן חד-פעמי לא אמור לכתוב ל-main במיזוג.

## 5. שגיאות וניסיונות שנכשלו
- **הניסיון הראשון ל-Metaculus היה קיצור דרך** (render-watch במקום הערוץ של הספרייה). תוצאה מילולית של KILL, אבל לא
  על הערוץ שנקבע — חוזר על אותה טעות שנתפסה ב-Algora (קו שנורה על הנחה שנויה במחלוקת). תוקן בריצה שנייה.
- **גרסה ראשונה של `evaluate`** החזירה KILL כשערוץ אחד עוד לא רץ — תוקן ל-PENDING לפני הקומיט.
- **בדיקה ראשונה של "אין Authorization ב-workflow"** נכשלה על ההערות בקובץ שמזכירות את המילה; הודקה ל-`secrets.` ולכותרת
  בפועל.
- fixture של "רצועת האמצע" ($300-$400) חושב לא נכון בפעם הראשונה (יצא PASS); תוקן לציון 8.4 (≈$350).
- `scripts/pdf-text.mjs` לא רץ (`pdfjs-dist` לא מותקן) ואין `pdftotext` — טקסט ה-PDF החדש **לא** נבדק מכנית בסבב הזה;
  המחולל הוא אותו מחולל שנבדק ב-pypdf ב-26.9.

## 6. בדיקות ופעולות ולידציה
- revenue 578/578, `tsc --noEmit` נקי (אחרי כל שלב). il-biz-tools 217/217.
- בדיקת הספרייה של ה-workflow הורצה מקומית מול ה-wheel שהורד (0.3.1): base/32916/33022 תואמים.
- נתיב ה-API של Metaculus נקרא מהקוד שלהם: `scoring/urls.py`, `scoring/views.py:105-106` (`AllowAny` — בקוד; בפועל
  Cloudflare/שכבה מעליו חוסמת), `metaculus_web/urls.py:44`.
- חישוב הפרס הנגדי מקובע בבדיקות מול `scoring/utils.py:224-231,527-548`.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **"בדוק שהקו נורה על הערוץ הנכון"** חזר פעמיים (Algora, Metaculus). כדאי שכל מבחן מוגדר-מראש יכלול את רשימת
  הערוצים שלו בקוד (כמו `CHANNELS` כאן), ושהמעריך יחזיר PENDING עד שכולם רצו.
- **קריאת טקסט PDF** — להוסיף `pdfjs-dist` ל-devDependencies או לעבור ל-pypdf בסקריפט, כדי שבדיקת ה-PDF לא תלויה במה
  שמותקן בקונטיינר.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- ריצת render-watch על Metaculus שלא הייתה הערוץ שנקבע — קטן (קריאה אחת), אבל הוליד סבב נוסף של workflow.
- קריאות חוזרות של `BOARD-2.md` בחלקים — הקובץ ארוך; תקציר ההוראות (§hand-off) היה מספיק ברוב המקרים.
- הבונה של ספירת הבאונטים: ~377K אסימונים, 89 כלים, ~25 דקות — סביר לגודל, אבל הוא בנה מסנן שלא התבקש ונדרש תיקון.


## המשך — 27.9.2026, 09:45-11:05 UTC: פסיקות Fable, שם המותג, וסרטון T1

### 1. מה המשתמש ביקש
- אין בקשה חדשה; ההוראה העומדת "תעבוד ותעשה דברים לבד". כל הקלט היה התראות מערכת ודוחות סוכנים.

### 2. הפעולות המרכזיות שביצעתי
1. **קורא אנליטיקס של YouTube** (`src/revenue/youtube-analytics.ts`) מול הטבלאות של Google שרונדרו מ-runner.
2. **שלוש פסיקות Fable, כל אחת סוכן בודד:** רישיון CC BY 3.0 IGO (נכנס עם 5 תנאים); pin של מדד הצפיות
   (`engagedViews`) ודגל תוכן סינתטי (`true` + משפט גילוי + Kokoro בלבד); שם המותג (**mehudak**). הכול יושם בקוד ונבדק.
3. **"Bediyuk" תפוס** — נבדק מ-runner (RDAP, GitHub, YouTube); 16 מועמדים, 6 פנויים, Fable בחר. placeholder-ים שונו,
   צעדי הבעלים נותנים את השם.
4. **סרטון T1** — בונה Opus; שני מבקרי Opus נפרדים; FAIL על מסגור → תיקון 1 → PASS בשלושתם → השער עובר.
   בדרך: עמודי Octoverse ו-"about repository languages" רונדרו מ-runner כדי שהסרטון יצטט ולא ינחש.

### 3. קבצים/מערכות ששונו
- `src/revenue/{youtube-analytics,publication-gate,portfolio}.ts` + בדיקות; `scripts/{youtube-analytics.ts,brand-check.mjs,
  publication-check.ts}`; `.github/workflows/{brand-check,chart-explainer-ci,chart-explainer-render}.yml`.
- `products/chart-explainer/` (כולו חדש), `products/mcp-il-tools/*` (שם), `docs/OWNER_STEPS.he.md` + PDF.
- `research/faceless-youtube/{LICENCE-IGO-DECISION,PREREG-DECISIONS,T1-PROTOCOL,T1-PRECHECK,DATASETS}.md`,
  `research/measurements/brand-*`, `research/rendered/` (כ-20 לכידות חדשות), `logs/FABLE_QUEUE.md`.

### 4. החלטות והנחות משמעותיות
- **פסק דין קשור ל-hash של התסריט.** ביקורת על טיוטה לא עוברת לגרסה מתוקנת — זה מה שהפך את תיקון 1 לבטוח.
- **אותם מבקרים בדקו את התיקון** (הם יודעים מה דרשו); עצמאות נשמרת כי הם לא המחבר והם מחשבים מחדש בקוד משלהם.
- **Fable שימש רק להחלטות** (רישיון, pin, דגל, שם) — אחת בכל פעם; הבנייה והביקורות על Opus.
- **לא הוספתי את Metaculus/Bediyuk לשום מקום שדורש יעד** — נרשמו ב-REJECTED / במסמך המדידה.
- **ה-MP4 לא ב-git**; ראיות הריצה שעברה כן (`releases/t1/`), כי "עבר" בלי ראיה הוא טענה.

### 5. שגיאות וניסיונות שנכשלו
- ניסוח ראשון ב-`portfolio.ts` הכיל נתיב עם "measurements" ושבר בדיקה שאוסרת את המילה ברשימת החוסמים — נוסח מחדש.
- ה-hook ביקש שוב ושוב לקמט עבודת בונה באמצע; קימטתי רק מצבים ירוקים, ומצב אדום (65/67) נשאר בחוץ עם הסבר.
- טיוטת התיקון הראשונה של T1 יצאה 122.3 שנ' — בדיקת האורך ב-render.py עצרה אותה.
- push אחד נדחה כי runner דחף לכידה באמצע — rebase ו-push חוזר.

### 6. בדיקות ופעולות ולידציה
- revenue 627/627; pytest של chart-explainer 91/91; mcp-il-tools 10/10; owner-steps 13/13; tsc נקי.
- חישוב עצמאי שלי של המספרים המרכזיים של T1 מה-CSV — תואם. ffprobe על כל רינדור. publication-check על ה-manifest
  וגם על העותק ב-`releases/t1/`.
- הסקריפט של האנליטיקס נבדק מול נקודת ה-token האמיתית של Google עם פרטים מזויפים (invalid_client, כלום לא נכתב).

### 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **בדיקת "האם שם פנוי"** — הפכה לסקריפט + workflow (`brand-check`). 
- **שיגור render-watch עם override** קרה 7 פעמים היום; כדאי פקודה אחת (`scripts/render.sh <url> <slug>`) שמוסיפה ל-urls.txt
  עם הערת ציטוט ומשגרת.
- **קימוט WIP של בונה לפי דרישת ה-hook** — כדאי שהבונים יעבדו ב-worktree כך שהעץ הראשי יישאר נקי.

### 8. על מה בוזבזו אסימונים, לפי פעולה
- סבבי hook על עבודת בונה באמצע (~10 סבבים) — כל אחד הריץ pytest ובדק סטטוס. worktree היה חוסך את כולם.
- התראות CI על SHA ישנים (~25) — כל אחת קריאה ותשובה קצרה.
- הרינדור הראשון של T1 לפני שהמסגור נבדק — הביקורות היו מוצאות את בעיית Octoverse גם מוקדם יותר אילו הבונה חיפש
  את הכותרת המתחרה לפני הכתיבה. לקח לבריפים הבאים: "מה המקור הכי מוכר שאומר אחרת?" לפני התסריט.
