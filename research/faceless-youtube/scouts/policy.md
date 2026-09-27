# Scout report — policy: is one AI-made faceless channel inside YouTube monetization policy?

**Scout:** policy (faceless-youtube reassessment of the owner's 25.9.2026 reel). **Date:** 2026-09-25.
**Question:** Does one faceless channel with AI-written scripts, synthetic narration and stock/AI visuals
fall inside or outside YouTube monetization policy, and exactly what must it do to be clearly inside?
**Search budget:** 5 of 5 WebSearch calls used. Everything load-bearing below comes from pages rendered
on a GitHub runner today or from a verbatim policy archive on GitHub. None of it rests on search snippets.

## Grades used

- **RENDERED**: primary page text I read. Two kinds:
  - `[RENDERED research/rendered/<file>:<line>]`: YouTube's own page, fetched by `render-watch.yml` on
    2026-09-25 (`fetchedAt` 14:48Z, status 200, not truncated).
  - `[RENDERED-ARCHIVE OTA <doc>@<sha>:<line>]`: **Open Terms Archive** (`github.com/OpenTermsArchive/vlopses-us-versions`),
    a public-interest project that stores a verbatim capture of YouTube's policy pages in git every time
    they change. I downloaded the file versions from `raw.githubusercontent.com` and diffed them myself.
    The archive dates are **capture dates, not YouTube's publication dates**. To check the archive, I
    compared the OTA text of the three July 2026 monetization sections with our own 2026-09-25 render.
    They are word-for-word identical. One archive artifact to know about: OTA's extraction repeats the
    impersonation-policy opening paragraph at the top of many unrelated Community Guidelines sections
    (for example line 1577, inside "Illegal or regulated goods"). I cite only lines inside the section
    they belong to.
- **CODE**: a repo file I read (it keeps the grade its author gave it).
- **SNIPPET**: search-result text only. It is weaker evidence, and I name who published it and whether they sell something.
- **INFERENCE**: my reasoning. **UNKNOWN**: not established.

---

## 0. The answer in five lines

1. **The reel, done as written, is outside policy on three separate monetization rules**, and at any
   volume it moves into **Community Guidelines spam**, where the penalty is strikes and termination
   rather than lost ad money. The three collisions:
   - an RPM > $7 niche (finance, insurance, health, legal) narrated by a synthetic voice runs into the
     **July 2026 "AI Personas Related to Sensitive Topics" rule**;
   - "model a viral competitor's script" runs into **"mimics existing formats or stories"**;
   - a daily template calendar with stock footage, AI clips and AI narration runs into **"AI-generated
     content made with generic or unoriginal templates"**.
2. **The policy has tightened twice since the 2026-09-03 rejection was researched, and never loosened.**
   In July 2025 the policy did not contain the word "AI". A capture dated 2 June 2026 adds an AI-specific
   template ban to the monetization policy and a new Community Guidelines spam item, "Automated or
   synthetic mass-production". A capture dated 14 July 2026 adds the AI-persona ban and the
   "unsatisfying" category. The old rejection's premise is **stronger now**, not weaker.
3. **AI narration is not banned as such.** No rule disqualifies synthetic voice by itself. It is a risk
   signal that YouTube's own spam example names word for word: "each video reading out an AI-generated script".
4. **Disclosure is required for the Sora 2 clips (any photorealistic scene) and for AI-generated music.**
   YouTube says disclosure "won't limit a video's audience or impact its eligibility to earn money". It is
   cheap, and it does not protect a channel from any other rule.
5. **"Clearly inside" is achievable only for a narrow variant.** Every allowed example in the text treats
   AI as a tool used by a creator who has "original, authentic insights or perspective". No text says
   whether an unattended agent counts as that creator. The narrow variant is: not a sensitive topic, no
   persona, each video built on original analysis with distinct substance, disclosed AI production,
   low cadence, one channel. **The residual risk is the reviewer's judgment, and a failure is sticky and
   personal to the owner** (see §6).

---

## 1. The monetization rules, verbatim (current page, rendered 2026-09-25)

Source: `research/rendered/youtube-monetization-policies.txt`
(https://support.google.com/youtube/answer/1311392, fetchedAt 2026-09-25T14:48:17Z).

### 1.1 The headline test

> "If you're making money on YouTube, your content should be original and "authentic." This means that we expect your content to: Be your original creation. If you borrow content from someone else, you need to change it significantly to make it your own. Not be mass-produced, generic, repetitive, or manipulative. It should be made for the enjoyment or education of viewers, rather than for the sole purpose of getting views." [RENDERED research/rendered/youtube-monetization-policies.txt:80-84]

What the reviewers look at: "Main theme · Most viewed videos · Newest videos · Biggest proportion of
watch time · Video metadata (including titles, thumbnails, and descriptions) · Channel's "About"
section". [RENDERED …monetization-policies.txt:86-98]

### 1.2 Generic or repetitive content (the category the July 2025 changelog called "inauthentic content")

> "Generic or repetitive content includes content that looks like it's made with a template, or that may feel repetitive to viewers after watching several videos in a row from the same channel." [RENDERED …monetization-policies.txt:114]

> "We know many channels create content that follows a similar pattern. What's important is that the substance of each video should be materially varied and deliver creative, educational, or other value." [RENDERED …:120]

Allowed: "Same intro and outro for your videos, but the bulk of your content is different" and "Similar
content, like a series following a set of characters across episodes or a channel that does product
reviews, but in which each video has a distinct storyline, focus, or concept". [RENDERED …:124-126]

> "That means channels where content feels interchangeable from video to video are not allowed to monetize. In other words, your channel shouldn't have content that appears to be produced using a template or where each video doesn't deliver creative, educational, or other value to the viewer." [RENDERED …:130]

Not allowed (list is not exhaustive) [RENDERED …:134-140]:
- "Similar or repetitive content with low educational value, commentary, narratives, or minimal variation across videos"
- "Videos where characters are put in the same situation over and over again with the same outcome (i.e., using a highly similar storyline template across multiple videos)"
- "Image slideshows, templated storylines, or scrolling text with minimal or no narrative, commentary, or educational value"
- **"AI-generated content made with generic or unoriginal templates giving the impression of mass production without adding the creator's original, authentic insights or perspective"**

**What the three phrases mean for this plan (INFERENCE from the text above):**
- **"made with a template"**: the test is what the viewer sees, not how the video was produced:
  "may feel repetitive to viewers after watching several videos in a row". A shared intro/outro is
  expressly fine. A shared *substance skeleton* is not: the same hook shape, the same list-of-N
  structure, the same stock-footage rhythm, the same music, the same narrator cadence. Reel prompt 3
  (one retention-optimised script shape) plus prompt 5 (a 30-day calendar) produce exactly that
  skeleton by design.
- **"minimal variation across videos"**: this means variation of *substance*. Swapping the topic noun
  inside the same script is the "slight variation" the older text named: "channels where content is
  only slightly different from video to video" [RENDERED-ARCHIVE OTA Content Monetisation Policy@36fc028:68].
- **"low educational value"**: on the rule's own wording this is a conjunction. Repetition *with* low
  value fails; a consistent series in which each video teaches something distinct is the allowed
  "series … distinct … focus, or concept". So one question per video is the unit of compliance: does
  this video teach something none of our previous videos taught, and that a viewer could not get by
  reading one web page aloud (see §1.3, :204)?
- **"the creator's original, authentic insights or perspective"**: this is the crux for an owner-free
  channel, and §5 covers it.

### 1.3 Reused content (unchanged since 2025; it bites on stock footage and on "model a competitor")

> "Reused content refers to channels that repurpose content that's already on YouTube or another online source without adding significant original commentary, substantive modifications, or educational or entertainment value. Reused content may also be known as duplicative or scraped content (taking unique or original content from other websites and publishing it as your own)." [RENDERED …:144]

> "Our reused content policy applies to your channel as a whole. If you have videos that violate our guidelines, or if we cannot clearly tell that you made the content, monetization may be removed from your entire channel." [RENDERED …:156]

> "Taking someone else's content, making minimal changes, and calling it your own original work would be a violation of this guideline. If we cannot tell that the content is yours, it may be subject to our reused content policy. **This policy applies even if you have permission from the original creator.** Reused content is separate from YouTube's Copyright enforcement, which means it's not based on copyright, permission, or fair use." [RENDERED …:186]

Relevant not-allowed items: "Content uploaded many times by other creators" [:196]; "Content downloaded
or copied from another online source without any substantive modifications" [:200]; **"Content that
exclusively features readings of other materials you did not originally create, like text from websites
or news feeds"** [:204]. Relevant allowed item: "Reused content from other online sources where the
creator is either visible in the content **or explains how the creator added to the content**" [:180].

INFERENCE: **a stock-footage licence is not a defence** (":186 … even if you have permission"). Stock
footage is acceptable when it is B-roll under narration that is substantive and original. A popular
free clip also appears in thousands of other faceless videos, which is ":196 content uploaded many
times by other creators". The faceless-channel escape hatch at :180 exists, and a faceless channel can
only use it by *explaining how it made the content*, in the About section and in descriptions.

### 1.4 Unsatisfying or off-putting content (new category, captured 2026-07-14)

> "Unsatisfying or off-putting content refers to content that relies heavily on emotionally manipulative formulas, **mimics existing formats or stories to a degree that the videos feel interchangeable**, or appears designed to shock or surprise viewers for the sole purpose of getting views." [RENDERED …:210]

> "If you use automated tools or templates to help create your content, the final product must still demonstrate your creative vision and provide educational or entertainment value." [RENDERED …:216]

Allowed: "Content that showcases your authentic perspective when building on a popular video format or
theme …"; "Content that utilizes creative tools to assist in delivering a unique, well-researched, or
creative narrative, like using AI to edit your video scripts or generate a unique background visual for
your content". [RENDERED …:222, :226]
Not allowed: "Content that lacks a clear narrative arc or logical progression, such as videos that
stitch together unrelated or inconsistent AI clips to surprise or shock viewers"; "Content that uses
deceptive or misleading imagery or narratives, such as realistic visuals tricking viewers into believing
a fake celebrity death or natural disaster has occurred". [RENDERED …:238, :240]

### 1.5 AI Personas Related to Sensitive Topics (new, captured 2026-07-14). **This is the rule the reel's niche prompt walks into.**

> "This policy refers to channels that use AI-generated personas to deliver information on sensitive topics. This includes any content that presents itself as a human expert providing advice to viewers on topics such as health, legal issues, finances, or politics. To protect viewers who may be confused or otherwise negatively impacted by this content, channels uploading this content will not be allowed to monetize." [RENDERED …:244]

Examples: "An AI "doctor" providing medical diagnoses, health advice, or wellness remedies"; **"AI-generated
podcast hosts offering financial guidance, investment tips, or wealth management advice"**; "AI personas
giving legal advice or interpreting laws". [RENDERED …:248-252]

INFERENCE: this rule works at channel level ("channels uploading this content will not be allowed to
monetize"). The topic list begins with "such as", so it is open-ended. The reel's prompt 1 filters for
RPM > $7. The repo's own (low-medium grade) RPM notes put finance at "$25–45" and "AI/education" at
"$9–14" [CODE research/tiktok/06-faceless-video-tooling.md:332, SEO-tier sources]. **So the
filter selects straight into the sensitive-topic set.** A realistic synthetic voice that gives personal
finance guidance with no disclosure is, on the plain words, "content that presents itself as a human
expert providing advice". A named host persona ("I'm Mark, ex-banker") is the named example. A
disclaimer does not cure it, because the rule targets the *form* (an AI persona that advises), not the
absence of a disclaimer.

### 1.6 Creator responsibility and integrity: why a failure is sticky

> "If you violate this policy, we may temporarily turn off your monetization or terminate your accounts. This may apply to all of your existing channels, any new channels you create, and channels that you appear on regularly." [RENDERED …:286]

> "If any of your channels have been demonetized or terminated, you should not create new (or use existing) channels to get around these restrictions, or apply to YPP with related channels during your suspension period. Doing so could lead to termination of all channels." [RENDERED …:288]

> "creators should not artificially inflate a channel's engagement … Similarly, creators should not encourage organic engagement on non-compliant content before deleting or obfuscating that content." [RENDERED …:296]

Money already earned is not safe either: "We may withhold or adjust any of your earnings associated with
violations … This may result in payment delays of up to 90 days" [RENDERED …:318-320]; "If your channel
is terminated or suspended from the YouTube Partner Program, you are no longer entitled to earn any
revenue." [RENDERED …:330]

---

## 2. Community Guidelines: the part that turns "demonetized" into "terminated"

This page was not in `research/rendered/`. It comes from the OTA archive (current file, byte-identical to
capture `4d29ee7`, recorded 2026-07-23). Spam Policy:

> "This policy applies to all types of content on YouTube, including unlisted and private content, comments, links, posts and thumbnails, and coordinated networks of channels." [RENDERED-ARCHIVE OTA Community Guidelines@4d29ee7:186]

> "6. **Automated or synthetic mass-production:** Using automated tools or AI to churn out high volumes of similar content with minimal changes. While testing out new creation tools or posting a few variations of a video is ok, we don't allow use of these tools to flood our platform with repetitive content. This includes coordinated mass-production and technical manipulation to bypass filters or trick viewers.
> **Example:** Channels that use the exact same background music and repetitive AI generated imagery across many videos, with each video reading out an AI-generated script." [RENDERED-ARCHIVE …@4d29ee7:203-204]

Also: "5. **Detection evasion:** Technical manipulation (such as speeding up audio, heavy filters, cropping)
designed to bypass abuse detection" [:201]; "7. **Scraped content:** Re-posting material from other
websites or platforms … without adding anything of your own" [:205]; **"8. Scams: Promoting "get rich
quick" investment schemes …"** [:207]; "9. **Malicious clickbait:** Using maliciously misleading titles,
thumbnails, descriptions, or imagery …" [:209]. Consequence: "we may suspend your monetization or
terminate your channel or account … If you get 3 strikes within 90 days, your channel may be terminated."

**The Spam item 6 example is a literal description of the default output of the MoneyPrinterTurbo
class** (one music bed, stock or AI imagery, an AI script read aloud; see
`research/tiktok/06-faceless-video-tooling.md` §1.2). A version captured before June 2026 already
listed "Autogenerated content that computers post without regard for quality or viewer experience" as
video spam [RENDERED-ARCHIVE OTA Community Guidelines@9f3e242:219]. The June 2026 rewrite made it
AI-specific.

Impersonation policy (same file): "It may also include using AI to copy the voice or likeness of an
individual, to make it appear as if the channel is owned or authorized by that individual" [:228];
not allowed: "Using AI to make it look like a famous person is willfully participating in your video
or endorsing a product" and "Copying someone else's videos and reposting them as your own without
changing anything or adding significant original commentary" [:259, :262]; and **"Creators should
disclose when content is generated or meaningfully altered with AI, but this disclosure is not a free
pass to impersonate a person, entity, or channel."** [:250]

Medical misinformation (relevant if the niche is health): "YouTube doesn't allow content that poses a
serious risk of egregious harm by spreading medical misinformation that contradicts local health
authority (LHA) guidance about specific health conditions and substances." [:1932]. The Community
Guidelines headings include no general *financial* misinformation policy. Finance exposure runs
through Scams (item 8), Impersonation, the AI-persona monetization rule, and national law (§4).
[INFERENCE from the heading list, lines 179-2079]

---

## 3. How the policy moved since the 2026-09-03 rejection (the timeline the old verdict did not have)

| Capture (OTA) | Change | Evidence |
|---|---|---|
| 2025-09-09 (first capture) | "Inauthentic Content … mass-produced or repetitive … made with a template with little to no variation … easily replicable at scale". **No mention of AI.** | RENDERED-ARCHIVE OTA Content Monetisation Policy@eec5862:44-66 |
| Between 2026-05-09 and 2026-06-02 | Monetization: adds **"AI-generated content made with generic templates giving the impression of mass production without adding the creator's original, authentic insights or perspective"**; "relatively varied" becomes **"materially varied"**; slideshows gain "templated storylines". | RENDERED-ARCHIVE diff 36fc028 → 9792a12 |
| Between 2026-05-20 and 2026-06-02 | Community Guidelines spam policy rewritten; adds **item 6, "Automated or synthetic mass-production"**, and makes the policy cover "coordinated networks of channels". | RENDERED-ARCHIVE diff 9f3e242 → 994fae0 |
| Between 2026-06-24 and 2026-07-14 | Monetization split into three categories: **Generic or Repetitive**, **Unsatisfying or Off-putting**, **AI Personas Related to Sensitive Topics**; "Not be mass-produced or repetitive" becomes "…generic, repetitive, or manipulative". | RENDERED-ARCHIVE diff 6cbbfba → 8653912; matches our render :80-252 word for word |
| Between 2026-07-14 and 2026-09-15 | Shorts policy: **"Starting February 1, 2027, to be eligible to earn a share of Shorts ad revenue from the Creator Pool … you will need to have at least 10 million qualified Shorts views in the last 90 days."** | RENDERED-ARCHIVE OTA Content Monetisation Policy@d78290d:305 (not in our render, which covers answer/1311392 only) |

Corroboration by snippet: TechCrunch (2026-07-20, independent news, sells nothing) reports the
clarifications "rolled out on July 16, 2026". That is two days *after* OTA's 07-14 capture, so one of
the two dates is off by a little. The same result adds "Any YouTube channel that has too much of any of
these three types of content will not be able to monetize." [SNIPPET]
A July 2025 snippet reports that "the word 'AI' does not appear in the policy" and quotes Rene Ritchie,
YouTube's Head of Editorial & Creator Liaison, calling it "a minor update … just clarifying"
[SNIPPET, fliki.ai / Social Media Today; fliki sells an AI video tool]. The archive confirms the
no-"AI" wording for 2025 and shows it is no longer true.

**One operational trap (INFERENCE).** Our 2026-09-25 render still opens with dated notices only for
2025-07-15, 2025-03-10 and 2022-03-03 [RENDERED …:62-66]. The June and July 2026 rewrites are on the page
with no dated banner. **The page's own banner cannot be relied on to detect a policy change.** Watch the
changelog (answer/10008196, linked from the page) or the OTA commit feed.

---

## 4. The reel's assets, one by one

### 4.1 Disclosure (`research/rendered/youtube-altered-synthetic-disclosure.txt`, answer/14328491, fetchedAt 2026-09-25)

The rule: "we require creators to disclose when they use AI to meaningfully alter or generate
photorealistic content", which covers content that "Makes a real person appear to say or do something
they didn't do", "Alters footage of a real event or place" or "Generates a realistic scene that didn't
actually occur". [RENDERED …disclosure.txt:63-71]

| Reel asset | Mandatory disclosure? | Basis |
|---|---|---|
| **Sora 2 clips, photorealistic** (reel prompt 4) | **Yes**, on every video containing one. | "Generates a realistic scene that didn't actually occur" [:71]; "AI generated extra footage of a real place" [:133] |
| Sora 2 clips, clearly non-realistic or animated | No | "Creators don't need to disclose non-realistic content that's made with AI" [:87]; "AI-generated or altered animation … in a fully animated video" [:97] |
| **AI-generated background music** | **Yes** (easy to miss) | "AI generated music" is the first listed example that must be disclosed [:131] |
| AI script, title, thumbnail, outline, captions, ideas | No | "Production assistance, like using generative AI tools to create or improve a video outline, script, thumbnail, title, or infographic"; "Caption creation"; "Idea generation" [:107-113] |
| **Synthetic narrator voice (TTS, not cloning a real person)** | **Not settled by the text.** The only voice exemption is "Cloning one's own voice to create voice overs or dubs" [:115]. A stock TTS voice is not one's own voice, and "AI content can include content that is fully or partially altered or created using any AI audio … tools. Realistic AI content and meaningful changes require disclosure" [:83]. | INFERENCE: treat a realistic AI narrator as disclosable; §4.2 says why that costs nothing. |
| Real stock footage (Pexels/Pixabay) used unaltered | No AI disclosure | It is not AI. Other rules still apply: "deceptive or misleading imagery or narratives" [monetization :240]; licence limits on identifiable people [CODE research/tiktok/06 §5.1, §5.4, medium grade] |
| A voice or likeness of a real person | Yes, and usually prohibited outright | [:67]; Impersonation policy (§2) |

**Automatic labelling and provenance.** "YouTube may automatically apply an AI label … for: Content made
using YouTube's GenAI tools; Content that contains C2PA metadata; Content that our internal systems
detect is AI generated or altered" [:177-183]; "content containing C2PA metadata, or content labeled after
manual review can not be adjusted" [:189]. Sora outputs carry C2PA metadata and, below the Pro tier, a
visible watermark [SNIPPET, several outlets and OpenAI's "Launching Sora responsibly" as a result title;
openai.com not rendered]. One of the search results was a *sponsored* "Tutorial: How to Strip C2PA
Metadata from Sora 2 Videos to Bypass Instagram's 'AI-Generated' Label". That is the trap in writing.
Stripping provenance to dodge a label runs into "Creators who consistently choose not to disclose …
may be subject to … removal of content or suspension from the YouTube Partner Program" [:193] and
"Detection evasion" [CG@4d29ee7:201]. It is also deception, which `MISSION.md` rule 4 forbids.

### 4.2 Does disclosure hurt money or reach?

> "Note: Disclosing AI content won't limit a video's audience or impact its eligibility to earn money." [RENDERED …disclosure.txt:173]

So disclosure costs nothing by YouTube's own statement. **It is also not a pass.** The monetization
template test and the Community Guidelines apply regardless ("this disclosure is not a free pass",
CG@4d29ee7:250). One reach headwind is separate from disclosure, and it matters for a faceless format:
The Hollywood Reporter (June 10, 2026 issue; independent trade press, sells nothing) reports, per the
search summary, that "YouTube's response has been to tweak its algorithm to favor videos with real human
faces on camera, which is hitting faceless creators even when their content is entirely human-made"
[SNIPPET; hollywoodreporter.com not rendered]. The disclosure page's sidebar also lists a separate
"Building trust on YouTube: 'Captured with a camera' disclosure" article [RENDERED …disclosure.txt:227]:
a positive trust label this channel can never carry. Whether it affects ranking: **UNKNOWN**.

### 4.3 Is AI voice-over narration itself monetizable?

- **Not prohibited per se.** No sentence in the current monetization policy or Community Guidelines
  disqualifies synthetic narration. [RENDERED, whole page read, :60-352; RENDERED-ARCHIVE CG]
- **It is named in the one AI-voice example YouTube gives of spam:** "the exact same background music
  and repetitive AI generated imagery across many videos, with each video reading out an AI-generated
  script" [RENDERED-ARCHIVE CG@4d29ee7:204]. The prohibited thing is the *combination* with sameness,
  not the voice.
- **In a sensitive niche it becomes a persona problem** (§1.5): a realistic AI voice delivering finance,
  health or legal guidance is the paradigm "AI persona".
- YouTube's Creator Liaison said in July 2025 that AI use stays eligible [SNIPPET, via Fliki/Social Media
  Today]. That statement predates the June and July 2026 rewrites and must not be read as current.
- **Enforcement on human faceless creators, extending the repo's January 2026 citation:**
  - The Hollywood Reporter (June 2026): human-made faceless channels caught by reach changes; some adapt
    by "hiring cheap on-camera hosts through platforms like Fiverr and Upwork"; "niche educational
    content … has held up better than broad content farms" [SNIPPET].
  - Digital Trends / Yahoo Tech: "Faceless creators are becoming collateral damage in YouTube's AI
    cleanup" [SNIPPET, headline only].
  - TechTimes, 2026-07-15: "YouTube Wiped 35M Subscribers Over AI Slop: Now It's Judging Your Taste"
    [SNIPPET, headline only; the 35M figure matches the January 2026 action already in
    `docs/REJECTED.md`].
  - A "Bible story channel with 588,000 subscribers earning $30,000 per month … fully demonetized …
    citing 'inauthentic and mass-produced content'", status "Under appeal" [SNIPPET, **weak**: it came
    from a result set of vendors that sell AI video tools (fliki.ai, invideo.io, miraflow.ai,
    aituber.app, eliro.pro); I cannot attribute it to one page and it is unverified].
  - The vendor tier's advice ("add editorial voice, vary format, AI is fine if original") is
    self-interested, because these vendors sell the tools. It agrees with the rendered text anyway,
    so I use the rendered text and not them.

### 4.4 "Model [viral competitor video] script" (reel prompt 3): where learning stops and copying starts

- **Getting the competitor's script is itself the first breach.** YouTube's Terms of Service forbid
  users to "access, reproduce, download … or otherwise use any part of the Service or any Content except:
  (a) as expressly authorized by the Service; or (b) with prior written permission" and to "access the
  Service using any automated means (such as robots, botnets or scrapers)" [RENDERED-ARCHIVE OTA Terms
  of Service (main):118, :120]. Scraping transcripts with a downloader is outside the terms. Whether the
  Data API can lawfully return a third party's caption track: **UNKNOWN** (not rendered).
- **Monetization side:** rewriting one video's script is "Taking someone else's content, making minimal
  changes, and calling it your own original work" [RENDERED …monetization :186]. Reproducing its
  beat-for-beat structure is "mimics existing formats or stories to a degree that the videos feel
  interchangeable" [:210]. What *is* allowed: "building on a popular video format or theme" with "your
  authentic perspective" [:222].
- **Copyright side:** in general copyright protects expression, not ideas or structure. That is
  INFERENCE from general legal knowledge, not a rendered source, and the exact line for a
  close paraphrase of a script is **UNKNOWN**; no lawyer is available under the mandate.
- **The practical line (INFERENCE):** learn *format conventions* from YouTube's own best-practice
  material and from **metadata of many videos** (titles, lengths, view counts, which is API-accessible)
  and never from one competitor's transcript. Write the beat sheet ourselves. Take facts from primary
  sources and cite them in the description. Never let any single third-party text be the input the
  script is generated from.

### 4.5 "Placed advertisements" (reel prompt 6)

The ToS allow selling sponsorships only as permitted by the "Advertising on YouTube" policies "(such as
compliant product placements)" [RENDERED-ARCHIVE OTA Terms of Service (main):127]. Those policies were
not rendered, so the exact disclosure mechanics are **UNKNOWN**. Separately, sponsorship deals require
negotiating with people, which the owner will not do (`MISSION.md` rule 1). [INFERENCE]

---

## 5. The crux: can an owner-free channel have "the creator's original, authentic insights or perspective"?

- The words that decide it are "adding the creator's original, authentic insights or perspective"
  [:140], "the final product must still demonstrate your creative vision" [:216], and "we cannot clearly
  tell that you made the content" [:156]. [RENDERED]
- Every **allowed** AI example in the text is assistive: "using AI to edit your video scripts or generate
  a unique background visual" [:226], and "using AI to visualize a unique character and narrative you
  invented" [:224]. There is no example of a channel where the AI *is* the creator. [RENDERED]
- **No sentence requires a human**, and none says an unattended agent qualifies. [INFERENCE: this is a
  real gap in the text, and a human reviewer fills it with judgment.]
- `MISSION.md` gives the owner no role in the content. So the only "creator's perspective" the channel
  can honestly claim is the agent's: original analysis the agent actually performed. That is
  defensible for **data-driven explainers** (each video answers a distinct question from data the
  channel computed itself, with its own charts, not stock footage). It is not defensible for narrated
  rewrites of web articles, which is item :204, "exclusively features readings of other materials".
- It also connects to `MISSION.md` constraint 8 (INFERENCE): the non-public input that makes a video
  original is the same thing that lets the channel pass this test. **A channel whose every input is
  public web text fails both.**

**Verdict on "clearly inside": the policy leaves only the narrow variant defensible, and even that is
arguable at the margin.** "Clearly" cannot be promised, because the test is a reviewer's reading of
"authentic". What *can* be done is to remove every named disqualifier. That is the checklist below.

---

## 6. What a failure costs (why this is a go/no-go input, not a tuning detail)

- Enforcement is **channel-level** (:156; TechCrunch snippet: "too much of any of these three types")
  and **sticky to the person**: it "may apply to all of your existing channels, any new channels you
  create" and forbids new channels "to get around these restrictions" (:286-288). [RENDERED]
- The AdSense for YouTube payee is the owner (`MISSION.md`: "Payout and platform identity … will carry
  his real legal name"). **A demonetized or terminated channel therefore burns the owner's one
  YouTube monetization identity for this and any future YouTube line.** [INFERENCE from RENDERED :288 +
  CODE MISSION.md] Whether it also touches his AdSense standing for web ads: **UNKNOWN**.
- Earnings can be withheld for up to 90 days and charged back (:318-320). **Ledger rule: only a
  finalised AdSense payment with a transaction id counts; "estimated revenue" in YouTube Studio is not
  money.** [RENDERED + MISSION.md rule 2]

---

## 7. YMYL: extra exposure in the high-RPM niches, and the disclaimers needed

| Exposure | Rule | What it requires |
|---|---|---|
| AI persona giving advice on finance, health, legal or politics | Monetization, AI Personas [RENDERED :244-252] | **No persona at all** (no name, no "as a former X", no human-expert framing), and **no advice**. Explain concepts; never tell the viewer what to buy, claim, sign or take. A disclaimer does not cure a persona. |
| "Get rich quick" or guaranteed returns | CG Spam item 8 [RENDERED-ARCHIVE CG@4d29ee7:207]; older text: "Making exaggerated promises, such as claims that viewers can get rich fast" [@9f3e242:238] | No income or return claims in titles, thumbnails or scripts. |
| Health claims | CG Medical misinformation [RENDERED-ARCHIVE CG:1932] | Never contradict local health-authority guidance; cite it. |
| Real people or brands in AI visuals or voice | CG Impersonation [RENDERED-ARCHIVE CG:228, :259]; disclosure [:67] | No real-person likeness or voice; no implied endorsement. |
| Stock footage of identifiable people in a negative framing | Pexels/Pixabay licence terms [CODE research/tiktok/06 §5.1-5.4, medium grade; licence pages returned 403 to the runner, see `research/rendered/pexels-license.meta.json`] | Never put a financial-hardship, scam or illness narrative over an identifiable stock person. |
| **Israeli law on investment advice** | Repo scouts cite the Investment Advice Law and an ISA January 2026 proposal on "ongoing transmission of investment recommendations … via online means" [CODE research/colony-sweep/scouts/crypto-native--trading-strategies.md:61, SNIPPET grade] | Whether a general English educational channel run by an Israeli resident needs a licence is **UNKNOWN**. The mandate excludes lawyers, so the only compliant stance is **no recommendations of specific securities or products, ever**. |

**Disclaimers (INFERENCE; they supplement the structural rules and do not replace them):**
1. On screen, in the first seconds, and in the description: "Narration and some visuals are AI-generated."
2. In the description: "General educational information, not financial, legal or medical advice. Not
   tailored to your situation. The narrator is a synthetic voice, not a licensed professional."
3. A sources list in every description. It supports "educational value" and gives the "additional
   context" the misinformation policies look for [RENDERED-ARCHIVE CG:1834].
4. In the About section: how the channel makes videos, in plain words (the escape hatch at :180,
   "explains how the creator added to the content"; reviewers read the About section, :98).

---

## 8. Compliance checklist for one channel, each item tied to a quoted rule

**Channel design (fixed once):**
1. **Exactly one channel, forever; never a backup or second channel.** Rules: "should not create new (or
   use existing) channels to get around these restrictions" [:288]; spam policy covers "coordinated
   networks of channels" [CG:186]; `MISSION.md` constraint 3.
2. **Niche outside health, legal, finance and politics, or, if finance-adjacent, no persona and no
   advice.** Rule: AI Personas [:244-252].
3. **Each video is a distinct question with distinct substance, and a five-video binge must not feel
   interchangeable.** Rule: "may feel repetitive to viewers after watching several videos in a row" [:114];
   "materially varied" [:120]; "distinct storyline, focus, or concept" [:126].
4. **Original substance per video** (analysis or data the channel produced), never a narrated rewrite of
   any single source. Rules: [:140] "creator's original, authentic insights"; [:204] "exclusively features
   readings of other materials"; [:186] "even if you have permission".
5. **Vary the production surface:** no single music bed, no single visual template, no single script
   skeleton across the catalogue. Rule: CG Spam item 6 example [CG:204]; [:138] "templated storylines".
6. **Visuals with a narrative arc:** no stitched unrelated AI clips, no bare slideshows. Rules: [:238];
   [:138].
7. **No shock or manipulative formulas; no realistic depiction of events that did not happen.** Rules:
   [:210], [:234-240].
8. **The About section explains how the content is made** (AI narration, AI visuals, sources, and what the
   channel adds). Rules: [:98], [:180].
9. **Cadence set by quality, not by a 30-day calendar.** Rule: CG item 6 "high volumes of similar
   content"; [:84] "not … mass-produced". No numeric threshold is published, so the safe number is
   **UNKNOWN** and reel prompt 5's daily cadence is the risky end (INFERENCE).

**Every video:**
10. **Tick "AI use: Yes"** whenever a realistic AI visual (Sora 2), AI footage of a real place, or AI music
    is present. Rule: disclosure [:63-71], [:131-133], [:157].
11. **Disclose AI narration in text anyway.** It costs nothing: [:173]. The rule is ambiguous for TTS
    voices: [:83], [:115].
12. **Never strip C2PA or watermarks, and never evade labels.** Rules: [:189-193]; CG item 5 "Detection
    evasion" [CG:201].
13. **The voice and visuals imitate no real person or brand.** Rules: CG Impersonation [CG:228, :259];
    disclosure [:67].
14. **No competitor transcript as input; no scraping.** Rules: ToS [OTA ToS:118, :120]; [:186]; [:210].
15. **Stock footage is B-roll under substantive narration, with a licence log per clip, and no identifiable
    person in a negative framing.** Rules: [:196], [:200]; the Pexels/Pixabay terms in `research/tiktok/06` §5
    (medium grade).
16. **Titles and thumbnails deliver what they promise.** Rules: CG item 9 [CG:209]; reviewers check
    metadata [:96].
17. **In finance-adjacent topics: no get-rich or return claims, no named-security recommendations,
    the disclaimers in §7, and sources listed.** Rules: CG item 8 [CG:207]; [:244]; the Israeli
    Investment Advice Law (CODE/SNIPPET).
18. **Health-adjacent topics: never contradict health-authority guidance.** Rule: [CG:1932].

**Operations:**
19. **No bought or incentivised engagement, and no deleting non-compliant videos after they earned
    engagement.** Rule: Creator integrity [:296].
20. **No sponsorship or placement unless it follows YouTube's advertising policies** (not rendered),
    and none that requires the owner to negotiate. Rules: ToS §10 [OTA ToS:127]; `MISSION.md` rule 1.
21. **Re-check the policy monthly against the OTA commit feed or the changelog**, because the page's
    banner missed both 2026 rewrites. [INFERENCE from §3]
22. **Count only finalised AdSense payments.** Rules: [:318-330]; `MISSION.md` rule 2.

---

## 9. What this changes relative to `docs/REJECTED.md` (2026-09-03)

- **Confirmed and strengthened:** reason 2 ("YouTube's policy defines this output as ineligible"). The
  policy now names AI-template content explicitly [:140], and automated or synthetic mass-production is
  Community Guidelines spam [CG:203], so the penalty is strikes and termination, not only lost ads.
- **New: a collision the old verdict could not see.** The AI-persona rule (July 2026) makes the reel's
  own niche filter (RPM > $7) the riskiest possible choice for an AI-narrated channel.
- **New: the policy leaves a narrow, honest variant defensible:** one channel, non-sensitive niche,
  original analysis per video, disclosed AI, low cadence. Whether that variant can earn anything is
  not this scout's question (RPM, reach and acquisition belong to other scouts). Its compliance cost is
  real: it removes the cheap parts of the reel (a competitor-modelled script, a daily calendar, the
  high-RPM finance niche).
- **Not changed:** YouTube is the one platform here with a payout rail to Israel (AdSense), per the
  prior research.

---

## What I could not verify

1. **When exactly the June and July 2026 changes were published by YouTube.** I have OTA capture
   windows and a TechCrunch snippet date (16 July 2026, which conflicts slightly with OTA's 14 July
   capture). The first-party changelog is https://support.google.com/youtube/answer/10008196, not rendered.
2. **Whether a stock TTS narrator voice is "realistic AI content" requiring the AI-use toggle.** The text is
   ambiguous (§4.1). The checklist resolves it by disclosing anyway.
3. **Whether an unattended AI agent can be "the creator" whose "original, authentic insights" the
   policy requires.** No text addresses it, and no enforcement case I found tests it.
4. **Reach effect of the faceless format.** The Hollywood Reporter says the algorithm favours human faces.
   I have only a search summary, and the article is not rendered.
5. **The Advertiser-friendly content guidelines** (answer/6162278) for finance topics: not rendered.
6. **Advertising on YouTube and paid-placement disclosure mechanics:** not rendered.
7. **Sora 2 terms:** watermark removal, commercial use, and whether C2PA is embedded on every download
   tier. There are only snippets, and they conflict on whether C2PA is always present.
8. **Whether the Data API can return captions of third-party videos**, relevant to prompt 3.
9. **Israeli Investment Advice Law applicability** to a general educational English channel: unknown,
   and not resolvable without a lawyer, which the mandate excludes.
10. **Whether YouTube demonetization or termination affects the owner's AdSense standing outside
    YouTube.**
11. **The Bible-channel demonetization case** (588k subscribers, $30k/month): vendor-tier snippet, unverified.
12. **The 10M-Shorts-views threshold from 2027-02-01:** read in the OTA archive, not in our own render
    (answer/12504220 was not in `urls.txt`).

## Sources

**RENDERED (YouTube's own pages, fetched by `render-watch.yml` 2026-09-25):**
- `research/rendered/youtube-monetization-policies.txt`: https://support.google.com/youtube/answer/1311392
- `research/rendered/youtube-altered-synthetic-disclosure.txt`: https://support.google.com/youtube/answer/14328491
- `research/rendered/youtube-ypp-payout.txt`: https://support.google.com/youtube/answer/14728151 (withholding note, :126)

**RENDERED-ARCHIVE (Open Terms Archive, verbatim captures; read via raw.githubusercontent.com):**
- `OpenTermsArchive/vlopses-us-versions`, `YouTube/Content Monetisation Policy.md` at eec5862 (2025-09-09),
  36fc028 (2026-05-09), 9792a12 (2026-06-02), 6cbbfba (2026-06-24), 8653912 (2026-07-14), d78290d (2026-09-15)
- same repo, `YouTube/Community Guidelines.md` at 9f3e242 (2026-05-20), 994fae0 (2026-06-02), 4d29ee7 (2026-07-23)
- same repo, `YouTube/Terms of Service.md` (main, 2026-09-25)
- Commit lists: https://github.com/OpenTermsArchive/vlopses-us-versions/commits/main/YouTube/Content%20Monetisation%20Policy.md
  and …/commits/main/YouTube/Community%20Guidelines.md

**CODE (repo files):** `docs/REJECTED.md` §"Automated faceless-video pipelines"; `research/tiktok/06-faceless-video-tooling.md`
§3.2, §3.5, §5, §6, §9; `research/colony-sweep/scouts/bounties-grants--creator-funds.md` §1;
`research/colony-sweep/scouts/crypto-native--trading-strategies.md:61`; `research/faceless-youtube/00-owner-reel-2026-09-25.md`; `MISSION.md`.

**SNIPPET (search results, 5 searches):**
- https://techcrunch.com/2026/07/20/youtube-clarifies-policies-around-ai-slop-and-upsetting-videos/ (independent news)
- https://www.hollywoodreporter.com/business/digital/faceless-creators-youtube-ai-damage-1236617586/ (independent trade press)
- https://www.digitaltrends.com/computing/faceless-creators-are-becoming-collateral-damage-in-youtubes-ai-cleanup/ (independent)
- https://www.techtimes.com/articles/320629/20260715/youtube-wiped-35m-subscribers-over-ai-slop-now-its-judging-your-taste.htm (independent, headline only)
- https://www.socialmediatoday.com/news/youtube-clarifies-monetization-update-inauthentic-repeated-content/752892/ (independent)
- https://fliki.ai/blog/youtube-monetization-policy-2025, https://aituber.app/blog/faceless-youtube-channels-demonetized-2026/,
  https://invideo.io/blog/youtube-kills-ai-faceless-channels/, https://miraflow.ai/blog/youtube-monetization-ai-content-2026-allowed-demonetized
  (**vendors that sell AI video tools**; used for nothing load-bearing)
- https://openai.com/index/launching-sora-responsibly/ (OpenAI, result title only), https://venturebeat.com/ai/openai-to-steer-content-authentication-group-c2pa-pledges-to-label-sora-videos-as-ai
- A sponsored post on decaturdaily.com teaching C2PA stripping (cited only as evidence that the trap is marketed)

**Blocked this run:** techcrunch.com (WebFetch refused by the egress proxy; not retried).
