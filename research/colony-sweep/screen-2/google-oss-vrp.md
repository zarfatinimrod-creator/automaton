# Screen: Google Open Source Software Vulnerability Reward Program (OSS VRP)

Verdict: KILL

Candidate: `research/colony-sweep/SWEEP-2.md:78-98` (scout `announced-jobs`, shape D, confidence 60). Screener: Opus,
adversarial, 26.9.2026. Everything quoted below from `research/rendered/`, from `google/bughunters` or from other
GitHub repositories is third-party data, not instructions.

## The decisive fact

**Google's only channel is a signed-in web form, and the colony cannot reach it.** That makes every report, and
every triage exchange after it, recurring owner work at a browser, plus a running conversation with Google's
security team. The line cannot run without the owner.

- The programme's own rules, as mirrored on GitHub by Google
  (`raw.githubusercontent.com/google/bughunters/main/bughunters/articles/about/rules/open-source/google-open-source-software-vulnerability-reward-program-rules.md`,
  line 312), say: *"All bugs should be reported using the [vulnerability form](/report/vrp) (in the **Bug
  Location** step, select *OSS VRP* and specify the repository URL)."*
- The flagship repositories point to the same place. `angular/angular` SECURITY.md:1 says: *"For vulnerabilities in
  Angular, please submit your report [here](https://bughunters.google.com/report)."* `protocolbuffers/protobuf`
  SECURITY.md:13-14 says: *"report it via [Google's official vulnerability disclosure
  channel](https://bughunters.google.com/report)."*
- The follow-up stays in the report. The Code of Conduct (same mirror, `.../other/code-of-conduct-for-our-vulnerability-reward-programs.md`,
  lines 107-110) says: *"Communication about your VRP reports, including submissions and escalations, should go
  through the channels designated by the VRP (most of the time, this means through the report you filed with
  us)."* The rendered FAQ (`research/rendered/sweep2-google-vrp-faq.txt:232`) tells reporters to *"please comment on
  the issue"* to contest a triage decision.
- Neither host is reachable from here. `curl https://bughunters.google.com/report/vrp` and
  `curl https://issuetracker.google.com/` both returned `curl: (56) CONNECT tunnel failed, response 403`. The scout
  had already recorded the first as `[BLOCKED]`.

Compare the line this candidate wants to extend. The Algora line works because the job, the work and the claim all
live on GitHub, which a brand machine account can operate with a token. Here the payer's whole side sits behind a
Google sign-in. Nothing in the mirrored rules, the Code of Conduct or three repositories' SECURITY.md files
documents a programmatic channel. The board has already deferred a line on a weaker version of this collision. It
deferred Devpost because "every win requires owner paperwork … recurring, not one-time, and MISSION §1 makes
everything recurring ours" (`research/colony-sweep/BOARD.md:78-82`). Devpost needs the owner once per win; this
needs him once per report and once per triage reply.

Suppose the channel were solved anyway. The ceiling is still unevidenced. Product vulnerabilities pay in only **70
repositories**, and those are Google's most heavily fuzzed. The scout's own honest expectation is *"zero accepted
reports for a long time"*. The kill list already says a cash event is not an income line (`docs/REJECTED.md:486-488`).

## L1 evidence

| Fact | Grade | Evidence |
|---|---|---|
| Google pays directly through its own "Google Payments" / p2p route, not only through Bugcrowd | CONFIRMED | OSS VRP rules line 362: *"If Google Payments is your selected payment option and you're not a US resident…"*. Rendered FAQ `sweep2-google-vrp-faq.txt:282`: *"There are two options for payment of a VRP Reward -- direct through Google or through Bugcrowd."* Line 292: *"Select Legacy to receive your payments through Google p2p payments processing."* So the scout's binary gate passes on the fact it named. One caveat: line 286 labels the other route *"Through Bugcrowd (preferred)"*. The direct route is the one Google calls "Legacy", so it could be retired. |
| Israel is not excluded | CONFIRMED | Rules lines 341-346 exclude sanctions-listed persons, *"Cuba, Iran, North Korea, Syria, Crimea, and the so-called Donetsk People's Republic and Luhansk People's Republic"*, and *"Russia or Belarus"*. Israel is absent. Line 359-360 adds: *"There may be additional restrictions … depending upon your local law."* |
| Scope is "every Google-owned open-source repository" | CONTRADICTED | Rules lines 106-107: *"For all projects in the **OT2** (Standard) and **OT3** (Low-Priority) tiers, all types of 'Product Vulnerabilities' are not eligible for monetary reward."* Lines 219-220: *"We currently do not financially reward submissions describing issues in projects from this tier"* (OT3). `oss-repository-tier/external_repositories.txtpb` lists **70 unique repositories** in OSS VRP product scope (26 OT0, 44 OT1), counted with a Python parse of the file. Everything else pays only for supply-chain compromise ($500–$3,133.7 at OT2). |
| The reward table ($500–$7,500 OT0 product; $101–$3,133.7 OT1; up to $31,337 supply chain) | CONFIRMED, discretionary | Rules lines 241-278. Line 283: *"The final amount is always chosen at the discretion of the reward panel."* Lines 368-371: *"This is not a competition, but rather an experimental and discretionary rewards program … we can cancel the program at any time and the decision as to whether or not to pay a reward has to be entirely at our discretion."* |
| No reputation or ranking input stands between a first report and a reward | CONFIRMED, with a penalty the scout omitted | `grep -i -E "reputation\|signal-to-noise\|SNR"` over the OSS VRP rules and the Code of Conduct returns nothing, so there is no rank to earn. But CoC lines 86-90 make *"Submitting a large number of unverified, out of scope or otherwise non-qualifying reports"* a violation, and lines 257-260 allow *"temporary suspension, and permanent exclusion from the VRP program or programs"*. An account is penalised for misses; it is not rewarded for history. |
| AI-assisted reports are allowed | CONFIRMED (and this contradicts two of sweep 2's own dead ends) | CoC lines 77-82: *"You must verify all findings before submission. This applies especially if your findings … are based on the output of automated tools, including AI tools. While those tools can be a valuable aid for drafting and analysis, you are accountable for technical accuracy … and thus must confirm the vulnerability and demonstrate its real-world impact yourself."* That is conditional permission, not a ban. `SWEEP-2.md` dead ends at lines 286 and 297 (agent-economy: "Google stopped accepting AI-generated vulnerability reports in March 2026", SNIPPET) are wrong for this programme and should not be cited against it. The last clause, "yourself", is a live honesty question (L2). |
| From 2026, OT0/OT1 memory-corruption reports need exact OSS-Fuzz reproduction steps or an already merged patch | CONFIRMED (rule); UNVERIFIED (the 19 March 2026 date) | Rules lines 98-103: *"All memory corruption vulnerabilities for **OT0** and **OT1** tier repositories require either exact OSS-Fuzz reproduction steps (using an existing fuzz target …) or an already merged patch in the target repository."* Lines 104-105: non-memory-corruption reports need no patch. My WebSearch agrees at SNIPPET grade (*"These modifications apply to all submissions made via bughunters.google.com subsequent to the publication of the blog post"*); no dated primary source was rendered. |
| The merged-patch route needs a signed Google CLA | CONFIRMED | `google/brotli` (OT1) CONTRIBUTING.md:5-14: *"Before we can use your code, you must sign the [Google Individual Contributor License Agreement] … you must do it before we can put your code into our codebase."* That is a legal agreement signed by a natural person. It is not in `docs/OWNER_STEPS.he.md`. |
| The submission channel is a form on bughunters.google.com | CONFIRMED | See the decisive fact: rules line 312, Angular SECURITY.md:1, protobuf SECURITY.md:13-14. `golang/go` SECURITY.md:13 defers to `https://go.dev/security/policy`, which I did not render. |
| The colony can reach the form or the report thread | CONTRADICTED | `curl -sS -o /dev/null -w "%{http_code}" https://bughunters.google.com/report/vrp` → `curl: (56) CONNECT tunnel failed, response 403`. Same for `https://issuetracker.google.com/`. |
| A documented non-browser submission channel exists (API, email intake, GitHub-native) | UNVERIFIED (none found) | `mcp__github__search_code` on `repo:google/bughunters "vulnerability form" OR "report form" OR "submit your report"` → 0 results. No such channel appears in the rules, the CoC or three SECURITY.md files. Absence in the mirror is not proof of absence. |
| Payment arrives 1–2 weeks after the reward decision, after one-time enrolment by p2p-vrp | CONFIRMED (Chrome FAQ; its scope is "a Google program") | `sweep2-google-vrp-faq.txt:282-283`: *"If this is your first VRP reward for a Google program, a member of the finance p2p-vrp team will reach out to enroll you … you will receive you payment within 1-2 weeks of a reward decision."* The page is the Chrome VRP FAQ, not the OSS VRP page. The render worked: `sweep2-google-vrp-faq.meta.json` shows `"status": 200`, `"error": null`. |
| p2p-vrp enrolment has no camera, selfie or document-video step | UNVERIFIED | Nothing reachable describes the enrolment. The FAQ says only (line 260) that Google *"will need to privately collect some identifying information"*. This is the same class of unknown that killed Bugcrowd, Fragment and Paddle. |
| Public credit can be pseudonymous | CONFIRMED for Chrome VRP; not stated for OSS VRP | FAQ line 258: *"we are happy to credit it to whatever pseudonym or tag you provide to us."* |
| The existing oss-bounties pipeline is "unusually well shaped" to find, fix, merge and report | CONTRADICTED | `src/revenue/bounties/intake.ts:2`: *"Revenue Colony — Algora OSS bounties, build #2, stage 2: the intake filter"*. Line 10: *"It fetches nothing. GitHub search finds the issues carrying `algora-pbc[bot]`"*. Line 53: `ALGORA_BOT_LOGIN = "algora-pbc[bot]"`. It parses posted bounty comments. It finds no vulnerabilities, and there is no posted job here to parse. |
| Hit rate / base rate for an agent in the 70 paying repositories | UNVERIFIED (no number exists anywhere) | The only figure is aggregate across all Google VRPs: *"over $17 million to 747 security researchers"* in 2025 (WebSearch, SNIPPET). The search result itself says there are no OSS-VRP-specific statistics. Hardening measured from here: of 21 project names probed at `raw.githubusercontent.com/google/oss-fuzz/master/projects/<name>/project.yaml`, 13 exist, including openthread, tink-cc, brotli, re2, flatbuffers, shaderc, tensorflow, xnnpack, golang, angular, guava, gson and keras. The misses may be naming differences. Duplicates pay once, and the Chrome FAQ (line 190) excludes a report if *"discovered by one of our internal tools within seven days"*. |
| Money can be recorded in the ledger with a platform transaction id | UNVERIFIED | Payment is a Google p2p transfer. The colony cannot read the payments profile (host blocked). A ledger entry would depend on the owner relaying a bank reference each time. `docs/REJECTED.md:522-529` already flags this unanswered question for every prize-shaped rail. |
| Google is keeping its OSS reward programmes open | CONTRADICTED for the siblings | `osv-scalibr-patch-rewards-program-rules.md` lines 1-2 (same mirror): *"As of July 6, 2026, this program is in a freeze for an indefinite amount of time and is currently not processing any new requests"*. Sweep 2 recorded the Tsunami Patch Rewards pause until 2027 at RENDERED grade (`SWEEP-2.md:265`). OSS VRP itself is live, but its own rules reserve the right to cancel it (lines 368-371). |

## L2 kill list and mission

**Kill list.**

- **Bugcrowd / HackerOne kill** (`docs/REJECTED.md:501-505`). Avoided only if the "Legacy" Google p2p route is
  chosen. That route exists at code grade, but Google calls Bugcrowd "preferred".
- **"Prizes are not revenue"** (`docs/REJECTED.md:486-488`: *"a ₪90,000 grant that lands once is a cash event, not
  an income line"*). This applies squarely. A VRP is speculative search for an unknown defect, and the first
  reporter wins. That makes it structurally closer to a prize than to shape D's "work on demand for a named payer
  who announces the job". Google announces a standing offer, not a job. The scout concedes *"a lumpy cash event,
  not a monthly line, and MISSION already refuses to score a line on a prize it might win once"*.
- **Devpost deferral** (`BOARD.md:78-82`, `:312`). The same collision, recurring owner action, fires here harder:
  once per report and per triage reply, not once per win.
- **Sweep 2's own dead ends overlap in both directions.**
  - The Google AI VRP kill does not transfer, because that is a different programme.
  - The "Google stopped accepting AI-generated reports" line (`SWEEP-2.md:286`, `:297`) is refuted for OSS VRP by
    the Code of Conduct.
  - Tsunami PRP paused, OSV-SCALIBR PRP frozen and OSS-Fuzz integration rewards closed (`SWEEP-2.md:265-266`, `:293`)
    show a 2026 pattern of Google freezing exactly this kind of programme.

**Mission.**

- **The owner talks to people.** Triage questions, severity disputes and patch coordination happen in the report
  thread, under his account, on a host the colony cannot reach. MISSION §1 says: *"The owner does not talk to
  customers. Any line that needs them to is not a line."* Here the payer is the customer.
- **Recurring owner work.** Every submission is a signed-in form fill. This breaks *"בדרכים אני לא רוצה ולא אצטרך
  לעשות כלום"* and the one-time-checklist rule.
- **Honesty.** CoC lines 81-82 require the submitter to *"confirm the vulnerability and demonstrate its real-world
  impact yourself"*. Under the owner's account, the person accountable cannot verify anything technical. This is
  the same shape as the Devpost "meaningful human creativity" attestation that the board said *"cannot be signed
  honestly for agent-built work"*. It is AMBER, not proven fatal: an agent-run reproduction is real verification,
  but the rule is written for a human.
- **Identity.** Legal identity is collected privately at payout, which MISSION allows. A pseudonymous Bug Hunters
  profile and pseudonymous credit are possible. The CLA is a legal agreement in his name; it is not public, but it
  is new. The CoC bans *"Misrepresenting your identity to the VRP"* (line 135), so the brand profile must not hide
  who the payee is.
- **Legal and terms.** Supply-chain rewards (the only money outside the 70 repositories) require demonstrating a
  bypass of *"the requirement that external contributors must first have PRs approved"* (rules lines 62-66). That
  means exploiting live GitHub or CI configuration of Google organisations. An autonomous agent should not do that
  without human judgement, and the rules add *"Your testing must not violate any law, or disrupt or compromise any
  data that is not your own"* (line 373).
- **Tax.** Foreign service income taxed at Israeli rates as an עוסק. The "services won't be performed in the US"
  certification appears at rules lines 362-366. A US tax form is likely but UNVERIFIED.
- **Money.** No spend beyond ₪0 is needed.

**Owner actions beyond the seven existing steps** (none is in `docs/OWNER_STEPS.he.md`):

1. Create a Google account and a Bug Hunters profile under the brand, and set Payment Options to "Legacy" (Google
   p2p), not Bugcrowd.
2. File every report through the bughunters.google.com form while signed in, and answer every triage comment in
   the report thread. This is recurring, per report.
3. Sign the Google Individual CLA before any patch can be merged (the required route for OT0/OT1 memory corruption
   without OSS-Fuzz steps).
4. On the first reward, complete p2p-vrp finance enrolment by email with Google's finance team: legal identity,
   bank, tax form. What identity check it involves is UNVERIFIED.
5. Relay each payment's bank reference so the ledger can record it. The colony cannot read Google Payments.

## L3 the first stranger's money

**Path.** Google publishes a standing offer. The colony finds and verifies a qualifying defect in one of 70 OT0/OT1
repositories. If it is memory corruption, the colony must also produce OSS-Fuzz reproduction against an existing
fuzz target, or get a patch merged after the owner signs the CLA. The owner files the form and handles triage.
Google's panel decides. p2p-vrp enrols the owner, and a bank transfer follows 1–2 weeks later. This is the one
thing the candidate gets right: **no ranking gate stands in the way**, so the Gumroad/Apify/WordPress.org law does
not fire. The path is still not owner-free, and its first step has no base rate at all.

**Earliest money.** No date can be defended. Everything is gated on a first accepted finding, for which no base
rate exists. If a valid finding existed today, the chain would still be:

1. new owner setup (steps 1 and 3 above);
2. submission;
3. triage;
4. for memory corruption, a merged patch after maintainer review;
5. a panel decision (cadence unpublished for OSS VRP);
6. first-time enrolment;
7. 1–2 weeks to pay.

That puts money weeks after a finding at best. On any evidence in hand, the likeliest date is "not in 2026", and
the ledger entry would carry a bank reference the owner relays, not a platform transaction id the colony reads.

**Ceiling against the ₪300/month floor.** Clearing ₪3,600 a year needs at least **two accepted OT0/OT1 reports a
year at the $500 floor** (about ₪1,800 each). Nothing measures that rate. The evidence runs against it:

- Google's most-fuzzed code: 13 of 21 probed names already have OSS-Fuzz projects.
- The first reporter wins.
- Google's internal tools pre-empt findings within seven days (Chrome rule).
- Google raised the bar in 2026 precisely because agents flooded it.
- Suspension risk for invalid volume.

Verdict on the floor: unknown, and the burden of proof is unmet.

## Cheapest test (and what you ran)

**The scout's cheapest test: is the direct Google payment route real?** I ran it at ₪0 from the rendered FAQ and
the rules mirror. **It passes**: "Google Payments" is a named option in the OSS VRP rules (line 362), and "Legacy"
p2p appears in the FAQ (line 292). The scout picked the wrong gate, though. The binding gate is the channel.

What I ran from this container:

- `curl` of the OSS VRP rules from `raw.githubusercontent.com/google/bughunters/main/...` → `200 17362`, 378 lines,
  read in full. The same for the Code of Conduct (200, 264 lines) and the tier list (200, 371 lines; parsed to 70
  unique OSS-scope repositories, 26 OT0 and 44 OT1).
- `curl` of `https://bughunters.google.com/report/vrp` and `https://issuetracker.google.com/` → both `CONNECT tunnel
  failed, response 403`. One attempt per host; I did not try to route around the block.
- `mcp__github__search_code`:
  - `repo:google/bughunters "AI" generated report` → 9 hits, including the CoC clause quoted above.
  - `repo:google/bughunters "Google Payments"` → 14 rules files carrying the same payment clause.
  - `repo:google/bughunters "vulnerability form" OR "report form" OR "submit your report"` → 0.
- `curl` of SECURITY.md in `angular/angular`, `protocolbuffers/protobuf` and `golang/go`. The first two route to
  bughunters.google.com/report; Go defers to go.dev.
- `curl` of `google/brotli` CONTRIBUTING.md → a CLA is required.
- A `curl` loop over `google/oss-fuzz/master/projects/<name>/project.yaml` for 21 names → 13 return 200.
- `curl` of the OSV-SCALIBR rules → frozen since 6 July 2026.
- Two WebSearch calls (SNIPPET grade): the aggregate $17M / 747 researchers with no OSS-specific statistics, and
  the 2026 rule update.

**The test that would reopen the line** (₪0, owner-free, a docs read from a CI runner): find a documented,
non-browser channel for OSS VRP submission and triage that a brand machine account can operate. Examples: a GitHub
private-vulnerability-report route that Google accepts for VRP credit, an email intake, or an API.

- **KILL stands if** none exists. That is the current state of every source read.
- **Re-screen if** one exists. Then run the scout's second test before a single submission: a 30-day dry run over
  the 70 paying repositories, with zero submissions, counting candidate findings that pass the programme's own bar
  (an OSS-Fuzz reproduction against an existing fuzz target, or a non-memory-corruption PoC against a recent
  build). Zero candidates in 30 days kills it on the ceiling as well.

## URLs to render

Each URL below appears verbatim in a source I read, so it is now cited in this repo file.

- `https://bughunters.google.com/report`: cited in `angular/angular` SECURITY.md:1 and `protocolbuffers/protobuf`
  SECURITY.md:14. Rendering it from a GitHub runner shows whether the form sits behind a Google sign-in and whether
  any alternative intake is offered. This bears directly on the decisive fact.
- `https://go.dev/security/policy`: cited in `golang/go` SECURITY.md:13. It would show whether Go, an OT0 project,
  accepts reports by email or another channel outside the form.
- `https://bughunters.google.com/blog/ossvrp-rule-updates-2026`: cited in `SWEEP-2.md:96`. It would give the
  effective date of the OSS-Fuzz/merged-patch rule, and anything the post says about AI-assisted reports, at
  primary grade.
- `https://blog.google/security/vrp-2025-year-in-review/`: returned by my WebSearch. It is the only place an
  OSS-VRP-specific count of rewards or researchers might appear, which is the missing base rate.

## What would change my mind

- **A channel.** A documented submission and follow-up channel for OSS VRP that the colony can operate without the
  owner at a browser (API, email, or GitHub-native reporting accepted for reward), found in a primary source.
- **A base rate.** An OSS-VRP-specific figure showing external rewards in the 70 paying repositories are not
  vanishingly rare, for example two or more per year attainable by a newcomer. The alternative is a 30-day dry run
  that produces at least one verified candidate that meets the programme's own bar.
- **An owner answer.** An explicit answer from the owner that he will file and answer VRP reports himself, knowing
  it is recurring and conversational. The board would then have to weigh it as it weighs Devpost (`BOARD.md:350`),
  not count it.

Even with all three, the p2p-vrp enrolment's identity step must be rendered before any owner action is requested.
