import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  checkManifest,
  cited,
  classifyFiles,
  commitFiles,
  diskFiles,
  existingCopy,
  findCitations,
  freezeCapture,
  isDay,
  listedNames,
  main,
  MANIFEST,
  maskCapture,
  planFreeze,
  readManifest,
  recordFiles,
  repoint,
  resolveCommit,
  sourceVersion,
  writtenIn,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/freeze-capture.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { redactSecrets } from "../../../scripts/render-watch.mjs";

/**
 * scripts/freeze-capture.mjs (tick 38, 30.9.2026): a dated copy of a render-watch capture that the weekly render never
 * rewrites, in the shape of the two copies frozen by hand (nevo-vat-law-2026-09-29, kokoro-82m-model-card-2026-09-29),
 * and --cited, which freezes what the decision-bearing files cite and repoints them.
 */

const scratch = mkdtempSync(join(tmpdir(), "freeze-capture-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
let n = 0;
const fresh = () => {
  const dir = join(scratch, `d${(n += 1)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

const TEXT = Array.from({ length: 40 }, (_, i) => `line ${i + 1}: ${"words of the page ".repeat(3)}`).join("\n");
const meta = (slug: string, over: Record<string, unknown> = {}) => ({
  url: `https://a.example/${slug}`,
  slug,
  fetchedAt: "2026-09-28T20:35:42.598Z",
  status: 200,
  contentType: "text/html; charset=utf-8",
  byteLength: 10,
  sha256: "ab",
  truncated: false,
  error: null,
  bodyPath: `research/rendered/${slug}.html`,
  textPath: `research/rendered/${slug}.txt`,
  changed: true,
  ...over,
});
function capture(dir: string, slug: string, { text = TEXT, over = {} as Record<string, unknown>, html = "<html><body><p>page</p></body></html>" } = {}) {
  const m = meta(slug, over);
  writeFileSync(join(dir, `${slug}.meta.json`), `${JSON.stringify(m, null, 2)}\n`);
  if (m.bodyPath) writeFileSync(join(dir, `${slug}.html`), html);
  if (text !== null) writeFileSync(join(dir, `${slug}.txt`), text);
  return m;
}
const URLS = "# a list\nhttps://a.example/page\tpage\n# paused (terms unread) — https://b.example/q\tpaused-page\n";
const plan = (dir: string, over: Record<string, unknown> = {}) =>
  planFreeze({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30", commit: "abc1234", ...over });

describe("planFreeze / freezeCapture", () => {
  it("copies every file byte for byte to <slug>-<fetchedAt day>, renaming only the meta's slug and paths, and adds the hand-frozen block", () => {
    const dir = fresh();
    const live = capture(dir, "page");
    const p = freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30", commit: "abc1234", why: "because" });
    expect(p.frozenSlug).toBe("page-2026-09-28");
    expect(p.already).toBe(false);
    expect(readdirSync(dir).sort()).toEqual([MANIFEST, "page-2026-09-28.html", "page-2026-09-28.meta.json", "page-2026-09-28.txt", "page.html", "page.meta.json", "page.txt"]);
    expect(readFileSync(join(dir, "page-2026-09-28.txt"))).toEqual(readFileSync(join(dir, "page.txt")));
    expect(readFileSync(join(dir, "page-2026-09-28.html"))).toEqual(readFileSync(join(dir, "page.html")));
    const frozen = JSON.parse(readFileSync(join(dir, "page-2026-09-28.meta.json"), "utf8"));
    expect(frozen).toEqual({
      ...live,
      slug: "page-2026-09-28",
      bodyPath: "research/rendered/page-2026-09-28.html",
      textPath: "research/rendered/page-2026-09-28.txt",
      frozen: { on: "2026-09-30", from: "research/rendered/page.meta.json", commit: "abc1234", why: "because" },
    });
    expect(Object.keys(frozen).pop()).toBe("frozen");
    // The shape the hand-frozen copies have, which products/il-biz-tools/tests/osek-zair-page.test.js pins.
    const nevo = JSON.parse(readFileSync("research/rendered/nevo-vat-law-2026-09-29.meta.json", "utf8"));
    expect(Object.keys(frozen.frozen)).toEqual(Object.keys(nevo.frozen));
    // The live capture is untouched, and a meta line keeps its number (status stays line 5).
    expect(JSON.parse(readFileSync(join(dir, "page.meta.json"), "utf8"))).toEqual(live);
    expect(readFileSync(join(dir, "page-2026-09-28.meta.json"), "utf8").split("\n")[4]).toBe('  "status": 200,');
  });

  it("names the copy by --date when given, and refuses a day that is not one", () => {
    const dir = fresh();
    capture(dir, "page");
    expect(plan(dir, { date: "2026-10-01" }).frozenSlug).toBe("page-2026-10-01");
    expect(() => plan(dir, { date: "2026-02-30" })).toThrow(/not a day/);
    expect(() => plan(dir, { date: "30.9.2026" })).toThrow(/not a day/);
    expect(() => plan(dir, { on: "2026-13-01" })).toThrow(/frozen\.on/);
    expect(isDay("2026-09-30")).toBe(true);
    const nofetch = fresh();
    capture(nofetch, "page", { over: { fetchedAt: undefined } });
    expect(() => plan(nofetch)).toThrow(/no fetchedAt: name the day with --date/);
  });

  it("refuses a capture that is not a read page, unless allowed, and then records what it is", () => {
    const refused = fresh();
    capture(refused, "page", { over: { status: 403, error: "HTTP 403", textPath: null }, text: null });
    expect(() => plan(refused)).toThrow(/not a read page \(capture-check: status;.*--allow-flagged/);
    // A capture whose meta names a file that is not there is not frozen at all, allowed or not.
    const broken = fresh();
    capture(broken, "page", { text: null });
    expect(() => plan(broken, { allowFlagged: true })).toThrow(/cannot be read as a capture: .*incomplete/);
    const shell = fresh();
    capture(shell, "page", { text: "Loading", html: '<html><body><div id="root"></div><script src="a.js"></script></body></html>' });
    expect(() => plan(shell)).toThrow(/capture-check: js-shell/);
    const allowed = plan(refused, { allowFlagged: true });
    const m = JSON.parse(allowed.writes.find((w: { ext: string }) => w.ext === "meta.json").bytes.toString("utf8"));
    expect(m.frozen.flagged.kind).toBe("status");
    expect(allowed.writes.map((w: { ext: string }) => w.ext)).toEqual(["meta.json", "html"]);
  });

  it("accepts an existing copy frozen with --allow-flagged as already frozen, and nothing else flagged", () => {
    const dir = fresh();
    capture(dir, "page", { over: { status: 504, error: "HTTP 504", bodyPath: null, textPath: null }, text: null });
    freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30", allowFlagged: true });
    expect(plan(dir, { on: "2026-10-02" }).already).toBe(true);
  });

  it("refuses a capture that is itself a frozen copy", () => {
    const dir = fresh();
    capture(dir, "page", { over: { frozen: { on: "2026-09-29", from: "research/rendered/x.meta.json" } } });
    expect(() => plan(dir)).toThrow(/already a frozen copy/);
  });

  it("refuses a frozen name any urls.txt line gives, active or commented out, or derives from a URL", () => {
    const dir = fresh();
    capture(dir, "page");
    expect(() => plan(dir, { urlsText: `${URLS}https://c.example/r\tpage-2026-09-28\n` })).toThrow(/named on a urls\.txt line/);
    expect(() => plan(dir, { urlsText: `${URLS}# retired — https://c.example/r\tpage-2026-09-28\n` })).toThrow(/named on a urls\.txt line/);
    expect(listedNames("https://page-2026-09-28/")).toContain("page-2026-09-28");
    expect(plan(dir).frozenSlug).toBe("page-2026-09-28");
  });

  it("leaves a copy with the same bytes as it is (whatever day it was made), and refuses one with other bytes", () => {
    const dir = fresh();
    capture(dir, "page");
    freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30" });
    expect(plan(dir, { on: "2026-10-05" }).already).toBe(true);
    writeFileSync(join(dir, "page-2026-09-28.txt"), `${TEXT}\nchanged`);
    expect(() => plan(dir)).toThrow(/already exists with other bytes \(page-2026-09-28\.txt\)/);
    writeFileSync(join(dir, "page-2026-09-28.txt"), TEXT);
    writeFileSync(join(dir, "page-2026-09-28.pdf"), "x");
    expect(() => plan(dir)).toThrow(/already exists with other bytes \(page-2026-09-28\.pdf\)/);
  });

  it("writes nothing on a dry run", () => {
    const dir = fresh();
    capture(dir, "page");
    freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30", dryRun: true });
    expect(readdirSync(dir).sort()).toEqual(["page.html", "page.meta.json", "page.txt"]);
  });

  it("copies a hand extraction beside a PDF and keeps its null textPath", () => {
    const dir = fresh();
    capture(dir, "page", { over: { contentType: "application/pdf", bodyPath: "research/rendered/page.pdf", textPath: null } });
    writeFileSync(join(dir, "page.pdf"), "%PDF-1.4 x");
    rmSync(join(dir, "page.html"));
    const p = plan(dir);
    expect(p.writes.map((w: { ext: string }) => w.ext)).toEqual(["meta.json", "txt", "pdf"]);
    const m = JSON.parse(p.writes[0].bytes.toString("utf8"));
    expect([m.bodyPath, m.textPath]).toEqual(["research/rendered/page-2026-09-28.pdf", null]);
  });

  it("refuses a PDF whose meta says the text beside it may describe other bytes (textError), unless allowed", () => {
    const dir = fresh();
    const textError = "the PDF changed beside a hand extraction (sha256 of the stored copy it sat beside: ab); it may not describe these bytes";
    capture(dir, "page", { over: { contentType: "application/pdf", bodyPath: "research/rendered/page.pdf", textPath: null, textError } });
    writeFileSync(join(dir, "page.pdf"), "%PDF-1.4 new");
    rmSync(join(dir, "page.html"));
    expect(() => plan(dir)).toThrow(/not a read page \(its meta's textError: textError;.*--allow-flagged/);
    const allowed = plan(dir, { allowFlagged: true });
    expect(JSON.parse(allowed.writes[0].bytes.toString("utf8")).frozen.flagged).toEqual({ kind: "textError", evidence: textError });
  });

  it("refuses an existing copy whose meta says other things, or cannot be read, even with the same body bytes", () => {
    const dir = fresh();
    capture(dir, "page");
    freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30" });
    const path = join(dir, "page-2026-09-28.meta.json");
    const good = readFileSync(path, "utf8");
    writeFileSync(path, good.replace('"status": 200', '"status": 203'));
    expect(() => plan(dir)).toThrow(/already exists with other bytes \(page-2026-09-28\.meta\.json\)/);
    writeFileSync(path, "{ not json");
    expect(() => plan(dir)).toThrow(/already exists with other bytes \(page-2026-09-28\.meta\.json\)/);
  });

  it("accepts a flagged capture's existing copy only when that copy records the flag it was allowed with", () => {
    const dir = fresh();
    capture(dir, "page", { over: { status: 504, error: "HTTP 504", bodyPath: null, textPath: null }, text: null });
    freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30", allowFlagged: true });
    const path = join(dir, "page-2026-09-28.meta.json");
    const m = JSON.parse(readFileSync(path, "utf8"));
    delete m.frozen.flagged;
    writeFileSync(path, `${JSON.stringify(m, null, 2)}\n`);
    expect(() => plan(dir, { on: "2026-10-02" })).toThrow(/not a read page/);
  });

  it("never rewrites a copy that is already frozen: its frozen.on stays the day it was made", () => {
    const dir = fresh();
    capture(dir, "page");
    freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30" });
    const before = readFileSync(join(dir, "page-2026-09-28.meta.json"));
    expect(freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-10-05" }).already).toBe(true);
    expect(readFileSync(join(dir, "page-2026-09-28.meta.json"))).toEqual(before);
  });

  it("takes a slug for a file name only: a path is refused before anything is written", () => {
    const dir = fresh();
    capture(dir, "page");
    expect(() => planFreeze({ slug: "../x", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30" })).toThrow(/not a capture slug/);
    expect(classifyFiles("../x", diskFiles("page", dir)).kind).toBe("unreadable");
    expect(diskFiles("../x", dir).size).toBe(0);
    expect(() => sourceVersion(dir, "../x")).toThrow(/not a capture slug/);
  });
});

describe(`${MANIFEST}: every frozen copy's files, by sha256`, () => {
  const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");

  it("records each file a freeze writes, sorted, in sha256sum's format, and keeps the other copies' lines", () => {
    const dir = fresh();
    capture(dir, "page");
    capture(dir, "other");
    freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30" });
    freezeCapture({ slug: "other", files: diskFiles("other", dir), dir, urlsText: URLS, on: "2026-09-30" });
    const text = readFileSync(join(dir, MANIFEST), "utf8");
    expect(text.split("\n").filter(Boolean).map((l) => l.split("  ")[1])).toEqual([
      "other-2026-09-28.html", "other-2026-09-28.meta.json", "other-2026-09-28.txt",
      "page-2026-09-28.html", "page-2026-09-28.meta.json", "page-2026-09-28.txt",
    ]);
    expect(readManifest(dir).get("page-2026-09-28.txt")).toBe(sha(readFileSync(join(dir, "page-2026-09-28.txt"))));
    expect(checkManifest(dir)).toEqual([]);
    // A dry run records nothing.
    capture(dir, "third");
    freezeCapture({ slug: "third", files: diskFiles("third", dir), dir, urlsText: URLS, on: "2026-09-30", dryRun: true });
    expect(readFileSync(join(dir, MANIFEST), "utf8")).toBe(text);
  });

  it("finds a rewritten, deleted, unrecorded or thawed copy", () => {
    const dir = fresh();
    capture(dir, "page");
    freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-09-30" });
    const txt = join(dir, "page-2026-09-28.txt");
    writeFileSync(txt, `${TEXT}\nedited`);
    expect(checkManifest(dir)).toEqual([`page-2026-09-28.txt is not the bytes ${MANIFEST} records`]);
    rmSync(txt);
    expect(checkManifest(dir)).toEqual([`page-2026-09-28.txt is recorded in ${MANIFEST} but not on disk`]);
    writeFileSync(txt, TEXT);
    const metaPath = join(dir, "page-2026-09-28.meta.json");
    const frozenMeta = readFileSync(metaPath, "utf8");
    writeFileSync(metaPath, frozenMeta.replace('"frozen": {', '"thawed": {'));
    expect(checkManifest(dir)).toContain(`page-2026-09-28 is recorded in ${MANIFEST} but its meta is not a frozen copy naming it`);
    writeFileSync(metaPath, frozenMeta);
    // A copy frozen by hand, not recorded: named, and --record takes it.
    writeFileSync(join(dir, "page-hand.txt"), TEXT);
    writeFileSync(join(dir, "page-hand.meta.json"), `${JSON.stringify({ ...meta("page-hand"), bodyPath: null, textPath: "research/rendered/page-hand.txt", frozen: { on: "2026-09-29", from: "research/rendered/page.meta.json", commit: null, why: "by hand" } }, null, 2)}\n`);
    expect(checkManifest(dir)).toEqual([`page-hand is a frozen copy that ${MANIFEST} does not record (node scripts/freeze-capture.mjs --record page-hand)`]);
    expect(recordFiles(dir, "page-hand")).toBe(2);
    expect(checkManifest(dir)).toEqual([]);
    expect(() => recordFiles(dir, "page")).toThrow(/not a frozen copy/);
  });
});

describe("repoint", () => {
  it("renames the slug of each citation, full or short, and keeps the extension and every line; a short name follows its table", () => {
    const text = "See research/rendered/page.txt:3, also `:5`; page.html:7-9.\n| `R-P` | `page.txt` |\n(`R-P:4`)";
    const cs = findCitations(text, new Set(["page"]));
    expect(repoint(text, cs, () => "page-2026-09-28")).toBe(
      "See research/rendered/page-2026-09-28.txt:3, also `:5`; page-2026-09-28.html:7-9.\n| `R-P` | `page-2026-09-28.txt` |\n(`R-P:4`)",
    );
    expect(() => repoint(text.replace("page.html", "PAGE.html"), cs, () => "x")).toThrow(/citation moved/);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// In a repository: which version each citation was written against, and --cited end to end.

function repo() {
  const root = fresh();
  const g = (...args: string[]) => {
    const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false", ...args], { cwd: root, encoding: "utf8" });
    if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
    return r.stdout.trim();
  };
  g("init", "-q");
  mkdirSync(join(root, "research/rendered"), { recursive: true });
  mkdirSync(join(root, "research/measurements"), { recursive: true });
  const rendered = join(root, "research/rendered");
  const note = (s: string) => writeFileSync(join(root, "research/measurements/note.md"), s);
  const commit = (msg: string) => {
    g("add", "-A");
    g("commit", "-q", "-m", msg);
    return g("rev-parse", "--short", "HEAD");
  };
  return { root, rendered, note, commit, g };
}
const V2 = TEXT.replace("line 3:", "line 3 (moved):");

describe("sourceVersion and --cited, in a repository", () => {
  it("freezes the working tree's capture for an unchanged citation and, with --history, the version a drifted one was written against", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("Line three is `page.txt:3`; the source is research/rendered/page.txt (40 lines).\n");
    const c1 = r.commit("v1");
    capture(r.rendered, "page", { text: V2, over: { fetchedAt: "2026-09-29T11:00:00.000Z" } });
    r.note("Line three is `page.txt:3`; the source is research/rendered/page.txt (40 lines).\nLine five is `page.txt:5`.\n");
    r.commit("v2");

    const out: string[] = [];
    // Without --history the drifted citation stays, and says so: exit 1.
    expect(cited({ root: r.root, apply: true, on: "2026-09-30", log: (s: string) => out.push(s) })).toBe(1);
    expect(out.join("\n")).toMatch(/DRIFTED research\/measurements\/note\.md:1 page\.txt:3 \[:3\]/);
    expect(out.join("\n")).toMatch(/then: "line 3: /);
    expect(out.join("\n")).toMatch(/now: {2}"line 3 \(moved\): /);
    expect(readFileSync(join(r.root, "research/measurements/note.md"), "utf8")).toContain("`page-2026-09-29.txt:5`");
    expect(readFileSync(join(r.root, "research/measurements/note.md"), "utf8")).toContain("`page.txt:3`");
    r.commit("repointed the unchanged one");

    // With --history (and --unlined) the drifted one goes to the capture as the commit it was written in stored it.
    expect(cited({ root: r.root, apply: true, history: true, unlined: true, on: "2026-09-30", log: () => {} })).toBe(0);
    const noted = readFileSync(join(r.root, "research/measurements/note.md"), "utf8");
    expect(noted).toBe(
      "Line three is `page-2026-09-28.txt:3`; the source is research/rendered/page-2026-09-28.txt (40 lines).\nLine five is `page-2026-09-29.txt:5`.\n",
    );
    expect(readFileSync(join(r.rendered, "page-2026-09-28.txt"), "utf8").split("\n")[2]).toMatch(/^line 3: /);
    expect(readFileSync(join(r.rendered, "page-2026-09-29.txt"), "utf8")).toBe(V2);
    const old = JSON.parse(readFileSync(join(r.rendered, "page-2026-09-28.meta.json"), "utf8"));
    expect(old.frozen.commit).toBe(c1);
    expect(old.frozen.why).toContain("research/measurements/note.md");
    // urls.txt is never edited: the live line stays on the watch.
    expect(readFileSync(join(r.rendered, "urls.txt"), "utf8")).toBe(URLS);
  });

  it("keeps a citation --keep names, and leaves a paused capture's citations alone", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    capture(r.rendered, "paused-page");
    r.note("Named: research/rendered/page.txt (40 lines).\nPaused: research/rendered/paused-page.txt:3.\n");
    r.commit("v1");
    expect(cited({ root: r.root, apply: true, unlined: true, keep: ["research/measurements/note.md:1"], on: "2026-09-30", log: () => {} })).toBe(0);
    expect(readFileSync(join(r.root, "research/measurements/note.md"), "utf8")).toBe(
      "Named: research/rendered/page.txt (40 lines).\nPaused: research/rendered/paused-page.txt:3.\n",
    );
  });

  it("freezes a failed fetch's older text as the commit that stored it, and refuses a capture with uncommitted changes", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    const c1 = r.commit("v1");
    // A failed fetch writes a meta and no body: the older text stays on disk beside it.
    writeFileSync(join(r.rendered, "page.meta.json"), `${JSON.stringify(meta("page", { status: 503, error: "HTTP 503", bodyPath: null, textPath: null, fetchedAt: "2026-09-29T00:00:00.000Z" }), null, 2)}\n`);
    r.commit("503");
    const v = sourceVersion(r.root, "page");
    expect(v.commit).toBe(c1);
    expect(v.note).toMatch(/status 503/);
    expect(JSON.parse(v.files.get("meta.json").toString("utf8")).status).toBe(200);
    writeFileSync(join(r.rendered, "page.txt"), "edited");
    expect(() => sourceVersion(r.root, "page")).toThrow(/uncommitted changes/);
    expect(existsSync(join(r.rendered, "page-2026-09-28.meta.json"))).toBe(false);
  });
});

describe("sourceVersion: a failed fetch's older text, and only the same bytes from a read page", () => {
  it("does not fall back when the failed fetch removed a file the older capture had", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.commit("v1");
    writeFileSync(join(r.rendered, "page.meta.json"), `${JSON.stringify(meta("page", { status: 503, error: "HTTP 503", bodyPath: null, textPath: null, fetchedAt: "2026-09-29T00:00:00.000Z" }), null, 2)}\n`);
    rmSync(join(r.rendered, "page.html"));
    const c2 = r.commit("503, html gone");
    const v = sourceVersion(r.root, "page");
    expect([v.commit, v.note]).toEqual([c2, null]);
  });

  it("does not fall back to an older capture that was not a read page either", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page", { over: { status: 403, error: "HTTP 403" } });
    r.commit("a 403 page, stored");
    writeFileSync(join(r.rendered, "page.meta.json"), `${JSON.stringify(meta("page", { status: 503, error: "HTTP 503", bodyPath: null, textPath: null, fetchedAt: "2026-09-29T00:00:00.000Z" }), null, 2)}\n`);
    const c2 = r.commit("503");
    const v = sourceVersion(r.root, "page");
    expect([v.commit, v.note]).toEqual([c2, null]);
  });
});

describe("--cited: each range is judged by the commit that wrote it, and nothing unsure is repointed", () => {
  const V3 = V2.replace("line 40:", "line 40 (moved):");
  const noteOf = (r: ReturnType<typeof repo>) => readFileSync(join(r.root, "research/measurements/note.md"), "utf8");
  const run = (r: ReturnType<typeof repo>, over: Record<string, unknown> = {}) => {
    const out: string[] = [];
    const code = cited({ root: r.root, apply: true, on: "2026-09-30", log: (s: string) => out.push(s), ...over });
    return { code, out: out.join("\n") };
  };

  it("never repoints a citation whose file has uncommitted changes (unknown), and exits 1", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("Line three is `page.txt:3`.\n");
    r.commit("v1");
    r.note("Line three is `page.txt:3`.\nMore.\n");
    const { code, out } = run(r, { history: true });
    expect(code).toBe(1);
    expect(out).toMatch(/UNKNOWN research\/measurements\/note\.md:1 page\.txt:3 \[:3\]: .*has uncommitted changes.*; not repointed/);
    expect(noteOf(r)).toBe("Line three is `page.txt:3`.\nMore.\n");
  });

  it("exits 1 for a citation without a line it could not judge, though nothing by line is left", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("Read `research/rendered/page.txt` in full.\n");
    r.commit("v1");
    r.note("Read `research/rendered/page.txt` in full.\nMore.\n");
    const { code, out } = run(r, { unlined: true });
    expect(out).toMatch(/UNKNOWN research\/measurements\/note\.md:1 research\/rendered\/page\.txt: .*not repointed/);
    expect(out).toMatch(/0 citation\(s\) by line of an active capture left/);
    expect(code).toBe(1);
  });

  it("takes a range's commit from the newest unbroken run of the line's versions that hold it", () => {
    // Newest first: c3 holds the reference again after c2 dropped it, so c3 wrote this occurrence, not c1.
    const versions = [
      { commit: "c3", text: "Line three is `page.txt:3`." },
      { commit: "c2", text: "Line three is gone." },
      { commit: "c1", text: "Line three is `page.txt:3`." },
    ];
    expect(writtenIn(versions, "page.txt:3")).toBe("c3");
    expect(writtenIn(versions.slice(1), "page.txt:3")).toBe(null);
    // A bare :3 is not held by :30.
    expect(writtenIn([{ commit: "c4", text: "see `:30`" }], ":3")).toBe(null);
  });

  it("never repoints in a shallow clone whose history stops before the citation was written", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("Line three is `page.txt:3`.\n");
    r.commit("v1");
    capture(r.rendered, "page", { text: V2, over: { fetchedAt: "2026-09-29T11:00:00.000Z" } });
    r.commit("v2: line 3 moved");
    const clone = join(fresh(), "clone");
    const cl = spawnSync("git", ["clone", "-q", "--depth", "1", `file://${r.root}`, clone], { encoding: "utf8" });
    expect(cl.status, cl.stderr).toBe(0);
    const out: string[] = [];
    expect(cited({ root: clone, apply: true, history: true, on: "2026-09-30", log: (s: string) => out.push(s) })).toBe(1);
    expect(out.join("\n")).toMatch(/UNKNOWN .*where this shallow clone's history stops; not repointed/);
    expect(readFileSync(join(clone, "research/measurements/note.md"), "utf8")).toBe("Line three is `page.txt:3`.\n");
  });

  it("never repoints where git cannot read the history at all", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("Line three is `page.txt:3`.\n");
    r.commit("v1");
    const bare = join(fresh(), "no-git");
    cpSync(join(r.root, "research"), join(bare, "research"), { recursive: true });
    const out: string[] = [];
    expect(cited({ root: bare, apply: true, history: true, on: "2026-09-30", log: (s: string) => out.push(s) })).toBe(1);
    expect(out.join("\n")).toMatch(/UNKNOWN .*; not repointed/);
    expect(readFileSync(join(bare, "research/measurements/note.md"), "utf8")).toBe("Line three is `page.txt:3`.\n");
  });

  it("repoints to the version every range reads as written: a range added later against a later capture", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("See `page.txt:3`.\n");
    r.commit("v1");
    // The render moves line 40 only; the note then adds :40, read against the new capture.
    capture(r.rendered, "page", { text: TEXT.replace("line 40:", "line 40 (moved):"), over: { fetchedAt: "2026-09-29T11:00:00.000Z" } });
    r.commit("render");
    r.note("See `page.txt:3`, `:40`.\n");
    r.commit("v2 of the note");
    const { code } = run(r);
    expect(code).toBe(0);
    expect(noteOf(r)).toBe("See `page-2026-09-29.txt:3`, `:40`.\n");
  });

  it("refuses a line whose ranges were written against versions no one version satisfies (split), even with --history", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("See `page.txt:3`.\n");
    r.commit("v1");
    capture(r.rendered, "page", { text: V3, over: { fetchedAt: "2026-09-29T11:00:00.000Z" } });
    r.commit("render: lines 3 and 40 moved");
    r.note("See `page.txt:3`, `:40`.\n");
    r.commit("v2 of the note");
    const { code, out } = run(r, { history: true });
    expect(code).toBe(1);
    expect(out).toMatch(/SPLIT research\/measurements\/note\.md:1 page\.txt:3 \[:3, :40\]: .*no one of them reads what every range was written against; not repointed/);
    expect(noteOf(r)).toBe("See `page.txt:3`, `:40`.\n");
  });

  it("moves a short-name table row only when every reference wants one version", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("| `P` | `page.txt` |\nIt says (`P:3`).\n");
    r.commit("v1");
    capture(r.rendered, "page", { text: V3, over: { fetchedAt: "2026-09-29T11:00:00.000Z" } });
    r.commit("render");
    r.note("| `P` | `page.txt` |\nIt says (`P:3`).\nAnd (`P:40`).\n");
    r.commit("v2 of the note");
    const { code, out } = run(r, { history: true });
    expect(code).toBe(1);
    expect(out).toMatch(/SPLIT research\/measurements\/note\.md:1 page\.txt \[:3, :40\]/);
    expect(noteOf(r)).toBe("| `P` | `page.txt` |\nIt says (`P:3`).\nAnd (`P:40`).\n");
  });

  it("refuses a range past the end of the capture it was written against (invalid)", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("See `page.txt:99`.\n");
    r.commit("v1");
    capture(r.rendered, "page", { text: V2, over: { fetchedAt: "2026-09-29T11:00:00.000Z" } });
    r.commit("render");
    const { code, out } = run(r, { history: true });
    expect(code).toBe(1);
    expect(out).toMatch(/INVALID research\/measurements\/note\.md:1 page\.txt:99 \[:99\]: page\.txt:99 .*is past the end of page\.txt as \w+ stored it; not repointed/);
    expect(noteOf(r)).toBe("See `page.txt:99`.\n");
  });

  it("freezes the version read when only the html or the meta changed since, so the copy's meta says what the note says", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("Fetched 2026-09-28T20:35Z (`page.txt:3`).\n");
    const c1 = r.commit("v1");
    capture(r.rendered, "page", { html: "<html><body><p>page, new chrome</p></body></html>", over: { fetchedAt: "2026-09-29T11:00:00.000Z", sha256: "cd" } });
    r.commit("render: html and meta only");
    const { code, out } = run(r);
    expect(code).toBe(0);
    expect(out).toMatch(/drift: changed 1/);
    expect(noteOf(r)).toBe("Fetched 2026-09-28T20:35Z (`page-2026-09-28.txt:3`).\n");
    const frozen = JSON.parse(readFileSync(join(r.rendered, "page-2026-09-28.meta.json"), "utf8"));
    expect([frozen.fetchedAt, frozen.sha256, frozen.frozen.commit]).toEqual(["2026-09-28T20:35:42.598Z", "ab", c1]);
  });

  it("judges a PDF capture by all its files: a hand text beside a changed PDF goes to the version it was made with", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), "https://a.example/doc\tdoc\n");
    const pdfMeta = (over: Record<string, unknown>) => ({ ...meta("doc"), contentType: "application/pdf", bodyPath: "research/rendered/doc.pdf", textPath: null, ...over });
    writeFileSync(join(r.rendered, "doc.meta.json"), `${JSON.stringify(pdfMeta({}), null, 2)}\n`);
    writeFileSync(join(r.rendered, "doc.pdf"), "%PDF-1.4 old");
    writeFileSync(join(r.rendered, "doc.txt"), TEXT);
    r.note("See `doc.txt:3`.\n");
    r.commit("v1");
    writeFileSync(join(r.rendered, "doc.meta.json"), `${JSON.stringify(pdfMeta({ fetchedAt: "2026-09-29T11:00:00.000Z", textError: "the PDF changed beside a hand extraction" }), null, 2)}\n`);
    writeFileSync(join(r.rendered, "doc.pdf"), "%PDF-1.4 new");
    r.commit("render: new PDF bytes");
    const { code } = run(r);
    expect(code).toBe(0);
    expect(noteOf(r)).toBe("See `doc-2026-09-28.txt:3`.\n");
    expect(readFileSync(join(r.rendered, "doc-2026-09-28.pdf"), "utf8")).toBe("%PDF-1.4 old");
  });

  it("names a second version of one fetch day <slug>-<day>-<commit>, in a dry run too, and repoints both", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page", { over: { fetchedAt: "2026-09-29T01:00:00.000Z" } });
    r.note("Early: `page.txt:3`.\n");
    const c1 = r.commit("v1");
    capture(r.rendered, "page", { text: V2, over: { fetchedAt: "2026-09-29T11:00:00.000Z" } });
    r.note("Early: `page.txt:3`.\nLate: `page.txt:5`.\n");
    const c2 = r.commit("v2");
    const dry = run(r, { apply: false, history: true });
    expect(dry.code).toBe(1);
    // The first fetch of the day takes the plain name; the later one, its commit.
    expect(dry.out).toMatch(new RegExp(`would freeze page as ${c1} stored it -> page-2026-09-29 `));
    expect(dry.out).toMatch(new RegExp(`would freeze page -> page-2026-09-29-${c2} `));
    const { code } = run(r, { history: true });
    expect(code).toBe(0);
    expect(noteOf(r)).toBe(`Early: \`page-2026-09-29.txt:3\`.\nLate: \`page-2026-09-29-${c2}.txt:5\`.\n`);
    expect(checkManifest(r.rendered)).toEqual([]);
  });

  it("reuses an existing frozen copy with the same bytes whatever its name (a --date copy)", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.note("See `page.txt:3`.\n");
    r.commit("v1");
    freezeCapture({ slug: "page", files: diskFiles("page", r.rendered), dir: r.rendered, urlsText: URLS, on: "2026-10-01", date: "2026-10-01" });
    r.commit("a --date copy");
    const { code, out } = run(r);
    expect(code).toBe(0);
    expect(out).toMatch(/already frozen page -> page-2026-10-01/);
    expect(noteOf(r)).toBe("See `page-2026-10-01.txt:3`.\n");
    expect(existsSync(join(r.rendered, "page-2026-09-28.meta.json"))).toBe(false);
  });

  it("says a drifted citation whose freeze was refused was not repointed", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page", { over: { contentType: "application/pdf", bodyPath: "research/rendered/page.pdf", textPath: null, textError: "the PDF changed beside it" } });
    writeFileSync(join(r.rendered, "page.pdf"), "%PDF-1.4 x");
    rmSync(join(r.rendered, "page.html"));
    r.note("See `page.txt:3`.\n");
    r.commit("v1: a flagged capture");
    capture(r.rendered, "page", { text: V2, over: { fetchedAt: "2026-09-29T11:00:00.000Z" } });
    r.commit("render");
    const { code, out } = run(r, { history: true });
    expect(code).toBe(1);
    expect(out).toMatch(/REFUSED page as \w+ stored it: .*textError/);
    expect(out).toMatch(/1 DRIFTED \(0 repointed to the version each was written against\)/);
    expect(noteOf(r)).toBe("See `page.txt:3`.\n");
  });
});

describe("tick 50: every byte a new frozen copy gets passes through redactSecrets, history included", () => {
  // No address is written in this file: each is built from its parts at run time, the Cloudflare hex by encoding one.
  const at = (local: string, domain: string, sep = String.fromCharCode(64)) => [local, domain].join(sep);
  const PCT = ["%", "40"].join("");
  const cf = (address: string, key = 0x2b) =>
    [key, ...Buffer.from(address, "utf8").map((b) => b ^ key)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const LOCALS = ["chair.person", "lab.office", "press.desk", "web.master"];
  const HEX = cf(at(LOCALS[2], "agency.example.gov"));
  const ADDRESS_TEXT = TEXT.replace("line 3:", `line 3: write to ${at(LOCALS[0], "example.org")} or`);
  const ADDRESS_HTML =
    `<html><body><p>Chair: <a href="mailto:${at(LOCALS[0], "example.org")}">x</a></p>\n` +
    `<p><a href="/r?u=${at(LOCALS[1], "uni.example.edu", PCT)}">lab</a></p>\n` +
    `<p><span class="__cf_email__" data-cfemail="${HEX}">[email&#160;protected]</span></p></body></html>`;
  const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
  const noLocal = (s: string) => LOCALS.filter((l) => s.includes(l)).concat(s.includes(HEX) ? ["hex"] : []);
  const lines = (s: string) => s.split("\n").length;

  it("--history --apply masks a version taken from git history; its meta says so; FROZEN.sha256 holds the masked bytes", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    // Its meta as render-watch writes one: sha256 and byteLength of the stored body.
    const body = Buffer.from(ADDRESS_HTML);
    capture(r.rendered, "page", { text: ADDRESS_TEXT, html: ADDRESS_HTML, over: { sha256: sha(body), byteLength: body.length } });
    r.note("Line three is `page.txt:3`.\n");
    const c1 = r.commit("v1: a capture from before the fold, with addresses");
    capture(r.rendered, "page", { text: V2, over: { fetchedAt: "2026-09-29T11:00:00.000Z" } });
    r.commit("v2: the render moved line 3");

    const dry: string[] = [];
    expect(cited({ root: r.root, apply: false, history: true, on: "2026-10-06", log: (s: string) => dry.push(s) })).toBe(1);
    expect(dry.join("\n")).toMatch(new RegExp(`would freeze page as ${c1} stored it -> page-2026-09-28 \\(meta\\.json, txt, html\\); would mask 4\\b`));
    expect(existsSync(join(r.rendered, "page-2026-09-28.meta.json"))).toBe(false);
    // Nothing printed names an address, the DRIFTED range included: it quotes the cited line as it was written, from
    // history, masked as the copy is (review fix).
    expect(dry.join("\n")).toMatch(/^ {2}then: "line 3: write to \[redacted:email\]@example\.org or /m);
    expect(noLocal(dry.join("\n"))).toEqual([]);

    const out: string[] = [];
    expect(cited({ root: r.root, apply: true, history: true, on: "2026-10-06", log: (s: string) => out.push(s) })).toBe(0);
    expect(out.join("\n")).toMatch(/froze page as \w+ stored it -> page-2026-09-28 \(meta\.json, txt, html\); masked 4\b/);
    expect(out.join("\n")).toMatch(/^ {2}then: /m);
    expect(noLocal(out.join("\n"))).toEqual([]);
    expect(readFileSync(join(r.root, "research/measurements/note.md"), "utf8")).toBe("Line three is `page-2026-09-28.txt:3`.\n");

    const text = readFileSync(join(r.rendered, "page-2026-09-28.txt"), "utf8");
    const html = readFileSync(join(r.rendered, "page-2026-09-28.html"));
    expect(text).toBe(ADDRESS_TEXT.replace(at(LOCALS[0], "example.org"), "[redacted:email]@example.org"));
    expect(lines(text)).toBe(lines(ADDRESS_TEXT));
    expect(html.toString("utf8")).toBe(
      ADDRESS_HTML.replace(at(LOCALS[0], "example.org"), "[redacted:email]@example.org")
        .replace(at(LOCALS[1], "uni.example.edu", PCT), `[redacted:email]${PCT}uni.example.edu`)
        .replace(HEX, "[redacted:email]@agency.example.gov"),
    );
    expect(noLocal(`${text}${html.toString("utf8")}`)).toEqual([]);

    const m = JSON.parse(readFileSync(join(r.rendered, "page-2026-09-28.meta.json"), "utf8"));
    // 3 in the body, 1 in the text; the meta had counted none.
    expect([m.redacted, m.remasked]).toEqual([4, { on: "2026-10-06", addresses: 4, fold: "12143ca" }]);
    expect([m.sha256, m.byteLength]).toEqual([sha(html), html.length]);
    const keys = Object.keys(m);
    expect(keys.slice(keys.indexOf("truncated"), keys.indexOf("truncated") + 4)).toEqual(["truncated", "redacted", "remasked", "error"]);
    expect(keys.at(-1)).toBe("frozen");
    expect(m.frozen.commit).toBe(c1);
    expect(checkManifest(r.rendered)).toEqual([]);
    expect(readManifest(r.rendered).get("page-2026-09-28.html")).toBe(sha(html));
    expect(readManifest(r.rendered).get("page-2026-09-28.txt")).toBe(sha(Buffer.from(text)));

    // Another day, the same version: the masked copy is the same capture (only remasked.on would differ): reused.
    const again = maskCapture(commitFiles(r.root, c1, "page"), "2026-10-07");
    expect(again.count).toBe(4);
    expect(existingCopy(r.rendered, "page", again.files)).toBe("page-2026-09-28");
    const p = planFreeze({ slug: "page", files: commitFiles(r.root, c1, "page"), dir: r.rendered, urlsText: URLS, on: "2026-10-07", commit: c1, frozenSlug: "page-2026-09-28" });
    expect(p.already).toBe(true);
  });

  it("--cited reuses a copy of the same version masked on another day, and makes no second one", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    const body = Buffer.from(ADDRESS_HTML);
    capture(r.rendered, "page", { text: ADDRESS_TEXT, html: ADDRESS_HTML, over: { sha256: sha(body), byteLength: body.length } });
    r.note("Line three is `page.txt:3`.\n");
    const c1 = r.commit("v1");
    capture(r.rendered, "page", { text: V2, over: { fetchedAt: "2026-09-29T11:00:00.000Z" } });
    r.commit("v2");
    // The version the citation was written against, frozen on 6.10 from history (masked, remasked.on 2026-10-06).
    freezeCapture({ slug: "page", files: commitFiles(r.root, c1, "page"), dir: r.rendered, urlsText: URLS, on: "2026-10-06", commit: c1, why: "w" });
    r.commit("frozen on 6.10");
    const out: string[] = [];
    expect(cited({ root: r.root, apply: true, history: true, on: "2026-10-07", log: (s: string) => out.push(s) })).toBe(0);
    expect(out.join("\n")).toMatch(new RegExp(`already frozen page as ${c1} stored it -> page-2026-09-28 `));
    expect(readFileSync(join(r.root, "research/measurements/note.md"), "utf8")).toBe("Line three is `page-2026-09-28.txt:3`.\n");
    expect(readdirSync(r.rendered).filter((f) => f.startsWith("page-2026-09-28-"))).toEqual([]);
    expect(JSON.parse(readFileSync(join(r.rendered, "page-2026-09-28.meta.json"), "utf8")).remasked.on).toBe("2026-10-06");
  });

  it("masks a copy frozen from a live capture that still holds an address, and leaves the live files alone", () => {
    const dir = fresh();
    const live = capture(dir, "page", { text: ADDRESS_TEXT, html: ADDRESS_HTML, over: { redacted: 1 } });
    const before = diskFiles("page", dir);
    const p = freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-10-06", commit: "abc1234", why: "w" });
    expect(p.masked).toBe(4);
    expect(diskFiles("page", dir)).toEqual(before);
    const m = JSON.parse(readFileSync(join(dir, "page-2026-09-28.meta.json"), "utf8"));
    // The fixture's sha256 is not of its body, so it stays (as remask-captures leaves a hand-redacted meta's).
    expect([m.redacted, m.remasked, m.sha256]).toEqual([5, { on: "2026-10-06", addresses: 4, fold: "12143ca" }, live.sha256]);
    expect(noLocal(readFileSync(join(dir, "page-2026-09-28.html"), "utf8") + readFileSync(join(dir, "page-2026-09-28.txt"), "utf8"))).toEqual([]);
    expect(checkManifest(dir)).toEqual([]);
  });

  it("changes nothing in a copy of a capture that is already masked (idempotence), and says so in a dry run", () => {
    const dir = fresh();
    const masked = (s: string) => redactSecrets(Buffer.from(s), "text/html").bytes as Buffer;
    const html = masked(ADDRESS_HTML);
    const text = masked(ADDRESS_TEXT);
    const live = capture(dir, "page", { text: text.toString("utf8"), html: html.toString("utf8"), over: { redacted: 4, sha256: sha(html), byteLength: html.length } });
    const dry = freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-10-06", why: "w", dryRun: true });
    expect(dry.masked).toBe(0);
    freezeCapture({ slug: "page", files: diskFiles("page", dir), dir, urlsText: URLS, on: "2026-10-06", commit: "abc1234", why: "w" });
    expect(readFileSync(join(dir, "page-2026-09-28.html"))).toEqual(html);
    expect(readFileSync(join(dir, "page-2026-09-28.txt"))).toEqual(text);
    const m = JSON.parse(readFileSync(join(dir, "page-2026-09-28.meta.json"), "utf8"));
    expect(m).toEqual({ ...live, slug: "page-2026-09-28", bodyPath: "research/rendered/page-2026-09-28.html", textPath: "research/rendered/page-2026-09-28.txt", frozen: m.frozen });
    expect("remasked" in m).toBe(false);
  });

  it("prints what a one-capture dry run would mask, as a count", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page", { text: ADDRESS_TEXT, html: ADDRESS_HTML });
    r.commit("v1");
    const logs: string[] = [];
    const log = console.log;
    console.log = (s: string) => logs.push(s);
    try {
      expect(main(["page", "--dry-run"], r.root)).toBe(0);
    } finally {
      console.log = log;
    }
    expect(logs.join("\n")).toMatch(/^would freeze page -> page-2026-09-28 \(.*\); would mask 4$/m);
    expect(noLocal(logs.join("\n"))).toEqual([]);
    expect(existsSync(join(r.rendered, "page-2026-09-28.meta.json"))).toBe(false);
  });
});

describe("the command line takes a slug and a commit, never a path or an option", () => {
  it("refuses a slug that is a path before any git call or temporary file (exit 2)", () => {
    const tmp = fresh();
    const cli = spawnSync(process.execPath, ["scripts/freeze-capture.mjs", "../zz/trav"], { encoding: "utf8", env: { ...process.env, TMPDIR: tmp } });
    expect(cli.status).toBe(2);
    expect(cli.stderr).toMatch(/not a capture slug: "\.\.\/zz\/trav"/);
    expect(readdirSync(tmp)).toEqual([]);
  });

  it("refuses a --from-commit that git would read as an option, and anything that is not a commit", () => {
    const r = repo();
    writeFileSync(join(r.rendered, "urls.txt"), URLS);
    capture(r.rendered, "page");
    r.commit("v1");
    const out = fresh();
    const errors: string[] = [];
    const err = console.error;
    console.error = (s: string) => errors.push(s);
    try {
      expect(main(["page", `--from-commit=--output=${out}/x`], r.root)).toBe(2);
      expect(main(["page", "--from-commit", "no-such-commit"], r.root)).toBe(1);
    } finally {
      console.error = err;
    }
    expect(errors.join("\n")).toMatch(/not a commit: "--output=/);
    expect(errors.join("\n")).toMatch(/not a commit: no-such-commit/);
    expect(readdirSync(out)).toEqual([]);
    expect(resolveCommit(r.root, "HEAD")).toMatch(/^[0-9a-f]{40}$/);
    expect(() => resolveCommit(r.root, "-p")).toThrow(/not a commit/);
    // git refuses a branch or tag named "-p", but update-ref writes refs/heads/-p, and rev-parse then resolves it:
    // a name that starts with "-" is refused before git is asked.
    r.g("update-ref", "refs/heads/-p", "HEAD");
    expect(r.g("rev-parse", "--verify", "--quiet", "--end-of-options", "-p^{commit}")).toMatch(/^[0-9a-f]{40}$/);
    expect(() => resolveCommit(r.root, "-p")).toThrow(/not a commit: "-p"/);
  });
});
