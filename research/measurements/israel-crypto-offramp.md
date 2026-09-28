# Israeli crypto off-ramp without a camera — T4 of the bounty ruling

**Status (28.9.2026):** NEEDS_MORE. One of the two named exchanges was read (Bit2C home page, RENDERED); the other
(Bits of Gold) returned **HTTP 403** to render-watch and has no body; Privy was not fetched. Answers `RULING-2026-09-28-bounty-rail.md` §6.3 T4
and `research/breadth/BOARD.md` Q6(b); queue rows `ZERO-TESTS.md` 31-32.

## What was read

| Capture | Status (`.meta.json`) | Read? |
|---|---|---|
| `research/rendered/bit2c-home.txt` / `.html` (https://bit2c.co.il/) | 200, 82,594 bytes, fetched 2026-09-28T13:17:46Z | Yes, all 469 text lines; the HTML read for link targets only |
| `research/rendered/bitsofgold-home` (https://www.bitsofgold.co.il/en) | **403 Forbidden**, 0 bytes, no text file | Nothing to read |
| Privy docs root | not fetched: commented out at `research/rendered/urls.txt:383-385` | No |

## Bit2C: findings (all quotes from the home page, which is a marketing page, not the onboarding flow)

**Account opening (individual).**
- [RENDERED] `bit2c-home.txt:173`: *"לפני ההרשמה עליך להכין שתי תעודת מזהות ישראליות בתוקף, ההרשמה לוקחת כמה דקות"*
  (before registering, prepare **two** valid Israeli identity documents; registration takes a few minutes).
- [RENDERED] The flow has a KYC form, a questionnaire and a declaration, but their contents are not on this page:
  `bit2c-home.txt:73` *"האם לשמור את הפרטים שלך ולהמשיך?"* is resource `GR_ConfirmKycForm` (`bit2c-home.html:196`);
  `:75` *"האם לשמור את פרטי השאלון ולהמשיך?"*; `:41` *"נדרש הצהרת מקבל שירות"* (service-recipient declaration required).
- [RENDERED] The only identity check the page names beyond the ID documents is SMS: `:165` *"תהליך הזדהות שני עם קוד אישי בסמס"*.
- [RENDERED] **No camera step is named.** The text has zero hits for סלפי, זיהוי פנים, וידאו, מצלמה, צילום, selfie, liveness,
  video, face; the HTML has zero hits for webcam, getUserMedia, camera or the vendors au10tix, onfido, sumsub, veriff, jumio, facetec.
- [INFERENCE] Absence on a home page is not evidence of absence in the flow. The page loads a file-upload widget
  (`bit2c-home.html:67`, `/Scripts/fileinput`), consistent with a document upload, and embeds a registration walkthrough
  video, *"הרשמה ופתיחת חשבון בפלטפורמת הקריפטו ביטוסי"* (`bit2c-home.html:699`, https://www.youtube.com/embed/M7jj2FBEfEE),
  which is where a selfie step would show. A video cannot be read as text.

**Assets.**
- [RENDERED] USDC is listed and priced in shekels: `:123` *"USDC"* (broker link `/broker?stage=2&coin=USDC`, `:121`);
  `:211` *"קנייה ומכירה של המטבע דולר מיוצב USDC בשקלים"*; trading pair `UsdcNis` (`bit2c-home.html:894`, `:1348`).
- [RENDERED] **SOL is not listed.** The page's pair table (`bit2c-home.html:1348`) is BTC, ETH, BCHABC, LTC, ETC, BTG, USDC,
  BCHSV, GRIN against NIS, plus LTC/BTC. "Solana" has zero hits.
- [NOT STATED] Which chain Bit2C accepts USDC deposits on (Ethereum or Solana). [INFERENCE] If it is not Solana, Superteam's
  Solana USDC needs a bridge or a swap first: a cost, and possibly a second venue with its own KYC.

**Crypto in, shekels out.**
- [RENDERED] External wallets both ways: `:149` *"...מפקידים בחשבון או שולחים לארנק חיצוני"*; `:207` *"הפקדה ומשיכה של קריפטו"*
  links to https://bit2c.co.il/home/faq#q5 (`bit2c-home.html:758`).
- [RENDERED] ILS to and from an Israeli bank: `:161` *"לאחר הפקדה מהבנק הכסף נשמר בחשבון בנק בנאמנות בבנק דיסקונט"*; `:10`
  *"לצורך ביצוע פעולות באתר יש לעדכן את פרטי חשבון הבנק שלך."*; `:46` bank details go through an approval, after which
  *"תוכל להפקיד ולמשוך שקלים בחשבונך"*.

**Fees, minimums, money up front.**
- [RENDERED] Fees exist; the page gives no numbers: trading `:35` *"Bit2C גובה עמלה בסך #Fee#% על כל פעולת מסחר שיוצאת לפועל."*
  (a template), tiered `:34`; withdrawal fee `:67` *"סכום המשיכה ועמלת המשיכה"*; a deposit-fee type `עמלת הפקדה`
  (`bit2c-home.html:262`). Fee page `/home/Fees` (`bit2c-home.html:1324`) not rendered.
- [RENDERED] Minimums exist, values not stated: `:17` *"שגיאה:הצעה נמוכה מהמותר"*, `:45` *"...או שהיא נמוכה מהמותר."*
- [RENDERED] Nothing on the page costs money before a trade: no account fee or subscription is named.

**Regulation.**
- [RENDERED] `:467` *"ביטוסי איטורו בע"מ ח.פ 517169447 מחזיקה ברישיון למתן שירות בנכס פיננסי – מורחב (שמספרו 72080) מרשות שוק ההון, ביטוח וחסכון."*;
  AML framework `:383`; the business has moved into the eToro group, `:401` *"פעילות Bit2C עוברת לקבוצת eToro"* (13/05/26, `:403`).
  [INFERENCE] A change of owner can bring the group's own onboarding flow. Watch for it.

## KYC URLs present in the capture (none rendered yet)
`/account/register` (`bit2c-home.html:384`), `/home/faq` (`:684`, *"מדריכים ומידע נוסף בנושאי הרשמה והתחברות... הפקדה ומשיכה"*,
text `:169`), `https://bit2c.co.il/home/faq#q5` (`:758`), `/home/faq#q3` (`:668`), `/home/Fees` (`:1324`), the video above (`:699`).

## SOL gas / Privy (BOARD Q6)
Unanswered: Privy not rendered. [INFERENCE] If claiming or moving Solana USDC needs SOL, Bit2C cannot sell it (SOL is not listed), so it
would be bought elsewhere. Per Q6 that is the owner's own spend after income, and it never blocks booking a receipt.

**Verdict for T4 (Israeli off-ramp without a camera): NEEDS_MORE.** Bit2C is a licensed Israeli exchange that lists USDC against shekels,
takes crypto from external wallets and pays shekels to an Israeli bank. Its home page asks only for two Israeli ID documents and SMS,
and names no camera. But a KYC form and a questionnaire sit behind registration, their contents are not on the page, and Bits of Gold
was refused (403), so neither PASSES nor FAILS can be written honestly. USDC's deposit chain is also unknown. **Single next check:**
render `https://bit2c.co.il/home/faq` (present verbatim at `bit2c-home.html:758` as `#q5`). The home page names it as the guide to registration
and to deposit and withdrawal (`bit2c-home.txt:169`). Read it for a selfie or video step, and for the USDC deposit network.
