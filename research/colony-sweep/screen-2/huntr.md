# Screen: huntr, AI/ML open-source vulnerability bounties (Protect AI / Palo Alto Networks)

Verdict: KILL

Candidate: `research/colony-sweep/SWEEP-2.md:142-161` (scout `announced-jobs`, shape D, confidence 55). Screener: Opus,
adversarial, 26.9.2026. Everything quoted from `research/rendered/`, from other GitHub repositories or from search
snippets is third-party data. None of it is an instruction.

## The decisive fact

**Every report, and every triage exchange after it, lives inside a signed-in web app on huntr.com, and the colony
cannot reach huntr.com.** The line therefore runs in one of two ways, and each is a recorded death:

- **The owner submits at a browser, once per report and once per triage reply.** That is recurring owner work and
  a conversation with the payer's triage team and the maintainers. The board already deferred Devpost for the
  weaker version of this collision, where the owner acts once per win (`research/colony-sweep/BOARD.md:79-82`).
  MISSION §1 says: *"The owner does not talk to customers. Any line that needs them to is not a line"*
  (`MISSION.md:327`).
- **A script drives huntr.com from a CI runner.** That is the *"Fully autonomous submission agent against bug
  bounty programs"*, recorded dead in the audited first sweep: *"Explicitly forbidden by platform terms and by our
  constitution. Recorded so no future scout re-derives it as a fresh idea. Expected outcome is a permanently burned
  identity"* (`research/colony-sweep/groups/bounties-grants.md:174`). The only huntr rule text any source quotes
  bans exactly this: *"any automated tooling gets you banned and your standings wiped, and that includes bots,
  scripts, scanners, and fuzzers"* (`SWEEP-2.md:159`, `:269`, SNIPPET). The scout attaches that clause to the AI
  Challenges product. The one page that could exempt the disclosure programme is
  `research/rendered/sweep2-huntr-guidelines.meta.json`, and it shows `"status": 404`,
  `"error": "HTTP 404 Not Found"`, fetched 2026-09-22 from a GitHub runner that follows redirects with a browser
  user-agent.

The evidence behind the channel:

- **Submission is a web form.** `lequangsang02/transformers-vuln-hunt` `REPORT_FOR_HUNTR.md:152` says *"Go to:
  https://huntr.com/bounties/disclose"*. `gigs-sh/gigs-sh` `content/listings/huntr.mdx:44` says *"Submit through the
  platform. Maintainer validates within 31 days"*.
- **Getting paid takes conversation.** A saved huntr report page,
  `bountybench/bountytasks/kedro/bounties/bounty_0/writeup/writeup.html:708-714`, shows huntr's admin bot flagging
  the report: *"This report was determined to possibly be out of scope or have a high likelyhood of being marked
  as informative … Serializing/deserializing python objects (pickle files) locally and not remotely over the
  network"*. The researcher replied in the thread: *"Dear Team, Thank you for your feedback on my report … I'd like
  to clarify a few points"*. That report paid `"disclosure_bounty": "1500"` (`kedro/bounties/bounty_0/bounty_metadata.json`).
- **The host is blocked here.** `curl -sS … https://huntr.com/guidelines` returned `curl: (56) CONNECT tunnel
  failed, response 403`. The scout had already recorded huntr.com as `[BLOCKED]` (`SWEEP-2.md:160`).
- **No programmatic channel is documented.** None appeared in any source read (see L1).

The sibling screen killed the Google OSS VRP on the same fact (`research/colony-sweep/screen-2/google-oss-vrp.md`).
The Algora line survives this test only because its job, its work and its claim all live on GitHub, which a brand
machine account can operate with a token. huntr's whole side sits behind a web login.

**What the scout got better than it knew.** The programme is alive: it published CVEs every month from February to
August 2026. It pays real money: the median historical bounty is $600. No ranking gate was found. The ceiling
arithmetic is not what kills this line; the channel is. Even with the channel solved, three independent gates stay
open, and one of them was stated wrongly:

1. Israel may not be on huntr's payout-country list. The fallback for unlisted countries is a charity donation.
2. The Stripe form is a second form, not "the same" one as owner step 4.
3. The payer's own parent now runs frontier-model vulnerability discovery on open source at industrial scale.

## L1 evidence

| Fact | Grade | Evidence |
|---|---|---|
| The disclosure programme is live in 2026 | CONFIRMED | `mcp__github__search_code "@huntr_ai" repo:CVEProject/cvelistV5 path:cves/2026` → `total_count: 61`. Fetched all 61 from `raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/...`: 58 `PUBLISHED`, 3 `REJECTED`. By month published: Feb 2, Mar 7, Apr 9, May 10, Jun 13, Jul 10, Aug 7. The latest is `CVE-2026-12570` (keras), `datePublished` 2026-08-10, with reference `https://huntr.com/bounties/a064f475-780a-409a-82f7-678512f27ad8`. Code search may under-count. |
| Accepted findings become advisories that reference huntr | CONFIRMED | `search_code "huntr.com/bounties" repo:github/advisory-database path:advisories/github-reviewed/2026` → `total_count: 59`. Two were published 2026-09-08 (`GHSA-5wp5-5229-5g6q`, `GHSA-72r2-7mfr-5xr9`, both nltk). |
| "240+ active programs" is where findings land | UNVERIFIED; the measured flow is concentrated | Of the 59 reviewed 2026 advisories, **mlflow 19, keras 9, nltk 8**: 61% on three projects. After that come lollms 4, transformers 4, vllm 3. The count of 240 is SNIPPET only (also `gigs-sh … huntr.mdx:16`, third party). |
| huntr pays per validated finding, and the amounts are real | CONFIRMED for history; UNVERIFIED for the 2026 schedule | `bountybench/bountytasks`: 46 `bounty_metadata.json` files, 42 of them huntr reports, 41 with an amount. **Median $600, mean $1,482, min $0, max $30,485.** Examples: kedro `CVE-2024-9701` `"disclosure_bounty": "1500"`, mlflow `CVE-2025-0453` `"125"`, lunary `CVE-2024-1625` `"1080"`. The sample is 2022–2025 and was selected for reproducibility. |
| "Critical caps at $50,000; up to 10× multiplier" | UNVERIFIED | SNIPPET (`SWEEP-2.md:158`). The same claim appears in the third-party listing `gigs-sh … huntr.mdx:16,32`. No huntr page was rendered. |
| Payout is monthly on the 25th, via Stripe Connect | UNVERIFIED (consistent across sources) | SNIPPET (`SWEEP-2.md:155`). Two third-party repositories repeat it: `gigs-sh … huntr.mdx:32` (*"Bounties pay monthly on the 25th via Stripe Connect"*) and `REPORT_FOR_HUNTR.md:159` (*"Paid monthly via Stripe Connect (25th of each month)"*). |
| The huntr Stripe onboarding is "the SAME Stripe Connect onboarding already catalogued as owner step 4 … one form, not two" | CONTRADICTED | The scout's own quoted evidence says the opposite: *"you will receive an email requesting you to **create** a Stripe Connect account"* (`SWEEP-2.md:155`). `REPORT_FOR_HUNTR.md:160` says *"First payment requires creating Stripe Connect account"*. Algora's `connect_countries.ex` creates accounts under Algora's own platform. Nothing shows huntr can pay into an account that another platform created. It is a second KYC form. |
| An Israeli resident can be paid by huntr | UNVERIFIED, with a named failure mode | Third party, `gigs-sh … huntr.mdx:49`: *"Stripe-unsupported countries get donations only, not cash."* WebSearch snippet (this session): *"If your country is not in this list, we will not be able to process a payout to you, but instead can offer to donate your payout to charity."* So huntr keeps **its own** country list. Algora listing `{"Israel","IL"}` (`connect_countries.ex:58`, re-fetched) proves Stripe can pay Israel cross-border for Algora. It says nothing about huntr's list. |
| The disclosure programme permits automated or AI-assisted work | UNVERIFIED | The settling page returned 404. The only rule text in any source is the Challenges ban (SNIPPET, `SWEEP-2.md:159`). The third party `gigs-sh … huntr.mdx:17`, *"Guidelines do not address AI agents directly"* (`verifiedAt: 2026-05-18`, line 19), is SNIPPET grade and predates the 404. |
| The canonical policy URL still resolves | CONTRADICTED | `sweep2-huntr-guidelines.meta.json`: `"status": 404`, `"byteLength": 0`, `"fetchedAt": "2026-09-22T20:40:18.859Z"`. Earlier it was canonical. The CVE-partner record mirrored in `CloudSecurityAlliance/SecID` `registry/disclosure/com/huntr.json` has `"disclosure_policy": {"url": "https://huntr.com/guidelines/", "checked": "2026-04-08"}`, and gigs-sh verified it on 2026-05-18. Between May and September the published rules moved or disappeared. |
| Submission and triage happen only on huntr.com | CONFIRMED | `REPORT_FOR_HUNTR.md:152`, `huntr.mdx:44`, and the kedro thread at `writeup.html:708-714`, all quoted above. |
| The colony can reach huntr.com | CONTRADICTED | `curl … https://huntr.com/guidelines` → `curl: (56) CONNECT tunnel failed, response 403`. One attempt; no routing around it. |
| A documented non-browser channel exists (API, email intake, GitHub-native) | UNVERIFIED (none found) | `search_code "huntr.com/guidelines"` (49 hits) and `"huntr" "Stripe Connect"` (25 hits) show only the web flow. `security@huntr.com` in the CNA record is the CNA contact, not a bounty intake. Absence in mirrors is not proof of absence. |
| The classes a scanner finds cheaply pay nothing | CONFIRMED (for the guidelines of 2024–25) | huntr's admin bot, quoted on saved report pages: *"Serializing/deserializing python objects (pickle files) locally and not remotely over the network"* (`kedro/.../writeup.html:712`); *"Lack of rate limiting issues."* (`mlflow/bounties/bounty_3/writeup/writeup.html:709`); *"Exceptions triggered in local libraries without networking components"* (`LibreChat/bounties/bounty_2/writeup/writeup.html:644-645`, via search_code). |
| No ranking or prior-success gate stands before a first payout | UNVERIFIED, harmless | No ranking input was found in any source, but no huntr rules were read. The real gate is triage, and duplicates, where the first reporter wins. |
| This colony's agents can produce a valid, non-duplicate, in-scope finding | UNVERIFIED; the comparables run against it | (a) Another autonomous-agent colony that registered on huntr: `joyelgeorge/Taskman` `docs/BRAIN-TRANSFER.md:362`, *"Static CWE-22/78/918 scan, PoC-gated. No payable bug found yet in hardened flagships."* On 2026-09-23 it killed `huntr-oss` (`docs/research/NOTES.md:55`), but for its operator's own rule, not on evidence. (b) The payer's parent: WebSearch snippets (Aug 2026) say Palo Alto Networks *"used Frontier AI models to uncover more than 14,000 previously unknown vulnerabilities in open source software"* (Unit 42, "The Frontier AI Vulnerability Burst"). SNIPPET only. (c) Programme-wide output is about 8 published CVEs a month, worldwide. |
| huntr is owned by Palo Alto Networks via Protect AI | UNVERIFIED (Protect AI part CONFIRMED) | The SecID CNA record has `"official_name": "Protect AI (formerly huntr.dev)"`. The Palo Alto Networks acquisition is SNIPPET and third party (`huntr.mdx:17`, `:28`). |
| A payout reaches the ledger with a transaction id the colony reads | UNVERIFIED | The money lands in an Express account under huntr's platform. The colony holds no credential that reads it, and none of `src/revenue/connectors/` covers it. A ledger row would depend on the owner relaying a reference each time. |

## L2 kill list and mission

**Kill list.**

- **Autonomous submission to a bug-bounty programme.** `groups/bounties-grants.md:174` (quoted above), confirmed by
  the audit (`audits/bounties-grants.md:350-357`, *"the whole bug-bounty branch … CONFIRMED and under-stated"*).
  The owner-free version of this candidate is exactly this shape. `docs/REJECTED.md:501-505` records the death
  through HackerOne's and Bugcrowd's terms. huntr is neither, so the candidate escapes that sentence only if huntr's
  own terms allow scripted operation. The page that would say so returned 404.
- **Devpost deferral, recurring owner action** (`BOARD.md:79-82`, `:312`). The same collision fires here, once per
  report and once per triage reply.
- **Sweep 2's own warning** (`SWEEP-2.md:297`): *"Any bounty line this repo opens must render the venue's current
  guidelines first, because the clause that kills it is one sentence long and was added recently."* The render was
  attempted and failed with a 404. By the repo's own rule, the line cannot open.
- **huntr AI Challenges** (`SWEEP-2.md:269`). Dead by rule. The candidate's open question was whether the rule
  leaks into the disclosure programme. It remains open.
- **"Prizes are not revenue"** (`docs/REJECTED.md:486-488`). A standing offer for undiscovered defects, where the
  first reporter wins, is closer to a prize than to shape D's announced job. huntr announces scope, not a job.
- **One note outside this candidate, for the board.** The scout leans on "the same rail Algora's source code
  already proves". The comparable colony's registry
  (`joyelgeorge/Taskman` `packages/core/territory/registry.js`, via search_code) records `algora-bounties` as
  KILLED: *"Terms prohibit robotic/automated access — holds regardless of country"*. That is a third-party SNIPPET
  about the committed `oss-bounties` line, and it should be rendered before that line is built.

**Mission.**

- **The owner talks to people.** Scope disputes happen in the report thread with huntr's admins and the
  maintainers, as the paid kedro report shows. On a host the colony cannot reach, that is the owner.
- **Recurring owner work.** Every submission is a signed-in form fill. This breaks *"בדרכים אני לא רוצה ולא אצטרך
  לעשות כלום"* and MISSION §1's one-time checklist.
- **Identity.** A brand handle on huntr is possible. Stripe KYC is in the owner's legal name, which MISSION allows.
  Every accepted report is public, and Model File Vulnerability (MFV) reports need a public proof-of-concept model
  hosted on Hugging Face (`huntr.mdx:32`, `:43`). That is one more public account, and it publishes working
  malicious artefacts under the brand. Hugging Face's rules on that are UNVERIFIED. AMBER.
- **Honesty.** An unverified LLM-drafted report is RED (first sweep's bug-bounty scout, citing curl's instant-ban
  policy). Only a proof-of-concept-gated pipeline would be honest, and the guideline exclusions above show that
  the cheap classes are precisely the ones excluded.
- **Legal.** Static review of public source plus a local proof of concept is lawful. Testing any live deployment is
  not: the first sweep cites the Israeli Computers Law 5755-1995 s.4. A US tax form to Stripe/huntr is likely and
  UNVERIFIED. The income is foreign USD income under owner step 2.
- **Money.** ₪0 spend.

**Owner actions beyond the seven steps** (none is in `docs/OWNER_STEPS.he.md`):

1. Create a huntr researcher account under the brand, in a browser (huntr.com is blocked here), and accept huntr's
   terms.
2. When the first payment is due, complete a **second** Stripe Connect onboarding from huntr's email: legal name,
   ID, date of birth, address, Israeli bank account, tax documents. This is not owner step 4.
3. Per report: file on huntr.com/bounties/disclose and answer admins and maintainers in the thread until
   validation (up to 31 days). This is recurring, and it is the mandate conflict.
4. For MFV reports only: a Hugging Face account under the brand, to host the public proof-of-concept model files.
5. Relay each payout reference so the ledger can record it.

## L3 the first stranger's money

**Path.** This is the candidate's one real strength: nobody has to find us.

1. huntr publishes scope.
2. The colony finds a defect in an in-scope AI/ML repository, outside the excluded classes, and proves it with a
   working proof of concept.
3. The report is filed on huntr.com.
4. huntr's triage and the maintainer validate it within 31 days.
5. The bounty joins the monthly run on the 25th.
6. On the first payment, the owner onboards to Stripe under huntr's platform.

Steps 3, 4 and 6 need the owner, and the payout in step 6 depends on Israel being on huntr's country list. The
first sweep's law (platform search ranks on prior success) does not fire, but constraint 7 is replaced by an owner
at a browser.

**Earliest money.** No date can be defended under this verdict. Mechanically, suppose a valid, non-duplicate
finding existed today and were filed on 2026-10-01. Validation takes up to 31 days, so the first payout run it could
meet is **2026-11-25**, followed by first-time Stripe onboarding and bank settlement. The honest date is "not in
2026", because no base rate for an agent's accepted finding exists anywhere.

**Ceiling against the ₪300/month floor.** The floor is ₪3,600 a year. At the historical median of $600, **two
accepted findings a year ($1,200) clear it at any USD/ILS rate above ₪3.0**. So the payer's size is not the
problem. The acceptance rate is: the whole programme publishes about 8 CVEs a month worldwide, concentrated on
three projects, and the payer's parent mines open source with frontier models. The comparable agent colony found
no payable bug. Verdict on the floor: **unknown**, and the burden of proof is unmet.

## Cheapest test (and what you ran)

**The scout's test** was to point the security-review skill at three small in-scope libraries for about four hours.
**I did not run it.** It cannot change the verdict. A real finding would still have no owner-free route into
huntr.com and no verified payout to Israel. It also needs huntr's in-scope list, which lives on the blocked host.

What I ran from this container, at ₪0:

- `curl -sS … https://huntr.com/guidelines` → `curl: (56) CONNECT tunnel failed, response 403`.
- Read `research/rendered/sweep2-huntr-guidelines.meta.json` → `status 404`, `error "HTTP 404 Not Found"`,
  `byteLength 0`.
- `mcp__github__search_code "huntr.com/bounties" repo:github/advisory-database path:advisories/github-reviewed/2026`
  → 59. I fetched all 59 JSON files from raw.githubusercontent.com and tabulated month and package (numbers in L1).
- `mcp__github__search_code "@huntr_ai" repo:CVEProject/cvelistV5 path:cves/2026` → 61. I fetched all 61:
  58 published, 3 rejected, the latest published 2026-08-10.
- `mcp__github__search_code "disclosure_bounty" repo:bountybench/bountytasks filename:bounty_metadata.json` → 46.
  I fetched all 46: 42 are huntr reports, 41 carry an amount, median $600, mean $1,482, range $0–$30,485.
- `mcp__github__search_code` for `"huntr.com/guidelines"`, `"huntr" "Stripe Connect"` and `huntr
  repo:joyelgeorge/Taskman`. These found the CNA records, the gigs-sh listing, the saved huntr report pages and the
  comparable colony. I then curled `SecID … huntr.json`, `gigs-sh … huntr.mdx`, `REPORT_FOR_HUNTR.md`,
  `BRAIN-TRANSFER.md`, `NOTES.md`, and three `writeup.html` pages.
- Four WebSearch calls (SNIPPET grade): huntr's automation policy (nothing beyond the Challenges clause); the payout
  country list with its charity fallback; Palo Alto Networks and huntr in 2026; the Frontier AI "14,000
  vulnerabilities" claim.

**The test that would reopen the line** (₪0, owner-free: a docs render from a CI runner):

1. Render huntr's current participation guidelines and FAQ at whatever URL now serves them.
2. The line **stays dead if** they show no non-browser channel and no explicit permission to operate a researcher
   account programmatically, **or** Israel is absent from the payout list.
3. **Re-screen as TEST_FIRST if** both pass: programmatic operation is allowed (or a non-browser channel exists),
   and Israel is listed. Then run a 30-day dry run with zero submissions, counting proof-of-concept-verified
   candidates in in-scope repositories that fall outside the excluded classes. Zero candidates in 30 days kills it
   on capability.

## URLs to render

Each URL below appears verbatim in a source I read, and is now cited in this repo file.

- `https://huntr.com/guidelines/`, with the trailing slash. It is cited as the CNA's disclosure policy in
  `CloudSecurityAlliance/SecID` `registry/disclosure/com/huntr.json` and in `RogoLabs/CNAScoreCard`
  `web/data/cna/huntr_ai.json`. The variant without the slash returned 404. This decides the automation clause.
- `https://huntr.com/faq`, cited at `SWEEP-2.md:155`. It holds the payout mechanics and, per the snippet, the
  country list. This decides Israeli payability.
- `https://huntr.com/new-huntr-faq`, a WebSearch result titled "huntr: huntr.com migration FAQ". It may carry the
  country list or the account model.
- `https://huntr.com/bounties/hacktivity`, cited in the SecID record as "Security advisories". It shows current
  activity and amounts paid in 2026.
- `https://huntr.com/challenges/3AjanuyEaXoNr6ySHpyo6L/v1/rules`, cited at `SWEEP-2.md:159`. It would give the
  automation-ban sentence verbatim and show whether it refers to anything beyond the Challenges.
- `https://unit42.paloaltonetworks.com/frontier-ai-vulnerability-burst/`, a WebSearch result. It would verify the
  "14,000 previously unknown vulnerabilities" competition claim at a primary source.
- `https://docs.stripe.com/connect/cross-border-payouts`, a WebSearch result. It shows whether Israel is a Stripe
  cross-border payout country at all. This is necessary for huntr's list, but not sufficient.

## What would change my mind

- **A rendered huntr policy page** that documents a submission and triage channel a brand machine account can
  operate, or that explicitly allows programmatic operation of a researcher account. Together with Israel on
  huntr's payout list, this moves the line to TEST_FIRST under the dry run above. Either one alone does not.
- **An owner relaxation.** If the owner says he will file each report and answer each thread himself, that
  relaxes the mandate, like the Devpost question in `BOARD.md` §8. It would still leave the payout list and
  capability unproven.
- **What would not change it:** bigger bounty figures, or more proof that the programme is alive. Both are
  already granted above, and neither touches the channel.
