# Brief for the Fable sitting of 5.10.2026 (~07:11 UTC): FABLE_QUEUE rows 19 and 20

**What this is.** Opus clerks gathered the evidence and point to it here: two facets for row 19 (the law texts: reg 6א,
regs 1(2) and 13(1) of the registration regulations, reg 22(2), ruling (a) and MISSION; and the colony lines: step 2
today, the lines the row names, and what the texts read onto each) and one for row 20 (the refund-retry state and the
token that commits it). Opus checkers then re-opened every pointer with `sed -n` or `grep -n -F` against the tree at
`e2b249c` and corrected what had moved or overreached. The clerks were briefed at `dc82873`; `git diff --stat dc82873
e2b249c` shows one file, `logs/CHANNEL_LOOP.md`, with one line replaced in place at `:387` (the tick-41 line), and no
cited line moved. An Opus assembler wrote this file on `e2b249c` (`claude/new-session-j071dx`) [asm: its worktree opened
on `3edd377`, the PR #42 merge of `dc82873`, and was reset onto the branch tip so that it reads the tree the checkers
read]. It re-opened every header pointer and a sample of the rest, and marks what it added or corrected **[asm]**.
Nobody here rules or recommends. No web fetch was made for this brief; the one look at the `lawsofisrael` clone was
`git verify-pack -v`, which is read-only.

**Grades.** `rendered`: a render-watch capture that a session read. `github`: code or docs read on GitHub; where a note
quotes GitHub, the note is the pointer ("github, via note"). `rendered via note`: a note quoting a capture; the note's
line is the pointer and the capture was not re-opened unless said. `snippet`: a search-engine snippet. `repo`: our own
code or notes. `inference`: reasoning, not a text, always marked. `none`: no source.

**Provenance marks.**
- `[no-terms]` marks every nevo.co.il law page. D1(2): "A capture marked `[no-terms]` (the 10 nevo law pages) is
  **unrestricted**: there was no bar to fetch against." (`research/channel-loop/RULING-2026-09-30-video.md:32`) [asm:
  the 1.10 brief cited `:31`, which held D1(1)'s last line at its tree `e6c7a2f` as it does now]. Nevo's robots.txt,
  and full copies in a public repo, are row 21's questions at the 6.10 sitting (`logs/CHANNEL_LOOP.md:26`), not this
  sitting's.
- `[against-bar]` marks every gumroad.com capture (D1(1), `RULING-2026-09-30-video.md:27-31`): readable and citable at
  rendered grade for "(i) a question about our own compliance" and "(ii) a decision not to do something", and not "an
  input to a product, a listing, content, a ranking or a line's growth" (`:29-31`). This brief cites one, through the
  documents ruling (A(e), Pro).
- `[pre-bar]` [asm] marks an indiebook.co.il or teachsimple.com capture. Both sites are `BARRED`
  (`research/channel-loop/terms-verdicts.json:181-185`, `:393-397`). Their bars sit at `scripts/render-watch.mjs:422`
  (indiebook.co.il) and `:421` (teachsimple.com); `git log -S` gives `52dafb4` (29.9 14:01:49Z) for both. The nine
  Indiebook and Teach Simple captures on disk carry fetchedAt 29.9 11:29:10Z to 11:30:43Z, all before the bar [asm: the
  checker gave 11:29:11-11:30:36Z, the span of the ones it opened]. D1 names neither site; D3 says of both "**Not C1
  bars**" (`RULING-2026-09-30-video.md:128-129`). Marking them `[against-bar]` would be inference, and this brief does
  not. [asm] The text files of the Indiebook terms and the Teach Simple licence agreement were last committed on 28.9
  (`bfbafea` 18:36Z, `d6fffe6` 22:00Z); the 29.9 render commit `f9a41c6` changed only their metas.
- **Frozen copies.** The VAT law has one: `nevo-vat-law-2026-09-29` (manifest entry `FROZEN.sha256:121`), whose sha256
  equals the live capture's (`a8b0c841…`). The manifest has no entry for any Indiebook or Teach Simple capture, for the
  registration regulations, for the books instructions or [asm] for Gumroad's terms. A capture is cited here by line only
  from its frozen copy; an unfrozen one is cited through the note line that quotes it, or by a `grep -F` count with no
  line.
- **The mirror.** `GEN`, `MREG` and `VAT` are blobs of the `lawsofisrael` mirror at `aeca0b25`. A checker's local clone
  holds 32 objects in two packs (31 + 1) and no loose objects; none starts `3fe7b5f954f3`, `0767e5840e59` or
  `e20977680182`. So every GEN, MREG and VAT line below is "github, via note", and no checker re-opened one.
- **"The 29.9 registration capture."** `R-REG` was fetched 2026-09-29T13:02:22Z (meta fetchedAt) and carries the stamp
  "נוסח עדכני נכון ליום: 10-12-2024" (`research/measurements/osek-patur-documents.md:888`). A clerk called it "the 2024
  capture" and another "the 2026 rendering"; it is neither.

**Short names.** "The note" is `research/measurements/osek-patur-documents.md`; `OP` is the same file as the documents
ruling cites it. The note's keys resolve in its own tables: `GEN` (the general VAT regulations, nevo 271_005), `MREG`
(the registration regulations, nevo 271_004) and `VAT` (the VAT law), all 2023 mirror texts, at
`osek-patur-documents.md:1212-1214`; `R-REG` (the 29.9 registration capture) at `:888`; `R-BK` (the books instructions
capture) at `:207`; `R-VAT` (the VAT-law capture) at `:884`. `RULING` is
`research/channel-loop/RULING-2026-09-30-documents.md`; `VIDEO-RULING` is
`research/channel-loop/RULING-2026-09-30-video.md`; `KIDS-RULING` is `research/channel-loop/RULING-2026-10-04-kids-youtube.md`.
`OWNER_STEPS.he.md` is `docs/OWNER_STEPS.he.md`; `owner-steps.ts`, `portfolio.ts`, `experiments.ts` and `types.ts` are
under `src/revenue/`. `indiebook.md`, `teacher-and-ebook-stores.md`, `refund-law-il.md`, `gumroad-native-licenses.md` and
`gumroad-license-decision.md` are under `research/measurements/`. In Part B, `brand_mail.py` is `scripts/brand_mail.py`;
`brand-mail.yml`, `colony.yml` and `gumroad-pro-product.yml` are under `.github/workflows/`; `gumroad-pro-product.js` is
`products/il-biz-tools/scripts/gumroad-pro-product.js`; "the fold log" is `logs/2026-09-30-documents-fold-4-5-7.md` and
"the fixes log" is `logs/2026-09-30-documents-fold-4-5-7-fixes.md`.

**Who reads what.** The row-19 decider reads Parts A and C. The row-20 decider reads Parts B and C. Both read the header
blocks: this one, the standing rules and the links.
- The seats: each row is "one decider (5.10 ~07:11, beside row 20 [row 19]; moved from 2.10 on 4.10: the weekly usage
  limit took the 1.10-3.10 sittings)" (`logs/FABLE_QUEUE.md:43`, `:44`). The schedule is at `logs/CHANNEL_LOOP.md:26`.
  This brief is tick 41's one build (`:387`).
- The outputs: both write "a ruling in `research/channel-loop/`". Row 19 folds "into `CHANNEL_LOOP.md` §4 rows 22 and 28
  and §6, `docs/OWNER_STEPS.he.md` step 2" (`FABLE_QUEUE.md:43`). Row 20 folds "into `scripts/brand_mail.py`,
  `.github/workflows/brand-mail.yml`, `CHANNEL_LOOP.md` §4 (Pro)" (`:44`). Pro's row is in §3, "Channel table"
  (`CHANNEL_LOOP.md:117`; the il-biz-tools row at `:134`); §4 is "Ranked queue (candidates not yet channels)" (`:142`).
- Row 20's status: "queued 30.9 (tick 26); `enable` waits on it" (`FABLE_QUEUE.md:44`).

**Standing rules (repo).**
- **MISSION first.** `MISSION.md` is read before anything else (`CLAUDE.md:4`). The owner's brief, verbatim: "בדרכים אני
  לא רוצה ולא אצטרך לעשות כלום — זה רק אתה." (`MISSION.md:11`) and "אני לא מדבר עם אנשים. יש לך את כל האישורים. אני רוצה
  דרכים בלי שאני צריך אישור של עורך דין" (`:12`).
- **The sitting.** At most 2 agents (`CHANNEL_LOOP.md:51`).
- **The owner's involvement (rule 1).** "A small number of one-time identity and payout steps are legally unavoidable.
  Everything else is ours." (`MISSION.md:432-433`) [asm: a checker gave `:432-434`; `:434` is blank]. "Batch every
  unavoidable step into **one ordered checklist**" (`:435`); "Never invent a step that isn't required." (`:436`);
  "**Never** open an account in the owner's name, answer an identity check, or mark setup done on our own initiative."
  (`:437-438`); "The owner does not talk to customers. Any line that needs them to is not a line." (`:440`). "The owner
  does nothing: no selling, no talking, no camera, no manual ops." (`:211`).
- **₪0 and costs.** "The ceiling in `src/revenue/budget.ts` is ₪0 … **Nothing is bought.**" (`:352-354`). "**No step that
  costs the owner anything is asked for until its cost is checked** from the official source. Step 2 (tax file and
  Bituach Leumi) is asked only when a paid product is ready." (`:356-358`). The standing consent "does not reach the
  owner's own clicks: identity, payout, and anything bought." (`:349-350`).
- **Honest value (rule 4).** "No spam, no scams, no fake reviews, no manipulation, no ToS violations, nothing that
  deceives a buyer." (`:455-456`); "Selling a feature that does not exist, or charging for something already free, is a
  violation" (`:457-458`).
- **The owner's name.** "**Nothing we publish carries the owner's name, username, or personal identifiers.**" (`:276`);
  "the brand is the only public face, and where the law requires a name, it is never volunteered beyond what the law
  requires." (`:310-311`). Both speak of the owner, not of buyers.
- **Never** (`CHANNEL_LOOP.md:74-86`): an account farm (`:76`); "a per-item owner action" (`:77`); "an account opened in
  the owner's name" (`:78`); "a fetch of any tiktok.com or gumroad.com page, or of a site whose terms are unread or
  refused" (`:79`); "a subscription or any spend beyond the one-off ₪200" (`:80`).
- **Caps** (`CHANNEL_LOOP.md:106-111`): built-but-unlaunched 6/6, binding, il-biz-tools among them (`:108`); experiments
  measuring 1/3; builds in flight 0/1 (`:110`). ₪0 tests, counters and scans stay outside the cap (`:115`).

**Links between the two rows. Read these before ruling.**
1. **One sitting, two agents.** The cap is 2 (`CHANNEL_LOOP.md:51`); rows 19 and 20 sit together (`:26`).
2. **[asm] il-biz-tools Pro sits under both.** Step 2's data names its lines `["apify-actors", "il-biz-tools",
   "oss-bounties", "pcn874"]` (`owner-steps.ts:291`, repo). Step 3 says no paid product, Pro included, goes on sale before
   step 2: "**שום מוצר בתשלום — גם לא מוצר ה-Pro — לא עולה שם למכירה לפני צעד 2.**" (`OWNER_STEPS.he.md:186-188`, repo).
   Row 20 says "Nothing is exposed before the first sale, and a sale needs `enable`" (`FABLE_QUEUE.md:44`). [inference]
   Row 20's first exposure therefore also waits on step 2, the step whose wording row 19's ruling may change. The
   documents ruling reads Pro as "a right, not information" and "not a service" (`RULING:157`, `:164-165`) for consumer
   law; whether that reading reaches VAT reg 6א or reg 13 is in no file (Part C, row 19, item 12).
3. **The repo is public.** Row 20's (a) rests on it. Whether it stays public is the owner's decision, still open
   (`CHANNEL_LOOP.md:239-241`); row 19 does not touch it.

---

## Part A — Row 19, reg 6א against the writing and teaching lines (`FABLE_QUEUE.md:43`)

**The row's inputs, verbatim** (`FABLE_QUEUE.md:43`): "`research/measurements/osek-patur-documents.md` "30.9 (tick 26,
github)" §2 and §4 (the general VAT regulations' reg 6א, GEN:706-722; the registration regulations' reg 1(2), MREG:101,
and reg 13(1), MREG:316; reg 22(2), GEN:2372-2375; all from the 2023 `lawsofisrael` mirror, github grade);
`research/channel-loop/RULING-2026-09-30-documents.md` (a) (reg 13's title list only; reg 6א was unread when it ruled)".

**The row's questions, verbatim** (`FABLE_QUEUE.md:43`): "Reg 13(1)'s second limb registers as עוסק מורשה "עוסקים
שעיסוקם מתן שירותים מהסוגים המפורטים בתקנה 6א … ולגבי אותם שירותים בלבד"; reg 6א(1) lists writing or editing,
lecturing, teaching, training, translation. Does it reach any colony line (Indiebook's ebook royalties, row 22; Teach
Simple's teacher materials, row 28; the parent guides), and if so: is that line's income then registered עוסק מורשה for
that service (changing step 2 and the line's documents), restructured, or killed? Confirm or correct the step-2 line
built on reg 22(2) (the exempt dealer files no periodic report, by inference through §31(3))."

### A(0) Step 2 today, which the fold would change

- **Where it is.** The heading "## צעד 2 — פתיחת תיק עוסק פטור + רישום בביטוח לאומי" (`OWNER_STEPS.he.md:132`); the data
  title at `owner-steps.ts:287`. Step 2 runs `:132-179`, with `---` at `:180`; the data object is `owner-steps.ts:283-304`,
  its text at `:290` (repo).
- **The occupation line** (`OWNER_STEPS.he.md:150`, as ruled at `RULING:87-90`): "**פיתוח והפעלה של כלים דיגיטליים
  ותוכנה ומכירת רישיונות לשימוש בהם באינטרנט; תמלוגים וחלוקת הכנסות מפלטפורמות מקוונות.**" It names no writing,
  editing, lecturing, teaching, training or translation. It does name "תמלוגים וחלוקת הכנסות מפלטפורמות מקוונות". The
  same line: "המשרד קובע את הסיווג. אם האישור אומר 'עוסק מורשה' — לכתוב לי את המילה הזאת עם 'צעד 2 בוצע'; אז המסמכים
  והדיווח משתנים ואני אומר לך מה" (repo).
- **The periodic-report clause** (`OWNER_STEPS.he.md:160`): "הפטור מדיווח תקופתי הוא תק' 22(2) לתקנות מע"מ הכלליות (נוסח
  2023 שנקרא ב-GitHub), והיא חלה על עוסק פטור בהסקה דרך §31(3)". Its English twin: "The exemption from periodic reports
  is reg 22(2) of the general VAT regulations (a 2023 text read on GitHub), which reaches the exempt dealer by inference
  through §31(3)." (`owner-steps.ts:290`, repo).
- **The tests pin both.** The Hebrew `toContain` is at `src/__tests__/revenue/owner-steps.test.ts:824-826` (the string at
  `:825`), the English at `:836-838` (the string at `:837`). Asserted absent: "דיווח **פעם בשנה**" (`:819`), the old
  clause "יושב בתקנות הכלליות שעוד לא נקראו" (`:827`) and "general VAT regulations, still unread" (`:839`) (repo).
- **How the clause got there.** Commit `d00bc66` (2026-09-30 09:02:10Z) replaced fold action (c)'s wording "הפטור
  מדיווח תקופתי יושב בתקנות הכלליות שעוד לא נקראו" (`RULING:338-339`). Its message: "Step 2's periodic-report clause now
  cites reg 22(2) of the general VAT regulations, read from the 2023 mirror, by inference through §31(3)." Row 19 is the
  queued check of that wording. The change is recorded at `logs/2026-09-30-channel-loop-tick-26.md:44`, under the bullet
  "קורא ומאמת על המראה lawsofisrael" (`:42`), and at `logs/CHECKPOINT.md:247`. The tick-26 log marks only reg 6א as
  inference (`:82`; and `:45`: "עלולות לגעת בקווים של כתיבה והוראה"); it never marks reg 22(2) that way (repo).
- **The ceiling and the switch.** "**₪122,833 בשנה**" (`OWNER_STEPS.he.md:160-161`), with the caveat "הנתון ל-2026 כפי
  שמופיע במקורות שלנו; אף עמוד ממשלתי לא נפתח מכאן" (`:161`); "יהיה צורך במעבר לעוסק מורשה. החלטה של אז." (`:171-172`).
  The two things the law attaches to the status, "לידיעה", are the annual declaration (reg 15) and the one-time
  registered-mail notice (`:162`). After step 2 the company issues its own payout documents (`:167-169`) (repo).
- **"החלטה שלך, לא צעד."** The old accountant conversation is not a step; "ברירת המחדל בלעדיה: לדווח על הכול כהכנסה
  חייבת, בלי אפס-מע"מ." (`OWNER_STEPS.he.md:176-177`; `owner-steps.ts:303`) (repo).
- **The lines step 2 names.** `lines: ["apify-actors", "il-biz-tools", "oss-bounties", "pcn874"]` (`owner-steps.ts:291`).
  `grep -i "indiebook|teach"` finds nothing in `portfolio.ts`, `experiments.ts` or `owner-steps.ts`. Indiebook and Teach
  Simple are §4 candidates, not portfolio lines (repo).
- **§6 item 5, a fold target, is stale against step 2.** It reads '"אונליין" and "פעם בשנה" are marked unverified.'
  (`CHANNEL_LOOP.md:234`) and does not mention reg 22(2). `OWNER_STEPS.he.md` has 0 hits for "פעם בשנה" (repo). The same
  item (`CHANNEL_LOOP.md:224-234`) records "**Answered 28.9: the owner is not salaried.**" (`:225`). That covers salary
  only, not "גימלה או קיצבה".
- **Neither fold-target row in §4 mentions reg 6א or reg 13:** row 22 (`CHANNEL_LOOP.md:166`) and row 28 (`:172`).
  `grep -F "6א"` in `CHANNEL_LOOP.md` hits only `:26` (the schedule: "reg 6א against the writing and teaching lines") and
  `:387` (repo).
- **A PDF twin exists**, `docs/OWNER_STEPS.he.pdf` (repo). No checker opened it.

### A(a) Reg 6א, as the note holds it (GEN, github via note)

- **The heading** "חיוב מקבל שירות בתשלום המס" (GEN:707): `osek-patur-documents.md:1317`.
- **The chapeau, verbatim** (GEN:706; `osek-patur-documents.md:1318`): "6א. (א) עוסק, מלכ"ר או מוסד כספי שקיבלו שירות מן
  המפורטים להלן ממי שעיקר הכנסתו ממשכורת, גימלה או קיצבה, יהיו חייבים בתשלום המס בשל השירות, זולת אם קיבלו חשבונית מס
  מנותן השירות. ואלה השירותים:"
- **Item (1)** (GEN:710; `osek-patur-documents.md:1319`): "מופע אמנותי, … הרצאה, הוראה, הדרכה, תרגול … ; כתבנות או
  קצרנות; תרגום בכתב או בעל פה; כתיבה או עריכה; פישור, … או חברות בועדות שהוקמו על פי דין;"
- **Item (2)** (GEN:713; `osek-patur-documents.md:1320`): "שירותים של בעלי מקצועות אלה: אגרונום, אדריכל, הנדסאי, …
  טכנאי, … מהנדס, … סוכן ביטוח, …". The note's two quotes carry seven elisions in all (`:1319-1320`), and the elided
  spans are held nowhere.
- **(ד) and (ו), paraphrased only.** "The recipient reports and self-invoices under (ד) (GEN:716). The provider files only
  if it has other transactions, under (ו) (GEN:722)." (`osek-patur-documents.md:1321`); no Hebrew is quoted.
- **Dating.** The latest margin note is "תק' (מס' 5) תשנ"ז-1997" (GEN:711-712); the history's last entry is "ק"ת תשנ"ז
  מס' 5855 מיום 1.10.1997" (GEN:797-799) (`osek-patur-documents.md:1322`).
- **The note's three [inference] limits** (`osek-patur-documents.md:1323-1326`): reg 6א reaches a provider only "ממי
  שעיקר הכנסתו ממשכורת, גימלה או קיצבה", which "is the owner's fact, not the colony's"; the recipient must be "עוסק,
  מלכ"ר או מוסד כספי", and "Whether a foreign platform is one is not settled by this text"; "Software development and
  licence sales are not named. The nearest items are "כתיבה או עריכה" and "הרצאה, הוראה, הדרכה"."
- **Translation.** 6א(1) lists "תרגום בכתב או בעל פה" (`osek-patur-documents.md:1319`, github via note), and reg 13(1)'s
  titles include "מתורגמן" (`R-REG:135` via `osek-patur-documents.md:967`, rendered via note, `[no-terms]`).
- **Reg 15א(ה) of the registration regulations names 6א(א)(2).** The note, in English: "Services in the professions of
  reg 6א(א)(2) of the general regulations get neither relief (`R-REG:184`)" (`osek-patur-documents.md:901`, rendered via
  note, `[no-terms]`). The Hebrew is not in the note. It is in the unfrozen 29.9 registration capture (`grep -F`, 1 hit;
  no line given): "(ה) תקנות משנה (ג) ו-(ד) לא יחולו אם עסקת האקראי היא מתן שירות בתחום המקצועות המפורטים בתקנה 6א(א)(2)
  לתקנות מס ערך מוסף, תשל"ו-1976." [asm] Its mirror twin is at MREG:414 (`osek-patur-documents.md:1380`, github via
  note), with no wording given.
- **The books instructions cite reg 6א** (`R-BK:1398`; `osek-patur-documents.md:701-702`, rendered via note,
  `[no-terms]`). The §2(א) text is in the unfrozen books-instructions capture (`grep -F`; no line given). The exclusion
  covers income "שנתקיימו לגביה כל אלה", all three together:
  - "(1) נוכה ממנה מס במקור בשיעור שאינו נמוך מ-40%, או, באישור פקיד השומה - בשיעור שאינו נמוך מ-30%;"
  - "(2) הוא לא תבע בניכוי, לפי סעיף 17 לפקודה, הוצאות שהוצאו ביצורה;"
  - [asm, quoted from the same capture] "(3) ההכנסה היא ממתן שירותים וחובת תשלום מס ערך מוסף חלה על מקבל השירותים שמכח
    תקנה 6א לתקנות מס ערך מוסף, תשל"ו-1976."
  - "שנתקיימו לגביה כל אלה" occurs 3 times in that capture, in current and history blocks, and grep does not show which is
    current. [asm] The second and third sit after history entries dated 1.1.1990 and 9.6.1995, and both also except
    "עוסק זעיר שסעיף 31(3) לחוק מס ערך מוסף, התשל"ו-1976, חל עליו"; the first does not. Rendered, `[no-terms]`, unfrozen.

### A(b) Reg 1(2) and reg 13(1) (MREG, github via note; `R-REG`, rendered via note, `[no-terms]`)

- **Reg 1(2).** "MREG reg 1(2) excludes from "חייב במס" a person all of whose tax is paid by the recipient under 6א
  (MREG:101)" (`osek-patur-documents.md:1328`); reg 1's four exclusions are MREG:97-103 (`osek-patur-documents.md:1372`).
  The 29.9 capture's version is at `R-REG:12` (`osek-patur-documents.md:912`, in English). [asm, quoted from the unfrozen
  capture; `grep -F`, 1 hit] "(2) מי שהמס בשל כל עסקאותיו משתלם על ידי מקבל השירות לפי תקנה 6א לתקנות מס ערך מוסף,
  התשל"ו-1976 (בתקנה זו – תקנות הביצוע);"
- **Reg 13, the 29.9 capture.** The heading "רישום כעוסק מורשה" is at `R-REG:132` and the chapeau at `R-REG:133`
  (`osek-patur-documents.md:966`): "13. עוסק הנמנה על אחת מהקבוצות המנויות להלן ירשום אותו המנהל כעוסק מורשה גם אם על פי
  סכום מחזור עסקותיו או מספר המועסקים בעסק הוא היה נחשב כעוסק זעיר:"
- **13(1), all titles** (`R-REG:135` via `osek-patur-documents.md:967`): "(1) בעל מקצוע חפשי שהוא: אגרונום, אדריכל,
  הנדסאי, חוקר פרטי, טוען רבני, טכנאי, טכנאי שיניים, יועץ לארגון, יועץ לניהול, יועץ מדעי, יועץ מס, כלכלן, מהנדס, מודד,
  מנהל חשבונות, מתורגמן, סוכן ביטוח, עורך דין, רואה חשבון או שמאי, בעל מעבדה כימית או רפואית וכן עוסקים שעיסוקם מתן
  שירותים מהסוגים המפורטים בתקנה 6א לתקנות מס ערך מוסף, תשל"ו- 1976, ולגבי אותם שירותים בלבד;" The "…" in a clerk's
  shorter quote was the clerk's own.
- **The mirror's 13(1)** (MREG:316) is quoted with an elision at `osek-patur-documents.md:1329`. It differs from
  `R-REG:135` in three ways (no "סוכן ביטוח"; ";" before "וכן"; "תשל"ו-1976" without the space), and the mirror's history
  has "סוכן ביטוח" in the 23.4.1976 and 1.10.1976 wordings (MREG:340, :345) (`osek-patur-documents.md:1376-1377`).
- **The note's reading [inference]** (`osek-patur-documents.md:1330`): "13(1)'s second limb is keyed to the kinds of
  service, not to the salary condition. So an income line for writing, editing, lecturing, teaching or training would be
  registered עוסק מורשה for that service." It names those five, not translation.
- **The nearest line [inference]** (`osek-patur-documents.md:1331`): "The ruling's occupation line names none of these.
  The nearest colony line is Indiebook's ebook royalties … Whether royalties on copies of an ebook are a "כתיבה" service is
  not settled by these texts." Its pointer to `CHANNEL_LOOP.md` row 22 has moved (Part C).
- **Reg 13 as the definition's third limb [inference]** (`osek-patur-documents.md:970`). The definition, frozen: "" עוסק
  מורשה "– עוסק שנרשם לפי סעיף 52 או לפי סעיף 58 ואינו עוסק פטור וכן מי שנמנה עם סוג עוסקים שלגביהם קבע שר האוצר
  שיירשמו כעוסקים מורשים;" (`research/rendered/nevo-vat-law-2026-09-29.txt:91`, rendered, `[no-terms]`).
- **[asm] §59(א)'s proviso**, "הוראה זו לא תחול על מי שנקבע לגביו שיהיה עוסק מורשה אף אם מחזור העסקאות שלו נמוך מהסכום
  האמור.", is quoted at `osek-patur-documents.md:971`; in the frozen law, §59 opens at
  `research/rendered/nevo-vat-law-2026-09-29.txt:788`.
- **How §31(3) then applies is open [inference]** (`osek-patur-documents.md:972`): "A reg-13 dealer under the ceiling also
  meets the עוסק פטור definition's words; the pages read do not say how §31(3) then applies".
- **One registration for every business.** §55, frozen: "55. אדם שיש לו כמה עסקים או שבעסקו כמה יחידות עסק, יירשם כעוסק
  אחד לגבי כולם, אולם רשאי הוא להירשם בנפרד לגבי כל עסק או יחידה שבעסקו; שר האוצר רשאי לקבוע תנאים לרישום כאמור."
  (`research/rendered/nevo-vat-law-2026-09-29.txt:777`, rendered, `[no-terms]`). The עוסק פטור definition counts turnover
  "בכל עסקיו" (frozen, `research/rendered/nevo-vat-law-2026-09-29.txt:93`).
- **Reg 9(א)(2).** A unit registers separately only if "(2) ברישומו בנפרד כאמור לא יהפוך לגביהם לעוסק הפטור ממס."
  (`R-REG:107`; `osek-patur-documents.md:944`). The note's [inference]: "Every colony income line counts toward one
  ceiling." (`osek-patur-documents.md:945`).
- **No file joins them.** `grep -F "אותם שירותים בלבד"` finds, outside the captures, only `osek-patur-documents.md:967`,
  `osek-patur-documents.md:1329` and `logs/FABLE_QUEUE.md:43`. No file lays "ולגבי אותם שירותים בלבד" beside §55's single
  registration or reg 9(א)(2) (repo).
- **Reg 13(4), group instruction.** Schools include vocational or practical instruction to groups of at least five
  (`R-REG:141`; `osek-patur-documents.md:968`). The note's [inference]: "A future colony line that runs group instruction
  could also fall in reg 13(4)" (`osek-patur-documents.md:1068`).
- **Reg 8, a change of branch.** Reg 8 requires written notice within 15 days of "a change of economic branch"; "A new
  colony income line might count [inference]" (`osek-patur-documents.md:1115`, which cites the unfrozen registration
  capture by line; rendered via note, `[no-terms]`).
- **Reg 13's chapeau uses the deleted term** "גם אם … הוא היה נחשב כעוסק זעיר" (`R-REG:133` via
  `osek-patur-documents.md:966`), the same "עוסק זעיר" as reg 22(2). The frozen law reads ""עוסק זעיר" – (נמחקה)"
  (`research/rendered/nevo-vat-law-2026-09-29.txt:89`). No file lays the reg 22(2) inference beside reg 13.

### A(c) Reg 22(2), and step 2's periodic-report line

- **The text** (GEN, github via note; `osek-patur-documents.md:1340`): "22. אלה פטורים מהגשת דו"ח:" (GEN:2372); "(1) עוסק
  שכל עסקאותיו הן כאמור בסעיף 31(1) או (2) לחוק;" (GEN:2374); "(2) עוסק זעיר הפטור ממס לפי סעיף 31(3) לחוק." (GEN:2375).
- **No amendment, and the authority** (`osek-patur-documents.md:1341-1342`): no amendment note follows reg 22 (GEN:2376 is
  reg 23), and no history line in GEN names "תקנה 22"; the preamble names §67 (GEN:260); "(ד) fits" is inference.
- **§67(ד) in 2026**, frozen: "(ד) שר האוצר רשאי לפטור מחובת הגשת דו"ח תקופתי סוגי עוסקים שכל עסקם בעסקאות פטורות ממס או
  בעסקאות החייבות במס בשיעור אפס." (`research/rendered/nevo-vat-law-2026-09-29.txt:862`, rendered, `[no-terms]`). The
  mirror spells "בשעור" (VAT:2783; `osek-patur-documents.md:1336`).
- **The deleted term and §31(3) today**, frozen: ""עוסק זעיר" – (נמחקה)"
  (`research/rendered/nevo-vat-law-2026-09-29.txt:89`); "31. אלה עסקאות הפטורות ממס:" (`:474`); "(3) עסקאות של עוסק
  פטור, למעט עסקאות שהן מכירת מקרקעין, או עסקאות שהן מכירת ציוד שאינו מקרקעין שבעת רכישתו נוכה מס תשומות ששולם בשלו;"
  (`:484`) (rendered, `[no-terms]`).
- **The bridge [inference]** (`osek-patur-documents.md:1343`, and `osek-patur-documents.md:61-64` for §2א of the
  instructions): reg 22(2) "reaches today's עוסק פטור through the §31(3) formula, as §2א of the instructions does".
- **The result [inference]** (`osek-patur-documents.md:1344-1345`): "As of 2023 an exempt dealer files **no periodic
  report**. The one yearly VAT filing in these texts is reg 15's declaration by 31 January (MREG:390)." The text rests on
  MREG:390 (github, via note).
- **The fallback in 2026**, frozen: §67(א2)(1), two-monthly up to 1,775,000
  (`research/rendered/nevo-vat-law-2026-09-29.txt:852`), and §67(ב), "(ב) דו"ח תקופתי יוגש תוך חמישה עשר יום לאחר תקופת
  הדו"ח שבו, אף אם לא היו באותה תקופה עסקים או פעילות…" (`:856`) (rendered, `[no-terms]`, frozen). `RULING:94-95` cites the
  live VAT-law capture for both; the frozen copy has the same bytes.
- **On the עוסק מורשה branch.** Reg 23ג(ב)(2) (GEN:2726): "רשאי, לבקשתו, להגיש דוח תקופתי באופן מקוון, באמצעות שם משתמש
  וסיסמה שיינתנו לו למטרה זו." The note: "This matters only on the עוסק מורשה outcome, as input to "whether the runner can
  file"." (`osek-patur-documents.md:1349`, github via note).
- **Age of the text.** "Nothing after about 5.6.2023." (`osek-patur-documents.md:1387`). Reg 6א and reg 22 have no 2026
  text in the repo.

### A(d) Ruling (a), as ruled (`RULING`, repo)

- **Reg 13** (`RULING:78-84`): "the honest occupation description does **not** put the owner among reg 13(1)'s listed
  classes on the text, and the step is not reworded to dodge the list" (`RULING:78-79`). The ruling's elided title list
  (`RULING:80`) leaves out "מתורגמן", which the full text at `osek-patur-documents.md:967` has. "Reg 6א is unread
  (OP:1116-1117), so the second leg is open." (`RULING:84`).
- **The wording** (`RULING:87-88`); the second sentence "is said if the form or the clerk asks how the business operates"
  (`RULING:90`).
- **The class guard and the עוסק מורשה outcome** (`RULING:91-96`): "If the approval says עוסק מורשה: tax invoices become
  lawful, Wix's clause meetable, periodic reports two-monthly and due even with no activity … — recurring paperwork whose
  KILL-4 status turns on whether the runner can file it (unread); the board re-plans then, and the owner is told this
  outcome exists before step 2 is asked."
- **The report period** (`RULING:104`, heading "Step 2's wording is corrected, not asserted."; `RULING:106-107`): "on the
  law alone the report period is two-monthly unless the Minister exempted the class …, and that instrument sits in the
  unread general regulations; the page says so." The note's later reading is at `osek-patur-documents.md:1340` and
  `osek-patur-documents.md:1346`.
- **Superseded lines.** "**The registration regulations (reg 13, reg 15, reg 2(א)(1), reg 11) have no github twin in the
  notes**" (`RULING:135-136`) and, under "What stays open", "The registration regulations' github twin (matters only under
  16(d)(ii))" (`RULING:406`) are superseded by `osek-patur-documents.md:1381` (github, via note).
- **What stays open, and REOPEN.** "Reg 6א and the exempt dealer's report period" (`RULING:404-405`); REOPEN IF includes
  "the registration approval returns עוסק מורשה (re-plan, above)" (`RULING:142-144`).
- **The queue row** is `logs/FABLE_QUEUE.md:43` (repo).

### A(e) The lines the row names, and the others the same reading could touch

**Indiebook (§4 row 22, `CHANNEL_LOOP.md:166`).**
- **Status.** "candidate, order 2"; "the bar is still a named Hebrew title and the written AI answer"
  (`CHANNEL_LOOP.md:166`, repo). Not a portfolio line (A(0)).
- **What is paid, and who invoices the buyer.** The store is the merchant of record: "רכישת המוצרים נעשית מול החברה
  והחברה היא שתפיק חשבונית מס בעבור כל עסקה, ולא הוצאות הספרים ו/או הסופרים עצמם" (`indiebook.md:145-146`, rendered via
  note, `[pre-bar]`; the capture it quotes has no frozen copy).
- **How it pays** (`indiebook.md:36-40`, rendered via note, `[pre-bar]`): each quarter "בקשת תשלום וחשבונית מס"; bank
  transfer; the invoice goes by email or post to "אינדיבוק בע"מ" (`indiebook.md:38`), the invoice's addressee [a checker
  corrected a clerk's "the payer"]; "מי שמוגדר עוסק פטור חייב לשלוח דרישת תשלום או קבלה כדי שנוכל להעביר לו את התשלום"
  (`indiebook.md:39`); the royalty is shown "כולל מע"מ", so an exempt payee divides by 1.17 (`indiebook.md:40`).
- **The unregistered route.** A payment demand with "השם המלא ומספר תעודת הזהות" (`indiebook.md:41`); the maximum
  withholding, "ינוכה מהסכום מס מקסימלי כחוק", is at `indiebook.md:138` (and `indiebook.md:32`) [a checker corrected the
  clerk's `:41`]. The 29.9 sitting: "the unregistered route (name plus ID number, maximum withholding) is never used"
  (`CHANNEL_LOOP.md:166`).
- **Unknown.** "**Royalty share / commission: UNKNOWN.**" (`indiebook.md:129`); "The author agreement is not published"
  (`indiebook.md:15-16`).
- **The written AI question, unsent.** English at `indiebook.md:243-244`, Hebrew at `indiebook.md:236-237`;
  `research/owner-asks/questions.json:86-93`, whose preSend reads "Send once step 8 exists";
  `research/owner-asks/sent.json` has 0 "indiebook" records (repo).
- **Three facts no file joins.** Reg 6א does not apply where the recipient "קיבלו חשבונית מס מנותן השירות"
  (`osek-patur-documents.md:1318`, github via note). The colony issues "never "חשבונית מס"" (`CHANNEL_LOOP.md:166`,
  `CHANNEL_LOOP.md:231`, repo). Indiebook asks every author each quarter for "בקשת תשלום וחשבונית מס", and an exempt dealer
  sends "דרישת תשלום או קבלה" (`indiebook.md:36`, `indiebook.md:39`, rendered via note).

**Teach Simple (§4 row 28, `CHANNEL_LOOP.md:172`).**
- **Status.** "candidate, order 3"; "the originality warranty is an honesty risk for purely AI output"
  (`CHANNEL_LOOP.md:172`, repo).
- **What is paid.** A subscriber-share royalty: "assign you a share of 50% of their net revenue based on how important
  your items were to them" (`teacher-and-ebook-stores.md:43`, rendered via note, `[pre-bar]`). "Payout reaches ~13
  months after an annual sale" (`CHANNEL_LOOP.md:172`) is inference on `teacher-and-ebook-stores.md:24-26` and
  `teacher-and-ebook-stores.md:43`.
- **How.** "We pay Contributors monthly via PayPal" is the FAQ's wording; the contributor terms say "by electronic funds
  transfer (as may be supported by Teach Simple from time to time) or such other method as may be agreed by the parties"
  (`teacher-and-ebook-stores.md:24`); nothing is released below $50 (`teacher-and-ebook-stores.md:25`); royalties fall due
  within 30 days after the subscription term (`teacher-and-ebook-stores.md:26`) (rendered via note, `[pre-bar]`).
- **Upload.** "our team at Teach Simple will upload all your" / "products for you." (`teacher-and-ebook-stores.md:31`,
  rendered via note), with the note's [INFERENCE] that the owner makes no per-item click.
- **What the subscriber gets.** A licence per downloaded Resource, "non-exclusive," "worldwide, and revocable basis, for
  one single user", valid "only while your subscription is active" (`teacher-and-ebook-stores.md:164-167`, rendered via
  note, `[pre-bar]`).
- **Law and the question.** Governing law is Washington State (`teacher-and-ebook-stores.md:108`). A draft question to the
  support address (a draft, `teacher-and-ebook-stores.md:135`; its text at `teacher-and-ebook-stores.md:136`).

**The parent guides.** "a held demonstration, not a line, no upload" (`VIDEO-RULING:242`;
`products/parent-guides/README.md:7`; `products/README.md:14`). Hebrew narration needs a native listener, which the
mandate lacks (`products/parent-guides/README.md:116`; `VIDEO-RULING:245-247`). Under the brand מהודק
(`products/parent-guides/README.md:3`). No file treats the parent guides as an income line (repo).

**Lines the row does not name.**
- **T1 video:** "held by protocol" (`CHANNEL_LOOP.md:139`); "**Nothing** of AdSense, tax forms, PIN letters or YPP. Those
  are stage B" (`research/faceless-youtube/T1-PROTOCOL.md:131-132`); P-3, "AdSense is one shared rail in portfolio
  accounting" (`VIDEO-RULING:253`) (repo).
- **kids-explainers:** admitted 4.10, "held by protocol behind T1" (`CHANNEL_LOOP.md:140`); "an **experiment with no
  revenue target**" (`KIDS-RULING:295-297`), citing `types.ts:31` ("measuring … never counted as live") (repo).
- **chart-explainer:** "**holds it unpublished**" (`products/chart-explainer/README.md:5-6`); "not a portfolio line"
  (`products/README.md:13`) (repo).
- **il-biz-tools Pro:** "one-time ₪79 through **Gumroad**" (`products/il-biz-tools/README.md:35`,
  `products/il-biz-tools/README.md:38`; `portfolio.ts:231`; the Gumroad facts behind them come from `[against-bar]`
  captures); "Pro sells **one** thing: your logo and accent colour on the printed document."
  (`products/il-biz-tools/README.md:571`); "It is not an AI service and must never be sold as one."
  (`products/il-biz-tools/README.md:50`) [asm: the clerk wrote `README.md`; it is the il-biz-tools one].
- **The documents ruling on Pro.** "**What the ₪79 purchase is: a right, not information.**" (`RULING:157`); "it is not
  "תוכנה" — the software is free and is not delivered by the sale — and not a service: nothing is performed over time"
  (`RULING:164-165`). That is a consumer-law reading (14ג). The paragraph "Who the עוסק is" (`RULING:172-180`) makes
  Gumroad the עוסק toward the buyer and closes "**The characterisation is the ruling's, not a text's**" (`RULING:180`); it
  quotes the unfrozen Gumroad terms capture (`[against-bar]`). The sentence is said of who the עוסק is, not of the
  licence paragraph `RULING:157-166` [a checker's scope correction].

### A(f) What the note states, against what the repo holds

[asm] The clerk's own list ("Things the note states that its source, as held in the repo, does not") was not passed to
the assembler, only the checker's word that all five points hold and two of its checks. These are the statements the
checked evidence supports:
1. The note's GEN, MREG and VAT lines quote texts the repo does not hold (Provenance, "The mirror"). The slug
   `nevo-vat-general-regs` (`osek-patur-documents.md:1047`) has no `urls.txt` line and no capture.
2. Reg 6א's items (1) and (2) are quoted with seven elisions (`osek-patur-documents.md:1319-1320`).
3. 6א(ב) to (ו) have no wording; (ד) and (ו) are paraphrased (`osek-patur-documents.md:1321`). `grep` finds no "6א(ב)",
   "6א(ג)" or "6א(ה)" in the note; the only hit for that pattern, `osek-patur-documents.md:1245`, is §76א of the Land
   Taxation Law.
4. The [inference] at `osek-patur-documents.md:1330` names writing, editing, lecturing, teaching and training; 6א(1) also
   lists translation (`osek-patur-documents.md:1319`).
5. Which subsection of §67 reg 22 rests on is not stated; "(ד) fits" is inference (`osek-patur-documents.md:1342`).

---

## Part B — Row 20, the refund-retry state: security before `enable` (`FABLE_QUEUE.md:44`)

**The row's inputs, verbatim** (`FABLE_QUEUE.md:44`): "`logs/2026-09-30-documents-fold-4-5-7.md` and `-fixes.md` (the
Pro build of tick 26, merge `c289fa4`); `scripts/brand_mail.py` respond-refunds and `.github/workflows/brand-mail.yml`;
`research/channel-loop/RULING-2026-09-30-documents.md` (d) and fold 5". `c289fa4` is an ancestor of `e2b249c`, and `git
log c289fa4..e2b249c` on `brand_mail.py`, `brand-mail.yml` and `gumroad-pro-product.js` is empty.

**The row's question, verbatim** (`FABLE_QUEUE.md:44`): "Security, before `enable`. (a) Fold 5 keeps `{saleId,
requestedAt, holdingReplySentAt}` in `state/colony/refund-retries.json`, committed to a PUBLIC repo; in Gumroad's source
the receipt, resend-receipt and subscribe actions are public and keyed on that sale id, and the receipt shows in full to
anyone who also guesses the buyer's email (`antiwork/gumroad` `purchases_controller.rb:20-22`, `:310-326`, github grade,
per the fixer's log). Keep it, move the waiting state into the brand mailbox (an IMAP keyword on the holding-replied
mail, re-running the first lookup; no sale id stored, no commit), or another route? (b) To commit that file the responder
job now holds a `contents: write` token beside the mailbox secrets (scoped by env to two git steps,
`persist-credentials: false`); keep or drop with (a). Nothing is exposed before the first sale, and a sale needs
`enable`."

### B(a) The row and the hold

- **One overreach inside the row.** "shows in full" is the row's own wording. The fixes log says only "`receipt` מציג את
  הקבלה למי שמנחש את המייל" (the receipt is shown to whoever guesses the email; fixes log `:56`).
- **One correction to the fold target.** "§4 (Pro)" is §3: the hold sits at the end of the il-biz-tools row,
  `CHANNEL_LOOP.md:134`: "**`enable` also waits on FABLE_QUEUE row 20** (the retry file would put buyers' sale ids in the
  public repo)." (repo).
- **The hold is not in code.** `enableProduct` is `gumroad-pro-product.js:636-665` (docstring `:630-635`). Its gates:
  productId `:637-638`; the brand mailbox `:639-647`; the refund responder `:650-659`; `checkOffer` `:660`; then the PUT
  enable at `:661`. [asm] A `grep -i` of the file for "refund-retries", "row 20" or "fable" finds nothing.
  `gumroad-pro-product.yml` declares no `environment:`; it has workflow-level permissions (`gumroad-pro-product.yml:85-86`,
  `contents: write`) and the job `product:` at `gumroad-pro-product.yml:95` (repo).

### B(b) What is in the public repo today

- **The decision.** "The repo is public, and its history on main carries the owner's real name and personal email as the
  merge author" (`CHANNEL_LOOP.md:239-240`); "make it private (Actions minutes become metered, possibly a cost)"
  (`CHANNEL_LOOP.md:241`); a private repo "makes github.com CONDITIONAL_UNMET", and "private" is "choosable only after
  step 7, with the organisation's $0 budget created and read" (`CHANNEL_LOOP.md:241`) (repo).
- **The retry file does not exist yet.** `git log --all -- state/colony/refund-retries.json` is empty (repo).
- **No product, no token yet.** `"productId": ""` (`products/il-biz-tools/src/config/site.json:7`); "Gumroad Pro refund
  rate: not configured — GUMROAD_ACCESS_TOKEN is not set" (`state/colony/REPORT.md:52`) (repo).
- **The colony tick commits state.** `colony.yml:83-87`, with `git add -f state/colony` at `colony.yml:87`. The cron is
  `"17 * * * *"` at `colony.yml:23`, hourly at minute 17 [a checker corrected "at :23"]. The tick gets
  `GUMROAD_ACCESS_TOKEN` at `colony.yml:62`; the push loop is `colony.yml:97-104`. `.gitignore:6-8` now un-ignores the
  database (`!state/colony/colony.db`, "The colony's own state is the audit trail the owner reads; it must be
  versioned."), so [inference] the "-f because" comment at `colony.yml:83` is older than that rule (repo).
- **The ledger's sale ids.** The Gumroad connector (`src/revenue/connectors/gumroad.ts`) calls `GET /v2/sales` (`gumroad.ts:35`)
  and books each sale with `externalId: String(sale.id)` (`gumroad.ts:52-58`); `isConfigured` tests the token alone
  (`gumroad.ts:28`). Read-only on `colony.db` (`immutable=1`): `revenue_ledger` has an `external_id` column and 0 rows, 0
  of them gumroad; the working file equals HEAD (repo).
- **[inference]** Once a sale is booked, the hourly tick would commit its sale id in `colony.db` too: the tick holds the
  token (`colony.yml:62`; `gumroad.ts:28`) and stages `state/colony`. The same would hold for pcn874, whose rail is
  also Gumroad ("Rail: Gumroad", `products/pcn874/README.md:5`; `state/colony/REPORT.md:65`). [inference] The id the
  ledger books is the same `sale.id` that `gumroad-pro-product.js:913` and `gumroad-pro-product.js:1108` use.

### B(c) Route 1, "keep": what it stores and where

- **The file.** "A list of {saleId, requestedAt, holdingReplySentAt} - sale ids and times only, never an address or a
  name." (`brand_mail.py:192-195`); `load_retries` at `brand_mail.py:1273-1290`; `SALE_ID` at `brand_mail.py:206` (repo).
  The test is `scripts/tests/test_brand_mail_refunds.py:683-699` (name `:683`, asserts `:693-699`); it also bars
  "buyer.one" and "b2@" and checks each entry's keys (`:698-699`).
- **The order of writes, under `--apply`, for a sale not already waiting.** The holding reply is sent first
  (`brand_mail.py:1500`); then `retries.append` (`brand_mail.py:1510`), `save_retries()` (`brand_mail.py:1512`) and
  `\Answered` (`brand_mail.py:1513`). `requestedAt` is the server's INTERNALDATE (`brand_mail.py:1507-1509`). "The retry
  is written before the mail is marked answered, so a failure between the two can repeat the holding reply but never lose
  the refund." (`brand_mail.py:1489-1491`). A sale already waiting gets `\Answered` and no new entry
  (`brand_mail.py:1495-1497`). A holding reply that fails to send writes no entry and fails the run
  (`brand_mail.py:1499-1506`) [a checker corrected the order]. [asm] Fold action 5 lists "mark `\Answered`, append" in
  that order (`RULING:357-359`); the code appends and saves first and says why.
- **What drops an entry.** Only "refunded" or "already-refunded" (`brand_mail.py:1425`, then `brand_mail.py:1433-1450`).
  The rest keeps it: a second balance refusal, quietly, with no failure (`brand_mail.py:1422-1424`); a dry run, with no
  failure (`brand_mail.py:1430-1432`); a stop, or no refund line for that sale, kept and the run fails
  (`brand_mail.py:1425-1429`); a reply that cannot be sent, kept and the run fails (`brand_mail.py:1443-1446`). After a
  refund the entry is dropped even when the request is gone, from someone else, or covered by another answer
  (`brand_mail.py:1434-1439`). The docstring is `brand_mail.py:78-88` [a checker found "anything else keeps it and fails
  the run" an overreach].
- **The commit step** (`brand-mail.yml:340-381`): no file, exit (`brand-mail.yml:347-349`); no change, exit
  (`brand-mail.yml:352-355`); the file is written into the run summary first (`brand-mail.yml:356-357`); commit
  "brand-mail: refund balance retries [skip ci]" (`brand-mail.yml:361`); push loop (`brand-mail.yml:369-379`); on failure,
  "It is in this run's summary; add it by hand, or the refunds in it are not retried." (`brand-mail.yml:380`) (repo).
- **Main-only.** A real refund run is refused off main (`brand-mail.yml:270-276`; `brand_mail.py:1356-1357`). The header
  says the environment's deployment branches are ones "the owner limits to main (step 8)" (`brand-mail.yml:33-36`); that
  is an instruction in a comment, and no file shows the setting in force. Three jobs name the environment
  (`brand-mail.yml:92`, `brand-mail.yml:179`, `brand-mail.yml:259`), not "both" as `brand-mail.yml:35` says [checker
  corrections].
- **Where else sale ids appear.** `brand_mail.py:70-72`, `brand_mail.py:1420`, `brand_mail.py:1486`;
  `gumroad-pro-product.js:77`, `gumroad-pro-product.js:1108`, `gumroad-pro-product.js:1124`; `brand-mail.yml:320-321`
  ("prints counts, UIDs and sale ids only"). `done()` writes the whole report as JSON to stdout
  (`brand_mail.py:1552-1555`, called at `brand_mail.py:1546`). The outcome strings name the sale (`brand_mail.py:1494`,
  `brand_mail.py:1497`, `brand_mail.py:1514`). `retryLog` passes through `ANY_ADDRESS` (`brand_mail.py:1293-1295`);
  `refundLog` redacts only the sender's address (`brand_mail.py:1219-1221`) (repo). [inference] A sale id reaches the run
  log and the job summary as well as the file.

### B(d) The token, part (b)

- **Workflow level.** `brand-mail.yml:85-86`, `contents: write`. The `send` (`brand-mail.yml:89`) and `probe`
  (`brand-mail.yml:176`) jobs set no job-level `permissions`, and their checkouts set no `persist-credentials`
  (`brand-mail.yml:110-113`, `brand-mail.yml:188-190`) (repo). What `actions/checkout@v4` leaves in `.git/config` by
  default there: none (no file reads its `action.yml`).
- **Before the merge.** `git show c289fa4^1:.github/workflows/brand-mail.yml` has `contents: read` at its `:258-259`, and
  the comment at its `:257`: "It changes mail flags and Gumroad sales, never the repository." Now
  (`brand-mail.yml:260-261`): "and in the repository only state/colony/refund-retries.json" (repo, via git).
- **The job now.** `respond-refunds` (`brand-mail.yml:256`) holds `contents: write` (`brand-mail.yml:262-263`); its
  checkout sets `fetch-depth: 0` and `persist-credentials: false` (`brand-mail.yml:278-287`; at `brand-mail.yml:286`: "as
  the header actions/checkout would have stored; no other step of this job ever holds it").
- **The two git steps.** "Move to the branch tip" (`brand-mail.yml:301-315`) and "Commit the balance retries"
  (`brand-mail.yml:340-368`) each get `GH_TOKEN: ${{ github.token }}` by env; the mask is at `brand-mail.yml:311` and
  `brand-mail.yml:365`, the extraheader at `brand-mail.yml:312-313` and `brand-mail.yml:366-367` (repo).
- **The mailbox step.** "Respond to refund requests" holds `BRAND_MAIL_ADDRESS`, `BRAND_MAIL_APP_PASSWORD` and
  `GUMROAD_ACCESS_TOKEN` (`brand-mail.yml:322-334`, env at `brand-mail.yml:324-329`); the child process's env is built at
  `brand_mail.py:1210` (repo).
- **The test that pins it.** `src/__tests__/revenue/brand-mail-workflow.test.ts:107-124` (`permissions` at `:109`; only
  the commit step pushes, `:120-121`; only that file, `:122-123`) and `:128-141` (repo). [inference] A route that sets
  `contents: read` or removes the commit step has to change these assertions.
- **Why the merge added it.** The fold log's reason (fold log `:56-58`): without the commit "קובץ הניסיונות נמחק בסוף כל
  ריצת CI"; the holding reply goes out, the mail is marked answered, "והמכירה לא נבדקת שוב לעולם". So the merge added
  `contents: write`, `fetch-depth: 0`, "Move to the branch tip" and a one-file commit step. The log's own flag (fold log
  `:59`): "(טוקן כתיבה באותה משימה שמחזיקה את סודות תיבת הדואר, כמו במשימות probe ו-send) — כדאי שהלוח (Fable) יאשר."
  (repo).
- **The probe does not read permissions.** `brand_mail.py:907-927` and `brand_mail.py:971-1027`: job keys are collected at
  `brand_mail.py:990-996` and checked at `brand_mail.py:997`; the step `if`s at `brand_mail.py:1012-1017`; `permissions` is
  never read (repo). [inference] The test above is the only place that pins `permissions`.

### B(e) What a reader of the repo could do with a sale id

- **The fixer's finding** (fixes log `:53-56`, github via the log): "`sales_controller.rb:126` מחפש מכירה לפי
  `external_id`, ו-`purchases_controller.rb:20-22` מונה את `receipt`, `resend_receipt` ו-`subscribe` כפעולות ציבוריות
  שמוצאות רכישה לפי אותו מזהה (`set_purchase`), כאשר `receipt` מציג את הקבלה למי שמנחש את המייל (`:310-326`)". The log
  paraphrases: it quotes no controller line and names no sha, and the Gumroad code it read "כבר היה ב-scratch" (fixes log
  `:53`).
- **No copy in the repo.** The `0656875c` sha table at `refund-law-il.md:1171-1202` [a checker corrected `:1200`] has no
  `purchases_controller` row. `grep` finds `purchases_controller` only at fixes log `:54` and `FABLE_QUEUE.md:44`. The fold
  log `:29` read `GET /v2/sales/:id` at `sales_controller.rb:125-128` (`0656875c`, github via the log);
  `gumroad-pro-product.js:930-932` cites the same lines for the retry's lookup (repo).
- **The licence key and the product id.** The key is minted per sale and printed in the receipt
  (`gumroad-native-licenses.md:11-13`, `gumroad-native-licenses.md:38-40`, github via note); also "on the product's
  download page, and on the product's page on Gumroad" (`gumroad-native-licenses.md:53-55`, a help article, documentation
  grade per `gumroad-native-licenses.md:16-19`). Verifying a key needs no token (`gumroad-native-licenses.md:57-69`: the
  `before_action` list at `:62-64`, the lookup at `:66-67`, the spec at `:68-69`); "`product_id` is the product's public
  external id and is safe to ship in page source" (`gumroad-native-licenses.md:72-73`) (github, via note). Option C:
  `gumroad-license-decision.md:14` (github, via note). The receipt carries the refund policy (`refund-law-il.md:112-114`,
  github via note).
- **On our pages.** `gumroad-pro-product.js:28-31` (`--write-site-json` puts the public id into `site.json`).
  `products/il-biz-tools/invoice.html:172` and `products/il-biz-tools/invoice.html:174`: the page discards the purchase
  details Gumroad returns and stores only the key, the product id and the check date;
  `products/il-biz-tools/invoice.html:173`: Pro switches off only when Gumroad confirms the key revoked, the payment
  refunded or a dispute opened. The key is re-checked at most once every 7 days and switched off on a refunded or
  chargebacked flag (`gumroad-license-decision.md:14`, github via note). [inference] A copied key keeps working until a
  refund or revocation and the next re-check.
- **What the ruling said about publicity.** Ruling (d) records "sale id only, never the address" (`RULING:312`) and fold
  action 5 "(no address, no name)" (`RULING:359`); section (d) is `RULING:272-328`. The ruling's constraints header,
  "nothing public carrying it" (`RULING:16-17`), means the owner's name, not buyer data. (d)'s REOPEN IF
  (`RULING:327-328`) does not mention the exposure (repo).

### B(f) The routes in the question, and two more

**Route 2, an IMAP keyword on the holding-replied mail.**
- **None exists today.** `grep` finds only `STORE +FLAGS (\\Answered)` and no keyword or `X-GM-LABELS` (repo). The reply
  threads to the request (`brand_mail.py:1229-1242`, In-Reply-To/References at `brand_mail.py:1238-1240`);
  `find_request` re-finds a request (`brand_mail.py:1323-1347`: SEARCH at `brand_mail.py:1329-1330`, the exact
  INTERNALDATE match at `brand_mail.py:1336`).
- **[inference] `\Answered` is set on four paths:** covered (`brand_mail.py:1475`), already waiting
  (`brand_mail.py:1496`), holding reply sent (`brand_mail.py:1513`), answered (`brand_mail.py:1535`). So `\Answered`
  alone does not mark a request as waiting.
- **Which mailbox.** respond-refunds selects INBOX (`brand_mail.py:1399`). The docstring's "WHICH MAIL IS READ" (All Mail,
  `brand_mail.py:94-100`) describes the probe (`brand_mail.py:557`, `brand_mail.py:871`) (repo).
- **Re-running the first lookup.** The first lookup is by sender and time: `refund --email <From> --requested-at <the
  server's INTERNALDATE>` (`brand_mail.py:65-67`, `brand_mail.py:1191-1194`; `gumroad-pro-product.js:69-84`). The retry
  needs no address: its sale id "came from refundSale's own balance refusal for a verified sender, so no address is needed
  to find it" (`gumroad-pro-product.js:930-932`) (repo).
- **A deleted or archived request.** Today the refund stays, the entry is dropped and no one is answered
  (`brand_mail.py:1417-1419`, `brand_mail.py:1434-1435`; INBOX at `brand_mail.py:1399`); the fold log `:60-63` records the
  same choice (repo). [inference] Under a keyword route, a request the brand mailbox no longer holds would carry no
  waiting state at all.
- **The cancellation channel** is email to the brand address (`products/il-biz-tools/index.html:100`), and a notice must
  carry "name and ID number" per 14ט(ג) (`RULING:191-192`) (repo). [inference] A buyer's request may hold more than an
  address.

**Route 3, the fixer's "another route": a keyed hash.** "(מצב בתיבת הדואר, או HMAC עם מפתח — מפתח חדש הוא צעד בעלים)"
(fixes log `:57-58`) (repo). [inference] A new key the owner must create would meet "Never invent a step that isn't
required." (`MISSION.md:436`). No file says where such a key would live or what it would hash.

**Route 4, the behaviour before fold 5** (what (d) replaced). On a stop, "the refund command stopped: not answered, left
for the next run" (`brand_mail.py:1517-1521`, the string at `brand_mail.py:1519`), retried only while the request stays
unanswered within `REFUND_LOOKBACK_DAYS = 60` (`brand_mail.py:189`), searching INBOX (`brand_mail.py:1399`) with SINCE
60 days (`brand_mail.py:1452-1454`) (`RULING:306-308`). [inference] Under it an archived request, or one still refused
for balance after 60 days, would stop being retried. Ruling (d) states the residual: "one lone sale can breach
14ה(ב)(1)'s 14 days until a second sale lands" (`RULING:314-316`) (repo).

**What any route meets.** The holding reply promises the refund: "ההחזר על רכישת Pro ניתן דרך Gumroad, והוא יינתן ברגע
ש-Gumroad תאפשר זאת." (`brand_mail.py:250-252`, the quote at `brand_mail.py:251`). The fixes log: a stopped retry "נשאר
ומכשיל כל ריצה", which is preferable to "מחיקה שקטה של החזר שהובטח בתשובת ההמתנה" (fixes log `:60-61`) (repo).

### B(g) Before the first sale

- **Nothing to refund, no mail read.** No product id, no product: "nothing can have been sold … and no mail is read"
  (`brand_mail.py:1358-1360`, the gate at `brand_mail.py:1369-1370`); no token, `configured: false`
  (`brand_mail.py:1351-1355`) (repo).
- **[inference] The productId gate opens at `create`, not at `enable`.** `create`'s site.json PR
  (`gumroad-pro-product.js:28-31`) lands before `enable`; from then on respond-refunds reads mail, and while nothing is
  sold the refund command finds no sale.
- **When an entry is written.** Only on exit 3 under `--apply` (`brand_mail.py:1487-1512`; the dry-run branch at
  `brand_mail.py:1493-1494`), for a sale not already waiting (`brand_mail.py:1495-1497`) whose holding reply was sent
  (`brand_mail.py:1499-1506`). The refund command reaches that exit only for a sale "of THIS product whose buyer address
  is <addr>, not already refunded or disputed" (`gumroad-pro-product.js:71-73`); exit 3 is Gumroad's balance refusal
  [asm: `gumroad-pro-product.js:80-84`; `BALANCE_EXIT = 3` at `brand_mail.py:198`]. With no entries the commit step exits
  (`brand-mail.yml:347-349`) (repo).
- **When the first entry is likely.** "the first refund on a new account is refused by dashboard and API alike, and later
  ones when fewer than two sales are unpaid" (`RULING:304-306`), resting on `refundable.rb:99-100` as quoted at
  `refund-law-il.md:972` (github, via note); `refund-law-il.md:1443-1446` is marked "[inference, from rendered text]".
  [inference] The first refund request after the first sale is the most likely first entry.
- **The draft.** `create` makes a draft (`gumroad-pro-product.js:373`, `gumroad-pro-product.js:52`, restated at
  `gumroad-pro-product.js:751`; `gumroad-pro-product.yml:50`, `gumroad-pro-product.yml:65-70`,
  `gumroad-pro-product.yml:188-193`). A Gumroad source is cited for creating it as a draft: "draft=true:
  create_as_draft? in links_controller.rb at af1ae267" (`gumroad-pro-product.js:20-21`; `gumroad-license-decision.md:99`,
  github via note). None is cited for the workflow's "a draft reaches no buyer" (`gumroad-pro-product.yml:50`) [a
  checker's correction].

### B(h) Standing rules that bear on the routes

The header's rules apply; three bear most. "Never invent a step that isn't required." (`MISSION.md:436`), which a new
owner-held key would meet. "The owner does not talk to customers." (`MISSION.md:440`), which every route keeps by
answering from the brand mailbox. "Nothing we publish carries the owner's name" (`MISSION.md:276-279`) speaks of the
owner. No privacy rule for buyers is in `MISSION.md` or `constitution.md` (Part C, row 20).

---

## Part C — What is not for this sitting, what no file holds, and housekeeping

**Not for this sitting.**
- Rows 21 and 22 sit on 6.10 and row 24 on 7.10 (`CHANNEL_LOOP.md:26`). Row 21 asks about nevo's robots.txt and full
  copies in a public repo, which bear on the nevo captures Part A cites; this brief cites them as D1(2) allows.
- The repo-public decision is the owner's (`CHANNEL_LOOP.md:239-241`). Row 20's (a) rests on it (B(b)).
- Ruling (a)'s secured-signature route, the class guard and the one check stand; the §145(א1) check passed 30.9 at github
  grade (`osek-patur-documents.md:1395-1403`). Row 19 asks about reg 6א, reg 13 and reg 22(2) only.
- Ruling (d)'s holding reply, refund-rate KPI and Support-email guard stand; row 20 asks only where the waiting state lives
  and what token commits it.

**What a ruling would need that no file holds.**

*Row 19.*
1. **The texts.** No text of GEN (nevo 271_005) or MREG anywhere in the repo or in the checker's local clone (32 objects,
   none of the blobs). The slug `nevo-vat-general-regs` (`osek-patur-documents.md:1047`) has no `urls.txt` line and no
   capture.
2. **Frozen copies.** None of the registration regulations, the books instructions, or any Indiebook or Teach Simple
   capture.
3. **2026.** No GEN text after about 5.6.2023 (`osek-patur-documents.md:1387`). Reg 6א and reg 22 have no 2026 text.
4. **The full lists.** Reg 6א(א)(1)-(2): the seven elided spans are not held. No wording for 6א(ב)-(ו); (ד) and (ו) are
   only paraphrased.
5. **The owner's income.** Whether the owner's main income is a pension or annuity ("גימלה או קיצבה"). Only "not
   salaried" is recorded (`CHANNEL_LOOP.md:225`). It is the owner's fact (`osek-patur-documents.md:1324`). [A checker
   corrected a clerk who said nothing is recorded.]
6. **Service or sale.** Whether any of these is a reg 6א "service" (כתיבה, עריכה, הוראה, הדרכה, הרצאה, תרגום) rather
   than a sale of copies or licences: Indiebook ebook royalties, where the store is merchant of record; Teach Simple
   subscription-pool royalties on download-licensed resources; T1 or kids-explainers videos; the parent guides.
7. **The parent guides as income.** No file treats them as an income line.
8. **The recipients.** Whether Indiebook (a בע"מ) or Teach Simple (Washington-law terms) is "עוסק, מלכ"ר או מוסד כספי".
   The note: "No reg 6א text on foreign recipients." (`osek-patur-documents.md:1391`). No file says who the AdSense payer
   is in reg 6א terms.
9. **"ולגבי אותם שירותים בלבד"** beside §55's single registration and reg 9(א)(2): no file joins them.
10. **Reg 1(2) and reg 13(1).** How reg 1(2) (all tax paid under 6א) relates to reg 13(1) (some services of the 6א
    kinds): no file.
11. **§31(3) for a reg-13 dealer under the ceiling** (`osek-patur-documents.md:972`): unread.
12. **Pro's characterisation.** Whether the ruling's "not a service" (a consumer-law reading, `RULING:164-165`) carries
    over to VAT reg 6א or reg 13.
13. **Filing on the עוסק מורשה branch.** Whether the runner can file a periodic report: `RULING:95` says "unread"; only
    reg 23ג(ב)(2) (GEN:2726) bears on it.
14. **Indiebook's author agreement** and royalty share, so whether that payment is framed as a royalty or a fee.
15. **The PDF.** Whether `docs/OWNER_STEPS.he.pdf` matches `OWNER_STEPS.he.md:160` (not opened).

*Row 20.*
1. **No copy of `purchases_controller.rb`** in the repo; nothing on the web receipt's content.
2. **Nothing on public `resend_receipt` or `subscribe`** behaviour or rate limits. Do not conflate it with the seller
   API's token-gated `resend_receipt` at `research/colony-sweep/scouts/storefronts--gumroad.md:115`, read from `routes.rb`
   on `main` on 3.9.
3. **The id link.** That the API v2 sale's `id`, which both `revenue_ledger.external_id` and `saleId` hold, is the
   purchase `external_id` that `set_purchase` looks up. `purchase.rb#as_json`'s `id` field is quoted nowhere:
   `src/revenue/connectors/gumroad.ts:10-18` quotes the other fields only. The link rests on the fixer's paraphrase of
   `sales_controller.rb:126` and the fold log `:29` (`GET /v2/sales/:id`, `:125-128`).
4. **Guessability.** Whether a Gumroad sale or external id can be guessed or enumerated without the repo.
5. **Logs.** Nothing on the visibility or retention of a public repo's Actions logs and job summaries.
6. **Gmail keywords.** Nothing on Gmail custom keywords.
7. **The HMAC key.** Nothing on its location or input.
8. **The setup actions.** Nothing on whether setup-python or setup-node take `github.token`; and what
   `actions/checkout@v4` leaves in `.git/config` by default in the send and probe jobs (none).
9. **The environment rule.** That `brand-mailbox`'s main-only rule is actually set: only the comment at
   `brand-mail.yml:33-36` says so.
10. **Why the sale id.** No reason in ruling (d) for keying the retry on the sale id.
11. **`colony.db`.** Nothing on `colony.db` carrying sale ids beyond the schema and the connector (B(b)).
12. **Drafts.** No Gumroad source for a draft being unbuyable.
13. **Disclosure.** No buyer-facing statement that the responder records anything.
14. **Privacy.** No privacy rule for buyers in `MISSION.md` or `constitution.md`.

**Housekeeping for the Opus fold, not rulings.**

*Row 19's pointer drift* (repo; the checker's, confirmed):
- `osek-patur-documents.md:1331` cites `logs/CHANNEL_LOOP.md:164` for Indiebook; row 22 is now at `CHANNEL_LOOP.md:166`.
  `git show 35b537c:logs/CHANNEL_LOOP.md` puts row 22 at `:164`; today `CHANNEL_LOOP.md:164` is row 20 (n8n).
- `osek-patur-documents.md:1346` cites `OWNER_STEPS.he.md:156` and quotes the old clause; the clause is now at
  `OWNER_STEPS.he.md:160` in its reg 22(2) wording (`d00bc66`). `OWNER_STEPS.he.md:156` is blank, "שעוד לא נקראו" has 0
  hits, and test `owner-steps.test.ts:827` asserts its absence.
- `osek-patur-documents.md:1003`, `osek-patur-documents.md:1037` and `RULING:106` cite `OWNER_STEPS.he.md:156` for "פעם
  בשנה"; it is gone, and the clause is at `OWNER_STEPS.he.md:160`.
- `RULING:93` and `osek-patur-documents.md:1072` cite `OWNER_STEPS.he.md:149` for "צעד 2 בוצע"; it is now at
  `OWNER_STEPS.he.md:150` and `OWNER_STEPS.he.md:153`. `OWNER_STEPS.he.md:149` is the Tax Authority form line.
- `RULING:104` and `osek-patur-documents.md:940`, `osek-patur-documents.md:1036`, `osek-patur-documents.md:1116` cite
  `OWNER_STEPS.he.md:130` for "אונליין". The Tax Authority delivery wording is at `OWNER_STEPS.he.md:134` (the time line)
  and `OWNER_STEPS.he.md:149`; "אונליין" survives at `OWNER_STEPS.he.md:151` (Bituach Leumi: "לפי תקציר חיפוש מוגש
  אונליין — לא אומת") and `OWNER_STEPS.he.md:178` [a checker corrected a clerk who said the word was gone].
- `osek-patur-documents.md:908`, `:933`, `:1066`, `:1099` and `:1113` cite the occupation line; it is now at
  `OWNER_STEPS.he.md:150`, with the wording changed; `osek-patur-documents.md:1066` still quotes the old "פיתוח תוכנה
  ומכירת כלים דיגיטליים".
- `RULING:388` "30.9 (tick 24, github)" was filed as `osek-patur-documents.md:1199` "30.9 (tick 26, github)"; its §2
  starts at `osek-patur-documents.md:1306` and its §4 at `osek-patur-documents.md:1370`.
- `RULING:334` cites step 2 at `OWNER_STEPS.he.md:128-175` and its data at `owner-steps.ts:223-230`; step 2 now runs
  `OWNER_STEPS.he.md:132-179` (`---` at `:180`), and the data object is `owner-steps.ts:283-304`, the text at
  `owner-steps.ts:290`.
- `RULING:158` cites `products/il-biz-tools/README.md:567`; now `products/il-biz-tools/README.md:569-571`.
- `CHANNEL_LOOP.md:234` (§6 item 5) still says "פעם בשנה" is marked unverified; the doc no longer has it (A(0)).
- `RULING:135-136` and `RULING:406` are superseded by `osek-patur-documents.md:1381` (A(d)).
- [asm] `indiebook.md:227` cites `MISSION.md:412-413` for "one-time identity and payout steps"; the text is now at
  `MISSION.md:432-433`.
- Not moved: `RULING:84`'s `OP:1116-1117` (the same text at `46c79f8` and `e2b249c`); the note's pointers to `RULING:134`
  and `RULING:142-144`; `RULING:59` ("The hurdle stays a noted risk, not a bar"; off row 19's question);
  `osek-patur-documents.md:1343`'s `:61-64`; `FABLE_QUEUE.md:43`'s pointers to GEN and MREG; the live VAT-law capture's
  §67(א2)(1) line equals `research/rendered/nevo-vat-law-2026-09-29.txt:852` (same sha256).

*Row 20's pointer drift* (repo; the checker's, confirmed):
- In `RULING`: `RULING:297` and `RULING:350` → `gumroad-pro-product.js:520-542` (`requireBrandAccount`); `RULING:302` and
  `RULING:344` → `OWNER_STEPS.he.md:191-194` (the ₪0 note is at `OWNER_STEPS.he.md:186-188`); `RULING:307` →
  `brand_mail.py:1519`; `RULING:308` → `brand_mail.py:189`; `RULING:357` → `cmd_respond_refunds` at
  `brand_mail.py:1350-1546`, the exit-3 branch at `brand_mail.py:1487-1516`, `load_retries` at `brand_mail.py:1273-1290`;
  `RULING:282` and `RULING:18` (`CHANNEL_LOOP.md:76`) → `CHANNEL_LOOP.md:77`; `RULING:18` (`MISSION.md:411-420`, §1,
  one-time steps) → `MISSION.md:431-440`; `RULING:20` (`MISSION.md:416`, never invent a step) → `MISSION.md:436`.
  Checked at `7abee65` and not moved: `RULING:16` (`MISSION.md:359-360`), `RULING:17` (`MISSION.md:276-279`,
  `MISSION.md:310-312`), `RULING:19` (`BOARD-LOOP.md:67`, KILL-4). `refund-law-il.md` has had only in-place edits since
  the ruling, so (d)'s `refund-law-il.md` pointers hold (spot-checked `refund-law-il.md:972`, `refund-law-il.md:1443-1446`).
- In the 1.10 brief (`research/channel-loop/SITTING-2026-10-01-BRIEF.md`), whose header this one replaces for 5.10: its
  `:126`, `:780` and `:841` → `CHANNEL_LOOP.md:239-241`; its `:85` and `:120` → `CHANNEL_LOOP.md:51`; its `:111-113`, the
  Never list → `CHANNEL_LOOP.md:74-80`, which now runs to `:86` (account farm `:76`, per-item `:77`, owner's name `:78`,
  fetch `:79`); its `:100` → `CHANNEL_LOOP.md:80`; its `:106` → `CHANNEL_LOOP.md:106-111`; its `:141`, BBU →
  `CHANNEL_LOOP.md:108` and builds → `CHANNEL_LOOP.md:110`; its `:110` and `:143` → `CHANNEL_LOOP.md:115`; its `:137` →
  `CHANNEL_LOOP.md:219`; its `:138` → `CHANNEL_LOOP.md:252-254`. Not moved: `MISSION.md:310-311`, `MISSION.md:349-354`,
  `MISSION.md:432-440`, `MISSION.md:455-458`; `research/channel-loop/BOARD-LOOP.md:66` (KILL-3).
- The row's own fold target "§4 (Pro)" is §3 (`CHANNEL_LOOP.md:134`), and its "in full" goes beyond the fixes log (B(a)).

*Corrections the checkers made to the clerks* (recorded so the fold does not re-introduce them): the registration
capture is a 29.9 fetch of a 10-12-2024 text; the 15א(ה) Hebrew is in the capture, not the note; the books-instructions
exclusion needs all three conditions; the ruling's list omits "מתורגמן"; step 2's ranges are `OWNER_STEPS.he.md:132-179`
and `owner-steps.ts:283-304`; "not salaried" is recorded; "אינדיבוק בע"מ" is the invoice's addressee; the maximum
withholding is at `indiebook.md:138`; the PayPal wording is the FAQ's; `RULING:180`'s sentence is about who the עוסק is;
the colony cron is minute 17; `enableProduct` is `gumroad-pro-product.js:636-665`; the holding reply goes out before the
append; a balance refusal and a dry run keep the entry without failing; the main-only rule is a comment; the sha table
ends at `refund-law-il.md:1202`.

*Pointers this brief corrected or added in its own evidence* [asm]: D1(2) is at `VIDEO-RULING:32`; the nine Indiebook and
Teach Simple captures span 11:29:10Z-11:30:43Z; Gumroad's terms capture has no frozen copy either; MISSION's one-time-step
sentence is `MISSION.md:432-433`; the README the clerk cited for Pro is `products/il-biz-tools/README.md`; fold action 5's
order differs from the code's; the books-instructions item (3) and the reg 1(2) Hebrew are quoted from the unfrozen
captures with no line; the 15א(ה) mirror twin is MREG:414; §59(א) is quoted at `osek-patur-documents.md:971` and opens at
`research/rendered/nevo-vat-law-2026-09-29.txt:788`; exit 3's definition is at `gumroad-pro-product.js:80-84`, while
`gumroad-pro-product.js:71-73` (which a clerk cited) describes which sale the refund command takes.
