import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design
import { decisionFiles } from "../../../scripts/freeze-capture.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { parseUrlList, redactSecrets } from "../../../scripts/render-watch.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { PATH_LIMITS, applyVerdicts, isExhaustiveNegative, isRobotsProbe, siteOf, termsGate } from "../../../scripts/queue-zero-test.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { PAUSED_LINE } from "../../../scripts/robots-verdict.mjs";

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
  "xiuwenz2.github.io": "CONDITIONAL_UNMET",
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
 * addresses before commit" (tick 45 review, defect 1); render-watch commits every capture and masks no address, so the
 * runner does not meet it: CONDITIONAL_UNMET, as mozilla.org (RULING-2026-10-04-mozilla-precondition.md §3 rule 3),
 * until render-watch masks addresses before it commits a capture.
 */
const NAMED_ADDRESSES = ["xiuwenz2.github.io"];
/**
 * Ruling R1 (5.10): the nine NO_TERMS sites the review had left short of exhaustive-negative, six because GitHub code
 * search was not run and three because their auditors probed Open Terms Archive in eight declarations repos only (their
 * verifiers covered the organisation's full listing). Code search is outside this session's scope and the ruling does not
 * require it, so each note now opens "exhaustive-negative" and each site has one robots.txt probe.
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
/** grand-challenge.org's terms line, admitted by ruling R2 as a URL derived from the platform's own source. */
const DERIVED_TERMS = { site: "grand-challenge.org", url: "https://grand-challenge.org/policies/terms-of-service/", slug: "terms-grand-challenge", row: 237 };
/** Ruling R2's sentence, which urls.txt's header carries directly after its one rule. */
const EXCEPTION =
  "Exception (ruling 5.10.2026, tick 45, TERMS-AUDIT-2026-10-05-prize-events.md): a terms- line of a TERMS_PENDING site may carry a URL derived from the site's own source code at a pinned commit when its comment cites the template line and the domain line; a 404, or a redirect to another host, retires the line. Never a rules page.";

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
    for (const [site, verdict] of Object.entries(AUDITED)) {
      expect(v[site]?.verdict, site).toBe(verdict);
      expect(v[site].checked, site).toBe("2026-10-05");
      expect(v[site].source, site).toContain("TERMS-AUDIT-2026-10-05-prize-events.md");
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
    // Each URL the note lists as renderable names the fixture line it is on, and its site may be rendered now.
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
    expect(Object.entries(AUDITED).filter(([, x]) => x === "CONDITIONAL_MET").map(([s]) => s).sort()).toEqual(
      PAGES.filter((s) => !NAMED_ADDRESSES.includes(s)).sort(),
    );
    expect(v["openreview.net"].source).toContain("research/channel-loop/terms/openreview-terms-of-use-2026-10-05.md");
    expect(v["codabench.org"].source).toContain("research/channel-loop/terms/codabench-privacy-and-terms-2026-10-05.md");
    expect(v["ansperformance.eu"].source).toContain("research/channel-loop/terms/ansperformance-disclaimer-2026-10-05.md");
  });

  it("applies ruling R3: Pages sites with only role addresses are CONDITIONAL_MET, one with a named individual's address stays CONDITIONAL_UNMET", () => {
    // The premise of the UNMET verdict: render-watch masks keys and tokens before it writes and commits a capture, never
    // an email address. If it ever learns to, this fails: the verdict moves to CONDITIONAL_MET in that fold (R3; §9).
    const page = Buffer.from("<p>Contact: organisers@example.org</p>", "utf8");
    expect(redactSecrets(page, "text/html").count).toBe(0);
    const v = verdicts();
    for (const site of NAMED_ADDRESSES) {
      expect(v[site].verdict, site).toBe("CONDITIONAL_UNMET");
      expect(v[site].note, site).toMatch(/^CONDITIONAL_UNMET \(tick 45 review/);
      expect(v[site].note, site).toContain("redact addresses before commit");
      expect(v[site].note, site).toContain("RULING-2026-10-04-mozilla-precondition.md §3 rule 3");
      expect(v[site].note, site).toContain("ruling R3");
      expect(v[site].note, site).toContain("named individuals' university addresses");
      expect(v[site].note, site).not.toMatch(/before (a capture is|it is) relied on/);
      for (const e of audited().filter((x) => siteOfUrl(x.url) === site)) {
        expect(termsGate(e.url, e.slug, v).ok, e.url).toBe(false);
      }
    }
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
    const lines = active();
    for (const [site, verdict] of Object.entries(AUDITED)) {
      if (verdict !== "NO_TERMS") continue;
      const mine = lines.filter((e) => siteOfUrl(e.url) === site);
      expect(isExhaustiveNegative(v[site]), site).toBe(true);
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
      expect(v[site].verdict, site).toBe("NO_TERMS");
      expect(v[site].note!.endsWith("(ruling R1, 5.10, TERMS-AUDIT-2026-10-05-prize-events.md)"), site).toBe(true);
      expect(v[site].note, site).not.toMatch(/until (that|the main thread's) ruling|is paused, not fetched/);
    }
    expect(Object.values(AUDITED).filter((x) => x === "NO_TERMS")).toHaveLength(21);
    expect(Object.keys(AUDITED).filter((s) => isExhaustiveNegative(v[s]))).toHaveLength(21);
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
    for (const e of audited()) {
      const site = siteOfUrl(e.url);
      const gate = termsGate(e.url, e.slug, v);
      const open = ["CONDITIONAL_MET", "NOT_BARRED"].includes(v[site].verdict);
      expect(gate.ok, `${site} ${e.url}`).toBe(open);
    }
    // The new lines pass the gate, so applying the verdicts pauses nothing.
    expect(applyVerdicts(readFileSync(URLS, "utf8"), v).paused).toEqual([]);
  });

  it("records the main thread's three rulings in the audit note, and the render groups add up to the 101 URLs over 45 sites", () => {
    const audit = readFileSync(AUDIT, "utf8");
    const at = audit.indexOf("## Main-thread rulings (5.10.2026, tick 45; Fable 5.1, the session model)");
    expect(at).toBeGreaterThan(-1);
    expect(at).toBeLessThan(audit.indexOf("## Every URL the agents fetched"));
    for (const r of ["**R1. Exhaustive-negative does not require GitHub code search.**", "**R2. grand-challenge.org's terms URL.**", "**R3. Personal versus role addresses.**"]) {
      expect(audit.slice(at), r).toContain(r);
    }
    expect(audit).not.toContain("Waiting on a main-thread ruling");
    const total = audit.match(/^Total: ([\d + ]+) = (\d+) URLs, over ([\d + ]+) = (\d+) sites\.$/m);
    expect(total).not.toBeNull();
    const sum = (s: string) => s.split("+").reduce((a, b) => a + Number(b.trim()), 0);
    expect([sum(total![1]), Number(total![2]), sum(total![3]), Number(total![4])]).toEqual([101, 101, 45, 45]);
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
