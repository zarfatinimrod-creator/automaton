# יומן משימה — 28.9.2026 — מונה צפיות אנונימי ואופציונלי לעמוד ה-T1 (זרוע הרשת), בונה Opus

worktree מבודד (`.claude/worktrees/wf_8946dbfa-15d-1`), branch `worktree-wf_8946dbfa-15d-1`, בסיס `4fd389e` (ה-HEAD
שנמצא בהתחלה היה `29705ad`, ולכן בוצע `git reset --hard 4fd389e` לפי ההנחיה). בלי push, בלי `git stash`. לא נגעתי ב-
`logs/CHECKPOINT.md`, ב-`logs/CHANNEL_LOOP.md` או ב-`MISSION.md`.

## 1. מה המשתמש ביקש
משימה מתוך תסריט ה-workflow (לא מהבעלים ישירות): לזרוע הרשת של T1 חסר מכשיר מדידה לפני שהיא עולה
(`research/channel-loop/BOARD-LOOP.md` דרגה 5; `research/faceless-youtube/RED-TEAM.md` §2.1(c) מתיר צפיות בלי עוגיות
כתחליף ל-K0). לבנות, בדיקות קודם:
1. ל-`build_page` ארגומנט מילת-מפתח אופציונלי `counter=None`; כשהוא None הפלט זהה בית-לבית להיום, עם בדיקה שמקבעת זאת.
2. כש-`counter={'host', 'key'}` — סקריפט inline אחד וקטן (בלי טעינת סקריפט חיצוני, בלי עוגיות, בלי localStorage/
   sessionStorage, בלי טביעת אצבע) ששולח אירוע `$pageview` אנונימי אחד לנקודת ה-capture הציבורית של PostHog, עם מזהה
   אקראי לכל טעינה ועיבוד פרופיל אדם כבוי. לאמת את הנתיב והשדות מול התיעוד של PostHog דרך Context7, ולצטט.
3. יושר: כשהמונה פועל, "How this page was made" אומר במפורש שהעמוד סופר ביקורים באופן אנונימי, בלי עוגיות, דרך PostHog,
   ולא שומר דבר על המבקר; ה-docstring מתאר את שני המצבים. כשהוא כבוי — שום דבר לא משתנה.
4. ולידציה שנכשלת סגור: מפתח `^phc_[A-Za-z0-9]{20,}$`, host אחד משני ה-hosts של הענן, `phx_` נדחה במפורש.
5. בדיקות לכל אלה, וכל הבדיקות הקיימות נשארות ירוקות.

## 2. הפעולות המרכזיות שביצעתי
1. **תיעוד לפני קוד (Context7, `/posthog/posthog.com`)** — resolve אחד ושמונה שאילתות, על שבעה נושאים:
   - `contents/docs/api/capture.mdx`: ‏"[POST] <ph_client_api_host>/i/v0/e/"; ‏"Every event request must contain an
     `api_key`, `distinct_id`, and `event` field with the name. Both the `properties` and `timestamp` fields are
     optional."; דוגמת `$pageview` עם `$current_url`; ‏"Capture anonymous events by setting the
     `$process_person_profile` property to `false` in the event payload."
   - `contents/docs/api/index.mdx`: ‏`https://us.i.posthog.com` / `https://eu.i.posthog.com` "for public endpoints".
   - `contents/docs/_snippets/exposed-api-keys.mdx`: ‏`phc_` מותר שיהיה ציבורי; ‏`phx_` "should **NOT** be public".
   - `contents/tutorials/web-redact-properties.md` ו-`contents/docs/privacy/data-storage.mdx`: PostHog לוקח את כתובת
     ה-IP של הבקשה אלא אם "Discard client IP data" פעיל, ו-GeoIP עדיין יכול להשתמש בה לפני המחיקה.
   - ניסיון לאשר את המאפיין `$geoip_disable` ברמת ה-API הגולמי — **לא אושר** (רק `disableGeoip` של ה-SDK), ולכן לא
     השתמשתי בו.
2. **בדיקות קודם:** `tests/test_page_counter.py` (41 בדיקות), ו-golden fixture ‏`tests/fixtures/t1-page-no-counter.golden.html`
   שנוצר מ-`page.py` **לפני** השינוי (אומת ב-`git status` שרק קובץ הבדיקה היה חדש). ה-PNG בקלט קבוע כבתים (base64) כדי
   שהקיבוע לא יהיה תלוי בגרסת Pillow/zlib. הרצה ראשונה: 41 נכשלו (אדום), כמצופה.
3. **`page.py`:** `counter_config` (ולידציה, ValueError, הודעות שלא חוזרות על המפתח), `counter_script` (הסקריפט),
   `COUNTER_DISCLOSURE` (הפסקה), ו-`build_page(..., *, counter=None)` שמכניס שני מחרוזות ריקות כשהמונה כבוי. ציטוטי
   התיעוד בהערה מעל הקבועים. ה-docstring של המודול נכתב מחדש לשני המצבים.
4. **README:** שורת `page.py` בטבלה מתארת עכשיו את שני המצבים ואת תנאי הפריסה.

## 3. קבצים/מערכות ששונו
- `products/chart-explainer/page.py` — המונה, הוולידציה, הגילוי, ה-docstring.
- `products/chart-explainer/tests/test_page_counter.py` — חדש, 41 בדיקות.
- `products/chart-explainer/tests/fixtures/t1-page-no-counter.golden.html` — חדש, 23,875 בתים, הפלט לפני השינוי.
- `products/chart-explainer/README.md` — שורה אחת.
- `logs/2026-09-28-t1-page-counter.md` — היומן הזה.
- לא שונו: `render.py` (לא מדליק את המונה), `releases/t1/page.html`, שום מערכת חיצונית (לא נוצר פרויקט PostHog ולא נשלח
  אירוע).

## 4. החלטות והנחות משמעותיות
- **בלי ספריית ה-JS של PostHog** (שב-il-biz-tools נטענת מ-`-assets.i.posthog.com`): המשימה אסרה טעינה חיצונית, ולכן
  `fetch` אחד ישיר ל-`/i/v0/e/`.
- **`Content-Type: application/json`** כמו בדוגמת ה-curl בתיעוד, למרות שזה גורם ל-preflight של CORS; לא ניחשתי ש-
  `text/plain` יתקבל.
- **`$current_url` = ‏`location.origin + location.pathname`** — בלי query ובלי fragment, כדי לא לשלוח פרמטרים שרירותיים.
- **בלי `$referrer`** — המשימה ביקשה אירוע מינימלי. זה אומר שהקריאה ביום 56 לא תבחין בין מקורות תנועה; אם הדירקטוריון
  ירצה את זה, זה שינוי אחד בסקריפט ומשפט אחד בגילוי.
- **הגילוי על העמוד אומר גם שכתובת ה-IP מגיעה ל-PostHog ושהפרויקט מוגדר למחוק אותה ולא להפיק ממנה מיקום.** בלי המשפט
  הזה, "stores nothing about the visitor" היה נכון רק בתנאי שאף אחד לא כתב. זו **הנחה על הגדרות הפרויקט** שהקוד לא יכול
  לבדוק; ה-docstring וה-README דורשים לבדוק אותה לפני פריסה.
- **`phx_` נדחה בכל מקום במחרוזת** (לא רק בתחילתה), וכל ההודעות לא מדפיסות את המפתח.
- **`fullmatch` ולא `^...$`** — `$` של Python מקבל שורה חדשה בסוף; יש בדיקה לזה.
- `counter` הוא keyword-only; `{}` נדחה (לא נחשב "כבוי") — רק `None` מכבה.

## 5. שגיאות וניסיונות שנכשלו
- ה-worktree התחיל ב-`29705ad` ולא ב-`4fd389e` (כמו שהזהיר CLAUDE.md) — אופס ל-`4fd389e`.
- ב-container לא היה pytest ולא Pillow; פקודה משורשרת ליצירת venv נחסמה ע"י בידוד ה-worktree ("too complex to verify") —
  פוצלה לפקודות פשוטות.
- ניסיון לבדוק preflight של CORS מול `eu.i.posthog.com` (OPTIONS בלבד, בלי אירוע) — **403 מהפרוקסי**; לא אומת חי.
- `$geoip_disable` לא אושר ב-Context7 — הושמט במקום לנחש.

## 6. בדיקות ופעולות ולידציה
- `python -m pytest -q` ב-`products/chart-explainer`: **132 עברו** (91 קיימות + 41 חדשות), 0 נכשלו.
- השוואה עצמאית: `page.py` הישן (`git show 4fd389e:...`) מול החדש על אותם קלטים, פעם עם PNG קבוע ופעם עם PNG של Pillow
  (המסלול של הבדיקות הקיימות) — זהים בית-לבית כשהמונה כבוי.
- הסקריפט הורץ ב-Node 22 (`vm`, עם `fetch` ו-`location` מדומים ומלכודות על `document`/`navigator`/`localStorage`/
  `sessionStorage`/`screen`): בקשה אחת לכל טעינה, ל-`https://eu.i.posthog.com/i/v0/e/`, ‏POST, ‏`credentials: "omit"`,
  גוף `{"api_key","event":"$pageview","distinct_id":<32 hex>,"properties":{"$process_person_profile":false,
  "$current_url":"https://example.netlify.app/t1/"}}`; המזהה שונה בין טעינות; אף מלכודת לא נגעה.
- grep: אין מזהי בעלים ב-golden; `page.py` לא תופס את ביטוי ה-UPLOAD של `test_page_and_scope.py`.
- **לא אומת:** שהבקשה מתקבלת בפועל ב-PostHog מדפדפן (CORS, 200), ושהאירוע נשמר בלי IP/מיקום. זה נבדק רק אחרי פריסה
  ראשונה, דרך ה-PostHog connector (לשאול את האירוע האחרון ולראות את המאפיינים שלו).

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- יצירת venv לבדיקות Python של המוצר בכל container חדש: כדאי סקריפט `scripts/` קטן (או SessionStart hook) שמתקין את
  `requirements-dev.txt` של `products/chart-explainer` לתיקייה קבועה.
- בדיקת "האם הפרויקט של PostHog מוחק IP ו-GeoIP כבוי" לפני פריסה — מועמדת לבדיקה אוטומטית דרך ה-connector בשלב ה-
  PUBLISH-3 של הלולאה.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- שתי שאילתות Context7 על `$geoip_disable` שלא אישרו כלום (~3K אסימונים) — המחיר של לא לנחש.
- התקנת `requirements-dev.txt` המלא (כולל onnxruntime ו-kokoro) רק כדי להריץ בדיקות שלא צריכות אותם — זמן, לא אסימונים.
- קריאת קטעים ארוכים מ-BOARD-LOOP ו-RED-TEAM כדי למקם את המשימה (~6K) — נחוץ, אבל אפשר היה להסתפק ב-grep ממוקד יותר.
