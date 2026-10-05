import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { buildAiAllowedTable } from "../../revenue/ai-allowed-events.js";
// @ts-expect-error — plain ESM script, no type declarations by design (same as queue-zero-test.mjs)
import { describeSelection, PRIZE_URLS, selectDispatchLines } from "../../../scripts/prize-dispatch.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { loadVerdicts, termsGate } from "../../../scripts/queue-zero-test.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { parseUrlList, termsBarred } from "../../../scripts/render-watch.mjs";

/**
 * scripts/prize-dispatch.mjs (logs/CHANNEL_LOOP.md §9, queued 5.10 by tick 45, item 2) prints the lines of
 * research/measurements/ai-allowed-events.urls.txt whose site passes termsGate: the text for render-watch.yml's `urls`
 * workflow_dispatch input. The whole file can never be pasted: render-watch's parser refuses its sites.google.com line,
 * and the rule of tick 20 (a site's terms are read before its first line is fetched) fails most of the rest. What it
 * must never do: print a line the gate refuses, print anything but the lines on stdout, add a js flag, or print a
 * line render-watch's own parser would refuse.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "prize-dispatch.mjs");
const PINNED = join(ROOT, "src", "__tests__", "revenue", "fixtures", "ai-allowed-events-548be52.urls.txt");

type Result = {
  lines: string[];
  read: number;
  passed: { url: string; slug: string; site: string; verdict: string; lineNumber: number }[];
  skipped: { slug: string; lineNumber: number }[];
  failures: { url: string; slug: string; site: string; why: string; lineNumber: number }[];
};
const select = (text: string, verdicts: unknown, opts?: Record<string, unknown>): Result => selectDispatchLines(text, verdicts, opts);

const VERDICTS: Record<string, Record<string, string>> = {
  "met.example": { verdict: "CONDITIONAL_MET", source: "test", checked: "2026-10-05" },
  "open.example": { verdict: "NOT_BARRED", source: "test", checked: "2026-10-05" },
  "pending.example": { verdict: "TERMS_PENDING", source: "terms URL known, text unread", checked: "2026-10-05" },
  "silent.example": { verdict: "NO_TERMS", source: "test", checked: "2026-10-05", note: "exhaustive-negative (every place searched, recorded)" },
  "plain.example": { verdict: "NO_TERMS", source: "test", checked: "2026-10-05", note: "not exhaustive-negative" },
  // A verdict can never let a TERMS_BARRED host through: render-watch's list wins.
  "google.com": { verdict: "NOT_BARRED", source: "test", checked: "2026-10-05" },
  "lbl.gov": { verdict: "CONDITIONAL_MET", source: "test", checked: "2026-10-05" },
};

const T = "\t";
const LIST = [
  "# test list — written by a test; do not edit by hand.",
  "#",
  "# 2026-Q4 · 2026-10-20 · Event A",
  `https://www.met.example/rules?ref=x${T}prize-met-a`,
  `https://open.example/challenge${T}prize-open-b`,
  "",
  "# 2026-Q4 · 2026-11-01 · Event B",
  `https://pending.example/rules${T}prize-pending-rules`,
  `https://pending.example/faq${T}prize-pending-faq`,
  `https://silent.example/rules${T}prize-silent-rules`,
  `https://plain.example/rules${T}prize-plain-rules`,
  `https://sites.google.com/view/x/home?ref=mlcontests${T}prize-google-x`,
  "   ",
  "# 2026-Q4 · 2026-12-01 · Event C",
  `https://fair-universe.lbl.gov/?ref=mlcontests${T}prize-lbl-fair`,
  `https://www.lbl.gov/challenge${T}prize-lbl-www`,
  `   https://met.example/second${T}prize-met-second   `,
  "",
].join("\r\n");

const URL_LINE = (l: string) => l.trim() !== "" && !l.trim().startsWith("#");

const PASSING = [
  `https://www.met.example/rules?ref=x${T}prize-met-a`,
  `https://open.example/challenge${T}prize-open-b`,
  `https://fair-universe.lbl.gov/?ref=mlcontests${T}prize-lbl-fair`,
  `https://met.example/second${T}prize-met-second`,
];

describe("selectDispatchLines — the lines whose site passes termsGate, verbatim, in file order", () => {
  it("prints URL<TAB>slug for every passing line and nothing else, from CRLF input with comments and blanks", () => {
    const out = select(LIST, VERDICTS);
    expect(out.lines).toEqual(PASSING);
    expect(out.read).toBe(10);
    expect(out.lines.every((l) => l.split("\t").length === 2)).toBe(true);
    expect(out.lines.some((l) => /[\r#]|\sjs$/.test(l))).toBe(false);
    expect(out.passed.map((p) => [p.site, p.verdict, p.lineNumber])).toEqual([
      ["met.example", "CONDITIONAL_MET", 4],
      ["open.example", "NOT_BARRED", 5],
      ["lbl.gov", "CONDITIONAL_MET", 15],
      ["met.example", "CONDITIONAL_MET", 17],
    ]);
  });

  it("never prints a TERMS_BARRED host, whatever the verdicts say", () => {
    const out = select(LIST, VERDICTS);
    expect(out.lines.some((l) => l.includes("google.com"))).toBe(false);
    expect(out.failures.find((f) => f.slug === "prize-google-x")).toMatchObject({ site: "google.com", why: expect.stringMatching(/TERMS_BARRED/) });
    // Even with every site in the list called NOT_BARRED.
    const all = Object.fromEntries(["google.com", "sites.google.com", "gumroad.com"].map((s) => [s, { verdict: "NOT_BARRED" }]));
    expect(select(`https://sites.google.com/view/a${T}a\nhttps://gumroad.com/l/x${T}b\n`, all).lines).toEqual([]);
  });

  it("fails a TERMS_PENDING site's rules lines (only a terms- slug would pass, and the intake writes none)", () => {
    const out = select(LIST, VERDICTS);
    const pending = out.failures.filter((f) => f.site === "pending.example");
    expect(pending.map((f) => f.slug)).toEqual(["prize-pending-rules", "prize-pending-faq"]);
    expect(pending[0].why).toMatch(/TERMS_PENDING/);
    // The gate's own exception, for contrast: the same site's terms page passes.
    expect(select(`https://pending.example/terms${T}terms-pending\n`, VERDICTS).lines).toEqual([`https://pending.example/terms${T}terms-pending`]);
  });

  it("fails NO_TERMS sites, exhaustive-negative or not, and a site with no verdict", () => {
    const out = select(`${LIST}https://unknown.example/x${T}prize-unknown\n`, VERDICTS);
    const why = (site: string) => out.failures.filter((f) => f.site === site).map((f) => f.why);
    expect(why("silent.example")).toEqual([expect.stringMatching(/exhaustive-negative/)]);
    expect(why("plain.example")).toEqual([expect.stringMatching(/NO_TERMS/)]);
    expect(why("unknown.example")).toEqual([expect.stringMatching(/no verdict/)]);
  });

  it("passes lbl.gov only on fair-universe.lbl.gov (PATH_LIMITS.hosts)", () => {
    const out = select(LIST, VERDICTS);
    expect(out.lines.filter((l) => l.includes("lbl.gov"))).toEqual([`https://fair-universe.lbl.gov/?ref=mlcontests${T}prize-lbl-fair`]);
    expect(out.failures.find((f) => f.slug === "prize-lbl-www")?.why).toMatch(/fair-universe\.lbl\.gov/);
  });

  it("agrees with termsGate on every line, and its output re-parses with render-watch's parser", () => {
    const out = select(LIST, VERDICTS);
    for (const l of out.lines) {
      const [url, slug] = l.split("\t");
      expect(termsGate(url, slug, VERDICTS).ok, l).toBe(true);
    }
    expect(out.passed.length + out.failures.length).toBe(out.read);
    expect((parseUrlList(`${out.lines.join("\n")}\n`) as { slug: string }[]).map((e) => e.slug)).toEqual(out.passed.map((p) => p.slug));
  });

  it("refuses a line with a third field (a flag), naming the line number", () => {
    const text = `# c\r\nhttps://met.example/a${T}prize-a\r\nhttps://met.example/b${T}prize-b${T}js\r\n`;
    expect(() => select(text, VERDICTS)).toThrow(/line 3\b.*third field/);
    // Even on a site that fails the gate: a js line must never come from an automatic filter.
    expect(() => select(`https://plain.example/b${T}prize-b${T}js\n`, VERDICTS)).toThrow(/line 1\b/);
  });

  it("refuses a line with no slug, naming the line number", () => {
    expect(() => select(`# c\nhttps://met.example/a\n`, VERDICTS)).toThrow(/line 2\b.*no slug/);
  });

  it("re-parses its output with render-watch's parser: a line it would refuse never reaches a dispatch", () => {
    // Two passing lines with one slug: render-watch would store one page over the other.
    expect(() => select(`https://met.example/a${T}prize-same\nhttps://open.example/b${T}prize-same\n`, VERDICTS)).toThrow(/already used/);
    // tiktok.com is refused by the parser itself, whatever a verdict says.
    expect(() => select(`https://www.tiktok.com/@a/contest${T}prize-tt\n`, { "tiktok.com": { verdict: "NOT_BARRED" } })).toThrow(/tiktok\.com/);
    // An unusable slug, and a flag where the slug should be.
    expect(() => select(`https://met.example/a${T}Prize_A!\n`, VERDICTS)).toThrow(/not usable as a file name/);
    expect(() => select(`https://met.example/a${T}js\n`, VERDICTS)).toThrow(/is a flag, not a slug/);
  });

  it("skips exactly the passing lines whose capture exists, only when asked", () => {
    const captured = new Set(["prize-open-b", "prize-lbl-fair", "prize-pending-rules"]);
    const captureExists = (slug: string) => captured.has(slug);
    const out = select(LIST, VERDICTS, { skipCaptured: true, captureExists });
    expect(out.lines).toEqual([PASSING[0], PASSING[3]]);
    expect(out.skipped.map((s) => s.slug)).toEqual(["prize-open-b", "prize-lbl-fair"]);
    expect(select(LIST, VERDICTS, { captureExists }).lines).toEqual(PASSING);
    expect(select(LIST, VERDICTS, { captureExists }).skipped).toEqual([]);
  });

  it("returns no lines when nothing passes", () => {
    const out = select(LIST, {});
    expect(out.lines).toEqual([]);
    expect(out.read).toBe(10);
    expect(out.failures).toHaveLength(10);
  });
});

describe("describeSelection — the stderr summary", () => {
  it("names each failing site once, with its count and the gate's why, sorted by count then name", () => {
    const text = describeSelection(select(LIST, VERDICTS), { source: "list.txt" }) as string[];
    expect(text[0]).toMatch(/read 10 line\(s\) of list\.txt: 4 pass the terms gate \(3 site\(s\)\), 6 fail/);
    const sites = text.filter((l) => /^ {2}fail /.test(l));
    expect(sites.map((l) => l.match(/^ {2}fail +(\S+) +(\d+):/)?.slice(1))).toEqual([
      ["pending.example", "2"],
      ["google.com", "1"],
      ["lbl.gov", "1"],
      ["plain.example", "1"],
      ["silent.example", "1"],
    ]);
    expect(sites[0]).toMatch(/TERMS_PENDING/);
    // Sites and reasons only: no line names a slug unless --why asks for the passing ones.
    const slugs = LIST.split("\r\n").filter(URL_LINE).map((l) => l.trim().split("\t")[1]);
    expect(slugs).toHaveLength(10);
    expect(text.filter((l) => slugs.some((slug) => l.includes(slug)))).toEqual([]);
  });

  it("with why, adds each passing line's site and verdict", () => {
    const text = describeSelection(select(LIST, VERDICTS), { source: "list.txt", why: true }) as string[];
    expect(text.filter((l) => /^ {2}pass /.test(l))).toEqual([
      "  pass  prize-met-a  met.example CONDITIONAL_MET",
      "  pass  prize-open-b  open.example NOT_BARRED",
      "  pass  prize-lbl-fair  lbl.gov CONDITIONAL_MET",
      "  pass  prize-met-second  met.example CONDITIONAL_MET",
    ]);
  });

  it("says how many were skipped as captured, and that nothing passes when nothing does", () => {
    const skipped = describeSelection(select(LIST, VERDICTS, { skipCaptured: true, captureExists: () => true }), { source: "l" }) as string[];
    expect(skipped.join("\n")).toMatch(/skipped 4 passing line\(s\) already captured/);
    expect(skipped.join("\n")).toMatch(/nothing to dispatch/);
    expect((describeSelection(select(LIST, {}), { source: "l" }) as string[]).join("\n")).toMatch(/nothing passes the terms gate/);
  });
});

// ---------------------------------------------------------------------------
// The CLI, through a child process on temporary files
// ---------------------------------------------------------------------------

const tmpDirs: string[] = [];
afterAll(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
});

function fixture(list: string, verdicts: unknown = VERDICTS) {
  const dir = mkdtempSync(join(tmpdir(), "prize-dispatch-test-"));
  tmpDirs.push(dir);
  const rendered = join(dir, "rendered");
  mkdirSync(rendered);
  writeFileSync(join(dir, "urls.txt"), list);
  writeFileSync(join(dir, "terms-verdicts.json"), JSON.stringify({ _about: "test", sites: verdicts }, null, 1));
  const run = (...args: string[]) =>
    spawnSync(
      process.execPath,
      [SCRIPT, "--urls", join(dir, "urls.txt"), "--verdicts", join(dir, "terms-verdicts.json"), "--rendered", rendered, ...args],
      { encoding: "utf8" },
    );
  return { dir, rendered, run };
}

describe("prize-dispatch CLI", () => {
  it("prints only the passing lines on stdout, newline-terminated, and the summary on stderr; exit 0", () => {
    const got = fixture(LIST).run();
    expect(got.status).toBe(0);
    expect(got.stdout).toBe(`${PASSING.join("\n")}\n`);
    expect(got.stderr).toMatch(/4 pass the terms gate/);
    expect(got.stderr).toMatch(/fail +pending\.example +2:/);
    expect(got.stderr).not.toMatch(/pass  prize-/);
  });

  it("--why adds each passing line's site and verdict on stderr, never on stdout", () => {
    const got = fixture(LIST).run("--why");
    expect(got.status).toBe(0);
    expect(got.stdout).toBe(`${PASSING.join("\n")}\n`);
    expect(got.stderr).toMatch(/pass  prize-lbl-fair  lbl\.gov CONDITIONAL_MET/);
  });

  it("--skip-captured omits a passing line whose <rendered>/<slug>.meta.json exists; without it, everything prints", () => {
    const f = fixture(LIST);
    writeFileSync(join(f.rendered, "prize-open-b.meta.json"), "{}\n");
    writeFileSync(join(f.rendered, "prize-met-second.txt"), "a text with no meta beside it\n");
    const skipping = f.run("--skip-captured");
    expect(skipping.status).toBe(0);
    expect(skipping.stdout).toBe(`${[PASSING[0], PASSING[2], PASSING[3]].join("\n")}\n`);
    expect(skipping.stderr).toMatch(/skipped 1 passing line\(s\) already captured/);
    expect(f.run().stdout).toBe(`${PASSING.join("\n")}\n`);
  });

  it("exits 3 with an empty stdout when the file was read but nothing passes", () => {
    const got = fixture(LIST, {}).run();
    expect(got.status).toBe(3);
    expect(got.stdout).toBe("");
    expect(got.stderr).toMatch(/nothing passes the terms gate/);
  });

  it("exits 1 with nothing on stdout on a third field, a parser refusal, a missing file or an unknown option", () => {
    const flagged = fixture(`https://met.example/a${T}prize-a${T}js\n`).run();
    expect(flagged.status).toBe(1);
    expect(flagged.stdout).toBe("");
    expect(flagged.stderr).toMatch(/line 1\b/);
    const duplicate = fixture(`https://met.example/a${T}prize-same\nhttps://open.example/b${T}prize-same\n`).run();
    expect(duplicate.status).toBe(1);
    expect(duplicate.stdout).toBe("");
    expect(duplicate.stderr).toMatch(/already used/);
    const f = fixture(LIST);
    expect(spawnSync(process.execPath, [SCRIPT, "--urls", join(f.dir, "missing.txt")], { encoding: "utf8" }).status).toBe(1);
    expect(f.run("--force").status).toBe(1);
    expect(f.run("extra-positional").status).toBe(1);
  });

  it("writes no file", () => {
    const f = fixture(LIST);
    const before = JSON.stringify([readFileSync(join(f.dir, "urls.txt"), "utf8"), readFileSync(join(f.dir, "terms-verdicts.json"), "utf8")]);
    f.run("--skip-captured", "--why");
    const after = JSON.stringify([readFileSync(join(f.dir, "urls.txt"), "utf8"), readFileSync(join(f.dir, "terms-verdicts.json"), "utf8")]);
    expect(after).toBe(before);
    expect(readdirSync(f.rendered)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The committed files. The list is rewritten every Wednesday and the verdicts change on Tuesdays: no pin to today's
// count here, only what must hold of any output.
// ---------------------------------------------------------------------------

describe("on the committed ai-allowed-events.urls.txt and terms-verdicts.json", () => {
  const text = readFileSync(PRIZE_URLS, "utf8");
  const verdicts = loadVerdicts();
  const out = select(text, verdicts);

  it("prints only lines of the file, verbatim, each passing termsGate and none on a TERMS_BARRED host", () => {
    const fileLines = new Set(text.split(/\r?\n/));
    for (const l of out.lines) {
      expect(fileLines.has(l), l).toBe(true);
      const [url, slug] = l.split("\t");
      expect(termsGate(url, slug, verdicts).ok, l).toBe(true);
      expect(termsBarred(new URL(url).hostname), l).toBeNull();
    }
    expect(out.lines.length).toBeLessThanOrEqual(text.split(/\r?\n/).filter(URL_LINE).length);
    if (out.lines.length) parseUrlList(`${out.lines.join("\n")}\n`);
  });

  it("the CLI with its defaults prints exactly that, exit 0, or nothing with exit 3", () => {
    const got = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8", cwd: tmpdir() });
    expect(got.status).toBe(out.lines.length ? 0 : 3);
    expect(got.stdout).toBe(out.lines.length ? `${out.lines.join("\n")}\n` : "");
    // The summary names the file from the repository root, so a tick log can cite it as it is.
    expect(got.stderr.split("\n")[0]).toBe(
      `prize-dispatch: read ${out.read} line(s) of research/measurements/ai-allowed-events.urls.txt: ` +
        `${out.lines.length} pass the terms gate (${new Set(out.passed.map((p) => p.site)).size} site(s)), ${out.failures.length} fail`,
    );
  });
});

/**
 * Pinned: the list at 548be52 (the fixture the tick-45 audit cites) with a frozen copy of the verdicts of the 11 sites
 * the audit cleared, as they stand on 5.10.2026 (research/channel-loop/terms-verdicts.json; only the fields termsGate
 * reads for these verdicts are copied — each entry's source and note are long and stay in that file). The expected
 * output is the 12 URLs of TERMS-AUDIT-2026-10-05-prize-events.md, "What the reading can render", in file order.
 */
const FROZEN_2026_10_05: Record<string, { verdict: string; checked: string }> = {
  "aimo-interp.github.io": { verdict: "CONDITIONAL_MET", checked: "2026-10-05" },
  "build-arena.github.io": { verdict: "CONDITIONAL_MET", checked: "2026-10-05" },
  "fomo26.github.io": { verdict: "CONDITIONAL_MET", checked: "2026-10-05" },
  "lbl.gov": { verdict: "CONDITIONAL_MET", checked: "2026-10-05" },
  "neural-interfaces26.github.io": { verdict: "CONDITIONAL_MET", checked: "2026-10-05" },
  "realpdecompetition.github.io": { verdict: "CONDITIONAL_MET", checked: "2026-10-05" },
  "robosyn-bench.net": { verdict: "CONDITIONAL_MET", checked: "2026-10-05" },
  "roco-spring.github.io": { verdict: "CONDITIONAL_MET", checked: "2026-10-05" },
  "szczurek-lab.github.io": { verdict: "CONDITIONAL_MET", checked: "2026-10-05" },
  "openreview.net": { verdict: "NOT_BARRED", checked: "2026-10-05" },
  "github.com": { verdict: "CONDITIONAL_MET", checked: "2026-09-29" },
};

describe("pinned: the 548be52 list with the verdicts of 5.10.2026", () => {
  it("prints exactly the 12 lines the tick-45 audit says the reading can render", () => {
    const out = select(readFileSync(PINNED, "utf8"), FROZEN_2026_10_05);
    expect(out.lines).toEqual([
      `https://fomo26.github.io/?ref=mlcontests${T}prize-fomo26-github-io-ref-mlcontests-414a9746`,
      `https://build-arena.github.io/ConstructionChallenge/${T}prize-build-arena-github-io-constructionchallenge-81a99e01`,
      `https://github.com/build-arena/BuildArena-2.0${T}prize-github-com-build-arena-buildarena-2-0-4d396616`,
      `https://openreview.net/forum?id=QAQKmIp3SZ${T}prize-openreview-net-forum-id-qaqkmip3sz-8896ce96`,
      `https://roco-spring.github.io/?ref=mlcontests${T}prize-roco-spring-github-io-ref-mlcontests-f530008a`,
      `https://szczurek-lab.github.io/amp-challenge-website/?ref=mlcontests${T}prize-szczurek-lab-github-io-amp-challenge-website-ref-084ef537`,
      `https://robosyn-bench.net/?ref=mlcontests${T}prize-robosyn-bench-net-ref-mlcontests-09bc8571`,
      `https://github.com/EDEM-AI/RoboSynChallenge${T}prize-github-com-edem-ai-robosynchallenge-e073c108`,
      `https://fair-universe.lbl.gov/?ref=mlcontests${T}prize-fair-universe-lbl-gov-ref-mlcontests-0704eef5`,
      `https://aimo-interp.github.io/?ref=mlcontests${T}prize-aimo-interp-github-io-ref-mlcontests-8a0c1de0`,
      `https://realpdecompetition.github.io/?ref=mlcontests${T}prize-realpdecompetition-github-io-ref-mlcontests-6315ee04`,
      `https://neural-interfaces26.github.io${T}prize-neural-interfaces26-github-io-041981fb`,
    ]);
    expect(out.read).toBe(101);
    expect(new Set(out.passed.map((p) => p.site)).size).toBe(11);
    // The google.com line is refused before any verdict is read (TERMS_BARRED), and is never in the output.
    expect(out.failures.find((f) => f.url.startsWith("https://sites.google.com/"))?.why).toMatch(/TERMS_BARRED/);
  });
});

/**
 * The instrument's own text (src/revenue/ai-allowed-events.ts) says to dispatch this script's output, never the whole
 * file, and the committed md and urls.txt carry the same sentences, so Wednesday's rewrite changes nothing there. The
 * md's preamble (everything before its "Reading:" line) and the urls.txt header (everything before "# Every URL is
 * verbatim") depend on no reading, so buildAiAllowedTable writes them from an empty list exactly as from a real one.
 */
describe("the instrument's text and the committed files agree on how the reading dispatches", () => {
  const built = buildAiAllowedTable({
    events: [],
    measuredAt: "2026-10-05T00:00:00Z",
    measuredOn: "2026-10-05",
    source: "https://example.org/competitions.json",
    sourceSha256: "0".repeat(64),
    existingMarkdown: null,
    captureExists: () => true,
  });
  const upTo = (text: string, stop: RegExp) => {
    const lines = text.split("\n");
    const at = lines.findIndex((l) => stop.test(l));
    expect(at).toBeGreaterThan(0);
    return lines.slice(0, at).join("\n");
  };

  it("the md's preamble is exactly what the builder writes, and step 1 names scripts/prize-dispatch.mjs", () => {
    const committed = upTo(readFileSync(join(ROOT, "research", "measurements", "ai-allowed-events.md"), "utf8"), /^Reading: /);
    expect(committed).toBe(upTo(built.markdown, /^Reading: /));
    const step1 = committed.split("\n").find((l) => l.startsWith("1. "));
    expect(step1).toContain("`node scripts/prize-dispatch.mjs` prints the lines");
    expect(step1).toMatch(/its output.*render-watch\.yml's `urls` input.*never the whole file/);
  });

  it("the urls.txt header is exactly what the builder writes, and says to dispatch the script's output", () => {
    const committed = upTo(readFileSync(PRIZE_URLS, "utf8"), /^# Every URL is verbatim/);
    expect(committed).toBe(upTo(built.urls, /^# Every URL is verbatim/));
    const flat = committed.replace(/\n# ?/g, " ");
    expect(flat).toContain("`node scripts/prize-dispatch.mjs` prints the lines whose site passes the terms gate");
    expect(flat).toMatch(/its output is what goes in render-watch\.yml's `urls` input/);
    expect(flat).not.toMatch(/paste these lines/);
  });
});
