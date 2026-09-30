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
  העסקה ועד ארבעה עשר ימים מיום קבלת הנכס" (`CPL:839`) **[superseded (tick 18): the full clause adds "or from
  receipt of the (ב) document, whichever is later"; see "29.9 (tick 18, rendered)" 1.2]**. For a service, "(2) בשירות – בתוך ארבעה עשר ימים מיום עשיית
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
**unknown until the live page is rendered**. **[superseded (tick 18): the live page, consolidated 02-08-2026, reads the
same; see "29.9 (tick 18, rendered)" 1.1]**

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

---

## 29.9 (tick 18, rendered)

**Read by:** reader A, tick 18, from the render-watch captures of ZERO-TESTS rows 160-163. Only the four captures
below were read. Every quote was checked with `grep -n -F` against the capture before it was written here.

| Short name | Capture (under `research/rendered/`) | fetchedAt (UTC) | sha256 (first 12) | Currency printed on the page |
|---|---|---|---|---|
| `R-CPL` | `nevo-consumer-protection-law-70305.txt` (2,459 lines) | 2026-09-29 09:56:41 | `6c974fa8962d` | "נוסח עדכני נכון ליום: 02-08-2026" (`R-CPL:3`) |
| `R-REG` | `nevo-cancellation-regulations.txt` (152 lines) | 2026-09-29 09:56:42 | `600f0cad4e67` | "נוסח עדכני נכון ליום: 18-09-2023" (`R-REG:3`) |
| `R-G51` | `gumroad-help-refund-policy.html` | 2026-09-29 09:56:44 | `0383ddba9a26` | none |
| `R-G335` | `gumroad-help-custom-refund-policy.html` | 2026-09-29 09:56:45 | `b6af26f38416` | none |

All four have status 200. The two Gumroad `.txt` files hold only the page title. Each article's text sits on line 51
of its `.html`, inside the Inertia `data-page` attribute. I decoded it with Python (`html.unescape`, then
`json.loads`), and the text is in `props.article.content`. The attribute stores `'` as `&#39;` and `"` as
`\&quot;`, so each English quote was grepped in that encoded form. Every Gumroad citation below is therefore line 51.
**This confirms the tick-17 inference in 1.6: a plain GET stores the whole article in `data-page`, and no `js` flag
is needed.**

### 1. Section 14ג, section 14ה and the regulations, at rendered grade

**1.1 The exclusions, 14ג(ד), are unchanged in the 2026 consolidation. The tick-17 list in 2.2 is confirmed
verbatim.**
- Chapeau: "(ד) הוראות סעיף קטן (ג) וסעיף 14ג1(ג) לא יחולו על עסקת מכר מרחוק של –" (`R-CPL:712`). The five items:
  - "(1) טובין פסידים;" (`R-CPL:714`)
  - "(2) שירותי הארחה, נסיעה, חופש או בילוי, אם מועד ביטול העסקה חל בתוך שבעה ימים שאינם ימי מנוחה, קודם למועד שבו אמור השירות להינתן;" (`R-CPL:716`)
  - "(3) מידע כהגדרתו בחוק המחשבים, התשנ"ה-1995;" (`R-CPL:718`)
  - "(4) טובין שיוצרו במיוחד בעבור הצרכן בעקבות העסקה;" (`R-CPL:720`)
  - "(5) טובין הניתנים להקלטה, לשעתוק או לשכפול, שהצרכן פתח את אריזתם המקורית." (`R-CPL:722`)
- One addition the tick-17 section did not quote: the Minister may exclude other distance sales. "(ה) השר, באישור
  ועדת הכלכלה של הכנסת, רשאי לקבוע עסקאות של מכר מרחוק, שאינן מנויות בסעיף קטן (ד), שהוראות סעיף זה, כולן או
  חלקן, לא יחולו עליהן." (`R-CPL:724`). No capture read here shows whether any such order exists.

**1.2 The cancellation window, 14ג(ג). This corrects a tick-17 quote.**
- "(ג) בעסקת מכר מרחוק רשאי הצרכן לבטל את העסקה –" (`R-CPL:706`).
- For an asset, the whole paragraph reads: "(1) בנכס – מיום עשיית העסקה ועד ארבעה עשר ימים מיום קבלת הנכס או מיום
  קבלת המסמך המכיל את הפרטים האמורים בסעיף קטן (ב), לפי המאוחר מביניהם;" (`R-CPL:708`).
  - **Tick 17 (2.2, `CPL:839`) quoted this only up to "מיום קבלת הנכס".** The rendered text adds "or from receipt of
    the (ב) document, whichever is later". [inference] Until the buyer receives the written 14ג(ב) document, the 14
    days do not start to run.
- For a service: "(2) בשירות – בתוך ארבעה עשר ימים מיום עשיית העסקה או מיום קבלת המסמך המכיל את הפרטים האמורים
  בסעיף קטן (ב), לפי המאוחר, כמפורט להלן:" (`R-CPL:710`). The rest of that line sets the rules for continuing and
  one-off services.
- Definitions that bear on a licence key:
  - `" נכס " – טובין, מקרקעין, זכויות, ניירות ערך כמשמעותם בחוק ניירות ערך, התשכ"ח-1968, ואיגרות חוב ממשלתיות;` (`R-CPL:39`)
  - `" עוסק " – מי שמוכר נכס או נותן שירות דרך עיסוק, כולל יצרן;` (`R-CPL:41`)
  - `" צרכן " – מי שקונה נכס או מקבל שירות מעוסק במהלך עיסוקו לשימוש שעיקרו אישי, ביתי או משפחתי;` (`R-CPL:49`)
  - `" עסקת מכר מרחוק " – התקשרות בעסקה של מכר נכס או של מתן שירות, כאשר ההתקשרות נעשית בעקבות שיווק מרחוק, ללא נוכחות משותפת של הצדדים לעסקה;` (`R-CPL:730`)
- The four-month period for a disabled person, a senior citizen or a new immigrant still requires a conversation:
  "ובלבד שההתקשרות בעסקה כללה שיחה בין העוסק לצרכן, ובכלל זה שיחה באמצעות תקשורת אלקטרונית." (`R-CPL:749`).
  Tick 17 (2.2) is confirmed.

**1.3 The fee cap, 14ה. The tick-17 quotes in 2.3 are confirmed.**
- A cancellation for a defect, non-conformity, late or missing supply, or any other breach is covered by "14ה. (א)
  ביטל צרכן חוזה לפי סעיפים 14א(ג), 14ג(ג) או 14ג1(ג) עקב פגם בנכס נושא החוזה או העסקה" (`R-CPL:789`). The dealer
  refunds within 14 days "ולא יגבה מהצרכן דמי ביטול כלשהם;" (`R-CPL:791`).
- Any other cancellation falls under "(ב) ביטל צרכן חוזה לפי סעיפים 14א(ג), 14ג(ג) או 14ג1(ג) שלא מהטעמים המנויים
  בסעיף קטן (א) –" (`R-CPL:795`). Its paragraph (1) reads "(1) יחזיר העוסק לצרכן, בתוך 14 ימים מיום קבלת ההודעה על
  הביטול, את אותו חלק ממחיר העסקה ששולם על ידי הצרכן" and ends "זולת דמי ביטול בשיעור שלא יעלה על 5% ממחיר הנכס
  נושא החוזה או העסקה, או 100 שקלים חדשים, לפי הנמוך מביניהם;" (both `R-CPL:797`).
- A continuing service that has begun: "(ב1) בלי לגרוע מהוראות סעיפים קטנים (א) ו-(ב), בוטלה עסקה מתמשכת כאמור
  בסעיף 14ג(ג) או 14ג1(ג), שהוחל במתן השירות לפיה, ישלם הצרכן את התמורה היחסית בעד השירות שניתן לו." (`R-CPL:801`).
- The cap includes expenses: "(ד) בסעיף זה, " דמי ביטול " – לרבות הוצאות או התחייבות בשל משלוח, אריזה או כל הוצאה או
  התחייבות אחרת שלטענת העוסק הוצאו על ידו או שהוא התחייב בהן בשל ההתקשרות בעסקה או בחוזה, או בשל ביטולה."
  (`R-CPL:807`).
- **The cap on a ₪79 sale** (arithmetic): 5% of ₪79 is ₪3.95, which is below ₪100, so at most ₪3.95 may be kept, and
  nothing when the cancellation is for a defect or breach.
  - [inference] Section 14ה, read in full (`R-CPL:789-807`), has no clause that passes card-clearing costs to the
    consumer. That clause exists only in the regulations (1.4), which govern 14ו cancellations. Under 14ה(ד) such a
    cost is part of the capped "דמי ביטול".

**1.4 The 2010 regulations (consolidated 18-09-2023). The tick-17 section 2.5 is confirmed.**
- They are made under 14ו: "בתוקף סמכותי לפי סעיף 14ו ו-37 לחוק הגנת הצרכן, התשמ"א-1981" (`R-REG:5`).
- Their right to cancel: "2. צרכן רשאי לבטל הסכם בהתאם לפסקאות (1) עד (7)" (`R-REG:17`), which applies to the
  Schedule's goods and services. Their "goods" means goods over ₪50: `" טובין " – טובין שהמחיר ששולם בעדם עולה על 50 שקלים חדשים.` (`R-REG:14`).
- The fee: "5. (א) ביטל הצרכן את הסכם הרכישה, כאמור בתקנה 2, רשאי העוסק לגבות מהצרכן דמי ביטול בשיעור של 5% ממחיר
  הטובין או מערך השירות או 100 שקלים חדשים לפי הנמוך מביניהם." (`R-REG:50`).
- New here, a clearing-fee pass-through that tick 17 did not quote: "(ב) נעשתה העסקה בכרטיס אשראי והוכיח העוסק לצרכן
  כי חברת כרטיסי האשראי או גוף אחר שעמו התקשר העוסק לביצוע סליקת כרטיסי אשראי, גבו ממנו תשלום בעד סליקת כרטיס
  האשראי בעסקה שבוטלה, רשאי העוסק לחייב את הצרכן גם בתשלום שנגבה ממנו." (`R-REG:52`). It is limited to cancellations
  under regulation 2.
- The exceptions: "6. (א) זכות הביטול כאמור בתקנות אלה לא תחול לגבי –" (`R-REG:55`). They include "(7) מידע כהגדרתו
  בחוק המחשבים, התשנ"ה-1995;" (`R-REG:69`) and "(8) טובין הניתנים להקלטה, לשעתוק או לשכפול, שהצרכן פתח את אריזתם
  המקורית;" (`R-REG:71`).
- The regulations define the packaging that item (8) and 14ג(ד)(5) mention: `" אריזה מקורית " – חפץ וכל חומר שהוא המשמש את היצרן או היבואן, כעטיפה למוצר שייצר או ייבא ושאינו מהווה חלק בלתי נפרד מהמוצר ואינו חיוני לצורך השימוש במוצר;` (`R-REG:10`).
  - [inference] That is a physical wrapper. The definition is the regulations' own, and the law does not adopt it
    for 14ג(ד)(5).

**1.5 Is a ₪79 downloadable licence key, sold by Gumroad as merchant of record to an Israeli consumer, excluded from
cancellation?**
- **Verdict: not shown to be excluded. The rendered text leaves it to one definition in another law.**
  - Items (1), (2) and (4) do not fit on their words [inference]: the key is not perishable, not hospitality or
    travel, and not made to the buyer's order.
  - Item (5) needs "אריזתם המקורית", which an emailed key has none of [inference; see 1.4 for the regulations'
    physical definition].
  - Item (3) excludes only "מידע כהגדרתו בחוק המחשבים" (`R-CPL:718`). The Computers Law was **not** rendered this tick.
    Its definition of "מידע", "למעט תוכנה" (tick 17 2.4, `COMP:64`), stays at github grade. On that text, software is
    not "information".
  - Whether a key that unlocks a feature of a web tool is "information", "software", a "right" (a "נכס" includes
    "זכויות", `R-CPL:39`) or a service is a characterisation no text read here makes.
- **If the right applies**, the buyer may cancel within 14 days of receiving the key or the 14ג(ב) document,
  whichever is later (`R-CPL:708`). The fee is capped at ₪3.95 on ₪79, and is zero for a defect or breach (1.3).
- **Foreign merchant of record.** Nothing in the captures read addresses jurisdiction over a foreign seller.
  14ג(א)(1) does expect a dealer with an address abroad ("בארץ ובחוץ לארץ", `R-CPL:678`). Whether Gumroad or the
  owner is the "עוסק" is still open, as in tick-17 1.5.

**1.6 The disclosure duties, before and after the sale**
- **Before the sale, while marketing at a distance.** The opening is "14ג. (א) בשיווק מרחוק חייב העוסק לגלות לצרכן
  פרטים אלה לפחות:" (`R-CPL:676`). The seven items:
  - "(1) השם, מספר הזהות והכתובת של העוסק בארץ ובחוץ לארץ;" (`:678`)
  - "(2) התכונות העיקריות של הנכס או של השירות;" (`:680`)
  - "(3) מחיר הנכס או השירות ותנאי התשלום האפשריים;" (`:682`)
  - "(4) מועד ודרך הספקת הנכס או השירות;" (`:684`)
  - "(5) התקופה שבה ההצעה תהיה בתוקף;" (`:686`)
  - "(6) פרטים בדבר אחריות לנכס;" (`:688`)
  - "(7) פרטים בדבר זכות הצרכן לבטל את החוזה בהתאם להוראות סעיף קטן (ג) או סעיף 14ג1(ג)." (`:690`)
- **By the time of supply, in writing.** "(ב) בעסקת מכר מרחוק יספק העוסק לצרכן בכתב, בעברית או בשפה שבה נעשתה הפניה
  לשיווק, לא יאוחר ממועד הספקת הנכס או השירות, מסמך הכולל פרטים אלה:" (`R-CPL:692`). The contents:
  - "(1) הפרטים האמורים בסעיף קטן (א)(1) ו-(2);" (`:694`)
  - "(2) מחיר הנכס או השירות ותנאי התשלום החלים על העסקה;" (`:696`)
  - "(3) האופן שבו יכול הצרכן לממש את זכותו לבטל את העסקה בהתאם להוראות סעיף קטן (ג) או סעיף 14ג1(ג);" (`:698`)
  - "(4) שם היצרן וארץ ייצור הנכס;" (`:700`)
  - "(5) מידע בדבר האחריות לנכס או לשירות;" (`:702`)
  - "(6) תנאים נוספים החלים על העסקה." (`:704`)
  - [inference] If the marketing is in Hebrew (the il-biz-tools pages are: `lang="he"` in
    `products/il-biz-tools/_site/vat.html`, repo), the document must be in Hebrew. A Gumroad
    receipt in English would not meet that on its own.
- **Section 14ט: how a consumer cancels, and the matching disclosure. Tick 17 did not cover it.** It applies to a
  right to cancel under the law **or under a contract**, so it covers a seller's own refund policy as well:
  - "14ט. (א) היתה לצרכן זכות לבטל עסקה לפי חוק זה או לפי חוזה, יאפשר לו העוסק לבטל את העסקה בהודעת ביטול שימסור לו
    הצרכן בכל אחת מהדרכים המפורטות להלן" (`R-CPL:857`). The ways are:
    - "(1) בעל פה – בטלפון או בהודעה בעל פה במקום העסק, למעט אם נקבע לפי החוק כי ביטול העסקה ייעשה בדרך של הודעה
      בכתב;" (`:859`)
    - "(2) בדואר רשום;" (`:861`)
    - "(3) בדואר אלקטרוני;" (`:863`)
    - "(4) בפקסימיליה, אם יש לעוסק;" (`:865`)
    - "(5) באינטרנט – בעסקה שניתן להתקשר לגביה עם צרכן באמצעי זה;" (`:867`)
  - "(ב) לעניין עסקה שניתן להתקשר לגביה עם צרכן באינטרנט, ייצור עוסק בדף הראשי של אתר האינטרנט שלו קישור ייעודי
    שבאמצעותו ניתן לשלוח הודעת ביטול בהתאם להוראות סעיף קטן (א)(5), שימוקם באופן מובלט וברור." (`R-CPL:871`)
  - "(ג) בהודעת ביטול יפרט הצרכן את שמו ומספר הזהות שלו" (`R-CPL:873`)
  - "(ד) עוסק יגלה לצרכן, בכתב, את הדרכים למסירת הודעת ביטול כאמור בסעיף קטן (א), את פרטי ההתקשרות הנוגעים לכל דרך
    ביטול כאמור באותו סעיף קטן, ואת הפרטים שיש לכלול בהודעת ביטול כאמור בסעיף קטן (ג), והכול לא יאוחר ממועד הספקת
    הטובין או השירותים;" (`R-CPL:875`)
  - "(ה) עוסק ימסור לצרכן מידע כאמור בסעיף קטן (ד) גם בכל אחד מאלה:" (`R-CPL:877`). The two places are:
    - "(1) בחשבונית, בקבלה או בהודעת תשלום" (`:879`)
    - "(2) אם יש לעוסק אתר אינטרנט – בדף הראשי של האתר, ואם ניתן להתקשר בעסקה באינטרנט כאמור בסעיף קטן (ב) –
      בסמוך לקישור הייעודי כאמור באותו סעיף קטן." (`:881`)
  - "(ו) פרטי מידע שיש לגלותו לצרכן לפי סעיפים קטנים (ד) ו-(ה) יופיעו בסמוך אחד לשני, בהבלטה מיוחדת ובאותיות ברורות
    וקריאות." (`R-CPL:883`)
  - "(ז) הוראות סעיף זה לא יחולו על ביטול עסקה לפי סעיף 14ו;" (`R-CPL:885`)
  - [inference] Two consequences, both conditional on who the "עוסק" is (tick-17 1.5, still open):
    - The tick-17 suggestion in 2.6 (fine print saying "reply to this receipt") covers way (3), email, only. 14ט(ד)
      asks the dealer to disclose every way in (א), with the contact details for each.
    - If the owner is the dealer, the il-biz-tools home page would need the dedicated cancellation link (14ט(ב)) and
      the disclosure next to it (14ט(ה)(2)). If Gumroad is the dealer, these duties fall on Gumroad's own site.

### 2. Gumroad articles 51 and 335, at rendered grade

**2.1 What the buyer sees, and how a seller's period shows**
- The seller sets the policy on the product: "You can set a custom refund policy by adding it to your product
  settings." (`R-G335:51`). The toggle is named "Specify a refund policy for this product" (`R-G335:51`).
- The article's own example wording: "Be clear about the conditions—whether it's a 30-day money-back guarantee or a
  firm no-refunds policy." (`R-G335:51`)
- Where it shows: "The refund policy will be shown on the product page. If fine print is provided, the policy will be
  clickable and the details will be displayed to the customer in a modal:" (`R-G335:51`). A deep link exists: "When
  the policy modal is visible on the product page, the product's URL contains an anchor so you can share that URL with
  customers to send them directly to the refund policy." (`R-G335:51`)
- **The rendered articles do not list the allowed periods.** They name only "No refunds allowed", "a 30-day
  money-back guarantee" and "7 days or more" (2.3). The five-period list (none, 7, 14, 30, 183) stays at github grade
  (tick 17 1.1). What the receipt shows stays at github grade too (tick 17 1.2, `item_info.rb`), because neither
  article mentions the receipt.

**2.2 Who issues refunds**
- The seller. Gumroad "allows and encourages its sellers to" set their own policies ("therefore Gumroad allows and
  encourages its sellers to", `R-G51:51`). Against a chargeback threat the article tells the seller: "If a customer is
  threatening a chargeback, we recommend that you offer them a" partial refund "using the feature we've provided you
  with." (`R-G51:51`). The article's related link for sellers is "Issuing a refund" (`47-how-to-refund-a-customer`,
  `R-G51:51`).
- Gumroad too, within 90 days: "That said, Gumroad reserves the right to issue refunds within 90 days of purchase, at
  its discretion, to prevent chargebacks." The seller is told afterwards: "If Gumroad support refunds a sale on your
  behalf, we'll email you to let you know, along with the reason for the refund." (both `R-G51:51`).
- A stated policy lets Gumroad Support act for the seller: "This helps your customers know what to expect and allows
  Gumroad Support to issue refunds (or not) on your behalf." It also travels into disputes: "We also include your
  policy in any credit card or PayPal dispute, providing an extra layer of protection for your business." (both
  `R-G335:51`).
- Enforcement is confirmed and refined:
  - "If more than 1% of your customers dispute their purchases, Gumroad enforces a refund policy on your entire
    account." (`R-G51:51`)
  - "If your account is set to "No refunds allowed" at that point, we automatically update it to a 30-day money-back
    guarantee; refund policies you already offer of 7 days or more stay as they are." (`R-G51:51`)
  - "To request a different refund period of at least 7 days, contact us with the specific steps you've taken to
    reduce disputes, and we'll apply the change for you." (`R-G51:51`)
  - The article adds that "refunding customers who ask is the fastest way to bring your dispute rate back down."
    (`R-G51:51`).
- Who issues the refund to a buyer who writes in, and the 30-day escalation, are in article 190. It was not rendered,
  so tick-17 1.3 (`A190:10-14`) stays at github grade.

**2.3 Local law**
- Brazil is the only local law named, and the rendered text narrows it: "Separately, if the buyer is a consumer in
  Brazil and the sale is a website purchase processed by Gumroad, Brazilian law (Consumer Protection Code, Article 49)
  gives them 7 days from delivery to withdraw from a distance purchase, including digital products." Then: "We honor
  that request even when the product is set to no refunds, and we will email you if we refund a sale on that basis."
  (both `R-G51:51`).
- Article 335 repeats it: "A no-refunds policy does not override the" Brazil withdrawal right, which Gumroad says
  "we honor for Brazilian consumers on website purchases processed by Gumroad." (`R-G335:51`).
- App sales are carved out: "In-app purchases are refunded by Apple or Google, not by Gumroad." (`R-G51:51`).
- **Israel is not mentioned.** A case-insensitive grep for "israel" over both `.html` files, sidebar included,
  returns 0 matches.
- The terms are linked, not quoted: `http://www.gumroad.com/terms` (`R-G51:51`). Tick-17 1.5 (MoR, §24 local law)
  stays at github grade.
- The tick-17 quotes `A51:3`, `A51:4`, `A51:6`, `A335:2` and `A335:6` are all confirmed by the rendered text. No
  tick-17 Gumroad claim is contradicted.

### 3. Tick-17 claims this section supersedes
- 2.2, `CPL:839`: the quote of 14ג(ג)(1) stopped before "או מיום קבלת המסמך … לפי המאוחר מביניהם" (1.2 above).
- 2.5, "Currency caveat": whether (ד)(3) changed after October 2022 is now settled. The live consolidation of
  02-08-2026 reads the same (1.1).

### 4. Next-render URLs (not yet captured; each has a written source)

| URL | Slug | Source of the URL | What it settles |
|---|---|---|---|
| `https://www.nevo.co.il/law_html/law00/72393.htm` | `nevo-computers-law` | tick 17 2.1 (lawsofisrael listing `page_004.html`, github) | Whether "מידע" still reads "למעט תוכנה". It is the one text that decides 1.5. |
| `http://www.gumroad.com/terms` | `gumroad-terms` | the link inside `R-G51:51` (rendered) | MoR versus licensor (who is the "עוסק"), §8.1 and §24, at rendered grade. |
| `https://gumroad.com/help/article/190-how-do-i-get-a-refund` | `gumroad-help-get-a-refund` | `gumroad-help-center-index.html:51` (rendered, tick 17 1.6) | The buyer route: creator first, then Gumroad after 30 days, and reply-to-receipt. |
| `https://gumroad.com/help/article/47-how-to-refund-a-customer` | `gumroad-help-issue-refund` | the relative link `47-how-to-refund-a-customer` in `R-G51:51` | How the seller refunds, the balance rule, and the fee retained (tick 17 1.4, github today). |

### What this settles for FABLE_QUEUE row 17
- (b): the live 14ג(ד) (consolidated 02-08-2026) excludes "(3) מידע כהגדרתו בחוק המחשבים, התשנ"ה-1995;" in the
  2022 words. 14ה(ב)(1) caps the fee at 5% or ₪100, whichever is lower (₪3.95 on ₪79). 14ה(א)(1) forbids any fee on a
  cancellation for a defect or breach.
- No rendered text excludes a software licence key. The exclusion turns on the Computers Law's "מידע", which is
  github grade only ("למעט תוכנה"), and that law is not yet captured.
- 14ג(ג)(1) runs 14 days from receipt of the asset or of the written 14ג(ב) document, whichever is later.
- 14ט (cancellation by phone, registered mail, email and internet; a home-page cancellation link; disclosure on the
  receipt) applies to a contractual refund right too. Whose duty it is still depends on whether Gumroad or the owner
  is the "עוסק".
- Gumroad's live articles: the seller sets the policy and refunds. Gumroad may refund within 90 days and emails the
  seller the reason. Brazil is the only local law named; Israel is absent.

---

## 29.9 (tick 19, rendered)

Rows 174-177 (captured 29.9 ~10:46 UTC by render-watch). Read by two Opus readers, each checked by an adversarial verifier.

### The Computers Law, at rendered grade (ZERO-TESTS row 174)

**Read by:** the tick-19 reader for ZERO-TESTS row 174. It read the capture below and the tick-18 captures `R-CPL` and
`R-REG`. It made one github re-read of the tick-17 copy, for comparison only. For the follow-up URL alone, it also read
`gumroad-help-center-index.html` (rendered) and one Gumroad source file (github). Every quote was checked with
`grep -n -F` against its file before it was written here.

| Short name | Capture (under `research/rendered/`) | fetchedAt (UTC) | sha256 (first 12) | Currency printed on the page |
|---|---|---|---|---|
| `R-COMP` | `nevo-computers-law.txt` (203 lines) | 2026-09-29 10:46:45 | `e1c8f3cbd934` | "נוסח עדכני נכון ליום: 18-09-2023" (`R-COMP:3`) |

The capture has status 200 and `firstFetch: true` (`nevo-computers-law.meta.json`). The `.txt` holds all thirteen
sections, from the title (`R-COMP:1`) to "13. תחילתו של חוק זה שלושה חודשים מיום פרסומו." (`R-COMP:203`). It does not
carry the signatures, which the 2022 github copy has. The only outside resources the `.html` loads are nevo's logo and
an ad script.

The page lists no amendments: "תיקונים אחרונים" has 0 matches in both the `.txt` and the `.html`. That proves little,
because the consumer-law capture has 0 matches too (`nevo-consumer-protection-law-70305.html`). That law has been
amended many times; it refers to its own "חוק הגנת הצרכן (תיקון מס' 39), התשע"ד-2014" (`R-CPL:1715`). [inference] These
nevo pages do not list amendments at all, so the missing list says nothing either way.

**CL.1 Section 1's definitions, verbatim.** The section opens "1. בחוק זה –" (`R-COMP:7`), under "פרק א' – הגדרות"
(`R-COMP:5`). The three definitions asked for:
- `" חומר מחשב " – תוכנה או מידע;` (`R-COMP:9`)
- `" מידע " – נתונים, סימנים, מושגים או הוראות, למעט תוכנה, המובעים בשפה קריאת מחשב, והמאוחסנים במחשב או באמצעי אחסון אחר, ובלבד שהנתונים, הסימנים, המושגים או ההוראות אינם מיועדים לשימוש במחשב עזר בלבד;` (`R-COMP:15`)
- `" תוכנה " – קבוצת הוראות המובעות בשפה קריאת מחשב, המסוגלת לגרום לתיפקוד של מחשב או לביצוע פעולה על ידי מחשב, והיא מגולמת, מוטבעת או מסומנת במכשיר או בחפץ, באמצעים אלקטרוניים, אלקטרומגנטיים, אלקטרוכימיים, אלקטרואופטיים או באמצעים אחרים, או שהיא טבועה או אחודה עם המחשב באופן כלשהו או שהיא נפרדת ממנו, והכל אם אינה מיועדת לשימוש במחשב עזר בלבד.` (`R-COMP:21`)

Those three rely on three more definitions:
- `" מחשב " – מכשיר הפועל באמצעות תוכנה לביצוע עיבוד אריתמטי או לוגי של נתונים, וציודו ההיקפי, לרבות מערכת מחשבים, אך למעט מחשב עזר;` (`R-COMP:11`)
- `" מחשב עזר " – מחשב המסוגל לבצע פעולות חישוב אריתמטיות בלבד ופעולות הכרוכות בביצוע פעולות כאמור;` (`R-COMP:13`)
- `" שפה קריאת מחשב " – צורת הבעה המתאימה למסירה, לפירוש או לעיבוד על ידי מחשב או מחשב עזר בלבד;` (`R-COMP:19`)

Section 1 has one more definition, which none of the three uses. It has no "למעט תוכנה" and no storage condition:
- `" פלט " – נתונים, סימנים, מושגים או הוראות, המופקים, בכל דרך שהיא, על ידי מחשב;` (`R-COMP:17`)

**CL.2 Does "מידע" exclude "תוכנה"? Yes, in the rendered text.**
- The words are "למעט תוכנה" (`R-COMP:15`).
- The two terms are also the two halves of "חומר מחשב" (`R-COMP:9`).
- The offences treat them as separate objects. Section 3(א)(1) begins "(1) מעביר לאחר או מאחסן במחשב מידע כוזב"
  (`R-COMP:34`), while 3(א)(2) begins "(2) כותב תוכנה, מעביר תוכנה לאחר או מאחסן תוכנה במחשב" (`R-COMP:36`).
- [inference] Where the line falls, on the words: both definitions can contain "הוראות". A set of instructions is "תוכנה"
  when it is "המסוגלת לגרום לתיפקוד של מחשב או לביצוע פעולה על ידי מחשב" (`R-COMP:21`). Data, signs, concepts or
  instructions that cannot do that are "מידע", provided they also meet the rest of `R-COMP:15`: they must be expressed in
  "שפה קריאת מחשב", stored, and not meant only for an auxiliary computer.
- [inference] Software counts as "תוכנה" even when "היא נפרדת ממנו" (`R-COMP:21`), that is, separate from the
  computer. So a program delivered as a separate download is still "תוכנה".

**CL.3 Which version the capture shows.**
- nevo stamps the page "נוסח עדכני נכון ליום: 18-09-2023" (`R-COMP:3`), and the page was fetched on 29.9.2026. It does
  not say what, if anything, changed on that date.
- The tick-17 github copy is stamped "נוסח עדכני נכון ליום 10.08.2022" (in its `word/header1.xml`). This tick fetched it
  again from raw.githubusercontent.com at lawsofisrael `aeca0b25`, and `git hash-object` gives blob `362afeaedfab`, the
  same blob tick 17 read. It was re-extracted the way "What was read" describes, and the line numbers 61, 64 and 67
  come out the same as tick 17's.
- Its `COMP:61`, `COMP:64` and `COMP:67` match `R-COMP:9`, `:15` and `:21` character for character after the dash
  (github, compared in Python). **The three definitions are the same in the 2022 and 2023 consolidations.**
- The same holds for the whole law, apart from spacing and quote marks (github, compared in Python). Every line of
  `R-COMP` after the stamp occurs in the 2022 extraction. The 2022 copy adds only a table of contents and the
  signatures.
- The cancellation regulations carry the same stamp, "נוסח עדכני נכון ליום: 18-09-2023" (`R-REG:3`). The two tick-17
  github copies also shared one date, "נוסח עדכני נכון ליום 10.08.2022" (`refund-law-il.md:64-65`). [inference] Two
  unrelated instruments with one date, twice, looks like nevo re-stamping pages in batches rather than an amendment to
  either. Nothing read here shows which.
- **Tick 17 (2.4) quoted both definitions short, not wrong.** Its "מידע" quote stops at "או באמצעי אחסון אחר"
  (`refund-law-il.md:258`), and its "תוכנה" quote stops at "לביצוע פעולה על ידי מחשב" (`:259`). Both definitions
  continue in 2022 and in 2023 alike.

**CL.4 What this means for 14ג(ד)(3)**

Item (3) excludes "(3) מידע כהגדרתו בחוק המחשבים, התשנ"ה-1995;" (`R-CPL:718`). It names "מידע" only. It does not name
"חומר מחשב" or "תוכנה". So it reaches what `R-COMP:15` calls "מידע". [inference] On the text, it stops short of
software. The open question is which side a product falls on, and the three products fall differently.
- **Where the Computers Law meant both halves, it said so** [inference]:
  - Section 11 of the Computers Law extends "חפץ" in the Criminal Procedure Ordinance to "חומר מחשב או בעל חיים"
    (`R-COMP:174`). It also takes in "מחשב", "חומר מחשב" and "פלט" together, "כהגדרתם בחוק המחשבים" (`R-COMP:178`).
  - 14ג(ד)(3) takes in "מידע" alone. That supports reading item (3) as stopping short of software. It does not settle
    the reading.
- **Downloadable software** [inference]:
  - A program is "קבוצת הוראות ... המסוגלת לגרום לתיפקוד של מחשב" (`R-COMP:21`), whether or not it is separate from the
    device, and "מידע" is "למעט תוכנה" (`R-COMP:15`).
  - On the words, item (3) does not reach it. Tick 17 described this case, and the rendered text confirms it.
- **The ₪79 Pro licence key** [inference]:
  - The buyer receives a key, not a program. Pro "sells **one** thing: your logo and accent colour on the printed
    document" (`products/il-biz-tools/README.md:560`, repo). "Gumroad mints and emails the key per sale" (`:567`). The
    buyer pastes the key into a page (`:568`) on a static site (`:510`). The page's code is served to every visitor, and
    the README says "A determined user can still bypass client-side gating by editing JavaScript" (`:588-589`).
  - The key cannot make a computer do anything. The page's code checks it. On the words, the key reads closer to
    "נתונים, סימנים" (`R-COMP:15`) than to "קבוצת הוראות ... המסוגלת לגרום לתיפקוד של מחשב" (`R-COMP:21`).
  - The same law, in an offence, speaks of "סיסמה, קוד גישה או מידע דומה" (`R-COMP:61`). It puts a password and an
    access code together with "similar information".
  - **So the fact that "מידע" excludes "תוכנה" does not by itself keep the key out of item (3).** The key stays out in
    either of two cases:
    - what is sold is characterised as something item (3) does not name: the software, a right ("נכס" includes
      "זכויות", `R-CPL:39`) or a service;
    - a key that a person reads and types is not "expressed in computer-readable language" (the doubt under the PDF
      guide below).

    The rendered text settles neither.
- **A digital PDF guide** [inference]:
  - A PDF of text is "נתונים, סימנים, מושגים" stored in a computer or on a storage medium. It is not a set of
    instructions that can make a computer function. Of the three products, it fits item (3) most easily on the words.
  - The one textual doubt is "שפה קריאת מחשב": "צורת הבעה המתאימה למסירה, לפירוש או לעיבוד על ידי מחשב או מחשב עזר
    בלבד" (`R-COMP:19`). The definition does not say whether text that a person reads is expressed in that form or only
    stored in it. A key that a person types raises the same doubt.
  - Pro today carries written Hebrew activation instructions and the key. The README says "a downloadable guide would be
    better still" (`README.md:48`, repo). Adding a PDF guide would add a part that fits "מידע" most plainly. The text
    says nothing about how a bundle is treated.

**CL.5 The rest of 14ג(ד), read against a licence key**

The chapeau and the five items are as quoted in tick-18 1.1 (`R-CPL:712-722`). Everything under the four items below is
[inference] unless a line is cited as text.
- **(1)** "טובין פסידים;" (`R-CPL:714`). A key does not perish on any ordinary reading.
- **(2)** Hospitality and travel services (`R-CPL:716`). Item (2) does not fit.
- **(4)** "(4) טובין שיוצרו במיוחד בעבור הצרכן בעקבות העסקה;" (`R-CPL:720`). Tick 18 (1.5) dismissed this item in one
  clause, "not made to the buyer's order" (`refund-law-il.md:414-415`). Those are not the item's words.
  - The words are "made especially for the consumer following the transaction", not "to the consumer's order". A key
    that Gumroad mints per sale (`README.md:567`, repo, citing Gumroad's `purchase.rb`) is produced after the sale, for
    one buyer.
  - "To the consumer's order" is the same law's wording in a different section. 4ג exempts from the dealer's
    return-policy duty (`R-CPL:211`, `:217`) "(3) טובין שיוצרו במיוחד לפי הזמנה של הצרכן;" (`R-CPL:223`). The law
    uses two different phrases in two places.
  - The regulations' parallel item is narrower still: "(2) טובין שיוצרו במיוחד בעבור הצרכן על פי מידות או דרישות
    מיוחדות;" (`R-REG:59`), that is, made to measure or to special requirements.
  - Two things stop this hook on the words. The key carries no specification from the buyer. And no text read says a
    key is "טובין": the consumer law's section 1 defines "נכס" as "טובין, מקרקעין, זכויות, ..." (`R-CPL:39`) but does
    not define "טובין" (`R-CPL:7-53`; `:39` is the only line there that contains "טובין").
- **(5)** "(5) טובין הניתנים להקלטה, לשעתוק או לשכפול, שהצרכן פתח את אריזתם המקורית." (`R-CPL:722`).
  - A key, a PDF and a program can all be copied, but the item also requires opened original packaging.
  - The law does not define "אריזה מקורית" (0 matches in `R-CPL`). The regulations define it for their own purposes as
    "חפץ וכל חומר שהוא ... כעטיפה למוצר" (`R-REG:10`), which tick 18 (1.4) read as a physical wrapper [inference].
  - On the words, a download has no original packaging.
- **(ה)** The Minister, with the Economy Committee's approval, "רשאי לקבוע" further distance sales to which the
  section does not apply (`R-CPL:724`). No capture read shows whether any such determination exists. No URL for one has
  a written source, so none is queued.
- **Outside (ד), 14ג(ג)(2) can narrow the right in practice** [inference]. This applies if the Pro purchase is a
  service.
  - For a service that is not continuing, the consumer may cancel only "בתנאי שביטול כאמור ייעשה לפחות שני ימים, שאינם
    ימי מנוחה, קודם למועד שבו אמור השירות להינתן." (`R-CPL:710`).
  - A continuing service may be cancelled "בין אם הוחל במתן השירות ובין אם לאו" (`R-CPL:710`). If it has begun, the
    consumer pays the proportional value (`R-CPL:801`).
  - The law defines the term for the whole Act ("13ג. (א) בחוק זה –", `R-CPL:465`): `" עסקה מתמשכת " – עסקה לרכישה של
    טובין או שירותים באופן מתמשך` (`R-CPL:467`). The text does not say whether a one-time ₪79 payment for a feature
    that stays unlocked is such a deal.
  - Which rule applies turns on the same characterisation question as CL.4.
- **Even if an exclusion reached the key, 14ט still applies** to a right to cancel given by contract ("לפי חוק זה או
  לפי חוזה", `R-CPL:857`; tick-18 1.6). [inference] The 30-day refund policy the ruling keeps ("Gumroad's 30-day default",
  `RULING-2026-09-29-lines.md:374`) would be such a right.

### Tick-17 and tick-18 claims this capture refines
- **Tick 17 2.4** (`COMP:61`, `COMP:64`, `COMP:67`) is now at rendered grade (`R-COMP:9`, `:15`, `:21`).
  - The tick-17 quotes were shortened, not changed (CL.3).
  - Currency, as far as nevo shows it: the page served on 29.9.2026 is stamped 18-09-2023 and has the same words as the
    10.08.2022 text. [inference] Nothing read rules out an amendment after 18-09-2023 that nevo has not consolidated.
    The missing amendment list is no evidence either way (see the note under the table).
- **Tick 18 1.5 and "What this settles"** (`refund-law-il.md:418-420`, `:554-555`):
  - "was **not** rendered this tick" and "github grade only … not yet captured" are superseded. The definition is now
    rendered.
  - The verdict "not shown to be excluded" stands.
  - The reason given in FABLE_QUEUE row 17 (b), "since "מידע" in the Computers Law excludes software"
    (`logs/FABLE_QUEUE.md:41`), holds for software only. For the key, the answer rests on characterisation (CL.4).
- **Tick 18 1.5, item (4)** (`refund-law-il.md:414-415`) is refined in CL.5. Its paraphrase, "made to the buyer's
  order", is 4ג(ד)(3)'s wording (`R-CPL:223`), not 14ג(ד)(4)'s.
- **The nevo-computers-law render rows** in tick 17's table (`refund-law-il.md:316`) and tick 18's table (`:545`) are
  now captured.

### Next-render URL (row-174 follow-up; it has a written source)

| URL | Slug | Source of the URL | What it settles |
|---|---|---|---|
| `https://gumroad.com/help/article/76-license-keys` | `gumroad-help-license-keys` | `research/breadth/scouts/storefront-rails.json:53`. Also rendered: `gumroad-help-center-index.html` data-page, JSON path `props.categories[6].articles[1].url` ("/help/article/76-license-keys", titled "License keys") | It would bring Gumroad's own words for what a key is to rendered grade: "authorize or revoke access to the software they have created". Today that is github grade (`_76-license-keys.html.erb:25` at `antiwork/gumroad` `1b91d45`, quoted in `README.md:44` and `gumroad-license-decision.md:24`). That is evidence for the key-versus-software characterisation in CL.4. Read the article from the `.html`'s `data-page` attribute. |

### What the Computers Law capture settles for FABLE_QUEUE row 17 (b), and what it leaves
- **Settled (rendered):**
  - "מידע" is defined "... למעט תוכנה ..." (`R-COMP:15`) on the live nevo page, stamped 18-09-2023.
  - 14ג(ד)(3) names "מידע" only (`R-CPL:718`).
- **Settled against the github copy:** the definitions of "מידע", "תוכנה" and "חומר מחשב", and the rest of the law,
  are word for word the 10.08.2022 text.
- **Settled on the words** [inference]: downloadable software is outside item (3).
- **Left to the board:**
  - What the ₪79 Pro purchase is. It could be the key string, which reads as "נתונים, סימנים", and this law groups
    "קוד גישה" with "מידע דומה" (`R-COMP:61`). It could also be the software, a right or a service.
  - Whether "שפה קריאת מחשב … בלבד" (`R-COMP:19`) reaches content that a person reads or types.
  - Whether a key minted per sale is "טובין שיוצרו במיוחד בעבור הצרכן בעקבות העסקה" (`R-CPL:720`), whose wording
    differs from 4ג(ד)(3)'s "לפי הזמנה של הצרכן" (`R-CPL:223`).
  - If it is a service, whether a one-time purchase is an "עסקה מתמשכת" (`R-CPL:467`).
  - Whether anything has been determined under 14ג(ה) (`R-CPL:724`).
  - A PDF guide fits "מידע" most plainly [inference].
- **Effect on ruling (h)** [inference]:
  - Nothing in `R-COMP` requires a change. On length and fee, a window of at least 14 days (Gumroad's 30-day default,
    `RULING-2026-09-29-lines.md:374`) with no fee stays within 14ג(ג) and 14ה whichever characterisation the board adopts.
  - That is not all of lawfulness. The statutory 14 days run from receipt of the asset or of the written 14ג(ב)
    document, whichever is later (`R-CPL:708`; for a service, `:710`). A window counted from purchase covers the
    statutory one only if that document arrives with the key. The document and the 14ט duties stay open, as in tick 18
    1.2 and 1.6.
  - REOPEN (i) could shorten the window only toward the 14-day floor the ruling already sets
    (`RULING-2026-09-29-lines.md:452-453`). It would need the board to rule the key "מידע" first.

### 29.9 tick 19: Gumroad's terms and articles 190 and 47 (rendered)

**Read by:** reader, tick 19, from the render-watch captures of ZERO-TESTS rows 175-177. Besides the three captures below, this section reads:
- the code named in T5;
- the tick-18 law capture (`R-CPL`, `nevo-consumer-protection-law-70305.txt`);
- four repo files, named where they are cited (`invoice.html`, `license.js`, `docs/OWNER_STEPS.he.md`, `logs/CHECKPOINT.md`);
- five files of Gumroad's public source, re-fetched on 29.9.2026 from raw.githubusercontent.com (antiwork/gumroad, `main`). These are github grade and are marked where they are used:
  - `app/controllers/api/v2/sales_controller.rb` (365 lines, sha256 `d1da9d8dd09a`);
  - `app/modules/purchase/refundable.rb` (879 lines, `e398af3161ca`);
  - `app/models/help_center/articles.yml` (`15dff8e29178`) and `app/controllers/help_center/articles_controller.rb` (`7276c5c723a8`), the same bytes tick 17 read;
  - `_47-how-to-refund-a-customer.html.erb` (`89f2659afd14`), also the same as tick 17.

Every quote was checked with `grep -n -F` against its file before it was written here.

| Short name | Capture (under `research/rendered/`) | fetchedAt (UTC) | sha256 (first 12) | Currency printed on the page |
|---|---|---|---|---|
| `R-TERMS` | `gumroad-terms.txt` (614 lines; body `gumroad-terms.html`) | 2026-09-29 10:46:46 | `6c4ab50be5f3` | "Last Updated Date: September 14, 2026" (`R-TERMS:18`) |
| `R-G190` | `gumroad-help-get-a-refund.html` | 2026-09-29 10:46:47 | `d814da7eb8e7` | none |
| `R-G47` | `gumroad-help-issue-refund.html` | 2026-09-29 10:46:48 | `901c974c2eb1` | none |

- **Status and where the text sits:**
  - All three returned status 200.
  - The terms `.txt` holds the full text.
  - Each article's `.txt` holds only its page title: "How do I get a refund? - Gumroad Help Center" and "Issuing a refund - Gumroad Help Center". The article text is on line 51 of each `.html`, inside the Inertia `data-page` attribute. I decoded it as in tick 18: `html.unescape`, then `json.loads`.
- **How the article citations read:** every `R-G190:51` and `R-G47:51` citation below is `data-page`, JSON path `props.article.content`, unless another path is named.
- **How the quotes were grepped:** in the raw attribute, `'` is stored as `&#39;` and `"` as `\&quot;`, while `’` and `‘` are stored as they are. Each quote was grepped in that form.
- **Live titles and categories** (`props.article.title`, `props.article.category.title`):
  - Article 190 is "How do I get a refund?" under "Receipts and refunds".
  - Article 47 is "Issuing a refund" under "Start selling".
- **The meta descriptions are stale:**
  - Article 47's description tags (`R-G47:39`, `:40`, `:43`, and `props._inertia_meta`) list "After issuing a refund Handling negative balances Refund fees". The body has no "Handling negative balances" section, and "negative" does not occur in `props.article.content`. The same description goes on "Please only issue refunds from your Gumr", so it once opened with the dashboard line. The live body opens with the balance rule instead.
  - Article 190's description lists "Website purchases In-app purchases Website purchases" (`R-G190:39`). It leaves out the Brazil section that the body has.
  - Why they are stale (github): the description is a separate stored field, `description: "In this article: Full refund Partial refund PayPal refund After issuing a refund Handling negative balances Refund fees Please only issue refunds from your Gumr"` (`articles.yml:50`). The controller copies it into the tags with `description = article.description` (`articles_controller.rb:29`). It does not follow edits to the body.
  - [inference] The descriptions summarise an older version of each article. This section cites the bodies only.
- **Israel:** a case-insensitive grep for "israel" returns 0 matches in all three captures, `.txt` and `.html`.

### T1. Who sells to the buyer, in the terms' own words (question 1)

**Gumroad is the reseller and merchant of record:**
- Under "1.1 Gumroad Merchant of Record Services." (`R-TERMS:66`), suppliers "to appoint Gumroad as such Suppliers' non-exclusive reseller of certain of their digital products" (`R-TERMS:67`).
- §6.1: "You acknowledge and agree that Gumroad is the merchant of record for the resale of your Products to the Buyers, and that you shall not issue any invoice or make any demand for payment to any Buyer in relation to any completed resale of your Products through the Services." (`R-TERMS:131`)
- The same section uses the verb "sell" of Gumroad: "Gumroad reserves the right not to sell any products that Gumroad considers in its sole discretion to be fraudulent or illegal under any applicable law." (`R-TERMS:131`)
- §6.2(b): "Gumroad will act as your non-exclusive reseller of your Products across all territories that Gumroad may in its sole discretion support" (`R-TERMS:139`).
- §6.3: "Gumroad, as merchant of record for the resale of each Product, reserves the right to set the price (or license fee) at which such Product is offered for resale to Buyers through the Services." (`R-TERMS:151`)

**The word "seller":**
- The terms call Gumroad "the seller" only in the tax clause. §6.2(e): "Gumroad will be treated as the seller of your Products for purposes of any relevant Indirect Tax (as defined below) in the jurisdiction(s) involved in each resale of your Products through the Services, and will provide tax collection, reporting and remittance services;" (`R-TERMS:148`)
- The terms' own definition calls the suppliers sellers: `The Services enable sellers of digital products (" Suppliers ")` (`R-TERMS:67`). As a whole word, "seller" occurs only at `:148`. "sellers" occurs only in this definition.

**Who collects and remits sales tax and VAT (§10):**
- The definition: `"Indirect Tax" includes any sales, use, value added or goods and services tax` (`R-TERMS:213`).
- §10.2: "As the merchant of record, Gumroad will be treated as the supplier or principal, for relevant Indirect Tax purposes, in respect of Products resold by Gumroad through the Services". It "will be responsible for the administration, collection, reporting and remittance of any relevant Indirect Tax (except in limited circumstances where the Buyer may be responsible, for example as outlined in Section 10.5 below)." (both `R-TERMS:216`)
- The same section adds a fallback: "When the treatment of Gumroad as a supplier or principal is not a relevant consideration for Indirect Tax purposes, if Gumroad determines it is responsible for the administration, collection, reporting and remittance of Indirect Tax in connection with Products resold through the Services, Gumroad will collect and remit the Indirect Tax in addition to the amounts otherwise required under these Terms of Services." (`R-TERMS:216`)
- §10.5, the reverse-charge exception: "Buyers outside the United States may also, in some circumstances, be required to account for value added tax or goods and services tax under a "reverse charge" mechanism." (`R-TERMS:225`)
- §10.6 leaves income tax with the supplier: "It is your personal responsibility to disclose your earnings to your relevant tax authority" (`R-TERMS:228`).
- §10.7: "Except where expressly stated otherwise, all prices on the Platform, and all amounts payable to Gumroad pursuant to this Agreement (or which reduce amounts payable by Gumroad), including Gumroad Fees, are exclusive of any applicable Indirect Tax" (`R-TERMS:231`). The sentence goes on: "and additional payment shall be made to cover such Indirect Tax, at the same time as the payment to which such Indirect Tax relates." (`R-TERMS:231`)
  - [inference] If Israeli VAT is a "relevant Indirect Tax" that Gumroad collects, an Israeli buyer may be charged more than the ₪79 shown. Article 121 (T8) would say.
- §10.8: "Gumroad shall be entitled to deduct an amount equal to any Indirect Tax in connection with the resale of a Product from any amounts otherwise payable to the applicable Supplier" (`R-TERMS:234`).
- The terms do not say which countries' taxes are "relevant", and they do not name Israel.

**The licence, the contract and the payments run on the supplier's side:**
- §6.7: "Notwithstanding the appointment of Gumroad as the authorized reseller of your Products and the merchant of record of each resale of your Products through the Services, you acknowledge and agree that each of your Products that is resold through the Services is licensed by you through Gumroad to the relevant Buyer." (`R-TERMS:163`)
- The same section: "you hereby authorize Gumroad to present the same to each Buyer of your Products in a manner that creates a binding contract between you and each such Buyer." (`R-TERMS:163`)
- §11.1: "All purchases made by Buyer are processed by Gumroad and its Third-Party Services Providers on behalf of Supplier to facilitate the settlement of proceeds to Supplier (less applicable fees and taxes)." (`R-TERMS:239`)
- The buyer-facing article says the same: "When you buy a product from a Gumroad creator, Gumroad only processes payments on behalf of that creator." (`R-G190:51`)
- §6.9: "(d) each of your Digital Products will conform to and perform as described in the applicable Product Documentation, and will be provided and licensed in compliance with all applicable laws;" (`R-TERMS:169`)

**Consumer law and local law are placed on the supplier and the user:**
- §11.2(b): the supplier's communications must "(ii) otherwise comply with all applicable laws, regulations, advisories, and policies related to consumer protection." (`R-TERMS:246`)
- §24: "Those who access or use the Services from other countries do so at their own volition and are responsible for compliance with local law." (`R-TERMS:453`)
- The one consumer body named is California's: "27.5 Consumer Complaints." and "In accordance with California Civil Code §1789.3, you may report" (`R-TERMS:555-556`). The governing law is "INTERPRETED BY AND UNDER THE LAWS OF THE STATE OF CALIFORNIA, CONSISTENT WITH THE" (`R-TERMS:569`; the same words at `:51`).
- The entity is "GUMROAD, INC." (`R-TERMS:22`). §27.4 gives its contact: "please contact us by mail at 548 Market St., San Francisco, CA 94104-5401 or email at support@gumroad.com." (`R-TERMS:553`)
- **One foreign consumer law Gumroad honours itself.** Article 190 says: "For website purchases processed by Gumroad, if you bought as a consumer in Brazil, Brazilian law (Consumer Protection Code, Article 49) gives you 7 days from delivery to withdraw from a distance purchase, including digital products, even if the listing says no refunds. Write to us within that window and we will refund the charge." (`R-G190:51`)
  - [inference] Gumroad acts as the party bound by a local distance-sale withdrawal right for Brazil. The captures show it doing so for no other country.

**What the owner's page tells the buyer (repo).** "Gumroad היא המוכרת הרשמית (merchant of record): היא גובה את התשלום ושולחת אליכם את הקבלה שלה במייל." (`products/il-biz-tools/invoice.html:247`, with its JSON-LD twin at `:65`). [inference] This matches §6.1. It translates "merchant of record" and does not decide who the "עוסק" is.

**Currency and version:**
- "If the retail price of a Product is listed in a currency other than United States Dollars (USD), Gumroad will calculate a USD price based upon an exchange rate determined by Gumroad." and "Regardless of listed currency, all transactions through the Services will settle in USD." (both `R-TERMS:208`)
- "Accounts that existed when the September 14, 2026 changes were posted are bound by them on October 14, 2026" (`R-TERMS:19`). For new users: "Any changes to the Agreement will be effective immediately for new users of the Service" (`R-TERMS:562`).
- [inference] The Gumroad account does not exist yet, so it will sign the 14.9.2026 text. Two things point that way:
  - Owner step 3 registers it "עם כתובת המייל של המותג מצעד 8 — לא כתובת אישית" (`docs/OWNER_STEPS.he.md:187`).
  - The token is still awaited: "AT-15/16 מחכות ל-`GUMROAD_ACCESS_TOKEN` (צעד 6)" (`logs/CHECKPOINT.md:292`).

**[inference] Who the Israeli "עוסק" is.** The law's definition is `" עוסק " – מי שמוכר נכס או נותן שירות דרך עיסוק, כולל יצרן;` (`R-CPL:41`).
- **Gumroad fits these words.**
  - It resells in the course of business, and §6.1 uses the verb "sell" of it (`:131`).
  - It honours Brazil's withdrawal law itself (`R-G190:51`).
  - The terms call it "the seller" only "for purposes of any relevant Indirect Tax" (`:148`), never for consumer law.
  - They put consumer-protection compliance on the supplier (`:246`) and local law on the user (`:453`).
- **The owner may fit too, on three grounds:**
  - The terms define suppliers as "sellers of digital products" (`:67`).
  - The licence and "a binding contract" run from the owner to the buyer (`:163`).
  - The definition includes "כולל יצרן" (a producer, i.e. the maker of the product). A reseller standing between the maker-licensor and the buyer does not obviously take the maker out of that word.
- **The terms do not make Gumroad the only "עוסק".** The safe reading for the board is that both may be. Gumroad's contract does not take 14ג/14ט duties off the owner, and it pushes local-law duties back to the supplier.
- This keeps tick-17 1.5's open question open, now on rendered text, with two new points: the "יצרן" limb and the terms' own word "sellers" for suppliers.
- **One side effect of §6.1:** the owner may not issue "any invoice" to a buyer of a Gumroad resale (`:131`). If the owner owes the written 14ג(ב) document, that document cannot be an invoice from the owner.

### T2. Refunds and chargebacks in the terms (question 2)

- **The terms have no 90-day refund window.** ZERO-TESTS row 175 listed "refunds within 90 days" among what the terms would show (`ZERO-TESTS.md:184`).
  - Every period in the terms was listed. The only "90 days" is the length of a reserve (below, `:264`). The others are the dispute and arbitration periods of §25-27.
  - The 90-day refund right comes from article 51: "Gumroad reserves the right to issue refunds within 90 days of purchase, at its discretion, to prevent chargebacks" (tick 18 2.2, `R-G51:51`).
- **Default: purchases are final.** §8.1: "Except as set forth below, all purchases through the Platform are final and Buyer is responsible for all approved charges." (`R-TERMS:189`)
  - What follows it, §8.2, covers subscriptions only.
  - [inference] So the terms give a one-time buyer no refund right. Any window comes from the product's refund policy (articles 51 and 335) or from law.
- **Gumroad handles buyers' requests.** §6.2 opens: "Gumroad will use commercially reasonable efforts to provide the following services" (`R-TERMS:133`). The services include:
  - (d): "Gumroad will provide to Buyers first-tier, post-sale support with respect to invoicing, handling Buyers' requests for refunds, chargebacks and other disputes with Buyers, and payment reconciliation;" (`R-TERMS:145`)
  - §7.1(a) adds: "Gumroad will handle Buyers' requests for refunds, chargebacks and other disputes with Buyers in Gumroad's sole discretion." and "The Supplier shall, at Gumroad's request, provide all information as may be requested by Gumroad to resolve Buyers' requests or disputes." (both `R-TERMS:177`)
- **Who pays for a refund:**
  - §7.1(a): "Supplier is responsible for reimbursing Gumroad for the amount of any monies paid by Gumroad to Buyers or Third-Party Service Providers, or any other parties, in connection with refunds, chargebacks or disputes, as well as for any other reasonable costs incurred by Gumroad in resolving these requests." (`R-TERMS:177`)
  - §6.4: "Gumroad may also offset against funds owed but not yet paid to Supplier via the Services any sums due, or reasonably likely to become due, to Gumroad pursuant to these Terms of Service." (`R-TERMS:154`)
  - §11.3(a) contemplates a negative balance, and makes it a ground for suspension: "or Supplier's Account becomes dormant and/or has a negative balance, Gumroad will have the right to immediately suspend or terminate Supplier's Account" (`R-TERMS:262`).
  - The phrase "claw back" does not occur in the terms. "claw" appears only in the site's navigation link "Gumclaw" (`R-TERMS:5`, `:9`, `:608`).
  - [github] Staff refunds skip the balance check. In Gumroad's refund model, the check sits inside `unless refunded_by_team_member` (`refundable.rb:92`), and `refunded_by_team_member = refunding_user_id.present? && User.find(refunding_user_id).is_team_member?` (`:75`).
  - [inference] This bears on ruling (h) REOPEN (ii) (`RULING-2026-09-29-lines.md:454-455`).
    - A refund Gumroad's staff issue need not be covered by the seller's balance, so it can leave the balance negative. Gumroad then offsets it against unpaid funds.
    - A seller's own refund needs a covering balance (article 47, T4).
    - The balance note is therefore a cost rule, as tick 17 1.4 concluded, and it is now at rendered grade. One more cost comes with it: a negative balance is a stated ground for suspension (`:262`).
- **Refund together with a chargeback.** §7.2(b): "If you request a refund and also pursue a dispute resolution process for the same transaction with your payment method provider for the applicable purchase, we will decline your refund request." It adds: "You agree not to submit a refund request for any Product if you have already chosen to pursue a dispute resolution process with your payment method provider." (both `R-TERMS:185`)
- **Refund-rate reserve and suspension (not weighed in ruling (h)):**
  - §11.3(b): "If Supplier (or Gumroad, when selling a specific Supplier's Products) experiences a refund rate in excess of 15%, Supplier hereby authorizes us to hold in reserve an amount equal to 25% of Supplier's funds pending settlement or not yet paid to you (as applicable) for 90 days on a rolling basis to offset the potential cost of future refunds." (`R-TERMS:264`)
  - The same section, above 25%: a supplier that "experiences a refund rate in excess of 25%, Supplier's Account may be suspended, terminated, or otherwise subject to additional conditions or fees." (`R-TERMS:264`)
  - §11.3(c) allows holds where "(ii) transactions in Supplier's Account present an elevated risk of chargeback, refund, dispute or loss to Gumroad or to Buyers;" (`R-TERMS:266`).
  - [inference] The terms do not define "refund rate" or the period it is measured over. The words "(or Gumroad, when selling a specific Supplier's Products)" suggest that refunds Gumroad itself issues count too.
  - [inference] On a low-volume ₪79 product the lines are close:
    - One refund in six sales is 16.7%, above the reserve line.
    - One refund in four sales is exactly 25%, which is not "in excess of" 25%. Two refunds in seven sales is 28.6%, above the suspension line.
  - [inference] An automatic responder that refunds every verified request inside the window lets buyers set that rate.
  - A grep of `RULING-2026-09-29-lines.md` for "15%", "reserve" and "refund rate" returns nothing.
- **Fees:** the terms do not say whether fees come back on a refund of a sale. Article 47 does (T4).
- **Subscriptions only.** §8.2(b) says "the Buyer will not be eligible for a prorated refund of any" (`R-TERMS:204`). Pro is a "fixed one-time price (no" / "membership, no pay-what-you-want)" (`gumroad-pro-product.js:23-24`), so this clause does not apply to it.

### T3. Article 190: what a buyer is told (question 3)

- **The creator issues refunds.** "When you buy a product from a Gumroad creator, Gumroad only processes payments on behalf of that creator. We allow creators on our platform to" set their own refund policies (a link to article 51) "and issue their own refunds to their customers (i.e. you!)." (`R-G190:51`)
- **Gumroad refunds at once in three cases only.** "Unfortunately, we can't issue an immediate refund unless the charge was" fraudulent (a link to article 283) "or a duplicate, or you qualify for the Brazil 7-day withdrawal for website purchases below." (`R-G190:51`)
- **Whom the buyer contacts.**
  - "If you have issues with the product you've purchased through Gumroad or feel you deserve a refund, you should contact the creator of the product." (`R-G190:51`)
  - "You can contact the creator by replying directly to your receipt email:" (`R-G190:51`)
  - `or by looking at the "reply-to" information on your purchase email` (`R-G190:51`)
  - If there is no receipt: "If you didn't receive a receipt, please first check the spam folder in your email inbox." (`R-G190:51`), then article 212.
- **The escalation.** "Please write to us if you haven’t heard back from the creator for 30 days since first contacting them, along with the proof of correspondence. We will reach out to them and will issue a refund if they continue to be unresponsive." (`R-G190:51`). The article gives no address for "write to us".
- **The window.** The article sets no refund window for a creator's product and does not mention article 51's 90 days. It names only two periods:
  - 30 days of silence from the creator (above).
  - Brazil's 7 days: "For website purchases processed by Gumroad, if you bought as a consumer in Brazil, Brazilian law (Consumer Protection Code, Article 49) gives you 7 days from delivery to withdraw from a distance purchase, including digital products, even if the listing says no refunds. Write to us within that window and we will refund the charge." (`R-G190:51`)
- **In-app purchases.** "Refunds for in-app purchases are handled independently by Apple/Google support, so if you made a purchase on the" Gumroad mobile app, "neither the creator nor Gumroad can refund your purchase." (`R-G190:51`)
- [inference] **The terms and this article point different ways.**
  - §6.2(d) promises Gumroad's "first-tier, post-sale support" on refund requests (`R-TERMS:145`).
  - The article sends the buyer to the creator first, and brings Gumroad in only after 30 days of silence.
  - The article's route is the one a buyer is shown, and it is the one the responder serves (T5).

### T4. Article 47: every way a seller can issue a refund (question 4)

- **One sanctioned place, the dashboard.** A red callout at the top of the article: "Please only issue refunds from your Gumroad dashboard. Our system does not support refunds issued directly from Stripe or PayPal accounts." (`R-G47:51`)
- **The balance must cover the refund.** The same callout, in its first paragraph: "Refunds can only be processed if your balance is able to cover the transaction amount. If your balance is too low you will need to make additional sales until the refund can be issued." (`R-G47:51`)
- **Full refund.** "Go to your" Sales dashboard (`https://gumroad.com/customers`) "and click on the sale to open the customer drawer. Then scroll down and click the" **Refund fully** button (`R-G47:51`).
- **Partial refund:**
  - "To issue a partial refund, enter the amount to be refunded in the ‘Refund’ box and click" **Issue partial refund** (`R-G47:51`).
  - "Your customer will still have access to their content after a partial refund." (`R-G47:51`)
  - For a membership pending cancellation with loss of access switched on, "issuing a partial refund will end the Membership and revoke the customer's access." (`R-G47:51`)
- **Currency.** "Customers are refunded in the currency they were charged. Where local-currency payment is supported, customers pay and are refunded in their own currency, and their refund email shows the refunded amount in that currency. For purchases charged in USD, the amount customers receive back in their local currency may be different than what they initially paid due to differences in exchange rates." (`R-G47:51`)
- **After the refund:**
  - "Customers receive an email confirmation after a refund is issued. Credit card funds usually take 5-10 business days to appear on the buyer’s account while PayPal refunds are immediate." (`R-G47:51`)
  - "In the case of a full refund, customers will no longer be able to access the content or receive the respective product’s updates." (`R-G47:51`)
  - "Refunding a customer fully will also delete any" product rating "they've given." (`R-G47:51`)
- **Fees on sales Gumroad processes.** "When a sale is refunded (fully or partially), your customer receives the full refunded amount, and Gumroad's own" fee (a link to article 66, `https://gumroad.com/help/article/66-gumroads-fees`) "on the refunded portion is returned to you. The underlying payment-processing portion of the fee is retained, because payment processors do not return it to Gumroad on a refund." (`R-G47:51`)
- **Fees on connected accounts:**
  - "Sales processed through your own connected payment account work differently: for" Stripe Connect "and" PayPal Connect "purchases, the processor keeps its fees on the sale, and you are responsible for Gumroad's and the processor's fees on the refund." (`R-G47:51`)
  - For PayPal Connect: "purchase, PayPal keeps its fees on the sale but refunds 100% of the amount to the customer. In this case, you would be responsible for Gumroad and PayPal's fees." (`R-G47:51`)
- **Time limits.** The article sets none. Its only period is the 5-10 business days a card refund takes to arrive.
- **The API.** The article does not mention it. "api" does not occur in `props.article.content`, and "/v2/" does not occur in either article's `.html`.
- **[inference] What one full refund of a ₪79 Gumroad-processed sale costs:**
  - The buyer gets the whole amount back. The owner loses the sale and bears the processing part of the fee, whose size article 66 (T8) would give.
  - Nothing falls on the buyer, so the refund stays inside 14ה(ב)(1)'s cap (tick 18 1.3).
  - One gap remains, the currency.
    - Pro is listed in shekels: `export const DEFAULT_CURRENCY = 'ils';` (`gumroad-pro-product.js:87`).
    - Under §9 Gumroad "will calculate a USD price" for a non-USD listing, and every transaction "will settle in USD" (`R-TERMS:208`).
    - If an Israeli buyer is charged in USD, the ₪ they get back "may be different than what they initially paid" (`R-G47:51`). Section 14ה(ב)(1) speaks of "את אותו חלק ממחיר העסקה ששולם על ידי הצרכן" (`R-CPL:797`).
  - [github] A comment in the refund endpoint says local-currency charging by card "only applies to USD-priced products" (`sales_controller.rb:185`). The non-USD methods it names are "euros, UPI in rupees" (`:187`).
  - [inference] If that holds, a card buyer of the shekel-listed Pro is charged in USD, and the gap applies. None of these captures says whether ILS is a "local-currency payment" currency. Article 46 (T8) would.

### T5. The respond-refunds path against these routes (question 5)

**What the code does (repo):**
- `scripts/brand_mail.py` runs the product script as a child process:
  - The command: `argv = ["node", PRODUCT_SCRIPT, "refund", "--email", sender, "--requested-at", iso_z(requested_at)]` (`brand_mail.py:1150`).
  - The script: `PRODUCT_SCRIPT = os.path.join(REPO_ROOT, "products", "il-biz-tools", "scripts", "gumroad-pro-product.js")` (`:169`).
  - The child's environment holds only the path and the token: `child_env = {"PATH": env.get("PATH") or os.defpath, "GUMROAD_ACCESS_TOKEN": env["GUMROAD_ACCESS_TOKEN"]}` (`:1153`).
  - The responder calls it once per request with `code, lines = refund_runner(sender, requested, args.apply, env)` (`:1281`), where `refund_runner = refund_runner or node_refund_runner` (`:1360`).
- The product script talks to the API, not the dashboard:
  - `export const API = 'https://api.gumroad.com/v2';` (`gumroad-pro-product.js:84`)
  - ``res = await fetchImpl(`${API}${path}`, init);`` (`:190`), with a Bearer header (`:183`).
- How it finds and refunds the sale. There are four calls, all to `/v2`:
  - It reads the product: ``const p = await gumroad({ fetchImpl, token, method: 'GET', path: `/products/${encodeURIComponent(productId)}`, log: say });`` (`:647`).
  - It reads the account's refund policy: `const r = await gumroad({ fetchImpl, token, method: 'GET', path: '/refund_policy', log });` (`:335`, called at `:649`). It refuses if no window of at least 14 days is in force.
  - It looks up the buyer's sales with `const q = new URLSearchParams({ email: address, product_id: productId });` (`:605`), which is `GET /v2/sales`. It keeps only sales inside the window measured at the request (`:658`).
  - It then sends ``const r = await gumroad({ fetchImpl, token, method: 'PUT', path: `/sales/${encodeURIComponent(sale.id)}/refund`, log: say });`` (`:671`).
  - No amount is sent. The header comment says "refunded in full (PUT /v2/sales/:id/refund, no amount: no cancellation" (`:58`).
- **The endpoint has never been run.** The header comment reads "// endpoint (api/v2/sales_controller.rb#refund, read 29.9.2026) answers with the" / "// sale, not a refund record, and refuses a sale already refunded; it has not" / "// been run." (`:71-73`).
- **The endpoint at github grade (re-fetched 29.9.2026):**
  - The scope: `before_action(only: [:refund]) { doorkeeper_authorize! :refund_sales, :edit_sales }` (`sales_controller.rb:7`). This confirms `research/tiktok/08-sales-marketing-lessons.md:394`.
  - It refuses a sale already refunded: `purchase.errors.add(:base, "Purchase is already refunded.")` (`:172`).
  - It takes an optional amount: `amount = params[:amount_cents].to_i / unit_scaling_factor(purchase.displayed_price_currency_type).to_f if params[:amount_cents].present?` (`:195`).
  - It refunds with `if purchase.refund!(refunding_user_id: current_resource_owner.id, amount:)` (`:197`) and answers with the sale: `success_with_sale(purchase.as_json(version: 2, include_buyer_presentment: true))` (`:198`). This matches the script's header.
  - The model method behind it refuses a seller's refund that the balance cannot cover: `if amount_cents_to_refund > seller.unpaid_balance_cents && charged_using_gumroad_merchant_account?` / `errors.add :base, "Your balance is insufficient to process this refund."` (`refundable.rb:99-100`).
  - It also refuses with `errors.add :base, "Refunds are temporarily disabled in your account."` (`:94`), and on an open dispute with `errors.add :base, ACTIVE_DISPUTE_REFUND_ERROR_MESSAGE` (`:59`).
  - [inference] So at github grade the API applies the balance rule article 47 states for the dashboard.

**Against the rendered routes:**
- **Is it a documented route? No.**
  - Article 47 documents only the dashboard, and says "Please only issue refunds from your Gumroad dashboard." (`R-G47:51`)
  - `PUT /v2/sales/:id/refund` occurs in none of the three captures: "/v2/" has 0 matches in `R-TERMS` `.txt` and `.html`, `R-G190` and `R-G47`.
  - The only "api" in the terms is the openexchangerates link (`R-TERMS:208`).
  - **No rendered page documents the endpoint.**
- **[inference] The callout can be read two ways:**
  - By its stated reason, the warning is about Stripe and PayPal accounts. The API route touches neither: it is Gumroad's own endpoint acting on the Gumroad sale.
  - Word for word, "only … from your Gumroad dashboard" excludes the API.
  - The rendered text does not settle which reading Gumroad means.
- **Do the terms forbid it? No clause names it.**
  - The terms neither grant nor bar refunds issued by the seller. §7.1(a) reserves only Gumroad's own handling, "in Gumroad's sole discretion" (`R-TERMS:177`).
  - §11.2(d) bars three things (all `R-TERMS:250`):
    - activity that could "circumvent the Gumroad Fee";
    - buyer terms that "reduce or limit Section 7 (Refunds, Chargebacks, Disputes)";
    - buyer terms that "otherwise impinge or interfere with Gumroad's rights under these Terms of Service or any other agreement."
  - [inference] A full refund on request gives the buyer more, and it returns Gumroad's fee under Gumroad's own rule (T4). So it does none of these.
  - [inference] Two general clauses could be read to reach it:
    - §11.2(f) requires the supplier to comply with "any Gumroad policy or standard that may be issued from time to time." (`R-TERMS:252`)
    - §14 bars conduct that "uses the Services in any way not expressly permitted by this Agreement" (`R-TERMS:336`). The agreement never mentions the API.
    - If article 47's "only from your Gumroad dashboard" is such a "policy or standard", the API route departs from it. The rendered text does not settle whether a help-article instruction is one.
- **Where the path matches the rendered text:**
  - **It refunds in full.** A full refund ends the buyer's access to the content (`R-G47:51`), and no Gumroad fee is kept.
    - Pro itself is switched off by the licence check, which revokes on Gumroad's `refunded` flag: `if (purchase.refunded === true) return { verdict: 'revoked', reason: 'refunded' };` (`products/il-biz-tools/src/lib/license.js:99`). Ruling (h) relies on this ("whose refund switches Pro off within a week", `RULING-2026-09-29-lines.md:410`).
    - [inference] It is the full refund that sets `refunded`. A partial refund is reported as `partially_refunded` (`gumroad-pro-product.js:597`) and would leave Pro on.
  - **It leaves disputed sales alone.** `const settled = (sale) => sale.refunded === true || sale.partially_refunded === true || sale.chargedback === true || sale.disputed === true;` (`gumroad-pro-product.js:597`). This agrees with §7.2(b), under which Gumroad itself declines a refund on a disputed sale (`R-TERMS:185`).
  - **A refusal is not answered as done.**
    - If Gumroad refuses the PUT, for example under the balance rule above, the request waits for the next run: ``throw stop(`${refusal(`PUT /v2/sales/${sale.id}/refund`, r)} Sale ${sale.id} is not refunded; the request is left for the next run.`);`` (`:673`).
    - The responder then writes `entry["outcome"] = "the refund command stopped: not answered, left for the next run"` (`brand_mail.py:1286`).
    - No rendered page says how the API answers a low balance. The github model above refuses it.
  - **The buyer's channel.**
    - The code's comment: "// request or a question goes to the email the Gumroad account was opened with." (`gumroad-pro-product.js:352`).
    - The page tells the buyer "משיבים למייל הקבלה מ-Gumroad" (`products/il-biz-tools/invoice.html:248`).
    - Article 190 tells the buyer to reply to the receipt or use its "reply-to" (`R-G190:51`).
    - [inference] That the receipt's reply-to is the account address is the code's assumption (`:351-352`). No rendered page says which address it is; article 204 (T8) would.
  - **The reply.**
    - `REFUND_REPLY` is "תשובה אוטומטית מ-Mehudak (מהודק): לפי מדיניות ההחזרים של Gumroad, רכישת Pro מהכתובת הזו בתוך תקופת ההחזר מוחזרת במלואה דרך Gumroad." (`brand_mail.py:212-213`, two string literals joined).
    - Gumroad also sends "an email confirmation after a refund is issued" (`R-G47:51`).
    - [inference] The responder's dated reply is also the "proof of correspondence" that article 190 asks for before Gumroad steps in.
    - [inference] "מדיניות ההחזרים של Gumroad" can be read as Gumroad's own policy. Article 190 tells the buyer that creators "set their own refund policies" (`R-G190:51`), so the reply would be exact as "the refund policy on Gumroad". This is a wording point, not a legal one.
  - **Mail from Gumroad is never answered:** `NEVER_ANSWERED_DOMAINS = ("gumroad.com",)` (`brand_mail.py:215`). [inference] A §7.1(a) request from Gumroad for information (`R-TERMS:177`) therefore needs someone reading the mailbox. The responder does not handle it.
- **[inference] Verdict:**
  - The path uses an API route that no rendered Gumroad page documents, next to a help article that says to refund "only" from the dashboard.
  - No clause of the terms names that route. Two general clauses (§11.2(f), §14 "not expressly permitted") could be read against it.
  - At github grade the endpoint exists, is scoped to `refund_sales`/`edit_sales`, refuses an already-refunded sale, and applies the balance rule.
  - Whether it works with the owner's token stays unproven until the first real refund (ruling (h) REOPEN (iii)).
  - The rendered fallback is the dashboard's **Refund fully** button (`R-G47:51`). It needs a person.

### T6. Seller-side cancellation duties in the terms (question 6; FABLE_QUEUE row 17 (b), 14ט)

- **The terms create no cancellation mechanism for a one-time purchase.**
  - The two they name are for subscriptions: "The Buyer may cancel through the "Cancel Membership" flow if they disagree with changes." (`R-TERMS:198`) and "To prevent automatic renewal or to change/terminate a Subscription, the Buyer must contact Gumroad through the Platform's in-app live chat." (`R-TERMS:199`).
  - They require no cancellation link.
  - They say nothing about what a purchase receipt contains. "receipt" occurs twice, at `:197` and `:475`, and neither is a purchase receipt.
- **What the terms require of the seller:**
  - §11.2(c): "(c) You agree to provide public-facing contact information and order fulfillment timelines for all Products." (`R-TERMS:248`)
  - Consumer-protection compliance (`R-TERMS:246`) and local-law compliance (`R-TERMS:453`), as in T1.
  - A conduct ban on content that "(xvii) materially obscures or misstates the price, currency, total amount charged, recurring nature or billing frequency of a Product, the terms of any trial, or the steps required to cancel; or" (`R-TERMS:347`).
  - Clause (xviii) extends that ban to content "on a Supplier Property or on any other website, landing page, funnel, advertisement, email, messaging channel or social media account that Supplier owns or controls, whether or not that page or channel is hosted by Gumroad." (`R-TERMS:348`). [inference] It therefore reaches the il-biz-tools pages.
  - No seller invoices (§6.1, `R-TERMS:131`).
- **What Gumroad's texts offer the buyer, against 14ט(א)'s five ways** (tick 18 1.6):
  - Email, way "(3) בדואר אלקטרוני;" (`R-CPL:863`): replying to the receipt (`R-G190:51`).
  - Internet, way "(5) באינטרנט – בעסקה שניתן להתקשר לגביה עם צרכן באמצעי זה;" (`R-CPL:867`): none for a one-time purchase in these captures. The terms' live chat is for subscriptions (`R-TERMS:199`).
  - Phone and registered mail, ways (1)-(2): none for cancellation. §27.4's postal and email contact covers "questions, complaints or claims with respect to the Services" (`R-TERMS:553`). [inference] It is not a route for cancelling a creator's product.
- **[inference] What this means for row 17 (b).** Nothing in Gumroad's terms or in articles 190 and 47 discharges 14ט for the seller:
  - **The home-page link.** If the owner is a "עוסק" (T1), the home-page link of 14ט(ב), "ייצור עוסק בדף הראשי של אתר האינטרנט שלו קישור ייעודי" (`R-CPL:871`), and the disclosure beside it (14ט(ה)(2)) fall on the il-biz-tools site. These captures show no Gumroad cancellation page the owner could link to.
  - **The receipt.** 14ט(ה)(1) wants the disclosure "(1) בחשבונית, בקבלה או בהודעת תשלום" (`R-CPL:879`).
    - §6.1 bars an owner invoice and any "demand for payment" (`R-TERMS:131`). An owner receipt for money Gumroad collected is not expressly barred, but the terms do not contemplate one either. In practice the receipt is Gumroad's.
    - The one text on that receipt the seller controls is the refund policy's fine print. This is github grade (tick 17 1.2, `item_info.rb:265-266`).
    - Article 204 (T8) would render what the receipt shows.
  - **A page line that serves both regimes.** A Hebrew line stating how to cancel does not obscure "the steps required to cancel" (xvii), and it answers 14ט(ד)/(ה)(2). The current FAQ line names one way, email: "משיבים למייל הקבלה מ-Gumroad" (`invoice.html:248`).

### T7. Earlier claims this confirms or corrects

- **Tick 17 (1.3-1.5) terms quotes: all confirmed verbatim.** They were at github grade with other line numbers; the rendered lines are:

  | Tick-17 citation | Rendered line | Clause |
  |---|---|---|
  | `TERMS:4` | `R-TERMS:18` | date |
  | `TERMS:73` | `:66` | §1.1 heading |
  | `TERMS:153` | `:131` | §6.1 |
  | `TERMS:172` | `:145` | §6.2(d) |
  | `TERMS:180` | `:151` | §6.3 |
  | `TERMS:196` | `:163` | §6.7 |
  | `TERMS:213` | `:177` | §7.1(a) |
  | `TERMS:228` | `:189` | §8.1 |
  | `TERMS:303` | `:246` | §11.2(b) |
  | `TERMS:580` | `:453` | §24 |

- **Tick 17 article quotes: all six confirmed** in the rendered bodies. `A190:10`, `:12` and `:14` are now `R-G190:51`; `A47:12`, `:28` and `:31` are now `R-G47:51`.
  - Tick 18 2.2 kept article 190 at github grade, and tick 18 2.3 kept tick-17 1.5 (merchant of record, §24) at github grade. Both are superseded.
- **Tick 17 1.4 (REOPEN (ii)) now stands on rendered text.** The terms never say "claw back". They offset against unpaid funds (`:154`), make the supplier reimburse (`:177`), and name a negative balance as a ground for suspension (`:262`). At github grade, a staff refund skips the balance check (`refundable.rb:92`).
- **New since ticks 17-18:**
  - article 47's dashboard-only callout, its currency paragraph, access after a partial refund, and the Connect fee rule;
  - §7.2(b);
  - the §11.3(b) refund-rate reserve and the §11.3(a) negative-balance ground;
  - §1.1's "sellers of digital products";
  - §9's USD price for a non-USD listing;
  - §11.2(f) and §14's "not expressly permitted";
  - the stale meta descriptions and their source (`articles.yml:50`);
  - at github grade, the refund endpoint and its balance check.
- **Correction to ZERO-TESTS row 175.** The row listed "refunds within 90 days" as something the terms would show. It is not there (T2); it is article 51's.

### T8. Next-render URLs (not captured and not queued; each has a written source)

| URL | Slug | Source of the URL | What it settles |
|---|---|---|---|
| `https://gumroad.com/help/article/204-get-to-know-your-gumroad-receipt` | `gumroad-help-receipt` | `gumroad-help-center-index.html:51` (rendered) | What the receipt shows (the refund policy line, the reply-to): 14ט(ה)(1), and whether receipt replies reach the account address that `gumroad-pro-product.js:351-352` assumes. |
| `https://gumroad.com/help/article/352-supporting-your-customers` | `gumroad-help-supporting-customers` | same | Which address buyers' mail goes to, and whether a separate support address exists. |
| `https://gumroad.com/help/article/46-what-currency-does-gumroad-use` | `gumroad-help-currency` | same; also named in `refund-law-il.md:160` as one of the three articles that mention Israel | Whether ILS is a local-currency payment currency, which decides article 47's exchange-rate gap on a ₪79 refund. |
| `https://gumroad.com/help/article/121-sales-tax-on-gumroad` | `gumroad-help-sales-tax` | same | Whether the "relevant Indirect Tax" of §10.2 includes Israeli VAT, and so whether §10.7 adds it on top of ₪79. |
| `https://gumroad.com/help/article/200-i-need-a-vat-refund` | `gumroad-help-vat-refund` | same | How Gumroad treats VAT charged to buyers (who is charged it, and who gets it back), at help-article grade. |
| `https://gumroad.com/help/article/194-i-need-an-invoice` | `gumroad-help-invoice` | same | Who issues the buyer's invoice (§6.1 bars the supplier), and so where a 14ג(ב) document could go. |
| `https://gumroad.com/help/article/66-gumroads-fees` | `gumroad-help-fees` | the fee link inside `R-G47:51` (rendered); also in `gumroad-help-center-index.html:51` | The size of the payment-processing portion kept on a refund, i.e. the cost of one ₪79 refund. |
| `https://gumroad.com/help/article/134-how-does-gumroad-handle-chargebacks` | `gumroad-help-chargebacks` | `gumroad-help-center-index.html:51` | Dispute fees and §7.1(a) reimbursement, at help-article grade. |
| `https://gumroad.com/help/article/196-contact-gumroad` | `gumroad-help-contact-buyer` | same | The address behind article 190's "write to us" (the 30-day escalation). |
| `https://gumroad.com/help/article/280-create-application-api` | `gumroad-help-api-application` | same | The token and its scopes (`refund_sales`/`edit_sales`), which `PUT /v2/sales/:id/refund` needs (`sales_controller.rb:7`, github). |
| `https://gumroad.com/api` | `gumroad-api-docs` | `research/measurements/gumroad-license-decision.md:25` | Whether Gumroad publicly documents `PUT /v2/sales/:id/refund` (`gumroad-pro-product.js:58`, `:71-73`). It may need the runner's JS flag. |

### What this settles for FABLE_QUEUE row 17

- **(b), who sells, on rendered text:**
  - Gumroad is the reseller and merchant of record (`R-TERMS:131`), and the seller for indirect tax (`:148`, `:216`).
  - The terms define suppliers as "sellers of digital products" (`:67`).
  - The licence and "a binding contract" run from the owner to the buyer (`:163`).
  - Consumer-protection and local-law compliance are placed on the supplier (`:246`, `:453`).
  - [inference] Gumroad being merchant of record does not stop the owner being a "עוסק" ("כולל יצרן", `R-CPL:41`). This remains a board question.
- **(b), 14ט:**
  - The terms give no cancellation link and no receipt text for a one-time sale, and they forbid obscuring "the steps required to cancel" on the owner's own pages (`:347-348`).
  - Gumroad's buyer route is email (reply to the receipt), then Gumroad after 30 days of silence.
  - [inference] If the owner is a "עוסק", the home-page link and the disclosure beside it are the owner's to build, and the receipt can carry only the policy's fine print.
- **(h), refunds:**
  - The terms have no 90-day window.
  - The responder's API route (`PUT /v2/sales/:id/refund`) is documented on no rendered page, and article 47 says to refund "only" from the dashboard.
  - No clause of the terms names the route. [inference] §11.2(f) ("any Gumroad policy or standard") and §14 ("not expressly permitted") could be read against it.
  - At github grade the endpoint exists and applies the same balance rule. It has never been run.
  - A full refund returns Gumroad's fee but not the processing fee.
  - A new risk for the board: the §11.3(b) reserve (25% of funds for 90 days) above a 15% refund rate, and suspension above 25%. A negative balance is itself a ground for suspension (§11.3(a)). On a low-volume product that is a few refunds.

### What this settles for FABLE_QUEUE row 17
- (b) Rendered: 'מידע' in the Computers Law excludes 'תוכנה' (R-COMP:15). The live nevo page is stamped 18-09-2023, and its text is the same words as the 10.08.2022 github copy (compared in Python).
- (b) Rendered: 14ג(ד)(3) names only 'מידע' (R-CPL:718). It does not name 'חומר מחשב' or 'תוכנה', while the Computers Law itself names 'חומר מחשב' when it means both halves (R-COMP:174, :178).
- (b) [inference] Downloadable software is outside item (3) on the words.
- (b) Open: FABLE_QUEUE row 17 (b)'s reason ('since מידע excludes software', logs/FABLE_QUEUE.md:41) covers software only. The board must characterise the ₪79 key: information (a key string, cf. 'קוד גישה או מידע דומה', R-COMP:61), software, a right or a service.
- (b) Open: whether 'שפה קריאת מחשב ... בלבד' (R-COMP:19) reaches content a person reads or types, which applies to both the key and a PDF. A PDF guide fits 'מידע' most plainly [inference].
- (b) Open: whether a per-sale key is 'טובין שיוצרו במיוחד בעבור הצרכן בעקבות העסקה' (R-CPL:720), whose wording differs from 4ג(ד)(3)'s 'לפי הזמנה של הצרכן' (R-CPL:223) and from R-REG:59, and whether 'טובין' (undefined in R-CPL) covers a key at all.
- (b) Open: if Pro is a service, whether a one-time purchase is an 'עסקה מתמשכת' (R-CPL:467). That decides which 14ג(ג)(2) rule applies (R-CPL:710).
- (b) Open: whether anything has been determined under 14ג(ה) (R-CPL:724). No sourced URL is known.
- (b) [inference] On length and fee, ruling (h) stands under every reading. REOPEN (i) could only move the window toward the 14-day floor, and only after the board rules the key 'מידע'. The clock start (R-CPL:708, the later of receipt and the written 14ג(ב) document) and 14ט remain for the board, as in tick 18.
- (b) Who sells: Gumroad is the merchant of record and reseller (R-TERMS:131) and the seller for indirect tax (:148, :216). The terms define suppliers as 'sellers of digital products' (:67). The licence and a binding contract run from the owner to the buyer (:163), and consumer and local-law compliance are placed on the supplier (:246, :453). [inference] So both Gumroad and the owner may be a 'עוסק' ('כולל יצרן', R-CPL:41); this is still a board question.
- (b) 14ט: Gumroad's terms provide no cancellation link and no receipt text for one-time sales. They forbid obscuring 'the steps required to cancel' on the owner's own pages (R-TERMS:347-348). The buyer route is email (reply to the receipt, R-G190:51), then Gumroad after 30 days of silence. [inference] If the owner is a 'עוסק', the home-page link (14ט(ב)) and the disclosure beside it are the owner's to build. The only receipt text the owner controls is the refund policy's fine print (github grade), and article 204 is queued to render the receipt.
- (h) The terms have no 90-day refund window (it is article 51's), and §8.1 makes purchases final by default. A full refund returns Gumroad's fee to the seller but not the processing fee (R-G47:51), so a zero-fee refund stays within the 14ה cap. The USD-versus-shekel amount on an ILS-listed sale is the open gap (article 46).
- (h) The responder's route, PUT /v2/sales/:id/refund, is documented on no rendered page, and article 47 says to refund 'only' from the dashboard. No clause of the terms names it. [inference] §11.2(f) and §14's 'not expressly permitted' could be read against it. At github grade the endpoint exists with the same balance rule. It stays unproven until the first real refund (REOPEN (iii)).
- (h) REOPEN (ii) now stands on rendered text. There is no 'claw back' wording, but Gumroad offsets against unpaid funds (:154), the supplier reimburses Gumroad-issued refunds (:177), and a negative balance is a ground for suspension (:262). At github grade, staff refunds skip the balance check (refundable.rb:92). The balance note is a cost rule, with a suspension risk attached.
- (h) New, for the board: under §11.3(b) a refund rate above 15% triggers a 25% reserve held for 90 days, and above 25% the account may be suspended (R-TERMS:264). An automatic responder lets buyers set that rate.

### Provenance note (tick 19, 29.9.2026): the Gumroad captures were fetched against Gumroad's terms

Gumroad's terms, captured by row 175 at ~10:46 UTC, forbid "any manual or automated software, devices or other
processes ... to "scrape" or download data from any web pages contained in the Services"
(`research/rendered/gumroad-terms.txt:326`; also `:343`). The runner had fetched Gumroad pages in rows 155, 162-163
and 175-177, and rows 180-186 were dispatched at 13:01, after the terms were captured but before that clause was read.
Every Gumroad capture cited in this file was fetched against that clause. Gumroad is now paused in code
(`TERMS_BARRED` in `scripts/render-watch.mjs`) and in `urls.txt`, and FABLE_QUEUE row 16(d) rules whether any
Gumroad page may be fetched again and whether these captures stay in use. **Ruled 30.9 (16(d) D1):** these captures stay in use for compliance questions at rendered grade `[against-bar]`; no re-fetch; refresh from antiwork/gumroad (github) (`research/channel-loop/RULING-2026-09-30-video.md`).

---

## 29.9 (tick 20, rendered)

ZERO-TESTS rows 180-186 (captured 29.9 ~13:02 UTC by render-watch). Read by an Opus reader, checked by an adversarial verifier.

### 29.9 tick 20: Gumroad articles 204, 352, 46, 121, 194 and 66, and the /api page (rendered, ZERO-TESTS rows 180-186)

**Provenance:** these seven captures (ZERO-TESTS rows 180-186, dispatched 13:01 UTC and captured 13:02:13-13:02:19 UTC on 29.9) were fetched against Gumroad's terms, which bar software used `to "scrape" or download data from any web pages contained in the Services` (`research/rendered/gumroad-terms.txt:326`; also `:343`), so every rendered finding below rests on pages fetched against that clause, and FABLE_QUEUE row 16(d) (`logs/FABLE_QUEUE.md:40`) decides whether they stay in use. **Ruled 30.9 (16(d) D1):** these captures stay in use for compliance questions at rendered grade `[against-bar]`; no re-fetch; refresh from antiwork/gumroad (github) (`research/channel-loop/RULING-2026-09-30-video.md`).

**Read by:** the tick-20 reader, from the render-watch captures of rows 180-186. An adversarial verifier then decoded every `data-page` again, re-grepped every quote and read seven more github files. No Gumroad page was fetched this tick. Besides the seven captures, this section reads:
- the tick-19 captures `R-TERMS`, `R-G190`, `R-G47` and `R-CPL`, each quote re-grepped in its file;
- repo files, named where they are cited;
- 30 files of Gumroad's public source at `antiwork/gumroad` `0656875c5fbfbf1a7f339f4716a0b9059539d790` (main on 29.9.2026, from `git ls-remote`). They were read with `git show` from a blobless clone of github.com. These are github grade and are marked where they are used. Three have the same bytes as earlier ticks:
  - `sales_controller.rb` and `refundable.rb`, the same bytes as tick 19;
  - `receipt_presenter/item_info.rb`, the same bytes as tick 17.

Every quote was checked with `grep -n -F` against its file before it was written here.

| Short name | Capture (under `research/rendered/`), row | fetchedAt (UTC) | sha256 (first 12) | Currency printed on the page |
|---|---|---|---|---|
| `R-G204` | `gumroad-help-receipt.html`, row 180 | 2026-09-29 13:02:13 | `79d7561bc129` | none |
| `R-G352` | `gumroad-help-supporting-customers.html`, row 181 | 2026-09-29 13:02:14 | `b28fe09758ed` | none |
| `R-G46` | `gumroad-help-currency.html`, row 182 | 2026-09-29 13:02:15 | `d1c64b7a9db2` | none |
| `R-G121` | `gumroad-help-sales-tax.html`, row 183 | 2026-09-29 13:02:16 | `231113c245ac` | none |
| `R-G194` | `gumroad-help-invoice.html`, row 184 | 2026-09-29 13:02:17 | `fb28513f274d` | none |
| `R-G66` | `gumroad-help-fees.html`, row 185 | 2026-09-29 13:02:18 | `aac759aa0129` | none |
| `R-API` | `gumroad-api-docs.html`, row 186 | 2026-09-29 13:02:19 | `c6ac3b3231e4` | none |

| Gumroad source file (github, `0656875c`) | sha256 (first 12) |
|---|---|
| `app/javascript/pages/Public/Api.tsx` | `23d1d0d520c2` |
| `app/javascript/components/ApiDocumentation/Endpoints/Sales.tsx` | `b94361f1a228` |
| `app/javascript/components/ApiDocumentation/Endpoints/User.tsx` | `76c9fe6cf37a` |
| `app/javascript/components/ApiDocumentation/Endpoints/Products.tsx` | `fcbfceaaefc7` |
| `app/controllers/public_controller.rb` | `2497eb531785` |
| `app/controllers/api/v2/sales_controller.rb` | `d1da9d8dd09a` (tick 19's bytes) |
| `app/controllers/api/v2/links_controller.rb` | `0bd67b806a6a` |
| `app/mailers/customer_mailer.rb` | `d3b1ebe13b41` |
| `app/models/concerns/charge/chargeable.rb` | `c9db6b35ef9e` |
| `app/models/user.rb` | `ad24461f0054` |
| `app/models/concerns/user/as_json.rb` | `4358b5d559cf` |
| `app/models/link.rb` | `71b37a6ef4c9` |
| `app/modules/product/validations.rb` | `6ba78f22430a` |
| `db/schema.rb` | `325623cff38f` |
| `app/presenters/receipt_presenter/item_info.rb` | `2cc2f51b50c3` (tick 17's bytes) |
| `app/presenters/invoice_presenter.rb` | `709419418031` |
| `app/presenters/invoice_presenter/supplier_info.rb` | `2e47291bb8e8` |
| `app/presenters/invoice_presenter/seller_info.rb` | `9c471930aa74` |
| `app/services/checkout/buyer_currency_eligibility.rb` | `5887fe7527d1` |
| `app/business/sales_tax/sales_tax_calculator.rb` | `c53fb83eba5c` |
| `lib/utilities/compliance/countries.rb` | `f4657bf9a359` |
| `app/modules/purchase/refundable.rb` | `e398af3161ca` (tick 19's bytes) |
| `app/modules/user/money_balance.rb` | `995203571eb7` |
| `app/services/onetime/backfill_custom_receipt_text.rb` (verifier) | `0e55a0ba11b6` |
| `app/controllers/api/v2/refund_policies_controller.rb` (verifier) | `a5ebb8a7db6c` |
| `app/controllers/api/v2/users_controller.rb` (verifier) | `9f3166ce808d` |
| `app/modules/user/payout_schedule.rb` (verifier) | `5c32234f19d7` |
| `app/business/payments/payouts/payouts.rb` (verifier) | `1732205f7af9` |
| `app/views/customer_mailer/refund.html.erb` (verifier) | `e40a6707b338` |
| `app/views/customer_mailer/_product_questions_footer.html.erb` (verifier) | `e7adcc06f0da` |

- **Status:** all seven returned 200, with `firstFetch: true` and `truncated: false` (their `.meta.json` files).
- **Where the text sits:**
  - Each `.txt` is one line, the page title, for example "Get to know your Gumroad receipt - Gumroad Help Center". `R-API`'s is "API".
  - Each article's text is on line 51 of its `.html`, inside the Inertia `data-page` attribute. `R-API`'s `data-page` is on line 43.
  - It was decoded as ticks 18 and 19 did: `html.unescape`, then `json.loads`.
- **How the citations read:** every `R-G…:51` citation below is `data-page`, JSON path `props.article.content`, unless another path is named.
- **How the quotes were grepped:** in the raw attribute, the article body is JSON-escaped:
  - `<`, `>` and `&` are stored as `<`, `>` and `&`;
  - `"` is stored as `\&quot;` and `'` as `&#39;`;
  - `“`, `”` and `—` are stored as they are.

  Each quote was grepped in that form. It was also found in the decoded `props.article.content`.
- **Live titles and categories** (`props.article.title`, `props.article.category.title`):
  - 204 is "Get to know your Gumroad receipt", under "Receipts and refunds".
  - 352 is "Supporting your customers", under "Start selling".
  - 46 is "What currency does Gumroad use?", under "Get paid".
  - 121 is "Sales tax on Gumroad", under "Get paid".
  - 194 is "I need an invoice", under "Receipts and refunds".
  - 66 is "Gumroad's fees", under "Get paid".
- **Dates:** no page prints one. "2026" has 0 matches in each `.html`.
- **Israel, and the API:**
  - A case-insensitive grep for "israel" returns 1 match in `R-G46` ("Israeli Shekel") and 0 in the other six.
  - "api" as a word has 0 matches in each article body, and "/v2" has 0 matches in all seven `.html` files.
- **Three meta descriptions are stale.** Tick 19 found the same for articles 47 and 190. The descriptions sit on lines 39, 40 and 43 and in `props._inertia_meta`.
  - `R-G46` says "Gumroad processes all transactions in United States Dollars. That means that you have the flexibility to display your products in the currency of your choosing". The body instead says "...or in the customer's local currency where supported" (G3).
  - `R-G66` says "we charge a 10% + $0.50 fee per transaction". The body adds "+ sales tax" (G6).
  - `R-G194` lists "How to generate your invoice from the receipt VAT ID Don&#39;t have your receipt? Older purchases No W9?". The body also has "Generate your invoice from the download page" and "Refunded purchases".
  - [inference] Local-currency checkout, the fee's "sales tax" link and the refunded-invoice section are newer than the descriptions. This section cites the bodies only.

### G1. Article 204: what the buyer's receipt shows (row 180; question 1)

**What the article names on the receipt** (all `R-G204:51`):
- A content link: "After checkout, you will receive your receipt with a link that takes you to your purchased content."
- An invoice link: "You can" print your own invoice (a link to article 194) " by clicking the Generate link at the bottom of your receipt. If you need to customize your invoice, you can use the 'Additional Notes' field to add any relevant information. We are not able to customize invoices beyond that for you."
- An unsubscribe link: "If you no longer would like to receive email updates from a seller, you can unsubscribe from future emails by clicking “Unsubscribe” at the bottom of your receipt."
- Membership controls, "Subscription settings" or "Manage membership". These are for subscriptions only. Pro is one-time (`gumroad-pro-product.js:86`).
- The seller's contact: "If you have problems with your purchase, you can find the seller's contact information on your receipt for issues such as refunds or general questions about the product."

**What the article does not say:**
- **A refund-policy line: not mentioned.** "refund policy" has 0 matches in `R-G204`.
  - Article 352 places the custom policy on the product page: "..., which is shown on its product page." (`R-G352:51`).
  - The receipt line stays at github grade: `value: refund_policy.fine_print,` (`item_info.rb:266`, the same bytes as tick 17 1.2).
- **A reply-to: not mentioned.** "reply" has 0 matches in the `.html`. The article says "the seller's contact information" without saying which address that is.
  - Article 352 names the address (G2).
  - Article 190 names the route: "You can contact the creator by replying directly to your receipt email:" (`R-G190:51`).
- **What the receipt looks like: not captured.** Each section's screenshot is hosted elsewhere (two on googleusercontent, three on cloudfront). The capture holds only the image URLs, so the receipt itself is not rendered.

**The receipt at github grade:**
- **Reply-to.** The receipt mail is sent with `reply_to: @chargeable.support_email,` (`customer_mailer.rb:81`).
  - That address is the order's shared product support email if there is one. Otherwise it is `seller.support_or_form_email` (`charge/chargeable.rb:128-136`).
  - That method returns `support_email.presence || form_email` (`user.rb:619`).
  - And `form_email` is `unconfirmed_email.presence || email.presence` (`user.rb:918`): the sign-in address, or a new address still awaiting confirmation.
  - This chain is article 352's rule (G2).
- **The "From" name.** The receipt goes `from: from_email_address_with_name(@chargeable.seller.name, "noreply@#{CUSTOMERS_MAIL_DOMAIN}"),` (`customer_mailer.rb:80`). The account's name field is the display name on every receipt.
- **A second seller-set text.** The receipt item carries `product.custom_receipt_text.presence` (`item_info.rb:71`), capped at `MAX_CUSTOM_RECEIPT_TEXT_LENGTH = 500` (`product/validations.rb:7`).
  - One rendered page hints at it. Article 46 tells a seller who lists in a currency other than USD: "you may want to inform your customers of this in your receipt's text." (`R-G46:51`).

**[inference] What the 14ט(ה)(1) disclosure could ride on.** 14ט(ה)(1) wants the information "(1) בחשבונית, בקבלה או בהודעת תשלום" (`R-CPL:879`). 14ט(ד) defines that information: "את הדרכים למסירת הודעת ביטול", their contact details, "ואת הפרטים שיש לכלול בהודעת ביטול" (`R-CPL:875`).
- **The owner issues no receipt of their own.** The terms say "you shall not issue any invoice or make any demand for payment to any Buyer in relation to any completed resale of your Products through the Services." (`R-TERMS:131`). So any disclosure on a receipt rides on Gumroad's receipt.
- **Rendered:** the receipt carries the seller's contact information (`R-G204:51`), which is the support address (`R-G352:51`). That is the contact detail for way (3), email, and nothing more.
- **Github:** two texts that the seller sets reach the receipt: the refund policy's fine print (`item_info.rb:266`) and the product's custom receipt text (`:71`, at most 500 characters). Either could carry a Hebrew 14ט(ד) statement.
- **A runner can set the fine print (github).** The refund-policy API that ruling (h) already relies on (tick 17) takes it: `permitted_params[:fine_print] = params[:fine_print] if params.key?(:fine_print)` (`refund_policies_controller.rb:36`).
- **A runner cannot set the custom receipt text through the documented API (github; settled by the verifier).**
  - The API's product update (`put` `/products/:id`, `Products.tsx:538-539`) documents a `custom_receipt` parameter: `<ApiParameter name="custom_receipt" description="(optional)" />` (`:573`). The controller passes it on as `attrs[:custom_receipt]` (`links_controller.rb:474`).
  - The receipt reads `custom_receipt_text` instead, which is `attr_json_data_accessor :custom_receipt_text` (`link.rb:321`). `custom_receipt` is a separate column of `links`: `t.text "custom_receipt", size: :medium` (`schema.rb:1306`).
  - Gumroad's own maintenance script at the same commit says: "The public API v2 still accepts writes to the legacy" / "`custom_receipt` param (which nothing reads anymore)" (`backfill_custom_receipt_text.rb:36-37`). The route it names is the product editor's "new Receipt tab" (`:10`), which is the dashboard.
  - [inference] So until Gumroad points that parameter at the new field, the custom receipt text needs a dashboard step. The fine print is the only receipt text a runner can reach.
- **The invoice is not a route.** Its "Additional Notes" field is filled in by the buyer (G5).

**Do replies to the receipt reach the account address the responder checks? Only while no support email is set.**
- **Rendered:** the support email "is listed on the receipt of every sale, and it is where replies to the emails you send through Gumroad go", and "If you leave it blank, your customers' replies go to the email address on your account instead, the one you use to sign in." (`R-G352:51`). The rendered text speaks of replies in general. That the receipt's own reply-to is that address is github grade (`customer_mailer.rb:81`, above), and article 190 sends buyers to reply to the receipt (`R-G190:51`). If a product-specific address is set, the receipt uses it (G2).
- **The repo assumes the account address:**
  - Owner step 3 says "לכתובת הזאת מגיעות" / "תשובות של קונים לקבלה, בקשות להחזר ושאלות" (`docs/OWNER_STEPS.he.md:187-188`).
  - The code says "request or a question goes to the email the Gumroad account was opened with." (`products/il-biz-tools/scripts/gumroad-pro-product.js:352`).
  - Both are true only while the Support field is blank.
  - Neither the owner's steps nor il-biz-tools mention that field. A case-insensitive grep for "support" in `docs/OWNER_STEPS.he.md` returns 0 matches, and "תמיכה" returns 0 too. "support email" and "support_email" return 0 matches under `products/il-biz-tools`.
- **[github] The code checks the sign-in address, not the Support field.**
  - The check compares `const got = addressOf(r.body.user.email);` (`gumroad-pro-product.js:461`).
  - `GET /v2/user` builds that value with `email: form_email` (`user/as_json.rb:11`), which is the sign-in address (or a pending unconfirmed one, above).
  - The documented user object has no support-email field, only `"email"` (`User.tsx:32`).
  - The same response carries the account's `name`: `super(only: %i[name bio twitter_handle currency_type]` (`user/as_json.rb:9`). [inference] So a runner can also read the name field that prints on receipts and invoices (G5), at ₪0.
- **[inference] What that means:**
  - `requireBrandAccount` checks the fallback, not the address that wins.
  - A Support address set to anything other than the brand mailbox would pass the check and send buyer mail away from the brand mailbox.
  - The reverse case fails closed, which is harmless: brand mailbox in the Support field, another sign-in address.

### G2. Article 352: where buyer mail goes, and whether a separate support address exists (row 181; question 2)

All quotes in this section are `R-G352:51`.

- **The seller's side of support:**
  - "You answer questions about your own products: how to use a file, what a version includes, whether a refund is possible."
  - "Gumroad gives your customers a way to reach you and gives you the tools to act on what they ask for."
- **The support email.** Your **support email** "is the address your customers reach you at. It is listed on the receipt of every sale, and it is where replies to the emails you send through Gumroad go."
  - It is set in Settings: "find the <b>Support</b> section, enter the address in the <b>Email</b> field, and click <b>Update settings</b>."
- **The fallback:** "If you leave it blank, your customers' replies go to the email address on your account instead, the one you use to sign in."
- **A separate address per product: yes.**
  - "If different products should be handled by different inboxes, you can set an address per product."
  - "In the same <b>Support</b> section, click <b>Add a product specific email</b>, enter the address, and pick the products it should cover."
  - "Products you don't assign keep using your account-level support email."
- **Which address a receipt uses:**
  - " The receipt for an order shows the product's support email, as long as every product in that order shares the same one. If a customer buys several products with different addresses in one order, the receipt shows your account-level support email instead."
  - "In every case, if the product has no address of its own, Gumroad falls back to your account-level support email, and then to the email address on your account."
- **Refunds:**
  - "Refunds are yours to decide and yours to issue."
  - The sales-dashboard list includes "Issue a full or partial refund." The article names no other route, and it does not mention the API.
  - Gumroad also acts on the policy itself: "Clear terms up front are the cheapest support you will ever provide, and Gumroad uses your stated policy when handling refunds or disputes on your behalf."
  - "Fully refunding a purchase removes its rating automatically", which agrees with article 47.
- **What Gumroad keeps for itself:**
  - "Some questions belong to us rather than to you: failed payments, download problems, fraudulent purchases, and anything about a customer's Gumroad account."
  - "<a href=\"20-how-do-i-contact-gumroad\">Contact Gumroad</a> has the full split of what we handle and what creators handle". The link is to article 20, not to the article 196 that tick 19 T8 queued for article 190's "write to us".
  - "Our <a href=\"348-support-response-times\">response times</a> are usually well under a day."
- **[github] The refund confirmation replies to the account-level address.** Its subject is `subject: "You have been refunded.",` (`customer_mailer.rb:165`), and its reply-to is `reply_to: @product.user.support_or_form_email,` (`:164`). It skips a product-specific address.
- **Answer.** Buyer mail goes to the support email: the product's own address if one is set and every product in the order shares it, otherwise the account-level address. It reaches the sign-in address only when the account-level Support email is blank and the receipt does not use a product address. A separate support address can be set, both for the account and for each product.
- **[inference] For the responder:**
  - The ₪0 guard is an instruction, not a check: owner step 3 would tell the owner to leave Settings → Support → Email blank (or set it to the brand mailbox) and to add no address for a single product.
  - The documented API does not expose the Support field (G1), so no runner can read it back.
- **[inference] Gumroad may refund without the responder.** "Gumroad uses your stated policy when handling refunds or disputes on your behalf" means that Gumroad support may grant refunds inside the stated window without the responder. Such refunds would count toward the §11.3(b) refund rate too, since the terms measure the rate a supplier "(or Gumroad, when selling a specific Supplier's Products)" experiences (`R-TERMS:264`, tick 19 T2).

### G3. Article 46: which currencies Gumroad charges in (row 182; question 3)

**What the article says** (all `R-G46:51`):
- "Gumroad processes transactions in United States Dollars, or in the customer's local currency where supported"
- "During checkout, eligible one-time card purchases are charged in the local currency shown at checkout, so the amount on the customer's statement matches the amount they confirmed. All other transactions are processed in USD, with real-time exchange rates used when conversion is needed."
- The list of 32 checkout currencies includes "Swiss Franc, Israeli Shekel, Philippine Peso". **ILS is a checkout currency** for eligible one-time card purchases.
- "Not every currency is offered on every product, and a customer whose currency is not listed is charged in USD."
- Other currencies' rules:
  - Settings let the seller "choose the default display currency for new products".
  - Card payouts: "All currency conversions happen based on the exchange rates at the time of sale, not at the time of the payout."
  - "If you live in any other country, we pay you out via PayPal and you will be paid in USD."

**The article describes a USD-priced product:**
- " You set your price the same way, your earnings are the same, and your payouts arrive the same way. Only the amount the customer sees and is charged is converted."
- "When a customer is charged in their own currency, the total they see keeps the price ending you chose in USD instead of showing the raw converted amount."
- "Your earnings, taxes, and payouts are unchanged — the small difference is absorbed by Gumroad."
- It never says whether a product listed in another currency is charged in that currency. Pro is such a product: `export const DEFAULT_CURRENCY = 'ils';` (`gumroad-pro-product.js:87`).
- The article also says: "Customers outside of the US may be subject to an additional fee for international purchases, depending on the policies of their credit card company. If you do set your currency in anything other than USD, you may want to inform your customers of this in your receipt's text."
  - [inference] The advice ties the card company's fee to listing in a currency other than USD. That fits a USD charge of a non-USD listing, but the article does not say so. The fee is the card issuer's, not the dealer's, and it falls outside the ₪79. Nothing read says whether a refund returns it.

**How the charge settles and how it is refunded:**
- The terms' currency paragraph opens: "If the retail price of a Product is listed in a currency other than United States Dollars (USD), Gumroad will calculate a USD price based upon an exchange rate determined by Gumroad." It ends: "Regardless of listed currency, all transactions through the Services will settle in USD." (both `R-TERMS:208`). [inference] For an ILS listing, the terms speak of a USD price that Gumroad computes, which fits a USD charge. But a USD price can still be presented and charged in shekels under article 46, and "settle" is the seller's side. Neither text settles Pro.
- Article 47: "Customers are refunded in the currency they were charged." (`R-G47:51`).

**[github] Whether an ILS-listed product is charged in ILS depends on flags Gumroad sets per seller:**
- A "listed-amount lane" charges the listed price directly when the listing is in the buyer's currency: "# Per-seller ramp for charging a product's listed currency directly when it is already" (`buyer_currency_eligibility.rb:21`).
  - Its flag is `LISTED_CURRENCY_DIRECT_CHARGE_FEATURE_NAME = :checkout_listed_currency_direct_charge` (`:25`).
  - The lane requires that flag (`:472`) before it returns eligible (`:480`).
- Without that flag, a cart listed wholly in the buyer's currency falls back to the USD charge: `return fallback(:listed_currency_is_buyer_currency) if listed_in_buyer_currency.all?` (`:485`).
- Every local-currency lane first needs two seller flags, `Feature.active?(FEATURE_NAME, seller)` (`buyer_currency_charging`) and `Feature.active?(:buyer_local_currency, seller)` (`:226-227`), checked at the top of the decision (`:400`).
- The refund endpoint's comment, which tick 19 relied on, still says "buyer presentment (the card path) only applies to USD-priced products" (`sales_controller.rb:185`). [inference] Beside `:21-25` and `:472-480`, it describes the default, not the flagged lane.
- [inference] So no listing currency guarantees a shekel charge. An ILS listing needs the listed-lane flag, and a USD listing needs the local-currency lane. The flags are Gumroad's runtime state, which no page or file read shows.
- **The sale record shows what was charged.** The documented `"buyer_presentment": {` block (`Sales.tsx:198`) holds the charged `currency`, `total_cents`, `fx_rate` and `refunded_cents` (`:199-207`). [inference] After the first real sale, a runner reading `GET /v2/sales` can see at ₪0 whether the buyer paid in ILS.

**[inference] Answer for 14ה(ב)(1).** The section asks the dealer to return "את אותו חלק ממחיר העסקה ששולם על ידי הצרכן" (`R-CPL:797`).
- If the Israeli buyer was charged in ILS, a full refund returns ₪79.
- If the buyer was charged in USD, the refund returns the same USD, and the shekel amount depends on the card's conversion (`R-G47:51`).
- The rendered texts do not say which case applies to Pro, so row 182's question stays open at rendered grade.

### G4. Article 121: does Gumroad collect Israeli VAT, and is it added on top? (row 183; question 4)

**What the article says** (all `R-G121:51`):
- "Gumroad now acts as the Merchant of Record for all sales. This means we automatically handle all sales tax collection and remittance worldwide. You don't need to manage any tax settings or applications - we take care of everything."
- "Digital products are unaffected and still have VAT collected at checkout everywhere it applies."
- It opens with the disclaimer " This article is neither legal advice nor tax advice."
- It names no country for VAT on digital products, and "israel" has 0 matches. Its one exception covers physical goods shipped into the EU: "When a physical product ships to a buyer in an EU country, we do not charge VAT at checkout."
- Its "Reseller Certificate" paragraph says creators who already file indirect-tax returns "will need to report their sales on Gumroad as "sales to other retailers for purposes of resale", which are not taxable". [inference] This frames the owner's sale as a sale to Gumroad, the reseller of §6.1 (`R-TERMS:131`). It bears on row 17 (b)'s open "עוסק" question, but it is US sales-tax wording, not Israeli law.

**Where tax is collected, it is added on top.** Article 121 does not say so, but two other rendered texts do:
- Article 46: "If tax is added, the ending mirrored is the one on the taxed total" (`R-G46:51`).
- The terms: prices "are exclusive of any applicable Indirect Tax" (`R-TERMS:231`).

**[github] Gumroad does not collect it for Israel:**
- "ISR" and "israel" have 0 matches in `lib/utilities/compliance/countries.rb`, the file that holds Gumroad's tax-collecting country lists. (The "IL" in that file is Illinois, in `TAXABLE_US_STATE_CODES`.)
- The lookup path covers US states, the EU, Australia, Singapore, Norway and Canada, and some listed countries behind a flag, `feature_flag = "collect_tax_#{country_code.downcase}"` (`sales_tax_calculator.rb:146-196`, flag at `:194`).
- For any other country no rate is found, so `return SalesTaxCalculation.zero_tax(price_cents) if tax_rate.nil?` applies (`:46`).
- The invoice's table of Gumroad tax numbers (`supplier_info.rb:84-96`) has no Israeli entry.
- [inference] Gumroad's code therefore adds no Israeli VAT. An Israeli buyer pays the listed ₪79 (or its USD conversion) with no tax line.

This is what Gumroad's code does. It is not a ruling on whether Israeli VAT is due on such a sale. The rendered article does not address Israel.

### G5. Article 194: who issues the buyer's invoice, and what it carries (row 184; question 5)

**What the article says** (all `R-G194:51`):
- The buyer makes the invoice:
  - "You can print your own invoice by clicking the Generate link at the bottom of your receipt."
  - "You'll be sent to Gumroad's Invoice generator where you can enter your full name and business or personal address. Next, click “Download”, and the invoice will download as a PDF."
  - There is a second route, "Generate your invoice from the download page", and "The link only appears when there is something to invoice".
- Notes are the buyer's to add:
  - "If you need to add optional notes such as your business' specific information or invoice numbers, you can do that in the additional notes field."
  - "Gumroad Support doesn't have the capability to change or adjust invoices, so be sure to add anything your tax office might need."
- EU businesses: "If you paid VAT and you're a business in the EU, you can also enter your VAT registration number and automatically process a refund for the VAT you paid." Then: "The VAT refund will take 2-3 days to arrive at your credit card or PayPal account. The invoice will display without VAT."
- Refunded purchases:
  - "If your purchase has been refunded, the invoice you generate reflects that. The payment total shows the amount you actually paid after refunds (so a fully refunded purchase shows a zero total), and a "Refund status" line appears under the payment total reading "Fully refunded" or "Partially refunded", along with the date of the most recent refund."
  - "This lets you use the regenerated invoice as documentation of the refund for your books."
- "Because Gumroad is a C Corporation, we do not issue W9s to customers."
- **The article does not name the invoice's issuer.**

**[github] What the PDF carries.** The presenter builds two blocks (`invoice_presenter.rb:42`, `:46`):
- **"Supplier"** (`supplier_info.rb:12`):
  - `value: "Gumroad, Inc.",` (`:47`);
  - an "Office address" (`:35`);
  - Gumroad's no-reply email (`:66`);
  - `value: "Products supplied by Gumroad.",` (`:80`);
  - a Gumroad tax number where it has one for the buyer's country (`:84-96`; none for Israel).
- **"Creator"** (`seller_info.rb:12`): `value: seller.display_name,` (`:32`) and `value: seller.support_or_form_email` (`:40`), the account-level address.
  - `display_name` begins `return name if name.present?` (`user.rb:609`).

**[github] What the refund confirmation says.** Gumroad's refund email has the header "You have been refunded." and the text "Your purchase of <%= @purchase.link_name %> for <%= @purchase.formatted_total_transaction_amount %> on Gumroad has been fully refunded. It may take up to 3-7 days to show up in your account." (`refund.html.erb:1`, `:9`). For a local-currency charge it shows that currency with the USD total beside it (`:7`). It is in English and goes out under the account's name from Gumroad's no-reply address (`customer_mailer.rb:163`).
- [inference] For a sale not charged in the buyer's currency, that amount is the listed one. The mailer notes that "formatted_total_transaction_amount is in the product's display currency" (`customer_mailer.rb:157`). So a USD-charged ILS listing's refund email would state ₪79 while the card is credited in USD.

**[inference] What this means:**
- **Who issues it.** Gumroad issues the invoice as supplier. The owner appears only as "Creator", by display name and support address. This agrees with §6.1's bar: "you shall not issue any invoice or make any demand for payment to any Buyer" (`R-TERMS:131`).
- **The owner's name.** The account's name field prints on the invoice (Creator), as the From name of every receipt (G1) and of the refund email. For the identity rule, that field should be the brand; owner step 3 names the store "**שם החנות: Mehudak**" (`docs/OWNER_STEPS.he.md:189`). The support address should be the brand mailbox. A runner can read the name field back through `GET /v2/user` (G1).
- **No place for the 14ג(ב) document.** The seller cannot write on the invoice, since the notes are the buyer's. It is no place for an owner-written 14ג(ב) document. The receipt texts in G1 are, and of those a runner can reach only the fine print.
- **A copy of the refund may already exist.** 14ה(ב)(1) also has the dealer hand over "וימסור לו עותק מהודעת ביטול החיוב" (`R-CPL:797`). Without the owner:
  - Gumroad sends the buyer an email ("Customers receive an email confirmation after a refund is issued.", `R-G47:51`; its English text above, github);
  - the buyer can generate an invoice reading "Fully refunded" (`R-G194:51`). This one is not sent; the buyer must generate it.

  Whether either counts as that copy is a board question.

### G6. Article 66: Gumroad's fees, and the cost of one ₪79 refund (row 185; question 6)

**What the article says** (all `R-G66:51`):
- "For sales made on Gumroad's website, we charge a 10% + $0.50 fee + " sales tax (a link to `https://gumroad.com/pricing`) " per transaction. This does not include: " "Credit card processing (2.9% + $0.30)" and PayPal fees.
- "Sales made through Gumroad's marketplace (discovery sales via Gumroad.com) are subject to a flat 30% fee, which includes all processing fees."
- "Once your paid sales in a calendar month reach $20,000, new direct sales that month are 5% + $0.50 instead of 10% + $0.50." and "A refund can bring you back under $20,000". "There are no monthly payments or other hidden charges."
- Refunds: "When a sale is refunded, Gumroad's own fee on the refunded portion is returned to you; only the underlying payment-processing portion of the fee is retained, because payment processors do not return it on a refund." This matches article 47 (tick 19 T4). "Sales through your own connected payment account (Stripe Connect or PayPal Connect) work differently."
- It does not say what "+ sales tax" adds to a fee, or what portion is kept when a 30% Discover sale is refunded.

**[inference] The cost of one full refund of a ₪79 card sale made directly, not through Discover.** It is computed at 3.6 ILS per USD, the ledger's fallback rate (`USD: 3.6,`, `src/revenue/money.ts:13`), not a market rate:
- The price is about $21.94.
- Gumroad's fee, 10% + $0.50, is about $2.69 (about ₪9.70). On a full refund it is returned, the $0.50 included on this reading of "Gumroad's own fee on the refunded portion".
- Card processing, 2.9% + $0.30, is about $0.94 (about ₪3.37). It is kept.
- A kept sale nets about $18.31 (about ₪65.93). A refunded sale nets about −$0.94: the owner loses the sale and pays **about ₪3.37**.
- At 3.4 or 3.8 ILS per USD the kept part is about ₪3.31 or ₪3.43. The fixed $0.30 is about a third of it.
- Nothing is charged to the buyer, who gets the full amount back (`R-G47:51`). So the cost sits outside 14ה(ב)(1)'s cap, "זולת דמי ביטול בשיעור שלא יעלה על 5% ממחיר הנכס נושא החוזה או העסקה, או 100 שקלים חדשים, לפי הנמוך מביניהם" (`R-CPL:797`; ₪3.95 on ₪79).
- The assumptions: card, not PayPal; a direct sale; no tax added (G4); the fee taken on ₪79's USD value; a month under $20,000.
- [github] The documented sale object carries `"processor_fee_cents": 59,` and `"processor_fee_currency": "usd",` (`Sales.tsx:189-190`, example values). [inference] After the first sale a runner reading `GET /v2/sales` can read the fee actually charged instead of this estimate.

**[inference, from rendered text] A lone sale cannot pay for its own refund.**
- Article 47 allows a refund only if "your balance is able to cover the transaction amount", and otherwise "If your balance is too low you will need to make additional sales until the refund can be issued." (`R-G47:51`).
- After fees, one ₪79 sale credits about ₪65.93, which is less than ₪79.
- So on a new account the first refund request cannot be issued by the seller, from the dashboard or by the API, until more sales arrive.
- **[github] The code agrees.** The check is `amount_cents_to_refund = amount_cents.presence || amount_refundable_cents` and `if amount_cents_to_refund > seller.unpaid_balance_cents && charged_using_gumroad_merchant_account?` (`refundable.rb:98-99`). The balance is `balances.unpaid.sum(:amount_cents)` (`user/money_balance.rb:14`). [inference] At about ₪65.93 net per sale, two unpaid sales cover one refund.
- **[github] Payouts never take the last week.** `MIN_AMOUNT_CENTS = 100_00` (`payouts.rb:8`; "the normal $100 minimum", `:10`) and `PAYOUT_DELAY_DAYS = 7` (`payout_schedule.rb:4`). A payout covers balances only up to `payout_cycle_for_payout_date(payout_date) - PAYOUT_DELAY_DAYS` (`:164`). This matches the owner steps' "מינימום $100, 7 ימים" (`docs/OWNER_STEPS.he.md:501`).
  - [inference] About six ₪79 sales ($18.31 each, at 3.6) come before the first payout, and a payout leaves the last seven days' sales unpaid. So the balance falls short in two cases: the first sale on a new account, and later a request about a sale that was already paid out when fewer than two sales came in during the last week.
- **The responder does not answer while it waits.** A refused refund makes the refund command exit 1 ("a refund refused", `gumroad-pro-product.js:62-63`; "the request is left for the next run", `:673`). The responder then records "the refund command stopped: not answered, left for the next run" (`scripts/brand_mail.py:1286`) and sends no reply.
- **The 14-day deadline can pass.** 14ה(ב)(1) has the dealer return the money "בתוך 14 ימים מיום קבלת ההודעה על הביטול" (`R-CPL:797`). [inference] At launch volume that deadline can pass while the balance is short. Staff refunds skip the balance check (`refundable.rb:92`, tick 19 T2). But article 190 brings Gumroad in only after 30 days: "Please write to us if you haven’t heard back from the creator for 30 days since first contacting them" (`R-G190:51`).

### G7. The /api capture (row 186; question 7)

**What the capture holds:**
- `R-API:43`'s `data-page` decodes to `"component":"Public/Api"`, with url "/api".
- Its props are `errors`, `design_settings`, `domain_settings`, `user_agent_info`, `logged_in_user` (null), `current_seller` (null), `csp_nonce`, `locale`, `feature_flags`, `authenticity_token`, `flash`, `title` ("API") and `_inertia_meta`.
- None of them holds documentation. The only value about the API is `domain_settings.api_domain`, "api.gumroad.com".
- The `.txt` is one line, "API".
- In the `.html`, "refund", "/v2", "sales", "endpoint", "access_token" and "ApiDocumentation" each have 0 matches. There is no `<noscript>`.
- Its script and style links are shared Vite bundles (`vendor`, `currency`, `request`, `base_page`, `DomainSettings`, `third_party_tracking`, `preventFileDropNavigation`, and the `base.ts`, `inertia.js` and `design` entry points) plus Cloudflare's `rocket-loader.min.js` and its insights beacon. None is named for the API page. The runner fetched no script.

**Plainly: the /api capture contains no API documentation.** It is a client-rendered shell. At rendered grade, `PUT /v2/sales/:id/refund` stays undocumented, as tick 19 T5 found for the terms and for articles 190 and 47.

**[github] What the page's own source shows:**
- The shell is by design. The route renders `render inertia: "Public/Api"` with only a title (`public_controller.rb:86-88`).
- The page component renders `<RefundSale />` (`Api.tsx:269`) under `<ApiResource name="Sales" id="sales">` (`:265`).
- That component documents the endpoint: `method="put"`, `path="/sales/:id/refund"`, `description="Refunds a sale. Available with the 'edit_sales' scope."` (`Sales.tsx:373-375`).
- Its one parameter is `amount_cents`: "(optional) - Amount to refund, in minor units of the sale's listed currency". It also says: "If set, issue partial refund by this amount. If not set, issue full refund." (`:380`). This is the full refund the responder sends (`gumroad-pro-product.js:58`).
- The docs name only `edit_sales`. The controller accepts `:refund_sales` or `:edit_sales` (`sales_controller.rb:7`, tick 19).

**[inference] What that means:**
- On the evidence of its source, Gumroad publishes the endpoint on gumroad.com/api. This is github grade: main at `0656875c`, and the deployed bundle may differ.
- It bears on tick 19 T5's two readings of article 47's "Please only issue refunds from your Gumroad dashboard." Gumroad's own public docs offer an API refund. That supports reading the callout by its stated reason, refunds issued in Stripe or PayPal accounts.
- It meets T5's "not expressly permitted" point (§14) only in part, because the API docs are not the Agreement.
- A rendered copy of the docs would need the runner's JS flag (tick 19 T8), and Gumroad fetches are paused (`TERMS_BARRED`).

### G8. Earlier claims this confirms or corrects

- **Tick 19 T5 on the reply-to** (`refund-law-il.md:1010`: "No rendered page says which address it is; article 204 (T8) would."): article 204 does not say; article 352 does, for replies in general, and the receipt's reply-to is that address at github grade. It is the support email, and the account address only when that field is blank.
  - The code's assumption (`gumroad-pro-product.js:352`) and owner step 3 (`OWNER_STEPS.he.md:187-188`) hold only on that condition.
  - The `GET /v2/user` check reads the sign-in address, not the support address (github; G1).
- **Tick 19 T4's currency gap** (`refund-law-il.md:947`, "Article 46 (T8) would."):
  - ILS is a checkout currency (`R-G46:51`).
  - Whether the ILS-listed Pro is charged in ILS is still not rendered. The terms speak of a USD price for a non-USD listing (`R-TERMS:208`). At github grade it turns on Gumroad's flags for each seller.
  - The `sales_controller.rb:185` comment that T4 cited describes the default only.
- **Tick 19 T1's VAT question** (`refund-law-il.md:823`): where Gumroad collects tax, it is added on top (`R-G46:51`, `R-TERMS:231`). At github grade Israel is not collected (G4). As far as Gumroad's tax goes, the ₪79 shown is the ₪79 charged.
- **Tick 19 T4's fee note** (`refund-law-il.md:940`, "whose size article 66 (T8) would give"): the processing part kept is 2.9% + $0.30 on a card sale. That is about ₪3.37 per ₪79 refund [inference, at 3.6].
- **Tick 19 T6's claim** (`refund-law-il.md:1044`, "The one text on that receipt the seller controls is the refund policy's fine print."): at github grade there is a second one, the product's custom receipt text (≤500 characters), which `R-G46:51` hints at. It can be set only in the dashboard: the API's `custom_receipt` parameter is one "which nothing reads anymore" (`backfill_custom_receipt_text.rb:37`). For a runner, T6's claim stands.
- **Tick 19 T8's queued article 196** (`refund-law-il.md:1091`): article 352 links "Contact Gumroad" to article 20, not 196.
- **FABLE_QUEUE row 17 (d)** says "no rendered page documents the `PUT /v2/sales/:id/refund`" (`logs/FABLE_QUEUE.md:41`). That still stands after row 186. The capture cannot show the docs, and at github grade the page's source does document the endpoint.
- **The owner steps' payout line** ("מינימום $100, 7 ימים", `OWNER_STEPS.he.md:501`) now has a github source (`payouts.rb:8`, `payout_schedule.rb:4`).
- **New since tick 19:**
  - the support-email chain and addresses per product;
  - ILS on the checkout list, and the terms' USD price for a non-USD listing;
  - VAT being "added" where collected, and the resale framing of article 121;
  - Gumroad as the invoice's supplier, and the refunded-invoice line;
  - the fee rates;
  - the lone-sale balance limit.
  - At github grade: the page's source documenting the endpoint, Israel's absence from the tax lists, the dead `custom_receipt` parameter, the refund email's text, and the $100 / 7-day payout rule.

### G9. Follow-up URLs

**The Gumroad URLs are not fetchable: paused** (`TERMS_BARRED`; FABLE_QUEUE row 16(d)). Each one has a written source. The github rows are allowed. The reader's two github follow-ups (`backfill_custom_receipt_text.rb`, `payout_schedule.rb`) were read by the verifier and are cited above.

| URL | Slug | Source of the URL | What it settles |
|---|---|---|---|
| `https://gumroad.com/help/article/20-how-do-i-contact-gumroad` | `gumroad-help-contact` | `R-G352:51` (link "Contact Gumroad") | Not fetchable: paused. Gumroad's split of creator and Gumroad support, and the address behind article 190's "write to us". |
| `https://gumroad.com/help/article/13-getting-paid` | `gumroad-help-getting-paid` | `R-G46:51` (the "direct-deposit countries" link); related articles in `R-G46`, `R-G66` | Not fetchable: paused. Whether Israel is a direct-deposit country, and the payout minimum and delay at rendered grade (github: $100, 7 days). |
| `https://gumroad.com/pricing` | `gumroad-pricing` | `R-G66:51` (the "sales tax" link) | Not fetchable: paused. What "+ sales tax" adds to the fee. |
| `https://raw.githubusercontent.com/antiwork/gumroad/0656875c5fbfbf1a7f339f4716a0b9059539d790/app/models/purchase.rb` | (github) | named in `sales_controller.rb:179` ("Purchase#refunding_amount_cents (app/models/purchase.rb)") | The units of `amount_refundable_cents` in the balance check (`refundable.rb:98-99`), so the lone-sale arithmetic holds for an ILS-listed sale. |
| `https://raw.githubusercontent.com/antiwork/gumroad/0656875c5fbfbf1a7f339f4716a0b9059539d790/app/views/customer_mailer/receipt/sections/_items.html.erb` | (github) | the tree listing at `0656875c` | Where the receipt prints the custom receipt note, the refund-policy line and the seller-contact footer (`_product_questions_footer.html.erb:2-3`, "Contact <%= seller_name %> by replying to this email.", whose use was not traced). |

### What this settles for FABLE_QUEUE row 17 (b) and (d)

**(b) 14ט, the receipt and the invoice:**
- **The receipt (rendered).** It carries the seller's contact information (`R-G204:51`), which is the support address (`R-G352:51`). Article 204 shows no refund-policy line and no cancellation text. The owner may issue no receipt of their own (`R-TERMS:131`).
- **The receipt (github).** Two texts that the seller sets reach it: the refund policy's fine print and the product's custom receipt text (≤500 characters). A runner can set the fine print (`PUT /v2/refund_policy`, `refund_policies_controller.rb:36`). The custom receipt text needs the dashboard, because the API's `custom_receipt` parameter is read by nothing (`backfill_custom_receipt_text.rb:36-37`). [inference] A Hebrew 14ט(ד) statement in the fine print would sit on Gumroad's receipt. Whether that meets "(1) בחשבונית, בקבלה או בהודעת תשלום" (`R-CPL:879`) is for the board.
- **The invoice.** The buyer makes it in Gumroad's generator (`R-G194:51`). At github grade it names "Gumroad, Inc." as supplier and the owner as "Creator", and the notes are the buyer's. It is no place for an owner-written 14ג(ב) document.
- **VAT.** Where Gumroad collects tax it is added on top (rendered). At github grade Gumroad adds no Israeli VAT, so the ₪79 shown is what an Israeli buyer pays. Article 121 frames creators' sales as "sales to other retailers for purposes of resale" (rendered, US wording).
- **Currency.** ILS is a checkout currency (rendered); the terms speak of a USD price for a non-USD listing (rendered). Whether the ILS-listed Pro is charged in shekels turns on Gumroad's flags for each seller (github). The same-shekel refund of 14ה(ב)(1) holds only for an ILS charge. A runner can read `buyer_presentment` after the first sale.

**(d) The responder:**
- **Documentation.** The /api capture is a shell, so the endpoint stays undocumented at rendered grade. At github grade Gumroad's /api source documents `PUT /sales/:id/refund` ("Refunds a sale. Available with the 'edit_sales' scope."), and a call with no amount is a full refund. That supports reading article 47's dashboard-only callout as being about Stripe and PayPal accounts.
- **The mailbox.** Buyer replies go to the support email when one is set (`R-G352:51`; receipt reply-to at github). The code checks only the sign-in address, and the documented API does not expose the support email. So the guard has to be an owner-step instruction: leave Support blank or set it to the brand mailbox, and add no address for a single product. The account's name field, which prints on receipts, invoices and the refund email, can be checked by a runner.
- **The balance.** A lone sale cannot cover its own refund (`R-G47:51` with `R-G66:51`; github `refundable.rb:98-99`). A new account's first refund waits for more sales, from the API and the dashboard alike; later, payouts ($100 minimum, last 7 days kept, github) leave a short balance only when fewer than two sales are unpaid. Meanwhile the responder sends nothing, and 14ה(ב)(1)'s 14 days (`R-CPL:797`) can run out.
- **Cost.** One refund costs the owner about ₪3.37 [inference, at 3.6 ILS per USD], and the buyer is charged nothing.
- **Gumroad's own refunds.** Gumroad may refund by the stated policy itself (`R-G352:51`), and such refunds would count toward the §11.3(b) rate [inference].

### What this adds for the sitting

- (b) 14ט(ה)(1) receipt disclosure. The owner may issue no receipt or invoice of their own ('you shall not issue any invoice or make any demand for payment to any Buyer', R-TERMS:131), so any disclosure has to ride on Gumroad's receipt. At rendered grade that receipt carries only the seller's contact information, the support address (R-G204:51, R-G352:51). At github grade the refund policy's fine print (item_info.rb:266) is on it and a runner can set it by PUT /v2/refund_policy (refund_policies_controller.rb:36). The custom receipt text (item_info.rb:71) needs a dashboard step, because the API's custom_receipt parameter is read by nothing (backfill_custom_receipt_text.rb:36-37). Rule whether a Hebrew 14ט(ד) statement (ways to cancel, contact details, what the notice must contain; R-CPL:875) in the policy fine print meets '(1) בחשבונית, בקבלה או בהודעת תשלום' (R-CPL:879).
- (b) The invoice is not the owner's. The buyer generates it (R-G194:51). At github grade it names 'Gumroad, Inc.' as Supplier ('Products supplied by Gumroad.') and the owner only as 'Creator', and the notes field is the buyer's. It cannot carry an owner-written 14ג(ב) document. The Creator block, every receipt's From name and the refund email's From name print the account's name field if set (user.rb:609, customer_mailer.rb:80, :163). The identity rule needs that field to be the brand, and a runner can read it via GET /v2/user (as_json.rb:9).
- (b) 14ה(ב)(1)'s copy of the notice cancelling the charge ('וימסור לו עותק מהודעת ביטול החיוב', R-CPL:797). Gumroad's refund email is sent to the buyer without the owner (R-G47:51); at github grade it is English: 'Your purchase of <product> for <amount> on Gumroad has been fully refunded. It may take up to 3-7 days to show up in your account.' (refund.html.erb:9). The buyer can also generate an invoice reading 'Fully refunded' (R-G194:51), but it is not sent. Rule whether either counts. [inference] On a USD charge of the ILS listing, the email would state ₪79 while the card is credited in USD (customer_mailer.rb:157).
- (b) Who is the 'עוסק'. Article 121 tells creators who file indirect-tax returns to report their Gumroad sales as 'sales to other retailers for purposes of resale' (R-G121:51, US wording). With §6.1's reseller appointment (R-TERMS:131), this frames the owner's sale as a sale to Gumroad. It adds to tick 19's open question of whether both Gumroad and the owner are 'עוסק'.
- (b) VAT and price. Where Gumroad collects tax it is added on top (R-G46:51, R-TERMS:231). At github grade Israel is in none of Gumroad's tax lists and gets zero tax, so the ₪79 shown is the ₪79 charged as far as Gumroad's tax goes. No rendered text addresses whether Israeli VAT is nonetheless due on such a sale.
- (b)/(h) Currency. ILS is a checkout currency (R-G46:51), but the terms say a non-USD listing gets 'a USD price based upon an exchange rate determined by Gumroad' (R-TERMS:208). At github grade, whether the ILS-listed Pro is charged in shekels depends on per-seller Gumroad flags. A full refund returns the same shekels only on an ILS charge ('Customers are refunded in the currency they were charged', R-G47:51). The first sale's buyer_presentment shows which case holds, at ₪0. The board may want a rule for a USD charge, where the shekels returned can differ from 'את אותו חלק ממחיר העסקה ששולם על ידי הצרכן' (R-CPL:797).
- (d) Documentation. The /api capture is a client-rendered shell with no docs, so PUT /v2/sales/:id/refund stays undocumented at rendered grade. At github grade Gumroad's own /api page source documents it ('Refunds a sale. Available with the 'edit_sales' scope.'; no amount_cents means a full refund; Sales.tsx:373-380). That supports reading article 47's 'only from your Gumroad dashboard' by its stated reason (Stripe/PayPal accounts). The API docs are not the Agreement, so §14's 'not expressly permitted' is met only in part.
- (d) Balance. [inference from rendered article 47 plus article 66; github refundable.rb:98-99] One ₪79 sale nets about ₪65.93, so a lone sale cannot fund its own full refund, and the first refund on a new account is refused by the dashboard and the API alike. At github grade payouts need $100 and never take the last 7 days of sales (payouts.rb:8, payout_schedule.rb:4, :164), so later refusals need fewer than two unpaid sales. When refused, the responder leaves the buyer unanswered ('left for the next run', brand_mail.py:1286), and 14ה(ב)(1)'s 'בתוך 14 ימים מיום קבלת ההודעה על הביטול' can pass. Staff refunds bypass the balance check, but buyers are sent to Gumroad only after 30 days (R-G190:51). Rule whether the responder stays as is, sends a holding reply, or whether sales wait for a covering balance.
- (d) Mailbox. Receipt replies go to the support email when one is set, at account level or per product, and reach the sign-in address only when the account-level field is blank and no product address applies (R-G352:51; reply-to at github, customer_mailer.rb:81). The code's requireBrandAccount checks only GET /v2/user email (form_email, the sign-in address or a pending one), and the documented API does not expose the support field. Rendered text supports only an owner-step instruction (leave Settings → Support → Email blank or set it to the brand mailbox; add no product-specific address), not a runner check. This is mechanical, but ruling (h)'s 'with a responder' depends on it.
- (d) Cost and rate. [inference] One refund costs the owner about ₪3.37 (card processing 2.9% + $0.30 kept, Gumroad's fee returned; at 3.6 ILS per USD), below the ₪3.95 cap and charged to no buyer; processor_fee_cents in the sale object (Sales.tsx:189) gives the real figure after the first sale. Article 352 adds that 'Gumroad uses your stated policy when handling refunds or disputes on your behalf', so Gumroad may itself refund inside the window; such refunds would likely count toward the §11.3(b) 15%/25% lines (R-TERMS:264).
