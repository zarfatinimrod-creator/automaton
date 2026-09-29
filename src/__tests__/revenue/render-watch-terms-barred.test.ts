import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design
import { TERMS_BARRED, fetchOne, parseUrlList, termsBarred } from "../../../scripts/render-watch.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { overrideLines } from "../../../scripts/queue-zero-test.mjs";

/**
 * Tick 19 (29.9.2026): Gumroad's rendered terms bar "any manual or automated software ... to
 * 'scrape' or download data from any web pages contained in the Services"
 * (research/rendered/gumroad-terms.txt:326). The runner had fetched thirteen Gumroad pages by
 * then, and the weekly schedule would have fetched them again. The TikTok pause's rule applies:
 * render-watch never fetches a site whose terms forbid it, from urls.txt, an override or a redirect.
 */
describe("render-watch refuses sites whose terms bar automated access", () => {
  it("names Gumroad first, citing the terms line that bars it, and the line says so", () => {
    expect(TERMS_BARRED[0].domain).toBe("gumroad.com");
    expect(TERMS_BARRED[0].why).toContain("gumroad-terms.txt:326");
    const terms = readFileSync("research/rendered/gumroad-terms.txt", "utf8").split("\n");
    expect(terms[325]).toMatch(/automated software.*"scrape" or download data from any web pages/);
  });

  it("matches the domain and every subdomain, ignoring case and a trailing dot, and nothing that only contains the name", () => {
    for (const h of ["gumroad.com", "www.gumroad.com", "WWW.Gumroad.COM.", "seller.gumroad.com", "api.gumroad.com"]) {
      expect(termsBarred(h), h).not.toBeNull();
    }
    for (const h of ["notgumroad.com", "gumroad.com.example.org", "example.com", "", undefined]) {
      expect(termsBarred(h), String(h)).toBeNull();
    }
  });

  it("refuses a Gumroad line at parse time, plain or js, so neither urls.txt nor an override can reach it", () => {
    expect(() => parseUrlList("https://gumroad.com/help/article/46-x\tgumroad-x\n")).toThrow(/gumroad\.com.*terms/);
    expect(() => parseUrlList("https://www.gumroad.com/terms\tgt\tjs\n")).toThrow(/gumroad-terms\.txt:326/);
    expect(() => parseUrlList("https://notgumroad.com/a\tng\n")).not.toThrow();
  });

  it("does not follow a redirect to Gumroad, and never requests it", async () => {
    const requested: string[] = [];
    const fetchImpl = async (url: string) => {
      requested.push(url);
      if (url === "https://short.example/x") {
        return { status: 302, ok: false, headers: { get: (k: string) => (k === "location" ? "https://Seller.Gumroad.com/l/pro" : null) } };
      }
      throw new Error(`unexpected request ${url}`);
    };
    const out = await fetchOne({ url: "https://short.example/x", slug: "x" }, { fetchImpl, timeoutMs: 1000 });
    expect(requested).toEqual(["https://short.example/x"]);
    expect(out.status).toBe(302);
    expect(out.error).toMatch(/redirected to gumroad\.com \(seller\.gumroad\.com\), whose terms bar automated access; not followed/);
  });

  it("leaves no active Gumroad line in the committed urls.txt, so the weekly run cannot fetch one", () => {
    const text = readFileSync("research/rendered/urls.txt", "utf8");
    const entries = parseUrlList(text); // throws if an active Gumroad line were left
    expect(entries.some((e: { url: string }) => /gumroad\.com/i.test(new URL(e.url).hostname))).toBe(false);
    // Each paused line keeps its URL and slug, and cites the terms line, so it can be restored if the sitting allows.
    const paused = text.split("\n").filter((l) => l.startsWith("# paused (tick 19"));
    expect(paused).toHaveLength(13);
    for (const l of paused) expect(l).toMatch(/gumroad-terms\.txt:326.*— https?:\/\/(www\.)?gumroad\.com\S*\t[a-z0-9-]+$/);
    // A dispatch override for the Gumroad rows now finds only paused rows.
    expect(() => overrideLines(text, 180, 186)).toThrow(/every row is retired/);
  });
});

/**
 * Tick 20's terms audit of all 81 sites active in urls.txt (research/channel-loop/TERMS-AUDIT-2026-09-29.md):
 * ten barred automated access outright, and three more had a condition the runner does not meet (robots.txt,
 * which render-watch does not read, and Mozilla's ban on harvesting personal information).
 */
describe("the terms audit's barred sites (29.9.2026)", () => {
  const AUDITED = [
    "paypal.com",
    "teachsimple.com",
    "indiebook.co.il",
    "astro.build",
    "facer.io",
    "facercreator.io",
    "youtube.com",
    "blog.youtube",
    "google.com",
    "googlesource.com",
    "metaculus.com",
    "openai.com",
    "addons.mozilla.org",
  ];

  it("lists each audited site once, each with a citation of the clause or condition", () => {
    const domains = TERMS_BARRED.map((b: { domain: string }) => b.domain);
    expect(domains.slice(1)).toEqual(AUDITED);
    expect(new Set(domains).size).toBe(domains.length);
    for (const b of TERMS_BARRED as { domain: string; why: string }[]) {
      expect(b.why, b.domain).toMatch(/(\.txt:\d+|\.md:\d+|\.tsx:\d+|bytes \d+)/);
    }
  });

  it("bars exactly those sites: Mozilla's other sites and GitHub are not caught by a neighbour's entry", () => {
    for (const h of ["support.google.com", "developers.google.com", "www.youtube.com", "blog.youtube", "chromium.googlesource.com", "addons.mozilla.org", "www.paypal.com", "community.facer.io"]) {
      expect(termsBarred(h), h).not.toBeNull();
    }
    for (const h of ["www.mozilla.org", "extensionworkshop.com", "github.com", "raw.githubusercontent.com", "googleapis.com", "notyoutube.com", "displate.com", "www.nevo.co.il"]) {
      expect(termsBarred(h), h).toBeNull();
    }
  });

  it("leaves no active line in urls.txt on any barred site", () => {
    const entries = parseUrlList(readFileSync("research/rendered/urls.txt", "utf8"));
    const hits = entries.filter((e: { url: string }) => termsBarred(new URL(e.url).hostname));
    expect(hits).toEqual([]);
  });

  it("keeps no author record or email address in the stored AMO search results (Mozilla's acceptable-use policy)", () => {
    const email = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
    for (const slug of ["amo-search-newest", "amo-search-hebrew", "amo-search-invoice", "amo-hebrew-langpack"]) {
      const text = readFileSync(`research/rendered/${slug}.json`, "utf8");
      const leaks = text.split("\n").filter((l) => email.test(l) && !/"guid":/.test(l));
      expect(leaks, slug).toEqual([]);
      const body = JSON.parse(text);
      for (const r of body.results ?? [body]) {
        expect(Array.isArray(r.authors), slug).toBe(false);
      }
    }
  });
});
