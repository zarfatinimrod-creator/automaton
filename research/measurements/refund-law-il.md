# Measurement: Gumroad's refund terms and Israeli distance-sale cancellation law (lines ruling 29.9 (h))

**Date:** 2026-09-29 (tick 17). **Branch:** `claude/new-session-j071dx`, read at `5edc1ab`.
**Ordered by:** `research/channel-loop/RULING-2026-09-29-lines.md` (h), APPLY 6 ("Results to
`research/measurements/refund-law-il.md`") and its REOPEN IF (i)-(ii); ZERO-TESTS rows 154-155.

**Status in one paragraph.** Gumroad's own source code (github grade) settles the seller side: five refund periods
(none, 7, 14, 30, 183 days), a 30-day default, and the creator issues refunds. Gumroad can also refund within 90 days to
prevent chargebacks, and does so when the creator has not answered for 30 days. The only local consumer law Gumroad
names is Brazil's; Israel is not mentioned. The help-centre article's public URL is
`https://gumroad.com/help/article/51-what-is-gumroads-refund-policy`. It is already present in the row-155 capture,
inside the page's Inertia `data-page` attribute (rendered grade), so tick 16 read that capture too narrowly. The
consumer-protection law is at `https://www.nevo.co.il/law_html/law00/70305.htm`, not `law01/055_001.htm`. That URL
was found in GitHub repositories and matched to nevo's own id for the law. Its text as consolidated on 3.10.2022
(github grade, from a public-domain mirror) excludes "מידע כהגדרתו בחוק המחשבים" from the 14-day right outright. The
Computers Law, however, defines "מידע" as excluding "תוכנה". So the text does not settle whether a licence key that
unlocks a software feature is excluded. **Ruling (h)'s ≥ 14-day window stays the option that is lawful under every
reading, and REOPEN (i) does not fire.** One render of the live nevo page settles whether the 2022 wording is still in
force.

## Grades
- **rendered**: quoted from a capture in `research/rendered/`, cited `file:line`.
- **github**: read by me on 29.9 from a file on GitHub (raw.githubusercontent.com or a blobless clone), pinned to a
  commit; the quote was checked with `grep -n -F` against the downloaded bytes (or their text extraction, below).
- **snippet**: a search-engine result or summary I could not open.
- **repo**: this repository's own files.
- **none**: my inference, no source says it. Every inference is marked **[inference]**.

## What was read

**Gumroad**, `antiwork/gumroad` at `1b91d45aa0134f97326f869d7c422040b16aa606` (main on 29.9, from `git ls-remote`).
Files were fetched from `https://raw.githubusercontent.com/antiwork/gumroad/1b91d45…/<path>`.

| Path | Lines | sha256 (first 12) |
|---|---|---|
| `app/models/refund_policy.rb` | 187 | `c0839176f775` |
| `app/models/product_refund_policy.rb` | 119 | `f2deaaf09ccf` |
| `app/controllers/api/v2/refund_policies_controller.rb` | 59 | `a5ebb8a7db6c` |
| `app/presenters/settings_presenter.rb` | 823 | `e52280ce8441` |
| `app/javascript/pages/Settings/Main/Show.tsx` | 647 | `0265fd7c1601` |
| `app/presenters/receipt_presenter/item_info.rb` | 360 | `2cc2f51b50c3` |
| `app/views/help_center/articles/contents/_51-what-is-gumroads-refund-policy.html.erb` | 17 | `4cd808432b4a` |
| `app/views/help_center/articles/contents/_335-custom-refund-policy.html.erb` | 21 | `199536b275f7` |
| `app/views/help_center/articles/contents/_190-how-do-i-get-a-refund.html.erb` | 39 | `99a453135dd1` |
| `app/views/help_center/articles/contents/_47-how-to-refund-a-customer.html.erb` | 40 | `89f2659afd14` |
| `app/views/contacting_creator_mailer/upcoming_refund_policy_change.html.erb` | 42 | `176833d8efb7` |
| `app/views/home/terms.html.erb` | 766 | `117c198b4222` |
| `app/models/help_center/articles.yml` | 642 | `15dff8e29178` |
| `config/routes.rb` | 1551 | `04818524a104` |
| `app/controllers/help_center/articles_controller.rb` | 56 | `7276c5c723a8` |
| `app/controllers/api/v2/help_articles_controller.rb` | 38 | `2bf45faebdac` |
| `app/presenters/help_center_presenter.rb` | — | `bfb3001c2914` |

Short names below: `RP` = refund_policy.rb, `RPC` = refund_policies_controller.rb, `A51`/`A335`/`A190`/`A47` = the four
article partials, `TERMS` = terms.html.erb.

**Israeli law**, `lawsofisrael/lawsofisrael` at `aeca0b25fa4542f4d9bddf76ccdf862f5347b188` (main), folder
`2023-03-06/israel/`. The README says: "public domain", and the files are "from different source[s]". Its `listing/`
pages are saved nevo.co.il search-result pages, and each entry carries nevo's database id and document links.

| File (under `2023-03-06/israel/`) | git blob | Consolidation date printed in the file's own header |
|---|---|---|
| `docs/חוק הגנת הצרכן, תשמ%22א-1981.docx` | `91a3f5c75348` | "נוסח עדכני נכון ליום 03.10.2022" |
| `docs/תקנות הגנת הצרכן (ביטול עסקה), תשע%22א-2010.docx` | `50d994871055` | "נוסח עדכני נכון ליום 10.08.2022" |
| `docs/חוק המחשבים, תשנ%22ה-1995.docx` | `362afeaedfab` | "נוסח עדכני נכון ליום 10.08.2022" |
| `listing/page_002.html` (consumer law entry, nevo id `70305`) | — | — |
| `listing/page_040.html` (cancellation regulations entry, nevo id `84257`) | — | — |
| `listing/page_004.html` (Computers Law entry, nevo id `72393`) | — | — |

**How the law quotes are located.** A `.docx` has no line numbers. I extracted `word/document.xml` with Python's
`zipfile` and `xml.etree.ElementTree`. Each `w:p` became one line; its own `w:t` text was joined, `w:tab` became a tab,
and nested paragraphs were skipped. Runs of tabs were then collapsed to one space (`tr -s '\t' ' '`). Line numbers
below are line numbers in that extraction: `CPL:n` for the consumer law, `REG:n` for the regulations, `COMP:n` for the
Computers Law. Two lines, `CPL:824` and `CPL:839`, contain a no-break space (U+00A0), so the quotes from them are
shorter spans without it. The extraction is not stored in the repo; rerun it on the pinned blob to check any quote.

**Third-party reads of the live nevo page (github, secondary):** `nm-digitalhub/KALFA-RSVP-React` at `77f686b3fe68`,
`.claude/agents/shared/legal-catalog-israel.md` (1,072 lines, sha256 `b851107c574f`).

---

## Part 1. Gumroad's refund policy

### 1.1 The periods a seller can set, and the default (github)
- `RP:8-15`: `ALLOWED_REFUND_PERIODS_IN_DAYS` maps `0 => "No refunds allowed",` (`RP:9`), `7 => "7-day money back
  guarantee",` (`:10`), `14 => "14-day money back guarantee",` (`:11`), `30 => "30-day money back guarantee",`
  (`:12`) and `183 => "6-month money back guarantee",` (`:13`). It then sets `DEFAULT_REFUND_PERIOD_IN_DAYS = 30`
  (`:15`), and the model rejects any other value (`validates :max_refund_period_in_days, inclusion:`, `:26`).
- The API accepts the same five: `REFUND_PERIOD_ALLOWED_VALUES = %w[none 7 14 30 183].freeze` (`RPC:4`). This matches
  the values in `tests/gumroad-pro-product.test.js:309` that ruling (h) cites (repo).
- **Fine print cannot contradict a positive window.** A comment says: `A positive window plus "all sales are final" is
  the contradiction.` (`RP:51`). An AI classifier then refuses the save with `errors.add(:fine_print, "cannot state
  that refunds are not allowed")` (`RP:120`). [inference] A 30-day policy whose fine print says "no refunds" cannot be
  saved, so the page's A1 line and Gumroad's policy cannot drift apart that way.
- **Account-level or per-product.** The API writes the seller's account-level policy and reports whether it applies.
  It says `in_effect: current_resource_owner.account_level_refund_policy_enabled?,` (`RPC:52`) and refuses writes
  with "The account-level refund policy is not in effect for this seller." (`RPC:12`). The settings page shows this
  when the account level is not in effect: "Account-level refund policies are currently managed by Gumroad and can't
  be edited here. Refunds are" / "handled per product instead — you can set a refund policy on each product in the
  product editor." (`Show.tsx:367-368`). `A335:4` describes the per-product toggle. [inference] This is why ruling
  (h) reads `in_effect` before trusting the account value.
- **A stale mailer.** `upcoming_refund_policy_change.html.erb:13` says "Two refund policy options will be available:",
  listing 30 days and no refunds. The model and API today allow five (above). The mailer is an older announcement, not
  the current rule.
- **Enforcement.** "If your account is set to "No refunds allowed" at that point, we automatically update it to a
  30-day money-back guarantee" (`A51:6`, when disputes exceed 1% of customers). While a policy is enforced, the "No
  refunds" option is hidden: `allowed_periods -= [0] if seller.refund_policy_enforced?` (`settings_presenter.rb:308`).

### 1.2 What the buyer sees (github)
- **On the product page:** "The refund policy will be shown on the product page. If fine print is provided, the policy
  will be clickable and the details will be displayed to the customer in a modal:" (`A335:6`).
- **On the receipt:** the receipt line for the purchase carries the policy. The code is `label: refund_policy.title,` /
  `value: refund_policy.fine_print,` (`item_info.rb:265-266`), and the policy is the one frozen on the purchase
  (`purchase_refund_policy`, `:260`). [inference] The receipt names the period, for example "30-day money back
  guarantee". It does not say how to cancel unless the fine print does.
- **How the buyer asks:** "You can contact the creator by replying directly to your receipt email:" (`A190:14`).

### 1.3 Who issues the refund (github)
- The creator does. The article says: "When you buy a product from a Gumroad creator, Gumroad only processes payments on
  behalf of that creator." Creators may "set their own refund policies" "and issue their own refunds to their customers
  (i.e. you!)." (`A190:10`).
- Gumroad can refund too:
  - "That said, Gumroad reserves the right to issue refunds within 90 days of purchase, at its discretion, to prevent
    chargebacks." (`A51:3`)
  - "Please write to us if you haven’t heard back from the creator for 30 days since first contacting them" (`A190:12`).
  - A stated policy "allows Gumroad Support to issue refunds (or not) on your behalf." (`A335:2`).
- The terms: "Gumroad will handle Buyers' requests for refunds, chargebacks and other disputes with Buyers in Gumroad's
  sole discretion." (`TERMS:213`, §7.1(a)). The MoR services include "handling Buyers' requests for refunds" (`TERMS:172`).

### 1.4 Balance, and who pays (github): REOPEN IF (ii)
- A seller's own refund needs a balance: "Refunds can only be processed if your balance is able to cover the transaction
  amount. If your balance is too low you will need to make additional sales until the refund can be issued." (`A47:12`).
- A refund Gumroad issues is charged back to the seller: "Supplier is responsible for reimbursing Gumroad for the amount
  of any monies paid by Gumroad to Buyers" (`TERMS:213`).
- Fees: Gumroad's fee on the refunded part is returned, but "The underlying payment-processing portion of the fee is
  retained, because payment processors do not return it to Gumroad on a refund." (`A47:31`).
- A full refund ends access: "In the case of a full refund, customers will no longer be able to access the content or
  receive the respective product’s updates." (`A47:28`).
- [inference] REOPEN (ii) asked whether Gumroad refunds from a zero balance by clawing back payouts. It does not say
  "claw back". It does make the seller liable for any refund it issues, from any balance. So the balance note is a cost
  rule, as the ruling anticipated: each refund costs the price plus the retained processing fee. The first real refund
  should still record what happened (ruling (h) REOPEN (iii)).

### 1.5 Merchant of record and local consumer law (github)
- Gumroad is appointed reseller: "You hereby appoint Gumroad as your non-exclusive reseller of the Digital Products"
  (`TERMS:153`, §6.1). It acts "as merchant of record for the resale of each Product" (`TERMS:180`) under "Gumroad
  Merchant of Record Services." (`TERMS:73`, §1.1).
- But the licence runs from the seller: "each of your Products that is resold through the Services is licensed by you
  through Gumroad to the relevant Buyer" (`TERMS:196`).
- Buyer default: "Except as set forth below, all purchases through the Platform are final and Buyer is responsible for
  all approved charges." (`TERMS:228`, §8.1).
- Seller duty: communications must "(ii) otherwise comply with all applicable laws, regulations, advisories, and
  policies related to consumer protection." (`TERMS:303`, §11.2(b)).
- Territorial clause: "Those who access or use the Services from other countries do so at their own volition and are
  responsible for compliance with local law." (`TERMS:580`, §24).
- The one foreign consumer law Gumroad applies is Brazil's: "Brazilian law (Consumer Protection Code, Article 49) gives
  them 7 days from delivery to withdraw from a distance purchase, including digital products. We honor that request
  even when the product is set to no refunds" (`A51:4`). The same rule appears in `A190:22` and `A335:2`.
- **Israel is not mentioned in any refund article.** A code search of `app/views/help_center` for `Israel` returns
  three articles (`_275-paypal-connect`, `_13-getting-paid`, `_46-what-currency-does-gumroad-use`), none about refunds.
- The terms say "Last Updated Date: September 14, 2026" (`TERMS:4`).
- [inference] **Who is the Israeli "עוסק" in a Gumroad sale is not settled by these texts.** The terms make Gumroad the
  reseller and merchant of record, which points to Gumroad. They also make the seller the licensor, which points to the
  owner. This matters beyond refunds: 14ג(א)(1) (below) makes the dealer disclose "…והכתובת של העוסק בארץ ובחוץ לארץ;",
  that is, name, ID number and address. If the owner were the dealer in a distance sale, that disclosure would collide
  with MISSION's identity rule. If Gumroad is the dealer, Gumroad's own details apply. This is a question for the
  board, not a finding.

### 1.6 The public URL of the articles (rendered + github)
- Routes: `namespace :help_center, path: "help" do` (`routes.rb:547`) and `resources :articles, only: [:index,
  :show], param: :slug, path: "article"` (`:552`). Slugs: `slug: "51-what-is-gumroads-refund-policy"` (`articles.yml:53`),
  `"335-custom-refund-policy"` (`:569`), `"190-how-do-i-get-a-refund"` (`:273`).
- **The row-155 capture already names them.** `research/rendered/gumroad-help-center-index.html:51` (fetchedAt
  2026-09-29T08:59:29Z, 31,700 bytes) contains `/help/article/51-what-is-gumroads-refund-policy`,
  `/help/article/335-custom-refund-policy`, `/help/article/190-how-do-i-get-a-refund` and
  `/help/article/47-how-to-refund-a-customer`, together with the title `Gumroad&#39;s refund policy`. They sit inside
  the Inertia `data-page="…"` attribute, which the text extractor strips. So the `.txt` is only `Gumroad Help Center`
  (20 bytes), but the `.html` holds the whole help-centre index as JSON (rendered).
  - **Correction to tick 16:** row 155 was not a bare JavaScript shell. Its index is readable by decoding the
    attribute (`html.unescape`, then `json.loads`).
- **An article page will carry its own text the same way.** The web controller renders `render inertia:
  "HelpCenter/Articles/Show", props: help_center_presenter.article_props(article)` (`articles_controller.rb:43`). The
  props include `content: view_context.render(article),` (`help_center_presenter.rb:25`), which is the article's
  rendered HTML. [inference] A plain GET of an article therefore stores the full text in the `.html`'s `data-page`
  attribute, and no `js` flag is needed. The reader decodes that attribute, not the `.txt`.
- The plain-text API route (`routes.rb:111`, `path: "help/articles"`) needs an OAuth token: `before_action -> {
  doorkeeper_authorize!(…) }` (`help_articles_controller.rb:17`). It is not a runner route.
- `A190:11` links `https://gumroad.com/help/article/283-fraudulent-purchases`, which confirms the host plus path shape
  of live article URLs (github).

---

## Part 2. חוק הגנת הצרכן 14ג and the cancellation regulations

### 2.1 The readable route (github)
- **The row-154 URL is a different law.** `research/rendered/nevo-consumer-protection-law.txt:1` is "תקנות בתי המשפט
  (מחלקה לניתוב תיקים בבתי המשפט ובבתי הדין לעבודה), תשס"ב-2002" (rendered). The `law01/055_001.htm` path was a guess
  in a scout file (`risk-governance--consumer-protection.md:114-116`, repo).
- **nevo's id for the law is 70305.** The mirrored nevo listing names "חוק הגנת הצרכן, תשמ"א-1981" with the document link
  `https://www.nevo.co.il/law_word/law00/70305.docx` (`listing/page_002.html`, lawsofisrael, github).
  `https://www.nevo.co.il/law_html/law00/70305.htm` appears verbatim in several GitHub repositories as the law's full
  text, for example:
  - `skills-il/communication` `israeli-customer-support-automator/SKILL.md` ("Consumer Protection Law (Full Text)").
  - `nm-digitalhub/KALFA-RSVP-React` `.claude/skills/israeli-consumer-contract-law/references/core-laws.json` ("verified
    live 2026-07-26 (consolidation stamped 02-04-2026)").
  - The legal catalogue above: "נוסח עדכני נכון ליום: 02-08-2026" (`legal-catalog-israel.md:424`).
  - These are third-party reports that a live fetch worked (github). The id match between the listing and these URLs
    is what makes this URL found rather than guessed.
- **The regulations are nevo id 84257.** The listing names "תקנות הגנת הצרכן (ביטול עסקה), תשע"א-2010" with
  `https://www.nevo.co.il/law_word/law00/84257.docx` (`listing/page_040.html`).
  `https://www.nevo.co.il/law_html/law00/84257.htm` appears verbatim in `meytalp-dev/ort-training`
  `docs/learni/financial-teacher-kit/unit-07-consumer-rights/israel-research.md`.
- **Computers Law, nevo id 72393**, `https://www.nevo.co.il/law_html/law00/72393.htm`: verbatim in `AmitPinchasi/amittech`
  and matched by the listing's `law_word/law00/72393.docx` (`listing/page_004.html`).
- **Fallback:** the same repository `meytalp-dev/ort-training` links the Wikisource consolidated text at
  `https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%94%D7%92%D7%A0%D7%AA_%D7%94%D7%A6%D7%A8%D7%9B%D7%9F`.
- **Knesset database:** the only Knesset URL found for this law is a bills page
  (`main.knesset.gov.il/APPS/legislation/main/bills/148395`, in `core-laws.json`), not consolidated text. It is not
  queued.
- The nevo host rendered to the runner on 29.9 (`nevo-consumer-protection-law.meta.json`: status 200, `text/html;
  charset=utf-8`; the `.txt` is readable Hebrew), so a plain GET is expected to work (rendered).

### 2.2 Section 14ג as consolidated on 3.10.2022 (github; currency caveat in 2.5)
- Opening: "14ג. (א) בשיווק מרחוק חייב העוסק לגלות לצרכן פרטים אלה לפחות:" (`CPL:822`). The list includes the dealer's
  identity, "והכתובת של העוסק בארץ ובחוץ לארץ;" (`CPL:824`, item (1), which begins with the name and ID number), and
  "(7) פרטים בדבר זכות הצרכן לבטל את החוזה בהתאם להוראות סעיף קטן (ג) או סעיף 14ג1(ג)." (`CPL:830`).
- The written document the dealer supplies includes "(3) האופן שבו יכול הצרכן לממש את זכותו לבטל את העסקה בהתאם
  להוראות סעיף קטן (ג) או סעיף 14ג1(ג);" (`CPL:834`).
- The right: "(ג) בעסקת מכר מרחוק רשאי הצרכן לבטל את העסקה –" (`CPL:838`). For an asset, "(1) בנכס – מיום עשיית
  העסקה ועד ארבעה עשר ימים מיום קבלת הנכס" (`CPL:839`). For a service, "(2) בשירות – בתוך ארבעה עשר ימים מיום עשיית
  העסקה או מיום קבלת המסמך המכיל את הפרטים האמורים בסעיף קטן (ב), לפי המאוחר" (`CPL:840`).
- **The exclusions, 14ג(ד), in full:** "(ד) הוראות סעיף קטן (ג) וסעיף 14ג1(ג) לא יחולו על עסקת מכר מרחוק של –"
  (`CPL:841`):
  - "(1) טובין פסידים;" (`CPL:842`)
  - (2) hospitality and travel services within 7 days (`CPL:843`)
  - "(3) מידע כהגדרתו בחוק המחשבים, התשנ"ה-1995;" (`CPL:844`)
  - "(4) טובין שיוצרו במיוחד בעבור הצרכן בעקבות העסקה;" (`CPL:845`)
  - "(5) טובין הניתנים להקלטה, לשעתוק או לשכפול, שהצרכן פתח את אריזתם המקורית." (`CPL:846`)
- Definitions: "עסקת מכר מרחוק" – התקשרות בעסקה של מכר נכס או של מתן שירות, כאשר ההתקשרות נעשית בעקבות שיווק מרחוק, ללא
  נוכחות משותפת של הצדדים לעסקה;" (`CPL:850`). Also: "שיווק מרחוק" – פניה של עוסק לצרכן באמצעות דואר, טלפון, רדיו,
  טלויזיה, תקשורת אלקטרונית מכל סוג שהוא" (`CPL:851`).
- 14ג1(ג), four months for a disabled person, a senior citizen or a new immigrant, applies "ובלבד שההתקשרות בעסקה
  כללה שיחה בין העוסק לצרכן, ובכלל זה שיחה באמצעות תקשורת אלקטרונית." (`CPL:861`). [inference] A Gumroad checkout
  involves no conversation, so the four-month period would not arise.

### 2.3 The fee cap, 14ה (github)
- Cancellation for a defect or breach: the dealer refunds "ולא יגבה מהצרכן דמי ביטול כלשהם;" (`CPL:883`).
- Cancellation for any other reason: the dealer refunds within 14 days, "זולת דמי ביטול בשיעור שלא יעלה על 5% ממחיר
  הנכס נושא החוזה או העסקה, או 100 שקלים חדשים, לפי הנמוך מביניהם;" (`CPL:886`).
- 14ה(ד) counts expenses as fees: ""דמי ביטול" – לרבות הוצאות או התחייבות בשל משלוח, אריזה או כל הוצאה או…"
  (`CPL:891`). **The same words appear in the 2026 third-party read of the live nevo page**
  (`legal-catalog-israel.md:429`, which dates its source "נוסח עדכני נכון ליום: 02-08-2026", `:424`) (github). That one
  clause, at least, is unchanged from 2022 to 2026.

### 2.4 What "מידע" means, and what it excludes (github)
- Computers Law §1: ""מידע" – נתונים, סימנים, מושגים או הוראות, למעט תוכנה, המובעים בשפה קריאת מחשב, והמאוחסנים במחשב
  או באמצעי אחסון אחר" (`COMP:64`).
- ""תוכנה" – קבוצת הוראות המובעות בשפה קריאת מחשב, המסוגלת לגרום לתיפקוד של מחשב או לביצוע פעולה על ידי מחשב"
  (`COMP:67`), and ""חומר מחשב" – תוכנה או מידע;" (`COMP:61`).
- [inference] 14ג(ד)(3) excludes "מידע" only, and the Computers Law's "מידע" expressly leaves out "תוכנה". So on the
  text, software is not in exclusion (3). The Pro purchase is a licence key that the page checks before it unlocks one
  feature of a web tool (`products/il-biz-tools/README.md:513-530`, repo). Whether that is "information", "software"
  or a service is a legal characterisation that no text read here makes. Exclusion (5) needs an opened "original
  packaging", which a key sent by email does not have.

### 2.5 The regulations of 2010 are not the distance-sale rules (github)
- Their preamble cites "בתוקף סמכותי לפי סעיף 14ו ו-37 לחוק הגנת הצרכן, התשמ"א-1981" (`REG:103`). Section 14ו
  governs cancelling purchases of listed goods and services generally. Distance sales are governed by 14ג itself.
- Regulation 2 lets a consumer cancel under paragraphs (1)-(7) for the goods and services in the Schedule: "2. צרכן
  רשאי לבטל הסכם בהתאם לפסקאות (1) עד (7)" (`REG:109`).
- Fee: "5. (א) ביטל הצרכן את הסכם הרכישה, כאמור בתקנה 2, רשאי העוסק לגבות מהצרכן דמי ביטול בשיעור של 5% ממחיר הטובין או
  מערך השירות או 100 שקלים חדשים לפי הנמוך מביניהם." (`REG:127`).
- The regulations' digital-content exception is regulation 6(א)(7), in the same words as 14ג(ד)(3): "6. (א) זכות
  הביטול כאמור בתקנות אלה לא תחול לגבי –" (`REG:130`), "(7) מידע כהגדרתו בחוק המחשבים, התשנ"ה-1995;" (`REG:138`) and
  "(8) טובין הניתנים להקלטה, לשעתוק או לשכפול, שהצרכן פתח את אריזתם המקורית;" (`REG:139`).
- [inference] For a Gumroad sale the regulations add nothing that 14ג and 14ה do not already say.

**Currency caveat.** The consumer-law text is nevo's consolidation of 3.10.2022, as mirrored on 6.3.2023. A 2026
third-party read of the live page quotes 14ה(ד) identically and cites 14ג(ג)(2) and 14ג(ד)(2) as they stand here
(`legal-catalog-israel.md:398, :468`). It does not quote 14ג(ד)(3). Whether (ד)(3) changed after October 2022 is
**unknown until the live page is rendered**.

### 2.6 What this settles for ruling (h), and what it does not
- **Settled, at github grade (2022 text):** the two secondary readings disagreed
  (`risk-governance--consumer-protection.md:40-53` vs `:100-112`, repo). On the text, "information" is excluded outright
  and is not conditioned on packaging. The packaging condition belongs to item (5), recordable goods. The first scout
  reading was right about (3), and the second one merged (3) with (5).
- **Not settled:** that the Pro licence is "information". "מידע" excludes "תוכנה" (2.4). So REOPEN (i)'s shortening
  trigger ("if it excludes digital information outright") is met for information but not shown to reach this product.
  [inference] **Ruling (h) stands as written:** a window of at least 14 days with no cancellation fee is lawful
  whether the Pro licence is excluded or not, and a zero fee stays under 14ה(ב)(1)'s cap.
- **The disclosure duty, if 14ג(ג) applies.** 14ג(א)(7) requires disclosing "details of the right to cancel", and the
  written document must state "the way the consumer can exercise it" (14ג(ב)(3), `CPL:834`). Gumroad's receipt carries
  the policy's title and fine print (1.2). [inference] A title like "30-day money back guarantee" states the period but
  not the method. Fine print on the Gumroad policy saying "reply to this receipt" would put the method on the receipt
  itself, which is where 14ג(ב) puts it. That is a suggested addition to ruling (h) APPLY 1, not a finding of
  non-compliance.
- **Who the "עוסק" is** (1.5) decides whose name, ID number and address 14ג(א)(1) requires. It is open, and it
  touches MISSION's identity rule.

---

## Next-render URLs (for `research/rendered/urls.txt`; every URL is written above with its source)

Retire row 154's line (`https://www.nevo.co.il/law_html/law01/055_001.htm`, `nevo-consumer-protection-law`). It
rendered the court-routing regulations, and the capture stays in git history as that.

| # | URL | Slug | What it settles |
|---|---|---|---|
| 1 | `https://www.nevo.co.il/law_html/law00/70305.htm` | `nevo-consumer-protection-law-70305` | Whether 14ג(ד)(3) still reads "מידע כהגדרתו בחוק המחשבים" in the live consolidation (the page prints "נוסח עדכני נכון ליום"), plus 14ג(א)-(ב) and 14ה(ב)(1) as they stand today. It moves 2.2-2.3 from github to rendered grade. |
| 2 | `https://gumroad.com/help/article/51-what-is-gumroads-refund-policy` | `gumroad-help-refund-policy` | The live seller-side policy: 90-day Gumroad refunds, Brazil, enforcement. Read the `.html`'s `data-page` attribute, not the `.txt`. |
| 3 | `https://gumroad.com/help/article/190-how-do-i-get-a-refund` | `gumroad-help-get-a-refund` | The live buyer route: who issues the refund, the 30-day escalation, reply-to-receipt. Same decoding. |
| 4 | `http://www.gumroad.com/terms` | `gumroad-terms` | §6.1, §7.1(a), §8.1, §11.2(b) and §24 at rendered grade: reseller/MoR versus licensor (who is the עוסק) and seller reimbursement (REOPEN (ii)). This is the link inside `A51:8`; `routes.rb:532` serves `/terms` from `home#terms`. |
| 5 | `https://www.nevo.co.il/law_html/law00/72393.htm` | `nevo-computers-law` | That "מידע" still excludes "תוכנה" today. That exclusion is what keeps REOPEN (i) from firing. |
| 6 | `https://gumroad.com/help/article/335-custom-refund-policy` | `gumroad-help-custom-refund-policy` | What the buyer sees on the product page (title and fine-print modal) and the per-product setting. Lower priority. |
| 7 | `https://www.nevo.co.il/law_html/law00/84257.htm` | `nevo-cancellation-regs-84257` | The live 2010 regulations (reg 6(א)(7)). Confirmatory only, since 2.5 shows they do not govern distance sales. |
| 8 | `https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%94%D7%92%D7%A0%D7%AA_%D7%94%D7%A6%D7%A8%D7%9B%D7%9F` | `wikisource-consumer-protection-law` | Fallback for 1, only if nevo refuses the runner. |
