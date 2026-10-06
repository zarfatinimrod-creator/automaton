# סבב 54 של לולאת הערוצים — 6.10.2026, הסבב השגרתי של 07:11 (ישיבת Fable)

## 1. מה המשתמש ביקש
לא הגיעה הודעה מהבעלים. הסבב רץ מכוח ההוראה הקבועה "ערוצים בלי הפסקה" (27.9) והרוטינה "Channel loop tick" (07:11 UTC): פרוטוקול §1 של `logs/CHANNEL_LOOP.md` — בדיקת מצב, קריאת ההרצה השבועית של render-watch, ישיבת Fable (שורות 21 ו-22 של `logs/FABLE_QUEUE.md`), קיפולי Opus, קבצי הלולאה, יומן, PR.

## 2. הפעולות המרכזיות שביצעתי
- **בדיקת מצב:** הענף שווה ל-main (`e9858fd`), אין PR פתוח, MoneyPrinterTurbo#1 ללא שינוי, אין הודעה מהבעלים, 21 GB פנויים.
- **ההרצה השבועית לא נורתה:** ה-cron של `render-watch.yml` (יום ג' 05:23 UTC) לא רץ עד 07:12 (ההרצה המתוזמנת האחרונה: 29.9 11:25). שוגר ביד על הענף (ריצה 37428370215): 67 עמודים שונו, 150 קבצים (`5f4853a`). `capture-check` סימן 12 מ-59 (robots קצרים כצפוי; `terms-kaggle` js-shell; `terms-adaptionlabs` 85 תווים של ניווט; `robots-flagos` js-shell). `freeze-capture --cited`: 0 שינוי. `address-kinds`: 0 כתובות גולמיות מחוץ לגוף PDF; ה-PDF החדש `terms-displate-us.pdf` מחזיק 14 מחרוזות גולמיות (12 כתובות תפקיד, 2 אחרות) — ההחלטה על גופי PDF נרשמה ב-§9.
- **ישיבת Fable (שני סוכני Fable, במקביל):**
  - שורה 21 → `research/channel-loop/RULING-2026-10-06-robots-and-terms.md` (~26 דק'): (a) `Disallow` ב-robots.txt הוא מחסום במובן D1; עשרת צילומי nevo הם `[robots-bar]` (D1(1)) ותקרת 2026 של osek-zair (122,833) מאבדת את מקורה; (b) ה-UA נושא רק מה שהמותג מחזיק — היום דבר: `MehudakRenderWatch/1.0 (robots.txt honoured; contact pending)`; (c) חמישה סוגים של אתרים שתנאיהם לא נקראו (refusal-type, exhaustive-negative, unanswered, shell, deferred) ורינדור js חד-פעמי של עמוד תנאים שהוא shell דרך `queue-zero-test --js --terms-shell`; (d) עותקים מלאים של עמודים שתנאיהם אוסרים העתקה לא נשארים בעץ הציבורי — שדה `copying` לכל אתר ו-`scripts/trim-capture.mjs` (בתור). 11 קיפולים.
  - שורה 22 → `research/channel-loop/RULING-2026-10-06-domain-clock.md` (~11 דק'): (B) פריסת הדומיין היא שעון חדש לפי PUBLISH-10, לא מכשיר חדש; M-instrument רץ מ-D0 בלבד; `instrument_fault`/`uninstrumented` רק בתקופת netlify; שבוע דומיין שלא נכתב הוא `reader_down` משחלף זמנו; kill של 8 שבועות מדודים הוא `kill` בכל יום שבו נכתבו.
- **קיפולי Opus (Workflow בונה→סוקר אדברסרי→מתקן, כל אחד ב-worktree):**
  1. שעון הדומיין → `src/revenue/page-views.ts` ובדיקותיו, תכנית מוטציות `page-views.json` (5/5 נהרגו), README של המוצר, `page-view-clock.json`. מיזוג `6a0239d`.
  2. פסקי robots.txt → 17 אתרי NO_TERMS הפכו `NO_TERMS_ROBOTS_OK` בסקריפט (`robots-verdict.mjs --urls ai-allowed-events.urls.txt --apply`), 4 לא (flagos ו-theemailgame ענו HTML, situatedevals נכשל ברשת, mozilladatacollective `Disallow: /`), nevo `Disallow: /`; 21 צילומי robots הוקפאו (`robots-<x>-2026-10-06`) והמקורות מצביעים על ההקפאות; `prize-terms-audit.test.ts` מתאר את שני המצבים; מדור "Robots verdicts" בהערת הביקורת. מיזוג `227b3cb`.
  3. osek-zair 2026 → `documents.vatLaw` וכל ציטוטי nevo יצאו מהמוצר, 2026 חזרה ל-`pendingYears`, התקרה חזרה ל-`osek-zair-unverified.json` עם הדרגה `[robots-bar]`, `facts.vatSense` הושמט (אין קטע lawsofisrael מוצמד בריפו). מיזוג `2242cbf`.
  4. UA ללא קשר + מסלול `--js --terms-shell` → `render-watch.mjs`, `queue-zero-test.mjs` (termsGate מקבל `{js}`; השורה ננעצת ל-URL של הצילום הפשוט; חד-פעמיות לפי URL ולפי ההערה), `render-dispatch.sh`, `urls-pause-comments.mjs`, 26 מוטציות חדשות (כולן נהרגו), תכנית `queue-zero-test.json` חדשה. מיזוג `5a3ee24`.
  5. קריאת התנאים (ראה 3 להלן) → מיזוג `d0a369a`: תשעת הפסקים, שדה `copying` ל-132 אתרים (barred ב-8: ארבעת אתרי הפסק + devpost, zindi, grand-challenge, stanford שסעיף ההעתקה שלהם נקרא — הכלל שהבונה בחר, אושר), מילות הסוג, `judgeSite` שומר שדות, שש הקפאות, שורות urls.txt מושהות/פרושות, probe robots ל-eurocontrol, 23 הערות בלי מילת סוג ננעצו בשם (un.org: עמוד התנאים נלכד 200 ולא נקרא — §9).
- **קריאת תנאים (6 קוראי Opus + 6 מאמתים אדברסריים), פסקי הראשי:** devpost.com BARRED (:159 איסור גישה אוטומטית; :250/:252 העתקה); zindi.africa BARRED (:68 איסור אחסון/פרסום; :47); grand-challenge.org CONDITIONAL_UNMET (:150 העתקה רק ברשות כתובה; :122/:50 מחקרי בלבד); stanford.edu CONDITIONAL_UNMET (:125 הורדה לשימוש אישי לא-מסחרי בלבד; המאמת קרא BARRED — נרשם); virtualembryo.ai NOT_BARRED (`copying: allowed`; הכללים הרשמיים (:17) הם העמוד שבתור); eurocontrol.int NO_TERMS exhaustive-negative (הודעת פרטיות בלבד); opensky-network.org NO_TERMS refusal-type (403); kaggle.com ו-adaptionlabs.ai נשארו TERMS_PENDING עם קידומת `shell:`.
- **שער ההפצה:** אחרי פסקי robots נפתחו 20 שורות אירועי-פרס. ההפצה נדחתה **ארבע פעמים** על ידי push protection של GitHub ("Mapbox Secret Access Token" בעמוד AlignmentForum). תיקונים על הראשי: (1) `render-watch.yml` מפרסם דחייה כזו כ-annotations (הלוג לא נגיש מהמושב); (2) תבנית `sk.` דו-קטעית — לא תפסה; (3) כל הריצה אחרי `sk.eyJ` + דיאגנוסטיקת צורה (6 תווים, אורך, נקודות; לעולם לא הערך); (4) הצורה הראתה `pk.eyJ…` (93 תווים) — טוקן **ציבורי** שגיטהאב מסמן באותו שם; התבנית מכסה `sk.|pk.|tk.` + `AIza…` של Google. ההפצה החמישית הצליחה (`007f7f0`, 20 עמודים).
- **קריאת 17 שורות אירועי-פרס (17 קוראים + 17 מאמתים):** 3 RENDERED/no (FREUID/microblink, Trace the Ace/k12, DaT Parkinson/drivendata), 7 NONE (עמוד נחיתה שמקשר לכללים באותו host), 7 BLOCKED (shells ב-JS באתרים שתנאיהם לא נקראו; ijcai ב-sites.google.com). הוחל ב-`prize-apply-reading.mjs --apply` (`4c36194`). 6 עמודי כללים שקושרו מהצילומים שוגרו (`2634012`) ונקראו בסבב שני → 6 שורות: **הראשונה שמזכה — Infer Fusion Reactor Magnetic Geometry (sophelio.io, Q4): "AI coding assistants may be used for any part of an entry, provided the workflow is disclosed in the methods report and the entrant takes responsibility for the submission" (`…rules-716c921c.txt:103`), RENDERED/yes** (גילוי ואחריות אינם הצהרת מחבר אנושי — פסק ראשי); pasteurlabs ו-learn2design (README ב-GitHub) RENDERED/no; bcamlc (כללים רק ב-Codabench), aicrowd (shell מאחורי Turnstile) ו-crunchdao structural-break (shell) BLOCKED (`26bc3e0`). טבלה: 14 מדורגות (13 לא, 1 כן), 13 BLOCKED, 1 NONE, 39 ממתינות.
- **רינדור js חד-פעמי של שני עמודי תנאים שהם shells (קיפול 7):** Kaggle's Terms of Use rendered (167 lines) and read by an Opus reader and verifier: BARRED on three independent grounds (:77 no crawling, scraping or spidering of any page by manual or automated means; :87 no copying or publishing of any Content without the owner's consent; :70 internal, personal, non-commercial use only), so kaggle.com joins TERMS_BARRED and its 17 lines and build-arena's row stay shut; Israel Post answered 403 to the js render — the site's answer under decision 3(2), refusal-type; both js lines retired by the shell-terms fold (קיפול shell-terms: מיזוג `924a24b`)..
- **קבצי הלולאה:** FABLE_QUEUE שורות 21/22 DONE, שורה 27 חדשה (תקרת 2026 של osek-patur, "Not decided" 1); שורה מתוארכת תחת D1(2) ב-`RULING-2026-09-30-video.md` (קיפול 1); `mutation-plans.test.ts` — תכניות סבב 53 נוספו לרשימת החובה.

## 3. קבצים/מערכות ששונו
55 קומיטים ו-350 קבצים מאז `e9858fd` (main של הבוקר); לפי תיקייה:
- `research/rendered`: 295
- `src/__tests__`: 22
- `products/il-biz-tools`: 9
- `research/channel-loop`: 6
- `src/revenue`: 2
- `.github/workflows`: 1
- `logs/2026-10-06-channel-loop-tick-54-domain-clock.md`: 1
- `logs/2026-10-06-channel-loop-tick-54-osek-zair-2026.md`: 1
- `logs/2026-10-06-channel-loop-tick-54-robots-verdicts.md`: 1
- `logs/2026-10-06-channel-loop-tick-54-shell-terms.md`: 1
- `logs/2026-10-06-channel-loop-tick-54-terms-read.md`: 1
- `logs/2026-10-06-channel-loop-tick-54-ua-and-terms-shell.md`: 1
- `logs/FABLE_QUEUE.md`: 1
- `research/measurements`: 1
- `scripts/freeze-capture.mjs`: 1
- `scripts/queue-zero-test.mjs`: 1
- `scripts/render-dispatch.sh`: 1
- `scripts/render-watch.mjs`: 1
- `scripts/robots-verdict.mjs`: 1
- `scripts/urls-pause-comments.mjs`: 1
- `state/colony`: 1

**המרכזיים:** `research/channel-loop/RULING-2026-10-06-robots-and-terms.md`, `RULING-2026-10-06-domain-clock.md` (חדשים); `research/channel-loop/terms-verdicts.json` (9 פסקים חדשים + 17 robots + שדה `copying` + מילות סוג); `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` (3 מדורים חדשים); `research/channel-loop/ZERO-TESTS.md`; `research/rendered/urls.txt` (השהיות, פרישות, probe); `research/rendered/` (67 + 20 + 6 + 2 צילומים, 21 + 6 + 2 הקפאות, `FROZEN.sha256`); `research/measurements/ai-allowed-events.md` (23 שורות); `src/revenue/page-views.ts` + בדיקות; `scripts/render-watch.mjs` (UA, TERMS_BARRED, מסכות Mapbox/Google), `scripts/queue-zero-test.mjs` (`--js --terms-shell`, termsGate `{js}`), `scripts/robots-verdict.mjs` (judgeSite, serializeVerdicts), `scripts/render-dispatch.sh`, `scripts/urls-pause-comments.mjs`; `.github/workflows/render-watch.yml` (annotations לדחיית push protection); `products/il-biz-tools/` (osek-zair 2026); `src/__tests__/revenue/` (בדיקות, תכניות מוטציה `page-views.json`, `queue-zero-test.json`, `robots-verdict.json`); `logs/FABLE_QUEUE.md`, `logs/CHANNEL_LOOP.md`, `logs/CHECKPOINT.md`, 7 יומני בנייה + יומן זה.

## 4. החלטות והנחות משמעותיות
- **סדר הקיפולים של פסק שורה 21 (הראשי):** 1, 2, 11 בראשי; 3-6 נבנו בסבב; 7 (דואר ישראל) — אחרי קיפול 2; 8 (השהיית שורות worksheets4kids/btl/apify) — **לא בוצע עכשיו**: אין fetch של השורות עד ההרצה השבועית של 13.10, וקיפול 9 (`trim-capture.mjs` + מסלול artifacts) מתוכנן לפניה; אם 9 לא ימוזג עד 12.10 — להשהות. 9, 10 בתור §9.
- **פסק ראשי: robots.txt שענה 404/410 הוא "אין כללים" (RFC 9309 §2.3.1.3) ומספק את D2(v)** — הסוקר של קיפול robots ציין שהכלל נבנה בסבב 27 ולא נפסק; נפסק כאן. 6 מ-17 הפסקים נשענים עליו.
- **stanford.edu CONDITIONAL_UNMET ולא BARRED:** הגדרת הביקורת מ-29.9 מונה "מטרה" כתנאי; מגבלת "שימוש אישי לא-מסחרי" היא תנאי שהרץ לא עומד בו. התוצאה זהה (השורות נדחות).
- **virtualembryo.ai NOT_BARRED על אף שהכללים הרשמיים (:17) לא נקראו:** הכללים הם העמוד שבתור; מחסום שיימצא בו פותח את הפסק מחדש.
- **eurocontrol.int exhaustive-negative לפי R1:** OTA, tosdr וארגון GitHub נחפשו בסבב 45; המסמך היחיד שקושר נקרא — פרטיות בלבד.
- **agenthon.net:** הצילום של 6.10 מקשר `/terms/` — הנחת ה-exhaustive-negative נשברה; הפסק NO_TERMS_ROBOTS_OK נשען על "אין קישור לתנאים" — חזרה ל-TERMS_PENDING ושורת terms- לפני `/rules/` (§9 54(1)); אותו דבר ל-eurocontrol.int שה-HTML הקפוא שלו מקשר `/info/disclaimers`.
- **הפצת כללים שקושרו מצילום (R4):** URL שמופיע בצילום (anchor, או מצב מוטבע ב-HTML כמו crunchdao) הוא נצפה ולא מנוחש — 6 שורות שוגרו.
- **aicrowd.com /challenge_rules ענה Turnstile (bot-challenge):** עמוד הכללים הרשמי של aicrowd.com ענה shell מאחורי Turnstile (bot-challenge): BLOCKED; הודעת המארגנים ב-AlignmentForum ("Use of LLMs") היא היתר מפורש מצד המארגנים אך אינה הכללים הרשמיים — נרשם; שאלת רינדור js על host עם bot manager נשארת "Not decided 5" של הפסק.
- **חובת verify.sh לפני push נשברה פעם אחת (`612eb5f`):** פסק שורה 21 ציטט צילום חי לפי שורה; `frozen-citations.test.ts` נכשל במיזוג הראשון. תוקן ב-`87bf2bd` (`freeze-capture --cited --apply` + שתי LIVE_MENTIONS). שלושה בונים ירשו את האדום ומיזגו את הבסיס המתוקן.

## 5. שגיאות וניסיונות שנכשלו
- ההרצה השבועית המתוזמנת לא נורתה (05:23); שוגרה ביד 07:15.
- ארבע דחיות push protection (ריצות 37436081010, 37436768438, 37437342200, 37437891860) — הסיבה לא הייתה גלויה עד שהוספו annotations; ואז התבנית הדו-קטעית לא תפסה, ואז התגלה שהטוקן ציבורי.
- `robots-verdict.mjs` הורץ תחילה בלי `--urls` ולכן דן ברשימת urls.txt (אין עמודים בתור) — exit 3 לכל האתרים; ההרצה הנכונה עם `--urls research/measurements/ai-allowed-events.urls.txt`.
- `git log --before=2026-09-28` החזיר ריק לבונה osek-zair (הקובץ נוצר 29.9) — הושווה מול `4262342`.
- מיזוג שעון הדומיין נעצר ב-verify על אדום שהגיע מהבסיס (`612eb5f`), לא מהענף.
- `terms-adaptionlabs`: 85 תווים של ניווט — המסווג אומר `short` ולא `js-shell`, ולכן מסלול ה-js החדש לא חל (§9).
- `terms-opensky`: 403 (האתר חוסם hyperscalers, כפי שהוזהר).

## 6. בדיקות ופעולות ולידציה
- כל מיזוג: `scripts/merge-worktree.sh` (typecheck + חבילת revenue, exit code) — ארבעה/חמישה מיזוגים ירוקים; כל push מהראשי אחרי `scripts/verify.sh` exit 0 (למעט `612eb5f`, ראה §4).
- מוטציות: page-views 5/5 + 5 probes; robots 16/16 (נתונים; תכנית בסקראץ'); osek-zair 7/7 + D1/D6 אחרי תיקון; UA/terms-shell 26/26 + 4 probes אחרי תיקון; Mapbox/Google 2/2.
- `freeze-capture --cited`: 0 שינוי אחרי כל שלב; `address-kinds` על 40 קבצי הפרס: 0 גולמיות.
- `prize-apply-reading.mjs`: 17 שורות, dry run exit 3 → `--apply` exit 0, 5 קבצי בדיקות הפרס ירוקים.
- CI על הענף: ירוק לכל ה-push-ים שנבדקו (87bf2bd…2242cbf).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- ההרצה השבועית שלא נורתה: הפרוטוקול צריך "אם עד 06:30 UTC ביום ג' אין ריצת schedule — `render-dispatch.sh` על main עם רשימת ברירת המחדל" (§9).
- דחיית push protection: עכשיו annotations + צורות; השלב הבא — להריץ את `redactSecrets` גם על רשימת התבניות של GitHub (לא זמינה כקובץ) או לפחות על `pk.`/`sk.`/`AIza`/`ghp_`/`xox` — נעשה.
- בניית EVENTS לקריאת פרסים מהטבלה ומה-dispatch log — נעשה ב-python ad hoc פעמיים; `prize-reading-brief.mjs` (§9 סבב 53 פריט 3) עדיין בתור.
- קריאת תוצאות Workflow מקובץ ה-task (`result` key) — נכשל פעמיים על צורת הקובץ.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- ~4 הפצות שנדחו (×~3 דק' ריצה, ×קריאת annotations) — ~25 דק' קיר, מעט אסימונים.
- קריאת פרסים: 34 סוכני Opus (~3.9M אסימונים) ל-17 שורות, 7 מהן shells — הקוראים של shells יכלו להיות קצרים יותר (מסווג `short`/`js-shell` → BLOCKED בלי קריאה מלאה).
- קיפול robots: 924K אסימונים, הסוקר ביקש להקפיא 21 צילומים — נכון, אך הבריף יכול היה לדרוש זאת מראש.
- UA/terms-shell: 955K; terms-read: ~1.28M (terms-read) + ~0.23M (Kaggle) + ~0.92M (shell-terms).
- קומפקציה אחת של ההקשר באמצע הסבב.
