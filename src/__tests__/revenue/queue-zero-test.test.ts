import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as render-watch.mjs)
import { MIN_TERMS_TEXT, applyVerdicts, loadVerdicts, overrideLines, queueZeroTest, siteOf, termsGate, URLS, ZERO_TESTS } from "../../../scripts/queue-zero-test.mjs";
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
  // The row mechanics are tested on example hosts with no terms verdict; the terms gate has its own tests below.
  verdicts: null,
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

describe("queue-zero-test --override (the render-watch dispatch lines for a row range)", () => {
  const row = (n: number, note: string) => `# research/channel-loop/ZERO-TESTS.md row ${n} — ${note} (29.9.2026).`;
  const LIST = [
    "# research/rendered/urls.txt — header",
    "https://old.example/x\told-x",
    row(10, "a plain page"),
    "https://a.example/10\ta-ten",
    row(11, "retired"),
    "# retired: wrong page — https://b.example/11\tb-eleven",
    row(12, "a js page"),
    "https://c.example/12\tc-twelve\tjs",
    row(13, "last"),
    "https://d.example/13\td-thirteen",
    "",
  ].join("\n");

  it("returns each row's own line in row order, keeps the js flag, and names retired rows", () => {
    expect(overrideLines(LIST, 10, 13)).toEqual({
      lines: ["https://a.example/10\ta-ten", "https://c.example/12\tc-twelve\tjs", "https://d.example/13\td-thirteen"],
      retired: [11],
    });
    expect(overrideLines(LIST, 12, 12).lines).toEqual(["https://c.example/12\tc-twelve\tjs"]);
  });

  it("never takes the next row's line for a retired row", () => {
    // Row 11 is retired: its search must stop at row 12's comment, not return row 12's URL.
    expect(overrideLines(LIST, 11, 12).lines).toEqual(["https://c.example/12\tc-twelve\tjs"]);
  });

  it("refuses a row missing from urls.txt, a backwards range, and a range that is all retired", () => {
    expect(() => overrideLines(LIST, 10, 14)).toThrow(/row 14 has no line/);
    expect(() => overrideLines(LIST, 13, 10)).toThrow(/not a row range/);
    expect(() => overrideLines(LIST, 0, 1)).toThrow(/not a row range/);
    expect(() => overrideLines(LIST, 11, 11)).toThrow(/every row is retired/);
  });

  it("re-parses the output with render-watch's parser, so a tiktok.com line can never reach a dispatch", () => {
    const bad = `${row(20, "x")}\nhttps://www.tiktok.com/@x\tx\n`;
    expect(() => overrideLines(bad, 20, 20)).toThrow();
  });

  it("finds the rows of the committed list, skipping rows paused by the terms audits", () => {
    const urls = readFileSync(URLS, "utf8");
    // Rows 188-190 are GitHub's docs, whose terms allow research use (research/channel-loop/terms-verdicts.json).
    const { lines, retired } = overrideLines(urls, 188, 190);
    expect(retired).toEqual([]);
    expect(lines.map((l: string) => l.split("\t")[1])).toEqual(["gh-docs-actions-billing", "gh-docs-rest-billing-usage", "gh-docs-rest-billing-budgets"]);
    expect(parseUrlList(lines.join("\n"))).toHaveLength(3);
    // Rows 174-179: three Gumroad rows (paused in tick 19) and three nevo rows (nevo's terms are unread, tick 21).
    expect(() => overrideLines(urls, 174, 179)).toThrow(/every row is retired/);
  });
});

describe("queue-zero-test's terms gate (research/channel-loop/terms-verdicts.json)", () => {
  const V = {
    "ok.example": { verdict: "NOT_BARRED" },
    "cond.example": { verdict: "CONDITIONAL_MET" },
    "pending.example": { verdict: "TERMS_PENDING" },
    "none.example": { verdict: "NO_TERMS" },
    "unmet.example": { verdict: "CONDITIONAL_UNMET" },
  };

  it("passes read-and-allowed sites and a pending site's own terms page, and nothing else", () => {
    expect(termsGate("https://www.ok.example/a", "ok-a", V).ok).toBe(true);
    expect(termsGate("https://cond.example/a", "cond-a", V).ok).toBe(true);
    expect(termsGate("https://pending.example/terms", "terms-pending", V).ok).toBe(true);
    expect(termsGate("https://pending.example/pricing", "pending-pricing", V)).toMatchObject({ ok: false, verdict: "TERMS_PENDING" });
    expect(termsGate("https://none.example/terms", "terms-none", V)).toMatchObject({ ok: false, verdict: "NO_TERMS" });
    expect(termsGate("https://unmet.example/a", "unmet-a", V)).toMatchObject({ ok: false, verdict: "CONDITIONAL_UNMET" });
    const unknown = termsGate("https://new-site.example/a", "new-a", V);
    expect(unknown).toMatchObject({ ok: false, verdict: null });
    expect(unknown.why).toMatch(/read its terms first/);
  });

  it("fails a TERMS_BARRED host whatever the verdict file says", () => {
    const gate = termsGate("https://www.paypal.com/il/x", "paypal-x", { "paypal.com": { verdict: "NOT_BARRED" } });
    expect(gate).toMatchObject({ ok: false, verdict: "BARRED", site: "paypal.com" });
  });

  it("makes queueZeroTest refuse a line the gate fails, with the reason, and accept one it passes", () => {
    expect(() => queueZeroTest({ ...base, url: "https://new-site.example/a", slug: "new-a", verdicts: V })).toThrow(/terms gate refuses .*read its terms first/);
    expect(queueZeroTest({ ...base, url: "https://ok.example/a", slug: "ok-a", verdicts: V }).row).toBe(3);
  });

  it("applies the verdicts to a list: comments out failing lines, keeps passing ones and comments", () => {
    const list = ["# a comment", "https://ok.example/a\tok-a", "https://none.example/b\tnone-b", "https://www.paypal.com/c\tpp-c", "https://pending.example/terms\tterms-pending", ""].join("\n");
    const out = applyVerdicts(list, V);
    expect(out.paused).toEqual(["none-b", "pp-c"]);
    const lines = out.urls.split("\n");
    expect(lines[1]).toBe("https://ok.example/a\tok-a");
    expect(lines[2]).toMatch(/^# paused \(terms unread\): none\.example is NO_TERMS/);
    expect(lines[3]).toMatch(/^# paused \(terms audit\): paypal\.com — see TERMS_BARRED/);
    expect(lines[4]).toBe("https://pending.example/terms\tterms-pending");
    // Applying twice changes nothing.
    expect(applyVerdicts(out.urls, V).paused).toEqual([]);
  });

  it("finds nothing to pause in the committed list: the committed verdicts and urls.txt agree", () => {
    expect(applyVerdicts(readFileSync(URLS, "utf8"), loadVerdicts()).paused).toEqual([]);
  });
});
