# Terms audit of the prize-event sites (5.10.2026, tick 45)

**Why.** BOARD-LOOP §13's AI-allowed prize-event instrument (`logs/CHANNEL_LOOP.md` §4 row 13) has a rules-page half: `research/measurements/ai-allowed-events.md` lists the 66 events due this quarter and next (39 in 2026-Q3, 27 in 2026-Q4), and `research/measurements/ai-allowed-events.urls.txt` holds the 101 URLs a reading session renders before it grades a row ("How a reading session fills a row"). This audit read that list as it stood at 548be52 (30.9). The weekly prize-intake job rewrites it every Wednesday and reorders it by the quarter window of the day it runs, so this note and the verdicts cite its lines pinned, as `ai-allowed-events.urls.txt@548be52:N` (`git show 548be52:research/measurements/ai-allowed-events.urls.txt`; the same bytes are kept as `src/__tests__/revenue/fixtures/ai-allowed-events-548be52.urls.txt`). Those 101 URLs sit on 56 hosts and 45 sites (`siteOf` in `scripts/queue-zero-test.mjs`), and only two of the sites had a terms verdict: github.com (CONDITIONAL_MET) and google.com (BARRED). The rule of tick 20, that a site's terms are read before its first line is fetched (`TERMS-AUDIT-2026-09-29.md`; ruling 30.9 16(d) D2(iv): unread or silent terms, no fetch), puts this audit of the other 43 sites before any render. No rules page was rendered or queued in tick 45.

**How.** Six Opus auditors, each re-checked by an adversarial Opus verifier, in workflow `wf_70975fb1-ccc`; then this Opus assembler. Github grade only: every terms text, terms URL and site fact rests on a file on github.com or raw.githubusercontent.com, pinned to a commit, or on a file of this repository; no audited site and no other host was contacted, and every URL the agents fetched is listed at the end (1560 entries, 990 distinct, all on github.com or raw.githubusercontent.com). The assembler re-fetched at its pinned commit every text a GitHub-hosted verdict rests on (GitHub's Acceptable Use Policies and Terms of Service, OpenReview's Terms of Use, Codabench's Privacy Policy and Terms of Use, ansperformance.eu's disclaimer) and found each sha256 and byte length as the entries state; it also re-read the Pages evidence of robosyn-bench.net and fair-universe.lbl.gov (both CNAMEs), fomo26's index.html and ansperformance.eu's netlify.toml redirect. The runner the verdicts are judged against: render-watch makes a plain GET (JavaScript only for a line flagged `js`), reads robots.txt once per host per run and obeys it for its own name and `*` (since tick 27), sends the brand User-Agent `MehudakRenderWatch/1.0 (+https://il-biz-tools.netlify.app)` (`scripts/render-watch.mjs` USER_AGENT), runs on GitHub-hosted runners, and commits each capture to this public repository.

**Verdicts.** BARRED: the terms forbid automated access, with no exception covering the runner (none this round). CONDITIONAL_MET / CONDITIONAL_UNMET: allowed on a condition the runner meets / does not meet. NOT_BARRED: terms read in full, no bar. TERMS_PENDING: the terms URL is known at github grade but the text is not on GitHub; only the terms page may be queued, as a `terms-` line (ruling 30.9 16(d) D2(iii)-(iv)). NO_TERMS, exhaustive-negative: from 5.10 (ruling R1, "Main-thread rulings" below), the site's record shows a search of every Open Terms Archive declarations repository (the organisation's full listing), tosdr/tosdr-snapshots, the site's own GitHub presence, and research/ and docs/ of this repository, and that search found neither terms text nor a terms URL (GitHub code search is not required); only a robots.txt probe may be queued, for `scripts/robots-verdict.mjs` (D2(v)). NO_TERMS with a plain note ("not exhaustive-negative"): the record shows a search short of that, and nothing is fetched; after R1 no site of this audit is in this class.

**Actions taken (5.10).**
- Saved copies under `research/channel-loop/terms/`: `github-acceptable-use-policies-2026-10-05.md` and `github-terms-of-service-2026-10-05.md` (github/docs at 2bd66de, CC BY 4.0, verbatim; cited by the ten GitHub Pages verdicts; github.com's own round-1 entry is left as it was), `openreview-terms-of-use-2026-10-05.md` (AGPL-3.0, verbatim), `codabench-privacy-and-terms-2026-10-05.md` (Apache-2.0, verbatim) and `ansperformance-disclaimer-2026-10-05.md` (a pinned reference: the repository has no licence, and the notice's own copying condition is what its verdict leaves unsettled). `src/__tests__/revenue/terms-saved-copies.test.ts` recomputes each one.
- 43 verdicts in `research/channel-loop/terms-verdicts.json`, checked 2026-10-05: CONDITIONAL_MET 5, NOT_BARRED 1, CONDITIONAL_UNMET 7, TERMS_PENDING 9, NO_TERMS 21 (12 exhaustive-negative, 9 not), as corrected by the tick 45 review (the assembler's count was CONDITIONAL_MET 10, CONDITIONAL_UNMET 2 and 18 exhaustive-negative; "Review corrections" below). BARRED 0, so `TERMS_BARRED` in `scripts/render-watch.mjs` is unchanged. The main-thread rulings of 5.10 (R1 and R3, below) then made it CONDITIONAL_MET 9, CONDITIONAL_UNMET 3 and NO_TERMS 21, all exhaustive-negative; the tick-48 fold (5.10, render-watch masks addresses before it commits a capture) made it CONDITIONAL_MET 10, CONDITIONAL_UNMET 2.
- `PATH_LIMITS` in `scripts/queue-zero-test.mjs` may now name hosts: lbl.gov passes only on fair-universe.lbl.gov. Its verdict rests on that host being a GitHub Pages site, while `siteOf` keys every *.lbl.gov host to lbl.gov, and no other lbl.gov host's terms were read (the lbl.gov verifier's host-scope finding).
- ZERO-TESTS rows 235-243: the terms page of each TERMS_PENDING site. Rows 244-261: a robots.txt probe of each exhaustive-negative site's rules host. All 27 went through `scripts/queue-zero-test.mjs` (a dry run first); the terms gate refused none. Nothing else went into `research/rendered/urls.txt`. The tick 45 review then paused seven of them: row 237 (grand-challenge.org's terms page, held for a main-thread ruling) and rows 245, 247, 249, 250, 252 and 253 (the probes of the six sites whose own records say the search was not exhaustive). Tuesday 6.10 05:23's weekly render-watch run fetches the other 20 lines if they are on main by then. The main-thread rulings of 5.10 (below) un-paused all seven (R1 the six probes, R2 row 237) and queued rows 262-264, the robots.txt probes of health-data-hub.fr, ijcai.org and mozilladatacollective.com (R1): 30 lines in all, none paused.

## The 43 sites

| Site | Hosts | Rules URLs | Verdict | Governing document | Clause (quoted) | Citation (saved copy file:line; original path:line@SHA) | Condition or note |
|---|---|---|---|---|---|---|---|
| `aimo-interp.github.io` | aimo-interp.github.io | 1 (ai-allowed-events.urls.txt@548be52:185) | CONDITIONAL_MET | GitHub ToS + AUP (Pages: aimo-interp/aimo-interp.github.io, main) | 'Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]' | `github-acceptable-use-policies-2026-10-05.md:102` (AUP §7), `github-terms-of-service-2026-10-05.md:76` (User); `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md:88@2bd66de`; Pages bound to the AUP: `github-terms-for-additional-products-and-features.md:133@2bd66de` | github.com's condition: open access, i.e. this repo public (met while it is); no 'excessive automated bulk activity' (AUP :68, met by a weekly GET). Storage caveats: AUP §6 (:82) and §3 copyright (:48) for an unlicensed page. One address on the page, a project mailbox (a role address, ruling R3, 5.10): MET again after the review's UNMET; rules also readable at github grade from the repo. |
| `build-arena.github.io` | build-arena.github.io | 1 (ai-allowed-events.urls.txt@548be52:113) | CONDITIONAL_MET | GitHub ToS + AUP (Pages: build-arena/ConstructionChallenge, Actions deploy) | 'Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]' | `github-acceptable-use-policies-2026-10-05.md:102` (AUP §7), `github-terms-of-service-2026-10-05.md:76` (User); `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md:88@2bd66de`; Pages bound to the AUP: `github-terms-for-additional-products-and-features.md:133@2bd66de` | github.com's condition: open access, i.e. this repo public (met while it is); no 'excessive automated bulk activity' (AUP :68, met by a weekly GET). Storage caveats: AUP §6 (:82) and §3 copyright (:48) for an unlicensed page. SPA: a plain GET captures an empty shell; rules readable at github grade in web/public/BuildArena-Challenge-EN.md. |
| `fomo26.github.io` | fomo26.github.io | 1 (ai-allowed-events.urls.txt@548be52:82) | CONDITIONAL_MET | GitHub ToS + AUP (Pages: fomo26/fomo26.github.io, main) | 'Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]' | `github-acceptable-use-policies-2026-10-05.md:102` (AUP §7), `github-terms-of-service-2026-10-05.md:76` (User); `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md:88@2bd66de`; Pages bound to the AUP: `github-terms-for-additional-products-and-features.md:133@2bd66de` | github.com's condition: open access, i.e. this repo public (met while it is); no 'excessive automated bulk activity' (AUP :68, met by a weekly GET). Storage caveats: AUP §6 (:82) and §3 copyright (:48) for an unlicensed page. 'All rights reserved.' (index.html:991): the sharpest storage case. One address, a project mailbox at a university department (a role address, ruling R3, 5.10): MET again after the review's UNMET; rules also readable at github grade from the repo. |
| `lbl.gov` | fair-universe.lbl.gov | 1 (ai-allowed-events.urls.txt@548be52:170) | CONDITIONAL_MET | GitHub ToS + AUP (Pages: FAIR-Universe/FAIR-Universe.github.io, CNAME fair-universe.lbl.gov) | 'Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]' | `github-acceptable-use-policies-2026-10-05.md:102` (AUP §7), `github-terms-of-service-2026-10-05.md:76` (User); `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md:88@2bd66de`; Pages bound to the AUP: `github-terms-for-additional-products-and-features.md:133@2bd66de` | github.com's condition: open access, i.e. this repo public (met while it is); no 'excessive automated bulk activity' (AUP :68, met by a weekly GET). Storage caveats: AUP §6 (:82) and §3 copyright (:48) for an unlicensed page. Host-scoped: PATH_LIMITS admits lbl.gov lines on fair-universe.lbl.gov only. Its one address is the project mailbox, a role address (ruling R3, 5.10). |
| `neural-interfaces26.github.io` | neural-interfaces26.github.io | 1 (ai-allowed-events.urls.txt@548be52:228) | CONDITIONAL_MET | GitHub ToS + AUP (Pages: neural-interfaces26/neural-interfaces26.github.io, main) | 'Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]' | `github-acceptable-use-policies-2026-10-05.md:102` (AUP §7), `github-terms-of-service-2026-10-05.md:76` (User); `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md:88@2bd66de`; Pages bound to the AUP: `github-terms-for-additional-products-and-features.md:133@2bd66de` | github.com's condition: open access, i.e. this repo public (met while it is); no 'excessive automated bulk activity' (AUP :68, met by a weekly GET). Storage caveats: AUP §6 (:82) and §3 copyright (:48) for an unlicensed page. No email address on index.html or rules.html; robots.txt allows all; binding rules on rules.html. |
| `realpdecompetition.github.io` | realpdecompetition.github.io | 1 (ai-allowed-events.urls.txt@548be52:189) | CONDITIONAL_MET | GitHub ToS + AUP (Pages: realpdecompetition/realpdecompetition.github.io, main) | 'Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]' | `github-acceptable-use-policies-2026-10-05.md:102` (AUP §7), `github-terms-of-service-2026-10-05.md:76` (User); `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md:88@2bd66de`; Pages bound to the AUP: `github-terms-for-additional-products-and-features.md:133@2bd66de` | github.com's condition: open access, i.e. this repo public (met while it is); no 'excessive automated bulk activity' (AUP :68, met by a weekly GET). Storage caveats: AUP §6 (:82) and §3 copyright (:48) for an unlicensed page. One address, the organisers' mailing list (a role address, ruling R3, 5.10): MET again after the review's UNMET; rules also readable at github grade from the repo. |
| `robosyn-bench.net` | robosyn-bench.net | 1 (ai-allowed-events.urls.txt@548be52:165) | CONDITIONAL_MET | GitHub ToS + AUP (Pages: EDEM-AI/robosynchallenge.github.io branch page, CNAME robosyn-bench.net) | 'Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]' | `github-acceptable-use-policies-2026-10-05.md:102` (AUP §7), `github-terms-of-service-2026-10-05.md:76` (User); `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md:88@2bd66de`; Pages bound to the AUP: `github-terms-for-additional-products-and-features.md:133@2bd66de` | github.com's condition: open access, i.e. this repo public (met while it is); no 'excessive automated bulk activity' (AUP :68, met by a weekly GET). Storage caveats: AUP §6 (:82) and §3 copyright (:48) for an unlicensed page. Content comes from script.google.com (google.com BARRED): never js; a plain GET captures the shell. |
| `roco-spring.github.io` | roco-spring.github.io | 1 (ai-allowed-events.urls.txt@548be52:139) | CONDITIONAL_MET | GitHub ToS + AUP (Pages: roco-spring/roco-spring.github.io, main) | 'Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]' | `github-acceptable-use-policies-2026-10-05.md:102` (AUP §7), `github-terms-of-service-2026-10-05.md:76` (User); `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md:88@2bd66de`; Pages bound to the AUP: `github-terms-for-additional-products-and-features.md:133@2bd66de` | github.com's condition: open access, i.e. this repo public (met while it is); no 'excessive automated bulk activity' (AUP :68, met by a weekly GET). Storage caveats: AUP §6 (:82) and §3 copyright (:48) for an unlicensed page. One address on index.html and rules-faq.html, the organisers' mailing list (a role address, ruling R3, 5.10): MET again after the review's UNMET; rules also readable at github grade from the repo. Rules on rules-faq.html. |
| `szczurek-lab.github.io` | szczurek-lab.github.io | 1 (ai-allowed-events.urls.txt@548be52:142) | CONDITIONAL_MET | GitHub ToS + AUP (Pages: szczurek-lab/amp-challenge-website, Actions deploy) | 'Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]' | `github-acceptable-use-policies-2026-10-05.md:102` (AUP §7), `github-terms-of-service-2026-10-05.md:76` (User); `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md:88@2bd66de`; Pages bound to the AUP: `github-terms-for-additional-products-and-features.md:133@2bd66de` | github.com's condition: open access, i.e. this repo public (met while it is); no 'excessive automated bulk activity' (AUP :68, met by a weekly GET). Storage caveats: AUP §6 (:82) and §3 copyright (:48) for an unlicensed page. SPA shell to a plain GET; a redirect off the host would need its own verdict. |
| `xiuwenz2.github.io` | xiuwenz2.github.io | 1 (ai-allowed-events.urls.txt@548be52:94) | CONDITIONAL_MET (tick 48 fold) | GitHub ToS + AUP (Pages: xiuwenz2/SAPC2-website, Jekyll) | 'Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]' | `github-acceptable-use-policies-2026-10-05.md:102` (AUP §7), `github-terms-of-service-2026-10-05.md:76` (User); `content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md:88@2bd66de`; Pages bound to the AUP: `github-terms-for-additional-products-and-features.md:133@2bd66de` | github.com's condition: open access, i.e. this repo public (met while it is); no 'excessive automated bulk activity' (AUP :68, met by a weekly GET). Storage caveats: AUP §6 (:82) and §3 copyright (:48) for an unlicensed page. Four addresses in index.md, two of them named individuals' university addresses (the other two a mailing list and a project mailbox): UNMET, kept by ruling R3 (5.10): the verifier's condition is redact addresses before commit, and render-watch commits every capture with no address mask (`scripts/render-watch.mjs:686-717`), so no line is queued until it masks addresses before commit (mozilla.org's rule, `RULING-2026-10-04-mozilla-precondition.md` §3 rule 3); rules read at github grade from the repo. A redirect off the host would need its own verdict.  **Tick 48 fold (5.10):** render-watch now masks addresses before it hashes, writes or commits a capture (merge `12143ca`), so the condition is met: CONDITIONAL_MET. |
| `openreview.net` | openreview.net | 1 (ai-allowed-events.urls.txt@548be52:115) | NOT_BARRED | OpenReview Terms of Use, 'Last updated: September 24, 2024' (openreview/openreview-web app/legal/terms/page.js, AGPL-3.0) | 'OpenReview Users must not use the OpenReview System in a manner that causes harm to the OpenReview System (such as denial of service attacks, bug exploitation, ...' | `openreview-terms-of-use-2026-10-05.md:677-680`; `app/legal/terms/page.js:663-666@ed830e1` | No access bar. Metadata CC0 (:268), Comments CC BY 4.0 (:248): storage licensed with attribution. A guest may be sent to /challenge (refusal-type, never passed). |
| `ansperformance.eu` | ansperformance.eu | 7 (ai-allowed-events.urls.txt@548be52:154, :155, :156, :157, :158, :159, :160) | CONDITIONAL_UNMET | ansperformance.eu 'Copyright notice and disclaimer' (euctrl-pru/aiu-portal content/about/disclaimer.md; repo has no licence) | 'It may be copied in whole or in part, provided that EUROCONTROL is mentioned as the source and it is not used for commercial purposes (i.e. for financial gain).' | `ansperformance-disclaimer-2026-10-05.md:28`; `content/about/disclaimer.md:7@6a64528` | Non-commercial limb unsettled for this repo's use (y8.com precedent): UNMET, paused. Six lines redirect to prc-data-challenge-2026.netlify.app (no verdict); team pages hold personal data. |
| `codabench.org` | www.codabench.org | 11 (ai-allowed-events.urls.txt@548be52:33, :45, :169, :186, :190, :191, :198, :229, :230, :231, :232) | CONDITIONAL_UNMET | Codabench 'Privacy Policy and Terms of Use' (codalab/codabench documentation/PRIVACY.md; French version prevails) | 'The contents provided in Codabench is the property of the competition organizers, unless otherwise stated in the competition's terms of use. Any reproduction in whole or in part is prohibited without prior consent of its owner.' | `codabench-privacy-and-terms-2026-10-05.md:39`; `documentation/PRIVACY.md:25@c3be819` | Access only bars 'unreasonable traffic loads' (:28). Storage needs the organiser's consent or a competition licence: not held, so UNMET; no line. |
| `adaptionlabs.ai` | adaptionlabs.ai | 1 (ai-allowed-events.urls.txt@548be52:63) | TERMS_PENDING | Adaption Labs Terms of service, https://adaptionlabs.ai/terms-of-service | (text unread: not on GitHub) | adaptionlabs/adaption-api-docs `src/content/docs/resources/faq.mdx:66@7ba014b` | Listed for the API and app product; website scope unknown until read. Terms page queued: ZERO-TESTS row 240. |
| `devpost.com` | qwencloud-hackathon.devpost.com, backblaze-generative-media.devpost.com, datahub.devpost.com, arm-ai-optimization-challenge.devpost.com, xprize.devpost.com, cockroachdb-ai.devpost.com, adtc-2026.devpost.com | 7 (ai-allowed-events.urls.txt@548be52:20, :51, :60, :66, :73, :76, :85) | TERMS_PENDING | Devpost Terms of service, https://info.devpost.com/legal/terms-of-service | (text unread: not on GitHub) | challengepost/reimagine `app/views/reimagine2/devpost/_footer.html.erb:101@abc3b7d` | One verdict for all *.devpost.com hosts; listed pages are hackathon home pages. Terms page queued: ZERO-TESTS row 236. |
| `eurocontrol.int` | www.eurocontrol.int | 1 (ai-allowed-events.urls.txt@548be52:162) | TERMS_PENDING | EUROCONTROL privacy and website terms of use, https://www.eurocontrol.int/info/privacy-and-website-terms-use | (text unread: not on GitHub) | euctrl-pru/aiu-portal `config.toml:594@6a64528`, `themes/pru-theme/layouts/partials/footer.html:222` | Also ansperformance.eu's second document; may prove a privacy notice only. Terms page queued: ZERO-TESTS row 242. |
| `grand-challenge.org` | reg2026.grand-challenge.org, pengwin2026.grand-challenge.org, autopet-v.grand-challenge.org, topaneu-26.grand-challenge.org, rare26.grand-challenge.org | 5 (ai-allowed-events.urls.txt@548be52:30, :79, :103, :106, :109) | TERMS_PENDING | Grand Challenge General Terms of Service, https://grand-challenge.org/policies/terms-of-service/ (a database field) | (text unread: not on GitHub) | DIAGNijmegen/rse-grand-challenge `app/config/settings.py:767@ff2fb5c` (URL template) + `README.md:1`, `subdomains/utils.py:24` | URL derived from the platform's own template (`settings.py:767`), whose domain is an environment variable defaulting to `.gc.localhost` (`settings.py:302-303`), on the production domain `README.md:1` and `subdomains/utils.py:24` fix; no verbatim occurrence at github grade (a shallow clone at ff2fb5c grepped, 5.10). Admitted by ruling R2's exception, which `urls.txt`'s header records: terms page queued, ZERO-TESTS row 237; a 404, or a redirect to another host, retires the line. |
| `kaggle.com` | www.kaggle.com | 17 (ai-allowed-events.urls.txt@548be52:24, :27, :38, :57, :100, :112, :118, :119, :133, :136, :179, :201, :204, :210, :213, :235, :241) | TERMS_PENDING | Kaggle Terms of Use, https://www.kaggle.com/terms (text not on GitHub: every ToS;DR snapshot is a JS shell) | (text unread: not on GitHub) | tosdr/tosdr-snapshots `Kaggle/Terms of Service.html:76@b44ae1b` (og:url) | Plain once-fetch; likely an empty shell, then still pending. Terms page queued: ZERO-TESTS row 235. |
| `opensky-network.org` | opensky-network.org | 1 (ai-allowed-events.urls.txt@548be52:161) | TERMS_PENDING | OpenSky Network terms of use, https://opensky-network.org/about/terms-of-use (may be a data licence) | (text unread: not on GitHub) | openskynetwork/opensky-api `README.md:4@c4af9c9`, `docs/free/index.rst:28` | Says it may block hyperscaler IPs; a snippet paraphrase suggests a written-agreement condition. Terms page queued: ZERO-TESTS row 243. |
| `stanford.edu` | aimslab.stanford.edu, quantiphy.stanford.edu | 2 (ai-allowed-events.urls.txt@548be52:197, :207) | TERMS_PENDING | Stanford 'Terms of use for sites', https://www.stanford.edu/site/terms/ | (text unread: not on GitHub) | SU-SWS/decanter `core/src/templates/components/global-footer/global-footer.twig:34-35@63cda9d` | On www.stanford.edu; that the two rules hosts carry the footer is inference. Terms page queued: ZERO-TESTS row 239. |
| `virtualembryo.ai` | virtualembryo.ai | 1 (ai-allowed-events.urls.txt@548be52:182) | TERMS_PENDING | virtualembryo.ai 'Website Terms of Use', https://virtualembryo.ai/challenge/terms | (text unread: not on GitHub) | xxx12e/vec-community-kit `rules-watch/pages/terms.json:138@2cf9662`; gh-dv-openclaw/vec-submit-check `README.md:202@521cce3` | Verifier changed NO_TERMS to TERMS_PENDING; a peer watch declined to mirror the text. Terms page queued: ZERO-TESTS row 241. |
| `zindi.africa` | zindi.africa | 5 (ai-allowed-events.urls.txt@548be52:48, :69, :91, :151, :238) | TERMS_PENDING | Zindi Terms of Use, https://zindi.africa/terms (weak URL) | (text unread: not on GitHub) | this repo `research/colony-sweep/scouts/bounties-grants--data-challenges.md:67`; ZindiAfrica/AI-for-Equity-Challenges-Getting-Started-with-AWS-Resources `SUAOutsmartingOutbreaksChallenge.md:166@12deb40` | A Terms of Use is known to exist, so not NO_TERMS (no robots route). Terms page queued: ZERO-TESTS row 238. |
| `agenthon.net` | www.agenthon.net | 1 (ai-allowed-events.urls.txt@548be52:173) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative (ruling R1, 5.10): robots.txt probe queued, ZERO-TESTS row 247 (https://www.agenthon.net/robots.txt). |
| `aicrowd.com` | www.aicrowd.com | 1 (ai-allowed-events.urls.txt@548be52:129) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 248 (https://www.aicrowd.com/robots.txt). |
| `alignmentforum.org` | www.alignmentforum.org | 1 (ai-allowed-events.urls.txt@548be52:130) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative (ruling R1, 5.10): robots.txt probe queued, ZERO-TESTS row 249 (https://www.alignmentforum.org/robots.txt). |
| `bcamlc.com` | competition.bcamlc.com | 1 (ai-allowed-events.urls.txt@548be52:44) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative (ruling R1, 5.10): robots.txt probe queued, ZERO-TESTS row 250 (https://competition.bcamlc.com/robots.txt). |
| `crunchdao.com` | hub.crunchdao.com | 3 (ai-allowed-events.urls.txt@548be52:17, :126, :244) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 244 (https://hub.crunchdao.com/robots.txt). |
| `drivendata.org` | www.drivendata.org | 1 (ai-allowed-events.urls.txt@548be52:122) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 251 (https://www.drivendata.org/robots.txt). |
| `flagos.io` | flagos.io | 3 (ai-allowed-events.urls.txt@548be52:219, :220, :221) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative (ruling R1, 5.10): robots.txt probe queued, ZERO-TESTS row 245 (https://flagos.io/robots.txt). |
| `geminixprize.com` | www.geminixprize.com | 1 (ai-allowed-events.urls.txt@548be52:72) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative (ruling R1, 5.10): robots.txt probe queued, ZERO-TESTS row 252 (https://www.geminixprize.com/robots.txt). |
| `health-data-hub.fr` | www.health-data-hub.fr | 1 (ai-allowed-events.urls.txt@548be52:123) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative (ruling R1, 5.10): robots.txt probe queued, ZERO-TESTS row 262 (https://www.health-data-hub.fr/robots.txt). |
| `ijcai.org` | 2026.ijcai.org | 1 (ai-allowed-events.urls.txt@548be52:37) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative (ruling R1, 5.10): robots.txt probe queued, ZERO-TESTS row 263 (https://2026.ijcai.org/robots.txt). |
| `k12-ai-infrastructure.org` | platform.k12-ai-infrastructure.org | 1 (ai-allowed-events.urls.txt@548be52:88) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative (ruling R1, 5.10): robots.txt probe queued, ZERO-TESTS row 253 (https://platform.k12-ai-infrastructure.org/robots.txt). |
| `learn2design2026.com` | www.learn2design2026.com | 1 (ai-allowed-events.urls.txt@548be52:176) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 254 (https://www.learn2design2026.com/robots.txt). |
| `microblink.com` | freuid2026.microblink.com | 1 (ai-allowed-events.urls.txt@548be52:23) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 255 (https://freuid2026.microblink.com/robots.txt). |
| `mozilladatacollective.com` | competitions.mozilladatacollective.com | 4 (ai-allowed-events.urls.txt@548be52:145, :146, :147, :148) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative (ruling R1, 5.10): robots.txt probe queued, ZERO-TESTS row 264 (https://competitions.mozilladatacollective.com/robots.txt); both readings of whose terms govern the host are kept in the note, and the rules pages, if its robots.txt allows them, are read under ruling R3's address rule. |
| `pasteurlabs.ai` | pasteurlabs.ai | 1 (ai-allowed-events.urls.txt@548be52:97) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 256 (https://pasteurlabs.ai/robots.txt). |
| `situatedevals.org` | situatedevals.org | 1 (ai-allowed-events.urls.txt@548be52:216) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 257 (https://situatedevals.org/robots.txt). |
| `solafune.com` | community.solafune.com | 1 (ai-allowed-events.urls.txt@548be52:54) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 258 (https://community.solafune.com/robots.txt). |
| `sophelio.io` | fusion-equilibrium-challenge.sophelio.io | 1 (ai-allowed-events.urls.txt@548be52:194) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 259 (https://fusion-equilibrium-challenge.sophelio.io/robots.txt). |
| `theemailgame.com` | theemailgame.com | 1 (ai-allowed-events.urls.txt@548be52:41) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 260 (https://theemailgame.com/robots.txt). |
| `thinkonward.com` | thinkonward.com | 1 (ai-allowed-events.urls.txt@548be52:14) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 261 (https://thinkonward.com/robots.txt). |
| `wundernn.io` | wundernn.io | 2 (ai-allowed-events.urls.txt@548be52:224, :225) | NO_TERMS (exhaustive-negative) | none found at github grade | — | searched: Open Terms Archive, tosdr/tosdr-snapshots, the site's GitHub presence (see the verdict's note) | exhaustive-negative: robots.txt probe queued, ZERO-TESTS row 246 (https://wundernn.io/robots.txt). |

The saved copies' own line numbers are the original's plus 14 for the four verbatim copies; `ansperformance-disclaimer-2026-10-05.md` quotes original lines 2-3 at its lines 19-20 and 6-7 at 27-28. Each verdict's note in `terms-verdicts.json` carries the full reasoning, every quote with both line numbers, and the rules lines.

## The two sites judged before

| Site | Hosts | Rules URLs | Verdict | Source |
|---|---|---|---|---|
| `github.com` | github.com | 2 (ai-allowed-events.urls.txt@548be52:114, :166) | CONDITIONAL_MET | GitHub Acceptable Use Policies §7, research use of public, non-personal information while publications are open access (`TERMS-AUDIT-2026-09-29.md:25`); the same file this audit saves as `github-acceptable-use-policies-2026-10-05.md` |
| `google.com` | sites.google.com | 1 (ai-allowed-events.urls.txt@548be52:36) | BARRED | `TERMS_BARRED` in `scripts/render-watch.mjs` (YouTube's terms bar the Help pages; ruling 30.9 16(d) D2(v)) |

## What the reading can render

The reading is a render-watch `workflow_dispatch` with the allowed URLs in its `urls` input, never `urls.txt` (`ai-allowed-events.md`, step 1). `ai-allowed-events.urls.txt` cannot be pasted whole: its line for sites.google.com is refused by render-watch's own parser (google.com is in `TERMS_BARRED`), and most of its other lines fail the terms gate.

- **Now: 14 URLs on 13 sites** (5.10: 13 URLs on 12 sites; CONDITIONAL_MET and NOT_BARRED, and github.com; virtualembryo.ai joined on 6.10, NOT_BARRED on its terms read, "Terms read" below): `aimo-interp.github.io` 1, `build-arena.github.io` 1, `fomo26.github.io` 1, `lbl.gov` 1, `neural-interfaces26.github.io` 1, `realpdecompetition.github.io` 1, `robosyn-bench.net` 1, `roco-spring.github.io` 1, `szczurek-lab.github.io` 1, `xiuwenz2.github.io` 1, `openreview.net` 1, `github.com` 2, `virtualembryo.ai` 1. The verifiers found no personal email address that a plain GET of these pages would capture, xiuwenz2's apart (below): build-arena's source has one individual address, but a plain GET returns its empty JavaScript shell (a `js` flag would need redaction before commit), szczurek-lab and robosyn-bench return shells too (robosyn's content comes from script.google.com, so never `js`), neural-interfaces26 has none, and five carry only role addresses, which are not personal information (ruling R3): the project mailboxes of lbl.gov and aimo-interp, fomo26's project mailbox at a university department, and the organisers' mailing lists of realpdecompetition and roco-spring; the three shells' rules are readable at github grade in their repositories instead; openreview.net may send a guest to /challenge (refusal-type, never passed). xiuwenz2.github.io joined this group on 5.10 (tick 48): its page carries two named individuals' university addresses (ruling R3), and since the masking fold render-watch masks email addresses before it commits a capture, keeping only the domain: one written plainly, in a mailto: link or in character references, not one whose @ is itself encoded; the reader checks the first capture for addresses before citing it. virtualembryo.ai's Website Terms of Use bar neither automated access nor copying; the Official Rules they incorporate are unread, and a bar found there reopens its verdict. The URLs:
- `https://aimo-interp.github.io/?ref=mlcontests` (aimo-interp.github.io; ai-allowed-events.urls.txt@548be52:185)
- `https://build-arena.github.io/ConstructionChallenge/` (build-arena.github.io; ai-allowed-events.urls.txt@548be52:113)
- `https://fomo26.github.io/?ref=mlcontests` (fomo26.github.io; ai-allowed-events.urls.txt@548be52:82)
- `https://fair-universe.lbl.gov/?ref=mlcontests` (lbl.gov; ai-allowed-events.urls.txt@548be52:170)
- `https://neural-interfaces26.github.io` (neural-interfaces26.github.io; ai-allowed-events.urls.txt@548be52:228)
- `https://realpdecompetition.github.io/?ref=mlcontests` (realpdecompetition.github.io; ai-allowed-events.urls.txt@548be52:189)
- `https://robosyn-bench.net/?ref=mlcontests` (robosyn-bench.net; ai-allowed-events.urls.txt@548be52:165)
- `https://roco-spring.github.io/?ref=mlcontests` (roco-spring.github.io; ai-allowed-events.urls.txt@548be52:139)
- `https://szczurek-lab.github.io/amp-challenge-website/?ref=mlcontests` (szczurek-lab.github.io; ai-allowed-events.urls.txt@548be52:142)
- `https://xiuwenz2.github.io/SAPC2-website/?ref=mlcontests` (xiuwenz2.github.io; ai-allowed-events.urls.txt@548be52:94)
- `https://openreview.net/forum?id=QAQKmIp3SZ` (openreview.net; ai-allowed-events.urls.txt@548be52:115)
- `https://github.com/build-arena/BuildArena-2.0` (github.com; ai-allowed-events.urls.txt@548be52:114)
- `https://github.com/EDEM-AI/RoboSynChallenge` (github.com; ai-allowed-events.urls.txt@548be52:166)
- `https://virtualembryo.ai/challenge?ref=mlcontests` (virtualembryo.ai; ai-allowed-events.urls.txt@548be52:182)
- **Now, on robots.txt (6.10, tick 54): 20 URLs on 17 sites** (5.10: 0 URLs on 0 sites; NO_TERMS_ROBOTS_OK, set by `scripts/robots-verdict.mjs` from the robots.txt probes of the 6.10 weekly render, "Robots verdicts" below): `agenthon.net` 1, `aicrowd.com` 1, `alignmentforum.org` 1, `bcamlc.com` 1, `crunchdao.com` 3, `drivendata.org` 1, `geminixprize.com` 1, `health-data-hub.fr` 1, `ijcai.org` 1, `k12-ai-infrastructure.org` 1, `learn2design2026.com` 1, `microblink.com` 1, `pasteurlabs.ai` 1, `solafune.com` 1, `sophelio.io` 1, `thinkonward.com` 1, `wundernn.io` 2. Each site's robots.txt capture is a robots.txt the site served (eleven) or a 404 (six), and allows every rules path the prize list holds for it, for MehudakRenderWatch or `*`; `termsGate` passes these URLs now. Their notes still say what each search found and that the label rests on ruling R1, and render-watch reads each host's robots.txt again before it fetches a page. None of these pages is queued or rendered by this note: a reading dispatches them (`ai-allowed-events.md`, step 1), and mozilladatacollective.com, whose four pages R1 put under R3's address rule, is not among them. The URLs:
- `https://www.agenthon.net/?ref=mlcontests` (agenthon.net; ai-allowed-events.urls.txt@548be52:173)
- `https://www.aicrowd.com/challenges/white-box-estimation-challenge-2026?ref=mlcontests` (aicrowd.com; ai-allowed-events.urls.txt@548be52:129)
- `https://www.alignmentforum.org/posts/Kben8CzS4awCwNw5c/announcing-the-arc-white-box-estimation-challenge` (alignmentforum.org; ai-allowed-events.urls.txt@548be52:130)
- `https://competition.bcamlc.com?ref=mlcontests` (bcamlc.com; ai-allowed-events.urls.txt@548be52:44)
- `https://hub.crunchdao.com/competitions/broad-obesity-3?ref=mlcontests` (crunchdao.com; ai-allowed-events.urls.txt@548be52:17)
- `https://hub.crunchdao.com/competitions/structural-break-real-time?ref=mlcontests` (crunchdao.com; ai-allowed-events.urls.txt@548be52:126)
- `https://hub.crunchdao.com/competitions/datacrunch-2?ref=mlcontests` (crunchdao.com; ai-allowed-events.urls.txt@548be52:244)
- `https://www.drivendata.org/competitions/311/dat-parkinsons-challenge/?ref=mlcontests` (drivendata.org; ai-allowed-events.urls.txt@548be52:122)
- `https://www.geminixprize.com/?ref=mlcontests` (geminixprize.com; ai-allowed-events.urls.txt@548be52:72)
- `https://www.health-data-hub.fr/bibliotheque-ouverte-algorithmes-sante` (health-data-hub.fr; ai-allowed-events.urls.txt@548be52:123)
- `https://2026.ijcai.org/competitions/` (ijcai.org; ai-allowed-events.urls.txt@548be52:37)
- `https://platform.k12-ai-infrastructure.org/competitions/3/tutoring-outcomes/?ref=mlcontests` (k12-ai-infrastructure.org; ai-allowed-events.urls.txt@548be52:88)
- `https://www.learn2design2026.com/?ref=mlcontests` (learn2design2026.com; ai-allowed-events.urls.txt@548be52:176)
- `https://freuid2026.microblink.com/` (microblink.com; ai-allowed-events.urls.txt@548be52:23)
- `https://pasteurlabs.ai/tesseract-hackathon-2026/?ref=mlcontests` (pasteurlabs.ai; ai-allowed-events.urls.txt@548be52:97)
- `https://community.solafune.com/competitions/f87811b8-1964-4f4b-84b3-6fddd67ec4b1?menu=about&tab=overview&ref=mlcontests` (solafune.com; ai-allowed-events.urls.txt@548be52:54)
- `https://fusion-equilibrium-challenge.sophelio.io/?ref=mlcontests` (sophelio.io; ai-allowed-events.urls.txt@548be52:194)
- `https://thinkonward.com/app/c/challenges/no-second-guessing?ref=mlc` (thinkonward.com; ai-allowed-events.urls.txt@548be52:14)
- `https://wundernn.io/connectome?ref=mlcontests` (wundernn.io; ai-allowed-events.urls.txt@548be52:224)
- `https://wundernn.io/connectome/docs/quick_start` (wundernn.io; ai-allowed-events.urls.txt@548be52:225)
- **Terms page a shell after the 6.10 fetch (row 240): 1 URL on 1 site** (5.10: 40 URLs on 9 sites, headed "After Tuesday's terms fetch (rows 235-243)": the nine terms pages had not been fetched; 6.10: virtualembryo.ai was read and cleared ("Now"), eurocontrol.int read as a privacy notice with no site terms ("Robots probe queued"), devpost.com, grand-challenge.org, stanford.edu and zindi.africa read and opensky-network.org refused ("Shut by the 6.10 terms fetch"), "Terms read" below; later on 6.10, kaggle.com's shell (row 235) was rendered once in js mode through the `--js --terms-shell` route of `scripts/queue-zero-test.mjs` (built 6.10, commit 5a3ee24), read and BARRED ("Shut by the 6.10 terms fetch", and "Shell terms pages rendered once" below)): `adaptionlabs.ai` 1. It stays TERMS_PENDING, and its note opens "shell:" (ruling 6.10 row 21 decision 3(1), K4): adaptionlabs.ai's plain capture is a navigation-only page that capture-check grades short, not js-shell, so the once-only js render of decision 3(2) waits on the classifier naming this kind. Its rules line stays unqueued until the terms are read.
- **Probed 6.10, NO_TERMS_ROBOTS_OK not set (rows 244-264): 9 URLs on 4 sites** (5.10: 29 URLs on 21 sites, headed "After Tuesday's robots probes (rows 244-264) and `scripts/robots-verdict.mjs`": the probes had not run; 6.10: the script set 17 of the 21, the group above): `flagos.io` 3, `mozilladatacollective.com` 4, `situatedevals.org` 1, `theemailgame.com` 1. The script was run for each of the 21 with `--urls research/measurements/ai-allowed-events.urls.txt` (checked 5.10: without `--urls` it finds no queued page in `research/rendered/urls.txt` and judges nothing), and it declined these four: flagos.io and theemailgame.com because /robots.txt answered a 200 HTML page, not a robots.txt the site served (ruling D2(iv): the site's answer); situatedevals.org because the fetch got no answer (RFC 9309 §2.3.1.4: complete disallow), so its probe stays on the weekly run and the script is run for it again after a capture that is a file or a 404; mozilladatacollective.com because its robots.txt disallows every path (`Disallow: /` under `User-agent: *`), so its four pages are not fetched and R3's address rule for them does not arise. Each stays NO_TERMS, exhaustive-negative, with only its robots.txt probe queued.
- **Robots probe queued for the next weekly run (row 265): 1 URL on 1 site** (5.10: 0 URLs on 0 sites; eurocontrol.int was TERMS_PENDING then, and is NO_TERMS, exhaustive-negative, since its one linked document was read on 6.10 as a privacy notice with no site terms, "Terms read" below): `eurocontrol.int` 1. Only its robots.txt probe is queued (https://www.eurocontrol.int/robots.txt, ruling R1); `scripts/robots-verdict.mjs` judges the rules line from that capture after the next weekly run, and nothing else of the site is fetched before it.
- **Shut by the 6.10 terms fetch and the once-only js render (tick 54): 37 URLs on 6 sites** (5.10: 0 URLs on 0 sites; all six were TERMS_PENDING then; 20 URLs on 5 sites after the terms read of 6.10, before kaggle.com's js render; "Terms read" and "Shell terms pages rendered once" below): `devpost.com` 7, `grand-challenge.org` 5, `kaggle.com` 17, `opensky-network.org` 1, `stanford.edu` 2, `zindi.africa` 5. devpost.com, kaggle.com and zindi.africa are BARRED and in `TERMS_BARRED` (zindi.world with it); kaggle.com's terms page, a JavaScript shell to the plain GET, was rendered once in js mode (ruling 6.10 row 21 decision 3(2)), and its Terms of Use bar crawling or scraping any page and copying Content without its owner's consent; grand-challenge.org and stanford.edu are CONDITIONAL_UNMET on a copying condition the runner does not meet; opensky-network.org refused the runner (HTTP 403), so it is NO_TERMS, refusal-type, and its terms line is retired. None of these rules URLs is fetched.
- **Graded with no capture, on their terms: 19 URLs on 3 sites** (BARRED and CONDITIONAL_UNMET): `ansperformance.eu` 7, `codabench.org` 11, `google.com` 1.
- **Graded with no capture until render-watch masks addresses before commit: 0 URLs on 0 sites** since 5.10 (tick 48). This group held xiuwenz2.github.io (CONDITIONAL_UNMET: its page carries two named individuals' university addresses, ruling R3) until the masking fold of 5.10 (tick 48) made render-watch mask email addresses before it commits a capture, which moved xiuwenz2.github.io to CONDITIONAL_MET and into "Now" above.

Total: 14 + 20 + 1 + 9 + 1 + 37 + 19 + 0 = 101 URLs, over 13 + 17 + 1 + 4 + 1 + 6 + 3 + 0 = 45 sites.

5.10 (tick 45), before the robots verdicts: 13 + 0 + 40 + 29 + 0 + 0 + 19 + 0 = 101 URLs, over 12 + 0 + 9 + 21 + 0 + 0 + 3 + 0 = 45 sites.

6.10 (tick 54), after the robots verdicts and before the terms read: 13 + 20 + 40 + 9 + 0 + 0 + 19 + 0 = 101 URLs, over 12 + 17 + 9 + 4 + 0 + 0 + 3 + 0 = 45 sites.

6.10 (tick 54), after the terms read and before kaggle.com's js render: 14 + 20 + 18 + 9 + 1 + 20 + 19 + 0 = 101 URLs, over 13 + 17 + 2 + 4 + 1 + 5 + 3 + 0 = 45 sites.

## Verifier notes, and the assembler's decisions

What the verifiers changed or added (each verdict's note keeps the detail):
- **virtualembryo.ai: NO_TERMS changed to TERMS_PENDING.** The auditor took /challenge/rules (the Challenge Rules) for the site terms; /challenge/terms is a separate "Website Terms of Use" whose URL a community watch records (`xxx12e/vec-community-kit rules-watch/pages/terms.json:138@2cf9662`).
- **The ten GitHub Pages sites: CONDITIONAL_MET kept, one caveat corrected.** The storage caveat is not wholly outside GitHub's terms: captures are committed to a GitHub-hosted repository, and AUP §3 bars content on GitHub that infringes copyright (`github-acceptable-use-policies-2026-10-05.md:62`), so a capture that infringed would also breach the AUP; whether it infringes is copyright law, so it stays a caveat. The "non-personal" limb is met by the rules text, not by a whole page that carries email addresses: redact addresses before commit (counts per site in the notes). The tick 45 review held the runner to that wording: it cannot meet it, so the five Pages sites with addresses are CONDITIONAL_UNMET ("Review corrections"). ToS :207 (GitHub's own look and feel) does not reach a Pages page, which is the owner's Content.
- **lbl.gov: host scope.** `siteOf` keys fair-universe.lbl.gov to lbl.gov, so the verdict would have admitted every *.lbl.gov host; the fold confines it (PATH_LIMITS hosts, above).
- **robosyn-bench.net:** the Pages source is confirmed by its pages-build-deployment runs on branch `page`; never a `js` flag (content from script.google.com).
- **codabench.org:** the verdict stands on the organiser-content consent clause, not on the purpose limb (open-access research meets "non-commercial", as for github.com).
- **ansperformance.eu:** six of seven lines redirect to prc-data-challenge-2026.netlify.app, a site with no verdict; the dc2026 pages are committed on GitHub (readable at github grade); team pages hold personal data and are never captured.
- **openreview.net:** a personal-data handling clause (`openreview-terms-of-use-2026-10-05.md:464-465`) and the /challenge redirect added; NOT_BARRED kept.
- **devpost.com, grand-challenge.org:** terms hosts added (info.devpost.com, grand-challenge.org); the listed Devpost pages are hackathon home pages.
- **kaggle.com, zindi.africa, eurocontrol.int, opensky-network.org, stanford.edu, adaptionlabs.ai:** confirmed. Zindi was kept TERMS_PENDING against the auditor's suggested NO_TERMS, because its rules show a Terms of Use exists. Stanford's citations were pinned.
- **crunchdao.com, thinkonward.com, solafune.com, wundernn.io:** confirmed, with the instruction that the note open "exhaustive-negative"; crunchdao and solafune have terms that exist but are unlocated.
- **mozilladatacollective.com, health-data-hub.fr, ijcai.org:** not exhaustive-negative.
- Smaller corrections: agenthon (more agenthon.net mentions), alignmentforum (a fetched path was route.tsx), k12-ai-infrastructure (the operator is DrivenData), geminixprize (30 XPRIZE repos), pasteurlabs (citation range, 12 repos), flagos (search widened).

The assembler's own decisions:
1. **Exhaustive-negative, by one test** (reversed for six sites by the tick 45 review; "Review corrections", defect 3). A NO_TERMS note opens "exhaustive-negative" when the auditor and the verifier both searched the Open Terms Archive declarations repos (all of them), tosdr/tosdr-snapshots and the site's own GitHub presence. Eighteen sites meet it, including six whose auditors added that GitHub code search was out of scope (agenthon, alignmentforum, bcamlc, flagos, geminixprize, k12-ai-infrastructure): code search was outside every agent's scope, so it cannot separate the sites, and each note says so. The three that fail it are the three whose auditor probed Open Terms Archive in eight declarations repos only (mozilladatacollective, health-data-hub, ijcai); their verifiers also declined the label.
2. **grand-challenge.org's terms URL is accepted** (held by the tick 45 review; "Review corrections", defect 4). It is assembled from the platform's own terms-URL template (`app/config/settings.py:767@ff2fb5c`) on the domain the listed hosts fix (`subdomains/utils.py:24`), which is a derivation from cited code, not a pattern guess; a 404 keeps the site TERMS_PENDING.
3. **lbl.gov's host limit is code** (`PATH_LIMITS` hosts), with tests, rather than a note only.
4. **robosyn-bench.net's Additional Product Terms citations** were made at ca0be35 (:121, :131); the same clauses are :123 and :133 at 2bd66de, the commit the verdicts cite. Both were re-read.
5. **Every text matched.** The five governing texts re-fetched at their pinned commits match the entries' sha256 and byte counts; GitHub's AUP is byte-identical at ca0be35 and 2bd66de, so robosyn-bench.net's and the other Pages sites' citations agree.
6. **Not done here:** no rules page rendered (tick 45's rule); no robots verdict set (the probes have not run); github.com's round-1 entry not rewritten to cite the new saved copies.

## Review corrections (5.10, tick 45)

An Opus reviewer checked the assembly and found four defects; an Opus fixer corrected them, test-first (`src/__tests__/revenue/prize-terms-audit.test.ts`), and the main thread decides the two questions they leave open.

1. **The five GitHub Pages sites whose pages carry email addresses are CONDITIONAL_UNMET** (aimo-interp, fomo26, realpdecompetition, roco-spring, xiuwenz2). The verifiers' condition was "redact addresses before commit"; the assembly had softened it to redaction at reading time, after the commit. render-watch commits every capture to this public repository and masks only keys and tokens before it writes one (`redactSecrets` and `SECRET_PATTERNS`, `scripts/render-watch.mjs:686-717`), never an email address, so dispatching these URLs would commit the addresses first and redact them later, which is the AMO case that ended in TERMS_BARRED (`TERMS-AUDIT-2026-09-29.md:9`). Following mozilla.org (`RULING-2026-10-04-mozilla-precondition.md` §3 rule 3), the verdict moves to CONDITIONAL_MET only in the fold that makes render-watch mask addresses before a capture is written, with capture-check and the reader checking the first capture; a test fails the day `redactSecrets` starts masking an address, so that fold is not missed. Their rules are read at github grade meanwhile. lbl.gov stays CONDITIONAL_MET: its verifier found one address on the page, the project mailbox, and did not ask for redaction, while realpdecompetition's verifier asked for it for a list address; whether an organisation's mailbox is "personal" is left to the main thread.
2. **Citations of the prize list are pinned to 548be52.** prize-intake.yml rewrites `ai-allowed-events.urls.txt` every Wednesday (06:47 UTC, `[skip ci]`) and reorders it by `windowQuarters(measuredOn)`; on 7.10 the window becomes 2026-Q4 and 2027-Q1, and the reviewer's rerun of `buildAiAllowedTable` with that date moved 98 of the 99 cited line numbers onto other sites' URLs. Every citation now reads `ai-allowed-events.urls.txt@548be52:N`, and the test reads a byte-identical fixture of the file at 548be52 instead of the live file (which it only checks for rules URLs that reached `research/rendered/urls.txt`), so the suite does not go red when the job runs.
3. **Six sites are not exhaustive-negative** (agenthon, alignmentforum, bcamlc, flagos, geminixprize, k12-ai-infrastructure). Their verified records end "the search is not exhaustive" (GitHub code search out of scope; flagos also "only part of the flagos-ai/docs content was grepped"); the assembly had upgraded them on its own reasoning that code search was outside every agent's scope. The ruling's example of an exhaustive-negative search, nevo (`RULING-2026-09-30-video.md:87`), included GitHub code search (`research/measurements/osek-patur-documents.md:1136`). Their notes open "not exhaustive-negative:", and their probes (rows 245, 247, 249, 250, 252, 253) are paused rather than retired, because one ruling decides them: whether exhaustive-negative needs GitHub code search. The same ruling decides health-data-hub.fr and ijcai.org (their verifiers withheld the label for that reason only) and, if it requires code search, the twelve sites kept exhaustive-negative, none of which records running it (crunchdao, thinkonward, solafune and wundernn say it was not run).
4. **grand-challenge.org's terms line is held.** Its URL is assembled from `f"https://{SESSION_COOKIE_DOMAIN.lstrip('.')}/policies/terms-of-service/"` (`app/config/settings.py:767` at ff2fb5c, re-fetched 5.10: sha256 f8469399…, 46450 bytes), whose domain is an environment variable defaulting to `.gc.localhost` (`:302-303`); no file writes the URL as one literal, and `research/rendered/urls.txt`'s one rule forbids a URL "extrapolated from a pattern". Row 237 is paused until a verbatim occurrence turns up at github grade (no code search was available) or the main thread rules on the exception, as its verifier asked; the site stays TERMS_PENDING.
5. **Main-thread rulings (5.10).** The questions defects 1, 3 and 4 left open are ruled on in "Main-thread rulings" below (R1-R3) and applied: the nine NO_TERMS sites short of the label are exhaustive-negative, each with an active robots.txt probe (rows 245, 247, 249, 250, 252 and 253 un-paused, rows 262-264 queued); row 237 is active under the exception `research/rendered/urls.txt`'s header now records (no verbatim occurrence of the URL in a shallow clone of the platform's repository at ff2fb5c); and of the five Pages sites, aimo-interp, fomo26, realpdecompetition and roco-spring, whose pages carry only role addresses (a project mailbox or a mailing list), are CONDITIONAL_MET again, while xiuwenz2, whose page carries two named individuals' university addresses, stays CONDITIONAL_UNMET.

## Main-thread rulings (5.10.2026, tick 45; Fable 5.1, the session model)

**R1. Exhaustive-negative does not require GitHub code search.** Ruling 30.9 16(d) D2(iv) (research/channel-loop/RULING-2026-09-30-video.md:84-87) defines exhaustive-negative as "a recorded search found none"; nevo is its example, not its definition. GitHub-wide code search is outside this session's repository scope (logs/CHANNEL_LOOP.md §9, tick-36 item 6 and 4.10 item 7), so a definition that needs it would make the label unreachable for every site and leave D2(v) a dead letter. From 5.10 a NO_TERMS site is exhaustive-negative when its record shows a search of: every Open Terms Archive declarations repository (the organisation's full listing), tosdr/tosdr-snapshots, the site's own GitHub presence (organisation and repositories found by repository search, their contents grepped for terms, legal, privacy, impressum and mentions légales), and this repository (research/, docs/). A record that says only "GitHub code search was unavailable" describes every search this loop can make, not a thin one. Consequence: agenthon.net, alignmentforum.org, bcamlc.com, flagos.io, geminixprize.com, k12-ai-infrastructure.org, health-data-hub.fr, ijcai.org and mozilladatacollective.com are exhaustive-negative on their verifiers' records; the six paused probes are active again and three probes are queued (www.health-data-hub.fr, 2026.ijcai.org, competitions.mozilladatacollective.com). mozilladatacollective.com's note keeps both readings (DrivenData's platform serves the pages; Mozilla's Websites Terms of Use set aside third-party apps) and says the probe reads only robots.txt; if its robots.txt allows the paths, the rules pages are fetched under the same address rule as R3.

**R2. grand-challenge.org's terms URL.** urls.txt's one rule exists to stop guessed URLs. A URL built from the platform's own source at a pinned commit, whose template line and production-domain lines are each cited, is a derivation, not a guess, and the one page it names is the terms page the gate exists to let a TERMS_PENDING site show. Admitted as a narrow exception, for terms- lines only: research/rendered/urls.txt's header gains, after its one rule, the sentence "Exception (ruling 5.10.2026, tick 45, TERMS-AUDIT-2026-10-05-prize-events.md): a terms- line of a TERMS_PENDING site may carry a URL derived from the site's own source code at a pinned commit when its comment cites the template line and the domain line; a 404, or a redirect to another host, retires the line. Never a rules page." If a verbatim occurrence of https://grand-challenge.org/policies/terms-of-service/ exists at github grade, cite it instead and the exception is not needed for this line. Row 237 is active again either way.

**R3. Personal versus role addresses.** The "non-personal" limb of GitHub AUP §7 (github.com's condition) concerns personal information. An organisation's, project's or mailing-list address (a project mailbox at an institution, a group list, info@ or contact@) is a role address and not personal information; a named individual's address is. lbl.gov stays CONDITIONAL_MET. Of the five Pages sites moved to CONDITIONAL_UNMET in review (aimo-interp, fomo26, realpdecompetition, roco-spring, xiuwenz2): a site whose pages carry only role addresses returns to CONDITIONAL_MET; a site carrying a named individual's address stays CONDITIONAL_UNMET until render-watch masks addresses before it commits a capture (queued by the main thread in §9 as the next maintenance item; the test the fixer wrote is its signal). Each of the five notes records the kind of address found (never the address itself).

**R4 (tick 47, 5.10). A rules URL observed in the site's own source repository at a pinned commit is observed, not guessed.** The reading rule in `research/measurements/ai-allowed-events.md` (step 2) admits a rules page the list does not give only when "its URL now appears in a capture"; its purpose, like `urls.txt`'s one rule, is to stop guessed URLs. RoCo-Spring's rulebook, `rules-faq.html`, is linked from none of the site's pages (home, participate, call for papers, team registration, evaluation, tasks and data, all captured) and sits in the site's Pages repository, `roco-spring/roco-spring.github.io` at `fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad`, which GitHub Pages serves at the same path by construction. That is an observation of the site's own source, the derivation R2 admits for a terms- line, with no gate exception needed here: the site is CONDITIONAL_MET and the page passes `termsGate` on its own. Admitted for allowed sites only, cited to the repository and commit in the tick log, and the page is still read only from its render-watch capture (`research/rendered/prize-roco-spring-github-io-rules-faq-html-f25b6745.txt`). The intake template's step-2 sentence is to say so (`logs/CHANNEL_LOOP.md` §9, tick-47 item 5).

## Every URL the agents fetched

As each agent recorded it (`fetched_urls`), per site, duplicates within a site removed. 1560 entries, 990 distinct; every URL among them is on github.com or raw.githubusercontent.com. The rulings applier's own fetches (5.10, rulings R2 and R3) come first, in a block of their own: 13 entries, on the same two hosts.

<details><summary>rulings applier (5.10, rulings R2 and R3): 13 entries</summary>

- `https://raw.githubusercontent.com/aimo-interp/aimo-interp.github.io/659dc4087e4f627238d2877cead28b567636095e/index.html (sha256 and bytes as the verified record)`
- `https://raw.githubusercontent.com/fomo26/fomo26.github.io/f41ba507e248906fdb3cd7e10ff986a3d5a0a9e7/index.html (sha256 and bytes as the verified record)`
- `https://raw.githubusercontent.com/realpdecompetition/realpdecompetition.github.io/c78fc394c7d0c5cd33077d8b11ae2290001599cc/index.html (sha256 and bytes as the verified record)`
- `https://raw.githubusercontent.com/roco-spring/roco-spring.github.io/fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad/index.html (sha256 and bytes as the verified record)`
- `https://raw.githubusercontent.com/roco-spring/roco-spring.github.io/fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad/rules-faq.html (sha256 and bytes as the verified record)`
- `https://raw.githubusercontent.com/xiuwenz2/SAPC2-website/9ef51e253cdd34ef4c58d360ec0e5cec011eb07d/index.md (sha256 and bytes as the verified record)`
- `https://raw.githubusercontent.com/xiuwenz2/SAPC2-website/9ef51e253cdd34ef4c58d360ec0e5cec011eb07d/_layouts/default.html (no address)`
- `https://raw.githubusercontent.com/xiuwenz2/SAPC2-website/9ef51e253cdd34ef4c58d360ec0e5cec011eb07d/_config.yml (no address)`
- `https://raw.githubusercontent.com/FAIR-Universe/FAIR-Universe.github.io/47c7a7eaa3001da762374fdf07f82715852658eb/index.html`
- `https://github.com/DIAGNijmegen/rse-grand-challenge (git clone --depth 1 --single-branch, HEAD ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4; git grep -n -F 'grand-challenge.org/policies': no match; deleted after)`
- `https://github.com/comic/grand-challenge.org (WebFetch: the same repository under its old name)`
- `https://raw.githubusercontent.com/comic/grand-challenge.org/HEAD/README.md (byte-identical to the clone's README.md)`
- `https://github.com/comic/grand-challenge.org (curl, answered 403 through the proxy)`

</details>

<details><summary><code>adaptionlabs.ai</code>: 63 entries</summary>

- `https://github.com/tosdr/tosdr-snapshots (WebFetch; git ls-remote; git clone --depth 1 --filter=tree:0 at b44ae1b6b15427ecceda8df0311e73e111a087e8, root tree listing)`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/OpenTermsArchive/demo-declarations`
- `https://github.com/OpenTermsArchive/user-rights-declarations`
- `https://github.com/OpenTermsArchive/genai-contrib-declarations`
- `https://github.com/OpenTermsArchive/genai-eu-declarations`
- `https://github.com/OpenTermsArchive/contrib-declarations`
- `https://github.com/OpenTermsArchive/pga-declarations`
- `https://github.com/OpenTermsArchive/dsa-reports-declarations`
- `https://github.com/OpenTermsArchive/sante-numerique-france-declarations`
- `https://github.com/OpenTermsArchive/kenya-declarations`
- `https://github.com/OpenTermsArchive/dating-declarations`
- `https://github.com/OpenTermsArchive/france-declarations`
- `https://github.com/OpenTermsArchive/sandbox-declarations`
- `https://github.com/OpenTermsArchive/p2b-compliance-declarations`
- `https://github.com/OpenTermsArchive/france-elections-declarations`
- `https://github.com/OpenTermsArchive/india-declarations`
- `https://github.com/OpenTermsArchive/template-declarations`
- `https://github.com/OpenTermsArchive/cote-d-ivoire-declarations`
- `https://github.com/OpenTermsArchive/france-elections-experiment-declarations`
- `https://github.com/search?type=repositories&q=adaptionlabs`
- `https://github.com/search?type=repositories&q=%22adaption+labs%22`
- `https://github.com/search?type=repositories&q=autoscientist`
- `https://github.com/search?type=users&q=adaption`
- `https://github.com/search?type=repositories&q=adaption+sdk`
- `https://github.com/adaptionlabs`
- `https://github.com/adaptionlabs/adaption-api-docs (git clone, blob:none + sparse checkout)`
- `https://github.com/adaptionlabs/adaption-claude-plugin (git clone)`
- `https://github.com/adaptionlabs/adaption-cursor-plugin (git clone)`
- `https://raw.githubusercontent.com/adaptionlabs/adaption-api-docs/7ba014b11c5b94394028de55953fbc9ea0d0448e/src/content/docs/resources/faq.mdx`
- `https://raw.githubusercontent.com/adaptionlabs/adaption-api-docs/7ba014b11c5b94394028de55953fbc9ea0d0448e/astro.config.ts`
- `https://github.com/Datascifer/autoscientist (git ls-remote)`
- `https://raw.githubusercontent.com/Datascifer/autoscientist/db6f375981f264d4368ff0ac1f203fd89e73c258/README.md`
- `https://github.com/HackIndiaXYZ/adaption-autoscientist-challenge-50000-prize-pool-bisenx (git ls-remote)`
- `https://raw.githubusercontent.com/HackIndiaXYZ/adaption-autoscientist-challenge-50000-prize-pool-bisenx/8e78496e6d591ea4d626b5fa5d5d13fc3e835f69/README.md`
- `https://github.com/alertcat/fewshot-forge (git ls-remote)`
- `https://raw.githubusercontent.com/alertcat/fewshot-forge/d3d7c278d8e614597600cf931f0abd6079fe4dd1/README.md`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch: 18 repos, no pagination)`
- `verifier: https://github.com/OpenTermsArchive/demo-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/user-rights-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-eu-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/pga-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dsa-reports-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sante-numerique-france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/kenya-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dating-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sandbox-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/p2b-compliance-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/india-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/template-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/cote-d-ivoire-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-experiment-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/platform-governance-archive-declarations (git ls-remote; not public)`
- `verifier: https://github.com/tosdr/tosdr-snapshots (git ls-remote; git clone --depth 1 --filter=tree:0 --no-checkout at b44ae1b6b15427ecceda8df0311e73e111a087e8, root tree listing)`
- `verifier: https://raw.githubusercontent.com/adaptionlabs/adaption-api-docs/7ba014b11c5b94394028de55953fbc9ea0d0448e/src/content/docs/resources/faq.mdx`
- `verifier: https://raw.githubusercontent.com/adaptionlabs/adaption-api-docs/7ba014b11c5b94394028de55953fbc9ea0d0448e/astro.config.ts`
- `verifier: https://raw.githubusercontent.com/adaptionlabs/adaption-api-docs/7ba014b11c5b94394028de55953fbc9ea0d0448e/LICENSE`
- `verifier: https://github.com/adaptionlabs/adaption-api-docs (git ls-remote; git clone --depth 1 --filter=blob:none, sparse checkout of *.md, *.mdx, src/content/docs/, spec/, astro.config.ts, LICENSE)`
- `verifier: https://github.com/adaptionlabs (WebFetch)`

</details>

<details><summary><code>agenthon.net</code>: 59 entries</summary>

- `https://github.com/tosdr/tosdr-snapshots (WebFetch; git clone --filter=tree:0 at b44ae1b6b15427ecceda8df0311e73e111a087e8)`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/OpenTermsArchive/demo-declarations`
- `https://github.com/OpenTermsArchive/user-rights-declarations`
- `https://github.com/OpenTermsArchive/genai-contrib-declarations`
- `https://github.com/OpenTermsArchive/genai-eu-declarations`
- `https://github.com/OpenTermsArchive/contrib-declarations`
- `https://github.com/OpenTermsArchive/pga-declarations`
- `https://github.com/OpenTermsArchive/dsa-reports-declarations`
- `https://github.com/OpenTermsArchive/sante-numerique-france-declarations`
- `https://github.com/OpenTermsArchive/kenya-declarations`
- `https://github.com/OpenTermsArchive/dating-declarations`
- `https://github.com/OpenTermsArchive/france-declarations`
- `https://github.com/OpenTermsArchive/sandbox-declarations`
- `https://github.com/OpenTermsArchive/p2b-compliance-declarations`
- `https://github.com/OpenTermsArchive/france-elections-declarations`
- `https://github.com/OpenTermsArchive/india-declarations`
- `https://github.com/OpenTermsArchive/template-declarations`
- `https://github.com/OpenTermsArchive/cote-d-ivoire-declarations`
- `https://github.com/OpenTermsArchive/france-elections-experiment-declarations`
- `https://github.com/search?type=repositories&q=agenthon`
- `https://github.com/orgs/Agenthon-2026/repositories`
- `https://github.com/Agenthon-2026/Agenthon2026-public (WebFetch; git clone, blob:none + sparse checkout)`
- `https://raw.githubusercontent.com/Agenthon-2026/Agenthon2026-public/bd01548e34d21fd660d88fd06157078fb25ece4e/docs/GLOSSARY.md`
- `https://raw.githubusercontent.com/Agenthon-2026/Agenthon2026-public/bd01548e34d21fd660d88fd06157078fb25ece4e/README.md`
- `https://raw.githubusercontent.com/Agenthon-2026/Agenthon2026-public/bd01548e34d21fd660d88fd06157078fb25ece4e/LICENSE`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch: 18 repos, no pagination)`
- `verifier: https://github.com/OpenTermsArchive/demo-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/user-rights-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-eu-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/pga-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dsa-reports-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sante-numerique-france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/kenya-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dating-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sandbox-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/p2b-compliance-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/india-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/template-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/cote-d-ivoire-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-experiment-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/platform-governance-archive-declarations (git ls-remote; not public)`
- `verifier: https://github.com/tosdr/tosdr-snapshots (git ls-remote; git clone --depth 1 --filter=tree:0 --no-checkout at b44ae1b6b15427ecceda8df0311e73e111a087e8, root tree listing)`
- `verifier: https://raw.githubusercontent.com/Agenthon-2026/Agenthon2026-public/bd01548e34d21fd660d88fd06157078fb25ece4e/docs/GLOSSARY.md`
- `verifier: https://raw.githubusercontent.com/Agenthon-2026/Agenthon2026-public/bd01548e34d21fd660d88fd06157078fb25ece4e/README.md`
- `verifier: https://raw.githubusercontent.com/Agenthon-2026/Agenthon2026-public/bd01548e34d21fd660d88fd06157078fb25ece4e/LICENSE`
- `verifier: https://github.com/Agenthon-2026/Agenthon2026-public (git ls-remote; git clone --depth 1 --filter=blob:limit=200k, full checkout)`
- `verifier: https://github.com/Agenthon-2026/track1-coding-public (git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://github.com/Agenthon-2026/track2-forecasting-public (git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://github.com/Agenthon-2026/track3-simulation-public (git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://github.com/Agenthon-2026/track4-analysis-public (git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://raw.githubusercontent.com/Agenthon-2026/track1-coding-public/84049dbc066cc02cf39c2cc18105c2f92284978d/README.md`
- `verifier: https://raw.githubusercontent.com/Agenthon-2026/track2-forecasting-public/2299dab3d31f5e93c10df087af86ffb0b7bfe938/README.md`
- `verifier: https://raw.githubusercontent.com/Agenthon-2026/track3-simulation-public/e9e42cc25fb840462f4cd97b23107b87619ddb85/README.md`
- `verifier: https://raw.githubusercontent.com/Agenthon-2026/track4-analysis-public/1c744e1d6725340643a533f436517d72b53ca0e1/README.md`

</details>

<details><summary><code>aicrowd.com</code>: 15 entries</summary>

- `https://github.com/orgs/AIcrowd/repositories?type=source`
- `https://github.com/orgs/AIcrowd/repositories?type=source&page=2`
- `https://github.com/crowdAI/crowdai`
- `git clone https://github.com/crowdAI/crowdai`
- `git clone https://github.com/AIcrowd/<41 repos: docs, crowdai_admin, aicrowd_api, whest-starterkit, whestbench, whestbench-explorer, flopscope, aicrowd-microduck, aicrowd-aide, chess-env, global-chess and flatland kits, …>`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/tosdr/tosdr-snapshots (git clone, tree at b44ae1b)`
- `verifier: https://github.com/orgs/AIcrowd/repositories?type=all (WebFetch)`
- `verifier: https://github.com/orgs/AIcrowd/repositories?type=all&q=cli (WebFetch)`
- `verifier: git clone (depth 1, blob:limit=400k, no checkout) https://github.com/AIcrowd/{whest-starterkit,whestbench,whestbench-explorer,flopscope,aicrowd-microduck,aicrowd-aide,chess-env,aicrowd_api,crowdai_admin,global-chess-challenge-2025-starter-kit,food-recognition-benchmark-starter-kit}`
- `verifier: https://raw.githubusercontent.com/AIcrowd/whest-starterkit/5eb9aa1455fcb3216af55994bdf25dc242b95797/README.md`
- `verifier: git ls-remote + git clone (depth 1) https://github.com/crowdAI/crowdai (HEAD c01a819b1969d43091a293e3b3501cafe818b6c4)`
- `verifier: https://raw.githubusercontent.com/crowdAI/crowdai/c01a819/app/views/pages/terms.html.erb`
- `verifier: https://github.com/search?q=aicrowd+terms&type=repositories (WebFetch, 0 results)`
- `verifier: OTA 18 declarations repos and tosdr-snapshots tree (as listed under kaggle.com)`

</details>

<details><summary><code>aimo-interp.github.io</code>: 30 entries</summary>

- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md`
- `https://raw.githubusercontent.com/github/docs/main/content/site-policy/github-terms/github-terms-of-service.md (reachability probe)`
- `https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md.atom (curl; refused by the session GitHub proxy)`
- `https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md.atom (curl; refused)`
- `https://github.com/github/docs (git ls-remote)`
- `https://github.com/aimo-interp/aimo-interp.github.io (git ls-remote, blobless git clone; WebFetch of the repo page)`
- `https://github.com/aimo-interp/aimo-interp.github.io/deployments (WebFetch; 404 anonymous)`
- `https://raw.githubusercontent.com/aimo-interp/aimo-interp.github.io/main/index.html (reachability probe)`
- `https://raw.githubusercontent.com/aimo-interp/aimo-interp.github.io/659dc4087e4f627238d2877cead28b567636095e/index.html`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/privacy-policies/github-general-privacy-statement.md`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-doxxing-and-invasion-of-privacy.md`
- `verifier: https://github.com/github/docs (git ls-remote refs/heads/main = 2bd66de8cea336061c9ea060c9b37385136e6ab3 on 2026-10-05)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `verifier: https://github.com/aimo-interp/aimo-interp.github.io (git ls-remote, git clone)`
- `verifier: https://raw.githubusercontent.com/aimo-interp/aimo-interp.github.io/659dc4087e4f627238d2877cead28b567636095e/index.html`
- `verifier: https://raw.githubusercontent.com/aimo-interp/aimo-interp.github.io/659dc4087e4f627238d2877cead28b567636095e/README.md`

</details>

<details><summary><code>alignmentforum.org</code>: 84 entries</summary>

- `https://github.com/ForumMagnum/ForumMagnum/commits/master.atom (curl; proxy answered 403)`
- `https://github.com/ForumMagnum/ForumMagnum (curl; proxy answered 403)`
- `https://github.com/ForumMagnum/ForumMagnum (git ls-remote; git clone --depth 1 --filter=blob:none with sparse checkouts of packages/lesswrong/components, app/, packages/lesswrong/lib, packages/lesswrong/server, middleware.ts, next.config.ts; a full clone attempt failed for lack of disk)`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/master/README.md (reachability test)`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/components/posts/PostsAcceptTos.tsx`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/robots.txt/route.ts`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/server/fmCrosspost/errors.ts`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/lib/routeChecks/redirects.ts`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/next.config.ts`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/middleware.ts`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/vercel.json`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/LICENSE`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/lib/generated/routeManifest.ts`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/%5B...not-found%5D/page.tsx`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/lib/routeChecks/index.ts`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/components/posts/PostSubmit.tsx`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/components/common/CookieBanner/CookiePolicy.tsx`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/api/%28markdown%29/SKILL.md/route.tsx`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/SKILL.md/route.tsx`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/components/layout/Footer.tsx`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/api/%28markdown%29/about/route.tsx`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/api/%28markdown%29/faq/route.tsx`
- `https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/.well-known/ai-agents.json/route.ts (verifier: this path returns 404 at this commit; the file is route.tsx)`
- `https://github.com/tosdr/tosdr-snapshots (WebFetch; git ls-remote; git clone --filter=tree:0 at b44ae1b6b15427ecceda8df0311e73e111a087e8)`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/OpenTermsArchive/demo-declarations`
- `https://github.com/OpenTermsArchive/user-rights-declarations`
- `https://github.com/OpenTermsArchive/genai-contrib-declarations`
- `https://github.com/OpenTermsArchive/genai-eu-declarations`
- `https://github.com/OpenTermsArchive/contrib-declarations`
- `https://github.com/OpenTermsArchive/pga-declarations`
- `https://github.com/OpenTermsArchive/dsa-reports-declarations`
- `https://github.com/OpenTermsArchive/sante-numerique-france-declarations`
- `https://github.com/OpenTermsArchive/kenya-declarations`
- `https://github.com/OpenTermsArchive/dating-declarations`
- `https://github.com/OpenTermsArchive/france-declarations`
- `https://github.com/OpenTermsArchive/sandbox-declarations`
- `https://github.com/OpenTermsArchive/p2b-compliance-declarations`
- `https://github.com/OpenTermsArchive/france-elections-declarations`
- `https://github.com/OpenTermsArchive/india-declarations`
- `https://github.com/OpenTermsArchive/template-declarations`
- `https://github.com/OpenTermsArchive/cote-d-ivoire-declarations`
- `https://github.com/OpenTermsArchive/france-elections-experiment-declarations`
- `https://github.com/search?type=repositories&q=alignmentforum`
- `https://github.com/tamnd/alignmentforum-cli (git ls-remote; git clone tree listing)`
- `https://raw.githubusercontent.com/tamnd/alignmentforum-cli/b2bd071eeb69e5b7dba814b370e60e5c64ec643f/README.md`
- `https://github.com/rapturt9/mcp-alignmentforum (git ls-remote; git clone tree listing)`
- `https://raw.githubusercontent.com/rapturt9/mcp-alignmentforum/d8a200d758375adfdcc6e2b1dbcfe30f0f1ac3ae/README.md`
- `https://raw.githubusercontent.com/rapturt9/mcp-alignmentforum/d8a200d758375adfdcc6e2b1dbcfe30f0f1ac3ae/RATE_LIMIT_INFO.md`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch: 18 repos, no pagination)`
- `verifier: https://github.com/OpenTermsArchive/demo-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/user-rights-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-eu-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/pga-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dsa-reports-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sante-numerique-france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/kenya-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dating-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sandbox-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/p2b-compliance-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/india-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/template-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/cote-d-ivoire-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-experiment-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/platform-governance-archive-declarations (git ls-remote; not public)`
- `verifier: https://github.com/tosdr/tosdr-snapshots (git ls-remote; git clone --depth 1 --filter=tree:0 --no-checkout at b44ae1b6b15427ecceda8df0311e73e111a087e8, root tree listing)`
- `verifier: https://github.com/ForumMagnum/ForumMagnum (git ls-remote HEAD and master; git clone --depth 1 --filter=blob:none --no-checkout, tree listing; then sparse checkout of packages/lesswrong/components/posts, packages/lesswrong/components/editor, app/about, app/contact, app/faq)`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/components/posts/PostsAcceptTos.tsx`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/server/fmCrosspost/errors.ts`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/robots.txt/route.ts`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/lib/routeChecks/redirects.ts`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/lib/generated/routeManifest.ts`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/middleware.ts`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/next.config.ts`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/vercel.json`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/packages/lesswrong/components/layout/Footer.tsx`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/api/%28markdown%29/SKILL.md/route.tsx`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/SKILL.md/route.tsx`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/.well-known/ai-agents.json/route.ts (404)`
- `verifier: https://raw.githubusercontent.com/ForumMagnum/ForumMagnum/35d51767599eb94a2d74aad62ad5ef22c29192c8/app/.well-known/ai-agents.json/route.tsx`

</details>

<details><summary><code>ansperformance.eu</code>: 46 entries</summary>

- `https://github.com/orgs/euctrl-pru/repositories?type=all&q=ansperformance`
- `https://github.com/euctrl-pru`
- `https://github.com/euctrl-pru/prc_data_challenge_website_2026`
- `https://github.com/euctrl-pru/prc_data_challenge_website_2026/commits/main.atom`
- `https://github.com/euctrl-pru/prc_data_challenge_website_2026/tree/30dac62198145f04ca87fa0d3f50808c8201dcc0/teams`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/README.md`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/_quarto.yml`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/index.qmd`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/eligibility.qmd`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/rationale.qmd`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/data.qmd`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/ranking.qmd`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/.github/workflows`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/teams/adventurous-ant.qmd`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/teams/index.qmd`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/_site/index.html`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/_site/eligibility.html`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/_site/rationale.html`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/_site/data.html`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/_site/ranking.html`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/_site/teams.html`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/_site/teams/index.html`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/LICENSE`
- `https://github.com/euctrl-pru/aiu-portal`
- `https://github.com/euctrl-pru/aiu-portal/commits/master.atom`
- `https://github.com/euctrl-pru/aiu-portal/tree/master/content/about`
- `https://github.com/euctrl-pru/aiu-portal/tree/6a645289e4947d68af532852345efd5f646c5684/content/study`
- `https://github.com/euctrl-pru/aiu-portal/tree/6a645289e4947d68af532852345efd5f646c5684/content/study/data-challenge`
- `https://github.com/euctrl-pru/aiu-portal/tree/6a645289e4947d68af532852345efd5f646c5684/layouts/partials`
- `https://github.com/euctrl-pru/aiu-portal/tree/6a645289e4947d68af532852345efd5f646c5684/themes`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/content/about/disclaimer.md`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/content/about/privacy.md`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/content/about/help.md`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/config.toml`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/netlify.toml`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/README.md`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/LICENSE`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/themes/pru-theme/layouts/partials/footer.html`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/themes/pru-theme/layouts/partials/site-footer.html`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/themes/pru-theme/layouts/_default/baseof.html`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/content/study/data-challenge/_index.md`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/content/study/data-challenge/_index.Rmd`
- `VERIFIER:`
- `https://raw.githubusercontent.com/euctrl-pru/prc_data_challenge_website_2026/30dac62198145f04ca87fa0d3f50808c8201dcc0/LICENSE.md`
- `https://raw.githubusercontent.com/OpenTermsArchive/<17 declarations repos>/main/declarations/{EUROCONTROL,Eurocontrol}.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{ansperformance.eu,eurocontrol.int,EUROCONTROL,Eurocontrol}/<5-7 document names>.html (404)`

</details>

<details><summary><code>bcamlc.com</code>: 57 entries</summary>

- `https://github.com/tosdr/tosdr-snapshots (WebFetch; git clone --filter=tree:0 at b44ae1b6b15427ecceda8df0311e73e111a087e8)`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/OpenTermsArchive/demo-declarations`
- `https://github.com/OpenTermsArchive/user-rights-declarations`
- `https://github.com/OpenTermsArchive/genai-contrib-declarations`
- `https://github.com/OpenTermsArchive/genai-eu-declarations`
- `https://github.com/OpenTermsArchive/contrib-declarations`
- `https://github.com/OpenTermsArchive/pga-declarations`
- `https://github.com/OpenTermsArchive/dsa-reports-declarations`
- `https://github.com/OpenTermsArchive/sante-numerique-france-declarations`
- `https://github.com/OpenTermsArchive/kenya-declarations`
- `https://github.com/OpenTermsArchive/dating-declarations`
- `https://github.com/OpenTermsArchive/france-declarations`
- `https://github.com/OpenTermsArchive/sandbox-declarations`
- `https://github.com/OpenTermsArchive/p2b-compliance-declarations`
- `https://github.com/OpenTermsArchive/france-elections-declarations`
- `https://github.com/OpenTermsArchive/india-declarations`
- `https://github.com/OpenTermsArchive/template-declarations`
- `https://github.com/OpenTermsArchive/cote-d-ivoire-declarations`
- `https://github.com/OpenTermsArchive/france-elections-experiment-declarations`
- `https://github.com/search?type=repositories&q=bcamlc`
- `https://github.com/search?type=users&q=bcamlc`
- `https://github.com/search?type=repositories&q=%22project+omnibus%22`
- `https://github.com/BCA-MLC`
- `https://github.com/BCA-MLC/Project-OmniBus (git ls-remote; git clone tree listing)`
- `https://raw.githubusercontent.com/BCA-MLC/Project-OmniBus/8a0c3fa6c33d492e71cd4aa1356575fdde6bf941/README.md`
- `https://raw.githubusercontent.com/BCA-MLC/Project-OmniBus/8a0c3fa6c33d492e71cd4aa1356575fdde6bf941/participant_starter/HOW_TO_SUBMIT.md`
- `https://raw.githubusercontent.com/BCA-MLC/Project-OmniBus/8a0c3fa6c33d492e71cd4aa1356575fdde6bf941/LICENSE (404)`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch: 18 repos, no pagination)`
- `verifier: https://github.com/OpenTermsArchive/demo-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/user-rights-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-eu-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/pga-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dsa-reports-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sante-numerique-france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/kenya-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dating-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sandbox-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/p2b-compliance-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/india-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/template-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/cote-d-ivoire-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-experiment-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/platform-governance-archive-declarations (git ls-remote; not public)`
- `verifier: https://github.com/tosdr/tosdr-snapshots (git ls-remote; git clone --depth 1 --filter=tree:0 --no-checkout at b44ae1b6b15427ecceda8df0311e73e111a087e8, root tree listing)`
- `verifier: https://github.com/BCA-MLC/Project-OmniBus (git ls-remote; git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://raw.githubusercontent.com/BCA-MLC/Project-OmniBus/8a0c3fa6c33d492e71cd4aa1356575fdde6bf941/README.md`
- `verifier: https://raw.githubusercontent.com/BCA-MLC/Project-OmniBus/8a0c3fa6c33d492e71cd4aa1356575fdde6bf941/LICENSE (404)`
- `verifier: https://github.com/BCA-MLC (WebFetch)`
- `verifier: https://github.com/BCA-MLC/BCA-MLC.github.io (git ls-remote; not public)`
- `verifier: https://github.com/BCA-MLC/bca-mlc.github.io (git ls-remote; not public)`
- `verifier: https://github.com/BCA-MLC/website (git ls-remote; not public)`
- `verifier: https://github.com/BCA-MLC/competition (git ls-remote; not public)`

</details>

<details><summary><code>build-arena.github.io</code>: 34 entries</summary>

- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md`
- `https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `https://github.com/github/docs (git ls-remote)`
- `https://github.com/build-arena/ConstructionChallenge (git ls-remote, blobless git clone)`
- `https://github.com/build-arena/build-arena.github.io (git ls-remote, blobless git clone)`
- `https://raw.githubusercontent.com/build-arena/ConstructionChallenge/b3bc38f7f28383e708303670f9c038c087708009/web/public/BuildArena-Challenge-EN.md`
- `https://raw.githubusercontent.com/build-arena/ConstructionChallenge/b3bc38f7f28383e708303670f9c038c087708009/web/index.html`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/privacy-policies/github-general-privacy-statement.md`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-doxxing-and-invasion-of-privacy.md`
- `verifier: https://github.com/github/docs (git ls-remote refs/heads/main = 2bd66de8cea336061c9ea060c9b37385136e6ab3 on 2026-10-05)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `verifier: https://github.com/build-arena/ConstructionChallenge (git ls-remote, blobless git clone, git grep fetching text blobs)`
- `verifier: https://github.com/build-arena/build-arena.github.io (git ls-remote, blobless git clone, git grep fetching text blobs)`
- `verifier: https://raw.githubusercontent.com/build-arena/ConstructionChallenge/b3bc38f7f28383e708303670f9c038c087708009/web/public/BuildArena-Challenge-EN.md`
- `verifier: https://raw.githubusercontent.com/build-arena/ConstructionChallenge/b3bc38f7f28383e708303670f9c038c087708009/web/index.html`
- `verifier: https://raw.githubusercontent.com/build-arena/ConstructionChallenge/b3bc38f7f28383e708303670f9c038c087708009/web/vite.config.ts`
- `verifier: https://raw.githubusercontent.com/build-arena/ConstructionChallenge/b3bc38f7f28383e708303670f9c038c087708009/.github/workflows/deploy.yml`
- `verifier: https://raw.githubusercontent.com/build-arena/ConstructionChallenge/b3bc38f7f28383e708303670f9c038c087708009/web/src/i18n/content.ts`
- `verifier: https://raw.githubusercontent.com/build-arena/build-arena.github.io/d6c91019409f5aad2f67f80198eaa29eebaa58e3/LICENSE`
- `verifier: https://raw.githubusercontent.com/build-arena/build-arena.github.io/d6c91019409f5aad2f67f80198eaa29eebaa58e3/index.html`
- `verifier: https://raw.githubusercontent.com/build-arena/build-arena.github.io/d6c91019409f5aad2f67f80198eaa29eebaa58e3/package.json`

</details>

<details><summary><code>codabench.org</code>: 30 entries</summary>

- `https://github.com/orgs/codalab/repositories?type=all`
- `https://github.com/codalab/codabench (git ls-remote; git clone depth 1, develop e04d0d8f71b40c54f37eef136cf6bcb4499bc833)`
- `https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/documentation/PRIVACY.md`
- `https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/src/templates/base.html`
- `https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/LICENSE.TXT`
- `https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/src/templates/competitions/detail.html`
- `https://github.com/codalab/codalab.github.io (git clone)`
- `https://github.com/codalab/codalab-competitions (git clone)`
- `https://github.com/codalab/codalab-competitions.wiki.git (git clone, 149c21859765b1be4dbbe333202447f122e7ce32)`
- `https://raw.githubusercontent.com/wiki/codalab/codalab-competitions/149c21859765b1be4dbbe333202447f122e7ce32/Termes-et-conditions.md (404)`
- `https://raw.githubusercontent.com/wiki/codalab/codalab-competitions/Termes-et-conditions.md`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/tosdr/tosdr-snapshots (git clone, tree at b44ae1b)`
- `verifier: git ls-remote https://github.com/codalab/codabench (master c3be819, develop e04d0d8)`
- `verifier: https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/documentation/PRIVACY.md`
- `verifier: https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/src/templates/base.html`
- `verifier: https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/LICENSE.TXT`
- `verifier: https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/src/templates/competitions/detail.html`
- `verifier: https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/src/templates/registration/signup.html`
- `verifier: https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/src/templates/registration/login.html`
- `verifier: https://raw.githubusercontent.com/codalab/codabench/c3be81944cf3733605bcaf311562e472f3e45755/documentation/docs/index.md`
- `verifier: https://raw.githubusercontent.com/codalab/codabench/e04d0d8f71b40c54f37eef136cf6bcb4499bc833/documentation/PRIVACY.md`
- `verifier: https://raw.githubusercontent.com/codalab/codabench/e04d0d8f71b40c54f37eef136cf6bcb4499bc833/src/templates/base.html`
- `verifier: https://raw.githubusercontent.com/codalab/codabench/e04d0d8f71b40c54f37eef136cf6bcb4499bc833/documentation/docs/index.md`
- `verifier: git clone --depth 1 --filter=blob:none --sparse --branch master https://github.com/codalab/codabench (src/apps, src/templates, src/static/riot)`
- `verifier: git ls-remote + git clone https://github.com/codalab/codalab-competitions.wiki.git (HEAD 149c21859765b1be4dbbe333202447f122e7ce32)`
- `verifier: https://raw.githubusercontent.com/wiki/codalab/codalab-competitions/Termes-et-conditions.md`
- `verifier: https://raw.githubusercontent.com/wiki/codalab/codalab-competitions/149c21859765b1be4dbbe333202447f122e7ce32/Termes-et-conditions.md (404)`
- `verifier: https://raw.githubusercontent.com/wiki/codalab/codalab-competitions/d60cb61fb228b6ec6fe1efaa2549ca8409850ca4/Termes-et-conditions.md (404)`
- `verifier: OTA 18 declarations repos and tosdr-snapshots tree (as listed under kaggle.com)`

</details>

<details><summary><code>crunchdao.com</code>: 22 entries</summary>

- `https://github.com/search?type=repositories&q=crunchdao (WebFetch)`
- `https://github.com/crunchdao (WebFetch)`
- `https://github.com/orgs/crunchdao/repositories?type=all&per_page=100 (WebFetch)`
- `https://github.com/orgs/crunchdao/repositories?type=all&page=2 (WebFetch)`
- `https://github.com/crunchdao/{docs,competitions,crunch-global-leaderboard,crunch-cli,coordinator-webapp,crunch-skill,crunch-node-starter,coordinator-getting-started,perspective-nextjs,crunchdao-protocol,readwrite,crunch-titles,crunch-certificate,whitepaper,crunch-convert,model-runner-client} (git clone)`
- `https://github.com/uuazed/crunchdao (git clone)`
- `https://raw.githubusercontent.com/crunchdao/crunch-cli/78077c1a65aad5cd67d10e1b999b7689d0122aac/crunch/api/_errors.py`
- `https://raw.githubusercontent.com/crunchdao/crunch-cli/78077c1a65aad5cd67d10e1b999b7689d0122aac/crunch/constants.py`
- `https://raw.githubusercontent.com/crunchdao/docs/8d7724cd5d8d4e478ba1c989913368a9b1725eab/competitions/competitions/structural-break-real-time.md`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch) and the 18 *-declarations repos (git clone)`
- `https://raw.githubusercontent.com/OpenTermsArchive/{6 repos}/main/declarations/{CrunchDAO,Crunchdao}.json (404)`
- `https://github.com/tosdr/tosdr-snapshots (git clone, blobless)`
- `https://github.com/pde/tosback2 (git clone, blobless)`
- `verifier: https://raw.githubusercontent.com/crunchdao/crunch-cli/78077c1a65aad5cd67d10e1b999b7689d0122aac/crunch/api/_errors.py (curl, 200, sha256 and bytes recomputed)`
- `verifier: https://raw.githubusercontent.com/crunchdao/crunch-cli/78077c1a65aad5cd67d10e1b999b7689d0122aac/crunch/constants.py (curl, 200)`
- `verifier: https://raw.githubusercontent.com/crunchdao/crunch-cli/78077c1a65aad5cd67d10e1b999b7689d0122aac/README.md (curl, 200)`
- `verifier: https://raw.githubusercontent.com/crunchdao/docs/8d7724cd5d8d4e478ba1c989913368a9b1725eab/competitions/competitions/structural-break-real-time.md (curl, 200)`
- `verifier: git ls-remote https://github.com/crunchdao/{docs,coordinator-webapp,crunch-cli,frontend-apprenticeship-assignment,pi-client,orthogonal-cli,model-orchestrator,crunch-synth}.git`
- `verifier: https://github.com/crunchdao/docs (sparse clone of *.md/*.yaml/*.yml at 8d7724c)`
- `verifier: https://github.com/crunchdao/{coordinator-webapp,frontend-apprenticeship-assignment,pi-client,orthogonal-cli,model-orchestrator,crunch-synth,crunch-numinous,crunch-encrypt,model-runner,coordinator-node-starter} (sparse clones)`
- `verifier: https://github.com/orgs/crunchdao/repositories?type=all&per_page=100 and &page=2 (WebFetch)`
- `verifier: OTA 18 declarations repos (git clone, 0 hits), tosdr/tosdr-snapshots@b44ae1b6 (treeless clone, root listing), pde/tosback2@a5a27f9 (treeless clone, rules listing)`

</details>

<details><summary><code>devpost.com</code>: 30 entries</summary>

- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch)`
- `https://github.com/OpenTermsArchive/<each of the 18 *-declarations repos> (git clone --depth 1)`
- `https://raw.githubusercontent.com/OpenTermsArchive/{contrib,pga,france,genai-contrib,dating,platform-governance-archive}-declarations/main/declarations/{Devpost,DevPost}.json (all 404)`
- `https://raw.githubusercontent.com/OpenTermsArchive/contrib-declarations/main/declarations/Facebook.json (probe control, 200)`
- `https://github.com/OpenTermsArchive, https://github.com/OpenTermsArchive/contrib-declarations/tree/main/declarations, https://github.com/orgs/OpenTermsArchive/repositories?q=declarations (curl: 403 from the egress proxy, not read)`
- `https://github.com/tosdr/tosdr-snapshots (git clone, blobless, tree listing)`
- `https://github.com/pde/tosback2 (git clone, blobless, tree listing)`
- `https://github.com/devpost (WebFetch)`
- `https://github.com/challengepost (WebFetch)`
- `https://github.com/search?type=repositories&q=devpost+terms (WebFetch)`
- `https://github.com/search?type=repositories&q=devpost+rules (WebFetch)`
- `https://github.com/search?type=repositories&q=%22devpost%22+%22terms+of+service%22 (WebFetch)`
- `https://github.com/challengepost/{hackstart,devpost-curriculum,learn-ai-basics,opensource-challenges,reimagine,legacy_assets,campus_evangelist} (git clone)`
- `https://github.com/mikey92/ruleproof (git clone)`
- `https://github.com/MathieuDWeill/nightagent-https-openai-_devpost_-com-_rules_ (git clone failed, needs authentication)`
- `https://raw.githubusercontent.com/challengepost/reimagine/abc3b7d34ff6641d810d3213fb0a462112efa7c5/app/views/reimagine2/devpost/_footer.html.erb`
- `verifier: https://raw.githubusercontent.com/challengepost/reimagine/abc3b7d34ff6641d810d3213fb0a462112efa7c5/app/views/reimagine2/devpost/_footer.html.erb (curl, 200, sha256 and bytes recomputed)`
- `verifier: https://raw.githubusercontent.com/challengepost/reimagine/abc3b7d34ff6641d810d3213fb0a462112efa7c5/README.md (200)`
- `verifier: https://raw.githubusercontent.com/challengepost/reimagine/abc3b7d34ff6641d810d3213fb0a462112efa7c5/LICENSE (200); LICENSE.md and LICENSE.txt (404)`
- `verifier: https://github.com/challengepost/reimagine.git (git ls-remote: HEAD = master = abc3b7d34ff6641d810d3213fb0a462112efa7c5)`
- `verifier: https://github.com/challengepost/reimagine/commits/abc3b7d34ff6641d810d3213fb0a462112efa7c5/app/views/reimagine2/devpost/_footer.html.erb (WebFetch)`
- `verifier: https://github.com/challengepost/reimagine/commit/abc3b7d34ff6641d810d3213fb0a462112efa7c5 (WebFetch)`
- `verifier: https://github.com/challengepost (WebFetch)`
- `verifier: https://github.com/orgs/challengepost/repositories?type=all&per_page=100, &page=2, &page=3 (WebFetch)`
- `verifier: https://github.com/challengepost/supportcenter (sparse clone, HEAD e40066cde2ed25dc14c0541edb746ff8c6933114)`
- `verifier: https://github.com/challengepost/{knowledge_base_scripts,frontend-things,blog,hacker_card} (sparse clones at 3d85056, 004129f, cc9ace6, 8bedf81)`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch, 18 repos)`
- `verifier: https://github.com/OpenTermsArchive/{contrib,pga,france,genai-contrib,genai-eu,dating,p2b-compliance,dsa-reports,user-rights,demo,sandbox,template,india,kenya,cote-d-ivoire,sante-numerique-france,france-elections,france-elections-experiment}-declarations (git clone --depth 1, grep: 0 hits); platform-governance-archive-declarations (clone refused, no such repo)`
- `verifier: https://github.com/tosdr/tosdr-snapshots (git ls-remote HEAD b44ae1b6b15427ecceda8df0311e73e111a087e8; treeless clone, root listing of 7,853 entries)`
- `verifier: https://github.com/pde/tosback2 (treeless clone at a5a27f927171fcd28161e121e44941c41a4c3496, rules/ listing of 927 files)`

</details>

<details><summary><code>drivendata.org</code>: 19 entries</summary>

- `https://github.com/orgs/drivendataorg/repositories?q=&type=all&sort=stargazers`
- `https://github.com/orgs/drivendataorg/repositories?type=all&page=1`
- `https://github.com/orgs/drivendataorg/repositories?type=all&page=2`
- `https://github.com/orgs/drivendataorg/repositories?type=all&page=3`
- `https://github.com/orgs/drivendataorg/repositories?type=all&page=4`
- `https://github.com/orgs/drivendataorg/repositories?type=all&page=5`
- `https://raw.githubusercontent.com/drivendataorg/<repo>/HEAD/README.md for 126 repos (cloudpathlib … benchmarks-old)`
- `git clone https://github.com/drivendataorg/kaiip-discourse-theme`
- `git clone https://github.com/drivendataorg/prize-winner-template`
- `git clone https://github.com/drivendataorg/competition-winners`
- `git clone https://github.com/drivendataorg/drivendata-submission-validator`
- `git clone https://github.com/drivendataorg/concept-to-clinic`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/tosdr/tosdr-snapshots (git clone, tree at b44ae1b)`
- `verifier: https://github.com/orgs/drivendataorg/repositories?type=all&q=site (WebFetch, 0 results)`
- `verifier: https://github.com/drivendataorg (WebFetch)`
- `verifier: git clone (depth 1, blob:limit=400k, no checkout) https://github.com/drivendataorg/{cookiecutter-data-science,competition-winners,deon,zamba,drivendata-submission-validator,prize-winner-template,kaiip-discourse-theme,cloudpathlib,erdantic,concept-to-clinic}`
- `verifier: https://github.com/search?q=drivendata+terms&type=repositories (WebFetch, 0 results)`
- `verifier: OTA 18 declarations repos and tosdr-snapshots tree (as listed under kaggle.com)`

</details>

<details><summary><code>eurocontrol.int</code>: 13 entries</summary>

- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/config.toml`
- `https://raw.githubusercontent.com/euctrl-pru/aiu-portal/6a645289e4947d68af532852345efd5f646c5684/themes/pru-theme/layouts/partials/footer.html`
- `https://github.com/euctrl-pru`
- `https://github.com/euctrl-pru/aiu-portal/commits/master.atom`
- `https://github.com/search?type=repositories&q=eurocontrol+%22terms+of+use%22`
- `https://raw.githubusercontent.com/OpenTermsArchive/<8 declarations repos>/main/declarations/EUROCONTROL.json and Eurocontrol.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{EUROCONTROL,Eurocontrol,eurocontrol,eurocontrol.int}/<document>.html (404)`
- `VERIFIER:`
- `https://github.com/search?type=repositories&q=%22privacy-and-website-terms-use%22`
- `https://github.com/search?type=users&q=eurocontrol`
- `https://github.com/orgs/eurocontrol/repositories?type=all`
- `https://raw.githubusercontent.com/OpenTermsArchive/<17 declarations repos>/main/declarations/{EUROCONTROL,Eurocontrol}.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{EUROCONTROL,Eurocontrol,eurocontrol.int}/<5-7 document names>.html (404)`

</details>

<details><summary><code>flagos.io</code>: 81 entries</summary>

- `https://github.com/tosdr/tosdr-snapshots (WebFetch; git clone --filter=tree:0 at b44ae1b6b15427ecceda8df0311e73e111a087e8)`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/OpenTermsArchive/demo-declarations`
- `https://github.com/OpenTermsArchive/user-rights-declarations`
- `https://github.com/OpenTermsArchive/genai-contrib-declarations`
- `https://github.com/OpenTermsArchive/genai-eu-declarations`
- `https://github.com/OpenTermsArchive/contrib-declarations`
- `https://github.com/OpenTermsArchive/pga-declarations`
- `https://github.com/OpenTermsArchive/dsa-reports-declarations`
- `https://github.com/OpenTermsArchive/sante-numerique-france-declarations`
- `https://github.com/OpenTermsArchive/kenya-declarations`
- `https://github.com/OpenTermsArchive/dating-declarations`
- `https://github.com/OpenTermsArchive/france-declarations`
- `https://github.com/OpenTermsArchive/sandbox-declarations`
- `https://github.com/OpenTermsArchive/p2b-compliance-declarations`
- `https://github.com/OpenTermsArchive/france-elections-declarations`
- `https://github.com/OpenTermsArchive/india-declarations`
- `https://github.com/OpenTermsArchive/template-declarations`
- `https://github.com/OpenTermsArchive/cote-d-ivoire-declarations`
- `https://github.com/OpenTermsArchive/france-elections-experiment-declarations`
- `https://github.com/search?type=repositories&q=flagos`
- `https://github.com/search?type=repositories&q=flagos.io`
- `https://github.com/search?type=repositories&q=flagos+race`
- `https://github.com/search?type=repositories&q=flagos+competition`
- `https://github.com/orgs/flagos-ai/repositories?type=all&per_page=100`
- `https://github.com/orgs/flagos-ai/repositories?type=all&page=2`
- `https://github.com/flagos-ai/community (git clone tree listing)`
- `https://github.com/flagos-ai/.github (git clone tree listing)`
- `https://github.com/flagos-ai/docs (git clone tree listing)`
- `https://raw.githubusercontent.com/flagos-ai/.github/e22416fa4f341fe02f17e1195016bf32b58b1eb4/profile/README.md`
- `https://raw.githubusercontent.com/flagos-ai/community/b5267d78fec3b88c6cd165f217aa4090f2febb0b/README.md`
- `https://raw.githubusercontent.com/flagos-ai/community/b5267d78fec3b88c6cd165f217aa4090f2febb0b/LICENSE`
- `https://raw.githubusercontent.com/flagos-ai/docs/c13b3e6e02efb5dc481dd44a959e7a732decddb2/README.md`
- `https://github.com/FlagOpen`
- `https://github.com/blueproj/flagos-long-context-icl-annotation (git ls-remote; git clone tree listing)`
- `https://raw.githubusercontent.com/blueproj/flagos-long-context-icl-annotation/1c91e98b2c68c15f4e4086103e3d567f2d27cf0a/README.md`
- `https://raw.githubusercontent.com/blueproj/flagos-long-context-icl-annotation/1c91e98b2c68c15f4e4086103e3d567f2d27cf0a/README_CN.md (404)`
- `https://raw.githubusercontent.com/blueproj/flagos-long-context-icl-annotation/1c91e98b2c68c15f4e4086103e3d567f2d27cf0a/README_EN.md (404)`
- `https://github.com/huangnie2020/FlagOS-72-competition-202607-task2-dsa_topk_page_table_transform (git ls-remote; git clone tree listing)`
- `https://raw.githubusercontent.com/huangnie2020/FlagOS-72-competition-202607-task2-dsa_topk_page_table_transform/8eb694f928d83d57ed5c525958633dc49fe0f1dd/README.md`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch: 18 repos, no pagination)`
- `verifier: https://github.com/OpenTermsArchive/demo-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/user-rights-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-eu-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/pga-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dsa-reports-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sante-numerique-france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/kenya-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dating-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sandbox-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/p2b-compliance-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/india-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/template-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/cote-d-ivoire-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-experiment-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/platform-governance-archive-declarations (git ls-remote; not public)`
- `verifier: https://github.com/tosdr/tosdr-snapshots (git ls-remote; git clone --depth 1 --filter=tree:0 --no-checkout at b44ae1b6b15427ecceda8df0311e73e111a087e8, root tree listing)`
- `verifier: https://raw.githubusercontent.com/flagos-ai/community/b5267d78fec3b88c6cd165f217aa4090f2febb0b/README.md`
- `verifier: https://raw.githubusercontent.com/flagos-ai/community/b5267d78fec3b88c6cd165f217aa4090f2febb0b/LICENSE`
- `verifier: https://raw.githubusercontent.com/flagos-ai/docs/c13b3e6e02efb5dc481dd44a959e7a732decddb2/README.md`
- `verifier: https://raw.githubusercontent.com/blueproj/flagos-long-context-icl-annotation/1c91e98b2c68c15f4e4086103e3d567f2d27cf0a/README.md`
- `verifier: https://github.com/flagos-ai/community (git ls-remote)`
- `verifier: https://github.com/flagos-ai/docs (git ls-remote; git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://github.com/blueproj/flagos-long-context-icl-annotation (git ls-remote)`
- `verifier: https://raw.githubusercontent.com/flagos-ai/docs/c13b3e6e02efb5dc481dd44a959e7a732decddb2/docs/flagos_homepage/index.md`
- `verifier: https://raw.githubusercontent.com/flagos-ai/docs/c13b3e6e02efb5dc481dd44a959e7a732decddb2/docs/flagos_homepage/overview.md`
- `verifier: https://raw.githubusercontent.com/flagos-ai/docs/c13b3e6e02efb5dc481dd44a959e7a732decddb2/docs/flagos_homepage/whats_new.md`
- `verifier: https://raw.githubusercontent.com/flagos-ai/docs/c13b3e6e02efb5dc481dd44a959e7a732decddb2/docs/flagos_homepage/AGENTS.md`
- `verifier: https://raw.githubusercontent.com/flagos-ai/docs/c13b3e6e02efb5dc481dd44a959e7a732decddb2/docs/conf.py`
- `verifier: https://github.com/orgs/flagos-ai/repositories?type=all&per_page=100 (WebFetch)`
- `verifier: https://github.com/orgs/flagos-ai/repositories?type=all&page=2 (WebFetch)`
- `verifier: https://github.com/flagos-ai/quiz (git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://raw.githubusercontent.com/flagos-ai/quiz/ee11df295217349bdcd1450ec0c5d5c7de7ff7f6/README.md`
- `verifier: https://raw.githubusercontent.com/flagos-ai/quiz/ee11df295217349bdcd1450ec0c5d5c7de7ff7f6/index.html`
- `verifier: https://github.com/flagos-ai/release-info (git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://github.com/flagos-ai/OpenCourse (git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://raw.githubusercontent.com/flagos-ai/OpenCourse/cb6b9e0a3c01d9cd31bc2187127a6f44f6626990/README.md`

</details>

<details><summary><code>fomo26.github.io</code>: 25 entries</summary>

- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md`
- `https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `https://github.com/github/docs (git ls-remote)`
- `https://github.com/fomo26/fomo26.github.io (git ls-remote, blobless git clone; WebFetch of the repo page)`
- `https://github.com/fomo26/fomo26.github.io/deployments (WebFetch; 404 anonymous)`
- `https://raw.githubusercontent.com/fomo26/fomo26.github.io/f41ba507e248906fdb3cd7e10ff986a3d5a0a9e7/index.html`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/privacy-policies/github-general-privacy-statement.md`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-doxxing-and-invasion-of-privacy.md`
- `verifier: https://github.com/github/docs (git ls-remote refs/heads/main = 2bd66de8cea336061c9ea060c9b37385136e6ab3 on 2026-10-05)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `verifier: https://github.com/fomo26/fomo26.github.io (git ls-remote, git clone)`
- `verifier: https://raw.githubusercontent.com/fomo26/fomo26.github.io/f41ba507e248906fdb3cd7e10ff986a3d5a0a9e7/index.html`

</details>

<details><summary><code>geminixprize.com</code>: 59 entries</summary>

- `https://github.com/tosdr/tosdr-snapshots (WebFetch; git clone --filter=tree:0 at b44ae1b6b15427ecceda8df0311e73e111a087e8)`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/OpenTermsArchive/demo-declarations`
- `https://github.com/OpenTermsArchive/user-rights-declarations`
- `https://github.com/OpenTermsArchive/genai-contrib-declarations`
- `https://github.com/OpenTermsArchive/genai-eu-declarations`
- `https://github.com/OpenTermsArchive/contrib-declarations`
- `https://github.com/OpenTermsArchive/pga-declarations`
- `https://github.com/OpenTermsArchive/dsa-reports-declarations`
- `https://github.com/OpenTermsArchive/sante-numerique-france-declarations`
- `https://github.com/OpenTermsArchive/kenya-declarations`
- `https://github.com/OpenTermsArchive/dating-declarations`
- `https://github.com/OpenTermsArchive/france-declarations`
- `https://github.com/OpenTermsArchive/sandbox-declarations`
- `https://github.com/OpenTermsArchive/p2b-compliance-declarations`
- `https://github.com/OpenTermsArchive/france-elections-declarations`
- `https://github.com/OpenTermsArchive/india-declarations`
- `https://github.com/OpenTermsArchive/template-declarations`
- `https://github.com/OpenTermsArchive/cote-d-ivoire-declarations`
- `https://github.com/OpenTermsArchive/france-elections-experiment-declarations`
- `https://github.com/search?type=repositories&q=geminixprize`
- `https://github.com/search?type=repositories&q=gemini+xprize`
- `https://github.com/search?type=users&q=xprize`
- `https://github.com/XPRIZE`
- `https://github.com/xprize-hackathon`
- `https://github.com/XPRIZE-Foundation`
- `https://github.com/ElkanHub/Gemini-XPRIZE-repo (git ls-remote; git clone tree listing)`
- `https://raw.githubusercontent.com/ElkanHub/Gemini-XPRIZE-repo/a3f501c1a8faddbfda7df6f8329a355711da5703/README.md`
- `https://raw.githubusercontent.com/ElkanHub/Gemini-XPRIZE-repo/a3f501c1a8faddbfda7df6f8329a355711da5703/BUSINESS%20DOCS/PROJECT_ROADMAP.md`
- `https://raw.githubusercontent.com/ElkanHub/Gemini-XPRIZE-repo/a3f501c1a8faddbfda7df6f8329a355711da5703/CLAUDE.md`
- `https://github.com/AppZ3/gemini-xprize (git ls-remote; git clone tree listing)`
- `https://github.com/astrayama/yggdrasil (git ls-remote; git clone tree listing)`
- `https://raw.githubusercontent.com/astrayama/yggdrasil/ed767f7a317b403dcaaaf876b237c8904535471e/README.md`
- `https://github.com/iamade/ppaa-gemini-xprize (git ls-remote; git clone tree listing)`
- `https://raw.githubusercontent.com/iamade/ppaa-gemini-xprize/25a23325926973f07f62af58bb921031676d435b/README.md`
- `https://github.com/shivakrishna1872-lgtm/geminixprize (git ls-remote; git clone tree listing)`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch: 18 repos, no pagination)`
- `verifier: https://github.com/OpenTermsArchive/demo-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/user-rights-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-eu-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/pga-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dsa-reports-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sante-numerique-france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/kenya-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dating-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sandbox-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/p2b-compliance-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/india-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/template-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/cote-d-ivoire-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-experiment-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/platform-governance-archive-declarations (git ls-remote; not public)`
- `verifier: https://github.com/tosdr/tosdr-snapshots (git ls-remote; git clone --depth 1 --filter=tree:0 --no-checkout at b44ae1b6b15427ecceda8df0311e73e111a087e8, root tree listing)`
- `verifier: https://github.com/search?type=repositories&q=geminixprize (WebFetch)`
- `verifier: https://github.com/orgs/XPRIZE/repositories (WebFetch)`

</details>

<details><summary><code>grand-challenge.org</code>: 33 entries</summary>

- `git ls-remote / git clone https://github.com/comic/grand-challenge.org (HEAD ff2fb5c6)`
- `git ls-remote https://github.com/DIAGNijmegen/rse-grand-challenge (HEAD ff2fb5c6)`
- `https://github.com/DIAGNijmegen (WebFetch)`
- `https://github.com/search?type=repositories&q=grand-challenge+terms+of+service (WebFetch)`
- `https://github.com/DIAGNijmegen/rse-gcapi (git clone)`
- `https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/config/settings.py`
- `https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/README.md`
- `https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/LICENSE`
- `https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/grandchallenge/challenges/forms.py`
- `https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/grandchallenge/algorithms/templates/algorithms/job_form_create.html`
- `https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/config/urls/root.py`
- `https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/grandchallenge/policies/urls.py`
- `https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/grandchallenge/policies/models.py`
- `https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/grandchallenge/well_known/templates/well_known/robots.txt`
- `https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/config/urls/challenge_subdomain.py`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch) and the 18 *-declarations repos (git clone)`
- `https://raw.githubusercontent.com/OpenTermsArchive/{6 repos}/main/declarations/{Grand-Challenge,Grand%20Challenge}.json (404)`
- `https://github.com/tosdr/tosdr-snapshots (git clone, blobless)`
- `https://github.com/pde/tosback2 (git clone, blobless)`
- `verifier: git ls-remote https://github.com/DIAGNijmegen/rse-grand-challenge.git and https://github.com/comic/grand-challenge.org.git (both HEAD ff2fb5c6; gh-pages a110f3faaae03002565c5e53e80d005d9256acb1)`
- `verifier: https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/{app/config/settings.py,README.md,LICENSE,app/grandchallenge/challenges/forms.py,app/grandchallenge/algorithms/templates/algorithms/job_form_create.html,app/config/urls/root.py,app/grandchallenge/policies/urls.py,app/grandchallenge/policies/models.py,app/grandchallenge/well_known/templates/well_known/robots.txt,app/config/urls/challenge_subdomain.py} (curl, all 200, sha256 and bytes recomputed)`
- `verifier: https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/grandchallenge/subdomains/middleware.py`
- `verifier: https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/grandchallenge/subdomains/utils.py`
- `verifier: https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/grandchallenge/well_known/urls.py`
- `verifier: https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/{NOTICE,CITATION.cff}`
- `verifier: https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/grandchallenge/policies/{migrations/0001_initial.py,migrations/0002_auto_20200611_1053.py,migrations/0003_auto_20220517_0740.py,migrations/0005_policy_policies_policy_unique_slug.py,templates/policies/policy_detail.html,models.py,sitemaps.py,views.py,admin.py}`
- `verifier: https://github.com/DIAGNijmegen/rse-grand-challenge/tree/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4 and .../tree/ff2fb5c6fb0f7951abf37af4344cd55f102f2ef4/app/grandchallenge/policies, .../policies/migrations, .../policies/templates/policies (WebFetch)`
- `verifier: https://github.com/DIAGNijmegen/rse-grand-challenge/tree/a110f3faaae03002565c5e53e80d005d9256acb1 (WebFetch, gh-pages)`
- `verifier: https://raw.githubusercontent.com/DIAGNijmegen/rse-grand-challenge/a110f3faaae03002565c5e53e80d005d9256acb1/{searchindex.js,index.html,development.html}`
- `verifier: https://github.com/search?type=repositories&q=grand-challenge+policies (WebFetch)`
- `verifier: https://github.com/search?type=repositories&q=org%3ADIAGNijmegen+grand-challenge (WebFetch)`
- `verifier: https://github.com/DIAGNijmegen/rse-grand-challenge (git clone --filter=blob:none, aborted when the container disk filled; nothing from it used)`
- `verifier: OTA 18 declarations repos (git clone, 0 hits), tosdr/tosdr-snapshots@b44ae1b6 (treeless clone, root listing), pde/tosback2@a5a27f9 (treeless clone, rules listing)`

</details>

<details><summary><code>health-data-hub.fr</code>: 27 entries</summary>

- `https://github.com/OpenTermsArchive/sante-numerique-france-declarations/tree/main/declarations`
- `https://github.com/OpenTermsArchive/france-declarations/tree/main/declarations`
- `https://github.com/OpenTermsArchive/contrib-declarations/tree/main/declarations`
- `https://raw.githubusercontent.com/OpenTermsArchive/{france,sante-numerique-france,contrib}-declarations/main/declarations/<8 names in 'searched'>.json (404)`
- `https://raw.githubusercontent.com/OpenTermsArchive/{pga,genai-contrib,genai-eu,user-rights,dating}-declarations/main/declarations/Health%20Data%20Hub.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{Health Data Hub,health-data-hub.fr}/<document>.html (404)`
- `https://github.com/search?type=users&q=health+data+hub`
- `https://github.com/health-data-hub`
- `https://github.com/HealthDataHub-France`
- `https://github.com/search?type=repositories&q=%22health-data-hub.fr%22+in%3Areadme`
- `https://raw.githubusercontent.com/hs87000/boas-explorer/main/README.md`
- `https://github.com/hs87000/boas-explorer`
- `https://github.com/hs87000/boas-explorer/tree/main/data-pipeline`
- `https://raw.githubusercontent.com/davidouagne/datahub-healthdcat-ap-exporter/main/README.md`
- `https://raw.githubusercontent.com/GuillaumePressiat/meetup-hdh-22--2024/main/README.md`
- `https://raw.githubusercontent.com/BerengerQueune/OMOP_HDH/main/README.md`
- `https://raw.githubusercontent.com/Llugway/AllergenChipChallenge/main/README.md`
- `https://raw.githubusercontent.com/DanielC-N/depot_git/main/README.md`
- `https://github.com/search?type=repositories&q=%22health+data+hub%22+mentions+legales`
- `VERIFIER:`
- `https://github.com/search?type=repositories&q=%22health-data-hub.fr%22`
- `https://github.com/search?type=repositories&q=%22health-data-hub.fr%2Fmentions%22`
- `https://github.com/search?type=users&q=healthdatahub`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://raw.githubusercontent.com/OpenTermsArchive/<17 declarations repos>/main/declarations/{Health Data Hub,Plateforme des données de santé}.json (404)`
- `https://github.com/tosdr/tosdr-snapshots/commits/main.atom`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{Health Data Hub,health-data-hub.fr}/<5-7 document names>.html (404)`

</details>

<details><summary><code>ijcai.org</code>: 11 entries</summary>

- `https://github.com/search?type=repositories&q=ijcai+2026+website`
- `https://github.com/search?type=users&q=ijcai`
- `https://github.com/ijcai`
- `https://raw.githubusercontent.com/OpenTermsArchive/<8 declarations repos>/main/declarations/IJCAI.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{IJCAI,ijcai.org}/<document>.html (404)`
- `VERIFIER:`
- `https://github.com/search?type=repositories&q=%222026.ijcai.org%22`
- `https://github.com/search?type=repositories&q=ijcai+website`
- `https://github.com/aspirationpublishingtrust-cpu/IJCAI-website`
- `https://raw.githubusercontent.com/OpenTermsArchive/<17 declarations repos>/main/declarations/IJCAI.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{IJCAI,ijcai.org}/<5-7 document names>.html (404)`

</details>

<details><summary><code>k12-ai-infrastructure.org</code>: 71 entries</summary>

- `https://github.com/tosdr/tosdr-snapshots (WebFetch; git clone --filter=tree:0 at b44ae1b6b15427ecceda8df0311e73e111a087e8)`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/OpenTermsArchive/demo-declarations`
- `https://github.com/OpenTermsArchive/user-rights-declarations`
- `https://github.com/OpenTermsArchive/genai-contrib-declarations`
- `https://github.com/OpenTermsArchive/genai-eu-declarations`
- `https://github.com/OpenTermsArchive/contrib-declarations`
- `https://github.com/OpenTermsArchive/pga-declarations`
- `https://github.com/OpenTermsArchive/dsa-reports-declarations`
- `https://github.com/OpenTermsArchive/sante-numerique-france-declarations`
- `https://github.com/OpenTermsArchive/kenya-declarations`
- `https://github.com/OpenTermsArchive/dating-declarations`
- `https://github.com/OpenTermsArchive/france-declarations`
- `https://github.com/OpenTermsArchive/sandbox-declarations`
- `https://github.com/OpenTermsArchive/p2b-compliance-declarations`
- `https://github.com/OpenTermsArchive/france-elections-declarations`
- `https://github.com/OpenTermsArchive/india-declarations`
- `https://github.com/OpenTermsArchive/template-declarations`
- `https://github.com/OpenTermsArchive/cote-d-ivoire-declarations`
- `https://github.com/OpenTermsArchive/france-elections-experiment-declarations`
- `https://github.com/search?type=repositories&q=k12-ai-infrastructure`
- `https://github.com/search?type=repositories&q=k12+ai+infrastructure`
- `https://github.com/search?type=repositories&q=tutoring+outcomes+competition`
- `https://github.com/search?type=users&q=k12-ai`
- `https://github.com/k12-ai`
- `https://github.com/k12-ai-labs`
- `https://github.com/rabiul9137/tutoring-outcomes-competition (git ls-remote; git clone tree listing)`
- `https://raw.githubusercontent.com/rabiul9137/tutoring-outcomes-competition/ab2fd0a0867797f30c202919af3a367b2760e2e6/README.md`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch: 18 repos, no pagination)`
- `verifier: https://github.com/OpenTermsArchive/demo-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/user-rights-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-eu-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/pga-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dsa-reports-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sante-numerique-france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/kenya-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dating-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sandbox-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/p2b-compliance-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/india-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/template-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/cote-d-ivoire-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-experiment-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/platform-governance-archive-declarations (git ls-remote; not public)`
- `verifier: https://github.com/tosdr/tosdr-snapshots (git ls-remote; git clone --depth 1 --filter=tree:0 --no-checkout at b44ae1b6b15427ecceda8df0311e73e111a087e8, root tree listing)`
- `verifier: https://github.com/search?type=repositories&q=k12-ai-infrastructure (WebFetch)`
- `verifier: https://github.com/search?type=repositories&q=tutoring+outcomes (WebFetch)`
- `verifier: https://github.com/search?type=users&q=k12-ai (WebFetch)`
- `verifier: https://github.com/K12-AI-Platform (WebFetch)`
- `verifier: https://github.com/drivendataorg/tutoring-outcomes-runtime (git ls-remote; git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://raw.githubusercontent.com/drivendataorg/tutoring-outcomes-runtime/a2211bcbfdfd996ac30c83b7a24352e489d98cc6/README.md`
- `verifier: https://raw.githubusercontent.com/drivendataorg/tutoring-outcomes-runtime/a2211bcbfdfd996ac30c83b7a24352e489d98cc6/LICENSE`
- `verifier: https://github.com/traghuram444/trace-the-ace-tutoring-outcomes (git ls-remote; git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://raw.githubusercontent.com/traghuram444/trace-the-ace-tutoring-outcomes/7b8ea4f84d74ab3b62381b31a93b2292c5089c5e/README.md`
- `verifier: https://raw.githubusercontent.com/traghuram444/trace-the-ace-tutoring-outcomes/7b8ea4f84d74ab3b62381b31a93b2292c5089c5e/docs/DATA_AND_LICENSE.md`
- `verifier: https://github.com/504aldo/trace-the-ace-tutoring-outcomes (git ls-remote; git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://raw.githubusercontent.com/504aldo/trace-the-ace-tutoring-outcomes/b6bcbf42cdc0b4d68ddca1b2b007a94d7a7ee394/README.md`
- `verifier: https://raw.githubusercontent.com/504aldo/trace-the-ace-tutoring-outcomes/b6bcbf42cdc0b4d68ddca1b2b007a94d7a7ee394/CLAUDE.md`
- `verifier: https://raw.githubusercontent.com/504aldo/trace-the-ace-tutoring-outcomes/b6bcbf42cdc0b4d68ddca1b2b007a94d7a7ee394/INDEX.md`
- `verifier: https://raw.githubusercontent.com/504aldo/trace-the-ace-tutoring-outcomes/b6bcbf42cdc0b4d68ddca1b2b007a94d7a7ee394/docs/data_dictionary.md`
- `verifier: https://raw.githubusercontent.com/504aldo/trace-the-ace-tutoring-outcomes/b6bcbf42cdc0b4d68ddca1b2b007a94d7a7ee394/docs/organizer_email_mrbench.md`
- `verifier: https://github.com/sweetlhare/trace-the-ace (git ls-remote; git clone --depth 1 --filter=blob:none --no-checkout, tree listing)`
- `verifier: https://raw.githubusercontent.com/sweetlhare/trace-the-ace/e4bc8bd90b43fa9ae64885dd040b8a9b60c445d7/README.md`
- `verifier: https://raw.githubusercontent.com/sweetlhare/trace-the-ace/e4bc8bd90b43fa9ae64885dd040b8a9b60c445d7/docs/REPRODUCIBILITY.md`
- `verifier: https://raw.githubusercontent.com/sweetlhare/trace-the-ace/e4bc8bd90b43fa9ae64885dd040b8a9b60c445d7/MODEL_DOCUMENTATION.md`
- `verifier: https://github.com/rabiul9137/tutoring-outcomes-competition (git ls-remote)`
- `verifier: https://raw.githubusercontent.com/rabiul9137/tutoring-outcomes-competition/ab2fd0a0867797f30c202919af3a367b2760e2e6/README.md`

</details>

<details><summary><code>kaggle.com</code>: 34 entries</summary>

- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `git clone (blob:none, depth 1) https://github.com/OpenTermsArchive/<17 declarations repos>`
- `https://github.com/tosdr/tosdr-snapshots (git clone, tree at b44ae1b6b15427ecceda8df0311e73e111a087e8)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/Kaggle/Terms%20of%20Service.html`
- `https://github.com/tosdr/tosdr-snapshots/commits/main/Kaggle/Terms%20of%20Service.html.atom (curl; refused by the session proxy)`
- `https://github.com/tosdr/tosdr-snapshots/commits/main/Kaggle/Terms%20of%20Service.html`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/c351fa1/Kaggle/Terms%20of%20Service.html`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/ee4fa90/Kaggle/Terms%20of%20Service.html`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/f13a238/Kaggle/Terms%20of%20Service.html`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/0dc6607/Kaggle/Terms%20of%20Service.html`
- `https://github.com/orgs/Kaggle/repositories?type=all`
- `https://github.com/Kaggle/kaggle-cli (git clone)`
- `https://github.com/Kaggle/kagglehub (git clone)`
- `https://github.com/Kaggle/kaggle-sdk-python (git clone)`
- `https://github.com/Kaggle/kaggle-skills (git clone)`
- `https://github.com/Kaggle/kaggle-benchmarks (git clone)`
- `https://github.com/Kaggle/kaggle-environments (git clone)`
- `https://github.com/search?q=kaggle+terms+of+use&type=repositories`
- `https://github.com/search?q=%22Welcome+to+Kaggle.+Please+read+on+to+learn+the+rules%22&type=code (sign-in required)`
- `https://github.com/nitheshb/kaggle_clone`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?type=all&page=1..4 (curl; 403 from the session's GitHub proxy)`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch)`
- `verifier: git ls-remote + git clone --depth 1 https://github.com/OpenTermsArchive/{demo,user-rights,genai-contrib,genai-eu,contrib,pga,dsa-reports,sante-numerique-france,kenya,dating,france,sandbox,p2b-compliance,france-elections,india,template,cote-d-ivoire,france-elections-experiment}-declarations`
- `verifier: git ls-remote https://github.com/OpenTermsArchive/platform-governance-archive-declarations (asks for credentials: no such public repo)`
- `verifier: git ls-remote + git clone (depth 1, blob:none, no checkout) https://github.com/tosdr/tosdr-snapshots (HEAD b44ae1b6b15427ecceda8df0311e73e111a087e8)`
- `verifier: https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/Kaggle/Terms%20of%20Service.html`
- `verifier: https://github.com/tosdr/tosdr-snapshots/commits/main/Kaggle/Terms%20of%20Service.html (curl 403; WebFetch read it: 8 commits, latest 541d10f)`
- `verifier: https://raw.githubusercontent.com/tosdr/tosdr-snapshots/7490f53/Kaggle/Terms%20of%20Service.html`
- `verifier: https://raw.githubusercontent.com/tosdr/tosdr-snapshots/f3acd0a/Kaggle/Terms%20of%20Service.html`
- `verifier: https://raw.githubusercontent.com/tosdr/tosdr-snapshots/8992a2d/Kaggle/Terms%20of%20Service.html`
- `verifier: https://raw.githubusercontent.com/tosdr/tosdr-snapshots/541d10f/Kaggle/Terms%20of%20Service.html`
- `verifier: https://github.com/orgs/Kaggle/repositories?type=all (WebFetch)`
- `verifier: git clone --depth 1 https://github.com/Kaggle/{kaggle-cli,kagglehub,kaggle-sdk-python,kaggle-skills,kaggle-benchmarks,kaggle-environments (failed: disk),learntools,kaggle-benchmarks-reference,kaggle-benchmark-harbor-starter-template,docker-python,jupyterlab}`
- `verifier: https://github.com/search?q=kaggle+terms+of+service&type=repositories (WebFetch)`

</details>

<details><summary><code>lbl.gov</code>: 23 entries</summary>

- `https://github.com/FAIR-Universe`
- `https://github.com/FAIR-Universe/FAIR-Universe.github.io`
- `https://github.com/FAIR-Universe/FAIR-Universe.github.io/commits/master.atom`
- `https://github.com/FAIR-Universe/FAIR-Universe.github.io/tree/47c7a7eaa3001da762374fdf07f82715852658eb/.github/workflows`
- `https://raw.githubusercontent.com/FAIR-Universe/FAIR-Universe.github.io/47c7a7eaa3001da762374fdf07f82715852658eb/CNAME`
- `https://raw.githubusercontent.com/FAIR-Universe/FAIR-Universe.github.io/47c7a7eaa3001da762374fdf07f82715852658eb/index.html`
- `https://raw.githubusercontent.com/FAIR-Universe/FAIR-Universe.github.io/47c7a7eaa3001da762374fdf07f82715852658eb/credits.html`
- `https://raw.githubusercontent.com/FAIR-Universe/FAIR-Universe.github.io/47c7a7eaa3001da762374fdf07f82715852658eb/README.md`
- `https://raw.githubusercontent.com/FAIR-Universe/FAIR-Universe.github.io/47c7a7eaa3001da762374fdf07f82715852658eb/LICENSE`
- `https://github.com/github/docs/commits/main.atom`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/LICENSE`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/LICENSE-CODE`
- `https://github.com/search?type=repositories&q=%22lbl.gov%2Fdisclaimers%22`
- `https://github.com/search?type=repositories&q=lbl.gov+website+jekyll`
- `https://raw.githubusercontent.com/OpenTermsArchive/<8 declarations repos>/main/declarations/Lawrence%20Berkeley%20National%20Laboratory.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{Lawrence Berkeley National Laboratory,Berkeley Lab,lbl.gov}/<document>.html (404)`
- `VERIFIER:`
- `https://raw.githubusercontent.com/FAIR-Universe/FAIR-Universe.github.io/47c7a7eaa3001da762374fdf07f82715852658eb/.nojekyll`
- `https://raw.githubusercontent.com/OpenTermsArchive/<17 declarations repos>/main/declarations/Lawrence%20Berkeley%20National%20Laboratory.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{Berkeley Lab,Lawrence Berkeley National Laboratory,lbl.gov}/<5-7 document names>.html (404)`

</details>

<details><summary><code>learn2design2026.com</code>: 62 entries</summary>

- `https://github.com/tosdr/tosdr-snapshots (WebFetch; git clone --filter=tree:0 at b44ae1b6b15427ecceda8df0311e73e111a087e8)`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/OpenTermsArchive/demo-declarations`
- `https://github.com/OpenTermsArchive/user-rights-declarations`
- `https://github.com/OpenTermsArchive/genai-contrib-declarations`
- `https://github.com/OpenTermsArchive/genai-eu-declarations`
- `https://github.com/OpenTermsArchive/contrib-declarations`
- `https://github.com/OpenTermsArchive/pga-declarations`
- `https://github.com/OpenTermsArchive/dsa-reports-declarations`
- `https://github.com/OpenTermsArchive/sante-numerique-france-declarations`
- `https://github.com/OpenTermsArchive/kenya-declarations`
- `https://github.com/OpenTermsArchive/dating-declarations`
- `https://github.com/OpenTermsArchive/france-declarations`
- `https://github.com/OpenTermsArchive/sandbox-declarations`
- `https://github.com/OpenTermsArchive/p2b-compliance-declarations`
- `https://github.com/OpenTermsArchive/france-elections-declarations`
- `https://github.com/OpenTermsArchive/india-declarations`
- `https://github.com/OpenTermsArchive/template-declarations`
- `https://github.com/OpenTermsArchive/cote-d-ivoire-declarations`
- `https://github.com/OpenTermsArchive/france-elections-experiment-declarations`
- `https://github.com/search?type=repositories&q=learn2design`
- `https://github.com/orgs/artificial-scientist-lab/repositories?type=all`
- `https://github.com/artificial-scientist-lab/Learn2Design-2026 (git ls-remote; git clone tree listing)`
- `https://github.com/artificial-scientist-lab/learn2design-2026-eval (git clone; empty repository)`
- `https://github.com/artificial-scientist-lab/neurips_website (git ls-remote; git clone tree listing)`
- `https://raw.githubusercontent.com/artificial-scientist-lab/neurips_website/d8f1e100a1f8671850b216171cbbb647b0342c49/app/page.js`
- `https://raw.githubusercontent.com/artificial-scientist-lab/neurips_website/d8f1e100a1f8671850b216171cbbb647b0342c49/app/layout.js`
- `https://raw.githubusercontent.com/artificial-scientist-lab/neurips_website/d8f1e100a1f8671850b216171cbbb647b0342c49/package.json`
- `https://raw.githubusercontent.com/artificial-scientist-lab/neurips_website/d8f1e100a1f8671850b216171cbbb647b0342c49/LICENSE (404)`
- `https://raw.githubusercontent.com/artificial-scientist-lab/Learn2Design-2026/64781a778ba546f83104c3692c343b16feb7eaf1/README.md`
- `https://raw.githubusercontent.com/artificial-scientist-lab/Learn2Design-2026/64781a778ba546f83104c3692c343b16feb7eaf1/LICENSE`
- `https://raw.githubusercontent.com/artificial-scientist-lab/Learn2Design-2026/64781a778ba546f83104c3692c343b16feb7eaf1/docs/FAQ.md`
- `https://raw.githubusercontent.com/artificial-scientist-lab/Learn2Design-2026/64781a778ba546f83104c3692c343b16feb7eaf1/docs/submission.md`
- `https://raw.githubusercontent.com/artificial-scientist-lab/Learn2Design-2026/64781a778ba546f83104c3692c343b16feb7eaf1/CONTRIBUTING.md`
- `verifier: https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch: 18 repos, no pagination)`
- `verifier: https://github.com/OpenTermsArchive/demo-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/user-rights-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/genai-eu-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/contrib-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/pga-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dsa-reports-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sante-numerique-france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/kenya-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/dating-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/sandbox-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/p2b-compliance-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/india-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/template-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/cote-d-ivoire-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/france-elections-experiment-declarations (sparse clone, declarations/ grepped)`
- `verifier: https://github.com/OpenTermsArchive/platform-governance-archive-declarations (git ls-remote; not public)`
- `verifier: https://github.com/tosdr/tosdr-snapshots (git ls-remote; git clone --depth 1 --filter=tree:0 --no-checkout at b44ae1b6b15427ecceda8df0311e73e111a087e8, root tree listing)`
- `verifier: https://github.com/artificial-scientist-lab/neurips_website (git ls-remote; git clone --depth 1 --filter=blob:none --no-checkout, tree listing; WebFetch of the repo page)`
- `verifier: https://github.com/artificial-scientist-lab/Learn2Design-2026 (git ls-remote)`
- `verifier: https://raw.githubusercontent.com/artificial-scientist-lab/neurips_website/d8f1e100a1f8671850b216171cbbb647b0342c49/package.json`
- `verifier: https://raw.githubusercontent.com/artificial-scientist-lab/neurips_website/d8f1e100a1f8671850b216171cbbb647b0342c49/app/layout.js`
- `verifier: https://raw.githubusercontent.com/artificial-scientist-lab/neurips_website/d8f1e100a1f8671850b216171cbbb647b0342c49/app/page.js`
- `verifier: https://raw.githubusercontent.com/artificial-scientist-lab/Learn2Design-2026/64781a778ba546f83104c3692c343b16feb7eaf1/README.md`
- `verifier: https://github.com/artificial-scientist-lab/neurips_website/commits/main.atom (curl; proxy answered 403)`

</details>

<details><summary><code>microblink.com</code>: 43 entries</summary>

- `https://github.com/search?type=repositories&q=freuid`
- `https://github.com/microblink`
- `https://github.com/orgs/microblink/repositories?type=all&sort=name`
- `https://github.com/orgs/microblink/repositories?type=all&page=2`
- `https://github.com/orgs/microblink/repositories?type=all&page=3`
- `https://github.com/orgs/microblink/repositories?type=all&page=4`
- `https://github.com/microblink/blinkid-android`
- `https://github.com/microblink/web-sdks`
- `https://github.com/microblink/blinkid-android/commits/master.atom`
- `https://raw.githubusercontent.com/microblink/{blinkcard-android,blinkcard-ios,web-sdks,blinkid-android,blinkid-ios,capture-browser,blinkid-react-native}/{main,master}/{README.md,LICENSE,LICENSE.md}`
- `https://raw.githubusercontent.com/microblink/{blinkid-android,blinkcard-android,blinkid-ios,blinkcard-ios}/master/License_notice.md`
- `https://raw.githubusercontent.com/microblink/blinkid-android/master/Release%20notes.md`
- `https://raw.githubusercontent.com/microblink/blinkid-android/master/Transition%20guide.md`
- `https://raw.githubusercontent.com/microblink/blinkid-android/cdbdb2e2fcf7f4f756ad0881cf46a3e1b428ed60/License_notice.md`
- `https://raw.githubusercontent.com/microblink/web-sdks/main/LICENCE_NOTICE.md`
- `https://raw.githubusercontent.com/microblink/web-sdks/main/package.json`
- `https://raw.githubusercontent.com/microblink/web-sdks/main/packages/{blinkid,blinkcard,blinkid-verify}/package.json`
- `https://raw.githubusercontent.com/microblink/web-sdks/main/packages/blinkid/README.md`
- `https://raw.githubusercontent.com/microblink/blinkid-in-browser/{master,main}/{LICENSE,LICENSE.md,README.md,package.json}`
- `https://raw.githubusercontent.com/microblink/{about,microblink.github.io,.github,microblink-python,microblink-api-proxy-example}/{master,main}/{README.md,index.html,LICENSE,profile/README.md}`
- `https://raw.githubusercontent.com/microblink/microblink.github.io/{master,main,gh-pages}/CNAME`
- `https://raw.githubusercontent.com/microblink/microblink.github.io/master/index.html`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/OpenTermsArchive/contrib-declarations/tree/main/declarations`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of 18 *-declarations repos>/main/{README.md,package.json}`
- `https://raw.githubusercontent.com/OpenTermsArchive/{contrib,pga,france,genai-contrib,dating,platform-governance-archive}-declarations/main/declarations/{GitHub,Facebook,Kaggle,Microblink}.json`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of 18 *-declarations repos>/main/declarations/{Microblink,MicroBlink}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/{main,master}/README.md`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/Medium/Terms%20of%20Service.html`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{Microblink,microblink,MicroBlink,microblink.com}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy}.html`
- `https://github.com/tosdr/tosdr-snapshots/tree/main/Microblink`
- `VERIFIER (2026-10-05):`
- `https://raw.githubusercontent.com/OpenTermsArchive/{demo,user-rights,genai-contrib,genai-eu,contrib,pga,dsa-reports,sante-numerique-france,kenya,dating,france,sandbox,p2b-compliance,france-elections,india,template,cote-d-ivoire,france-elections-experiment}-declarations/{main,master}/README.md`
- `https://raw.githubusercontent.com/OpenTermsArchive/{contrib,pga,france,genai-contrib,dating,platform-governance-archive}-declarations/main/README.md`
- `https://raw.githubusercontent.com/OpenTermsArchive/contrib-declarations/main/declarations/GitHub.json`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of the 18 *-declarations repos>/main/declarations/{Microblink,MicroBlink,microblink,BlinkID,GitHub}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/README.md`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{Microblink,MicroBlink,microblink,microblink.com,Medium}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy,Acceptable%20Use%20Policy}.html`
- `https://raw.githubusercontent.com/microblink/{blinkid-android,blinkid-ios,blinkcard-android,blinkcard-ios,blinkid-react-native,blinkid-flutter,blinkid-xamarin,blinkinput-android}/master/{README.md,License_notice.md,LICENSE,LICENSE.md,LICENCE_NOTICE.md}`
- `https://raw.githubusercontent.com/microblink/{web-sdks,blinkid-ux-android,capture-android,capture-ios,blinkid-verify-android}/main/{README.md,License_notice.md,LICENSE,LICENSE.md,LICENCE_NOTICE.md}`
- `https://github.com/search?type=repositories&q=freuid+microblink`
- `https://github.com/search?type=repositories&q=org%3Amicroblink+freuid`
- `https://github.com/search?type=repositories&q=org%3Amicroblink+website`

</details>

<details><summary><code>mozilladatacollective.com</code>: 66 entries</summary>

- `https://github.com/mozilla/legal-docs/commits/main.atom`
- `https://github.com/mozilla/legal-docs/tree/5a23d5fa67719f0b3fdf6f5a751fe285e43f9e43/en`
- `https://raw.githubusercontent.com/mozilla/legal-docs/5a23d5fa67719f0b3fdf6f5a751fe285e43f9e43/en/websites_tou.md`
- `https://raw.githubusercontent.com/mozilla/legal-docs/5a23d5fa67719f0b3fdf6f5a751fe285e43f9e43/en/acceptable_use_policy.md`
- `https://raw.githubusercontent.com/mozilla/legal-docs/5a23d5fa67719f0b3fdf6f5a751fe285e43f9e43/en/common_voice_terms.md`
- `https://raw.githubusercontent.com/mozilla/legal-docs/5a23d5fa67719f0b3fdf6f5a751fe285e43f9e43/LICENSE`
- `https://raw.githubusercontent.com/mozilla/legal-docs/5a23d5fa67719f0b3fdf6f5a751fe285e43f9e43/LICENSE.md`
- `https://raw.githubusercontent.com/mozilla/legal-docs/5a23d5fa67719f0b3fdf6f5a751fe285e43f9e43/README.md`
- `https://github.com/orgs/mozilla/repositories?q=collective&type=all`
- `https://github.com/orgs/mozilla/repositories?q=legal&type=all`
- `https://github.com/orgs/MozillaFoundation/repositories?q=collective&type=all`
- `https://github.com/search?type=repositories&q=mozilladatacollective`
- `https://github.com/search?type=repositories&q=%22mozilla+data+collective%22`
- `https://github.com/search?type=repositories&q=mozilla+data+collective+terms`
- `https://github.com/search?type=code&q=%22competitions.mozilladatacollective.com%22`
- `https://github.com/Mozilla-Data-Collective`
- `https://github.com/orgs/Mozilla-Data-Collective/repositories?type=all`
- `https://github.com/Mozilla-Data-Collective/datacollective-python/commits/main.atom`
- `https://github.com/Mozilla-Data-Collective/datacollective-python/tree/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4`
- `https://github.com/Mozilla-Data-Collective/datacollective-python/tree/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/docs`
- `https://github.com/Mozilla-Data-Collective/datacollective-python/tree/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/src/datacollective`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/README.md`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/docs/index.md`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/docs/upload.md`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/docs/api.md`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/CONTRIBUTING.md`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/src/datacollective/api_utils.py`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/src/datacollective/datasets.py`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/src/datacollective/download.py`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/src/datacollective/errors.py`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/src/datacollective/submissions.py`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/src/datacollective/upload.py`
- `https://github.com/search?type=repositories&q=%22lost+in+transcription%22`
- `https://github.com/drivendataorg/lost-in-transcription-runtime/commits/main.atom`
- `https://raw.githubusercontent.com/drivendataorg/lost-in-transcription-runtime/3087188064b854edb72115fa8602d5b392bd7d44/README.md`
- `https://raw.githubusercontent.com/drivendataorg/lost-in-transcription-runtime/3087188064b854edb72115fa8602d5b392bd7d44/LICENSE`
- `https://github.com/balaguhanesh/lost-in-transcription/commits/master.atom`
- `https://raw.githubusercontent.com/balaguhanesh/lost-in-transcription/82c0e3f34ca820b11e0cf6d4a9066dca9f13df33/README.md`
- `https://raw.githubusercontent.com/balaguhanesh/lost-in-transcription/master/README.md`
- `https://raw.githubusercontent.com/vitthal-bhandari/lost-in-transcription/master/README.md`
- `https://raw.githubusercontent.com/thememorylab/lost-in-transcription/main/README.md`
- `https://raw.githubusercontent.com/d1scrd/lost-in-transcription/main/README.md`
- `https://raw.githubusercontent.com/PryceNotHouck/Lost_In_Transcription/master/README.md`
- `https://raw.githubusercontent.com/06-aakash-06/lost-in-transcription/main/README.md`
- `https://github.com/OpenTermsArchive`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/OpenTermsArchive/contrib-declarations/tree/main/declarations`
- `https://raw.githubusercontent.com/OpenTermsArchive/contrib-declarations/main/declarations/Mozilla.json`
- `https://raw.githubusercontent.com/OpenTermsArchive/contrib-declarations/main/declarations/Firefox.json`
- `https://raw.githubusercontent.com/OpenTermsArchive/{contrib,france,pga,genai-contrib,genai-eu,user-rights,dating,sante-numerique-france}-declarations/main/declarations/<name>.json for the 19 names in 'searched' (all 404 except the two above)`
- `https://github.com/tosdr/tosdr-snapshots`
- `https://github.com/tosdr/tosdr-snapshots/commits/main.atom`
- `https://github.com/tosdr/tosdr-snapshots/tree/b44ae1b6b15427ecceda8df0311e73e111a087e8/Mozilla`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/<name>/<Terms of Service|Terms of Use|Terms and Conditions|Acceptable Use Policy|Legal Information|Imprint|Privacy Policy>.html for the names in 'searched' (all 404)`
- `VERIFIER:`
- `https://github.com/mozilla/legal-docs/commits/main.atom (curl answered 403 from the session proxy; read with WebFetch)`
- `https://github.com/mozilla/legal-docs/tree/5a23d5fa67719f0b3fdf6f5a751fe285e43f9e43`
- `https://github.com/orgs/Mozilla-Data-Collective/repositories?type=all (curl 403 from the session proxy; read with WebFetch)`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/LICENSE`
- `https://raw.githubusercontent.com/Mozilla-Data-Collective/datacollective-python/de2ea44c3ed1f0ec40ca937270f2e8e809977ce4/pyproject.toml`
- `https://raw.githubusercontent.com/drivendataorg/lost-in-transcription-runtime/3087188064b854edb72115fa8602d5b392bd7d44/CHANGELOG.md`
- `https://raw.githubusercontent.com/drivendataorg/lost-in-transcription-runtime/3087188064b854edb72115fa8602d5b392bd7d44/MAINTAINERS.md`
- `https://github.com/drivendataorg/lost-in-transcription-runtime/tree/3087188064b854edb72115fa8602d5b392bd7d44`
- `https://raw.githubusercontent.com/OpenTermsArchive/{demo,user-rights,genai-contrib,genai-eu,contrib,pga,dsa-reports,sante-numerique-france,kenya,dating,france,sandbox,p2b-compliance,france-elections,india,cote-d-ivoire,france-elections-experiment}-declarations/main/declarations/{DrivenData,Mozilla Data Collective,Mozilla,Codabench,Kaggle}.json (all 404 except contrib Mozilla.json, 200)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/Medium/Terms%20of%20Service.html (control, 200)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{DrivenData,Driven Data,Mozilla Data Collective,Mozilla Foundation,Mozilla,Firefox,mozilladatacollective.com,drivendata.org}/{Terms of Service,Terms of Use,Terms and Conditions,Privacy Policy,Acceptable Use Policy,Imprint,Legal Information}.html (all 404)`

</details>

<details><summary><code>neural-interfaces26.github.io</code>: 31 entries</summary>

- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md`
- `https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `https://github.com/github/docs (git ls-remote)`
- `https://github.com/neural-interfaces26/neural-interfaces26.github.io (git ls-remote, blobless git clone)`
- `https://raw.githubusercontent.com/neural-interfaces26/neural-interfaces26.github.io/2d04191750a8e0b62f0b848f4a1a0bfca78e5e18/index.html`
- `https://raw.githubusercontent.com/neural-interfaces26/neural-interfaces26.github.io/2d04191750a8e0b62f0b848f4a1a0bfca78e5e18/rules.html`
- `https://raw.githubusercontent.com/neural-interfaces26/neural-interfaces26.github.io/2d04191750a8e0b62f0b848f4a1a0bfca78e5e18/robots.txt`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/privacy-policies/github-general-privacy-statement.md`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-doxxing-and-invasion-of-privacy.md`
- `verifier: https://github.com/github/docs (git ls-remote refs/heads/main = 2bd66de8cea336061c9ea060c9b37385136e6ab3 on 2026-10-05)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `verifier: https://github.com/neural-interfaces26/neural-interfaces26.github.io (git ls-remote, blobless git clone, git grep fetching text blobs)`
- `verifier: https://raw.githubusercontent.com/neural-interfaces26/neural-interfaces26.github.io/2d04191750a8e0b62f0b848f4a1a0bfca78e5e18/index.html`
- `verifier: https://raw.githubusercontent.com/neural-interfaces26/neural-interfaces26.github.io/2d04191750a8e0b62f0b848f4a1a0bfca78e5e18/rules.html`
- `verifier: https://raw.githubusercontent.com/neural-interfaces26/neural-interfaces26.github.io/2d04191750a8e0b62f0b848f4a1a0bfca78e5e18/robots.txt`
- `verifier: https://raw.githubusercontent.com/neural-interfaces26/neural-interfaces26.github.io/2d04191750a8e0b62f0b848f4a1a0bfca78e5e18/README.md`
- `verifier: https://raw.githubusercontent.com/neural-interfaces26/neural-interfaces26.github.io/2d04191750a8e0b62f0b848f4a1a0bfca78e5e18/ethics.html`
- `verifier: https://raw.githubusercontent.com/neural-interfaces26/neural-interfaces26.github.io/2d04191750a8e0b62f0b848f4a1a0bfca78e5e18/.github/workflows/update-leaderboard.yml`

</details>

<details><summary><code>openreview.net</code>: 33 entries</summary>

- `https://raw.githubusercontent.com/openreview/openreview-web/master/README.md`
- `https://github.com/openreview/openreview-web/commits/master.atom`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/legal/terms/page.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/legal/terms/page.jsx`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/legal/terms/page.tsx`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/pages/legal/terms.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/legal/page.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/legal/terms/Terms.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/legal/privacy/page.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/components/Footer.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/Footer.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/public/robots.txt`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/robots.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/robots.txt`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/README.md`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/layout.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/next.config.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/.env.example`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/{LICENSE,LICENSE.md,LICENSE.txt,LICENSE-CODE}`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/forum/page.js`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of 18 *-declarations repos>/main/declarations/{OpenReview,Openreview,OpenReview.net}.json`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of 18 *-declarations repos>/main/{README.md,package.json}`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{OpenReview,Openreview,openreview,OpenReview.net,openreview.net}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy}.html`
- `https://github.com/tosdr/tosdr-snapshots/tree/main/OpenReview`
- `VERIFIER (2026-10-05):`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/challenge/page.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/app/challenge/Challenge.js`
- `https://raw.githubusercontent.com/openreview/openreview-web/ed830e1aeeb91ca2606c1f905df2e1e18f150b0e/LICENSE.md`
- `https://raw.githubusercontent.com/openreview/openreview-web/master/app/legal/terms/page.js`
- `https://github.com/openreview/openreview-web/commits/master/app/legal/terms/page.js.atom`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of the 18 *-declarations repos>/main/declarations/{OpenReview,Openreview,OpenReview.net}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{OpenReview,Openreview,openreview,OpenReview.net,openreview.net}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy,Acceptable%20Use%20Policy}.html`

</details>

<details><summary><code>opensky-network.org</code>: 21 entries</summary>

- `https://github.com/openskynetwork`
- `https://github.com/orgs/openskynetwork/repositories?type=all`
- `https://github.com/openskynetwork/opensky-api/commits/master.atom`
- `https://raw.githubusercontent.com/openskynetwork/opensky-api/c4af9c9e5aba25fc6ee0852b54a91b8a7c02f76b/README.md`
- `https://raw.githubusercontent.com/openskynetwork/opensky-api/c4af9c9e5aba25fc6ee0852b54a91b8a7c02f76b/docs/free/index.rst`
- `https://raw.githubusercontent.com/openskynetwork/opensky-api/c4af9c9e5aba25fc6ee0852b54a91b8a7c02f76b/docs/index.rst`
- `https://raw.githubusercontent.com/openskynetwork/opensky-api/c4af9c9e5aba25fc6ee0852b54a91b8a7c02f76b/LICENSE`
- `https://raw.githubusercontent.com/openskynetwork/opensky-api/c4af9c9e5aba25fc6ee0852b54a91b8a7c02f76b/LICENSE.txt`
- `https://raw.githubusercontent.com/openskynetwork/opensky-api/c4af9c9e5aba25fc6ee0852b54a91b8a7c02f76b/python/LICENSE`
- `https://raw.githubusercontent.com/openskynetwork/osky-sample/master/README.md`
- `https://raw.githubusercontent.com/openskynetwork/aircraft-localization/master/README.md`
- `https://raw.githubusercontent.com/openskynetwork/publications/master/README.md`
- `https://raw.githubusercontent.com/openskynetwork/crowdsourcing-survey/master/README.md`
- `https://github.com/search?type=repositories&q=opensky+network+terms+of+use`
- `https://raw.githubusercontent.com/OpenTermsArchive/<8 declarations repos>/main/declarations/{OpenSky Network,OpenSky}.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{OpenSky Network,OpenSky,opensky,Opensky Network,opensky-network.org}/<document>.html (404)`
- `VERIFIER:`
- `https://github.com/openskynetwork/opensky-api/tree/c4af9c9e5aba25fc6ee0852b54a91b8a7c02f76b/docs`
- `https://github.com/search?type=repositories&q=%22opensky-network.org%2Fabout%2Fterms-of-use%22+in%3Areadme`
- `https://raw.githubusercontent.com/OpenTermsArchive/<17 declarations repos>/main/declarations/{OpenSky Network,OpenSky}.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{OpenSky Network,OpenSky,opensky-network.org}/<5-7 document names>.html (404)`

</details>

<details><summary><code>pasteurlabs.ai</code>: 15 entries</summary>

- `https://github.com/pasteurlabs`
- `https://raw.githubusercontent.com/pasteurlabs/{tesseract-hackathon-template,tesseract-core,.github,mosaic}/{main,master}/{README.md,LICENSE,profile/README.md,CODE_OF_CONDUCT.md,CONTRIBUTING.md,docs/content/index.md}`
- `https://raw.githubusercontent.com/pasteurlabs/tesseract-core/main/{docs/conf.py,docs/source/conf.py,docs/content/conf.py}`
- `https://github.com/search?type=repositories&q=tesseract+hackathon+2026`
- `https://github.com/pasteurlabs/tesseract-core/commits/main.atom`
- `https://raw.githubusercontent.com/pasteurlabs/tesseract-core/1a515acbdb9a5097d21e9cfcf31ef514aff78a1e/docs/conf.py`
- `https://raw.githubusercontent.com/pasteurlabs/tesseract-core/1a515acbdb9a5097d21e9cfcf31ef514aff78a1e/{LICENSE,LICENSE.md,LICENSE.txt,LICENSE-CODE}`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of 18 *-declarations repos>/main/declarations/{Pasteur%20Labs,PasteurLabs,Pasteur}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{Pasteur%20Labs,pasteurlabs.ai}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy}.html`
- `VERIFIER (2026-10-05):`
- `https://github.com/orgs/pasteurlabs/repositories?type=all`
- `https://raw.githubusercontent.com/pasteurlabs/{pasteur-oss-cla,.github,tesseract-core,tesseract-hackathon-template,mosaic,tesseract-jax,tesseract-torch,tesseract-streamlit,cookiecutter-tesseract,shapeopt-eurips-2025}/{main,master}/{README.md,profile/README.md,CLA.md,cla.md,LICENSE,CODE_OF_CONDUCT.md,CONTRIBUTING.md,SECURITY.md}`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of the 18 *-declarations repos>/main/declarations/{Pasteur%20Labs,PasteurLabs,Pasteurlabs,Pasteur}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{Pasteur%20Labs,PasteurLabs,pasteurlabs.ai}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy,Acceptable%20Use%20Policy}.html`

</details>

<details><summary><code>realpdecompetition.github.io</code>: 25 entries</summary>

- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md`
- `https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `https://github.com/github/docs (git ls-remote)`
- `https://github.com/realpdecompetition/realpdecompetition.github.io (git ls-remote, blobless git clone)`
- `https://github.com/realpdecompetition/realpdecompetition.github.io/deployments (WebFetch; 404 anonymous)`
- `https://raw.githubusercontent.com/realpdecompetition/realpdecompetition.github.io/c78fc394c7d0c5cd33077d8b11ae2290001599cc/index.html`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/privacy-policies/github-general-privacy-statement.md`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-doxxing-and-invasion-of-privacy.md`
- `verifier: https://github.com/github/docs (git ls-remote refs/heads/main = 2bd66de8cea336061c9ea060c9b37385136e6ab3 on 2026-10-05)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `verifier: https://github.com/realpdecompetition/realpdecompetition.github.io (git ls-remote, blobless git clone, git grep fetching text blobs)`
- `verifier: https://raw.githubusercontent.com/realpdecompetition/realpdecompetition.github.io/c78fc394c7d0c5cd33077d8b11ae2290001599cc/index.html`

</details>

<details><summary><code>robosyn-bench.net</code>: 28 entries</summary>

- `https://raw.githubusercontent.com/EDEM-AI/RoboSynChallenge/main/README.md`
- `https://raw.githubusercontent.com/EDEM-AI/RoboSynChallenge/master/README.md`
- `https://raw.githubusercontent.com/EDEM-AI/RoboSynChallenge/main/{LICENSE,LICENSE.md,LICENSE.txt,LICENSE-CODE}`
- `https://raw.githubusercontent.com/EDEM-AI/robosynchallenge.github.io/{main,master,gh-pages}/{CNAME,README.md,index.html,LICENSE,public/CNAME}`
- `https://github.com/EDEM-AI/robosynchallenge.github.io`
- `https://raw.githubusercontent.com/EDEM-AI/robosynchallenge.github.io/main/{render.yaml,app.py,.env.example,bootstrap.sh,templates/base.html}`
- `https://github.com/EDEM-AI/robosynchallenge.github.io/branches/all`
- `https://github.com/EDEM-AI/robosynchallenge.github.io/tree/main/templates`
- `https://raw.githubusercontent.com/EDEM-AI/robosynchallenge.github.io/page/{CNAME,README.md,index.html,LICENSE,public/CNAME,package.json,vite.config.js,vite.config.ts}`
- `https://github.com/EDEM-AI/robosynchallenge.github.io/commits/page.atom`
- `https://github.com/EDEM-AI/robosynchallenge.github.io/tree/page`
- `https://raw.githubusercontent.com/EDEM-AI/robosynchallenge.github.io/0cf323c12054c0307478c2ffd15c6b94ecaadd06/{CNAME,index.html,.nojekyll,404.html,robots.txt,LICENSE,static/config.js}`
- `https://raw.githubusercontent.com/EDEM-AI/robosynchallenge.github.io/0cf323c12054c0307478c2ffd15c6b94ecaadd06/{LICENSE.md,LICENSE.txt,LICENSE-CODE}`
- `https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/ca0be3563766814ea73bbaedf2d3e2e7ad96f883/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/ca0be3563766814ea73bbaedf2d3e2e7ad96f883/{LICENSE,LICENSE.md,LICENSE.txt,LICENSE-CODE}`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of 18 *-declarations repos>/main/declarations/{RoboSyn,RoboSyn%20Bench,EDEM%20AI}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{RoboSyn,robosyn-bench.net}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy}.html`
- `VERIFIER (2026-10-05):`
- `https://raw.githubusercontent.com/github/docs/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/ca0be3563766814ea73bbaedf2d3e2e7ad96f883/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md`
- `https://raw.githubusercontent.com/EDEM-AI/robosynchallenge.github.io/0cf323c12054c0307478c2ffd15c6b94ecaadd06/{CNAME,index.html,.nojekyll,robots.txt,LICENSE,404.html,static/config.js,static/js/pages-app.js}`
- `https://raw.githubusercontent.com/EDEM-AI/robosynchallenge.github.io/main/{render.yaml,app.py,README.md,CNAME,.env.example,bootstrap.sh,templates/base.html}`
- `https://github.com/EDEM-AI/robosynchallenge.github.io/deployments`
- `https://github.com/EDEM-AI/robosynchallenge.github.io/actions`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of the 18 *-declarations repos>/main/declarations/{RoboSyn,RoboSynChallenge,RoboSyn%20Bench}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{RoboSyn,RoboSynChallenge,robosyn-bench.net}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy,Acceptable%20Use%20Policy}.html`

</details>

<details><summary><code>roco-spring.github.io</code>: 30 entries</summary>

- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md`
- `https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `https://github.com/github/docs (git ls-remote)`
- `https://github.com/roco-spring/roco-spring.github.io (git ls-remote, blobless git clone)`
- `https://raw.githubusercontent.com/roco-spring/roco-spring.github.io/fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad/index.html`
- `https://raw.githubusercontent.com/roco-spring/roco-spring.github.io/fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad/rules-faq.html`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/privacy-policies/github-general-privacy-statement.md`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-doxxing-and-invasion-of-privacy.md`
- `verifier: https://github.com/github/docs (git ls-remote refs/heads/main = 2bd66de8cea336061c9ea060c9b37385136e6ab3 on 2026-10-05)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `verifier: https://github.com/roco-spring/roco-spring.github.io (git ls-remote, blobless git clone, git grep fetching text blobs)`
- `verifier: https://raw.githubusercontent.com/roco-spring/roco-spring.github.io/fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad/index.html`
- `verifier: https://raw.githubusercontent.com/roco-spring/roco-spring.github.io/fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad/rules-faq.html`
- `verifier: https://raw.githubusercontent.com/roco-spring/roco-spring.github.io/fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad/README.md`
- `verifier: https://raw.githubusercontent.com/roco-spring/roco-spring.github.io/fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad/img/ASSET_SOURCES.md`
- `verifier: https://raw.githubusercontent.com/roco-spring/roco-spring.github.io/fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad/firebase.json`
- `verifier: https://raw.githubusercontent.com/roco-spring/roco-spring.github.io/fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad/.github/workflows/ci.yml`

</details>

<details><summary><code>situatedevals.org</code>: 23 entries</summary>

- `https://github.com/search?type=repositories&q=situatedevals`
- `https://github.com/search?type=repositories&q=simulacrabench`
- `https://github.com/SituatedEvals`
- `https://github.com/SituatedEvals/website`
- `https://github.com/SituatedEvals/website/commits/main.atom`
- `https://raw.githubusercontent.com/SituatedEvals/website/c3699f6b2c6669eb289d15da490f459178fab6f7/{CNAME,robots.txt,security.txt,sitemap.xml,index.html,main.js,.nojekyll}`
- `https://raw.githubusercontent.com/SituatedEvals/website/c3699f6b2c6669eb289d15da490f459178fab6f7/{LICENSE,LICENSE.md,LICENSE.txt,LICENSE-CODE}`
- `https://github.com/SituatedEvals/website-mirror`
- `https://github.com/SituatedEvals/website-mirror/commits/main.atom`
- `https://raw.githubusercontent.com/SituatedEvals/website-mirror/0852d2acba02fef6c9556f027eebaa1e68fb6cc8/{CNAME,index.html,main.js,.nojekyll,robots.txt}`
- `https://raw.githubusercontent.com/SituatedEvals/public/{main,master}/{README.md,LICENSE}`
- `https://github.com/SituatedEvals/public/commits/main.atom`
- `https://raw.githubusercontent.com/SituatedEvals/public/0d2332d8ae19a8ce171031142bdc97134910e7ec/README.md`
- `https://raw.githubusercontent.com/SituatedEvals/public/0d2332d8ae19a8ce171031142bdc97134910e7ec/{LICENSE,LICENSE.md,LICENSE.txt,LICENSE-CODE}`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of 18 *-declarations repos>/main/declarations/{Situated%20Evals,SituatedEvals}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{Situated%20Evals,situatedevals.org}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy}.html`
- `VERIFIER (2026-10-05):`
- `https://raw.githubusercontent.com/SituatedEvals/website/c3699f6b2c6669eb289d15da490f459178fab6f7/{CNAME,security.txt,robots.txt,sitemap.xml,index.html,main.js}`
- `https://raw.githubusercontent.com/SituatedEvals/website-mirror/0852d2acba02fef6c9556f027eebaa1e68fb6cc8/{CNAME,index.html,main.js}`
- `https://raw.githubusercontent.com/SituatedEvals/{SituatedEvals.github.io,situatedevals.github.io,situatedevals.org}/{main,master,gh-pages}/CNAME`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of the 18 *-declarations repos>/main/declarations/{SituatedEvals,Situated%20Evals,SimulacraBench,Simulacra%20Bench}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{SituatedEvals,Situated%20Evals,situatedevals.org,SimulacraBench}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy,Acceptable%20Use%20Policy}.html`

</details>

<details><summary><code>solafune.com</code>: 14 entries</summary>

- `https://github.com/search?type=repositories&q=solafune (WebFetch)`
- `https://github.com/search?type=repositories&q=solafune+terms (WebFetch)`
- `https://github.com/Solafune-Inc (WebFetch)`
- `https://github.com/Solafune-Inc/{solafune-tools,FieldAreaSegmentation,solafune_country_basemaps,TRASHDETECT,orbit-meeting-room-booking,OC-cost} (git clone)`
- `https://github.com/{motokimura/solafune_deforestation_baseline,motokimura/solafune_vehicle_detection_solution,upura/solafune-light,wykswr/solafune,shionsuio/solafune-nowcast,hariprasath-v/Solafune_Finding_Mining_Sites,ALOK158/Solafune_Construction-Cost-Predictor,roadto93ds/solafuneSR} (git clone)`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch) and the 18 *-declarations repos (git clone)`
- `https://raw.githubusercontent.com/OpenTermsArchive/{6 repos}/main/declarations/Solafune.json (404)`
- `https://github.com/tosdr/tosdr-snapshots (git clone, blobless)`
- `https://github.com/pde/tosback2 (git clone, blobless)`
- `verifier: https://github.com/Solafune-Inc (WebFetch, 10 repos)`
- `verifier: git ls-remote https://github.com/Solafune-Inc/solafune-tools.git (HEAD ed4e739c23755fc8f27fae5f011781e88007371d)`
- `verifier: https://github.com/Solafune-Inc/{solafune-tools,FieldAreaSegmentation,solafune_country_basemaps,TRASHDETECT,orbit-meeting-room-booking,OC-cost} (sparse clones at ed4e739, d5f22fa, c288545, 0f4b3c5, 2e37852, 5446a8e)`
- `verifier: https://raw.githubusercontent.com/Solafune-Inc/solafune-tools/ed4e739c23755fc8f27fae5f011781e88007371d/solafune_tools/community_tools/README.md (curl, 200)`
- `verifier: OTA 18 declarations repos (git clone, 0 hits), tosdr/tosdr-snapshots@b44ae1b6 (treeless clone, root listing), pde/tosback2@a5a27f9 (treeless clone, rules listing)`

</details>

<details><summary><code>sophelio.io</code>: 17 entries</summary>

- `https://github.com/search?type=repositories&q=sophelio`
- `https://github.com/search?type=repositories&q=fusion+equilibrium+challenge`
- `https://github.com/Sophelio`
- `https://raw.githubusercontent.com/Sophelio/fusion-equilibrium-challenge-starter/{main,master}/README.md`
- `https://raw.githubusercontent.com/Sophelio/{blank_stage,MGKDB-Web,dFL}/{main,master}/README.md`
- `https://raw.githubusercontent.com/Sophelio/blank_stage/{main,master}/CNAME`
- `https://github.com/Sophelio/fusion-equilibrium-challenge-starter/commits/main.atom`
- `https://raw.githubusercontent.com/Sophelio/fusion-equilibrium-challenge-starter/5b467988d2e5f28e20be490a926d0a71649de28d/README.md`
- `https://raw.githubusercontent.com/Sophelio/fusion-equilibrium-challenge-starter/5b467988d2e5f28e20be490a926d0a71649de28d/{LICENSE,LICENSE.md,LICENSE.txt,LICENSE-CODE}`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of 18 *-declarations repos>/main/declarations/Sophelio.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{Sophelio,sophelio.io}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy}.html`
- `VERIFIER (2026-10-05):`
- `https://github.com/orgs/Sophelio/repositories?type=all`
- `https://raw.githubusercontent.com/Sophelio/{Paper_Data,MGKDB_paper_package,MGKDB,keras2c,dFL,blank_stage,DSNN,SEER,KAM,MGKDB-Web}/{main,master}/{README.md,CNAME,LICENSE}`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of the 18 *-declarations repos>/main/declarations/Sophelio.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{Sophelio,sophelio.io}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy,Acceptable%20Use%20Policy}.html`

</details>

<details><summary><code>stanford.edu</code>: 44 entries</summary>

- `https://github.com/search?type=repositories&q=quantiphy`
- `https://github.com/Paulineli/QuantiPhy`
- `https://github.com/Paulineli/QuantiPhy/commits/main.atom`
- `https://raw.githubusercontent.com/Paulineli/QuantiPhy/4f9323c9ca9479fc673749ae7d2a82729fef6e85/README.md`
- `https://github.com/search?type=repositories&q=quantiphy.stanford.edu`
- `https://github.com/search?type=repositories&q=aimslab+stanford`
- `https://github.com/search?type=users&q=aimslab`
- `https://github.com/aims-foundations`
- `https://github.com/orgs/aims-foundations/repositories?type=all`
- `https://github.com/aims-foundations/aims`
- `https://raw.githubusercontent.com/aims-foundations/aims/main/README.md`
- `https://raw.githubusercontent.com/aims-foundations/paiec_baseline/main/README.md`
- `https://github.com/SU-SWS`
- `https://github.com/orgs/SU-SWS/repositories?q=home&type=all`
- `https://github.com/SU-SWS/decanter`
- `https://github.com/SU-SWS/decanter/commits/main.atom`
- `https://raw.githubusercontent.com/SU-SWS/decanter/b6bd909ef6094eed7bb5fac22b7417984960c546/TERMSOFUSE.txt`
- `https://github.com/SU-SWS/decanter/branches/all`
- `https://github.com/SU-SWS/decanter/tree/v7`
- `https://raw.githubusercontent.com/SU-SWS/decanter/v7/core/src/templates/components/global-footer/global-footer.twig`
- `https://raw.githubusercontent.com/SU-SWS/decanter/v7/core/src/templates/components/global-footer/global-footer.html`
- `https://raw.githubusercontent.com/SU-SWS/decanter/v7/src/templates/components/global-footer/global-footer.twig`
- `https://raw.githubusercontent.com/SU-SWS/decanter/v7/core/src/templates/components/global-footer/global-footer.json`
- `https://raw.githubusercontent.com/SU-SWS/decanter/v6/core/src/templates/components/global-footer/global-footer.twig`
- `https://raw.githubusercontent.com/SU-SWS/decanter/v6/core/src/templates/components/global-footer/global-footer.json`
- `https://raw.githubusercontent.com/SU-SWS/decanter/v5/core/src/templates/components/global-footer/global-footer.twig`
- `https://raw.githubusercontent.com/SU-SWS/decanter/v5/core/src/templates/components/global-footer/global-footer.json`
- `https://github.com/SU-SWS/decanter/commits/v6.atom`
- `https://raw.githubusercontent.com/SU-SWS/decanter/63cda9df94710d34835570372b01a2d306f528d8/core/src/templates/components/global-footer/global-footer.twig`
- `https://raw.githubusercontent.com/SU-SWS/decanter/63cda9df94710d34835570372b01a2d306f528d8/license.md`
- `https://github.com/search?type=repositories&q=%22stanford.edu%2Fsite%2Fterms%22`
- `https://raw.githubusercontent.com/OpenTermsArchive/<8 declarations repos>/main/declarations/{Stanford,Stanford University}.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{Stanford,Stanford University,stanford,stanford.edu}/<document>.html (404)`
- `VERIFIER:`
- `https://raw.githubusercontent.com/SU-SWS/decanter/b6bd909ef6094eed7bb5fac22b7417984960c546/license.md`
- `https://raw.githubusercontent.com/SU-SWS/decanter/b6bd909ef6094eed7bb5fac22b7417984960c546/LICENSE (404)`
- `https://raw.githubusercontent.com/SU-SWS/decanter/b6bd909ef6094eed7bb5fac22b7417984960c546/LICENSE.md (404)`
- `https://raw.githubusercontent.com/SU-SWS/decanter/b6bd909ef6094eed7bb5fac22b7417984960c546/license.txt (404)`
- `https://github.com/aims-foundations/aims/commits/main.atom`
- `https://raw.githubusercontent.com/aims-foundations/aims/0118277faed7602aef8493094c0ca0797078a62a/README.md`
- `https://github.com/aims-foundations/paiec_baseline/commits/main.atom`
- `https://raw.githubusercontent.com/aims-foundations/paiec_baseline/82d330ddcdb16016a3ae9e048db7e588ba2c6a39/README.md`
- `https://raw.githubusercontent.com/OpenTermsArchive/<17 declarations repos>/main/declarations/{Stanford,Stanford University}.json (404)`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/b44ae1b6b15427ecceda8df0311e73e111a087e8/{Stanford,Stanford University,stanford.edu}/<5-7 document names>.html (404)`

</details>

<details><summary><code>szczurek-lab.github.io</code>: 34 entries</summary>

- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md`
- `https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `https://github.com/github/docs (git ls-remote)`
- `https://github.com/szczurek-lab/amp-challenge-website (git ls-remote, blobless git clone)`
- `https://github.com/szczurek-lab/szczurek-lab.github.io (git ls-remote; credentials requested, absent or private)`
- `https://raw.githubusercontent.com/szczurek-lab/amp-challenge-website/bd207968659a2072bc53037eda8f855c4cb6ccfd/index.html`
- `https://raw.githubusercontent.com/szczurek-lab/amp-challenge-website/bd207968659a2072bc53037eda8f855c4cb6ccfd/src/components/SubmissionSection.tsx`
- `https://raw.githubusercontent.com/szczurek-lab/amp-challenge-website/bd207968659a2072bc53037eda8f855c4cb6ccfd/src/components/Footer.tsx`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/privacy-policies/github-general-privacy-statement.md`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-doxxing-and-invasion-of-privacy.md`
- `verifier: https://github.com/github/docs (git ls-remote refs/heads/main = 2bd66de8cea336061c9ea060c9b37385136e6ab3 on 2026-10-05)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `verifier: https://github.com/szczurek-lab/amp-challenge-website (git ls-remote, blobless git clone, git grep fetching text blobs)`
- `verifier: https://github.com/szczurek-lab/szczurek-lab.github.io (git ls-remote; credentials requested, absent or private)`
- `verifier: https://raw.githubusercontent.com/szczurek-lab/amp-challenge-website/bd207968659a2072bc53037eda8f855c4cb6ccfd/index.html`
- `verifier: https://raw.githubusercontent.com/szczurek-lab/amp-challenge-website/bd207968659a2072bc53037eda8f855c4cb6ccfd/src/components/Footer.tsx`
- `verifier: https://raw.githubusercontent.com/szczurek-lab/amp-challenge-website/bd207968659a2072bc53037eda8f855c4cb6ccfd/src/components/SubmissionSection.tsx`
- `verifier: https://raw.githubusercontent.com/szczurek-lab/amp-challenge-website/bd207968659a2072bc53037eda8f855c4cb6ccfd/public/robots.txt`
- `verifier: https://raw.githubusercontent.com/szczurek-lab/amp-challenge-website/bd207968659a2072bc53037eda8f855c4cb6ccfd/vite.config.ts`
- `verifier: https://raw.githubusercontent.com/szczurek-lab/amp-challenge-website/bd207968659a2072bc53037eda8f855c4cb6ccfd/README.md`
- `verifier: https://raw.githubusercontent.com/szczurek-lab/amp-challenge-website/bd207968659a2072bc53037eda8f855c4cb6ccfd/.github/workflows/deploy.yml`

</details>

<details><summary><code>theemailgame.com</code>: 15 entries</summary>

- `https://github.com/search?type=repositories&q=theemailgame`
- `https://github.com/search?type=repositories&q=email+game+llm+agents+signed+emails`
- `https://raw.githubusercontent.com/{Eman-Yousaf/signed-email-agent,khadijaejaz146/TheEmailGame,zaccwang/theemailgame,Sar2580P/theemailgame,JaneshKapoor/theemailgame,venvennnn/theemailgame,anhsirksai/TheEmailGame}/{main,master}/README.md`
- `https://github.com/RyanAJensen/theemailgame`
- `https://github.com/RyanAJensen?tab=repositories`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of 18 *-declarations repos>/main/declarations/{The%20Email%20Game,TheEmailGame,Email%20Game}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{The%20Email%20Game,theemailgame.com}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy}.html`
- `VERIFIER (2026-10-05):`
- `https://github.com/search?type=repositories&q=%22email+game%22+signed+emails`
- `https://raw.githubusercontent.com/{zaccwang/theemailgame,Sar2580P/theemailgame,JaneshKapoor/theemailgame,venvennnn/theemailgame,khadijaejaz146/TheEmailGame,anhsirksai/TheEmailGame,Eman-Yousaf/signed-email-agent}/{main,master}/README.md`
- `https://raw.githubusercontent.com/{JaneshKapoor/theemailgame,khadijaejaz146/TheEmailGame,anhsirksai/TheEmailGame,zaccwang/theemailgame}/main/{LICENSE,LICENSE.md,AGENTS.md,TERMS.md,RULES.md,CLAUDE.md}`
- `https://raw.githubusercontent.com/RyanAJensen/theemailgame/main/README.md`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of the 18 *-declarations repos>/main/declarations/{The%20Email%20Game,TheEmailGame,Email%20Game}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{The%20Email%20Game,TheEmailGame,theemailgame.com}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy,Acceptable%20Use%20Policy}.html`

</details>

<details><summary><code>thinkonward.com</code>: 15 entries</summary>

- `https://github.com/search?type=repositories&q=thinkonward (WebFetch)`
- `https://github.com/search?type=repositories&q=thinkonward&p=2 (WebFetch)`
- `https://github.com/thinkonward (WebFetch)`
- `https://github.com/thinkonward/{challenges,geophysical-foundation-model,section-seeker,synthoseis,lyra_graphtool} (git clone)`
- `the 16 community repos named in 'searched' (git clone https://github.com/<owner>/<repo>)`
- `https://raw.githubusercontent.com/thinkonward/challenges/a12ae1e4c179890a68cccffd088eece95e42a5be/examples/final-submission/README.md`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch) and the 18 *-declarations repos (git clone)`
- `https://raw.githubusercontent.com/OpenTermsArchive/{6 repos}/main/declarations/{Onward,ThinkOnward}.json (404)`
- `https://github.com/tosdr/tosdr-snapshots (git clone, blobless)`
- `https://github.com/pde/tosback2 (git clone, blobless)`
- `verifier: https://github.com/thinkonward (WebFetch, 5 repos)`
- `verifier: git ls-remote https://github.com/thinkonward/challenges.git (HEAD a12ae1e4c179890a68cccffd088eece95e42a5be)`
- `verifier: https://github.com/thinkonward/{challenges,geophysical-foundation-model,section-seeker,lyra_graphtool,synthoseis} (sparse clones at a12ae1e, d97065b, c0d123f, 7e88096, 1b9d25c)`
- `verifier: https://raw.githubusercontent.com/thinkonward/challenges/a12ae1e4c179890a68cccffd088eece95e42a5be/examples/final-submission/README.md (curl, 200)`
- `verifier: OTA 18 declarations repos (git clone, 0 hits), tosdr/tosdr-snapshots@b44ae1b6 (treeless clone, root listing), pde/tosback2@a5a27f9 (treeless clone, rules listing)`

</details>

<details><summary><code>virtualembryo.ai</code>: 28 entries</summary>

- `https://github.com/search?type=repositories&q=virtualembryo`
- `https://github.com/search?type=repositories&q=virtual+embryo+challenge`
- `https://raw.githubusercontent.com/Scigantic/virtual-embryo-challenge-t1-baseline/{main,master}/README.md`
- `https://raw.githubusercontent.com/aristoteleo/veckit/{main,master}/README.md`
- `https://github.com/aristoteleo/virtualembryo`
- `https://github.com/nya-a-cat/virtual-embryo-cli`
- `https://raw.githubusercontent.com/{nya-a-cat/virtual-embryo-cli,wqty123/virtual-embryo-challenge-methods,cadentann/virtual-embryo-community-kit,i-habib/virtual-embryo-agent-harness-lab,tubager/vec-t2,random-guy-05/vec-bootstrap,random-guy-05/vec-slim,random-guy-05/vec-reprobox,Shashwat-srivastav/virtualembryo-data-gotchas,divyanshv2001/virtualembryo2026,FreddieWho/014_virtualEmbryo}/{main,master}/README.md`
- `https://github.com/cadentann/virtual-embryo-community-kit/commits/main.atom`
- `https://github.com/Scigantic/virtual-embryo-challenge-t1-baseline/commits/main.atom`
- `https://raw.githubusercontent.com/cadentann/virtual-embryo-community-kit/192314a3cd933b76055d3b2dec5cb3bb53dd945b/README.md`
- `https://raw.githubusercontent.com/cadentann/virtual-embryo-community-kit/192314a3cd933b76055d3b2dec5cb3bb53dd945b/{LICENSE,LICENSE.md,LICENSE.txt,LICENSE-CODE}`
- `https://raw.githubusercontent.com/Scigantic/virtual-embryo-challenge-t1-baseline/7ae0af4abd2c5bcbe7311bc266a99542095a5719/README.md`
- `https://raw.githubusercontent.com/Scigantic/virtual-embryo-challenge-t1-baseline/7ae0af4abd2c5bcbe7311bc266a99542095a5719/{LICENSE,LICENSE.md,LICENSE.txt,LICENSE-CODE}`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of 18 *-declarations repos>/main/declarations/{Virtual%20Embryo,VirtualEmbryo}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{Virtual%20Embryo,virtualembryo.ai}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy}.html`
- `VERIFIER (2026-10-05):`
- `https://github.com/search?type=repositories&q=virtual+embryo+challenge&p=2`
- `https://github.com/search?type=repositories&q=virtual+embryo+challenge&p=3`
- `https://raw.githubusercontent.com/{aristoteleo/veckit,tubager/vec-t2,wqty123/virtual-embryo-challenge-methods,nya-a-cat/virtual-embryo-cli,i-habib/virtual-embryo-agent-harness-lab,random-guy-05/vec-bootstrap,random-guy-05/vec-slim,random-guy-05/vec-reprobox,random-guy-05/vec-multilingual-starter,random-guy-05/vec-diff,random-guy-05/vec-metriclens,random-guy-05/vec-samplecheck,random-guy-05/vec-methodcard,random-guy-05/vec-envcheck,random-guy-05/vec-batchrank,random-guy-05/vec-profile,random-guy-05/vec-splitforge,random-guy-05/vec-spatialqc,random-guy-05/vec-runlog,bestdeeplearning-star/vec-evidence-check,gh-dv-openclaw/vec-submit-check,i-habib/external-data-catalog,i-habib/community-projects,wqty123/vec-scalecheck,xxx12e/vec-community-kit}/main/README.md`
- `https://github.com/gh-dv-openclaw/vec-submit-check/commits/main.atom`
- `https://raw.githubusercontent.com/gh-dv-openclaw/vec-submit-check/521cce39da33b84e36157d08ead607de5c2e6894/README.md`
- `https://raw.githubusercontent.com/gh-dv-openclaw/vec-submit-check/521cce39da33b84e36157d08ead607de5c2e6894/LICENSE`
- `https://raw.githubusercontent.com/xxx12e/vec-community-kit/main/{rules-watch/CHANGES.md,vec_rules_watch/README.md,vec_rules_watch/watchlist.json,watchlist.json,rules-watch/status.json,rules-watch/site-links.json,rules-watch/pages/terms.json}`
- `https://github.com/xxx12e/vec-community-kit/commits/main.atom`
- `https://raw.githubusercontent.com/xxx12e/vec-community-kit/2cf96621242f59523964c5fe698d61b2b6a73714/{rules-watch/pages/terms.json,rules-watch/CHANGES.md,vec_rules_watch/watchlist.json,vec_rules_watch/README.md,rules-watch/status.json,LICENSE}`
- `https://raw.githubusercontent.com/OpenTermsArchive/<each of the 18 *-declarations repos>/main/declarations/{Virtual%20Embryo,VirtualEmbryo,Virtual%20Embryo%20Challenge}.json`
- `https://raw.githubusercontent.com/tosdr/tosdr-snapshots/main/{Virtual%20Embryo,VirtualEmbryo,virtualembryo.ai}/{Terms%20of%20Service,Terms%20of%20Use,Privacy%20Policy,Acceptable%20Use%20Policy}.html`

</details>

<details><summary><code>wundernn.io</code>: 16 entries</summary>

- `https://github.com/search?type=repositories&q=wundernn (WebFetch)`
- `https://github.com/search?type=repositories&q=wunder+challenge+predictorium (WebFetch)`
- `https://github.com/search?type=repositories&q=wunderfund (WebFetch)`
- `https://github.com/wundernn (WebFetch, 404)`
- `the 14 community repos named in 'searched' (git clone https://github.com/<owner>/<repo>)`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all (WebFetch) and the 18 *-declarations repos (git clone)`
- `https://raw.githubusercontent.com/OpenTermsArchive/{6 repos}/main/declarations/Wundernn.json (404)`
- `https://github.com/tosdr/tosdr-snapshots (git clone, blobless)`
- `https://github.com/pde/tosback2 (git clone, blobless)`
- `verifier: https://github.com/wundernn (WebFetch, 404)`
- `verifier: https://github.com/wunderfund (WebFetch: organisation, no public repositories, no public members)`
- `verifier: https://github.com/{wundernn,wunderfund,Wunder-Fund,wunder-fund,wundernn-io} (curl: 403 from the egress proxy, not read)`
- `verifier: https://github.com/search?type=repositories&q=wundernn (WebFetch, 13 results)`
- `verifier: https://github.com/search?type=users&q=wunder (WebFetch)`
- `verifier: https://github.com/{1rvinn/wundernn,pravarmahajan/wundernn,aicheye/wundernn,Senhores-do-Tempo/wundernn_hackathon} (sparse clones at 90dbfec, 4099bb5, 3c49dd4, dd787ae)`
- `verifier: OTA 18 declarations repos (git clone, 0 hits), tosdr/tosdr-snapshots@b44ae1b6 (treeless clone, root listing), pde/tosback2@a5a27f9 (treeless clone, rules listing)`

</details>

<details><summary><code>xiuwenz2.github.io</code>: 30 entries</summary>

- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md`
- `https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md`
- `https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `https://github.com/github/docs (git ls-remote)`
- `https://github.com/xiuwenz2/SAPC2-website (git ls-remote, blobless git clone)`
- `https://github.com/xiuwenz2/SAPC2-website/deployments (WebFetch; 404 anonymous)`
- `https://github.com/xiuwenz2/xiuwenz2.github.io (git ls-remote; credentials requested, absent or private)`
- `https://raw.githubusercontent.com/xiuwenz2/SAPC2-website/9ef51e253cdd34ef4c58d360ec0e5cec011eb07d/index.md`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-of-service.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-disrupting-the-experience-of-other-users.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/github-terms/github-terms-for-additional-products-and-features.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/what-is-github-pages.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/pages/getting-started-with-github-pages/github-pages-limits.md (re-fetch)`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/privacy-policies/github-general-privacy-statement.md`
- `verifier: https://raw.githubusercontent.com/github/docs/2bd66de8cea336061c9ea060c9b37385136e6ab3/content/site-policy/acceptable-use-policies/github-doxxing-and-invasion-of-privacy.md`
- `verifier: https://github.com/github/docs (git ls-remote refs/heads/main = 2bd66de8cea336061c9ea060c9b37385136e6ab3 on 2026-10-05)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/acceptable-use-policies/github-acceptable-use-policies.md (WebFetch)`
- `verifier: https://github.com/github/docs/commits/main/content/site-policy/github-terms/github-terms-of-service.md (WebFetch)`
- `verifier: https://github.com/xiuwenz2/SAPC2-website (git ls-remote, blobless git clone, git grep fetching text blobs)`
- `verifier: https://github.com/xiuwenz2/xiuwenz2.github.io (git ls-remote; credentials requested, absent or private)`
- `verifier: https://raw.githubusercontent.com/xiuwenz2/SAPC2-website/9ef51e253cdd34ef4c58d360ec0e5cec011eb07d/index.md`
- `verifier: https://raw.githubusercontent.com/xiuwenz2/SAPC2-website/9ef51e253cdd34ef4c58d360ec0e5cec011eb07d/_config.yml`
- `verifier: https://raw.githubusercontent.com/xiuwenz2/SAPC2-website/9ef51e253cdd34ef4c58d360ec0e5cec011eb07d/_layouts/default.html`
- `verifier: https://raw.githubusercontent.com/xiuwenz2/SAPC2-website/9ef51e253cdd34ef4c58d360ec0e5cec011eb07d/_includes/footer.html`

</details>

<details><summary><code>zindi.africa</code>: 22 entries</summary>

- `https://github.com/search?q=zindi&type=users`
- `https://github.com/orgs/ZindiAfrica/repositories?type=all`
- `https://github.com/Zindi-Africa?tab=repositories`
- `git clone https://github.com/ZindiAfrica/<11 repos and .github>`
- `git clone https://github.com/Zindi-Africa/philips-mpeg-g-challenge`
- `git clone https://github.com/Zindi-Africa/AI-for-Equity-Challenge-Getting-Started-with-AWS-Resources`
- `https://raw.githubusercontent.com/ZindiAfrica/AI-for-Equity-Challenges-Getting-Started-with-AWS-Resources/12deb4058dd0cc5db6b0f366bc01ef8fc4456b7c/SUAOutsmartingOutbreaksChallenge.md`
- `https://github.com/search?q=zindi+api+package&type=repositories`
- `https://github.com/search?q=zindi+scraper&type=repositories`
- `https://github.com/search?q=zindi+in%3Aname+package&type=repositories`
- `https://github.com/eaedk/testing-zindi-package (git clone)`
- `raw.githubusercontent.com/<this repository>/a65a5b2e07ee7b6f6c9163c1701f7f64c909b01c/research/colony-sweep/scouts/bounties-grants--data-challenges.md`
- `https://github.com/orgs/OpenTermsArchive/repositories?q=declarations&type=all`
- `https://github.com/tosdr/tosdr-snapshots (git clone, tree at b44ae1b)`
- `verifier: https://raw.githubusercontent.com/ZindiAfrica/AI-for-Equity-Challenges-Getting-Started-with-AWS-Resources/12deb4058dd0cc5db6b0f366bc01ef8fc4456b7c/SUAOutsmartingOutbreaksChallenge.md`
- `verifier: raw.githubusercontent.com/<this repository>/a65a5b2e07ee7b6f6c9163c1701f7f64c909b01c/research/colony-sweep/scouts/bounties-grants--data-challenges.md (200)`
- `verifier: raw.githubusercontent.com/<a mistyped owner>/automaton/a65a5b2e07ee7b6f6c9163c1701f7f64c909b01c/research/colony-sweep/scouts/bounties-grants--data-challenges.md (404; wrong owner)`
- `verifier: https://github.com/orgs/ZindiAfrica/repositories?type=all (WebFetch)`
- `verifier: https://github.com/Zindi-Africa?tab=repositories (WebFetch)`
- `verifier: git clone (depth 1, blob:limit=400k, no checkout) https://github.com/ZindiAfrica/{MPEG-G-Microbiome-Hackathon-Series,Digital-Africa,AI-for-Equity-Challenges-Getting-Started-with-AWS-Resources,AI-for-Equity-Challenges-Processing-Example,mlcontests.github.io,.github}`
- `verifier: git clone (depth 1, blob:limit=400k, no checkout) https://github.com/Zindi-Africa/{philips-mpeg-g-challenge,AI-for-Equity-Challenge-Getting-Started-with-AWS-Resources,mlcontests.github.io}`
- `verifier: OTA 18 declarations repos and tosdr-snapshots tree (as listed under kaggle.com)`

</details>

## Robots verdicts (6.10.2026, tick 54)

The 6.10 render-watch run (commit 5f4853a, fetched 07:15-07:16 UTC) captured the robots.txt probe of each of the 21 NO_TERMS sites (ZERO-TESTS rows 244-264) and no rules page of any of them. Tick 54 then ran `node scripts/robots-verdict.mjs <site> --urls research/measurements/ai-allowed-events.urls.txt` for each of the 21, the one route ruling 30.9 16(d) D2(iv)-(v) (`research/channel-loop/RULING-2026-09-30-video.md`) gives to NO_TERMS_ROBOTS_OK: only that script sets it, only on a NO_TERMS site whose note opens exhaustive-negative (all 21, by ruling R1), only when the committed capture of the host's robots.txt is a file the site served (a 2xx `text/plain` body that is not markup) or a 404/410 (no rules), and only when that robots.txt allows, for MehudakRenderWatch or else `*`, every rules path the list holds for the site. With `--apply` it set 17 sites (each exit 0, "set <site> to NO_TERMS_ROBOTS_OK") and declined four (each exit 3); a second dry run of all 21 changed nothing (the 17: "already NO_TERMS_ROBOTS_OK"; the four: the same reasons). The live list's URLs for these 21 sites are the fixture's (`ai-allowed-events.urls.txt@548be52`), so the counts below are the fixture's too. In `research/channel-loop/terms-verdicts.json` only the 17 entries changed, and in each only `verdict`, `source` (the capture it read, named since the review by its dated frozen copy, with its fetchedAt and sha256, the ruling, and after "NO_TERMS before:" the tick-45 source) and `checked` (2026-10-06); every note is kept as tick 45 wrote it. Every value in the table is read from the `.meta.json` of the capture's dated frozen copy, which keeps the live meta's values (its sha256 is of the stored body, and the stored `.txt` files hash to it), and from the script's output; no robots.txt was fetched in this tick.

| Site | robots.txt capture (file; HTTP status; Content-Type; fetchedAt; sha256 first 12) | Queued paths (count) | Answer | Verdict now |
|---|---|---|---|---|
| `agenthon.net` | `research/rendered/robots-agenthon-2026-10-06.txt`; 200; `text/plain`; 2026-10-06T07:15:41.847Z; 54048ccab842 | 1 | 1 of 1 allowed (`Allow: /`) | NO_TERMS_ROBOTS_OK |
| `aicrowd.com` | `research/rendered/robots-aicrowd-2026-10-06.txt`; 200; `text/plain`; 2026-10-06T07:15:43.223Z; 4a3f62d88041 | 1 | 1 of 1 allowed (no rule matches) | NO_TERMS_ROBOTS_OK |
| `alignmentforum.org` | `research/rendered/robots-alignmentforum-2026-10-06.txt`; 200; `text/plain;charset=UTF-8`; 2026-10-06T07:15:44.540Z; 95fa4bc6581b | 1 | 1 of 1 allowed (no rule matches) | NO_TERMS_ROBOTS_OK |
| `bcamlc.com` | `research/rendered/robots-bcamlc-2026-10-06.meta.json`; 404; `text/html; charset=utf-8`; 2026-10-06T07:15:45.904Z; none | 1 | no robots.txt (404): no rules, RFC 9309 §2.3.1.3; 1 of 1 allowed | NO_TERMS_ROBOTS_OK |
| `crunchdao.com` | `research/rendered/robots-crunchdao-2026-10-06.txt`; 200; `text/plain; charset=utf-8`; 2026-10-06T07:15:37.366Z; 5da2ca7b11c5 | 3 | 3 of 3 allowed (`Allow: /`) | NO_TERMS_ROBOTS_OK |
| `drivendata.org` | `research/rendered/robots-drivendata-2026-10-06.txt`; 200; `text/plain`; 2026-10-06T07:15:47.309Z; dc660bb87584 | 1 | 1 of 1 allowed (no rule matches) | NO_TERMS_ROBOTS_OK |
| `flagos.io` | `research/rendered/robots-flagos-2026-10-06.html`; 200; `text/html`; 2026-10-06T07:15:39.349Z; 2c778aeba9e9 | 3 | not a robots.txt: a 200 that answered `text/html` (ruling D2(iv): the site's answer) | NO_TERMS |
| `geminixprize.com` | `research/rendered/robots-geminixprize-2026-10-06.txt`; 200; `text/plain; charset=utf-8`; 2026-10-06T07:15:48.468Z; a4d9fb4edd10 | 1 | 1 of 1 allowed (`Allow: /`) | NO_TERMS_ROBOTS_OK |
| `health-data-hub.fr` | `research/rendered/robots-health-data-hub-2026-10-06.txt`; 200; `text/plain; charset=utf-8`; 2026-10-06T07:16:12.932Z; 8e8cb58d8104 | 1 | 1 of 1 allowed (no rule matches) | NO_TERMS_ROBOTS_OK |
| `ijcai.org` | `research/rendered/robots-ijcai-2026-2026-10-06.txt`; 200; `text/plain; charset=utf-8`; 2026-10-06T07:16:14.751Z; bb425fb4065d | 1 | 1 of 1 allowed (no rule matches) | NO_TERMS_ROBOTS_OK |
| `k12-ai-infrastructure.org` | `research/rendered/robots-k12-ai-infrastructure-2026-10-06.txt`; 200; `text/plain`; 2026-10-06T07:15:50.070Z; e3b0c44298fc | 1 | 1 of 1 allowed (no rule matches) | NO_TERMS_ROBOTS_OK |
| `learn2design2026.com` | `research/rendered/robots-learn2design2026-2026-10-06.meta.json`; 404; `text/html; charset=utf-8`; 2026-10-06T07:15:51.357Z; none | 1 | no robots.txt (404): no rules, RFC 9309 §2.3.1.3; 1 of 1 allowed | NO_TERMS_ROBOTS_OK |
| `microblink.com` | `research/rendered/robots-microblink-2026-10-06.meta.json`; 404; `text/html; charset=utf-8`; 2026-10-06T07:15:52.723Z; none | 1 | no robots.txt (404): no rules, RFC 9309 §2.3.1.3; 1 of 1 allowed | NO_TERMS_ROBOTS_OK |
| `mozilladatacollective.com` | `research/rendered/robots-mozilladatacollective-2026-10-06.txt`; 200; `text/plain`; 2026-10-06T07:16:16.044Z; 32403248dc76 | 4 | 4 of 4 disallowed (`Disallow: /`) | NO_TERMS |
| `pasteurlabs.ai` | `research/rendered/robots-pasteurlabs-2026-10-06.meta.json`; 404; `text/html; charset=utf-8`; 2026-10-06T07:15:54.325Z; none | 1 | no robots.txt (404): no rules, RFC 9309 §2.3.1.3; 1 of 1 allowed | NO_TERMS_ROBOTS_OK |
| `situatedevals.org` | `research/rendered/robots-situatedevals-2026-10-06.meta.json`; none; none; 2026-10-06T07:16:05.819Z; none | 1 | no answer (fetch failed): complete disallow, RFC 9309 §2.3.1.4 | NO_TERMS |
| `solafune.com` | `research/rendered/robots-solafune-2026-10-06.meta.json`; 404; `text/html; charset=utf-8`; 2026-10-06T07:16:07.222Z; none | 1 | no robots.txt (404): no rules, RFC 9309 §2.3.1.3; 1 of 1 allowed | NO_TERMS_ROBOTS_OK |
| `sophelio.io` | `research/rendered/robots-sophelio-2026-10-06.txt`; 200; `text/plain`; 2026-10-06T07:16:08.355Z; a09c759ba0fc | 1 | 1 of 1 allowed (`Allow: /`) | NO_TERMS_ROBOTS_OK |
| `theemailgame.com` | `research/rendered/robots-theemailgame-2026-10-06.html`; 200; `text/html; charset=utf-8`; 2026-10-06T07:16:09.668Z; 183164e3b081 | 1 | not a robots.txt: a 200 that answered `text/html; charset=utf-8` (ruling D2(iv): the site's answer) | NO_TERMS |
| `thinkonward.com` | `research/rendered/robots-thinkonward-2026-10-06.meta.json`; 404; `text/html; charset=utf-8`; 2026-10-06T07:16:11.117Z; none | 1 | no robots.txt (404): no rules, RFC 9309 §2.3.1.3; 1 of 1 allowed | NO_TERMS_ROBOTS_OK |
| `wundernn.io` | `research/rendered/robots-wundernn-2026-10-06.txt`; 200; `text/plain; charset=utf-8`; 2026-10-06T07:15:40.602Z; 8fa3036c68bf | 2 | 2 of 2 allowed (no rule matches) | NO_TERMS_ROBOTS_OK |
| `nevo.co.il` | `research/rendered/robots-nevo-2026-09-30.txt`; 200; `text/plain`; 2026-09-30T10:25:33.422Z; f47e11ef28db | 8 (paused lines of `research/rendered/urls.txt`) | 8 of 8 disallowed (`Disallow: /`) | NO_TERMS |

Eleven of the 17 served a robots.txt (k12-ai-infrastructure.org's is an empty file, so no rule at all) and six answered 404, for which render-watch stores no body: their sources name the `.meta.json`, with no sha256. The 17 sites' 20 rules URLs pass `termsGate` now ("Now, on robots.txt" in "What the reading can render"); none was queued or rendered in this tick. The script read the live captures (it never reads a frozen copy) and wrote their paths into the sources. At the tick-54 review the 21 captures of the 6.10 run in the table were frozen (`scripts/freeze-capture.mjs`: each capture as 5f4853a stored it, byte for byte, its files recorded in `research/rendered/FROZEN.sha256`), and nevo's row names the copy of its 30.9 capture frozen at tick 38, the one the 6.10 row-21 ruling cites. Each of the 17 sources and every row of the table names the frozen copy: in each source only the path changed, and each is exactly what the script's `judgeSite` writes when the capture it reads is that copy, which `src/__tests__/revenue/prize-terms-audit.test.ts` re-derives for every site. No urls.txt line names a frozen copy, so the weekly render, which rewrites a live capture whenever its body changes, never rewrites what these verdicts rest on; the live probes stay on the weekly watch, and render-watch reads each host's robots.txt again before it fetches any page. A robots.txt that changes after its verdict is not judged again by the script (it declines an entry that is already NO_TERMS_ROBOTS_OK): that is a main-thread step.

**The four not set, and nevo.** flagos.io and theemailgame.com: /robots.txt answered 200 with an HTML page (`text/html`, 2018 and 99393 bytes), not a robots.txt the site served, and ruling D2(iv) takes a refusal or a bot challenge as the site's answer; the script sets the verdict only on a `text/plain` file or a 404/410. situatedevals.org: no HTTP answer at all ("TypeError: fetch failed", status none), which RFC 9309 §2.3.1.4 reads as complete disallow; its probe stays on the weekly run, and the script is run for it again after a capture that is a file or a 404. mozilladatacollective.com: its robots.txt is `User-agent: *` then `Disallow: /` (27 bytes), so all four rules pages are disallowed and are not fetched, and R3's address rule for them does not arise. Each of the four stays NO_TERMS, exhaustive-negative, checked 2026-10-05, with only its robots.txt probe queued. nevo.co.il is no prize site: its eight law pages are paused lines of `research/rendered/urls.txt`, the script's default list, and run again without `--urls` the script still declines it (exit 3), 8 of 8 disallowed by `Disallow: /` in the capture of 30.9 (the 6.10 run did not rewrite it: render-watch rewrites a capture only when it changed), so those lines stay paused. The ten nevo captures of 29.9 are `[robots-bar]` under ruling 6.10 row 21 (a) (`research/channel-loop/RULING-2026-10-06-robots-and-terms.md`, decision 1: a robots.txt Disallow is a bar, and those captures are D1(1), compliance and decisions not to act only, never a product input). On 6.10, before that ruling's folds, `products/il-biz-tools/src/config/osek-zair.json` still took its 2026 cap from one of them: `documents.vatLaw`, nevo's consolidated VAT law, `research/rendered/nevo-vat-law-2026-09-29.txt` (the dated copy of one of the eight paused pages). The ruling's decision 1(5) takes every nevo cite out of the product, through its folds 3 and 4; this tick does not carry them out.

## Terms read (6.10.2026, tick 54)

The 6.10 render-watch run (commit 5f4853a, fetched 07:15 UTC) captured the terms page of each of the nine TERMS_PENDING sites (ZERO-TESTS rows 235-243), plain and once (ruling 30.9 16(d) D2(iii)). Six were read pages, and each was frozen before it was read (`scripts/freeze-capture.mjs`: `<slug>-2026-10-06`, the capture as 5f4853a stored it, its files recorded in `research/rendered/FROZEN.sha256`); every line cited below is the frozen copy's, whose line numbers are the live capture's of 6.10. Each of the six was read in full by one Opus reader and then by one adversarial Opus verifier, who re-checked every quote at its line, the scope finding and the grade; the main thread (Fable 5.1, tick 54) ruled on the two records. The other three gave no text to read: opensky-network.org refused the runner, and kaggle.com and adaptionlabs.ai served shells. Each changed entry of `research/channel-loop/terms-verdicts.json` names the frozen copy and this reading in its source, which ends "; TERMS_PENDING before: " and the tick-45 source, checked 2026-10-06; `research/rendered/urls.txt` and ZERO-TESTS rows 235-243 follow the verdicts, and row 265 is new.

| Site | Verdict (6.10) | Document (title, date as stated) | Scope finding | Decisive clause (quoted, frozen copy file:line) | Condition or note | Lines now |
|---|---|---|---|---|---|---|
| `devpost.com` | BARRED | Devpost Terms of Service ("The Devpost Terms of Service for Hackathons", :111), "Last Updated: December 5, 2025" (:313) | The Site is "the Devpost website, www.devpost.com" (:111); the hackathon pages sit inside it (:129, :170, :185), and Hackathon Content is User Content (:128), so the seven *.devpost.com hackathon hosts are covered by inference the document supports (it names no subdomain); visiting binds (:114), and Users include "other visitors to the Site" (:123) | "Uses manual or automated software, devices, scripts robots, or other means or processes to access, “scrape,” “crawl” or “spider” the Site, User Content (including User Profiles and Team Pages), or any related data or information;" (`research/rendered/terms-devpost-2026-10-06.txt:159`) | No robots.txt, rate or purpose exception. Copying is barred too: "Unauthorized copying or use of any Devpost Content or Intellectual Property Rights without the express written consent of Devpost is strictly prohibited." (:252), and :250 bars transmitting Devpost Content. Reader and verifier agreed. | `TERMS_BARRED` gains devpost.com (every *.devpost.com host); the terms line is paused in its form; 7 rules URLs refused |
| `zindi.africa` | BARRED | Zindi Terms of Use (h1 at :12), no date stated | "your access to and use of www.zindi.africa, including any content, functionality and services offered on or through www.zindi.africa" (:14), binding on use (:15); the page's og:url (`research/rendered/terms-zindi-2026-10-06.html:50`) and the capture's robots.txt check name zindi.world, so zindi.africa redirects there [inference] | "You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store or transmit any of the material on our Website, except as allowed or required by these Terms of Use." (`research/rendered/terms-zindi-2026-10-06.txt:68`) | No automated-access clause; the copying and storing bar is flat. Content downloaded from the Website is for "the legitimate purpose of building and submitting a Competition solution" only (:47), and "Any use of the Website not expressly permitted by these Terms of Use" is a breach (:74). Reader and verifier agreed. | `TERMS_BARRED` gains zindi.africa and zindi.world; the terms line is paused in its form; 5 rules URLs refused |
| `grand-challenge.org` | CONDITIONAL_UNMET | Grand Challenge Terms of Service, no date stated, changeable "without notice" (:36) | "By using grand-challenge.org, you are agreeing to be bound" (:34); a User is anyone who "accesses or uses the Platform" (:56); the Services include "hosting an AI challenge" (:54) and the terms govern them (:164), so the five <name>.grand-challenge.org hosts are covered by inference (the capture names no subdomain) | "You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Platform or Services, use of the Platform or Services, or access to the Platform or Services without the express written permission by Radboudumc." (`research/rendered/terms-grand-challenge-2026-10-06.txt:150`) | The condition is Radboudumc's express written permission, which the runner lacks; a weaker second one is "for Research Use Only" (:122), "solely for scientific or academic purposes" (:50), aimed at clinical use (:124). Access is not barred: the bots clause (:76) is about registering accounts. A cure also needs the organiser's consent, since a challenge page is its organiser's content (the verifier). | The terms line is paused (terms read, left paused); 5 rules URLs refused |
| `stanford.edu` | CONDITIONAL_UNMET (the verifier read BARRED) | Stanford University "Terms of Use" (:96), no date stated | Any website "available at stanford.edu, stanfordalumni.org or other Stanford sites" (:97), and "Stanford" includes "any Stanford-affiliated entity" (:99): aimslab.stanford.edu and quantiphy.stanford.edu are covered on the text | "User may download material from the Sites only for User’s own personal, non-commercial use. User may not otherwise copy, reproduce, retransmit, distribute, publish, commercially exploit or otherwise transfer any material." (`research/rendered/terms-stanford-2026-10-06.txt:125`) | The condition is a personal, non-commercial purpose, which the runner does not meet; the 29.9 audit counts a purpose among the conditions it grades (`TERMS-AUDIT-2026-09-29.md:7`). Dissent: the verifier read BARRED, since committing page bytes to a public repository is copying and publishing, which the second sentence bars for every user; the main thread kept CONDITIONAL_UNMET, and the outcome is the same. No clause mentions robots or automated access. | The terms line is paused (terms read, left paused); 2 rules URLs refused |
| `virtualembryo.ai` | NOT_BARRED | Virtual Embryo Challenge "Website Terms of Use", "Effective 10 August 2026" (:12-13), separate from the Challenge Rules (:84) | The Services are the challenge website, portal, leaderboard, forum, datasets and related services (:14), documentation included (:16), at https://virtualembryo.ai (:75); the atlas pages on the host are not named, and none is fetched | None bars a runner: no clause on robots, crawling, scraping or automated access; the acceptable-use list bars misconduct such as "Reverse engineer, disrupt, or attack the Services." (`research/rendered/terms-virtualembryo-2026-10-06.txt:43`) | Copying allowed: :54 is an ownership notice and :55 a limit on participants' use of released competition materials. The Official Rules "form part of these Terms" (:17), and violating them is barred to every user (:45); they are unread, and a bar found there reopens the verdict. Open for the main thread (tick-54 review): the footer names a Stanford University lab, "… Lab, Stanford University. All rights reserved." (:109), and Stanford's terms govern any website "available at stanford.edu, stanfordalumni.org or other Stanford sites" (`research/rendered/terms-stanford-2026-10-06.txt:97`); neither reader nor verifier weighed it, and the main thread rules on whether they reach this host before its rules page is dispatched. | The terms line stays active; 1 rules URL passes the gate ("Now" above) |
| `eurocontrol.int` | NO_TERMS (exhaustive-negative) | "Privacy and website terms of use" (the page title, :1): a privacy notice whose contents are headed "Website Privacy Policy" (:367), no date stated | Privacy coverage of the "eurocontrol.int" domain (:169) and website (:179); no site-use terms for any host | None: sections 1-9 (`research/rendered/terms-eurocontrol-2026-10-06.txt:153-273`) cover browsing data, cookies, disclosure, retention and data rights, and the only rights marker is the bare footer "© EUROCONTROL" (:439) | Ruling R1: the tick-45 record searched Open Terms Archive, tosdr/tosdr-snapshots and EUROCONTROL's own GitHub organisation and found none. The verifier pointed at the footer's "Disclaimers" item (:433; its link, /info/disclaimers, is at `research/rendered/terms-eurocontrol-2026-10-06.html:1961` and :2830), unread, as a likely home of reuse terms; the main thread ruled the record exhaustive, and a terms text found there reopens the verdict. The tick-54 review found the record short of R1's list in two steps: no grep of the two organisations' repository contents for terms or legal files, and no search of this repository (research/ and docs/, searched 6.10 by the review fix: one EUROCONTROL text, ansperformance.eu's copyright notice, `research/channel-loop/terms/ansperformance-disclaimer-2026-10-05.md:28`, which governs that site). Whether the Disclaimers page is read before `scripts/robots-verdict.mjs` runs on the row-265 probe is open for the main thread. ansperformance.eu's second linked document is this privacy notice. | The terms line is paused as read (a privacy notice, no site terms); its robots.txt probe is queued (ZERO-TESTS row 265) for the next weekly run; 1 rules URL waits on `scripts/robots-verdict.mjs` |
| `opensky-network.org` | NO_TERMS (refusal-type) | None read: https://opensky-network.org/about/terms-of-use answered HTTP 403 Forbidden (`research/rendered/terms-opensky.meta.json`, fetched 2026-10-06T07:15:35.520Z, no body) | — | — | The refusal is the site's answer (ruling 30.9 16(d) D2(iv); ruling 6.10 row 21 decision 3(1), K1), as its API docs warned (openskynetwork/opensky-api README.md:4 at c4af9c9); no js attempt, ever. | The terms line is retired; ZERO-TESTS row 243 RETIRED; 1 rules URL refused |
| `kaggle.com` | TERMS_PENDING (shell) | None read: a JavaScript shell, 21 characters of text (capture-check js-shell) | — | — | Kind K4 (ruling 6.10 row 21 decision 3(1)); the once-only js render of decision 3(2), through the `--js --terms-shell` route of `scripts/queue-zero-test.mjs` (built 6.10, commit 5a3ee24), is next, run by the main thread after the plain shell is frozen. | The terms line stays on the weekly watch; 17 rules URLs refused |
| `adaptionlabs.ai` | TERMS_PENDING (shell) | None read: a navigation-only page, 200, 51 KB of HTML and 85 characters of text (capture-check short, not js-shell) | — | — | Kind shell; the js route of decision 3 waits on the classifier naming this kind. | The terms line stays on the weekly watch; 1 rules URL refused |

**The two shells.** kaggle.com and adaptionlabs.ai stay TERMS_PENDING, and each note opens "shell:" (decision 3(1)). Kaggle's plain capture is the empty application root that capture-check names js-shell, so the once-only js render of decision 3(2) applies to it once that route exists. Adaption Labs' is a page that holds only its navigation; capture-check grades it short, so decision 3(2)(i), which requires a js-shell, is not met until the classifier names this kind. Nothing else of either site is fetched meanwhile.

**The copying field and the kind words (ruling 6.10 row 21, fold 2).** Every entry of `terms-verdicts.json` now carries a fifth field after "note", "copying" (decision 4(2)): "barred" for the four sites the ruling names (worksheets4kids.co.il, btl.gov.il, apify.com, indiebook.co.il) and for the four whose copying clauses this reading quotes (devpost.com :252, zindi.africa :68, grand-challenge.org :150, stanford.edu :125), and, from the tick-54 review, for the two other sites whose verdicts already rested on a read copying clause (codabench.org, `research/channel-loop/terms/codabench-privacy-and-terms-2026-10-05.md:39`; tipalti.com, `research/rendered/terms-tipalti-website.txt:245`, the clause its TERMS_BARRED entry cites), "allowed" for virtualembryo.ai, and "unread" for the other 121, which is not "allowed". Each barred entry's note cites its clause. A copying clause quoted only as an open caveat beside a verdict that rests on something else stays "unread" for fold 10(i)'s copying audit, which reads each such clause for the copying question itself: GitHub's AUP §6 on the ten sites whose notes carry it from github.com's row, PostHog's LICENSE request (held by its PATH_LIMITS entry), and ansperformance.eu's non-commercial licence, whose condition the board has not settled. `scripts/robots-verdict.mjs` now keeps every field it does not set, and `serializeVerdicts` keeps the fields in one order, so the file keeps one exact format. The six frozen copies above are themselves full copies of pages whose terms bar copying (four of them); decision 4(1) trims them with the rest once `scripts/trim-capture.mjs` exists (fold 9). The notes of NO_TERMS and TERMS_PENDING sites now open with their kind word where one of decision 3(1)'s five kinds applies: refusal-type and exhaustive-negative as before, "unanswered:" for mr.gov.il, "shell:" for israelpost.co.il, streetlib.com, streetlib.it, kaggle.com and adaptionlabs.ai, "deferred to www.gov.il:" for data.gov.il, and from this reading "exhaustive-negative:" for eurocontrol.int and "refusal-type:" for opensky-network.org. nevo.co.il's note gains its `[robots-bar]` sentence (decision 1), and wikisource.org's names decision 2's two triggers.

**Notes with no kind word yet.** Twenty-three other NO_TERMS or TERMS_PENDING notes carry none, because none of the five kinds fits what they record: no terms URL known (sixteen sites of the 29.9 audit's NO_TERMS_CAPTURE class, whose "403" or "404" notes describe a page other than terms), a terms URL that answered with no site terms (odoo.com, stripe.com) or redirect-looped (sumit.co.il), a host read beside a related site (amazonaws.com follows streetlib.com; spreadshirt.net's own terms are unread), or a terms page that answered and awaits a read (un.org, 200 on 6.10; wikimedia.org, whose two bot policies were read 30.9). `src/__tests__/revenue/prize-terms-audit.test.ts` lists them by name, so the list can only shrink as each is read or searched.

## Shell terms pages rendered once (6.10.2026, tick 54)

Ruling 6.10 row 21 decision 3 (`research/channel-loop/RULING-2026-10-06-robots-and-terms.md`) lets a terms page that the plain GET saw as a JavaScript shell (kind K4) be rendered in js mode once, as a reading act: the plain shell is frozen first, only `scripts/queue-zero-test.mjs --js --terms-shell` queues the line, the render runs under render-watch's js-mode limits, and whatever comes back is the answer (3(2)(vi)): a read page sets the verdict, a block or a challenge is recorded as the site's answer, and the line is retired either way, with no second attempt in any mode and no fetch of any other page of the site. Two K4 pages were queued so in commit c058238, kaggle.com's terms page (its plain shell of 6.10, "The two shells" above) and Israel Post's (its plain shell of 30.9, decision 3(3)), and the run of a3cb438 rendered both. Kaggle's came back as its Terms of Use, which was frozen as `terms-kaggle-2026-10-06-a3cb438` (`scripts/freeze-capture.mjs` names a second copy of one slug and day `<slug>-<day>-<commit>`, since `terms-kaggle-2026-10-06` holds the plain shell) and read in full by one Opus reader and then by one adversarial Opus verifier; the main thread (Fable 5.1, tick 54) ruled on the two records. Israel Post's came back HTTP 403, which is the site's answer (decision 3(1), K1). Both js lines are retired in `research/rendered/urls.txt`, each keeping its js flag, so the route's once-only check refuses a second `--terms-shell` for either slug; ZERO-TESTS row 235 reads BARRED and row 233 RETIRED.

| Site | Plain shell (frozen copy) | js render (status, chars, frozen copy) | Verdict | Decisive clause (quoted, frozen copy file:line) | Lines now |
|---|---|---|---|---|---|
| `kaggle.com` | 200, 21 characters of text (the page title), capture-check js-shell (`research/rendered/terms-kaggle-2026-10-06.txt`, fetched 2026-10-06T07:15:22Z, frozen as 5f4853a stored it) | 200, 36,788 characters of text in 167 lines: Kaggle's Terms of Use, version "June 22, 2025 (active)" (`research/rendered/terms-kaggle-2026-10-06-a3cb438.txt:53`), rendered with chromium at 2026-10-06T09:48:50Z, frozen as a3cb438 stored it | BARRED (copying barred) | "“Crawls,” “scrapes,” or “spiders” any page, data, or portion of or relating to the Services or Content (through use of manual or automated means);" (`research/rendered/terms-kaggle-2026-10-06-a3cb438.txt:77`, in the list of :74, binding on any use of or access to the Services, :57); independently, no use, copying or publishing "for any purpose any Content not owned by you, (i) without the prior consent of the owner of that Content" (:87), and use only "for your own internal, personal, non-commercial use, and not on behalf of or for the benefit of any third party" (:70) | `TERMS_BARRED` gains kaggle.com (www.kaggle.com, :62, and its competition pages, :103); the js terms line is retired; 17 rules URLs refused, build-arena's Kaggle competition (`ai-allowed-events.urls.txt@548be52:112`) among them |
| `israelpost.co.il` | 200, 10 characters of text (the page title), capture-check js-shell, naming Radware's bot-manager connector and a reCAPTCHA v3 script (`research/rendered/terms-israel-post-2026-09-30.txt`, fetched 2026-09-30T13:40:17Z, frozen as 712ae0a stored it) | HTTP 403, no body (`research/rendered/terms-israel-post.meta.json`: error "HTTP 403", renderedWith chromium, fetched 2026-10-06T09:48:52Z; that meta is the evidence, and no render rewrites it now that the line is retired) | NO_TERMS (refusal-type; shell before) | — | The js terms line is retired; ZERO-TESTS row 233 RETIRED; no Israel Post page is fetched, ever, until a GitHub-hosted copy of its terms is read, so the registered-mail rate (documents ruling fold 11(c)) stays unread and step 2's registered-mail notice stays recorded, not asked |

**The reading.** The reader and the verifier agreed on BARRED, on three grounds each sufficient alone: crawling or scraping any page by manual or automated means (`research/rendered/terms-kaggle-2026-10-06-a3cb438.txt:77`), copying or publishing Content without its owner's prior consent (:87, which :89 says copy or download functionality does not lift), and use only for an internal, personal, non-commercial purpose (:70). The Terms bind any use of or access to the Services (:57, :60), and the only routes they leave are a written amendment signed by both sides (:63) and each Content owner's consent (:87); the runner has neither. The verifier corrected four supporting points of the reader's, none of which moves the verdict: the written-permission route is :63, not the competition-services clause the reader cited (:120); the "significant portion" of :78 is unclear rather than "probably not"; reading a competition's rules to decide whether to enter is the use the Terms contemplate, and storing its pages in a public repository is what :70 bars; and who owns a Kaggle-hosted competition's text is unclear (:108). An Environment is not a Competition (:113), but it is still the Services, so the build-arena pages are covered either way. Not read: the Acceptable Use Policy the Terms incorporate (:75).

**Copying and kinds.** kaggle.com's copying field is "barred" (`research/rendered/terms-kaggle-2026-10-06-a3cb438.txt:87`, a clause the verdict rests on), so eleven entries of `terms-verdicts.json` are barred and 120 unread, against ten and 121 after the terms read above. israelpost.co.il's note opens "refusal-type:" (K1) and records kind K4 before; kaggle.com's opens "BARRED on access and copying:". adaptionlabs.ai is the one prize-event site still TERMS_PENDING, of kind shell, and the classifier does not yet name its kind.
