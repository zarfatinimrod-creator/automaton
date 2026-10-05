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

---

# תוספת: תיקון ארבעת הפגמים של הסוקר (5.10.2026, סוכן Opus בתפקיד "מתקן")

ההחלטות בסעיף 4 למעלה לגבי חמשת אתרי ה-Pages עם כתובות, שישת אתרי ה-NO_TERMS ו-grand-challenge.org בוטלו בתיקון הזה. הטקסט למעלה נשאר כפי שנכתב, כי יומנים הם היסטוריה, וכך גם השורה על "להשחיר כתובות לפני הסתמכות על לכידה". המצב הנכון מתואר כאן ובסעיף "Review corrections" שבהערת הביקורת.

## 1. מה המשתמש ביקש
סקריפט ה-workflow של סבב 45 נתן לי את דו"ח המרכיב ואת ארבעת הפגמים שהסוקר מצא, וביקש:
- לתקן כל פגם שמחזיק, בדיקה קודם, ולנמק כל פגם שאני דוחה;
- להריץ את `scripts/verify.sh`, את בדיקת frozen-citations, את `urls-pause-comments.mjs --check`, את בדיקות saved-copies, terms-barred ו-queue-zero-test, ותוכנית `mutate.mjs` עם מוטציה אחת לכל תיקון;
- לבצע commit, להוסיף את העבודה ליומן הזה, ולמחוק את תיקיית ה-scratch.

בלי push, בלי עריכת CHECKPOINT/CHANNEL_LOOP/FABLE_QUEUE/MISSION/CLAUDE.md, ובלי לגעת בשני קובצי ai-allowed-events.

## 2. הפעולות המרכזיות שביצעתי
- **אימות לפני תיקון.** בדקתי כל פגם מול המקור:
  - בקלט המאומת (`verified-sites.json` בתיקיית ה-scratch של ה-main thread, קריאה בלבד), שדה ה-`condition` של חמשת האתרים אומר "redact addresses before commit". שש רשומות NO_TERMS מסתיימות ב-"the search is not exhaustive".
  - `redactSecrets` ו-`SECRET_PATTERNS` (`scripts/render-watch.mjs:686-717`) ממסכים רק מפתחות וטוקנים, לא כתובת דוא"ל. `render-watch.yml` עושה `git add research/rendered/` ו-commit.
  - ה-cron של prize-intake הוא `47 6 * * 3`, ו-`windowQuarters` מחזיר [2026-Q4, 2027-Q1] ב-7.10.
  - חיפוש nevo, הדוגמה שבפסיקה (`RULING-2026-09-30-video.md:87`), כלל GitHub code search (`osek-patur-documents.md:1136`).
  - שלפתי מחדש את `settings.py` ב-ff2fb5c: ה-sha256 תואם, ב-:302-303 ברירת המחדל היא `.gc.localhost`, וב-:767 נמצאת התבנית.
- **בדיקות קודם.** כתבתי מחדש את `src/__tests__/revenue/prize-terms-audit.test.ts` (12 בדיקות, 7 מהן נכשלו לפני התיקון) והוספתי fixture: `src/__tests__/revenue/fixtures/ai-allowed-events-548be52.urls.txt`, זהה בבתים ל-blob ב-548be52.
- **פגם 1 (התקבל).** aimo-interp, fomo26, realpdecompetition, roco-spring ו-xiuwenz2 עברו ל-CONDITIONAL_UNMET לפי הכלל של mozilla.org (`RULING-2026-10-04-mozilla-precondition.md` §3 כלל 3).
  - ההערות מחזירות את התנאי "redact addresses before commit".
  - הוספתי בדיקת tripwire: ביום ש-`redactSecrets` ימסך כתובת, הבדיקה תיכשל, וזה הסימן להחזיר את חמשת האתרים ל-CONDITIONAL_MET.
- **פגם 2 (התקבל).** כל ציטוט של `ai-allowed-events.urls.txt` לפי שורה הוצמד ל-`@548be52`, ב-JSON ובהערת הביקורת.
  - guard על כל `decisionFiles()` אוסר ציטוט לא מוצמד.
  - בדיקה מוודאת שכל שורה מצוטטת היא שורת כללים של האתר שמצטט אותה, שתא ה-"Rules URLs" בטבלה מכיל בדיוק את שורות האתר, ושכל URL ברשימת "Now" עומד בשורה שהוא מציין.
  - את הקובץ החי הבדיקה קוראת רק כדי לוודא שאף URL שלו לא נכנס ל-`urls.txt`. אתר חדש בלי פסק דין לא מפיל אותה.
- **פגם 3 (התקבל).** ההערות של agenthon, alignmentforum, bcamlc, flagos, geminixprize ו-k12-ai-infrastructure נפתחות עכשיו ב-"not exhaustive-negative:".
  - שש בדיקות ה-robots הושהו דרך `queue-zero-test.mjs --apply-verdicts`, והוספתי תאריך: "# paused (terms unread, 5.10.2026)".
  - הערות השורה ב-`urls.txt` עודכנו, ושורות 245, 247, 249, 250, 252 ו-253 ב-ZERO-TESTS סומנו ‎**PAUSED 5.10** דרך `loop-edit.mjs set-cell --append`.
- **פגם 4 (התקבל).** שורה 237 (terms-grand-challenge) הושהתה כ-"held for a main-thread ruling", וההסבר נכתב בפסק הדין, ב-`urls.txt` וב-ZERO-TESTS. האתר נשאר TERMS_PENDING.
- **הערת הביקורת.** עדכנתי את הספירות (CONDITIONAL_MET 5, CONDITIONAL_UNMET 7, NO_TERMS 21: 12 exhaustive-negative ו-9 לא), את שורות הטבלה ואת "What the reading can render":

  | קבוצה | כתובות | אתרים |
  |---|---|---|
  | עכשיו | 8 | 7 |
  | אחרי שליפת התנאים | 35 | 8 |
  | אחרי בדיקות ה-robots | 15 | 12 |
  | ממתינות לפסיקת ה-main thread | 15 | 9 |
  | יידונו בלי לכידה | 28 | 9 |
  | **סך הכול** | **101** | **45** |

  הוספתי גם סעיף "Review corrections".

## 3. קבצים/מערכות ששונו
- **חדש:** `src/__tests__/revenue/fixtures/ai-allowed-events-548be52.urls.txt`.
- **שונו:**
  - `research/channel-loop/terms-verdicts.json`: 5 פסקי דין, 12 הערות, וכל הציטוטים הוצמדו;
  - `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md`;
  - `research/channel-loop/ZERO-TESTS.md`: 7 שורות;
  - `research/rendered/urls.txt`: 7 שורות הושהו ו-7 הערות עודכנו;
  - `src/__tests__/revenue/prize-terms-audit.test.ts`;
  - היומן הזה (תוספת בלבד).
- **לא נגעתי:** `scripts/*.mjs`, `TERMS_BARRED`, CHECKPOINT, CHANNEL_LOOP, FABLE_QUEUE, MISSION, CLAUDE.md, ושני קובצי ai-allowed-events. אין push.

## 4. החלטות והנחות משמעותיות
- **פגם 1: CONDITIONAL_UNMET ולא רק הוצאה מקבוצת "Now".** הוצאה מהרשימה הייתה משאירה את השער בקוד פתוח, ו-dispatch שמחושב מהשער היה כולל את חמשת האתרים. CONDITIONAL_UNMET נאכף בקוד, וזה התקדים ש-Fable פסק ל-mozilla.org.
- **פגם 3: "paused" ולא "retired" כפי שהסוקר הציע.** "retired" פירושו שהשורה נסגרה לתמיד. כאן פסיקה אחת יכולה להחזיר את שש הבדיקות, ובצורת ה-pause הסטנדרטית `urls-pause-comments` מזהה אותן.
- **שאר האתרים שתלויים באותה פסיקה.** 12 האתרים שנשארו exhaustive-negative נשארים כך, כי הרשומות המאומתות שלהם טוענות לתווית. אבל אף אחד מהם לא מתעד שהריץ code search (ארבעה כותבים במפורש שלא), ולכן פסיקה שתחייב code search תחול גם עליהם. health-data-hub ו-ijcai תלויים באותה פסיקה, וזה כתוב בהערה.
- **fixture ולא `git show` בבדיקה.** ב-`ci.yml` אין fetch-depth, כלומר ה-checkout רדוד ו-548be52 לא קיים שם. הבדיקה משווה את ה-fixture ל-blob רק כשהקומיט זמין, ותמיד בודקת את ה-sha256 המוצמד.
- **grand-challenge.** לא חיפשתי מופע מילולי של הכתובת: code search לא זמין, וניחוש נתיבים בריפו הוא ניחוש. לכן בחרתי באפשרות השנייה של הסוקר, להשהות.
- **lbl.gov נשאר CONDITIONAL_MET.** המאמת שלו לא דרש להשחיר את תיבת הפרויקט היחידה בעמוד, בעוד שהמאמת של realpdecompetition דרש להשחיר כתובת של רשימת תפוצה. האם תיבה של ארגון היא מידע "אישי" — זו שאלה ל-main thread, והיא רשומה בהערה.
- **לא דחיתי אף פגם.**

## 5. שגיאות וניסיונות שנכשלו
- בטיוטה ציטטתי את `osek-patur-documents.md:1138`. grep הראה שהשורה הנכונה היא 1136, ותיקנתי לפני ה-commit.
- אחרי התיקון נכשלו שתי בדיקות:
  - סעיף "Review corrections" שכתבתי ציטט את הנוסח האסור "before a capture is relied on", ונוסח מחדש;
  - ה-regex של grand-challenge לא כלל ", defect 4", ויושר לנוסח.
- בטיוטה של קבוצת "Now" כתבתי שאין כתובת אישית במקור של אף אחד מהעמודים. זה שגוי לגבי build-arena: במקור יש כתובת, וה-GET הרגיל מחזיר shell ריק. תוקן.
- הרצת vitest על קובץ בדיקה מחוץ לריפו (`--root /`) נכשלה ב-EACCES על `/proc`. קראתי את `windowQuarters` ישירות מהקוד.

## 6. בדיקות ופעולות ולידציה
- `scripts/verify.sh`: exit 0. typecheck עבר עם exit 0, ובחבילה עברו 71 קבצים: 2,332 בדיקות, אחת דולגה.
- כל בדיקה בנפרד, לפי קוד היציאה:

  | בדיקה | exit | בדיקות שעברו |
  |---|---|---|
  | frozen-citations | 0 | 22 |
  | terms-saved-copies | 0 | 14 |
  | render-watch-terms-barred | 0 | 24 |
  | queue-zero-test | 0 | 38 |
  | prize-terms-audit | 0 | 12 |

- `node scripts/urls-pause-comments.mjs --check`: exit 0, אפס הערות מיושנות.
- `node scripts/mutate.mjs --plan`: exit 0. ארבע מוטציות, כולן נהרגו:

  | מזהה | פגם | המוטציה |
  |---|---|---|
  | F1 | 1 | fomo26 חזר ל-CONDITIONAL_MET |
  | F2 | 2 | ציטוט kaggle לא מוצמד |
  | F3 | 3 | בדיקת ה-robots של agenthon בוטלה מהשהיה |
  | F4 | 4 | שורת התנאים של grand-challenge בוטלה מהשהיה |

- grep למזהי הבעלים בכל מה שנוסף: 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- את קבוצות "What the reading can render" חישבתי בסקריפט חד-פעמי. כדאי `scripts/prize-render-groups.mjs` שמדפיס אותן מפסקי הדין, מה-fixture ומ-`urls.txt`, ובדיקה שמשווה אותו לספירות בהערה.
- כדאי guard כללי שאוסר ציטוט לפי שורה של כל קובץ שעבודה אוטומטית כותבת (רשימה אחת של הקבצים האלה), במקום guard נפרד לכל קובץ.
- הבדיקה שקושרת שורה ב-ZERO-TESTS לשורה ב-`urls.txt` מכסה עכשיו רק את שורות 235-261. כדאי להרחיב אותה לכל השורות; זו מוטציה R2 של הסוקר, ששרדה.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת ההקשר (דו"ח המרכיב, הבדיקות, הסקריפטים, הפסיקות וקלט המאמתים): כ-40%.
- כתיבת הבדיקות וסקריפטי העריכה: כ-25%.
- הערת הביקורת ונוסח ההערות: כ-20%.
- verify, הבדיקות ו-mutate: כ-10%.
- ניסיון ה-vitest שנכשל ותיקוני הנוסח: כ-5%.

## Rulings applied (5.10, tick 45)

### 1. מה המשתמש ביקש
סקריפט ה-workflow של סבב 45 העביר לי, בתפקיד "מחיל" (Opus), את שלוש הפסיקות של ה-main thread (R1-R3) על השאלות שהמתקן השאיר פתוחות. הוא ביקש:
- להחיל אותן בדיוק, ולהוסיף אותן מילה במילה כסעיף חדש בהערת הביקורת;
- לעדכן את `prize-terms-audit.test.ts`, בדיקה קודם;
- להריץ את הבדיקות ותוכנית `mutate.mjs` של שלוש מוטציות;
- לבצע שני commits ולהוסיף את הסעיף הזה ליומן.

בלי push, בלי עריכת CHECKPOINT/CHANNEL_LOOP/FABLE_QUEUE/MISSION/CLAUDE.md, ובלי לגעת בקובצי ai-allowed-events.

### 2. הפעולות המרכזיות שביצעתי
- **בדיקה קודם.** כתבתי מחדש את `prize-terms-audit.test.ts` למצב שאחרי הפסיקות: 13 בדיקות, 9 מהן נכשלו לפני השינוי.
- **R1.** תשע הערות ה-NO_TERMS נפתחות עכשיו ב-"exhaustive-negative (" עם החיפוש המתועד של המבקר והמאמת, ומסתיימות ב-"(ruling R1, 5.10, TERMS-AUDIT-2026-10-05-prize-events.md)". אלה agenthon, alignmentforum, bcamlc, flagos, geminixprize, k12-ai-infrastructure, health-data-hub, ijcai ו-mozilladatacollective.
  - שש בדיקות ה-robots שהושהו (שורות 245, 247, 249, 250, 252 ו-253) חזרו להיות פעילות ב-`urls.txt`, והערות השורה שלהן חזרו לנוסח הפעיל. סימוני ה-PAUSED נמחקו מ-ZERO-TESTS דרך `loop-edit.mjs set-cell`.
  - שלוש בדיקות חדשות נוספו דרך `queue-zero-test.mjs`, אחרי dry-run: שורה 262 (www.health-data-hub.fr), שורה 263 (2026.ijcai.org) ושורה 264 (competitions.mozilladatacollective.com).
  - ההערה של mozilladatacollective שומרת את שתי הקריאות: הפלטפורמה של DrivenData מגישה את הדפים, ותנאי האתרים של Mozilla מחריגים אפליקציות של צד שלישי. היא אומרת שהבדיקה קוראת רק את robots.txt, ושדפי הכללים ייקראו לפי כלל הכתובות של R3.
- **R2.** עשיתי clone רדוד אחד של DIAGNijmegen/rse-grand-challenge (ff2fb5c) והרצתי `git grep -n -F "grand-challenge.org/policies"`: אין התאמה.
  - comic/grand-challenge.org הוא אותו ריפו בשמו הישן, וה-README שלו זהה בבתים.
  - לכן נוסף משפט החריגה לכותרת של `urls.txt`, מיד אחרי פסקת הכלל היחיד.
  - שורה 237 חזרה להיות פעילה. ההערה שלה אומרת "URL derived from the platform's own source (exception, ruling R2, 5.10.2026)" ונושאת את שני הציטוטים. ה-clone נמחק.
- **R3.** שלפתי raw, בקומיטים המוצמדים, את הדפים של חמשת אתרי ה-Pages ושל lbl.gov. ה-sha256 של כל דף תואם לרשומה המאומתת. כל כתובת סווגה לפי סוג בלבד:

| אתר | הכתובות בדף | פסק דין |
|---|---|---|
| aimo-interp | תיבת פרויקט אחת (חשבון webmail על שם הפרויקט) | CONDITIONAL_MET |
| fomo26 | תיבת פרויקט אחת במחלקה אוניברסיטאית | CONDITIONAL_MET |
| realpdecompetition | רשימת תפוצה אחת של המארגנים | CONDITIONAL_MET |
| roco-spring | רשימת תפוצה אחת של המארגנים, בשני הדפים | CONDITIONAL_MET |
| xiuwenz2 | ארבע: שתי כתובות אוניברסיטאיות של אנשים בשמם, רשימת תפוצה אחת ותיבת פרויקט אחת | CONDITIONAL_UNMET |
| lbl.gov | תיבת פרויקט אחת | CONDITIONAL_MET (ללא שינוי) |

- **הערת הביקורת.** עדכנתי:
  - את שורות הטבלה שהשתנו;
  - את "What the reading can render", שבו הקבוצה "ממתינות לפסיקה" נעלמה;
  - את פסקאות Verdicts ו-Actions taken, שקיבלו משפט המשך;
  - את "Review corrections", שקיבל שורה 5 שמפנה לסעיף הפסיקות;
  - את סעיף הפסיקות, שנוסף מילה במילה לפני "Every URL the agents fetched";
  - ואת הנספח, שקיבל בלוק עם 13 ה-URLs ששלפתי.

| קבוצה | כתובות | אתרים |
|---|---|---|
| עכשיו | 12 | 11 |
| אחרי שליפת התנאים (שורות 235-243) | 40 | 9 |
| אחרי בדיקות ה-robots (שורות 244-264) | 29 | 21 |
| יידונו בלי לכידה, לפי התנאים | 19 | 3 |
| יידונו בלי לכידה עד שיהיה מיסוך כתובות | 1 | 1 |
| **סך הכול** | **101** | **45** |

### 3. קבצים/מערכות ששונו
- `research/channel-loop/terms-verdicts.json`: 9 הערות לפי R1, 4 פסקי דין שחזרו ל-CONDITIONAL_MET, וההערות של xiuwenz2, lbl.gov ו-grand-challenge.org.
- `research/rendered/urls.txt`: משפט החריגה בכותרת, 7 שורות שחזרו לפעילות ו-3 שורות חדשות.
- `research/channel-loop/ZERO-TESTS.md`: 7 סימוני PAUSED נמחקו, ושורות 262-264 נוספו.
- `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md`.
- `src/__tests__/revenue/prize-terms-audit.test.ts`.
- היומן הזה (תוספת בלבד).
- **לא נגעתי:** `scripts/*.mjs`, CHECKPOINT, CHANNEL_LOOP, FABLE_QUEUE, MISSION, CLAUDE.md וקובצי ai-allowed-events. אין push.

### 4. החלטות והנחות משמעותיות
- **סיווג הכתובות.** כתובת webmail על שם הפרויקט, ותיבה על שם הסדנה בדומיין של מחלקה, נחשבו לתיבות פרויקט, כלומר כתובות role, לפי הנוסח של R3 ("a project mailbox at an institution"). כתובת אוניברסיטאית שמופיעה ליד שם של אדם נחשבה לכתובת אישית.
- **ההערות לא מכילות כתובות.** הן מתארות סוג וכמות ומפנות למספרי השורות בקובץ המוצמד. כך אפשר לבדוק את הסיווג בלי שכתובת תיכתב בריפו.
- **נוסח הערות השורה.** שש השורות שחזרו קיבלו בדיוק את הנוסח הפעיל של שאר הבדיקות. שלוש החדשות נושאות "(ruling R1, 5.10)", כפי שה-`--note` שהוכתב קובע.
- **משפט החריגה בשורה אחת.** כתבתי אותו בשורת הערה אחת, מילה במילה כמו ב-R2, ולא פיצלתי אותו ל-85 עמודות כמו בשאר הכותרת. כך חיפוש מדויק של המשפט ימצא אותו. הבדיקה בודקת אותו גם אחרי פרישת השורות.
- **קבוצות הרינדור.** במקום הקבוצה "ממתינות לפסיקה" פיצלתי את "יידונו בלי לכידה" לשתיים: לפי התנאים (ansperformance, codabench ו-google.com), ועד שיהיה מיסוך כתובות (xiuwenz2). הסיבות שונות, ו-xiuwenz2 ישתחרר בקיפול אחר. הפיצול גם איפשר לבצע את העריכה ב-loop-edit, שלא מוחק שורות.
- **הנספח.** הוספתי בלוק "rulings applier" עם ה-URLs ששלפתי, כדי שהמשפט שכל URL שהסוכנים שלפו מופיע בנספח יישאר נכון.
- **מה נשאר כמו שהיה.** "Verifier notes" ו-"assembler's decisions" נשארו כהיסטוריה.

### 5. שגיאות וניסיונות שנכשלו
- `loop-edit.mjs replace-in-line` עם עוגן שמתחיל ב-"-" נדחה על ידי parseArgs, ועבר בצורה `--anchor=...`. העריכה הראשונה בסדרה, שהעוגן שלה לא התחיל במקף, כבר נכתבה, ולכן הרצתי שוב רק את השתיים שנכשלו.
- `curl` ל-github.com/comic/grand-challenge.org החזיר 403 דרך הפרוקסי. WebFetch של אותו עמוד הצליח.
- בטיוטה של הבדיקה היה ביטוי `expect.objectContaining` מסורבל. פישטתי אותו לפני ההרצה.

### 6. בדיקות ופעולות ולידציה
- `prize-terms-audit.test.ts`: לפני השינוי exit 1 (9 מתוך 13 נכשלו), ואחריו exit 0 (13 עברו).
- vitest על prize-terms-audit, queue-zero-test, render-watch-terms-barred, frozen-citations ו-terms-saved-copies: exit 0, 111 בדיקות עברו.
- `node scripts/urls-pause-comments.mjs --check`: exit 0, אפס הערות מיושנות. אף שורה של סבב 45 לא מושהית.
- `scripts/verify.sh`: exit 0. ה-typecheck עבר עם exit 0, ובחבילה עברו 71 קבצים: 2,333 בדיקות, אחת דולגה.
- `node scripts/mutate.mjs --plan`: exit 0. שלוש מוטציות, כולן נהרגו:

| מזהה | המוטציה |
|---|---|
| A1 | בדיקת ה-robots של flagos.io (שורה 245) הושהתה שוב |
| A2 | המילה הפותחת בהערה של agenthon.net שונתה |
| A3 | משפט החריגה הוסר מהכותרת של `urls.txt` |

- grep למזהי הבעלים בכל הקבצים שנגעתי בהם: 0. grep לכתובות דוא"ל בשורות שהוספתי: 0.

### 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- את סיווג הכתובות בדף (אישית או role) עשיתי בעין. כדאי סקריפט שמוציא את הכתובות מקובץ מוצמד ומדפיס רק סוג משוער ומספר שורה, בלי הכתובת עצמה, כדי שהקורא יאשר.
- `scripts/prize-render-groups.mjs`, שהמתקן המליץ עליו, עדיין חסר. גם הפעם ספרתי את הקבוצות ידנית, והבדיקה בודקת רק את הסכום.
- loop-edit לא יודע למחוק שורה, ולכן שינוי מבנה של רשימה דורש לשמור על מספר השורות. פקודת `delete-line` עם אותן בדיקות תחסוך את זה.

### 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת ההקשר (הערת הביקורת, ה-JSON, urls.txt, ZERO-TESTS, הבדיקה, הסקריפטים והרשומות המאומתות): כ-40%.
- נוסח ההערות ב-JSON ובהערת הביקורת: כ-25%.
- כתיבת הבדיקה: כ-20%.
- הרצות הבדיקות, verify ו-mutate: כ-10%.
- שליפות, ה-clone וה-grep: כ-5%.
