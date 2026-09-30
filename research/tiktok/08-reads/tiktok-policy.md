# TikTok's own rules for a faceless, AI-assisted brand account (reader: tiktok-policy family, 28.9.2026)

**What this is.** Stage 2 of the TikTok sweep. It reads the three first-party policy pages the GitHub
Actions runner saved on 2026-09-28 (about 21:02 UTC) and checks them against what the stage-1 scouts
claimed in `research/tiktok/08-sweep/sweep-2026-09-28.json`. No WebSearch was used and no git command
was run. No person is named here beyond public handles and professional names already in the sweep.

**Grades.**
- **rendered**: read in a capture. The file, byte offset and JSON block id are cited, and every quote was checked with `grep -F`.
- **github**: read on GitHub. **snippet**: seen only in a search-result snippet. **repo**: read in this repository.
- **none**: my own reading or inference, labelled as such.

**Abbreviations and how to re-check a quote.**
- `CG` = `research/rendered/tt-src-tiktok-com-community-guidelines-en-integrity-authenticity.html`.
  This file is a single line with no newline. The guideline text sits in the
  `<script type="application/json" data-ttark="__remixContext">` block as **URL-encoded** JSON. A plain
  `grep -F` of an English phrase therefore misses. Encode the phrase the way `encodeURIComponent` does
  (Python: `urllib.parse.quote(q, safe="-_.!~*'()")`) and `grep -F` that string. Every CG quote below
  was checked this way. `CG@N` is the byte offset of the first match. The block ids, such as
  `2026-H2-integrity-subpost3-text1`, are the `sys.id` of the rich-text block after decoding.
- `OR` = `research/rendered/tt-src-tiktok-com-creator-academy-article-tiktok-originality-policy.html`.
  The article body is JSON-escaped HTML in `articleData.article.content` on **line 38**. Plain-text
  quotes match raw with `grep -F`. `OR@N` is the byte offset.
- `SP` = `research/rendered/tt-src-support-tiktok-com-en-using-tiktok-creating-videos-ai-generated.html`.

## Bottom line

1. **Nothing in TikTok's rules stops a faceless, screen-recorded demo of our own product with a
   generic synthetic voice.** No rule requires a face. A screen recording of our own tool is content
   "you created". Generic text-to-speech is explicitly exempt from AI disclosure. A voluntary AI label
   or caption is allowed.
2. **The rule that would actually bite was missed by every stage-1 scout: commercial disclosure.**
   Promoting "your own business, product, or service" requires TikTok's content disclosure setting. If
   it is missing, TikTok may "reduce its visibility". Repeated failure can mean a posting restriction
   or an account ban.
3. **Scout 5's reading that a Kokoro voice "needs the AI label" is refuted for TikTok.** The
   guidelines in force since 24.9.2026 say disclosure "isn't needed" for "generic text-to-speech (TTS)
   narration, when the TTS isn't a recognizable voice of a known individual". We should still
   disclose, because our constitution says so, not because TikTok does.
4. **What would stop it** is anything that makes it deceptive or mass-produced:
   - a cloned or real person's voice;
   - an invented human spokesperson;
   - other people's footage or watermarks, or GIF-only or minimally edited clips;
   - automation running many accounts or posting repetitive content;
   - bait hooks such as "like-for-like" or misleading claims;
   - misuse of authoritative sources.
5. **Still unknown:** whether the AI label changes reach, and what exactly counts as a "creative
   edit". The support page that might answer the first did not render (an empty app shell). Neither
   rendered page defines the second.

---

## 1. Captures read

| File | HTTP | Usable? | What it holds |
|---|---|---|---|
| `tt-src-tiktok-com-creator-academy-article-tiktok-originality-policy.html` (640,647 B) | 200 | **Yes** | **Article:** "Understanding TikTok's Originality Policy" (OR@85430), 4,481 characters of HTML in `articleData.article.content` (OR@~619,463), `"publishedAt":"2026-09-26T01:11:54.382Z"` (OR@625117), `creatorTier` 2. **Navigation JSON:** the titles and descriptions of other Creator Academy articles, used below for the AI label's name and the *Content check lite* and *Account check* tools. **Text file:** the `.txt` (124 B) is page chrome only; the script-held body was dropped. |
| `tt-src-tiktok-com-community-guidelines-en-integrity-authenticity.html` (1,029,098 B) | 200 | **Yes, and wider than asked** | **Page:** the page's own `url` is `/safety/en/policies-and-engagement/integrity-authenticity` (CG@13764). **The requested section:** `cgData.postValue` is "Integrity and Authenticity", version `2026H2update`, "2026 August". **The whole guideline set:** `cgData.posts[0..11]` holds all 12 sections of the same version: Overview, Community Principles, Youth Safety, Safety and Civility, Mental and Behavioral Health, Sensitive and Mature Themes, Integrity and Authenticity, Regulated Goods/Services/Commercial Activities, Privacy and Security, For You feed Eligibility Standards, Accounts and Features, Enforcement. **Text file:** the `.txt` (31 B) is only the title "Policies & engagement \| TikTok". |
| `tt-src-support-tiktok-com-en-using-tiktok-creating-videos-ai-generated.html` (5,282 B) | 200 | **NOT rendered** | This is a client-side app shell, not the article: `<title>TikTok Support</title>` (SP@27) and `<div id="root"><!--<?- html ?>--></div>` (SP@5176), with no article text. **A 200 status here is not a render.** The `.txt` (15 B) reads "TikTok Support". |

**Why the second capture matters.** It carries the full guideline set, so every "absent from the
guidelines" statement below was checked against all 12 sections, not one page. I ran word counts over
the decoded JSON, listed in §2.8.

---

## 2. Facts

### 2.1 Version and scope

| # | Fact | Grade | Evidence |
|---|---|---|---|
| P1 | The captured guidelines are the version in force on capture day: "Released August 25, 2026" / "Effective September 24, 2026". | rendered | CG@30631, CG@30680 (`lastUpdate`); `version` `2026H2update` |
| P2 | The FYF (For You feed) Eligibility Standards section no longer lists what is ineligible. It points elsewhere: "Learn more about the types of content we leave out from the FYF in the" "FYF Ineligible" "sections throughout our Community Guidelines." | rendered | CG@373278, CG@373416; block `2026-H2-fyp-text1` |
| P3 | The originality article was republished two days before the capture (`publishedAt` 2026-09-26). | rendered | OR@625117 |

### 2.2 The AI-generated-content label

| # | Fact (verbatim where quoted) | Grade | Evidence |
|---|---|---|---|
| A1 | **When the label is required.** "we require creators to [label] AI-generated or significantly edited content that shows realistic-looking scenes or people". | rendered | CG@280997 + CG@281311; block `2026-H2-integrity-subpost3-text1` |
| A2 | **If a creator does not label.** "Unlabeled content may be removed, restricted, or labeled by our team, depending on the harm it could cause." TikTok may apply the label itself. The page does not say how it detects unlabelled content. | rendered | CG@281440 |
| A3 | **How to disclose.** Any of four ways is accepted, not only the label: "You must label content that uses AI or includes significant edits to show realistic-looking people or scenes. You can add your own clear caption, sticker, or watermark. For AI-generated content, you can also use our [AIGC label]". The block heading reads "REQUIRED DISCLOSURE (using the AIGC label or a clear caption, watermark, or sticker)". | rendered | CG@284258; block `2026-H2-integrity-subpost3-toggle1-text1` |
| A4 | **The label's in-app name** is "Creator labeled as AI-generated". This comes from the Creator Academy navigation description of the article `ai-generated-content-label`; the article itself was not captured. | rendered (description only) | OR@116389 |
| A5 | **Disclosure is needed** when a face is replaced, when AI makes someone appear to say something they did not, when a background, object or person is added or removed misleadingly, and when "AI-generated audio mimics the voice of a real person". | rendered | CG@285483; same block |
| A6 | **"Disclosure isn't needed when:"** "Making small edits like color correction, reframing, or cropping"; "Using artistic styles, like anime"; "Using generic text-to-speech (TTS) narration, when the TTS isn't a recognizable voice of a known individual". | rendered | CG@285580, CG@285689, CG@285838, CG@285946 |
| A7 | **AIGC is defined broadly:** "Any image, video, or audio made or changed by AI." A Kokoro narration is therefore AIGC by definition. It falls inside A6's exemption, so TikTok does not require it to be disclosed. | rendered (definition); none (the application) | CG@282249; block `2026-H2-integrity-subpost3-toggle1` |
| A8 | **"Significantly Edited Content" is defined around people:** "Media that makes it seem like someone did or said something they didn’t, or alters their appearance so much that they’re unrecognizable." Its examples (cutting phrases, rearranging clips, "Changing speed or adding/removing audio or video parts") sit under that definition. *Reading:* speeding up or trimming a screen recording of our own interface puts words in no one's mouth, so it is not "significantly edited" in TikTok's sense. Honesty still argues for marking a speed-up on screen. | rendered (definition); none (the application) | CG@282524 |
| A9 | **Not allowed even with a label:** among others, using private figures' likeness without consent; "Content made to look like it comes from a real news source"; "A public figure taking political stances, supporting products, or commenting on public issues they haven't actually addressed". | rendered | CG@289816, CG@290256; block `…toggle1-text2` |
| A10 | **Kept out of the FYF:** "Any realistic-appearing content which isn't yet confirmed to be AIGC or significantly edited content, but presents matters of public importance in a way that could lead to misinterpretation, or cause harm to private figures". Explicitly **allowed:** "Humor or art, such as a spoof, meme, or TikTok dance". | rendered | CG@293470, CG@296423 |
| A11 | **Whether the label changes reach is NOT stated in any capture.** The guidelines are silent. The support page that scout 5 cited for "does not reduce reach" is an empty shell (§1). | none (unverified) | SP@5176. Of the 282 `content` blocks in the decoded guideline JSON, none contains both "label" and "reach"; the originality article mentions neither. |
| A12 | **How TikTok detects AI content is not stated either.** "C2PA" and "Content Credentials" occur 0 times in the decoded JSON of all 12 sections. The repo's claim that TikTok reads C2PA metadata (tiktok/01 §7b, 06 §3.3) is neither confirmed nor refuted here. | rendered (absence) | word count over the decoded `__remixContext` |

### 2.3 Originality, and unoriginal or repurposed content

| # | Fact | Grade | Evidence |
|---|---|---|---|
| O1 | "Unoriginal content includes:" "Content copied completely from others."; "Content that is largely repurposed from another source without adding any creative edits."; "Content combined from multiple sources with little or no additional information and/or content value."; "Content with someone else's visible watermark or superimposed logo." | rendered | OR@620779, OR@620911, OR@621066, OR@621233 |
| O2 | **Effect on visibility.** "Unoriginal content may be removed from the For You feed, making it harder to discover." | rendered | OR@622351 |
| O3 | **The guidelines agree.** "Content is also ineligible for the FYF if it includes unoriginal or reused material without anything new." Listed as FYF INELIGIBLE: "Reused or unoriginal content posted without creative edits, such as clips that show someone else’s watermark or logo" and "Low-quality or minimally edited content, such as short clips made from GIFs only". | rendered | CG@300173, CG@304816, CG@304995; block `2026-H2-integrity-subpost4-toggle1-text2` |
| O4 | **Neither page defines a "creative edit".** Both give only negative examples. The article's only positive guidance is "The more unique and creative your content, the better chance it has of getting noticed." and "If you want to rev up your rewards potential, stick to content that's all yours!" The article has no word about AI, labels, voices, TTS, screen recordings or templates: 0 hits in its 4,481-character body. | rendered (read in full) | OR@622845, OR@624765 |
| O5 | "You should only post content you created or have the right to share." | rendered | CG@299472 |
| O6 | **Low views are not proof of a violation.** "It may be due to a lack of community engagement rather than being ineligible for the FYF." and "If a video isn’t getting many views, it also doesn’t necessarily mean it broke a rule." | rendered | OR@623405, CG@373679 |
| O7 | **Monetisation.** "Unoriginal content is also be ineligible for TikTok's" monetisation programmes (sic), and Creator Rewards uses originality "as a key metric in its rewards formula". This does not affect us: Israel is not eligible for Creator Rewards. | rendered; repo | OR@624131, OR@624725; `docs/REJECTED.md` §TikTok |

### 2.4 Integrity and authenticity: impersonation, fake engagement, multiple accounts, automation

| # | Fact | Grade | Evidence |
|---|---|---|---|
| I1 | "You can have multiple accounts—for example, for fan content or creative expression—but not to deceive others or break the rules." | rendered | CG@308993; block `2026-H2-integrity-subpost5-text1` |
| I2 | **Automation.** "We strictly prohibit automation tools, scripts, or other tricks designed to bypass our systems." The spam list includes "Using automation to run many accounts or send repetitive content", "Using bots or scripts to write fake reviews or comments, or to increase likes or shares" and "Buying or selling followers or engagement for financial gain". *Reading:* the guidelines ban automation that bypasses TikTok's systems or runs many accounts or repetitive content. They do not ban software-assisted production. The broader Terms-of-Service clause on automated interaction is still graded 🟡 in `research/tiktok/01` §7a. | rendered | CG@310027, CG@313361, CG@313736, CG@313630 |
| I3 | **Impersonation.** "Impersonation by pretending to be someone else without clearly stating that the account is a fan or parody account in the display name". Also not allowed: "Pretending to be a fake person or organization with the goal of misleading people". | rendered | CG@313874, CG@314117 |
| I4 | **Trading engagement** is not allowed, including "Using AI or bot accounts to drive traffic" and "Sharing how-to guides or tips for boosting engagement in fake or deceptive ways". | rendered | CG@315746, CG@315877 |
| I5 | **Kept out of the FYF** under "Tricking others into increasing engagement": "Like-for-like" promises, "False incentives for gifting or following" and "Misleading claims meant to boost views or popularity". A "comment KEYWORD and I'll DM you" funnel is **not named** anywhere in the 12 sections. | rendered | CG@318826, CG@318921, CG@319037 |
| I6 | "If we detect accounts or content with inauthentic metrics, we’ll remove fake likes, followers, or other inflated signals." | rendered | CG@310409 |
| I7 | **Circumvention, and how far a ban reaches.** "If your account is restricted or banned, you may not create or use another account to get around it." Also: "If someone seriously breaks the rules or tries to dodge enforcement, we may ban all of their accounts, including associated accounts." | rendered | CG@310254; CG@379939, block `2026-H2-features-text1` |
| I8 | **An account-level penalty without a violation.** "Sometimes, accounts that don’t break the rules still post a lot of content that’s ineligible for the FYF. In those cases, we may make the account and its content ineligible for the FYF and harder to find." | rendered | CG@382003 |

### 2.5 Commercial disclosure: the rule the scouts missed

| # | Fact | Grade | Evidence |
|---|---|---|---|
| C1 | **The requirement.** "If you’re posting commercial content on TikTok, you must clearly disclose it using the [content disclosure setting]". "Disclosure is required when you’re:" "Promoting your own business, product, or service". The REQUIRED DISCLOSURE list repeats: "Marketing for your own business, product, or service". | rendered | CG@343547, CG@344251, CG@347026; blocks `2026-H2-regulated-subpost5-text1` and `…-toggle1-text1` |
| C2 | **The penalty.** "If we find commercial content that hasn’t been properly disclosed, we may reduce its visibility or apply the content disclosure setting. Repeated failure to make a disclosure can lead to your account being temporarily restricted from posting content, or can lead to an account ban." The Monetization section says it again: "This applies to content that promotes your brand or involves payment or perks from a third party." Also: "we may apply the content disclosure setting ourselves or remove it from the FYF". | rendered | CG@345489, CG@417133, CG@418367 |
| C3 | **Two kinds of commercial content.** The third-party case is "Posting branded content, including reviews or endorsements, and receiving any kind of incentive in exchange". "Branded content" must also follow the Branded Content Policy, the Ads Creative Policy and the Industry Entry Policy. *Reading:* our own-product demos need the disclosure setting. Those three extra policies are written for third-party paid content. | rendered; none (reading) | CG@344380 |
| C4 | **Tax explainers are an allowed category.** The ALLOWED list includes "Financial education and information about financial products and services". *Reading:* explainers for Israeli tax and VAT calculators fall under it. | rendered; none (application) | CG@339931; block `2026-H2-regulated-subpost1-toggle1-text4` |
| C5 | **Scams are not allowed**, including "Financial scams, such as fake investment offers or “get-rich-quick” schemes" and "Multi-level marketing (MLM)". | rendered | CG@352057, CG@352513 |
| C6 | **Off-platform checkout, on LIVE only.** "we reduce visibility of content directing users to purchase products off-platform in markets where TikTok Shop is available." This sits under "LIVE Commercial Content". The LIVE FYF-ineligible list repeats it ("Direct users off-platform to purchase products online, in markets where TikTok Shop is available."). The 12 sections contain no such rule for ordinary videos. | rendered | CG@393538, CG@401992 |
| C7 | **Links.** "If a link breaks our rules, we’ll remove it. We may also temporarily stop you from posting links". | rendered | CG@408360 |
| C8 | **Promotional comments.** Comments are ranked lower if they are "Spam:" "Random text, irrelevant promotions, or links". | rendered | CG@410109 |
| C9 | **Automated DM replies.** "Some businesses also use automated tools to reply to messages." This is descriptive, and nothing in the guidelines forbids it. "You must be 16 and older to use DMs." | rendered | CG@411794, CG@411889 |

### 2.6 Screen recordings, text-to-speech voices, templates, faces

| # | Fact | Grade | Evidence |
|---|---|---|---|
| S1 | **Text-to-speech.** The only TTS rule is the disclosure exemption in A6: generic TTS, when it "isn't a recognizable voice of a known individual", needs no disclosure. A voice that "mimics the voice of a real person" needs it (A5). | rendered | CG@285946, CG@285483 |
| S2 | **Screen recordings.** No rule covers them in ordinary videos, in any of the 12 sections. Screens appear only under LIVE: gaming creators may "share the device screen", and a LIVE is kept out of the FYF if it shows "low quality content, such as black, blank, or blur screens". ("screen record" occurs 0 times.) | rendered (absence plus LIVE text) | block `2026-H2-features-subpost2-toggle1-text3`; word count |
| S3 | **Templates.** "template" occurs 0 times in the decoded guidelines and 0 times in the originality article. The nearest rules are I2 ("send repetitive content", when automated) and O3 ("Low-quality or minimally edited content"). | rendered (absence) | word count |
| S4 | **Faces.** No rule requires a person on camera ("faceless", "on camera" and "on-camera": 0 hits). The intro's aim, that content be "shared by real people", is about authentic accounts (I1 to I3), not faces. | rendered (absence); none (reading) | block `2026-H2-integrity-text1` |

### 2.7 How enforcement is applied, and TikTok's own ₪0 check tools

| # | Fact | Grade | Evidence |
|---|---|---|---|
| E1 | "Content first goes through an automated review process." "Additional review will occur if content gains popularity or has been reported." | rendered | CG@423264, CG@423519 |
| E2 | "If your content is made ineligible for the FYF or otherwise restricted, this information will appear in the [TikTok analytics tool]". Appeals are available. | rendered | CG@426385; block `2026-H2-enforcement-subpost3-text1` |
| E3 | **Content check lite:** "you'll allow the system to automatically verify if your content is eligible for the For You feed before posting". **Account check:** "a quick and comprehensive overview of your account standing and video status". Both come from Creator Academy navigation descriptions; the articles themselves were not captured. | rendered (descriptions) | OR@113627, OR@73633 |
| E4 | **The FYF is not the only way to be found.** "Even if a video doesn’t make it to the FYF, people may still find it through search or by going to a creator's account." Search: "we prioritize entertaining and informative content in search recommendations"; "We also try to highlight content from reliable sources at the top." | rendered | CG@373501, CG@407029, CG@406735 |
| E5 | **Misinformation rules that apply to tax content.** "Misuse of authoritative sources to push misleading conclusions" is FYF-ineligible. | rendered | CG@262606 |
| E6 | "Content that isn’t eligible for the FYF may also be restricted from monetization." | rendered | CG@416589 |

### 2.8 Absent from the version in force

Word counts over the decoded `__remixContext` JSON, all 12 sections:

| Term | Count |
|---|---|
| `QR` | 0 |
| `C2PA` | 0 |
| `Content Credentials` | 0 |
| `Reddit` | 0 |
| `robot` | 0 |
| `slideshow` / `slide` | 0 |
| `compilation` | 0 |
| `reproduced` | 0 |
| `minimal original` | 0 |
| `template` | 0 |
| `faceless` | 0 |

The repo attributes three things to TikTok's guidelines that the 2026H2 text does not contain:
- "a Reddit thread in a generic robot voice over unrelated gameplay footage";
- "QR-code spam";
- "static imagery".

The first two appear in `research/tiktok/06-faceless-video-tooling.md` §3.3; `research/colony-sweep/scouts/distribution--short-video.md` §3 repeats the robot-voice example and adds "static imagery". They may have been in an earlier version, since P2 shows the FYF standards section was restructured. The archive URL in §5 would settle it. **grade: rendered (absence in the current version)**.

### 2.9 Verdict: which rules stop a faceless, screen-recorded product demo with a synthetic voice and an AI label

**Ruled 30.9.2026:** `research/channel-loop/RULING-2026-09-30-video.md` 16(a) and 16(d) — the brand opens no TikTok account; these captures stay citable for our own compliance and decisions not to act only (`[against-bar]`); no re-fetch.

| Element of the demo | Stopped? | Governing text |
|---|---|---|
| No face on camera | **No.** No rule requires one. | S4 |
| Screen recording of **our own** tool | **No.** It is content "you created" and not copied from others. It is FYF-ineligible only if it is "Low-quality or minimally edited" or carries someone else's watermark. | O1, O3, O5 |
| Generic synthetic voice (a Kokoro stock voice) | **No, and disclosure is not required by TikTok** as long as it "isn't a recognizable voice of a known individual". Kokoro's training excluded "custom voice clones" (repo: `research/rendered/kokoro-82m-model-card.txt:237`, read in `research/faceless-youtube/PREREG-DECISIONS.md` §2c). Kokoro has **no Hebrew voice** (repo: `research/faceless-youtube/scouts/production-stack.md:43`). | A6, S1 |
| A voluntary AI label or AI caption | **No.** It is the accepted mechanism. Its effect on reach is **unknown**. | A3, A4, A11 |
| Promoting our own product | **Only if undisclosed.** The content disclosure setting is required; without it, visibility may be reduced, and repeated failure can mean a posting restriction or ban. | C1, C2 |
| Link in the bio or on screen to the free tool or Gumroad | **No, for ordinary videos.** On LIVE, off-platform purchase links are kept out of the FYF in TikTok Shop markets. | C6, C7 |
| Tax or VAT explainer content | **No.** "Financial education" is on the ALLOWED list, provided sources are not misused. | C4, E5 |
| A cloned or real person's voice, including an owner voice clone | **Disclosure is required.** Putting words in a public figure's mouth or showing them endorsing a product is **not allowed**. | A5, A9 |
| A synthetic presenter posing as a real founder | **Not allowed** if it is a fake person meant to mislead. | I3 |
| Templated clips at volume, or several automated accounts | **Not allowed** (spam). The account may be made FYF-ineligible as a whole. | I2, I8 |
| Stock or other creators' clips, platform watermarks, GIF-only edits | **Kept out of the FYF.** | O1, O3 |
| "Like-for-like", false incentives, misleading hooks | **Kept out of the FYF.** | I5 |
| Looking like a news broadcast (AIGC) | **Not allowed.** | A9 |

---

## 3. Lessons

"Fits" means a faceless brand with no customer contact, a ₪0 budget and honest value, per MISSION
rules 1 and 4.

| # | Lesson | Source | Grade | Fits? |
|---|---|---|---|---|
| L1 | **Switch on the content disclosure setting for every product video**, own brand included, and record it in the posting checklist. It costs nothing, and it is the rule most likely to cut reach if forgotten. | C1, C2 | rendered | **Yes.** One toggle per manual post. The owner does the posting under PUBLISH-9. |
| L2 | **Declare the synthetic voice anyway.** TikTok does not require it (A6), but our constitution ("never deny what you are", `constitution.md:25`) and BOARD-LOOP PUBLISH-5 do. TikTok accepts "a clear caption, sticker, or watermark" as well as the label. A burned-in on-screen line, for example "קריינות: קול סינתטי (AI)", travels unchanged to YouTube and our own pages. Adding the in-app label as well costs nothing; its effect on reach is unknown (A11). | A3, A6; repo | rendered; repo | **Yes.** |
| L3 | **Use only stock voices that belong to nobody.** Never a clone, not even of the owner, and never an AI likeness of a public figure. For Hebrew, Kokoro has no voice (repo), so the honest ₪0 Hebrew option is still captions over music. That is a quality argument from the repo, not a TikTok rule. | A5, A9, S1; `production-stack.md:43` | rendered; repo | **Yes.** |
| L4 | **Let the brand speak as a brand.** No invented human persona with a name and backstory. "Pretending to be a fake person or organization with the goal of misleading people" is not allowed. | I3 | rendered | **Yes.** It matches MISSION's "the brand is the only public face". |
| L5 | **Make each clip from our own footage, and edit it.** Script, zooms, callouts and a worked number. Never post a file with another platform's watermark, and no GIF-only or lightly trimmed clips. Cross-posting our own original clip is not described as unoriginal anywhere. A copy exported with another app's watermark would meet O1's "someone else's visible watermark" (my reading). | O1, O3, O5 | rendered; none (watermark reading) | **Yes.** |
| L6 | **One account, low volume, no automation.** Automation that runs many accounts or sends repetitive content is spam (I2). An account that posts a lot of FYF-ineligible content can be made FYF-ineligible as a whole, with no violation needed (I8). A ban can extend to "associated accounts" (I7), which is one more reason the brand account must stay clean. | I2, I7, I8 | rendered | **Yes.** It reinforces PUBLISH-9 and tiktok/06. |
| L7 | **Hooks must be true.** "Misleading claims meant to boost views or popularity" are kept out of the FYF, and "get-rich-quick" framing is a scam category. Whether a "DEAD by 2027" style hook counts as misleading is a judgement, not a quoted rule. MISSION rejects it either way. | I5, C5 | rendered (rule); none (application) | **Yes.** |
| L8 | **Tax content is allowed "financial education" if the sources are used faithfully.** Cite the primary source on screen. Never style an AI clip as a news report. | C4, E5, A9 | rendered | **Yes.** |
| L9 | **Use TikTok's own ₪0 pre-flight and status tools.** Turn on *Content check lite* before posting and read *Account check*. Treat an "FYF-ineligible" mark in analytics (E2) as a kill-gate signal, not as a fact to argue with. | E2, E3 | rendered | **Partly.** ₪0, but reading analytics takes owner minutes, since only the owner can see them. |
| L10 | **Low views are not a verdict, and the FYF is not the only door.** Search and profile visits still find a video, and search favours "informative content" from "reliable sources". Answer-first explainers suit search. | O6, E4 | rendered | **Yes.** |
| L11 | **No promotional comments on other people's videos.** They rank lower as spam, and they invite replies, which would mean customer contact. | C8 | rendered | **Yes** (as a prohibition). |
| L12 | **DMs.** TikTok treats automated business replies as normal (C9). A canned reply pointing to documentation would keep the owner out of conversations. Whether a brand account gets such a feature is unverified. | C9 | rendered (descriptive) | **Partly.** Turning DMs off is simpler. |
| L13 | **No selling on LIVE.** It needs a human anyway, and off-platform purchase links on LIVE are kept out of the FYF in TikTok Shop markets. | C6 | rendered | **No.** Already rejected by the sweep. |

---

## 4. Scout claims: confirmed, corrected, refuted

### 4.1 Stage-1 sweep (`research/tiktok/08-sweep/sweep-2026-09-28.json`)

| # | Claim (path) | Verdict | Why |
|---|---|---|---|
| 1 | Unoriginal content is FYF-ineligible: copied, repurposed without creative edits, or combined from several sources with little value. (`scouts[5].findings[6]`) | **CONFIRMED** (snippet → rendered) | O1, O2, O3 match almost word for word. |
| 2 | Same finding: creators report "Not eligible for For You Page due to unoriginal, low quality, or QR content". (`scouts[5].findings[6]`) | **NOT SETTLED** | This is a user report. The version in force has no "QR" anywhere (§2.8). |
| 3 | TikTok requires an AI label on realistic AI-generated or significantly edited images, audio or video, and "encourages it otherwise". (`scouts[5].findings[7]`) | **CORRECTED** | The requirement is for content showing "realistic-looking scenes or people" (A1). For audio, it applies when AI "mimics the voice of a real person" (A5). Generic TTS, artistic styles and small edits are exempt (A6). A caption, sticker or watermark is as valid as the label (A3). No text "encourages" labelling otherwise; it says "you can also use our AIGC label". |
| 4 | "TikTok says the label does not reduce engagement/reach for content that is otherwise eligible." (`scouts[5].findings[7]`, `summary`, `tactics[9]`; `critic.verify_first[9]`) | **NOT SETTLED** | No capture addresses reach (A11). The support page that was meant to settle it rendered as an empty shell. |
| 5 | Multiple accounts are allowed "but not to deceive others or break the rules"; trading engagement, spam, impersonation and fake reviews are banned. (`scouts[5].findings[8]`) | **CONFIRMED, and stronger** | I1 and I4 are verbatim. I2 adds that "Using automation to run many accounts or send repetitive content" is spam. |
| 6 | REJECT the 5-20-account network per audience segment. (`scouts[5].tactics[7]`) | **CONFIRMED** on TikTok's own text | I1, I2, I7, I8. |
| 7 | "It needs the AI label if the voice is Kokoro." (`scouts[5].tactics[0]`) Also "Kokoro voice counts as realistic audio in my reading". (`scouts[5].tactics[9]`) | **REFUTED** as a TikTok requirement | A6 exempts "generic text-to-speech (TTS) narration, when the TTS isn't a recognizable voice of a known individual". We still disclose, under our own rule (L2). |
| 8 | Open question: does a Kokoro voiceover over our own screen recording count as realistic AI audio that must be labelled? (`scouts[5].open_questions[4]`) | **ANSWERED: no** | See A6 and S1. The rendered guidelines answer it, not the support page. |
| 9 | Open question: does an on-screen QR code alone trigger the FYF flag? (`scouts[5].open_questions[5]`) | **NOT SETTLED** | QR is absent from the version in force. Keeping QR codes off screen stays a harmless precaution. |
| 10 | Our own product footage "clears the FYF originality rule". (`scouts[5].tactics[0]`) | **CONFIRMED with a caveat** | It is necessary, not sufficient. "Low-quality or minimally edited" content is still ineligible (O3). The same tactic also needs the **commercial disclosure setting** (C1), which the scout did not mention. |
| 11 | Identical cross-posts are out, and each cut must add creative edits. Repurposing "depends on where 'creative edits' draws the line". (`scouts[5].tactics[1]`; `critic.verify_first[9]`) | **CONFIRMED; the line is not drawn** | O1 and O3 give only negative examples, and "creative edit" is undefined (O4). Nothing calls re-posting one's own original clip unoriginal. |
| 12 | "Comment KEYWORD and I'll DM you": REJECT as engagement bait. (`scouts[5].tactics[8]`; `critic.notes`) | **CONFIRMED on MISSION grounds; the TikTok basis is corrected** | The guidelines do not name comment-for-DM funnels (I5 names "Like-for-like" and false incentives). The rejection rests on customer contact (MISSION rule 1) and on honesty. |
| 13 | Discover on TikTok, check out off-platform through the bio link and Gumroad. (`scouts[5].tactics[3]`) | **CONFIRMED for ordinary videos, with two notes** | No rule bars it for ordinary videos. The off-platform-purchase penalty applies to LIVE in TikTok Shop markets (C6). Own-product promotion still needs the disclosure setting (C1). |
| 14 | "No scout covered commercial disclosure" (my check of all nine scouts' `disclos` hits). | **GAP** | The sweep's `disclos` hits are about three things: AI-use disclosure, a disclosed affiliation on Reddit (`scouts[0].tactics[5]`), and a disclosure line on our own PCN874 page (`scouts[8].tactics[6]`). None mentions TikTok's content disclosure setting for own-brand promotion (C1, C2). |
| 15 | A Hebrew AI voice using Kokoro for the PCN874 or il-biz-tools demos. (`scouts[1].tactics[0]`; `scouts[3].tactics[6]`) | **CORRECTED** (repo), for any Hebrew-language demo | Kokoro has no Hebrew voice (`research/faceless-youtube/scouts/production-stack.md:43`, `:125`). Scout 1 says "Hebrew AI voice (Kokoro…)" outright. Scout 3 does not name the language, but the validator's audience is Israeli. A Hebrew demo needs another TTS or captions. TikTok's rules do not decide this. |
| 16 | Faceless AI-voice explainers and demos, with AI use declared. (`scouts[4].tactics[1]`, `scouts[6].tactics[2]`, `scouts[7].tactics[2]`) | **CONFIRMED** as allowed by TikTok | No rule requires a face (S4); generic TTS is exempt (A6). Declaring AI is our own choice, and TikTok accepts it by caption (A3). Add commercial disclosure when the product is promoted (C1). |

### 4.2 Other repo claims these captures bear on

| Claim (file) | Verdict | Why |
|---|---|---|
| "TikTok has required the AI-generated label on all AI video since Mar 2026" (`research/tiktok/07-ai-money-tooling.md:134`; the same "mandatory since Mar 2026" framing at `:65`, `:166`, `:198`) | **REFUTED** for the version in force | The requirement covers realistic-looking people and scenes. Artistic styles and generic TTS are exempt (A1, A6). |
| TikTok's own example of suppressed content is "a Reddit thread in a generic robot voice over unrelated gameplay footage"; "QR-code spam" and "static imagery" are FYF-ineligible (`research/tiktok/06-faceless-video-tooling.md` §3.3, `distribution--short-video.md` §3) | **NOT in the 2026H2 text** | §2.8. They may be from an earlier version (see the archive URL in §5). The "captions over narration" advice in tiktok/06 still stands on the Hebrew-quality grounds in the repo. It no longer rests on a quoted TikTok rule. |
| "a Kokoro-narrated screen recording … is synthetic audio, so it **must** carry the platform's AI label", said to be "already a repo rule in `docs/REJECTED.md`" (`research/tiktok/08-reads/tj-tiktok.md:214`) | **CORRECTED** | `docs/REJECTED.md:54` forbids publishing AI content "without the **required** label". For generic TTS, TikTok requires none (A6). The disclosure duty comes from our own constitution (L2), not from TikTok. |
| "What is prohibited is behaviour, not count" for multiple accounts (`research/tiktok/01-monetization-israel.md` §7d) | **CONFIRMED** | I1 and I2. |
| "no TikTok policy page was opened directly" (`docs/REJECTED.md:61`) | **Superseded, for these two pages** | The guidelines and the originality article are now rendered. The rejection verdict is unchanged: none of this opens a payout to Israel. |

---

## 5. URLs worth rendering next

Every URL below appears verbatim in a capture. Where the capture has a `{lang}` placeholder, render
with `en`. `support.tiktok.com` pages came back as empty app shells (§1), so they need a renderer that
executes JavaScript, or a different form of the page.

1. `https://www.tiktok.com/transparency/{lang}/supporting-responsible-transparent-ai-generated-content`
   (CG, AIGC block). Most likely to say whether TikTok auto-labels through C2PA and whether the label
   changes distribution (A11, A12).
2. `https://www.tiktok.com/safety/{lang}/policies-and-engagement/cg-archive` (CG `lastUpdate`). The
   previous guideline versions. Settles whether the "robot voice", "QR" and "static imagery" examples
   were real and when they left (§2.8).
3. `https://support.tiktok.com/{lang}/business-and-creator/creator-and-business-accounts/promoting-a-brand-product-or-service`
   (CG, commercial block). How the content disclosure setting works, what label viewers see, and
   whether "your brand" content is distributed differently (C1).
4. `https://support.tiktok.com/{lang}/using-tiktok/creating-videos/ai-generated-content` (CG). The
   same page that failed here; re-render it with JavaScript.
5. `https://www.tiktok.com/legal/page/us/terms-of-service/en` (CG, Enforcement block). Upgrades the
   automation clause that `research/tiktok/01` §7a holds at 🟡 from third-party quotes.
6. `https://www.tiktok.com/creator-academy/article/creator-code-of-conduct/?lang={lang}` (CG,
   Monetization block).
7. `https://www.tiktok.com/creator-academy/en/article/guidelines-recommendation-system-intro?search=recommendation+system`
   (OR, article body). How the FYF ranks; may define originality signals.
8. `https://www.tiktok.com/transparency/{lang}/recommendation-system` (CG, FYF block).
9. `https://www.tiktok.com/legal/page/global/bc-policy/en` (CG). The branded content policy. Only
   needed if the colony ever takes third-party pay (C3).

The Creator Academy navigation in OR also lists the articles `ai-generated-content-label`,
`content-check-lite` and `account-check` by slug only. No full URL for them appears in any capture, so
none is constructed here. Scout 5 cited
`https://www.tiktok.com/creator-academy/en/article/ai-generated-content-label` from a search result;
rendering that URL would read the label article itself.
