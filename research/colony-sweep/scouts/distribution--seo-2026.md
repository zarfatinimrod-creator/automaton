# Scout notes — distribution / seo-2026

**Criterion:** SEO for small tool sites in 2026: what still ranks under AI Overviews, how long a new
domain takes, and the honest expected traffic curve.
**Scout:** WORKER-SCOUT "seo-2026", group `distribution`. Date: 2026-09-04.
**Search budget spent: 8 / 8 (the cap).** Two WebFetch attempts on primary sources were
EGRESS_BLOCKED (`blog.google`, `ahrefs.com`). Everything below that is not marked "rendered" rests
on a **search snippet**, which is weaker evidence than a page I opened.

---

## Evidence ledger

| # | Claim | Evidence kind | URL | Date seen |
|---|---|---|---|---|
| E1 | Seer Interactive: organic CTR on AIO-present queries fell 61% (1.76% → 0.61%), paid fell 68% (19.7% → 6.34%); by Feb 2026 organic CTR recovered to 2.4% vs 3.8% on AIO-absent queries (~37% structural gap) | snippet quoting Seer | https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-2026-update | 2026-09-04 |
| E2 | Zero-click rate on AIO queries 80–83%; traditional result clicked 8% of the time with an AIO vs 15% without | snippet | https://www.omnibound.ai/blog/google-ai-overviews-statistics | 2026-09-04 |
| E3 | Ahrefs: "AI Overviews reduce clicks by 58%" (update post) | snippet only — **page EGRESS_BLOCKED, could not render** | https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/ | 2026-09-04 |
| E4 | New domain: indexed in days–weeks; long-tail rankings 2–4 months; meaningful organic traffic 4–8 months; head terms 12–24 months. "Only 1.74% of newly published pages reach top 10 within a year"; of those that do, most took ~61–182 days | snippet, several SEO agency blogs restating Ahrefs/Semrush datasets | https://factoryjet.com/blog/how-long-does-seo-take-2026-month-by-month-timeline , https://peaklora.com/blog/how-long-to-rank-in-google-search/ | 2026-09-04 |
| E5 | AIO coverage by query type: informational ~36%; health/medical 71%; how-to 64%; local services 58%; **transactional/product-purchase 13–19%**; navigational low | snippet | https://searchlab.nl/en/statistics/ai-overviews-sge-statistics-2026 , https://seoprofy.com/blog/google-ai-overviews/ | 2026-09-04 |
| E6 | "An AI Overview can summarise an article, but it can't do your calculation or convert your file for you" — tools/interactive pages resist zero-click summarisation | snippet, incl. Ahrefs' free-tools-SEO article | https://ahrefs.com/blog/the-free-tools-seo-strategy/ (blocked, snippet only) | 2026-09-04 |
| E7 | Brands cited inside an AIO get ~35% more organic clicks; cited pages ~120% more clicks per impression than uncited pages on the same SERP | snippet | https://wordsatscale.com/ai-overviews-ctr-statistics-2026/ | 2026-09-04 |
| E8 | ChatGPT referral share of all web referrals rose 0.23% (Apr 2026) → 0.32% (May 2026); after 7 May 2026 ~60% of ChatGPT referrals land on the brand **homepage** (was 26–32%) | snippet quoting Similarweb / SE Ranking | https://seranking.com/blog/chatgpt-referral-traffic-may-2026/ , https://www.similarweb.com/blog/marketing/geo/gen-ai-stats/ | 2026-09-04 |
| E9 | ChatGPT's share of gen-AI web traffic fell ~76% → ~53% YoY; Gemini >25% | snippet | https://www.similarweb.com/blog/insights/ai-news/ai-referral-traffic-winners/ | 2026-09-04 |
| E10 | Google spam policy "scaled content abuse": many pages made mainly to manipulate rankings, by AI **or** humans; March 2026 core update named it; sites with hundreds/thousands of unedited AI pages saw 50–80% drops and some got manual actions (full removal) | snippet + a **rendered** third-party mirror that cites `developers.google.com/search/docs/essentials/spam-policies` (updated 2026-05-15) and admits it paraphrases | https://raw.githubusercontent.com/AgriciDaniel/claude-blog/main/brain/references/canon/004-spam-policies.md (rendered) ; https://www.digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated | 2026-09-04 |
| E11 | AI Overviews available in 200+ countries and 40+ languages as of May 2025 | snippet of Google's own blog — **blog.google is EGRESS_BLOCKED, could not render; the language list was never seen** | https://blog.google/products-and-platforms/products/search/ai-overview-expansion-may-2025-update/ | 2026-09-04 |
| E12 | Israeli SEO agencies write about AIO in Hebrew SERPs as a present-tense fact; one claims "47% of Google users in Israel are satisfied with the AI Overview and don't click", another claims cited sites gained 15–30% traffic while uncited #1–3 lost up to 40% CTR | snippet of Israeli agency marketing blogs — **unverifiable, no methodology, treat as directional only** | https://www.hon.co.il/ (AI Overview article) , https://sgo.co.il/seo-israel-2026/ , https://aston.co.il/content/seo-2026-ai-era/ | 2026-09-04 |
| E13 | llms.txt: markdown file at site root; OpenAI, Anthropic and Google Gemini publish one for their own docs; Chrome Lighthouse audits for one; "thousands of sites publish" one. README does **not** claim any specific AI search engine ranks or retrieves by it | **rendered** | https://raw.githubusercontent.com/AnswerDotAI/llms-txt/main/nbs/index.qmd | 2026-09-04 |
| E14 | UW researchers estimated AIO exposure cut ~15% of daily traffic to tested English Wikipedia articles (2026) | snippet, via a Hebrew agency blog restating it | https://aston.co.il/content/seo-2026-ai-era/ | 2026-09-04 |

### Blocked hosts confirmed this run
`blog.google`, `ahrefs.com`. GitHub raw rendered fine. `developers.google.com` not attempted (assumed blocked; a human should open the spam-policy page directly).

---

## What the evidence actually supports

1. **Tool pages, not article pages.** Every source that distinguishes content types says the same
   thing: AIO eats the summarisable and leaves the interactive. A calculator, converter or
   generator cannot be answered away — the user must land to use it (E6). This is the single most
   load-bearing fact for this repo, because `products/il-biz-tools` is already exactly that shape.
2. **Query class beats content quality for survival.** Transactional and navigational queries carry
   AIO 13–19% of the time versus 36% informational and 64–71% how-to/health (E5). "מחשבון X",
   "טופס Y", brand/tool-name and do-this-now queries are the surviving class. Blog posts explaining
   Israeli VAT are the dying class.
3. **The ramp is 6–12 months and mostly flat for the first 3.** (E4). Nothing about AI changed this;
   it makes SEO structurally unable to be the acquisition channel for any line that must produce
   revenue this quarter. It is a compounding asset, not a launch channel.
4. **Citation is the new click, and it is worth ~1/3 more clicks, not a replacement.** Cited pages
   get 35–120% more clicks than uncited on the same SERP (E7) — but that is a multiplier on a base
   that fell 37–61% (E1). Being cited does not restore 2023 traffic.
5. **Assistant referrals are real and tiny.** 0.32% of all web referrals worldwide (E8). For a site
   with 3,000 monthly visits that is noise. Worse for us: 60% of ChatGPT referrals now land on the
   homepage, not the deep tool page, so the intent is diluted on arrival.
6. **Scale is the trap.** The obvious agent move — generate 5,000 programmatic pages — is exactly
   what the March 2026 core update targeted, with manual actions removing sites entirely (E10).
   Under MISSION's constitution this is not merely risky, it is the wrong side of the honest-value
   line. Programmatic pages are only defensible when each page is a genuinely different computation
   over real data.

## Honest traffic curve for a new small tool site (synthesis, not a measurement)

Months 0–2: indexed, near-zero. Months 2–4: first long-tail impressions, tens of clicks/month.
Months 4–8: hundreds/month if the tool genuinely answers a query nobody else serves. Months 8–12+:
low thousands/month is a good outcome for a niche Hebrew tool site; head terms are out of reach for
24 months. Apply a 37–61% haircut versus the pre-AIO version of the same curve on informational
queries, and roughly no haircut on the "give me the calculator" queries. **This curve is inference
from E1/E4/E5/E6 and is marked low confidence — no source gave a real month-by-month click log for
a specific small tool site, and I could not find one.**

## What a human or unblocked agent must open to close the gaps

- `https://developers.google.com/search/docs/essentials/spam-policies` — the actual scaled-content-abuse text (I only have a paraphrasing mirror).
- `https://blog.google/products-and-platforms/products/search/ai-overview-expansion-may-2025-update/` — to confirm whether **Hebrew** is in the 40+ language list.
- `https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/` and `https://ahrefs.com/blog/the-free-tools-seo-strategy/` — the two studies everyone else is quoting.
- Google Search Console for `il-biz-tools` itself — the only trustworthy source for our own curve, and it costs nothing.
