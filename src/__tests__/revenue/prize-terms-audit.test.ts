import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
  beforeRechecks,
  isRecheckOf,
  judgeSite,
  parseRobotsSource,
  queuedPaths,
  recheckSite,
  readableCapture,
  serializeVerdicts,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/robots-verdict.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { syncPauseComments } from "../../../scripts/urls-pause-comments.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { fullSha256Of } from "../../../scripts/trim-capture.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { describeSelection, selectDispatchLines } from "../../../scripts/prize-dispatch.mjs";

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
 *
 * Tick 56 (6.10.2026): the two terms pages tick 55 queued were captured (4f3527d), frozen and read (one Opus reader, one
 * adversarial Opus verifier each), and the main thread ruled. agenthon.net's Terms page is a participant agreement, not
 * site terms, and two documents it incorporates are unread, so the site stays TERMS_PENDING with one terms- line queued
 * for each of them (ZERO-TESTS rows 268-269) and the read one paused. eurocontrol.int's Disclaimers page holds no site
 * terms, so it is NO_TERMS, exhaustive-negative, again (ruled on R1's test; its repository-content grep is not on the
 * record, so the main thread runs it or rules it immaterial before the robots verdict) and its robots.txt probe is active again;
 * scripts/robots-verdict.mjs was run on it dry only. The two tick-55 entries are a second FIXTURE
 * (terms-verdicts-4f3527d-terms-read.json, pinned by sha256), and tick55() puts them back, so the "tick 55" block holds what
 * it held; tick54() puts back the tick-54 entries of the same two sites and is unchanged. One rule changes with this tick
 * and is stated where it is tested: a TERMS_PENDING site held exactly one terms- line until tick 55; since tick 56 it holds
 * one ACTIVE terms- line for each document still unread, and a read one stays paused as read. The "tick 56" block holds
 * the new state.
 *
 * Tick 57 (6.10.2026): eurocontrol.int's robots verdict. The main thread ruled R1's last step, the grep of the
 * organisations' repository contents, unreachable from this session (the GitHub API answered 403 for both organisations)
 * and waived it for the site (logs/CHANNEL_LOOP.md §9, "Queued 6.10 (tick 56)" item 2). The note's sentence that the ruling
 * neither ran nor waived it was replaced by that ruling, and scripts/robots-verdict.mjs, applied with --urls
 * research/measurements/ai-allowed-events.urls.txt, set NO_TERMS_ROBOTS_OK on the probe's capture of the 12:05 weekly run;
 * its source was then repointed to the frozen copy robots-eurocontrol-2026-10-06, as the tick-54 review did for the 17.
 * The tick-56 entry is a third FIXTURE (terms-verdicts-19d203a-robots-verdict.json, pinned by sha256), and tick56() puts it
 * back, so the "tick 56" block holds what it held; the counts that moved are kept both ways (16 NO_TERMS_ROBOTS_OK sites
 * of the 21, 19 robots-cleared rules URLs and 33 through the gate in ticks 55 and 56, ROBOTS_OK; 17 audited sites, 20 and
 * 34 after it, ROBOTS_OK_TICK57E). The "tick 57" block holds that state.
 *
 * Tick 57 (6.10.2026), later: agenthon.net's third terms read. The two documents tick 56 queued, the Data & Software
 * Licensing Policy and the Privacy Notice, were captured (23e17e7), frozen and read (one Opus reader, one adversarial Opus
 * verifier each): NO_TERMS for each document. The main thread ruled the site NO_TERMS, exhaustive-negative: every
 * terms-like document of its four-document policy set is read on a frozen copy and none is site-use terms, and the Official
 * Competition Rules are the event's rules, read under the prize instrument. copying stays unread. Its robots.txt probe is
 * active again, and on the main thread's word scripts/robots-verdict.mjs, run dry and then applied with --urls
 * research/measurements/ai-allowed-events.urls.txt on the 6.10 capture, set NO_TERMS_ROBOTS_OK; its source was repointed to
 * the frozen copy robots-agenthon-2026-10-06. agenthon.net's entry as both tick 56 and eurocontrol.int's fold left it is a
 * fourth FIXTURE (terms-verdicts-23e17e7-agenthon-fold.json, pinned by sha256), and tick57e() puts it back, so the "tick
 * 57" block holds what it held; tick56() layers eurocontrol.int's tick-56 entry on tick57e(). The counts that moved are kept
 * both ways (17 audited NO_TERMS_ROBOTS_OK sites, 20 robots-cleared rules URLs and 34 through the gate after eurocontrol.int's
 * verdict, ROBOTS_OK_TICK57E; 18, 21 and 35 now, ROBOTS_OK_NOW). The "tick 57, third round" block holds the new state.
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
/**
 * Tick 58: scripts/robots-verdict.mjs --recheck, run by the 07:11 Tuesday tick on the weekly render, rewrites a
 * NO_TERMS_ROBOTS_OK entry whose robots.txt changed: a refresh repoints its citation and adds a note sentence, a revert sets
 * NO_TERMS. Every block below holds what ticks 45 to 57 left, so it reads the verdicts as they stood before any re-check
 * (beforeRechecks): each of the 18 NO_TERMS_ROBOTS_OK entries put back from RECHECK_FIXTURE, as terms-verdicts.json held
 * them at RECHECK_BASE (the last commit that wrote the file before --recheck existed), where the entry in the file is that
 * entry after re-checks and nothing else (isRecheckOf). A hand edit or a new verdict is not put back, so the blocks still
 * see it. With no re-check applied, as at RECHECK_BASE, the reconstruction is the file itself.
 */
const RECHECK_FIXTURE = "src/__tests__/revenue/fixtures/terms-verdicts-5c980e3-robots-ok.json";
const RECHECK_FIXTURE_SHA256 = "c99abac8d8b2917a1fedf36e5959dc968fb385e56b830c4ebe64d1d62a48395d";
const RECHECK_BASE = "5c980e3";
const recheckFixture = () => JSON.parse(readFileSync(RECHECK_FIXTURE, "utf8")) as Record<string, Entry>;
/** The sites object as it stood before any --recheck rewrite (the comment above). */
const beforeRecheck = (sites: Record<string, Entry>): Record<string, Entry> => beforeRechecks(sites, recheckFixture());
/** A parsed terms-verdicts.json's sites as these blocks read them: before any re-check. */
const verdictsOf = (file: { sites: Record<string, Entry> }): Record<string, Entry> => beforeRecheck(file.sites);
const verdicts = () => verdictsOf(JSON.parse(readFileSync(VERDICTS, "utf8")));
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
 * earlier lines give it 0. agenthon.net left "Now, on robots.txt" for it, and eurocontrol.int "Robots probe queued". Tick 56
 * read eurocontrol.int's Disclaimers page (no site terms): it is exhaustive-negative again and back in the sixth group,
 * whose heading now says what its one probe is, "Robots probe captured, robots verdict not yet run" (the 12:05 weekly run
 * of 6.10 captured it, and the script was run on it dry only): `probe` is "unjudged" for a captured probe of a site in
 * UNJUDGED_PROBES, which the fifth group ("Probed 6.10, NO_TERMS_ROBOTS_OK not set", the probes the script was run on and
 * declined) does not hold. The fourth group keeps agenthon.net. Tick 57 applied the script to that capture (R1's
 * repository grep waived): eurocontrol.int is NO_TERMS_ROBOTS_OK, in the second group, and the sixth is empty, its heading
 * kept. Later in tick 57 agenthon.net's last two terms documents were read (no site terms) and its robots verdict set
 * again: it is in the second group, and the fourth is empty, its heading kept. The counts test reads the groups eight
 * times, with the verdicts as they are, as tick57e() gives them (after eurocontrol.int's robots verdict, before
 * agenthon.net's third terms read), as tick56() gives them (after the
 * second terms read, before eurocontrol.int's robots verdict; its probe "unjudged"), as tick55() gives them (after the
 * terms links were found, before the second terms read), as tick54() gives them (after the js render, before the terms
 * links were found), as jsReadBefore() gives them (after the terms read, before the js render), as termsReadBefore()
 * gives them (after the robots verdicts, before the terms read) and as tick45() gives them, and the note states all eight.
 */
type Probe = "captured" | "queued" | "unjudged" | null;
/**
 * Tick 56: the exhaustive-negative sites whose robots.txt probe is captured and on which scripts/robots-verdict.mjs has
 * not been applied (eurocontrol.int's: captured by the 12:05 weekly run of 6.10, paused in tick 55 before it was judged,
 * active again in tick 56 and run dry only). An entry leaves when the main thread applies the script or declines the site:
 * eurocontrol.int's left in tick 57, when the script was applied, so none is left; UNJUDGED_TICK56 keeps tick 56's.
 */
const UNJUDGED_PROBES: string[] = [];
const UNJUDGED_TICK56 = ["robots-eurocontrol"];
/** A TERMS_PENDING entry reopened by tick 55: its source keeps the earlier verdict's source after BEFORE or ROBOTS_OK_BEFORE. */
const reopened = (e: Entry) => e.source.includes(BEFORE) || e.source.includes(ROBOTS_OK_BEFORE);
const RENDER_GROUPS: { opens: string; holds: (site: string, e: Entry, probe: Probe) => boolean }[] = [
  { opens: "- **Now: ", holds: (_, e) => ["CONDITIONAL_MET", "NOT_BARRED"].includes(e.verdict) },
  { opens: "- **Now, on robots.txt ", holds: (_, e) => isRobotsOkVerdict(e) },
  { opens: "- **Terms page a shell after the 6.10 fetch ", holds: (_, e) => e.verdict === "TERMS_PENDING" && !reopened(e) },
  { opens: "- **Terms link found after the verdict, terms pages queued ", holds: (_, e) => e.verdict === "TERMS_PENDING" && reopened(e) },
  { opens: "- **Probed 6.10, NO_TERMS_ROBOTS_OK not set ", holds: (_, e, probe) => isExhaustiveNegative(e) && probe === "captured" },
  {
    opens: "- **Robots probe captured, robots verdict not yet run ",
    holds: (_, e, probe) => isExhaustiveNegative(e) && (probe === "queued" || probe === "unjudged"),
  },
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
/**
 * Tick 57 (6.10.2026): the audited sites that hold NO_TERMS_ROBOTS_OK now. eurocontrol.int, exhaustive-negative again since
 * tick 56, was set by scripts/robots-verdict.mjs once the main thread waived R1's repository grep for it. It is not one of
 * the 21 NO_TERMS sites of tick 45 (it was TERMS_PENDING then), so ROBOTS_OK stays the 16 of those 21 that hold it.
 * ROBOTS_OK_TICK57E is that state, after eurocontrol.int's robots verdict and before agenthon.net's third terms read.
 */
const ROBOTS_OK_TICK57E = [...ROBOTS_OK, "eurocontrol.int"].sort();
/**
 * Tick 57, later: agenthon.net's last two terms documents read, no site terms, so it is NO_TERMS, exhaustive-negative, and
 * scripts/robots-verdict.mjs set NO_TERMS_ROBOTS_OK again on its 6.10 robots.txt capture: 18 audited sites hold it now.
 */
const ROBOTS_OK_NOW = [...ROBOTS_OK_TICK57E, "agenthon.net"].sort();
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
    // In tick 55 the site was TERMS_PENDING again, and scripts/urls-pause-comments.mjs --fix rewrote the verdict word; the
    // line stayed paused as read (a privacy notice), though a TERMS_PENDING site's terms- line passes the gate. In tick 56
    // the site was NO_TERMS, exhaustive-negative, again, and --fix wrote the verdict word back; since tick 57 it is
    // NO_TERMS_ROBOTS_OK, --fix wrote that word, and the line, which the gate passes again, stays paused as read.
    state:
      "# paused (terms read: a privacy notice, no site terms, 6.10.2026; verdict as of 6.10.2026): eurocontrol.int is NO_TERMS_ROBOTS_OK in research/channel-loop/terms-verdicts.json",
  },
  "opensky-network.org": { slug: "terms-opensky", state: "# retired (ruling 30.9 16(d) D2(iv): the site refused the runner)" },
};
/** eurocontrol.int's robots.txt probe, queued by queue-zero-test.mjs at tick 54 (ruling R1: exhaustive-negative NO_TERMS). */
const EURO_PROBE = { row: 265, site: "eurocontrol.int", url: "https://www.eurocontrol.int/robots.txt", slug: "robots-eurocontrol" };
/** Tick 57: the mark ZERO-TESTS row 265 gained when the main thread waived R1's grep and the robots verdict was set. */
const EURO_PROBE_MARK57 =
  "**VERDICT SET 6.10 (tick 57): the main thread ruled R1's grep of the organisations' repository contents unreachable from this session and waived it for eurocontrol.int, and scripts/robots-verdict.mjs, applied with --urls research/measurements/ai-allowed-events.urls.txt, set NO_TERMS_ROBOTS_OK on this probe's capture of the 12:05 weekly run, its source naming the frozen copy research/rendered/robots-eurocontrol-2026-10-06.txt: the one queued rules path is allowed, and the prize line (ai-allowed-events.urls.txt@548be52:162) passes the terms gate, open to dispatch; the probe stays on the weekly watch.**";
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
 * frozen-copy lines the link was observed on (the link first), then every other frozen-copy line the tick-55 texts cite,
 * with words each holds: a line one of those texts cites (the two sources and notes, the two terms- lines' comments, the
 * audit note's tick-55 section) must be one of these, so a changed line number fails; its robots.txt probe, paused; and its
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
      { file: `${AGENTHON_COPY}.txt`, line: 1952, words: "Privacy" },
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
      { file: `${EURO_COPY}.txt`, line: 367, words: "Website Privacy Policy" },
    ],
    probe: { row: EURO_PROBE.row, url: EURO_PROBE.url, slug: EURO_PROBE.slug },
    rules: [162],
  },
};
/**
 * ansperformance.eu's note named eurocontrol.int's verdict: tick 55 changed that one parenthetical and nothing else of it,
 * and tick 56 changed it again.
 */
const ANS_TICK54 = "(eurocontrol.int's entry, NO_TERMS since 6.10)";
const ANS_TICK55 = "(eurocontrol.int's entry: NO_TERMS on 6.10, TERMS_PENDING again since tick 55, when its footer's unread Disclaimers page was found)";
const ANS_TICK56 =
  "(eurocontrol.int's entry: NO_TERMS on 6.10, TERMS_PENDING in tick 55, when its footer's Disclaimers page was found, and NO_TERMS, exhaustive-negative, again since tick 56, when that page was read: no site terms)";
/** Tick 57 changed it again, when eurocontrol.int's robots verdict was set. */
const ANS_NOW =
  "(eurocontrol.int's entry: NO_TERMS on 6.10, TERMS_PENDING in tick 55, when its footer's Disclaimers page was found, NO_TERMS, exhaustive-negative, again in tick 56, when that page was read: no site terms, and NO_TERMS_ROBOTS_OK since tick 57, when scripts/robots-verdict.mjs found that its robots.txt allows its one queued rules page)";
/** The verdicts as tick 54 left them: the two reopened entries put back from the fixture, every other entry as it is. */
const tick54 = (v: Record<string, Entry>): Record<string, Entry> => ({
  ...v,
  ...(JSON.parse(readFileSync(LINKS_FIXTURE, "utf8")) as Record<string, Entry>),
});
/** Tick 56: the tick-55 entries of the two sites, as terms-verdicts.json held them at READ2_BASE (the tick-56 build's base). */
const READ2_FIXTURE = "src/__tests__/revenue/fixtures/terms-verdicts-4f3527d-terms-read.json";
const READ2_FIXTURE_SHA256 = "0491dc0745ede6bb1f9486d33085a40e750c9a705fa7dccf3efcf1163b19c979";
const READ2_BASE = "4f3527d";
/** The verdicts as tick 55 left them: the two entries tick 56 rewrote put back from that fixture, every other entry as it is. */
const tick55 = (v: Record<string, Entry>): Record<string, Entry> => ({
  ...v,
  ...(JSON.parse(readFileSync(READ2_FIXTURE, "utf8")) as Record<string, Entry>),
});
/** Tick 57: eurocontrol.int's tick-56 entry, as terms-verdicts.json held it at ROBOTS57_BASE (the tick-57 build's base). */
const ROBOTS57_FIXTURE = "src/__tests__/revenue/fixtures/terms-verdicts-19d203a-robots-verdict.json";
const ROBOTS57_FIXTURE_SHA256 = "a14ae7de97a6ef2082c47d6c6f7ddf918993cdafe47ed7dd1a6a55f73d7e4824";
const ROBOTS57_BASE = "19d203a";
/**
 * Tick 57, later: agenthon.net's entry as tick 56 left it and eurocontrol.int's fold kept it, as terms-verdicts.json held it
 * at AGENTHON57_BASE (the base of the build that read its last two terms documents).
 */
const AGENTHON57_FIXTURE = "src/__tests__/revenue/fixtures/terms-verdicts-23e17e7-agenthon-fold.json";
const AGENTHON57_FIXTURE_SHA256 = "70be8076bc7f70596ae687668850dd090a3d6f9cebf3fc42836087dabeef08ac";
const AGENTHON57_BASE = "23e17e7";
/**
 * The verdicts as eurocontrol.int's robots verdict (tick 57) left them, before agenthon.net's third terms read:
 * agenthon.net's entry put back from that fixture, every other entry as it is.
 */
const tick57e = (v: Record<string, Entry>): Record<string, Entry> => ({
  ...v,
  ...(JSON.parse(readFileSync(AGENTHON57_FIXTURE, "utf8")) as Record<string, Entry>),
});
/** The verdicts as tick 56 left them: eurocontrol.int's entry put back from that fixture on tick57e()'s state. */
const tick56 = (v: Record<string, Entry>): Record<string, Entry> => ({
  ...tick57e(v),
  ...(JSON.parse(readFileSync(ROBOTS57_FIXTURE, "utf8")) as Record<string, Entry>),
});
/**
 * Tick 60 (7.10.2026): un.org's terms page, captured by the 6.10 weekly render (364bf71), frozen as terms-un-2026-10-06, read
 * by one Opus reader and one adversarial Opus verifier, and ruled CONDITIONAL_UNMET, copying barred, by the main thread. Its
 * TERMS_PENDING entry, as terms-verdicts.json held it at UN60_BASE (the tick-60 build's base), is a fixture pinned by sha256;
 * un60Before() puts it back, so the blocks above that count copying-barred entries and kindless notes as ticks 54-57 left
 * them hold what they held. The "tick 60" block holds the new state.
 */
const UN60_FIXTURE = "src/__tests__/revenue/fixtures/terms-verdicts-4602c44-un-read.json";
const UN60_FIXTURE_SHA256 = "f38c6ff7bfc80507cb54e00153e4c17108e17d7e6fc8697769cc5f438bf0a395";
const UN60_BASE = "4602c44";
const un60Fixture = () => JSON.parse(readFileSync(UN60_FIXTURE, "utf8")) as Record<string, Entry>;
/** The verdicts as they stood before un.org's terms read (tick 60): its entry put back from that fixture. */
const un60Before = (v: Record<string, Entry>): Record<string, Entry> => ({ ...v, ...un60Fixture() });
/** The frozen copies tick 56 read and cites: the two terms pages (4f3527d) and eurocontrol.int's robots.txt (364bf71). */
const AG_TERMS = "research/rendered/terms-agenthon-2026-10-06";
const EU_DISCLAIMERS = "research/rendered/terms-eurocontrol-disclaimers-2026-10-06";
const EU_ROBOTS = "research/rendered/robots-eurocontrol-2026-10-06";
/**
 * Tick 56: the two terms pages read. For each: the terms- line tick 55 queued (its row, URL, slug), the comment it is paused
 * under now (queue-zero-test.mjs --apply-verdicts paused eurocontrol.int's, a NO_TERMS site's terms- line; agenthon.net's,
 * a TERMS_PENDING site's terms- line, passes the gate and was paused by hand; both reasons written by hand, in the form
 * scripts/urls-pause-comments.mjs keeps as written), the frozen copy it was read on, the verdict the main thread gave,
 * and the mark its ZERO-TESTS row gained.
 */
type Read2 = { url: string; slug: string; row: number; paused: string; copy: string; commit: string; verdict: string; mark: string };
const READ2: Record<string, Read2> = {
  "agenthon.net": {
    url: "https://www.agenthon.net/terms/",
    slug: "terms-agenthon",
    row: 266,
    // Until tick 57 the comment ended "6.10.2026): agenthon.net is TERMS_PENDING in ..." (PAUSED56_AGENTHON); since the site's
    // robots verdict of tick 57 scripts/urls-pause-comments.mjs --fix names NO_TERMS_ROBOTS_OK, dated, and the line stays
    // paused as read.
    paused:
      "# paused (terms read: a participant agreement, not site terms, the licensing and privacy pages are queued in tick 56, 6.10.2026; verdict as of 6.10.2026): agenthon.net is NO_TERMS_ROBOTS_OK in research/channel-loop/terms-verdicts.json",
    copy: AG_TERMS,
    commit: READ2_BASE,
    verdict: "TERMS_PENDING",
    mark: `**READ 6.10 (tick 56): the Agenthon 2026 Terms of Participation (${AG_TERMS}.txt:24-26), a participant agreement, not site terms; agenthon.net stays TERMS_PENDING, the two documents they incorporate are queued as rows 268 and 269, and the line is paused as read.**`,
  },
  "eurocontrol.int": {
    url: "https://www.eurocontrol.int/info/disclaimers",
    slug: "terms-eurocontrol-disclaimers",
    row: 267,
    // Until tick 57 the comment ended "6.10.2026): eurocontrol.int is NO_TERMS in ..."; since the robots verdict
    // scripts/urls-pause-comments.mjs --fix names NO_TERMS_ROBOTS_OK, dated, and the line stays paused as read.
    paused:
      "# paused (terms read: a disclaimers page of map designations and VAT, no site terms, 6.10.2026; verdict as of 6.10.2026): eurocontrol.int is NO_TERMS_ROBOTS_OK in research/channel-loop/terms-verdicts.json",
    copy: EU_DISCLAIMERS,
    commit: READ2_BASE,
    verdict: "NO_TERMS",
    mark: `**READ 6.10 (tick 56): a disclaimers page of map designations and VAT (${EU_DISCLAIMERS}.txt:151, :153-171), no site terms: eurocontrol.int is NO_TERMS, exhaustive-negative (ruling R1; both documents its footer links read); the line is paused as read, and the robots.txt probe (row 265) is active again.**`,
  },
};
/**
 * Tick 56: the two documents agenthon.net's Terms incorporate and its footer links, unread, each queued once as a plain
 * terms- line by queue-zero-test.mjs: its row, the footer href and where it was observed (the home page's frozen copy, and
 * the Terms page's own), and its ZERO-TESTS cells.
 */
const QUEUED2 = [
  {
    row: 268,
    url: "https://www.agenthon.net/licensing/",
    slug: "terms-agenthon-licensing",
    href: "/licensing/",
    prize: 2584,
    footer: 338,
    candidate: "terms audit (tick 56): agenthon.net, the Data & Software Licensing Policy its Terms of Participation incorporate, before the prize-event rules read (BOARD-LOOP §13)",
    settle: "whether agenthon.net's Data & Software Licensing Policy bars automated access or storing captures, or sets reuse terms for the site's pages, before its rules pages are rendered",
  },
  {
    row: 269,
    url: "https://www.agenthon.net/privacy/",
    slug: "terms-agenthon-privacy",
    href: "/privacy/",
    prize: 2583,
    footer: 337,
    candidate: "terms audit (tick 56): agenthon.net, the Privacy Notice its Terms of Participation incorporate, before the prize-event rules read (BOARD-LOOP §13)",
    settle: "whether agenthon.net's Privacy Notice bars automated access or storing captures, or sets terms for the site's pages, before its rules pages are rendered",
  },
];
/** Tick 57, later: the frozen copies of the two documents tick 56 queued, as 23e17e7 (the tick-57 dispatch) stored them. */
const AG_LICENSING = "research/rendered/terms-agenthon-licensing-2026-10-06";
const AG_PRIVACY = "research/rendered/terms-agenthon-privacy-2026-10-06";
/**
 * Tick 57, later: the two documents read, in QUEUED2's order. For each: the frozen copy it was read on, its title and
 * document id, the comment its terms- line is paused under now (queue-zero-test.mjs --apply-verdicts paused it, a NO_TERMS
 * site's terms- line; the reason was reworded as read by a one-line rewrite; after the robots verdict
 * urls-pause-comments.mjs --fix named NO_TERMS_ROBOTS_OK, dated), and the mark its ZERO-TESTS row gained.
 */
const READ3 = [
  {
    ...QUEUED2[0],
    copy: AG_LICENSING,
    title: "Agenthon 2026 — Data & Software Licensing Policy",
    id: "AH26-POL-04",
    fetchedAt: "2026-10-06T20:02:36.560Z",
    paused:
      "# paused (terms read: a licensing policy for competition resources, not site terms, 6.10.2026; verdict as of 6.10.2026): agenthon.net is NO_TERMS_ROBOTS_OK in research/channel-loop/terms-verdicts.json",
    mark: `**READ 6.10 (tick 57): the Agenthon 2026 Data & Software Licensing Policy (${AG_LICENSING}.txt:24-26), a licence of competition resources between participants and Organizers, not site terms: NO_TERMS for the document; with it, the Privacy Notice (row 269) and the Terms of Participation (row 266) read, agenthon.net is NO_TERMS, exhaustive-negative, then NO_TERMS_ROBOTS_OK on its robots.txt (row 247), and the line is paused as read.**`,
  },
  {
    ...QUEUED2[1],
    copy: AG_PRIVACY,
    title: "Agenthon 2026 — Privacy Notice",
    id: "AH26-POL-03",
    fetchedAt: "2026-10-06T20:02:37.644Z",
    paused:
      "# paused (terms read: a privacy notice of the Organizers, not site terms, 6.10.2026; verdict as of 6.10.2026): agenthon.net is NO_TERMS_ROBOTS_OK in research/channel-loop/terms-verdicts.json",
    mark: `**READ 6.10 (tick 57): the Agenthon 2026 Privacy Notice (${AG_PRIVACY}.txt:24-26), the Organizers' processing of personal data, not site terms: NO_TERMS for the document; with it, the Data & Software Licensing Policy (row 268) and the Terms of Participation (row 266) read, agenthon.net is NO_TERMS, exhaustive-negative, then NO_TERMS_ROBOTS_OK on its robots.txt (row 247), and the line is paused as read.**`,
  },
];
/**
 * Tick 57, review fix: the marks a read row gained after its READ mark, by row. The Terms line's row (266) says, in its
 * tick-56 mark, "agenthon.net stays TERMS_PENDING"; when the last two documents were read it gained a dated tick-57 mark,
 * as eurocontrol.int's privacy-notice row (242) gained its tick-55 and tick-56 marks. The blocks above check a row's READ
 * mark and then these after it; "tick 57, third round" pins the new one.
 */
const LATER_MARKS: Record<number, string[]> = {
  266: [
    "**6.10 (tick 57): the Data & Software Licensing Policy (row 268) and the Privacy Notice (row 269) were read, neither site terms; agenthon.net is NO_TERMS, exhaustive-negative, then NO_TERMS_ROBOTS_OK on its robots.txt (row 247), and this line stays paused as read.**",
  ],
};
/** A read row's marks as its fourth cell ends now: the READ mark, then any later ones, one space apart. */
const marksSince = (row: number, mark: string) => [mark, ...(LATER_MARKS[row] ?? [])].join(" ");
/**
 * Every line range the tick-56 texts cite (the two entries' new sources and notes, the comments of rows 268-269, the
 * ZERO-TESTS marks, the audit note's tick-56 section), with words the range holds. A cited range must be one of these,
 * exactly (a changed line number fails), and each of these must be cited somewhere.
 */
const CITED2: { site: string; file: string; from: number; to: number; words: string[] }[] = [
  { site: "agenthon.net", file: `${AGENTHON_COPY}.html`, from: 2583, to: 2584, words: ['href="/privacy/"', 'href="/licensing/"'] },
  { site: "agenthon.net", file: `${AGENTHON_COPY}.html`, from: 2583, to: 2583, words: ['href="/privacy/"'] },
  { site: "agenthon.net", file: `${AGENTHON_COPY}.html`, from: 2584, to: 2584, words: ['href="/licensing/"'] },
  { site: "agenthon.net", file: `${AGENTHON_COPY}.html`, from: 2581, to: 2581, words: ['href="/rules/"'] },
  { site: "agenthon.net", file: `${AG_TERMS}.html`, from: 337, to: 338, words: ['href="/privacy/"', 'href="/licensing/"'] },
  { site: "agenthon.net", file: `${AG_TERMS}.html`, from: 337, to: 337, words: ['href="/privacy/"'] },
  { site: "agenthon.net", file: `${AG_TERMS}.html`, from: 338, to: 338, words: ['href="/licensing/"'] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 15, to: 16, words: ["Sign In", "Sign Up"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 18, to: 18, words: ["October 12th, 23:59 AoE"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 24, to: 26, words: ["Terms of Participation", "Version 2026-08-17", "AH26-POL-02"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 28, to: 31, words: ["Policy set: Official Competition Rules", "Privacy Notice", "Data & Software Licensing Policy"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 33, to: 33, words: ["These Terms govern the legal relationship between participants and the Organizers"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 35, to: 35, words: ["platform use"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 44, to: 46, words: ["By registering, accessing the competition environment, or", "submitting, you agree to these Terms"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 44, to: 50, words: ["Official Competition Rules", "Data & Software Licensing Policy", "relevant platform terms"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 45, to: 45, words: ["competition environment"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 47, to: 49, words: ["Official Competition Rules", "Privacy Notice", "Data & Software Licensing Policy"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 49, to: 50, words: ["applicable track", "instructions, and relevant platform terms."] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 52, to: 53, words: ["Society of Quantitative Analysts (SQA) and CEWIT", "Stony Brook University"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 63, to: 64, words: ["governed primarily by the Official Competition Rules"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 141, to: 145, words: ["registered member names", "affiliations"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 149, to: 149, words: ["agenthon.net, sqa-us.org"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 206, to: 209, words: ["The Competition Site", "no license is granted by implication"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 208, to: 208, words: ["Public code and data may be governed by separate licenses"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 208, to: 209, words: ["separate licenses", "identified with the resource"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 222, to: 223, words: ["Prizes, if any, are governed by the Official Competition"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 237, to: 237, words: ["The Competition Site, platforms, datasets, evaluation environment"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 262, to: 262, words: ["Any dispute arising out of or relating to"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 274, to: 274, words: ["The Organizers may update these Terms"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 281, to: 282, words: ["constitute the agreement", "concerning the Competition"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 301, to: 302, words: ["Privacy", "Licensing"] },
  { site: "agenthon.net", file: `${AG_TERMS}.txt`, from: 305, to: 305, words: ["All rights reserved."] },
  { site: "eurocontrol.int", file: `${EU_DISCLAIMERS}.txt`, from: 1, to: 1, words: ["Disclaimers | EUROCONTROL"] },
  { site: "eurocontrol.int", file: `${EU_DISCLAIMERS}.txt`, from: 151, to: 151, words: ["The designations employed and the presentation of the material on maps"] },
  { site: "eurocontrol.int", file: `${EU_DISCLAIMERS}.txt`, from: 153, to: 171, words: ["Value Added Tax (VAT) number", "VAT exemption certificate"] },
  { site: "eurocontrol.int", file: `${EU_DISCLAIMERS}.txt`, from: 193, to: 193, words: ["I agree that my data can be processed"] },
  { site: "eurocontrol.int", file: `${EU_DISCLAIMERS}.txt`, from: 217, to: 217, words: ["Fraud warning"] },
  { site: "eurocontrol.int", file: `${EU_DISCLAIMERS}.txt`, from: 221, to: 221, words: ["© EUROCONTROL"] },
  { site: "eurocontrol.int", file: `${EU_DISCLAIMERS}.html`, from: 1159, to: 1159, words: ["eurocontrol-general-contact-form-privacy-statement.pdf"] },
  { site: "eurocontrol.int", file: `${EURO_COPY}.txt`, from: 1, to: 1, words: ["Privacy and website terms of use | EUROCONTROL"] },
  { site: "eurocontrol.int", file: `${EURO_COPY}.txt`, from: 367, to: 367, words: ["Website Privacy Policy"] },
  { site: "eurocontrol.int", file: `${EURO_COPY}.txt`, from: 439, to: 439, words: ["© EUROCONTROL"] },
];
/**
 * Every range a text cites in a research/rendered file, as "<file>:<from>-<to>": "<file>:N" or "<file>:N-M", and a bare
 * ":N" or ":N-M" after a space or "(" read against the file named last before it in the same text (a time such as 12:05
 * has a digit before its colon, and a pinned "ai-allowed-events.urls.txt@548be52:N" is pinnedLines' to check).
 */
const rangeCites = (text: string): { file: string | null; from: number; to: number; at: string }[] => {
  const out: { file: string | null; from: number; to: number; at: string }[] = [];
  let file: string | null = null;
  const re = /(research\/rendered\/[a-z0-9.-]+?\.(?:html|txt|meta\.json))(?::(\d+)(?:-(\d+))?)?|(?<=[\s(]):(\d+)(?:-(\d+))?(?![\d:])/g;
  for (const m of text.matchAll(re)) {
    if (m[1]) file = m[1];
    const from = m[2] ?? m[4];
    if (from === undefined) continue;
    out.push({ file, from: Number(from), to: Number(m[3] ?? m[5] ?? from), at: m[0] });
  }
  return out;
};
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
    /** A capture of a copying-barred site after scripts/trim-capture.mjs (ruling 6.10 row 21 (d)). */
    trimmed?: { body?: { inTree?: boolean } | null };
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
        // Nothing of the site stays active but, for eurocontrol.int, its robots.txt probe: active from the terms read of
        // 6.10, paused in tick 55 (TERMS_PENDING again, its Disclaimers line then its one active line: "tick 55" below),
        // and active again since tick 56, when the Disclaimers page was read and the site went back to exhaustive-negative
        // ("tick 56" below).
        const probe = site === EURO_PROBE.site ? [[EURO_PROBE.url, EURO_PROBE.slug]] : [];
        expect(mine.map((e) => [e.url, e.slug]), site).toEqual(probe);
        // The paused line failed the gate in tick 56 (in tick 55 eurocontrol.int's privacy-notice line passed it, a
        // TERMS_PENDING site's terms- line, and stayed paused because the page was read); since tick 57 eurocontrol.int's
        // passes it again (NO_TERMS_ROBOTS_OK) and stays paused as read.
        expect(termsGate(url, slug, tick56(v)).ok, site).toBe(false);
        expect(termsGate(url, slug, v).ok, site).toBe(site === EURO_PROBE.site);
        if (site === EURO_PROBE.site) expect(termsGate(url, slug, tick55(v)).ok, site).toBe(true);
        expect(named[0], site).toBe(`${state} — ${url}\t${slug}${flag}`);
      }
    }
    // The js-form acceptance above is for a shell-kind TERMS_PENDING site. Since tick 60 (7.10) adaptionlabs.ai's is the one
    // active js line among the audited sites: the once-only render of decision 3(2) (ruling 6.10 amendment 2, the plain
    // shell frozen first), retired once its capture is read; kaggle.com's was rendered and retired.
    const activeJs = (parseUrlList(text.join("\n")) as { url: string; slug: string; js?: boolean }[]).filter((e) => e.js && Object.hasOwn(AUDITED, siteOfUrl(e.url)));
    expect(activeJs.map((e) => [e.url, e.slug])).toEqual([["https://adaptionlabs.ai/terms-of-service", "terms-adaptionlabs"]]);
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
    // As tick 54 left the verdicts. In ticks 55 and 56 agenthon.net's probe was paused (TERMS_PENDING again); since tick 57
    // it is active again in its tick-45 form, and the site's three terms lines are paused as read, so its one active line
    // is the probe, as for the other twenty.
    const now = verdicts();
    const v = tick54(now);
    const then = tick45(v);
    const lines = active();
    for (const [site, verdict] of Object.entries(AUDITED)) {
      if (verdict !== "NO_TERMS") continue;
      const mine = lines.filter((e) => siteOfUrl(e.url) === site);
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
    // Tick 55: agenthon.net is neither (TERMS_PENDING again), and eurocontrol.int is no longer exhaustive-negative; since
    // tick 56 eurocontrol.int is exhaustive-negative again (its Disclaimers page holds no site terms), and agenthon.net
    // stays TERMS_PENDING.
    const t55 = tick55(now);
    expect(Object.keys(AUDITED).filter((s) => isRobotsOkVerdict(t55[s])).sort()).toEqual([...ROBOTS_OK].sort());
    expect(Object.keys(AUDITED).filter((s) => isExhaustiveNegative(t55[s])).sort()).toEqual(Object.keys(ROBOTS_NOT_SET).sort());
    const t56 = tick56(now);
    expect(Object.keys(AUDITED).filter((s) => isRobotsOkVerdict(t56[s])).sort()).toEqual([...ROBOTS_OK].sort());
    expect(Object.keys(AUDITED).filter((s) => isExhaustiveNegative(t56[s])).sort()).toEqual([...Object.keys(ROBOTS_NOT_SET), EURO_PROBE.site].sort());
    // Tick 57: eurocontrol.int is NO_TERMS_ROBOTS_OK (scripts/robots-verdict.mjs, R1's repository grep waived for it), and
    // the four the script declined are the only exhaustive-negative NO_TERMS sites left; later in tick 57 agenthon.net,
    // its policy set read, is NO_TERMS_ROBOTS_OK again, and the four are still the only ones.
    const t57e = tick57e(now);
    expect(Object.keys(AUDITED).filter((s) => isRobotsOkVerdict(t57e[s])).sort()).toEqual(ROBOTS_OK_TICK57E);
    expect(Object.keys(AUDITED).filter((s) => isExhaustiveNegative(t57e[s])).sort()).toEqual(Object.keys(ROBOTS_NOT_SET).sort());
    expect(Object.keys(AUDITED).filter((s) => isRobotsOkVerdict(now[s])).sort()).toEqual(ROBOTS_OK_NOW);
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
    // probes of the sites a terms link reopened, each ZERO-TESTS row marked PAUSED 6.10 (tick 55). Tick 56: the two terms
    // lines tick 55 queued, paused as read, and eurocontrol.int's probe active again (agenthon.net's stayed paused). Tick
    // 57: the two terms lines tick 56 queued, paused as read, and agenthon.net's probe active again, so no probe is paused.
    const shut = Object.entries(TERMS_LINES).filter(([, l]) => l.state.startsWith("# paused")).map(([, l]) => l.slug);
    expect(paused.map((p) => p.slug).sort()).toEqual(
      [...shut, ...Object.values(READ2).map((r) => r.slug), ...QUEUED2.map((q) => q.slug)].sort(),
    );
    expect(paused.filter((p) => isRobotsProbe(p.url, p.slug))).toEqual([]);
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
      // agenthon.net's (row 247) was paused in ticks 55 and 56 (PROBE_PAUSED) and is active again since tick 57, in the
      // form it had before, as its row's tick-57 mark says.
      const site = pausedRows.get(n);
      if (site) expect(rows.get(n)?.row, `row ${n}`).toContain(`**ACTIVE again 6.10 (tick 57): ${site} is NO_TERMS, exhaustive-negative: `);
      expect(line, `row ${n}`).toBe(`${url}\t${active().find((l) => l.url === url)?.slug}`);
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
    // Paused in tick 55, before scripts/robots-verdict.mjs ran on it (eurocontrol.int TERMS_PENDING again), and active again
    // since tick 56, in the form it had before (the Disclaimers page holds no site terms: exhaustive-negative again). Its
    // tick-56 mark says the script was run dry only, and (tick-56 review) what applying it waits on: R1's repository grep;
    // its tick-57 mark (EURO_PROBE_MARK57, "tick 57" below) that the grep was waived and the verdict set. The line itself
    // stays as it was: the probe stays on the weekly watch.
    expect(euro.line).toBe(`${EURO_PROBE.url}\t${EURO_PROBE.slug}`);
    expect(rows.get(EURO_PROBE.row)?.row).toBe(
      `| ${EURO_PROBE.row} | terms audit (tick 54, ruling R1): eurocontrol.int robots.txt, prize-event reading (BOARD-LOOP §13; ruling 30.9 16(d) D2(v)) | ${EURO_PROBE.url} | whether www.eurocontrol.int's robots.txt allows the rules paths listed in research/measurements/ai-allowed-events.urls.txt, for scripts/robots-verdict.mjs to judge **PAUSED 6.10 (tick 55): eurocontrol.int is TERMS_PENDING again: its privacy notice's footer links a Disclaimers page (row 267), so the probe waits on the terms reading; the 12:05 weekly run of 6.10 captured it, and the capture is kept and not judged.** **ACTIVE again 6.10 (tick 56): eurocontrol.int is NO_TERMS, exhaustive-negative, again: its Disclaimers page (row 267) holds no site terms; scripts/robots-verdict.mjs was run on the capture dry, and applying it is the main thread's call, once R1's grep of the organisations' repository contents is run at github grade or ruled immaterial (tick-56 review), and with --urls research/measurements/ai-allowed-events.urls.txt.** ${EURO_PROBE_MARK57} |`,
    );
  });

  it("ties each tick-45 and tick-54 ZERO-TESTS row to the urls.txt line under its comment: active, or as the 6.10 reading left it", () => {
    const rows = zeroRows();
    // The terms lines as the 6.10 reading left them; (tick 55) the two probes paused, of which (tick 56) agenthon.net's still
    // was and (tick 57) neither is; the two terms lines tick 55 queued (rows 266-267) paused as read since tick 56, and the
    // two tick 56 queued (rows 268-269) paused as read since tick 57 (active in tick 56).
    const bySlug = new Map<string, string>([
      ...Object.values(TERMS_LINES).map((l) => [l.slug, l.state] as [string, string]),
      ...Object.values(READ2).map((r) => [r.slug, r.paused] as [string, string]),
      ...READ3.map((r) => [r.slug, r.paused] as [string, string]),
    ]);
    const last = Math.max(...Object.values(LINKS_FOUND).map((f) => f.row), ...QUEUED2.map((q) => q.row));
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
    // 6.10: 33 after the robots verdicts, 34 with virtualembryo.ai's terms read (NOT_BARRED); 33 in ticks 55 and 56, with
    // agenthon.net's one rules URL refused (TERMS_PENDING again); 34 in tick 57, with eurocontrol.int's admitted
    // (NO_TERMS_ROBOTS_OK); 35 since agenthon.net's robots verdict, later in tick 57.
    expect(audited().filter((e) => termsGate(e.url, e.slug, termsReadBefore(v)).ok)).toHaveLength(33);
    expect(audited().filter((e) => termsGate(e.url, e.slug, tick54(v)).ok)).toHaveLength(34);
    expect(audited().filter((e) => termsGate(e.url, e.slug, tick55(v)).ok)).toHaveLength(33);
    expect(audited().filter((e) => termsGate(e.url, e.slug, tick56(v)).ok)).toHaveLength(33);
    expect(audited().filter((e) => termsGate(e.url, e.slug, tick57e(v)).ok)).toHaveLength(34);
    expect(audited().filter((e) => termsGate(e.url, e.slug, v).ok)).toHaveLength(35);
    // Every rules URL of a NO_TERMS_ROBOTS_OK site passes; every rules URL of a site still NO_TERMS is refused, for that.
    for (const e of audited()) {
      const site = siteOfUrl(e.url);
      const gate = termsGate(e.url, e.slug, v);
      if (ROBOTS_OK_NOW.includes(site)) expect(gate, e.url).toEqual({ ok: true, site, verdict: "NO_TERMS_ROBOTS_OK" });
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
    // Each robots.txt probe line of urls.txt, active or (since tick 55) paused: "captured" once its capture is on disk, and
    // (tick 56) "unjudged" when the script has not been applied to that capture (UNJUDGED_PROBES).
    const probes = new Map<string, Probe>(
      [...active(), ...pausedLines()]
        .filter((l) => isRobotsProbe(l.url, l.slug))
        .map((l) => [
          siteOfUrl(l.url),
          existsSync(`research/rendered/${l.slug}.meta.json`) ? (UNJUDGED_PROBES.includes(l.slug) ? "unjudged" : "captured") : "queued",
        ]),
    );
    // Since tick 57 the script has been applied to eurocontrol.int's capture: captured, and judged.
    expect(probes.get(EURO_PROBE.site)).toBe("captured");
    // In tick 56 it was captured and not judged (UNJUDGED_TICK56).
    const probes56 = new Map<string, Probe>(probes).set(EURO_PROBE.site, UNJUDGED_TICK56.includes(EURO_PROBE.slug) ? "unjudged" : "captured");
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
    // Tick 57, later: agenthon.net's third terms read and robots verdict; euroAfter is the state between the two folds of
    // tick 57 (eurocontrol.int's robots verdict set, agenthon.net still TERMS_PENDING).
    const euroAfter = group(tick57e(verdicts()));
    const robotsBefore = group(tick56(verdicts()), probes56);
    const readBefore = group(tick55(verdicts()), probesBefore);
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
    expect(readBefore.sums.map((c) => c.join("/"))).toEqual(["14/13", "19/16", "1/1", "2/2", "9/4", "0/0", "37/6", "19/3", "0/0"]);
    // Tick 56: eurocontrol.int, exhaustive-negative again, goes back to the sixth group (its probe captured, not judged);
    // agenthon.net stays in the fourth.
    expect(robotsBefore.sums.map((c) => c.join("/"))).toEqual(["14/13", "19/16", "1/1", "1/1", "9/4", "1/1", "37/6", "19/3", "0/0"]);
    // Tick 57: eurocontrol.int's robots verdict moves it from the sixth group, empty since, to "Now, on robots.txt".
    expect(euroAfter.sums.map((c) => c.join("/"))).toEqual(["14/13", "20/17", "1/1", "1/1", "9/4", "0/0", "37/6", "19/3", "0/0"]);
    // Later in tick 57: agenthon.net, its policy set read and its robots verdict set, moves from the fourth group, empty
    // since, to "Now, on robots.txt".
    expect(computed.map((c) => c.join("/"))).toEqual(["14/13", "21/18", "1/1", "0/0", "9/4", "0/0", "37/6", "19/3", "0/0"]);
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
    // ...and (tick 56) the 6.10 line after the terms links were found and before the second terms read.
    const beforeRead = section.match(/^6\.10 \(tick 55\), after the terms links were found and before the second terms read: ([\d + ]+) = (\d+) URLs, over ([\d + ]+) = (\d+) sites\.$/m);
    expect(beforeRead).not.toBeNull();
    expect([terms(beforeRead![1]), terms(beforeRead![3])]).toEqual([readBefore.sums.map((c) => c[0]), readBefore.sums.map((c) => c[1])]);
    expect([Number(beforeRead![2]), Number(beforeRead![4])]).toEqual([101, 45]);
    // ...and (tick 57) the 6.10 line after the second terms read and before eurocontrol.int's robots verdict.
    const beforeRobots = section.match(/^6\.10 \(tick 56\), after the second terms read and before eurocontrol\.int's robots verdict: ([\d + ]+) = (\d+) URLs, over ([\d + ]+) = (\d+) sites\.$/m);
    expect(beforeRobots).not.toBeNull();
    expect([terms(beforeRobots![1]), terms(beforeRobots![3])]).toEqual([robotsBefore.sums.map((c) => c[0]), robotsBefore.sums.map((c) => c[1])]);
    expect([Number(beforeRobots![2]), Number(beforeRobots![4])]).toEqual([101, 45]);
    // ...and (tick 57, later) the 6.10 line after eurocontrol.int's robots verdict and before agenthon.net's third terms read.
    const beforeThird = section.match(/^6\.10 \(tick 57\), after eurocontrol\.int's robots verdict and before agenthon\.net's third terms read: ([\d + ]+) = (\d+) URLs, over ([\d + ]+) = (\d+) sites\.$/m);
    expect(beforeThird).not.toBeNull();
    expect([terms(beforeThird![1]), terms(beforeThird![3])]).toEqual([euroAfter.sums.map((c) => c[0]), euroAfter.sums.map((c) => c[1])]);
    expect([Number(beforeThird![2]), Number(beforeThird![4])]).toEqual([101, 45]);
    // The history lines run in time order, the newest last, before the paragraph that closes the section.
    const order = [
      "5.10 (tick 45), before",
      "6.10 (tick 54), after the robots",
      "6.10 (tick 54), after the terms read",
      "6.10 (tick 54), after kaggle",
      "6.10 (tick 55), after",
      "6.10 (tick 56), after",
      "6.10 (tick 57), after",
    ];
    const where = order.map((o) => section.indexOf(`\n${o}`));
    expect(where.every((x, i) => x > 0 && (i === 0 || x > where[i - 1])), where.join(",")).toBe(true);
    for (const sums of [computed, euroAfter.sums, robotsBefore.sums, readBefore.sums, linksBefore.sums, jsBefore.sums, robots.sums, then.sums]) {
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
  /** The parsed file with its sites as they stood before any --recheck rewrite (verdictsOf). */
  const parsed = () => {
    const file = JSON.parse(raw());
    return { ...file, sites: verdictsOf(file) };
  };
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
    // Tick 55: agenthon.net's was taken back (TERMS_PENDING again); the other 16 hold, and held alone in ticks 55 and 56.
    expect(ROBOTS_OK).toHaveLength(16);
    expect(Object.keys(AUDITED).filter((s) => tick56(verdicts())[s].verdict === "NO_TERMS_ROBOTS_OK").sort()).toEqual([...ROBOTS_OK].sort());
    // Tick 57: eurocontrol.int, not one of the 21, joins them ("tick 57" below); later in tick 57 agenthon.net, its policy
    // set read, is set again ("tick 57, third round" below).
    expect(ROBOTS_OK_TICK57E).toHaveLength(17);
    expect(Object.keys(AUDITED).filter((s) => tick57e(verdicts())[s].verdict === "NO_TERMS_ROBOTS_OK").sort()).toEqual(ROBOTS_OK_TICK57E);
    expect(ROBOTS_OK_NOW).toHaveLength(18);
    expect(Object.keys(AUDITED).filter((s) => verdicts()[s].verdict === "NO_TERMS_ROBOTS_OK").sort()).toEqual(ROBOTS_OK_NOW);
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
    const file = parsed();
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
    const file = parsed();
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
    const file = parsed();
    // main() prints "no change: <why>" and exits 3 whenever judgeSite returns changed: false; it writes only on true.
    for (const urls of [fixture(), readFileSync(PRIZE_URLS, "utf8"), readFileSync(URLS, "utf8")]) {
      for (const site of ROBOTS_OK) {
        const out = judgeSite({ site, verdicts: file, urls, today: ROBOTS_CHECKED });
        expect(out.changed, site).toBe(false);
        expect(out.verdicts, site).toBe(file);
        expect(out.why, site).toBe(`${site} is already NO_TERMS_ROBOTS_OK`);
      }
      // Tick 55: the two reopened sites are TERMS_PENDING, which the script never judges (no robots verdict may run for
      // either before its terms are read). Tick 56: agenthon.net still is; eurocontrol.int, exhaustive-negative again, is
      // the "tick 56" block's (the script, run dry, would set it; it is not one of the 21).
      const t55 = { ...file, sites: tick55(file.sites) };
      for (const site of Object.keys(LINKS_FOUND)) {
        const out = judgeSite({ site, verdicts: t55, urls, today: ROBOTS_CHECKED });
        expect(out.changed, site).toBe(false);
        expect(out.verdicts, site).toBe(t55);
        expect(out.why, site).toMatch(new RegExp(`^${site.replace(/\./g, "\\.")} is TERMS_PENDING with the note "terms unread: `));
      }
      // Tick 57: agenthon.net was TERMS_PENDING until its third terms read (tick57e), and is NO_TERMS_ROBOTS_OK since.
      const t57e = { ...file, sites: tick57e(file.sites) };
      const ag57 = judgeSite({ site: "agenthon.net", verdicts: t57e, urls, today: ROBOTS_CHECKED });
      expect(ag57.changed).toBe(false);
      expect(ag57.verdicts).toBe(t57e);
      expect(ag57.why).toMatch(/^agenthon\.net is TERMS_PENDING with the note "terms unread: /);
      const ag = judgeSite({ site: "agenthon.net", verdicts: file, urls, today: ROBOTS_CHECKED });
      expect([ag.changed, ag.why]).toEqual([false, "agenthon.net is already NO_TERMS_ROBOTS_OK"]);
      expect(ag.verdicts).toBe(file);
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
    expect(heads.slice(-7)).toEqual([
      "## Every URL the agents fetched",
      "## Robots verdicts (6.10.2026, tick 54)",
      "## Terms read (6.10.2026, tick 54)",
      "## Shell terms pages rendered once (6.10.2026, tick 54)",
      "## Terms links found after the verdicts (6.10.2026, tick 55)",
      "## Terms read, second round (6.10.2026, tick 56)",
      "## Terms read, third round (6.10.2026, tick 57)",
    ]);
    const text = section();
    expect(text).toContain("node scripts/robots-verdict.mjs <site> --urls research/measurements/ai-allowed-events.urls.txt");
    expect(text).toContain("ruling 30.9 16(d) D2(iv)-(v)");
    // The section is tick 54's record. Its "Verdict now" column holds each site's verdict as it is; where that changed after
    // tick 54 (agenthon.net, TERMS_PENDING in ticks 55 and 56, NO_TERMS_ROBOTS_OK again since tick 57), the cell gives the
    // earlier ones beside it, dated.
    const now = verdicts();
    const v = tick54(now);
    const rows = text.split("\n").filter((l) => /^\| `[a-z0-9.-]+` \|/.test(l));
    const sites = [...ROBOTS_OK_TICK54, ...Object.keys(ROBOTS_NOT_SET)].sort();
    expect(rows.map((r) => r.match(/^\| `([a-z0-9.-]+)` \|/)![1])).toEqual([...sites, "nevo.co.il"]);
    for (const row of rows) {
      const m = row.match(
        /^\| `([a-z0-9.-]+)` \| `(research\/rendered\/robots-[a-z0-9.-]+\.(?:txt|html|meta\.json))`; (\d+|none); (?:`([^`]+)`|none); ([0-9T:.Z-]+); ([0-9a-f]{12}|none) \| (\d+)[^|]* \| ([^|]+) \| ([A-Z_]+)(?: \(([^|]+)\))? \|$/,
      );
      expect(m, row.slice(0, 60)).not.toBeNull();
      const [, site, path, status, contentType, fetchedAt, sha12, n, answer, verdict, history] = m!;
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
      expect(verdict, site).toBe(now[site].verdict);
      if (site === "agenthon.net") {
        expect([v[site].verdict, tick55(now)[site].verdict, tick57e(now)[site].verdict, now[site].verdict]).toEqual([
          "NO_TERMS_ROBOTS_OK",
          "TERMS_PENDING",
          "TERMS_PENDING",
          "NO_TERMS_ROBOTS_OK",
        ]);
        expect(history, site).toBe(
          'since tick 57, when its policy set was read, no site terms in it, and the script set it again on this capture; 6.10, ticks 55 and 56: TERMS_PENDING, from the terms link found in its footer in tick 55, "Terms links found after the verdicts" and "Terms read, third round" below; 6.10, tick 54: NO_TERMS_ROBOTS_OK',
        );
      } else if (now[site].verdict === v[site].verdict) expect(history, site).toBeUndefined();
      else {
        expect(Object.hasOwn(LINKS_FOUND, site), site).toBe(true);
        expect(history, site).toBe(`6.10, tick 54: ${v[site].verdict}, until tick 55 found a terms link in its footer, "Terms links found after the verdicts" below`);
      }
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
      expect(v[site].verdict === "NO_TERMS_ROBOTS_OK", site).toBe(ROBOTS_OK_TICK54.includes(site));
      expect(verdict === "NO_TERMS_ROBOTS_OK", site).toBe(ROBOTS_OK_NOW.includes(site));
    }
    expect(rows.filter((r) => / \| [A-Z_]+ \([^|]+\) \|$/.test(r)).map((r) => r.match(/^\| `([a-z0-9.-]+)` \|/)![1])).toEqual(["agenthon.net"]);
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
    // "The rules URLs of the sites that hold NO_TERMS_ROBOTS_OK, 21 on 18 sites, pass termsGate now (6.10, tick 54: the 17
    // sites' 20, until ...; ticks 55 and 56: 19 on 16 sites, until ...; tick 57: 20 on 17 sites, until ...)": the count as it
    // is since agenthon.net's robots verdict (tick 57, later), and the earlier ones beside it, dated.
    const rulesUrls = audited().filter((e) => ROBOTS_OK_TICK54.includes(siteOfUrl(e.url)));
    const rules56 = audited().filter((e) => ROBOTS_OK.includes(siteOfUrl(e.url)));
    const rules57e = audited().filter((e) => ROBOTS_OK_TICK57E.includes(siteOfUrl(e.url)));
    const rulesNow = audited().filter((e) => ROBOTS_OK_NOW.includes(siteOfUrl(e.url)));
    expect([rulesNow.length, ROBOTS_OK_NOW.length, rules57e.length, ROBOTS_OK_TICK57E.length, rules56.length, ROBOTS_OK.length]).toEqual([21, 18, 20, 17, 19, 16]);
    expect(text).toContain(
      `The rules URLs of the sites that hold NO_TERMS_ROBOTS_OK, ${rulesNow.length} on ${ROBOTS_OK_NOW.length} sites, pass \`termsGate\` now (6.10, tick 54: the ${ROBOTS_OK_TICK54.length} sites' ${rulesUrls.length}, until agenthon.net went back to TERMS_PENDING in tick 55, "Terms links found after the verdicts" below; ticks 55 and 56: ${rules56.length} on ${ROBOTS_OK.length} sites, until eurocontrol.int, not one of the 21, was set by the script in tick 57, "Terms read, second round" below; tick 57: ${rules57e.length} on ${ROBOTS_OK_TICK57E.length} sites, until agenthon.net was set again later in tick 57, "Terms read, third round" below;`,
    );
    expect(text).not.toContain(`The ${ROBOTS_OK_TICK54.length} sites' ${rulesUrls.length} rules URLs pass \`termsGate\` now`);
    for (const e of rulesUrls) expect(termsGate(e.url, e.slug, v).ok, e.url).toBe(true);
    for (const e of rulesNow) expect(termsGate(e.url, e.slug, verdicts()).ok, e.url).toBe(true);
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
      // The full bytes: the files' own hashes, or, for a copy of a site whose terms bar copying, the hashes the trimmed block
      // records (ruling 6.10 row 21 (d): scripts/trim-capture.mjs keeps only the cited lines in the tree).
      expect(fullSha256Of("research/rendered", frozen, "html"), site).toBe(meta.sha256);
      expect(fullSha256Of("research/rendered", frozen, "txt"), site).toBe(fullSha256Of("research/rendered", slug, "txt"));
      // No urls.txt line names it (freeze-capture.mjs's own rule: no word of any line is the slug); since tick 55 the comment
      // of eurocontrol.int's Disclaimers line cites its .html by file and line, a path and not a slug a render would write.
      expect(listedNames(urlsTxt).has(frozen), site).toBe(false);
      for (const ext of ["txt", "meta.json"]) expect(manifest, `${frozen}.${ext}`).toContain(`  ${frozen}.${ext}\n`);
      // The body is recorded while it is in the tree; a trimmed copy's left it unless a line of it is cited.
      expect(manifest.includes(`  ${frozen}.html\n`), `${frozen}.html`).toBe(existsSync(`research/rendered/${frozen}.html`));
      expect(existsSync(`research/rendered/${frozen}.html`) || meta.trimmed?.body?.inTree === false, `${frozen}.html`).toBe(true);
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
      /^shell: nav-only shell: the 6\.10 plain capture is 200, 51 KB of HTML and 85 characters of text \(the navigation\), which capture-check graded short until 7\.10 \(tick 60\), when it gained the nav-shell kind for exactly this shape \(ruling 6\.10 row 21, amendment 2\) and the once-only js route of decision 3\(2\) queued the page /,
    );
    // No note names a person's address.
    for (const site of Object.keys(TERMS_READ)) {
      expect(ADDRESS.test(v[site].note ?? ""), site).toBe(false);
      expect(ADDRESS.test(v[site].source), site).toBe(false);
    }
  });

  it("gives every site a copying field: barred with its clause cited, allowed for virtualembryo.ai, unread for the rest", () => {
    // As ticks 54-59 left the field: un.org's TERMS_PENDING entry put back (copying barred since tick 60, "tick 60" below).
    const v = un60Before(verdicts());
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
    // It names eurocontrol.int's entry as it is: since tick 57, NO_TERMS_ROBOTS_OK (TERMS_PENDING in tick 55; NO_TERMS,
    // exhaustive-negative, again in tick 56).
    expect(ans).toContain(ANS_NOW);
    expect(ans).not.toContain(ANS_TICK56);
    expect(ans).not.toContain(ANS_TICK54);
    expect(ans).not.toContain(ANS_TICK55);
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
    expect(euRow).toContain(
      'Whether the Disclaimers page is read before `scripts/robots-verdict.mjs` runs on the row-265 probe is open for the main thread (answered 6.10, tick 55: it is read first, "Terms links found after the verdicts" below).',
    );
    // Its "Lines now" cell gives the lines as they are since tick 57, and tick 56's, tick 55's and tick 54's beside them, dated.
    const euLines = euRow.split(" | ").at(-1)!;
    expect(euLines).toBe(
      'The terms line is paused as read (a privacy notice, no site terms); since 6.10, tick 56, the terms- line for the footer\'s Disclaimers page (ZERO-TESTS row 267) is paused as read too (no site terms), and since tick 57 the robots.txt probe\'s (row 265) capture of the 12:05 weekly run is judged: `scripts/robots-verdict.mjs` set NO_TERMS_ROBOTS_OK, and 1 rules URL passes `termsGate` (6.10, tick 56: the probe active again, its capture not yet judged, and the rules URL refused until the script set NO_TERMS_ROBOTS_OK; 6.10, tick 55: the Disclaimers line queued, the probe paused with its capture unjudged and the rules URL refused; 6.10, tick 54: the probe queued for the next weekly run and the rules URL waiting on `scripts/robots-verdict.mjs`; "Terms links found after the verdicts" and "Terms read, second round" below) |',
    );
    expect([LINKS_FOUND["eurocontrol.int"].row, LINKS_FOUND["eurocontrol.int"].probe.row]).toEqual([267, 265]);
    expect(rulesOf("eurocontrol.int").map((e) => termsGate(e.url, e.slug, tick56(verdicts())).ok)).toEqual([false]);
    expect(rulesOf("eurocontrol.int").map((e) => termsGate(e.url, e.slug, verdicts()).ok)).toEqual([true]);
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
    // As ticks 54-59 left the notes: un.org's TERMS_PENDING entry put back. Its terms were read in tick 60 (CONDITIONAL_UNMET),
    // so NO_KIND has shrunk by one since ("tick 60" below holds the kindless notes now).
    const v = un60Before(verdicts());
    const pending = Object.keys(v).filter((s) => ["NO_TERMS", "TERMS_PENDING"].includes(v[s].verdict));
    const kindless = pending.filter((s) => !KIND.test(v[s].note ?? ""));
    // NO_KIND as the terms read left it, and (tick 55) the two sites a terms link reopened: their terms pages were not
    // fetched yet, so no kind fit, and each note opened "terms unread:". Since tick 56 agenthon.net's still does (its Terms
    // page is a participant agreement, and two documents are unread), and eurocontrol.int's opens "exhaustive-negative:".
    const t55 = tick55(v);
    const kindless55 = Object.keys(t55).filter((s) => ["NO_TERMS", "TERMS_PENDING"].includes(t55[s].verdict) && !KIND.test(t55[s].note ?? ""));
    expect(kindless55.sort()).toEqual([...NO_KIND, ...Object.keys(LINKS_FOUND)].sort());
    for (const site of Object.keys(LINKS_FOUND)) expect(t55[site].note!.startsWith("terms unread: "), site).toBe(true);
    // In tick 56 and until agenthon.net's third terms read (tick 57, later) its note opened "terms unread:"; since then it
    // opens "exhaustive-negative:", and the kindless notes are NO_KIND alone.
    const t57e = tick57e(v);
    const kindless57e = Object.keys(t57e).filter((s) => ["NO_TERMS", "TERMS_PENDING"].includes(t57e[s].verdict) && !KIND.test(t57e[s].note ?? ""));
    expect(kindless57e.sort()).toEqual([...NO_KIND, "agenthon.net"].sort());
    expect(t57e["agenthon.net"].note!.startsWith("terms unread: ")).toBe(true);
    expect(kindless.sort()).toEqual([...NO_KIND].sort());
    expect(NO_KIND).toHaveLength(23);
    expect(v["agenthon.net"].note!.startsWith("exhaustive-negative: ")).toBe(true);
    expect(v["eurocontrol.int"].note!.startsWith("exhaustive-negative: ")).toBe(true);
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
    // The full bytes' hashes (a trimmed copy's from its block, ruling 6.10 row 21 (d): scripts/trim-capture.mjs).
    expect(fullSha256Of("research/rendered", JS_FROZEN, "html")).toBe(meta.sha256);
    // The live capture is that render, byte for byte; its line is retired, so no render rewrites it either.
    const txt = readFileSync(`research/rendered/${JS_FROZEN}.txt`);
    expect(fullSha256Of("research/rendered", JS_FROZEN, "txt")).toBe(fullSha256Of("research/rendered", "terms-kaggle", "txt"));
    expect(txt.toString("utf8").split("\n").length - 1).toBe(167);
    expect(classifyCapture(readCapture(JS_FROZEN)).kind).toBe("ok");
    // The plain shell's copy, frozen --allow-flagged before the render, is what the plain GET saw.
    expect([plain.slug, plain.frozen.commit, plain.frozen.flagged.kind]).toEqual([PLAIN_FROZEN, RENDER_COMMIT, "js-shell"]);
    expect(classifyCapture(readCapture(PLAIN_FROZEN)).kind).toBe("js-shell");
    for (const slug of [JS_FROZEN, PLAIN_FROZEN]) {
      expect(urlsTxt.includes(slug), slug).toBe(false);
      for (const ext of ["txt", "meta.json"]) expect(manifest, `${slug}.${ext}`).toContain(`  ${slug}.${ext}\n`);
      expect(manifest.includes(`  ${slug}.html\n`), `${slug}.html`).toBe(existsSync(`research/rendered/${slug}.html`));
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
    // Eleven until tick 60; twelve since un.org's terms read ("tick 60" below).
    expect(Object.values(un60Before(v)).filter((e) => e.copying === "barred")).toHaveLength(11);
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

  it("keeps the two tick-54 entries as a fixture, as terms-verdicts.json held them at 364bf71, and ansperformance.eu's parenthetical on eurocontrol.int names it as it is", () => {
    const bytes = readFileSync(LINKS_FIXTURE);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(LINKS_FIXTURE_SHA256);
    expect(Object.keys(fixture()).sort()).toEqual(Object.keys(LINKS_FOUND).sort());
    // The tick-54 entries are what the "tick 54" blocks hold: agenthon.net NO_TERMS_ROBOTS_OK as the script writes it,
    // eurocontrol.int NO_TERMS, exhaustive-negative.
    expect(isRobotsOkVerdict(fixture()["agenthon.net"])).toBe(true);
    expect(isExhaustiveNegative(fixture()["eurocontrol.int"])).toBe(true);
    // ansperformance.eu's note names eurocontrol.int's entry as it is now, and the tick-54 words are gone from it. Only the
    // parenthetical is checked: the rest of that note, and every other entry, may change in later ticks without this test.
    const ans = verdicts()["ansperformance.eu"].note!;
    expect(ans.split(ANS_NOW)).toHaveLength(2);
    expect(ans).not.toContain(ANS_TICK54);
    // Tick 55 wrote ANS_TICK55, which tick 56 replaced (its fixture holds the two rewritten entries, not this note).
    expect(ans).not.toContain(ANS_TICK55);
    // Where 364bf71 is reachable (a full clone), the fixture is byte for byte its two entries, and ansperformance.eu's note
    // then held the tick-54 parenthetical once. A shallow CI checkout has no 364bf71; the pinned sha256 still holds the
    // fixture. Both are facts about 364bf71, which no later commit can change.
    let base: string | null = null;
    try {
      base = execFileSync("git", ["show", `${LINKS_BASE}:${VERDICTS}`], { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" });
    } catch {
      base = null;
    }
    if (base === null) return;
    const then = JSON.parse(base).sites as Record<string, Entry>;
    for (const [site, e] of Object.entries(fixture())) expect(e, site).toEqual(then[site]);
    expect(then["ansperformance.eu"].note!.split(ANS_TICK54)).toHaveLength(2);
    expect(then["ansperformance.eu"].note!).not.toContain(ANS_NOW);
  });

  it("sets both TERMS_PENDING, checked 6.10, each source naming the terms URL and where its link was observed, and keeping tick 54's", () => {
    // The two entries as tick 55 wrote them (tick 56 rewrote both: "tick 56" below), every other entry as it is.
    const v = tick55(verdicts());
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
    // What follows the reading is not decided in advance: the verdict and the probe are the main thread's call then.
    expect(v["eurocontrol.int"].note).toContain(
      "Whether it bars automated access or copying is unknown until read, and what the verdict and the probe become once it is read is the main thread's call.",
    );
    for (const site of Object.keys(LINKS_FOUND)) expect(v[site].note, site).not.toMatch(/goes back to NO_TERMS|probe resumes/);
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

  it("ties every line, row, fetch time and commit the tick-55 texts cite to a listed frozen-copy line, the site's ZERO-TESTS rows and the copy's meta", () => {
    // The two entries as tick 55 wrote them; the section up to the next (tick 56's), whose cites "tick 56" below holds.
    const v = tick55(verdicts());
    const t54 = tick54(v);
    const rows = zeroRows();
    const urlsLines = readFileSync(URLS, "utf8").split("\n");
    const audit = readFileSync(AUDIT, "utf8");
    const from = audit.indexOf("## Terms links found after the verdicts (6.10.2026, tick 55)");
    const section = audit.slice(from, audit.indexOf("\n## ", from + 1));
    const tableRow = (site: string) => section.split("\n").find((l) => l.startsWith(`| \`${site}\` | `))!;
    const prose = section
      .split("\n")
      .filter((l) => !l.startsWith("|"))
      .join("\n");
    // The source as tick 55 wrote it: everything before the separator, after which it keeps tick 54's byte for byte.
    const newSource = (site: string) => v[site].source.slice(0, v[site].source.indexOf(LINKS_FOUND[site].marker));
    /**
     * Every line a text cites in a research/rendered file: "<file>:N" or "<file>:N-M", and a bare ":N" or ":N-M" after a
     * space or "(" read against the file named last before it (a time such as 08:46:30 or 12:05 has a digit before its
     * colon, and a pinned "ai-allowed-events.urls.txt@548be52:N" is pinnedLines' to check). A range cites every line in it.
     */
    const lineCites = (text: string, at: string) => {
      const out: string[] = [];
      let file: string | null = null;
      const re = /(research\/rendered\/[a-z0-9.-]+?\.(?:html|txt|meta\.json))(?::(\d+)(?:-(\d+))?)?|(?<=[\s(]):(\d+)(?:-(\d+))?(?![\d:])/g;
      for (const m of text.matchAll(re)) {
        if (m[1]) file = m[1];
        const from = m[2] ?? m[4];
        if (from === undefined) continue;
        expect(file, `${at}: ${m[0]} names no file before it`).not.toBeNull();
        const to = m[3] ?? m[5] ?? from;
        expect(Number(to) >= Number(from), `${at}: ${m[0]}`).toBe(true);
        for (let n = Number(from); n <= Number(to); n += 1) out.push(`${file}:${n}`);
      }
      return out;
    };
    /** Every ZERO-TESTS row a text cites: "row N", "rows N and M", "rows N-M", "row-N"; not a ruling's ("ruling 6.10 row 21"). */
    const rowCites = (text: string) => {
      const out: number[] = [];
      for (const m of text.matchAll(/(?<!ruling [\d.]+ )\brows? (\d+)(?:(-| and )(\d+))?\b|\brow-(\d+)\b/g)) {
        const from = Number(m[1] ?? m[4]);
        const to = m[3] === undefined ? from : Number(m[3]);
        for (let n = from; n <= (m[2] === " and " ? from : to); n += 1) out.push(n);
        if (m[2] === " and ") out.push(to);
      }
      return out;
    };
    const listed = new Map(Object.entries(LINKS_FOUND).map(([site, f]) => [site, new Set(f.observed.map((o) => `${o.file}:${o.line}`))]));
    const all = new Set([...listed.values()].flatMap((s) => [...s]));
    const citedBy = new Map<string, Set<string>>([...listed.keys()].map((site) => [site, new Set<string>()]));
    for (const [site, f] of Object.entries(LINKS_FOUND)) {
      const comment = listedRow(f.row).comment!;
      const texts: [string, string][] = [
        ["source", newSource(site)],
        ["note", v[site].note!],
        ["urls.txt comment", comment],
        ["audit table", tableRow(site)],
      ];
      for (const [what, text] of texts) {
        const at = `${site} ${what}`;
        const cites = lineCites(text, at);
        expect(cites.length, at).toBeGreaterThan(0);
        for (const c of cites) {
          expect(listed.get(site)!.has(c), `${at} cites ${c}`).toBe(true);
          citedBy.get(site)!.add(c);
        }
        // Each row it cites is a ZERO-TESTS row of this site: its terms line, its probe, or (eurocontrol.int) the
        // privacy-notice line the 6.10 reading paused.
        for (const n of rowCites(text)) expect(siteOfUrl(rows.get(n)?.url ?? "https://row.missing/"), `${at} cites row ${n}`).toBe(site);
      }
      expect(rowCites(comment), site).toEqual([f.row]);
      // The capture each source and table row names: its URL, its fetch time and the commit its frozen copy was made from,
      // as the copy's meta holds them.
      const meta = JSON.parse(readFileSync(`${f.observed[0].file.replace(/\.(html|txt)$/, "")}.meta.json`, "utf8"));
      const captured = [...newSource(site).matchAll(/the capture is of (\S+), fetched (\S+) by [^,()]+, frozen as ([0-9a-f]{7}) stored it\)/g)];
      expect(captured.map((m) => [m[1], m[2], m[3]]), site).toEqual([[meta.url, meta.fetchedAt, meta.frozen.commit]]);
      const cell = tableRow(site).split(" | ")[2];
      const times = [...cell.matchAll(/fetched (\d{4}-\d\d-\d\dT[\d:.]+Z)/g)].map((m) => m[1]);
      for (const t of times) expect([meta.fetchedAt, meta.fetchedAt.replace(/\.\d+Z$/, "Z")], site).toContain(t);
      const commits = [...cell.matchAll(/as ([0-9a-f]{7}) stored it/g)].map((m) => m[1]);
      expect(commits, site).toEqual([meta.frozen.commit]);
      expect(t54[site].verdict, site).toBe(f.before);
    }
    // The section's prose: every line it cites is one of either site's, and every row one of either site's.
    for (const c of lineCites(prose, "audit prose")) {
      expect(all.has(c), `audit prose cites ${c}`).toBe(true);
      for (const [site, set] of listed) if (set.has(c)) citedBy.get(site)!.add(c);
    }
    for (const n of rowCites(prose)) expect(Object.keys(LINKS_FOUND), `audit prose cites row ${n}`).toContain(siteOfUrl(rows.get(n)?.url ?? "https://row.missing/"));
    // ...and every listed line is cited somewhere, so the list holds nothing the texts do not rest on.
    for (const [site, set] of listed) expect([...citedBy.get(site)!].sort(), site).toEqual([...set].sort());
    // The privacy-notice line both eurocontrol.int texts name is the row of its paused terms-eurocontrol line.
    const privacy = [...rows].filter(([, r]) => r.url === "https://www.eurocontrol.int/info/privacy-and-website-terms-use").map(([n]) => n);
    expect(privacy).toEqual([242]);
    expect(listedRow(privacy[0]).line!.endsWith(`\t${TERMS_LINES["eurocontrol.int"].slug}`)).toBe(true);
    expect(urlsLines.filter((l) => l.endsWith(`\t${TERMS_LINES["eurocontrol.int"].slug}`))).toEqual([listedRow(privacy[0]).line]);
    expect(v["eurocontrol.int"].note).toContain(`The privacy-notice line (ZERO-TESTS row ${privacy[0]}) stays paused as read`);
    expect(tableRow("eurocontrol.int")).toContain(`the privacy-notice line (row ${privacy[0]}) paused as read`);
  });

  it("queues one plain terms- line for each through queue-zero-test.mjs, under its ZERO-TESTS row's comment, the site's only active line", () => {
    // Tick 55 queued each line active and plain, the site's only active line; tick 56 read both pages and paused each line
    // as read (READ2), so the line is checked as it is now and the rest of tick 55's state through tick55().
    const t55 = tick55(verdicts());
    const rows = zeroRows();
    const text = readFileSync(URLS, "utf8");
    for (const [site, f] of Object.entries(LINKS_FOUND)) {
      // The one line naming the URL, plain, under the row's comment, in the comment form of the tick-45 terms- lines: the
      // row, the site TERMS_PENDING, where the URL comes from (the observed frozen copy), the once-fetch. Since tick 56 it
      // is paused as read, its URL and slug byte for byte as tick 55 wrote them.
      const now = `${READ2[site].paused} — ${f.url}\t${f.slug}`;
      expect(text.split("\n").filter((l) => l.includes(f.url)), site).toEqual([now]);
      const { comment, line } = listedRow(f.row);
      expect(line, site).toBe(now);
      expect(comment!.startsWith(`# research/channel-loop/ZERO-TESTS.md row ${f.row} — ${site} TERMS_PENDING (tick 55, a terms link found after the `), site).toBe(true);
      expect(comment, site).toContain(`): URL from the footer link href="${new URL(f.url).pathname}" at ${f.observed[0].file}:${f.observed[0].line}`);
      expect(comment!.endsWith(", rendered grade; plain once-fetch (ruling 30.9 16(d) D2(iii)) (6.10.2026)."), site).toBe(true);
      // Its ZERO-TESTS row, in the form of the tick-45 terms rows, and since tick 56 its READ mark after it.
      expect(rows.get(f.row)?.row, site).toBe(
        `| ${f.row} | ${f.candidate} | ${f.url} | whether ${site}'s site-use terms bar automated access or storing captures, before its rules pages are rendered ${marksSince(f.row, READ2[site].mark)} |`,
      );
      // At tick 55 the gate passed it plain, a TERMS_PENDING site's terms page.
      expect(termsGate(f.url, f.slug, t55), site).toEqual({ ok: true, site, verdict: "TERMS_PENDING" });
      expect(READ2[site].slug, site).toBe(f.slug);
      expect(READ2[site].row, site).toBe(f.row);
    }
    // The two rows are the only ZERO-TESTS rows tick 55 queued (not "the last rows": a later tick adds its own after them).
    const tick55Rows = [...rows].filter(([, r]) => r.row.includes(" | terms audit (tick 55): ")).map(([n]) => n);
    expect(tick55Rows).toEqual(Object.values(LINKS_FOUND).map((f) => f.row));
  });

  it("pauses each site's robots.txt probe with the reason the ruling gives, keeps its capture, and no robots verdict runs", () => {
    // Tick 55's state: both probes paused, both sites TERMS_PENDING (PROBE_PAUSED). eurocontrol.int's is active again since
    // tick 56 ("tick 56" below), and agenthon.net's, paused in ticks 55 and 56, since tick 57 ("tick 57, third round"
    // below), each in the form it had before; the gate is read in tick55()'s state.
    const v = verdicts();
    const t55 = tick55(v);
    const file = JSON.parse(readFileSync(VERDICTS, "utf8"));
    const file55 = { ...file, sites: t55 };
    const text = readFileSync(URLS, "utf8");
    for (const [site, f] of Object.entries(LINKS_FOUND)) {
      const { line } = listedRow(f.probe.row);
      expect(line, site).toBe(`${f.probe.url}\t${f.probe.slug}`);
      expect(text.split("\n").filter((l) => l.endsWith(`\t${f.probe.slug}`)), site).toEqual([line]);
      expect(pausedLines().filter((p) => p.slug === f.probe.slug).map((p) => p.url), site).toEqual([]);
      // The gate refused the probe at tick 55 (a TERMS_PENDING site gets its terms page and nothing else), and passed it at
      // tick 54; agenthon.net's it refused until its third terms read (tick57e()), and both pass now.
      expect(termsGate(f.probe.url, f.probe.slug, t55), site).toEqual({ ok: false, site, verdict: "TERMS_PENDING", why: pendingWhy(site) });
      expect(termsGate(f.probe.url, f.probe.slug, tick54(v)).ok, site).toBe(true);
      expect(termsGate(f.probe.url, f.probe.slug, tick57e(v)).ok, site).toBe(site !== "agenthon.net");
      expect(termsGate(f.probe.url, f.probe.slug, v).ok, site).toBe(true);
      // The capture stays on disk, and robots-verdict.mjs, run on any list at tick 55, declines the site: it judges only an
      // exhaustive-negative NO_TERMS site.
      expect(existsSync(`research/rendered/${f.probe.slug}.meta.json`), site).toBe(true);
      for (const urls of [readFileSync(FIXTURE, "utf8"), readFileSync(PRIZE_URLS, "utf8"), text]) {
        const out = judgeSite({ site, verdicts: file55, urls, today: ROBOTS_CHECKED });
        expect(out.changed, site).toBe(false);
        expect(out.why, site).toContain("NO_TERMS_ROBOTS_OK is set only for a NO_TERMS site whose note opens exhaustive-negative");
      }
    }
    // Each probe's ZERO-TESTS row says why it was paused; agenthon.net's names the script that set the verdict reversed.
    expect(zeroRows().get(LINKS_FOUND["agenthon.net"].probe.row)?.row).toContain(
      "**PAUSED 6.10 (tick 55): agenthon.net is TERMS_PENDING again: its home page's footer links a Terms page (row 266), so the robots verdict scripts/robots-verdict.mjs set from this probe's capture is reversed and the probe waits on the terms reading; its capture is kept.**",
    );
    // eurocontrol.int's privacy-notice row (242), read on 6.10, points at the Disclaimers row tick 55 queued, dated (and,
    // since tick 56, at what its reading found: "tick 56" below).
    expect(zeroRows().get(242)?.row).toMatch(
      /the robots\.txt probe is row 265\.\*\* \*\*6\.10 \(tick 55\): eurocontrol\.int is TERMS_PENDING again: the notice's footer links a Disclaimers page, queued as row 267; this line stays paused as read, and the probe \(row 265\) is paused\.\*\* \*\*6\.10 \(tick 56\): /,
    );
    // eurocontrol.int's probe: captured by the 12:05 weekly run of 6.10 (a robots.txt the site served). Tick 56 ran the
    // script on it dry only; since tick 57 the verdict rests on it, cited by its frozen copy, never by the live capture.
    // Read on that frozen copy (tick 58): the weekly render rewrites the live capture whenever the site's answer changes.
    const euMeta = JSON.parse(readFileSync(`${EU_ROBOTS}.meta.json`, "utf8"));
    expect(euMeta.frozen.from).toBe(`research/rendered/${EURO_PROBE.slug}.meta.json`);
    expect([euMeta.url, euMeta.status]).toEqual([EURO_PROBE.url, 200]);
    expect(euMeta.contentType).toMatch(/^text\/plain\b/);
    expect(readFileSync(VERDICTS, "utf8")).not.toContain(`research/rendered/${EURO_PROBE.slug}.`);
    // urls-pause-comments.mjs --check finds nothing stale. At tick 55 it listed eurocontrol.int's privacy-notice line as
    // one the gate would pass (a TERMS_PENDING site's terms- line), which stayed paused: that page was read. In tick 56 it
    // listed agenthon.net's Terms line for the same reason, and eurocontrol.int's no longer passed (NO_TERMS). Since tick 57
    // both eurocontrol.int terms lines pass again (NO_TERMS_ROBOTS_OK) and stay paused, both pages read; and since
    // agenthon.net's robots verdict (tick 57, later) its three terms lines pass too and stay paused, all three pages read.
    const sync = syncPauseComments(text, v, { today: "6.10.2026" });
    expect(sync.changes).toEqual([]);
    const unpause = (sync.unpause as { site: string; slug: string }[]).filter((u) => Object.hasOwn(LINKS_FOUND, u.site)).map((u) => u.slug);
    expect([...unpause].sort()).toEqual(
      ["terms-eurocontrol", READ2["agenthon.net"].slug, READ2["eurocontrol.int"].slug, ...QUEUED2.map((q) => q.slug)].sort(),
    );
    // With tick 56's verdicts the gate passes agenthon.net's terms lines (a TERMS_PENDING site's), the two tick 56 queued
    // among them, which were active then and are paused as read now.
    const unpause56 = (syncPauseComments(text, tick56(v), { today: "6.10.2026" }).unpause as { site: string; slug: string }[])
      .filter((u) => Object.hasOwn(LINKS_FOUND, u.site))
      .map((u) => u.slug);
    expect(unpause56).toEqual([READ2["agenthon.net"].slug, ...QUEUED2.map((q) => q.slug)]);
    const unpause55 = (syncPauseComments(text, t55, { today: "6.10.2026" }).unpause as { site: string; slug: string }[])
      .filter((u) => Object.hasOwn(LINKS_FOUND, u.site))
      .map((u) => u.slug);
    expect(unpause55).toContain("terms-eurocontrol");
    expect(applyVerdicts(text, v).paused).toEqual([]);
  });

  it("refuses every rules URL of both sites, in the audited list and in the live prize list, until their terms are read", () => {
    // At tick 55 both were TERMS_PENDING, and agenthon.net stayed so until its third terms read (tick 57, later); in tick 56
    // eurocontrol.int's rules URL was refused as an exhaustive-negative NO_TERMS site's until scripts/robots-verdict.mjs set
    // NO_TERMS_ROBOTS_OK, which it did in tick 57 ("tick 57" below), and agenthon.net's until the script set it again later
    // in tick 57 ("tick 57, third round" below): both pass now, and are checked here in the earlier states.
    const v = verdicts();
    const t55 = tick55(v);
    const t56 = tick56(v);
    const t57e = tick57e(v);
    for (const site of Object.keys(LINKS_FOUND)) {
      for (const e of rulesOf(site)) expect(termsGate(e.url, e.slug, t55), e.url).toEqual({ ok: false, site, verdict: "TERMS_PENDING", why: pendingWhy(site) });
      // agenthon.net's rules URL passed at tick 54 (NO_TERMS_ROBOTS_OK); eurocontrol.int's never did.
      for (const e of rulesOf(site)) expect(termsGate(e.url, e.slug, tick54(v)).ok, e.url).toBe(site === "agenthon.net");
      // In tick 56 and now, and in the live list too, whatever the weekly job has made of it.
      for (const e of [...rulesOf(site), ...linesOf(readFileSync(PRIZE_URLS, "utf8")).filter((x) => siteOfUrl(x.url) === site)]) {
        expect(termsGate(e.url, e.slug, t56).ok, e.url).toBe(false);
        expect(termsGate(e.url, e.slug, t57e).ok, e.url).toBe(site === EURO_PROBE.site);
        expect(termsGate(e.url, e.slug, v).ok, e.url).toBe(true);
        expect(termsGate(e.url, e.slug, t55).ok, e.url).toBe(false);
      }
    }
    // agenthon.net's footer Rules page, the event's own rules, waited behind the terms like every other page of the site;
    // since tick 57 the gate passes it as a NO_TERMS_ROBOTS_OK site's page, and it is read under the prize instrument.
    expect(termsGate("https://www.agenthon.net/rules/", "agenthon-rules", t57e).why).toBe(pendingWhy("agenthon.net"));
    expect(termsGate("https://www.agenthon.net/rules/", "agenthon-rules", v)).toEqual({ ok: true, site: "agenthon.net", verdict: "NO_TERMS_ROBOTS_OK" });
  });

  it("records both in the audit note's section after the shell renders: the table, the first reversal of a robots verdict, and the counts as the verdicts give them", () => {
    const audit = readFileSync(AUDIT, "utf8");
    const start = audit.indexOf("## Terms links found after the verdicts (6.10.2026, tick 55)");
    expect(start).toBeGreaterThan(audit.indexOf("## Shell terms pages rendered once (6.10.2026, tick 54)"));
    // The section ends where tick 56's begins.
    const end = audit.indexOf("\n## ", start + 1);
    expect(audit.slice(end + 1).startsWith("## Terms read, second round (6.10.2026, tick 56)\n")).toBe(true);
    const text = audit.slice(start, end + 1);
    const v = verdicts();
    const t54 = tick54(v);
    const t55 = tick55(v);
    const t56 = tick56(v);
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
      // "Verdict now" and "Lines now" give the state as it is and the earlier ones beside it, dated, where it changed: tick
      // 55's, and (eurocontrol.int, since its robots verdict of tick 57) tick 56's; agenthon.net's, since its third terms read
      // and robots verdict (tick 57, later), ticks 55 and 56's, and the NO_TERMS it held between the two.
      if (site === "agenthon.net") {
        expect([t55[site].verdict, t56[site].verdict, tick57e(v)[site].verdict]).toEqual(["TERMS_PENDING", "TERMS_PENDING", "TERMS_PENDING"]);
        expect(cells[4], site).toBe(
          `${v[site].verdict} (6.10, tick 57: NO_TERMS, exhaustive-negative, on the third terms read, until \`scripts/robots-verdict.mjs\` was applied the same tick; 6.10, ticks 55 and 56: ${t55[site].verdict}, until tick 57 read the Licensing and Privacy pages, "Terms read, third round" below)`,
        );
        expect(cells[5], site).toContain(
          "passes `termsGate` since tick 57, when `scripts/robots-verdict.mjs` set NO_TERMS_ROBOTS_OK (6.10, tick 56: the Licensing and Privacy lines active, the probe paused and the rules URL refused; 6.10, tick 55: the terms line active;",
        );
        expect(cells[5], site).toContain("the Licensing and Privacy pages' terms- lines (rows 268 and 269) paused as read since tick 57;");
      } else if (v[site].verdict === t55[site].verdict) expect(cells[4], site).toBe(v[site].verdict);
      else if (v[site].verdict === t56[site].verdict) {
        expect(cells[4], site).toBe(`${v[site].verdict} (6.10, tick 55: ${t55[site].verdict}, until tick 56 read the Disclaimers page, "Terms read, second round" below)`);
      } else {
        expect(cells[4], site).toBe(
          `${v[site].verdict} (6.10, tick 56: ${t56[site].verdict}, until tick 57 applied \`scripts/robots-verdict.mjs\`; 6.10, tick 55: ${t55[site].verdict}, until tick 56 read the Disclaimers page, "Terms read, second round" below)`,
        );
      }
      if (site === EURO_PROBE.site) {
        expect(cells[5], site).toContain("its capture of the 12:05 weekly run kept, and judged in tick 57;");
        expect(cells[5], site).toContain("passes `termsGate` since tick 57, when `scripts/robots-verdict.mjs` set NO_TERMS_ROBOTS_OK (6.10, tick 56: refused until then;");
      }
      expect(cells[5], site).toContain(`the robots.txt probe (row ${f.probe.row}) active again`);
      // (Each site's tick-55 state follows its tick-56 one since tick 57, in the same parenthesis.)
      expect(cells[5], site).toContain(
        site === "agenthon.net" ? "; 6.10, tick 55: the terms line active;" : "(6.10, tick 56: refused until then; 6.10, tick 55: the terms line active and the probe paused)",
      );
      expect(cells[5], site).toContain(`The terms line paused as read since 6.10, tick 56`);
      expect(pinnedLines(cells[5]), site).toEqual(f.rules);
    }
    expect(text).toContain("**The first reversal of a robots verdict.**");
    // The counts: 16 NO_TERMS_ROBOTS_OK sites after tick 55 (17 at tick 54), their 19 rules URLs (20), and 33 of the 101
    // audited rules URLs through the gate (34); in tick 57, 17 sites (eurocontrol.int's verdict), 20 rules URLs and 34; since
    // agenthon.net's robots verdict, later in tick 57, 18, 21 and 35.
    const cleared = audited().filter((e) => ROBOTS_OK.includes(siteOfUrl(e.url)));
    const clearedThen = audited().filter((e) => ROBOTS_OK_TICK54.includes(siteOfUrl(e.url)));
    const cleared57e = audited().filter((e) => ROBOTS_OK_TICK57E.includes(siteOfUrl(e.url)));
    const clearedNow = audited().filter((e) => ROBOTS_OK_NOW.includes(siteOfUrl(e.url)));
    expect([ROBOTS_OK.length, cleared.length, ROBOTS_OK_TICK54.length, clearedThen.length]).toEqual([16, 19, 17, 20]);
    expect([ROBOTS_OK_TICK57E.length, cleared57e.length, ROBOTS_OK_NOW.length, clearedNow.length]).toEqual([17, 20, 18, 21]);
    for (const e of cleared) expect(termsGate(e.url, e.slug, t56).ok, e.url).toBe(true);
    for (const e of cleared57e) expect(termsGate(e.url, e.slug, tick57e(v)).ok, e.url).toBe(true);
    for (const e of clearedNow) expect(termsGate(e.url, e.slug, v).ok, e.url).toBe(true);
    expect(text).toContain(
      `The "Robots verdicts" section above is tick 54's record (${ROBOTS_OK_TICK54.length} sites, ${clearedThen.length} rules URLs); where a statement of it no longer holds, agenthon.net's verdict and the count of rules URLs that pass \`termsGate\`, it gives the value as it is now with the earlier ones beside it, dated, and so does eurocontrol.int's "Lines now" cell in "Terms read".`,
    );
    const open = audited().filter((e) => termsGate(e.url, e.slug, v).ok).length;
    const open57e = audited().filter((e) => termsGate(e.url, e.slug, tick57e(v)).ok).length;
    const open56 = audited().filter((e) => termsGate(e.url, e.slug, t56).ok).length;
    const openThen = audited().filter((e) => termsGate(e.url, e.slug, t54).ok).length;
    expect([open56, openThen, open57e, open]).toEqual([33, 34, 34, 35]);
    // The tick-57 sentence states eurocontrol.int's step; the dated pointer after it, agenthon.net's later in tick 57.
    expect(text).toContain(
      `After tick 55, ${ROBOTS_OK.length} sites were NO_TERMS_ROBOTS_OK and their ${cleared.length} rules URLs passed \`termsGate\`, so the gate admitted ${open56} of the 101 audited rules URLs (the 14 of "Now" and the ${cleared.length} of "Now, on robots.txt"), against ${openThen} at the end of tick 54; since tick 57, with eurocontrol.int's robots verdict, ${ROBOTS_OK_TICK57E.length} sites and their ${cleared57e.length} rules URLs pass it, and the gate admits ${open57e} ("Terms read, second round" below). ` +
        `(Since agenthon.net's robots verdict, later in tick 57: ${ROBOTS_OK_NOW.length} sites, their ${clearedNow.length} rules URLs, and ${open} through the gate; "Terms read, third round" below.)`,
    );
    // The home page's capture, its line refused from tick 55, and the line passing again since tick 57, dated.
    expect(text).toContain(
      "the event's own rules, which waits behind the terms. (Since 6.10, tick 57: agenthon.net is NO_TERMS_ROBOTS_OK again and its line passes `termsGate`; the Rules page is on no prize list and is read under the prize instrument, \"Terms read, third round\" below.)",
    );
    expect(termsGate(rulesOf("agenthon.net")[0].url, rulesOf("agenthon.net")[0].slug, v).ok).toBe(true);
    expect(text).not.toContain("Now 16 sites are NO_TERMS_ROBOTS_OK");
    // ansperformance.eu's note, as this section's eurocontrol.int paragraph says it reads in each tick.
    expect(text).toContain("said in tick 56 that it is NO_TERMS, exhaustive-negative, again, and says since tick 57 that it is NO_TERMS_ROBOTS_OK.");
    // The kindless notes: the 23 the terms read named and these two.
    expect(text).toContain('so the notes with no kind word are 25, the 23 named in "Terms read" above and these two');
    expect(ADDRESS.test(text)).toBe(false);
  });
});

/**
 * Tick 56 (6.10.2026): the second terms read. The terms pages tick 55 queued were captured by the tick-56 render dispatch
 * (4f3527d), frozen, and read by one Opus reader and one adversarial Opus verifier each; the main thread ruled
 * (TERMS-AUDIT-2026-10-05-prize-events.md, "Terms read, second round (6.10.2026, tick 56)"). agenthon.net: its Terms page
 * is the Agenthon 2026 Terms of Participation, a participant agreement, not site terms; two documents they incorporate,
 * the Data & Software Licensing Policy and the Privacy Notice, are unread, so the site stays TERMS_PENDING (not
 * exhaustive-negative), with a plain terms- line queued for each (ZERO-TESTS rows 268-269) and the Terms line paused as
 * read; copying stays unread. eurocontrol.int: its Disclaimers page holds a map-designations disclaimer and VAT
 * information, no site terms; with the privacy notice read in tick 54, both documents its footer links are read and the
 * tick-45 search is recorded, so the main thread ruled it NO_TERMS, exhaustive-negative, again, copying unread, on R1's
 * test; one step of R1's list, the grep of the organisations' repository contents, is not on the record (the tick-54
 * review found it missing; tick 56 fetched nothing), and the note and the audit say so (tick-56 review): before the
 * robots verdict is applied, the main thread runs it at github grade or rules it immaterial;
 * its robots.txt probe is active again in the form it had before tick 55 paused it, and scripts/robots-verdict.mjs was
 * run on it dry only (the main thread decides whether to apply it).
 *
 * The rule this tick changes: until tick 55 a TERMS_PENDING site held exactly one terms- line. Since tick 56 a
 * TERMS_PENDING site holds one ACTIVE terms- line for each of its terms documents still unread (an event's own rules page,
 * such as agenthon.net's /rules/, which its Terms also incorporate, is a rules page: gated, never a terms- line), a
 * terms- line whose page was read
 * stays paused as read ("# paused (terms read: ..."), and nothing else of the site is active.
 */
describe("tick 56: the second terms read (agenthon.net's Terms of Participation, EUROCONTROL's Disclaimers)", () => {
  const fixture = () => JSON.parse(readFileSync(READ2_FIXTURE, "utf8")) as Record<string, Entry>;
  const pendingWhy = (site: string) =>
    `${site} is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))`;
  const negativeWhy = (site: string) =>
    `${site} is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))`;
  /** The source as tick 56 wrote it: everything before the first "; TERMS_PENDING before: ", after which it keeps tick 55's. */
  const newSource = (e: Entry) => e.source.slice(0, e.source.indexOf(TERMS_BEFORE));
  /** The audit note's tick-56 section, up to the tick-57 third round after it. */
  const section = () => {
    const audit = readFileSync(AUDIT, "utf8");
    const start = audit.indexOf("## Terms read, second round (6.10.2026, tick 56)");
    const end = audit.indexOf("\n## ", start + 1);
    return audit.slice(start, end < 0 ? undefined : end + 1);
  };
  const tableRow = (site: string) => section().split("\n").find((l) => l.startsWith(`| \`${site}\` | `))!;
  const metaOf = (copy: string) => JSON.parse(readFileSync(`${copy}.meta.json`, "utf8")) as Capture["meta"];
  /** The kind words of ruling 6.10 row 21 decision 3(1), as the "tick 54: the terms read" block reads them. */
  const KIND = /^(refusal-type|exhaustive-negative|unanswered|shell|deferred to [a-z0-9.-]+)\b/;

  it("keeps the two tick-55 entries as a fixture, as terms-verdicts.json held them at 4f3527d", () => {
    expect(createHash("sha256").update(readFileSync(READ2_FIXTURE)).digest("hex")).toBe(READ2_FIXTURE_SHA256);
    expect(Object.keys(fixture()).sort()).toEqual(Object.keys(READ2).sort());
    // What the "tick 55" block holds: both TERMS_PENDING, each note opening "terms unread:", each source keeping tick 54's.
    for (const [site, e] of Object.entries(fixture())) {
      expect([e.verdict, e.checked, e.copying], site).toEqual(["TERMS_PENDING", "2026-10-06", "unread"]);
      expect(e.note!.startsWith("terms unread: "), site).toBe(true);
      expect(e.source.endsWith(`${LINKS_FOUND[site].marker}${tick54(verdicts())[site].source}`), site).toBe(true);
    }
    // Where 4f3527d is reachable, the fixture is byte for byte its two entries (a fact about 4f3527d no later commit can
    // change); a shallow checkout has the pinned sha256 only.
    let base: string | null = null;
    try {
      base = execFileSync("git", ["show", `${READ2_BASE}:${VERDICTS}`], { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" });
    } catch {
      base = null;
    }
    if (base === null) return;
    const then = JSON.parse(base).sites as Record<string, Entry>;
    for (const [site, e] of Object.entries(fixture())) expect(e, site).toEqual(then[site]);
    expect(then["ansperformance.eu"].note!.split(ANS_TICK55)).toHaveLength(2);
  });

  it("freezes both terms pages and eurocontrol.int's robots.txt before citing them, and no urls.txt line names a frozen copy", () => {
    const manifest = readFileSync("research/rendered/FROZEN.sha256", "utf8");
    const listed: Set<string> = listedNames(readFileSync(URLS, "utf8"));
    const copies: [string, string, string, string][] = [
      [AG_TERMS, "terms-agenthon", READ2_BASE, "https://www.agenthon.net/terms/"],
      [EU_DISCLAIMERS, "terms-eurocontrol-disclaimers", READ2_BASE, "https://www.eurocontrol.int/info/disclaimers"],
      [EU_ROBOTS, EURO_PROBE.slug, "364bf71", EURO_PROBE.url],
    ];
    for (const [copy, live, commit, url] of copies) {
      const slug = copy.replace(/^research\/rendered\//, "");
      const meta = metaOf(copy);
      expect([meta.slug, meta.url, meta.status], slug).toEqual([slug, url, 200]);
      expect(meta.frozen?.from, slug).toBe(`research/rendered/${live}.meta.json`);
      expect([meta.frozen?.commit, meta.frozen?.on], slug).toEqual([commit, FROZEN_ON]);
      expect(meta.frozen?.why, slug).toContain("tick 56");
      const body = readFileSync(meta.bodyPath!);
      expect(createHash("sha256").update(body).digest("hex"), slug).toBe(meta.sha256);
      expect(body.length, slug).toBe(meta.byteLength);
      const exts = meta.textPath ? ["html", "meta.json", "txt"] : ["meta.json", "txt"];
      for (const ext of exts) expect(manifest, `${slug}.${ext}`).toContain(`  ${slug}.${ext}\n`);
      expect(listed.has(slug), slug).toBe(false);
      expect(classifyCapture(readCapture(slug)).kind, slug).toBe("ok");
    }
    // The terms pages were fetched by the tick-56 dispatch; the robots.txt by the 12:05 weekly run, before tick 55 paused it.
    expect([metaOf(AG_TERMS).fetchedAt, metaOf(EU_DISCLAIMERS).fetchedAt, metaOf(EU_ROBOTS).fetchedAt]).toEqual([
      "2026-10-06T15:12:46.858Z",
      "2026-10-06T15:12:48.160Z",
      "2026-10-06T12:07:27.881Z",
    ]);
    expect(metaOf(EU_ROBOTS).contentType).toMatch(/^text\/plain\b/);
  });

  it("keeps agenthon.net TERMS_PENDING: its Terms page a participant agreement, two incorporated documents queued, copying unread", () => {
    // The entry as tick 56 wrote it, which eurocontrol.int's fold kept (tick57e()); since agenthon.net's third terms read
    // (tick 57, later) the site is NO_TERMS_ROBOTS_OK ("tick 57, third round" below).
    const v = tick57e(verdicts());
    const t55 = tick55(v);
    const e = v["agenthon.net"];
    expect(verdicts()["agenthon.net"].verdict).toBe("NO_TERMS_ROBOTS_OK");
    expect([e.verdict, e.checked, e.copying]).toEqual(["TERMS_PENDING", "2026-10-06", "unread"]);
    expect(Object.keys(e)).toEqual(["verdict", "source", "checked", "note", "copying"]);
    // The source: the two unread documents' URLs first, where their links were observed, the Terms page read on its frozen
    // copy, and tick 55's source after "; TERMS_PENDING before: ", once, byte for byte.
    const src = newSource(e);
    expect(src.startsWith(`${QUEUED2[0].url} and ${QUEUED2[1].url} (the two documents of the site's policy set still unread, `)).toBe(true);
    const meta = metaOf(AG_TERMS);
    expect(src).toContain(`the capture is of ${meta.url}, fetched ${meta.fetchedAt} by the tick-56 dispatch of 6.10, frozen as ${meta.frozen!.commit} stored it`);
    expect(src).toContain('ruled by the main thread (tick 56; research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md, "Terms read, second round (6.10.2026, tick 56)")');
    expect(e.source.endsWith(`${TERMS_BEFORE}${t55["agenthon.net"].source}`)).toBe(true);
    expect(e.source.indexOf(TERMS_BEFORE) + TERMS_BEFORE.length).toBe(e.source.length - t55["agenthon.net"].source.length);
    // The note: no kind word (no site terms of it have been read), what the page is, why the site is not exhaustive-negative,
    // copying unread, the rows, the probe still paused, no robots verdict, and the one rules line, pinned.
    const note = e.note!;
    expect(note.startsWith(`terms unread: the site's Terms page, read 6.10 (tick 56) on its frozen copy (${AG_TERMS}.txt), is the Agenthon 2026 "Terms of Participation"`)).toBe(true);
    expect(KIND.test(note)).toBe(false);
    for (const words of [
      "a participant agreement in a four-document policy set",
      "not website-use terms",
      "Its scope over the home and /rules/ pages is unclear, leaning no",
      "The site stays TERMS_PENDING, not exhaustive-negative (ruling of the main thread, tick 56): two of the three documents the Terms incorporate by name (:47-49), which the footer links (:301-302), are unread policy documents",
      "The third, the Official Competition Rules, is the event's rules page (/rules/), refused by the gate with the rules line below and not queued as a terms- line",
      `copying stays unread: "allowed" means the site's terms were read and bar none of it, and none were (ruling 6.10 row 21 decision 4(2))`,
      "Each of the two is queued as a plain terms- line, once (ZERO-TESTS rows 268 and 269;",
      "the Terms line (ZERO-TESTS row 266) is paused as read",
      `Its robots.txt probe (${LINKS_FOUND["agenthon.net"].probe.url}, ZERO-TESTS row ${LINKS_FOUND["agenthon.net"].probe.row}) stays paused`,
      "scripts/robots-verdict.mjs is not run for the site before the two are read",
      "Open: whether SQA's or Stony Brook University's own site terms reach agenthon.net",
    ]) {
      expect(note, words).toContain(words);
    }
    expect(pinnedLines(note)).toEqual(LINKS_FOUND["agenthon.net"].rules);
    expect(isExhaustiveNegative(e) || isRobotsOkVerdict(e)).toBe(false);
    expect(ADDRESS.test(note) || ADDRESS.test(e.source)).toBe(false);
  });

  it("sets eurocontrol.int NO_TERMS, exhaustive-negative, again: both linked documents read on frozen copies, copying unread", () => {
    // The entry as tick 56 wrote it (tick 57 replaced one sentence of its note and set the robots verdict: "tick 57" below).
    const v = tick56(verdicts());
    const t55 = tick55(v);
    const e = v["eurocontrol.int"];
    expect([e.verdict, e.checked, e.copying]).toEqual(["NO_TERMS", "2026-10-06", "unread"]);
    expect(Object.keys(e)).toEqual(["verdict", "source", "checked", "note", "copying"]);
    expect(isExhaustiveNegative(e)).toBe(true);
    // The source: the frozen copy read, as its meta holds it, and tick 55's source after the first "; TERMS_PENDING before: ".
    const src = newSource(e);
    const meta = metaOf(EU_DISCLAIMERS);
    expect(src.startsWith(`${EU_DISCLAIMERS}.txt (page title "Disclaimers | EUROCONTROL" at :1, a map-designations disclaimer and VAT information, no site terms; `)).toBe(true);
    expect(src).toContain(`the capture is of ${meta.url}, fetched ${meta.fetchedAt} by the tick-56 dispatch of 6.10, frozen as ${meta.frozen!.commit} stored it`);
    expect(e.source.endsWith(`${TERMS_BEFORE}${t55["eurocontrol.int"].source}`)).toBe(true);
    expect(e.source.indexOf(TERMS_BEFORE) + TERMS_BEFORE.length).toBe(e.source.length - t55["eurocontrol.int"].source.length);
    // The note opens with the kind word and the ruling on R1's test: the recorded search, and both documents, named with their
    // frozen copies; copying unread; the probe active again; no robots verdict applied; the rules line pinned.
    const note = e.note!;
    expect(note.startsWith("exhaustive-negative: ruled by the main thread (tick 56) on ruling R1's test, one step of which is not on the record: the tick-45 record searched Open Terms Archive, tosdr/tosdr-snapshots and EUROCONTROL's own GitHub organisation")).toBe(true);
    // (tick-56 review) The note does not say R1's test is met: R1's grep of the organisations' repository contents was
    // found missing by the tick-54 review and never run, and the robots verdict waits on it being run or ruled immaterial.
    expect(note).not.toMatch(/R1's test (is )?met/);
    for (const words of [
      "both documents the site's footer links as terms-like pages are read and hold none",
      `The Disclaimers page, read 6.10 (tick 56) on its frozen copy (${EU_DISCLAIMERS}.txt)`,
      "and no clause on use of the website, automated access, copying, reproduction, storing, commercial use or liability; it states no scope",
      `is titled "Privacy and website terms of use" and is a privacy notice only, its contents headed "Website Privacy Policy" (${EURO_COPY}.txt:367)`,
      `copying stays unread: no site terms exist to read, and "unread" is not "allowed" (ruling 6.10 row 21 decision 4(2))`,
      `So the robots.txt probe (${EURO_PROBE.url}, ZERO-TESTS row ${EURO_PROBE.row}), paused in tick 55, is active again, in the form it had before`,
      "may now be run for the site: run dry in tick 56, applied only on the main thread's word, once the grep above is run or ruled immaterial; always with --urls, since without it the script judges the two terms lines paused as read in research/rendered/urls.txt (/info/privacy-and-website-terms-use and /info/disclaimers) instead of the rules page",
      "The step not on the record: R1 also has the organisations' repository contents grepped for terms, legal, privacy, impressum and mentions légales files; the tick-54 review found no such grep of the euctrl-pru and eurocontrol organisations",
      "The ruling neither ran it nor waived it, so before scripts/robots-verdict.mjs is applied the main thread runs that grep at github grade or rules the step immaterial (tick-56 review)",
      `the footer's Fraud warning item (${EU_DISCLAIMERS}.txt:217) and the privacy statement the contact form links, a PDF (${EU_DISCLAIMERS}.html:1159)`,
      "The two terms lines, the privacy notice (ZERO-TESTS row 242) and the Disclaimers page (ZERO-TESTS row 267), are paused as read",
    ]) {
      expect(note, words).toContain(words);
    }
    expect(note).not.toMatch(/copying (is|stays) allowed|terms unread/);
    expect(pinnedLines(note)).toEqual(LINKS_FOUND["eurocontrol.int"].rules);
    // The live probe capture is named by no entry: the dry run's source would have named it, and the source applied in tick
    // 57 names its frozen copy instead.
    expect(readFileSync(VERDICTS, "utf8")).not.toContain(`research/rendered/${EURO_PROBE.slug}.`);
    expect(ADDRESS.test(note) || ADDRESS.test(e.source)).toBe(false);
  });

  it("ties every line the tick-56 texts cite to a listed range of a frozen copy, the words there, and the site's ZERO-TESTS rows", () => {
    // The two entries as tick 56 wrote them; the audit table's rows as they are (their tick-57 words cite no line).
    const v = tick56(verdicts());
    const rows = zeroRows();
    const urlsText = readFileSync(URLS, "utf8").split("\n");
    const prose = section()
      .split("\n")
      .filter((l) => !l.startsWith("|"))
      .join("\n");
    const listed = (site: string) => CITED2.filter((c) => c.site === site);
    const key = (c: { file: string | null; from: number; to: number }) => `${c.file}:${c.from}-${c.to}`;
    const cited = new Set<string>();
    const check = (site: string | null, what: string, text: string) => {
      for (const c of rangeCites(text)) {
        expect(c.file, `${what}: ${c.at} names no file before it`).not.toBeNull();
        const pool = site ? listed(site) : CITED2;
        expect(pool.map(key), `${what} cites ${key(c)}`).toContain(key(c));
        cited.add(key(c));
      }
      // Each ZERO-TESTS row a text cites is a row of its site (the prose: of either site).
      const sites = site ? [site] : Object.keys(READ2);
      for (const m of text.matchAll(/(?<!ruling [\d.]+ )\brows? (\d+)(?: and (\d+))?\b/g)) {
        for (const n of [m[1], m[2]].filter(Boolean).map(Number)) {
          expect(sites, `${what} cites row ${n}`).toContain(siteOfUrl(rows.get(n)?.url ?? "https://row.missing/"));
        }
      }
    };
    for (const site of Object.keys(READ2)) {
      check(site, `${site} source`, newSource(v[site]));
      check(site, `${site} note`, v[site].note!);
      check(site, `${site} audit table`, tableRow(site));
      check(site, `${site} ZERO-TESTS mark`, READ2[site].mark);
    }
    for (const q of QUEUED2) {
      const comment = urlsText.find((l) => l.startsWith(`# research/channel-loop/ZERO-TESTS.md row ${q.row} — `))!;
      check("agenthon.net", `row ${q.row} comment`, comment);
    }
    check(null, "audit prose", prose);
    // Every listed range holds its words, in the frozen copy, and is cited somewhere: the list holds nothing the texts do
    // not rest on.
    for (const c of CITED2) {
      const lines = readFileSync(c.file, "utf8").split("\n");
      expect(c.to <= lines.length && c.from >= 1 && c.from <= c.to, key(c)).toBe(true);
      const range = lines.slice(c.from - 1, c.to).join("\n");
      for (const w of c.words) expect(range, `${key(c)} holds ${w}`).toContain(w);
      expect(cited.has(key(c)), `${key(c)} is cited`).toBe(true);
    }
    // The fetch time and commit each table row states are its frozen copy's.
    for (const [site, r] of Object.entries(READ2)) {
      const meta = metaOf(r.copy);
      const cell = tableRow(site).split(" | ")[1];
      expect(cell, site).toContain(`fetched ${meta.fetchedAt.replace(/\.\d+Z$/, "Z")}, frozen as ${meta.frozen!.commit} stored it`);
      expect(cell, site).toContain(meta.url);
    }
  });

  it("pauses both read terms- lines as read, queues agenthon.net's two documents plain and once, and re-activates eurocontrol.int's probe", () => {
    const v = verdicts();
    const t56 = tick56(v);
    const text = readFileSync(URLS, "utf8");
    const lines = text.split("\n");
    const rows = zeroRows();
    // The two read lines: under their tick-55 comments, paused as read, URL and slug byte for byte; their rows marked READ.
    for (const [site, r] of Object.entries(READ2)) {
      expect(listedRow(r.row).line, site).toBe(`${r.paused} — ${r.url}\t${r.slug}`);
      expect(lines.filter((l) => l.includes(r.url)), site).toEqual([`${r.paused} — ${r.url}\t${r.slug}`]);
      expect(rows.get(r.row)?.row.endsWith(` ${marksSince(r.row, r.mark)} |`), site).toBe(true);
      expect(t56[site].verdict, site).toBe(r.verdict);
    }
    // agenthon.net's Terms line passed the gate in tick 56 (a TERMS_PENDING site's terms- line), and passes it since tick
    // 57 (NO_TERMS_ROBOTS_OK), and stays paused because it was read; eurocontrol.int's Disclaimers line failed it in tick 56
    // (NO_TERMS), and passes it since tick 57 (NO_TERMS_ROBOTS_OK), paused as read.
    expect(termsGate(READ2["agenthon.net"].url, READ2["agenthon.net"].slug, t56)).toEqual({ ok: true, site: "agenthon.net", verdict: "TERMS_PENDING" });
    expect(termsGate(READ2["agenthon.net"].url, READ2["agenthon.net"].slug, v)).toEqual({ ok: true, site: "agenthon.net", verdict: "NO_TERMS_ROBOTS_OK" });
    expect(termsGate(READ2["eurocontrol.int"].url, READ2["eurocontrol.int"].slug, t56)).toEqual({
      ok: false,
      site: "eurocontrol.int",
      verdict: "NO_TERMS",
      why: negativeWhy("eurocontrol.int"),
    });
    expect(termsGate(READ2["eurocontrol.int"].url, READ2["eurocontrol.int"].slug, v)).toEqual({ ok: true, site: "eurocontrol.int", verdict: "NO_TERMS_ROBOTS_OK" });
    // The two queued lines: queue-zero-test.mjs's comment and row forms, plain, the links observed in both frozen copies.
    // Active in tick 56; since tick 57, when both pages were read, paused as read under the same comment (READ3), the URL
    // and slug byte for byte.
    const agenthonCopy = `${AGENTHON_COPY}.html`;
    for (const [i, q] of QUEUED2.entries()) {
      const { comment, line } = listedRow(q.row);
      expect(line, q.slug).toBe(`${READ3[i].paused} — ${q.url}\t${q.slug}`);
      expect(lines.filter((l) => l.includes(q.url)), q.slug).toEqual([`${READ3[i].paused} — ${q.url}\t${q.slug}`]);
      expect(comment, q.slug).toBe(
        `# research/channel-loop/ZERO-TESTS.md row ${q.row} — agenthon.net TERMS_PENDING (tick 56, a document its Terms of Participation incorporate, unread): URL from the footer link href="${q.href}" at ${agenthonCopy}:${q.prize}, the frozen copy of the 6.10 prize capture of the home page, and at ${AG_TERMS}.html:${q.footer}, the frozen copy of the Terms page read in tick 56, rendered grade; plain once-fetch (ruling 30.9 16(d) D2(iii)) (6.10.2026).`,
      );
      expect(rows.get(q.row)?.row, q.slug).toBe(`| ${q.row} | ${q.candidate} | ${q.url} | ${q.settle} ${READ3[i].mark} |`);
      // Each link, as the two frozen copies hold it, resolves to the queued URL.
      for (const [file, n] of [
        [agenthonCopy, q.prize],
        [`${AG_TERMS}.html`, q.footer],
      ] as [string, number][]) {
        const at = readFileSync(file, "utf8").split("\n")[n - 1];
        const href = at.match(/href="([^"]+)"/)![1];
        expect(new URL(href, "https://www.agenthon.net/").href, `${file}:${n}`).toBe(q.url);
      }
      expect(termsGate(q.url, q.slug, t56), q.slug).toEqual({ ok: true, site: "agenthon.net", verdict: "TERMS_PENDING" });
      expect(termsGate(q.url, q.slug, v), q.slug).toEqual({ ok: true, site: "agenthon.net", verdict: "NO_TERMS_ROBOTS_OK" });
    }
    const tick56Rows = [...rows].filter(([, r]) => r.row.includes(" | terms audit (tick 56): ")).map(([n]) => n);
    expect(tick56Rows).toEqual(QUEUED2.map((q) => q.row));
    // eurocontrol.int's probe: active again in exactly the form it had before tick 55 paused it, under its row's comment;
    // the gate passes it (an exhaustive-negative NO_TERMS site's robots- probe). agenthon.net's stayed paused, and is
    // active again since tick 57 ("tick 57, third round" below).
    expect(listedRow(EURO_PROBE.row).line).toBe(`${EURO_PROBE.url}\t${EURO_PROBE.slug}`);
    expect(lines.filter((l) => l.endsWith(`\t${EURO_PROBE.slug}`))).toEqual([`${EURO_PROBE.url}\t${EURO_PROBE.slug}`]);
    expect(termsGate(EURO_PROBE.url, EURO_PROBE.slug, t56)).toEqual({ ok: true, site: "eurocontrol.int", verdict: "NO_TERMS" });
    expect(termsGate(EURO_PROBE.url, EURO_PROBE.slug, v)).toEqual({ ok: true, site: "eurocontrol.int", verdict: "NO_TERMS_ROBOTS_OK" });
    const agProbe = LINKS_FOUND["agenthon.net"].probe;
    expect(listedRow(agProbe.row).line).toBe(`${agProbe.url}\t${agProbe.slug}`);
    // The ZERO-TESTS marks: the probe active again, the privacy-notice row and agenthon.net's probe row dated.
    expect(rows.get(EURO_PROBE.row)?.row).toContain("**ACTIVE again 6.10 (tick 56): eurocontrol.int is NO_TERMS, exhaustive-negative, again: ");
    expect(rows.get(242)?.row.endsWith(
      " **6.10 (tick 56): the Disclaimers page (row 267) was read: no site terms; eurocontrol.int is NO_TERMS, exhaustive-negative, again, this line stays paused as read, and the probe (row 265) is active again.** |",
    )).toBe(true);
    expect(rows.get(agProbe.row)?.row).toMatch(/\*\*6\.10 \(tick 56\): still paused: [^|]*rows 268 and 269 are read\.\*\* \*\*ACTIVE again 6\.10 \(tick 57\): /);
    // Nothing stale, nothing the gate would pause. In tick 56 the one paused line of the two sites the gate would pass was
    // agenthon.net's Terms line, read; since tick 57 eurocontrol.int's two terms lines are passed too, both read, and
    // agenthon.net's two documents' lines, paused as read since tick 57 (with tick 56's verdicts the gate passes them as a
    // TERMS_PENDING site's terms- lines; they were active then).
    const sync = syncPauseComments(text, v, { today: "6.10.2026" });
    expect(sync.changes).toEqual([]);
    const passing = (s: { unpause: { site: string; slug: string }[] }) => s.unpause.filter((u) => Object.hasOwn(READ2, u.site)).map((u) => u.slug);
    expect(passing(sync)).toEqual(["terms-eurocontrol", READ2["agenthon.net"].slug, READ2["eurocontrol.int"].slug, ...QUEUED2.map((q) => q.slug)]);
    expect(passing(syncPauseComments(text, t56, { today: "6.10.2026" }))).toEqual([READ2["agenthon.net"].slug, ...QUEUED2.map((q) => q.slug)]);
    expect(applyVerdicts(text, v).paused).toEqual([]);
  });

  it("holds one active terms- line for each unread document of a TERMS_PENDING site, and nothing else of it active (the tick-56 rule)", () => {
    // Until tick 55 the rule was "exactly one terms- line per TERMS_PENDING site". agenthon.net's Terms page was read and
    // incorporates two unread policy documents, so since tick 56 the rule is: one ACTIVE terms- line per terms document
    // still unread, every read one paused as read, and no other line of the site active. The third document its Terms
    // incorporate by name, the Official Competition Rules (/rules/), is the event's rules page: refused by the gate like
    // the rules line, never a terms- line (tick-56 review). agenthon.net held the rule in tick 56 with its two documents'
    // lines active (QUEUED2); since tick 57 both are read too, all three of its terms lines are paused as read, and the
    // site is NO_TERMS_ROBOTS_OK, so adaptionlabs.ai is the one TERMS_PENDING site the rule reads now.
    const v = verdicts();
    const unread: Record<string, string[]> = {
      "adaptionlabs.ai": ["https://adaptionlabs.ai/terms-of-service"],
    };
    expect(tick57e(v)["agenthon.net"].verdict).toBe("TERMS_PENDING");
    const sites = [...new Set([...Object.keys(AUDITED), ...Object.keys(READ2)])].filter((s) => v[s]?.verdict === "TERMS_PENDING");
    expect(sites.sort()).toEqual(Object.keys(unread).sort());
    for (const site of sites) {
      const mine = active().filter((e) => siteOfUrl(e.url) === site);
      expect(mine.every((e) => e.slug.startsWith("terms-")), site).toBe(true);
      expect(mine.map((e) => e.url).sort(), site).toEqual([...unread[site]].sort());
      for (const e of mine) expect(termsGate(e.url, e.slug, v).ok, e.url).toBe(true);
      // Its terms- lines that are paused were read: "# paused (terms read: ...".
      const pausedTerms = pausedLines().filter((p) => siteOfUrl(p.url) === site && p.slug.startsWith("terms-"));
      for (const p of pausedTerms) expect(p.line, p.slug).toMatch(/^# paused \(terms read: /);
    }
    const agTerms = pausedLines().filter((p) => siteOfUrl(p.url) === "agenthon.net" && p.slug.startsWith("terms-"));
    expect(agTerms.map((p) => p.slug)).toEqual([READ2["agenthon.net"].slug, ...QUEUED2.map((q) => q.slug)]);
    for (const p of agTerms) expect(p.line, p.slug).toMatch(/^# paused \(terms read: /);
    expect(active().filter((e) => siteOfUrl(e.url) === "agenthon.net" && e.slug.startsWith("terms-"))).toEqual([]);
  });

  it("refuses both sites' rules URLs; scripts/robots-verdict.mjs, run dry, would set eurocontrol.int and declines agenthon.net", () => {
    // Tick 56's state: eurocontrol.int's entry put back from the fixture (tick 57 applied the script: "tick 57" below).
    const v = tick56(verdicts());
    const read = JSON.parse(readFileSync(VERDICTS, "utf8"));
    const now = { ...read, sites: verdictsOf(read) };
    const file = { ...now, sites: v };
    for (const site of Object.keys(READ2)) {
      const why = site === "agenthon.net" ? pendingWhy(site) : negativeWhy(site);
      for (const e of [...rulesOf(site), ...linesOf(readFileSync(PRIZE_URLS, "utf8")).filter((x) => siteOfUrl(x.url) === site)]) {
        expect(termsGate(e.url, e.slug, v), e.url).toEqual({ ok: false, site, verdict: v[site].verdict, why });
      }
    }
    expect(termsGate("https://www.agenthon.net/rules/", "agenthon-rules", v).why).toBe(pendingWhy("agenthon.net"));
    // eurocontrol.int on the frozen copy of the probe capture: the one rules path is allowed (no rule matches it), so the
    // script would set NO_TERMS_ROBOTS_OK, keeping the note and the copying field; the file was not changed (dry run).
    const robots = frozenCapture(`${EU_ROBOTS}.txt`);
    expect(robots.meta.url).toBe(EURO_PROBE.url);
    const page = rulesOf("eurocontrol.int");
    expect(page.map((e) => e.url)).toEqual(["https://www.eurocontrol.int/air-navigation-services-performance-review"]);
    const decision = robotsDecision(robotsRulesFor(parseRobotsTxt(robots.body)), page[0].url) as { allowed: boolean; rule: unknown };
    expect([decision.allowed, decision.rule]).toEqual([true, null]);
    for (const urls of [readFileSync(FIXTURE, "utf8"), readFileSync(PRIZE_URLS, "utf8")]) {
      const out = judgeSite({ site: "eurocontrol.int", verdicts: file, urls, readCapture: readerOf(robots), today: ROBOTS_CHECKED });
      expect(out.changed).toBe(true);
      const set = out.verdicts.sites["eurocontrol.int"];
      expect(isRobotsOkVerdict(set)).toBe(true);
      expect([set.note, set.copying]).toEqual([v["eurocontrol.int"].note, "unread"]);
      expect(set.source.endsWith(`${BEFORE}${v["eurocontrol.int"].source}`)).toBe(true);
      // ...and the source it writes on the frozen copy is the one tick 57 committed.
      expect(set.source).toBe(now.sites["eurocontrol.int"].source);
    }
    expect(v["eurocontrol.int"].verdict).toBe("NO_TERMS");
    expect(now.sites["eurocontrol.int"].verdict).toBe("NO_TERMS_ROBOTS_OK");
    // (Without --urls the script reads research/rendered/urls.txt, which holds no rules page of the site: the pages it
    // would judge there are the two terms pages paused as read, not the rules page. Tick 56 ran it with --urls.)
    expect(readFileSync(URLS, "utf8")).not.toContain(page[0].url);
    // agenthon.net: TERMS_PENDING, never judged, until its third terms read (tick57e()'s state; tick 57, later, it was).
    const now57e = { ...now, sites: tick57e(now.sites) };
    const ag = judgeSite({ site: "agenthon.net", verdicts: now57e, urls: readFileSync(PRIZE_URLS, "utf8"), today: ROBOTS_CHECKED });
    expect(ag.changed).toBe(false);
    expect(ag.why).toContain("NO_TERMS_ROBOTS_OK is set only for a NO_TERMS site whose note opens exhaustive-negative");
  });

  it("records the reading in the audit note's last section: the table, the verifiers' points, the dry run and the counts", () => {
    const text = section();
    const audit = readFileSync(AUDIT, "utf8");
    expect(audit.indexOf("## Terms read, second round (6.10.2026, tick 56)")).toBeGreaterThan(audit.indexOf("## Terms links found after the verdicts (6.10.2026, tick 55)"));
    expect(text.indexOf("\n## ", 1)).toBe(-1);
    const v = verdicts();
    const t56 = tick56(v);
    const rows = text.split("\n").filter((l) => /^\| `[a-z0-9.-]+` \|/.test(l));
    expect(rows.map((r) => r.match(/^\| `([a-z0-9.-]+)` \|/)![1])).toEqual(Object.keys(READ2));
    for (const row of rows) {
      const cells = row.replace(/\\\|/g, "¦").split(" | ");
      expect(cells, row.slice(0, 40)).toHaveLength(7);
      const site = cells[0].match(/`([a-z0-9.-]+)`/)![1];
      expect(cells[3].startsWith(`\`${READ2[site].copy}.txt:`), site).toBe(true);
      expect(cells[4].startsWith(`${v[site].verdict} (`), site).toBe(true);
      expect(cells[5], site).toBe(v[site].copying);
      expect(cells[6], site).toContain(`The terms line (row ${READ2[site].row})`);
      expect(pinnedLines(cells[6]), site).toEqual(LINKS_FOUND[site].rules);
    }
    // agenthon.net's row: its verdict and lines as they are since tick 57, tick 56's beside them, dated.
    expect(rows[0]).toContain(
      "| NO_TERMS_ROBOTS_OK (since tick 57, when the Data & Software Licensing Policy and the Privacy Notice were read, neither site terms, the main thread ruled the site NO_TERMS, exhaustive-negative, and `scripts/robots-verdict.mjs` was applied; 6.10, tick 56: TERMS_PENDING, not exhaustive-negative, the two documents the Terms incorporate unread; \"Terms read, third round\" below) | unread |",
    );
    expect(rows[0]).toContain(
      "the terms- lines for the Licensing and Privacy pages (rows 268 and 269) paused as read since tick 57; the robots.txt probe (row 247) active again since tick 57, its capture judged then; the rules URL (ai-allowed-events.urls.txt@548be52:173) passes `termsGate` since tick 57 (6.10, tick 56: the two lines queued, active, the probe paused and the rules URL refused by `termsGate`) |",
    );
    expect(t56["agenthon.net"].verdict).toBe("TERMS_PENDING");
    // eurocontrol.int's row: its verdict and lines as they are since tick 57, tick 56's beside them, dated.
    expect(rows[1]).toContain(
      "the robots.txt probe (row 265) active again, its capture of the 12:05 weekly run judged in tick 57; the rules URL (ai-allowed-events.urls.txt@548be52:162) passes `termsGate` since tick 57 (6.10, tick 56: the capture not yet judged, and the rules URL refused until `scripts/robots-verdict.mjs` set NO_TERMS_ROBOTS_OK) |",
    );
    expect(rows[1]).toContain(
      "| NO_TERMS_ROBOTS_OK (since tick 57, when the main thread ruled R1's grep unreachable from this session and waived it, and `scripts/robots-verdict.mjs` was applied; 6.10, tick 56: NO_TERMS, exhaustive-negative, ruled on R1's test: the recorded search and both documents the footer links read; R1's grep of the organisations' repository contents not yet on the record) | unread |",
    );
    expect(t56["eurocontrol.int"].verdict).toBe("NO_TERMS");
    expect(text).not.toMatch(/R1's test (is )?met/);
    // Render group 6 held eurocontrol.int in tick 56: the dry run, not applied, and what applying it waited on (tick-56
    // review: a claim that the script had been applied got through after the pinned heading). Since tick 57 it is empty,
    // and its bullet says what it held and when that changed ("tick 57" below pins the whole bullet).
    const group6 = audit.split("\n").filter((l) => l.startsWith("- **Robots probe captured, robots verdict not yet run "));
    expect(group6).toHaveLength(1);
    expect(group6[0]).toContain(
      "(ruled on R1's test: the recorded search, and both documents its footer links read, with R1's grep of the organisations' repository contents not on the record; \"Terms read, second round\" below)",
    );
    expect(group6[0]).toContain(
      "`scripts/robots-verdict.mjs` was run on it dry in tick 56 (it would set NO_TERMS_ROBOTS_OK), applying it was the main thread's call once that grep was run or ruled immaterial, and its rules URL was refused until then.",
    );
    // The verifiers' points the ruling took and the ones it recorded.
    for (const words of [
      'The reader graded it NO_TERMS with copying "allowed"; the verifier graded it NO_TERMS too, with copying "unread", and disagreed on copying, on the scope and on the reader\'s fallback.',
      // The verifier's dissent on the reader's fallback, the right way round (tick-56 review: inverting it got through).
      "the reader's fallback, NOT_BARRED if read as site terms, fails, since on that reading the visitor would be bound by the four incorporated documents (:44-50), three of them unread",
      // The verifier's advice the ruling did not take, recorded as such (tick-56 review).
      "so the verifier advised keeping the Terms line on the weekly watch to catch a re-dated version; the ruling paused it as read instead, and that advice, not taken, is recorded here",
      "it is the third document the Terms incorporate by name and, being the event's rules page, is gated as a rules page with no terms- line",
      // eurocontrol.int: ruled on R1's test, the one step not on the record, and what the robots verdict waits on.
      "The main thread's ruling: NO_TERMS, its note opening \"exhaustive-negative:\", on ruling R1's test:",
      "One step of R1's list is still not on the record (tick-56 review): R1 has the organisations' repository contents grepped for terms, legal, privacy, impressum and mentions légales files, the tick-54 review found no such grep of the euctrl-pru and eurocontrol organisations",
      "The ruling neither ran it nor waived it, so before `scripts/robots-verdict.mjs` is applied the main thread runs that grep at github grade or rules the step immaterial. (Ruled 6.10, tick 57: unreachable from this session, and waived; \"eurocontrol.int's robots verdict\" below.)",
      "It waits on R1's grep too (eurocontrol.int above). And it is to be run with `--urls`: without it the script reads `research/rendered/urls.txt`, where the site's queued pages are its two terms lines paused as read",
      'scope over the home and /rules/ pages is "unclear, leaning no", not "no"',
      'copying stays "unread", since "allowed" means the site\'s terms were read and bar none of it (ruling 6.10 row 21 decision 4(2)), and none were',
      'Both graded copying "allowed"; the main thread ruled "unread": no site terms exist to read',
      "the page states no scope, so whether it reaches the rules page is \"unclear\", and moot, not \"no\"",
    ]) {
      expect(text, words).toContain(words);
    }
    // The dry run, not applied in tick 56, and why an applied verdict is to cite the frozen copy; applied in tick 57.
    expect(text).toContain("`node scripts/robots-verdict.mjs eurocontrol.int --urls research/measurements/ai-allowed-events.urls.txt` was run dry");
    expect(text).toContain("so the script would set NO_TERMS_ROBOTS_OK. It was not applied: that is the main thread's call");
    expect(text).toContain(
      "and `scripts/prize-dispatch.mjs --skip-captured --why` refuses it as NO_TERMS. (Applied 6.10, tick 57, with `--urls`, and repointed to the frozen copy: \"eurocontrol.int's robots verdict\" below.)",
    );
    expect(text).toContain(`frozen in tick 56 as \`${EU_ROBOTS}\` (as 364bf71 stored it: 200, \`text/plain\`, sha256 ${metaOf(EU_ROBOTS).sha256!.slice(0, 12)})`);
    // The counts: 33 of the 101 audited rules URLs through the gate in tick 56 (34 since tick 57, "tick 57" below); two
    // prize-event sites TERMS_PENDING; 24 kindless notes.
    const open = audited().filter((e) => termsGate(e.url, e.slug, t56).ok).length;
    expect(open).toBe(33);
    expect(text).toContain(`the gate still admits ${open} of the 101 audited rules URLs`);
    // Since tick 57 the sentence carries a dated pointer to what the probe group and the gate hold now (tick-57 review: the
    // present-tense "1 URL on 1 site" and "still admits 33" were left standing). The group's counts are its heading's, which
    // the counts test checks against the fixture and the verdicts; the gate's are termsGate's on the verdicts as they are.
    // (The gate's count after eurocontrol.int's verdict is termsGate's on tick57e()'s verdicts; later in tick 57, with
    // agenthon.net's robots verdict, on the verdicts as they are, and the fourth group's count is its heading's.)
    const open57e = audited().filter((e) => termsGate(e.url, e.slug, tick57e(v)).ok).length;
    const openNow = audited().filter((e) => termsGate(e.url, e.slug, v).ok).length;
    const g6Now = audit
      .split("\n")
      .find((l) => l.startsWith("- **Robots probe captured, robots verdict not yet run "))!
      .match(/\): (\d+) URLs? on (\d+) sites?\*\* since tick 57 /)!;
    const g4Now = audit
      .split("\n")
      .find((l) => l.startsWith("- **Terms link found after the verdict, terms pages queued "))!
      .match(/\): (\d+) URLs? on (\d+) sites?\*\* since tick 57 /)!;
    expect([open57e, Number(g6Now[1]), Number(g6Now[2]), openNow, Number(g4Now[1]), Number(g4Now[2])]).toEqual([34, 0, 0, 35, 0, 0]);
    expect(text).toContain(
      `now headed "Robots probe captured, robots verdict not yet run" (1 URL on 1 site; 0 in tick 55); the gate still admits ${open} of the 101 audited rules URLs. ` +
        `(Since 6.10, tick 57: the group holds ${g6Now[1]} URLs on ${g6Now[2]} sites, eurocontrol.int's rules URL being in "Now, on robots.txt", and the gate admits ${open57e} of the 101; "eurocontrol.int's robots verdict" below.) ` +
        `(Later in tick 57, when agenthon.net's last two documents were read and its robots verdict set: the fourth group holds ${g4Now[1]} URLs on ${g4Now[2]} sites, agenthon.net's rules URL being in "Now, on robots.txt" too, and the gate admits ${openNow} of the 101; "Terms read, third round" below.) ` +
        "Two prize-event sites are TERMS_PENDING now,",
    );
    const t57e = tick57e(v);
    const pending = Object.keys(AUDITED).filter((s) => t57e[s].verdict === "TERMS_PENDING").sort();
    expect([...new Set([...pending, ...Object.keys(READ2).filter((s) => t57e[s].verdict === "TERMS_PENDING")])].sort()).toEqual(["adaptionlabs.ai", "agenthon.net"]);
    expect(Object.keys(AUDITED).filter((s) => v[s].verdict === "TERMS_PENDING")).toEqual(["adaptionlabs.ai"]);
    expect(text).toContain(
      "Two prize-event sites are TERMS_PENDING now, adaptionlabs.ai (kind shell) and agenthon.net, and the notes with no kind word are 24: the 23 named in \"Terms read\" above and agenthon.net's, which opens \"terms unread:\" because none of its site terms have been read. " +
        "(Since 6.10, tick 57: one is TERMS_PENDING, adaptionlabs.ai, and the notes with no kind word are 23, agenthon.net's opening \"exhaustive-negative:\" since its last two documents were read; \"Terms read, third round\" below.)",
    );
    // The rule change, stated in the note as in this block's comment.
    expect(text).toContain(
      "since tick 56 it holds one active terms- line for each terms document still unread (an event's own rules page, such as agenthon.net's /rules/, is gated as a rules page and gets none), and a read one stays paused as read",
    );
    expect(ADDRESS.test(text)).toBe(false);
  });

  it("names eurocontrol.int's entry as it is in ansperformance.eu's note", () => {
    // Only the parenthetical is checked (the fixture test holds that 4f3527d's note had tick 55's once, and the tick-57
    // fixture test that 19d203a's had tick 56's): the rest of that note may change in later ticks without this test.
    // Tick 56 wrote ANS_TICK56; tick 57, with the robots verdict, ANS_NOW.
    const ans = verdicts()["ansperformance.eu"].note!;
    expect(ans.split(ANS_NOW)).toHaveLength(2);
    expect(ans).not.toContain(ANS_TICK56);
    expect(ans).not.toContain(ANS_TICK55);
    expect(ans).not.toContain(ANS_TICK54);
    expect(tick56(verdicts())["eurocontrol.int"].verdict).toBe("NO_TERMS");
    expect(verdicts()["eurocontrol.int"].verdict).toBe("NO_TERMS_ROBOTS_OK");
  });
});

/**
 * Tick 57 (6.10.2026): eurocontrol.int's robots verdict. The tick-56 review found one step of ruling R1's list not on the
 * record for the site, the grep of the organisations' repository contents for terms, legal, privacy, impressum and mentions
 * légales files; the main thread tried it (the GitHub API's repository listing of euctrl-pru and of eurocontrol answered
 * HTTP 403: the session is bound to its configured repositories) and ruled it unreachable from this session, as GitHub-wide
 * code search is in R1 itself, so the tick-45 search of the organisations' GitHub presence stands as the search of record
 * and the step is waived for the site (logs/CHANNEL_LOOP.md §9, "Queued 6.10 (tick 56)" item 2). The note's sentence that
 * the ruling neither ran nor waived it was replaced by that ruling, written through serializeVerdicts; then
 * scripts/robots-verdict.mjs eurocontrol.int --urls research/measurements/ai-allowed-events.urls.txt --apply set
 * NO_TERMS_ROBOTS_OK on the probe's capture of the 12:05 weekly run of 6.10, and the source it wrote was repointed from the
 * live capture to its frozen copy (robots-eurocontrol-2026-10-06, as 364bf71 stored it), exactly as judgeSite writes it on
 * that copy. The prize line (ai-allowed-events.urls.txt@548be52:162) passes the gate, open to dispatch. ansperformance.eu's
 * note names the entry as it is now; urls-pause-comments.mjs --fix rewrote the verdict word of the two terms lines paused
 * as read. The fixture holds the tick-56 entry; tick56() puts it back for the blocks above.
 */
describe("tick 57: eurocontrol.int's robots verdict (R1's repository grep ruled unreachable and waived; scripts/robots-verdict.mjs applied)", () => {
  const SITE = "eurocontrol.int";
  const fixture = () => JSON.parse(readFileSync(ROBOTS57_FIXTURE, "utf8")) as Record<string, Entry>;
  /** The sentence tick 56's note carried, which the ruling replaced. */
  const OLD_SENTENCE =
    "The ruling neither ran it nor waived it, so before scripts/robots-verdict.mjs is applied the main thread runs that grep at github grade or rules the step immaterial (tick-56 review).";
  /** The main thread's ruling, in the note's register (no address, no person's name). */
  const RULING_SENTENCE =
    'The main thread ruled on that step in tick 57 (6.10): the grep was tried on 6.10 (tick 56), listing the two organisations\' repositories with gh api orgs/<org>/repos for euctrl-pru and for eurocontrol, and both answered HTTP 403, since this session is bound to its configured repositories; so the step is unreachable from this session, as GitHub-wide code search is in R1 itself, the tick-45 search of the organisations\' GitHub presence stands as the search of record, and the step is waived for eurocontrol.int (logs/CHANNEL_LOOP.md §9, "Queued 6.10 (tick 56)" item 2), which is the ruling the condition below waited on: the step waived, not run.';
  /** The prize line the verdict opens: the fixture's line 162, the one rules URL of the site. */
  const PRIZE_LINE = { n: 162, url: "https://www.eurocontrol.int/air-navigation-services-performance-review", slug: "prize-www-eurocontrol-int-air-navigation-services-perf-fd12ebb3" };
  const ROBOTS_COMMIT = "364bf71";
  const paragraph = () => {
    const audit = readFileSync(AUDIT, "utf8");
    return audit.split("\n").find((l) => l.startsWith("**eurocontrol.int's robots verdict (6.10.2026, tick 57).** "))!;
  };

  it("keeps eurocontrol.int's tick-56 entry as a fixture, as terms-verdicts.json held it at 19d203a", () => {
    expect(createHash("sha256").update(readFileSync(ROBOTS57_FIXTURE)).digest("hex")).toBe(ROBOTS57_FIXTURE_SHA256);
    expect(Object.keys(fixture())).toEqual([SITE]);
    // What the "tick 56" block holds: NO_TERMS, exhaustive-negative, the R1 step not on the record and not yet ruled on.
    const e = fixture()[SITE];
    expect([e.verdict, e.checked, e.copying]).toEqual(["NO_TERMS", "2026-10-06", "unread"]);
    expect(Object.keys(e)).toEqual(["verdict", "source", "checked", "note", "copying"]);
    expect(isExhaustiveNegative(e)).toBe(true);
    expect(e.note!.split(OLD_SENTENCE)).toHaveLength(2);
    expect(e.source.startsWith(`${EU_DISCLAIMERS}.txt (`)).toBe(true);
    // Where 19d203a is reachable, the fixture is byte for byte its entry, and ansperformance.eu's note then held tick 56's
    // parenthetical once (facts about 19d203a no later commit can change); a shallow checkout has the pinned sha256 only.
    let base: string | null = null;
    try {
      base = execFileSync("git", ["show", `${ROBOTS57_BASE}:${VERDICTS}`], { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" });
    } catch {
      base = null;
    }
    if (base === null) return;
    const then = JSON.parse(base).sites as Record<string, Entry>;
    expect(e).toEqual(then[SITE]);
    expect(then["ansperformance.eu"].note!.split(ANS_TICK56)).toHaveLength(2);
    expect(then["ansperformance.eu"].note!).not.toContain(ANS_NOW);
  });

  it("replaces the one sentence of the note with the main thread's ruling, and nothing else of the note", () => {
    const before = fixture()[SITE].note!;
    const note = verdicts()[SITE].note!;
    expect(note).toBe(before.replace(OLD_SENTENCE, RULING_SENTENCE));
    expect(note.split(RULING_SENTENCE)).toHaveLength(2);
    expect(note).not.toContain(OLD_SENTENCE);
    expect(note).not.toContain("The ruling neither ran it nor waived it");
    // The note still opens with the kind word and the tick-56 ruling, and still says which step is not on the record: the
    // step is waived, not run.
    expect(note.startsWith("exhaustive-negative: ruled by the main thread (tick 56) on ruling R1's test, one step of which is not on the record: ")).toBe(true);
    expect(note).toContain("The step not on the record: R1 also has the organisations' repository contents grepped for terms, legal, privacy, impressum and mentions légales files;");
    expect(note).not.toMatch(/R1's test (is )?met/);
    // The ruling cites no capture line and no prize line, and names no address.
    expect(rangeCites(RULING_SENTENCE)).toEqual([]);
    expect(pinnedLines(note)).toEqual([PRIZE_LINE.n]);
    expect(ADDRESS.test(note)).toBe(false);
  });

  it("sets NO_TERMS_ROBOTS_OK through scripts/robots-verdict.mjs, its source naming the frozen copy of the capture it read", () => {
    const file = JSON.parse(readFileSync(VERDICTS, "utf8"));
    const v = beforeRecheck(file.sites as Record<string, Entry>);
    const t56 = tick56(v);
    const e = v[SITE];
    expect([e.verdict, e.checked, e.copying]).toEqual(["NO_TERMS_ROBOTS_OK", ROBOTS_CHECKED, "unread"]);
    expect(Object.keys(e)).toEqual(["verdict", "source", "checked", "note", "copying"]);
    expect(isRobotsOkVerdict(e)).toBe(true);
    expect(e.source).toContain(`(scripts/robots-verdict.mjs); ruling ${RULING_D2V}${BEFORE}`);
    // The NO_TERMS source tick 56 wrote follows, byte for byte, after the first "; NO_TERMS before: ".
    expect(e.source.slice(e.source.indexOf(BEFORE) + BEFORE.length)).toBe(t56[SITE].source);
    // The capture: the frozen copy of the 12:05 weekly run's robots.txt, a file the site served, read as the script reads it.
    const cited = citedCapture(e.source)!;
    expect(cited).toEqual({
      kind: "file",
      path: `${EU_ROBOTS}.txt`,
      slug: "robots-eurocontrol-2026-10-06",
      url: EURO_PROBE.url,
      fetchedAt: "2026-10-06T12:07:27.881Z",
      sha12: "45d83d13c223",
      n: 1,
    });
    const capture = frozenCapture(cited.path);
    expectFrozenCopy(capture, EURO_PROBE.slug, ROBOTS_COMMIT, SITE);
    expect([capture.meta.url, capture.meta.fetchedAt, capture.meta.sha256!.slice(0, 12)]).toEqual([cited.url, cited.fetchedAt, cited.sha12]);
    expect(readableCapture(capture.meta, capture.body)).toEqual({ kind: "file" });
    // Set by the script, not by hand: from the tick-56 entry with the tick-57 note, on either list, judgeSite reading the
    // frozen copy allows the one rules path (no rule matches it) and writes exactly the committed entry.
    const prior = { ...file, sites: { ...v, [SITE]: { ...t56[SITE], note: e.note } } };
    for (const urls of [readFileSync(FIXTURE, "utf8"), readFileSync(PRIZE_URLS, "utf8")]) {
      const out = judgeSite({ site: SITE, verdicts: prior, urls, readCapture: readerOf(capture), today: ROBOTS_CHECKED });
      expect(out.changed).toBe(true);
      expect(out.checked.map((c: { url: string; allowed: boolean; rule: unknown }) => [c.url, c.allowed, c.rule])).toEqual([[PRIZE_LINE.url, true, null]]);
      expect(out.verdicts.sites[SITE]).toEqual(e);
    }
    // No file names the live capture, and no urls.txt line names the frozen copy, so the weekly run never moves it.
    expect(readFileSync(VERDICTS, "utf8")).not.toContain(`research/rendered/${EURO_PROBE.slug}.`);
    expect(readFileSync(URLS, "utf8")).not.toContain(cited.slug);
    // Run again on any list, the script changes nothing: the site is already set.
    const set = { ...file, sites: v };
    for (const urls of [readFileSync(FIXTURE, "utf8"), readFileSync(PRIZE_URLS, "utf8"), readFileSync(URLS, "utf8")]) {
      const out = judgeSite({ site: SITE, verdicts: set, urls, today: ROBOTS_CHECKED });
      expect([out.changed, out.why]).toEqual([false, `${SITE} is already NO_TERMS_ROBOTS_OK`]);
      expect(out.verdicts).toBe(set);
    }
    expect(serializeVerdicts(file)).toBe(readFileSync(VERDICTS, "utf8"));
  });

  it("opens the prize line to dispatch: the gate passes it in the audited list and in the live one, and urls.txt holds no rules page", () => {
    const v = verdicts();
    const t56 = tick56(v);
    const negativeWhy = `${SITE} is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))`;
    expect(rulesOf(SITE).map((e) => [e.n, e.url, e.slug])).toEqual([[PRIZE_LINE.n, PRIZE_LINE.url, PRIZE_LINE.slug]]);
    for (const e of [...rulesOf(SITE), ...linesOf(readFileSync(PRIZE_URLS, "utf8")).filter((x) => siteOfUrl(x.url) === SITE)]) {
      expect(termsGate(e.url, e.slug, v), e.url).toEqual({ ok: true, site: SITE, verdict: "NO_TERMS_ROBOTS_OK" });
      expect(termsGate(e.url, e.slug, t56), e.url).toEqual({ ok: false, site: SITE, verdict: "NO_TERMS", why: negativeWhy });
    }
    // scripts/prize-dispatch.mjs's selection, on the audited list: the line passes now (--why prints it), and failed in tick 56.
    const sel = selectDispatchLines(readFileSync(FIXTURE, "utf8"), v);
    expect(sel.passed.filter((p: { site: string }) => p.site === SITE)).toEqual([
      { url: PRIZE_LINE.url, slug: PRIZE_LINE.slug, lineNumber: PRIZE_LINE.n, site: SITE, verdict: "NO_TERMS_ROBOTS_OK" },
    ]);
    expect(describeSelection(sel, { why: true })).toContain(`  pass  ${PRIZE_LINE.slug}  ${SITE} NO_TERMS_ROBOTS_OK`);
    const sel56 = selectDispatchLines(readFileSync(FIXTURE, "utf8"), t56);
    expect(sel56.passed.filter((p: { site: string }) => p.site === SITE)).toEqual([]);
    expect(sel56.failures.filter((x: { site: string }) => x.site === SITE).map((x: { why: string }) => x.why)).toEqual([negativeWhy]);
    // urls.txt: no rules page of the site; the probe active in its tick-56 form; the two read terms lines paused as read,
    // their comments naming the verdict as it is; nothing stale and nothing the gate would pause.
    const text = readFileSync(URLS, "utf8");
    expect(text).not.toContain(PRIZE_LINE.url);
    expect(active().filter((l) => siteOfUrl(l.url) === SITE).map((l) => [l.url, l.slug])).toEqual([[EURO_PROBE.url, EURO_PROBE.slug]]);
    expect(
      pausedLines()
        .filter((p) => siteOfUrl(p.url) === SITE)
        .map((p) => p.line),
    ).toEqual([
      `${TERMS_LINES[SITE].state} — https://www.eurocontrol.int/info/privacy-and-website-terms-use\tterms-eurocontrol`,
      `${READ2[SITE].paused} — ${READ2[SITE].url}\t${READ2[SITE].slug}`,
    ]);
    for (const p of pausedLines().filter((x) => siteOfUrl(x.url) === SITE)) expect(p.line, p.slug).toContain(`): ${SITE} is NO_TERMS_ROBOTS_OK in `);
    expect(syncPauseComments(text, v, { today: "6.10.2026" }).changes).toEqual([]);
    expect(applyVerdicts(text, v).paused).toEqual([]);
  });

  it("records it: ZERO-TESTS row 265's mark, the audit note's dated paragraph, the render groups and the counts as the files hold them", () => {
    const v = verdicts();
    const rows = zeroRows();
    // Row 265 gains the tick-57 mark, last; rows 242 and 267 say nothing of tick 57.
    expect(rows.get(EURO_PROBE.row)?.row.endsWith(` **ACTIVE again 6.10 (tick 56): eurocontrol.int is NO_TERMS, exhaustive-negative, again: its Disclaimers page (row 267) holds no site terms; scripts/robots-verdict.mjs was run on the capture dry, and applying it is the main thread's call, once R1's grep of the organisations' repository contents is run at github grade or ruled immaterial (tick-56 review), and with --urls research/measurements/ai-allowed-events.urls.txt.** ${EURO_PROBE_MARK57} |`)).toBe(true);
    for (const n of [242, 267]) expect(rows.get(n)?.row, `row ${n}`).not.toContain("tick 57");
    expect(pinnedLines(EURO_PROBE_MARK57)).toEqual([PRIZE_LINE.n]);
    // The audit note's last paragraph: the ruling, the run, the repoint with the frozen copy's own values, the gate and the
    // counts as the files give them.
    const para = paragraph();
    const audit = readFileSync(AUDIT, "utf8");
    // The last paragraph of the second round: the third round (tick 57, later) follows it.
    expect(audit.includes(`\n${para}\n\n## Terms read, third round (6.10.2026, tick 57)\n`)).toBe(true);
    const meta = frozenCapture(`${EU_ROBOTS}.txt`).meta;
    // The counts the paragraph states are those after eurocontrol.int's verdict (tick57e()); later in tick 57, with
    // agenthon.net's, they moved, and the dated pointer after them says to what (computed from the verdicts as they are).
    const t57e = tick57e(v);
    const okNow = Object.keys(AUDITED).filter((s) => isRobotsOkVerdict(t57e[s])).sort();
    const ok56 = Object.keys(AUDITED).filter((s) => isRobotsOkVerdict(tick56(v)[s])).sort();
    const okLater = Object.keys(AUDITED).filter((s) => isRobotsOkVerdict(v[s])).sort();
    expect([okNow, ok56, okLater]).toEqual([ROBOTS_OK_TICK57E, [...ROBOTS_OK].sort(), ROBOTS_OK_NOW]);
    const clearedNow = audited().filter((e) => okNow.includes(siteOfUrl(e.url))).length;
    const clearedLater = audited().filter((e) => okLater.includes(siteOfUrl(e.url))).length;
    const open = audited().filter((e) => termsGate(e.url, e.slug, t57e).ok).length;
    const open56 = audited().filter((e) => termsGate(e.url, e.slug, tick56(v)).ok).length;
    const openLater = audited().filter((e) => termsGate(e.url, e.slug, v).ok).length;
    // The prize page: "has not been fetched" until the tick-57 dispatch fetched it (render commit 23e17e7); read on 6.10, it
    // is EUROCONTROL's landing page, not the rules, and the row was re-graded BLOCKED in tick 58, the rules host being
    // ansperformance.eu (tick-58 fix of the clause). Its fetch, status, title line and the rules host's verdict are read here.
    const prize = JSON.parse(readFileSync(`research/rendered/${PRIZE_LINE.slug}.meta.json`, "utf8"));
    const prizeText = readFileSync(`research/rendered/${PRIZE_LINE.slug}.txt`, "utf8");
    expect([prize.url, prize.status, prize.error, prize.fetchedAt.slice(0, 16)]).toEqual([PRIZE_LINE.url, 200, null, "2026-10-06T20:02"]);
    expect(prizeText.split("\n")[0]).toBe("Air navigation services performance review | EUROCONTROL");
    expect(prizeText.split("\n").length - 1).toBe(828);
    // Pinned whole, every count and capture fact computed (tick-57 review: three false edits of its unpinned prose, the page
    // "fetched", copying "allowed" and the group move reversed, got through a list of phrases).
    expect(para).toBe(
      `**eurocontrol.int's robots verdict (6.10.2026, tick 57).** The main thread ruled on the step of R1 that was not on the record (\`logs/CHANNEL_LOOP.md\` §9, "Queued 6.10 (tick 56)" item 2): ` +
        "the grep of the organisations' repository contents was tried on 6.10 (tick 56) with `gh api orgs/<org>/repos` for euctrl-pru and for eurocontrol, and both answered HTTP 403, since this session is bound to its configured repositories; so the step is unreachable from this session, as GitHub-wide code search is in R1 itself, the tick-45 search of the organisations' GitHub presence stands as the search of record, and the step is waived for eurocontrol.int. " +
        "The note's sentence that the ruling neither ran the step nor waived it was replaced by that ruling, written through `serializeVerdicts`. " +
        "Then `node scripts/robots-verdict.mjs eurocontrol.int --urls research/measurements/ai-allowed-events.urls.txt --apply` (exit 0) set NO_TERMS_ROBOTS_OK: " +
        `the one queued page, ${PRIZE_LINE.url} (the prize line ${PRIZE_LINE.slug}), is allowed, no rule matching it, by the probe's capture of the 12:05 weekly run of 6.10; ` +
        `the note and the copying field ("${v[SITE].copying}") are kept, and the NO_TERMS source follows "${BEFORE}". ` +
        "The script wrote the live capture's path into the source, and the source was then repointed to the frozen copy, " +
        `\`${EU_ROBOTS}.txt\` (as ${meta.frozen!.commit} stored it: fetched ${meta.fetchedAt}, sha256 ${meta.sha256!.slice(0, 12)}, the live capture's bytes), exactly as the script's \`judgeSite\` writes it when the capture it reads is that copy, ` +
        "so the weekly run, which rewrites the live capture whenever its body changes, never moves what the verdict rests on. " +
        "The rules URL passes `termsGate` now, and `scripts/prize-dispatch.mjs --skip-captured --why` lists the prize line as passing, open to dispatch; " +
        `the tick-57 dispatch fetched the page on 6.10 at ${prize.fetchedAt.slice(11, 16)} UTC (\`${PRIZE_LINE.slug}\`, fetched ${prize.fetchedAt}, status ${prize.status}), ` +
        `and it was read on 6.10: EUROCONTROL's ${prizeText.split(" | ")[0]} landing page, not the rules, so the row was re-graded BLOCKED on 6.10 (tick 58), ` +
        `its rules pages sitting on ansperformance.eu, which is ${v["ansperformance.eu"].verdict}. ` +
        "The two terms lines stay paused as read (`scripts/urls-pause-comments.mjs --fix` rewrote their comments' verdict word to NO_TERMS_ROBOTS_OK), the probe stays on the weekly watch, and ZERO-TESTS row 265 says VERDICT SET 6.10 (tick 57). " +
        `Of the audited sites, ${okNow.length} are NO_TERMS_ROBOTS_OK now (the ${ok56.length} of tick 55 and eurocontrol.int) and their ${clearedNow} rules URLs pass the gate, which admits ${open} of the 101 audited rules URLs (${open56} in ticks 55 and 56; since agenthon.net's robots verdict, later in tick 57, ${okLater.length} sites, ${clearedLater} rules URLs and ${openLater}, "Terms read, third round" below); ` +
        'in the render groups above eurocontrol.int moves from "Robots probe captured, robots verdict not yet run", empty since, to "Now, on robots.txt". ' +
        "ansperformance.eu's note names eurocontrol.int's entry as it is now.",
    );
    // (The copying field it quotes is the entry's own, and the source's tail after BEFORE is tick 56's source: the test
    // above. The rules URL under "Now, on robots.txt" and the probe group empty: below.)
    expect([okNow.length, clearedNow, open, open56, okLater.length, clearedLater, openLater]).toEqual([17, 20, 34, 33, 18, 21, 35]);
    expect(rangeCites(para)).toEqual([]);
    expect(ADDRESS.test(para)).toBe(false);
    // The render groups: eurocontrol.int's rules URL listed under "Now, on robots.txt", the sixth group empty, its bullet
    // pinned whole, and the served/404 count of the robots group as the sources hold it.
    const lines = audit.split("\n");
    expect(lines).toContain(`- \`${PRIZE_LINE.url}\` (${SITE}; ai-allowed-events.urls.txt@${PIN}:${PRIZE_LINE.n})`);
    const g2 = lines.find((l) => l.startsWith("- **Now, on robots.txt "))!;
    // (Since agenthon.net's robots verdict, later in tick 57, the heading counts 21 URLs on 18 sites, and the tick-57 count
    // stands beside it, dated: "tick 57, third round" below pins it.)
    expect(g2.startsWith(
      '- **Now, on robots.txt (6.10, ticks 54, 55 and 57): 21 URLs on 18 sites** (5.10: 0 URLs on 0 sites; 6.10, tick 54: 20 URLs on 17 sites, until agenthon.net went back to TERMS_PENDING in tick 55, "Terms links found after the verdicts" below; 6.10, ticks 55 and 56: 19 URLs on 16 sites, until eurocontrol.int\'s robots verdict of tick 57, "Terms read, second round" below;',
    )).toBe(true);
    const kinds = okNow.map((s) => citedCapture(t57e[s].source)!.kind);
    expect([kinds.filter((k) => k === "file").length, kinds.filter((k) => k === "absent").length]).toEqual([11, 6]);
    const kindsLater = okLater.map((s) => citedCapture(v[s].source)!.kind);
    expect([kindsLater.filter((k) => k === "file").length, kindsLater.filter((k) => k === "absent").length]).toEqual([12, 6]);
    expect(g2).toContain(
      "Each site's robots.txt capture is a robots.txt the site served (twelve since agenthon.net's robots verdict later in tick 57, with eurocontrol.int's, which the 12:05 weekly run of 6.10 captured, and agenthon.net's of the 6.10 weekly render; eleven after eurocontrol.int's robots verdict of tick 57, before agenthon.net's; ten in ticks 55 and 56; eleven with agenthon.net in tick 54) or a 404 (six)",
    );
    const g6 = lines.find((l) => l.startsWith("- **Robots probe captured, robots verdict not yet run "))!;
    expect(g6).toBe(
      '- **Robots probe captured, robots verdict not yet run (row 265; queued 6.10, tick 54; paused in tick 55; active again in tick 56; judged in tick 57): 0 URLs on 0 sites** since tick 57 (6.10, tick 56: 1 URL on 1 site, eurocontrol.int\'s rules URL; 6.10, tick 55: 0 URLs on 0 sites, when the Disclaimers link in its footer made it TERMS_PENDING again and its probe was paused, "Terms link found after the verdict" above; 6.10, tick 54: 1 URL on 1 site, headed "Robots probe queued for the next weekly run", once its one linked document was read as a privacy notice with no site terms, "Terms read" below; 5.10: 0 URLs on 0 sites, eurocontrol.int TERMS_PENDING then). In tick 56 the group held eurocontrol.int: its Disclaimers page, read then, holds no site terms, so it was NO_TERMS, exhaustive-negative, again (ruled on R1\'s test: the recorded search, and both documents its footer links read, with R1\'s grep of the organisations\' repository contents not on the record; "Terms read, second round" below), and its robots.txt probe (https://www.eurocontrol.int/robots.txt), active again in the form it had before tick 55 paused it, had been captured by the 12:05 weekly run of 6.10, a robots.txt the site served; `scripts/robots-verdict.mjs` was run on it dry in tick 56 (it would set NO_TERMS_ROBOTS_OK), applying it was the main thread\'s call once that grep was run or ruled immaterial, and its rules URL was refused until then. In tick 57 the main thread ruled the grep unreachable from this session and waived the step for the site, and the script was applied: eurocontrol.int is NO_TERMS_ROBOTS_OK, and its rules URL is in "Now, on robots.txt" above.',
    );
    expect(audit).toContain(
      "its one probe had been captured by the 12:05 weekly run of 6.10, and in tick 56 the group held an exhaustive-negative site whose robots.txt was captured and not yet judged; since tick 57, when that site's robots verdict was applied, it holds none.",
    );
    expect(UNJUDGED_PROBES).toEqual([]);
  });
});

/**
 * Tick 57 (6.10.2026), later: agenthon.net's third terms read. The tick-57 render dispatch (23e17e7) captured the two
 * documents tick 56 queued, the Data & Software Licensing Policy (AH26-POL-04) and the Privacy Notice (AH26-POL-03); both
 * were frozen (terms-agenthon-licensing-2026-10-06, terms-agenthon-privacy-2026-10-06) and read in full by one Opus reader
 * and one adversarial Opus verifier each: NO_TERMS for each document, copying unread. The main thread ruled the site
 * NO_TERMS, exhaustive-negative: every terms-like document of its four-document policy set is read on a frozen copy and
 * none is site-use terms, and the Official Competition Rules (/rules/) are the event's own rules, the prize instrument's
 * object, read under the instrument once its line is dispatched. copying stays unread (decision 4(2)). The two terms lines
 * are paused as read; the robots.txt probe (ZERO-TESTS row 247) is active again in its tick-45 form; on the main thread's
 * word scripts/robots-verdict.mjs, run dry and then applied with --urls research/measurements/ai-allowed-events.urls.txt on
 * the 6.10 capture, set NO_TERMS_ROBOTS_OK, and the source it wrote was repointed to the frozen copy
 * robots-agenthon-2026-10-06. The fixture holds agenthon.net's entry at 23e17e7; tick57e() puts it back for the blocks above.
 */
describe("tick 57, third round: agenthon.net's Licensing Policy and Privacy Notice read, NO_TERMS, exhaustive-negative, then NO_TERMS_ROBOTS_OK", () => {
  const SITE = "agenthon.net";
  const fixture = () => JSON.parse(readFileSync(AGENTHON57_FIXTURE, "utf8")) as Record<string, Entry>;
  const metaOf = (copy: string) => JSON.parse(readFileSync(`${copy}.meta.json`, "utf8")) as Capture["meta"];
  const AG_ROBOTS = "research/rendered/robots-agenthon-2026-10-06";
  const PROBE = LINKS_FOUND[SITE].probe;
  /** The rules line the verdict opens: the fixture's line 173, the home page, the site's one rules URL. */
  const PRIZE_LINE = { n: 173, url: "https://www.agenthon.net/?ref=mlcontests", slug: "prize-www-agenthon-net-ref-mlcontests-7f4f65c9" };
  const KIND = /^(refusal-type|exhaustive-negative|unanswered|shell|deferred to [a-z0-9.-]+)\b/;
  /** The NO_TERMS source the reading wrote: after the robots verdict's "; NO_TERMS before: ", before "; TERMS_PENDING before: ". */
  const readSource = (e: Entry) => {
    const after = e.source.slice(e.source.indexOf(BEFORE) + BEFORE.length);
    return after.slice(0, after.indexOf(TERMS_BEFORE));
  };
  /** The main thread's ruling, as the note opens with it. */
  const RULING =
    "exhaustive-negative: ruled by the main thread (tick 57): of the site's four-document policy set (the Official Competition Rules, Terms of Participation, Privacy Notice and Data & Software Licensing Policy, research/rendered/terms-agenthon-2026-10-06.txt:28-31), every terms-like document is now read on a frozen copy, the Terms of Participation on 6.10 (tick 56), the Data & Software Licensing Policy and the Privacy Notice on 6.10 (tick 57), and none is site-use terms; the Official Competition Rules (/rules/) are the event's own rules, the prize instrument's object under BOARD-LOOP §13, not a site-terms document, and are read under the instrument once its line is dispatched, as the Terms of Participation were treated on 6.10 (tick 56).";
  const COPYING = "copying stays unread: no site terms were read, so nothing was read that bars or allows copying (decision 4(2) of ruling 6.10 row 21).";
  /** ZERO-TESTS row 247's two tick-57 marks, last in its fourth cell. */
  const PROBE_MARKS57 =
    "**ACTIVE again 6.10 (tick 57): agenthon.net is NO_TERMS, exhaustive-negative: every terms-like document of its policy set is read (rows 266, 268 and 269) and none is site-use terms, so the probe is active again in the form it had before tick 55 paused it.** **VERDICT SET 6.10 (tick 57): scripts/robots-verdict.mjs, applied on the main thread's word with --urls research/measurements/ai-allowed-events.urls.txt, set NO_TERMS_ROBOTS_OK on this probe's capture of the 6.10 weekly render, its source naming the frozen copy research/rendered/robots-agenthon-2026-10-06.txt: the one queued rules path, the home page (ai-allowed-events.urls.txt@548be52:173), is allowed (Allow: /), and its prize line passes the terms gate, captured on 6.10 already; the probe stays on the weekly watch.**";
  /**
   * Every line range the tick-57 texts cite (the entry's source and note, the ZERO-TESTS marks, the audit note's third
   * round), with words the range holds. A cited range must be one of these, exactly, and each must be cited somewhere.
   */
  const CITED3: { file: string; from: number; to: number; words: string[] }[] = [
  { file: `${AGENTHON_COPY}.html`, from: 2581, to: 2581, words: ["<a href=\"/rules/\">Rules</a>"] },
  { file: `${AGENTHON_COPY}.txt`, from: 263, to: 263, words: ["Development leaderboards on agenthon.net are public and"] },
  { file: `${AGENTHON_COPY}.txt`, from: 281, to: 285, words: ["T1 Coding: teams 1–25 of 73","Score"] },
  { file: `${AG_TERMS}.txt`, from: 149, to: 149, words: ["recordings that may be published on Agenthon’s websites"] },
  { file: `${AG_TERMS}.txt`, from: 24, to: 26, words: ["Terms of Participation","Version 2026-08-17 · Agenthon 2026 — NeurIPS 2026"] },
  { file: `${AG_TERMS}.txt`, from: 28, to: 31, words: ["Policy set: Official Competition Rules ·","Data & Software Licensing Policy"] },
  { file: `${AG_TERMS}.txt`, from: 33, to: 33, words: ["These Terms govern the legal relationship between"] },
  { file: `${AG_TERMS}.txt`, from: 44, to: 46, words: ["These Terms of Participation (“Terms”) apply to Agenthon","submitting, you agree to these Terms, the"] },
  { file: `${AG_TERMS}.txt`, from: 52, to: 53, words: ["The Competition is organized by the Society of Quantitative","Stony Brook University (the “Organizers”), subject to"] },
  { file: `${AG_LICENSING}.txt`, from: 1, to: 1, words: ["Agenthon 2026 — Data & Software Licensing Policy"] },
  { file: `${AG_LICENSING}.txt`, from: 101, to: 107, words: ["Each dataset or corpus should identify its source,","retained beyond the applicable terms."] },
  { file: `${AG_LICENSING}.txt`, from: 105, to: 107, words: ["Open data licenses govern open reuse. Competition-only or","retained beyond the applicable terms."] },
  { file: `${AG_LICENSING}.txt`, from: 113, to: 130, words: ["4. Private test and evaluation materials","benchmark maintenance, subject to applicable rights and"] },
  { file: `${AG_LICENSING}.txt`, from: 119, to: 119, words: ["Do not access or extract private-test materials outside the"] },
  { file: `${AG_LICENSING}.txt`, from: 119, to: 120, words: ["Do not access or extract private-test materials outside the","interface."] },
  { file: `${AG_LICENSING}.txt`, from: 119, to: 123, words: ["Do not access or extract private-test materials outside the","content inadvertently exposed through an error."] },
  { file: `${AG_LICENSING}.txt`, from: 122, to: 122, words: ["Do not retain, reproduce, publish, redistribute,"] },
  { file: `${AG_LICENSING}.txt`, from: 122, to: 123, words: ["Do not retain, reproduce, publish, redistribute,","content inadvertently exposed through an error."] },
  { file: `${AG_LICENSING}.txt`, from: 125, to: 125, words: ["Stop accessing and promptly report suspected exposure or"] },
  { file: `${AG_LICENSING}.txt`, from: 134, to: 135, words: ["Open-source libraries, pretrained models, public research","used only when permitted by the track and underlying"] },
  { file: `${AG_LICENSING}.txt`, from: 140, to: 140, words: ["A container must not redistribute a component contrary to"] },
  { file: `${AG_LICENSING}.txt`, from: 144, to: 146, words: ["Commercial or proprietary tools and services are allowed","requirements."] },
  { file: `${AG_LICENSING}.txt`, from: 148, to: 149, words: ["External runtime network access is prohibited unless the","provides it."] },
  { file: `${AG_LICENSING}.txt`, from: 153, to: 154, words: ["Public external data may be used only if the track permits","access, and the data comply with any cutoff or embargo."] },
  { file: `${AG_LICENSING}.txt`, from: 156, to: 158, words: ["Private employer or customer data, purchased data with","access are prohibited unless expressly authorized with"] },
  { file: `${AG_LICENSING}.txt`, from: 180, to: 181, words: ["commercial tools, APIs, hosted services, or proprietary","or required for reproduction;"] },
  { file: `${AG_LICENSING}.txt`, from: 186, to: 187, words: ["AI-agent or language-model tools used materially where","NeurIPS policy; and"] },
  { file: `${AG_LICENSING}.txt`, from: 191, to: 199, words: ["8. Participant submissions — private by default","the winner-release rule applies to a separate"] },
  { file: `${AG_LICENSING}.txt`, from: 201, to: 242, words: ["9. Three-stage reproducibility and winner release","ownership of the private submission."] },
  { file: `${AG_LICENSING}.txt`, from: 24, to: 24, words: ["Data & Software Licensing Policy"] },
  { file: `${AG_LICENSING}.txt`, from: 24, to: 26, words: ["Data & Software Licensing Policy","Version 2026-08-17 · Agenthon 2026 — NeurIPS 2026"] },
  { file: `${AG_LICENSING}.txt`, from: 259, to: 261, words: ["The Organizers may publish leaderboard data,","Official Rules and Terms ."] },
  { file: `${AG_LICENSING}.txt`, from: 26, to: 26, words: ["Version 2026-08-17 · Agenthon 2026 — NeurIPS 2026"] },
  { file: `${AG_LICENSING}.txt`, from: 262, to: 263, words: ["Publication of a participant-authored paper or non-public","permission."] },
  { file: `${AG_LICENSING}.txt`, from: 265, to: 266, words: ["Dataset embargoes, publication restrictions, citation","approvals continue after the Competition."] },
  { file: `${AG_LICENSING}.txt`, from: 270, to: 270, words: ["Do not include personal data, credentials, confidential"] },
  { file: `${AG_LICENSING}.txt`, from: 28, to: 28, words: ["Policy set: Official Competition Rules ·"] },
  { file: `${AG_LICENSING}.txt`, from: 28, to: 31, words: ["Policy set: Official Competition Rules ·","Data & Software Licensing Policy"] },
  { file: `${AG_LICENSING}.txt`, from: 280, to: 282, words: ["Neither participation nor this Policy grants patent,","are granted by implication or estoppel."] },
  { file: `${AG_LICENSING}.txt`, from: 286, to: 289, words: ["The Organizers may update this Policy to clarify resource","resource-specific license or signed data-use agreement"] },
  { file: `${AG_LICENSING}.txt`, from: 307, to: 307, words: ["Rules"] },
  { file: `${AG_LICENSING}.txt`, from: 307, to: 310, words: ["Rules","Licensing"] },
  { file: `${AG_LICENSING}.txt`, from: 313, to: 313, words: ["Copyright &copy; 2026: agenthon.net. All rights reserved."] },
  { file: `${AG_LICENSING}.txt`, from: 33, to: 35, words: ["This Policy separates the terms that apply to","reproducibility releases."] },
  { file: `${AG_LICENSING}.txt`, from: 43, to: 43, words: ["This Policy explains the licensing and use restrictions for"] },
  { file: `${AG_LICENSING}.txt`, from: 53, to: 90, words: ["Resource type","historical record."] },
  { file: `${AG_LICENSING}.txt`, from: 58, to: 59, words: ["Governed by the LICENSE file and notices distributed with","license is stated, no open-source permission should be"] },
  { file: `${AG_LICENSING}.txt`, from: 63, to: 64, words: ["Governed by the dataset-specific license or data-use notice","or on the Competition Site."] },
  { file: `${AG_LICENSING}.txt`, from: 64, to: 64, words: ["or on the Competition Site."] },
  { file: `${AG_LICENSING}.txt`, from: 66, to: 69, words: ["Third-party data, models, software, and APIs","own."] },
  { file: `${AG_LICENSING}.txt`, from: 71, to: 74, words: ["Private test and evaluation materials","redistribute, reverse engineer, or publish."] },
  { file: `${AG_LICENSING}.txt`, from: 73, to: 74, words: ["Confidential and competition-restricted; no general right","redistribute, reverse engineer, or publish."] },
  { file: `${AG_LICENSING}.txt`, from: 76, to: 79, words: ["Participant submissions","license in the Terms ."] },
  { file: `${AG_LICENSING}.txt`, from: 81, to: 85, words: ["Confirmed-winner reproducibility package","automatically become public."] },
  { file: `${AG_LICENSING}.txt`, from: 94, to: 96, words: ["Each public repository should contain a clear LICENSE file","does not replace it."] },
  { file: `${AG_PRIVACY}.txt`, from: 1, to: 1, words: ["Agenthon 2026 — Privacy Notice"] },
  { file: `${AG_PRIVACY}.txt`, from: 103, to: 104, words: ["Automatically from the Competition Site, platform, sandbox,","needed to operate and secure the Competition."] },
  { file: `${AG_PRIVACY}.txt`, from: 173, to: 174, words: ["Public leaderboards may display team name, rank, total or","diagnostics."] },
  { file: `${AG_PRIVACY}.txt`, from: 173, to: 177, words: ["Public leaderboards may display team name, rank, total or","winners, member names, affiliations, prize information, and"] },
  { file: `${AG_PRIVACY}.txt`, from: 176, to: 177, words: ["The permanent record may include final team names,","winners, member names, affiliations, prize information, and"] },
  { file: `${AG_PRIVACY}.txt`, from: 196, to: 197, words: ["The Organizers do not sell personal data or non-public","cross-context behavioral advertising, and do not use them"] },
  { file: `${AG_PRIVACY}.txt`, from: 198, to: 199, words: ["Automated systems may process submission content only to","Competition."] },
  { file: `${AG_PRIVACY}.txt`, from: 24, to: 26, words: ["Privacy Notice","Version 2026-08-17 · Agenthon 2026 — NeurIPS 2026"] },
  { file: `${AG_PRIVACY}.txt`, from: 251, to: 251, words: ["access where practical, logging, security review, and data"] },
  { file: `${AG_PRIVACY}.txt`, from: 26, to: 26, words: ["Version 2026-08-17 · Agenthon 2026 — NeurIPS 2026"] },
  { file: `${AG_PRIVACY}.txt`, from: 283, to: 283, words: ["NeurIPS privacy policy and"] },
  { file: `${AG_PRIVACY}.txt`, from: 289, to: 292, words: ["The Organizers may update this Notice for changes in the","reasonably practicable."] },
  { file: `${AG_PRIVACY}.txt`, from: 310, to: 313, words: ["Rules","Licensing"] },
  { file: `${AG_PRIVACY}.txt`, from: 316, to: 316, words: ["Copyright &copy; 2026: agenthon.net. All rights reserved."] },
  { file: `${AG_PRIVACY}.txt`, from: 33, to: 35, words: ["This Notice explains what personal data Agenthon processes,","rights may apply."] },
  { file: `${AG_PRIVACY}.txt`, from: 37, to: 39, words: ["Data-use boundary. Agenthon does not sell participant","participant personal data to train general-purpose AI"] },
  { file: `${AG_PRIVACY}.txt`, from: 43, to: 45, words: ["This Privacy Notice applies to personal data processed for","review, prizes, verification, event participation, and"] },
  { file: `${AG_PRIVACY}.txt`, from: 47, to: 49, words: ["Agenthon 2026 is organized by the Society of Quantitative","and any allocation of privacy responsibilities required by"] },
  { file: `${AG_PRIVACY}.txt`, from: 74, to: 74, words: ["IP address, login/session data, timestamps, device/browser"] },
  ];
  const section = () => {
    const audit = readFileSync(AUDIT, "utf8");
    return audit.slice(audit.indexOf("## Terms read, third round (6.10.2026, tick 57)"));
  };
  const paragraph = (opens: string) => section().split("\n").find((l) => l.startsWith(opens))!;

  it("keeps agenthon.net's entry before the reading as a fixture, as terms-verdicts.json held it at 23e17e7", () => {
    expect(createHash("sha256").update(readFileSync(AGENTHON57_FIXTURE)).digest("hex")).toBe(AGENTHON57_FIXTURE_SHA256);
    expect(Object.keys(fixture())).toEqual([SITE]);
    // What the blocks above hold for the site: TERMS_PENDING, its note opening "terms unread:", tick 56's source.
    const e = fixture()[SITE];
    expect([e.verdict, e.checked, e.copying]).toEqual(["TERMS_PENDING", "2026-10-06", "unread"]);
    expect(Object.keys(e)).toEqual(["verdict", "source", "checked", "note", "copying"]);
    expect(e.note!.startsWith("terms unread: ")).toBe(true);
    expect(e.source.startsWith(`${QUEUED2[0].url} and ${QUEUED2[1].url} (`)).toBe(true);
    // Where 23e17e7 is reachable, the fixture is byte for byte its entry; a shallow checkout has the pinned sha256 only.
    let base: string | null = null;
    try {
      base = execFileSync("git", ["show", `${AGENTHON57_BASE}:${VERDICTS}`], { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" });
    } catch {
      base = null;
    }
    if (base === null) return;
    expect(e).toEqual((JSON.parse(base).sites as Record<string, Entry>)[SITE]);
  });

  it("freezes both documents before citing them, as 23e17e7 stored them, and no urls.txt line names a frozen copy", () => {
    const manifest = readFileSync("research/rendered/FROZEN.sha256", "utf8");
    const listed: Set<string> = listedNames(readFileSync(URLS, "utf8"));
    for (const r of READ3) {
      const slug = r.copy.replace(/^research\/rendered\//, "");
      const meta = metaOf(r.copy);
      expect([meta.slug, meta.url, meta.status, meta.fetchedAt], slug).toEqual([slug, r.url, 200, r.fetchedAt]);
      expect(meta.frozen?.from, slug).toBe(`research/rendered/${r.slug}.meta.json`);
      expect([meta.frozen?.commit, meta.frozen?.on], slug).toEqual([AGENTHON57_BASE, FROZEN_ON]);
      expect(meta.frozen?.why, slug).toContain("tick 57");
      const body = readFileSync(meta.bodyPath!);
      expect(createHash("sha256").update(body).digest("hex"), slug).toBe(meta.sha256);
      expect(body.length, slug).toBe(meta.byteLength);
      for (const ext of ["html", "meta.json", "txt"]) expect(manifest, `${slug}.${ext}`).toContain(`  ${slug}.${ext}\n`);
      expect(listed.has(slug), slug).toBe(false);
      expect(classifyCapture(readCapture(slug)).kind, slug).toBe("ok");
      // The page read: its title (line 1) and its version and document id (line 26).
      const txt = readFileSync(`${r.copy}.txt`, "utf8").split("\n");
      expect(txt[0], slug).toBe(r.title);
      expect(txt[25], slug).toBe(`Version 2026-08-17 · Agenthon 2026 — NeurIPS 2026 Competition Track · ${r.id}`);
    }
  });

  it("sets NO_TERMS, exhaustive-negative, on the ruling: the note opens with it, holds both findings, the open items and the copying sentence", () => {
    const v = verdicts();
    const e = v[SITE];
    const note = e.note!;
    expect(note.startsWith(`${RULING} `)).toBe(true);
    expect(note.split(RULING)).toHaveLength(2);
    expect(KIND.exec(note)?.[1]).toBe("exhaustive-negative");
    expect(note.split(COPYING)).toHaveLength(2);
    expect(e.copying).toBe("unread");
    expect(e.checked).toBe("2026-10-06");
    for (const words of [
      // The Terms of Participation (tick 56): a participant agreement.
      'The Terms of Participation (version 2026-08-17, AH26-POL-02, :24-26) are a participant agreement: they govern "the legal relationship between participants and the Organizers" (:33)',
      // The Licensing Policy.
      `The Data & Software Licensing Policy (${AG_LICENSING}.txt, version 2026-08-17, AH26-POL-04, :24-26) licenses competition resources`,
      'its scope is "resources used in Agenthon 2026" (:43), bounded by its title and by :33-35 to data and software, and it does not license the site\'s pages to visitors',
      "No clause of it bears on automated access to the public pages, copying or storing them, or their commercial use",
      "its access and copying bars (:73-74, :119-123, :125) reach only private evaluation materials",
      'it holds no non-commercial licence, :280-282 grants no implied rights, and the footer\'s "All rights reserved" (:313) is a bare notice.',
      // The Privacy Notice.
      `The Privacy Notice (${AG_PRIVACY}.txt, version 2026-08-17, AH26-POL-03, :24-26) governs the Organizers' processing of personal data for the competition (:43-45)`,
      "so the runner's IP address and timestamps may be logged under it; it sets no condition on a visitor's access to, or copying of, the home or /rules/ pages",
      'its only copy-related text is the footer\'s bare "All rights reserved" (:316).',
      // Both, and the version they hold for.
      "Neither names a separate website-terms document",
      "Each finding holds for version 2026-08-17 only",
      // The open items.
      "Open: whether SQA's or Stony Brook University's own site terms reach agenthon.net (",
      "as asked of virtualembryo.ai on 6.10; and the public leaderboards carry participants' names (",
      "which render-watch does not mask: it masks email addresses only.",
      // The lines and the robots verdict the word allowed.
      "The two documents' terms- lines (ZERO-TESTS rows 268 and 269) are paused as read, as the Terms line (row 266) is.",
      `The robots.txt probe (${PROBE.url}, ZERO-TESTS row ${PROBE.row}), paused in tick 55, is active again, in the form it had before;`,
      "applied only if the capture it judges is that 6.10 capture and the verdict it would set is NO_TERMS_ROBOTS_OK.",
    ]) {
      expect(note, words).toContain(words);
    }
    expect(note).not.toMatch(/terms unread|TERMS_PENDING|stays paused/);
    expect(pinnedLines(note)).toEqual([PRIZE_LINE.n]);
    expect(ADDRESS.test(note) || ADDRESS.test(e.source)).toBe(false);
    // The notes with no kind word: agenthon.net's left the list with this reading.
    const kindless = (s: Record<string, Entry>) =>
      Object.keys(s).filter((x) => ["NO_TERMS", "TERMS_PENDING"].includes(s[x].verdict) && !KIND.test(s[x].note ?? "")).sort();
    // As tick 57 left the notes: un.org's TERMS_PENDING entry put back (its terms read in tick 60, "tick 60" below).
    expect(kindless(un60Before(v))).toHaveLength(23);
    expect(kindless(tick57e(un60Before(v)))).toEqual([...kindless(un60Before(v)), SITE].sort());
  });

  it("names both frozen copies and the audit section in the source, tick 56's source kept after it, then the robots verdict's in front", () => {
    const v = verdicts();
    const e = v[SITE];
    const src = readSource(e);
    for (const r of READ3) {
      const meta = metaOf(r.copy);
      expect(src, r.slug).toContain(
        `${r.copy}.txt (page title "${r.title}" at :1, version 2026-08-17, ${r.id}, at :26, `,
      );
      expect(src, r.slug).toContain(`the capture is of ${meta.url}, fetched ${meta.fetchedAt} by the tick-57 dispatch of 6.10, frozen as ${meta.frozen!.commit} stored it)`);
    }
    expect(src.startsWith(`${AG_LICENSING}.txt (`)).toBe(true);
    expect(src).toContain(
      'each read in full by one Opus reader and one adversarial Opus verifier, ruled by the main thread (tick 57; research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md, "Terms read, third round (6.10.2026, tick 57)")',
    );
    // tick 56's source, byte for byte, after the first "; TERMS_PENDING before: " that follows the reading's source.
    const after = e.source.slice(e.source.indexOf(BEFORE) + BEFORE.length);
    expect(after.slice(after.indexOf(TERMS_BEFORE) + TERMS_BEFORE.length)).toBe(tick57e(v)[SITE].source);
    // The live captures are named nowhere in the file: the frozen copies are.
    for (const r of READ3) expect(readFileSync(VERDICTS, "utf8"), r.slug).not.toContain(`research/rendered/${r.slug}.`);
  });

  it("sets NO_TERMS_ROBOTS_OK through scripts/robots-verdict.mjs, its source naming the frozen copy of the 6.10 robots.txt capture", () => {
    const file = JSON.parse(readFileSync(VERDICTS, "utf8"));
    const v = beforeRecheck(file.sites as Record<string, Entry>);
    const e = v[SITE];
    expect([e.verdict, e.checked, e.copying]).toEqual(["NO_TERMS_ROBOTS_OK", ROBOTS_CHECKED, "unread"]);
    expect(Object.keys(e)).toEqual(["verdict", "source", "checked", "note", "copying"]);
    expect(isRobotsOkVerdict(e)).toBe(true);
    expect(e.source).toContain(`(scripts/robots-verdict.mjs); ruling ${RULING_D2V}${BEFORE}`);
    const cited = citedCapture(e.source)!;
    expect(cited).toEqual({
      kind: "file",
      path: `${AG_ROBOTS}.txt`,
      slug: "robots-agenthon-2026-10-06",
      url: PROBE.url,
      fetchedAt: "2026-10-06T07:15:41.847Z",
      sha12: "54048ccab842",
      n: 1,
    });
    const capture = frozenCapture(cited.path);
    expectFrozenCopy(capture, PROBE.slug, RENDER_COMMIT, SITE);
    expect(readableCapture(capture.meta, capture.body)).toEqual({ kind: "file" });
    // Set by the script, not by hand: from the NO_TERMS entry the reading wrote (the source after "; NO_TERMS before: ",
    // the same note and copying field), on either prize list, judgeSite reading the frozen copy allows the one rules path
    // ("Allow: /") and writes exactly the committed entry.
    const before: Entry = { verdict: "NO_TERMS", source: e.source.slice(e.source.indexOf(BEFORE) + BEFORE.length), checked: e.checked, note: e.note, copying: e.copying };
    expect(isExhaustiveNegative(before)).toBe(true);
    const prior = { ...file, sites: { ...v, [SITE]: before } };
    for (const urls of [readFileSync(FIXTURE, "utf8"), readFileSync(PRIZE_URLS, "utf8")]) {
      const out = judgeSite({ site: SITE, verdicts: prior, urls, readCapture: readerOf(capture), today: ROBOTS_CHECKED });
      expect(out.changed).toBe(true);
      expect(out.checked.map((c: { url: string; allowed: boolean; rule: { allow: boolean; pattern: string } | null }) => [c.url, c.allowed, c.rule])).toEqual([
        [PRIZE_LINE.url, true, { allow: true, pattern: "/" }],
      ]);
      expect(out.verdicts.sites[SITE]).toEqual(e);
    }
    // The capture is the 6.10 weekly render's (the condition of the main thread's word), not a later one.
    expect(capture.meta.frozen!.commit).toBe(RENDER_COMMIT);
    expect(readFileSync(VERDICTS, "utf8")).not.toContain(`research/rendered/${PROBE.slug}.`);
    expect(readFileSync(URLS, "utf8")).not.toContain(cited.slug);
    // Run again on any list, the script changes nothing.
    const set = { ...file, sites: v };
    for (const urls of [readFileSync(FIXTURE, "utf8"), readFileSync(PRIZE_URLS, "utf8"), readFileSync(URLS, "utf8")]) {
      const out = judgeSite({ site: SITE, verdicts: set, urls, today: ROBOTS_CHECKED });
      expect([out.changed, out.why]).toEqual([false, `${SITE} is already NO_TERMS_ROBOTS_OK`]);
    }
    expect(serializeVerdicts(file)).toBe(readFileSync(VERDICTS, "utf8"));
  });

  it("ties every line the tick-57 texts cite to a listed range of a frozen copy and the words there", () => {
    const v = verdicts();
    const e = v[SITE];
    const key = (c: { file: string | null; from: number; to: number }) => `${c.file}:${c.from}-${c.to}`;
    const cited = new Set<string>();
    const rows = zeroRows();
    const texts: [string, string][] = [
      ["source", e.source.slice(0, e.source.indexOf(TERMS_BEFORE))],
      ["note", e.note!],
      ["section", section()],
      ["row 247", rows.get(PROBE.row)!.row.slice(rows.get(PROBE.row)!.row.indexOf("**ACTIVE again 6.10 (tick 57)"))],
      ...READ3.map((r) => [`row ${r.row}`, r.mark] as [string, string]),
    ];
    for (const [what, text] of texts) {
      for (const c of rangeCites(text)) {
        expect(c.file, `${what}: ${c.at} names no file before it`).not.toBeNull();
        expect(CITED3.map(key), `${what} cites ${key(c)}`).toContain(key(c));
        cited.add(key(c));
      }
    }
    for (const c of CITED3) {
      const lines = readFileSync(c.file, "utf8").split("\n");
      expect(c.to <= lines.length && c.from >= 1 && c.from <= c.to, key(c)).toBe(true);
      const range = lines.slice(c.from - 1, c.to).join("\n");
      for (const w of c.words) expect(range, `${key(c)} holds ${w}`).toContain(w);
      expect(cited.has(key(c)), `${key(c)} is cited`).toBe(true);
    }
    expect(ADDRESS.test(section())).toBe(false);
  });

  it("pauses both read lines as read, re-activates the probe in its tick-45 form, and leaves nothing stale", () => {
    const v = verdicts();
    const text = readFileSync(URLS, "utf8");
    const lines = text.split("\n");
    const rows = zeroRows();
    for (const r of READ3) {
      expect(listedRow(r.row).line, r.slug).toBe(`${r.paused} — ${r.url}\t${r.slug}`);
      expect(lines.filter((l) => l.includes(r.url)), r.slug).toEqual([`${r.paused} — ${r.url}\t${r.slug}`]);
      expect(rows.get(r.row)?.row, r.slug).toBe(`| ${r.row} | ${r.candidate} | ${r.url} | ${r.settle} ${r.mark} |`);
      expect(termsGate(r.url, r.slug, v), r.slug).toEqual({ ok: true, site: SITE, verdict: "NO_TERMS_ROBOTS_OK" });
    }
    // The probe: under its row's tick-45 comment, exactly the URL and slug, as it was before tick 55 paused it.
    const { comment, line } = listedRow(PROBE.row);
    expect(comment).toMatch(PROBE_COMMENT);
    expect(line).toBe(`${PROBE.url}\t${PROBE.slug}`);
    expect(lines.filter((l) => l.endsWith(`\t${PROBE.slug}`))).toEqual([`${PROBE.url}\t${PROBE.slug}`]);
    expect(rows.get(PROBE.row)?.row.endsWith(` ${PROBE_MARKS57} |`)).toBe(true);
    expect(pinnedLines(PROBE_MARKS57)).toEqual([PRIZE_LINE.n]);
    // The site's one active line is the probe; its three terms lines are paused as read, the gate passing them.
    expect(active().filter((l) => siteOfUrl(l.url) === SITE).map((l) => [l.url, l.slug])).toEqual([[PROBE.url, PROBE.slug]]);
    expect(pausedLines().filter((p) => siteOfUrl(p.url) === SITE).map((p) => p.line)).toEqual([
      `${READ2[SITE].paused} — ${READ2[SITE].url}\t${READ2[SITE].slug}`,
      ...READ3.map((r) => `${r.paused} — ${r.url}\t${r.slug}`),
    ]);
    for (const p of pausedLines().filter((x) => siteOfUrl(x.url) === SITE)) expect(p.line, p.slug).toContain(`): ${SITE} is NO_TERMS_ROBOTS_OK in `);
    const sync = syncPauseComments(text, v, { today: "6.10.2026" });
    expect(sync.changes).toEqual([]);
    expect(applyVerdicts(text, v).paused).toEqual([]);
    // No rules page of the site in urls.txt: neither the home page nor /rules/.
    expect(text).not.toContain(PRIZE_LINE.url);
    expect(text).not.toContain("https://www.agenthon.net/rules/");
  });

  it("opens the home page's line to the gate in both prize lists; it is captured already, and /rules/ is on neither list", () => {
    const v = verdicts();
    const t57e = tick57e(v);
    expect(rulesOf(SITE).map((e) => [e.n, e.url, e.slug])).toEqual([[PRIZE_LINE.n, PRIZE_LINE.url, PRIZE_LINE.slug]]);
    const live = linesOf(readFileSync(PRIZE_URLS, "utf8")).filter((x) => siteOfUrl(x.url) === SITE);
    for (const e of [...rulesOf(SITE), ...live]) {
      expect(termsGate(e.url, e.slug, v), e.url).toEqual({ ok: true, site: SITE, verdict: "NO_TERMS_ROBOTS_OK" });
      expect(termsGate(e.url, e.slug, t57e).ok, e.url).toBe(false);
    }
    for (const text of [readFileSync(FIXTURE, "utf8"), readFileSync(PRIZE_URLS, "utf8")]) expect(text).not.toContain("agenthon.net/rules");
    // scripts/prize-dispatch.mjs's selection on the audited list: the line passes (--why prints it), and with
    // --skip-captured it is left out, captured on 6.10 under the tick-54 verdict.
    const sel = selectDispatchLines(readFileSync(FIXTURE, "utf8"), v);
    expect(sel.passed.filter((p: { site: string }) => p.site === SITE)).toEqual([
      { url: PRIZE_LINE.url, slug: PRIZE_LINE.slug, lineNumber: PRIZE_LINE.n, site: SITE, verdict: "NO_TERMS_ROBOTS_OK" },
    ]);
    expect(describeSelection(sel, { why: true })).toContain(`  pass  ${PRIZE_LINE.slug}  ${SITE} NO_TERMS_ROBOTS_OK`);
    const skip = selectDispatchLines(readFileSync(FIXTURE, "utf8"), v, {
      skipCaptured: true,
      captureExists: (slug: string) => existsSync(`research/rendered/${slug}.meta.json`),
    });
    expect(skip.skipped.filter((p: { site: string }) => p.site === SITE)).toEqual([{ slug: PRIZE_LINE.slug, lineNumber: PRIZE_LINE.n, site: SITE }]);
    expect(selectDispatchLines(readFileSync(FIXTURE, "utf8"), t57e).failures.filter((x: { site: string }) => x.site === SITE)).toHaveLength(1);
  });

  it("records it in the audit note's third round: the table, the verifiers' points, the ruling, the probe paragraph and the counts paragraph, pinned whole", () => {
    const v = verdicts();
    const t57e = tick57e(v);
    const audit = readFileSync(AUDIT, "utf8");
    const text = section();
    expect(audit.indexOf("## Terms read, third round (6.10.2026, tick 57)")).toBeGreaterThan(audit.indexOf("## Terms read, second round (6.10.2026, tick 56)"));
    expect(text.indexOf("\n## ", 1)).toBe(-1);
    // The table: one row per document, seven cells, the frozen copy first in the decisive-lines cell.
    const rows = text.split("\n").filter((l) => l.startsWith("| `agenthon.net` |"));
    expect(rows).toHaveLength(2);
    rows.forEach((row, i) => {
      const cells = row.split(" | ");
      expect(cells, row.slice(0, 40)).toHaveLength(7);
      const meta = metaOf(READ3[i].copy);
      expect(cells[1]).toContain(`(${meta.url}, fetched ${meta.fetchedAt.replace(/\.\d+Z$/, "Z")}, frozen as ${meta.frozen!.commit} stored it)`);
      expect(cells[3].startsWith(`\`${READ3[i].copy}.txt:24-26\``)).toBe(true);
      expect([cells[4], cells[5], cells[6]]).toEqual(["NO_TERMS", v[SITE].copying, `The terms line (row ${READ3[i].row}) paused as read |`]);
    });
    // The verifiers' points, recorded.
    for (const words of [
      "the resource table (:53-90) is not declared exhaustive, so the scope finding rests on :24 and :33-35, not on the table",
      "four imperatives have no subject (:119, :122, :125, :270), so what keeps them off the runner is what they cover, not whom they address",
      "so the verifier would have a site-use clause there reopen the verdict (the ruling below answers that)",
      'the grep hit at :251 is "data min" (data minimization), not "stor"',
      'the "NeurIPS privacy policy" anchor (:283) points to the NeurIPS home page, not to a privacy-policy page',
      '/rules/ is not fetched, and was refused by `termsGate` while the site was TERMS_PENDING, not "queued"',
      'copying stays "unread" for good rather than being decided later',
      "render-watch masks email addresses, not names",
    ]) {
      expect(text, words).toContain(words);
    }
    // The ruling, pinned whole.
    expect(paragraph("**The ruling: NO_TERMS, exhaustive-negative.** ")).toBe(
      "**The ruling: NO_TERMS, exhaustive-negative.** The main thread ruled (tick 57): of the four-document policy set (Official Competition Rules, Terms of Participation, Privacy Notice, Data & Software Licensing Policy; `research/rendered/terms-agenthon-2026-10-06.txt:28-31`), every terms-like document is now read on a frozen copy (the Terms of Participation on 6.10, tick 56; the Licensing Policy and the Privacy Notice on 6.10, tick 57) and none is site-use terms; the Official Competition Rules (/rules/) are the event's own rules, the prize instrument's object under BOARD-LOOP §13, not a site-terms document, and are read under the instrument once its line is dispatched, as the Terms of Participation were treated on 6.10 (tick 56). " +
        `So agenthon.net is NO_TERMS, exhaustive-negative, its note opening "exhaustive-negative:", checked ${v[SITE].checked}. ` +
        `copying stays "${v[SITE].copying}" (decision 4(2) of ruling 6.10 row 21): no site terms were read, so nothing was read that bars or allows copying. ` +
        "Open, as the note records: whether SQA's or Stony Brook University's own site terms reach agenthon.net (:52-53, :149), as asked of virtualembryo.ai on 6.10; and the public leaderboards carry participants' names, which render-watch does not mask (it masks addresses only).",
    );
    // The probe paragraph, pinned whole, its capture facts from the frozen copy's meta.
    const robots = metaOf(AG_ROBOTS);
    expect(paragraph("**The probe, active again, and the robots verdict.** ")).toBe(
      `**The probe, active again, and the robots verdict.** The robots.txt probe (ZERO-TESTS row ${PROBE.row}), paused in tick 55 when the terms link reopened the site, is active again, in the form it had before: the line under the row's comment is the URL and its slug, nothing else. ` +
        `Its capture is the 6.10 weekly render's (${robots.frozen!.commit}: ${robots.status}, \`${robots.contentType}\`, \`User-agent: *\` and \`Allow: /\`), frozen in tick 54 as \`${AG_ROBOTS}.txt\`. ` +
        `On the main thread's word (tick 57), \`node scripts/robots-verdict.mjs agenthon.net --urls research/measurements/ai-allowed-events.urls.txt\` was run dry first: it read the live capture, the frozen copy's bytes (fetched ${robots.fetchedAt}, sha256 ${robots.sha256!.slice(0, 12)}), found the one queued page, ${PRIZE_LINE.url} (the prize line ${PRIZE_LINE.slug}), allowed by \`Allow: /\`, and would set NO_TERMS_ROBOTS_OK. ` +
        `Both conditions of the word held, that 6.10 capture and that verdict, so it was applied with \`--apply\` (exit 0): the note and the copying field ("${v[SITE].copying}") are kept, and the NO_TERMS source follows "${BEFORE}". ` +
        "The script wrote the live capture's path into the source, and the source was then repointed to the frozen copy, exactly as the script's `judgeSite` writes it when the capture it reads is that copy, as tick 54's robots verdicts and eurocontrol.int's were, so the weekly run, which rewrites the live capture whenever its body changes, never moves what the verdict rests on. " +
        "agenthon.net, whose robots verdict was the first taken back (tick 55), is NO_TERMS_ROBOTS_OK again, now on the reading of its policy set rather than on there being no terms link. " +
        `The rules URL (ai-allowed-events.urls.txt@${PIN}:${PRIZE_LINE.n}) passes \`termsGate\`, and \`scripts/prize-dispatch.mjs --skip-captured --why\` passes the home page's line and leaves it out as already captured: the page was captured on 6.10 under the tick-54 verdict, before the link was seen, and that capture stands. ` +
        `The footer's Rules page (/rules/, \`${AGENTHON_COPY}.html:2581\`) is on neither prize list, the audited one or the live one, and is read under the prize instrument once its line is dispatched.`,
    );
    expect(existsSync(`research/rendered/${PRIZE_LINE.slug}.meta.json`)).toBe(true);
    // The counts paragraph, pinned whole, every count computed from the files.
    const ok = (s: Record<string, Entry>) => Object.keys(AUDITED).filter((x) => isRobotsOkVerdict(s[x]));
    const cleared = audited().filter((e) => ok(v).includes(siteOfUrl(e.url))).length;
    const open = (s: Record<string, Entry>) => audited().filter((e) => termsGate(e.url, e.slug, s).ok).length;
    const negative = Object.keys(AUDITED).filter((x) => v[x].verdict === "NO_TERMS" && isExhaustiveNegative(v[x]));
    const pending = Object.keys(AUDITED).filter((x) => v[x].verdict === "TERMS_PENDING");
    // The kindless notes as tick 57 counted them: un.org's TERMS_PENDING entry put back (read in tick 60, "tick 60" below).
    const u = un60Before(v);
    const kindless = Object.keys(u).filter((x) => ["NO_TERMS", "TERMS_PENDING"].includes(u[x].verdict) && !KIND.test(u[x].note ?? ""));
    expect([ok(v).length, ok(t57e).length, cleared, open(v), open(t57e), open(tick56(v))]).toEqual([18, 17, 21, 35, 34, 33]);
    expect([negative.sort(), pending, kindless.length]).toEqual([Object.keys(ROBOTS_NOT_SET).sort(), ["adaptionlabs.ai"], 23]);
    expect(paragraph("**Lines, rows and counts.** ")).toBe(
      "**Lines, rows and counts.** In `research/rendered/urls.txt` the two documents' terms- lines were paused by `scripts/queue-zero-test.mjs --apply-verdicts` (a NO_TERMS site's terms- line fails the gate) and their reasons reworded to say each page was read, and the probe was un-paused; no script writes those forms, so each was one line rewritten by a script that proved every other byte unchanged, and `scripts/urls-pause-comments.mjs --check` keeps them as written. " +
        "After the robots verdict, `scripts/urls-pause-comments.mjs --fix --today 6.10.2026` rewrote the verdict word of the three read terms lines (rows 266, 268 and 269) to NO_TERMS_ROBOTS_OK; the gate passes them now, and they stay paused as read. " +
        "ZERO-TESTS rows 268 and 269 say READ 6.10 (tick 57), and row 247 says ACTIVE again and VERDICT SET 6.10 (tick 57). " +
        `Of the audited sites, ${ok(v).length} are NO_TERMS_ROBOTS_OK now (the ${ok(t57e).length} after eurocontrol.int's robots verdict, and agenthon.net) and their ${cleared} rules URLs pass the gate, which admits ${open(v)} of the 101 audited rules URLs (${open(t57e)} after eurocontrol.int's robots verdict, ${open(tick56(v))} in ticks 55 and 56); ` +
        `${negative.length} are NO_TERMS, exhaustive-negative, their probes judged and declined, as before (agenthon.net held that verdict between the reading and its robots verdict, both in this tick); ` +
        `${pending.length} is TERMS_PENDING, ${pending[0]} (kind shell), and the notes with no kind word are ${kindless.length}, the 23 named in "Terms read" above, agenthon.net's opening "exhaustive-negative:" now. ` +
        'In the render groups above agenthon.net moves from "Terms link found after the verdict", empty since, to "Now, on robots.txt".',
    );
    // The render groups: the home page's line under "Now, on robots.txt", the fourth group empty, its bullet pinned whole.
    const lines = audit.split("\n");
    expect(lines).toContain(`- \`${PRIZE_LINE.url}\` (${SITE}; ai-allowed-events.urls.txt@${PIN}:${PRIZE_LINE.n})`);
    expect(lines.filter((l) => l.startsWith("- (Left this list"))).toEqual([]);
    const g2 = lines.find((l) => l.startsWith("- **Now, on robots.txt "))!;
    expect(g2).toContain('6.10, tick 57: 20 URLs on 17 sites, until agenthon.net\'s robots verdict later in tick 57, "Terms read, third round" below;');
    expect(g2).toContain("`agenthon.net` 1, `aicrowd.com` 1,");
    expect(g2).toContain('and that the label rests on ruling R1 (agenthon.net\'s, since tick 57, what the reading of its policy set found, "Terms read, third round" below)');
    const g4 = lines.find((l) => l.startsWith("- **Terms link found after the verdict, terms pages queued "))!;
    expect(g4).toBe(
      '- **Terms link found after the verdict, terms pages queued (rows 266-269, ticks 55 and 56; read in ticks 56 and 57): 0 URLs on 0 sites** since tick 57 (6.10, tick 56: 1 URL on 1 site, agenthon.net\'s rules URL, until its last two terms documents were read in tick 57, "Terms read, third round" below; 6.10, tick 55: 2 URLs on 2 sites, with eurocontrol.int, TERMS_PENDING on 5.10 and NO_TERMS from the terms read of 6.10, until its Disclaimers page was read in tick 56 and it went back to exhaustive-negative ("Robots probe captured" below); 5.10: 0 URLs on 0 sites, agenthon.net NO_TERMS then and NO_TERMS_ROBOTS_OK from the robots verdicts of 6.10; "Terms links found after the verdicts" and "Terms read, second round" below). ' +
        "In ticks 55 and 56 the group held agenthon.net: its home page's footer links Terms, Privacy and Licensing pages, so the premise of its NO_TERMS verdict, no terms link anywhere, was false, and it was TERMS_PENDING again; its Terms page, read in tick 56, is a participant agreement, not site terms, and the two documents it incorporates, the Data & Software Licensing Policy and the Privacy Notice, were queued as plain terms- lines (rows 268 and 269); its robots.txt probe stayed paused, and its rules URL was refused until they were read (it had been captured on 6.10 under NO_TERMS_ROBOTS_OK, before the link was seen). " +
        'In tick 57 both were read, neither is site terms, and the main thread ruled the site NO_TERMS, exhaustive-negative: its robots.txt probe is active again, `scripts/robots-verdict.mjs` set NO_TERMS_ROBOTS_OK on its capture, and its rules URL is in "Now, on robots.txt" above.',
    );
    expect(audit).toContain(
      "the earlier lines give it 0, which it held until then, and it holds none again since tick 57, when agenthon.net's last two terms documents were read and its robots verdict set.",
    );
    // The dated history in the earlier sections: tick 56's paragraph on agenthon.net, and its counts paragraph.
    expect(audit).toContain(
      'and `scripts/robots-verdict.mjs` is not run for the site before both are read. (Both read 6.10, tick 57: neither is site terms, so the main thread ruled agenthon.net NO_TERMS, exhaustive-negative, its probe is active again, and `scripts/robots-verdict.mjs` set NO_TERMS_ROBOTS_OK; "Terms read, third round" below.)',
    );
    expect(audit).toContain(
      'eurocontrol.int\'s opens "exhaustive-negative:" again; "Terms read, second round" below. Since tick 57 one is, adaptionlabs.ai, and the notes with no kind word are 23: agenthon.net\'s opens "exhaustive-negative:"; "Terms read, third round" below.)',
    );
    expect(audit).toContain('("Terms link found after the verdict"; agenthon.net alone in tick 56, and neither since tick 57).');
    expect(rangeCites(paragraph("**Lines, rows and counts.** "))).toEqual([]);
  });

  it("adds a dated tick-57 mark to the Terms line's row (266) after its tick-56 READ mark, naming only the site's rows", () => {
    // Review fix (tick 57): row 266's tick-56 mark says the site "stays TERMS_PENDING", true as of tick 56; the dated
    // mark after it says what tick 57 found, as rows 268 and 269 do.
    const rows = zeroRows();
    const r = READ2[SITE];
    expect(LATER_MARKS[r.row]).toHaveLength(1);
    const [mark57] = LATER_MARKS[r.row];
    expect(rows.get(r.row)?.row.endsWith(` ${r.mark} ${mark57} |`)).toBe(true);
    expect(rows.get(r.row)?.row.split(" | ")).toHaveLength(4);
    expect(mark57.startsWith("**6.10 (tick 57): ")).toBe(true);
    expect(mark57).toContain("agenthon.net is NO_TERMS, exhaustive-negative, then NO_TERMS_ROBOTS_OK on its robots.txt (row 247), and this line stays paused as read.");
    expect(mark57).not.toMatch(/TERMS_PENDING/);
    expect(verdicts()[SITE].verdict).toBe("NO_TERMS_ROBOTS_OK");
    // The rows it names are the site's: 268 and 269 (the two documents), 247 (the probe).
    const named = [...mark57.matchAll(/\brow (\d+)\b/g)].map((m) => Number(m[1]));
    expect(named).toEqual([...READ3.map((x) => x.row), PROBE.row]);
    for (const n of named) expect(siteOfUrl(rows.get(n)!.url), `row ${n}`).toBe(SITE);
    expect(rangeCites(mark57)).toEqual([]);
    // Only row 266 gained a later mark in this fold; rows 268 and 269 end with their READ marks.
    expect(Object.keys(LATER_MARKS)).toEqual([String(r.row)]);
    for (const x of READ3) expect(rows.get(x.row)?.row.endsWith(` ${x.mark} |`), `row ${x.row}`).toBe(true);
  });

  it("names agenthon.net in no other entry of terms-verdicts.json, nor in _about, so no cross-reference to its verdict can go stale", () => {
    // Review fix (tick 57): the fold found no other entry naming the site, so none needed correcting; this keeps it so. A
    // note elsewhere naming agenthon.net would state its verdict as of its writing, false once the verdict moves again
    // (it moved three times on 6.10). A later fold that adds one changes this test, and must make the sentence true.
    const file = JSON.parse(readFileSync(VERDICTS, "utf8")) as Record<string, unknown> & { sites: Record<string, Entry> };
    const names = (x: unknown) => /agenthon/i.test(JSON.stringify(x));
    expect(Object.keys(file).filter((k) => k !== "sites" && names(file[k]))).toEqual([]);
    expect(Object.keys(file.sites).filter((s) => s !== SITE && names(file.sites[s]))).toEqual([]);
    expect(names(file.sites[SITE])).toBe(true);
    // The raw bytes agree: every occurrence is the site's key or inside its entry.
    const count = (t: string) => (t.match(/agenthon/gi) ?? []).length;
    expect(count(readFileSync(VERDICTS, "utf8"))).toBe(1 + count(JSON.stringify(file.sites[SITE])));
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// Tick 58: scripts/robots-verdict.mjs --recheck, and the verdicts these blocks read (verdicts(), beforeRecheck()).
// ---------------------------------------------------------------------------------------------------------------------

describe("tick 58: the blocks above read the verdicts as they stood before any --recheck rewrite", () => {
  it("keeps the 18 NO_TERMS_ROBOTS_OK entries as a fixture, as terms-verdicts.json held them at 5c980e3", () => {
    expect(createHash("sha256").update(readFileSync(RECHECK_FIXTURE)).digest("hex")).toBe(RECHECK_FIXTURE_SHA256);
    const fixture = recheckFixture();
    expect(Object.keys(fixture).sort()).toEqual(ROBOTS_OK_NOW);
    for (const [site, e] of Object.entries(fixture)) {
      expect([e.verdict, e.checked, e.copying], site).toEqual(["NO_TERMS_ROBOTS_OK", ROBOTS_CHECKED, "unread"]);
      expect(isRobotsOkVerdict(e), site).toBe(true);
      expect(parseRobotsSource(e.source), site).not.toBeNull();
      expect(isRecheckOf(e, e), site).toBe(true);
    }
    // Where 5c980e3 is reachable, the fixture is byte for byte its NO_TERMS_ROBOTS_OK entries; a shallow checkout has the
    // pinned sha256 only.
    let base: string | null = null;
    try {
      base = execFileSync("git", ["show", `${RECHECK_BASE}:${VERDICTS}`], { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" });
    } catch {
      base = null;
    }
    if (base === null) return;
    const then = JSON.parse(base).sites as Record<string, Entry>;
    expect(Object.fromEntries(Object.entries(then).filter(([, e]) => e.verdict === "NO_TERMS_ROBOTS_OK"))).toEqual(fixture);
  });

  it("reads a refresh and a revert of two real entries back to the fixture's, so every reconstruction above is unchanged by them", () => {
    // drivendata.org's robots.txt gains a rule no queued path matches (refresh); crunchdao.com's disallows its first queued
    // rules page (revert): each re-checked by the script on a scratch directory holding its frozen copy and a changed live
    // capture, as the weekly render would leave them.
    const raw = JSON.parse(readFileSync(VERDICTS, "utf8")).sites as Record<string, Entry>;
    const base = beforeRecheck(raw);
    const urls = [URLS, PRIZE_URLS].map((file) => readFileSync(file, "utf8")).join("\n");
    const recheck = (site: string, rule: string) => {
      const dir = mkdtempSync(join(tmpdir(), "prize-terms-recheck-"));
      try {
        const cite = parseRobotsSource(base[site].source).cites[0];
        for (const ext of ["meta.json", "txt"]) copyFileSync(`research/rendered/${cite.slug}.${ext}`, join(dir, `${cite.slug}.${ext}`));
        const live = cite.slug.replace(/-2026-10-06$/, "");
        const body = Buffer.from(`User-agent: MehudakRenderWatch\nUser-agent: *\n${rule}\n`);
        // The live capture a weekly render would write for that robots.txt (whatever the committed live capture holds now).
        const changed = {
          url: cite.robotsUrl,
          slug: live,
          fetchedAt: "2026-10-13T05:23:00.000Z",
          status: 200,
          contentType: "text/plain",
          byteLength: body.length,
          sha256: createHash("sha256").update(body).digest("hex"),
          truncated: false,
          error: null,
          bodyPath: `research/rendered/${live}.txt`,
          textPath: null,
        };
        writeFileSync(join(dir, `${live}.txt`), body);
        writeFileSync(join(dir, `${live}.meta.json`), `${JSON.stringify(changed, null, 2)}\n`);
        return recheckSite({ site, entry: base[site], urls, urlsText: readFileSync(URLS, "utf8"), renderedDir: dir, today: "2026-10-13" });
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    };
    const refresh = recheck("drivendata.org", "Disallow: /nothing-queued-here/");
    const revert = recheck("crunchdao.com", "Disallow: /competitions/datacrunch-2");
    expect([refresh.outcome, revert.outcome]).toEqual(["refresh", "revert"]);
    expect([refresh.entry.verdict, revert.entry.verdict]).toEqual(["NO_TERMS_ROBOTS_OK", "NO_TERMS"]);
    const after = { ...raw, "drivendata.org": refresh.entry, "crunchdao.com": revert.entry };
    // Read back, the two are the fixture's entries again, and nothing else of the file moves: as verdicts() reads a file.
    expect(beforeRecheck(after)).toEqual(base);
    expect(verdictsOf({ sites: after })).toEqual(base);
    // Unread, they change what the tick-45 and tick-54 reconstructions hold: what the reconstruction is for.
    expect(tick45(after)).not.toEqual(tick45(base));
    const ok = (sites: Record<string, Entry>) => Object.keys(sites).filter((s) => sites[s].verdict === "NO_TERMS_ROBOTS_OK");
    expect(ok({ ...base, "drivendata.org": refresh.entry, "crunchdao.com": revert.entry })).toEqual(ok(base).filter((s) => s !== "crunchdao.com"));
    // A hand edit of an entry is not a re-check: it is not put back, so the blocks above still see it.
    const edited = { ...raw, "drivendata.org": { ...refresh.entry, copying: "allowed" } };
    expect(beforeRecheck(edited)["drivendata.org"]).toEqual(edited["drivendata.org"]);
  });
});

/**
 * Tick 60 (7.10.2026): un.org's terms read. The 29.9 audit (research/channel-loop/TERMS-AUDIT-2026-09-29.md) left un.org
 * TERMS_PENDING with its terms page queued (ZERO-TESTS row 210, terms-un): the 29.9 fetch answered 504, and the 6.10 weekly
 * render (364bf71) captured the page, 277 lines. It was frozen as terms-un-2026-10-06, read in full by one Opus reader and
 * one adversarial Opus verifier, and ruled by the main thread: CONDITIONAL_UNMET, copying barred (ruling 6.10 row 21
 * decision 4(2)). The one grant (:90) is for the User's personal, non-commercial use, with no right to redistribute or
 * compile; no clause bars automated access as such. The terms- line is paused as read. The trim of both captures (ruling 6.10
 * row 21 (d)) follows the merge, so the frozen copy's full bytes are read through fullSha256Of and only its cited lines are
 * read from its .txt. The blocks above read un.org's TERMS_PENDING entry back through un60Before().
 */
describe("tick 60: un.org's terms read (7.10), CONDITIONAL_UNMET, copying barred", () => {
  const SITE = "un.org";
  const SLUG = "terms-un";
  const FROZEN = "terms-un-2026-10-06";
  const COPY = `research/rendered/${FROZEN}.txt`;
  const TERMS_URL = "https://www.un.org/en/about-us/terms-of-use";
  const COMMIT = "364bf71";
  const KIND = /^(refusal-type|exhaustive-negative|unanswered|shell|deferred to [a-z0-9.-]+)\b/;
  const PAUSED = `# paused (terms read, left paused, 7.10.2026): un.org is CONDITIONAL_UNMET in research/channel-loop/terms-verdicts.json — ${TERMS_URL}\t${SLUG}`;
  const GRANT =
    "The United Nations grants permission to Users to visit the Site and to download and copy the information, documents and materials (collectively, “Materials”) from the Site for the User’s personal, non-commercial use, without any right to resell or redistribute them or to compile or create derivative works therefrom";
  const DENY = "The United Nations reserves the right to deny in its sole discretion any user access to this Site or any portion thereof without notice.";
  /** The lines of the frozen copy the note cites, and words each holds. */
  const CITED: { line: number; words: string }[] = [
    { line: 84, words: "Terms and conditions of use of United Nations websites" },
    { line: 88, words: "The use of this web site constitutes agreement with the following terms and conditions:" },
    { line: 90, words: GRANT },
    { line: 90, words: "this web site (the “Site”)" },
    { line: 90, words: "more specific restrictions" },
    { line: 92, words: "this Site" },
    { line: 104, words: "As a condition of use of this Site, the User agrees to indemnify the United Nations" },
    { line: 108, words: "(collectively, “Forums”)" },
    { line: 122, words: "(g) Advertise or offer to sell any goods or services" },
    { line: 130, words: "this website" },
    { line: 134, words: "UN.ORG" },
    { line: 144, words: DENY },
    { line: 146, words: "No waiver by the United Nations of any provision of these Terms and Conditions shall be binding" },
    { line: 273, words: "Copyright" },
    { line: 276, words: "Privacy Notice" },
  ];
  const meta = () => JSON.parse(readFileSync(`research/rendered/${FROZEN}.meta.json`, "utf8")) as Capture["meta"];
  const kindless = (s: Record<string, Entry>) =>
    Object.keys(s).filter((x) => ["NO_TERMS", "TERMS_PENDING"].includes(s[x].verdict) && !KIND.test(s[x].note ?? "")).sort();
  const barred = (s: Record<string, Entry>) => Object.keys(s).filter((x) => s[x].copying === "barred").sort();

  it("keeps un.org's entry before the reading as a fixture, as terms-verdicts.json held it at 4602c44", () => {
    expect(createHash("sha256").update(readFileSync(UN60_FIXTURE)).digest("hex")).toBe(UN60_FIXTURE_SHA256);
    const fixture = un60Fixture();
    expect(Object.keys(fixture)).toEqual([SITE]);
    expect(fixture[SITE]).toEqual({
      verdict: "TERMS_PENDING",
      source: TERMS_URL,
      checked: "2026-09-29",
      note: "the terms page returned 504 on 29.9; retried by the weekly run",
      copying: "unread",
    });
    // The page a TERMS_PENDING site may show: its terms- line passed the gate then, and fails it now.
    expect(termsGate(TERMS_URL, SLUG, un60Before(verdicts())).ok).toBe(true);
    expect(termsGate(TERMS_URL, SLUG, verdicts())).toMatchObject({ ok: false, site: SITE, verdict: "CONDITIONAL_UNMET" });
    // Where 4602c44 is reachable, the fixture is byte for byte its entry; a shallow checkout has the pinned sha256 only.
    let base: string | null = null;
    try {
      base = execFileSync("git", ["show", `${UN60_BASE}:${VERDICTS}`], { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" });
    } catch {
      base = null;
    }
    if (base === null) return;
    expect((JSON.parse(base).sites as Record<string, Entry>)[SITE]).toEqual(fixture[SITE]);
  });

  it("rests the verdict on a frozen copy of the 6.10 capture as 364bf71 stored it, which no urls.txt line names", () => {
    const m = meta();
    expect(m.slug).toBe(FROZEN);
    expect(m.url).toBe(TERMS_URL);
    expect(m.frozen?.from).toBe(`research/rendered/${SLUG}.meta.json`);
    expect(m.frozen?.commit).toBe(COMMIT);
    expect(m.frozen?.on).toBe("2026-10-07");
    expect(m.frozen?.why).toContain(`as commit ${COMMIT} stored it`);
    expect([m.status, m.fetchedAt]).toEqual([200, "2026-10-06T12:06:36.352Z"]);
    // The full bytes, whether or not scripts/trim-capture.mjs has trimmed the copy yet.
    expect(fullSha256Of("research/rendered", FROZEN, "html")).toBe(m.sha256);
    expect(fullSha256Of("research/rendered", FROZEN, "txt")).toBe(fullSha256Of("research/rendered", SLUG, "txt"));
    const lines = readFileSync(COPY, "utf8").split("\n");
    expect(lines).toHaveLength(278);
    for (const { line, words } of CITED) expect(lines[line - 1], `:${line}`).toContain(words);
    expect(listedNames(readFileSync(URLS, "utf8")).has(FROZEN)).toBe(false);
    const manifest = readFileSync("research/rendered/FROZEN.sha256", "utf8");
    for (const ext of ["txt", "meta.json"]) expect(manifest, `${FROZEN}.${ext}`).toContain(`  ${FROZEN}.${ext}\n`);
    expect(manifest.includes(`  ${FROZEN}.html\n`)).toBe(existsSync(`research/rendered/${FROZEN}.html`));
    // The 29.9 record of the 504 stays as it was.
    const failed = JSON.parse(readFileSync("research/rendered/terms-un-2026-09-29.meta.json", "utf8")) as Capture["meta"];
    expect([failed.status, failed.error]).toEqual([504, "HTTP 504 Gateway Time-out"]);
  });

  it("gives un.org the main thread's verdict: CONDITIONAL_UNMET, copying barred, checked 7.10, its source naming what was read and keeping the TERMS_PENDING one", () => {
    const v = verdicts();
    const e = v[SITE];
    const before = un60Fixture()[SITE];
    expect([e.verdict, e.checked, e.copying]).toEqual(["CONDITIONAL_UNMET", "2026-10-07", "barred"]);
    const raw = JSON.parse(readFileSync(VERDICTS, "utf8")).sites as Record<string, Entry>;
    expect(Object.keys(raw[SITE])).toEqual(["verdict", "source", "checked", "note", "copying"]);
    const m = meta();
    expect(e.source.startsWith(`${COPY} (the UN's "Terms of Use" (:1, :82), "Terms and conditions of use of United Nations websites" (:84), no date stated, the decisive clause at :90; `)).toBe(true);
    expect(e.source).toContain(`${TERMS_URL}, fetched ${m.fetchedAt} by the 6.10 weekly render, frozen as ${m.frozen!.commit} stored it)`);
    expect(e.source).toContain(
      'read in full by one Opus reader and one adversarial Opus verifier, ruled by the main thread (tick 60; research/channel-loop/TERMS-AUDIT-2026-09-29.md, "un.org read (7.10.2026, tick 60)")',
    );
    const parts = e.source.split(TERMS_BEFORE);
    expect(parts).toHaveLength(2);
    expect(parts[1]).toBe(
      `${before.source} (checked ${before.checked}; its note: "${before.note}", the record of that failure frozen as research/rendered/terms-un-2026-09-29.meta.json:5, :10)`,
    );
    // Nothing else in the file moved: every other entry is what it was before the reading.
    expect({ ...v, [SITE]: before }).toEqual(un60Before(v));
    // No other entry names un.org (population.un.org and data.un.org are its hosts, not other sites' cross-references).
    for (const [site, entry] of Object.entries(raw)) if (site !== SITE) expect(/(^|[^a-z0-9.-])un\.org\b/.test(JSON.stringify(entry)), site).toBe(false);
    expect(ADDRESS.test(e.source) || ADDRESS.test(e.note ?? "")).toBe(false);
  });

  it("states the ruling in the note: the condition first, then scope, grant, access, carve-outs and the WPP remark, each with its frozen line", () => {
    const note = verdicts()[SITE].note!;
    expect(note.startsWith(`CONDITIONAL_UNMET: "${GRANT}" (${COPY}:90); the runner serves an income-seeking project`)).toBe(true);
    for (const words of [
      "so the condition is unmet and copying is barred for this use (ruling 6.10 row 21 decision 4(2))",
      '"The use of this web site constitutes agreement with the following terms and conditions:" (:88)',
      "Access: no clause mentions robots, crawling or automated access, so access as such is not barred.",
      `"${DENY}" (:144) is a discretionary right to deny, not a bar`,
      'the "shall not" list of the Forums clause (:108-122) is confined to Forums and does not reach a GET',
      "use is conditioned on an indemnity (:104), a condition of use, not an access bar",
      "The single permission at :90 may qualify the visit as well as the download and copy",
      "Scope: www.un.org is covered; population.un.org and data.un.org are unclear, since the heading is plural (:84)",
      '("this web site", :88, :90; "this Site", :92; "this website", :130) and names no host beyond "UN.ORG" in its privacy reference (:134)',
      'Carve-outs: none. Material-specific terms appear only as "more specific restrictions" (:90)',
      "The waiver clause (:146) governs waivers of these Terms and is not the only route to a wider grant",
      "So these terms do not open WPP data for commercial charts: that rests on the CC BY 3.0 IGO notice on population.un.org's own pages",
      "the retired population.un.org WPP line (un-wpp-downloads) stays retired, and any replacement is judged on its own host's notice",
      "Unread: the footer's Copyright page and Privacy Notice (:273, :276)",
    ]) {
      expect(note, words).toContain(words);
    }
    // The WPP line it names is retired, and stays so.
    const wpp = readFileSync(URLS, "utf8").split("\n").filter((l) => /\tun-wpp-downloads$/.test(l));
    expect(wpp).toHaveLength(1);
    expect(wpp[0].startsWith("# retired (")).toBe(true);
    // Every line number the note cites is one CITED checks against the frozen copy.
    const cited = new Set(CITED.map((c) => c.line));
    for (const n of [...note.matchAll(/:(\d+)(?:-(\d+))?/g)].flatMap((x) => (x[2] ? [Number(x[1]), Number(x[2])] : [Number(x[1])]))) {
      expect(cited.has(n), `:${n}`).toBe(true);
    }
  });

  it("pauses the terms- line as read, and no other urls.txt line changes state", () => {
    const text = readFileSync(URLS, "utf8");
    const lines = text.split("\n").filter((l) => l.endsWith(`\t${SLUG}`));
    expect(lines).toEqual([PAUSED]);
    expect(PAUSED_LINE.exec(PAUSED)?.slice(1)).toEqual([TERMS_URL, SLUG]);
    expect(active().some((l) => l.slug === SLUG)).toBe(false);
    // The pause comment is current (scripts/urls-pause-comments.mjs keeps a CONDITIONAL_UNMET reason as written).
    const sync = syncPauseComments(text, verdicts(), { today: "7.10.2026" });
    expect((sync.changes as { line: number }[]).length).toBe(0);
    // queue-zero-test --apply-verdicts would pause nothing more, and with the entry before the reading it pauses nothing.
    expect(applyVerdicts(text, verdicts()).paused).toEqual([]);
    expect(applyVerdicts(text.replace(PAUSED, `${TERMS_URL}\t${SLUG}`), un60Before(verdicts())).paused).toEqual([]);
    expect(applyVerdicts(text.replace(PAUSED, `${TERMS_URL}\t${SLUG}`), verdicts()).paused).toEqual([SLUG]);
  });

  it("marks ZERO-TESTS row 210 and the 29.9 audit's Round 2 row as read, and records the reading at the end of the audit", () => {
    const zero = readFileSync(ZERO, "utf8").split("\n").filter((l) => l.startsWith("| 210 | "));
    expect(zero).toHaveLength(1);
    expect(zero[0]).toBe(
      `| 210 | terms audit (tick 20): un.org | ${TERMS_URL} | whether un.org's terms bar automated access by the runner (research/channel-loop/TERMS-AUDIT-2026-09-29.md; NO_TERMS_CAPTURE) **READ 7.10 (tick 60): CONDITIONAL_UNMET: ${COPY}:90 allows visiting, downloading and copying only for personal, non-commercial use, with no right to redistribute, compile or make derivative works; copying barred; the line is paused.** |`,
    );
    const audit = readFileSync("research/channel-loop/TERMS-AUDIT-2026-09-29.md", "utf8");
    const round2 = audit.split("\n").filter((l) => l.startsWith("| `un.org` | NO_TERMS_CAPTURE | TERMS_PENDING"));
    expect(round2).toHaveLength(1);
    expect(round2[0].split(" | ")).toHaveLength(5);
    expect(round2[0].split(" | ")[2]).toBe('TERMS_PENDING; **CONDITIONAL_UNMET since 7.10.2026 (tick 60): read, copying barred; see "un.org read (7.10.2026, tick 60)" below.**');
    // The section is the note's last.
    const start = audit.indexOf("\n## un.org read (7.10.2026, tick 60)\n");
    expect(start).toBeGreaterThan(audit.indexOf("\n## Round 4 (tick 23, 29.9.2026)\n"));
    const text = audit.slice(start + 1);
    expect(text.indexOf("\n## ")).toBe(-1);
    expect(text).toContain(`frozen as \`${COPY}\` (the capture as commit ${COMMIT} stored it, byte for byte)`);
    expect(text).toContain(`"for the User’s personal, non-commercial use, without any right to resell or redistribute them or to compile or create derivative works therefrom" (:90)`);
    expect(text).toContain("so the condition is unmet and copying is barred (ruling 6.10 row 21 decision 4(2))");
    expect(text).toContain("The retired population.un.org WPP line (`un-wpp-downloads`) stays retired");
    const rows = text.split("\n").filter((l) => l.startsWith("| `un.org` |"));
    expect(rows).toHaveLength(1);
    const cells = rows[0].split(" | ");
    expect(cells).toHaveLength(6);
    expect(cells[1].startsWith(verdicts()[SITE].verdict)).toBe(true);
    expect(cells[2]).toContain(`(\`${COPY}:90\`)`);
    expect(cells[4]).toBe(verdicts()[SITE].copying);
    expect(cells[5]).toBe(`\`${SLUG}\` (row 210), \`# paused (terms read, left paused, 7.10.2026)\` |`);
    // The counts paragraph, its counts computed from the file.
    const v = verdicts();
    const count = (verdict: string) => Object.values(v).filter((e) => e.verdict === verdict).length;
    const copying = (value: string) => Object.values(v).filter((e) => e.copying === value).length;
    expect([barred(v).length, copying("unread"), copying("allowed"), count("CONDITIONAL_UNMET"), count("TERMS_PENDING")]).toEqual([12, 119, 1, 9, 3]);
    expect(text).toContain(
      `so twelve entries are barred (${barred(v).join(", ")}), ${copying("unread")} unread and one allowed; nine sites are CONDITIONAL_UNMET and three TERMS_PENDING.`,
    );
    expect(text).toContain("the main thread runs `--apply` after this fold is merged");
    expect(ADDRESS.test(text)).toBe(false);
  });

  it("cites in the audit section only lines CITED checks against the frozen copy, each beside the words its line holds", () => {
    const audit = readFileSync("research/channel-loop/TERMS-AUDIT-2026-09-29.md", "utf8");
    const text = audit.slice(audit.indexOf("\n## un.org read (7.10.2026, tick 60)\n") + 1);
    // Every :N or :N-M in the section (a timestamp's :06:36 excluded) is a line CITED checks against the frozen copy.
    const cited = new Set(CITED.map((c) => c.line));
    const pointers = [...text.matchAll(/(?<!\d):(\d+)(?:-(\d+))?/g)].flatMap((x) => (x[2] ? [Number(x[1]), Number(x[2])] : [Number(x[1])]));
    expect(pointers).toHaveLength(22);
    for (const n of pointers) expect(cited.has(n), `:${n}`).toBe(true);
    // The pointers the reading rests on, each beside what its line says (CITED pins the words of each line).
    for (const words of [
      `the UN's "Terms and conditions of use of United Nations websites" (\`${COPY}:84\`), no date stated, a browsewrap (:88).`,
      ":144 is a discretionary right to deny any user access, and the Forum list (:108-122) does not reach a GET.",
      `the heading is plural (\`${COPY}:84\`), the operative text singular (:88, :90, :92, :130), and "UN.ORG" (:134) is the only host-like name.`,
      `The waiver clause (\`${COPY}:146\`) is not the only route to a wider permission`,
      "or the footer's uncaptured Copyright page (:273), would be a separate grant.",
      "The single permission at :90 may qualify the visit as well as the copy",
      ":104 is an indemnity condition of use, not an access bar.",
      `Unread: the footer's Copyright page and Privacy Notice (\`${COPY}:273\`, :276).`,
    ]) {
      expect(text, words).toContain(words);
    }
    const row = text.split("\n").filter((l) => l.startsWith("| `un.org` |"));
    expect(row).toHaveLength(1);
    expect(row[0].split(" | ")[3]).toBe("www.un.org yes; population.un.org and data.un.org unclear (:84, :90, :134)");
  });

  it("names the IGO licence decision, a file that exists, in the note and in the audit section", () => {
    const IGO = "research/faceless-youtube/LICENCE-IGO-DECISION.md";
    expect(existsSync(IGO)).toBe(true);
    expect(readFileSync(IGO, "utf8")).toContain("population.un.org");
    expect(verdicts()[SITE].note).toContain(`on population.un.org's own pages (${IGO}'s matter, untouched by this reading)`);
    const audit = readFileSync("research/channel-loop/TERMS-AUDIT-2026-09-29.md", "utf8");
    const text = audit.slice(audit.indexOf("\n## un.org read (7.10.2026, tick 60)\n") + 1);
    expect(text).toContain(`on population.un.org's own pages, \`${IGO}\`'s matter, which this reading leaves untouched.`);
  });

  it("moves un.org alone: one more copying-barred entry, one fewer kindless note", () => {
    const v = verdicts();
    const then = un60Before(v);
    expect(barred(v)).toEqual([...barred(then), SITE].sort());
    expect(barred(then)).toHaveLength(11);
    expect(kindless(v)).toEqual(kindless(then).filter((s) => s !== SITE));
    expect(kindless(then)).toContain(SITE);
    expect(kindless(v)).toHaveLength(22);
  });
});
