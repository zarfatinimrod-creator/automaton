import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import {
  beforeRechecks,
  isRecheckOf,
  judgeRobots,
  judgeSite,
  parseRevertSource,
  parseRobotsSource,
  queuedPaths,
  readCaptureBySlug,
  readRobotsCapture,
  recheckSite,
  robotsCite,
  serializeVerdicts,
  // @ts-expect-error — plain ESM script, no type declarations by design (same as queue-zero-test.mjs)
} from "../../../scripts/robots-verdict.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { checkManifest, diskFiles, readManifest, recordFiles, sourceVersion } from "../../../scripts/freeze-capture.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { isExhaustiveNegative, isRobotsOkVerdict, termsGate } from "../../../scripts/queue-zero-test.mjs";

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
    contentType: "text/plain; charset=utf-8",
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

  it("reads the committed urls.txt: nevo's eight law pages are queued, all paused, beside its robots.txt probe", () => {
    type P = { state: string; url: string; slug: string };
    const paths: P[] = queuedPaths(readFileSync(join(ROOT, "research", "rendered", "urls.txt"), "utf8"), "nevo.co.il");
    const laws = paths.filter((p) => new URL(p.url).pathname !== "/robots.txt");
    expect(laws.length).toBe(8);
    expect(laws.every((p) => p.state === "paused" && p.url.startsWith("https://www.nevo.co.il/law_html/"))).toBe(true);
    // The loop queued the probe in tick 27 (ZERO-TESTS row 231); it is the only active nevo line.
    expect(paths.filter((p) => p.state === "active")).toEqual([
      { url: "https://www.nevo.co.il/robots.txt", slug: "robots-nevo", state: "active" },
    ]);
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

  it("reads a 410 as no robots.txt too", () => {
    const out = judge({
      readCapture: reader({ "https://www.law.example/robots.txt": capture(null, { status: 410, error: "HTTP 410", sha256: null, bodyPath: null }) }),
    });
    expect(out.changed).toBe(true);
  });

  it("sets nothing on a 401, 403, 429 or other 4xx: the site refused or throttled us, which is its answer (D2(iv))", () => {
    for (const status of [401, 403, 429, 400, 451]) {
      const out = judge({
        readCapture: reader({
          "https://www.law.example/robots.txt": capture(null, { status, error: `HTTP ${status}`, sha256: null, bodyPath: null }),
        }),
      });
      expect(out.changed, String(status)).toBe(false);
      expect(out.verdicts).toEqual(VERDICTS);
      expect(out.why, String(status)).toMatch(new RegExp(`HTTP ${status}.*D2\\(iv\\)`));
    }
  });

  it("sets nothing on a 2xx that is not a plain-text robots.txt: a bot challenge, a soft 404, an HTML or JSON answer", () => {
    const challenge = '<!DOCTYPE html><html><head><title>Just a moment...</title></head><body>Checking your browser</body></html>';
    for (const [body, contentType] of [
      [challenge, "text/html; charset=UTF-8"],
      [challenge, "text/plain"], // a challenge page served as text/plain is still markup
      ["\uFEFF  <html><body>Not found</body></html>", "text/plain; charset=utf-8"],
      ["User-agent: *\nDisallow:\n", "text/html"],
      ["User-agent: *\nDisallow:\n", "application/json"],
      ["User-agent: *\nDisallow:\n", null],
    ] as Array<[string, string | null]>) {
      const out = judge({ readCapture: reader({ "https://www.law.example/robots.txt": capture(body, { contentType }) }) });
      expect(out.changed, `${contentType} ${body.slice(0, 20)}`).toBe(false);
      expect(out.why).toMatch(/not a robots\.txt the site served.*D2\(iv\)/);
    }
    // text/plain, any case, with or without parameters, is a file.
    for (const contentType of ["text/plain", "TEXT/PLAIN; charset=ISO-8859-1"]) {
      expect(judge({ readCapture: reader({ "https://www.law.example/robots.txt": capture("User-agent: *\nAllow: /\n", { contentType }) }) }).changed).toBe(true);
    }
  });

  it("reads a capture cut short at the robots.txt limit only to its last complete line", () => {
    // Cut mid-rule: "Disallow: /law_html/law01/" arrives as "Disallow: /law_html/la", which would refuse law-one too.
    const cut = "User-agent: *\nAllow: /\nDisallow: /law_html/la";
    const out = judge({ readCapture: reader({ "https://www.law.example/robots.txt": capture(cut, { truncated: true }) }) });
    expect(out.changed).toBe(true);
    // The same bytes as a whole file do refuse it: the cut line is what the limit drops.
    expect(judge({ readCapture: reader({ "https://www.law.example/robots.txt": capture(cut) }) }).changed).toBe(false);
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

  it("puts an entry's fields in one fixed order, copying after note, whatever order they came in (ruling 6.10 row 21 (d))", () => {
    // Since 6.10 every entry carries a fifth field, "copying" (RULING-2026-10-06-robots-and-terms.md decision 4(2)). The
    // file keeps one exact format: verdict, source, checked, note, copying, then any field not named, in its own order.
    const shuffled = {
      _about: "test file",
      sites: {
        "a.example": { copying: "barred", note: "n", checked: "2026-10-06", source: "s", verdict: "BARRED" },
        "b.example": { copying: "unread", checked: "2026-09-29", verdict: "NOT_BARRED", source: "s" },
        "c.example": { extra: 1, verdict: "NO_TERMS", source: "s", checked: "2026-09-29", note: "n", copying: "unread" },
      },
    };
    const out = JSON.parse(serializeVerdicts(shuffled));
    expect(Object.keys(out)).toEqual(["_about", "sites"]);
    expect(Object.keys(out.sites["a.example"])).toEqual(["verdict", "source", "checked", "note", "copying"]);
    expect(Object.keys(out.sites["b.example"])).toEqual(["verdict", "source", "checked", "copying"]);
    expect(Object.keys(out.sites["c.example"])).toEqual(["verdict", "source", "checked", "note", "copying", "extra"]);
    expect(out).toEqual(shuffled);
    // One-space indent, no final newline, as committed.
    expect(serializeVerdicts(shuffled)).toBe(JSON.stringify(out, null, 1));
    // A file with copying out of place is not in the format: serializing it moves the field, so the committed-file
    // test above fails on it.
    const misplaced = '{\n "sites": {\n  "a.example": {\n   "copying": "unread",\n   "verdict": "NO_TERMS",\n   "source": "s",\n   "checked": "2026-09-29"\n  }\n }\n}';
    expect(serializeVerdicts(JSON.parse(misplaced))).not.toBe(misplaced);
  });

  it("holds every committed entry to that order, with a copying field in {barred, allowed, unread}", () => {
    const raw = readFileSync(join(ROOT, "research", "channel-loop", "terms-verdicts.json"), "utf8");
    const order = ["verdict", "source", "checked", "note", "copying"];
    for (const [site, entry] of Object.entries(JSON.parse(raw).sites as Record<string, Record<string, unknown>>)) {
      const keys = Object.keys(entry);
      expect(keys, site).toEqual(order.filter((k) => keys.includes(k)));
      expect(["barred", "allowed", "unread"], site).toContain(entry.copying);
    }
  });
});

describe("judgeSite keeps every field it does not set (6.10, tick 54)", () => {
  // The verdict file gained "copying" on 6.10 (ruling 6.10 row 21 (d), decision 4(2)). judgeSite used to rebuild the entry
  // from verdict, source, checked and note alone, so setting NO_TERMS_ROBOTS_OK would have dropped the field.
  const WITH_COPYING = {
    ...VERDICTS,
    sites: {
      ...VERDICTS.sites,
      "law.example": { ...VERDICTS.sites["law.example"], copying: "unread", extra: "kept" },
    },
  };

  it("keeps copying, and any other field, on the entry it rewrites, in the file's order", () => {
    const out = judge({ verdicts: WITH_COPYING });
    expect(out.changed).toBe(true);
    const entry = out.verdicts.sites["law.example"];
    expect(entry.verdict).toBe("NO_TERMS_ROBOTS_OK");
    expect(entry.note).toBe(NOTE);
    expect(entry.copying).toBe("unread");
    expect(entry.extra).toBe("kept");
    expect(Object.keys(entry)).toEqual(["verdict", "source", "checked", "note", "copying", "extra"]);
    // The input is not mutated, and the serialized file carries the field where every entry does.
    expect(WITH_COPYING.sites["law.example"].verdict).toBe("NO_TERMS");
    expect(serializeVerdicts(out.verdicts)).toContain('"note": "' + NOTE.replace(/"/g, '\\"') + '",\n   "copying": "unread",');
  });

  it("keeps a barred copying field as it is: the robots verdict says nothing about copying", () => {
    const barred = { ...WITH_COPYING, sites: { ...WITH_COPYING.sites, "law.example": { ...WITH_COPYING.sites["law.example"], copying: "barred" } } };
    expect(judge({ verdicts: barred }).verdicts.sites["law.example"].copying).toBe("barred");
  });

  it("writes copying back through the CLI with --apply", () => {
    const f = fixture("User-agent: *\nDisallow: /search\n", WITH_COPYING);
    expect(f.run("--apply").status).toBe(0);
    const after = JSON.parse(f.verdicts());
    expect(after.sites["law.example"].verdict).toBe("NO_TERMS_ROBOTS_OK");
    expect(after.sites["law.example"].copying).toBe("unread");
    expect(f.verdicts()).toBe(serializeVerdicts(after));
  });
});

// ---------------------------------------------------------------------------
// The CLI, against a temp copy of the three inputs
// ---------------------------------------------------------------------------

const tmpDirs: string[] = [];
afterAll(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
});

/**
 * The committed terms-verdicts.json as it stood before any --recheck rewrite (tick 58): beforeRechecks with the 18
 * NO_TERMS_ROBOTS_OK entries of 5c980e3 (prize-terms-audit.test.ts pins the fixture), written to a scratch file, so the
 * blocks below that re-run the script on a tick-57 verdict still hold after the Tuesday tick applies a refresh or a revert.
 * With no re-check applied it is the committed file byte for byte.
 */
const RECHECK_FIXTURE = join(ROOT, "src", "__tests__", "revenue", "fixtures", "terms-verdicts-5c980e3-robots-ok.json");
function committedBeforeRecheck(): string {
  const file = JSON.parse(readFileSync(join(ROOT, "research", "channel-loop", "terms-verdicts.json"), "utf8"));
  const dir = mkdtempSync(join(tmpdir(), "robots-verdict-committed-"));
  tmpDirs.push(dir);
  const path = join(dir, "terms-verdicts.json");
  writeFileSync(path, serializeVerdicts({ ...file, sites: beforeRechecks(file.sites, JSON.parse(readFileSync(RECHECK_FIXTURE, "utf8"))) }));
  return path;
}

function fixture(robotsBody: string | null, verdicts: object = VERDICTS) {
  const dir = mkdtempSync(join(tmpdir(), "robots-verdict-test-"));
  tmpDirs.push(dir);
  const rendered = join(dir, "rendered");
  mkdirSync(rendered);
  writeFileSync(join(dir, "terms-verdicts.json"), serializeVerdicts(verdicts));
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

  it("reads the live capture, never a dated frozen copy of it (scripts/freeze-capture.mjs), which sorts first", () => {
    const f = fixture("User-agent: *\nDisallow: /search\n");
    // A frozen copy keeps the url of the live capture and says it is frozen; its name sorts before the live one's.
    const frozen = { ...capture("User-agent: *\nDisallow: /\n").meta, slug: "robots-law-2026-09-30", bodyPath: "research/rendered/robots-law-2026-09-30.txt" };
    writeFileSync(join(f.rendered, "robots-law-2026-09-30.txt"), "User-agent: *\nDisallow: /\n");
    writeFileSync(
      join(f.rendered, "robots-law-2026-09-30.meta.json"),
      `${JSON.stringify({ ...frozen, frozen: { on: "2026-09-30", from: "research/rendered/robots-law.meta.json", commit: "abc1234", why: "test" } }, null, 2)}\n`,
    );
    expect(readRobotsCapture("https://www.law.example/robots.txt", f.rendered)).toMatchObject({ slug: "robots-law", body: "User-agent: *\nDisallow: /search\n" });
    expect(f.run().stdout).toMatch(/would set law\.example to NO_TERMS_ROBOTS_OK/);
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

  it("declines for nevo on the committed files: its robots.txt (rendered 30.9) disallows every queued law path", () => {
    const got = spawnSync(process.execPath, [SCRIPT, "nevo.co.il"], { encoding: "utf8" });
    expect(got.status).toBe(3);
    expect(got.stdout).toMatch(/no change: robots\.txt disallows 8 queued path\(s\) for MehudakRenderWatch/);
    expect(got.stdout).not.toMatch(/NO_TERMS_ROBOTS_OK/);
  });

  it("declines eurocontrol.int on the committed files since tick 57: the script set it, so it is already NO_TERMS_ROBOTS_OK", () => {
    // Applied 6.10 (tick 57) with --urls research/measurements/ai-allowed-events.urls.txt, once the main thread waived R1's
    // repository grep for the site; the source then repointed to the frozen copy of the capture it read
    // (src/__tests__/revenue/prize-terms-audit.test.ts, "tick 57", re-derives it). Run again dry, on either list, it declines
    // (dry, so that a broken script cannot write into the committed file from a test).
    const verdictsFile = join(ROOT, "research", "channel-loop", "terms-verdicts.json");
    const before = readFileSync(verdictsFile, "utf8");
    // Run on the committed file as it stood before any --recheck rewrite (committedBeforeRecheck).
    const committed = committedBeforeRecheck();
    const read = readFileSync(committed, "utf8");
    for (const urls of [join(ROOT, "research", "measurements", "ai-allowed-events.urls.txt"), join(ROOT, "research", "rendered", "urls.txt")]) {
      const got = spawnSync(process.execPath, [SCRIPT, "eurocontrol.int", "--urls", urls, "--verdicts", committed], { encoding: "utf8" });
      expect(got.status).toBe(3);
      expect(got.stdout.split("\n")[0]).toBe("robots-verdict: eurocontrol.int (NO_TERMS_ROBOTS_OK)");
      expect(got.stdout).toContain("no change: eurocontrol.int is already NO_TERMS_ROBOTS_OK");
    }
    expect([readFileSync(verdictsFile, "utf8"), readFileSync(committed, "utf8")]).toEqual([before, read]);
    const entry = JSON.parse(read).sites["eurocontrol.int"];
    expect([entry.verdict, entry.checked, entry.copying]).toEqual(["NO_TERMS_ROBOTS_OK", "2026-10-06", "unread"]);
    expect(entry.note.startsWith("exhaustive-negative: ")).toBe(true);
    expect(entry.source.startsWith(
      "robots.txt read at research/rendered/robots-eurocontrol-2026-10-06.txt (https://www.eurocontrol.int/robots.txt, fetched 2026-10-06T12:07:27.881Z, sha256 45d83d13c223): all 1 queued path allowed for MehudakRenderWatch (scripts/robots-verdict.mjs); ruling research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v); NO_TERMS before: ",
    )).toBe(true);
    expect(before).not.toContain("research/rendered/robots-eurocontrol.txt");
  });

  it("declines agenthon.net on the committed files since tick 57: set again after its third terms read, so it is already NO_TERMS_ROBOTS_OK", () => {
    // TERMS_PENDING from tick 55 (a terms link found after its tick-54 verdict) until its last two terms documents were read
    // in tick 57; then NO_TERMS, exhaustive-negative, and, on the main thread's word, applied with --urls
    // research/measurements/ai-allowed-events.urls.txt on the 6.10 capture, the source repointed to its frozen copy
    // (src/__tests__/revenue/prize-terms-audit.test.ts, "tick 57, third round", re-derives it). Run again dry, it declines.
    const verdictsFile = join(ROOT, "research", "channel-loop", "terms-verdicts.json");
    const before = readFileSync(verdictsFile, "utf8");
    // Run on the committed file as it stood before any --recheck rewrite (committedBeforeRecheck).
    const committed = committedBeforeRecheck();
    const read = readFileSync(committed, "utf8");
    for (const urls of [join(ROOT, "research", "measurements", "ai-allowed-events.urls.txt"), join(ROOT, "research", "rendered", "urls.txt")]) {
      const got = spawnSync(process.execPath, [SCRIPT, "agenthon.net", "--urls", urls, "--verdicts", committed], { encoding: "utf8" });
      expect(got.status).toBe(3);
      expect(got.stdout.split("\n")[0]).toBe("robots-verdict: agenthon.net (NO_TERMS_ROBOTS_OK)");
      expect(got.stdout).toContain("no change: agenthon.net is already NO_TERMS_ROBOTS_OK");
    }
    expect([readFileSync(verdictsFile, "utf8"), readFileSync(committed, "utf8")]).toEqual([before, read]);
    const entry = JSON.parse(read).sites["agenthon.net"];
    expect([entry.verdict, entry.checked, entry.copying]).toEqual(["NO_TERMS_ROBOTS_OK", "2026-10-06", "unread"]);
    expect(entry.note.startsWith("exhaustive-negative: ruled by the main thread (tick 57): ")).toBe(true);
    expect(entry.source.startsWith(
      "robots.txt read at research/rendered/robots-agenthon-2026-10-06.txt (https://www.agenthon.net/robots.txt, fetched 2026-10-06T07:15:41.847Z, sha256 54048ccab842): all 1 queued path allowed for MehudakRenderWatch (scripts/robots-verdict.mjs); ruling research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v); NO_TERMS before: research/rendered/terms-agenthon-licensing-2026-10-06.txt (",
    )).toBe(true);
    expect(before).not.toContain("research/rendered/robots-agenthon.txt");
  });
});

// ---------------------------------------------------------------------------
// --recheck (tick 58; logs/CHANNEL_LOOP.md §9, "Queued 6.10 (tick 54)" item 3)
// ---------------------------------------------------------------------------

/**
 * Since tick 54 every NO_TERMS_ROBOTS_OK source cites a dated frozen copy of the robots.txt capture it was set on, so the
 * weekly render, which rewrites the live capture when the site's robots.txt changes, moves nothing a verdict rests on, and
 * no test saw such a change. `--recheck` compares each live capture with the frozen copy its source cites: unchanged,
 * unreachable (reported, nothing written), refresh (changed, every queued path still allowed: the live capture is frozen as
 * a new copy, FROZEN.sha256 following, and the citation repointed) or revert (a queued path now disallowed: NO_TERMS again,
 * the history kept). Fixtures: a temp rendered dir holding frozen copies, live captures and a verdicts file built by
 * judgeSite on the frozen copies, exactly as the committed sources were.
 */
const T0 = "2026-10-06T05:23:00.000Z";
const T1 = "2026-10-13T05:23:00.000Z";
const LAW_ROBOTS = "https://www.law.example/robots.txt";
const GONE_ROBOTS = "https://gone.example/robots.txt";
const HAND_ROBOTS = "https://hand.example/robots.txt";
const FROZEN_LAW = "User-agent: *\nDisallow: /search\n";
const ALLOWING = "User-agent: *\nDisallow: /search\nDisallow: /admin/\n";
const REFUSING = "User-agent: *\nDisallow: /law_html/law01/\n";
const GONE_NOTE = "exhaustive-negative: every search came back empty.";
const RE_URLS = `${URLS}https://gone.example/event\tprize-gone\nhttps://hand.example/page\tprize-hand\n`;
const hash = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
const today = () => new Date().toISOString().slice(0, 10);

type LiveSpec = { body: string | null; status?: number; contentType?: string; fetchedAt?: string } | null;

/** A robots- capture as render-watch writes it (a frozen copy when `frozen` is given): its meta, and its .txt for a 200. */
function writeRobots(rendered: string, slug: string, url: string, spec: NonNullable<LiveSpec>, frozen?: Record<string, unknown>) {
  const status = spec.status ?? 200;
  const ok = status >= 200 && status <= 299;
  const body = spec.body;
  const meta: Record<string, unknown> = {
    url,
    slug,
    fetchedAt: spec.fetchedAt ?? T0,
    status,
    contentType: spec.contentType ?? (ok ? "text/plain" : "text/html; charset=utf-8"),
    byteLength: body === null ? 0 : Buffer.byteLength(body),
    sha256: body === null ? null : hash(body),
    truncated: false,
    error: ok ? null : `HTTP ${status}`,
    bodyPath: body === null ? null : `research/rendered/${slug}.txt`,
    textPath: null,
    robots: "allowed",
    robotsUrl: url,
  };
  if (frozen) meta.frozen = frozen;
  if (body !== null) writeFileSync(join(rendered, `${slug}.txt`), body);
  writeFileSync(join(rendered, `${slug}.meta.json`), `${JSON.stringify(meta, null, 2)}\n`);
}

const frozenBlock = (live: string) => ({ on: "2026-10-06", from: `research/rendered/${live}.meta.json`, commit: "abc1234", why: "test" });

type Fixture = {
  dir: string;
  rendered: string;
  verdictsFile: string;
  urlsFile: string;
  run: (...args: string[]) => ReturnType<typeof spawnSync> & { stdout: string; stderr: string };
  sites: () => Record<string, Record<string, string>>;
  raw: () => string;
  files: () => string[];
};

/**
 * law.example (its frozen copy a 200 file, two paused law pages), gone.example (its frozen copy a 404, one active page) and
 * hand.example (set by judgeSite, then put back to NO_TERMS by hand, its live capture changed) start as judgeSite wrote
 * them on their frozen copies; open.example is NOT_BARRED. The live captures default to the frozen bytes (law), a 404 again
 * (gone) and a changed, allowing robots.txt (hand); `law`, `gone` override (null: no live capture). `repo` lays the files
 * out as a repository's research/rendered; `frozenLaw` is the body of law.example's frozen copy.
 */
function recheckFixture({
  law = { body: FROZEN_LAW },
  gone = { body: null, status: 404 },
  repo = false,
  frozenLaw = FROZEN_LAW,
}: { law?: LiveSpec; gone?: LiveSpec; repo?: boolean; frozenLaw?: string } = {}): Fixture {
  const dir = mkdtempSync(join(tmpdir(), "robots-recheck-test-"));
  tmpDirs.push(dir);
  const rendered = repo ? join(dir, "research", "rendered") : join(dir, "rendered");
  mkdirSync(rendered, { recursive: true });
  writeRobots(rendered, "robots-law-2026-10-06", LAW_ROBOTS, { body: frozenLaw }, frozenBlock("robots-law"));
  writeRobots(rendered, "robots-gone-2026-10-06", GONE_ROBOTS, { body: null, status: 404 }, frozenBlock("robots-gone"));
  writeRobots(rendered, "robots-hand-2026-10-06", HAND_ROBOTS, { body: FROZEN_LAW }, frozenBlock("robots-hand"));
  for (const slug of ["robots-gone-2026-10-06", "robots-hand-2026-10-06", "robots-law-2026-10-06"]) recordFiles(rendered, slug);
  if (law) writeRobots(rendered, "robots-law", LAW_ROBOTS, law);
  if (gone) writeRobots(rendered, "robots-gone", GONE_ROBOTS, gone);
  writeRobots(rendered, "robots-hand", HAND_ROBOTS, { body: ALLOWING, fetchedAt: T1 });

  let v = {
    _about: "test file",
    sites: {
      "law.example": { verdict: "NO_TERMS", source: "no terms text anywhere (round 1)", checked: "2026-09-29", note: NOTE, copying: "unread" },
      "gone.example": { verdict: "NO_TERMS", source: "no terms anywhere (gone)", checked: "2026-09-29", note: GONE_NOTE, copying: "unread" },
      "hand.example": { verdict: "NO_TERMS", source: "no terms anywhere (hand)", checked: "2026-09-29", note: "exhaustive-negative (hand)", copying: "unread" },
      "open.example": { verdict: "NOT_BARRED", source: "terms read", checked: "2026-09-29", copying: "allowed" },
    } as Record<string, Record<string, string>>,
  };
  for (const [site, slug] of [
    ["law.example", "robots-law-2026-10-06"],
    ["gone.example", "robots-gone-2026-10-06"],
    ["hand.example", "robots-hand-2026-10-06"],
  ]) {
    const copy = readCaptureBySlug(slug, rendered);
    // Set on an earlier day than any run of these tests, so a re-check's own date is told from it.
    const out = judgeSite({ site, verdicts: v, urls: RE_URLS, readCapture: (u: string) => (u === copy.meta.url ? copy : null), today: "2026-10-01" });
    expect(out.changed, site).toBe(true);
    v = out.verdicts;
  }
  v = { ...v, sites: { ...v.sites, "hand.example": { ...v.sites["hand.example"], verdict: "NO_TERMS" } } };
  const verdictsFile = join(dir, "terms-verdicts.json");
  const urlsFile = join(dir, "urls.txt");
  writeFileSync(verdictsFile, serializeVerdicts(v));
  writeFileSync(urlsFile, RE_URLS);
  const run = (...args: string[]) =>
    spawnSync(process.execPath, [SCRIPT, "--recheck", "--verdicts", verdictsFile, "--urls", urlsFile, "--rendered", rendered, ...args], {
      encoding: "utf8",
    }) as ReturnType<typeof spawnSync> & { stdout: string; stderr: string };
  const raw = () => readFileSync(verdictsFile, "utf8");
  return {
    dir,
    rendered,
    verdictsFile,
    urlsFile,
    run,
    raw,
    sites: () => JSON.parse(raw()).sites,
    files: () => readdirSync(rendered).sort().map((f) => `${f} ${hash(readFileSync(join(rendered, f)))}`),
  };
}

/** The site lines of a --recheck output: [outcome, site]. */
const outcomes = (stdout: string) =>
  stdout
    .split("\n")
    .filter((l) => /^ {2}\S/.test(l))
    .map((l) => l.trim().split(/\s+/).slice(0, 2));

describe("parseRobotsSource — the citation a NO_TERMS_ROBOTS_OK source opens with, read back", () => {
  it("reads both forms judgeSite writes, and the rest of the source from ': all N' on", () => {
    const f = recheckFixture();
    const s = f.sites();
    const law = parseRobotsSource(s["law.example"].source);
    expect(law.cites).toEqual([
      {
        kind: "file",
        text: `robots.txt read at research/rendered/robots-law-2026-10-06.txt (${LAW_ROBOTS}, fetched ${T0}, sha256 ${hash(FROZEN_LAW).slice(0, 12)})`,
        slug: "robots-law-2026-10-06",
        robotsUrl: LAW_ROBOTS,
        fetchedAt: T0,
        sha12: hash(FROZEN_LAW).slice(0, 12),
      },
    ]);
    expect(law.n).toBe(2);
    expect(law.rest.startsWith(": all 2 queued paths allowed for MehudakRenderWatch (scripts/robots-verdict.mjs); ruling ")).toBe(true);
    expect(law.rest.endsWith("; NO_TERMS before: no terms text anywhere (round 1)")).toBe(true);
    expect(`${law.cites[0].text}${law.rest}`).toBe(s["law.example"].source);
    const gone = parseRobotsSource(s["gone.example"].source);
    expect(gone.cites).toEqual([
      {
        kind: "absent",
        text: `robots.txt answered 404 at ${GONE_ROBOTS} (research/rendered/robots-gone-2026-10-06.meta.json, fetched ${T0}): no rules, RFC 9309 §2.3.1.3`,
        status: 404,
        robotsUrl: GONE_ROBOTS,
        slug: "robots-gone-2026-10-06",
        fetchedAt: T0,
      },
    ]);
    expect(gone.n).toBe(1);
    // Two hosts: two citations joined by "; ".
    const two = `${law.cites[0].text}; ${gone.cites[0].text}${law.rest}`;
    expect(parseRobotsSource(two).cites.map((c: { slug: string }) => c.slug)).toEqual(["robots-law-2026-10-06", "robots-gone-2026-10-06"]);
    // Anything else is not a source to re-check.
    for (const other of ["no terms text anywhere", `${law.cites[0].text}; something else${law.rest}`, `${law.cites[0].text}: all 2 paths`, ""]) {
      expect(parseRobotsSource(other), other).toBeNull();
    }
  });

  it("reads every committed NO_TERMS_ROBOTS_OK source, each citing a recorded frozen copy that robotsCite writes back word for word", () => {
    const sites = JSON.parse(readFileSync(join(ROOT, "research", "channel-loop", "terms-verdicts.json"), "utf8")).sites as Record<string, Record<string, string>>;
    const rendered = join(ROOT, "research", "rendered");
    const manifest: Map<string, string> = readManifest(rendered);
    const ok = Object.keys(sites).filter((s) => sites[s].verdict === "NO_TERMS_ROBOTS_OK");
    // A site --recheck reverted cites the frozen copy it judged on in the same form (tick 58).
    const reverted = Object.keys(sites).filter((s) => sites[s].verdict === "NO_TERMS" && parseRevertSource(sites[s].source) !== null);
    expect(ok.length + reverted.length).toBeGreaterThan(0);
    for (const site of [...ok, ...reverted]) {
      const parsed = ok.includes(site) ? parseRobotsSource(sites[site].source) : parseRevertSource(sites[site].source);
      expect(parsed, site).not.toBeNull();
      for (const cite of parsed.cites) {
        const copy = readCaptureBySlug(cite.slug, rendered);
        expect(copy.meta.frozen, site).toBeTruthy();
        expect(manifest.has(`${cite.slug}.meta.json`), site).toBe(true);
        expect(robotsCite(cite.robotsUrl, copy, cite.kind), site).toBe(cite.text);
      }
    }
  });
});

describe("robots-verdict --recheck", () => {
  it("unchanged: the live capture's bytes are the frozen copy's, and a 404 that is still a 404; exit 3, nothing written even with --apply", () => {
    const f = recheckFixture();
    const before = [f.raw(), f.files()];
    for (const args of [[], ["--apply"]]) {
      const got = f.run(...args);
      expect(got.status, got.stderr).toBe(3);
      expect(outcomes(got.stdout)).toEqual([
        ["unchanged", "law.example"],
        ["unchanged", "gone.example"],
      ]);
      expect(got.stdout).toContain(`unchanged   law.example  ${LAW_ROBOTS}: the live capture research/rendered/robots-law.txt is the bytes of the frozen copy research/rendered/robots-law-2026-10-06.txt (sha256 ${hash(FROZEN_LAW).slice(0, 12)})`);
      expect(got.stdout).toContain("answered 404, as the frozen copy research/rendered/robots-gone-2026-10-06.meta.json did (404): no rules either way");
      expect(got.stdout).toContain("totals: 2 site(s): 2 unchanged, 0 unreachable, 0 refresh, 0 revert, 0 error");
      expect([f.raw(), f.files()]).toEqual(before);
    }
    // The same bytes under another fetchedAt are the same robots.txt: only the bytes are compared.
    const later = recheckFixture({ law: { body: FROZEN_LAW, fetchedAt: T1 } });
    expect(later.run().status).toBe(3);
  });

  it("disallowed-path: an unchanged robots.txt that disallows a path queued after the verdict is reported with the list line that queues it; exit 0, nothing written even with --apply", () => {
    // Tick 59 (logs/CHANNEL_LOOP.md §9, "Queued 6.10 (tick 58)" item 2): law.example's verdict was set on its two law pages;
    // a prize list queues a third page on it later, under /search, which the robots.txt it was set on (unchanged) disallows.
    const f = recheckFixture();
    const prize = join(f.dir, "prize.urls.txt");
    writeFileSync(prize, "# a prize list\nhttps://www.law.example/search/prize\tprize-law-search\n");
    const before = [f.raw(), f.files()];
    for (const args of [[], ["--apply"]]) {
      const got = f.run("--urls", prize, ...args);
      expect(got.status, got.stdout + got.stderr).toBe(0);
      expect(outcomes(got.stdout)).toEqual([
        ["disallowed-path", "law.example"],
        ["unchanged", "gone.example"],
      ]);
      expect(got.stdout).toContain(
        `  disallowed-path law.example  ${LAW_ROBOTS}: the live capture research/rendered/robots-law.txt is the bytes of the frozen copy ` +
          `research/rendered/robots-law-2026-10-06.txt (sha256 ${hash(FROZEN_LAW).slice(0, 12)}); but robots.txt disallows 1 queued path(s) for ` +
          'MehudakRenderWatch: prize-law-search (https://www.law.example/search/prize, "Disallow: /search")\n',
      );
      expect(got.stdout).toContain(
        `      DISALLOWED  prize-law-search  https://www.law.example/search/prize  (active; "Disallow: /search")  queued at ${relative(process.cwd(), prize)}:2\n`,
      );
      expect(got.stdout).toContain("      report only, nothing written: retire the line or remove it (a paused line is still queued; research/rendered/README.md)\n");
      expect(got.stdout).toContain("totals: 2 site(s): 1 unchanged, 0 unreachable, 0 refresh, 0 revert, 0 error, 1 disallowed-path\n");
      expect(got.stdout).toContain(args.length ? "\nnothing written\n" : "\ndry run: nothing written\n");
      expect([f.raw(), f.files()]).toEqual(before);
    }
    // recheckSite reports the path and rewrites nothing: the verdict stays NO_TERMS_ROBOTS_OK.
    const urls = `${RE_URLS}${readFileSync(prize, "utf8")}`;
    const r = recheckSite({ site: "law.example", entry: f.sites()["law.example"], urls, renderedDir: f.rendered, today: "2026-10-13" });
    expect([r.outcome, r.entry, r.freezes, r.refused.map((c: { slug: string }) => c.slug), r.checked.length]).toEqual(["disallowed-path", null, [], ["prize-law-search"], 3]);
    // Without that line the site is unchanged again, exit 3.
    expect(f.run().status).toBe(3);
  });

  it("disallowed-path: a paused line is still queued, so pausing it leaves the report; retiring or removing the line clears it", () => {
    // Tick 59 review fix: queuedPaths reads a `# paused … URL<TAB>slug` line as queued (judgeSite judges paused lines on
    // purpose), so the remedy the output names is to retire the line (a `# retired …` comment, never queued) or remove it.
    const f = recheckFixture();
    const prize = join(f.dir, "prize.urls.txt");
    const line = "https://www.law.example/search/prize\tprize-law-search";
    writeFileSync(prize, `# a prize list\n# paused (robots.txt disallows /search, tick 59) — ${line}\n`);
    const paused = f.run("--urls", prize);
    expect(paused.status, paused.stdout + paused.stderr).toBe(0);
    expect(outcomes(paused.stdout)).toEqual([
      ["disallowed-path", "law.example"],
      ["unchanged", "gone.example"],
    ]);
    expect(paused.stdout).toContain(
      `      DISALLOWED  prize-law-search  https://www.law.example/search/prize  (paused; "Disallow: /search")  queued at ${relative(process.cwd(), prize)}:2\n`,
    );
    for (const text of [`# a prize list\n# retired (robots.txt disallows /search, tick 59) — ${line}\n`, "# a prize list\n"]) {
      writeFileSync(prize, text);
      const cleared = f.run("--urls", prize);
      expect(cleared.status, cleared.stdout + cleared.stderr).toBe(3);
      expect(outcomes(cleared.stdout)).toEqual([
        ["unchanged", "law.example"],
        ["unchanged", "gone.example"],
      ]);
      expect(cleared.stdout).toContain("totals: 2 site(s): 2 unchanged, 0 unreachable, 0 refresh, 0 revert, 0 error, 0 disallowed-path\n");
    }
  });

  it("disallowed-path on a host the source does not cite: the path is judged on that host's live robots.txt capture", () => {
    // Tick 59 review fix (the reviewer's mutation R59-3 survived): law.example's source cites www.law.example's robots.txt
    // only; a page queued since on the bare host law.example is judged on that host's live capture, which disallows it.
    const f = recheckFixture();
    const bare = "https://law.example/robots.txt";
    writeRobots(f.rendered, "robots-law-bare", bare, { body: "User-agent: *\nDisallow: /nowww\n" });
    const prize = join(f.dir, "prize.urls.txt");
    writeFileSync(prize, "# a prize list\nhttps://law.example/nowww\tprize-law-nowww\n");
    const got = f.run("--urls", prize);
    expect(got.status, got.stdout + got.stderr).toBe(0);
    expect(outcomes(got.stdout)).toEqual([
      ["disallowed-path", "law.example"],
      ["unchanged", "gone.example"],
    ]);
    expect(got.stdout).toContain('; but robots.txt disallows 1 queued path(s) for MehudakRenderWatch: prize-law-nowww (https://law.example/nowww, "Disallow: /nowww")\n');
    expect(got.stdout).toContain(
      `      DISALLOWED  prize-law-nowww  https://law.example/nowww  (active; "Disallow: /nowww")  queued at ${relative(process.cwd(), prize)}:2\n`,
    );
    // The same host allowing it: unchanged, exit 3, and every path was judged (nothing named as unjudged).
    writeRobots(f.rendered, "robots-law-bare", bare, { body: "User-agent: *\nDisallow: /search\n" });
    const ok = f.run("--urls", prize);
    expect(ok.status, ok.stdout + ok.stderr).toBe(3);
    expect(ok.stdout).not.toContain("not judged");
  });

  it("a page on an uncited host with no robots.txt read never hides a disallowed path on the cited host; the line names the page it left unjudged", () => {
    // Tick 59 review fix (probe P2): judgeRobots stops at the first host it cannot read, so the bare host's page, with no
    // robots.txt capture of its own, used to leave law.example "unchanged" with the /search page never judged.
    const f = recheckFixture();
    const prize = join(f.dir, "prize.urls.txt");
    const at = relative(process.cwd(), prize);
    // The bare host's robots probe, queued but not fetched yet, is no page: it is never named as unjudged.
    writeFileSync(
      prize,
      "# a prize list\nhttps://law.example/nowww\tprize-law-nowww\nhttps://www.law.example/search/prize\tprize-law-search\nhttps://law.example/robots.txt\trobots-law-bare\n",
    );
    const unjudged =
      "; not judged, on a host with no robots.txt read: prize-law-nowww (https://law.example/nowww) — no committed robots.txt capture for " +
      "https://law.example: queue https://law.example/robots.txt as a robots- probe line in urls.txt (a slug starting robots-), let " +
      "render-watch fetch it, then run this again\n";
    const got = f.run("--urls", prize);
    expect(got.status, got.stdout + got.stderr).toBe(0);
    expect(outcomes(got.stdout)).toEqual([
      ["disallowed-path", "law.example"],
      ["unchanged", "gone.example"],
    ]);
    expect(got.stdout).toContain(
      `; but robots.txt disallows 1 queued path(s) for MehudakRenderWatch: prize-law-search (https://www.law.example/search/prize, "Disallow: /search")${unjudged}`,
    );
    expect(got.stdout).toContain(`      DISALLOWED  prize-law-search  https://www.law.example/search/prize  (active; "Disallow: /search")  queued at ${at}:3\n`);
    expect(got.stdout).not.toContain("DISALLOWED  prize-law-nowww");
    const urls = `${RE_URLS}${readFileSync(prize, "utf8")}`;
    const r = recheckSite({ site: "law.example", entry: f.sites()["law.example"], urls, renderedDir: f.rendered, today: "2026-10-13" });
    expect([r.outcome, r.checked.map((c: { slug: string }) => c.slug), r.refused.map((c: { slug: string }) => c.slug)]).toEqual([
      "disallowed-path",
      ["law-one", "law-two", "prize-law-search"],
      ["prize-law-search"],
    ]);
    // Only the uncited page: the site stays unchanged (exit 3), and its line says which page went unjudged.
    writeFileSync(prize, "# a prize list\nhttps://law.example/nowww\tprize-law-nowww\n");
    const only = f.run("--urls", prize);
    expect(only.status, only.stdout + only.stderr).toBe(3);
    expect(outcomes(only.stdout)).toEqual([
      ["unchanged", "law.example"],
      ["unchanged", "gone.example"],
    ]);
    expect(only.stdout).toContain(`(sha256 ${hash(FROZEN_LAW).slice(0, 12)})${unjudged}`);
    // A capture there that is no robots.txt read (a 403) leaves the page unjudged the same way, with its own reason.
    writeRobots(f.rendered, "robots-law-bare", "https://law.example/robots.txt", { body: "<html>no</html>", status: 403 });
    writeFileSync(prize, "# a prize list\nhttps://law.example/nowww\tprize-law-nowww\nhttps://www.law.example/search/prize\tprize-law-search\n");
    const refused = f.run("--urls", prize);
    expect(refused.status, refused.stdout + refused.stderr).toBe(0);
    expect(outcomes(refused.stdout)[0]).toEqual(["disallowed-path", "law.example"]);
    expect(refused.stdout).toContain(
      '"Disallow: /search"); not judged, on a host with no robots.txt read: prize-law-nowww (https://law.example/nowww) — the robots.txt capture of https://law.example (research/rendered/robots-law-bare.meta.json) is not a robots.txt the site served: HTTP 403',
    );
    // And a 5xx there (no answer: complete disallow for a verdict, so nothing to judge that page on).
    writeRobots(f.rendered, "robots-law-bare", "https://law.example/robots.txt", { body: null, status: 503 });
    const down = f.run("--urls", prize);
    expect(down.status, down.stdout + down.stderr).toBe(0);
    expect(outcomes(down.stdout)[0]).toEqual(["disallowed-path", "law.example"]);
    expect(down.stdout).toContain(
      '"Disallow: /search"); not judged, on a host with no robots.txt read: prize-law-nowww (https://law.example/nowww) — the robots.txt capture of https://law.example (research/rendered/robots-law-bare.meta.json) is not a read file (status 503',
    );
  });

  it("unreachable: no live capture, a 403, a 503 or an HTML page; reported, exit 3, nothing written", () => {
    for (const law of [
      null,
      { body: null, status: 403 },
      { body: null, status: 503 },
      { body: "<!DOCTYPE html><html><body>Just a moment...</body></html>", contentType: "text/html; charset=UTF-8" },
    ] as LiveSpec[]) {
      const f = recheckFixture({ law });
      const before = [f.raw(), f.files()];
      const got = f.run("--apply");
      expect(got.status, JSON.stringify(law)).toBe(3);
      expect(outcomes(got.stdout)[0], JSON.stringify(law)).toEqual(["unreachable", "law.example"]);
      expect(got.stdout).toContain("totals: 2 site(s): 1 unchanged, 1 unreachable, 0 refresh, 0 revert, 0 error");
      expect([f.raw(), f.files()], JSON.stringify(law)).toEqual(before);
    }
  });

  it("refresh: a changed robots.txt that still allows every queued path is frozen, cited and noted; every other byte of the entry stays", () => {
    const f = recheckFixture({ law: { body: ALLOWING, fetchedAt: T1 } });
    const raw0 = f.raw();
    const files0 = f.files();
    const old = f.sites()["law.example"];
    const day = today();
    const sentence = `Re-checked ${day}: robots.txt changed (${hash(FROZEN_LAW).slice(0, 12)} → ${hash(ALLOWING).slice(0, 12)}), all 2 queued paths still allowed.`;

    // Dry run: says what it would do, writes nothing.
    const dry = f.run();
    expect(dry.status, dry.stderr).toBe(0);
    expect(outcomes(dry.stdout)).toEqual([
      ["refresh", "law.example"],
      ["unchanged", "gone.example"],
    ]);
    expect(dry.stdout).toMatch(/allowed\s+law-one\s+https:\/\/www\.law\.example\/law_html\/law00\/1\.htm\s+\(paused; no rule\)/);
    expect(dry.stdout).toContain("would freeze robots-law -> robots-law-2026-10-13");
    expect(dry.stdout).toContain(`the note gains: ${sentence}`);
    expect(dry.stdout).toContain("dry run: nothing written");
    expect([f.raw(), f.files()]).toEqual([raw0, files0]);

    const got = f.run("--apply");
    expect(got.status, got.stderr).toBe(0);
    expect(got.stdout).toContain("froze robots-law -> robots-law-2026-10-13");
    // The new frozen copy: the live capture's bytes, a meta naming itself and where it came from, both files recorded.
    expect(readFileSync(join(f.rendered, "robots-law-2026-10-13.txt"), "utf8")).toBe(ALLOWING);
    const meta = JSON.parse(readFileSync(join(f.rendered, "robots-law-2026-10-13.meta.json"), "utf8"));
    expect([meta.slug, meta.bodyPath, meta.fetchedAt, meta.sha256]).toEqual(["robots-law-2026-10-13", "research/rendered/robots-law-2026-10-13.txt", T1, hash(ALLOWING)]);
    expect([meta.frozen.on, meta.frozen.from, meta.frozen.commit, meta.frozen.flagged?.kind]).toEqual([day, "research/rendered/robots-law.meta.json", null, "short"]);
    expect(meta.frozen.why).toContain("scripts/robots-verdict.mjs --recheck");
    const manifest: Map<string, string> = readManifest(f.rendered);
    expect(manifest.get("robots-law-2026-10-13.txt")).toBe(hash(ALLOWING));
    expect(manifest.get("robots-law-2026-10-13.meta.json")).toBe(hash(readFileSync(join(f.rendered, "robots-law-2026-10-13.meta.json"))));
    expect(manifest.size).toBe(7);
    expect(checkManifest(f.rendered)).toEqual([]);
    // The entry: only the citation and the note's new last sentence differ, byte for byte.
    const cite = `robots.txt read at research/rendered/robots-law-2026-10-13.txt (${LAW_ROBOTS}, fetched ${T1}, sha256 ${hash(ALLOWING).slice(0, 12)})`;
    const oldCite = parseRobotsSource(old.source).cites[0].text;
    const entry = f.sites()["law.example"];
    expect(entry.source).toBe(`${cite}${old.source.slice(oldCite.length)}`);
    expect(entry.note).toBe(`${NOTE}. ${sentence}`);
    expect({ ...entry, source: old.source, note: old.note }).toEqual(old);
    expect(Object.keys(entry)).toEqual(Object.keys(old));
    expect(isRobotsOkVerdict(entry)).toBe(true);
    // Nothing else in the file moved, and the file keeps its one format.
    const before = JSON.parse(raw0).sites;
    const after = f.sites();
    for (const site of ["gone.example", "hand.example", "open.example"]) expect(after[site], site).toEqual(before[site]);
    expect(f.raw()).toBe(serializeVerdicts(JSON.parse(f.raw())));
    // The paused lines still pass the gate, and a second re-check finds the new copy is the live bytes.
    expect(termsGate("https://www.law.example/law_html/law00/1.htm", "law-one", after).ok).toBe(true);
    const again = f.run("--apply");
    expect(again.status).toBe(3);
    expect(outcomes(again.stdout)[0]).toEqual(["unchanged", "law.example"]);
    expect(again.stdout).toContain("robots-law-2026-10-13.txt (sha256");
  });

  it("refresh: a 200 that became a 404 is no rules (RFC 9309 §2.3.1.3), re-judged and frozen as its meta alone; a 404 that became a file likewise", () => {
    const f = recheckFixture({ law: { body: null, status: 404, fetchedAt: T1 } });
    // A body an earlier fetch left beside the 404's meta is not the answer: the copy holds the meta and what it names.
    writeFileSync(join(f.rendered, "robots-law.txt"), FROZEN_LAW);
    const old = f.sites()["law.example"];
    const got = f.run("--apply");
    expect(got.status, got.stderr).toBe(0);
    expect(outcomes(got.stdout)[0]).toEqual(["refresh", "law.example"]);
    expect(existsSync(join(f.rendered, "robots-law-2026-10-13.meta.json"))).toBe(true);
    expect(existsSync(join(f.rendered, "robots-law-2026-10-13.txt"))).toBe(false);
    expect(checkManifest(f.rendered)).toEqual([]);
    const entry = f.sites()["law.example"];
    expect(entry.source.startsWith(`robots.txt answered 404 at ${LAW_ROBOTS} (research/rendered/robots-law-2026-10-13.meta.json, fetched ${T1}): no rules, RFC 9309 §2.3.1.3: all 2 queued paths allowed`)).toBe(true);
    expect(entry.note).toBe(`${NOTE}. Re-checked ${today()}: robots.txt changed (${hash(FROZEN_LAW).slice(0, 12)} → HTTP 404), all 2 queued paths still allowed.`);
    expect(entry.verdict).toBe(old.verdict);

    const g = recheckFixture({ gone: { body: "User-agent: *\nAllow: /\n", fetchedAt: T1 } });
    const gotG = g.run("--apply");
    expect(gotG.status, gotG.stderr).toBe(0);
    expect(outcomes(gotG.stdout)).toEqual([
      ["unchanged", "law.example"],
      ["refresh", "gone.example"],
    ]);
    const gone = g.sites()["gone.example"];
    expect(gone.note).toBe(`${GONE_NOTE} Re-checked ${today()}: robots.txt changed (HTTP 404 → ${hash("User-agent: *\nAllow: /\n").slice(0, 12)}), all 1 queued path still allowed.`);
    expect(gone.source.startsWith(`robots.txt read at research/rendered/robots-gone-2026-10-13.txt (${GONE_ROBOTS}, fetched ${T1}, sha256 `)).toBe(true);
  });

  it("revert: a changed robots.txt that disallows a queued path sends the site back to NO_TERMS, the path named, the history and the kind word kept", () => {
    const f = recheckFixture({ law: { body: REFUSING, fetchedAt: T1 } });
    const raw0 = f.raw();
    const files0 = f.files();
    const urls0 = readFileSync(f.urlsFile, "utf8");
    const old = f.sites()["law.example"];
    const day = today();
    const dry = f.run();
    expect(dry.status, dry.stderr).toBe(0);
    expect(outcomes(dry.stdout)[0]).toEqual(["revert", "law.example"]);
    expect(dry.stdout).toMatch(/DISALLOWED\s+law-two\s+https:\/\/www\.law\.example\/law_html\/law01\/2\.htm\s+\(paused; "Disallow: \/law_html\/law01\/"\)/);
    expect([f.raw(), f.files()]).toEqual([raw0, files0]);

    const got = f.run("--apply");
    expect(got.status, got.stderr).toBe(0);
    const entry = f.sites()["law.example"];
    expect(entry.verdict).toBe("NO_TERMS");
    expect([old.checked, entry.checked]).toEqual(["2026-10-01", day]);
    expect(entry.copying).toBe(old.copying);
    const refused = 'law-two (https://www.law.example/law_html/law01/2.htm, "Disallow: /law_html/law01/")';
    // The note: the old one whole, its kind word first, then the dated sentence naming the path.
    expect(entry.note).toBe(
      `${NOTE}. Re-checked ${day}: robots.txt changed (${hash(FROZEN_LAW).slice(0, 12)} → ${hash(REFUSING).slice(0, 12)}) and now disallows 1 of 2 queued paths for MehudakRenderWatch: ${refused}; the verdict is NO_TERMS again (scripts/robots-verdict.mjs --recheck), and the robots probe stays on the weekly watch.`,
    );
    expect(isExhaustiveNegative(entry)).toBe(true);
    // The source: the declined judgement on the new frozen copy, the ruling, and the whole NO_TERMS_ROBOTS_OK source after it.
    expect(entry.source).toBe(
      `robots.txt read at research/rendered/robots-law-2026-10-13.txt (${LAW_ROBOTS}, fetched ${T1}, sha256 ${hash(REFUSING).slice(0, 12)}): ` +
        `robots.txt disallows 1 queued path(s) for MehudakRenderWatch: ${refused} (re-checked ${day} by scripts/robots-verdict.mjs --recheck); ` +
        `ruling research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v); NO_TERMS_ROBOTS_OK before: ${old.source}`,
    );
    expect(readFileSync(join(f.rendered, "robots-law-2026-10-13.txt"), "utf8")).toBe(REFUSING);
    expect(checkManifest(f.rendered)).toEqual([]);
    // Read back: the new copy's citation, the day, and the source it replaced, whole; no other source reads as a revert.
    const declined = parseRevertSource(entry.source);
    expect([declined.cites.map((c: { slug: string }) => c.slug), declined.day, declined.replaced]).toEqual([["robots-law-2026-10-13"], day, old.source]);
    expect(declined.cites[0].text).toBe(`robots.txt read at research/rendered/robots-law-2026-10-13.txt (${LAW_ROBOTS}, fetched ${T1}, sha256 ${hash(REFUSING).slice(0, 12)})`);
    for (const other of [old.source, `a hand note${entry.source.slice(entry.source.indexOf(": robots.txt disallows "))}`, ""]) expect(parseRevertSource(other)).toBeNull();
    // The gate: the site's lines no longer pass, its robots probe still does; urls.txt itself is not touched.
    const after = f.sites();
    expect(termsGate("https://www.law.example/law_html/law00/1.htm", "law-one", after).ok).toBe(false);
    expect(termsGate("https://www.law.example/law_html/law00/1.htm", "law-one", JSON.parse(raw0).sites).ok).toBe(true);
    expect(termsGate(LAW_ROBOTS, "robots-law", after).ok).toBe(true);
    expect(readFileSync(f.urlsFile, "utf8")).toBe(urls0);
    for (const site of ["gone.example", "hand.example", "open.example"]) expect(after[site], site).toEqual(JSON.parse(raw0).sites[site]);
    // NO_TERMS now: a second re-check leaves it alone, and judgeSite can judge it again on a later robots.txt.
    const again = f.run();
    expect(again.status).toBe(3);
    expect(outcomes(again.stdout)).toEqual([["unchanged", "gone.example"]]);
    expect(judgeSite({ site: "law.example", verdicts: { sites: after }, urls: RE_URLS, readCapture: () => null, today: day }).why).toMatch(/no committed robots\.txt capture/);
  });

  it("never touches a site that is not NO_TERMS_ROBOTS_OK, whatever its source says", () => {
    // hand.example's source is in the script's form and its live capture changed, but its verdict is NO_TERMS.
    const f = recheckFixture({ law: { body: ALLOWING, fetchedAt: T1 } });
    const hand = f.sites()["hand.example"];
    expect(parseRobotsSource(hand.source)).not.toBeNull();
    const got = f.run("--apply");
    expect(got.status).toBe(0);
    expect(got.stdout).not.toContain("hand.example");
    expect(got.stdout).toContain("robots-verdict --recheck: 2 NO_TERMS_ROBOTS_OK site(s)");
    expect(f.sites()["hand.example"]).toEqual(hand);
    expect(readdirSync(f.rendered).filter((n) => n.startsWith("robots-hand-") && !n.startsWith("robots-hand-2026-10-06"))).toEqual([]);
    // Called directly, the function says so and builds nothing.
    const out = recheckSite({ site: "hand.example", entry: hand, urls: RE_URLS, renderedDir: f.rendered, today: "2026-10-13" });
    expect([out.outcome, out.entry, out.freezes]).toEqual(["skipped", null, []]);
    expect(recheckSite({ site: "open.example", entry: f.sites()["open.example"], urls: RE_URLS, renderedDir: f.rendered, today: "2026-10-13" }).outcome).toBe("skipped");
  });

  it("--site re-checks one site; a site it cannot re-check is an error", () => {
    const f = recheckFixture({ law: { body: ALLOWING, fetchedAt: T1 }, gone: { body: "User-agent: *\nAllow: /\n", fetchedAt: T1 } });
    const old = f.sites();
    const got = f.run("--site", "GONE.example", "--apply");
    expect(got.status, got.stderr).toBe(0);
    expect(outcomes(got.stdout)).toEqual([["refresh", "gone.example"]]);
    expect(got.stdout).toContain("totals: 1 site(s): 0 unchanged, 0 unreachable, 1 refresh, 0 revert, 0 error");
    const now = f.sites();
    expect(now["law.example"]).toEqual(old["law.example"]);
    expect(now["gone.example"]).not.toEqual(old["gone.example"]);
    expect(existsSync(join(f.rendered, "robots-law-2026-10-13.txt"))).toBe(false);
    for (const [args, why] of [
      [["--site", "nowhere.example"], /no such site/],
      [["--site", "open.example"], /it is NOT_BARRED, and only a NO_TERMS_ROBOTS_OK site is re-checked/],
      [["--site", "hand.example"], /it is NO_TERMS/],
      [["law.example"], /usage/],
    ] as Array<[string[], RegExp]>) {
      const bad = f.run(...args);
      expect(bad.status, args.join(" ")).toBe(1);
      expect(bad.stderr, args.join(" ")).toMatch(why);
    }
    expect(spawnSync(process.execPath, [SCRIPT, "--site", "law.example"], { encoding: "utf8" }).status).toBe(1);
  });

  it("errors (exit 1) on a source that cites a live capture or a copy that does not hold what it says, and still re-checks the others", () => {
    const f = recheckFixture({ gone: { body: "User-agent: *\nAllow: /\n", fetchedAt: T1 } });
    const s = f.sites();
    const live = s["law.example"].source.replace("robots-law-2026-10-06.txt", "robots-law.txt");
    writeFileSync(f.verdictsFile, serializeVerdicts({ _about: "test file", sites: { ...s, "law.example": { ...s["law.example"], source: live } } }));
    const got = f.run("--apply");
    expect(got.status).toBe(1);
    expect(outcomes(got.stdout)).toEqual([
      ["error", "law.example"],
      ["refresh", "gone.example"],
    ]);
    expect(got.stdout).toContain("a live capture the weekly run rewrites, not a frozen copy");
    expect(f.sites()["law.example"].source).toBe(live);
    expect(f.sites()["gone.example"].note).toContain("Re-checked");

    // A frozen copy whose bytes are not the ones the citation hashes.
    const g = recheckFixture();
    writeFileSync(join(g.rendered, "robots-law-2026-10-06.txt"), "User-agent: *\nDisallow: /\n");
    const bad = g.run();
    expect(bad.status).toBe(1);
    expect(bad.stdout).toMatch(/error\s+law\.example .*robots-law-2026-10-06\.txt hashes to [0-9a-f]{12}, not [0-9a-f]{12} as the source says/);
  });

  it("errors (exit 1) when the cited frozen copy is of another URL, another fetch, another kind or another status than the citation says", () => {
    const LAW_COPY = "robots-law-2026-10-06";
    const GONE_COPY = "robots-gone-2026-10-06";
    const editMeta = (f: Fixture, slug: string, edit: Record<string, unknown>) => {
      const path = join(f.rendered, `${slug}.meta.json`);
      writeFileSync(path, `${JSON.stringify({ ...JSON.parse(readFileSync(path, "utf8")), ...edit }, null, 2)}\n`);
    };
    const cases: Array<{ name: string; edit: (f: Fixture) => void; site: string; other: string; why: string }> = [
      {
        name: "another URL",
        edit: (f) => editMeta(f, LAW_COPY, { url: "https://other.example/robots.txt" }),
        site: "law.example",
        other: "gone.example",
        why: `research/rendered/${LAW_COPY}.txt is a copy of https://other.example/robots.txt, not of ${LAW_ROBOTS}`,
      },
      {
        name: "another fetch",
        edit: (f) => editMeta(f, LAW_COPY, { fetchedAt: T1 }),
        site: "law.example",
        other: "gone.example",
        why: `research/rendered/${LAW_COPY}.txt was fetched ${T1}, not ${T0} as the source says`,
      },
      {
        name: "a 404 where the source cites a file",
        edit: (f) =>
          editMeta(f, LAW_COPY, { status: 404, contentType: "text/html; charset=utf-8", error: "HTTP 404", sha256: null, byteLength: 0, bodyPath: null }),
        site: "law.example",
        other: "gone.example",
        why: `research/rendered/${LAW_COPY}.txt reads as absent, not as the file the source cites`,
      },
      {
        name: "a file where the source cites a 404",
        edit: (f) => writeRobots(f.rendered, GONE_COPY, GONE_ROBOTS, { body: "User-agent: *\nAllow: /\n" }, frozenBlock("robots-gone")),
        site: "gone.example",
        other: "law.example",
        why: `research/rendered/${GONE_COPY}.meta.json reads as file, not as the 404/410 the source cites`,
      },
      {
        name: "a 410 where the source cites a 404",
        edit: (f) => editMeta(f, GONE_COPY, { status: 410, error: "HTTP 410" }),
        site: "gone.example",
        other: "law.example",
        why: `research/rendered/${GONE_COPY}.meta.json answered 410, not 404 as the source says`,
      },
    ];
    for (const c of cases) {
      const f = recheckFixture();
      c.edit(f);
      const before = [f.raw(), f.files()];
      const got = f.run("--apply");
      expect(got.status, c.name).toBe(1);
      const lines = got.stdout.split("\n");
      expect(lines.find((l) => l.startsWith(`  error       ${c.site}  `)), c.name).toBe(`  error       ${c.site}  ${c.why}`);
      expect(outcomes(got.stdout).find(([, s]) => s === c.other), c.name).toEqual(["unchanged", c.other]);
      expect([f.raw(), f.files()], c.name).toEqual(before);
    }
  });

  it("refresh: a changed robots.txt of the same length is a change: the bytes are compared, not the size", () => {
    const same = FROZEN_LAW.replace("Disallow: /search", "Disallow: /searcH");
    expect([same.length, same === FROZEN_LAW]).toEqual([FROZEN_LAW.length, false]);
    const f = recheckFixture({ law: { body: same, fetchedAt: T1 } });
    const got = f.run();
    expect(got.status, got.stderr).toBe(0);
    expect(outcomes(got.stdout)[0]).toEqual(["refresh", "law.example"]);
    expect(got.stdout).toContain(`robots.txt changed (${hash(FROZEN_LAW).slice(0, 12)} → ${hash(same).slice(0, 12)})`);
  });

  it("refresh: the source keeps its own count of queued paths; the note's sentence counts the paths re-checked now", () => {
    // A third law page queued since the verdict was set: the re-check judges 3, the source still says what was judged then.
    const f = recheckFixture({ law: { body: ALLOWING, fetchedAt: T1 } });
    writeFileSync(f.urlsFile, `${RE_URLS}https://www.law.example/law_html/law02/3.htm\tlaw-three\n`);
    const old = f.sites()["law.example"];
    const got = f.run("--apply");
    expect(got.status, got.stderr).toBe(0);
    const entry = f.sites()["law.example"];
    expect(parseRobotsSource(entry.source).rest).toBe(parseRobotsSource(old.source).rest);
    expect(parseRobotsSource(entry.source).rest.startsWith(": all 2 queued paths allowed for MehudakRenderWatch")).toBe(true);
    expect(entry.note.endsWith(`→ ${hash(ALLOWING).slice(0, 12)}), all 3 queued paths still allowed.`)).toBe(true);
  });

  it("refuses to freeze a copy that is not the live answer, whatever version it is handed (an older one a fallback returns)", () => {
    const f = recheckFixture();
    const older = diskFiles("robots-law", f.rendered);
    // The live capture is a 404 now, the 200's body left beside its meta; the version handed to the freeze is the 200.
    writeRobots(f.rendered, "robots-law", LAW_ROBOTS, { body: null, status: 404, fetchedAt: T1 });
    const entry = f.sites()["law.example"];
    const versionOf = () => ({ commit: "abc1234", files: older, note: "the fetch after it failed" });
    expect(() => recheckSite({ site: "law.example", entry, urls: RE_URLS, renderedDir: f.rendered, today: "2026-10-13", versionOf })).toThrow(
      /a freeze of research\/rendered\/robots-law would cite is not its live answer \(it reads as file 200, the live capture as absent 404\): nothing frozen or written$/,
    );
    // The same for an older 200 handed in for a live 200 of other bytes.
    const g = recheckFixture();
    const older200 = diskFiles("robots-law", g.rendered);
    writeRobots(g.rendered, "robots-law", LAW_ROBOTS, { body: ALLOWING, fetchedAt: T1 });
    expect(() =>
      recheckSite({ site: "law.example", entry: g.sites()["law.example"], urls: RE_URLS, renderedDir: g.rendered, today: "2026-10-13", versionOf: () => ({ commit: "abc1234", files: older200, note: null }) }),
    ).toThrow(/would cite is not its live answer \(it reads as file 200, the live capture as file 200\)/);
    // Handed the live version, the same re-check is a refresh on the 404.
    const live = recheckSite({ site: "law.example", entry, urls: RE_URLS, renderedDir: f.rendered, today: "2026-10-13" });
    expect([live.outcome, live.freezes.map((p: { plan: { frozenSlug: string } }) => p.plan.frozenSlug)]).toEqual(["refresh", ["robots-law-2026-10-13"]]);
  });

  it("errors when the robots.txt changed and no page of the site is queued in the lists it read", () => {
    const f = recheckFixture({ law: { body: ALLOWING, fetchedAt: T1 } });
    writeFileSync(f.urlsFile, "https://www.law.example/robots.txt\trobots-law\n");
    const before = f.raw();
    const got = f.run("--apply");
    expect(got.status).toBe(1);
    expect(got.stdout).toMatch(/error\s+law\.example\s+robots\.txt changed .*has no queued page/);
    expect(f.raw()).toBe(before);
  });

  it("refuses to write a verdicts file that is not in serializeVerdicts' format", () => {
    const f = recheckFixture({ law: { body: ALLOWING, fetchedAt: T1 } });
    writeFileSync(f.verdictsFile, `${f.raw()}\n`);
    const before = [f.raw(), f.files()];
    const got = f.run("--apply");
    expect(got.status).toBe(1);
    expect(got.stderr).toMatch(/not in the format serializeVerdicts writes/);
    expect([f.raw(), f.files()]).toEqual(before);
    // A dry run writes nothing, so it does not care, and it leaves the file in the format it found it in.
    expect(f.run().status).toBe(0);
    expect([f.raw(), f.files()]).toEqual(before);
  });

  it("names the commit the live capture came from when --rendered is a repository's research/rendered, and refuses an uncommitted one", () => {
    const f = recheckFixture({ law: { body: ALLOWING, fetchedAt: T1 }, repo: true });
    const git = (...args: string[]) => spawnSync("git", ["-C", f.dir, "-c", "user.name=fixture", "-c", "user.email=fixture", "-c", "commit.gpgsign=false", ...args], { encoding: "utf8" });
    expect(git("init", "-q").status).toBe(0);
    expect(git("add", "-A").status).toBe(0);
    expect(git("commit", "-q", "-m", "fixture").status).toBe(0);
    const commit = git("log", "-1", "--format=%h").stdout.trim();
    // An uncommitted live capture: the copy could not name the commit its bytes came from.
    writeFileSync(join(f.rendered, "robots-law.txt"), `${ALLOWING}# edited\n`);
    const dirty = f.run("--apply");
    expect(dirty.status).toBe(1);
    expect(dirty.stdout).toMatch(/error\s+law\.example .*uncommitted changes/);
    expect(existsSync(join(f.rendered, "robots-law-2026-10-13.txt"))).toBe(false);
    expect(git("checkout", "--", "research/rendered/robots-law.txt").status).toBe(0);
    const got = f.run("--apply");
    expect(got.status, got.stdout + got.stderr).toBe(0);
    const meta = JSON.parse(readFileSync(join(f.rendered, "robots-law-2026-10-13.meta.json"), "utf8"));
    expect(meta.frozen.commit).toBe(commit);
    expect(meta.frozen.why).toContain(`as commit ${commit} stored it`);
  });

  it("refresh in a repository: a 200 that became a 404, its old body left on disk, is frozen as the 404's meta alone and cited; a second run finds it unchanged", () => {
    // A robots.txt long enough for capture-check to call a read page (>= MIN_TERMS_TEXT characters), as aicrowd.com's,
    // eurocontrol.int's, health-data-hub.fr's and wundernn.io's are: then freeze-capture's sourceVersion reads a failed
    // fetch beside it as "the fetch after it failed" and hands back the older 200 version (review of tick 58, blocking).
    const long = `User-agent: *\nDisallow: /search\n${Array.from({ length: 50 }, (_, i) => `Disallow: /private/area-${String(i).padStart(2, "0")}/\n`).join("")}`;
    expect(long.length).toBeGreaterThanOrEqual(1000);
    const f = recheckFixture({ frozenLaw: long, law: { body: long }, repo: true });
    const git = (...args: string[]) => spawnSync("git", ["-C", f.dir, "-c", "user.name=fixture", "-c", "user.email=fixture", "-c", "commit.gpgsign=false", ...args], { encoding: "utf8" });
    expect(git("init", "-q").status).toBe(0);
    expect(git("add", "-A").status).toBe(0);
    expect(git("commit", "-q", "-m", "render 6.10").status).toBe(0);
    // The weekly render's 404: render-watch writes the failed fetch's meta (no sha256, no bodyPath) and no file, so the
    // 6.10 body stays on disk beside it.
    writeRobots(f.rendered, "robots-law", LAW_ROBOTS, { body: null, status: 404, fetchedAt: T1 });
    expect(readFileSync(join(f.rendered, "robots-law.txt"), "utf8")).toBe(long);
    expect(git("add", "-A").status).toBe(0);
    expect(git("commit", "-q", "-m", "render 13.10").status).toBe(0);
    const metaCommit = git("log", "-1", "--format=%h").stdout.trim();
    // A later commit that touches no capture: the copy names the commit that wrote the meta, not HEAD.
    writeFileSync(join(f.dir, "later.txt"), "later\n");
    expect(git("add", "-A").status).toBe(0);
    expect(git("commit", "-q", "-m", "later").status).toBe(0);
    expect(git("log", "-1", "--format=%h").stdout.trim()).not.toBe(metaCommit);
    expect(sourceVersion(f.dir, "robots-law").note).toMatch(/^the fetch after it failed \(its meta: status 404\)/);
    const old = f.sites()["law.example"];
    const sentence = `Re-checked ${today()}: robots.txt changed (${hash(long).slice(0, 12)} → HTTP 404), all 2 queued paths still allowed.`;

    const got = f.run("--apply");
    expect(got.status, got.stdout + got.stderr).toBe(0);
    expect(outcomes(got.stdout)[0]).toEqual(["refresh", "law.example"]);
    expect(got.stdout).toContain("froze robots-law -> robots-law-2026-10-13");
    // The copy is the 404's meta, as the commit that wrote it stored it, and nothing else: not the body the 6.10 fetch left.
    const meta = JSON.parse(readFileSync(join(f.rendered, "robots-law-2026-10-13.meta.json"), "utf8"));
    expect([meta.status, meta.bodyPath, meta.sha256, meta.fetchedAt, meta.frozen.commit]).toEqual([404, null, null, T1, metaCommit]);
    expect(meta.frozen.why).toContain(`as commit ${metaCommit} stored it`);
    expect(readdirSync(f.rendered).filter((n) => n.startsWith("robots-law-2026-10-13"))).toEqual(["robots-law-2026-10-13.meta.json"]);
    expect(checkManifest(f.rendered)).toEqual([]);
    const entry = f.sites()["law.example"];
    expect(entry.source).toBe(
      `robots.txt answered 404 at ${LAW_ROBOTS} (research/rendered/robots-law-2026-10-13.meta.json, fetched ${T1}): no rules, RFC 9309 §2.3.1.3${parseRobotsSource(old.source).rest}`,
    );
    expect(entry.note).toBe(`${NOTE}. ${sentence}`);
    expect({ ...entry, source: old.source, note: old.note }).toEqual(old);

    // The copy it cites is the live answer now: a second run changes nothing, and the note gains no second sentence.
    const again = f.run("--apply");
    expect(again.status, again.stdout + again.stderr).toBe(3);
    expect(outcomes(again.stdout)[0]).toEqual(["unchanged", "law.example"]);
    expect(f.sites()["law.example"]).toEqual(entry);
  });

  it("isRecheckOf reads each rewrite back to the entry it rewrote; beforeRechecks puts that entry back and nothing else", () => {
    const T2 = "2026-10-20T05:23:00.000Z";
    // One refresh, then a second one a week later, then a revert: each state is the 6.10 entry after re-checks.
    const f = recheckFixture({ law: { body: ALLOWING, fetchedAt: T1 } });
    const base = f.sites()["law.example"];
    expect(isRecheckOf(base, base)).toBe(true);
    expect(f.run("--apply").status).toBe(0);
    const once = f.sites()["law.example"];
    writeRobots(f.rendered, "robots-law", LAW_ROBOTS, { body: `${ALLOWING}Disallow: /tmp/\n`, fetchedAt: T2 });
    expect(f.run("--apply").status).toBe(0);
    const twice = f.sites()["law.example"];
    writeRobots(f.rendered, "robots-law", LAW_ROBOTS, { body: REFUSING, fetchedAt: "2026-10-27T05:23:00.000Z" });
    expect(f.run("--apply").status).toBe(0);
    const reverted = f.sites()["law.example"];
    expect([once.verdict, twice.verdict, reverted.verdict]).toEqual(["NO_TERMS_ROBOTS_OK", "NO_TERMS_ROBOTS_OK", "NO_TERMS"]);
    expect(twice.note.split("Re-checked ").length - 1).toBe(2);
    for (const [name, e] of Object.entries({ once, twice, reverted })) expect(isRecheckOf(e, base), name).toBe(true);
    // A revert straight from the 6.10 entry, and a 404 that became a file, too.
    const r = recheckFixture({ law: { body: REFUSING, fetchedAt: T1 }, gone: { body: "User-agent: *\nAllow: /\n", fetchedAt: T1 } });
    const rBase = r.sites();
    expect(r.run("--apply").status).toBe(0);
    expect(isRecheckOf(r.sites()["law.example"], rBase["law.example"])).toBe(true);
    const straight = r.sites()["law.example"];
    expect(isRecheckOf({ ...straight, source: straight.source.replace(/NO_TERMS_ROBOTS_OK before: .*$/, "NO_TERMS_ROBOTS_OK before: lost") }, rBase["law.example"])).toBe(false);
    expect(isRecheckOf(r.sites()["gone.example"], rBase["gone.example"])).toBe(true);
    expect(r.sites()["law.example"].verdict).toBe("NO_TERMS");

    // Anything else is not a re-check of it.
    const day = today();
    const not: Record<string, Record<string, string>> = {
      "another field": { ...once, copying: "allowed" },
      "the rest of the source": { ...once, source: once.source.replace(": all 2 queued paths allowed", ": all 3 queued paths allowed") },
      "the old note changed, its length kept": { ...once, note: once.note.replace("fetchable only", "fetchable ONLY") },
      "a word after the sentence": { ...once, note: `${once.note} Also.` },
      "no sentence": { ...once, note: base.note },
      "the joiner and no sentence": { ...once, note: `${base.note}. ` },
      "the checked date of a refresh": { ...once, checked: "2026-10-13" },
      "a revert dated another day": { ...reverted, checked: "2026-10-01" },
      "a revert that keeps NO_TERMS_ROBOTS_OK": { ...reverted, verdict: "NO_TERMS_ROBOTS_OK" },
      "a revert's history cut": { ...reverted, source: reverted.source.replace(/NO_TERMS_ROBOTS_OK before: .*$/, "NO_TERMS_ROBOTS_OK before: lost") },
      "a revert's citation not one the script writes": { ...reverted, source: `a hand note${reverted.source.slice(reverted.source.indexOf(": robots.txt disallows "))}` },
      "another verdict": { ...once, verdict: "NOT_BARRED" },
      "a revert under another verdict": { ...reverted, verdict: "BARRED" },
      "a field more": { ...once, extra: "x" },
    };
    for (const [name, e] of Object.entries(not)) expect(isRecheckOf(e, base), name).toBe(false);
    // judgeSite setting the reverted site again is a new verdict, not a re-check.
    const again = judgeSite({
      site: "law.example",
      verdicts: { sites: { "law.example": reverted } },
      urls: RE_URLS,
      readCapture: reader({ [LAW_ROBOTS]: capture(FROZEN_LAW) }),
      today: day,
    });
    expect(again.changed).toBe(true);
    expect(isRecheckOf(again.verdicts.sites["law.example"], base)).toBe(false);
    // The base must be a NO_TERMS_ROBOTS_OK entry with the script's citation.
    expect(isRecheckOf(once, { ...base, verdict: "NO_TERMS" })).toBe(false);
    expect(isRecheckOf(once, { ...base, source: "a hand source" })).toBe(false);

    // beforeRechecks: the re-checked entry put back, a hand-edited one and every other entry left as they are.
    const now = f.sites();
    const edited = { ...now, "gone.example": { ...now["gone.example"], note: "edited by hand" } };
    const back = beforeRechecks(edited, { "law.example": base, "gone.example": recheckFixture().sites()["gone.example"], "missing.example": base });
    expect(back["law.example"]).toEqual(base);
    expect(back["gone.example"]).toEqual(edited["gone.example"]);
    expect(back["hand.example"]).toBe(edited["hand.example"]);
    expect(Object.keys(back)).toEqual(Object.keys(edited));
    expect(edited["law.example"]).toEqual(reverted);
  });

  it("judgeRobots, shared with judgeSite, counts a page queued in two lists once", () => {
    const one = judgeRobots({ site: "law.example", urls: URLS, readCapture: reader({ [LAW_ROBOTS]: capture(FROZEN_LAW) }) });
    const twice = judgeRobots({ site: "law.example", urls: `${URLS}${URLS}`, readCapture: reader({ [LAW_ROBOTS]: capture(FROZEN_LAW) }) });
    expect([one.kind, one.checked.length, twice.kind, twice.checked.length]).toEqual(["allowed", 2, "allowed", 2]);
  });

  it("re-checks the committed store dry: every NO_TERMS_ROBOTS_OK site unchanged (or unreachable), exit 3, nothing written", () => {
    // A tripwire: after a weekly render (Tuesday 05:23 UTC) rewrites one of these robots.txt captures, this fails until the
    // 07:11 tick runs `--recheck --apply` and commits the refresh or the revert. The rest of the suite reads the verdicts as
    // they stood before any re-check where it holds an earlier tick's state (beforeRechecks); the hand edits a refresh or a
    // revert still needs are listed in the script's header ("When it runs").
    const verdictsFile = join(ROOT, "research", "channel-loop", "terms-verdicts.json");
    const manifestFile = join(ROOT, "research", "rendered", "FROZEN.sha256");
    const before = [readFileSync(verdictsFile, "utf8"), readFileSync(manifestFile, "utf8")];
    const sites = Object.entries(JSON.parse(before[0]).sites as Record<string, { verdict: string }>)
      .filter(([, e]) => e.verdict === "NO_TERMS_ROBOTS_OK")
      .map(([s]) => s);
    const got = spawnSync(process.execPath, [SCRIPT, "--recheck"], { encoding: "utf8", cwd: ROOT });
    expect(got.status, got.stdout + got.stderr).toBe(3);
    const lines = outcomes(got.stdout);
    expect(lines.map(([, s]) => s)).toEqual(sites);
    expect(lines.filter(([o]) => o !== "unchanged" && o !== "unreachable")).toEqual([]);
    expect(got.stdout).toContain(`robots-verdict --recheck: ${sites.length} NO_TERMS_ROBOTS_OK site(s); queued paths from research/rendered/urls.txt, research/measurements/ai-allowed-events.urls.txt (dry run; --apply writes)`);
    expect([readFileSync(verdictsFile, "utf8"), readFileSync(manifestFile, "utf8")]).toEqual(before);
  });
});
