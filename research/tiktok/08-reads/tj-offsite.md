# Deep read: tj-offsite (TJ Robertson off TikTok: site, blog, YouTube, LinkedIn, podcasts)

**Family:** `tj-offsite` · **Read:** 2026-09-28 · **Reader:** Opus deep reader (stage 2 of the TikTok sweep)
**Inputs:** the runner captures under `research/rendered/tt-src-*` listed in §1. **WebSearch used:** none.
**Prior work read, not repeated:** `research/tiktok/08-sweep/sweep-2026-09-28.json` (nine scouts plus the critic),
`research/tiktok/01`, `06`, `07`, `research/colony-sweep/scouts/distribution--short-video.md`,
`research/colony-sweep/scouts/content-seo--ai-content-policy.md` (§5 rules parasite SEO RED), `docs/REJECTED.md`.

**Grades.** `rendered` means I read it in a runner capture; the file and the quote or key are given, and every
quoted sentence was checked with `grep -F` against that file. `github`, `snippet`, `repo` and `none` are as in
the sweep. A sentence on a page is what its author **said**. View counts measure attention, not sales. Nothing
here shows that any tactic sells anything.

**Privacy.** People are named only by public handle or professional name. The homepage, the YouTube "About"
text and one podcast bio carry family details about the creator. They are **not** repeated here. The podcast
hosts, a LinkedIn commenter, a client's owner and a subreddit moderator who appear in the captures are left
unnamed on purpose; only their show or business is mentioned where it matters.

---

## 1. Captures read, with status

All captures were fetched by the runner on 2026-09-28 between 21:00 and 21:03 UTC.

| Capture (`research/rendered/…`) | URL | HTTP | Usable | What it holds |
|---|---|---|---|---|
| `tt-src-tjrobertson-com.{html,txt}` | https://tjrobertson.com/ | 200 | **yes** | Offer, 3 price tiers, FAQ, "at capacity" waitlist form. Rank Math schema: `datePublished` 2025-05-02, `dateModified` 2026-05-17. |
| `tt-src-tjrobertson-com-how-to-build-a-content-machine.*` | …/how-to-build-a-content-machine/ | 200 | **yes** | The "content machine" post, byline "TJ", 2025-12-01. Embeds TikTok 7569058327246687502. |
| `tt-src-tjrobertson-com-how-to-use-reddit-so-ai-recommends-your-busines.*` | …/how-to-use-reddit-so-ai-recommends-your-business/ | 200 | **yes** | Reddit-for-AI post, byline "Riva", published 2026-06-30, modified 2026-08-04. Embeds TikTok 7657333505461996814. |
| `tt-src-tjrobertson-com-what-ai-knows-about-your-business.*` | …/what-ai-knows-about-your-business/ | 200 | **yes** | Citation-audit method post, byline "Riva", published 2026-07-27. Embeds TikTok 7665088847612595470. |
| `tt-src-tjrobertson-com-anthropic-2026-claude-updates.*` | …/anthropic-2026-claude-updates/ | 200 | **yes** | Newsjack post, byline "Riva", published 2026-03-07. Embeds TikTok 7610245040685829390. |
| `tt-src-tjrobertson-com-category-seo.*` | …/category/seo/ | 200 | **yes** | Ten post titles and excerpts (no dates in the listing). |
| `tt-src-linkedin-com-posts-tj-robertson-seo-smallbusiness-ai-websitecon.*` | LinkedIn post activity 7338787375315042307 | 200 | **yes** | Post text plus the **full auto-transcript** of the attached video. `datePublished` 2025-06-12. 3 likes, 1 comment; author follow count 595. |
| `tt-src-iheart-com-podcast-269-digital-marketing-therapy-85743242-episo.*` | iHeart, Digital Marketing Therapy Ep 316 | 200 | **yes** (description only) | Episode description, 2025-08-26, 31 min. The page says "Transcript is unavailable for this episode." |
| `tt-src-ivoox-com-en-ai-video-editing-tips-tiktok-influencer-marketing.*` | iVoox, SEO For Accountants episode | 200 | **yes** (description only) | Host-written description; `pubdate="2025-10-06T14:39:17.000Z"`, 43:47. |
| `tt-src-youtube-com-tjrobertsondigital-videos.html` | https://www.youtube.com/@TJRobertsonDigital/videos | 200 | **yes** (html only) | `ytInitialData`: channel bio, 3.27K subscribers, 450 videos, the 30 newest long-form uploads with views, age and length. The `.txt` is 194 bytes and useless. |
| `tt-src-youtube-com-tjrobertsondigital.html` | https://www.youtube.com/@TJRobertsonDigital | 200 | **yes** (html only) | Same bio, 12 long-form uploads, and a **Shorts shelf** of 20 shorts with view counts. |
| `tt-src-youtube-com-watch-v-aappxjhuiei.html` | watch?v=aapPxjhuieI | 200 | **partly** | Player refused: `playabilityStatus` = `LOGIN_REQUIRED` ("Sign in to confirm you’re not a bot"). `ytInitialData` still gives title, views, date, owner and description. |
| `tt-src-youtube-com-watch-v-gupubtcmutq.html` | watch?v=GUPUbtCMutQ | 200 | **partly** | Same player block. Metadata readable. |
| `tt-src-youtube-com-watch-v-ih2xh-fccy0.html` | watch?v=ih2xH-FccY0 | 200 | **partly** | Same player block. Metadata readable. |
| `tt-src-youtube-com-watch-v-qcyzovyph1k.html` | watch?v=QcYZovYPh1k | 200 | **partly** | Same player block. Metadata readable, including chapter timestamps. |
| `tt-src-youtube-com-watch-v-txhr-tf0pkm.html` | watch?v=TXHR-Tf0pkM | 200 | **partly** | Same player block. Metadata readable. |
| `tt-src-primaryposition-com-blog-tj-robertson-tj-digital-ai-optimizatio.meta.json` | primaryposition.com episode page | **403** | **no** | Empty body. Nothing read. |
| `tt-src-conroycreativecounsel-com-podcast-cat-episode-books-how-can-you.meta.json` | conroycreativecounsel.com episode page | **403** | **no** | Empty body. Nothing read. |

**Method notes.** No YouTube transcript or audio was available: every watch page hit the bot wall, so all
YouTube evidence is titles, counts, dates and descriptions. The LinkedIn capture is the only place where TJ's
**spoken** words are on file, via LinkedIn's auto-transcript of a video. TikTok IDs were read from the
`cite=` / `data-video-id=` attributes of the embeds on his blog and decoded as `id >> 32` (UTC). The LinkedIn
activity id decodes as `id >> 22` milliseconds and matches the page's `datePublished` of 2025-06-12.

---

## 2. The facts, each graded

### 2.1 What TJ Digital sells, to whom, at what price

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F1 | It sells **"SEO built for AI search, including what the industry calls GEO (Generative Engine Optimization). We also offer video editing and website development."** No course, SaaS, template shop or paid newsletter appears on any captured page. | rendered | `tt-src-tjrobertson-com.txt`, FAQ "What services do you specifically offer?" |
| F2 | **Three published monthly retainers:** "Business-First Plan" **$1,900/month** (14 credits), "Strategic Collaboration" **$2,900/month** (24 credits, marked "Popular"), "Deep Partnership" **$4,500/month** (40 credits). Each includes "Essential SEO" and "Strategy and Analysis from TJ". The unit of work is stated: "*Credits are how we scope work. For example, a new blog post is 2 credits." | rendered | `tt-src-tjrobertson-com.txt`, "Simple, Transparent Pricing" section |
| F3 | The split inside a retainer: "Our monthly retainers start at $1,900. We charge $500 for strategy and account management, with the remainder going toward credits that cover the actual work." Packages are "custom … based on what will actually bring you the most leads per dollar spent." | rendered | `tt-src-tjrobertson-com.txt`, FAQ |
| F4 | Risk reversal: "complete transparency, no long-term contracts, money-back guarantee." The guarantee is **bounded**: "No risk. If you're not happy, we'll refund your last month." | rendered | `tt-src-tjrobertson-com.txt`, hero line and "No Contracts" block |
| F5 | Transparency as the product feature: "We invite you directly into our Notion task management platform." The positioning line "treats clients’ money as if it were their own and shows exactly where every dollar goes" appears in the homepage bio and in the YouTube channel description. | rendered | `tt-src-tjrobertson-com.txt`; `tt-src-youtube-com-tjrobertsondigital.html` (`channelMetadataRenderer.description`) |
| F6 | **To whom.** The homepage and podcast bios say small and medium businesses. The sharper filter is **revenue of about $1M a year**: Peec AI's partner video says "They work best with companies doing at least $1M in annual revenue", and his own SEO post excerpt says "Most businesses should start investing in SEO once they’re doing about $1 million a year in revenue." The waitlist form's budget options start at **$1,900** ("No idea.." / "$1,900 - $2,800" / "$2,900 - $5,000" / "$5000+"). | rendered | `tt-src-youtube-com-watch-v-aappxjhuiei.html` (description); `tt-src-tjrobertson-com-category-seo.txt` ("When Should You Invest in SEO? The $1 Million Rule for 2026"); `tt-src-tjrobertson-com.html` `<option>` values |
| F7 | Third-party credential: **"Meet TJ Digital: GEO & AI Search Agency \| Peec AI Trusted Partner"**, a video uploaded by the **Peec AI** channel on Apr 1, 2026 (593 views). It links the directory entry `peec.ai/agency-directory/tj-digital` and claims a client grew "AI visibility from 1% to 24% in less than three months". That result is a partner's marketing claim, not evidence. | rendered | `tt-src-youtube-com-watch-v-aappxjhuiei.html`, `videoPrimaryInfoRenderer` and description |
| F8 | "Google Ads" is **not** a listed service. Scout 2's summary says it is; the homepage FAQ lists only AI-search SEO/GEO, video editing and website development. | rendered | `grep -i 'google ads'` on `tt-src-tjrobertson-com.txt` returns nothing |

### 2.2 The end of the funnel

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F9 | **Today the funnel ends in a waitlist, not a sale.** "We’re not taking on new clients right now, but we’re actively hiring and training to expand our team. Join our waiting list and we’ll reach out in the order people signed up…" Every call to action on the page reads "Join Our/the Waiting List". The page was last modified **2026-05-17** (`dateModified`) and the notice was live on the 2026-09-28 fetch. | rendered | `tt-src-tjrobertson-com.txt`; `dateModified` in `tt-src-tjrobertson-com.html` |
| F10 | The waitlist form collects Name, Email, URL, "Monthly Markteting Budget" [sic] and "Marketing Goals" (WPForms). | rendered | `tt-src-tjrobertson-com.txt` form block |
| F11 | After the waitlist, the sale runs through **two human calls**: "Once we connect, we’ll have a quick call to see if it’s a good fit, followed by a 90-minute discovery call where we learn everything about your business, create your brand guide, and develop a marketing plan specifically for you." The FAQ adds "Call or email us" and "No sales pressure". | rendered | `tt-src-tjrobertson-com.txt`, FAQ "How do we get started working together?" |
| F12 | **In June 2025 the funnel ended in a free audit.** From the LinkedIn video transcript: "If you would like me to do a free audit of your website, visit tjrobertson.com and fill out the form at the bottom of the page." Today's waitlist section still carries the anchor `id="audit"`, and every nav button links to `/#audit`. So the free-audit form became the waitlist form. That last step is an inference from the anchor name. | rendered (quote, anchor); inference (the swap) | `tt-src-linkedin-com-posts-…websitecon.txt`; `tt-src-tjrobertson-com.html` (`id="audit"`), `tt-src-tjrobertson-com-how-to-build-a-content-machine.html` (`href="/#audit"`) |
| F13 | **Lead magnet (2025):** the same LinkedIn video gives away his prompt document ("So in the description, there's a link where you can get this document.") and the post says "I'm sharing my exact prompts and workflow." with a link, `https://lnkd.in/gxSJ6JVH`. No newsletter, email course or Calendly-type booking link appears on any captured page. | rendered | `tt-src-linkedin-com-posts-…websitecon.txt` |
| F14 | The **2026 blog posts end with a paid service pitch, not a free audit**: "To have the full version run for you, contact TJ Digital and we will simulate the prompts, rank the sources shaping AI answers in your industry, and build the plan…" They link `https://tjrobertson.com/contact/`. | rendered | `tt-src-tjrobertson-com-what-ai-knows-about-your-business.txt` (last section); `…reddit…txt` (last paragraph) |
| F15 | **No free audit with a $750/month threshold exists on the current homepage.** The string `750` appears only inside SVG path data, and no text offers an audit. Scout 6's snippet was probably an older page version. | rendered (absence) | `grep -o '.\{120\}750.\{120\}' tt-src-tjrobertson-com.html` shows SVG coordinates only |

### 2.3 "How to Build a Content Machine": what it says, verbatim

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F16 | Published **2025-12-01** under byline **"TJ"** (`datePublished` = `dateModified`). | rendered | `tt-src-tjrobertson-com-how-to-build-a-content-machine.html` schema |
| F17 | **The "only marketing" claim is real and verbatim**, under the heading "Short-Form Video: The Most Effective Input": "**This is the only form of marketing I do for our agency, and it works really well.** We take the transcription of these videos and turn them into about eight pieces of content." | rendered | `…content-machine.txt` |
| F18 | **The page does *not* say TikTok beats other platforms for leads.** Its only platform line treats them as equals: "The algorithms love it. TikTok, Instagram, YouTube, Facebook, LinkedIn, and X all prioritize video content right now." | rendered | `…content-machine.txt` |
| F19 | The pipeline as stated: record a short video, transcribe it, then feed the transcript "along with your brand guidelines and business context, into Claude or ChatGPT". He names the three inputs as "Guidelines", "Context" and "Input". Its outputs include "Reddit posts that sound like you wrote them, blog posts with your unique insights, LinkedIn articles in your voice…". | rendered | `…content-machine.txt` |
| F20 | **He warns against automating it:** "I would not recommend automating this. You definitely want a human in the loop reviewing everything." Also: "Fully automated AI content is risky." and "Never publish the direct first output without editing." (80/20: AI does the grunt work; a human adds expertise, fact-checks and adds examples.) | rendered | `…content-machine.txt` |
| F21 | Topic selection: "Start with the most common questions you’re asked in your business." Specific beats generic ("There’s less competition for the specific question."). Write headers as questions, and use lists and Q&A so AI can extract the answer. | rendered | `…content-machine.txt` |
| F22 | The embedded TikTok is **7569058327246687502** (decodes to **2025-11-05 02:12 UTC**), caption "Turn ONE video into 8 pieces of content 📹 Here’s the exact process we use for clients #contentcreation #contentmarketing #aitools #businessgrowthadvice". | rendered | `cite=` in `…content-machine.html`; caption in `.txt` |
| F23 | Its evidence links point to vendor and agency blogs, not studies: "83% of top search results don’t use AI-generated content" → aiter.io; "10+ strategic content assets in under two hours" → skillarbitra.ge. | rendered | anchor hrefs in `…content-machine.html` |
| F24 | **The machine is visibly running.** All four captured posts embed a TikTok of the same topic. In three of them the video's decoded date is **6 to 26 days before** the post (content machine: Nov 5 → Dec 1, 2025; Anthropic: Feb 24 → Mar 7, 2026; "What AI knows": Jul 21 → Jul 27, 2026). The Reddit video is from the same day as its post (Jun 30, 2026). That post was modified on 2026-08-04, so which came first cannot be proven. | rendered (dates) + decode | `data-video-id` and schema dates in the four post `.html` files |

### 2.4 Where "TikTok beats every other platform for business leads" actually comes from

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F25 | The phrase is in the **host-written description** of an episode of the **SEO For Accountants** podcast (Conversion Zoo). The same text is on iVoox (2025-10-06) and on the host's YouTube upload (TXHR-Tf0pkM, Oct 6, 2025, **35 views**): "He shares how he uses tools like Descript for super-fast video editing, **why TikTok beats every other platform for business leads**, and how to nail your hook in the first 3–5 seconds." These are the host's words about what TJ said, not a TJ quote, and no number backs them. | rendered | `tt-src-ivoox-com-…marketing.txt`; `tt-src-youtube-com-watch-v-txhr-tf0pkm.html` description |
| F26 | The same description carries "From walking the dog to generating daily short-form videos", "TJ predicts traditional search will be obsolete within two years" and "context engineering". All are host paraphrase. | rendered | same |
| F27 | TJ is a **guest**, not the owner of that show. The iVoox `ld+json` has `"author":{"@type":"Person","name":"SEO For Accountants"}`, and the YouTube upload's owner is the host's channel. | rendered | `tt-src-ivoox-com-…marketing.html`; `tt-src-youtube-com-watch-v-txhr-tf0pkm.html` (`videoOwnerRenderer`) |
| F28 | His own nearest claim is a YouTube title, **"How I Get 90% Of My Clients From YouTube & TikTok (With Less Than 1K Views)"** (13:30 long, 618 views, "1 year ago" at capture). It credits YouTube **and** TikTok together, not TikTok over the rest. I did not watch it. | rendered (title, counts) | `tt-src-youtube-com-tjrobertsondigital-videos.html` (lockup `tLK2bZ9a3Tw`) |

### 2.5 "Fact density" and the citation claims

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F29 | **"Fact density" appears in none of the 16 usable captures.** Neither does "getting cited is harder than ranking". The LinkedIn post, which scout 0 guessed was the source, uses "density" only about **page layout**: "With Apex Doors isn't so much the amount of text, but the density. There's also just a lot of information that visitors probably don't care to know." This is visual text density for user experience, the opposite of a fact-density rule. | rendered (absence and context) | `grep -i 'densit'` over all family captures: one hit, in `tt-src-linkedin-…websitecon.txt` |
| F30 | Peec.ai is real in his practice ("If you start tracking AI citations with a tool like Peec.ai…"; the Peec partner video). A **Peec + Google Search Console topic-picking workflow** is not in any capture. Search Console shows up only as a separate topic (social "platform properties" posts). | rendered | `…reddit…txt`; `tt-src-tjrobertson-com-category-seo.txt` |
| F31 | The citation method he **does** publish ("What AI Knows About Your Business in 2026"): write customer-phrased prompts; run each several times in ChatGPT, Google AI Mode and Perplexity; log every cited URL in a spreadsheet; sort by frequency. "We run about 50 prompts per client audit, and 10 to 20 is enough to see the pattern yourself." | rendered | `tt-src-tjrobertson-com-what-ai-knows-about-your-business.txt` |
| F32 | His three moves after that audit: fix pages you control ("The block of text the model pulls has to recommend you by name, and that is where most sites fail."); get onto pages you don't control ("brand mention building"); and "Publish pages that take the citation slot." On the last he says: "The queries these models run are far more specific than anything a human would type into Google, so there is very little competition for those pages." | rendered | same file |
| F33 | Self-reported scale and effect claims, none verified: "we simulate about 4,000 prompts every day"; "40 to 50 client websites" (category excerpt); "A new mention on a source the models already cite often shows up in AI answers within a day."; "AI-referred visitors convert at about 8x the rate of traditional search visitors". Scout 6 saw a different title, "ChatGPT Traffic Converts 23x Better", so his own posts give two different multipliers. One of his shorts concedes the volume problem: "Does AI Search Matter If It Sends So Little Traffic? Look at SALES" (5 views). | rendered (as claims) | `…what-ai-knows…txt`; `…category-seo.txt`; Shorts shelf in `tt-src-youtube-com-tjrobertsondigital.html` |
| F34 | His posts do link primary or near-primary sources where they exist: a Semrush study for "about 40% pointed to Reddit" and OpenAI's help article on ChatGPT search. | rendered | anchor hrefs in `…reddit….html` and `…what-ai-knows….html` |

### 2.6 The Reddit-for-AI advice: is it astroturfing?

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F35 | **As written, it is the opposite of astroturfing.** Astroturfing means hiding who is behind the voice; he tells readers to disclose. Under the heading "Should you tell people you own the business?" the answer is "Yes. Be honest about who you are." The suggested line is "Hey, I own this business, which is why I’m qualified to answer this." His "Avoid" column lists "Pretending to be an unbiased stranger", "Posting the same comment across many threads" and "Dropping affiliate or shortened links". | rendered | `tt-src-tjrobertson-com-how-to-use-reddit-so-ai-recommends-your-busines.txt` |
| F36 | He explicitly rejects bought or automated posting: "If you buy some software and start spamming comments about your business, you are essentially guaranteed to get banned." He lists the behaviours Reddit's filters flag: the same link across subreddits within 24 hours, URL shorteners and affiliate parameters, links from new accounts, a high link-to-text ratio, rapid-fire commenting. | rendered | same |
| F37 | The method: find the few threads AI already cites (with Peec.ai), then "Leave a helpful, honest comment on those specific threads." For an AMA: "Spend time in the subreddit first so you’re a known contributor, not a random account", then ask the moderators by ModMail. He reports doing this himself: "On July 2nd, the moderators of r/SEO_for_AI were kind enough to invite me to host an AMA." | rendered | same |
| F38 | **The gray edge is elsewhere, in the content machine.** Among its outputs are AI-drafted "Reddit posts that sound like you wrote them" (F19). With human review and disclosure that is not astroturfing, but it is AI-drafted posting into communities. His own later post also undercuts the Reddit hype: "Advice like “AI loves Reddit” is worthless until you have run your own prompts and seen what your industry actually returns." | rendered | `…content-machine.txt`; `…what-ai-knows….txt` |
| F39 | The Reddit post carries byline "Riva" but is written in TJ's first person ("invite me to host an AMA"). None of the four captured posts (three bylined "Riva", one "TJ") carries an AI-use disclosure; `grep -i` for disclos / written with / generated by / AI-assisted finds only the Reddit post's advice to disclose business ownership. All three Riva posts were modified on the same day, 2026-08-04. | rendered | four post `.txt` files; Riva `Person` schema with `worksFor` TJ Digital in `…reddit….html` |

### 2.7 Years in marketing, audience, and whether he still posts

| # | Fact | Grade | Evidence |
|---|---|---|---|
| F40 | **Years: the snippets disagree because each bio was written at a different time, and they fit one start year, 2009.** The chapter list of the Financial Freedom Podcast live stream (Jul 6, 2025) reads "1:00 – TJ’s digital marketing journey since 2009". The podcast bio (Aug 2025) says 16 years, as does a YouTube title about 9 months before capture ("…What 16 Years of SEO Taught Me"). The homepage (modified 2026-05-17) and the category excerpts say 17. The YouTube channel description still says "15 years" and is simply stale. | rendered | `tt-src-youtube-com-watch-v-qcyzovyph1k.html`; `tt-src-iheart-…episo.txt`; `tt-src-youtube-com-tjrobertsondigital-videos.html`; `tt-src-tjrobertson-com.txt` |
| F41 | Background: "starting as a videographer for marketing clients". | rendered | `tt-src-tjrobertson-com.txt` |
| F42 | **YouTube is small.** 3.27K subscribers and 450 videos. The 30 newest long-form uploads range from **64 to 7,000 views**. The top three are "How this local plumber outranks GIANT competitors (Local SEO Audit)" (7K), "How to Rank #1 on Google Maps…" (6.2K) and "How to Use AI to Write Perfect Pages for Your Website [FULL PROCESS]" (3.6K); all three are "1 year ago". Long-form cadence has dropped: after one upload "4 weeks ago", the next newest is "7 months ago". | rendered | `tt-src-youtube-com-tjrobertsondigital-videos.html` (`metadataParts`) |
| F43 | **The Shorts shelf is where he is active now.** It holds 20 shorts with **5 to 10K views**, most between 138 and 2.7K. The titles are current-events and how-to questions, for example "Does The September 2026 Spam Update Penalize AI Content? What We CHANGED" (386) and "How To Get AI To Say Good Things About Your Business (4 Pages To Add)" (1.1K). The September-2026 title means he was posting shorts in or after September 2026. That date is inferred from the title; YouTube gives no per-short date here. | rendered (titles, counts); inference (date) | Shorts `reelShelfRenderer` in `tt-src-youtube-com-tjrobertsondigital.html` |
| F44 | **TikTok did not stop in April 2026.** Two embedded TikToks decode **after** the critic's latest ID of 2026-04-11: **7657333505461996814 → 2026-06-30** ("How to use Reddit so AI recommends your business without getting banned. AMA July 2, r/SEO_for_AI. #AISearch #RedditSEO #SEO") and **7665088847612595470 → 2026-07-21** ("How does ChatGPT know about my business? For most SMBs, it searches first and repeats what it finds. #AISearch #SmallBusiness #ChatGPT"). A third, **7610245040685829390 → 2026-02-24**, is the Opus 4.6 newsjack caption. None of the four IDs I found is in the critic's list of nine. | rendered (IDs, captions) + decode | `data-video-id` in the four post `.html` files |
| F45 | LinkedIn traction on the one captured post: 3 likes, 1 comment; the author has 595 followers. | rendered | `VideoObject` `interactionStatistic` in `tt-src-linkedin-…websitecon.html` |
| F46 | Podcast circuit, confirmed with dates: Financial Freedom Podcast (streamed Jul 6, 2025, 82 views); Digital Marketing Therapy Ep 316, whose audience is **nonprofits** (Aug 25–26, 2025; 161 views on YouTube); SEO For Accountants (Oct 6, 2025; 35 views). The Digital Marketing Therapy episode lists "Overcoming the fear of on-camera content creation" among TJ's topics. | rendered | the three podcast captures |
| F47 | On camera or faceless: **not settled by this family.** The content-machine post tells readers to "record these videos on your phone in five minutes" in their "authentic voice". He coaches "Overcoming camera shyness", and his shorts titles are first person ("I Tested Both"). All of this suggests a talking-head format, but no image in these captures shows it. The `tt-oembed-*` thumbnails, another family, are the place to settle it. | rendered (advice); inference (his format) | `…content-machine.txt`; `tt-src-iheart-…episo.txt` |
| F48 | He also recommends generating one page per city or modifier with AI and rewording each to dodge duplication: "Identifying each of these and making a separate page for them is perhaps the most effective strategy for SEO right now." and "This will give you completely unique pages with the same core information and messaging." A 2026 post keeps the line: "Keyword variant pages still work. If you serve 12 cities, 8 industries, or 5 use cases, you can build a page for each one…" | rendered | `tt-src-linkedin-…websitecon.txt`; `tt-src-tjrobertson-com-category-seo.txt` |

---

## 3. The lessons

**Fit** is judged against four tests: faceless (the brand is the only public face), no customer contact, ₪0
spend, and honest (MISSION §4 and constraint 6). The grade is the grade of the **evidence that TJ does or says
it**. None of these has evidence that it sells.

| # | Lesson | Source | Grade | Fits a faceless, no-contact, ₪0, honest brand? |
|---|---|---|---|---|
| L1 | **Publish the price and the unit of work.** TJ shows three tiers with a concrete unit ("a new blog post is 2 credits") and the split of each fee. For a ₪79 one-time Pro licence, the analogue is one line saying exactly what ₪79 adds to the free tool, next to the free/Pro difference. | F2, F3 | rendered | **Yes.** Faceless, ₪0, honest, no contact. It lands in the Pro box on `products/il-biz-tools/invoice.html`, the pricing FAQ, and a post-result ask on the validator. |
| L2 | **Make the guarantee bounded and specific.** "If you're not happy, we'll refund your last month" is a promise a buyer can check. Our version must state exactly what Gumroad's real refund mechanics allow (scout 8 in the sweep). No vaguer or larger promise. | F4 | rendered | **Yes, if the wording matches Gumroad's actual refund flow.** Handling a refund is a platform action, not a conversation. |
| L3 | **Sell transparency by showing the work, not by accusing rivals.** He lets clients into his Notion task board. Our equivalents are an open repository, a source and date line under every number, the test count, and a statement that the calculation runs in the browser (true only if it is code-checked for each page). | F5 | rendered | **Yes.** It is the one sales argument a faceless brand can make without a face. Drop his "Are agencies scamming you?" framing (MISSION §4). |
| L4 | **Every guide page embeds the short video on the same topic.** He does this on 4 of 4 captured posts, with the video 6 to 26 days before the post in three cases. For us: every calculator and guide page embeds its faceless explainer (screen recording plus TTS) through the official YouTube embed, and the same clip is posted manually to TikTok where allowed. | F22, F24 | rendered (practice); effect unknown | **Yes** for the embed. Posting stays manual under PUBLISH-9 (`distribution--short-video.md`); the video's reach ceiling is unchanged. |
| L5 | **One source, several platform-native pieces, and never unattended.** His strongest line for us is his warning: "I would not recommend automating this." Our version: one verified explainer becomes a page, a short and a text post, each re-edited, with a checker pass against sources before publishing. | F17, F19, F20 | rendered | **Yes at low volume with a real review gate.** It fails as a mass pipeline (TikTok originality rule, mass faceless AI video RED in `distribution--short-video.md`). His "Reddit posts" output is **excluded** (L10). |
| L6 | **Pick topics from real questions, then write question-shaped headers with the answer first.** He mines questions from customers. We may not talk to customers, so our sources are the questions users type into our own tools and site search (anonymous, aggregate), official FAQ pages, and Search Console queries. | F21 | rendered | **Yes with that substitution.** FAQPage JSON-LD already exists on index, vat and pcn874 (sweep scout 3, repo grade), so what is missing is question coverage, not markup. |
| L7 | **Measure what AI cites before writing, then "publish pages that take the citation slot".** Run 10 to 20 customer-phrased Hebrew prompts several times, log the cited URLs, sort by frequency, and write an honest page on our own domain that answers the exact question and names the tool in the pulled paragraph. | F31, F32 | rendered (method); his effect claims unverified (F33) | **Partly.** Page-writing is ₪0 and faceless. The measuring run costs either owner minutes or LLM calls. The prior repo ruling stands: AI referrals are a tiny supplementary channel (`content-seo--ai-content-policy.md` §6, E13/E14); nothing here overturns it. |
| L8 | **A waitlist is honest only when capacity is real.** His "at capacity" notice fits a human service. Software has no capacity limit, so the same device on a ₪79 licence would be fake scarcity. | F9 | rendered | **No; reject for us.** This confirms scout 6. |
| L9 | **The economics do not transfer.** TJ says short video, in small numbers ("With Less Than 1K Views"), fills an agency whose cheapest client pays **$1,900 a month, recurring**. At any exchange rate between ₪3.3 and ₪3.8 to the dollar, one such client equals roughly **80 to 90 ₪79 licences every month**. His model works on attention measured in hundreds of views; a one-time ₪79 product would need orders of magnitude more views per shekel. | F2, F28, F42, F43 | rendered (prices, titles, counts); the exchange rate is my assumption (none) | **Warning, not tactic.** It agrees with the repo's short-video ceiling of "hundreds of shekels a month" (`distribution--short-video.md`). Copy his mechanics, not his expectation. |
| L10 | **Reddit, even done his honest way, needs a named human.** His method requires disclosure, months as "a known contributor", moderator contact and replying to questions live. Our brand has no human to be that contributor. An agent account is a bot, and under Reddit's Responsible Builder Policy "the compliant bot is the one that may not promote" (`docs/REJECTED.md`). | F35–F38 | rendered | **No; RED stays.** It is not astroturfing as he writes it, but it fails the faceless and no-contact tests. `docs/REJECTED.md` "Reddit / YouTube citation seeding" stays RED. |
| L11 | **City and modifier page farms are out.** His "keyword variant pages … a page for each one", reworded with AI so each looks unique, is the doorway pattern MISSION constraint 6 forbids ("storefront N with a city, a niche or a keyword substituted"). | F48 | rendered | **No; reject.** Only pages with distinct data or a distinct tool pass. |
| L12 | **Qualify the buyer by the offer's economics.** He screens for about $1M revenue and a $1,900+ budget because a retainer only pays at that scale. Our buyers are micro-businesses, and the offer that fits them is self-serve and cheap. That means no calls and no "discovery" step; the product page itself must answer what his fit call answers. | F6, F10, F11 | rendered | **Yes as a design rule.** A FAQ that answers ahead of time "who is this for, what does it not do, what happens after I pay". |
| L13 | **Dated newsjacking with a companion short.** Model releases and a September 2026 spam update get a post plus a short within days. Our analogue is dated Hebrew explainers of Israeli tax and VAT rule changes, each primary-sourced. | F24, F43 | rendered | **Yes** (as in the critic's list). Every figure needs a gov.il, Tax Authority or Kol Zchut source first. |
| L14 | **Borrowed credibility only where it is earned.** His one third-party proof is a tool vendor's partner listing and video. Our analogue is listings we qualify for (the MCP registry, directories that accept a tool on merit). Never a bought placement, never an invented user count. | F7 | rendered | **Partly.** The low value of registries is already on file (`docs/REJECTED.md`, MCP server row). |

> **Correction to L4, 28.9.2026** (`research/tiktok/08-sales-marketing-lessons.md` §8.1 N14b; §5.5 there). "Through the official YouTube embed" cannot be done
> on our site: its Content-Security-Policy says `frame-src 'none'` (`products/il-biz-tools/netlify.toml:36`) and its
> pages promise cookie-free counting, which a YouTube iframe would break. The embed must be a same-origin
> self-hosted `<video>` with `preload="none"`, a poster frame, burned-in captions and a `.vtt` track
> (`docs/VIDEO_PUBLISHING_CHECKLIST.md`). L4 above is left as it was written.

---

## 4. Stage-1 scout claims: confirmed, corrected, refuted

Scout numbers are the 0-based indices of `scouts[]` in `research/tiktok/08-sweep/sweep-2026-09-28.json`.

| Scout claim | Scouts | Verdict | What the render shows |
|---|---|---|---|
| Repurposed short video is "the only marketing he does" for his agency | 5 (critic verify_first #1) | **CONFIRMED** | Verbatim in the content-machine post (F17), dated 2025-12-01. It is his own statement, and it sits beside podcast guesting and a vendor directory listing, so "only" is his framing. |
| TikTok beats other platforms for business leads, sourced to tjrobertson.com/how-to-build-a-content-machine/ | 5 | **CORRECTED** (wrong source, weaker speaker) | Not on that page (F18). It is the SEO For Accountants **host's** episode description (F25), with no numbers. His own nearest claim credits "YouTube & TikTok" together (F28). |
| "Getting cited is harder than ranking; the biggest factor is fact density", plus a Peec.ai + Search Console topic workflow | 0 (critic verify_first #2) | **NOT FOUND; the proposed source is REFUTED** | None of the 16 usable captures has it. The LinkedIn post scout 0 pointed to uses "density" for page layout (F29). Peec.ai use is confirmed; the GSC topic workflow is not (F30). Anything built on "fact density" must drop the attribution to TJ. His published method is the citation audit (F31, F32). |
| Retainers start at $1,900; $500 for strategy and management, the rest as credits; packaged for "leads per dollar" | 6 | **CONFIRMED and extended** | F2, F3: three tiers, $1,900 / $2,900 / $4,500 with 14 / 24 / 40 credits; a blog post is 2 credits. |
| Free audit for businesses spending at least $750/month, "no cost, no credit card, no obligation" | 6 | **REFUTED for the current site** | No audit offer and no `750` on the 2026-09-28 homepage (F15). A free website audit is **confirmed for June 2025** by his own words on LinkedIn (F12); the `#audit` anchor survives. |
| "At capacity… not taking new clients", a waitlist form; undated | 6 | **CONFIRMED and bounded** | Live on 2026-09-28; the page's `dateModified` is 2026-05-17 (F9). Onboarding after it is a fit call plus a 90-minute discovery call (F11). |
| Services are GEO, video editing and website development | 6 | **CONFIRMED** | F1. |
| Services include Google Ads | 2 (summary) | **REFUTED** | Not listed (F8). |
| No course, SaaS or newsletter; he sells agency services | 1 | **CONFIRMED** (no such product on any captured page) | F1, F13. One free lead magnet existed in 2025: the prompt document (F13). |
| Transparency positioning; "treats clients’ money as if it were their own…"; no long-term contracts | 0, 2, 3 | **CONFIRMED** | F4, F5, plus the Notion-access detail and the bounded refund. |
| 15, 16 or 17 years in marketing; the snippets disagree | 0, 1, 3, 6 (critic verify_first #5) | **RESOLVED** | One start year, 2009; each bio was written at a different time; the YouTube "15" is stale (F40). |
| Started as a videographer | 0, 1, 6 | **CONFIRMED** | F41. |
| "SEO For Accountants" is not his own show; he was a guest | 6 | **CONFIRMED** | F27. |
| He uses Descript, a 3–5 s hook, "walking the dog to generating daily short-form videos", "search obsolete within two years" | 5, 6 | **CONFIRMED as host paraphrase, not his words** | F25, F26. |
| Blog posts are bylined "Riva" (github grade) | 1 | **CONFIRMED** | 3 of 4 captured posts carry "Riva" (schema `worksFor` TJ Digital) while written in TJ's first person; no AI-use disclosure seen (F39). |
| The blog newsjacks AI releases (Anthropic 2026 post) | 0, 1 | **CONFIRMED** | Post 2026-03-07 with a TikTok from 2026-02-24 (F24, F44). |
| Peec AI Trusted Partner and listed in Peec's agency directory | 1, 6 | **CONFIRMED** | The partner video is uploaded by Peec AI, Apr 1, 2026, 593 views (F7). |
| Podcasts: Digital Marketing Therapy Ep 316 on AI repurposing; Financial Freedom Podcast on AI SEO | 0, 1, 2 | **CONFIRMED** with dates and views (F46). Ep 316's audience is nonprofits, which none of the scouts noted. |
| The TikTok "AI SEO with TJ Robertson: How to Rank in 2025" is a repurposed podcast clip | 1, 6 | **CONSISTENT** | The Financial Freedom live stream of Jul 6, 2025 has exactly that title (`tt-src-youtube-com-watch-v-qcyzovyph1k.html`). A matching title is not proof that the clip was cut from it. |
| No TikTok ID after 2026-04-11, so he may have stopped posting | critic; 6 | **REFUTED** | TikTok IDs decode to 2026-06-30 and 2026-07-21 (F44); a Shorts title refers to the September 2026 spam update (F43). |
| "AI lets clients create content 10x faster"; "AI for 90% of my workflow" | 0 | **NOT SEEN** in this family. The only "90%" here is the YouTube title about where clients come from (F28). |
| "Parasite SEO" on Medium, LinkedIn and Reddit | 0, 2, 3, 5 | **NOT SETTLED here** | No captured page teaches Medium publishing. The Reddit post is about disclosed comments and AMAs (F35–F37), not about hosting articles. The RED ruling in `content-seo--ai-content-policy.md` §5 is untouched. |
| Local SEO: "Google says no page per location — do it anyway, carefully" | 0, 1 | **CONSISTENT** | He does advocate a page per city or modifier (F48). For us it is REJECTED by MISSION constraint 6 (L11). |
| Format is his own face on camera | 5 (stated), 0/6 (inference) | **NOT SETTLED here** | Only indirect signs (F47). The oEmbed thumbnails from the other family decide it. |
| His TikTok is a lead-generation arm for a high-ticket service, not an audience business | 0 | **CONFIRMED in shape** | The high-ticket service is real (F2); what feeds it is his own claim (F17, F28), and there is no conversion evidence. |

---

## 5. URLs worth rendering next

Every URL below was seen in one of this family's captures, as written or as an href, `cite=` or `/watch?v=`
path. YouTube watch pages come back with the player bot-walled (`LOGIN_REQUIRED`), but their `ytInitialData`
still yields title, views, date and full description. They are worth rendering for descriptions and links,
not for transcripts.

1. `https://www.youtube.com/watch?v=tLK2bZ9a3Tw`: "How I Get 90% Of My Clients From YouTube & TikTok (With Less Than 1K Views)". His own evidence for the TikTok-feeds-the-agency claim; the description may state numbers.
2. `https://www.youtube.com/watch?v=dtyitMh9SW8`: "How To Create Short-Form Videos That Actually Bring Clients [6-Step Agency Formula]".
3. `https://www.youtube.com/watch?v=xosfi4a0Gas`: "The ONLY Marketing Strategy You Need For 2026".
4. `https://www.youtube.com/watch?v=q7YdCXoeiR0`: "How to Use AI to Write Perfect Pages for Your Website [FULL PROCESS]" (3.6K views). Probably the long form of the LinkedIn video; its description should carry the 2025 prompt-document lead magnet.
5. `https://tjrobertson.com/contact/`: the current end of the funnel (form, booking, or nothing).
6. `https://tjrobertson.com/the-1-way-to-make-chatgpt-recommend-you/`: linked from two posts as his "brand mention building" method, with the "double their organic traffic in a single month" claim. It is also a candidate home for the "fact density" line.
7. `https://tjrobertson.com/primary-bias-ai-search/`: the other candidate home for the fact-density or citation claims.
8. `https://tjrobertson.com/market-a-product-no-one-is-searching-for/`: the closest topic to our PCN874 validator, a tool few people search for by name.
9. `https://tjrobertson.com/how-to-spot-an-ai-seo-scam/`: the "8x" conversion claim and its source, if any.
10. `https://tjrobertson.com/about-us/`: professional bio and team size (read for business facts only).
11. TikTok videos seen only as blog embeds, none of which has an oEmbed or video capture yet (fetch through the oEmbed wrapper, as the critic did):
    `https://www.tiktok.com/@tjrobertson52/video/7569058327246687502` (2025-11-05, content machine),
    `https://www.tiktok.com/@tjrobertson52/video/7610245040685829390` (2026-02-24, Opus 4.6),
    `https://www.tiktok.com/@tjrobertson52/video/7657333505461996814` (2026-06-30, Reddit),
    `https://www.tiktok.com/@tjrobertson52/video/7665088847612595470` (2026-07-21, what ChatGPT knows).
12. `https://peec.ai/agency-directory/tj-digital`: the partner listing (URL-encoded in `tt-src-youtube-com-watch-v-aappxjhuiei.html`). Low priority; it would only repeat the vendor's marketing.

The two 403 pages (primaryposition.com and conroycreativecounsel.com) should not be retried from the runner
without a different fetch method. Nothing in this family depends on them.
