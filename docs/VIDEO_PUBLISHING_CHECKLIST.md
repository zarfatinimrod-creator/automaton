# Video publishing checklist — every surface

**בעברית, בקצרה:** רשימה אחת לכל סרטון שיוצא בשם המותג — בדף שלנו, ביוטיוב, ואם אי-פעם תהיה החלטה על
כך, בטיקטוק. כל שורה אומרת אם זה כלל של הפלטפורמה או כלל שלנו, ומי בודק אותה: קוד, סוכן בודק, או עיני
הבעלים. השורות שמסומנות **עיני הבעלים** הן דברים שרק מי שמחזיק בחשבון רואה. הן **לא** נוספו לרשימת הצעדים
של הבעלים (`docs/OWNER_STEPS.he.md`): אין חשבון טיקטוק, ושאלת טיקטוק בכלל מחכה להכרעת Fable (F1).

Source: the TikTok study, `research/tiktok/08-sales-marketing-lessons.md` §8.1 N12 and §5.1, which rests on
`research/tiktok/08-reads/tiktok-policy.md` (TikTok's Community Guidelines "2026H2update", in force from
24.9.2026, and the Creator Academy originality article of 26.9.2026, both rendered). The YouTube rows rest on
`research/faceless-youtube/T1-PROTOCOL.md` and the gate in `src/revenue/publication-gate.ts`.

## Where a video can go today

| Surface | Route | Status |
|---|---|---|
| Our own pages (il-biz-tools) | Self-hosted `<video>`, `preload="none"`, a poster frame, burned-in captions and a `.vtt` track. Never a YouTube iframe: the site's CSP has `frame-src 'none'` and its pages promise cookie-free counting | Nothing is public until the site passes its own publish gate (step 8, the brand mailbox as accessibility contact, and the deploy route) |
| YouTube | An audited publisher's free tier (T1's Stage A), or a manual upload by whoever is signed in to the brand Google account. Never our own unaudited API project: unaudited uploads are locked private with no appeal (`research/rendered/youtube-private-lock-help.txt:84`) | Waits on T1 (`research/faceless-youtube/T1-PROTOCOL.md`) |
| TikTok | Manual in-app posting by the account holder, or nothing. Unaudited API clients post `SELF_ONLY`, and TikTok's Developer Terms mark an own-account upload tool "Not acceptable" | **No account exists.** Whether the brand is on TikTok at all is Fable question F1 (§7.1 q1 of the note). A yes must say who does the owner's-eyes rows below, how often, and for how long |

## The checklist

"Rule of": **platform** = the platform's own written rule, quoted in the source; **ours** = stricter than the
platform, from `MISSION.md` / `constitution.md` or a board ruling. "Checked by": **code** = a check that
fails the publish; **auditor** = a separate agent's recorded verdict, never the author's; **owner's eyes** =
only the account holder can see or set it.

| # | Item | Surfaces | Rule of | Checked by | Source |
|---|---|---|---|---|---|
| 1 | **Our own footage, really edited.** A screen recording of our own tool with a script, zooms, callouts and a worked number. No GIF-only or lightly trimmed clip, nothing re-uploaded from someone else | all | platform (TikTok: unoriginal or minimally edited content is kept out of the For You feed; YouTube: reused content) and ours | auditor (YouTube: G3 originality PASS from someone other than the author) | tiktok-policy.md O1, O3, O5; faceless-youtube/VERDICT.md (reused content); publication-gate.ts G3 |
| 2 | **No foreign watermark.** Rendered by our own ffmpeg; never a free CapCut or OpusClip export that stamps its logo; the identifier grep that guards publishing also runs on the MP4's metadata | all | platform (TikTok: "someone else's visible watermark" is FYF-ineligible) and ours | auditor, plus the metadata grep once the N11 render script exists | tiktok-policy.md O1; note §8.1 N11 |
| 3 | **Commercial disclosure switched on.** Promoting "your own business, product, or service" needs TikTok's content disclosure setting; without it TikTok "may reduce its visibility", and repeated failure can restrict or ban the account | TikTok | platform | **owner's eyes** — a toggle at posting time, in the app | tiktok-policy.md C1, C2 |
| 4 | **A burned-in AI and automation line.** On screen, e.g. "קריינות: קול סינתטי (AI)" and a line that the video was produced automatically by the brand's software. TikTok does not require it for a generic synthetic voice; we declare it anyway, and a caption is a form TikTok accepts | all | ours (constitution: never deny what you are) | auditor (frame check); YouTube also G7's disclosure sentence in the description | tiktok-policy.md A3, A6, L2; publication-gate.ts G7 |
| 5 | **Stock voices only, never a clone** — not of anyone, the owner included. Kokoro has no Hebrew voice, so a Hebrew clip is on-screen text and captions, no narration | all | platform (a voice that mimics a real person needs disclosure on TikTok) and ours (never made at all) | code for YouTube (G7: only an engine in `ALLOWED_NARRATION_ENGINES`); auditor elsewhere | tiktok-policy.md A5, L3; publication-gate.ts G7 |
| 6 | **No synthetic presenter.** No AI avatar, no invented founder or spokesperson; the brand speaks as the brand and the owner never appears | all | platform (TikTok: "Pretending to be a fake person or organization with the goal of misleading people") and ours | auditor | tiktok-policy.md I3, L4 |
| 7 | **True, sourced hooks.** The question on screen in the first frame is true; every statutory figure is shown with its primary source; no doom or hype register, no bait. **No site page passes this yet:** `osek-patur.html`, `vat.html` and `allocation.html` cite secondary sources only, and their source lines say so ("מקור משני", with "הושווה לתוצאות חיפוש" or "תאריך הבדיקה לא תועד", never "נבדק"). A demo of one of them waits until its config holds a dated read of a primary page (`check.how: "read"`, note §8.1 N13); `pcn874.html` cites the Tax Authority's own circular | all | platform (TikTok: misleading claims to boost views are FYF-ineligible) and ours (MISSION rule 4) | auditor (YouTube: G4 figures re-computed, G5 the first 30 seconds deliver the title) | tiktok-policy.md I5, L7, L8; publication-gate.ts G4, G5 |
| 8 | **No news styling.** Never presented as a news report or broadcast | all | platform (TikTok bars AI content made to look like a real news source) | auditor | tiktok-policy.md A9, L8 |
| 9 | **Comments off, or left unanswered.** No customer contact; no promotional comments on other people's videos | TikTok, YouTube | ours (MISSION rule 1: the owner does not talk to customers) and platform (promotional comments rank as spam) | **owner's eyes** on TikTok (a setting at posting time); on YouTube, whoever uploads | tiktok-policy.md C8, L11; MISSION rule 1 |
| 10 | **One account, low volume, no automation.** No second account per audience, no scheduler, no pipeline that posts unattended | all | platform (TikTok: automation and many accounts are spam; an account posting much FYF-ineligible content can be made ineligible as a whole) and ours | code for YouTube (G6: at most two uploads in any seven days); **owner's eyes** on TikTok | tiktok-policy.md I2, I7, I8, L6; publication-gate.ts G6 |
| 11 | **Content check lite before posting.** TikTok's own ₪0 pre-flight for For You eligibility | TikTok | platform tool (ours to use it) | **owner's eyes** — only the account holder sees it; recurring for every post until F1 names who looks | tiktok-policy.md E3, L9 |
| 12 | **The FYF-ineligible notice as a kill signal.** A video marked ineligible in analytics stops the next one until the reason is understood; it is not argued with | TikTok | ours (a kill gate) on a platform signal | **owner's eyes** — analytics are visible to the account holder only; recurring owner viewing until F1 names who looks or a signal the agent can read replaces it | tiktok-policy.md E2, L9; note §7.1 q1 |
| 13 | **`containsSyntheticMedia = true`** whenever a synthetic voice is used — set explicitly, because the publisher's node defaults it to false | YouTube | platform (altered or synthetic content disclosure) and a board ruling for chart + synthetic-narration videos | code (G7 fails a video whose flag is unset or false) | T1-PROTOCOL.md; faceless-youtube/PREREG-DECISIONS.md §2; publication-gate.ts G7 |
| 14 | **No `publish_at`.** Publish immediately: a scheduled video stays private until its time, which cannot be told apart from a private lock | YouTube | ours (T1-PROTOCOL) | auditor today — machine-checkable but **not yet in `publication-gate.ts`**, whose `scheduledAt` feeds only the cadence gate | T1-PROTOCOL.md |

## What this does not change

- It is a checklist for when a video exists. It orders no video. The silent screen demo (note §8.1 N11) is not
  built yet, and every YouTube upload still passes `checkPublication()` (G1–G10) first. Of the pages N11 names,
  only `pcn874.html` can pass row 7 today; `osek-patur`, `vat` and `allocation` wait on a primary read (row 7).
- The rejected tactics stay rejected (note §8.4): paid boosting, comment-to-get, several accounts, AI avatars or
  invented founders, voice clones, watermarked free-editor exports, news-styled AI clips, and recurring manual
  TikTok posting by the owner.
- Nothing here adds a step to `docs/OWNER_STEPS.he.md`. The owner's-eyes rows only ever apply if F1 says yes, and
  then F1 must say who looks.
