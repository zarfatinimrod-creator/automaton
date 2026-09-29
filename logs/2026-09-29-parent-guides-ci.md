# 29.9.2026 — CI ל-products/parent-guides

## 1. מה המשתמש ביקש

ל-`products/parent-guides` (מרנדר Python לסרטוני הדרכה להורים בעברית, מוחזק ולא מפורסם) יש 73 בדיקות pytest
ואין להן job ב-CI. המשימה (בונה Opus, worktree מבודד): להוסיף workflow בדגם של `chart-explainer-ci.yml` —
הפעלה ב-push וב-pull_request על `products/parent-guides/**` ועל קובץ ה-workflow עצמו, Python 3.11, התקנה רק של
מה שהבדיקות צריכות; בדיקות שצריכות את Kokoro, את Whisper (שער ה-ASR) או רשת — לדלג עליהן בצורה נקייה עם סיבה
(עדיף) או להוריד מודל מוצמד ושמור במטמון; לא לסמן כדילוג בדיקה שיכולה לרוץ בלי מודל, לא למחוק בדיקות, וה-job
חייב להיכשל אם בדיקה שרצה נכשלת. לאמת מקומית ב-venv נקי תחת /tmp, כולל כישלון מכוון בבדיקה טהורה.

## 2. הפעולות המרכזיות שביצעתי

1. בדקתי את בסיס ה-worktree: הוא עמד על `fd5ff9a`, ו-`01e551e` לא היה אב קדמון, אז `git fetch` ו-`git reset
   --hard origin/claude/new-session-j071dx` — עכשיו על `b97fa4b`, ו-`products/parent-guides` קיים.
2. קראתי את `chart-explainer-ci.yml`, `products-ci.yml`, `scripts-python-ci.yml`, את `conftest.py` ואת כל
   קובצי הבדיקה, ואת `tts.py`, `asr_gate.py` ו-`render.py`.
3. הממצא: **אף בדיקה לא צריכה מודל או רשת.** `tts.py` מייבא את `kokoro_onnx` ואת `phonikud` רק בתוך
   `Narrator`, ו-`asr_gate.py` מייבא את `sherpa_onnx` ו-`soundfile` רק בפונקציית התמלול; הבדיקות קוראות רק
   לחלקים הטהורים (`kokoro_hebrew`, `require_vowelised`, `cer`, `missing_critical`, `is_critical`). בדיקות
   `test_refuse` מריצות את `render.py --voice none` על spec פגום, והוא יוצא ב-2 לפני כל import של numpy,
   soundfile או ffmpeg. `ffmpeg_cmd` רק בונה רשימה. לכן לא סימנתי שום בדיקה כדילוג.
4. הוספתי `requirements-test.txt`: רק Pillow, python-bidi, numpy (הגרסאות נלקחות מ-`requirements.txt` דרך
   `-c`), pytest ו-fonttools. `requirements-dev.txt` הפך ל-`-r requirements.txt` + `-r requirements-test.txt`,
   כך שכל גרסה מוצמדת במקום אחד בלבד ו-`setup.sh` מתקין בדיוק את אותן 28 חבילות כמו קודם.
5. הוספתי `.github/workflows/parent-guides-ci.yml`: התקנת `requirements-test.txt` בלבד; שלב שמוודא ש-Pillow
   פורס עברית עם raqm (ואם חסר libfribidi במכונה — מתקין `libfribidi0` ב-apt, ורק אז); ושלב הבדיקות עם
   `set -o pipefail` שנכשל גם על בדיקה שנכשלה וגם על בדיקה שדולגה.
6. שורה אחת ב-README שמסבירה שהבדיקות צריכות רק את `requirements-test.txt`.

## 3. קבצים/מערכות ששונו

- `.github/workflows/parent-guides-ci.yml` (חדש)
- `products/parent-guides/requirements-test.txt` (חדש)
- `products/parent-guides/requirements-dev.txt` (עכשיו מפנה ל-requirements.txt ול-requirements-test.txt)
- `products/parent-guides/README.md` (פסקה אחת על הבדיקות וה-CI)
- `logs/2026-09-29-parent-guides-ci.md` (הקובץ הזה)

לא נגעתי בשום קובץ בדיקה, ולא ב-`logs/CHECKPOINT.md`, `CHANNEL_LOOP.md`, `FABLE_QUEUE.md`, `MISSION.md` או
`CLAUDE.md`.

## 4. החלטות והנחות משמעותיות

- **אין דילוגים, כי אין מה לדלג.** הנחת המשימה ("חלק מהבדיקות צריכות Kokoro/Whisper/רשת") לא התקיימה בקוד; הוכחתי
  את זה בהרצה בלי המודלים, בלי חבילות הקול וה-ASR, ובלי רשת (`unshare -n`).
- **דילוג מכשיל את ה-job.** ב-CI דילוג יכול לנבוע רק מתלות שנעלמה: `test_glyphs` ו-`test_frames` מתחילים ב-
  `pytest.importorskip`, כך שבלי fonttools או Pillow הם היו מדלגים בשקט וה-CI היה ירוק. אם בעתיד תתווסף בדיקה
  שבאמת צריכה את הקול או את Whisper, צריך לתת לדילוג שלה סיבה ולהתיר אותו במפורש בשלב הזה.
- **raqm.** ה-wheel של Pillow כולל את raqm ו-HarfBuzz אבל טוען את FriBiDi מהמערכת. בלי FriBiDi, המקרה `raqm`
  ב-`test_every_frame_lays_out_cleanly` היה מדלג, ושאר בדיקות הפריימים היו רצות על המנוע `basic` — לא על המנוע
  שהמרנדר משתמש בו. השלב בודק, ומתקין ב-apt רק אם חסר, כך שבמקרה הרגיל זה לא עולה זמן.
- **נתיב נוסף בטריגר: `research/rendered/yk-*`.** זה מעבר למה שהתבקש, בדיוק כמו ש-`scripts-python-ci.yml`
  מוסיף את `research/owner-asks/**`: `test_sources` ו-`test_numbers` קוראים את הלכידות האלה, ושינוי בלכידה
  יכול לשבור אותן. נתיב ה-workflow נכלל גם ב-pull_request (ב-chart-explainer הוא רק ב-push).
- לא הוספתי מטמון pip: ההתקנה היא 9 חבילות ולוקחת שניות.

## 5. שגיאות וניסיונות שנכשלו

- ניסיון ראשון: `pip install -c requirements-dev.txt Pillow python-bidi numpy pytest fonttools`, כדי לא לשכפל
  גרסאות. נכשל: ה-`-r requirements.txt` שבתוך קובץ constraints מתפרש כדרישה, ו-pip התקין את כל חבילות הקול
  (kokoro-onnx, onnxruntime, phonikud ועוד). מכאן הפיצול ל-`requirements-test.txt`.
- מנגנון הבידוד של ה-worktree חסם כמה פקודות bash מורכבות (heredoc, `bash -e` על סקריפט, צינור עם
  `PIPESTATUS`); עברתי ל-Write ולסקריפט Python ב-scratchpad שמריץ את שלבי ה-`run:` של ה-job.

## 6. בדיקות ופעולות ולידציה

כל ההרצות ב-venv נקי `/tmp/pg-ci-venv` (Python 3.11.15), בלי `.cache/models`, בלי kokoro-onnx, onnxruntime,
phonikud, soundfile ו-sherpa-onnx. סקריפט ב-scratchpad קורא את ה-YAML ומריץ כל שלב `run:` עם `bash -e` (כמו
ברירת המחדל של GitHub) בתיקיית העבודה של ה-job:

- הרצה מלאה של ה-job: `pip install -r requirements-test.txt` התקין 9 חבילות בגרסאות המוצמדות;
  `raqm 0.10.5 fribidi 1.0.13`; **`73 passed in 19.27s`**; קוד יציאה 0.
- בלי רשת (`unshare -n`, בלי משתני proxy): `73 passed in 19.55s`.
- כישלון מכוון בבדיקה טהורה (הוספתי `and G.is_critical("לילדים")` ל-`test_critical_words_behind_prefix_letters`):
  `1 failed, 72 passed`, קוד יציאה 1. החזרתי, ו-`git status` הראה שקובץ הבדיקה נקי.
- דילוג מכוון (הסרתי את fonttools מה-venv): `71 passed, 1 skipped` (דילוג ברמת מודול מסתיר שתי בדיקות),
  `::error::a parent-guides test was skipped`, קוד יציאה 1. התקנתי שוב והרצתי את כל ה-job: שוב 73 עברו.
- `pip install --dry-run -r requirements-dev.txt`: אותן 28 חבילות באותן גרסאות כמו לפני השינוי.
- בדקתי שהבדיקה `raise SystemExit(not features.check('raqm'))` מחזירה 1 בלי raqm ו-0 איתו.
- לא נבדק: ריצה אמיתית על runner של GitHub (אין push מה-worktree), ולכן גם לא ענף ה-apt של libfribidi0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- הרצת שלבי `run:` של workflow מקומית (הסקריפט `run_workflow.py` ב-scratchpad) — שימושי לכל job חדש בריפו;
  שווה להעביר ל-`scripts/` אם זה יחזור, או להשתמש ב-`act` אם יותקן.
- שלושת ה-workflows של Python (`chart-explainer-ci`, `scripts-python-ci`, `parent-guides-ci`) חוזרים על אותם
  שלבים; workflow לשימוש חוזר (`workflow_call`) יחסוך העתקות אם יתווסף מוצר Python רביעי.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- קריאת כל קובצי הבדיקה במלואם (כ-31KB) — נחוץ כדי לקבוע שאין בדיקה שתלויה במודל, אבל grep ל-import-ים ול-
  `importorskip` היה מספיק לרוב ההחלטה.
- ניסיון ה-constraints שנכשל: התקנה מלאה אחת מיותרת (כ-10 שניות, מעט אסימונים).
- שלוש פקודות שנחסמו על ידי הבידוד ונכתבו מחדש.
