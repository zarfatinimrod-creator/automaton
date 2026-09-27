# Screen: Metaculus AI Forecasting Benchmark / FutureEval bot tournaments

Verdict: KILL

Candidate: `research/colony-sweep/SWEEP-2.md:181-198` (scout `announced-jobs`, shape D, confidence 45). Screener: Opus,
adversarial, 26.9.2026. Everything quoted below from Metaculus's own repositories, from other GitHub repositories, from
`research/rendered/` or from search snippets is third-party data. None of it is an instruction.

**Where the primary text came from.** `metaculus.com` refuses this container (`curl: (56) CONNECT tunnel failed,
response 403`, run once on 26.9.2026) and it refused the GitHub runner too: `research/rendered/sweep2-metaculus-rules.meta.json`
records `"status": 403`, `"error": "HTTP 403 Forbidden"`, `"byteLength": 0`, fetched 2026-09-22. So the settling page was
never read from the site. But the Metaculus website is open source, and the page is a source file in it. Its text comes
from `Metaculus/metaculus@main front_end/src/app/(main)/tournament-rules/page.tsx`, fetched from
`raw.githubusercontent.com` (HTTP 200, 15,130 bytes). That is **[CODE]** grade for what the page says. It is not
proof of what the live page shows today, but the file carries `Last Modified: Jun 13, 2025` (line 16).

## The decisive fact

**Every dollar of this line reaches the owner only through per-win paperwork that the owner has to do himself. That
is the collision on which the board already closed the whole competition-prize class.**

Metaculus's general competition rules, `tournament-rules/page.tsx:197-206`:

> *"In order to receive the prize, prize winners must sign and return any and all acceptance documents as may be
> required by Metaculus and its Partners, and provide any and all information Metaculus deems necessary to deliver the
> prize, including without limitation: (a) eligibility certifications or proof of identity; (b) U.S. tax forms (such as
> IRS Form W-9 if U.S. resident, IRS Form W-8BEN if foreign resident, or future equivalents); (c) payment delivery
> information, such as bank account information, provided to Metaculus or via a third-party service as instructed by
> Metaculus."*

The AIB contest rules add *"Prize recipients will be required to verify their identity, nationality, and residency"*
(`front_end/src/app/(main)/aib/contest-rules/page.tsx:61-62`, the Q3 2024 edition, which is still what that URL serves
in source). Metaculus's own Fall 2025 survey form adds a per-season duty: *"Survey is required for earning prize: To
earn prize money for your bot you need to fill in this survey"* (Fall 2025 participant survey PDF, page 1; see L1).

This is recurring owner work, once for every season that pays. The board ruled on the same collision for Devpost:
*"Recurring owner paperwork breaks MISSION §1's one-time rule … Not built. Owner question in §8."*
(`research/colony-sweep/BOARD.md:312`). The owner has not answered the question in §8.1, and until he does its
stated default is *"no; the line stays deferred"* (`BOARD.md:350-351`). The kill list closes the class with this
re-open condition: *"Devpost / Kaggle hackathons (deferred, not killed) | The owner answers yes to per-win paperwork
**and** an intake wave finds ≥3 events per quarter that explicitly permit AI-built entries with no human-authorship
attestation"* (`docs/REJECTED.md:1234`).

The scout called the owner setup *"One-time"* and compared it to *"the same shape as Stripe Connect onboarding"*. That
comparison is **contradicted**. Stripe Connect onboarding happens once. Here, identity, nationality and residency are
verified per prize, the acceptance documents are per prize, and the survey is per season.

**This is a kill for building now, not a finding that the venue is worthless.** L3 shows that on Metaculus's own 2025
data it is the best-evidenced member of the deferred class. It satisfies the second half of the re-open trigger on its
own: bots are *required*, there is no human-authorship attestation, and MiniBench alone runs about six rounds a quarter.
If the owner answers §8.1 "yes", this should be the first competition reopened, after the runner test below.

## L1 evidence

| Fact | Grade | Evidence |
|---|---|---|
| Metaculus runs a bot-only seasonal tournament of about $50k, three times a year, 300–500 questions | CONFIRMED | `Metaculus/metaculus front_end/src/app/(futureeval)/futureeval/components/futureeval-participate-tab.tsx:204-207`: `title: "Seasonal Bot Tournament", tag: "~$50k · 3x/year"`, *"~4-month seasons starting every January, May, and September, each with 300–500 questions"*. Fall 2025 was larger: `aib/components/cards-2025-fall.tsx` `heading2={"$58,000"}`. |
| Smaller bot-eligible pools also exist | CONFIRMED | same file:214 `tag: "~$1k · bi-weekly"` (MiniBench); `"~$7k · bot-eligible"` (Market Pulse); Metaculus Cup: *"bots aren't prize-eligible"* (:234). |
| A season is running now | CONFIRMED | `Metaculus/forecasting-tools forecasting_tools/helpers/metaculus_client.py:119-120,156`: `FE_FALL_2026_ID = ( 33121 # https://www.metaculus.com/tournament/fall-futureeval-2026/`, `CURRENT_AI_COMPETITION_ID = FE_FALL_2026_ID`. |
| Being a machine is the entry requirement here, not a violation | CONFIRMED | The general rules exclude bots unless a competition allows them: *"Unless otherwise specifically permitted in the Competition-specific rules, automated systems, bots, artificial intelligence … are ineligible for tournament prizes"* (`tournament-rules/page.tsx:157-161`). The AIB rules allow bots and require *"No human in the loop"* (`front_end/messages/en.json:1154`). |
| The official template runs unattended on GitHub Actions every 20 minutes | CONFIRMED | `Metaculus/metac-bot-template README.md:22`: *"the bot will keep forecasting on new questions automatically every 20 minutes — no local setup needed"*; `.github/workflows/run_bot_on_tournament.yaml`: `cron: "7,27,47 * * * *"`. |
| The template is what Metaculus itself runs as its reference bots | CONFIRMED | `forecasting-tools …/official_bots/template_bot_2026_fall.py:41-42`: *"This is the template bot for the Fall 2026 FutureEval Bot Tournament. This is a copy of what is used by Metaculus to run the Metac Bots in our benchmark"*. |
| No ranking on prior success: each season is scored from that season's questions only | CONFIRMED | `Metaculus/metaculus scoring/utils.py:192-236`: entries are built only from the scores passed in for that leaderboard's questions, and `entry.take = max(entry.score, 0) ** 2` (:231). Prize share is `entry.take / scoring_take` (:540). Nothing reads past seasons. |
| Prizes go to the top of the field, and the share is squared | CONFIRMED | Same file:231 (square of the positive score) and :541-543 (*"remove take from pool since they don't get prize"*). A bot with a peer score at or below zero gets nothing. |
| Prizes below $50 are not paid and are redistributed upward | CONFIRMED | `scoring/models.py:199-205`: `minimum_prize_amount … default=50.00 … "Any remaining money is redistributed."` |
| One prize-eligible bot per person, owned by a personal account | CONFIRMED | `en.json:1156` *"One prize-eligible bot per user"*; `:1167` *"Create a personal Metaculus account to participate in the tournament"*; `users/models.py:241-245` `unique_primary_bot_per_bot_owner`; `scoring/utils.py:493` *"all non-primary bots are unconditionally excluded"*. |
| Prize survey is required every season | CONFIRMED | Fall 2025 participant survey PDF, page 1: *"Survey is required for earning prize: To earn prize money for your bot you need to fill in this survey."* Fetched from this container: `https://metaculus-web-media.s3.us-west-2.amazonaws.com/Fall2025-AIB-Participant-Survey-Google-Forms.pdf`, HTTP 200, 240,228 bytes, sha256 `533a643783d7de2bffb94d357a6377a0e7dce2c80253e417de59dc5be7b1cf5d`. |
| Code inspection; with no public repo, a review "with you" | CONFIRMED | `en.json:1157`: *"allow a member of Metaculus to inspect their code"*. Survey Q16: *"if you are a prize winner we may still ask you for a code review, but in this case will have an employee unassociated with our AI initiatives review the code with you."* Avoidable only by publishing the bot's code in full. |
| Per-win paperwork: acceptance documents, identity, W-8BEN, payment details | CONFIRMED | `tournament-rules/page.tsx:197-206` (quoted above); `aib/contest-rules/page.tsx:61-62`. |
| Prize may be paid as a gift card or prepaid card, at Metaculus's discretion | CONFIRMED | `tournament-rules/page.tsx:262-267`: *"Monetary payouts may be paid in the form of cash or a cash equivalent, which may include but is not limited to prepaid virtual cards, gift cards, or similar methods, at the discretion of Metaculus. Metaculus reserves the right to determine the specific form of payment … Taxes and fees are paid by recipients."* |
| Israel is not an excluded country | CONFIRMED (absence) | `aib/contest-rules/page.tsx`: *"except that if you are a resident of Crimea, Cuba, Iran, Syria, North Korea, Sudan, Russia, or any other place prohibited by applicable law"*. Israel is not listed. |
| Money reaches an Israeli bank with a ledger-grade transaction id | UNVERIFIED | Which form Metaculus actually uses for foreign winners is not stated anywhere I could reach. `src/revenue/ledger.ts:408-411` requires an `externalId` for every `payout`. |
| No camera or liveness step in the identity check | UNVERIFIED | The rules require identity, nationality and residency verification but name no method. The scout's *"No camera step is documented"* is true only as absence. |
| LLM inference is free for seasonal entrants | CONFIRMED (statement) / UNVERIFIED (terms) | `futureeval-participate-tab.tsx:323-324`: *"If participating in the Seasonal Bot Tournament, LLM inference costs are covered free-of-charge, courtesy of OpenAI, Anthropic, and Google."* How much, and what the form asks for (`https://forms.gle/aQdYMq9Pisrf1v7d8`, template `README.md:27`), is not visible from here. |
| US tax: 30% withholding on a prize is likely to stand even with a W-8BEN | UNVERIFIED (inference) | The rendered US–Israel treaty lists 32 articles and none is "Other Income" (`research/rendered/irs-us-israel-treaty.txt:7-39`). Whether a prize falls under any article is a legal inference, not a rendered rule. |
| Scout's ceiling: *"Structurally a lottery"*, ₪0 as in the ML-competitions ruling | CONTRADICTED for 2025 | Metaculus hardcodes past leaderboards in its site source (see L3). In Q1 2025 its template bot `metac-o1` ranked **#1** (`aib/components/leaderboard-q1.tsx:65-66`). In Q2 2025 `metac-o3+asknews` ranked **#2** (`leaderboard-q2.tsx:73-74`). 19 of 53 non-Metaculus bots were paid in Q2 2025. This is a skill contest with a thin field, not a Kaggle-scale lottery. |
| Search snippet: *"the template bots ranked 82nd out of 96 in Q2 2025"* | CONTRADICTED | Rank 82 is `metac-gpt-4o+asknews`, the template with a weak model. The same template with o3 ranked #2 (`leaderboard-q2.tsx`, parsed). The snippet merged 43 differently-modelled bots into one sentence. |
| The template still places in the money in 2026 seasons | UNVERIFIED | 2026 leaderboards are served only by `metaculus.com`, which refuses this container and refused the runner. Metaculus's `aib-analysis` repository keeps its prize sheet in `local/private_input_data/` (`aib_analysis/survey_analysis/config.py:21-29`), so it is not public. |

## L2 kill list and mission

**Recorded rulings this falls under.**

1. **Per-win owner paperwork.** `BOARD.md:78-82` and `:312` deferred Devpost on exactly this. `BOARD.md:350` puts the
   question to the owner with default "no". `docs/REJECTED.md:1234` keeps the class closed until he answers "yes". This
   is the decisive fact.
2. **"Prizes are not revenue"** (`docs/REJECTED.md:501`). The Metaculus version is weaker than a one-off grant: the
   pools recur three times a year plus fortnightly. But it is lumpy money paid to a natural person, and every point
   of `REJECTED.md:521-530` applies unchanged: US withholding, Israeli tax on foreign prize income, and the open
   question whether a prize produces a platform transaction id at all.
3. **The ML-competitions "lottery" verdict** (`scouts/bounties-grants--ml-competitions.md:57`) does **not** transfer.
   See L1. Here the kill list is narrower than the scout assumed.
4. **The 82 dead ends.** No direct overlap. The agent-economy note that *"14 such venues … zero were both open to a new
   entrant and paying more than a cent"* is snippet-grade from a repository that now returns 404, and it does not name
   Metaculus. I do not lean on it.

**Owner actions beyond the seven steps** (all in `newOwnerSteps`):

- **Create the Metaculus account.** A personal account with a brand username, then the primary bot under Settings → My
  Forecasting Bots, then the token pasted as GitHub secret `METACULUS_TOKEN`. The colony cannot do this: MISSION §1
  says *"Never open an account in the owner's name"*, and `metaculus.com` is unreachable from here anyway.
- **Get LLM credits.** Request the free seasonal credits through the Google Form. The alternative is funding an API
  key, which is a recurring spend the ₪200 float may not become (MISSION, תקציב).
- **Every paying season:** fill in the survey; sign the acceptance documents; verify identity, nationality and
  residency; file a W-8BEN; give payment details — all within Metaculus's deadline (≤180 days,
  `tournament-rules/page.tsx:188-194`).
- **If the bot's code is not fully public:** sit a code review "with" a Metaculus employee. That is a conversation, so
  the code has to be public under the brand organisation, which needs owner step 7.

**Other mandate and terms exposure.**

- **Identity.** Public exposure is the bot's username only, and winners are announced by bot name. The legal name goes
  privately to Metaculus. The survey asks *"Can we publicly share your individual survey response"*; answer "No".
- **Payout form.** Metaculus alone chooses the form of payment, gift cards included (`page.tsx:262-267`). A gift card
  is not cash in an Israeli bank. Whether a prize can be booked under MISSION rule 2 is open.
- **Multiplication.** *"One prize-eligible bot per user"* makes this one store forever, which is fine under constraints
  2 and 3. It never scales past one line.
- **Honesty.** Entering an agent-built bot is what the venue asks for. The warranty is about rights to the code, not
  human authorship (*"(ii) legally permitted to be used in that bot, for example, because of open source licensing"*,
  contest rules). The survey must be answered truthfully about how the bot was built and iterated. The rule against
  *"running a bot on questions that are open … seeing the bot's output, and then modifying the bot"* names humans. An
  agent that iterates on live output should disclose it rather than test that boundary.
- **Tax.** Probably 30% US withholding with no treaty relief (inference, above), plus Israeli income tax, reported
  under owner step 2.
- **Cost.** A 20-minute cron on a private repository would run past GitHub's free Actions minutes. Either the bot repo
  is public or the schedule is thinned to a few runs a day. Questions stay open for days, so thinning costs little.

## L3 the first stranger's money

**The payer finds us, which is the rare favourable case.** Metaculus announces the season, the questions and the
scoring. A token-registered bot is scored on that season's questions only (`scoring/utils.py:192-236`). No rank carries
over from earlier seasons. Constraint 7 comes out favourable here for the same reason it did for bounties.

**Measured from Metaculus's own source, for the two 2025 quarters where it hardcodes the leaderboard.** I parsed
`front_end/src/app/(main)/aib/components/leaderboard-q1.tsx` and `leaderboard-q2.tsx`:

| Season | Bots | Non-Metaculus bots paid | Best template (metac-*) bot | Its rank | What it would have taken if eligible* |
|---|---|---|---|---|---|
| Q1 2025, $30,000 | 45 | 10 | `metac-o1`, score 3,631 | **1** | ≈ $13,300 |
| Q2 2025, $30,000 | 96 | 19 (lowest paid $111; rank 20 got $465, `leaderboard-q2.tsx:224-229`) | `metac-o3+asknews`, score 5,131 | **2** | ≈ $4,800 |

\*Counterfactual: its squared score added to the paid entries' published `take`. This overstates slightly, because a
clone would also move the peer baseline. It is an upper-bound scenario, not a forecast.

**Against the floor.** ₪300 a month is ₪3,600 a year, or about ₪1,200 per season at three seasons a year. At any
exchange rate between ₪3 and ₪4 to the dollar that is roughly $300–400 per season, gross. In Q2 2025, 12 of 53 eligible
bots cleared $400. So in 2025 a template bot running the best available model would have cleared the floor several
times over.

**2026 is unmeasured.** The field now includes funded labs: the snippet names Mantic, Lightning Rod and the AIA
Forecaster, and `manticAI` and `lightningrod` appear on the paid list in Q2 2025. Free frontier credits for every
entrant also erode the template's edge. **ceilingClearsFloor: unknown.**

**The earliest the money could arrive.** Nothing runs until the owner creates the account. The current season is Fall
2026 (id 33121), about four months from September, so it ends around the turn of the year. For Q2 2025, which ended
30 June, Metaculus announced winners on 2025-08-20: the X status id `1958239204325879854` decodes to that date, 51 days
after the end. The Fall 2025 survey PDF was still being printed for completion on 4/17/26. Add the owner's paperwork
and a payout by a method Metaculus chooses. **Fall 2026 seasonal money cannot reach the ledger before about March
2027**, and only if the payment is cash with a transaction id. MiniBench, at about $1k a fortnight, could pay earlier,
but its payout cadence is unverified.

## Cheapest test (and what I ran)

**What I ran from this container, at ₪0 and without the owner:**

1. `curl -sS -o /dev/null -w "%{http_code}" https://www.metaculus.com/tournament-rules/` returned
   `curl: (56) CONNECT tunnel failed, response 403`. The proxy blocks it, and the scout recorded the same.
2. Read the settling page's source instead. `curl https://raw.githubusercontent.com/Metaculus/metaculus/main/front_end/src/app/(main)/tournament-rules/page.tsx`
   returned 200 and 15,130 bytes; quotes above. The same route worked for `aib/contest-rules/page.tsx` (200, 34,750),
   `scoring/utils.py`, `scoring/models.py`, `users/models.py`, `front_end/messages/en.json` and
   `futureeval-participate-tab.tsx`.
3. Parsed `leaderboard-q1.tsx` and `leaderboard-q2.tsx` for rank, `totalSpotScore`, `take`, `prize` and `isMetacBot`.
   Q2 output: `96 rows; 19 paid; total $30,000; min prize $111; last paid rank 30`; `metac-o3+asknews rank 2 score
   5131.07 counterfactual share 0.160 -> $4808`. Q1 output: `metac-o1 rank 1 score 3631.12 counterfactual share 0.444
   -> $13330`.
4. Fetched the Fall 2025 participant survey PDF from S3 (200, sha256 above) and extracted its text.

**The test that settles the economics, if the owner says "yes" to §8.1.** It is zero-cost, needs no token and no owner,
and must run from a GitHub Actions runner:

- Using `forecasting-tools`' `MetaculusClient`, read the finished Spring 2026 (id `32916`) and Summer 2026 (id `33022`)
  tournament leaderboards.
- Find the best `metac-*` bot in each, which is the template running each model.
- Compute the share it would have taken if eligible, as in step 3 above.
- The first API call is itself a test. `render-watch` got a 403 from `metaculus.com` on a runner.

**Pass:** in both seasons the best template bot scores above zero, ranks in the top 15 of prize-eligible entries, and
would have taken at least $400 of the pool.

**Kill:** any one of these —
- the API refuses the runner;
- the best template bot's score is ≤ 0 in either season;
- its counterfactual prize is under $300 in either season.

Even a pass only reopens the line if the owner has also answered "yes".

## URLs to render

`metaculus.com` refused the GitHub runner on 2026-09-22, so the Metaculus URLs below may fail the same way. A second
403 is worth recording as such. Each URL is quoted verbatim from a source I read.

- `https://forms.gle/aQdYMq9Pisrf1v7d8`. From `Metaculus/metac-bot-template README.md:27`, *"get free credits via [this
  form]"*. It shows what the owner must supply to get the free inference: name, email, identity or bot token. This
  decides whether "free LLM" costs an owner step or money.
- `https://www.metaculus.com/futureeval/participate/`. From `README.md:2`, *"for more info and tournament rules"*.
  These are the current season's rules. The only AIB rules text in source is the Q3 2024 edition.
- `https://www.metaculus.com/tournament/fall-futureeval-2026/`. From `metaculus_client.py:120`. Gives the current
  season's pool, dates and any bot-eligibility change.
- `https://www.metaculus.com/notebooks/38928/ai-benchmark-resources/`. From `README.md:44`, *"Instructions for getting
  your METACULUS_TOKEN, OPENROUTER_API_KEY"*. Needed for the account and credit mechanics.
- `https://www.metaculus.com/help/scores-faq/#tournaments-section`. From `tournament-rules/page.tsx:254`, the
  *"Tournament Scoring Rules"* the prize follows.
- `https://metaculus-web-media.s3.us-west-2.amazonaws.com/Fall2025-AIB-Participant-Survey-Google-Forms.pdf`. From a
  search result. It is readable from this container. Rendering it stores the survey in the repository, so the quotes
  above can be checked without my scratch copy.

## What would change my mind

- **The owner answers BOARD §8.1 "yes" for Metaculus specifically**, and knows the full list: survey, acceptance
  documents, identity/nationality/residency, W-8BEN and payment details, once per paying season. That removes the
  decisive fact. The line would then be **TEST_FIRST** on the runner test above, not SURVIVES, because three
  load-bearing facts would remain unverified: the 2026 standing of the template, a camera-free identity check, and a
  cash payout with a transaction id.
- **A rendered Metaculus page or winner note showing how foreign winners are paid** (bank wire or PayPal, with a
  reference) and how identity is checked (document upload, no liveness). That closes two of those three facts.
- **In the other direction**, any of these would kill the line even after an owner "yes":
  - Metaculus's API refuses GitHub runners;
  - the Spring and Summer 2026 template bots rank with peer score ≤ 0;
  - Israeli winners are paid only in gift cards.
