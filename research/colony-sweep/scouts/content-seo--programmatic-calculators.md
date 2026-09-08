# Scout notes — content-seo / programmatic-calculators

**Criterion:** Calculator and tool sites as a business: real traffic and revenue evidence, how they
monetize, how long they take to rank, and the survivors versus the casualties of recent Google
updates.
**Scout:** WORKER-SCOUT "programmatic-calculators", group `content-seo`. Date: 2026-09-06.
**Search budget spent: 8 / 8 (the cap).** Six WebFetch attempts on primary sources were
EGRESS_BLOCKED. **Not one revenue number below comes from a page I rendered.** Everything money-
shaped here is a search snippet or a third-party estimate, and is marked as such.

---

## Blocked hosts confirmed this run

`www.google.com` (the Google-for-Publishers Omni Calculator case study — the single best primary
source for this criterion), `boringcashcow.com`, `developers.google.com` (spam policies),
`help.mediavine.com`, `help.raptive.com`, `www.convertcalculator.com`.
GitHub raw rendered fine. Do not re-try these; six turns are already spent on them.

---

## Evidence ledger

| # | Claim | Evidence kind | URL | Date seen |
|---|---|---|---|---|
| E1 | Omni Calculator: "calculators clock over 17 million visits per month", grown from ~20,000 monthly visits in 2016; 3,700+ calculators; bootstrapped, launched 2014 by Mateusz Mucha; "business model is primarily based on advertising revenue... using AdSense" | **snippet only** — Google's own publisher case study is EGRESS_BLOCKED | https://www.google.com/ads/publisher/stories/omni_calculator/ (blocked) ; https://www.omgkrk.com/omni_calculator_interview/ ; https://www.crunchbase.com/organization/omni-calculator | 2026-09-06 |
| E2 | Omni Calculator "estimated annual revenue of $4.2 million" | **snippet of an estimation service (Growjo), not a filing.** Treat as an order of magnitude, nothing more | https://growjo.com/company/Omni_Calculator | 2026-09-06 |
| E3 | A UK pay calculator (MyPayCalculator.co.uk) at ~150k visits/month, earning ~**$7,500/year** on ads (≈ $625/month) | **snippet, and the $7.5k is itself an AdSense-calculator estimate, not a payout statement** | https://www.goodreads.com/author_blog_posts/25154711-10-month-old-calculator-website-already-earning-7-5k-year (title rendered in results; page not fetched) | 2026-09-06 |
| E4 | RPM by niche 2026: entertainment/viral global $1–4; recipes/lifestyle $4–10; **finance, insurance, legal, B2B software $15–40+ with US traffic**; same finance site with Asian traffic $3–8 | snippet | https://www.monetizemore.com/blog/website-ad-revenue/ | 2026-09-06 |
| E5 | **Ezoic raised its minimum from 10,000 users/month to 250,000 users/month in February 2026 — a 25x increase** | snippet | https://ppc.land/is-your-site-finally-ready-the-new-math-behind-premium-ad-network-approvals/ ; https://monetizehelper.com/blog/ezoic-vs-mediavine-comparison | 2026-09-06 |
| E6 | Mediavine Official requires **at least $5,000 in annual ad earnings**; **Journey by Mediavine requires 1,000 sessions from Tier-1 countries (US/CA/UK/AU) in 30 days**; Mediavine pays Net-65 | snippet | https://www.mediavine.com/mediavine-requirements/ ; https://www.jupiter.co/blog/mediavine-requirements-2026-how-to-qualify ; https://thisweekinblogging.com/mediavine-raptive-requirements/ | 2026-09-06 |
| E7 | **Raptive lowered its minimum to 25,000 pageviews in October 2025** | snippet | https://thisweekinblogging.com/mediavine-raptive-requirements/ | 2026-09-06 |
| E8 | Non-US Raptive creators may take eCheck/local bank transfer, PayPal, paper check or wire; Mediavine "works with publishers around the world" and pays through Tipalti ("Licensed Money Transmitter in 196 countries") | snippet — **both help-centre pages EGRESS_BLOCKED**; no page names Israel either way | https://help.raptive.com/hc/en-us/articles/360013465192-Payment-Methods (blocked) ; https://help.mediavine.com/mediavine-international-publishers (blocked) | 2026-09-06 |
| E9 | Scaled content abuse = "many pages generated for the primary purpose of manipulating search rankings and not helping users"; **January 2025** algorithmic penalties; **August 2025** dedicated spam update strengthening SpamBrain against "thin, manipulative, and near-duplicate content sets"; site-reputation abuse and scaled content abuse both introduced March 2024; **February 2025** stricter parasite-SEO enforcement | snippet + a **rendered** third-party mirror that only paraphrases | https://raw.githubusercontent.com/AgriciDaniel/claude-blog/main/brain/references/canon/004-spam-policies.md (rendered, paraphrase, cites source last-updated 2026-05-15) ; https://patrickstox.com/programmatic-seo/risks/scaled-content-abuse/ ; https://www.digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated | 2026-09-06 |
| E10 | "Programmatic SEO is allowed when each generated page provides real, differentiated value... It violates the scaled content abuse policy only when the pages are thin and exist mainly to rank" | snippet | https://patrickstox.com/programmatic-seo/risks/scaled-content-abuse/ | 2026-09-06 |
| E11 | June 2025 core update announced 30 June, completed 17 July 2025, flagged by Similarweb/Semrush/Sistrix as one of the bigger recent updates; **September-2023 Helpful-Content casualties showed real but modest recovery after it**; December 2025 core update extended E-E-A-T expectations to how-to guides and comparisons | snippet | https://www.adpushup.com/blog/google-core-update/ ; https://www.dataslayer.ai/blog/google-core-update-december-2025-what-changed-and-how-to-fix-your-rankings | 2026-09-06 |
| E12 | Embedded-calculator SaaS market and its metering: **Outgrow from $14/mo (per-lead), involve.me from $19/mo (per-submission), ConvertCalculator ~$18/mo up to a $200/mo Platinum plan (per-calculation), Calconic limited free + paid** | snippet — vendor pricing page EGRESS_BLOCKED | https://www.involve.me/blog/best-calculator-builders ; https://outgrow.co/blog/best-calculator-builders-lead-generation-2026 ; https://www.convertcalculator.com/pricing/ (blocked) | 2026-09-06 |

### Evidence already in this repo, reused rather than re-searched (costs no budget)

- `research/colony-sweep/scouts/distribution--seo-2026.md` (2026-09-04): new domain indexed in
  days–weeks, long-tail 2–4 months, meaningful organic 4–8 months, head terms 12–24 months; only
  1.74% of newly published pages reach the top 10 within a year. **AI Overviews carry
  transactional/navigational queries only 13–19% of the time versus 36% informational and 64–71%
  how-to — i.e. "מחשבון X" survives while "what is X" does not.** This is the time-to-rank half of
  my criterion and it is already answered; I did not spend a search re-asking it.
- `research/colony-sweep/scouts/bounties-grants--creator-funds.md`: **AdSense → Israel is YES at
  medium confidence** (EFT, $100 minimum, Payoneer publishes an Israeli-facing AdSense route); the
  AdSense supported-country list itself was never rendered. URL to close it:
  https://support.google.com/adsense/answer/9905
- `docs/REJECTED.md`: ad-monetised storefront portfolios / made-for-advertising already **rejected**
  ("AdSense forbids pages with more advertising than content... There is no honest demand side").
  It also records that the Israeli state publishes free calculators (PCN874 simulator, work-grant
  checker, personal-import calculator, Bituach Leumi simulators) — **our free competitor, and
  charging for an answer the state gives free is a constitution violation, not a pricing decision.**

---

## What the evidence actually supports

1. **The genre is real and it is enormous at the top.** Omni Calculator is a 17M-visits/month,
   3,700-calculator, ad-funded, bootstrapped business (E1). That is the existence proof. It is also
   twelve years old and employs a team, which is the part the ceiling has to respect.
2. **The unit economics at our scale are brutal, and one number carries it.** ~150k visits/month →
   ~$625/month (E3). That is roughly **₪4 per 1,000 monthly visits per month** for a UK-traffic pay
   calculator. A new Hebrew tool site that reaches 3,000–20,000 monthly visits in year one (the
   sibling scout's own curve) is therefore a **₪30–₪300/month** asset, before any Israeli-RPM
   haircut. Display advertising on our own calculators cannot reach ₪20,000/month. It is not a line;
   it is at best a rounding error on top of one.
3. **The ad-network ladder closed in 2026.** Ezoic went from 10k to 250k users/month in February
   2026 (E5); Mediavine Official wants $5,000/year of existing ad earnings (E6); Raptive wants 25k
   pageviews (E7). The only low bar left is Journey by Mediavine at 1,000 **Tier-1** sessions in 30
   days (E6) — and Tier-1 means US/CA/UK/AU, which is precisely the traffic a Hebrew Israeli
   calculator does not have. **A Hebrew tool site is structurally stuck on bare AdSense.**
4. **Geography and niche dominate everything else.** $15–40 RPM finance/insurance/legal with US
   traffic versus $1–4 entertainment, and $3–8 for the same finance content with non-Tier-1 traffic
   (E4). An English-language finance calculator is worth roughly 5–10x per visit versus the Hebrew
   equivalent. If ads are ever the model, the language choice is the business decision, not the
   calculator choice.
5. **The obvious agent move is the prohibited one.** "Generate 5,000 calculator permutations" is
   textbook scaled content abuse: policy since March 2024, algorithmic penalties from January 2025,
   a dedicated SpamBrain spam update in August 2025 aimed at "thin, near-duplicate content sets"
   (E9). Programmatic generation is only defensible where **each page is a genuinely different
   computation over real data** (E10). Our advantage — an agent that can ship 500 pages in an hour —
   is the exact capability the policy exists to punish.
6. **Survivors versus casualties: I could not name a single calculator-site casualty or survivor.**
   The update coverage I could reach is generic (E11) and names no tool site. The honest statement
   is that the *class* argument (interactive pages resist AI-Overview summarisation) is well
   supported by the sibling scout, and the *instance* evidence is absent.
7. **The money in calculators is B2B lead-gen, not consumer traffic.** Four vendors sell calculators
   as a marketing instrument at $14–$200/month, metered per lead, per submission or per calculation
   (E12). The buyer who actually pays cash for a calculator is a **marketing team or agency that
   wants leads**, not a consumer who wants an answer. That is the only nameable buyer this criterion
   produced — and it is a crowded, distribution-gated market.

## Dead ends and what a human must open

- **No rendered primary revenue source exists for this criterion in this container.** Google's own
  Omni Calculator publisher story, boringcashcow, and every ad-network help centre are blocked.
  Someone must open https://www.google.com/ads/publisher/stories/omni_calculator/ ,
  https://help.mediavine.com/mediavine-international-publishers ,
  https://help.raptive.com/hc/en-us/articles/360013465192-Payment-Methods and
  https://support.ezoic.com/kb/article/ezoic-payments to settle Israel payability for the three
  premium networks. Until then it is **UNKNOWN — not NO**.
- **Flippa/Acquire produced no actual listing.** Two marketplaces were described; no calculator-site
  sale price, multiple or verified P&L was seen. Anyone wanting the exit multiple must log in to
  Flippa or Acquire and filter; search snippets cannot reach listing pages.
- **No named winner/loser of a Google update in this vertical.** The Sistrix/Similarweb
  winners-and-losers tables for the June 2025 and December 2025 core updates would settle it.
- **Time-to-rank was not re-searched.** `distribution--seo-2026.md` answers it and re-asking would
  have burned shared budget for a duplicate.
