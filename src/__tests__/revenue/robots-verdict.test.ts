import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as queue-zero-test.mjs)
import { judgeSite, queuedPaths, readRobotsCapture, serializeVerdicts } from "../../../scripts/robots-verdict.mjs";

/**
 * scripts/robots-verdict.mjs — the script the ruling of 30.9 names (RULING-2026-09-30-video.md 16(d) D2(v)): "a new
 * verdict value NO_TERMS_ROBOTS_OK is active-eligible, set only for exhaustive-negative sites by a script that reads
 * the site's robots.txt for the queued paths". It reads the committed robots- capture of each host the site's queued
 * lines (active or paused) sit on, checks every one of those paths with render-watch's own RFC 9309 parser, and only
 * when the site is NO_TERMS with an exhaustive-negative note and every path is allowed does it rewrite the entry.
 * Otherwise it changes nothing and says why. Dry run by default; --apply writes.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "robots-verdict.mjs");

const NOTE = "exhaustive-negative (osek-patur-documents.md:1129-1141); fetchable only under NO_TERMS_ROBOTS_OK";
const VERDICTS = {
  _about: "test file",
  sites: {
    "law.example": { verdict: "NO_TERMS", source: "no terms text anywhere (round 1)", checked: "2026-09-29", note: NOTE },
    "refused.example": { verdict: "NO_TERMS", source: "no terms", checked: "2026-09-29", note: "refusal-type: 403" },
    "open.example": { verdict: "NOT_BARRED", source: "terms read", checked: "2026-09-29" },
  },
};

const URLS = [
  "# a list",
  "# research/channel-loop/ZERO-TESTS.md row 1 — a law.",
  "# paused (NO_TERMS, exhaustive-negative; waits on robots.txt support, ruling 30.9 16(d) D2(v)): law.example in research/channel-loop/terms-verdicts.json — https://www.law.example/law_html/law00/1.htm\tlaw-one",
  "# research/channel-loop/ZERO-TESTS.md row 2 — another law.",
  "# paused (NO_TERMS, exhaustive-negative; waits on robots.txt support, ruling 30.9 16(d) D2(v)): law.example in research/channel-loop/terms-verdicts.json — https://www.law.example/law_html/law01/2.htm\tlaw-two",
  "# retired: the wrong page (tick 17) — https://www.law.example/law_html/old.htm\tlaw-old",
  "https://www.law.example/robots.txt\trobots-law",
  "https://open.example/a\topen-a",
  "",
].join("\n");

type Capture = { slug: string; meta: Record<string, unknown>; body: string | null };
const capture = (body: string | null, meta: Record<string, unknown> = {}): Capture => ({
  slug: "robots-law",
  meta: {
    url: "https://www.law.example/robots.txt",
    fetchedAt: "2026-10-06T05:23:00.000Z",
    status: 200,
    error: null,
    sha256: "0123456789abcdef0123456789abcdef",
    bodyPath: "research/rendered/robots-law.txt",
    ...meta,
  },
  body,
});
const reader = (captures: Record<string, Capture | null>) => (robotsUrl: string) => captures[robotsUrl] ?? null;
const judge = (over: Record<string, unknown> = {}) =>
  judgeSite({
    site: "law.example",
    verdicts: VERDICTS,
    urls: URLS,
    readCapture: reader({ "https://www.law.example/robots.txt": capture("User-agent: *\nDisallow: /search\n") }),
    today: "2026-10-06",
    ...over,
  });

describe("queuedPaths — the site's lines in urls.txt, active or paused", () => {
  it("finds active lines and '# paused' lines of the site, and skips retired lines and other sites", () => {
    expect(queuedPaths(URLS, "law.example")).toEqual([
      { url: "https://www.law.example/law_html/law00/1.htm", slug: "law-one", state: "paused" },
      { url: "https://www.law.example/law_html/law01/2.htm", slug: "law-two", state: "paused" },
      { url: "https://www.law.example/robots.txt", slug: "robots-law", state: "active" },
    ]);
    expect(queuedPaths(URLS, "open.example")).toEqual([{ url: "https://open.example/a", slug: "open-a", state: "active" }]);
  });

  it("reads the committed urls.txt: nevo's eight law pages are queued, all paused", () => {
    const paths = queuedPaths(readFileSync(join(ROOT, "research", "rendered", "urls.txt"), "utf8"), "nevo.co.il");
    expect(paths.length).toBe(8);
    expect(paths.every((p: { state: string; url: string }) => p.state === "paused" && p.url.startsWith("https://www.nevo.co.il/law_html/"))).toBe(true);
  });
});

describe("judgeSite — NO_TERMS_ROBOTS_OK only when every queued path is allowed", () => {
  it("rewrites an exhaustive-negative NO_TERMS entry when robots.txt allows every queued path", () => {
    const out = judge();
    expect(out.changed).toBe(true);
    const entry = out.verdicts.sites["law.example"];
    expect(entry.verdict).toBe("NO_TERMS_ROBOTS_OK");
    expect(entry.checked).toBe("2026-10-06");
    expect(entry.note).toBe(NOTE);
    expect(entry.source).toContain("research/rendered/robots-law.txt");
    expect(entry.source).toContain("https://www.law.example/robots.txt");
    expect(entry.source).toContain("2026-10-06T05:23:00.000Z");
    expect(entry.source).toContain("research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v)");
    expect(entry.source).toMatch(/all 2 queued paths allowed for MehudakRenderWatch/);
    expect(entry.source).toContain("no terms text anywhere (round 1)"); // the NO_TERMS record is kept
    // Nothing else in the file moves.
    expect(out.verdicts.sites["refused.example"]).toEqual(VERDICTS.sites["refused.example"]);
    expect(out.verdicts._about).toBe(VERDICTS._about);
    expect(VERDICTS.sites["law.example"].verdict).toBe("NO_TERMS"); // the input is not mutated
    expect(out.checked.map((c: { slug: string; allowed: boolean }) => [c.slug, c.allowed])).toEqual([
      ["law-one", true],
      ["law-two", true],
    ]);
  });

  it("changes nothing when robots.txt disallows a queued path, and names it with the rule", () => {
    const out = judge({
      readCapture: reader({ "https://www.law.example/robots.txt": capture("User-agent: *\nDisallow: /law_html/law01/\n") }),
    });
    expect(out.changed).toBe(false);
    expect(out.verdicts).toEqual(VERDICTS);
    expect(out.why).toMatch(/law-two.*Disallow: \/law_html\/law01\//);
  });

  it("honours the group for MehudakRenderWatch over *", () => {
    const out = judge({
      readCapture: reader({
        "https://www.law.example/robots.txt": capture("User-agent: *\nAllow: /\n\nUser-agent: MehudakRenderWatch\nDisallow: /\n"),
      }),
    });
    expect(out.changed).toBe(false);
  });

  it("reads a 4xx robots.txt as no rules (RFC 9309 §2.3.1.3) and says so in the source", () => {
    const out = judge({
      readCapture: reader({ "https://www.law.example/robots.txt": capture(null, { status: 404, error: "HTTP 404", sha256: null, bodyPath: null }) }),
    });
    expect(out.changed).toBe(true);
    expect(out.verdicts.sites["law.example"].source).toMatch(/answered 404.*no rules/);
  });

  it("changes nothing when the robots.txt capture is missing, failed or unreachable", () => {
    expect(judge({ readCapture: reader({}) })).toMatchObject({ changed: false });
    expect(judge({ readCapture: reader({}) }).why).toMatch(/no committed robots\.txt capture for https:\/\/www\.law\.example.*robots- probe/);
    for (const meta of [
      { status: 503, error: "HTTP 503", sha256: null, bodyPath: null },
      { status: null, error: "robots.txt could not be read (timeout)", sha256: null, bodyPath: null },
    ]) {
      const out = judge({ readCapture: reader({ "https://www.law.example/robots.txt": capture(null, meta) }) });
      expect(out.changed, JSON.stringify(meta)).toBe(false);
      expect(out.why).toMatch(/complete disallow/);
    }
  });

  it("changes nothing for a site that is not NO_TERMS with an exhaustive-negative note", () => {
    for (const site of ["refused.example", "open.example", "unknown.example"]) {
      const out = judge({ site });
      expect(out.changed, site).toBe(false);
      expect(out.verdicts).toEqual(VERDICTS);
    }
    expect(judge({ site: "refused.example" }).why).toMatch(/exhaustive-negative/);
    expect(judge({ site: "unknown.example" }).why).toMatch(/no verdict/);
    const already = { ...VERDICTS, sites: { ...VERDICTS.sites, "law.example": { ...VERDICTS.sites["law.example"], verdict: "NO_TERMS_ROBOTS_OK" } } };
    expect(judge({ verdicts: already }).why).toMatch(/already NO_TERMS_ROBOTS_OK/);
  });

  it("changes nothing when the site has no queued page besides its probe", () => {
    const out = judge({ urls: "https://www.law.example/robots.txt\trobots-law\n" });
    expect(out.changed).toBe(false);
    expect(out.why).toMatch(/no queued page/);
  });

  it("needs a capture for every host the queued paths sit on", () => {
    const urls = `${URLS}# paused (x): law.example — https://files.law.example/doc.pdf\tlaw-pdf\n`;
    const out = judge({ urls });
    expect(out.changed).toBe(false);
    expect(out.why).toMatch(/https:\/\/files\.law\.example/);
  });
});

describe("serializeVerdicts", () => {
  it("writes terms-verdicts.json byte for byte as it is committed", () => {
    const raw = readFileSync(join(ROOT, "research", "channel-loop", "terms-verdicts.json"), "utf8");
    expect(serializeVerdicts(JSON.parse(raw))).toBe(raw);
  });
});

// ---------------------------------------------------------------------------
// The CLI, against a temp copy of the three inputs
// ---------------------------------------------------------------------------

const tmpDirs: string[] = [];
afterAll(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
});

function fixture(robotsBody: string | null) {
  const dir = mkdtempSync(join(tmpdir(), "robots-verdict-test-"));
  tmpDirs.push(dir);
  const rendered = join(dir, "rendered");
  mkdirSync(rendered);
  writeFileSync(join(dir, "terms-verdicts.json"), serializeVerdicts(VERDICTS));
  writeFileSync(join(dir, "urls.txt"), URLS);
  if (robotsBody !== null) {
    writeFileSync(join(rendered, "robots-law.txt"), robotsBody);
    writeFileSync(join(rendered, "robots-law.meta.json"), `${JSON.stringify(capture(robotsBody).meta, null, 2)}\n`);
  }
  const run = (...args: string[]) =>
    spawnSync(
      process.execPath,
      [SCRIPT, "law.example", "--verdicts", join(dir, "terms-verdicts.json"), "--urls", join(dir, "urls.txt"), "--rendered", rendered, ...args],
      { encoding: "utf8" },
    );
  return { dir, rendered, run, verdicts: () => readFileSync(join(dir, "terms-verdicts.json"), "utf8") };
}

describe("robots-verdict CLI", () => {
  it("finds the capture by its meta's url, and on a dry run says what it would write and writes nothing", () => {
    const f = fixture("User-agent: *\nDisallow: /search\n");
    expect(readRobotsCapture("https://www.law.example/robots.txt", f.rendered)).toMatchObject({ slug: "robots-law" });
    const before = f.verdicts();
    const got = f.run();
    expect(got.status).toBe(0);
    expect(got.stdout).toMatch(/would set law\.example to NO_TERMS_ROBOTS_OK/);
    expect(got.stdout).toMatch(/allowed\s+law-one/);
    expect(f.verdicts()).toBe(before);
  });

  it("writes the entry with --apply, and nothing else in the file", () => {
    const f = fixture("User-agent: *\nDisallow: /search\n");
    const got = f.run("--apply");
    expect(got.status).toBe(0);
    expect(got.stdout).toMatch(/set law\.example to NO_TERMS_ROBOTS_OK/);
    const after = JSON.parse(f.verdicts());
    expect(after.sites["law.example"].verdict).toBe("NO_TERMS_ROBOTS_OK");
    expect(after.sites["refused.example"]).toEqual(VERDICTS.sites["refused.example"]);
    expect(f.verdicts()).toBe(serializeVerdicts(after));
  });

  it("exits 3 and writes nothing when it declines, even with --apply, and says why", () => {
    const f = fixture("User-agent: *\nDisallow: /law_html/\n");
    const before = f.verdicts();
    const got = f.run("--apply");
    expect(got.status).toBe(3);
    expect(got.stdout).toMatch(/no change: .*law-one/);
    expect(f.verdicts()).toBe(before);
    const none = fixture(null);
    expect(none.run().status).toBe(3);
  });

  it("refuses a missing site argument or an unknown option", () => {
    expect(spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" }).status).toBe(1);
    expect(spawnSync(process.execPath, [SCRIPT, "law.example", "--force"], { encoding: "utf8" }).status).toBe(1);
  });

  it("declines for nevo on the committed files today: no robots.txt capture exists yet", () => {
    const got = spawnSync(process.execPath, [SCRIPT, "nevo.co.il"], { encoding: "utf8" });
    expect(got.status).toBe(3);
    expect(got.stdout).toMatch(/no committed robots\.txt capture for https:\/\/www\.nevo\.co\.il/);
  });
});
