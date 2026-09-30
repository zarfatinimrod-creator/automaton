# פסיקת הווידאו 30.9, צעד קיפול 10: P-1, P-2, P-3 בקוד (30.9.2026, worktree של Opus)

## 1. מה המשתמש ביקש
- משימה מהתזמורת (לא מהבעלים): לממש את צעד 10 של "Fold actions for Opus" ב-`research/channel-loop/RULING-2026-09-30-video.md`, לפי §16(c) סעיף 7:
  - **P-1:** שער רישיון קריינות ב-`src/revenue/publication-gate.ts`.
  - **P-2:** כלל הריגה ל-T1 ב-`src/revenue/experiments.ts`: עקיפה שנייה של "made for kids".
  - **P-3:** מסילת AdSense אחת, שנספרת פעם אחת בחשבונאות התיק.
- תנאים: TDD, קובץ vitest ממוקד לכל חלק, בדיקת מוטציה אחת לכל חלק, והרצת חבילת revenue ו-typecheck עם קוד יציאה.

## 2. הפעולות המרכזיות שביצעתי
- **בדיקת בסיס:** HEAD היה `09ed5c4`, ושני הקבצים הנדרשים קיימים. הותקנו התלויות.
- **P-1:**
  - **עותק מוקפא:** נוצר `research/rendered/kokoro-82m-model-card-2026-09-29.{html,txt,meta.json}`. זה עותק זהה בבתים ללכידה ש-`f9a41c6` שמר. ה-meta נושא בלוק `frozen`, כמו בתקדים של nevo.
  - **השורות שנפתחו מחדש:**
    - `:235` ו-`:241` הן הצהרת נתוני האימון, לא שורות רישיון.
    - רישיון המשקולות נמצא ב-`:53` וב-`:97`.
    - המשפט על "custom voice clones" עבר ל-`:245`. ההערה בשער ציטטה `:237`, שהיה סחף, ותוקנה.
  - **רשימת ההיתר:** 54 מזהי הקול של `voices-v1.0.bin`. זה הקובץ ששני המוצרים נועלים ב-sha256 `bca610b8…`. הרשימה נקראה מהעותק המקומי של הקובץ, שה-hash שלו אומת. המספר 54 תואם לשורת v1.0 בכרטיס ("8 & 54", `:141`, `:147`).
  - **סירוב בשם:** `he_shaul` ו-`voices-hebrew.bin` נדחים בשם, עם השורות `yk2-hf-kokoro-hebrew-nc.txt:60`, `:62`, `:64`, `:70`.
  - **מיקום השער:** השער יושב בתוך G7 של `checkPublication`, והוא המסלול האמיתי: `scripts/publication-check.ts` מריץ אותו ב-CI על המניפסט של ה-renderer.
- **P-2:**
  - **השדה:** `ExperimentReadings.madeForKidsOverrides: number | null`.
  - **ההכרעה:** 1 מחזיר `escalate` (`K-mfk-override`). 2 ומעלה מחזירים `kill` (`K-mfk`). הערך null מוסיף את ההערה "K-mfk has no reader".
  - **היכן נרשם הקריטריון:** הוא נרשם כ-`MADE_FOR_KIDS_OVERRIDES = { killAt: 2 }`, עם pin משלו, מחוץ ל-`FACELESS_YOUTUBE_EXPERIMENT.gates`.
- **P-3:**
  - **המסילה:** `PayinRail` קיבל את `"adsense"`.
  - **הספירה:** `platformConcentration` סופר כל קו ש-AdSense משלם לו תחת `ADSENSE_PAYEE_ACCOUNT` אחד.
  - **בדיקה צולבת:** `linesMissingAdsenseRail` משווה בין `TARGET_BASIS.rail` לבין `LINE_RAILS`, בשני הכיוונים.

## 3. קבצים/מערכות ששונו
- **קוד:** `src/revenue/publication-gate.ts`, `src/revenue/experiments.ts`, `src/revenue/rails.ts`, `src/revenue/portfolio.ts` (הערת תיעוד בלבד).
- **בדיקות:**
  - חדשות: `src/__tests__/revenue/narration-licence-gate.test.ts`, `t1-made-for-kids-kill.test.ts`, `adsense-rail.test.ts`.
  - עודכנה: `experiments.test.ts`. השדה החדש נוסף לפונקציית העזר.
- **נתונים:** `research/rendered/kokoro-82m-model-card-2026-09-29.*`, שלושה קבצים.
- **היומן הזה.**
- **לא נגעתי:** `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md`, `logs/FABLE_QUEUE.md`, `MISSION.md`, `CLAUDE.md`.

## 4. החלטות והנחות משמעותיות
- **P-1 יושב ב-G7 ולא במזהה שער חדש.**
  - G7 כבר בודק את מנוע הקריינות.
  - G11 שמור לשער הקהל של ASSESSMENT §9.2.
  - `--expect` ב-CI מקבל רק G1-G10.
- **`voicesFile` אופציונלי במניפסט.** `manifest.py` של chart-explainer לא כותב אותו היום. הארכיון נעול ב-sha256 ב-`tts.py`, כך ש-`voices-hebrew.bin` לא יכול להגיע למסלול בלי לשנות נעילה. השער מסרב לשם בכל מקום שהמניפסט נוקב בו.
- **ראיות הרישיון נבדקות בבדיקה ולא בזמן ריצה.**
  - הבדיקה פותחת כל שורה מצוטטת בעותק המוקפא ומוודאת את הציטוט.
  - הנתיבים קבועים. בדיקת קיום בזמן ריצה הייתה משנה את `exists` של הבדיקות הקיימות, והייתה מוסיפה G7 לתרחיש "a missing licence snapshot" ב-publication-check.
- **רשימת ההיתר מכילה את כל 54 הקולות הרשמיים.** זה נוסח הפסיקה, "Kokoro-82M's official voices". היא לא צומצמה לשני הקולות שבשימוש (`af_heart`, `ef_dora`).
- **P-2:**
  - **ההסלמה בעקיפה הראשונה:** היא נובעת מ-ASSESSMENT.md:421-422 ("the line is flagged to the board"), שהפסיקה מצטטת.
  - **הספירה:** עקיפה נספרת כשיוטיוב קובע אותה, גם אם הערעור היחיד יתקבל אחר כך. זו הקריאה המילולית של "a second Made-for-Kids override".
- **P-2 מחוץ ל-`gates`:** לשערים של 27.9 יש hash נעוץ ("the pre-registered gates have not been edited"). הוספת שדה הייתה שוברת אותו. הקריטריון החדש נרשם בנפרד עם תאריך ו-pin משלו, כמו `WEB_ARM_REACH`.
- **P-3 ב-`rails.ts` ולא רק ב-`portfolio.ts`:**
  - המסילות והריכוזיות ממודלות ב-`rails.ts`: `LINE_RAILS`, `railConcentration`, `platformConcentration`.
  - `portfolio.ts` קיבל רק תיעוד של `TargetBasis.rail`, והבדיקה הצולבת נשענת עליו.
  - היום אין בתיק קו ש-AdSense משלם לו. T1 הוא ניסוי ולא קו.

## 5. שגיאות וניסיונות שנכשלו
- **ה-hash של השערים:** בגרסה הראשונה של P-2 הוספתי את `mfkOverridesKillAt` ל-`gates`, ובדיקת ה-hash של 27.9 נכשלה. התיקון העביר את הקריטריון לקבוע נפרד. ה-hash לא עודכן.
- **פקודות שנחסמו:** heredoc של Python שכתב את ה-meta נחסם בבידוד ה-worktree. ה-meta נכתב בכלי Write, ו-`diff` מול ה-meta החי אימת אותו.

## 6. בדיקות ופעולות ולידציה
- **RED:** כל קובץ בדיקה הורץ לפני המימוש ונכשל מהסיבה הנכונה.
  - P-1: 13 מתוך 15 נכשלו.
  - P-2: 5 מתוך 7 נכשלו.
  - P-3: 5 מתוך 7 נכשלו.
- **מוטציות, אחת לכל חלק, וכל אחת נתפסה:**
  - P-1: בדיקת רשימת ההיתר בוטלה (`if (false && …)`), ו-4 בדיקות נכשלו.
  - P-2: `>=` הוחלף ב-`>`, והבדיקה "2 overrides kill" נכשלה.
  - P-3: `banAccount` החזיר את `platformAccount`, ובדיקת החשבון האחד נכשלה.
  - אחרי כל מוטציה המקור שוחזר והבדיקות חזרו לירוק.
- **חבילת revenue:** `npx vitest run src/__tests__/revenue` יצא עם 0. עברו 52 קבצים ו-1473 בדיקות.
- **typecheck:** `pnpm typecheck` יצא עם 0.
- **המסלול האמיתי:**
  - `npx tsx scripts/publication-check.ts products/chart-explainer/releases/t1/manifest.json` מחזיר PASS ויוצא עם 0.
  - עותק שלו עם `he_shaul` מחזיר FAIL G7 עם שורת הסירוב, ויוצא עם 1.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **הקפאת לכידה:** העתקה, שינוי slug ונתיבים ובלוק `frozen`. זו הפעם השנייה (nevo, kokoro). סקריפט `scripts/freeze-capture.mjs <slug> <date>` יחסוך את זה וימנע טעויות.
- **בדיקת מוטציה:** גיבוי, sed, הרצה ושחזור. אפשר לעטוף את זה בסקריפט קטן.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- **כרטיסי המודל:** קריאתם המלאה, ושל RENDER-CHECK, כדי למצוא את שורות רישיון המשקולות. זה היה נחוץ: צעד 10 מכנה את `:235` ו-`:241` "licenceEvidence", אבל הן שורות נתוני האימון (כך גם הפסיקה עצמה ב-16(c) סעיף 7), ורישיון המשקולות נמצא בשורות אחרות.
- **P-2 שנכתב פעמיים:** בגלל ה-hash הנעוץ של השערים. קריאה מוקדמת של `experiments.test.ts` הייתה חוסכת את זה.
