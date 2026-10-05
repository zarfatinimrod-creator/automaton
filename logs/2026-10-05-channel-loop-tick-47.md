# סבב 47 של לולאת הערוצים — השיגור הראשון של קריאת אירועי הפרסים (5.10.2026, ~13:11-~14:55 UTC)

## 1. מה המשתמש ביקש
הוראת הבעלים הקבועה (27.9): ערוצים בלי הפסקה, ב-₪0; "תמשיך בfable". טיק הרוטינה של 13:11 לפי §10 של סבב 46: בדיקה, ואז השיגור הראשון של קריאת דפי הכללים של אירועי הפרסים (§4 שורה 13; `research/measurements/ai-allowed-events.md`) — מסנן `termsGate` (§9 5.10 פריט 2) אם יש מקום, dispatch של 12 הכתובות שביקורת סבב 45 אישרה, קריאה ודירוג על Opus, קומיט ל-main לפני ריצת prize-intake של רביעי 06:47.

## 2. הפעולות המרכזיות שביצעתי
- **סגירת סבב 46 (08:45):** PR #48 מוזג (`da3744a`) אחרי ש-13 בדיקות ה-CI על ראש ה-PR היו ירוקות; הענף הועבר קדימה ונדחף; ה-check-in של 09:35 הפך לבדיקה קלה ומצא את main ירוק (14 ריצות, כולל טיק ה-colony של 09:00).
- **בדיקה (13:11):** main התקדם בקומיט colony אחד (`df3948c`: ₪0, אותם ארבעה סטים של צעדי בעלים — apify 6; il-biz-tools 8, 3, 6; oss-bounties 7, 6; pcn874 3, 7, 6); אין PR פתוח; MoneyPrinterTurbo#1 ללא שינוי מ-25.9; אין הודעת בעלים. דיסק: 19 GB פנויים; ה-scratchpad החזיק 4.4 GB — תיקיות של סבבים גמורים (`tick33-fixer`, `tick43-review`, `wfsim`, `crux` ועוד 8) נמחקו, 1.9 GB נשארו.
- **המסנן לפני הבנייה:** שורת node חד-פעמית דרך `termsGate` על 101 שורות `ai-allowed-events.urls.txt`: בדיוק 12 עוברות, על 11 אתרים — אותן 12 שהביקורת ציינה (fomo26, build-arena ושני github.com, openreview, roco-spring, szczurek-lab, robosyn-bench, fair-universe.lbl.gov, aimo-interp, realpdecompetition, neural-interfaces26); ה-parser של render-watch אישר את 12 השורות (`--needs-browser` → `js=false`).
- **ארבעה שיגורי render-watch על main** (`workflow_dispatch` עם קלט `urls`, דרך `gh api`; כל ריצה ~36 שניות):
  1. 13:18 — 12 הכתובות → `ed03815` (12 לכידות). `capture-check`: 8 ok, 3 js-shell (build-arena.github.io, szczurek-lab.github.io, robosyn-bench.net), 1 bot-challenge (openreview: Cloudflare Turnstile).
  2. 13:25 — 6 דפי כללים שהלכידות עצמן מקשרות (neural-interfaces26: `rules.html`, `participant-guide.html`; roco-spring: `participate.html`; fair-universe: שלושת דפי WeakLensing) → `595457b`. לפני השיגור נבדקו מקורות הדפים ב-github grade (ריפו ה-Pages של כל אתר) לכתובות דוא"ל: רק כתובות תפקיד.
  3. 13:31 — ארבעת הדפים שהלכידות של roco-spring מקשרות (`call-for-papers`, `team-registration`, `evaluation`, `tasks-data`) → `a679fd9`; שוב בדיקת מקור קודם.
  4. 13:34 — `rules-faq.html` של roco-spring → `447bd55`. **הכרעת R4** (§4 להלן): אף דף של האתר לא מקשר אליו; הוא נמצא בריפו ה-Pages של האתר (`roco-spring/roco-spring.github.io@fca18b99`) ושוגר על בסיס זה.
  סך הכול 23 לכידות, 19 קריאות. כתובות דוא"ל בלכידות: רק תפקיד — תיבת פרויקט ב-gmail (aimo-interp), תיבת מחלקה אוניברסיטאית (fomo26), שתי רשימות תפוצה (realpde, roco-spring), תיבת פרויקט (lbl.gov) — כפי שהכרעת R3 חזתה; שום כתובת לא נכתבה לשום הערה.
- **שלושה workflows של קריאה על Opus** (קורא אחד ומאמת אדברסרי אחד לכל אירוע; כל מאמת קיבל את הקורא שלו, לעיתים עם תיקוני ניסוח לתא):
  - A (5 אירועים, 10 סוכנים, ~1.10M אסימונים, 9.3 דק'): fomo26 → RENDERED/no; aimo-interp → RENDERED/no; realpde → RENDERED/no ("Agent-augmented adaptation (e.g., LLM controllers) is permitted in Track 2" נקרא כהיתר שיטה, לא היתר להגשה שנבנתה ע"י AI); build-arena → NONE (האתר shell; ה-README ב-GitHub מפנה אליו; openreview חסום ב-Turnstile); robosyn → NONE (shell; ה-README טכני; הכללים באתר שני, edem-ai.github.io, בלי verdict).
  - B (2 אירועים, 4 סוכנים, ~519k, 5.6 דק'): neural-interfaces26 → RENDERED/no (שמונת הכללים המחייבים שותקים על AI); fair-universe → BLOCKED, Qualifies ריק (הכללים על codabench.org, CONDITIONAL_UNMET; הדפים שנלכדו הם דף הפרויקט, דפי Phase 1 של 2025 ולוח תוצאות של Phase 2).
  - C (אירוע אחד, 2 סוכנים, ~277k, 5.4 דק'): roco-spring → RENDERED/no (ה-rulebook ודרישות ההגשה שותקים על AI; דרישת המאמר דורשת מחברים, לא מחברים אנושיים).
- **יישום התאים:** סקריפט scratch של ה-thread הראשי שמחליף רק את שלושת התאים האחרונים של שורה לפי Event URL, בייט-לבייט אחרת; בדיקה עם `parseAiAllowedTable` + `rowState` של ה-intake: 5 graded, 1 unsettled (BLOCKED, כמתוכנן), 60 awaiting; בדיקות prize-intake ירוקות. קומיטים `dfd820f` (5 שורות) ו-`73be624` (roco-spring).
- **הבנייה (§9 5.10 פריט 2), במקביל לקריאה:** Workflow בונה-סוקר-מתקן על Opus ב-worktree — `scripts/prize-dispatch.mjs` (מדפיס את שורות `ai-allowed-events.urls.txt` שהאתר שלהן עובר `termsGate`, כ-`URL<TAB>slug`, אחרי re-parse ב-parser של render-watch; `--skip-captured`; סיכום סירובים לפי אתר ב-stderr; קודי יציאה 0/3/1), 29 בדיקות, 28 מוטציות נהרגו (13 של הבונה, 10 של הסוקר, 5 של המתקן); משפטי התבנית של ה-intake (צעד 1 ב-md, כותרת urls.txt, הערת המודול) אומרים עכשיו להריץ אותו ולא להדביק את הקובץ כולו, עם בדיקת הסכמה בין התבנית לקבצים המוקמתים. הסוקר מצא 4 ממצאי fix (3 תוקנו: מספרי שורות שגויים בסירוב של ה-parser, בדיקת CLI ל-`--skip-captured` שמדלג על הכול, פיצול על רווחים; 1 מחוץ לתחום — שני משפטים ישנים ב-`prize-intake.ts:14-15` וב-`describeAiAllowed`) ו-4 הערות (3 תוקנו). מיזוג `c312b3c` דרך `merge-worktree.sh` (verify.sh לפני המיזוג: typecheck 0, vitest 0).
- **קבצי הלולאה (loop-edit בלבד):** §0 (Last tick), §4 שורה 13 (תוצאת הקריאה; תיקון ספירה 6→5 באותו סבב), §9 ("Queued 5.10 (tick 47)" פריטים 1-5; "Fixed in tick 47"), §10 (סבב 48; "Was planned for tick 47"); R4 נוספה ל-"Main-thread rulings" של `TERMS-AUDIT-2026-10-05-prize-events.md`; CHECKPOINT; יומן זה. FABLE_QUEUE ללא שינוי (אין ישיבה ב-13:11).

## 3. קבצים/מערכות ששונו
- `research/measurements/ai-allowed-events.md` — 6 שורות (שלושת התאים האחרונים בלבד) + משפט צעד 1 (מהבנייה); `research/measurements/ai-allowed-events.urls.txt` — 5 שורות כותרת (מהבנייה; שום שורת URL).
- חדש: `scripts/prize-dispatch.mjs`, `src/__tests__/revenue/prize-dispatch.test.ts`, `logs/2026-10-05-channel-loop-tick-47-prize-dispatch.md` (יומן הבונה, עם סעיף 9 של המתקן), יומן זה.
- `src/revenue/ai-allowed-events.ts` — הערת המודול ושני משפטי תבנית.
- `research/rendered/prize-*` — 23 לכידות חדשות (69 קבצים), נכתבו ל-main על ידי render-watch, לא בידי הסבב.
- `research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md` — R4.
- לולאה: `logs/CHANNEL_LOOP.md`, `logs/CHECKPOINT.md`.
- לא שונה: `termsGate`, `PATH_LIMITS`, `render-watch.mjs`, ה-yml, `terms-verdicts.json`, `urls.txt` (של research/rendered), FABLE_QUEUE.

## 4. החלטות והנחות משמעותיות
- **כללי הקריאה של המושב (ה-thread הראשי, Fable):** (3) "היתר להגשה שנבנתה ע"י AI" הוא כלל שמדבר על AI/LLM/אוטומציה שמייצרים או מהווים את ההגשה (קוד, מודל, מאמר); כלל שמתיר טכניקות AI כשיטה או כנושא התחרות (LLM controllers ב-Track 2; "any architecture"; pretraining על כל דאטה) אינו היתר כזה; (4) "הצהרת מחברות אנושית" היא דרישה שההגשה תהיה מעשה ידי אדם או בלי AI; דרישת מאמר או חבילת שחזור דורשת מחברים, לא מחברים אנושיים; סעיף מקוריות גנרי אינו הצהרה כזו; (5) כללים שותקים → RENDERED/no עם מצביע. תוצאה: 0 מ-5 מזכים — כל חמשת ה-rulebooks שותקים.
- **BLOCKED ולא ריק** לאירוע שכלליו רק על אתר שהלולאה לא תשיג (codabench): ה-intake מסמן "unsettled" עם הסיבה — זו המדינה המתוכננת, והיא אומרת "הסתכלנו". NONE (שורה לא נגועה) כאשר דף הכללים הוא באתר מותר שעדיין לא נלכד (shell) — build-arena, robosyn.
- **R4:** כתובת של דף כללים שנצפתה בריפו המקור של האתר בקומיט נעוץ היא תצפית ולא ניחוש (ההרחבה של R2 מ-terms- לדף כללים באתר מותר, בלי חריג לשער: הדף עובר `termsGate` בעצמו). נרשמה בביקורת ובפריט §9 5; תבנית ה-intake (צעד 2) תתוקן בסבב הבא, אחרי שהבנייה שנגעה בצעד 1 מוזגה.
- **בדיקת כתובות לפני כל שיגור של דף חדש** — מקור הדף נקרא ב-github grade (raw.githubusercontent.com, ריפו ה-Pages) ונספרו כתובות; רק כתובות תפקיד → שיגור. זה פרוטוקול ידני עד שפריט 1 (מיסוך ב-render-watch) ייבנה.
- **שיגור על main ולא על הענף:** הלכידות נכנסות ל-main מיד, הענף מועבר קדימה; ה-PR של הסבב נושא רק את הדירוגים והקוד.
- **הבנייה והקריאה רצו במקביל** — הבנייה עצמאית מהלכידות; הסקריפט נבדק מול התוצאה החד-פעמית (אותן 12 שורות).
- **לא נבנה פריט 1 (מיסוך כתובות) בסבב הזה:** הקריאה מילאה את הזמן; הוא הבנייה הראשונה של סבב 48 (send_later ~60 דק').

## 5. שגיאות וניסיונות שנכשלו
- **מחיקת scratch של ה-thread הראשי בידי הבונה:** ההנחיה "מחק כל scratch שיצרת מחוץ ל-worktree" פורשה כ-`find scratchpad/tick47 ! -name wt -exec rm -rf` — רשימות ה-dispatch, `apply-grades.py`, `row-states.ts`, תיקיות הקוראים ו-`ghgrade` נמחקו (הבונה דיווח על זה בראש הדוח שלו). שוחזרו תחת `scratchpad/tick47-main/` (תיקייה ששום brief לא מכיר). לקח: כל brief מציין את תיקיית הסוכן בשמה המלא ואומר למחוק רק אותה; ה-thread הראשי שומר את קבציו תחת `<tick>-main/` (§9 פריט 1).
- **`sleep 60` נחסם** על ידי ה-harness — הוחלף בלולאת `until … sleep 20` ברקע (ארבע פעמים).
- **cwd מתאפס בין קריאות Bash מקביליות** — `npx tsx -e` עם import יחסי נכשל פעם אחת; תוקן בנתיב מוחלט.
- **ספירה שגויה ב-§4 שורה 13** ("6 rows graded") נכתבה ונדחפה (`9a851c7`) לפני שנבדקה מול `rowState` (5); תוקנה באותו סבב.
- **קובץ הפלט של Workflow** הוא אובייקט עם שדה `result`, לא מערך — ניסיון parse ראשון נכשל.
- **ה-rulebook של roco-spring לא מקושר משום דף** — נדרשו שני סבבי dispatch נוספים (4 דפים, ואז `rules-faq.html` לפי R4) במקום אחד.

## 6. בדיקות ופעולות ולידציה
- `termsGate` חד-פעמי: 12/101 עוברות; `node scripts/render-watch.mjs --needs-browser` על כל רשימת dispatch: `js=false`, exit 0 (4 פעמים).
- `node scripts/capture-check.mjs <slugs>` אחרי כל ריצה: exit 3 (ריצה 1: 3 js-shell + 1 bot-challenge), exit 0 (ריצות 2-4).
- ספירת כתובות דוא"ל (סוג בלבד) בכל לכידה חדשה ובמקורות הדפים לפני שיגור: תפקיד בלבד.
- כל מאמת: כל ציטוט substring מדויק בשורה המצוינת (`grep -n -F`), כל מצביע קיים עם `.meta.json`, grep עצמאי על מילות מפתח, אין כתובת בתוצאה.
- `parseAiAllowedTable` + `rowState` על ה-md אחרי כל יישום: 5 graded / 1 unsettled / 60 awaiting, 66 שורות; `npx vitest run` על prize-intake, prize-intake-rules, prize-intake-workflow, prize-terms-audit: 111/111, exit 0 (ואחרי roco: 83/83).
- diff של ה-md: שום `@` מחוץ לכותרות hunk; בדיקת מזהה הבעלים (grep על שני חלקי השם) על ה-diff ועל כל קובץ חדש: 0.
- הבנייה: verify.sh exit 0 (typecheck 0, vitest 0) אצל הבונה, הסוקר (גם על כל חבילת revenue: 72 קבצים, 2366 עברו) והמתקן; 28/28 מוטציות נהרגו; הריצה האמיתית: 12 שורות, TAB אחד בכל שורה; `--skip-captured` → exit 3 ("skipped 12").
- `merge-worktree.sh`: verify.sh לפני המיזוג exit 0; push; worktree והענף הוסרו.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **יישום תאים לפי Event URL** — פעמיים בסבב (סקריפט scratch); אם הקריאות של שלישי ורביעי חוזרות על זה → `scripts/prize-grade.mjs` עם בדיקות (§9 פריט 4).
- **המתנה לריצת render-watch + capture-check + ספירת כתובות לפי סוג** — ארבע פעמים אותו רצף; סקריפט אחד (`render-watch-wait` + `capture-check` + ספירת כתובות שמדפיסה רק את הדומיין) יחסוך כ-6 קריאות לכל סבב.
- **סיכום תוצאות קריאה** (`summarise-reading.py`) — שלוש פעמים; לשמור בריפו תחת `scripts/` אם ה-Workflow של הקריאה חוזר (או לכתוב את הסיכום בתוך ה-Workflow עצמו).
- **בדיקת מקור דף ב-github grade לפני שיגור** — פרוטוקול ידני שייעלם עם פריט 1.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- **הקריאה:** ~1.9M אסימוני סוכנים ל-8 אירועים (A 1.10M, B 519k, C 277k) — הקוראים החזירו פלט מובנה גדול (רשימות סעיפים ו-follow-ups ארוכות); הקורא של fair-universe קרא לוח תוצאות של 1,287 שורות. פעם הבאה: להגביל את `clauses` ל-15 ואת `followUpUrls` ל-6, ולהנחות לדלג על לוחות תוצאות.
- **הבנייה:** ~669k ו-36 דקות לסקריפט של 152 שורות — הסוקר הריץ את כל חבילת revenue (2366 בדיקות) בנוסף לשמונת הקבצים; נחוץ, אבל חצי מהזמן.
- **ה-thread הראשי:** קריאת חוזרת של קטעי לולאה ארוכים (§10 כולו, 30KB) — הכרחית פעם אחת; ה-`sleep` החסום; ה-parse השגוי; שחזור הקבצים שנמחקו (~3 קריאות).
- **שיגורים:** ארבעה במקום שניים (ה-rulebook הלא-מקושר של roco-spring) — זול (36 שניות כל אחד), אך שתי קריאות-המתנה נוספות.
