# Scout notes — risk-governance / consumer-protection

**Scout:** WORKER-SCOUT "consumer-protection", group `risk-governance`
**Date of research:** 2026-09-03
**Criterion:** Refund and consumer-protection duties for digital goods: Israeli consumer law,
EU distance selling, and what marketplaces enforce on sellers.

---

## 0. Method and its hard limits (read this before trusting anything below)

This sweep was run under two severe constraints, and the reader must weigh every claim against them.

1. **WebSearch was exhausted before this scout started.** The first two search calls returned
   `this session has used its web search budget (200 of 200 WebSearch calls)`. Zero search
   snippets were obtained. Nothing below rests on a search result.
2. **The egress proxy blocks every primary legal source.** Confirmed blocked by fetching them:
   - `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32011L0083` → `EGRESS_BLOCKED`
   - `https://www.gov.il/he/departments/topics/consumer_protection_cancel_transaction` → `EGRESS_BLOCKED`
   `paddle.com`, `telegram.org`, `nevo.co.il` and the rest are in the same class per the group brief.

**What did work:** `raw.githubusercontent.com` (when addressed by exact commit SHA) and the GitHub
code-search MCP tool. So every source below is a **third-party repository document** — in several
cases an agent-authored "skill" file that paraphrases the statute. That is **secondary evidence,
one step weaker than a search snippet quoting a primary page**, because the intermediate author is
unaccountable and I found them contradicting each other (see §1.3). Treat the *structure* of the
findings as solid and every *number and section reference* as needing one primary-source read.

**Evidence grading used below:**
- `FETCHED-SECONDARY` — I rendered the page, but it is a third party's summary of the law.
- `SEARCH-FRAGMENT` — a code-search text fragment I actually saw in tool output.
- `BLOCKED` — the URL a human or unblocked agent must open to close the claim.

---

## 1. Israeli law — חוק הגנת הצרכן, התשמ"א-1981 (distance selling of digital goods)

### 1.1 The single most important finding for this colony

`FETCHED-SECONDARY` — https://raw.githubusercontent.com/skills-il/developer-tools/3469e136d1e0baa269727db380857502008e8e9f/israeli-shipping-manager/references/returns-law.md
(fetched 2026-09-03), verbatim from the rendered page:

> ## Digital Goods & Software Exclusion
> Section 14ג(ד) explicitly excludes **"Information as defined in חוק המחשבים, התשנ"ה-1995"** from
> distance-sale cancellation rights. This covers computer-law-defined information products,
> effectively excluding most digital and software goods.
> Additionally, **"Recordable or reproducible goods whose original packaging the buyer opened"**
> are excluded — a provision capturing opened media and software.

If this is right, **Israeli law gives the buyer of a pure digital/information product no statutory
14-day cooling-off right at all.** That is the opposite of the EU position and the opposite of what
almost every Hebrew refund page on GitHub tells its customers (see §1.4). It materially changes the
risk profile of `products/il-biz-tools` Pro and the Telegram bot for Israeli buyers.

### 1.2 The numbers, where the two secondary sources agree

Same page, verbatim:

> ## Cancellation Fee Caps
> For change-of-mind cancellations, sellers may deduct **"at most 5% of the price or 100 NIS,
> whichever is lower"** (14ה(ב)(1)). The statute clarifies that **"דמי ביטול is defined as including
> shipping and packing costs,"** so outbound delivery charges cannot be added on top.
> On seller breach, **"charge no cancellation fee"** (14ה(א)(1)).
>
> ## Refund Deadline
> Both scenarios require refunds **"within 14 days of receiving the cancellation notice"**
> (14ה(א)(1) and 14ה(ב)(1)).
>
> ## Disclosure Requirements
> Sellers must disclose cancellation information **"in writing no later than supply of the goods or
> services"** and again on **"invoices, receipts and payment notices"** plus the website homepage
> (14ט(ד)-(ה)).

`FETCHED-SECONDARY` — https://raw.githubusercontent.com/skills-il/communication/cf67cb5f982e51a14705f11a9a4db1e85604fea5/israeli-customer-support-automator/SKILL_HE.md
(fetched 2026-09-03) confirms the same figures and adds:

- **Clock start (14ג(ג)(1)):** "14 days from the date the consumer receives the goods **or** the date
  of receipt of the document" — whichever is **later**. Not the order date.
- **Services (14ג(ג)(2)):** 14 days from performance or document receipt, whichever is later; for a
  non-continuous service the consumer must cancel "at least two business days before the scheduled
  service date."
- **Protected populations (14ג1):** persons with disabilities, citizens 65+, and new immigrants
  within 5 years get a **four-month** cancellation window on a distance sale, "provided the contract
  was formed via a conversation between the trader and consumer," **including electronic
  communication** (14ג1(ג)). Proof: one document only per trader (14ג1(ד)).
- **Continuous transactions (13ד):** an ongoing service must end "within three business days of the
  cancellation notice," and no charge may be made after that date.
- **Cancellation channels (14ט):** must accept "telephone, in person at the trader's location,
  registered mail, email, fax, or the internet." The trader **cannot limit the channels**, and the
  home page must display a "prominent, dedicated cancellation link."
- **Recording mandate (16ד), effective 22 March 2027:** for Schedule-2 transactions ≥ 750 ₪, record
  calls both directions, announce recording, retain 2 years (transaction) / 6 months (no
  transaction), deliver copies within 10 business days. Penalty attaches to non-delivery.
  *(Not applicable to a no-phone software business, but it is the dated obligation nearest on the
  calendar and worth knowing before anyone proposes a phone channel.)*
- **30א (spam law):** promotional messages need prior explicit written consent; statutory damages
  "up to 1,000 shekels per message." Transactional messages are exempt. This is the rule that makes
  any "just email the list" growth idea RED under our constitution.

### 1.3 Where the secondary sources contradict each other — do not build on this until closed

The two documents disagree on the digital-goods exclusion:

- `returns-law.md` (§1.1): "information as defined in the Computers Law 1995" is excluded **outright**.
- `SKILL_HE.md` of `israeli-customer-support-automator`: "**Digital information:** excluded **if the
  consumer opened the original packaging**, but separately from goods whose packaging was opened."

Those are different legal outcomes for a downloadable product with no packaging at all. They also
swap the sub-paragraph letters of 14ה(א) and 14ה(ב) between them. A third source,
`skills-il/developer-tools` `israeli-product-price-comparator/SKILL_HE.md` (`SEARCH-FRAGMENT`, seen
in code-search output 2026-09-03), states the exclusion as "**מוצרים מתכלים, תוכנה שנפתחה, ומוצרים
בהתאמה אישית**" — i.e. *opened* software, agreeing with the second reading.

**URL a human must open to settle it:** the consolidated text of חוק הגנת הצרכן s.14ג(ד) at
`https://www.gov.il/he/departments/topics/consumer_protection_cancel_transaction` (`BLOCKED`) or
`https://www.nevo.co.il/law_html/law01/055_001.htm` (not attempted; assume blocked).

### 1.4 Field evidence that the market gets this wrong

`SEARCH-FRAGMENT` (GitHub code search, 2026-09-03) — a large population of live Israeli sites ships
a Hebrew cancellation policy that asserts a flat 14-day right without the 14ג(ד) carve-outs and
without the 14ג1 four-month window. Examples actually seen in tool output:

- `lidormalich/FlowMatic` → `client-new/src/components/pages/TermsOfService.jsx`: sells SMS credits
  as "ניתן לרכוש ולא ניתן להחזרה" and then in the same block asserts "קיימת זכות ביטול עסקת שירות
  דיגיטלי תוך 14 יום" — two mutually inconsistent statements on one page.
- `craftmaster32/housamtes` → `app/(tabs)/settings/terms.tsx`: a genuinely careful clause, and the
  only one seen that correctly splits direct sales from App Store / Play Store purchases ("We have
  no authority to issue refunds for platform-processed transactions").
- `petwashglobal/petwash-marketplace` → `docs/legal/shop-returns-cancellation-policy-2026-06-10.md`
  (`FETCHED-SECONDARY`,
  https://raw.githubusercontent.com/petwashglobal/petwash-marketplace/69485a0c3fdbe926dced660b18e240c7cafd3825/docs/legal/shop-returns-cancellation-policy-2026-06-10.md ):
  the best-executed example found. It states the 5% / ₪100 lower-of rule, the 14-day refund deadline
  under 14ה, the 14ג1 four-month window for 65+/new immigrants/persons with disabilities, and — the
  part everyone else misses — a **timing requirement that all exemptions appear before payment
  commitment to be enforceable**, plus checkout-drawer and orders-page disclosure surfaces. It also
  states custom goods get **no blanket immunity from defects**. Note it explicitly does **not**
  cover digital goods.
- `petwashglobal/petwash-marketplace` → `docs/legal/CLO-israel-2026-compliance-report.md`
  (`SEARCH-FRAGMENT`): a P0/P1 compliance matrix naming §30א (marketing consent), §17a (total
  inclusive price incl. מע״מ at first sight of any number), עסקה מתמשכת (cancel online as easily as
  you subscribed, advance renewal notice), the 2010 ביטול עסקה regulations, Privacy Amendment 13,
  and ת"י 5568 / accessibility regs. This is the closest thing found to a usable audit checklist
  for an Israeli consumer-facing digital business.

### 1.5 The 2010 regulations are a *separate, narrower* right — a common and expensive confusion

`SEARCH-FRAGMENT` — `skills-il/developer-tools` `israeli-shipping-manager/SKILL.md` and its Hebrew
twin, seen in code-search output 2026-09-03, verbatim fragment:

> תקנות הגנת הצרכן (ביטול עסקה) התשע"א-2010, made under section 14ו, are a **separate and parallel**
> statutory right, not a rival regime that switches off when the sale is remote. They are simply
> less generous, and narrower than they look: they reach only the goods and services enumerated in
> the regulations' תוספת, and only where the price paid exceeds 50 NIS. ... Keep the two apart in
> your code, because the exclusion lists differ and mixing them is the most common way an RMA flow
> ends up unlawful. Section 14ט(ז) makes the split explicit.

And a corroborating fragment from `skills-il/legal-tech`
`israeli-renovation-scope-builder/references/domain-checklist.md`: "The cancellation right attaches
only to the **23 enumerated Schedule items**." Software / digital services are not among them per
that source. So the 2010 regulations are almost certainly **irrelevant** to our digital products,
and every Hebrew policy page that cites them as the basis for a digital refund right is citing the
wrong instrument.

---

## 2. EU distance selling

### 2.1 The rule and the dated deadline

`FETCHED-SECONDARY` — https://raw.githubusercontent.com/kostja94/marketing-skills/70987bad4ebe9dce1f74858c1c64f3f8810f18e4/skills/pages/legal/refund/SKILL.md
(fetched 2026-09-03; the page refused verbatim reproduction and returned a detailed summary):

> **EU — Consumer Rights Directive + 2026 Withdrawal Button**
> - Unconditional 14-day withdrawal right applies to all distance contracts (goods, services, digital)
> - Withdrawal period starts on delivery (goods) or contract conclusion (services/digital)
> - **Mandatory digital withdrawal button required by June 19, 2026**
> - Button must use two-step process with automated email confirmation
> - Applies to any business targeting EU consumers, **regardless of registration location**
> - Penalties up to 4% of annual turnover in some member states
> - Sky Austria case (pending 2026) may reclassify SaaS as "digital services" rather than "digital
>   content," potentially extending withdrawal rights through full subscription term
> - 2-year conformity guarantee applies to defective digital products

And on the waiver, verbatim from that fetch:

> To waive withdrawal rights for digital content, obtain: *"(1) consumer's prior express consent to
> immediate performance, AND (2) consumer must acknowledge they will lose the withdrawal right once
> download/access begins."* This must be a checkbox at checkout — not buried in terms. However,
> post-June 2026, the withdrawal button must remain available even if a waiver was obtained, since
> the waiver's validity may be questionable.

> The 14-day right ... applies *"before purchase — failure extends the period by up to 12 months."*

**Note the date against today's date (2026-09-03): 19 June 2026 has already passed.** If the claim
is correct, non-compliant EU-facing sellers are *currently* exposed rather than preparing. That
changes a "get ready" pitch into a "you are already late" pitch — a stronger buying trigger, but
also means anything we sell into it competes with three months of incumbent offerings.

**Confidence caveat:** this whole block rests on **one** agent-authored marketing skill file. The
"June 19, 2026 withdrawal button" and the "4% of turnover" penalty are exactly the kind of crisp
numbers that get invented. **URL a human must open to close it:**
`https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32011L0083` (Art. 16(m) for the waiver)
plus whatever amending directive introduced the withdrawal button (`BLOCKED` here).

### 2.2 Other jurisdictions, from the same fetch (same confidence caveat)

- **UK — DMCCA subscription rules, Spring 2027:** pre-contract disclosure of trial price / renewal
  date / cancellation method; **two** 14-day cooling-off periods (at sign-up and post-renewal);
  mandatory renewal reminders; cancellation must be straightforward.
- **US — FTC:** no federal withdrawal right; policies must be "clear and conspicuous"; California
  requires posting a refund policy if you do not offer a full refund within 7 days; state AGs
  enforce against dark patterns obscuring cancellation.
- **Australia — ACL:** consumer guarantees cannot be excluded by store policy; no fixed window,
  "reasonable time" standard.
- **China — platform rules effective 1 Feb 2026:** platforms cannot force merchants to accept
  "refund without return"; historical policy versions archived 3+ years.
- **Korea (a live worked example)** — `FETCHED-SECONDARY`,
  https://raw.githubusercontent.com/Simon-YHKim/2nd-B/3abe495e7284409a90bfeae78ea0f0725024d40e/docs/legal/refund-policy.md
  anchors a 7-day money-back window to the Act on Consumer Protection in Electronic Commerce
  Art. 17(1), and justifies usage limits under Art. 17(2)5 ("digital content provision begun").

---

## 3. What marketplaces and payment rails enforce on the seller

### 3.1 Merchant of Record — the most useful governance lever found in this whole sweep

`SEARCH-FRAGMENT` (2026-09-03), `PCBJam/pcbjam` → `site/src/content/legal/terms.md`, verbatim:

> 8.3 **Paddle's terms apply to the purchase.** Your purchase is also subject to **Paddle's Checkout
> Buyer Terms** and **Paddle's Refund Policy** (paddle.com/legal/checkout-buyer-terms ·
> paddle.com/legal/refund-policy). Under those terms, **Paddle resells our software** and makes it
> available to you under our Terms (which Paddle refers to as the "Supplier Agreement"). **This
> split means: Paddle handles the sale; [the vendor] licenses and provides the Service to you.**

`SEARCH-FRAGMENT`, `QuestPDF/QuestPDF-Documentation` → `terms-of-service.md`, verbatim:

> Paddle is responsible for payment processing, billing, invoicing, tax calculation and remittance,
> **chargeback handling, and refund processing** in accordance with Paddle's terms and policies.

`SEARCH-FRAGMENT`, `emranio/arraysubs-webcontent` → `post.md`, verbatim:

> A Merchant of Record sits in the buyer transaction as the **reseller/seller of record** for the
> covered sale. That changes who issues the buyer-facing transaction document, collects and remits
> transaction tax, interfaces with payment networks, and **administers refunds and chargebacks**.

`SEARCH-FRAGMENT`, `graspsoftwarepw/tadaify-app` → `docs/research/affiliate-program.md`: classifies
**Lemon Squeezy, Paddle, Gumroad** as MoR ("Platform legally buys from the creator, then resells to
the end-user. Platform is the merchant"), versus **Stripe Connect Standard, Substack, Patreon, Etsy**
as marketplace/facilitator (the creator is the merchant and carries the VAT and the consumer duty).

**Governance consequence for this colony.** Under an MoR the *counterparty to the consumer* is
Paddle, not the Israeli owner. The withdrawal-button duty, the CRD refund duty, the chargeback
defence and the tax remittance sit with the MoR. This is the single cheapest way for an
owner-does-nothing operation to discharge consumer-protection duties across ~180 jurisdictions
without a human answering anything. **It is not a full shield:** the vendor keeps the Supplier
Agreement obligations, and every live example found keeps a vendor-side support promise —
`Hrachiaa/persona` → `frontend/src/i18n/locales/en/legal.json` (`SEARCH-FRAGMENT`) promises "We
reply within 5 business days" and "Approved refunds are issued by Paddle to the original payment
method and usually appear within 3–10 business days"; `Simon-YHKim/2nd-B` promises 2 business days
and reserves operator review of non-automatic refunds. **Those SLAs are exactly the human work
MISSION.md forbids** — so any policy we publish must promise only what an agent can actually
deliver, and must promise it in a form an agent can meet (auto-approve rules, not "we will review").

**BLOCKED, must be read by a human before we rely on any of this:**
`https://www.paddle.com/legal/refund-policy` and `https://www.paddle.com/legal/checkout-buyer-terms`.

### 3.2 Telegram Stars — hard, named duties that hit a product we already ship

`FETCHED-SECONDARY` — https://raw.githubusercontent.com/halogenOS/xos-assistant/8188665a43b02bb770f56d41656304d3e122feb9/docs/units/telegram/24-payments-stars-and-gifts.md
(fetched 2026-09-03), quoting Telegram's own documentation:

> **`refundStarPayment` Method** — `refundStarPayment(user_id, telegram_payment_charge_id)` "Refunds
> a successful payment in Telegram Stars." This is the only mechanism available to reverse incoming
> payments; outgoing gifts cannot be recalled by anyone.
>
> - **`/terms`**: "make sure your bot can respond to a /terms command (or offers a similarly easy way
>   of accessing your Terms and Conditions)"
> - **`/support`**: "Your bot must provide support for its customers, either by responding to a
>   /support command or by some other clearly communicated means"
> - **`/paysupport`**: mandatory — "Your bots and mini apps must be able to respond to the command
>   `/paysupport` and process user requests regarding payment issues"
>
> "You as the bot owner have **full responsibility** in case any conflicts or disputes arise" and
> "You are **solely responsible** for processing and rectifying legitimate user disputes for digital
> goods and services sold by your bots."
>
> For digital goods, "all transactions must be carried out in Telegram Stars, with currency tag XTR."
> **iOS:** developers "are currently not allowed to accept payments for digital goods and virtual
> services from iOS users," with a later amendment noting recent Apple Review changes may permit it.

This is directly actionable: **`products/telegram-il-tools-bot` must implement `/terms`, `/support`
and `/paysupport`, and must wire `refundStarPayment`.** `/paysupport` is described as mandatory, and
Telegram assigns *sole* dispute responsibility to the bot owner — the exact opposite of the MoR
posture in §3.1. A Stars bot is therefore a **higher** consumer-protection risk surface than a
Paddle-sold product, and the only way to run it owner-does-nothing is a fully automated refund rule
(e.g. auto-refund any Stars charge disputed within N days, no questions), which `refundStarPayment`
makes technically possible.

**BLOCKED, to be confirmed by a human:** `https://core.telegram.org/bots/payments-stars` and
`https://telegram.org/tos/bot-developers`.

### 3.3 Marketplace seller-side enforcement thresholds

`FETCHED-SECONDARY` — the `kostja94/marketing-skills` refund SKILL.md fetch (2026-09-03) states,
for the marketplace product category: *"vendor return rates (>8% review, >15% suspend)"*, and
explicitly *"No specific chargeback threshold is provided."* It also notes for free tools: *"No
payment = no refund policy needed; state 'free, no purchase required' if asked."*

**Confidence: low.** The document does not name which marketplace those thresholds belong to, and an
unattributed pair of percentages is the weakest kind of claim in this whole file. Do **not** put
8%/15% in any published artifact. Treat it only as a reason to *instrument* refund rate, not as a
number to quote. The well-known card-network chargeback thresholds (Visa/Mastercard monitoring
programmes) were **not** obtainable in this session at all.

### 3.4 Crypto / x402 — refunds are structurally impossible

`SEARCH-FRAGMENT` (2026-09-03), `Beep206/CyberVPN` →
`frontend/src/i18n/messages/generated/sv-SE.json`, verbatim from the tool output:

> "CryptoBot/Crypto Pay: paid invoices are final provider states for access, but refunds require
> manual support/finance action ... **No automatic refund is promised.**"
> "NOWPayments: completed and partially paid crypto transactions **generally leave provider
> custody**; [we] must review merchant-side refund responsibility, wrong-asset/wrong-network/
> minimum-amount exceptions..."
> "Digiseller: ... **Digital goods and delivered credentials require manual review before any refund
> decision.**"

That is a real production system's own honest statement that crypto payment rails cannot honour a
refund duty automatically. It bears directly on `products/x402-il-api`: an on-chain micropayment
cannot be reversed by us, so **if a consumer with a statutory withdrawal right buys through it, we
cannot lawfully discharge the refund duty.** The only clean postures are (a) sell x402 access to
**businesses/developers only**, where consumer withdrawal rights do not attach, or (b) hold a fiat
refund float and refund out-of-band — which is manual work the owner will not do. (a) is the answer.

---

## 4. Dead ends and honest gaps

1. **Every primary legal source is unreachable from this container.** gov.il and eur-lex confirmed
   `EGRESS_BLOCKED` by direct test. No statute text was read in this session. This criterion cannot
   be closed to a publishable standard from inside this environment; it needs one human (or one
   unblocked agent) to open roughly six URLs, listed inline above.
2. **WebSearch budget was already spent at 200/200 before this scout ran.** Zero snippets. If the
   colony intends to run 112 scouts, the search budget must be raised or partitioned per scout;
   otherwise late scouts in the fan-out are structurally blind, as this one was. **This is a
   colony-governance defect worth reporting upward regardless of the criterion.**
3. **No evidence was found of anyone paying for a standalone Israeli consumer-protection compliance
   product.** Plenty of evidence of the *need* (dozens of wrong Hebrew policy pages), none of a
   transaction. The buyer for §5.1 below is inferred from need, not observed from revenue. Anyone
   who upgrades that to "demand proven" is overreading this file.
4. **Card-network chargeback thresholds (Visa VDMP/VFMP, Mastercard ECM/EFM) — nothing obtained.**
   Not one usable figure. Genuinely empty in this session.
5. **App Store / Google Play refund duties for digital goods — nothing obtained** beyond the single
   `craftmaster32/housamtes` fragment noting the developer has no authority to refund
   platform-processed transactions. Not researched further; out of our current product surface.
6. **Israeli enforcement reality — nothing.** No data on whether the רשות הגנת הצרכן ולסחר הוגן has
   ever acted against a micro digital seller, what the fine range is, or the base rate of complaints
   against digital goods. Without it, the *expected cost* of non-compliance is unknown, and any
   claim that this risk is "high" or "low" would be invented.

---

## 5. Findings carried to the structured output

Numbered to match the structured result.

1. Hebrew statutory refund/cancellation policy generator for Israeli digital sellers.
2. EU withdrawal-button + waiver-checkbox compliance component (deadline already passed).
3. Telegram Stars `/paysupport` + auto-refund compliance kit.
4. **[governance, not a product]** Route all consumer-facing sales through a Merchant of Record.
5. **[governance, not a product]** Restrict x402 to business/developer buyers; no consumer sales.
6. **[governance, not a product]** Refund-rate instrumentation in the colony ledger.
7. **[governance, not a product]** Israeli 14ג1 four-month protected-population window applies to
   the Telegram bot, because its contract forms via electronic conversation.

---

## 6. Full URL list actually used

**Fetched successfully (all 2026-09-03):**
- https://raw.githubusercontent.com/skills-il/developer-tools/3469e136d1e0baa269727db380857502008e8e9f/israeli-shipping-manager/references/returns-law.md
- https://raw.githubusercontent.com/skills-il/developer-tools/3469e136d1e0baa269727db380857502008e8e9f/israeli-shipping-manager/SKILL.md
- https://raw.githubusercontent.com/skills-il/communication/cf67cb5f982e51a14705f11a9a4db1e85604fea5/israeli-customer-support-automator/SKILL_HE.md
- https://raw.githubusercontent.com/kostja94/marketing-skills/70987bad4ebe9dce1f74858c1c64f3f8810f18e4/skills/pages/legal/refund/SKILL.md
- https://raw.githubusercontent.com/halogenOS/xos-assistant/8188665a43b02bb770f56d41656304d3e122feb9/docs/units/telegram/24-payments-stars-and-gifts.md
- https://raw.githubusercontent.com/petwashglobal/petwash-marketplace/69485a0c3fdbe926dced660b18e240c7cafd3825/docs/legal/shop-returns-cancellation-policy-2026-06-10.md
- https://raw.githubusercontent.com/Simon-YHKim/2nd-B/3abe495e7284409a90bfeae78ea0f0725024d40e/docs/legal/refund-policy.md

**Seen as GitHub code-search fragments (2026-09-03), not rendered:**
- https://github.com/skills-il/developer-tools/blob/3469e13/israeli-product-price-comparator/SKILL_HE.md
- https://github.com/skills-il/legal-tech/blob/927b06e/israeli-renovation-scope-builder/references/scope-and-terms.md
- https://github.com/skills-il/legal-tech/blob/927b06e/israeli-renovation-scope-builder/references/domain-checklist.md
- https://github.com/skills-il/security-compliance/blob/187f6b3/hebrew-legal-research/references/domain-checklist.md
- https://github.com/petwashglobal/petwash-marketplace/blob/69485a0/docs/legal/CLO-israel-2026-compliance-report.md
- https://github.com/craftmaster32/housamtes/blob/a65002d/app/(tabs)/settings/terms.tsx
- https://github.com/lidormalich/FlowMatic/blob/f9c1196/client-new/src/components/pages/TermsOfService.jsx
- https://github.com/teampactbjj-glitch/teampact-app/blob/3824ec0/legal/terms-of-service.md
- https://github.com/PCBJam/pcbjam/blob/766e2f4/site/src/content/legal/terms.md
- https://github.com/QuestPDF/QuestPDF-Documentation/blob/709ce96/docs/.vitepress/theme/license/documents/sources/terms-of-service.md
- https://github.com/emranio/arraysubs-webcontent/blob/e48855e/blogs/paddle-merchant-of-record-for-woocommerce-subscriptions/post.md
- https://github.com/graspsoftwarepw/tadaify-app/blob/fd0ea3a/docs/research/affiliate-program.md
- https://github.com/Hrachiaa/persona/blob/cf2fc89/frontend/src/i18n/locales/en/legal.json
- https://github.com/Beep206/CyberVPN/blob/1f5f56b/frontend/src/i18n/messages/generated/sv-SE.json

**Confirmed EGRESS_BLOCKED (must be opened by a human or unblocked agent):**
- https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32011L0083  (CRD Art. 16(m) waiver)
- https://www.gov.il/he/departments/topics/consumer_protection_cancel_transaction  (14ג(ד) list)
- https://www.paddle.com/legal/refund-policy
- https://www.paddle.com/legal/checkout-buyer-terms
- https://core.telegram.org/bots/payments-stars
- https://telegram.org/tos/bot-developers
