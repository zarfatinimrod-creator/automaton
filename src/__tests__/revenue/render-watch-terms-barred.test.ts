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
  it("names Gumroad, citing the terms line that bars it, and the line says so", () => {
    expect(TERMS_BARRED.map((b: { domain: string }) => b.domain)).toEqual(["gumroad.com"]);
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
