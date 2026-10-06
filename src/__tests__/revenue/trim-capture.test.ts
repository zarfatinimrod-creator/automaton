import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  appendTrimmed,
  citationsOf,
  copyingOf,
  CONTEXT,
  fullSha256Of,
  keptRanges,
  main,
  RULING,
  trimLines,
  trimStore,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/trim-capture.mjs";
import {
  checkManifest,
  diskFiles,
  existingCopy,
  freezeCapture,
  MANIFEST,
  planFreeze,
  readManifest,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/freeze-capture.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { classifyCapture, readCapture } from "../../../scripts/capture-check.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { siteOf } from "../../../scripts/queue-zero-test.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { planRemask } from "../../../scripts/remask-captures.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { copyingBarredSite, readCopyingBarred, routeTrimmed } from "../../../scripts/render-watch.mjs";

/**
 * scripts/trim-capture.mjs (tick 56, 6.10.2026): research/channel-loop/RULING-2026-10-06-robots-and-terms.md decision 4
 * (ruling 6.10 row 21 (d)). A capture of a site whose terms bar copying ("copying": "barred" in terms-verdicts.json) keeps
 * in the public tree its meta (plus a trimmed block), a .txt of the same line count holding only the cited lines and two
 * either side, and no body (or, cited by line, the body's cited lines only); frozen copies the same, FROZEN.sha256 following.
 * Fixture stores in a temp directory; the real store only read (a dry run, and the site rule beside render-watch's).
 */

const scratch = mkdtempSync(join(tmpdir(), "trim-capture-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
const sha = (b: Buffer | string) => createHash("sha256").update(b).digest("hex");
/** Page text that is never to be printed: every fixture line carries the marker. */
const MARK = "PAGETEXTMARK";
const textOf = (n: number, tag: string) => `${Array.from({ length: n }, (_, i) => `${tag} ${MARK} line ${i + 1} of the page, long enough to count as read text`).join("\n")}\n`;
const htmlOf = (n: number) => `${Array.from({ length: n }, (_, i) => (i === 0 ? "<html><body>" : i === n - 1 ? "</body></html>" : `<p>${MARK} html ${i + 1}</p>`)).join("\n")}\n`;
const metaText = (meta: Record<string, unknown>) => `${JSON.stringify(meta, null, 2)}\n`;
const baseMeta = (slug: string, url: string, ext = "html", body: string | Buffer = "") => ({
  url,
  slug,
  fetchedAt: "2026-10-01T05:00:00.000Z",
  status: 200,
  contentType: ext === "json" ? "application/json" : ext === "pdf" ? "application/pdf" : "text/html; charset=utf-8",
  byteLength: Buffer.byteLength(body),
  sha256: sha(body),
  truncated: false,
  error: null,
  bodyPath: `research/rendered/${slug}.${ext}`,
  textPath: ext === "html" ? `research/rendered/${slug}.txt` : null,
  changed: true,
  firstFetch: true,
  previousSha256: null,
  note: "Third-party content, stored for citation only.",
});

const VERDICTS = {
  _about: "fixture",
  sites: {
    "barred.test": { verdict: "NOT_BARRED", source: "fixture", checked: "2026-10-06", note: "copying barred (fixture :3)", copying: "barred" },
    "open.test": { verdict: "NOT_BARRED", source: "fixture", checked: "2026-10-06", note: "read; copying: allowed", copying: "allowed" },
    "unread.test": { verdict: "NO_TERMS", source: "fixture", checked: "2026-10-06", note: "exhaustive-negative: none", copying: "unread" },
  },
};

const NOTE = [
  "# A research note",
  "The clause (research/rendered/bar-live-2026-10-01.txt:10) and the head (bar-live-2026-10-01.html:5).",
  "There is no robots.txt exception (:20), per bar-live-2026-10-01.txt.",
  "The live page bar-live, which the weekly run watches, has no robots.txt clause (:4): an active capture is never cited by line.",
  "The html:7 holds the date, in bar-live-2026-10-01 as fetched.",
  "The JSON row (research/rendered/bar-json.json:4).",
  "",
].join("\n");

/** A fixture repository root: research/rendered (urls.txt, captures, FROZEN.sha256), the verdicts, one note. */
function makeStore(name: string, { verdicts = VERDICTS, note = NOTE }: { verdicts?: unknown; note?: string } = {}) {
  const root = join(scratch, name);
  const dir = join(root, "research", "rendered");
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(root, "research", "channel-loop"), { recursive: true });
  mkdirSync(join(root, "research", "notes"), { recursive: true });
  writeFileSync(join(root, "research", "channel-loop", "terms-verdicts.json"), `${JSON.stringify(verdicts, null, 1)}\n`);
  writeFileSync(join(root, "research", "notes", "n.md"), note);
  const urls = ["# fixture", "https://www.barred.test/terms\tbar-live", "https://open.test/terms\topen-page", ""].join("\n");
  writeFileSync(join(dir, "urls.txt"), urls);
  const put = (slug: string, meta: Record<string, unknown>, files: Record<string, string | Buffer>) => {
    writeFileSync(join(dir, `${slug}.meta.json`), metaText(meta));
    for (const [ext, bytes] of Object.entries(files)) writeFileSync(join(dir, `${slug}.${ext}`), bytes);
  };
  const html = htmlOf(20);
  put("bar-live", baseMeta("bar-live", "https://www.barred.test/terms", "html", html), { html, txt: textOf(30, "live") });
  // The frozen copy, made the way the repository makes one.
  freezeCapture({ slug: "bar-live", files: diskFiles("bar-live", dir), dir, urlsText: urls, on: "2026-10-02", commit: "abc1234", why: "fixture" });
  const json = `${Array.from({ length: 10 }, (_, i) => `  "k${i}": "${MARK} ${i}",`).join("\n")}\n`;
  put("bar-json", { ...baseMeta("bar-json", "https://api.barred.test/x", "json", json), textPath: null }, { json });
  put("bar-403", { ...baseMeta("bar-403", "https://www.barred.test/gone"), status: 403, sha256: null, byteLength: 0, bodyPath: null, textPath: null }, {});
  for (const [slug, host] of [
    ["open-page", "open.test"],
    ["unread-page", "unread.test"],
    ["noentry-page", "nowhere.test"],
  ]) {
    const h = htmlOf(6);
    put(slug, baseMeta(slug, `https://${host}/terms`, "html", h), { html: h, txt: textOf(8, slug) });
  }
  return { root, dir };
}

/** Every file under a directory with its bytes, so "wrote nothing" is a comparison. */
function snapshot(root: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      if (existsSync(p) && readdirSync(d, { withFileTypes: true }).find((e) => e.name === name)?.isDirectory()) walk(p);
      else out.push(`${p.slice(root.length)} ${sha(readFileSync(p))}`);
    }
  };
  walk(root);
  return out;
}

function run(root: string, options: Record<string, unknown> = {}) {
  const lines: string[] = [];
  const code = trimStore({ root, on: "2026-10-06", log: (l: string) => lines.push(l), ...options });
  return { code, out: lines.join("\n") };
}

describe("keptRanges and trimLines", () => {
  it("widens each cited range by two lines, clamps to the file and merges what touches", () => {
    expect(CONTEXT).toBe(2);
    expect(keptRanges([[10, 10]], 30)).toEqual([[8, 12]]);
    expect(keptRanges([[1, 1], [29, 30]], 30)).toEqual([[1, 3], [27, 30]]);
    expect(keptRanges([[10, 10], [15, 15]], 30)).toEqual([[8, 17]]);
    expect(keptRanges([[10, 10], [16, 16]], 30)).toEqual([[8, 12], [14, 18]]);
    expect(keptRanges([[40, 41]], 30)).toEqual([]);
  });

  it("keeps the kept lines verbatim, empties every other, and keeps the line count", () => {
    const text = "a\nb\nc\nd\ne\n";
    expect(trimLines(text, [[2, 3]])).toBe("\nb\nc\n\n\n");
    expect(trimLines(text, []).split("\n")).toHaveLength(text.split("\n").length);
    expect(trimLines(text, [[1, 6]])).toBe(text);
  });
});

describe("trim-capture on a fixture store", () => {
  it("a dry run lists each capture of the barred site with its cited lines and files, the lines kept and the bytes removed, and writes nothing", () => {
    const { root } = makeStore("dry");
    const before = snapshot(root);
    const { code, out } = run(root);
    expect(code).toBe(0);
    expect(snapshot(root)).toEqual(before);
    expect(out).toContain("would trim bar-live (barred.test, copying barred; live)");
    expect(out).toContain(`would trim bar-live-2026-10-01 (barred.test, copying barred; frozen, ${MANIFEST} follows)`);
    expect(out).toContain("cited txt:10 by research/notes/n.md:2");
    expect(out).toContain("cited html:5 by research/notes/n.md:2");
    // A bare :20 the scanner gives to "robots.txt" on a line naming the copy is kept anyway.
    expect(out).toContain("cited txt:20 by research/notes/n.md:3 (on its line)");
    expect(out).toContain("cited html:7 by research/notes/n.md:5 (on its line)");
    expect(out).toContain("txt: keep 8-12, 18-22 (10 of 31 lines)");
    expect(out).toContain("html: keep 3-9 (7 of 21 lines)");
    expect(out).toMatch(/html: removed from the tree \(\d+ bytes, 21 lines; sha256 [0-9a-f]{12} in the meta\)/);
    expect(out).toContain("json: keep 2-6 (5 of 11 lines)");
    expect(out).toContain("nothing to trim: bar-403 (barred.test): no body and no text in the tree (status 403)");
    expect(out).toMatch(/totals: 4 capture\(s\) of 1 copying-barred site\(s\): 3 would be trimmed \(1 frozen, 2 live\), 0 already trimmed, 1 with nothing in the tree/);
    expect(out).toMatch(/not reached: 1 capture\(s\) of copying-allowed sites, 1 of unread sites, 1 of 1 site\(s\) with no verdict entry \(nowhere\.test 1\)/);
    // Kinds, pointers and counts: never a capture's text.
    expect(out).not.toContain(MARK);
  });

  it("--apply: the cited lines and two either side verbatim, every other line empty, the line count kept, the body gone, the meta's lines kept and a trimmed block appended", () => {
    const { root, dir } = makeStore("apply");
    const full = (slug: string, ext: string) => readFileSync(join(dir, `${slug}.${ext}`));
    const liveTxt = full("bar-live", "txt");
    const liveHtml = full("bar-live", "html");
    const copyTxt = full("bar-live-2026-10-01", "txt");
    const copyHtml = full("bar-live-2026-10-01", "html");
    const metaBefore = full("bar-live-2026-10-01", "meta.json").toString("utf8");
    const untouched = ["open-page", "unread-page", "noentry-page", "bar-403"].flatMap((s) => readdirSync(dir).filter((f) => f.startsWith(`${s}.`)).map((f) => [f, sha(full(f.split(".")[0], f.slice(s.length + 1))) as string]));
    expect(run(root, { apply: true }).code).toBe(0);

    // The live capture: nothing cited by line, so every line is empty; the body left the tree.
    expect(readFileSync(join(dir, "bar-live.txt"), "utf8")).toBe("\n".repeat(30));
    expect(existsSync(join(dir, "bar-live.html"))).toBe(false);
    // The frozen copy: txt lines 8-12 and 18-22 kept, html 3-9 (html:5 cited, html:7 named on its line).
    const before = copyTxt.toString("utf8").split("\n");
    const after = readFileSync(join(dir, "bar-live-2026-10-01.txt"), "utf8").split("\n");
    expect(after).toHaveLength(before.length);
    after.forEach((line, i) => expect(line, `line ${i + 1}`).toBe((i + 1 >= 8 && i + 1 <= 12) || (i + 1 >= 18 && i + 1 <= 22) ? before[i] : ""));
    const htmlAfter = readFileSync(join(dir, "bar-live-2026-10-01.html"), "utf8").split("\n");
    expect(htmlAfter.slice(2, 9)).toEqual(copyHtml.toString("utf8").split("\n").slice(2, 9));
    expect(htmlAfter.filter((l) => l !== "")).toHaveLength(7);
    // A JSON body cited by line keeps its cited line the same way; with no .txt there is none to trim.
    expect(readFileSync(join(dir, "bar-json.json"), "utf8").split("\n")).toHaveLength(11);
    expect(existsSync(join(dir, "bar-json.txt"))).toBe(false);

    // The meta: every earlier line byte for byte, the trimmed block last.
    const metaAfter = full("bar-live-2026-10-01", "meta.json").toString("utf8");
    const head = metaBefore.split("\n").slice(0, -2);
    expect(metaAfter.split("\n").slice(0, head.length - 1)).toEqual(head.slice(0, -1));
    const meta = JSON.parse(metaAfter);
    expect(Object.keys(meta).at(-1)).toBe("trimmed");
    expect(meta.trimmed).toMatchObject({
      on: "2026-10-06",
      ruling: RULING,
      site: "barred.test",
      copying: "barred",
      keptLines: [[8, 12], [18, 22]],
      context: 2,
      fullSha256: sha(copyTxt),
      fullByteLength: copyTxt.length,
      lineCount: 31,
      body: { path: "research/rendered/bar-live-2026-10-01.html", sha256: sha(copyHtml), byteLength: copyHtml.length, lineCount: 21, keptLines: [[3, 9]], inTree: true },
      captureCheck: "ok",
    });
    expect(meta.trimmed.history).toMatch(/Git history keeps the full bytes .*owner's decision.*not an ask/);
    expect(meta.trimmed.cited).toContainEqual({ file: "txt", lines: [10, 10], by: ["research/notes/n.md:2"] });
    expect(meta.trimmed.cited).toContainEqual({ file: "html", lines: [7, 7], by: ["research/notes/n.md:5"] });
    expect(meta.sha256).toBe(sha(copyHtml));
    const live = JSON.parse(full("bar-live", "meta.json").toString("utf8"));
    expect(live.trimmed).toMatchObject({ keptLines: [], fullSha256: sha(liveTxt), body: { sha256: sha(liveHtml), inTree: false, keptLines: [] }, cited: [] });
    // Not in a git repository: no commit to name.
    expect(live.trimmed.fullBytesIn).toBeNull();

    // FROZEN.sha256 holds the trimmed bytes, and the full hash is the block's.
    const manifest = readManifest(dir);
    expect(manifest.get("bar-live-2026-10-01.txt")).toBe(sha(readFileSync(join(dir, "bar-live-2026-10-01.txt"))));
    expect(manifest.get("bar-live-2026-10-01.html")).toBe(sha(readFileSync(join(dir, "bar-live-2026-10-01.html"))));
    expect(checkManifest(dir)).toEqual([]);
    expect(fullSha256Of(dir, "bar-live-2026-10-01", "txt")).toBe(sha(copyTxt));
    expect(fullSha256Of(dir, "bar-live", "html")).toBe(sha(liveHtml));
    // The other sites' captures, and the one with nothing in the tree, are as they were.
    for (const [f, h] of untouched) expect(sha(readFileSync(join(dir, f))), f).toBe(h);
  });

  it("is idempotent: a second run over a trimmed store has nothing to do and writes nothing", () => {
    // A reference the scanner gives the copy past its end blanked nothing on the first run, and is no refusal on the second.
    const { root } = makeStore("again", { note: `${NOTE}The end (research/rendered/bar-live-2026-10-01.txt:99).\n` });
    expect(run(root, { apply: true }).code).toBe(0);
    const before = snapshot(root);
    const { code, out } = run(root, { apply: true });
    expect(code).toBe(3);
    expect(out).toContain("already trimmed: bar-live-2026-10-01 (barred.test, 2026-10-06)");
    expect(out).toMatch(/0 trimmed \(0 frozen, 0 live\), 3 already trimmed/);
    expect(snapshot(root)).toEqual(before);
  });

  it("leaves an allowed site's capture untouched (nothing to do), and refuses a named capture of an unread site or one with no verdict entry", () => {
    const { root } = makeStore("named");
    const before = snapshot(root);
    const allowed = run(root, { slugs: ["open-page"], apply: true });
    expect(allowed.code).toBe(3);
    expect(allowed.out).toContain("nothing to do: open-page (open.test, copying allowed)");
    for (const slug of ["unread-page", "noentry-page"]) {
      const r = run(root, { slugs: [slug], apply: true });
      expect(r.code, slug).toBe(1);
      expect(r.out, slug).toMatch(new RegExp(`REFUSED ${slug}: .*only a copying-barred site is trimmed`));
      expect(r.out, slug).toContain("nothing written");
    }
    expect(snapshot(root)).toEqual(before);
    // A named capture of the barred site is trimmed alone.
    const one = run(root, { slugs: ["bar-json"], apply: true });
    expect(one.code).toBe(0);
    expect(one.out).toMatch(/1 capture\(s\) in research\/rendered \(named\)/);
    expect(existsSync(join(root, "research/rendered/bar-live.html"))).toBe(true);
  });

  it("refuses the whole run, writing nothing, when a capture's site entry has no copying field", () => {
    const sites = { ...VERDICTS.sites, "barred.test": { verdict: "NOT_BARRED", source: "fixture", checked: "2026-10-06", note: "no field" } };
    const { root } = makeStore("nofield", { verdicts: { sites } });
    const before = snapshot(root);
    const { code, out } = run(root, { apply: true });
    expect(code).toBe(1);
    expect(out).toContain("barred.test's entry in research/channel-loop/terms-verdicts.json has no copying field");
    expect(snapshot(root)).toEqual(before);
    expect(copyingOf("barred.test", sites)).toEqual({ site: "barred.test", state: "no-field" });
    expect(copyingOf("x.test", sites)).toEqual({ site: "x.test", state: "no-entry" });
  });

  it("refuses a trimmed capture cited later at a line its trim emptied, and one whose files no longer match its block", () => {
    const { root, dir } = makeStore("late");
    expect(run(root, { apply: true }).code).toBe(0);
    writeFileSync(join(root, "research/notes/n.md"), `${NOTE}A later line: research/rendered/bar-live-2026-10-01.txt:25\n`);
    const late = run(root, { apply: true });
    expect(late.code).toBe(1);
    expect(late.out).toContain("bar-live-2026-10-01 is trimmed (2026-10-06) and research/notes/n.md:7 cites txt:25, which the trim emptied");
    writeFileSync(join(root, "research/notes/n.md"), NOTE);
    writeFileSync(join(dir, "bar-live.html"), "<html>back</html>\n");
    const back = run(root);
    expect(back.code).toBe(1);
    expect(back.out).toContain("bar-live is trimmed (2026-10-06) but its html is back in the tree");
  });

  it("refuses a binary body cited by line, and says (does not keep or refuse) a reference past the end of the file", () => {
    const note = `${NOTE}Page three of the PDF (research/rendered/bar-pdf.pdf:3).\nThe end (research/rendered/bar-live-2026-10-01.txt:99).\n`;
    const { root, dir } = makeStore("binary", { note });
    const pdf = Buffer.from("%PDF-1.4\nbinary\nbytes\n");
    writeFileSync(join(dir, "bar-pdf.meta.json"), metaText({ ...baseMeta("bar-pdf", "https://www.barred.test/doc.pdf", "pdf", pdf), textPath: null }));
    writeFileSync(join(dir, "bar-pdf.pdf"), pdf);
    const before = snapshot(root);
    const r = run(root, { apply: true });
    expect(r.code).toBe(1);
    expect(r.out).toContain("REFUSED bar-pdf: research/notes/n.md:7 cites bar-pdf.pdf:3, a binary body: it cannot be kept by line");
    expect(snapshot(root)).toEqual(before);
    rmSync(join(dir, "bar-pdf.pdf"));
    rmSync(join(dir, "bar-pdf.meta.json"));
    const ok = run(root);
    expect(ok.code).toBe(0);
    expect(ok.out).toContain("note: research/notes/n.md:8 gives bar-live-2026-10-01 txt:99, which it does not have (past the end)");
  });

  it("in a git repository, names the commit that holds the full bytes, and refuses a capture with uncommitted changes", () => {
    const { root, dir } = makeStore("git");
    const git = (...args: string[]) => spawnSync("git", ["-c", "user.name=t", "-c", `user.email=${["t", "example.invalid"].join("@")}`, "-c", "commit.gpgsign=false", ...args], { cwd: root, encoding: "utf8" });
    expect(git("init", "-q").status).toBe(0);
    expect(git("add", "-A").status).toBe(0);
    expect(git("commit", "-q", "-m", "fixture").status).toBe(0);
    const head = git("log", "-1", "--format=%h").stdout.trim();
    writeFileSync(join(dir, "bar-json.json"), "changed\n");
    const dirty = run(root, { apply: true });
    expect(dirty.code).toBe(1);
    expect(dirty.out).toMatch(/REFUSED bar-json: bar-json has uncommitted changes/);
    expect(git("checkout", "--", "research/rendered/bar-json.json").status).toBe(0);
    expect(run(root, { apply: true }).code).toBe(0);
    const meta = JSON.parse(readFileSync(join(dir, "bar-live.meta.json"), "utf8"));
    expect(meta.trimmed.fullBytesIn).toBe(`commit ${head} (git show ${head}:research/rendered/bar-live.<ext>)`);
  });

  it("main: --apply writes, an unknown flag or slug is exit 1", () => {
    const { root } = makeStore("cli");
    const quiet = () => undefined;
    expect(main(["--nope"], root, quiet)).toBe(1);
    expect(main(["no-such-capture"], root, quiet)).toBe(1);
    expect(main([], root, quiet)).toBe(0);
    expect(existsSync(join(root, "research/rendered/bar-live.html"))).toBe(true);
    expect(main(["--apply"], root, quiet)).toBe(0);
    expect(existsSync(join(root, "research/rendered/bar-live.html"))).toBe(false);
    expect(main(["--apply"], root, quiet)).toBe(3);
  });
});

describe("the readers of a trimmed capture understand it", () => {
  const { root, dir } = makeStore("readers");
  const full = diskFiles("bar-live", dir);
  run(root, { apply: true });

  it("capture-check reads a trimmed capture whose body left, and gives the kind it had whole, naming the trim", () => {
    const r = classifyCapture(readCapture("bar-live", dir));
    expect(r.kind).toBe("ok");
    expect(r.evidence).toMatch(/^trimmed 2026-10-06 \(ruling 6\.10 row 21 \(d\)\): 0 of 31 text lines kept in the tree, the body out of it/);
    // A trimmed meta with no kind from before (render-watch's route) is kind "trimmed".
    const meta = JSON.parse(readFileSync(join(dir, "bar-live.meta.json"), "utf8"));
    expect(classifyCapture({ meta: { ...meta, trimmed: { ...meta.trimmed, captureCheck: null } }, text: "", html: null }).kind).toBe("trimmed");
  });

  it("freeze-capture refuses to freeze a trimmed capture, and --cited's existingCopy takes the trimmed copy for the full version", () => {
    expect(() => planFreeze({ slug: "bar-live", files: diskFiles("bar-live", dir), dir, urlsText: "", on: "2026-10-06" })).toThrow(/bar-live is trimmed \(2026-10-06, ruling 6\.10 row 21 \(d\)\)/);
    expect(existingCopy(dir, "bar-live", full)).toBe("bar-live-2026-10-01");
    // The same version with one byte changed is another version.
    const other = new Map(full);
    other.set("txt", Buffer.concat([full.get("txt"), Buffer.from("x")]));
    expect(existingCopy(dir, "bar-live", other)).toBeNull();
  });

  it("checkManifest holds a recorded trimmed copy to its block", () => {
    expect(checkManifest(dir)).toEqual([]);
    const txt = join(dir, "bar-live-2026-10-01.txt");
    const kept = readFileSync(txt);
    writeFileSync(txt, Buffer.concat([kept, Buffer.from("\n")]));
    expect(checkManifest(dir)).toEqual(
      expect.arrayContaining(["bar-live-2026-10-01.txt is not the bytes FROZEN.sha256 records", "bar-live-2026-10-01.txt does not have the 31 lines its trimmed block records"]),
    );
    writeFileSync(txt, kept);
    const html = join(dir, "bar-live-2026-10-01.html");
    const htmlKept = readFileSync(html);
    rmSync(html);
    expect(checkManifest(dir)).toContain("bar-live-2026-10-01.html is not in the tree, which its trimmed block says keeps its cited lines");
    writeFileSync(html, htmlKept);
    expect(checkManifest(dir)).toEqual([]);
  });

  it("remask-captures reads a trimmed store: a body the trim removed is not a missing file", () => {
    expect(planRemask({ dir }).problems).toEqual([]);
  });

  it("appendTrimmed refuses a meta it cannot extend without moving a line", () => {
    expect(() => appendTrimmed("not json", { a: 1 }, { on: "x" })).toThrow(/cannot take a trimmed block/);
    expect(appendTrimmed('{\n  "a": 1\n}\n', { a: 1 }, { on: "x" })).toBe('{\n  "a": 1,\n  "trimmed": {\n    "on": "x"\n  }\n}\n');
  });

  it("render-watch's route writes the same block shape (and names its artifact)", () => {
    const meta = JSON.parse(readFileSync(join(dir, "bar-live.meta.json"), "utf8"));
    const route = routeTrimmed({ site: "barred.test", on: "2026-10-06", slug: "x", bodyExt: "html", body: Buffer.from("<p>a</p>\n"), text: Buffer.from("a\n"), artifact: { name: "n", run: "1" } });
    expect(Object.keys(route)).toEqual([...Object.keys(meta.trimmed), "artifact"]);
    expect(route.ruling).toBe(RULING);
  });
});

describe("the real store (read only)", () => {
  it("the dry run refuses nothing and reaches every capture of a copying-barred site", () => {
    const lines: string[] = [];
    const code = trimStore({ log: (l: string) => lines.push(l) });
    expect([0, 3], lines.filter((l) => l.startsWith("REFUSED")).join("\n")).toContain(code);
    const sites = JSON.parse(readFileSync("research/channel-loop/terms-verdicts.json", "utf8")).sites;
    const barred = readdirSync("research/rendered")
      .filter((f) => f.endsWith(".meta.json"))
      .map((f) => [f.slice(0, -".meta.json".length), JSON.parse(readFileSync(`research/rendered/${f}`, "utf8")).url] as const)
      .filter(([, url]) => sites[siteOf(new URL(url).hostname)]?.copying === "barred")
      .map(([slug]) => slug)
      .sort();
    expect(barred.length).toBeGreaterThan(40);
    const reached = lines.map((l) => /^(?:would trim|trimmed|already trimmed:|nothing to trim:) (\S+)/.exec(l)?.[1]).filter(Boolean).sort();
    expect(reached).toEqual(barred);
  });

  it("render-watch's site rule and trim-capture's agree on every capture in the store", () => {
    const barredSites = readCopyingBarred();
    const sites = JSON.parse(readFileSync("research/channel-loop/terms-verdicts.json", "utf8")).sites;
    for (const f of readdirSync("research/rendered").filter((x) => x.endsWith(".meta.json"))) {
      const host = new URL(JSON.parse(readFileSync(`research/rendered/${f}`, "utf8")).url).hostname;
      const trim = copyingOf(siteOf(host), sites).state === "barred";
      expect(copyingBarredSite(host, barredSites) !== null, f).toBe(trim);
    }
  });

  it("finds the citations the scanner finds, of every capture form, in the decision-bearing files", () => {
    const urls = readFileSync("research/rendered/urls.txt", "utf8");
    const c = citationsOf({ root: ".", slugs: ["terms-btl-2026-09-29"], urlsText: urls }).get("terms-btl-2026-09-29");
    expect(c).toContainEqual({ ext: "txt", range: [303, 303], by: "research/channel-loop/terms-verdicts.json:108", how: "cited" });
  });
});
