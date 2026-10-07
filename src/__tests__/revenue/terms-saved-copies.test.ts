import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The terms texts saved under research/channel-loop/terms/ are what verdicts in terms-verdicts.json cite by file:line at
 * github grade (tick 36 item 3, Apify; tick 40, PostHog). Each file's header states the sha256 of what it holds; nothing
 * checked that statement until tick 40. Two forms exist:
 *
 *   - a verbatim copy: the header's "Original file: N lines, M bytes, sha256 `H`" must describe the bytes after the
 *     "verbatim copy begins on the next line" marker exactly (Apify's two copies, Apache-2.0);
 *   - a pinned reference: the body is not copied, only the clauses a verdict relies on (PostHog's repo LICENSE:5-6
 *     asks that its pages not be duplicated or copied; the excerpts are verbatim copies too, so the header says what
 *     they copy, and whether a full evidence copy is allowed is the main thread's ruling). Each excerpt is a fenced
 *     block of original lines A-B, the range stated in its heading and in the marker above it with the block's sha256,
 *     so the block can be re-checked against a re-fetch at the pinned commit with `sed -n A,Bp | sha256sum`.
 *
 * A verdict that cites one of these files by line must land on quoted original text (the body, or inside an excerpt
 * block), never on the header.
 */

const DIR = "research/channel-loop/terms";
const VERDICTS = "research/channel-loop/terms-verdicts.json";
const sha256 = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
const files = () =>
  readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

const VERBATIM_MARKER = /^<!-- verbatim copy begins on the next line: original line N is line N\+(\d+) of this file; check with: tail -n \+(\d+) <this file> \| sha256sum -->$/;
const ORIGINAL = /^> - Original file: (\d+) lines, (\d+) bytes, sha256 `([0-9a-f]{64})`$/m;
const EXCERPT = /^<!-- excerpt: original lines (\d+)-(\d+), sha256 ([0-9a-f]{64}); the fenced block below is those lines, byte for byte -->$/;
/** The section heading over each excerpt, which states the same original range a second time. */
const HEADING = /^## .+ \(original lines (\d+)-(\d+)\)$/;

type Parsed = {
  kind: "verbatim" | "reference";
  lines: number;
  bytes: number;
  sha: string;
  /** 1-based line ranges of this file that are original text. */
  quoted: [number, number][];
};

/** Parse a saved terms file; throws with the reason when it is neither form or its own statements do not hold. */
function parse(name: string, raw: Buffer = readFileSync(join(DIR, name))): Parsed {
  const text = raw.toString("utf8");
  const lines = text.split("\n");
  const orig = text.match(ORIGINAL);
  if (!orig) throw new Error(`${name}: no "Original file: N lines, M bytes, sha256" header line`);
  const [n, m, h] = [Number(orig[1]), Number(orig[2]), orig[3]];
  const commit = text.match(/^> - Commit SHA: `([0-9a-f]{40})`/m);
  if (!commit) throw new Error(`${name}: no pinned 40-hex commit SHA in the header`);
  if (!text.includes(`https://raw.githubusercontent.com/`) || !text.includes(`/${commit[1]}/`)) {
    throw new Error(`${name}: the fetch URL does not name the pinned commit ${commit[1]}`);
  }
  const markerAt = lines.findIndex((l) => VERBATIM_MARKER.test(l));
  const reference = text.includes("**The body is not copied here.**");
  if ((markerAt >= 0) === reference) throw new Error(`${name}: must be exactly one of a verbatim copy or a pinned reference`);

  if (markerAt >= 0) {
    const [, offset, tailFrom] = lines[markerAt].match(VERBATIM_MARKER)!.map(Number);
    if (offset !== markerAt + 1 || tailFrom !== markerAt + 2) {
      throw new Error(`${name}: the marker says the body starts at line ${tailFrom} (offset ${offset}), but it starts at ${markerAt + 2}`);
    }
    // The body is every byte after the marker line's newline.
    const headerBytes = Buffer.byteLength(lines.slice(0, markerAt + 1).join("\n") + "\n", "utf8");
    const body = raw.subarray(headerBytes);
    const bodyLines = body.toString("utf8").split("\n");
    const counted = bodyLines.at(-1) === "" ? bodyLines.length - 1 : bodyLines.length;
    if (sha256(body) !== h) throw new Error(`${name}: body sha256 ${sha256(body)} is not the header's ${h}`);
    if (body.length !== m) throw new Error(`${name}: body is ${body.length} bytes, the header says ${m}`);
    if (counted !== n) throw new Error(`${name}: body has ${counted} lines, the header says ${n}`);
    return { kind: "verbatim", lines: n, bytes: m, sha: h, quoted: [[markerAt + 2, markerAt + 1 + n]] };
  }

  const quoted: [number, number][] = [];
  let last = 0;
  for (let i = 0; i < lines.length; i++) {
    const e = lines[i].match(EXCERPT);
    if (!e) continue;
    const [a, b, eh] = [Number(e[1]), Number(e[2]), e[3]];
    if (!(a >= 1 && b >= a && b <= n)) throw new Error(`${name}:${i + 1}: excerpt ${a}-${b} is outside the original's ${n} lines`);
    if (a <= last) throw new Error(`${name}:${i + 1}: excerpt ${a}-${b} overlaps or precedes the previous one (ended ${last})`);
    let above = i - 1;
    while (above >= 0 && lines[above].trim() === "") above--;
    const heading = (lines[above] ?? "").match(HEADING);
    if (!heading) throw new Error(`${name}:${i + 1}: no "## … (original lines A-B)" heading above the marker`);
    if (Number(heading[1]) !== a || Number(heading[2]) !== b) {
      throw new Error(`${name}:${i + 1}: the heading above says original lines ${heading[1]}-${heading[2]}, the marker ${a}-${b}`);
    }
    if (!/^```[a-z]*$/.test(lines[i + 1] ?? "")) throw new Error(`${name}:${i + 2}: the excerpt marker is not followed by a fence`);
    const start = i + 2;
    const end = lines.indexOf("```", start);
    if (end < 0) throw new Error(`${name}:${i + 1}: unclosed excerpt block`);
    const block = lines.slice(start, end);
    if (block.length !== b - a + 1) throw new Error(`${name}:${i + 1}: block has ${block.length} lines, the marker says ${b - a + 1}`);
    const got = sha256(block.join("\n") + "\n");
    if (got !== eh) throw new Error(`${name}:${i + 1}: block sha256 ${got} is not the marker's ${eh}`);
    quoted.push([start + 1, end]);
    last = b;
    i = end;
  }
  if (!quoted.length) throw new Error(`${name}: a pinned reference with no excerpt`);
  return { kind: "reference", lines: n, bytes: m, sha: h, quoted };
}

describe("saved terms texts (research/channel-loop/terms/) hold what their headers say", () => {
  it("has the Apify copies, the PostHog references and the tick-45 prize-event texts, one form each", () => {
    const kinds = Object.fromEntries(files().map((f) => [f, parse(f).kind]));
    expect(kinds).toEqual({
      "ansperformance-disclaimer-2026-10-05.md": "reference",
      "apify-acceptable-use-policy-2026-10-04.md": "verbatim",
      "apify-general-terms-2026-10-04.md": "verbatim",
      "codabench-privacy-and-terms-2026-10-05.md": "verbatim",
      "github-acceptable-use-policies-2026-10-05.md": "verbatim",
      "github-terms-of-service-2026-10-05.md": "verbatim",
      "openreview-terms-of-use-2026-10-05.md": "verbatim",
      "posthog-privacy-2026-10-04.md": "reference",
      "posthog-terms-2026-10-04.md": "reference",
      // Tick 61: the YouTube API Services Terms, quoting only the cited clauses (the last block below).
      "youtube-api-services-terms-2026-10-07.md": "reference",
    });
  });

  it("recomputes every verbatim body's sha256, bytes and lines against its header", () => {
    for (const f of files()) {
      expect(() => parse(f), f).not.toThrow();
    }
    expect(parse("apify-general-terms-2026-10-04.md").sha).toBe("fc3654fb5ac2d2ea09491e4696eb935984fda2811ad6ec82a353312f96683f33");
    expect(parse("apify-acceptable-use-policy-2026-10-04.md").sha).toBe("1254efe29b1d446631592ba1e456d75f75bd4b653b381d2a4de18e9a1629b56c");
  });

  it("pins PostHog's pages to one commit and records why the body is not copied", () => {
    for (const f of ["posthog-terms-2026-10-04.md", "posthog-privacy-2026-10-04.md"]) {
      const text = readFileSync(join(DIR, f), "utf8");
      expect(text, f).toContain("Commit SHA: `35fc817dfc2b7ed21d59504e349d1f47616edb10`");
      expect(text, f).toContain('"Please do not duplicate, copy, or use our website for commercial or non-commercial use." (LICENSE:5-6)');
    }
    expect(parse("posthog-terms-2026-10-04.md").sha).toBe("cc34fd5bed10c4ad1c74dff6bc2c7a5625ebc760b4e60b94854d9fdeba807bca");
    expect(parse("posthog-privacy-2026-10-04.md").sha).toBe("4d4795166a37daf5ec39e935d10fd63dab1d127ab1db5368f0a687efd5c74abc");
  });

  it("does not claim the excerpts escape the licence line: it counts what they copy and leaves a full copy to the main thread", () => {
    // Tick 40 review, defect 8: LICENSE:5-6 makes no whole/part distinction, and the excerpts copy original lines
    // verbatim, so "a verbatim copy is what the licence asks us not to make" cannot be the whole reason. The header
    // says what the excerpts copy, counted here from the markers, and that a full evidence copy is the main thread's call.
    for (const f of ["posthog-terms-2026-10-04.md", "posthog-privacy-2026-10-04.md"]) {
      const text = readFileSync(join(DIR, f), "utf8");
      const p = parse(f);
      const copied = [...text.matchAll(new RegExp(EXCERPT.source, "gm"))].reduce((n, m) => n + Number(m[2]) - Number(m[1]) + 1, 0);
      const stated = text.match(/^> - \*\*The body is not copied here\.\*\* .*?(\d+) of the ([\d,]+) original lines are quoted below/m);
      expect(stated, f).not.toBeNull();
      expect(Number(stated![1]), f).toBe(copied);
      expect(Number(stated![2].replace(/,/g, "")), f).toBe(p.lines);
      expect(text, f).toContain("The licence line draws no line between a whole copy and a part");
      expect(text, f).toContain("whether it allows a full evidence copy here is the main thread's ruling");
      expect(text, f).not.toContain("is what that licence line asks us not to make");
    }
  });

  it("lands every file:line a verdict cites in these files on quoted original text, not on a header", () => {
    const verdicts = readFileSync(VERDICTS, "utf8");
    const cite = /research\/channel-loop\/terms\/([a-z0-9-]+\.md):(\d+)(?:-(\d+))?/g;
    const parsed = new Map(files().map((f) => [f, parse(f)]));
    const bad: string[] = [];
    let n = 0;
    for (const m of verdicts.matchAll(cite)) {
      n++;
      const [token, f, a, b] = [m[0], m[1], Number(m[2]), Number(m[3] ?? m[2])];
      const p = parsed.get(f);
      if (!p) {
        bad.push(`${token}: no such saved file`);
        continue;
      }
      if (!p.quoted.some(([s, e]) => a >= s && b <= e)) bad.push(`${token}: not inside quoted original text ${JSON.stringify(p.quoted)}`);
    }
    expect(bad).toEqual([]);
    expect(n).toBeGreaterThanOrEqual(10);
  });

  it("refuses a body or an excerpt changed by one byte, and a header that states another hash", () => {
    // The parser on tampered copies of the real files: the guard must be able to fail.
    const apify = readFileSync(join(DIR, "apify-general-terms-2026-10-04.md"), "utf8");
    const swap = (t: string, a: string, b: string) => {
      expect(t).toContain(a);
      return Buffer.from(t.replace(a, b), "utf8");
    };
    expect(() => parse("x.md", swap(apify, "Effective date: July 9, 2026", "Effective date: July 9, 2027"))).toThrow(/body sha256/);
    expect(() => parse("x.md", swap(apify, "sha256 `fc3654fb", "sha256 `fc3654fc"))).toThrow(/body sha256/);
    expect(() => parse("x.md", swap(apify, "Original file: 251 lines", "Original file: 250 lines"))).toThrow(/lines, the header says 250/);
    expect(() => parse("x.md", swap(apify, "line N+13 of this file", "line N+12 of this file"))).toThrow(/the marker says the body starts/);
    expect(() => parse("x.md", swap(apify, "<!-- verbatim copy begins", "<!-- copy begins"))).toThrow(/exactly one of/);

    const terms = readFileSync(join(DIR, "posthog-terms-2026-10-04.md"), "utf8");
    expect(() => parse("y.md", swap(terms, "PostHog Cloud</b>\"). Separate", "PostHog Cloud</b>\"); Separate"))).toThrow(/block sha256/);
    // Heading and marker shortened together: the heading check agrees, and the block's length does not.
    const shorter = swap(swap(terms, "(original lines 327-355)", "(original lines 327-354)").toString("utf8"), "original lines 327-355, sha256", "original lines 327-354, sha256");
    expect(() => parse("y.md", shorter)).toThrow(/block has 29 lines, the marker says 28/);
    expect(() => parse("y.md", swap(terms, "**The body is not copied here.**", "The body is not copied here."))).toThrow(/exactly one of/);
    expect(() => parse("y.md", swap(terms, "Commit SHA: `35fc817d", "Commit SHA: `35fc817e"))).toThrow(/does not name the pinned commit/);
    // Tick 40 review, defect 7: a marker's original line range shifted with the block unchanged passed every check
    // above (the block's sha256 and length do not know where the lines came from). The section heading states the
    // range a second time; the two must agree, so a one-sided edit of either fails. A full re-check of the numbers
    // still needs a re-fetch at the pinned commit.
    expect(() => parse("y.md", swap(terms, "<!-- excerpt: original lines 948-973, sha256", "<!-- excerpt: original lines 949-974, sha256"))).toThrow(
      /the heading above says original lines 948-973, the marker 949-974/,
    );
    expect(() => parse("y.md", swap(terms, "## 6.1 Fees (original lines 948-973)", "## 6.1 Fees (original lines 948-974)"))).toThrow(
      /the heading above says original lines 948-974, the marker 948-973/,
    );
    expect(() => parse("y.md", swap(terms, "## 6.1 Fees (original lines 948-973)", "## 6.1 Fees"))).toThrow(/no "## … \(original lines A-B\)" heading above the marker/);
  });
});

/**
 * Tick 40 (4.10.2026, logs/CHANNEL_LOOP.md §9 "Queued 4.10 (tick 39)" item 1): posthog.com's verdict, read from the
 * pinned references above. The verdict is about access; the storage caveat (the repo LICENSE's "do not duplicate,
 * copy") is why the references quote instead of copying, and it must stay in the note.
 */
describe("posthog.com's verdict rests on the pinned references", () => {
  const T = "research/channel-loop/terms/posthog-terms-2026-10-04.md";
  const P = "research/channel-loop/terms/posthog-privacy-2026-10-04.md";
  const v = () => JSON.parse(readFileSync(VERDICTS, "utf8")).sites["posthog.com"] as { verdict: string; source: string; checked: string; note: string };
  const lineOf = (file: string, n: number) => readFileSync(file, "utf8").split("\n")[n - 1];
  const linesOf = (file: string, a: number, b: number) =>
    readFileSync(file, "utf8")
      .split("\n")
      .slice(a - 1, b)
      .map((l) => l.trim())
      .join(" ");

  it("is NOT_BARRED, checked 4.10, sourced to both references at the pinned commit", () => {
    const e = v();
    expect(e.verdict).toBe("NOT_BARRED");
    expect(e.checked).toBe("2026-10-04");
    expect(e.source).toContain(T);
    expect(e.source).toContain(P);
    expect(e.source).toContain("35fc817dfc2b7ed21d59504e349d1f47616edb10");
    expect(e.source).toContain("(github grade)");
  });

  it("quotes clauses that are on the lines it cites", () => {
    const e = v();
    const cited: [string, number, number, string][] = [
      [T, 41, 43, "apply to any Customer (as defined below) accessing or using PostHog cloud-based software, products or services"],
      [T, 52, 52, "By signing up to, creating an account, using or otherwise accessing PostHog Cloud"],
      [T, 58, 58, "on a free or pay-as-you-go basis"],
      [T, 103, 104, "The Software and Other PostHog Materials are collectively referred to herein as the \" Licensed Materials\""],
      [T, 79, 80, "(a) internally (i) use"],
      [T, 86, 87, "the documentation, training materials or other materials, products or services supplied or provided by PostHog"],
      [T, 120, 121, "(a) use the Licensed Materials for any purpose other than as specifically authorized in"],
      [T, 125, 126, "otherwise make the Licensed Materials available to any third party other than Users"],
      [T, 108, 108, "end user (person or machine) of Customer"],
      [T, 129, 131, "(d) access or use the Licensed Materials in a manner intended to circumvent or exceed any usage limits"],
      [T, 131, 134, "(e) access or use the Licensed Materials to interfere with, disrupt, or attempt to gain unauthorized access to any systems"],
      [T, 148, 152, "(i) use the Licensed Materials for the purpose of monitoring their availability, performance, or functionality for benchmarking"],
      [T, 203, 203, "pleeeeeease don’t copy our website."],
      [T, 24, 25, "They're not legally binding."],
      [P, 42, 44, "applies to all visitors, users and customers of the PostHog.com hosted services and websites"],
      [P, 53, 55, "By accessing or using any part of the Websites"],
      [P, 74, 77, "PostHog automatically collects (i) technical information about your device including your device's internet protocol (IP) address"],
    ];
    for (const [file, a, b, text] of cited) {
      expect(e.note, `${file}:${a}`).toContain(`${file}:${a === b ? a : `${a}-${b}`}`);
      expect(linesOf(file, a, b).replace(/<\/?b>/g, ""), `${file}:${a}-${b}`).toContain(text);
    }
    // The original line numbers it names match the reference's marker: original 327 is the first line of the block.
    expect(e.note).toContain(`terms.tsx:328-330, ${T}:41-43`);
    expect(lineOf(T, 38)).toMatch(/^<!-- excerpt: original lines 327-355, sha256 [0-9a-f]{64};/);
    expect(lineOf(T, 39)).toBe("```tsx");
    // Tick 40 review, defect 1: the "Licensed Materials" definition (original 408-409) is quoted and cited, and the
    // old reading that 2.1 governs only the product, not reading the website, is gone: 2.1 reaches the documentation.
    expect(e.note).toContain(`terms.tsx:408-409, ${T}:103-104`);
    expect(lineOf(T, 100)).toMatch(/^<!-- excerpt: original lines 407-416, sha256 [0-9a-f]{64};/);
    expect(e.note).not.toContain("they govern use of the product, not reading the website");
    expect(e.note).toContain("so 2.1 reaches a Customer reading PostHog's documentation, not only its product");
  });

  it("keeps the storage caveat and sends the reader's API use to the free-tier note", () => {
    const e = v();
    expect(e.note).toMatch(/^no clause bars or conditions automated access to posthog\.com pages\./);
    expect(e.note).toContain("Open caveat, for storage and not access");
    expect(e.note).toContain("'Please do not duplicate, copy, or use our website'");
    expect(e.note).toContain("LICENSE:5-6 at 35fc817");
    // Tick 40 review, defect 1: the docs are MIT, and a Customer also holds them under 1.1(a)(ii) and 2.1(b); which one
    // governs a committed docs capture is the main thread's call, and the note says so instead of clearing the docs.
    expect(e.note).toContain("the docs under /contents/ are MIT (LICENSE:12-32), but a Customer holds the same documentation under 1.1(a)(ii)");
    expect(e.note).toContain("is the main thread's call, to make before the first posthog.com line is queued");
    expect(e.note).toContain("research/measurements/posthog-free-tier.md");
    expect(existsSync("research/measurements/posthog-free-tier.md")).toBe(true);
  });

  it("the free-tier note answers ruling (c)'s condition, with the announced pricing as its first REOPEN", () => {
    const note = readFileSync("research/measurements/posthog-free-tier.md", "utf8");
    expect(note).toContain('"the project and the query API stay on PostHog\'s free\ntier", is MET on the text**');
    expect(note).toContain("PostHog/posthog.com@4c27ff7578f24c75b40d1024e4e0cbd40c9922ba");
    expect(note).toContain("PostHog/posthog@526d64dd82340b1bf4293d6d9baea7e965997048");
    // The two places PostHog says the query API will be charged for, both cited in "What would reopen it".
    const reopen = note.slice(note.indexOf("**What would reopen it**"));
    expect(reopen).toContain("PC `sql/index.mdx:148`");
    expect(reopen).toContain("PC `endpoints-vs-query-api.mdx:16`");
    expect(reopen).toContain("not on the free plan");
  });
});

/**
 * Tick 45 (5.10.2026): the prize-event terms audit (research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md). The
 * GitHub-hosted texts the GitHub-hosted verdicts rest on are saved here: GitHub's Acceptable Use Policies and Terms of
 * Service (github/docs, CC BY 4.0) for the ten GitHub Pages sites, OpenReview's Terms of Use (AGPL-3.0), Codabench's
 * Privacy Policy and Terms of Use (Apache-2.0), all verbatim; and ansperformance.eu's disclaimer as a pinned reference,
 * because its repository has no licence and the notice's own copying condition is the one its verdict leaves unsettled.
 */
describe("the tick-45 prize-event texts", () => {
  const COPIES: [string, string, string, number][] = [
    ["github-acceptable-use-policies-2026-10-05.md", "2bd66de8cea336061c9ea060c9b37385136e6ab3", "8f22cce7e5e0dfe8555ea60ab5d960f8bd875142011a272a9b236f2fdb44cf8d", 129],
    ["github-terms-of-service-2026-10-05.md", "2bd66de8cea336061c9ea060c9b37385136e6ab3", "7e2a7a7317a8007c84b5a760f6d9c27796f24253d3257ef8cfa35733167a3d09", 432],
    ["openreview-terms-of-use-2026-10-05.md", "ed830e1aeeb91ca2606c1f905df2e1e18f150b0e", "f40c4bdc187d00033806430453e45602348165c127ef8ded472cec22f9ce6d5c", 960],
    ["codabench-privacy-and-terms-2026-10-05.md", "c3be81944cf3733605bcaf311562e472f3e45755", "77668db78774bb06b86315387c0ff5965d411983716a9691e5038f1829caafc7", 66],
    ["ansperformance-disclaimer-2026-10-05.md", "6a645289e4947d68af532852345efd5f646c5684", "a80515c1a07bd50d62a2f0758f769c4961b91b1b6d70edbd542deae6895123b8", 18],
  ];
  const verdicts = () => JSON.parse(readFileSync(VERDICTS, "utf8")).sites as Record<string, { verdict: string; source: string; checked: string; note: string }>;
  const lineOf = (file: string, n: number) => readFileSync(join(DIR, file), "utf8").split("\n")[n - 1];
  const linesOf = (file: string, a: number, b: number) =>
    readFileSync(join(DIR, file), "utf8")
      .split("\n")
      .slice(a - 1, b)
      .map((l) => l.trim())
      .join(" ");

  it("pins each text to its commit, sha256 and length, and says which licence allows the copy", () => {
    for (const [file, commit, sha, lines] of COPIES) {
      const text = readFileSync(join(DIR, file), "utf8");
      expect(text, file).toContain(`Commit SHA: \`${commit}\``);
      const p = parse(file);
      expect(p.sha, file).toBe(sha);
      expect(p.lines, file).toBe(lines);
    }
    for (const f of ["github-acceptable-use-policies-2026-10-05.md", "github-terms-of-service-2026-10-05.md"]) {
      expect(readFileSync(join(DIR, f), "utf8"), f).toContain('LICENSE:1 "Attribution 4.0 International"');
    }
    expect(readFileSync(join(DIR, "openreview-terms-of-use-2026-10-05.md"), "utf8")).toContain("GNU Affero General Public License, version 3 (LICENSE.md:1-2");
    expect(readFileSync(join(DIR, "codabench-privacy-and-terms-2026-10-05.md"), "utf8")).toContain("Apache License, Version 2.0 (LICENSE.TXT:1-2");
  });

  it("quotes only part of the unlicensed disclaimer, says how much, and leaves a full copy to the main thread", () => {
    const f = "ansperformance-disclaimer-2026-10-05.md";
    const text = readFileSync(join(DIR, f), "utf8");
    const copied = [...text.matchAll(new RegExp(EXCERPT.source, "gm"))].reduce((n, m) => n + Number(m[2]) - Number(m[1]) + 1, 0);
    const stated = text.match(/^> - \*\*The body is not copied here\.\*\* .*?: (\d+) of the (\d+) original lines are quoted below/m);
    expect(stated).not.toBeNull();
    expect(Number(stated![1])).toBe(copied);
    expect(Number(stated![2])).toBe(parse(f).lines);
    expect(copied).toBeLessThan(parse(f).lines);
    expect(text).toContain("> - Licence of the repo: none.");
    expect(text).toContain("Whether a full evidence copy is allowed here is the main thread's call.");
    // Original line 6 ends in a space; the excerpt keeps it, or the block's sha256 would not match.
    expect(lineOf(f, 27)).toBe("This data is published by EUROCONTROL for information purposes. ");
  });

  it("refuses a tampered tick-45 copy: a header hash, a body byte, an excerpt byte", () => {
    const aup = readFileSync(join(DIR, "github-acceptable-use-policies-2026-10-05.md"), "utf8");
    const swap = (t: string, a: string, b: string) => {
      expect(t).toContain(a);
      return Buffer.from(t.replace(a, b), "utf8");
    };
    expect(() => parse("x.md", swap(aup, "sha256 `8f22cce7", "sha256 `8f22cce8"))).toThrow(/body sha256/);
    expect(() => parse("x.md", swap(aup, "Researchers may use public, non-personal information", "Researchers may use public information"))).toThrow(/body sha256/);
    const ans = readFileSync(join(DIR, "ansperformance-disclaimer-2026-10-05.md"), "utf8");
    expect(() => parse("y.md", swap(ans, "may not be modified without prior written permission", "may be modified without prior written permission"))).toThrow(/block sha256/);
  });

  it("lands the verdicts' quotes on the saved lines they cite", () => {
    const v = verdicts();
    const cited: [string, string, number, number, string][] = [
      ["fomo26.github.io", "github-acceptable-use-policies-2026-10-05.md", 102, 102, "Researchers may use public, non-personal information from the Service for research purposes, only if any publications resulting from that research are [open access]"],
      ["fomo26.github.io", "github-acceptable-use-policies-2026-10-05.md", 82, 82, "excessive automated bulk activity"],
      ["fomo26.github.io", "github-acceptable-use-policies-2026-10-05.md", 96, 96, "You will not reproduce, duplicate, copy, sell, resell or exploit any portion of the Service"],
      ["lbl.gov", "github-terms-of-service-2026-10-05.md", 76, 76, "“User,” “You,” and “Your” refer to the individual person, company, or organization that has visited or is using the Website or Service"],
      ["openreview.net", "openreview-terms-of-use-2026-10-05.md", 35, 36, "By using OpenReview or any data, products or services accessible from OpenReview sites"],
      ["openreview.net", "openreview-terms-of-use-2026-10-05.md", 282, 282, "Creative Commons Public Domain Dedication (CC0 1.0)"],
      ["codabench.org", "codabench-privacy-and-terms-2026-10-05.md", 39, 39, "Any reproduction in whole or in part is prohibited without prior consent of its owner."],
      ["codabench.org", "codabench-privacy-and-terms-2026-10-05.md", 42, 42, "subject Codabench' network or servers to unreasonable traffic loads"],
      ["ansperformance.eu", "ansperformance-disclaimer-2026-10-05.md", 28, 28, "provided that EUROCONTROL is mentioned as the source and it is not used for commercial purposes (i.e. for financial gain)"],
    ];
    for (const [site, file, a, b, text] of cited) {
      const e = v[site];
      expect(e.checked, site).toBe("2026-10-05");
      expect(`${e.source} ${e.note}`, `${site} ${file}:${a}`).toContain(`${DIR}/${file}:${a === b ? a : `${a}-${b}`}`);
      expect(e.note, site).toContain(text);
      expect(linesOf(file, a, b), `${file}:${a}-${b}`).toContain(text);
    }
  });
});

/**
 * Tick 61 (7.10.2026; ruling 7.10 row 24 §2 decision 2): the YouTube API Services Terms of Service (Americas version) and
 * Developer Policies, read at github grade from Open Terms Archive's copy (OpenTermsArchive/vlopses-us-versions
 * `YouTube/Developer Terms.md` at commit 80db0630, pinned by sha256) by one Opus reader and one adversarial Opus verifier,
 * with googleapis.com's verdict (CONDITIONAL_UNMET, copying barred) the main thread's. The Terms bar redistributing any
 * portion of the Services, documentation included (OTA:661 with :799 (ii)), so this reference is held tighter than
 * PostHog's: each excerpt one clause of at most 12 original lines, under 150 lines in all, every range cited in the file's
 * own answers and verdict, and never original line 16, which carries the company's postal address. The original is not
 * in the repository: run with YT_TERMS_SOURCE=<the pinned download> to compare every quoted line with it; without it, the
 * marker hashes are what a re-fetch at the commit checks (parse() above recomputes them).
 */
describe("the YouTube API Services Terms (tick 61): a pinned reference that quotes only the cited clauses", () => {
  const F = "youtube-api-services-terms-2026-10-07.md";
  const PATH = join(DIR, F);
  const COMMIT = "80db0630dc36c1f2aa8006a11ea58033a8f67227";
  const SHA = "c7a393695817433568d36d7383702e546549b273a7d292e44d5d712eb32c01b1";
  const MAX_RANGE_LINES = 12;
  const MAX_QUOTED_LINES = 150;
  /** The original ranges quoted, in order: one is added or widened only by changing this list. */
  const RANGES: [number, number][] = [[1, 1], [13, 13], [46, 46], [48, 48], [57, 57], [59, 59], [76, 76], [81, 81], [86, 86], [134, 134], [156, 156], [163, 163], [165, 165], [241, 241], [245, 245], [286, 286], [295, 295], [302, 302], [303, 303], [324, 324], [340, 340], [342, 342], [346, 346], [348, 348], [358, 358], [360, 360], [433, 433], [437, 437], [448, 448], [450, 450], [457, 457], [490, 490], [498, 498], [510, 510], [516, 516], [538, 538], [550, 550], [576, 576], [578, 578], [582, 582], [584, 584], [596, 596], [598, 598], [602, 602], [606, 606], [608, 608], [610, 610], [613, 613], [659, 659], [661, 661], [692, 692], [694, 694], [757, 757], [774, 774], [781, 781], [783, 783], [787, 787], [789, 789], [793, 793], [795, 795], [797, 797], [799, 799], [801, 801], [1123, 1123], [1125, 1125], [1131, 1131], [1159, 1159], [1176, 1176]];
  /** The three title lines, quoted without a citation. */
  const TITLES = [1, 13, 286];
  /** A street number and name with its suffix, or a US state code and ZIP: the shapes of original line 16's address. */
  const STREET = /\b\d{2,5} [A-Z][a-z]+ (?:Ave|Avenue|St|Street|Rd|Road|Blvd|Boulevard|Dr|Drive|Way|Pkwy|Parkway)\b/;
  const ZIP = /\b[A-Z]{2} \d{5}\b/;
  const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/;
  const text = () => readFileSync(PATH, "utf8");
  /** The [A, B] original ranges the excerpt markers state, read from the markers alone. */
  const markers = (t: string) => [...t.matchAll(new RegExp(EXCERPT.source, "gm"))].map((m) => [Number(m[1]), Number(m[2])] as [number, number]);
  /** The file after its excerpts: the six answers, the verdict and the later-read list. */
  const prose = (t: string) => t.slice(t.indexOf("\n## The six answers"));

  it("exists, and is a pinned reference to Open Terms Archive's copy at the commit, its header stating the original's sha256", () => {
    expect(existsSync(PATH)).toBe(true);
    const p = parse(F);
    expect(p.kind).toBe("reference");
    expect([p.lines, p.bytes, p.sha]).toEqual([1270, 166101, SHA]);
    const t = text();
    expect(t).toContain(`> - Commit SHA: \`${COMMIT}\``);
    expect(t).toContain(`> - Raw file at that commit: https://raw.githubusercontent.com/OpenTermsArchive/vlopses-us-versions/${COMMIT}/YouTube/Developer%20Terms.md`);
    expect(t).toContain("> - Source repo: https://github.com/OpenTermsArchive/vlopses-us-versions (published by Open Terms Archive)");
    expect(t).toContain("> - Path: `YouTube/Developer Terms.md`, one Markdown file holding five documents");
    expect(t).toContain("the last (original line 1270) has no final newline, so `wc -l` counts 1,269");
    expect(t).toContain("Open Terms Archive's own repository licence was not read");
  });

  it("quotes each clause as at most 12 original lines and under 150 in all, as many as the header says", () => {
    const t = text();
    const r = markers(t);
    expect(r.filter(([a, b]) => b - a + 1 > MAX_RANGE_LINES)).toEqual([]);
    const total = r.reduce((n, [a, b]) => n + b - a + 1, 0);
    expect(total).toBeLessThan(MAX_QUOTED_LINES);
    const stated = t.match(/^> - \*\*The body is not copied here\.\*\* .*?: (\d+) of the ([\d,]+) original lines are quoted below, in (\d+) ranges, each range one clause/m);
    expect(stated).not.toBeNull();
    expect([Number(stated![1]), Number(stated![2].replace(/,/g, "")), Number(stated![3])]).toEqual([total, 1270, r.length]);
    expect(r).toEqual(RANGES);
    expect(total).toBe(68);
  });

  it("never quotes original line 16, and holds no postal or email address", () => {
    const t = text();
    expect(markers(t).filter(([a, b]) => a <= 16 && 16 <= b)).toEqual([]);
    expect(t).toContain("Original line 16 is never quoted: it carries the company's postal address");
    expect(t.split("\n").filter((l) => STREET.test(l) || ZIP.test(l) || EMAIL.test(l))).toEqual([]);
  });

  it("cites every quoted range in its own answers and verdict, the three titles aside", () => {
    const t = text();
    const cited = new Set([...prose(t).matchAll(/(?:\bOTA:|(?<![\w./`-]):)(\d+)/g)].map((m) => Number(m[1])));
    const uncited = markers(t).filter(([a, b]) => !TITLES.includes(a) && !Array.from({ length: b - a + 1 }, (_, i) => a + i).some((n) => cited.has(n)));
    expect(uncited).toEqual([]);
    expect(markers(t).filter(([a]) => TITLES.includes(a)).map(([a]) => a)).toEqual(TITLES);
  });

  it("answers the six questions as the verifier corrected them, quotes the verdict memo's eight conditions, and lists what a later read must settle", () => {
    const p = prose(text());
    for (const q of ["(i)", "(ii)", "(iii)", "(iv)", "(v)", "(vi)"]) expect(p, q).toContain(`\n**${q} `);
    expect(p.match(/\*\*Bearing:\*\*/g)).toHaveLength(6);
    // The verifier's corrections, each marked where the text does not say it in its own words.
    expect(p).toContain('An API key is an API Credential [inference: the document never uses the words "API key";');
    expect(p).toContain("[inference: git history is storage]");
    expect(p).toContain("that videos.list with part=id,status returns madeForKids and privacyStatus to a bare key is not in this document [inference until the first live read;");
    expect(p).toContain("and GitHub's secret store and the runner are such agents [inference: GitHub's terms on secrets were not read]");
    expect(p).toContain("On the literal words only, yes, and further than the brand account; the scope is unknown.");
    expect(p).toContain("**Bearing:** met by the main thread's ruling of tick 61 (not by any declaration before it)");
    expect(p).toContain("(i) is decided by (ii)");
    // The memo's eight conditions, in its words.
    const verdict = p.slice(p.indexOf("\n## Verdict\n"), p.indexOf("\n## What a later read must settle\n"));
    for (let n = 1; n <= 8; n++) expect(verdict, `condition ${n}`).toMatch(new RegExp(`\\n> ${n}\\. `));
    expect(verdict).toContain("> googleapis.com → verdict CONDITIONAL_UNMET; copying: barred (OTA:661");
    expect(verdict).toContain("> 6. exactly one API Project per API Client (OTA:448): ruled here — the colony is ONE API Client");
    const later = p.slice(p.indexOf("\n## What a later read must settle\n"));
    expect(later).toContain("the EMEA version (OTA:1125)");
    expect(later).toContain("(OTA:596 (ii)), the count fitting the example at OTA:598");
    expect(later).toContain("**The first live read.**");
  });

  it("is the source of googleapis.com's verdict, a file that exists", () => {
    const e = (JSON.parse(readFileSync(VERDICTS, "utf8")).sites as Record<string, { verdict: string; source: string; copying: string }>)["googleapis.com"];
    expect([e.verdict, e.copying]).toEqual(["CONDITIONAL_UNMET", "barred"]);
    const named = e.source.match(/^(research\/channel-loop\/terms\/[a-z0-9-]+\.md) \(/);
    expect(named?.[1]).toBe(PATH);
    expect(existsSync(named![1])).toBe(true);
  });

  it("matches the original line for line where the pinned download is at hand (YT_TERMS_SOURCE)", () => {
    // The original is not committed (copying is barred); a run with the download checks every quoted line against it.
    const src = process.env.YT_TERMS_SOURCE;
    if (!src) return;
    const raw = readFileSync(src);
    expect(sha256(raw)).toBe(SHA);
    const original = raw.toString("utf8").split("\n");
    expect(original).toHaveLength(1270);
    // The shapes the address check looks for are the ones original line 16 holds.
    expect(STREET.test(original[15]) && ZIP.test(original[15])).toBe(true);
    const lines = text().split("\n");
    let compared = 0;
    for (let i = 0; i < lines.length; i++) {
      const e = lines[i].match(EXCERPT);
      if (!e) continue;
      const [a, b] = [Number(e[1]), Number(e[2])];
      const block = lines.slice(i + 2, i + 2 + (b - a + 1));
      expect(block, `${a}-${b}`).toEqual(original.slice(a - 1, b));
      compared += block.length;
    }
    expect(compared).toBe(68);
  });
});
