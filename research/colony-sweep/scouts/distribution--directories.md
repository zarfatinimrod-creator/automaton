# Scout notes — distribution / directories
**Criterion:** Tool and startup directories: which ones drive measurable traffic in 2026, submission rules, and whether automated submission is permitted.
**Scout:** WORKER-SCOUT "directories", group `distribution`. Date: 2026-09-04.
**Search budget spent: 6 of 8 allowed.** No searches were refused.

---

## Evidence grading used here
- **A (rendered primary):** the platform's own file, rendered by me from github.com / raw.githubusercontent.com.
- **B (rendered secondary):** a third-party developer's research note, rendered by me. Real text, but it is someone else's claim about a platform, and several such repos are visibly LLM-authored — endpoints in them may not exist.
- **C (search snippet):** a snippet quoting a page I could not open. Weakest. Marked as such per claim.
- Memory is not evidence and is not used.

The egress proxy blocked every attempt at platform domains in previous waves (producthunt.com, g2.com, news.ycombinator.com etc. return EGRESS_BLOCKED), so **no directory's own terms page was opened directly**. Every ToS claim below is A only where the platform checks its terms into GitHub — which, in this criterion, is true for exactly one platform: the MCP Registry.

---

## 1. The enumeration (free, zero search budget)

- `mmccaff/PlacesToPostYourStartup` — rendered 2026-09-04:
  https://raw.githubusercontent.com/mmccaff/PlacesToPostYourStartup/master/README.md
  Splits cleanly into **community posting** (19 subreddits — closed to us by `docs/REJECTED.md` constraint 3) and **submission-based directories** (~48: Product Hunt, AngelList, Capterra, G2 Crowd, CrozDesk, Crunchbase, F6S, Indie Hackers, SaaSHub, Launching Next, LaunchIgniter, Startup Ranking, Startup Stash, StartupBlink, AlternativeTo, Postmake, Show HN, Ycombinator, …). **Directory only — proves the venues exist, proves nothing about traffic.** The list is visibly aged (Netted, SnapMunk, Vator, Tech Pluto are 2015-era).
- `truvery/ai-tool-directories` — rendered 2026-09-04:
  https://github.com/truvery/ai-tool-directories , README at
  https://raw.githubusercontent.com/truvery/ai-tool-directories/main/README.md
  "189 live AI tool directories … Every link was checked in July 2026 - we started from 213 candidates and removed 25 dead ones." **0 stars, created 2026-07-03.** Records only name + URL — **no traffic, no DR, no submission method, no pricing**. Its own advice: prepare a kit (512px logo, 60-char tagline, 150-word description, 3 screenshots). Treat as a link list from an interested party, grade C/directory-only.
- `sindresorhus/awesome` route per `docs/AWESOME_ROUTE.md` — used, see finding 4.

## 2. Product Hunt

**Traffic (grade C, search 2026-09-04).** Search returned consistent tiering across several 2026 guides: top-3 of the day ≈ **5,000–15,000 visitors on launch day**, top-10 ≈ **1,000–3,000**, outside top-10 **under 500**, most of it in the first six hours; signups 100–400 / 30–100 / <20 respectively. One 2026 vendor page claims a successful launch drives "5k–50k visitors in 24 hours". **None of these were opened; all are marketing pages by launch-service vendors and must be treated as vendor-favourable.**
URLs a human/unblocked agent must open to close this:
- https://hub.causo.ai/guides/product-hunt-traffic-data-2026
- https://www.shno.co/marketing-statistics/product-hunt-launch-statistics
- https://www.foundrlist.com/blogs/complete-startup-directory-list-2026

**Automated submission — the load-bearing claim (grade B, rendered).**
- `ever-just/agentskills`, `skills/product-hunt-launch/SKILL.md` (via GitHub code search, 2026-09-04): "**No launch mutation.** … The mutation type is limited to following users (`userFollow` / `userFollowUndo`) and goal management … there is **no** post/launch-creation mutation (`createPost` / `PostSubmissionCreate` were removed). Do not burn time hunting one; **the launch is submitted by hand.**" and "**The launch is manual.** Someone (a browser agent on the user's session, or the user) creates the product and schedules the date on producthunt.com." Also: "PH's API terms restrict commercial use without approval, but the standard … embed badge is provided by PH and is fine to use."
- `shashidharbabu/launchkit`, `launchkit-src/docs/platform-integrations-research.md` (dated 2026-08-27), rendered: PH "**write scope is not self-serve**: apps are read-only … write access is granted case-by-case by emailing hello@producthunt.com … Historically granted for comments/goals-style integrations, **not third-party launch schedulers**. There is no supported way to configure the full launch experience (gallery, makers, first comment, launch date scheduling) via API."
- `cx18121/sparrow` and `Gabrielle-Lyu/ai-daily-briefing` both quote PH terms: the API "**must not be used for commercial purposes**" without prior approval.
- `api-evangelist/producthunt` README: "**Write Access** - Approval required from Product Hunt team"; "**Commercial** - Contact hello@producthunt.com for licensing terms".

Two independent repos agreeing that the launch mutation is gone is strong for a B-grade claim, but the primary URL to close it is https://api.producthunt.com/v2/docs and https://www.producthunt.com/terms-of-service (both unreachable here).

**Verdict for our mission:** PH is the highest-traffic venue in the criterion and is **not automatable**. A launch needs a human-owned account, a hand-built listing, a maker profile and a "first comment" — i.e. exactly the thing MISSION.md says the owner does not do. Running a browser agent on the owner's PH session to impersonate maker activity is at best AMBER against PH's terms and against our own constitution (it is a person's account being operated to look human). **AMBER — not a build.**

## 3. G2 / Capterra (Gartner Digital Markets) — the AI-citation channel

**Why it matters in 2026 (grade C, search 2026-09-04).** The measurable 2026 shift is not clicks, it is **LLM citations**. Snippets: SE Ranking's 129K-domain study — domains listed on multiple review platforms (G2, Capterra, Trustpilot, Sitejabber, Yelp) earned **4.6–6.3 citations on average vs 1.8 for absent domains**; one study of ChatGPT answers found "100% of the tools mentioned had reviews on Capterra, 99% had reviews on G2"; "directory sites captured 17% of branded query citations".
Close these at: https://seranking.com/blog/review-platforms-in-ai-overviews/ , https://www.quoleady.com/llmo-research/ , https://contently.com/2026/04/29/top-sources-llms-cite/ , https://www.getpassionfruit.com/blog/how-llms-search-for-citations-what-they-look-for-and-what-they-actually-find

**Submission (grade B, and I distrust it).** `tarkaai/gtm-skills`, `fundamentals/directories/directory-listing-api.md`, rendered 2026-09-04, lists submission endpoints: `POST https://seller.g2.com/api/v1/products`, `POST https://api.gartnerdigitalmarkets.com/v1/products`, `POST https://api.trustradius.com/v1/products`, `PUT https://sourceforge.net/rest/p/{project_slug}`; "New listings and major updates go through editorial review (24-72 hours)"; "Capterra PPC … Minimum $500/month spend; floor CPC $2.00."
**Caution, recorded deliberately:** this repo is an LLM-authored "skills" pack with no source URLs and no dates, and I could not verify that any of those endpoints exists. G2 and Gartner Digital Markets sell vendor profiles through sales-gated portals in every account I have seen described. **Do not act on those endpoints without opening the vendors' own docs.** Grade B, low confidence.

**Verdict:** the citation effect is the most decision-relevant fact in this whole criterion, and it is a reason to get our products profiled — but claiming a vendor profile is an identity-verified, human, sales-touched process, and reviews cannot be solicited dishonestly (constitution). **AMBER**, and the real blocker is that G2/Capterra profiles need customers who write reviews, which we do not have.

## 4. GitHub curated lists (awesome-*) as directories

**Rendered primary, grade A:** https://raw.githubusercontent.com/sindresorhus/awesome/main/pull_request_template.md (2026-09-04) —
- "**fully AI-generated pull requests**" are prohibited;
- the list must have "**been around for at least 30 days**";
- items must not be "unmaintained, … archived repo, deprecated, or missing docs";
- the submitter must "**review at least 4 other open pull requests**" with substantive feedback — "Just commenting 'looks good' … does not count!".

That template governs adding *a list* to the index; each individual awesome list has its own contributing rules, which I did not enumerate. But the flagship's explicit ban on AI-generated PRs is exactly our shape. **An agent colony submitting itself to awesome lists is a terms violation of the biggest one and a norm violation of most: AMBER→RED. Not a build.** (Reading them as a research source, which is what `docs/AWESOME_ROUTE.md` does, is unaffected and stays GREEN.)

## 5. MCP Registry — the one machine-native, terms-clean directory found

**Rendered primary, grade A:**
- https://raw.githubusercontent.com/modelcontextprotocol/registry/main/README.md (2026-09-04): publishing via a CLI (`mcp-publisher`), via the **API directly**, and via **GitHub Actions with GitHub OIDC** — i.e. an unattended pipeline is the documented path, not a workaround. Namespace ownership must be proven: "to publish `io.github.domdomegg/my-cool-mcp` you must login to GitHub as `domdomegg`", or DNS/HTTP proof for a domain namespace. API freeze v0.1 (Oct 2025), still preview.
- `docs/modelcontextprotocol-io/about.mdx` (via MCP `search_code`, 2026-09-04): "The MCP Registry uses multiple mechanisms to prevent spam: **Namespace authentication requirements** … **Character limits and validation** … **Manual takedown**".
- https://raw.githubusercontent.com/modelcontextprotocol/registry/main/docs/modelcontextprotocol-io/moderation-policy.mdx: removes illegal content, malware "regardless of intentions", and non-functioning servers. Spam is defined as "**the same server being submitted multiple times under different names**", servers that "provide a fixed response with some marketing copy", and "a description stuffed with marketing copy and an unrelated implementation". Explicitly **not** removed: low-quality, duplicative, or security-flawed servers.

**Verdict: GREEN.** One real MCP server, honestly described, published once under our own GitHub namespace, by CI, with no human in the loop beyond the owner's existing GitHub account. The only directory in this criterion where "automated submission is permitted" is answered by the platform's own documentation rather than by inference. **Traffic is unknown** — the registry is preview-stage and publishes no traffic numbers; nothing here justifies a traffic claim.

## 6. Other submission surfaces (grade B, `shashidharbabu/launchkit`, dated 2026-08-27, rendered)
- **Hacker News / Show HN:** "The official HN API … is strictly read-only — stories, comments, users, no auth, no write endpoints." Only a deep link `news.ycombinator.com/submitlink?u=…&t=…`. Not automatable; a human account posts. AMBER for us.
- **Reddit:** OAuth `submit` scope exists, free tier 100 queries/minute — but the same doc: "automated self-promotional posting is exactly what moderators ban". Closed by `REJECTED.md` constraint 3 anyway. RED.
- **dev.to (Forem):** `POST https://dev.to/api/articles`, free, 30 req/30s, per-user API key. Automatable — a publishing channel, not a directory.
- **Hashnode:** GraphQL `publishPost`; "since May 13, 2026 the GraphQL API is Pro-plan-only."
- **Medium:** "no new API integration tokens are issued and no new integrations are allowed." Closed.
- **X:** `POST /2/tweets`, ~$0.20/post with a URL under the Feb 6 2026 pay-per-use model. **LinkedIn:** self-serve `w_member_social`, free.

## 7. Directory-submission-as-a-service, considered as a product we sell — rejected

Market is real and crowded (grade C, search 2026-09-04): named live vendors with public prices — StartupSubmit (220+ directories), SubmitWell (200+), Submitator (100+), launchdirectories.com, listmy.site, SubmitSaaS, smollaunch's comparison of "9 SaaS directory submission services". Prices seen in snippets: **$100 / 100 directories (48h)**, **$99 for 60**, **from $99 (5–7 days)**, **$349 for 100+ free plus selected paid**, and per-live-listing tiers "$3.30 down to $1.99 per live listing".
Snippets also state the delivery reality: "automation with a human review pass rather than hand submission"; services "using bots and auto-submission fill forms with generic copy, get flagged by directory moderators, and often produce listings that are never approved"; "automated bulk submission using bots that blast URLs to thousands of low-quality directories … Google penalizes this immediately".
Close at: https://smollaunch.com/best-of/directory-submission-services-compared-2026 , https://autosaaslaunch.com/blog/best-automated-directory-submission-tools-2026 , https://startupsubmit.app/

**Verdict: do not build.** The honest version of this product requires humans filling forms (the owner cannot supply them, and hiring is manual ops); the automated version is bot-submitting boilerplate into moderated forms — link spam under our constitution and under Google's guidelines. One-off $99–$349 against a dozen incumbents also gives a bad ceiling. AMBER at best, RED as usually delivered.

## 8. Israeli / Hebrew directories — essentially empty (grade C)
One Hebrew search (2026-09-04) surfaced only legacy web indexes: https://www1.co.il/ ("אינדקס עסקים ישראל") and https://dir.2net.co.il/Internet/Index/Business_Index/ . No traffic data, no submission rules visible, both are 2000s-era link indexes and likely paid listings. **No modern Israeli/Hebrew tool-directory ecosystem was found.** For `products/il-biz-tools` the discovery channel is therefore Google/AI-answer organic, not a Hebrew directory. Low confidence; needs an unblocked agent.

## Dead ends
- No directory in this criterion **pays** anyone. The payability-to-Israel gate is mostly not applicable: money, if any, arrives downstream through our own checkout. Where money moves in this criterion it moves *out* (Capterra PPC, paid listings, submission services).
- No directory's own terms page could be rendered. The single exception — the MCP Registry — is the only place where "automated submission permitted" rests on grade-A evidence.
- The two big enumerations (`PlacesToPostYourStartup`, `ai-tool-directories`) contain **zero traffic data between them**. Nobody publishes per-directory referral numbers; every number in circulation comes from vendors selling launches or submissions.
- Long-tail AI-tool directories (the 189) are unverifiable and, by every snippet found, near-zero traffic. Not worth an hour.
