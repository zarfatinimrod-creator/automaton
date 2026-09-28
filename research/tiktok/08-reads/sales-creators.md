# Sales creators on TikTok: what the captures show (reader: sales-creators family, 28.9.2026)

**What this is.** Stage 2 of the TikTok sweep, the SALES half: offer construction, pricing and
anchoring, the moment a free user is asked to pay, objections answered in copy, closing without a
salesperson, and copy skeletons. It reads the pages a GitHub Actions runner saved on 2026-09-28 at
about 21:01-21:03 UTC and checks what the stage-1 scouts said in
`research/tiktok/08-sweep/sweep-2026-09-28.json` (scout 2 "sales-tiktok", scout 8
"self-serve-offer-pricing-upgrade", and the critic). No WebSearch was used, nothing was fetched from
the network, and no git command was run.

**People.** Creators are named only by public handle and the public professional name in their
oEmbed `author_name`. No personal or family details are recorded. One caption names a guest speaker.
It is quoted verbatim because the brief asks for verbatim captions, and nothing else about that
person is recorded.

**Grades.**
- **rendered**: read in a capture. The file and JSON key are cited, and every quote was checked with `grep -F`.
- **github**: read on GitHub.
- **snippet**: seen only in a search-result snippet, usually a stage-1 scout's.
- **repo**: read in this repository.
- **none**: my own inference, general knowledge, or arithmetic on graded numbers.

Counts are lifetime totals as of the capture time. **Plays measure attention, not sales. A caption
is what a creator said, not proof that it works.** Nothing below shows that any of these tactics
sold anything.

---

## 1. Captures read, with status

Every file below is in `research/rendered/`. I checked each `.meta.json` first: all 16 show
`"status": 200` and `"error": null`. HTTP 200 did not always mean the content was there. The
discover and tag pages returned 200 but contained only an empty page shell.

| Capture | HTTP | Usable? | What it holds |
|---|---|---|---|
| `tt-video-ahormozi-7336007528070958382.html` (396,010 B) | 200 | **Yes** | `__UNIVERSAL_DATA_FOR_REHYDRATION__` → `webapp.video-detail` (`statusCode` 0) → `itemInfo.itemStruct`: `desc`, `createTime`, `stats`/`statsV2`, `authorStats`, `author.signature`, `stickersOnItem`, `video.duration`, `video.claInfo` (auto-caption WebVTT link), `IsAigc`, `isAd`. |
| `tt-video-conversion-doc-7430511437199543584.html` (411,914 B) | 200 | **Yes** | Same keys. It has an auto-caption WebVTT link. |
| `tt-video-pm-alliance-7441618513669655864.html` (391,179 B) | 200 | **Yes** | Same keys. It has an auto-caption WebVTT link. |
| `tt-video-revelloughlin-7541753741691653384.html` (397,734 B) | 200 | **Yes** | Same keys. There is **no** caption file (`"noCaptionReason":1`). |
| `tt-video-saas-cmo-pro-7406413784123723050.html` (401,000 B) | 200 | **Yes** | Same keys. There is **no** caption file (`"noCaptionReason":3`). |
| `tt-oembed-{ahormozi, conversion-doc, pm-alliance, revelloughlin, saas-cmo-pro}-*.json` | 200 | Yes, as a cross-check | `title` matches `itemStruct.desc` for all five. |
| `tt-oembed-salestipstok-7337845679101922602.json` | 200 | **Yes (caption only)** | `title`, `author_name`, `author_unique_id`, `thumbnail_url` (576×1024), and `html` with the music line. There are no counts: no video page was captured. |
| `tt-oembed-russellbrunson-7276124634834275630.json` | 200 | **Yes (caption only)** | As above. |
| `tt-oembed-geoffketterer-7431531457396477216.json` | 200 | **Yes (caption only)** | As above. |
| `tt-oembed-copyfolioapp-7216736475889667354.json` | 200 | **Yes (caption only)** | As above. |
| `tt-src-tiktok-com-discover-value-equation-hormozi.html` (365,705 B) | 200 | **No, for content** | The rehydration JSON holds only `webapp.kap-detail.wordDetail` (`"uniqueWord":"value-equation-hormozi"`, `"formattedWord":"value equation hormozi"`) and `kap.init.config` (`"count":6`, `"preFetch":true`). There is **no item list**: `playCount` 0 hits, `"itemList"` 0 hits, no `/video/` links. The visible text is "TikTok - Make Your Day". The video list is fetched client-side (none). |
| `tt-src-tiktok-com-tag-saas-lang-en.html` (360,766 B) | 200 | **No** | The scope holds only `webapp.app-context`, `webapp.biz-context`, `webapp.i18n-translation`, `seo.abtest` (`"pageId":"305716655554296953"`) and `webapp.a-b`. It has no challenge or tag detail and no items: `playCount` 0 hits, `"friction"` 0 hits. |
| `*.txt` for the 7 HTML captures (23 B each) | 200 | No | Each contains only "TikTok - Make Your Day". The text extraction drops the scripts. |

**Consequence for the brief.** I was asked to mine the discover and tag pages for their most-watched
sales lessons. **That could not be done:** neither capture contains a single video, caption or count.
Section 2 therefore ranks only the five videos that have counts.

**Adjacent capture, read only as a cross-check:** `tt-video-nickmacsocial-7360084727291727109.html`
belongs to another family, but scout 8 named it as a fallback for the value equation. Its caption is
"Alex Hormozi’s value equation explained in 1 minute" plus hashtags. The caption does not state the
four terms. It has 1,147 plays (`statsV2.playCount`) and a 60 s `duration`. It is no better a source
than the Hormozi caption.

**Not checked:** thumbnails. The `tiktokcdn-us.com` image and caption hosts are outside what this
container may fetch; a sibling reader confirmed that a CDN curl returns CONNECT 403. So I cannot say
whether any of these creators appears on camera.

---

## 2. The facts, graded

The date is decoded from the video id (`id >> 32`, in Unix seconds). `createTime` is shown next to it:
the two agree to within 30 seconds in every case. In the tables, "saves" is `collectCount`.

### 2.1 The five videos with counts, ranked by plays

| Rank | Video | Date (id>>32, UTC) | Plays | Likes | Saves | Shares | Comments | Duration | Account followers / likes / videos |
|---|---|---|---|---|---|---|---|---|---|
| 1 | @conversion.doc 7430511437199543584 | 2024-10-27 17:39 | **83,200** | 8,521 | 3,649 | 1,115 | 45 | 64 s | 242,000 / 2,000,000 / 152 |
| 2 | @ahormozi 7336007528070958382 | 2024-02-16 01:35 | 5,675 | 249 | 103 | 9 | 8 | 21 s | 1,800,000 / 34,200,000 / 5,123 |
| 3 | @pm_alliance 7441618513669655864 | 2024-11-26 16:00 | 732 | 9 | 1 | 0 | 0 | 56 s | 277 / 1,628 / 198 |
| 4 | @revelloughlin 7541753741691653384 | 2025-08-23 12:16 | 355 | 17 | 9 | 3 | 1 | 154 s | 30,800 / 1,100,000 / 1,289 |
| 5 | @saas_cmo_pro 7406413784123723050 | 2024-08-23 19:08 | 22 | 2 | 0 | 0 | 0 | 8 s | 165 / 885 / 150 |

All figures are **rendered**, from `itemStruct.statsV2` and `itemStruct.authorStatsV2` in each
`tt-video-*.html`. For example, the conversion.doc page contains `"playCount":83200` and
`"collectCount":"3649"`, and the Hormozi page contains `"playCount":5675` and `"followerCount":1800000`.

Ratios (grade **none**: my arithmetic on the rendered counts):
- **@conversion.doc:** likes are 10.2% of plays, saves 4.4% and shares 1.3%. Plays equal 34% of the follower count.
- **@ahormozi:** likes 4.4%, saves 1.8%. Plays equal **0.3%** of the follower count, so this value-equation clip reached a sliver of his audience.
- **@revelloughlin:** likes 4.8%, saves 2.5%. Plays equal 1.2% of followers.

The one pricing video was saved as reference material far more often than the offer-framework
video. That is attention, not sales.

AI and ad labels (**rendered**): all five have `"IsAigc":false`, an empty `"AIGCDescription"` and
`"isAd":false`. `locationCreated` is US, DE, GB, AU and US, in table order. **None of these creators
is Israeli.** Whether their lessons transfer to Hebrew-speaking buyers is untested (none).

### 2.2 Per video: caption verbatim, date, counts, and the lesson it states

**F1. @ahormozi, "Alex Hormozi". https://www.tiktok.com/@ahormozi/video/7336007528070958382, 2024-02-16.**
- Caption (`itemStruct.desc`, also the oEmbed `title`), **rendered**: "The Value Equation: Dream outcome + Perceived Likelihood of Achieving ÷ Time delay + Effort and Sacrifice = Value"
- On-screen sticker (`stickersOnItem`), **rendered**: `"stickerText":["The Value Equation"]`.
- Counts: 5,675 plays and 249 likes (see the table). Duration 21 s. The audio is `"original sound"` by the creator.
- Bio (`author.signature`), **rendered**: "Get your free scaling roadmap here 👇". The one call to action on a 1.8M-follower account is a **free** item. The `bioLink` field is absent from the video-page JSON, so where that link leads (and whether it ends in a call) is unknown (none).
- **Lesson stated:** value goes up with the dream outcome and the perceived likelihood of achieving it, and down with the time delay and the effort and sacrifice. The caption uses "+" and "÷". It is ambiguous as arithmetic, but the direction of each term is clear. The multiplied form, (outcome × likelihood) ÷ (time × effort), is from his book and appears in **no** capture (none).
- **Not in the capture:** guarantees, risk reversal, naming, pricing. The auto-caption file would show whether the spoken audio adds more (section 5).

**F2. @conversion.doc, "The Conversion Doc". https://www.tiktok.com/@conversion.doc/video/7430511437199543584, 2024-10-27.**
- Caption, **rendered**: "The Price Anchor.  Effective business and pricing strategy. #marketingnotiktok #neuromarketing #onlinemarketing #psychology #dropshipping #ecom #onlinebusiness #shopify #mindset "
- Counts: 83,200 plays, 8,521 likes, 3,649 saves and 1,115 shares. Duration 64 s. This is **the most-watched video in the family**.
- Bio, **rendered**: "Psychology-Backed Marketing Agency\nWe create content that gets attention - and Brands that get chosen.\n👇 Book a Call to work together." **The creator's own close is a human sales call.**
- **Lesson stated:** only the tactic's name, "price anchor". The caption does not say what to anchor against or how. The method is in the audio, which I have not heard.

**F3. @pm_alliance, "Product Marketing Alliance". https://www.tiktok.com/@pm_alliance/video/7441618513669655864, 2024-11-26.**
- Caption, **rendered**: "Offering a free trial sounds like a great way to attract customers, but what happens when they binge the content and bounce? Collin Mayjack shares the struggles of turning free users into paying customers. #productmarketing #freetrial #conversion #freemium #marketingstrategy #SaaS #fyp #thoughts"
- Counts: 732 plays, 9 likes, 1 save. Duration 56 s. It has an auto-caption file.
- Bio, **rendered**: "Product marketing insights from PMMs💡\nhttps://www.productmarketingalliance.com".
- **Lesson stated:** a problem, not a fix. Free users consume the free value and leave without paying. The caption offers no solution.

**F4. @revelloughlin, "Revel Loughlin". https://www.tiktok.com/@revelloughlin/video/7541753741691653384, 2025-08-23.**
- Caption, **rendered**: "Using Alex Hormozi's $100 offers: value equation in Facebook ads. Most people fall short on the \"perceived likelihood of achievement\" box. I address this with ad-types such as: 1. Skillshow - show people how skilled you are, stop telling them. 2. Written review or phone call testimonial ad-types - formatted in a way that feels like an authentic conversation (and not some client blowing smoke up your 🍑)"
- Counts: 355 plays and 17 likes. Duration 154 s. There is no caption file (`"noCaptionReason":1`).
- Bio, **rendered**: "Lead Generation 13+ years\nQuestions answered on IG 👇". His follow-up runs through Instagram DMs.
- **Lesson stated:** of the four value-equation terms, perceived likelihood is where most offers fall short. Raise it by demonstrating skill rather than claiming it, and with testimonials.

**F5. @saas_cmo_pro, "SaaS CMO Pro". https://www.tiktok.com/@saas_cmo_pro/video/7406413784123723050, 2024-08-23.**
- Caption, **rendered**: "When the freemium model actually works."
- Counts: 22 plays and 2 likes. The clip is 8 s long and 672×576, which is not the vertical format.
- TikTok labels it `"diversificationLabels":["Movies & TV works","Entertainment Culture","Entertainment"]` with `CategoryType` 101; the other four are labelled "Business & Finance" / "Education". The caption record has `"hasOriginalAudio":false` and `"noCaptionReason":3`, so no speech was transcribed.
- **Lesson stated: none.** The caption names a topic and states no condition. My inference, grade none, is that the clip is a reaction meme.

**F6. @salestipstok, "Learn B2B Sales, Leslie Venetz". https://www.tiktok.com/@salestipstok/video/7337845679101922602, 2024-02-21 00:28.**
- Caption (oEmbed `title`), **rendered**: "Steal this B2B email subject line to skyrocket your email open rates. If you are sending cold sales emails, use this template to earn the right to your prospects attention by making a deposit before and ask. #emailsubjectlines #coldemail #addyours #salestips #salestipstok "
- There are no counts: only oEmbed was captured.
- **Lesson stated:** earn attention by giving value (a "deposit") before making a request. The context is **cold** B2B email, and the subject line itself is not in the caption.

**F7. @russellbrunson, "Russell Brunson". https://www.tiktok.com/@russellbrunson/video/7276124634834275630, 2023-09-07 16:39.**
- Caption, **rendered**: "You NEED to include these 3 things in every email and sales letter you send… #marketingdigital #entrepreneurtok #salestips #russellbrunson #clickfunnels "
- **Lesson stated:** that three required elements exist. The caption does not name them.

**F8. @geoffketterer, "Geoff K | Sales Management". https://www.tiktok.com/@geoffketterer/video/7431531457396477216, 2024-10-30 11:37.**
- Caption, **rendered**: "3 step Objection handling framework to close any sales. #salestips #salespsychology #objectionhandling #remoteclosing "
- **Lesson stated:** that a three-step framework exists. The steps are not in the caption. The `#remoteclosing` tag places it in live closing on calls.

**F9. @copyfolioapp, "Copyfolio | Portfolio Websites". https://www.tiktok.com/@copyfolioapp/video/7216736475889667354, 2023-03-31 15:43.**
- Caption, **rendered**: "You don't have to write a full-blown sales letter to create a convincing sales page writing sample ☝️ As long as you can show that you write witty, attention-grabbing copy and can lead the readers through the page with a well thought-out structure, you'll be good to go. 👉 Choose a product or service for your sample and study its target audience. Then write a shorter example sales page that includes their pain point and your solution. Present your (or the brand's) credentials to make the sale in the end. #writingsamples #writingportfolio #salespagecopy #salespagetips "
- The music (in the oEmbed `html`) is "♬ Aesthetic - Tollan Kim", a licensed track rather than an original voice. That hints at a text-on-screen format from a brand account (inference, none).
- **Lesson stated:** a short sales page runs audience → pain point → solution → credentials → the sale. **Context: this is advice for a copywriter's portfolio sample, not a page tested on buyers.**

### 2.3 Repo state the lessons land on (repo grade, read-only)

- `products/il-biz-tools/invoice.html` line 109 opens `<section class="card pro-box" id="pro">`, after the invoice form. The ask follows the value, which confirms the critic.
- Today the button is `id="pro-cta" disabled` with the label "בקרוב", and the note (line 114) says the shop has not opened yet.
- The only one-time-payment sentence, "הרישיון הוא תשלום חד-פעמי, בלי מנוי", is at **line 135**, inside the collapsed `<details id="pro-privacy">` that opens at line 129.
- No ₪ price appears in the Pro box.
- `products/il-biz-tools/pcn874.html` has no Pro or Gumroad mention.

---

## 3. The lessons

"Fits" means it works for a faceless brand with no customer contact, at ₪0, and honestly
(MISSION §1: the owner never talks to customers; §4: no fake reviews, no manipulation). "Needs a
human" means someone has to talk to a buyer, and that is **rejected under the mandate**.

| # | Lesson | Source | Grade | Self-serve or needs a human? | Fits? |
|---|---|---|---|---|---|
| L1 | **Value equation as a copy checklist.** Every sentence on an offer should raise the dream outcome or the perceived likelihood, or cut the time delay or the effort and sacrifice. | F1, @ahormozi 7336007528070958382 | rendered (caption) | Self-serve | **Yes.** State deliverables, not outcomes we cannot evidence. For the Pro box: outcome = your logo and colour on the printed document; time = when the key arrives (check whether the licence key is shown at checkout or only in the receipt before writing "instant"; this is scout 8's open question); effort = one payment, no subscription, no account. The price is not visible today (§2.3), which leaves the effort term unanswered. |
| L2 | **Perceived likelihood is the weak term; raise it by showing, not telling** (the "Skillshow"). | F4, @revelloughlin 7541753741691653384 | rendered (caption) | Self-serve for the show. His **testimonial half needs customers** (phone-call testimonials) and his channel is paid ads. | **The show fits.** It supports the try-before-you-pay preview of the user's own branded document (scout 8's tactic, now caption-grade rendered). **Rejected:** paid ads (`docs/REJECTED.md`, "Paid advertising, at any budget"); testimonials "formatted in a way that feels like an authentic conversation" (we have none, and engineered authenticity deceives buyers); DM follow-up ("Questions answered on IG"). |
| L3 | **Deposit before the ask.** Give real value before any request. | F6, @salestipstok 7337845679101922602 | rendered (caption) | His version is **cold outbound email**. That is not a call, but it is unsolicited contact with strangers. | **The principle fits; the channel does not.** Cold email is rejected: Israeli §30א needs prior written opt-in consent (repo: `research/colony-sweep/scouts/distribution--email-acquisition.md` §1). Self-serve form: the free result first, then one ask. That is already the invoice page's order (§2.3). |
| L4 | **Short sales-page skeleton:** study the audience → pain point → solution → credentials → the sale. | F9, @copyfolioapp 7216736475889667354 | rendered (caption); context is a portfolio sample, not a tested page | Self-serve | **Yes.** Faceless credentials must be impersonal and checkable: the official spec cited, open code, the test suite, "works without signing up". Never testimonials we do not have. |
| L5 | **"3 things in every email and sales letter."** | F7, @russellbrunson 7276124634834275630 | rendered caption; **content none** | Would be self-serve | **Unusable until the transcript is read.** From general knowledge, his published framework elsewhere is "hook, story, offer". That is grade none and must not be attributed to this video. |
| L6 | **Three-step objection framework to "close any sales"** (`#remoteclosing`). | F8, @geoffketterer 7431531457396477216 | rendered caption; steps none | **Needs a human on a call → REJECTED.** | **Only a written adaptation fits:** answer likely objections before they are raised, in a pricing FAQ ("why pay if the free tool works?", "is my data uploaded?", "is this official?", "refund?"). The adaptation is my reasoning (none). Refund answers must match what Gumroad and our token can actually do (scout 8, github). |
| L7 | **Price anchoring** gets attention: 83,200 plays and 3,649 saves, the top video here. | F2, @conversion.doc 7430511437199543584 | rendered caption and counts; **method none** | Self-serve as a page element. The creator's own close ("👇 Book a Call") **needs a human → rejected.** | **Only the honest form fits:** one real price, stated once, next to a true reference point. A fake "was" price or a permanent crossed-out discount is rejected (MISSION §4; the Gumroad crossed-out mechanism is scout 8's github finding, not re-read here). What this creator actually recommends is unknown until the transcript is read. |
| L8 | **The free-to-paid failure mode:** free users "binge the content and bounce". | F3, @pm_alliance 7441618513669655864 | rendered caption (a problem only) | Self-serve | **Yes, as a design warning.** Our free tools are free by promise (invoice.html line 111), so the ask has to sit where the paid feature is visibly missing (after printing an unbranded document), shown once and never blocking. That placement is my reasoning (none); scout 8 proposed the same thing. |
| L9 | **One free thing as the profile's single call to action.** | F1 bio: "Get your free scaling roadmap here 👇" | rendered (bio) | Self-serve. Where his roadmap leads is unknown. | **Yes, the pattern fits:** the brand's one link points at a free tool, and the paid step lives on that page. Not the conversion.doc or revelloughlin pattern (call or DM). |
| L10 | **Reference content gets saved.** The pricing clip's save rate (4.4%) is 2.4× the value-equation clip's (1.8%). | F1 and F2 counts | none (arithmetic on rendered counts) | n/a | Weak signal. It measures attention, not sales, and the sample is two videos. It suggests only that checklist- or table-style content is what viewers keep. |
| L11 | **Freemium "works when…"** | F5, @saas_cmo_pro | rendered caption, **no lesson** | n/a | **Discard.** Nothing is stated. |
| L12 | **Naming and guarantee types** (Hormozi's other offer levers). | none of the captures | none | — | **No evidence here.** Scout 8's Gumroad refund facts (github) remain the only basis for any guarantee. Do not advertise one until a refund can be processed without the owner (scout 8, open questions 1-4). |

**Closing without a salesperson.** None of the rendered creators close without one. Two of them end
in a human channel ("Book a Call", "Questions answered on IG"), and one sells live remote closing.
From these captures, the self-serve close can be assembled from these pieces:
- one visible real price and deliverable (L1);
- a preview that shows rather than tells (L2);
- the ask placed after value (L3, L8);
- a short page skeleton with checkable credentials (L4);
- objections answered in writing (L6, adapted).

The assembly is my synthesis (none). None of the creators demonstrates it working.

**Needs a human, rejected under the mandate:**
- live objection handling and remote closing (F8);
- a booked sales call as the close (F2's bio);
- DM follow-up (F4's bio);
- phone-call testimonials (F4);
- cold email outreach (F6's channel; unsolicited, not opt-in).

---

## 4. Scout claims: confirmed, corrected, refuted

| Stage-1 claim | Who | Verdict | Evidence |
|---|---|---|---|
| @salestipstok teaches "earn the right to your prospects attention by making a deposit before and ask" in a B2B cold-email subject-line video | Scout 2 | **Confirmed** | oEmbed `title` (rendered). Its date, 2024-02-21, is decoded here. |
| @russellbrunson: "You NEED to include these 3 things in every email and sales letter"; the three are not in the caption | Scouts 2 and critic | **Confirmed.** The three are still unknown. | oEmbed `title` (rendered). |
| @geoffketterer: "3 step Objection handling framework to close any sales"; the steps are not visible; all of it assumes a human on a call | Scout 2 | **Confirmed.** `#remoteclosing` in the caption strengthens the live-call reading. | oEmbed `title` (rendered). The niche "high-ticket" is not in the capture: `author_name` is "Geoff K \| Sales Management". **Unverified.** |
| @copyfolioapp's caption gives the full recipe: pain point, then solution, then credentials, then the sale / call to action | Scout 2 | **Confirmed, with a correction.** The skeleton is verbatim, but (a) it starts with "study its target audience"; (b) it is advice for a **copywriter's portfolio writing sample**, not a buyer-tested sales page; (c) no separate call to action is named: the credentials "make the sale in the end". | oEmbed `title` (rendered). |
| @ahormozi's caption is "Dream outcome + Perceived Likelihood of Achieving ÷ Time delay + Effort and Sacrifice = Value" (operators + and ÷); exact form unverified | Scout 8 | **Confirmed, now rendered**, and the caption form is no longer unverified. The multiplied book form is still in no capture (none). | `itemStruct.desc`, oEmbed `title`, and `stickersOnItem` "The Value Equation". |
| None of the captions covered Hormozi's guarantee, risk reversal or naming | Scout 8 | **Confirmed.** The rendered caption carries only the equation, and the discover page yields no other videos. | Section 1. |
| The critic says "the biggest names in TikTok sales education (for example Hormozi on offers) are absent" | Critic | **Partly filled.** One Hormozi video is now rendered. His account is large (1.8M followers, 34.2M likes), but this clip reached 5,675 plays, 0.3% of followers. | `authorStatsV2`, `statsV2` (rendered). |
| @revelloughlin: most fall short on "perceived likelihood of achievement"; the fixes are a Skillshow and testimonial ads "formatted in a way that feels like an authentic conversation" | Scout 8 | **Confirmed verbatim.** | `itemStruct.desc` (rendered). |
| @revelloughlin's niche: "Paid-ads copy built on Hormozi's value equation, using ChatGPT prompts"; his other captions use comment-to-get ("Comment \"Offer\" below…") | Scout 8 | **Partly unverified.** The rendered bio says "Lead Generation 13+ years", and this caption does cover Facebook ads. "ChatGPT prompts" and comment-to-get (video 7390164470212971783) are in no capture of this family, so they **stay snippet**. | `author.signature` (rendered). |
| @conversion.doc "The Price Anchor" caption; niche "Neuromarketing and e-commerce conversion" | Scout 8 | **Confirmed.** The hashtags `#neuromarketing #ecom #shopify #dropshipping` and the bio "Psychology-Backed Marketing Agency" support it. | `itemStruct.desc`, `author.signature` (rendered). |
| Pricing-psychology snippets ("$900 jacket" makes a "$160 polo" feel reasonable; crossed-out "original" price; charm pricing), listed with @conversion.doc's URL as a source | Scout 8 | **Refuted as attribution to this video.** None of that text is in the capture (`grep -i 'polo\|jacket\|$900'` hits only an unrelated UI string), and the caption states no method. Scout 8 had marked the attribution "low". It stays unattributed snippet. | `tt-video-conversion-doc-7430511437199543584.html`. |
| @pm_alliance: free users "binge the content and bounce"; "the exact free-to-paid problem il-biz-tools has" | Scout 8 | **Caption confirmed verbatim.** **Corrected on weight:** it states a problem with no fix, and it had 732 plays on a 277-follower account. It is thin support for any specific tactic. | `itemStruct.desc`, `statsV2` (rendered). |
| @saas_cmo_pro "When the freemium model actually works": "only the titles were seen; the lesson needs the caption" | Scout 8 | **Refuted as a lesson source.** The caption is the whole title. The clip is 8 s, non-vertical, labelled "Movies & TV works"/"Entertainment", with no transcribable speech and 22 plays. There is no lesson to extract. | `desc`, `diversificationLabels`, `claInfo.noCaptionReason` 3 (rendered). |
| #saas tag snippet "Low-ticket conversion friction = no adoption" | Scout 8 | **Not settled.** The tag capture contains no items at all ("friction" has 0 hits). It stays unattributed snippet. Scout 8's moment-of-need tactic loses this leg and rests on F3 plus reasoning. | `tt-src-tiktok-com-tag-saas-lang-en.html`. |
| The discover page "may list more Hormozi offer videos with IDs, including any on guarantees" | Scout 8 | **Refuted for a plain GET render.** The server HTML carries only the keyword record, and the list loads client-side. | `webapp.kap-detail.wordDetail`, `kap.init.config` (rendered). |
| @nickmacsocial as a fallback "if the Hormozi caption comes back thin" | Scout 8 | **Not better.** Its caption does not name the four terms (1,147 plays). The Hormozi caption itself is complete. | Adjacent capture, `itemStruct.desc` (rendered). |
| Value-equation rewrite and try-before-buy preview tactics (graded snippet by scout 8) | Scout 8 | **Upgraded:** the TikTok legs are now rendered captions (F1, F4). The repo leg is **confirmed with a line correction:** "תשלום חד-פעמי, בלי מנוי" is at invoice.html line **135**, inside `#pro-privacy` (which opens at line 129). The button currently reads "בקרוב" (disabled). | invoice.html lines 109-135 (repo). |
| "Written selling" is the usable half; live selling (cold calling, remote closing) conflicts with the owner's rule | Scout 2 | **Confirmed.** Among the rendered creators, the closes are a call (F2), a DM (F4) and live closing (F8). | Bios and captions (rendered). |
| "Every TikTok claim here comes from a search-result title or snippet" | Scout 2 | **Superseded** for the nine videos in this family: the captions are now rendered. The lessons in the audio are still unheard. | Section 1. |

---

## 5. URLs worth rendering next (all seen in a capture)

1. **Auto-caption (WebVTT) files: the words the videos actually say.** They are signed and expire **2026-09-30 about 21:03 UTC** (`expire` 1790802190 / 1790802242 / 1790802237). If they are not fetched in time, re-render the video page to get fresh links. They come from `itemStruct.video.claInfo.captionInfos[0].url`, which is the same as `subtitleInfos[0].Url`:
   - Hormozi, value equation: `https://v16m-webapp.tiktokcdn-us.com/ca18bb66eee17d62d0fc773e97b3898e/6abd790e/video/tos/useast5/tos-useast5-v-0068-tx/8b23e22adf4d4fa9a6a19335b6268ddc/?a=1988&bti=ODszNWYuMDE6&&bt=998&ft=aEKq_qT0mIoPD12jud1I3wUkfnAbMeF~O5&mime_type=video_mp4&rc=M3U7Z3U5cnZlcTMzZzczNEBpM3U7Z3U5cnZlcTMzZzczNEBebXBeMmQ0azRgLS1kMS9zYSNebXBeMmQ0azRgLS1kMS9zcw%3D%3D&l=20260928210248435BE9BF9E4B8A31E081&btag=e00078000`
   - conversion.doc, price anchor: `https://v16m-webapp.tiktokcdn-us.com/2a61d72d733b1ecb67fe1a2097e2a8da/6abd7942/video/tos/useast5/tos-useast5-v-0068c799-tx/4ad9008cd0534c978d46108d3e6c7c70/?a=1988&bti=ODszNWYuMDE6&&bt=505&ft=aEKq_qT0mIoPD1229d1I3wUuiLAbMeF~O5&mime_type=video_mp4&rc=MzlpOGs5cjk6djMzZjczM0BpMzlpOGs5cjk6djMzZjczM0BvcWxuMmQ0aGNgLS1kMWNzYSNvcWxuMmQ0aGNgLS1kMWNzcw%3D%3D&l=20260928210257D023BD3F4FE8E2A6AE33&btag=e00050000`
   - pm_alliance, binge and bounce: `https://v16m-webapp.tiktokcdn-us.com/b77af28095b255b325b4454176558dcc/6abd793d/video/tos/useast5/tos-useast5-v-0068c799-tx/a7e047f162a14c45b53f6e70cc7ea1a6/?a=1988&bti=ODszNWYuMDE6&&bt=589&ft=aEKq_qT0mIoPD12Y9d1I3wU_f_AbMeF~O5&mime_type=video_mp4&rc=MzM7NHE5cnR4dzMzNzgzM0BpMzM7NHE5cnR4dzMzNzgzM0AwcmlfMmRrci9gLS1kLzZzYSMwcmlfMmRrci9gLS1kLzZzcw%3D%3D&l=202609282103007B075394D4F18C789A2D&btag=e00048000`
2. **The video pages of the oEmbed-only videos.** Each page gives counts and, where TikTok made one, a caption-file link. The URLs are from each oEmbed `html` `cite`:
   - https://www.tiktok.com/@russellbrunson/video/7276124634834275630 (the "3 things")
   - https://www.tiktok.com/@geoffketterer/video/7431531457396477216 (the 3 steps, for the written FAQ adaptation)
   - https://www.tiktok.com/@salestipstok/video/7337845679101922602 (the subject line itself)
   - https://www.tiktok.com/@copyfolioapp/video/7216736475889667354 (low priority: the caption is already complete)
3. **Profile pages, for the end of each funnel.** The `bioLink` field is absent from the video JSON. The URLs are from the oEmbed `author_url`:
   - https://www.tiktok.com/@ahormozi: where "your free scaling roadmap" leads.
   - https://www.tiktok.com/@conversion.doc: the "Book a Call" destination, only to confirm the rejection.
4. **Low priority:** https://www.productmarketingalliance.com, from the @pm_alliance `author.signature`. It may hold the written version of the free-trial talk.

**Do not re-render** `https://www.tiktok.com/discover/value-equation-hormozi` or
`https://www.tiktok.com/tag/saas?lang=en` with the same plain GET. Both captures show that their
lists load client-side, so a repeat will come back empty again.
