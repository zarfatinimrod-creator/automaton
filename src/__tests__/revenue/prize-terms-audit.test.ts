import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design
import { decisionFiles } from "../../../scripts/freeze-capture.mjs";
import {
  parseRobotsTxt,
  parseUrlList,
  redactSecrets,
  robotsDecision,
  robotsRulesFor,
  robotsTxtUrl,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/render-watch.mjs";
import {
  PATH_LIMITS,
  applyVerdicts,
  isExhaustiveNegative,
  isRobotsOkVerdict,
  isRobotsProbe,
  siteOf,
  termsGate,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/queue-zero-test.mjs";
import {
  PAUSED_LINE,
  judgeSite,
  queuedPaths,
  readRobotsCapture,
  readableCapture,
  serializeVerdicts,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/robots-verdict.mjs";

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
 */
const VERDICTS = "research/channel-loop/terms-verdicts.json";
const URLS = "research/rendered/urls.txt";
const ZERO = "research/channel-loop/ZERO-TESTS.md";
const AUDIT = "research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md";
const PRIZE_URLS = "research/measurements/ai-allowed-events.urls.txt";
const PIN = "548be52";
const FIXTURE = `src/__tests__/revenue/fixtures/ai-allowed-events-${PIN}.urls.txt`;
const FIXTURE_SHA256 = "3b37fb001dc04e50c313f704ded1cddde8a405b27b72819a19a04eeb2c03986c";
type Entry = { verdict: string; source: string; checked: string; note?: string };
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
  return { comment: at < 0 ? undefined : text[at], line: at < 0 ? undefined : text[at + 1] };
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
 * which rules URLs of the fixture belong to it (by the verdict of the URL's site; "probed" is a site with an active
 * robots- line in urls.txt). The last group held xiuwenz2.github.io until the masking fold (5.10, tick 48) made it
 * CONDITIONAL_MET; it is empty now, and the note's bullet says 0 URLs. The second group is the robots verdicts of 6.10
 * (tick 54): a NO_TERMS site scripts/robots-verdict.mjs set to NO_TERMS_ROBOTS_OK leaves the fourth group, which on 5.10
 * held all 21 probed sites, for it. The counts test reads the groups twice, with the verdicts as they are and as tick45()
 * gives them back, and the note states both.
 */
const RENDER_GROUPS: { opens: string; holds: (site: string, e: Entry, probed: boolean) => boolean }[] = [
  { opens: "- **Now: ", holds: (_, e) => ["CONDITIONAL_MET", "NOT_BARRED"].includes(e.verdict) },
  { opens: "- **Now, on robots.txt ", holds: (_, e) => isRobotsOkVerdict(e) },
  { opens: "- **After Tuesday's terms fetch ", holds: (_, e) => e.verdict === "TERMS_PENDING" },
  { opens: "- **Probed 6.10, NO_TERMS_ROBOTS_OK not set ", holds: (_, e, probed) => isExhaustiveNegative(e) && probed },
  {
    opens: "- **Graded with no capture, on their terms: ",
    holds: (site, e) => e.verdict === "BARRED" || (e.verdict === "CONDITIONAL_UNMET" && !NAMED_ADDRESSES.includes(site)),
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
const ROBOTS_OK = [
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
 * The verdicts as tick 45 left them: each NO_TERMS_ROBOTS_OK entry read back to the NO_TERMS entry the script rewrote
 * (the source after "; NO_TERMS before: ", checked 2026-10-05 as every audited entry was, and the note it kept); every
 * other entry as it is.
 */
const tick45 = (v: Record<string, Entry>): Record<string, Entry> =>
  Object.fromEntries(
    Object.entries(v).map(([site, e]) => {
      if (e.verdict !== "NO_TERMS_ROBOTS_OK") return [site, e];
      const at = e.source.indexOf(BEFORE);
      const before: Entry = { verdict: "NO_TERMS", source: at < 0 ? "" : e.source.slice(at + BEFORE.length), checked: "2026-10-05" };
      return [site, e.note === undefined ? before : { ...before, note: e.note }];
    }),
  );
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
type Capture = { slug: string; meta: Record<string, unknown> & { url: string; fetchedAt: string; status: number | null; contentType: string | null; sha256: string | null; bodyPath: string | null; error: string | null }; body: string | null };
/** The committed robots- capture of one robots.txt URL, as scripts/robots-verdict.mjs reads it (never a frozen copy). */
const captureOf = (robotsUrl: string) => readRobotsCapture(robotsUrl) as Capture | null;

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
    const v = verdicts();
    const then = tick45(v);
    for (const [site, verdict] of Object.entries(AUDITED)) {
      // As tick 45 judged it...
      expect(then[site]?.verdict, site).toBe(verdict);
      expect(then[site].checked, site).toBe("2026-10-05");
      expect(then[site].source, site).toContain("TERMS-AUDIT-2026-10-05-prize-events.md");
      // ...and as it is: unchanged, or (6.10, tick 54) a NO_TERMS site scripts/robots-verdict.mjs set NO_TERMS_ROBOTS_OK,
      // whose source still ends in the tick-45 one ("tick 54" below holds the rest).
      if (v[site].verdict === "NO_TERMS_ROBOTS_OK") {
        expect(verdict, site).toBe("NO_TERMS");
        expect(v[site].checked, site).toBe(ROBOTS_CHECKED);
        expect(v[site].source.endsWith(`${BEFORE}${then[site].source}`), site).toBe(true);
      } else {
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

  it("queues exactly one terms- line for each TERMS_PENDING site, at the terms URL its verdict names, and nothing else of it", () => {
    const v = verdicts();
    const lines = active();
    for (const [site, verdict] of Object.entries(AUDITED)) {
      if (verdict !== "TERMS_PENDING") continue;
      const mine = lines.filter((e) => siteOfUrl(e.url) === site);
      expect(mine, site).toHaveLength(1);
      expect(mine[0].slug, site).toMatch(/^terms-/);
      expect(v[site].source.startsWith(`${mine[0].url} (`), site).toBe(true);
      expect(termsGate(mine[0].url, mine[0].slug, v).ok, site).toBe(true);
    }
  });

  it("queues grand-challenge.org's derived terms URL under ruling R2's exception, which urls.txt's header records after its one rule", () => {
    const v = verdicts();
    const e = v[DERIVED_TERMS.site];
    expect(e.verdict).toBe("TERMS_PENDING");
    expect(e.source.startsWith(`${DERIVED_TERMS.url} (`)).toBe(true);
    expect(e.note).toMatch(/^terms unread\. Queued under ruling R2 \(5\.10/);
    expect(e.note).not.toContain("Held (tick 45 review");
    // The header: the one rule's paragraph, then the exception, word for word; the one rule itself unchanged.
    const header = urlsHeader();
    expect(header).toContain(
      'No URL is invented, guessed, or extrapolated from a pattern — including "the same site probably has a /pricing page". A URL nobody wrote down is a URL nobody can cite. ' +
        EXCEPTION,
    );
    expect(header.split("Exception (ruling").length).toBe(2);
    // The line is active, and its comment cites the template line and the domain line.
    expect(active().filter((l) => l.url === DERIVED_TERMS.url).map((l) => [l.url, l.slug])).toEqual([[DERIVED_TERMS.url, DERIVED_TERMS.slug]]);
    expect(termsGate(DERIVED_TERMS.url, DERIVED_TERMS.slug, v).ok).toBe(true);
    expect(pausedLines().filter((p) => p.url === DERIVED_TERMS.url)).toEqual([]);
    const { comment, line: under } = listedRow(DERIVED_TERMS.row);
    expect(under).toBe(`${DERIVED_TERMS.url}\t${DERIVED_TERMS.slug}`);
    expect(comment).toContain("URL derived from the platform's own source (exception, ruling R2, 5.10.2026)");
    expect(comment).toContain("app/config/settings.py:767");
    expect(comment).toContain("app/grandchallenge/subdomains/utils.py:24");
    expect(comment).toContain("at ff2fb5c");
    expect(comment).not.toMatch(/[Pp]aused/);
    expect(zeroRows().get(DERIVED_TERMS.row)?.row).not.toContain("**PAUSED");
  });

  it("opens every NO_TERMS note exhaustive-negative, by the verified records and ruling R1, and queues each such site one robots.txt probe", () => {
    const v = verdicts();
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
      expect(["NO_TERMS", "NO_TERMS_ROBOTS_OK"], site).toContain(v[site].verdict);
      expect(v[site].note!.endsWith("(ruling R1, 5.10, TERMS-AUDIT-2026-10-05-prize-events.md)"), site).toBe(true);
      expect(v[site].note, site).not.toMatch(/until (that|the main thread's) ruling|is paused, not fetched/);
    }
    expect(Object.values(AUDITED).filter((x) => x === "NO_TERMS")).toHaveLength(21);
    expect(Object.keys(AUDITED).filter((s) => isExhaustiveNegative(then[s]))).toHaveLength(21);
    // 6.10 (tick 54): 17 of them NO_TERMS_ROBOTS_OK, four still exhaustive-negative NO_TERMS.
    expect(Object.keys(AUDITED).filter((s) => isRobotsOkVerdict(v[s])).sort()).toEqual([...ROBOTS_OK].sort());
    expect(Object.keys(AUDITED).filter((s) => isExhaustiveNegative(v[s])).sort()).toEqual(Object.keys(ROBOTS_NOT_SET).sort());
    // mozilladatacollective.com keeps both readings of whose terms govern it, and R3's address rule for its rules pages.
    const mdc = v["mozilladatacollective.com"].note!;
    expect(mdc).toContain("DrivenData");
    expect(mdc).toContain("en/websites_tou.md:13");
    expect(mdc).toContain("reads only robots.txt");
    expect(mdc).toContain("ruling R3");
  });

  it("pauses no line of the audit after the rulings: the six probes are active again and three were queued", () => {
    const rows = zeroRows();
    const paused = pausedLines().filter((p) => Object.hasOwn(AUDITED, siteOfUrl(p.url)));
    expect(paused).toEqual([]);
    for (let n = 235; n <= 264; n += 1) expect(rows.get(n)?.row, `row ${n}`).not.toContain("**PAUSED");
    for (const n of UNPAUSED_PROBES) {
      const { comment, line } = listedRow(n);
      expect(comment, `row ${n}`).toMatch(PROBE_COMMENT);
      expect(comment, `row ${n}`).not.toContain("(ruling R1, 5.10)");
      expect(line, `row ${n}`).toBe(`${rows.get(n)?.url}\t${active().find((l) => l.url === rows.get(n)?.url)?.slug}`);
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
  });

  it("ties each tick-45 ZERO-TESTS row to the active urls.txt line under its comment", () => {
    const rows = zeroRows();
    for (let n = 235; n <= 264; n += 1) {
      const { comment, line } = listedRow(n);
      expect(comment, `row ${n}`).toBeDefined();
      expect(line!.startsWith("#"), `row ${n}`).toBe(false);
      expect(line!.split("\t")[0], `row ${n}`).toBe(rows.get(n)?.url);
    }
    expect(Math.max(...rows.keys())).toBe(264);
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
    const probed = new Set(active().filter((l) => isRobotsProbe(l.url, l.slug)).map((l) => siteOfUrl(l.url)));
    // Every audited rules URL falls in exactly one group, with the verdicts as they are and as tick 45 left them.
    const group = (v: Record<string, Entry>) => {
      const counts = RENDER_GROUPS.map(() => new Map<string, number>());
      const urls = RENDER_GROUPS.map(() => [] as string[]);
      for (const e of audited()) {
        const site = siteOfUrl(e.url);
        const into = RENDER_GROUPS.map((g, i) => (g.holds(site, v[site], probed.has(site)) ? i : -1)).filter((i) => i >= 0);
        expect(into, `${site} ${e.url}`).toHaveLength(1);
        counts[into[0]].set(site, (counts[into[0]].get(site) ?? 0) + 1);
        urls[into[0]].push(e.url);
      }
      return { counts, urls, sums: counts.map((m) => [[...m.values()].reduce((a, b) => a + b, 0), m.size]) };
    };
    const now = group(verdicts());
    const then = group(tick45(verdicts()));
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
    expect(then.sums.map((c) => c.join("/"))).toEqual(["13/12", "0/0", "40/9", "29/21", "19/3", "0/0"]);
    expect(computed.map((c) => c.join("/"))).toEqual(["13/12", "20/17", "40/9", "9/4", "19/3", "0/0"]);
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
    for (const sums of [computed, then.sums]) {
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
 * sites were the fixture's on 6.10) and the committed captures, in process: no network, no child process.
 */
describe("tick 54: the robots verdicts of 6.10", () => {
  const raw = () => readFileSync(VERDICTS, "utf8");
  const fixture = () => readFileSync(FIXTURE, "utf8");

  it("sets exactly these 17 of the 21 NO_TERMS sites to NO_TERMS_ROBOTS_OK, and keeps terms-verdicts.json's exact format", () => {
    const v = verdicts();
    expect(ROBOTS_OK).toHaveLength(17);
    expect(Object.keys(AUDITED).filter((s) => v[s].verdict === "NO_TERMS_ROBOTS_OK").sort()).toEqual([...ROBOTS_OK].sort());
    expect([...ROBOTS_OK, ...Object.keys(ROBOTS_NOT_SET)].sort()).toEqual(Object.keys(AUDITED).filter((s) => AUDITED[s] === "NO_TERMS").sort());
    // The script writes the file as it is committed (one-space indent, no final newline): the 17 rewrites kept that.
    expect(serializeVerdicts(JSON.parse(raw()))).toBe(raw());
  });

  it("rests each NO_TERMS_ROBOTS_OK verdict on the committed robots.txt capture its source names, exactly as the script writes it", () => {
    const v = verdicts();
    const file = JSON.parse(raw());
    const then = tick45(v);
    const kinds: Record<string, string[]> = { file: [], absent: [] };
    for (const site of ROBOTS_OK) {
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
      const capture = captureOf(cited!.url);
      expect(capture?.slug, site).toBe(cited!.slug);
      const { meta, body } = capture!;
      expect(meta.url, site).toBe(cited!.url);
      expect(meta.fetchedAt, site).toBe(cited!.fetchedAt);
      expect(existsSync(cited!.path), cited!.path).toBe(true);
      if (cited!.kind === "file") {
        // A robots.txt the site served (2xx text/plain, not markup), stored at the .txt the source names, whose bytes the
        // meta's sha256 is of; the source carries its first 12 hex digits.
        expect(meta.bodyPath, site).toBe(cited!.path);
        expect(readableCapture(meta, body), site).toEqual({ kind: "file" });
        expect(meta.sha256!.slice(0, 12), site).toBe(cited!.sha12);
        expect(createHash("sha256").update(readFileSync(cited!.path)).digest("hex"), site).toBe(meta.sha256);
      } else {
        // A 404 (or 410): the site has no robots.txt, so no rules (RFC 9309 §2.3.1.3). render-watch stored no body, so
        // the source names the .meta.json and carries no sha256.
        expect(meta.status, site).toBe(cited!.status);
        expect(meta.bodyPath, site).toBeNull();
        expect(meta.sha256, site).toBeNull();
        expect(readableCapture(meta, body), site).toEqual({ kind: "absent" });
      }
      // Set by the script, not by hand: given the NO_TERMS entry tick 45 left, the fixture and the committed captures,
      // judgeSite allows every rules path and writes this entry, field for field.
      const out = judgeSite({ site, verdicts: { ...file, sites: then }, urls: fixture(), today: ROBOTS_CHECKED });
      expect(out.changed, site).toBe(true);
      expect(out.checked.map((c: { url: string; allowed: boolean }) => [c.url, c.allowed]), site).toEqual(rules.map((r) => [r.url, true]));
      expect(out.verdicts.sites[site], site).toEqual(e);
      expect(Object.keys(out.verdicts.sites[site]), site).toEqual(Object.keys(e));
    }
    expect(kinds.absent.sort()).toEqual([...ROBOTS_404].sort());
    expect(kinds.file).toHaveLength(11);
  });

  it("leaves the four others NO_TERMS, each for a reason its own robots.txt capture shows", () => {
    const v = verdicts();
    const file = JSON.parse(raw());
    for (const [site, { slug, why }] of Object.entries(ROBOTS_NOT_SET)) {
      expect(v[site].verdict, site).toBe("NO_TERMS");
      expect(isExhaustiveNegative(v[site]), site).toBe(true);
      expect(v[site].checked, site).toBe("2026-10-05");
      const rules = rulesOf(site);
      const robotsUrl = robotsTxtUrl(rules[0].url);
      for (const r of rules) expect(robotsTxtUrl(r.url), r.url).toBe(robotsUrl);
      const capture = captureOf(robotsUrl);
      expect(capture?.slug, site).toBe(slug);
      const { meta, body } = capture!;
      if (why === "html") {
        // /robots.txt answered 200 with an HTML page: not a robots.txt the site served (ruling D2(iv): the site's answer).
        expect(meta.status, site).toBe(200);
        expect(meta.contentType, site).toMatch(/^text\/html\b/);
        expect(meta.bodyPath, site).toBe(`research/rendered/${slug}.html`);
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
      const out = judgeSite({ site, verdicts: file, urls: fixture(), today: ROBOTS_CHECKED });
      expect(out.changed, site).toBe(false);
      expect(out.verdicts, site).toBe(file);
      expect(out.why, site).toMatch(
        why === "html"
          ? new RegExp(`^the robots\\.txt capture of https://${new URL(robotsUrl).hostname.replace(/\./g, "\\.")} \\(research/rendered/${slug}\\.meta\\.json\\) is not a robots\\.txt the site served: a 200 answered text/html`)
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
    }
    for (const site of Object.keys(ROBOTS_NOT_SET)) {
      const out = judgeSite({ site, verdicts: file, urls: fixture(), today: ROBOTS_CHECKED });
      expect(out.changed, site).toBe(false);
      expect(out.verdicts, site).toBe(file);
    }
  });

  it("records every robots verdict in the audit note's last section, with the values the captures hold", () => {
    const audit = readFileSync(AUDIT, "utf8");
    const heads = audit.split("\n").filter((l) => l.startsWith("## "));
    expect(heads.slice(-2)).toEqual(["## Every URL the agents fetched", "## Robots verdicts (6.10.2026, tick 54)"]);
    const section = audit.slice(audit.indexOf("## Robots verdicts (6.10.2026, tick 54)"));
    expect(section).toContain("node scripts/robots-verdict.mjs <site> --urls research/measurements/ai-allowed-events.urls.txt");
    expect(section).toContain("ruling 30.9 16(d) D2(iv)-(v)");
    const v = verdicts();
    const rows = section.split("\n").filter((l) => /^\| `[a-z0-9.-]+` \|/.test(l));
    const sites = [...ROBOTS_OK, ...Object.keys(ROBOTS_NOT_SET)].sort();
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
      const { slug, meta, body } = captureOf(robotsTxtUrl(pages[0].url))!;
      // The file named is the one the capture stored, or its meta when it stored none.
      expect(path, site).toBe(meta.bodyPath ?? `research/rendered/${slug}.meta.json`);
      expect(existsSync(path), path).toBe(true);
      expect(status, site).toBe(meta.status === null ? "none" : String(meta.status));
      expect(contentType ?? null, site).toBe(meta.contentType);
      expect(fetchedAt, site).toBe(meta.fetchedAt);
      expect(sha12, site).toBe(meta.sha256 ? meta.sha256.slice(0, 12) : "none");
      expect(Number(n), site).toBe(pages.length);
      expect(verdict, site).toBe(v[site].verdict);
      // The answer, by what the capture is and what its rules say of the queued paths.
      const kind = readableCapture(meta, body).kind;
      if (kind === "file") {
        const own = robotsRulesFor(parseRobotsTxt(body));
        const allowed = pages.filter((p: { url: string }) => robotsDecision(own, p.url).allowed).length;
        expect(answer, site).toMatch(new RegExp(allowed === pages.length ? `^${n} of ${n} allowed ` : `^${pages.length - allowed} of ${n} disallowed `));
      } else if (kind === "absent") {
        expect(answer, site).toBe(`no robots.txt (${meta.status}): no rules, RFC 9309 §2.3.1.3; ${n} of ${n} allowed`);
      } else if (kind === "refused") {
        expect(answer, site).toMatch(/^not a robots\.txt: a 200 that answered /);
      } else {
        expect(answer, site).toMatch(/^no answer \(fetch failed\): complete disallow, RFC 9309 §2\.3\.1\.4$/);
      }
      expect(verdict === "NO_TERMS_ROBOTS_OK", site).toBe(ROBOTS_OK.includes(site));
    }
  });
});
