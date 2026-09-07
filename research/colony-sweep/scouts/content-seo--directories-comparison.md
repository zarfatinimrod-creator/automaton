# Scout notes — content-seo / directories-comparison
**Criterion:** Directory and comparison sites: affiliate economics, build cost, maintenance burden, and evidence of ones that actually earn.
**Scout:** WORKER-SCOUT "directories-comparison", content-seo group. Date: 2026-09-06.
**Search budget used: 8 of 8 (the cap).** GitHub/raw.githubusercontent fetches used where free.

## Evidence grades used
- **rendered** — I fetched the page and read it.
- **snippet** — a WebSearch result summary quoting a page I could NOT open. Weaker; the URL to open is named.
- Nothing here rests on memory.

---

## 1. Sources actually opened (rendered, zero search budget)

| URL | What it gave |
|---|---|
| https://raw.githubusercontent.com/piotrkulpinski/openalternative/main/README.md | OpenAlternative is a curated directory of open-source alternatives, 200+ entries in the repo list. **Monetisation is explicit and on-page: nine named sponsors (Sevalla, InfluxDB, Sent, c15t, ScreenshotOne, Openlane, Docmost, Capture, CodeRabbit) and a "Become a sponsor →" CTA to openalternative.co/advertise.** The README also points at **Dirstarter**, the same author's paid "starter kit for building profitable directory websites". No revenue numbers in the README. |
| https://raw.githubusercontent.com/thedaviddias/llms-txt-hub/main/README.md + repo metadata via GitHub search | An open-source directory (llms.txt Hub): Next.js + Supabase per repo topics, 902★, **688 forks, 227 open issues**, 400+ listed entries, submissions handled through a Git/PR workflow (`<!-- LLMS-LIST:START -->` machine-managed block). **No monetisation.** This is the cleanest free evidence of both build shape (a static-ish Next.js catalogue) and maintenance burden (227 open issues, forks as the submission queue). |
| https://github.com/thedaviddias/llms-txt-hub (repo record) | Directory topics: `directory, nextjs, supabase`. Created 2025-02-20, updated 2026-09-03 — still maintained. |

**Blocked (do not retry):** `dirstarter.com` returned `EGRESS_BLOCKED`. The two most valuable pages in this criterion —
- https://dirstarter.com/blog/how-much-do-directory-websites-make
- https://dirstarter.com/blog/openalternative-case-study
- https://openalternative.co/advertise
- https://www.directorygems.com/case-study/how-directory-sites-survive-ai-era
must be opened by a human or an unblocked agent to close the numbers below.

## 2. Searches run (8)
1. `directory website revenue MRR sponsorship listings indie hacker 2025 2026 "directory" earnings report`
2. `Impact.com PartnerStack affiliate payout supported countries Israel payment`
3. `Google search spam policy scaled content abuse AI generated directory sites deindexed 2025 2026`
4. `Amazon Associates Israel eligibility affiliate payment international payout methods`
5. `OpenAlternative advertise pricing featured listing cost per month directory sponsorship rates`
6. `אתר השוואת מחירים ביטוח רישיון סוכן ביטוח רשות שוק ההון אתר השוואה חוק`
7. `Google AdSense Ezoic Mediavine publisher payment Israel supported countries wire transfer minimum threshold`
8. `directory websites saturated 2026 "directory" no traffic failed most directories make nothing honest data`

## 3. The numbers, with their grade

**Directories that demonstrably earn (snippet, 2026-09-06):**
- **OpenAlternative** — $57,361 gross in 2025, +516% year on year, crossing **~$6k MRR by December**; revenue mix featured listings + sponsorships + ads. Featured listing priced at **$197/month**; roughly 35% of revenue from featured listings, ~65% from ads/sponsorships. Claimed reach ~750k monthly pageviews, ~10k listed projects, ~5.8k newsletter subscribers. Sources quoting these: https://dirstarter.com/blog/openalternative-case-study , https://dixcover.org/openalternative-co-making-6000-monthly-running-a-directory-website/ , https://openalternative.co/advertise (all snippet only — every one blocked or unfetched).
- **TrustMRR** — "built in 24 hours, launched within 48 hours to $13,883 MRR", paid listings. Source: https://www.directorygems.com/case-study/trustmrr-com (snippet). Treat this number as **unverified marketing**: it is a single self-reported figure on a vendor's case-study page, and 24-hour-to-$13.8k is exactly the shape of a claim that inflates.
- **RankInPublic** — "$1k MRR from the subscription, but the majority of revenue comes from the directory submission service" (snippet, same search).

**The counter-evidence, which matters more (snippet, 2026-09-06):**
- An April 2026 audit of **11 directory sites: only one is still growing organically; two-thirds lost between 21% and 98% of US organic traffic over 24 months.** Source to open: https://www.directorygems.com/case-study/how-directory-sites-survive-ai-era
- The survivors share three traits: **human editorial review, structured data with verifiable claims, and an audience that arrives independently of search.**
- "Most directory submission is dead, and some of it can quietly hurt you… submitting your site to 500 generic directories does nothing good now." (snippet; https://ustechautomations.com/resources/blog/seo-for-online-directories-2026 , https://directoryeasy.com/blog/top-10-directory-submission-sites-that-actually-drive-traffic-in-2026)

**Google policy (snippet + one authoritative URL):**
- Scaled content abuse = many pages generated primarily to manipulate rankings, "no matter how it's created"; AI content is not penalised as such, only when it is scaled content abuse. Sites publishing hundreds/thousands of AI pages without editorial oversight reported 50-80% traffic drops after the 2025/2026 spam updates. Primary URL to open: https://developers.google.com/search/docs/essentials/spam-policies ; case studies: https://www.gsqi.com/marketing-blog/august-2026-google-spam-update-case-studies/
- **Consequence for us:** a directory that an agent bulk-generates is precisely the thing being deindexed. A directory whose *listings* are machine-collected but whose *evaluation* is real and verifiable is not. That distinction is the whole build.

**Payout rails (all snippet — each needs one page opened to close):**
- **PartnerStack**: direct deposit via AirWallex is available for bank accounts **in Israel**, among other supported countries. Open: https://support.partnerstack.com/hc/en-us/articles/360009377934-Configuring-payout-providers
- **impact.com**: "190+ countries, 135+ currencies", Israel not explicitly named. Open: https://help.impact.com/en/support/solutions/articles/48001233415-how-do-partners-get-paid-
- **Amazon Associates**: international bank transfer is limited to associates with a bank account in **the US (USD), UK (GBP/EUR) or the Eurozone (EUR)**. An Israeli associate with an Israeli bank account is therefore left with **paper cheque or Amazon gift card**. Open: https://affiliate-program.amazon.com/help/node/topic/G8VUMS6GTBCR9RGV and https://affiliate-program.amazon.com/resource-center/receive-your-international-affiliate-earnings-in-your-local-bank/
- **Ezoic**: $20 minimum, paid by international bank transfer via Wise using IBAN/local details — mechanically fine for an Israeli IBAN; country eligibility not confirmed. Open: https://support.ezoic.com/kb/article/ezoic-payments
- **AdSense** country restrictions page to open: https://support.google.com/adsense/answer/6167308
- **The rail we already own beats all of them:** selling a featured listing or a sponsorship is us invoicing a buyer, not us being paid by a network. `products/il-biz-tools` already bills through **Paddle** as merchant of record. A listings-and-sponsorship directory needs **no affiliate network at all**, which removes the payability gate entirely.

**Israel-specific comparison verticals — closed (snippet, Hebrew search 2026-09-06):**
- Insurance brokerage in Israel is licensed: a סוכן ביטוח must hold a licence from רשות שוק ההון under **חוק הפיקוח על שירותים פיננסיים (ביטוח), התשמ"א-1981**, after an internship and professional exams. Source: https://he.wikipedia.org/wiki/סוכן_ביטוח_(ישראל)
- The regulator itself already publishes the free comparison tool: **https://life.cma.gov.il/** (מחשבון ריסק), plus the ministry's compulsory-motor calculator. A private Hebrew insurance-comparison site therefore faces a licence gate *and* a free state-run incumbent.

## 4. Build cost and maintenance, from the rendered evidence
- Shape: a Next.js catalogue over a small DB (llms-txt-hub uses Supabase), category pages, per-entry pages, structured data, a submission form or PR flow, and a Stripe/Paddle checkout for the paid tier. ~25-35 hours for a competent agent build; no novel engineering.
- The cost is not the build, it is **the ongoing evaluation**: 227 open issues on a 400-entry open-source directory is the honest maintenance signal. Dead links, moved products, wrong pricing, and submissions to triage are perpetual. An agent can do all of it — which is exactly the mission's edge — but it must actually run, weekly, forever.
- **Cold-start is the real cost.** Every earning example above earns because it already has an audience; the $197 listing has a price because there are 750k pageviews behind it. A new no-brand directory sells nothing in month one and, per the 11-site audit, most never reach an audience at all.

## 5. Do-not-build, explicitly
- **Directory-submission-as-a-service** (submit a customer's product to 100+ directories for a fee). It is the model the 2026 evidence calls dead-and-sometimes-harmful, so selling it is selling something we have evidence does not work — a constitution violation, not merely a weak business.
- **Bulk programmatic/AI-generated directories** at scale without editorial evaluation. Squarely inside Google's scaled content abuse policy.
- **Israeli insurance / pension / credit comparison.** Licence gate plus a free regulator-run incumbent.
- **Amazon-Associates-monetised comparison content** from an Israeli entity, until the payout page above is opened: cheque/gift-card-only is not a revenue rail.

## 6. Dead ends
- No rendered primary source could be obtained for **any** directory revenue figure: dirstarter.com, directorygems.com, openalternative.co are all outside the fetchable set. Every number in section 3 is snippet-grade and must be re-verified.
- `sindresorhus/awesome` and the awesome-route are worthless for this criterion beyond enumerating *that* directories exist — docs/AWESOME_ROUTE.md already says content-seo is where the route is weakest, and that held.
- GitHub repo search for directory boilerplates found essentially nothing at >100 stars except llms-txt-hub; the commercial directory starters (Dirstarter and peers) are paid and closed-source, so build cost cannot be lowered by forking one.
