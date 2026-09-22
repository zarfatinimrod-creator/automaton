# Scout: distribution / email-acquisition

**Criterion:** Building an email list without a human — what is legal under Israeli spam law
(חוק הספאם) and GDPR, and what actually converts.

**Date:** 2026-09-04. **Searches spent:** 7 of 8 allowed.

---

## 0. Method and the honesty caveat that governs everything below

Every Israeli primary source for this criterion is behind the egress proxy. Confirmed blocked
this session:

- `he.wikisource.org` — EGRESS_BLOCKED (this is where the consolidated statute text lives)
- `commission.europa.eu` — EGRESS_BLOCKED (EU adequacy decisions page)

`gov.il`, `kolzchut.org.il` and `nevo.co.il` appear in search results but were not fetched.

**The route that worked, and it cost zero search budget:** a public GitHub org, `skills-il`,
publishes Hebrew-market operating skills with a machine-readable `evidence.json` per skill, in
which each claim carries a `source_url`, a verbatim `raw_snippet` and a `fetched_at`. Their
`israeli-email-sequences` skill is, in effect, a pre-fetched mirror of the Hebrew statutory text
that this container cannot reach. I rendered two files from `raw.githubusercontent.com`.

**Evidence grade for the legal section:** the file itself is a *rendered page* (strong evidence
that this repo asserts X, with verbatim Hebrew statutory quotes and a fetch date of 2026-08-24).
The underlying statute is *second-hand* — I did not open `he.wikisource.org` myself. The Hebrew
snippets are verbatim legislative drafting and are internally consistent, which raises confidence,
but a human or unblocked agent should close the loop by opening:
`https://he.wikisource.org/wiki/חוק_התקשורת_(בזק_ושידורים)` and reading סעיף 30א directly.

Sources rendered (zero search budget):
- https://raw.githubusercontent.com/skills-il/marketing-growth/56ad3a7c83f1d6b5737c9114eda9e7e1f76dbce7/israeli-email-sequences/SKILL.md
- https://raw.githubusercontent.com/skills-il/marketing-growth/56ad3a7c83f1d6b5737c9114eda9e7e1f76dbce7/israeli-email-sequences/evidence.json
- GitHub MCP `search_code` hits in `skills-il/communication` (`israeli-telegram-business-bot/SKILL.md`,
  `israeli-customer-support-automator/evidence.json`) and `skills-il/marketing-growth`
  (`israeli-content-marketing/SKILL.md`, `israeli-paid-ads/evidence.json`).
- A 404 to note so nobody repeats it: `.../skills-il/communication/main/israeli-telegram-business-bot/SKILL.md`
  returns 404. Use the commit SHA from the `search_code` result, not `main`.

---

## 1. What is legal in Israel — סעיף 30א (Amendment 40, in force since Dec 2008, last amended תשפ"ב/2022)

All quotes below are the `raw_snippet` values from the evidence.json above, attributed there to
he.wikisource.org, fetched 2026-08-24.

**Consent (30א(ב)) — opt-in, not opt-out:**
> "לא ישגר מפרסם דבר פרסומת באמצעות פקסימיליה, מערכת חיוג אוטומטי, הודעה אלקטרונית או הודעת מסר קצר, בלא קבלת הסכמה מפורשת מראש של הנמען, בכתב, לרבות בהודעה אלקטרונית או בשיחה מוקלטת"

Express prior consent **in writing**, where "in writing" expressly includes an electronic message.
A one-off approach to a *business* recipient is stated (in the same source) not to be a breach —
that is the only crack in the wall and it is a single approach, not a campaign.

Consequence for us: **scraping, buying or importing a list is not consent.** The `israeli-content-marketing`
SKILL.md states this in terms: "Building a list by scraping, buying or importing contacts is not consent."

**Mandatory message elements (30א(ה)(1)):**
- The word **פרסומת** at the start of the ad **and in the subject line** for email:
  > "המילים \"פרסומת\", \"בקשת תרומה\" או \"תעמולה\" ... יופיעו בתחילת דבר הפרסומת, ואם דבר הפרסומת משוגר באמצעות הודעה אלקטרונית – בכותרת ההודעה"
- Advertiser name, address, contact details: > "שמו של המפרסם, כתובתו ודרכי יצירת הקשר עמו"
- Refusal right at any time, a simple and reasonable route, and a valid internet address for it.

**SMS carve-out (30א(ה)(2)):** short messages carry name + refusal contact only; the postal address
drops out. Do not copy the email template into SMS and do not copy the SMS template into email.

**Existing-customer exception (30א(ג)) — the one lawful shortcut we already qualify for:**
three cumulative limbs, and *no 12-month recency window exists in the statute*:
1. the recipient gave their details during a purchase or negotiation for one, **and was told the
   details would be used to send advertising**:
   > "הנמען מסר את פרטיו למפרסם במהלך רכישה של מוצר או שירות, או במהלך משא ומתן לרכישה כאמור, והמפרסם הודיע לו כי הפרטים שמסר ישמשו לצורך משלוח דבר פרסומת מטעמו"
2. they were given the chance to refuse and did not;
3. the ad concerns a product/service **of a similar kind**:
   > "דבר הפרסומת מתייחס למוצר או לשירות מסוג דומה"

**Refusal (30א(ד)):** free apart from sending cost; given in writing or by the channel the ad
arrived on, recipient's choice. **The statute sets no deadline for honouring it** — the "2 days"
number in circulation is Google/Yahoo platform policy, not Israeli law. In a continuing-supply
contract the recipient is deemed to have refused when the contract ends (30א(ד)(2)).

**Damages (30א(י)(1)):**
> "פיצויים שאינם תלויים בנזק ... בסכום שלא יעלה על 1,000 שקלים חדשים בשל כל דבר פרסומת שקיבל הנמען בניגוד להוראות סעיף זה"

Up to **₪1,000 per message, no proof of harm**, where sending was knowing. 30א(י)(5) creates a
rebuttable presumption of knowledge. A 5,000 NIS ceiling is a *proposal, not enacted* — Kol Zchut
still states 1,000 (`bill-5000-not-enacted`).

**Nonprofit carve-out (30א(ב1)):** an עמותה / חברה לתועלת הציבור may email for donations or
advocacy unless the recipient refused. Not available to us — our lines are commercial.

**Class-action exposure is live, not theoretical.** Search snippet, 2026-09-04, from
https://www.dt-law.co.il/page.asp?PageID=638 and https://lawz.co.il/... : requests to approve
spam class actions "have been growing and have become routine matters in courts", "with potential
sums reaching millions". ISOC Israel maintains a verdicts index at
https://www.isoc.org.il/freedom-of-internet/spam/spam-verdicts (snippet only, not fetched).
**Evidence grade: search snippet. To close: open the ISOC verdicts page.**

## 1b. The second Israeli statute nobody remembers — Amendment 13 to the Privacy Protection Law (in force 14 Aug 2025)

This is the finding that kills a whole category of business, and it is *separate* from 30א.
From the same evidence.json (source he.wikisource.org / חוק הגנת הפרטיות, fetched 2026-08-24):

- **Section 8א(a) registration:** a database whose main purpose is collecting personal data for
  supplying to others as a business or for consideration, **including direct-mail services**
  (שירותי דיוור ישיר), holding data on **more than 10,000 people**, must be registered.
  > "מטרתו העיקרית היא איסוף מידע אישי לשם מסירתו לאחר כדרך עיסוק או בתמורה, לרבות שירותי דיוור ישיר, ויש במאגר מידע אישי על יותר מ־10,000 בני אדם"
- **Section 17ב1 DPO:** the same 10,000-person direct-mail test is the only *numeric* DPO trigger.
  A DPO is a named human. **This is an owner-blocker by construction** if we ever cross it.
- **Section 17ד:** you may not process a direct-mail database unless registered with direct-mail
  services as a registered purpose. (Old 17ג was repealed.)
- **Section 17ו(a)(1):** every direct-mail approach must carry, clearly and prominently, the
  statement that it is direct mail **plus the database's registration number**:
  > "כל פניה בדיוור ישיר תכיל באופן ברור ובולט – ציון כי הפניה היא בדיוור ישיר, בצירוף ציון מספר הרישום של המאגר"
  No ESP template emits this field. It has to be hand-added.
- **Penalties, section 23כו:** fixed amounts, e.g. ₪150,000, doubled for databases covering 1M+
  people; a floor of ₪30,000 where the computed amount is lower; the 5%-of-turnover figure is a
  *reduction the violator applies for*, not an automatic cap.

**Reading for us:** running our *own* list to our *own* subscribers is not "supplying data to
others" and does not trigger 8א(a). Selling leads, running dיוור for clients, or renting the list
does trigger it — registration + a human DPO + a registration number in every message.

## 2. GDPR / EU side

- **Israel holds an EU adequacy decision (2011/61/EU), still in force.** Cited in evidence.json
  to https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en
  with the verbatim list including "Israel"; most recent concluded Commission review COM(2024) 7
  final, 15 Jan 2024, which *predates* Amendment 13 and no post-Amendment-13 review has concluded.
  **I could not fetch that page (EGRESS_BLOCKED) — second-hand.** Practical effect: EU subscriber
  data may sit in an Israeli-controlled system without SCCs. To close: open the EU page above.
- **ePrivacy Art 13(2) "soft opt-in"** lets you email existing customers about *similar* products
  without fresh consent, provided the address was obtained "in the context of the sale of a product
  or a service", the marketing is for the organisation's own similar products, and an easy free
  objection route is offered **both at collection and in every message**.
- **CJEU *Inteligo Media* C-654/23 (Nov 2025)** held the soft opt-in is a **stand-alone legal basis**;
  no separate GDPR consent is needed when its conditions are met. Snippets from
  https://www.timelex.eu/en/blog/cjeu-clarifies-interplay-between-gdpr-and-eprivacy-direct-marketing-soft-opt-made-easier
  and https://www.reedsmith.com/our-insights/blogs/viewpoints/102luvt/ecj-rules-on-soft-opt-in-for-freemium-newsletters-no-separate-gdpr-legal-basis-r/
  (search snippets, 2026-09-04, not fetched). **To close: open either.**

**The convenient symmetry:** Israel's 30א(ג) and the EU's Art 13(2) are near-identical in shape —
customer-obtained address, similar product, refusal route offered at collection and every message.
One implementation satisfies both. Israel is the *stricter* of the two only in the disclosure
requirements (the פרסומת tag and the address).

## 3. What actually converts

**Israeli benchmarks** (evidence.json claim `activetrail-il-benchmark-2026`, attributed to
https://www.activetrail.co.il/blog/marketing_automation_articles_il/email-marketing-benchmark-2026/,
fetched 2026-08-24, verbatim Hebrew snippet):
> "שיעור הפתיחה הממוצע עמד על כ-40%. בקרב 10% הארגונים המובילים הנתון חצה את רף ה-53%. שיעור הקליקים הממוצע נע סביב 3%, בעוד שאצל המובילים טיפס ל-5%."

Average open ~40% (top decile >53%), average click ~3% (leaders 5%). **Treat opens as junk** —
Apple Mail Privacy Protection auto-opens. Click is the only usable number. Unsubscribe rate is not
published; do not quote one. **Evidence grade: second-hand rendered mirror; activetrail.co.il not fetched.**

**Capture-rate benchmarks** (search snippets, 2026-09-04, from crazyegg.com/blog/popup-statistics/,
bdow.com/stories/email-signup-benchmarks/, claspo.io/blog/popup-conversion-rate-benchmarks/,
shno.co/marketing-statistics/email-list-growth-statistics — **snippets only, none fetched**):

| Mechanism | Reported capture rate |
|---|---|
| Generic "subscribe to our newsletter" | 1–2% |
| Specific lead magnet ("Free SEO Checklist for Local Businesses") | 5–8% |
| Email-capture popup, average | 4–5% (5.10–7.65% depending on magnet) |
| Exit-intent modal | ~3.2–3.94% |
| Exit-intent spin wheel | ~8.3% (a gimmick; ignore) |
| Popup + lead magnet, mobile | 3.8% → 7.7% |
| Popup + lead magnet, desktop | 1.8% → 4.7% |

Two operational rules from the same snippets: popups shown after 6–15 seconds beat immediate ones
in every dataset that measured timing; **every additional form field costs 10–25% of conversions**
(so: email only, nothing else — which is also the Amendment 13 data-minimisation answer).

**The synthesis that matters for a no-human operation:** the highest-converting, lowest-legal-risk
capture is not a popup at all. It is **a tool whose output the user asks to be emailed** — the
address is volunteered to receive a thing the user requested, the consent record writes itself
(address, timestamp, IP, source form, on-screen wording), and the intent is qualified. We already
own the tools: `products/il-biz-tools` calculators.

## 4. Deliverability — the hard operational gate

From evidence.json, attributed to Google/Yahoo/Microsoft pages (all `support.google.com` etc.,
**not fetched here**, second-hand):

- **Google:** ≥5,000 messages/day to personal Gmail in 24h = bulk sender, counted per primary
  domain, and the status is **permanent and does not revert**. Enforcement ramped to temporary and
  permanent *rejections* from Nov 2025. Spam rate below 0.10%, never reach 0.30%; above 0.3% you
  are ineligible for mitigation until 7 consecutive days below it. Unsubscribes honoured within 48h.
  RFC 8058 one-click unsubscribe required for marketing mail only.
- **Microsoft (from 5 May 2025):** >5,000/day to consumer Outlook/Hotmail/Live must pass SPF, DKIM
  and DMARC; `550 5.7.515` rejection described.
- **Yahoo:** SPF+DKIM, DMARC ≥ p=none, spam rate <0.3%, unsubscribes within 2 days.
- Both SPF and DKIM must exist; only one needs to align with the From domain for DMARC.

**Design consequence:** stay under 5,000/day to Gmail *deliberately and permanently*. A one-off
launch blast permanently re-classifies the sending domain. For a list of any size we plan to reach,
throttling below the threshold costs nothing and buying bulk-sender status back is impossible.

## 5. Payability to Israel — where the money actually breaks

The list is an asset; the question is what pays for it.

- **Selling our own product to the list — YES.** Paddle already pays the owner
  (`products/il-biz-tools` Pro). Telegram Stars and Apify pay-per-event are already shipped rails.
- **Newsletter sponsorship marketplaces — UNKNOWN, leaning NO, and this is the sharpest finding
  in the payability column.** Search snippet, 2026-09-04, from
  https://docs.stripe.com/connect/cross-border-payouts : "Platforms based in the United States,
  United Kingdom, EEA, Canada, and Switzerland can transfer funds to connected accounts located in
  any of these same regions. However, Stripe doesn't support self-serve cross-border payouts to
  countries outside the listed regions." **Israel is outside all five regions.** Paved (US) pays
  publishers, and beehiiv monetization uses Stripe Express connected accounts
  (https://www.beehiiv.com/support/article/30065237532823-how-to-set-up-a-stripe-express-account-for-monetization,
  snippet). If both are US platforms paying an Israeli connected account, self-serve payout is not
  supported. A separate snippet claimed Israel is "included on the list of countries supported by
  Stripe Connect" — that is about *having* a Stripe account in Israel, which is a different question
  from a US platform paying into one. **These two snippets conflict and neither page was fetched.**
  **To close, a human or unblocked agent must open, in this order:**
  1. https://docs.stripe.com/connect/cross-border-payouts (is Israel a supported destination?)
  2. https://www.paved.com/publishers (publisher payout country list / terms)
  3. https://www.beehiiv.com/support/article/30064926230679-using-stripe-with-beehiiv-account-types-explained
  Until then **every sponsorship-revenue proposal must carry a ceiling of ₪0.**
- Sponsorship price context if it ever unblocks (search snippets, paved.com/blog/newsletter-sponsorship-rates/,
  sponsorships.ai/blog/newsletter-sponsorship-rates, 2026-09-04): $15–30 CPM generic marketplace
  primary sponsorships; $60–150 technology; $80–200 B2B marketing/SaaS/finance. Paved takes **30%**.
  Note what that arithmetic means: a 2,000-subscriber Hebrew list at even $100 CPM is $200 gross,
  $140 net, per send. Sponsorship does not reach ₪20,000/month on a small list at any CPM.

## 6. Competition on the compliance angle

Israeli ESPs already bundle spam-law compliance and market it as such: smoove
(https://www.smoove.io/he/blog/... interview with עו"ד יורם ליכטנשטיין), ActiveTrail, Rav Messer
(responder.co.il), inwise, and Meser10 (https://www.meser10.co.il/spam-law/). SUMIT — an Israeli
invoicing/CRM platform — publishes a compliance help article
(https://help.sumit.co.il/he/articles/8215159-...). All snippets, 2026-09-04, none fetched.
**Read that as: compliance is a free bundled feature of every incumbent, not a product.** It is a
credible *lead magnet* and a *Pro feature*; it is not a standalone business.

## 7. Dead ends, stated plainly

1. **Any list built by scraping, purchase, import or enrichment is RED in Israel.** Not "risky" —
   ₪1,000 per message, no proof of harm, class actions routine, and the burden of producing the
   consent record is on the advertiser. This closes the entire "grow a list fast" playbook and every
   cold-outreach line that depends on it.
2. **Lead-generation-as-a-service and list rental are RED-adjacent for a no-human operation.**
   Amendment 13 §8א(a)/§17ב1 attach registration *and a Data Protection Officer* — a named human —
   at 10,000 people, and §17ו requires the database registration number in every message. The DPO
   is an irreducible owner blocker.
3. **Newsletter sponsorship revenue is ₪0 until the Stripe cross-border payout question is answered.**
   Not a bad idea — an unpayable one, on current evidence.
4. **A standalone Israeli spam-compliance SaaS has no gap.** Five incumbents bundle it free.
5. **Open rates are not a metric.** Apple MPP inflates them; the 40% Israeli figure cannot be used
   to judge anything. Only clicks and revenue count.
6. **What I could not answer:** no Israeli-specific *capture-rate* benchmark exists in anything I
   could reach — every capture number above is US/global. Hebrew-audience capture rates are
   **unknown**, and the first list we build is the only way to learn them.

## 8. Search budget

7 of 8 spent. No search was refused. Queries run:
1. beehiiv payouts Israel Stripe Connect supported countries newsletter ad network eligibility
2. email capture conversion rate benchmark 2026 lead magnet vs exit intent popup free tool gated result
3. תביעות ייצוגיות חוק הספאם 2025 2026 פיצוי 1000 ש"ח הודעה עסקים נתבעים
4. Paved Swapstack newsletter sponsorship marketplace publisher payout countries international Stripe self-serve
5. ePrivacy Directive Article 13(2) soft opt-in existing customer similar products email marketing GDPR legitimate interest B2B
6. בודק תקינות דיוור חוק הספאם כלי בדיקה עמידה בחוק ניוזלטר ישראל שירות
7. Paved marketplace CPM newsletter sponsorship price per 1000 subscribers benchmark 2026 niche B2B

Plus zero-budget: 2 GitHub `search_code` calls, 2 successful `raw.githubusercontent.com` fetches,
3 blocked/404 fetches (he.wikisource.org, commission.europa.eu, a wrong-branch raw URL).
