import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design
import { decisionFiles, listedNames } from "../../../scripts/freeze-capture.mjs";
import {
  parseRobotsTxt,
  parseUrlList,
  redactSecrets,
  robotsDecision,
  robotsRulesFor,
  robotsTxtUrl,
  termsBarred,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/render-watch.mjs";
import {
  PATH_LIMITS,
  TERMS_SHELL_RULING,
  applyVerdicts,
  isExhaustiveNegative,
  isRobotsOkVerdict,
  isRobotsProbe,
  siteOf,
  termsGate,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/queue-zero-test.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { classifyCapture, readCapture } from "../../../scripts/capture-check.mjs";
import {
  PAUSED_LINE,
  judgeSite,
  queuedPaths,
  readableCapture,
  serializeVerdicts,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/robots-verdict.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { syncPauseComments } from "../../../scripts/urls-pause-comments.mjs";

/**
 * Tick 45 (5.10.2026): the terms audit of the prize-event sites, step 0 of the rules-page reading (logs/CHANNEL_LOOP.md
 * §4 row 13; research/measurements/ai-allowed-events.md). The 101 rules URLs of research/measurements/ai-allowed-events.urls.txt
 * as it stood at 548be52 sit on 45 sites; github.com and google.com were judged before, and the other 43 are judged here
 * (research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md). The tick-20 rule (a site's terms are read before its
 * first line is fetched) decides what may be queued: a TERMS_PENDING site gets its terms page only, an
 * exhaustive-negative NO_TERMS site its robots.txt only (ruling 30.9 16(d) D2(iv)-(v)), and no rules page goes into
 * research/rendered/urls.txt at all.
 *
 * The audited list is a FIXTURE, not the live file (tick 45 review, defect 2). prize-intake.yml rewrites
 * ai-allowed-events.urls.txt every Wednesday with [skip ci], and reorders it by the quarter window of the day it runs, so
 * a test or a citation by line that reads the live file goes wrong without anyone touching this repo's code. The fixture
 * is the file at 548be52 byte for byte, and the notes cite it as ai-allowed-events.urls.txt@548be52:N.
 *
 * The main thread's rulings of 5.10 (the audit note's "Main-thread rulings" section) settle the three questions the
 * review left open. R1: exhaustive-negative does not require GitHub code search, so every NO_TERMS site of this audit is
 * exhaustive-negative and gets one robots.txt probe. R2: grand-challenge.org's terms URL, derived from the platform's own
 * source at a pinned commit, is admitted as a narrow exception that urls.txt's header records. R3: an organisation's,
 * project's or mailing-list address is a role address, not personal information; a named individual's address is.
 *
 * Tick 54 (6.10.2026): the weekly render of 6.10 (5f4853a) captured the robots.txt of all 21 NO_TERMS sites, and
 * scripts/robots-verdict.mjs, run for each with --urls research/measurements/ai-allowed-events.urls.txt (ruling 30.9
 * 16(d) D2(iv)-(v)), set 17 of them to NO_TERMS_ROBOTS_OK and declined four. The tests below hold both states: AUDITED is
 * the tick-45 audit as it was (tick45() reads it back out of the file: a NO_TERMS_ROBOTS_OK source keeps the NO_TERMS
 * source after "; NO_TERMS before: "), and the "tick 54" block holds the 6.10 progression, each verdict re-derived by
 * the script's own judgeSite from the committed captures and the fixture.
 *
 * Tick 54 (6.10.2026), later the same day: the terms pages of the nine TERMS_PENDING sites, captured by that render, were
 * read. Six were read pages, frozen first (scripts/freeze-capture.mjs, <slug>-2026-10-06) and read in full by one Opus
 * reader and one adversarial Opus verifier each, with the main thread's verdicts: devpost.com and zindi.africa BARRED
 * (TERMS_BARRED gains devpost.com, zindi.africa and zindi.world), grand-challenge.org and stanford.edu CONDITIONAL_UNMET,
 * virtualembryo.ai NOT_BARRED, eurocontrol.int NO_TERMS (exhaustive-negative: a privacy notice only, so one robots.txt
 * probe is queued). opensky-network.org refused the runner (403: NO_TERMS, refusal-type, its line retired); kaggle.com and
 * adaptionlabs.ai served shells and stay TERMS_PENDING. Each changed source ends "; TERMS_PENDING before: " and the
 * tick-45 source, so tick45() reads tick 45 back out of the file as it does for the robots verdicts; termsReadBefore()
 * gives the state between the two (robots verdicts set, terms unread). Ruling 6.10 row 21's fold 2 rode along: every
 * entry has a "copying" field and the NO_TERMS/TERMS_PENDING notes open with their kind word. The "tick 54: the terms
 * read on 6.10" block holds that state.
 *
 * Tick 54 (6.10.2026), later still: kaggle.com's terms page, a shell to the plain GET (ruling 6.10 row 21 decision 3, K4),
 * was rendered once in js mode (queued c058238, rendered a3cb438) and read on its frozen copy
 * (terms-kaggle-2026-10-06-a3cb438): BARRED, and TERMS_BARRED gains kaggle.com. Israel Post's shell, rendered the same
 * way, answered 403 (refusal-type). Both js lines are retired with their js flag kept. kaggle.com's source now ends in
 * TERMS_BEFORE and the tick-45 source like the other read entries, so tick45() and termsReadBefore() read it back as
 * before; jsReadBefore() gives the state between the terms read and the js render. The "tick 54: the shell terms pages
 * rendered once" block holds that state.
 *
 * Tick 55 (6.10.2026): the terms links found after the verdicts. agenthon.net's home page (the 6.10 prize capture) and
 * eurocontrol.int's privacy notice (the 6.10 terms capture) each link a terms-like page in their footer, so the premise of
 * their NO_TERMS verdicts, no terms link anywhere, is false, and the main thread ruled both TERMS_PENDING again
 * (logs/CHANNEL_LOOP.md §9, "Queued 6.10 (tick 54)" item 1): agenthon.net's NO_TERMS_ROBOTS_OK is the first robots verdict
 * taken back. Each has one terms- line queued (ZERO-TESTS rows 266-267), its robots.txt probe paused, and no robots
 * verdict may run for it. Their new notes do not keep the tick-54 notes, so the two tick-54 entries are a FIXTURE
 * (terms-verdicts-364bf71-links-found.json: the file at 364bf71 for those two sites, pinned by sha256), and tick54() puts
 * them back; termsReadBefore(), jsReadBefore() and tick45() read the earlier states out of tick54()'s, so every block above
 * holds what it held, and the counts that moved are kept both ways (17 NO_TERMS_ROBOTS_OK sites and 20 robots-cleared
 * rules URLs at tick 54, ROBOTS_OK_TICK54; 16 and 19 now, ROBOTS_OK). The "tick 55" block holds the new state.
 */
const VERDICTS = "research/channel-loop/terms-verdicts.json";
const URLS = "research/rendered/urls.txt";
const ZERO = "research/channel-loop/ZERO-TESTS.md";
const AUDIT = "research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md";
const PRIZE_URLS = "research/measurements/ai-allowed-events.urls.txt";
const PIN = "548be52";
const FIXTURE = `src/__tests__/revenue/fixtures/ai-allowed-events-${PIN}.urls.txt`;
const FIXTURE_SHA256 = "3b37fb001dc04e50c313f704ded1cddde8a405b27b72819a19a04eeb2c03986c";
type Entry = { verdict: string; source: string; checked: string; note?: string; copying?: string };
type Line = { url: string; slug: string; n: number };
const verdicts = () => JSON.parse(readFileSync(VERDICTS, "utf8")).sites as Record<string, Entry>;
const active = () => parseUrlList(readFileSync(URLS, "utf8")) as { url: string; slug: string }[];
/**
 * A prize list's lines, read by hand (n is the 1-based line number): render-watch's parser refuses the list whole,
 * because one rules URL is on sites.google.com (google.com is in TERMS_BARRED), which is why a dispatch takes only the
 * allowed sites' lines.
 */
const linesOf = (text: string): Line[] =>
  text
    .split("\n")
    .map((l, i) => ({ l, n: i + 1 }))
    .filter(({ l }) => l.trim() !== "" && !l.startsWith("#"))
    .map(({ l, n }) => {
      const [url, slug] = l.split("\t");
      return { url, slug, n };
    });
const audited = () => linesOf(readFileSync(FIXTURE, "utf8"));
const siteOfUrl = (url: string) => siteOf(new URL(url).hostname) as string;
/** The "# paused" lines of urls.txt, as robots-verdict.mjs reads them: URL and slug. */
const pausedLines = () =>
  readFileSync(URLS, "utf8")
    .split("\n")
    .map((l) => PAUSED_LINE.exec(l))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ url: m[1], slug: m[2], line: m[0] }));
/** ZERO-TESTS rows: number -> its URL cell (the third) and the whole row. */
const zeroRows = () => {
  const rows = new Map<number, { url: string; row: string }>();
  for (const row of readFileSync(ZERO, "utf8").split("\n")) {
    const m = row.match(/^\| (\d+) \| .*? \| (https?:\/\/\S+) \|/);
    if (m) rows.set(Number(m[1]), { url: m[2], row });
  }
  return rows;
};
/** The urls.txt comment line that cites ZERO-TESTS row n, and the line under it. */
const listedRow = (n: number) => {
  const text = readFileSync(URLS, "utf8").split("\n");
  const at = text.findIndex((l) => l.startsWith(`# research/channel-loop/ZERO-TESTS.md row ${n} — `));
  // The row's line is the one under its comment; a terms page re-queued by queue-zero-test --js --terms-shell has that
  // route's comment between them (ruling 6.10 row 21 (c)), and only that comment is stepped over.
  let i = at + 1;
  while (at >= 0 && i < text.length && text[i].startsWith(`# ${TERMS_SHELL_RULING} `)) i += 1;
  return { comment: at < 0 ? undefined : text[at], line: at < 0 ? undefined : text[i] };
};
/** urls.txt's header (everything before its first section rule), its comment lines unwrapped into one text. */
const urlsHeader = () => {
  const lines = readFileSync(URLS, "utf8").split("\n");
  const end = lines.findIndex((l) => l.startsWith("# ----"));
  return lines
    .slice(0, end)
    .map((l) => l.replace(/^#\s?/, ""))
    .join(" ")
    .replace(/\s+/g, " ");
};
/** Every line number in "ai-allowed-events.urls.txt@548be52:N, :M, ..." groups of a text. */
const pinnedLines = (text: string) => {
  const out: number[] = [];
  for (const m of text.matchAll(new RegExp(`ai-allowed-events\\.urls\\.txt@${PIN}:(\\d+)((?:, :\\d+)*)`, "g"))) {
    out.push(Number(m[1]), ...[...m[2].matchAll(/:(\d+)/g)].map((k) => Number(k[1])));
  }
  return out;
};
/** An email address, as the owner's grep looks for one: none may be written into a note (ruling R3 names kinds only). */
const ADDRESS = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/;

const AUDITED: Record<string, string> = {
  "adaptionlabs.ai": "TERMS_PENDING",
  "agenthon.net": "NO_TERMS",
  "aicrowd.com": "NO_TERMS",
  "aimo-interp.github.io": "CONDITIONAL_MET",
  "alignmentforum.org": "NO_TERMS",
  "ansperformance.eu": "CONDITIONAL_UNMET",
  "bcamlc.com": "NO_TERMS",
  "build-arena.github.io": "CONDITIONAL_MET",
  "codabench.org": "CONDITIONAL_UNMET",
  "crunchdao.com": "NO_TERMS",
  "devpost.com": "TERMS_PENDING",
  "drivendata.org": "NO_TERMS",
  "eurocontrol.int": "TERMS_PENDING",
  "flagos.io": "NO_TERMS",
  "fomo26.github.io": "CONDITIONAL_MET",
  "geminixprize.com": "NO_TERMS",
  "grand-challenge.org": "TERMS_PENDING",
  "health-data-hub.fr": "NO_TERMS",
  "ijcai.org": "NO_TERMS",
  "k12-ai-infrastructure.org": "NO_TERMS",
  "kaggle.com": "TERMS_PENDING",
  "lbl.gov": "CONDITIONAL_MET",
  "learn2design2026.com": "NO_TERMS",
  "microblink.com": "NO_TERMS",
  "mozilladatacollective.com": "NO_TERMS",
  "neural-interfaces26.github.io": "CONDITIONAL_MET",
  "opensky-network.org": "TERMS_PENDING",
  "openreview.net": "NOT_BARRED",
  "pasteurlabs.ai": "NO_TERMS",
  "realpdecompetition.github.io": "CONDITIONAL_MET",
  "robosyn-bench.net": "CONDITIONAL_MET",
  "roco-spring.github.io": "CONDITIONAL_MET",
  "situatedevals.org": "NO_TERMS",
  "solafune.com": "NO_TERMS",
  "sophelio.io": "NO_TERMS",
  "stanford.edu": "TERMS_PENDING",
  "szczurek-lab.github.io": "CONDITIONAL_MET",
  "theemailgame.com": "NO_TERMS",
  "thinkonward.com": "NO_TERMS",
  "virtualembryo.ai": "TERMS_PENDING",
  "wundernn.io": "NO_TERMS",
  "xiuwenz2.github.io": "CONDITIONAL_MET",
  "zindi.africa": "TERMS_PENDING",
};
/** The ten GitHub Pages sites (lbl.gov and robosyn-bench.net by CNAME): their verdicts rest on GitHub's terms. */
const PAGES = [
  "aimo-interp.github.io",
  "build-arena.github.io",
  "fomo26.github.io",
  "lbl.gov",
  "neural-interfaces26.github.io",
  "realpdecompetition.github.io",
  "robosyn-bench.net",
  "roco-spring.github.io",
  "szczurek-lab.github.io",
  "xiuwenz2.github.io",
];
/**
 * Ruling R3 (5.10): the Pages sites whose pages carry only role addresses (a project mailbox, a mailing list). A role
 * address is not personal information, so AUP §7's "non-personal" limb is met as for the other Pages sites, and the
 * verdict is CONDITIONAL_MET. The four that the tick 45 review had moved to CONDITIONAL_UNMET return; lbl.gov never left.
 */
const ROLE_ADDRESSES_ONLY = ["aimo-interp.github.io", "fomo26.github.io", "lbl.gov", "realpdecompetition.github.io", "roco-spring.github.io"];
/**
 * Ruling R3: the Pages site whose page carries a named individual's address. The verifiers' condition is "redact
 * addresses before commit" (tick 45 review, defect 1); render-watch committed every capture and masked no address, so
 * the runner did not meet it: CONDITIONAL_UNMET, as mozilla.org (RULING-2026-10-04-mozilla-precondition.md §3 rule 3),
 * until render-watch masked addresses before it commits a capture. The masking fold (5.10, tick 48) made it do so, and
 * the site is CONDITIONAL_MET.
 */
const NAMED_ADDRESSES = ["xiuwenz2.github.io"];
/** The five Pages sites the tick 45 review moved to CONDITIONAL_UNMET because their pages carry email addresses. */
const REVIEW_FIVE = ["aimo-interp.github.io", "fomo26.github.io", "realpdecompetition.github.io", "roco-spring.github.io", "xiuwenz2.github.io"];
/**
 * Ruling R1 (5.10): the nine NO_TERMS sites the review had left short of exhaustive-negative, six because GitHub code
 * search was not run and three because their auditors probed Open Terms Archive in eight declarations repos only (their
 * verifiers covered 17 of the organisation's 18 declarations repos; the eighteenth, template-declarations, a template
 * holding only Open Terms Archive.json, was checked 5.10 at 3332fbe by the tick 45 checker and names none of the nine).
 * Code search is outside this session's scope and the ruling does not require it, so each note now opens
 * "exhaustive-negative" and each site has one robots.txt probe.
 */
const RULED_EXHAUSTIVE = [
  "agenthon.net",
  "alignmentforum.org",
  "bcamlc.com",
  "flagos.io",
  "geminixprize.com",
  "health-data-hub.fr",
  "ijcai.org",
  "k12-ai-infrastructure.org",
  "mozilladatacollective.com",
];
/**
 * The Open Terms Archive coverage the three notes record (the tick 45 checker, 5.10): the organisation lists 18
 * *-declarations repos, and the verifiers of health-data-hub.fr, ijcai.org and mozilladatacollective.com probed 17.
 */
const OTA_LISTING = "17 of the organisation's 18; template-declarations (a template, only Open Terms Archive.json) checked 5.10 at 3332fbe: no match";
/** The verified record's own reason for withholding the label from mozilladatacollective.com (not GitHub code search). */
const MDC_WITHHELD = "'Not exhaustive-negative: the platform operator's terms very likely exist, but no GitHub file cites them.'";
/** The READMEs health-data-hub.fr's verified record names as read, of the 8 results of its README search. */
const HDH_READMES =
  "repository search '\"health-data-hub.fr\" in:readme' (8 results; the READMEs of six read: boas-explorer, AllergenChipChallenge, datahub-healthdcat-ap-exporter, meetup-hdh-22--2024, OMOP_HDH and depot_git";
/** Ruling R1's test, as the audit note's "Verdicts" paragraph states it. */
const R1_DEFINITION =
  "the site's record shows a search of every Open Terms Archive declarations repository (the organisation's full listing), tosdr/tosdr-snapshots, the site's own GitHub presence, and research/ and docs/ of this repository";
/** The six probes the review had paused (rows 245-253) and ruling R1 restored. */
const UNPAUSED_PROBES = [245, 247, 249, 250, 252, 253];
/** The three probes ruling R1 queued: sites that never had one. */
const NEW_PROBES = [
  { row: 262, site: "health-data-hub.fr", url: "https://www.health-data-hub.fr/robots.txt", slug: "robots-health-data-hub" },
  { row: 263, site: "ijcai.org", url: "https://2026.ijcai.org/robots.txt", slug: "robots-ijcai-2026" },
  { row: 264, site: "mozilladatacollective.com", url: "https://competitions.mozilladatacollective.com/robots.txt", slug: "robots-mozilladatacollective" },
];
/** The comment every active probe line of this audit carries in urls.txt; the rows ruling R1 queued say so. */
const PROBE_COMMENT =
  /^# research\/channel-loop\/ZERO-TESTS\.md row \d+ — exhaustive-negative NO_TERMS site( \(ruling R1, 5\.10\))?; the probe scripts\/robots-verdict\.mjs reads; no rules page is fetched before it \(5\.10\.2026\)\.$/;
/**
 * The audit note's "Main-thread rulings" section, line for line from its heading to the next section: the three rulings
 * as the main thread gave them in tick 45 (Fable 5.1, 5.10.2026; recorded in 7befaa6), and R4 as it gave it in tick 47 (a
 * rules URL observed in the site's own source repository at a pinned commit is observed, not guessed). A changed word in a
 * ruling fails the test.
 */
const RULINGS_SECTION = [
  "## Main-thread rulings (5.10.2026, tick 45; Fable 5.1, the session model)",
  "",
  "**R1. Exhaustive-negative does not require GitHub code search.** Ruling 30.9 16(d) D2(iv) (research/channel-loop/RULING-2026-09-30-video.md:84-87) defines exhaustive-negative as \"a recorded search found none\"; nevo is its example, not its definition. GitHub-wide code search is outside this session's repository scope (logs/CHANNEL_LOOP.md §9, tick-36 item 6 and 4.10 item 7), so a definition that needs it would make the label unreachable for every site and leave D2(v) a dead letter. From 5.10 a NO_TERMS site is exhaustive-negative when its record shows a search of: every Open Terms Archive declarations repository (the organisation's full listing), tosdr/tosdr-snapshots, the site's own GitHub presence (organisation and repositories found by repository search, their contents grepped for terms, legal, privacy, impressum and mentions légales), and this repository (research/, docs/). A record that says only \"GitHub code search was unavailable\" describes every search this loop can make, not a thin one. Consequence: agenthon.net, alignmentforum.org, bcamlc.com, flagos.io, geminixprize.com, k12-ai-infrastructure.org, health-data-hub.fr, ijcai.org and mozilladatacollective.com are exhaustive-negative on their verifiers' records; the six paused probes are active again and three probes are queued (www.health-data-hub.fr, 2026.ijcai.org, competitions.mozilladatacollective.com). mozilladatacollective.com's note keeps both readings (DrivenData's platform serves the pages; Mozilla's Websites Terms of Use set aside third-party apps) and says the probe reads only robots.txt; if its robots.txt allows the paths, the rules pages are fetched under the same address rule as R3.",
  "",
  "**R2. grand-challenge.org's terms URL.** urls.txt's one rule exists to stop guessed URLs. A URL built from the platform's own source at a pinned commit, whose template line and production-domain lines are each cited, is a derivation, not a guess, and the one page it names is the terms page the gate exists to let a TERMS_PENDING site show. Admitted as a narrow exception, for terms- lines only: research/rendered/urls.txt's header gains, after its one rule, the sentence \"Exception (ruling 5.10.2026, tick 45, TERMS-AUDIT-2026-10-05-prize-events.md): a terms- line of a TERMS_PENDING site may carry a URL derived from the site's own source code at a pinned commit when its comment cites the template line and the domain line; a 404, or a redirect to another host, retires the line. Never a rules page.\" If a verbatim occurrence of https://grand-challenge.org/policies/terms-of-service/ exists at github grade, cite it instead and the exception is not needed for this line. Row 237 is active again either way.",
  "",
  "**R3. Personal versus role addresses.** The \"non-personal\" limb of GitHub AUP §7 (github.com's condition) concerns personal information. An organisation's, project's or mailing-list address (a project mailbox at an institution, a group list, info@ or contact@) is a role address and not personal information; a named individual's address is. lbl.gov stays CONDITIONAL_MET. Of the five Pages sites moved to CONDITIONAL_UNMET in review (aimo-interp, fomo26, realpdecompetition, roco-spring, xiuwenz2): a site whose pages carry only role addresses returns to CONDITIONAL_MET; a site carrying a named individual's address stays CONDITIONAL_UNMET until render-watch masks addresses before it commits a capture (queued by the main thread in §9 as the next maintenance item; the test the fixer wrote is its signal). Each of the five notes records the kind of address found (never the address itself).",
  "",
  "**R4 (tick 47, 5.10). A rules URL observed in the site's own source repository at a pinned commit is observed, not guessed.** The reading rule in `research/measurements/ai-allowed-events.md` (step 2) admits a rules page the list does not give only when \"its URL now appears in a capture\"; its purpose, like `urls.txt`'s one rule, is to stop guessed URLs. RoCo-Spring's rulebook, `rules-faq.html`, is linked from none of the site's pages (home, participate, call for papers, team registration, evaluation, tasks and data, all captured) and sits in the site's Pages repository, `roco-spring/roco-spring.github.io` at `fca18b99fb10ac871d7dcb1e1b79a8ca78e759ad`, which GitHub Pages serves at the same path by construction. That is an observation of the site's own source, the derivation R2 admits for a terms- line, with no gate exception needed here: the site is CONDITIONAL_MET and the page passes `termsGate` on its own. Admitted for allowed sites only, cited to the repository and commit in the tick log, and the page is still read only from its render-watch capture (`research/rendered/prize-roco-spring-github-io-rules-faq-html-f25b6745.txt`). The intake template's step-2 sentence is to say so (`logs/CHANNEL_LOOP.md` §9, tick-47 item 5).",
  "",
];
/**
 * The render groups of the audit note's "What the reading can render", in order: the opening of each group's bullet, and
 * which rules URLs of the fixture belong to it (by the verdict of the URL's site; `probe` is the state of the site's active
 * robots- line in urls.txt: "captured" when research/rendered/<slug>.meta.json exists, "queued" when the weekly run has
 * not fetched it yet, null when the site has none). The last group held xiuwenz2.github.io until the masking fold (5.10,
 * tick 48) made it CONDITIONAL_MET; it is empty now, and the note's bullet says 0 URLs. The second group is the robots
 * verdicts of 6.10 (tick 54): a NO_TERMS site scripts/robots-verdict.mjs set to NO_TERMS_ROBOTS_OK leaves the fourth group,
 * which on 5.10 held all 21 probed sites, for it. The terms read of 6.10 (tick 54) moved the third group's nine sites:
 * virtualembryo.ai to "Now", eurocontrol.int to the fifth (its probe queued, not yet fetched), and the five the reading
 * shut to the sixth (BARRED, CONDITIONAL_UNMET or refusal-type, checked 6.10); the seventh keeps the sites graded before.
 * Later on 6.10 kaggle.com's shell was rendered once in js mode and read (BARRED), so its 17 URLs moved from the third
 * group to the sixth, whose heading now names the js render too. Tick 55 added a fourth group, "Terms link found after
 * the verdict": a TERMS_PENDING site whose source keeps an earlier verdict it replaced (agenthon.net's NO_TERMS_ROBOTS_OK,
 * eurocontrol.int's NO_TERMS), which the shell group no longer holds; the groups after it moved down one, and the note's
 * earlier lines give it 0. agenthon.net left "Now, on robots.txt" for it, and eurocontrol.int "Robots probe queued". The
 * counts test reads the groups five times, with the verdicts as they are, as tick54() gives them (after the js render,
 * before the terms links were found), as jsReadBefore() gives them (after the terms read, before the js render), as
 * termsReadBefore() gives them (after the robots verdicts, before the terms read) and as tick45() gives them, and the note
 * states all five.
 */
type Probe = "captured" | "queued" | null;
/** A TERMS_PENDING entry reopened by tick 55: its source keeps the earlier verdict's source after BEFORE or ROBOTS_OK_BEFORE. */
const reopened = (e: Entry) => e.source.includes(BEFORE) || e.source.includes(ROBOTS_OK_BEFORE);
const RENDER_GROUPS: { opens: string; holds: (site: string, e: Entry, probe: Probe) => boolean }[] = [
  { opens: "- **Now: ", holds: (_, e) => ["CONDITIONAL_MET", "NOT_BARRED"].includes(e.verdict) },
  { opens: "- **Now, on robots.txt ", holds: (_, e) => isRobotsOkVerdict(e) },
  { opens: "- **Terms page a shell after the 6.10 fetch ", holds: (_, e) => e.verdict === "TERMS_PENDING" && !reopened(e) },
  { opens: "- **Terms link found after the verdict, terms page queued ", holds: (_, e) => e.verdict === "TERMS_PENDING" && reopened(e) },
  { opens: "- **Probed 6.10, NO_TERMS_ROBOTS_OK not set ", holds: (_, e, probe) => isExhaustiveNegative(e) && probe === "captured" },
  { opens: "- **Robots probe queued for the next weekly run ", holds: (_, e, probe) => isExhaustiveNegative(e) && probe === "queued" },
  {
    opens: "- **Shut by the 6.10 terms fetch and the once-only js render ",
    holds: (_, e) =>
      e.checked === TERMS_CHECKED &&
      (e.verdict === "BARRED" || e.verdict === "CONDITIONAL_UNMET" || (e.verdict === "NO_TERMS" && /^refusal-type\b/.test(e.note ?? ""))),
  },
  {
    opens: "- **Graded with no capture, on their terms: ",
    holds: (site, e) =>
      e.checked !== TERMS_CHECKED && (e.verdict === "BARRED" || (e.verdict === "CONDITIONAL_UNMET" && !NAMED_ADDRESSES.includes(site))),
  },
  {
    opens: "- **Graded with no capture until render-watch masks addresses before commit: ",
    holds: (site, e) => e.verdict === "CONDITIONAL_UNMET" && NAMED_ADDRESSES.includes(site),
  },
];
/** grand-challenge.org's terms line, admitted by ruling R2 as a URL derived from the platform's own source. */
const DERIVED_TERMS = { site: "grand-challenge.org", url: "https://grand-challenge.org/policies/terms-of-service/", slug: "terms-grand-challenge", row: 237 };
/** Ruling R2's sentence, which urls.txt's header carries directly after its one rule. */
const EXCEPTION =
  "Exception (ruling 5.10.2026, tick 45, TERMS-AUDIT-2026-10-05-prize-events.md): a terms- line of a TERMS_PENDING site may carry a URL derived from the site's own source code at a pinned commit when its comment cites the template line and the domain line; a 404, or a redirect to another host, retires the line. Never a rules page.";

/**
 * Tick 54 (6.10.2026): the 17 NO_TERMS sites scripts/robots-verdict.mjs set to NO_TERMS_ROBOTS_OK, run with --apply and
 * --urls research/measurements/ai-allowed-events.urls.txt on the robots.txt captures of the 6.10 weekly render (5f4853a).
 * Eleven served a robots.txt; six answered 404 (ROBOTS_404), for which render-watch stores no body, so the source names the
 * capture's .meta.json and no sha256 (RFC 9309 §2.3.1.3: no rules).
 */
const ROBOTS_OK_TICK54 = [
  "agenthon.net",
  "aicrowd.com",
  "alignmentforum.org",
  "bcamlc.com",
  "crunchdao.com",
  "drivendata.org",
  "geminixprize.com",
  "health-data-hub.fr",
  "ijcai.org",
  "k12-ai-infrastructure.org",
  "learn2design2026.com",
  "microblink.com",
  "pasteurlabs.ai",
  "solafune.com",
  "sophelio.io",
  "thinkonward.com",
  "wundernn.io",
];
/**
 * Tick 55 (6.10.2026): agenthon.net's NO_TERMS_ROBOTS_OK was taken back (TERMS_PENDING again: a terms link found after the
 * verdict, LINKS_FOUND below), so 16 of the 17 hold it now. The "tick 54" blocks read ROBOTS_OK_TICK54 in tick54()'s state.
 */
const ROBOTS_OK = ROBOTS_OK_TICK54.filter((site) => site !== "agenthon.net");
const ROBOTS_404 = ["bcamlc.com", "learn2design2026.com", "microblink.com", "pasteurlabs.ai", "solafune.com", "thinkonward.com"];
/**
 * The four NO_TERMS sites the script declined on 6.10, the capture it read for each, and what in that capture says no:
 * "html", a 200 that answered an HTML page at /robots.txt (not a robots.txt the site served; ruling D2(iv): the site's
 * answer); "unreachable", a fetch with no answer (RFC 9309 §2.3.1.4: complete disallow); "disallowed", a robots.txt whose
 * rules disallow the queued paths.
 */
const ROBOTS_NOT_SET: Record<string, { slug: string; why: "html" | "unreachable" | "disallowed" }> = {
  "flagos.io": { slug: "robots-flagos", why: "html" },
  "mozilladatacollective.com": { slug: "robots-mozilladatacollective", why: "disallowed" },
  "situatedevals.org": { slug: "robots-situatedevals", why: "unreachable" },
  "theemailgame.com": { slug: "robots-theemailgame", why: "html" },
};
const ROBOTS_CHECKED = "2026-10-06";
const RULING_D2V = "research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v)";
/** What scripts/robots-verdict.mjs puts between its own source and the NO_TERMS source it replaced. */
const BEFORE = "; NO_TERMS before: ";
/**
 * The 17 NO_TERMS sources tick 45 wrote, which each NO_TERMS_ROBOTS_OK source keeps after "; NO_TERMS before: ": the
 * sha256 of one "<site>\t<source>" line per site, in ROBOTS_OK order, joined by "\n". Checked at tick 54 against
 * terms-verdicts.json at 5f4853a, the file before the script ran, where each was the entry's whole source (and each note
 * was the note it has now). tick45() reads the source back out of the robots source, so without this pin a changed
 * tick-45 source would be read back changed and pass.
 */
const TICK45_SOURCES_SHA256 = "8883d8aa97ad830158d48142f8a85ce35ad331a107afded91992ea1424e553ef";
/**
 * The verdicts as tick 45 left them: each NO_TERMS_ROBOTS_OK entry read back to the NO_TERMS entry the script rewrote
 * (the source after "; NO_TERMS before: ", and the note it kept); every other entry as it is. The script replaced
 * `checked`, so a NO_TERMS_ROBOTS_OK entry no longer holds tick 45's date: tick45() puts back 2026-10-05, the date every
 * audited entry carried at 5f4853a, as a constant, not a reading. A test that asserts tick 45's `checked` reads it from an
 * entry the script did not touch.
 */
const tick45 = (v: Record<string, Entry>): Record<string, Entry> =>
  Object.fromEntries(
    Object.entries(termsReadBefore(v)).map(([site, e]) => {
      if (e.verdict !== "NO_TERMS_ROBOTS_OK") return [site, e];
      const at = e.source.indexOf(BEFORE);
      const before: Entry = { verdict: "NO_TERMS", source: at < 0 ? "" : e.source.slice(at + BEFORE.length), checked: "2026-10-05" };
      return [site, e.note === undefined ? before : { ...before, note: e.note }];
    }),
  );
/**
 * Tick 54 (6.10.2026): the nine sites whose terms page the 6.10 render captured, and their verdicts after the reading.
 * All nine were TERMS_PENDING on 5.10. Seven changed verdict on the plain fetch, and kaggle.com later the same day on the
 * once-only js render of its shell (the "shell terms pages" block); their sources end in TERMS_BEFORE and the tick-45
 * source. adaptionlabs.ai kept its verdict (a shell is no reading), and only its note and checked date changed.
 */
const TERMS_READ: Record<string, string> = {
  "devpost.com": "BARRED",
  "zindi.africa": "BARRED",
  "grand-challenge.org": "CONDITIONAL_UNMET",
  "stanford.edu": "CONDITIONAL_UNMET",
  "virtualembryo.ai": "NOT_BARRED",
  "eurocontrol.int": "NO_TERMS",
  "opensky-network.org": "NO_TERMS",
  "kaggle.com": "BARRED",
  "adaptionlabs.ai": "TERMS_PENDING",
};
const TERMS_CHECKED = "2026-10-06";
/** What the tick-54 fold puts between a read entry's new source and the TERMS_PENDING source it replaced. */
const TERMS_BEFORE = "; TERMS_PENDING before: ";
/**
 * The nine TERMS_PENDING sources tick 45 wrote, which the eight changed sources keep after TERMS_BEFORE and adaptionlabs.ai's
 * shell keeps whole: the sha256 of one "<site>\t<source>" line per site, in TERMS_READ order, joined by "\n". Checked at tick 54
 * against terms-verdicts.json at 227b3cb, the file before the fold.
 */
const TICK45_TERMS_SOURCES_SHA256 = "b70ca8c699288f7151bd537d1500698f305a8edb9b6da5efcb7ea3c0eed755fa";
/**
 * The verdicts as they stood after the robots verdicts of 6.10 and before the terms read: each of the nine TERMS_READ entries
 * read back to the TERMS_PENDING entry tick 45 left (its source after TERMS_BEFORE, or its whole source for adaptionlabs.ai,
 * checked 2026-10-05 as every audited entry was at 227b3cb, a constant); every other entry as it is.
 */
/**
 * Each of the nine sites' terms- line in urls.txt after the 6.10 reading: "active", or the comment that now precedes
 * " — <url>\t<slug>" (queue-zero-test.mjs --apply-verdicts paused them; the reason was then reworded by hand where
 * the verdict came from reading the terms, in a form urls-pause-comments.mjs keeps; opensky's took the Knesset line's form).
 * kaggle.com's is the once-only js line (js: the line ends "\tjs"), retired after its render in the form the main thread
 * gave (no script writes a "# retired" line), with the js flag kept so the route's once-only check still sees it.
 */
const TERMS_LINES: Record<string, { slug: string; state: string; js?: boolean }> = {
  "kaggle.com": {
    slug: "terms-kaggle",
    state: "# retired (6.10.2026: rendered once in js mode under ruling 6.10 row 21 (c) 3(2); read, kaggle.com BARRED — see TERMS_BARRED in scripts/render-watch.mjs)",
    js: true,
  },
  "devpost.com": { slug: "terms-devpost", state: "# paused (terms audit): devpost.com — see TERMS_BARRED in scripts/render-watch.mjs" },
  "grand-challenge.org": {
    slug: "terms-grand-challenge",
    state: "# paused (terms read, left paused, 6.10.2026): grand-challenge.org is CONDITIONAL_UNMET in research/channel-loop/terms-verdicts.json",
  },
  "zindi.africa": { slug: "terms-zindi", state: "# paused (terms audit): zindi.africa — see TERMS_BARRED in scripts/render-watch.mjs" },
  "stanford.edu": {
    slug: "terms-stanford",
    state: "# paused (terms read, left paused, 6.10.2026): stanford.edu is CONDITIONAL_UNMET in research/channel-loop/terms-verdicts.json",
  },
  "adaptionlabs.ai": { slug: "terms-adaptionlabs", state: "active" },
  "virtualembryo.ai": { slug: "terms-virtualembryo", state: "active" },
  "eurocontrol.int": {
    slug: "terms-eurocontrol",
    // Since tick 55 the site is TERMS_PENDING again, and scripts/urls-pause-comments.mjs --fix rewrote the verdict word; the
    // line stays paused as read (a privacy notice), though a TERMS_PENDING site's terms- line passes the gate.
    state:
      "# paused (terms read: a privacy notice, no site terms, 6.10.2026; verdict as of 6.10.2026): eurocontrol.int is TERMS_PENDING in research/channel-loop/terms-verdicts.json",
  },
  "opensky-network.org": { slug: "terms-opensky", state: "# retired (ruling 30.9 16(d) D2(iv): the site refused the runner)" },
};
/** eurocontrol.int's robots.txt probe, queued by queue-zero-test.mjs at tick 54 (ruling R1: exhaustive-negative NO_TERMS). */
const EURO_PROBE = { row: 265, site: "eurocontrol.int", url: "https://www.eurocontrol.int/robots.txt", slug: "robots-eurocontrol" };
/** What the tick-55 fold puts between agenthon.net's new source and the NO_TERMS_ROBOTS_OK source it replaced. */
const ROBOTS_OK_BEFORE = "; NO_TERMS_ROBOTS_OK before: ";
/** The tick-54 entries of the two sites tick 55 reopened, as terms-verdicts.json held them at LINKS_BASE. */
const LINKS_FIXTURE = "src/__tests__/revenue/fixtures/terms-verdicts-364bf71-links-found.json";
const LINKS_FIXTURE_SHA256 = "22064332bfc874b7b9d178c6b518976a15cb9425edd74cf7c29bef6f5f4c9cb4";
const LINKS_BASE = "364bf71";
/** The frozen copies the two links were observed in: agenthon.net's frozen in tick 55, eurocontrol.int's in tick 54. */
const AGENTHON_COPY = "research/rendered/prize-www-agenthon-net-ref-mlcontests-7f4f65c9-2026-10-06";
const EURO_COPY = "research/rendered/terms-eurocontrol-2026-10-06";
/**
 * The comment each reopened site's robots.txt probe is paused under: queue-zero-test.mjs --apply-verdicts wrote "# paused
 * (terms unread): ...", and the reason was reworded by hand (no script writes it) in a form urls-pause-comments.mjs keeps.
 */
const PROBE_PAUSED = (site: string) =>
  `# paused (terms unread: TERMS_PENDING again since a terms link was found after the verdict, the probe waits on the terms reading, 6.10.2026): ${site} is TERMS_PENDING in research/channel-loop/terms-verdicts.json`;
/**
 * Tick 55 (6.10.2026): the two sites a terms link found after the verdict reopened (logs/CHANNEL_LOOP.md §9, "Queued 6.10
 * (tick 54)" item 1). For each: the verdict tick 54 left and the separator after which the new source keeps the tick-54
 * source; the terms URL the new source names first, the terms- line's slug, its ZERO-TESTS row and candidate cell; the
 * frozen-copy lines the link was observed on (the link first), with words each holds; its robots.txt probe, paused; and its
 * rules lines in the fixture.
 */
type Found = {
  before: string;
  marker: string;
  url: string;
  slug: string;
  row: number;
  candidate: string;
  observed: { file: string; line: number; words: string }[];
  probe: { row: number; url: string; slug: string };
  rules: number[];
};
const LINKS_FOUND: Record<string, Found> = {
  "agenthon.net": {
    before: "NO_TERMS_ROBOTS_OK",
    marker: ROBOTS_OK_BEFORE,
    url: "https://www.agenthon.net/terms/",
    slug: "terms-agenthon",
    row: 266,
    candidate: "terms audit (tick 55): agenthon.net, a terms link found after the robots verdict, before the prize-event rules read (BOARD-LOOP §13)",
    observed: [
      { file: `${AGENTHON_COPY}.html`, line: 2582, words: '<a href="/terms/">Terms</a>' },
      { file: `${AGENTHON_COPY}.html`, line: 2583, words: '<a href="/privacy/">Privacy</a>' },
      { file: `${AGENTHON_COPY}.html`, line: 2584, words: '<a href="/licensing/">Licensing</a>' },
      { file: `${AGENTHON_COPY}.txt`, line: 1951, words: "Terms" },
      { file: `${AGENTHON_COPY}.txt`, line: 1953, words: "Licensing" },
      { file: `${AGENTHON_COPY}.html`, line: 2581, words: '<a href="/rules/">Rules</a>' },
    ],
    probe: { row: 247, url: "https://www.agenthon.net/robots.txt", slug: "robots-agenthon" },
    rules: [173],
  },
  "eurocontrol.int": {
    before: "NO_TERMS",
    marker: BEFORE,
    url: "https://www.eurocontrol.int/info/disclaimers",
    slug: "terms-eurocontrol-disclaimers",
    row: 267,
    candidate: "terms audit (tick 55): eurocontrol.int, a terms link found after the terms read, before the prize-event rules read (BOARD-LOOP §13)",
    observed: [
      { file: `${EURO_COPY}.html`, line: 1961, words: '<a href="/info/disclaimers"' },
      { file: `${EURO_COPY}.html`, line: 2830, words: '<a href="/info/disclaimers"' },
      { file: `${EURO_COPY}.txt`, line: 433, words: "Disclaimers" },
    ],
    probe: { row: EURO_PROBE.row, url: EURO_PROBE.url, slug: EURO_PROBE.slug },
    rules: [162],
  },
};
/** ansperformance.eu's note named eurocontrol.int's verdict: tick 55 changed that one parenthetical and nothing else of it. */
const ANS_TICK54 = "(eurocontrol.int's entry, NO_TERMS since 6.10)";
const ANS_NOW = "(eurocontrol.int's entry: NO_TERMS on 6.10, TERMS_PENDING again since tick 55, when its footer's unread Disclaimers page was found)";
/** The verdicts as tick 54 left them: the two reopened entries put back from the fixture, every other entry as it is. */
const tick54 = (v: Record<string, Entry>): Record<string, Entry> => ({
  ...v,
  ...(JSON.parse(readFileSync(LINKS_FIXTURE, "utf8")) as Record<string, Entry>),
});
const termsReadBefore = (v: Record<string, Entry>): Record<string, Entry> =>
  Object.fromEntries(
    Object.entries(tick54(v)).map(([site, e]) => {
      if (!Object.hasOwn(TERMS_READ, site)) return [site, e];
      const at = e.source.indexOf(TERMS_BEFORE);
      return [site, { verdict: "TERMS_PENDING", source: at < 0 ? e.source : e.source.slice(at + TERMS_BEFORE.length), checked: "2026-10-05" }];
    }),
  );
/**
 * The verdicts as they stood after the terms read of 6.10 and before kaggle.com's once-only js render: kaggle.com
 * TERMS_PENDING (its tick-45 source, read back after TERMS_BEFORE; checked 2026-10-06, the day its note recorded the
 * plain shell), every other entry as tick54() gives it.
 */
const jsReadBefore = (v: Record<string, Entry>): Record<string, Entry> => ({
  ...tick54(v),
  "kaggle.com": { ...termsReadBefore(v)["kaggle.com"], checked: TERMS_CHECKED },
});
type Cited =
  | { kind: "file"; path: string; slug: string; url: string; fetchedAt: string; sha12: string; n: number }
  | { kind: "absent"; status: number; path: string; slug: string; url: string; fetchedAt: string; n: number };
/** The capture a NO_TERMS_ROBOTS_OK source names, in the two forms scripts/robots-verdict.mjs writes; null otherwise. */
const citedCapture = (source: string): Cited | null => {
  const tail = String.raw` queued paths? allowed for MehudakRenderWatch \(scripts\/robots-verdict\.mjs\); ruling `;
  const file = source.match(
    new RegExp(String.raw`^robots\.txt read at (research\/rendered\/(robots-[a-z0-9.-]+)\.txt) \((https:\/\/[^\s,()]+\/robots\.txt), fetched ([0-9T:.Z-]+), sha256 ([0-9a-f]{12})\): all (\d+)` + tail),
  );
  if (file) return { kind: "file", path: file[1], slug: file[2], url: file[3], fetchedAt: file[4], sha12: file[5], n: Number(file[6]) };
  const absent = source.match(
    new RegExp(String.raw`^robots\.txt answered (404|410) at (https:\/\/\S+\/robots\.txt) \((research\/rendered\/(robots-[a-z0-9.-]+)\.meta\.json), fetched ([0-9T:.Z-]+)\): no rules, RFC 9309 §2\.3\.1\.3: all (\d+)` + tail),
  );
  if (absent) return { kind: "absent", status: Number(absent[1]), url: absent[2], path: absent[3], slug: absent[4], fetchedAt: absent[5], n: Number(absent[6]) };
  return null;
};
/** The rules URLs of one site in the fixture, in file order. */
const rulesOf = (site: string) => audited().filter((e) => siteOfUrl(e.url) === site);
type Capture = {
  slug: string;
  meta: Record<string, unknown> & {
    url: string;
    slug: string;
    fetchedAt: string;
    status: number | null;
    contentType: string | null;
    sha256: string | null;
    byteLength: number;
    bodyPath: string | null;
    error: string | null;
    frozen?: { on: string; from: string; commit: string | null; why: string };
  };
  body: string | null;
};
/**
 * The robots.txt captures the script read on 6.10, as their dated frozen copies (scripts/freeze-capture.mjs, at the tick-54
 * review): the 21 of the 6.10 weekly render, each "<live slug>-2026-10-06" as commit 5f4853a stored it, and nevo's of 30.9,
 * "robots-nevo-2026-09-30" as commit e839268 stored it (frozen at tick 38). The script read the live captures (it never
 * reads a frozen copy); every source and every table row names the frozen copy, which no urls.txt line names, so the weekly
 * render, which rewrites a live capture whenever its body changes, never moves what these tests hold.
 */
const FROZEN_ON = "2026-10-06";
const RENDER_COMMIT = "5f4853a";
const NEVO_FROZEN = { slug: "robots-nevo-2026-09-30", live: "robots-nevo", commit: "e839268" };
/** The frozen copy a source or a table row names by one of its files (<slug>.txt, .html or .meta.json), read as the script reads a capture. */
const frozenCapture = (path: string): Capture => {
  const m = path.match(/^research\/rendered\/(robots-[a-z0-9.-]+?)\.(?:txt|html|meta\.json)$/);
  expect(m, path).not.toBeNull();
  const slug = m![1];
  const meta = JSON.parse(readFileSync(`research/rendered/${slug}.meta.json`, "utf8")) as Capture["meta"];
  return { slug, meta, body: meta.bodyPath ? readFileSync(meta.bodyPath, "utf8") : null };
};
/**
 * A frozen copy of the live capture <live> as <commit> stored it: its meta names itself and where it came from, and the body
 * is the bytes its sha256 and byteLength are of (FROZEN.sha256 holds every file; frozen-citations.test.ts checks that).
 */
const expectFrozenCopy = (cap: Capture, live: string, commit: string, label: string) => {
  expect(cap.meta.slug, label).toBe(cap.slug);
  expect(cap.meta.frozen?.from, label).toBe(`research/rendered/${live}.meta.json`);
  expect(cap.meta.frozen?.commit, label).toBe(commit);
  if (cap.meta.bodyPath !== null) {
    expect(cap.meta.bodyPath, label).toMatch(new RegExp(`^research/rendered/${cap.slug.replace(/\./g, "\\.")}\\.(txt|html)$`));
    const bytes = readFileSync(cap.meta.bodyPath);
    expect(createHash("sha256").update(bytes).digest("hex"), label).toBe(cap.meta.sha256);
    expect(bytes.length, label).toBe(cap.meta.byteLength);
  }
};
/** judgeSite's readCapture, given one frozen copy: that copy for its own robots.txt URL, nothing for any other. */
const readerOf = (cap: Capture) => (url: string) => (url === cap.meta.url ? cap : null);
/** "Eleven", "six": the number words the audit note's prose uses. */
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen"];
const numberWord = (w: string) => NUMBER_WORDS.indexOf(w.toLowerCase());
/** How the audit note's robots table quotes the rule that decided a path ("no rule matches" when none did). */
const quoteRule = (rule: { allow: boolean; pattern: string } | null) => (rule ? `\`${rule.allow ? "Allow" : "Disallow"}: ${rule.pattern}\`` : "no rule matches");

describe("tick 45: the prize-event sites' terms verdicts", () => {
  it("audits the list as it stood at 548be52, kept byte for byte as a fixture", () => {
    const bytes = readFileSync(FIXTURE);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(FIXTURE_SHA256);
    let blob: Buffer | null = null;
    try {
      blob = execFileSync("git", ["show", `${PIN}:${PRIZE_URLS}`], { stdio: ["ignore", "pipe", "ignore"] });
    } catch {
      blob = null; // a shallow CI checkout has no 548be52; the pinned sha256 above still holds the fixture
    }
    if (blob !== null) expect(blob.equals(bytes)).toBe(true);
  });

  it("judges every site of the 101 audited rules URLs: the 43 audited here, github.com and google.com before", () => {
    const lines = audited();
    expect(lines).toHaveLength(101);
    const sites = new Set(lines.map((e) => siteOfUrl(e.url)));
    expect([...sites].sort()).toEqual([...Object.keys(AUDITED), "github.com", "google.com"].sort());
    // As tick 54 left them: tick 55 reopened two sites, and the "tick 55" block holds those as they are.
    const v = tick54(verdicts());
    const then = tick45(v);
    for (const [site, verdict] of Object.entries(AUDITED)) {
      // As tick 45 judged it...
      expect(then[site]?.verdict, site).toBe(verdict);
      expect(then[site].source, site).toContain("TERMS-AUDIT-2026-10-05-prize-events.md");
      // ...and as it is: unchanged (checked still tick 45's date), or (6.10, tick 54) one of the 17 NO_TERMS sites
      // scripts/robots-verdict.mjs set NO_TERMS_ROBOTS_OK, whose source still ends in the tick-45 one and whose `checked`
      // is the script's date ("tick 54" below holds the rest). tick45()'s `checked` for those 17 is a constant, so it is
      // not asserted here.
      if (ROBOTS_OK_TICK54.includes(site)) {
        expect(verdict, site).toBe("NO_TERMS");
        expect(v[site].verdict, site).toBe("NO_TERMS_ROBOTS_OK");
        expect(v[site].checked, site).toBe(ROBOTS_CHECKED);
        expect(v[site].source.endsWith(`${BEFORE}${then[site].source}`), site).toBe(true);
      } else if (Object.hasOwn(TERMS_READ, site)) {
        // 6.10 (tick 54): one of the nine terms pages read or tried; its source keeps tick 45's after TERMS_BEFORE, or
        // whole for adaptionlabs.ai's shell ("tick 54: the terms read on 6.10" and "the shell terms pages" below hold the rest).
        expect(verdict, site).toBe("TERMS_PENDING");
        expect(v[site].verdict, site).toBe(TERMS_READ[site]);
        expect(v[site].checked, site).toBe(TERMS_CHECKED);
        if (v[site].verdict === "TERMS_PENDING") expect(v[site].source, site).toBe(then[site].source);
        else expect(v[site].source.endsWith(`${TERMS_BEFORE}${then[site].source}`), site).toBe(true);
      } else {
        expect(then[site], site).toBe(v[site]);
        expect(v[site].verdict, site).toBe(verdict);
        expect(v[site].checked, site).toBe("2026-10-05");
      }
    }
    expect(v["github.com"].verdict).toBe("CONDITIONAL_MET");
    expect(v["google.com"].verdict).toBe("BARRED");
  });

  it("cites the prize list only pinned to 548be52, and every cited line is a rules URL of the site that cites it", () => {
    // No decision file cites the weekly-rewritten list by line without a pin (the job's own files excepted).
    const unpinned = /ai-allowed-events\.urls\.txt:\d/;
    for (const file of decisionFiles() as string[]) {
      if (file.startsWith("research/measurements/ai-allowed-events.")) continue;
      expect(unpinned.test(readFileSync(file, "utf8")), file).toBe(false);
    }
    const byN = new Map(audited().map((e) => [e.n, e]));
    const v = verdicts();
    for (const site of Object.keys(AUDITED)) {
      const mine = audited().filter((e) => siteOfUrl(e.url) === site).map((e) => e.n);
      const cited = pinnedLines(v[site].note ?? "");
      for (const n of cited) expect(byN.has(n), `${site} cites :${n}`).toBe(true);
      expect(mine.filter((n) => !cited.includes(n)), `${site}: rules lines its note does not cite`).toEqual([]);
    }
    // The audit note: each site row's "Rules URLs" cell holds exactly the site's lines, and its count.
    const audit = readFileSync(AUDIT, "utf8");
    for (const site of [...Object.keys(AUDITED), "github.com", "google.com"]) {
      const row = audit.split("\n").find((l) => l.startsWith(`| \`${site}\` |`));
      expect(row, site).toBeDefined();
      const cell = row!.split(" | ")[2];
      const mine = audited().filter((e) => siteOfUrl(e.url) === site).map((e) => e.n);
      expect(pinnedLines(cell), site).toEqual(mine);
      expect(cell.startsWith(`${mine.length} (`), site).toBe(true);
    }
    // Each URL the note lists as renderable names the fixture line it is on, and its site may be rendered now (since 6.10
    // that includes the NO_TERMS_ROBOTS_OK sites' URLs, under "Now, on robots.txt").
    const listed = [...audit.matchAll(new RegExp(`^- \`(https?://\\S+)\` \\(([a-z0-9.-]+); ai-allowed-events\\.urls\\.txt@${PIN}:(\\d+)\\)$`, "gm"))];
    expect(listed.length).toBeGreaterThan(0);
    for (const [, url, site, n] of listed) {
      expect(byN.get(Number(n))?.url, `${site} :${n}`).toBe(url);
      expect(siteOfUrl(url), url).toBe(site);
      expect(termsGate(url, "x", v).ok, url).toBe(true);
    }
    // ...and every rules URL the gate admits today is listed there.
    const open = audited().filter((e) => termsGate(e.url, e.slug, v).ok).map((e) => e.url);
    expect(listed.map(([, url]) => url).sort()).toEqual(open.sort());
  });

  it("rests the GitHub-hosted verdicts on the saved copies, and the GitHub Pages ones on github.com's open-access condition", () => {
    const v = verdicts();
    for (const site of PAGES) {
      expect(v[site].source, site).toContain("research/channel-loop/terms/github-acceptable-use-policies-2026-10-05.md");
      expect(v[site].source, site).toContain("research/channel-loop/terms/github-terms-of-service-2026-10-05.md");
      expect(v[site].note, site).toContain("the condition holds only while this research is published open access, i.e. while the repo is public");
    }
    expect(Object.entries(AUDITED).filter(([, x]) => x === "CONDITIONAL_MET").map(([s]) => s).sort()).toEqual([...PAGES].sort());
    expect(v["openreview.net"].source).toContain("research/channel-loop/terms/openreview-terms-of-use-2026-10-05.md");
    expect(v["codabench.org"].source).toContain("research/channel-loop/terms/codabench-privacy-and-terms-2026-10-05.md");
    expect(v["ansperformance.eu"].source).toContain("research/channel-loop/terms/ansperformance-disclaimer-2026-10-05.md");
  });

  it("applies ruling R3 and the masking fold: render-watch masks addresses before commit, so all five Pages sites with addresses are CONDITIONAL_MET", () => {
    // The fold R3 waited for (5.10, tick 48): render-watch masks an email address before it writes and commits a capture,
    // keeping the domain. If it ever stops, this fails, and the named-address site goes back to CONDITIONAL_UNMET (R3).
    const page = Buffer.from(`<p>Contact: ${["organisers", "example.org"].join("@")}</p>`, "utf8");
    const masked = redactSecrets(page, "text/html");
    expect(masked.count).toBe(1);
    expect(masked.bytes.toString("utf8")).toBe("<p>Contact: [redacted:email]@example.org</p>");
    const v = verdicts();
    for (const site of NAMED_ADDRESSES) {
      expect(v[site].verdict, site).toBe("CONDITIONAL_MET");
      expect(v[site].note, site).toMatch(/^CONDITIONAL_MET on github\.com's condition/);
      expect(v[site].note, site).toContain("tick 45 review had put it (defect 1)");
      expect(v[site].note, site).toContain("redact addresses before commit");
      expect(v[site].note, site).toContain("RULING-2026-10-04-mozilla-precondition.md §3 rule 3");
      expect(v[site].note, site).toContain("ruling R3");
      expect(v[site].note, site).toContain("named individuals' university addresses");
      expect(v[site].note, site).toContain("render-watch masks email addresses before it hashes, writes or commits a capture");
      expect(v[site].note, site).toContain("The masking fold of 5.10 (tick 48) did that");
      // What the mask does not find, and who checks the first capture, said as they are (tick 48 review, finding 2):
      // the mask does not find every address, and capture-check has no address check.
      expect(v[site].note, site).toContain("it does not find one inside a URL path, one whose @ is itself encoded");
      expect(v[site].note, site).toContain("The reader checks the first capture of this page for addresses before citing it");
      expect(v[site].note, site).toContain("capture-check has no address check");
      expect(v[site].note, site).not.toMatch(/masks every|capture-check and the reader check|carries no address/);
      expect(v[site].note, site).not.toMatch(/stays CONDITIONAL_UNMET|no line of this site is queued/);
      expect(v[site].note, site).not.toMatch(/before (a capture is|it is) relied on/);
      for (const e of audited().filter((x) => siteOfUrl(x.url) === site)) {
        expect(termsGate(e.url, e.slug, v).ok, e.url).toBe(true);
      }
    }
    for (const site of REVIEW_FIVE) expect(v[site].verdict, site).toBe("CONDITIONAL_MET");
    for (const site of ROLE_ADDRESSES_ONLY) {
      expect(v[site].verdict, site).toBe("CONDITIONAL_MET");
      expect(v[site].note, site).toMatch(/^CONDITIONAL_MET on github\.com's condition/);
      expect(v[site].note, site).toContain("a role address");
      expect(v[site].note, site).toContain("ruling R3");
      expect(v[site].note, site).not.toContain("named individual's address");
      for (const e of audited().filter((x) => siteOfUrl(x.url) === site)) {
        expect(termsGate(e.url, e.slug, v).ok, e.url).toBe(true);
      }
    }
    // The notes name the kind of address, never the address.
    for (const site of Object.keys(AUDITED)) {
      expect(ADDRESS.test(v[site].note ?? ""), site).toBe(false);
      expect(ADDRESS.test(v[site].source), site).toBe(false);
    }
    const audit = readFileSync(AUDIT, "utf8");
    expect(audit).not.toMatch(/[Bb]efore relying on a capture|before (a capture is|it is) relied on/);
    expect(audit).toContain("redact addresses before commit");
    expect(ADDRESS.test(audit.slice(0, audit.indexOf("## Every URL the agents fetched")))).toBe(false);
  });

  it("queued exactly one terms- line for each TERMS_PENDING site, at the terms URL its verdict names; since 6.10 the read ones are paused or retired", () => {
    const v = verdicts();
    const then = tick45(v);
    const lines = active();
    const text = readFileSync(URLS, "utf8").split("\n");
    for (const [site, verdict] of Object.entries(AUDITED)) {
      if (verdict !== "TERMS_PENDING") continue;
      const { slug, state, js } = TERMS_LINES[site];
      const url = then[site].source.slice(0, then[site].source.indexOf(" ("));
      expect(then[site].source.startsWith(`${url} (`), site).toBe(true);
      // Tick 45 queued it; 5.10's verdicts pass it, except where TERMS_BARRED, which is code and not a verdict, now names
      // the site (devpost.com and zindi.africa since 6.10).
      const gateThen = termsGate(url, slug, then);
      if (TERMS_READ[site] === "BARRED") expect(gateThen.why, site).toContain("is in TERMS_BARRED");
      else expect(gateThen.ok, site).toBe(true);
      const mine = lines.filter((e) => siteOfUrl(e.url) === site);
      // Since 6.10 (ruling row 21 (c) 3(2)) a TERMS_PENDING site whose note opens "shell:" may hold its terms line as the
      // once-only js line queue-zero-test --js --terms-shell writes, active until the render; after it the line is
      // retired with the flag kept (TERMS_LINES' js: kaggle.com, queued and rendered in tick 54). No audited site holds an
      // active js line now, but the rule stays. Any other site holds the plain line. The one line of the site that names
      // that URL, active or commented out.
      const shell = v[site].note.startsWith("shell:") && text.some((l) => l === `${url}\t${slug}\tjs`);
      const flag = shell || js ? "\tjs" : "";
      const named = text.filter((l) => l.endsWith(`${url}\t${slug}${flag}`));
      expect(named, site).toHaveLength(1);
      if (state === "active") {
        expect(mine.map((e) => [e.url, e.slug]), site).toEqual([[url, slug]]);
        expect(termsGate(url, slug, v).ok, site).toBe(true);
        if (shell) expect(termsGate(url, slug, v, { js: true }).ok, site).toBe(true);
      } else {
        // Nothing of the site stays active but, for eurocontrol.int, TERMS_PENDING again since tick 55, its new terms- line
        // (its robots.txt probe, active from the terms read of 6.10, is paused: "tick 55" below).
        const found = Object.hasOwn(LINKS_FOUND, site) ? LINKS_FOUND[site] : undefined;
        expect(mine.map((e) => [e.url, e.slug]), site).toEqual(found ? [[found.url, found.slug]] : []);
        // The paused line fails the gate, but for eurocontrol.int's privacy notice: a TERMS_PENDING site's terms- line
        // passes it, and the line stays paused because the page was read.
        expect(termsGate(url, slug, v).ok, site).toBe(found !== undefined);
        expect(named[0], site).toBe(`${state} — ${url}\t${slug}${flag}`);
      }
    }
    // The js-form acceptance above is for a shell-kind TERMS_PENDING site; none of the audited sites is one with an active
    // js line any more (kaggle.com's was rendered and retired).
    const activeJs = (parseUrlList(text.join("\n")) as { url: string; js?: boolean }[]).filter((e) => e.js && Object.hasOwn(AUDITED, siteOfUrl(e.url)));
    expect(activeJs).toEqual([]);
  });

  it("queued grand-challenge.org's derived terms URL under ruling R2's exception, which urls.txt's header records after its one rule", () => {
    const v = verdicts();
    // As tick 45 left it (TERMS_PENDING, the derived URL first in its source); 6.10 read the page and paused the line.
    const e = tick45(v)[DERIVED_TERMS.site];
    expect(e.verdict).toBe("TERMS_PENDING");
    expect(e.source.startsWith(`${DERIVED_TERMS.url} (`)).toBe(true);
    expect(v[DERIVED_TERMS.site].verdict).toBe("CONDITIONAL_UNMET");
    expect(v[DERIVED_TERMS.site].note).not.toContain("Held (tick 45 review");
    // The header: the one rule's paragraph, then the exception, word for word; the one rule itself unchanged.
    const header = urlsHeader();
    expect(header).toContain(
      'No URL is invented, guessed, or extrapolated from a pattern — including "the same site probably has a /pricing page". A URL nobody wrote down is a URL nobody can cite. ' +
        EXCEPTION,
    );
    expect(header.split("Exception (ruling").length).toBe(2);
    // The URL answered (200, the Terms of Service), so R2's "a 404, or a redirect to another host, retires the line" did
    // not fire: the line was fetched once, read, and is paused since 6.10 (CONDITIONAL_UNMET), its comment unchanged and
    // still citing the template line and the domain line.
    expect(active().filter((l) => l.url === DERIVED_TERMS.url)).toEqual([]);
    expect(termsGate(DERIVED_TERMS.url, DERIVED_TERMS.slug, tick45(v)).ok).toBe(true);
    expect(termsGate(DERIVED_TERMS.url, DERIVED_TERMS.slug, v).ok).toBe(false);
    expect(pausedLines().filter((p) => p.url === DERIVED_TERMS.url).map((p) => p.slug)).toEqual([DERIVED_TERMS.slug]);
    const { comment, line: under } = listedRow(DERIVED_TERMS.row);
    expect(under).toBe(`${TERMS_LINES[DERIVED_TERMS.site].state} — ${DERIVED_TERMS.url}\t${DERIVED_TERMS.slug}`);
    expect(comment).toContain("URL derived from the platform's own source (exception, ruling R2, 5.10.2026)");
    expect(comment).toContain("app/config/settings.py:767");
    expect(comment).toContain("app/grandchallenge/subdomains/utils.py:24");
    expect(comment).toContain("at ff2fb5c");
    expect(comment).not.toMatch(/[Pp]aused/);
    expect(zeroRows().get(DERIVED_TERMS.row)?.row).not.toContain("**PAUSED");
  });

  it("opens every NO_TERMS note exhaustive-negative, by the verified records and ruling R1, and queues each such site one robots.txt probe", () => {
    // As tick 54 left the verdicts. Since tick 55 agenthon.net's probe is paused (TERMS_PENDING again), so its one probe is
    // read from the paused lines; the gate's answer to it now is in "tick 55" below.
    const now = verdicts();
    const v = tick54(now);
    const then = tick45(v);
    const lines = active();
    for (const [site, verdict] of Object.entries(AUDITED)) {
      if (verdict !== "NO_TERMS") continue;
      const mine = Object.hasOwn(LINKS_FOUND, site) ? pausedLines().filter((p) => siteOfUrl(p.url) === site) : lines.filter((e) => siteOfUrl(e.url) === site);
      // Exhaustive-negative as tick 45 left it; since 6.10 still that, or NO_TERMS_ROBOTS_OK as the script writes it,
      // with the same note and the same one probe (no rules page is queued in urls.txt either way).
      expect(isExhaustiveNegative(then[site]), site).toBe(true);
      expect(isExhaustiveNegative(v[site]) !== isRobotsOkVerdict(v[site]), site).toBe(true);
      expect(v[site].note, site).toMatch(/^exhaustive-negative \(Open Terms Archive: .*tosdr\/tosdr-snapshots.*auditor and verifier\)\. /);
      expect(v[site].note, site).not.toContain("not exhaustive-negative");
      expect(mine, site).toHaveLength(1);
      expect(isRobotsProbe(mine[0].url, mine[0].slug), site).toBe(true);
      // The probe reads the host that serves the site's rules pages.
      const hosts = new Set(audited().filter((e) => siteOfUrl(e.url) === site).map((e) => new URL(e.url).hostname));
      expect(hosts.has(new URL(mine[0].url).hostname), site).toBe(true);
      expect(termsGate(mine[0].url, mine[0].slug, v).ok, site).toBe(true);
      expect(v[site].note, site).toContain(mine[0].url);
    }
    for (const site of RULED_EXHAUSTIVE) {
      expect(then[site].verdict, site).toBe("NO_TERMS");
      expect(v[site].verdict, site).toBe(ROBOTS_OK_TICK54.includes(site) ? "NO_TERMS_ROBOTS_OK" : "NO_TERMS");
      expect(v[site].note!.endsWith("(ruling R1, 5.10, TERMS-AUDIT-2026-10-05-prize-events.md)"), site).toBe(true);
      expect(v[site].note, site).not.toMatch(/until (that|the main thread's) ruling|is paused, not fetched/);
    }
    expect(Object.values(AUDITED).filter((x) => x === "NO_TERMS")).toHaveLength(21);
    expect(Object.keys(AUDITED).filter((s) => isExhaustiveNegative(then[s]))).toHaveLength(21);
    // 6.10 (tick 54): 17 of them NO_TERMS_ROBOTS_OK, four still exhaustive-negative NO_TERMS; and eurocontrol.int, TERMS_PENDING
    // on 5.10, exhaustive-negative since its terms page was read as a privacy notice ("tick 54: the terms read on 6.10").
    expect(Object.keys(AUDITED).filter((s) => isRobotsOkVerdict(v[s])).sort()).toEqual([...ROBOTS_OK_TICK54].sort());
    expect(Object.keys(AUDITED).filter((s) => isExhaustiveNegative(v[s])).sort()).toEqual([...Object.keys(ROBOTS_NOT_SET), "eurocontrol.int"].sort());
    // Tick 55: agenthon.net is neither (TERMS_PENDING again), and eurocontrol.int is no longer exhaustive-negative.
    expect(Object.keys(AUDITED).filter((s) => isRobotsOkVerdict(now[s])).sort()).toEqual([...ROBOTS_OK].sort());
    expect(Object.keys(AUDITED).filter((s) => isExhaustiveNegative(now[s])).sort()).toEqual(Object.keys(ROBOTS_NOT_SET).sort());
    // mozilladatacollective.com keeps both readings of whose terms govern it, and R3's address rule for its rules pages.
    const mdc = v["mozilladatacollective.com"].note!;
    expect(mdc).toContain("DrivenData");
    expect(mdc).toContain("en/websites_tou.md:13");
    expect(mdc).toContain("reads only robots.txt");
    expect(mdc).toContain("ruling R3");
  });

  it("paused no line of the audit after the rulings (the six probes active again, three queued); since 6.10 only the terms lines the reading shut, and since tick 55 the probes of the two reopened sites", () => {
    const rows = zeroRows();
    const paused = pausedLines().filter((p) => Object.hasOwn(AUDITED, siteOfUrl(p.url)));
    // Tick 54: the five terms lines the 6.10 reading paused (opensky's is retired, not paused); no probe. Tick 55: the two
    // probes of the sites a terms link reopened, each ZERO-TESTS row marked PAUSED 6.10 (tick 55).
    const shut = Object.entries(TERMS_LINES).filter(([, l]) => l.state.startsWith("# paused")).map(([, l]) => l.slug);
    expect(paused.map((p) => p.slug).sort()).toEqual([...shut, ...Object.values(LINKS_FOUND).map((f) => f.probe.slug)].sort());
    expect(shut).toHaveLength(5);
    const pausedRows = new Map(Object.entries(LINKS_FOUND).map(([site, f]) => [f.probe.row, site]));
    for (let n = 235; n <= 264; n += 1) {
      const site = pausedRows.get(n);
      if (site) expect(rows.get(n)?.row, `row ${n}`).toContain(`**PAUSED 6.10 (tick 55): ${site} is TERMS_PENDING again: `);
      else expect(rows.get(n)?.row, `row ${n}`).not.toContain("**PAUSED");
    }
    for (const n of UNPAUSED_PROBES) {
      const { comment, line } = listedRow(n);
      expect(comment, `row ${n}`).toMatch(PROBE_COMMENT);
      expect(comment, `row ${n}`).not.toContain("(ruling R1, 5.10)");
      const url = rows.get(n)?.url;
      const site = pausedRows.get(n);
      if (site) expect(line, `row ${n}`).toBe(`${PROBE_PAUSED(site)} — ${url}\t${LINKS_FOUND[site].probe.slug}`);
      else expect(line, `row ${n}`).toBe(`${url}\t${active().find((l) => l.url === url)?.slug}`);
    }
    for (const p of NEW_PROBES) {
      const { comment, line } = listedRow(p.row);
      expect(comment, p.site).toMatch(PROBE_COMMENT);
      expect(comment, p.site).toContain("(ruling R1, 5.10)");
      expect(line, p.site).toBe(`${p.url}\t${p.slug}`);
      const row = rows.get(p.row)?.row ?? "";
      expect(row, p.site).toContain(`| terms audit (tick 45, ruling R1): ${p.site} robots.txt, prize-event reading (BOARD-LOOP §13; ruling 30.9 16(d) D2(v)) | ${p.url} |`);
      expect(row, p.site).toContain(`whether ${new URL(p.url).hostname}'s robots.txt allows the rules paths listed in research/measurements/ai-allowed-events.urls.txt, for scripts/robots-verdict.mjs to judge`);
      expect(siteOfUrl(p.url)).toBe(p.site);
    }
    for (let n = 244; n <= 264; n += 1) expect(listedRow(n).comment, `row ${n}`).toMatch(PROBE_COMMENT);
    // Tick 54: eurocontrol.int's probe, queued by queue-zero-test.mjs in the same form, dated 6.10.
    const euro = listedRow(EURO_PROBE.row);
    expect(euro.comment).toBe(
      `# research/channel-loop/ZERO-TESTS.md row ${EURO_PROBE.row} — exhaustive-negative NO_TERMS site (ruling R1, 5.10); the probe scripts/robots-verdict.mjs reads; no rules page is fetched before it (6.10.2026).`,
    );
    // Paused in tick 55, before scripts/robots-verdict.mjs ran on it: eurocontrol.int is TERMS_PENDING again.
    expect(euro.line).toBe(`${PROBE_PAUSED(EURO_PROBE.site)} — ${EURO_PROBE.url}\t${EURO_PROBE.slug}`);
    expect(rows.get(EURO_PROBE.row)?.row).toBe(
      `| ${EURO_PROBE.row} | terms audit (tick 54, ruling R1): eurocontrol.int robots.txt, prize-event reading (BOARD-LOOP §13; ruling 30.9 16(d) D2(v)) | ${EURO_PROBE.url} | whether www.eurocontrol.int's robots.txt allows the rules paths listed in research/measurements/ai-allowed-events.urls.txt, for scripts/robots-verdict.mjs to judge **PAUSED 6.10 (tick 55): eurocontrol.int is TERMS_PENDING again: its privacy notice's footer links a Disclaimers page (row 267), so the probe waits on the terms reading; the 12:05 weekly run of 6.10 captured it, and the capture is kept and not judged.** |`,
    );
  });

  it("ties each tick-45 and tick-54 ZERO-TESTS row to the urls.txt line under its comment: active, or as the 6.10 reading left it", () => {
    const rows = zeroRows();
    // The terms lines as the 6.10 reading left them, and (tick 55) the two probes paused; the two terms lines it queued
    // (rows 266-267) are active.
    const bySlug = new Map<string, string>([
      ...Object.values(TERMS_LINES).map((l) => [l.slug, l.state] as [string, string]),
      ...Object.entries(LINKS_FOUND).map(([site, f]) => [f.probe.slug, PROBE_PAUSED(site)] as [string, string]),
    ]);
    const last = Math.max(...Object.values(LINKS_FOUND).map((f) => f.row));
    for (let n = 235; n <= last; n += 1) {
      const { comment, line } = listedRow(n);
      expect(comment, `row ${n}`).toBeDefined();
      const url = rows.get(n)?.url;
      const parts = line!.split("\t");
      // A js flag is allowed only on the once-only js line of a shell terms page: active while the site's note opens
      // "shell:", or retired after the render (TERMS_LINES' js: kaggle.com, row 235, tick 54).
      const js = parts.at(-1) === "js";
      const slug = js ? parts.at(-2)! : parts.at(-1)!;
      const site = siteOfUrl(url!);
      if (js) expect(verdicts()[site].note.startsWith("shell:") || TERMS_LINES[site]?.js === true, `row ${n}`).toBe(true);
      const state = bySlug.get(slug) ?? "active";
      const flag = js ? "\tjs" : "";
      expect(line, `row ${n}`).toBe(state === "active" ? `${url}\t${slug}${flag}` : `${state} — ${url}\t${slug}${flag}`);
      // The row says what happened to a line the reading shut: RETIRED for a site that refused the runner (opensky's), READ
      // 6.10 for a paused, kept or read one (kaggle.com's js line is retired, but its terms were read: BARRED).
      const refused = /^refusal-type\b/.test(verdicts()[site].note ?? "");
      if (n <= 243) expect(rows.get(n)?.row, `row ${n}`).toMatch(refused ? /\*\*RETIRED 6\.10 \(403 to the runner; 16\(d\) D2\(iv\)\)\.\*\* \|$/ : /\*\*READ 6\.10 \(tick 54\): [^|]+\.\*\* \|$/);
    }
    expect(Math.max(...rows.keys())).toBe(last);
  });

  it("puts no rules page into research/rendered/urls.txt, and the gate refuses every audited rules URL it should", () => {
    const v = verdicts();
    // Every URL anywhere in the list, active or commented out.
    const listed = new Set(readFileSync(URLS, "utf8").match(/https?:\/\/\S+/g));
    // The live prize list too, whatever the weekly job has made of it: a site it adds has no verdict yet and needs none here.
    for (const e of [...audited(), ...linesOf(readFileSync(PRIZE_URLS, "utf8"))]) expect(listed.has(e.url), e.url).toBe(false);
    const then = tick45(v);
    for (const e of audited()) {
      const site = siteOfUrl(e.url);
      // Today: open on terms read and met (CONDITIONAL_MET, NOT_BARRED) or, since 6.10, on robots.txt (NO_TERMS_ROBOTS_OK).
      const open = ["CONDITIONAL_MET", "NOT_BARRED", "NO_TERMS_ROBOTS_OK"].includes(v[site].verdict);
      expect(termsGate(e.url, e.slug, v).ok, `${site} ${e.url}`).toBe(open);
      // As tick 45 left the verdicts: open on terms read and met only.
      const openThen = ["CONDITIONAL_MET", "NOT_BARRED"].includes(then[site].verdict);
      expect(termsGate(e.url, e.slug, then).ok, `5.10 ${site} ${e.url}`).toBe(openThen);
    }
    expect(audited().filter((e) => termsGate(e.url, e.slug, then).ok)).toHaveLength(13);
    // 6.10: 33 after the robots verdicts, 34 with virtualembryo.ai's terms read (NOT_BARRED); 33 again since tick 55, with
    // agenthon.net's one rules URL refused (TERMS_PENDING again).
    expect(audited().filter((e) => termsGate(e.url, e.slug, termsReadBefore(v)).ok)).toHaveLength(33);
    expect(audited().filter((e) => termsGate(e.url, e.slug, tick54(v)).ok)).toHaveLength(34);
    expect(audited().filter((e) => termsGate(e.url, e.slug, v).ok)).toHaveLength(33);
    // Every rules URL of a NO_TERMS_ROBOTS_OK site passes; every rules URL of a site still NO_TERMS is refused, for that.
    for (const e of audited()) {
      const site = siteOfUrl(e.url);
      const gate = termsGate(e.url, e.slug, v);
      if (ROBOTS_OK.includes(site)) expect(gate, e.url).toEqual({ ok: true, site, verdict: "NO_TERMS_ROBOTS_OK" });
      if (Object.hasOwn(ROBOTS_NOT_SET, site)) {
        expect(gate.ok, e.url).toBe(false);
        expect(gate.why, e.url).toBe(
          `${site} is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))`,
        );
      }
    }
    // The new lines pass the gate, so applying the verdicts pauses nothing.
    expect(applyVerdicts(readFileSync(URLS, "utf8"), v).paused).toEqual([]);
  });

  it("records the main thread's four rulings in the audit note word for word, before its appendix", () => {
    const lines = readFileSync(AUDIT, "utf8").split("\n");
    const start = lines.indexOf(RULINGS_SECTION[0]);
    expect(start).toBeGreaterThan(-1);
    const end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
    expect(lines[end]).toBe("## Every URL the agents fetched");
    expect(lines.slice(start, end)).toEqual(RULINGS_SECTION);
    // R2's sentence is the one urls.txt's header carries.
    expect(RULINGS_SECTION[4]).toContain(`the sentence "${EXCEPTION}"`);
    expect(lines.join("\n")).not.toContain("Waiting on a main-thread ruling");
  });

  it("counts each render group's URLs and sites from the fixture and the verdicts, as its heading and its list state them", () => {
    // Each robots.txt probe line of urls.txt, active or (since tick 55) paused: "captured" once its capture is on disk.
    const probes = new Map<string, Probe>(
      [...active(), ...pausedLines()]
        .filter((l) => isRobotsProbe(l.url, l.slug))
        .map((l) => [siteOfUrl(l.url), existsSync(`research/rendered/${l.slug}.meta.json`) ? "captured" : "queued"]),
    );
    // Before tick 55, eurocontrol.int's probe (row 265) was queued: the 12:05 weekly run of 6.10 (364bf71) captured it after
    // tick 54, and tick 55 paused it unjudged. The states before tick 55 read it as queued, as the note's lines state them.
    const probesBefore = new Map<string, Probe>(probes).set(EURO_PROBE.site, "queued");
    // Every audited rules URL falls in exactly one group, with the verdicts as they are, as they were before the terms links
    // were found, before the js render, before the terms read and as tick 45 left them.
    const group = (v: Record<string, Entry>, p: Map<string, Probe> = probes) => {
      const counts = RENDER_GROUPS.map(() => new Map<string, number>());
      const urls = RENDER_GROUPS.map(() => [] as string[]);
      for (const e of audited()) {
        const site = siteOfUrl(e.url);
        const into = RENDER_GROUPS.map((g, i) => (g.holds(site, v[site], p.get(site) ?? null) ? i : -1)).filter((i) => i >= 0);
        expect(into, `${site} ${e.url}`).toHaveLength(1);
        counts[into[0]].set(site, (counts[into[0]].get(site) ?? 0) + 1);
        urls[into[0]].push(e.url);
      }
      return { counts, urls, sums: counts.map((m) => [[...m.values()].reduce((a, b) => a + b, 0), m.size]) };
    };
    const now = group(verdicts());
    const linksBefore = group(tick54(verdicts()), probesBefore);
    const jsBefore = group(jsReadBefore(verdicts()), probesBefore);
    const robots = group(termsReadBefore(verdicts()), probesBefore);
    const then = group(tick45(verdicts()), probesBefore);
    const counts = now.counts;
    const computed = now.sums;
    const audit = readFileSync(AUDIT, "utf8");
    const section = audit.slice(audit.indexOf("## What the reading can render"), audit.indexOf("## Verifier notes, and the assembler's decisions"));
    const bullets = section.split("\n").filter((l) => l.startsWith("- **"));
    expect(bullets.map((b) => RENDER_GROUPS.findIndex((g) => b.startsWith(g.opens)))).toEqual(RENDER_GROUPS.map((_, i) => i));
    const stated = bullets.map((b) => {
      const m = b.match(/^- \*\*[^*]*?(\d+) URLs? on (\d+) sites?\*\*/);
      expect(m, b.slice(0, 60)).not.toBeNull();
      return [Number(m![1]), Number(m![2])];
    });
    expect(stated).toEqual(computed);
    // History: a group whose count changed since 5.10 says what it was right after its heading, "(5.10: N URLs on M
    // sites"; a group whose count did not change says nothing of the kind.
    bullets.forEach((b, i) => {
      const was = b.match(/^- \*\*[^*]*\*\* \(5\.10: (\d+) URLs? on (\d+) sites?[;,)]/);
      const changed = then.sums[i][0] !== computed[i][0] || then.sums[i][1] !== computed[i][1];
      expect(was !== null, RENDER_GROUPS[i].opens).toBe(changed);
      if (was) expect([Number(was[1]), Number(was[2])], RENDER_GROUPS[i].opens).toEqual(then.sums[i]);
    });
    expect(then.sums.map((c) => c.join("/"))).toEqual(["13/12", "0/0", "40/9", "0/0", "29/21", "0/0", "0/0", "19/3", "0/0"]);
    expect(robots.sums.map((c) => c.join("/"))).toEqual(["13/12", "20/17", "40/9", "0/0", "9/4", "0/0", "0/0", "19/3", "0/0"]);
    expect(jsBefore.sums.map((c) => c.join("/"))).toEqual(["14/13", "20/17", "18/2", "0/0", "9/4", "1/1", "20/5", "19/3", "0/0"]);
    // Later on 6.10: kaggle.com's 17 rules URLs leave the shell group for the shut one (BARRED on its js-rendered terms).
    expect(linksBefore.sums.map((c) => c.join("/"))).toEqual(["14/13", "20/17", "1/1", "0/0", "9/4", "1/1", "37/6", "19/3", "0/0"]);
    // Tick 55: agenthon.net leaves "Now, on robots.txt" and eurocontrol.int "Robots probe queued", both for the new group.
    expect(computed.map((c) => c.join("/"))).toEqual(["14/13", "19/16", "1/1", "2/2", "9/4", "0/0", "37/6", "19/3", "0/0"]);
    // Each bullet's per-site list: `site` n, for every site of the group and no other.
    bullets.forEach((b, i) => {
      const listed = Object.fromEntries([...b.matchAll(/`([a-z0-9.-]+\.[a-z]+)` (\d+)/g)].map((m) => [m[1], Number(m[2])]));
      expect(listed, RENDER_GROUPS[i].opens).toEqual(Object.fromEntries(counts[i]));
    });
    // The URL lines under each bullet are the URLs of its group: every URL of the two groups renderable now, none else.
    const under: string[][] = RENDER_GROUPS.map(() => []);
    let at = -1;
    for (const line of section.split("\n")) {
      if (line.startsWith("- **")) at += 1;
      const m = line.match(/^- `(https?:\/\/\S+)` \(/);
      if (m) under[at].push(m[1]);
    }
    expect(under.map((u) => [...u].sort()), "URL lines under each bullet").toEqual(
      now.urls.map((u, i) => (i <= 1 ? [...u].sort() : [])),
    );
    // The total line adds the groups up, in the same order, to the 101 URLs over 45 sites; the 5.10 line does the same
    // with the verdicts as tick 45 left them.
    const terms = (x: string) => x.split("+").map((t) => Number(t.trim()));
    const total = section.match(/^Total: ([\d + ]+) = (\d+) URLs, over ([\d + ]+) = (\d+) sites\.$/m);
    expect(total).not.toBeNull();
    expect([terms(total![1]), terms(total![3])]).toEqual([computed.map((c) => c[0]), computed.map((c) => c[1])]);
    expect([Number(total![2]), Number(total![4])]).toEqual([101, 45]);
    const before = section.match(/^5\.10 \(tick 45\), before the robots verdicts: ([\d + ]+) = (\d+) URLs, over ([\d + ]+) = (\d+) sites\.$/m);
    expect(before).not.toBeNull();
    expect([terms(before![1]), terms(before![3])]).toEqual([then.sums.map((c) => c[0]), then.sums.map((c) => c[1])]);
    expect([Number(before![2]), Number(before![4])]).toEqual([101, 45]);
    // ...and the 6.10 line between the two: the robots verdicts set, the terms not yet read.
    const between = section.match(/^6\.10 \(tick 54\), after the robots verdicts and before the terms read: ([\d + ]+) = (\d+) URLs, over ([\d + ]+) = (\d+) sites\.$/m);
    expect(between).not.toBeNull();
    expect([terms(between![1]), terms(between![3])]).toEqual([robots.sums.map((c) => c[0]), robots.sums.map((c) => c[1])]);
    expect([Number(between![2]), Number(between![4])]).toEqual([101, 45]);
    // ...and the 6.10 line after the terms read and before kaggle.com's js render.
    const beforeJs = section.match(/^6\.10 \(tick 54\), after the terms read and before kaggle\.com's js render: ([\d + ]+) = (\d+) URLs, over ([\d + ]+) = (\d+) sites\.$/m);
    expect(beforeJs).not.toBeNull();
    expect([terms(beforeJs![1]), terms(beforeJs![3])]).toEqual([jsBefore.sums.map((c) => c[0]), jsBefore.sums.map((c) => c[1])]);
    expect([Number(beforeJs![2]), Number(beforeJs![4])]).toEqual([101, 45]);
    // ...and (tick 55) the 6.10 line after kaggle.com's js render and before the terms links were found.
    const beforeLinks = section.match(/^6\.10 \(tick 54\), after kaggle\.com's js render and before the terms links were found: ([\d + ]+) = (\d+) URLs, over ([\d + ]+) = (\d+) sites\.$/m);
    expect(beforeLinks).not.toBeNull();
    expect([terms(beforeLinks![1]), terms(beforeLinks![3])]).toEqual([linksBefore.sums.map((c) => c[0]), linksBefore.sums.map((c) => c[1])]);
    expect([Number(beforeLinks![2]), Number(beforeLinks![4])]).toEqual([101, 45]);
    for (const sums of [computed, linksBefore.sums, jsBefore.sums, robots.sums, then.sums]) {
      expect(sums.reduce((a, c) => a + c[0], 0)).toBe(101);
      expect(sums.reduce((a, c) => a + c[1], 0)).toBe(45);
    }
    // The mask does not find every address (tick 48 review, finding 2), so the section says which forms it masks.
    expect(section).not.toMatch(/masks? every email address|neither reaches this repository/);
    expect(section).toContain("in a mailto: link or in character references");
  });

  it("states R1's test in the audit note's Verdicts paragraph, and the three R1 notes record their search as it was", () => {
    const audit = readFileSync(AUDIT, "utf8");
    const para = audit.split("\n").find((l) => l.startsWith("**Verdicts.** "))!;
    expect(para).toContain(R1_DEFINITION);
    expect(para).not.toContain("claims the label");
    expect(para).toContain("after R1 no site of this audit is in this class");
    const v = verdicts();
    for (const site of ["health-data-hub.fr", "ijcai.org", "mozilladatacollective.com"]) {
      expect(v[site].note, site).toContain(OTA_LISTING);
      expect(v[site].note, site).not.toContain("all 17 declarations repos");
    }
    // health-data-hub.fr: six READMEs read, of the 8 results, as its verified record names them.
    expect(v["health-data-hub.fr"].note).toContain(HDH_READMES);
    expect(v["health-data-hub.fr"].note).not.toContain("the eight repositories");
    // mozilladatacollective.com: its verifier's reason was not code search; the likely DrivenData terms stay an inference.
    const mdc = v["mozilladatacollective.com"].note!;
    expect(mdc).toContain(`The verifier withheld the label for another reason, in its record's words: ${MDC_WITHHELD}`);
    expect(mdc).toContain("Under ruling R1 the label rests on the recorded search, which found none");
    expect(mdc).toContain("its terms very likely exist (inference)");
    expect(mdc).not.toContain("withheld the label for that reason");
  });

  it("confines lbl.gov's CONDITIONAL_MET to the GitHub Pages host it rests on", () => {
    const v = verdicts();
    const limit = (PATH_LIMITS as Record<string, { hosts?: string[]; prefixes: string[]; why: string }>)["lbl.gov"];
    expect(limit.hosts).toEqual(["fair-universe.lbl.gov"]);
    expect(termsGate("https://fair-universe.lbl.gov/?ref=mlcontests", "x", v).ok).toBe(true);
    expect(termsGate("https://FAIR-Universe.lbl.gov./x", "x", v).ok).toBe(true);
    for (const url of ["https://www.lbl.gov/", "https://lbl.gov/x", "https://other.lbl.gov/fair-universe.lbl.gov"]) {
      const gate = termsGate(url, "x", v);
      expect(gate.ok, url).toBe(false);
      expect(gate.pathLimited, url).toBe(true);
      expect(gate.why, url).toMatch(/^lbl\.gov lines may be active only on fair-universe\.lbl\.gov under \//);
    }
    expect(applyVerdicts("https://www.lbl.gov/x\tlbl-x\n", v).urls).toMatch(/^# paused \(path limit\): lbl\.gov — see PATH_LIMITS/);
    expect(v["lbl.gov"].note).toContain("admits lbl.gov lines on fair-universe.lbl.gov only");
    expect(v["lbl.gov"].note).toContain("the project mailbox (index.html:481), a role address and not personal information (ruling R3");
    // posthog.com's path limit names no hosts and reads as before.
    expect(termsGate("https://posthog.com/pricing", "x", v).why).toMatch(/^posthog\.com lines may be active only under \/docs\/ or \/tutorials\//);
  });
});

/**
 * Tick 54 (6.10.2026): the robots verdicts. Ruling 30.9 16(d) D2(iv)-(v) lets an exhaustive-negative NO_TERMS site become
 * NO_TERMS_ROBOTS_OK only through scripts/robots-verdict.mjs, which reads the committed robots.txt capture of the host
 * for the queued paths. The 6.10 weekly render (5f4853a) captured all 21 probes; the script, run for each with --urls
 * research/measurements/ai-allowed-events.urls.txt, set 17 and declined four. Each verdict is re-derived here by the
 * script's own judgeSite from the NO_TERMS entry tick 45 left, the fixture's rules paths (the live list's URLs for these
 * sites were the fixture's on 6.10) and the dated frozen copy of each capture it read (FROZEN_ON), in process: no network,
 * no child process, and nothing the weekly render rewrites.
 */
describe("tick 54: the robots verdicts of 6.10", () => {
  const raw = () => readFileSync(VERDICTS, "utf8");
  const fixture = () => readFileSync(FIXTURE, "utf8");
  /** The frozen copy of the capture the script read for one of the four sites it declined. */
  const declinedCapture = (slug: string) => frozenCapture(`research/rendered/${slug}-${FROZEN_ON}.meta.json`);
  /** The audit note's robots section, up to the terms-read section the reading of 6.10 put after it. */
  const section = () => {
    const audit = readFileSync(AUDIT, "utf8");
    const start = audit.indexOf("## Robots verdicts (6.10.2026, tick 54)");
    const end = audit.indexOf("\n## ", start + 1);
    return audit.slice(start, end < 0 ? undefined : end + 1);
  };

  it("sets exactly these 17 of the 21 NO_TERMS sites to NO_TERMS_ROBOTS_OK (16 since tick 55), and keeps terms-verdicts.json's exact format", () => {
    const v = tick54(verdicts());
    expect(ROBOTS_OK_TICK54).toHaveLength(17);
    expect(Object.keys(AUDITED).filter((s) => v[s].verdict === "NO_TERMS_ROBOTS_OK").sort()).toEqual([...ROBOTS_OK_TICK54].sort());
    expect([...ROBOTS_OK_TICK54, ...Object.keys(ROBOTS_NOT_SET)].sort()).toEqual(Object.keys(AUDITED).filter((s) => AUDITED[s] === "NO_TERMS").sort());
    // Tick 55: agenthon.net's was taken back (TERMS_PENDING again); the other 16 hold.
    expect(ROBOTS_OK).toHaveLength(16);
    expect(Object.keys(AUDITED).filter((s) => verdicts()[s].verdict === "NO_TERMS_ROBOTS_OK").sort()).toEqual([...ROBOTS_OK].sort());
    // The script writes the file as it is committed (one-space indent, no final newline): the 17 rewrites kept that.
    expect(serializeVerdicts(JSON.parse(raw()))).toBe(raw());
  });

  it("keeps the NO_TERMS source tick 45 wrote for each of the 17, byte for byte, after \"NO_TERMS before:\"", () => {
    const then = tick45(verdicts());
    const text = ROBOTS_OK_TICK54.map((site) => `${site}\t${then[site].source}`).join("\n");
    expect(createHash("sha256").update(text).digest("hex")).toBe(TICK45_SOURCES_SHA256);
  });

  it("rests each NO_TERMS_ROBOTS_OK verdict on the frozen copy of the robots.txt capture it read, exactly as the script writes it", () => {
    // The 17 as tick 54 left them: agenthon.net's was taken back in tick 55, and the 16 others are as they are.
    const v = tick54(verdicts());
    const file = JSON.parse(raw());
    const then = tick45(v);
    const urlsTxt = readFileSync(URLS, "utf8");
    const kinds: Record<string, string[]> = { file: [], absent: [] };
    for (const site of ROBOTS_OK_TICK54) {
      if (ROBOTS_OK.includes(site)) expect(verdicts()[site], site).toEqual(v[site]);
      const e = v[site];
      expect(isRobotsOkVerdict(e), site).toBe(true);
      expect(e.note, site).toMatch(/^exhaustive-negative \(Open Terms Archive: .*tosdr\/tosdr-snapshots.*auditor and verifier\)\. /);
      expect(e.checked, site).toBe(ROBOTS_CHECKED);
      expect(e.source, site).toContain("(scripts/robots-verdict.mjs)");
      expect(e.source, site).toContain(`; ruling ${RULING_D2V}${BEFORE}`);
      const cited = citedCapture(e.source);
      expect(cited, e.source.slice(0, 80)).not.toBeNull();
      kinds[cited!.kind].push(site);
      // The capture is that host's /robots.txt: every rules URL of the site sits on the host it was fetched from.
      const rules = rulesOf(site);
      expect(cited!.n, site).toBe(rules.length);
      for (const r of rules) expect(robotsTxtUrl(r.url), r.url).toBe(cited!.url);
      // The source names the dated frozen copy of the 6.10 render's capture (5f4853a), which no urls.txt line names, so
      // the weekly render never rewrites it.
      expect(cited!.slug, site).toMatch(new RegExp(`^robots-[a-z0-9.-]+-${FROZEN_ON}$`));
      expect(urlsTxt, site).not.toContain(cited!.slug);
      const capture = frozenCapture(cited!.path);
      expect(capture.slug, site).toBe(cited!.slug);
      expectFrozenCopy(capture, cited!.slug.slice(0, -(FROZEN_ON.length + 1)), RENDER_COMMIT, site);
      const { meta, body } = capture;
      expect(meta.url, site).toBe(cited!.url);
      expect(meta.fetchedAt, site).toBe(cited!.fetchedAt);
      expect(existsSync(cited!.path), cited!.path).toBe(true);
      if (cited!.kind === "file") {
        // A robots.txt the site served (2xx text/plain, not markup), stored at the .txt the source names, whose bytes the
        // meta's sha256 is of (expectFrozenCopy); the source carries its first 12 hex digits.
        expect(meta.bodyPath, site).toBe(cited!.path);
        expect(readableCapture(meta, body), site).toEqual({ kind: "file" });
        expect(meta.sha256!.slice(0, 12), site).toBe(cited!.sha12);
      } else {
        // A 404 (or 410): the site has no robots.txt, so no rules (RFC 9309 §2.3.1.3). render-watch stored no body, so
        // the source names the .meta.json and carries no sha256.
        expect(meta.status, site).toBe(cited!.status);
        expect(meta.bodyPath, site).toBeNull();
        expect(meta.sha256, site).toBeNull();
        expect(readableCapture(meta, body), site).toEqual({ kind: "absent" });
      }
      // Set by the script, not by hand: given the NO_TERMS entry tick 45 left, the fixture and the capture it read,
      // judgeSite allows every rules path and writes these four fields as they stand (the fields it writes; a field a
      // later fold adds to every entry is not its to write). The script read the live capture and wrote its path; the
      // review moved the source to the frozen copy (the same bytes, URL, fetchedAt and sha256), and judgeSite reading
      // that copy writes the source exactly as it stands, so the path is the only thing the review changed.
      const out = judgeSite({ site, verdicts: { ...file, sites: then }, urls: fixture(), readCapture: readerOf(capture), today: ROBOTS_CHECKED });
      expect(out.changed, site).toBe(true);
      expect(out.checked.map((c: { url: string; allowed: boolean }) => [c.url, c.allowed]), site).toEqual(rules.map((r) => [r.url, true]));
      const written = ({ verdict, source, checked, note }: Entry) => ({ verdict, source, checked, note });
      expect(written(out.verdicts.sites[site]), site).toEqual(written(e));
    }
    expect(kinds.absent.sort()).toEqual([...ROBOTS_404].sort());
    expect(kinds.file).toHaveLength(11);
  });

  it("leaves the four others NO_TERMS, each for a reason the frozen copy of its robots.txt capture shows", () => {
    const v = verdicts();
    const file = JSON.parse(raw());
    for (const [site, { slug, why }] of Object.entries(ROBOTS_NOT_SET)) {
      expect(v[site].verdict, site).toBe("NO_TERMS");
      expect(isExhaustiveNegative(v[site]), site).toBe(true);
      expect(v[site].checked, site).toBe("2026-10-05");
      const rules = rulesOf(site);
      const robotsUrl = robotsTxtUrl(rules[0].url);
      for (const r of rules) expect(robotsTxtUrl(r.url), r.url).toBe(robotsUrl);
      const capture = declinedCapture(slug);
      expectFrozenCopy(capture, slug, RENDER_COMMIT, site);
      const { meta, body } = capture;
      expect(meta.url, site).toBe(robotsUrl);
      if (why === "html") {
        // /robots.txt answered 200 with an HTML page: not a robots.txt the site served (ruling D2(iv): the site's answer).
        expect(meta.status, site).toBe(200);
        expect(meta.contentType, site).toMatch(/^text\/html\b/);
        expect(meta.bodyPath, site).toBe(`research/rendered/${slug}-${FROZEN_ON}.html`);
        expect(body, site).toMatch(/^\s*<!DOCTYPE html>/i);
        expect(readableCapture(meta, body), site).toEqual({ kind: "refused", why: `a 200 answered ${meta.contentType}, not text/plain` });
      } else if (why === "unreachable") {
        // No HTTP answer at all: RFC 9309 §2.3.1.4 reads that as complete disallow.
        expect(meta.status, site).toBeNull();
        expect(meta.error, site).toBe("TypeError: fetch failed");
        expect(meta.bodyPath, site).toBeNull();
        expect(readableCapture(meta, body), site).toEqual({ kind: "unreachable", why: 'status none, error "TypeError: fetch failed"' });
      } else {
        // A robots.txt the site served, whose group for MehudakRenderWatch (or *) disallows every queued path.
        expect(readableCapture(meta, body), site).toEqual({ kind: "file" });
        const own = robotsRulesFor(parseRobotsTxt(body));
        expect(rules).toHaveLength(4);
        for (const r of rules) expect(robotsDecision(own, r.url), r.url).toEqual({ allowed: false, rule: { allow: false, pattern: "/" } });
      }
      // The script, run again on the same inputs, still declines, for that reason, and returns the file untouched.
      const out = judgeSite({ site, verdicts: file, urls: fixture(), readCapture: readerOf(capture), today: ROBOTS_CHECKED });
      expect(out.changed, site).toBe(false);
      expect(out.verdicts, site).toBe(file);
      expect(out.why, site).toMatch(
        why === "html"
          ? new RegExp(`^the robots\\.txt capture of https://${new URL(robotsUrl).hostname.replace(/\./g, "\\.")} \\(research/rendered/${slug}-${FROZEN_ON}\\.meta\\.json\\) is not a robots\\.txt the site served: a 200 answered text/html`)
          : why === "unreachable"
            ? /is not a read file \(status none, error "TypeError: fetch failed"\): RFC 9309 §2\.3\.1\.4 reads that as complete disallow$/
            : /^robots\.txt disallows 4 queued path\(s\) for MehudakRenderWatch: /,
      );
      // Its rules pages stay shut; its robots.txt probe, the one line of it in urls.txt, still passes the gate.
      for (const r of rules) expect(termsGate(r.url, r.slug, v).ok, r.url).toBe(false);
      expect(termsGate(robotsUrl, slug, v).ok, site).toBe(true);
      expect(active().filter((l) => siteOfUrl(l.url) === site).map((l) => [l.url, l.slug]), site).toEqual([[robotsUrl, slug]]);
    }
  });

  it("is idempotent: run again on any list, the script changes nothing for any of the 21 sites", () => {
    const file = JSON.parse(raw());
    // main() prints "no change: <why>" and exits 3 whenever judgeSite returns changed: false; it writes only on true.
    for (const urls of [fixture(), readFileSync(PRIZE_URLS, "utf8"), readFileSync(URLS, "utf8")]) {
      for (const site of ROBOTS_OK) {
        const out = judgeSite({ site, verdicts: file, urls, today: ROBOTS_CHECKED });
        expect(out.changed, site).toBe(false);
        expect(out.verdicts, site).toBe(file);
        expect(out.why, site).toBe(`${site} is already NO_TERMS_ROBOTS_OK`);
      }
      // Tick 55: the two reopened sites are TERMS_PENDING, which the script never judges (no robots verdict may run for
      // either before its terms are read).
      for (const site of Object.keys(LINKS_FOUND)) {
        const out = judgeSite({ site, verdicts: file, urls, today: ROBOTS_CHECKED });
        expect(out.changed, site).toBe(false);
        expect(out.verdicts, site).toBe(file);
        expect(out.why, site).toMatch(new RegExp(`^${site.replace(/\./g, "\\.")} is TERMS_PENDING with the note "terms unread: `));
      }
      // The four, on the frozen copy of what the script read: declined on every list (on the fixture and the live list
      // for the reason above; on urls.txt, which queues only their probes, for having no page to judge).
      for (const [site, { slug }] of Object.entries(ROBOTS_NOT_SET)) {
        const out = judgeSite({ site, verdicts: file, urls, readCapture: readerOf(declinedCapture(slug)), today: ROBOTS_CHECKED });
        expect(out.changed, site).toBe(false);
        expect(out.verdicts, site).toBe(file);
      }
    }
  });

  it("records every robots verdict in the audit note's section after the appendix, with the values the frozen copies hold", () => {
    const audit = readFileSync(AUDIT, "utf8");
    const heads = audit.split("\n").filter((l) => l.startsWith("## "));
    expect(heads.slice(-5)).toEqual([
      "## Every URL the agents fetched",
      "## Robots verdicts (6.10.2026, tick 54)",
      "## Terms read (6.10.2026, tick 54)",
      "## Shell terms pages rendered once (6.10.2026, tick 54)",
      "## Terms links found after the verdicts (6.10.2026, tick 55)",
    ]);
    const text = section();
    expect(text).toContain("node scripts/robots-verdict.mjs <site> --urls research/measurements/ai-allowed-events.urls.txt");
    expect(text).toContain("ruling 30.9 16(d) D2(iv)-(v)");
    // The section is tick 54's record: its verdict column is the state tick 54 left ("tick 55" below has the reversal).
    const v = tick54(verdicts());
    const rows = text.split("\n").filter((l) => /^\| `[a-z0-9.-]+` \|/.test(l));
    const sites = [...ROBOTS_OK_TICK54, ...Object.keys(ROBOTS_NOT_SET)].sort();
    expect(rows.map((r) => r.match(/^\| `([a-z0-9.-]+)` \|/)![1])).toEqual([...sites, "nevo.co.il"]);
    for (const row of rows) {
      const m = row.match(
        /^\| `([a-z0-9.-]+)` \| `(research\/rendered\/robots-[a-z0-9.-]+\.(?:txt|html|meta\.json))`; (\d+|none); (?:`([^`]+)`|none); ([0-9T:.Z-]+); ([0-9a-f]{12}|none) \| (\d+)[^|]* \| ([^|]+) \| ([A-Z_]+) \|$/,
      );
      expect(m, row.slice(0, 60)).not.toBeNull();
      const [, site, path, status, contentType, fetchedAt, sha12, n, answer, verdict] = m!;
      const nevo = site === "nevo.co.il";
      const list = nevo ? readFileSync(URLS, "utf8") : fixture();
      const pages = queuedPaths(list, site).filter((p: { url: string; slug: string }) => !isRobotsProbe(p.url, p.slug));
      // The file named is a frozen copy's: the 6.10 render's capture (5f4853a), or for nevo the 30.9 one (e839268), the
      // copy the 6.10 row-21 ruling cites. Never the live capture, which the weekly render rewrites.
      expect(existsSync(path), path).toBe(true);
      const capture = frozenCapture(path);
      const live = nevo ? NEVO_FROZEN.live : capture.slug.slice(0, -(FROZEN_ON.length + 1));
      expect(capture.slug, site).toBe(nevo ? NEVO_FROZEN.slug : `${live}-${FROZEN_ON}`);
      expectFrozenCopy(capture, live, nevo ? NEVO_FROZEN.commit : RENDER_COMMIT, site);
      const { slug, meta, body } = capture;
      for (const p of pages) expect(robotsTxtUrl(p.url), p.url).toBe(meta.url);
      // The file named is the one the copy stored, or its meta when it stored none.
      expect(path, site).toBe(meta.bodyPath ?? `research/rendered/${slug}.meta.json`);
      expect(status, site).toBe(meta.status === null ? "none" : String(meta.status));
      expect(contentType ?? null, site).toBe(meta.contentType);
      expect(fetchedAt, site).toBe(meta.fetchedAt);
      expect(sha12, site).toBe(meta.sha256 ? meta.sha256.slice(0, 12) : "none");
      expect(Number(n), site).toBe(pages.length);
      expect(verdict, site).toBe(v[site].verdict);
      // The answer, word for word, by what the capture is and what its rules say of the queued paths: the rule quoted in
      // brackets is the one that decided every path of the site.
      const kind = readableCapture(meta, body).kind;
      if (kind === "file") {
        const own = robotsRulesFor(parseRobotsTxt(body));
        const decisions = pages.map((p: { url: string }) => robotsDecision(own, p.url) as { allowed: boolean; rule: { allow: boolean; pattern: string } | null });
        const quoted = [...new Set(decisions.map((d) => quoteRule(d.rule)))];
        expect(quoted, site).toHaveLength(1);
        const allowed = decisions.filter((d) => d.allowed).length;
        expect(answer, site).toBe(allowed === pages.length ? `${n} of ${n} allowed (${quoted[0]})` : `${pages.length - allowed} of ${n} disallowed (${quoted[0]})`);
      } else if (kind === "absent") {
        expect(answer, site).toBe(`no robots.txt (${meta.status}): no rules, RFC 9309 §2.3.1.3; ${n} of ${n} allowed`);
      } else if (kind === "refused") {
        expect(answer, site).toBe(`not a robots.txt: a 200 that answered \`${meta.contentType}\` (ruling D2(iv): the site's answer)`);
      } else {
        expect(answer, site).toBe("no answer (fetch failed): complete disallow, RFC 9309 §2.3.1.4");
      }
      expect(verdict === "NO_TERMS_ROBOTS_OK", site).toBe(ROBOTS_OK_TICK54.includes(site));
    }
  });

  it("states the counts and sizes in the section's prose as the verdicts and the frozen copies hold them", () => {
    const text = section();
    // At tick 54, as the section states them; "Terms links found after the verdicts" states 16 and 19 since tick 55.
    const v = tick54(verdicts());
    const kinds = ROBOTS_OK_TICK54.map((site) => citedCapture(v[site].source)!.kind);
    // "Eleven of the 17 served a robots.txt (...) and six answered 404": the two kinds of source.
    const served = text.match(/^(\w+) of the (\d+) served a robots\.txt \(k12-ai-infrastructure\.org's is an empty file, so no rule at all\) and (\w+) answered 404,/m);
    expect(served).not.toBeNull();
    expect([numberWord(served![1]), Number(served![2]), numberWord(served![3])]).toEqual([
      kinds.filter((k) => k === "file").length,
      ROBOTS_OK_TICK54.length,
      kinds.filter((k) => k === "absent").length,
    ]);
    // k12-ai-infrastructure.org's robots.txt is an empty file: no rule at all.
    const k12 = frozenCapture(citedCapture(v["k12-ai-infrastructure.org"].source)!.path);
    expect(k12.body).toBe("");
    expect(robotsRulesFor(parseRobotsTxt(k12.body))).toEqual([]);
    // "The 17 sites' 20 rules URLs pass termsGate now".
    const rulesUrls = audited().filter((e) => ROBOTS_OK_TICK54.includes(siteOfUrl(e.url)));
    expect(text).toContain(`The ${ROBOTS_OK_TICK54.length} sites' ${rulesUrls.length} rules URLs pass \`termsGate\` now`);
    for (const e of rulesUrls) expect(termsGate(e.url, e.slug, v).ok, e.url).toBe(true);
    // flagos.io and theemailgame.com: an HTML page each, of the sizes the copies stored.
    const html = text.match(/flagos\.io and theemailgame\.com: \/robots\.txt answered 200 with an HTML page \(`text\/html`, (\d+) and (\d+) bytes\)/);
    expect(html).not.toBeNull();
    const bytes = (slug: string) => readFileSync(declinedCapture(slug).meta.bodyPath!).length;
    expect([Number(html![1]), Number(html![2])]).toEqual([bytes("robots-flagos"), bytes("robots-theemailgame")]);
    // mozilladatacollective.com: `User-agent: *` then `Disallow: /`, and nothing else, in so many bytes.
    const mdc = text.match(/mozilladatacollective\.com: its robots\.txt is `User-agent: \*` then `Disallow: \/` \((\d+) bytes\)/);
    expect(mdc).not.toBeNull();
    const mdcCapture = declinedCapture("robots-mozilladatacollective");
    expect(Number(mdc![1])).toBe(bytes("robots-mozilladatacollective"));
    expect(mdcCapture.body!.split("\n").filter((l) => l.trim() !== "")).toEqual(["User-agent: *", "Disallow: /"]);
    // nevo: the ten 29.9 captures are [robots-bar] under the 6.10 row-21 ruling, which the note cites by file, and the
    // product cite it names is the frozen nevo VAT law copy; it does not claim the product reads nevo from a mirror.
    expect(text).toContain("The ten nevo captures of 29.9 are `[robots-bar]` under ruling 6.10 row 21 (a) (`research/channel-loop/RULING-2026-10-06-robots-and-terms.md`, decision 1");
    const ruling = readFileSync("research/channel-loop/RULING-2026-10-06-robots-and-terms.md", "utf8");
    expect(ruling).toContain("**The ten nevo captures**");
    expect(ruling).toContain("marked **`[robots-bar]`**");
    expect(ruling).toContain("5. **Every nevo cite leaves the product:**");
    expect(existsSync("research/rendered/nevo-vat-law-2026-09-29.txt")).toBe(true);
    expect(text).not.toContain("lawsofisrael mirror");
  });
});

/**
 * Tick 54 (6.10.2026): the terms read. The 6.10 render captured the terms page of each of the nine TERMS_PENDING sites;
 * six were read pages, frozen first and read by one Opus reader and one adversarial Opus verifier each, and the main
 * thread gave the verdicts (the audit note's "Terms read (6.10.2026, tick 54)"). Ruling 6.10 row 21's fold 2
 * (RULING-2026-10-06-robots-and-terms.md, "Folds" item 2) went in with it: a "copying" field on every entry and the kind
 * word that opens every NO_TERMS/TERMS_PENDING note decision 3(1)'s five kinds describe.
 */
describe("tick 54: the terms read on 6.10", () => {
  const RENDER = "5f4853a";
  /**
   * The decisive line of each read page: the frozen copy, the line, and words of the clause the verdict rests on (for
   * virtualembryo.ai, which no clause bars, the document's own title and date; for eurocontrol.int, which holds no site
   * terms, the privacy notice's heading). The note quotes the words and cites the copy at the line.
   */
  const DECISIVE: { site: string; slug: string; line: number; words: string }[] = [
    {
      site: "devpost.com",
      slug: "terms-devpost",
      line: 159,
      words: "manual or automated software, devices, scripts robots, or other means or processes to access, “scrape,” “crawl” or “spider” the Site",
    },
    {
      site: "zindi.africa",
      slug: "terms-zindi",
      line: 68,
      words:
        "You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store or transmit any of the material on our Website",
    },
    {
      site: "grand-challenge.org",
      slug: "terms-grand-challenge",
      line: 150,
      words: "You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Platform or Services",
    },
    {
      site: "stanford.edu",
      slug: "terms-stanford",
      line: 125,
      words:
        "User may download material from the Sites only for User’s own personal, non-commercial use. User may not otherwise copy, reproduce, retransmit, distribute, publish, commercially exploit or otherwise transfer any material.",
    },
    { site: "virtualembryo.ai", slug: "terms-virtualembryo", line: 13, words: "Effective 10 August 2026" },
    { site: "eurocontrol.int", slug: "terms-eurocontrol", line: 367, words: "Website Privacy Policy" },
  ];
  /** The four sites whose copying ruling 6.10 row 21 decision 4(2) names barred, and where each note cites its clause. */
  const RULING_COPY_BARRED: Record<string, string> = {
    "worksheets4kids.co.il": "research/rendered/terms-worksheets4kids-2026-09-29.txt:195",
    "btl.gov.il": "research/rendered/terms-btl-2026-09-29.txt:303",
    "apify.com": "research/channel-loop/terms/apify-general-terms-2026-10-04.md:88",
    "indiebook.co.il": "TERMS-AUDIT-2026-09-29.md:129",
  };
  /**
   * The four sites whose copying clause this reading quoted: barred too, each note citing the clause. (The brief named only
   * the ruling's four; decision 4(2) makes a site "unread" only "until an Opus pass reads its clause", and these were read.)
   */
  const READ_COPY_BARRED: Record<string, string> = {
    "devpost.com": "research/rendered/terms-devpost-2026-10-06.txt:159",
    "zindi.africa": "research/rendered/terms-zindi-2026-10-06.txt:68",
    "grand-challenge.org": "research/rendered/terms-grand-challenge-2026-10-06.txt:150",
    "stanford.edu": "research/rendered/terms-stanford-2026-10-06.txt:125",
  };
  /**
   * kaggle.com, read later on 6.10 on the once-only js render of its terms page: barred too, its note citing the clause
   * (:87 of research/rendered/terms-kaggle-2026-10-06-a3cb438.txt, the copy the note names at :77 first).
   */
  const JS_COPY_BARRED: Record<string, string> = {
    "kaggle.com": ":87 bars using, copying, reproducing or publishing",
  };
  const COPY_CLAUSE: Record<string, string> = {
    "devpost.com": "Unauthorized copying or use of any Devpost Content or Intellectual Property Rights without the express written consent of Devpost is strictly prohibited.",
    "zindi.africa": "store or transmit any of the material on our Website",
    "grand-challenge.org": "without the express written permission by Radboudumc",
    "stanford.edu": "User may not otherwise copy, reproduce, retransmit, distribute, publish",
    "kaggle.com": "for any purpose any Content not owned by you, (i) without the prior consent of the owner of that Content",
    "codabench.org": "'Any reproduction in whole or in part is prohibited without prior consent of its owner.'",
    "tipalti.com":
      "\"You may not download or save a copy of the Site or any portion thereof, including, without limitation, any materials and logos, for any purpose, without Tipalti’s prior written consent.\"",
  };
  /**
   * The tick-54 review's two: the other sites whose verdicts already rested on a read copying clause (codabench.org's
   * CONDITIONAL_UNMET on its organisers' content clause, tipalti.com's TERMS_BARRED entry on its website terms), set barred
   * by the same rule as READ_COPY_BARRED. The file and line each note cites, which holds the clause.
   */
  const REVIEW_COPY_BARRED: Record<string, { file: string; line: number }> = {
    "codabench.org": { file: "research/channel-loop/terms/codabench-privacy-and-terms-2026-10-05.md", line: 39 },
    "tipalti.com": { file: "research/rendered/terms-tipalti-website.txt", line: 245 },
  };
  /**
   * Sites whose notes quote a copying clause only as an open caveat beside a verdict that rests on something else: they
   * stay "unread" for fold 10(i)'s copying audit (the _about's rule), each note holding the caveat's words.
   */
  const CAVEAT_UNREAD: Record<string, string> = {
    "aimo-interp.github.io": "'You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service'",
    "build-arena.github.io": "'You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service'",
    "fomo26.github.io": "'You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service'",
    "lbl.gov": "'You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service'",
    "neural-interfaces26.github.io": "'You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service'",
    "realpdecompetition.github.io": "'You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service'",
    "robosyn-bench.net": "'You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service'",
    "roco-spring.github.io": "'You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service'",
    "szczurek-lab.github.io": "'You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service'",
    "xiuwenz2.github.io": "'You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service'",
    "posthog.com": "'Please do not duplicate, copy, or use our website'",
    "ansperformance.eu": "'It may be copied in whole or in part, provided that EUROCONTROL is mentioned as the source and it is not used for commercial purposes",
  };
  /** The _about's sentence on the copying field and the kind words, whole. */
  const ABOUT_COPYING =
    'Since 6.10 (RULING-2026-10-06-robots-and-terms.md, row 21) every entry carries a fifth field after "note", "copying": "barred" when the read terms bar copying, reproducing, distributing or publishing the content (the note cites the clause, and the verdict rests on it: a copying clause quoted only as an open caveat beside a verdict that rests on something else stays "unread" for fold 10(i)\'s copying audit; decision 4(1)-(3) keeps full copies of its pages out of the tree once fold 9\'s trim and artifact route exist), "allowed" when they were read and bar none of it, and "unread" otherwise, which is not "allowed" (decision 4(2)); and the note of a NO_TERMS or TERMS_PENDING site whose terms page could not be read opens with its kind word, refusal-type, exhaustive-negative, unanswered, shell or "deferred to <site>" (decision 3(1)).';
  /**
   * The secondary quotes and line citations of the six read notes: the frozen copy (or another file), the line, words the
   * line holds, and the fragment of the note that cites it (the words in it when quoted). The decisive clauses are in
   * DECISIVE; these are the scope, binding and condition lines the verdicts also rest on.
   */
  const fz = (slug: string, ext = "txt") => `research/rendered/${slug}-2026-10-06.${ext}`;
  const SECONDARY: { site: string; file: string; line: number; words: string; cite: string; quoted: boolean }[] = [
    { site: "devpost.com", file: fz("terms-devpost"), line: 111, words: "the Devpost website, www.devpost.com", cite: 'the Site is "the Devpost website, www.devpost.com" (:111)', quoted: true },
    {
      site: "devpost.com",
      file: fz("terms-devpost"),
      line: 114,
      words: "By using and/or visiting our Site, you agree to the terms and conditions outlined in this Agreement",
      cite: 'visiting binds (:114, "By using and/or visiting our Site, you agree to the terms and conditions outlined in this Agreement")',
      quoted: true,
    },
    { site: "devpost.com", file: fz("terms-devpost"), line: 123, words: "other visitors to the Site", cite: 'Users include "other visitors to the Site" (:123)', quoted: true },
    { site: "devpost.com", file: fz("terms-devpost"), line: 128, words: "“Hackathon Content” means User Content", cite: "Hackathon Content is User Content (:128)", quoted: false },
    { site: "devpost.com", file: fz("terms-devpost"), line: 129, words: "Hackathon Website", cite: "the hackathon pages sit inside it (:129, :170, :185)", quoted: false },
    { site: "devpost.com", file: fz("terms-devpost"), line: 170, words: "Hackathon Website", cite: "the hackathon pages sit inside it (:129, :170, :185)", quoted: false },
    { site: "devpost.com", file: fz("terms-devpost"), line: 185, words: "Hackathon Website", cite: "the hackathon pages sit inside it (:129, :170, :185)", quoted: false },
    {
      site: "devpost.com",
      file: fz("terms-devpost"),
      line: 143,
      words: "All Users agree NOT to post or make available content",
      cite: 'in the list "All Users agree NOT to post or make available content" of :143',
      quoted: true,
    },
    {
      site: "devpost.com",
      file: fz("terms-devpost"),
      line: 252,
      words: "Unauthorized copying or use of any Devpost Content or Intellectual Property Rights without the express written consent of Devpost is strictly prohibited.",
      cite: '"Unauthorized copying or use of any Devpost Content or Intellectual Property Rights without the express written consent of Devpost is strictly prohibited." (:252)',
      quoted: true,
    },
    { site: "devpost.com", file: fz("terms-devpost"), line: 250, words: "the “Devpost Content”", cite: ":250 bars transmitting Devpost Content", quoted: false },
    {
      site: "zindi.africa",
      file: fz("terms-zindi"),
      line: 47,
      words: "the legitimate purpose of building and submitting a Competition solution",
      cite: ':47 limits content downloaded from the Website to "the legitimate purpose of building and submitting a Competition solution"',
      quoted: true,
    },
    {
      site: "zindi.africa",
      file: fz("terms-zindi"),
      line: 74,
      words: "Any use of the Website not expressly permitted by these Terms of Use",
      cite: ':74 makes "Any use of the Website not expressly permitted by these Terms of Use" a breach',
      quoted: true,
    },
    {
      site: "zindi.africa",
      file: fz("terms-zindi"),
      line: 14,
      words: "your access to and use of www.zindi.africa, including any content, functionality and services offered on or through www.zindi.africa",
      cite: '"your access to and use of www.zindi.africa, including any content, functionality and services offered on or through www.zindi.africa" (:14)',
      quoted: true,
    },
    { site: "zindi.africa", file: fz("terms-zindi"), line: 15, words: "By using the Website, you accept and agree to be bound", cite: "bind on use (:15)", quoted: false },
    { site: "zindi.africa", file: fz("terms-zindi", "html"), line: 50, words: "https://zindi.world/terms", cite: "research/rendered/terms-zindi-2026-10-06.html:50, https://zindi.world/terms", quoted: true },
    { site: "grand-challenge.org", file: fz("terms-grand-challenge"), line: 122, words: "for Research Use Only", cite: '"for Research Use Only" (:122)', quoted: true },
    {
      site: "grand-challenge.org",
      file: fz("terms-grand-challenge"),
      line: 50,
      words: "solely for scientific or academic purposes",
      cite: '"solely for scientific or academic purposes" (:50)',
      quoted: true,
    },
    { site: "grand-challenge.org", file: fz("terms-grand-challenge"), line: 124, words: "explicitly NOT for clinical use", cite: "aimed at clinical use (:124)", quoted: false },
    {
      site: "grand-challenge.org",
      file: fz("terms-grand-challenge"),
      line: 76,
      words: "Accounts registered by “bots” or other automated methods are not permitted.",
      cite: '"Accounts registered by “bots” or other automated methods are not permitted." (:76)',
      quoted: true,
    },
    { site: "grand-challenge.org", file: fz("terms-grand-challenge"), line: 56, words: "accesses or uses the Platform", cite: '"accesses or uses the Platform" (:56, :34)', quoted: true },
    { site: "grand-challenge.org", file: fz("terms-grand-challenge"), line: 34, words: "By using grand-challenge.org, you are agreeing to be bound", cite: '"accesses or uses the Platform" (:56, :34)', quoted: false },
    { site: "grand-challenge.org", file: fz("terms-grand-challenge"), line: 164, words: "govern your use of", cite: "govern the Platform and its Services (:164)", quoted: false },
    { site: "grand-challenge.org", file: fz("terms-grand-challenge"), line: 54, words: "hosting an AI challenge", cite: '"hosting an AI challenge" (:54)', quoted: true },
    {
      site: "stanford.edu",
      file: fz("terms-stanford"),
      line: 97,
      words: "available at stanford.edu, stanfordalumni.org or other Stanford sites",
      cite: '"available at stanford.edu, stanfordalumni.org or other Stanford sites" (:97)',
      quoted: true,
    },
    { site: "stanford.edu", file: fz("terms-stanford"), line: 99, words: "any Stanford-affiliated entity", cite: '"any Stanford-affiliated entity" (:99)', quoted: true },
    {
      site: "virtualembryo.ai",
      file: fz("terms-virtualembryo"),
      line: 43,
      words: "Reverse engineer, disrupt, or attack the Services.",
      cite: '"Reverse engineer, disrupt, or attack the Services." (:43)',
      quoted: true,
    },
    {
      site: "virtualembryo.ai",
      file: fz("terms-virtualembryo"),
      line: 54,
      words: "All website content, datasets, documentation, software, graphics, logos, and trademarks remain the property of the organizers or their licensors unless otherwise stated.",
      cite: ':54 is an ownership notice ("All website content, datasets, documentation, software, graphics, logos, and trademarks remain the property of the organizers or their licensors unless otherwise stated.")',
      quoted: true,
    },
    { site: "virtualembryo.ai", file: fz("terms-virtualembryo"), line: 55, words: "Participants may use released competition materials only", cite: ":55 limits participants' use of released competition materials", quoted: false },
    { site: "virtualembryo.ai", file: fz("terms-virtualembryo"), line: 84, words: "Challenge Rules", cite: "separate from the Challenge Rules (:84)", quoted: true },
    { site: "virtualembryo.ai", file: fz("terms-virtualembryo"), line: 14, words: "(collectively, the “Services”)", cite: "documentation included (:14, :16)", quoted: false },
    { site: "virtualembryo.ai", file: fz("terms-virtualembryo"), line: 16, words: "documentation", cite: "documentation included (:14, :16)", quoted: true },
    { site: "virtualembryo.ai", file: fz("terms-virtualembryo"), line: 75, words: "https://virtualembryo.ai", cite: "at https://virtualembryo.ai (:75)", quoted: true },
    { site: "virtualembryo.ai", file: fz("terms-virtualembryo"), line: 45, words: "Violate applicable laws or the Official Rules.", cite: "violating them is barred to every user (:45)", quoted: false },
    {
      site: "virtualembryo.ai",
      file: fz("terms-virtualembryo"),
      line: 109,
      words: "Lab, Stanford University. All rights reserved.",
      cite: 'the page\'s footer reads "© 2026 … Lab, Stanford University. All rights reserved." (:109)',
      quoted: true,
    },
    {
      site: "virtualembryo.ai",
      file: fz("terms-stanford"),
      line: 97,
      words: "available at stanford.edu, stanfordalumni.org or other Stanford sites",
      cite: 'govern any website "available at stanford.edu, stanfordalumni.org or other Stanford sites" (research/rendered/terms-stanford-2026-10-06.txt:97)',
      quoted: true,
    },
    { site: "virtualembryo.ai", file: fz("terms-stanford"), line: 99, words: "any Stanford-affiliated entity", cite: '"Stanford" including "any Stanford-affiliated entity" (:99)', quoted: true },
    {
      site: "virtualembryo.ai",
      file: fz("terms-stanford"),
      line: 125,
      words: "only for User’s own personal, non-commercial use",
      cite: 'allow download "only for User’s own personal, non-commercial use" (:125)',
      quoted: true,
    },
    { site: "eurocontrol.int", file: fz("terms-eurocontrol"), line: 433, words: "Disclaimers", cite: 'the footer\'s "Disclaimers" item (:433)', quoted: true },
    { site: "eurocontrol.int", file: fz("terms-eurocontrol"), line: 439, words: "© EUROCONTROL", cite: 'the bare footer "© EUROCONTROL" (:439)', quoted: true },
    {
      site: "eurocontrol.int",
      file: fz("terms-eurocontrol", "html"),
      line: 1961,
      words: 'href="/info/disclaimers"',
      cite: 'its link is https://www.eurocontrol.int/info/disclaimers (href="/info/disclaimers" at research/rendered/terms-eurocontrol-2026-10-06.html:1961 and :2830)',
      quoted: true,
    },
    {
      site: "eurocontrol.int",
      file: fz("terms-eurocontrol", "html"),
      line: 2830,
      words: 'href="/info/disclaimers"',
      cite: 'its link is https://www.eurocontrol.int/info/disclaimers (href="/info/disclaimers" at research/rendered/terms-eurocontrol-2026-10-06.html:1961 and :2830)',
      quoted: true,
    },
    {
      site: "eurocontrol.int",
      file: "research/channel-loop/terms/ansperformance-disclaimer-2026-10-05.md",
      line: 28,
      words: "It may be copied in whole or in part",
      cite: "the copyright notice of ansperformance.eu's data (research/channel-loop/terms/ansperformance-disclaimer-2026-10-05.md:28)",
      quoted: false,
    },
    {
      site: "ansperformance.eu",
      file: fz("terms-eurocontrol"),
      line: 367,
      words: "Website Privacy Policy",
      cite: 'its contents headed "Website Privacy Policy" (research/rendered/terms-eurocontrol-2026-10-06.txt:367)',
      quoted: true,
    },
  ];
  /** Decision 3(1)'s five kinds, by the first word of the note. */
  const KIND = /^(refusal-type|exhaustive-negative|unanswered|shell|deferred to [a-z0-9.-]+)\b/;
  /**
   * The kind word fold 2 and this reading give each named site. Later on 6.10 Israel Post's shell answered its once-only js
   * render 403, so its kind is refusal-type (K1); kaggle.com's was read and is BARRED, so it has no kind word.
   */
  const NAMED_KINDS: Record<string, string> = {
    "mr.gov.il": "unanswered:",
    "israelpost.co.il": "refusal-type:",
    "streetlib.com": "shell:",
    "streetlib.it": "shell:",
    "adaptionlabs.ai": "shell:",
    "data.gov.il": "deferred to www.gov.il:",
    "eurocontrol.int": "exhaustive-negative:",
    "opensky-network.org": "refusal-type:",
  };
  /**
   * The NO_TERMS and TERMS_PENDING sites none of the five kinds fits yet, because none records a terms page the runner
   * could not read: sixteen with no terms URL known (the 29.9 audit's NO_TERMS_CAPTURE class), odoo.com and stripe.com
   * (their terms URL answered with no site terms), sumit.co.il (its terms URL redirect-looped), amazonaws.com and
   * spreadshirt.net (read beside a related site), un.org (its terms page answered 200 on 6.10 and is unread) and
   * wikimedia.org (its bot policies were read 30.9). The list can only shrink.
   */
  const NO_KIND = [
    "accessalyze.com",
    "accessiguard.app",
    "amazonaws.com",
    "digital-invoice.co.il",
    "ganim-mall.co.il",
    "govi.co.il",
    "h-erp.co.il",
    "haganenet.co.il",
    "huntr.com",
    "kiezelpay.com",
    "lemidatova.com",
    "mybooks.co.il",
    "odoo.com",
    "quicklyinvoice.com",
    "repebble.com",
    "rivhit.co.il",
    "society6.com",
    "spreadshirt.net",
    "stripe.com",
    "sumit.co.il",
    "swiftness.co.il",
    "un.org",
    "wikimedia.org",
  ];
  const frozenTerms = (slug: string) => {
    const frozen = `${slug}-${FROZEN_ON}`;
    const meta = JSON.parse(readFileSync(`research/rendered/${frozen}.meta.json`, "utf8")) as Capture["meta"];
    return { frozen, meta, lines: readFileSync(`research/rendered/${frozen}.txt`, "utf8").split("\n") };
  };

  it("gives the nine sites the main thread's verdicts, checked 6.10, each source naming what was read and keeping tick 45's", () => {
    // As tick 54 left them (eurocontrol.int is TERMS_PENDING again since tick 55: "tick 55" below).
    const v = tick54(verdicts());
    const then = tick45(v);
    expect(Object.keys(TERMS_READ).sort()).toEqual(Object.keys(AUDITED).filter((s) => AUDITED[s] === "TERMS_PENDING").sort());
    for (const [site, verdict] of Object.entries(TERMS_READ)) {
      expect(v[site].verdict, site).toBe(verdict);
      expect(v[site].checked, site).toBe(TERMS_CHECKED);
    }
    // The tick-45 sources, byte for byte: after TERMS_BEFORE in the seven changed sources, whole in the two shells'.
    const text = Object.keys(TERMS_READ).map((site) => `${site}\t${then[site].source}`).join("\n");
    expect(createHash("sha256").update(text).digest("hex")).toBe(TICK45_TERMS_SOURCES_SHA256);
    for (const { site, slug } of DECISIVE) {
      expect(v[site].source.startsWith(`research/rendered/${slug}-${FROZEN_ON}.txt (`), site).toBe(true);
      expect(v[site].source, site).toContain("one Opus reader and one adversarial Opus verifier, verdict by the main thread (tick 54;");
      expect(v[site].source, site).toContain(`frozen as ${RENDER} stored it`);
      expect(v[site].source.split(TERMS_BEFORE), site).toHaveLength(2);
    }
    expect(v["opensky-network.org"].source.startsWith("research/rendered/terms-opensky.meta.json (")).toBe(true);
    expect(v["opensky-network.org"].source.split(TERMS_BEFORE)).toHaveLength(2);
    // adaptionlabs.ai's shell kept its source whole; kaggle.com's, read later on its js render, ends in TERMS_BEFORE and
    // tick 45's ("the shell terms pages" below holds the rest).
    expect(v["adaptionlabs.ai"].source.includes(TERMS_BEFORE)).toBe(false);
    expect(v["kaggle.com"].source.split(TERMS_BEFORE)).toHaveLength(2);
    // The kinds the verdicts carry.
    expect(isExhaustiveNegative(v["eurocontrol.int"])).toBe(true);
    expect(isExhaustiveNegative(v["opensky-network.org"])).toBe(false);
  });

  it("rests each read verdict on a frozen copy of the 6.10 capture, whose cited line holds the decisive words the note quotes", () => {
    const v = tick54(verdicts());
    const urlsTxt = readFileSync(URLS, "utf8");
    const manifest = readFileSync("research/rendered/FROZEN.sha256", "utf8");
    for (const { site, slug, line, words } of DECISIVE) {
      const { frozen, meta, lines } = frozenTerms(slug);
      // A frozen copy of the live capture as the 6.10 render stored it, byte for byte, which no urls.txt line names.
      expect(meta.slug, site).toBe(frozen);
      expect(meta.frozen?.from, site).toBe(`research/rendered/${slug}.meta.json`);
      expect(meta.frozen?.commit, site).toBe(RENDER);
      expect(meta.fetchedAt.slice(0, 10), site).toBe(FROZEN_ON);
      expect(meta.status, site).toBe(200);
      const body = readFileSync(meta.bodyPath!);
      expect(createHash("sha256").update(body).digest("hex"), site).toBe(meta.sha256);
      expect(readFileSync(`research/rendered/${frozen}.txt`), site).toEqual(readFileSync(`research/rendered/${slug}.txt`));
      // No urls.txt line names it (freeze-capture.mjs's own rule: no word of any line is the slug); since tick 55 the comment
      // of eurocontrol.int's Disclaimers line cites its .html by file and line, a path and not a slug a render would write.
      expect(listedNames(urlsTxt).has(frozen), site).toBe(false);
      for (const ext of ["txt", "html", "meta.json"]) expect(manifest, `${frozen}.${ext}`).toContain(`  ${frozen}.${ext}\n`);
      // The decisive words at the cited line, and in the note beside the citation.
      expect(lines[line - 1], `${site} :${line}`).toContain(words);
      expect(v[site].note, site).toContain(`research/rendered/${frozen}.txt:${line}`.replace(`:${line}`, site === "virtualembryo.ai" ? ":12-13" : `:${line}`));
      if (site !== "virtualembryo.ai") expect(v[site].note, site).toContain(words);
    }
    // virtualembryo.ai: the document's title at :12, its incorporation of the Official Rules at :17, both in the note.
    const ve = frozenTerms("terms-virtualembryo").lines;
    expect(ve[11]).toBe("Website Terms of Use");
    expect(ve[16]).toContain("Official Rules, which form part of these Terms");
    expect(v["virtualembryo.ai"].note).toContain('The Official Rules "form part of these Terms" (:17)');
    expect(v["virtualembryo.ai"].note).toContain("a bar found there reopens this verdict");
    // eurocontrol.int: a privacy notice, its sections 1-9 at :153-273, and the bare footer at :439.
    const eu = frozenTerms("terms-eurocontrol").lines;
    expect(eu[152]).toMatch(/^1\. What is EUROCONTROL’s website\?/);
    expect(eu[438]).toBe("© EUROCONTROL");
    expect(eu[432]).toBe("Disclaimers");
  });

  it("states each verdict's scope finding and condition in its note, the stanford dissent included", () => {
    const v = tick54(verdicts());
    expect(v["devpost.com"].note).toMatch(/^BARRED on access: /);
    expect(v["devpost.com"].note).toContain("the seven *.devpost.com hackathon hosts and info.devpost.com are covered by inference the document supports");
    expect(v["zindi.africa"].note).toMatch(/^BARRED on copying: /);
    expect(v["zindi.africa"].note).toContain("research/rendered/terms-zindi-2026-10-06.html:50");
    expect(v["zindi.africa"].note).toContain("zindi.africa redirects there [inference]");
    expect(v["grand-challenge.org"].note).toMatch(/^CONDITIONAL_UNMET: /);
    expect(v["grand-challenge.org"].note).toContain("the five <name>.grand-challenge.org challenge hosts are covered by inference");
    expect(v["stanford.edu"].note).toMatch(/^CONDITIONAL_UNMET: /);
    expect(v["stanford.edu"].note).toContain("The verifier read BARRED");
    expect(v["stanford.edu"].note).toContain("the main thread kept CONDITIONAL_UNMET, and the outcome is the same");
    expect(v["stanford.edu"].note).toContain("aimslab.stanford.edu and quantiphy.stanford.edu are covered on the text");
    expect(v["virtualembryo.ai"].note).toMatch(/^NOT_BARRED: /);
    expect(v["eurocontrol.int"].note).toMatch(/^exhaustive-negative: the tick-45 record searched Open Terms Archive, tosdr\/tosdr-snapshots and EUROCONTROL's own GitHub organisation/);
    expect(v["eurocontrol.int"].note).toContain(EURO_PROBE.url);
    expect(v["eurocontrol.int"].note).toContain("ZERO-TESTS row 265");
    expect(v["opensky-network.org"].note).toMatch(/^refusal-type: the terms page answered HTTP 403 Forbidden on 6\.10 \(research\/rendered\/terms-opensky\.meta\.json/);
    // opensky: the live meta that refused is the evidence; its line is retired, so the weekly run never rewrites it.
    const os = JSON.parse(readFileSync("research/rendered/terms-opensky.meta.json", "utf8"));
    expect([os.status, os.error, os.fetchedAt.slice(0, 10)]).toEqual([403, "HTTP 403 Forbidden", FROZEN_ON]);
    expect(active().some((l) => l.slug === "terms-opensky")).toBe(false);
    // The shells: kaggle.com's (kind K4) was rendered once in js mode later on 6.10 and read ("the shell terms pages"
    // below); adaptionlabs' nav-only page stays, in the words of the main thread's verdict.
    expect(v["kaggle.com"].note).toMatch(/^BARRED on access and copying: /);
    expect(v["kaggle.com"].note).toContain("The plain capture of 6.10 was a JavaScript shell with 21 characters of text (kind K4");
    expect(v["kaggle.com"].note).toContain("--js --terms-shell");
    expect(v["adaptionlabs.ai"].note).toMatch(
      /^shell: nav-only shell: the 6\.10 plain capture is 200, 51 KB of HTML and 85 characters of text \(the navigation\), which capture-check grades short, not js-shell; the js route of decision 3 waits on the classifier naming this kind /,
    );
    // No note names a person's address.
    for (const site of Object.keys(TERMS_READ)) {
      expect(ADDRESS.test(v[site].note ?? ""), site).toBe(false);
      expect(ADDRESS.test(v[site].source), site).toBe(false);
    }
  });

  it("gives every site a copying field: barred with its clause cited, allowed for virtualembryo.ai, unread for the rest", () => {
    const v = verdicts();
    const raw = JSON.parse(readFileSync(VERDICTS, "utf8"));
    for (const [site, e] of Object.entries(v)) expect(["barred", "allowed", "unread"], site).toContain(e.copying);
    const barred = Object.keys(v).filter((s) => v[s].copying === "barred").sort();
    expect(barred).toEqual(
      [...Object.keys(RULING_COPY_BARRED), ...Object.keys(READ_COPY_BARRED), ...Object.keys(REVIEW_COPY_BARRED), ...Object.keys(JS_COPY_BARRED)].sort(),
    );
    for (const [site, cite] of Object.entries({ ...RULING_COPY_BARRED, ...READ_COPY_BARRED, ...JS_COPY_BARRED })) expect(v[site].note, site).toContain(cite);
    // The review's two: the note cites the file and line, which hold the clause the note quotes.
    for (const [site, { file, line }] of Object.entries(REVIEW_COPY_BARRED)) {
      expect(v[site].note, site).toContain(`(${file}:${line})`);
      expect(v[site].note, site).toMatch(/^copying barred \(tick-54 review; |\. Copying barred \(tick-54 review; /);
      expect(readFileSync(file, "utf8").split("\n")[line - 1], site).toContain(COPY_CLAUSE[site].slice(1, -1));
    }
    expect(v["tipalti.com"].note).toContain("the clause TERMS_BARRED in scripts/render-watch.mjs rests on");
    expect(termsBarred("tipalti.com")?.why).toContain("research/rendered/terms-tipalti-website.txt:245");
    // A clause quoted only as a caveat beside a verdict resting on something else waits for fold 10(i).
    for (const [site, words] of Object.entries(CAVEAT_UNREAD)) {
      expect(v[site].copying, site).toBe("unread");
      expect(v[site].note, site).toContain(words);
    }
    for (const site of Object.keys(RULING_COPY_BARRED)) expect(v[site].note, site).toContain("copying barred (ruling 6.10 row 21 (d), decision 4(2))");
    for (const [site, words] of Object.entries(COPY_CLAUSE)) expect(v[site].note, site).toContain(words);
    expect(Object.keys(v).filter((s) => v[s].copying === "allowed")).toEqual(["virtualembryo.ai"]);
    expect(v["virtualembryo.ai"].note).toContain("copying: allowed, read 6.10");
    expect(Object.keys(v).filter((s) => v[s].copying === "unread")).toHaveLength(Object.keys(v).length - 12);
    // The field sits after "note" (or after "checked" when there is none) in every entry, and the _about says what it is.
    for (const [site, e] of Object.entries(raw.sites as Record<string, Entry>)) expect(Object.keys(e).at(-1), site).toBe("copying");
    expect(raw._about).toContain('every entry carries a fifth field after "note", "copying"');
    expect(raw._about.endsWith(` ${ABOUT_COPYING}`)).toBe(true);
    expect(raw._about).toContain("which is not \"allowed\" (decision 4(2))");
    expect(raw._about).toContain('refusal-type, exhaustive-negative, unanswered, shell or "deferred to <site>" (decision 3(1))');
  });

  it("ties every secondary quote and line citation of the read notes to its line, the words there and in the note", () => {
    const v = tick54(verdicts());
    const lines = new Map<string, string[]>();
    for (const { site, file, line, words, cite, quoted } of SECONDARY) {
      if (!lines.has(file)) lines.set(file, readFileSync(file, "utf8").split("\n"));
      expect(lines.get(file)![line - 1], `${file}:${line}`).toContain(words);
      expect(v[site].note, `${site} :${line}`).toContain(cite);
      expect(cite, `${site} :${line}`).toMatch(new RegExp(`:${line}(?!\\d)`));
      if (quoted) expect(cite, `${site} :${line}`).toContain(words);
    }
    expect(SECONDARY.filter((s) => s.site === "eurocontrol.int").map((s) => s.line)).toEqual([433, 439, 1961, 2830, 28]);
  });

  it("answers the terms-read review: ansperformance's second document, eurocontrol's Disclaimers link and R1 record, virtualembryo's Stanford question", () => {
    // eurocontrol.int's entry as tick 54 left it; tick 55 answered the open question ("tick 55" below).
    const v = tick54(verdicts());
    const audit = readFileSync(AUDIT, "utf8");
    const read = audit.slice(audit.indexOf("## Terms read (6.10.2026, tick 54)"));
    const row = (site: string) => read.split("\n").find((l) => l.startsWith(`| \`${site}\` | `))!;
    // ansperformance.eu: its second linked document was read 6.10 and is a privacy notice only.
    const ans = v["ansperformance.eu"].note!;
    expect(ans).toContain(
      "the footer's second document, EUROCONTROL's 'Privacy statement' (footer.html:222-224), does not stand in the way: it was read on 6.10 (tick 54) and is a privacy notice only",
    );
    // Since tick 55 it names eurocontrol.int's entry as it is: TERMS_PENDING again.
    expect(ans).toContain(ANS_NOW);
    expect(ans).not.toContain(ANS_TICK54);
    expect(ans).not.toContain("TERMS_PENDING page");
    expect(v["ansperformance.eu"].verdict).toBe("CONDITIONAL_UNMET");
    // eurocontrol.int: the Disclaimers link is in the frozen HTML, the R1 record's two missing steps, and the open question,
    // which holds the verdict at NO_TERMS until the main thread answers it (robots-verdict.mjs keeps the note).
    const eu = v["eurocontrol.int"].note!;
    expect(eu).not.toContain("holds no URL");
    expect(eu).toContain(
      "The tick-54 review found the record short of R1's list in two steps: the tick-45 URL record (TERMS-AUDIT-2026-10-05-prize-events.md, eurocontrol.int's entries) lists the euctrl-pru organisation, the eurocontrol organisation's repository listing, two repository searches and a user search, but no grep of their repositories' contents for terms, legal, privacy, impressum or mentions légales files, and no search of this repository",
    );
    const OPEN = "Open for the main thread before scripts/robots-verdict.mjs is run on the row-265 probe: whether the Disclaimers page is read first.";
    expect(eu.endsWith(OPEN)).toBe(true);
    expect(v["eurocontrol.int"].verdict).toBe("NO_TERMS");
    for (const u of ["https://github.com/euctrl-pru`", "https://github.com/orgs/eurocontrol/repositories?type=all`", "https://github.com/search?type=users&q=eurocontrol`"]) {
      expect(audit, u).toContain(u);
    }
    const euRow = row("eurocontrol.int");
    expect(euRow).toContain("(:433; its link, /info/disclaimers, is at `research/rendered/terms-eurocontrol-2026-10-06.html:1961` and :2830)");
    expect(euRow).toContain("The tick-54 review found the record short of R1's list in two steps");
    expect(euRow).toContain("Whether the Disclaimers page is read before `scripts/robots-verdict.mjs` runs on the row-265 probe is open for the main thread.");
    // virtualembryo.ai: the Stanford scope question, open for the main thread before its rules page is dispatched.
    const ve = v["virtualembryo.ai"].note!;
    expect(ve).toContain("Open for the main thread (tick-54 review): ");
    expect(ve).toContain(
      "Neither the reader nor the verifier weighed whether virtualembryo.ai is such a site; the main thread rules on it before the rules page (the /challenge line, the one URL prize-dispatch --skip-captured offers) is dispatched, and if it is, this site takes stanford.edu's verdict and copying field.",
    );
    expect(v["virtualembryo.ai"].verdict).toBe("NOT_BARRED");
    expect(row("virtualembryo.ai")).toContain("Open for the main thread (tick-54 review): the footer names a Stanford University lab");
    // kaggle.com: the --js --terms-shell route was built 6.10 (the base this branch merged), not "being built"; the note
    // now also says when it was queued and rendered.
    expect(v["kaggle.com"].note).toContain("(decision 3(2); built 6.10, commit 5a3ee24; queued c058238, rendered a3cb438)");
    expect(v["kaggle.com"].note).not.toContain("being built");
    expect(readFileSync("scripts/queue-zero-test.mjs", "utf8")).toContain("--terms-shell");
    expect(row("kaggle.com")).toContain("(built 6.10, commit 5a3ee24)");
    // The audit's copying paragraph counts the review's two and names the caveat-only sites, as they stood after the terms
    // read (121 unread); kaggle.com's read later on 6.10 made it 120, which the shell section states.
    expect(audit).toContain('"allowed" for virtualembryo.ai, and "unread" for the other 121, which is not "allowed".');
    expect(audit).toContain("for the two other sites whose verdicts already rested on a read copying clause (codabench.org,");
    expect(Object.keys(v).length - 12).toBe(120);
    expect(audit).toContain("so eleven entries of `terms-verdicts.json` are barred and 120 unread, against ten and 121 after the terms read above.");
    // No note or row names a person: the footer's words before " Lab," (the lab's name) stay out of both.
    const footer = readFileSync(fz("terms-virtualembryo"), "utf8").split("\n")[108];
    const named = footer.slice(0, footer.indexOf(" Lab,"));
    expect(named.length).toBeGreaterThan("© 2026 ".length);
    expect(ve.includes(named)).toBe(false);
    expect(row("virtualembryo.ai").includes(named)).toBe(false);
  });

  it("opens every NO_TERMS and TERMS_PENDING note with its kind word, but for the sites no kind fits yet, which are named", () => {
    const v = verdicts();
    const pending = Object.keys(v).filter((s) => ["NO_TERMS", "TERMS_PENDING"].includes(v[s].verdict));
    const kindless = pending.filter((s) => !KIND.test(v[s].note ?? ""));
    // NO_KIND as the terms read left it, and (tick 55) the two sites a terms link reopened: their terms pages are not fetched
    // yet, so no kind fits, and each note opens "terms unread:".
    expect(kindless.sort()).toEqual([...NO_KIND, ...Object.keys(LINKS_FOUND)].sort());
    for (const site of Object.keys(LINKS_FOUND)) expect(v[site].note!.startsWith("terms unread: "), site).toBe(true);
    // The kind words; eurocontrol.int's as tick 54 left it (exhaustive-negative, before the Disclaimers link reopened it).
    const t54 = tick54(v);
    for (const [site, word] of Object.entries(NAMED_KINDS)) expect(t54[site].note!.startsWith(`${word} `), site).toBe(true);
    // The refusal-type and exhaustive-negative notes kept their words; nevo's gained its [robots-bar] sentence, and still
    // opens exhaustive-negative (only scripts/robots-verdict.mjs may change its verdict).
    for (const site of ["bitsofgold.co.il", "greeninvoice.co.il", "zazzle.com", "medium.com", "knesset.gov.il", "kolzchut.org.il", "www.gov.il"]) {
      expect(v[site].note, site).toMatch(/^refusal-type\b/);
    }
    expect(isExhaustiveNegative(v["nevo.co.il"])).toBe(true);
    expect(v["nevo.co.il"].note).toContain(
      "[robots-bar] (ruling 6.10 row 21 (a)): the ten captures of 29.9 are D1(1) — compliance and decisions not to act only, never a product input",
    );
    expect(v["israelpost.co.il"].note).toContain("kind K4 before, shell: the plain GET of 30.9 answered 200 with a React shell");
    expect(v["data.gov.il"].note).toContain("it takes the kind of www.gov.il's terms, refusal-type today");
    // wikisource points at decision 2's two triggers, and stays CONDITIONAL_UNMET until one of them.
    expect(v["wikisource.org"].verdict).toBe("CONDITIONAL_UNMET");
    expect(v["wikisource.org"].note).toContain("the first of decision 2(2)'s two triggers");
    expect(v["wikisource.org"].note).toContain("(i) a brand site live at a URL the loop controls");
    expect(v["wikisource.org"].note).toContain("(ii) step 8 done, the brand mailbox in the UA");
    expect(v["wikisource.org"].note).not.toContain("FABLE_QUEUE row 21 (b)");
  });

  it("keeps the copying field when scripts/robots-verdict.mjs sets a verdict (judgeSite, on a site of the real file)", () => {
    // agenthon.net as tick 45 left it, with the copying field the file now gives it, judged on the frozen copy of the
    // robots.txt it read on 6.10: the entry the script writes keeps the field, last, as the file has it. (Its tick-54 entry,
    // from the fixture: agenthon.net is TERMS_PENDING since tick 55.)
    const v = tick54(verdicts());
    const file = JSON.parse(readFileSync(VERDICTS, "utf8"));
    const site = "agenthon.net";
    const then = tick45(v);
    const sites = { ...then, [site]: { ...then[site], copying: v[site].copying } };
    const capture = frozenCapture(citedCapture(v[site].source)!.path);
    const out = judgeSite({ site, verdicts: { ...file, sites }, urls: readFileSync(FIXTURE, "utf8"), readCapture: readerOf(capture), today: ROBOTS_CHECKED });
    expect(out.changed).toBe(true);
    expect(out.verdicts.sites[site].copying).toBe("unread");
    expect(Object.keys(out.verdicts.sites[site])).toEqual(["verdict", "source", "checked", "note", "copying"]);
    expect(out.verdicts.sites[site]).toEqual(v[site]);
  });

  it("records the reading in the audit note's section after the robots verdicts: how it was read, the nine rows, the shells and the copying field", () => {
    const audit = readFileSync(AUDIT, "utf8");
    const start = audit.indexOf("## Terms read (6.10.2026, tick 54)");
    // The section ends where the next begins: the shell terms pages rendered once, later on 6.10, the note's last.
    const text = audit.slice(start, audit.indexOf("\n## ", start + 1) + 1);
    expect(audit.slice(start + text.length).startsWith("## Shell terms pages rendered once (6.10.2026, tick 54)\n")).toBe(true);
    expect(text).toContain("read in full by one Opus reader and then by one adversarial Opus verifier");
    expect(text).toContain("the main thread (Fable 5.1, tick 54) ruled on the two records");
    // The rows state the verdicts as the terms read left them, before kaggle.com's js render.
    const v = jsReadBefore(verdicts());
    const rows = text.split("\n").filter((l) => /^\| `[a-z0-9.-]+` \|/.test(l));
    expect(rows.map((r) => r.match(/^\| `([a-z0-9.-]+)` \|/)![1])).toEqual([
      "devpost.com",
      "zindi.africa",
      "grand-challenge.org",
      "stanford.edu",
      "virtualembryo.ai",
      "eurocontrol.int",
      "opensky-network.org",
      "kaggle.com",
      "adaptionlabs.ai",
    ]);
    for (const row of rows) {
      const cells = row.split(" | ");
      expect(cells, row.slice(0, 40)).toHaveLength(7);
      const site = cells[0].match(/`([a-z0-9.-]+)`/)![1];
      expect(cells[1].startsWith(v[site].verdict), site).toBe(true);
      const d = DECISIVE.find((x) => x.site === site);
      if (d) expect(row, site).toContain(`research/rendered/${d.slug}-${FROZEN_ON}.txt`);
    }
    const stanford = rows.find((r) => r.startsWith("| `stanford.edu` |"))!;
    expect(stanford).toContain("CONDITIONAL_UNMET (the verifier read BARRED)");
    expect(stanford).toContain("Dissent: the verifier read BARRED");
    expect(text).toContain("**The two shells.**");
    expect(text).toContain("**The copying field and the kind words (ruling 6.10 row 21, fold 2).**");
    expect(text).toContain("**Notes with no kind word yet.** Twenty-three other NO_TERMS or TERMS_PENDING notes");
    expect(NO_KIND).toHaveLength(23);
    expect(ADDRESS.test(text)).toBe(false);
  });
});

/**
 * Tick 54 (6.10.2026), later: the two shell terms pages rendered once in js mode under ruling 6.10 row 21 (c) decision 3(2)
 * (queued by queue-zero-test --js --terms-shell in c058238, rendered by the run of a3cb438). kaggle.com's came back as its
 * Terms of Use: frozen as terms-kaggle-2026-10-06-a3cb438 (freeze-capture's name for a second copy of one slug and day,
 * <slug>-<day>-<commit>: the plain shell holds <slug>-<day>), read by one Opus reader and one adversarial Opus verifier,
 * and ruled BARRED by the main thread on three grounds (:77 crawling or scraping any page by manual or automated means,
 * :87 copying or publishing Content without its owner's consent, :70 internal, personal, non-commercial use only).
 * Israel Post's came back 403: refusal-type, no second attempt, no other page. Both js lines are retired with the js flag
 * kept, so the route's once-only check still sees them (queue-zero-test.test.ts runs it against the real store).
 */
describe("tick 54: the shell terms pages rendered once (6.10)", () => {
  const JS_FROZEN = "terms-kaggle-2026-10-06-a3cb438";
  const JS_COMMIT = "a3cb438";
  const PLAIN_FROZEN = "terms-kaggle-2026-10-06";
  const KAGGLE_RULES = [24, 27, 38, 57, 100, 112, 118, 119, 133, 136, 179, 201, 204, 210, 213, 235, 241];
  const ISRAEL_POST_RETIRED =
    "# retired (6.10.2026: rendered once in js mode under ruling 6.10 row 21 (c) 3(3); the site answered 403, refusal-type, 16(d) D2(iv)) — https://doar.israelpost.co.il/content/term-of-use/\tterms-israel-post\tjs";
  /** The lines of the frozen js render that kaggle.com's source and note cite, and words each holds (quoted: the entry quotes them). */
  const KAGGLE_LINES: { line: number; words: string; quoted: boolean }[] = [
    { line: 53, words: "June 22, 2025 (active)", quoted: true },
    { line: 59, words: "Effective Date: June 22, 2025", quoted: true },
    { line: 57, words: "YOUR USE OF AND ACCESS TO OUR SERVICES (DEFINED BELOW) ARE SUBJECT TO THE FOLLOWING TERMS", quoted: true },
    { line: 60, words: "website(s), products, services and applications", quoted: true },
    { line: 62, words: "the www.kaggle.com website", quoted: false },
    { line: 63, words: "signed by both you and us", quoted: true },
    { line: 70, words: "for your own internal, personal, non-commercial use, and not on behalf of or for the benefit of any third party", quoted: true },
    { line: 74, words: "otherwise use the Services or interact with the Services in a manner that", quoted: false },
    { line: 75, words: "Acceptable Use Policy", quoted: false },
    {
      line: 77,
      words: "“Crawls,” “scrapes,” or “spiders” any page, data, or portion of or relating to the Services or Content (through use of manual or automated means)",
      quoted: true,
    },
    { line: 78, words: "significant portion", quoted: true },
    { line: 87, words: "for any purpose any Content not owned by you, (i) without the prior consent of the owner of that Content", quoted: true },
    { line: 89, words: "just because this functionality exists, doesn’t mean that all the restrictions above don’t apply — they do!", quoted: true },
    { line: 103, words: "a skills-based competition or challenge on the Services", quoted: true },
    { line: 108, words: "template for the Competition Rules", quoted: false },
    { line: 113, words: "an Environment by itself is not a Competition", quoted: false },
    { line: 120, words: "assist you in setting up and managing your Competition", quoted: false },
    // The verifier's record (tick-54 review fix): the :118 licence, who is a user (:67, :96), and the documents the Terms
    // name that nobody read (:60, :104).
    { line: 60, words: "the Privacy Policy and the Community Guidelines", quoted: true },
    { line: 67, words: "You may be required to sign up for an account", quoted: false },
    { line: 96, words: "gain access to the Services", quoted: true },
    { line: 104, words: "may impose additional restrictions or requirements for Competitions", quoted: true },
    { line: 118, words: "all other users of the Services", quoted: true },
    { line: 118, words: "as permitted by the functionality of the Services", quoted: true },
  ];
  /** The verifier's seven refutations: one qualifies :77 itself, six correct supporting points (each cites its line). */
  const SIX_CORRECTIONS = [":63, not :120", "(:118)", "by :70", ":78's", "(:108)", "(:113)"];
  const UNREAD = "Not read, all named by the Terms: the Acceptable Use Policy (:75), the Privacy Policy and the Community Guidelines, which the Terms include (:60), and each competition's own Competition Rules, which";

  it("freezes the js render under freeze-capture's name for a second copy of one slug and day, beside the plain shell's copy", () => {
    const urlsTxt = readFileSync(URLS, "utf8");
    const manifest = readFileSync("research/rendered/FROZEN.sha256", "utf8");
    const meta = JSON.parse(readFileSync(`research/rendered/${JS_FROZEN}.meta.json`, "utf8"));
    const plain = JSON.parse(readFileSync(`research/rendered/${PLAIN_FROZEN}.meta.json`, "utf8"));
    // <slug>-<fetchedAt day> is the plain shell's (frozen first, 3(2)(iv)); the js render took <slug>-<day>-<commit>.
    expect(JS_FROZEN).toBe(`${PLAIN_FROZEN}-${meta.frozen.commit}`);
    expect([meta.slug, meta.frozen.from, meta.frozen.commit, meta.frozen.on, meta.frozen.flagged]).toEqual([
      JS_FROZEN,
      "research/rendered/terms-kaggle.meta.json",
      JS_COMMIT,
      FROZEN_ON,
      undefined,
    ]);
    expect([meta.url, meta.status, meta.renderedWith, meta.fetchedAt]).toEqual(["https://www.kaggle.com/terms", 200, "chromium", "2026-10-06T09:48:50.939Z"]);
    expect(createHash("sha256").update(readFileSync(meta.bodyPath)).digest("hex")).toBe(meta.sha256);
    // The live capture is that render, byte for byte; its line is retired, so no render rewrites it either.
    const txt = readFileSync(`research/rendered/${JS_FROZEN}.txt`);
    expect(txt.equals(readFileSync("research/rendered/terms-kaggle.txt"))).toBe(true);
    expect(txt.toString("utf8").split("\n").length - 1).toBe(167);
    expect(classifyCapture(readCapture(JS_FROZEN)).kind).toBe("ok");
    // The plain shell's copy, frozen --allow-flagged before the render, is what the plain GET saw.
    expect([plain.slug, plain.frozen.commit, plain.frozen.flagged.kind]).toEqual([PLAIN_FROZEN, RENDER_COMMIT, "js-shell"]);
    expect(classifyCapture(readCapture(PLAIN_FROZEN)).kind).toBe("js-shell");
    for (const slug of [JS_FROZEN, PLAIN_FROZEN]) {
      expect(urlsTxt.includes(slug), slug).toBe(false);
      for (const ext of ["txt", "html", "meta.json"]) expect(manifest, `${slug}.${ext}`).toContain(`  ${slug}.${ext}\n`);
    }
  });

  it("rests kaggle.com's BARRED on the frozen js render, whose cited lines hold the words the entry quotes", () => {
    const v = verdicts();
    const k = v["kaggle.com"];
    expect([k.verdict, k.checked, k.copying]).toEqual(["BARRED", TERMS_CHECKED, "barred"]);
    expect(k.note).toMatch(/^BARRED on access and copying: /);
    expect(k.source.startsWith(`research/rendered/${JS_FROZEN}.txt (Kaggle's Terms of Use, `)).toBe(true);
    expect(k.source).toContain("read in full by one Opus reader and one adversarial Opus verifier, verdict by the main thread (tick 54;");
    expect(k.source).toContain(`frozen as ${JS_COMMIT} stored it`);
    expect(k.source).toContain('"Shell terms pages rendered once (6.10.2026, tick 54)"');
    expect(tick45(v)["kaggle.com"].verdict).toBe("TERMS_PENDING");
    expect(k.source.endsWith(`${TERMS_BEFORE}${tick45(v)["kaggle.com"].source}`)).toBe(true);
    expect(k.note).toContain(`research/rendered/${JS_FROZEN}.txt:77`);
    expect(k.note).toContain(`that shell is frozen as research/rendered/${PLAIN_FROZEN}.txt`);
    const lines = readFileSync(`research/rendered/${JS_FROZEN}.txt`, "utf8").split("\n");
    const text = `${k.source} ${k.note}`;
    for (const { line, words, quoted } of KAGGLE_LINES) {
      expect(lines[line - 1], `:${line}`).toContain(words);
      expect(text, `:${line}`).toMatch(new RegExp(`:${line}(?!\\d)`));
      if (quoted) expect(text, `:${line}`).toContain(words);
    }
    // The verifier's record as it stands (tick-54 review fix): seven refutations, the verdict unmoved. One qualifies the
    // first ground, :77, which therefore does not carry the verdict alone; the other six are supporting points, each
    // named; every document the Terms name and nobody read is listed.
    expect(k.note).toContain("The verifier agreed BARRED and recorded seven refutations of the reader's, none of which moves the verdict. ");
    expect(k.note).toContain("One qualifies :77 itself: :77 reaches manual means too, so a narrower bulk-extraction reading can be argued");
    expect(k.note).toContain("the verdict stands without it, because :87 and :70 each bar the runner alone.");
    const six = k.note.split("The other six correct supporting points: ")[1]?.split(". Not read, ")[0] ?? "";
    const items = six.split("; ");
    expect(items).toHaveLength(6);
    SIX_CORRECTIONS.forEach((cite, i) => expect(items[i], cite).toContain(cite));
    expect(k.note).toContain(UNREAD);
    expect(k.note).not.toContain("four supporting points");
    // Every rules line of the site is cited, pinned, and none was fetched.
    expect(pinnedLines(k.note)).toEqual(KAGGLE_RULES);
    expect(rulesOf("kaggle.com").map((e) => e.n)).toEqual(KAGGLE_RULES);
    expect(ADDRESS.test(k.note)).toBe(false);
    expect(ADDRESS.test(k.source)).toBe(false);
  });

  it("puts kaggle.com in TERMS_BARRED: the gate refuses its 17 rules URLs, build-arena's among them, and its terms page in either mode", () => {
    const v = verdicts();
    const b = termsBarred("www.kaggle.com");
    expect(b?.domain).toBe("kaggle.com");
    expect(b?.why).toContain(`research/rendered/${JS_FROZEN}.txt:77`);
    const rules = rulesOf("kaggle.com");
    expect(rules).toHaveLength(17);
    expect(rules.filter((e) => e.url.includes("build-arena")).map((e) => e.n)).toEqual([112]);
    for (const e of rules) {
      const gate = termsGate(e.url, e.slug, v);
      expect(gate.ok, e.url).toBe(false);
      expect(gate.why, e.url).toMatch(/^kaggle\.com is in TERMS_BARRED: /);
    }
    for (const js of [false, true]) expect(termsGate("https://www.kaggle.com/terms", "terms-kaggle", v, { js }).why, String(js)).toMatch(/^kaggle\.com is in TERMS_BARRED: /);
  });

  it("retires both js lines in their forms with the flag kept, under the route's comments, and leaves nothing of either site active", () => {
    const v = verdicts();
    const text = readFileSync(URLS, "utf8").split("\n");
    expect(text.filter((l) => l.endsWith("\tterms-kaggle\tjs"))).toEqual([`${TERMS_LINES["kaggle.com"].state} — https://www.kaggle.com/terms\tterms-kaggle\tjs`]);
    expect(text.filter((l) => l.endsWith("\tterms-israel-post\tjs"))).toEqual([ISRAEL_POST_RETIRED]);
    for (const slug of ["terms-kaggle", "terms-israel-post"]) {
      const at = text.findIndex((l) => l.endsWith(`\t${slug}\tjs`));
      expect(text[at - 1].startsWith(`# ${TERMS_SHELL_RULING} `), slug).toBe(true);
      expect(text[at - 1], slug).toContain(`the plain capture research/rendered/${slug} (sha256 `);
    }
    expect(active().filter((e) => ["kaggle.com", "israelpost.co.il"].includes(siteOfUrl(e.url)))).toEqual([]);
    // Nothing left for the gate to pause: a retired line is a comment, never touched again.
    expect(applyVerdicts(text.join("\n"), v).paused).toEqual([]);
    // ZERO-TESTS row 235 reads BARRED in the form rows 236-242 took.
    expect(zeroRows().get(235)?.row).toMatch(
      /\*\*READ 6\.10 \(tick 54\): BARRED: the plain GET saw a JavaScript shell \(kind K4\), and the once-only js render of ruling 6\.10 row 21 decision 3\(2\) read the Terms of Use: research\/rendered\/terms-kaggle-2026-10-06-a3cb438\.txt:77 [^|]+; kaggle\.com is in TERMS_BARRED, and the js line is retired in its form\.\*\* \|$/,
    );
  });

  it("records Israel Post's js render as the site's answer: 403, refusal-type, no second attempt and no Israel Post page until GitHub-hosted terms are read", () => {
    const v = verdicts();
    const p = v["israelpost.co.il"];
    const meta = JSON.parse(readFileSync("research/rendered/terms-israel-post.meta.json", "utf8"));
    expect([meta.url, meta.status, meta.error, meta.renderedWith, meta.bodyPath, meta.fetchedAt.slice(0, 10)]).toEqual([
      "https://doar.israelpost.co.il/content/term-of-use/",
      403,
      "HTTP 403",
      "chromium",
      null,
      FROZEN_ON,
    ]);
    expect([p.verdict, p.checked, p.copying]).toEqual(["NO_TERMS", TERMS_CHECKED, "unread"]);
    expect(p.note).toMatch(
      /^refusal-type: the once-only js render of the terms page answered HTTP 403 on 6\.10 \(research\/rendered\/terms-israel-post\.meta\.json: status 403, error "HTTP 403", renderedWith chromium, fetched 2026-10-06T09:48:52\.118Z; /,
    );
    expect(p.note).toContain(meta.fetchedAt);
    expect(p.note).toContain("kind K1 under ruling 6.10 row 21 decision 3(1)");
    expect(p.note).toContain("kind K4 before, shell: ");
    expect(p.note).toContain("frozen as research/rendered/terms-israel-post-2026-09-30.txt");
    expect(p.note).toContain("there is no second attempt in any mode, and the js line is retired");
    expect(p.note).toContain("no Israel Post page is fetched, ever, until a GitHub-hosted copy of its terms is read");
    expect(p.note).toContain("the registered-mail rate (documents ruling fold 11(c)");
    expect(p.note).toContain("step 2's registered-mail notice stays recorded, not asked");
    expect(isExhaustiveNegative(p)).toBe(false);
    expect(ADDRESS.test(p.note ?? "")).toBe(false);
    // The plain shell of 30.9, frozen before the render, is the record of what the plain GET saw.
    const shell = JSON.parse(readFileSync("research/rendered/terms-israel-post-2026-09-30.meta.json", "utf8"));
    expect([shell.status, shell.frozen.flagged.kind]).toEqual([200, "js-shell"]);
    // The gate refuses the terms page in either mode, and any other page of the site.
    for (const js of [false, true]) {
      expect(termsGate("https://doar.israelpost.co.il/content/term-of-use/", "terms-israel-post", v, { js }).ok, String(js)).toBe(false);
    }
    expect(termsGate("https://www.israelpost.co.il/", "terms-israel-post-rates", v, { js: true }).ok).toBe(false);
    // ZERO-TESTS row 233 says so in the form opensky-network.org's row 243 took.
    const row = zeroRows().get(233)?.row ?? "";
    expect(row).toMatch(/\*\*RETIRED 6\.10 \(403 to the runner; 16\(d\) D2\(iv\)\)\.\*\* \|$/);
    expect(row).toContain("retired 30.9 (tick 31): a JavaScript shell with reCAPTCHA, only the title rendered; re-queued once in js mode 6.10 (ruling 6.10 row 21 (c) 3(3))");
  });

  it("records both in the audit note's section after the terms read: decision 3, the two rows and the copying count", () => {
    const audit = readFileSync(AUDIT, "utf8");
    const start = audit.indexOf("## Shell terms pages rendered once (6.10.2026, tick 54)");
    expect(start).toBeGreaterThan(audit.indexOf("## Terms read (6.10.2026, tick 54)"));
    // The section ends where tick 55's begins, the note's last since then.
    const end = audit.indexOf("\n## ", start + 1);
    const text = audit.slice(start, end + 1);
    expect(audit.slice(end + 1).startsWith("## Terms links found after the verdicts (6.10.2026, tick 55)\n")).toBe(true);
    expect(text).toContain("whatever comes back is the answer (3(2)(vi))");
    expect(text).toContain("read in full by one Opus reader and then by one adversarial Opus verifier");
    expect(text).toContain("the main thread (Fable 5.1, tick 54) ruled on the two records");
    expect(text).toContain("`<slug>-<day>-<commit>`");
    const v = verdicts();
    const rows = text.split("\n").filter((l) => /^\| `[a-z0-9.-]+` \|/.test(l));
    expect(rows.map((r) => r.match(/^\| `([a-z0-9.-]+)` \|/)![1])).toEqual(["kaggle.com", "israelpost.co.il"]);
    for (const row of rows) {
      const cells = row.split(" | ");
      expect(cells, row.slice(0, 40)).toHaveLength(6);
      const site = cells[0].match(/`([a-z0-9.-]+)`/)![1];
      expect(cells[3].startsWith(v[site].verdict), site).toBe(true);
    }
    const [kaggle, post] = rows;
    expect(kaggle).toContain(`\`research/rendered/${PLAIN_FROZEN}.txt\``);
    expect(kaggle).toContain(`\`research/rendered/${JS_FROZEN}.txt:77\``);
    expect(kaggle).toContain(KAGGLE_LINES.find((x) => x.line === 77)!.words);
    expect(kaggle).toContain("17 rules URLs refused");
    // "The reading" states the verifier's record as the note does: seven refutations, the :77 caveat, the unread documents.
    const reading = text.split("\n").find((l) => l.startsWith("**The reading.** ")) ?? "";
    expect(reading).toContain("The verifier's record holds seven refutations of the reader's, none of which moves the verdict.");
    expect(reading).toContain("One qualifies the first ground itself: :77 reaches manual means too");
    expect(reading).toContain("the verdict does not wait on it, since :87 and :70 each bar the runner alone.");
    const sixInAudit = reading.split("The other six correct supporting points: ")[1]?.split(". Not read, ")[0] ?? "";
    expect(sixInAudit.split("; ")).toHaveLength(6);
    for (const cite of ["(:120)", "(:118)", ":70 bars", ":78", "(:108)", "(:113)"]) expect(sixInAudit, cite).toContain(cite);
    expect(reading).toContain(UNREAD);
    expect(post).toContain("`research/rendered/terms-israel-post-2026-09-30.txt`");
    expect(post).toContain("HTTP 403, no body (`research/rendered/terms-israel-post.meta.json`");
    expect(post).toContain("NO_TERMS (refusal-type; shell before)");
    expect(text).toContain("eleven entries of `terms-verdicts.json` are barred and 120 unread");
    expect(Object.values(v).filter((e) => e.copying === "barred")).toHaveLength(11);
    expect(ADDRESS.test(text)).toBe(false);
  });
});

/**
 * Tick 55 (6.10.2026): the terms links found after the verdicts. Two NO_TERMS verdicts rested on "no terms link anywhere"
 * (ruling 30.9 16(d) D2(iv); ruling R1), and each site's own capture links a terms-like page in its footer, so the main
 * thread ruled both TERMS_PENDING again (logs/CHANNEL_LOOP.md §9, "Queued 6.10 (tick 54)" item 1), checked 6.10: one plain
 * terms- line each, queued once by queue-zero-test.mjs with its ZERO-TESTS row; the robots.txt probe of each paused; no
 * robots verdict for either before the reading (D2(iv): a TERMS_PENDING site gets its terms page and nothing else); their
 * rules URLs refused by the gate. agenthon.net's NO_TERMS_ROBOTS_OK is the first robots verdict taken back, and
 * scripts/robots-verdict.mjs needed no change for it.
 */
describe("tick 55: the terms links found after the verdicts", () => {
  const fixture = () => JSON.parse(readFileSync(LINKS_FIXTURE, "utf8")) as Record<string, Entry>;
  const pendingWhy = (site: string) =>
    `${site} is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))`;

  it("keeps the two tick-54 entries as a fixture, as terms-verdicts.json held them at 364bf71, and changed nothing else but one parenthetical", () => {
    const bytes = readFileSync(LINKS_FIXTURE);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(LINKS_FIXTURE_SHA256);
    expect(Object.keys(fixture()).sort()).toEqual(Object.keys(LINKS_FOUND).sort());
    // The tick-54 entries are what the "tick 54" blocks hold: agenthon.net NO_TERMS_ROBOTS_OK as the script writes it,
    // eurocontrol.int NO_TERMS, exhaustive-negative.
    expect(isRobotsOkVerdict(fixture()["agenthon.net"])).toBe(true);
    expect(isExhaustiveNegative(fixture()["eurocontrol.int"])).toBe(true);
    let base: string | null = null;
    try {
      base = execFileSync("git", ["show", `${LINKS_BASE}:${VERDICTS}`], { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" });
    } catch {
      base = null; // a shallow CI checkout has no 364bf71; the pinned sha256 above still holds the fixture
    }
    if (base === null) return;
    const then = JSON.parse(base).sites as Record<string, Entry>;
    for (const [site, e] of Object.entries(fixture())) expect(e, site).toEqual(then[site]);
    // No other entry changed since 364bf71, but ansperformance.eu's one parenthetical on eurocontrol.int's entry.
    const now = verdicts();
    expect(Object.keys(now).sort()).toEqual(Object.keys(then).sort());
    for (const site of Object.keys(now)) {
      if (Object.hasOwn(LINKS_FOUND, site)) continue;
      const was = site === "ansperformance.eu" ? { ...then[site], note: then[site].note!.replace(ANS_TICK54, ANS_NOW) } : then[site];
      expect(now[site], site).toEqual(was);
    }
    expect(then["ansperformance.eu"].note!.split(ANS_TICK54)).toHaveLength(2);
  });

  it("sets both TERMS_PENDING, checked 6.10, each source naming the terms URL and where its link was observed, and keeping tick 54's", () => {
    const v = verdicts();
    const t54 = tick54(v);
    for (const [site, f] of Object.entries(LINKS_FOUND)) {
      const e = v[site];
      expect([e.verdict, e.checked, e.copying], site).toEqual(["TERMS_PENDING", "2026-10-06", "unread"]);
      expect(e.copying, site).toBe(t54[site].copying);
      expect(Object.keys(e), site).toEqual(["verdict", "source", "checked", "note", "copying"]);
      // The source: the terms URL first (the terms- line's URL), where the link was observed, and the tick-54 source after
      // the separator, once, byte for byte.
      expect(t54[site].verdict, site).toBe(f.before);
      expect(e.source.startsWith(`${f.url} (link observed in a capture: `), site).toBe(true);
      expect(e.source.slice(0, e.source.indexOf(" (")), site).toBe(f.url);
      expect(e.source, site).toContain(`${f.observed[0].file}:${f.observed[0].line}`);
      expect(e.source, site).toContain(
        'Tick 55, ruled by the main thread (tick 54 §9 item 1; research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md, "Terms links found after the verdicts (6.10.2026, tick 55)")',
      );
      expect(e.source.endsWith(`${f.marker}${t54[site].source}`), site).toBe(true);
      expect(e.source.split(f.marker), site).toHaveLength(2);
      // The note: no kind word (the page is not fetched yet), the terms line and the paused probe by row, no robots verdict
      // before the reading, and every rules line of the site, pinned.
      expect(e.note, site).toMatch(/^terms unread: the footer of /);
      expect(e.note, site).toContain(`${f.observed[0].file.replace(/\.(html|txt)$/, "")}.`);
      expect(e.note, site).toContain(`(a terms- line, ZERO-TESTS row ${f.row}; ruling 30.9 16(d) D2(iii)-(iv)), plain and once`);
      expect(e.note, site).toContain(`its robots.txt probe (${f.probe.url}, ZERO-TESTS row ${f.probe.row}) is paused`);
      expect(e.note, site).toContain("scripts/robots-verdict.mjs is not run for the site before");
      expect(e.note, site).toContain("(D2(iv): a TERMS_PENDING site gets its terms page and nothing else)");
      expect(e.note, site).toContain("so the premise the NO_TERMS verdict rested on, no terms link anywhere (ruling 30.9 16(d) D2(iv); ruling R1");
      expect(pinnedLines(e.note ?? ""), site).toEqual(f.rules);
      expect(rulesOf(site).map((r) => r.n), site).toEqual(f.rules);
      expect(isExhaustiveNegative(e) || isRobotsOkVerdict(e), site).toBe(false);
      expect(ADDRESS.test(e.note ?? "") || ADDRESS.test(e.source), site).toBe(false);
    }
    expect(v["agenthon.net"].note).toContain("is reversed, the first robots verdict taken back");
    expect(v["agenthon.net"].note).toContain(`the footer's Rules page (/rules/, ${AGENTHON_COPY}.html:2581)`);
    expect(v["eurocontrol.int"].note).toContain("is answered: it is read first (tick 54 §9 item 1)");
    expect(v["eurocontrol.int"].note).toContain("The privacy-notice line (ZERO-TESTS row 242) stays paused as read");
    // ansperformance.eu's note names eurocontrol.int's entry as it is now.
    expect(v["ansperformance.eu"].note).toContain(ANS_NOW);
  });

  it("observes each link in a frozen copy whose cited lines hold it, and the link resolves to the queued terms URL", () => {
    const urlsTxt = readFileSync(URLS, "utf8");
    const listed: Set<string> = listedNames(urlsTxt);
    const manifest = readFileSync("research/rendered/FROZEN.sha256", "utf8");
    for (const [site, f] of Object.entries(LINKS_FOUND)) {
      for (const { file, line, words } of f.observed) {
        expect(readFileSync(file, "utf8").split("\n")[line - 1], `${file}:${line}`).toContain(words);
      }
      const slug = f.observed[0].file.replace(/^research\/rendered\//, "").replace(/\.(html|txt)$/, "");
      const meta = JSON.parse(readFileSync(`research/rendered/${slug}.meta.json`, "utf8"));
      const href = f.observed[0].words.match(/href="([^"]+)"/)![1];
      expect(new URL(href, meta.url).href, site).toBe(f.url);
      expect(siteOfUrl(meta.url), site).toBe(site);
      // A frozen copy: it names itself and its live capture, its body is what its sha256 says, FROZEN.sha256 records its
      // files, and no urls.txt line names it, so no render rewrites the lines cited.
      expect(meta.slug, site).toBe(slug);
      expect(meta.frozen?.from, site).toBe(`research/rendered/${slug.slice(0, -"-2026-10-06".length)}.meta.json`);
      expect(createHash("sha256").update(readFileSync(meta.bodyPath)).digest("hex"), site).toBe(meta.sha256);
      for (const ext of ["txt", "html", "meta.json"]) expect(manifest, `${slug}.${ext}`).toContain(`  ${slug}.${ext}\n`);
      expect(listed.has(slug), site).toBe(false);
      expect(meta.status, site).toBe(200);
    }
    // agenthon.net's: the prize capture of the home page of 6.10, as 007f7f0 stored it, frozen in tick 55 (a read page,
    // nothing flagged). eurocontrol.int's: the privacy notice's copy the terms read of tick 54 froze.
    const ag = JSON.parse(readFileSync(`${AGENTHON_COPY}.meta.json`, "utf8"));
    expect([ag.url, ag.fetchedAt, ag.frozen.commit, ag.frozen.on, ag.frozen.flagged]).toEqual([
      "https://www.agenthon.net/?ref=mlcontests",
      "2026-10-06T08:46:30.971Z",
      "007f7f0",
      "2026-10-06",
      undefined,
    ]);
    expect(classifyCapture(readCapture(AGENTHON_COPY.replace(/^research\/rendered\//, ""))).kind).toBe("ok");
    const eu = JSON.parse(readFileSync(`${EURO_COPY}.meta.json`, "utf8"));
    expect([eu.url, eu.frozen.commit]).toEqual(["https://www.eurocontrol.int/info/privacy-and-website-terms-use", RENDER_COMMIT]);
  });

  it("queues one plain terms- line for each through queue-zero-test.mjs, under its ZERO-TESTS row's comment, the site's only active line", () => {
    const v = verdicts();
    const rows = zeroRows();
    const text = readFileSync(URLS, "utf8");
    const parsed = parseUrlList(text) as { url: string; slug: string; js?: boolean }[];
    for (const [site, f] of Object.entries(LINKS_FOUND)) {
      // The one line naming the URL, active and plain, under the row's comment, in the comment form of the tick-45 terms-
      // lines: the row, the site TERMS_PENDING, where the URL comes from (the observed frozen copy), the once-fetch.
      expect(text.split("\n").filter((l) => l.includes(f.url)), site).toEqual([`${f.url}\t${f.slug}`]);
      const { comment, line } = listedRow(f.row);
      expect(line, site).toBe(`${f.url}\t${f.slug}`);
      expect(comment!.startsWith(`# research/channel-loop/ZERO-TESTS.md row ${f.row} — ${site} TERMS_PENDING (tick 55, a terms link found after the `), site).toBe(true);
      expect(comment, site).toContain(`): URL from the footer link href="${new URL(f.url).pathname}" at ${f.observed[0].file}:${f.observed[0].line}`);
      expect(comment!.endsWith(", rendered grade; plain once-fetch (ruling 30.9 16(d) D2(iii)) (6.10.2026)."), site).toBe(true);
      // Its ZERO-TESTS row, in the form of the tick-45 terms rows.
      expect(rows.get(f.row)?.row, site).toBe(
        `| ${f.row} | ${f.candidate} | ${f.url} | whether ${site}'s site-use terms bar automated access or storing captures, before its rules pages are rendered |`,
      );
      // The site's only active line, which the gate passes plain: a TERMS_PENDING site's terms page.
      expect(active().filter((e) => siteOfUrl(e.url) === site).map((e) => [e.url, e.slug]), site).toEqual([[f.url, f.slug]]);
      expect(parsed.find((e) => e.slug === f.slug)?.js, site).toBeFalsy();
      expect(termsGate(f.url, f.slug, v), site).toEqual({ ok: true, site, verdict: "TERMS_PENDING" });
    }
    expect(Math.max(...rows.keys())).toBe(Math.max(...Object.values(LINKS_FOUND).map((f) => f.row)));
  });

  it("pauses each site's robots.txt probe with the reason the ruling gives, keeps its capture, and no robots verdict runs", () => {
    const v = verdicts();
    const file = JSON.parse(readFileSync(VERDICTS, "utf8"));
    const text = readFileSync(URLS, "utf8");
    for (const [site, f] of Object.entries(LINKS_FOUND)) {
      const { line } = listedRow(f.probe.row);
      expect(line, site).toBe(`${PROBE_PAUSED(site)} — ${f.probe.url}\t${f.probe.slug}`);
      expect(text.split("\n").filter((l) => l.endsWith(`\t${f.probe.slug}`)), site).toEqual([line]);
      expect(pausedLines().filter((p) => p.slug === f.probe.slug).map((p) => p.url), site).toEqual([f.probe.url]);
      // The gate refuses the probe now (a TERMS_PENDING site gets its terms page and nothing else), and passed it at tick 54.
      expect(termsGate(f.probe.url, f.probe.slug, v), site).toEqual({ ok: false, site, verdict: "TERMS_PENDING", why: pendingWhy(site) });
      expect(termsGate(f.probe.url, f.probe.slug, tick54(v)).ok, site).toBe(true);
      // The capture stays on disk, and robots-verdict.mjs, run on any list, declines the site: it judges only an
      // exhaustive-negative NO_TERMS site.
      expect(existsSync(`research/rendered/${f.probe.slug}.meta.json`), site).toBe(true);
      for (const urls of [readFileSync(FIXTURE, "utf8"), readFileSync(PRIZE_URLS, "utf8"), text]) {
        const out = judgeSite({ site, verdicts: file, urls, today: ROBOTS_CHECKED });
        expect(out.changed, site).toBe(false);
        expect(out.why, site).toContain("NO_TERMS_ROBOTS_OK is set only for a NO_TERMS site whose note opens exhaustive-negative");
      }
    }
    // eurocontrol.int's probe: captured by the 12:05 weekly run of 6.10 (a robots.txt the site served), and nothing rests on it.
    const euMeta = JSON.parse(readFileSync(`research/rendered/${EURO_PROBE.slug}.meta.json`, "utf8"));
    expect([euMeta.url, euMeta.status]).toEqual([EURO_PROBE.url, 200]);
    expect(euMeta.contentType).toMatch(/^text\/plain\b/);
    expect(readFileSync(VERDICTS, "utf8")).not.toContain(`research/rendered/${EURO_PROBE.slug}.`);
    // urls-pause-comments.mjs --check finds nothing stale, and lists eurocontrol.int's privacy-notice line as one the gate
    // would pass, which stays paused: that page was read.
    const sync = syncPauseComments(text, v, { today: "6.10.2026" });
    expect(sync.changes).toEqual([]);
    const unpause = (sync.unpause as { site: string; slug: string }[]).filter((u) => Object.hasOwn(LINKS_FOUND, u.site)).map((u) => u.slug);
    expect(unpause).toEqual(["terms-eurocontrol"]);
    expect(applyVerdicts(text, v).paused).toEqual([]);
  });

  it("refuses every rules URL of both sites, in the audited list and in the live prize list, until their terms are read", () => {
    const v = verdicts();
    for (const site of Object.keys(LINKS_FOUND)) {
      for (const e of rulesOf(site)) expect(termsGate(e.url, e.slug, v), e.url).toEqual({ ok: false, site, verdict: "TERMS_PENDING", why: pendingWhy(site) });
      // agenthon.net's rules URL passed at tick 54 (NO_TERMS_ROBOTS_OK); eurocontrol.int's never did.
      for (const e of rulesOf(site)) expect(termsGate(e.url, e.slug, tick54(v)).ok, e.url).toBe(site === "agenthon.net");
      // The live list too, whatever the weekly job has made of it.
      for (const e of linesOf(readFileSync(PRIZE_URLS, "utf8")).filter((x) => siteOfUrl(x.url) === site)) {
        expect(termsGate(e.url, e.slug, v).ok, e.url).toBe(false);
      }
    }
    // agenthon.net's footer Rules page, the event's own rules, waits behind the terms like every other page of the site.
    expect(termsGate("https://www.agenthon.net/rules/", "agenthon-rules", v).why).toBe(pendingWhy("agenthon.net"));
  });

  it("records both in the audit note's last section: the table, the first reversal of a robots verdict, and the counts as the verdicts give them", () => {
    const audit = readFileSync(AUDIT, "utf8");
    const start = audit.indexOf("## Terms links found after the verdicts (6.10.2026, tick 55)");
    expect(start).toBeGreaterThan(audit.indexOf("## Shell terms pages rendered once (6.10.2026, tick 54)"));
    const text = audit.slice(start);
    expect(text.indexOf("\n## ", 1)).toBe(-1);
    const v = verdicts();
    const t54 = tick54(v);
    const rows = text.split("\n").filter((l) => /^\| `[a-z0-9.-]+` \|/.test(l));
    expect(rows.map((r) => r.match(/^\| `([a-z0-9.-]+)` \|/)![1])).toEqual(Object.keys(LINKS_FOUND));
    for (const row of rows) {
      const cells = row.split(" | ");
      expect(cells, row.slice(0, 40)).toHaveLength(6);
      const site = cells[0].match(/`([a-z0-9.-]+)`/)![1];
      const f = LINKS_FOUND[site];
      expect(cells[1].startsWith(`${t54[site].verdict} (`), site).toBe(true);
      expect(cells[2].startsWith(`\`${f.observed[0].file}:${f.observed[0].line}\``), site).toBe(true);
      expect(cells[3], site).toBe(`${f.url} (row ${f.row})`);
      expect(cells[4], site).toBe(v[site].verdict);
      expect(cells[5], site).toContain(`the robots.txt probe (row ${f.probe.row}) paused`);
      expect(pinnedLines(cells[5]), site).toEqual(f.rules);
    }
    expect(text).toContain("**The first reversal of a robots verdict.**");
    // The counts: 16 NO_TERMS_ROBOTS_OK sites (17 at tick 54), their 19 rules URLs (20), and 33 of the 101 audited rules URLs
    // through the gate (34).
    const cleared = audited().filter((e) => ROBOTS_OK.includes(siteOfUrl(e.url)));
    const clearedThen = audited().filter((e) => ROBOTS_OK_TICK54.includes(siteOfUrl(e.url)));
    expect([ROBOTS_OK.length, cleared.length, ROBOTS_OK_TICK54.length, clearedThen.length]).toEqual([16, 19, 17, 20]);
    for (const e of cleared) expect(termsGate(e.url, e.slug, v).ok, e.url).toBe(true);
    expect(text).toContain(`Now ${ROBOTS_OK.length} sites are NO_TERMS_ROBOTS_OK and their ${cleared.length} rules URLs pass \`termsGate\``);
    expect(text).toContain(`its table and counts (${ROBOTS_OK_TICK54.length} sites, ${clearedThen.length} rules URLs) describe that state`);
    const open = audited().filter((e) => termsGate(e.url, e.slug, v).ok).length;
    const openThen = audited().filter((e) => termsGate(e.url, e.slug, t54).ok).length;
    expect([open, openThen]).toEqual([33, 34]);
    expect(text).toContain(`so the gate admits ${open} of the 101 audited rules URLs`);
    expect(text).toContain(`against ${openThen} at the end of tick 54`);
    // The kindless notes: the 23 the terms read named and these two.
    expect(text).toContain('so the notes with no kind word are 25, the 23 named in "Terms read" above and these two');
    expect(ADDRESS.test(text)).toBe(false);
  });
});
