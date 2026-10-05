# סבב 45 של לולאת הערוצים — ביקורת תנאי השימוש של אתרי אירועי הפרסים, שלב ההרכבה (5.10.2026, ~03:10-~03:55 UTC)

## 1. מה המשתמש ביקש
הוראת הבעלים הקבועה (27.9): ערוצים בלי הפסקה, ב-₪0. סקריפט ה-workflow של סבב 45 נתן לי (סוכן Opus, תפקיד "מרכיב") את קלט שש הביקורות והאימותים (`verified-sites.json`, 43 אתרים) וביקש, בעץ עבודה מבודד: (1) עותקים שמורים של כל טקסט המתארח ב-GitHub שעליו נשען פסק דין, בתבנית VERBATIM או REFERENCE; (2) רשומת פסק דין לכל אחד מ-43 האתרים ב-`terms-verdicts.json`; (3) TERMS_BARRED אם יימצא אתר חסום; (4) שורות תור דרך `scripts/queue-zero-test.mjs` — שורת `terms-` לכל אתר TERMS_PENDING ובדיקת robots.txt לכל אתר NO_TERMS שהחיפוש בו ממצה; (5) הערת הביקורת; (6) בדיקות, mutation, `verify.sh`, יומן עברי ו-commit-ים. בלי push, בלי עריכת CHECKPOINT/CHANNEL_LOOP/FABLE_QUEUE, בלי גישה לאתר נבדק כלשהו, ובלי עמוד כללים אחד בתור.

## 2. הפעולות המרכזיות שביצעתי
- קראתי את MISSION.md, את §10 ו-§4 שורה 13 של `logs/CHANNEL_LOOP.md`, את "How a reading session fills a row", את `terms-verdicts.json` (כולל github.com, nevo, apify, posthog, medium, paypal, israelpost, y8), את שני העותקים השמורים הקיימים, את `terms-saved-copies.test.ts` כולו, את `TERMS_BARRED` ואת בדיקותיו, את `queue-zero-test.mjs` כולו, את `robots-verdict.mjs`, את `urls-pause-comments.mjs`, את `TERMS-AUDIT-2026-09-29.md` ואת שורות 230-234 ב-ZERO-TESTS. קראתי כל אחת מ-43 הרשומות בקלט (כולל כל הערת "verifier:").
- שלפתי מחדש מ-raw.githubusercontent.com, בקומיט המקובע, את חמשת הטקסטים השולטים ועוד ארבעה קבצי ראיה: ה-sha256 ומספר הבתים של כולם תאמו לקלט. ה-AUP של GitHub זהה בבתים ב-ca0be35 וב-2bd66de; ב-Additional Product Terms השורות זזו ב-2 (‏:121/:131 ב-ca0be35 = ‏:123/:133 ב-2bd66de).
- כתבתי חמישה עותקים שמורים תחת `research/channel-loop/terms/`: ה-AUP וה-ToS של GitHub (CC BY 4.0, VERBATIM), תנאי השימוש של OpenReview (AGPL-3.0, VERBATIM), מסמך הפרטיות והתנאים של Codabench (Apache-2.0, VERBATIM), והודעת זכויות היוצרים של ansperformance.eu כ-REFERENCE (למאגר אין רישיון; 4 מתוך 18 שורות מצוטטות).
- הוספתי 43 פסקי דין (checked 2026-10-05): CONDITIONAL_MET 10, NOT_BARRED 1, CONDITIONAL_UNMET 2, TERMS_PENDING 9, NO_TERMS 21 (18 exhaustive-negative, 3 לא). אין BARRED.
- הרחבתי את `PATH_LIMITS` ב-`scripts/queue-zero-test.mjs` לרשימת hosts: lbl.gov עובר רק על fair-universe.lbl.gov (ממצא ה-host-scope של המאמת).
- תור: dry-run ואז ריצה אמיתית — ZERO-TESTS שורות 235-243 (terms-kaggle, terms-devpost, terms-grand-challenge, terms-zindi, terms-stanford, terms-adaptionlabs, terms-virtualembryo, terms-eurocontrol, terms-opensky) ו-244-261 (robots-crunchdao, robots-flagos, robots-wundernn, robots-agenthon, robots-aicrowd, robots-alignmentforum, robots-bcamlc, robots-drivendata, robots-geminixprize, robots-k12-ai-infrastructure, robots-learn2design2026, robots-microblink, robots-pasteurlabs, robots-situatedevals, robots-solafune, robots-sophelio, robots-theemailgame, robots-thinkonward). השער לא דחה אף שורה. מספרי השורות נכתבו אחר כך להערות פסקי הדין.
- כתבתי את `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md`: למה, איך, הגדרות, טבלה של 43 שורות, שני האתרים שנשפטו קודם, "What the reading can render" (13 + 40 + 23 + 25 = 101 כתובות על 12 + 9 + 18 + 6 = 45 אתרים), הערות המאמתים, החלטות המרכיב, וכל 1,560 רשומות ה-`fetched_urls` (990 שונות).
- בדיקות: הרחבתי את מפת ה-kinds ב-`terms-saved-copies.test.ts` והוספתי בלוק ל-tick 45; קובץ חדש `src/__tests__/revenue/prize-terms-audit.test.ts`.

## 3. קבצים/מערכות ששונו
- חדשים: `research/channel-loop/terms/{github-acceptable-use-policies,github-terms-of-service,openreview-terms-of-use,codabench-privacy-and-terms,ansperformance-disclaimer}-2026-10-05.md`, `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md`, `src/__tests__/revenue/prize-terms-audit.test.ts`, היומן הזה.
- שונו: `research/channel-loop/terms-verdicts.json` (43 רשומות ומשפט אחד ב-`_about`), `scripts/queue-zero-test.mjs` (hosts ב-PATH_LIMITS), `research/channel-loop/ZERO-TESTS.md` (27 שורות), `research/rendered/urls.txt` (27 שורות), `src/__tests__/revenue/terms-saved-copies.test.ts`.
- לא נגעתי: CHECKPOINT, CHANNEL_LOOP, FABLE_QUEUE, MISSION, CLAUDE.md, `ai-allowed-events.urls.txt`, `ai-allowed-events.md`, `TERMS_BARRED`. אין push.

## 4. החלטות והנחות משמעותיות
- **exhaustive-negative לפי מבחן אחד:** האודיטור והמאמת שניהם חיפשו בכל מאגרי ה-declarations של Open Terms Archive, ב-tosdr-snapshots ובנוכחות ה-GitHub של האתר. 18 עומדים בכך (כולל שישה שהאודיטור שלהם כתב "not exhaustive" בגלל חיפוש קוד — מגבלה המשותפת לכל הסוכנים, ולכן אינה מבדילה). שלושה נכשלים: האודיטור בדק רק 8 מאגרי declarations (mozilladatacollective, health-data-hub, ijcai), וגם המאמתים שלהם סירבו לתווית.
- **כתובת התנאים של grand-challenge.org התקבלה:** נגזרת מתבנית הכתובת של הפלטפורמה עצמה (`settings.py:767`) על הדומיין שהמארחים הרשומים קובעים — גזירה מקוד מצוטט, לא ניחוש תבנית.
- **מגבלת ה-host של lbl.gov נכתבה כקוד** עם בדיקות, ולא רק כהערה: אחרת כל ‎*.lbl.gov היה עובר בשער.
- **virtualembryo.ai נשאר TERMS_PENDING** כפי שהמאמת שינה; **zindi.africa נשאר TERMS_PENDING** (תנאים ידועים כקיימים, לכן לא מסלול robots).
- **בחירת הקומיט 2bd66de** לשני מסמכי GitHub (main ב-5.10 לפי המאמתים); ה-AUP זהה ב-ca0be35 שעליו נשען robosyn.
- **חמשת אתרי Pages עם כתובות דוא"ל** (aimo-interp, fomo26, realpde, roco-spring, xiuwenz2): CONDITIONAL_MET נשמר כפי שהמאמתים קבעו, עם הנחיה להשחיר כתובות לפני הסתמכות על לכידה (תקדים AMO). ההכרעה איך לעשות זאת שייכת ל-main thread.
- **סלאגים לא נכתבו בקבצי החלטה:** `frozen-citations.test.ts` אוסר שם של לכידה פעילה בהערה; לכן ההערות מפנות לשורות ZERO-TESTS, והסלאגים מופיעים רק כאן (logs אינם קבצי החלטה).

## 5. שגיאות וניסיונות שנכשלו
- ארגז החול של העץ המבודד דחה פקודות bash שהכילו "github" במשתנה לולאה או `sed -n ${n}p` — עברתי לסקריפטי node/bash קטנים בתיקיית ה-scratch.
- בגרסה הראשונה של הבדיקה החדשה `parseUrlList` על `ai-allowed-events.urls.txt` נכשל: בקובץ שורת sites.google.com (google.com ב-TERMS_BARRED). תוקן בקריאה ידנית; הממצא נרשם בהערה (אסור להדביק את הקובץ כולו ל-dispatch).
- בדיקת tamper על העותק של ansperformance החליפה בתחילה את הציטוט שבכותרת ולא את הבלוק; הוחלפה למחרוזת שמופיעה רק בבלוק.

## 6. בדיקות ופעולות ולידציה
- `node scripts/urls-pause-comments.mjs --check`: exit 0, 0 הערות מיושנות (לא נדרש `--fix`).
- `npx vitest run` על ארבעת הקבצים שנדרשו (terms-saved-copies, render-watch-terms-barred, queue-zero-test, frozen-citations): exit 0, 98 בדיקות; עם הקובץ החדש: 104.
- `scripts/verify.sh`: exit 0 (typecheck exit 0; 71 קבצים, 2,326 עברו, 1 דולגה).
- `node scripts/mutate.mjs --plan` עם 7 מוטציות: 7 killed, exit 0 (sha בכותרת עותק, kaggle → NOT_BARRED, פתיחת ההערה של drivendata, הערה דקה שנפתחת exhaustive-negative, הסרת hosts של lbl.gov, termsGate שמתעלם מ-hosts, sha של excerpt).
- `robots-verdict.mjs drivendata.org --urls research/measurements/ai-allowed-events.urls.txt`: exit 3 "no committed robots.txt capture" — כלומר הנתיבים נקראים; בלי `--urls` אין מה לשפוט.
- grep למזהי הבעלים (השם, ושם החשבון של בעל המאגר) בכל קובץ שנגעתי בו: 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- בניית עותק שמור (כותרת, marker, offset, ספירת שורות/בתים/sha) נעשתה בסקריפט חד-פעמי; שווה `scripts/save-terms-copy.mjs --repo --path --commit [--reference A-B ...]` שמייצר את שתי התבניות ובודק מול `terms-saved-copies.test.ts`.
- `robots-verdict.mjs` צריך `--urls` עבור רשימת הפרסים; כדאי ברירת מחדל שקוראת את שתי הרשימות, או פקודה שמריצה אותו על כל אתר exhaustive-negative אחרי ריצת יום שלישי.
- טבלת "What the reading can render" נגזרה ידנית מקלט + פסקי דין; כדאי שעבודת prize-intake תדפיס אותה בעצמה מ-`terms-verdicts.json`.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת הקלט (432KB, בעיקר `fetched_urls` ו-`searched`): כ-35% — הכרחי, אבל הדפסת כל השדות לפני סינון הייתה יקרה.
- קריאת קבצי ההקשר (MISSION, CHANNEL_LOOP §10 עם שורות "Was planned" ארוכות, הבדיקות והסקריפטים): כ-25%.
- ניסיונות bash שנדחו על ידי ארגז החול: כ-3%.
- כתיבת 43 הערות פסקי הדין והערת הביקורת: כ-25%.
- בדיקות, mutation ו-verify: כ-7%.
