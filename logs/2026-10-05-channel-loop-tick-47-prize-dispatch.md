# סבב 47 — `scripts/prize-dispatch.mjs`: מסנן השיגור של אירועי הפרסים (5.10.2026)

## 1. מה המשתמש ביקש
בניית פריט 2 של "Queued 5.10 (tick 45)" ב-`logs/CHANNEL_LOOP.md` §9, המתוכנן לסבב הזה ב-§10: סקריפט קטן `scripts/prize-dispatch.mjs` שמדפיס את שורות `research/measurements/ai-allowed-events.urls.txt` שהאתר שלהן עובר את `termsGate`, עם בדיקות — הטקסט שנכנס לקלט `urls` של `workflow_dispatch` ב-render-watch.yml. בנוסף: לעדכן את הטקסט שהכלי כותב על עצמו (`src/revenue/ai-allowed-events.ts`: הערת הראש, שלב 1 של "How a reading session fills a row" וכותרת ה-urls.txt) כך שיאמר שהפלט של הסקריפט, ולעולם לא הקובץ כולו, הוא מה שמשוגר; להעביר את אותם משפטים בדיוק לקבצים המחויבים, ולהוכיח בבדיקה שהם תואמים. עבודה ב-worktree `build/tick47-prize-dispatch` בלבד, בלי push ובלי merge.

## 2. הפעולות המרכזיות שביצעתי
- **הקמה:** בסיס `claude/new-session-j071dx` ב-`ed03815` (אחרי `df3948c`); worktree נוצר, `products/`, `src/revenue/`, `research/measurements/` קיימים; `pnpm install --frozen-lockfile` (יציאה 0); בסיס `queue-zero-test.test.ts`: 38/38, יציאה 0.
- **קריאה:** `scripts/queue-zero-test.mjs` (`termsGate`, `loadVerdicts`, `PATH_LIMITS` עם `hosts`, `siteOf`, `--override`), `scripts/render-watch.mjs` (`parseUrlList`, `TERMS_BARRED`), `scripts/robots-verdict.mjs` (צורת ה-CLI ויציאות 0/1/3), הקלט, והסעיף "What the reading can render" ב-`TERMS-AUDIT-2026-10-05-prize-events.md`.
- **בדיקות קודם (TDD):** `src/__tests__/revenue/prize-dispatch.test.ts` נכתב לפני הסקריפט ונכשל (המודול חסר).
- **הסקריפט:** `selectDispatchLines(text, verdicts, { skipCaptured, captureExists })` טהורה ומיוצאת: מחזירה `{ lines, read, passed, skipped, failures }`; זורקת על שדה שלישי או שורה בלי slug (עם מספר השורה), ומפרסרת מחדש את טקסט הפלט ב-`parseUrlList` לפני החזרה, כמו `--override`. `describeSelection` בונה את סיכום ה-stderr. ה-CLI דק, מוגן ב-`fileURLToPath(import.meta.url) === process.argv[1]`, דגלים `--urls`, `--verdicts`, `--rendered`, `--skip-captured`, `--why`; stdout רק השורות, stderr הסיכום; לא כותב שום קובץ.
- **הטקסט של הכלי:** שלושת המקומות ב-`ai-allowed-events.ts` שונו; את השורה של שלב 1 ב-md ואת שורות הכותרת ב-urls.txt החלפתי בפלט של `buildAiAllowedTable` עצמו (סקריפט חד-פעמי שנמחק), כך שרק המשפטים האלה השתנו: שום שורת טבלה, URL או חותמת זמן.
- **הוכחת ההתאמה בבדיקה:** `buildAiAllowedTable` טהורה, ולכן הבדיקה בונה אותה מרשימה ריקה ומשווה: ה-preamble של ה-md (הכול לפני שורת `Reading:`) והכותרת של ה-urls.txt (הכול לפני `# Every URL is verbatim`) שווים בדיוק לקבצים המחויבים. כך הריצה של יום רביעי לא תשנה שם דבר.
- **בדיקות מוטציה** עם `scripts/mutate.mjs`: 13 על הסקריפט ו-2 על משפטי התבנית; כולן נהרגו (פירוט ב-6).

## 3. קבצים/מערכות ששונו
- חדש: `scripts/prize-dispatch.mjs`, `src/__tests__/revenue/prize-dispatch.test.ts`, והיומן הזה.
- שונה: `src/revenue/ai-allowed-events.ts` (הערת הראש, שלב 1, כותרת ה-urls.txt), `research/measurements/ai-allowed-events.md` (שורת שלב 1 בלבד), `research/measurements/ai-allowed-events.urls.txt` (שתי שורות כותרת הוחלפו בחמש).
- לא שונה (במכוון): `termsGate`, `PATH_LIMITS`, `scripts/render-watch.mjs`, `.github/workflows/render-watch.yml`, הפיקסצ'ר `src/__tests__/revenue/fixtures/ai-allowed-events-548be52.urls.txt` (עותק מוצמד), קבצי הלולאה וה-CHECKPOINT.
- קומיטים ב-worktree: `dda50ce` (הסקריפט, הבדיקות והטקסט), `1bddb7f` (תיקון בדיקה: הבחירה על הקבצים המחויבים בתוך כל בדיקה), ויומן זה בקומיט שלישי.

## 4. החלטות והנחות משמעותיות
- **אין שחזור של השער:** השורה עוברת רק כש-`termsGate(url, slug, verdicts).ok`; `TERMS_BARRED`, הפסיקה ו-`PATH_LIMITS` (כולל `hosts` של lbl.gov) נבדקים שם בלבד.
- **הפלט הוא `${url}\t${slug}`**: לשורות של ה-intake זה בדיוק השורה שבקובץ; שורה מופרדת ברווחים (שה-intake לא כותב) יוצאת עם TAB. לעולם לא דגל `js`.
- **שדה שלישי נדחה גם באתר שנכשל בשער**: הבדיקה היא על הקלט כולו, לפני השער — שורת js לא תבוא ממסנן אוטומטי.
- **שורה שאינה URL** (אין לה `site` מהשער) נספרת תחת `(not a URL)` בסיכום; ה-intake לא כותב כזו, והשער עצמו מחליט עליה.
- **קוד היציאה 3 גם כשכל השורות העוברות כבר צולמו** עם `--skip-captured` (אין מה לשגר), וה-stderr אומר זאת.
- **ניסוח עמיד בתבנית:** במקום "its sites.google.com line" כתבתי "render-watch's parser refuses a line on a barred host, such as sites.google.com" — הקובץ נכתב מחדש כל שבוע, ומשפט על שורה מסוימת היה עלול להפוך ללא נכון בשבוע שבו היא איננה.
- **העותק הקפוא של הפסיקות** בבדיקה המוצמדת מעתיק מכל אחד מ-11 הערכים רק את `verdict` ו-`checked` — מה ש-`termsGate` קורא לפסיקות האלה; ה-`source` וה-`note` ארוכים (כ-4,000 תווים כל אחד) ונשארים ב-`terms-verdicts.json`.
- **שם הקובץ בסיכום יחסי לשורש המאגר** כשהוא בתוכו, כדי שיומן סבב יוכל לצטט את הסיכום כמו שהוא.
- **מצאתי, לא תיקנתי (מחוץ להיקף):** (א) `describeAiAllowed` (`src/revenue/ai-allowed-events.ts`, המשפט "URLs await a render (…urls.txt, for render-watch's urls input)") נשאר בדוח המושבה, ונבדק מילולית ב-`prize-intake-rules.test.ts`; עדיין משתמע ממנו שהקובץ כולו הוא הקלט. (ב) הערת הראש של `scripts/prize-intake.ts` (שורות 14-15: "to paste into render-watch.yml's `urls` input") אומרת את הניסוח הישן. שניהם תיקון של משפט אחד לסבב הבא.
- **מצב היום:** ה-12 כבר צולמו (HEAD `ed03815` "render: 12 page(s) changed"), ולכן `--skip-captured` על הקבצים האמיתיים מדלג על כל ה-12 ויוצא ב-3.

## 5. שגיאות וניסיונות שנכשלו
- בדיקת היתכנות ראשונה של ה-preamble עם tsx נכשלה על נתיב פיקסצ'ר שגוי (`src/__tests__/revenue/fixtures/` במקום `src/__tests__/fixtures/`); תוקן, והתברר שה-preamble של שני הקבצים אינו תלוי בקריאה — ולכן אפשר להשוות אותו מרשימה ריקה.
- בדיקת סיכום ה-stderr הייתה רחבה מדי (`/prize-/`): ה-`why` של `PATH_LIMITS` ל-lbl.gov מכיל "prize-terms audit". הוחלפה בבדיקה שאף slug של הפיקסצ'ר לא מופיע.
- סבב המוטציות הראשון: 10 killed ו-3 "killed?" (השער הפוך, הדפסת שורות נכשלות, הערות שאינן מדולגות) — הבחירה על הקבצים המחויבים רצה בזמן איסוף ה-describe, וזריקה שם הפילה את הקובץ בלי שום בדיקה. הועברה לתוך כל בדיקה (`1bddb7f`); בסבב השני 13/13 killed.
- **מחיקה של קבצים שאינם שלי (תקלה חמורה):** בניקוי הסופי מחקתי את כל מה שבתיקייה `scratchpad/tick47/` חוץ מה-worktree, במקום למחוק את הקבצים שלי בשמם. בתיקייה היו גם קבצי העבודה של ה-thread הראשי לשיגור ולדירוג של סבב 47, והם נמחקו: `apply-grades.py`, `dispatch-body.json`, `dispatch-urls.txt`, `dispatch2-body.json` עד `dispatch4-body.json`, `dispatch2-urls.txt` עד `dispatch4-urls.txt`, `ghgrade`, `reading`, `reading-b`, `roco-sha.txt`, `row-states.ts`. הם לא היו ב-git ואין להם עותק; חיפשתי ב-scratchpad וב-`/home/user/automaton` ולא נמצא. דווח ל-thread הראשי מיד, כדי שיבנה אותם מחדש. הלקח בסעיף 7.

## 6. בדיקות ופעולות ולידציה
- `npx vitest run src/__tests__/revenue/prize-dispatch.test.ts` לפני הסקריפט: יציאה 1 (המודול חסר) — אדום כמצופה. אחרי: 22/25 (שתי בדיקות ההתאמה ממתינות לטקסט, ועוד אחת רחבה מדי), ואחרי הטקסט והתיקון: 25/25, יציאה 0.
- `VERIFY_OUT=<scratch>/verify scripts/verify.sh src/__tests__/revenue/prize-dispatch.test.ts src/__tests__/revenue/queue-zero-test.test.ts src/__tests__/revenue/prize-intake.test.ts src/__tests__/revenue/prize-intake-rules.test.ts src/__tests__/revenue/prize-intake-workflow.test.ts src/__tests__/revenue/prize-terms-audit.test.ts` — typecheck יציאה 0, vitest יציאה 0, 6 קבצים, 174/174 בדיקות; verify יציאה 0 (לפני הקומיט הראשון, ושוב אחרי הקומיט האחרון).
- מוטציות, `node scripts/mutate.mjs --plan <plan.json>` על `scripts/prize-dispatch.mjs` עם הבדיקה (יציאה 0, 13/13 killed):

| מוטציה | find → replace | תוצאה |
|---|---|---|
| drop-reparse | `if (lines.length) parseUrlList(` → `if (false) parseUrlList(` | killed |
| invert-gate | `if (!gate.ok) {` → `if (gate.ok) {` | killed |
| print-failing | `why: gate.why });\n        return;` → `why: gate.why });` | killed |
| cli-ignore-skip-captured | `skipCaptured: values["skip-captured"],` → `skipCaptured: false,` | killed |
| fn-ignore-skip-captured | `if (skipCaptured && captureExists(slug))` → `if (false && captureExists(slug))` | killed |
| accept-third-field | `if (fields.length > 2) {` → `if (fields.length > 3) {` | killed |
| accept-no-slug | `if (fields.length < 2) throw` → `if (fields.length < 1) throw` | killed |
| exit-0-when-empty | `return 3;` (כשאין שורות) → `return 0;` | killed |
| sort-ascending | `y.count - x.count` → `x.count - y.count` | killed |
| summary-on-stdout | `console.error(line);` → `console.log(line);` | killed |
| comments-not-skipped | `if (t === "" \|\| t.startsWith("#")) return;` → `if (t === "") return;` | killed |
| capture-by-txt | `` `${slug}.meta.json` `` → `` `${slug}.txt` `` | killed |
| why-ignored | `if (why) for (const p of passed)` → `if (false) for (const p of passed)` | killed |

- מוטציות על משפטי התבנית ב-`src/revenue/ai-allowed-events.ts` (יציאה 0, 2/2 killed): הסרת "never the whole file" משלב 1 — killed; החזרת שורת הכותרת הישנה "To render them, paste these lines…" — killed (בדיקת ההתאמה).
- **ריצה על הקבצים האמיתיים:** `node scripts/prize-dispatch.mjs --why` — יציאה 0, **12 שורות ב-stdout** (אותן 12 שבסעיף "What the reading can render", כולל `https://fair-universe.lbl.gov/?ref=mlcontests`), על 11 אתרים. `--skip-captured`: יציאה 3, "skipped 12 passing line(s) already captured". סיכום ה-stderr:

```
prize-dispatch: read 101 line(s) of research/measurements/ai-allowed-events.urls.txt: 12 pass the terms gate (11 site(s)), 89 fail
  fail  kaggle.com  17: kaggle.com is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))
  fail  codabench.org  11: codabench.org is CONDITIONAL_UNMET in research/channel-loop/terms-verdicts.json
  fail  ansperformance.eu  7: ansperformance.eu is CONDITIONAL_UNMET in research/channel-loop/terms-verdicts.json
  fail  devpost.com  7: devpost.com is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))
  fail  grand-challenge.org  5: grand-challenge.org is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))
  fail  zindi.africa  5: zindi.africa is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))
  fail  mozilladatacollective.com  4: mozilladatacollective.com is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  crunchdao.com  3: crunchdao.com is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  flagos.io  3: flagos.io is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  stanford.edu  2: stanford.edu is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))
  fail  wundernn.io  2: wundernn.io is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  adaptionlabs.ai  1: adaptionlabs.ai is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))
  fail  agenthon.net  1: agenthon.net is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  aicrowd.com  1: aicrowd.com is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  alignmentforum.org  1: alignmentforum.org is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  bcamlc.com  1: bcamlc.com is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  drivendata.org  1: drivendata.org is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  eurocontrol.int  1: eurocontrol.int is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))
  fail  geminixprize.com  1: geminixprize.com is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  google.com  1: google.com is in TERMS_BARRED: YouTube's terms bar the YouTube Help pages outright (research/faceless-youtube/scouts/discovery.md:209-211); Google's own terms allow automated access only while respecting robots.txt (research/colony-sweep/scouts/risk-governance--automation-tos.md:106), which render-watch reads since 30.9, but the Help pages' bar stands (terms audit 29.9; ruling 30.9 16(d) D2(v))
  fail  health-data-hub.fr  1: health-data-hub.fr is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  ijcai.org  1: ijcai.org is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  k12-ai-infrastructure.org  1: k12-ai-infrastructure.org is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  learn2design2026.com  1: learn2design2026.com is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  microblink.com  1: microblink.com is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  opensky-network.org  1: opensky-network.org is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))
  fail  pasteurlabs.ai  1: pasteurlabs.ai is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  situatedevals.org  1: situatedevals.org is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  solafune.com  1: solafune.com is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  sophelio.io  1: sophelio.io is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  theemailgame.com  1: theemailgame.com is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  thinkonward.com  1: thinkonward.com is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))
  fail  virtualembryo.ai  1: virtualembryo.ai is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))
  fail  xiuwenz2.github.io  1: xiuwenz2.github.io is CONDITIONAL_UNMET in research/channel-loop/terms-verdicts.json
  pass  prize-fomo26-github-io-ref-mlcontests-414a9746  fomo26.github.io CONDITIONAL_MET
  pass  prize-build-arena-github-io-constructionchallenge-81a99e01  build-arena.github.io CONDITIONAL_MET
  pass  prize-github-com-build-arena-buildarena-2-0-4d396616  github.com CONDITIONAL_MET
  pass  prize-openreview-net-forum-id-qaqkmip3sz-8896ce96  openreview.net NOT_BARRED
  pass  prize-roco-spring-github-io-ref-mlcontests-f530008a  roco-spring.github.io CONDITIONAL_MET
  pass  prize-szczurek-lab-github-io-amp-challenge-website-ref-084ef537  szczurek-lab.github.io CONDITIONAL_MET
  pass  prize-robosyn-bench-net-ref-mlcontests-09bc8571  robosyn-bench.net CONDITIONAL_MET
  pass  prize-github-com-edem-ai-robosynchallenge-e073c108  github.com CONDITIONAL_MET
  pass  prize-fair-universe-lbl-gov-ref-mlcontests-0704eef5  lbl.gov CONDITIONAL_MET
  pass  prize-aimo-interp-github-io-ref-mlcontests-8a0c1de0  aimo-interp.github.io CONDITIONAL_MET
  pass  prize-realpdecompetition-github-io-ref-mlcontests-6315ee04  realpdecompetition.github.io CONDITIONAL_MET
  pass  prize-neural-interfaces26-github-io-041981fb  neural-interfaces26.github.io CONDITIONAL_MET
```

- חיפוש `grep -riE` של שם הבעלים (התבנית שבתדריך; היא עצמה לא נכתבת כאן, כדי שהקובץ הזה יחזיר 0) על כל קובץ שנוסף או שונה: 0 התאמות; חיפוש כתובות דוא"ל בתוכן החדש: 0.

## 7. עבודה ידנית שחזרה על עצמה וכדאי להפוך לאוטומטית
- **העברת משפט תבנית לקבצים המחויבים:** כששינוי בטקסט של `ai-allowed-events.ts` צריך להגיע ל-md ול-urls.txt לפני יום רביעי, כתבתי סקריפט חד-פעמי שמחליף רק את שורות ה-preamble בפלט של `buildAiAllowedTable`. מצב `--preamble-only` ב-`scripts/prize-intake.ts` (בלי רשת: רק הכותרות, בלי טבלה) היה הופך את זה לפקודה אחת; הבדיקה החדשה כבר תופסת סטייה.
- **תוכנית מוטציות:** תוכנית ה-JSON נכתבה ביד בפעם המי-יודע-כמה; אפשר לשמור תוכניות ליד הבדיקות (למשל `src/__tests__/revenue/mutations/*.json`) כדי שסבב סקירה יריץ אותן שוב.
- **ניקוי scratch בשמות, לעולם לא בתבנית:** תיקיית scratch משותפת לכמה סוכנים; ניקוי צריך לרשום מראש כל קובץ שהסוכן יוצר (או לעבוד בתת-תיקייה פרטית משלו) ולמחוק רק את הרשימה. כדאי שכל תדריך ל-worktree ייתן לסוכן תת-תיקיית scratch משלו.

## 8. על מה בוזבזו אסימונים, לפי פעולה
- קריאת ההקשר (queue-zero-test.mjs המלא, החלקים של render-watch.mjs ו-robots-verdict.mjs, סעיף הביקורת וקטעי CHANNEL_LOOP): כ-35 אלף — רובו הכרחי; הקריאה המלאה של queue-zero-test.mjs (560 שורות) הייתה גדולה מהנדרש.
- פלט הסיכום המלא של הריצה האמיתית (34 שורות ארוכות) הודפס פעמיים: כ-6 אלף.
- סבב המוטציות הראשון עם שלושת ה-"killed?" ופלט ה-tail שלהם: כ-3 אלף שהיו נחסכים לו הבדיקה לא הייתה מחשבת בזמן איסוף.
- רשימת המשימות של ה-thread הראשי שהוצגה שוב ושוב בתזכורות: כ-15 אלף שלא היו בשליטתי.

## 9. תיקוני הסקירה (סבב התיקון אחרי הסקירה של הענף)
הסקירה מצאה ממצא חוסם אחד (תהליך, לא קוד), ארבעה "fix" וארבע הערות. כל ממצא שוחזר קודם (פקודה ופלט), והקוד תוקן בבדיקה-קודם. קומיט התיקון: `c5bde7b`; היומן הזה בקומיט שאחריו.

### ממצא אחר ממצא
1. **חוסם — מחיקת קבצי העבודה של ה-thread הראשי** (סעיף 5): אירוע תהליך, לא פגם בקוד, ולא ניתן לתקן אותו כאן: תוכן הקבצים (סקריפט הדירוג, תיקיות הקריאה, גופי השיגור) לא ידוע לי ואין להם עותק, ובנייתם מחדש היא של ה-thread הראשי. מה שבדקתי: `node scripts/prize-dispatch.mjs` על ה-HEAD של הענף מדפיס את 12 השורות (יציאה 0), כך שאת `dispatch-urls.txt` אפשר לבנות מחדש בפקודה אחת. לא כתבתי שום קובץ לתיקייה המשותפת `scratchpad/tick47/`: ה-scratch שלי היה בתת-תיקייה פרטית משלו ונמחק בסוף בשמו.
2. **fix — מספרי השורות בדחייה של `parseUrlList`: תוקן.** שחזור: רשימה עם slug כפול בשורות 5 ו-8 של הקלט (שלוש הערות ושורה ריקה לפניהן, שתי שורות נכשלות ביניהן) הודפסה כ-`urls.txt line 2: slug "prize-dup" is already used on line 1` (יציאה 1, stdout ריק) — שורות של טקסט הפלט, לא של הקובץ. התיקון: הפרסור החוזר עטוף ב-try/catch, וכל `line N` בהודעה ממופה ל-`passed[N - 1].lineNumber` (`lines` ו-`passed` מקבילים); ההודעה נפתחת ב-"render-watch's parser refuses the output:". עכשיו: `line 8: slug "prize-dup" is already used on line 5`. בדיקות: בפונקציה (כפילות 5/8, ושורת tiktok.com בשורה 4 של הקלט) וב-CLI (כפילות בשורות 4/6).
3. **fix — ה-CLI כש-`--skip-captured` מדלג על כל השורות העוברות: נבדק.** ההתנהגות הייתה נכונה (יציאה 3, stdout ריק) אבל לא נבדקה, ומוטנט R3 (יציאה 0 ושורה ריקה ב-stdout — שיגור ריק ל-render-watch) שרד. נוספה בדיקת CLI: `<slug>.meta.json` לכל ארבע השורות העוברות → יציאה 3, stdout ריק, השורה הראשונה "4 pass the terms gate (3 site(s)), 6 fail", ו-"every passing line is already captured". R3 נהרג.
4. **fix — פיצול שדות על כל רווח: נבדק.** כל שורות הפיקסצ'ר היו מופרדות ב-TAB, ו-R2 (הדפסת השורה הגולמית) ו-R6 (פיצול על TAB בלבד) שרדו. ב-`LIST` שורה אחת מופרדת עכשיו ב-" \t " ואחת ברווחים בלבד, והפלט הצפוי (`PASSING`) נשאר `URL<TAB>slug`; נוספה גם בדיקה ייעודית לשלוש צורות ההפרדה. שניהם נהרגו.
5. **fix — שני המשפטים הישנים מחוץ להיקף: נדחה בענף הזה.** `scripts/prize-intake.ts:14-15` ("to paste into render-watch.yml's `urls` input") ו-`describeAiAllowed` ב-`src/revenue/ai-allowed-events.ts:909` (עם הליטרל ב-`prize-intake-rules.test.ts:825`) לא שונו. הסיבה: ה-spec של הסבב קובע "Scope limit: nothing else … If something outside this scope is wrong, write it in the log's section 4 and leave it", וההצעה של הממצא עצמו היא "Next tick, main thread". הם רשומים בסעיף 4 ונשארים לסבב הבא.
6. **הערה — `meta.json` של רינדור שנכשל נחשב "צולם": לא שונה.** זו החלטת עיצוב וה-spec מגדיר צילום כקיום `<slug>.meta.json`. שאלה פתוחה ל-thread הראשי: האם meta עם `error` לא ריק צריך להיחשב לא-מצולם, ולהופיע ב-stderr בנפרד.
7. **הערה — קובץ `--verdicts` בלי `sites`: תוקן** (זול, ובתוך ההיקף — הסקריפט עצמו). שחזור: `--verdicts package.json` → יציאה 3 ו-"has no verdict" לכל 101 השורות, אבחנה מטעה. עכשיו: יציאה 1, stdout ריק, `--verdicts package.json has no "sites" object (the shape of research/channel-loop/terms-verdicts.json)`; גם `sites: []` נדחה. `sites: {}` נשאר תקין (יציאה 3, כמו קודם).
8. **הערה — שתי הערות שמזכירות שורה אחת של רשימה שבועית: תוקן.** בראש הסקריפט ובראש קובץ הבדיקה: "a line on a barred host (sites.google.com today)".
9. **הערה — R1, ספירת ה-pass ב-stderr כשיש דילוגים: תוקן.** בדיקת `describeSelection` עם דילוג בודקת עכשיו את השורה הראשונה ("4 pass the terms gate (3 site(s)), 6 fail") ואת שורת הסיום המדויקת ("every passing line is already captured: nothing to dispatch", ולא "nothing passes"). R1 נהרג.

### בדיקות ופעולות ולידציה
- אדום קודם: `npx vitest run src/__tests__/revenue/prize-dispatch.test.ts` אחרי הוספת הבדיקות ולפני תיקון הקוד — יציאה 1, 3 נכשלו מתוך 29 (מספרי השורות בפונקציה, מספרי השורות ב-CLI, צורת קובץ ה-verdicts). לבדיקות שסוגרות פער (ממצאים 3, 4, 9) האדום הוא המוטנט: על `6ac28bf`, `node scripts/mutate.mjs --plan <plan.json>` עם R1, R2, R3, R6 — יציאה 1, 4 survived.
- אחרי התיקון: אותה בדיקה 29/29, יציאה 0.
- `VERIFY_OUT=<scratch>/verify scripts/verify.sh src/__tests__/revenue/prize-dispatch.test.ts src/__tests__/revenue/queue-zero-test.test.ts src/__tests__/revenue/prize-intake.test.ts src/__tests__/revenue/prize-intake-rules.test.ts src/__tests__/revenue/prize-intake-workflow.test.ts src/__tests__/revenue/prize-terms-audit.test.ts` — typecheck יציאה 0, vitest יציאה 0, 6 קבצים, 178/178; verify יציאה 0, על `c5bde7b` ושוב על העץ של קומיט היומן (שבו גם יישור שורות של הערת הראש בקובץ הבדיקה, הערה בלבד).
- מוטציות על `c5bde7b`: `node scripts/mutate.mjs --plan <plan.json>` עם הבדיקה `prize-dispatch.test.ts` — 28 הוחלו, 28 killed, 0 survived, יציאה 0:

| קבוצה | מוטציות | תוצאה |
|---|---|---|
| 13 של הבונה | drop-reparse (מכוון מחדש: `parseUrlList(...)` בתוך ה-try → `void 0;`), invert-gate, print-failing, cli-ignore-skip, fn-ignore-skip, accept-third-field, accept-no-slug, exit-0-when-empty, sort-ascending, summary-on-stdout, comments-not-skipped, capture-by-txt, why-ignored | 13 killed |
| 10 של הסוקר (B1-B3 הן שלוש של הבונה) | R1 ספירת pass בלי הדילוגים; R2 `lines.push(t)`; R3 יציאה 0 כשהכול צולם; R4 בלי שובר השוויון בשם; R5 ספירת אתרים לפי slug; R6 פיצול על TAB בלבד; R7 פרסור שורה-שורה (מאבד כפילויות); R8 משפט התבנית ב-`ai-allowed-events.ts`; R9 שדה שלישי `js` מותר; R10 `--rendered` מתעלמים ממנו | 10 killed |
| 5 חדשות, על הקוד שנוסף | N1 בלי מיפוי השורות; N2 off-by-one (`passed[Number(n)]`); N3 בלי בדיקת הצורה של ה-verdicts; N4 מערך `sites` מותר; N5 הדחייה נבלעת (`void new Error`) | 5 killed |

- ריצה על הקבצים האמיתיים אחרי התיקון: `node scripts/prize-dispatch.mjs` — יציאה 0, **12 שורות** ב-stdout, בכל אחת TAB אחד בדיוק, כולל `https://fair-universe.lbl.gov/?ref=mlcontests`; שורת ה-stderr הראשונה זהה לזו שבסעיף 6 ("12 pass the terms gate (11 site(s)), 89 fail"). `--skip-captured`: יציאה 3, stdout ריק, "skipped 12".
- חיפוש `grep -riE` של שם הבעלים (התבנית שבתדריך) על כל קובץ ששונה: 0; כתובות דוא"ל בתוכן החדש: 0.

### עבודה שחזרה על עצמה / אסימונים
- **תוכניות מוטציה נכתבו שוב ביד** — של הבונה, של הסוקר, ועכשיו מאוחדות: 28 שורות JSON. זה מחזק את ההצעה בסעיף 7 לשמור תוכניות ליד הבדיקות, כדי שסבב תיקון יריץ את אותה תוכנית במקום להעתיק find/replace מתוך דוחות.
- **אסימונים:** קריאת הסקריפט, קובץ הבדיקה והיומן במלואם (כ-25 אלף) — הכרחית; פלט ה-tail של `mutate.mjs` לכל מוטנט נקרא רק דרך סינון שורות הסיכום.
