# YouTube Kids render check: 22 captures against ASSESSMENT §10 (28.9.2026)

Reader for family `youtube-kids-evidence` (Opus). Input: the 22 `yk2-*` captures a GitHub runner fetched on 28.9.2026
(render commit 9761972 per the dispatch), read against `research/youtube-kids/ASSESSMENT.md` (recommendation D, no new
channel). Grades: rendered, github, snippet, repo, none. 0 WebSearch; 12 raw GitHub files fetched for the Hebrew voices.

## Hebrew voice in `products/parent-guides`: no non-commercial voice is in use

Checked read-only at 23:26 and 23:31 UTC. `products/parent-guides/` does not exist on main. It exists only in the builder's
worktree `.claude/worktrees/wf_e0760bd5-9fd-5/products/parent-guides/` (created 23:28; `requirements.txt`, fonts, a
`.venv`; no code yet). Its `requirements.txt:8-9` pins "Kokoro-82M (weights Apache-2.0) through kokoro-onnx (MIT), driven
with Hebrew IPA from" / "Phonikud's rule-based G2P (CC BY 4.0". That is the licence-clean chain of claim 25. It is not the
non-commercial Hebrew voice. The installed phonikud 0.4.1 ships a CC BY 4.0 `LICENSE` and downloads no weights. No file
under `products/`, `src/` or `scripts/`, in main or in either worktree, names he_shaul, kokoro-hebrew, SASPEECH,
voices-hebrew, BlueTTS, pocket-tts or renikud (grep, 23:30 UTC). The other worktree, `wf_eba3c287-2b9-1`, is building a
Gumroad product.

[checker 28.9] State at 23:48 UTC, after the reader's check: the worktree now has code (`tts.py`, `render.py`, `spec.py`,
`specs/`; still being edited). The same grep still finds none of those names, so "no non-commercial voice is in use"
holds. The voices file is Kokoro's `voices-v1.0.bin` from the kokoro-onnx `model-files-v1.0` release, sha256-pinned
(`tts.py:28-32`). But the **default render is voiced, not silent**: `DEFAULT_VOICE = "ef_dora"` (`tts.py:34`) and
`ap.add_argument("--voice", default="ef_dora"` (`render.py:152` at 23:48; the file is moving). Warning 2 below is therefore live, not hypothetical. The builder has already run
the Whisper round-trip asked for below ("All 19 pass at CER ≤ 0.05", `specs/yt-kids-setup.he.json:269`), and still
requires "A native Hebrew listener must approve before anything is published." (`:270`). An ASR pass is not the listener
check that §9.3's A-he trigger and ASSESSMENT:290 ask for.

Two warnings for that builder:
1. **Never swap in the Hebrew Kokoro voice.** kokoro-onnx's Hebrew archive is "voices-hebrew.bin - kokoro-onnx compatible
   voice archive with he_shaul ." (`yk2-hf-kokoro-hebrew-nc.txt:70`). It is a "Non-commercial Hebrew Kokoro ONNX export."
   (`:60`), and its source model bars use "not for commercial or broadcast needs;" (`yk2-hf-kokoro-hebrew-saspeech.txt:138`).
   The voices file has to be Kokoro-82M's official one ("License: apache-2.0", `kokoro-82m-model-card-2026-09-28.txt:53`).
2. **Hebrew narration in an English Kokoro voice is outside ASSESSMENT §9.4.** §9.4 allows "English Kokoro narration, or
   Hebrew on-screen text;" (`ASSESSMENT.md:487`), and this chain "is **accented, and nobody has measured whether listeners
   understand it**" (`:290`). The `--voice none` silent path (`requirements.txt:9`) fits §9.4. Any voiced Hebrew take
   needs at least a Whisper round-trip before anyone is shown it. This is a scope and honesty problem, not a licence one.

## 1. What came back

All 22 slugs returned status 200, none truncated, fetched 23:21:17-23:22:03Z (`*.meta.json`). The 11 support.google.com
pages have full-text `.txt` files. For the four Hugging Face cards, the licence and dataset fields were also read from the
JSON in the HTML (`"license"`, `"datasets"`). Several subjects differ from what ASSESSMENT §11 expected:

| Slug | What the page is | Against §11's expectation |
|---|---|---|
| yk2-yt-9528076 | "Determining if your content is made for kids" | Not the list of what MFK switches off; that list is in 9527654 |
| yk2-yt-9527654 | "Set your channel or video's audience": the full feature list, the override rule, appeals | §11 #10 "subject unconfirmed": now confirmed, and it is the key page |
| yk2-yt-9632097 | "Watching made for kids content": the viewer-side feature list | as expected |
| yk2-yt-10774223 | "Best practices for kids & family content": the quality principles | as expected |
| yk2-yt-9229229 | "Best practices for content with children": minors on camera (consent, permits, wages) | Not about quality; no bearing on a faceless channel |
| yk2-yt-9713557 | Ads for supervised accounts and MFK content | as expected |
| yk2-yt-1727191 / 9235730 / 9914702 | Monetization disabled / YPP rejection FAQ / AdSense for YouTube setup | as expected |
| yk2-yt-2801999 | Child safety policy | §11 #17 "subject unconfirmed": confirmed |
| yk2-yt-15447836 | "How this content was made" disclosures | as expected |
| yk2-dev-made-for-kids-status | API guide, "Last updated 2026-09-14 UTC." (`:205`) | as expected |
| yk2-blog-mfk-privacy | Google Ads blog, 18.8.2023, updated 7.9.2023 | as expected |
| yk2-ftc-channel-owners / yk2-ftc-case-google-youtube | FTC staff blog of 22.11.2019 with comments / the 2019 case record | as expected |
| yk2-howyoutubeworks-kids, yk2-fortune-ai-slop-letter, 4 × yk2-hf-*, yk2-openslr-134 | | as expected |

28 of §11's 50 URLs are still unrendered, including P1 rows #3 (answer/10938174), #4 (the YouTube Kids creator topic), #12
and #36 (Chatterbox).

## 2. Claims table (ASSESSMENT §10)

Old grade and verdict are as ASSESSMENT §10 has them. Every quote was checked with `grep -n -F` against the file named: 88
rendered quotes; one wrapped line was fixed and re-checked. Files are in `research/rendered/` unless another path is given.

| # | Claim | Old grade (verdict) | New grade | Verdict | Quote (file:line) |
|---|---|---|---|---|---|
| 5 | MFK is monetized under the kids quality principles; a strong low-quality MFK focus may suspend YPP | rendered (CONFIRMED) | rendered, 2 sources | **CONFIRMS** | "If a channel is found to have a strong focus on low-quality “made for kids” content, it may be suspended from the YouTube Partner Program." and "If an individual video is found to violate these quality principles, it may get limited or no ads" (`yk2-yt-10774223.txt:104`) |
| 6 | "Hard to follow" names autogeneration as a cause; the scope may widen | rendered (CONFIRMED) | rendered, 2 sources | **CONFIRMS**; adds who sets the bar | "This type of video is often the result of mass production or autogeneration." (`10774223:96`); "We’ll continue to reevaluate and update the principles on this page." (`:68`); "These principles were developed with child development specialists" (`:64`) |
| 7 | MFK removes comments and notifications; the rest of the list is snippet | rendered + snippet (SYNTH) | rendered (the full list) | **UPGRADES** the list; **CORRECTS** "Stories" (it is in neither rendered list; "Posts" is, at channel level) | "Features not available on made for kids watch or playback pages:" (`yk2-yt-9632097.txt:67`), including "Cards or end screens" (`:71`), "Personalized advertising" (`:87`), "Save to playlist and Save to Watch Later" (`:93`); channel level: "Posts" (`yk2-yt-9527654.txt:267`) |
| 8 | Personalized ads are off for under-18 and supervised viewers; MFK carries ads with a bumper | rendered (SYNTH) | rendered, 3 sources | **CONFIRMS**; adds contextual-only ads and category bans | "Viewers of “made for kids” content may see an ad bumper before and after a video ad is shown." (`9632097:119`); "Contextual ads can be served on YouTube for supervised accounts and on content set as made for kids." (`yk2-yt-9713557.txt:67`); "Food and Beverage : Products related to consumable food and drinks are prohibited, regardless of nutrition content." (`9713557:103`) |
| 9 | Personalized ads are off on every MFK view, for any viewer | github relay (UNSETTLED) | **rendered** | **UPGRADES → CONFIRMED** | "Most importantly, we don’t serve personalized ads on kids content" (`9527654:223`); "we prohibit ads personalization on made for kids content on YouTube, regardless of the viewer’s age." (`yk2-blog-mfk-privacy.txt:129`); prohibited for "Content set as made for kids" (`9713557:61, :65`) |
| 10 | No first-party MFK RPM exists; vendor bands disagree | github (PARTLY) | rendered (direction); github (bands) | **CONFIRMS** there is no figure; **UPGRADES** "A lower rate per" / "view" (`ASSESSMENT.md:159-160`) from inference to a first-party direction. [checker 28.9] Only the direction of revenue is first-party, and it is hedged ("may", "some creators"); no per-view rate is stated | "Not serving personalized ads on kids content may result in a decrease in revenue for some creators who mark their content as made for kids." (`9527654:223`); advertisers have "a one-click option that allows them to opt out of made for kids content on YouTube." (`blog-mfk-privacy:149`) |
| 11 | An MFK channel at the gate earns about ₪6-72; ₪20,000 needs 2.8-21.6M views | repo arithmetic on snippet (PARTLY) | unchanged | **CONFIRMS** the direction only; the magnitude is still vendor-grade | as claim 10 |
| 12 | The Kids app selects videos automatically; no creator opt-in is rendered | rendered (PARTLY) | rendered | **UPGRADES**: the quality principles "guide decisions" on inclusion [checker 28.9: was "inclusion is gated by"; the page says guide, not gate]. Still no creator opt-in and no path for AI-made channels | "They also guide decisions both for inclusion in YouTube Kids and channel and video monetization" (`10774223:104`); "Videos that you set as “made for kids” are more likely to be recommended alongside other kids’ videos." (`9527654:91`) |
| 14 | A spokesperson: AI content in the app is limited to "a small set of high-quality channels" | github (PARTLY) | **rendered** | **UPGRADES**; still a press statement, not policy | "We have high standards for the content in YouTube Kids, including limiting AI-generated content in the app to a small set of high-quality channels," (`yk2-fortune-ai-slop-letter.txt:77`), dated "April 1, 2026, 4:11 PM ET" (`:52`) |
| 15 | Fairplay: top AI kids channels earn over $4.25M a year | github (PARTLY) | rendered | **UPGRADES** the grade; the verdict stays PARTLY (an advocacy estimate with no method) | "Fairplay found that top AI slop channels targeting children have earned over $4.25 million in annual revenue" (`fortune:73`); the letter "was signed by more than 135 organizations" (`:63`). New: it asks to "ban AI-generated content entirely from YouTube Kids; and prohibit AI-generated “made for kids” content on the main YouTube platform." (`:83`) |
| 16 | Enforcement may reach all accounts; T1 contagion is inference | rendered (PARTLY) | rendered | **UPGRADES**, and **CORRECTS** §7's "no rendered source says a person holds only one AdSense account" | "Severe violations of our YouTube channel monetization policies may result in monetization being permanently disabled on any of your accounts." (`yk2-yt-1727191.txt:70`); "You can only have one AdSense or AdSense for YouTube account under the same payee name" (`yk2-yt-9914702.txt:63`); "You can also monetize more than one YouTube channel using the same AdSense for YouTube account." (`9914702:67`); "You can appeal this decision within 21 days or re-apply to the program 90 days after suspension." (`1727191:92`). [checker 28.9] The same page also says, for a scheduled suspension whose appeal is rejected, "You cannot appeal your suspension, but you can re-apply to YPP 90 days after your suspension date." (`1727191:100`). The contagion stays a "may": no capture says a channel's YPP suspension acts on the shared AdSense account itself |
| 17 | A pre-reader cannot read the AI disclosure; labels may appear in the description | rendered (PARTLY) | rendered | **CONFIRMS**; adds that dedicated Kids-app AI labels are still in development, per a press statement with no timeline [checker 28.9: was "Kids-app labels do not exist yet", which the statement does not say] | "This information, found in the video player or description" (`yk2-yt-15447836.txt:61`); "the spokesperson confirmed that YouTube is developing dedicated AI labels for YouTube Kids, though did not provide a timeline." (`fortune:87`) |
| 18 | Embedding an MFK video obliges tracking off | rendered (SYNTH) | rendered, 2 sources | **CONFIRMS** | "Embedding MFK YouTube videos mandates disabling tracking and ensuring data collection complies with laws like COPPA." (`yk2-dev-made-for-kids-status.txt:159`). [checker 28.9] Line 159 sits under the page's "Page Summary", which the HTML marks `data-tooltip="Generated with AI"` (`yk2-dev-made-for-kids-status.html:1442`). Cite the authored body instead: "you are required by Section III.E.4.j of the" / "Developer Policies to turn off tracking" (`:171-172`). Verdict unchanged |
| 19 | The API carries `selfDeclaredMadeForKids`; Upload-Post's default is unknown; the G11 read-back route | rendered + repo (SYNTH) | rendered | **UPGRADES** the read-back route. **ADDS** the override lock and one contradiction. Whether an API key alone suffices is still not stated | "The status.madeForKids property within the videos resource will define if the video is an MFK video or not, when using the videos.list endpoint." (`dev:165`), after "Create or access your Google developer account via" (`dev:180`) [checker 28.9: `:165` is in the AI-generated "Page Summary"; the authored steps are "videos.list endpoint." (`:188`), "Include, at minimum, the id and status parts in the" (`:192`) and "status.madeForKids" (`:197`)]; YouTube "may override your audience setting choice in cases of error or abuse." (`9527654:85`); "You won't be able to change your audience setting." (`:93`); "You may appeal each video only once." (`:333`). Contradiction: "For now, please use YouTube Studio to upload made for kids content." (`:77`), against the rendered API field (`youtube-api-videos-insert.txt:366`) |
| 20 | COPPA: the $170M settlement; channel owners designate; the $10M Disney settlement | snippet (UNSETTLED) | **rendered** (Disney still snippet) | **UPGRADES**: $170M, the designation mechanism, and foreign operators. **CORRECTS**: $42,530 is now rendered, but dated 2019 | "agreed to pay a $170 million civil penalty" (`yk2-ftc-case-google-youtube.txt:491`); "YouTube and Google agreed to create a mechanism so that channel owners can designate when the videos they upload to YouTube are" (`yk2-ftc-channel-owners.txt:467`); an FTC staff reply: "Foreign-based websites and online services must comply with COPPA if they are directed to children in the United States" (`:553`); "The Rule allows for civil penalties of up to $42,530 per violation" (`:515`) on a post dated "November 22, 2019" (`:461`), a historical figure, still not current; "it is your legal responsibility to comply with COPPA and/or other applicable laws and designate your content accurately." (`yk2-yt-9528076.txt:126`) |
| 22 | A Hebrew Kokoro voice exists but is non-commercial | github (SYNTH) | **rendered** | **UPGRADES → CONFIRMED** | "Non-commercial Hebrew Kokoro ONNX export." (`yk2-hf-kokoro-hebrew-nc.txt:60`); "It is licensed for NON-COMMERCIAL use only." (`yk2-hf-kokoro-hebrew-saspeech.txt:78`) |
| 23 | Not every open Hebrew TTS is non-commercial (BlueTTS MIT, pocket-tts CC BY 4.0), but no provenance is proven | github (PARTLY) | rendered (weights licences) + github (no data statement) | **CONFIRMS** PARTLY; the data chains are still undocumented (§3) | "License: mit" (`yk2-hf-blue-onnx.txt:56`); "License: cc-by-4.0" (`yk2-hf-pocket-tts-onnx.txt:52`) |
| 29 | Google publishes YouTube Kids parent guides free | rendered (SYNTH) | rendered | **CONFIRMS**; adds a first-party family guide built with partners. [checker 28.9: was "more strongly". The guide covers "media literacy tips and tools for parents to share with" kids (`:329`), not YouTube Kids setup, and nothing says it is free or in Hebrew, so it does not strengthen the claim as worded] | "in partnership with National PTA and Parent Zone to cover" (`yk2-howyoutubeworks-kids.txt:328`) |
| 30 | The app cannot be captured (ToS:120); render-watch fetches youtube.com | github + rendered + repo (PARTLY) | unchanged | **ADDS** one instance: the runner fetched a youtube.com page that §11 #29 said to hold until §9.5 item 4 is ruled | `yk2-howyoutubeworks-kids.meta.json:2` (url `https://www.youtube.com/howyoutubeworks/kids-and-teens/`) |
| 32 | Step 8's account conflicts with RED-TEAM §2.2 | repo (SYNTH) | repo + rendered | **ADDS**: a dedicated channel account separates the login, not the payee | "This account may be different from the sign in credentials you use to sign in to YouTube." (`9914702:111`); "if you already use AdSense for other reasons outside of YouTube, sign in with the Google account used with your existing AdSense account." (`9914702:87`) |

Rules that are not numbered claims. R12 is confirmed by current policy: "ensure your audience selection matches the audience
your content is suitable for." (`yk2-yt-2801999.txt:64`). R16's reapplication is confirmed, and a rejection comes from
"our human reviewers" (`yk2-yt-9235730.txt:60`); "you can re-apply to the YouTube Partner Program 30 days after you get
your rejection email." (`9235730:64`). 9229229 opens with "Anyone posting content with minors must do the following:"
(`:63`) and has no bearing on a faceless channel.

**No yk2 capture bears on claims 1-4, 13, 21, 24-28, 31 or 33-37**, so their grades are unchanged. **Nothing is refuted.**

## 3. Hebrew voices: model licence, data licence, commercial audio

| Voice | Model / weights licence | Training-data licence | Commercial use of generated audio | Grade |
|---|---|---|---|---|
| **kokoro-hebrew-nc** (ONNX, voice he_shaul) | "License: other" (`:49`); "Non-commercial Hebrew Kokoro ONNX export." (`:60`) | Inherited: "Use is subject to the original model and dataset terms." (`:64`), so SASPEECH | **No** | rendered |
| **kokoro-hebrew-saspeech** (the gated source of the above) | "License: saspeech-noncommercial" (`:53`), fine-tuned from "A Kokoro-82M text-to-speech model" (`:93`, whose own weights are Apache-2.0). The base licence does not help: "A code/wrapper license (e.g. MIT) does not relax these terms" (`:148`) | SASPEECH, non-commercial (`:133-135`) | **No**: "may use it for non-commercial purposes only — not for commercial or broadcast needs;" (`:138`); "commercial use, source/train a model on a commercially-licensed dataset instead." (`:159`) | rendered |
| **SASPEECH** (OpenSLR 134, the dataset) | n/a | "License: Custom non-commercial (See README)" (`yk2-openslr-134.txt:16`); "Copyright for the recordings and corresponding transcriptions is owned solely by the Israeli Public Broadcast Corporation, the IPBC." (`:57`) | **No**: "You may not make use of the Dataset for commercial or broadcast needs" (`:65`) | rendered |
| **blue-onnx** (BlueTTS) | "License: mit" (`:56`); "MIT — see the BlueTTS repository ." (`:179`); the GitHub README (linked at `:83`) says "MIT." (README.md:127) | The card lists two Hugging Face datasets (`:47`, and `notmax123/SententicDataTTS` at `:49`). Neither licence is rendered, and the GitHub README and `training/README.md` state no dataset licence (github, fetched 28.9) | **Unproven**: the weights permit it, but the speech data and the speakers' consent are not shown. "Audiobooks, accessibility, assistants, and broadcasting pipelines" (`:171`) is the author's claim, not a data licence | rendered + github |
| **pocket-tts-onnx** (Hebrew IPA adapter) | "License: cc-by-4.0" (`:52`); GitHub README.md:73 "[CC BY 4.0](LICENSE)". The Kyutai Pocket TTS base: code MIT (github `kyutai-labs/pocket-tts` LICENSE); weights licence unrendered; voice licences are on a page the README says "details the licenses" (README.md:60), also unrendered | The Hebrew adapter's training data and the bundled Hebrew voice (the "english-ipa" file comes "with the Hebrew adapter and a Hebrew voice bundled in", docs/USAGE.md:11) are documented nowhere in what was read | **Unproven** | rendered + github |
| renikud (the Hebrew G2P behind BlueTTS and pocket-tts; `blue-onnx:91`, `pocket-tts-onnx:110`) | GitHub LICENSE is CC BY 4.0 (github); the Hugging Face weights licence is unrendered | unknown | n/a (a G2P, not a voice) | github |
| Phonikud 0.4.1 (the parent-guides G2P) | CC BY 4.0 (the installed dist-info `LICENSE`) | Rule-based, no weights | Yes, with attribution | repo |

**Result:** no Hebrew voice has both its weights licence and its training-data terms rendered as commercial. The A-he
condition ("a Hebrew voice whose weights licence and training-data terms are both rendered as" commercial,
`ASSESSMENT.md:468`) and leg 3 of the 3.9 reopen trigger both stay unmet. The two Kokoro Hebrew voices are closed while
the SASPEECH terms stand, because the data owner bars both commercial and broadcast use. [checker 28.9: was "closed for
good"; the captures show today's terms, not that they can never change]

## 4. Does anything change the recommendation? No. D stands.

Every piece of evidence that moved made the case against A and B stronger:
- **A:**
  - Claim 9 is settled: no personalized ads on any MFK view.
  - YouTube itself says MFK "may result in a decrease in revenue".
  - The ad categories are narrower, and advertisers can opt out of MFK in one click.
  - Quality principles written with specialists "guide decisions" on inclusion in the Kids app [checker 28.9: was
    "is gated by"].
  - The AI-content limit is now a rendered statement.
  - A kids-channel suspension now has a rendered path to T1: one AdSense account per payee name, shared by every channel
    that payee monetizes. [checker 28.9] The shared account is rendered; that an action on one channel reaches it is
    still "may" (`1727191:70`).
- **A-he:** no commercial Hebrew voice (§3).
- **B:** the first-party competition includes a family guide built with partners (a media-literacy guide, not a YouTube
  Kids setup guide [checker 28.9]).
- **D:** the G11 read-back route is now rendered (`videos.list`, `status.madeForKids`). The override lock ("You won't be
  able to change your audience setting") is the reason the read-back exists.

## 5. What changes for FABLE_QUEUE row 16

1. **Attach this file** to row 16's input beside ASSESSMENT.md. ASSESSMENT §12's bullets on the unrendered key MFK page,
   the spokesperson statement and COPPA are now partly out of date: claims 9, 14, 20 (all but Disney) and 22 are rendered.
2. **The portfolio argument against A** (MISSION.md:44-45 [checker 28.9: was `:44`; the quoted sentence ends on line 45],
   "one platform banning us … must not be able to take the company down") is now rendered at the payment layer. One
   AdSense account per payee name serves every channel of that payee (`9914702:63, :67`). A kids-channel monetization
   action could therefore reach the account T1 would use [checker 28.9: was "would therefore land on"; every rendered
   reach is a "may", `1727191:70`]. It could also reach any other AdSense-paid line under the same legal name: the
   html5-games route names "the developer's own AdSense account" (`research/breadth/REPLENISH-2026-09-28.md:197`), one of
   the two payout routes named there [checker 28.9].
3. **ASSESSMENT §9.5 item 2** (step-8 account versus a dedicated account): a dedicated Google account separates the channel
   login, not the payee, and the AdSense sign-in may differ from the channel's (`9914702:111`). The board should rule
   knowing that account separation does not isolate payments.
4. **§9.3's A trigger 1 is half-fed.** 9528076 and 10774223 are rendered and show no admission path for new AI-made
   channels. 10938174 and the YouTube Kids creator topic are still missing. The trigger cannot reopen A on its own anyway
   (trigger 4).
5. **Row 16's `products/parent-guides/` input** existed only in a worktree when this was written; it has been on main since tick 14 (29.9). It pins a licence-clean chain, and it uses
   no non-commercial voice. Voiced Hebrew is outside §9.4's two allowed modes (see the top of this file). [checker 28.9]
   By 23:42 its default render was voiced (`--voice` defaults to `ef_dora`), so this is a live scope question for the
   board, not a future one.
6. **§9.5 item 4 (ToS:120):** add the pre-ruling fetch of `www.youtube.com/howyoutubeworks/kids-and-teens/`.
7. **For the T1 builder (Opus work, no Fable needed):** G11's read-back must expect a locked override with one appeal per
   video (`9527654:93, :333`). Help page 9527654 still says audience setting is Studio-only (`:77`), so the first T1
   upload's read-back is also the test of whether the API field is honoured.

**PROPOSED only.** The loop board did not pre-register these; they are for the Fable sitting:
- **P-1, a narration-licence gate:** publication refuses any narration from a voice whose weights and training data are
  not both rendered commercial. Today the allowlist is Kokoro-82M's official voices, and he_shaul / `voices-hebrew.bin` is
  refused by name. [checker 28.9] Kokoro passes on its author's data statement only: "Kokoro was trained exclusively on
  permissive/non-copyrighted audio data" (`kokoro-82m-model-card-2026-09-28.txt:227`), which includes "Synthetic audio [1] generated
  by closed [2] TTS models from large providers" (`:233`), whose terms no capture shows. The gate should say whether an
  author's statement counts as "rendered", or it would refuse Kokoro by the same test that leaves BlueTTS unproven.
- **P-2, a kill:** a YouTube-set "Set to Made for Kids" override on any colony video privatises it and allows one appeal,
  with no re-upload. A second override kills that YouTube line. §9.2 item 2 pre-registers only "the video goes private
  and the line is flagged to the board. Never relabel or re-upload to get around it." (`ASSESSMENT.md:422`) [checker
  28.9: was the paraphrase "private and flagged" in quote marks; the no-re-upload rule is already pre-registered, so
  P-2's new parts are the one-appeal step and the second-override kill].
- **P-3, portfolio accounting:** count AdSense as one shared rail across every AdSense-paid line, for MISSION.md:44.

## 6. Next URLs (every one seen in a capture's HTML, in a fetched GitHub file, or in ASSESSMENT §11)

| P | URL or row | Settles | Seen in |
|---|---|---|---|
| P1 | https://support.google.com/youtube/answer/10938174 | Content policies for the YouTube Kids app; any path for AI-made channels (§9.3 A trigger 1) | §11 #3; `yk2-yt-10774223.html` href "content policies for YouTube Kids videos" |
| P1 | https://support.google.com/youtubekids/topic/12985103?hl=en | Creator-side admission; how a channel becomes "verified" (claim 13) | §11 #4 |
| P1 | https://support.google.com/adspolicy/answer/9683742 | The MFK ads policy: which ads are left to fill kids inventory | new; `yk2-yt-9713557.html`, `yk2-yt-9632097.html` href |
| P1 | https://support.google.com/youtube/answer/9684541 | The MFK FAQ (override, reclassification, monetization) | new; `yk2-yt-9632097.html`, `yk2-yt-9528076.html` href |
| P2 | https://www.ftc.gov/tips-advice/business-center/guidance/complying-coppa-frequently-asked-questions | Current penalty level; FAQ B.7 on foreign operators | new; `yk2-yt-9527654.html` href; cited at `yk2-ftc-channel-owners.txt:553` |
| P2 | §11 #27 (the FTC Disney press release) | The last snippet piece of claim 20 | §11 |
| P2 | https://huggingface.co/datasets/notmax123/SententicDataTTS and §11 #42 | BlueTTS training-data licences | `yk2-hf-blue-onnx.html` href |
| P2 | https://huggingface.co/kyutai/pocket-tts and https://huggingface.co/kyutai/tts-voices | Pocket TTS weights and voice licences | github `kyutai-labs/pocket-tts` README.md:12, :60 |
| P2 | §11 #36 (Chatterbox weights) | Claim 24 | §11 |
| P3 | §11 #12 (answer/11602441) | Now largely settled by `9914702:63`; demote | §11 |
| P3 | https://huggingface.co/thewh1teagle/renikud | The G2P weights licence | `yk2-hf-pocket-tts-onnx.html` href |
| P3 | §11 #22 (AP) and #23 (the Fairplay letter PDF) | Second outlet; the method behind $4.25M | §11 |
| Hold | §11 #47 (youtube.com/yt/family) | youtube.com: wait for the §9.5 item 4 ruling | §11 |

## 7. Method and limits

- All 22 captures were read in full. The 88 rendered quotes were checked by a `grep -n -F` script (0 failures after one
  line-wrap fix).
- GitHub grade covers 12 raw files: the BlueTTS README, LICENSE and training/README; Kyutai pocket-tts README and
  LICENSE; the pocket-tts-onnx README, LICENSE, docs/USAGE.md, DESIGN.md and EXPORT.md; the renikud README and LICENSE.
  Two guessed-adjacent paths returned 404 and were not used. The copies sit in the session scratchpad and are not
  committed.
- No git command was run. The worktree state was read from `.git/worktrees/*/gitdir`, `.git/worktrees/*/HEAD` and the
  filesystem.
- Help pages change without notice. Every quote above is as fetched at 23:21-23:22Z on 28.9.2026.
- [checker 28.9] Adversarial re-check: 80 quote-with-location pairs re-run with `grep -n -F` against the cited line, plus
  the 6 GitHub-grade quotes re-fetched from raw.githubusercontent.com (all 6 match). Two location slips: `MISSION.md:44`
  (the sentence ends on `:45`, fixed) and `9713557:61, :65` (the phrase is on `:65`; `:61` is the "prohibited on YouTube
  for:" lead-in, so the span stands). Two phrases in quote marks were paraphrases, not verbatim ("lower per view",
  "private and flagged"); both replaced. The §1 page titles drop the pages' quote marks around "made for kids" and use a
  straight apostrophe; they are labels, not quotes. Claims 18 and 19 quoted the AI-generated "Page Summary" of the API
  guide; the authored lines are now cited beside them. Overstatements softened: claim 12 and §4 ("gated" to "guide"),
  claim 17 (labels), claim 29 ("more strongly"), §3 ("closed for good"), §5 item 2 ("would land" to "could reach").
  No verdict flips, and D still stands.
