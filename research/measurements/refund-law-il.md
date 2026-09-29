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
