# Scout notes — bounties-grants / bug-bounty
Criterion: Bug bounty via authorized programmes only (HackerOne, Bugcrowd, Intigriti): eligibility, KYC, payout to Israel, realistic earnings for automated analysis, and the rules that forbid unauthorized testing.
Date of research: 2026-09-03. Search budget used: 8/8 WebSearch (cap reached). WebFetch used freely (most hosts blocked).

## Evidence inventory (what I actually saw)

### STRONG — rendered primary documents
1. **HackerOne 9th Hacker-Powered Security Report 2025/2026** (PDF, mirrored on GitHub — the only way past the proxy, hackerone.com itself is EGRESS_BLOCKED).
   URL fetched: https://raw.githubusercontent.com/jacobdjwilson/awesome-annual-security-reports/main/Annual%20Security%20Reports/2025/HackerOne-Hacker-Powered-Security-Report-2025.pdf
   31 pages, text extracted locally with pypdf. Data window stated in the report: **1 July 2024 – 30 June 2025**.
   Verbatim figures from the "Year in Review" page:
   - Total bounty payouts **$81M**, up 13% YoY
   - **Average bounty payout $1,090**, up 4%
   - **84.9K valid reports**, up 7%; **23.7K critical & high severity valid reports**, up 10%
   - **1,121 programs with AI in scope or a valid AI report**, up 270%
   - **210% growth in valid AI reports**; **339% growth in rewards paid for valid AI reports**
   - $3B "mitigated loss savings"
   Program/researcher concentration page:
   - **$81M total paid 2025**; **$42K average yearly payout across all active programs**
   - **$21.6M paid by the top 10 programs**; **$51.4M by the top 100 programs**
   - **$7.6M earned by the top 10 researchers**; **$31.8M by the top 100 researchers**
   Hackbot section (5-month review):
   - "**49% of all hackbot reports were valid**"
   - "hackbots excel at pattern-matching and detecting surface-level flaws like reflected XSS, much like traditional scanners"
   - "today, human contextual reasoning, and system-level understanding remain essential alongside automation and autonomy"
   - 82% of customers aware of hackbots on the platform; 63% "cautiously optimistic"; 66% of researchers expect hackbots to enhance their work, 43% see them as tools for simple bugs
   Researcher demographics page (AMBIGUOUS — see caveat):
   - "Top researcher earning **$1,079,738**"; "Average researcher earning **$39,500**"; "Median researcher earning **$13,800**"
   - CAVEAT: these sit next to Figure 13 "Total Platform Earnings in the Last 12 Months" and Figure 14 (age of account), and they are irreconcilable with $81M/year spread over the platform's researcher base. They are almost certainly **all-time earnings of a surveyed/earning subset**, not annual earnings of a random participant. I did not find a definition in the extracted text. Do not use these as an income projection.
   - Also: "Since 2021, valid vulnerability reports on HackerOne have grown by 20%, **not including the large number of submissions ultimately deemed invalid**."
   - Researcher AI tool usage: report writing 69%, PoC generation 50%, exploit code 47%, brainstorming 46%, summarizing 43%, wordlists 38%, note taking 35%, **automated reconnaissance 32%**, **building or using an automated LLM agent 23%**.

2. **curl's AI-slop gist** (rendered): https://gist.github.com/bagder/07f7581f6e3d78ef37dfbfc81fd1d1cd
   - Documents **49 numbered fraudulent/AI-hallucinated security reports** submitted to curl's HackerOne bug-bounty programme (report ids #2199174 → #3516202), comments Oct 2025 → Jul 2026.
   - Maintainer policy quoted verbatim in the gist: "**Our current policy says that we instantly ban all reporters submitting AI slop.**"

3. **disclose.io core terms, archive edition** (rendered from GitHub): https://raw.githubusercontent.com/disclose/dioterms/master/archive/core-terms-US-2020-ELECTIONS.md
   Ground Rules, verbatim: "Perform testing only on in-scope systems, and respect systems and activities which are out-of-scope"; "You should only interact with test accounts you own or with explicit permission from the account holder"; "Do not damage our systems or degrade user experience"; never "exfiltrate, modify, or destroy system data"; do not "require payment in exchange for disclosing your findings"; "Cease testing and submit a report immediately if you encounter any user or voter data."
   Simple Safe Harbor text (via GitHub code search in repo disclose/dioterms, terms/simple-safe-harbor/en-US.md): "We will consider your security research to be **authorized** if you make a good faith effort to comply with this policy during your security research."
   → The authorization is conditional and scope-bound. Outside scope there is no safe harbor at all.

### WEAKER — search snippets quoting a page I could not render
4. HackerOne Sanctions FAQ (https://www.hackerone.com/sanctions-faq — **www.hackerone.com is EGRESS_BLOCKED**). Snippet seen 2026-09-03 states HackerOne "restricts eligibility from residents of countries that are subjects of broad, geographically-defined U.S. sanctions programs, such as **Cuba, Iran, North Korea, Sudan, Syria, or Crimea**, and from persons designated in ... the SDN List". Also: payments to hackers in **Russia and Belarus** are held. **Israel is not in any of these lists.**
   → To close: a human must open https://www.hackerone.com/sanctions-faq and https://www.hackerone.com/terms .
5. HackerOne payments docs (https://docs.hackerone.com/en/articles/8395706-receiving-payments and .../8395720-payment-preferences — **docs.hackerone.com EGRESS_BLOCKED**). Snippets: payout methods are **bank transfer, PayPal, and direct-to-wallet crypto (BTC or USDC)**; bank transfer "gives you the ability to get paid out in 30 different currencies to almost any country in the world"; "To be eligible to receive payments, you must set up at least one of the above payment preferences and **complete a tax form** for your account."
   → To close: open docs.hackerone.com/en/articles/8395706-receiving-payments and 8399426-payment-faqs.
6. Bugcrowd payments docs (docs.bugcrowd.com — EGRESS_BLOCKED). Snippets: current researcher payment methods are **bank transfer and PayPal**, Bitcoin for select programs; **Payoneer was announced historically but is not listed in current docs**. No country list obtained.
   → To close: docs.bugcrowd.com/researchers/payments/setting-up-payment-methods/ and .../frequently-asked-questions-payment-methods/
7. Intigriti payout methods (kb.intigriti.com — EGRESS_BLOCKED). Snippet lists **five** methods: bank/wire transfer, **PayPal**, **Payoneer**, **UPI**, and **invoice + wire transfer for researchers with a registered VAT number**. Processing 1–3 working days within Belgium, 3–5 international.
   → To close: https://kb.intigriti.com/en/articles/3379502-payout-methods
   Note: the invoice route matches an Israeli עוסק מורשה/פטור cleanly — an EU-facing invoice for services, zero-rated export. Relevant because it removes the "who is the payer of record" ambiguity.
8. curl ending its bug bounty over AI slop: bleepingcomputer.com/news/security/curl-ending-bug-bounty-program-after-flood-of-ai-slop-reports/ and daniel.haxx.se/blog/2025/07/14/death-by-a-thousand-slops/ (snippets, hosts not fetched). Snippet claims submission volume 8x normal by July 2025 and the confirmed-vulnerability rate dropping from >15% historically to **below 5% in 2025**; the bounty ended by end of January 2026.
9. XBOW autonomous pentester #1 on HackerOne US leaderboard (xbow.com EGRESS_BLOCKED; techrepublic / gigazine / slashdot snippets, June–July 2025): **~1,060 vulnerabilities submitted**; Apr–Jun 2025 classified by program owners as **54 critical, 242 high, 524 medium, 65 low**. **No dollar figure for XBOW's bounties is disclosed in any snippet I saw.** XBOW raised $75M.
   → To close: https://xbow.com/blog/top-1-how-xbow-did-it and https://www.hackerone.com/blog/ai-hackbots-security-testing-update
10. Israeli Computers Law 5755-1995 (sherloc.unodc.org PDF EGRESS_BLOCKED; law.co.il PDFs not fetched). Snippets: **Section 4** criminalises unlawful intrusion into computer material; penalty **3 years imprisonment**; distributing/installing access codes to facilitate prohibited acts also 3 years, **5 years** where software designed for prohibited activity was used. Israeli State Attorney issued prosecution/sentencing guidelines in Aug 2018. **No security-researcher exemption surfaced.**
    → To close: https://www.law.co.il/en/news/2018/08/27/state-attorney-guidelines-unlawful-penetration-computers/ and the statute PDF.

### NOT EVIDENCE
Anything about Israeli tax treatment of bounty income, HackerOne's Israeli researcher count, or whether HackerOne's tax form for an Israeli individual is a W-8BEN — I did not source any of it and I am not asserting it.

## Reasoning that matters

**Payability to Israel = YES, at medium confidence.** Israel appears on no sanctions list quoted by HackerOne; all three platforms pay by ordinary bank transfer and PayPal, and Intigriti additionally supports Payoneer (an Israel-founded company) and an invoice+wire route. The residual risk is not sanctions but the **tax form + identity step**, which is a one-time human action.

**Realistic earnings for automated analysis — the honest picture.** Three numbers bound it:
- Average bounty payout **$1,090** — but that is the average over *valid, rewarded* reports on the whole platform, dominated by mature hunters on well-picked programs.
- Hackbot validity rate **49%**, and hackbots find "surface-level flaws like reflected XSS, much like traditional scanners" (HackerOne's own words). Surface-level XSS on mature public programs is exactly what has already been picked over; it is also what gets closed as duplicate/informative.
- The whole platform paid **$81M in 12 months**, and the top 100 researchers took **$31.8M** of the all-time total. The distribution is brutally concentrated.
An unbranded new entrant running an automated pipeline against public programs in month 1 should expect **zero**. A pipeline that is genuinely good may land a few mediums over a quarter. That is why my honest ceiling is low four-figure ILS/month, not five.

**The thing that makes this criterion structurally bad for this colony**, beyond the money: bug bounty income is *lumpy, unpredictable, and unbillable*. MISSION targets a repeatable 20,000 ILS/month recorded in a ledger. Bounties cannot be forecast, cannot be subscribed to, and cannot be scaled by spending more compute in a predictable way. Even at its best it is a lottery ticket with a positive expected value, not a revenue line.

**And the constitutional problem.** The one automation that scales cheaply — generate plausible vulnerability reports with an LLM and fire them at programs — is precisely what curl documented 49 times, what got an instant-ban policy written, and what killed a real bug bounty programme. It deceives the buyer (the programme's triage team) about the existence of a finding. It is a direct violation of "honest value only" and it is RED. Any build here must verify exploitability with a real, reproducible PoC before a report is ever filed, and must throttle itself hard.

## Owner blockers (one-time, human, unavoidable)
- Create the researcher account and accept platform terms in person (each platform).
- Complete the platform tax form (HackerOne states a tax form is mandatory before payment; snippet-level evidence).
- Identity verification for the payout rail (bank account / PayPal / Payoneer in the owner's name).
- Possibly: Israeli tax registration if bounty income becomes recurring business income. NOT verified; flagged, not asserted.

## Dead ends
- VDP (vulnerability disclosure programme) participation — no bounty by definition, pure cost. Not a revenue line.
- Payoneer via Bugcrowd — historically announced, absent from current docs. Do not plan on it.
- Unauthorized / out-of-scope testing of any Israeli or foreign target — RED, criminal under Computers Law 5755-1995 s.4 (3 years), and outside every safe-harbor clause. Not a candidate under any framing.
- LLM-generated speculative reports — RED (curl instant-ban policy; deceives the buyer).
- Selling a "bug bounty automation SaaS" to other hunters — outside this criterion, and the buyer is unproven; handing to another scout would be the right move.
