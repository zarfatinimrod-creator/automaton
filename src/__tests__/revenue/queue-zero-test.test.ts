import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as render-watch.mjs)
import { queueZeroTest, URLS, ZERO_TESTS } from "../../../scripts/queue-zero-test.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { parseUrlList } from "../../../scripts/render-watch.mjs";

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

  it("refuses a Salesforce help-centre page, which reaches the runner as an empty JavaScript shell", () => {
    for (const url of [
      "https://support.trolley.com/s/article/Identity-Verification",
      "https://help.example.com/s/topic/0TO000/payments",
      "https://acme.my.site.com/help",
      "https://acme.force.com/articles/x",
    ]) {
      expect(() => queueZeroTest({ ...base, url })).toThrow(/cannot render/);
    }
    // A plain page on the same host, or an /s/ path that is not a help-centre route, still queues.
    expect(queueZeroTest({ ...base, url: "https://support.trolley.com/terms" }).row).toBe(3);
    expect(queueZeroTest({ ...base, url: "https://c.example/s/shop" }).row).toBe(3);
  });
});

describe("queue-zero-test --js — a line for the JavaScript-capable render", () => {
  // The loop board (RULING-2026-09-29-loop.md (b)): "the target's terms must already be rendered and must not bar
  // automated access, exactly as for a plain GET". The script checks the first half; the reader of that capture, the second.
  const captured = new Set(["trolley-terms"]);
  const jsBase = { ...base, js: true, terms: "trolley-terms", termsCaptured: (slug: string) => captured.has(slug) };

  it("writes the js flag as the third field and names the terms capture in the comment", () => {
    const out = queueZeroTest(jsBase);
    expect(out.urls.endsWith(
      "# research/channel-loop/ZERO-TESTS.md row 3 — C (3): a new page (28.9.2026). " +
        "JS render; terms read at research/rendered/trolley-terms.txt.\nhttps://c.example/3\tc-three\tjs\n",
    )).toBe(true);
    const last = parseUrlList(out.urls).at(-1);
    expect(last).toEqual({ url: "https://c.example/3", slug: "c-three", lineNumber: expect.any(Number), js: true });
  });

  it("leaves a plain line exactly as before: no flag, no terms note", () => {
    const out = queueZeroTest({ ...base, termsCaptured: () => false });
    expect(out.urls.endsWith("(28.9.2026).\nhttps://c.example/3\tc-three\n")).toBe(true);
  });

  it("refuses --js without --terms, and --terms without --js", () => {
    expect(() => queueZeroTest({ ...jsBase, terms: undefined })).toThrow(/--js needs --terms/);
    expect(() => queueZeroTest({ ...base, terms: "trolley-terms", termsCaptured: () => true })).toThrow(/--terms is only for a --js line/);
  });

  it("refuses --js when the terms were never rendered", () => {
    expect(() => queueZeroTest({ ...jsBase, terms: "never-rendered" })).toThrow(
      /no capture at research\/rendered\/never-rendered\.txt/,
    );
  });

  it("refuses a terms slug that is not a plain capture name", () => {
    for (const terms of ["../secrets", "a/b", "Upper", ""]) {
      expect(() => queueZeroTest({ ...jsBase, terms, termsCaptured: () => true }), terms).toThrow(/terms/);
    }
  });

  it("checks the capture on disk by default", () => {
    // A real capture in research/rendered/ (the Algora terms, cited by no-algora-requests.test.ts).
    expect(queueZeroTest({ ...base, js: true, terms: "algora-terms" }).row).toBe(3);
    expect(() => queueZeroTest({ ...base, js: true, terms: "no-such-capture-anywhere" })).toThrow(/no capture/);
  });

  it("queues a Salesforce help-centre page with --js — the shell a plain GET cannot read is the point of the mode", () => {
    const url = "https://support.trolley.com/s/article/Identity-Verification";
    expect(() => queueZeroTest({ ...base, url })).toThrow(/cannot render/);
    expect(queueZeroTest({ ...jsBase, url }).urls).toContain(`${url}\tc-three\tjs\n`);
  });

  it("never queues a tiktok.com URL, with or without --js", () => {
    for (const url of ["https://www.tiktok.com/@someone", "https://vm.tiktok.com/x/"]) {
      expect(() => queueZeroTest({ ...base, url })).toThrow(/tiktok\.com/);
      expect(() => queueZeroTest({ ...jsBase, url })).toThrow(/tiktok\.com/);
    }
  });
});
