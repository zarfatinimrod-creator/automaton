# Ruling of the documents decider, 30.9.2026 — `logs/FABLE_QUEUE.md` row 17

**Sitting.** The 30.9.2026 Fable sitting, second of two agents (the first rules row 16 in parallel and writes
`RULING-video-channels.md`). Model Fable 5.1, one decider, no subagents, no web. Read: `SITTING-2026-09-30-BRIEF.md`
lines 1-92, Part B (`:367-597`) and Part C (`:597-640`); `FABLE_QUEUE.md:41`; `MISSION.md`; `RULING-2026-09-29-lines.md`
((e)3 of the loop ruling and (h) are what this builds on); the two notes and the code the brief points into. Every pointer
relied on below was reopened with `sed -n` or `grep -n -F` on the tree at `46c79f8` (`claude/new-session-j071dx`, clean).
Where the brief's paraphrase and a file differ, the file is cited.

**Grades** as the brief defines them: `rendered`, `github`, `snippet`, `repo`, `inference`, `none`. Provenance marks are
kept: every Gumroad capture is `[against-bar]`, every nevo law page `[no-terms]`.

**Row 16(d) is ruled in parallel.** Nothing here waits for it. Each item that rests on a Gumroad or nevo capture says
what it becomes under (i) captures readable for our own compliance questions, and (ii) captures retired.

**Constraints applied to everything prescribed.** ₪0 (fees out of a sale allowed, `MISSION.md:359-360`, repo); no account
in the owner's name, nothing public carrying it (`:276-279`, `:310-312`); no camera step; one-time identity and payout
steps only, no per-item owner action, no owner conversation (`:411-420`; `logs/CHANNEL_LOOP.md:76`; KILL-4,
`BOARD-LOOP.md:67`); no ToS violation, no fetch of a barred site; honest value, AI use declared; never an invented step
(`MISSION.md:416`). The owner is "the owner".

---

## (a) Does loop ruling (e)3 survive §18ב? The GitHub-secret key, a certified signature, or KILL-4

**RULING.** (e)3 survives, narrowed and conditional. **The REOPEN clause does not fire**: no text read says the עוסק must
personally sign or issue each document, and the one text on point says the opposite. Y8, Wix and Indiebook stay queued.
The **certified (approved) signature route is rejected**. The **secured-signature route with a key the runner holds is the
only ₪0, zero-minute route the texts leave open, and it is not cleared**: it rests on one legal characterisation no text
makes. Until the one check below settles it, **no payee-billing document is produced or sent** (already (e)3's rule,
`RULING-2026-09-29-loop.md:299-300`). Seven ₪0 guards and wording changes are adopted now regardless of the route.

**GROUNDS.**
1. *The signature is the preparer's, not the taxpayer's.* A computerised document is signed "בחתימה אלקטרונית מאושרת או
   בחתימה אלקטרונית מאובטחת, של עורך התיעוד" (`research/rendered/nevo-books-instructions.txt:1207`, rendered `[no-terms]`).
   The amendment history prints the 2003 change: "של הנישום" struck, "של עורך התיעוד" inserted (`:1219-1221`). Internal
   records are those made "על-ידי הנישום, או מטעמו" (`:1187`). VAT §117(א1) charges an agent who records a receipt on the
   dealer's behalf and the dealer only if he took no reasonable means (`nevo-vat-law.txt:1569`, rendered; OP:788-790) —
   it allocates liability for documents made by others; it does not bar them. So the REOPEN's premise, "the עוסק must
   personally sign", is contradicted by the text, not merely unshown.
2. *The approved route fails the constraints twice.* A certificate is issued to a named person with an ID number by a
   registered certifying authority (`nevo-electronic-signature-law.txt:300`, `:311`, rendered). Its price is unrendered
   and the ₪0 rule buys nothing (`MISSION.md:352-354`). And a certificate bound to the owner's own signing means is
   either used by the owner per document (KILL-4) or handed to the runner, which is the sole-control question in a worse
   form. Rejected as a route; it is not an owner ask.
3. *The secured route's one open characterisation.* A secured signature must be "הופקה באמצעי חתימה הניתן לשליטתו הבלעדית
   של בעל אמצעי החתימה" (`R-ESIG:31`); the means may be "תוכנה, חפץ או מידע ייחודיים" (`:11`); the holder is "מי שהופק לו"
   (`:13`); the holder must prevent use "בלא הרשאתו" (`:104`). The words admit a key generated for the owner and used
   under the owner's standing authorisation by the company's operator; they equally admit that a key readable by the
   platform is not under "sole" control. OP's verdict stands: "not settled by the text" (OP:401-420). No practice of the
   Tax Authority was read (OP:185). [inference] Two facts narrow the risk and are made conditions: a GitHub
   *environment* secret is readable only by workflows on `main` in that environment, and after step 7 the only
   administrator is the owner; the key is generated for the owner, recorded as theirs, and revocable by them alone.
4. *The "second hurdle" is weak on the text.* The VAT law's narrowed definition, "ובלבד שהונפקה על ידי המדינה או על ידי מי
   שהמדינה הסמיכה לכך, בהתאם להוראות לפי סעיף 145(א1)" (`nevo-vat-law.txt:37`), is used nowhere else in the rendered law:
   §67ב's online filing uses only "מסר אלקטרוני" (`:892`) and deems online filings signed (`:908`); §145(א1) only empowers
   instructions (`:1783`). The instructions carry their own unnarrowed definition (`R-BK:1221`) and are made under the
   Income Tax Ordinance (`:1104`); reg 1 applies them to VAT "בשינויים המחוייבים" (`nevo-vat-bookkeeping-regs.txt:106`).
   OP:812-813 reaches the same reading. The hurdle stays a noted risk, not a bar, and its check is part of the one check.
5. *Reg 1 reaches the owner* (reg 15א is the occasional-deal registrant, `nevo-vat-registration-regs.txt:176`), so this is
   one question for both taxes (OP:1050-1053). *Reg 12 is repealed* (`nevo-vat-bookkeeping-regs.txt:455`, `:582-586`), so
   the receipt-on-request premise of ticks 17-18 is dropped, as the queue says (`FABLE_QUEUE.md:41`).
6. *Two documents per payout.* §45: "עוסק חייב להוציא לקונה חשבונית עסקה על כל עסקה … גם אם הם פטורים ממס"
   (`nevo-vat-law.txt:656`); reg 2(א)(3) reads the instructions' "חשבונית" as "חשבונית עסקה" (`R-VATR:120`); §18ב(א)(1)-(2)
   sends both the receipt voucher and the §9(א) invoice by computer (`R-BK:2233-2235`). §9(א)'s fields add the customer's
   address ("היה מענו … ידוע לנישום - אין חובה לציינו") and "תיאור השירות" (`R-BK:1834-1839`). (e)3 condition 3's list
   grows by those two; nothing in it is per-item owner work. [inference, as OP:794-803]
7. *The payment-channel limit fits the bank legs only.* §18ב(ד) allows the secured route only for card, crossed cheque or
   "העברה ישירה מחשבון הבנק של הלקוח לזכות חשבון הבנק של הנישום" (`R-BK:2241-2244`). Wix pays by wire
   (`wix-partner-agreement-body.txt:385`, rendered); Indiebook by Israeli bank transfer (`CHANNEL_LOOP.md:163`); Y8's
   PayPal leg ($100 minimum) is outside, its bank leg ($500 minimum) inside (`:155`). [clerk inference, confirmed]
8. *The ₪0 guard against §50(א).* An exempt dealer's document is never titled "חשבונית מס" or "Tax Invoice" and never
   carries "עוסק מורשה" (reg 9א's heading is the authorised dealer's, `R-VATR:179`); §50(א) charges double tax on "מסמך
   הנחזה כחשבונית מס" (`R-VAT:739`), §117(א)(5) a year (`:1541`). The existing generator offers only קבלה, חשבונית עסקה
   and the pair (`products/il-biz-tools/src/lib/invoice.js:4-8`, repo); no runner payout generator exists yet (clerk grep,
   confirmed: `grep -rl "חשבונית עסקה" src/ scripts/` finds none).

**Reg 13 (the exempt-dealer premise of step 2).** RULING: the honest occupation description does **not** put the owner
among reg 13(1)'s listed classes on the text, and the step is not reworded to dodge the list. Grounds: 13(1) lists titles —
"אגרונום, אדריכל, הנדסאי, חוקר פרטי, טוען רבני, טכנאי, … יועץ לארגון, יועץ לניהול, … מהנדס, …" — plus reg 6א services
(`nevo-vat-registration-regs.txt:135`, rendered `[no-terms]`); "software development and the sale of digital tools" is
an activity, not one of those titles, and the three nearest words (הנדסאי, טכנאי, מהנדס) are professional titles the
description does not claim. Whether the owner personally holds such a title is the owner's fact, not the colony's to
state or to steer. Reg 6א is unread (OP:1116-1117), so the second leg is open. The wording step 2 should carry, in the
occupation field, describing what the business is and how it is run:

> **פיתוח והפעלה של כלים דיגיטליים ותוכנה ומכירת רישיונות לשימוש בהם באינטרנט; תמלוגים וחלוקת הכנסות מפלטפורמות
> מקוונות. הפעילות מבוצעת על ידי מערכת אוטומטית (סוכני AI) מטעם העסק.**

(the first sentence is the occupation line; the second is said if the form or the clerk asks how the business operates).
The office decides the class ("אישור על רישומו ועל סיווגו", §53(ב), `nevo-vat-law.txt:771`, per OP:1069). The ₪0 class
guard is adopted: no payout document is generated until the class from the approval is recorded in state, the generator's
dealer-type switch keys on it, and the owner reports the class in one word with "צעד 2 בוצע" (`docs/OWNER_STEPS.he.md:149`).
If the approval says עוסק מורשה: tax invoices become lawful, Wix's clause meetable, periodic reports two-monthly and due
even with no activity (`nevo-vat-law.txt:852`, `:856`) — recurring paperwork whose KILL-4 status turns on whether the
runner can file it (unread); the board re-plans then, and the owner is told this outcome exists before step 2 is asked.

**Reg 15 (the annual declaration).** RULING: one owner filing a year, by 31 January (`nevo-vat-registration-regs.txt:173`,
rendered), attaches to the עוסק פטור status itself, not to any venue; it is not KILL-4 and it is disclosed in step 2's
text, not invented (the mandate forbids inventing steps, not naming the law's). The runner computes the figure from the
ledger and drafts the form; who may deliver it is not stated in the text (OP:1076). A January line joins the tick's
measurement calendar.

**Step 2's wording is corrected, not asserted.** "אונליין" (`OWNER_STEPS.he.md:130`) is not in reg 2(א)(1), which names
delivery "ביד אישית" or through a listed professional (`R-REG:43`); the page says the online channel is unverified. "דיווח
**פעם בשנה**" (`:156`) is rendered only for reg 15; on the law alone the report period is two-monthly unless the Minister
exempted the class (`R-VAT:852`, `:862`), and that instrument sits in the unread general regulations; the page says so.

**The one-time notice.** §18ב(ב)'s registered-mail notice to the assessing officer before the first computerised document
(`R-BK:2239`), and per reg 2(א)(2) to the VAT Director as well (`R-VATR:119`; OP:818-820), is one-time paperwork and joins
step 2's section — **recorded, not asked**, until the registered-mail rate is read from Israel Post's own page (the ₪0
rule: no step that costs anything is asked before its cost is checked, `MISSION.md:356-357`; that page is a render line
subject to the terms rule, `CHANNEL_LOOP.md:284`). The payer's consent (§18ב(ג), `R-BK:2240`) is one written yes per payer
from the brand mailbox and rides each venue's held questions.

**Wix.** (e)3's sentence "a cost decision for the owner" (`RULING-2026-09-29-loop.md:295`) and the held question's `when`
(`research/owner-asks/questions.json:45`) are **reworded**: on the text a dealer under the ceiling cannot elect authorised
status (reg 11 excludes the §31(3) dealer, `R-REG:123`; §58 is discretionary and its reach doubtful, `R-VAT:785`, `:91`),
so a written no leads to incorporating, a long-shot §58 letter, or Wix out (OP:1054-1062). The held question itself is
reworded around the lawful document: a §45 transaction invoice plus a receipt, computer-sent, with Wix's consent to
receive computerised documents (the "receipt in place of a tax invoice" wording rests on the repealed reg 12).

**THE ONE CHECK (settles the route).** Whether instructions under VAT §145(א1) exist and what they require, read from a
terms-clean source: a `grep` of the lawsofisrael mirror's nevo listings (`2023-03-06/israel/listing/*.html` at `aeca0b25`,
github, read under GitHub's research condition, `TERMS-AUDIT-2026-09-29.md:25`) for "חתימה אלקטרונית" under מס ערך מוסף,
and the general VAT regulations (nevo 271_005, `listing/page_028.html:921`) for anything on computerised documents. If
no such instruction exists (as of 2023), the narrowed definition has no operative content for an exempt dealer's documents
and grounds 3-4 decide: the secured route is adopted under the conditions in ground 3, the first document goes out after
step 2 and the notices, and the first payer's written acceptance is the recorded check. If such instructions exist and
make the state the only issuer, the secured route is closed for the VAT-side document, no ₪0 route remains, and Y8, Wix
and Indiebook are killed under KILL-4 together — the REOPEN as written.

**Under 16(d).** (i) as above. (ii) The books instructions, the VAT law, the VAT bookkeeping regulations and the
e-signature law all exist in the mirror at github grade (OP:38-42, text as of 6.3.2023; the books instructions have no
amendment after 2019, OP:49-50), so grounds 1-8 stand at github grade. **The registration regulations (reg 13, reg 15,
reg 2(א)(1), reg 11) have no github twin in the notes** — the mirror lists their URL (OP:781) but no file of them was
read from it. Under (ii) those three paragraphs become conditional on a terms-clean text (the mirror, if it holds the
file; else Wikisource after its Robot and User-Agent policies are read and an identifying User-Agent set, OP:1163-1181;
else the Knesset gazette after its terms, `TERMS-AUDIT-2026-09-29.md:275`), and step 2's wording changes are made on the
safe side meanwhile (say "unverified", never assert online or annual).

**REOPEN IF.** The one check finds state-only issuance (KILL-4, above); a payer refuses a software-issued document in
writing (kept from (e)3); the registration approval returns עוסק מורשה (re-plan, above); Tax Authority practice on a
runner-held key is rendered either way.

---

## (b) 14ג(ד), 14ה, 14ט; what the ₪79 key is; who the עוסק is

**RULING (h) confirmed on the rendered text, and strengthened.** 14ג(ד)(3) excludes "מידע כהגדרתו בחוק המחשבים"
(`nevo-consumer-protection-law-70305.txt:718`, rendered `[no-terms]`, stamped 02-08-2026); the asset clock runs "עד ארבעה
עשר ימים מיום קבלת הנכס או מיום קבלת המסמך … לפי המאוחר" (`:708`); the fee cap is 5% or ₪100, the lower (`:797`), ₪3.95 on
₪79 (RL:388), nothing for a defect (14ה(א), `:789-791`). (h)'s window of at least 14 days with no fee, Gumroad's 30-day default as
it stands, complies. REOPEN (i) of (h) is now resolved in the direction "grants a right": **the window may not be
shortened below 14 days, and "no refunds" is unlawful on this ruling's reading, not merely unshown.**

**What the ₪79 purchase is: a right, not information.** RULING: the buyer buys a licence — the entitlement to the logo and
accent colour on the printed document (`products/il-biz-tools/README.md:567`, `invoice.html:242-243`, repo) — evidenced
by a key string. Grounds: (1) the key's worth is nil apart from Gumroad's licence record: the browser verifies the key
against Gumroad and branding switches off when Gumroad reports a refund or dispute (`invoice.html:171-173`, repo), so what
is paid for is the record, not the characters; (2) "נכס" expressly includes "זכויות" (`R-CPL:39`), so a licence is an asset
under 14ג(ג)(1) with the clock at `:708`; (3) the Computers Law groups "סיסמה, קוד גישה או מידע דומה" only inside a
criminal provision on distributing access codes for unlawful acts (`nevo-computers-law.txt:61`) — it does not characterise
a purchase; (4) it is not "תוכנה" — the software is free and is not delivered by the sale — and not a service: nothing is
performed over time, so no "עסקה מתמשכת" (`R-CPL:467`) and 14ג(ג)(2) does not apply; (5) not item (4): a serial key is not
"טובין שיוצרו במיוחד בעבור הצרכן" (`:720`) — "טובין" is the wrong noun for a right and a per-sale serial is not manufacture.
Consequence: the statutory cancellation right exists for Pro; the seller's contractual 30 days from purchase and the
statutory 14 days from the later of the key's receipt and the 14ג(ב) document coexist; the window is measured from the
sale (`gumroad-pro-product.js:658`), which is the longer of the two whenever the 14ג(ב) particulars reach the buyer
with the key — hence fold action 9.

**Who the עוסק is.** RULING: for the distance-sale provisions (14ג, 14ה, 14ט) the עוסק toward the buyer is **Gumroad, the
merchant of record**; the owner is the licensor and "יצרן". Grounds: Gumroad is "the merchant of record for the resale of
your Products to the Buyers", and the supplier "shall not issue any invoice or make any demand for payment to any Buyer"
(`research/rendered/gumroad-terms.txt:131`, rendered `[against-bar]`); Gumroad "will be treated as the seller" for indirect
tax (`:148`); the buyer pays Gumroad, gets Gumroad's receipt and Gumroad's refund, and Gumroad refunds by the stated
policy on the seller's behalf (RL:1541). The licence runs "by you through Gumroad to the relevant Buyer" (`:163`) — that is
the delivery of the asset, not a second sale. The mandate's own reading is the same: "A merchant of record helps — Paddle
appears as the seller to the buyer" (`MISSION.md:299-301`). "כולל יצרן" (`R-CPL:41`) makes the owner an עוסק in general;
14ט's duties attach to "העוסק" in the cancelable "עסקה", the seller. **The characterisation is the ruling's, not a text's**,
and its stakes are the identity rule: 14ג(א)(1) requires "השם, מספר הזהות והכתובת של העוסק" in the distance marketing
itself (`R-CPL:676-678`) and in the 14ג(ב) document (`:692-698`). On the other reading the owner's name, ID number and address
belong on the Pro page and receipt — a mandate collision, not a wording fix. Therefore: **the owner does everything the
other reading would require that costs ₪0 and carries no owner identifier**, and nothing that would.

**14ט, applied.** It reaches a right to cancel "לפי חוק זה או לפי חוזה" (`R-CPL:857`), so Gumroad's stated policy is
inside it. What the owner adds on the surfaces it controls (14ט(ב), (ד), (ה)(2); RL:1532-1537):
- a dedicated, prominent link on the home page through which a cancellation notice is sent (`:871`): a `mailto:` to the
  brand mailbox with the subject pre-filled "ביטול עסקה – Pro" — the same address the accessibility statement already
  publishes, so nothing new becomes public; the site is static, so a form is not ₪0-buildable that reaches the responder;
- beside it, in writing, the ways to cancel (email — this address or a reply to the Gumroad receipt), the details a notice
  must carry per 14ט(ג) (name and ID number), and that the refund is issued through Gumroad in the currency charged;
- the refund policy's fine print (`PUT /v2/refund_policy`, github grade, RL:1532-1534), which rides Gumroad's receipt,
  carries the same Hebrew sentences plus the 14ג(ב)(3) line ("how to exercise the right"); whether that meets 14ט(ה)(1)
  "בחשבונית, בקבלה או בהודעת תשלום" (`:879`) is open, and it is the most the owner can do under `:131`.
- No owner receipt or invoice for Pro sales (barred by `:131`); the buyer's invoice names "Gumroad, Inc." as supplier
  (github, via RL:1535). **Reconciled with `MISSION.md:302-303`** ("an invoice issued to an Israeli customer must name the
  עוסק"): no owner-issued invoice exists for Pro, so nothing public carries the owner's name; the law's name duty attaches
  to the עוסק's own invoice, which on this ruling is Gumroad's. The payee-billing documents of (a) go to a platform's
  finance address, not to the public, and name the עוסק as (e)3 condition 3 already requires.
- The responder never demands or stores the 14ט(ג) details: it matches a verified sender to a sale (`scripts/brand_mail.py:
  53-70`), logs no body, and the disclosure only tells buyers what the law asks of them.
- **Residual, recorded:** on the "owner is עוסק" reading 14ט(א)(1)-(2) would also want a phone and a postal route. A
  phone route is an owner conversation (never built, KILL-4); a postal route means publishing an address, which exists
  only after step 2 and is an identity decision. Neither is built or asked.

**Under 16(d).** (i) as above. (ii) Every Gumroad clause cited has a github twin in Gumroad's own source (`terms.html.erb`,
the article partials, RL:50-56; RL:T7 confirms the tick-17 github quotes verbatim), and Gumroad's API is outside the
pause (`CHANNEL_LOOP.md:284`) for the policy in force. The CPL and the Computers Law are in the mirror at github grade
(RL:57-66; 14ג(ד)(1)-(5) unchanged since, per the queue) — whether the mirror's 03.10.2022 CPL already carries 14ט is
unverified and is one grep on the pinned blob. The ruling holds at github grade either way.

**REOPEN IF.** A consumer, a court or the Consumer Protection Authority treats the licensor as the עוסק of a
merchant-of-record sale (then the choice is the owner's identity on the page or the line — a board decision, likely a
kill); Gumroad's receipt renders without the fine print; a determination under 14ג(ה) (`R-CPL:724`) is rendered.

---

## (c) The page-view reader's three calls, and `POSTHOG_READ_KEY`

**Call 1 — a backfilled gap clears the fault without a clock restart: CONFIRMED, with one rename.** The floors ruling
defines M-instrument by writes made by D0+21 (`RULING-2026-09-28-floors.md:221-222`); KILL-1's "instrument fault is fixed
and the clock restarted" (`BOARD-LOOP.md:64`) is about the instrument — the counter on the site and PostHog's store. A
reader that stops does not alter the measurement: PostHog keeps the events and a late read of a week is the same count
(`logs/2026-09-29-pageview-kpi-reader-fixes.md:67-70`; `src/revenue/page-views.ts:47-51`). Restarting would discard a
valid 56-day measurement. The related choices stand: row date = write time (watchdog liveness, `:59-61`), one day of
grace (`:65-66`, `page-views.ts:106`), a measured kill outranks a later gap (`:71-72`, `page-views.ts:416-424`). **But the
code returns the same verdict name, `instrument_fault`, for both** (`page-views.ts:400-403`, `:424`, `:446`), while only
the deadline miss restarts (`:409-413`); an auditor applying KILL-1 to the word would restart on a gap. The gap verdict is
renamed `reader_down` (a blocker, never a restart); `instrument_fault` keeps the deadline miss and "a week that cannot be
read at all". Wording only; behaviour unchanged.

**Call 2 — the M-instrument deadline is 00:00 UTC of day 21: CONFIRMED.** "By D0+21" is a day boundary; the read lag is our
choice (`page-views.ts:100-101`) and cannot extend a pre-registered deadline; with D0-anchored weeks, weeks 1-2 are written
by D0+14¼ with 6¾ days to spare, and the deadline and the moment the fault appears coincide (`fixes.md:62-64`). Code:
`instrumentByDay: 21` (`page-views.ts:282-283`), `deadlineMs` (`:396`).

**Call 3 — at D0+112 the "same read" is weeks 9-16: CONFIRMED; and the hole is filled.** The floors read is "total over the
56 days below 5 → pause; ≥100 a week averaged over weeks 5-8 → pass; between → one extension to D0+112, same read, same two
outcomes; there is no second extension" (`floors.md:223-228`). A "same read" on an extension is the same measurement on the
extension's own 56 days, so weeks 9-16 with the average over 13-16 (`page-views.ts:450-456`). The builder invented no
outcome for a second "between" and returns `extension_exhausted` for the board (`logs/2026-09-29-pageview-kpi-reader.md:65-
68`; `page-views.ts:457`). RULING: **a second "between" is `pause`**, the non-pass outcome, with the reading attached — the
line did not reach its own bar (`portfolio.ts:115`) in the one extension it gets; the paid-tier steps (2, 3, 6b) are not
asked on its account; it re-enters `measuring` at the domain deploy exactly as the under-5 pause does (`floors.md:224-226`).
"Same two outcomes" is read as: after the extension the read resolves to one of the two, and not passing is the pause.
`extension_exhausted` leaves the union; the reader keeps reading the netlify period as diagnostics (PUBLISH-10).

**Call 4 — `POSTHOG_READ_KEY` joins step 6: YES, one row, on one condition.** It is not an invented step: the pre-registered
M-reach read is the only thing that can ever ask the owner for the paid tier's steps (`floors.md:223-227`), the reader is
"a strict no-op" without the key (`CHANNEL_LOOP.md:132`; `page-views-reader.ts:8-12`, `:305`), and the board already
listed "the PostHog key" as minute-after prep (`BOARD-LOOP.md:17`) and assigned the PostHog project to agent work through
the connector attached to the session (`research/colony-sweep/BOARD.md:281`; `BOARD-LOOP.md:97`). Pasting a secret needs a
repository administrator, and no GitHub tool available to the colony writes secrets (the `github` connector lists none;
Actions' `GITHUB_TOKEN` cannot), so the paste is the owner's click in any case; minting the key in the same account's
settings is one more click in the same sitting, so the row reads like `GUMROAD_ACCESS_TOKEN`'s and `APIFY_TOKEN`'s
(`OWNER_STEPS.he.md:372-376`): create a personal API key with the query-read scope only, paste as `POSTHOG_READ_KEY`.
**Condition:** the project and the query API stay on PostHog's free tier — the board declared the instrument ₪0
(`BOARD.md:73`, `:281`) but no pricing page is rendered (grade none here); if a query key needs a paid plan, the row is not
asked and the reader stays a no-op. Order: the agent creates the project through the connector first (cookieless, brand
name, no PII — `BOARD-LOOP.md:97`) and writes `projectKey` and `projectId` into `site.json`; only then is the row asked, so
the owner is never asked for a key to a project that does not exist. Alternative rejected for now: reading page views from
a scheduled session through the connector — unscheduled in CI terms and not auditable from the repo.

**Under 16(d).** Nothing in (c) rests on a capture.

**REOPEN IF.** PostHog's query API turns out to need a paid plan (the row is withdrawn); a pause under call 3 is followed
by a domain deploy (the clock restarts there by PUBLISH-10, nothing else to rule).

---

## (d) The refund responder: the reserve, the dashboard-only line, the mailbox, the balance

**RULING.** The responder **stays**, automatic, on its schedule; it gains a **holding reply and a retry by sale id** for a
refund Gumroad refuses for balance; the refund rate becomes a **measured KPI**, never a reason to refuse a refund; the
Support-email guard is an **instruction in step 3**; sales do not wait.

**The reserve (rendered `[against-bar]`).** Above a 15% refund rate Gumroad may hold 25% of funds for 90 days rolling; above
25% the account "may be suspended" (`gumroad-terms.txt:264`). At low volume one refund in six is 16.7% (clerk arithmetic).
Grounds for staying: the buyer's right exists whatever we do — contractual, and on (b) statutory — and Gumroad itself
refunds by the stated policy on the seller's behalf (RL:1541), so refusing changes nothing but the breach; the dashboard
alternative is a per-item owner action (`CHANNEL_LOOP.md:76`); "wait" leaves 14ה(ב)(1)'s 14 days (`R-CPL:797`) to run out.
The reserve is a cash-timing risk at ₪0 cost; suspension is KILL-3 territory (`BOARD-LOOP.md:66`) on an actual platform
action. So the rate is *read*: refunded sales over sales in the trailing 90 days, from `GET /v2/sales` (`refunded`), written
as a KPI beside the sales the Gumroad connector already books; at or above 15% it is a reading for the board about the
offer or the copy, with the numbers.

**"Only" through the dashboard.** Article 47's sentence carries its own reason, "Our system does not support refunds issued
directly from Stripe or PayPal" (`R-G47:51` as quoted at RL:922, rendered `[against-bar]`; RL:1538); the endpoint the
responder calls is Gumroad's own, documented in Gumroad's `/api` page source ("Refunds a sale. Available with the
'edit_sales' scope", `Sales.tsx:373-380`, github via RL:1535) with the same balance rule (`refundable.rb:98-100`, github
via RL:972). The "only" bars refunding through the processor, not through Gumroad's API. The route is within the terms on
the texts read; it "has never been run" (RL:1111) and the first real refund is the recorded check ((h) REOPEN (iii)).

**The mailbox.** Receipt replies go to the account's Support email when one is set, at account or product level, and to
the sign-in address only when it is blank (RL:1538-1539); the API does not expose the field, so `requireBrandAccount`'s
check of `GET /v2/user` email (`gumroad-pro-product.js:448-462`) cannot see it. RULING: step 3 gains the instruction —
Settings → Support → Email: leave blank or set to the brand mailbox; no product-level address — and `check` additionally
asserts the account's `name` field is the brand (it prints on receipts, invoices and the refund email, RL:1535), never
printing the value. The step-8 account question (row 16(c)) does not change this: whichever Google account carries the
brand mailbox, the Gumroad account's mail must land in it, and step 3 already binds the sign-in address to it
(`OWNER_STEPS.he.md:187-189`).

**The balance.** One ₪79 sale nets about ₪65.93 [inference at 3.6 ILS/USD, RL:1434-1441], and a refund needs the unpaid
balance to cover it (`R-G47:51`, rendered `[against-bar]`; `refundable.rb:98-100`, github), so the first refund on a new
account is refused by dashboard and API alike, and later ones when fewer than two sales are unpaid (RL:1443-1446). Today
the responder then sends nothing ("the refund command stopped: not answered, left for the next run", `brand_mail.py:1286`)
and retries only because the request stays unanswered within `REFUND_LOOKBACK_DAYS` (`:173`). RULING: on a **balance**
refusal — Gumroad's "Your balance is insufficient to process this refund." (`refundable.rb:100`, github via RL:972) — the
responder sends one **holding reply** that states facts only: the request and its date were received; the refund is
issued through Gumroad and will be issued as soon as Gumroad permits it; the buyer may also write to Gumroad through its
receipt. It records `{saleId, requestedAt, holdingReplySentAt}` — sale id only, never the address — marks the mail
`\Answered`, and retries every run by sale id, measuring the window at the original `requestedAt`; on success it sends the
existing one-sentence reply. Any other stop keeps today's behaviour. The residual is stated, not hidden: one lone sale
can breach 14ה(ב)(1)'s 14 days until a second sale lands; Gumroad's staff refunds bypass the balance check but buyers
reach Gumroad only after 30 days (RL:881, :1446). The first real refund remains the recorded check.

**Cost and currency.** A full refund returns Gumroad's fee and keeps the processing part, about ₪3.37 [inference,
RL:1434-1441]; the buyer is charged nothing, so the ₪3.95 cap is not touched. The FAQ's "מוחזר במלואה" is made exact: "in the
currency charged" — an ILS listing may be charged in USD (`gumroad-terms.txt:208`, rendered `[against-bar]`), and the
first sale's `buyer_presentment` is the ₪0 read (RL:1537).

**Under 16(d).** (i) as above. (ii) Every fact here has a github twin (article 47 and the terms in Gumroad's source;
`refundable.rb`, `sales_controller.rb`, `customer_mailer.rb`, `Sales.tsx`), and the policy in force is read live from the
API, which is outside the pause. The ruling holds unchanged at github grade.

**REOPEN IF.** The first real refund is refused for a reason other than balance; the measured rate crosses 15% (a board
reading); Gumroad acts on the account (KILL-3); the receipt's reply-to is shown to bypass the Support field.

---

## Fold actions for Opus (mechanical; each with its test)

1. **`docs/OWNER_STEPS.he.md` step 2** (`:128-175`) and its data twin in `src/revenue/owner-steps.ts` (`:223-230`, step 2
   text): (a) `:130` "אונליין" → "לפי תק' 2(א)(1) שנקראה, הטופס נמסר ביד או דרך רו"ח/עו"ד/יועץ מס/מנהל חשבונות; מסלול
   מקוון באתר רשות המסים לא אומת מכאן"; (b) `:146` the occupation line → the wording in (a) above, plus: "המשרד קובע את
   הסיווג. אם האישור אומר 'עוסק מורשה' — כתוב לי את המילה הזאת עם 'צעד 2 בוצע'; אז המסמכים והדיווח משתנים ואני אומר לך
   מה"; (c) `:156` "דיווח פעם בשנה" → "הצהרת מחזור שנתית עד 31 בינואר (תק' 15 שנקראה); הפטור מדיווח תקופתי יושב בתקנות
   הכלליות שעוד לא נקראו"; (d) add under "מה זה עושה": the annual declaration (the runner computes the figure and drafts
   the form; delivery route unstated) and the one-time registered-mail notice(s) before the first computerised document,
   marked "one-time; cost of registered mail unchecked, so not asked yet"; (e) `:163-165` append "המסמך הראשון יוצא רק אחרי
   שנסגרה שאלת החתימה (RULING-2026-09-30-documents (a))". Test: the owner-steps parity test and a grep that "אונליין" no
   longer appears in step 2 as an assertion.
2. **Step 3** (`OWNER_STEPS.he.md:187-189`, `owner-steps.ts` step 3 text): add "הגדרות → Support → Email: להשאיר ריק או
   לשים את תיבת המותג; לא להגדיר כתובת תמיכה למוצר" and "שם החשבון (name) = Mehudak".
3. **Step 6 table** (`OWNER_STEPS.he.md:372-376`, `owner-steps.ts:316-321`): a fourth row `POSTHOG_READ_KEY` — "מפתח API
   אישי ב-PostHog עם ההרשאה 'Performing analytics queries' בלבד, בחשבון שבו הפרויקט של המותג" — "מפעיל את קורא הצפיות
   השבועי; בלעדיו שער ה-PASS של Pro לא נקרא לעולם". Gate the row on `site.json` `posthog.projectId` being non-empty (the
   project exists) so it is never asked first. Test: `owner-steps` test asserts the row and its gate.
4. **`gumroad-pro-product.js`**: (a) `check`/`requireBrandAccount` (`:448-462`) also compares `user.name` to the brand
   name, stops on mismatch, never prints it; (b) `refund` distinguishes a balance refusal (body contains "balance is
   insufficient") with a distinct exit code (e.g. 3) and message, and accepts `--sale <id> --requested-at <iso>` to retry
   one sale (same window rule, same idempotence); (c) `create` gains `--fine-print <file>` calling `PUT /v2/refund_policy`
   with the Hebrew 14ט(ד)/14ג(ב)(3) text, dry-run by default, and `check` reads it back and refuses on mismatch. Tests in
   `products/il-biz-tools/tests/gumroad-pro-product.test.js` against the fake Gumroad: name mismatch, exit 3 on the
   balance body, `--sale` retry, fine print written and read back.
5. **`scripts/brand_mail.py respond-refunds`** (`:1280-1290`): on exit 3, send the holding reply (a second fixed constant,
   facts only, no promise of a date), mark `\Answered`, append `{saleId, requestedAt, holdingReplySentAt}` to
   `state/colony/refund-retries.json` (no address, no name); at the start of each run retry every entry with
   `refund --sale`, send the existing `REFUND_REPLY` on success and drop the entry. Tests in the brand-mail suite: a
   balance refusal produces the holding reply once and a retry entry; a later success sends the reply and clears it; the
   state file never contains an "@".
6. **Refund-rate KPI**: in the Gumroad connector's sync, `gumroadRefundRate90d` = refunded / sales over the trailing 90 days
   for the Pro product (`refunded` on the sale object), written as a KPI row with its two counts; the report prints it
   beside sales; a fixture test with 6 sales / 1 refund → 0.167.
7. **`products/il-biz-tools/index.html:98-101`** footer and the Pro FAQ (`invoice.html:248`, JSON-LD `:70`): add the
   dedicated link `<a href="mailto:<brand>?subject=ביטול עסקה – Pro">ביטול עסקה (Pro)</a>` in the footer of the home page,
   prominent, with the one-paragraph disclosure (ways: this address or a reply to the Gumroad receipt; include name and ID
   number; refund through Gumroad in the currency charged), filled at build from the same brand address the accessibility
   statement uses; the FAQ answer gains "במטבע שבו חויבתם" and the link. Tests: `tests/pro-faq.test.js` and a home-page
   test assert the link, the subject, and that no owner identifier appears.
8. **`src/revenue/page-views.ts`**: rename the gap verdict to `reader_down` (`:400-403`, `:424`, `:446`, `:452` and the
   `PageViewVerdict` union `:305-316`), keep `instrument_fault` for the deadline miss and the unreadable week; `:457`
   returns `pause` with the note "one extension, not passed: paused as under 5; re-enters at the domain deploy"; drop
   `extension_exhausted`. Update the reader's tests under `src/__tests__/revenue/` (the gap case expects `reader_down`,
   the second-between case expects `pause`) and the report wording.
9. **`research/owner-asks/questions.json:43-46`** (Wix held question): reword to "Does Wix accept from an Israeli exempt
   dealer (עוסק פטור) a computer-sent transaction invoice (חשבונית עסקה, not a tax invoice) and receipt, signed with the
   dealer's secured electronic signature, and does Wix consent to receive such computerised documents?"; `when` gains
   "a written no leads to incorporating, a §58 request or Wix out, not a plain cost decision (RULING-2026-09-30-documents
   (a))". Same consent question is added to Y8's and Indiebook's held lists. The message-rule test still passes (no "@").
10. **`logs/CHANNEL_LOOP.md` §4 rows 11, 14, 22** (main thread): "invoice: runner-issued after step 2 under (e)3 as narrowed
    by RULING-2026-09-30-documents (a): secured route, bank legs only (Y8: bank, $500 minimum), never 'חשבונית מס', class
    guard, first document after the §145(א1) check"; §6 the step-2 additions; §7/§8 row 17 done; and the Part C
    housekeeping the brief lists (OP's `terms-verdicts.json` line drift; `:143` still headed "Tick 21"; RC:152).
11. **Reads to queue** (GitHub-hosted, no nevo, no Gumroad): (a) a blobless clone of `lawsofisrael/lawsofisrael` at
    `aeca0b25`: grep every `listing/*.html` for "חתימה אלקטרונית" and for "271_005", and read the general VAT regulations
    if the mirror holds them (reg 6א; §67 exemption) → `research/measurements/osek-patur-documents.md` "30.9 (tick 24,
    github)"; (b) one grep of the mirror's CPL blob `91a3f5c75348` for "14ט"; (c) the Israel Post registered-mail rate page
    — only after its site has a terms verdict (`terms-verdicts.json`), else from a GitHub-hosted copy.
12. **`logs/FABLE_QUEUE.md:41`**: row 17 DONE with this path; row 18 unchanged (1.10).

## Owner asks

1. **`POSTHOG_READ_KEY` in step 6** — one-time, ₪0 on the condition stated in (c) call 4, no camera, no name, asked only
   after the project exists. Checked against every constraint above: passes.

Not asks: the step-2 and step-3 wording changes (step 2 is not asked yet; step 3's change is an instruction inside an
existing step); the registered-mail notice (recorded, cost unchecked); the certificate (rejected).

## What stays open

- Tax Authority practice on a runner-held signing key (no text); the §145(א1) instructions (the one check of (a)).
- Reg 6א and the exempt dealer's report period (general VAT regulations, nevo 271_005; mirror first, then Wikisource after
  its policies, then the Knesset after its terms). The 1991 gazette TAK-5321.
- The registration regulations' github twin (matters only under 16(d)(ii)).
- Whether the fine print on Gumroad's receipt meets 14ט(ה)(1); whether the mirror's CPL carries 14ט; any 14ג(ה)
  determination.
- Whether the ILS listing is charged in shekels (first sale's `buyer_presentment`); Gumroad's refund-rate window.
- PostHog's free-tier coverage of the query API (grade none; the (c) condition).
- The residual on the "owner is עוסק" reading: phone and postal cancellation routes — never built; recorded.
