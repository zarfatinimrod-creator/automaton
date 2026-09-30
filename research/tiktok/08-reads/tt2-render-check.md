# tt2 render check: the בעל עסק זעיר track (P2) and TikTok's terms (P6)

Reader for family `tiktok-terms-tax`, 28.9.2026. It covers the 11 `tt2-*` captures the runner stored at render
commit `9761972` for §9 P2 and P6 of `research/tiktok/08-sales-marketing-lessons.md` (called "the note" below).
This file edits nothing else. Changes to the note, the loop and the Fable queue are **proposals for the main
thread**.

**Grades:** rendered, github, snippet, repo, none. Every quote from a `.txt` file was checked with
`grep -n -F`. Two captures (`tt2-transparency-aigc.html`, `tt2-cg-archive.html`) keep their text
percent-encoded inside the `__remixContext` script on line 1. Their quotes were checked by grepping the
encodeURIComponent form, e.g. `grep -n -F 'Effective%20September%2024%2C%202026' research/rendered/tt2-cg-archive.html`.
`tt2-capitax-265-2023.pdf` has no Hebrew text layer (its `.txt` holds only `171 / 31.5.2023 / 3045` and the
matching strings for pages 172–173). It was read from page images rendered locally with PyMuPDF in the scratchpad,
so its quotes are **transcribed from the image (inner quotation marks normalised to ') and cannot be grep-checked**. Four Open Terms Archive files were
fetched from raw.githubusercontent.com into the scratchpad and quoted with their GitHub path and line; each quote was
checked with `grep -n -F` on that local copy.

---

## 0. Verdicts
**Ruled 30.9.2026:** `research/channel-loop/RULING-2026-09-30-video.md` 16(d) and 16(a) — no tiktok.com fetch ever, P1b KILLED, no brand TikTok account; this read's TikTok captures stay citable for our own compliance and decisions not to act only (`[against-bar]`).
1. **The בעל עסק זעיר income-tax track is settled at primary-text grade, for tax years 2024–2025:**
   - **Legal basis:** **Amendment 265** to the Income Tax Ordinance (not 277), chapter 8, sections 87ב–87ז, in force
     from 1.1.2024.
   - **Rate:** a deemed deduction of **30% of turnover** in place of actual expenses.
   - **Cap:** the VAT **עוסק פטור amount**, by statutory reference. It is ₪120,000 for 2024 and 2025, and is
     **CPI-linked from 1.1.2026**.
   - **Still open:** the 2026 figure itself is in none of these documents.
   - **Status:** voluntary. It is open to עוסק פטור *and* עוסק מורשה under the cap. A new online עוסק פטור is
     registered as בעל עסק זעיר automatically unless they opt out.

   The five PDFs are **not a tax firm's newsletter**. They are the gazette, the regulations, a Tax Authority letter,
   a Tax Authority report and a Finance Ministry draft, hosted as copies on capitax.co.il. The gov.il originals
   returned 403. **A11 can be built now for 2024–2025.**
2. **P1b would breach TikTok's terms.** US Terms §3.4 bans automated scraping, crawling or extraction "for any purpose"
   unless approved in writing. The runner is served the US platform. The EEA/UK terms and the rest-of-world terms (the
   ones an Israeli account signs; github grade) carry the same ban. **So the gate fails and P1b must not be built or
   run.**
   - A kill of P1b is **PROPOSED** for the Fable sitting, because the loop board did not pre-register one.
   - The same clause reads literally on the plain-GET TikTok renders already queued (P1, P3, P7, P8). A pause of
     those is also **PROPOSED**.
3. **Branded content and AIGC:**
   - TikTok's Branded Content Policy covers *third-party* promotion. Our own brand's clips stay under the own-business
     disclosure already in §5.1.
   - That policy lists **"accounting" services as a prohibited industry**. So paid, gifted or commission creator
     content about our tax tools is at risk, independently of the note's §8.4. [checker 28.9: "is out" overstated
     it. The line bars Branded Content that promotes products or services "from the following prohibited
     industries" (`tt2-branded-content-policy.txt:41`), one being "Professional services" (`:57`); whether tax
     software counts is an inference (none), as §5 itself says.]
   - The AIGC label is required only for "realistic-appearing scenes or people". Screen demos do not trigger it.
     "fake authoritative sources" are banned, which adds a no-official-styling item to N12.
   - F1 gains two points:
     - **No ToS-clean kill signal can be read from TikTok by an agent.** It has to come from our own site.
       [checker 28.9: shown only for scraping and plain GETs. TikTok's own developer route, the "TikTok Developer
       Terms of Service" named in the Business Products (Data) Terms (`vlopses-au-versions`
       `TikTok/Commercial Terms.md:291`, github), was not read (none).]
     - The rest-of-world terms literally bar using the Services "to advertise or perform any commercial solicitation"
       and, without "express written consent", for "any commercial" purpose. A Business Account is governed by those
       same Terms (github). What reconciles this with the Community Guidelines' own-business disclosure is not
       stated anywhere read (none).

---

## 1. What each tax PDF is, and how it is graded

| Slug | What it is (from its own text) | Issuer | Grade |
|---|---|---|---|
| `tt2-capitax-265-2023` | ספר החוקים 3045, 31.5.2023, pp. 171–173: חוק ההתייעלות הכלכלית, פרק ו' מסים, "סימן א': בעל עסק זעיר". Printed to PDF from the gazette (PDF metadata: "Microsoft: Print To PDF", created 2023-05-31) | Knesset (gazette) | rendered: primary text, third-party copy, image only |
| `tt2-capitax-26112024-2` | קובץ התקנות 11554, pp. 254–255: "תקנות מס הכנסה (פטור מהגשת דין וחשבון) (תיקון)" (`.txt:1`), signed "י"ט בחשוון התשפ"ה" (`:48`) by the "שר האוצר" (`:51`) | Finance Minister | rendered: primary text, third-party copy |
| `tt2-capitax-11122024` | Letter "משנה למנהל רשות המסים" (`:5`), ref "2024-000120" (`:9`), "הבהרות למייצגים בנוגע לרפורמה של" בעל עסק זעיר (`:15`) | Tax Authority | rendered: primary text, third-party copy |
| `tt2-capitax-21072025-1` | "ניתוח נתונים" (`:1`): the Tax Authority's own data report on the reform, with data to "26/06/2025" (`:393`) | Tax Authority | rendered: primary text, third-party copy |
| `tt2-capitax-28052025-1` | "טיוטת תקנות מס הכנסה (קביעת סוגי עסקאות" (`:6`): a **draft** for public comment that adds war compensation to turnover | Finance Ministry | rendered: primary text of a **draft**. Whether it was enacted: none |
| `tt2-gov-sa190125-1`, `tt2-gov-sa210725-1` | HTTP 403, 0 bytes (`.meta.json`) | — | not rendered |

**Honest grade.** None of these is secondary in the usual sense. The copies sit on a tax firm's server, and none was
cross-checked against a gov.il or Reshumot copy, because both of those return 403. So "rendered, primary text,
third-party copy" is the ceiling. That is still higher than the note's "Rendered secondary (Capitax, cp1255-decoded)"
in §6.3 (`08-sales-marketing-lessons.md:585`) and "rendered secondary" in §7 row 7 (`:603`). [checker 28.9: the
reader's "rendered secondary (Capitax page)" is not in the note; quote and lines corrected.]

**The name.** "עוסק זעיר" occurs **0 times** in the four text PDFs (`grep -c -F "עוסק זעיר"`), and not in the
gazette image either. "בעל עסק זעיר" is on 61 lines across them (`grep -c`). None of the five mentions VAT section 31(3). The
gazette touches only VAT **section 1**, the עוסק פטור amount. [checker 28.9: it amends only section 1; its section
37(ב) also times the first CPI step "על אף האמור בסעיף 126 לחוק מס ערך מוסף" (gazette p.173, transcribed). Neither
is §31(3).] The note's copy rule in §6.3 therefore now has primary
backing: say "בעל עסק זעיר / עסק זעיר", use "עוסק זעיר" only as a search phrase, and never cite §31(3) for this
track.

---

## 2. The track, point by point

Quotes from `265-2023` are transcribed from the page image (see the header).

| Point | Primary text | Change vs the note |
|---|---|---|
| **Name and place** | Gazette p.171: "פרק שמיני: בעל עסק זעיר", inserted after section 87א of the Ordinance | Confirms §6.3 |
| **Amendment number** | Gazette p.171, margin of section 34: "תיקון פקודת מס הכנסה – מס' 265" (the same סימן also amends the VAT law, "מס' 62", and National Insurance, "מס' 237") | **Settles §6.3 row 2: 265.** The repo's "תיקון 277" (`research/colony-sweep/scouts/risk-governance--selling-as-individual.md:154`, snippet) is wrong |
| **Who qualifies (87ב)** | "'בעל עסק זעיר' – יחיד, תושב ישראל, המפיק הכנסה מעסק או ממשלח יד ומתקיימים לגביו כל אלה: (1) מחזור העסקאות הכולל הנובע ממשלח ידו ומכל עסקיו בשנת המס אינו עולה על הסכום הקבוע בהגדרה 'עוסק פטור' שבסעיף 1 לחוק מס ערך מוסף; (2) פקיד השומה רשם אותו לפי סעיף 87ג" | The cap is a **statutory reference** to the VAT amount, not just "tied to" it |
| **Cap, 2024–2025** | Gazette section 35: in the VAT law's "עוסק פטור" definition, "120,000 שקלים חדשים". The Authority's report says the same: "עוסק פטור או עוסק מורשה שמחזור הכנסותיו לא עולה על" ₪120,000 (`21072025-1.txt:27`) | Confirms ₪120,000 |
| **Cap, 2026** | Gazette section 37(ב): the amount "יותאם לראשונה ביום י"ב בטבת התשפ"ו (1 בינואר 2026) לעומת המדד שפורסם לאחרונה לפני יום א' בטבת התשפ"ה (1 בינואר 2025)". The report: "תוצמד תקרה זו למדד המחירים לצרכן" (`21072025-1.txt:35`) | **Mechanism settled, figure not.** The repo's ₪122,833 (`products/il-biz-tools/src/config/osek-patur.json`, source Kol Zchut; repo) is consistent with a 2.36% CPI step (arithmetic; none), but no document read here states it |
| **Rate (87ד(א))** | "ינוכה מהכנסתו מהעסק או ממשלח היד סכום השווה ל־30% ממחזור העסקאות שלו באותה שנה (בפרק זה – סכום הניכוי)" … "לא יחולו הוראות סעיפים 17 עד 27 למעט סעיף 17(5א) … וכן לא תחול הוראת סעיף 47א לעניין תשלומי ביטוח לאומי ומס מקביל" | **New:** the 30% replaces sections 17–27 (except 17(5א)) **and** the section 47א deduction for National Insurance payments. This matters for A11. The minister may change the rate (87ז(ב)) |
| **Disqualifiers (87ה(א))** | No deduction if: "(1) הוא מעסיק עובדים; (2) הוא אינו מנהל פנקסים קבילים; (3) הייתה לו בשנת המס הכנסה מעסק או ממשלח יד שלא הופקה מיגיעה אישית; (4) חלק מהכנסתו … התקבל מאדם שהוא מעסיקו בשנת המס; (5) … יוחס אליו מתאגיד שקוף …; (6) יותר מ־25% מהכנסתו … התקבלו מאחד מאלה: (א) מקרובו …; (ב) ממי שהיה מעסיקו במועד כלשהו בשלוש שנות המס הקודמות; (7) הוא בעל שליטה בחברה …; (8) הוא אינו עומד בתנאי אחר שקבע שר האוצר" | **New, and it corrects the repo.** The 25% test is about relatives and former employers, not any single client. [checker 28.9: the repo snippet already ties the 25% to "מצד קשור או ממעסיק לשעבר" (`risk-governance--selling-as-individual.md:158`). What it gets wrong is "הוא לא יכול להיות עובד לשעבר של הלקוח" (`:157`): the statute bars any income from the current employer (4) and more than 25% from an employer of the last three years (6)(ב).] And **admissible books are required** (2), so "ללא צורך בקבלות" (`risk-governance--selling-as-individual.md:156`, snippet) overstates it. Which books a זעיר must keep is not stated here (none) |
| **Cooling-off (87ה(ב))** | Someone who took the deduction and then did not take it the next year "לא יוכל לנכות את סכום הניכוי גם בשתי שנות המס שלאחר אותה שנת מס". The Authority repeats it (`11122024.txt:29`) and gave a one-off 2024 relief | **New;** the tool must warn about it |
| **Advance payments (87ו)** | The assessing officer "רשאי לפטור בעל עסק זעיר ממקדמות" | Discretionary in the statute. [checker 28.9: "not automatic" overstated it for practice. The Authority's report lists "פטור מתשלום מקדמות*" among the effects of the shortened track (`21072025-1.txt:537`), "*למעט במקרים חריגים" (`:539`), so it is the default there.] |
| **Registration (87ג)** | An עוסק פטור is registered "אף בלא הגשת בקשה" and told that they may ask to cancel it. The Authority: a new online עוסק פטור "יוגדר אוטומטית כבעל עסק זעיר במס" (`21072025-1.txt:548`) "אלא אם כן סימן בטופס פתיחת תיק "עוסק פטור" כי הוא אינו מעוניין בכך" (`:549`); the status is "פעולה וולונטרית" (`:555`); one may still file a full report and deduct 30% (`:558-559`) | **Closes** the "inference (none)" in `08-reads/hebrew-israel.md` (relation row): one business can be עוסק פטור for VAT and בעל עסק זעיר for income tax. עוסק מורשה under the cap may join too |
| **Effective date** | Gazette 37(א): the chapter starts "ביום כ' בטבת התשפ"ד (1 בינואר 2024), והם יחולו על הכנסות של בעל עסק זעיר שהופקו מיום זה ואילך". The regulations: "תקנות אלה יחולו על דוח שיש להגישו לגבי שנת המס" 2024 or later (`26112024-2.txt:47`) | Confirms "from tax year 2024" |
| **"No annual report"** | The filing exemption needs four online steps (`26112024-2.txt:11-24`):<br>• a request by the end of the tax year ("בקשה לפטור מהגשת דין וחשבון באופן מקוון", `:12`);<br>• an in-year declaration "לגבי סכום מחזורו הצפוי בשנת המס" (`:16`);<br>• a declaration "על מחזורו בפועל באופן מקוון" by 31 March (`:21`);<br>• "תשלום על חשבון המס של בעל עסק זעיר" by 31 March (`:24`).<br>The Authority's report says it saves the report "ברוב המקרים" (`21072025-1.txt:29`), and not if "הוא או בן זוגו לא חייבים בהגשת דו"ח שנתי מסיבה אחרת" is false (`:532`) | Confirms "half true". Adds the spouse condition |
| **Uptake** | "נרשמו לרפורמה למעלה מ" 80,000 by June 2025 (`21072025-1.txt:56`), with 82,358 on the chart dated 26.6.2025 (`:393`, `:396`). End of 2024: over 45,000 (`:54-55`), 43,600 on the chart (`:403`), and "לא כל מי שנרשם למודל השלים את התהליך בפועל" (`:418`). About 38,000 made the 2024 tax coordination (`:316-317`). About 450,000 could qualify for the filing exemption (`:250-251`) | **Correct §6.3's "About 40,000"** (Capitax's rounding) to the Authority's own figures if they are used |
| **Who gains** | "שכמעט" 80% "מהעסקים" (`21072025-1.txt:113`; the figure sits between bidi marks) "אינם מגיעים לסף המס" (`:114`) | **New, and it matters for A11:** for most users the choice changes paperwork, not tax. [checker 28.9: not income tax; the National Insurance effect is unread, see §3.] |
| **Pending change** | Draft: war compensation (indirect damage under the Property Tax law) enters turnover from 2025 ("תקנות אלה יחולו לגבי חישוב מחזור העסקאות של בעל עסק זעיר בשנת המס" 2025, `28052025-1.txt:72-73`), with an opt-in for 2024 | Draft only; enactment none |

**Not settled here.**
- The 2026 cap figure.
- Whether the draft regulations were enacted.
- What "פנקסים קבילים" means for a זעיר.
- What gazette section 36 does to National Insurance. It adds "ובלבד שלא חלות עליו ההוראות לעניין סכום הניכוי
  לבעל עסק זעיר" to National Insurance law §345(ב)(1)(א); its meaning is none. A11 must not model National
  Insurance.

---

## 3. A11: can the self-check tool be built now?

**Yes for 2024 and 2025. Its core is primary-grade.** The note's blocker ("Blocked on a primary render (N16)", A11
row) is lifted except for the 2026 cap. [checker 28.9: and except the 2026 law generally. No document read
post-dates the report with data to 26.6.2025, so whether the rate or conditions changed for tax year 2026 is none;
the 2026 mode needs the same sourced `checkedOn` value as the cap.] Proposed shape, all in the browser:

- **Eligibility screen** (87ב and 87ה(א)(1)–(8)):
  - individual, Israeli resident;
  - turnover at or under the cap;
  - no employees;
  - admissible books kept;
  - personal-exertion income only;
  - nothing from the current employer;
  - no transparent-company attribution;
  - not more than 25% from relatives or former employers of the last three years;
  - not a controlling shareholder;
  - for the filing exemption, neither spouse required to file for another reason.

  Each item links to the section it comes from.
- **Comparison, taxable income only:** the זעיר track is 70% × turnover (17(5א) is still allowed). The regular track
  is turnover minus recognised expenses minus the 47א deduction and other section 17–27 deductions the user enters.
  The זעיר track "loses" when those deductions exceed 30% of turnover. The tool shows **taxable income, not tax**:
  the Authority computes the tax from the marginal rate set in תיאום מס, and about 80% of registrants are under the
  tax threshold anyway (`21072025-1.txt:113-114`). The honest headline for most users is "no tax difference; the gain
  is no annual report". [checker 28.9: two limits. The "almost 80%" is of the businesses segmented by the marginal
  rate set in their 2024 tax coordination (29,302 at 0% of about 37,500 on the chart, `21072025-1.txt:343-366`),
  not of all registrants. And "no tax difference" holds for income tax only: the National Insurance effect
  (gazette section 36) is unread, so the headline must say "no income-tax difference".]
- **Warnings:** the two-year cooling-off (87ה(ב)); the four online steps and the 31 March dates; the fact that
  opting out of the automatic registration is possible (87ג).
- **2026:** show ₪120,000 as the 2024–2025 cap, state that it is CPI-linked from 1.1.2026, and take the 2026 figure
  as a sourced config value with `checkedOn` (N8). Do not hard-code ₪122,833 as primary.
- **Copy:** the track is "בעל עסק זעיר", with "עוסק זעיר" only in search text; no §31(3); cite "תיקון 265". Do not
  call the track "new" (§5.3, §6.3).

---

## 4. TikTok's terms on automated access (P1b)

**Which text binds the runner.**
- The rendered Terms are the US ones: "Last updated: July 15, 2026" (`tt2-terms-of-service-us.txt:7`), a contract
  with "TikTok USDS Joint Venture LLC" (`:10`).
- The runner was served the US platform: `"vgeo":"VGeo-US"` (`tt2-promoting-a-brand.html:1`), and `"region":"US"`
  with `"isLoggedIn":false` (`tt2-cg-archive.html:1`, encoded). So a runner job is US access under these terms.
- Logged-out access still forms the contract: "You form a contract with us when you accept these Terms or when you
  otherwise use or access the Platform." (`:11`). [checker 28.9: that is the Terms' own claim. Whether it binds a
  logged-out bot in law was not read (none). The mandate test reads the text, so the verdict below stands.]
- The Platform includes the website: "These Terms govern your use of our services, which include TikTok applications,
  websites, software" (`:16`).

**The clause, §3.4 (`:63`):**

> "scrape, crawl, export or otherwise extract any data or content in any form, for any purpose, from the Platform
> using any automated system or software, including automated “bots,” except as approved in writing by TikTok USDS
> Joint Venture,"

- **No carve-out:** "research" occurs 0 times in the Terms, "API" 0 times, and "approved in writing" once, in this
  clause.
- **Next to it:** "do anything that could disable, overburden, interfere with, or undermine, the Platform’s operations
  or security" (`:59`). A few pages would not overburden anything, but it is the same list.
- **The EEA/UK terms** carry the same ban (github, Open Terms Archive mirror):
  - "(These terms apply if you live or have your principal place of business in the European Economic Area,
    Switzerland or the UK)" (line 5), "_Last updated: July 2026_" (line 7);
  - "extract any data or content from the Platform using any automated system or software that is not provided by
    TikTok or approved in writing by TikTok;" (`OpenTermsArchive/pga-versions` `TikTok/Terms of Service.md:150`;
    `OpenTermsArchive/vlopses-ie-versions` same path `:139`; both fetched from `main` on 28.9.2026 and checked with
    `grep -n -F` on the local copy).
- **The rest-of-world terms**, the ones an Israeli account holder signs, carry it too (github; the Open Terms
  Archive AU collection holds this text):
  - Scope: "(If you are not in the US, EEA, the United Kingdom, Switzerland or India)" (line 5), "_Last updated: 1
    December 2025_" (line 7), a Platform "which is provided by TikTok Pte. Ltd. or one of its affiliates" (line 16);
  - the ban: "use automated scripts to collect information from or otherwise interact with the Services;"
    (`OpenTermsArchive/vlopses-au-versions` `TikTok/Terms of Service.md:65`).
  - The same list has two commercial lines that matter to F1 (§6 item 6):
    - "market, rent or lease the Services for a fee or charge, or use the Services to advertise or perform any
      commercial solicitation;" (`:61`);
    - "use the Services, without our express written consent, for any commercial or unauthorized purpose, including
      communicating or facilitating any commercial advertisement or solicitation or spamming;" (`:62`).
  - **A Business Account does not escape them.** The "TikTok Business Products (Data) Terms" ("These terms apply with
    effect from: 22 January 2026") say that "the [TikTok Terms of Service](https://www.tiktok.com/legal/terms-of-service)
    apply when you use TikTok Business Accounts Tools" (`vlopses-au-versions` `TikTok/Commercial Terms.md:160-162, 289`;
    github). The separate Commercial Terms cover TikTok For Business, Ads Manager and Business Center, not the account.
  - Whether switching to a Business Account counts as the "express written consent" of line 62 is not stated
    anywhere read (none).
  - [checker 28.9] Two lines the reader did not weigh, both github:
    - Against the literal reading: the same file names these Terms among the "**General Commercial Terms**" that
      the Business Products (Data) Terms supplement (`Commercial Terms.md:285`, `:289`). TikTok thus treats its
      Terms as the commercial terms of a Business Account.
    - For it: the ROW liability section says "YOU AGREE NOT TO USE OUR PLATFORM FOR ANY COMMERCIAL OR BUSINESS
      PURPOSES" (`vlopses-au-versions` `TikTok/Terms of Service.md:181`).
    - The reconciliation stays none.

**Verdict on P1b.** P1b is a headless Chromium that loads profile, discover and search pages, scrolls them, and saves
"the rendered DOM plus the item JSON it received" (note §9 P1b). That is extracting data and content from the
Platform with automated software. The research purpose does not help, because the clause says "for any purpose". **It
breaches §3.4.** The note's own gate says the Google-SERP test "applies to automated TikTok search queries"
(`08-sales-marketing-lessons.md:812-814`). **So the gate fails: N16 must not add a P1b job.** A formal kill of P1b is
**PROPOSED** for the Fable sitting, since the loop board did not pre-register it. What the owner asked for, "search
TikTok", has no ToS-clean automated route.

**Knock-on (PROPOSED, for Fable):**
1. **The plain-GET queue:** P1 (video pages, plus the transcript and thumbnail fetch from signed CDN links), P3, P7
   and P8 are automated fetches of Platform content under the same words. The render-watch `tt-*` captures already
   stored were made the same way. Proposed: pause every queued tiktok.com user-content URL until Fable rules. Fable
   also decides whether the stored captures remain citable.
2. **Policy pages (P6):** read literally, the clause also covers fetching TikTok's own legal pages by bot. The
   cleanest route for policy text is the **Open Terms Archive mirrors on GitHub**, which are not tiktok.com (github
   grade). Whether anything short of that is acceptable is Fable's call.
3. **Routes that stay clean:**
   - written approval (TikTok's research programme: not read, none);
   - off-platform material the note already uses (blog embeds, GitHub-indexed datasets, web snippets);
   - a human viewer, which would be a new owner step that MISSION rule 1 weighs against.
   - oEmbed: whether TikTok's developer terms cover it was not read (none).

**Unrelated to P1b but binding on any account:** [checker 28.9: "any account" overstated it. These are US Terms
clauses. The ROW and EEA/UK copies read here have no generative-AI clause: `grep -c -i generative` gives 0 in
`vlopses-au-versions` and `pga-versions` `TikTok/Terms of Service.md` (github).]
- §3.10 bars using TikTok's generative AI features "via any automated system or software" (`:124`).
- §3.10 also bars implying AI output is human-made "including by removing, obscuring, or altering any watermarks,
  content-authenticating metadata, or other marking or disclosure applied to or associated with your Output" (`:125`).
  Its scope is TikTok's own AI features; stripping Content Credentials from outside tools is not addressed here.

---

## 5. Branded content and AI-generated content: what binds a faceless brand account

**Branded Content Policy** ("Published: 4 August 2026", "Effective date: 31 August 2026",
`tt2-branded-content-policy.txt:5-6`):
- **Scope.** Branded content "is content that promotes or reviews a third-party brand or its products or services in
  exchange for payment or any other incentive." (`:9`). It includes content earning "a commission on any sales (for
  instance, via an affiliate link or promotional code)" (`:13`). A brand account promoting its own tools is **not**
  Branded Content. That case stays under the Community Guidelines' own-business disclosure (`08-reads/tiktok-policy.md`
  row C1; rendered).
- **The own-business page is still missing.** The support page for it (`tt2-promoting-a-brand`) came back as an empty
  JavaScript shell. Its `.txt` is "TikTok Support" only, so **the own-brand toggle's wording and label are not
  rendered (none).**
- **How the toggle works for third-party content.** "When posting Branded Content, you must enable the commercial
  content disclosure toggle." (`:23`). "When you enable the toggle, and indicate that the content is posted on behalf of
  a third party, your content will be automatically labelled" (`:23`). Such content may enter the Commercial Content
  Library "where required by law", and "TikTok may be required to ensure that Branded Content remains publicly
  available in the library even if the original content is deleted or altered" (`:23`).
- **Clarity rule:** "You must ensure that the product or service you are promoting is sufficiently clear, without
  requiring viewers to access your profile page or any links." (`:24`). It binds Branded Content only, but it is a
  good N12 rule for our own clips too: name the tool in the caption or on screen.
- **Prohibited industry:** "Professional services - Including accounting, legal and immigration services." (`:57`).
  - Any paid, gifted or commission-based creator content about our VAT and tax tools risks this line. Whether a free
    PCN874 validator counts as an accounting service is an inference (none).
  - The note already rejects affiliate recruiting (§8.4, `:754`) for other reasons. This adds an independent
    platform rule, and it also closes paying a Hebrew creator if that idea is ever raised under F1. [checker 28.9:
    "closes" overstated it: it puts that route at risk, on the same inference (none).]

**AIGC** (`tt2-transparency-aigc.html:1`, encoded; the Community Guidelines stay the binding text):
- "We require creators to label AIGC that shows realistic-appearing scenes or people". Screen recordings of our tool
  with on-screen text do not trigger it. §5.1's reading stands, and our own disclosure line stays ours.
- The page bans AIGC that "shows fake authoritative sources or crisis events". **New N12 item:** no Tax Authority
  logo, letterhead or government-looking layout. Show the source as a citation, never as the speaker.
- "We also label AIGC from certain other platforms by using" Content Credentials, "a technical standard developed by
  the Coalition for Content Provenance and Authenticity (C2PA)". So a clip that passes through a generator writing
  Content Credentials may be auto-labelled. That fits our disclosure; N12 should say so, and should not strip such
  metadata.
- The page does not allow "the likeness of adult private figures used without their permission". This matches the note's rules that the owner never appears and that invented founders are rejected (§8.4).

**Creator Code of Conduct** (`tt2-creator-code-of-conduct.html:38`, the article JSON; the `.txt` is only the Creator
Academy shell):
- It governs Creator Programs "such as the Creator Rewards Program, TikTok One, Subscription, LIVE gifting, TikTok
  Shop, and more!". A brand account outside those programs is outside its scope.
- If it ever joins one, the line that touches us is "multiple-account abuse, or use of VPNs to circumvent our
  systems".
- Nothing here changes N12.

**Community Guidelines archive** (`tt2-cg-archive.html:1`, encoded): "Current Community Guidelines", "Effective
September 24, 2026". The previous version is "Effective September 13, 2025" (`cgversion=2025H2update`). §5.1's source
version is the current one.

---

## 6. What changes in the note (proposals; this reader edits nothing else)

1. **§6.3 and §7 row 7:**
   - The amendment is **265** (gazette image).
   - Upgrade the grade to "rendered, primary text, third-party copy".
   - The 2026 cap is CPI-linked with its figure unread.
   - Uptake: replace "About 40,000" with the Authority's figures (over 45,000 registered, about 38,000 coordinated for
     2024, over 80,000 by June 2025).
   - Add the admissible-books and relatives/former-employer conditions, the section 47א exclusion and the two-year
     cooling-off.
   - Correct the repo's "תיקון 277" and "ללא צורך בקבלות" in `risk-governance--selling-as-individual.md` §4 (repo;
     main thread).
2. **A11:** move it from "blocked" to buildable for 2024–2025 on §3's spec. The 2026 cap is a sourced config value.
3. **§9 P1b and N16:** the gate fails, so no P1b job. The kill is PROPOSED for Fable (F-row: "P1b and all automated
   tiktok.com fetches").
4. **§9 P1, P3, P7, P8:** PROPOSED pause pending the same ruling. For P6, read policy text from Open Terms Archive on
   GitHub.
5. **§5.1 / N12:** add three items:
   - no official or government styling ("fake authoritative sources");
   - name the tool in the caption or on screen;
   - an expected C2PA auto-label is fine, and metadata is never stripped.

   Record that the Branded Content prohibited-industry line ("accounting") rules out any paid or commission creator
   route. [checker 28.9: record it as a risk, not a ban. Tax software as a "Professional services" product is an
   inference (none).]
6. **F1 (§7.1 q1):** a yes must name an off-TikTok kill signal, because §3.4 also bans automated "export" of data from
   the Platform. An agent can therefore not read the account's analytics, or TikTok pages, to decide a kill. [checker
   28.9: not by scraping. TikTok's developer route is unread (none); see §0.] The ToS-clean
   signal is a count on our own site, e.g. visits to a TikTok-only path named in the bio. Content check lite and the
   FYF notice remain owner viewing, which is the recurring-owner-work problem the note already names.

   Second, the rest-of-world terms an Israeli account signs literally bar using the Services "to advertise or perform
   any commercial solicitation" and, without "express written consent", for "any commercial" purpose
   (`vlopses-au-versions` `:61-62`, github). A Business Account is governed by the same Terms (the Business Products
   (Data) Terms, `Commercial Terms.md:289`, github). The Community Guidelines' own-business disclosure (rendered)
   shows that TikTok expects businesses to promote themselves, so in practice the two coexist. But no text read here
   grants the consent line 62 asks for (none). F1 must weigh a literal-text risk to a brand account in Israel that the
   note did not know about. [checker 28.9: weigh it with the two lines added under §4 (Business Account), `Commercial
   Terms.md:285` against and ROW `:181` for.]

---

## 7. Next URLs

**Tax (seen in `tt-src-capitax-co-il-content-2-3311.html`, not yet fetched):**
- https://www.capitax.co.il/Attachments/07012024-1.pdf: the Deputy Director's 7.1.2024 notice "רפורמה במיסוי עסקים
  זעירים", per the Capitax page.
- https://www.capitax.co.il/Attachments/28052025.pdf: the companion draft on reserve and maternity pay.
- https://www.capitax.co.il/Attachments/26112024.pdf (context unclear) [checker 28.9: per the Capitax page it is the
  Deputy Director's notice of 10.11.2024; the link follows "מיום 10.11.2024" in
  `tt-src-capitax-co-il-content-2-3311.html` line 326, cp1255] and
  https://www.capitax.co.il/Attachments/31052023.pdf (the full Arrangements Law; overlaps `265-2023`).

No URL seen in any capture states the **2026 עוסק פטור amount**. The gov.il pages are 403, and Kol Zchut was 403 per
`hebrew-israel.md`. The number stays at repo grade until a primary copy is found.

**TikTok policy text, ToS-clean (github):**
- https://github.com/OpenTermsArchive/vlopses-us-versions/blob/main/TikTok/Terms%20of%20Service.md: its history gives
  dated versions of the US text, which lets us check this capture without touching tiktok.com.
- https://github.com/OpenTermsArchive/pga-versions/tree/main/TikTok: other TikTok policies in that collection, if it
  holds the Community Guidelines, which its declaration names (`pga-declarations/declarations/TikTok.json`).

- https://github.com/OpenTermsArchive/vlopses-au-versions/blob/main/TikTok/Terms%20of%20Service.md: the
  rest-of-world text quoted in §4. Read its history to date the commercial clauses.
- F1 needs any TikTok text that grants businesses the "express written consent" of ROW line 62. A GitHub code search
  of `org:OpenTermsArchive path:TikTok "Business Account"` found only the Community Guidelines, the Content
  Monetisation Policy and the Commercial Terms. [checker 28.9: a re-run on 28.9 returns 11 hits. These include
  `vlopses-au-versions` `TikTok/Privacy Policy.md`, plus copies of the Community Guidelines and Commercial Terms in
  the us, gb, ie and au collections.] The next reads are the pga-versions `Content Monetisation Policy.md`
  and the ROW Community Guidelines' commercial-disclosure section.

**Only if Fable allows policy-page fetches from tiktok.com.** Seen in the Branded Content capture:
  - https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/branded-content-on-tiktok
  - https://ads.tiktok.com/help/article/branded-content-policy-country-specific-requirements

  Both are low priority, since Branded Content does not bind our own clips.
