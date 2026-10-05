# Ruling of the VAT-services decider, 5.10.2026 — `logs/FABLE_QUEUE.md` row 19

**Sitting.** The channel loop's Fable sitting of 5.10.2026 (~07:11 UTC), first of two agents (the second rules row 20,
the refund-retry state, in parallel; nothing here waits for it). Model Fable 5.1, one decider, no subagents, no web fetch,
no git write. The main thread folds this on Opus.

**Tree.** `56d4c66` on `claude/new-session-j071dx`, clean (`git status --short` empty). The brief
(`research/channel-loop/SITTING-2026-10-05-BRIEF.md`) was checked at `e2b249c`; `git diff --stat e2b249c 56d4c66` is 37
files, and of the files this ruling reads four changed: `logs/CHANNEL_LOOP.md` (+29 lines), `logs/CHECKPOINT.md`,
`logs/FABLE_QUEUE.md`, `research/channel-loop/terms-verdicts.json` (+260). Every pointer below was re-opened with
`sed -n` or `grep -n -F` on `56d4c66`; where a line moved since the brief, the new line is cited and the move is said.
Where the brief's paraphrase and a file differ, the file is cited. "Pointers moved" is §8.

**Read.** `MISSION.md` in full; the brief's header blocks (`:1-113`), Part A (`:116-398`) and Part C (`:624-758`);
`logs/FABLE_QUEUE.md:43`; `research/measurements/osek-patur-documents.md` "30.9 (tick 26, github)" (`:1199-1412`, its §2
at `:1306-1351` and §4 at `:1370-1382`) and the earlier lines the brief points into; `research/channel-loop/RULING-2026-09-30-documents.md`
(a) (`:78-110`, `:130-145`, `:155-181`, `:330-345`, `:385-410`); `src/revenue/owner-steps.ts:283-304`;
`docs/OWNER_STEPS.he.md:132-180` and `:186-188`; `src/__tests__/revenue/owner-steps.test.ts:775-841`;
`logs/CHANNEL_LOOP.md` §2-§4, §6 and §8 as cited; `research/measurements/indiebook.md` and `teacher-and-ebook-stores.md`
as cited; the product READMEs; the frozen VAT-law capture `research/rendered/nevo-vat-law-2026-09-29.txt` (sha256
`a8b0c841…`, equal to `research/rendered/FROZEN.sha256:121`); `src/revenue/bounties/intake.ts` and `supply.ts`;
`docs/OWNER_STEPS.he.pdf` (text extracted with PyMuPDF, read-only). Short names are the brief's: "the note" is
`osek-patur-documents.md`; `RULING` is the documents ruling; `VIDEO-RULING` and `KIDS-RULING` as there; `GEN`, `MREG`,
`VAT` are the `lawsofisrael` mirror blobs the note read (github, via note: no checker or decider re-opened one).

**Grades and marks** as the brief defines them: `rendered`, `github`, `github via note`, `rendered via note`, `snippet`,
`repo`, `inference`, `none`. Marks kept: `[no-terms]` on every nevo page (unrestricted, VIDEO-RULING D1(2) at `:32`);
`[against-bar]` on Gumroad captures (cited once, through `RULING`); `[pre-bar]` on Indiebook and Teach Simple captures
(cited only through the notes, never by line, as the brief does). The frozen VAT law is the one capture cited by line.
An unfrozen capture is cited through the note line that quotes it, or by a `grep -F` count with no line, so that
`node scripts/freeze-capture.mjs --cited` stays at 0.

**Constraints applied to everything prescribed.** The owner does nothing (`MISSION.md:11`, `:211`); one-time identity and
payout steps only (`:432-433`); "Never invent a step that isn't required." (`:436`); no account in the owner's name (`:437-438`);
the owner does not talk to customers (`:440`); ₪0 (`:349-358`: nothing is bought, step 2 is asked only when a paid product
is ready, after the official cost check); honest value (`:455-458`); the owner's name never volunteered beyond what the law
requires (`:302-303`, `:310-311`); money means the ledger (`:443`). The owner is "the owner", they/them. Nothing is sold or
registered on an inference the owner would have to defend: where the texts leave a point open, the conservative reading is
chosen and said to be chosen.

---

## 1. The question and the fold target

**The question** (`logs/FABLE_QUEUE.md:43`, verbatim): "Reg 13(1)'s second limb registers as עוסק מורשה "עוסקים שעיסוקם
מתן שירותים מהסוגים המפורטים בתקנה 6א … ולגבי אותם שירותים בלבד"; reg 6א(1) lists writing or editing, lecturing,
teaching, training, translation. Does it reach any colony line (Indiebook's ebook royalties, row 22; Teach Simple's
teacher materials, row 28; the parent guides), and if so: is that line's income then registered עוסק מורשה for that
service (changing step 2 and the line's documents), restructured, or killed? Confirm or correct the step-2 line built on
reg 22(2) (the exempt dealer files no periodic report, by inference through §31(3))."

**The fold target** (same row): "fold into `CHANNEL_LOOP.md` §4 rows 22 and 28 and §6, `docs/OWNER_STEPS.he.md` step 2".
Rows 22 and 28 are at `logs/CHANNEL_LOOP.md:166` and `:172`; §6 is `:201-263` and its item 5 `:224-234`; step 2 is
`docs/OWNER_STEPS.he.md:132-179` with its data at `src/revenue/owner-steps.ts:283-304` (repo; the brief's ranges hold).

**RULING in one paragraph.** Reg 6א(1) and the second limb of registration reg 13(1) reach **no colony line**. Every
royalty line the row names supplies a right in a finished work to a platform that sells or licenses it, which on the VAT
law's own definitions is a מכר of טובין, not a שירות, and in no case is it the act of writing, editing, lecturing,
teaching, training or translating performed for the payer; the videos and Pro are not of a listed kind either. That is a
reading of the law's definitions onto the lines, so it is marked inference throughout, and it is the conservative reading
because the step-2 design already lets the office decide the class and switches the documents if the office disagrees.
Indiebook (row 22) and Teach Simple (row 28) are **unchanged**, each with one ₪0 admission condition (the agreement's
framing of the payment is read before the first upload). The parent guides, T1, kids-explainers, il-biz-tools Pro,
apify-actors, pcn874 and mcp-il-tools are **unchanged**. One line is **restructured at ₪0**: oss-bounties' intake stops
attempting bounties whose whole deliverable is documentation or translation, the one colony supply that is literally
writing or translation for a named payer; its supply counter is untouched. Step 2 is **confirmed**: the occupation line,
the class guard and the reg 22(2) clause stand as written, hedged as inference, and the PDF twin carries the same clause.
No owner question is needed.

---

## 2. The texts read, with grade and pointer, and what each says

**2.1 Reg 6א of the general VAT regulations** (GEN:706-722; github via note, `osek-patur-documents.md:1317-1326`;
the mirror text was fetched by 5.6.2023, `:1219`). The heading is "חיוב מקבל שירות בתשלום המס" (GEN:707). The
chapeau, as the note quotes it (`:1318`):

> 6א. (א) עוסק, מלכ"ר או מוסד כספי שקיבלו שירות מן המפורטים להלן ממי שעיקר הכנסתו ממשכורת, גימלה או קיצבה, יהיו
> חייבים בתשלום המס בשל השירות, זולת אם קיבלו חשבונית מס מנותן השירות. ואלה השירותים:

Item (1), with the note's elisions (`:1319`): "מופע אמנותי, … הרצאה, הוראה, הדרכה, תרגול … ; כתבנות או קצרנות; תרגום
בכתב או בעל פה; כתיבה או עריכה; פישור, … או חברות בועדות שהוקמו על פי דין;". Item (2) (`:1320`): "שירותים של בעלי
מקצועות אלה: אגרונום, אדריכל, הנדסאי, … טכנאי, … מהנדס, … סוכן ביטוח, …". The seven elided spans are held nowhere
(brief Part C, row 19, item 4). (ד) and (ו) are paraphrased only (`:1321`): the recipient reports and self-invoices; the
provider files only if it has other transactions. Last amendment 1997 (`:1322`).

*In my words.* A reverse-charge rule. When a dealer, a non-profit or a financial institution buys one of the listed
services from a person whose main income is a salary, a benefit or a pension, the buyer pays the VAT and self-invoices,
unless the provider gave a tax invoice. Its subject is **who pays the tax on a service**; it does not define "service",
and its list is a list of services ("ואלה השירותים"), the acts a salaried person sells on the side: performing,
lecturing, teaching, training, typing, translating, writing or editing, mediating, sitting on statutory committees.
Three limits the note marks as inference hold on the text (`:1323-1326`): the provider's main income must be
salary/benefit/pension; the recipient must be a dealer, non-profit or financial institution, and whether a foreign
platform is one is not settled; software development and licence sales are not named.

**2.2 Reg 1(2) of the registration regulations** (MREG:101, github via note, `:1328` and `:1372`; the 29.9 registration
capture's version is at its line 12 as the note reads it in English, `:912`, rendered via note, `[no-terms]`). The Hebrew,
quoted in the brief from the unfrozen capture (A(b); `grep -c -F` on `research/rendered/nevo-vat-registration-regs.txt`
at `56d4c66`: 1 hit): "(2) מי שהמס בשל כל עסקאותיו משתלם על ידי מקבל השירות לפי תקנה 6א לתקנות מס ערך מוסף,
התשל"ו-1976 (בתקנה זו – תקנות הביצוע);".

*In my words.* A person all of whose tax is paid by the recipients under 6א is not a "חייב במס" at all, so need not
register: the salaried lecturer or writer whose only business is such services.

**2.3 Reg 13(1) of the registration regulations** (MREG:316, github via note, `:1329`; the 29.9 capture's line 135 as the
note quotes it in full, `:967`, rendered via note, `[no-terms]`; `grep -c -F 'ולגבי אותם שירותים בלבד'` on that capture at
`56d4c66`: 1 hit, on its line 135; the capture carries "נוסח עדכני נכון ליום: 10-12-2024" on its line 3). The chapeau
(`:966`): "13. עוסק הנמנה על אחת מהקבוצות המנויות להלן ירשום אותו המנהל כעוסק מורשה גם אם על פי סכום מחזור עסקותיו או
מספר המועסקים בעסק הוא היה נחשב כעוסק זעיר:". Item (1) (`:967`):

> (1) בעל מקצוע חפשי שהוא: אגרונום, אדריכל, הנדסאי, חוקר פרטי, טוען רבני, טכנאי, טכנאי שיניים, יועץ לארגון, יועץ
> לניהול, יועץ מדעי, יועץ מס, כלכלן, מהנדס, מודד, מנהל חשבונות, מתורגמן, סוכן ביטוח, עורך דין, רואה חשבון או שמאי, בעל
> מעבדה כימית או רפואית וכן עוסקים שעיסוקם מתן שירותים מהסוגים המפורטים בתקנה 6א לתקנות מס ערך מוסף, תשל"ו- 1976,
> ולגבי אותם שירותים בלבד;

The mirror's 2023 wording differs in three small ways (`:1376`: no "סוכן ביטוח", a ";" before "וכן", no space in the
year); none touches the second limb.

*In my words.* A mandatory class, not a choice: the Director registers these dealers as עוסק מורשה whatever their
turnover. The first limb is a list of **titles** (ruled 30.9, `RULING:78-82`: titles, not tasks; the owner's title is the
owner's fact and is not steered). The second limb is keyed to **kinds of service**: a dealer "שעיסוקם מתן שירותים
מהסוגים המפורטים בתקנה 6א", authorised "ולגבי אותם שירותים בלבד". It names the kinds, not reg 6א's salary condition
[inference, agreeing with the note at `:1330`: the condition is a fact about the provider, not a "סוג" of service]. The
note's list of five kinds (`:1330`) omits translation; the text's item (1) has "תרגום בכתב או בעל פה" and the first limb
has "מתורגמן" (brief A(f) item 4). This ruling reads translation in.

**2.4 Reg 22 of the general VAT regulations** (GEN:2372-2375, github via note, `:1340`): "22. אלה פטורים מהגשת דו"ח:" ;
"(1) עוסק שכל עסקאותיו הן כאמור בסעיף 31(1) או (2) לחוק;" ; "(2) עוסק זעיר הפטור ממס לפי סעיף 31(3) לחוק." No amendment
note follows it and no history line names it (`:1341`); the preamble names §67 among its authorities (GEN:260) and which
subsection is not stated (`:1342`). The regulations' report periods: monthly (reg 20(ב), GEN:2179) and two-monthly up to
910,000 (reg 20(ג)(1), GEN:2180) (`:1338-1339`). Reg 23ג(ב)(2) lets a dealer file online on request (GEN:2726, `:1349`).

*In my words.* The instrument that exempts a class from the periodic report. Its item (2) names the class by the law's
exemption, "הפטור ממס לפי סעיף 31(3)", under a label the law has since deleted.

**2.5 The VAT law, 2026 consolidated text** (`research/rendered/nevo-vat-law-2026-09-29.txt`, rendered, `[no-terms]`,
frozen; cited by line). These are the texts that decide §3:
- "טובין" (`:41`, `:45`): "לרבות – … (2) זכות, טובת הנאה ונכסים בלתי מוחשיים אחרים ובין השאר – ידע, למעט זכות במקרקעין
  או בתאגיד, ולמעט ניירות ערך ומסמכים סחירים וזכויות בהם;"
- "מכר" (`:75`): ""מכר", לענין נכס – לרבות השכרתו, מקחו אגב שכירות, הקניית רשות לשימוש בו בתמורה, הקניית זכות בו,
  שימוש בו לצורך עצמי, …"
- "נכס" (`:85`): "טובין או מקרקעין;"
- "עוסק" (`:87`): "מי שמוכר נכס או נותן שירות במהלך עסקיו, ובלבד שאינו מלכ"ר או מוסד כספי, וכן מי שעושה עסקת אקראי;"
- "עסקה" (`:95-97`): "(1) מכירת נכס או מתן שירות בידי עוסק במהלך עסקו, לרבות מכירת ציוד;"
- "שירות" (`:125`): "כל עשיה בתמורה למען הזולת שאיננה מכר, לרבות עסקת אשראי והפקדת כסף, …; עבודת עובד איננה בגדר
  שירות למעבידו;"
- The three statuses (`:89-93`): ""עוסק זעיר" – (נמחקה)"; "עוסק מורשה" is a dealer registered under §52 or §58 "ואינו
  עוסק פטור וכן מי שנמנה עם סוג עוסקים שלגביהם קבע שר האוצר שיירשמו כעוסקים מורשים;"; "עוסק פטור" is a dealer whose
  turnover "בכל עסקיו" is at most 122,833.
- §31(3) (`:484`): "(3) עסקאות של עוסק פטור, למעט עסקאות שהן מכירת מקרקעין, או עסקאות שהן מכירת ציוד …"
- §55 (`:777`): one registration for all of a person's businesses, with a right to register units separately on the
  Minister's conditions. §59(א) (`:788`): a dealer "שנקבע לגביו שיהיה עוסק מורשה" stays authorised at low turnover.
- §67(א2)(1) (`:852`): two-monthly reporting up to 1,775,000 unless the Minister set a longer period; §67(ב) (`:856`):
  due "אף אם לא היו באותה תקופה עסקים או פעילות"; §67(ד) (`:862`): "שר האוצר רשאי לפטור מחובת הגשת דו"ח תקופתי סוגי
  עוסקים שכל עסקם בעסקאות פטורות ממס או בעסקאות החייבות במס בשיעור אפס."

*In my words.* The law's grammar of a transaction has two kinds only: a **מכר** of a נכס, which expressly includes
granting a right to use or a right in a thing for consideration, with "טובין" expressly including rights and intangible
assets; and a **שירות**, which is the residue, "כל עשיה בתמורה למען הזולת שאיננה מכר". So a grant of a right in an
intangible for a royalty is on the words a מכר, and a service is what is left after that. This is the law's text; its
application to a given line (§3) is mine.

**2.6 The books instructions' reg 6א exclusion** (§2(א), unfrozen books-instructions capture; rendered via note,
`[no-terms]`; `grep -c -F 'חובת תשלום מס ערך מוסף חלה על מקבל השירותים'` at `56d4c66`: 1 hit; the note cites the
reg 6א reference at `:701-702`; the brief quotes the three conditions at A(a)). Income is excluded from the books duty only
where all three hold, the third being that it is from services whose VAT the recipient pays under reg 6א. Not reached
below; recorded because it shows the same design from the income-tax side.

**2.7 Ruling (a) of 30.9** (`RULING:78-96`, repo): the honest occupation description does not put the owner among reg
13(1)'s titles and is not reworded to dodge the list (`:78-79`); "Reg 6א is unread (OP:1116-1117), so the second leg is
open." (`:84`); the wording (`:87-88`); the class guard and the עוסק מורשה outcome (`:91-96`: tax invoices lawful, Wix's
clause meetable, "periodic reports two-monthly and due even with no activity", the board re-plans, the owner is told
this outcome exists before step 2 is asked); REOPEN on an עוסק מורשה approval (`:142-144`); "Reg 6א and the exempt
dealer's report period" under "What stays open" (`:404-405`). This ruling closes that open item.

**2.8 Step 2 as written today** (repo). The occupation line, `docs/OWNER_STEPS.he.md:150`: "**פיתוח והפעלה של כלים
דיגיטליים ותוכנה ומכירת רישיונות לשימוש בהם באינטרנט; תמלוגים וחלוקת הכנסות מפלטפורמות מקוונות.**", the operating
sentence, "לבחור **עוסק פטור**. המשרד קובע את הסיווג. אם האישור אומר 'עוסק מורשה' — לכתוב לי את המילה הזאת עם 'צעד 2
בוצע'; אז המסמכים והדיווח משתנים ואני אומר לך מה". The periodic-report clause, `:160`: "הפטור מדיווח תקופתי הוא תק'
22(2) לתקנות מע"מ הכלליות (נוסח 2023 שנקרא ב-GitHub), והיא חלה על עוסק פטור בהסקה דרך §31(3)". Its English twin,
`src/revenue/owner-steps.ts:290`: "The exemption from periodic reports is reg 22(2) of the general VAT regulations (a 2023
text read on GitHub), which reaches the exempt dealer by inference through §31(3)." The step's lines, `:291`:
`["apify-actors", "il-biz-tools", "oss-bounties", "pcn874"]`. The tests pin both clauses
(`src/__tests__/revenue/owner-steps.test.ts:824-826`, `:836-838`) and assert the old wordings absent (`:819`, `:827`,
`:839`). The PDF twin `docs/OWNER_STEPS.he.pdf` (last written `8276911`, 4.10, after `d00bc66`): PyMuPDF's extraction
holds the clause (the digits come out reversed by extraction, "תק' 22(2)" as "2(22 '" and "§31(3)" as "3(31§", the
words in order), "122,833" twice and the occupation line once; "פעם בשנה" and "שעוד לא נקראו" 0 times. **The PDF matches
`:160`** (brief Part C item 15, closed).

**2.9 The venues** (notes, repo, each quoting an unfrozen `[pre-bar]` capture; nothing re-fetched).
- Indiebook (`research/measurements/indiebook.md`): the store is the merchant of record and issues the buyer's tax
  invoice, "רכישת המוצרים נעשית מול החברה והחברה היא שתפיק חשבונית מס בעבור כל עסקה, ולא הוצאות הספרים ו/או הסופרים
  עצמם" (`:145-146`); each quarter the author sends "בקשת תשלום וחשבונית מס" (`:36`); "מי שמוגדר עוסק פטור חייב לשלוח
  דרישת תשלום או קבלה כדי שנוכל להעביר לו את התשלום" (`:39`); the royalty is shown "כולל מע"מ" and the exempt payee
  divides by 1.17 (`:40`); an unregistered payee's demand carries the full name and ID number with maximum withholding
  (`:41`, `:138`); the share is UNKNOWN (`:129`); the author agreement is not published (`:15-16`). `grep -c -F` on the
  royalty-guide capture at `56d4c66`: "תמלוג" 12 hits, "דרישת תשלום או קבלה" 1; on the terms capture, "שתפיק חשבונית
  מס" 1. The store's own word for the payment is **תמלוגים**.
- Teach Simple (`research/measurements/teacher-and-ebook-stores.md`): the platform's team uploads the contributor's
  products (`:31`); the contributor is paid "Royalties", "within 30 days following the end of the applicable subscription
  term" (`:26`), a "share of 50% of their net revenue based on how important your items were to them" (`:43`); the only
  deductions are "taxes on License Fees" and Royalty Deductions (`:20`); nothing below $50 (`:25`); subscribers get, per
  downloaded Resource, a licence "on a non-exclusive," "worldwide, and revocable basis, for one single user", valid
  only while the subscription is active (`:164-167`); the contributor warrants ownership of the content (`:39`);
  governing law Washington (`:108`).

**2.10 The other lines** (repo). Parent guides: "the first sample is held unpublished. There is no upload code."
(`products/parent-guides/README.md:7`); a native listener must approve narration (`:116`); a sample, not a line
(`products/README.md:14`; `VIDEO-RULING:242`). chart-explainer "holds it unpublished" (`products/chart-explainer/README.md:5-6`);
T1 video "held by protocol" (`logs/CHANNEL_LOOP.md:139`); kids-explainers "an **experiment with no revenue target**"
(`KIDS-RULING:295-297`; `src/revenue/types.ts:31`); AdSense is one shared rail (`VIDEO-RULING:253`); "**Nothing** of
AdSense, tax forms, PIN letters or YPP. Those are stage B" (`research/faceless-youtube/T1-PROTOCOL.md:131-132`).
il-biz-tools Pro: "one-time ₪79" through Gumroad, the merchant of record (`products/il-biz-tools/README.md:35-38`); "It is
not an AI service and must never be sold as one." (`:50`); "Pro sells **one** thing: your logo and accent colour on the
printed document." (`:571`); `RULING:157` "a right, not information", `:164-165` "not a service", `:172-180` Gumroad is
the עוסק toward the buyer. oss-bounties (`src/revenue/portfolio.ts:275-337`): `category: "service"`; the operating loop
"require TypeScript / Python / docs / tests" (`:281`); the intake's stacks `["typescript", "javascript", "python",
"docs", "tests"]` (`src/revenue/bounties/intake.ts:446`) with `docs: /\b(?:docs?|documentation|readme|docstring|changelog|typo)\b/i`
(`:490`); a bounty is eligible on any one matched stack (`:654-664`, the `not-our-stack` rule fires only when none
matches). The weekly supply counter (`src/revenue/bounties/supply.ts`) does not import `scoreBounty` or `requiredStacks`
(`grep` at `56d4c66`: 0 hits), so an intake rule leaves `claimableBounties` as it is.

---

## 3. The reading of reg 6א(1) and reg 13(1)'s second limb onto each line

**3.0 The keys, stated once.** Three readings carry everything below; the first is the law's text, the other two are
inferences from it, marked.

- **K1 (text).** The VAT law sorts every transaction into a מכר or a שירות, and "שירות" is the residue, "כל עשיה
  בתמורה למען הזולת שאיננה מכר" (`:125`). "מכר" of a נכס includes "הקניית רשות לשימוש בו בתמורה, הקניית זכות בו" (`:75`),
  and "טובין" includes "זכות, טובת הנאה ונכסים בלתי מוחשיים אחרים ובין השאר – ידע" (`:45`). Reg 6א lists **services**
  ("ואלה השירותים", GEN:706 via `:1318`), and reg 13(1)'s second limb is about "מתן שירותים מהסוגים המפורטים בתקנה 6א".
- **K2 [inference from K1].** Granting a platform the right to sell or license copies of a finished work (a book's text,
  a worksheet, a feature of a document) for a royalty or a fee is the grant of a right in an intangible for
  consideration, a מכר of טובין on the words of `:75` and `:45`, and therefore not a שירות, and therefore not a service
  "מהסוגים המפורטים בתקנה 6א". The texts do not say this of royalties in so many words; the definitions say it of rights,
  and a royalty is the price of a right. No text read says the opposite.
- **K3 [inference].** Even where a colony income is a service, 6א(1)'s items name **acts performed for the recipient**:
  lecturing, teaching, training, typing, translating, "כתיבה או עריכה". Writing a text for oneself and then licensing
  it is not a writing service to the licensee, who commissioned nothing; teaching material is not teaching; a video a
  stranger watches free is no "עשיה בתמורה" toward that stranger. A documentation bounty, by contrast, **is** writing
  performed for the payer who posted it, and a translation bounty is translation for that payer.

The conservative reading, where K2 or K3 is the only thing standing between a line and reg 13(1): (i) the colony does
not build its exempt-dealer premise on either; the office decides the class from an honest description, the class guard
switches the documents if the office disagrees (`RULING:91-96`), so the owner never has to defend K2 or K3; (ii) a line
that would be a listed service under a plain reading (K3's last sentence) is not attempted at all when stopping costs
₪0; (iii) a line whose characterisation turns on an unpublished agreement reads that agreement before its first upload.

**3.1 Indiebook, ebook royalties** (§4 row 22, `logs/CHANNEL_LOOP.md:166`; candidate, order 2; not a portfolio line).
*What the money is.* The store sells the copies and invoices every buyer (`indiebook.md:145-146`); it pays the author a
quarterly share it calls תמלוגים (12 hits), against the author's own document, and it tells an עוסק פטור to send a
payment demand or receipt (`:39`). *Reading.* The colony's supply to the store is the right to sell copies of a book the
colony wrote for itself: a right in an intangible, granted for a royalty, a מכר of טובין under K2 and no "כתיבה" under
K3. The store did not commission writing; it distributes a finished work. **Reg 6א(1) and reg 13(1)'s second limb do not
reach it** [inference, K2 and K3]. The store's own routine, billing an עוסק פטור rather than self-invoicing under 6א(ד),
agrees with that reading, as one store's practice and not law (as `RULING-2026-09-29-lines.md:396` says of its fee). The
6א conditions that would otherwise matter are moot on this reading and recorded for the REOPEN: the owner is "not
salaried" (`logs/CHANNEL_LOOP.md:225`), a pension or annuity is unrecorded (brief Part C item 5); the store is a בע"מ
and would be a "עוסק" recipient. *Where it is open.* The author agreement is unpublished (`indiebook.md:15-16`). If it
framed the author's supply as a service of writing or editing performed for the store, or paid a fee per manuscript
rather than a royalty on sales, K2 fails and the line is a reg 13(1) service "ולגבי אותם שירותים בלבד". *Verdict.*
**Unchanged**, with one condition added to the admission bar (§4.1).

**3.2 Teach Simple, teacher materials** (§4 row 28, `:172`; candidate, order 3). *What the money is.* The contributor
hands finished resources to a platform that uploads them (`teacher-and-ebook-stores.md:31`), licenses each download to a
subscriber "for one single user" (`:164-167`), and pays the contributor "Royalties" as a share of net subscription
revenue (`:26`, `:43`); the platform's own deduction clause speaks of "License Fees" (`:20`). *Reading.* A licence of
intangible content through a platform, a מכר of טובין under K2. Nobody is taught or trained: "הוראה, הדרכה" are acts of
instruction toward a learner (K3), and a worksheet is a thing a teacher uses, not instruction given by the colony. Reg
13(4) (schools, group instruction to five or more, `osek-patur-documents.md:968`, `:1068`) is likewise not reached: no
instruction is given. Whether a Washington-law company is a "עוסק, מלכ"ר או מוסד כספי" for 6א (Part C item 8) is open
and moot on this reading. **Not reached** [inference, K2 and K3]. *Verdict.* **Unchanged**; the originality warranty
(`:39`; `logs/CHANNEL_LOOP.md:172`) stays the standing honesty risk, outside this row.

**3.3 The parent guides** (`products/parent-guides/`). Not a line, no upload, no income (`products/README.md:14`;
`products/parent-guides/README.md:7`; `VIDEO-RULING:242`). There is nothing for a VAT regulation to reach. If one were
ever published, the money would be AdSense, the shared rail P-3 (`VIDEO-RULING:253`): the colony's supply would be
advertising inventory to the advertising platform, a שירות under K1's residue but of no listed kind, and the viewer, who
pays nothing, receives no "עשיה בתמורה" (K3); a faceless explainer is not a lecture delivered to the payer. **Not
reached** [inference]. *Verdict.* **Unchanged**: a held demonstration; reg 6א is neither a reason to kill it nor a
reason to publish it. The brief's item "the parent guides as income" (Part C item 7) stays empty by design.

**3.4 chart-explainer, T1 video, kids-explainers.** The same reading as 3.3. Both are experiments judged by their gates,
"never counted as live" (`src/revenue/types.ts:31`; `KIDS-RULING:295-297`); AdSense is stage B and not before the board
(`T1-PROTOCOL.md:131-132`). **Not reached** [inference]. *Verdict.* **Unchanged.**

**3.5 il-biz-tools Pro** (§3, `logs/CHANNEL_LOOP.md:134`; a portfolio line, `src/revenue/portfolio.ts:223`). ₪79 for "your
logo and accent colour on the printed document" (`products/il-biz-tools/README.md:571`), through Gumroad as merchant of
record (`:35-38`; `RULING:172-180`). Under K1 the grant of a right to use a feature is a מכר ("הקניית רשות לשימוש בו
בתמורה", `:75`); and were it called a service, it is not writing, editing, lecturing, teaching, training or translation.
The consumer-law reading "not a service" (`RULING:164-165`) is **not needed and not carried over**: the question is
answered by the kinds, whichever side of the service/sale line Pro falls on (Part C item 12, closed as moot). **Not
reached** [inference]. *Verdict.* **Unchanged.** Step 3's rule that no paid product, Pro included, goes on sale before
step 2 (`docs/OWNER_STEPS.he.md:186-188`) stands.

**3.6 apify-actors, pcn874, mcp-il-tools, the T1 web arm** (§3). Software, data and a free server: no listed kind. The
first-limb titles (הנדסאי, טכנאי, מהנדס, יועץ) were ruled 30.9 and are not reopened: titles, not tasks, the office
decides (`RULING:78-82`). pcn874 builds a file; it is not "יועץ מס". **Not reached.** *Verdict.* **Unchanged.**

**3.7 oss-bounties** (§3, `logs/CHANNEL_LOOP.md:136`; portfolio line, `category: "service"`, `portfolio.ts:277`). This is
the one colony supply that is a service performed for a named payer, MISSION constraint 8's third shape (`MISSION.md`,
"Work performed on demand for a named payer", `:230`). A code bounty is software work: not a listed kind, and nothing in 6א(1)
or (2) as read names it (the elided spans are unread, §7). But the intake admits a bounty on the `docs` stack alone
(`intake.ts:446`, `:490`, `:654-664`), and a bounty whose whole deliverable is a README, a changelog, a typo fix or a
translation is, on a plain reading of K3, "כתיבה או עריכה" or "תרגום בכתב" **performed for the payer**. Whether one such
pull request makes writing the colony's "עיסוק" for reg 13(1), and whether a foreign sponsor is a 6א recipient, is not
settled by the texts [inference either way]. The conservative reading (3.0(ii)) decides: the colony does not do it, at
₪0, and the question never arises. *Verdict.* **Restructured, narrowly** (§4.7): the intake skips a bounty whose
deliverable is text only; the supply counter, which does not run through the intake, is untouched, so the board's week-4
series (`logs/CHANNEL_LOOP.md:136`) stands. Superteam (§4 row 15, `:159`), already "dev bounties" only, carries the same
exclusion at its admission.

**3.8 The rest of §4.** Every other candidate licenses or sells a made thing (games, themes, designs, watch faces,
templates, ebooks through an aggregator) or does software work; none performs a listed service for a payer. Google Play
Books (row 18) and StreetLib (row 24) are the Indiebook pattern, royalties on copies sold by a merchant of record, and
take the same reading and the same admission condition if they are ever admitted. The retired "hebrew-content" line
(`src/revenue/portfolio.ts:701-702`, under `KILLED_LINES` from `:638`) earned by advertising and affiliation, not by
writing for a payer, and is killed in any case.

**3.9 Two joined questions the brief says no file holds, answered as far as the texts allow.**
- *Reg 1(2) beside reg 13(1)* (Part C item 10) [inference]: two sides of one design. A salaried or pensioned person whose
  only business is listed services need not register at all, because every recipient pays under 6א (reg 1(2)); anyone
  else whose occupation is those services is authorised whatever the turnover (reg 13(1)). Neither leaves room for an
  **exempt** dealer whose occupation is listed services, which is exactly why the row's question matters and why the
  colony's supplies must not be those services. Neither reaches the colony: it is not a salaried provider, and its
  supplies are not listed services.
- *"ולגבי אותם שירותים בלבד" beside §55 and reg 9(א)(2)* (Part C item 9) [inference]: the texts do not say how one
  registrant is authorised for some services and exempt for the rest; §55 makes one registration for all businesses
  (`:777`) and reg 9(א)(2) forbids a split that would make a unit exempt (`osek-patur-documents.md:944`). The planning
  rule is therefore conservative: if any colony line were ever a reg 13(1) service, the colony plans the **whole**
  registration as authorised (tax invoices, two-monthly reports), which is the re-plan ruling (a) already describes. On
  this ruling no line is such a service, so the point stays academic, recorded, not decided.

---

## 4. Per line: unchanged, registered, restructured or killed, with the rule that decided it

| Line | Verdict | Decided by |
|---|---|---|
| Indiebook (§4 row 22) | **Unchanged.** One ₪0 condition joins the admission bar: before the first title is submitted, the author agreement's framing of the payment is read (a royalty on copies sold, or a fee for writing or editing performed for the store); a service framing returns the line to a sitting. The documents stay as ruled 30.9: payment demand or receipt, bank legs, never "חשבונית מס", class guard. | K2, K3 (inference); 3.0(iii) |
| Teach Simple (§4 row 28) | **Unchanged.** The same condition at admission: the contributor agreement's framing of Royalties and License Fees is read before the first upload. | K2, K3 (inference) |
| Parent guides | **Unchanged**: a held demonstration, not a line. Reg 6א is no reason to kill or to publish. | K1, K3 (inference); `products/README.md:14` |
| chart-explainer, T1 video, kids-explainers | **Unchanged.** Experiments, no revenue target; AdSense (stage B) is advertising inventory, no listed kind. | K1, K3 (inference) |
| il-biz-tools Pro | **Unchanged.** A right to use a feature, through a merchant of record; not a listed kind on any characterisation. | K1 (text), kinds |
| apify-actors, pcn874, mcp-il-tools, T1 web arm | **Unchanged.** Software, data, a free server. | kinds; `RULING:78-82` |
| oss-bounties | **Restructured at ₪0.** `scoreBounty` gains a skip rule for a bounty whose deliverable is text only (documentation, README, changelog, typo, or a translation of text, with no code stack matched). The supply counter is untouched. Superteam (row 15) inherits the exclusion at admission. | K3 (inference), 3.0(ii) |
| Google Play Books (row 18), StreetLib (row 24) | **Unchanged**, if still candidates: the Indiebook reading and condition apply at admission. | K2 (inference) |

**Registered עוסק מורשה for a service: no line.** **Killed: no line.** Nothing changes in any line's documents.

---

## 5. Step 2 as written today: confirmed

**5.1 The occupation line and the class guard** (`docs/OWNER_STEPS.he.md:150`; `owner-steps.ts:290`): **confirmed, no
change.** It describes the business as it runs, names "תמלוגים וחלוקת הכנסות מפלטפורמות מקוונות", claims no title and no
listed service, and leaves the class to the office with the one-word report "עוסק מורשה" if that is the answer. That
design is what makes K2 and K3 safe to act on: the owner never defends a characterisation; the office classifies, and
the documents follow the approval. The step's `lines` (`:291`) are unchanged: Indiebook and Teach Simple are candidates,
and oss-bounties stays a step-2 line.

**5.2 The reg 22(2) clause** (`docs/OWNER_STEPS.he.md:160`; `owner-steps.ts:290`): **confirmed, no change to either
text.** What the inference supports, on the texts read:
1. Reg 22(2) exempts from the report "עוסק זעיר הפטור ממס לפי סעיף 31(3) לחוק" (GEN:2375 via `:1340`). It identifies the
   class by the law's exemption, not by a turnover figure of its own.
2. The law deleted "עוסק זעיר" (`:89`, "(נמחקה)") and §31(3) today exempts "עסקאות של עוסק פטור" (`:484`). The class reg
   22(2) names by reference is therefore today's עוסק פטור [inference: the regulation follows the section it cites; the
   note's reading at `:1343`, which §2א of the books instructions already received the same way, `:61-64`].
3. The authority fits §67(ד), dealers "שכל עסקם בעסקאות פטורות ממס" (`:862`) [inference: which subsection is unstated,
   `:1342`].
4. Result: an עוסק פטור files no periodic report; the one yearly VAT filing in these texts is reg 15's declaration by 31
   January (MREG:390 via `:1345`; the calendar line `logs/CHANNEL_LOOP.md:193`). The 30.9 "two-monthly" fallback
   (`RULING:93-95`, `:106-107`) does not reach an exempt dealer.

What the inference does **not** support, said so the fold does not overstate it:
- Anything after about 5.6.2023 (`:1387`): no 2026 text of the general regulations is in the repo (Part C items 1 and 3).
  The clause's hedge "נוסח 2023 שנקרא ב-GitHub" and "בהסקה" stay.
- The עוסק מורשה outcome. If the approval says עוסק מורשה, reg 22(2) does not apply: reports are two-monthly (§67(א2)(1),
  `:852`) and due even with no activity (§67(ב), `:856`), as ruling (a) says; whether the runner can file them is unread
  (`RULING:95`; reg 23ג(ב)(2) via `:1349` is the one text on it). The page already says the reporting changes on that
  outcome (`:150`).
- A reg-13 dealer under the ceiling (Part C item 11): the texts do not say how §31(3) applies to a dealer who meets the
  עוסק פטור definition's words but is authorised by class. The conservative planning assumption is that such a dealer is
  fully authorised (tax invoices, periodic reports), which is the re-plan above. On this ruling no colony line puts the
  owner in that class.
- Income tax and Bituach Leumi filings: outside reg 22 entirely; the clause says nothing of them and must not be read to.

**5.3 The test block** (`owner-steps.test.ts:818-841`) pins both clauses and the absent old wordings: **unchanged.**

**5.4 The PDF** (`docs/OWNER_STEPS.he.pdf`): carries the reg 22(2) clause and the occupation line (2.8). **No regeneration
needed**; the fold regenerates it only if it edits the page, which this ruling does not ask.

**5.5 One sentence the fold adds nowhere on the owner page.** This ruling was tempted to add "חל רק כל עוד הסיווג הוא
עוסק פטור" after the clause. It does not: `:150` already says the documents and the reporting change on an עוסק מורשה
approval, and the owner page is read by the owner once; a second statement of the same condition costs reading time and
buys nothing. The hedging lives in `RULING` (a) and here.

---

## 6. Consequences

**6.1 `logs/CHANNEL_LOOP.md` §4 row 22** (`:166`): gains a dated status sentence: reg 6א(1) and reg 13(1)'s second limb do
not reach the royalty (K2, K3, inference); unchanged; the admission bar gains the agreement-framing read (§4). The
existing bar, "a named Hebrew title and the written AI answer", stands.

**6.2 §4 row 28** (`:172`): gains the same, with the Royalties and License Fees wording and the admission read.

**6.3 §6 item 5** (`:224-234`): its last sentence is stale (§8) and is replaced with the current state of step 2's
wording and this ruling's confirmation. Nothing is added to the owner-ask list: no question for the owner arises (§10).

**6.4 §8 Open Fable items** (`:292`): row 19 moves from open to done, with this file.

**6.5 §3 oss-bounties** (`:136`) and §4 row 15 (`:159`): the intake exclusion and its inheritance.

**6.6 `logs/FABLE_QUEUE.md:43`**: row 19 DONE with this path and the one-paragraph ruling.

**6.7 Code.** `src/revenue/bounties/intake.ts`: one skip rule in `scoreBounty`, with its test in
`src/__tests__/revenue/bounties-intake.test.ts`; `src/revenue/portfolio.ts:282` and `skills/revenue-oss-bounties/SKILL.md`
step 3 say so in one sentence each. `src/revenue/owner-steps.ts` and `docs/OWNER_STEPS.he.md`: **no change.**
`src/revenue/bounties/supply.ts` and `scripts/algora-supply.ts`: **no change** (the counter).

**6.8 The note** `research/measurements/osek-patur-documents.md`: its pointer drift (§8) is recorded in an appended
dated block, not by rewriting the lines, so its provenance stays readable. `RULING-2026-09-30-documents.md` is not
edited: rulings are history; its superseded lines (`:135-136`, `:406`, the step-2 ranges at `:334`) are already
superseded in writing by `osek-patur-documents.md:1381` and by this file.

**6.9 Rows 18 and 24**: if still candidates, one sentence each pointing at §3.8.

**6.10 `logs/CHECKPOINT.md`** and the tick log: the main thread's, per `CLAUDE.md`.

---

## 7. REOPEN IF

Any one of these reopens the matching part; none is a step for the owner.

1. **A text.** A text of the general VAT regulations later than 5.6.2023 shows reg 22 amended or repealed, or reg 6א's
   list changed (reopens §5.2 or §3); **or** the full text of reg 6א(א)(1)-(2), the seven elided spans
   (`osek-patur-documents.md:1319-1320`), names a service a colony line performs **for a payer** (software development,
   data processing, design, testing); **or** a text of the registration regulations later than the 10-12-2024 capture
   changes reg 13(1). The read is GitHub-first (the mirror holds nothing later; Wikisource and the Knesset only after
   their terms, `RULING:136-140`).
2. **An agreement.** Indiebook's author agreement, or its written answer to the held question
   (`research/owner-asks/questions.json:86-93`), frames the author's supply as a service of writing or editing performed
   for the store, or pays a fee per manuscript rather than a royalty on sales; the same for Teach Simple's contributor
   agreement, Google Play Books or StreetLib at admission (reopens §3.1, §3.2, §3.8 for that venue).
3. **The approval.** The registration approval returns עוסק מורשה (ruling (a)'s REOPEN, `RULING:142-144`, stands; §5.2's
   second bullet then governs the reports).
4. **A new line.** A sitting is asked to admit a line whose supply is a listed service performed for a payer: tutoring or
   teaching, translation or localisation of text, writing or editing for hire, lecturing, mediation. **This ruling bars
   admitting one without a sitting**, and that sitting rules on reg 13(1) first.
5. **The owner's fact, joined to a line.** Both of: the owner's main income is a גימלה או קיצבה, **and** a listed-service
   line exists. Then 6א's recipient-pays mechanics (6א(ד), reg 1(2), the books instructions' §2(א)(3)) apply to that
   line and the documents change. Neither alone reopens anything, and the fact is not asked (§10).
6. **A measurement.** The first Indiebook royalty statement or payment demand template names the payment as anything
   other than תמלוגים (for example שכר כתיבה or שכר סופרים); the first Teach Simple statement names it as anything other
   than Royalties or License Fees.
7. **A rendering.** A Tax Authority page on תמלוגים, זכויות יוצרים or reg 6א renders either way (gov.il is 403 from here;
   a GitHub-hosted copy counts at github grade).
8. **The counter.** If the oss-bounties intake rule is found to have moved `claimableBounties` (it must not: §3.7), the
   rule is re-sited, not dropped, and the week-4 series is read on the counter as it was.

---

## 8. Drift: what Part C lists for this row, what this ruling found at `56d4c66`, and what the fold corrects

**8.1 The brief's own list (Part C, "Row 19's pointer drift"), re-checked at `56d4c66`; all hold, and the fold handles
them as said:**
- `logs/CHANNEL_LOOP.md:234` (§6 item 5) still ends '"אונליין" and "פעם בשנה" are marked unverified.' The page has 0 hits
  for "פעם בשנה" (`grep -c -F`), and the reg 22(2) clause is at `:160`. **Corrected by the fold** (§9 item 3).
- `RULING:334` cites step 2 at `OWNER_STEPS.he.md:128-175` and its data at `owner-steps.ts:223-230`; today
  `:132-179` and `:283-304` (text `:290`). `RULING:93` cites `:149` for "צעד 2 בוצע" (now `:150` and `:153`); `RULING:104`
  and `:106` cite `:130` ("אונליין", now `:134` and `:149`; the word survives at `:151` and `:178` for Bituach Leumi) and
  `:156` ("פעם בשנה", gone; the clause is `:160`). Rulings are not edited; the fold records the current ranges in the
  tick log and §6 item 5 carries `:160`.
- The note: `:1331` cites `CHANNEL_LOOP.md:164` for Indiebook (row 22 is `:166`); `:1346` cites `OWNER_STEPS.he.md:156`
  and quotes the old clause; `:1003` and `:1037` cite `:156`; `:1072` cites `:149`; `:940`, `:1036`, `:1116` cite `:130`;
  `:908`, `:933`, `:1066`, `:1099`, `:1113` cite the occupation line at `:146`, and `:1066` quotes the old wording;
  `RULING:388`'s "tick 24" is the note's "tick 26" (`:1199`); `RULING:135-136` and `:406` are superseded by `:1381`.
  **Recorded by the fold in an appended block** (§9 item 9).
- `indiebook.md:227` cites `MISSION.md:412-413`; the sentence is at `:432-433`. Same block.
- Not moved: `FABLE_QUEUE.md:43`; `RULING:84`'s `OP:1116-1117`; the note's `:61-64`; every `MISSION.md` line the brief
  cites (`:11-12`, `:211`, `:276`, `:302-303`, `:310-311`, `:349-358`, `:432-440`, `:455-458`); `products/il-biz-tools/README.md:569-571`.

**8.2 New since the brief (e2b249c → 56d4c66), found while re-opening:**
- The brief cites the tick-41 line at `logs/CHANNEL_LOOP.md:387`; `:387` is now blank. The tick-41 text is at `:340`
  (§9, "Fixed in tick 41 (4.10): the 5.10 sitting's brief …") and `:404` (§10, "Was planned for tick 41"). The file is
  528 lines; §4 rows 22 and 28 (`:166`, `:172`), §6 item 5 (`:224-234`), §8 (`:292`), the oss-bounties row (`:136`),
  row 15 (`:159`), the calendar line (`:193`) and the schedule (`:26`) did not move.
- `logs/CHECKPOINT.md:247` (the tick-26 reg 22(2) note in the brief) is now `:286`.
- `research/channel-loop/terms-verdicts.json:181-185` and `:393-397` (indiebook.co.il, teachsimple.com, both BARRED) are
  now `:295-299` and `:615-619`; the bars at `scripts/render-watch.mjs:421-422` did not move.
- Nothing cited in `osek-patur-documents.md`, `RULING-2026-09-30-documents.md`, `owner-steps.ts`, `OWNER_STEPS.he.md`,
  `owner-steps.test.ts`, `indiebook.md`, `teacher-and-ebook-stores.md`, the READMEs or the frozen VAT law moved
  (`git diff --stat e2b249c 56d4c66` lists none of them).

**8.3 Corrections to the brief's inputs, so the fold does not re-introduce them:** the note's five-kind list (`:1330`)
omits translation, which 6א(1) and reg 13(1)'s first limb both carry (2.3); the brief's `RULING:93-95` "two-monthly" is
the עוסק מורשה outcome only (5.2); the PDF twin was unopened by the checkers and matches (2.8).

**8.4 Provenance of this file.** Its first write was committed by the main thread as `5c4bad0` ("Tick 46: the row-19
ruling …") while this decider was still re-checking its own pointers. That committed text carries eight pointers off by a
line or two (`osek-patur-documents.md:1223-1226` for `:1219`; `:1377` for `:1376`; `intake.ts:655-666` for `:654-664`;
`portfolio.ts:281` for `:282`; `RULING:138-140` for `:136-140`; `SKILL.md:38-40` for `:40-42`; §6 as `:201-262` for
`:201-263`; MISSION's third shape without its line, `:230`) and a §9 item 3 whose anchor was split across two lines and
whose text carried shell-quoting artifacts. The working tree holds the corrected text, 619 lines, and is the version to
commit and to fold from; nothing else differs (`git diff 5c4bad0 -- <this file>`: one file, 21 insertions, 20 deletions,
before this paragraph was added).

---

## 9. Fold instructions for Opus (a numbered checklist; `--dry-run` first on every `loop-edit` call)

All `logs/*.md` and `research/channel-loop/*.md` edits go through `node scripts/loop-edit.mjs` (usage in its header
`scripts/loop-edit.mjs:1-70`); a `|` inside a cell is written `\|`. Column numbers are 1-based. Text in quotes is the
text to write, verbatim.

1. **`logs/CHANNEL_LOOP.md` §4 row 22** (`:166`): `set-cell --file logs/CHANNEL_LOOP.md --row-key "22" --col 4 --append`
   with: "**5.10 (row 19, `research/channel-loop/RULING-2026-10-05-vat-services.md` §3.1, §4):** reg 6א(1) and
   registration reg 13(1)'s second limb do not reach the royalty [inference on the VAT law's definitions, frozen
   `nevo-vat-law-2026-09-29.txt:75`, `:125`]: the supply to the store is the right to sell copies of a finished book, a
   מכר of a זכות, not a service of כתיבה performed for the store; the store's own guide bills an עוסק פטור (`indiebook.md:39`).
   Unchanged. One ₪0 condition joins the admission bar: the author agreement's framing of the payment (a royalty on
   copies, or a fee for writing or editing for the store) is read before the first title is submitted; a service framing
   returns the line to a sitting (ruling §7 item 2). Step 2's occupation line already names תמלוגים."
2. **§4 row 28** (`:172`): `set-cell … --row-key "28" --col 4 --append` with: "**5.10 (row 19, ruling §3.2, §4):** reg 6א(1)
   and reg 13(1)'s second limb do not reach the subscriber-share royalty [inference]: the colony teaches and trains
   nobody; the contributor terms call the money Royalties and License Fees on a per-download licence
   (`teacher-and-ebook-stores.md:20`, `:43`, `:164-167`), a מכר of a זכות, not הוראה or הדרכה. Unchanged; the originality
   warranty stays the standing honesty risk. At admission the contributor agreement's framing is read, as for row 22."
3. **§6 item 5** (`:234`). The target is the one line that starts with the anchor below (three leading spaces; check
   with `grep -c -F` that exactly one line does). `replace-in-line --file logs/CHANNEL_LOOP.md --anchor "   recorded but not asked while its cost is unchecked."`;
   `--old` is the sentence `"אונליין" and "פעם בשנה" are marked unverified.` (once on that line); `--new` is the text
   below, passed as one argument with its quotation marks and apostrophes exactly as written here:
   "אונליין" stays unverified for the Tax Authority route (reg 2(א)(1) as read names delivery by hand or through a listed
   professional, `OWNER_STEPS.he.md:134`, `:149`; the Bituach Leumi form is a search snippet, `:151`). "פעם בשנה" is
   gone: the page names reg 15's annual declaration and reg 22(2)'s exemption from periodic reports, a 2023 text read on
   GitHub, by inference through §31(3) (`:160`). **Confirmed 5.10** (FABLE_QUEUE row 19,
   `research/channel-loop/RULING-2026-10-05-vat-services.md` §5): the clause, the occupation line and the class guard
   stand; reg 6א(1) and registration reg 13(1)'s second limb reach no colony line (§3-§4); on an עוסק מורשה approval the
   reports are two-monthly and due with no activity. No owner question arises.
4. **§8** (`:292`): two `replace-in-line` calls with `--anchor "Rows 8-18 and 23 are done"`: (a) `--old "Rows 8-18 and 23
   are done"` `--new "Rows 8-19 and 23 are done"`; (b) `--old "**Row 19 (queued tick 26)** goes to 5.10 ~07:11 (moved from
   2.10): reg 6א and registration reg 13(1)'s second limb against the writing and teaching lines (Indiebook, Teach Simple,
   the parent guides)."` `--new "**Row 19 (queued tick 26) done 5.10** (`research/channel-loop/RULING-2026-10-05-vat-services.md`):
   reg 6א(1) and reg 13(1)'s second limb reach no colony line; Indiebook and Teach Simple unchanged, one admission
   condition each; step 2 confirmed; oss-bounties' intake skips writing-only and translation-only bounties."`
5. **§3 oss-bounties** (`:136`): `set-cell … --row-key "oss-bounties (Algora)" --col 5 --append` with: "**5.10 (row 19,
   ruling §3.7):** the intake skips a bounty whose deliverable is text only (`scoreBounty` rule
   `writing-or-translation-only`: documentation, README, changelog, typo or a translation, with no code stack matched);
   the supply counter does not run through the intake, so the week-4 series stands."
6. **§4 row 15** (`:159`): `set-cell … --row-key "15" --col 4 --append` with: "**5.10 (row 19, ruling §3.7):** at
   admission, content, writing and translation bounties are excluded as for oss-bounties; `type=bounty` dev work only."
   **Rows 18 and 24** (if still candidates): `--append` "**5.10 (row 19, ruling §3.8):** the Indiebook reading applies
   (royalties on copies sold by the merchant of record are a מכר of a זכות, not a כתיבה service [inference]); the
   agreement's framing is read at admission."
7. **`logs/FABLE_QUEUE.md` row 19** (`:43`): `set-status --row 19 --text` with: "**DONE 5.10** (07:11 sitting, first
   Fable agent beside row 20): `research/channel-loop/RULING-2026-10-05-vat-services.md`. Reg 6א(1) and registration reg
   13(1)'s second limb reach no colony line [inference on the VAT law's own definitions of מכר and שירות]: Indiebook and
   Teach Simple unchanged, each with one ₪0 admission condition (the agreement's framing of the payment is read before
   the first upload); parent guides, T1, kids-explainers, Pro, apify-actors, pcn874 unchanged; oss-bounties restructured
   at ₪0 (the intake skips writing-only and translation-only bounties; the counter untouched). Step 2 confirmed: the
   occupation line, the class guard and the reg 22(2) clause stand, hedged as inference; the PDF matches. §6 item 5
   corrected. No owner question." (The default prepends "<text> Was: " to the status cell, as row 18's was done.)
8. **Code, with tests.** (a) `src/revenue/bounties/intake.ts`, in `scoreBounty` after step 8 ("Our stack", `:654-664`):
   compute `codeStacks = stacks ∩ {"typescript","javascript","python"}`; add a constant
   `TRANSLATION_PATTERN = /\b(?:translat(?:e|ion|ing)|localis(?:e|ation)|localiz(?:e|ation))\b/i` tested against the
   same `haystack` and label text; when `codeStacks` is empty **and** (`stacks` includes `"docs"` **or**
   `TRANSLATION_PATTERN` matches), push `{ rule: "writing-or-translation-only", detail: "The deliverable is text only
   (documentation, README, changelog, typo or a translation) with no code stack matched. Writing, editing and translation
   performed for a payer are the kinds reg 6א(1) of the VAT regulations names, and registration reg 13(1)'s second limb
   registers a dealer whose occupation is those services as עוסק מורשה; the colony does not attempt them
   (RULING-2026-10-05-vat-services.md §3.7, §4)." }`. `requiredStacks` and the `not-our-stack` rule are unchanged.
   (b) `src/__tests__/revenue/bounties-intake.test.ts`: four cases: a README-typo bounty with no code stack → not
   eligible, skipped with `writing-or-translation-only`; "translate the docs into Spanish" → the same; a TypeScript bug
   whose text also says "update the docs" → eligible as before, no such skip; a tests-only bounty → unchanged. (c) A guard
   test, in the same file or `bounties-supply.test.ts`: `src/revenue/bounties/supply.ts` and `scripts/algora-supply.ts`
   contain neither `scoreBounty` nor `requiredStacks` (read the files; a string assertion), so the rule cannot move the
   counter. (d) `src/revenue/portfolio.ts:282`: append one sentence to the "Filter before attempting" item, keeping the
   existing text intact: "A bounty whose deliverable is text only (documentation, README, changelog, typo, translation) is
   skipped, not attempted (ruling 5.10, FABLE_QUEUE row 19: writing, editing and translation for a payer are reg 6א(1)
   kinds, and the exempt-dealer premise of step 2 must not rest on them)." (e) `skills/revenue-oss-bounties/SKILL.md` step
   3 (`:40-42`): one sentence naming the rule. Run `scripts/verify.sh src/__tests__/revenue` before the push.
9. **`research/measurements/osek-patur-documents.md`**: append after the file's last line (`:1412`) a block headed
   "**Pointer drift recorded 5.10 (row 19 fold; lines above are not rewritten).**" listing §8.1's note items with old →
   new (`:1331` CHANNEL_LOOP `:164` → `:166`; `:1346`, `:1003`, `:1037` OWNER_STEPS `:156` → `:160`, wording now reg 22(2);
   `:1072` `:149` → `:150`/`:153`; `:940`, `:1036`, `:1116` `:130` → `:134`/`:149`; `:908`, `:933`, `:1066`, `:1099`,
   `:1113` occupation line → `:150`, wording changed; `:1199` is the section `RULING:388` calls "tick 24"), and the line
   "The row-19 ruling (`research/channel-loop/RULING-2026-10-05-vat-services.md`) reads §2's reg 6א and reg 22(2)
   findings: confirmed; translation added to the §2 list of kinds at `:1330`." Also append to `indiebook.md`'s end:
   "Pointer drift recorded 5.10: `:227` `MISSION.md:412-413` → `:432-433`." Hand edits (these files are outside
   `loop-edit`'s targets); `git diff` must show additions only.
10. **Guards after the edits:** `node scripts/freeze-capture.mjs --cited` stays at 0 (this ruling cites only the frozen
    VAT law by line; the fold's new cell text cites `nevo-vat-law-2026-09-29.txt:75`, `:125`, frozen); the owner-steps
    tests pass unchanged (`npx vitest run src/__tests__/revenue/owner-steps.test.ts`); `scripts/verify.sh`.
11. **Not to do:** no edit to `docs/OWNER_STEPS.he.md`, `src/revenue/owner-steps.ts` or the PDF; no edit to any ruling
    file; no new owner step; no `questions.json` entry; no change to `supply.ts`, `algora-supply.ts` or
    `requiredStacks`; no re-fetch of any indiebook.co.il or teachsimple.com page.
12. **The log and the checkpoint** per `CLAUDE.md`: `logs/2026-10-05-<slug>.md` in Hebrew with the eight sections, and
    `logs/CHECKPOINT.md` (main thread only).

---

## 10. Open items only the owner can settle

**None is asked now.** The one owner fact the texts make relevant, whether the owner's main income is a גימלה או קיצבה
(reg 6א's "ממי שעיקר הכנסתו ממשכורת, גימלה או קיצבה"; "not salaried" is recorded, `logs/CHANNEL_LOOP.md:225`), matters
only if a listed-service line exists, and on this ruling none does. It is therefore **not** added to §6: a question the
colony cannot act on is noise in the owner's one list. If REOPEN 4 or 5 fires, the admitting sitting words it as one
optional yes/no, asked only with step 2 itself, in the shape §6 item 5 already uses for the Bituach Leumi question:
"האם עיקר ההכנסה שלך היום הוא ממשכורת, גימלה או קיצבה? כן/לא" — and never as a step.

**What stays open, for the record, needing no one:** the seven elided spans of reg 6א(א)(1)-(2) and any text after
5.6.2023 (REOPEN 1); Indiebook's author agreement and share (REOPEN 2, Part C item 14); how §31(3) applies to a reg-13
dealer under the ceiling (Part C item 11, academic on this ruling); whether the runner can file a periodic report on the
עוסק מורשה outcome (Part C item 13, `RULING:95`; only reg 23ג(ב)(2) bears on it); whether a foreign platform is a 6א
recipient (Part C item 8, moot on this ruling).
