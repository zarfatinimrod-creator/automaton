# 2026-09-27 — סרטון T1: מסלול הקוד של chart-explainer (בונה Opus)

## 1. מה המשתמש ביקש

ה-thread הראשי ביקש לבנות את מסלול הקוד לסרטון T1 של ניסוי ה-faceless-YouTube: הסבר אחד של 60–120 שניות על גרף,
מרונדר ועובר בדיקת שער, **ולא מפורסם**. בלי קוד העלאה, בלי שם הבעלים, בלי שם מותג, בלי הוצאה.

הדרישות:
- מפרט ניתוח;
- `fetch.py` עם בדיקת sha256;
- `figures.py`: אף מספר בקריינות לא מוקלד ביד;
- `charts.py` ב-1920x1080;
- `tts.py` עם Kokoro;
- `assemble.py`: סצנה נמשכת בדיוק כאורך הקריינות שלה, ויש קובץ SRT;
- `page.py`: זרוע ההשוואה בווב;
- `manifest.py` בצורת `VideoManifest`;
- `scripts/publication-check.ts`;
- צילום רישיון תחת `research/rendered/`;
- workflow רינדור שמופעל ידנית בלבד;
- בדיקות pytest ו-vitest;
- רינדור אמיתי בקונטיינר עם הוכחת ffprobe.

באמצע העבודה הגיע עדכון: Fable פסק על שתי השאלות הפתוחות (`PREREG-DECISIONS.md`). בעקבותיו `containsSyntheticMedia`
הוא `true`, נוסף שדה `narration`, ומשפט גילוי הקול הסינתטי חייב להופיע בתיאור מילה במילה. התוצאה הצפויה של השער
הפכה ל-FAIL על G3, G4 ו-G5 בלבד.

## 2. הפעולות המרכזיות שביצעתי

- **קריאה.** קראתי את MISSION, T1-PROTOCOL, RED-TEAM §2.5–2.12, VERDICT §11–16, `publication-gate.ts` (שלוש פעמים,
  כי הוא השתנה במהלך העבודה), DATASETS ו-`voice.py` של ה-fork.
- **בחירת מאגר הנתונים: C1, GitHub Innovation Graph (CC0-1.0).** הנימוקים:
  - הראיה לרישיון היא מקוד המפיק עצמו;
  - אין שכבת צד שלישי;
  - הקובץ יושב ב-raw.githubusercontent;
  - הנושא רחוק מכל נושא רגיש של G2.
- **בחירת השאלה: "Is TypeScript catching up with JavaScript on GitHub?"** הבדיקה על הנתונים גילתה דבר שחשוב לשאלה:
  ביחס, TypeScript סוגר פער, מ-18% ל-49% ממספר הדוחפים של JavaScript. במספרים מוחלטים הפער **גדל**, מ-1.1 ל-2.5
  מיליון. כתבתי את זה בקריינות, כי תשובה של "כן" בלבד הייתה חצי אמת.
- **הצמדת המאגר.** הצמדתי אותו ל-commit `078fb62` עם sha256. ה-panel הוא 92 כלכלות שמדווחות לשתי השפות בכל רבעון,
  כי הכיסוי גדל מ-93 ל-162 כלכלות, וסכום של "כל מה שמדווח" היה מערבב צמיחה אמיתית עם צמיחת כיסוי. EU הוצא מהחישוב.
- **`figures.py`.** לכל figure יש שם, קוד, עיגול half-up ויחידה.
  - שכבה נוספת של "טענות מילוליות", כמו "הפער גדל" ו"הכי מהר בשנה האחרונה": כל אחת היא פרדיקט, והרינדור נעצר אם
    אחת מהן שקרית.
  - בדיקת תבנית: אין ספרות ואין מילות מספר ("doubled", "half", "ten") מחוץ ל-placeholders.
- **הגרפים.** צבעים אומתו עם ה-validator של dataviz. TypeScript כחול ו-JavaScript כתום בכל הגרפים. בדקתי אותם ויזואלית
  ותיקנתי כותרות שנחתכו, תוויות צירים שנחתכו ומקרא שהתנגש.
- **Kokoro.** ה-URLs לקוחים מה-fork. ב-fork **אין sha256**. מדדתי את הערכים בהורדה הראשונה ואימתתי אותם מול pins
  עצמאיים ב-GitHub (code search, למשל `nordwestt/kokoro-wyoming` `ADD --checksum`).
- **הרכבה frame-exact.**
  - האודיו של כל סצנה מרופד למספר שלם של פריימים.
  - כל תמונה נחתכת ב-`trim=end_frame=N`.
  - יש קידוד אחד בלבד, ולכן אין תפרים של AAC בין סצנות.
- **ה-manifest.** שדות המבקרים נשארו `null`, והקבועים של הלוח שוקפו מה-TS, עם בדיקה שמשווה אותם לקוד ה-TS.
- **רינדור.** רינדרתי פעמיים; ברינדור השני ה-cache היה ריק. ה-MP4 יצא זהה בית-לבית (sha256 `3e66c91c…`).

## 3. קבצים/מערכות ששונו

**קבצים חדשים**

- `products/chart-explainer/`:
  - `.gitignore`, `README.md`, `requirements.txt`, `requirements-dev.txt`
  - `analyses/t1.json`
  - `fetch.py`, `figures.py`, `charts.py`, `tts.py`, `assemble.py`, `page.py`, `manifest.py`, `render.py`
  - `tests/`: `conftest.py`, `test_figures.py`, `test_fetch.py`, `test_tts_assemble.py`, `test_manifest.py`,
    `test_page_and_scope.py`, `fixtures/t1-manifest.fixture.json`
- `scripts/publication-check.ts`
- `src/__tests__/revenue/publication-check.test.ts`
- `.github/workflows/chart-explainer-render.yml`: `workflow_dispatch` בלבד, בלי secrets.
- `.github/workflows/chart-explainer-ci.yml`
- `research/rendered/github-innovationgraph-licence.txt` + `.meta.json`
- `research/rendered/github-innovationgraph-datasheet.txt` + `.meta.json`

**קבצים ששונו:** `products/README.md`, שורה אחת בטבלה.

**בקונטיינר בלבד:** `apt-get install ffmpeg`, כדי לקבל את ffprobe להוכחה. ב-pipeline עצמו יש fallback ל-ffmpeg
המצורף של imageio-ffmpeg.

**לא נגעתי ב:** `publication-gate.ts`, `LICENCE-IGO-DECISION.md`, `docs/`, `logs/CHECKPOINT.md`, `urls.txt`. לא הרצתי
git שמשנה מצב.

## 4. החלטות והנחות משמעותיות

- **`scheduledAt`.** אין תאריך פרסום. השדה מקבל את זמן סיום הרינדור, כדי ש-G6 יקבל תאריך אמיתי, וזה מוסבר
  ב-`manifest.notes.json`. שלב הפרסום חייב להריץ את השער מחדש עם הזמן האמיתי.
- **`tokenCostIls = 0`.** אין טוקנים שחויבו דרך API. טוקני הסשן לא נמדדו פר-סרטון, וזה כתוב בהערות.
- **`runnerMinutes`.** נמדד מתחילת ה-job (`--clock-start`) ומעוגל למעלה. בקונטיינר יצא 1.83 דקות.
- **נרמול שנים.** הרחבתי את ה-regex של ה-fork כך שיכסה גם 20xx, כדי ש-"2020" יוקרא "twenty twenty". גם "IP" נקרא
  "I P", ורק בקול.
- **"at most 5 percentage points".** הערך הגולמי הוא 4.54. עיגול לספרה עשרונית אחת היה נותן 4.5, שקטן מהגולמי, ואז
  הטענה הייתה שקרית. לכן הוספתי את הטענה `no_earlier_gain_exceeds_spoken`.
- **רישיון.** CC0 הוא public domain dedication ולא CC BY. ה-brief התיר את C1, וזה מתיר יותר מ-CC BY.

## 5. שגיאות וניסיונות שנכשלו

- **sha256 של Kokoro.** ה-brief אמר שהערכים נמצאים ב-fork, והם לא שם. ניסיתי שני מקורות רשמיים לאימות, ושניהם נחסמו:
  - `get_release_by_tag` (MCP) — access denied;
  - `api.github.com` — 403.

  מה שעבד: code search, שמצא pins זהים בפרויקטים אחרים.
- **אורך הקריינות.** הטיוטה הראשונה הייתה 285 מילים, כ-123 שניות, מעל התקרה. הגרסה השנייה נמדדה ב-116.6 שניות, עם
  מרווח קטן מדי. אחרי קיצוץ: 107.8 שניות.
- **גרפים.** בגרסה הראשונה כותרות ו-footer נחתכו ותוויות בגרף העמודות נחתכו משמאל. הוספתי `_fit()`.
- **probe.** ב-ffmpeg 7 עם `-c copy` לא מדווח `frame=`. עברתי ל-decode.
- **טעות שלי בבדיקה.** כתבתי regex שכולל את שם הבעלים ושמות מותג. תפסתי את זה לפני commit (בדקתי ב-git log), ומחקתי את
  הבדיקה.
- **הבדיקה שלי תפסה אותי.** המחרוזת `youtube_publish_at` הופיעה בפרוזה בהערת ה-manifest. ניסחתי מחדש.
- **apt.** הניסיון הראשון החזיר 404 כי האינדקס היה ישן. `apt-get update` פתר.

## 6. בדיקות ופעולות ולידציה

- **pytest:** 62 עברו, כולל קידוד וידאו אמיתי קטן ובדיקת פריים הגבול.
  - mutation של off-by-one ב-trim נתפס.
- **vitest `src/__tests__/revenue`:** 627/627 בדיקות ב-32 קבצים, מתוכן 13 חדשות ב-`publication-check.test.ts`.
- **`npx tsc --noEmit`:** exit 0. גם הסקריפט והבדיקה, שאינם ב-tsconfig, נבדקו בנפרד: exit 0.
- **ffprobe:**
  - משך 107.833333 שניות;
  - h264 High, 1920x1080, 16:9, yuv420p, 30fps, 3235 פריימים (הסכום המדויק של פריימי הסצנות);
  - aac LC, 48kHz, מונו;
  - 4,061,766 בתים.
- **פריימי גבול:** פריים 605 שייך ל-s1 ו-606 ל-s2. פריים 1275 שייך ל-s2 ו-1276 ל-s3.
- **publication-check:** FAIL על G3, G4 ו-G5 בלבד. עם `--expect G3,G4,G5` ה-exit הוא 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית

- **גיליון מגע של הגרפים.** יצרתי ידנית contact sheet לבדיקה ויזואלית. כדאי להפוך את זה לדגל `--contact-sheet`
  ב-`render.py`.
- **צילום רישיון.** שמירת קובץ GitHub ב-commit מוצמד בצורת meta של render-watch נעשתה ידנית. כדאי סקריפט קטן, כי שישה
  סרטונים ידרשו את זה שוב.
- **שלוש סוויטות.** pytest, vitest ו-tsc על קובץ חיצוני לפרויקט רצים כל אחד בנפרד. כדאי פקודה אחת.

## 8. על מה בוזבזו אסימונים, לפי פעולה

- **חיפוש sha256 שלא קיים ב-fork:** כשש קריאות, כולל שני ניסיונות API חסומים.
- **קיצוץ הקריינות:** שני סבבים של TTS, כדקה כל אחד. אפשר היה להעריך מראש לפי 150 מילים לדקה.
- **תיקוני layout של הגרפים:** שני רינדורים ובדיקה ויזואלית. היה נמנע אילו `_fit()` נכתב מההתחלה.
- **קריאות חוזרות של `publication-gate.ts`:** שלוש, כי הקובץ השתנה תוך כדי עבודה. זה הכרחי, לא בזבוז.
