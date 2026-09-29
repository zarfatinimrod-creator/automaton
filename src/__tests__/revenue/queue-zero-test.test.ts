import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as render-watch.mjs)
import { MIN_TERMS_TEXT, queueZeroTest, siteOf, URLS, ZERO_TESTS } from "../../../scripts/queue-zero-test.mjs";
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
  // automated access, exactly as for a plain GET". The script checks that the capture is a real read of the target
  // site's terms; that they do not bar automated access is for the person who read them.
  const TERMS_TEXT = "Terms of Service. ".repeat(100); // 1,800 characters, a stand-in for a real terms page
  type Capture = { meta: Record<string, unknown>; text: string };
  const good = (url = "https://c.example/legal/terms"): Capture => ({
    meta: { url, status: 200, error: null },
    text: TERMS_TEXT,
  });
  const captures: Record<string, Capture> = { "c-terms": good() };
  const jsBase = { ...base, js: true, terms: "c-terms", termsCapture: (slug: string) => captures[slug] ?? null };

  it("writes the js flag as the third field and names the terms capture in the comment", () => {
    const out = queueZeroTest(jsBase);
    expect(out.urls.endsWith(
      "# research/channel-loop/ZERO-TESTS.md row 3 — C (3): a new page (28.9.2026). " +
        "JS render; terms read at research/rendered/c-terms.txt.\nhttps://c.example/3\tc-three\tjs\n",
    )).toBe(true);
    const last = parseUrlList(out.urls).at(-1);
    expect(last).toEqual({ url: "https://c.example/3", slug: "c-three", lineNumber: expect.any(Number), js: true });
  });

  it("leaves a plain line exactly as before: no flag, no terms note", () => {
    const out = queueZeroTest({ ...base, termsCapture: () => null });
    expect(out.urls.endsWith("(28.9.2026).\nhttps://c.example/3\tc-three\n")).toBe(true);
  });

  it("refuses --js without --terms, and --terms without --js", () => {
    expect(() => queueZeroTest({ ...jsBase, terms: undefined })).toThrow(/--js needs --terms/);
    expect(() => queueZeroTest({ ...base, terms: "c-terms", termsCapture: () => good() })).toThrow(/--terms is only for a --js line/);
  });

  it("refuses --js when the terms were never rendered", () => {
    expect(() => queueZeroTest({ ...jsBase, terms: "never-rendered" })).toThrow(
      /no capture at research\/rendered\/never-rendered\.txt/,
    );
  });

  it("refuses a terms slug that is not a plain capture name", () => {
    for (const terms of ["../secrets", "a/b", "Upper", ""]) {
      expect(() => queueZeroTest({ ...jsBase, terms, termsCapture: () => good() }), terms).toThrow(/terms/);
    }
  });

  it("refuses urls.txt itself, and the slug of the line being queued", () => {
    expect(() => queueZeroTest({ ...jsBase, terms: "urls", termsCapture: () => good() })).toThrow(/URL list itself/);
    expect(() => queueZeroTest({ ...jsBase, terms: "c-three", termsCapture: () => good() })).toThrow(/slug of the line being queued/);
  });

  it("refuses a capture that failed: an error, a non-2xx status, or no status", () => {
    for (const meta of [
      { url: "https://c.example/legal/terms", status: 403, error: "HTTP 403 Forbidden" },
      { url: "https://c.example/legal/terms", status: null, error: "timeout after 30000ms (AbortError)" },
      { url: "https://c.example/legal/terms", status: 404, error: null },
      { url: "https://c.example/legal/terms", error: null },
    ]) {
      expect(() => queueZeroTest({ ...jsBase, termsCapture: () => ({ meta, text: TERMS_TEXT }) }), JSON.stringify(meta)).toThrow(
        /not a successful capture/,
      );
    }
  });

  it("refuses a capture whose text is an empty JavaScript shell (Trolley's came back with 70 characters)", () => {
    const shell = "Trolley Help Center\n\nLoading\n× Sorry to interrupt CSS Error\n\nRefresh\n";
    expect(() => queueZeroTest({ ...jsBase, termsCapture: () => ({ ...good(), text: shell }) })).toThrow(
      new RegExp(`fewer than ${MIN_TERMS_TEXT}.*empty JavaScript shell`),
    );
    expect(() => queueZeroTest({ ...jsBase, termsCapture: () => ({ ...good(), text: " ".repeat(5000) }) })).toThrow(/0 characters/);
  });

  it("refuses a capture of the target page itself", () => {
    expect(() => queueZeroTest({ ...jsBase, termsCapture: () => good("https://c.example/3") })).toThrow(/itself, not of its site's terms/);
  });

  it("refuses another site's terms, accepts the same registrable domain, and accepts a recorded exception", () => {
    expect(() => queueZeroTest({ ...jsBase, termsCapture: () => good("https://other.example/terms") })).toThrow(
      /captured from other\.example \(site other\.example\), not from the target's site c\.example/,
    );
    // A subdomain of the same site is the same site (GameDistribution keeps its terms on static.gamedistribution.com).
    expect(queueZeroTest({ ...jsBase, termsCapture: () => good("https://static.c.example/terms.html") }).row).toBe(3);
    // A site that keeps its terms elsewhere is allowed only when TERMS_ELSEWHERE records it.
    const elsewhere = { "c.example": ["legal-host.example"] };
    expect(
      queueZeroTest({ ...jsBase, termsElsewhere: elsewhere, termsCapture: () => good("https://legal-host.example/c/terms") }).row,
    ).toBe(3);
  });

  it("checks the capture on disk by default — the three refusals the review found, and one that passes", () => {
    const trolley = { ...base, js: true, url: "https://support.trolley.com/s/article/Identity-Verification", slug: "trolley-idv-js" };
    // urls.txt is the list itself; GameDistribution's terms are another site's; the target's own shell is 68 characters.
    expect(() => queueZeroTest({ ...trolley, terms: "urls" })).toThrow(/URL list itself/);
    expect(() => queueZeroTest({ ...trolley, terms: "gamedistribution-developer-terms" })).toThrow(/not from the target's site trolley\.com/);
    expect(() => queueZeroTest({ ...trolley, terms: "trolley-identity-verification" })).toThrow(/empty JavaScript shell/);
    expect(() => queueZeroTest({ ...trolley, terms: "no-such-capture-anywhere" })).toThrow(/no capture/);
    // GameDistribution's developer terms (static.gamedistribution.com) do clear a gamedistribution.com page.
    const gd = { ...base, js: true, url: "https://gamedistribution.com/developers/faq/x/", slug: "gd-x-js" };
    expect(queueZeroTest({ ...gd, terms: "gamedistribution-developer-terms" }).row).toBe(3);
  });

  it("queues a Salesforce help-centre page with --js — the shell a plain GET cannot read is the point of the mode", () => {
    const url = "https://support.c.example/s/article/Identity-Verification";
    expect(() => queueZeroTest({ ...base, url })).toThrow(/cannot render/);
    expect(queueZeroTest({ ...jsBase, url }).urls).toContain(`${url}\tc-three\tjs\n`);
  });

  it("never queues a tiktok.com URL, with or without --js", () => {
    for (const url of ["https://www.tiktok.com/@someone", "https://vm.tiktok.com/x/"]) {
      expect(() => queueZeroTest({ ...base, url })).toThrow(/tiktok\.com/);
      expect(() => queueZeroTest({ ...jsBase, url, termsCapture: () => good("https://www.tiktok.com/legal/terms") })).toThrow(
        /tiktok\.com/,
      );
    }
  });
});

describe("siteOf — the site a terms capture must share with its target", () => {
  it("is the last two labels, three under a country code's second level, one deeper on a shared host", () => {
    expect(siteOf("support.trolley.com")).toBe("trolley.com");
    expect(siteOf("static.gamedistribution.com")).toBe("gamedistribution.com");
    expect(siteOf("Trolley.COM.")).toBe("trolley.com");
    expect(siteOf("a.example.co.il")).toBe("example.co.il");
    expect(siteOf("www.gov.il")).toBe("www.gov.il");
    expect(siteOf("n8n.notion.site")).toBe("n8n.notion.site");
    expect(siteOf("docs.n8n.notion.site")).toBe("n8n.notion.site");
    expect(siteOf("acme.my.site.com")).toBe("acme.my.site.com");
    expect(siteOf("someone.github.io")).not.toBe(siteOf("other.github.io"));
  });
});
