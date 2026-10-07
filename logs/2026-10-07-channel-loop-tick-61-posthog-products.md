# טיק 61 (7.10.2026): קיפולי המוצרים של פסיקה 7.10 שורה 25 (ארגון PostHog) — בונה Opus "products"

## 1. מה המשתמש ביקש

ה-thread הראשי (טיק 61) ביקש לממש את קיפולים 5, 6, 7, 8, 10 ו-11 של "Folds for Opus" בפסיקה
`research/channel-loop/RULING-2026-10-07-posthog-organisation.md` (נכתבה ב-`a8497ed`), בלי לפסוק מחדש:
- 5: משפט אחד בסוף ה-`_comment` של `posthog` ב-`products/il-biz-tools/src/config/site.json` (:22), בלי לשנות אף ערך.
- 6: תיקון ה-docstring של `products/chart-explainer/page.py:4-5`; קובץ חדש `products/chart-explainer/counter.json`; טוען
  בבנייה שמעביר `{"host", "key"}` ל-`build_page` רק כש-`projectKey` לא ריק; בדיקה שה-golden בלי מונה לא משתנה כל עוד הוא
  ריק ושמפתח `phx_` או host שלישי נדחים.
- 7: `products/il-biz-tools/README.md:395-399`, `:400-405`, `:792` — הפרויקט עדיין של המושבה אבל נוצר בארגון שהבעלים יוצר
  בצעד 6 חלק ד; `POSTHOG_READ_KEY` ברשימת הבעלים מאז 30.9, מוחזק עד שהפרויקט קיים.
- 8: המשפט של §1 אפשרות 8 בסוף ה-note של posthog.com ב-`research/channel-loop/terms-verdicts.json`, דרך `serializeVerdicts`.
- 10: שורה מתוארכת אחת אחרי `research/measurements/posthog-free-tier.md:205`, בדיוק בנוסח הפסיקה.
- 11: ב-`research/faceless-youtube/T1-PROTOCOL.md`, בתנאים המוקדמים של הזרוע ליד :30 — התוספת של קיפול 11, ושורה אחת ליד
  שלב הפריסה על `PREREG-DECISIONS.md:591-596`; לא לגעת באף שורה אחרת (בונה אחר עורך את :77-:137 במקביל).
ואחר כך: `scripts/pytest-product.sh chart-explainer`, ה-verify הממוקד על ארבעת קבצי ה-vitest, ה-verify המלא, הלוג הזה, commit
על `build/tick61-ph-products` בלי push.

## 2. הפעולות המרכזיות שביצעתי

1. worktree חדש `build/tick61-ph-products` מ-`origin/claude/new-session-j071dx`; `git log --oneline -1` הראה `a8497ed`
   (הפסיקה), ו-`ls products/ src/revenue/` לא היה ריק — לא נדרש reset. קישור `node_modules`, תיקיית scratch.
2. קראתי את הפסיקה כולה (832 שורות), ואחר כך כל קובץ יעד: `site.json` כולו, `page.py:1-260`, `render.py` כולו,
   `netlify_files.py` כולו, `tests/test_page_counter.py` כולו, `README.md:385-410` ו-`:770-798`, הרשומה של posthog.com
   ב-`terms-verdicts.json:572-578`, `posthog-free-tier.md:195-205`, `T1-PROTOCOL.md:1-76`, `PREREG-DECISIONS.md:583-600`.
   כל מחרוזת find הוכחה קיימת ב-HEAD עם `grep -n -F` לפני ההחלפה (exit 0 לכל אחת).
3. קיפול 8: סקריפט scratch שמייבא את `serializeVerdicts` מ-`scripts/robots-verdict.mjs`, מוכיח round-trip זהה בבתים, ורק
   אז מוסיף רווח + המשפט לסוף ה-note (dry run ואז `--apply`; 243 תווים, שורה אחת השתנתה).
4. קיפול 5: סקריפט scratch שמוכיח ש-`JSON.stringify(…, null, 2) + "\n"` של הקובץ זהה לו לפני ואחרי, שהמחרוזת נמצאה פעם
   אחת, ושלושת השדות (`projectKey`, `apiHost`, `projectId`) לא השתנו.
5. קיפול 6: docstring של `page.py` (שתי שורות הפכו לשלוש, שורה 6 לא נגעה); `counter.json` נכתב מסקריפט ב-format של
   site.json; ב-`render.py`: `COUNTER_CONFIG`, `load_counter()`, קריאה ל-`load_counter(COUNTER_CONFIG)` בתחילת `render()`
   (לפני `out.mkdir` ולפני כל fetch, ו-`OSError`/`ValueError` הופכים ל-`RenderError`), ו-`counter=counter` בקריאה היחידה
   ל-`page.build_page`; פסקה ב-docstring של המודול. קובץ בדיקות חדש `tests/test_counter_json.py` (30 בדיקות).
6. קיפול 7: שלוש החלפות מדויקות ב-README (פריט 1 ופריט 2 של "What still has to happen", ופריט 4 של "One-time steps").
7. קיפול 10: שורה אחת נוספה בסוף `posthog-free-tier.md` (השורה 206).
8. קיפול 11: שתי שורות הוכנסו אחרי `T1-PROTOCOL.md:31`, בתוך פריט 4, בלי לשנות אף שורה קיימת.
9. בדיקות (סעיף 6), grep פרטיות על כל ה-diff, commit `079ddce`, ואז 12 מוטציות אחת-אחת ב-`scripts/mutate.mjs`.

## 3. קבצים/מערכות ששונו

- `products/il-biz-tools/src/config/site.json:22` — ה-`_comment` של `posthog` קיבל בסופו את המשפט של §3(2) כלשונו. שום ערך
  לא השתנה.
- `products/chart-explainer/page.py:4-5` → `:4-6` — "It is not deployed: that waits on the brand domain (owner step 5)" →
  "It is not deployed: that waits on the deploy route (logs/CHANNEL_LOOP.md §6) and on the sub-brand's own PostHog project
  (ruling 7.10)". שום קוד לא השתנה; כל שורה אחרי :5 זזה ב-1 (`counter_config` עכשיו :143-160, `build_page` :191).
- `products/chart-explainer/counter.json` (חדש) — `projectKey` "", `apiHost` "https://eu.i.posthog.com", `projectId` "",
  `_comment`.
- `products/chart-explainer/render.py` — `COUNTER_CONFIG` ו-`load_counter()` (:45-64), הקריאה בתחילת `render()` (:81-84),
  `counter=counter` ב-:131 (היה :101), פסקה ב-docstring (:10-12).
- `products/chart-explainer/tests/test_counter_json.py` (חדש, 30 בדיקות).
- `products/il-biz-tools/README.md` — `:395-399` → `:395-401`; `:400-405` → `:402-407`; `:792` → `:798`.
- `research/channel-loop/terms-verdicts.json:576` — סוף ה-note של posthog.com.
- `research/measurements/posthog-free-tier.md` — שורה 206 חדשה.
- `research/faceless-youtube/T1-PROTOCOL.md` — שורות 32-33 חדשות; כל שורה מ-:32 הישנה והלאה זזה ב-2 (ה-:77-:137 של הבונה
  השני הן עכשיו :79-:139 אחרי המיזוג של שנינו; ה-hunks לא חופפים).
- לא שונו: `tests/fixtures/t1-page-no-counter.golden.html`, `releases/t1/page.html`, `netlify_files.py`,
  `PREREG-DECISIONS.md`, ושום מערכת חיצונית (לא נקרא שום connector, לא נוצר שום ארגון או פרויקט).

## 4. החלטות והנחות משמעותיות

1. **"the deploy build's loader" לא היה קיים.** `grep -n "build_page" products/chart-explainer/*.py` מצא את ההגדרה
   (`page.py`) וקורא אחד בלבד, `render.py:101`. לכן הטוען נכתב ב-`render.py`, הבנייה שכותבת את `page/index.html`, ולא
   ב-`page.py` (הפסיקה §3(3): "`page.py` carries nothing new in code").
2. **הטוען נכשל סגור.** `load_counter` מחזיר `None` רק כש-`projectKey` הוא בדיוק `""`; אחרת הוא בונה `{"host": apiHost,
   "key": projectKey}` ומעביר אותו ב-`page.counter_config` לפני שהוא מחזיר אותו, כך ש-`phx_`, טוקן לא תקין, host שלישי, שדה
   חסר, `null` או קובץ שאינו אובייקט JSON הם `ValueError`. ב-`render()` הקריאה היא הדבר הראשון אחרי טעינת ה-spec, ו-`OSError`
   (קובץ חסר) או `ValueError` הופכים ל-`RenderError` ("counter.json: …", exit 1 דרך `main`), לפני כל fetch או כתיבה. הפסיקה
   לא אמרה מה קורה כשהקובץ חסר; בחרתי סגור, כמו `counter_config`. `projectId` לא נקרא (הדף לא משתמש בו).
3. **בדיקת הקובץ המחויב תלויה במצבו, בכוונה.** "while it is empty": כש-`projectKey` ריק הבדיקה דורשת `None` ודף זהה
   ל-golden; אחרי M4 (כשהמושבה כותבת את המפתח) היא דורשת את המיפוי. כך M4 לא ישבור בדיקה, ושני המצבים נבדקים גם בקבצי tmp.
4. **`posthog-free-tier.md`:** השורה נכתבה כפריט רשימה ("- " ואחריו הנוסח המדויק של הפסיקה). בלי הסימן, Markdown היה מדביק
   אותה כהמשך של פריט ה-REOPEN שלפניה. זו התוספת היחידה מעבר לנוסח.
5. **`page.py`:** הנוסח של הפסיקה כלשונו, עם נקודה; שתי שורות הפכו לשלוש כדי להישאר ברוחב 120 בלי לגעת בשורה 6.
6. **`T1-PROTOCOL.md`:** אין בקובץ "שלב פריסה" נפרד; האזכור היחיד של פריסה הוא :30 ("D0 = public deploy **and** a recorded
   discovery submission"). לכן שתי השורות הוכנסו מיד אחרי :31, בתוך פריט 4, במקום לשבור את רשימת הנקודה-פסיק של :30 —
   כך שום שורה קיימת לא השתנתה. השורה של קיפול 11 נפתחת ב-"Prerequisite added 7.10.2026:" ואחריה נוסח הפסיקה.
7. **`counter.json`:** הפסיקה נתנה את התוכן ("in `site.json`'s manner"), לא נוסח; ה-`_comment` כתוב במילים שלי ואומר: הפרויקט
   של תת-המותג בארגון שלו, לעולם לא של המותג; ריק = בלי מונה, זהה ל-golden; `phx_` והוסט שלישי נדחים; המפתח ציבורי; המזהה לא
   סוד והדף לא משתמש בו; M4 כותב את שלושתם אחרי ארבע ההגדרות; הטוקן נקבע פעם אחת לפני D0 ולא מתחדש בזמן שעון.
8. **README:** בפריט 1 הוספתי את מה ש-M2 קובע ("renames and configures the new organisation's own Default Project rather than
   creating one beside it"), כדי שבונה לא יקרא ל-`project-create`. בפריט 2 ו-4 הפניתי ל"step 6's row in
   `src/revenue/owner-steps.ts`" בשם ולא במספר שורה: בונה אחר מוסיף בלוק כותרת ל-`owner-steps.ts` במקביל, ו-:404-409 יזוזו.
   לא הוספתי את R1-R3 של §4 ל-README: קיפול 7 לא ביקש.
9. **הנוסח "another product"** בלבד; שום שם, משתמש, אימייל או טוקן.

## 5. שגיאות וניסיונות שנכשלו

1. `node -e` עם גרש בתוך מחרוזת JavaScript שבר את ה-quoting של bash (exit 2, לא נכתב כלום). עברתי לסקריפט בקובץ scratch.
2. ההחלפה הראשונה ב-`T1-PROTOCOL.md` השתמשה ב-find דו-שורתי ששבר את שורה :32 באמצע ("**Sub-brand name (29.9.2026," ואז
   סוף שורה) ולכן לא נמצאה (0 מופעים, לא נכתב כלום). find של שורה :31 לבדה (ייחודית לפי ה-grep) עבד.
3. ה-docstring הראשון של `render.py` טען ש-`page/index.html` "is the page releases/t1/page.html pins" — טענה שלא בדקתי
   (רינדור מחדש לא רץ כאן). הוחלף לפני ה-commit בנוסח שאינו טוען זאת.

## 6. בדיקות ופעולות ולידציה

- `scripts/pytest-product.sh chart-explainer -q -rs`: **exit 0, 217 passed** (187 קודם + 30 חדשות ב-`test_counter_json.py`).
- `scripts/verify.sh src/__tests__/revenue/prize-terms-audit.test.ts src/__tests__/revenue/frozen-citations.test.ts
  src/__tests__/revenue/terms-saved-copies.test.ts src/__tests__/revenue/page-views.test.ts`: **exit 0** (typecheck 0;
  4 קבצים, 162 בדיקות עברו).
- `scripts/verify.sh` המלא: **exit 0** (typecheck 0; 80 קבצים, 2788 עברו, 2 דולגו — ב-`prize-apply-reading.test.ts`
  וב-`narration-licence-gate.test.ts`, דילוגים מותנים שאינם קשורים לשינוי), 3 דקות 48 שניות.
- `npx vitest run` ב-`products/il-biz-tools` (בגלל `site.json` וה-README): **exit 0, 32 קבצים, 887 בדיקות**.
- אף בדיקת vitest לא הצמידה את הטקסט שהשתנה ב-README או ב-note של posthog.com: `terms-saved-copies.test.ts:281-290`
  מצמידה ביטויים שנשארו כמו שהם (פתיחת ה-note, "is the main thread's call, to make before the first posthog.com line is
  queued", ההפניה ל-`posthog-free-tier.md`), ועברה. לכן לא הוצמד טקסט חדש.
- מוטציות (`node scripts/mutate.mjs --cmd "scripts/pytest-product.sh chart-explainer -q" --test tests/test_counter_json.py`,
  כל אחת לבד על ה-commit `079ddce`, baseline לפני ואחרי ב-exit 0): **12 הופעלו, 12 נהרגו, 0 שרדו**, כל ריצה exit 0, כ-2
  שניות למוטציה:
  - `render.py`: M1 `if cfg.get("projectKey") == "":` → `if not cfg.get("projectKey"):` (מפתח null נקרא ככבוי); M2
    `page.counter_config(counter)` → `None` (בלי אימות); M3 `"host": cfg.get("apiHost")` → `"host": "https://eu.i.posthog.com"`;
    M4 הסרת `, counter=counter` מהקריאה ל-`build_page`; M5 `load_counter(COUNTER_CONFIG)` → `load_counter()`; M6
    `except (OSError, ValueError)` → `except ValueError`; M7 `raise RenderError(...) from None` → `counter = None` (דחייה
    נבלעת והרינדור ממשיך כבוי); M8 `if not isinstance(cfg, dict):` → `if False:`; M9 `HERE / "counter.json"` →
    `HERE / "site.json"`.
  - `counter.json`: M10 `apiHost` → `https://app.posthog.com`; M11 `"projectId": ""` → `"projectId": "abc"`.
  - `site.json`: M12 הסרת `, products/chart-explainer/counter.json` מהמשפט החדש.
  לא נכתב קובץ plan: `src/__tests__/revenue/mutations/` לא ברשימת הקבצים שלי. הרשימה כאן מספיקה כדי להוסיף אותה ל-plan.
  השינויים בתיעוד בלבד (ה-docstring של `page.py`, README, ה-note, השורה ב-`posthog-free-tier.md`, `T1-PROTOCOL.md`) — אף
  בדיקה לא קוראת אותם, ולכן לא הוכנסו מוטציות עליהם.
- grep פרטיות על כל ה-diff המוכן ל-commit: תבנית השמות שה-brief נותן (מחוברת בזמן ההקלדה, ולא נכתבת בשום קובץ) — 0 שורות; `(phc|phx)_` ואחריו
  10 תווים ומעלה — 0 שורות; אימייל — 0 (שלוש ההתאמות היו `@pytest.mark.parametrize`).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

1. **החלפה מדויקת אחת בקובץ:** כתבתי `replace-exact.py` (find מקובץ, replace מקובץ, בדיוק מופע אחד, אחרת exit בלי כתיבה)
   והשתמשתי בו 9 פעמים. `scripts/loop-edit.mjs` עושה את זה רק ל-`logs/` ול-`research/channel-loop/`; כלי כזה לכל קובץ טקסט
   בריפו (עם `--dry-run`) היה חוסך את ה-heredocs ואת שגיאות ה-quoting של סעיף 5.
2. **הוספת משפט ל-`_comment` ב-JSON** עם בדיקת round-trip — אותו דבר עשו כבר ב-site.json בטיקים קודמים.
3. **מוטציות Python בלי plan:** 12 קריאות נפרדות ל-`mutate.mjs`. `mutation-plans.test.ts` מכיר רק plans של vitest; plan
   ל-chart-explainer (עם `cmd`) בתיקיית ה-mutations היה נותן ל-review להריץ את אותה רשימה.

## 8. על מה בוזבזו אסימונים, לפי פעולה

1. קריאת הפסיקה המלאה (88 KB) — נחוצה, אבל הקיפולים שלי יושבים בעיקר ב-§3 ו-"Folds for Opus"; כשליש ממנה (§2 edits
   לקבצים של בונה אחר, §4) לא היה נחוץ לעבודה הזו.
2. בדיקת `prize-terms-audit.test.ts` אחרי השוואות git-base שעלולות להישבר מהשינוי ב-note — היה מהיר יותר להריץ את הבדיקה
   מראש.
3. הודעות התזכורת החוזרות על רשימת המשימות של ה-thread הראשי (לא רלוונטיות לבונה).
4. שתי ההחלפות שנכשלו בסעיף 5 (מעט).

## לתשומת לב ה-thread הראשי (לא פסקתי)

1. `products/chart-explainer/README.md:52` אומר "`render.py` does not switch it on." — עכשיו לא מדויק: `render.py` מדליק את
   המונה מ-`counter.json` כש-`projectKey` נכתב. הקובץ לא ברשימה שלי.
2. `site.json` נשלח לאתר כולו כמו שהוא (`scripts/build-site.js` מעתיק אותו בלי הקרנה, `configShipPlan`), כך שהמשפט החדש
   ב-`_comment` ("the T1 sub-brand's project lives in its own organisation and its own config,
   products/chart-explainer/counter.json") יוגש באתר הציבורי של המותג. הוא לא נוקב בשם תת-המותג, ב-host או בטוקן. הוחל כפי
   שנפסק; השאלה אם קובץ ציבורי של המותג צריך להזכיר תת-מותג בכלל היא של ה-thread הראשי.
3. דף T1 עצמו נושא את המותג ב-`<title>` וב-`<header>` (`analyses/t1.json` `page.brand`; `releases/t1/page.html`), בזמן
   ש-`BOARD-LOOP.md:117` ו-§3 של הפסיקה שמים את הזרוע תחת תת-המותג כדי שלא תקושר למותג בפומבי. הטוקן הנפרד שומר על
   המונים נפרדים, אבל קוד המקור של הדף נוקב במותג בכל מקרה.
4. מצביעים שזזו בגלל השינוי הזה: `page.py:142-158` → `:143-160`, `:190-191` → `:191-192`, `:14` → `:15`, `:26-31` → `:27-32`,
   `:34-38` → `:35-39`; `render.py:101` → `:131-132`; `README.md:400-405` → `:402-407`, `:792` → `:798`; `T1-PROTOCOL.md`
   מ-:32 והלאה +2.

## תיקוני הסקירה

הסקירה (Opus) מצאה אפס ממצאי "blocking", שלושה ממצאי "fix" וארבע הערות ("note"). כל שלושת ה-"fix" יושמו לפי נוסח
התיקון של הסקירה; בשום מקום הנוסח לא סתר את הפסיקה, ולא פסקתי דבר.

**מיזוג הבסיס.** `git log HEAD..origin/claude/new-session-j071dx` הדפיס 11 commits (הבסיס זז ל-`c35725d`: קיפולי שורה 24
של הפסיקה, קוד ומסמכים, ו-amendment 1). `git merge --no-ff ... -m "merge base"` עבר בלי קונפליקט; תיקנתי את הודעת
ה-merge ב-`--amend` כדי שתישא את שתי שורות ה-trailer (ה-merge המקומי, לא נדחף; ההורים `03e209c`, `c35725d` נשמרו).

1. **`products/chart-explainer/counter.json` (fix).** ה-`_comment` טען שכשה-`projectKey` ריק הדף "byte-identical to
   tests/fixtures/t1-page-no-counter.golden.html, as releases/t1/page.html is". זה שקר, ובדקתי: `cmp` מראה ש-
   `releases/t1/page.html` (1,261,371 בתים) וה-golden (23,875 בתים) נבדלים מבית 2121; ה-golden נבנה מ-`_inputs` של
   `tests/test_page_counter.py` (dataset סינתטי קטן) ומקבע רק את מצב "בלי מונה" של `build_page` על הנתונים האלה. הנוסח
   החדש, בדרך של `page.py:13-14`: "(no script; that is the mode tests/fixtures/t1-page-no-counter.golden.html pins for
   page.build_page on the tests' own data, and the mode releases/t1/page.html is in)". וידאתי ש-`releases/t1/page.html`
   באמת במצב הזה: 0 `<script`, 0 `PostHog`. ערכי השדות לא השתנו (סקריפט שמשווה את שלושת השדות ואת סדר המפתחות לפני ואחרי;
   find אחד בדיוק). שלושת הקטעים ש-`test_counter_json.py` מקבע ב-`_comment` (נתיב הפסיקה, "never the brand's",
   "site.json") נשארו. **אותה טענה שגויה מופיעה בסעיף 4 פריט 7 של הלוג הזה** ("ריק = בלי מונה, זהה ל-golden"): היא שגויה
   באותו אופן; הנכון הוא "ריק = מצב בלי מונה, המצב שה-golden מקבע עבור `build_page`".
2. **`research/faceless-youtube/T1-PROTOCOL.md` → מצביעים שזזו (fix).** שתי השורות שקיפול 11 הוסיף (`:32-33`) הזיזו ב-+2
   כל שורה שאחריהן, וקיפול המסמכים של שורה 24 (בבסיס החדש) כיוון מצביעים למספור שלפני ההוספה. מכיוון שכבר מיזגתי את
   הבסיס לתוך ה-branch, תיקנתי אותם כאן ולא השארתי ל-thread הראשי (**ה-thread הראשי לא צריך להזיז אותם שוב**):
   - `research/youtube-kids/KIDS-LINE.md:259`: `T1-PROTOCOL.md:75-81` → `:77-83`, fail rule `:83-87` → `:85-89`.
   - `research/youtube-kids/KIDS-LINE.md:323`: `:77`, `:78`, `:80` → `:79`, `:80`, `:82` (הסוגריים "the ruling named `:75`,
     `:77` on an older tree" נשארו, והם עדיין נכונים).
   - `research/channel-loop/BOARD-LOOP.md:118` ו-`:210`: `T1-PROTOCOL.md:89-133` → `:91-135`.
   BOARD-LOOP נערך ב-`scripts/loop-edit.mjs replace-in-line` (dry-run ואז כתיבה, exit 0 לכל אחת); KIDS-LINE מחוץ לתחום
   של `loop-edit.mjs`, ולכן סקריפט Python עם find מדויק (מופע אחד בקובץ ובשורה, מספר השורות נשמר, בתים כמות שהם).
   הוכחה: לכל זוג, `cmp` בין הטווח הישן ב-`git show c35725d:research/faceless-youtube/T1-PROTOCOL.md` לבין הטווח החדש בעץ
   הממוזג — "same text" לכל השישה (`75-81`/`77-83`, `83-87`/`85-89`, `89-133`/`91-135`, `77`/`79`, `78`/`80`, `80`/`82`).
   `git diff c35725d -- T1-PROTOCOL.md` מראה hunk אחד בלבד (`@@ -29,6 +29,8 @@`), כך ש-+2 הוא ההזזה היחידה.
   **מצביעים אחרים ל-T1-PROTOCOL שלא נגעתי בהם:** חיפשתי בכל הריפו (`git grep` על `T1-PROTOCOL.md:<n>`). בקבצים שמותר לי
   לערוך, אלה כבר לא התאימו לטקסט גם ב-`c35725d`, כלומר הסחיפה קדמה לשינוי הזה ואינה שלו: `KIDS-LINE.md:36` (`:51-53`),
   `PREREG-DECISIONS.md:167` (`:87-88`), `:246` (`:40-42`), `:383` (`:43`), `:384` (`:38-39`), `:690` (`:26-28, :34`),
   `youtube-kids/ASSESSMENT.md:91` ו-`:520` (`:33`). לא תיקנתי אותם (לא ממצא של הסקירה, ואיני יודע לאן כל אחד התכוון בלי
   לפסוק). מצביעים בקבצי `RULING-*`, `SITTING-*` ו-`logs/` מוגנים ולא נגעו.
3. **`products/chart-explainer/README.md:52` (fix).** "`render.py` does not switch it on." הוחלף במשפט אחד: "`render.py`
   passes `counter.json`'s `{"host": apiHost, "key": projectKey}` to `build_page` when `projectKey` is set (ruling 7.10 §3,
   `research/channel-loop/RULING-2026-10-07-posthog-organisation.md`), and builds with no counter while it is empty, as it
   is now." ה-find הוכח קודם ב-`grep -n -F` (שורה 52, מופע אחד). הבדיקה היחידה שקוראת את ה-README
   (`test_netlify_files.py:83`) קוראת רק את שורת `netlify_files.py`.

**הערות ("note") — לא יושמו, ולמה.** (א) `posthog-free-tier.md:137`, `:164` מצטטים שורות `page.py` שזזו ב-+1: הקובץ משתנה
רק בשורות שנפסקו, ולכן נשאר; ה-thread הראשי ירשום בקיפול הבא. (ב) נתיב ה-CI של chart-explainer לא כולל את `site.json`, ואין
mutation plan ל-12 המוטציות: `chart-explainer-ci.yml` ו-`src/__tests__/revenue/mutations/` לא ברשימה שלי; אופציונלי.
(ג) ה-`_comment` של `site.json` נשלח לאתר הציבורי של המותג, ושם המותג מודפס בדף T1: שתי שאלות לישיבה, לא לי ולא לסוקר.
(ד) `load_counter` עם מפתח ריק לא בודק את `apiHost`: "None required".

**בדיקות (לפי exit code בלבד).** `scripts/pytest-product.sh chart-explainer -q`: exit 0 (217 passed). `scripts/verify.sh` על
ארבעת הקבצים (`prize-terms-audit`, `frozen-citations`, `terms-saved-copies`, `page-views`): exit 0 (162 passed). `scripts/verify.sh`
המלא: exit 0 (80 קבצים, 2815 passed, 2 skipped; העלייה מ-2788 היא הבדיקות שהגיעו עם הבסיס הממוזג). אף בדיקה לא קיבעה את
הטקסטים ששונו, ולא שונתה שום assertion. grep פרטיות על כל ה-diff של ה-branch ועל הודעות ה-commit: שמות 0, `phc_`/`phx_` עם
10+ תווים 0, כתובות אימייל 0.

**עבודה ידנית שכדאי להפוך לאוטומטית.** הזזת מצביעי `<file>:<n>` אחרי הוספת שורות לקובץ מצוטט: עשיתי בעין, ב-`git grep` ואז
`cmp` של כל טווח מול הבסיס. סקריפט `repoint-lines <file> --after <n> --by <k>` שמוצא כל `<file>:<n>` בריפו, מציע את ההזזה,
ומוכיח זהות טקסט מול ref, היה חוסך את זה ומוצא גם את הסחיפה הישנה (כמו השמונה שלמעלה). `loop-edit.mjs` לא מכסה את
`research/youtube-kids/`.

**אסימונים.** חיפושי ה-`git grep` של המצביעים (רוב התוצאות בקבצים מוגנים, שאסור לגעת בהם) — מעט; בדיקה כפולה של `--anchor`
שמתחיל ב-"-" ב-`loop-edit.mjs` (נדחה ב-exit 2 עד שעברתי לצורה `--anchor=`) — ריצה אחת מבוזבזת.
