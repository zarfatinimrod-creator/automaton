# Scout notes — `distribution / launch-platforms`

**Criterion:** Product Hunt, Hacker News, Indie Hackers, Reddit — the actual rules on self-promotion
and automation, what a launch delivers in traffic, and what gets an account banned.

**Date:** 2026-09-04. **Searches spent:** 5 of the 8 allowed. **Blocked hosts confirmed by design:**
news.ycombinator.com, producthunt.com, help.producthunt.com, support.reddithelp.com, redditinc.com,
indiehackers.com — none of these were opened; everything below is either a GitHub-rendered mirror or
a search snippet, and each claim says which.

## Evidence grades used

- **A — rendered mirror of the platform's own text.** A verbatim clause of the platform's guidelines
  reproduced inside a public GitHub repo that I fetched. Strong, but the *date* of the snapshot is
  the repo's, not the platform's.
- **B — third-party repo quoting the platform, with the source URL and an access date.** Someone
  else read the live page; I read their quotation. Good enough to act on, not good enough to quote
  as if we had read it.
- **C — search snippet from a marketing blog.** Weak. Almost every traffic number in this criterion
  is grade C, and most of the sites publishing them sell launch services.

---

## 1. Hacker News

**Sources fetched (all GitHub, zero search budget):**

- `https://raw.githubusercontent.com/HackerNews/API/master/README.md` — the **official HN API**.
  Read-only: "The v0 API is essentially a dump of our in-memory data structures", endpoints
  `/v0/topstories`, `/v0/newstories`, `/v0/updates`, "There is currently no rate limit". **No write
  endpoint of any kind — no submit, no comment, no vote.** Grade A.
- HN Guidelines, verbatim mirror in the ToS-corpus repo
  `https://api.github.com/repositories/608380017/contents/corpus/text/Hacker News_Hacker News Guidelines.txt`
  (repo `sonu-gupta/tosdr-terms-of-service-corpus`), and again in `tosdr/tosdr-snapshots`
  (`Hacker news/Community Guidelines.html`), and again in `shawwn/sharc/static/newsguidelines.html`.
  Grade A:
  > "Please don't use HN primarily for promotion. It's ok to post your own stuff part of the time,
  > but the primary use of the site should be for curiosity."
  > "Don't solicit upvotes, comments, or submissions. Users should vote and comment when they run
  > across something they personally find interesting—not for promotion."
  > "Throwaway accounts are ok for sensitive information, but please don't create accounts routinely."
- **The clause that decides this criterion**, quoted from `news.ycombinator.com/newsguidelines.html#generated`
  in six independent repos, one of them with a Wayback capture
  (`xinbenlv/zThink`, `_posts/2026-08-10-...md`, fetched 2026-08-20,
  `https://web.archive.org/web/20260815185918/https://news.ycombinator.com/newsguidelines.html`).
  Grade A/B:
  > **"Don't post generated text or AI-edited text. HN is for conversation between humans."**

  `Draek2077/otto-code` (`projects/outreach/outreach.md`) adds the reading that matters to us:
  "note **AI-_edited_**: running your own draft through a model for polish is inside the prohibition."
- Show HN eligibility, `ulpi-io/skills/launch-hacker-news/references/show-hn-rules.md` (grade B,
  quoting `showhn.html`): "Show HN is for something you've made that other people can play with";
  off topic: "blog posts, sign-up pages, newsletters, lists, and other reading material… can't be
  tried out". Reposting allowed only if a story got no attention within ~12 months.
- Ban mechanic, quoted from an HN moderator email in `8ta4/blog` (grade B):
  > "Your account's not banned, but HN's software is killing your posts because it thinks you're
  > running afoul of the rule against using the site primarily for promotion… Our software detects
  > that sort of submission history and starts filtering the posts once the percentage of own-posts
  > is too high."
  This is the shadow-filter: no ban notice, posts simply never surface.

**Traffic (grade C, search 2026-09-04, query: `"Show HN" front page traffic numbers…`):**
a #1 post "can drive 10,000+ developer visits in a day"; front-page life ~24h; Show HN volume
"nearly tripled since 2019 (28,000 posts in 2025)". The same search returned the honest caveat,
which is the finding: *"Nobody credible publishes specific traffic numbers, and the commonly cited
'5,000–30,000 uniques in 24 hours' couldn't be traced to a primary source."*
Sources seen: `https://danfking.github.io/blog/2026/04/23/show-hn-by-the-numbers/`,
`https://asof.app/research/show-hn-survival` (605 Show HN posts, 63 days; 99% gone within a week),
`https://www.flowjam.com/blog/how-to-get-on-the-front-page-of-hacker-news-in-2025-...`.

**Verdict for us: closed, and closed on the platform's own words rather than on taste.**
No write API + no automated submission + no generated *or AI-edited* text + the maker must answer in
the thread himself. There is no version of a Show HN that an agent colony can run honestly. A human
launch is possible, but it is not a one-time KYC step — it is a day of live conversation plus an
account with non-promotional history behind it, i.e. exactly the ongoing human labour MISSION.md
forbids.

## 2. Product Hunt

**Source fetched:** `https://raw.githubusercontent.com/resolvicomai/kassinao/main/docs/product-hunt-requirements-2026.md`
(grade B — a third-party 2026 compilation that cites and quotes PH's own help articles; the help
URLs are listed below for a human to close).

- Eligibility: "The launch must be submitted from a **personal account**, not a company or branded
  account." "The account must be **at least one week old**." Profile needs a real name, personal
  photo, bio, non-corporate username. "A separate hunter is not required; Product Hunt recommends
  that makers submit their own product."
- Prohibited: "Asking people directly to upvote"; "Mass messaging by email, DM, or social platforms
  asking for votes"; "Incentives, discounts, freebies, contests, or giveaways tied to an upvote";
  "Coordinated voting campaigns, voting rings, fake accounts, **bots**, or other artificial activity."
- Allowed: sharing the launch link organically; inviting people to try it and leave feedback.
- Enforcement: PH "can remove invalid votes, reduce ranking, unfeature or remove a launch, restrict
  accounts, or suspend access", monitoring "unusual patterns automatically" plus community reports
  and manual review.
- Ranking: "One upvote does not necessarily equal one ranking point; authenticity and broader
  community engagement affect points."
- Forum rules (`vizuh/click-trail-handler`, grade B): PH's forum guidelines discourage
  "promotion-first posts, repeated self-promotion, link drops, and low-effort engagement"; community
  guidelines "prohibit self-promotional comments, mass messaging, asking for upvotes, incentives,
  bots, and fake accounts. Use … real personal profile, not a brand persona."

URLs a human or unblocked agent must open to raise this to grade A:
`https://help.producthunt.com/en/articles/3615694-community-guidelines`,
`https://help.producthunt.com/en/articles/484935-can-i-ask-my-community-friends-family-to-upvote-a-product`,
`https://help.producthunt.com/en/articles/11869098-how-does-product-hunt-ensure-fair-voting-and-prevent-spam-or-vote-manipulation`,
`https://help.producthunt.com/en/articles/484938-how-is-the-homepage-ranked`,
`https://help.producthunt.com/en/articles/771527-personal-account-vs-company-account`,
`https://help.producthunt.com/en/articles/10478791-product-hunt-forum-guidelines`.

**Traffic (grade C, search 2026-09-04):** #1 Product of the Day reported at 3,000–8,000 visitors
(one source), 5,000–15,000 for the top three (another), 200–800 signups in week one, "5–20 paying
customers in the first week", 800–1,500 upvotes to take #1. Every one of these numbers comes from a
site selling launch help — `https://www.shno.co/marketing-statistics/product-hunt-launch-statistics`,
`https://hub.causo.ai/guides/product-hunt-traffic-data-2026`,
`https://getlaunchlist.com/blog/how-to-launch-on-product-hunt-2026`,
`https://trendgap.io/blog/product-hunt-launch-upvotes-rank-2026`. Treat the whole range as
unverified. The most useful sentence in the search result is the distribution warning: results
"vary significantly", and most launches are nowhere near #1.

**Verdict for us: not buildable.** A personal, photographed, week-old human profile that answers
comments all day is a person, and "bots" are named in the prohibited list. One honest launch by the
owner is *permitted by PH* but is human marketing labour, not a KYC exception.

## 3. Reddit

**Source fetched:** `https://raw.githubusercontent.com/TickTockBent/virgil/main/docs/internal/virgil-research.md`
(grade B, quotes Reddit's own policy pages with URLs), corroborated by
`cgallic/kai-cmo-harness/harness/references/reddit-organic-posting-rules.md` and
`Draek2077/otto-code` (both grade B, both citing `support.reddithelp.com` with 2026 access dates).

- **Spam Policy** (`https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam`, quoted as
  updated 2026-05-19): prohibited — "using tools (e.g., bots, generative AI tools) that may break
  Reddit or facilitate the proliferation of spam"; "repeatedly posting the same or similar comments
  in a thread, community or across communities".
- **Manipulated Content / Misleading Behavior**
  (`https://support.reddithelp.com/hc/en-us/articles/41180423371156-...`, quoted upd. 2026-05-19):
  AI content is allowed **only if disclosed** — prohibits content "that presents itself as
  human-generated"; "be transparent and include a tag".
- **Responsible Builder Policy**
  (`https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy`):
  bots "must clearly disclose to users that they are engaging with a bot" and "must not engage in
  spamming activity through automated posts, comments, or direct messages, including posting
  identical or substantially similar content across subreddits". Approval is required for API
  access; "you must not misrepresent or mask how or why you are accessing Reddit data".
- **Data API Terms** (`https://redditinc.com/policies/data-api-terms`): free tier 100 queries/minute
  over a 10-minute window for non-commercial OAuth apps; **$0.24 per 1,000 calls** for commercial or
  high-volume use; commercial use needs explicit approval. Also: "Do not use the Data APIs to spam,
  incentivize, or harass users."
- **Gates and shadowbans** (grade B, plus grade C corroboration from the 2026-09-04 search):
  self-promotion norm ~1 link in 10 (Reddiquette); >~10% of submissions to one domain is a
  shadowban trigger, as are URL shorteners, cross-posting identical content quickly, posting at
  non-human rates, and posting immediately after account creation. Subreddits gate with
  AutoModerator on account age (commonly 30–90 days) and comment karma (10–500 depending on sub);
  removals are silent — the poster still sees his own post. New/low-karma accounts are rate-limited
  to roughly one post per 10–15 minutes (`RATELIMIT` errors).
  Search sources seen: `https://karmaguy.io/en/blog/reddit-self-promotion-rules`,
  `https://outreachbloom.com/reddit-posting-rules`, `https://brandonleuangpaseuth.com/blog/how-to-post-on-reddit-without-getting-banned/`.

**Verdict for us: RED as an automated channel, and already rejected in this repo.**
`docs/REJECTED.md` kills "Reddit / YouTube citation seeding" as astroturfing, permanently. Nothing
found here reopens it. The one honest reading — a human who participates for months and posts his
own thing once in ten — is a person doing community work, which the mission forbids. Note the nuance
so nobody re-argues it: Reddit does *not* ban all bots, it bans undisclosed and spamming ones; a
**disclosed** bot that posts nothing promotional is permitted and worth exactly nothing to us.

## 4. Indie Hackers

Nothing renderable. `indiehackers.com` is not on GitHub and was not fetched. Grade C only, from the
2026-09-04 search: IH is described as "DECLINING but still relevant" since the Stripe acquisition and
the layoffs that gutted the community team; the forum still shows daily posts. The subreddit
`r/indiehackers` (~100K+ members) "permits self-promotion exactly once per product, using the SHOW IH
flair… for feedback and critique — not advertisement". Sources:
`https://www.vibecontentcreation.com/blog/indie-hacker-communities-where-solo-founders-hang-out`,
`https://gofindevo.com/subreddits/indiehackers`, `https://oneup.today/best-subreddits-indie-hackers`.
No traffic number of any grade was found, and no ToS text was rendered. **Treat IH as unquantified.**

## 5. The one agent-compatible subset: submissions, not posts

`mmccaff/PlacesToPostYourStartup` (fetched, grade A as a *directory*) splits cleanly:

- ~20 community destinations (r/SideProject, r/SaaS, r/microsaas, r/Startups, Show HN, …) — all
  closed to us by sections 1–3 above.
- 90+ **directories** with submission forms: Product Hunt, AngelList, Crunchbase, G2, Capterra,
  AlternativeTo, Killer Startups, Launched, LaunchIgniter, Launching Next, Postmake, SaaSHub,
  Startup Ranking, StartupBlink, and others. A form is a submission, not a conversation, and an
  agent can fill one in honestly under our own name.

The list carries **no fees, no rules and no traffic data** — it is a map, not evidence. What a
directory listing is worth is unresolved: the 2026-09-04 search on directory-submission results
returned only vendors selling the service (`launchdirectories.com`, `startupsubmit.app`,
`zplatform.ai`, `rockethub.com`), whose claims (25–30 referring domains, "DR +5–20") are marketing
copy from a conflicted party. Grade C at best, and I would not plan against any of it.

Related repo precedent worth carrying: `Draek2077/otto-code` found **age and star gates** on the
submission channels that actually matter to developers — awesome-selfhosted requires ~4 months since
release, Homebrew/Coolify/Scoop require 225–1,000 GitHub stars. Directories are not uniformly open
on day one either.

---

## Dead ends, recorded so nobody re-searches them

1. **There is no launch platform in this criterion that pays anything.** PH, HN, IH and Reddit are
   traffic, not revenue. Israeli payability is therefore not the gate here — our own rails (Paddle,
   Telegram Stars, Apify, x402) are. Any ₪ figure attached to a "launch" is a conversion assumption.
2. **Every one of the four conditions its traffic on a human identity that answers in real time.**
   PH requires a personal, photographed, week-old account; HN requires human-written text and a maker
   in the thread; Reddit requires an aged account with non-promotional history; IH rewards narrative
   build-in-public posts. This is one structural fact wearing four uniforms, and it matches the
   store-promotion group's finding that human community participation is the closed lever.
3. **Automating any of it is a terms violation on the platform's own text**, not a grey area: HN's
   generated-text clause, PH's "bots… or other artificial activity", Reddit's undisclosed-bot and
   cross-posting clauses.
4. **Traffic numbers in this space are not verifiable from here.** Every figure found is grade C and
   most come from sellers of launch services; one independent source explicitly says the standard
   numbers trace to nothing.
5. **Not attempted, deliberately:** Lobsters (invite-only, and its own quoted rule is "self-promo
   should be less than a quarter of one's stories and comments" — same shape), Betalist and paid
   launch services (paid placement is out under the constitution's honesty rule only if undisclosed,
   but the ceiling makes it moot), and per-subreddit rule enumeration (unbounded, and the group is
   closed above it).

## What a human or unblocked agent should open to close this criterion

- `https://news.ycombinator.com/newsguidelines.html#generated` — confirm the AI clause verbatim and
  its current wording.
- `https://help.producthunt.com/en/articles/3615694-community-guidelines` and the five other PH help
  URLs listed in section 2.
- `https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy` — the
  disclosure rule for bots, which is the only clause that could ever make an automated Reddit
  presence legitimate.
