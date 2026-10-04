# Measurement: Israeli invoicing services, free tiers and a logo on the document (lines ruling 29.9 (a), APPLY 4)

**Status: READ 29.9.2026. Verdict: UNKNOWN at rendered grade; snippet leans towards "a logo is free elsewhere"** (see
"What it settles"). **Consequence for the il-biz-tools Pro FAQ: no wording change is triggered.** The current FAQ makes no
exclusivity claim, and must not start making one.

**The test as ruled** (`research/channel-loop/RULING-2026-09-29-lines.md:102-107`, repo): render the pricing pages of Green
Invoice / Morning, iCount, YPAY and Invoice4u "to settle whether a logo on a קבלה is in a free tier". "If a free tier
includes a logo without an account, FAQ (a) on `invoice.html:237` gains one true sentence naming what Pro adds over it (the
document never leaves the browser, no account); if the free tiers need an account, no wording changes. Either way the offer
stands." The ruling names the output `il-invoicing-free-tiers.md`; the dispatch that ran this read named this file. They are
the same result.

**Grades.** `rendered` = a runner capture in `research/rendered/`, cited `file:line`. `github` = code read on GitHub, cited
repo/path/commit:line. `snippet` = this reader's one WebSearch (29.9.2026). `repo` = our own files. `none` = inference,
flagged. Every quote below was checked with `grep -n -F` against the file it cites.

## What was read

| Source | Fetched | Status | Read |
|---|---|---|---|
| `icount-plans.txt` (`https://www.icount.co.il/plans/`) | 2026-09-29T08:59:32Z | 200, not truncated | all 1,197 lines; `.html` grepped for `logo`/`לוגו` |
| `ypay-faq.txt` (`https://ypay.co.il/front/faq`) | 2026-09-29T08:59:33Z | 200, not truncated | all 423 lines; `.html` grepped, links listed |
| `invoice4u-pricelist-2026-09-29.txt` (`https://www.invoice4u.co.il/pricelist-invoice/`) | 2026-09-29T08:59:35Z | 200, not truncated | all 618 lines; `.html` grepped, links listed |
| `greeninvoice-pricing.meta.json` (`https://www.greeninvoice.co.il/pricing/`) | 2026-09-29T08:59:31Z | **403**, 0 bytes | nothing to read |
| WebSearch `הפקת קבלות בחינם עם לוגו העסק מסלול חינמי חשבונית` | 29.9.2026 | 9 results | titles and URLs; the tool's summary is a paraphrase, not a quote |
| GitHub code search `greeninvoice logo businesses file` + one raw file | 29.9.2026 | 32 hits | `Jango-AI-com/morning-cli` `businesses.py`, downloaded and grepped |

In all three captures, every `logo`/`לוגו` in the `.html` is the site's own logo (schema.org markup, navbar images).
There is one exception, Invoice4u's help-centre link, quoted in its table below.

## iCount (`icount-plans`)

| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Free tier or free plan? | **No.** A 45-day free trial of every feature, then a paid plan | "המערכת שלנו תשמח לארח אותך ל-45 ימי ניסיון בחינם - עם כל הפיצ'רים," · "כל הפיצ'רים שלנו חינם, ל-45 ימים!" · "להחליט האם שווה לך לרכוש אותם בתום תקופת הניסיון" | `icount-plans.txt:109`, `:416`, `:418` | rendered |
| What the free trial includes | Every feature, for 45 days | as above | `:109`, `:416` | rendered |
| Logo on documents | **Not stated.** `לוגו` occurs 0 times in the text; in the `.html`, `logo` appears only in iCount's own schema/site logo | — | `icount-plans.txt` (0 hits); `icount-plans.html` | rendered (absence on this page) |
| Cheapest paid plan | **Express, ₪276 a year**, one payment, excluding VAT, one-year commitment, unlimited documents. Metered alternative: **Advanced from ₪32 a month** for up to 10 documents | "ניהול הכנסות והוצאות בלבד" · "בתשלום אחד, לא כולל מע"מ" · " מסמכים ללא הגבלה" · "ההצטרפות מותנית בהתחייבות לשנה, בתשלום אחד ע”ס 276 ש”ח, לא כולל מע”מ." · "עד 10 מסמכים" / "₪32" | `:116`, `:122`, `:126`, `:146`, `:166`/`:170` | rendered |
| Document cap on a free tier | Not applicable: there is no free tier | — | — | rendered |
| Account needed? | Yes. The trial starts when an account is opened, and the form asks for an email, a company number and an ID number | "45 ימי ניסיון חינם מתחילים" · "בהקמת חשבון :)" · "מזהה חברה" · "תעודת זהות" | `:1181`, `:1183`, `:1187`, `:1189` | rendered |

## YPAY (`ypay-faq`)

| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Free tier or free plan? | **Yes, a permanent free product**, not a trial, for self-service use | "האם המערכת היא באמת בחינם?" → "המערכת בחינם לשימוש עצמי." · "הניתנת בחינם מכל מקום ומכל מכשיר" | `ypay-faq.txt:33`, `:35`, `:365` | rendered |
| What free includes | Digital invoices and reports: P&L, VAT and income-tax reports, ageing, PCN transmission for companies, export to Hashavshevet, the standard file format ("קבצים אחידים"). Support by email/chat only | "אלו מודולים בחינם?" · "חשבונית דיגיטלית חינם" · "המערכת בחינם לשימוש עצמי, השירות הינו דרך המייל או בצ'אט" | `:53`, `:55` (list to `:69`), `:97` | rendered |
| Logo on documents | **Not stated.** The FAQ does not mention a logo. The one branding-adjacent answer is a refusal: there is no personal signature | "אין למערכת אופציה לחתימה אישית." | `:193` | rendered (logo: absence on this page) |
| Cheapest paid item | **No plan price on this page.** The API is ₪50 a month plus VAT; recurring invoices are sold "as part of the premium package", whose price is not given; the store (`חנות`) was not captured (**superseded (tick 18):** now captured, `ypay-shop.txt`; see §29.9 (tick 18, rendered)) | "מחיר השימוש בשירות הAPI הינו 50 ₪ בתוספת מע‘'מ עבור חודש מלא." · "נמכר כחלק מחבילת הפרימיום" | `:345`, `:363` | rendered |
| Document cap on the free tier | **None stated.** `הגבלה` occurs 0 times; no per-month document figure appears. Not stated is not the same as unlimited | — | `ypay-faq.txt` (0 hits) | rendered (absence) |
| Account needed? | Yes: register, confirm by email, then set up the business | "יש להירשם תחילה למערכת דרך הלינק" · "לאשר במייל את ההרשמה" · "להגדיר את העסק בהגדרות עסק" | `:43`, `:45`, `:47` | rendered |
| Nature of the documents | Signed on YPAY's servers, and the software is registered with the Tax Authority. Documents therefore go through YPAY's servers | "החשבונית חתומה דיגיטלית בצורה תקינה על ידי שרתי חיתום של חברת Ypay." · "האם התוכנה שלכם מאושרת על ידי מס הכנסה?" → "כן . יש להיכנס לרשם התוכנות במס הכנסה ולרשום את מספר החברה 510899354 ." | `:163`, `:221`, `:223` | rendered |

Earlier: YPAY's homepage title on the 7.9 Hebrew SERP, "הפקת חשבונית דיגיטלית ירוקה חינם"
(`research/measurements/serp/2026-09-07-hebrew-calculators.md:77`, snippet). Today's capture confirms a free product. It
does not confirm a free logo.

## Invoice4u (`invoice4u-pricelist-2026-09-29`)

| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Free tier or free plan? | **No.** A two-month free trial, granted at registration, then a paid plan | "חודשיים חינם מ-ע-כ-ש-י-ו" · "ימי הניסיון מוענקים בעת ההרשמה, טרם רכישת מנוי בתשלום, ואינם חלים על סליקת אשראי." | `invoice4u-pricelist-2026-09-29.txt:3`, `:441` | rendered |
| What the free trial includes | Broad use of documents, reports and clients; no card clearing | "הם כן כוללים שימוש נרחב במערכת הפקת המסמכים, דוחות, לקוחות ועוד." | `:443` | rendered |
| Logo on documents | **The product has a logo feature; the price list does not say which plan has it.** The help-centre menu links a document-design guide category. The price table's 21 row labels (`:115-157`) have no logo or design row. Since nothing is free after the trial, a logo here is not free beyond two months (none: inference from the rendered absence of a free plan) | "עיצוב המסמכים מדריכים לעיצוב מקצועי של מסמכים, הוספת לוגו והתאמה אישית" | `:68` | rendered (feature); tier: none |
| Cheapest paid plan | **"המסלול הורוד", ₪21 a month billed yearly (₪252 in one payment) or ₪24 monthly, 50 documents a month**, excluding VAT. Cheapest cash outlay: **a 30-document pass, ₪79, valid for a year, no subscription** | "המסלול הורוד" · "21 ₪ לחודש" · "בתשלום אחד של 252 ₪" · "24 ₪" · "50 מסמכים בחודש" · "תקף לשנה שלמה" · "מסלול כרטיסיית 30 מסמכים ללא דמי מנוי וללא התחייבות" · "79 ₪" | `:161`, `:163`, `:165`, `:167`, `:173`, `:405`, `:407`, `:409` | rendered |
| Document cap | Every paid plan is capped per month (50/100/200/500); "unlimited" means up to 1,000 a month | "מסלול מסמכים ללא הגבלה מתאפשר עד אלף מסמכים בכל חודש קלנדרי." | `:449` | rendered |
| Account needed? | Yes: the trial is granted at registration | see `:441` | `:441` | rendered |

## Morning / Green Invoice (`greeninvoice-pricing`: 403)

| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Free tier or free plan? | **Unknown.** The pricing page returned 403 to the runner. A 7.9 audit calls it an incumbent "whose free" tier issues invoices, but cites no source for that. Price earlier seen only as a stale-flagged snippet: "Morning Light: 288 ILS/yr" | — | `greeninvoice-pricing.meta.json` (`"status": 403`); `research/colony-sweep/audits/distribution.md:190`; `research/colony-sweep/scouts/israel-bureaucracy--israeli-smb-software.md:31-32` | none (403); audit claim: none; price: snippet |
| Logo on documents | **The product supports a business logo**, uploaded through the API next to a signature and a stamp. Which plan includes it is not shown | `"""POST /businesses/file — upload business file (logo, signature, stamp).` | `github.com/Jango-AI-com/morning-cli` `cli_anything/greeninvoice/core/businesses.py:37` @ `7ade7ec` | github (feature); tier: none |
| Cheapest paid plan / cap / account | Unknown | — | — | none |

## Snippet-only candidates (the one WebSearch, 29.9.2026)

These are titles as returned, verbatim. The search tool's own summary also says Quickly Invoice "allows you to add your
business logo and business stamp". That is the tool's paraphrase, not a quote from the page, so it is graded as snippet at
best.

| Service | URL | Title (verbatim) | What it suggests | Grade |
|---|---|---|---|---|
| Quickly Invoice (חשבון מהיר) | `https://quicklyinvoice.com/` | "מערכת חשבון מהיר - להפיק חשבוניות בחינם לכל החיים!" | a permanent free tier; per the tool summary, a logo | snippet |
| SUMIT | `https://www.sumit.co.il/invoices` | "הפקת חשבונית דיגיטלית בחינם וללא התחייבות" | "free, no commitment": a free tier or a trial? | snippet |
| MyBooks | `https://www.mybooks.co.il/free_invoicing_software` | "חשבוניות מס, קבלות דיגיטליות וחשבונית דיגיטלית" | a free-invoicing page (the URL path says so) | snippet |
| digital-invoice.co.il | `https://digital-invoice.co.il/` | "חשבונית-דיגיטלית בחינם" | a free product (**superseded (tick 18):** the rendered price table has no ₪0 plan) | snippet |
| Invoice4U | (a landing page) | "חשבונית ירוקה - 60 יום התנסות חינם \| Invoice4U" | agrees with the rendered two-month trial | snippet |
| YPAY | `https://ypay.co.il/` | "מערכת הנהלת חשבונות באיטרנט חינם - סליקה, הפקת חשבונית דיגיטלית ירוקה חינם - YPAY" | same title as the 7.9 SERP | snippet |

## What it settles

**The claim tested:** "an Israeli invoicing service puts a business logo on a receipt free, as a standing free tier and not
a trial".

**Verdict: UNKNOWN (rendered). Snippet leans PASS**, meaning the logo is probably free elsewhere in Israel.
- **FAIL for iCount and Invoice4u, rendered.** Neither has a free plan, only trials (45 days, `icount-plans.txt:109`; two
  months, `invoice4u-pricelist-2026-09-29.txt:3`, `:441`). Neither gives anything free beyond the trial, the logo included. These two
  are paid services with trials, not free alternatives.
- **UNKNOWN for YPAY, rendered.** It is the one rendered permanent free product (`ypay-faq.txt:35`), with no stated
  document cap. Its FAQ is silent on a logo. Its store page would say whether a logo is a paid module. **Superseded (tick 18):** the
  store is rendered and lists no logo or design item, and does not say either way.
- **UNKNOWN for Morning.** Logo supported (github), tier unknown (403).
- **Leans PASS at snippet grade.** Quickly Invoice's title says free "for life", and the tool summary says a logo.
  Unrendered.
- **Account: every rendered route needs one.** YPAY requires registration and email confirmation (`ypay-faq.txt:43-47`).
  iCount's trial needs an account with an ID number (`icount-plans.txt:1181-1189`). Invoice4u's trial starts at
  registration (`invoice4u-pricelist-2026-09-29.txt:441`). No source at any grade shows an Israeli service giving a logo free
  **without an account**. That is the condition in the ruling's APPLY 4 and reopen (iv)
  (`RULING-2026-09-29-lines.md:105-107`, `:114`).

**On the Firefox kill's reopen trigger** (`RULING-2026-09-29-loop.md:58`, reopen (i): a Pro feature "free nowhere"). This
read cannot meet it, whatever the next renders show. The logo is already free on AMO, rendered
(`research/measurements/firefox-amo.md:133`: "Four general or GST makers state a logo on the invoice at no charge"). An
Israeli render can only add free logos; it cannot remove AMO's. The loop ruling says the same: reading more "cannot un-free
the logo" (`RULING-2026-09-29-loop.md:42`). The trigger stays unmet. The Israeli question now bears only on FAQ wording.

## What the Pro FAQ may honestly say

The current answer, `products/il-biz-tools/invoice.html:242` (JSON-LD copy at `:40`; the ruling's `:237` has drifted):
"לא חייבים. המחולל, שמירת הלקוחות, המספור האוטומטי, ההדפסה והשמירה כ-PDF חינמיים ובלי הרשמה. Pro מוסיף דבר אחד בלבד:
הלוגו של העסק וצבע המותג על המסמך המודפס." It claims no exclusivity and says Pro is optional. It is honest under the
ruling's §0 as it stands, and **the evidence above triggers no change** (APPLY 4: no free logo without an account is shown).

**May say** (true of our own tool, repo):
- The generator, client list, numbering and print/PDF are free and need no registration (`invoice.html:242`).
- Receipts and clients stay in the visitor's `localStorage`. The only request that leaves the page is the Pro licence
  check, to Gumroad (`products/il-biz-tools/README.md:710-711`).
- Pro adds one thing: the logo and accent colour on the printed document (`README.md:21`, `:515`).

**Must not say:**
- "only here", "nowhere else", "no other service gives a logo free", or any sentence implying the logo is rare. It is free
  on AMO (rendered) and probably in at least one Israeli free tier (snippet).
- Any general comparison with "invoicing services": two of the four rendered have no free plan and one has no logo
  statement, so a general claim cannot be true of all of them.
- Anything implying parity with registered invoicing software. YPAY states it is registered with the Tax Authority and
  signs documents on its servers (`ypay-faq.txt:163`, `:221-223`). Our page makes no such claim, and a comparative sentence
  would imply one.
- "No account" for the Pro purchase itself. Whether Gumroad's checkout needs an account is not verified here. "No
  registration on this site" is the true form.

**If a later render shows an Israeli free tier with a logo and no account** (reopen (iv)), the one added sentence can only
be the repo-true difference: the document is made and kept in the buyer's browser, with no registration on this site. It
must not name the other service.

## Next renders (slugs for `research/rendered/urls.txt`; each URL is written above, sourced as noted)

1. `https://ypay.co.il/front/shop/index` · `ypay-shop` · whether a logo is a paid module in YPAY's store, and the premium
   package's price. That settles YPAY, the one rendered free tier. (Source: the capture's own nav link `href="/front/shop/index"`
   labelled "חנות", `research/rendered/ypay-faq.html:204`, host `ypay.co.il`.)
2. `https://ypay.co.il/front/articles` · `ypay-articles` · the knowledge-centre index; whether a logo-setup article exists
   and what it says about the free system. (Source: nav link "מרכז ידע", `ypay-faq.html:198`.)
3. `https://quicklyinvoice.com/` · `quicklyinvoice-home` · whether "free for life" is a standing free tier, whether the
   logo is in it, and whether an account is needed. This is the one snippet PASS. (Source: the WebSearch above.)
4. `https://www.sumit.co.il/invoices` · `sumit-invoices` · whether "בחינם וללא התחייבות" is a free tier or a trial, and
   whether it includes a logo. (Source: the WebSearch above.)
5. `https://www.mybooks.co.il/free_invoicing_software` · `mybooks-free-invoicing` · the free tier's contents, document cap
   and logo. (Source: the WebSearch above.)
6. `https://digital-invoice.co.il/` · `digital-invoice-home` · the same three questions for a fifth "free" product.
   (Source: the WebSearch above.)

**Not queued:**
- **Morning.** `greeninvoice.co.il` answers 403 to a plain GET, and repeating it will 403 again. A `js` render would first
  need Morning's terms captured and read (`research/rendered/README.md:153-163`), and no Morning site-terms URL is written
  in this repo. No GitHub mirror of the pricing page was found; the GitHub read above settles only that the logo feature
  exists. Morning stays UNKNOWN until a terms URL is on file.
- **iCount and Invoice4u guides.** Neither service has a free plan, so the plan that carries their logo cannot change the
  verdict.

## 29.9 (tick 18, rendered)

**Read 29.9.2026 by an Opus reader (tick 18, reader B).** This reads the next renders listed above, items 1-6. Grades are
as at the top of this file. Every quote was checked with `grep -n -F` against the UTF-8 capture it cites.

| Capture | URL | Fetched | Status | Read |
|---|---|---|---|---|
| `ypay-shop` | https://ypay.co.il/front/shop/index | 2026-09-29T09:56:53Z | 200, not truncated | all 145 lines; `.html` grepped |
| `ypay-articles` | https://ypay.co.il/front/articles | 2026-09-29T09:56:55Z | 200, not truncated | all 143 lines; `.html` grepped |
| `sumit-invoices` | https://www.sumit.co.il/invoices | 2026-09-29T09:56:57Z | 200, not truncated | all 105 lines; `.html` links listed |
| `mybooks-free-invoicing` | https://www.mybooks.co.il/free_invoicing_software | 2026-09-29T09:56:58Z | 200, not truncated | all 75 lines; `.html` links listed |
| `digital-invoice-home` | https://digital-invoice.co.il/ | 2026-09-29T09:57:00Z | 200, not truncated | all 216 lines; `.html` grepped |
| `quicklyinvoice-home` | https://quicklyinvoice.com/ | 2026-09-29T09:56:56Z | **403**, 0 bytes, `"error": "HTTP 403 Forbidden"` | nothing to read |

**How often a logo is mentioned.** `לוגו` has 0 hits in the text of every capture except MyBooks, which has 1 (quoted
below). In the `.html` files, every `logo` is one of three things (digital-invoice also has `misim-logo`, the Tax Authority badge, and `big_logo.png`); none is a customer's document logo. Most are the site's own navbar or footer image (YPAY
`/images/logos/logo.png`, SUMIT `alt="Logo Sumit"`). The rest are images of client logos on digital-invoice's page
(`kspLogo.png`, `jGiveLogo.png`). None is about a customer's document.

### YPAY (`ypay-shop`, `ypay-articles`)
| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Free tier? | **Yes, confirmed again.** A permanent free product | "הניתנת בחינם מכל מקום ומכל מכשיר" · "חשבונית ירוקה חינם של Ypay \| הפקת חשבונית אונליין \| חשבונית דיגיטלית" · "שמנגישה הפקת חשבוניות ללא עלות" | `ypay-shop.txt:87`; `ypay-articles.txt:1`, `:59` | rendered |
| What the store sells | Bookkeeping at ₪100, ₪300 or ₪2,200 a month depending on the type of dealer; the API at ₪50 a month; payslips at ₪50 each (`:41-43`), opening a tax file ₪500 (`:45-47`), an annual report ₪1,250 (`:51-53`), a capital declaration ₪1,200 (`:55-57`), consulting ₪400 an hour (`:69-71`). Recurring invoices, card clearing, the CRM and the payment link are "sold as part of a package", with no package price. **There is no logo or document-design item** | "100.00 /300 /2200 ש״ח לחודש בתוספת מע״מ" · "* המחיר תלוי בסוג העוסק" · "ממשק API" / "50.00 ש״ח לחודש בתוספת מע״מ" · "חשבונית מחזורית" / "נמכר כחלק מחבילה" | `:37`, `:39`, `:79`/`:81`, `:75`/`:77` (also `:61`, `:67`, `:85`) | rendered |
| Logo on documents | **Not stated.** It is not sold as a store item (rendered absence), and no page says whether the free system prints one | — | `ypay-shop.txt`, `ypay-articles.txt` (0 hits for `לוגו`) | rendered (absence) |
| Document cap | **Not stated** on either page | — | — | rendered (absence) |
| Account needed? | Yes. The store sells only to logged-in users (and the FAQ requires registration, `ypay-faq.txt:43-47`) | "כל המחירים בחנות בתוספת מע״מ. ניתן לרכוש מוצרים ושירותים בחנות רק בהתחברות למערכת" | `ypay-shop.txt:33` | rendered |
| Knowledge centre | Page 1 of 31. Its four articles are all dated 27/09/2026: one on filing a capital declaration, three on online or digital invoicing. None is about a logo | "31" · "עמוד הבא" | `ypay-articles.txt:81`, `:83` | rendered |

### SUMIT (`sumit-invoices`)
| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Free tier or trial? | **Free to start, no card needed. Whether it is a standing tier or time-limited is not stated** | "הפקת חשבונית דיגיטלית בחינם וללא התחייבות" · "(אפשר להשאיר את הכרטיס אשראי בארנק)" · "מתחילים חינם וגדלים לפי הצורך." · "הצטרפו עכשיו בחינם וגלו כמה זה פשוט." | `sumit-invoices.txt:1`, `:13`, `:28`, `:48` | rendered |
| Document cap | **Not stated** | — | — | rendered (absence) |
| Logo on documents | **Not stated.** The closest line says documents are personally designed. It names no logo and no plan | "כל המסמכים מעוצבים אישית, מקצועיים וברורים – בדיוק כמו העסק שלכם." | `:16` | rendered |
| Account needed? | Yes: sign-up (the link goes to `https://app.sumit.co.il/users/register/`, `sumit-invoices.html:118`) | "הרשמה מהירה בשניות, הפקת חשבוניות תוך דקות" · "התחברות הרשמה חינם" | `:8`, `:5` | rendered |
| Price list | Linked, not captured: `/pricing` ("מחירון ניהול עסק") | "מחירון ניהול עסק" | `:76`; `sumit-invoices.html:118` | rendered (link) |

### MyBooks (`mybooks-free-invoicing`)
| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Free tier or trial? | **Not stated.** Only sign-up is called free. The text gives no plan, trial length or price; only the URL path says "free" | "הירשם עכשיו - בחינם" | `mybooks-free-invoicing.txt:3` | rendered |
| Document cap | **Not stated** | — | — | rendered (absence) |
| Logo on documents | **The product prints the company logo on invoices. The plan it is in is not stated** | "MyBooks מאפשרת לך הפיק חשבוניות המותאמות לעסק שלך ונושאות את לוגו החברה, פרטים מזהים של בעל העסק ועוד." | `:35` | rendered (feature); tier: none |
| Account needed? | Yes (the sign-up link is `/register`, `mybooks-free-invoicing.html:85`) | "הירשם עכשיו - בחינם" | `:3` | rendered |
| Page age | The footer reads 2014, so the page's claims may be old | "2014 Mybusiness. All rights reserved" | `:75` | rendered |
| Price list | Linked, not captured: `/pricingnew` ("מחירון") | "מחירון" | `:11`; `mybooks-free-invoicing.html:85` | rendered (link) |

### digital-invoice.co.il (`digital-invoice-home`)
| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Free tier or trial? | **No free plan.** The title and the sign-up button say "free", but the page's own price table has four paid plans, all excluding VAT: מיני ₪9.9 a month; בסיס ₪15.9; the popular plan ₪19.9; הכל כלול ₪39.9 (shown next to 49.9). Every plan offers "2 months at a special benefit for new joiners", without saying what the benefit is, and free set-up | "חשבונית-דיגיטלית בחינם" · "הירשם היום בחינם" · "מיני" / "9.9" · "בסיס" / "15.9" · "19.9" · "הכל כלול" / "39.9" / "49.9" · "2 חודשים בהטבה מיוחדת למצטרפים חדשים" · "הקמה חינם" · "המחיר לא כולל מע"מ" | `:1`, `:17`, `:67`/`:69`, `:100`/`:102`, `:135`, `:166`/`:168`/`:171`, `:74`, `:78`, `:76` | rendered |
| Document cap | 5 documents (מיני), 50 (בסיס), unlimited (the two higher plans). Above 1,000 a month: contact them | "5 מסמכים" · "50 מסמכים" · "מסמכים ללא הגבלה" · "מפיקים יותר מ 1000 מסמכים בחודש?" | `:80`, `:113`, `:146`/`:182`, `:204` | rendered |
| Logo on documents | **Not stated.** What the page does name is a digital signature in the user's name. That is a signature, not a logo | "המערכת חותמת דיגיטלית את כל המסמכים המופקים, ע"י חותמת אישית לכל משתמש הנושאת את שמו" | `:37` | rendered |
| Account needed? | Yes (the sign-up page is `register.aspx`, `digital-invoice-home.html:112`, `:136`, `:396`) | "הירשם היום בחינם" | `:17` | rendered |
| Registered software | Yes, by its own statement | "תוכנה רשומה ברשות המיסים" | `:216` | rendered |

### Quickly Invoice (`quicklyinvoice-home`: 403)
- The runner got a **403**, with 0 bytes and `"error": "HTTP 403 Forbidden"` (`quicklyinvoice-home.meta.json`). Nothing was
  read.
- It is still the one snippet-grade PASS: the title says "free for life", and the search tool's summary mentions a logo
  (above). It is still unrendered.

### What it settles (restated)
**The claim:** "an Israeli invoicing service puts a business logo on a receipt free, as a standing free tier and not a
trial".

**Verdict: UNKNOWN (rendered). The lean towards PASS is still snippet grade only**, and rests on Quickly Invoice alone.
- **Services with a logo feature: three.** MyBooks (rendered, `mybooks-free-invoicing.txt:35`), Invoice4u (rendered,
  `invoice4u-pricelist-2026-09-29.txt:68`) and Morning (github, `businesses.py:37`). **None** of them ties the logo to a free tier,
  at any grade.
- **YPAY**, the one rendered permanent free product: it says nothing about a logo, and its store does not sell one.
- **SUMIT** starts free, and whether that is a standing tier is not stated. Its page does not mention a logo.
- **FAIL, rendered, for digital-invoice.co.il.** It has no free plan, only paid plans from ₪9.9 a month. It joins iCount
  and Invoice4u as paid services.
- **Quickly Invoice:** 403, so nothing was read.
- **Account: every route that was rendered needs one.**
  - SUMIT `:8`, MyBooks `:3`, digital-invoice `:17`.
  - YPAY's store needs a login (`ypay-shop.txt:33`), and its FAQ requires registration (`ypay-faq.txt:43-47`).
  - iCount and Invoice4u (above).
  - **No source at any grade shows an Israeli service giving a logo free without an account.** That was the condition in
    APPLY 4 and in reopen (iv).

### What it means for the il-biz-tools Pro FAQ (facts only)
- **Nothing triggers a wording change.** The answer is unchanged in the repo: `products/il-biz-tools/invoice.html:242`,
  with its JSON-LD copy at `:40` ("Pro מוסיף דבר אחד בלבד: הלוגו של העסק וצבע המותג על המסמך המודפס."). APPLY 4's
  condition, a free logo without an account, is not shown.
- **A logo on an Israeli invoice is a standard product feature.** Three services have one: MyBooks and Invoice4u
  (rendered) and Morning (github). So a sentence saying or implying that a logo is unavailable or rare elsewhere is false
  as a statement about the feature, whichever plan the feature is in. The "must not say" list above stands.
- **The one difference that holds for every rendered route is registration.** Every rendered Israeli route needs an
  account. Our generator needs none (`invoice.html:242`, repo). This is the true form of any contrast, and it must not
  name another service.

### Next render URLs
1. **SUMIT's price list.**
   - URL: `https://www.sumit.co.il/pricing` · slug `sumit-pricing`.
   - Settles: whether "מתחילים חינם" is a standing free tier, its document cap, and whether that tier includes a logo.
   - Source: `sumit-invoices.html:118`, `href="/pricing"` on host www.sumit.co.il, label "מחירון ניהול עסק" (`:76`).
2. **MyBooks's price list.**
   - URL: `https://www.mybooks.co.il/pricingnew` · slug `mybooks-pricing`.
   - Settles: whether MyBooks has a free plan, and whether the logo (`:35`) is in it.
   - Source: `mybooks-free-invoicing.html:85`, `href="/pricingnew"`, label "מחירון" (`:11`).

**Not queued:**
- **Quickly Invoice.** A plain GET was refused with a 403, and a second one would be too. A `js` render would first need
  Quickly Invoice's terms captured and read, and no terms URL for it is on file.
- **digital-invoice.co.il.** It has no free plan, so which of its plans carries a logo cannot change the verdict.
- **YPAY.** Its FAQ and store both say nothing about a logo, and no YPAY page about a logo was seen. The article index
  runs to 31 pages, and reading through it is not a targeted read.
