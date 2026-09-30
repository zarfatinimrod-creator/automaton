import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  cited,
  diskFiles,
  findCitations,
  freezeCapture,
  isDay,
  listedNames,
  planFreeze,
  repoint,
  sourceVersion,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/freeze-capture.mjs";

/**
 * scripts/freeze-capture.mjs (tick 38, 30.9.2026): a dated copy of a render-watch capture that the weekly render never
 * rewrites, in the shape of the three copies frozen by hand (nevo-vat-law-2026-09-29, kokoro-82m-model-card-2026-09-29,
 * hexgrad-kokoro-voices-js-dfb907a), and --cited, which freezes what the decision-bearing files cite and repoints them.
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
    expect(readdirSync(dir).sort()).toEqual(["page-2026-09-28.html", "page-2026-09-28.meta.json", "page-2026-09-28.txt", "page.html", "page.meta.json", "page.txt"]);
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
