import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as render-watch.mjs)
import { queueZeroTest, URLS, ZERO_TESTS } from "../../../scripts/queue-zero-test.mjs";

/**
 * scripts/queue-zero-test.mjs replaces the per-tick Python snippet that added a
 * ZERO-TESTS row and its urls.txt line. What it must never do: write a row with the
 * wrong column count (tick 6 did that by hand), number a row that already exists,
 * or put a URL or slug in the list twice.
 */
const TABLE = [
  "# Tests",
  "",
  "| # | Candidate (BOARD-LOOP rank) | Page | What the reading must settle |",
  "|---|---|---|---|",
  "| 1 | A | https://a.example/1 | one |",
  "| 2 | B | https://b.example/2 | two |",
  "",
  "Notes below the table.",
].join("\n");
const LIST = "# row 1\nhttps://a.example/1\ta-one\n# row 2\n# https://b.example/2\tb-two\n";
const base = {
  zeroTests: TABLE,
  urls: LIST,
  candidate: "C (3)",
  url: "https://c.example/3",
  slug: "c-three",
  settle: "whether it pays",
  note: "C (3): a new page",
  date: "28.9.2026",
};

describe("queue-zero-test", () => {
  it("numbers the row one past the highest, places it after that row, and appends the cited URL", () => {
    const out = queueZeroTest(base);
    expect(out.row).toBe(3);
    const lines = out.zeroTests.split("\n");
    expect(lines[lines.indexOf("| 2 | B | https://b.example/2 | two |") + 1]).toBe(
      "| 3 | C (3) | https://c.example/3 | whether it pays |",
    );
    expect(out.zeroTests).toContain("Notes below the table.");
    expect(out.urls.endsWith(
      "# research/channel-loop/ZERO-TESTS.md row 3 — C (3): a new page (28.9.2026).\nhttps://c.example/3\tc-three\n",
    )).toBe(true);
  });

  it("escapes a pipe inside a cell so the row keeps four columns", () => {
    const out = queueZeroTest({ ...base, settle: "fee | no fee" });
    expect(out.zeroTests).toContain("| 3 | C (3) | https://c.example/3 | fee \\| no fee |");
  });

  it("refuses a URL already listed, even commented out", () => {
    expect(() => queueZeroTest({ ...base, url: "https://b.example/2" })).toThrow(/already in urls.txt/);
  });

  it("refuses a duplicate slug through render-watch's own parser", () => {
    expect(() => queueZeroTest({ ...base, slug: "a-one" })).toThrow();
  });

  it("refuses an unusable slug, a non-http URL and an empty cell", () => {
    expect(() => queueZeroTest({ ...base, slug: "Bad Slug" })).toThrow(/slug/);
    expect(() => queueZeroTest({ ...base, url: "ftp://x" })).toThrow(/http/);
    expect(() => queueZeroTest({ ...base, settle: "  " })).toThrow(/empty/);
  });

  it("works on the real files without writing them (dry parse)", () => {
    const out = queueZeroTest({
      ...base,
      zeroTests: readFileSync(ZERO_TESTS, "utf8"),
      urls: readFileSync(URLS, "utf8"),
      url: "https://never-queued.example/",
      slug: "never-queued-example",
    });
    expect(out.row).toBeGreaterThan(60);
  });
});
