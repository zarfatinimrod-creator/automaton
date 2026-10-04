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
  it("has the Apify copies and the PostHog references, one form each", () => {
    const kinds = Object.fromEntries(files().map((f) => [f, parse(f).kind]));
    expect(kinds).toEqual({
      "apify-acceptable-use-policy-2026-10-04.md": "verbatim",
      "apify-general-terms-2026-10-04.md": "verbatim",
      "posthog-privacy-2026-10-04.md": "reference",
      "posthog-terms-2026-10-04.md": "reference",
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
