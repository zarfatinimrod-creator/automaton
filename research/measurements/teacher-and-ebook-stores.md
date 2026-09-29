# Measurement: Teach Simple, and Smashwords / Draft2Digital (REPLENISH-2026-09-28-2 rows 17 and 19)

**Date:** 2026-09-28. **Branch:** `claude/new-session-j071dx`. **Ordered by:** `research/breadth/REPLENISH-2026-09-28-2.md`
§6 (:510-512) and its test for Teach Simple (:471). **Grades:** [RENDERED] = quoted from a stored capture in
`research/rendered/`, cited `file:line`, each quote checked with `grep -n -F`. [INFERENCE] = my reading, not the venue's
words. UNKNOWN = no capture answers it. **Captures read in full:** `teachsimple-com-contributor-terms-of-service` (200,
674 lines), `teachsimple-com-become-a-contributor` (200, 421 lines; its FAQ answers exist only in the page's JSON-LD, all
on `.html:4`), `draft2digital-com-terms-of-service` (200, 768 lines). Gates as in REPLENISH §2 (:113-121).

## Teach Simple (row 17)

**Status: QUEUE-worthy (render only), on G3 PASS at rendered grade. No gate FAILs.** The platform's own team lists for
the contributor, which answers REPLENISH:471 condition (1) as worded. G5 leans FAIL, and two facts stay UNKNOWN: what the
upload service needs from us, and the Terms of Use that the contributor terms incorporate. Gate line: G1 P(r) ·
G2 U↗(r) · **G3 P(r)** · G4 U(r, no AI rule) · G5 U↘(r+re) · G6 U↗(r) · G7 U↗(r). [INFERENCE] It will most likely end
like Indiebook, parked on a step-8 written question: how the upload team receives files, and whether it keeps uploading
new items.

**G1, fees. PASS.**
- [RENDERED] become-a-contributor.html:4 (FAQ "Does Teach Simple Charge Contributors For Selling Items?"): "No, there are no fees associated with being a contributor or promoting your resources."
- [RENDERED] The only deductions are taxes on License Fees (contributor-terms.txt:333) and Royalty Deductions for cancellations, overpayment and indemnity (:337). No listing or account fee is named.

**G2, payout. Leans PASS; country eligibility is UNKNOWN.**
- [RENDERED] become-a-contributor.html:4: "We pay Contributors monthly via PayPal". The terms are looser. contributor-terms.txt:329 says "by electronic funds transfer (as may be supported by Teach Simple from time to time) or such other method as may be agreed by the parties".
- [RENDERED] contributor-terms.txt:353: "The parties agree that no payment shall be released to you until your royalties exceed $50.00 USD."
- [RENDERED] When royalties fall due. contributor-terms.txt:329: "Teach Simple agrees to pay you royalties (the “Royalties”) within 30 days following the end of the applicable subscription term". The FAQ names "Annual subscription (instead of monthly)" as an anti-abuse measure (become-a-contributor.html:4). [INFERENCE] Royalties from an annual subscriber can arrive up to about 13 months after the download.
- [RENDERED] The only bar on who may contract is the sanctions list: contributors must not be "on the US Department of Treasury's List of Specially Designated Nationals" (contributor-terms.txt:406). The terms offer ICDR arbitration, "the International Center for Dispute Resolution ("ICDR")" (:490), and mention data "less protective than those of your home country" (:526). [INFERENCE] Both assume some contributors live outside the US. Neither says so, and neither names a country.
- Identity appears only as grounds for termination: a "material misrepresentation made as to the capacity, identity or copyright ownership" (contributor-terms.txt:434). **No capture names an ID check, a tax form, a selfie or a camera step.** Whether a W-8BEN is required: UNKNOWN. The PayPal rail passed the camera gate in `research/measurements/paypal-israel.md:6-8`.

**G3, who uploads. PASS on the upload-team route.**
- [RENDERED] become-a-contributor.txt:264-265: "including our free upload service where our team at Teach Simple will upload all your" / "products for you." [INFERENCE] The platform's staff does the per-item listing, so the owner makes no per-item click.
- [RENDERED] The contract treats anything uploaded under the login as the contributor's own act. contributor-terms.txt:361: "Teach Simple is authorized to accept your login and password as conclusive evidence that you wish to upload Content pursuant to this Agreement." The same line: "Teach Simple shall have no liability or responsibility to monitor the provision of Content under your login and password." The indemnity covers "provision of Content under your account by any person, whether or not authorized by you" (:414).
- [RENDERED] The contributor terms contain no clause on automation, bots, scraping or agents. `grep -i -E "automat|\bbot|scrap"` finds nothing in either capture. [INFERENCE] That silence covers only this document. Silent terms do not pass a runner route (`BOARD-LOOP.md:125-127`, as applied at REPLENISH:99-101), so the PASS rests on the team route alone.
- Limits. [RENDERED] "Limited Spots Available" (become-a-contributor.txt:270) and "Are you ready to apply?" (:292) mean admission is by application. The form is a modal (`contributorModal`, become-a-contributor.html:358), so its fields are UNKNOWN. [RENDERED] Every item is reviewed first: Teach Simple "in its sole discretion, may determine which of such Content is suitable for posting" (contributor-terms.txt:285). That review is the platform's, not the owner's. UNKNOWN: how files reach the upload team, and whether the service is a one-off catalogue migration or keeps going for new items.
- [RENDERED] The contributor terms incorporate other terms. The contributor has "reviewed the terms of the Membership Agreement and Terms of Use" (contributor-terms.txt:506). Neither document is captured.

**G4, AI and honest value. UNKNOWN; there is no AI rule to fail.**
- [RENDERED] "AI", "artificial" and "generated" appear nowhere in either Teach Simple text. In the HTML the only "AI" hits are minified script identifiers (`slug:AI`). No capture asks for AI disclosure. [INFERENCE] The colony would declare AI in the item description anyway (constraint).
- [RENDERED] contributor-terms.txt:317: "By uploading Content, you are warranting that you own all proprietary rights or are the authorized representative of the applicable copyright owner(s) of such Content, including copyright". :406 adds "the Content delivered to Teach Simple hereunder represents original creations and expressions of subject matter". [INFERENCE] A warranty of copyright in purely AI output is a real honesty risk. Items need substantive human-directed selection and arrangement, or this warranty is the gate that fails.
- [RENDERED] "Teach Simple does not allow hyperlinks to other marketplaces." (contributor-terms.txt:381). Non-exclusive: "No, you can upload your resources where you please." (become-a-contributor.html:4).

**G5, buyers and royalty math. Leans FAIL.**
- [RENDERED] contributor-terms.txt:546 (Rate Card): "As a subscription platform, we use the subscriber share model to allocate earnings." The same line: "assign you a share of 50% of their net revenue based on how important your items were to them (i.e your share of all item points they used in that period)".
- [RENDERED] become-a-contributor.html:4: "On average customers download 2 products per month." The subscription price and the point weights are UNKNOWN (no capture states them).
- (re, REPLENISH:144) The origin was in the global top million in only 3 of 20 CrUX months, none in 2026, and never in the Israel lists. [INFERENCE] There is a pool, but it is small. One subscriber's 50% share is split across the items they used, so the $50 floor could take many months to reach.

**G6 and G7.**
- G6: one application, then the team uploads "all your products" [RENDERED above]. That leans PASS.
- G7: [RENDERED] contributor-terms.txt:321: "Using the name identified by you in your contributor account profile, Teach Simple shall use commercially reasonable efforts to credit you as the source of Accepted Content". [INFERENCE] The public credit name is ours to set, so Mehudak works. Whether a legal name also shows publicly is UNKNOWN.

**Next check (one):** `teachsimple-com-terms-of-service` → https://teachsimple.com/terms-of-service. It is linked in both
captures' footers (contributor-terms.html:495, become-a-contributor.html:356) and is the "Terms of Use" incorporated at
contributor-terms.txt:506. It could kill cheaply on a bot or automation ban, or on a US-only eligibility clause.

## Smashwords Store / Draft2Digital (row 19)

**Status: DEAD, now at rendered grade, but on G1, not G4. This corrects the scout-grade reason.** The rendered terms do
not contain the AI rule. They do name an up-front fee to activate distribution, and Smashwords.com is one of the
Program's own channels.

**The AI rule is absent from the terms. The scout-grade G4 FAIL stays at scout grade.**
- [RENDERED] `grep -c -w AI` over the text returns 0. "artificial", "LLM" and "extensive editing" return 0 in both the text and the HTML. The one hit for "generat" is about funds (:119). The scout quote ("does not accept content that has been generated entirely by AI/LLMs that has not gone through extensive editing from a human") is **not in** `draft2digital.com/terms-of-service/` (effective April 14, 2026, :33).
- [RENDERED] Content rules are delegated to another page. :321-323: "All Works must adhere to our" / "Content Guidelines . If you fail to adhere to such guidelines, we may" terminate or reject Works. That page is `/content-guidelines/` (html:529). [INFERENCE] The AI rule most likely lives there.

**The terms do cover the Smashwords Store.**
- [RENDERED] Smashwords.com is a channel inside the Program: "for Works distributed via Smashwords.com, you will be entitled to the following amounts" (:484). The rate is "75% of List Price for Work sales of $2.99 or more; 40% of" List Price under that (:485). The commission is 15% on every other channel (:481-482).
- [INFERENCE] The Content Guidelines, and any AI rule in them, bind Smashwords.com listings made through D2D. Coverage now rests on the rendered terms, not on the repo-grade `publishing.json:250`. UNKNOWN: whether a Smashwords-only account exists outside the D2D Program.

**The new killer: G1 FAIL [RENDERED].**
- :490-491: "To use the Program, you must open an account, which is free. To activate distribution privileges, a" / "one-time Account Activation Fee is required, which also covers the first year of account maintenance."
- :492 then charges "an Account Maintenance Fee of $12 USD" every year from year two. It "shall be waived if your account earns $100 USD or more in royalties over the prior twelve-month" period (:494). Maintenance fees are netted from royalties (:495). The activation fee is not.
- [INFERENCE] Distribution cannot start until the activation fee is paid, so it falls before any royalty exists. That breaks ₪0 up front on every D2D channel, Smashwords.com included. The amount is UNKNOWN.

**Other rendered facts, for the record.** PayPal pays at a $10 minimum (:411-412). Non-US PayPal payouts carry a fee "based on country" with a "maximum fee of $25.00 per payment" (:434-435). Payoneer is also offered (:403), and `BREADTH-SWEEP.md:319` says never to choose it. D2D may request "a tax identification number (SSN or EIN) and" identity information (:423-424), and royalties are forfeited after 180 days without it (:427-430). No camera step is named. A pen name is supported (:534). Only one account is allowed (:652). Non-fiction may need "proof of expertise" (:345).

**Next check (one, optional):** `draft2digital-com-content-guidelines` → https://draft2digital.com/content-guidelines/
(html:529, text :322). It would raise the G4 reason to rendered grade, which also carries the "Apple Books via D2D" line
at `docs/REJECTED.md:1223`. The kill no longer depends on it.

## Tick 9 (row 130 render) — Teach Simple Terms of Use

**Read 28.9.2026 by an Opus reader.** Capture: `teachsimple-terms-of-service` (200, fetchedAt 2026-09-28T21:03Z, first
fetch; 548 txt lines read in full; 463 html lines, grepped, including the script state). Short name `tos`. Every quote was
checked with `grep -n -F`.

**Status: QUEUE-ON. None of the three cheap kills fires.** The Terms of Use are generic web-shop terms: "Our store is
hosted on Shopify Inc." (tos.txt:267). They bind contributors, "including without limitation users who are browsers,
vendors, customers, merchants, and/ or contributors of content" (:262). They have no AI clause and no clause on who may
be a contributor, and they say nothing about payouts. The date "As of September 28, 2026" (:255) is the fetch day, and
the page state holds `menuDate:"2026-09-28"` (tos.html:461). [INFERENCE] It is the server's date, not a revision date.
The terms' real version date is UNKNOWN.

**Kills.** All three are only PROPOSED: they come from ZERO-TESTS row 130. The board's §4 row 28 does not pre-register
them, so the Fable sitting confirms them. None fires.
- **Bot or automated-access ban: DOES NOT FIRE.**
  - [RENDERED] The one clause about automated access bars using the site "(i) to spam, phish, pharm, pretext, spider,
    crawl, or scrape;" (tos.txt:363). Those are data-collection acts.
  - There are no hits for "bot", "automat" or "robot" in the txt or the html.
  - [INFERENCE] Nothing bars an agent from operating the contributor account. In any case the listing route is Teach
    Simple's own upload team (the reading above).
  - A constraint for our watchers: do not crawl or scrape teachsimple.com. Read the numbers from the contributor
    dashboard or its emails, as with GameDistribution's "no monitoring" clause.
- **US-only clause: DOES NOT FIRE.**
  - There is no residence or citizenship term ("citizen": 0 hits).
  - The only geographic rule is a discretionary right to "limit the sales of our products or Services to any person,
    geographic region or jurisdiction. We may exercise this right on a case-by-case basis." (:313). There is also "We
    reserve the right to refuse service to anyone for any reason at any time." (:281).
  - Governing law is Washington State (:409). The age rule is neutral ("the age of majority in your state or province of
    residence", :271).
  - The footer lists "United States", "Canada", "United Kingdom" (:545-547). [INFERENCE] That is a storefront locale
    picker, not an eligibility rule.
  - Payout country stays UNKNOWN: "PayPal" has 0 hits here.
- **AI rule: DOES NOT FIRE.**
  - "AI" as a word, "artificial" and "generated" have 0 hits in the txt. In the html, "AI" appears only as minified
    identifiers (`slug:AI`).
  - Two honesty clauses apply, and a declared agent acting for the brand meets both [INFERENCE]: no use "(f) to submit
    false or misleading information;" (:363), and "You may not use a false e-mail address, pretend to be someone other
    than yourself, or otherwise mislead us or third-parties as to the origin of any comments." (:349).

**Still unread.** The contributor terms incorporate the "Membership Agreement and Terms of Use"
(contributor-terms.txt:506). This page is the Terms of Use. "Membership" has 0 hits here, and the page links no such
document. The only other legal link is `/license-agreement` (tos.html:457; footer "License", tos.txt:541). Whether that
page is the Membership Agreement is UNKNOWN.

**Gate line.** Unchanged, now with the Terms of Use read:
G1 P(r) · G2 U↗(r) · G3 P(r) · G4 U(r) · G5 U↘(r+re) · G6 U↗(r) · G7 U↗(r).
- G4 has no AI rule in either text. The original-creations warranty (contributor-terms.txt:406) is still the honesty
  gate.
- G5 still leans FAIL: a points pool, a $50 floor, and royalties arriving up to about 13 months after an annual sale.

**Next step.**
- **The written question from the brand mailbox.** No document answers what is left: how the upload team takes files,
  whether it keeps uploading new items, and payment to a contributor outside the US (W-8BEN?).
  - The recipient `support@teachsimple.com` is captured (tos.txt:420; also contributor-terms.txt:549).
  - Draft, for the main thread to add to `research/owner-asks/questions.json` and its note together (a test keeps them in
    step): *"Hello Teach Simple team. Mehudak (מהודק) is a small brand that makes teaching resources with AI and states
    this in each item; its accounts are run by an AI agent acting for the brand, which wrote this message. One question,
    yes or no: can a contributor based in Israel, paid by PayPal, join and have your free upload service list new items
    on an ongoing basis? We are asking for your current rule only. Thank you, Mehudak (מהודק)"*
  - Pre-registered reading: an explicit YES clears G3's ongoing-service doubt and G2's country doubt. An explicit NO
    fails G3 or G2, depending on the reason given. Anything else is NOT ANSWERED.
- **An optional render** that can only kill: **https://teachsimple.com/license-agreement** (tos.html:457). Read it for
  an AI or automation clause, and for whether it is the Membership Agreement.
- The refill note's held URL, `https://teachsimple.com/blog/contributors/new-contributor-onboarding/`
  (REPLENISH-2026-09-28-2.md:530), is not in this capture. Its condition, "only if the terms omit the payout rail", is
  met by these terms, but the contributor FAQ already names PayPal. [INFERENCE] Its remaining value is the upload-team
  intake, which the written question also covers.
- For the sitting: G5 is weak. Is one written question worth spending on a small subscription pool?

## Tick 10 (row 135 render) — Teach Simple License Agreement

**Read 28.9.2026 by an Opus reader.** Capture: `teachsimple-com-license-agreement` (200, fetchedAt 2026-09-28T22:00Z,
first fetch). Short name `lic`. The txt (467 lines) was read in full; the licence itself is :255-339. I grepped the html
(396 lines; the licence body is at :285, the page state at :394). Every quote was checked with `grep -n -F`.

**Status: QUEUE-ON, unchanged. This render could only kill, and it does not.**
- The page is the subscribers' licence for downloaded items. It is not a contributor document, and it is not the
  Membership Agreement.
- It has no AI clause, no automation clause and no US-only clause.

**What the page is** [RENDERED]
- It is headed "Teach Simple License" (lic.txt:255): "All Resources on Teach Simple have the same simple license terms."
  (:257).
- It licenses subscribers: "For each digital file (called a "Resource" ) you download under your Teach" / "Simple
  subscription, you are granted a license to use the Resource on a non-exclusive," / "worldwide, and revocable basis,
  for one single user." (:272-274).
- "The license starts when you download the Resource and the license is only valid while your subscription is active."
  (:279).
- It ties itself to the Terms of Service: "This license applies in conjunction with the User Terms of Service for your
  use of Teach Simple." (:331). The page's only legal links are `/license-agreement` (lic.html:390) and
  `/terms-of-service` (:392).
- Clauses that touch contributors, all on the subscriber side:
  - "The owner of each Resource retains ownership. You can't claim ownership of a Resource." (:339);
  - subscribers "can't redistribute the Resources on another marketplace" (:295);
  - Teach Simple is not responsible for the accuracy of a Resource, "including the Resource's description and any
    keywords provided by the owner of the Resource" (:319);
  - third-party components may carry their own licence: "For some Resources, a component of the Resource will be sourced
    from a third party" (:315).

**Is it the "Membership Agreement"? No, as far as the text shows. That document is still uncaptured.**
- [RENDERED] "Membership" has 0 hits in the txt and the html. The one "member" hit is inside "Remember" (:274).
- The page calls its companion document the "User Terms of Service" (:331), not a Membership Agreement.
- The contributor terms use the Membership Agreement for the contributor's own account: "If Teach Simple terminates
  your membership pursuant to the terms of the Membership Agreement, such termination shall be deemed to be notice of
  termination of this Agreement with respect to all Content" (contributor-terms.txt:430). See also :450 and :506.
- [INFERENCE] The Membership Agreement governs the account, which this licence does not.
- No Teach Simple capture links a document by that name. "membership" appears only in the contributor terms and in
  the become-a-contributor page's meta description, as "a subscription membership" (become-a-contributor.html:4). No URL
  is left to render for it.

**Kills. All three are PROPOSED only (ZERO-TESTS row 135); the board's §4 row 28 does not pre-register them.**
- **AI clause: DOES NOT FIRE.** "AI" as a word, "artificial" and "generat" have 0 hits in the txt and the html.
- **Automation or bot clause: DOES NOT FIRE.**
  - "automat", "robot", "scrap", "crawl" and "agent" have 0 hits.
  - "bot" appears once in the txt, inside "both" (:283). The 83 "bot" hits in the html are CSS (`margin-bottom`,
    `padding-bottom`, `border-bottom`).
- **US-only clause: DOES NOT FIRE.**
  - The licence is "worldwide" (:274).
  - "citizen" and "U.S." have 0 hits. The html's three "resident" hits are a "presidents-day" menu slug.
  - "United States" appears once, in the footer's locale list (:464-466), as on the Terms of Service page.

**Gate line.** Unchanged: G1 P(r) · G2 U↗(r) · G3 P(r) · G4 U(r) · G5 U↘(r+re) · G6 U↗(r) · G7 U↗(r).
- **G4:** there is still no AI rule anywhere. The original-creations warranty (contributor-terms.txt:406) is still the
  honesty gate. The licence adds that item descriptions and keywords are the owner's, not Teach Simple's,
  responsibility (:319).
- **G5:** the subscriber model is confirmed on the buyer side. A licence lasts only while the subscription is active
  (:268, :279), and each item is licensed per download (:272-273). Payout terms are not on this page ("PayPal" and
  "royalt": 0 hits).
- **G7:** "The owner of each Resource retains ownership." (:339). Nothing here about public names.

**The drafted question (`research/owner-asks/questions.json`, venue `teachsimple`).**
- **Its `preSend` condition is settled.** Row 135 has been rendered and read.
  - It holds no AI, automation or US-only clause, so the "send nothing" branch does not apply.
  - It says nothing about the ongoing upload service or about paying a contributor in Israel, so the "held question
    instead" branch does not apply either.
- **The question should go as drafted.** Nothing here changes its body.
- One point for the main thread (I did not edit the file): the Membership Agreement that the contributor terms
  incorporate (contributor-terms.txt:506) has no captured URL. The question does not ask for it. If a reply links it,
  render that link.

**Next step.**
1. **Send the drafted `teachsimple` question** to `support@teachsimple.com` (tos.txt:420; also lic.txt:342). It settles
   the ongoing upload service (G3) and PayPal to Israel (G2).
2. No render is left that could kill cheaply. The sitting's question from Tick 9 still stands: G5 is weak, so is one
   written question worth spending on a small subscription pool?
